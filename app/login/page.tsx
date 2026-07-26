'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { LogoLockup } from '@/components/ui/Logo'
import { Button, Card } from '@/components/ui/primitives'
import { requestPasswordReset, signIn, signUp } from '@/lib/queries'
import { isSupabaseConfigured } from '@/lib/supabase/client'

type Mode = 'signin' | 'signup' | 'reset'

const FIELD =
  'w-full rounded-xl border border-hairline bg-white px-4 py-3 text-[0.94rem] text-ink-950 outline-none transition placeholder:text-ink-300 focus:border-brand-400 focus:ring-4 focus:ring-brand-100'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('signin')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const configured = isSupabaseConfigured()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')

    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '')
    const password = String(form.get('password') ?? '')

    if (mode === 'reset') {
      const result = await requestPasswordReset(email)
      setBusy(false)
      if (result.ok) setNotice('Check your inbox for the reset link.')
      else setError(result.error)
      return
    }

    if (mode === 'signup') {
      const result = await signUp({
        email,
        password,
        fullName: String(form.get('fullName') ?? ''),
      })
      setBusy(false)
      if (!result.ok) {
        setError(result.error)
        return
      }
      if (result.data.needsConfirmation) {
        setNotice('Account created. Confirm your email address, then sign in.')
        setMode('signin')
        return
      }
      router.push('/dashboard')
      return
    }

    const result = await signIn({ email, password })
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    router.push('/dashboard')
  }

  return (
    <section className="py-16">
      <div className="container-page max-w-[440px]">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <LogoLockup size={38} id="login" />
          </Link>
          <h1 className="mt-6 text-[1.75rem] font-extrabold tracking-tight text-ink-950">
            {mode === 'signup'
              ? 'Create your account'
              : mode === 'reset'
                ? 'Reset your password'
                : 'Welcome back'}
          </h1>
          <p className="mt-2 text-[0.94rem] text-ink-700">
            {mode === 'signup'
              ? 'Your licence keys, downloads and site activations live here.'
              : mode === 'reset'
                ? 'We will email you a link to set a new one.'
                : 'Sign in to manage your licences and downloads.'}
          </p>
        </div>

        <Card>
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
                  htmlFor="fullName"
                  className="mb-1.5 block text-[0.8rem] font-bold text-ink-900"
                >
                  Your name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  autoComplete="name"
                  className={FIELD}
                  placeholder="Jane Ahmed"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-[0.8rem] font-bold text-ink-900"
              >
                Email
              </label>
              <input
                id="email"
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
                    htmlFor="password"
                    className="text-[0.8rem] font-bold text-ink-900"
                  >
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setMode('reset')}
                      className="text-[0.78rem] font-semibold text-brand-600 hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete={
                    mode === 'signup' ? 'new-password' : 'current-password'
                  }
                  className={FIELD}
                  placeholder="At least 8 characters"
                />
              </div>
            )}

            {error && (
              <p className="rounded-xl bg-[#fdecec] px-4 py-3 text-[0.86rem] font-medium text-[#b3261e]">
                {error}
              </p>
            )}
            {notice && (
              <p className="rounded-xl bg-[#eefaf1] px-4 py-3 text-[0.86rem] font-medium text-[#15803d]">
                {notice}
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
                  onClick={() => setMode('signup')}
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
                  onClick={() => setMode('signin')}
                  className="font-bold text-brand-600 hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
            {mode === 'reset' && (
              <button
                onClick={() => setMode('signin')}
                className="font-bold text-brand-600 hover:underline"
              >
                Back to sign in
              </button>
            )}
          </div>
        </Card>

        <p className="mt-6 text-center text-[0.84rem] text-ink-500">
          Not a customer yet?{' '}
          <Link href="/pricing" className="font-semibold text-brand-600 hover:underline">
            See pricing
          </Link>
        </p>
      </div>
    </section>
  )
}
