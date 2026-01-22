'use client'

import { memo, MouseEvent, ReactNode } from 'react'

interface AffiliateCTAProps {
  href?: string
  toolSlug?: string
  context?: string
  className?: string
  children: ReactNode
}

export const AffiliateCTA = memo(function AffiliateCTA({ href, toolSlug, context, className, children }: AffiliateCTAProps) {
  const handleClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    const target = event.currentTarget.href
    if (!target || target === window.location.href) return

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'affiliate_click',
        toolSlug,
        context,
        url: target,
      }),
    }).catch(() => {
      // ignore tracking errors
    })
  }

  return (
    <a
      href={href || '#'}
      target="_blank"
      rel="noopener sponsored"
      data-affiliate={toolSlug}
      data-context={context}
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  )
})
