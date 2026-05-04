#!/bin/bash

# Automated Deployment Script for Both Projects
# Website (Next.js + Python) and Scholars Forge (Node.js + React)
# Supports Debian/Ubuntu, Arch Linux, and Fedora

set -e

# Source OS detection library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/../../docs/setup/scripts/utilities/os-detect.sh" ]; then
    source "$SCRIPT_DIR/../../docs/setup/scripts/utilities/os-detect.sh"
else
    echo "Error: os-detect.sh not found in expected locations"
    exit 1
fi

# Detect OS
need_sudo() { [ "$(id -u)" -ne 0 ]; }

# Detect if systemd is available
has_systemd() {
    if command -v systemctl &> /dev/null && systemctl --version &> /dev/null; then
        # Check if systemd is actually running (not just installed)
        if systemctl is-system-running &> /dev/null; then
            return 0
        fi
    fi
    return 1
}

# Configuration
DOMAIN_NAME="${DOMAIN_NAME:-your-domain.com}"
SCHOLARS_PATH="${SCHOLARS_PATH:-/scholars}"
PROJECTS_DIR="$HOME/projects"
WEBSITE_DIR="$PROJECTS_DIR/apps/website"
SCHOLARS_DIR="$PROJECTS_DIR/apps/scholars-forge"
WEBSITE_REPO="https://github.com/kibirastephengichigi-bit/website.git"
SCHOLARS_REPO="https://github.com/Cyberverse-cent0/combined-project.git"
DB_USER="codecrafter"
DB_PASSWORD="${DB_PASSWORD:-change_this_secure_password}"
DB_NAME_WEBSITE="stephenasatsa"
DB_NAME_SCHOLARS="scholarforge"

# Auto-detect deployment mode based on systemd availability
if [ -z "$DEPLOYMENT_MODE" ]; then
    if has_systemd; then
        DEPLOYMENT_MODE="systemd"
        log "Systemd detected, using systemd deployment mode"
    else
        DEPLOYMENT_MODE="pm2"
        log "Systemd not detected, falling back to PM2 deployment mode"
    fi
else
    DEPLOYMENT_MODE="${DEPLOYMENT_MODE:-systemd}"  # Options: pm2, systemd, docker
fi

# Step 1: Install system dependencies (using OS detection library)
install_system_deps_custom() {
    install_system_deps
    
    # Install pnpm globally if not already installed by the library
    if ! command -v pnpm &> /dev/null; then
        log "Installing pnpm..."
        npm install -g pnpm
    fi
    
    # Install PM2 if using PM2 deployment mode
    if [ "$DEPLOYMENT_MODE" = "pm2" ]; then
        if ! command -v pm2 &> /dev/null; then
            log "Installing PM2..."
            sudo npm install -g pm2
        fi
    fi
}

# Step 2: Setup PostgreSQL databases (using OS detection library)
setup_databases_custom() {
    if has_systemd; then
        setup_databases "$DB_USER" "$DB_PASSWORD" "$DB_NAME_WEBSITE" "$DB_NAME_SCHOLARS"
    else
        log "Systemd not available, using service command for PostgreSQL..."
        # Detect PostgreSQL version
        PG_VERSION=$(pg_config --version 2>/dev/null | awk '{print $2}' | cut -d. -f1)
        if [ -z "$PG_VERSION" ]; then
            # Try to detect from installed packages
            PG_VERSION=$(dpkg -l | grep postgresql | grep -E "postgresql-[0-9]" | head -1 | awk '{print $2}' | cut -d- -f2 | cut -d. -f1)
        fi
        if [ -z "$PG_VERSION" ]; then
            PG_VERSION="15"  # Default to version 15 for Debian 12
        fi
        log "Detected PostgreSQL version: $PG_VERSION"
        
        # Start PostgreSQL with service command
        if command -v service &> /dev/null; then
            sudo service postgresql start
        elif command -v pg_ctlcluster &> /dev/null; then
            sudo pg_ctlcluster $PG_VERSION main start
        else
            warn "Could not start PostgreSQL automatically, please start it manually"
        fi
        
        # Setup databases without systemd
        log "Setting up PostgreSQL databases..."
        sleep 2
        
        # Create databases
        if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME_WEBSITE; then
            sudo -u postgres psql -c "CREATE DATABASE $DB_NAME_WEBSITE;"
            log "Created database $DB_NAME_WEBSITE"
        else
            warn "Database $DB_NAME_WEBSITE already exists"
        fi
        
        if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME_SCHOLARS; then
            sudo -u postgres psql -c "CREATE DATABASE $DB_NAME_SCHOLARS;"
            log "Created database $DB_NAME_SCHOLARS"
        else
            warn "Database $DB_NAME_SCHOLARS already exists"
        fi
        
        # Create user if not exists
        if ! sudo -u postgres psql -c "\du" | grep -qw $DB_USER; then
            sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
            log "Created database user $DB_USER"
        else
            warn "Database user $DB_USER already exists"
        fi
        
        # Grant privileges
        sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME_WEBSITE TO $DB_USER;"
        sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME_SCHOLARS TO $DB_USER;"
        
        log "Database setup completed"
    fi
}

# Step 3: Clone and setup Website project
setup_website() {
    log "Setting up Website project..."
    
    if [ ! -d "$WEBSITE_DIR" ]; then
        log "Cloning Website repository..."
        git clone "$WEBSITE_REPO" "$WEBSITE_DIR"
    else
        log "Website directory exists, pulling latest changes..."
        cd "$WEBSITE_DIR"
        git pull
    fi
    
    cd "$WEBSITE_DIR"
    
    # Setup .env
    if [ ! -f .env ]; then
        cp .env.example .env
        sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME_WEBSITE|" .env
        sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=http://$DOMAIN_NAME|" .env
        warn "Please update NEXTAUTH_SECRET in $WEBSITE_DIR/.env"
    else
        # Update NEXTAUTH_URL in existing .env
        sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=http://$DOMAIN_NAME|" .env
    fi
    
    # Install Node dependencies
    log "Installing Website Node dependencies..."
    npm install --legacy-peer-deps
    
    # Build frontend (skip if fails, will run in dev mode)
    log "Building Website frontend..."
    if ! npm run build; then
        warn "Build failed, will run in development mode instead"
        # Modify systemd service to use dev mode
        DEV_MODE=true
    fi
    
    # Setup Python backend
    log "Setting up Python backend..."
    cd "$WEBSITE_DIR/backend"
    if [ ! -d venv ]; then
        python3 -m venv venv
    fi
    source venv/bin/activate
    pip install -r requirements.txt
    deactivate
    
    log "Website project setup completed"
}

# Step 4: Clone and setup Schoolars-work-bench project
setup_scholars() {
    log "Setting up Schoolars-work-bench project..."
    
    if [ ! -d "$SCHOLARS_DIR" ]; then
        log "Cloning Schoolars-work-bench repository..."
        git clone "$SCHOLARS_REPO" "$SCHOLARS_DIR"
    else
        log "Schoolars-work-bench directory exists, pulling latest changes..."
        cd "$SCHOLARS_DIR"
        git pull
    fi
    
    cd "$SCHOLARS_DIR"
    
    # Setup .env
    if [ ! -f .env ]; then
        cp .env.example .env
        sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME_SCHOLARS|" .env
        sed -i "s|NODE_ENV=.*|NODE_ENV=production|" .env
        sed -i "s|BASE_PATH=.*|BASE_PATH=$SCHOLARS_PATH|" .env
        warn "Please update SESSION_SECRET, GOOGLE_CLIENT_ID, and YAHOO credentials in $SCHOLARS_DIR/.env"
    else
        # Update BASE_PATH in existing .env
        sed -i "s|BASE_PATH=.*|BASE_PATH=$SCHOLARS_PATH|" .env
    fi
    
    # Install dependencies with pnpm (skip build)
    log "Installing Schoolars-work-bench dependencies..."
    cd "$SCHOLARS_DIR"
    pnpm install --ignore-scripts
    
    # Build API server only
    cd "$SCHOLARS_DIR/artifacts/api-server"
    pnpm install
    pnpm build
    
    log "Schoolars-work-bench project setup completed"
}

# Step 5: Create systemd services or PM2 ecosystem
create_systemd_services() {
    if [ "$DEPLOYMENT_MODE" = "pm2" ]; then
        log "Creating PM2 ecosystem configuration..."
        create_pm2_ecosystem
    else
        log "Creating systemd services..."
        create_systemd_services_impl
    fi
}

create_pm2_ecosystem() {
    log "Setting up PM2 ecosystem for both projects..."
    
    # Copy ecosystem configs to projects
    cp /home/codecrafter/Documents/combined/ecosystem.config.js "$WEBSITE_DIR/" 2>/dev/null || true
    cp /home/codecrafter/Documents/combined/ecosystem.config.js "$SCHOLARS_DIR/" 2>/dev/null || true
    
    # Create PM2 startup script
    cat > "$WEBSITE_DIR/start-pm2.sh" << 'EOF'
#!/bin/bash
cd /home/codecrafter/Documents/combined
./start-pm2.sh
EOF
    chmod +x "$WEBSITE_DIR/start-pm2.sh"
    
    log "PM2 ecosystem configured"
}

create_systemd_services_impl() {
    log "Creating systemd services..."
    
    # Website frontend service
    if [ "${DEV_MODE:-false}" = "true" ]; then
        cat > /tmp/website-frontend.service << EOF
[Unit]
Description=Website Frontend Next.js (Dev Mode)
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$WEBSITE_DIR
Environment=NODE_ENV=development
Environment=PORT=3000
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    else
        cat > /tmp/website-frontend.service << EOF
[Unit]
Description=Website Frontend Next.js
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$WEBSITE_DIR
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    fi
    
    # Website backend service
    cat > /tmp/website-backend.service << EOF
[Unit]
Description=Website Backend Python API
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$WEBSITE_DIR/backend
Environment=PATH=$WEBSITE_DIR/backend/venv/bin
EnvironmentFile=$WEBSITE_DIR/backend/.env
ExecStart=$WEBSITE_DIR/backend/venv/bin/python server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    # Scholars service (API server only)
    cat > /tmp/scholars.service << EOF
[Unit]
Description=ScholarForge API Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$SCHOLARS_DIR/artifacts/api-server
Environment=NODE_ENV=production
Environment=PORT=8080
Environment=DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME_SCHOLARS
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    # Install services
    run_root cp /tmp/website-frontend.service /etc/systemd/system/
    run_root cp /tmp/website-backend.service /etc/systemd/system/
    run_root cp /tmp/scholars.service /etc/systemd/system/
    run_root systemctl daemon-reload
    
    log "Systemd services created"
}

# Step 6: Configure Nginx
configure_nginx() {
    log "Configuring Nginx with single-domain integration..."
    
    # Use the new nginx configuration
    NGINX_CONF_SOURCE="$SCRIPT_DIR/nginx.conf"
    NGINX_CONF_DEST="/etc/nginx/sites-available/combined"
    NGINX_CONF_ENABLED="/etc/nginx/sites-enabled/combined"
    
    if [ ! -f "$NGINX_CONF_SOURCE" ]; then
        error "nginx.conf not found at $NGINX_CONF_SOURCE"
        exit 1
    fi
    
    # Install nginx if not present
    if ! command -v nginx &> /dev/null; then
        log "Installing nginx..."
        run_root apt update
        run_root apt install -y nginx
    fi
    
    # Create certbot directory for Let's Encrypt
    run_root mkdir -p /var/www/certbot
    run_root chown -R www-data:www-data /var/www/certbot
    
    # Backup existing nginx configuration
    if [ -f "$NGINX_CONF_DEST" ]; then
        log "Backing up existing nginx configuration..."
        run_root cp "$NGINX_CONF_DEST" "${NGINX_CONF_DEST}.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Copy and customize nginx configuration
    log "Installing nginx configuration..."
    sed "s/your-domain.com/$DOMAIN_NAME/g" "$NGINX_CONF_SOURCE" | run_root tee "$NGINX_CONF_DEST" > /dev/null
    
    # Create symbolic link to enable site
    log "Enabling site..."
    run_root ln -sf "$NGINX_CONF_DEST" "$NGINX_CONF_ENABLED"
    
    # Remove default nginx site if it exists
    if [ -L "/etc/nginx/sites-enabled/default" ]; then
        log "Removing default nginx site..."
        run_root rm /etc/nginx/sites-enabled/default
    fi
    
    # Test nginx configuration
    log "Testing nginx configuration..."
    run_root nginx -t
    
    # Restart nginx
    log "Restarting nginx..."
    run_root systemctl restart nginx
    
    log "Nginx configured with single-domain integration"
    log "Service endpoints:"
    log "  - Main website: http://$DOMAIN_NAME"
    log "  - Admin panel: http://$DOMAIN_NAME/admin"
    log "  - Scholar Forge: http://$DOMAIN_NAME/scholars"
    log "  - Admin API: http://$DOMAIN_NAME/api/"
    log "  - Scholars API: http://$DOMAIN_NAME/scholars-api/"
    
    # Ask about SSL certificate
    log ""
    log "To set up SSL with Let's Encrypt, run:"
    log "  sudo ./setup-nginx.sh"
    log "or manually:"
    log "  sudo certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME"
}

# Step 7: Start services
start_services() {
    log "Starting services..."
    
    if [ "$DEPLOYMENT_MODE" = "pm2" ]; then
        log "Starting services with PM2..."
        cd /home/codecrafter/Documents/combined
        ./start-pm2.sh
    else
        run_root systemctl enable website-frontend website-backend scholars
        run_root systemctl start website-frontend website-backend scholars
        
        sleep 5
        
        log "Checking service status..."
        run_root systemctl status website-frontend --no-pager || true
        run_root systemctl status website-backend --no-pager || true
        run_root systemctl status scholars --no-pager || true
    fi
    
    log "Services started"
}

# Step 8: Configure firewall (using OS detection library)
configure_firewall_custom() {
    configure_firewall
}

# Main execution
main() {
    log "Starting automated deployment for both projects..."
    log "Projects directory: $PROJECTS_DIR"
    log "Database user: $DB_USER"
    log "Deployment mode: $DEPLOYMENT_MODE"
    
    # Detect operating system
    detect_os
    
    # Create projects directory
    mkdir -p "$PROJECTS_DIR"
    
    # Run all steps
    install_system_deps_custom
    setup_databases_custom
    setup_website
    setup_scholars
    create_systemd_services
    configure_nginx
    configure_firewall_custom
    start_services
    
    log ""
    log "=== Deployment Completed Successfully ==="
    log ""
    log "Website: http://$DOMAIN_NAME"
    log "Scholars: http://$DOMAIN_NAME$SCHOLARS_PATH"
    log ""
    
    if [ "$DEPLOYMENT_MODE" = "pm2" ]; then
        log "PM2 Management:"
        log "  cd /home/codecrafter/Documents/combined"
        log "  pm2 status"
        log "  pm2 logs"
        log "  pm2 restart all"
        log ""
        log "View logs:"
        log "  pm2 logs"
    else
        log "Service management:"
        log "  sudo systemctl status website-frontend website-backend scholars"
        log "  sudo systemctl restart website-frontend website-backend scholars"
        log ""
        log "View logs:"
        log "  sudo journalctl -u website-frontend -f"
        log "  sudo journalctl -u website-backend -f"
        log "  sudo journalctl -u scholars -f"
    fi
    
    log ""
    warn "IMPORTANT: Update these environment variables with production values:"
    warn "  - $WEBSITE_DIR/.env (NEXTAUTH_SECRET)"
    warn "  - $SCHOLARS_DIR/.env (SESSION_SECRET, GOOGLE_CLIENT_ID, YAHOO credentials)"
    warn "  - Database password (currently: $DB_PASSWORD)"
}

main
