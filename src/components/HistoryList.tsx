import { useState } from 'react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, addMonths, subMonths, isToday, parseISO,
} from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { Star, Flame, Eye, Lightbulb, BookOpen, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { DailyEntry } from '../types'
import { formatDisplay } from '../utils/dateUtils'

interface Props {
  entries: DailyEntry[]
  onEntryClick: (entry: DailyEntry) => void
  onDateSelect: (dateStr: string) => void
}

const energyBorder = (score: number): string => {
  if (score >= 3) return 'rgba(5,150,105,0.35)'
  if (score >= 1) return 'rgba(99,102,241,0.35)'
  if (score >= -1) return 'rgba(217,119,6,0.35)'
  return 'rgba(153,27,27,0.35)'
}

const WEEK_LABELS = ['日', '一', '二', '三', '四', '五', '六']

const HistoryList = ({ entries, onEntryClick, onDateSelect }: Props) => {
  const [showCalendar, setShowCalendar] = useState(false)
  const [calMonth, setCalMonth] = useState(new Date())

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))
  const entryMap = new Map(entries.map(e => [e.date, e]))

  const firstDay = startOfMonth(calMonth)
  const days = eachDayOfInterval({ start: firstDay, end: endOfMonth(calMonth) })
  const startPad = getDay(firstDay)

  const handleDayClick = (dateStr: string) => {
    const entry = entryMap.get(dateStr)
    if (entry) {
      onEntryClick(entry)
    } else {
      onDateSelect(dateStr)
    }
    setShowCalendar(false)
  }

  return (
    <div className="px-4 pt-6 pb-28 max-w-lg mx-auto space-y-3">
      {/* 標題列 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-baseline gap-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">歷史記錄</h1>
          <span className="text-base text-gray-400 dark:text-slate-500">共 {sorted.length} 天</span>
        </div>
        <button
          onClick={() => setShowCalendar(v => !v)}
          className={`p-2 rounded-xl transition-colors ${
            showCalendar
              ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400'
              : 'text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-space-800'
          }`}
        >
          <CalendarDays className="w-5 h-5" />
        </button>
      </div>

      {/* 月曆 */}
      {showCalendar && (
        <div className="bg-white dark:bg-space-800 rounded-2xl p-4 border border-gray-200 dark:border-slate-700/50">
          {/* 月份導覽 */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setCalMonth(m => subMonths(m, 1))}
              className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-space-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-gray-700 dark:text-slate-200">
              {format(calMonth, 'yyyy年M月', { locale: zhTW })}
            </span>
            <button
              onClick={() => setCalMonth(m => addMonths(m, 1))}
              className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-space-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 星期標頭 */}
          <div className="grid grid-cols-7 mb-1">
            {WEEK_LABELS.map(d => (
              <div key={d} className="text-[11px] text-center text-gray-400 dark:text-slate-500 py-1">{d}</div>
            ))}
          </div>

          {/* 日期格 */}
          <div className="grid grid-cols-7">
            {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
            {days.map(day => {
              const ds = format(day, 'yyyy-MM-dd')
              const hasEntry = entryMap.has(ds)
              const today = isToday(day)
              return (
                <button
                  key={ds}
                  onClick={() => handleDayClick(ds)}
                  className={`flex items-center justify-center w-8 h-8 mx-auto my-0.5 rounded-full text-sm transition-colors ${
                    hasEntry
                      ? 'bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 font-semibold hover:bg-violet-200 dark:hover:bg-violet-800/70'
                      : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-space-700'
                  } ${today ? 'ring-2 ring-violet-400 dark:ring-violet-500' : ''}`}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>

          {/* 圖例 */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700/50">
            <span className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500">
              <span className="w-3 h-3 rounded-full bg-violet-100 dark:bg-violet-900/60 inline-block" />
              有記錄
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500">
              <span className="w-3 h-3 rounded-full ring-2 ring-violet-400 inline-block" />
              今天
            </span>
          </div>
        </div>
      )}

      {/* 列表 */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <BookOpen className="w-12 h-12 text-gray-300 dark:text-slate-700 mb-4" strokeWidth={1.2} />
          <p className="text-gray-500 dark:text-slate-400 font-medium text-lg">還沒有記錄</p>
          <p className="text-gray-400 dark:text-slate-600 text-base mt-1">開始你的第一次復盤吧！</p>
        </div>
      ) : (
        sorted.map(entry => {
          const energyScore = entry.successScore - entry.bitternessScore
          return (
            <button
              key={entry.id}
              onClick={() => onEntryClick(entry)}
              className="w-full bg-white dark:bg-space-800 rounded-2xl p-4 text-left hover:bg-gray-50 dark:hover:bg-space-700 transition-colors border"
              style={{ borderColor: energyBorder(energyScore) }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-base font-semibold text-gray-800 dark:text-slate-200">
                    {formatDisplay(entry.date)}
                  </div>
                  {entry.successMoment && (
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 truncate">
                      {entry.successMoment}
                    </p>
                  )}
                  {entry.dikw.wisdomAction && (
                    <p className="text-sm text-violet-600 dark:text-violet-400 mt-1 truncate flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                      {entry.dikw.wisdomAction}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm text-violet-600 dark:text-violet-300 font-semibold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5" />
                      {entry.successScore}
                    </span>
                    <span className="text-sm text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" />
                      {entry.bitternessScore}
                    </span>
                  </div>
                  {entry.splenic.hadIntuition && (
                    <span className="text-xs text-blue-500 dark:text-blue-400 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      直覺
                    </span>
                  )}
                  {entry.bitternessSource !== 'none' && (
                    <span className="text-xs text-gray-400 dark:text-slate-500">
                      {entry.bitternessSource === 'self-initiated' ? '主動發起'
                        : entry.bitternessSource === 'over-working' ? '過度勞動'
                        : '兩者'}
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })
      )}
    </div>
  )
}

export default HistoryList
