#!/bin/bash

# Stop script for both projects
# Stops all services started by start-local.sh
# Supports both nohup and PM2 deployment modes

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
info() { printf "${BLUE}[INFO]${NC} %s\n" "$1"; }

BASE_DIR="/home/codecrafter/Documents/combined"

# Check if PM2 is running and stop it first
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "online"; then
        log "PM2 processes detected. Stopping PM2 services..."
        cd "$BASE_DIR"
        ./stop-pm2.sh
        log "PM2 services stopped"
        exit 0
    fi
fi

log "Stopping all services (nohup mode)..."

# Read PIDs from file if it exists
if [ -f "$BASE_DIR/service-pids.txt" ]; then
    source "$BASE_DIR/service-pids.txt"
    
    if [ -n "$FRONTEND_PID" ] && ps -p $FRONTEND_PID > /dev/null 2>&1; then
        log "Stopping Frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
    fi
    
    if [ -n "$ADMIN_PID" ] && ps -p $ADMIN_PID > /dev/null 2>&1; then
        log "Stopping Admin Backend (PID: $ADMIN_PID)..."
        kill $ADMIN_PID
    fi
    
    if [ -n "$SCHOLARS_PID" ] && ps -p $SCHOLARS_PID > /dev/null 2>&1; then
        log "Stopping Scholars API (PID: $SCHOLARS_PID)..."
        kill $SCHOLARS_PID
    fi
    
    if [ -n "$SCHOLAR_FORGE_PID" ] && ps -p $SCHOLAR_FORGE_PID > /dev/null 2>&1; then
        log "Stopping Scholar Forge Frontend (PID: $SCHOLAR_FORGE_PID)..."
        kill $SCHOLAR_FORGE_PID
    fi
    
    rm -f "$BASE_DIR/service-pids.txt"
else
    warn "service-pids.txt not found, killing by process name..."
    pkill -f "next dev" || true
    pkill -f "python -m backend" || true
    pkill -f "node dist/index.mjs" || true
    pkill -f "vite.*scholar-forge" || true
fi

# Wait for processes to stop
sleep 2

# Force kill if still running
pkill -9 -f "next dev" 2>/dev/null || true
pkill -9 -f "python -m backend" 2>/dev/null || true
pkill -9 -f "node dist/index.mjs" 2>/dev/null || true
pkill -9 -f "vite.*scholar-forge" 2>/dev/null || true

log "All services stopped"
