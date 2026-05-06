# Flask Session Manager Integration Guide

## Overview

This guide documents the complete Flask Session Manager integration with the existing SQLite + Next.js admin system. The integration provides secure auto-logout functionality while maintaining resource efficiency.

## Architecture

### Flask Layer (Session Manager)
- **File**: `admin_session_manager.py`
- **Port**: 5001 (configurable via `FLASK_PORT`)
- **Purpose**: Session validation and auto-logout endpoints
- **Features**: 
  - In-memory session tracking with cleanup thread
  - Rate limiting for login attempts (5 per minute per IP)
  - Integration with existing SQLite user database
  - CORS support for Next.js integration

### Next.js Layer (Admin Interface)
- **Files**: 
  - `components/admin/session-provider.tsx` - Session management context
  - `components/admin/session-guard.tsx` - Authentication HOC
- **Purpose**: Client-side session management and keep-alive functionality
- **Features**:
  - Session validation HOC for admin pages
  - Client-side keep-alive JavaScript timer (every 2 minutes)
  - Auto-redirect to Flask login on session expiration
  - Graceful handling of session expiration

## Storage Strategy

### SQLite Database (Existing)
- **User credentials**: `users` table with PBKDF2-SHA256 password hashing
- **Permissions**: Role-based access control
- **Audit trails**: `audit_log` table for all authentication events
- **Location**: `data/users.db`

### In-Memory Storage (New)
- **Active sessions**: Thread-safe dict mapping `session_id` → session data
- **Rate limiting**: In-memory dict for login attempts per IP
- **Cleanup**: Background thread removes expired sessions every 60 seconds

## API Endpoints

### Authentication Endpoints

#### `POST /api/admin/login`
**Purpose**: Authenticate user and create session
**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```
**Response**:
```json
{
  "authenticated": true,
  "user": {
    "username": "string",
    "displayName": "string",
    "role": "string",
    "mfaConfigured": false
  },
  "sessionId": "hex_string",
  "sessionTimeout": 300
}
```
**Headers**: `X-Session-ID: <session_id>`

#### `GET /api/admin/check-session`
**Purpose**: Validate existing session
**Headers**: `X-Session-ID: <session_id>`
**Response**:
```json
{
  "authenticated": true,
  "user": { /* user data */ },
  "sessionTimeout": 300
}
```

#### `POST /api/admin/keep-alive`
**Purpose**: Update session activity timestamp
**Headers**: `X-Session-ID: <session_id>`
**Response**:
```json
{
  "status": "session updated"
}
```

#### `POST /api/admin/logout`
**Purpose**: Destroy session
**Headers**: `X-Session-ID: <session_id>`
**Response**:
```json
{
  "authenticated": false
}
```

### Utility Endpoints

#### `GET /api/admin/health`
**Purpose**: Health check and system status
**Response**:
```json
{
  "status": "healthy",
  "active_sessions": 0,
  "session_timeout": 300
}
```

#### `GET /login`
**Purpose**: Serve login page (HTML)
**Response**: HTML login page with cache-control headers

## Security Features

### Session Management
- **Session IDs**: Cryptographically random using `secrets.token_hex(32)`
- **Timeout**: Configurable default 300 seconds (5 minutes)
- **Cleanup**: Automatic removal of expired sessions every 60 seconds
- **Thread Safety**: All session operations use threading locks

### Password Security
- **Hashing**: PBKDF2-SHA256 with 240,000 iterations
- **Compatibility**: Maintains compatibility with existing password hashes
- **Storage**: Secure hash storage in SQLite database

### Rate Limiting
- **Implementation**: Sliding window algorithm
- **Limits**: 5 login attempts per minute per IP address
- **Storage**: In-memory with automatic cleanup
- **Response**: HTTP 429 "Too Many Requests" when limit exceeded

### CORS and Headers
- **Allowed Origin**: Configurable via `ALLOWED_ORIGIN` environment variable
- **Cache Control**: `no-store, no-cache, must-revalidate` for all auth routes
- **Security Headers**: Proper cache headers to prevent session leakage

## Environment Configuration

### Required Environment Variables
```bash
# Flask Configuration
FLASK_PORT=5001                                    # Flask server port
ALLOWED_ORIGIN=http://localhost:3000               # CORS allowed origin

# Session Configuration
SESSION_TIMEOUT=300                                # Auto-logout timeout (seconds)

# Rate Limiting
RATE_LIMIT_ATTEMPTS=5                              # Max attempts per window
RATE_LIMIT_WINDOW=60                               # Time window (seconds)

# Database
SQLITE_PATH=data/users.db                          # Path to SQLite database
```

### Next.js Environment Variables
```bash
NEXT_PUBLIC_FLASK_SESSION_URL=http://localhost:5001  # Flask session manager URL
NEXT_PUBLIC_API_URL=http://localhost:5001           # API base URL
```

## Deployment Setup

### Docker Configuration
The system includes Docker configuration for both Flask and Next.js:

#### `docker-compose.yml`
```yaml
services:
  flask-session-manager:
    build:
      context: .
      dockerfile: Dockerfile.flask
    ports:
      - "5001:5001"
    environment:
      - FLASK_PORT=5001
      - SESSION_TIMEOUT=300
      - SQLITE_PATH=/app/data/users.db
      - ALLOWED_ORIGIN=http://localhost:3000
    volumes:
      - ./data:/app/data
      - ./login.html:/app/login.html
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5001/api/admin/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nextjs-admin:
    build:
      context: ../
      dockerfile: Dockerfile.nextjs
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_FLASK_SESSION_URL=http://localhost:5001
      - NEXT_PUBLIC_API_URL=http://localhost:5001
    depends_on:
      - flask-session-manager
```

### Port Allocation
- **Flask Session Manager**: Port 5001
- **Next.js Admin Interface**: Port 3000
- **Existing Admin Server**: Port 8000 (unchanged)

## Integration Points

### Database Integration
- **Users Table**: Uses existing `users` table with PBKDF2 password hashes
- **Audit Log**: Continues using existing `audit_log` table
- **Compatibility**: Full backward compatibility with existing authentication

### Frontend Integration
- **Session Provider**: React context provides session state to all admin components
- **Session Guard**: HOC wraps admin pages to enforce authentication
- **Keep-Alive**: Automatic pings every 2 minutes to maintain session
- **Auto-Redirect**: Seamless redirect to Flask login on session expiration

### API Integration
- **Session Headers**: All API calls include `X-Session-ID` header
- **Error Handling**: Graceful handling of 401 responses with automatic redirect
- **State Management**: Centralized session state management

## Performance Metrics

### Target Performance
- **Login Response Time**: < 100ms
- **Session Validation**: < 50ms
- **Memory Usage**: < 50MB for session tracking
- **Session Cleanup**: Zero session leakage with proper cleanup
- **Graceful Restart**: Handles Flask restarts without data loss

### Resource Optimization
- **Memory**: Only active sessions stored in memory
- **CPU**: Cleanup thread runs every 60 seconds (minimal overhead)
- **Network**: Single keep-alive ping every 2 minutes per active session
- **Storage**: No additional database writes for session tracking

## Usage Examples

### Basic Authentication Flow
```javascript
// Login
const response = await fetch('/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'password' })
});

// Session ID is automatically stored in localStorage
// All subsequent API calls include the session ID
```

### Protecting Admin Pages
```tsx
// Wrap admin pages with SessionGuard
import { SessionGuard } from '@/components/admin/session-guard';

function AdminPage() {
  return (
    <SessionGuard>
      <AdminContent />
    </SessionGuard>
  );
}
```

### Session Management
```tsx
// Use session context in components
import { useSession } from '@/components/admin/session-provider';

function AdminComponent() {
  const { user, isAuthenticated, logout } = useSession();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome, {user.displayName}</div>;
}
```

## Testing

### Integration Tests
The system includes comprehensive integration tests in `integration-test.py`:

```bash
# Run integration tests
python integration-test.py
```

### Test Coverage
- ✅ Health check endpoint
- ✅ Login authentication
- ✅ Session validation
- ✅ Keep-alive functionality
- ✅ Logout and cleanup
- ✅ Rate limiting

### Manual Testing
1. Start Flask session manager: `python admin_session_manager.py`
2. Start Next.js development server: `npm run dev`
3. Navigate to `http://localhost:3000/admin`
4. Test login with valid credentials
5. Verify session timeout and auto-logout

## Troubleshooting

### Common Issues

#### "Too many login attempts" Error
- **Cause**: Rate limiting triggered by failed login attempts
- **Solution**: Wait 60 seconds for rate limit to reset
- **Prevention**: Implement proper error handling in login forms

#### Session Expiration
- **Cause**: Inactivity longer than `SESSION_TIMEOUT`
- **Solution**: Implement keep-alive pings or increase timeout
- **Note**: Keep-alive pings are automatically sent every 2 minutes

#### CORS Errors
- **Cause**: Mismatch between `ALLOWED_ORIGIN` and Next.js URL
- **Solution**: Ensure environment variables match exactly
- **Example**: `ALLOWED_ORIGIN=http://localhost:3000`

#### Database Connection Issues
- **Cause**: Incorrect `SQLITE_PATH` or missing database
- **Solution**: Verify database path and permissions
- **Check**: Ensure `data/users.db` exists and is readable

### Debug Mode
Enable debug logging by setting environment variable:
```bash
export FLASK_ENV=development
python admin_session_manager.py
```

### Health Monitoring
Monitor system health via:
```bash
curl http://localhost:5001/api/admin/health
```

## Migration Guide

### From Existing Admin System
1. **Deploy Flask Session Manager**: Run on port 5001
2. **Update Environment Variables**: Set `NEXT_PUBLIC_FLASK_SESSION_URL`
3. **Wrap Admin Pages**: Add `SessionGuard` to existing admin routes
4. **Test Integration**: Verify login flow and session management
5. **Monitor Performance**: Check memory usage and response times

### Database Migration
- **No Changes Required**: Uses existing database schema
- **Backward Compatibility**: Existing authentication methods continue to work
- **Gradual Migration**: Can be deployed alongside existing system

## Security Considerations

### Session Security
- **Secure Session IDs**: 32-byte cryptographically random tokens
- **Timeout Protection**: Automatic logout after inactivity
- **IP Tracking**: Sessions bound to client IP addresses
- **Memory Storage**: Sessions lost on server restart (security feature)

### Network Security
- **HTTPS Recommended**: Use HTTPS in production
- **CORS Configuration**: Restrict to trusted origins only
- **Rate Limiting**: Prevents brute force attacks
- **Audit Logging**: All authentication events logged

### Data Protection
- **Password Hashing**: PBKDF2-SHA256 with high iteration count
- **No Session Persistence**: Sessions not stored in database
- **Cache Headers**: Prevents browser caching of sensitive data
- **Secure Headers**: Proper security headers on all responses

## Conclusion

The Flask Session Manager integration provides a robust, secure, and efficient session management solution for the existing SQLite + Next.js admin system. The implementation maintains full backward compatibility while adding modern security features and improved user experience through automatic session management.

The system is production-ready with comprehensive testing, Docker deployment support, and detailed documentation for maintenance and troubleshooting.
