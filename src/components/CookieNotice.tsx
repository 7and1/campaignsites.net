'use client'

import { memo, useEffect, useState } from 'react'
import Link from 'next/link'

export const CookieNotice = memo(function CookieNotice() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('cs-cookie-consent')
    if (!stored) {
      setVisible(true)
    }
  }, [])

  const acceptAll = () => {
    localStorage.setItem('cs-cookie-consent', 'all')
    setVisible(false)
  }

  const rejectNonEssential = () => {
    localStorage.setItem('cs-cookie-consent', 'essential')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 rounded-2xl border border-white/60 bg-white/90 p-4 shadow-lg shadow-black/10 backdrop-blur">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 text-sm text-ink-700 md:flex-row md:items-center md:justify-between">
        <p className="flex-1">
          We use cookies to understand how you use CampaignSites and to improve the tools. See our{' '}
          <Link href="/privacy" className="font-semibold text-primary-600 underline-offset-4 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex gap-2">
          <button
            onClick={rejectNonEssential}
            className="inline-flex items-center justify-center rounded-full border border-ink-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-600 transition hover:border-ink-300 hover:bg-ink-50"
          >
            Reject Non-Essential
          </button>
          <button
            onClick={acceptAll}
            className="inline-flex items-center justify-center rounded-full bg-primary-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-primary-700"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  )
})
