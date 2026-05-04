# Debian Installation Guide

This guide provides step-by-step instructions for deploying the Combined Project on Debian servers.

## Quick Start

### 1. Connect to your Debian server

```bash
ssh codecrafter@your-server-ip
```

### 2. Clone the repository

```bash
git clone https://github.com/Cyberverse-cent0/combined-project.git
cd combined-project
```

### 3. Run the Debian installer

```bash
sudo ./deploy-debian.sh
```

### 4. Follow the prompts

- Enter your domain name (or press Enter for localhost)
- Wait for installation to complete
- Note the admin password displayed

## What Gets Installed

### System Dependencies
- Nginx (web server)
- PostgreSQL (database)
- Node.js 18+ (JavaScript runtime)
- Python 3.8+ (backend runtime)
- Go 1.21+ (microservices)
- PM2 (process manager)
- UFW (firewall)

### Applications
- **Main Website**: Next.js frontend (port 3000)
- **Website Backend**: Python Flask API (port 8000)
- **Scholar Forge**: Academic collaboration platform (port 4500)
- **Scholars API**: Node.js backend (port 8081)
- **Go Microservices**:
  - Password Service (port 9001)
  - Telemetry Service (port 9002)
  - Image Service (port 9003)
  - Worker Service (port 9004)

### URLs After Installation
- **Main Site**: http://localhost (or your domain)
- **Admin Panel**: http://localhost/admin
- **Scholar Forge**: http://localhost/scholars
- **APIs**: 
  - Website API: http://localhost/api
  - Scholars API: http://localhost/scholars-api

## Service Management

### Check Status
```bash
sudo -u www-data pm2 status
```

### View Logs
```bash
sudo -u www-data pm2 logs
```

### Restart Services
```bash
sudo -u www-data pm2 restart all
```

### Stop Services
```bash
sudo -u www-data pm2 stop all
```

### Restart Nginx
```bash
sudo systemctl restart nginx
```

## Important Files

- **Project Directory**: `/opt/stephenasatsa/`
- **Environment File**: `/opt/stephenasatsa/.env`
- **PM2 Config**: `/opt/stephenasatsa/ecosystem.config.js`
- **Nginx Config**: `/etc/nginx/sites-available/combined`
- **Installation Log**: `/var/log/stephenasatsa_install.log`

## SSL Certificate Setup

After installation, secure your site with SSL:

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Troubleshooting

### Port Conflicts
If ports are already in use:

```bash
sudo ss -tuln | grep -E ':(3000|8000|4500|8081|9001|9002|9003|9004)'
```

### Permission Issues
```bash
sudo chown -R www-data:www-data /opt/stephenasatsa
sudo chmod -R 755 /opt/stephenasatsa
```

### Database Issues
```bash
sudo systemctl status postgresql
sudo -u postgres psql -l
```

### Nginx Issues
```bash
sudo nginx -t
sudo systemctl status nginx
```

## Manual Installation Steps

If the automated script fails, you can install manually:

### 1. Install Dependencies
```bash
sudo apt update
sudo apt install -y curl wget git nginx python3 python3-pip python3-venv \
    nodejs npm postgresql postgresql-contrib build-essential htop ufw
```

### 2. Install Go
```bash
cd /tmp
wget https://go.dev/dl/go1.21.6.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.21.6.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc
```

### 3. Install PM2
```bash
sudo npm install -g pm2
```

### 4. Setup Project
```bash
sudo mkdir -p /opt/stephenasatsa
sudo chown www-data:www-data /opt/stephenasatsa
cd /opt/stephenasatsa
sudo -u www-data git clone https://github.com/Cyberverse-cent0/combined-project.git .
```

### 5. Install Dependencies
```bash
cd /opt/stephenasatsa/website
sudo -u www-data npm install

cd /opt/stephenasatsa/website/backend
sudo -u www-data python3 -m venv venv
sudo -u www-data venv/bin/pip install -r requirements.txt

cd /opt/stephenasatsa/website/backend/go-services
sudo -u www-data ./build-all.sh
```

### 6. Configure and Start
```bash
# Create environment file
sudo -u www-data cp .env.example .env

# Configure nginx
sudo cp nginx.conf /etc/nginx/sites-available/combined
sudo ln -sf /etc/nginx/sites-available/combined /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Start with PM2
sudo -u www-data pm2 start ecosystem.config.js
sudo -u www-data pm2 save
sudo -u www-data pm2 startup
```

## Security Recommendations

1. **Change Default Passwords**: Update admin password in `.env`
2. **Setup SSL**: Use Let's Encrypt certificates
3. **Configure Firewall**: Only allow necessary ports
4. **Regular Updates**: Keep system and packages updated
5. **Backups**: Setup regular database and file backups
6. **Monitoring**: Setup log monitoring and alerts

## Support

For issues and questions:
- Check installation logs: `/var/log/stephenasatsa_install.log`
- Review PM2 logs: `sudo -u www-data pm2 logs`
- Check system logs: `sudo journalctl -xe`
- GitHub Issues: https://github.com/Cyberverse-cent0/combined-project/issues
