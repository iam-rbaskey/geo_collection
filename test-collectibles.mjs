import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = 'https://fuolplbkorvkqczcuipz.supabase.co';
const supabaseKey = 'sb_publishable_oCjx_jIHlgy7Mq5eZqP80Q_03Lcads7';

console.log('Testing connection to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  const { data, error } = await supabase.from('collectibles').select('*')
  if (error) {
    console.error('❌ Query failed:', error)
  } else {
    console.log('✅ Query successful! Count:', data?.length)
    console.log('Data:', data?.slice(0, 2))
  }
}
testConnection()
