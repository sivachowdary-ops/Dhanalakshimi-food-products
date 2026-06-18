const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

let supabaseUrl = process.env.SUPABASE_URL;
let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (supabaseUrl) supabaseUrl = supabaseUrl.trim();
if (supabaseServiceKey) supabaseServiceKey = supabaseServiceKey.trim();

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from environment variables.");
}

let supabase;
try {
  supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co', 
    supabaseServiceKey || 'placeholder-key'
  );
} catch (err) {
  console.error("Failed to initialize Supabase client:", err);
  
  // Safe mock client fallback to prevent boot crashes, returning the error during query execution instead
  const mockQuery = () => Promise.resolve({ data: null, error: err });
  const mockChain = {
    select: () => mockChain,
    eq: () => mockChain,
    single: () => mockQuery(),
    order: () => mockQuery(),
    insert: () => mockChain,
    update: () => mockChain,
    delete: () => mockChain,
    upsert: () => mockChain
  };
  
  supabase = {
    from: () => mockChain
  };
}

module.exports = { supabase };
