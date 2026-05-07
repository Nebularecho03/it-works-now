"""
Retention Settings Management
Handles configuration of data retention policies.
"""

import sqlite3
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional
import config


logger = logging.getLogger(__name__)


class RetentionSettings:
    """Manages retention settings for server metrics."""
    
    def __init__(self, db_path: Path | None = None):
        self.db_path = db_path or config.DATA_DIR / "users.db"
    
    def get_settings(self) -> Dict:
        """Get current retention settings."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.execute("""
                    SELECT raw_retention_days, hourly_retention_days, 
                           daily_retention_days, cleanup_time, enabled
                    FROM retention_settings 
                    ORDER BY id DESC 
                    LIMIT 1
                """)
                settings = cursor.fetchone()
                
                if settings:
                    return {
                        'raw_retention_days': settings['raw_retention_days'],
                        'hourly_retention_days': settings['hourly_retention_days'],
                        'daily_retention_days': settings['daily_retention_days'],
                        'cleanup_time': settings['cleanup_time'],
                        'enabled': bool(settings['enabled'])
                    }
                else:
                    # Return defaults if no settings found
                    return self.get_default_settings()
                    
        except Exception as e:
            logger.error(f"Error getting retention settings: {e}")
            return self.get_default_settings()
    
    def get_default_settings(self) -> Dict:
        """Get default retention settings."""
        return {
            'raw_retention_days': 7,
            'hourly_retention_days': 30,
            'daily_retention_days': 365,
            'cleanup_time': '02:00',
            'enabled': True
        }
    
    def update_settings(self, settings: Dict) -> bool:
        """
        Update retention settings.
        
        Args:
            settings: Dictionary of retention settings to update
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Validate settings
            if not self._validate_settings(settings):
                return False
            
            with sqlite3.connect(self.db_path) as conn:
                # Update existing settings or insert new ones
                cursor = conn.execute("""
                    SELECT COUNT(*) as count FROM retention_settings
                """)
                
                if cursor.fetchone()['count'] > 0:
                    # Update existing settings
                    conn.execute("""
                        UPDATE retention_settings 
                        SET raw_retention_days = ?, hourly_retention_days = ?,
                            daily_retention_days = ?, cleanup_time = ?,
                            enabled = ?, updated_at = CURRENT_TIMESTAMP
                        WHERE id = (SELECT MAX(id) FROM retention_settings)
                    """, (
                        settings.get('raw_retention_days', 7),
                        settings.get('hourly_retention_days', 30),
                        settings.get('daily_retention_days', 365),
                        settings.get('cleanup_time', '02:00'),
                        settings.get('enabled', True)
                    ))
                else:
                    # Insert new settings
                    conn.execute("""
                        INSERT INTO retention_settings (
                            raw_retention_days, hourly_retention_days, daily_retention_days,
                            cleanup_time, enabled
                        ) VALUES (?, ?, ?, ?, ?)
                    """, (
                        settings.get('raw_retention_days', 7),
                        settings.get('hourly_retention_days', 30),
                        settings.get('daily_retention_days', 365),
                        settings.get('cleanup_time', '02:00'),
                        settings.get('enabled', True)
                    ))
                
                conn.commit()
                logger.info("Retention settings updated successfully")
                return True
                
        except Exception as e:
            logger.error(f"Error updating retention settings: {e}")
            return False
    
    def _validate_settings(self, settings: Dict) -> bool:
        """Validate retention settings."""
        try:
            # Validate numeric values
            raw_days = int(settings.get('raw_retention_days', 7))
            hourly_days = int(settings.get('hourly_retention_days', 30))
            daily_days = int(settings.get('daily_retention_days', 365))
            
            # Apply minimum safety constraints
            if raw_days < 1:
                logger.error("Raw retention days must be at least 1")
                return False
            
            if hourly_days < 1:
                logger.error("Hourly retention days must be at least 1")
                return False
            
            if daily_days < 30:
                logger.error("Daily retention days must be at least 30")
                return False
            
            # Validate cleanup time format (HH:MM)
            cleanup_time = settings.get('cleanup_time', '02:00')
            if not self._validate_time_format(cleanup_time):
                logger.error(f"Invalid cleanup time format: {cleanup_time}")
                return False
            
            return True
            
        except (ValueError, TypeError) as e:
            logger.error(f"Invalid retention settings format: {e}")
            return False
    
    def _validate_time_format(self, time_str: str) -> bool:
        """Validate time format HH:MM."""
        try:
            parts = time_str.split(':')
            if len(parts) != 2:
                return False
            
            hour = int(parts[0])
            minute = int(parts[1])
            
            return 0 <= hour <= 23 and 0 <= minute <= 59
            
        except (ValueError, IndexError):
            return False
    
    def get_retention_cutoffs(self) -> Dict[str, datetime]:
        """Get cutoff dates for each retention tier."""
        settings = self.get_settings()
        now = datetime.now()
        
        return {
            'raw': now - timedelta(days=settings['raw_retention_days']),
            'hourly': now - timedelta(days=settings['hourly_retention_days']),
            'daily': now - timedelta(days=settings['daily_retention_days'])
        }
    
    def is_cleanup_enabled(self) -> bool:
        """Check if cleanup is enabled."""
        settings = self.get_settings()
        return settings.get('enabled', True)
    
    def get_next_cleanup_time(self) -> Optional[datetime]:
        """Get next scheduled cleanup time."""
        settings = self.get_settings()
        if not settings.get('enabled', True):
            return None
        
        try:
            cleanup_time = settings.get('cleanup_time', '02:00')
            hour, minute = map(int, cleanup_time.split(':'))
            
            now = datetime.now()
            next_cleanup = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
            
            # If cleanup time has passed today, schedule for tomorrow
            if next_cleanup <= now:
                next_cleanup += timedelta(days=1)
            
            return next_cleanup
            
        except (ValueError, TypeError):
            logger.error(f"Invalid cleanup time format: {settings.get('cleanup_time')}")
            return None
