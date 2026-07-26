import Link from 'next/link'
import { LogoLockup } from '@/components/ui/Logo'
import { SITE } from '@/lib/site'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Zero Plugin', href: '/zero-plugin' },
      { label: 'Agentic SEO', href: '/agentic' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Changelog', href: '/changelog' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'The 420-point checklist', href: '/checklist' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Affiliate program', href: '/affiliate' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Contact', href: '/contact' },
      { label: 'Writerify', href: 'https://writerify.org' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="defer-paint mt-8 border-t border-hairline bg-white/70">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <LogoLockup size={34} id="ftr" showParent />
            <p className="mt-4 max-w-xs text-[0.92rem] leading-relaxed text-ink-700">
              {SITE.tagline} Built by publishers who got tired of renting their
              own stack.
            </p>
            <p className="mt-5 text-[0.82rem] font-semibold text-ink-500">
              Pay once. Own it forever.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="mb-3.5 text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-ink-950">
                {column.title}
              </h3>
              <ul className="space-y-0.5">
                {column.links.map((link) => {
                  const external = link.href.startsWith('http')
                  return (
                    <li key={link.href}>
                      {/* inline-block with vertical padding rather than a bare
                          inline link: at this size the tappable box was 18px
                          tall, under the 24px a thumb needs. The row spacing
                          comes down to compensate, so nothing moves. */}
                      <Link
                        href={link.href}
                        // The footer carries every route on the site. Prefetching
                        // all of them costs real bandwidth during the initial
                        // load for links almost nobody clicks straight away; the
                        // header nav and the calls to action still prefetch.
                        prefetch={false}
                        className="inline-block py-1.5 text-[0.92rem] text-ink-700 transition hover:text-brand-600"
                        {...(external
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                      >
                        {link.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-hairline pt-7 text-[0.84rem] text-ink-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {SITE.name} — a{' '}
            <a
              href={SITE.parent.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-ink-700 hover:text-brand-600"
            >
              {SITE.parent.name}
            </a>{' '}
            product.
          </p>
          <p className="font-medium">
            WordPress is a registered trademark of the WordPress Foundation.
          </p>
        </div>
      </div>
    </footer>
  )
}
