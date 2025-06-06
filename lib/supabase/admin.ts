import { env } from '@/env.mjs';
import { createClient } from '@supabase/supabase-js';
const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export { supabaseAdmin };
