import type { Metadata } from 'next'
import { ArrowRight, AlertTriangle, ShieldCheck, Zap } from 'lucide-react'
import {
  Button,
  Card,
  Pill,
  Rule,
  Section,
  SectionHead,
} from '@/components/ui/primitives'
import { ANNUAL_STACK_COST, PLANS, PLUGIN_REPLACEMENTS } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Zero Plugin',
  description: `The plugin stack Themixify replaces, itemised, with published list prices. $${ANNUAL_STACK_COST} a year of subscriptions against one payment of $${PLANS[0].price}.`,
}

const FIVE_YEAR = ANNUAL_STACK_COST * 5

export default function ZeroPluginPage() {
  return (
    <>
      <section className="pb-6 pt-14">
        <div className="container-page max-w-3xl text-center">
          <Pill tone="warm" className="mb-5">
            World&apos;s first 0-plugin content theme
          </Pill>
          <h1 className="text-balance text-[2.5rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-ink-950 sm:text-[3.1rem]">
            The receipts for{' '}
            <span className="text-gradient">&ldquo;zero plugin&rdquo;</span>
          </h1>
          <p className="mt-5 text-pretty text-[1.06rem] leading-relaxed text-ink-700">
            Every theme claims to be lightweight. Almost none of them will tell
            you which plugins you can actually delete, because almost none of
            them replace any. Here is the itemised list, with the price each one
            charges you every year.
          </p>
        </div>
      </section>

      {/* Cost comparison */}
      <Section className="pt-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="text-center">
            <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-ink-500">
              Typical plugin stack
            </p>
            <p className="mt-2 text-[2.4rem] font-extrabold leading-none text-ink-950">
              ${ANNUAL_STACK_COST}
            </p>
            <p className="mt-1.5 text-[0.86rem] font-semibold text-ink-500">
              per year, per site
            </p>
          </Card>
          <Card className="text-center">
            <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-ink-500">
              Over five years
            </p>
            <p className="mt-2 text-[2.4rem] font-extrabold leading-none text-ink-950">
              ${FIVE_YEAR.toLocaleString()}
            </p>
            <p className="mt-1.5 text-[0.86rem] font-semibold text-ink-500">
              and still renting
            </p>
          </Card>
          <div className="rounded-[22px] bg-[linear-gradient(150deg,#8b5cf6,#ec4899,#f97316)] p-[1.5px]">
            <div className="h-full rounded-[21px] bg-white p-6 text-center">
              <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-brand-600">
                Themixify
              </p>
              <p className="text-gradient mt-2 text-[2.4rem] font-extrabold leading-none">
                ${PLANS[0].price}
              </p>
              <p className="mt-1.5 text-[0.86rem] font-bold text-brand-700">
                once, then never again
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-[0.86rem] text-ink-500">
          Prices are published list prices for the standard paid tier, single
          site, at the time of writing. Free tiers exist for some of these — and
          they are free precisely because they withhold the part you end up
          needing.
        </p>
      </Section>

      <Rule className="container-page" />

      {/* The table */}
      <Section>
        <SectionHead
          eyebrow="The full list"
          title={
            <>
              Twenty jobs.{' '}
              <span className="text-gradient">One theme.</span>
            </>
          }
          blurb="Four of these have no plugin equivalent at any price, because no plugin has built them yet. Those four are the reason the theme exists."
        />

        <Card className="p-0">
          <div className="table-scroll">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-hairline bg-brand-50/60">
                  <th className="px-5 py-3.5 text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-brand-700">
                    The job
                  </th>
                  <th className="px-5 py-3.5 text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-brand-700">
                    What you were paying
                  </th>
                  <th className="px-5 py-3.5 text-right text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-brand-700">
                    Per year
                  </th>
                  <th className="px-5 py-3.5 text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-brand-700">
                    Themixify module
                  </th>
                </tr>
              </thead>
              <tbody>
                {PLUGIN_REPLACEMENTS.map((row) => {
                  const unique = row.plugin.startsWith('No mainstream')
                  return (
                    <tr
                      key={row.job}
                      className={`border-b border-hairline last:border-0 ${
                        unique ? 'bg-[#fff8ee]' : ''
                      }`}
                    >
                      <th
                        scope="row"
                        className="px-5 py-3.5 text-[0.9rem] font-semibold text-ink-950"
                      >
                        {row.job}
                      </th>
                      <td className="px-5 py-3.5 text-[0.88rem] text-ink-700">
                        {unique ? (
                          <span className="font-bold text-[#b45309]">
                            {row.plugin}
                          </span>
                        ) : (
                          row.plugin
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right text-[0.88rem] font-bold text-ink-950">
                        {row.cost > 0 ? `$${row.cost}` : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-[0.88rem] font-bold text-brand-700">
                        {row.module}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-brand-50/60">
                  <td
                    colSpan={2}
                    className="px-5 py-4 text-[0.9rem] font-extrabold text-ink-950"
                  >
                    Annual subscription total
                  </td>
                  <td className="px-5 py-4 text-right text-[1.05rem] font-extrabold text-ink-950">
                    ${ANNUAL_STACK_COST}
                  </td>
                  <td className="text-gradient px-5 py-4 text-[1.05rem] font-extrabold">
                    ${PLANS[0].price} once
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </Section>

      <Rule className="container-page" />

      {/* Why it matters beyond money */}
      <Section>
        <SectionHead
          eyebrow="It was never only the money"
          title={
            <>
              Every plugin is also a{' '}
              <span className="text-gradient">liability</span>
            </>
          }
        />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Zap,
              title: 'Performance tax',
              body: 'Each plugin loads its own CSS and JavaScript on every page, whether that page uses it or not. Twelve plugins is twelve stylesheets fighting for the render path — which is why 100/100 stays out of reach no matter how well you compress the images.',
            },
            {
              icon: AlertTriangle,
              title: 'Update roulette',
              body: 'Plugins update independently, on their own schedules, against a WordPress core that is also moving. The stack that worked on Monday is one auto-update away from a white screen — usually on the site you were not watching.',
            },
            {
              icon: ShieldCheck,
              title: 'Attack surface',
              body: 'The overwhelming majority of WordPress compromises come through plugins, not core. Every one you remove is one fewer maintainer you have to trust with your database.',
            },
          ].map((item) => (
            <Card key={item.title} hover>
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(130deg,#8b5cf6,#ec4899)] text-white">
                <item.icon size={19} strokeWidth={2.2} />
              </span>
              <h3 className="text-[1.05rem] font-bold text-ink-950">
                {item.title}
              </h3>
              <p className="mt-2 text-[0.92rem] leading-relaxed text-ink-700">
                {item.body}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Honesty band */}
      <Section className="pt-0">
        <div className="surface-card border-l-4 border-l-brand-500 p-8">
          <h2 className="text-[1.3rem] font-extrabold text-ink-950">
            What we are <em className="not-italic text-brand-600">not</em>{' '}
            claiming
          </h2>
          <p className="mt-3 max-w-3xl text-[0.98rem] leading-relaxed text-ink-700">
            Keep a backup plugin — that is infrastructure, not a feature, and no
            theme should own your restores. Keep anything genuinely specific to
            your business: a membership system, a forms tool, a booking engine,
            a page builder you already like. And if a storefront is your primary
            surface, use a commerce-first theme; WooCommerce runs on Themixify,
            but we would rather say that now than take the sale and apologise
            later.
          </p>
          <p className="mt-3 max-w-3xl text-[0.98rem] leading-relaxed text-ink-700">
            &ldquo;Zero plugin&rdquo; means the <strong>growth stack</strong> —
            the twenty jobs in the table above — no longer needs one.
          </p>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="surface-card px-8 py-12 text-center">
          <h2 className="text-balance text-[1.9rem] font-extrabold leading-tight tracking-tight text-ink-950">
            Delete twelve plugins this afternoon
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[1rem] text-ink-700">
            Thirty-day refund. If your site is not faster and simpler by the end
            of the week, ask and you get your money back.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button href="/pricing" size="lg">
              Get Themixify — from ${PLANS[0].price}
              <ArrowRight size={16} strokeWidth={2.6} />
            </Button>
            <Button href="/features" variant="secondary" size="lg">
              See what replaces them
            </Button>
          </div>
        </div>
      </Section>
    </>
  )
}
