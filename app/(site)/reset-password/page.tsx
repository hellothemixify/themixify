'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { LogoLockup } from '@/components/ui/Logo'
import { Button, Card } from '@/components/ui/primitives'
import { updatePassword } from '@/lib/queries'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

/**
 * Where the emailed reset link lands.
 *
 * The link carries a one-time recovery token. The Supabase browser client picks
 * it up out of the URL on load and turns it into a short-lived session, so by
 * the time this page can ask for a new password the visitor is, briefly and
 * only for this purpose, signed in.
 *
 * That exchange is asynchronous, which is the whole reason for the three states
 * below: rendering "this link has expired" while the token is still being read
 * would be wrong on every successful reset.
 */

type Phase = 'checking' | 'ready' | 'invalid' | 'done'

const FIELD =
  'w-full rounded-xl border border-hairline bg-white px-4 py-3 text-[0.94rem] text-ink-950 outline-none transition placeholder:text-ink-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-100'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('checking')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [reveal, setReveal] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setPhase('invalid')
      return
    }

    const supabase = createClient()
    let settled = false

    // Two ways in, because the client may finish the exchange either before or
    // after this effect runs, and waiting for only one of them deadlocks in
    // whichever order loses the race.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (settled) return
      if (session && (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN')) {
        settled = true
        setPhase('ready')
      }
    })

    supabase.auth.getSession().then(({ data }) => {
      if (settled) return
      if (data.session) {
        settled = true
        setPhase('ready')
      }
    })

    // If neither has produced a session by now, the link was already used, has
    // expired, or was opened in a browser the token was not issued to.
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true
        setPhase('invalid')
      }
    }, 4000)

    return () => {
      sub.subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')

    const password = String(new FormData(event.currentTarget).get('password') ?? '')
    const result = await updatePassword(password)
    setBusy(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    setPhase('done')
    // Straight into the dashboard. The recovery session is a real session, so
    // making someone sign in again with the password they set four seconds ago
    // would be ceremony, not security.
    setTimeout(() => {
      router.refresh()
      router.push('/dashboard')
    }, 1600)
  }

  return (
    <section className="py-16">
      <div className="container-page max-w-[440px]">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <LogoLockup size={38} id="reset" />
          </Link>
        </div>

        <Card>
          {phase === 'checking' && (
            <p className="py-10 text-center text-[0.95rem] text-ink-700">
              Checking your link…
            </p>
          )}

          {phase === 'invalid' && (
            <div className="py-4 text-center">
              <h1 className="text-[1.5rem] font-extrabold tracking-tight text-ink-950">
                This link has expired
              </h1>
              <p className="mx-auto mt-3 max-w-sm text-[0.94rem] leading-relaxed text-ink-700">
                Reset links are good for one hour and can only be used once. Ask
                for a fresh one and it will be in your inbox in a moment.
              </p>
              <div className="mt-6">
                <Button href="/login" size="lg" className="w-full">
                  Back to sign in
                  <ArrowRight size={16} strokeWidth={2.6} />
                </Button>
              </div>
            </div>
          )}

          {phase === 'done' && (
            <div className="py-6 text-center">
              <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(130deg,#8b5cf6,#ec4899)] text-white">
                <ShieldCheck size={24} strokeWidth={2.4} />
              </span>
              <h1 className="text-[1.5rem] font-extrabold tracking-tight text-ink-950">
                Password updated
              </h1>
              <p className="mt-2 text-[0.94rem] text-ink-700">
                Taking you to your dashboard…
              </p>
            </div>
          )}

          {phase === 'ready' && (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-[1.6rem] font-extrabold tracking-tight text-ink-950">
                  Set a new password
                </h1>
                <p className="mt-2 text-[0.94rem] text-ink-700">
                  Choose something you have not used here before.
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-[0.8rem] font-bold text-ink-900"
                  >
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={reveal ? 'text' : 'password'}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      autoFocus
                      className={`${FIELD} pr-12`}
                      placeholder="At least 8 characters"
                    />
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

                {error && (
                  <p
                    role="alert"
                    className="rounded-xl bg-[#fdecec] px-4 py-3 text-[0.86rem] font-medium text-[#b3261e]"
                  >
                    {error}
                  </p>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={busy}>
                  {busy ? 'Saving…' : 'Save new password'}
                  {!busy && <ArrowRight size={16} strokeWidth={2.6} />}
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </section>
  )
}
