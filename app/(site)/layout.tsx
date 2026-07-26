import { TopBar } from '@/components/layout/TopBar'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { FloatingActions } from '@/components/layout/FloatingActions'

/**
 * The public site: everything a visitor sees before they have an account.
 *
 * The marketing chrome lives here rather than in the root layout so that the
 * dashboard does not inherit it. A signed-in customer looking at their licence
 * keys does not need a lifetime-deal banner across the top or a four-column
 * marketing footer underneath — that is a product surface, not a landing page,
 * and wrapping it in sales furniture makes it feel like one.
 *
 * A route group, so none of this appears in the URL: /pricing stays /pricing.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <TopBar />
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <FloatingActions />
    </>
  )
}
