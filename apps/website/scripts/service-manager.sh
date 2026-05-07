#!/usr/bin/env bash

# Service Manager for Stephen Asatsa Website
# Works from any directory with auto-detected paths
# Usage: bash service-manager.sh [start|stop|restart|status|logs]

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
  printf "${GREEN}[service]${NC} %s\n" "$1"
}

warn() {
  printf "${YELLOW}[warn]${NC} %s\n" "$1"
}

error() {
  printf "${RED}[error]${NC} %s\n" "$1" >&2
}

info() {
  printf "${BLUE}[info]${NC} %s\n" "$1"
}

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source path detection utility
if [ -f "$SCRIPT_DIR/utils/path-detector.sh" ]; then
  source "$SCRIPT_DIR/utils/path-detector.sh"
else
  error "Path detection utility not found: $SCRIPT_DIR/utils/path-detector.sh"
fi

# Detect installation directory
detect_project_root() {
  local script_dir="$SCRIPT_DIR"
  echo "$(cd "$script_dir/.." && pwd)"
}

# Check if running as root for systemd operations
need_sudo() {
  [ "$(id -u)" -ne 0 ]
}

run_root() {
  if need_sudo; then
    sudo "$@"
  else
    "$@"
  fi
}

# Service operations
start_services() {
  log "Starting services..."
  
  run_root systemctl start stephenasatsa-backend.service
  sleep 2
  run_root systemctl start stephenasatsa-frontend.service
  
  log "Services started"
}

stop_services() {
  log "Stopping services..."
  
  run_root systemctl stop stephenasatsa-frontend.service
  run_root systemctl stop stephenasatsa-backend.service
  
  log "Services stopped"
}

restart_services() {
  log "Restarting services..."
  
  stop_services
  sleep 2
  start_services
  
  log "Services restarted"
}

show_status() {
  log "Service status:"
  echo ""
  
  info "Backend Service:"
  run_root systemctl status stephenasatsa-backend.service --no-pager || true
  echo ""
  
  info "Frontend Service:"
  run_root systemctl status stephenasatsa-frontend.service --no-pager || true
  echo ""
  
  # Show port status
  local project_root
  project_root="$(detect_project_root)"
  
  if [ -f "$project_root/.env.auto" ]; then
    source "$project_root/.env.auto"
    
    info "Port Status:"
    if ss -tlnp | grep -q ":$FRONTEND_PORT"; then
      echo "  Frontend (:$FRONTEND_PORT): ✓ Running"
    else
      echo "  Frontend (:$FRONTEND_PORT): ✗ Stopped"
    fi
    
    if ss -tlnp | grep -q ":$BACKEND_PORT"; then
      echo "  Backend (:$BACKEND_PORT): ✓ Running"
    else
      echo "  Backend (:$BACKEND_PORT): ✗ Stopped"
    fi
  fi
}

show_logs() {
  local service="${1:-frontend}"
  local follow="${2:-false}"
  
  local service_name
  case "$service" in
    backend|back)
      service_name="stephenasatsa-backend.service"
      ;;
    frontend|front)
      service_name="stephenasatsa-frontend.service"
      ;;
    *)
      error "Unknown service: $service. Use 'frontend' or 'backend'"
      ;;
  esac
  
  if [ "$follow" = "true" ]; then
    log "Following logs for $service_name..."
    run_root journalctl -u "$service_name" -f
  else
    log "Showing recent logs for $service_name..."
    run_root journalctl -u "$service_name" --no-pager -n 50
  fi
}

# Development mode operations
start_dev() {
  log "Starting development servers..."
  
  local project_root
  project_root="$(detect_project_root)"
  
  if [ -f "$project_root/.env.auto" ]; then
    source "$project_root/.env.auto"
  else
    warn "No .env.auto found, using default ports"
    FRONTEND_PORT=3002
    BACKEND_PORT=5001
  fi
  
  # Start backend
  log "Starting backend on port $BACKEND_PORT..."
  cd "$project_root/backend"
  if [ -d "venv" ]; then
    source venv/bin/activate
    python admin_session_manager.py &
    BACKEND_PID=$!
    deactivate
  else
    error "Virtual environment not found in $project_root/backend"
  fi
  
  # Start frontend
  log "Starting frontend on port $FRONTEND_PORT..."
  cd "$project_root"
  PORT=$FRONTEND_PORT npm run dev &
  FRONTEND_PID=$!
  
  log "Development servers started"
  log "Backend PID: $BACKEND_PID"
  log "Frontend PID: $FRONTEND_PID"
  log "Stop with: kill $BACKEND_PID $FRONTEND_PID"
}

stop_dev() {
  log "Stopping development servers..."
  
  # Find and kill processes
  local pids
  pids=$(pgrep -f "admin_session_manager.py" || true)
  if [ -n "$pids" ]; then
    log "Stopping backend processes: $pids"
    echo "$pids" | xargs kill
  fi
  
  pids=$(pgrep -f "npm run dev" || true)
  if [ -n "$pids" ]; then
    log "Stopping frontend processes: $pids"
    echo "$pids" | xargs kill
  fi
  
  log "Development servers stopped"
}

# Show help
show_help() {
  cat << 'EOF'
Service Manager for Stephen Asatsa Website

Usage: bash service-manager.sh [command] [options]

Commands:
  start               Start systemd services
  stop                Stop systemd services
  restart             Restart systemd services
  status              Show service status
  logs [service]      Show logs (frontend|backend)
  logs [service] -f   Follow logs (frontend|backend)
  dev-start           Start development servers
  dev-stop            Stop development servers
  help                Show this help

Examples:
  bash service-manager.sh start
  bash service-manager.sh status
  bash service-manager.sh logs backend -f
  bash service-manager.sh dev-start

This script automatically detects paths and works from any directory.
EOF
}

# Main function
main() {
  local command="${1:-help}"
  
  case "$command" in
    start)
      start_services
      ;;
    stop)
      stop_services
      ;;
    restart)
      restart_services
      ;;
    status)
      show_status
      ;;
    logs)
      local service="${2:-frontend}"
      local follow="false"
      if [ "${3:-}" = "-f" ]; then
        follow="true"
      fi
      show_logs "$service" "$follow"
      ;;
    dev-start)
      start_dev
      ;;
    dev-stop)
      stop_dev
      ;;
    help|--help|-h)
      show_help
      ;;
    *)
      error "Unknown command: $command"
      echo "Use 'help' to see available commands"
      exit 1
      ;;
  esac
}

# Run main function
main "$@"
