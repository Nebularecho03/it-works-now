# Multi-OS Deployment Support

The deployment scripts now support Debian/Ubuntu, Arch Linux, and Fedora servers.

## What Changed

### New Shared Library
- **File**: `website/scripts/utilities/os-detect.sh`
- **Purpose**: Centralized OS detection and package manager abstraction
- **Features**:
  - Automatic OS detection (Debian/Ubuntu, Arch, Fedora)
  - Package manager abstraction (apt, pacman, dnf)
  - PostgreSQL setup for each distribution
  - Firewall configuration (UFW, iptables, firewalld)
  - Docker installation/removal
  - Node.js installation

### Updated Scripts
All three deployment scripts now source the shared library:
- `deploy-both-projects.sh` - Bare metal deployment with systemd
- `deploy-docker.sh` - Docker-based deployment
- `deploy-systemd-bare-metal.sh` - Bare metal without Docker

## Supported Distributions

### Debian/Ubuntu
- **Package Manager**: apt
- **PostgreSQL**: postgresql, postgresql-contrib
- **Firewall**: UFW
- **Node.js**: NodeSource repository
- **Docker**: docker.io, docker-compose-plugin

### Arch Linux
- **Package Manager**: pacman
- **PostgreSQL**: postgresql (requires manual initdb)
- **Firewall**: iptables
- **Node.js**: Official Arch packages
- **Docker**: docker, docker-compose

### Fedora
- **Package Manager**: dnf
- **PostgreSQL**: postgresql-server (requires postgresql-setup)
- **Firewall**: firewalld
- **Node.js**: dnf module (nodejs:20)
- **Docker**: docker, docker-compose

## Usage

The scripts work the same way on all supported distributions:

```bash
# Deploy both projects (bare metal with systemd)
./deploy-both-projects.sh

# Deploy with Docker
./deploy-docker.sh

# Deploy bare metal without Docker
./deploy-systemd-bare-metal.sh
```

## OS-Specific Notes

### Arch Linux
- PostgreSQL requires manual initialization on first run
- iptables rules are saved to `/etc/iptables/iptables.rules`
- Uses `base-devel` instead of `build-essential`

### Fedora
- PostgreSQL requires `postgresql-setup --initdb` on first run
- Uses firewalld instead of UFW
- Node.js installed via dnf modules

### Debian/Ubuntu
- No special configuration needed
- Uses UFW firewall
- Node.js installed via NodeSource repository

## Environment Variables

All scripts accept the same environment variables:

```bash
DB_USER=codecrafter
DB_PASSWORD=change_this_secure_password
DB_NAME_WEBSITE=stephenasatsa
DB_NAME_SCHOLARS=scholarforge
```

## Troubleshooting

### OS Detection Fails
If the script cannot detect your OS:
```bash
# Check /etc/os-release
cat /etc/os-release

# Manually set OS if needed (not recommended)
export OS=debian
```

### Package Installation Fails
- Ensure you have sudo privileges
- Check that your package manager is up to date
- For Arch: `sudo pacman -Syu`
- For Fedora: `sudo dnf upgrade`
- For Debian/Ubuntu: `sudo apt update && sudo apt upgrade`

### PostgreSQL Issues
- **Arch**: Ensure PostgreSQL is initialized: `sudo -u postgres initdb -D /var/lib/postgres/data`
- **Fedora**: Run `sudo postgresql-setup --initdb` if needed
- **Debian/Ubuntu**: PostgreSQL should auto-configure

### Firewall Issues
- **Arch**: Check iptables rules: `sudo iptables -L -n`
- **Fedora**: Check firewalld: `sudo firewall-cmd --list-all`
- **Debian/Ubuntu**: Check UFW: `sudo ufw status verbose`

## Testing

To test the OS detection library:

```bash
# Source the library
source website/scripts/utilities/os-detect.sh

# Detect OS
detect_os

# Test package installation
install_packages curl git

# Test firewall configuration
configure_firewall
```

## Backward Compatibility

The changes are fully backward compatible:
- Existing Debian/Ubuntu deployments work without modification
- All existing environment variables and configuration options remain the same
- Scripts default to Debian/Ubuntu behavior if OS detection fails

## Future Enhancements

Potential additions:
- Support for openSUSE (zypper)
- Support for Alpine Linux (apk)
- Support for RHEL/CentOS (yum/dnf)
- Automatic SSL certificate setup with Let's Encrypt
- Database backup automation
- Health check monitoring integration
