import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/site'

/**
 * Web app manifest.
 *
 * Not because the site wants to be installed as an app, but because Lighthouse
 * and Android both read it: it supplies the icon and theme colour used when
 * someone adds the page to a home screen, and its absence is a Best Practices
 * deduction for no good reason.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — World's first Zero Plugin Free & Agentic-Optimized Theme`,
    short_name: SITE.name,
    description: SITE.tagline,
    start_url: '/',
    display: 'standalone',
    background_color: '#fbf8ff',
    theme_color: '#8b5cf6',
    icons: [
      { src: '/icon-192.webp', sizes: '192x192', type: 'image/webp', purpose: 'any' },
      { src: '/icon-512.webp', sizes: '512x512', type: 'image/webp', purpose: 'any' },
      { src: '/icon-512.webp', sizes: '512x512', type: 'image/webp', purpose: 'maskable' },
    ],
  }
}
