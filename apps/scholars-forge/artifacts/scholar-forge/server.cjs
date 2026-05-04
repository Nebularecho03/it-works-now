const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4500;
const PUBLIC_DIR = path.join(__dirname, 'dist/public');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  // Remove /scholars prefix if present (for local testing)
  let urlPath = req.url;
  if (urlPath.startsWith('/scholars')) {
    urlPath = urlPath.substring('/scholars'.length);
  }
  
  // Default to index.html for root or SPA routes
  if (urlPath === '/' || !path.extname(urlPath)) {
    urlPath = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, urlPath);

  if (!fs.existsSync(filePath)) {
    // Fallback to index.html for SPA routing
    const indexPath = path.join(PUBLIC_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(indexPath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
    return;
  }

  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Scholar Forge static server running on port ${PORT}`);
  console.log(`Serving files from: ${PUBLIC_DIR}`);
});
