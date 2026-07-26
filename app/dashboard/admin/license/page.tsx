'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/primitives'
import {
  EmptyState,
  Panel,
  PanelHead,
  StatusChip,
  shortDate,
} from '@/components/dashboard/ui'
import {
  adminAdjustSiteLimit,
  adminIssueLicense,
  adminListLicenses,
  adminSetLicenseStatus,
  type License,
} from '@/lib/queries'
import { PLANS } from '@/lib/site'

type Row = License & { owner_email: string }

const FIELD =
  'w-full rounded-xl border border-hairline bg-white px-3.5 py-2.5 text-[0.9rem] text-ink-950 outline-none transition placeholder:text-ink-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-100'

export default function AdminLicensePage() {
  const [rows, setRows] = useState<Row[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [issuing, setIssuing] = useState(false)
  const [message, setMessage] = useState<{ tone: 'ok' | 'bad'; text: string } | null>(
    null,
  )

  const load = useCallback(async () => {
    setLoading(true)
    const result = await adminListLicenses({ search, status })
    if (result.ok) setRows(result.data)
    else setMessage({ tone: 'bad', text: result.error })
    setLoading(false)
  }, [search, status])

  useEffect(() => {
    // Debounced so typing in the search box does not fire a query per keystroke.
    const timer = setTimeout(load, 250)
    return () => clearTimeout(timer)
  }, [load])

  async function onIssue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIssuing(true)
    setMessage(null)

    const form = new FormData(event.currentTarget)
    const result = await adminIssueLicense({
      email: String(form.get('email') ?? ''),
      planId: String(form.get('plan') ?? 'single'),
      notes: String(form.get('notes') ?? '') || undefined,
    })

    setIssuing(false)
    if (result.ok) {
      setMessage({
        tone: 'ok',
        text: `Issued ${result.data.license_key}. It is already visible in the customer's account.`,
      })
      event.currentTarget.reset()
      load()
    } else {
      setMessage({ tone: 'bad', text: result.error })
    }
  }

  async function onStatusChange(id: string, next: 'active' | 'revoked' | 'expired') {
    await adminSetLicenseStatus(id, next)
    load()
  }

  async function onLimitChange(id: string, value: string) {
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed < 1) return
    await adminAdjustSiteLimit(id, Math.floor(parsed))
    load()
  }

  return (
    <>
      <PanelHead
        title="License"
        subtitle="Issue, inspect, adjust and revoke licence keys."
      />

      {message && (
        <div
          className={`surface-card mb-5 border-l-4 p-4 text-[0.9rem] font-medium ${
            message.tone === 'ok'
              ? 'border-l-[#15803d] text-[#15803d]'
              : 'border-l-[#b3261e] text-[#b3261e]'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Panel
          title="All licences"
          subtitle={loading ? 'Loading…' : `${rows.length} shown`}
          padded={false}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <span className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Key or email"
                  className={`${FIELD} !w-[190px] !pl-9`}
                />
              </span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className={`${FIELD} !w-[130px]`}
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="revoked">Revoked</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          }
        >
          {rows.length === 0 && !loading ? (
            <EmptyState
              title="No licences match"
              body="Adjust the filters, or issue one with the form on the right."
            />
          ) : (
            <div className="table-scroll">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-hairline bg-brand-50/50">
                    {['Key', 'Owner', 'Plan', 'Sites', 'Status', 'Issued'].map(
                      (head) => (
                        <th
                          key={head}
                          className="px-4 py-3 text-[0.66rem] font-extrabold uppercase tracking-[0.12em] text-brand-700"
                        >
                          {head}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-hairline last:border-0"
                    >
                      <td className="px-4 py-3">
                        <code className="text-[0.82rem] font-bold text-ink-950">
                          {row.license_key}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-[0.85rem] text-ink-700">
                        {row.owner_email}
                      </td>
                      <td className="px-4 py-3 text-[0.85rem] font-semibold text-ink-950">
                        {row.plan_name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-[0.85rem] text-ink-700">
                          {row.sites_used} /
                          <input
                            type="number"
                            min={1}
                            defaultValue={row.sites_allowed}
                            onBlur={(event) =>
                              onLimitChange(row.id, event.target.value)
                            }
                            className="w-[62px] rounded-lg border border-hairline px-2 py-1 text-[0.82rem] focus:border-brand-400 focus:outline-none"
                            aria-label="Sites allowed"
                          />
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={row.status}
                          onChange={(event) =>
                            onStatusChange(
                              row.id,
                              event.target.value as 'active' | 'revoked' | 'expired',
                            )
                          }
                          className="rounded-lg border border-hairline px-2 py-1 text-[0.78rem] font-semibold focus:border-brand-400 focus:outline-none"
                        >
                          <option value="active">active</option>
                          <option value="revoked">revoked</option>
                          <option value="expired">expired</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-[0.82rem] text-ink-500">
                        {shortDate(row.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel
          title="Issue a licence"
          subtitle="For manual sales, replacements and review copies."
        >
          <form onSubmit={onIssue} className="space-y-3.5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-[0.78rem] font-bold text-ink-900"
              >
                Customer email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={FIELD}
                placeholder="customer@example.com"
              />
              <p className="mt-1.5 text-[0.76rem] text-ink-500">
                They must already have an account — the key attaches to it.
              </p>
            </div>

            <div>
              <label
                htmlFor="plan"
                className="mb-1.5 block text-[0.78rem] font-bold text-ink-900"
              >
                Plan
              </label>
              <select id="plan" name="plan" className={FIELD} defaultValue="single">
                {PLANS.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} — {plan.sites}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="notes"
                className="mb-1.5 block text-[0.78rem] font-bold text-ink-900"
              >
                Internal note
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className={`${FIELD} resize-y`}
                placeholder="Why this was issued by hand."
              />
            </div>

            <Button type="submit" className="w-full" disabled={issuing}>
              <Plus size={15} strokeWidth={2.6} />
              {issuing ? 'Issuing…' : 'Issue licence'}
            </Button>
          </form>
        </Panel>
      </div>
    </>
  )
}
