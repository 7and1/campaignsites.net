'use client'

import { memo, useEffect, useState } from 'react'
import { Copy, Check, Twitter, Linkedin } from 'lucide-react'

interface ShareBarProps {
  title: string
}

export const ShareBar = memo(function ShareBar({ title }: ShareBarProps) {
  const [url, setUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setUrl(window.location.href)
  }, [])

  const copy = async () => {
    if (!url) return
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/70 bg-white/80 p-4 text-sm text-ink-600 shadow-sm">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Share</span>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-2 rounded-full border border-ink-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-ink-600 transition hover:border-primary-300"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? 'Copied' : 'Copy link'}
      </button>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-ink-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-ink-600 transition hover:border-primary-300"
      >
        <Twitter className="h-3.5 w-3.5" />
        Twitter
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-ink-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-ink-600 transition hover:border-primary-300"
      >
        <Linkedin className="h-3.5 w-3.5" />
        LinkedIn
      </a>
    </div>
  )
})
