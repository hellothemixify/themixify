import type { Metadata } from 'next'
import { Button, Pill, Section, SectionHead } from '@/components/ui/primitives'
import { FAQS } from '@/lib/site'

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Straight answers about licensing, plugin compatibility, the agentic layer, page builders, WooCommerce, updates and refunds.',
}

export default function FaqPage() {
  return (
    <>
      <section className="pb-4 pt-14">
        <div className="container-page max-w-3xl text-center">
          <Pill className="mb-5">No sales copy in this section</Pill>
          <h1 className="text-balance text-[2.5rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-ink-950 sm:text-[3.1rem]">
            Questions, answered{' '}
            <span className="text-gradient">properly</span>
          </h1>
          <p className="mt-5 text-[1.04rem] leading-relaxed text-ink-700">
            Including the two where the honest answer is &ldquo;use something
            else&rdquo;.
          </p>
        </div>
      </section>

      <Section className="pt-10">
        <div className="mx-auto max-w-3xl space-y-3">
          {FAQS.map((faq) => (
            <details key={faq.q} className="surface-card group overflow-hidden p-0">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 text-[1rem] font-bold text-ink-950">
                {faq.q}
                <span className="shrink-0 text-[1.2rem] leading-none text-brand-500 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="border-t border-hairline px-6 py-4 text-[0.95rem] leading-relaxed text-ink-700">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="surface-card px-8 py-12 text-center">
          <SectionHead
            title={
              <>
                Still not sure?{' '}
                <span className="text-gradient">Just ask.</span>
              </>
            }
            blurb="A real person reads every message, and we would genuinely rather talk you out of a bad fit than process a refund later."
          />
          <div className="-mt-4">
            <Button href="/contact" size="lg">
              Contact us
            </Button>
          </div>
        </div>
      </Section>
    </>
  )
}
