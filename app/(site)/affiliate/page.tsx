import type { Metadata } from 'next'
import { ArrowRight, BadgePercent, Link2, Wallet } from 'lucide-react'
import {
  Button,
  Card,
  Check,
  Pill,
  Rule,
  Section,
  SectionHead,
} from '@/components/ui/primitives'
import { PLANS } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Affiliate program',
  description:
    'Earn 30% on every Themixify licence you refer. Lifetime cookie, monthly payouts, and a product people actually keep.',
}

const COMMISSION = 30

export default function AffiliatePage() {
  return (
    <>
      <section className="pb-4 pt-14">
        <div className="container-page max-w-3xl text-center">
          <Pill tone="warm" className="mb-5">
            <BadgePercent size={12} strokeWidth={3} />
            {COMMISSION}% commission
          </Pill>
          <h1 className="text-balance text-[2.5rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-ink-950 sm:text-[3.1rem]">
            Recommend something you{' '}
            <span className="text-gradient">actually use</span>
          </h1>
          <p className="mt-5 text-pretty text-[1.06rem] leading-relaxed text-ink-700">
            {COMMISSION}% of every sale, on a product with a 30-day refund
            window and no subscription to churn out of. You are not selling a
            trial — you are selling something people install once and stop
            thinking about.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/contact" size="lg">
              Apply to join
              <ArrowRight size={16} strokeWidth={2.6} />
            </Button>
            <Button href="/features" variant="secondary" size="lg">
              See what you would be promoting
            </Button>
          </div>
        </div>
      </section>

      <Section className="pt-10">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Wallet,
              title: `${COMMISSION}% per sale`,
              body: `From $${Math.round((PLANS[0].price * COMMISSION) / 100)} on a single-site licence to $${Math.round((PLANS[3].price * COMMISSION) / 100)} on the agency plan. Paid monthly once the refund window closes.`,
            },
            {
              icon: Link2,
              title: 'Lifetime attribution',
              body: 'A referral is yours from the first click. If they buy the single-site licence today and the agency plan next year, both are attributed to you.',
            },
            {
              icon: BadgePercent,
              title: 'Assets that convert',
              body: 'Comparison tables, the plugin-cost breakdown, screenshots and the full build specification — the same evidence that convinces you is what you get to hand your audience.',
            },
          ].map((item) => (
            <Card key={item.title} hover>
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(130deg,#8b5cf6,#ec4899)] text-white">
                <item.icon size={19} strokeWidth={2.2} />
              </span>
              <h2 className="text-[1.05rem] font-bold text-ink-950">{item.title}</h2>
              <p className="mt-2 text-[0.92rem] leading-relaxed text-ink-700">
                {item.body}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Rule className="container-page" />

      <Section>
        <SectionHead
          eyebrow="Who this works for"
          title="If your audience runs WordPress, this sells itself"
        />
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              title: 'SEO and marketing educators',
              body: 'Your audience already understands why AI Overviews are eating their clicks. Themixify is the first concrete thing they can install about it.',
            },
            {
              title: 'Affiliate and niche-site communities',
              body: 'Portfolio operators feel the plugin tax hardest — fifty sites means fifty stacks. The 10-site and 100-site plans exist precisely for them.',
            },
            {
              title: 'Freelancers and agencies',
              body: 'One purchase covers a hundred client sites, removes twelve plugins from every build, and turns maintenance retainers into margin.',
            },
            {
              title: 'Developer and blogging newsletters',
              body: 'The zero-plugin argument and the agentic dossier are both genuinely interesting reads, which makes them genuinely easy to write about.',
            },
          ].map((item) => (
            <Card key={item.title} hover>
              <h3 className="flex items-start gap-2.5 text-[1.02rem] font-bold text-ink-950">
                <Check />
                {item.title}
              </h3>
              <p className="mt-2 pl-[28px] text-[0.92rem] leading-relaxed text-ink-700">
                {item.body}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="surface-card border-l-4 border-l-brand-500 p-8">
          <h2 className="text-[1.25rem] font-extrabold text-ink-950">
            The rules, in plain language
          </h2>
          <ul className="mt-4 space-y-2.5 text-[0.95rem] leading-relaxed text-ink-700">
            <li className="flex items-start gap-2.5">
              <Check />
              Disclose the relationship. Every jurisdiction requires it and every
              reader deserves it.
            </li>
            <li className="flex items-start gap-2.5">
              <Check />
              No bidding on our brand terms, no coupon-site spam, no unsolicited
              email.
            </li>
            <li className="flex items-start gap-2.5">
              <Check />
              Describe the product accurately. If you write that it does
              something it does not, we will ask you to correct it.
            </li>
            <li className="flex items-start gap-2.5">
              <Check />
              Self-referrals do not pay out. Buy it at the normal price like
              everyone else — the refund window protects you either way.
            </li>
          </ul>
        </div>
      </Section>
    </>
  )
}
