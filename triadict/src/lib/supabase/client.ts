import { createBrowserClient } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function createClient() {
  if (!url || !key || url.includes('your-project')) {
    throw new Error("Dev mode: Supabase not configured")
  }
  return createBrowserClient(url, key)
}
