import { ViewType } from '../types'

interface Props {
  view: ViewType
  onViewChange: (v: ViewType) => void
}

const TABS: { key: ViewType; label: string; icon: string }[] = [
  { key: 'reflection', label: '今日復盤', icon: '✨' },
  { key: 'dashboard', label: '能量圖譜', icon: '📊' },
  { key: 'history', label: '歷史記錄', icon: '📜' },
]

const Navigation = ({ view, onViewChange }: Props) => (
  <nav className="fixed bottom-0 left-0 right-0 z-50 bg-space-900/95 backdrop-blur-sm border-t border-violet-900/30 pb-safe">
    <div className="flex max-w-lg mx-auto">
      {TABS.map(tab => (
        <button
          key={tab.key}
          onClick={() => onViewChange(tab.key)}
          className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors ${
            view === tab.key
              ? 'text-violet-400'
              : 'text-slate-600 hover:text-slate-400'
          }`}
        >
          <span className="text-xl leading-none">{tab.icon}</span>
          <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
        </button>
      ))}
    </div>
  </nav>
)

export default Navigation
