#!/bin/bash

# Stephen Asatsa Website Installation Script
# Automatically installs the entire website stack on Debian 12

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_NAME="stephenasatsa"
INSTALL_DIR="/opt/${PROJECT_NAME}"
DOMAIN="localhost"
DB_NAME="stephenasatsa_prod"
DB_USER="stephenasatsa"
DB_PASSWORD="$(openssl rand -base64 32)"
ADMIN_PASSWORD="ChangeMeToSecurePassword123!"
LOG_FILE="/var/log/${PROJECT_NAME}_install.log"

# Logging
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1" >> "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >> "$LOG_FILE"
    exit 1
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root (use sudo)"
    fi
}

# Get domain name
get_domain() {
    if [[ "$DOMAIN" == "localhost" ]]; then
        read -p "Enter your domain name (press Enter for localhost): " input_domain
        if [[ -n "$input_domain" ]]; then
            DOMAIN="$input_domain"
        fi
    fi
    log "Using domain: $DOMAIN"
}

# Install system dependencies
install_system_deps() {
    log "Installing system dependencies..."
    
    apt-get update
    
    # Essential packages (excluding nodejs/npm - handled separately)
    apt-get install -y \
        curl \
        wget \
        git \
        nginx \
        postgresql \
        postgresql-contrib \
        build-essential \
        python3 \
        python3-pip \
        python3-venv \
        certbot \
        python3-certbot-nginx \
        ufw \
        fail2ban \
        htop \
        openssl
    
    log "System dependencies installed"
}

# Install Node.js 20.x
install_nodejs() {
    log "Installing Node.js 20.x..."
    
    # Add NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    
    # Verify installation
    node_version=$(node --version)
    npm_version=$(npm --version)
    log "Node.js ${node_version} and npm ${npm_version} installed"
}

# Setup PostgreSQL database
setup_database() {
    log "Setting up PostgreSQL database..."
    
    # Start PostgreSQL
    systemctl start postgresql
    systemctl enable postgresql
    
    # Create database and user
    su - postgres -c "psql -c \"DROP DATABASE IF EXISTS ${DB_NAME};\""
    su - postgres -c "psql -c \"DROP USER IF EXISTS ${DB_USER};\""
    su - postgres -c "psql -c \"CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';\""
    su - postgres -c "psql -c \"CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};\""
    su - postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};\""
    su - postgres -c "psql -c \"ALTER USER ${DB_USER} WITH SUPERUSER;\""
    
    log "Database setup completed"
}

# Setup project files
setup_project() {
    log "Setting up project files..."
    
    # Create installation directory
    mkdir -p "$INSTALL_DIR"
    
    # Copy project files
    local source_dir="$(pwd)"
    
    if [[ -d "$source_dir/apps/website" ]]; then
        log "Copying project files from $source_dir"
        cp -r "$source_dir/apps" "$INSTALL_DIR/"
        cp -r "$source_dir/production" "$INSTALL_DIR/" 2>/dev/null || true
        cp "$source_dir/.env.production" "$INSTALL_DIR/" 2>/dev/null || true
        cp "$source_dir/package.json" "$INSTALL_DIR/" 2>/dev/null || true
    else
        error "Project files not found in current directory"
    fi
    
    # Create logs directory
    mkdir -p /var/log/${PROJECT_NAME}
    
    # Set permissions
    chown -R www-data:www-data "$INSTALL_DIR"
    chmod -R 755 "$INSTALL_DIR"
    chown www-data:www-data /var/log/${PROJECT_NAME}
    
    log "Project files setup completed"
}

# Install frontend dependencies
install_frontend() {
    log "Installing frontend dependencies..."
    
    cd "$INSTALL_DIR/apps/website"
    
    # Ensure npm cache directory exists and is writable
    export HOME="/var/www"
    mkdir -p /var/www/.npm
    chown -R www-data:www-data /var/www/.npm
    
    # Install npm dependencies as www-data
    sudo -u www-data HOME=/var/www npm install
    
    # Generate Prisma client
    sudo -u www-data HOME=/var/www npx prisma generate
    
    # Build for production
    sudo -u www-data HOME=/var/www npm run build
    
    log "Frontend installation completed"
}

# Install backend dependencies
install_backend() {
    log "Installing backend dependencies..."
    
    cd "$INSTALL_DIR/apps/website/backend"
    
    # Create virtual environment
    python3 -m venv venv
    
    # Install Python dependencies
    venv/bin/pip install --upgrade pip
    venv/bin/pip install -r requirements.txt
    
    # Set permissions
    chown -R www-data:www-data venv
    
    log "Backend installation completed"
}

# Create environment file
create_env_file() {
    log "Creating environment file..."
    
    cat > "$INSTALL_DIR/.env.production" << EOF
# Production Environment Configuration
WEBSITE_URL=https://${DOMAIN}
NEXTAUTH_URL=https://${DOMAIN}
NEXT_PUBLIC_SITE_URL=https://${DOMAIN}

# CORS Configuration
CORS_ORIGIN=https://${DOMAIN}
ADMIN_ALLOWED_ORIGIN=https://${DOMAIN}

# API Configuration
NEXT_PUBLIC_API_URL=""
ADMIN_BACKEND_URL=https://${DOMAIN}

# Admin Configuration
ADMIN_PASSWORD=${ADMIN_PASSWORD}

# Database Configuration
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}?schema=public"

# NextAuth Configuration
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Backend Configuration
ADMIN_API_PORT=8001
ADMIN_SESSION_HOURS=8
ADMIN_ALLOWED_ORIGIN=https://${DOMAIN}

# Go Services Configuration
USE_GO_TELEMETRY_SERVICE=true
USE_GO_PASSWORD_SERVICE=true
USE_GO_IMAGE_SERVICE=true
USE_GO_WORKER_SERVICE=true

# SMTP Configuration (update with your email settings)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@stephenasatsa.com
EOF
    
    chmod 600 "$INSTALL_DIR/.env.production"
    chown www-data:www-data "$INSTALL_DIR/.env.production"
    
    log "Environment file created"
}

# Configure nginx
configure_nginx() {
    log "Configuring nginx..."
    
    # Backup original config
    cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup 2>/dev/null || true
    
    # Create nginx configuration
    cat > /etc/nginx/sites-available/${PROJECT_NAME} << EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Admin panel
    location /admin {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location /_next/static {
        alias ${INSTALL_DIR}/apps/website/.next/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# SSL redirect (will be configured by certbot)
# server {
#     listen 443 ssl http2;
#     server_name ${DOMAIN} www.${DOMAIN};
#     
#     ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
#     
#     include /etc/letsencrypt/options-ssl-nginx.conf;
#     ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
#     
#     location / {
#         proxy_pass http://localhost:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_cache_bypass $http_upgrade;
#     }
# }
EOF
    
    # Enable site
    ln -sf /etc/nginx/sites-available/${PROJECT_NAME} /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test nginx configuration
    nginx -t
    
    # Start nginx
    systemctl enable nginx
    systemctl start nginx
    
    log "Nginx configured"
}

# Install systemd services
install_services() {
    log "Installing systemd services..."
    
    # Copy service files
    cp "$INSTALL_DIR/production/systemd/"*.service /etc/systemd/system/
    
    # Update paths in service files
    sed -i "s|/opt/stephenasatsa|${INSTALL_DIR}|g" /etc/systemd/system/${PROJECT_NAME}-*.service
    
    # Reload systemd
    systemctl daemon-reload
    
    # Enable services
    systemctl enable ${PROJECT_NAME}-frontend
    systemctl enable ${PROJECT_NAME}-backend
    systemctl enable ${PROJECT_NAME}-go-password
    systemctl enable ${PROJECT_NAME}-go-telemetry
    systemctl enable ${PROJECT_NAME}-go-image
    systemctl enable ${PROJECT_NAME}-go-worker
    
    log "Systemd services installed"
}

# Setup firewall
setup_firewall() {
    log "Setting up firewall..."
    
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 'Nginx Full'
    ufw --force enable
    
    log "Firewall configured"
}

# Start services
start_services() {
    log "Starting services..."
    
    # Start backend first
    systemctl start ${PROJECT_NAME}-backend
    sleep 5
    
    # Start Go services
    systemctl start ${PROJECT_NAME}-go-password
    systemctl start ${PROJECT_NAME}-go-telemetry
    systemctl start ${PROJECT_NAME}-go-image
    systemctl start ${PROJECT_NAME}-go-worker
    sleep 5
    
    # Start frontend
    systemctl start ${PROJECT_NAME}-frontend
    
    log "Services started"
}

# Setup SSL certificate
setup_ssl() {
    if [[ "$DOMAIN" != "localhost" ]]; then
        log "Setting up SSL certificate for ${DOMAIN}..."
        
        # Check if certbot is available
        if command -v certbot &> /dev/null; then
            # Stop nginx temporarily to allow certbot to use port 80
            systemctl stop nginx
            
            # Obtain SSL certificate
            certbot certonly --standalone -d "${DOMAIN}" -d "www.${DOMAIN}" --agree-tos --non-interactive --email "admin@${DOMAIN}" || {
                warn "SSL certificate setup failed, continuing without SSL"
                systemctl start nginx
                return
            }
            
            # Start nginx again
            systemctl start nginx
            
            # Update nginx config to use SSL
            cat > /etc/nginx/sites-available/${PROJECT_NAME} << EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};
    
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8001/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Admin panel
    location /admin {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Static files
    location /_next/static {
        alias ${INSTALL_DIR}/apps/website/.next/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
            
            # Reload nginx
            nginx -t && systemctl reload nginx
            
            # Setup auto-renewal
            (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --nginx") | crontab -
            
            log "SSL certificate installed and configured"
        else
            warn "Certbot not found, skipping SSL setup"
        fi
    else
        log "Using localhost, skipping SSL setup"
    fi
}

# Health check
health_check() {
    log "Performing health checks..."
    
    # Check services
    services=("${PROJECT_NAME}-frontend" "${PROJECT_NAME}-backend" "nginx" "postgresql")
    for service in "${services[@]}"; do
        if systemctl is-active --quiet "$service"; then
            log "✓ $service is running"
        else
            warn "✗ $service is not running"
        fi
    done
    
    # Check website
    if curl -s --max-time 10 -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|307"; then
        log "✓ Website is responding"
    else
        warn "✗ Website is not responding (may still be starting)"
    fi
    
    log "Health checks completed"
}

# Print summary
print_summary() {
    local protocol="http"
    local ssl_status="Not configured"
    
    if [[ "$DOMAIN" != "localhost" ]] && [[ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]]; then
        protocol="https"
        ssl_status="Configured and active"
    fi
    
    echo ""
    echo -e "${GREEN}=== Installation Summary ===${NC}"
    echo -e "Project Directory: ${BLUE}${INSTALL_DIR}${NC}"
    echo -e "Domain: ${BLUE}${DOMAIN}${NC}"
    echo -e "SSL Status: ${BLUE}${ssl_status}${NC}"
    echo -e "Website URL: ${BLUE}${protocol}://${DOMAIN}${NC}"
    echo -e "Admin URL: ${BLUE}${protocol}://${DOMAIN}/admin${NC}"
    echo -e "Database: ${BLUE}${DB_NAME}${NC}"
    echo -e "Database User: ${BLUE}${DB_USER}${NC}"
    echo -e "Database Password: ${YELLOW}${DB_PASSWORD}${NC}"
    echo -e "Admin Password: ${YELLOW}${ADMIN_PASSWORD}${NC}"
    echo ""
    echo -e "${GREEN}=== Service Management ===${NC}"
    echo -e "Status: ${BLUE}systemctl status ${PROJECT_NAME}-*${NC}"
    echo -e "Logs: ${BLUE}journalctl -u ${PROJECT_NAME}-* -f${NC}"
    echo -e "Restart Frontend: ${BLUE}systemctl restart ${PROJECT_NAME}-frontend${NC}"
    echo -e "Restart Backend: ${BLUE}systemctl restart ${PROJECT_NAME}-backend${NC}"
    echo ""
    echo -e "${GREEN}=== Important Files ===${NC}"
    echo -e "Environment: ${BLUE}${INSTALL_DIR}/.env.production${NC}"
    echo -e "Nginx Config: ${BLUE}/etc/nginx/sites-available/${PROJECT_NAME}${NC}"
    echo -e "Install Log: ${BLUE}${LOG_FILE}${NC}"
    echo ""
    
    if [[ "$DOMAIN" == "localhost" ]]; then
        echo -e "${YELLOW}=== Local Development ===${NC}"
        echo "You are using localhost. To use a custom domain:"
        echo "1. Update DNS to point your domain to this server"
        echo "2. Run: sudo certbot --nginx -d yourdomain.com"
        echo "3. Update DOMAIN in ${INSTALL_DIR}/.env.production"
    else
        echo -e "${YELLOW}=== Production Setup ===${NC}"
        if [[ "$ssl_status" == "Not configured" ]]; then
            echo "SSL not configured. To setup SSL:"
            echo "1. Ensure DNS points to this server"
            echo "2. Run: sudo certbot --nginx -d ${DOMAIN}"
        fi
        echo "3. Configure your SMTP settings in ${INSTALL_DIR}/.env.production"
        echo "4. Change the admin password in ${INSTALL_DIR}/.env.production"
    fi
    echo ""
}

# Cleanup function
cleanup() {
    if [[ $? -ne 0 ]]; then
        warn "Installation failed, check logs at ${LOG_FILE}"
    fi
}

# Main installation function
main() {
    # Setup trap for cleanup
    trap cleanup EXIT
    
    # Display banner
    echo -e "${BLUE}"
    echo "======================================"
    echo "  Stephen Asatsa Website Installer  "
    echo "======================================"
    echo -e "${NC}"
    
    # Run installation steps
    check_root
    get_domain
    install_system_deps
    install_nodejs
    setup_database
    setup_project
    create_env_file
    install_frontend
    install_backend
    configure_nginx
    install_services
    setup_firewall
    start_services
    setup_ssl
    health_check
    print_summary
    
    log "Installation completed successfully!"
}

# Run main function
main "$@"
