import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

/**
 * Hands over the theme zip, once, to an install that is entitled to it.
 *
 * Entitlement is re-checked here rather than trusted from the update manifest.
 * A manifest can sit in a WordPress transient for twelve hours and a licence
 * can be revoked inside that window; checking at the moment of download is what
 * makes revocation mean something.
 *
 * The response is a redirect to a short-lived signed storage URL rather than a
 * proxied stream. The file never becomes a public URL, the link dies in a few
 * minutes, and we are not paying to push a megabyte through a Worker that has
 * nothing to contribute to it.
 */

const DENY = new NextResponse('Not authorised', {
  status: 403,
  headers: { 'cache-control': 'no-store' },
})

function normaliseSite(raw: string): string {
  const value = raw.trim().toLowerCase()
  return value
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/+$/, '')
}

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) return DENY

  const params = new URL(request.url).searchParams
  const key = (params.get('key') ?? '').trim().toUpperCase()
  const site = normaliseSite(params.get('site') ?? '')

  if (!key || !site) return DENY

  const supabase = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: check, error: checkError } = await supabase.rpc('license_check', {
    p_key: key,
    p_site: site,
    p_action: 'validate',
    p_meta: { source: 'download' },
  })

  if (checkError || !check || check.status !== 'active') return DENY

  const { data: release } = await supabase
    .from('releases')
    .select('version, download_url')
    .eq('is_latest', true)
    .maybeSingle()

  if (!release?.download_url) return DENY

  // The service role is required to sign a URL into a private bucket. It never
  // leaves this function and is never sent to a browser.
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!service) return DENY

  const admin = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: signed, error: signError } = await admin.storage
    .from('releases')
    .createSignedUrl(release.download_url, 300, {
      download: `themixify-${release.version}.zip`,
    })

  if (signError || !signed?.signedUrl) return DENY

  return NextResponse.redirect(signed.signedUrl, {
    status: 302,
    headers: { 'cache-control': 'no-store' },
  })
}
