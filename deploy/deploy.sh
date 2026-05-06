#!/bin/bash

# Stephen Asatsa - Quick Deploy Script
# For pre-built deployments - only sets up nginx and systemd services

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Config
PROJECT_NAME="stephenasatsa"
INSTALL_DIR="/opt/${PROJECT_NAME}"
DOMAIN="${1:-localhost}"

log() { echo -e "${GREEN}[$(date '+%H:%M:%S')] $1${NC}"; }
warn() { echo -e "${YELLOW}[$(date '+%H:%M:%S')] WARNING: $1${NC}"; }
error() { echo -e "${RED}[$(date '+%H:%M:%S')] ERROR: $1${NC}"; exit 1; }

# Check root
if [[ $EUID -ne 0 ]]; then error "Run as root (sudo)"; fi

# Check if project files exist
if [[ ! -d "$INSTALL_DIR/apps/website/.next" ]]; then
    error "Pre-built files not found at $INSTALL_DIR/apps/website/.next"
    echo "Run the build first or copy pre-built files to $INSTALL_DIR/"
    exit 1
fi

log "Starting quick deploy for $DOMAIN..."

# 1. Setup nginx
log "Configuring nginx..."
cat > /etc/nginx/sites-available/${PROJECT_NAME} << EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

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

    location /api/ {
        proxy_pass http://localhost:8001/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /admin {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /_next/static {
        alias ${INSTALL_DIR}/apps/website/.next/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

ln -sf /etc/nginx/sites-available/${PROJECT_NAME} /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
log "Nginx configured"

# 2. Install systemd services
log "Installing systemd services..."
cp "$INSTALL_DIR/production/systemd/"*.service /etc/systemd/system/ 2>/dev/null || {
    warn "No systemd services found in $INSTALL_DIR/production/systemd/"
    warn "Using basic service files..."
    
    # Create basic frontend service
    cat > /etc/systemd/system/${PROJECT_NAME}-frontend.service << EOF
[Unit]
Description=Stephen Asatsa Website Frontend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=${INSTALL_DIR}/apps/website
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    # Create basic backend service
    cat > /etc/systemd/system/${PROJECT_NAME}-backend.service << EOF
[Unit]
Description=Stephen Asatsa Website Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=${INSTALL_DIR}/apps/website/backend
ExecStart=${INSTALL_DIR}/apps/website/backend/venv/bin/python server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
}

sed -i "s|/opt/stephenasatsa|${INSTALL_DIR}|g" /etc/systemd/system/${PROJECT_NAME}-*.service
systemctl daemon-reload

# Enable services
for service in ${PROJECT_NAME}-frontend ${PROJECT_NAME}-backend; do
    if [[ -f "/etc/systemd/system/${service}.service" ]]; then
        systemctl enable ${service}
        log "Enabled ${service}"
    fi
done

# 3. Set permissions
log "Setting permissions..."
chown -R www-data:www-data "$INSTALL_DIR"
chmod -R 755 "$INSTALL_DIR"
mkdir -p /var/log/${PROJECT_NAME}
chown www-data:www-data /var/log/${PROJECT_NAME}

# 4. Start services
log "Starting services..."
systemctl start ${PROJECT_NAME}-backend || warn "Backend failed to start"
sleep 3
systemctl start ${PROJECT_NAME}-frontend || warn "Frontend failed to start"

# 5. Setup SSL if domain is not localhost
if [[ "$DOMAIN" != "localhost" ]]; then
    log "Setting up SSL for $DOMAIN..."
    if command -v certbot &> /dev/null; then
        certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "admin@$DOMAIN" || warn "SSL setup failed"
    else
        warn "Certbot not found, skipping SSL"
    fi
fi

# 6. Firewall
log "Configuring firewall..."
ufw allow 'Nginx Full' 2>/dev/null || true
ufw allow ssh 2>/dev/null || true

# 7. Health check
log "Checking services..."
if systemctl is-active --quiet ${PROJECT_NAME}-frontend; then
    log "✓ Frontend running"
else
    warn "✗ Frontend not running"
fi

if systemctl is-active --quiet ${PROJECT_NAME}-backend; then
    log "✓ Backend running"
else
    warn "✗ Backend not running"
fi

if curl -s --max-time 5 -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|307"; then
    log "✓ Website responding"
else
    warn "✗ Website not responding"
fi

echo ""
echo -e "${GREEN}=== Deploy Summary ===${NC}"
echo -e "Domain: ${BLUE}${DOMAIN}${NC}"
echo -e "URL: ${BLUE}http://${DOMAIN}${NC}"
echo -e "Admin: ${BLUE}http://${DOMAIN}/admin${NC}"
echo -e "Project: ${BLUE}${INSTALL_DIR}${NC}"
echo ""
echo -e "${GREEN}Commands:${NC}"
echo -e "Status: ${BLUE}systemctl status ${PROJECT_NAME}-*${NC}"
echo -e "Logs: ${BLUE}journalctl -u ${PROJECT_NAME}-* -f${NC}"
echo -e "Restart: ${BLUE}systemctl restart ${PROJECT_NAME}-frontend${NC}"
echo ""
log "Deploy completed!"
