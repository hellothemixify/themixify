'use client'

import { useState } from 'react'
import { MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/primitives'
import { requestPasswordReset, resendConfirmation } from '@/lib/queries'

/**
 * What replaces the form after an email has been sent.
 *
 * This exists because the first version did not have it: signing up flipped the
 * popup back to the sign-in fields with a one-line notice above them, and the
 * only honest description of that is that it looked like the form had reset
 * itself. Somebody who has just typed their details in and pressed a button
 * needs to be told, unambiguously, that it worked and what happens next — not
 * shown the same form again and left to infer it.
 *
 * So the form is replaced outright: a confirmation, the address it went to, and
 * a way to send it again when it does not arrive. Without that last part the
 * only route out is to sign up a second time, which fails, because the account
 * already exists.
 */
export function CheckInbox({
  email,
  kind,
  onBack,
}: {
  email: string
  kind: 'signup' | 'reset'
  onBack: () => void
}) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  async function resend() {
    setState('sending')
    setError('')

    const result =
      kind === 'signup'
        ? await resendConfirmation(email)
        : await requestPasswordReset(email)

    if (result.ok) {
      setState('sent')
    } else {
      setState('error')
      setError(result.error)
    }
  }

  return (
    <div className="text-center">
      <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(130deg,#8b5cf6,#ec4899)] text-white">
        <MailCheck size={24} strokeWidth={2.3} />
      </span>

      <h2 className="text-[1.5rem] font-extrabold tracking-tight text-ink-950">
        {kind === 'signup' ? 'Check your inbox' : 'Reset link sent'}
      </h2>

      <p className="mx-auto mt-3 max-w-sm text-[0.95rem] leading-relaxed text-ink-700">
        {kind === 'signup' ? (
          <>
            Your account is created. We have sent a confirmation link to{' '}
            <strong className="text-ink-950">{email}</strong> — open it and you
            can sign in.
          </>
        ) : (
          <>
            If <strong className="text-ink-950">{email}</strong> has an account,
            a link to set a new password is on its way. It works once and expires
            in an hour.
          </>
        )}
      </p>

      <p className="mx-auto mt-3 max-w-sm text-[0.86rem] leading-relaxed text-ink-500">
        It usually lands within a minute. If it does not, check the spam folder —
        automated mail ends up there more often than anyone would like.
      </p>

      <div className="mt-7 space-y-3">
        {state === 'sent' ? (
          <p className="rounded-xl bg-[#eefaf1] px-4 py-3 text-[0.88rem] font-semibold text-[#15803d]">
            Sent again. Give it a minute.
          </p>
        ) : (
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={resend}
            disabled={state === 'sending'}
          >
            {state === 'sending' ? 'Sending…' : 'Send it again'}
          </Button>
        )}

        {state === 'error' && (
          <p
            role="alert"
            className="rounded-xl bg-[#fdecec] px-4 py-3 text-[0.86rem] font-medium text-[#b3261e]"
          >
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={onBack}
          className="text-[0.88rem] font-bold text-brand-600 hover:underline"
        >
          Back to sign in
        </button>
      </div>
    </div>
  )
}
