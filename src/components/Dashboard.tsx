import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { Lightbulb } from 'lucide-react'
import { DailyEntry } from '../types'
import {
  getLast364Days,
  getLast30Days,
  formatShort,
  formatMonth,
  getDayOfWeek,
} from '../utils/dateUtils'

interface Props {
  entries: DailyEntry[]
  isDark: boolean
}

const heatmapColor = (entry?: DailyEntry): string => {
  if (!entry) return 'transparent'
  const score = entry.successScore - entry.bitternessScore
  if (score >= 3) return '#059669'
  if (score >= 1) return '#34d399'
  if (score === 0) return '#6366f1'
  if (score >= -2) return '#d97706'
  return '#991b1b'
}

const heatmapTip = (entry?: DailyEntry, date?: string): string => {
  if (!date) return ''
  const d = date.slice(5)
  if (!entry) return `${d} 無記錄`
  return `${d}  成功 ${entry.successScore} / 苦澀 ${entry.bitternessScore}`
}

const DAY_LABELS = ['日', '一', '二', '三', '四', '五', '六']

const Dashboard = ({ entries, isDark }: Props) => {
  const entryMap = useMemo(() => {
    const map = new Map<string, DailyEntry>()
    entries.forEach(e => map.set(e.date, e))
    return map
  }, [entries])

  const last364 = useMemo(() => getLast364Days(), [])
  const last30 = useMemo(() => getLast30Days(), [])

  const weeks = useMemo(() => {
    const result: (string | null)[][] = []
    let week: (string | null)[] = []
    const padStart = getDayOfWeek(last364[0])
    for (let i = 0; i < padStart; i++) week.push(null)
    for (const date of last364) {
      week.push(date)
      if (week.length === 7) {
        result.push(week)
        week = []
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null)
      result.push(week)
    }
    return result
  }, [last364])

  const monthLabels = useMemo(() => {
    const labels: { text: string; col: number }[] = []
    let lastMonth = ''
    weeks.forEach((week, i) => {
      const first = week.find(d => d !== null)
      if (first) {
        const m = formatMonth(first)
        if (m !== lastMonth) {
          labels.push({ text: m, col: i })
          lastMonth = m
        }
      }
    })
    return labels
  }, [weeks])

  const stats = useMemo(() => {
    const total = entries.length
    let streak = 0
    const today = format(new Date(), 'yyyy-MM-dd')
    let checkDate = today
    while (entryMap.has(checkDate)) {
      streak++
      const d = new Date(checkDate)
      d.setDate(d.getDate() - 1)
      checkDate = format(d, 'yyyy-MM-dd')
    }
    const thisMonth = format(new Date(), 'yyyy-MM')
    const monthEntries = entries.filter(e => e.date.startsWith(thisMonth))
    const avgSuccess = monthEntries.length
      ? (monthEntries.reduce((s, e) => s + e.successScore, 0) / monthEntries.length).toFixed(1)
      : '—'
    const avgBitterness = monthEntries.length
      ? (monthEntries.reduce((s, e) => s + e.bitternessScore, 0) / monthEntries.length).toFixed(1)
      : '—'
    return { total, streak, avgSuccess, avgBitterness }
  }, [entries, entryMap])

  const chartData = useMemo(
    () =>
      last30.map(date => {
        const e = entryMap.get(date)
        return {
          date: formatShort(date),
          成功感: e?.successScore ?? null,
          苦澀感: e?.bitternessScore ?? null,
        }
      }),
    [last30, entryMap]
  )

  const sourceStats = useMemo(() => {
    const thisMonth = format(new Date(), 'yyyy-MM')
    const monthEntries = entries.filter(e => e.date.startsWith(thisMonth))
    if (monthEntries.length === 0) return null
    const counts = { 'self-initiated': 0, 'over-working': 0, both: 0, none: 0 } as Record<string, number>
    monthEntries.forEach(e => counts[e.bitternessSource]++)
    return { counts, total: monthEntries.length }
  }, [entries])

  const gridColor = isDark ? '#1e1e35' : '#e5e7eb'
  const axisColor = isDark ? '#64748b' : '#9ca3af'
  const tooltipBg = isDark ? '#0f0f1a' : '#ffffff'
  const tooltipBorder = isDark ? '#312e81' : '#e5e7eb'

  const cardCls = 'bg-white dark:bg-space-800 rounded-2xl p-4 border border-gray-200 dark:border-slate-700/50'
  const sectionTitleCls = 'text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-4'

  return (
    <div className="px-4 pt-5 pb-28 max-w-lg mx-auto space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">能量圖譜</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: '總記錄', value: stats.total, color: 'text-violet-600 dark:text-violet-400' },
          { label: '連續天數', value: stats.streak, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: '本月成功均', value: stats.avgSuccess, color: 'text-blue-600 dark:text-blue-400' },
          { label: '本月苦澀均', value: stats.avgBitterness, color: 'text-amber-600 dark:text-amber-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${cardCls} text-center`}>
            <div className={`text-xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-400 dark:text-slate-500 mt-1 leading-tight">{label}</div>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div className={cardCls}>
        <p className={sectionTitleCls}>過去 364 天 — 能量記錄</p>
        <div className="overflow-x-auto scrollbar-hide">
          <div className="inline-flex gap-1 min-w-max">
            <div className="flex flex-col gap-1 pt-5 mr-0.5">
              {DAY_LABELS.map(d => (
                <div
                  key={d}
                  className="h-2.5 w-3 text-[9px] text-gray-400 dark:text-slate-600 flex items-center justify-end"
                >
                  {d}
                </div>
              ))}
            </div>
            <div>
              <div className="relative h-5 mb-0.5">
                {monthLabels.map(({ text, col }) => (
                  <span
                    key={`${text}-${col}`}
                    className="absolute text-[9px] text-gray-400 dark:text-slate-500"
                    style={{ left: col * 14 }}
                  >
                    {text}
                  </span>
                ))}
              </div>
              <div className="flex gap-1">
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-1">
                    {week.map((date, di) => (
                      <div
                        key={di}
                        title={heatmapTip(
                          date ? (entryMap.get(date) ?? undefined) : undefined,
                          date ?? undefined
                        )}
                        className="w-2.5 h-2.5 rounded-sm transition-transform hover:scale-125 cursor-default"
                        style={{
                          backgroundColor: date
                            ? heatmapColor(entryMap.get(date) ?? undefined)
                            : isDark ? '#1e1e35' : '#f3f4f6',
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-gray-400 dark:text-slate-500">苦澀</span>
          {['#991b1b', '#d97706', '#6366f1', '#34d399', '#059669'].map(c => (
            <div key={c} className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c }} />
          ))}
          <span className="text-xs text-gray-400 dark:text-slate-500">成功</span>
        </div>
      </div>

      {/* 30-day trend */}
      <div className={cardCls}>
        <p className={sectionTitleCls}>近 30 天能量趨勢</p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="date"
              tick={{ fill: axisColor, fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis
              domain={[0, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tick={{ fill: axisColor, fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: 10,
                fontSize: 13,
              }}
              labelStyle={{ color: isDark ? '#94a3b8' : '#6b7280', marginBottom: 4 }}
              itemStyle={{ color: isDark ? '#cbd5e1' : '#374151' }}
            />
            <Line
              type="monotone"
              dataKey="成功感"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', r: 2.5, strokeWidth: 0 }}
              activeDot={{ r: 4 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="苦澀感"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: '#f59e0b', r: 2.5, strokeWidth: 0 }}
              activeDot={{ r: 4 }}
              connectNulls={false}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bitterness source */}
      {sourceStats && (
        <div className={cardCls}>
          <p className={sectionTitleCls}>本月苦澀來源分析</p>
          <div className="space-y-3">
            {(
              [
                { key: 'self-initiated', label: '主動發起', color: '#ef4444' },
                { key: 'over-working', label: '過度勞動', color: '#f97316' },
                { key: 'both', label: '兩者都有', color: '#eab308' },
                { key: 'none', label: '沒有苦澀', color: '#10b981' },
              ] as const
            ).map(({ key, label, color }) => {
              const count = sourceStats.counts[key] ?? 0
              const pct = sourceStats.total > 0 ? (count / sourceStats.total) * 100 : 0
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 dark:text-slate-400 w-16 shrink-0">{label}</span>
                  <div className="flex-1 bg-gray-100 dark:bg-space-950 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                  <span className="text-sm text-gray-400 dark:text-slate-500 w-7 text-right shrink-0">
                    {count}天
                  </span>
                </div>
              )
            })}
          </div>
          <p className="text-sm text-gray-400 dark:text-slate-500 mt-4 pt-3 border-t border-gray-200 dark:border-slate-700/40 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            投射者指標：苦澀感 = 主動發起的訊號，而非能力不足
          </p>
        </div>
      )}

      {/* Weekly view */}
      {entries.length >= 3 && (() => {
        const today = new Date()
        const weeklyData = Array.from({ length: 8 }, (_, i) => {
          const weekEnd = new Date(today)
          weekEnd.setDate(today.getDate() - i * 7)
          const weekStart = new Date(weekEnd)
          weekStart.setDate(weekEnd.getDate() - 6)
          const startStr = format(weekStart, 'yyyy-MM-dd')
          const endStr = format(weekEnd, 'yyyy-MM-dd')
          const weekEntries = entries.filter(e => e.date >= startStr && e.date <= endStr)
          const label = `W${8 - i}`
          if (weekEntries.length === 0) return { label, success: null, bitterness: null, count: 0 }
          return {
            label,
            success: +(weekEntries.reduce((s, e) => s + e.successScore, 0) / weekEntries.length).toFixed(1),
            bitterness: +(weekEntries.reduce((s, e) => s + e.bitternessScore, 0) / weekEntries.length).toFixed(1),
            count: weekEntries.length,
          }
        }).reverse()

        return (
          <div className={cardCls}>
            <p className={sectionTitleCls}>近 8 週平均能量</p>
            <div className="space-y-2.5">
              {weeklyData.map(w => {
                if (!w.success && !w.bitterness)
                  return (
                    <div key={w.label} className="flex items-center gap-3">
                      <span className="text-xs text-gray-300 dark:text-slate-700 w-8 shrink-0">{w.label}</span>
                      <span className="text-sm text-gray-300 dark:text-slate-700">無記錄</span>
                    </div>
                  )
                const quality = (w.success ?? 0) - (w.bitterness ?? 0)
                return (
                  <div key={w.label} className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 dark:text-slate-500 w-8 shrink-0">{w.label}</span>
                    <div className="flex-1">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${((w.success ?? 0) / 5) * 100}%`,
                          backgroundColor: '#8b5cf6',
                          minWidth: 4,
                        }}
                      />
                    </div>
                    <div className="flex gap-2 text-sm shrink-0">
                      <span className="text-violet-600 dark:text-violet-400 font-medium">{w.success}</span>
                      <span className="text-gray-300 dark:text-slate-700">/</span>
                      <span className="text-amber-600 dark:text-amber-400 font-medium">{w.bitterness}</span>
                    </div>
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          quality >= 2 ? '#059669' : quality >= 0 ? '#6366f1' : '#d97706',
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default Dashboard
