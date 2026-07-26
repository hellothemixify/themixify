import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { Button, Card, Check, Section } from '@/components/ui/primitives'
import { PLANS } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: true },
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  const params = await searchParams
  const plan = PLANS.find((p) => p.id === params.plan) ?? PLANS[0]

  return (
    <Section className="pt-14">
      <div className="container-page max-w-[560px]">
        <Link
          href="/pricing"
          className="mb-6 inline-flex items-center gap-2 text-[0.88rem] font-semibold text-ink-700 hover:text-brand-600"
        >
          <ArrowLeft size={15} strokeWidth={2.4} />
          Back to pricing
        </Link>

        <Card>
          <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-brand-600">
            {plan.name}
          </p>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="text-[2.8rem] font-extrabold leading-none tracking-tight text-ink-950">
              ${plan.price}
            </span>
            <span className="text-[0.9rem] font-semibold text-ink-500">
              one-time
            </span>
          </p>
          <p className="mt-2 text-[0.95rem] font-bold text-ink-900">
            For {plan.sites}
          </p>

          <ul className="mt-6 space-y-2.5 border-t border-hairline pt-6">
            {plan.perks.map((perk) => (
              <li
                key={perk}
                className="flex items-start gap-2.5 text-[0.92rem] text-ink-700"
              >
                <Check />
                {perk}
              </li>
            ))}
          </ul>

          {/* The payment provider is wired in here. Until then, this screen
              states plainly what happens next rather than pretending to take a
              card — a checkout that silently fails is worse than one that is
              honest about being switched off. */}
          <div className="mt-7 rounded-2xl border border-brand-200 bg-brand-50 p-5">
            <h2 className="text-[0.95rem] font-extrabold text-brand-700">
              Payment is being connected
            </h2>
            <p className="mt-2 text-[0.88rem] leading-relaxed text-brand-700/85">
              Card checkout goes live with the public launch. Until then we take
              orders by email and issue the licence key by hand — usually within
              the hour, and with the same 30-day refund.
            </p>
          </div>

          <Button
            href={`/contact?plan=${plan.id}`}
            size="lg"
            className="mt-5 w-full"
          >
            Order the {plan.name} licence
          </Button>

          <p className="mt-4 flex items-center justify-center gap-2 text-[0.82rem] text-ink-500">
            <ShieldCheck size={14} className="text-brand-500" />
            30-day refund · lifetime updates · nothing renews
          </p>
        </Card>
      </div>
    </Section>
  )
}
