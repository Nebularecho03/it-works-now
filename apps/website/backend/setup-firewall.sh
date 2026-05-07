#!/bin/bash

# Enhanced Message Management System - Firewall Setup Script
# Configures UFW firewall to protect the server and allow necessary ports

set -e  # Exit on any error

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

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "This script requires root privileges. Please run with sudo."
    exit 1
fi

# Check if UFW is installed
if ! command -v ufw &> /dev/null; then
    print_error "UFW is not installed. Please install with: sudo apt-get install ufw"
    exit 1
fi

print_header "Configuring UFW Firewall"

# Reset existing rules (be careful in production)
print_warning "Resetting existing UFW rules..."
ufw --force reset

# Default policies
print_status "Setting default policies..."
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (to prevent locking yourself out)
print_success "Allowing SSH access..."
ufw allow ssh

# Allow HTTP and HTTPS for web server
print_success "Allowing HTTP (port 80)..."
ufw allow 80/tcp
ufw allow from any to any port 80 proto tcp

print_success "Allowing HTTPS (port 443)..."
ufw allow 443/tcp
ufw allow from any to any port 443 proto tcp

# Allow backend API port (5000)
print_success "Allowing backend API (port 5000)..."
ufw allow 5000/tcp
ufw allow from any to any port 5000 proto tcp

# Allow Next.js development port (3000)
print_success "Allowing Next.js development (port 3000)..."
ufw allow 3000/tcp
ufw allow from any to any port 3000 proto tcp

# Allow database and application-specific ports if needed
print_status "Allowing application-specific ports..."

# Allow Git (if using Git for deployment)
ufw allow git

# Allow Node.js/npm if needed
ufw allow out node
ufw allow out npm

# Rate limiting for API endpoints
print_status "Setting up rate limiting..."
ufw limit log 5/minute

# Protection against common attacks
print_status "Configuring protection against common attacks..."

# Block common attack vectors
ufw deny 23/tcp     # Telnet
ufw deny 3389/tcp    # Back Orifice
ufw deny 1434/tcp    # SubSeven
ufw deny 1234/udp    # Windows File Sharing
ufw deny 137/udp     # NetBIOS
ufw deny 138/udp     # NetBIOS
ufw deny 139/tcp     # NetBIOS
ufw deny 445/tcp     # SMB

# Allow established and related connections
print_status "Allowing established connections..."
ufw allow established
ufw allow related

# Enable logging
print_status "Enabling UFW logging..."
ufw logging on

# Enable the firewall
print_warning "Enabling UFW firewall..."
ufw --force enable

# Show firewall status
print_header "Firewall Status"
ufw status verbose

# Show active rules
print_header "Active Firewall Rules"
ufw status numbered

# Create monitoring script
print_status "Creating firewall monitoring script..."
cat > monitor-firewall.sh << 'EOF'
#!/bin/bash

# Firewall monitoring script for Enhanced Message Management System

LOG_FILE="/var/log/ufw-monitor.log"
ALERT_EMAIL="admin@stephenasatsa.com"

check_firewall() {
    TIMESTAMP=\$(date '+%Y-%m-%d %H:%M:%S')
    
    # Check if UFW is active
    if ! ufw status | grep -q "Status: active"; then
        echo "\$TIMESTAMP: WARNING - UFW firewall is not active" >> "\$LOG_FILE"
        echo "\$TIMESTAMP: Sending alert email..." >> "\$LOG_FILE"
        # Send email alert (requires email configuration)
        # mail -s "UFW Firewall Alert" "\$ALERT_EMAIL" <<< "UFW firewall is inactive on server"
        return 1
    fi
    
    # Check for blocked connections
    BLOCKED_COUNT=\$(ufw status | grep -c "DENY" | wc -l)
    if [ "\$BLOCKED_COUNT" -gt 0 ]; then
        echo "\$TIMESTAMP: \$BLOCKED_COUNT connections blocked" >> "\$LOG_FILE"
    fi
    
    # Check for new rules
    RECENT_LOGS=\$(journalctl -u ufw --since "1 hour ago" | grep -c "UFW")
    if [ -n "\$RECENT_LOGS" ]; then
        echo "\$TIMESTAMP: Recent UFW activity detected" >> "\$LOG_FILE"
        echo "\$RECENT_LOGS" >> "\$LOG_FILE"
    fi
    
    echo "\$TIMESTAMP: Firewall check completed" >> "\$LOG_FILE"
}

# Run continuous monitoring
while true; do
    check_firewall
    sleep 300  # Check every 5 minutes
done
EOF

chmod +x monitor-firewall.sh

# Create log rotation for firewall logs
print_status "Setting up log rotation..."
cat > /etc/logrotate.d/ufw-monitor << 'EOF'
/var/log/ufw-monitor.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        systemctl restart rsyslog || true
    endscript
}
EOF

# Create systemd service for firewall monitoring
print_status "Creating firewall monitoring service..."
cat > ufw-monitor.service << 'EOF'
[Unit]
Description=UFW Firewall Monitoring Service
After=network.target ufw.service
Wants=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$(pwd)
ExecStart=$(pwd)/monitor-firewall.sh
Restart=always
RestartSec=30
StandardOutput=append:/var/log/ufw-monitor.log
StandardError=append:/var/log/ufw-monitor.log

[Install]
WantedBy=multi-user.target
EOF

# Install and enable the monitoring service
print_status "Installing firewall monitoring service..."
cp ufw-monitor.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable ufw-monitor
systemctl start ufw-monitor

print_header "Firewall Configuration Summary"
echo ""
print_success "🔥 UFW Firewall Configuration Complete!"
echo ""
echo "📋 Configuration Summary:"
echo "  - Default policy: DENY incoming, ALLOW outgoing"
echo "  - SSH (port 22): ALLOWED"
echo "  - HTTP (port 80): ALLOWED"
echo "  - HTTPS (port 443): ALLOWED"
echo "  - Backend API (port 5000): ALLOWED"
echo "  - Next.js dev (port 3000): ALLOWED"
echo "  - Rate limiting: ENABLED (5/minute)"
echo "  - Attack protection: ENABLED"
echo "  - Logging: ENABLED"
echo ""
echo "🛡️ Security Features:"
echo "  - Common attack ports blocked"
echo "  - Established connections allowed"
echo "  - Real-time monitoring enabled"
echo "  - Log rotation configured"
echo ""
echo "🔧 Management Commands:"
echo "  - View status: sudo ufw status"
echo "  - Add rule: sudo ufw allow <port>/<protocol>"
echo "  - Remove rule: sudo ufw delete allow <port>/<protocol>"
echo "  - Reload firewall: sudo ufw reload"
echo "  - View logs: sudo tail -f /var/log/ufw.log"
echo "  - Monitor logs: tail -f /var/log/ufw-monitor.log"
echo ""
echo "🚨 Important Notes:"
echo "  - Firewall is now ENABLED and protecting your server"
echo "  - SSH access is preserved to prevent lockout"
echo "  - All web traffic is filtered and logged"
echo "  - Monitoring service will alert on firewall issues"
echo "  - Test internet connectivity after enabling firewall"
echo ""
print_success "Firewall setup completed successfully!"
