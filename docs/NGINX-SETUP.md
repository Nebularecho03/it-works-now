# Nginx Single-Domain Integration Guide

This guide explains the nginx configuration for seamless integration of the website and Schoolars-work-bench projects under a single domain.

## Overview

The nginx configuration acts as a unified entry point, routing all services through one domain name while maintaining proper separation and security.

## Architecture

```
User Request → Nginx (443/80) → Backend Services
├── /              → Next.js Frontend (port 3000)
├── /admin         → Admin Panel (Next.js)
├── /scholars      → Scholar Forge (port 4500)
├── /api/*         → Python Backend (port 8000)
├── /scholars-api/* → Scholars API (port 8081)
├── /go-services/* → Go Microservices (ports 9001-9004)
└── /uploads/*     → Static media files
```

## Features

- **Single Domain**: All services accessible through one domain
- **SSL/TLS**: Automatic HTTPS with Let's Encrypt
- **Security Headers**: HSTS, X-Frame-Options, CSP
- **File Upload Support**: Multipart form data handling
- **Static Asset Caching**: Optimized caching for static files
- **Health Checks**: Built-in health endpoint
- **Go Microservices**: Routing to all Go services

## Quick Start

### 1. Set Your Domain

```bash
export DOMAIN_NAME=your-domain.com
```

### 2. Run the Setup Script

```bash
sudo ./setup-nginx.sh
```

The script will:
- Install nginx if needed
- Configure the single-domain setup
- Set up SSL certificates (optional)
- Configure auto-renewal

### 3. Update Environment Variables

Edit `/home/codecrafter/Documents/combined/.env`:

```bash
DOMAIN_NAME=your-domain.com
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SCHOLARS_URL=""
NEXT_PUBLIC_API_URL=""
```

### 4. Start Services

```bash
./start-pm2.sh
```

## Service Endpoints

After setup, all services are accessible via:

- **Main Website**: `https://your-domain.com`
- **Admin Panel**: `https://your-domain.com/admin`
- **Scholar Forge**: `https://your-domain.com/scholars`
- **Admin API**: `https://your-domain.com/api/`
- **Scholars API**: `https://your-domain.com/scholars-api/`
- **Health Check**: `https://your-domain.com/health`

## Manual Configuration

If you prefer manual setup:

### 1. Copy Configuration

```bash
sudo cp nginx.conf /etc/nginx/sites-available/combined
```

### 2. Customize Domain

```bash
sudo sed -i 's/your-domain.com/your-actual-domain.com/g' /etc/nginx/sites-available/combined
```

### 3. Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/combined /etc/nginx/sites-enabled/combined
sudo rm /etc/nginx/sites-enabled/default
```

### 4. Test and Reload

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Setup SSL (Optional)

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## SSL Certificate Management

### Obtain Certificate

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Manual Renewal

```bash
sudo certbot renew
sudo systemctl reload nginx
```

### Auto-Renewal

The setup script adds a cron job for automatic renewal. To verify:

```bash
crontab -l | grep certbot
```

## Configuration Details

### Upstream Servers

The configuration defines upstream servers for:

- `nextjs_frontend`: Port 3000 (Next.js)
- `python_backend`: Port 8000 (Python admin backend)
- `scholars_api`: Port 8081 (Flask scholars API)
- `scholar_forge`: Port 4500 (Vite dev server)
- `go_*_service`: Ports 9001-9004 (Go microservices)

### Security Settings

- TLS 1.2 and 1.3 only
- Modern cipher suites
- HSTS with 1-year max-age
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- XSS protection enabled

### File Upload Limits

- Maximum upload size: 10MB
- Buffer size: 128KB
- Multipart form data support

### Caching Strategy

- Next.js static assets: 365 days
- Static assets: 30 days
- Media uploads: 30 days
- No caching for dynamic content

## Troubleshooting

### Nginx Configuration Test Failed

```bash
sudo nginx -t
```

Check the error message and fix the configuration file.

### Service Not Accessible

1. Check if the service is running:
```bash
pm2 status
```

2. Check if the port is listening:
```bash
ss -tuln | grep -E ':(3000|8000|8081|4500)'
```

3. Check nginx error logs:
```bash
sudo tail -f /var/log/nginx/combined-error.log
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal
```

### Scholar Forge Not Loading

1. Ensure Scholar Forge is built:
```bash
cd Schoolars-work-bench/artifacts/scholar-forge
pnpm build
```

2. Check the dist directory exists:
```bash
ls -la /home/codecrafter/Documents/combined/Schoolars-work-bench/artifacts/scholar-forge/dist
```

### File Upload Failing

1. Check nginx client_max_body_size in config
2. Check Python backend MAX_UPLOAD_BYTES setting
3. Verify permissions on uploads directory

## Updating Configuration

To modify the nginx configuration:

1. Edit the source file:
```bash
nano nginx.conf
```

2. Copy to nginx:
```bash
sudo cp nginx.conf /etc/nginx/sites-available/combined
```

3. Test and reload:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

## Monitoring

### View Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/combined-access.log

# Error logs
sudo tail -f /var/log/nginx/combined-error.log
```

### Check Nginx Status

```bash
sudo systemctl status nginx
```

### Reload After Changes

```bash
sudo systemctl reload nginx
```

## Security Considerations

1. **Firewall**: Ensure ports 80 and 443 are open
2. **SSL**: Always use HTTPS in production
3. **Updates**: Keep nginx and SSL certificates updated
4. **Rate Limiting**: Consider adding rate limiting for API endpoints
5. **Go Services**: Restrict access to internal networks if needed

## Performance Optimization

### Enable Gzip Compression

Add to nginx configuration:

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### Enable HTTP/2

Already enabled in the configuration (`http2` directive).

### Worker Processes

Adjust in `/etc/nginx/nginx.conf`:

```nginx
worker_processes auto;
worker_connections 1024;
```

## Backup and Restore

### Backup Configuration

```bash
sudo cp /etc/nginx/sites-available/combined /etc/nginx/sites-available/combined.backup
```

### Restore Configuration

```bash
sudo cp /etc/nginx/sites-available/combined.backup /etc/nginx/sites-available/combined
sudo nginx -t && sudo systemctl reload nginx
```

## Integration with PM2

The nginx configuration works seamlessly with the PM2 ecosystem defined in `ecosystem.config.js`. Ensure all services are running:

```bash
pm2 start ecosystem.config.js
pm2 save
```

## Additional Resources

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
