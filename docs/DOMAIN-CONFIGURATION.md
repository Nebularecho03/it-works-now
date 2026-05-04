# Domain Configuration Guide

This guide explains how to configure domain names for the combined website and Schoolars-work-bench projects.

## Overview

Both projects are now configured to use environment variables for domain names, making it easy to change domains without modifying code. The domain configuration is centralized and shared across both projects.

## Environment Variables

### Primary Domain Variables

- `DOMAIN_NAME` - Your primary domain name (e.g., `your-domain.com`)
- `SCHOLARS_SUBDOMAIN` - Subdomain for Scholar Forge (default: `scholars`)

### Derived URLs

The following URLs are automatically derived from the primary domain:

- `WEBSITE_URL` - Main website URL (`https://$DOMAIN_NAME`)
- `SCHOLARS_URL` - Scholar Forge URL (`https://$SCHOLARS_SUBDOMAIN.$DOMAIN_NAME`)
- `CORS_ORIGIN` - CORS allowed origin (`https://$DOMAIN_NAME`)
- `NEXTAUTH_URL` - NextAuth URL (`https://$DOMAIN_NAME`)
- `NEXT_PUBLIC_SITE_URL` - Public site URL (`https://$DOMAIN_NAME`)
- `NEXT_PUBLIC_SCHOLARS_URL` - Public scholars URL (`https://$SCHOLARS_SUBDOMAIN.$DOMAIN_NAME`)
- `ADMIN_EMAIL` - Admin email (`admin@$DOMAIN_NAME`)

## Configuration Files

### 1. Shared Configuration

Copy and customize the shared environment template:

```bash
cp /home/codecrafter/Documents/combined/.env.shared /home/codecrafter/Documents/combined/.env.local
```

Edit `.env.local` and set your domain:

```bash
DOMAIN_NAME=your-domain.com
SCHOLARS_SUBDOMAIN=scholars
```

### 2. Schoolars-work-bench Configuration

Edit `Schoolars-work-bench/.env`:

```bash
WEBSITE_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
```

### 3. Website Configuration

Edit `website/.env`:

```bash
DOMAIN_NAME=your-domain.com
SCHOLARS_SUBDOMAIN=scholars
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SCHOLARS_URL=https://scholars.your-domain.com
ADMIN_EMAIL=admin@your-domain.com
```

## Deployment Scripts

All deployment scripts now accept the `DOMAIN_NAME` parameter:

### Docker Deployment

```bash
DOMAIN_NAME=your-domain.com ./deploy-docker.sh
```

### Both Projects Deployment

```bash
DOMAIN_NAME=your-domain.com ./deploy-both-projects.sh
```

### Systemd Bare Metal Deployment

```bash
DOMAIN_NAME=your-domain.com ./deploy-systemd-bare-metal.sh
```

### Website Server Setup

```bash
./website/scripts/server-setup.sh --domain your-domain.com
```

### Docker Setup

```bash
DOMAIN_NAME=your-domain.com ./website/scripts/setup-docker.sh
```

## Nginx Configuration

Nginx configuration files use placeholder domains. Update them after deployment:

### Website Main Config

Edit `website/deploy/nginx/website-main.conf`:

```nginx
server_name your-domain.com www.your-domain.com;
```

### Stephenasatsa Config

Edit `website/nginx/stephenasatsa.conf`:

```nginx
server_name your-domain.com www.your-domain.com localhost;
```

## Systemd Service Files

Systemd service files use placeholder domains. Update them:

### Backend Service

Edit `website/deploy/systemd/devmain-backend.service`:

```ini
Environment=ADMIN_ALLOWED_ORIGIN=https://your-domain.com
```

## Changing Domains

To change the domain name:

1. Update `DOMAIN_NAME` in all `.env` files
2. Update nginx configuration files
3. Update systemd service files
4. Restart services:

```bash
# For systemd
sudo systemctl restart website scholars

# For docker
cd website && docker-compose restart
cd Schoolars-work-bench && docker-compose restart
```

5. Update DNS records to point to your server

## Local Development

For local development, use `localhost`:

```bash
DOMAIN_NAME=localhost
```

The application will automatically use appropriate localhost URLs and ports.

## Troubleshooting

### CORS Errors

If you see CORS errors:
- Ensure `CORS_ORIGIN` matches your actual domain
- Check that both projects have the same domain configuration
- Verify nginx is proxying requests correctly

### Mixed Content Errors

If you see mixed content warnings:
- Ensure all URLs use `https://` in production
- Check that `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` match
- Verify SSL certificates are properly configured

### Scholar Forge Not Accessible

If Scholar Forge is not accessible:
- Check `NEXT_PUBLIC_SCHOLARS_URL` in website `.env`
- Verify nginx `/scholars` location block is configured
- Ensure Scholar Forge service is running
- Check that `WEBSITE_URL` in scholars `.env` is correct

## Security Notes

1. Never commit actual domain names or secrets to version control
2. Use `.env.local` for local development overrides
3. Rotate secrets when changing domains in production
4. Update OAuth redirect URLs in Google/Yahoo consoles
5. Ensure SSL certificates are obtained for the new domain
