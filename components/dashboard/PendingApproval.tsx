'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, MessageCircle, RefreshCw, Send } from 'lucide-react'
import { Button } from '@/components/ui/primitives'
import { LogoLockup } from '@/components/ui/Logo'
import { signOut, type Profile } from '@/lib/queries'
import { SUPPORT } from '@/lib/site'

/**
 * What a new account sees until somebody approves it.
 *
 * The gate exists because this is sold one licence at a time, and the payment
 * usually happens in a chat window before any software is involved. Approving
 * by hand is where that conversation gets attached to a real row — and it is
 * also the only thing standing between a bulk signup script and a free trial
 * farm.
 *
 * The important part of this screen is not the lock icon, it is the two buttons.
 * A wall that does not tell you who to talk to is just a dead end, and a dead
 * end at the exact moment somebody was ready to pay is an expensive piece of
 * design.
 */
export function PendingApproval({ profile }: { profile: Profile }) {
  const router = useRouter()
  const [checking, setChecking] = useState(false)

  const suspended = profile.approval_status === 'suspended'

  const message = encodeURIComponent(
    `Hi, I just signed up for Themixify as ${profile.email}. Could you activate my account?`,
  )

  async function onSignOut() {
    await signOut()
    router.replace('/')
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="surface-card w-full max-w-[440px] p-8 text-center sm:p-10">
        <div className="mb-6 flex justify-center">
          <LogoLockup size={32} id="pending" />
        </div>

        <span className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(130deg,#8b5cf6,#ec4899,#f97316)] text-white">
          <Lock size={26} strokeWidth={2.2} />
        </span>

        <h1 className="text-balance text-[1.5rem] font-extrabold leading-snug tracking-tight text-ink-950">
          {suspended
            ? 'This account has been suspended'
            : 'One step left — we need to activate your account'}
        </h1>

        <p className="mx-auto mt-4 max-w-sm text-[0.95rem] leading-relaxed text-ink-700">
          {suspended ? (
            <>
              Your account (<strong className="text-ink-950">{profile.email}</strong>)
              is on hold. Message us and we will sort it out.
            </>
          ) : (
            <>
              Your account (<strong className="text-ink-950">{profile.email}</strong>)
              was created successfully — it just needs to be activated by us
              before you can start using Themixify.
            </>
          )}
        </p>

        <p className="mx-auto mt-3 max-w-sm text-[0.88rem] leading-relaxed text-ink-500">
          Message us below, then press Refresh. We usually answer within a few
          hours.
        </p>

        <div className="mt-7 grid grid-cols-2 gap-3">
          <a
            href={`https://wa.me/${SUPPORT.whatsapp}?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full border border-hairline bg-white px-4 py-3 text-[0.9rem] font-semibold text-ink-900 shadow-soft transition hover:border-brand-300 hover:text-brand-700"
          >
            <MessageCircle size={16} strokeWidth={2.3} />
            WhatsApp
          </a>
          <a
            href={SUPPORT.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full border border-hairline bg-white px-4 py-3 text-[0.9rem] font-semibold text-ink-900 shadow-soft transition hover:border-brand-300 hover:text-brand-700"
          >
            <Send size={15} strokeWidth={2.3} />
            Telegram
          </a>
        </div>

        <div className="mt-3">
          <Button
            size="lg"
            className="w-full"
            disabled={checking}
            onClick={() => {
              setChecking(true)
              // A full refresh rather than a client re-render: the approval
              // happened in another browser entirely, so there is nothing
              // cached here worth keeping.
              router.refresh()
              setTimeout(() => window.location.reload(), 300)
            }}
          >
            <RefreshCw size={15} strokeWidth={2.6} className={checking ? 'animate-spin' : ''} />
            {checking ? 'Checking…' : "I've been activated — Refresh"}
          </Button>
        </div>

        <button
          type="button"
          onClick={onSignOut}
          className="mt-6 text-[0.86rem] font-semibold text-ink-500 underline underline-offset-4 hover:text-ink-900"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
