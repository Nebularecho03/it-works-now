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

# Cleanup trap for script interruption
cleanup_on_exit() {
    local exit_code=$?
    if [[ $exit_code -ne 0 ]]; then
        warn "Script interrupted or failed, performing cleanup..."
        
        # Clean up any temp directories in common locations
        local temp_dirs=("$INSTALL_DIR/temp" "/tmp/temp" "$(pwd)/temp")
        for temp_dir in "${temp_dirs[@]}"; do
            if [[ -d "$temp_dir" ]]; then
                debug "Cleaning up temp directory on exit: $temp_dir"
                rm -rf "$temp_dir" 2>/dev/null || true
            fi
        done
        
        log "Cleanup completed"
    fi
}

# Set trap for common exit signals
trap cleanup_on_exit EXIT INT TERM

# Enhanced logging functions
debug() {
    if [[ "${DEBUG:-false}" == "true" ]]; then
        echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] DEBUG: $1${NC}"
    fi
}

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

# Safety validation functions
validate_safe_path() {
    local path="$1"
    local name="${2:-path}"
    
    debug "Validating safety of $name: $path"
    
    # Check if path is absolute
    if [[ ! "$path" = /* ]]; then
        error "$name must be an absolute path: $path"
    fi
    
    # Check for dangerous paths
    case "$path" in
        "/"|"/bin"|"/sbin"|"/usr"|"/etc"|"/var"|"/opt"|"/home"|"/root"|"/boot"|"/lib"|"/proc"|"/sys"|"/dev")
            error "Refusing to operate on critical system path: $path"
            ;;
    esac
    
    # Check if path is a mount point
    if mountpoint -q "$path" 2>/dev/null; then
        error "Refusing to operate on mount point: $path"
    fi
    
    # Check if path is a symlink
    if [[ -L "$path" ]]; then
        local target=$(readlink -f "$path")
        warn "$name is a symlink pointing to: $target"
        validate_safe_path "$target" "$name target"
    fi
    
    debug "Path validation passed for: $path"
    return 0
}

safe_remove_directory() {
    local dir_path="$1"
    local dir_name="${2:-directory}"
    
    if [[ -z "$dir_path" ]]; then
        error "Directory path cannot be empty"
    fi
    
    # Safety validation
    validate_safe_path "$dir_path" "$dir_name"
    
    if [[ ! -d "$dir_path" ]]; then
        debug "$dir_name does not exist: $dir_path"
        return 0
    fi
    
    debug "Safely removing $dir_name: $dir_path"
    
    # Check directory contents for safety
    local file_count=$(find "$dir_path" -type f | wc -l)
    if [[ $file_count -gt 10000 ]]; then
        warn "$dir_name contains $file_count files, this seems unusual"
        read -p "Continue removing $dir_name? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Skipping removal of $dir_name by user choice"
            return 1
        fi
    fi
    
    # Attempt removal with error handling
    if ! rm -rf "$dir_path" 2>/dev/null; then
        # Try with different permissions
        warn "First attempt failed, trying with chmod"
        chmod -R 755 "$dir_path" 2>/dev/null || true
        if ! rm -rf "$dir_path"; then
            error "Failed to remove $dir_name: $dir_path"
        fi
    fi
    
    log "Successfully removed $dir_name: $dir_path"
    debug "Verified removal: $(! [[ -d "$dir_path" ]] && echo 'confirmed' || echo 'failed')"
}

validate_git_clone() {
    local clone_dir="$1"
    
    if [[ ! -d "$clone_dir" ]]; then
        error "Git clone directory does not exist: $clone_dir"
    fi
    
    if [[ ! -d "$clone_dir/.git" ]]; then
        error "Git clone directory missing .git folder: $clone_dir"
    fi
    
    # Check for basic project structure - files are in apps/website/
    local required_files=("apps/website/README.md" "apps/website/package.json")
    for file in "${required_files[@]}"; do
        if [[ ! -f "$clone_dir/$file" ]]; then
            warn "Git clone missing expected file: $file"
        fi
    done
    
    # Also check for key directories
    local required_dirs=("apps" "apps/website" "apps/website/backend")
    for dir in "${required_dirs[@]}"; do
        if [[ ! -d "$clone_dir/$dir" ]]; then
            warn "Git clone missing expected directory: $dir"
        fi
    done
    
    debug "Git clone validation passed for: $clone_dir"
    return 0
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

    # Check if we're already in a project directory with required files
    local current_dir=$(pwd)
    local has_project_structure=false
    
    # Check for apps/website structure
    if [[ -f "$current_dir/README.md" ]] && [[ -d "$current_dir/apps/website" ]] && [[ -f "$current_dir/apps/website/package.json" ]]; then
        log "Already in project directory with apps/website structure, using current location"
        INSTALL_DIR="$current_dir"
        has_project_structure=true
    # Check for website structure (alternative)
    elif [[ -f "$current_dir/README.md" ]] && [[ -d "$current_dir/website" ]] && [[ -f "$current_dir/website/package.json" ]]; then
        log "Found project with website structure, reorganizing to apps/website"
        INSTALL_DIR="$current_dir"
        
        # Create apps directory if it doesn't exist and move website there
        if [[ ! -d "$INSTALL_DIR/apps" ]]; then
            mkdir -p "$INSTALL_DIR/apps"
        fi
        if [[ -d "$INSTALL_DIR/website" ]]; then
            mv "$INSTALL_DIR/website" "$INSTALL_DIR/apps/"
            log "Moved website directory to apps/website/"
        fi
        has_project_structure=true
    # Check if we're in the installation directory (/opt/stephenasatsa)
    elif [[ "$current_dir" == "/opt/stephenasatsa" ]] && [[ -d "$current_dir/apps/website" ]]; then
        log "Already in installation directory with project structure, using current location"
        INSTALL_DIR="$current_dir"
        has_project_structure=true
    fi
    
    # If we have a valid project structure, use it directly
    if [[ "$has_project_structure" == "true" ]]; then
        log "Using existing project files, skipping clone"
        
        # Set permissions
        chown -R www-data:www-data $INSTALL_DIR
        chmod -R 755 $INSTALL_DIR

        # Create logs directory
        mkdir -p /var/log/$PROJECT_NAME
        chown www-data:www-data /var/log/$PROJECT_NAME

        log "Project files setup completed"
        
        # Continue with complete deployment workflow
        complete_deployment_workflow
        return
    fi
    
    # If no valid project structure found, try remote repository
    log "No valid project structure found, attempting to clone from remote repository..."
    setup_from_remote
}
}

setup_from_remote() {
    log "Setting up complete deployment from GitHub repository..."
    
    # Create project directory
    mkdir -p $INSTALL_DIR
    cd $INSTALL_DIR

    # Clone repository if not already present
    if [[ ! -d "$INSTALL_DIR/apps" ]] && [[ ! -d "$INSTALL_DIR/website" ]]; then
        log "Cloning project repository from GitHub..."
        
        # Define temp directory path
        local temp_dir="$INSTALL_DIR/temp"
        
        # Safe cleanup of any existing temp directory
        if [[ -d "$temp_dir" ]]; then
            log "Removing existing temp directory..."
            safe_remove_directory "$temp_dir" "temp directory"
        fi
        
        # Clone repository with error handling
        log "Downloading project from GitHub..."
        if ! git clone https://github.com/Cyberverse-cent0/combined-project.git "$temp_dir"; then
            error "Failed to clone repository from GitHub"
        fi
        
        # Check if the clone has actual content
        local file_count=$(find "$temp_dir" -type f ! -path "*/.git/*" | wc -l)
        if [[ $file_count -lt 5 ]]; then
            warn "Remote repository appears to be empty or incomplete"
            warn "This suggests the repository is not ready for deployment"
            warn "Please ensure the repository contains the complete project structure"
            warn "Falling back to local project structure..."
            setup_local_fallback
            return
        fi
        
        # Validate the clone structure
        validate_git_clone "$temp_dir"
        
        # Move files with error handling and verification
        log "Moving project files to installation directory..."
        
        # Move visible files
        if ! mv "$temp_dir"/* . 2>/dev/null; then
            error "Failed to move visible files from temp directory"
        fi
        
        # Move hidden files (including .git, .env, etc.)
        if ! mv "$temp_dir"/.* . 2>/dev/null; then
            warn "Some hidden files could not be moved (this may be normal)"
            # Try to move specific important hidden files
            for hidden_file in ".git" ".gitignore" ".env.example" ".env"; do
                if [[ -e "$temp_dir/$hidden_file" ]]; then
                    debug "Moving specific hidden file: $hidden_file"
                    mv "$temp_dir/$hidden_file" . 2>/dev/null || warn "Could not move $hidden_file"
                fi
            done
        fi
        
        # Verify important files were moved
        local required_files=("apps/website/README.md" "apps/website/package.json")
        for file in "${required_files[@]}"; do
            if [[ ! -f "$INSTALL_DIR/$file" ]]; then
                error "Required file not found after move: $file"
            fi
        done
        
        # Safe cleanup of temp directory
        log "Cleaning up temp directory..."
        safe_remove_directory "$temp_dir" "temp directory"
        
        log "Project files successfully installed from GitHub"
        
        # Continue with complete installation workflow
        log "Starting complete deployment workflow from cloned repository..."
        complete_deployment_workflow
        
    else
        log "Project files already exist, continuing with deployment workflow..."
        complete_deployment_workflow
    fi
}

complete_deployment_workflow() {
    log "Starting complete deployment workflow..."
    
    # This function ensures all components are properly installed and configured
    # after cloning from GitHub or when project files exist
    
    # Install frontend dependencies and build
    install_frontend
    
    # Install backend dependencies
    install_backend
    
    # Build Go services (if they exist)
    build_go_services
    
    # Create production environment file
    create_env_file
    
    # Install and configure systemd services
    install_systemd_services
    
    # Configure nginx
    configure_nginx
    
    # Setup SSL certificate
    setup_ssl
    
    # Setup firewall
    setup_firewall
    
    # Start all services
    start_services
    
    # Perform health check
    health_check
    
    # Print installation summary
    print_summary
    
    log "Complete deployment workflow finished successfully!"
}

setup_local_fallback() {
    log "Setting up project from local fallback..."
    
    # Use current working directory as the source
    local source_dir=$(pwd)
    
    if [[ -d "$source_dir/apps/website" ]]; then
        log "Using local project files from: $source_dir"
        
        # Copy apps directory
        cp -r "$source_dir/apps" "$INSTALL_DIR/"
        
        # Copy other important files
        for file in "README.md" "package.json" ".env.production" "production"; do
            if [[ -e "$source_dir/$file" ]]; then
                cp -r "$source_dir/$file" "$INSTALL_DIR/"
            fi
        done
        
        log "Local fallback setup completed"
    elif [[ -d "$source_dir/website" ]]; then
        log "Found alternative local structure, reorganizing..."
        
        # Create apps directory
        mkdir -p "$INSTALL_DIR/apps"
        
        # Copy website to apps/website
        cp -r "$source_dir/website" "$INSTALL_DIR/apps/"
        
        # Copy other important files
        for file in "README.md" "package.json" ".env.production" "production"; do
            if [[ -e "$source_dir/$file" ]]; then
                cp -r "$source_dir/$file" "$INSTALL_DIR/"
            fi
        done
        
        log "Local fallback with reorganization completed"
    else
        error "No valid project source found in: $source_dir"
    fi
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
    if [[ ! -d "venv" ]]; then
        sudo -u www-data python3 -m venv venv
    fi
    sudo -u www-data venv/bin/pip install --upgrade pip
    sudo -u www-data venv/bin/pip install -r requirements.txt

    # Test backend entry point
    if [[ -f "server.py" ]]; then
        log "Backend server.py found"
    elif [[ -f "app.py" ]]; then
        log "Backend app.py found"
    else
        warn "No backend entry point found (server.py or app.py)"
    fi

    log "Backend setup completed"
}

# Build Go services
build_go_services() {
    log "Building Go services..."

    local go_services_dir="$INSTALL_DIR/apps/website/backend/go-services"
    
    if [[ ! -d "$go_services_dir" ]]; then
        warn "Go services directory not found: $go_services_dir"
        warn "Skipping Go services build (not required for this project)"
        return 0
    fi

    cd "$go_services_dir"

    # Build each Go service
    for service in password-service telemetry-service image-service worker-service; do
        if [[ -d "$service" ]]; then
            cd "$service"
            log "Building Go service: $service"
            sudo -u www-data go build -o $service . || warn "Failed to build $service"
            cd ..
        else
            warn "Go service directory not found: $service"
        fi
    done

    log "Go services build completed"
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

    local systemd_dir="$INSTALL_DIR/production/systemd"
    
    # Check if systemd service files exist
    if [[ ! -d "$systemd_dir" ]]; then
        warn "Systemd service files directory not found: $systemd_dir"
        warn "Creating basic systemd services..."
        create_basic_systemd_services
    else
        # Copy existing service files
        local service_files=("$systemd_dir"/*.service)
        if [[ ${#service_files[@]} -eq 0 || ! -f "${service_files[0]}" ]]; then
            warn "No systemd service files found, creating basic services..."
            create_basic_systemd_services
        else
            log "Found systemd service files, installing..."
            cp "$systemd_dir"/*.service /etc/systemd/system/
        fi
    fi

    # Reload systemd
    systemctl daemon-reload

    # Enable services that exist
    local services=("stephenasatsa-frontend" "stephenasatsa-backend")
    local go_services=("stephenasatsa-go-password" "stephenasatsa-go-telemetry" "stephenasatsa-go-image" "stephenasatsa-go-worker")
    
    for service in "${services[@]}"; do
        if [[ -f "/etc/systemd/system/$service.service" ]]; then
            systemctl enable "$service"
            log "Enabled service: $service"
        else
            warn "Service file not found: $service.service"
        fi
    done
    
    # Only enable Go services if they exist
    if [[ -d "$INSTALL_DIR/apps/website/backend/go-services" ]]; then
        for service in "${go_services[@]}"; do
            if [[ -f "/etc/systemd/system/$service.service" ]]; then
                systemctl enable "$service"
                log "Enabled Go service: $service"
            fi
        done
    else
        log "Skipping Go services (directory not found)"
    fi

    log "Systemd services installation completed"
}

create_basic_systemd_services() {
    log "Creating basic systemd service files..."
    
    # Create frontend service
    cat > /etc/systemd/system/stephenasatsa-frontend.service << EOF
[Unit]
Description=Stephen Asatsa Frontend Next.js
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$INSTALL_DIR/apps/website
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    # Create backend service
    cat > /etc/systemd/system/stephenasatsa-backend.service << EOF
[Unit]
Description=Stephen Asatsa Backend Python API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$INSTALL_DIR/apps/website/backend
Environment=PATH=$INSTALL_DIR/apps/website/backend/venv/bin
EnvironmentFile=-$INSTALL_DIR/.env.production
ExecStart=$INSTALL_DIR/apps/website/backend/venv/bin/python server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    log "Basic systemd services created"
}

# Configure nginx
configure_nginx() {
    log "Configuring nginx..."

    # Backup original config
    cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup

    local nginx_config="$INSTALL_DIR/production/nginx/nginx.conf"
    
    # Check if custom nginx config exists
    if [[ -f "$nginx_config" ]]; then
        log "Using custom nginx configuration..."
        cp "$nginx_config" /etc/nginx/nginx.conf
        # Update domain in config
        sed -i "s/your-domain.com/$DOMAIN/g" /etc/nginx/nginx.conf
    else
        warn "Custom nginx config not found: $nginx_config"
        warn "Creating basic nginx configuration..."
        create_basic_nginx_config
    fi

    # Test configuration
    if nginx -t; then
        log "Nginx configuration test passed"
    else
        error "Nginx configuration test failed"
    fi

    # Enable and start nginx
    systemctl enable nginx
    systemctl start nginx

    log "Nginx configured and started"
}

create_basic_nginx_config() {
    log "Creating basic nginx configuration..."
    
    cat > /etc/nginx/nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Frontend server
    server {
        listen 80;
        server_name $DOMAIN www.$DOMAIN;

        # Frontend proxy
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

        # Backend API proxy
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
    }
}
EOF

    log "Basic nginx configuration created"
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
    local services=("stephenasatsa-backend")
    local go_services=("stephenasatsa-go-password" "stephenasatsa-go-telemetry" "stephenasatsa-go-image" "stephenasatsa-go-worker")
    
    # Start main backend service
    if systemctl list-unit-files | grep -q "stephenasatsa-backend.service"; then
        log "Starting backend service..."
        systemctl start stephenasatsa-backend || warn "Failed to start backend service"
    else
        warn "Backend service not found, skipping"
    fi
    
    # Start Go services if they exist
    if [[ -d "$INSTALL_DIR/apps/website/backend/go-services" ]]; then
        for service in "${go_services[@]}"; do
            if systemctl list-unit-files | grep -q "$service.service"; then
                log "Starting Go service: $service"
                systemctl start "$service" || warn "Failed to start $service"
            fi
        done
    else
        log "No Go services to start"
    fi

    # Wait a moment for services to start
    sleep 5

    # Start frontend service
    if systemctl list-unit-files | grep -q "stephenasatsa-frontend.service"; then
        log "Starting frontend service..."
        systemctl start stephenasatsa-frontend || warn "Failed to start frontend service"
    else
        warn "Frontend service not found, skipping"
    fi

    log "Service startup completed"
}

# Health check
health_check() {
    log "Performing health check..."

    # Check if services are running
    local core_services=("nginx" "postgresql")
    local app_services=("stephenasatsa-frontend" "stephenasatsa-backend")
    local go_services=("stephenasatsa-go-password" "stephenasatsa-go-telemetry" "stephenasatsa-go-image" "stephenasatsa-go-worker")
    
    # Check core services
    for service in "${core_services[@]}"; do
        if systemctl is-active --quiet $service; then
            log "✓ $service is running"
        else
            error "✗ $service is not running"
        fi
    done
    
    # Check application services
    for service in "${app_services[@]}"; do
        if systemctl list-unit-files | grep -q "$service.service"; then
            if systemctl is-active --quiet $service; then
                log "✓ $service is running"
            else
                warn "✗ $service is not running"
            fi
        else
            warn "✗ $service service not found"
        fi
    done
    
    # Check Go services if they exist
    if [[ -d "$INSTALL_DIR/apps/website/backend/go-services" ]]; then
        for service in "${go_services[@]}"; do
            if systemctl list-unit-files | grep -q "$service.service"; then
                if systemctl is-active --quiet $service; then
                    log "✓ $service is running"
                else
                    warn "✗ $service is not running"
                fi
            fi
        done
    fi

    # Check if website is accessible
    if curl -s --connect-timeout 5 -o /dev/null -w "%{http_code}" http://localhost | grep -q "200"; then
        log "✓ Website is responding"
    else
        warn "✗ Website is not responding (may still be starting)"
    fi

    # Check backend API
    if curl -s --connect-timeout 5 -o /dev/null -w "%{http_code}" http://localhost:8001/health 2>/dev/null | grep -q "200"; then
        log "✓ Backend API is responding"
    else
        warn "✗ Backend API is not responding (may still be starting)"
    fi
    
    log "Health check completed"
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

    log "Installation completed successfully!"
}

# Run main function
main "$@"
