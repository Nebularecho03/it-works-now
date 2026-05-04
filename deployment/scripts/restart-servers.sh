#!/bin/bash

# Script to restart development servers and docker containers
# Usage: ./restart-servers.sh [options]
# Options:
#   --docker-only    Only restart docker containers
#   --servers-only   Only restart development servers
#   --all            Restart both (default)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to kill process on a port
kill_port() {
    local port=$1
    local service_name=$2
    
    if fuser -k ${port}/tcp 2>/dev/null; then
        print_status "Killed process on port ${port} (${service_name})"
    else
        print_warning "No process found on port ${port} (${service_name})"
    fi
}

# Function to restart backend server
restart_backend() {
    print_status "Restarting backend server..."
    
    # Kill existing backend
    kill_port 8000 "Backend"
    
    # Start backend
    cd /home/codecrafter/Documents/combined/website/backend
    nohup python server.py > /tmp/backend.log 2>&1 &
    
    # Wait for backend to start
    sleep 1
    
    if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
        print_status "Backend server started successfully on port 8000"
    else
        print_error "Backend server failed to start. Check /tmp/backend.log"
    fi
}

# Function to restart frontend server
restart_frontend() {
    print_status "Restarting frontend server..."
    
    # Kill existing frontend
    kill_port 3000 "Frontend"
    
    # Start frontend
    cd /home/codecrafter/Documents/combined/website
    nohup npm run dev > /tmp/frontend.log 2>&1 &
    
    # Wait for frontend to start
    sleep 2
    
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_status "Frontend server started successfully on port 3000"
    else
        print_error "Frontend server failed to start. Check /tmp/frontend.log"
    fi
}

# Function to restart docker containers
restart_docker() {
    print_status "Restarting docker containers..."
    
    # Check if docker is running
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed or not in PATH"
        return
    fi
    
    # Check if docker-compose is available
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_warning "Docker Compose is not available"
        return
    fi
    
    # Restart containers in website directory
    if [ -f "/home/codecrafter/Documents/combined/website/docker-compose.yml" ]; then
        print_status "Restarting website docker containers..."
        cd /home/codecrafter/Documents/combined/website
        
        if command -v docker-compose &> /dev/null; then
            docker-compose restart
        else
            docker compose restart
        fi
        
        print_status "Website docker containers restarted"
    fi
    
    # Restart containers in Schoolars-work-bench directory
    if [ -f "/home/codecrafter/Documents/combined/Schoolars-work-bench/docker-compose.yml" ]; then
        print_status "Restarting Schoolars-work-bench docker containers..."
        cd /home/codecrafter/Documents/combined/Schoolars-work-bench
        
        if command -v docker-compose &> /dev/null; then
            docker-compose restart
        else
            docker compose restart
        fi
        
        print_status "Schoolars-work-bench docker containers restarted"
    fi
}

# Parse command line arguments
RESTART_SERVERS=true
RESTART_DOCKER=true

for arg in "$@"; do
    case $arg in
        --docker-only)
            RESTART_SERVERS=false
            RESTART_DOCKER=true
            shift
            ;;
        --servers-only)
            RESTART_SERVERS=true
            RESTART_DOCKER=false
            shift
            ;;
        --all)
            RESTART_SERVERS=true
            RESTART_DOCKER=true
            shift
            ;;
        *)
            print_warning "Unknown option: $arg"
            exit 1
            ;;
    esac
done

# Main execution
print_status "Starting server restart process..."
echo ""

if [ "$RESTART_SERVERS" = true ]; then
    restart_backend
    echo ""
    restart_frontend
    echo ""
fi

if [ "$RESTART_DOCKER" = true ]; then
    restart_docker
    echo ""
fi

print_status "Restart process completed!"
echo ""
print_status "Server logs:"
echo "  Backend: tail -f /tmp/backend.log"
echo "  Frontend: tail -f /tmp/frontend.log"
