'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/primitives'
import { CheckInbox } from '@/components/auth/CheckInbox'
import { requestPasswordReset, signIn, signUp } from '@/lib/queries'
import { isSupabaseConfigured } from '@/lib/supabase/client'

/**
 * The sign in / sign up / forgot password form.
 *
 * One component, used by both the modal in the header and the /login route, so
 * the three flows cannot drift apart. The page and the popup are two frames
 * around the same form, not two implementations of it — a fix to the validation
 * or the error copy lands in both by construction.
 */

export type AuthMode = 'signin' | 'signup' | 'reset'

const FIELD =
  'w-full rounded-xl border border-hairline bg-white px-4 py-3 text-[0.94rem] text-ink-950 outline-none transition placeholder:text-ink-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-100'

const HEADINGS: Record<AuthMode, { title: string; blurb: string }> = {
  signin: {
    title: 'Welcome back',
    blurb: 'Sign in to manage your licences and downloads.',
  },
  signup: {
    title: 'Create your account',
    blurb: 'Your licence keys, downloads and site activations live here.',
  },
  reset: {
    title: 'Reset your password',
    blurb: 'We will email you a link to set a new one.',
  },
}

export function AuthForm({
  mode,
  onModeChange,
  onSuccess,
  autoFocus = false,
  headingLevel = 'h1',
}: {
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
  /** Called after a sign in or an immediate sign up. The modal closes here; the
   *  page navigates. */
  onSuccess?: () => void
  autoFocus?: boolean
  /** The page owns the document's h1; inside the modal this has to be an h2. */
  headingLevel?: 'h1' | 'h2'
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [reveal, setReveal] = useState(false)
  // Set once an email has gone out, which replaces the form entirely rather
  // than leaving it on screen behind a notice.
  const [sent, setSent] = useState<{ kind: 'signup' | 'reset'; email: string } | null>(
    null,
  )
  const firstFieldRef = useRef<HTMLInputElement>(null)

  // Ids come from useId rather than being written out, because this form can be
  // on the page twice — the popup lives in the header, which is rendered on
  // /login too. Hard-coded ids would collide there, and a duplicated id does
  // not merely fail validation: the second label stops pointing at its own
  // field, so clicking it focuses the other copy of the form.
  const uid = useId()
  const nameId = `${uid}-name`
  const emailId = `${uid}-email`
  const phoneId = `${uid}-phone`
  const passwordId = `${uid}-password`

  const configured = isSupabaseConfigured()
  const Heading = headingLevel

  // Switching mode inside the modal replaces the fields under the visitor's
  // hands; a stale error from the previous mode would read as a rejection of
  // what they are looking at now.
  useEffect(() => {
    setError('')
    setReveal(false)
    setSent(null)
  }, [mode])

  useEffect(() => {
    if (autoFocus) firstFieldRef.current?.focus()
  }, [autoFocus, mode])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')

    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '')
    const password = String(form.get('password') ?? '')

    if (mode === 'reset') {
      const result = await requestPasswordReset(email)
      setBusy(false)
      if (result.ok) {
        setSent({ kind: 'reset', email })
      } else {
        setError(result.error)
      }
      return
    }

    if (mode === 'signup') {
      const result = await signUp({
        email,
        password,
        fullName: String(form.get('fullName') ?? ''),
        phone: String(form.get('phone') ?? ''),
      })
      setBusy(false)
      if (!result.ok) {
        setError(result.error)
        return
      }
      if (result.data.needsConfirmation) {
        setSent({ kind: 'signup', email })
        return
      }
      onSuccess ? onSuccess() : router.push('/dashboard')
      return
    }

    const result = await signIn({ email, password })
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    onSuccess ? onSuccess() : router.push('/dashboard')
  }

  if (sent) {
    return (
      <CheckInbox
        email={sent.email}
        kind={sent.kind}
        onBack={() => {
          setSent(null)
          onModeChange('signin')
        }}
      />
    )
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <Heading className="text-[1.6rem] font-extrabold tracking-tight text-ink-950">
          {HEADINGS[mode].title}
        </Heading>
        <p className="mt-2 text-[0.94rem] text-ink-700">{HEADINGS[mode].blurb}</p>
      </div>

      {!configured && (
        <p className="mb-4 rounded-xl bg-[#fff6e6] px-4 py-3 text-[0.86rem] font-medium text-[#92400e]">
          The database is not connected in this environment yet. Add your
          Supabase keys to <code>.env.local</code> to enable accounts.
        </p>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label
              htmlFor={nameId}
              className="mb-1.5 block text-[0.8rem] font-bold text-ink-900"
            >
              Your name
            </label>
            <input
              ref={mode === 'signup' ? firstFieldRef : undefined}
              id={nameId}
              name="fullName"
              type="text"
              required
              autoComplete="name"
              className={FIELD}
              placeholder="Jane Ahmed"
            />
          </div>
        )}

        {mode === 'signup' && (
          <div>
            <label
              htmlFor={phoneId}
              className="mb-1.5 block text-[0.8rem] font-bold text-ink-900"
            >
              WhatsApp number
            </label>
            <input
              id={phoneId}
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              className={FIELD}
              placeholder="+880 1XXX XXXXXX"
            />
            {/* Required, and it says why. Activation happens over WhatsApp, so
                an account without a number is one nobody can reach — and being
                asked for a phone number with no explanation is the point where
                people close the tab. */}
            <p className="mt-1.5 text-[0.78rem] leading-relaxed text-ink-500">
              We activate accounts over WhatsApp, so this is how we reach you.
              Nothing else is sent to it.
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor={emailId}
            className="mb-1.5 block text-[0.8rem] font-bold text-ink-900"
          >
            Email
          </label>
          <input
            ref={mode === 'signup' ? undefined : firstFieldRef}
            id={emailId}
            name="email"
            type="email"
            required
            autoComplete="email"
            className={FIELD}
            placeholder="you@example.com"
          />
        </div>

        {mode !== 'reset' && (
          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <label
                htmlFor={passwordId}
                className="text-[0.8rem] font-bold text-ink-900"
              >
                Password
              </label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => onModeChange('reset')}
                  className="text-[0.78rem] font-semibold text-brand-600 hover:underline"
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id={passwordId}
                name="password"
                type={reveal ? 'text' : 'password'}
                required
                minLength={8}
                autoComplete={
                  mode === 'signup' ? 'new-password' : 'current-password'
                }
                className={`${FIELD} pr-12`}
                placeholder="At least 8 characters"
              />
              {/* A reveal toggle rather than a second "confirm password" field.
                  Retyping a password you cannot see catches typos by making you
                  make the same one twice; showing it catches them outright. */}
              <button
                type="button"
                onClick={() => setReveal((value) => !value)}
                aria-label={reveal ? 'Hide password' : 'Show password'}
                className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-ink-500 transition hover:bg-brand-50 hover:text-brand-600"
              >
                {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-xl bg-[#fdecec] px-4 py-3 text-[0.86rem] font-medium text-[#b3261e]"
          >
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy
            ? 'Working…'
            : mode === 'signup'
              ? 'Create account'
              : mode === 'reset'
                ? 'Send reset link'
                : 'Sign in'}
          {!busy && <ArrowRight size={16} strokeWidth={2.6} />}
        </Button>
      </form>

      <div className="mt-6 border-t border-hairline pt-5 text-center text-[0.88rem] text-ink-700">
        {mode === 'signin' && (
          <>
            No account yet?{' '}
            <button
              type="button"
              onClick={() => onModeChange('signup')}
              className="font-bold text-brand-600 hover:underline"
            >
              Create one
            </button>
          </>
        )}
        {mode === 'signup' && (
          <>
            Already have one?{' '}
            <button
              type="button"
              onClick={() => onModeChange('signin')}
              className="font-bold text-brand-600 hover:underline"
            >
              Sign in
            </button>
          </>
        )}
        {mode === 'reset' && (
          <button
            type="button"
            onClick={() => onModeChange('signin')}
            className="font-bold text-brand-600 hover:underline"
          >
            Back to sign in
          </button>
        )}
      </div>

      {mode !== 'signup' && (
        <p className="mt-5 text-center text-[0.84rem] text-ink-500">
          Not a customer yet?{' '}
          <Link href="/pricing" className="font-semibold text-brand-600 hover:underline">
            See pricing
          </Link>
        </p>
      )}
    </div>
  )
}
