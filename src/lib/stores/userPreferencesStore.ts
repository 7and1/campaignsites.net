import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'

interface UserPreferencesState {
  theme: Theme
  reducedMotion: boolean
  fontSize: 'small' | 'medium' | 'large'
  setTheme: (theme: Theme) => void
  setReducedMotion: (enabled: boolean) => void
  setFontSize: (size: 'small' | 'medium' | 'large') => void
}

export const useUserPreferencesStore = create<UserPreferencesState>()(
  persist(
    (set) => ({
      theme: 'system',
      reducedMotion: false,
      fontSize: 'medium',
      setTheme: (theme) => set({ theme }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setFontSize: (fontSize) => set({ fontSize }),
    }),
    {
      name: 'user-preferences-storage',
    }
  )
)
