#!/bin/bash

# Server Monitoring Service Stop Script
# This script stops the server monitoring agent

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
SERVICE_NAME="server-monitor"

echo "🛑 Stopping Server Monitoring Service..."

# Check if running as root for service operations
if [[ $EUID -eq 0 ]]; then
    echo "📋 Stopping systemd service..."
    
    # Stop and disable the service
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        systemctl stop "$SERVICE_NAME"
        echo "✅ Service stopped"
    else
        echo "ℹ️  Service was not running"
    fi
    
    if systemctl is-enabled --quiet "$SERVICE_NAME"; then
        systemctl disable "$SERVICE_NAME"
        echo "✅ Service disabled"
    fi
    
    # Remove service file
    if [ -f "/etc/systemd/system/$SERVICE_NAME.service" ]; then
        rm "/etc/systemd/system/$SERVICE_NAME.service"
        systemctl daemon-reload
        echo "✅ Service file removed"
    fi
    
else
    echo "⚠️  Not running as root."
    echo "💡 To stop the systemd service, run with sudo"
    echo "💡 To stop a foreground process, use Ctrl+C"
fi

echo "🏁 Server monitoring service stopped"
