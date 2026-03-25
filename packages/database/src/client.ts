import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Public client (RLS policies apply)
// @ts-ignore - Bypass Database generic type issues
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// Admin client (bypasses RLS - server-side only)
export function createAdminClient() {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!
  
  // @ts-ignore - Bypass Database generic type issues
  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}