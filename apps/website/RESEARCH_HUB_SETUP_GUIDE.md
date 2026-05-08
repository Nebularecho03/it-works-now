# Research Hub Setup Guide

## 🎯 Overview

Complete setup script for the Research Hub platform with authentication, dashboard, and API services.

## 📋 Prerequisites

- **Node.js 18+** - Frontend framework
- **Python 3.8+** - Backend API server
- **PostgreSQL 12+** - Database
- **npm 8+** - Package manager
- **Git** - Version control
- **sudo access** - For systemd services

## 🚀 Quick Start

### Option 1: Complete Setup (Recommended)
```bash
# Clone and setup everything
bash setup-research-hub.sh deps
bash setup-research-hub.sh services
bash setup-research-hub.sh start
```

### Option 2: Development Mode
```bash
# Start development servers only
bash setup-research-hub.sh dev
```

### Option 3: Individual Components
```bash
# Install frontend dependencies only
bash setup-research-hub.sh frontend

# Setup backend environment only
bash setup-research-hub.sh backend

# Setup database only
bash setup-research-hub.sh database

# Setup systemd services only
bash setup-research-hub.sh services
```

## 📁 Directory Structure After Setup

```
apps/website/
├── app/
│   ├── dashboard/           # Private dashboard (auth required)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── publications/
│   │       ├── page.tsx
│   │       └── new/page.tsx
│   ├── api/               # API endpoints
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── statistics/route.ts
│   │   ├── projects/route.ts
│   │   └── publications/route.ts
│   └── [public pages]    # Existing public site
├── components/dashboard/     # Dashboard components
│   ├── dashboard-sidebar.tsx
│   ├── dashboard-header.tsx
│   ├── dashboard-overview.tsx
│   ├── stats-cards.tsx
│   ├── quick-actions.tsx
│   └── recent-activity.tsx
├── backend/
│   ├── app_enhanced.py      # Enhanced Flask API server
│   ├── requirements.txt       # Python dependencies
│   └── venv/              # Python virtual environment
├── scripts/
│   ├── setup-research-hub.sh  # Main setup script
│   └── setup-services.sh      # Systemd service generator
└── templates/systemd/          # Service templates
    ├── stephenasatsa-frontend.service.template
    └── stephenasatsa-backend.service.template
```

## 🔧 Configuration Files

### Environment Variables
Create `.env.local` in frontend directory:
```env
# Database
DATABASE_URL=postgresql://stephenasatsa_website:password@localhost:5432/stephenasatsa_website

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Application
NODE_ENV=development
PORT=3000
```

### Database Setup
```bash
# Create database and user
sudo -u postgres createdb stephenasatsa_website
sudo -u postgres createuser stephenasatsa_website --superuser

# Run migrations
cd backend
source venv/bin/activate
npx prisma migrate deploy
npx prisma generate
```

## 🌐 Access URLs

After setup, access the platform at:

- **Frontend**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard (requires login)
- **API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔐 Authentication

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or use existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

### Default Admin Account
- **Email**: admin@stephenasatsa.com
- **Password**: admin123 (change in production)
- **Role**: ADMIN

## 📊 API Endpoints

### Authentication
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js handlers

### Statistics
- `GET /api/statistics` - Dynamic dashboard statistics

### Publications
- `GET /api/publications?page=1&limit=10` - List publications
- `POST /api/publications` - Create new publication
- `GET /api/publications/[id]` - Get specific publication
- `PUT /api/publications/[id]` - Update publication
- `DELETE /api/publications/[id]` - Delete publication

### Projects
- `GET /api/projects?page=1&limit=10` - List projects
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get specific project
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

## 🎨 Dashboard Features

### Main Dashboard (`/dashboard`)
- **Statistics Cards** - Real-time project/publication counts
- **Recent Projects** - Active research initiatives overview
- **Quick Actions** - Fast access to common tasks
- **Recent Activity** - Latest updates and notifications

### Publications Management (`/dashboard/publications`)
- **List View** - Searchable, filterable publication list
- **Create Form** - Add new publications with DOI support
- **Edit Interface** - Update existing publications
- **Status Management** - Draft, Published, Archived states

## 🔒 Security Features

- **Authentication** - NextAuth.js with secure sessions
- **Role-Based Access** - Admin, Researcher, Guest roles
- **Input Validation** - Form validation and sanitization
- **SQL Injection Protection** - Prisma ORM parameterized queries
- **XSS Protection** - Proper output escaping
- **CSRF Protection** - NextAuth.js built-in protection

## 🚀 Production Deployment

### Using Systemd Services
```bash
# Enable and start services
sudo systemctl enable stephenasatsa-frontend.service
sudo systemctl enable stephenasatsa-backend.service
sudo systemctl start stephenasatsa-frontend.service
sudo systemctl start stephenasatsa-backend.service

# Check status
sudo systemctl status stephenasatsa-frontend.service
sudo systemctl status stephenasatsa-backend.service
```

### Using Docker
```bash
# Build and run with Docker Compose
docker-compose up -d --build
```

### Environment Configuration
- **Production**: Set `NODE_ENV=production`
- **Database**: Use production PostgreSQL instance
- **Secrets**: Use environment variables, never commit secrets
- **HTTPS**: Configure SSL certificates in production

## 🐛 Troubleshooting

### Common Issues

**Port Conflicts**
```bash
# Check what's using ports
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :8000

# Kill processes if needed
sudo kill -9 $(sudo lsof -t -i:3000)
sudo kill -9 $(sudo lsof -t -i:8000)
```

**Database Connection**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U stephenasatsa_website -d stephenasatsa_website

# Reset database
cd backend && npx prisma migrate reset
```

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next

# Clear node modules
rm -rf node_modules
npm install

# Prisma regeneration
npx prisma generate
```

## 📚 Additional Resources

- **API Documentation**: Check `/docs` endpoint on backend
- **Database Schema**: See `prisma/schema.prisma`
- **Component Library**: See `components/dashboard/` directory
- **Deployment Scripts**: See `scripts/` directory

## 🔄 Maintenance

### Regular Updates
```bash
# Update dependencies
npm update
pip install -r requirements.txt --upgrade

# Database migrations
npx prisma migrate deploy

# Restart services
sudo systemctl restart stephenasatsa-frontend.service
sudo systemctl restart stephenasatsa-backend.service
```

### Backup Strategy
```bash
# Database backup
pg_dump stephenasatsa_website > backup_$(date +%Y%m%d).sql

# Code backup
git add .
git commit -m "Backup $(date)"
git push origin main
```

This setup guide provides everything needed to deploy and maintain the Research Hub platform in both development and production environments.
