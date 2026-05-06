#!/bin/bash

# Stephen Asatsa Website Installation Script
# Automatically installs the entire website stack on a new server
# Supports: Ubuntu 20.04+, Debian 11+, CentOS 8+, Arch Linux

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
DB_NAME="stephenasatsa_prod"
DB_USER="stephenasatsa"
DB_PASSWORD=""

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

# Recovery function for failed operations
recover_from_error() {
    local operation="$1"
    local service="$2"
    
    warn "Failed to $operation"
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Installation cancelled by user after $operation failure"
    fi
    
    log "Continuing installation despite $operation failure"
    
    # Try to restart service if specified
    if [[ -n "$service" ]]; then
        log "Attempting to restart $service..."
        systemctl restart "$service" 2>/dev/null || warn "Failed to restart $service"
    fi
}

# Detect operating system and package manager
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
        "CentOS"*|"Red Hat"*)
            PKG_MANAGER="yum"
            PKG_UPDATE="yum update -y"
            PKG_INSTALL="yum install -y"
            ;;
        "Arch Linux")
            PKG_MANAGER="pacman"
            PKG_UPDATE="pacman -Sy --noconfirm"
            PKG_INSTALL="pacman -S --noconfirm"
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

    case $PKG_MANAGER in
        "apt")
            if ! $PKG_UPDATE; then
                recover_from_error "update package lists" ""
            fi
            
            # Install basic packages first
            if ! $PKG_INSTALL curl wget git nginx postgresql postgresql-contrib \
                build-essential python3 python3-pip python3-venv \
                certbot python3-certbot-nginx \
                ufw fail2ban htop; then
                recover_from_error "install system packages" ""
            fi
            
            # Handle Node.js and npm separately to avoid conflicts
            if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
                log "Node.js and npm already installed"
            else
                # Remove conflicting packages if they exist
                $PKG_INSTALL --purge -y npm nodejs 2>/dev/null || true
                # Install Node.js from NodeSource (includes compatible npm)
                if ! curl -fsSL https://deb.nodesource.com/setup_20.x | bash -; then
                    recover_from_error "add NodeSource repository" ""
                fi
                if ! $PKG_INSTALL nodejs; then
                    recover_from_error "install Node.js" ""
                fi
            fi
            ;;
        "yum")
            if ! $PKG_UPDATE; then
                recover_from_error "update package lists" ""
            fi
            
            if ! $PKG_INSTALL curl wget git nginx postgresql-server postgresql-contrib \
                gcc python3 python3-pip \
                nodejs npm certbot python3-certbot-nginx \
                firewalld fail2ban htop; then
                recover_from_error "install system packages" ""
            fi
            ;;
        "pacman")
            if ! $PKG_UPDATE; then
                recover_from_error "update package lists" ""
            fi
            
            if ! $PKG_INSTALL curl wget git nginx postgresql \
                base-devel python python-pip \
                nodejs npm certbot certbot-nginx \
                ufw fail2ban htop; then
                recover_from_error "install system packages" ""
            fi
            ;;
    esac

    log "System dependencies installation completed"
}

# Install Node.js latest LTS
install_nodejs() {
    log "Installing Node.js LTS..."

    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [[ $NODE_VERSION -ge 18 ]]; then
            log "Node.js $(node -v) already installed"
            return
        fi
    fi

    # Install Node.js 18 LTS
    case $PKG_MANAGER in
        "apt")
            curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
            $PKG_INSTALL nodejs
            ;;
        "yum")
            curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
            $PKG_INSTALL nodejs npm
            ;;
        "pacman")
            $PKG_INSTALL nodejs npm
            ;;
    esac

    log "Node.js $(node -v) installed"
}

# Install Go
install_go() {
    log "Installing Go..."

    if command -v go >/dev/null 2>&1; then
        GO_VERSION_INSTALLED=$(go version | awk '{print $3}' | sed 's/go//')
        log "Go $GO_VERSION_INSTALLED already installed"
        return
    fi

    GO_VERSION="1.21.6"
    GO_FILE="go${GO_VERSION}.linux-amd64.tar.gz"
    DOWNLOAD_URL="https://go.dev/dl/${GO_FILE}"
    
    cd /tmp
    
    # Clean up any existing downloads
    rm -f ${GO_FILE}
    
    # Download Go with error handling
    if ! wget -q --timeout=30 --tries=3 ${DOWNLOAD_URL}; then
        recover_from_error "download Go binary" ""
        return 1
    fi
    
    # Verify download exists
    if [[ ! -f "${GO_FILE}" ]]; then
        error "Go download failed - file not found"
    fi
    
    # Extract with error handling
    if ! tar -C /usr/local -xzf ${GO_FILE}; then
        recover_from_error "extract Go archive" ""
        rm -f ${GO_FILE}
        return 1
    fi
    
    # Clean up download
    rm -f ${GO_FILE}
    
    # Add to PATH for current session and permanently
    if ! grep -q "/usr/local/go/bin" /etc/profile; then
        echo 'export PATH=$PATH:/usr/local/go/bin' >> /etc/profile
    fi
    export PATH=$PATH:/usr/local/go/bin
    
    # Verify installation
    if command -v go >/dev/null 2>&1; then
        GO_VERSION_INSTALLED=$(go version | awk '{print $3}' | sed 's/go//')
        log "Go $GO_VERSION_INSTALLED installed successfully"
    else
        recover_from_error "verify Go installation" ""
        return 1
    fi
}

# Setup PostgreSQL database
setup_database() {
    log "Setting up PostgreSQL database..."

    # Generate random password
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

    case $PKG_MANAGER in
        "apt")
            systemctl enable postgresql
            systemctl start postgresql
            
            # Check if database already exists
            DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null || echo "")
            if [[ "$DB_EXISTS" == "1" ]]; then
                warn "Database '$DB_NAME' already exists"
                read -p "Do you want to drop and recreate the database? (y/N): " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    log "Dropping existing database '$DB_NAME'..."
                    sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;"
                else
                    log "Keeping existing database '$DB_NAME'"
                fi
            fi
            
            # Check if user already exists
            USER_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" 2>/dev/null || echo "")
            if [[ "$USER_EXISTS" == "1" ]]; then
                warn "User '$DB_USER' already exists"
                read -p "Do you want to drop and recreate the user? (y/N): " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    log "Dropping existing user '$DB_USER'..."
                    sudo -u postgres psql -c "DROP USER IF EXISTS $DB_USER;"
                else
                    log "Keeping existing user '$DB_USER'"
                    # Get existing password or generate new one
                    read -p "Do you want to generate a new password for existing user? (y/N): " -n 1 -r
                    echo
                    if [[ $REPLY =~ ^[Yy]$ ]]; then
                        log "Generating new password for existing user..."
                        sudo -u postgres psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
                    else
                        log "Keeping existing password for user '$DB_USER'"
                        # Generate a random password anyway for the env file
                        DB_PASSWORD="existing-password-keep"
                    fi
                fi
            fi
            
            # Create database and user (if they don't exist)
            sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || log "Database already exists or creation failed"
            sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || log "User already exists or creation failed"
            sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
            sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;"
            ;;
        "yum")
            postgresql-setup --initdb
            systemctl enable postgresql
            systemctl start postgresql
            
            # Check if database already exists
            DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null || echo "")
            if [[ "$DB_EXISTS" == "1" ]]; then
                warn "Database '$DB_NAME' already exists"
                read -p "Do you want to drop and recreate the database? (y/N): " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    log "Dropping existing database '$DB_NAME'..."
                    sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;"
                else
                    log "Keeping existing database '$DB_NAME'"
                fi
            fi
            
            # Check if user already exists
            USER_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" 2>/dev/null || echo "")
            if [[ "$USER_EXISTS" == "1" ]]; then
                warn "User '$DB_USER' already exists"
                read -p "Do you want to drop and recreate the user? (y/N): " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    log "Dropping existing user '$DB_USER'..."
                    sudo -u postgres psql -c "DROP USER IF EXISTS $DB_USER;"
                else
                    log "Keeping existing user '$DB_USER'"
                    DB_PASSWORD="existing-password-keep"
                fi
            fi
            
            # Create database and user (if they don't exist)
            sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || log "Database already exists or creation failed"
            sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || log "User already exists or creation failed"
            sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
            sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;"
            ;;
        "pacman")
            systemctl enable postgresql
            sudo -u postgres initdb -D /var/lib/postgres/data
            systemctl start postgresql
            
            # Check if database already exists
            DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null || echo "")
            if [[ "$DB_EXISTS" == "1" ]]; then
                warn "Database '$DB_NAME' already exists"
                read -p "Do you want to drop and recreate the database? (y/N): " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    log "Dropping existing database '$DB_NAME'..."
                    sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;"
                else
                    log "Keeping existing database '$DB_NAME'"
                fi
            fi
            
            # Check if user already exists
            USER_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" 2>/dev/null || echo "")
            if [[ "$USER_EXISTS" == "1" ]]; then
                warn "User '$DB_USER' already exists"
                read -p "Do you want to drop and recreate the user? (y/N): " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    log "Dropping existing user '$DB_USER'..."
                    sudo -u postgres psql -c "DROP USER IF EXISTS $DB_USER;"
                else
                    log "Keeping existing user '$DB_USER'"
                    DB_PASSWORD="existing-password-keep"
                fi
            fi
            
            # Create database and user (if they don't exist)
            sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || log "Database already exists or creation failed"
            sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || log "User already exists or creation failed"
            sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
            sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;"
            ;;
    esac

    log "PostgreSQL database setup completed"
}

# Clone and setup project
setup_project() {
    log "Setting up project files..."

    # Check if we're already in the project directory
    if [[ -f "$(pwd)/README.md" ]] && [[ -d "$(pwd)/website" ]]; then
        log "Already in project directory, using current location"
        INSTALL_DIR=$(pwd)
    else
        # Create project directory
        mkdir -p $INSTALL_DIR
        cd $INSTALL_DIR

        # Clone repository if not already present
        if [[ ! -d "$INSTALL_DIR/apps" ]] && [[ ! -d "$INSTALL_DIR/website" ]]; then
            git clone https://github.com/Cyberverse-cent0/combined-project.git temp
            mv temp/* .
            mv temp/.* . 2>/dev/null || true
            rmdir temp
        fi
    fi

    # Set permissions
    chown -R www-data:www-data $INSTALL_DIR
    chmod -R 755 $INSTALL_DIR

    # Create logs directory
    mkdir -p /var/log/$PROJECT_NAME
    chown www-data:www-data /var/log/$PROJECT_NAME

    log "Project files setup completed"
}

# Install frontend dependencies
install_frontend() {
    log "Installing frontend dependencies..."

    cd $INSTALL_DIR/apps/website

    # Install dependencies
    sudo -u www-data npm install

    # Generate Prisma client
    sudo -u www-data npx prisma generate

    # Build for production
    sudo -u www-data npm run build

    log "Frontend setup completed"
}

# Install backend dependencies
install_backend() {
    log "Installing backend dependencies..."

    cd $INSTALL_DIR/apps/website/backend

    # Create Python virtual environment
    sudo -u www-data python3 -m venv venv
    sudo -u www-data venv/bin/pip install --upgrade pip
    sudo -u www-data venv/bin/pip install -r requirements.txt

    log "Backend setup completed"
}

# Build Go services
build_go_services() {
    log "Building Go services..."

    cd $INSTALL_DIR/apps/website/backend/go-services

    # Build each Go service
    for service in password-service telemetry-service image-service worker-service; do
        cd $service
        sudo -u www-data go build -o $service .
        cd ..
    done

    log "Go services built successfully"
}

# Create production environment file
create_env_file() {
    log "Creating production environment file..."

    cat > $INSTALL_DIR/.env.production << EOF
# Production Environment Configuration
WEBSITE_URL=https://$DOMAIN
NEXTAUTH_URL=https://$DOMAIN
NEXT_PUBLIC_SITE_URL=https://$DOMAIN

# CORS Configuration
CORS_ORIGIN=https://$DOMAIN
ADMIN_ALLOWED_ORIGIN=https://$DOMAIN

# API Configuration
NEXT_PUBLIC_API_URL=""
ADMIN_BACKEND_URL=https://$DOMAIN

# Admin Configuration
ADMIN_PASSWORD=$ADMIN_PASSWORD

# Database Configuration
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME?schema=public"

# NextAuth Configuration
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Backend Configuration
ADMIN_API_PORT=8001
ADMIN_SESSION_HOURS=8
ADMIN_ALLOWED_ORIGIN=https://$DOMAIN

# Go Services Configuration
USE_GO_TELEMETRY_SERVICE=true
GO_TELEMETRY_SERVICE_URL=http://localhost:9002

# Logging
LOG_LEVEL=info
ENABLE_ACCESS_LOGS=true
EOF

    chmod 600 $INSTALL_DIR/.env.production
    chown www-data:www-data $INSTALL_DIR/.env.production

    log "Environment file created"
}

# Install systemd services
install_systemd_services() {
    log "Installing systemd services..."

    # Copy service files
    cp $INSTALL_DIR/production/systemd/*.service /etc/systemd/system/

    # Reload systemd
    systemctl daemon-reload

    # Enable services
    for service in stephenasatsa-frontend stephenasatsa-backend stephenasatsa-go-password stephenasatsa-go-telemetry stephenasatsa-go-image stephenasatsa-go-worker; do
        systemctl enable $service
    done

    log "Systemd services installed and enabled"
}

# Configure nginx
configure_nginx() {
    log "Configuring nginx..."

    # Backup original config
    cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup

    # Copy our config
    cp $INSTALL_DIR/production/nginx/nginx.conf /etc/nginx/nginx.conf

    # Update domain in config
    sed -i "s/your-domain.com/$DOMAIN/g" /etc/nginx/nginx.conf

    # Test configuration
    nginx -t

    # Enable and start nginx
    systemctl enable nginx
    systemctl start nginx

    log "Nginx configured and started"
}

# Setup SSL certificate
setup_ssl() {
    log "Setting up SSL certificate..."

    # Get SSL certificate from Let's Encrypt
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect

    # Setup auto-renewal
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -

    log "SSL certificate installed and auto-renewal configured"
}

# Setup firewall
setup_firewall() {
    log "Configuring firewall..."

    case $PKG_MANAGER in
        "apt"|"pacman")
            ufw --force reset
            ufw default deny incoming
            ufw default allow outgoing
            ufw allow ssh
            ufw allow 'Nginx Full'
            ufw --force enable
            ;;
        "yum")
            firewall-cmd --permanent --add-service=ssh
            firewall-cmd --permanent --add-service=http
            firewall-cmd --permanent --add-service=https
            firewall-cmd --reload
            ;;
    esac

    log "Firewall configured"
}

# Start services
start_services() {
    log "Starting all services..."

    # Start backend services first
    systemctl start stephenasatsa-backend
    systemctl start stephenasatsa-go-password
    systemctl start stephenasatsa-go-telemetry
    systemctl start stephenasatsa-go-image
    systemctl start stephenasatsa-go-worker

    # Wait a moment for services to start
    sleep 5

    # Start frontend
    systemctl start stephenasatsa-frontend

    log "All services started"
}

# Health check
health_check() {
    log "Performing health check..."

    # Check if services are running
    services=("stephenasatsa-frontend" "stephenasatsa-backend" "nginx" "postgresql")
    for service in "${services[@]}"; do
        if systemctl is-active --quiet $service; then
            log "✓ $service is running"
        else
            error "✗ $service is not running"
        fi
    done

    # Check if website is accessible
    if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200"; then
        log "✓ Website is responding"
    else
        warn "✗ Website is not responding"
    fi

    # Check backend API
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/health | grep -q "200"; then
        log "✓ Backend API is responding"
    else
        warn "✗ Backend API is not responding"
    fi
}

# Print installation summary
print_summary() {
    log "Installation completed successfully!"
    echo ""
    echo -e "${GREEN}=== Installation Summary ===${NC}"
    echo -e "Project Directory: ${BLUE}$INSTALL_DIR${NC}"
    echo -e "Website URL: ${BLUE}https://$DOMAIN${NC}"
    echo -e "Admin URL: ${BLUE}https://$DOMAIN/admin${NC}"
    echo -e "Database: ${BLUE}$DB_NAME${NC}"
    echo -e "Database User: ${BLUE}$DB_USER${NC}"
    echo -e "Admin Password: ${YELLOW}$ADMIN_PASSWORD${NC}"
    echo -e "Database Password: ${YELLOW}$DB_PASSWORD${NC}"
    echo ""
    echo -e "${GREEN}=== Service Management ===${NC}"
    echo -e "Status: ${BLUE}systemctl status stephenasatsa-*${NC}"
    echo -e "Logs: ${BLUE}journalctl -u stephenasatsa-* -f${NC}"
    echo -e "Restart: ${BLUE}systemctl restart stephenasatsa-frontend${NC}"
    echo ""
    echo -e "${GREEN}=== Important Files ===${NC}"
    echo -e "Environment: ${BLUE}$INSTALL_DIR/.env.production${NC}"
    echo -e "Nginx Config: ${BLUE}/etc/nginx/nginx.conf${NC}"
    echo -e "Install Log: ${BLUE}$LOG_FILE${NC}"
    echo ""
    echo -e "${YELLOW}=== Next Steps ===${NC}"
    echo "1. Update your DNS to point $DOMAIN to this server"
    echo "2. Change the admin password in $INSTALL_DIR/.env.production"
    echo "3. Configure your domain in nginx if different from $DOMAIN"
    echo "4. Setup backups and monitoring"
    echo ""
}

# Main installation function
main() {
    echo -e "${BLUE}"
    echo "======================================"
    echo "  Stephen Asatsa Website Installer"
    echo "======================================"
    echo -e "${NC}"

    # Check if running as root
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root"
    fi

    # Get domain from user if not set
    if [[ "$DOMAIN" == "your-domain.com" ]]; then
        read -p "Enter your domain name (press Enter for localhost): " DOMAIN
        if [[ -z "$DOMAIN" ]]; then
            DOMAIN="localhost"
            log "Using localhost as domain name"
        fi
    fi

    # Run installation steps
    detect_os
    check_requirements
    install_dependencies
    install_nodejs
    install_go
    setup_database
    setup_project
    install_frontend
    install_backend
    build_go_services
    create_env_file
    install_systemd_services
    configure_nginx
    setup_ssl
    setup_firewall
    start_services
    health_check
    print_summary

    log "Installation completed successfully!"
}

# Run main function
main "$@"
