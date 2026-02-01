'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/monitoring/logger'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log critical error to monitoring service
    logger.error('Global error boundary caught critical error', error, {
      digest: error.digest,
      component: 'global-error.tsx',
      critical: true,
    })
  }, [error])

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-mist-50 px-6">
        <div className="text-center">
          <h1 className="text-4xl font-semibold text-ink-900">Application Error</h1>
          <p className="mt-4 max-w-md text-ink-600">
            A critical error occurred. Our team has been notified and is working on a fix.
          </p>
          {error.digest && (
            <p className="mt-4 text-xs text-ink-400">Reference: {error.digest}</p>
          )}
          <button
            onClick={reset}
            className="mt-8 inline-flex items-center rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            Reload application
          </button>
        </div>
      </body>
    </html>
  )
}
