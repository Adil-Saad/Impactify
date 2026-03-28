import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = typeof window !== 'undefined' 
    ? '/supabase' 
    : process.env.NEXT_PUBLIC_SUPABASE_URL!

  return createBrowserClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
