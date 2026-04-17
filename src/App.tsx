import { useState, useCallback } from 'react'
import { Sun, Moon, LogOut } from 'lucide-react'
import { ViewType, DailyEntry } from './types'
import useStorage from './hooks/useStorage'
import useAuth from './hooks/useAuth'
import useTheme from './hooks/useTheme'
import { todayStr } from './utils/dateUtils'
import Navigation from './components/Navigation'
import DailyReflection from './components/DailyReflection'
import Dashboard from './components/Dashboard'
import HistoryList from './components/HistoryList'
import AuthGate from './components/AuthGate'

const App = () => {
  const { theme, toggleTheme } = useTheme()
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
      <div className="min-h-screen bg-gray-50 dark:bg-space-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <AuthGate onSignIn={signInWithGoogle} />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-space-950">
      {syncing && (
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-violet-500 animate-pulse z-50" />
      )}

      {/* 右上角工具列 */}
      <div className="fixed top-3 right-4 z-40 flex items-center gap-3">
        {/* 主題切換 */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
          title={theme === 'dark' ? '切換淺色模式' : '切換深色模式'}
        >
          {theme === 'dark'
            ? <Sun className="w-4 h-4" />
            : <Moon className="w-4 h-4" />
          }
        </button>

        {/* 使用者 + 登出 */}
        <div className="flex items-center gap-1.5">
          <span
            className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900 border border-violet-300 dark:border-violet-700 flex items-center justify-center text-xs text-violet-700 dark:text-violet-300 font-bold cursor-default"
            title={user.email ?? ''}
          >
            {user.email?.[0]?.toUpperCase() ?? 'A'}
          </span>
          <button
            onClick={signOut}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 dark:text-slate-600 hover:text-gray-600 dark:hover:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            title="登出"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
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
        {view === 'dashboard' && <Dashboard entries={entries} isDark={theme === 'dark'} />}
        {view === 'history' && (
          <HistoryList entries={entries} onEntryClick={handleEntryClick} />
        )}
      </div>

      <Navigation view={view} onViewChange={handleViewChange} />
    </div>
  )
}

export default App
