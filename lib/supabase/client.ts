import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser-side Supabase client.
 *
 * Safe to import into client components: it only ever carries the anon key,
 * and every table it can reach is protected by row-level security. Nothing here
 * is trusted by the database — the policies are.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  )
}

/** True when the project has been pointed at a real Supabase instance. */
export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
}
