import { createClient } from '@supabase/supabase-js'

const url = process.env.EXPO_PUBLIC_SUPABASE_URL as string
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string

// Initialize the Supabase client
if (!url || !key) {
  throw new Error('Supabase URL or ANON KEY is missing in environment variables')
}

// Initialize the Supabase client
export const supabase = createClient(url, key)