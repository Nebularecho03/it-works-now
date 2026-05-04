#!/bin/bash

# PM2 Monitor Script
# Displays real-time monitoring of all services

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { printf "${GREEN}[INFO]${NC} %s\n" "$1"; }

# Get script directory dynamically
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$SCRIPT_DIR"
cd "$BASE_DIR"

log "Starting PM2 monitoring dashboard..."
log "Press Ctrl+C to exit"
log ""

pm2 monit
