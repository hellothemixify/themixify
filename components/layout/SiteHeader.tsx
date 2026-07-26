'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { LogoLockup } from '@/components/ui/Logo'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/primitives'
import { NAV } from '@/lib/site'

/**
 * Loaded on demand, and mounted only once someone asks for it.
 *
 * The auth form reaches the Supabase client, which is about 68KB of JavaScript.
 * Imported normally it rides along in the header — and the header is on every
 * page — so every visitor reading a marketing page downloaded and parsed an
 * entire database SDK to look at a "Sign in" button they were not going to
 * press. It cost 25 points of mobile performance when it was measured.
 *
 * ssr: false because a dialog that has not been opened has nothing to render on
 * the server, and the visitor pays a fetch only at the moment they click.
 */
const AuthModal = dynamic(
  () => import('@/components/auth/AuthModal').then((m) => m.AuthModal),
  { ssr: false },
)

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  // The header gains its border and blur only once the page has moved, so at
  // rest it dissolves into the hero instead of cutting a line across it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Any navigation closes the mobile sheet; leaving it open across a route
  // change is the classic way a mobile menu ends up covering the new page.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-hairline bg-white/85 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="container-page flex h-[70px] items-center justify-between gap-6">
        {/* Not prefetched: on the homepage this points at the page the visitor
            is already on, and Next would still pull ~13KB of route payload for
            it — bandwidth spent during the load, competing with the content. */}
        <Link
          href="/"
          prefetch={false}
          aria-label="Themixify home"
          className="shrink-0"
        >
          <LogoLockup size={34} id="hdr" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`rounded-full px-3.5 py-2 text-[0.92rem] font-semibold transition ${
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-ink-700 hover:bg-brand-50 hover:text-brand-700'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-2.5 lg:flex">
          <Button variant="ghost" size="md" onClick={() => setAuthOpen(true)}>
            Sign in
          </Button>
          <Button href="/pricing" variant="primary" size="md">
            Get Themixify
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-hairline bg-white text-ink-900 lg:hidden"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-hairline bg-white lg:hidden">
          <div className="container-page flex flex-col gap-1 py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-3 text-[0.98rem] font-semibold text-ink-900 hover:bg-brand-50"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2.5">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  setOpen(false)
                  setAuthOpen(true)
                }}
              >
                Sign in
              </Button>
              <Button href="/pricing" variant="primary" size="lg">
                Get Themixify
              </Button>
            </div>
          </div>
        </div>
      )}

      {authOpen && <AuthModal open onClose={() => setAuthOpen(false)} />}
    </header>
  )
}
