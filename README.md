# Combined Project

A full-stack web application combining a Next.js website, Scholar Forge application, and Go microservices for high-performance computing operations.

## Architecture

- **Website Frontend**: Next.js (React) - Main website with admin panel
- **Scholar Forge Frontend**: React/Vite - Academic collaboration platform
- **Website Backend**: Python/Flask - Admin API and content management
- **Scholars API**: Node.js - Scholar Forge backend API
- **Go Microservices**: High-performance services for CPU-intensive operations
  - Password Service (Port 9001) - PBKDF2 password hashing
  - Telemetry Service (Port 9002) - Monitoring and metrics
  - Image Service (Port 9003) - Image processing
  - Worker Service (Port 9004) - Background task processing

## Prerequisites

### For Bare Metal Deployment
- **Node.js** 18+ and npm
- **Python** 3.8+ with pip
- **Go** 1.21+ (for Go microservices)
- **PM2** (process manager): `npm install -g pm2`
- **Nginx** (reverse proxy, optional but recommended)
- **Git**

### For Docker Deployment
- **Docker** 20.10+
- **Docker Compose** 2.0+

## Quick Start

### Deployment Options

The project includes multiple deployment scripts that automatically detect your environment:

- **deploy-codespace.sh** - For GitHub Codespaces and containers (no systemd)
- **deploy-both-projects.sh** - Auto-detects systemd, falls back to PM2 if unavailable
- **deploy-docker.sh** - Docker-based deployment with systemd detection
- **deploy-systemd-bare-metal.sh** - Bare metal with systemd (requires systemd)
- **start-pm2.sh** - Direct PM2 startup (manual dependency installation)

### Option 1: GitHub Codespaces / Containers (No Systemd)

```bash
git clone https://github.com/Cyberverse-cent0/combined-project.git
cd combined-project
./deploy-codespace.sh
```

This script automatically:
- Installs PM2 and pnpm
- Installs all dependencies
- Builds Scholar Forge
- Optionally builds Go services
- Starts all services with PM2

### Option 2: Bare Metal with Systemd Detection

```bash
git clone https://github.com/Cyberverse-cent0/combined-project.git
cd combined-project
./deploy-both-projects.sh
```

This script automatically:
- Detects if systemd is available
- Uses systemd deployment if available
- Falls back to PM2 if systemd is not available
- Installs system dependencies
- Sets up PostgreSQL databases
- Configures and starts services

**Force specific deployment mode:**
```bash
# Force PM2 mode (even if systemd is available)
DEPLOYMENT_MODE=pm2 ./deploy-both-projects.sh

# Force systemd mode (will fail if systemd not available)
DEPLOYMENT_MODE=systemd ./deploy-both-projects.sh
```

### Option 3: Docker Deployment

```bash
git clone https://github.com/Cyberverse-cent0/combined-project.git
cd combined-project
./deploy-docker.sh
```

This script automatically:
- Detects systemd availability
- Uses appropriate service management
- Sets up Docker containers
- Configures networking and volumes

### Option 4: Manual Bare Metal Deployment

#### 1. Clone the Repository
```bash
git clone https://github.com/Cyberverse-cent0/combined-project.git
cd combined-project
```

#### 2. Install Dependencies

**Website Frontend:**
```bash
cd website
npm install
cd ..
```

**Website Backend:**
```bash
cd website/backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ../..
```

**Scholar Forge:**
```bash
cd Schoolars-work-bench
pnpm install
cd ..
```

**Go Microservices:**
```bash
cd website/backend/go-services
./build-all.sh
cd ../..
```

#### 3. Configure Environment Variables

**Website Backend (.env):**
```bash
cd website/backend
cp .env.example .env
# Edit .env with your configuration
cd ../..
```

**Scholar Forge (.env):**
```bash
cd Schoolars-work-bench
cp .env.example .env
# Edit .env with your configuration
BASE_PATH=/scholars
cd ..
```

**Enable Go Services (Optional):**
```bash
export USE_GO_PASSWORD_SERVICE=true
export USE_GO_TELEMETRY_SERVICE=true
```

#### 4. Start Services with PM2

```bash
# Start all services
./start-pm2.sh

# Or start specific environment
./start-pm2.sh dev      # Development
./start-pm2.sh staging  # Staging
```

#### 5. Configure Nginx (Optional but Recommended)

Update your Nginx configuration to proxy requests:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Main website
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Scholar Forge (path-based routing)
    location /scholars {
        proxy_pass http://localhost:4500;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Website backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
    }

    # Scholars API
    location /scholars-api {
        proxy_pass http://localhost:8081;
        proxy_set_header Host $host;
    }
}
```

Reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

#### 6. Access the Application

- **Main Website**: http://localhost:3000 or http://your-domain.com
- **Admin Panel**: http://localhost:3000/admin
- **Scholar Forge**: http://localhost:4500 or http://your-domain.com/scholars
- **Website API**: http://localhost:8000
- **Scholars API**: http://localhost:8081

### Option 2: Docker Deployment

#### 1. Clone the Repository
```bash
git clone https://github.com/Cyberverse-cent0/combined-project.git
cd combined-project
```

#### 2. Build and Start with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### 3. Access the Application

Docker Compose will expose services on the following ports:
- **Website Frontend**: 3000
- **Website Backend**: 8000
- **Scholar Forge Frontend**: 4500
- **Scholars API**: 8081
- **Go Password Service**: 9001
- **Go Telemetry Service**: 9002
- **Go Image Service**: 9003
- **Go Worker Service**: 9004

## Management

### PM2 Commands (Bare Metal)

```bash
# View status
pm2 status

# View logs
pm2 logs

# Monitor resources
pm2 monit

# Restart all services
./restart-pm2.sh

# Stop all services
./stop-pm2.sh

# Restart specific service
pm2 restart website-frontend
pm2 restart go-password-service

# View specific service logs
pm2 logs website-frontend
pm2 logs go-password-service
```

### Docker Commands

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f [service-name]

# Restart service
docker-compose restart [service-name]

# Rebuild service
docker-compose up -d --build [service-name]

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Go Microservices

### Building Go Services

```bash
cd website/backend/go-services
./build-all.sh
```

### Starting Go Services Individually

```bash
# Password service
cd password-service
./password-service

# Telemetry service
cd telemetry-service
./telemetry-service

# Image service
cd image-service
./image-service

# Worker service
cd worker-service
./worker-service
```

### Testing Go Services

```bash
# Test password service
curl -X POST http://localhost:9001/hash -H "Content-Type: application/json" -d '{"password":"test123"}'

# Test telemetry service
curl http://localhost:9002/health

# Test image service
curl http://localhost:9003/health

# Test worker service
curl http://localhost:9004/health
```

## Configuration

### Website Backend (.env)

```env
# Database
DATA_DIR=./data
UPLOADS_DIR=./uploads

# Session
DEFAULT_SESSION_HOURS=24
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=change-me-now
DEFAULT_ADMIN_NAME=Administrator

# Security
DEFAULT_ADMIN_TOTP_SECRET=
CSRF_SECRET=your-csrf-secret-here

# Go Services (Optional)
USE_GO_PASSWORD_SERVICE=true
GO_PASSWORD_SERVICE_URL=http://localhost:9001
USE_GO_TELEMETRY_SERVICE=true
GO_TELEMETRY_SERVICE_URL=http://localhost:9002
```

### Scholar Forge (.env)

```env
# API
PORT=8081
DATABASE_URL=your-database-url

# Frontend
BASE_PATH=/scholars
WEBSITE_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

## Port Configuration

| Service | Port | Description |
|---------|------|-------------|
| Website Frontend | 3000 | Next.js main website |
| Website Backend | 8000 | Python admin API |
| Scholar Forge Frontend | 4500 | React Scholar Forge app |
| Scholars API | 8081 | Node.js Scholar Forge API |
| Go Password Service | 9001 | Password hashing |
| Go Telemetry Service | 9002 | Monitoring/metrics |
| Go Image Service | 9003 | Image processing |
| Go Worker Service | 9004 | Background tasks |

## Troubleshooting

### Services Won't Start

**Check port conflicts:**
```bash
ss -tuln | grep -E ':(3000|8000|4500|8081|9001|9002|9003|9004)'
```

**Check PM2 logs:**
```bash
pm2 logs
```

**Check Docker logs:**
```bash
docker-compose logs
```

### Go Services Not Working

**Verify Go installation:**
```bash
go version
```

**Rebuild services:**
```bash
cd website/backend/go-services
./build-all.sh
```

**Check if service is running:**
```bash
curl http://localhost:9001/health
```

### Database Issues

**Check database permissions:**
```bash
ls -la website/backend/data/
```

**Recreate database:**
```bash
rm website/backend/data/users.db
# Restart the backend service
pm2 restart website-backend
```

### Memory Issues

**Check system resources:**
```bash
free -h
top
```

**Adjust PM2 memory limits in `ecosystem.config.js`**

**Reduce instance counts for low-spec machines**

## Development

### Running in Development Mode

**Website Frontend:**
```bash
cd website
npm run dev
```

**Website Backend:**
```bash
cd website/backend
source venv/bin/activate
python server.py
```

**Scholar Forge:**
```bash
cd Schoolars-work-bench
pnpm dev
```

### Running Tests

```bash
# Website tests
cd website
npm test

# Backend tests
cd website/backend
python -m pytest
```

## Deployment Scripts

- `start-pm2.sh` - Start all services with PM2
- `stop-pm2.sh` - Stop all services
- `restart-pm2.sh` - Restart all services (zero-downtime)
- `deploy-both-projects.sh` - Deploy both website and Scholar Forge
- `deploy-docker.sh` - Docker deployment script
- `deploy-systemd-bare-metal.sh` - Systemd service setup

## Monitoring

### PM2 Monitoring
```bash
pm2 monit
```

### Go Telemetry Service
```bash
curl http://localhost:9002/stats
curl http://localhost:9002/system
```

### Log Files
Logs are stored in the `logs/` directory:
- `website-frontend-error.log`
- `website-frontend-out.log`
- `website-backend-error.log`
- `website-backend-out.log`
- `scholar-forge-error.log`
- `scholar-forge-out.log`
- `scholars-api-error.log`
- `scholars-api-out.log`
- `go-*-service-error.log`
- `go-*-service-out.log`

## Security

- Change default admin passwords
- Use HTTPS in production
- Configure firewall rules
- Keep dependencies updated
- Enable Go services for better password hashing performance
- Regularly backup database and uploads

## Backup

### Database Backup
```bash
cp website/backend/data/users.db backups/users-$(date +%Y%m%d).db
```

### Full Backup
```bash
tar -czf backup-$(date +%Y%m%d).tar.gz website Schoolars-work-bench
```

## Support

For issues and questions:
- GitHub Issues: https://github.com/Cyberverse-cent0/combined-project/issues
- Documentation: See individual README files in subdirectories

## License

[Your License Here]
