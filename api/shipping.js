const { allowCors } = require('./_cors');
const { supabase } = require('./_supabase');
const { verifyAdminShield } = require('./_auth_shield');

async function handler(req, res) {
  const method = req.method;

  if (method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('shipping_rates')
        .select('*')
        .order('state', { ascending: true });
        
      if (error) throw error;
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ADMIN OPERATIONS SHIELD
  const auth = await verifyAdminShield(req);
  if (!auth.success) {
    return res.status(auth.status).json({ error: auth.error });
  }

  if (method === 'PUT' || method === 'POST') {
    try {
      const { state, rate } = req.body;
      if (!state || rate === undefined) {
        return res.status(400).json({ error: 'Missing state name or rate.' });
      }

      // Upsert (insert or update on primary key conflict)
      const { data, error } = await supabase
        .from('shipping_rates')
        .upsert({ state, rate: parseFloat(rate) })
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'POST']);
  return res.status(405).json({ error: `Method ${method} Not Allowed` });
}

module.exports = (req, res) => allowCors(req, res, handler);
