const os = require('os');

function detectSystemResources() {
  const totalCores = os.cpus().length;
  const totalMemoryGB = os.totalmem() / (1024 * 1024 * 1024);
  const freeMemoryGB = os.freemem() / (1024 * 1024 * 1024);
  
  // Calculate optimal instance counts based on system resources
  const websiteInstances = Math.max(2, Math.floor(totalCores * 0.4));
  const scholarForgeInstances = Math.max(1, Math.floor(totalCores * 0.2));
  const scholarsApiInstances = Math.max(1, Math.floor(totalCores * 0.2));
  const pythonWorkers = Math.max(2, Math.floor(totalCores * 0.5));
  
  // Calculate memory limits based on available RAM
  const totalInstances = websiteInstances + scholarForgeInstances + scholarsApiInstances;
  const memoryPerInstance = Math.floor((totalMemoryGB * 0.6) / totalInstances) * 1024;
  
  const resources = {
    totalCores,
    totalMemoryGB: Math.floor(totalMemoryGB),
    freeMemoryGB: Math.floor(freeMemoryGB),
    websiteInstances,
    scholarForgeInstances,
    scholarsApiInstances,
    pythonWorkers,
    memoryPerInstance: `${memoryPerInstance}M`
  };
  
  console.log('Detected System Resources:', JSON.stringify(resources, null, 2));
  return resources;
}

module.exports = { detectSystemResources };

// Run detection if called directly
if (require.main === module) {
  detectSystemResources();
}
