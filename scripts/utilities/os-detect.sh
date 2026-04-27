#!/bin/bash

# OS Detection and Package Manager Abstraction Library
# Supports Debian/Ubuntu, Arch Linux, and Fedora

# Global variables
OS=""
OS_VERSION=""
PACKAGE_MANAGER=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { printf "${GREEN}[INFO]${NC} %s\n" "$1"; }
error() { printf "${RED}[ERROR]${NC} %s\n" "$1" >&2; exit 1; }
warn() { printf "${YELLOW}[WARN]${NC} %s\n" "$1"; }

# Detect the Linux distribution
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        OS_VERSION=$VERSION_ID
    elif [ -f /etc/debian_version ]; then
        OS="debian"
    elif [ -f /etc/arch-release ]; then
        OS="arch"
    elif [ -f /etc/fedora-release ]; then
        OS="fedora"
    else
        error "Unsupported operating system. Only Debian/Ubuntu, Arch Linux, and Fedora are supported."
    fi
    
    log "Detected OS: $OS $OS_VERSION"
    
    # Set package manager based on OS
    case "$OS" in
        debian|ubuntu)
            PACKAGE_MANAGER="apt"
            ;;
        arch)
            PACKAGE_MANAGER="pacman"
            ;;
        fedora)
            PACKAGE_MANAGER="dnf"
            ;;
        *)
            error "Unknown package manager for OS: $OS"
            ;;
    esac
    
    log "Package manager: $PACKAGE_MANAGER"
}

# Update package lists
update_package_lists() {
    log "Updating package lists..."
    case "$PACKAGE_MANAGER" in
        apt)
            run_root apt update
            ;;
        pacman)
            run_root pacman -Sy
            ;;
        dnf)
            run_root dnf check-update || true
            ;;
    esac
}

# Install packages
install_packages() {
    local packages="$@"
    log "Installing packages: $packages"
    case "$PACKAGE_MANAGER" in
        apt)
            run_root apt install -y $packages
            ;;
        pacman)
            run_root pacman -S --noconfirm --needed $packages
            ;;
        dnf)
            run_root dnf install -y $packages
            ;;
    esac
}

# Install system dependencies for the projects
install_system_deps() {
    log "Installing system dependencies..."
    
    update_package_lists
    
    case "$OS" in
        debian|ubuntu)
            install_packages postgresql postgresql-contrib nginx python3 python3-pip python3-venv build-essential curl git
            ;;
        arch)
            install_packages postgresql nginx python python-pip base-devel curl git
            ;;
        fedora)
            install_packages postgresql-server nginx python3 python3-pip @development-tools curl git
            ;;
    esac
    
    # Install Node.js
    install_nodejs
    
    # Install pnpm globally
    if ! command -v pnpm &> /dev/null; then
        log "Installing pnpm..."
        npm install -g pnpm
    fi
    
    log "System dependencies installed"
}

# Install Node.js based on OS
install_nodejs() {
    if command -v node &> /dev/null; then
        log "Node.js already installed: $(node --version)"
        return
    fi
    
    log "Installing Node.js..."
    case "$OS" in
        debian|ubuntu)
            curl -fsSL https://deb.nodesource.com/setup_20.x | run_root bash -
            install_packages nodejs
            ;;
        arch)
            install_packages nodejs npm
            ;;
        fedora)
            run_root dnf module enable -y nodejs:20
            install_packages nodejs
            ;;
    esac
    
    log "Node.js installed: $(node --version)"
}

# Setup PostgreSQL databases
setup_databases() {
    local db_user="$1"
    local db_password="$2"
    local db_name_website="$3"
    local db_name_scholars="$4"
    
    log "Setting up PostgreSQL databases..."
    
    # Initialize PostgreSQL if needed (Arch/Fedora)
    case "$OS" in
        arch)
            if [ ! -d /var/lib/postgres/data ]; then
                log "Initializing PostgreSQL database cluster..."
                run_root -u postgres initdb -D /var/lib/postgres/data
            fi
            run_root systemctl start postgresql
            run_root systemctl enable postgresql
            ;;
        fedora)
            if ! run_root postgresql-setup --initdb 2>/dev/null; then
                log "PostgreSQL already initialized"
            fi
            run_root systemctl start postgresql
            run_root systemctl enable postgresql
            ;;
        debian|ubuntu)
            run_root systemctl start postgresql
            ;;
    esac
    
    # Wait for PostgreSQL to be ready
    sleep 2
    
    # Create databases
    if ! run_root -u postgres psql -lqt | cut -d \| -f 1 | grep -qw $db_name_website; then
        run_root -u postgres psql -c "CREATE DATABASE $db_name_website;"
        log "Created database $db_name_website"
    else
        warn "Database $db_name_website already exists"
    fi
    
    if ! run_root -u postgres psql -lqt | cut -d \| -f 1 | grep -qw $db_name_scholars; then
        run_root -u postgres psql -c "CREATE DATABASE $db_name_scholars;"
        log "Created database $db_name_scholars"
    else
        warn "Database $db_name_scholars already exists"
    fi
    
    # Create user if not exists
    if ! run_root -u postgres psql -c "\du" | grep -qw $db_user; then
        run_root -u postgres psql -c "CREATE USER $db_user WITH PASSWORD '$db_password';"
        log "Created database user $db_user"
    else
        warn "Database user $db_user already exists"
    fi
    
    # Grant privileges
    run_root -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $db_name_website TO $db_user;"
    run_root -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $db_name_scholars TO $db_user;"
    
    log "Database setup completed"
}

# Configure firewall
configure_firewall() {
    log "Configuring firewall..."
    
    case "$OS" in
        debian|ubuntu)
            configure_ufw
            ;;
        arch)
            configure_iptables
            ;;
        fedora)
            configure_firewalld
            ;;
    esac
}

# Configure UFW (Debian/Ubuntu)
configure_ufw() {
    if ! command -v ufw &> /dev/null; then
        install_packages ufw
    fi
    
    run_root ufw --force reset
    run_root ufw default deny incoming
    run_root ufw default allow outgoing
    run_root ufw allow 22/tcp
    run_root ufw allow 80/tcp
    run_root ufw allow 443/tcp
    
    # Allow Docker communication if Docker is installed
    if command -v docker &> /dev/null; then
        run_root ufw allow from 172.16.0.0/12
    fi
    
    run_root ufw --force enable
    run_root ufw status verbose
    
    log "UFW firewall configured"
}

# Configure iptables (Arch Linux)
configure_iptables() {
    install_packages iptables
    
    # Basic iptables rules
    run_root iptables -F
    run_root iptables -X
    run_root iptables -t nat -F
    run_root iptables -t nat -X
    
    # Default policies
    run_root iptables -P INPUT DROP
    run_root iptables -P FORWARD DROP
    run_root iptables -P OUTPUT ACCEPT
    
    # Allow loopback
    run_root iptables -A INPUT -i lo -j ACCEPT
    run_root iptables -A OUTPUT -o lo -j ACCEPT
    
    # Allow established connections
    run_root iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
    
    # Allow SSH
    run_root iptables -A INPUT -p tcp --dport 22 -j ACCEPT
    
    # Allow HTTP
    run_root iptables -A INPUT -p tcp --dport 80 -j ACCEPT
    
    # Allow HTTPS
    run_root iptables -A INPUT -p tcp --dport 443 -j ACCEPT
    
    # Save iptables rules
    if command -v iptables-save &> /dev/null; then
        run_root sh -c "iptables-save > /etc/iptables/iptables.rules"
        run_root systemctl enable iptables
        run_root systemctl start iptables
    fi
    
    log "iptables firewall configured"
}

# Configure firewalld (Fedora)
configure_firewalld() {
    run_root systemctl start firewalld
    run_root systemctl enable firewalld
    
    run_root firewall-cmd --permanent --add-service=ssh
    run_root firewall-cmd --permanent --add-service=http
    run_root firewall-cmd --permanent --add-service=https
    
    # Allow Docker communication if Docker is installed
    if command -v docker &> /dev/null; then
        run_root firewall-cmd --permanent --zone=trusted --add-interface=docker0
    fi
    
    run_root firewall-cmd --reload
    run_root firewall-cmd --list-all
    
    log "firewalld configured"
}

# Install Docker (if needed)
install_docker() {
    if command -v docker &> /dev/null; then
        log "Docker already installed: $(docker --version)"
        return
    fi
    
    log "Installing Docker..."
    case "$OS" in
        debian|ubuntu)
            install_packages docker.io docker-compose-plugin
            ;;
        arch)
            install_packages docker docker-compose
            ;;
        fedora)
            install_packages docker docker-compose
            ;;
    esac
    
    # Start and enable Docker
    run_root systemctl start docker
    run_root systemctl enable docker
    
    # Add user to docker group
    run_root usermod -aG docker $USER
    
    log "Docker installed: $(docker --version)"
}

# Remove Docker
remove_docker() {
    log "Removing Docker and containers..."
    
    if command -v docker &> /dev/null; then
        # Stop all containers
        docker stop $(docker ps -aq) 2>/dev/null || true
        docker rm $(docker ps -aq) 2>/dev/null || true
        
        # Remove Docker images
        docker rmi $(docker images -q) 2>/dev/null || true
        
        # Remove Docker networks
        docker network prune -f 2>/dev/null || true
    fi
    
    # Uninstall Docker packages
    case "$OS" in
        debian|ubuntu)
            run_root apt remove -y docker.io docker-compose-plugin containerd runc 2>/dev/null || true
            run_root apt autoremove -y 2>/dev/null || true
            ;;
        arch)
            run_root pacman -Rns --noconfirm docker docker-compose 2>/dev/null || true
            ;;
        fedora)
            run_root dnf remove -y docker docker-compose 2>/dev/null || true
            ;;
    esac
    
    log "Docker removed successfully"
}

# Helper function to run commands with sudo if needed
run_root() {
    if [ "$(id -u)" -ne 0 ]; then
        sudo "$@"
    else
        "$@"
    fi
}

# Export functions for use in other scripts
export -f detect_os
export -f update_package_lists
export -f install_packages
export -f install_system_deps
export -f install_nodejs
export -f setup_databases
export -f configure_firewall
export -f configure_ufw
export -f configure_iptables
export -f configure_firewalld
export -f install_docker
export -f remove_docker
export -f run_root
