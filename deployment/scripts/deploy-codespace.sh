#!/bin/bash

# GitHub Codespace Deployment Script
# Simplified deployment for containerized environments (no systemd)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { printf "${GREEN}[INFO]${NC} %s\n" "$1"; }
error() { printf "${RED}[ERROR]${NC} %s\n" "$1" >&2; exit 1; }
warn() { printf "${YELLOW}[WARN]${NC} %s\n" "$1"; }

# Get script directory dynamically
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

log "Starting GitHub Codespace deployment..."
log "Project directory: $SCRIPT_DIR"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    log "Installing PM2..."
    npm install -g pm2
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    log "Installing pnpm..."
    npm install -g pnpm
fi

# Install website dependencies
if [ -d "website" ] && [ -f "website/package.json" ]; then
    log "Installing website dependencies..."
    cd website
    if [ ! -d "node_modules" ]; then
        npm install
    else
        log "Website dependencies already installed"
    fi
    cd "$SCRIPT_DIR"
else
    warn "Website directory or package.json not found, skipping website dependencies"
fi

# Install Scholar Forge dependencies
if [ -d "Schoolars-work-bench" ] && [ -f "Schoolars-work-bench/package.json" ]; then
    log "Installing Scholar Forge dependencies..."
    cd Schoolars-work-bench
    if [ ! -d "node_modules" ]; then
        pnpm install
    else
        log "Scholar Forge dependencies already installed"
    fi
    cd "$SCRIPT_DIR"
else
    warn "Scholar Forge directory or package.json not found, skipping Scholar Forge dependencies"
fi

# Install Python backend dependencies
if [ -d "website/backend" ] && [ -f "website/backend/requirements.txt" ]; then
    log "Installing Python backend dependencies..."
    cd website/backend
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
    else
        log "Python backend dependencies already installed"
    fi
    cd "$SCRIPT_DIR"
else
    warn "Python backend directory or requirements.txt not found, skipping Python dependencies"
fi

# Build Scholar Forge
if [ -d "Schoolars-work-bench" ] && [ -f "Schoolars-work-bench/package.json" ]; then
    log "Building Scholar Forge..."
    cd Schoolars-work-bench
    pnpm build
    cd "$SCRIPT_DIR"
else
    warn "Scholar Forge directory not found, skipping build"
fi

# Build Go services (optional)
if command -v go &> /dev/null; then
    if [ -d "website/backend/go-services" ]; then
        log "Building Go microservices..."
        cd website/backend/go-services
        if [ -f "build-all.sh" ]; then
            ./build-all.sh
        else
            warn "Go services build script not found, skipping"
        fi
        cd "$SCRIPT_DIR"
    else
        warn "Go services directory not found, skipping Go services build"
    fi
else
    warn "Go not installed, skipping Go services build"
fi

# Create logs directory
mkdir -p logs

# Stop existing PM2 processes
log "Stopping existing PM2 processes..."
pm2 delete all 2>/dev/null || true

# Start services with PM2
log "Starting services with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

log ""
log "=== Services Started ==="
pm2 list
log ""
log "=== Access URLs ==="
log "  - Main Website:     http://localhost:3000"
log "  - Admin Panel:      http://localhost:3000/admin"
log "  - Scholar Forge:    http://localhost:4500"
log "  - Website API:      http://localhost:8000"
log "  - Scholars API:     http://localhost:8081"
log ""
log "=== PM2 Commands ==="
log "  View status:     pm2 status"
log "  View logs:       pm2 logs"
log "  Monitor:         pm2 monit"
log "  Restart all:     pm2 restart all"
log "  Stop all:        pm2 stop all"
log ""
log "🎉 Deployment complete!"
