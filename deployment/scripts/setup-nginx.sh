#!/bin/bash

# Nginx setup script for single-domain integration
# This script configures nginx for the combined website and Schoolars-work-bench projects

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN_NAME="${DOMAIN_NAME:-localhost}"
NGINX_CONF_SOURCE="/home/codecrafter/Documents/combined/nginx.conf"
NGINX_CONF_DEST="/etc/nginx/sites-available/combined"
NGINX_CONF_ENABLED="/etc/nginx/sites-enabled/combined"
CERTBOT_DIR="/var/www/certbot"
USE_SSL="${USE_SSL:-false}"

echo -e "${GREEN}=== Nginx Setup for Single-Domain Integration ===${NC}"
echo "Domain: $DOMAIN_NAME"
echo "SSL: $USE_SSL"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Install nginx if not present
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}Installing nginx...${NC}"
    apt update
    apt install -y nginx
fi

# Create certbot directory for Let's Encrypt
echo -e "${YELLOW}Creating certbot directory...${NC}"
mkdir -p "$CERTBOT_DIR"
chown -R www-data:www-data "$CERTBOT_DIR"

# Backup existing nginx configuration
if [ -f "$NGINX_CONF_DEST" ]; then
    echo -e "${YELLOW}Backing up existing nginx configuration...${NC}"
    cp "$NGINX_CONF_DEST" "${NGINX_CONF_DEST}.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Copy and customize nginx configuration
echo -e "${YELLOW}Installing nginx configuration...${NC}"
if [ "$USE_SSL" = "true" ]; then
    sed "s/your-domain.com/$DOMAIN_NAME/g" "$NGINX_CONF_SOURCE" > "$NGINX_CONF_DEST"
else
    # For local development, use localhost without SSL
    sed "s/your-domain.com/$DOMAIN_NAME/g" "$NGINX_CONF_SOURCE" > "$NGINX_CONF_DEST"
fi

# Create symbolic link to enable site
echo -e "${YELLOW}Enabling site...${NC}"
ln -sf "$NGINX_CONF_DEST" "$NGINX_CONF_ENABLED"

# Remove default nginx site if it exists
if [ -L "/etc/nginx/sites-enabled/default" ]; then
    echo -e "${YELLOW}Removing default nginx site...${NC}"
    rm /etc/nginx/sites-enabled/default
fi

# Test nginx configuration
echo -e "${YELLOW}Testing nginx configuration...${NC}"
if nginx -t; then
    echo -e "${GREEN}Nginx configuration is valid!${NC}"
else
    echo -e "${RED}Nginx configuration test failed!${NC}"
    echo "Please check the configuration file: $NGINX_CONF_DEST"
    exit 1
fi

# Restart nginx
echo -e "${YELLOW}Restarting nginx...${NC}"
systemctl restart nginx

# Ask about SSL certificate (skip for localhost)
if [ "$USE_SSL" = "true" ] && [ "$DOMAIN_NAME" != "localhost" ]; then
    echo ""
    echo -e "${GREEN}=== SSL Certificate Setup ===${NC}"
    read -p "Do you want to set up SSL with Let's Encrypt? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Install certbot if not present
    if ! command -v certbot &> /dev/null; then
        echo -e "${YELLOW}Installing certbot...${NC}"
        apt install -y certbot python3-certbot-nginx
    fi
    
    # Obtain SSL certificate
    echo -e "${YELLOW}Obtaining SSL certificate...${NC}"
    certbot --nginx -d "$DOMAIN_NAME" -d "www.$DOMAIN_NAME" --non-interactive --agree-tos --email "admin@$DOMAIN_NAME" || {
        echo -e "${RED}Failed to obtain SSL certificate. You may need to configure DNS first.${NC}"
        echo "Run this command after DNS is configured:"
        echo "sudo certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME"
    }
    
        # Setup auto-renewal
        echo -e "${YELLOW}Setting up SSL auto-renewal...${NC}"
        (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && systemctl reload nginx") | crontab -
    fi
elif [ "$DOMAIN_NAME" = "localhost" ]; then
    echo -e "${YELLOW}Skipping SSL setup for localhost (local development)${NC}"
fi

echo ""
echo -e "${GREEN}=== Setup Complete ===${NC}"
echo "Nginx is now configured for domain: $DOMAIN_NAME"
echo ""
if [ "$USE_SSL" = "true" ] && [ "$DOMAIN_NAME" != "localhost" ]; then
    echo "Service endpoints:"
    echo "  - Main website: https://$DOMAIN_NAME"
    echo "  - Admin panel: https://$DOMAIN_NAME/admin"
    echo "  - Scholar Forge: https://$DOMAIN_NAME/scholars"
    echo "  - Admin API: https://$DOMAIN_NAME/api/"
    echo "  - Scholars API: https://$DOMAIN_NAME/scholars-api/"
else
    echo "Service endpoints (HTTP):"
    echo "  - Main website: http://$DOMAIN_NAME"
    echo "  - Admin panel: http://$DOMAIN_NAME/admin"
    echo "  - Scholar Forge: http://$DOMAIN_NAME/scholars"
    echo "  - Admin API: http://$DOMAIN_NAME/api/"
    echo "  - Scholars API: http://$DOMAIN_NAME/scholars-api/"
fi
echo ""
echo "Configuration file: $NGINX_CONF_DEST"
echo "Logs: /var/log/nginx/combined-*.log"
echo ""
echo "To reload nginx after changes:"
echo "  sudo nginx -t && sudo systemctl reload nginx"
