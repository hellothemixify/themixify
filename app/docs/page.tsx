import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'
import {
  Button,
  Card,
  Pill,
  Rule,
  Section,
  SectionHead,
} from '@/components/ui/primitives'

export const metadata: Metadata = {
  title: 'Documentation',
  description:
    'Install, licence, configure and verify Themixify — plus the full reference for the answer blocks and the agentic endpoints.',
}

const QUICKSTART = [
  {
    step: '01',
    title: 'Install and activate',
    body: 'Upload the theme zip under Appearance → Themes → Add New, then activate. Nothing else is required: the SEO engine, schema graph, performance layer and agentic surfaces are all correct on activation.',
  },
  {
    step: '02',
    title: 'Enter your licence key',
    body: 'Themixify → Dashboard, paste the key from your account here, and press Activate. That binds one of your plan’s site slots and opens the update channel.',
  },
  {
    step: '03',
    title: 'Set the brand entity',
    body: 'Themixify → SEO → Brand entity. Name, description, social profiles, About and Contact pages. This is what search and answer engines use to resolve you to a single, citable organisation.',
  },
  {
    step: '04',
    title: 'Write your llms.txt summary',
    body: 'Themixify → AI Visibility. One paragraph describing what the site covers and who it is for. It is the first thing a language model reads about you.',
  },
  {
    step: '05',
    title: 'Choose your AI crawler policy',
    body: 'Themixify → AI Crawlers. Answer-engine and user-triggered crawlers are allowed by default; training crawlers are your call. Leave the defaults if you are unsure — they are deliberately the safe choice.',
  },
  {
    step: '06',
    title: 'Verify',
    body: 'Open /llms.txt, /robots.txt and any-post.md on your own domain. Then open a post in the editor and read its AEO readiness score.',
  },
]

const BLOCKS = [
  ['[tf_answer]', 'A 40–60 word direct answer under the title.'],
  ['[tf_takeaways]', 'Bulleted key-takeaways summary, one point per line.'],
  ['[tf_steps title="…" time="PT30M"]', 'Numbered procedure. One step per line, optional detail after a | pipe. Emits HowTo schema.'],
  ['[tf_compare caption="…"]', 'Comparison table. One row per line, cells separated by | pipes; first row is the header.'],
  ['[tf_proscons]', 'Lines starting with + are pros, lines starting with - are cons.'],
  ['[tf_define term="…"]', 'Definition block. Emits DefinedTerm schema.'],
  ['[tf_stat value="38%" source="…" url="…"]', 'An attributed statistic — the most-quoted unit in AI answers.'],
  ['[tf_quote author="…" role="…"]', 'Quotation attributed to a named expert.'],
  ['[tf_facts]', 'At-a-glance facts. "Label | Value" per line.'],
  ['[tf_sources]', 'Reference list. "Name | URL | Date" per line.'],
  ['[tf_updated date="2026-03-12"]', 'An update-log note describing what changed.'],
  ['[themify_faq]', 'FAQ accordion. "Q:" and "A:" lines. Emits FAQPage schema.'],
]

const PANELS = [
  ['General', 'Layout, sticky header, breadcrumbs, excerpt length and the performance toggles.'],
  ['Colors & Fonts', 'Brand palette and typography, applied on first paint so there is no flash.'],
  ['Homepage', 'Block builder for the front page: hero, grids, categories, rich text, CTA.'],
  ['SEO', 'Titles, meta, Open Graph, canonical, granular robots controls, brand entity, feeds, verification.'],
  ['AI Crawlers', 'Per-bot allow and deny, split by purpose, plus the crawler activity log.'],
  ['AI Visibility', 'llms.txt, the full-text corpus, Markdown twins, the content API and the agent manifest.'],
  ['Analytics', 'GA4 tag injection plus the GA4 and Search Console dashboard.'],
  ['Indexing', 'IndexNow key and auto-submit, the Google Indexing API, and the submission log.'],
  ['Rank Tracker', 'Scheduled Google position checks with history.'],
  ['SEO Health', 'Site-wide audit: canonicals, sitemaps, schema, alt text, orphans, broken links.'],
  ['Affiliate Links', 'Cloaked /go/ links, click counts and automatic sponsored rel attributes.'],
  ['Image Optimizer', 'WebP conversion, compression and resizing, plus a bulk pass.'],
  ['Speed & Cache', 'Full-page cache, HTML minification and one-click purge.'],
  ['AI Writer', 'Generate article drafts with Claude and save them as posts.'],
]

export default function DocsPage() {
  return (
    <>
      <section className="pb-4 pt-14">
        <div className="container-page max-w-3xl text-center">
          <Pill className="mb-5">
            <BookOpen size={12} strokeWidth={3} />
            Documentation
          </Pill>
          <h1 className="text-balance text-[2.5rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-ink-950 sm:text-[3.1rem]">
            From zip file to{' '}
            <span className="text-gradient">first citation</span>
          </h1>
          <p className="mt-5 text-[1.04rem] leading-relaxed text-ink-700">
            Six steps to a fully configured install. Most people finish in under
            ten minutes, and everything after step two is optional.
          </p>
        </div>
      </section>

      <Section className="pt-10">
        <SectionHead eyebrow="Quick start" title="Setting up" align="left" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {QUICKSTART.map((item) => (
            <Card key={item.step} hover>
              <span aria-hidden="true" className="text-[1.6rem] font-extrabold leading-none text-brand-400">
                {item.step}
              </span>
              <h3 className="mt-2.5 text-[1.05rem] font-bold text-ink-950">
                {item.title}
              </h3>
              <p className="mt-2 text-[0.9rem] leading-relaxed text-ink-700">
                {item.body}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Rule className="container-page" />

      <Section>
        <SectionHead
          eyebrow="Reference"
          title="Answer blocks"
          blurb="Paste a shortcode into the editor and fill it in. Each one renders accessible HTML and, where a schema.org type exists, emits it from the same input."
          align="left"
        />
        <Card className="p-0">
          <div className="table-scroll">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-hairline bg-brand-50/60">
                  <th className="px-5 py-3.5 text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-brand-700">
                    Shortcode
                  </th>
                  <th className="px-5 py-3.5 text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-brand-700">
                    What it produces
                  </th>
                </tr>
              </thead>
              <tbody>
                {BLOCKS.map(([code, what]) => (
                  <tr key={code} className="border-b border-hairline last:border-0">
                    <th scope="row" className="px-5 py-3 align-top">
                      <code className="text-[0.82rem] font-bold text-brand-700">
                        {code}
                      </code>
                    </th>
                    <td className="px-5 py-3 text-[0.9rem] text-ink-700">{what}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Section>

      <Rule className="container-page" />

      <Section>
        <SectionHead
          eyebrow="Reference"
          title="The admin panels"
          blurb="Everything lives under one Themixify menu in wp-admin. Every optimisation can be switched off, and the defaults are already the recommended settings."
          align="left"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PANELS.map(([name, what]) => (
            <div
              key={name}
              className="rounded-2xl border border-hairline bg-white p-5"
            >
              <h3 className="text-[0.95rem] font-bold text-ink-950">{name}</h3>
              <p className="mt-1.5 text-[0.87rem] leading-relaxed text-ink-700">
                {what}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="surface-card px-8 py-11 text-center">
          <h2 className="text-[1.6rem] font-extrabold text-ink-950">
            Cannot find what you need?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[0.98rem] text-ink-700">
            Support is answered by the people who wrote the code. Ask anything —
            including &ldquo;is this actually right for my site?&rdquo;
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="/contact">
              Contact support
              <ArrowRight size={16} strokeWidth={2.6} />
            </Button>
            <Link
              href="/checklist"
              className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-6 py-2.5 text-[0.9rem] font-semibold text-ink-950 transition hover:border-brand-300"
            >
              Read the build specification
            </Link>
          </div>
        </div>
      </Section>
    </>
  )
}
