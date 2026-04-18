import { useMemo, useRef, useState, useEffect } from 'react'
import { format } from 'date-fns'
import { DailyEntry } from '../types'
import { getLast364Days, getLast30Days } from '../utils/dateUtils'

interface Props {
  entries: DailyEntry[]
}

const starColor = (net: number) => {
  if (net >= 5) return '#F5E6C8'
  if (net >= 2) return '#E8C9A3'
  if (net >= -1) return '#D97757'
  if (net >= -5) return '#B8593A'
  return '#7A3B2A'
}

const StarMap = ({ entries }: { entries: DailyEntry[] }) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(320)
  const [hover, setHover] = useState<{ date: string; x: number; y: number; entry: DailyEntry } | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(es => setSize(es[0].contentRect.width))
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const entryMap = useMemo(() => new Map(entries.map(e => [e.date, e])), [entries])

  const points = useMemo(() => {
    const golden = Math.PI * (3 - Math.sqrt(5))
    const center = size / 2
    const maxR = center - 14
    const today = new Date()
    return Array.from({ length: 364 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      const entry = entryMap.get(dateStr)
      const r = Math.sqrt(i / 363) * maxR
      const theta = i * golden
      return {
        i,
        date: dateStr,
        entry,
        x: center + r * Math.cos(theta),
        y: center + r * Math.sin(theta),
      }
    })
  }, [size, entryMap])

  const stats = useMemo(() => {
    const total = entries.length
    let streak = 0
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    let checkDate = todayStr
    while (entryMap.has(checkDate)) {
      streak++
      const d = new Date(checkDate)
      d.setDate(d.getDate() - 1)
      checkDate = format(d, 'yyyy-MM-dd')
    }
    const thisMonth = format(new Date(), 'yyyy-MM')
    const monthEntries = entries.filter(e => e.date.startsWith(thisMonth))
    const avgNet = monthEntries.length
      ? (monthEntries.reduce((s, e) => s + (e.successScore - e.bitternessScore), 0) / monthEntries.length).toFixed(1)
      : '—'
    const avgSuccess = monthEntries.length
      ? (monthEntries.reduce((s, e) => s + e.successScore, 0) / monthEntries.length).toFixed(1)
      : '—'
    return { total, streak, avgNet, avgSuccess }
  }, [entries, entryMap])

  const last30 = useMemo(() => getLast30Days(), [])
  const sparkData = useMemo(() => last30.map(date => {
    const e = entryMap.get(date)
    return { date, success: e?.successScore ?? null, bitterness: e?.bitternessScore ?? null }
  }), [last30, entryMap])

  const toSvgPath = (key: 'success' | 'bitterness') => {
    const W = 320, H = 72
    const pts = sparkData.map((d, i) => ({
      x: (i / 29) * W,
      y: d[key] !== null ? H - (d[key]! / 10) * H : null,
    }))
    let path = ''
    let inSeg = false
    pts.forEach(p => {
      if (p.y === null) { inSeg = false; return }
      path += (inSeg ? ' L ' : ' M ') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)
      inSeg = true
    })
    return path
  }

  const center = size / 2

  return (
    <div ref={containerRef} className="w-full space-y-8">
      {/* Star map */}
      <div className="relative w-full" style={{ aspectRatio: '1 / 1' }}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${size} ${size}`}
          className="absolute inset-0"
        >
          {/* Concentric rings */}
          {[0.25, 0.5, 0.75, 1].map((f, i) => (
            <circle key={i}
              cx={center} cy={center}
              r={(center - 14) * f}
              fill="none"
              stroke="rgba(232,201,163,0.06)"
              strokeWidth={0.5}
              strokeDasharray={i === 3 ? undefined : '2 4'}
            />
          ))}

          {/* Stars */}
          {points.map(p => {
            if (!p.entry) {
              return (
                <circle key={p.i} cx={p.x} cy={p.y} r={0.7}
                  fill="rgba(232,201,163,0.1)"
                />
              )
            }
            const net = p.entry.successScore - p.entry.bitternessScore
            const color = starColor(net)
            const intensity = (p.entry.successScore + p.entry.bitternessScore) / 20
            const radius = 1 + intensity * 2.5
            return (
              <g key={p.i}
                onMouseEnter={() => setHover({ date: p.date, x: p.x, y: p.y, entry: p.entry! })}
                onMouseLeave={() => setHover(null)}
                onTouchStart={() => setHover({ date: p.date, x: p.x, y: p.y, entry: p.entry! })}
                style={{ cursor: 'pointer' }}
              >
                <circle cx={p.x} cy={p.y} r={radius * 3} fill={color} opacity={0.15} style={{ filter: 'blur(2px)' }} />
                <circle cx={p.x} cy={p.y} r={radius} fill={color} style={{ filter: `drop-shadow(0 0 ${radius * 2}px ${color})` }} />
              </g>
            )
          })}

          {/* Today pulse */}
          <circle cx={center} cy={center} r={4} fill="none" stroke="#F5E6C8" strokeWidth={0.8} opacity={0.6}>
            <animate attributeName="r" values="4;10;4" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="3s" repeatCount="indefinite" />
          </circle>
        </svg>

        {/* Today center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="font-mono-jetbrains text-[8px] tracking-[0.25em] text-cream/30 uppercase">TODAY</div>
        </div>

        {/* Month labels */}
        {Array.from({ length: 12 }).map((_, i) => {
          const d = new Date()
          d.setMonth(d.getMonth() - i)
          const label = `${d.getMonth() + 1}月`
          const a = -(i / 12) * Math.PI * 2 - Math.PI / 2
          const r = center + 6
          const x = center + r * Math.cos(a)
          const y = center + r * Math.sin(a)
          return (
            <div key={i} className="absolute pointer-events-none font-mono-jetbrains text-[8px] text-cream/25"
              style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}>
              {label}
            </div>
          )
        })}

        {/* Hover tooltip */}
        {hover && (
          <div className="absolute pointer-events-none z-10 px-3 py-2 rounded-xl text-xs font-mono-jetbrains border border-warm-strong"
            style={{
              left: Math.min(hover.x / size * 100 + 5, 60) + '%',
              top: Math.max(hover.y / size * 100 - 15, 5) + '%',
              background: 'rgba(15,11,8,0.95)',
              whiteSpace: 'nowrap',
            }}
          >
            <div className="text-cream/60 mb-1">{hover.date.slice(5)}</div>
            <div>
              <span className="text-terracotta">成功 {hover.entry.successScore}</span>
              <span className="text-warm-slate mx-1">/</span>
              <span className="text-champagne">苦澀 {hover.entry.bitternessScore}</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 font-mono-jetbrains text-xs text-cream/40 tracking-[0.15em]">
        <span>DIM</span>
        {['#7A3B2A', '#B8593A', '#D97757', '#E8C9A3', '#F5E6C8'].map(c => (
          <span key={c} className="w-2 h-2 rounded-full block" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />
        ))}
        <span>BRIGHT</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: '總記錄', value: stats.total, unit: '天', color: 'text-terracotta-soft' },
          { label: '連續天數', value: stats.streak, unit: '天', color: 'text-[#F5E6C8]' },
          { label: '本月淨能量', value: stats.avgNet, unit: 'avg', color: 'text-[#8FA683]' },
          { label: '本月成功均', value: stats.avgSuccess, unit: '/ 10', color: 'text-terracotta' },
        ].map((s, i) => (
          <div key={i} className="p-4 rounded-2xl border border-warm-strong bg-warm-800/30">
            <div className="font-mono-jetbrains text-xs tracking-[0.2em] text-warm-slate uppercase mb-2">{s.label}</div>
            <div className="flex items-baseline gap-1">
              <span className={`font-fraunces text-4xl font-light leading-none ${s.color}`}>{s.value}</span>
              <span className="font-mono-jetbrains text-xs text-warm-slate">{s.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Sparkline */}
      <div className="p-5 rounded-2xl border border-warm-strong bg-warm-800/20">
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono-jetbrains text-xs tracking-[0.2em] text-warm-slate uppercase">Last 30 Days</div>
          <div className="flex gap-3 font-mono-jetbrains text-xs">
            <span className="flex items-center gap-1.5 text-terracotta">
              <span className="w-3 h-px bg-terracotta block" />成功
            </span>
            <span className="flex items-center gap-1.5 text-champagne">
              <span className="w-3 h-px bg-champagne block" />苦澀
            </span>
          </div>
        </div>
        <svg viewBox="0 0 320 72" className="w-full" style={{ height: 72 }}>
          <path d={toSvgPath('success')} stroke="#D97757" strokeWidth="1.5" fill="none" opacity="0.9" />
          <path d={toSvgPath('bitterness')} stroke="#E8C9A3" strokeWidth="1.5" fill="none" opacity="0.7" strokeDasharray="2 2" />
        </svg>
        <div className="flex justify-between font-mono-jetbrains text-xs text-warm-slate mt-2">
          <span>30d ago</span><span>today</span>
        </div>
      </div>

      {/* Insight */}
      <div className="p-5 rounded-2xl border border-champagne/12 bg-champagne/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-5 h-5 rounded-full glow-terracotta-sm shrink-0"
            style={{ background: 'radial-gradient(circle at 30% 30%, #F5E6C8, #D97757)' }} />
          <div className="font-mono-jetbrains text-xs tracking-[0.2em] text-warm-slate uppercase">Insight · 投射者筆記</div>
        </div>
        <p className="font-serif-tc text-sm text-cream/80 leading-relaxed italic">
          苦澀感是<span className="text-terracotta-soft not-italic">主動發起</span>的訊號，不是能力不足。<br />
          觀察你的星圖節律。
        </p>
      </div>
    </div>
  )
}

const Dashboard = ({ entries }: Props) => {
  return (
    <div className="px-5 pt-6 pb-32 max-w-lg mx-auto space-y-6 bg-warm-radial-top min-h-screen">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="font-mono-jetbrains text-xs tracking-[0.25em] text-warm-slate uppercase mb-1">Energy · 能量星圖</div>
          <h1 className="font-fraunces text-3xl font-light text-cream">
            過去 <em className="italic text-terracotta-soft">一年</em>
          </h1>
        </div>
      </div>
      <StarMap entries={entries} />
    </div>
  )
}

export default Dashboard
