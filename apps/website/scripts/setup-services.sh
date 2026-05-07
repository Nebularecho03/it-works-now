#!/usr/bin/env bash

# Setup Systemd Services from Templates
# Generates dynamic systemd services based on detected paths

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
  printf "${GREEN}[setup]${NC} %s\n" "$1"
}

warn() {
  printf "${YELLOW}[warn]${NC} %s\n" "$1"
}

error() {
  printf "${RED}[error]${NC} %s\n" "$1" >&2
  exit 1
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

# Generate service from template
generate_service_from_template() {
  local template_file="$1"
  local output_file="$2"
  local install_dir="$3"
  local service_user="$4"
  
  # Detect ports
  local ports
  ports="$(detect_ports)"
  local frontend_port="${ports%:*}"
  local backend_port="${ports#*:}"
  
  # Template variables
  local vars=(
    "INSTALL_DIR=$install_dir"
    "BACKEND_DIR=$install_dir/backend"
    "LOGS_DIR=$install_dir/logs"
    "SERVICE_USER=$service_user"
    "FRONTEND_PORT=$frontend_port"
    "BACKEND_PORT=$backend_port"
  )
  
  log "Generating service from template: $template_file"
  
  # Process template
  local temp_file="/tmp/service.$$"
  cp "$template_file" "$temp_file"
  
  # Replace template variables
  for var in "${vars[@]}"; do
    local key="${var%%=*}"
    local value="${var#*=}"
    sed -i "s|{{$key}}|$value|g" "$temp_file"
  done
  
  # Install service
  run_root cp "$temp_file" "$output_file"
  rm -f "$temp_file"
  
  log "Service installed: $output_file"
}

# Setup all services
setup_services() {
  local install_dir
  install_dir="$(detect_install_dir)"
  
  local service_user
  service_user="$(detect_service_user)"
  
  local template_dir
  template_dir="$(cd "$SCRIPT_DIR/../templates/systemd" && pwd)"
  
  log "Setting up systemd services..."
  log "  Install directory: $install_dir"
  log "  Service user: $service_user"
  log "  Template directory: $template_dir"
  
  # Generate frontend service
  if [ -f "$template_dir/stephenasatsa-frontend.service.template" ]; then
    generate_service_from_template \
      "$template_dir/stephenasatsa-frontend.service.template" \
      "/etc/systemd/system/stephenasatsa-frontend.service" \
      "$install_dir" \
      "$service_user"
  else
    warn "Frontend service template not found"
  fi
  
  # Generate backend service
  if [ -f "$template_dir/stephenasatsa-backend.service.template" ]; then
    generate_service_from_template \
      "$template_dir/stephenasatsa-backend.service.template" \
      "/etc/systemd/system/stephenasatsa-backend.service" \
      "$install_dir" \
      "$service_user"
  else
    warn "Backend service template not found"
  fi
  
  # Reload systemd
  log "Reloading systemd daemon..."
  run_root systemctl daemon-reload
  
  # Enable services
  log "Enabling services..."
  run_root systemctl enable stephenasatsa-frontend.service stephenasatsa-backend.service
  
  log "Systemd services setup completed!"
}

# Show help
show_help() {
  cat << 'EOF'
Setup Systemd Services for Stephen Asatsa Website

Usage: bash setup-services.sh [options]

This script generates systemd services from templates using detected paths.
It automatically detects the installation directory and configures
services to work from any location.

The script will:
  1. Detect installation directory
  2. Detect available ports
  3. Generate services from templates
  4. Install and enable systemd services
  5. Reload systemd daemon

No configuration required - works from any directory!
EOF
}

# Main function
main() {
  local command="${1:-help}"
  
  case "$command" in
    setup)
      setup_services
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
