'use client'

import { memo, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { AffiliateCTA } from '@/components/AffiliateCTA'

interface ExitIntentModalProps {
  title: string
  description: string
  ctaLabel: string
  ctaHref?: string
  context: string
}

export const ExitIntentModal = memo(function ExitIntentModal({ title, description, ctaLabel, ctaHref, context }: ExitIntentModalProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const key = `exit-intent:${context}`
    if (sessionStorage.getItem(key)) return

    const onMouseOut = (event: MouseEvent) => {
      if (event.clientY <= 0) {
        sessionStorage.setItem(key, '1')
        setOpen(true)
      }
    }

    document.addEventListener('mouseout', onMouseOut)
    return () => document.removeEventListener('mouseout', onMouseOut)
  }, [context])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/70 bg-white/95 p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Before you go</p>
            <h3 className="mt-2 text-xl font-semibold text-ink-900">{title}</h3>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-full border border-ink-200 p-1 text-ink-500 hover:text-ink-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-3 text-sm text-ink-600">{description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <AffiliateCTA
            href={ctaHref}
            toolSlug={context}
            context="exit-intent"
            className="inline-flex items-center rounded-full bg-primary-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-primary-700"
          >
            {ctaLabel}
          </AffiliateCTA>
          <button
            onClick={() => setOpen(false)}
            className="rounded-full border border-ink-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-600"
          >
            Stay here
          </button>
        </div>
      </div>
    </div>
  )
})
