'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  Download,
  Gauge,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Receipt,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { LogoLockup } from '@/components/ui/Logo'
import { PendingApproval } from '@/components/dashboard/PendingApproval'
import { getCurrentProfile, signOut, type Profile } from '@/lib/queries'
import { isSupabaseConfigured } from '@/lib/supabase/client'

/**
 * The dashboard's own top bar.
 *
 * Deliberately not the marketing header. Someone who has already paid does not
 * need a lifetime-deal banner and a "Get Themixify" button across the top of
 * their own licence keys — that is a sales surface, and leaving it here makes a
 * product feel like a landing page. This is the logo, a way back to the public
 * site, and who you are signed in as.
 */
function AppBar({ profile }: { profile: Profile }) {
  const initial = (profile.full_name ?? profile.email).charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-white/85 backdrop-blur-xl">
      <div className="container-page flex h-[62px] items-center justify-between gap-4">
        <Link href="/dashboard" aria-label="Dashboard" className="shrink-0">
          <LogoLockup size={30} id="app" />
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.86rem] font-semibold text-ink-700 transition hover:bg-brand-50 hover:text-brand-700 sm:inline-flex"
          >
            View site
            <ArrowUpRight size={14} strokeWidth={2.4} />
          </Link>
          <span
            title={profile.email}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(130deg,#8b5cf6,#ec4899)] text-[0.85rem] font-extrabold text-white"
          >
            {initial}
          </span>
        </div>
      </div>
    </header>
  )
}

const ACCOUNT_LINKS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/licenses', label: 'My Licences', icon: KeyRound },
  { href: '/dashboard/downloads', label: 'Downloads', icon: Download },
  { href: '/dashboard/orders', label: 'Orders', icon: Receipt },
]

const ADMIN_LINKS = [
  { href: '/dashboard/admin', label: 'Overview', icon: Gauge },
  { href: '/dashboard/admin/license', label: 'License', icon: KeyRound },
  { href: '/dashboard/admin/users', label: 'User Manage', icon: Users },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'anon' | 'offline'>(
    'loading',
  )

  useEffect(() => {
    // The database is the authority on who you are; the client only decides
    // what to draw while it waits for the answer.
    if (!isSupabaseConfigured()) {
      setState('offline')
      return
    }
    let cancelled = false
    getCurrentProfile().then((result) => {
      if (cancelled) return
      if (result.ok && result.data) {
        setProfile(result.data)
        setState('ready')
      } else {
        setState('anon')
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (state === 'anon') router.replace('/login')
  }, [state, router])

  async function onSignOut() {
    await signOut()
    router.replace('/')
  }

  if (state === 'loading') {
    return (
      <div className="container-page flex min-h-[60vh] items-center justify-center">
        <p className="text-[0.95rem] font-medium text-ink-500">Loading your account…</p>
      </div>
    )
  }

  if (state === 'offline') {
    return (
      <div className="container-page py-20">
        <div className="surface-card mx-auto max-w-xl p-8 text-center">
          <h1 className="text-[1.4rem] font-extrabold text-ink-950">
            Database not connected
          </h1>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-700">
            This build is running without Supabase credentials, so accounts are
            disabled. Copy <code className="rounded bg-brand-50 px-1.5 py-0.5 text-brand-700">.env.example</code>{' '}
            to <code className="rounded bg-brand-50 px-1.5 py-0.5 text-brand-700">.env.local</code>,
            add your project URL and anon key, run{' '}
            <code className="rounded bg-brand-50 px-1.5 py-0.5 text-brand-700">supabase/schema.sql</code>{' '}
            once, and restart the dev server.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-[linear-gradient(100deg,#8b5cf6,#ec4899)] px-6 py-2.5 text-[0.9rem] font-bold text-white"
          >
            Back to the site
          </Link>
        </div>
      </div>
    )
  }

  if (state === 'anon' || !profile) return null

  // Approval comes before everything else. An admin is approved by definition —
  // the owner accounts are created by us — so the gate never locks out the
  // person who would have to unlock it.
  if (profile.role !== 'admin' && profile.approval_status !== 'approved') {
    return (
      <>
        <AppBar profile={profile} />
        <main id="main" className="container-page">
          <PendingApproval profile={profile} />
        </main>
      </>
    )
  }

  const isAdmin = profile.role === 'admin'

  return (
    <>
      <AppBar profile={profile} />
      <main id="main" className="container-page py-8">
      <div className="grid gap-8 lg:grid-cols-[236px_1fr]">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="surface-card p-4">
            <div className="mb-4 flex items-center gap-3 border-b border-hairline px-1 pb-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(130deg,#8b5cf6,#ec4899)] text-[0.95rem] font-extrabold text-white">
                {(profile.full_name ?? profile.email).charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[0.9rem] font-bold text-ink-950">
                  {profile.full_name ?? 'Your account'}
                </p>
                <p className="truncate text-[0.76rem] text-ink-500">
                  {profile.email}
                </p>
              </div>
            </div>

            {isAdmin && (
              <div className="mb-4">
                <p className="mb-1.5 flex items-center gap-1.5 px-3 text-[0.66rem] font-extrabold uppercase tracking-[0.14em] text-ink-500">
                  <ShieldCheck size={11} strokeWidth={3} />
                  Admin
                </p>
                <nav className="space-y-0.5">
                  {ADMIN_LINKS.map((link) => (
                    <SidebarLink
                      key={link.href}
                      {...link}
                      active={pathname === link.href}
                    />
                  ))}
                </nav>
              </div>
            )}

            <div>
              <p className="mb-1.5 px-3 text-[0.66rem] font-extrabold uppercase tracking-[0.14em] text-ink-500">
                Account
              </p>
              <nav className="space-y-0.5">
                {ACCOUNT_LINKS.map((link) => (
                  <SidebarLink
                    key={link.href}
                    {...link}
                    active={pathname === link.href}
                  />
                ))}
              </nav>
            </div>

            <button
              onClick={onSignOut}
              className="mt-4 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.88rem] font-semibold text-ink-700 transition hover:bg-[#fdecec] hover:text-[#b3261e]"
            >
              <LogOut size={15} strokeWidth={2.2} />
              Sign out
            </button>
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
      </main>
    </>
  )
}

function SidebarLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string
  label: string
  icon: typeof LayoutDashboard
  active: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.88rem] font-semibold transition ${
        active
          ? 'bg-brand-50 text-brand-700'
          : 'text-ink-700 hover:bg-brand-50/60 hover:text-brand-700'
      }`}
    >
      <Icon size={15} strokeWidth={2.2} />
      {label}
    </Link>
  )
}
