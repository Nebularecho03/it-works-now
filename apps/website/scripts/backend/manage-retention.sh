#!/bin/bash

# Data Retention Management Script
# Manages the server metrics data retention and cleanup system

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/backend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🗄️  Data Retention Management System${NC}"
echo ""

# Function to check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        echo -e "${RED}⚠️  This script requires root privileges for systemd service management${NC}"
        echo -e "${YELLOW}💡 Use sudo to run this script${NC}"
        exit 1
    fi
}

# Function to check if Python dependencies are installed
check_dependencies() {
    echo -e "${BLUE}📦 Checking dependencies...${NC}"
    
    cd "$BACKEND_DIR"
    
    # Check for schedule module
    if ! python3 -c "import schedule" 2>/dev/null; then
        echo -e "${GREEN}✅ schedule module found${NC}"
    else
        echo -e "${RED}❌ schedule module not found${NC}"
        echo -e "${YELLOW}Installing schedule module...${NC}"
        pip3 install schedule
    fi
    
    # Check if retention module exists
    if [ -d "data_retention" ]; then
        echo -e "${GREEN}✅ data_retention module found${NC}"
    else
        echo -e "${RED}❌ data_retention module not found${NC}"
        exit 1
    fi
}

# Function to install systemd services
install_services() {
    echo -e "${BLUE}🔧 Installing systemd services...${NC}"
    
    # Copy service files
    cp "$PROJECT_ROOT/systemd/retention-cleanup.service" "/etc/systemd/system/"
    cp "$PROJECT_ROOT/systemd/retention-cleanup.timer" "/etc/systemd/system/"
    
    # Reload systemd
    systemctl daemon-reload
    
    # Enable and start timer
    systemctl enable retention-cleanup.timer
    systemctl start retention-cleanup.timer
    
    echo -e "${GREEN}✅ Retention cleanup service installed and started${NC}"
    echo -e "${YELLOW}📅 Scheduled to run daily at 02:00 AM${NC}"
}

# Function to run immediate cleanup
run_cleanup() {
    echo -e "${BLUE}🧹 Running immediate cleanup...${NC}"
    
    cd "$BACKEND_DIR"
    
    if [ "$1" = "--dry-run" ]; then
        python3 data_retention/scheduler.py cleanup-now
    else
        python3 data_retention/scheduler.py cleanup-now
    fi
}

# Function to show system status
show_status() {
    echo -e "${BLUE}📊 System Status${NC}"
    
    cd "$BACKEND_DIR"
    python3 data_retention/scheduler.py status
}

# Function to show logs
show_logs() {
    echo -e "${BLUE}📝 Recent Cleanup Logs${NC}"
    
    cd "$BACKEND_DIR"
    python3 data_retention/scheduler.py status
}

# Function to stop services
stop_services() {
    echo -e "${BLUE}🛑 Stopping retention services...${NC}"
    
    systemctl stop retention-cleanup.timer
    systemctl disable retention-cleanup.timer
    
    echo -e "${GREEN}✅ Retention cleanup service stopped${NC}"
}

# Function to start services
start_services() {
    echo -e "${BLUE}🚀 Starting retention services...${NC}"
    
    systemctl start retention-cleanup.timer
    systemctl enable retention-cleanup.timer
    
    echo -e "${GREEN}✅ Retention cleanup service started${NC}"
}

# Function to show help
show_help() {
    echo -e "${BLUE}📋 Data Retention Management Commands${NC}"
    echo ""
    echo -e "${GREEN}Usage: $0 [COMMAND] [OPTIONS]${NC}"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo "  install     Install systemd services and dependencies"
    echo "  start       Start retention cleanup service"
    echo "  stop        Stop retention cleanup service"
    echo "  status      Show system status"
    echo "  cleanup     Run immediate cleanup"
    echo "  logs        Show cleanup logs"
    echo "  help        Show this help message"
    echo ""
    echo -e "${YELLOW}Cleanup Options:${NC}"
    echo "  --dry-run   Simulate cleanup without deleting data"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 install                    # Install services"
    echo "  $0 cleanup                    # Run cleanup now"
    echo "  $0 cleanup --dry-run         # Simulate cleanup"
    echo "  $0 status                     # Show system status"
}

# Main script logic
case "${1:-help}" in
    install)
        check_root
        check_dependencies
        install_services
        ;;
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    status)
        show_status
        ;;
    cleanup)
        run_cleanup "$2"
        ;;
    logs)
        show_logs
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
