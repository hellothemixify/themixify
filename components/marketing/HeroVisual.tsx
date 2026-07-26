import { TrendingUp, Sparkles } from 'lucide-react'

/**
 * The hero composition.
 *
 * Rather than a screenshot — which dates the moment the UI moves — this is a
 * hand-built arrangement of the panels an operator actually looks at: traffic,
 * the health score, rank movement and indexing coverage. Everything is CSS and
 * inline SVG, so it costs no image request and stays sharp on any display.
 */

const BARS = [
  18, 24, 21, 30, 27, 36, 33, 44, 39, 52, 47, 58, 55, 66, 62, 74, 70, 82, 78, 92,
]

const RANKS = [
  { term: 'best car battery guide', pos: 3, width: 88 },
  { term: 'multimeter voltage test', pos: 7, width: 64 },
  { term: 'brake pad replacement cost', pos: 14, width: 42 },
]

export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[560px] lg:max-w-none">
      {/* Floating traffic pill */}
      <div className="absolute -left-2 -top-3 z-30 hidden animate-float items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[0.78rem] font-bold text-ink-950 shadow-lift sm:inline-flex">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
        +38% organic traffic
      </div>

      {/* Health score dial */}
      <div
        className="absolute -right-1 -top-6 z-30 hidden w-[160px] rounded-3xl bg-white p-4 text-center shadow-lift sm:block"
        style={{ animation: 'float 7s ease-in-out infinite 1.4s' }}
      >
        <div className="relative mx-auto h-[92px] w-[92px]">
          <div
            className="h-full w-full rounded-full"
            style={{
              background:
                'conic-gradient(#8b5cf6 0deg, #ec4899 140deg, #f97316 250deg, #fbbf24 350deg, #ece6f7 350deg)',
            }}
          />
          <div className="absolute inset-[11px] flex flex-col items-center justify-center rounded-full bg-white">
            <span className="text-[1.6rem] font-extrabold leading-none text-ink-950">
              100
            </span>
            <span className="text-[0.62rem] font-semibold text-ink-500">
              / 100
            </span>
          </div>
        </div>
        <p className="mt-2.5 text-[0.82rem] font-extrabold text-ink-950">
          Excellent
        </p>
        <div className="mt-2 flex justify-center gap-1">
          {[
            ['0', 'Critical'],
            ['0', 'Warnings'],
            ['109', 'Passed'],
          ].map(([n, l]) => (
            <span
              key={l}
              className="rounded-lg bg-brand-50 px-1.5 py-1 text-[0.55rem] font-bold leading-tight text-brand-700"
            >
              <span className="block text-[0.68rem]">{n}</span>
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* Main analytics panel */}
      <div className="relative z-10 mt-10 rounded-[26px] bg-white p-6 shadow-lift sm:mt-14">
        <div className="mb-1 flex items-baseline justify-between">
          <h3 className="text-[1.05rem] font-extrabold text-ink-950">
            Daily Active Users
          </h3>
        </div>
        <p className="mb-5 text-[0.74rem] font-medium text-ink-500">
          Last 30 days · from Google Analytics
        </p>

        <div className="mb-5 grid grid-cols-2 gap-3">
          {[
            { label: 'Users', value: '12,480', delta: '24%' },
            { label: 'Pageviews', value: '38.2K', delta: '31%' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-hairline bg-brand-50/45 p-3.5"
            >
              <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-ink-500">
                {stat.label}
              </p>
              <p className="mt-1 text-[1.5rem] font-extrabold leading-none text-ink-950">
                {stat.value}
              </p>
              <p className="mt-1.5 inline-flex items-center gap-1 text-[0.72rem] font-bold text-[#15803d]">
                <TrendingUp size={11} strokeWidth={3} />
                {stat.delta}
              </p>
            </div>
          ))}
        </div>

        <div className="flex h-[104px] items-end gap-[3px]">
          {BARS.map((height, index) => (
            <div
              key={index}
              className="flex-1 rounded-t-[3px]"
              style={{
                height: `${height}%`,
                background: `linear-gradient(180deg, hsl(${
                  272 - index * 2.6
                } 82% 66%), hsl(${300 - index * 2.2} 84% 62%))`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Rank tracker panel */}
      <div className="relative z-20 -mt-5 ml-2 mr-10 rounded-[22px] bg-white p-5 shadow-lift sm:ml-6">
        <div className="mb-3.5 flex items-baseline justify-between">
          <h3 className="text-[0.95rem] font-extrabold text-ink-950">
            Rank Tracker
          </h3>
          <span className="text-[0.68rem] font-semibold text-ink-500">
            US · Google
          </span>
        </div>
        <ul className="space-y-3">
          {RANKS.map((row, index) => (
            <li key={row.term} className="flex items-center gap-3">
              <span className="w-6 shrink-0 text-[0.7rem] font-extrabold text-ink-300">
                #{index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-[0.8rem] font-semibold text-ink-900">
                {row.term}
              </span>
              <span className="hidden h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-brand-100 sm:block">
                <span
                  className="block h-full rounded-full bg-[linear-gradient(90deg,#8b5cf6,#ec4899)]"
                  style={{ width: `${row.width}%` }}
                />
              </span>
              <span
                className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.68rem] font-extrabold text-white ${
                  row.pos <= 5
                    ? 'bg-brand-500'
                    : row.pos <= 10
                      ? 'bg-flare-500'
                      : 'bg-ember-500'
                }`}
              >
                {row.pos}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Indexing chip */}
      <div className="absolute -right-2 bottom-24 z-30 hidden w-[180px] rounded-2xl bg-white p-4 shadow-lift md:block">
        <p className="text-[0.6rem] font-extrabold uppercase tracking-[0.14em] text-ink-500">
          Indexing report
        </p>
        <p className="mt-1.5 text-[0.86rem] font-extrabold text-ink-950">
          94% indexed
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-brand-100">
          <div className="h-full w-[94%] rounded-full bg-[linear-gradient(90deg,#8b5cf6,#f97316)]" />
        </div>
        <p className="mt-1.5 text-[0.68rem] font-semibold text-ink-500">
          109 pages submitted
        </p>
      </div>

      {/* Agentic chip */}
      <div className="relative z-30 -mt-3 ml-auto mr-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[0.76rem] font-bold text-ink-950 shadow-lift">
        <Sparkles size={13} className="text-flare-500" />
        Agentic Ready
      </div>
    </div>
  )
}
