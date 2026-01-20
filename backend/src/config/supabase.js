const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role (for backend operations)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Client for user-context operations (with anon key)
const supabaseClient = createClient(
  supabaseUrl, 
  process.env.SUPABASE_ANON_KEY
);

module.exports = { supabase, supabaseClient };