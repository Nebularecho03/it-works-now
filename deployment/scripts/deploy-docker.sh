#!/bin/bash

# Docker-based Deployment Script for Both Projects
# Uses Docker Compose to avoid build issues
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
SCHOLARS_SUBDOMAIN="${SCHOLARS_SUBDOMAIN:-scholars}"
PROJECTS_DIR="$HOME/projects"
WEBSITE_DIR="$PROJECTS_DIR/website"
SCHOLARS_DIR="$PROJECTS_DIR/schoolars-work-bench"
WEBSITE_REPO="https://github.com/kibirastephengichigi-bit/website.git"
SCHOLARS_REPO="https://github.com/Cyberverse-cent0/Schoolars-work-bench.git"
DB_USER="codecrafter"
DB_PASSWORD="${DB_PASSWORD:-change_this_secure_password}"
DB_NAME_WEBSITE="stephenasatsa"
DB_NAME_SCHOLARS="scholarforge"
DEPLOYMENT_MODE="${DEPLOYMENT_MODE:-docker}"  # Options: pm2, docker

# Step 1: Stop existing services
stop_existing_services() {
    log "Stopping existing services..."
    
    # Stop systemd services if available
    if has_systemd; then
        run_root systemctl stop website-frontend website-backend scholars 2>/dev/null || true
        run_root systemctl disable website-frontend website-backend scholars 2>/dev/null || true
    else
        log "Systemd not available, skipping systemd service stop"
    fi
    
    # Stop Docker containers
    cd "$WEBSITE_DIR" 2>/dev/null && docker compose down 2>/dev/null || true
    cd "$SCHOLARS_DIR" 2>/dev/null && docker compose down 2>/dev/null || true
    
    log "Existing services stopped"
}

# Step 2: Setup PostgreSQL databases (using OS detection library)
setup_databases_custom() {
    if has_systemd; then
        setup_databases "$DB_USER" "$DB_PASSWORD" "$DB_NAME_WEBSITE" "$DB_NAME_SCHOLARS"
    else
        log "Systemd not available, using service command for PostgreSQL..."
        # Start PostgreSQL with service command
        if command -v service &> /dev/null; then
            run_root service postgresql start
        elif command -v pg_ctlcluster &> /dev/null; then
            run_root pg_ctlcluster 16 main start
        else
            warn "Could not start PostgreSQL automatically, please start it manually"
        fi
        
        # Setup databases without systemd
        log "Setting up PostgreSQL databases..."
        sleep 2
        
        # Create databases
        if ! run_root -u postgres psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME_WEBSITE; then
            run_root -u postgres psql -c "CREATE DATABASE $DB_NAME_WEBSITE;"
            log "Created database $DB_NAME_WEBSITE"
        else
            warn "Database $DB_NAME_WEBSITE already exists"
        fi
        
        if ! run_root -u postgres psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME_SCHOLARS; then
            run_root -u postgres psql -c "CREATE DATABASE $DB_NAME_SCHOLARS;"
            log "Created database $DB_NAME_SCHOLARS"
        else
            warn "Database $DB_NAME_SCHOLARS already exists"
        fi
        
        # Create user if not exists
        if ! run_root -u postgres psql -c "\du" | grep -qw $DB_USER; then
            run_root -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
            log "Created database user $DB_USER"
        else
            warn "Database user $DB_USER already exists"
        fi
        
        # Grant privileges
        run_root -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME_WEBSITE TO $DB_USER;"
        run_root -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME_SCHOLARS TO $DB_USER;"
        
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
        sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@postgres:5432/$DB_NAME_WEBSITE|" .env
        sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=https://$DOMAIN_NAME|" .env
        warn "Please update NEXTAUTH_SECRET in $WEBSITE_DIR/.env"
    fi
    
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
        sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@postgres:5432/$DB_NAME_SCHOLARS|" .env
        sed -i "s|NODE_ENV=.*|NODE_ENV=production|" .env
        warn "Please update SESSION_SECRET, GOOGLE_CLIENT_ID, and YAHOO credentials in $SCHOLARS_DIR/.env"
    fi
    
    log "Schoolars-work-bench project setup completed"
}

# Step 5: Configure Docker Compose for Website
configure_website_docker() {
    log "Configuring Docker Compose for Website..."
    
    cd "$WEBSITE_DIR"
    
    # Create production-mode Dockerfile for the website
    cat > Dockerfile.prod << EOF
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the application
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
EOF
    
    # Update docker-compose.yml to use production mode
    cat > docker-compose.yml << EOF
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    ports:
      - "0.0.0.0:3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@172.17.0.1:5432/$DB_NAME_WEBSITE
      - NEXTAUTH_URL=https://$DOMAIN_NAME
      - NEXT_PUBLIC_SCHOLARS_FORGE_URL=https://$SCHOLARS_SUBDOMAIN.$DOMAIN_NAME
    env_file:
      - .env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
EOF
    
    log "Website Docker Compose configured"
}

# Step 6: Configure Docker Compose for Schoolars-work-bench
configure_scholars_docker() {
    log "Configuring Docker Compose for Schoolars-work-bench..."
    
    cd "$SCHOLARS_DIR"
    
    # Create pnpm-based Dockerfile for API server (workspace package)
    cat > artifacts/api-server/Dockerfile.pnpm << EOF
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root workspace files for pnpm to resolve workspace dependencies
COPY ../../package.json ../../pnpm-lock.yaml ./

# Copy api-server package.json
COPY package.json ./

# Install dependencies using pnpm from workspace root
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Build the application (skip typecheck, build only API server)
RUN pnpm --filter artifacts/api-server run build

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "dist/index.mjs"]
EOF
    
    # Create simple docker-compose.yml for API server only
    cat > docker-compose.yml << EOF
services:
  api:
    build:
      context: .
      dockerfile: artifacts/api-server/Dockerfile.pnpm
    ports:
      - "0.0.0.0:8080:8080"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@172.17.0.1:5432/$DB_NAME_SCHOLARS
      - PORT=8080
      - WEBSITE_URL=https://$DOMAIN_NAME
    env_file:
      - .env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:8080/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
EOF
    
    log "Schoolars-work-bench Docker Compose configured"
}

# Step 7: Configure Nginx
configure_nginx() {
    log "Configuring Nginx with path-based routing..."
    
    # Single server block with path-based routing
    cat > /tmp/nginx.conf << 'EOF'
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
    
    # Install Nginx config
    run_root cp /tmp/nginx.conf /etc/nginx/nginx.conf
    
    # Test and reload Nginx
    run_root nginx -t
    run_root systemctl reload nginx
    run_root systemctl enable nginx
    
    log "Nginx configured with path-based routing"
}

# Step 8: Start Docker containers
start_containers() {
    log "Starting Docker containers..."
    
    # Start Website
    cd "$WEBSITE_DIR"
    docker compose up -d --build
    
    # Start Schoolars-work-bench
    cd "$SCHOLARS_DIR"
    docker compose up -d --build
    
    sleep 10
    
    log "Checking container status..."
    docker ps
    
    # Verify containers are healthy
    log "Verifying container health..."
    sleep 20
    
    # Check website container
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        log "Website container is responding"
    else
        warn "Website container may not be ready yet"
    fi
    
    # Check scholars container
    if curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
        log "Scholars container is responding"
    else
        warn "Scholars container may not be ready yet"
    fi
    
    log "Docker containers started"
}

# Step 1: Install system dependencies (using OS detection library)
install_system_deps_custom() {
    install_system_deps
    
    # Install Docker
    install_docker
    
    # Install pnpm globally if not already installed by the library
    if ! command -v pnpm &> /dev/null; then
        log "Installing pnpm..."
        npm install -g pnpm
    fi
}

# Step 9: Configure firewall (using OS detection library)
configure_firewall_custom() {
    configure_firewall
}

# Main execution
main() {
    log "Starting Docker-based deployment for both projects..."
    log "Projects directory: $PROJECTS_DIR"
    
    # Detect operating system
    detect_os
    
    # Create projects directory
    mkdir -p "$PROJECTS_DIR"
    
    # Run all steps
    install_system_deps_custom
    stop_existing_services
    setup_databases_custom
    setup_website
    setup_scholars
    configure_website_docker
    configure_scholars_docker
    configure_nginx
    configure_firewall_custom
    start_containers
    
    log ""
    log "=== Docker Deployment Completed Successfully ==="
    log ""
    log "Website: https://$DOMAIN_NAME"
    log "Scholars: https://$SCHOLARS_SUBDOMAIN.$DOMAIN_NAME"
    log ""
    log "Container management:"
    log "  cd $WEBSITE_DIR && docker-compose logs -f"
    log "  cd $SCHOLARS_DIR && docker-compose logs -f"
    log ""
    log "To stop containers:"
    log "  cd $WEBSITE_DIR && docker-compose down"
    log "  cd $SCHOLARS_DIR && docker-compose down"
    log ""
    warn "IMPORTANT: Update these environment variables with production values:"
    warn "  - $WEBSITE_DIR/.env (NEXTAUTH_SECRET)"
    warn "  - $SCHOLARS_DIR/.env (SESSION_SECRET, GOOGLE_CLIENT_ID, YAHOO credentials)"
    warn "  - Database password (currently: $DB_PASSWORD)"
}

main
