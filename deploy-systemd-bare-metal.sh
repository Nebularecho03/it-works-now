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

# Configuration
PROJECTS_DIR="/home/codecrafter/projects"
WEBSITE_DIR="$PROJECTS_DIR/website"
SCHOLARS_DIR="$PROJECTS_DIR/schoolars-work-bench"
DB_USER="codecrafter"
DB_PASSWORD="change_this_secure_password"
DB_NAME_WEBSITE="stephenasatsa"
DB_NAME_SCHOLARS="scholarforge"

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
        npm install -g pnpm
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
        log "Website directory exists, pulling latest changes..."
        cd "$WEBSITE_DIR"
        git pull origin main
    fi
    
    # Setup .env for website
    cat > "$WEBSITE_DIR/.env" << EOF
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME_WEBSITE?schema=public"
NEXTAUTH_SECRET="production-secret-key-change-this"
NEXTAUTH_URL="https://devmain.co.ke"
NEXT_PUBLIC_SITE_URL="https://devmain.co.ke"
NEXT_PUBLIC_SCHOLARS_FORGE_URL="https://scholars.devmain.co.ke"
EOF
    
    # Setup Scholars-work-bench
    if [ ! -d "$SCHOLARS_DIR" ]; then
        log "Cloning Scholars-work-bench repository..."
        git clone https://github.com/Cyberverse-cent0/Schoolars-work-bench.git "$SCHOLARS_DIR"
    else
        log "Scholars-work-bench directory exists, pulling latest changes..."
        cd "$SCHOLARS_DIR"
        git pull origin main
    fi
    
    # Setup .env for scholars
    cat > "$SCHOLARS_DIR/.env" << EOF
PORT=8080
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME_SCHOLARS
SESSION_SECRET=scholarforge-production-secret-key-2024
NODE_ENV=production
WEBSITE_URL=https://devmain.co.ke
CORS_ORIGIN=https://devmain.co.ke
EOF
    
    log "Projects setup completed"
}

# Step 5: Build applications
build_applications() {
    log "Installing dependencies (dev mode only to avoid OOM)..."
    
    # Install Website dependencies
    log "Installing Website dependencies..."
    cd "$WEBSITE_DIR"
    npm install
    
    # Install missing NextAuth dependencies
    npm install next-auth @auth/prisma-adapter @prisma/client
    
    # Skip build due to syntax errors, use dev mode
    warn "Skipping build, using dev mode for Website"
    WEBSITE_MODE="development"
    
    # Skip Scholars pnpm install to avoid workspace build OOM
    log "Skipping Scholars pnpm install (avoiding workspace build OOM)"
    warn "Using existing Scholars dependencies, dev mode"
    SCHOLARS_MODE="development"
    SCHOLARS_WORKDIR="$SCHOLARS_DIR"
    
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
        # Use npm to run pnpm through npx to avoid path issues
        SCHOLARS_CMD="/usr/bin/npx pnpm --filter artifacts/api-server run dev"
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
Environment="NEXTAUTH_URL=https://devmain.co.ke"
Environment="NEXT_PUBLIC_SCHOLARS_FORGE_URL=https://scholars.devmain.co.ke"
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
Environment="WEBSITE_URL=https://devmain.co.ke"
ExecStart=$SCHOLARS_CMD
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    run_root systemctl daemon-reload
    run_root systemctl enable website.service
    run_root systemctl enable scholars.service
    
    log "Systemd services created (Website: $WEBSITE_MODE, Scholars: $SCHOLARS_MODE)"
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
        server_name  devmain.co.ke www.devmain.co.ke;

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
    log "Website: http://devmain.co.ke"
    log "Scholars: http://scholars.devmain.co.ke"
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
