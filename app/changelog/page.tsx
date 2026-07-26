import type { Metadata } from 'next'
import { Card, Pill, Section } from '@/components/ui/primitives'

export const metadata: Metadata = {
  title: 'Changelog',
  description:
    'Every Themixify release, what shipped in it, and why. Lifetime updates means this list only ever gets longer.',
}

type Entry = {
  version: string
  date: string
  headline: string
  tag?: 'major' | 'feature' | 'fix'
  items: string[]
}

const RELEASES: Entry[] = [
  {
    version: '1.13.0',
    date: '2026-07-26',
    headline: 'The agentic layer',
    tag: 'major',
    items: [
      'llms.txt and llms-full.txt, generated from live content and regenerated on publish.',
      'A Markdown twin of every article at {permalink}.md, with YAML front matter and Accept: text/markdown negotiation.',
      'Read-only JSON content API: index, content/{id} and search, returning clean text, heading outline and FAQ pairs.',
      'Agent capability manifest and OpenAPI document at /.well-known/.',
      'AI crawler policy: 22 named crawlers grouped by purpose, written into robots.txt, with an activity log.',
      'Eleven answer blocks — direct answer, key takeaways, HowTo steps, comparison table, pros and cons, definition, statistic, expert quote, quick facts, sources and update log.',
      'AEO/GEO readiness score in the editor and as a posts-list column, including a back-reference detector and answer-first analysis.',
      'Author E-E-A-T fields: role, employer, credentials, education, experience, knowsAbout and sameAs, rendered and marked up as a ProfilePage entity.',
      'Schema graph extended with WebPage, CollectionPage, ProfilePage, SearchResultsPage, ItemList, speakable, about and mentions.',
      'Granular per-archive noindex controls, attachment-page redirects, a canonical override field and paginated self-canonicals.',
      'Open Graph image dimensions, alt text and article section, tag and author metadata.',
      'Speculation Rules for instant navigation, plus default security headers.',
      'JSON Feed 1.1 endpoint and a canonical attribution line on every feed item.',
    ],
  },
  {
    version: '1.12.0',
    date: '2026-07-20',
    headline: 'Sitemap, indexing and reading flow',
    tag: 'feature',
    items: [
      'Pretty paginated XML sitemap at /sitemap.xml with an XSL stylesheet and a sitemap index.',
      'Auto-load next post for continuous reading, with a toggle.',
      'Table of contents collapsed by default.',
      'Footer lifts above the open bottom post bar.',
    ],
  },
  {
    version: '1.11.0',
    date: '2026-07-12',
    headline: 'Layout and homepage control',
    tag: 'feature',
    items: [
      'Archive listings return to two columns; the four-column grid is scoped to homepage sections.',
      'Homepage builder blocks reordered and extended.',
      'Footer builder: social icons, payment badges and widget columns.',
    ],
  },
  {
    version: '1.10.0',
    date: '2026-07-02',
    headline: 'Growth suite',
    tag: 'major',
    items: [
      'Rank Tracker with scheduled position checks and history.',
      'GA4 and Search Console dashboard inside wp-admin.',
      'IndexNow with automatic key generation and submit-on-publish.',
      'SEO Health audit across canonicals, sitemaps, schema and alt text.',
      'Image Optimizer with WebP conversion and a bulk pass.',
      'Speed & Cache: full-page cache, HTML minification and one-click purge.',
    ],
  },
]

const TAGS: Record<string, { label: string; className: string }> = {
  major: {
    label: 'Major',
    className: 'bg-[linear-gradient(100deg,#8b5cf6,#ec4899)] text-white',
  },
  feature: { label: 'Feature', className: 'bg-brand-50 text-brand-700' },
  fix: { label: 'Fixes', className: 'bg-ink-100 text-ink-700' },
}

export default function ChangelogPage() {
  return (
    <>
      <section className="pb-4 pt-14">
        <div className="container-page max-w-3xl text-center">
          <Pill className="mb-5">Lifetime updates</Pill>
          <h1 className="text-balance text-[2.5rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-ink-950 sm:text-[3.1rem]">
            Everything we have{' '}
            <span className="text-gradient">shipped</span>
          </h1>
          <p className="mt-5 text-[1.04rem] leading-relaxed text-ink-700">
            Your licence covers every entry on this page and every entry that
            comes after it. There is no version you have to buy again.
          </p>
        </div>
      </section>

      <Section className="pt-10">
        <div className="mx-auto max-w-3xl space-y-5">
          {RELEASES.map((release) => {
            const tag = release.tag ? TAGS[release.tag] : null
            return (
              <Card key={release.version}>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[1.35rem] font-extrabold tracking-tight text-ink-950">
                    v{release.version}
                  </span>
                  {tag && (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[0.66rem] font-extrabold uppercase tracking-[0.1em] ${tag.className}`}
                    >
                      {tag.label}
                    </span>
                  )}
                  <span className="text-[0.84rem] text-ink-500">
                    {new Date(release.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <h2 className="mt-2 text-[1.1rem] font-bold text-ink-950">
                  {release.headline}
                </h2>
                <ul className="mt-4 space-y-2 border-t border-hairline pt-4">
                  {release.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-[0.92rem] leading-relaxed text-ink-700"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            )
          })}
        </div>
      </Section>
    </>
  )
}
