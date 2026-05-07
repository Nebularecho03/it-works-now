#!/bin/bash

# Stephen Asatsa Website - Python Backend Installation Script
# This script installs and configures the Python backend system

set -e  # Exit on any error

echo "🚀 Installing Stephen Asatsa Website Python Backend..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}========================================${NC}"
}

# Check if running as root for system-wide installation
if [ "$EUID" -eq 0 ]; then
    SYSTEM_INSTALL=true
    print_warning "Running as root - performing system-wide installation"
else
    SYSTEM_INSTALL=false
    print_status "Running as user - performing local installation"
fi

# System requirements check
check_requirements() {
    print_header "Checking System Requirements"
    
    # Check Python 3
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed"
        if command -v apt-get &> /dev/null; then
            print_status "Installing Python 3..."
            sudo apt-get update && sudo apt-get install -y python3 python3-pip python3-venv
        elif command -v yum &> /dev/null; then
            print_status "Installing Python 3..."
            sudo yum install -y python3 python3-pip
        else
            print_error "Please install Python 3 manually"
            exit 1
        fi
    fi
    
    # Check Python version
    PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
    REQUIRED_VERSION="3.8"
    
    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$PYTHON_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
        print_error "Python $REQUIRED_VERSION or higher is required. Found version $PYTHON_VERSION"
        exit 1
    fi
    
    print_success "Python $PYTHON_VERSION detected"
    
    # Check pip
    if ! command -v pip3 &> /dev/null; then
        print_error "pip3 is not installed"
        exit 1
    fi
    
    print_success "pip3 detected"
    
    # Check curl
    if ! command -v curl &> /dev/null; then
        print_warning "curl is not installed. Installing..."
        if command -v apt-get &> /dev/null; then
            sudo apt-get install -y curl
        elif command -v yum &> /dev/null; then
            sudo yum install -y curl
        fi
    fi
    
    print_success "System requirements check completed"
}

# Create project structure
create_structure() {
    print_header "Creating Project Structure"
    
    # Create necessary directories
    mkdir -p logs
    mkdir -p data
    mkdir -p backups
    mkdir -p config
    mkdir -p scripts
    mkdir -p tests
    
    # Create log files
    touch logs/app.log
    touch logs/error.log
    touch logs/access.log
    touch logs/debug.log
    
    # Create data directories
    mkdir -p data/users
    mkdir -p data/tokens
    mkdir -p data/uploads
    
    print_success "Project structure created"
}

# Setup virtual environment
setup_venv() {
    print_header "Setting Up Virtual Environment"
    
    if [ ! -d "venv" ]; then
        print_status "Creating virtual environment..."
        python3 -m venv venv
        print_success "Virtual environment created"
    else
        print_status "Virtual environment already exists"
    fi
    
    # Activate virtual environment
    print_status "Activating virtual environment..."
    source venv/bin/activate
    
    # Upgrade pip
    print_status "Upgrading pip..."
    pip install --upgrade pip setuptools wheel
    
    print_success "Virtual environment setup completed"
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    # Activate virtual environment
    source venv/bin/activate
    
    if [ -f "requirements.txt" ]; then
        print_status "Installing from requirements.txt..."
        pip install -r requirements.txt
        print_success "Dependencies installed"
    else
        print_warning "requirements.txt not found, installing enhanced system dependencies..."
        pip install flask flask-cors python-dotenv jinja2
        print_success "Enhanced dependencies installed"
    fi
}

# Setup environment configuration
setup_environment() {
    print_header "Setting Up Environment Configuration"
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            print_status "Creating .env from .env.example..."
            cp .env.example .env
        else
            print_status "Creating default .env file..."
            cat > .env << EOF
# Stephen Asatsa Website Backend Environment Variables
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')
FLASK_ENV=production
FLASK_DEBUG=False
FLASK_HOST=0.0.0.0
FLASK_PORT=8000

# Database Configuration (for future use)
# DATABASE_URL=sqlite:///data/app.db

# Logging Configuration
LOG_LEVEL=INFO
LOG_FILE=logs/app.log
ERROR_LOG_FILE=logs/error.log

# Security Configuration
SESSION_TIMEOUT=86400
CORS_ORIGINS=http://localhost:3001,http://localhost:3000

# Admin Credentials
ADMIN_EMAIL=admin@stephenasatsa.com
ADMIN_PASSWORD=ChangeMe123!
EOF
        fi
        print_success "Environment file created"
    else
        print_status "Environment file already exists"
    fi
    
    # Create production config
    if [ ! -f "production_config.py" ]; then
        print_status "Creating production configuration..."
        cat > production_config.py << EOF
"""
Production configuration for Stephen Asatsa Website Backend
"""
import os
from datetime import timedelta

class ProductionConfig:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    DEBUG = False
    TESTING = False
    
    # Server Configuration
    HOST = os.environ.get('FLASK_HOST', '0.0.0.0')
    PORT = int(os.environ.get('FLASK_PORT', 8000))
    
    # Security Configuration
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)
    
    # Logging Configuration
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FILE = os.environ.get('LOG_FILE', 'logs/app.log')
    ERROR_LOG_FILE = os.environ.get('ERROR_LOG_FILE', 'logs/error.log')
    
    # CORS Configuration
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3001,http://localhost:3000').split(',')
    
    # Admin Configuration
    ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@stephenasatsa.com')
    ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'ChangeMe123!')
EOF
        print_success "Production configuration created"
    fi
}

# Setup logging
setup_logging() {
    print_header "Setting Up Logging"
    
    # Create log rotation configuration
    cat > config/logrotate.conf << EOF
# Stephen Asatsa Website Backend Log Rotation
logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload stephen-asatsa-backend || true
    endscript
}
EOF
    
    print_success "Logging configuration created"
}

# Setup systemd service (if system install)
setup_systemd() {
    if [ "$SYSTEM_INSTALL" = true ]; then
        print_header "Setting Up Systemd Service"
        
        # Create systemd service file
        cat > stephen-asatsa-backend.service << EOF
[Unit]
Description=Stephen Asatsa Website Backend API
After=network.target
Wants=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$(pwd)
Environment=PATH=$(pwd)/venv/bin
Environment=FLASK_APP=app.py
Environment=FLASK_ENV=production
ExecStart=$(pwd)/venv/bin/python app.py
ExecReload=/bin/kill -HUP \$MAINPID
Restart=always
RestartSec=10
StandardOutput=append:$(pwd)/logs/app.log
StandardError=append:$(pwd)/logs/error.log

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$(pwd)/logs $(pwd)/data $(pwd)/backups

[Install]
WantedBy=multi-user.target
EOF
        
        print_success "Systemd service file created"
        print_status "To install the service, run:"
        print_status "  sudo cp stephen-asatsa-backend.service /etc/systemd/system/"
        print_status "  sudo systemctl daemon-reload"
        print_status "  sudo systemctl enable stephen-asatsa-backend"
        print_status "  sudo systemctl start stephen-asatsa-backend"
    fi
}

# Setup monitoring scripts
setup_monitoring() {
    print_header "Setting Up Monitoring"
    
    # Create health check script
    cat > scripts/health_check.sh << 'EOF'
#!/bin/bash

# Health check script for Stephen Asatsa Website Backend

BACKEND_URL="http://localhost:8000"
LOG_FILE="logs/health.log"

check_health() {
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    
    if curl -s "$BACKEND_URL/" > /dev/null; then
        echo "$TIMESTAMP: Backend is healthy" >> "$LOG_FILE"
        exit 0
    else
        echo "$TIMESTAMP: Backend is not responding" >> "$LOG_FILE"
        exit 1
    fi
}

check_health
EOF
    
    chmod +x scripts/health_check.sh
    
    # Create backup script
    cat > scripts/backup_data.sh << 'EOF'
#!/bin/bash

# Backup script for Stephen Asatsa Website Backend

BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backend_backup_${TIMESTAMP}.tar.gz"

echo "Creating backup..."

tar -czf "${BACKUP_DIR}/${BACKUP_FILE}" \
    app.py \
    requirements.txt \
    .env \
    data/ \
    logs/ \
    config/

echo "Backup created: ${BACKUP_DIR}/${BACKUP_FILE}"

# Keep only last 10 backups
cd "$BACKUP_DIR"
ls -t *.tar.gz | tail -n +11 | xargs -r rm

echo "Backup completed"
EOF
    
    chmod +x scripts/backup_data.sh
    
    # Create update script
    cat > scripts/update.sh << 'EOF'
#!/bin/bash

# Update script for Stephen Asatsa Website Backend

echo "Updating backend..."

# Stop service if running
if systemctl is-active --quiet stephen-asatsa-backend; then
    sudo systemctl stop stephen-asatsa-backend
fi

# Backup current version
./scripts/backup_data.sh

# Pull latest changes (if using git)
if [ -d ".git" ]; then
    git pull origin main
fi

# Rebuild
./build.sh

# Restart service
if systemctl is-enabled --quiet stephen-asatsa-backend; then
    sudo systemctl start stephen-asatsa-backend
fi

echo "Update completed"
EOF
    
    chmod +x scripts/update.sh
    
    print_success "Monitoring scripts created"
}

# Setup nginx configuration (optional)
setup_nginx() {
    print_header "Setting Up Nginx Configuration"
    
    cat > config/nginx.conf << EOF
# Nginx configuration for Stephen Asatsa Website Backend
server {
    listen 80;
    server_name your-domain.com;
    
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
    }
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    
    print_success "Nginx configuration created"
    print_status "To use Nginx, copy config/nginx.conf to your nginx configuration"
}

# Run tests
run_tests() {
    print_header "Running Tests"
    
    source venv/bin/activate
    
    if [ -f "test_app.py" ]; then
        print_status "Running unit tests..."
        python test_app.py
        print_success "Tests completed"
    elif [ -d "tests" ]; then
        print_status "Running pytest..."
        python -m pytest tests/ -v
        print_success "Tests completed"
    else
        print_warning "No tests found"
    fi
}

# Create startup scripts
create_startup_scripts() {
    print_header "Creating Startup Scripts"
    
    # Update existing start.sh if needed
    if [ ! -f "start.sh" ]; then
        cat > start.sh << 'EOF'
#!/bin/bash
# Start script for Stephen Asatsa Website Backend
./daemon.sh start
EOF
        chmod +x start.sh
    fi
    
    # Create stop script
    cat > stop.sh << 'EOF'
#!/bin/bash
# Stop script for Stephen Asatsa Website Backend
./daemon.sh stop
EOF
    chmod +x stop.sh
    
    # Create restart script
    cat > restart.sh << 'EOF'
#!/bin/bash
# Restart script for Stephen Asatsa Website Backend
./daemon.sh restart
EOF
    chmod +x restart.sh
    
    print_success "Startup scripts created"
}

# Print installation summary
print_summary() {
    print_header "Installation Summary"
    
    echo ""
    print_success "🎉 Installation completed successfully!"
    echo ""
    echo "📋 Installation Summary:"
    echo "  - Python virtual environment: $(pwd)/venv"
    echo "  - Dependencies installed: requirements.txt"
    echo "  - Environment file: .env"
    echo "  - Configuration: production_config.py"
    echo "  - Log directory: logs/"
    echo "  - Data directory: data/"
    echo "  - Backup directory: backups/"
    echo "  - Scripts directory: scripts/"
    echo "  - Config directory: config/"
    echo ""
    echo "🚀 Quick Start:"
    echo "  1. Start the backend: ./start.sh"
    echo "  2. Check status: ./daemon.sh status"
    echo "  3. View logs: ./daemon.sh logs"
    echo "  4. Stop the backend: ./stop.sh"
    echo ""
    if [ "$SYSTEM_INSTALL" = true ]; then
        echo "🔧 System Service Installation:"
        echo "  1. Install service: sudo ./daemon.sh install"
        echo "  2. Start service: sudo ./daemon.sh start"
        echo "  3. Enable auto-start: sudo systemctl enable stephen-asatsa-backend"
        echo ""
    fi
    echo "📚 Documentation:"
    echo "  - API Documentation: http://localhost:8000"
    echo "  - Admin Login: http://localhost:8000/api/admin/login"
    echo "  - Health Check: ./scripts/health_check.sh"
    echo "  - Backup: ./scripts/backup_data.sh"
    echo "  - Update: ./scripts/update.sh"
    echo ""
    echo "⚙️ Configuration:"
    echo "  - Edit .env file for environment variables"
    echo "  - Edit production_config.py for production settings"
    echo "  - Edit config/nginx.conf for nginx configuration"
    echo ""
    print_success "Installation completed successfully!"
}

# Main installation flow
main() {
    check_requirements
    create_structure
    setup_venv
    install_dependencies
    setup_environment
    setup_logging
    setup_systemd
    setup_monitoring
    setup_nginx
    create_startup_scripts
    run_tests
    print_summary
}

# Run main function
main
