/**
 * Single source of truth for everything the marketing site says.
 *
 * Copy lives here rather than inside components so that a claim can only ever
 * appear once. If a number changes — a price, a plugin cost, a module count —
 * it changes in one place and every page that quotes it follows.
 */

export const SITE = {
  name: 'Themixify',
  domain: 'themixify.com',
  url: 'https://themixify.com',
  tagline: 'The zero-plugin, agentic-optimized WordPress theme.',
  parent: { name: 'Writerify', url: 'https://writerify.org' },
  email: 'support@themixify.com',
  moduleCount: 34,
  checklistItems: 420,
  checklistPages: 42,
} as const

/* ==========================================================================
   TOP BAR
   ========================================================================== */

/**
 * Where a customer reaches a human.
 *
 * Not a support form. This is sold one licence at a time to people who expect
 * to talk to someone before they pay, and a contact form is where that
 * conversation goes to die.
 */
export const SUPPORT = {
  /** International format, no + or spaces — wa.me wants it bare. */
  whatsapp: '8801767682381',
  telegram: 'https://t.me/writerify',
  display: '+880 1767 682381',
} as const

export const TOP_BAR = {
  badge: 'LIFETIME DEAL',
  message:
    'Pay once at $69 — lifetime updates, every future module included, nothing ever renews.',
  cta: 'See pricing',
  href: '/pricing',
} as const

/* ==========================================================================
   NAVIGATION
   ========================================================================== */

export const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/features' },
  { label: 'Zero Plugin', href: '/zero-plugin' },
  { label: 'Agentic SEO', href: '/agentic' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Docs', href: '/docs' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
] as const

/* ==========================================================================
   PRICING
   ========================================================================== */

export type Plan = {
  id: string
  name: string
  sites: string
  price: number
  blurb: string
  featured?: boolean
  perks: string[]
}

export const PLANS: Plan[] = [
  {
    id: 'single',
    name: 'Single Site',
    sites: '1 website',
    price: 69,
    blurb: 'For the site you actually care about.',
    perks: [
      'Use on 1 website',
      'Lifetime updates',
      'Premium support',
      'All premium features',
      'One-time payment',
    ],
  },
  {
    id: 'five',
    name: '5 Sites',
    sites: '5 websites',
    price: 99,
    blurb: 'The portfolio starter.',
    perks: [
      'Use on 5 websites',
      'Lifetime updates',
      'Premium support',
      'All premium features',
      'One-time payment',
    ],
  },
  {
    id: 'ten',
    name: '10 Sites',
    sites: '10 websites',
    price: 149,
    blurb: 'Where most affiliate operators land.',
    perks: [
      'Use on 10 websites',
      'Lifetime updates',
      'Premium support',
      'All premium features',
      'One-time payment',
    ],
  },
  {
    id: 'agency',
    name: '100 Sites',
    sites: '100 websites',
    price: 499,
    blurb: 'Agency and portfolio scale.',
    featured: true,
    perks: [
      'Use on 100 websites',
      'Lifetime updates',
      'Priority support',
      'All premium features',
      'One-time payment',
    ],
  },
]

/* ==========================================================================
   THE PAIN
   Written the way an operator would describe their own week, not the way a
   vendor describes a feature gap.
   ========================================================================== */

export const PAIN_POINTS = [
  {
    title: 'You rank #1 and the clicks still went down',
    body: 'An AI Overview answered the question above your result and the searcher never scrolled. Your ranking did not fall — the click did. Nothing in your SEO plugin measures this, and nothing in it fixes it.',
  },
  {
    title: 'You have no idea whether ChatGPT can even read you',
    body: 'GPTBot, ClaudeBot and PerplexityBot do not run JavaScript. Half of what your plugins render is invisible to them. Most sites are absent from AI answers not because they were rejected, but because a firewall rule blocked the crawler two years ago and nobody looked.',
  },
  {
    title: 'Twenty-six plugins, and one of them will break on Tuesday',
    body: 'Every plugin is a settings screen, an update, an incompatibility and an attack surface. The stack that took a weekend to assemble takes a day a month to keep alive.',
  },
  {
    title: 'The renewals never stop',
    body: 'SEO plugin, cache plugin, image optimizer, schema add-on, rank tracker, author box, table of contents. Individually reasonable. Together they are a subscription you renew forever for a site that earns in seasons.',
  },
  {
    title: '100/100 PageSpeed is a screenshot you never get to take',
    body: 'You optimise the images, then a plugin injects 180 KB of CSS for a widget you use on one page. You disable the widget; something else breaks.',
  },
  {
    title: 'You publish, then wait a fortnight to be indexed',
    body: 'Fresh content is worth the most in its first week, and that is exactly the week Google has not looked at it yet.',
  },
  {
    title: 'Nobody can tell you why a post underperforms',
    body: 'Your plugin says the SEO score is green. The post still gets nothing. Green measured keyword density — not whether an answer engine could lift a usable passage out of it.',
  },
  {
    title: 'Fifty sites means fifty plugin stacks',
    body: 'Every new site restarts the same afternoon of installing, licensing, configuring and hoping. Portfolio scale multiplies the maintenance, not the leverage.',
  },
]

/* ==========================================================================
   ZERO PLUGIN — the receipts
   Prices are the published list price of the standard paid tier at the time of
   writing, per year, for a single site. They are what an operator actually
   sees at checkout, and they are the reason the maths is so lopsided.
   ========================================================================== */

export type PluginRow = {
  job: string
  plugin: string
  cost: number
  module: string
}

export const PLUGIN_REPLACEMENTS: PluginRow[] = [
  { job: 'SEO titles, meta, schema', plugin: 'Yoast Premium / Rank Math Pro', cost: 99, module: 'SEO + Schema engine' },
  { job: 'XML sitemaps', plugin: 'Bundled with the SEO plugin', cost: 0, module: 'Pretty paginated sitemap' },
  { job: 'Page caching & minify', plugin: 'WP Rocket', cost: 59, module: 'Speed & Cache' },
  { job: 'Image compression & WebP', plugin: 'Smush Pro / ShortPixel', cost: 60, module: 'Image Optimizer' },
  { job: 'Rank tracking', plugin: 'Standalone rank tracker', cost: 180, module: 'Rank Tracker' },
  { job: 'Analytics + Search Console in wp-admin', plugin: 'Site Kit / MonsterInsights', cost: 99, module: 'Analytics dashboard' },
  { job: 'Instant indexing', plugin: 'Instant Indexing plugin', cost: 0, module: 'IndexNow + Google Indexing API' },
  { job: 'Affiliate link cloaking', plugin: 'ThirstyAffiliates / Pretty Links', cost: 79, module: 'Affiliate Links' },
  { job: 'Author box & E-E-A-T', plugin: 'Simple Author Box Pro', cost: 29, module: 'Author E-E-A-T profiles' },
  { job: 'Table of contents', plugin: 'Easy TOC Pro', cost: 25, module: 'Automatic TOC' },
  { job: 'FAQ / HowTo schema blocks', plugin: 'Schema Pro', cost: 79, module: 'Answer blocks' },
  { job: 'Social share buttons', plugin: 'Social Snap / Grow', cost: 39, module: 'Share Bar' },
  { job: 'Related posts', plugin: 'YARPP Pro / Contextual', cost: 25, module: 'Related sections' },
  { job: 'Header & footer scripts', plugin: 'Insert Headers and Footers', cost: 0, module: 'Script injection' },
  { job: 'Custom CSS per post', plugin: 'Simple Custom CSS', cost: 0, module: 'Custom CSS' },
  { job: 'AI article drafting', plugin: 'AI writer plugin', cost: 180, module: 'AI Writer' },
  { job: 'llms.txt for AI crawlers', plugin: 'No mainstream plugin does this', cost: 0, module: 'AI Visibility' },
  { job: 'AI crawler allow / deny control', plugin: 'No mainstream plugin does this', cost: 0, module: 'AI Crawlers' },
  { job: 'Markdown twin of every article', plugin: 'No mainstream plugin does this', cost: 0, module: 'Machine surfaces' },
  { job: 'Agent manifest + content API', plugin: 'No mainstream plugin does this', cost: 0, module: 'Machine surfaces' },
]

export const ANNUAL_STACK_COST = PLUGIN_REPLACEMENTS.reduce(
  (total, row) => total + row.cost,
  0,
)

/* ==========================================================================
   AGENTIC PROOF — what actually ships, and who else ships it
   ========================================================================== */

export type ProofRow = {
  capability: string
  detail: string
  themixify: boolean
  yoast: boolean
  rankmath: boolean
  generatepress: boolean
  kadence: boolean
}

export const AGENTIC_PROOF: ProofRow[] = [
  {
    capability: 'llms.txt generated from live content',
    detail: 'A curated Markdown map of the site, regenerated on every publish.',
    themixify: true, yoast: false, rankmath: false, generatepress: false, kadence: false,
  },
  {
    capability: 'llms-full.txt full-text corpus',
    detail: 'The whole site as paginated Markdown so a retriever ingests it in a few requests.',
    themixify: true, yoast: false, rankmath: false, generatepress: false, kadence: false,
  },
  {
    capability: 'Markdown twin of every article',
    detail: 'Append .md to any URL, or send Accept: text/markdown. YAML front matter included.',
    themixify: true, yoast: false, rankmath: false, generatepress: false, kadence: false,
  },
  {
    capability: 'Agent capability manifest',
    detail: '/.well-known/agent.json describes what the site holds and how to read it.',
    themixify: true, yoast: false, rankmath: false, generatepress: false, kadence: false,
  },
  {
    capability: 'OpenAPI document for the content API',
    detail: '/.well-known/openapi.json so an agent plans against a spec, not a guess.',
    themixify: true, yoast: false, rankmath: false, generatepress: false, kadence: false,
  },
  {
    capability: 'Read-only JSON content API',
    detail: 'index, content/{id} and search — clean text, heading outline, FAQ pairs.',
    themixify: true, yoast: false, rankmath: false, generatepress: false, kadence: false,
  },
  {
    capability: 'Per-bot AI crawler policy',
    detail: '22 crawlers, split into training / answer-index / user-fetch, written to robots.txt.',
    themixify: true, yoast: false, rankmath: false, generatepress: false, kadence: false,
  },
  {
    capability: 'AI crawler hit logging',
    detail: 'Which AI bots actually fetched you, how often, and when they last came.',
    themixify: true, yoast: false, rankmath: false, generatepress: false, kadence: false,
  },
  {
    capability: 'AEO / GEO readiness score per post',
    detail: 'Graded on answer-first structure, self-contained passages, evidence and authorship.',
    themixify: true, yoast: false, rankmath: false, generatepress: false, kadence: false,
  },
  {
    capability: 'Answer blocks that emit their own schema',
    detail: 'Direct answer, takeaways, HowTo, comparison table, statistic, definition, sources.',
    themixify: true, yoast: false, rankmath: false, generatepress: false, kadence: false,
  },
  {
    capability: 'Speakable specification for voice',
    detail: 'Points assistants at the exact block written to be read aloud.',
    themixify: true, yoast: false, rankmath: true, generatepress: false, kadence: false,
  },
  {
    capability: 'Connected JSON-LD @graph with stable @ids',
    detail: 'Organization, WebSite, WebPage, Article, Person, Breadcrumb, ItemList — one graph.',
    themixify: true, yoast: true, rankmath: true, generatepress: false, kadence: false,
  },
  {
    capability: 'Author E-E-A-T entity fields',
    detail: 'Role, employer, credentials, knowsAbout, sameAs — rendered and marked up.',
    themixify: true, yoast: false, rankmath: false, generatepress: false, kadence: false,
  },
  {
    capability: 'IndexNow push on publish',
    detail: 'Bing, Yandex, Seznam, Naver — and Bing feeds Copilot and ChatGPT.',
    themixify: true, yoast: false, rankmath: true, generatepress: false, kadence: false,
  },
  {
    capability: 'Built-in rank tracking',
    detail: 'Scheduled position checks with history, inside wp-admin.',
    themixify: true, yoast: false, rankmath: false, generatepress: false, kadence: false,
  },
  {
    capability: 'Analytics + Search Console dashboard',
    detail: 'GA4 and GSC data where you edit, not in another tab.',
    themixify: true, yoast: false, rankmath: false, generatepress: false, kadence: false,
  },
]

/* The endpoints an operator can verify on their own install in under a minute.
   Claims about "AI ready" are cheap; addresses that return content are not. */
export const AGENTIC_ENDPOINTS = [
  { path: '/llms.txt', what: 'Curated Markdown map of the site, with a one-line description per page.' },
  { path: '/llms-full.txt', what: 'Every article in full, as Markdown, paginated for large sites.' },
  { path: '/any-post.md', what: 'The Markdown twin of that article, with YAML front matter.' },
  { path: '/.well-known/agent.json', what: 'What this site is, what it holds, and the calls an agent may make.' },
  { path: '/.well-known/openapi.json', what: 'A machine-readable specification of the public read API.' },
  { path: '/wp-json/themixify/v1/index', what: 'Every published URL with title, summary, author and dates.' },
  { path: '/wp-json/themixify/v1/search?q=', what: 'Ranked search results as JSON, so agents query instead of crawling.' },
  { path: '/robots.txt', what: 'Your per-crawler AI policy, written out in full.' },
]

/* ==========================================================================
   FEATURES
   ========================================================================== */

export type FeatureGroup = {
  id: string
  eyebrow: string
  title: string
  blurb: string
  items: { name: string; body: string }[]
}

export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    id: 'agentic',
    eyebrow: 'Agentic layer',
    title: 'Built for the readers that do not have eyes',
    blurb:
      'Answer engines and AI agents do not browse your site — they retrieve chunks of it. Themixify hands them the content directly, in the shapes they consume, instead of leaving them to reverse-engineer your markup.',
    items: [
      { name: 'llms.txt & full corpus', body: 'A curated Markdown map plus the entire site as clean text, regenerated whenever you publish.' },
      { name: 'Markdown twin per article', body: 'Append .md to any URL. YAML front matter carries canonical, author, dates and licence so a quote can always be traced back to you.' },
      { name: 'Agent manifest & OpenAPI', body: 'Published at /.well-known/ so an autonomous client can discover what it may do here instead of scraping blindly.' },
      { name: 'JSON content API', body: 'Read-only index, article and search endpoints returning plain text, heading outline and FAQ pairs.' },
      { name: 'AI crawler policy', body: '22 named crawlers, controlled individually, split by purpose — because blocking training and blocking retrieval are opposite decisions.' },
      { name: 'Crawler activity log', body: 'See which AI systems actually fetched you. Most sites discover here that a firewall has been blocking them for months.' },
    ],
  },
  {
    id: 'aeo',
    eyebrow: 'Answer engineering',
    title: 'Write once, get quoted',
    blurb:
      'Featured snippets, People-Also-Ask entries and AI citations are all lifted from a single passage — never a whole article. These blocks produce that passage as a by-product of normal writing.',
    items: [
      { name: 'Direct answer block', body: 'A 40–60 word self-contained answer under the title. The single most-quoted structure on the page.' },
      { name: 'Key takeaways', body: 'A bulleted summary that survives chunking intact, so it gets retrieved as one unit.' },
      { name: 'HowTo steps', body: 'Numbered procedure with a stable anchor per step and HowTo schema emitted from the same input.' },
      { name: 'Comparison tables', body: 'Real semantic tables with scoped headers — the least contested snippet format there is.' },
      { name: 'Statistics & sources', body: 'An attributed figure is the most-cited unit in generative answers. The block makes attribution unavoidable.' },
      { name: 'FAQ, definitions, pros & cons', body: 'Each renders accessible HTML and contributes its own schema node. One input, never two truths.' },
    ],
  },
  {
    id: 'scoring',
    eyebrow: 'Editorial intelligence',
    title: 'A score that measures the right thing',
    blurb:
      'Every SEO plugin grades keyword density. Themixify grades whether an answer engine could lift a correct, self-contained passage out of your post — and tells you exactly what is missing.',
    items: [
      { name: 'AEO / GEO readiness score', body: 'Structure, extraction, evidence and trust — weighted, with a plain-English fix on every failed check.' },
      { name: 'Back-reference detector', body: 'Flags sections that open with "as we saw above". A retrieved chunk arrives without the rest of the page.' },
      { name: 'Answer-first analysis', body: 'Catches sections that promise an answer instead of giving one.' },
      { name: 'Chunk-size warnings', body: 'Sections that run long get truncated mid-thought by retrieval. The score says which ones.' },
      { name: 'Posts-list column', body: 'The score appears in the posts list, so your backlog is visible instead of theoretical.' },
      { name: 'SEO Health audit', body: 'Site-wide checks on canonicals, sitemaps, schema validity, alt text, orphan pages and broken links.' },
    ],
  },
  {
    id: 'growth',
    eyebrow: 'Growth suite',
    title: 'The tools you were renting, built in',
    blurb:
      'Rank tracking, analytics, indexing, affiliate links, image optimisation and caching — the same jobs, without the plugin stack, the renewals or the conflicts.',
    items: [
      { name: 'Rank Tracker', body: 'Scheduled Google position checks with history and change alerts, in wp-admin.' },
      { name: 'GA4 + Search Console', body: 'Impressions, clicks, CTR and position per URL, where you actually edit the content.' },
      { name: 'Instant indexing', body: 'IndexNow key generated automatically, auto-submit on publish, plus the Google Indexing API and a submission log.' },
      { name: 'Affiliate Links', body: 'Cloaked /go/ links, click counts and automatic rel="sponsored nofollow" on outbound links.' },
      { name: 'Image Optimizer', body: 'WebP conversion, compression and resizing on upload, with a bulk pass for the existing library.' },
      { name: 'Speed & Cache', body: 'Full-page cache for anonymous visitors, HTML minification and a one-click purge.' },
    ],
  },
  {
    id: 'speed',
    eyebrow: 'Performance',
    title: '100/100 because there is nothing to slow it down',
    blurb:
      'The fastest plugin is the one you never installed. Everything ships as one stylesheet and one small script, and the theme removes the WordPress overhead you never asked for.',
    items: [
      { name: 'Inlined critical CSS', body: 'The whole stylesheet is printed into the page, so the browser never waits on a CSS request.' },
      { name: 'Zero jQuery on the front end', body: 'One framework-free script, deferred. No render-blocking JavaScript at all.' },
      { name: 'LCP image prioritised', body: 'The hero image is eager with fetchpriority high; everything below it lazy-loads.' },
      { name: 'Speculation Rules', body: 'The browser prerenders the next article on intent, so navigation feels instant with no JavaScript.' },
      { name: 'Head cleanup', body: 'Emoji scripts, oEmbed discovery, generator tags and jQuery Migrate removed.' },
      { name: 'Security headers', body: 'nosniff, a strict referrer policy and a locked-down permissions policy, sent by default.' },
    ],
  },
  {
    id: 'design',
    eyebrow: 'Design & control',
    title: 'Yours, not ours',
    blurb:
      'Nothing about the theme announces the theme. Colours, fonts, homepage layout, header, footer and sidebar are all controlled from one panel, with sane defaults you never have to touch.',
    items: [
      { name: 'Homepage builder', body: 'Hero, post grids, category blocks, rich text and CTA sections, arranged without a page builder.' },
      { name: 'Live palette & typography', body: 'Brand colours drive CSS variables directly, applied on first paint so there is no flash.' },
      { name: 'Header & footer builder', body: 'Logo, menus, search, social icons, badges and widget columns.' },
      { name: 'Article sidebar', body: 'Search, author card, popular and recent posts — built in, no widget wrangling.' },
      { name: 'Block editor native', body: 'Full Gutenberg support with theme.json, editor styles and wide alignment.' },
      { name: 'Zero-config defaults', body: 'Fully optimised the moment it activates. Most owners never open the settings.' },
    ],
  },
]

/* ==========================================================================
   FAQ
   ========================================================================== */

export const FAQS = [
  {
    q: 'Is this really a one-time payment?',
    a: 'Yes. You pay once, you own that licence forever, and every future update and module is included. There is no renewal, no expiring update window and no upsell tier that unlocks the features you assumed were included.',
  },
  {
    q: 'What happens if I keep my SEO plugin?',
    a: 'Nothing breaks. Themixify detects Yoast, Rank Math, All in One SEO and The SEO Framework and stands its own meta and schema output down automatically, so you never get duplicate tags. The agentic layer, the answer blocks and the readiness score all keep working alongside them.',
  },
  {
    q: 'What exactly makes it "agentic"?',
    a: 'Every page has a machine twin. There is a Markdown version of every article, a curated llms.txt map, a full-text corpus, a read-only JSON content API, and a capability manifest at /.well-known/agent.json describing what an agent may do here. You can open all of them in a browser on your own install — see the Agentic SEO page for the full list.',
  },
  {
    q: 'Do I need to know anything about AI to use it?',
    a: 'No. The defaults are correct on activation: answer-engine crawlers allowed, training crawlers your choice, llms.txt generated from your live content. If you never open the settings, you are still ahead of every site that has not.',
  },
  {
    q: 'Will it work with my page builder?',
    a: 'Yes. Elementor, Bricks, Beaver Builder and the block editor all work. Themixify is native to Gutenberg, so block-built content needs nothing extra.',
  },
  {
    q: 'Can I really run with zero plugins?',
    a: 'For the growth stack, yes — SEO, schema, caching, image optimisation, rank tracking, analytics, indexing, affiliate links, author boxes, table of contents, share buttons and related posts are all built in. Keep a backup plugin and anything genuinely specific to your business. That is infrastructure, not a feature.',
  },
  {
    q: 'What about WooCommerce?',
    a: 'Themixify is a content and affiliate theme first. WooCommerce runs, but if a storefront is your primary surface you will want a commerce-first theme. We would rather tell you that now than take the sale.',
  },
  {
    q: 'How do updates work?',
    a: 'Updates arrive in wp-admin like any other theme, authenticated with your licence key. Your licence covers the number of sites in your plan and you can move an activation between sites at any time from your dashboard.',
  },
  {
    q: 'Is there a refund policy?',
    a: '30 days, no questions. Install it, run your own PageSpeed test, open your own /llms.txt, check your own AEO scores. If it does not do what this page says, ask and you get your money back.',
  },
  {
    q: 'Who is behind it?',
    a: 'Themixify is built by the team behind Writerify, an AI editorial workflow used to ship tens of thousands of published articles. The theme exists because we needed it for our own sites first.',
  },
]

/* ==========================================================================
   NUMBERS
   ========================================================================== */

export const STATS = [
  { value: '34', label: 'Built-in modules' },
  { value: '0', label: 'Plugins required' },
  { value: '100', label: 'PageSpeed, mobile & desktop' },
  { value: '22', label: 'AI crawlers under your control' },
]
