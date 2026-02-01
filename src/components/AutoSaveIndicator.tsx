'use client'

import { CheckCircle2, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AutoSaveIndicatorProps {
  isSaving: boolean
  lastSaved: Date | null
  className?: string
}

export function AutoSaveIndicator({ isSaving, lastSaved, className }: AutoSaveIndicatorProps) {
  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  return (
    <div className={cn('flex items-center gap-2 text-xs text-ink-600', className)}>
      {isSaving ? (
        <>
          <Save className="h-4 w-4 animate-pulse" />
          <span>Saving...</span>
        </>
      ) : lastSaved ? (
        <>
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Saved {getTimeAgo(lastSaved)}</span>
        </>
      ) : null}
    </div>
  )
}
