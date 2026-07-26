'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Download, Globe, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/primitives'
import {
  EmptyState,
  Panel,
  PanelHead,
  StatCard,
  StatusChip,
  shortDate,
} from '@/components/dashboard/ui'
import { getMyLicenses, getReleases, type License, type Release } from '@/lib/queries'

export default function DashboardHome() {
  const [licenses, setLicenses] = useState<License[]>([])
  const [releases, setReleases] = useState<Release[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getMyLicenses(), getReleases(3)]).then(([lic, rel]) => {
      if (lic.ok) setLicenses(lic.data)
      if (rel.ok) setReleases(rel.data)
      setLoading(false)
    })
  }, [])

  const sitesAllowed = licenses.reduce((total, l) => total + l.sites_allowed, 0)
  const sitesUsed = licenses.reduce((total, l) => total + l.sites_used, 0)
  const latest = releases[0]

  return (
    <>
      <PanelHead
        title="Your account"
        subtitle="Licences, activations and the latest build."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Licences"
          value={loading ? '—' : licenses.length}
          icon={<KeyRound size={15} />}
        />
        <StatCard
          label="Sites activated"
          value={loading ? '—' : `${sitesUsed} / ${sitesAllowed}`}
          hint={sitesAllowed - sitesUsed > 0 ? `${sitesAllowed - sitesUsed} slots free` : 'All slots in use'}
          icon={<Globe size={15} />}
        />
        <StatCard
          label="Latest version"
          value={latest?.version ?? '—'}
          hint={latest ? shortDate(latest.released_at) : undefined}
          icon={<Download size={15} />}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Panel
          title="Your licences"
          subtitle="Keys, plans and how many sites each one covers."
          padded={false}
          actions={
            <Link
              href="/dashboard/licenses"
              className="text-[0.84rem] font-bold text-brand-600 hover:underline"
            >
              Manage
            </Link>
          }
        >
          {loading ? (
            <div className="px-5 py-10 text-center text-[0.9rem] text-ink-500">
              Loading…
            </div>
          ) : licenses.length === 0 ? (
            <EmptyState
              title="No licences yet"
              body="Once you buy a plan the key appears here, along with the sites it is activated on."
              action={<Button href="/pricing">See pricing</Button>}
            />
          ) : (
            <ul className="divide-y divide-hairline">
              {licenses.map((license) => (
                <li key={license.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <code className="text-[0.9rem] font-bold tracking-wide text-ink-950">
                      {license.license_key}
                    </code>
                    <StatusChip status={license.status} />
                  </div>
                  <p className="mt-1.5 text-[0.84rem] text-ink-500">
                    {license.plan_name} · {license.sites_used} of{' '}
                    {license.sites_allowed} sites in use · issued{' '}
                    {shortDate(license.created_at)}
                  </p>
                  <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-brand-100">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#8b5cf6,#ec4899)]"
                      style={{
                        width: `${Math.min(
                          100,
                          (license.sites_used / license.sites_allowed) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Latest releases" padded={false}>
          {releases.length === 0 ? (
            <EmptyState
              title="No releases published"
              body="Version history will appear here as builds are published."
            />
          ) : (
            <ul className="divide-y divide-hairline">
              {releases.map((release) => (
                <li key={release.id} className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <span className="rounded-lg bg-brand-50 px-2 py-0.5 text-[0.76rem] font-extrabold text-brand-700">
                      v{release.version}
                    </span>
                    {release.is_latest && <StatusChip status="active" />}
                  </div>
                  <p className="mt-2 text-[0.9rem] font-bold text-ink-950">
                    {release.headline}
                  </p>
                  {release.notes && (
                    <p className="mt-1 line-clamp-3 text-[0.84rem] leading-relaxed text-ink-700">
                      {release.notes}
                    </p>
                  )}
                  <p className="mt-2 text-[0.78rem] text-ink-500">
                    {shortDate(release.released_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  )
}
