/**
 * Signing for licence responses.
 *
 * The theme has to be able to tell a real answer from a forged one, and the
 * usual shortcut — a shared secret and an HMAC — cannot do that here. A shared
 * secret would have to ship inside every copy of the theme, and the moment one
 * customer opens the file they can sign "your licence is valid" themselves and
 * point the theme at their own server with a hosts entry.
 *
 * So responses are signed with Ed25519. The private key exists only as a Worker
 * secret; the theme carries the public key and can verify but never sign. That
 * asymmetry is the whole security argument: forging a valid response requires
 * the private key, and the private key is not in anything we hand out.
 *
 * What this does not do is stop somebody deleting the check from the PHP
 * altogether. Nothing does. See supabase/schema.sql for the honest version of
 * that argument.
 */

/** Everything the theme is told, and everything that gets signed. */
export type LicensePayload = {
  /** The key that was presented. */
  key: string
  /** The site the answer is for. Binding this stops a valid response for one
   *  domain being replayed on another. */
  site: string
  status:
    | 'active'
    | 'revoked'
    | 'blocked'
    | 'unknown'
    | 'limit_reached'
    | 'released'
  plan: string | null
  sites_allowed: number
  sites_used: number
  /** Seconds since the epoch. The theme rejects anything too old to be a fresh
   *  answer, which bounds how long a captured response stays useful. */
  issued_at: number
  /** When the theme should ask again. */
  expires_at: number
  /** Echoed back from the request, so a replayed capture is detectable. */
  nonce: string
  message: string
}

/**
 * Canonical serialisation.
 *
 * Both sides must agree byte for byte on what was signed, so the field order is
 * fixed here rather than left to whatever JSON.stringify does with the object it
 * is handed. PHP's json_encode and JavaScript's JSON.stringify also disagree
 * about escaping, which is why the theme verifies against this exact string
 * rather than re-encoding the parsed object.
 */
export function canonical(payload: LicensePayload): string {
  return JSON.stringify({
    key: payload.key,
    site: payload.site,
    status: payload.status,
    plan: payload.plan,
    sites_allowed: payload.sites_allowed,
    sites_used: payload.sites_used,
    issued_at: payload.issued_at,
    expires_at: payload.expires_at,
    nonce: payload.nonce,
    message: payload.message,
  })
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

/**
 * Sign a payload with the Ed25519 key held in LICENSE_SIGNING_KEY.
 *
 * The secret is the 32-byte seed, base64 encoded, wrapped in PKCS#8 here so
 * Web Crypto will import it. Returns base64 — the theme decodes it the same way.
 */
export async function sign(payload: LicensePayload, seedBase64: string): Promise<string> {
  const seed = base64ToBytes(seedBase64)

  if (seed.length !== 32) {
    throw new Error('LICENSE_SIGNING_KEY must be a base64 32-byte Ed25519 seed')
  }

  // Minimal PKCS#8 wrapper for an Ed25519 private key: the fixed 16-byte
  // prefix that identifies the algorithm, then the seed.
  const pkcs8 = new Uint8Array(48)
  pkcs8.set(
    [
      0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70,
      0x04, 0x22, 0x04, 0x20,
    ],
    0,
  )
  pkcs8.set(seed, 16)

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    pkcs8,
    { name: 'Ed25519' },
    false,
    ['sign'],
  )

  const signature = await crypto.subtle.sign(
    'Ed25519',
    cryptoKey,
    new TextEncoder().encode(canonical(payload)),
  )

  return bytesToBase64(new Uint8Array(signature))
}
