# Enhanced Message Management System Deployment Guide

## 🚀 Overview

This guide covers deployment of the comprehensive message management system with:
- ✅ User authentication with secure login
- ✅ Free email stack (Gmail, Outlook, SMTP)
- ✅ Professional HTML email templates (Jinja2)
- ✅ Multiple message sources integration
- ✅ Real-time notifications and unread counters
- ✅ Admin dashboard with email configuration

## 📋 System Components

### Core Files
- `app_enhanced.py` - Main Flask application with enhanced messaging
- `auth.py` - Authentication and session management
- `email_service.py` - Free email service with multiple providers
- `email_templates/` - Jinja2 HTML email templates
- `requirements.txt` - Enhanced dependencies

### Database Schema
- SQLite database with proper relationships
- Users table with authentication and roles
- Messages table with conversation support
- Email settings table for provider configuration
- Full indexing for performance

## 🛠️ Installation Steps

### 1. Quick Install
```bash
# Clone or navigate to backend directory
cd /path/to/backend

# Run enhanced installation script
chmod +x install.sh
./install.sh
```

### 2. Manual Install
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install enhanced dependencies
pip install -r requirements.txt

# Initialize database
python -c "from auth import init_db; init_db()"
```

### 3. Configuration Setup
```bash
# Create environment file
cp .env.example .env

# Edit .env with your settings
nano .env
```

Required `.env` variables:
```bash
SECRET_KEY=your-secret-key-here
FLASK_ENV=production
FLASK_DEBUG=False
FLASK_HOST=0.0.0.0
FLASK_PORT=5000

# Email Configuration (Optional)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your-admin-password
```

## 🚀 Running the System

### Development Mode
```bash
# Start enhanced server
source venv/bin/activate
python app_enhanced.py
```

### Production Mode
```bash
# Using build script
chmod +x build.sh
./build.sh

# Using deployment script
chmod +x deploy.sh
./deploy.sh
```

### Systemd Service (Linux)
```bash
# Install as system service
sudo cp stephen-asatsa-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable stephen-asatsa-backend
sudo systemctl start stephen-asatsa-backend

# Check status
sudo systemctl status stephen-asatsa-backend
```

## 📧 Email Configuration

### Gmail SMTP Setup
```bash
# Update email settings via API or database
curl -X PUT http://localhost:5000/api/admin/email-settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "gmail",
    "smtp_host": "smtp.gmail.com",
    "smtp_port": 587,
    "smtp_username": "your-email@gmail.com",
    "smtp_password": "your-app-password",
    "smtp_use_tls": true,
    "from_email": "noreply@yourdomain.com",
    "from_name": "Your Name",
    "enabled": true
  }'
```

### Outlook SMTP Setup
```bash
curl -X PUT http://localhost:5000/api/admin/email-settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "outlook",
    "smtp_host": "smtp-mail.outlook.com",
    "smtp_port": 587,
    "smtp_username": "your-email@outlook.com",
    "smtp_password": "your-app-password",
    "smtp_use_tls": true,
    "from_email": "noreply@yourdomain.com",
    "from_name": "Your Name",
    "enabled": true
  }'
```

### Custom SMTP Setup
```bash
curl -X PUT http://localhost:5000/api/admin/email-settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "smtp",
    "smtp_host": "your-smtp-server.com",
    "smtp_port": 587,
    "smtp_username": "your-smtp-username",
    "smtp_password": "your-smtp-password",
    "smtp_use_tls": true,
    "from_email": "noreply@yourdomain.com",
    "from_name": "Your Name",
    "enabled": true
  }'
```

## 🧪 Testing Email Configuration

```bash
# Test email settings
curl -X POST http://localhost:5000/api/admin/email-settings/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "gmail",
    "smtp_host": "smtp.gmail.com",
    "smtp_port": 587,
    "smtp_username": "your-email@gmail.com",
    "smtp_password": "your-app-password"
  }'
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Current user info

### Message Management
- `POST /api/messages` - Create new message
- `GET /api/messages` - Get user messages
- `PUT /api/messages/<id>` - Update message status
- `POST /api/messages/<id>` - Reply to message
- `DELETE /api/messages/<id>` - Delete message

### Email System
- `GET /api/admin/email-settings` - Get email config
- `PUT /api/admin/email-settings` - Update email config
- `POST /api/admin/email-settings/test` - Test email connection

### Statistics
- `GET /api/messages/stats` - Message statistics

## 🔐 Security Features

### Authentication
- Token-based session management
- SHA-256 password hashing
- Session expiration (24 hours)
- Role-based access control
- Input validation and sanitization

### Email Security
- TLS/SSL encryption support
- App password authentication
- Secure credential storage
- Connection testing before enabling

### API Security
- CORS enabled for frontend integration
- Request validation
- Error handling and logging
- Rate limiting protection

## 📱 Frontend Integration

### JavaScript/TypeScript
```typescript
// API client for enhanced messaging
interface Message {
  id: number;
  from_email: string;
  from_name: string;
  to_email: string;
  to_name?: string;
  subject?: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

class MessageService {
  private baseUrl = 'http://localhost:5000/api';
  
  async sendMessage(message: Partial<Message>): Promise<Response> {
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify(message)
    });
    
    return response.json();
  }
  
  async getMessages(filters?: any): Promise<Message[]> {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${this.baseUrl}/messages?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    });
    
    const data = await response.json();
    return data.messages;
  }
  
  private getToken(): string {
    return localStorage.getItem('authToken') || '';
  }
}
```

### React Components
```typescript
// Message list component
import React, { useState, useEffect } from 'react';

const MessageList: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadMessages();
  }, []);
  
  const loadMessages = async () => {
    try {
      const messageService = new MessageService();
      const userMessages = await messageService.getMessages();
      setMessages(userMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="message-list">
      {loading ? (
        <div>Loading messages...</div>
      ) : (
        messages.map(message => (
          <MessageItem key={message.id} message={message} />
        ))
      )}
    </div>
  );
};
```

## 🔧 Configuration Files

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
    }
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Docker Configuration
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Copy application files
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 5000

# Start application
CMD ["python", "app_enhanced.py"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - SECRET_KEY=${SECRET_KEY}
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    restart: unless-stopped
```

## 📈 Monitoring & Logging

### Health Check Script
```bash
#!/bin/bash
# health_check.sh

BACKEND_URL="http://localhost:5000"
LOG_FILE="logs/health.log"

check_health() {
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    
    if curl -s "$BACKEND_URL/api/auth/me" > /dev/null; then
        echo "$TIMESTAMP: Backend is healthy" >> "$LOG_FILE"
        exit 0
    else
        echo "$TIMESTAMP: Backend is not responding" >> "$LOG_FILE"
        exit 1
    fi
}

check_health
```

### Log Rotation Setup
```bash
# /etc/logrotate.d/stephen-asatsa-backend
/path/to/backend/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload stephen-asatsa-backend || true
    endscript
}
```

## 🔄 Backup Strategy

### Automated Backup Script
```bash
#!/bin/bash
# backup_messages.sh

BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="messages_backup_${TIMESTAMP}.tar.gz"

echo "Creating backup..."

# Backup essential files
tar -czf "${BACKUP_DIR}/${BACKUP_FILE}" \
    app_enhanced.py \
    auth.py \
    email_service.py \
    email_templates/ \
    requirements.txt \
    .env \
    data/messages.db \
    logs/

# Keep only last 10 backups
cd "$BACKUP_DIR"
ls -t *.tar.gz | tail -n +11 | xargs -r rm

echo "Backup completed: ${BACKUP_FILE}"
```

## 🚀 Production Deployment Checklist

### Pre-Deployment
- [ ] Database schema created and initialized
- [ ] Email provider configured and tested
- [ ] Environment variables set in production
- [ ] SSL certificates configured (if using HTTPS)
- [ ] Firewall rules configured
- [ ] Monitoring and logging setup
- [ ] Backup strategy implemented

### Post-Deployment
- [ ] Service responding on correct port
- [ ] Health checks passing
- [ ] Email notifications working
- [ ] User registration/login functional
- [ ] Message creation and retrieval working
- [ ] Admin dashboard accessible

## 🛠️ Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check database file permissions
ls -la data/messages.db

# Reinitialize database if corrupted
rm data/messages.db
python -c "from auth import init_db; init_db()"
```

#### Email Service Not Working
```bash
# Check email configuration
curl -X GET http://localhost:5000/api/admin/email-settings \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test email connection manually
python -c "
from email_service import EmailService
service = EmailService()
result = service.test_connection()
print(result)
"
```

#### Authentication Issues
```bash
# Check session management
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Clear expired sessions
python -c "from auth import cleanup_expired_sessions; cleanup_expired_sessions()"
```

#### Performance Issues
```bash
# Check database indexes
sqlite3 data/messages.db ".schema"

# Monitor resource usage
top -p $(pgrep -f python3 | head -1)
htop
```

## 📚 Documentation

### API Documentation
Access interactive API documentation at:
- `http://localhost:5000` - Root endpoint with system info
- `http://localhost:5000/api/auth/me` - Test authentication

### User Documentation
- Registration guide with password requirements
- Login instructions with token management
- Message composition and reply guidelines
- Email notification preferences

### Admin Documentation
- Email provider setup instructions
- Message management workflow
- System configuration options
- Troubleshooting common issues

## 🎯 Next Steps

1. **Configure Email Provider**: Set up Gmail, Outlook, or custom SMTP
2. **Test Authentication**: Verify user registration and login flow
3. **Test Message Flow**: Send test messages and verify email notifications
4. **Monitor Performance**: Set up logging and monitoring for production
5. **Scale Infrastructure**: Consider load balancing for high traffic
6. **Security Audit**: Regular security reviews and updates

## 📞 Support

For issues and questions:
1. Check logs in `logs/` directory
2. Review this deployment guide
3. Test API endpoints individually
4. Verify email configuration with test endpoint
5. Check system requirements and dependencies

---

**System Status**: ✅ Ready for production deployment
**Last Updated**: Enhanced with comprehensive messaging features
