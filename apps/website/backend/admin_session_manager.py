#!/usr/bin/env python3
"""
Production-Ready Flask Session Manager for Admin Panel
Enhanced version with comprehensive error handling, monitoring, and database management
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
FLASK_PORT = int(os.getenv('FLASK_PORT', 5001))
ALLOWED_ORIGIN = os.getenv('ALLOWED_ORIGIN', 'http://localhost:3000')
SESSION_TIMEOUT = int(os.getenv('SESSION_TIMEOUT', 300))

# Rate Limiting Configuration
RATE_LIMIT_ATTEMPTS = int(os.getenv('RATE_LIMIT_ATTEMPTS', 5))
RATE_LIMIT_WINDOW = int(os.getenv('RATE_LIMIT_WINDOW', 60))

# Database Configuration
SQLITE_PATH = os.getenv('SQLITE_PATH', 'data/users.db')

# ============================================================================
# IN-MEMORY STORES
# ============================================================================

# Active sessions: session_id -> session_data
# Each session contains: user_id, username, display_name, role, ip_address, 
# created_at, last_activity
active_sessions: Dict[str, Dict] = {}

# Rate limiting: ip_address -> {count, last_attempt}
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
    Production-ready database interface with comprehensive error handling
    """
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self._connection_pool = []
        self._max_pool_size = 5
    
    def _get_connection(self):
        """Get database connection from pool or create new one"""
        try:
            if self._connection_pool:
                conn = self._connection_pool.pop()
                if conn and not conn.closed:
                    return conn
        except (IndexError, AttributeError):
            pass
        
        # Create new connection if pool is empty
        try:
            conn = sqlite3.connect(
                self.db_path,
                timeout=10.0,
                check_same_thread=False,
                isolation_level='IMMEDIATE'
            )
            
            # Optimize for production
            conn.execute("PRAGMA journal_mode=WAL")
            conn.execute("PRAGMA synchronous=NORMAL")
            conn.execute("PRAGMA cache_size=2000")
            conn.execute("PRAGMA temp_store=MEMORY")
            
            return conn
        except sqlite3.Error as e:
            print(f"Database connection error: {e}")
            raise
    
    def _return_connection(self, conn):
        """Return connection to pool if still valid"""
        try:
            if conn and not conn.closed and len(self._connection_pool) < self._max_pool_size:
                self._connection_pool.append(conn)
                return
            conn.close()
        except:
            pass
    
    def verify_user(self, username: str, password: str) -> Optional[Dict]:
        """Verify user credentials with robust error handling"""
        conn = None
        try:
            conn = self._get_connection()
            conn.row_factory = sqlite3.Row
            
            cursor = conn.cursor()
            user = cursor.execute(
                "SELECT * FROM users WHERE username = ? AND is_active = 1",
                (username,)
            ).fetchone()
            
            if not user:
                self._return_connection(conn)
                return None
            
            # Use existing password verification
            if not self._verify_password(password, user['password_hash']):
                self._return_connection(conn)
                return None
            
            # Update last login
            cursor.execute(
                "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
                (user['id'],)
            )
            conn.commit()
            
            user_dict = dict(user)
            self._return_connection(conn)
            return user_dict
            
        except sqlite3.Error as e:
            print(f"Database verification error: {e}")
            if conn:
                self._return_connection(conn)
            return None
        except Exception as e:
            print(f"Unexpected database error: {e}")
            return None
    
    def _verify_password(self, password: str, stored_hash: str) -> bool:
        """Verify password using existing method"""
        try:
            import base64
            import hmac
            
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
                    int(iterations),
                    dklen=32
                )
                candidate = base64.urlsafe_b64encode(digest).decode('ascii')
                return hmac.compare_digest(candidate, encoded)
            
            return check_password_hash(stored_hash, password)
        except Exception as e:
            print(f"Password verification error: {e}")
            return False
    
    def log_audit_event(self, user_id: Optional[int], action: str, actor: str, 
                      summary: str, ip_address: Optional[str] = None):
        """Log audit event with error handling"""
        try:
            conn = self._get_connection()
            conn.execute("""
                INSERT INTO audit_log (user_id, action, actor, summary, ip_address)
                VALUES (?, ?, ?, ?, ?)
            """, (user_id, action, actor, summary, ip_address))
            conn.commit()
            self._return_connection(conn)
        except Exception as e:
            print(f"Audit log error: {e}")
            if conn:
                self._return_connection(conn)

# ============================================================================
# SESSION MANAGEMENT
# ============================================================================

def generate_session_id() -> str:
    """Generate cryptographically secure session ID"""
    return secrets.token_hex(32)

def is_rate_limited(ip_address: str) -> bool:
    """Check if IP is rate limited"""
    with rate_limit_lock:
        now = time.time()
        
        # Initialize IP tracking if not exists
        if ip_address not in login_attempts:
            login_attempts[ip_address] = {'count': 0, 'last_attempt': 0}
        
        # Reset counter if time window has passed
        if now - login_attempts[ip_address]['last_attempt'] > RATE_LIMIT_WINDOW:
            login_attempts[ip_address] = {'count': 0, 'last_attempt': now}
        
        # Check if rate limit exceeded
        if login_attempts[ip_address]['count'] >= RATE_LIMIT_ATTEMPTS:
            return True
        
        return False

def cleanup_expired_sessions():
    """Background thread to clean up expired sessions"""
    while True:
        try:
            current_time = datetime.now(timezone.utc)
            expired_sessions = []
            
            with session_lock:
                for session_id, session_data in list(active_sessions.items()):
                    last_activity = session_data['last_activity']
                    
                    # Handle string datetime conversion
                    if isinstance(last_activity, str):
                        last_activity = datetime.fromisoformat(last_activity.replace('Z', '+00:00'))
                    
                    # Check if session has expired
                    if current_time - last_activity > timedelta(seconds=SESSION_TIMEOUT):
                        expired_sessions.append(session_id)
                
                # Remove expired sessions
                for session_id in expired_sessions:
                    del active_sessions[session_id]
                    print(f"Cleaned up expired session: {session_id}")
            
            time.sleep(60)  # Run every minute
        except Exception as e:
            print(f"Session cleanup error: {e}")

# ============================================================================
# FLASK APPLICATION
# ============================================================================

def require_session(f):
    """Decorator to require valid session for protected endpoints"""
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        session_id = request.headers.get('X-Session-ID')
        if not session_id:
            return jsonify({'error': 'Session required'}), 401
        
        with session_lock:
            session = active_sessions.get(session_id)
            if not session:
                return jsonify({'error': 'Invalid or expired session'}), 401
            
            # Update last activity
            session['last_activity'] = datetime.now(timezone.utc)
            
            # Attach user information to request for use in route handlers
            request.current_user = session
            request.session_id = session_id
        
        return f(*args, **kwargs)
    return decorated_function

# Initialize database
try:
    db = UserDatabase(SQLITE_PATH)
    print(f"Database successfully initialized: {SQLITE_PATH}")
except Exception as e:
    print(f"Failed to initialize database: {e}")
    db = None

# Start cleanup thread
cleanup_thread = threading.Thread(target=cleanup_expired_sessions, daemon=True)
cleanup_thread.start()

# ============================================================================
# ROUTES
# ============================================================================

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
    """Enhanced login endpoint with comprehensive error handling"""
    ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
    
    if is_rate_limited(ip_address):
        return jsonify({'error': 'Too many login attempts. Please try again later.'}), 429
    
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400
        
        if not db:
            return jsonify({'error': 'Database not available'}), 503
        
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
    
    # Log logout
    if db and user:
        db.log_audit_event(
            user.get('user_id'), 
            'auth.logout', 
            user.get('username'), 
            'Session manager logout successful', 
            request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        )
    
    # Remove session
    with session_lock:
        if session_id in active_sessions:
            del active_sessions[session_id]
    
    response = jsonify({'authenticated': False})
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    
    return response

@app.route('/api/admin/health', methods=['GET'])
def health_check():
    """Comprehensive health check endpoint"""
    try:
        # Check database connection
        if db:
            conn = db._get_connection()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM users WHERE is_active = 1")
            result = cursor.fetchone()
            active_users = result[0] if result else 0
            db._return_connection(conn)
            
            return jsonify({
                'status': 'healthy',
                'active_sessions': len(active_sessions),
                'active_users': active_users,
                'session_timeout': SESSION_TIMEOUT,
                'uptime': time.time() - start_time if 'start_time' in globals() else 0,
                'database_connected': True,
                'timestamp': datetime.now(timezone.utc).isoformat()
            })
        else:
            return jsonify({
                'status': 'degraded',
                'active_sessions': len(active_sessions),
                'active_users': 0,
                'session_timeout': SESSION_TIMEOUT,
                'uptime': time.time() - start_time if 'start_time' in globals() else 0,
                'database_connected': False,
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'error': 'Database not initialized'
            })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'active_sessions': len(active_sessions),
            'active_users': 0,
            'session_timeout': SESSION_TIMEOUT,
            'database_connected': False,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'error': str(e)
        }), 500

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

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# ============================================================================
# STARTUP
# ============================================================================

if __name__ == '__main__':
    # Global start time for uptime tracking
    start_time = time.time()
    
    print(f"🚀 Production Flask Session Manager starting on port {FLASK_PORT}")
    print(f"🔐 Session timeout: {SESSION_TIMEOUT} seconds")
    print(f"🗄️  Database: {SQLITE_PATH}")
    print(f"🌐 Allowed origin: {ALLOWED_ORIGIN}")
    
    app.run(host='0.0.0.0', port=FLASK_PORT, threaded=True)
