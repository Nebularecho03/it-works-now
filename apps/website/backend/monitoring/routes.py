"""
Monitoring API Routes
Flask routes for server metrics endpoints.
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
from typing import Dict, Any
from .database import MetricsDatabase


def create_monitoring_routes():
    """Create and return monitoring Blueprint."""
    monitoring_bp = Blueprint('monitoring', __name__, url_prefix='/api/admin/metrics')
    db = MetricsDatabase()
    
    def is_admin_authenticated():
        """Check if admin is authenticated (simplified for now)."""
        # TODO: Integrate with existing authentication system
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            # Verify token with existing auth system
            return True  # Placeholder - implement proper auth
        return False
    
    @monitoring_bp.route('', methods=['GET'])
    def get_metrics():
        """Get metrics with optional time range filter."""
        try:
            # Check authentication
            if not is_admin_authenticated():
                return jsonify({"error": "Unauthorized"}), 401
            
            # Get query parameters
            time_range = request.args.get('range', 'hour')
            live = request.args.get('live', 'false').lower() == 'true'
            
            # Validate time range
            valid_ranges = ['60m', 'hour', 'day', 'week', 'month']
            if time_range not in valid_ranges:
                return jsonify({"error": f"Invalid range. Valid options: {valid_ranges}"}), 400
            
            # Get current metrics
            current = db.get_current_metrics()
            
            # Get historical data
            history = db.get_metrics_by_range(time_range)
            
            # Get summary statistics
            summary = db.get_metrics_summary(time_range)
            
            # Get peak usage
            peaks = db.get_peak_usage(time_range)
            
            response = {
                "success": True,
                "data": {
                    "current": current,
                    "history": history,
                    "summary": summary,
                    "peaks": peaks,
                    "metadata": {
                        "time_range": time_range,
                        "live": live,
                        "data_points": len(history),
                        "generated_at": datetime.utcnow().isoformat()
                    }
                }
            }
            
            return jsonify(response)
            
        except Exception as e:
            return jsonify({"error": f"Internal server error: {str(e)}"}), 500
    
    @monitoring_bp.route('/current', methods=['GET'])
    def get_current_metrics():
        """Get only the most recent metrics."""
        try:
            if not is_admin_authenticated():
                return jsonify({"error": "Unauthorized"}), 401
            
            current = db.get_current_metrics()
            
            if not current:
                return jsonify({"error": "No metrics data available"}), 404
            
            return jsonify({
                "success": True,
                "data": current
            })
            
        except Exception as e:
            return jsonify({"error": f"Internal server error: {str(e)}"}), 500
    
    @monitoring_bp.route('/summary', methods=['GET'])
    def get_metrics_summary():
        """Get summary statistics."""
        try:
            if not is_admin_authenticated():
                return jsonify({"error": "Unauthorized"}), 401
            
            time_range = request.args.get('range', 'hour')
            valid_ranges = ['60m', 'hour', 'day', 'week', 'month']
            
            if time_range not in valid_ranges:
                return jsonify({"error": f"Invalid range. Valid options: {valid_ranges}"}), 400
            
            summary = db.get_metrics_summary(time_range)
            
            return jsonify({
                "success": True,
                "data": summary
            })
            
        except Exception as e:
            return jsonify({"error": f"Internal server error: {str(e)}"}), 500
    
    @monitoring_bp.route('/peaks', methods=['GET'])
    def get_peak_usage():
        """Get peak usage information."""
        try:
            if not is_admin_authenticated():
                return jsonify({"error": "Unauthorized"}), 401
            
            time_range = request.args.get('range', 'hour')
            valid_ranges = ['60m', 'hour', 'day', 'week', 'month']
            
            if time_range not in valid_ranges:
                return jsonify({"error": f"Invalid range. Valid options: {valid_ranges}"}), 400
            
            peaks = db.get_peak_usage(time_range)
            
            return jsonify({
                "success": True,
                "data": peaks
            })
            
        except Exception as e:
            return jsonify({"error": f"Internal server error: {str(e)}"}), 500
    
    @monitoring_bp.route('/stats', methods=['GET'])
    def get_database_stats():
        """Get database statistics."""
        try:
            if not is_admin_authenticated():
                return jsonify({"error": "Unauthorized"}), 401
            
            stats = db.get_database_stats()
            
            return jsonify({
                "success": True,
                "data": stats
            })
            
        except Exception as e:
            return jsonify({"error": f"Internal server error: {str(e)}"}), 500
    
    @monitoring_bp.route('/collect', methods=['POST'])
    def collect_metrics():
        """Endpoint for monitoring agent to submit metrics."""
        try:
            # This endpoint should be secured with API key or similar
            # For now, we'll use a simple check
            api_key = request.headers.get('X-API-Key')
            if api_key != 'your-secret-api-key':  # TODO: Use proper API key management
                return jsonify({"error": "Unauthorized"}), 401
            
            data = request.get_json()
            if not data:
                return jsonify({"error": "No data provided"}), 400
            
            # Validate required fields
            required_fields = ['cpu_usage', 'ram_usage', 'disk_usage', 'disk_free', 
                             'network_sent', 'network_received', 'uptime_seconds']
            
            for field in required_fields:
                if field not in data:
                    return jsonify({"error": f"Missing required field: {field}"}), 400
            
            # Store metrics in database
            # This would typically use the same database operations as the monitoring agent
            # For now, we'll just acknowledge receipt
            
            return jsonify({
                "success": True,
                "message": "Metrics received successfully"
            })
            
        except Exception as e:
            return jsonify({"error": f"Internal server error: {str(e)}"}), 500
    
    @monitoring_bp.route('/retention/settings', methods=['GET', 'POST'])
    def manage_retention_settings():
        """Get or update retention settings."""
        try:
            if not is_admin_authenticated():
                return jsonify({"error": "Unauthorized"}), 401
            
            from monitoring.database import MetricsDatabase
            db = MetricsDatabase()
            
            if request.method == 'GET':
                # Get current settings
                settings = db.get_retention_settings()
                return jsonify({
                    "success": True,
                    "data": settings
                })
            
            elif request.method == 'POST':
                # Update settings
                new_settings = request.get_json()
                if not new_settings:
                    return jsonify({"error": "No settings provided"}), 400
            
            # Validate required fields
                required_fields = ['raw_retention_days', 'hourly_retention_days', 
                                 'daily_retention_days', 'cleanup_time', 'enabled']
                for field in required_fields:
                    if field not in new_settings:
                        return jsonify({"error": f"Missing required field: {field}"}), 400
                
                # Update settings
                success = db.update_retention_settings(new_settings)
            
            if success:
                    return jsonify({
                        "success": True,
                        "message": "Retention settings updated successfully"
                    })
                else:
                    return jsonify({
                        "error": "Failed to update retention settings"
                    }), 500
                
        except Exception as e:
            return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@monitoring_bp.route('/retention/cleanup', methods=['POST'])
def trigger_cleanup():
    """Trigger manual cleanup operation."""
    try:
        if not is_admin_authenticated():
            return jsonify({"error": "Unauthorized"}), 401
        
        data = request.get_json()
        dry_run = data.get('dry_run', False) if data else False
        
        from data_retention.cleanup import DataCleanup
        cleanup = DataCleanup()
        
        results = cleanup.run_full_cleanup(dry_run=dry_run)
        
        return jsonify({
            "success": True,
            "data": {
                "dry_run": dry_run,
                "results": results
            }
        })
        
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@monitoring_bp.route('/retention/status', methods=['GET'])
def get_retention_status():
    """Get retention system status."""
    try:
        if not is_admin_authenticated():
            return jsonify({"error": "Unauthorized"}), 401
        
        from monitoring.database import MetricsDatabase
        db = MetricsDatabase()
        
        # Get storage overview
        storage_overview = db.get_storage_overview()
        
        # Get cleanup history
        cleanup_history = db.get_cleanup_history(limit=10)
        
        # Get retention settings
        settings = db.get_retention_settings()
        
        return jsonify({
            "success": True,
            "data": {
                "storage": storage_overview,
                "cleanup_history": cleanup_history,
                "settings": settings
            }
        })
        
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@monitoring_bp.route('/retention/logs', methods=['GET'])
def get_cleanup_logs():
    """Get cleanup operation logs."""
    try:
        if not is_admin_authenticated():
            return jsonify({"error": "Unauthorized"}), 401
        
        from monitoring.database import MetricsDatabase
        db = MetricsDatabase()
        
        # Get query parameters
        limit = request.args.get('limit', 50, type=int)
        
        # Get cleanup history
        logs = db.get_cleanup_history(limit=limit)
        
        return jsonify({
            "success": True,
            "data": logs
        })
        
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@monitoring_bp.route('/storage/overview', methods=['GET'])
def get_storage_overview():
    """Get storage overview and statistics."""
    try:
        if not is_admin_authenticated():
            return jsonify({"error": "Unauthorized"}), 401
        
        from monitoring.database import MetricsDatabase
        db = MetricsDatabase()
        
        overview = db.get_storage_overview()
        
        return jsonify({
            "success": True,
            "data": overview
        })
        
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@monitoring_bp.route('/storage/trends', methods=['GET'])
def get_storage_trends():
    """Get storage usage trends."""
    try:
        if not is_admin_authenticated():
            return jsonify({"error": "Unauthorized"}), 401
        
        from monitoring.database import MetricsDatabase
        db = MetricsDatabase()
        
        overview = db.get_storage_overview()
        growth_data = overview.get('growth_trend', [])
        
        return jsonify({
            "success": True,
            "data": {
                "growth_trend": growth_data,
                "database_size": overview.get('database_size_mb', 0)
            }
        })
        
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

return monitoring_bp
