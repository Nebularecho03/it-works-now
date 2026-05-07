from __future__ import annotations

import sqlite3
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
import config
from security import hash_password, verify_password


class UserDatabase:
    def __init__(self, db_path: Path | None = None):
        self.db_path = db_path or config.DATA_DIR / "users.db"
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_database()
    
    def _init_database(self) -> None:
        """Initialize the database with required tables"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE,
                    password_hash TEXT NOT NULL,
                    display_name TEXT NOT NULL,
                    role TEXT NOT NULL DEFAULT 'user',
                    is_active BOOLEAN DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP,
                    mfa_enabled BOOLEAN DEFAULT 0,
                    mfa_secret TEXT,
                    phone_number TEXT
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS user_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    token TEXT UNIQUE NOT NULL,
                    ip_address TEXT,
                    user_agent TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP NOT NULL,
                    is_active BOOLEAN DEFAULT 1,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS audit_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    action TEXT NOT NULL,
                    actor TEXT NOT NULL,
                    summary TEXT NOT NULL,
                    metadata TEXT,
                    ip_address TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS content (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    type TEXT NOT NULL DEFAULT 'page',
                    status TEXT NOT NULL DEFAULT 'draft',
                    category TEXT,
                    tags TEXT,
                    seo_title TEXT,
                    seo_description TEXT,
                    author_id INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    published_at TIMESTAMP,
                    metadata TEXT,
                    FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE SET NULL
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS media (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    filename TEXT NOT NULL,
                    original_filename TEXT NOT NULL,
                    type TEXT NOT NULL,
                    size INTEGER NOT NULL,
                    url TEXT NOT NULL,
                    thumbnail_url TEXT,
                    uploaded_by INTEGER,
                    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    tags TEXT,
                    metadata TEXT,
                    FOREIGN KEY (uploaded_by) REFERENCES users (id) ON DELETE SET NULL
                )
            """)
            
            # Server monitoring tables
            conn.execute("""
                CREATE TABLE IF NOT EXISTS server_metrics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    cpu_usage REAL NOT NULL,
                    ram_usage REAL NOT NULL,
                    disk_usage REAL NOT NULL,
                    disk_free REAL NOT NULL,
                    network_sent REAL NOT NULL,
                    network_received REAL NOT NULL,
                    uptime_seconds INTEGER NOT NULL,
                    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_metrics_recorded_at 
                ON server_metrics(recorded_at)
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS server_metrics_hourly (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    hour_timestamp TIMESTAMP UNIQUE NOT NULL,
                    avg_cpu_usage REAL,
                    avg_ram_usage REAL,
                    max_cpu_usage REAL,
                    max_ram_usage REAL,
                    avg_disk_usage REAL,
                    total_network_sent REAL,
                    total_network_received REAL,
                    data_points INTEGER DEFAULT 0
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS server_metrics_daily (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    day_timestamp DATE UNIQUE,
                    avg_cpu_usage REAL,
                    max_cpu_usage REAL,
                    min_cpu_usage REAL,
                    avg_ram_usage REAL,
                    max_ram_usage REAL,
                    min_ram_usage REAL,
                    avg_disk_usage REAL,
                    total_records INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_daily_day_timestamp 
                ON server_metrics_daily(day_timestamp)
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS cleanup_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    action_type TEXT NOT NULL,
                    records_deleted INTEGER DEFAULT 0,
                    execution_time_ms INTEGER,
                    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    status TEXT CHECK(status IN ('success', 'failed', 'partial')),
                    notes TEXT
                )
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_cleanup_executed_at 
                ON cleanup_log(executed_at)
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS retention_settings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    raw_retention_days INTEGER DEFAULT 7,
                    hourly_retention_days INTEGER DEFAULT 30,
                    daily_retention_days INTEGER DEFAULT 365,
                    cleanup_time TEXT DEFAULT '02:00',
                    enabled BOOLEAN DEFAULT 1,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Insert default retention settings if not exists
            cursor = conn.execute("SELECT COUNT(*) as count FROM retention_settings")
            if cursor.fetchone()['count'] == 0:
                conn.execute("""
                    INSERT INTO retention_settings (
                        raw_retention_days, hourly_retention_days, daily_retention_days,
                        cleanup_time, enabled
                    ) VALUES (7, 30, 365, '02:00', 1)
                """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS home_page_content (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    section TEXT NOT NULL,
                    field TEXT NOT NULL,
                    value TEXT,
                    updated_by INTEGER,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE SET NULL,
                    UNIQUE(section, field)
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS professional_affiliations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    role TEXT NOT NULL,
                    short_description TEXT NOT NULL,
                    detailed_description TEXT NOT NULL,
                    url TEXT NOT NULL,
                    icon TEXT NOT NULL,
                    color TEXT NOT NULL,
                    display_order INTEGER DEFAULT 0,
                    published BOOLEAN DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create indexes for better performance
            conn.execute("CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(token)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_log(user_id)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_log(created_at)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_content_type ON content(type)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_content_status ON content(status)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_content_author ON content(author_id)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_content_created ON content(created_at)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_media_type ON media(type)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media(uploaded_by)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_media_uploaded ON media(uploaded_at)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_home_page_section ON home_page_content(section)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_home_page_updated_by ON home_page_content(updated_by)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_home_page_updated_at ON home_page_content(updated_at)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_affiliations_order ON professional_affiliations(display_order)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_affiliations_published ON professional_affiliations(published)")
            
            # Research interests table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS research_interests (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT,
                    icon TEXT NOT NULL,
                    color TEXT NOT NULL,
                    display_order INTEGER DEFAULT 0,
                    published INTEGER DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Awards table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS awards (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    year INTEGER NOT NULL,
                    description TEXT,
                    organization TEXT,
                    url TEXT,
                    image_url TEXT,
                    icon TEXT NOT NULL,
                    color TEXT NOT NULL,
                    display_order INTEGER DEFAULT 0,
                    published INTEGER DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # External profiles table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS external_profiles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    label TEXT NOT NULL,
                    description TEXT NOT NULL,
                    url TEXT NOT NULL,
                    platform TEXT NOT NULL,
                    icon TEXT NOT NULL,
                    color TEXT NOT NULL,
                    metrics TEXT,
                    display_order INTEGER DEFAULT 0,
                    published INTEGER DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Collaborators table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS collaborators (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    title TEXT NOT NULL,
                    role TEXT NOT NULL,
                    testimonial TEXT NOT NULL,
                    display_order INTEGER DEFAULT 0,
                    published INTEGER DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Hero content table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS hero_content (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    eyebrow TEXT NOT NULL,
                    headline TEXT NOT NULL,
                    description TEXT,
                    badges TEXT,
                    background_image_url TEXT,
                    cta_text TEXT,
                    cta_url TEXT,
                    published INTEGER DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Statistics table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS statistics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    label TEXT NOT NULL,
                    value INTEGER NOT NULL,
                    suffix TEXT,
                    icon TEXT,
                    display_order INTEGER DEFAULT 0,
                    published INTEGER DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Services table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS services (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT,
                    icon TEXT NOT NULL,
                    bullets TEXT,
                    display_order INTEGER DEFAULT 0,
                    published INTEGER DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create indexes for new tables
            conn.execute("CREATE INDEX IF NOT EXISTS idx_research_order ON research_interests(display_order)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_research_published ON research_interests(published)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_awards_order ON awards(display_order)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_awards_published ON awards(published)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_awards_year ON awards(year)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_profiles_order ON external_profiles(display_order)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_profiles_published ON external_profiles(published)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_collaborators_order ON collaborators(display_order)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_collaborators_published ON collaborators(published)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_hero_published ON hero_content(published)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_statistics_order ON statistics(display_order)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_statistics_published ON statistics(published)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_services_order ON services(display_order)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_services_published ON services(published)")

            conn.commit()
    
    def create_user(self, username: str, password: str, email: str | None = None, 
                   display_name: str | None = None, role: str = "user") -> Dict[str, Any]:
        """Create a new user with encrypted password"""
        with sqlite3.connect(self.db_path) as conn:
            # Check if user already exists
            existing = conn.execute(
                "SELECT id FROM users WHERE username = ? OR email = ?", 
                (username, email)
            ).fetchone()
            
            if existing:
                raise ValueError("User with this username or email already exists")
            
            # Hash the password
            password_hash = hash_password(password)
            
            # Insert new user
            cursor = conn.execute("""
                INSERT INTO users (username, email, password_hash, display_name, role)
                VALUES (?, ?, ?, ?, ?)
            """, (username, email, password_hash, display_name or username, role))
            
            user_id = cursor.lastrowid
            conn.commit()
            
            # Return user data
            user_data = self.get_user_by_id(user_id)
            if user_data:
                self.append_audit_event(
                    action="user.created",
                    actor=username,
                    summary=f"User account created for {username}",
                    user_id=user_id
                )
            
            return user_data or {}
    
    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """Get user by username"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            user = conn.execute(
                "SELECT * FROM users WHERE username = ? AND is_active = 1", 
                (username,)
            ).fetchone()
            
            return dict(user) if user else None
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            user = conn.execute(
                "SELECT * FROM users WHERE email = ? AND is_active = 1", 
                (email,)
            ).fetchone()
            
            return dict(user) if user else None
    
    def get_user_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            user = conn.execute(
                "SELECT * FROM users WHERE id = ? AND is_active = 1", 
                (user_id,)
            ).fetchone()
            
            return dict(user) if user else None
    
    def verify_user_password(self, user_id: int, password: str) -> bool:
        """Verify password for a user by ID"""
        user = self.get_user_by_id(user_id)
        if not user:
            return False
        
        return verify_password(password, user["password_hash"])
    
    def verify_user_credentials(self, username: str, password: str) -> Optional[Dict[str, Any]]:
        """Verify user credentials and update last login"""
        user = self.get_user_by_username(username)
        if not user:
            return None
        
        if not verify_password(password, user["password_hash"]):
            return None
        
        # Update last login
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
                (user["id"],)
            )
            conn.commit()
        
        # Log successful login
        self.append_audit_event(
            action="auth.login",
            actor=username,
            summary="User login successful",
            user_id=user["id"]
        )
        
        return user
    
    def create_session(self, user_id: int, token: str, ip_address: str | None = None, 
                      user_agent: str | None = None, expires_hours: int = 8) -> bool:
        """Create a new user session"""
        with sqlite3.connect(self.db_path) as conn:
            # Calculate expiration time
            from datetime import timedelta
            expires_at = datetime.now(timezone.utc) + timedelta(hours=expires_hours)
            
            try:
                conn.execute("""
                    INSERT INTO user_sessions (user_id, token, ip_address, user_agent, expires_at)
                    VALUES (?, ?, ?, ?, ?)
                """, (user_id, token, ip_address, user_agent, expires_at.isoformat()))
                conn.commit()
                return True
            except sqlite3.IntegrityError:
                # Token already exists
                return False
    
    def get_session(self, token: str) -> Optional[Dict[str, Any]]:
        """Get session by token"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            
            # Check if session exists and is not expired
            session = conn.execute("""
                SELECT s.*, u.username, u.display_name, u.role, u.mfa_enabled
                FROM user_sessions s
                JOIN users u ON s.user_id = u.id
                WHERE s.token = ? AND s.is_active = 1 AND s.expires_at > datetime('now')
            """, (token,)).fetchone()
            
            if session:
                session_dict = dict(session)
                # Convert expires_at to string if it's not already
                if isinstance(session_dict.get('expires_at'), str):
                    pass  # Already a string
                return session_dict
            
            return None
    
    def destroy_session(self, token: str) -> bool:
        """Destroy a session"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "UPDATE user_sessions SET is_active = 0 WHERE token = ?", 
                (token,)
            )
            conn.commit()
            return cursor.rowcount > 0
    
    def append_audit_event(self, action: str, actor: str, summary: str, 
                          metadata: Dict[str, Any] | None = None, 
                          user_id: int | None = None, ip_address: str | None = None) -> None:
        """Add an audit event"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT INTO audit_log (user_id, action, actor, summary, metadata, ip_address)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (user_id, action, actor, summary, json.dumps(metadata) if metadata else None, ip_address))
            conn.commit()
    
    def list_audit_events(self, limit: int = 40, user_id: int | None = None) -> List[Dict[str, Any]]:
        """List audit events"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            
            query = """
                SELECT a.*, u.username, u.display_name
                FROM audit_log a
                LEFT JOIN users u ON a.user_id = u.id
            """
            params = []
            
            if user_id:
                query += " WHERE a.user_id = ?"
                params.append(user_id)
            
            query += " ORDER BY a.created_at DESC LIMIT ?"
            params.append(limit)
            
            events = conn.execute(query, params).fetchall()
            return [dict(event) for event in events]
    
    def cleanup_expired_sessions(self) -> int:
        """Clean up expired sessions and return count of cleaned up sessions"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                UPDATE user_sessions 
                SET is_active = 0 
                WHERE is_active = 1 AND expires_at <= datetime('now')
            """)
            conn.commit()
            return cursor.rowcount
    
    def create_content(self, title: str, content: str, content_type: str = 'page', 
                      status: str = 'draft', category: str | None = None, 
                      tags: List[str] | None = None, seo_title: str | None = None,
                      seo_description: str | None = None, author_id: int | None = None,
                      metadata: Dict[str, Any] | None = None) -> Dict[str, Any]:
        """Create new content"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute("""
                INSERT INTO content (title, content, type, status, category, tags, 
                                   seo_title, seo_description, author_id, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (title, content, content_type, status, category, 
                  json.dumps(tags) if tags else None, seo_title, seo_description, 
                  author_id, json.dumps(metadata) if metadata else None))
            
            content_id = cursor.lastrowid
            conn.commit()
            
            # Return created content
            content_data = self.get_content_by_id(content_id)
            if content_data:
                self.append_audit_event(
                    action="content.created",
                    actor=f"user_{author_id}",
                    summary=f"Content '{title}' created",
                    user_id=author_id
                )
            
            return content_data or {}
    
    def get_content_by_id(self, content_id: int) -> Optional[Dict[str, Any]]:
        """Get content by ID"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            content = conn.execute("""
                SELECT c.*, u.username as author_name, u.display_name as author_display_name
                FROM content c
                LEFT JOIN users u ON c.author_id = u.id
                WHERE c.id = ?
            """, (content_id,)).fetchone()
            
            if content:
                content_dict = dict(content)
                # Parse JSON fields
                if content_dict.get('tags'):
                    content_dict['tags'] = json.loads(content_dict['tags'])
                if content_dict.get('metadata'):
                    content_dict['metadata'] = json.loads(content_dict['metadata'])
                return content_dict
            
            return None
    
    def list_content(self, content_type: str | None = None, status: str | None = None,
                    limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """List content with optional filters"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            
            query = """
                SELECT c.*, u.username as author_name, u.display_name as author_display_name
                FROM content c
                LEFT JOIN users u ON c.author_id = u.id
            """
            params = []
            conditions = []
            
            if content_type:
                conditions.append("c.type = ?")
                params.append(content_type)
            
            if status:
                conditions.append("c.status = ?")
                params.append(status)
            
            if conditions:
                query += " WHERE " + " AND ".join(conditions)
            
            query += " ORDER BY c.updated_at DESC LIMIT ? OFFSET ?"
            params.extend([limit, offset])
            
            contents = conn.execute(query, params).fetchall()
            
            result = []
            for content in contents:
                content_dict = dict(content)
                # Parse JSON fields
                if content_dict.get('tags'):
                    content_dict['tags'] = json.loads(content_dict['tags'])
                if content_dict.get('metadata'):
                    content_dict['metadata'] = json.loads(content_dict['metadata'])
                result.append(content_dict)
            
            return result
    
    def update_content(self, content_id: int, **kwargs) -> bool:
        """Update content"""
        with sqlite3.connect(self.db_path) as conn:
            # Build update query dynamically
            update_fields = []
            params = []
            
            allowed_fields = ['title', 'content', 'type', 'status', 'category', 'tags', 
                            'seo_title', 'seo_description', 'metadata']
            
            for field, value in kwargs.items():
                if field in allowed_fields:
                    if field in ['tags', 'metadata'] and value:
                        value = json.dumps(value)
                    update_fields.append(f"{field} = ?")
                    params.append(value)
            
            if not update_fields:
                return False
            
            update_fields.append("updated_at = CURRENT_TIMESTAMP")
            params.append(content_id)
            
            query = f"UPDATE content SET {', '.join(update_fields)} WHERE id = ?"
            cursor = conn.execute(query, params)
            conn.commit()
            
            if cursor.rowcount > 0:
                # Get content for audit log
                content = self.get_content_by_id(content_id)
                if content:
                    self.append_audit_event(
                        action="content.updated",
                        actor=f"user_{content.get('author_id')}",
                        summary=f"Content '{content.get('title')}' updated",
                        user_id=content.get('author_id')
                    )
                return True
            
            return False
    
    def delete_content(self, content_id: int) -> bool:
        """Delete content"""
        with sqlite3.connect(self.db_path) as conn:
            # Get content for audit log
            content = self.get_content_by_id(content_id)
            
            cursor = conn.execute("DELETE FROM content WHERE id = ?", (content_id,))
            conn.commit()
            
            if cursor.rowcount > 0 and content:
                self.append_audit_event(
                    action="content.deleted",
                    actor=f"user_{content.get('author_id')}",
                    summary=f"Content '{content.get('title')}' deleted",
                    user_id=content.get('author_id')
                )
                return True
            
            return False
    
    def create_media(self, filename: str, original_filename: str, media_type: str,
                    size: int, url: str, thumbnail_url: str | None = None,
                    uploaded_by: int | None = None, tags: List[str] | None = None,
                    metadata: Dict[str, Any] | None = None) -> Dict[str, Any]:
        """Create new media record"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute("""
                INSERT INTO media (filename, original_filename, type, size, url, 
                                 thumbnail_url, uploaded_by, tags, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (filename, original_filename, media_type, size, url, thumbnail_url,
                  uploaded_by, json.dumps(tags) if tags else None,
                  json.dumps(metadata) if metadata else None))
            
            media_id = cursor.lastrowid
            conn.commit()
            
            # Return created media
            media_data = self.get_media_by_id(media_id)
            if media_data:
                self.append_audit_event(
                    action="media.uploaded",
                    actor=f"user_{uploaded_by}",
                    summary=f"Media '{original_filename}' uploaded",
                    user_id=uploaded_by
                )
            
            return media_data or {}
    
    def get_media_by_id(self, media_id: int) -> Optional[Dict[str, Any]]:
        """Get media by ID"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            media = conn.execute("""
                SELECT m.*, u.username as uploaded_by_name, u.display_name as uploaded_by_display_name
                FROM media m
                LEFT JOIN users u ON m.uploaded_by = u.id
                WHERE m.id = ?
            """, (media_id,)).fetchone()
            
            if media:
                media_dict = dict(media)
                # Parse JSON fields
                if media_dict.get('tags'):
                    media_dict['tags'] = json.loads(media_dict['tags'])
                if media_dict.get('metadata'):
                    media_dict['metadata'] = json.loads(media_dict['metadata'])
                return media_dict
            
            return None
    
    def list_media(self, media_type: str | None = None, limit: int = 50, 
                  offset: int = 0) -> List[Dict[str, Any]]:
        """List media with optional filters"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            
            query = """
                SELECT m.*, u.username as uploaded_by_name, u.display_name as uploaded_by_display_name
                FROM media m
                LEFT JOIN users u ON m.uploaded_by = u.id
            """
            params = []
            
            if media_type:
                query += " WHERE m.type = ?"
                params.append(media_type)
            
            query += " ORDER BY m.uploaded_at DESC LIMIT ? OFFSET ?"
            params.extend([limit, offset])
            
            media_items = conn.execute(query, params).fetchall()
            
            result = []
            for media in media_items:
                media_dict = dict(media)
                # Parse JSON fields
                if media_dict.get('tags'):
                    media_dict['tags'] = json.loads(media_dict['tags'])
                if media_dict.get('metadata'):
                    media_dict['metadata'] = json.loads(media_dict['metadata'])
                result.append(media_dict)
            
            return result
    
    def delete_media(self, media_id: int) -> bool:
        """Delete media"""
        with sqlite3.connect(self.db_path) as conn:
            # Get media for audit log
            media = self.get_media_by_id(media_id)
            
            cursor = conn.execute("DELETE FROM media WHERE id = ?", (media_id,))
            conn.commit()
            
            if cursor.rowcount > 0 and media:
                self.append_audit_event(
                    action="media.deleted",
                    actor=f"user_{media.get('uploaded_by')}",
                    summary=f"Media '{media.get('original_filename')}' deleted",
                    user_id=media.get('uploaded_by')
                )
                return True
            
            return False
    
    def update_home_page_content(self, section: str, field: str, value: str, 
                                updated_by: int | None = None) -> bool:
        """Update home page content"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                INSERT OR REPLACE INTO home_page_content (section, field, value, updated_by, updated_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            """, (section, field, value, updated_by))
            conn.commit()
            
            if cursor.rowcount > 0:
                # Log the update
                self.append_audit_event(
                    action="home_page.updated",
                    actor=f"user_{updated_by}",
                    summary=f"Home page content updated: {section}.{field}",
                    user_id=updated_by
                )
                return True
            
            return False
    
    def get_home_page_content(self, section: str | None = None) -> Dict[str, Any]:
        """Get home page content, optionally filtered by section"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            
            query = "SELECT * FROM home_page_content"
            params = []
            
            if section:
                query += " WHERE section = ?"
                params.append(section)
            
            query += " ORDER BY section, field"
            
            rows = conn.execute(query, params).fetchall()
            
            # Organize results by section and field
            result = {}
            for row in rows:
                section_name = row['section']
                field_name = row['field']
                value = row['value']
                
                if section_name not in result:
                    result[section_name] = {}
                
                result[section_name][field_name] = value
            
            return result
    
    def get_home_page_field(self, section: str, field: str) -> Optional[str]:
        """Get a specific home page content field"""
        with sqlite3.connect(self.db_path) as conn:
            row = conn.execute("""
                SELECT value FROM home_page_content 
                WHERE section = ? AND field = ?
            """, (section, field)).fetchone()
            
            return row[0] if row else None
    
    def delete_home_page_content(self, section: str, field: str | None = None) -> bool:
        """Delete home page content, optionally by field"""
        with sqlite3.connect(self.db_path) as conn:
            if field:
                cursor = conn.execute("""
                    DELETE FROM home_page_content 
                    WHERE section = ? AND field = ?
                """, (section, field))
            else:
                cursor = conn.execute("""
                    DELETE FROM home_page_content 
                    WHERE section = ?
                """, (section,))
            
            conn.commit()
            return cursor.rowcount > 0
    
    def create_affiliation(self, name: str, role: str, short_description: str,
                          detailed_description: str, url: str, icon: str,
                          color: str, display_order: int = 0,
                          published: bool = True) -> Dict[str, Any]:
        """Create new professional affiliation"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute("""
                INSERT INTO professional_affiliations 
                (name, role, short_description, detailed_description, url, icon, color, display_order, published)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (name, role, short_description, detailed_description, url, icon, color, display_order, published))
            
            affiliation_id = cursor.lastrowid
            conn.commit()
            
            return self.get_affiliation_by_id(affiliation_id) or {}
    
    def get_affiliation_by_id(self, affiliation_id: int) -> Optional[Dict[str, Any]]:
        """Get affiliation by ID"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            affiliation = conn.execute(
                "SELECT * FROM professional_affiliations WHERE id = ?",
                (affiliation_id,)
            ).fetchone()
            
            return dict(affiliation) if affiliation else None
    
    def list_affiliations(self, published_only: bool = False) -> List[Dict[str, Any]]:
        """List all affiliations"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            
            query = "SELECT * FROM professional_affiliations"
            params = []
            
            if published_only:
                query += " WHERE published = 1"
            
            query += " ORDER BY display_order ASC"
            
            affiliations = conn.execute(query, params).fetchall()
            return [dict(aff) for aff in affiliations]
    
    def update_affiliation(self, affiliation_id: int, **kwargs) -> bool:
        """Update affiliation"""
        with sqlite3.connect(self.db_path) as conn:
            update_fields = []
            params = []
            
            allowed_fields = ['name', 'role', 'short_description', 'detailed_description',
                            'url', 'icon', 'color', 'display_order', 'published']
            
            for field, value in kwargs.items():
                if field in allowed_fields:
                    update_fields.append(f"{field} = ?")
                    params.append(value)
            
            if not update_fields:
                return False
            
            update_fields.append("updated_at = CURRENT_TIMESTAMP")
            params.append(affiliation_id)
            
            query = f"UPDATE professional_affiliations SET {', '.join(update_fields)} WHERE id = ?"
            cursor = conn.execute(query, params)
            conn.commit()
            
            return cursor.rowcount > 0
    
    def delete_affiliation(self, affiliation_id: int) -> bool:
        """Delete affiliation"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("DELETE FROM professional_affiliations WHERE id = ?", (affiliation_id,))
            conn.commit()
            return cursor.rowcount > 0

    # Research Interests CRUD
    def create_research_interest(self, title: str, description: str | None, icon: str, 
                                 color: str, display_order: int = 0, published: bool = True) -> Dict[str, Any]:
        """Create research interest"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                INSERT INTO research_interests (title, description, icon, color, display_order, published)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (title, description, icon, color, display_order, published))
            
            interest_id = cursor.lastrowid
            conn.commit()
            
            return self.get_research_interest_by_id(interest_id) or {}

    def get_research_interest_by_id(self, interest_id: int) -> Optional[Dict[str, Any]]:
        """Get research interest by ID"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            interest = conn.execute(
                "SELECT * FROM research_interests WHERE id = ?",
                (interest_id,)
            ).fetchone()
            
            return dict(interest) if interest else None

    def list_research_interests(self, published_only: bool = False) -> List[Dict[str, Any]]:
        """List all research interests"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            
            query = "SELECT * FROM research_interests"
            params = []
            
            if published_only:
                query += " WHERE published = 1"
            
            query += " ORDER BY display_order ASC"
            
            interests = conn.execute(query, params).fetchall()
            return [dict(interest) for interest in interests]

    def update_research_interest(self, interest_id: int, **kwargs) -> bool:
        """Update research interest"""
        with sqlite3.connect(self.db_path) as conn:
            update_fields = []
            params = []
            
            allowed_fields = ['title', 'description', 'icon', 'color', 'display_order', 'published']
            
            for field, value in kwargs.items():
                if field in allowed_fields:
                    update_fields.append(f"{field} = ?")
                    params.append(value)
            
            if not update_fields:
                return False
            
            update_fields.append("updated_at = CURRENT_TIMESTAMP")
            params.append(interest_id)
            
            query = f"UPDATE research_interests SET {', '.join(update_fields)} WHERE id = ?"
            cursor = conn.execute(query, params)
            conn.commit()
            
            return cursor.rowcount > 0

    def delete_research_interest(self, interest_id: int) -> bool:
        """Delete research interest"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("DELETE FROM research_interests WHERE id = ?", (interest_id,))
            conn.commit()
            return cursor.rowcount > 0

    # Awards CRUD
    def create_award(self, title: str, year: int, description: str | None, organization: str | None,
                     url: str | None, image_url: str | None, icon: str, color: str,
                     display_order: int = 0, published: bool = True) -> Dict[str, Any]:
        """Create award"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                INSERT INTO awards (title, year, description, organization, url, image_url, icon, color, display_order, published)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (title, year, description, organization, url, image_url, icon, color, display_order, published))
            
            award_id = cursor.lastrowid
            conn.commit()
            
            return self.get_award_by_id(award_id) or {}

    def get_award_by_id(self, award_id: int) -> Optional[Dict[str, Any]]:
        """Get award by ID"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            award = conn.execute(
                "SELECT * FROM awards WHERE id = ?",
                (award_id,)
            ).fetchone()
            
            return dict(award) if award else None

    def list_awards(self, published_only: bool = False) -> List[Dict[str, Any]]:
        """List all awards"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            
            query = "SELECT * FROM awards"
            params = []
            
            if published_only:
                query += " WHERE published = 1"
            
            query += " ORDER BY year DESC, display_order ASC"
            
            awards = conn.execute(query, params).fetchall()
            return [dict(award) for award in awards]

    def update_award(self, award_id: int, **kwargs) -> bool:
        """Update award"""
        with sqlite3.connect(self.db_path) as conn:
            update_fields = []
            params = []
            
            allowed_fields = ['title', 'year', 'description', 'organization', 'url', 'image_url', 
                            'icon', 'color', 'display_order', 'published']
            
            for field, value in kwargs.items():
                if field in allowed_fields:
                    update_fields.append(f"{field} = ?")
                    params.append(value)
            
            if not update_fields:
                return False
            
            update_fields.append("updated_at = CURRENT_TIMESTAMP")
            params.append(award_id)
            
            query = f"UPDATE awards SET {', '.join(update_fields)} WHERE id = ?"
            cursor = conn.execute(query, params)
            conn.commit()
            
            return cursor.rowcount > 0

    def delete_award(self, award_id: int) -> bool:
        """Delete award"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("DELETE FROM awards WHERE id = ?", (award_id,))
            conn.commit()
            return cursor.rowcount > 0

    # External Profiles CRUD
    def create_external_profile(self, label: str, description: str, url: str, platform: str,
                                icon: str, color: str, metrics: str | None = None,
                                display_order: int = 0, published: bool = True) -> Dict[str, Any]:
        """Create external profile"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                INSERT INTO external_profiles (label, description, url, platform, icon, color, metrics, display_order, published)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (label, description, url, platform, icon, color, metrics, display_order, published))
            
            profile_id = cursor.lastrowid
            conn.commit()
            
            return self.get_external_profile_by_id(profile_id) or {}

    def get_external_profile_by_id(self, profile_id: int) -> Optional[Dict[str, Any]]:
        """Get external profile by ID"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            profile = conn.execute(
                "SELECT * FROM external_profiles WHERE id = ?",
                (profile_id,)
            ).fetchone()
            
            return dict(profile) if profile else None

    def list_external_profiles(self, published_only: bool = False) -> List[Dict[str, Any]]:
        """List all external profiles"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            
            query = "SELECT * FROM external_profiles"
            params = []
            
            if published_only:
                query += " WHERE published = 1"
            
            query += " ORDER BY display_order ASC"
            
            profiles = conn.execute(query, params).fetchall()
            return [dict(profile) for profile in profiles]

    def update_external_profile(self, profile_id: int, **kwargs) -> bool:
        """Update external profile"""
        with sqlite3.connect(self.db_path) as conn:
            update_fields = []
            params = []
            
            allowed_fields = ['label', 'description', 'url', 'platform', 'icon', 'color', 
                            'metrics', 'display_order', 'published']
            
            for field, value in kwargs.items():
                if field in allowed_fields:
                    update_fields.append(f"{field} = ?")
                    params.append(value)
            
            if not update_fields:
                return False
            
            update_fields.append("updated_at = CURRENT_TIMESTAMP")
            params.append(profile_id)
            
            query = f"UPDATE external_profiles SET {', '.join(update_fields)} WHERE id = ?"
            cursor = conn.execute(query, params)
            conn.commit()
            
            return cursor.rowcount > 0

    def delete_external_profile(self, profile_id: int) -> bool:
        """Delete external profile"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("DELETE FROM external_profiles WHERE id = ?", (profile_id,))
            conn.commit()
            return cursor.rowcount > 0

    # Collaborators CRUD Methods
    def create_collaborator(self, name: str, title: str, role: str, testimonial: str,
                           display_order: int = 0, published: bool = True) -> Dict[str, Any]:
        """Create a new collaborator"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                INSERT INTO collaborators (name, title, role, testimonial, display_order, published)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (name, title, role, testimonial, display_order, 1 if published else 0))

            collaborator_id = cursor.lastrowid
            conn.commit()

            return self.get_collaborator_by_id(collaborator_id) or {}

    def get_collaborator_by_id(self, collaborator_id: int) -> Optional[Dict[str, Any]]:
        """Get collaborator by ID"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            collaborator = conn.execute(
                "SELECT * FROM collaborators WHERE id = ?",
                (collaborator_id,)
            ).fetchone()

            return dict(collaborator) if collaborator else None

    def list_collaborators(self, published_only: bool = False) -> List[Dict[str, Any]]:
        """List all collaborators"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row

            query = "SELECT * FROM collaborators"
            params = []

            if published_only:
                query += " WHERE published = 1"

            query += " ORDER BY display_order ASC"

            collaborators = conn.execute(query, params).fetchall()
            return [dict(collab) for collab in collaborators]

    def update_collaborator(self, collaborator_id: int, **kwargs) -> bool:
        """Update collaborator"""
        with sqlite3.connect(self.db_path) as conn:
            update_fields = []
            params = []

            allowed_fields = ['name', 'title', 'role', 'testimonial', 'display_order', 'published']

            for field, value in kwargs.items():
                if field in allowed_fields:
                    update_fields.append(f"{field} = ?")
                    params.append(value)

            if not update_fields:
                return False

            update_fields.append("updated_at = CURRENT_TIMESTAMP")
            params.append(collaborator_id)

            query = f"UPDATE collaborators SET {', '.join(update_fields)} WHERE id = ?"
            cursor = conn.execute(query, params)
            conn.commit()

            return cursor.rowcount > 0

    def delete_collaborator(self, collaborator_id: int) -> bool:
        """Delete collaborator"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("DELETE FROM collaborators WHERE id = ?", (collaborator_id,))
            conn.commit()
            return cursor.rowcount > 0

    # Hero Content CRUD Methods
    def get_hero_content(self) -> Optional[Dict[str, Any]]:
        """Get published hero content"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            hero = conn.execute(
                "SELECT * FROM hero_content WHERE published = 1 ORDER BY id DESC LIMIT 1"
            ).fetchone()
            return dict(hero) if hero else None

    def create_hero_content(self, eyebrow: str, headline: str, description: str = None,
                          badges: str = None, background_image_url: str = None,
                          cta_text: str = None, cta_url: str = None,
                          published: bool = True) -> Dict[str, Any]:
        """Create hero content"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                """INSERT INTO hero_content 
                   (eyebrow, headline, description, badges, background_image_url, cta_text, cta_url, published)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (eyebrow, headline, description, badges, background_image_url, cta_text, cta_url, 1 if published else 0)
            )
            conn.commit()
            hero_id = cursor.lastrowid
            return self.get_hero_content_by_id(hero_id)

    def get_hero_content_by_id(self, hero_id: int) -> Optional[Dict[str, Any]]:
        """Get hero content by ID"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            hero = conn.execute("SELECT * FROM hero_content WHERE id = ?", (hero_id,)).fetchone()
            return dict(hero) if hero else None

    def update_hero_content(self, hero_id: int, **kwargs) -> bool:
        """Update hero content"""
        with sqlite3.connect(self.db_path) as conn:
            update_fields = []
            params = []
            
            allowed_fields = ['eyebrow', 'headline', 'description', 'badges', 
                            'background_image_url', 'cta_text', 'cta_url', 'published']
            
            for field, value in kwargs.items():
                if field in allowed_fields:
                    update_fields.append(f"{field} = ?")
                    params.append(value)
            
            if not update_fields:
                return False
            
            update_fields.append("updated_at = CURRENT_TIMESTAMP")
            params.append(hero_id)
            
            query = f"UPDATE hero_content SET {', '.join(update_fields)} WHERE id = ?"
            cursor = conn.execute(query, params)
            conn.commit()
            
            return cursor.rowcount > 0

    def list_hero_content(self, published_only: bool = False) -> List[Dict[str, Any]]:
        """List all hero content"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            query = "SELECT * FROM hero_content"
            params = []
            
            if published_only:
                query += " WHERE published = 1"
            
            query += " ORDER BY id DESC"
            
            heroes = conn.execute(query, params).fetchall()
            return [dict(hero) for hero in heroes]

    def delete_hero_content(self, hero_id: int) -> bool:
        """Delete hero content"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("DELETE FROM hero_content WHERE id = ?", (hero_id,))
            conn.commit()
            return cursor.rowcount > 0

    # Statistics CRUD Methods
    def create_statistic(self, label: str, value: int, suffix: str = None,
                        icon: str = None, display_order: int = 0,
                        published: bool = True) -> Dict[str, Any]:
        """Create statistic"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                """INSERT INTO statistics (label, value, suffix, icon, display_order, published)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (label, value, suffix, icon, display_order, 1 if published else 0)
            )
            conn.commit()
            stat_id = cursor.lastrowid
            return self.get_statistic_by_id(stat_id)

    def get_statistic_by_id(self, stat_id: int) -> Optional[Dict[str, Any]]:
        """Get statistic by ID"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            stat = conn.execute("SELECT * FROM statistics WHERE id = ?", (stat_id,)).fetchone()
            return dict(stat) if stat else None

    def list_statistics(self, published_only: bool = False) -> List[Dict[str, Any]]:
        """List all statistics"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            query = "SELECT * FROM statistics"
            params = []
            
            if published_only:
                query += " WHERE published = 1"
            
            query += " ORDER BY display_order ASC"
            
            stats = conn.execute(query, params).fetchall()
            return [dict(stat) for stat in stats]

    def update_statistic(self, stat_id: int, **kwargs) -> bool:
        """Update statistic"""
        with sqlite3.connect(self.db_path) as conn:
            update_fields = []
            params = []
            
            allowed_fields = ['label', 'value', 'suffix', 'icon', 'display_order', 'published']
            
            for field, value in kwargs.items():
                if field in allowed_fields:
                    update_fields.append(f"{field} = ?")
                    params.append(value)
            
            if not update_fields:
                return False
            
            update_fields.append("updated_at = CURRENT_TIMESTAMP")
            params.append(stat_id)
            
            query = f"UPDATE statistics SET {', '.join(update_fields)} WHERE id = ?"
            cursor = conn.execute(query, params)
            conn.commit()
            
            return cursor.rowcount > 0

    def delete_statistic(self, stat_id: int) -> bool:
        """Delete statistic"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("DELETE FROM statistics WHERE id = ?", (stat_id,))
            conn.commit()
            return cursor.rowcount > 0

    # Services CRUD Methods
    def create_service(self, title: str, icon: str, description: str = None,
                      bullets: str = None, display_order: int = 0,
                      published: bool = True) -> Dict[str, Any]:
        """Create service"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                """INSERT INTO services (title, icon, description, bullets, display_order, published)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (title, icon, description, bullets, display_order, 1 if published else 0)
            )
            conn.commit()
            service_id = cursor.lastrowid
            return self.get_service_by_id(service_id)

    def get_service_by_id(self, service_id: int) -> Optional[Dict[str, Any]]:
        """Get service by ID"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            service = conn.execute("SELECT * FROM services WHERE id = ?", (service_id,)).fetchone()
            return dict(service) if service else None

    def list_services(self, published_only: bool = False) -> List[Dict[str, Any]]:
        """List all services"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            query = "SELECT * FROM services"
            params = []
            
            if published_only:
                query += " WHERE published = 1"
            
            query += " ORDER BY display_order ASC"
            
            services = conn.execute(query, params).fetchall()
            return [dict(service) for service in services]

    def update_service(self, service_id: int, **kwargs) -> bool:
        """Update service"""
        with sqlite3.connect(self.db_path) as conn:
            update_fields = []
            params = []
            
            allowed_fields = ['title', 'icon', 'description', 'bullets', 'display_order', 'published']
            
            for field, value in kwargs.items():
                if field in allowed_fields:
                    update_fields.append(f"{field} = ?")
                    params.append(value)
            
            if not update_fields:
                return False
            
            update_fields.append("updated_at = CURRENT_TIMESTAMP")
            params.append(service_id)
            
            query = f"UPDATE services SET {', '.join(update_fields)} WHERE id = ?"
            cursor = conn.execute(query, params)
            conn.commit()
            
            return cursor.rowcount > 0

    def delete_service(self, service_id: int) -> bool:
        """Delete service"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("DELETE FROM services WHERE id = ?", (service_id,))
            conn.commit()
            return cursor.rowcount > 0

    def update_user_phone_number(self, user_id: int, phone_number: str) -> bool:
        """Update user's phone number"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "UPDATE users SET phone_number = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (phone_number, user_id)
            )
            conn.commit()
            
            if cursor.rowcount > 0:
                user = self.get_user_by_id(user_id)
                if user:
                    self.append_audit_event(
                        action="user.phone_updated",
                        actor=user.get("username", "unknown"),
                        summary=f"Phone number updated for user {user.get('username')}",
                        user_id=user_id
                    )
                return True
            return False

    def update_user_email(self, user_id: int, email: str) -> bool:
        """Update user's email"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "UPDATE users SET email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (email, user_id)
            )
            conn.commit()
            
            if cursor.rowcount > 0:
                user = self.get_user_by_id(user_id)
                if user:
                    self.append_audit_event(
                        action="user.email_updated",
                        actor=user.get("username", "unknown"),
                        summary=f"Email updated for user {user.get('username')}",
                        user_id=user_id
                    )
                return True
            return False

    def update_user_display_name(self, user_id: int, display_name: str) -> bool:
        """Update user's display name"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "UPDATE users SET display_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (display_name, user_id)
            )
            conn.commit()
            
            if cursor.rowcount > 0:
                user = self.get_user_by_id(user_id)
                if user:
                    self.append_audit_event(
                        action="user.display_name_updated",
                        actor=user.get("username", "unknown"),
                        summary=f"Display name updated for user {user.get('username')}",
                        user_id=user_id
                    )
                return True
            return False

    def update_user_username(self, user_id: int, new_username: str) -> bool:
        """Update user's username"""
        with sqlite3.connect(self.db_path) as conn:
            # Check if new username already exists
            existing = conn.execute(
                "SELECT id FROM users WHERE username = ? AND id != ?",
                (new_username, user_id)
            ).fetchone()

            if existing:
                return False

            cursor = conn.execute(
                "UPDATE users SET username = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (new_username, user_id)
            )
            conn.commit()

            if cursor.rowcount > 0:
                user = self.get_user_by_id(user_id)
                if user:
                    self.append_audit_event(
                        action="user.username_updated",
                        actor=user.get("username", "unknown"),
                        summary=f"Username updated for user {user.get('username')}",
                        user_id=user_id
                    )
                return True
            return False

    def update_user_password(self, user_id: int, new_password: str) -> bool:
        """Update user's password"""
        from security import hash_password

        password_hash = hash_password(new_password)

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (password_hash, user_id)
            )
            conn.commit()

            if cursor.rowcount > 0:
                user = self.get_user_by_id(user_id)
                if user:
                    self.append_audit_event(
                        action="user.password_updated",
                        actor=user.get("username", "unknown"),
                        summary=f"Password updated for user {user.get('username')}",
                        user_id=user_id
                    )
                return True
            return False


# Global database instance
db = UserDatabase()
