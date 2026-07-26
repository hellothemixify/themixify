/**
 * A cheap "is somebody signed in?" check for the marketing header.
 *
 * The header is on every page, and the obvious way to answer this — ask the
 * Supabase client — drags 68KB of SDK onto pages that have nothing to do with
 * accounts. That cost 25 points of mobile performance the last time it happened.
 *
 * @supabase/ssr keeps the session in a cookie, so the presence of that cookie
 * answers the question well enough to decide between showing "Sign in" and
 * showing an avatar. It is a hint, not an authorisation check, and the
 * difference matters: the cookie may be expired or invalid, and this function
 * cannot tell. Nothing is ever granted on the strength of it. The dashboard
 * verifies the session properly and redirects if it does not hold up, which is
 * the correct place for that to happen — on the server's terms, not the
 * browser's.
 */
export function hasSessionCookie(): boolean {
  if (typeof document === 'undefined') return false

  const ref = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').match(
    /^https:\/\/([a-z0-9]+)\.supabase\.co/,
  )?.[1]

  if (!ref) return false

  // The token is chunked across sb-<ref>-auth-token.0, .1, … when it is large,
  // so this matches the prefix rather than an exact name.
  return document.cookie.includes(`sb-${ref}-auth-token`)
}
