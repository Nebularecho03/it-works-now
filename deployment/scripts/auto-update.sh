#!/bin/bash

# Auto-update script for both projects
# Checks for updates every 15 minutes and rebuilds if changes detected
# Supports PM2, Docker, and systemd deployment modes

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { printf "${GREEN}[INFO]${NC} %s\n" "$1"; }
error() { printf "${RED}[ERROR]${NC} %s\n" "$1" >&2; exit 1; }
warn() { printf "${YELLOW}[WARN]${NC} %s\n" "$1"; }

# Configuration
PROJECTS_DIR="$HOME/projects"
WEBSITE_DIR="$PROJECTS_DIR/website"
SCHOLARS_DIR="$PROJECTS_DIR/schoolars-work-bench"
LOG_DIR="$HOME/auto-update-logs"
LOG_FILE="$LOG_DIR/auto-update-$(date +%Y%m%d).log"

# Create log directory
mkdir -p "$LOG_DIR"

# Log all output
exec > >(tee -a "$LOG_FILE") 2>&1

log "=== Auto-update started at $(date) ==="

# Function to check and update a repository
update_repo() {
    local repo_dir=$1
    local repo_name=$2
    
    log "Checking $repo_name for updates..."
    
    if [ ! -d "$repo_dir" ]; then
        warn "$repo_name directory not found, skipping"
        return
    fi
    
    cd "$repo_dir"
    
    # Remove generated files that conflict with git
    rm -f artifacts/api-server/Dockerfile.pnpm 2>/dev/null || true
    rm -f docker-compose.yml 2>/dev/null || true
    
    # Fetch latest changes
    git fetch origin
    
    # Check if there are changes
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/main)
    
    if [ "$LOCAL" != "$REMOTE" ]; then
        log "Changes detected in $repo_name, pulling..."
        git pull origin main
        
        # Detect deployment mode and restart accordingly
        if command -v pm2 &> /dev/null && pm2 list | grep -q "online"; then
            log "Restarting with PM2 (zero-downtime)..."
            cd /home/codecrafter/Documents/combined
            pm2 reload all
        elif [ "$repo_name" = "website" ]; then
            log "Rebuilding website with Docker..."
            cd "$repo_dir"
            docker compose down
            docker compose up -d --build
        elif [ "$repo_name" = "schoolars-work-bench" ]; then
            log "Rebuilding schoolars-work-bench with Docker..."
            cd "$repo_dir"
            docker compose down
            docker compose up -d --build
        fi
        
        log "$repo_name updated and restarted successfully"
    else
        log "No changes in $repo_name"
    fi
}

# Update both repositories
update_repo "$WEBSITE_DIR" "website"
update_repo "$SCHOLARS_DIR" "schoolars-work-bench"

log "=== Auto-update completed at $(date) ==="
