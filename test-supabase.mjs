import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

console.log('Testing connection to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  const dummyEmail = `test_${Date.now()}@gmail.com`
  console.log(`Attempting to sign up dummy user: ${dummyEmail}...`)
  
  const { data, error } = await supabase.auth.signUp({
    email: dummyEmail,
    password: 'securepassword123',
    options: {
      data: {
        score: 500,
        level: 10,
        energy: 100
      }
    }
  })

  if (error) {
    console.error('❌ Connection or Auth failed:', error.message)
    process.exit(1)
  } else {
    console.log('✅ Connection successful! Data sent to Supabase.')
    console.log('👤 Created test user:', data.user.email)
    console.log('🆔 User ID:', data.user.id)
    console.log('📊 Stored Game Metadata:', data.user.user_metadata)
  }
}

testConnection()
