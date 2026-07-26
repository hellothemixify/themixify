import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

/* ==========================================================================
   Button
   Three intents, two sizes. The gradient fill is the same sweep as the mark,
   so the primary action always reads as "the brand asking".
   ========================================================================== */

type ButtonProps = {
  children: ReactNode
  href?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'md' | 'lg'
  className?: string
} & Omit<ComponentProps<'button'>, 'ref'>

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 whitespace-nowrap disabled:opacity-55 disabled:pointer-events-none'

const BUTTON_VARIANT: Record<string, string> = {
  primary:
    'text-white bg-[linear-gradient(100deg,#8b5cf6_0%,#ec4899_52%,#f97316_100%)] shadow-[0_10px_28px_-10px_rgba(139,92,246,0.75)] hover:shadow-[0_16px_38px_-10px_rgba(236,72,153,0.7)] hover:-translate-y-0.5',
  secondary:
    'text-ink-950 bg-white border border-hairline hover:border-brand-300 hover:-translate-y-0.5 shadow-soft',
  ghost: 'text-ink-700 hover:text-ink-950 hover:bg-brand-50',
}

const BUTTON_SIZE: Record<string, string> = {
  md: 'text-[0.9rem] px-5 py-2.5',
  lg: 'text-[0.98rem] px-7 py-3.5',
}

export function Button({
  children,
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  ...rest
}: ButtonProps) {
  const classes = `${BUTTON_BASE} ${BUTTON_VARIANT[variant]} ${BUTTON_SIZE[size]} ${className}`

  if (href) {
    const external = href.startsWith('http')
    return (
      <Link
        href={href}
        className={classes}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}

/* ==========================================================================
   Badge / Pill
   ========================================================================== */

export function Pill({
  children,
  tone = 'brand',
  className = '',
}: {
  children: ReactNode
  tone?: 'brand' | 'warm' | 'plain' | 'good'
  className?: string
}) {
  const tones: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
    warm: 'bg-[#fff5e6] text-[#b45309] border-[#fde3b8]',
    good: 'bg-[#eefaf1] text-[#15803d] border-[#c9eed5]',
    plain: 'bg-white text-ink-700 border-hairline',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.1em] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

/* ==========================================================================
   Section scaffolding
   ========================================================================== */

export function Section({
  children,
  className = '',
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    // `defer-paint` is applied to every Section rather than to a chosen few.
    // Heroes are written as plain <section> elements, so a Section is below the
    // fold by construction, and the browser renders any band that reaches the
    // viewport regardless.
    <section id={id} className={`defer-paint py-16 sm:py-24 ${className}`}>
      <div className="container-page">{children}</div>
    </section>
  )
}

export function SectionHead({
  eyebrow,
  title,
  blurb,
  align = 'center',
}: {
  eyebrow?: string
  title: ReactNode
  blurb?: ReactNode
  align?: 'center' | 'left'
}) {
  const alignment =
    align === 'center' ? 'text-center mx-auto items-center' : 'text-left items-start'
  return (
    <div className={`flex max-w-3xl flex-col ${alignment} mb-12`}>
      {eyebrow && (
        <span className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-brand-600">
          {eyebrow}
        </span>
      )}
      <h2 className="text-balance text-3xl font-extrabold leading-[1.12] tracking-tight text-ink-950 sm:text-[2.6rem]">
        {title}
      </h2>
      {blurb && (
        <p className="mt-4 text-pretty text-[1.05rem] leading-relaxed text-ink-700">
          {blurb}
        </p>
      )}
    </div>
  )
}

/* ==========================================================================
   Card
   ========================================================================== */

export function Card({
  children,
  className = '',
  hover = false,
}: {
  children: ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div
      className={`surface-card p-6 ${
        hover
          ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_56px_-20px_rgba(78,34,148,0.28)] hover:border-brand-200'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

/* A thin gradient divider used between major bands. */
export function Rule({ className = '' }: { className?: string }) {
  return <div className={`rule-gradient ${className}`} aria-hidden="true" />
}

/* Small check glyph reused across every feature list. */
export function Check({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`mt-0.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[linear-gradient(120deg,#8b5cf6,#ec4899)] text-[10px] font-bold text-white ${className}`}
    >
      ✓
    </span>
  )
}
