"""
Monitoring Database Operations
Handles all database operations for server metrics.
"""

import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Dict, List, Optional, Any
import config


class MetricsDatabase:
    """Database operations for server metrics."""
    
    def __init__(self, db_path: Path | None = None):
        self.db_path = db_path or config.DATA_DIR / "users.db"
    
    def get_current_metrics(self) -> Optional[Dict[str, Any]]:
        """Get the most recent metrics."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.execute("""
                    SELECT * FROM server_metrics 
                    ORDER BY recorded_at DESC 
                    LIMIT 1
                """)
                row = cursor.fetchone()
                if row:
                    return dict(row)
                return None
        except Exception as e:
            print(f"Error getting current metrics: {e}")
            return None
    
    def get_metrics_by_range(self, time_range: str, limit: int = 1000) -> List[Dict[str, Any]]:
        """Get metrics based on time range."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                
                if time_range == "60m":
                    # Last 60 minutes of raw data
                    cursor = conn.execute("""
                        SELECT * FROM server_metrics 
                        WHERE recorded_at >= datetime('now', '-60 minutes')
                        ORDER BY recorded_at ASC
                        LIMIT ?
                    """, (limit,))
                elif time_range == "hour":
                    # Last 24 hours, sample every 5 minutes
                    cursor = conn.execute("""
                        SELECT * FROM server_metrics 
                        WHERE recorded_at >= datetime('now', '-24 hours')
                        ORDER BY recorded_at ASC
                        LIMIT ?
                    """, (limit,))
                elif time_range == "day":
                    # Last 30 days, hourly averages
                    cursor = conn.execute("""
                        SELECT 
                            datetime(recorded_at, 'start of hour') as hour_timestamp,
                            AVG(cpu_usage) as cpu_usage,
                            AVG(ram_usage) as ram_usage,
                            AVG(disk_usage) as disk_usage,
                            AVG(disk_free) as disk_free,
                            AVG(network_sent) as network_sent,
                            AVG(network_received) as network_received,
                            AVG(uptime_seconds) as uptime_seconds,
                            COUNT(*) as data_points
                        FROM server_metrics 
                        WHERE recorded_at >= datetime('now', '-30 days')
                        GROUP BY datetime(recorded_at, 'start of hour')
                        ORDER BY hour_timestamp ASC
                        LIMIT ?
                    """, (limit,))
                elif time_range == "week":
                    # Last 12 weeks, daily averages
                    cursor = conn.execute("""
                        SELECT 
                            DATE(recorded_at) as day_timestamp,
                            AVG(cpu_usage) as cpu_usage,
                            AVG(ram_usage) as ram_usage,
                            AVG(disk_usage) as disk_usage,
                            AVG(disk_free) as disk_free,
                            AVG(network_sent) as network_sent,
                            AVG(network_received) as network_received,
                            AVG(uptime_seconds) as uptime_seconds,
                            COUNT(*) as data_points
                        FROM server_metrics 
                        WHERE recorded_at >= datetime('now', '-84 days')
                        GROUP BY DATE(recorded_at)
                        ORDER BY day_timestamp ASC
                        LIMIT ?
                    """, (limit,))
                elif time_range == "month":
                    # Last 12 months, weekly averages
                    cursor = conn.execute("""
                        SELECT 
                            DATE(recorded_at, 'weekday 0', '-6 days') as week_timestamp,
                            AVG(cpu_usage) as cpu_usage,
                            AVG(ram_usage) as ram_usage,
                            AVG(disk_usage) as disk_usage,
                            AVG(disk_free) as disk_free,
                            AVG(network_sent) as network_sent,
                            AVG(network_received) as network_received,
                            AVG(uptime_seconds) as uptime_seconds,
                            COUNT(*) as data_points
                        FROM server_metrics 
                        WHERE recorded_at >= datetime('now', '-365 days')
                        GROUP BY DATE(recorded_at, 'weekday 0', '-6 days')
                        ORDER BY week_timestamp ASC
                        LIMIT ?
                    """, (limit,))
                else:
                    # Default to last hour
                    cursor = conn.execute("""
                        SELECT * FROM server_metrics 
                        WHERE recorded_at >= datetime('now', '-1 hour')
                        ORDER BY recorded_at ASC
                        LIMIT ?
                    """, (limit,))
                
                return [dict(row) for row in cursor.fetchall()]
                
        except Exception as e:
            print(f"Error getting metrics by range: {e}")
            return []
    
    def get_metrics_summary(self, time_range: str = "hour") -> Dict[str, Any]:
        """Get summary statistics for the given time range."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                
                time_filter = self._get_time_filter(time_range)
                
                cursor = conn.execute(f"""
                    SELECT 
                        AVG(cpu_usage) as avg_cpu,
                        MAX(cpu_usage) as max_cpu,
                        MIN(cpu_usage) as min_cpu,
                        AVG(ram_usage) as avg_ram,
                        MAX(ram_usage) as max_ram,
                        MIN(ram_usage) as min_ram,
                        AVG(disk_usage) as avg_disk,
                        MAX(disk_usage) as max_disk,
                        MIN(disk_usage) as min_disk,
                        AVG(network_sent) as avg_network_sent,
                        AVG(network_received) as avg_network_received,
                        COUNT(*) as data_points
                    FROM server_metrics 
                    WHERE recorded_at >= {time_filter}
                """)
                
                row = cursor.fetchone()
                if row:
                    summary = dict(row)
                    # Convert None values to 0
                    for key, value in summary.items():
                        if value is None:
                            summary[key] = 0
                    return summary
                
                return {}
                
        except Exception as e:
            print(f"Error getting metrics summary: {e}")
            return {}
    
    def get_peak_usage(self, time_range: str = "hour") -> Dict[str, Any]:
        """Get peak usage information."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                
                time_filter = self._get_time_filter(time_range)
                
                # Peak CPU
                cursor = conn.execute(f"""
                    SELECT cpu_usage, recorded_at 
                    FROM server_metrics 
                    WHERE recorded_at >= {time_filter}
                    ORDER BY cpu_usage DESC 
                    LIMIT 1
                """)
                peak_cpu = dict(cursor.fetchone()) if cursor.fetchone() else None
                
                # Peak RAM
                cursor = conn.execute(f"""
                    SELECT ram_usage, recorded_at 
                    FROM server_metrics 
                    WHERE recorded_at >= {time_filter}
                    ORDER BY ram_usage DESC 
                    LIMIT 1
                """)
                peak_ram = dict(cursor.fetchone()) if cursor.fetchone() else None
                
                # Peak Disk
                cursor = conn.execute(f"""
                    SELECT disk_usage, recorded_at 
                    FROM server_metrics 
                    WHERE recorded_at >= {time_filter}
                    ORDER BY disk_usage DESC 
                    LIMIT 1
                """)
                peak_disk = dict(cursor.fetchone()) if cursor.fetchone() else None
                
                return {
                    "cpu": peak_cpu,
                    "ram": peak_ram,
                    "disk": peak_disk
                }
                
        except Exception as e:
            print(f"Error getting peak usage: {e}")
            return {"cpu": None, "ram": None, "disk": None}
    
    def _get_time_filter(self, time_range: str) -> str:
        """Get SQL time filter for the given range."""
        filters = {
            "60m": "datetime('now', '-60 minutes')",
            "hour": "datetime('now', '-1 hour')",
            "day": "datetime('now', '-24 hours')",
            "week": "datetime('now', '-7 days')",
            "month": "datetime('now', '-30 days')"
        }
        return filters.get(time_range, "datetime('now', '-1 hour')")
    
    def get_database_stats(self) -> Dict[str, Any]:
        """Get database statistics."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute("""
                    SELECT 
                        COUNT(*) as total_records,
                        MIN(recorded_at) as oldest_record,
                        MAX(recorded_at) as newest_record
                    FROM server_metrics
                """)
                stats = dict(cursor.fetchone())
                
                # Get database size
                cursor = conn.execute("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()")
                db_size = dict(cursor.fetchone())['size']
                stats['database_size_bytes'] = db_size
                stats['database_size_mb'] = round(db_size / (1024 * 1024), 2)
                
                return stats
                
        except Exception as e:
            print(f"Error getting database stats: {e}")
            return {}
    
    def get_retention_settings(self) -> Dict[str, Any]:
        """Get retention settings from database."""
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
            print(f"Error getting retention settings: {e}")
            return {}
    
    def update_retention_settings(self, settings: Dict[str, Any]) -> bool:
        """Update retention settings in database."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                # Check if settings exist
                cursor = conn.execute("SELECT COUNT(*) as count FROM retention_settings")
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
                return True
        except Exception as e:
            print(f"Error updating retention settings: {e}")
            return False
    
    def get_cleanup_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get cleanup operation history."""
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
            print(f"Error getting cleanup history: {e}")
            return []
    
    def get_storage_overview(self) -> Dict[str, Any]:
        """Get comprehensive storage overview."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                
                # Get table statistics
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
                
                # Calculate growth trends
                cursor = conn.execute("""
                    SELECT 
                        DATE(recorded_at) as date,
                        COUNT(*) as daily_count
                    FROM server_metrics 
                    WHERE recorded_at >= datetime('now', '-30 days')
                    GROUP BY DATE(recorded_at)
                    ORDER BY date DESC
                    LIMIT 30
                """)
                growth_data = [dict(row) for row in cursor.fetchall()]
                
                return {
                    'database_size_bytes': db_size_bytes,
                    'database_size_mb': round(db_size_bytes / (1024 * 1024), 2),
                    'tables': table_stats,
                    'growth_trend': growth_data,
                    'total_records': sum(stat['record_count'] for stat in table_stats)
                }
                
        except Exception as e:
            print(f"Error getting storage overview: {e}")
            return {}
