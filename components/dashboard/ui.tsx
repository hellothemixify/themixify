'use client'

import type { ReactNode } from 'react'

export function PanelHead({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[1.8rem] font-extrabold tracking-tight text-ink-950">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-[0.94rem] text-ink-700">{subtitle}</p>
        )}
      </div>
      {actions}
    </div>
  )
}

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string
  value: string | number
  hint?: string
  icon?: ReactNode
}) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.13em] text-ink-500">
          {label}
        </p>
        {icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            {icon}
          </span>
        )}
      </div>
      <p className="mt-2.5 text-[1.9rem] font-extrabold leading-none tracking-tight text-ink-950">
        {value}
      </p>
      {hint && <p className="mt-1.5 text-[0.8rem] text-ink-500">{hint}</p>}
    </div>
  )
}

export function Panel({
  title,
  subtitle,
  actions,
  children,
  padded = true,
}: {
  title?: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  padded?: boolean
}) {
  return (
    <section className="surface-card overflow-hidden p-0">
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-5 py-4">
          <div>
            {title && (
              <h2 className="text-[1rem] font-extrabold text-ink-950">{title}</h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-[0.83rem] text-ink-500">{subtitle}</p>
            )}
          </div>
          {actions}
        </header>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </section>
  )
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className="px-5 py-14 text-center">
      <p className="text-[1.05rem] font-bold text-ink-950">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-[0.9rem] leading-relaxed text-ink-700">
        {body}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function StatusChip({ status }: { status: string }) {
  const tones: Record<string, string> = {
    active: 'bg-[#eefaf1] text-[#15803d] border-[#c9eed5]',
    paid: 'bg-[#eefaf1] text-[#15803d] border-[#c9eed5]',
    pending: 'bg-[#fff5e6] text-[#b45309] border-[#fde3b8]',
    new: 'bg-brand-50 text-brand-700 border-brand-200',
    revoked: 'bg-[#fdecec] text-[#b3261e] border-[#f7d0d0]',
    failed: 'bg-[#fdecec] text-[#b3261e] border-[#f7d0d0]',
    expired: 'bg-ink-100 text-ink-500 border-hairline',
    released: 'bg-ink-100 text-ink-500 border-hairline',
    refunded: 'bg-ink-100 text-ink-500 border-hairline',
  }
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-[0.06em] ${
        tones[status] ?? 'bg-ink-100 text-ink-500 border-hairline'
      }`}
    >
      {status}
    </span>
  )
}

/** A dependency-free sparkline. Enough to show a shape, not a charting library. */
export function Sparkline({
  points,
  height = 68,
}: {
  points: number[]
  height?: number
}) {
  if (points.length < 2) {
    return (
      <div
        className="flex items-center justify-center text-[0.82rem] text-ink-500"
        style={{ height }}
      >
        Not enough data yet
      </div>
    )
  }

  const max = Math.max(...points, 1)
  const width = 100
  const step = width / (points.length - 1)
  const coords = points.map((value, index) => {
    const x = index * step
    const y = height - (value / max) * (height - 6) - 3
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
      role="img"
      aria-label="Trend over the last 30 days"
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ec4899" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="spark-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${coords.join(' ')} ${width},${height}`}
        fill="url(#spark-fill)"
      />
      <polyline
        points={coords.join(' ')}
        fill="none"
        stroke="url(#spark-line)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

export function money(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

export function shortDate(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
