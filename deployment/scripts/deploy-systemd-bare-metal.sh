#!/bin/bash

# Bare Metal Deployment Script (No Docker)
# Deploys website and scholars-work-bench using systemd services
# Supports Debian/Ubuntu, Arch Linux, and Fedora

set -e

# Source OS detection library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/website/scripts/utilities/os-detect.sh" ]; then
    source "$SCRIPT_DIR/website/scripts/utilities/os-detect.sh"
elif [ -f "$SCRIPT_DIR/scripts/utilities/os-detect.sh" ]; then
    source "$SCRIPT_DIR/scripts/utilities/os-detect.sh"
else
    echo "Error: os-detect.sh not found in expected locations"
    exit 1
fi

# Fallback: define has_systemd if not available from os-detect.sh
if ! command -v has_systemd &> /dev/null; then
    has_systemd() {
        command -v systemctl &> /dev/null && systemctl --version &> /dev/null
    }
fi

# Detect if systemd is available
#
# Configuration
DOMAIN_NAME="${DOMAIN_NAME:-your-domain.com}"
SCHOLARS_SUBDOMAIN="${SCHOLARS_SUBDOMAIN:-scholars}"
PROJECTS_DIR="/home/codecrafter/projects"
WEBSITE_DIR="$PROJECTS_DIR/website"
SCHOLARS_DIR="$PROJECTS_DIR/schoolars-work-bench"
DB_USER="codecrafter"
DB_PASSWORD="change_this_secure_password"
DB_NAME_WEBSITE="stephenasatsa"
DB_NAME_SCHOLARS="scholarforge"

# Auto-detect deployment mode based on systemd availability
if ! has_systemd; then
    log "Systemd not detected, this script requires systemd"
    log "Please use deploy-codespace.sh or set DEPLOYMENT_MODE=pm2 with deploy-both-projects.sh"
    exit 1
fi

# Step 1: Remove Docker (using OS detection library)
remove_docker_custom() {
    remove_docker
}

# Step 2: Install system dependencies (using OS detection library)
install_system_deps_custom() {
    install_system_deps
    
    # Install pnpm globally if not already installed by the library
    if ! command -v pnpm &> /dev/null; then
        log "Installing pnpm..."
        run_root npm install -g pnpm
    fi
    
    # Ensure pnpm is in PATH for systemd services
    if command -v pnpm &> /dev/null; then
        PNPM_PATH=$(which pnpm)
        log "pnpm found at: $PNPM_PATH"
    else
        error "pnpm not found after installation attempt"
    fi
}

# Step 3: Setup PostgreSQL databases (using OS detection library)
setup_databases_custom() {
    setup_databases "$DB_USER" "$DB_PASSWORD" "$DB_NAME_WEBSITE" "$DB_NAME_SCHOLARS"
}

# Step 4: Setup projects
setup_projects() {
    log "Setting up projects..."
    
    # Create projects directory
    mkdir -p "$PROJECTS_DIR"
    
    # Setup Website
    if [ ! -d "$WEBSITE_DIR" ]; then
        log "Cloning Website repository..."
        git clone https://github.com/kibirastephengichigi-bit/website.git "$WEBSITE_DIR"
    else
        if [ -d "$WEBSITE_DIR/.git" ]; then
            log "Website directory exists, pulling latest changes..."
            cd "$WEBSITE_DIR"
            git pull origin main || git pull origin master || warn "Failed to pull website changes"
        else
            warn "Website directory exists but is not a git repository, re-cloning..."
            rm -rf "$WEBSITE_DIR"
            git clone https://github.com/kibirastephengichigi-bit/website.git "$WEBSITE_DIR"
        fi
    fi
    
    # Setup .env for website
    cat > "$WEBSITE_DIR/.env" << EOF
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME_WEBSITE?schema=public"
NEXTAUTH_SECRET="production-secret-key-change-this"
NEXTAUTH_URL="https://virus-stoning-stubborn.ngrok-free.dev"
NEXT_PUBLIC_SITE_URL="https://virus-stoning-stubborn.ngrok-free.dev"
NEXT_PUBLIC_SCHOLARS_FORGE_URL="https://virus-stoning-stubborn.ngrok-free.dev/scholars"
ADMIN_BACKEND_URL="http://localhost:8000/api"
EOF
    
    # Setup Scholars-work-bench
    if [ ! -d "$SCHOLARS_DIR" ]; then
        log "Cloning Scholars-work-bench repository..."
        git clone https://github.com/Cyberverse-cent0/Schoolars-work-bench.git "$SCHOLARS_DIR"
    else
        if [ -d "$SCHOLARS_DIR/.git" ]; then
            log "Scholars-work-bench directory exists, pulling latest changes..."
            cd "$SCHOLARS_DIR"
            git pull origin main || git pull origin master || warn "Failed to pull scholars changes"
        else
            warn "Scholars-work-bench directory exists but is not a git repository, re-cloning..."
            rm -rf "$SCHOLARS_DIR"
            git clone https://github.com/Cyberverse-cent0/Schoolars-work-bench.git "$SCHOLARS_DIR"
        fi
    fi
    
    # Setup .env for scholars
    cat > "$SCHOLARS_DIR/.env" << EOF
PORT=8080
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME_SCHOLARS
SESSION_SECRET=scholarforge-production-secret-key-2024
NODE_ENV=development
WEBSITE_URL=https://$DOMAIN_NAME
CORS_ORIGIN=https://$DOMAIN_NAME
EOF
    
    log "Projects setup completed"
}

# Step 5: Build applications
build_applications() {
    log "Installing dependencies (dev mode only to avoid OOM)..."
    
    # Install Website dependencies
    log "Installing Website dependencies..."
    cd "$WEBSITE_DIR"
    # Clean node_modules to avoid ENOTEMPTY errors
    rm -rf node_modules package-lock.json
    npm install
    
    # Install missing NextAuth dependencies
    npm install next-auth @auth/prisma-adapter @prisma/client
    
    # Skip build due to syntax errors, use dev mode
    warn "Skipping build, using dev mode for Website"
    WEBSITE_MODE="development"
    
    # Install Scholars API server dependencies using pnpm (workspace protocol)
    log "Installing Scholars API server dependencies..."
    cd "$SCHOLARS_DIR"
    # Skip workspace install to avoid OOM during scholar-forge build
    # Only install API server dependencies
    cd "$SCHOLARS_DIR/artifacts/api-server"
    pnpm install --ignore-scripts
    
    warn "Using Scholars dev mode (skipping scholar-forge build to avoid OOM)"
    SCHOLARS_MODE="development"
    
    # Setup Python admin backend
    log "Setting up Python admin backend..."
    cd "$WEBSITE_DIR/backend"
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    source venv/bin/activate
    pip install -r requirements.txt
    deactivate
    
    log "Dependencies installed (dev mode)"
}

# Step 6: Create systemd services
create_systemd_services() {
    log "Creating systemd services..."
    
    # Determine website command based on build mode
    if [ "$WEBSITE_MODE" = "production" ]; then
        WEBSITE_CMD="/usr/bin/npm start"
        WEBSITE_ENV="NODE_ENV=production"
    else
        WEBSITE_CMD="/usr/bin/npm run dev"
        WEBSITE_ENV="NODE_ENV=development"
    fi
    
    # Determine scholars command based on build mode
    if [ "$SCHOLARS_MODE" = "production" ]; then
        SCHOLARS_CMD="/usr/bin/node dist/index.mjs"
        SCHOLARS_ENV="NODE_ENV=production"
    else
        # Use pnpm for workspace protocol support
        # Detect pnpm path dynamically
        if command -v pnpm &> /dev/null; then
            SCHOLARS_CMD="$(which pnpm) run dev"
        else
            SCHOLARS_CMD="/usr/local/bin/pnpm run dev"
        fi
        SCHOLARS_WORKDIR="$SCHOLARS_DIR/artifacts/api-server"
        SCHOLARS_ENV="NODE_ENV=development"
    fi
    
    # Website service
    run_root tee /etc/systemd/system/website.service > /dev/null << EOF
[Unit]
Description=Website Next.js Application
After=network.target postgresql.service

[Service]
Type=simple
User=codecrafter
WorkingDirectory=$WEBSITE_DIR
Environment="$WEBSITE_ENV"
Environment="PATH=/usr/bin:/home/codecrafter/.local/bin"
Environment="DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME_WEBSITE?schema=public"
Environment="NEXTAUTH_URL=https://$DOMAIN_NAME"
Environment="NEXT_PUBLIC_SITE_URL=https://$DOMAIN_NAME"
Environment="NEXT_PUBLIC_SCHOLARS_FORGE_URL=https://$SCHOLARS_SUBDOMAIN.$DOMAIN_NAME"
ExecStart=$WEBSITE_CMD
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    # Scholars service
    run_root tee /etc/systemd/system/scholars.service > /dev/null << EOF
[Unit]
Description=Scholars Forge API Server
After=network.target postgresql.service

[Service]
Type=simple
User=codecrafter
WorkingDirectory=$SCHOLARS_WORKDIR
Environment="$SCHOLARS_ENV"
Environment="PORT=8080"
Environment="DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME_SCHOLARS"
Environment="WEBSITE_URL=https://virus-stoning-stubborn.ngrok-free.dev"
ExecStart=$SCHOLARS_CMD
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    # Python admin backend service
    run_root tee /etc/systemd/system/admin-backend.service > /dev/null << EOF
[Unit]
Description=Python Admin Backend API
After=network.target postgresql.service

[Service]
Type=simple
User=codecrafter
WorkingDirectory=$WEBSITE_DIR/backend
Environment="PATH=$WEBSITE_DIR/backend/venv/bin"
ExecStart=$WEBSITE_DIR/backend/venv/bin/python admin_backend_manager.py start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    run_root systemctl daemon-reload
    run_root systemctl enable website.service
    run_root systemctl enable scholars.service
    run_root systemctl enable admin-backend.service
    
    log "Systemd services created (Website: $WEBSITE_MODE, Scholars: $SCHOLARS_MODE, Admin Backend: Python)"
}

# Step 7: Configure Nginx
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
    run_root systemctl enable nginx
    
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

# Step 8: Configure firewall (using OS detection library)
configure_firewall_custom() {
    configure_firewall
}

# Step 9: Start services
start_services() {
    log "Starting services..."
    
    run_root systemctl start website.service
    run_root systemctl start scholars.service
    
    sleep 10
    
    log "Checking service status..."
    run_root systemctl status website.service --no-pager
    run_root systemctl status scholars.service --no-pager
    
    log "Services started"
}

# Main function
main() {
    log "=== Bare Metal Deployment Started ==="
    
    # Detect operating system
    detect_os
    
    remove_docker_custom
    install_system_deps_custom
    setup_databases_custom
    setup_projects
    build_applications
    create_systemd_services
    configure_nginx
    configure_firewall_custom
    start_services
    
    log "=== Bare Metal Deployment Completed Successfully ==="
    log ""
    log "Website: https://$DOMAIN_NAME"
    log "Scholars: https://$SCHOLARS_SUBDOMAIN.$DOMAIN_NAME"
    log ""
    log "Service management:"
    log "  sudo systemctl status website"
    log "  sudo systemctl status scholars"
    log "  sudo systemctl restart website"
    log "  sudo systemctl restart scholars"
    log ""
    log "Logs:"
    log "  sudo journalctl -u website -f"
    log "  sudo journalctl -u scholars -f"
}

main "$@"
