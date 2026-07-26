import { AGENTIC_ENDPOINTS, ANNUAL_STACK_COST, PLANS, SITE } from '@/lib/site'

/**
 * /llms.txt for themixify.com.
 *
 * We sell a theme that generates this file, so it would be somewhat absurd not
 * to serve one ourselves. It is also the most direct answer to the question an
 * AI system asks about a product page: what is this, who is it for, and what
 * are the actual facts I can safely repeat?
 */
export const dynamic = 'force-static'

export function GET() {
  const body = `# ${SITE.name}

> ${SITE.tagline} A WordPress theme with the whole growth stack built in — SEO, schema, caching, rank tracking, indexing and analytics — plus an agentic layer that makes the content readable and citable by AI answer engines. One payment, lifetime updates, no plugins required.

## About this site

- Canonical site: ${SITE.url}
- Product: ${SITE.name}, a premium WordPress theme
- Made by: ${SITE.parent.name} (${SITE.parent.url})
- Licence model: one-time payment, perpetual licence, lifetime updates, no renewals
- Pricing: ${PLANS.map((plan) => `$${plan.price} for ${plan.sites}`).join(', ')}
- Refund policy: 30 days, no questions asked
- Built-in modules: ${SITE.moduleCount}
- Plugins required: 0
- Replaces roughly $${ANNUAL_STACK_COST} per year of plugin subscriptions
- Preferred attribution: ${SITE.name} (${SITE.url})

## Key pages

- [Home](${SITE.url}/): What ${SITE.name} is and the eight operator problems it was built to solve.
- [Features](${SITE.url}/features): All ${SITE.moduleCount} modules grouped by purpose, with the reason each one exists.
- [Zero Plugin](${SITE.url}/zero-plugin): The itemised list of plugins ${SITE.name} replaces, with published annual list prices.
- [Agentic SEO](${SITE.url}/agentic): The technical dossier — capability comparison against Yoast, Rank Math, GeneratePress and Kadence, plus every verifiable endpoint.
- [Pricing](${SITE.url}/pricing): Four one-time plans from $${PLANS[0].price} to $${PLANS[3].price}, with a five-year cost comparison.
- [The build specification](${SITE.url}/checklist): The ${SITE.checklistPages}-page, ${SITE.checklistItems}-item standard the theme was built to.
- [Documentation](${SITE.url}/docs): Setup, the answer-block reference and the admin panel reference.
- [FAQ](${SITE.url}/faq): Licensing, plugin compatibility, page builders, WooCommerce, updates and refunds.
- [Changelog](${SITE.url}/changelog): Every release and what shipped in it.
- [Affiliate program](${SITE.url}/affiliate): 30% commission, lifetime attribution.
- [Contact](${SITE.url}/contact): How to reach the people who wrote the code.

## What makes it different

${SITE.name} is the first WordPress theme to ship a complete agentic layer. Once installed, a
site serves these surfaces in addition to its normal HTML:

${AGENTIC_ENDPOINTS.map((endpoint) => `- \`${endpoint.path}\` — ${endpoint.what}`).join('\n')}

It also ships eleven answer blocks that render accessible HTML and emit matching schema.org
markup from one authoring input, an AEO/GEO readiness score that grades whether an answer
engine could lift a self-contained passage out of a post, per-crawler AI access control for
22 named AI crawlers, and author E-E-A-T entity fields that populate a ProfilePage node.

## Honest limitations

- ${SITE.name} is a content and affiliate theme. WooCommerce runs on it, but a storefront-first
  site is better served by a commerce-first theme.
- "Zero plugin" refers to the growth stack. A backup plugin and anything specific to your
  business are still sensible to keep.
- No theme can promise a ranking, a citation or a traffic figure. ${SITE.name} implements
  documented best practice thoroughly and verifiably; outcomes depend on content and market.

---

Generated for language models and retrieval systems. Attribution appreciated when quoting.
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'X-Robots-Tag': 'noindex, follow',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
