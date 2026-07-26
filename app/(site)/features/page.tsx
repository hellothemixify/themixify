import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import {
  Button,
  Card,
  Check,
  Pill,
  Rule,
  Section,
  SectionHead,
} from '@/components/ui/primitives'
import { FEATURE_GROUPS, SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Features',
  description: `All ${SITE.moduleCount} built-in modules: the agentic layer, answer blocks, the AEO readiness score, rank tracking, analytics, indexing, caching, image optimisation and the design system.`,
}

export default function FeaturesPage() {
  return (
    <>
      <section className="pb-6 pt-14">
        <div className="container-page max-w-3xl text-center">
          <Pill className="mb-5">{SITE.moduleCount} modules · 0 plugins</Pill>
          <h1 className="text-balance text-[2.5rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-ink-950 sm:text-[3.1rem]">
            Every feature, and{' '}
            <span className="text-gradient">why it exists</span>
          </h1>
          <p className="mt-5 text-pretty text-[1.06rem] leading-relaxed text-ink-700">
            Nothing here is a checkbox added to lengthen a list. Each module
            replaces a tool we were paying for and found wanting, or does
            something no plugin on the market does yet.
          </p>
        </div>
      </section>

      {FEATURE_GROUPS.map((group, index) => (
        <div key={group.id}>
          {index > 0 && <Rule className="container-page" />}
          <Section id={group.id}>
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="lg:sticky lg:top-24 lg:self-start">
                <span className="text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-brand-600">
                  {group.eyebrow}
                </span>
                <h2 className="mt-3 text-balance text-[1.9rem] font-extrabold leading-[1.15] tracking-tight text-ink-950">
                  {group.title}
                </h2>
                <p className="mt-4 text-pretty text-[1rem] leading-relaxed text-ink-700">
                  {group.blurb}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {group.items.map((item) => (
                  <Card key={item.name} hover>
                    <h3 className="flex items-start gap-2.5 text-[1rem] font-bold text-ink-950">
                      <Check />
                      {item.name}
                    </h3>
                    <p className="mt-2 pl-[28px] text-[0.9rem] leading-relaxed text-ink-700">
                      {item.body}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </Section>
        </div>
      ))}

      <Section>
        <div className="surface-card px-8 py-12 text-center">
          <SectionHead
            title={
              <>
                All of it, on{' '}
                <span className="text-gradient">every plan</span>
              </>
            }
            blurb="There is no pro tier. The only thing the price changes is how many sites you may install on."
          />
          <div className="-mt-4 flex flex-wrap justify-center gap-3">
            <Button href="/pricing" size="lg">
              See pricing
              <ArrowRight size={16} strokeWidth={2.6} />
            </Button>
            <Button href="/agentic" variant="secondary" size="lg">
              Read the agentic dossier
            </Button>
          </div>
        </div>
      </Section>
    </>
  )
}
