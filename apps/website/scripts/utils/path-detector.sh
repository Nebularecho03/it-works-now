#!/usr/bin/env bash

# Path Detection Utility for Stephen Asatsa Website
# Automatically detects installation paths and generates configuration

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
  printf "${GREEN}[detect]${NC} %s\n" "$1"
}

warn() {
  printf "${YELLOW}[warn]${NC} %s\n" "$1"
}

error() {
  printf "${RED}[error]${NC} %s\n" "$1" >&2
}

# Detect installation directory
detect_install_dir() {
  local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
  echo "$script_dir"
}

# Detect user who will run services
detect_service_user() {
  echo "${SERVICE_USER:-$(id -un)}"
}

# Detect available ports
detect_ports() {
  local frontend_port="${FRONTEND_PORT:-3002}"
  local backend_port="${BACKEND_PORT:-5001}"
  
  # Check if ports are available
  if ss -tlnp | grep -q ":$frontend_port"; then
    warn "Port $frontend_port is in use, finding alternative..."
    for port in {3003..3010}; do
      if ! ss -tlnp | grep -q ":$port"; then
        frontend_port=$port
        log "Using frontend port $frontend_port"
        break
      fi
    done
  fi
  
  if ss -tlnp | grep -q ":$backend_port"; then
    warn "Port $backend_port is in use, finding alternative..."
    for port in {5002..5010}; do
      if ! ss -tlnp | grep -q ":$port"; then
        backend_port=$port
        log "Using backend port $backend_port"
        break
      fi
    done
  fi
  
  echo "$frontend_port:$backend_port"
}

# Generate environment configuration
generate_env_config() {
  local install_dir="$1"
  local service_user="$2"
  local ports="$3"
  
  local frontend_port="${ports%:*}"
  local backend_port="${ports#*:}"
  
  cat > "$install_dir/.env.auto" << EOF
# Auto-generated environment configuration
# Generated on: $(date)

# Installation paths
INSTALL_DIR="$install_dir"
BACKEND_DIR="$install_dir/backend"
FRONTEND_DIR="$install_dir"
LOGS_DIR="$install_dir/logs"
UPLOADS_DIR="$install_dir/public/uploads"

# Service configuration
SERVICE_USER="$service_user"
FRONTEND_PORT=$frontend_port
BACKEND_PORT=$backend_port

# Flask Backend Configuration
NEXT_PUBLIC_FLASK_SESSION_URL="http://localhost:$backend_port"
FLASK_PORT=$backend_port

# Frontend Configuration
PORT=$frontend_port
NODE_ENV=production

# Database Configuration
DATABASE_URL="file:./data/users.db"

# Security Configuration
NEXTAUTH_SECRET="\$(openssl rand -base64 32)"
SESSION_TIMEOUT=300

# CORS Configuration
ALLOWED_ORIGIN="http://localhost:$frontend_port"

# Development Settings
NODE_ENV=production

# Log paths
FRONTEND_LOG="$install_dir/logs/frontend.log"
FRONTEND_ERROR_LOG="$install_dir/logs/frontend-error.log"
BACKEND_LOG="$install_dir/logs/backend.log"
BACKEND_ERROR_LOG="$install_dir/logs/backend-error.log"
EOF

  log "Environment configuration generated at $install_dir/.env.auto"
}

# Create necessary directories
create_directories() {
  local install_dir="$1"
  
  local dirs=(
    "$install_dir/logs"
    "$install_dir/public/uploads"
    "$install_dir/public/uploads/gallery"
    "$install_dir/public/uploads/admin"
    "$install_dir/data"
  )
  
  for dir in "${dirs[@]}"; do
    if [ ! -d "$dir" ]; then
      mkdir -p "$dir"
      log "Created directory: $dir"
    fi
  done
}

# Main detection function
main() {
  log "Detecting installation configuration..."
  
  local install_dir
  install_dir="$(detect_install_dir)"
  log "Installation directory: $install_dir"
  
  local service_user
  service_user="$(detect_service_user)"
  log "Service user: $service_user"
  
  local ports
  ports="$(detect_ports)"
  log "Ports: $ports"
  
  create_directories "$install_dir"
  generate_env_config "$install_dir" "$service_user" "$ports"
  
  # Export detected values for other scripts
  export DETECTED_INSTALL_DIR="$install_dir"
  export DETECTED_SERVICE_USER="$service_user"
  export DETECTED_FRONTEND_PORT="${ports%:*}"
  export DETECTED_BACKEND_PORT="${ports#*:}"
  
  log "Path detection completed successfully!"
  log "Values exported for other scripts:"
  log "  DETECTED_INSTALL_DIR=$DETECTED_INSTALL_DIR"
  log "  DETECTED_SERVICE_USER=$DETECTED_SERVICE_USER"
  log "  DETECTED_FRONTEND_PORT=$DETECTED_FRONTEND_PORT"
  log "  DETECTED_BACKEND_PORT=$DETECTED_BACKEND_PORT"
}

# Run if script is executed directly
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
  main "$@"
fi
