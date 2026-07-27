'use client'

import { useEffect, useRef } from 'react'
import { AlertTriangle, X } from 'lucide-react'

/**
 * A confirmation the site actually owns.
 *
 * window.confirm() is fine functionally and wrong in every other way: it is
 * chrome-coloured, says "themixify.com says" above the message, cannot be
 * styled, and blocks the whole browser tab while it is open. On a screen where
 * the destructive action is deleting a paying customer, a dialog that looks
 * like a browser error is the wrong frame — it reads as something going wrong
 * rather than something being asked.
 *
 * Built on <dialog> for the same reasons as the auth modal: focus is trapped,
 * Escape closes, and the page behind goes inert without a line of code from us.
 *
 * Focus lands on Cancel, not Confirm. Somebody who has already mis-clicked once
 * is exactly the person about to press Enter, and the default should be the
 * harmless answer.
 */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  body: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'brand'
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
      requestAnimationFrame(() => cancelRef.current?.focus())
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  const danger = tone === 'danger'

  return (
    <dialog
      ref={dialogRef}
      onClose={onCancel}
      onCancel={onCancel}
      onClick={(event) => {
        if (event.target === dialogRef.current && !busy) onCancel()
      }}
      aria-labelledby="confirm-title"
      className="m-auto w-[min(100vw-2rem,420px)] rounded-[22px] border border-hairline bg-white p-0 shadow-lift backdrop:bg-ink-950/45 backdrop:backdrop-blur-[2px]"
    >
      {open && (
        <div className="relative p-7">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            aria-label="Close"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-ink-500 transition hover:bg-brand-50 hover:text-brand-700"
          >
            <X size={16} strokeWidth={2.4} />
          </button>

          <span
            className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full ${
              danger ? 'bg-[#fdecec] text-[#b3261e]' : 'bg-brand-50 text-brand-600'
            }`}
          >
            <AlertTriangle size={22} strokeWidth={2.3} />
          </span>

          <h2
            id="confirm-title"
            className="text-[1.2rem] font-extrabold leading-snug tracking-tight text-ink-950"
          >
            {title}
          </h2>

          <div className="mt-2.5 text-[0.92rem] leading-relaxed text-ink-700">{body}</div>

          <div className="mt-7 flex gap-2.5">
            <button
              ref={cancelRef}
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="flex-1 rounded-full border border-hairline bg-white px-4 py-2.5 text-[0.9rem] font-bold text-ink-900 shadow-soft transition hover:border-brand-300 disabled:opacity-55"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className={`flex-1 rounded-full px-4 py-2.5 text-[0.9rem] font-bold text-white transition disabled:opacity-55 ${
                danger
                  ? 'bg-[#b3261e] hover:bg-[#961f19]'
                  : 'bg-[linear-gradient(100deg,#8b5cf6,#ec4899)]'
              }`}
            >
              {busy ? 'Working…' : confirmLabel}
            </button>
          </div>
        </div>
      )}
    </dialog>
  )
}
