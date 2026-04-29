import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fuolplbkorvkqczcuipz.supabase.co';
const supabaseKey = 'sb_publishable_oCjx_jIHlgy7Mq5eZqP80Q_03Lcads7';



// Service role client is needed to insert users into public tables if RLS is strict,
// but since we are handling auth via custom Next.js endpoints (or Supabase Auth),
// we will export a general client.
export const supabase = createClient(supabaseUrl, supabaseKey);
