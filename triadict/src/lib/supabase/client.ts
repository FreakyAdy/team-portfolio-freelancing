import { createBrowserClient } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function createClient() {
  if (!url || !key || url.includes('your-project')) {
    return null as unknown as ReturnType<typeof createBrowserClient>
  }
  return createBrowserClient(url, key)
}
