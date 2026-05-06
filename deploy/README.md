# Quick Deploy Package

For deploying pre-built Stephen Asatsa website files without compiling.

## What's Included

- `deploy.sh` - Quick deployment script (nginx + systemd only)
- No build steps, no dependency installation

## Prerequisites

Before running deploy, ensure:

1. **Pre-built files exist** at `/opt/stephenasatsa/apps/website/.next/`
2. **System services** installed: nginx, systemd
3. **Database** configured (if needed)

## Usage

### Quick Deploy (localhost)
```bash
sudo ./deploy.sh
```

### Deploy with custom domain
```bash
sudo ./deploy.sh example.com
```

### Deploy with SSL
```bash
sudo ./deploy.sh example.com
# SSL is auto-configured for non-localhost domains
```

## What It Does

1. **Nginx config** - Sets up reverse proxy to localhost:3000
2. **Systemd services** - Frontend and backend services
3. **Permissions** - Sets correct ownership (www-data)
4. **SSL** - Auto-configures Let's Encrypt (for domains)
5. **Firewall** - Allows nginx and ssh
6. **Health check** - Verifies services are running

## Build First

If you haven't built yet, run this on your build machine:

```bash
cd apps/website
npm install --legacy-peer-deps
npx prisma generate
npm run build
```

Then copy the entire `apps/website/` folder (including `.next/`) to `/opt/stephenasatsa/apps/website/` on the server.

## Manual Steps

If you prefer manual deployment:

```bash
# 1. Copy nginx config
sudo cp nginx.conf /etc/nginx/sites-available/stephenasatsa
sudo ln -s /etc/nginx/sites-available/stephenasatsa /etc/nginx/sites-enabled/

# 2. Copy systemd services
sudo cp *.service /etc/systemd/system/
sudo systemctl daemon-reload

# 3. Enable and start
sudo systemctl enable stephenasatsa-frontend
sudo systemctl enable stephenasatsa-backend
sudo systemctl start stephenasatsa-backend
sudo systemctl start stephenasatsa-frontend
```
