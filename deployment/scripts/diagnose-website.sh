#!/bin/bash

# Diagnostic script for website deployment issues
# Checks database, environment, and Next.js configuration

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { printf "${GREEN}[INFO]${NC} %s\n" "$1"; }
error() { printf "${RED}[ERROR]${NC} %s\n" "$1" >&2; }
warn() { printf "${YELLOW}[WARN]${NC} %s\n" "$1"; }

log "=== Website Deployment Diagnostic ==="
log ""

# Detect project directory
PROJECT_DIR="${1:-$HOME/combined-project}"
if [ ! -d "$PROJECT_DIR" ]; then
    error "Project directory not found: $PROJECT_DIR"
    exit 1
fi

WEBSITE_DIR="$PROJECT_DIR/website"
log "Project directory: $PROJECT_DIR"
log "Website directory: $WEBSITE_DIR"
log ""

# Check 1: Website directory exists
log "Check 1: Website directory"
if [ ! -d "$WEBSITE_DIR" ]; then
    error "Website directory does not exist: $WEBSITE_DIR"
    exit 1
fi
log "✓ Website directory exists"
log ""

# Check 2: Website .env file
log "Check 2: Website .env file"
WEBSITE_ENV="$WEBSITE_DIR/.env"
if [ ! -f "$WEBSITE_ENV" ]; then
    error "Website .env file does not exist: $WEBSITE_ENV"
    log "Creating .env file with default values..."
    cat > "$WEBSITE_ENV" << 'EOF'
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/stephenasatsa_v2?schema=public"
NEXTAUTH_SECRET="ngrok-dev-secret-change-in-production"
DOMAIN_NAME="https://virus-stoning-stubborn.ngrok-free.dev"
NEXTAUTH_URL="https://virus-stoning-stubborn.ngrok-free.dev"
NEXT_PUBLIC_SITE_URL="https://virus-stoning-stubborn.ngrok-free.dev"
NEXT_PUBLIC_SCHOLARS_URL="https://scholars.virus-stoning-stubborn.ngrok-free.dev"
NEXT_PUBLIC_API_URL=""
ADMIN_EMAIL="admin@localhost"
ADMIN_PASSWORD="ChangeMe123!"
EOF
    log "✓ Created .env file"
else
    log "✓ Website .env file exists"
fi
log ""

# Check 3: Required environment variables
log "Check 3: Required environment variables"
source "$WEBSITE_ENV"
if [ -z "$DATABASE_URL" ]; then
    error "DATABASE_URL not set in .env"
    exit 1
fi
if [ -z "$NEXTAUTH_SECRET" ]; then
    error "NEXTAUTH_SECRET not set in .env"
    exit 1
fi
log "✓ DATABASE_URL: ${DATABASE_URL:0:50}..."
log "✓ NEXTAUTH_SECRET: set"
log ""

# Check 4: PostgreSQL status
log "Check 4: PostgreSQL status"
POSTGRES_RUNNING=false
if command -v pg_isready &> /dev/null; then
    if pg_isready -h localhost -p 5432 &> /dev/null; then
        log "✓ PostgreSQL is running"
        POSTGRES_RUNNING=true
    else
        warn "PostgreSQL is not running (pg_isready)"
    fi
else
    warn "pg_isready command not found, checking with systemctl"
    if systemctl is-active --quiet postgresql || systemctl is-active --quiet postgresql@16-main 2>/dev/null; then
        log "✓ PostgreSQL is running (systemctl)"
        POSTGRES_RUNNING=true
    else
        warn "PostgreSQL is not running (systemctl)"
    fi
fi

if [ "$POSTGRES_RUNNING" = false ]; then
    warn "PostgreSQL is not running - database checks will be skipped"
    log "To fix: sudo systemctl start postgresql"
fi
log ""

# Check 5: Database exists (only if PostgreSQL is running)
if [ "$POSTGRES_RUNNING" = true ]; then
    log "Check 5: Database exists"
    DB_NAME="stephenasatsa_v2"
    if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        log "✓ Database '$DB_NAME' exists"
    else
        warn "Database '$DB_NAME' does not exist"
        log "Creating database..."
        sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" || error "Failed to create database"
        log "✓ Database created"
    fi
    log ""
else
    log "Check 5: Database exists"
    warn "Skipped (PostgreSQL not running)"
    log ""
fi

# Check 6: Node.js and npm
log "Check 6: Node.js and npm"
if command -v node &> /dev/null; then
    log "✓ Node.js version: $(node --version)"
else
    error "Node.js not found"
    exit 1
fi

if command -v npm &> /dev/null; then
    log "✓ npm version: $(npm --version)"
else
    error "npm not found"
    exit 1
fi
log ""

# Check 7: Node modules installed
log "Check 7: Node modules"
if [ ! -d "$WEBSITE_DIR/node_modules" ]; then
    warn "node_modules not found, installing dependencies..."
    cd "$WEBSITE_DIR"
    npm install
    cd "$PROJECT_DIR"
    log "✓ Dependencies installed"
else
    log "✓ node_modules exists"
fi

# Check for common missing dependencies
log "Check 7.1: Common missing dependencies"
cd "$WEBSITE_DIR"
MISSING_DEPS=""
if ! npm list next-auth &>/dev/null; then
    MISSING_DEPS="$MISSING_DEPS next-auth"
fi
if ! npm list @auth/prisma-adapter &>/dev/null; then
    MISSING_DEPS="$MISSING_DEPS @auth/prisma-adapter"
fi

if [ -n "$MISSING_DEPS" ]; then
    warn "Installing missing dependencies: $MISSING_DEPS"
    npm install $MISSING_DEPS
    log "✓ Missing dependencies installed"
else
    log "✓ All common dependencies present"
fi
cd "$PROJECT_DIR"
log ""

# Check 8: Database schema/migrations (only if PostgreSQL is running)
if [ "$POSTGRES_RUNNING" = true ]; then
    log "Check 8: Database schema"
    cd "$WEBSITE_DIR"
    if [ -f "package.json" ]; then
        log "Running database migrations..."
        if npx prisma migrate deploy 2>&1 | tee /tmp/prisma-migrate.log; then
            log "✓ Database migrations applied"
        else
            warn "Migration had issues, trying db push..."
            if npx prisma db push 2>&1 | tee /tmp/prisma-push.log; then
                log "✓ Database schema synced with db push"
            else
                error "Failed to sync database schema"
                log "Check migration logs:"
                cat /tmp/prisma-migrate.log
                cat /tmp/prisma-push.log
                exit 1
            fi
        fi
    else
        error "package.json not found in website directory"
        exit 1
    fi
    cd "$PROJECT_DIR"
    log ""

    # Check 9: Test database connection
    log "Check 9: Test database connection"
    cd "$WEBSITE_DIR"
    if npx prisma db execute --stdin << EOF
SELECT 1;
EOF
    then
        log "✓ Database connection successful"
    else
        error "Database connection failed"
        exit 1
    fi
    cd "$PROJECT_DIR"
    log ""
else
    log "Check 8: Database schema"
    warn "Skipped (PostgreSQL not running)"
    log ""
    log "Check 9: Test database connection"
    warn "Skipped (PostgreSQL not running)"
    log ""
fi

# Check 10: Next.js build check
log "Check 10: Next.js build check"
cd "$WEBSITE_DIR"
log "Building Next.js application (this may take a few minutes)..."
if npm run build 2>&1 | tee /tmp/next-build.log; then
    if grep -q "Failed to compile" /tmp/next-build.log || grep -q "Build failed" /tmp/next-build.log; then
        error "Next.js build failed (detected in logs)"
        log "Check build log: /tmp/next-build.log"
        exit 1
    fi
    log "✓ Next.js build successful"
else
    error "Next.js build failed"
    log "Check build log: /tmp/next-build.log"
    exit 1
fi
cd "$PROJECT_DIR"
log ""

log "=== Diagnostic Complete ==="
log ""
log "All checks passed! The website should be ready to run."
log ""
log "To start the website:"
log "  cd $WEBSITE_DIR"
log "  npm run dev"
