import type { Metadata } from 'next'
import { Section } from '@/components/ui/primitives'
import { PLANS, SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Terms',
  description:
    'Licence terms for Themixify: what one payment buys, how many sites it covers, updates, support and refunds.',
}

export default function TermsPage() {
  return (
    <Section className="pt-14">
      <div className="container-page max-w-3xl">
        <h1 className="text-[2.2rem] font-extrabold tracking-tight text-ink-950">
          Terms
        </h1>
        <p className="mt-3 text-[0.9rem] text-ink-500">
          Last updated 26 July 2026.
        </p>

        <div className="prose-tm mt-8">
          <h2>What your payment buys</h2>
          <p>
            A perpetual, non-exclusive licence to install and use Themixify on
            up to the number of websites in your plan — {PLANS[0].sites} on
            Single Site, through to {PLANS[3].sites} on the agency plan. The
            licence does not expire, and neither do your updates.
          </p>

          <h2>Sites and activations</h2>
          <p>
            An activation is bound to a domain. You may release an activation
            from your dashboard at any time and use the slot elsewhere —
            migrations, redesigns and client handovers are all normal, and none
            of them should cost you a slot. Staging and local development copies
            of a site you have already activated do not count separately.
          </p>

          <h2>What you may not do</h2>
          <ul>
            <li>
              Redistribute, resell or sublicense the theme files, whether
              modified or not.
            </li>
            <li>
              Publish the licence key, or use one licence across more sites than
              the plan allows.
            </li>
            <li>
              Remove or obscure the licensing mechanism in order to bypass the
              site limit.
            </li>
          </ul>
          <p>
            You may modify the theme for your own or your client&apos;s sites,
            build child themes, and keep using what you have built after the
            relationship ends.
          </p>

          <h2>Updates and support</h2>
          <p>
            Updates are delivered in wp-admin for as long as the product exists.
            Support is provided by email for licensed sites. We will help with
            the theme, its modules and its interaction with common plugins; we
            cannot debug unrelated third-party code or write your content for
            you.
          </p>

          <h2>Refunds</h2>
          <p>
            Thirty days from purchase, no questions asked. Email{' '}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a> and we will process
            it. A refund ends the licence and its activations — please
            deactivate before you ask, so nothing breaks unexpectedly on a live
            site.
          </p>

          <h2>No warranty of results</h2>
          <p>
            Themixify implements documented best practice thoroughly and
            verifiably, and every technical claim on this site is something you
            can check on your own install. What it cannot do is promise a
            ranking, a citation or a level of traffic: those depend on your
            content, your market and decisions made by companies neither of us
            controls. Anyone promising otherwise is selling something else.
          </p>

          <h2>Liability</h2>
          <p>
            The software is provided as-is. Our liability is limited to the
            amount you paid. Keep backups — that advice is worth more than any
            clause on this page.
          </p>

          <h2>Changes</h2>
          <p>
            If these terms change, the licence you already bought keeps the terms
            it was bought under. We will not retroactively reduce what you paid
            for.
          </p>
        </div>
      </div>
    </Section>
  )
}
