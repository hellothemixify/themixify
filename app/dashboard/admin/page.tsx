'use client'

import { useEffect, useState } from 'react'
import {
  Globe,
  KeyRound,
  RefreshCw,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import {
  Panel,
  PanelHead,
  Sparkline,
  StatCard,
  money,
} from '@/components/dashboard/ui'
import { getAdminOverview, type AdminOverview } from '@/lib/queries'

export default function AdminOverviewPage() {
  const [data, setData] = useState<AdminOverview | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const result = await getAdminOverview()
    if (result.ok) {
      setData(result.data)
      setError('')
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const series = data?.signup_series ?? []
  const planMix = data?.plan_mix ?? []
  const planTotal = planMix.reduce((total, row) => total + Number(row.count), 0)

  return (
    <>
      <PanelHead
        title="Overview"
        subtitle="Usage across every Themixify customer."
        actions={
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-4 py-2 text-[0.84rem] font-semibold text-ink-700 transition hover:border-brand-300 hover:text-brand-700"
          >
            <RefreshCw size={14} strokeWidth={2.4} />
            Refresh
          </button>
        }
      />

      {error && (
        <div className="surface-card mb-5 border-l-4 border-l-[#b3261e] p-5">
          <p className="text-[0.92rem] font-semibold text-[#b3261e]">{error}</p>
          <p className="mt-1.5 text-[0.86rem] text-ink-700">
            The overview is admin-only. If this is your account, set your role
            with the last line of{' '}
            <code className="rounded bg-brand-50 px-1.5 py-0.5 text-brand-700">
              supabase/schema.sql
            </code>
            .
          </p>
        </div>
      )}

      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Every figure here excludes owner accounts. The subtitle promises
            customers, and counting ourselves as customers is how a dashboard
            starts lying to the people who built it. */}
        <StatCard
          label="Customers"
          value={loading ? '—' : (data?.total_users ?? 0).toLocaleString()}
          hint={data ? `${data.new_users_30d} joined in 30 days` : undefined}
          icon={<Users size={15} />}
        />
        <StatCard
          label="Paid licences"
          value={loading ? '—' : (data?.active_licenses ?? 0).toLocaleString()}
          hint={
            data
              ? `${data.trial_licenses} on trial · ${data.total_licenses} issued in total`
              : undefined
          }
          icon={<KeyRound size={15} />}
        />
        <StatCard
          label="Sites activated"
          value={loading ? '—' : (data?.total_activations ?? 0).toLocaleString()}
          hint="On customer licences"
          icon={<Globe size={15} />}
        />
        <StatCard
          label="Revenue"
          value={loading ? '—' : money(data?.revenue_cents ?? 0)}
          hint={data ? `${money(data.revenue_30d_cents)} in 30 days` : undefined}
          icon={<Wallet size={15} />}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <Panel
          title="User growth"
          subtitle="New accounts per day, last 30 days"
        >
          <Sparkline points={series.map((point) => Number(point.count))} height={132} />
          <div className="mt-3 flex items-center justify-between text-[0.78rem] text-ink-500">
            <span>{series[0]?.day ?? ''}</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#15803d]">
              <TrendingUp size={12} strokeWidth={3} />
              {data?.new_users_30d ?? 0} in this window
            </span>
            <span>{series[series.length - 1]?.day ?? ''}</span>
          </div>
        </Panel>

        <Panel title="Plan mix" subtitle="Licences issued per plan" padded={false}>
          {planMix.length === 0 ? (
            <p className="px-5 py-10 text-center text-[0.9rem] text-ink-500">
              No licences issued yet.
            </p>
          ) : (
            <ul className="divide-y divide-hairline">
              {planMix.map((row, index) => {
                const share = planTotal
                  ? Math.round((Number(row.count) / planTotal) * 100)
                  : 0
                const colours = ['#8b5cf6', '#ec4899', '#f97316', '#fbbf24']
                return (
                  <li key={row.plan_id} className="px-5 py-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2.5 text-[0.9rem] font-semibold text-ink-950">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ background: colours[index % colours.length] }}
                        />
                        {row.plan_name}
                      </span>
                      <span className="text-[0.88rem] font-bold text-ink-950">
                        {Number(row.count).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${share}%`,
                          background: colours[index % colours.length],
                        }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Paid orders"
          value={loading ? '—' : (data?.orders_paid ?? 0).toLocaleString()}
        />
        <StatCard
          label="Active in 30 days"
          value={loading ? '—' : (data?.active_users ?? 0).toLocaleString()}
        />
        <StatCard
          label="Average order"
          value={
            loading || !data || !data.orders_paid
              ? '—'
              : money(Math.round(data.revenue_cents / data.orders_paid))
          }
        />
      </div>
    </>
  )
}
