# Single-Domain Architecture Setup

This project uses a single-domain architecture where all services are accessible through one domain name.

## Architecture Overview

The main Next.js application acts as a reverse proxy, routing requests to various backend services:

```
User Request → Next.js (port 3000) → Backend Services
├── /              → Main Website (Next.js)
├── /admin         → Admin Panel (Next.js)
├── /api/*         → Admin Backend (Python, port 8000)
├── /scholars/*    → Scholar Forge (Vite, port 4500)
└── (direct)       → Scholars API (Flask, port 8081)
```

## Service Endpoints

### Single-Domain Access (Recommended)
All services accessible through `http://localhost:3000` (or your production domain):

- **Main Website**: `http://localhost:3000`
- **Admin Panel**: `http://localhost:3000/admin`
- **Scholar Forge**: `http://localhost:3000/scholars`
- **Admin API**: `http://localhost:3000/api/*` (proxied)
- **Scholars API**: `http://localhost:8081` (direct access only)

### Direct Service Ports (for debugging)
- **Frontend (Next.js)**: Port 3000
- **Admin Backend (Python)**: Port 8000
- **Scholars API (Flask)**: Port 8081
- **Scholar Forge (Vite)**: Port 4500

## Configuration

### Environment Variables

Set these in `website/.env`:

```bash
# Single Domain Configuration
DOMAIN_NAME="your-domain.com"  # or "localhost" for development

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# API Configuration (leave empty for proxy)
NEXT_PUBLIC_API_URL=""

# Scholar Forge Configuration (leave empty for proxy)
NEXT_PUBLIC_SCHOLARS_URL=""
```

### Next.js Rewrites

The `next.config.ts` file handles the proxying:

```typescript
async rewrites() {
  const scholarsUrl = process.env.NEXT_PUBLIC_SCHOLARS_URL || 'http://localhost:4500';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return [
    {
      source: '/scholars/:path*',
      destination: `${scholarsUrl}/:path*`,
    },
    {
      source: '/scholars',
      destination: scholarsUrl,
    },
    {
      source: '/api/:path*',
      destination: `${apiUrl}/:path*`,
    },
  ];
}
```

### Scholar Forge Base Path

Scholar Forge is configured with `BASE_PATH="/scholars"` to work correctly with the proxy:

```bash
export BASE_PATH="/scholars"
```

This is set automatically in the startup scripts.

## CORS Configuration

All backends are configured to allow requests from the single domain:

### Admin Backend (Python)
- Allows same-origin requests from `NEXT_PUBLIC_SITE_URL`
- Allows localhost for development
- Allows cloudflared tunnel URLs for production

### Scholars API (Flask)
- Configured with Flask-CORS to allow:
  - `http://localhost:3000`
  - `http://localhost:3001`
  - `NEXT_PUBLIC_SITE_URL` (from environment)

## Starting Services

### Development Mode

```bash
# Start all services
cd /home/codecrafter/Documents/combined
./start-local.sh

# Or use the utilities script
./website/scripts/utilities/start-all-services.sh
```

### Production Mode

```bash
# Use PM2 for production
USE_PM2=true ./start-local.sh

# Or
USE_PM2=true ./website/scripts/utilities/start-all-services.sh
```

## Stopping Services

```bash
# Stop all services
./stop-local.sh

# Or
./website/scripts/utilities/stop-all-services.sh
```

## Viewing Logs

```bash
# View all service logs
./view-logs.sh

# View specific service logs
tail -f website/frontend.log
tail -f website/admin-backend.log
tail -f Schoolars-work-bench/artifacts/api-server/scholars-backend.log

# View Scholar Forge logs
./website/scholar-forge-start.sh logs
```

## Checking Service Status

```bash
# Check all services
./website/scripts/utilities/service-status.sh

# Check Scholar Forge status
./website/scholar-forge-start.sh status
```

## Production Deployment

For production deployment:

1. **Set your domain** in `.env`:
   ```bash
   DOMAIN_NAME="your-domain.com"
   NEXTAUTH_URL="https://your-domain.com"
   NEXT_PUBLIC_SITE_URL="https://your-domain.com"
   ```

2. **Keep proxy URLs empty** to use the single-domain architecture:
   ```bash
   NEXT_PUBLIC_API_URL=""
   NEXT_PUBLIC_SCHOLARS_URL=""
   ```

3. **Configure reverse proxy** (nginx/Apache) to forward all requests to the Next.js app on port 3000.

4. **Use PM2** for process management in production.

## Benefits of Single-Domain Architecture

1. **Unified User Experience**: All services under one domain
2. **Simplified Authentication**: Single session across all services
3. **Easier SSL/TLS**: One certificate for the entire domain
4. **Better SEO**: Single domain for all content
5. **Simplified CORS**: Same-origin requests by default
6. **Easier Deployment**: One entry point for the entire application

## Troubleshooting

### Scholar Forge not loading at /scholars

1. Check if Scholar Forge is running on port 4500:
   ```bash
   curl http://localhost:4500
   ```

2. Check if BASE_PATH is set:
   ```bash
   echo $BASE_PATH
   ```

3. Restart Scholar Forge with correct base path:
   ```bash
   ./website/scholar-forge-start.sh restart dev
   ```

### API requests failing

1. Check if backend is running:
   ```bash
   curl http://localhost:8000/api/health
   ```

2. Check CORS configuration in backend logs

3. Verify NEXT_PUBLIC_SITE_URL matches your domain

### Port conflicts

```bash
# Check what's using ports
ss -tuln | grep -E ':(3000|8000|8081|4500)'

# Kill processes on specific ports
fuser -k 3000/tcp
fuser -k 8000/tcp
fuser -k 8081/tcp
fuser -k 4500/tcp
```

## Migration from Multi-Domain

If you're migrating from a multi-domain setup:

1. Update all environment variables to use empty proxy URLs
2. Update any hardcoded URLs in your code to use relative paths
3. Update CORS configuration to allow the single domain
4. Test all services through the proxy
5. Update any external integrations to use the new single-domain URLs
