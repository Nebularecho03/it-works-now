"""
Enhanced Flask backend with complete messaging system
Includes user authentication, email service, and message management
"""

from flask import Flask, request, jsonify, session
from flask_cors import CORS
import sqlite3
import os
import logging
from datetime import datetime, timedelta
from functools import wraps
import secrets
import hashlib
import re
from auth import (
    get_db, init_db, verify_session_token, require_auth,
    generate_session_token, revoke_session_token, cleanup_expired_sessions
)
from email_service import EmailService
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

# Import gallery API
try:
    from gallery_api import *
except ImportError:
    # Fallback if gallery_api not available
    pass

# Import gallery API
try:
    from gallery_api import create_gallery_app, init_gallery_table
except ImportError:
    # Fallback if gallery_api not available
    def create_gallery_app():
        from flask import Flask
        return Flask(__name__)
    
    def init_gallery_table():
        pass

# Import template functions
try:
    from email_templates import (
        render_new_message_notification, render_message_reply_notification, render_welcome_email
    )
except ImportError:
    # Fallback if email_templates module not available
    def render_new_message_notification(user_data, message_data):
        return f"<html><body><h2>New Message from {user_data.get('full_name', user_data['email'])}</h2><p>{message_data.get('message', '')}</p></body></html>"
    
    def render_message_reply_notification(user_data, reply_data):
        return f"<html><body><h2>Reply to Your Message</h2><p>{reply_data.get('reply_content', '')}</p></body></html>"
    
    def render_welcome_email(user_data):
        return f"<html><body><h2>Welcome {user_data.get('full_name', user_data['email'])}!</h2><p>Thank you for joining.</p></body></html>"

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize database and cleanup expired sessions
init_db()
cleanup_expired_sessions()

# Register gallery API
try:
    gallery_app = create_gallery_app()
    app.register_blueprint(gallery_app)
except ImportError:
    print("Gallery API not available, using fallback")

# Initialize email service
email_service = EmailService()

@app.route("/")
def root():
    return jsonify({
        "message": "Stephen Asatsa Website Enhanced Messaging API", 
        "version": "2.0.0",
        "features": [
            "User authentication",
            "Secure messaging system", 
            "Email notifications",
            "HTML email templates",
            "Multiple message sources",
            "Admin dashboard integration"
        ]
    })

# Authentication endpoints
@app.route("/api/auth/register", methods=["POST"])
def register():
    """User registration endpoint"""
    try:
        from auth import create_user
        
        data = request.get_json()
        username = data.get("username", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        full_name = data.get("full_name", "").strip()
        
        result = create_user(username, email, password, full_name)
        
        if result["success"]:
            # Send welcome email
            user_data = result["user"]
            email_service.send_welcome_email(user_data)
            
            # Create session
            token = generate_session_token(user_data["id"])
            
            return jsonify({
                "success": True,
                "message": "Registration successful",
                "data": {
                    "user": user_data,
                    "token": token
                }
            }), 201
        else:
            return jsonify({
                "success": False,
                "error": result["error"]
            }), 400
            
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({
            "success": False,
            "error": "Registration failed"
        }), 500

@app.route("/api/auth/login", methods=["POST"])
def login():
    """User login endpoint"""
    try:
        from auth import verify_password
        
        data = request.get_json()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        
        result = verify_password(email, password)
        
        if result["success"]:
            # Create session
            token = generate_session_token(result["user"]["id"])
            
            return jsonify({
                "success": True,
                "message": "Login successful",
                "data": {
                    "user": result["user"],
                    "token": token
                }
            })
        else:
            return jsonify({
                "success": False,
                "error": result["error"]
            }), 401
            
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({
            "success": False,
            "error": "Login failed"
        }), 500

@app.route("/api/auth/logout", methods=["POST"])
def logout():
    """User logout endpoint"""
    try:
        token = request.headers.get("Authorization") or request.args.get("token")
        
        if token:
            revoke_session_token(token)
        
        return jsonify({
            "success": True,
            "message": "Logged out successfully"
        })
        
    except Exception as e:
        logger.error(f"Logout error: {e}")
        return jsonify({
            "success": False,
            "error": "Logout failed"
        }), 500

@app.route("/api/auth/me", methods=["GET"])
def get_current_user():
    """Get current authenticated user"""
    try:
        token = request.headers.get("Authorization") or request.args.get("token")
        
        if not token:
            return jsonify({"success": False, "error": "No token provided"}), 401
        
        auth_result = verify_session_token(token)
        
        if auth_result["success"]:
            return jsonify({
                "success": True,
                "authenticated": True,
                "user": auth_result["user"]
            })
        else:
            return jsonify({
                "success": False,
                "error": "Invalid or expired token"
            }), 401
            
    except Exception as e:
        logger.error(f"Get current user error: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to get user"
        }), 500

# Message management endpoints
@app.route("/api/messages", methods=["POST"])
def create_message():
    """Create new message from various sources"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ["from_email", "from_name", "message"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    "success": False,
                    "error": f"{field} is required"
                }), 400
        
        # Validate email format
        email = data.get("from_email", "")
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            return jsonify({
                "success": False,
                "error": "Invalid email format"
            }), 400
        
        # Store message in database
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO messages 
            (from_email, from_name, to_email, to_name, subject, message, message_type, status, priority, source, ip_address, user_agent, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ''', (
            data["from_email"],
            data["from_name"],
            "admin@stephenasatsa.com",  # Default admin email
            "Administrator",
            data.get("subject", ""),
            data["message"],
            data.get("message_type", "contact_form"),
            data.get("status", "new"),
            data.get("priority", "normal"),
            data.get("source", "website"),
            request.headers.get("x-forwarded-for", "unknown"),
            request.headers.get("user-agent", "")
        ))
        
        message_id = cursor.lastrowid
        conn.commit()
        
        # Get message for notification
        cursor.execute('''
            SELECT * FROM messages WHERE id = ?
        ''', (message_id,))
        
        message = cursor.fetchone()
        conn.close()
        
        # Send notification to admin
        if message:
            admin_data = {
                "full_name": "Administrator",
                "email": "admin@stephenasatsa.com"
            }
            
            email_service.send_new_message_notification(admin_data, dict(message))
        
        return jsonify({
            "success": True,
            "message": "Message created successfully",
            "data": {
                "id": message_id,
                **data
            }
        }), 201
        
    except Exception as e:
        logger.error(f"Create message error: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to create message"
        }), 500

@app.route("/api/messages", methods=["GET"])
@require_auth
def get_messages():
    """Get messages for authenticated user"""
    try:
        user = request.current_user
        conn = get_db()
        cursor = conn.cursor()
        
        # Get query parameters
        status = request.args.get("status", "all")
        message_type = request.args.get("type", "all")
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 20))
        
        # Build query
        query = '''
            SELECT m.*, 
                   CASE WHEN m.from_user_id = ? THEN 1 ELSE 0 END as is_from_me
            FROM messages m
            WHERE (m.from_user_id = ? OR m.to_user_id = ?)
        '''
        params = [user["id"], user["id"]]
        
        # Add filters
        if status != "all":
            query += " AND m.status = ?"
            params.append(status)
        
        if message_type != "all":
            query += " AND m.message_type = ?"
            params.append(message_type)
        
        # Add ordering and pagination
        query += " ORDER BY m.created_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, (page - 1) * limit])
        
        cursor.execute(query, params)
        messages = cursor.fetchall()
        
        # Get total count
        count_query = query.replace("LIMIT ? OFFSET ?", "COUNT(*) as total")
        cursor.execute(count_query, params[:-2])
        total_count = cursor.fetchone()["total"]
        
        conn.close()
        
        return jsonify({
            "success": True,
            "data": {
                "messages": [dict(msg) for msg in messages],
                "total": total_count,
                "page": page,
                "limit": limit,
                "total_pages": (total_count + limit - 1) // limit
            }
        })
        
    except Exception as e:
        logger.error(f"Get messages error: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to fetch messages"
        }), 500

@app.route("/api/messages/<int:message_id>", methods=["PUT"])
@require_auth
def update_message():
    """Update message status"""
    try:
        user = request.current_user
        data = request.get_json()
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if user owns this message
        cursor.execute('''
            SELECT from_user_id, to_user_id FROM messages 
            WHERE id = ?
        ''', (message_id,))
        
        message = cursor.fetchone()
        
        if not message or (message["from_user_id"] != user["id"] and message["to_user_id"] != user["id"]):
            conn.close()
            return jsonify({
                "success": False,
                "error": "Access denied"
            }), 403
        
        # Update message
        update_fields = []
        update_values = []
        
        if "status" in data:
            update_fields.append("status = ?")
            update_values.append(data["status"])
            
            if data["status"] == "read":
                update_fields.append("read_at = CURRENT_TIMESTAMP")
            elif data["status"] == "replied":
                update_fields.append("replied_at = CURRENT_TIMESTAMP")
                update_fields.append("replied_by_user_id = ?")
                update_values.append(user["id"])
        
        if update_fields:
            query = f"UPDATE messages SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
            update_values.append(message_id)
            
            cursor.execute(query, update_values)
            conn.commit()
        
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Message updated successfully"
        })
        
    except Exception as e:
        logger.error(f"Update message error: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to update message"
        }), 500

@app.route("/api/messages/<int:message_id>", methods=["POST"])
@require_auth
def reply_to_message():
    """Reply to a message"""
    try:
        user = request.current_user
        data = request.get_json()
        
        reply_content = data.get("reply", "").strip()
        if not reply_content:
            return jsonify({
                "success": False,
                "error": "Reply content is required"
            }), 400
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Get original message
        cursor.execute('''
            SELECT m.*, u_from.email as from_email, u_to.email as to_email
            FROM messages m
            LEFT JOIN users u_from ON m.from_user_id = u_from.id
            LEFT JOIN users u_to ON m.to_user_id = u_to.id
            WHERE m.id = ?
        ''', (message_id,))
        
        original_message = cursor.fetchone()
        
        if not original_message:
            conn.close()
            return jsonify({
                "success": False,
                "error": "Message not found"
            }), 404
        
        # Create reply message
        cursor.execute('''
            INSERT INTO messages 
            (from_user_id, from_email, from_name, to_user_id, to_email, to_name, subject, message, message_type, status, priority, source, ip_address, user_agent, created_at, updated_at, replied_by_user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)
        ''', (
            user["id"],
            user["email"],
            user["full_name"],
            original_message["from_user_id"],
            original_message["from_email"],
            original_message["from_name"],
            f"Re: {original_message.get('subject', 'No Subject')}",
            reply_content,
            "user_message",
            "replied",
            "normal",
            "website",
            request.headers.get("x-forwarded-for", "unknown"),
            request.headers.get("user-agent", ""),
            message_id
        ))
        
        # Update original message status
        cursor.execute('''
            UPDATE messages 
            SET status = 'replied', replied_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (message_id,))
        
        conn.commit()
        
        # Send email notification
        if original_message["from_user_id"]:
            # Get recipient user data
            cursor.execute('''
                SELECT * FROM users WHERE id = ?
            ''', (original_message["from_user_id"],))
            
            recipient_user = cursor.fetchone()
            
            if recipient_user:
                email_service.send_message_reply_notification(
                    dict(recipient_user),
                    {
                        "admin_name": user["full_name"],
                        "reply_content": reply_content,
                        "original_subject": original_message.get("subject"),
                        "original_message": original_message.get("message"),
                        "replied_at": datetime.now().isoformat()
                    }
                )
        
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Reply sent successfully"
        })
        
    except Exception as e:
        logger.error(f"Reply to message error: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to send reply"
        }), 500

@app.route("/api/messages/<int:message_id>", methods=["DELETE"])
@require_auth
def delete_message():
    """Delete a message"""
    try:
        user = request.current_user
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if user owns this message
        cursor.execute('''
            SELECT from_user_id, to_user_id FROM messages 
            WHERE id = ?
        ''', (message_id,))
        
        message = cursor.fetchone()
        
        if not message or (message["from_user_id"] != user["id"] and message["to_user_id"] != user["id"]):
            conn.close()
            return jsonify({
                "success": False,
                "error": "Access denied"
            }), 403
        
        # Delete message
        cursor.execute('DELETE FROM messages WHERE id = ?', (message_id,))
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Message deleted successfully"
        })
        
    except Exception as e:
        logger.error(f"Delete message error: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to delete message"
        }), 500

# Email settings endpoints
@app.route("/api/admin/email-settings", methods=["GET"])
@require_auth
def get_email_settings():
    """Get email configuration settings"""
    try:
        user = request.current_user
        
        if user["role"] != "admin":
            return jsonify({
                "success": False,
                "error": "Admin access required"
            }), 403
        
        settings = email_service.load_settings()
        
        return jsonify({
            "success": True,
            "data": settings
        })
        
    except Exception as e:
        logger.error(f"Get email settings error: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to fetch email settings"
        }), 500

@app.route("/api/admin/email-settings", methods=["PUT"])
@require_auth
def update_email_settings():
    """Update email configuration settings"""
    try:
        user = request.current_user
        
        if user["role"] != "admin":
            return jsonify({
                "success": False,
                "error": "Admin access required"
            }), 403
        
        data = request.get_json()
        
        # Update settings in database
        conn = get_db()
        cursor = conn.cursor()
        
        # Validate provider
        valid_providers = ["none", "gmail", "outlook", "smtp"]
        if data.get("provider") not in valid_providers:
            conn.close()
            return jsonify({
                "success": False,
                "error": "Invalid email provider"
            }), 400
        
        # Update or insert settings
        cursor.execute('''
            INSERT OR REPLACE INTO email_settings 
            (provider, smtp_host, smtp_port, smtp_username, smtp_password, smtp_use_tls, 
             gmail_client_id, gmail_client_secret, gmail_refresh_token,
             outlook_client_id, outlook_client_secret, outlook_refresh_token,
             from_email, from_name, reply_to_email, enabled, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ''', (
            data.get("provider"),
            data.get("smtp_host"),
            data.get("smtp_port"),
            data.get("smtp_username"),
            data.get("smtp_password"),
            data.get("smtp_use_tls", True),
            data.get("gmail_client_id"),
            data.get("gmail_client_secret"),
            data.get("gmail_refresh_token"),
            data.get("outlook_client_id"),
            data.get("outlook_client_secret"),
            data.get("outlook_refresh_token"),
            data.get("from_email"),
            data.get("from_name"),
            data.get("reply_to_email"),
            data.get("enabled", False)
        ))
        
        conn.commit()
        conn.close()
        
        # Reload email service settings
        email_service.load_settings()
        
        return jsonify({
            "success": True,
            "message": "Email settings updated successfully"
        })
        
    except Exception as e:
        logger.error(f"Update email settings error: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to update email settings"
        }), 500

@app.route("/api/admin/email-settings/test", methods=["POST"])
@require_auth
def test_email_settings():
    """Test email configuration"""
    try:
        user = request.current_user
        
        if user["role"] != "admin":
            return jsonify({
                "success": False,
                "error": "Admin access required"
            }), 403
        
        result = email_service.test_connection()
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Test email settings error: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to test email settings"
        }), 500

# Message statistics endpoint
@app.route("/api/messages/stats", methods=["GET"])
@require_auth
def get_message_stats():
    """Get message statistics for current user"""
    try:
        user = request.current_user
        conn = get_db()
        cursor = conn.cursor()
        
        # Get message counts
        cursor.execute('''
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_count,
                SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) as read_count,
                SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END) as replied_count
            FROM messages 
            WHERE from_user_id = ? OR to_user_id = ?
        ''', (user["id"], user["id"]))
        
        stats = cursor.fetchone()
        conn.close()
        
        return jsonify({
            "success": True,
            "data": {
                "total": stats["total"],
                "new": stats["new_count"],
                "read": stats["read_count"],
                "replied": stats["replied_count"]
            }
        })
        
    except Exception as e:
        logger.error(f"Get message stats error: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to fetch message stats"
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
