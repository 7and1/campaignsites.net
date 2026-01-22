'use client'

import { useEffect, useRef } from 'react'

interface ToolUsageTrackerProps {
  tool: string
  action?: string
}

type TrackEvent = {
  eventType: string
  toolSlug: string
  context: string
  url: string
  timestamp: number
}

const eventQueue: TrackEvent[] = []
let flushTimeout: ReturnType<typeof setTimeout> | null = null
let isBatching = false

function flushQueue() {
  if (eventQueue.length === 0 || isBatching) return

  isBatching = true
  const eventsToSend = [...eventQueue]
  eventQueue.length = 0

  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events: eventsToSend }),
  })
    .catch(() => {
      // silently fail - tracking shouldn't break UX
    })
    .finally(() => {
      isBatching = false
      flushTimeout = null
    })
}

function scheduleFlush() {
  if (flushTimeout) return
  flushTimeout = setTimeout(flushQueue, 1000)
}

function queueEvent(event: TrackEvent) {
  eventQueue.push(event)
  if (eventQueue.length >= 5) {
    flushQueue()
  } else {
    scheduleFlush()
  }
}

export function ToolUsageTracker({ tool, action = 'view' }: ToolUsageTrackerProps) {
  const trackedRef = useRef(false)

  useEffect(() => {
    if (trackedRef.current) return
    trackedRef.current = true

    const event: TrackEvent = {
      eventType: 'tool_usage',
      toolSlug: tool,
      context: action,
      url: window.location.href,
      timestamp: Date.now(),
    }

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => queueEvent(event), { timeout: 2000 })
    } else {
      queueEvent(event)
    }

    return () => {
      if (flushTimeout && eventQueue.length === 0) {
        clearTimeout(flushTimeout)
        flushTimeout = null
      }
    }
  }, [tool, action])

  return null
}
