#!/usr/bin/env python3
"""
Server Monitoring Agent
Collects system metrics and stores them in the database.
Runs as a background service with configurable collection intervals.
"""

import time
import logging
import sqlite3
import psutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional
import json
import os
import sys

# Configuration
CONFIG = {
    'collection_interval': 10,  # seconds
    'batch_size': 10,           # readings per batch
    'retry_attempts': 3,        # database retry attempts
    'retry_delay': 5,          # seconds between retries
    'log_level': 'INFO',
    'db_path': None,           # will be set from config
}

# Setup logging
logging.basicConfig(
    level=getattr(logging, CONFIG['log_level']),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/server-monitor.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class MetricsCollector:
    """Collects system metrics using psutil."""
    
    def __init__(self):
        self.boot_time = psutil.boot_time()
        
    def get_cpu_usage(self) -> float:
        """Get CPU usage percentage."""
        try:
            return psutil.cpu_percent(interval=1)
        except Exception as e:
            logger.error(f"Error getting CPU usage: {e}")
            return 0.0
    
    def get_ram_usage(self) -> float:
        """Get RAM usage percentage."""
        try:
            memory = psutil.virtual_memory()
            return memory.percent
        except Exception as e:
            logger.error(f"Error getting RAM usage: {e}")
            return 0.0
    
    def get_disk_usage(self) -> tuple[float, float]:
        """Get disk usage percentage and free space in GB."""
        try:
            disk = psutil.disk_usage('/')
            usage_percent = (disk.used / disk.total) * 100
            free_gb = disk.free / (1024**3)
            return usage_percent, free_gb
        except Exception as e:
            logger.error(f"Error getting disk usage: {e}")
            return 0.0, 0.0
    
    def get_network_stats(self) -> tuple[float, float]:
        """Get network sent and received bytes."""
        try:
            net_io = psutil.net_io_counters()
            return net_io.bytes_sent / (1024**2), net_io.bytes_recv / (1024**2)  # Convert to MB
        except Exception as e:
            logger.error(f"Error getting network stats: {e}")
            return 0.0, 0.0
    
    def get_uptime_seconds(self) -> int:
        """Get system uptime in seconds."""
        try:
            return int(time.time() - self.boot_time)
        except Exception as e:
            logger.error(f"Error getting uptime: {e}")
            return 0
    
    def collect_metrics(self) -> Dict[str, float]:
        """Collect all system metrics."""
        cpu_usage = self.get_cpu_usage()
        ram_usage = self.get_ram_usage()
        disk_usage, disk_free = self.get_disk_usage()
        network_sent, network_received = self.get_network_stats()
        uptime_seconds = self.get_uptime_seconds()
        
        return {
            'cpu_usage': cpu_usage,
            'ram_usage': ram_usage,
            'disk_usage': disk_usage,
            'disk_free': disk_free,
            'network_sent': network_sent,
            'network_received': network_received,
            'uptime_seconds': uptime_seconds
        }

class MetricsDatabase:
    """Handles database operations for metrics storage."""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self._ensure_database_exists()
    
    def _ensure_database_exists(self):
        """Ensure the database and tables exist."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                # Check if server_metrics table exists
                cursor = conn.execute("""
                    SELECT name FROM sqlite_master 
                    WHERE type='table' AND name='server_metrics'
                """)
                if not cursor.fetchone():
                    logger.error("server_metrics table not found. Please run the main application first.")
                    sys.exit(1)
        except Exception as e:
            logger.error(f"Database connection error: {e}")
            sys.exit(1)
    
    def insert_metrics_batch(self, metrics_list: List[Dict]) -> bool:
        """Insert a batch of metrics into the database."""
        if not metrics_list:
            return True
        
        for attempt in range(CONFIG['retry_attempts']):
            try:
                with sqlite3.connect(self.db_path) as conn:
                    conn.execute("PRAGMA journal_mode=WAL")  # Better concurrency
                    
                    for metrics in metrics_list:
                        conn.execute("""
                            INSERT INTO server_metrics (
                                cpu_usage, ram_usage, disk_usage, disk_free,
                                network_sent, network_received, uptime_seconds, recorded_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            metrics['cpu_usage'],
                            metrics['ram_usage'],
                            metrics['disk_usage'],
                            metrics['disk_free'],
                            metrics['network_sent'],
                            metrics['network_received'],
                            metrics['uptime_seconds'],
                            metrics['timestamp']
                        ))
                    
                    conn.commit()
                    logger.debug(f"Inserted {len(metrics_list)} metrics records")
                    return True
                    
            except Exception as e:
                logger.error(f"Database error (attempt {attempt + 1}): {e}")
                if attempt < CONFIG['retry_attempts'] - 1:
                    time.sleep(CONFIG['retry_delay'])
                else:
                    logger.error("Failed to insert metrics after all retry attempts")
                    return False
        
        return False
    
    def cleanup_old_metrics(self, days_to_keep: int = 30):
        """Remove metrics older than specified days."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute("""
                    DELETE FROM server_metrics 
                    WHERE recorded_at < datetime('now', '-{} days')
                """.format(days_to_keep))
                deleted_count = cursor.rowcount
                conn.commit()
                if deleted_count > 0:
                    logger.info(f"Cleaned up {deleted_count} old metric records")
        except Exception as e:
            logger.error(f"Error cleaning up old metrics: {e}")

class ServerMonitor:
    """Main server monitoring service."""
    
    def __init__(self, db_path: str):
        self.collector = MetricsCollector()
        self.database = MetricsDatabase(db_path)
        self.metrics_batch = []
        self.last_cleanup = time.time()
        
    def collect_and_store(self):
        """Collect metrics and add to batch."""
        try:
            metrics = self.collector.collect_metrics()
            metrics['timestamp'] = datetime.now(timezone.utc).isoformat()
            
            self.metrics_batch.append(metrics)
            
            if len(self.metrics_batch) >= CONFIG['batch_size']:
                success = self.database.insert_metrics_batch(self.metrics_batch)
                if success:
                    self.metrics_batch.clear()
                else:
                    logger.error("Failed to insert metrics batch")
                    
        except Exception as e:
            logger.error(f"Error in collect_and_store: {e}")
    
    def run_cleanup(self):
        """Run periodic cleanup of old metrics."""
        current_time = time.time()
        # Run cleanup every 24 hours
        if current_time - self.last_cleanup > 86400:
            self.database.cleanup_old_metrics()
            self.last_cleanup = current_time
    
    def run(self):
        """Main monitoring loop."""
        logger.info("Starting server monitoring service")
        logger.info(f"Collection interval: {CONFIG['collection_interval']} seconds")
        logger.info(f"Batch size: {CONFIG['batch_size']}")
        
        try:
            while True:
                self.collect_and_store()
                self.run_cleanup()
                time.sleep(CONFIG['collection_interval'])
                
        except KeyboardInterrupt:
            logger.info("Received shutdown signal")
            # Insert any remaining metrics
            if self.metrics_batch:
                self.database.insert_metrics_batch(self.metrics_batch)
            logger.info("Server monitoring service stopped")
        except Exception as e:
            logger.error(f"Fatal error in monitoring loop: {e}")
            sys.exit(1)

def load_config():
    """Load configuration from environment variables."""
    config_path = os.environ.get('MONITORING_CONFIG_PATH')
    if config_path and Path(config_path).exists():
        try:
            with open(config_path, 'r') as f:
                env_config = json.load(f)
                CONFIG.update(env_config)
        except Exception as e:
            logger.warning(f"Error loading config file: {e}")
    
    # Override with environment variables
    if os.environ.get('MONITORING_INTERVAL'):
        CONFIG['collection_interval'] = int(os.environ.get('MONITORING_INTERVAL'))
    if os.environ.get('MONITORING_BATCH_SIZE'):
        CONFIG['batch_size'] = int(os.environ.get('MONITORING_BATCH_SIZE'))
    if os.environ.get('MONITORING_LOG_LEVEL'):
        CONFIG['log_level'] = os.environ.get('MONITORING_LOG_LEVEL')

def main():
    """Main entry point."""
    load_config()
    
    # Set database path
    if not CONFIG['db_path']:
        # Use the same database as the main application
        repo_root = Path(__file__).resolve().parents[1]
        data_dir = repo_root / "backend" / "data"
        CONFIG['db_path'] = str(data_dir / "users.db")
    
    # Update logging level
    logging.getLogger().setLevel(getattr(logging, CONFIG['log_level']))
    
    logger.info("Server Monitor Agent starting...")
    logger.info(f"Database path: {CONFIG['db_path']}")
    
    # Check if psutil is available
    try:
        import psutil
        logger.info(f"psutil version: {psutil.__version__}")
    except ImportError:
        logger.error("psutil is not installed. Please install it with: pip install psutil")
        sys.exit(1)
    
    monitor = ServerMonitor(CONFIG['db_path'])
    monitor.run()

if __name__ == "__main__":
    main()
