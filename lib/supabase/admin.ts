import { createClient } from '@supabase/supabase-js'

/**
 * Server-only Supabase client that bypasses row-level security.
 *
 * The licence endpoints have to look up a key that belongs to a customer who is
 * not signed in — there is no session, only a WordPress install presenting a
 * string — so the anon client cannot do the job: every policy on `licenses` is
 * written around auth.uid(), and correctly so.
 *
 * This must never be imported into a client component. The secret key it uses
 * can read and write every row in the database, and it has no NEXT_PUBLIC_
 * prefix precisely so that a stray import fails at build time instead of
 * shipping it to a browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !secret) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set — the licence API cannot run without it',
    )
  }

  return createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
