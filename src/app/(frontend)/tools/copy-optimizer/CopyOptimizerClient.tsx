'use client'

import { useState, useCallback, useEffect } from 'react'
import { RefreshCw, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react'
import { analyzeCopy } from '@/app/actions/analyze-copy'
import { AffiliateCTA, ExitIntentModal, ToolUsageTracker } from '@/components'
import { AFFILIATE_URLS } from '@/lib/constants'
import type { CopyAnalysisResult } from '@/lib/types'
import { Button, Alert, CardSkeleton } from '@/components/ui'

type CopyType = 'headline' | 'cta'

export default function CopyOptimizerClient() {
  const [text, setText] = useState('')
  const [type, setType] = useState<CopyType>('headline')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CopyAnalysisResult | null>(null)
  const [touched, setTouched] = useState(false)
  const [copiedVariant, setCopiedVariant] = useState<number | null>(null)

  const validateText = useCallback((value: string) => {
    if (!value.trim()) return 'Please enter some copy to analyze'
    if (value.trim().length < 5) return 'Copy is too short (min 5 characters)'
    if (value.trim().length > 500) return 'Copy is too long (max 500 characters)'
    return undefined
  }, [])

  const textError = touched ? validateText(text) : undefined
  const isValid = !textError && text.trim().length > 0

  const analyze = useCallback(async () => {
    if (!isValid) {
      setTouched(true)
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'tool_action', toolSlug: 'copy-optimizer', context: 'analyze' }),
      }).catch(() => {
        // Ignore tracking errors
      })

      const response = await analyzeCopy(text.trim(), type)
      setResult(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze copy. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [text, type, isValid])

  const handleRetry = useCallback(() => {
    analyze()
  }, [analyze])

  const handleTypeChange = useCallback((newType: CopyType) => {
    setType(newType)
    setResult(null)
    setError(null)
  }, [])

  const handleVariantClick = useCallback((variant: string, index: number) => {
    setText(variant)
    setCopiedVariant(index)
    navigator.clipboard.writeText(variant).catch(() => {})
    setTimeout(() => setCopiedVariant(null), 2000)
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-100'
    if (score >= 60) return 'text-amber-600 bg-amber-100'
    return 'text-rose-600 bg-rose-100'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    return 'Needs work'
  }

  const getScoreMessage = (score: number) => {
    if (score >= 80) return 'Strong conversion potential. Ready to test!'
    if (score >= 60) return 'Good foundation. Consider the suggestions below.'
    return 'Review the suggestions to improve impact.'
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !loading) {
        analyze()
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [analyze, loading])

  return (
    <main className="min-h-screen">
      <ToolUsageTracker tool="copy-optimizer" />

      <section className="py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="glass-panel p-6 sm:p-8 md:p-10">
            <p className="section-kicker">AI tool</p>
            <h1 className="mt-3 text-2xl sm:text-3xl font-semibold text-ink-900">AI Copy Optimizer</h1>
            <p className="mt-3 text-sm text-ink-600">
              Score headlines and CTAs instantly. Get improvements and AI variants you can test today.
            </p>

            <div className="mt-8 grid gap-6 lg:gap-8 lg:grid-cols-2">
              <div className="space-y-4 sm:space-y-6 rounded-2xl border border-white/70 bg-white/80 p-4 sm:p-6 shadow-sm">
                <fieldset className="space-y-3">
                  <legend className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                    Copy type
                  </legend>
                  <div className="grid grid-cols-2 gap-2" role="group" aria-label="Select copy type">
                    {(['headline', 'cta'] as CopyType[]).map((option) => (
                      <button
                        key={option}
                        onClick={() => handleTypeChange(option)}
                        aria-pressed={type === option}
                        className={`min-h-[48px] rounded-xl border px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] transition focus:outline-none focus:ring-2 focus:ring-primary-300 ${
                          type === option
                            ? 'border-primary-300 bg-primary-50 text-primary-600'
                            : 'border-ink-200 text-ink-500 hover:border-primary-200'
                        }`}
                        type="button"
                      >
                        {option === 'headline' ? 'Headline' : 'CTA'}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-ink-500 mb-2">
                    Your copy
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value)
                      setTouched(true)
                      setError(null)
                    }}
                    onBlur={() => setTouched(true)}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none ${
                      textError ? 'border-rose-300' : 'border-mist-200'
                    }`}
                    placeholder={
                      type === 'headline'
                        ? 'e.g., Double your pipeline in 30 days'
                        : 'e.g., Get the launch plan'
                    }
                    rows={5}
                    maxLength={500}
                    aria-invalid={!!textError}
                    aria-describedby={textError ? 'text-error' : undefined}
                  />
                  <div className="mt-1.5 flex items-center justify-between text-xs">
                    {textError ? (
                      <span id="text-error" className="text-rose-600 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        {textError}
                      </span>
                    ) : (
                      <span className="text-ink-500">{text.length}/500 characters</span>
                    )}
                    <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-mist-100 px-1.5 py-0.5 text-[10px] text-ink-500">
                      <span>⌘</span>
                      <span>Enter</span>
                      <span className="text-ink-400">to analyze</span>
                    </kbd>
                  </div>
                </div>

                <Button
                  onClick={analyze}
                  disabled={loading || !isValid}
                  loading={loading}
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto"
                >
                  {loading ? 'Analyzing...' : 'Analyze copy'}
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                </Button>

                {error && (
                  <Alert variant="error" className="mt-4">
                    <p className="font-semibold">Analysis failed</p>
                    <p className="mt-1">{error}</p>
                    <button
                      onClick={handleRetry}
                      className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-rose-700 hover:text-rose-800 underline"
                      type="button"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Try again
                    </button>
                  </Alert>
                )}

                <p className="text-center text-[11px] text-ink-500">
                  Powered by AI. Always review before publishing.
                </p>
              </div>

              <div className="space-y-4 sm:space-y-6" role="region" aria-live="polite" aria-label="Analysis results">
                {loading ? (
                  <div className="space-y-4">
                    <CardSkeleton />
                    <CardSkeleton />
                  </div>
                ) : result ? (
                  <>
                    <div className="rounded-2xl border border-white/70 bg-white/80 p-4 sm:p-6 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Score</h3>
                        <button
                          onClick={() => setResult(null)}
                          className="inline-flex items-center gap-1 rounded-full border border-ink-200 px-3 py-1.5 text-xs text-ink-500 hover:text-ink-700 hover:border-ink-300 transition min-h-[36px]"
                          type="button"
                          aria-label="Clear results"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">New analysis</span>
                        </button>
                      </div>
                      <div className="mt-4 flex items-center gap-4">
                        <div
                          className={`rounded-full px-4 py-3 text-2xl font-semibold flex items-center justify-center min-w-[80px] ${getScoreColor(
                            result.score
                          )}`}
                          role="img"
                          aria-label={`Score: ${result.score} out of 100 - ${getScoreLabel(result.score)}`}
                        >
                          {result.score}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-ink-900">{getScoreLabel(result.score)}</p>
                            {result.score >= 80 && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                            )}
                            {result.score < 60 && (
                              <AlertCircle className="h-4 w-4 text-rose-600" aria-hidden="true" />
                            )}
                          </div>
                          <p className="mt-1 text-sm text-ink-600">{getScoreMessage(result.score)}</p>
                        </div>
                      </div>

                      {/* Score bar */}
                      <div className="mt-4 h-2 rounded-full bg-mist-200 overflow-hidden" aria-hidden="true">
                        <div
                          className={`h-full transition-all duration-500 ease-out ${
                            result.score >= 80 ? 'bg-emerald-500' : result.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${result.score}%` }}
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/70 bg-white/80 p-4 sm:p-6 shadow-sm">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                        Suggestions
                      </h3>
                      <ul className="mt-4 space-y-3 text-sm text-ink-600" role="list">
                        {result.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary-600 flex-shrink-0 mt-0.5" aria-hidden="true">
                              •
                            </span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-white/70 bg-white/80 p-4 sm:p-6 shadow-sm">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                        AI variants
                      </h3>
                      <p className="mt-1 text-xs text-ink-500">
                        Click to use a variant (copies to your clipboard)
                      </p>
                      <div className="mt-4 space-y-2">
                        {result.variants.map((variant, index) => (
                          <button
                            key={index}
                            onClick={() => handleVariantClick(variant, index)}
                            className="w-full text-left rounded-xl border border-mist-200 bg-mist-50 px-4 py-3 text-sm text-ink-600 transition hover:border-primary-200 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-300 min-h-[48px] flex items-center gap-3"
                            type="button"
                            aria-label={`Use variant: ${variant}`}
                          >
                            <span className="flex-1">{variant}</span>
                            {copiedVariant === index ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                            ) : (
                              <span className="text-xs text-ink-400 flex-shrink-0">Click to copy</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-primary-200 bg-primary-50 p-4 sm:p-6 text-sm text-primary-900">
                      <h3 className="text-lg font-semibold">Need long-form copy too?</h3>
                      <p className="mt-2 text-primary-800">
                        Jasper helps teams scale ad, email, and landing page copy in minutes.
                      </p>
                      <AffiliateCTA
                        href={AFFILIATE_URLS.jasper}
                        toolSlug="jasper"
                        context="copy-optimizer"
                        className="mt-4 inline-flex items-center rounded-full bg-primary-600 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white min-h-[44px] transition active:scale-95"
                      >
                        Try Jasper
                      </AffiliateCTA>
                    </div>
                  </>
                ) : (
                  <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-mist-200 bg-white/60 p-10 text-center">
                    <div className="space-y-3">
                      <Sparkles className="mx-auto h-10 w-10 text-ink-300" aria-hidden="true" />
                      <p className="text-sm text-ink-500">
                        Enter your copy and click Analyze to see results.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <ExitIntentModal
        title="Go deeper than headlines"
        description="Generate full landing page copy and ads with Jasper in minutes."
        ctaLabel="See Jasper"
        ctaHref={AFFILIATE_URLS.jasper}
        context="copy-optimizer"
      />
    </main>
  )
}
