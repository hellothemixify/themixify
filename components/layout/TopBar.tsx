import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { TOP_BAR } from '@/lib/site'

/**
 * The lifetime-deal announcement bar.
 *
 * It sits above the header rather than inside it because the offer is the
 * single most persuasive fact on the site: every competing theme in this
 * category bills annually, and saying so before the visitor has read anything
 * else reframes the price they are about to see.
 */
export function TopBar() {
  return (
    <div className="relative overflow-hidden bg-[linear-gradient(100deg,#8b5cf6_0%,#ec4899_46%,#f97316_84%,#fbbf24_100%)] text-white">
      <div className="container-page flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 py-2.5 text-center text-[0.82rem]">
        <span className="rounded-full bg-white/22 px-2.5 py-0.5 text-[0.66rem] font-extrabold uppercase tracking-[0.14em] ring-1 ring-white/30">
          {TOP_BAR.badge}
        </span>
        <span className="font-medium text-white/95">{TOP_BAR.message}</span>
        <Link
          href={TOP_BAR.href}
          className="inline-flex items-center gap-1 rounded-full bg-white/18 px-3 py-1 font-semibold ring-1 ring-white/30 transition hover:bg-white/28"
        >
          {TOP_BAR.cta}
          <ArrowRight size={13} strokeWidth={2.6} />
        </Link>
      </div>
    </div>
  )
}
