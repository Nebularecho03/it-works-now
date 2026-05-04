#!/bin/bash

# Debian Installation Script for Combined Project
# Supports Debian 11+ and Ubuntu 20.04+

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration variables
PROJECT_NAME="stephenasatsa"
INSTALL_DIR="/opt/$PROJECT_NAME"
DOMAIN="your-domain.com"
ADMIN_PASSWORD="ChangeMeToSecurePassword123!"

# Logging
LOG_FILE="/var/log/${PROJECT_NAME}_install.log"
exec > >(tee -a "$LOG_FILE")
exec 2>&1

# Utility functions
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Detect operating system
detect_os() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        error "Cannot detect operating system"
    fi

    case $OS in
        "Ubuntu"|"Debian"*|"Debian GNU/Linux"*)
            PKG_MANAGER="apt"
            PKG_UPDATE="apt update"
            PKG_INSTALL="apt install -y"
            ;;
        *)
            error "Unsupported operating system: $OS"
            ;;
    esac

    log "Detected OS: $OS $VER"
    log "Package manager: $PKG_MANAGER"
}

# Check system requirements
check_requirements() {
    log "Checking system requirements..."

    # Check RAM
    RAM=$(free -m | awk 'NR==2{printf "%.0f", $2/1024}')
    if [[ $RAM -lt 1 ]]; then
        error "Minimum 1GB RAM required. Found: ${RAM}GB"
    elif [[ $RAM -lt 2 ]]; then
        warn "Low memory detected: ${RAM}GB RAM. Performance may be limited."
        warn "For optimal performance, 2GB+ RAM is recommended."
        read -p "Continue with ${RAM}GB RAM? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error "Installation cancelled by user"
        fi
    fi

    # Check CPU cores
    CORES=$(nproc)
    if [[ $CORES -lt 1 ]]; then
        error "Minimum 1 CPU core required. Found: $CORES"
    elif [[ $CORES -lt 2 ]]; then
        warn "Single-core CPU detected: $CORES core. Performance may be limited."
        warn "For optimal performance, 2+ CPU cores are recommended."
        read -p "Continue with $CORES CPU core? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error "Installation cancelled by user"
        fi
    fi

    # Check disk space
    DISK=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
    if [[ $DISK -lt 8 ]]; then
        error "Minimum 8GB disk space required. Found: ${DISK}GB"
    elif [[ $DISK -lt 20 ]]; then
        warn "Limited disk space detected: ${DISK}GB. For optimal performance, 20GB+ is recommended."
        read -p "Continue with ${DISK}GB disk space? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error "Installation cancelled by user"
        fi
    fi

    log "System requirements met: ${RAM}GB RAM, $CORES cores, ${DISK}GB disk"
}

# Install system dependencies
install_dependencies() {
    log "Installing system dependencies..."

    $PKG_UPDATE
    # Install basic packages first
    $PKG_INSTALL curl wget git nginx python3 python3-pip python3-venv \
        postgresql postgresql-contrib \
        build-essential htop ufw
    
    # Handle Node.js and npm separately to avoid conflicts
    if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
        log "Node.js and npm already installed"
    else
        # Remove conflicting packages if they exist
        $PKG_INSTALL --purge -y npm nodejs 2>/dev/null || true
        # Install Node.js from NodeSource (includes compatible npm)
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        $PKG_INSTALL nodejs
    fi

    # Install PM2 globally
    npm install -g pm2

    log "System dependencies installed"
}

# Install Go
install_go() {
    log "Installing Go..."

    if command -v go >/dev/null 2>&1; then
        log "Go $(go version) already installed"
        return
    fi

    GO_VERSION="1.21.6"
    cd /tmp
    wget -q https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz
    tar -C /usr/local -xzf go${GO_VERSION}.linux-amd64.tar.gz

    # Add to PATH
    echo 'export PATH=$PATH:/usr/local/go/bin' >> /etc/profile
    export PATH=$PATH:/usr/local/go/bin

    log "Go $(go version) installed"
}

# Setup project
setup_project() {
    log "Setting up project files..."

    # Create project directory
    mkdir -p $INSTALL_DIR
    cd $INSTALL_DIR

    # Clone repository if not exists
    if [[ ! -d "$INSTALL_DIR/website" ]]; then
        git clone https://github.com/Cyberverse-cent0/combined-project.git temp
        mv temp/* .
        mv temp/.* . 2>/dev/null || true
        rmdir temp
    fi

    # Set permissions
    chown -R www-data:www-data $INSTALL_DIR
    chmod -R 755 $INSTALL_DIR

    log "Project files setup completed"
}

# Install website dependencies
install_website() {
    log "Installing website dependencies..."

    cd $INSTALL_DIR/website

    # Install dependencies as www-data
    sudo -u www-data npm install

    log "Website dependencies installed"
}

# Install backend dependencies
install_backend() {
    log "Installing backend dependencies..."

    cd $INSTALL_DIR/website/backend

    # Create Python virtual environment
    sudo -u www-data python3 -m venv venv
    sudo -u www-data venv/bin/pip install --upgrade pip
    sudo -u www-data venv/bin/pip install -r requirements.txt

    log "Backend dependencies installed"
}

# Build Go services
build_go_services() {
    log "Building Go services..."

    cd $INSTALL_DIR/website/backend/go-services

    # Build each Go service
    for service in password-service telemetry-service image-service worker-service; do
        cd $service
        sudo -u www-data go mod tidy
        sudo -u www-data go build -o $service .
        cd ..
    done

    log "Go services built successfully"
}

# Create environment file
create_env_file() {
    log "Creating environment file..."

    cat > $INSTALL_DIR/.env << EOF
# Production Environment Configuration
DOMAIN_NAME=$DOMAIN
WEBSITE_URL=https://$DOMAIN
SCHOLARS_URL=https://$DOMAIN/scholars
CORS_ORIGIN=https://$DOMAIN
ADMIN_ALLOWED_ORIGIN=https://$DOMAIN
NEXTAUTH_URL=https://$DOMAIN
NEXT_PUBLIC_SITE_URL=https://$DOMAIN
NEXT_PUBLIC_SCHOLARS_URL=https://$DOMAIN/scholars

# Admin Configuration
ADMIN_EMAIL=admin@$DOMAIN
ADMIN_PASSWORD=$ADMIN_PASSWORD

# Backend Configuration
WEBSITE_BACKEND_URL=http://localhost:8000
SCHOLARS_API_PORT=8081

# Go Services
USE_GO_PASSWORD_SERVICE=true
GO_PASSWORD_SERVICE_URL=http://localhost:9001
USE_GO_TELEMETRY_SERVICE=true
GO_TELEMETRY_SERVICE_URL=http://localhost:9002
EOF

    chmod 600 $INSTALL_DIR/.env
    chown www-data:www-data $INSTALL_DIR/.env

    log "Environment file created"
}

# Configure nginx
configure_nginx() {
    log "Configuring nginx..."

    # Remove default site
    rm -f /etc/nginx/sites-enabled/default

    # Copy our nginx config
    cp $INSTALL_DIR/nginx.conf /etc/nginx/sites-available/combined
    ln -sf /etc/nginx/sites-available/combined /etc/nginx/sites-enabled/

    # Test configuration
    nginx -t

    # Restart nginx
    systemctl restart nginx

    log "Nginx configured"
}

# Create PM2 ecosystem file
create_pm2_config() {
    log "Creating PM2 configuration..."

    # Determine instance count and execution mode based on available resources
    if [[ $RAM -lt 2 ]] || [[ $CORES -lt 2 ]]; then
        FRONTEND_INSTANCES=1
        FRONTEND_MEMORY="256M"
        BACKEND_MEMORY="128M"
        SCHOLAR_MEMORY="128M"
        API_MEMORY="128M"
        EXEC_MODE="fork"
        log "Optimizing for low-resource system (${RAM}GB RAM, ${CORES} cores)"
    else
        FRONTEND_INSTANCES=2
        FRONTEND_MEMORY="1G"
        BACKEND_MEMORY="512M"
        SCHOLAR_MEMORY="512M"
        API_MEMORY="512M"
        EXEC_MODE="cluster"
        log "Using standard configuration (2GB+ RAM, 2+ cores)"
    fi

    cat > $INSTALL_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'website-frontend',
      script: 'npm',
      args: 'start',
      cwd: '$INSTALL_DIR/website',
      instances: $FRONTEND_INSTANCES,
      exec_mode: '$EXEC_MODE',
      env: { NODE_ENV: 'production', PORT: 3000 },
      error_file: '/var/log/$PROJECT_NAME/website-frontend-error.log',
      out_file: '/var/log/$PROJECT_NAME/website-frontend-out.log',
      autorestart: true,
      max_memory_restart: '$FRONTEND_MEMORY'
    },
    {
      name: 'website-backend',
      script: 'python3',
      args: 'server.py',
      cwd: '$INSTALL_DIR/website/backend',
      instances: 1,
      exec_mode: 'fork',
      env: { PYTHONUNBUFFERED: '1' },
      error_file: '/var/log/$PROJECT_NAME/website-backend-error.log',
      out_file: '/var/log/$PROJECT_NAME/website-backend-out.log',
      autorestart: true,
      max_memory_restart: '$BACKEND_MEMORY'
    },
    {
      name: 'scholar-forge-frontend',
      script: 'node',
      args: 'server.cjs',
      cwd: '$INSTALL_DIR/Schoolars-work-bench/artifacts/scholar-forge',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production' },
      error_file: '/var/log/$PROJECT_NAME/scholar-forge-error.log',
      out_file: '/var/log/$PROJECT_NAME/scholar-forge-out.log',
      autorestart: true,
      max_memory_restart: '$SCHOLAR_MEMORY'
    },
    {
      name: 'scholars-api',
      script: 'npm',
      args: 'start',
      cwd: '$INSTALL_DIR/Schoolars-work-bench/artifacts/api-server',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production', PORT: 8081 },
      error_file: '/var/log/$PROJECT_NAME/scholars-api-error.log',
      out_file: '/var/log/$PROJECT_NAME/scholars-api-out.log',
      autorestart: true,
      max_memory_restart: '$API_MEMORY'
    }
  ]
};
EOF

    chown www-data:www-data $INSTALL_DIR/ecosystem.config.js

    log "PM2 configuration created"
}

# Start services with PM2
start_services() {
    log "Starting services with PM2..."

    # Create logs directory
    mkdir -p /var/log/$PROJECT_NAME
    chown www-data:www-data /var/log/$PROJECT_NAME

    # Start services
    cd $INSTALL_DIR
    sudo -u www-data pm2 start ecosystem.config.js
    sudo -u www-data pm2 save
    sudo -u www-data pm2 startup

    log "Services started with PM2"
}

# Setup firewall
setup_firewall() {
    log "Configuring firewall..."

    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 'Nginx Full'
    ufw --force enable

    log "Firewall configured"
}

# Health check
health_check() {
    log "Performing health check..."

    # Check if nginx is running
    if systemctl is-active --quiet nginx; then
        log "✓ nginx is running"
    else
        error "✗ nginx is not running"
    fi

    # Check if PM2 processes are running
    if sudo -u www-data pm2 list | grep -q "online"; then
        log "✓ PM2 processes are running"
    else
        warn "✗ PM2 processes are not running"
    fi

    # Check if website is accessible
    sleep 5
    if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|302"; then
        log "✓ Website is responding"
    else
        warn "✗ Website is not responding"
    fi
}

# Print installation summary
print_summary() {
    log "Installation completed successfully!"
    echo ""
    echo -e "${GREEN}=== Installation Summary ===${NC}"
    echo -e "Project Directory: ${BLUE}$INSTALL_DIR${NC}"
    echo -e "Website URL: ${BLUE}http://localhost${NC}"
    echo -e "Admin URL: ${BLUE}http://localhost/admin${NC}"
    echo -e "Scholar Forge: ${BLUE}http://localhost/scholars${NC}"
    echo -e "Admin Password: ${YELLOW}$ADMIN_PASSWORD${NC}"
    echo ""
    echo -e "${GREEN}=== Service Management ===${NC}"
    echo -e "Status: ${BLUE}sudo -u www-data pm2 status${NC}"
    echo -e "Logs: ${BLUE}sudo -u www-data pm2 logs${NC}"
    echo -e "Restart: ${BLUE}sudo -u www-data pm2 restart all${NC}"
    echo -e "Stop: ${BLUE}sudo -u www-data pm2 stop all${NC}"
    echo ""
    echo -e "${GREEN}=== Important Files ===${NC}"
    echo -e "Environment: ${BLUE}$INSTALL_DIR/.env${NC}"
    echo -e "PM2 Config: ${BLUE}$INSTALL_DIR/ecosystem.config.js${NC}"
    echo -e "Nginx Config: ${BLUE}/etc/nginx/sites-available/combined${NC}"
    echo -e "Install Log: ${BLUE}$LOG_FILE${NC}"
    echo ""
    echo -e "${YELLOW}=== Next Steps ===${NC}"
    echo "1. Configure your domain in nginx if needed"
    echo "2. Setup SSL certificate with: certbot --nginx"
    echo "3. Change the admin password"
    echo "4. Setup backups and monitoring"
    echo ""
}

# Main installation function
main() {
    echo -e "${BLUE}"
    echo "======================================"
    echo "  Debian Installation Script"
    echo "  Combined Project"
    echo "======================================"
    echo -e "${NC}"

    # Check if running as root
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root"
    fi

    # Get domain from user if not set
    if [[ "$DOMAIN" == "your-domain.com" ]]; then
        read -p "Enter your domain name (or press Enter for localhost): " DOMAIN
        if [[ -z "$DOMAIN" ]]; then
            DOMAIN="localhost"
        fi
    fi

    # Run installation steps
    detect_os
    check_requirements
    install_dependencies
    install_go
    setup_project
    install_website
    install_backend
    build_go_services
    create_env_file
    create_pm2_config
    configure_nginx
    start_services
    setup_firewall
    health_check
    print_summary

    log "Installation completed successfully!"
}

# Run main function
main "$@"
