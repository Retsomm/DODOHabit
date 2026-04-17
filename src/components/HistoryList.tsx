import { DailyEntry } from '../types'
import { formatDisplay } from '../utils/dateUtils'

interface Props {
  entries: DailyEntry[]
  onEntryClick: (entry: DailyEntry) => void
}

const energyBorder = (score: number): string => {
  if (score >= 3) return 'rgba(5,150,105,0.3)'
  if (score >= 1) return 'rgba(99,102,241,0.3)'
  if (score >= -1) return 'rgba(217,119,6,0.3)'
  return 'rgba(153,27,27,0.3)'
}

const HistoryList = ({ entries, onEntryClick }: Props) => {
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-5xl mb-4">📜</div>
        <p className="text-slate-400 font-medium">還沒有記錄</p>
        <p className="text-slate-600 text-sm mt-1">開始你的第一次復盤吧！</p>
      </div>
    )
  }

  return (
    <div className="px-4 pt-6 pb-28 max-w-lg mx-auto space-y-3">
      <div className="flex items-baseline gap-2 mb-2">
        <h1 className="text-xl font-bold text-slate-100">歷史記錄</h1>
        <span className="text-sm text-slate-500">共 {sorted.length} 天</span>
      </div>

      {sorted.map(entry => {
        const energyScore = entry.successScore - entry.bitternessScore
        return (
          <button
            key={entry.id}
            onClick={() => onEntryClick(entry)}
            className="w-full bg-space-800 rounded-2xl p-4 text-left hover:bg-space-700 transition-colors border"
            style={{ borderColor: energyBorder(energyScore) }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-200">
                  {formatDisplay(entry.date)}
                </div>
                {entry.successMoment && (
                  <p className="text-xs text-slate-500 mt-1 truncate">
                    {entry.successMoment}
                  </p>
                )}
                {entry.dikw.wisdomAction && (
                  <p className="text-xs text-violet-400 mt-1 truncate">
                    💡 {entry.dikw.wisdomAction}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-violet-300 font-medium">✨ {entry.successScore}</span>
                  <span className="text-xs text-amber-400 font-medium">🔥 {entry.bitternessScore}</span>
                </div>
                {entry.splenic.hadIntuition && (
                  <span className="text-xs text-blue-400">🔮 直覺</span>
                )}
                {entry.bitternessSource !== 'none' && (
                  <span className="text-[10px] text-slate-500">
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
