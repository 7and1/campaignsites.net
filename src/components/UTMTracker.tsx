'use client'

import { memo, useEffect } from 'react'
import { withCsrfToken } from '@/lib/csrf-client'

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const

export const UTMTracker = memo(function UTMTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const payload: Record<string, string> = {}

    UTM_KEYS.forEach((key) => {
      const value = params.get(key)
      if (value) payload[key] = value
    })

    if (!Object.keys(payload).length) return

    const cacheKey = `utm-track:${Object.values(payload).join(':')}`
    if (sessionStorage.getItem(cacheKey)) return

    sessionStorage.setItem(cacheKey, '1')

    const trackData = {
      eventType: 'utm_visit' as const,
      url: window.location.href,
      path: window.location.pathname,
      utm: payload,
    }

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(
        () => {
          fetch('/api/track', withCsrfToken({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trackData),
          })).catch(() => {
            // Ignore tracking errors
          })
        },
        { timeout: 2000 }
      )
    } else {
      fetch('/api/track', withCsrfToken({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackData),
      })).catch(() => {
        // Ignore tracking errors
      })
    }
  }, [])

  return null
})
