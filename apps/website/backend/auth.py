"""
Authentication module for secure user management
Handles user registration, login, and session management
"""

import hashlib
import secrets
import re
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, session
import sqlite3
import os

# Database setup
DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'messages.db')

def get_db():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database tables"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(100) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(255),
            role TEXT DEFAULT 'user',
            is_active BOOLEAN DEFAULT 1,
            email_verified BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP NULL
        )
    ''')
    
    # Create sessions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token_hash VARCHAR(255) UNIQUE NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    
    # Create messages table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER NULL,
            from_user_id INTEGER NULL,
            from_email VARCHAR(255) NOT NULL,
            from_name VARCHAR(255) NOT NULL,
            to_user_id INTEGER NULL,
            to_email VARCHAR(255) NOT NULL,
            to_name VARCHAR(255),
            subject VARCHAR(500),
            message TEXT NOT NULL,
            message_type TEXT DEFAULT 'user_message',
            status TEXT DEFAULT 'new',
            priority TEXT DEFAULT 'normal',
            source TEXT DEFAULT 'website',
            ip_address VARCHAR(45),
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            read_at TIMESTAMP NULL,
            replied_at TIMESTAMP NULL,
            replied_by_user_id INTEGER NULL,
            FOREIGN KEY (from_user_id) REFERENCES users(id),
            FOREIGN KEY (to_user_id) REFERENCES users(id),
            FOREIGN KEY (replied_by_user_id) REFERENCES users(id)
        )
    ''')
    
    # Create conversations table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject VARCHAR(500),
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create conversation participants table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS conversation_participants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES conversations(id),
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE(conversation_id, user_id)
        )
    ''')
    
    # Create email settings table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS email_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            provider TEXT DEFAULT 'none',
            smtp_host VARCHAR(255),
            smtp_port INTEGER,
            smtp_username VARCHAR(255),
            smtp_password VARCHAR(255),
            smtp_use_tls BOOLEAN DEFAULT 1,
            gmail_client_id VARCHAR(255),
            gmail_client_secret VARCHAR(255),
            gmail_refresh_token TEXT,
            outlook_client_id VARCHAR(255),
            outlook_client_secret VARCHAR(255),
            outlook_refresh_token TEXT,
            from_email VARCHAR(255),
            from_name VARCHAR(255),
            reply_to_email VARCHAR(255),
            enabled BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(email: str, password: str) -> dict:
    """Verify user credentials"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, username, email, password_hash, full_name, role, is_active, email_verified
        FROM users 
        WHERE email = ? AND is_active = 1
    ''', (email,))
    
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        return {"success": False, "error": "Invalid email or password"}
    
    if not hash_password(password) == user["password_hash"]:
        return {"success": False, "error": "Invalid email or password"}
    
    return {
        "success": True,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
            "email_verified": user["email_verified"]
        }
    }

def create_user(username: str, email: str, password: str, full_name: str = None) -> dict:
    """Create new user account"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if user already exists
    cursor.execute('''
        SELECT id FROM users WHERE email = ? OR username = ?
    ''', (email, username))
    
    if cursor.fetchone():
        conn.close()
        return {"success": False, "error": "User already exists"}
    
    # Validate email format
    if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
        conn.close()
        return {"success": False, "error": "Invalid email format"}
    
    # Validate password strength
    if len(password) < 8:
        conn.close()
        return {"success": False, "error": "Password must be at least 8 characters"}
    
    if not re.search(r'[A-Z]', password):
        conn.close()
        return {"success": False, "error": "Password must contain at least one uppercase letter"}
    
    if not re.search(r'[a-z]', password):
        conn.close()
        return {"success": False, "error": "Password must contain at least one lowercase letter"}
    
    if not re.search(r'\d', password):
        conn.close()
        return {"success": False, "error": "Password must contain at least one number"}
    
    try:
        # Create user
        user_id = cursor.execute('''
            INSERT INTO users (username, email, password_hash, full_name)
            VALUES (?, ?, ?, ?)
        ''', (username, email, hash_password(password), full_name))
        
        conn.commit()
        conn.close()
        
        return {"success": True, "message": "User created successfully"}
    
    except Exception as e:
        conn.close()
        return {"success": False, "error": "Failed to create user"}

def generate_session_token(user_id: int) -> str:
    """Generate secure session token"""
    token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Store session in database
    cursor.execute('''
        INSERT INTO user_sessions (user_id, token_hash, expires_at)
        VALUES (?, ?, ?)
    ''', (user_id, token_hash, datetime.now() + timedelta(hours=24)))
    
    conn.commit()
    conn.close()
    
    return token

def verify_session_token(token: str) -> dict:
    """Verify session token and return user data"""
    if not token:
        return {"success": False, "error": "No token provided"}
    
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT s.user_id, u.username, u.email, u.full_name, u.role, u.email_verified
        FROM user_sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token_hash = ? AND s.expires_at > CURRENT_TIMESTAMP
    ''', (token_hash,))
    
    session = cursor.fetchone()
    conn.close()
    
    if not session:
        return {"success": False, "error": "Invalid or expired token"}
    
    return {
        "success": True,
        "user": {
            "id": session["user_id"],
            "username": session["username"],
            "email": session["email"],
            "full_name": session["full_name"],
            "role": session["role"],
            "email_verified": session["email_verified"]
        }
    }

def revoke_session_token(token: str) -> bool:
    """Revoke session token"""
    if not token:
        return False
    
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        DELETE FROM user_sessions WHERE token_hash = ?
    ''', (token_hash,))
    
    affected_rows = cursor.rowcount
    conn.commit()
    conn.close()
    
    return affected_rows > 0

def cleanup_expired_sessions():
    """Clean up expired sessions"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP
    ''')
    
    affected_rows = cursor.rowcount
    conn.commit()
    conn.close()
    
    return affected_rows

# Decorator for authentication
def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization') or request.args.get('token')
        
        if not token:
            return jsonify({"success": False, "error": "Authentication required"}), 401
        
        auth_result = verify_session_token(token)
        
        if not auth_result["success"]:
            return jsonify({"success": False, "error": "Invalid or expired token"}), 401
        
        # Add user data to request context
        request.current_user = auth_result["user"]
        
        return f(*args, **kwargs)
    
    return decorated_function

# Initialize database on import
init_db()
