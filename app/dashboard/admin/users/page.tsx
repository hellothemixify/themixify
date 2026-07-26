'use client'

import { useCallback, useEffect, useState } from 'react'
import { Search, ShieldCheck } from 'lucide-react'
import {
  EmptyState,
  Panel,
  PanelHead,
  money,
  shortDate,
} from '@/components/dashboard/ui'
import {
  adminListUsers,
  adminSetUserRole,
  type AdminUserRow,
} from '@/lib/queries'

const FIELD =
  'w-full rounded-xl border border-hairline bg-white px-3.5 py-2.5 text-[0.9rem] text-ink-950 outline-none transition placeholder:text-ink-300 focus:border-brand-400 focus:ring-4 focus:ring-brand-100'

export default function AdminUsersPage() {
  const [rows, setRows] = useState<AdminUserRow[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const result = await adminListUsers({ search })
    if (result.ok) {
      setRows(result.data)
      setError('')
    } else {
      setError(result.error)
    }
    setLoading(false)
  }, [search])

  useEffect(() => {
    const timer = setTimeout(load, 250)
    return () => clearTimeout(timer)
  }, [load])

  async function onRoleChange(userId: string, role: 'user' | 'admin') {
    await adminSetUserRole(userId, role)
    load()
  }

  const admins = rows.filter((row) => row.role === 'admin').length
  const paying = rows.filter((row) => row.license_count > 0).length

  return (
    <>
      <PanelHead
        title="User Manage"
        subtitle="Every account, what they own, and what they have spent."
      />

      {error && (
        <div className="surface-card mb-5 border-l-4 border-l-[#b3261e] p-4 text-[0.9rem] font-medium text-[#b3261e]">
          {error}
        </div>
      )}

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {[
          ['Accounts shown', rows.length],
          ['With a licence', paying],
          ['Administrators', admins],
        ].map(([label, value]) => (
          <div key={label as string} className="surface-card p-5">
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.13em] text-ink-500">
              {label}
            </p>
            <p className="mt-2 text-[1.8rem] font-extrabold leading-none text-ink-950">
              {loading ? '—' : (value as number).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <Panel
        title="Accounts"
        subtitle={loading ? 'Loading…' : `${rows.length} shown`}
        padded={false}
        actions={
          <span className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name or email"
              className={`${FIELD} !w-[220px] !pl-9`}
            />
          </span>
        }
      >
        {rows.length === 0 && !loading ? (
          <EmptyState
            title="No accounts match"
            body="Try a different search, or clear the box to see everyone."
          />
        ) : (
          <div className="table-scroll">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-hairline bg-brand-50/50">
                  {[
                    'User',
                    'Licences',
                    'Sites',
                    'Spent',
                    'Joined',
                    'Last active',
                    'Role',
                  ].map((head) => (
                    <th
                      key={head}
                      className="px-4 py-3 text-[0.66rem] font-extrabold uppercase tracking-[0.12em] text-brand-700"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-hairline last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(130deg,#8b5cf6,#ec4899)] text-[0.8rem] font-extrabold text-white">
                          {(row.full_name ?? row.email).charAt(0).toUpperCase()}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[0.88rem] font-bold text-ink-950">
                            {row.full_name ?? '—'}
                          </span>
                          <span className="block truncate text-[0.78rem] text-ink-500">
                            {row.email}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[0.88rem] font-semibold text-ink-950">
                      {row.license_count}
                    </td>
                    <td className="px-4 py-3 text-[0.88rem] text-ink-700">
                      {row.activation_count}
                    </td>
                    <td className="px-4 py-3 text-[0.88rem] font-bold text-ink-950">
                      {money(row.total_paid_cents)}
                    </td>
                    <td className="px-4 py-3 text-[0.82rem] text-ink-500">
                      {shortDate(row.created_at)}
                    </td>
                    <td className="px-4 py-3 text-[0.82rem] text-ink-500">
                      {shortDate(row.last_active_at)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={row.role}
                        onChange={(event) =>
                          onRoleChange(
                            row.id,
                            event.target.value as 'user' | 'admin',
                          )
                        }
                        className="rounded-lg border border-hairline px-2 py-1 text-[0.78rem] font-semibold focus:border-brand-400 focus:outline-none"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <p className="mt-4 flex items-start gap-2 text-[0.82rem] leading-relaxed text-ink-500">
        <ShieldCheck size={14} className="mt-0.5 shrink-0 text-brand-500" />
        Role changes take effect immediately and are enforced by row-level
        security in the database, not by this screen — an administrator who loses
        the role loses the data access with it, in the same instant.
      </p>
    </>
  )
}
