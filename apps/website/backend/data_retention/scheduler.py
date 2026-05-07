"""
Background Scheduler Service
Handles scheduled aggregation and cleanup operations.
"""

import time
import logging
import schedule
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Optional
import config

from .aggregator import DataAggregator
from .cleanup import DataCleanup
from .settings import RetentionSettings


logger = logging.getLogger(__name__)


class DataRetentionScheduler:
    """Manages scheduled data retention operations."""
    
    def __init__(self, db_path: Path | None = None):
        self.db_path = db_path or config.DATA_DIR / "users.db"
        self.aggregator = DataAggregator(self.db_path)
        self.cleanup = DataCleanup(self.db_path)
        self.settings = RetentionSettings(self.db_path)
        self.running = False
    
    def setup_schedule(self):
        """Setup the automated schedule."""
        settings = self.settings.get_settings()
        cleanup_time = settings.get('cleanup_time', '02:00')
        
        try:
            hour, minute = map(int, cleanup_time.split(':'))
            
            # Schedule daily aggregation and cleanup
            schedule.every().day.at(f"{hour:02d}:{minute:02d}").do(
                self.run_daily_maintenance
            )
            
            # Schedule hourly aggregation (every 2 hours)
            schedule.every(2).hours.do(self.run_hourly_aggregation)
            
            logger.info(f"Scheduler configured - Daily cleanup at {cleanup_time}, hourly aggregation every 2 hours")
            
        except (ValueError, TypeError) as e:
            logger.error(f"Invalid cleanup time format {cleanup_time}: {e}")
            # Use default time
            schedule.every().day.at("02:00").do(self.run_daily_maintenance)
            schedule.every(2).hours.do(self.run_hourly_aggregation)
    
    def run_hourly_aggregation(self):
        """Run hourly data aggregation."""
        try:
            logger.info("Starting scheduled hourly aggregation")
            
            # Aggregate raw data to hourly
            records_processed, status = self.aggregator.aggregate_hourly_data()
            
            if status == "success":
                logger.info(f"Hourly aggregation completed: {records_processed} records processed")
            else:
                logger.error(f"Hourly aggregation failed: {status}")
                
        except Exception as e:
            logger.error(f"Error in scheduled hourly aggregation: {e}")
    
    def run_daily_maintenance(self):
        """Run daily maintenance tasks."""
        try:
            logger.info("Starting scheduled daily maintenance")
            
            # Check if cleanup is enabled
            if not self.settings.is_cleanup_enabled():
                logger.info("Cleanup is disabled, skipping daily maintenance")
                return
            
            # Step 1: Aggregate hourly data to daily
            daily_records, daily_status = self.aggregator.aggregate_daily_data()
            logger.info(f"Daily aggregation: {daily_records} records, status: {daily_status}")
            
            # Step 2: Aggregate any remaining raw data to hourly
            hourly_records, hourly_status = self.aggregator.aggregate_hourly_data()
            logger.info(f"Hourly aggregation: {hourly_records} records, status: {hourly_status}")
            
            # Step 3: Run cleanup operations
            cleanup_results = self.cleanup.run_full_cleanup()
            
            # Log results
            for data_type, (records_deleted, status) in cleanup_results.items():
                if records_deleted > 0:
                    logger.info(f"Cleanup {data_type}: {records_deleted} records deleted, status: {status}")
            
            logger.info("Daily maintenance completed successfully")
            
        except Exception as e:
            logger.error(f"Error in daily maintenance: {e}")
    
    def run_immediate_cleanup(self, dry_run: bool = False) -> Dict[str, str]:
        """Run immediate cleanup operation."""
        logger.info(f"Running immediate cleanup (dry_run={dry_run})")
        
        results = {}
        
        # Aggregate first
        logger.info("Running pre-cleanup aggregation...")
        self.aggregator.aggregate_hourly_data()
        self.aggregator.aggregate_daily_data()
        
        # Then cleanup
        raw_deleted, raw_status = self.cleanup.cleanup_raw_data(dry_run)
        results['raw'] = f"{raw_deleted} records - {raw_status}"
        
        hourly_deleted, hourly_status = self.cleanup.cleanup_hourly_data(dry_run)
        results['hourly'] = f"{hourly_deleted} records - {hourly_status}"
        
        total_deleted = raw_deleted + hourly_deleted
        results['total'] = f"{total_deleted} records deleted"
        
        logger.info(f"Immediate cleanup completed: {results}")
        return results
    
    def get_system_status(self) -> Dict:
        """Get comprehensive system status."""
        try:
            # Aggregation status
            agg_status = self.aggregator.get_aggregation_status()
            
            # Cleanup status
            cleanup_history = self.cleanup.get_cleanup_history(limit=10)
            storage_stats = self.cleanup.get_storage_stats()
            
            # Settings
            retention_settings = self.settings.get_settings()
            next_cleanup = self.settings.get_next_cleanup_time()
            
            return {
                'scheduler_running': self.running,
                'aggregation': agg_status,
                'cleanup': {
                    'history': cleanup_history[:5],  # Last 5 operations
                    'storage_stats': storage_stats
                },
                'settings': retention_settings,
                'next_cleanup': next_cleanup.isoformat() if next_cleanup else None,
                'validation_issues': self.aggregator.validate_aggregation_integrity()
            }
            
        except Exception as e:
            logger.error(f"Error getting system status: {e}")
            return {'error': str(e)}
    
    def start(self):
        """Start the scheduler service."""
        if self.running:
            logger.warning("Scheduler is already running")
            return
        
        logger.info("Starting data retention scheduler")
        self.running = True
        self.setup_schedule()
        
        # Run initial setup
        logger.info("Running initial system checks...")
        self.run_hourly_aggregation()
        
        # Main scheduler loop
        try:
            while self.running:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
                
        except KeyboardInterrupt:
            logger.info("Received shutdown signal")
        finally:
            self.running = False
            logger.info("Data retention scheduler stopped")
    
    def stop(self):
        """Stop the scheduler service."""
        logger.info("Stopping data retention scheduler")
        self.running = False
    
    def run_once(self):
        """Run all maintenance tasks once and exit."""
        logger.info("Running one-time maintenance")
        
        # Run aggregation
        self.run_hourly_aggregation()
        self.run_daily_maintenance()
        
        # Get final status
        status = self.get_system_status()
        logger.info(f"Final system status: {status}")


def main():
    """Main entry point for the scheduler service."""
    import sys
    import os
    
    # Setup logging
    log_level = os.environ.get('RETENTION_LOG_LEVEL', 'INFO')
    logging.basicConfig(
        level=getattr(logging, log_level),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('/var/log/retention-scheduler.log'),
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    # Create scheduler instance
    scheduler = DataRetentionScheduler()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "run-once":
            scheduler.run_once()
        elif command == "cleanup-now":
            results = scheduler.run_immediate_cleanup()
            for operation, result in results.items():
                print(f"{operation}: {result}")
        elif command == "status":
            status = scheduler.get_system_status()
            print(f"System Status: {status}")
        else:
            print(f"Unknown command: {command}")
            print("Available commands: run-once, cleanup-now, status")
    else:
        # Start normal scheduler mode
        scheduler.start()


if __name__ == "__main__":
    main()
