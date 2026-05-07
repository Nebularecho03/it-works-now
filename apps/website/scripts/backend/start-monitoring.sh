#!/bin/bash

# Server Monitoring Service Start Script
# This script starts the server monitoring agent

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
BACKEND_DIR="$PROJECT_ROOT/backend"
SERVICE_NAME="server-monitor"

echo "🖥️  Starting Server Monitoring Service..."

# Check if running as root for service operations
if [[ $EUID -eq 0 ]]; then
    echo "📋 Installing systemd service..."
    
    # Copy service file to systemd directory
    cp "$PROJECT_ROOT/systemd/$SERVICE_NAME.service" "/etc/systemd/system/"
    
    # Reload systemd daemon
    systemctl daemon-reload
    
    # Enable and start the service
    systemctl enable "$SERVICE_NAME"
    systemctl start "$SERVICE_NAME"
    
    echo "✅ Service started and enabled"
    echo "📊 Check status with: systemctl status $SERVICE_NAME"
    echo "📝 View logs with: journalctl -u $SERVICE_NAME -f"
    
else
    echo "⚠️  Not running as root. Starting in foreground mode..."
    echo "💡 To install as a service, run with sudo"
    echo ""
    
    # Check if psutil is installed
    if ! python3 -c "import psutil" 2>/dev/null; then
        echo "📦 Installing psutil..."
        cd "$BACKEND_DIR"
        pip3 install psutil
    fi
    
    # Start the monitoring script directly
    cd "$BACKEND_DIR"
    python3 server_monitor.py
fi
