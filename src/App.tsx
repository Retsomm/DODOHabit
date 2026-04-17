import { useState, useCallback } from 'react'
import { ViewType, DailyEntry } from './types'
import useStorage from './hooks/useStorage'
import useAuth from './hooks/useAuth'
import useProfile from './hooks/useProfile'
import { useThemeStore } from './store/themeStore'
import { todayStr } from './utils/dateUtils'
import Navigation from './components/Navigation'
import DailyReflection from './components/DailyReflection'
import Dashboard from './components/Dashboard'
import HistoryList from './components/HistoryList'
import Profile from './components/Profile'
import AuthGate from './components/AuthGate'

const App = () => {
  const { theme, toggleTheme } = useThemeStore()
  const { user, loading, signInWithGoogle, signOut } = useAuth()
  const [view, setView] = useState<ViewType>(() => {
    const saved = localStorage.getItem('lastView')
    if (saved === 'reflection' || saved === 'dashboard' || saved === 'history' || saved === 'profile') return saved
    return 'reflection'
  })
  const [viewingDate, setViewingDate] = useState<string>(todayStr())
  const { entries, saveEntry, getByDate, syncing } = useStorage(user?.uid)
  const { profile, saveProfile, saving } = useProfile(user?.uid)

  const currentEntry = getByDate(viewingDate)

  const handleViewChange = useCallback((v: ViewType) => {
    if (v === 'reflection') setViewingDate(todayStr())
    setView(v)
    localStorage.setItem('lastView', v)
  }, [])

  const handleEntryClick = useCallback((entry: DailyEntry) => {
    setViewingDate(entry.date)
    setView('reflection')
  }, [])

  const handleDateSelect = useCallback((dateStr: string) => {
    setViewingDate(dateStr)
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

      <div className="overflow-y-auto pt-safe">
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
          <HistoryList entries={entries} onEntryClick={handleEntryClick} onDateSelect={handleDateSelect} />
        )}
        {view === 'profile' && (
          <Profile
            userEmail={user.email}
            profile={profile}
            saving={saving}
            onSave={saveProfile}
            onSignOut={signOut}
          />
        )}
      </div>

      <Navigation
        view={view}
        onViewChange={handleViewChange}
        theme={theme}
        onToggleTheme={toggleTheme}
        userEmail={user.email}
        photoDataUrl={profile.photoDataUrl}
        photoPosition={profile.photoPosition}
        displayName={profile.displayName}
      />
    </div>
  )
}

export default App
