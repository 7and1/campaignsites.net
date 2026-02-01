'use client'

import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: 'bg-white border-mist-200 shadow-lg',
          title: 'text-ink-900 font-semibold',
          description: 'text-ink-600',
          actionButton: 'bg-ink-900 text-white',
          cancelButton: 'bg-mist-100 text-ink-900',
          error: 'bg-rose-50 border-rose-200',
          success: 'bg-emerald-50 border-emerald-200',
          warning: 'bg-amber-50 border-amber-200',
          info: 'bg-blue-50 border-blue-200',
        },
      }}
    />
  )
}
