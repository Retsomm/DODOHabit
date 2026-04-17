import { Star, Flame, Eye, Lightbulb, BookOpen } from 'lucide-react'
import { DailyEntry } from '../types'
import { formatDisplay } from '../utils/dateUtils'

interface Props {
  entries: DailyEntry[]
  onEntryClick: (entry: DailyEntry) => void
}

const energyBorder = (score: number): string => {
  if (score >= 3) return 'rgba(5,150,105,0.35)'
  if (score >= 1) return 'rgba(99,102,241,0.35)'
  if (score >= -1) return 'rgba(217,119,6,0.35)'
  return 'rgba(153,27,27,0.35)'
}

const HistoryList = ({ entries, onEntryClick }: Props) => {
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <BookOpen className="w-12 h-12 text-gray-300 dark:text-slate-700 mb-4" strokeWidth={1.2} />
        <p className="text-gray-500 dark:text-slate-400 font-medium text-lg">還沒有記錄</p>
        <p className="text-gray-400 dark:text-slate-600 text-base mt-1">開始你的第一次復盤吧！</p>
      </div>
    )
  }

  return (
    <div className="px-4 pt-6 pb-28 max-w-lg mx-auto space-y-3">
      <div className="flex items-baseline gap-2 mb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">歷史記錄</h1>
        <span className="text-base text-gray-400 dark:text-slate-500">共 {sorted.length} 天</span>
      </div>

      {sorted.map(entry => {
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
      })}
    </div>
  )
}

export default HistoryList
