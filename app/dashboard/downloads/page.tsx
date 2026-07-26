'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/primitives'
import {
  EmptyState,
  Panel,
  PanelHead,
  StatusChip,
  shortDate,
} from '@/components/dashboard/ui'
import { getReleases, type Release } from '@/lib/queries'

export default function DownloadsPage() {
  const [releases, setReleases] = useState<Release[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getReleases(30).then((result) => {
      if (result.ok) setReleases(result.data)
      setLoading(false)
    })
  }, [])

  return (
    <>
      <PanelHead
        title="Downloads"
        subtitle="Every published build. Your licence key unlocks in-place updates from wp-admin, so this is only needed for a first install or a manual rollback."
      />

      <Panel padded={false}>
        {loading ? (
          <p className="py-10 text-center text-[0.9rem] text-ink-500">Loading…</p>
        ) : releases.length === 0 ? (
          <EmptyState
            title="No builds published yet"
            body="Releases appear here as soon as they ship."
          />
        ) : (
          <ul className="divide-y divide-hairline">
            {releases.map((release) => (
              <li
                key={release.id}
                className="flex flex-wrap items-start justify-between gap-4 px-5 py-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-[0.82rem] font-extrabold text-brand-700">
                      v{release.version}
                    </span>
                    {release.is_latest && <StatusChip status="active" />}
                    <span className="text-[0.8rem] text-ink-500">
                      {shortDate(release.released_at)}
                    </span>
                  </div>
                  <p className="mt-2.5 text-[1rem] font-bold text-ink-950">
                    {release.headline}
                  </p>
                  {release.notes && (
                    <p className="mt-1.5 max-w-2xl text-[0.9rem] leading-relaxed text-ink-700">
                      {release.notes}
                    </p>
                  )}
                </div>

                {release.download_url ? (
                  <Button href={release.download_url} variant="secondary">
                    <Download size={15} strokeWidth={2.4} />
                    Download zip
                  </Button>
                ) : (
                  <span className="rounded-full border border-hairline px-4 py-2 text-[0.82rem] font-semibold text-ink-500">
                    Update from wp-admin
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  )
}
