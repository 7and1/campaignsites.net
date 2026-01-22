'use client'

import { memo, useState } from 'react'

export const SubmissionForm = memo(function SubmissionForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('loading')

    const formData = new FormData(event.currentTarget)
    const payload = Object.fromEntries(formData.entries())

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json() as { error?: string; message?: string }
      if (!response.ok) throw new Error(data?.error || 'Submission failed')

      setStatus('success')
      setMessage(data?.message || 'Thanks! Your submission is in review.')
      event.currentTarget.reset()
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-white/70 bg-white/80 p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Name</label>
          <input
            name="name"
            required
            className="mt-2 w-full rounded-xl border border-mist-200 px-4 py-2.5 text-sm"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Email</label>
          <input
            type="email"
            name="email"
            required
            className="mt-2 w-full rounded-xl border border-mist-200 px-4 py-2.5 text-sm"
            placeholder="you@company.com"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Brand</label>
          <input
            name="brand"
            required
            className="mt-2 w-full rounded-xl border border-mist-200 px-4 py-2.5 text-sm"
            placeholder="Brand or campaign name"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Category</label>
          <input
            name="category"
            className="mt-2 w-full rounded-xl border border-mist-200 px-4 py-2.5 text-sm"
            placeholder="e.g. SaaS, DTC, Non-profit"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Campaign URL</label>
        <input
          type="url"
          name="url"
          className="mt-2 w-full rounded-xl border border-mist-200 px-4 py-2.5 text-sm"
          placeholder="https://example.com"
        />
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Summary</label>
        <textarea
          name="summary"
          rows={3}
          className="mt-2 w-full rounded-xl border border-mist-200 px-4 py-2.5 text-sm"
          placeholder="What made this campaign successful?"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Key metrics</label>
          <input
            name="metrics"
            className="mt-2 w-full rounded-xl border border-mist-200 px-4 py-2.5 text-sm"
            placeholder="e.g. 24% CVR, $82 CPA"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Tools used</label>
          <input
            name="tools"
            className="mt-2 w-full rounded-xl border border-mist-200 px-4 py-2.5 text-sm"
            placeholder="e.g. Unbounce, HubSpot, Hotjar"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="inline-flex items-center justify-center rounded-full bg-primary-600 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-primary-700 disabled:opacity-60"
      >
        {status === 'loading' ? 'Sending…' : 'Submit case study'}
      </button>
      {status !== 'idle' && (
        <p className={`text-xs ${status === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {message}
        </p>
      )}
      <p className="text-[11px] text-ink-500">
        Submissions are reviewed by our editorial team before publishing.
      </p>
    </form>
  )
})
