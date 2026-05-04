#!/bin/bash

# Build and Run Script
# This script builds the project, runs it with ngrok, and pushes changes

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { printf "${GREEN}[INFO]${NC} %s\n" "$1"; }
error() { printf "${RED}[ERROR]${NC} %s\n" "$1" >&2; }
warn() { printf "${YELLOW}[WARN]${NC} %s\n" "$1"; }
info() { printf "${BLUE}[STEP]${NC} %s\n" "$1"; }

log "=== Build and Run Script ==="
log ""

# Detect project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEBSITE_DIR="$PROJECT_DIR/website"

log "Project directory: $PROJECT_DIR"
log "Website directory: $WEBSITE_DIR"
log ""

# Step 1: Pull latest changes
info "Step 1: Pulling latest changes from GitHub..."
cd "$PROJECT_DIR"
git pull origin master || warn "Failed to pull from origin/master (may be up to date)"

# Update website submodule
if [ -d "$WEBSITE_DIR/.git" ]; then
    cd "$WEBSITE_DIR"
    git pull origin master || warn "Failed to pull website submodule"
    cd "$PROJECT_DIR"
fi
log "✓ Git pull complete"
log ""

# Step 2: Run diagnostic script
info "Step 2: Running diagnostic script..."
if [ -f "$PROJECT_DIR/diagnose-website.sh" ]; then
    chmod +x "$PROJECT_DIR/diagnose-website.sh"
    "$PROJECT_DIR/diagnose-website.sh" "$PROJECT_DIR" || error "Diagnostic script failed"
else
    warn "Diagnostic script not found, skipping..."
fi
log ""

# Step 3: Build the website (optional - skip for dev mode)
info "Step 3: Building the website (optional)..."
cd "$WEBSITE_DIR"
if [ -f "package.json" ]; then
    if npm run build 2>&1 | tee /tmp/next-build.log; then
        if grep -q "Failed to compile" /tmp/next-build.log || grep -q "Build failed" /tmp/next-build.log; then
            warn "Website build had errors, skipping build step (will run in dev mode)"
        else
            log "✓ Website build successful"
        fi
    else
        warn "Website build failed, skipping build step (will run in dev mode)"
    fi
else
    error "package.json not found in website directory"
    exit 1
fi
cd "$PROJECT_DIR"
log ""

# Step 4: Build deploy-ngrok binary
info "Step 4: Building deploy-ngrok binary..."
if [ -f "deploy-ngrok.go" ]; then
    go build -o deploy-ngrok deploy-ngrok.go || error "Failed to build deploy-ngrok"
    log "✓ deploy-ngrok binary built"
else
    warn "deploy-ngrok.go not found, skipping..."
fi
log ""

# Step 5: Push changes to GitHub
info "Step 5: Pushing changes to GitHub..."
cd "$PROJECT_DIR"
git add -A
if git diff --cached --quiet; then
    log "No changes to commit"
else
    git commit -m "Build and run: $(date '+%Y-%m-%d %H:%M:%S')" || log "Nothing to commit"
    git push origin master || error "Failed to push to GitHub"
    log "✓ Changes pushed to GitHub"
fi

# Push website submodule changes
if [ -d "$WEBSITE_DIR/.git" ]; then
    cd "$WEBSITE_DIR"
    git add -A
    if git diff --cached --quiet; then
        log "No website changes to commit"
    else
        git commit -m "Build and run: $(date '+%Y-%m-%d %H:%M:%S')" || log "Nothing to commit in website"
        git push origin master || warn "Failed to push website submodule"
        log "✓ Website changes pushed to GitHub"
    fi
    cd "$PROJECT_DIR"
    
    # Update submodule reference
    git add website
    git commit -m "Update website submodule reference" || log "No submodule reference update needed"
    git push origin master || warn "Failed to push submodule reference"
fi
log ""

# Step 6: Setup nginx (optional)
info "Step 6: Setting up nginx (optional)..."
if [ -f "nginx.conf" ] && [ -f "setup-nginx.sh" ]; then
    read -p "Do you want to setup nginx with single-domain integration? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        chmod +x setup-nginx.sh
        if [ -n "$DOMAIN_NAME" ]; then
            sudo DOMAIN_NAME="$DOMAIN_NAME" ./setup-nginx.sh || warn "Nginx setup failed, continuing..."
        else
            sudo ./setup-nginx.sh || warn "Nginx setup failed, continuing..."
        fi
    fi
else
    warn "nginx.conf or setup-nginx.sh not found, skipping nginx setup"
fi
log ""

# Step 7: Start the website with ngrok
info "Step 7: Starting website with ngrok..."
cd "$PROJECT_DIR"
if [ -f "deploy-ngrok" ]; then
    chmod +x deploy-ngrok
    log "Starting deploy-ngrok (press Ctrl+C to stop)..."
    ./deploy-ngrok
else
    error "deploy-ngrok binary not found"
    exit 1
fi
