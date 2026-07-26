'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button, Card } from '@/components/ui/primitives'
import { submitContactMessage } from '@/lib/queries'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')
    setError('')

    const form = new FormData(event.currentTarget)
    const result = await submitContactMessage({
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      topic: String(form.get('topic') ?? 'presales'),
      message: String(form.get('message') ?? ''),
    })

    if (result.ok) {
      setStatus('sent')
      event.currentTarget.reset()
    } else {
      setStatus('error')
      setError(result.error ?? 'Something went wrong. Please email us instead.')
    }
  }

  if (status === 'sent') {
    return (
      <Card className="flex min-h-[380px] flex-col items-center justify-center text-center">
        <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(130deg,#8b5cf6,#ec4899)] text-[1.4rem] text-white">
          ✓
        </span>
        <h2 className="text-[1.3rem] font-extrabold text-ink-950">
          Message received
        </h2>
        <p className="mt-2 max-w-sm text-[0.95rem] text-ink-700">
          We read everything and answer in the order it arrives — usually within
          one business day.
        </p>
      </Card>
    )
  }

  const field =
    'w-full rounded-xl border border-hairline bg-white px-4 py-3 text-[0.94rem] text-ink-950 outline-none transition placeholder:text-ink-300 focus:border-brand-400 focus:ring-4 focus:ring-brand-100'

  return (
    <Card>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-[0.8rem] font-bold text-ink-900"
            >
              Your name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              className={field}
              placeholder="Jane Ahmed"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-[0.8rem] font-bold text-ink-900"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={field}
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="topic"
            className="mb-1.5 block text-[0.8rem] font-bold text-ink-900"
          >
            What is this about?
          </label>
          <select id="topic" name="topic" className={field} defaultValue="presales">
            <option value="presales">Pre-sales question</option>
            <option value="support">Support</option>
            <option value="licensing">Licensing</option>
            <option value="partnership">Partnership or affiliate</option>
            <option value="other">Something else</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="message"
            className="mb-1.5 block text-[0.8rem] font-bold text-ink-900"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={7}
            className={`${field} resize-y`}
            placeholder="Tell us about your site — what you publish, how many sites you run, and what is currently in your way."
          />
        </div>

        {status === 'error' && (
          <p className="rounded-xl bg-[#fdecec] px-4 py-3 text-[0.88rem] font-medium text-[#b3261e]">
            {error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={status === 'sending'}
        >
          {status === 'sending' ? 'Sending…' : 'Send message'}
          <Send size={16} strokeWidth={2.4} />
        </Button>

        <p className="text-center text-[0.78rem] text-ink-500">
          We use your details to answer you and nothing else. No newsletter
          signup hidden in this button.
        </p>
      </form>
    </Card>
  )
}
