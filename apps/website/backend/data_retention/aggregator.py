"""
Data Aggregation Engine
Handles automated aggregation of server metrics from raw to hourly to daily summaries.
"""

import sqlite3
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import config


logger = logging.getLogger(__name__)


class DataAggregator:
    """Handles data aggregation for server metrics."""
    
    def __init__(self, db_path: Path | None = None):
        self.db_path = db_path or config.DATA_DIR / "users.db"
    
    def aggregate_hourly_data(self, cutoff_date: Optional[datetime] = None) -> Tuple[int, str]:
        """
        Aggregate raw metrics into hourly summaries.
        
        Returns:
            Tuple of (records_processed, status_message)
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("PRAGMA journal_mode=WAL")
                
                # Use cutoff date or default to 1 day ago
                if cutoff_date is None:
                    cutoff_date = datetime.now() - timedelta(days=1)
                cutoff_str = cutoff_date.strftime('%Y-%m-%d %H:%M:%S')
                
                # Get existing hourly timestamps to avoid duplicates
                existing_hours = set()
                cursor = conn.execute("""
                    SELECT DISTINCT hour_timestamp 
                    FROM server_metrics_hourly 
                    WHERE hour_timestamp >= ?
                """, (cutoff_str,))
                existing_hours.update(row[0] for row in cursor.fetchall())
                
                # Aggregate hourly data
                cursor.execute("""
                    INSERT OR IGNORE INTO server_metrics_hourly (
                        hour_timestamp,
                        avg_cpu_usage, max_cpu_usage, min_cpu_usage,
                        avg_ram_usage, max_ram_usage, min_ram_usage,
                        avg_disk_usage,
                        total_network_sent, total_network_received,
                        data_points
                    )
                    SELECT 
                        datetime(recorded_at, 'start of hour') as hour_timestamp,
                        AVG(cpu_usage) as avg_cpu_usage,
                        MAX(cpu_usage) as max_cpu_usage,
                        MIN(cpu_usage) as min_cpu_usage,
                        AVG(ram_usage) as avg_ram_usage,
                        MAX(ram_usage) as max_ram_usage,
                        MIN(ram_usage) as min_ram_usage,
                        AVG(disk_usage) as avg_disk_usage,
                        SUM(network_sent) as total_network_sent,
                        SUM(network_received) as total_network_received,
                        COUNT(*) as data_points
                    FROM server_metrics 
                    WHERE recorded_at < ? 
                    GROUP BY hour_timestamp
                """, (cutoff_str,))
                
                records_processed = cursor.rowcount
                conn.commit()
                
                logger.info(f"Hourly aggregation completed: {records_processed} records processed")
                return records_processed, "success"
                
        except Exception as e:
            error_msg = f"Hourly aggregation failed: {str(e)}"
            logger.error(error_msg)
            return 0, error_msg
    
    def aggregate_daily_data(self, cutoff_date: Optional[datetime] = None) -> Tuple[int, str]:
        """
        Aggregate hourly metrics into daily summaries.
        
        Returns:
            Tuple of (records_processed, status_message)
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("PRAGMA journal_mode=WAL")
                
                # Use cutoff date or default to 30 days ago
                if cutoff_date is None:
                    cutoff_date = datetime.now() - timedelta(days=30)
                cutoff_str = cutoff_date.strftime('%Y-%m-%d %H:%M:%S')
                
                # Get existing daily dates to avoid duplicates
                existing_days = set()
                cursor = conn.execute("""
                    SELECT DISTINCT day_timestamp 
                    FROM server_metrics_daily 
                    WHERE day_timestamp >= ?
                """, (cutoff_str,))
                existing_days.update(row[0] for row in cursor.fetchall())
                
                # Aggregate daily data
                cursor.execute("""
                    INSERT OR IGNORE INTO server_metrics_daily (
                        day_timestamp,
                        avg_cpu_usage, max_cpu_usage, min_cpu_usage,
                        avg_ram_usage, max_ram_usage, min_ram_usage,
                        avg_disk_usage,
                        total_records
                    )
                    SELECT 
                        DATE(hour_timestamp) as day_timestamp,
                        AVG(avg_cpu_usage) as avg_cpu_usage,
                        MAX(max_cpu_usage) as max_cpu_usage,
                        MIN(min_cpu_usage) as min_cpu_usage,
                        AVG(avg_ram_usage) as avg_ram_usage,
                        MAX(max_ram_usage) as max_ram_usage,
                        MIN(min_ram_usage) as min_ram_usage,
                        AVG(avg_disk_usage) as avg_disk_usage,
                        SUM(data_points) as total_records
                    FROM server_metrics_hourly
                    WHERE hour_timestamp < ?
                    GROUP BY day_timestamp
                """, (cutoff_str,))
                
                records_processed = cursor.rowcount
                conn.commit()
                
                logger.info(f"Daily aggregation completed: {records_processed} records processed")
                return records_processed, "success"
                
        except Exception as e:
            error_msg = f"Daily aggregation failed: {str(e)}"
            logger.error(error_msg)
            return 0, error_msg
    
    def get_aggregation_status(self) -> Dict:
        """Get status of aggregation operations."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                
                # Get latest aggregation dates
                cursor = conn.execute("""
                    SELECT 
                        MAX(hour_timestamp) as latest_hourly,
                        COUNT(*) as hourly_count
                    FROM server_metrics_hourly
                """)
                hourly_stats = cursor.fetchone()
                
                cursor = conn.execute("""
                    SELECT 
                        MAX(day_timestamp) as latest_daily,
                        COUNT(*) as daily_count
                    FROM server_metrics_daily
                """)
                daily_stats = cursor.fetchone()
                
                # Get raw data range
                cursor = conn.execute("""
                    SELECT 
                        MIN(recorded_at) as earliest_raw,
                        MAX(recorded_at) as latest_raw,
                        COUNT(*) as raw_count
                    FROM server_metrics
                """)
                raw_stats = cursor.fetchone()
                
                return {
                    'raw_data': {
                        'earliest': raw_stats['earliest_raw'],
                        'latest': raw_stats['latest_raw'],
                        'count': raw_stats['raw_count']
                    },
                    'hourly_data': {
                        'latest': hourly_stats['latest_hourly'],
                        'count': hourly_stats['hourly_count']
                    },
                    'daily_data': {
                        'latest': daily_stats['latest_daily'],
                        'count': daily_stats['daily_count']
                    }
                }
                
        except Exception as e:
            logger.error(f"Error getting aggregation status: {e}")
            return {}
    
    def validate_aggregation_integrity(self) -> List[str]:
        """Validate integrity of aggregated data."""
        issues = []
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                
                # Check for gaps in hourly data
                cursor = conn.execute("""
                    SELECT hour_timestamp 
                    FROM server_metrics_hourly 
                    WHERE hour_timestamp >= datetime('now', '-7 days')
                    ORDER BY hour_timestamp
                """)
                hourly_dates = [row['hour_timestamp'] for row in cursor.fetchall()]
                
                # Check for missing hours (simple check)
                if len(hourly_dates) > 1:
                    for i in range(1, len(hourly_dates)):
                        prev = datetime.fromisoformat(hourly_dates[i-1])
                        curr = datetime.fromisoformat(hourly_dates[i])
                        if (curr - prev) > timedelta(hours=2):  # Allow some gap
                            issues.append(f"Gap in hourly data between {prev} and {curr}")
                
                # Check for data consistency
                cursor = conn.execute("""
                    SELECT 
                        COUNT(*) as total,
                        SUM(CASE WHEN avg_cpu_usage < 0 OR avg_cpu_usage > 100 THEN 1 ELSE 0 END) as invalid_cpu,
                        SUM(CASE WHEN avg_ram_usage < 0 OR avg_ram_usage > 100 THEN 1 ELSE 0 END) as invalid_ram
                    FROM server_metrics_hourly
                    WHERE hour_timestamp >= datetime('now', '-7 days')
                """)
                validation = cursor.fetchone()
                
                if validation['invalid_cpu'] > 0:
                    issues.append(f"Found {validation['invalid_cpu']} invalid CPU values")
                if validation['invalid_ram'] > 0:
                    issues.append(f"Found {validation['invalid_ram']} invalid RAM values")
                
        except Exception as e:
            issues.append(f"Validation error: {str(e)}")
        
        return issues
