// Zero-dependency static file server. Node built-ins only.
//
// Usage:  node server.js [port]          (default 3002)
//
// ES modules need a real HTTP origin, so opening index.html from the file
// system will not work. Serve it from here instead. To view from another
// device, pair it with a Cloudflare quick tunnel the way the other projects
// in this folder do:
//   cloudflared.exe tunnel --url http://localhost:3002

const http = require('http');
const os = require('os');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.argv[2]) || 3002;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';

  const filePath = path.normalize(path.join(ROOT, reqPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found: ' + reqPath);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  W17 Teardown');
  console.log('  On this PC      http://localhost:' + PORT);
  // Bound to all interfaces, so anything on the same wifi can reach it.
  for (const list of Object.values(os.networkInterfaces())) {
    for (const n of list || []) {
      if (n.family === 'IPv4' && !n.internal) {
        console.log('  On your phone   http://' + n.address + ':' + PORT);
      }
    }
  }
  console.log('');
  console.log('  Phone not connecting? Windows Firewall will ask to allow');
  console.log('  Node the first time. Allow it on private networks.');
  console.log('  Ctrl+C to stop.');
  console.log('');
});
