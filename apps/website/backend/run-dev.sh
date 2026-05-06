#!/bin/bash

# Development script for Flask Session Manager + Next.js Admin

echo "🚀 Starting Admin Development Environment"
echo "========================================"

# Set environment variables
export FLASK_PORT=5001
export SESSION_TIMEOUT=300
export SQLITE_PATH="./data/users.db"
export ALLOWED_ORIGIN="http://localhost:3000"
export NEXT_PUBLIC_FLASK_SESSION_URL="http://localhost:5001"

# Create data directory if it doesn't exist
mkdir -p data

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
echo "📚 Installing Python dependencies..."
source venv/bin/activate
pip install -r requirements.txt

# Start Flask session manager in background
echo "🔐 Starting Flask Session Manager on port 5001..."
python admin_session_manager.py &
FLASK_PID=$!

# Wait a moment for Flask to start
sleep 2

# Check if Flask started successfully
if curl -s http://localhost:5001/api/admin/health > /dev/null; then
    echo "✅ Flask Session Manager is running (PID: $FLASK_PID)"
else
    echo "❌ Flask Session Manager failed to start"
    kill $FLASK_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🌐 Next.js Admin URL: http://localhost:3000/admin"
echo "🔐 Flask Login URL: http://localhost:5001/login"
echo ""
echo "Press Ctrl+C to stop both services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $FLASK_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running
wait
