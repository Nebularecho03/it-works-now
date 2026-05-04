const os = require('os');
const { detectSystemResources } = require('../docs/setup/scripts/detect-resources');

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
const scholarForgeAffinity = generateCpuAffinity(
  resources.websiteInstances, 
  resources.scholarForgeInstances, 
  resources.totalCores
);
const scholarsApiAffinity = generateCpuAffinity(
  resources.websiteInstances + resources.scholarForgeInstances,
  resources.scholarsApiInstances,
  resources.totalCores
);

module.exports = {
  apps: [
    {
      name: 'website-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/home/codecrafter/Documents/combined/apps/website',
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
      name: 'scholar-forge-frontend',
      script: 'node',
      args: 'server.cjs',
      cwd: '/home/codecrafter/Documents/combined/apps/scholars-forge/artifacts/scholar-forge',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production' },
      error_file: './logs/scholar-forge-error.log',
      out_file: './logs/scholar-forge-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      autorestart: true,
      max_memory_restart: resources.memoryPerInstance,
      cpu_affinity: scholarForgeAffinity
    },
    {
      name: 'scholars-api',
      script: 'npm',
      args: 'start',
      cwd: '/home/codecrafter/Documents/combined/apps/scholars-forge/artifacts/api-server',
      instances: resources.scholarsApiInstances,
      exec_mode: 'cluster',
      env: { NODE_ENV: 'production', PORT: 8081 },
      error_file: './logs/scholars-api-error.log',
      out_file: './logs/scholars-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      autorestart: true,
      max_memory_restart: resources.memoryPerInstance,
      cpu_affinity: scholarsApiAffinity
    },
    {
      name: 'website-backend',
      script: 'python3',
      args: 'server.py',
      cwd: '/home/codecrafter/Documents/combined/apps/website/backend',
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
      cwd: '/home/codecrafter/Documents/combined/apps/website/backend/go-services',
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
      cwd: '/home/codecrafter/Documents/combined/apps/website/backend/go-services',
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
      cwd: '/home/codecrafter/Documents/combined/apps/website/backend/go-services',
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
      cwd: '/home/codecrafter/Documents/combined/apps/website/backend/go-services',
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
