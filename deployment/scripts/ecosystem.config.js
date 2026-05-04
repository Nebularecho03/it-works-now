const os = require('os');
const path = require('path');

// Get project root directory
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const { detectSystemResources } = require(path.join(PROJECT_ROOT, 'docs/setup/scripts/detect-resources'));

const resources = detectSystemResources();

// Generate CPU affinity arrays dynamically
function generateCpuAffinity(startCore, count, totalCores) {
  const affinity = [];
  for (let i = 0; i < count; i++) {
    affinity.push((startCore + i) % totalCores);
  }
  return affinity;
}

const websiteAffinity = generateCpuAffinity(0, resources.websiteInstances, resources.totalCores);

module.exports = {
  apps: [
    {
      name: 'website-frontend',
      script: 'npm',
      args: 'start',
      cwd: path.join(PROJECT_ROOT, 'apps/website'),
      instances: resources.websiteInstances,
      exec_mode: 'cluster',
      env: { NODE_ENV: 'production', PORT: 3000 },
      error_file: './logs/website-frontend-error.log',
      out_file: './logs/website-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      autorestart: true,
      max_memory_restart: resources.memoryPerInstance,
      cpu_affinity: websiteAffinity
    },
    {
      name: 'website-backend',
      script: 'python3',
      args: 'server.py',
      cwd: path.join(PROJECT_ROOT, 'apps/website/backend'),
      instances: 1,
      exec_mode: 'fork',
      env: { PYTHONUNBUFFERED: '1' },
      error_file: './logs/website-backend-error.log',
      out_file: './logs/website-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      autorestart: true,
      max_memory_restart: `${Math.floor(resources.totalMemoryGB * 0.3)}G`
    },
    {
      name: 'go-password-service',
      script: './password-service/password-service',
      cwd: path.join(PROJECT_ROOT, 'apps/website/backend/go-services'),
      instances: 1,
      exec_mode: 'fork',
      env: { PORT: 9001 },
      error_file: './logs/go-password-service-error.log',
      out_file: './logs/go-password-service-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      autorestart: true,
      max_memory_restart: '512M'
    },
    {
      name: 'go-telemetry-service',
      script: './telemetry-service/telemetry-service',
      cwd: path.join(PROJECT_ROOT, 'apps/website/backend/go-services'),
      instances: 1,
      exec_mode: 'fork',
      env: { PORT: 9002 },
      error_file: './logs/go-telemetry-service-error.log',
      out_file: './logs/go-telemetry-service-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      autorestart: true,
      max_memory_restart: '512M'
    },
    {
      name: 'go-image-service',
      script: './image-service/image-service',
      cwd: path.join(PROJECT_ROOT, 'apps/website/backend/go-services'),
      instances: 1,
      exec_mode: 'fork',
      env: { PORT: 9003 },
      error_file: './logs/go-image-service-error.log',
      out_file: './logs/go-image-service-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      autorestart: true,
      max_memory_restart: '1G'
    },
    {
      name: 'go-worker-service',
      script: './worker-service/worker-service',
      cwd: path.join(PROJECT_ROOT, 'apps/website/backend/go-services'),
      instances: 1,
      exec_mode: 'fork',
      env: { PORT: 9004, MAX_WORKERS: 10 },
      error_file: './logs/go-worker-service-error.log',
      out_file: './logs/go-worker-service-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      autorestart: true,
      max_memory_restart: '512M'
    }
  ]
};
