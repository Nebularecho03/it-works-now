#!/bin/bash

# Streamlined Production Deployment Script
# Unified deployment for enhanced message management system

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}========================================${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "This script requires root privileges for system configuration"
    exit 1
fi

# Parse command line arguments
PRODUCTION=false
SECURITY_ONLY=false
SKIP_UPDATE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --production)
            PRODUCTION=true
            shift
            ;;
        --security-only)
            SECURITY_ONLY=true
            shift
            ;;
        --skip-update)
            SKIP_UPDATE=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [--production] [--security-only] [--skip-update]"
            echo "  --production: Enable production mode"
            echo "  --security-only: Only configure security"
            echo "  --skip-update: Skip git pull"
            exit 0
            ;;
        *)
            shift
            ;;
    esac
done

print_header "🚀 Enhanced Message Management System - Streamlined Deployment"

# Stop existing service
sudo systemctl stop stephen-asatsa-backend || true

# Pull latest changes (if using git)
if [ "$SKIP_UPDATE" = false ]; then
    # git pull origin main
fi

# Build the application
./build.sh

# Install systemd service
sudo cp stephen-asatsa-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable stephen-asatsa-backend

# Start the service
sudo systemctl start stephen-asatsa-backend

# Check status
sudo systemctl status stephen-asatsa-backend

echo "✅ Deployment completed!"
