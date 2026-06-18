const Cors = require('cors');

// Initializing the cors middleware
const corsMiddleware = Cors({
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  origin: '*', // Allow all origins for dev/CORS-free execution
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// Global CORS handler to wrap endpoints
async function allowCors(req, res, handler) {
  // Ensure res.status and res.json are defined (Vercel helper polyfill fallback)
  if (typeof res.status !== 'function') {
    res.status = function (statusCode) {
      res.statusCode = statusCode;
      return res;
    };
  }
  if (typeof res.json !== 'function') {
    res.json = function (jsonData) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(jsonData));
      return res;
    };
  }

  await runMiddleware(req, res, corsMiddleware);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return handler(req, res);
}

module.exports = { allowCors };
