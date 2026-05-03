import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('Testing Supabase Connection...')
  const { data, error } = await supabase.from('products').select('*')
  if (error) {
    console.error('Error fetching products:', error.message)
    return
  }
  console.log('Products found:', data?.length)
  if (data?.length > 0) {
    console.log(data[0])
  }
}

testConnection()
