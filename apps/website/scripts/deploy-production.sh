#!/bin/bash

# Production Deployment Script for Stephen Asatsa Website
# Handles port conflicts, service management, and deployment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Stephen Asatsa Website - Production Deployment${NC}"
echo "=================================================="

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -i :$port >/dev/null 2>&1; then
        echo -e "${RED}❌ Port $port is in use by $(lsof -ti :$port | head -1 | awk '{print $2}')${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port $port is available${NC}"
        return 0
    fi
}

# Function to kill processes on specific ports
kill_port_processes() {
    local port=$1
    echo -e "${YELLOW}🔄 Killing processes on port $port...${NC}"
    
    # Kill any Python processes using the port
    pkill -9 -f "python.*admin_session_manager" 2>/dev/null || true
    pkill -9 -f "next.*3002" 2>/dev/null || true
    pkill -9 -f "node.*3002" 2>/dev/null || true
    
    # Wait for processes to fully terminate
    sleep 2
    
    # Verify port is free
    if check_port $port; then
        echo -e "${GREEN}✅ Port $port is now free${NC}"
    else
        echo -e "${RED}❌ Failed to free port $port${NC}"
        return 1
    fi
}

# Function to start backend service
start_backend() {
    echo -e "${BLUE}🔧 Starting backend service...${NC}"
    
    cd /home/codecrafter/Documents/combined/apps/website/backend
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        echo -e "${RED}❌ Virtual environment not found${NC}"
        return 1
    fi
    
    # Activate virtual environment and start backend
    source venv/bin/activate
    python3 admin_session_manager.py &
    
    # Wait for backend to start
    sleep 3
    
    # Check if backend is running
    if curl -s http://localhost:5001/api/admin/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend service started successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Backend service failed to start${NC}"
        return 1
    fi
}

# Function to start frontend service
start_frontend() {
    echo -e "${BLUE}🎨 Starting frontend service...${NC}"
    
    cd /home/codecrafter/Documents/combined/apps/website
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}⚠️  Installing dependencies...${NC}"
        npm install
    fi
    
    # Start frontend in background
    npm run dev &
    
    # Wait for frontend to start
    sleep 5
    
    # Check if frontend is running
    if curl -s http://localhost:3002 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend service started successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Frontend service failed to start${NC}"
        return 1
    fi
}

# Function to restart nginx
restart_nginx() {
    echo -e "${BLUE}🔄 Restarting nginx...${NC}"
    
    # Test nginx configuration
    if nginx -t >/dev/null 2>&1; then
        sudo systemctl reload nginx
        echo -e "${GREEN}✅ Nginx reloaded successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Nginx configuration error${NC}"
        return 1
    fi
}

# Function to check all services
check_services() {
    echo -e "${BLUE}🔍 Checking service status...${NC}"
    
    # Check backend
    if curl -s http://localhost:5001/api/admin/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend: Online${NC}"
    else
        echo -e "${RED}❌ Backend: Offline${NC}"
    fi
    
    # Check frontend
    if curl -s http://localhost:3002 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend: Online${NC}"
    else
        echo -e "${RED}❌ Frontend: Offline${NC}"
    fi
    
    # Check nginx
    if systemctl is-active --quiet nginx; then
        echo -e "${GREEN}✅ Nginx: Running${NC}"
    else
        echo -e "${RED}❌ Nginx: Stopped${NC}"
    fi
}

# Main deployment function
deploy() {
    echo -e "${BLUE}📋 Starting deployment process...${NC}"
    
    # Step 1: Check and resolve port conflicts
    echo -e "${YELLOW}Step 1: Checking port conflicts...${NC}"
    
    if ! check_port 5001; then
        echo -e "${YELLOW}⚠️  Port 5001 is in use, attempting to resolve...${NC}"
        kill_port_processes 5001
    fi
    
    if ! check_port 3002; then
        echo -e "${YELLOW}⚠️  Port 3002 is in use, attempting to resolve...${NC}"
        kill_port_processes 3002
    fi
    
    # Step 2: Start services
    echo -e "${YELLOW}Step 2: Starting services...${NC}"
    
    if ! start_backend; then
        echo -e "${RED}❌ Backend startup failed${NC}"
        exit 1
    fi
    
    if ! start_frontend; then
        echo -e "${RED}❌ Frontend startup failed${NC}"
        exit 1
    fi
    
    # Step 3: Restart nginx
    echo -e "${YELLOW}Step 3: Restarting nginx...${NC}"
    
    if ! restart_nginx; then
        echo -e "${RED}❌ Nginx restart failed${NC}"
        exit 1
    fi
    
    # Step 4: Final verification
    echo -e "${YELLOW}Step 4: Verifying deployment...${NC}"
    
    sleep 5
    check_services
    
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${BLUE}📱 Frontend: http://localhost:3002${NC}"
    echo -e "${BLUE}🔧 Backend API: http://localhost:5001${NC}"
    echo -e "${GREEN}🌐 Nginx: Proxying on port 80${NC}"
    
    return 0
}

# Show usage
usage() {
    echo -e "${BLUE}Stephen Asatsa Website - Production Deployment${NC}"
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy     - Full deployment (kill conflicts, start services, restart nginx)"
    echo "  status     - Check status of all services"
    echo "  restart    - Restart all services"
    echo "  stop       - Stop all services"
    echo "  ports      - Check port availability"
    echo ""
    echo "Examples:"
    echo "  $0 deploy    - Deploy the full application"
    echo "  $0 status    - Check if services are running"
    echo "  $0 ports     - Check if ports 3002 and 5001 are available"
}

# Parse command line arguments
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "status")
        check_services
        ;;
    "restart")
        echo -e "${YELLOW}🔄 Restarting all services...${NC}"
        kill_port_processes 5001
        kill_port_processes 3002
        sleep 2
        start_backend
        start_frontend
        restart_nginx
        ;;
    "stop")
        echo -e "${YELLOW}🛑 Stopping all services...${NC}"
        kill_port_processes 5001
        kill_port_processes 3002
        sudo systemctl stop nginx
        ;;
    "ports")
        echo -e "${BLUE}🔍 Checking port availability...${NC}"
        echo "Port 5001 (Backend):"
        check_port 5001
        echo ""
        echo "Port 3002 (Frontend):"
        check_port 3002
        ;;
    *)
        usage
        exit 1
        ;;
esac
