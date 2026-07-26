import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/site'

/**
 * A site selling an agentic-optimized theme has to be agentic-optimized itself.
 *
 * The policy below is the one we recommend to customers: answer-engine
 * indexers and user-triggered fetchers are welcome, because a system that was
 * never allowed to read us cannot cite us. Only the private surfaces are closed.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/checkout'],
      },
      // Named explicitly so the intent is unmistakable rather than inherited.
      {
        userAgent: [
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'ClaudeBot',
          'Claude-User',
          'Claude-SearchBot',
          'PerplexityBot',
          'Perplexity-User',
          'Google-Extended',
          'Applebot-Extended',
          'CCBot',
        ],
        allow: '/',
        disallow: ['/dashboard/', '/checkout'],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  }
}
