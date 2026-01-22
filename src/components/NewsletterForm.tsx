'use client'

import { memo, useState } from 'react'

const leadMagnets = [
  {
    value: 'landing-page-checklist',
    label: 'Landing Page Launch Checklist (PDF)',
  },
  {
    value: 'utm-naming-guide',
    label: 'UTM Naming Guide (Template)',
  },
  {
    value: 'cta-swipe-file',
    label: 'High-Intent CTA Swipe File',
  },
]

interface NewsletterFormProps {
  source?: string
  compact?: boolean
}

export const NewsletterForm = memo(function NewsletterForm({ source = 'site', compact = false }: NewsletterFormProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('loading')

    const formData = new FormData(event.currentTarget)
    const payload = {
      email: formData.get('email'),
      name: formData.get('name'),
      leadMagnet: formData.get('leadMagnet'),
      source,
    }

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json() as { error?: string; message?: string }
      if (!response.ok) throw new Error(data?.error || 'Subscription failed')

      setStatus('success')
      setMessage(data?.message || 'You are in! Check your inbox for the resources.')
      event.currentTarget.reset()
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again in a moment.')
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`flex w-full flex-col gap-3 rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm ${
        compact ? '' : 'sm:p-6'
      }`}
    >
      <div>
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Email</label>
        <input
          type="email"
          name="email"
          required
          placeholder="you@company.com"
          className="mt-2 w-full rounded-xl border border-mist-200 bg-white px-4 py-2.5 text-sm text-ink-700 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Name</label>
          <input
            type="text"
            name="name"
            placeholder="Optional"
            className="mt-2 w-full rounded-xl border border-mist-200 bg-white px-4 py-2.5 text-sm text-ink-700 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Lead Magnet</label>
          <select
            name="leadMagnet"
            className="mt-2 w-full rounded-xl border border-mist-200 bg-white px-4 py-2.5 text-sm text-ink-700 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            {leadMagnets.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="submit"
        disabled={status === 'loading'}
        className="inline-flex items-center justify-center rounded-full bg-primary-600 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-primary-700 disabled:opacity-60"
      >
        {status === 'loading' ? 'Sending…' : 'Send me the guide'}
      </button>
      {status !== 'idle' && (
        <p className={`text-xs ${status === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {message}
        </p>
      )}
      <p className="text-[11px] text-ink-500">
        We send one actionable brief per week. Unsubscribe anytime.
      </p>
    </form>
  )
})
