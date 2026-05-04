#!/bin/bash

# View active logs for all services
# Shows frontend, admin backend, scholars API, and scholar forge logs in real-time

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

BASE_DIR="/home/codecrafter/Documents/combined"
WEBSITE_DIR="$BASE_DIR/website"
SCHOLARS_DIR="$BASE_DIR/Schoolars-work-bench"

FRONTEND_LOG="$WEBSITE_DIR/frontend.log"
ADMIN_LOG="$WEBSITE_DIR/admin-backend.log"
SCHOLARS_LOG="$SCHOLARS_DIR/artifacts/api-server/scholars-backend.log"
SCHOLAR_FORGE_LOG="$SCHOLARS_DIR/artifacts/scholar-forge/logs/server.log"

echo -e "${CYAN}=== Viewing All Service Logs ===${NC}"
echo -e "${GREEN}Frontend:${NC}       $FRONTEND_LOG"
echo -e "${GREEN}Admin Backend:${NC}  $ADMIN_LOG"
echo -e "${GREEN}Scholars API:${NC}   $SCHOLARS_LOG"
echo -e "${GREEN}Scholar Forge:${NC}  $SCHOLAR_FORGE_LOG"
echo -e "${YELLOW}Press Ctrl+C to stop viewing logs${NC}"
echo ""

# Check if multitail is available
if command -v multitail &> /dev/null; then
    multitail -s 4 -l "tail -f $FRONTEND_LOG" -l "tail -f $ADMIN_LOG" -l "tail -f $SCHOLARS_LOG" -l "tail -f $SCHOLAR_FORGE_LOG"
else
    # Fallback: use tail with labels
    echo -e "${BLUE}Using tail (install multitail for better viewing: yay -S multitail)${NC}"
    echo ""

    tail -f $FRONTEND_LOG $ADMIN_LOG $SCHOLARS_LOG $SCHOLAR_FORGE_LOG
fi
