import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Headphones, RefreshCw, Rocket, ShieldCheck } from 'lucide-react'
import {
  Button,
  Card,
  Check,
  Pill,
  Rule,
  Section,
  SectionHead,
} from '@/components/ui/primitives'
import { ANNUAL_STACK_COST, FAQS, PLANS } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'One-time pricing from $69. Lifetime updates, premium support and every feature on every plan. No renewals, no pro tier, 30-day refund.',
}

const GUARANTEES = [
  {
    icon: RefreshCw,
    title: 'Lifetime updates',
    body: 'Every future module, every future release. The licence does not expire and the update channel never closes.',
  },
  {
    icon: Headphones,
    title: 'Premium support',
    body: 'Answered by the people who wrote the code, not a ticket queue reading from a script.',
  },
  {
    icon: Rocket,
    title: 'All features included',
    body: 'There is no pro tier above this. Price changes the number of sites, nothing else.',
  },
  {
    icon: ShieldCheck,
    title: '30-day refund',
    body: 'Install it, test it properly, and if it does not do what we said, ask for your money back.',
  },
]

export default function PricingPage() {
  return (
    <>
      <section className="pb-4 pt-14">
        <div className="container-page max-w-3xl text-center">
          <Pill tone="warm" className="mb-5">
            Simple. Flexible. Powerful.
          </Pill>
          <h1 className="text-balance text-[2.5rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-ink-950 sm:text-[3.1rem]">
            Choose the plan that{' '}
            <span className="text-gradient">fits you best</span>
          </h1>
          <p className="mt-5 text-pretty text-[1.06rem] leading-relaxed text-ink-700">
            One payment. Lifetime updates. Every feature on every plan. The
            plugin stack it replaces costs roughly{' '}
            <strong>${ANNUAL_STACK_COST} a year</strong> — this costs that once,
            and then never again.
          </p>
        </div>
      </section>

      {/* Plans */}
      <Section className="pt-10">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-[24px] p-[1.5px] ${
                plan.featured
                  ? 'bg-[linear-gradient(150deg,#8b5cf6,#ec4899,#f97316)] shadow-glow'
                  : 'bg-hairline'
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-[linear-gradient(100deg,#8b5cf6,#ec4899)] px-4 py-1 text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-white">
                  Best value
                </span>
              )}
              <div className="flex h-full flex-col rounded-[23px] bg-white p-7">
                <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-brand-600">
                  {plan.name}
                </p>
                <p className="mt-1 text-[0.84rem] text-ink-500">{plan.blurb}</p>

                <p className="mt-5 flex items-baseline gap-1.5">
                  <span className="text-[3rem] font-extrabold leading-none tracking-tight text-ink-950">
                    ${plan.price}
                  </span>
                  <span className="text-[0.84rem] font-semibold text-ink-500">
                    one-time
                  </span>
                </p>
                <p className="mt-2 text-[0.9rem] font-bold text-ink-900">
                  For {plan.sites}
                </p>

                <ul className="mt-6 flex-1 space-y-2.5 border-t border-hairline pt-6">
                  {plan.perks.map((perk) => (
                    <li
                      key={perk}
                      className="flex items-start gap-2.5 text-[0.9rem] text-ink-700"
                    >
                      <Check />
                      {perk}
                    </li>
                  ))}
                </ul>

                <Button
                  href={`/checkout?plan=${plan.id}`}
                  variant={plan.featured ? 'primary' : 'secondary'}
                  size="lg"
                  className="mt-7 w-full"
                >
                  Get started
                </Button>
                <p className="mt-3 text-center text-[0.74rem] text-ink-500">
                  ${plan.price} today, ${0} forever after
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Guarantees */}
      <Section className="pt-2">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GUARANTEES.map((item) => (
            <Card key={item.title} hover>
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(130deg,#8b5cf6,#ec4899)] text-white">
                <item.icon size={19} strokeWidth={2.2} />
              </span>
              <h3 className="text-[1rem] font-bold text-ink-950">{item.title}</h3>
              <p className="mt-2 text-[0.9rem] leading-relaxed text-ink-700">
                {item.body}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Rule className="container-page" />

      {/* Comparison against renting */}
      <Section>
        <SectionHead
          eyebrow="The honest maths"
          title={
            <>
              What five years actually{' '}
              <span className="text-gradient">costs</span>
            </>
          }
          blurb="Subscriptions are priced to feel small monthly and land hard annually. Here is the same decision, drawn out over the life of a site."
        />

        <Card className="p-0">
          <div className="table-scroll">
            <table className="w-full min-w-[600px] border-collapse text-left">
              <thead>
                <tr className="border-b border-hairline bg-brand-50/60">
                  <th className="px-6 py-4 text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-brand-700">
                    Year
                  </th>
                  <th className="px-6 py-4 text-right text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-brand-700">
                    Plugin stack
                  </th>
                  <th className="px-6 py-4 text-right text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-brand-700">
                    Themixify Single
                  </th>
                  <th className="px-6 py-4 text-right text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-brand-700">
                    You keep
                  </th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((year) => {
                  const stack = ANNUAL_STACK_COST * year
                  const ours = PLANS[0].price
                  return (
                    <tr key={year} className="border-b border-hairline last:border-0">
                      <th
                        scope="row"
                        className="px-6 py-3.5 text-[0.9rem] font-semibold text-ink-950"
                      >
                        After year {year}
                      </th>
                      <td className="px-6 py-3.5 text-right text-[0.9rem] font-semibold text-ink-700">
                        ${stack.toLocaleString()}
                      </td>
                      <td className="px-6 py-3.5 text-right text-[0.9rem] font-semibold text-ink-700">
                        ${ours}
                      </td>
                      <td className="px-6 py-3.5 text-right text-[0.95rem] font-extrabold text-[#15803d]">
                        ${(stack - ours).toLocaleString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="mt-4 text-center text-[0.84rem] text-ink-500">
          Based on published list prices for the tools itemised on the{' '}
          <Link href="/zero-plugin" className="font-semibold text-brand-600 underline">
            Zero Plugin page
          </Link>
          . Your stack may be cheaper. It is very unlikely to be free.
        </p>
      </Section>

      <Rule className="container-page" />

      {/* Pricing FAQ */}
      <Section>
        <SectionHead
          eyebrow="Before you buy"
          title="Questions people actually ask"
        />
        <div className="mx-auto max-w-3xl space-y-3">
          {FAQS.slice(0, 6).map((faq) => (
            <details
              key={faq.q}
              className="surface-card group overflow-hidden p-0"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 text-[1rem] font-bold text-ink-950">
                {faq.q}
                <span className="shrink-0 text-brand-500 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="border-t border-hairline px-6 py-4 text-[0.94rem] leading-relaxed text-ink-700">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button href="/faq" variant="secondary">
            All questions
            <ArrowRight size={16} strokeWidth={2.6} />
          </Button>
        </div>
      </Section>
    </>
  )
}
