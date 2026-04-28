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
    pnpm install
    cd "$SCHOLARS_DIR/artifacts/api-server"
    pnpm install --filter @workspace/api-server
    
    warn "Using Scholars dev mode"
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
        SCHOLARS_CMD="/usr/local/bin/pnpm run dev"
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
    log "Configuring Nginx with path-based routing..."
    
    # Single server block with path-based routing
    run_root tee /etc/nginx/nginx.conf > /dev/null << 'EOF'
#user http;
worker_processes  1;

#error_log  logs/error.log;
#error_log  logs/error.log  notice;
#error_log  logs/error.log  info;

#pid        logs/nginx.pid;


# Load all installed modules
include modules.d/*.conf;

events {
    worker_connections  1024;
}


http {
    include       mime.types;
    default_type  application/octet-stream;

    #log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
    #                  '$status $body_bytes_sent "$http_referer" '
    #                  '"$http_user_agent" "$http_x_forwarded_for"';

    #access_log  logs/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    #keepalive_timeout  0;
    keepalive_timeout  65;

    #gzip  on;

    # Website upstream
    upstream website_backend {
        server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    # Scholars Forge upstream
    upstream scholars_backend {
        server 127.0.0.1:4500 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    # Main server with path-based routing
    server {
        listen       80;
        server_name  $DOMAIN_NAME www.$DOMAIN_NAME;

        client_max_body_size 100M;

        # Scholars Forge under /scholars path
        location /scholars {
            proxy_pass http://scholars_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
            
            proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
            proxy_next_upstream_tries 2;
        }

        # Main website (root path)
        location / {
            proxy_pass http://website_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
            
            proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
            proxy_next_upstream_tries 2;
        }
    }

    # Default localhost server (fallback)
    server {
        listen       80;
        server_name  localhost;

        location / {
            root   /usr/share/nginx/html;
            index  index.html index.htm;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   /usr/share/nginx/html;
        }
    }
}
EOF
    
    run_root nginx -t
    run_root systemctl reload nginx
    run_root systemctl enable nginx
    
    log "Nginx configured with path-based routing"
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
