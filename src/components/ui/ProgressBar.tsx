'use client'

import { cn } from '@/lib/utils'

interface ProgressBarProps {
  current: number
  total: number
  label?: string
  showPercentage?: boolean
  className?: string
}

export function ProgressBar({
  current,
  total,
  label,
  showPercentage = true,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100))

  return (
    <div className={cn('space-y-2', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium text-ink-900">{label}</span>}
          {showPercentage && (
            <span className="text-ink-600">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-mist-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={total}
        />
      </div>
    </div>
  )
}
