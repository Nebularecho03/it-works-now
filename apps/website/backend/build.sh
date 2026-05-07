#!/bin/bash

# Stephen Asatsa Website - Python Backend Build Script
# This script builds and prepares the Python backend for deployment

set -e  # Exit on any error

echo "🐍 Building Stephen Asatsa Website Python Backend..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check Python version
PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
REQUIRED_VERSION="3.8"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$PYTHON_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    print_error "Python $REQUIRED_VERSION or higher is required. Found version $PYTHON_VERSION"
    exit 1
fi

print_success "Python $PYTHON_VERSION detected"

# Create virtual environment if it doesn't exist
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
pip install --upgrade pip

# Install dependencies
print_status "Installing dependencies..."
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
    print_success "Dependencies installed"
else
    print_status "Installing enhanced messaging system dependencies..."
    pip install flask flask-cors python-dotenv jinja2
    print_success "Enhanced dependencies installed"
fi

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        print_status "Creating .env file from .env.example..."
        cp .env.example .env
        print_warning "Please update the SECRET_KEY in .env file before production deployment"
    else
        print_status "Creating default .env file..."
        cat > .env << EOF
# Stephen Asatsa Website Backend Environment Variables
SECRET_KEY=your-secret-key-change-in-production-$(date +%s)
FLASK_ENV=development
FLASK_DEBUG=True
EOF
        print_warning "Default .env file created. Please review and update for production"
    fi
else
    print_status ".env file already exists"
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs
mkdir -p data
mkdir -p backups

# Create log files
touch logs/app.log
touch logs/error.log
touch logs/access.log

# Run tests if test files exist
if [ -f "test_app.py" ] || [ -d "tests" ]; then
    print_status "Running tests..."
    if [ -f "test_app.py" ]; then
        python test_app.py
    elif [ -d "tests" ]; then
        python -m pytest tests/ -v
    fi
    print_success "Tests completed"
else
    print_warning "No test files found, skipping tests"
fi

# Validate Python syntax
print_status "Validating Python syntax..."
python -m py_compile app.py
if [ $? -eq 0 ]; then
    print_success "Python syntax validation passed"
else
    print_error "Python syntax validation failed"
    exit 1
fi

# Check if main.py exists (alternative entry point)
if [ -f "main.py" ]; then
    python -m py_compile main.py
    if [ $? -eq 0 ]; then
        print_success "main.py syntax validation passed"
    else
        print_error "main.py syntax validation failed"
        exit 1
    fi
fi

# Create production configuration
print_status "Creating production configuration..."
cat > production_config.py << EOF
"""
Production configuration for Stephen Asatsa Website Backend
"""
import os

class ProductionConfig:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    DEBUG = False
    TESTING = False
    
    # Database configuration (if needed in future)
    # DATABASE_URL = os.environ.get('DATABASE_URL')
    
    # Logging configuration
    LOG_LEVEL = 'INFO'
    LOG_FILE = 'logs/app.log'
    
    # Security settings
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
EOF

print_success "Production configuration created"

# Create systemd service file template
print_status "Creating systemd service file template..."
cat > stephen-asatsa-backend.service << EOF
[Unit]
Description=Stephen Asatsa Website Backend API
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$(pwd)
Environment=PATH=$(pwd)/venv/bin
ExecStart=$(pwd)/venv/bin/python app_enhanced.py
Restart=always
RestartSec=10
StandardOutput=append:$(pwd)/logs/app.log
StandardError=append:$(pwd)/logs/error.log

[Install]
WantedBy=multi-user.target
EOF

print_success "Systemd service file created"

# Create deployment script
print_status "Creating deployment script..."
cat > deploy.sh << 'EOF'
#!/bin/bash

# Stephen Asatsa Website Backend Deployment Script

set -e

echo "🚀 Deploying Stephen Asatsa Website Backend..."

# Stop existing service
sudo systemctl stop stephen-asatsa-backend || true

# Pull latest changes (if using git)
# git pull origin main

# Build the application
./build.sh

# Install enhanced dependencies if needed
if [ -f "requirements_enhanced.txt" ]; then
    print_status "Installing enhanced requirements..."
    pip install -r requirements_enhanced.txt
fi

# Install systemd service
sudo cp stephen-asatsa-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable stephen-asatsa-backend

# Start the service
sudo systemctl start stephen-asatsa-backend

# Check status
sudo systemctl status stephen-asatsa-backend

echo "✅ Deployment completed!"
EOF

chmod +x deploy.sh
print_success "Deployment script created"

# Create backup script
print_status "Creating backup script..."
cat > backup.sh << 'EOF'
#!/bin/bash

# Stephen Asatsa Website Backend Backup Script

BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backend_backup_${TIMESTAMP}.tar.gz"

echo "📦 Creating backup..."

# Create backup
tar -czf "${BACKUP_DIR}/${BACKUP_FILE}" \
    app.py \
    app_enhanced.py \
    main.py \
    auth.py \
    email_service.py \
    email_templates \
    requirements.txt \
    .env \
    venv/ \
    logs/ \
    data/ \
    templates/

echo "✅ Backup created: ${BACKUP_DIR}/${BACKUP_FILE}"

# Keep only last 10 backups
cd backups
ls -t *.tar.gz | tail -n +11 | xargs -r rm
echo "🧹 Cleanup completed"
EOF

chmod +x backup.sh
print_success "Backup script created"

# Print build summary
echo ""
print_success "🎉 Build completed successfully!"
echo ""
echo "📋 Build Summary:"
echo "  - Python virtual environment: $(pwd)/venv"
echo "  - Dependencies installed: requirements.txt"
echo "  - Environment file: .env"
echo "  - Log directory: logs/"
echo "  - Data directory: data/"
echo "  - Backup directory: backups/"
echo "  - Systemd service: stephen-asatsa-backend.service"
echo "  - Deployment script: deploy.sh"
echo "  - Backup script: backup.sh"
echo ""
echo "🚀 Next steps:"
echo "  1. Update .env file with production values"
echo "  2. Run './deploy.sh' to deploy to production"
echo "  3. Use './backup.sh' to create backups"
echo "  4. Monitor logs with 'tail -f logs/app.log'"
echo ""
print_success "Build process completed successfully!"
