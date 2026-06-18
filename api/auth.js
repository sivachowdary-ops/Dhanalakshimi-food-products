const { allowCors } = require('./_cors');
const { supabase } = require('./_supabase');

async function handler(req, res) {
  const method = req.method;

  if (method === 'POST') {
    try {
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ error: 'Password is required.' });
      }

      // Read configured password from environment variables or default settings
      const targetPassword = process.env.ADMIN_PASSWORD || 'dhanalakshmi123';

      if (password === targetPassword) {
        // Return success and password-as-token for simplified verification on subsequent API requests
        return res.status(200).json({ success: true, token: targetPassword });
      } else {
        return res.status(401).json({ success: false, error: 'Invalid credentials. Access Denied.' });
      }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).json({ error: `Method ${method} Not Allowed` });
}

module.exports = (req, res) => allowCors(req, res, handler);
