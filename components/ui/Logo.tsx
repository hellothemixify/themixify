/**
 * The Themixify mark, drawn as inline SVG.
 *
 * Deliberately not an <img>: the mark appears in the header, the footer, the
 * dashboard sidebar and the favicon, and an inline path costs no request,
 * stays crisp at every size, and inherits the page's own colour space. The
 * gradient id is suffixed per instance so several marks on one page cannot
 * collide.
 */

type LogoProps = {
  size?: number
  className?: string
  id?: string
}

export function LogoMark({ size = 36, className, id = 'tm' }: LogoProps) {
  const gradientId = `tm-grad-${id}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      className={className}
      role="img"
      aria-label="Themixify"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} x1="6%" y1="4%" x2="94%" y2="96%">
          <stop offset="0%" stopColor="#b795f4" />
          <stop offset="42%" stopColor="#ee5f9d" />
          <stop offset="78%" stopColor="#f79f45" />
          <stop offset="100%" stopColor="#fbc93d" />
        </linearGradient>
      </defs>
      <rect width="1024" height="1024" rx="234" fill={`url(#${gradientId})`} />
      <path
        d="M 168 362 L 446 362"
        fill="none"
        stroke="#fff"
        strokeWidth="84"
        strokeLinecap="round"
      />
      <path
        d="M 307 362 L 307 738"
        fill="none"
        stroke="#fff"
        strokeWidth="84"
        strokeLinecap="round"
      />
      <path
        d="M 538 738 L 538 362 L 690 570 L 842 362 L 842 738"
        fill="none"
        stroke="#fff"
        strokeWidth="84"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="842" cy="250" r="50" fill="#fff" />
    </svg>
  )
}

export function LogoLockup({
  size = 34,
  className = '',
  id = 'lockup',
  showParent = false,
}: LogoProps & { showParent?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} id={id} />
      <span className="leading-none">
        <span className="block text-[1.15rem] font-extrabold tracking-tight text-ink-950">
          Themixify
        </span>
        {showParent && (
          <span className="mt-0.5 block text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-ink-500">
            by Writerify
          </span>
        )}
      </span>
    </span>
  )
}
