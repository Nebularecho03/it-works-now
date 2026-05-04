#!/bin/bash

# PM2 Startup Script for Website and Scholar Forge
# Starts all services with dynamic multithreading based on system resources

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
BASE_DIR="$SCRIPT_DIR"
cd "$BASE_DIR"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    error "PM2 is not installed. Run: sudo npm install -g pm2"
fi

# Create logs directory
mkdir -p logs

# Detect system resources
log "Detecting system resources..."
node scripts/detect-resources.js

# Determine which config to use
ENV="${1:-production}"
CONFIG_FILE="ecosystem.config.$ENV.js"

if [ ! -f "$CONFIG_FILE" ]; then
    warn "Config file $CONFIG_FILE not found, falling back to ecosystem.config.js"
    CONFIG_FILE="ecosystem.config.js"
fi

log "Using configuration: $CONFIG_FILE"
log "Environment: $ENV"

# Stop existing PM2 processes
log "Stopping existing PM2 processes..."
pm2 delete all 2>/dev/null || true

# Start services with PM2
log "Starting services with PM2..."
pm2 start "$CONFIG_FILE"

# Save PM2 configuration
pm2 save

log ""
log "=== Services Started ==="
pm2 list
log ""
log "=== Resource Usage ==="
pm2 monit --no-interaction &
MONITOR_PID=$!
sleep 3
kill $MONITOR_PID 2>/dev/null || true

log ""
log "📊 PM2 Commands:"
log "  View status:     pm2 status"
log "  View logs:       pm2 logs"
log "  Monitor:         pm2 monit"
log "  Restart all:     pm2 restart all"
log "  Stop all:        pm2 stop all"
log "  Delete all:      pm2 delete all"
log ""
log "🛑 To stop services: ./stop-pm2.sh"
log "🔄 To restart services: ./restart-pm2.sh"
