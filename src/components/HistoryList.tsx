import { useState } from 'react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, addMonths, subMonths, isToday, parseISO,
} from 'date-fns'
import { DailyEntry } from '../types'
import { formatDisplay } from '../utils/dateUtils'

interface Props {
  entries: DailyEntry[]
  onEntryClick: (entry: DailyEntry) => void
  onDateSelect: (dateStr: string) => void
}

const nodeColor = (net: number) => {
  if (net >= 5) return '#F5E6C8'
  if (net >= 2) return '#E8C9A3'
  if (net >= -1) return '#D97757'
  if (net >= -5) return '#B8593A'
  return '#7A3B2A'
}

const calCellColor = (net: number) => {
  if (net >= 5) return { bg: 'rgba(245,230,200,0.12)', border: 'rgba(245,230,200,0.4)', text: '#F5E6C8' }
  if (net >= 2) return { bg: 'rgba(232,201,163,0.12)', border: 'rgba(232,201,163,0.4)', text: '#E8C9A3' }
  if (net >= -1) return { bg: 'rgba(217,119,87,0.12)', border: 'rgba(217,119,87,0.4)', text: '#D97757' }
  return { bg: 'rgba(184,89,58,0.1)', border: 'rgba(184,89,58,0.35)', text: '#B8593A' }
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']
const SOURCE_LABEL: Record<string, string> = {
  'self-initiated': '主動發起',
  'over-working': '過度勞動',
  'both': '兩者都有',
  'none': '',
}

const HistoryList = ({ entries, onEntryClick, onDateSelect }: Props) => {
  const [view, setView] = useState<'timeline' | 'calendar'>('timeline')
  const [calMonth, setCalMonth] = useState(new Date())

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))
  const entryMap = new Map(entries.map(e => [e.date, e]))

  const firstDay = startOfMonth(calMonth)
  const days = eachDayOfInterval({ start: firstDay, end: endOfMonth(calMonth) })
  const startPad = getDay(firstDay)

  const handleDayClick = (dateStr: string) => {
    const entry = entryMap.get(dateStr)
    if (entry) onEntryClick(entry)
    else onDateSelect(dateStr)
    setView('timeline')
  }

  return (
    <div className="min-h-screen bg-warm-radial-top px-5 pt-6 pb-32 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="font-mono-jetbrains text-xs tracking-[0.25em] text-warm-slate uppercase mb-1">Archive · 歷史記錄</div>
        <div className="flex items-baseline justify-between">
          <h1 className="font-fraunces text-3xl font-light text-cream">
            共 <em className="italic text-terracotta-soft">{sorted.length}</em> 天
          </h1>
          {/* View toggle */}
          <div className="flex gap-1 p-1 rounded-full border border-warm-strong bg-warm-800/40">
            {[{ k: 'timeline', l: '時序' }, { k: 'calendar', l: '月曆' }].map(t => (
              <button
                key={t.k}
                onClick={() => setView(t.k as 'timeline' | 'calendar')}
                className={`px-4 py-1.5 rounded-full text-sm font-mono-jetbrains tracking-wider transition-all ${
                  view === t.k
                    ? 'bg-terracotta text-ink-deep'
                    : 'text-warm-slate hover:text-cream'
                }`}
              >
                {t.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === 'timeline' && (
        sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
            <div className="w-12 h-12 rounded-full border border-warm-strong flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 6.25278V19.2528M12 6.25278C10.8321 5.47686 9.24649 5 7.5 5C5.75351 5 4.16789 5.47686 3 6.25278V19.2528C4.16789 18.4769 5.75351 18 7.5 18C9.24649 18 10.8321 18.4769 12 19.2528M12 6.25278C13.1679 5.47686 14.7535 5 16.5 5C18.2465 5 19.8321 5.47686 21 6.25278V19.2528C19.8321 18.4769 18.2465 18 16.5 18C14.7535 18 13.1679 18.4769 12 19.2528" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-warm-slate" />
              </svg>
            </div>
            <p className="text-cream/60 font-serif-tc text-base">還沒有記錄</p>
            <p className="text-warm-slate text-sm font-serif-tc mt-1">開始你的第一次復盤吧！</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-4">
            {/* Vertical thread */}
            <div className="absolute left-2 top-2 bottom-2 w-px"
              style={{ background: 'linear-gradient(180deg, rgba(232,201,163,0.25) 0%, rgba(217,119,87,0.12) 50%, transparent 100%)' }} />

            {sorted.map(entry => {
              const net = entry.successScore - entry.bitternessScore
              const color = nodeColor(net)
              const srcLabel = SOURCE_LABEL[entry.bitternessSource]
              return (
                <button
                  key={entry.id}
                  onClick={() => onEntryClick(entry)}
                  className="w-full text-left relative animate-fade-in"
                >
                  {/* Node dot */}
                  <div className="absolute -left-6 top-4 w-3 h-3 rounded-full border-2 border-warm-950"
                    style={{ background: color, boxShadow: `0 0 10px ${color}` }} />

                  <div className="p-4 rounded-2xl border border-warm-strong bg-warm-800/30 hover:bg-warm-800/60 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-mono-jetbrains text-sm tracking-widest text-warm-slate">
                        {formatDisplay(entry.date)}
                      </div>
                      <div className="flex items-center gap-2 font-mono-jetbrains text-sm">
                        <span style={{ color: '#D97757' }}>+{entry.successScore}</span>
                        <span className="text-warm-slate">/</span>
                        <span style={{ color: '#E8C9A3' }}>−{entry.bitternessScore}</span>
                      </div>
                    </div>

                    {entry.successMoment && (
                      <p className="font-serif-tc text-sm text-cream/80 leading-relaxed line-clamp-2 mb-2">
                        {entry.successMoment}
                      </p>
                    )}

                    {entry.dikw.wisdomAction && (
                      <div className="flex items-start gap-2 pt-2 border-t border-warm-700">
                        <span className="font-fraunces italic text-terracotta-soft text-sm shrink-0">明日 ·</span>
                        <p className="font-serif-tc text-sm text-cream/60 italic line-clamp-1">{entry.dikw.wisdomAction}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      {entry.splenic.hadIntuition && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-champagne/20 bg-champagne/5">
                          <span className="w-1 h-1 rounded-full bg-champagne block" />
                          <span className="font-mono-jetbrains text-xs tracking-widest text-champagne/70 uppercase">Splenic</span>
                        </span>
                      )}
                      {srcLabel && (
                        <span className="font-mono-jetbrains text-xs text-warm-slate tracking-wider">{srcLabel}</span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )
      )}

      {view === 'calendar' && (
        <div className="space-y-4">
          {/* Month nav */}
          <div className="flex items-center justify-between py-2">
            <button onClick={() => setCalMonth(m => subMonths(m, 1))}
              className="w-8 h-8 flex items-center justify-center text-terracotta-soft hover:text-cream transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
            <div className="font-fraunces italic text-lg text-cream">
              {format(calMonth, 'yyyy')} · {format(calMonth, 'M')}月
            </div>
            <button onClick={() => setCalMonth(m => addMonths(m, 1))}
              className="w-8 h-8 flex items-center justify-center text-terracotta-soft hover:text-cream transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center font-mono-jetbrains text-xs tracking-wider text-warm-slate py-1">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: startPad }).map((_, i) => (
              <div key={`pad-${i}`} style={{ aspectRatio: '1 / 1' }} />
            ))}
            {days.map(day => {
              const ds = format(day, 'yyyy-MM-dd')
              const entry = entryMap.get(ds)
              const net = entry ? entry.successScore - entry.bitternessScore : null
              const colors = net !== null ? calCellColor(net) : null
              const today = isToday(day)
              return (
                <button
                  key={ds}
                  onClick={() => handleDayClick(ds)}
                  className="rounded-xl flex flex-col items-center justify-center transition-all hover:scale-95 active:scale-90"
                  style={{
                    aspectRatio: '1 / 1',
                    background: colors ? colors.bg : 'rgba(245,237,226,0.02)',
                    border: `1px solid ${today ? '#D97757' : colors ? colors.border : 'rgba(232,201,163,0.06)'}`,
                  }}
                >
                  <span className="font-fraunces text-sm"
                    style={{ color: colors ? colors.text : 'rgba(245,237,226,0.3)' }}>
                    {format(day, 'd')}
                  </span>
                  {entry && (
                    <span className="w-1 h-1 rounded-full block mt-0.5"
                      style={{ background: colors!.text, boxShadow: `0 0 4px ${colors!.text}` }} />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default HistoryList
