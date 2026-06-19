const { supabase } = require('./_supabase');
const crypto = require('crypto');

// Helper to hash password using standard Node.js crypto module
function hashPassword(password, salt) {
  const finalSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, finalSalt, 1000, 64, 'sha512').toString('hex');
  return { salt: finalSalt, hash };
}

// Unified auth verification function
async function verifyAdminShield(req) {
  const tokenHeader = req.headers['x-admin-password'];
  if (!tokenHeader) {
    return { success: false, status: 401, error: 'Unauthorized: Missing admin credentials.' };
  }

  // 1. Fetch password hash from DB
  let storedHashRow = null;
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'admin_password_hash')
      .single();
    
    if (data && data.value) {
      storedHashRow = data.value;
    }
  } catch (e) {
    console.error("DB error fetching password hash", e);
  }

  // 2. If hash is not in DB yet (first load onboarding)
  if (!storedHashRow) {
    // Bootstrap from env var or default "admin"
    const targetPassword = process.env.ADMIN_PASSWORD || 'admin';
    const { salt, hash } = hashPassword(targetPassword);
    const dbValue = `${salt}:${hash}`;
    
    try {
      await supabase
        .from('settings')
        .upsert([{ key: 'admin_password_hash', value: dbValue }]);
      console.log("Successfully seeded initial admin password hash into Supabase settings.");
    } catch (e) {
      console.error("Failed to seed initial password hash to Supabase", e);
    }
    
    storedHashRow = dbValue;
  }

  // 3. Verify token
  // The token sent by the client is the computed_hash (the hashed password)
  const parts = storedHashRow.split(':');
  if (parts.length !== 2) {
    return { success: false, status: 500, error: 'Server Configuration Error: Invalid password format in database.' };
  }
  
  const [storedSalt, storedHash] = parts;
  
  // Verify token matches stored hash (subsequent queries send computed_hash)
  if (tokenHeader === storedHash) {
    return { success: true };
  }

  // Also support verifying plaintext password directly (e.g. initial login / direct raw inputs)
  const { hash: inputHash } = hashPassword(tokenHeader, storedSalt);
  if (inputHash === storedHash) {
    return { success: true };
  }

  return { success: false, status: 401, error: 'Unauthorized: Admin credentials invalid.' };
}

module.exports = { verifyAdminShield, hashPassword };
