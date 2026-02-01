import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ToolHistoryEntry {
  toolId: string
  toolName: string
  timestamp: number
  data?: Record<string, unknown>
}

interface ToolHistoryState {
  history: ToolHistoryEntry[]
  addToHistory: (entry: Omit<ToolHistoryEntry, 'timestamp'>) => void
  clearHistory: () => void
  getToolHistory: (toolId: string) => ToolHistoryEntry[]
}

export const useToolHistoryStore = create<ToolHistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      addToHistory: (entry) =>
        set((state) => {
          const newEntry = { ...entry, timestamp: Date.now() }
          const updatedHistory = [newEntry, ...state.history].slice(0, 10)
          return { history: updatedHistory }
        }),
      clearHistory: () => set({ history: [] }),
      getToolHistory: (toolId) => {
        return get().history.filter((entry) => entry.toolId === toolId)
      },
    }),
    {
      name: 'tool-history-storage',
    }
  )
)
