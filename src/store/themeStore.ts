import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'light'

interface ThemeStore {
  theme: Theme
  toggleTheme: () => void
}

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggleTheme: () => {
        const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
        applyTheme(next)
        set({ theme: next })
      },
    }),
    {
      name: 'dodo_theme',
      onRehydrateStorage: () => state => {
        if (state) applyTheme(state.theme)
      },
    }
  )
)
