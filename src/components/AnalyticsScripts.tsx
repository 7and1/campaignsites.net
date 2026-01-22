import Script from 'next/script'
import { memo } from 'react'

export const AnalyticsScripts = memo(function AnalyticsScripts() {
  const token = process.env.NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN
  if (!token) return null

  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      defer
      data-cf-beacon={`{"token":"${token}"}`}
      strategy="afterInteractive"
    />
  )
})
