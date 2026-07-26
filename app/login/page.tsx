'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LogoLockup } from '@/components/ui/Logo'
import { Card } from '@/components/ui/primitives'
import { AuthForm, type AuthMode } from '@/components/auth/AuthForm'

/**
 * The sign-in route.
 *
 * The header opens the same form in a popup, which is where most people will
 * meet it — but this page has to keep existing regardless. It is where a
 * "please sign in" redirect lands, what a password manager has saved, and what
 * someone gets when they paste a link to a friend. A popup cannot be any of
 * those things, because none of them survive a page load.
 */
export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('signin')

  return (
    <section className="py-16">
      <div className="container-page max-w-[440px]">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <LogoLockup size={38} id="login" />
          </Link>
        </div>

        <Card>
          <AuthForm
            mode={mode}
            onModeChange={setMode}
            onSuccess={() => {
              router.refresh()
              router.push('/dashboard')
            }}
          />
        </Card>
      </div>
    </section>
  )
}
