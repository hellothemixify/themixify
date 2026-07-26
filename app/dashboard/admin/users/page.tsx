'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, RefreshCw, Search, ShieldCheck } from 'lucide-react'
import { Panel, PanelHead, shortDate } from '@/components/dashboard/ui'
import {
  adminApproveAccount,
  adminListAccounts,
  adminRevenue,
  adminSetAccountStatus,
  adminSetLicenseMoney,
  adminSetUserRole,
  type AdminAccount,
  type AdminRevenue,
} from '@/lib/queries'

const FIELD =
  'w-full rounded-xl border border-hairline bg-white px-3.5 py-2.5 text-[0.9rem] text-ink-950 outline-none transition placeholder:text-ink-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-100'

/**
 * Taka, for the second line under every dollar figure.
 *
 * The rate is a display convenience, not an accounting record — every stored
 * number is cents of USD. Converting on read means a rate change never
 * retroactively rewrites what somebody actually paid.
 */
const BDT_PER_USD = 125

const dollars = (cents: number) =>
  `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const taka = (cents: number) =>
  `৳${Math.round((cents / 100) * BDT_PER_USD).toLocaleString('en-IN')}`

type Filter =
  | 'all'
  | 'pending'
  | 'trial'
  | 'trial_expired'
  | 'licensed'
  | 'owner'
  | 'paid'
  | 'partial'
  | 'unpaid'

/** What each access state should actually say to a human. */
const ACCESS_LABEL: Record<AdminAccount['access_state'], { text: string; tone: string }> = {
  owner: { text: 'Owner', tone: 'bg-brand-100 text-brand-700' },
  licensed: { text: 'Licensed', tone: 'bg-[#eefaf1] text-[#15803d]' },
  trial: { text: 'On trial', tone: 'bg-brand-50 text-brand-700' },
  trial_expired: { text: 'Trial ended', tone: 'bg-[#fff5e6] text-[#b45309]' },
  none: { text: 'No licence', tone: 'bg-ink-100 text-ink-500' },
}

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Everyone' },
  { value: 'pending', label: 'Awaiting approval' },
  { value: 'trial', label: 'On trial' },
  { value: 'trial_expired', label: 'Trial expired' },
  { value: 'licensed', label: 'Licensed' },
  { value: 'paid', label: 'Paid in full' },
  { value: 'partial', label: 'Partial (part-paid)' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'owner', label: 'Owner' },
]

export default function AdminUsersPage() {
  const [rows, setRows] = useState<AdminAccount[]>([])
  const [revenue, setRevenue] = useState<AdminRevenue | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')
  /** Unsaved price/paid edits, keyed by licence id. */
  const [draft, setDraft] = useState<Record<string, { price: string; paid: string }>>({})

  const load = useCallback(async () => {
    setLoading(true)
    const [accounts, money] = await Promise.all([adminListAccounts(search), adminRevenue()])

    if (accounts.ok) {
      setRows(accounts.data)
      setError('')
    } else {
      setError(accounts.error)
    }
    if (money.ok) setRevenue(money.data)
    setLoading(false)
  }, [search])

  useEffect(() => {
    const timer = setTimeout(load, 250)
    return () => clearTimeout(timer)
  }, [load])

  const visible = useMemo(() => {
    if (filter === 'all') return rows
    if (filter === 'pending') return rows.filter((row) => row.approval_status === 'pending')
    if (filter === 'trial' || filter === 'trial_expired' || filter === 'licensed') {
      return rows.filter((row) => row.access_state === filter)
    }
    return rows.filter((row) => row.payment_state === filter)
  }, [rows, filter])

  async function run(id: string, fn: () => Promise<{ ok: boolean; error?: string }>) {
    setBusyId(id)
    const result = await fn()
    if (!result.ok && result.error) setError(result.error)
    setBusyId('')
    load()
  }

  return (
    <>
      <PanelHead
        title="User Manage"
        subtitle="Every account, what they owe, and what has actually arrived."
        actions={
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-4 py-2 text-[0.86rem] font-semibold text-ink-700 transition hover:border-brand-300 hover:text-brand-700"
          >
            <RefreshCw size={14} strokeWidth={2.4} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        }
      />

      {error && (
        <div className="surface-card mb-5 border-l-4 border-l-[#b3261e] p-4 text-[0.9rem] font-medium text-[#b3261e]">
          {error}
        </div>
      )}

      {/* The money first, because it is why this screen gets opened. */}
      {revenue && (
        <div className="mb-5 grid gap-4 md:grid-cols-2">
          <div className="surface-card p-6">
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.13em] text-ink-500">
              Total income
            </p>
            <p className="mt-2 text-[2rem] font-extrabold leading-none text-ink-950">
              {dollars(revenue.total_paid_cents)}
            </p>
            <p className="mt-1.5 text-[0.86rem] text-ink-500">
              {taka(revenue.total_paid_cents)}
            </p>
            {revenue.outstanding_cents > 0 && (
              <p className="mt-3 text-[0.84rem] font-semibold text-[#b45309]">
                {dollars(revenue.outstanding_cents)} still outstanding across{' '}
                {revenue.partial + revenue.unpaid} account
                {revenue.partial + revenue.unpaid === 1 ? '' : 's'}
              </p>
            )}
          </div>

          <div className="surface-card border-brand-200 bg-brand-50/40 p-6">
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.13em] text-brand-700">
              Each partner · income ÷ 2
            </p>
            <p className="mt-2 text-[2rem] font-extrabold leading-none text-ink-950">
              {dollars(Math.round(revenue.total_paid_cents / 2))}
            </p>
            <p className="mt-1.5 text-[0.86rem] text-ink-500">
              {taka(Math.round(revenue.total_paid_cents / 2))} · 1 USD = ৳{BDT_PER_USD}
            </p>
            <p className="mt-3 text-[0.84rem] text-ink-500">
              Owners are excluded from income — a zero price is a partner, not a
              customer.
            </p>
          </div>
        </div>
      )}

      {revenue && (
        <div className="mb-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ['Accounts', revenue.accounts],
            ['Awaiting approval', revenue.pending],
            ['On trial', revenue.on_trial],
            ['Licensed', revenue.licensed],
            ['Part-paid', revenue.partial],
            ['Owners', revenue.owners],
          ].map(([label, value]) => (
            <div key={label as string} className="surface-card p-4">
              <p className="text-[0.64rem] font-extrabold uppercase tracking-[0.12em] text-ink-500">
                {label}
              </p>
              <p className="mt-1.5 text-[1.5rem] font-extrabold leading-none text-ink-950">
                {value as number}
              </p>
            </div>
          ))}
        </div>
      )}

      <Panel
        title="All accounts"
        subtitle={loading ? 'Loading…' : `${visible.length} shown`}
        padded={false}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="relative">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, email, phone or key"
                className={`${FIELD} !w-[240px] !pl-9`}
              />
            </span>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as Filter)}
              className={`${FIELD} !w-auto`}
            >
              {FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        }
      >
        <div className="table-scroll">
          <table className="w-full min-w-[1080px] border-collapse text-left">
            <thead>
              <tr className="border-b border-hairline bg-brand-50/50">
                {['User', 'Access', 'Licence key', 'Price', 'Paid', 'State', 'Joined', 'Actions'].map(
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
              {visible.map((row) => {
                const edit = row.license_id ? draft[row.license_id] : undefined
                const price = edit ? edit.price : String(row.price_cents / 100)
                const paid = edit ? edit.paid : String(row.paid_cents / 100)
                const dirty =
                  Boolean(edit) &&
                  (Math.round(Number(price) * 100) !== row.price_cents ||
                    Math.round(Number(paid) * 100) !== row.paid_cents)

                return (
                  <tr key={row.id} className="border-b border-hairline last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(130deg,#8b5cf6,#ec4899)] text-[0.8rem] font-extrabold text-white">
                          {(row.full_name ?? row.email).charAt(0).toUpperCase()}
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-1.5">
                            <span className="truncate text-[0.88rem] font-bold text-ink-950">
                              {row.full_name ?? '—'}
                            </span>
                            {row.approval_status === 'pending' && (
                              <span className="rounded-full bg-[#fff5e6] px-2 py-0.5 text-[0.62rem] font-extrabold uppercase tracking-wide text-[#b45309]">
                                Pending
                              </span>
                            )}
                            {row.role === 'admin' && (
                              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[0.62rem] font-extrabold uppercase tracking-wide text-brand-700">
                                Admin
                              </span>
                            )}
                          </span>
                          <span className="block truncate text-[0.78rem] text-ink-500">
                            {row.email}
                          </span>
                          {row.phone && (
                            <span className="block truncate text-[0.76rem] text-ink-500">
                              {row.phone}
                            </span>
                          )}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {/* Spelled out rather than mapped onto the generic status
                          chip. Reusing that vocabulary is how an owner ended up
                          labelled "pending" — they hold no licence and are on no
                          trial, and neither fact says anything about whether
                          they can use the product. */}
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-[0.06em] ${ACCESS_LABEL[row.access_state].tone}`}
                      >
                        {ACCESS_LABEL[row.access_state].text}
                      </span>
                      {row.access_state === 'trial' && row.trial_ends_at && (
                        <span className="mt-1 block text-[0.72rem] text-ink-500">
                          until {shortDate(row.trial_ends_at)}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {row.license_key ? (
                        <code className="text-[0.76rem] text-ink-700">{row.license_key}</code>
                      ) : (
                        <span className="text-[0.8rem] text-ink-500">—</span>
                      )}
                    </td>

                    {(['price', 'paid'] as const).map((field) => (
                      <td key={field} className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          disabled={!row.license_id}
                          value={field === 'price' ? price : paid}
                          onChange={(event) => {
                            if (!row.license_id) return
                            const licenseId = row.license_id
                            setDraft((current) => ({
                              ...current,
                              [licenseId]: {
                                price: field === 'price' ? event.target.value : price,
                                paid: field === 'paid' ? event.target.value : paid,
                              },
                            }))
                          }}
                          className="w-24 rounded-lg border border-hairline px-2 py-1.5 text-[0.84rem] disabled:bg-ink-100 disabled:text-ink-500"
                        />
                      </td>
                    ))}

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-[0.06em] ${
                          row.payment_state === 'owner'
                            ? 'bg-brand-100 text-brand-700'
                            : row.payment_state === 'paid'
                              ? 'bg-[#eefaf1] text-[#15803d]'
                              : row.payment_state === 'partial'
                                ? 'bg-[#fff5e6] text-[#b45309]'
                                : 'bg-ink-100 text-ink-500'
                        }`}
                      >
                        {row.payment_state}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-[0.8rem] text-ink-500">
                      {shortDate(row.created_at)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {row.approval_status === 'pending' && (
                          <button
                            type="button"
                            disabled={busyId === row.id}
                            onClick={() => run(row.id, () => adminApproveAccount(row.id, 7))}
                            className="inline-flex items-center gap-1 rounded-lg bg-[linear-gradient(100deg,#8b5cf6,#ec4899)] px-2.5 py-1.5 text-[0.76rem] font-bold text-white"
                          >
                            <Check size={12} strokeWidth={3} />
                            Approve
                          </button>
                        )}

                        {dirty && row.license_id && (
                          <button
                            type="button"
                            disabled={busyId === row.id}
                            onClick={() =>
                              run(row.id, () =>
                                adminSetLicenseMoney(
                                  row.license_id as string,
                                  Math.round(Number(price) * 100),
                                  Math.round(Number(paid) * 100),
                                ),
                              )
                            }
                            className="rounded-lg border border-brand-300 bg-white px-2.5 py-1.5 text-[0.76rem] font-bold text-brand-700"
                          >
                            Save
                          </button>
                        )}

                        <select
                          value={row.approval_status}
                          onChange={(event) =>
                            run(row.id, () =>
                              adminSetAccountStatus(
                                row.id,
                                event.target.value as 'pending' | 'approved' | 'suspended',
                              ),
                            )
                          }
                          className="rounded-lg border border-hairline px-2 py-1 text-[0.76rem] font-semibold"
                        >
                          <option value="pending">pending</option>
                          <option value="approved">approved</option>
                          <option value="suspended">suspended</option>
                        </select>

                        <select
                          value={row.role}
                          onChange={(event) =>
                            run(row.id, () =>
                              adminSetUserRole(row.id, event.target.value as 'user' | 'admin'),
                            )
                          }
                          className="rounded-lg border border-hairline px-2 py-1 text-[0.76rem] font-semibold"
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <p className="mt-4 flex items-start gap-2 text-[0.82rem] leading-relaxed text-ink-500">
        <ShieldCheck size={14} className="mt-0.5 shrink-0 text-brand-500" />
        Price is what the customer was quoted; Paid is what has actually
        arrived. Income counts only what arrived, so a part-payment never
        flatters the total. A price of zero marks an owner, who is never counted
        as revenue. Every change here runs through a database function that
        checks the caller is an administrator — this screen has no authority the
        database has not already granted it.
      </p>
    </>
  )
}
