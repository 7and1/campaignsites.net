'use client'

import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

interface AlertProps {
  variant?: 'error' | 'warning' | 'success' | 'info'
  title?: string
  children: React.ReactNode
  dismissible?: boolean
  className?: string
  onDismiss?: () => void
}

export function Alert({
  variant = 'info',
  title,
  children,
  dismissible = false,
  className,
  onDismiss,
}: AlertProps) {
  const [visible, setVisible] = useState(true)

  const handleDismiss = () => {
    setVisible(false)
    onDismiss?.()
  }

  if (!visible) return null

  const variants = {
    error: {
      container: 'border-rose-200 bg-rose-50 text-rose-900',
      icon: AlertCircle,
      iconColor: 'text-rose-600',
    },
    warning: {
      container: 'border-amber-200 bg-amber-50 text-amber-900',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
    },
    success: {
      container: 'border-emerald-200 bg-emerald-50 text-emerald-900',
      icon: CheckCircle,
      iconColor: 'text-emerald-600',
    },
    info: {
      container: 'border-sky-200 bg-sky-50 text-sky-900',
      icon: Info,
      iconColor: 'text-sky-600',
    },
  }

  const { container, icon: Icon, iconColor } = variants[variant]

  return (
    <div
      role="alert"
      className={cn('relative rounded-xl border p-4', container, className)}
    >
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 flex-shrink-0 ${iconColor}`} aria-hidden="true" />
        <div className="flex-1">
          {title && <p className="font-semibold">{title}</p>}
          <div className="text-sm">{children}</div>
        </div>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 rounded-lg p-1 hover:bg-black/5"
            aria-label="Dismiss alert"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

interface InlineErrorProps {
  id?: string
  children: React.ReactNode
  className?: string
}

export function InlineError({ id, children, className }: InlineErrorProps) {
  return (
    <p id={id} className={cn('flex items-center gap-1 text-xs text-rose-600', className)} role="alert">
      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}

interface InlineSuccessProps {
  id?: string
  children: React.ReactNode
  className?: string
}

export function InlineSuccess({ id, children, className }: InlineSuccessProps) {
  return (
    <p id={id} className={cn('flex items-center gap-1 text-xs text-emerald-600', className)} role="status">
      <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}
