import { ViewType } from '../types'

interface Props {
  view: ViewType
  onViewChange: (v: ViewType) => void
  theme?: 'dark' | 'light'
  onToggleTheme?: () => void
  userEmail: string | null
  photoDataUrl: string
  photoPosition: { x: number; y: number }
  displayName: string
}

const HouseIcon = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      stroke="currentColor"
      strokeWidth={active ? 1.8 : 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const SunIcon = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r={active ? 3 : 2} stroke="currentColor" strokeWidth={active ? 1.8 : 1.5} />
    <path
      d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"
      stroke="currentColor"
      strokeWidth={active ? 1.8 : 1.5}
      strokeLinecap="round"
    />
  </svg>
)

const ClockIcon = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      stroke="currentColor"
      strokeWidth={active ? 1.8 : 1.5}
      strokeLinecap="round"
    />
  </svg>
)

const TABS: { key: ViewType; label: string }[] = [
  { key: 'reflection', label: '今日復盤' },
  { key: 'dashboard', label: '能量星圖' },
  { key: 'history', label: '歷史記錄' },
]

const TAB_ICON: Record<string, (active: boolean) => React.ReactNode> = {
  reflection: (a) => <HouseIcon active={a} />,
  dashboard: (a) => <SunIcon active={a} />,
  history: (a) => <ClockIcon active={a} />,
}

const Navigation = ({ view, onViewChange, userEmail, photoDataUrl, photoPosition, displayName }: Props) => {
  const initial = (displayName || userEmail || 'A')[0].toUpperCase()

  return (
    <nav className="shrink-0 z-50"
      style={{ background: 'rgba(10,8,7,0.95)', borderTop: '1px solid rgba(232,201,163,0.1)', backdropFilter: 'blur(20px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center h-16 max-w-lg mx-auto">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onViewChange(key)}
            className={`flex-1 h-full flex flex-col items-center justify-center gap-1 transition-colors ${
              view === key ? 'text-terracotta' : 'text-cream/30 hover:text-cream/60'
            }`}
          >
            {TAB_ICON[key](view === key)}
            <span className="text-xs font-mono-jetbrains tracking-widest uppercase hidden xs:block sm:block">
              {label}
            </span>
          </button>
        ))}

        <button
          onClick={() => onViewChange('profile')}
          className={`flex-1 h-full flex flex-col items-center justify-center gap-1 transition-all ${
            view === 'profile' ? 'text-terracotta' : 'text-cream/30 hover:text-cream/60'
          }`}
        >
          <span className={`w-6 h-6 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold border transition-all duration-200 ${
            view === 'profile'
              ? 'border-terracotta opacity-100'
              : 'border-warm-slate/30 opacity-50'
          }`}
            style={{
              background: 'radial-gradient(circle at 35% 35%, #E8C9A3, #D97757 60%, #B8593A)',
              boxShadow: view === 'profile' ? '0 0 10px rgba(217,119,87,0.6)' : 'none',
            }}
          >
            {photoDataUrl
              ? <img src={photoDataUrl} alt="avatar" className="w-full h-full object-cover"
                  style={{ objectPosition: `${photoPosition.x}% ${photoPosition.y}%` }} />
              : <span className="text-ink-deep font-fraunces italic">{initial}</span>
            }
          </span>
          <span className="text-xs font-mono-jetbrains tracking-widest uppercase hidden xs:block sm:block">
            帳號
          </span>
        </button>
      </div>
    </nav>
  )
}

export default Navigation
