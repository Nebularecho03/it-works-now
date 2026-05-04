# PM2 Multithreading Setup

This setup implements dynamic multithreading for Website and Scholar Forge applications using PM2 cluster mode with automatic scaling based on system resources.

## System Requirements Detected
- **CPU Cores**: 8
- **Total RAM**: 15GB
- **Free RAM**: 1GB
- **Website Frontend Instances**: 3 (40% of cores)
- **Scholar Forge Frontend Instances**: 1 (20% of cores)
- **Scholars API Instances**: 1 (20% of cores)
- **Python Backend Workers**: 4 (50% of cores)
- **Memory per Instance**: 1024MB

## Configuration Files
- `ecosystem.config.js` - Production configuration with full dynamic scaling
- `ecosystem.config.dev.js` - Development configuration (single instances)
- `ecosystem.config.staging.js` - Staging configuration (moderate scaling)
- `scripts/detect-resources.js` - Dynamic resource detection script

## Usage

### Start Services
```bash
# Production (default)
./start-pm2.sh

# Development
./start-pm2.sh dev

# Staging
./start-pm2.sh staging
```

### Stop Services
```bash
./stop-pm2.sh
```

### Restart Services (Zero-downtime)
```bash
./restart-pm2.sh
```

### Monitor Services
```bash
./monitor-pm2.sh
```

### PM2 Commands
```bash
pm2 status              # View status
pm2 logs                # View logs
pm2 monit               # Interactive monitoring
pm2 restart all         # Restart all
pm2 stop all            # Stop all
pm2 delete all          # Delete all
pm2 save                # Save configuration
```

## Machine Configuration Examples

### Low-Spec Machine (2 cores, 4GB RAM)
- Website Frontend: 1 instance
- Scholar Forge Frontend: 1 instance
- Scholars API: 1 instance
- Python Backend: 2 workers
- Memory per instance: ~500MB

### Medium-Spec Machine (4 cores, 8GB RAM)
- Website Frontend: 2 instances
- Scholar Forge Frontend: 1 instance
- Scholars API: 1 instance
- Python Backend: 2 workers
- Memory per instance: ~1GB

### High-Spec Machine (8 cores, 16GB RAM) - Current System
- Website Frontend: 3 instances
- Scholar Forge Frontend: 1 instance
- Scholars API: 1 instance
- Python Backend: 4 workers
- Memory per instance: ~1GB

### Enterprise Machine (16+ cores, 32GB+ RAM)
- Website Frontend: 6-8 instances
- Scholar Forge Frontend: 3-4 instances
- Scholars API: 3-4 instances
- Python Backend: 8 workers
- Memory per instance: ~2GB

## Benefits
- **Dynamic Load Distribution**: Automatically utilizes all available CPU cores
- **High Availability**: Cluster mode provides redundancy
- **Auto-recovery**: PM2 auto-restarts failed processes
- **Zero-downtime**: Graceful reloads without service interruption
- **Portability**: Works on any machine without manual configuration
- **Resource Optimization**: Memory limits calculated based on available RAM

## Logs
All logs are stored in the `logs/` directory:
- `website-frontend-error.log`
- `website-frontend-out.log`
- `scholar-forge-error.log`
- `scholar-forge-out.log`
- `scholars-api-error.log`
- `scholars-api-out.log`
- `website-backend-error.log`
- `website-backend-out.log`

## Troubleshooting
If services fail to start:
1. Check logs: `pm2 logs`
2. Verify ports are available: `ss -tuln`
3. Check system resources: `node scripts/detect-resources.js`
4. Stop existing processes: `./stop-pm2.sh`
5. Try starting again: `./start-pm2.sh`
