import { useState, useCallback } from 'react'
import { ViewType, DailyEntry } from './types'
import useStorage from './hooks/useStorage'
import useAuth from './hooks/useAuth'
import { todayStr } from './utils/dateUtils'
import Navigation from './components/Navigation'
import DailyReflection from './components/DailyReflection'
import Dashboard from './components/Dashboard'
import HistoryList from './components/HistoryList'
import AuthGate from './components/AuthGate'

const App = () => {
  const { user, loading, signInWithGoogle, signOut } = useAuth()
  const [view, setView] = useState<ViewType>('reflection')
  const [viewingDate, setViewingDate] = useState<string>(todayStr())
  const { entries, saveEntry, getByDate, syncing } = useStorage(user?.uid)

  const currentEntry = getByDate(viewingDate)

  const handleViewChange = useCallback((v: ViewType) => {
    if (v === 'reflection') setViewingDate(todayStr())
    setView(v)
  }, [])

  const handleEntryClick = useCallback((entry: DailyEntry) => {
    setViewingDate(entry.date)
    setView('reflection')
  }, [])

  const handleBack = useCallback(() => {
    setView('history')
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-space-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <AuthGate onSignIn={signInWithGoogle} />
  }

  return (
    <div className="min-h-screen bg-space-950">
      {/* 同步指示條 */}
      {syncing && (
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-violet-500 animate-pulse z-50" />
      )}

      {/* 右上角使用者狀態 */}
      <div className="fixed top-3 right-4 z-40 flex items-center gap-2">
        <span
          className="w-6 h-6 rounded-full bg-violet-900 border border-violet-700 flex items-center justify-center text-[10px] text-violet-300 font-bold cursor-default"
          title={user.email ?? ''}
        >
          {user.email?.[0]?.toUpperCase() ?? 'A'}
        </span>
        <button
          onClick={signOut}
          className="text-[10px] text-slate-700 hover:text-slate-400 transition-colors"
        >
          登出
        </button>
      </div>

      <div className="overflow-y-auto">
        {view === 'reflection' && (
          <DailyReflection
            viewDate={viewingDate}
            existingEntry={currentEntry}
            onSave={saveEntry}
            onBack={viewingDate !== todayStr() ? handleBack : undefined}
          />
        )}
        {view === 'dashboard' && <Dashboard entries={entries} />}
        {view === 'history' && (
          <HistoryList entries={entries} onEntryClick={handleEntryClick} />
        )}
      </div>

      <Navigation view={view} onViewChange={handleViewChange} />
    </div>
  )
}

export default App
