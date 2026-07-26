import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/site'

const PAGES: { path: string; priority: number; frequency: 'weekly' | 'monthly' }[] =
  [
    { path: '/', priority: 1, frequency: 'weekly' },
    { path: '/features', priority: 0.9, frequency: 'monthly' },
    { path: '/zero-plugin', priority: 0.9, frequency: 'monthly' },
    { path: '/agentic', priority: 0.9, frequency: 'monthly' },
    { path: '/pricing', priority: 0.95, frequency: 'monthly' },
    { path: '/checklist', priority: 0.8, frequency: 'monthly' },
    { path: '/docs', priority: 0.7, frequency: 'monthly' },
    { path: '/faq', priority: 0.7, frequency: 'monthly' },
    { path: '/changelog', priority: 0.6, frequency: 'weekly' },
    { path: '/affiliate', priority: 0.6, frequency: 'monthly' },
    { path: '/contact', priority: 0.5, frequency: 'monthly' },
    { path: '/privacy', priority: 0.3, frequency: 'monthly' },
    { path: '/terms', priority: 0.3, frequency: 'monthly' },
  ]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return PAGES.map((page) => ({
    url: `${SITE.url}${page.path}`,
    lastModified,
    changeFrequency: page.frequency,
    priority: page.priority,
  }))
}
