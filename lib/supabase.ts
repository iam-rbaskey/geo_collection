import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';



// Service role client is needed to insert users into public tables if RLS is strict,
// but since we are handling auth via custom Next.js endpoints (or Supabase Auth),
// we will export a general client.
export const supabase = createClient(supabaseUrl, supabaseKey);
