import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

type CookieToSet = { name: string; value: string; options?: CookieOptions }

/**
 * Server-side Supabase client, bound to the request's cookies so the session
 * travels with server components and route handlers.
 *
 * Still the anon key: authorisation is enforced by row-level security in the
 * database, not by which key the caller happens to hold. The service-role key
 * is never imported into this application.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }: CookieToSet) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Called from a Server Component, where cookies are read-only.
            // Session refresh is handled by middleware, so this is safe to skip.
          }
        },
      },
    },
  )
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
}
