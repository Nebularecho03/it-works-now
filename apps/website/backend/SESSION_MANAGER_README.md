# Flask Session Manager for Admin Panel

A lightweight Flask session management system that integrates with existing SQLite database and provides secure auto-logout functionality for Next.js admin interfaces.

## 🚀 Features

- **Secure Authentication**: PBKDF2 password hashing with existing SQLite user database
- **In-Memory Sessions**: Fast session tracking with automatic cleanup
- **Auto-Logout**: Configurable session timeout (default: 5 minutes)
- **Rate Limiting**: 5 login attempts per minute per IP address
- **CORS Support**: Proper headers for Next.js integration
- **Audit Logging**: All authentication events logged to existing database
- **Health Monitoring**: Built-in health check endpoint

## 📋 Requirements

- Python 3.8+
- Existing SQLite database with `users` table
- Node.js 18+ (for Next.js frontend)

## 🛠️ Installation

### 1. Setup Python Environment

```bash
cd apps/website/backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file or set environment variables:

```bash
# Flask Configuration
FLASK_PORT=5001
SESSION_TIMEOUT=300  # 5 minutes in seconds
SQLITE_PATH=./data/users.db
ALLOWED_ORIGIN=http://localhost:3000

# Next.js Configuration (set in Next.js environment)
NEXT_PUBLIC_FLASK_SESSION_URL=http://localhost:5001
```

### 3. Database Setup

Ensure your SQLite database has the required tables:

```sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    actor TEXT NOT NULL,
    summary TEXT NOT NULL,
    metadata TEXT,
    ip_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);
```

## 🚀 Quick Start

### Development Mode

```bash
# Use the provided development script
./run-dev.sh

# Or start manually
python admin_session_manager.py
```

### Production Mode with Docker

```bash
docker-compose up -d
```

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description |
|---------|-----------|-------------|
| GET | `/login` | Serve login page |
| POST | `/api/admin/login` | Authenticate user |
| POST | `/api/admin/logout` | Destroy session |
| GET | `/api/admin/check-session` | Validate session |
| POST | `/api/admin/keep-alive` | Update session activity |

### System

| Method | Endpoint | Description |
|---------|-----------|-------------|
| GET | `/api/admin/health` | Health check |

## 🔐 Security Features

### Session Management
- **Session IDs**: Cryptographically secure using `secrets.token_hex(32)`
- **In-Memory Storage**: Fast access with automatic cleanup
- **Timeout**: Auto-expiry after configurable period
- **Thread Safety**: Lock-based concurrent access protection

### Rate Limiting
- **Per-IP Limits**: 5 attempts per minute
- **Memory-Based**: No database dependency
- **Automatic Reset**: Counter resets after window expires

### Authentication
- **Password Hashing**: PBKDF2-SHA256 with existing format support
- **Session Validation**: Headers-based session verification
- **Audit Logging**: All events logged with IP and timestamp

## 🌐 Integration with Next.js

### 1. Session Provider Setup

```tsx
import { SessionProvider } from "@/components/admin/session-provider";

function App() {
  return (
    <SessionProvider>
      <YourAdminComponents />
    </SessionProvider>
  );
}
```

### 2. Route Protection

```tsx
import { SessionGuard } from "@/components/admin/session-guard";

function AdminPage() {
  return (
    <SessionGuard>
      <ProtectedContent />
    </SessionGuard>
  );
}
```

### 3. Session Usage

```tsx
import { useSession } from "@/components/admin/session-provider";

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useSession();
  
  // Use session data
}
```

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:5001/api/admin/health
```

Response:
```json
{
  "status": "healthy",
  "active_sessions": 3,
  "session_timeout": 300
}
```

### Session Statistics

The system provides real-time session statistics:
- Active session count
- Session timeout configuration
- System health status

## 🧩 Configuration Options

| Variable | Default | Description |
|----------|----------|-------------|
| `FLASK_PORT` | 5001 | Flask server port |
| `SESSION_TIMEOUT` | 300 | Session timeout in seconds |
| `SQLITE_PATH` | ./data/users.db | Path to SQLite database |
| `ALLOWED_ORIGIN` | http://localhost:3000 | CORS allowed origin |
| `RATE_LIMIT_ATTEMPTS` | 5 | Max login attempts per window |
| `RATE_LIMIT_WINDOW` | 60 | Rate limit window in seconds |

## 🐳 Docker Deployment

### Development

```bash
docker-compose -f docker-compose.yml up
```

### Production

```bash
# Build and run in background
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f
```

### Environment-Specific Configuration

Create `.env.production` for production settings:

```bash
FLASK_PORT=5001
SESSION_TIMEOUT=1800  # 30 minutes
ALLOWED_ORIGIN=https://yourdomain.com
SQLITE_PATH=/app/data/users.db
```

## 🛡️ Security Best Practices

1. **Environment Variables**: Never commit secrets to version control
2. **HTTPS**: Use SSL/TLS in production
3. **Database Security**: Proper file permissions on SQLite database
4. **Session Security**: Regular cleanup of expired sessions
5. **Rate Limiting**: Adjust based on your threat model
6. **Monitoring**: Monitor health endpoint and audit logs

## 🚨 Troubleshooting

### Common Issues

**Session Not Found**
- Check session ID is being sent in `X-Session-ID` header
- Verify session hasn't expired (check timeout setting)
- Ensure Flask server is running and accessible

**CORS Errors**
- Verify `ALLOWED_ORIGIN` matches your Next.js URL
- Check for trailing slashes in origin URLs
- Ensure preflight requests are handled

**Database Connection Errors**
- Verify SQLite database file exists and is writable
- Check file permissions on database directory
- Ensure database schema matches requirements

### Debug Mode

Enable debug logging:

```bash
export FLASK_ENV=development
python admin_session_manager.py
```

## 📝 Development

### Adding New Endpoints

1. Add route with `@app.route()` decorator
2. Use `@require_session` for protected endpoints
3. Access user data via `request.current_user`
4. Add audit logging for important actions

### Session Data Structure

```python
{
    'user_id': int,
    'username': str,
    'display_name': str,
    'role': str,
    'ip_address': str,
    'created_at': datetime,
    'last_activity': datetime
}
```

## 📄 License

This project is part of the admin system integration. See main project license for details.
