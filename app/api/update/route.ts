import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

/**
 * The update manifest a licensed install asks for.
 *
 * Called by the customer's web server, not their browser — there is no session
 * and no cookie, so the licence key in the query string is the whole
 * authorisation. That is the right shape for this: the thing being protected is
 * a zip file, and the thing doing the fetching is a machine.
 *
 * An unlicensed or expired install gets 204 rather than 403. There is no error
 * to display, nothing to log in wp-admin, and nothing to prod at — as far as
 * the site is concerned, there simply is no update. A refusal invites someone
 * to work out what it would take to turn it into an acceptance.
 */

const NOTHING = new NextResponse(null, {
  status: 204,
  headers: { 'cache-control': 'no-store' },
})

/** Same normalisation the licence endpoint uses, so a site matches itself. */
function normaliseSite(raw: string): string {
  const value = raw.trim().toLowerCase()
  const withoutScheme = value.replace(/^https?:\/\//, '')
  const withoutWww = withoutScheme.replace(/^www\./, '')
  return withoutWww.replace(/\/+$/, '')
}

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) return NOTHING

  const params = new URL(request.url).searchParams
  const key = (params.get('key') ?? '').trim().toUpperCase()
  const site = normaliseSite(params.get('site') ?? '')

  if (!key || !site) return NOTHING

  const supabase = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // The same function the licence check uses, in validate mode. Reusing it
  // means entitlement is decided in exactly one place — a second copy of this
  // rule would eventually disagree with the first, and the disagreement would
  // be discovered by a customer.
  const { data: check, error: checkError } = await supabase.rpc('license_check', {
    p_key: key,
    p_site: site,
    p_action: 'validate',
    p_meta: { source: 'update' },
  })

  if (checkError || !check || check.status !== 'active') return NOTHING

  const { data: release, error: releaseError } = await supabase
    .from('releases')
    .select('version, headline, notes, download_url, released_at')
    .eq('is_latest', true)
    .maybeSingle()

  if (releaseError || !release?.version || !release.download_url) return NOTHING

  const origin = new URL(request.url).origin

  return NextResponse.json(
    {
      version: release.version,
      // Not the storage URL. This points back at us so the download is
      // authorised at the moment it is fetched rather than at the moment the
      // manifest was built — a manifest can sit in a WordPress transient for
      // twelve hours, and a licence can be revoked inside that window.
      package: `${origin}/api/download?key=${encodeURIComponent(key)}&site=${encodeURIComponent(site)}`,
      url: `${origin}/changelog`,
      requires: '6.0',
      requires_php: '7.4',
      changelog: release.headline ?? '',
    },
    { headers: { 'cache-control': 'no-store' } },
  )
}
