const { allowCors } = require('./_cors');
const { supabase } = require('./_supabase');
const { verifyAdminShield, hashPassword } = require('./_auth_shield');

async function handler(req, res) {
  const method = req.method;

  if (method === 'POST') {
    try {
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ error: 'Password is required.' });
      }

      // We verify the credentials by calling our unified auth shield.
      // We pass the raw password as the header value temporarily for initial verification.
      req.headers['x-admin-password'] = password;
      const auth = await verifyAdminShield(req);
      
      if (auth.success) {
        // Fetch the hash stored in database to return as the token
        const { data } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'admin_password_hash')
          .single();
        
        const storedHash = data.value.split(':')[1];
        return res.status(200).json({ success: true, token: storedHash });
      } else {
        return res.status(401).json({ success: false, error: 'Invalid credentials. Access Denied.' });
      }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (method === 'PUT') {
    try {
      // 1. Verify existing session first
      const auth = await verifyAdminShield(req);
      if (!auth.success) {
        return res.status(auth.status).json({ error: auth.error });
      }

      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and New password are required.' });
      }

      // 2. Fetch the current hash
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'admin_password_hash')
        .single();
      
      if (error || !data || !data.value) {
        return res.status(500).json({ error: 'Failed to retrieve current password config.' });
      }

      const [storedSalt, storedHash] = data.value.split(':');
      
      // Double check that currentPassword hashes to current storedHash
      const { hash: checkHash } = hashPassword(currentPassword, storedSalt);
      if (checkHash !== storedHash) {
        return res.status(400).json({ error: 'Current password is incorrect.' });
      }

      // 3. Hash and store new password
      const { salt: newSalt, hash: newHash } = hashPassword(newPassword);
      const dbValue = `${newSalt}:${newHash}`;

      const { error: updateError } = await supabase
        .from('settings')
        .upsert([{ key: 'admin_password_hash', value: dbValue }]);

      if (updateError) throw updateError;

      // Return the new hash as the token so the client updates its session token automatically
      return res.status(200).json({ success: true, token: newHash });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['POST', 'PUT']);
  return res.status(405).json({ error: `Method ${method} Not Allowed` });
}

module.exports = (req, res) => allowCors(req, res, handler);
