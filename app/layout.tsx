import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { TopBar } from '@/components/layout/TopBar'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { FloatingActions } from '@/components/layout/FloatingActions'
import { PLANS, SITE } from '@/lib/site'

/**
 * Inter, self-hosted.
 *
 * The stylesheet has always named Inter as the body face, but nothing ever
 * loaded it — so the site silently rendered in whatever the visitor's system
 * font happened to be, and looked different on every machine. next/font pulls
 * the variable file at build time, serves it from our own origin (no request to
 * Google), preloads it, and generates a size-adjusted fallback so nothing moves
 * when it arrives.
 *
 * `optional`, not `swap`. The largest text on the homepage is the hero
 * paragraph, which makes it the Largest Contentful Paint element. Under `swap`
 * the browser paints that paragraph in the fallback and then repaints it in
 * Inter once the 49KB font arrives, and the repaint registers a second, later
 * LCP candidate. `optional` gives the font a short window and otherwise keeps
 * the fallback for that page load: one paint, no repaint, no second candidate.
 *
 * The font is cached from the first visit onwards, so only the very first page
 * view on a slow connection sees the fallback — and since the fallback is
 * metric-matched to Inter, that view is not visibly wrong, just marginally less
 * refined. A cheap insurance premium against a metric the whole product claims
 * to be good at.
 */
const inter = Inter({
  subsets: ['latin'],
  display: 'optional',
  variable: '--font-inter',
  // One variable file covers every weight the design uses.
  axes: [],
})

/**
 * The one line that has to do the selling in a search result or a shared link.
 *
 * It leads with the cost the reader is already paying — a number taken straight
 * from the plugin table on /zero-plugin, not invented — then the thing none of
 * that spending fixed, then the answer. Kept under 160 characters so Google
 * never truncates it mid-sentence.
 */
const DESCRIPTION =
  "Your plugins cost $953 a year and ChatGPT still can't read you. 34 modules built in, zero plugins, 100/100 PageSpeed. Pay once, own it forever."

const OG_TITLE = `${SITE.name} - World's first Zero Plugin Free & Agentic-Optimized Theme`

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: OG_TITLE,
    template: `%s — ${SITE.name}`,
  },
  description: DESCRIPTION,
  applicationName: SITE.name,
  authors: [{ name: SITE.parent.name, url: SITE.parent.url }],
  creator: SITE.parent.name,
  publisher: SITE.name,
  category: 'technology',
  keywords: [
    'agentic SEO WordPress theme',
    'zero plugin WordPress theme',
    'AEO WordPress theme',
    'GEO generative engine optimization',
    'llms.txt WordPress',
    'AI SEO theme',
    'fastest WordPress theme',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE.url,
    siteName: SITE.name,
    locale: 'en_US',
    title: OG_TITLE,
    description: DESCRIPTION,
    // 1200x630 is the frame every scraper crops to. Declaring the exact
    // dimensions lets Facebook and WhatsApp lay the card out from the markup
    // instead of downloading the file first and often giving up.
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: "Themixify — the world's first zero-plugin, agentic-optimized WordPress theme",
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: OG_TITLE,
    description: DESCRIPTION,
    images: ['/og.png'],
  },
  manifest: '/manifest.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
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
        url: `${SITE.url}/logo.webp`,
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
    <html lang="en" className={inter.variable}>
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
        <FloatingActions />
      </body>
    </html>
  )
}
