'use client'

/**
 * Every database call the application makes, in one file.
 *
 * Components never talk to Supabase directly. They import a named function
 * from here, which means the entire data surface of the product is auditable in
 * a single scroll — you can see exactly what the app reads, what it writes, and
 * what it never touches. It also means a schema change has exactly one place to
 * land.
 *
 * The matching database objects live in supabase/schema.sql, which is likewise
 * a single runnable file. Run that once and everything below works.
 *
 * Every function returns a discriminated result rather than throwing, because
 * these are called from event handlers and a rejected promise in a form submit
 * is a blank screen with no explanation.
 */

import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

/* ==========================================================================
   TYPES
   ========================================================================== */

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; data?: undefined }

export type Profile = {
  id: string
  email: string
  full_name: string | null
  role: 'user' | 'admin'
  country: string | null
  created_at: string
  last_active_at: string | null
  /** Signing up does not grant access; somebody approves the account by hand. */
  approval_status: 'pending' | 'approved' | 'suspended'
  approved_at: string | null
  /** Runs from approval rather than signup — see approve_account() in the schema. */
  trial_ends_at: string | null
  phone: string | null
}

export type License = {
  id: string
  license_key: string
  user_id: string
  plan_id: string
  plan_name: string
  sites_allowed: number
  sites_used: number
  status: 'active' | 'revoked' | 'expired'
  created_at: string
  notes: string | null
}

export type Activation = {
  id: string
  license_id: string
  site_url: string
  site_name: string | null
  status: 'active' | 'released'
  activated_at: string
  last_check_at: string | null
}

export type Order = {
  id: string
  user_id: string
  plan_id: string
  amount_cents: number
  currency: string
  status: 'pending' | 'paid' | 'refunded' | 'failed'
  provider: string | null
  provider_ref: string | null
  created_at: string
}

export type Release = {
  id: string
  version: string
  released_at: string
  headline: string
  notes: string | null
  download_url: string | null
  is_latest: boolean
}

export type AdminOverview = {
  total_users: number
  active_users: number
  total_licenses: number
  active_licenses: number
  /** Counted apart from paid licences — see admin_overview() in the schema. */
  trial_licenses: number
  total_activations: number
  revenue_cents: number
  orders_paid: number
  new_users_30d: number
  revenue_30d_cents: number
  plan_mix: { plan_id: string; plan_name: string; count: number }[]
  signup_series: { day: string; count: number }[]
}

const NOT_CONFIGURED =
  'The database is not connected yet. Add your Supabase URL and anon key to .env.local.'

/** Normalise anything thrown or returned by Supabase into a readable string. */
function toMessage(error: unknown, fallback: string): string {
  if (!error) return fallback
  if (typeof error === 'string') return error
  if (typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) return message
  }
  return fallback
}

function guard<T>(): Result<T> | null {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: NOT_CONFIGURED }
  }
  return null
}

/* ==========================================================================
   AUTH
   ========================================================================== */

export async function signUp(input: {
  email: string
  password: string
  fullName: string
  phone?: string
}): Promise<Result<{ needsConfirmation: boolean }>> {
  const blocked = guard<{ needsConfirmation: boolean }>()
  if (blocked) return blocked

  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    // The profile row is created by a database trigger, not by the client, so
    // a user can never exist in auth without a matching profile. The phone
    // travels in user metadata and the trigger copies it across — activation
    // happens over WhatsApp, so an account without a number is unreachable.
    options: {
      data: { full_name: input.fullName, phone: input.phone?.trim() || null },
    },
  })

  if (error) return { ok: false, error: toMessage(error, 'Could not create the account.') }
  return { ok: true, data: { needsConfirmation: !data.session } }
}

export async function signIn(input: {
  email: string
  password: string
}): Promise<Result<null>> {
  const blocked = guard<null>()
  if (blocked) return blocked

  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword(input)
  if (error) return { ok: false, error: toMessage(error, 'Those details did not match.') }
  return { ok: true, data: null }
}

/**
 * Send the confirmation email again.
 *
 * The first one gets filtered, deleted by accident, or simply never arrives, and
 * without this the only way out is to try signing up again — which fails,
 * because the account already exists. That dead end is a support ticket every
 * single time.
 */
export async function resendConfirmation(email: string): Promise<Result<null>> {
  const blocked = guard<null>()
  if (blocked) return blocked

  const supabase = createClient()
  const { error } = await supabase.auth.resend({ type: 'signup', email })
  if (error) return { ok: false, error: toMessage(error, 'Could not resend the email.') }
  return { ok: true, data: null }
}

export async function signOut(): Promise<Result<null>> {
  const blocked = guard<null>()
  if (blocked) return blocked

  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) return { ok: false, error: toMessage(error, 'Could not sign out.') }
  return { ok: true, data: null }
}

export async function requestPasswordReset(email: string): Promise<Result<null>> {
  const blocked = guard<null>()
  if (blocked) return blocked

  const supabase = createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // /reset-password, not /login. The link carries a one-time recovery
    // session, and the only thing that session is good for is setting a new
    // password — dropping the visitor on the sign-in form would ask them for
    // the very password they just told us they cannot remember.
    redirectTo:
      typeof window !== 'undefined'
        ? `${window.location.origin}/reset-password`
        : undefined,
  })
  if (error) return { ok: false, error: toMessage(error, 'Could not send the reset email.') }
  return { ok: true, data: null }
}

/**
 * Set a new password for whoever the current session belongs to.
 *
 * Called from the reset page, where the session came from the emailed recovery
 * link, and safe to call from a signed-in account screen later — Supabase
 * applies it to the caller's own user and nobody else's.
 */
/**
 * A short-lived download link for a published build.
 *
 * The bucket is private and the row-level policy decides who may read it —
 * approved, and either licensed or inside the trial. That check happens in the
 * database, so a link cannot be produced for somebody who is not entitled to
 * one, whatever the browser thinks. Sixty seconds is plenty for a click and
 * short enough that a URL pasted into a group chat is dead before anyone
 * follows it.
 */
export async function getDownloadUrl(objectPath: string): Promise<Result<string>> {
  const blocked = guard<string>()
  if (blocked) return blocked

  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from('releases')
    .createSignedUrl(objectPath, 60)

  if (error || !data?.signedUrl) {
    return {
      ok: false,
      error: toMessage(
        error,
        'That download is not available on your account. A licence or an active trial is needed.',
      ),
    }
  }

  return { ok: true, data: data.signedUrl }
}

export async function updatePassword(password: string): Promise<Result<null>> {
  const blocked = guard<null>()
  if (blocked) return blocked

  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { ok: false, error: toMessage(error, 'Could not update the password.') }
  return { ok: true, data: null }
}

/**
 * Whether a usable session exists right now.
 *
 * The reset page needs to know the difference between "the recovery link
 * worked" and "the link was already used or has expired", and those two look
 * identical until the session is checked.
 */
export async function hasSession(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  const { data } = await createClient().auth.getSession()
  return Boolean(data.session)
}

export async function getCurrentProfile(): Promise<Result<Profile | null>> {
  const blocked = guard<Profile | null>()
  if (blocked) return blocked

  const supabase = createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return { ok: true, data: null }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', auth.user.id)
    .maybeSingle()

  if (error) return { ok: false, error: toMessage(error, 'Could not load your profile.') }
  return { ok: true, data: (data as Profile) ?? null }
}

export async function updateProfile(input: {
  full_name?: string
  country?: string
}): Promise<Result<null>> {
  const blocked = guard<null>()
  if (blocked) return blocked

  const supabase = createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return { ok: false, error: 'You are not signed in.' }

  const { error } = await supabase.from('profiles').update(input).eq('id', auth.user.id)
  if (error) return { ok: false, error: toMessage(error, 'Could not save your details.') }
  return { ok: true, data: null }
}

/* ==========================================================================
   LICENCES — customer side
   ========================================================================== */

export async function getMyLicenses(): Promise<Result<License[]>> {
  const blocked = guard<License[]>()
  if (blocked) return blocked

  const supabase = createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return { ok: true, data: [] }

  // Filtered explicitly rather than left to row-level security. The policy on
  // licences also grants administrators every row — which is right for the
  // admin screens and wrong here, where it meant an owner opening "My licences"
  // saw customers' keys listed as their own. RLS decides what you *may* read;
  // it cannot express what this page *means*.
  const { data, error } = await supabase
    .from('licenses_with_usage')
    .select('*')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false })

  if (error) return { ok: false, error: toMessage(error, 'Could not load your licences.') }
  return { ok: true, data: (data ?? []) as License[] }
}

export async function getActivations(licenseId: string): Promise<Result<Activation[]>> {
  const blocked = guard<Activation[]>()
  if (blocked) return blocked

  const supabase = createClient()
  const { data, error } = await supabase
    .from('license_activations')
    .select('*')
    .eq('license_id', licenseId)
    .eq('status', 'active')
    .order('activated_at', { ascending: false })

  if (error) return { ok: false, error: toMessage(error, 'Could not load activations.') }
  return { ok: true, data: (data ?? []) as Activation[] }
}

/**
 * Release a site slot so the licence can be moved to a different domain.
 * Deliberately a soft release — the row is kept so an audit trail survives.
 */
export async function releaseActivation(activationId: string): Promise<Result<null>> {
  const blocked = guard<null>()
  if (blocked) return blocked

  const supabase = createClient()
  const { error } = await supabase
    .from('license_activations')
    .update({ status: 'released' })
    .eq('id', activationId)

  if (error) return { ok: false, error: toMessage(error, 'Could not release that site.') }
  return { ok: true, data: null }
}

export async function getMyOrders(): Promise<Result<Order[]>> {
  const blocked = guard<Order[]>()
  if (blocked) return blocked

  const supabase = createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return { ok: false, error: toMessage(error, 'Could not load your orders.') }
  return { ok: true, data: (data ?? []) as Order[] }
}

/* ==========================================================================
   RELEASES / DOWNLOADS
   ========================================================================== */

export async function getReleases(limit = 20): Promise<Result<Release[]>> {
  const blocked = guard<Release[]>()
  if (blocked) return blocked

  const supabase = createClient()
  const { data, error } = await supabase
    .from('releases')
    .select('*')
    .order('released_at', { ascending: false })
    .limit(limit)

  if (error) return { ok: false, error: toMessage(error, 'Could not load releases.') }
  return { ok: true, data: (data ?? []) as Release[] }
}

/* ==========================================================================
   ADMIN — overview
   ========================================================================== */

/**
 * One round trip for the whole admin overview.
 *
 * The aggregation happens in Postgres rather than by pulling every row into the
 * browser and counting there, so the screen stays fast at a hundred thousand
 * users and never leaks rows the caller is not entitled to see.
 */
export async function getAdminOverview(): Promise<Result<AdminOverview>> {
  const blocked = guard<AdminOverview>()
  if (blocked) return blocked

  const supabase = createClient()
  const { data, error } = await supabase.rpc('admin_overview')

  if (error) return { ok: false, error: toMessage(error, 'Could not load the overview.') }
  return { ok: true, data: data as AdminOverview }
}

/* ==========================================================================
   ADMIN — users
   ========================================================================== */

export type AdminUserRow = Profile & {
  license_count: number
  activation_count: number
  total_paid_cents: number
}

export async function adminListUsers(input?: {
  search?: string
  limit?: number
}): Promise<Result<AdminUserRow[]>> {
  const blocked = guard<AdminUserRow[]>()
  if (blocked) return blocked

  const supabase = createClient()
  let query = supabase
    .from('admin_user_rows')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(input?.limit ?? 200)

  const search = input?.search?.trim()
  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error) return { ok: false, error: toMessage(error, 'Could not load users.') }
  return { ok: true, data: (data ?? []) as AdminUserRow[] }
}

export async function adminSetUserRole(
  userId: string,
  role: 'user' | 'admin',
): Promise<Result<null>> {
  const blocked = guard<null>()
  if (blocked) return blocked

  const supabase = createClient()
  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)
  if (error) return { ok: false, error: toMessage(error, 'Could not change that role.') }
  return { ok: true, data: null }
}

/**
 * Upload a build and record it as the latest.
 *
 * Two steps that have to both happen: the file into the private bucket, then
 * the row. The row is written by a database function that also clears the old
 * `is_latest`, because doing that by hand is the step that gets forgotten.
 *
 * The upload goes first. A release row pointing at a file that is not there
 * would show customers a download button that 404s, which is worse than not
 * showing the release at all.
 */
export async function publishRelease(input: {
  version: string
  headline: string
  notes: string
  file: File
}): Promise<Result<string>> {
  const blocked = guard<string>()
  if (blocked) return blocked

  const supabase = createClient()
  const path = `themixify-${input.version}.zip`

  const { error: uploadError } = await supabase.storage
    .from('releases')
    .upload(path, input.file, { upsert: true, contentType: 'application/zip' })

  if (uploadError) {
    return { ok: false, error: toMessage(uploadError, 'Could not upload that file.') }
  }

  const { data, error } = await supabase.rpc('publish_release', {
    p_version: input.version,
    p_headline: input.headline,
    p_notes: input.notes,
    p_object_path: path,
  })

  if (error) return { ok: false, error: toMessage(error, 'Uploaded, but could not publish it.') }
  return { ok: true, data: data as string }
}

/* ==========================================================================
   ADMIN — accounts, approval and money
   ========================================================================== */

/** One row per account: who they are, what they bought, what they have paid. */
export type AdminAccount = {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: 'user' | 'admin'
  approval_status: 'pending' | 'approved' | 'suspended'
  approved_at: string | null
  trial_ends_at: string | null
  created_at: string
  last_active_at: string | null
  downloads_enabled: boolean
  license_id: string | null
  license_key: string | null
  plan_id: string | null
  license_status: string | null
  expires_at: string | null
  price_cents: number
  paid_cents: number
  sites_allowed: number
  /** Active activations on this licence — how many sites the key is really on. */
  sites_used: number
  /** owner never counts as revenue; partial is paid > 0 but short of the price. */
  /** `trial` and `none` are not owners: a trial is free by design and an
   *  account with no licence has no financial state at all. */
  payment_state: 'owner' | 'paid' | 'partial' | 'unpaid' | 'trial' | 'none'
  /** `owner` outranks the rest: an owner holds no licence and is on no trial,
   *  and neither fact says anything about whether they can use the product. */
  access_state: 'owner' | 'licensed' | 'trial' | 'trial_expired' | 'revoked' | 'none'
}

export type AdminRevenue = {
  total_paid_cents: number
  total_quoted_cents: number
  outstanding_cents: number
  accounts: number
  owners: number
  paid: number
  partial: number
  unpaid: number
  pending: number
  on_trial: number
  trial_expired: number
  licensed: number
}

export async function adminListAccounts(search = ''): Promise<Result<AdminAccount[]>> {
  const blocked = guard<AdminAccount[]>()
  if (blocked) return blocked

  const supabase = createClient()
  const { data, error } = await supabase.rpc('admin_list_accounts', { p_search: search })

  if (error) return { ok: false, error: toMessage(error, 'Could not load accounts.') }
  return { ok: true, data: (data ?? []) as AdminAccount[] }
}

export async function adminRevenue(): Promise<Result<AdminRevenue>> {
  const blocked = guard<AdminRevenue>()
  if (blocked) return blocked

  const supabase = createClient()
  const { data, error } = await supabase.rpc('admin_revenue')

  if (error) return { ok: false, error: toMessage(error, 'Could not load revenue.') }
  return { ok: true, data: data as AdminRevenue }
}

/** The plans an administrator can put somebody on. */
export const ASSIGNABLE_PLANS = [
  { id: 'none', label: 'No licence' },
  { id: 'trial', label: '7-day trial' },
  { id: 'single', label: 'Single Site' },
  { id: 'five', label: '5 Sites' },
  { id: 'ten', label: '10 Sites' },
  { id: 'agency', label: '100 Sites' },
] as const

/**
 * Put an account on a plan, creating the licence if it does not have one.
 *
 * This is the only thing that issues a key. Approval does not, deliberately:
 * approval means "a real person we have spoken to", a licence means "this
 * person is entitled to the product", and they are not the same claim.
 */
export async function adminAssignPlan(
  userId: string,
  planId: string,
  trialDays = 7,
): Promise<Result<null>> {
  const blocked = guard<null>()
  if (blocked) return blocked

  const supabase = createClient()
  const { error } = await supabase.rpc('assign_plan', {
    p_user_id: userId,
    p_plan_id: planId,
    p_trial_days: trialDays,
  })

  if (error) return { ok: false, error: toMessage(error, 'Could not change that plan.') }
  return { ok: true, data: null }
}

/** Show or hide the Downloads page for one account. */
export async function adminSetDownloads(
  userId: string,
  enabled: boolean,
): Promise<Result<null>> {
  const blocked = guard<null>()
  if (blocked) return blocked

  const supabase = createClient()
  const { error } = await supabase.rpc('set_downloads_enabled', {
    p_user_id: userId,
    p_enabled: enabled,
  })

  if (error) return { ok: false, error: toMessage(error, 'Could not change that.') }
  return { ok: true, data: null }
}

export async function adminDeleteAccount(userId: string): Promise<Result<null>> {
  const blocked = guard<null>()
  if (blocked) return blocked

  const supabase = createClient()
  const { error } = await supabase.rpc('delete_account', { p_user_id: userId })

  if (error) return { ok: false, error: toMessage(error, 'Could not delete that account.') }
  return { ok: true, data: null }
}

/** What the signed-in customer's own dashboard is allowed to know about itself. */
export async function getMyAccount(): Promise<
  Result<{
    downloads_enabled: boolean
    approval_status: string
    access_state: string
    trial_ends_at: string | null
  } | null>
> {
  const blocked = guard<null>()
  if (blocked) return blocked as never

  const supabase = createClient()
  const { data, error } = await supabase.rpc('my_account')

  if (error) return { ok: false, error: toMessage(error, 'Could not load your account.') }
  return { ok: true, data: data ?? null }
}

/** Approve a pending account. Does not issue a licence — see adminAssignPlan. */
export async function adminApproveAccount(
  userId: string,
  trialDays = 7,
): Promise<Result<null>> {
  const blocked = guard<null>()
  if (blocked) return blocked

  const supabase = createClient()
  const { error } = await supabase.rpc('approve_account', {
    p_user_id: userId,
    p_trial_days: trialDays,
  })

  if (error) return { ok: false, error: toMessage(error, 'Could not approve that account.') }
  return { ok: true, data: null }
}

export async function adminSetAccountStatus(
  userId: string,
  status: 'pending' | 'approved' | 'suspended',
): Promise<Result<null>> {
  const blocked = guard<null>()
  if (blocked) return blocked

  const supabase = createClient()
  const { error } = await supabase.rpc('set_account_status', {
    p_user_id: userId,
    p_status: status,
  })

  if (error) return { ok: false, error: toMessage(error, 'Could not change that status.') }
  return { ok: true, data: null }
}

/**
 * Record what a customer owes and what has arrived.
 *
 * Two numbers rather than one, because partial payment is the normal case here
 * and a single "amount" field cannot express it.
 */
export async function adminSetLicenseMoney(
  licenseId: string,
  priceCents: number,
  paidCents: number,
): Promise<Result<null>> {
  const blocked = guard<null>()
  if (blocked) return blocked

  const supabase = createClient()
  const { error } = await supabase.rpc('set_license_money', {
    p_license_id: licenseId,
    p_price_cents: Math.max(0, Math.round(priceCents)),
    p_paid_cents: Math.max(0, Math.round(paidCents)),
  })

  if (error) return { ok: false, error: toMessage(error, 'Could not save that.') }
  return { ok: true, data: null }
}

/* ==========================================================================
   ADMIN — licences
   ========================================================================== */

export async function adminListLicenses(input?: {
  search?: string
  status?: string
  limit?: number
}): Promise<Result<(License & { owner_email: string })[]>> {
  const blocked = guard<(License & { owner_email: string })[]>()
  if (blocked) return blocked

  const supabase = createClient()
  let query = supabase
    .from('admin_license_rows')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(input?.limit ?? 200)

  if (input?.status && input.status !== 'all') {
    query = query.eq('status', input.status)
  }

  const search = input?.search?.trim()
  if (search) {
    query = query.or(`license_key.ilike.%${search}%,owner_email.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error) return { ok: false, error: toMessage(error, 'Could not load licences.') }
  return { ok: true, data: (data ?? []) as (License & { owner_email: string })[] }
}

/**
 * Issue a licence by hand — the path used for manual sales, replacements,
 * review copies and support goodwill. The key itself is generated in the
 * database so it can never collide with an existing one.
 */
export async function adminIssueLicense(input: {
  email: string
  planId: string
  notes?: string
}): Promise<Result<{ license_key: string }>> {
  const blocked = guard<{ license_key: string }>()
  if (blocked) return blocked

  const supabase = createClient()
  const { data, error } = await supabase.rpc('admin_issue_license', {
    p_email: input.email,
    p_plan_id: input.planId,
    p_notes: input.notes ?? null,
  })

  if (error) return { ok: false, error: toMessage(error, 'Could not issue that licence.') }
  return { ok: true, data: data as { license_key: string } }
}

export async function adminSetLicenseStatus(
  licenseId: string,
  status: 'active' | 'revoked' | 'expired',
): Promise<Result<null>> {
  const blocked = guard<null>()
  if (blocked) return blocked

  const supabase = createClient()
  const { error } = await supabase.from('licenses').update({ status }).eq('id', licenseId)
  if (error) return { ok: false, error: toMessage(error, 'Could not update that licence.') }
  return { ok: true, data: null }
}

export async function adminAdjustSiteLimit(
  licenseId: string,
  sitesAllowed: number,
): Promise<Result<null>> {
  const blocked = guard<null>()
  if (blocked) return blocked

  const supabase = createClient()
  const { error } = await supabase
    .from('licenses')
    .update({ sites_allowed: sitesAllowed })
    .eq('id', licenseId)

  if (error) return { ok: false, error: toMessage(error, 'Could not change the limit.') }
  return { ok: true, data: null }
}

/* ==========================================================================
   ADMIN — messages
   ========================================================================== */

export type ContactMessage = {
  id: string
  name: string
  email: string
  topic: string
  message: string
  status: 'new' | 'read' | 'closed'
  created_at: string
}

export async function adminListMessages(limit = 100): Promise<Result<ContactMessage[]>> {
  const blocked = guard<ContactMessage[]>()
  if (blocked) return blocked

  const supabase = createClient()
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return { ok: false, error: toMessage(error, 'Could not load messages.') }
  return { ok: true, data: (data ?? []) as ContactMessage[] }
}

/* ==========================================================================
   PUBLIC WRITES
   ========================================================================== */

/**
 * The contact form. The only write an anonymous visitor is allowed to make,
 * and the policy in schema.sql permits insert and nothing else — no anonymous
 * caller can read back what anyone has sent.
 */
export async function submitContactMessage(input: {
  name: string
  email: string
  topic: string
  message: string
}): Promise<Result<null>> {
  const blocked = guard<null>()
  if (blocked) return blocked

  const supabase = createClient()
  const { error } = await supabase.from('contact_messages').insert({
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    topic: input.topic,
    message: input.message.trim(),
  })

  if (error) return { ok: false, error: toMessage(error, 'Could not send the message.') }
  return { ok: true, data: null }
}
