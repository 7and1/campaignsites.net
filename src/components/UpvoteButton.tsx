'use client'

import { memo, useCallback, useEffect, useState } from 'react'
import { ThumbsUp } from 'lucide-react'

interface UpvoteButtonProps {
  contentType: string
  slug: string
}

export const UpvoteButton = memo(function UpvoteButton({ contentType, slug }: UpvoteButtonProps) {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    const response = await fetch(`/api/upvote?contentType=${contentType}&slug=${slug}`)
    const data = await response.json() as { count?: number }
    setCount(data.count || 0)
  }, [contentType, slug])

  useEffect(() => {
    load()
  }, [load])

  const onUpvote = useCallback(async () => {
    setLoading(true)
    const response = await fetch('/api/upvote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType, slug }),
    })
    const data = await response.json() as { count?: number }
    setCount(data.count || count)
    setLoading(false)
  }, [contentType, slug, count])

  return (
    <button
      onClick={onUpvote}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-full border border-ink-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-600 transition hover:border-primary-300 disabled:opacity-60"
    >
      <ThumbsUp className="h-4 w-4" /> {count}
    </button>
  )
})
