import type { Metadata, Viewport } from 'next'
import './globals.css'
import { TopBar } from '@/components/layout/TopBar'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { PLANS, SITE } from '@/lib/site'

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — The zero-plugin, agentic-optimized WordPress theme`,
    template: `%s — ${SITE.name}`,
  },
  description:
    'A WordPress theme with the entire growth stack built in — SEO, schema, caching, rank tracking, indexing and an agentic layer that makes your content readable by ChatGPT, Perplexity, Claude and Google AI Overviews. Zero plugins. One payment.',
  keywords: [
    'agentic SEO WordPress theme',
    'zero plugin WordPress theme',
    'AEO WordPress theme',
    'GEO generative engine optimization',
    'llms.txt WordPress',
    'AI SEO theme',
    'fastest WordPress theme',
  ],
  openGraph: {
    type: 'website',
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — The zero-plugin, agentic-optimized WordPress theme`,
    description:
      'Everything a content site needs, built into the theme. Zero plugins, 100/100 PageSpeed, and the first agentic layer that lets AI answer engines actually read and cite you.',
    images: [{ url: '/logo.png', width: 1024, height: 1024, alt: SITE.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — zero plugins, built to be cited`,
    description:
      'The WordPress theme with the whole growth stack built in, and the first agentic layer for AI answer engines.',
    images: ['/logo.png'],
  },
  icons: { icon: '/logo.png', apple: '/logo.png' },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#8b5cf6' },
    { media: '(prefers-color-scheme: dark)', color: '#5f2ab8' },
  ],
  width: 'device-width',
  initialScale: 1,
}

/**
 * One connected JSON-LD graph for the whole site — the same pattern the theme
 * itself emits. Organization, WebSite and the Product being sold, cross-linked
 * by @id so a knowledge graph resolves them as one entity rather than three.
 */
const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE.url}/#organization`,
      name: SITE.name,
      url: `${SITE.url}/`,
      logo: {
        '@type': 'ImageObject',
        '@id': `${SITE.url}/#logo`,
        url: `${SITE.url}/logo.png`,
        width: 1024,
        height: 1024,
      },
      description: SITE.tagline,
      parentOrganization: { '@type': 'Organization', name: SITE.parent.name, url: SITE.parent.url },
      sameAs: [SITE.parent.url],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE.url}/#website`,
      url: `${SITE.url}/`,
      name: SITE.name,
      publisher: { '@id': `${SITE.url}/#organization` },
      inLanguage: 'en',
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE.url}/#product`,
      name: SITE.name,
      applicationCategory: 'WordPress theme',
      operatingSystem: 'WordPress 6.0+, PHP 7.4+',
      description:
        'A WordPress theme with the complete growth stack built in and the first agentic layer for AI answer engines. Zero plugins, one-time payment.',
      publisher: { '@id': `${SITE.url}/#organization` },
      offers: PLANS.map((plan) => ({
        '@type': 'Offer',
        name: plan.name,
        price: String(plan.price),
        priceCurrency: 'USD',
        url: `${SITE.url}/pricing`,
        availability: 'https://schema.org/InStock',
      })),
      featureList: [
        'Agentic layer: llms.txt, Markdown twins, agent manifest, content API',
        'AEO answer blocks with matching schema.org markup',
        'AEO/GEO readiness scoring per post',
        'Per-crawler AI access control for 22 AI crawlers',
        'Rank tracking, GA4 and Search Console in wp-admin',
        'IndexNow and Google Indexing API',
        'Full-page caching and image optimisation',
        '100/100 PageSpeed on mobile and desktop',
      ],
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="alternate" type="text/markdown" href="/llms.txt" title="LLM-readable site map" />
        <script
          type="application/ld+json"
          // JSON.stringify output with </ neutralised so page data can never
          // break out of the script element.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(SCHEMA).replace(/</g, '\\u003c'),
          }}
        />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-5 focus:py-2.5 focus:font-semibold focus:shadow-lift"
        >
          Skip to content
        </a>
        <TopBar />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
