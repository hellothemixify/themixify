'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { AuthForm, type AuthMode } from '@/components/auth/AuthForm'

/**
 * The sign in popup.
 *
 * Built on the native <dialog> element rather than a div with a high z-index,
 * because showModal() gives the three things a hand-rolled modal almost always
 * gets wrong for free and correctly: focus is trapped inside it, Escape closes
 * it, and the rest of the page becomes inert so a screen reader cannot wander
 * out of the dialog into the page behind it. It also renders in the browser's
 * top layer, which means no stacking-context fight with the sticky header.
 *
 * The form itself is shared with the /login route — see AuthForm.
 */
export function AuthModal({
  open,
  onClose,
  initialMode = 'signin',
}: {
  open: boolean
  onClose: () => void
  initialMode?: AuthMode
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const router = useRouter()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      setMode(initialMode)
      dialog.showModal()
      // showModal() focuses the first focusable descendant, which is the close
      // button — so a keyboard user opens the dialog already pointed at the way
      // out of it. Move to the first field instead. This has to happen after
      // showModal rather than in the form, because a child's effect runs before
      // its parent's and would be overridden a moment later.
      requestAnimationFrame(() => {
        dialog.querySelector('input')?.focus()
      })
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open, initialMode])

  // showModal() blocks interaction with the page but not scrolling behind it,
  // so the background would still move under the dialog on a wheel or a swipe.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  function afterAuth() {
    onClose()
    // refresh() before push() so the server components that read the session —
    // the header, the dashboard shell — re-render as the signed-in user rather
    // than showing the signed-out state for a beat after the redirect.
    router.refresh()
    router.push('/dashboard')
  }

  return (
    <dialog
      ref={dialogRef}
      // The browser fires `close` for Escape and for form-method=dialog too, so
      // this is the one place state gets synced back — no separate key handler.
      onClose={onClose}
      onCancel={onClose}
      // Clicking the backdrop is a click on the dialog element itself; anything
      // inside the card stops at the card.
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
      aria-label="Account"
      className="m-auto w-[min(100vw-2rem,440px)] rounded-[24px] border border-hairline bg-white p-0 shadow-lift backdrop:bg-ink-950/45 backdrop:backdrop-blur-[2px]"
    >
      {/* Mounted only while open. The header renders on every route including
          /login, which puts a second copy of this form on that page — and two
          live copies of the same form means duplicated field ids, so a label
          click lands on whichever copy the browser finds first. Unmounting also
          means the form starts clean each time rather than showing the email
          somebody typed an hour ago. */}
      {open && (
        <div className="relative p-7 sm:p-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3.5 top-3.5 flex h-9 w-9 items-center justify-center rounded-full text-ink-500 transition hover:bg-brand-50 hover:text-brand-700"
          >
            <X size={18} strokeWidth={2.4} />
          </button>

          <AuthForm
            mode={mode}
            onModeChange={setMode}
            onSuccess={afterAuth}
            autoFocus
            headingLevel="h2"
          />
        </div>
      )}
    </dialog>
  )
}
