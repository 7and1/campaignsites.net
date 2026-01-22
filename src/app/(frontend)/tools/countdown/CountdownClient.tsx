'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Copy, Timer } from 'lucide-react'
import { AffiliateCTA, ExitIntentModal, ToolUsageTracker } from '@/components'
import { AFFILIATE_URLS, COUNTDOWN_PRESETS, UI_CONSTANTS } from '@/lib/constants'

export default function CountdownClient() {
  const [date, setDate] = useState('')
  const [title, setTitle] = useState('Sale Ends In')
  const [bgColor, setBgColor] = useState('#0f172a')
  const [textColor, setTextColor] = useState('#ffffff')
  const [copied, setCopied] = useState(false)
  const [remaining, setRemaining] = useState('00:00:00:00')
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!previewRef.current) return
    previewRef.current.style.setProperty('--timer-bg', bgColor)
    previewRef.current.style.setProperty('--timer-text', textColor)
  }, [bgColor, textColor])

  useEffect(() => {
    if (!date) {
      setRemaining('00:00:00:00')
      return
    }

    const interval = setInterval(() => {
      const target = new Date(date).getTime()
      const now = Date.now()
      const diff = Math.max(0, target - now)
      const d = Math.floor(diff / UI_CONSTANTS.MILLISECONDS_PER_DAY)
      const h = Math.floor((diff % UI_CONSTANTS.MILLISECONDS_PER_DAY) / UI_CONSTANTS.MILLISECONDS_PER_HOUR)
      const m = Math.floor((diff % UI_CONSTANTS.MILLISECONDS_PER_HOUR) / UI_CONSTANTS.MILLISECONDS_PER_MINUTE)
      const s = Math.floor((diff % UI_CONSTANTS.MILLISECONDS_PER_MINUTE) / UI_CONSTANTS.MILLISECONDS_PER_SECOND)
      setRemaining(
        `${d.toString().padStart(2, '0')}:${h.toString().padStart(2, '0')}:${m
          .toString()
          .padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      )
    }, UI_CONSTANTS.TIMER_UPDATE_INTERVAL)

    return () => clearInterval(interval)
  }, [date])

  const embedCode = useMemo(
    () =>
      `<div id="campaign-timer" data-date="${date}" data-title="${title}" style="background:${bgColor};color:${textColor};padding:20px;text-align:center;font-family:system-ui;border-radius:8px;">
  <div style="font-size:14px;margin-bottom:8px;">${title}</div>
  <div id="timer-display" style="font-size:32px;font-weight:bold;">00:00:00:00</div>
</div>
<script>
(function(){
  const el = document.getElementById('campaign-timer');
  const display = document.getElementById('timer-display');
  const target = new Date(el.dataset.date).getTime();
  setInterval(function(){
    const now = Date.now();
    const diff = Math.max(0, target - now);
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    display.textContent = d.toString().padStart(2,'0') + ':' + h.toString().padStart(2,'0') + ':' + m.toString().padStart(2,'0') + ':' + s.toString().padStart(2,'0');
  }, 1000);
})();
</script>`,
    [date, title, bgColor, textColor]
  )

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), UI_CONSTANTS.COPY_FEEDBACK_DURATION)
  }

  return (
    <main className="min-h-screen">
      <ToolUsageTracker tool="countdown" />

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="glass-panel p-8 md:p-10">
            <p className="section-kicker">Urgency tool</p>
            <h1 className="mt-3 text-3xl font-semibold text-ink-900">Countdown Timer Generator</h1>
            <p className="mt-3 text-sm text-ink-600">
              Create urgency with embed-ready countdown timers. Customize colors, preview live, and paste
              into any page builder.
            </p>

            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              <div className="space-y-6 rounded-2xl border border-white/70 bg-white/80 p-6 shadow-sm">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">End date</label>
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-mist-200 px-4 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Title text</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-mist-200 px-4 py-2.5 text-sm"
                    placeholder="Sale Ends In"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Background</label>
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(event) => setBgColor(event.target.value)}
                      className="mt-2 h-10 w-full cursor-pointer rounded-xl border border-mist-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Text color</label>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(event) => setTextColor(event.target.value)}
                      className="mt-2 h-10 w-full cursor-pointer rounded-xl border border-mist-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Quick presets</label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {COUNTDOWN_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => {
                          setBgColor(preset.color)
                          setTextColor(preset.accent)
                        }}
                        className="rounded-full border border-ink-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-ink-600 transition hover:border-primary-300"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div ref={previewRef} className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-sm">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Preview</h3>
                  <div className="mt-4 rounded-xl bg-[var(--timer-bg)] p-5 text-center text-[var(--timer-text)]">
                    <div className="text-xs uppercase tracking-[0.2em]">{title}</div>
                    <div className="mt-2 text-3xl font-semibold">{remaining}</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Embed code</h3>
                    <button
                      onClick={copyToClipboard}
                      className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="mt-4 max-h-56 overflow-auto rounded-xl bg-mist-100 p-4 text-xs text-ink-600">
                    {embedCode}
                  </pre>
                </div>

                <div className="rounded-2xl border border-primary-200 bg-primary-50 p-6 text-sm text-primary-900">
                  <div className="flex items-center gap-2 text-primary-700">
                    <Timer className="h-5 w-5" />
                    <span className="text-xs font-semibold uppercase tracking-[0.2em]">Affiliate pick</span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">Need advanced countdowns?</h3>
                  <p className="mt-2 text-primary-800">
                    Elfsight adds animated styles, email capture, and analytics for your campaigns.
                  </p>
                  <AffiliateCTA
                    href={AFFILIATE_URLS.elfsight}
                    toolSlug="elfsight"
                    context="countdown"
                    className="mt-4 inline-flex items-center rounded-full bg-primary-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
                  >
                    Try Elfsight Free
                  </AffiliateCTA>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ExitIntentModal
        title="Want animated countdowns?"
        description="Unlock animated timers, list growth, and analytics by pairing your countdown with Elfsight."
        ctaLabel="See Elfsight"
        ctaHref={AFFILIATE_URLS.elfsight}
        context="countdown"
      />
    </main>
  )
}
