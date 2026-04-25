#!/bin/bash

# Local startup script for both projects
# Runs services from /home/codecrafter/Documents/combined
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
WEBSITE_DIR="$BASE_DIR/website"
SCHOLARS_DIR="$BASE_DIR/Schoolars-work-bench"

# Check for PM2 mode
USE_PM2="${USE_PM2:-false}"
if [ "$USE_PM2" = "true" ]; then
    if command -v pm2 &> /dev/null; then
        log "PM2 mode enabled. Using PM2 for service management..."
        cd "$BASE_DIR"
        ./start-pm2.sh
        exit 0
    else
        warn "PM2 requested but not installed. Falling back to nohup mode..."
        warn "Install PM2 with: sudo npm install -g pm2"
    fi
fi

log "Starting services from local directory (nohup mode)..."

# Check for port conflicts
log "Checking for port conflicts..."
if ss -tuln | grep -q ":3000 "; then
    error "Port 3000 is already in use"
fi
if ss -tuln | grep -q ":8000 "; then
    error "Port 8000 is already in use"
fi
if ss -tuln | grep -q ":8081 "; then
    error "Port 8081 is already in use"
fi
if ss -tuln | grep -q ":4500 "; then
    error "Port 4500 is already in use"
fi
log "All ports are available"

# Start Admin Backend (Python)
log "Starting Admin Backend on port 8000..."
cd "$WEBSITE_DIR"
if [ -f "backend/.env" ]; then
    nohup python -m backend > admin-backend.log 2>&1 &
    ADMIN_PID=$!
    log "Admin Backend started (PID: $ADMIN_PID)"
else
    warn "backend/.env not found, skipping Admin Backend"
    ADMIN_PID=""
fi

sleep 2

# Start Scholars Backend (Node.js)
log "Starting Scholars API on port 8081..."
cd "$SCHOLARS_DIR"
if [ -f ".env" ]; then
    cd artifacts/api-server
    nohup node dist/index.mjs > scholars-backend.log 2>&1 &
    SCHOLARS_PID=$!
    log "Scholars API started (PID: $SCHOLARS_PID)"
else
    warn ".env not found, skipping Scholars API"
    SCHOLARS_PID=""
fi

sleep 2

# Start Scholar Forge Frontend (Vite)
log "Starting Scholar Forge Frontend on port 4500..."
cd "$SCHOLARS_DIR/artifacts/scholar-forge"
if [ -f "package.json" ]; then
    nohup pnpm run dev > scholar-forge.log 2>&1 &
    SCHOLAR_FORGE_PID=$!
    log "Scholar Forge Frontend started (PID: $SCHOLAR_FORGE_PID)"
else
    warn "package.json not found, skipping Scholar Forge Frontend"
    SCHOLAR_FORGE_PID=""
fi

sleep 2

# Start Website Frontend (Next.js)
log "Starting Website Frontend on port 3000..."
cd "$WEBSITE_DIR"
if [ -f ".env" ] || [ -f ".env.example" ]; then
    nohup npm run dev > frontend.log 2>&1 &
    FRONTEND_PID=$!
    log "Website Frontend started (PID: $FRONTEND_PID)"
else
    warn ".env not found, starting anyway..."
    nohup npm run dev > frontend.log 2>&1 &
    FRONTEND_PID=$!
    log "Website Frontend started (PID: $FRONTEND_PID)"
fi

# Save PIDs
cd "$BASE_DIR"
cat > service-pids.txt << EOF
FRONTEND_PID=$FRONTEND_PID
ADMIN_PID=$ADMIN_PID
SCHOLARS_PID=$SCHOLARS_PID
SCHOLAR_FORGE_PID=$SCHOLAR_FORGE_PID
EOF

log ""
log "=== Services Started ==="
log "Frontend:      http://localhost:3000"
log "Admin Panel:   http://localhost:3000/admin"
log "Admin API:     http://localhost:8000/api"
log "Scholars API:  http://localhost:8081"
log "Scholar Forge: http://localhost:4500"
log ""
log "Logs:"
log "  Frontend:      tail -f $WEBSITE_DIR/frontend.log"
log "  Admin Backend: tail -f $WEBSITE_DIR/admin-backend.log"
log "  Scholars API:  tail -f $SCHOLARS_DIR/artifacts/api-server/scholars-backend.log"
log "  Scholar Forge: tail -f $SCHOLARS_DIR/artifacts/scholar-forge/scholar-forge.log"
log ""
log "To stop services: ./stop-local.sh"
log ""
info "To use PM2 multithreading mode: USE_PM2=true ./start-local.sh"
