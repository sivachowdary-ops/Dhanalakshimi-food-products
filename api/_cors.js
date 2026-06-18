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
  await runMiddleware(req, res, corsMiddleware);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return handler(req, res);
}

module.exports = { allowCors };
