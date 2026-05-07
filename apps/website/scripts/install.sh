#!/usr/bin/env bash

# Universal Installation Script for Stephen Asatsa Website
# Works from any directory - detects paths automatically
# Usage: bash install.sh [options]

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
  printf "${GREEN}[install]${NC} %s\n" "$1"
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

# Configuration
INSTALL_NGINX="${INSTALL_NGINX:-0}"
INSTALL_DOCKER="${INSTALL_DOCKER:-0}"
START_SERVICES="${START_SERVICES:-0}"
SKIP_DEPS="${SKIP_DEPS:-0}"
SERVICE_USER="${SERVICE_USER:-$(id -un)}"

# Parse command-line arguments
while [ $# -gt 0 ]; do
  case "$1" in
    --install-nginx)
      INSTALL_NGINX=1
      shift
      ;;
    --install-docker)
      INSTALL_DOCKER=1
      shift
      ;;
    --start-services)
      START_SERVICES=1
      shift
      ;;
    --skip-deps)
      SKIP_DEPS=1
      shift
      ;;
    --user)
      SERVICE_USER="$2"
      shift 2
      ;;
    --help)
      cat << 'EOF'
Universal Installation Script for Stephen Asatsa Website

Usage: bash install.sh [options]

Options:
  --install-nginx          Install and configure Nginx
  --install-docker         Install Docker and Docker Compose
  --start-services         Start systemd services after installation
  --skip-deps            Skip system dependency installation
  --user <username>       Service user (default: current user)
  --help                 Show this help message

Example:
  bash install.sh --install-nginx --start-services --user www-data

This script automatically detects the installation directory and configures
all services to work from the current location.
EOF
      exit 0
      ;;
    *)
      error "Unknown option: $1"
      ;;
  esac
done

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Source path detection utility
if [ ! -f "$SCRIPT_DIR/utils/path-detector.sh" ]; then
  error "Path detection utility not found: $SCRIPT_DIR/utils/path-detector.sh"
fi

source "$SCRIPT_DIR/utils/path-detector.sh"

# Check if running as root for system operations
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

# Check system dependencies
check_dependencies() {
  log "Checking system dependencies..."
  
  local missing_deps=()
  
  if ! command -v node >/dev/null 2>&1; then
    missing_deps+=("nodejs")
  fi
  
  if ! command -v npm >/dev/null 2>&1; then
    missing_deps+=("npm")
  fi
  
  if ! command -v python3 >/dev/null 2>&1; then
    missing_deps+=("python3")
  fi
  
  if ! command -v pip3 >/dev/null 2>&1; then
    missing_deps+=("python3-pip")
  fi
  
  if [ ${#missing_deps[@]} -gt 0 ]; then
    error "Missing dependencies: ${missing_deps[*]}"
  fi
  
  log "All system dependencies are available"
}

# Install system dependencies
install_dependencies() {
  if [ "$SKIP_DEPS" -eq 1 ]; then
    log "Skipping dependency installation"
    return
  fi
  
  log "Installing system dependencies..."
  
  # Update package lists
  run_root apt-get update
  
  # Install required packages
  run_root apt-get install -y \
    curl \
    wget \
    build-essential \
    git \
    python3 \
    python3-pip \
    python3-venv \
    sqlite3
  
  # Install Node.js if not present
  if ! command -v node >/dev/null 2>&1; then
    log "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | run_root bash -
    run_root apt-get install -y nodejs
  fi
  
  log "System dependencies installed"
}

# Setup Python virtual environment
setup_python_env() {
  log "Setting up Python virtual environment..."
  
  local backend_dir="$PROJECT_ROOT/backend"
  
  if [ ! -d "$backend_dir/venv" ]; then
    cd "$backend_dir"
    python3 -m venv venv
    log "Created virtual environment in $backend_dir/venv"
  fi
  
  # Activate and install requirements
  source "$backend_dir/venv/bin/activate"
  
  if [ -f "$backend_dir/requirements.txt" ]; then
    pip install -r "$backend_dir/requirements.txt"
  else
    # Install basic Flask requirements
    pip install flask flask-cors werkzeug
  fi
  
  deactivate
  log "Python environment setup completed"
}

# Install Node.js dependencies
setup_node_deps() {
  log "Installing Node.js dependencies..."
  
  cd "$PROJECT_ROOT"
  
  if [ -f "package.json" ]; then
    npm ci
  else
    warn "No package.json found, skipping Node.js dependencies"
  fi
  
  log "Node.js dependencies installed"
}

# Build the application
build_app() {
  log "Building application..."
  
  cd "$PROJECT_ROOT"
  
  if [ -f "package.json" ] && npm run build --version >/dev/null 2>&1; then
    npm run build
    log "Application built successfully"
  else
    warn "Build script not found, skipping build step"
  fi
}

# Generate systemd services
generate_services() {
  log "Generating systemd services..."
  
  # Run path detection to get configuration
  local install_dir="$PROJECT_ROOT"
  local ports
  ports="$(detect_ports)"
  
  local frontend_port="${ports%:*}"
  local backend_port="${ports#*:}"
  
  # Create service files
  local frontend_service="/tmp/stephenasatsa-frontend.service.$$"
  local backend_service="/tmp/stephenasatsa-backend.service.$$"
  
  # Frontend service
  cat > "$frontend_service" << EOF
[Unit]
Description=Stephen Asatsa Website Frontend (Next.js)
After=network.target stephenasatsa-backend.service

[Service]
Type=simple
User=$SERVICE_USER
Group=$SERVICE_USER
WorkingDirectory=$install_dir
Environment=NODE_ENV=production
Environment=PORT=$frontend_port
EnvironmentFile=-$install_dir/.env.auto
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=append:$install_dir/logs/frontend.log
StandardError=append:$install_dir/logs/frontend-error.log

[Install]
WantedBy=multi-user.target
EOF

  # Backend service
  cat > "$backend_service" << EOF
[Unit]
Description=Stephen Asatsa Website Backend API (Python)
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
Group=$SERVICE_USER
WorkingDirectory=$install_dir/backend
Environment=PATH=$install_dir/backend/venv/bin
EnvironmentFile=-$install_dir/.env.auto
ExecStart=$install_dir/backend/venv/bin/python admin_session_manager.py
Restart=always
RestartSec=10
StandardOutput=append:$install_dir/logs/backend.log
StandardError=append:$install_dir/logs/backend-error.log

[Install]
WantedBy=multi-user.target
EOF

  # Install services
  run_root cp "$frontend_service" "/etc/systemd/system/stephenasatsa-frontend.service"
  run_root cp "$backend_service" "/etc/systemd/system/stephenasatsa-backend.service"
  run_root systemctl daemon-reload
  run_root systemctl enable stephenasatsa-frontend.service stephenasatsa-backend.service
  
  # Cleanup
  rm -f "$frontend_service" "$backend_service"
  
  log "Systemd services generated and enabled"
}

# Set proper permissions
set_permissions() {
  log "Setting proper permissions..."
  
  local install_dir="$PROJECT_ROOT"
  
  # Set ownership
  run_root chown -R "$SERVICE_USER:$SERVICE_USER" "$install_dir"
  
  # Set executable permissions
  chmod +x "$install_dir/scripts"/*.sh
  chmod +x "$install_dir/scripts/utils"/*.sh
  
  # Set log directory permissions
  mkdir -p "$install_dir/logs"
  chmod 755 "$install_dir/logs"
  
  log "Permissions set correctly"
}

# Install Docker if requested
install_docker() {
  if [ "$INSTALL_DOCKER" -eq 1 ]; then
    log "Installing Docker..."
    
    if ! command -v docker >/dev/null 2>&1; then
      run_root apt-get install -y \
        ca-certificates \
        curl \
        gnupg \
        lsb-release
      
      run_root mkdir -p /etc/apt/keyrings
      curl -fsSL https://download.docker.com/linux/debian/gpg | \
        run_root gpg --dearmor -o /etc/apt/keyrings/docker.gpg
      
      echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
        https://download.docker.com/linux/debian \
        $(lsb_release -cs) stable" | \
        run_root tee /etc/apt/sources.list.d/docker.list > /dev/null
      
      run_root apt-get update
      run_root apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
      
      run_root systemctl enable docker
      run_root systemctl start docker
      
      if need_sudo; then
        run_root usermod -aG docker "$SERVICE_USER"
        warn "Added $SERVICE_USER to docker group. Log out and back in for changes to take effect."
      fi
    else
      log "Docker is already installed"
    fi
  fi
}

# Install Nginx if requested
install_nginx() {
  if [ "$INSTALL_NGINX" -eq 1 ]; then
    log "Installing Nginx..."
    
    if ! command -v nginx >/dev/null 2>&1; then
      run_root apt-get install -y nginx
      
      # Generate Nginx configuration
      local nginx_config="/tmp/stephenasatsa.conf.$$"
      local ports
      ports="$(detect_ports)"
      local frontend_port="${ports%:*}"
      
      cat > "$nginx_config" << EOF
server {
    listen 80;
    listen [::]:80;
    server_name _;

    client_max_body_size 25m;

    location / {
        proxy_pass http://127.0.0.1:$frontend_port;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
      
      run_root cp "$nginx_config" "/etc/nginx/sites-available/stephenasatsa.conf"
      run_root ln -sfn /etc/nginx/sites-available/stephenasatsa.conf /etc/nginx/sites-enabled/stephenasatsa.conf
      
      # Remove default site
      if [ -f /etc/nginx/sites-enabled/default ]; then
        run_root rm -f /etc/nginx/sites-enabled/default
      fi
      
      # Test and start Nginx
      run_root nginx -t
      run_root systemctl enable nginx
      run_root systemctl start nginx
      
      rm -f "$nginx_config"
      log "Nginx installed and configured"
    else
      log "Nginx is already installed"
    fi
  fi
}

# Start services if requested
start_services() {
  if [ "$START_SERVICES" -eq 1 ]; then
    log "Starting services..."
    
    run_root systemctl start stephenasatsa-backend.service
    sleep 2
    run_root systemctl start stephenasatsa-frontend.service
    
    log "Services started. Check status with:"
    log "  systemctl status stephenasatsa-backend.service"
    log "  systemctl status stephenasatsa-frontend.service"
  fi
}

# Main installation function
main() {
  log "Starting universal installation..."
  log "Installation directory: $PROJECT_ROOT"
  log "Service user: $SERVICE_USER"
  
  # Check dependencies
  if [ "$SKIP_DEPS" -eq 0 ]; then
    check_dependencies
    install_dependencies
  fi
  
  # Setup environments
  setup_python_env
  setup_node_deps
  
  # Build application
  build_app
  
  # Generate configuration
  main
  generate_services
  
  # Set permissions
  set_permissions
  
  # Install optional components
  install_docker
  install_nginx
  
  # Start services
  start_services
  
  log "Installation completed successfully!"
  log ""
  log "Next steps:"
  log "  1. Edit $PROJECT_ROOT/.env.auto with your configuration"
  log "  2. Start services: sudo systemctl start stephenasatsa-backend.service stephenasatsa-frontend.service"
  log "  3. View logs: journalctl -u stephenasatsa-frontend.service -f"
  log "  4. Access website: http://localhost:$(detect_ports | cut -d: -f1)"
  
  if [ "$INSTALL_NGINX" -eq 1 ]; then
    log "  5. Nginx is configured to serve on port 80"
  fi
}

# Run installation
main "$@"
