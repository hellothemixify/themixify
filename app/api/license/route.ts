import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sign, type LicensePayload } from '@/lib/license/sign'

// Deliberately not `runtime = 'edge'`. OpenNext already runs the whole app in
// workerd with nodejs_compat, so the edge runtime buys nothing here and its
// route handling is not supported by the adapter — it returned a bare 500 on
// every request with no log line to explain it.
export const dynamic = 'force-dynamic'

/**
 * The endpoint every Themixify install talks to.
 *
 * It decides nothing. The rule lives in one security-definer function in the
 * database (see supabase/schema.sql), which the anon key may call and which can
 * do nothing else — so this public endpoint never holds the ability to read a
 * customer's email or order history in order to answer a question about a
 * licence key. All this route does is normalise the input, pass it through, and
 * sign what comes back.
 *
 * Signing is the part that matters. Without it the theme cannot tell our answer
 * from one produced by a hosts-file entry pointing at a script on the same box,
 * and the whole system is decorative.
 *
 * Always 200, even for a rejection. A 403 would let a bypass be built out of a
 * firewall rule: block the endpoint, get an error, and if the theme treated "no
 * answer" as "carry on" the check is worthless. The theme decides on the
 * signature and the payload, never on the HTTP status.
 */

const VALIDITY_SECONDS = 60 * 60 * 24 * 3 // three days between forced check-ins

/**
 * Normalise a site URL so that http/https, www, a trailing slash and casing do
 * not each consume a separate activation slot. A customer who moves to HTTPS
 * should not silently lose one of the sites they paid for.
 */
function normaliseSite(raw: unknown): string {
  if (typeof raw !== 'string' || !raw.trim()) return ''
  const trimmed = raw.trim()
  try {
    const url = new URL(trimmed)
    const host = url.hostname.replace(/^www\./i, '').toLowerCase()
    const path = url.pathname.replace(/\/+$/, '')
    return host + path
  } catch {
    return trimmed
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/+$/, '')
  }
}

export async function POST(request: Request) {
  const seed = process.env.LICENSE_SIGNING_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const nowSeconds = Math.floor(Date.now() / 1000)

  let body: Record<string, unknown> = {}
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    body = {}
  }

  const action = String(body.action ?? '')
  const key = String(body.key ?? '').trim().toUpperCase()
  const site = normaliseSite(body.site)
  const nonce = String(body.nonce ?? '')

  // An unsigned payload is worse than no payload: the theme might mistake it
  // for an answer. Say the service is unavailable and let it use its cache.
  if (!seed || !url || !anon) {
    return NextResponse.json(
      { error: 'signing_unavailable' },
      { status: 503, headers: { 'cache-control': 'no-store' } },
    )
  }

  const respond = async (
    status: LicensePayload['status'],
    message: string,
    extra: Partial<LicensePayload> = {},
  ) => {
    const payload: LicensePayload = {
      key,
      site,
      status,
      plan: extra.plan ?? null,
      sites_allowed: extra.sites_allowed ?? 0,
      sites_used: extra.sites_used ?? 0,
      issued_at: nowSeconds,
      expires_at: nowSeconds + VALIDITY_SECONDS,
      nonce,
      message,
    }

    return NextResponse.json(
      { payload, signature: await sign(payload, seed) },
      { headers: { 'cache-control': 'no-store' } },
    )
  }

  const supabase = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await supabase.rpc('license_check', {
    p_key: key,
    p_site: site,
    p_action: action,
    p_meta: {
      wp: typeof body.wp === 'string' ? body.wp : null,
      version: typeof body.version === 'string' ? body.version : null,
      name: typeof body.name === 'string' ? body.name.slice(0, 200) : null,
    },
  })

  if (error || !data) {
    // A database failure is our problem, not the customer's. Reporting it as
    // "unavailable" lets the theme fall back to its cached answer and keep a
    // paying customer's site working; reporting it as "invalid" would take
    // their site's features down because of an outage at our end.
    return NextResponse.json(
      { error: 'check_unavailable' },
      { status: 503, headers: { 'cache-control': 'no-store' } },
    )
  }

  const result = data as {
    status: LicensePayload['status']
    plan: string | null
    sites_allowed: number
    sites_used: number
    message: string
  }

  return respond(result.status, result.message, {
    plan: result.plan,
    sites_allowed: result.sites_allowed,
    sites_used: result.sites_used,
  })
}
