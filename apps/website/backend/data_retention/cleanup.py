"""
Data Cleanup System
Handles safe deletion of old monitoring data with comprehensive logging.
"""

import sqlite3
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import config


logger = logging.getLogger(__name__)


class DataCleanup:
    """Handles safe cleanup of old server metrics data."""
    
    def __init__(self, db_path: Path | None = None):
        self.db_path = db_path or config.DATA_DIR / "users.db"
    
    def get_retention_settings(self) -> Dict:
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
                return dict(settings) if settings else {
                    'raw_retention_days': 7,
                    'hourly_retention_days': 30,
                    'daily_retention_days': 365,
                    'cleanup_time': '02:00',
                    'enabled': True
                }
        except Exception as e:
            logger.error(f"Error getting retention settings: {e}")
            return {}
    
    def log_cleanup_operation(self, action_type: str, records_deleted: int, 
                          execution_time_ms: int, status: str, notes: str = ""):
        """Log cleanup operation to database."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT INTO cleanup_log (
                        action_type, records_deleted, execution_time_ms,
                        status, notes
                    ) VALUES (?, ?, ?, ?, ?)
                """, (action_type, records_deleted, execution_time_ms, status, notes))
                conn.commit()
        except Exception as e:
            logger.error(f"Error logging cleanup operation: {e}")
    
    def cleanup_raw_data(self, dry_run: bool = False) -> Tuple[int, str]:
        """
        Clean up old raw metrics data safely.
        
        Args:
            dry_run: If True, only simulate cleanup without deleting
            
        Returns:
            Tuple of (records_deleted, status_message)
        """
        start_time = datetime.now()
        
        try:
            settings = self.get_retention_settings()
            if not settings.get('enabled', True):
                return 0, "Cleanup disabled in settings"
            
            retention_days = settings.get('raw_retention_days', 7)
            
            # Safety: Never delete data newer than 24 hours
            safe_cutoff = max(retention_days, 1)
            cutoff_date = datetime.now() - timedelta(days=safe_cutoff)
            cutoff_str = cutoff_date.strftime('%Y-%m-%d %H:%M:%S')
            
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("PRAGMA journal_mode=WAL")
                
                # Count records to be deleted
                cursor = conn.execute("""
                    SELECT COUNT(*) as count 
                    FROM server_metrics 
                    WHERE recorded_at < ?
                """, (cutoff_str,))
                records_to_delete = cursor.fetchone()['count']
                
                if records_to_delete == 0:
                    execution_time = (datetime.now() - start_time).total_seconds() * 1000
                    self.log_cleanup_operation(
                        'raw_cleanup', 0, int(execution_time_ms), 
                        'success', 'No records to delete'
                    )
                    return 0, "No records to delete"
                
                if dry_run:
                    logger.info(f"DRY RUN: Would delete {records_to_delete} raw records older than {cutoff_str}")
                    return records_to_delete, f"Dry run: {records_to_delete} records would be deleted"
                
                # Perform actual deletion in transaction
                try:
                    cursor = conn.execute("""
                        DELETE FROM server_metrics 
                        WHERE recorded_at < ?
                    """, (cutoff_str,))
                    
                    records_deleted = cursor.rowcount
                    conn.commit()
                    
                    execution_time = (datetime.now() - start_time).total_seconds() * 1000
                    
                    # Log successful cleanup
                    self.log_cleanup_operation(
                        'raw_cleanup', records_deleted, int(execution_time),
                        'success', f'Deleted records older than {cutoff_str}'
                    )
                    
                    logger.info(f"Raw data cleanup completed: {records_deleted} records deleted in {execution_time:.2f}ms")
                    return records_deleted, "success"
                    
                except Exception as e:
                    conn.rollback()
                    execution_time = (datetime.now() - start_time).total_seconds() * 1000
                    
                    # Log failed cleanup
                    self.log_cleanup_operation(
                        'raw_cleanup', 0, int(execution_time),
                        'failed', f'Error: {str(e)}'
                    )
                    
                    error_msg = f"Raw cleanup failed: {str(e)}"
                    logger.error(error_msg)
                    return 0, error_msg
                    
        except Exception as e:
            error_msg = f"Raw cleanup error: {str(e)}"
            logger.error(error_msg)
            return 0, error_msg
    
    def cleanup_hourly_data(self, dry_run: bool = False) -> Tuple[int, str]:
        """
        Clean up old hourly aggregated data.
        
        Returns:
            Tuple of (records_deleted, status_message)
        """
        start_time = datetime.now()
        
        try:
            settings = self.get_retention_settings()
            if not settings.get('enabled', True):
                return 0, "Cleanup disabled in settings"
            
            retention_days = settings.get('hourly_retention_days', 30)
            cutoff_date = datetime.now() - timedelta(days=retention_days)
            cutoff_str = cutoff_date.strftime('%Y-%m-%d %H:%M:%S')
            
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("PRAGMA journal_mode=WAL")
                
                # Count records to be deleted
                cursor = conn.execute("""
                    SELECT COUNT(*) as count 
                    FROM server_metrics_hourly 
                    WHERE hour_timestamp < ?
                """, (cutoff_str,))
                records_to_delete = cursor.fetchone()['count']
                
                if records_to_delete == 0:
                    execution_time = (datetime.now() - start_time).total_seconds() * 1000
                    self.log_cleanup_operation(
                        'hourly_cleanup', 0, int(execution_time_ms),
                        'success', 'No records to delete'
                    )
                    return 0, "No records to delete"
                
                if dry_run:
                    logger.info(f"DRY RUN: Would delete {records_to_delete} hourly records older than {cutoff_str}")
                    return records_to_delete, f"Dry run: {records_to_delete} records would be deleted"
                
                # Perform actual deletion
                try:
                    cursor = conn.execute("""
                        DELETE FROM server_metrics_hourly 
                        WHERE hour_timestamp < ?
                    """, (cutoff_str,))
                    
                    records_deleted = cursor.rowcount
                    conn.commit()
                    
                    execution_time = (datetime.now() - start_time).total_seconds() * 1000
                    
                    # Log successful cleanup
                    self.log_cleanup_operation(
                        'hourly_cleanup', records_deleted, int(execution_time),
                        'success', f'Deleted hourly records older than {cutoff_str}'
                    )
                    
                    logger.info(f"Hourly data cleanup completed: {records_deleted} records deleted in {execution_time:.2f}ms")
                    return records_deleted, "success"
                    
                except Exception as e:
                    conn.rollback()
                    execution_time = (datetime.now() - start_time).total_seconds() * 1000
                    
                    # Log failed cleanup
                    self.log_cleanup_operation(
                        'hourly_cleanup', 0, int(execution_time),
                        'failed', f'Error: {str(e)}'
                    )
                    
                    error_msg = f"Hourly cleanup failed: {str(e)}"
                    logger.error(error_msg)
                    return 0, error_msg
                    
        except Exception as e:
            error_msg = f"Hourly cleanup error: {str(e)}"
            logger.error(error_msg)
            return 0, error_msg
    
    def get_cleanup_history(self, limit: int = 50) -> List[Dict]:
        """Get history of cleanup operations."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.execute("""
                    SELECT action_type, records_deleted, execution_time_ms,
                           executed_at, status, notes
                    FROM cleanup_log 
                    ORDER BY executed_at DESC 
                    LIMIT ?
                """, (limit,))
                return [dict(row) for row in cursor.fetchall()]
        except Exception as e:
            logger.error(f"Error getting cleanup history: {e}")
            return []
    
    def get_storage_stats(self) -> Dict:
        """Get storage statistics and database size."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                
                # Get table sizes
                cursor = conn.execute("""
                    SELECT 
                        'server_metrics' as table_name,
                        COUNT(*) as record_count,
                        MIN(recorded_at) as earliest,
                        MAX(recorded_at) as latest
                    FROM server_metrics
                    UNION ALL
                    SELECT 
                        'server_metrics_hourly' as table_name,
                        COUNT(*) as record_count,
                        MIN(hour_timestamp) as earliest,
                        MAX(hour_timestamp) as latest
                    FROM server_metrics_hourly
                    UNION ALL
                    SELECT 
                        'server_metrics_daily' as table_name,
                        COUNT(*) as record_count,
                        MIN(day_timestamp) as earliest,
                        MAX(day_timestamp) as latest
                    FROM server_metrics_daily
                """)
                table_stats = [dict(row) for row in cursor.fetchall()]
                
                # Get database file size
                cursor = conn.execute("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()")
                db_size_info = cursor.fetchone()
                db_size_bytes = db_size_info['size'] if db_size_info else 0
                
                return {
                    'database_size_bytes': db_size_bytes,
                    'database_size_mb': round(db_size_bytes / (1024 * 1024), 2),
                    'tables': table_stats
                }
                
        except Exception as e:
            logger.error(f"Error getting storage stats: {e}")
            return {}
    
    def run_full_cleanup(self, dry_run: bool = False) -> Dict[str, Tuple[int, str]]:
        """
        Run complete cleanup process for all data tiers.
        
        Returns:
            Dict with cleanup results for each data type
        """
        logger.info(f"Starting full cleanup (dry_run={dry_run})")
        
        results = {}
        
        # Clean raw data
        raw_deleted, raw_status = self.cleanup_raw_data(dry_run)
        results['raw'] = (raw_deleted, raw_status)
        
        # Clean hourly data
        hourly_deleted, hourly_status = self.cleanup_hourly_data(dry_run)
        results['hourly'] = (hourly_deleted, hourly_status)
        
        # Note: Daily data is kept long-term, no cleanup needed
        
        total_deleted = raw_deleted + hourly_deleted
        logger.info(f"Full cleanup completed: {total_deleted} total records deleted")
        
        return results
