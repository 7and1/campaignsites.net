'use client'

import { useEffect } from 'react'
import { reportWebVital } from '@/lib/monitoring'

/**
 * Web Vitals reporter component
 * Tracks Core Web Vitals and sends to analytics
 */
export function WebVitals() {
  useEffect(() => {
    // Only track in production
    if (process.env.NODE_ENV !== 'production') {
      return
    }

    // Dynamically import web-vitals to avoid SSR issues
    import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      onCLS(reportWebVital)
      onFCP(reportWebVital)
      onLCP(reportWebVital)
      onTTFB(reportWebVital)
      onINP(reportWebVital)
    }).catch(() => {
      // Silently fail if web-vitals not available
    })
  }, [])

  return null
}
