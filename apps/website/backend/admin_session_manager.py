#!/usr/bin/env python3
"""
Lightweight Flask Session Manager for Admin Panel
Integrates with existing SQLite database while providing in-memory session tracking

This module provides secure session management with auto-logout functionality
for Next.js admin interfaces. Features include:

- In-memory session tracking with thread-safe operations
- PBKDF2 password hashing compatible with existing database
- Rate limiting for login attempts (5 per minute per IP)
- Automatic session cleanup with configurable timeout
- CORS support for Next.js integration
- Comprehensive audit logging
- Health monitoring endpoint

Architecture:
- Flask API server on configurable port (default: 5001)
- In-memory session store with background cleanup thread
- Integration with existing SQLite user database
- Session validation middleware for protected routes

Author: Admin System Integration
License: See main project license
"""

import os
import json
import time
import threading
import sqlite3
import secrets
import hashlib
import functools
from datetime import datetime, timezone, timedelta
from typing import Dict, Optional, Any
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

# ============================================================================
# CONFIGURATION
# ============================================================================

# Server Configuration
FLASK_PORT = int(os.getenv('FLASK_PORT', 5001))  # Flask server port
ALLOWED_ORIGIN = os.getenv('ALLOWED_ORIGIN', 'http://localhost:3000')  # CORS allowed origin

# Session Configuration
SESSION_TIMEOUT = int(os.getenv('SESSION_TIMEOUT', 300))  # Auto-logout timeout (5 minutes)

# Rate Limiting Configuration
RATE_LIMIT_ATTEMPTS = int(os.getenv('RATE_LIMIT_ATTEMPTS', 5))  # Max attempts per window
RATE_LIMIT_WINDOW = int(os.getenv('RATE_LIMIT_WINDOW', 60))  # Time window in seconds

# Database Configuration
SQLITE_PATH = os.getenv('SQLITE_PATH', 'data/users.db')  # Path to SQLite database

# ============================================================================
# IN-MEMORY STORES
# ============================================================================

# Active sessions: session_id -> session_data
# Each session contains: user_id, username, display_name, role, ip_address, 
# created_at, last_activity
active_sessions: Dict[str, Dict] = {}

# Rate limiting: ip_address -> {count, last_attempt}
# Prevents brute force attacks by limiting login attempts per IP
login_attempts: Dict[str, Dict] = {}

# ============================================================================
# THREAD SAFETY
# ============================================================================

# Prevents race conditions when accessing shared memory stores
session_lock = threading.Lock()
rate_limit_lock = threading.Lock()

app = Flask(__name__)
CORS(app, origins=[ALLOWED_ORIGIN], supports_credentials=True)

# ============================================================================
# DATABASE INTERFACE
# ============================================================================

class UserDatabase:
    """
    Interface to existing SQLite database
    
    Provides methods for user authentication and audit logging while maintaining
    compatibility with existing database schema from simple_server.py
    """
    
    def __init__(self, db_path: str):
        self.db_path = db_path
    
    def verify_user(self, username: str, password: str) -> Optional[Dict]:
        """Verify user credentials against existing SQLite database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                user = conn.execute(
                    "SELECT * FROM users WHERE username = ? AND is_active = 1",
                    (username,)
                ).fetchone()
                
                if not user:
                    return None
                
                # Use existing password verification from simple_server.py
                if not self._verify_password(password, user['password_hash']):
                    return None
                
                # Update last login
                conn.execute(
                    "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
                    (user['id'],)
                )
                conn.commit()
                
                return dict(user)
        except Exception as e:
            print(f"Database error: {e}")
            return None
    
    def _verify_password(self, password: str, stored_hash: str) -> bool:
        """Verify password using existing method from simple_server.py"""
        try:
            import base64
            import hmac
            
            # Handle PBKDF2 hashes from existing system
            if stored_hash.startswith('pbkdf2_sha256$'):
                parts = stored_hash.split('$')
                if len(parts) != 4:
                    return False
                
                algorithm, iterations, salt, encoded = parts
                if algorithm != 'pbkdf2_sha256':
                    return False
                
                digest = hashlib.pbkdf2_hmac(
                    'sha256',
                    password.encode('utf-8'),
                    salt.encode('utf-8'),
                    int(iterations)
                )
                candidate = base64.urlsafe_b64encode(digest).decode('ascii')
                return hmac.compare_digest(candidate, encoded)
            
            # Fallback to werkzeug for other hash formats
            return check_password_hash(stored_hash, password)
        except Exception:
            return False
    
    def log_audit_event(self, user_id: Optional[int], action: str, actor: str, 
                      summary: str, ip_address: Optional[str] = None):
        """Log audit event to existing database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT INTO audit_log (user_id, action, actor, summary, ip_address)
                    VALUES (?, ?, ?, ?, ?)
                """, (user_id, action, actor, summary, ip_address))
                conn.commit()
        except Exception as e:
            print(f"Audit log error: {e}")

# Initialize database connection
db = UserDatabase(SQLITE_PATH)

def generate_session_id() -> str:
    """
    Generate cryptographically secure session ID
    
    Returns:
        str: 32-byte hexadecimal token suitable for session identification
    """
    return secrets.token_hex(32)

def is_rate_limited(ip_address: str) -> bool:
    """
    Check if IP is rate limited for login attempts
    
    Implements sliding window rate limiting to prevent brute force attacks.
    Tracks attempts per IP and resets counter after time window expires.
    
    Args:
        ip_address: Client IP address to check
        
    Returns:
        bool: True if rate limit exceeded, False otherwise
    """
    with rate_limit_lock:
        now = time.time()
        
        # Initialize IP tracking if not exists
        if ip_address not in login_attempts:
            login_attempts[ip_address] = {'count': 0, 'last_attempt': 0}
        
        attempts = login_attempts[ip_address]
        
        # Reset counter if time window has passed
        if now - attempts['last_attempt'] > RATE_LIMIT_WINDOW:
            attempts['count'] = 0
        
        # Check if rate limit exceeded
        if attempts['count'] >= RATE_LIMIT_ATTEMPTS:
            return True
        
        # Increment counter and update timestamp
        attempts['count'] += 1
        attempts['last_attempt'] = now
        return False

def cleanup_expired_sessions():
    """
    Background thread to clean up expired sessions
    
    Runs continuously in background, checking for expired sessions every 60 seconds.
    Removes sessions that have exceeded the configured timeout period.
    """
    while True:
        try:
            current_time = datetime.now(timezone.utc)
            expired_sessions = []
            
            with session_lock:
                # Check each active session for expiration
                for session_id, session_data in active_sessions.items():
                    last_activity = session_data['last_activity']
                    
                    # Handle string datetime conversion
                    if isinstance(last_activity, str):
                        last_activity = datetime.fromisoformat(last_activity.replace('Z', '+00:00'))
                    
                    # Check if session has expired
                    if current_time - last_activity > timedelta(seconds=SESSION_TIMEOUT):
                        expired_sessions.append(session_id)
                
                # Remove expired sessions from active store
                for session_id in expired_sessions:
                    del active_sessions[session_id]
                    print(f"Cleaned up expired session: {session_id}")
            
        except Exception as e:
            print(f"Session cleanup error: {e}")
        
        # Wait before next cleanup cycle
        time.sleep(60)  # Run every minute

def require_session(f):
    """
    Decorator to require valid session for protected endpoints
    
    This decorator checks for a valid session ID in the X-Session-ID header,
    validates the session exists and hasn't expired, updates the last
    activity timestamp, and attaches user information to the request object.
    
    Args:
        f: The route function to protect
        
    Returns:
        Decorated function that returns 401 if session invalid
    """
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        session_id = request.headers.get('X-Session-ID')
        if not session_id:
            return jsonify({'error': 'Session required'}), 401
        
        with session_lock:
            session = active_sessions.get(session_id)
            if not session:
                return jsonify({'error': 'Invalid or expired session'}), 401
            
            # Update last activity timestamp
            session['last_activity'] = datetime.now(timezone.utc)
            
            # Attach user information to request for use in route handlers
            request.current_user = session
            request.session_id = session_id
        
        return f(*args, **kwargs)
    return decorated_function

@app.route('/login', methods=['GET'])
def login_page():
    """Serve login page"""
    try:
        with open('login.html', 'r') as f:
            return Response(
                f.read(),
                mimetype='text/html',
                headers={
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            )
    except FileNotFoundError:
        return jsonify({'error': 'Login page not found'}), 404

@app.route('/api/admin/login', methods=['POST'])
def login():
    """Login endpoint with rate limiting"""
    ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
    
    if is_rate_limited(ip_address):
        return jsonify({'error': 'Too many login attempts. Please try again later.'}), 429
    
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400
        
        user = db.verify_user(username, password)
        if not user:
            return jsonify({'error': 'Invalid username or password'}), 401
        
        # Create session
        session_id = generate_session_id()
        session_data = {
            'user_id': user['id'],
            'username': user['username'],
            'display_name': user['display_name'],
            'role': user['role'],
            'ip_address': ip_address,
            'created_at': datetime.now(timezone.utc),
            'last_activity': datetime.now(timezone.utc)
        }
        
        with session_lock:
            active_sessions[session_id] = session_data
        
        # Log successful login
        db.log_audit_event(
            user['id'], 
            'auth.login', 
            username, 
            'Session manager login successful',
            ip_address
        )
        
        response = jsonify({
            'authenticated': True,
            'user': {
                'username': user['username'],
                'displayName': user['display_name'],
                'role': user['role'],
                'mfaConfigured': False
            },
            'sessionId': session_id,
            'sessionTimeout': SESSION_TIMEOUT
        })
        
        # Set session ID in response header for client-side storage
        response.headers['X-Session-ID'] = session_id
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        
        return response
        
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/check-session', methods=['GET'])
@require_session
def check_session():
    """Check if session is valid"""
    return jsonify({
        'authenticated': True,
        'user': request.current_user,
        'sessionTimeout': SESSION_TIMEOUT
    })

@app.route('/api/admin/keep-alive', methods=['POST'])
@require_session
def keep_alive():
    """Update session activity timestamp"""
    with session_lock:
        if request.session_id in active_sessions:
            active_sessions[request.session_id]['last_activity'] = datetime.now(timezone.utc)
    
    return jsonify({'status': 'session updated'})

@app.route('/api/admin/logout', methods=['POST'])
@require_session
def logout():
    """Logout and destroy session"""
    session_id = request.session_id
    user = request.current_user
    
    with session_lock:
        if session_id in active_sessions:
            del active_sessions[session_id]
    
    # Log logout
    db.log_audit_event(
        user.get('user_id'),
        'auth.logout',
        user.get('username'),
        'Session manager logout successful',
        request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
    )
    
    response = jsonify({'authenticated': False})
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    
    return response

@app.route('/api/admin/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'active_sessions': len(active_sessions),
        'session_timeout': SESSION_TIMEOUT
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.route('/api/admin/gallery/photos', methods=['GET'])
def get_gallery_photos():
    """Get all gallery photos for display"""
    try:
        # Get list of uploaded gallery photos
        gallery_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../public/uploads/gallery')
        photos = []
        
        if os.path.exists(gallery_path):
            for filename in os.listdir(gallery_path):
                if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                    file_path = os.path.join(gallery_path, filename)
                    if os.path.isfile(file_path):
                        stat = os.stat(file_path)
                        
                        # Extract file info
                        photos.append({
                            'id': filename.replace('.', '_').replace('-', ' '),
                            'title': filename.replace('-', ' ').replace('_', ' ').title(),
                            'description': f'Professional photography from various events and conferences',
                            'image_url': f'/uploads/gallery/{filename}',
                            'thumbnail_url': f'/uploads/gallery/{filename}',
                            'upload_date': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                            'file_size': stat.st_size,
                            'dimensions': {
                                'width': 800,  # Default width
                                'height': 600   # Default height
                            },
                            'category': 'professional',
                            'tags': ['photography', 'professional']
                        })
        
        return jsonify({'photos': photos})
    except Exception as e:
        print(f"Gallery API error: {e}")
        return jsonify({'error': 'Failed to load gallery photos'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Gallery photos not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Start cleanup thread
    cleanup_thread = threading.Thread(target=cleanup_expired_sessions, daemon=True)
    cleanup_thread.start()
    
    print(f"🚀 Flask Session Manager starting on port {FLASK_PORT}")
    print(f"🔐 Session timeout: {SESSION_TIMEOUT} seconds")
    print(f"🗄️  Database: {SQLITE_PATH}")
    print(f"🌐 Allowed origin: {ALLOWED_ORIGIN}")
    
    app.run(host='0.0.0.0', port=FLASK_PORT, threaded=True)
