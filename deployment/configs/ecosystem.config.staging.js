const os = require('os');
const { detectSystemResources } = require('./scripts/detect-resources');

const resources = detectSystemResources();

// Staging configuration - moderate instances, production-like memory limits
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
      cwd: '/home/codecrafter/Documents/combined/website',
      instances: Math.max(1, Math.floor(resources.websiteInstances * 0.5)),
      exec_mode: 'cluster',
      env: { NODE_ENV: 'staging', PORT: 3000 },
      error_file: './logs/website-frontend-error.log',
      out_file: './logs/website-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      autorestart: true,
      max_memory_restart: resources.memoryPerInstance,
      cpu_affinity: websiteAffinity
    },
    {
      name: 'scholar-forge-frontend',
      script: 'npm',
      args: 'run preview',
      cwd: '/home/codecrafter/Documents/combined/Schoolars-work-bench/artifacts/scholar-forge',
      instances: Math.max(1, Math.floor(resources.scholarForgeInstances * 0.5)),
      exec_mode: 'cluster',
      env: { NODE_ENV: 'staging', PORT: 4500 },
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
      cwd: '/home/codecrafter/Documents/combined/Schoolars-work-bench/artifacts/api-server',
      instances: Math.max(1, Math.floor(resources.scholarsApiInstances * 0.5)),
      exec_mode: 'cluster',
      env: { NODE_ENV: 'staging', PORT: 8081 },
      error_file: './logs/scholars-api-error.log',
      out_file: './logs/scholars-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      autorestart: true,
      max_memory_restart: resources.memoryPerInstance,
      cpu_affinity: scholarsApiAffinity
    },
    {
      name: 'website-backend',
      script: 'gunicorn',
      args: `--workers ${Math.max(1, Math.floor(resources.pythonWorkers * 0.5))} --bind 0.0.0.0:8000 backend.server:app`,
      cwd: '/home/codecrafter/Documents/combined/website',
      interpreter: 'python3',
      instances: 1,
      exec_mode: 'fork',
      env: { PYTHONUNBUFFERED: '1' },
      error_file: './logs/website-backend-error.log',
      out_file: './logs/website-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      autorestart: true,
      max_memory_restart: `${Math.floor(resources.totalMemoryGB * 0.25)}G`
    }
  ]
};
