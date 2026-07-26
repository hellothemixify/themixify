'use client'

import { useCallback, useEffect, useState } from 'react'
import { Copy, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/primitives'
import {
  EmptyState,
  Panel,
  PanelHead,
  StatusChip,
  shortDate,
} from '@/components/dashboard/ui'
import {
  getActivations,
  getMyLicenses,
  releaseActivation,
  type Activation,
  type License,
} from '@/lib/queries'

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([])
  const [activations, setActivations] = useState<Record<string, Activation[]>>({})
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  const load = useCallback(async () => {
    const result = await getMyLicenses()
    if (!result.ok) {
      setLoading(false)
      return
    }
    setLicenses(result.data)

    const pairs = await Promise.all(
      result.data.map(async (license) => {
        const rows = await getActivations(license.id)
        return [license.id, rows.ok ? rows.data : []] as const
      }),
    )
    setActivations(Object.fromEntries(pairs))
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function copyKey(key: string) {
    try {
      await navigator.clipboard.writeText(key)
      setCopied(key)
      setTimeout(() => setCopied(null), 1800)
    } catch {
      // Clipboard access can be denied; the key is selectable on screen anyway.
    }
  }

  async function onRelease(activationId: string) {
    await releaseActivation(activationId)
    load()
  }

  return (
    <>
      <PanelHead
        title="My licences"
        subtitle="Copy a key to activate a site, or release a site to move the licence elsewhere."
      />

      {loading ? (
        <Panel>
          <p className="py-8 text-center text-[0.9rem] text-ink-500">Loading…</p>
        </Panel>
      ) : licenses.length === 0 ? (
        <Panel padded={false}>
          <EmptyState
            title="No licences on this account"
            body="Buy a plan and the key appears here immediately, ready to paste into Themixify → Dashboard in wp-admin."
            action={<Button href="/pricing">See pricing</Button>}
          />
        </Panel>
      ) : (
        <div className="space-y-5">
          {licenses.map((license) => {
            const sites = activations[license.id] ?? []
            const free = license.sites_allowed - license.sites_used

            return (
              <Panel
                key={license.id}
                title={license.plan_name}
                subtitle={`Issued ${shortDate(license.created_at)}`}
                padded={false}
                actions={<StatusChip status={license.status} />}
              >
                <div className="border-b border-hairline px-5 py-4">
                  <p className="mb-1.5 text-[0.68rem] font-extrabold uppercase tracking-[0.13em] text-ink-500">
                    Licence key
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <code className="select-all rounded-xl bg-brand-50 px-4 py-2.5 text-[1rem] font-bold tracking-wider text-brand-700">
                      {license.license_key}
                    </code>
                    <button
                      onClick={() => copyKey(license.license_key)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3.5 py-2 text-[0.82rem] font-semibold text-ink-700 transition hover:border-brand-300 hover:text-brand-700"
                    >
                      <Copy size={13} strokeWidth={2.4} />
                      {copied === license.license_key ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="mt-3 text-[0.85rem] text-ink-700">
                    <strong>{license.sites_used}</strong> of{' '}
                    <strong>{license.sites_allowed}</strong> sites in use
                    {free > 0 ? ` · ${free} available` : ' · no slots left'}
                  </p>
                </div>

                {sites.length === 0 ? (
                  <div className="px-5 py-6 text-[0.88rem] text-ink-500">
                    Not activated anywhere yet. Paste the key into{' '}
                    <strong>Themixify → Dashboard</strong> in wp-admin.
                  </div>
                ) : (
                  <ul className="divide-y divide-hairline">
                    {sites.map((site) => (
                      <li
                        key={site.id}
                        className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[0.92rem] font-semibold text-ink-950">
                            {site.site_name ?? site.site_url}
                          </p>
                          <p className="truncate text-[0.8rem] text-ink-500">
                            {site.site_url} · activated{' '}
                            {shortDate(site.activated_at)}
                          </p>
                        </div>
                        <button
                          onClick={() => onRelease(site.id)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-[0.8rem] font-semibold text-ink-700 transition hover:border-[#f7d0d0] hover:bg-[#fdecec] hover:text-[#b3261e]"
                        >
                          <Trash2 size={13} strokeWidth={2.4} />
                          Release
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            )
          })}
        </div>
      )}
    </>
  )
}
