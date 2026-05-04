#!/bin/bash

# PM2 Stop Script
# Stops all services gracefully

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { printf "${GREEN}[INFO]${NC} %s\n" "$1"; }
error() { printf "${RED}[ERROR]${NC} %s\n" "$1" >&2; exit 1; }

BASE_DIR="/home/codecrafter/Documents/combined"
cd "$BASE_DIR"

log "Stopping all PM2 processes..."
pm2 stop all

log "Deleting all PM2 processes..."
pm2 delete all

log "Saving PM2 configuration..."
pm2 save

log "All services stopped successfully"
