"""
Gallery API for Enhanced Message Management System
Handles gallery photo management, upload, and retrieval
"""

import os
import sqlite3
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from datetime import datetime
import json
from functools import wraps

# Database setup
DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'messages.db')

def get_db():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def create_gallery_app():
    """Create Flask app for gallery routes"""
    app = Flask(__name__)
    return app

def init_gallery_table():
    """Initialize gallery table if it doesn't exist"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS gallery_photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            original_filename TEXT NOT NULL,
            title TEXT,
            description TEXT,
            category TEXT DEFAULT 'general',
            tags TEXT,
            upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            file_size INTEGER,
            dimensions TEXT,
            mime_type TEXT,
            uploaded_by TEXT,
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize gallery table on import
init_gallery_table()

def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization') or request.args.get('token')
        
        if not token:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Verify token (simplified for demo)
        # In production, implement proper JWT verification
        return f(*args, **kwargs)
    
    return decorated_function

# These routes will be registered in the main app
@require_auth
def get_gallery_photos():
    """Get all gallery photos"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Get query parameters
        category = request.args.get('category', '')
        tags = request.args.get('tags', '').split(',') if request.args.get('tags') else []
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
        
        # Build query
        query = '''
            SELECT id, filename, original_filename, title, description, category, tags,
                   upload_date, file_size, dimensions, mime_type, uploaded_by, is_active
            FROM gallery_photos 
            WHERE is_active = 1
        '''
        params = []
        
        if category:
            query += ' AND category = ?'
            params.append(category)
        
        if tags:
            tag_conditions = ' OR '.join(['tags LIKE ?'] * len(tags))
            query += f' AND ({tag_conditions})'
            params.extend([f'%{tag.strip()}%' for tag in tags])
        
        query += ' ORDER BY upload_date DESC LIMIT ? OFFSET ?'
        params.extend([limit, offset])
        
        cursor.execute(query, params)
        photos = cursor.fetchall()
        
        # Format photos for frontend
        formatted_photos = []
        for photo in photos:
            formatted_photos.append({
                'id': photo['id'],
                'title': photo['title'] or f"Photo {photo['id']}",
                'description': photo['description'] or '',
                'category': photo['category'],
                'tags': photo['tags'].split(',') if photo['tags'] else [],
                'upload_date': photo['upload_date'],
                'file_size': photo['file_size'],
                'dimensions': json.loads(photo['dimensions']) if photo['dimensions'] else None,
                'mime_type': photo['mime_type'],
                'uploaded_by': photo['uploaded_by'],
                'image_url': f'/uploads/gallery/{photo["filename"]}',
                'thumbnail_url': f'/uploads/gallery/thumbnails/{photo["filename"]}',
                'filename': photo['filename']
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'photos': formatted_photos,
            'total': len(formatted_photos)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/gallery/photos/<int:photo_id>', methods=['GET'])
@require_auth
def get_gallery_photo(photo_id):
    """Get specific gallery photo"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, filename, original_filename, title, description, category, tags,
                   upload_date, file_size, dimensions, mime_type, uploaded_by, is_active
            FROM gallery_photos 
            WHERE id = ? AND is_active = 1
        ''', (photo_id,))
        
        photo = cursor.fetchone()
        
        if not photo:
            return jsonify({'error': 'Photo not found'}), 404
        
        # Format photo for frontend
        formatted_photo = {
            'id': photo['id'],
            'title': photo['title'] or f"Photo {photo['id']}",
            'description': photo['description'] or '',
            'category': photo['category'],
            'tags': photo['tags'].split(',') if photo['tags'] else [],
            'upload_date': photo['upload_date'],
            'file_size': photo['file_size'],
            'dimensions': json.loads(photo['dimensions']) if photo['dimensions'] else None,
            'mime_type': photo['mime_type'],
            'uploaded_by': photo['uploaded_by'],
            'image_url': f'/uploads/gallery/{photo["filename"]}',
            'thumbnail_url': f'/uploads/gallery/thumbnails/{photo["filename"]}',
            'filename': photo['filename']
        }
        
        conn.close()
        
        return jsonify({
            'success': True,
            'photo': formatted_photo
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/gallery/photos', methods=['POST'])
@require_auth
def upload_gallery_photo():
    """Upload a new gallery photo"""
    try:
        if 'photo' not in request.files:
            return jsonify({'error': 'No photo file provided'}), 400
        
        file = request.files['photo']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate file type
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'}
        file_ext = file.filename.rsplit('.', 1)[1].lower()
        
        if file_ext not in allowed_extensions:
            return jsonify({'error': 'File type not allowed'}), 400
        
        # Get form data
        title = request.form.get('title', '')
        description = request.form.get('description', '')
        category = request.form.get('category', 'general')
        tags = request.form.get('tags', '')
        
        # Secure filename
        filename = secure_filename(file.filename)
        unique_filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
        
        # Create upload directories
        upload_dir = os.path.join(os.path.dirname(__file__), 'public', 'uploads', 'gallery')
        thumbnail_dir = os.path.join(upload_dir, 'thumbnails')
        
        os.makedirs(upload_dir, exist_ok=True)
        os.makedirs(thumbnail_dir, exist_ok=True)
        
        # Save file
        file_path = os.path.join(upload_dir, unique_filename)
        file.save(file_path)
        
        # Get file info
        file_size = os.path.getsize(file_path)
        mime_type = file.content_type or 'image/jpeg'
        
        # TODO: Generate thumbnail (for now, use original)
        thumbnail_path = file_path
        
        # Save to database
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO gallery_photos 
            (filename, original_filename, title, description, category, tags,
             upload_date, file_size, dimensions, mime_type, uploaded_by, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        ''', (
            unique_filename,
            file.filename,
            title,
            description,
            category,
            tags,
            datetime.now().isoformat(),
            file_size,
            json.dumps({'width': 1200, 'height': 800}),  # Placeholder
            mime_type,
            'admin'  # Should get from auth token
        ))
        
        conn.commit()
        photo_id = cursor.lastrowid
        conn.close()
        
        return jsonify({
            'success': True,
            'photo': {
                'id': photo_id,
                'filename': unique_filename,
                'title': title,
                'description': description,
                'category': category,
                'tags': tags.split(',') if tags else [],
                'upload_date': datetime.now().isoformat(),
                'file_size': file_size,
                'image_url': f'/uploads/gallery/{unique_filename}',
                'thumbnail_url': f'/uploads/gallery/thumbnails/{unique_filename}'
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/gallery/photos/<int:photo_id>', methods=['PUT'])
@require_auth
def update_gallery_photo(photo_id):
    """Update gallery photo metadata"""
    try:
        data = request.get_json()
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if photo exists
        cursor.execute('SELECT id FROM gallery_photos WHERE id = ? AND is_active = 1', (photo_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({'error': 'Photo not found'}), 404
        
        # Update photo
        update_fields = []
        update_values = []
        
        if 'title' in data:
            update_fields.append('title = ?')
            update_values.append(data['title'])
        
        if 'description' in data:
            update_fields.append('description = ?')
            update_values.append(data['description'])
        
        if 'category' in data:
            update_fields.append('category = ?')
            update_values.append(data['category'])
        
        if 'tags' in data:
            update_fields.append('tags = ?')
            update_values.append(data['tags'])
        
        if update_fields:
            query = f'''
                UPDATE gallery_photos 
                SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND is_active = 1
            '''
            update_values.append(photo_id)
            
            cursor.execute(query, update_values)
            conn.commit()
        
        conn.close()
        
        return jsonify({'success': True, 'message': 'Photo updated successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/gallery/photos/<int:photo_id>', methods=['DELETE'])
@require_auth
def delete_gallery_photo(photo_id):
    """Delete gallery photo"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if photo exists
        cursor.execute('SELECT filename FROM gallery_photos WHERE id = ? AND is_active = 1', (photo_id,))
        photo = cursor.fetchone()
        
        if not photo:
            conn.close()
            return jsonify({'error': 'Photo not found'}), 404
        
        # Soft delete (mark as inactive)
        cursor.execute('''
            UPDATE gallery_photos 
            SET is_active = 0, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (photo_id,))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Photo deleted successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/gallery/categories', methods=['GET'])
@require_auth
def get_gallery_categories():
    """Get all gallery categories"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT DISTINCT category 
            FROM gallery_photos 
            WHERE is_active = 1 AND category IS NOT NULL
            ORDER BY category
        ''')
        
        categories = cursor.fetchall()
        conn.close()
        
        return jsonify({
            'success': True,
            'categories': [cat['category'] for cat in categories if cat['category']]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@gallery_api.route('/api/gallery/stats', methods=['GET'])
@require_auth
def get_gallery_stats():
    """Get gallery statistics"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Get total photos
        cursor.execute('SELECT COUNT(*) as total FROM gallery_photos WHERE is_active = 1')
        total_photos = cursor.fetchone()['total']
        
        # Get photos by category
        cursor.execute('''
            SELECT category, COUNT(*) as count 
            FROM gallery_photos 
            WHERE is_active = 1 AND category IS NOT NULL
            GROUP BY category
            ORDER BY count DESC
        ''')
        photos_by_category = cursor.fetchall()
        
        # Get storage info
        cursor.execute('SELECT SUM(file_size) as total_size FROM gallery_photos WHERE is_active = 1')
        total_size = cursor.fetchone()['total_size'] or 0
        
        conn.close()
        
        return jsonify({
            'success': True,
            'stats': {
                'total_photos': total_photos,
                'photos_by_category': dict(photos_by_category),
                'total_size_mb': round(total_size / (1024 * 1024), 2),
                'categories': len(photos_by_category)
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Serve uploaded files
@app.route('/uploads/gallery/<filename>')
def serve_gallery_file(filename):
    """Serve uploaded gallery files"""
    return send_from_directory(
        os.path.join(os.path.dirname(__file__), 'public', 'uploads', 'gallery'),
        filename
    )

@app.route('/uploads/gallery/thumbnails/<filename>')
def serve_gallery_thumbnail(filename):
    """Serve gallery thumbnail files"""
    return send_from_directory(
        os.path.join(os.path.dirname(__file__), 'public', 'uploads', 'gallery', 'thumbnails'),
        filename
    )

if __name__ == '__main__':
    # This is a standalone gallery API module
    # It should be imported into the main app.py
    pass
