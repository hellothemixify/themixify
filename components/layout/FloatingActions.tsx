'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  ArrowUp,
  Check,
  Copy,
  Facebook,
  Linkedin,
  Mail,
  MessageCircle,
  Share2,
  Twitter,
} from 'lucide-react'

/**
 * The two floating controls that sit over every page: share on the left, back
 * to top on the right.
 *
 * Both are deliberately plain white discs with the brand gradient reserved for
 * the hover and open states. They float above a page that already has a lot of
 * colour in it, and a permanently gradient-filled button in the corner competes
 * with the content for attention every second it is on screen.
 *
 * Everything here is positioned `fixed`, so neither control can move a single
 * pixel of the page — they cost nothing in layout shift, which matters on a
 * site that sells page speed.
 */

type ShareTarget = {
  key: string
  label: string
  icon: typeof Facebook
  /** Builds the destination from the encoded page URL and title. */
  href: (url: string, title: string) => string
}

const TARGETS: ShareTarget[] = [
  {
    key: 'facebook',
    label: 'Facebook',
    icon: Facebook,
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${url}`,
  },
  {
    key: 'x',
    label: 'X (Twitter)',
    icon: Twitter,
    href: (url, title) => `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    icon: Linkedin,
    href: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    icon: MessageCircle,
    href: (url, title) => `https://api.whatsapp.com/send?text=${title}%20${url}`,
  },
  {
    key: 'email',
    label: 'Email',
    icon: Mail,
    href: (url, title) => `mailto:?subject=${title}&body=${url}`,
  },
]

const DISC =
  'flex h-12 w-12 items-center justify-center rounded-full border border-hairline bg-white text-brand-600 shadow-lift transition hover:border-transparent hover:bg-[linear-gradient(130deg,#8b5cf6,#ec4899)] hover:text-white'

export function FloatingActions() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [atTop, setAtTop] = useState(true)
  const [canNativeShare, setCanNativeShare] = useState(false)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // navigator.share is read after mount rather than during render: the server
  // has no idea whether the visitor's browser has it, and guessing would mean
  // rendering one menu on the server and a different one in the browser.
  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && 'share' in navigator)
  }, [])

  // A single passive listener coalesced into an animation frame. The button
  // only has two states, so there is no reason to touch React on every one of
  // the hundreds of scroll events a flick produces.
  useEffect(() => {
    let frame = 0
    const read = () => {
      frame = 0
      setAtTop(window.scrollY < 600)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  // Close on navigation, on Escape and on a click outside. Escape also returns
  // focus to the trigger, so a keyboard user is not dropped at the top of the
  // document after dismissing the menu.
  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  const shareUrl = useCallback(
    () => (typeof window === 'undefined' ? '' : window.location.href),
    [],
  )

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard access can be refused outright — in an iframe, over http, or
      // by policy. Falling back to the native sheet is more useful than an
      // error the visitor can do nothing about.
      if (canNativeShare) void navigator.share({ url: shareUrl() })
    }
  }

  async function onNativeShare() {
    try {
      await navigator.share({ title: document.title, url: shareUrl() })
      setOpen(false)
    } catch {
      // Dismissing the sheet rejects the promise. That is not an error.
    }
  }

  function scrollToTop() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <>
      {/* Share — bottom left */}
      <div ref={wrapperRef} className="fixed bottom-6 left-5 z-40 print:hidden">
        {open && (
          // A disclosure, not a menu. role="menu" would promise a screen reader
          // arrow-key navigation between the items, and these are ordinary
          // links and buttons that Tab moves through — claiming the richer
          // pattern without implementing it is worse than not claiming it.
          <div
            aria-label="Share this page"
            className="surface-card absolute bottom-14 left-0 w-52 overflow-hidden p-0"
          >
            <p className="border-b border-hairline px-4 py-2.5 text-[0.68rem] font-extrabold uppercase tracking-[0.13em] text-ink-500">
              Share this page
            </p>
            <ul className="p-1.5">
              {TARGETS.map((target) => {
                const Icon = target.icon
                return (
                  <li key={target.key}>
                    <a
                      href={target.href(
                        encodeURIComponent(shareUrl()),
                        encodeURIComponent(
                          typeof document === 'undefined' ? '' : document.title,
                        ),
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[0.88rem] font-semibold text-ink-900 transition hover:bg-brand-50 hover:text-brand-700"
                    >
                      <Icon size={15} strokeWidth={2.3} className="shrink-0 text-brand-500" />
                      {target.label}
                    </a>
                  </li>
                )
              })}

              <li>
                <button
                  type="button"
                  onClick={onCopy}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[0.88rem] font-semibold text-ink-900 transition hover:bg-brand-50 hover:text-brand-700"
                >
                  {copied ? (
                    <Check size={15} strokeWidth={2.8} className="shrink-0 text-[#15803d]" />
                  ) : (
                    <Copy size={15} strokeWidth={2.3} className="shrink-0 text-brand-500" />
                  )}
                  {copied ? 'Link copied' : 'Copy link'}
                </button>
              </li>

              {canNativeShare && (
                <li>
                  <button
                    type="button"
                    onClick={onNativeShare}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[0.88rem] font-semibold text-ink-900 transition hover:bg-brand-50 hover:text-brand-700"
                  >
                    <Share2 size={15} strokeWidth={2.3} className="shrink-0 text-brand-500" />
                    More…
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}

        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          // aria-expanded alone, with no aria-controls: the panel is unmounted
          // while closed, and pointing aria-controls at an id that is not in
          // the document is a dangling reference rather than a helpful one.
          aria-expanded={open}
          aria-label="Share this page"
          className={`${DISC} ${open ? 'border-transparent bg-[linear-gradient(130deg,#8b5cf6,#ec4899)] text-white' : ''}`}
        >
          <Share2 size={18} strokeWidth={2.4} />
        </button>
      </div>

      {/* Back to top — bottom right. Kept mounted and faded rather than
          unmounted, so it cannot cause a layout or paint jump on the first
          scroll, and `inert` keeps it off the tab order while it is invisible. */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        aria-hidden={atTop}
        inert={atTop ? true : undefined}
        className={`${DISC} fixed bottom-6 right-5 z-40 print:hidden ${
          atTop
            ? 'pointer-events-none translate-y-2 opacity-0'
            : 'translate-y-0 opacity-100'
        }`}
      >
        <ArrowUp size={18} strokeWidth={2.6} />
      </button>
    </>
  )
}
