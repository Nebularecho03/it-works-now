#!/usr/bin/env bash

# Research Hub Setup Script
# Sets up the complete Research Hub platform with authentication, dashboard, and API

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    printf "${GREEN}[setup]${NC} %s\n" "$1"
}

warn() {
    printf "${YELLOW}[warn]${NC} %s\n" "$1"
}

error() {
    printf "${RED}[error]${NC} %s\n" "$1" >&2
    exit 1
}

info() {
    printf "${BLUE}[info]${NC} %s\n" "$1"
}

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if running as root for systemd operations
need_sudo() {
    [ "$(id -u)" -ne 0 ]
}

run_root() {
    if need_sudo; then
        sudo "$@"
    else
        "$@"
    fi
}

# Check if Node.js is installed
check_nodejs() {
    if ! command -v node &> /dev/null; then
        error "Node.js is required but not installed"
        info "Please install Node.js: curl -fsSL https://deb.nodesource.com/setup_lts.sh | sudo -E bash -"
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        error "npm is required but not installed"
        info "Please install npm: sudo apt install npm -y"
        exit 1
    fi
}

# Check if Python is installed
check_python() {
    if ! command -v python3 &> /dev/null; then
        error "Python 3 is required but not installed"
        info "Please install Python: sudo apt install python3 -y"
        exit 1
    fi
}

# Install frontend dependencies
install_frontend_deps() {
    log "Installing frontend dependencies..."
    
    # Check package.json exists
    if [ ! -f "$SCRIPT_DIR/package.json" ]; then
        error "package.json not found in frontend directory"
        exit 1
    fi
    
    # Install dependencies
    run_root npm install
    
    # Check if .env.local exists, create from example if needed
    if [ ! -f "$SCRIPT_DIR/.env.local" ] && [ -f "$SCRIPT_DIR/.env.example" ]; then
        log "Creating .env.local from .env.example..."
        cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env.local"
        warn "Please update .env.local with your actual configuration"
    fi
}

# Setup backend environment
setup_backend_env() {
    log "Setting up backend environment..."
    
    # Check if requirements.txt exists
    if [ ! -f "$SCRIPT_DIR/backend/requirements.txt" ]; then
        error "Backend requirements.txt not found"
        exit 1
    fi
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "$SCRIPT_DIR/backend/venv" ]; then
        log "Creating Python virtual environment..."
        cd "$SCRIPT_DIR/backend"
        run_root python3 -m venv venv
    fi
    
    # Install dependencies
    log "Installing backend dependencies..."
    cd "$SCRIPT_DIR/backend"
    run_root ./venv/bin/pip install -r requirements.txt
}

# Setup database
setup_database() {
    log "Setting up database..."
    
    # Check if PostgreSQL is installed
    if ! command -v psql &> /dev/null; then
        error "PostgreSQL is required but not installed"
        info "Please install PostgreSQL: sudo apt install postgresql postgresql-contrib -y"
        exit 1
    fi
    
    # Create database if it doesn't exist
    if command -v sudo &> /dev/null; then
        log "Creating database and user..."
        sudo -u postgres createdb stephenasatsa_website || true
        sudo -u postgres createuser stephenasatsa_website --superuser || true
    fi
}

# Generate Prisma client
generate_prisma_client() {
    log "Generating Prisma client..."
    cd "$SCRIPT_DIR"
    run_root npx prisma generate
}

# Setup systemd services
setup_systemd_services() {
    log "Setting up systemd services..."
    
    # Run the existing setup script
    if [ -f "$SCRIPT_DIR/scripts/setup-services.sh" ]; then
        run_root bash "$SCRIPT_DIR/scripts/setup-services.sh"
    else
        error "setup-services.sh not found"
        exit 1
    fi
}

# Start services
start_services() {
    log "Starting Research Hub services..."
    
    # Start backend
    log "Starting backend service..."
    cd "$SCRIPT_DIR/backend"
    if [ -d "venv" ]; then
        source venv/bin/activate
        run_root python app_enhanced.py &
    else
        run_root python3 app_enhanced.py &
    fi
    
    # Start frontend
    log "Starting frontend service..."
    cd "$SCRIPT_DIR"
    run_root npm run dev &
    
    # Wait a moment for services to start
    sleep 3
    
    log "Services started successfully!"
    info "Frontend: http://localhost:3000"
    info "Backend: http://localhost:8000"
    info "Dashboard: http://localhost:3000/dashboard"
}

# Show help
show_help() {
    cat << 'EOF'
Research Hub Setup Script

This script sets up the complete Research Hub platform including:
- Frontend (Next.js with dashboard)
- Backend (Python Flask with API)
- Database (PostgreSQL with Prisma)
- Systemd services for production

Usage: bash setup-research-hub.sh [options]

Options:
    deps        Install all dependencies
    frontend     Install frontend dependencies only
    backend      Setup backend environment and dependencies
    database     Setup PostgreSQL database
    services     Setup systemd services
    start        Start all services
    dev          Start development services

Examples:
    bash setup-research-hub.sh deps          # Install all dependencies
    bash setup-research-hub.sh frontend       # Install frontend deps only
    bash setup-research-hub.sh start         # Start all services

No configuration required - works from any directory!
EOF
}

# Main function
main() {
    local command="${1:-help}"
    
    case "$command" in
        deps)
            log "Installing all Research Hub dependencies..."
            check_nodejs
            check_npm
            check_python
            install_frontend_deps
            setup_backend_env
            setup_database
            generate_prisma_client
            setup_systemd_services
            log "Research Hub setup completed successfully!"
            ;;
        frontend)
            check_nodejs
            check_npm
            install_frontend_deps
            ;;
        backend)
            check_python
            setup_backend_env
            ;;
        database)
            setup_database
            ;;
        services)
            setup_systemd_services
            ;;
        start)
            start_services
            ;;
        dev)
            log "Starting development environment..."
            start_services
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            error "Unknown command: $command"
            echo "Use 'help' to see available commands"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
