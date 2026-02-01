'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/monitoring/logger'

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log error to monitoring service
    logger.error('React error boundary caught error', error, {
      digest: error.digest,
      component: 'error.tsx',
    })
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-16">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-ink-900">Something went wrong</h2>
        <p className="mt-2 text-ink-600">
          We apologize for the inconvenience. Please try again.
        </p>
        {error.digest && (
          <p className="mt-4 text-xs text-ink-400">Error ID: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
