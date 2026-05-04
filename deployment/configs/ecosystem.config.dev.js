// Development configuration - single instances, verbose logging
module.exports = {
  apps: [
    {
      name: 'website-frontend',
      script: 'npm',
      args: 'run dev',
      cwd: '/home/codecrafter/Documents/combined/website',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'development' },
      error_file: './logs/website-frontend-error.log',
      out_file: './logs/website-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      autorestart: true,
      max_memory_restart: '512M'
    },
    {
      name: 'scholar-forge-frontend',
      script: 'pnpm',
      args: 'dev',
      cwd: '/home/codecrafter/Documents/combined/Schoolars-work-bench/artifacts/scholar-forge',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'development' },
      error_file: './logs/scholar-forge-error.log',
      out_file: './logs/scholar-forge-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      autorestart: true,
      max_memory_restart: '256M'
    },
    {
      name: 'scholars-api',
      script: 'npm',
      args: 'start',
      cwd: '/home/codecrafter/Documents/combined/Schoolars-work-bench/artifacts/api-server',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'development', PORT: 8081 },
      error_file: './logs/scholars-api-error.log',
      out_file: './logs/scholars-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      autorestart: true,
      max_memory_restart: '256M'
    },
    {
      name: 'website-backend',
      script: 'python3',
      args: 'backend/server.py',
      cwd: '/home/codecrafter/Documents/combined/website',
      instances: 1,
      exec_mode: 'fork',
      env: { PYTHONUNBUFFERED: '1' },
      error_file: './logs/website-backend-error.log',
      out_file: './logs/website-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      autorestart: true,
      max_memory_restart: '512M'
    }
  ]
};
