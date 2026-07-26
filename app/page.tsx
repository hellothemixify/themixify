import Link from 'next/link'
import {
  ArrowRight,
  Bot,
  CircleCheck,
  Gauge,
  Plug,
  Quote,
  ShieldCheck,
  Sparkles,
  Terminal,
  Wallet,
} from 'lucide-react'
import {
  Button,
  Card,
  Check,
  Pill,
  Rule,
  Section,
  SectionHead,
} from '@/components/ui/primitives'
import { HeroVisual } from '@/components/marketing/HeroVisual'
import {
  AGENTIC_ENDPOINTS,
  ANNUAL_STACK_COST,
  FEATURE_GROUPS,
  PAIN_POINTS,
  PLANS,
  SITE,
  STATS,
} from '@/lib/site'

export default function HomePage() {
  return (
    <>
      {/* ================================================================
          HERO
          ================================================================ */}
      <section className="relative overflow-hidden pb-10 pt-12 sm:pt-16">
        <div className="container-page">
          <div className="grid items-center gap-14 lg:grid-cols-[1.03fr_1fr]">
            <div className="animate-rise">
              <Pill tone="warm" className="mb-6">
                <Sparkles size={12} strokeWidth={3} />
                World&apos;s first agentic-optimized theme
              </Pill>

              <h1 className="text-balance text-[2.6rem] font-extrabold leading-[1.04] tracking-[-0.03em] text-ink-950 sm:text-[3.6rem]">
                Stop renting your stack.
                <br />
                <span className="text-gradient">Start getting cited.</span>
              </h1>

              <p className="mt-6 max-w-xl text-pretty text-[1.08rem] leading-relaxed text-ink-700">
                Themixify is the WordPress theme with the entire growth suite
                built in — SEO, schema, caching, rank tracking, indexing,
                analytics — and the first <strong>agentic layer</strong> that
                lets ChatGPT, Perplexity, Claude and Google&apos;s AI Overviews
                actually read, understand and quote your site.
              </p>
              <p className="mt-3 max-w-xl text-[1.02rem] font-semibold text-ink-900">
                Zero plugins. One payment. Nothing ever renews.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button href="/pricing" size="lg">
                  Get Themixify — from $69
                  <ArrowRight size={17} strokeWidth={2.6} />
                </Button>
                <Button href="/agentic" variant="secondary" size="lg">
                  See the proof
                </Button>
              </div>

              <ul className="mt-8 grid max-w-xl gap-2.5 sm:grid-cols-2">
                {[
                  'One-time payment, lifetime updates',
                  '100/100 PageSpeed, mobile & desktop',
                  'Works alongside Yoast or Rank Math',
                  '30-day no-questions refund',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-[0.92rem] font-medium text-ink-700"
                  >
                    <Check />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <HeroVisual />
          </div>
        </div>
      </section>

      {/* ================================================================
          STAT STRIP
          ================================================================ */}
      <section className="py-8">
        <div className="container-page">
          <div className="surface-card grid grid-cols-2 gap-6 px-7 py-7 md:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-gradient text-[2.2rem] font-extrabold leading-none tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-[0.8rem] font-semibold text-ink-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          THE PAIN
          ================================================================ */}
      <Section id="pain">
        <SectionHead
          eyebrow="If you run a content site, you know"
          title={
            <>
              None of this is a{' '}
              <span className="text-gradient">theme problem</span>. That is
              exactly why nobody fixed it.
            </>
          }
          blurb="Themes handle layout. Plugins handle everything else. So the eight things that actually decide whether your site earns are spread across a dozen vendors, none of whom talk to each other."
        />

        <div className="grid gap-4 md:grid-cols-2">
          {PAIN_POINTS.map((point, index) => (
            <Card key={point.title} hover className="flex gap-4">
              <span className="mt-0.5 select-none text-[1.6rem] font-extrabold leading-none text-brand-200">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-[1.02rem] font-bold leading-snug text-ink-950">
                  {point.title}
                </h3>
                <p className="mt-2 text-[0.92rem] leading-relaxed text-ink-700">
                  {point.body}
                </p>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-10 rounded-[24px] bg-[linear-gradient(100deg,#8b5cf6_0%,#ec4899_50%,#f97316_100%)] p-[1.5px]">
          <div className="rounded-[23px] bg-white px-8 py-9 text-center">
            <p className="text-balance text-[1.3rem] font-extrabold leading-snug text-ink-950 sm:text-[1.55rem]">
              Themixify was built because we had all eight problems on our own
              sites, and no combination of plugins solved more than four.
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-[0.98rem] text-ink-700">
              So we stopped assembling and started building. Every module below
              exists because something we were paying for did the job badly, or
              because nothing on the market did it at all.
            </p>
          </div>
        </div>
      </Section>

      <Rule className="container-page" />

      {/* ================================================================
          ZERO PLUGIN
          ================================================================ */}
      <Section id="zero-plugin">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <Pill className="mb-5">
              <Plug size={12} strokeWidth={3} />
              Zero plugin
            </Pill>
            <h2 className="text-balance text-3xl font-extrabold leading-[1.12] tracking-tight text-ink-950 sm:text-[2.6rem]">
              The plugin stack you are renting costs{' '}
              <span className="text-gradient">
                ${ANNUAL_STACK_COST.toLocaleString()} a year
              </span>
              . Every year.
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-ink-700">
              That is the published list price of the tools Themixify replaces —
              SEO, cache, images, rank tracking, analytics, indexing, affiliate
              links, schema, author boxes, share buttons and the rest. It renews
              whether the site earned that month or not.
            </p>
            <p className="mt-4 text-[1.02rem] leading-relaxed text-ink-700">
              Themixify is <strong>${PLANS[0].price}, once</strong>. Four
              modules on the list have no plugin equivalent at any price,
              because nobody else has built them yet.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-hairline bg-white p-5">
                <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-ink-500">
                  Plugin stack
                </p>
                <p className="mt-1.5 text-[1.9rem] font-extrabold leading-none text-ink-950">
                  ${ANNUAL_STACK_COST}
                  <span className="text-[0.9rem] font-semibold text-ink-500">
                    /yr
                  </span>
                </p>
                <p className="mt-2 text-[0.84rem] text-ink-500">
                  ×5 years = ${(ANNUAL_STACK_COST * 5).toLocaleString()}
                </p>
              </div>
              <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
                <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-brand-600">
                  Themixify
                </p>
                <p className="text-gradient mt-1.5 text-[1.9rem] font-extrabold leading-none">
                  ${PLANS[0].price}
                  <span className="text-[0.9rem] font-semibold text-brand-600">
                    {' '}
                    once
                  </span>
                </p>
                <p className="mt-2 text-[0.84rem] font-semibold text-brand-700">
                  ×5 years = ${PLANS[0].price}
                </p>
              </div>
            </div>

            <div className="mt-7">
              <Button href="/zero-plugin" variant="secondary">
                See the full replacement table
                <ArrowRight size={16} strokeWidth={2.6} />
              </Button>
            </div>
          </div>

          <Card className="p-0">
            <div className="border-b border-hairline px-6 py-5">
              <h3 className="text-[1.02rem] font-extrabold text-ink-950">
                What comes out of your wp-admin
              </h3>
              <p className="mt-1 text-[0.86rem] text-ink-500">
                A typical content site, before and after.
              </p>
            </div>
            <ul className="divide-y divide-hairline">
              {[
                ['SEO plugin', 'SEO + Schema engine'],
                ['Cache plugin', 'Speed & Cache'],
                ['Image optimizer', 'Image Optimizer'],
                ['Rank tracker', 'Rank Tracker'],
                ['Analytics plugin', 'Analytics dashboard'],
                ['Instant indexing', 'IndexNow + Google API'],
                ['Affiliate cloaker', 'Affiliate Links'],
                ['Author box', 'Author E-E-A-T'],
                ['Table of contents', 'Automatic TOC'],
                ['Schema add-on', 'Answer blocks'],
                ['Share buttons', 'Share Bar'],
                ['Related posts', 'Related sections'],
              ].map(([from, to]) => (
                <li
                  key={from}
                  className="flex items-center gap-3 px-6 py-3 text-[0.9rem]"
                >
                  <span className="w-[42%] font-medium text-ink-500 line-through decoration-flare-400/70">
                    {from}
                  </span>
                  <ArrowRight
                    size={14}
                    className="shrink-0 text-brand-300"
                    strokeWidth={2.6}
                  />
                  <span className="flex-1 font-bold text-ink-950">{to}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-hairline bg-brand-50/50 px-6 py-4 text-center text-[0.88rem] font-bold text-brand-700">
              12 plugins removed · 0 added
            </div>
          </Card>
        </div>
      </Section>

      <Rule className="container-page" />

      {/* ================================================================
          AGENTIC
          ================================================================ */}
      <Section id="agentic">
        <SectionHead
          eyebrow="The part nobody else has built"
          title={
            <>
              Your next reader{' '}
              <span className="text-gradient">does not have eyes</span>
            </>
          }
          blurb="GPTBot, ClaudeBot, PerplexityBot and CCBot do not run JavaScript, do not see your design, and do not care about your keyword density. They retrieve chunks of text and decide whether to quote them. Themixify hands them the content directly."
        />

        <div className="grid gap-5 lg:grid-cols-[1.05fr_1fr]">
          <Card className="p-0">
            <div className="flex items-center gap-2.5 border-b border-hairline px-6 py-4">
              <Terminal size={16} className="text-brand-600" />
              <h3 className="text-[0.98rem] font-extrabold text-ink-950">
                Open these on your own install
              </h3>
            </div>
            <ul className="divide-y divide-hairline">
              {AGENTIC_ENDPOINTS.map((endpoint) => (
                <li key={endpoint.path} className="px-6 py-3.5">
                  <code className="text-[0.82rem] font-bold text-brand-700">
                    {endpoint.path}
                  </code>
                  <p className="mt-1 text-[0.86rem] leading-relaxed text-ink-700">
                    {endpoint.what}
                  </p>
                </li>
              ))}
            </ul>
            <div className="border-t border-hairline bg-brand-50/50 px-6 py-4 text-[0.86rem] font-semibold text-brand-700">
              Every claim on this page is a URL you can open. That is the whole
              argument.
            </div>
          </Card>

          <div className="grid gap-4 content-start">
            {[
              {
                icon: Bot,
                title: 'A machine twin of every article',
                body: 'Append .md to any URL and get clean Markdown with YAML front matter — canonical, author, dates, licence. An extracted quote can always be traced back to you.',
              },
              {
                icon: ShieldCheck,
                title: '22 AI crawlers, controlled individually',
                body: 'Training, answer-indexing and user-triggered fetching are three different permissions. Themixify is the only theme that treats them that way — and logs which bots actually arrive.',
              },
              {
                icon: Quote,
                title: 'Blocks that get quoted',
                body: 'Direct answer, key takeaways, HowTo steps, comparison tables, attributed statistics. Each renders accessible HTML and emits its own schema from the same input.',
              },
              {
                icon: Gauge,
                title: 'A score that grades citability',
                body: 'Not keyword density — whether an answer engine could lift a correct, self-contained passage out of your post. With a plain-English fix on every failed check.',
              },
            ].map((item) => (
              <Card key={item.title} hover className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(130deg,#8b5cf6,#ec4899)] text-white">
                  <item.icon size={18} strokeWidth={2.2} />
                </span>
                <div>
                  <h3 className="text-[1rem] font-bold text-ink-950">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[0.9rem] leading-relaxed text-ink-700">
                    {item.body}
                  </p>
                </div>
              </Card>
            ))}
            <Button href="/agentic" variant="secondary" className="mt-1 self-start">
              Read the full technical dossier
              <ArrowRight size={16} strokeWidth={2.6} />
            </Button>
          </div>
        </div>
      </Section>

      <Rule className="container-page" />

      {/* ================================================================
          FEATURES
          ================================================================ */}
      <Section id="features">
        <SectionHead
          eyebrow={`${SITE.moduleCount} modules, one theme`}
          title={
            <>
              Everything a content site needs.{' '}
              <span className="text-gradient">Nothing it does not.</span>
            </>
          }
          blurb="Each module replaces something you were paying for, or does something no plugin does yet. All of it is toggleable, and all of it is already correct the moment the theme activates."
        />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURE_GROUPS.map((group) => (
            <Card key={group.id} hover className="flex flex-col">
              <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-brand-600">
                {group.eyebrow}
              </span>
              <h3 className="mt-2 text-[1.18rem] font-extrabold leading-snug text-ink-950">
                {group.title}
              </h3>
              <p className="mt-2.5 text-[0.9rem] leading-relaxed text-ink-700">
                {group.blurb}
              </p>
              <ul className="mt-5 space-y-2 border-t border-hairline pt-5">
                {group.items.slice(0, 6).map((item) => (
                  <li
                    key={item.name}
                    className="flex items-start gap-2.5 text-[0.88rem] font-medium text-ink-900"
                  >
                    <CircleCheck
                      size={15}
                      className="mt-0.5 shrink-0 text-brand-500"
                      strokeWidth={2.4}
                    />
                    {item.name}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div className="mt-9 text-center">
          <Button href="/features" variant="secondary" size="lg">
            Every feature, explained
            <ArrowRight size={16} strokeWidth={2.6} />
          </Button>
        </div>
      </Section>

      {/* ================================================================
          PRICING PREVIEW
          ================================================================ */}
      <Section id="pricing" className="pb-8">
        <SectionHead
          eyebrow="Simple. Flexible. Powerful."
          title={
            <>
              Choose the plan that{' '}
              <span className="text-gradient">fits you best</span>
            </>
          }
          blurb="All plans include lifetime updates, premium support and every feature. There is no pro tier hiding behind this one."
        />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-[22px] p-[1.5px] ${
                plan.featured
                  ? 'bg-[linear-gradient(150deg,#8b5cf6,#ec4899,#f97316)]'
                  : 'bg-hairline'
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-[linear-gradient(100deg,#8b5cf6,#ec4899)] px-3.5 py-1 text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-white shadow-glow">
                  Best value
                </span>
              )}
              <div className="flex h-full flex-col rounded-[21px] bg-white p-6">
                <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-brand-600">
                  {plan.name}
                </p>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className="text-[2.6rem] font-extrabold leading-none tracking-tight text-ink-950">
                    ${plan.price}
                  </span>
                  <span className="text-[0.82rem] font-semibold text-ink-500">
                    once
                  </span>
                </p>
                <p className="mt-1.5 text-[0.86rem] font-semibold text-ink-700">
                  For {plan.sites}
                </p>
                <ul className="mt-5 flex-1 space-y-2.5 border-t border-hairline pt-5">
                  {plan.perks.map((perk) => (
                    <li
                      key={perk}
                      className="flex items-start gap-2.5 text-[0.88rem] text-ink-700"
                    >
                      <Check />
                      {perk}
                    </li>
                  ))}
                </ul>
                <Button
                  href="/pricing"
                  variant={plan.featured ? 'primary' : 'secondary'}
                  className="mt-6 w-full"
                >
                  Get started
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[0.86rem] font-semibold text-ink-700">
          {[
            [Wallet, 'One-time payment'],
            [ShieldCheck, '30-day refund'],
            [Gauge, 'Lifetime updates'],
            [Sparkles, 'Every future module included'],
          ].map(([Icon, label]) => {
            const IconComponent = Icon as typeof Wallet
            return (
              <span key={label as string} className="inline-flex items-center gap-2">
                <IconComponent size={15} className="text-brand-500" />
                {label as string}
              </span>
            )
          })}
        </div>
      </Section>

      {/* ================================================================
          FINAL CTA
          ================================================================ */}
      <Section>
        <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(115deg,#5f2ab8_0%,#8b5cf6_28%,#ec4899_62%,#f97316_92%)] px-8 py-16 text-center text-white sm:px-14">
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 20%, rgba(255,255,255,.35), transparent 42%), radial-gradient(circle at 82% 78%, rgba(255,255,255,.28), transparent 46%)',
            }}
          />
          <div className="relative">
            <h2 className="text-balance text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-[2.8rem]">
              Ship faster. Rank higher.
              <br />
              Get quoted by the machines.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-[1.05rem] leading-relaxed text-white/90">
              Install it, run your own PageSpeed test, open your own{' '}
              <code className="rounded bg-white/20 px-1.5 py-0.5 text-[0.9em] font-semibold">
                /llms.txt
              </code>
              , read your own AEO scores. If it does not do what this page says,
              you get your money back for thirty days.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-[1rem] font-extrabold text-ink-950 shadow-lift transition hover:-translate-y-0.5"
              >
                Get Themixify — from ${PLANS[0].price}
                <ArrowRight size={17} strokeWidth={2.8} />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-full border border-white/45 px-7 py-3.5 text-[1rem] font-bold text-white transition hover:bg-white/12"
              >
                Read the docs
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
