import type { Metadata } from 'next'
import { Section } from '@/components/ui/primitives'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'What Themixify collects, why, how long it is kept and how to have it removed.',
}

export default function PrivacyPage() {
  return (
    <Section className="pt-14">
      <div className="container-page max-w-3xl">
        <h1 className="text-[2.2rem] font-extrabold tracking-tight text-ink-950">
          Privacy
        </h1>
        <p className="mt-3 text-[0.9rem] text-ink-500">
          Last updated 26 July 2026.
        </p>

        <div className="prose-tm mt-8">
          <p>
            This page describes what we collect and why, in the same plain
            language we use everywhere else on this site. The short version: we
            collect what is needed to sell you a licence and support it, and
            nothing else.
          </p>

          <h2>What we collect</h2>
          <ul>
            <li>
              <strong>Account details.</strong> Your name and email address, so
              we can identify your licences and answer your support requests.
            </li>
            <li>
              <strong>Purchase records.</strong> Plan, amount and payment
              reference. Card details are handled entirely by the payment
              processor and never reach our servers.
            </li>
            <li>
              <strong>Licence activations.</strong> The domain a licence is
              installed on, so the site limit on your plan can be enforced and
              so you can move an activation yourself.
            </li>
            <li>
              <strong>Messages you send us.</strong> Kept so we have the context
              of a conversation when you come back to it.
            </li>
          </ul>

          <h2>What we do not collect</h2>
          <p>
            We do not read the content of your WordPress site, we do not receive
            your visitors&apos; data, and the theme does not phone home with
            anything beyond a licence check containing the domain and the key.
            Analytics inside the theme — Search Console, GA4, rank data — is
            fetched by <em>your</em> install with <em>your</em> credentials and
            is never transmitted to us.
          </p>

          <h2>Who else sees it</h2>
          <p>
            Our payment processor, to take the payment. Our database and hosting
            providers, as processors. Our email provider, to deliver replies. We
            do not sell data, we do not share it for advertising, and there is no
            third-party tracking script on this site.
          </p>

          <h2>How long we keep it</h2>
          <p>
            Account and licence records for as long as the licence exists,
            because a lifetime licence needs a lifetime record. Financial records
            for as long as tax law requires. Support messages for two years.
            Anything else, until you ask us to delete it.
          </p>

          <h2>Your rights</h2>
          <p>
            You can ask for a copy of everything we hold about you, ask us to
            correct it, or ask us to delete it. Deleting an account also
            invalidates its licences, so we will confirm that is what you meant
            before doing it. Write to{' '}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a> and a person will
            answer.
          </p>

          <h2>Cookies</h2>
          <p>
            One cookie, set by the authentication system to keep you signed in.
            There are no advertising cookies and no analytics cookies on this
            site.
          </p>
        </div>
      </div>
    </Section>
  )
}
