import type { Metadata } from 'next'
import { LifeBuoy, Mail, MessageSquare } from 'lucide-react'
import { Card, Pill, Section } from '@/components/ui/primitives'
import { ContactForm } from '@/components/marketing/ContactForm'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Talk to the people who wrote the code. Pre-sales questions, support, licensing and partnerships.',
}

const ROUTES = [
  {
    icon: MessageSquare,
    title: 'Pre-sales',
    body: 'Not sure Themixify fits your site? Describe what you run and we will tell you honestly — including when the answer is that you need something else.',
  },
  {
    icon: LifeBuoy,
    title: 'Support',
    body: 'Licensed customers get answers from the developers, not a first-line queue. Include your licence key and the URL and we can usually skip three rounds of questions.',
  },
  {
    icon: Mail,
    title: 'Partnerships',
    body: 'Agencies, portfolio operators, course creators and affiliates. If you put Themixify in front of an audience, there is a programme for that.',
  },
]

export default function ContactPage() {
  return (
    <>
      <section className="pb-4 pt-14">
        <div className="container-page max-w-3xl text-center">
          <Pill className="mb-5">Usually answered within one business day</Pill>
          <h1 className="text-balance text-[2.5rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-ink-950 sm:text-[3.1rem]">
            Talk to the people who{' '}
            <span className="text-gradient">wrote the code</span>
          </h1>
          <p className="mt-5 text-[1.04rem] leading-relaxed text-ink-700">
            No chatbot, no ticket deflection funnel. Write in plain language and
            you will get a plain answer.
          </p>
        </div>
      </section>

      <Section className="pt-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div className="grid gap-4 content-start">
            {ROUTES.map((route) => (
              <Card key={route.title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(130deg,#8b5cf6,#ec4899)] text-white">
                  <route.icon size={18} strokeWidth={2.2} />
                </span>
                <div>
                  <h2 className="text-[1.02rem] font-bold text-ink-950">
                    {route.title}
                  </h2>
                  <p className="mt-1.5 text-[0.9rem] leading-relaxed text-ink-700">
                    {route.body}
                  </p>
                </div>
              </Card>
            ))}

            <Card>
              <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-ink-500">
                Direct email
              </p>
              <a
                href={`mailto:${SITE.email}`}
                className="mt-1.5 block text-[1.05rem] font-bold text-brand-600 hover:underline"
              >
                {SITE.email}
              </a>
            </Card>
          </div>

          <ContactForm />
        </div>
      </Section>
    </>
  )
}
