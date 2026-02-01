import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Favorite {
  id: string
  type: 'tool' | 'post' | 'case-study'
  title: string
  slug: string
  addedAt: number
}

interface FavoritesState {
  favorites: Favorite[]
  addFavorite: (favorite: Omit<Favorite, 'addedAt'>) => void
  removeFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  clearFavorites: () => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (favorite) =>
        set((state) => {
          if (state.favorites.some((f) => f.id === favorite.id)) {
            return state
          }
          return {
            favorites: [...state.favorites, { ...favorite, addedAt: Date.now() }],
          }
        }),
      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== id),
        })),
      isFavorite: (id) => get().favorites.some((f) => f.id === id),
      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: 'favorites-storage',
    }
  )
)
