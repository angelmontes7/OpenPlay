import { createClient } from '@supabase/supabase-js'
import dotenv from "dotenv";

dotenv.config();

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

// Initialize the Supabase client
if (!url || !key) {
  throw new Error('Supabase URL or ANON KEY is missing in environment variables')
}

// Initialize the Supabase client
export const supabase = createClient(url, key)