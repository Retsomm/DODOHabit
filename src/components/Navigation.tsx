import { Feather, Activity, Clock } from 'lucide-react'
import { ViewType } from '../types'

interface Props {
  view: ViewType
  onViewChange: (v: ViewType) => void
}

const TABS: { key: ViewType; label: string; Icon: React.ElementType }[] = [
  { key: 'reflection', label: '今日復盤', Icon: Feather },
  { key: 'dashboard', label: '能量圖譜', Icon: Activity },
  { key: 'history', label: '歷史記錄', Icon: Clock },
]

const Navigation = ({ view, onViewChange }: Props) => (
  <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-space-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-violet-900/30 pb-safe">
    <div className="flex max-w-lg mx-auto">
      {TABS.map(({ key, label, Icon }) => (
        <button
          key={key}
          onClick={() => onViewChange(key)}
          className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
            view === key
              ? 'text-violet-600 dark:text-violet-400'
              : 'text-gray-400 dark:text-slate-600 hover:text-gray-600 dark:hover:text-slate-400'
          }`}
        >
          <Icon className="w-5 h-5" strokeWidth={view === key ? 2.5 : 1.8} />
          <span className="text-xs font-medium tracking-wide">{label}</span>
        </button>
      ))}
    </div>
  </nav>
)

export default Navigation
