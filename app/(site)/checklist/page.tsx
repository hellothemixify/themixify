import type { Metadata } from 'next'
import { ArrowRight, FileText } from 'lucide-react'
import {
  Button,
  Card,
  Check,
  Pill,
  Rule,
  Section,
  SectionHead,
} from '@/components/ui/primitives'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'The build specification',
  description: `The ${SITE.checklistPages}-page, ${SITE.checklistItems}-item specification Themixify was built to — covering technical SEO, structured data, Core Web Vitals, accessibility, AEO, GEO and the agentic layer.`,
}

const PARTS = [
  {
    part: 'Part A',
    title: 'Foundations — crawl, index, architecture',
    sections: [
      'Document head & HTML contract',
      'Crawlability, robots & indexation',
      'Canonicalisation & duplicate control',
      'URL architecture & site structure',
      'XML sitemaps & discovery surfaces',
      'Instant indexing & push protocols',
    ],
  },
  {
    part: 'Part B',
    title: 'On-page, semantics & link architecture',
    sections: [
      'Titles, meta & SERP snippet control',
      'Semantic HTML & heading architecture',
      'Internal linking & link equity',
      'Pagination, facets & archives',
      'International SEO, i18n & RTL',
      'Feeds & syndication',
    ],
  },
  {
    part: 'Part C',
    title: 'Structured data & entity modelling',
    sections: [
      'The core schema graph',
      'Content-type schemas — the full matrix',
      'Entity & knowledge-graph optimization',
      'Speakable, voice & assistant surfaces',
    ],
  },
  {
    part: 'Part D',
    title: 'Media, performance & access',
    sections: [
      'Image SEO & delivery',
      'Video, audio & embeds',
      'Core Web Vitals engineering',
      'Caching, edge & delivery',
      'Mobile, responsive & input',
      'Accessibility as ranking substrate',
    ],
  },
  {
    part: 'Part E',
    title: 'Content, authority & trust',
    sections: [
      'E-E-A-T, authorship & trust',
      'Content quality, freshness & decay',
      'Engagement & UX signals',
    ],
  },
  {
    part: 'Part F',
    title: 'AEO — Answer Engine Optimization',
    sections: [
      'Snippet & direct-answer engineering',
      'Question coverage & PAA capture',
      'Answer-ready formatting primitives',
    ],
  },
  {
    part: 'Part G',
    title: 'GEO — Generative Engine Optimization',
    sections: [
      'Retrievability & chunk design',
      'Citation-worthiness signals',
      'AI crawler policy & licensing',
      'Brand entity & off-site consensus',
    ],
  },
  {
    part: 'Part H',
    title: 'The agentic layer',
    sections: [
      'llms.txt & the machine manifest family',
      'Machine-readable content surfaces',
      'Agent capability manifests & MCP',
      'Agentic actions & transactions',
      'Agent identity, auth & rate control',
      'Provenance, attribution & C2PA',
    ],
  },
  {
    part: 'Part I',
    title: 'Vertical surfaces',
    sections: [
      'Local & multi-location SEO',
      'E-commerce & product SEO',
      'News, Discover & publisher SEO',
      'Programmatic & long-tail surfaces',
    ],
  },
  {
    part: 'Part J',
    title: 'Operations, governance & launch',
    sections: [
      'Measurement, telemetry & consoles',
      'In-theme auditing & editor workflow',
      'Security, privacy & compliance',
      'Code standards, compatibility & launch',
    ],
  },
]

export default function ChecklistPage() {
  return (
    <>
      <section className="pb-4 pt-14">
        <div className="container-page max-w-3xl text-center">
          <Pill tone="warm" className="mb-5">
            <FileText size={12} strokeWidth={3} />
            The standard behind the theme
          </Pill>
          <h1 className="text-balance text-[2.5rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-ink-950 sm:text-[3.1rem]">
            {SITE.checklistItems} requirements.{' '}
            <span className="text-gradient">Nothing left to interpret.</span>
          </h1>
          <p className="mt-5 text-pretty text-[1.06rem] leading-relaxed text-ink-700">
            Before we wrote the agentic layer we wrote the specification for it:
            a {SITE.checklistPages}-page build document covering every
            requirement a site must satisfy to be found, understood, quoted and
            used — by a browser, a crawler, a retriever and an agent.
          </p>
          <p className="mt-4 text-[1rem] leading-relaxed text-ink-500">
            It is deliberately complete rather than novel. Items Themixify
            already implements sit alongside items nobody implements, so the
            document stays a valid specification for a theme built from zero.
          </p>
        </div>
      </section>

      <Section className="pt-10">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            [SITE.checklistPages, 'Pages'],
            ['46', 'Sections'],
            [`${SITE.checklistItems}+`, 'Individual requirements'],
          ].map(([value, label]) => (
            <Card key={label as string} className="text-center">
              <p className="text-gradient text-[2.4rem] font-extrabold leading-none">
                {value}
              </p>
              <p className="mt-2 text-[0.86rem] font-semibold text-ink-500">
                {label}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Rule className="container-page" />

      <Section>
        <SectionHead
          eyebrow="Contents"
          title="Ten parts, forty-six sections"
          blurb="Every requirement carries a stated implementation method and a priority, so a developer can start building from it without a single research task."
        />

        <div className="grid gap-4 md:grid-cols-2">
          {PARTS.map((group) => (
            <Card key={group.part} hover>
              <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-brand-600">
                {group.part}
              </span>
              <h3 className="mt-1.5 text-[1.08rem] font-bold leading-snug text-ink-950">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-1.5 border-t border-hairline pt-4">
                {group.sections.map((section) => (
                  <li
                    key={section}
                    className="flex items-start gap-2.5 text-[0.88rem] text-ink-700"
                  >
                    <Check />
                    {section}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(115deg,#5f2ab8_0%,#8b5cf6_30%,#ec4899_66%,#f97316_94%)] px-8 py-14 text-center text-white sm:px-14">
          <h2 className="text-balance text-[2rem] font-extrabold leading-tight tracking-tight sm:text-[2.4rem]">
            The theme is the implementation
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[1.02rem] leading-relaxed text-white/90">
            You could hand this document to a developer and build it yourself.
            It would take months, and you would still be maintaining it. Or you
            could install the version that is already finished.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/pricing" variant="secondary" size="lg">
              Get Themixify
              <ArrowRight size={16} strokeWidth={2.6} />
            </Button>
            <Button href="/agentic" variant="ghost" size="lg" className="text-white hover:bg-white/12">
              Read the dossier
            </Button>
          </div>
        </div>
      </Section>
    </>
  )
}
