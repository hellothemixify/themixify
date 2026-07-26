'use client'

import { useEffect, useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/primitives'
import {
  EmptyState,
  Panel,
  PanelHead,
  StatusChip,
  shortDate,
} from '@/components/dashboard/ui'
import { getReleases, publishRelease, type Release } from '@/lib/queries'

const FIELD =
  'w-full rounded-xl border border-hairline bg-white px-3.5 py-2.5 text-[0.9rem] text-ink-950 outline-none transition placeholder:text-ink-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-100'

/**
 * Publishing a build.
 *
 * The zip goes into a private bucket and the row records where it landed —
 * never a public URL. Marking the new build as the latest is done by the same
 * database function that inserts it, because "upload the file, add the row, and
 * remember to unset is_latest on the old one" is three steps and the third is
 * the one that gets forgotten at eleven at night.
 */
export default function AdminReleasesPage() {
  const [releases, setReleases] = useState<Release[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    const result = await getReleases(30)
    if (result.ok) setReleases(result.data)
  }

  useEffect(() => {
    load()
  }, [])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setDone('')

    const form = new FormData(event.currentTarget)
    const file = fileRef.current?.files?.[0]

    if (!file) {
      setBusy(false)
      setError('Choose the theme zip first.')
      return
    }

    const result = await publishRelease({
      version: String(form.get('version') ?? '').trim(),
      headline: String(form.get('headline') ?? '').trim(),
      notes: String(form.get('notes') ?? '').trim(),
      file,
    })

    setBusy(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    setDone('Published. It is now the latest build and is live in every customer’s Downloads.')
    event.currentTarget.reset()
    load()
  }

  return (
    <>
      <PanelHead
        title="Releases"
        subtitle="Upload a build. It becomes the latest download for every licensed customer and everyone still inside their trial."
      />

      {error && (
        <div className="surface-card mb-5 border-l-4 border-l-[#b3261e] p-4 text-[0.9rem] font-medium text-[#b3261e]">
          {error}
        </div>
      )}
      {done && (
        <div className="surface-card mb-5 border-l-4 border-l-[#15803d] p-4 text-[0.9rem] font-medium text-[#15803d]">
          {done}
        </div>
      )}

      <Panel title="Publish a build">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="version" className="mb-1.5 block text-[0.8rem] font-bold text-ink-900">
                Version
              </label>
              <input id="version" name="version" required className={FIELD} placeholder="1.13.0" />
            </div>
            <div>
              <label htmlFor="zip" className="mb-1.5 block text-[0.8rem] font-bold text-ink-900">
                Theme zip
              </label>
              <input
                id="zip"
                ref={fileRef}
                type="file"
                accept=".zip,application/zip"
                required
                className={FIELD}
              />
            </div>
          </div>

          <div>
            <label htmlFor="headline" className="mb-1.5 block text-[0.8rem] font-bold text-ink-900">
              Headline
            </label>
            <input
              id="headline"
              name="headline"
              required
              className={FIELD}
              placeholder="Agentic layer, licence enforcement and a 100/100 build"
            />
          </div>

          <div>
            <label htmlFor="notes" className="mb-1.5 block text-[0.8rem] font-bold text-ink-900">
              Release notes
            </label>
            <textarea id="notes" name="notes" rows={5} className={`${FIELD} resize-y`} />
          </div>

          <Button type="submit" size="lg" disabled={busy}>
            <UploadCloud size={16} strokeWidth={2.4} />
            {busy ? 'Uploading…' : 'Publish release'}
          </Button>
        </form>
      </Panel>

      <div className="mt-5">
        <Panel title="Published builds" padded={false}>
          {releases.length === 0 ? (
            <EmptyState title="Nothing published yet" body="The first build you upload appears here." />
          ) : (
            <ul className="divide-y divide-hairline">
              {releases.map((release) => (
                <li key={release.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                  <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-[0.82rem] font-extrabold text-brand-700">
                    v{release.version}
                  </span>
                  {release.is_latest && <StatusChip status="active" />}
                  <span className="min-w-0 flex-1 truncate text-[0.92rem] font-semibold text-ink-950">
                    {release.headline}
                  </span>
                  <span className="text-[0.8rem] text-ink-500">
                    {shortDate(release.released_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  )
}
