// server.js - Zero-Dependency Local Dev Server for Dhanalakshmi Food Products
// Serves static frontend files and routes /api/* requests to Vercel serverless functions

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 5000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-password',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return;
  }

  // 1. ROUTE API REQUESTS
  if (pathname.startsWith('/api/')) {
    const apiName = pathname.replace('/api/', '');
    const apiFilePath = path.join(__dirname, 'api', `${apiName}.js`);
    
    if (fs.existsSync(apiFilePath)) {
      try {
        // Clear require cache for development hot-reloading
        delete require.cache[require.resolve(apiFilePath)];
        const handler = require(apiFilePath);
        
        // Mock Vercel/Express request parameters
        req.query = parsedUrl.query;
        
        let bodyData = '';
        req.on('data', chunk => {
          bodyData += chunk;
        });
        
        req.on('end', () => {
          try {
            req.body = bodyData ? JSON.parse(bodyData) : {};
          } catch (e) {
            req.body = bodyData;
          }
          
          // Mock Vercel response helper methods
          res.status = (statusCode) => {
            res.statusCode = statusCode;
            return res;
          };
          
          res.json = (jsonData) => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify(jsonData));
            return res;
          };
          
          // Execute serverless function
          handler(req, res);
        });
      } catch (err) {
        console.error(`Error executing API ${apiName}:`, err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify({ error: err.message }));
      }
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.end(JSON.stringify({ error: 'API route not found' }));
    }
    return;
  }

  // 2. SERVE STATIC FILES
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  const filePath = path.join(__dirname, pathname);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.statusCode = 404;
        res.end('File Not Found');
      } else {
        res.statusCode = 500;
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', contentType);
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(` Dhanalakshmi Food Products - Local Dev Server`);
  console.log(` Running at: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
