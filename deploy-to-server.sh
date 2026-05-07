#!/bin/bash

# Script to copy deployment files to remote server
# Usage: ./deploy-to-server.sh <server-ip> <username>

SERVER_IP="${1:-}"
USERNAME="${2:-codecrafter}"

if [ -z "$SERVER_IP" ]; then
    echo "Usage: $0 <server-ip> [username]"
    echo "Example: $0 192.168.1.100 codecrafter"
    exit 1
fi

echo "Copying deployment files to $USERNAME@$SERVER_IP..."

# Create deployment directory on server
ssh "$USERNAME@$SERVER_IP" "mkdir -p ~/deployment"

# Copy deployment script
scp QUICK_DEPLOY.sh "$USERNAME@$SERVER_IP:~/deployment/"

# Copy deployment guide
scp SERVER_DEPLOYMENT_GUIDE.md "$USERNAME@$SERVER_IP:~/deployment/"

echo "Files copied successfully!"
echo ""
echo "On the server, run:"
echo "cd ~/deployment"
echo "chmod +x QUICK_DEPLOY.sh"
echo "sudo ./QUICK_DEPLOY.sh"
