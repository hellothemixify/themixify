'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/primitives'
import {
  EmptyState,
  Panel,
  PanelHead,
  StatusChip,
  money,
  shortDate,
} from '@/components/dashboard/ui'
import { getMyOrders, type Order } from '@/lib/queries'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyOrders().then((result) => {
      if (result.ok) setOrders(result.data)
      setLoading(false)
    })
  }, [])

  return (
    <>
      <PanelHead
        title="Orders"
        subtitle="Your purchase history. Every plan is a one-time payment — there is nothing here that will bill again."
      />

      <Panel padded={false}>
        {loading ? (
          <p className="py-10 text-center text-[0.9rem] text-ink-500">Loading…</p>
        ) : orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            body="When you buy a plan the receipt appears here and the licence key lands in My Licences."
            action={<Button href="/pricing">See pricing</Button>}
          />
        ) : (
          <div className="table-scroll">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr className="border-b border-hairline bg-brand-50/50">
                  {['Date', 'Plan', 'Amount', 'Status', 'Reference'].map((head) => (
                    <th
                      key={head}
                      className="px-5 py-3 text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-brand-700"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-hairline last:border-0">
                    <td className="px-5 py-3.5 text-[0.88rem] text-ink-700">
                      {shortDate(order.created_at)}
                    </td>
                    <td className="px-5 py-3.5 text-[0.88rem] font-semibold text-ink-950">
                      {order.plan_id}
                    </td>
                    <td className="px-5 py-3.5 text-[0.88rem] font-bold text-ink-950">
                      {money(order.amount_cents)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusChip status={order.status} />
                    </td>
                    <td className="px-5 py-3.5 text-[0.82rem] text-ink-500">
                      {order.provider_ref ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  )
}
