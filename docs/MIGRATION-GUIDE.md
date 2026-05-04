# Migration Guide: PM2 Multithreading Integration

This guide explains how to migrate from nohup/systemd/Docker to PM2 multithreading mode for improved performance and resource utilization.

## Overview

PM2 provides:
- **Dynamic multithreading**: Automatic scaling based on CPU cores and RAM
- **CPU affinity pinning**: Optimized distribution across cores
- **Zero-downtime reloads**: Graceful updates without service interruption
- **Auto-recovery**: Automatic restart on failure
- **Monitoring**: Built-in metrics and logging

## Migration Options

### Option 1: Migrate from Nohup to PM2

**Current Setup:**
```bash
./start-local.sh
```

**New Setup:**
```bash
USE_PM2=true ./start-local.sh
```

**Benefits:**
- Automatic multithreading across all CPU cores
- Better resource utilization
- Zero-downtime updates

**Rollback:**
```bash
./stop-local.sh
./start-local.sh  # (without USE_PM2=true)
```

### Option 2: Migrate from Systemd to PM2

**Current Setup:**
```bash
sudo systemctl start website-frontend website-backend scholars
```

**New Setup:**
```bash
cd /home/codecrafter/Documents/combined
./start-pm2.sh
```

**Benefits:**
- Dynamic scaling based on system resources
- Easier management with PM2 commands
- Better monitoring capabilities

**Rollback:**
```bash
./stop-pm2.sh
sudo systemctl start website-frontend website-backend scholars
```

### Option 3: Migrate from Docker to PM2

**Current Setup:**
```bash
cd /home/codecrafter/Documents/combined/website
docker compose up -d
```

**New Setup:**
```bash
cd /home/codecrafter/Documents/combined
./start-pm2.sh
```

**Benefits:**
- Lower resource overhead
- Faster startup times
- Better CPU utilization

**Rollback:**
```bash
./stop-pm2.sh
cd /home/codecrafter/Documents/combined/website
docker compose up -d
```

## Deployment Script Migration

### Update deploy-both-projects.sh

**Current:**
```bash
./deploy-both-projects.sh
```

**New (PM2 mode):**
```bash
DEPLOYMENT_MODE=pm2 ./deploy-both-projects.sh
```

**New (Docker mode):**
```bash
DEPLOYMENT_MODE=docker ./deploy-both-projects.sh
```

**Default (systemd mode):**
```bash
./deploy-both-projects.sh
```

## Auto-Update Migration

The auto-update script now automatically detects PM2 and uses zero-downtime reloads:

```bash
# If PM2 is running, it will use: pm2 reload all
# If Docker is running, it will use: docker compose down && docker compose up -d --build
# If systemd is running, it will use: systemctl restart
```

No manual configuration needed.

## Environment Variables

### NEXT_PUBLIC_SCHOLARS_URL

Set this in your `.env` file for the Scholar Forge link:

```bash
NEXT_PUBLIC_SCHOLARS_URL=https://your-scholarforge-tunnel.trycloudflare.com
```

For local development:
```bash
NEXT_PUBLIC_SCHOLARS_URL=http://localhost:4500
```

## PM2 Management Commands

### Basic Commands
```bash
pm2 status              # View status
pm2 logs                # View logs
pm2 monit               # Interactive monitoring
pm2 restart all         # Restart all
pm2 stop all            # Stop all
pm2 delete all          # Delete all
pm2 save                # Save configuration
```

### Zero-Downtime Updates
```bash
pm2 reload all          # Reload without downtime
pm2 reload <app-name>   # Reload specific app
```

### Resource Monitoring
```bash
pm2 monit               # Real-time monitoring
pm2 list                # List all processes
pm2 info <app-name>     # Detailed info
```

## System Configuration

### Current System Resources (8 cores, 15GB RAM)
- Website Frontend: 3 instances (cores 0-2)
- Scholar Forge Frontend: 1 instance (core 3)
- Scholars API: 1 instance (core 4)
- Python Backend: 4 Gunicorn workers (distributed)
- Memory per instance: 1024MB

### Dynamic Scaling
The system automatically adjusts to different machine specifications:

**Low-Spec (2 cores, 4GB RAM):**
- Website: 1 instance
- Scholar Forge: 1 instance
- Scholars API: 1 instance
- Python: 2 workers

**High-Spec (16+ cores, 32GB+ RAM):**
- Website: 6-8 instances
- Scholar Forge: 3-4 instances
- Scholars API: 3-4 instances
- Python: 8 workers

## Troubleshooting

### PM2 Not Starting
```bash
# Check if PM2 is installed
pm2 --version

# Install PM2
sudo npm install -g pm2

# Check PM2 status
pm2 status
```

### Services Not Responding
```bash
# Check logs
pm2 logs

# Restart services
pm2 restart all

# Check resource usage
pm2 monit
```

### Port Conflicts
```bash
# Check ports
ss -tuln | grep -E ":(3000|4500|8000|8081)"

# Stop conflicting services
./stop-local.sh
```

### Rollback Procedure
If PM2 mode causes issues:

1. Stop PM2:
```bash
./stop-pm2.sh
```

2. Start with previous method:
```bash
./start-local.sh  # for nohup
# or
sudo systemctl start website-frontend website-backend scholars  # for systemd
# or
docker compose up -d  # for docker
```

3. Verify services:
```bash
./website/scripts/utilities/service-status.sh
```

## Best Practices

1. **Test in Development First**: Test PM2 mode locally before production deployment
2. **Monitor Resources**: Use `pm2 monit` to monitor CPU and memory usage
3. **Use Zero-Downtime Reloads**: Use `pm2 reload all` instead of `pm2 restart all` for updates
4. **Save Configuration**: Always run `pm2 save` after making changes
5. **Check Logs Regularly**: Use `pm2 logs` to identify issues early
6. **Set Environment Variables**: Ensure all required environment variables are set in ecosystem configs

## Support

For issues or questions:
- Check PM2 documentation: https://pm2.keymetrics.io/docs/
- Review logs: `pm2 logs`
- Check service status: `./website/scripts/utilities/service-status.sh`
