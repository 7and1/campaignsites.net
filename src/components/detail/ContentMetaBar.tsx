import { memo } from 'react'
import { Calendar, Clock } from 'lucide-react'

interface ContentMetaBarProps {
  category?: string | null
  date?: string | null
  readingTime?: number
  score?: number | null
}

export const ContentMetaBar = memo(function ContentMetaBar({
  category,
  date,
  readingTime,
  score,
}: ContentMetaBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-ink-500">
      {category && (
        <span className="rounded-full bg-primary-50 px-3 py-1 font-semibold uppercase tracking-[0.2em] text-primary-600">
          {category}
        </span>
      )}
      {date && (
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      )}
      {readingTime !== undefined && readingTime > 0 && (
        <span className="inline-flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {readingTime} {readingTime === 1 ? 'min' : 'min'} read
        </span>
      )}
      {score !== undefined && score !== null && (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {score}/10
        </span>
      )}
    </div>
  )
})
