# Universal Setup Guide for Stephen Asatsa Website

## Overview

This universal setup solution allows the website to be installed and run from **any directory** without manual configuration. The system automatically detects paths, generates configurations, and sets up all services dynamically.

## 🚀 Quick Start

After cloning the repository to any location:

```bash
# Navigate to the website directory
cd /path/to/cloned/website

# Run universal installation
./scripts/install.sh

# Start development servers
./scripts/service-manager.sh dev-start
```

That's it! The system automatically handles everything else.

## 📁 What the Universal Setup Solves

### Before (Fixed Paths Problem)
- ❌ Hardcoded paths like `/home/codecrafter/Documents/combined/website`
- ❌ Manual configuration required for each installation
- ❌ Systemd services break when cloned to different directories
- ❌ Environment variables need manual updates

### After (Universal Solution)
- ✅ Auto-detects installation directory
- ✅ Zero configuration required
- ✅ Works from any directory location
- ✅ Dynamic service generation
- ✅ Automatic port detection

## 🛠️ Components

### 1. Path Detection System (`scripts/utils/path-detector.sh`)
- Automatically detects installation directory
- Finds available ports if defaults are occupied
- Generates environment configuration with correct paths
- Creates necessary directories automatically

### 2. Universal Installer (`scripts/install.sh`)
- Installs all system dependencies
- Sets up Python virtual environment
- Installs Node.js dependencies
- Builds the application
- Generates systemd services with dynamic paths
- Sets proper permissions

### 3. Service Manager (`scripts/service-manager.sh`)
- Works from any directory
- Manages both development and production services
- Provides status monitoring
- Handles log viewing
- Automatic path detection

### 4. Service Templates (`templates/systemd/`)
- Template-based systemd service generation
- Dynamic path substitution
- Works with any installation location

## 📋 Installation Options

### Basic Installation
```bash
./scripts/install.sh
```

### With Nginx
```bash
./scripts/install.sh --install-nginx
```

### With Docker
```bash
./scripts/install.sh --install-docker
```

### Custom Service User
```bash
./scripts/install.sh --user www-data
```

### Skip Dependencies (Faster)
```bash
./scripts/install.sh --skip-deps
```

### Start Services After Installation
```bash
./scripts/install.sh --start-services
```

## 🎮 Service Management Commands

### Development Mode
```bash
# Start development servers
./scripts/service-manager.sh dev-start

# Stop development servers
./scripts/service-manager.sh dev-stop
```

### Production Services (Systemd)
```bash
# Start systemd services
./scripts/service-manager.sh start

# Stop systemd services
./scripts/service-manager.sh stop

# Restart systemd services
./scripts/service-manager.sh restart

# Check service status
./scripts/service-manager.sh status

# View logs
./scripts/service-manager.sh logs backend
./scripts/service-manager.sh logs frontend -f
```

## 📂 Directory Structure After Installation

```
your-installation-directory/
├── .env.auto                    # Auto-generated configuration
├── logs/                         # Log files
│   ├── frontend.log
│   ├── frontend-error.log
│   ├── backend.log
│   └── backend-error.log
├── data/                         # Database and data files
├── public/uploads/                 # Upload directories
│   ├── admin/
│   └── gallery/
├── backend/venv/                 # Python virtual environment
└── scripts/                      # Management scripts
    ├── install.sh
    ├── service-manager.sh
    └── utils/
        └── path-detector.sh
```

## 🔧 Configuration Files

### Auto-Generated Environment (`.env.auto`)
The universal setup automatically creates `.env.auto` with correct paths:

```bash
# Installation paths (auto-detected)
INSTALL_DIR="/your/actual/installation/path"
BACKEND_DIR="/your/actual/installation/path/backend"
LOGS_DIR="/your/actual/installation/path/logs"

# Service configuration
SERVICE_USER="your-username"
FRONTEND_PORT=3002
BACKEND_PORT=5001

# Auto-generated secrets
NEXTAUTH_SECRET="[random-secure-string]"
```

### Template-Based Systemd Services
Services are generated from templates with variable substitution:

```bash
# Template variables
{{INSTALL_DIR}}        # Becomes actual installation path
{{BACKEND_DIR}}        # Becomes actual backend path
{{SERVICE_USER}}       # Becomes actual service user
{{FRONTEND_PORT}}      # Becomes actual frontend port
```

## 🌐 Access Points After Installation

### Development Mode
- **Frontend**: http://localhost:3002
- **Backend API**: http://localhost:5001
- **Admin Panel**: http://localhost:3002/admin

### Production Mode (with Nginx)
- **Website**: http://localhost (Port 80)
- **Backend API**: http://localhost:5001
- **Admin Panel**: http://localhost/admin

## 🔍 Troubleshooting

### Port Conflicts
The system automatically detects port conflicts and uses alternatives:
- Frontend: 3002, 3003, 3004...
- Backend: 5001, 5002, 5003...

### Permission Issues
```bash
# Fix ownership
sudo chown -R $USER:$USER /path/to/installation

# Fix permissions
chmod +x scripts/*.sh
chmod +x scripts/utils/*.sh
```

### Service Status
```bash
# Check all services
./scripts/service-manager.sh status

# View specific logs
./scripts/service-manager.sh logs backend -f
./scripts/service-manager.sh logs frontend -f
```

### Manual Service Generation
If automatic service generation fails:
```bash
# Generate services manually
./scripts/setup-services.sh setup
```

## 🔄 Migration from Old Setup

If you have an existing installation:

1. **Backup your data**:
   ```bash
   cp -r /old/path/data /new/path/
   cp -r /old/path/public/uploads /new/path/
   ```

2. **Run universal setup**:
   ```bash
   cd /new/path
   ./scripts/install.sh --skip-deps
   ```

3. **Update any custom configurations** in `.env.auto`

## 🚀 Deployment Scenarios

### Scenario 1: Fresh Clone to Random Directory
```bash
git clone https://github.com/your-repo.git /random/path/website
cd /random/path/website
./scripts/install.sh --start-services
```

### Scenario 2: Development Machine Setup
```bash
git clone https://github.com/your-repo.git ~/dev-website
cd ~/dev-website
./scripts/install.sh
./scripts/service-manager.sh dev-start
```

### Scenario 3: Production Server Setup
```bash
git clone https://github.com/your-repo.git /opt/stephenasatsa-website
cd /opt/stephenasatsa-website
./scripts/install.sh --install-nginx --user www-data --start-services
```

## 📝 Environment Variables

The universal setup respects these environment variables:

- `SERVICE_USER` - Override service user
- `FRONTEND_PORT` - Override frontend port
- `BACKEND_PORT` - Override backend port
- `INSTALL_NGINX` - Set to 1 to install Nginx
- `INSTALL_DOCKER` - Set to 1 to install Docker
- `START_SERVICES` - Set to 1 to auto-start services

## 🎯 Key Benefits

1. **Zero Configuration**: Works out of the box from any directory
2. **Automatic Path Detection**: No hardcoded paths
3. **Dynamic Service Generation**: Services adapt to installation location
4. **Port Conflict Resolution**: Automatically finds available ports
5. **Development & Production**: Supports both modes seamlessly
6. **Error Handling**: Comprehensive error checking and recovery
7. **Rollback Support**: Safe installation with rollback capability

## 📞 Support

If you encounter issues:

1. Check service status: `./scripts/service-manager.sh status`
2. View logs: `./scripts/service-manager.sh logs backend -f`
3. Verify paths: `cat .env.auto`
4. Re-run setup: `./scripts/install.sh --skip-deps`

The universal setup is designed to work reliably from any directory location without manual intervention.
