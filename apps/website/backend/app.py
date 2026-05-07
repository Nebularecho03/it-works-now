from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import secrets
import json
import hashlib
import re
import bcrypt

# Import monitoring routes
from monitoring.routes import create_monitoring_routes

app = Flask(__name__)
CORS(app, origins=["http://localhost:3001", "http://localhost:3000"])

# Register monitoring blueprint
monitoring_bp = create_monitoring_routes()
app.register_blueprint(monitoring_bp)

# Admin user management endpoints
@app.route("/api/admin/users", methods=["GET"])
def get_users():
    """Get all users (admin only)"""
    try:
        # Simple admin check - in production, use proper auth
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Unauthorized"}), 401
        
        return jsonify({
            "success": True,
            "data": list(users.values())
        })
        
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route("/api/admin/unlock-account", methods=["POST"])
def unlock_account():
    """Unlock user account (admin only)"""
    try:
        data = request.get_json()
        email = data.get("email")
        
        if not email:
            return jsonify({"error": "Email is required"}), 400
        
        if email in users:
            users[email]["account_locked_until"] = None
            users[email]["failed_login_attempts"] = 0
            return jsonify({
                "success": True,
                "message": "Account unlocked successfully"
            })
        
        return jsonify({"error": "User not found"}), 404
        
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

# Admin credentials (stored in variables for easy updating)
ADMIN_EMAIL = "admin@stephenasatsa.com"
ADMIN_PASSWORD = "ChangeMe123!"

# Simple storage (in production, use database)
tokens = {}
users = {}
user_profiles = {}
admin_credentials_history = []  # Track credential changes
gallery_photos = {}  # Store gallery photos
next_photo_id = 1
messages = {}  # Store messages
message_replies = {}  # Store message replies
conversations = {}  # Store conversation threads
next_message_id = 1
next_reply_id = 1
next_conversation_id = 1

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(email: str, password: str) -> bool:
    """Verify password for admin or regular user"""
    if email == ADMIN_EMAIL:
        return password == ADMIN_PASSWORD
    elif email in users:
        return bcrypt.checkpw(password.encode('utf-8'), users[email]["password"].encode('utf-8'))
    return False

def generate_token() -> str:
    """Generate simple token"""
    return secrets.token_urlsafe(32)

def verify_token(token: str) -> dict:
    """Verify token exists and is valid, return user data"""
    if token in tokens:
        # Check if token is not expired (24 hours)
        token_data = tokens[token]
        if datetime.now().timestamp() - token_data["created"] < 24 * 60 * 60:
            # Check if user account is locked
            user_email = token_data["email"]
            if user_email in users:
                user_data = users[user_email]
                account_locked_until = user_data.get("account_locked_until")
                if account_locked_until:
                    lock_expiry = datetime.fromisoformat(account_locked_until)
                    if lock_expiry > datetime.now():
                        return None  # Account is locked
            
            return token_data
        else:
            # Remove expired token
            del tokens[token]
            return None
    return None

def is_valid_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def is_valid_password(password: str) -> bool:
    """Validate password strength"""
    return len(password) >= 8 and any(c.isupper() for c in password) and any(c.islower() for c in password) and any(c.isdigit() for c in password)

@app.route("/")
def root():
    return jsonify({"message": "Stephen Asatsa Website Admin API", "version": "1.0.0"})

# Authentication endpoints
@app.route("/api/auth/signup", methods=["POST"])
def user_signup():
    """User signup endpoint"""
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        name = data.get("name", "")
        
        # Validation
        if not email or not password:
            return jsonify({"detail": "Email and password are required"}), 400
        
        if not is_valid_email(email):
            return jsonify({"detail": "Invalid email format"}), 400
        
        if not is_valid_password(password):
            return jsonify({"detail": "Password must be at least 8 characters with uppercase, lowercase, and numbers"}), 400
        
        # Check if user already exists
        if email in users:
            return jsonify({"detail": "User already exists"}), 409
        
        # Create new user
        users[email] = {
            "email": email,
            "password": hash_password(password),
            "name": name,
            "created_at": datetime.now().isoformat(),
            "role": "user",
            "status": "active"
        }
        
        user_profiles[email] = {
            "preferences": {
                "newsletter": False,
                "notifications": True,
                "theme": "light"
            },
            "saved_items": [],
            "last_login": None
        }
        
        # Generate token
        token = generate_token()
        tokens[token] = {
            "email": email,
            "created": datetime.now().timestamp(),
            "role": "user"
        }
        
        return jsonify({
            "message": "User created successfully",
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "email": email,
                "name": name,
                "role": "user"
            }
        })
    except Exception as e:
        return jsonify({"detail": "Invalid request"}), 400

@app.route("/api/auth/login", methods=["POST"])
def user_login():
    """User login endpoint"""
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        
        if not email or not password:
            return jsonify({"detail": "Email and password are required"}), 400
        
        if not verify_password(email, password):
            return jsonify({"detail": "Invalid email or password"}), 401
        
        # Check if account is locked
        if email in users:
            user_data = users[email]
            if user_data.get("account_locked_until"):
                lock_expiry = datetime.fromisoformat(user_data["account_locked_until"])
                if lock_expiry > datetime.now():
                    return jsonify({"detail": "Account is locked. Please try again later."}), 403
        
        # Check failed login attempts
        if email in users:
            failed_attempts = users[email].get("failed_login_attempts", 0)
            last_failed = users[email].get("last_failed_login")
            
            # Lock account if too many failed attempts (5 in last hour)
            if failed_attempts >= 5 and last_failed:
                last_failed_time = datetime.fromisoformat(last_failed)
                if (datetime.now() - last_failed_time).total_seconds() < 3600:
                    users[email]["account_locked_until"] = (datetime.now() + timedelta(hours=1)).isoformat()
                    return jsonify({"detail": "Account locked due to too many failed login attempts. Try again in 1 hour."}), 429
        
        # Generate token
        token = generate_token()
        user_role = "admin" if email == ADMIN_EMAIL else "user"
        
        tokens[token] = {
            "email": email,
            "created": datetime.now().timestamp(),
            "role": user_role
        }
        
        # Update last login and reset failed attempts on successful login
        if email in users:
            users[email]["last_login"] = datetime.now().isoformat()
            users[email]["failed_login_attempts"] = 0
            users[email]["last_failed_login"] = None
        
        return jsonify({
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "email": email,
                "name": users.get(email, {}).get("name", ""),
                "role": user_role
            }
        })
    except Exception as e:
        return jsonify({"detail": "Invalid request"}), 400

@app.route("/api/user/change-password", methods=["POST"])
def change_password():
    """User password change endpoint"""
    try:
        data = request.get_json()
        email = data.get("email")
        current_password = data.get("current_password")
        new_password = data.get("new_password")
        confirm_password = data.get("confirm_password")
        
        # Validation
        if not all([email, current_password, new_password, confirm_password]):
            return jsonify({"error": "All fields are required"}), 400
        
        if new_password != confirm_password:
            return jsonify({"error": "New passwords do not match"}), 400
        
        if len(new_password) < 8:
            return jsonify({"error": "Password must be at least 8 characters"}), 400
        
        # Check if user exists and verify current password
        if email not in users:
            return jsonify({"error": "User not found"}), 404
        
        user = users[email]
        if user["password"] != hash_password(current_password):
            return jsonify({"error": "Current password is incorrect"}), 401
        
        # Hash new password
        new_password_hash = hash_password(new_password)
        
        # Update user password
        users[email]["password"] = new_password_hash
        users[email]["password_updated_at"] = datetime.now().isoformat()
        users[email]["failed_login_attempts"] = 0  # Reset failed attempts on successful password change
        
        return jsonify({
            "success": True,
            "message": "Password changed successfully"
        })
        
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route("/api/auth/me")
def get_current_user():
    """Get current user info"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data:
        return jsonify({"error": "Invalid token"}), 401
    
    return jsonify({
        "user": {
            "email": token_data["email"],
            "name": users.get(token_data["email"], {}).get("name", ""),
            "role": token_data["role"]
        }
    })
    else:
        user_data = users.get(email, {})
        profile_data = user_profiles.get(email, {})
        
        return jsonify({
            "email": email,
            "name": user_data.get("name", ""),
            "role": "user",
            "status": user_data.get("status", "active"),
            "created_at": user_data.get("created_at"),
            "preferences": profile_data.get("preferences", {}),
            "saved_items": profile_data.get("saved_items", [])
        })

@app.route("/api/auth/logout", methods=["POST"])
def user_logout():
    """User logout"""
    token = request.args.get("token")
    if token in tokens:
        del tokens[token]
    return jsonify({"message": "Successfully logged out"})

@app.route("/api/auth/update-profile", methods=["PUT"])
def update_profile():
    """Update user profile"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data:
        return jsonify({"detail": "Invalid token"}), 401
    
    email = token_data["email"]
    data = request.get_json()
    
    if email in user_profiles:
        # Update preferences
        if "preferences" in data:
            user_profiles[email]["preferences"].update(data["preferences"])
        
        # Update name if provided
        if "name" in data and email in users:
            users[email]["name"] = data["name"]
        
        return jsonify({"message": "Profile updated successfully"})
    
    return jsonify({"detail": "User not found"}), 404

@app.route("/api/auth/saved-items", methods=["GET", "POST", "DELETE"])
def manage_saved_items():
    """Manage saved items"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data:
        return jsonify({"detail": "Invalid token"}), 401
    
    email = token_data["email"]
    
    if email not in user_profiles:
        return jsonify({"detail": "User not found"}), 404
    
    if request.method == "GET":
        return jsonify({"saved_items": user_profiles[email]["saved_items"]})
    
    elif request.method == "POST":
        data = request.get_json()
        item = {
            "id": data.get("id"),
            "type": data.get("type"),
            "title": data.get("title"),
            "href": data.get("href"),
            "image": data.get("image"),
            "saved_at": datetime.now().isoformat()
        }
        
        # Check if item already exists
        existing_items = user_profiles[email]["saved_items"]
        for existing_item in existing_items:
            if existing_item["id"] == item["id"]:
                return jsonify({"detail": "Item already saved"}), 409
        
        user_profiles[email]["saved_items"].append(item)
        return jsonify({"message": "Item saved successfully"})
    
    elif request.method == "DELETE":
        data = request.get_json()
        item_id = data.get("id")
        
        user_profiles[email]["saved_items"] = [
            item for item in user_profiles[email]["saved_items"] 
            if item["id"] != item_id
        ]
        
        return jsonify({"message": "Item removed successfully"})

# Admin endpoints
@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    """Admin login endpoint"""
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        
        if not verify_password(email, password):
            return jsonify({"detail": "Invalid email or password"}), 401
        
        # Generate and store token
        token = generate_token()
        tokens[token] = {
            "email": email,
            "created": datetime.now().timestamp(),
            "role": "admin"
        }
        
        return jsonify({"access_token": token, "token_type": "bearer"})
    except Exception as e:
        return jsonify({"detail": "Invalid request"}), 400

@app.route("/api/admin/me")
def get_admin_info():
    """Get current admin user info"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    return jsonify({
        "email": ADMIN_EMAIL,
        "role": "Administrator",
        "status": "Active"
    })

@app.route("/api/admin/logout", methods=["POST"])
def admin_logout():
    """Admin logout"""
    token = request.args.get("token")
    if token in tokens:
        del tokens[token]
    return jsonify({"message": "Successfully logged out"})

@app.route("/api/admin/stats")
def get_admin_stats():
    """Get admin dashboard statistics"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    return jsonify({
        "total_users": len(users),
        "total_visitors": 1250,
        "total_pages": 15,
        "total_forms": 8,
        "last_login": datetime.now().isoformat(),
        "system_status": "Healthy",
        "uptime": "99.9%"
    })

@app.route("/api/admin/users")
def get_all_users():
    """Get all users (admin only)"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    users_list = []
    for email, user_data in users.items():
        profile_data = user_profiles.get(email, {})
        users_list.append({
            "email": email,
            "name": user_data.get("name", ""),
            "role": user_data.get("role", "user"),
            "status": user_data.get("status", "active"),
            "created_at": user_data.get("created_at"),
            "last_login": profile_data.get("last_login"),
            "saved_items_count": len(profile_data.get("saved_items", []))
        })
    
    return jsonify({"users": users_list})

@app.route("/api/admin/content")
def get_content_list():
    """Get list of manageable content"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    return jsonify({
        "pages": [
            {"id": 1, "title": "Home Page", "slug": "/", "last_updated": "2024-01-15"},
            {"id": 2, "title": "About Page", "slug": "/about", "last_updated": "2024-01-14"},
            {"id": 3, "title": "Services Page", "slug": "/services", "last_updated": "2024-01-13"},
        ],
        "posts": [
            {"id": 1, "title": "Latest Research", "slug": "/research/latest", "last_updated": "2024-01-12"},
            {"id": 2, "title": "Publications", "slug": "/publications", "last_updated": "2024-01-11"},
        ]
    })

@app.route("/api/admin/credentials", methods=["GET"])
def get_admin_credentials():
    """Get current admin credentials (without password)"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    return jsonify({
        "email": ADMIN_EMAIL,
        "has_password": bool(ADMIN_PASSWORD),
        "password_length": len(ADMIN_PASSWORD) if ADMIN_PASSWORD else 0,
        "history": admin_credentials_history[-5:] if admin_credentials_history else []
    })

@app.route("/api/admin/credentials", methods=["PUT"])
def update_admin_credentials():
    """Update admin credentials"""
    global ADMIN_EMAIL, ADMIN_PASSWORD
    
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    try:
        data = request.get_json()
        current_password = data.get("current_password")
        new_email = data.get("email")
        new_password = data.get("password")
        
        # Verify current password
        if not current_password or current_password != ADMIN_PASSWORD:
            return jsonify({"detail": "Current password is incorrect"}), 401
        
        # Validate new email if provided
        if new_email and not is_valid_email(new_email):
            return jsonify({"detail": "Invalid email format"}), 400
        
        # Validate new password if provided
        if new_password and not is_valid_password(new_password):
            return jsonify({"detail": "Password must be at least 8 characters with uppercase, lowercase, and numbers"}), 400
        
        # Store old credentials in history
        admin_credentials_history.append({
            "timestamp": datetime.now().isoformat(),
            "old_email": ADMIN_EMAIL,
            "new_email": new_email or ADMIN_EMAIL,
            "changed_by": token_data["email"]
        })
        
        # Update credentials
        old_email = ADMIN_EMAIL
        
        if new_email:
            ADMIN_EMAIL = new_email
        
        if new_password:
            ADMIN_PASSWORD = new_password
        
        # Update all existing admin tokens to use new email
        for token_key, token_data in tokens.items():
            if token_data.get("role") == "admin" and token_data.get("email") == old_email:
                token_data["email"] = ADMIN_EMAIL
        
        return jsonify({
            "message": "Credentials updated successfully",
            "email": ADMIN_EMAIL,
            "updated_at": datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({"detail": "Invalid request"}), 400

@app.route("/api/admin/credentials/validate", methods=["POST"])
def validate_current_password():
    """Validate current admin password"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    try:
        data = request.get_json()
        password = data.get("password")
        
        if password == ADMIN_PASSWORD:
            return jsonify({"valid": True})
        else:
            return jsonify({"valid": False})
            
    except Exception as e:
        return jsonify({"detail": "Invalid request"}), 400

# Gallery Management Endpoints
@app.route("/api/gallery/photos", methods=["GET"])
def get_gallery_photos():
    """Get all gallery photos"""
    try:
        photos_list = []
        for photo_id, photo_data in gallery_photos.items():
            photos_list.append({
                "id": photo_id,
                "title": photo_data["title"],
                "description": photo_data["description"],
                "image_url": photo_data["image_url"],
                "thumbnail_url": photo_data["thumbnail_url"],
                "upload_date": photo_data["upload_date"],
                "file_size": photo_data["file_size"],
                "dimensions": photo_data["dimensions"],
                "category": photo_data.get("category"),
                "tags": photo_data.get("tags", [])
            })
        
        # Sort by upload date (newest first)
        photos_list.sort(key=lambda x: x["upload_date"], reverse=True)
        
        return jsonify({
            "photos": photos_list,
            "total": len(photos_list)
        })
    except Exception as e:
        return jsonify({"detail": "Failed to fetch photos"}), 500

@app.route("/api/admin/gallery/photos", methods=["POST"])
def upload_gallery_photo():
    """Upload a new photo to the gallery"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({"detail": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"detail": "No file selected"}), 400
        
        # Get form data
        title = request.form.get('title', 'Untitled Photo')
        description = request.form.get('description', '')
        category = request.form.get('category', '')
        tags = request.form.get('tags', '').split(',') if request.form.get('tags') else []
        
        # Validate file type
        allowed_extensions = {'jpg', 'jpeg', 'png', 'gif', 'webp'}
        if not ('.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
            return jsonify({"detail": "Invalid file type. Allowed types: jpg, jpeg, png, gif, webp"}), 400
        
        # Create uploads directory if it doesn't exist
        import os
        upload_dir = os.path.join(os.getcwd(), 'uploads', 'gallery')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        global next_photo_id
        photo_id = str(next_photo_id)
        next_photo_id += 1
        
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        filename = f"photo_{photo_id}_{int(datetime.now().timestamp())}.{file_extension}"
        
        # Save file
        file_path = os.path.join(upload_dir, filename)
        file.save(file_path)
        
        # Get file info
        file_size = os.path.getsize(file_path)
        
        # For now, we'll use a placeholder for dimensions (in production, use PIL)
        dimensions = {"width": 1920, "height": 1080}  # Default dimensions
        
        # Create URLs (in production, these would be actual URLs)
        image_url = f"http://localhost:8000/uploads/gallery/{filename}"
        thumbnail_url = f"http://localhost:8000/uploads/gallery/{filename}"  # Same for now
        
        # Store photo data
        gallery_photos[photo_id] = {
            "title": title,
            "description": description,
            "image_url": image_url,
            "thumbnail_url": thumbnail_url,
            "upload_date": datetime.now().isoformat(),
            "file_size": file_size,
            "dimensions": dimensions,
            "category": category,
            "tags": [tag.strip() for tag in tags if tag.strip()],
            "filename": filename,
            "uploaded_by": token_data["email"]
        }
        
        return jsonify({
            "message": "Photo uploaded successfully",
            "photo": {
                "id": photo_id,
                "title": title,
                "description": description,
                "image_url": image_url,
                "thumbnail_url": thumbnail_url,
                "upload_date": gallery_photos[photo_id]["upload_date"],
                "file_size": file_size,
                "dimensions": dimensions,
                "category": category,
                "tags": gallery_photos[photo_id]["tags"]
            }
        }), 201
        
    except Exception as e:
        return jsonify({"detail": f"Upload failed: {str(e)}"}), 500

@app.route("/api/admin/gallery/photos/<photo_id>", methods=["PUT"])
def update_gallery_photo(photo_id):
    """Update photo details"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    try:
        if photo_id not in gallery_photos:
            return jsonify({"detail": "Photo not found"}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        if "title" in data:
            gallery_photos[photo_id]["title"] = data["title"]
        if "description" in data:
            gallery_photos[photo_id]["description"] = data["description"]
        if "category" in data:
            gallery_photos[photo_id]["category"] = data["category"]
        if "tags" in data:
            gallery_photos[photo_id]["tags"] = data["tags"]
        
        return jsonify({
            "message": "Photo updated successfully",
            "photo": gallery_photos[photo_id]
        })
        
    except Exception as e:
        return jsonify({"detail": "Update failed"}), 500

@app.route("/api/admin/gallery/photos/<photo_id>", methods=["DELETE"])
def delete_gallery_photo(photo_id):
    """Delete a photo from the gallery"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    try:
        if photo_id not in gallery_photos:
            return jsonify({"detail": "Photo not found"}), 404
        
        # Delete file from filesystem
        import os
        photo_data = gallery_photos[photo_id]
        if "filename" in photo_data:
            file_path = os.path.join(os.getcwd(), 'uploads', 'gallery', photo_data["filename"])
            if os.path.exists(file_path):
                os.remove(file_path)
        
        # Remove from storage
        del gallery_photos[photo_id]
        
        return jsonify({"message": "Photo deleted successfully"})
        
    except Exception as e:
        return jsonify({"detail": "Deletion failed"}), 500

@app.route("/api/admin/gallery/photos", methods=["GET"])
def get_admin_gallery_photos():
    """Get all gallery photos for admin management"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    try:
        photos_list = []
        for photo_id, photo_data in gallery_photos.items():
            photos_list.append({
                "id": photo_id,
                "title": photo_data["title"],
                "description": photo_data["description"],
                "image_url": photo_data["image_url"],
                "thumbnail_url": photo_data["thumbnail_url"],
                "upload_date": photo_data["upload_date"],
                "file_size": photo_data["file_size"],
                "dimensions": photo_data["dimensions"],
                "category": photo_data.get("category"),
                "tags": photo_data.get("tags", []),
                "uploaded_by": photo_data.get("uploaded_by"),
                "filename": photo_data.get("filename")
            })
        
        # Sort by upload date (newest first)
        photos_list.sort(key=lambda x: x["upload_date"], reverse=True)
        
        return jsonify({
            "photos": photos_list,
            "total": len(photos_list)
        })
    except Exception as e:
        return jsonify({"detail": "Failed to fetch photos"}), 500

# Message Management Endpoints
@app.route("/api/messages", methods=["GET"])
def get_messages():
    """Get all messages with filtering and pagination"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    try:
        # Get query parameters
        status = request.args.get("status", "all")
        priority = request.args.get("priority", "all")
        category = request.args.get("category", "all")
        search = request.args.get("search", "")
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 20))
        
        # Filter messages
        filtered_messages = []
        for msg_id, message in messages.items():
            # Status filter
            if status != "all" and message.get("status") != status:
                continue
            
            # Priority filter
            if priority != "all" and message.get("priority") != priority:
                continue
            
            # Category filter
            if category != "all" and message.get("category") != category:
                continue
            
            # Search filter
            if search:
                search_lower = search.lower()
                if (search_lower not in message.get("name", "").lower() and
                    search_lower not in message.get("email", "").lower() and
                    search_lower not in message.get("subject", "").lower() and
                    search_lower not in message.get("message", "").lower()):
                    continue
            
            filtered_messages.append({
                "id": msg_id,
                **message
            })
        
        # Sort by created date (newest first)
        filtered_messages.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        # Pagination
        total = len(filtered_messages)
        start = (page - 1) * limit
        end = start + limit
        paginated_messages = filtered_messages[start:end]
        
        return jsonify({
            "messages": paginated_messages,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit
        })
    except Exception as e:
        return jsonify({"detail": "Failed to fetch messages"}), 500

@app.route("/api/messages/<int:message_id>", methods=["GET"])
def get_message(message_id):
    """Get single message details"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    try:
        if str(message_id) not in messages:
            return jsonify({"detail": "Message not found"}), 404
        
        message = messages[str(message_id)]
        replies = message_replies.get(str(message_id), [])
        
        return jsonify({
            "message": {
                "id": message_id,
                **message
            },
            "replies": replies
        })
    except Exception as e:
        return jsonify({"detail": "Failed to fetch message"}), 500

@app.route("/api/messages/<int:message_id>", methods=["PUT"])
def update_message(message_id):
    """Update message status, priority, or category"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    try:
        if str(message_id) not in messages:
            return jsonify({"detail": "Message not found"}), 404
        
        data = request.get_json()
        message = messages[str(message_id)]
        
        # Update allowed fields
        if "status" in data:
            message["status"] = data["status"]
            if data["status"] == "read":
                message["read_at"] = datetime.now().isoformat()
        
        if "priority" in data:
            message["priority"] = data["priority"]
        
        if "category" in data:
            message["category"] = data["category"]
        
        message["updated_at"] = datetime.now().isoformat()
        
        return jsonify({
            "message": "Message updated successfully",
            "data": {
                "id": message_id,
                **message
            }
        })
    except Exception as e:
        return jsonify({"detail": "Failed to update message"}), 500

@app.route("/api/messages/<int:message_id>/reply", methods=["POST"])
def reply_to_message(message_id):
    """Send reply to a message"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    try:
        if str(message_id) not in messages:
            return jsonify({"detail": "Message not found"}), 404
        
        data = request.get_json()
        reply_content = data.get("reply", "")
        
        if not reply_content.strip():
            return jsonify({"detail": "Reply content is required"}), 400
        
        # Create reply record
        global next_reply_id
        reply_id = str(next_reply_id)
        next_reply_id += 1
        
        reply = {
            "id": reply_id,
            "message_id": str(message_id),
            "reply_content": reply_content,
            "reply_type": "admin",
            "sent_at": datetime.now().isoformat(),
            "sent_by": token_data["email"]
        }
        
        # Store reply
        if str(message_id) not in message_replies:
            message_replies[str(message_id)] = []
        message_replies[str(message_id)].append(reply)
        
        # Update message status
        messages[str(message_id)]["status"] = "replied"
        messages[str(message_id)]["replied_at"] = datetime.now().isoformat()
        messages[str(message_id)]["replied_by"] = token_data["email"]
        messages[str(message_id)]["updated_at"] = datetime.now().isoformat()
        
        # TODO: Send actual email reply
        print(f"Email reply to {messages[str(message_id)]['email']}: {reply_content}")
        
        return jsonify({
            "message": "Reply sent successfully",
            "reply": reply
        })
    except Exception as e:
        return jsonify({"detail": "Failed to send reply"}), 500

@app.route("/api/messages", methods=["DELETE"])
def delete_messages():
    """Delete multiple messages"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    try:
        data = request.get_json()
        message_ids = data.get("message_ids", [])
        
        deleted_count = 0
        for msg_id in message_ids:
            if str(msg_id) in messages:
                del messages[str(msg_id)]
                if str(msg_id) in message_replies:
                    del message_replies[str(msg_id)]
                deleted_count += 1
        
        return jsonify({
            "message": f"{deleted_count} messages deleted successfully"
        })
    except Exception as e:
        return jsonify({"detail": "Failed to delete messages"}), 500

@app.route("/api/messages/stats", methods=["GET"])
def get_message_stats():
    """Get message statistics"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    try:
        stats = {
            "total": len(messages),
            "new": sum(1 for msg in messages.values() if msg.get("status") == "new"),
            "read": sum(1 for msg in messages.values() if msg.get("status") == "read"),
            "replied": sum(1 for msg in messages.values() if msg.get("status") == "replied"),
            "archived": sum(1 for msg in messages.values() if msg.get("status") == "archived"),
            "urgent": sum(1 for msg in messages.values() if msg.get("priority") == "urgent"),
            "high": sum(1 for msg in messages.values() if msg.get("priority") == "high"),
            "contact": sum(1 for msg in messages.values() if msg.get("category") == "contact"),
            "consultation": sum(1 for msg in messages.values() if msg.get("category") == "consultation"),
            "research": sum(1 for msg in messages.values() if msg.get("category") == "research")
        }
        
        return jsonify(stats)
    except Exception as e:
        return jsonify({"detail": "Failed to fetch stats"}), 500

@app.route("/api/messages", methods=["POST"])
def create_message():
    """Create new message (from contact form)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ["name", "email", "message"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"detail": f"{field} is required"}), 400
        
        # Validate email
        if not is_valid_email(data.get("email", "")):
            return jsonify({"detail": "Invalid email format"}), 400
        
        # Create message
        global next_message_id
        message_id = str(next_message_id)
        next_message_id += 1
        
        message = {
            "from": data["name"].strip(),
            "from_email": data["email"].lower().strip(),
            "to": "Administrator",
            "to_email": ADMIN_EMAIL,
            "subject": data.get("subject", "").strip(),
            "message": data["message"].strip(),
            "phone": data.get("phone", "").strip(),
            "status": "new",
            "priority": data.get("priority", "normal"),
            "category": data.get("category", "contact"),
            "ip_address": request.headers.get("x-forwarded-for", "unknown"),
            "user_agent": request.headers.get("user-agent", ""),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "is_from_admin": False
        }
        
        messages[message_id] = message
        
        return jsonify({
            "message": "Message created successfully",
            "data": {
                "id": message_id,
                **message
            }
        }), 201
    except Exception as e:
        return jsonify({"detail": "Failed to create message"}), 500

# User Messaging Endpoints
@app.route("/api/user/messages", methods=["GET"])
def get_user_messages():
    """Get messages for authenticated user"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data:
        return jsonify({"detail": "Invalid token"}), 401
    
    try:
        # Get query parameters
        status = request.args.get("status", "all")
        priority = request.args.get("priority", "all")
        category = request.args.get("category", "all")
        search = request.args.get("search", "")
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 20))
        
        # Filter messages for this user
        user_email = token_data["email"]
        filtered_messages = []
        
        for msg_id, message in messages.items():
            # Only show messages where user is sender or recipient
            if (message.get("from_email") == user_email or 
                message.get("to_email") == user_email):
                
                # Status filter (convert inbox to show new/read messages)
                if status != "all":
                    if status == "inbox":
                        if message.get("status") not in ["new", "read"]:
                            continue
                    elif status == "sent":
                        if message.get("is_from_admin") != False:
                            continue
                    elif status != message.get("status"):
                        continue
                
                # Priority filter
                if priority != "all" and message.get("priority") != priority:
                    continue
                
                # Category filter
                if category != "all" and message.get("category") != category:
                    continue
                
                # Search filter
                if search:
                    search_lower = search.lower()
                    if (search_lower not in message.get("from", "").lower() and
                        search_lower not in message.get("from_email", "").lower() and
                        search_lower not in message.get("to", "").lower() and
                        search_lower not in message.get("to_email", "").lower() and
                        search_lower not in message.get("subject", "").lower() and
                        search_lower not in message.get("message", "").lower()):
                        continue
                
                filtered_messages.append({
                    "id": int(msg_id),
                    **message
                })
        
        # Sort by created date (newest first)
        filtered_messages.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        # Pagination
        total = len(filtered_messages)
        start = (page - 1) * limit
        end = start + limit
        paginated_messages = filtered_messages[start:end]
        
        return jsonify({
            "messages": paginated_messages,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit
        })
    except Exception as e:
        return jsonify({"detail": "Failed to fetch messages"}), 500

@app.route("/api/user/messages/<int:message_id>", methods=["PUT"])
def update_user_message(message_id):
    """Update user message status"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data:
        return jsonify({"detail": "Invalid token"}), 401
    
    try:
        if str(message_id) not in messages:
            return jsonify({"detail": "Message not found"}), 404
        
        message = messages[str(message_id)]
        user_email = token_data["email"]
        
        # Check if user owns this message
        if (message.get("from_email") != user_email and 
            message.get("to_email") != user_email):
            return jsonify({"detail": "Access denied"}), 403
        
        data = request.get_json()
        
        # Update allowed fields
        if "status" in data:
            message["status"] = data["status"]
            if data["status"] == "read":
                message["read_at"] = datetime.now().isoformat()
        
        message["updated_at"] = datetime.now().isoformat()
        
        return jsonify({
            "message": "Message updated successfully",
            "data": {
                "id": message_id,
                **message
            }
        })
    except Exception as e:
        return jsonify({"detail": "Failed to update message"}), 500

@app.route("/api/user/messages/send", methods=["POST"])
def send_user_message():
    """Send message from user to admin"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data:
        return jsonify({"detail": "Invalid token"}), 401
    
    try:
        data = request.get_json()
        
        if not data.get("message") or not data.get("message").strip():
            return jsonify({"detail": "Message content is required"}), 400
        
        # Create message from user to admin
        global next_message_id
        message_id = str(next_message_id)
        next_message_id += 1
        
        message = {
            "from": token_data.get("name", token_data["email"]),
            "from_email": token_data["email"],
            "to": "Administrator",
            "to_email": ADMIN_EMAIL,
            "subject": data.get("subject", "").strip(),
            "message": data["message"].strip(),
            "status": "new",
            "priority": "normal",
            "category": data.get("category", "general"),
            "ip_address": request.headers.get("x-forwarded-for", "unknown"),
            "user_agent": request.headers.get("user-agent", ""),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "is_from_admin": False
        }
        
        messages[message_id] = message
        
        return jsonify({
            "message": "Message sent successfully",
            "data": {
                "id": message_id,
                **message
            }
        }), 201
    except Exception as e:
        return jsonify({"detail": "Failed to send message"}), 500

@app.route("/api/user/messages", methods=["DELETE"])
def delete_user_messages():
    """Delete user messages"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data:
        return jsonify({"detail": "Invalid token"}), 401
    
    try:
        data = request.get_json()
        message_ids = data.get("message_ids", [])
        user_email = token_data["email"]
        
        deleted_count = 0
        for msg_id in message_ids:
            if str(msg_id) in messages:
                message = messages[str(msg_id)]
                # Check if user owns this message
                if (message.get("from_email") == user_email or 
                    message.get("to_email") == user_email):
                    del messages[str(msg_id)]
                    if str(msg_id) in message_replies:
                        del message_replies[str(msg_id)]
                    deleted_count += 1
        
        return jsonify({
            "message": f"{deleted_count} messages deleted successfully"
        })
    except Exception as e:
        return jsonify({"detail": "Failed to delete messages"}), 500

@app.route("/api/user/messages/stats", methods=["GET"])
def get_user_message_stats():
    """Get message statistics for user"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data:
        return jsonify({"detail": "Invalid token"}), 401
    
    try:
        user_email = token_data["email"]
        stats = {
            "total": 0,
            "new": 0,
            "read": 0,
            "replied": 0,
            "archived": 0,
            "sent": 0,
            "conversations": 0
        }
        
        for msg_id, message in messages.items():
            # Only count messages where user is sender or recipient
            if (message.get("from_email") == user_email or 
                message.get("to_email") == user_email):
                
                status = message.get("status", "new")
                stats["total"] += 1
                
                if status == "new":
                    stats["new"] += 1
                elif status == "read":
                    stats["read"] += 1
                elif status == "replied":
                    stats["replied"] += 1
                elif status == "archived":
                    stats["archived"] += 1
                
                # Count sent messages (messages from user to admin)
                if not message.get("is_from_admin", True):
                    stats["sent"] += 1
        
        # Count conversations
        for conv_id, conversation in conversations.items():
            if (conversation.get("participant_email") == user_email or 
                conversation.get("admin_email") == user_email):
                stats["conversations"] += 1
        
        return jsonify(stats)
    except Exception as e:
        return jsonify({"detail": "Failed to fetch stats"}), 500

@app.route("/api/user/conversations", methods=["GET"])
def get_user_conversations():
    """Get conversation threads for user"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data:
        return jsonify({"detail": "Invalid token"}), 401
    
    try:
        user_email = token_data["email"]
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 20))
        
        # Filter conversations for this user
        filtered_conversations = []
        
        for conv_id, conversation in conversations.items():
            if (conversation.get("participant_email") == user_email or 
                conversation.get("admin_email") == user_email):
                
                # Get latest message in conversation
                latest_message = None
                latest_time = ""
                
                for msg_id, message in messages.items():
                    if (message.get("conversation_id") == conv_id):
                        msg_time = message.get("updated_at", message.get("created_at", ""))
                        if msg_time > latest_time:
                            latest_time = msg_time
                            latest_message = message
                
                if latest_message:
                    filtered_conversations.append({
                        "id": int(conv_id),
                        **conversation,
                        "latest_message": latest_message,
                        "unread_count": sum(1 for msg in messages.values() 
                            if msg.get("conversation_id") == conv_id and 
                               msg.get("status") == "new" and 
                               msg.get("to_email") == user_email)
                    })
        
        # Sort by latest message time
        filtered_conversations.sort(key=lambda x: x["latest_message"]["updated_at"], reverse=True)
        
        # Pagination
        total = len(filtered_conversations)
        start = (page - 1) * limit
        end = start + limit
        paginated_conversations = filtered_conversations[start:end]
        
        return jsonify({
            "conversations": paginated_conversations,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit
        })
    except Exception as e:
        return jsonify({"detail": "Failed to fetch conversations"}), 500

@app.route("/api/user/conversations/<int:conversation_id>", methods=["GET"])
def get_conversation_messages():
    """Get all messages in a conversation thread"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data:
        return jsonify({"detail": "Invalid token"}), 401
    
    try:
        user_email = token_data["email"]
        conversation_id = str(conversation_id)
        
        if conversation_id not in conversations:
            return jsonify({"detail": "Conversation not found"}), 404
        
        conversation = conversations[conversation_id]
        
        # Check if user is part of this conversation
        if (conversation.get("participant_email") != user_email and 
            conversation.get("admin_email") != user_email):
            return jsonify({"detail": "Access denied"}), 403
        
        # Get all messages in this conversation
        conversation_messages = []
        
        for msg_id, message in messages.items():
            if message.get("conversation_id") == conversation_id:
                conversation_messages.append({
                    "id": int(msg_id),
                    **message
                })
        
        # Sort by created date
        conversation_messages.sort(key=lambda x: x.get("created_at", ""))
        
        return jsonify({
            "conversation": {
                "id": conversation_id,
                **conversation
            },
            "messages": conversation_messages
        })
    except Exception as e:
        return jsonify({"detail": "Failed to fetch conversation"}), 500

# Email Settings Management Endpoints
@app.route("/api/admin/email-settings", methods=["GET"])
def get_email_settings():
    """Get email configuration settings"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    try:
        # Return mock email settings (in production, store in database)
        settings = {
            "provider": "none",
            "smtp_host": "",
            "smtp_port": 587,
            "smtp_username": "",
            "smtp_password": "",
            "smtp_use_tls": True,
            "gmail_client_id": "",
            "gmail_client_secret": "",
            "gmail_refresh_token": "",
            "outlook_client_id": "",
            "outlook_client_secret": "",
            "outlook_refresh_token": "",
            "from_email": "noreply@stephenasatsa.com",
            "from_name": "Dr. Stephen Asatsa",
            "reply_to_email": "admin@stephenasatsa.com",
            "enabled": False
        }
        
        return jsonify(settings)
    except Exception as e:
        return jsonify({"detail": "Failed to fetch email settings"}), 500

@app.route("/api/admin/email-settings", methods=["PUT"])
def update_email_settings():
    """Update email configuration settings"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    try:
        data = request.get_json()
        
        # Validate provider
        valid_providers = ["none", "gmail", "outlook", "smtp"]
        if data.get("provider") not in valid_providers:
            return jsonify({"detail": "Invalid email provider"}), 400
        
        # In production, update database instead of returning mock data
        return jsonify({
            "message": "Email settings updated successfully",
            "data": data
        })
    except Exception as e:
        return jsonify({"detail": "Failed to update email settings"}), 500

@app.route("/api/admin/email-settings/test", methods=["POST"])
def test_email_settings():
    """Test email configuration"""
    token = request.args.get("token")
    token_data = verify_token(token)
    
    if not token_data or token_data["role"] != "admin":
        return jsonify({"detail": "Invalid token"}), 401
    
    try:
        data = request.get_json()
        
        # Mock email test (in production, send actual test email)
        print(f"Email test with provider: {data.get('provider')}")
        print(f"Settings: {data}")
        
        # Simulate test result
        return jsonify({
            "message": "Test email sent successfully",
            "success": True
        })
    except Exception as e:
        return jsonify({
            "detail": "Failed to send test email",
            "success": False
        }), 500

# Serve uploaded files
@app.route("/uploads/gallery/<filename>")
def serve_gallery_file(filename):
    """Serve uploaded gallery files"""
    try:
        import os
        from flask import send_from_directory
        upload_dir = os.path.join(os.getcwd(), 'uploads', 'gallery')
        return send_from_directory(upload_dir, filename)
    except Exception as e:
        return jsonify({"detail": "File not found"}), 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6354, debug=True)
