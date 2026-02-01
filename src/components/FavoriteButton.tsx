'use client'

import { Heart } from 'lucide-react'
import { useFavoritesStore, Favorite } from '@/lib/stores/favoritesStore'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Tooltip } from './ui/Tooltip'

interface FavoriteButtonProps {
  item: Omit<Favorite, 'addedAt'>
  className?: string
}

export function FavoriteButton({ item, className }: FavoriteButtonProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore()
  const favorited = isFavorite(item.id)

  const handleToggle = () => {
    if (favorited) {
      removeFavorite(item.id)
      toast.success('Removed from favorites')
    } else {
      addFavorite(item)
      toast.success('Added to favorites')
    }
  }

  return (
    <Tooltip content={favorited ? 'Remove from favorites' : 'Add to favorites'}>
      <button
        onClick={handleToggle}
        className={cn(
          'inline-flex items-center justify-center rounded-full p-2 transition',
          favorited
            ? 'bg-rose-100 text-rose-600 hover:bg-rose-200'
            : 'bg-mist-100 text-ink-600 hover:bg-mist-200',
          className
        )}
        aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
        aria-pressed={favorited}
      >
        <Heart className={cn('h-5 w-5', favorited && 'fill-current')} />
      </button>
    </Tooltip>
  )
}
