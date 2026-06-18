const { allowCors } = require('./_cors');
const { supabase } = require('./_supabase');

async function handler(req, res) {
  const method = req.method;

  if (method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*');
        
      if (error) throw error;
      
      // Convert setting key-value database rows to a single config object
      // Securely exclude adminPassword from public reads
      const settingsObject = {};
      data.forEach(row => {
        if (row.key !== 'adminPassword') {
          settingsObject[row.key] = row.value;
        }
      });
      
      return res.status(200).json(settingsObject);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ADMIN OPERATIONS SHIELD
  const targetPassword = process.env.ADMIN_PASSWORD;
  if (!targetPassword) {
    console.error("Configuration Error: ADMIN_PASSWORD environment variable is not configured on the server.");
    return res.status(500).json({ error: "Server Configuration Error: Admin operations are disabled." });
  }

  const adminPasswordHeader = req.headers['x-admin-password'];
  if (!adminPasswordHeader || adminPasswordHeader !== targetPassword) {
    return res.status(401).json({ error: 'Unauthorized: Admin credentials invalid.' });
  }

  if (method === 'POST' || method === 'PUT') {
    try {
      const updatedSettings = req.body;
      if (!updatedSettings || typeof updatedSettings !== 'object') {
        return res.status(400).json({ error: 'Invalid settings payload.' });
      }

      // Convert settings object keys into individual rows for upserting, filtering out adminPassword
      const upsertRows = Object.keys(updatedSettings)
        .filter(k => k !== 'adminPassword')
        .map(k => ({
          key: k,
          value: typeof updatedSettings[k] === 'string' ? updatedSettings[k] : JSON.stringify(updatedSettings[k])
        }));

      const { data, error } = await supabase
        .from('settings')
        .upsert(upsertRows)
        .select();

      if (error) throw error;
      return res.status(200).json({ success: true, count: data.length });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT']);
  return res.status(405).json({ error: `Method ${method} Not Allowed` });
}

module.exports = (req, res) => allowCors(req, res, handler);
