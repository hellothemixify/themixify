import type { Metadata } from 'next'
import { ArrowRight, Check as CheckIcon, Minus } from 'lucide-react'
import {
  Button,
  Card,
  Pill,
  Rule,
  Section,
  SectionHead,
} from '@/components/ui/primitives'
import { AGENTIC_ENDPOINTS, AGENTIC_PROOF, SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Agentic SEO',
  description:
    'The technical dossier: llms.txt, Markdown twins, the agent manifest, the content API, per-crawler AI policy and the AEO/GEO readiness score — with a capability comparison against Yoast, Rank Math, GeneratePress and Kadence.',
}

type Column = {
  key: 'themixify' | 'yoast' | 'rankmath' | 'generatepress' | 'kadence'
  label: string
  highlight?: boolean
}

const COLUMNS: Column[] = [
  { key: 'themixify', label: 'Themixify', highlight: true },
  { key: 'yoast', label: 'Yoast' },
  { key: 'rankmath', label: 'Rank Math' },
  { key: 'generatepress', label: 'GeneratePress' },
  { key: 'kadence', label: 'Kadence' },
]

const themixifyOnly = AGENTIC_PROOF.filter(
  (row) =>
    row.themixify &&
    !row.yoast &&
    !row.rankmath &&
    !row.generatepress &&
    !row.kadence,
).length

export default function AgenticPage() {
  return (
    <>
      <section className="pb-6 pt-14">
        <div className="container-page max-w-3xl text-center">
          <Pill tone="warm" className="mb-5">
            The technical dossier
          </Pill>
          <h1 className="text-balance text-[2.5rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-ink-950 sm:text-[3.1rem]">
            Why we call it the{' '}
            <span className="text-gradient">
              world&apos;s first agentic theme
            </span>
          </h1>
          <p className="mt-5 text-pretty text-[1.06rem] leading-relaxed text-ink-700">
            Because a claim like that should be falsifiable. Everything below is
            either a URL you can open on your own install, or a capability you
            can go and check for in a competitor&apos;s documentation. We would
            rather be checked than believed.
          </p>
        </div>
      </section>

      {/* The argument */}
      <Section className="pt-10">
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            {
              n: '01',
              title: 'Search changed shape',
              body: 'Classical SEO ranked pages in a list. Answer engines extract a passage and show it instead of the list. Generative engines retrieve chunks, synthesise them and cite a handful of sources. You can hold your rankings and lose most of your clicks — and nothing in a traditional SEO plugin measures that, because it was designed for a search results page that no longer decides the outcome.',
            },
            {
              n: '02',
              title: 'The new readers cannot see',
              body: 'GPTBot, ClaudeBot, PerplexityBot, CCBot and Amazonbot do not execute JavaScript, do not render your CSS and do not care how the page looks. They read raw HTML, convert it to Markdown, split it into chunks and embed each one. Anything behind a script, a tab or a lazy-loaded panel simply does not exist to them.',
            },
            {
              n: '03',
              title: 'So the theme must speak twice',
              body: 'Once in HTML for people, and once in clean, structured, self-describing text for machines — from the same content, with no second CMS and no manual export. That second surface is what "agentic" means here, and it is the part no other WordPress theme ships.',
            },
          ].map((item) => (
            <Card key={item.n} hover>
              <span aria-hidden="true" className="text-[2rem] font-extrabold leading-none text-brand-400">
                {item.n}
              </span>
              <h2 className="mt-3 text-[1.15rem] font-bold text-ink-950">
                {item.title}
              </h2>
              <p className="mt-2.5 text-[0.92rem] leading-relaxed text-ink-700">
                {item.body}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Rule className="container-page" />

      {/* Comparison matrix */}
      <Section>
        <SectionHead
          eyebrow="Capability comparison"
          title={
            <>
              <span className="text-gradient">{themixifyOnly} capabilities</span>{' '}
              that exist in no other WordPress theme or SEO plugin
            </>
          }
          blurb="Checked against the current public documentation of each product. If any of these ship elsewhere by the time you read this, tell us and we will update the table — the claim is about what is available, not about who is cleverest."
        />

        <Card className="p-0">
          <div className="table-scroll">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead>
                <tr className="border-b border-hairline bg-brand-50/60">
                  <th className="sticky left-0 bg-brand-50 px-5 py-3.5 text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-brand-700">
                    Capability
                  </th>
                  {COLUMNS.map((column) => (
                    <th
                      key={column.key}
                      className={`px-4 py-3.5 text-center text-[0.7rem] font-extrabold uppercase tracking-[0.1em] ${
                        column.highlight ? 'text-brand-700' : 'text-ink-500'
                      }`}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {AGENTIC_PROOF.map((row) => (
                  <tr key={row.capability} className="border-b border-hairline last:border-0">
                    <th
                      scope="row"
                      className="sticky left-0 bg-white px-5 py-3.5 align-top"
                    >
                      <span className="block text-[0.9rem] font-semibold text-ink-950">
                        {row.capability}
                      </span>
                      <span className="mt-0.5 block max-w-md text-[0.8rem] leading-snug text-ink-500">
                        {row.detail}
                      </span>
                    </th>
                    {COLUMNS.map((column) => {
                      const has = row[column.key]
                      return (
                        <td key={column.key} className="px-4 py-3.5 text-center align-top">
                          {has ? (
                            <span
                              className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-white ${
                                column.highlight
                                  ? 'bg-[linear-gradient(130deg,#8b5cf6,#ec4899)]'
                                  : 'bg-ink-300'
                              }`}
                            >
                              <CheckIcon size={13} strokeWidth={3.2} />
                            </span>
                          ) : (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink-100 text-ink-500">
                              <Minus size={13} strokeWidth={3} />
                            </span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Section>

      <Rule className="container-page" />

      {/* Verify it yourself */}
      <Section>
        <SectionHead
          eyebrow="Verify it yourself"
          title={
            <>
              Eight addresses.{' '}
              <span className="text-gradient">Sixty seconds.</span>
            </>
          }
          blurb="Install the theme, then open these on your own domain. No screenshots, no marketing copy — either the content is there or it is not."
        />

        <div className="grid gap-4 md:grid-cols-2">
          {AGENTIC_ENDPOINTS.map((endpoint, index) => (
            <Card key={endpoint.path} hover className="flex gap-4">
              <span aria-hidden="true" className="mt-0.5 select-none text-[1.3rem] font-extrabold leading-none text-brand-400">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <code className="block truncate text-[0.88rem] font-bold text-brand-700">
                  {endpoint.path}
                </code>
                <p className="mt-1.5 text-[0.9rem] leading-relaxed text-ink-700">
                  {endpoint.what}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Rule className="container-page" />

      {/* The standard */}
      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <span className="text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-brand-600">
              How it was specified
            </span>
            <h2 className="mt-3 text-balance text-[2rem] font-extrabold leading-[1.14] tracking-tight text-ink-950">
              We wrote the standard first, then built to it
            </h2>
            <p className="mt-4 text-[1rem] leading-relaxed text-ink-700">
              Before a line of the agentic layer existed, we wrote a{' '}
              <strong>
                {SITE.checklistPages}-page, {SITE.checklistItems}-item build
                specification
              </strong>{' '}
              covering everything a theme must do to be found, understood,
              quoted and used — classical technical SEO, structured data, Core
              Web Vitals, accessibility, answer-engine formatting, generative
              retrieval, the agentic surfaces and the operational tooling around
              all of it.
            </p>
            <p className="mt-3 text-[1rem] leading-relaxed text-ink-700">
              Themixify is the implementation of that document. The checklist is
              public, because a standard nobody can audit is a marketing claim
              wearing a lab coat.
            </p>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-500">
              It is written by an operator, not a vendor: our founder has been
              doing this since a formal advanced search-engine-optimization
              certification in 2013, and has spent the decade since running
              content and affiliate sites through every algorithm shift between
              then and now.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href="/checklist">
                Read the {SITE.checklistItems}-point checklist
                <ArrowRight size={16} strokeWidth={2.6} />
              </Button>
              <Button href="/docs" variant="secondary">
                Implementation docs
              </Button>
            </div>
          </div>

          <Card className="p-0">
            <div className="border-b border-hairline px-6 py-5">
              <h3 className="text-[1rem] font-extrabold text-ink-950">
                What the specification covers
              </h3>
            </div>
            <ul className="divide-y divide-hairline text-[0.9rem]">
              {[
                ['Part A', 'Crawl, index & architecture', '6 sections'],
                ['Part B', 'On-page, semantics & links', '6 sections'],
                ['Part C', 'Structured data & entities', '4 sections'],
                ['Part D', 'Media, performance & access', '6 sections'],
                ['Part E', 'Content, authority & trust', '3 sections'],
                ['Part F', 'Answer Engine Optimization', '3 sections'],
                ['Part G', 'Generative Engine Optimization', '4 sections'],
                ['Part H', 'The agentic layer', '6 sections'],
                ['Part I', 'Vertical surfaces', '4 sections'],
                ['Part J', 'Operations & launch', '4 sections'],
              ].map(([part, title, count]) => (
                <li
                  key={part}
                  className="flex items-center gap-3 px-6 py-3"
                >
                  <span className="w-14 shrink-0 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-brand-600">
                    {part}
                  </span>
                  <span className="flex-1 font-semibold text-ink-950">
                    {title}
                  </span>
                  <span className="shrink-0 text-[0.78rem] font-medium text-ink-500">
                    {count}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(115deg,#5f2ab8_0%,#8b5cf6_30%,#ec4899_66%,#f97316_94%)] px-8 py-14 text-center text-white sm:px-14">
          <h2 className="text-balance text-[2rem] font-extrabold leading-tight tracking-tight sm:text-[2.5rem]">
            Be the source, not the search result
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[1.02rem] leading-relaxed text-white/90">
            The sites that get quoted in 2026 are the ones a machine can read
            cleanly, chunk sensibly and attribute confidently. That is a
            structural advantage, and structure is exactly what a theme controls.
          </p>
          <div className="mt-8">
            <Button href="/pricing" variant="secondary" size="lg">
              Get Themixify
              <ArrowRight size={16} strokeWidth={2.6} />
            </Button>
          </div>
        </div>
      </Section>
    </>
  )
}
