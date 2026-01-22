'use client'

import { memo, useState, useCallback, useEffect } from 'react'
import { RefreshCw, Copy, CheckCircle, Wand2, Search, FlaskConical } from 'lucide-react'
import {
  analyzeLandingPageStructure,
  generateAbTestIdeas,
  generateCampaignNames,
  type StructureAnalysisResult,
} from '@/app/actions/ai-lab'
import { Button, Alert, InlineError, ResultSkeleton } from '@/components/ui'

interface PanelProps {
  onError?: (error: string) => void
}

// Campaign Name Generator Panel
const CampaignNamePanel = memo(function CampaignNamePanel({ onError }: PanelProps) {
  const [input, setInput] = useState({ offer: '', audience: '', tone: '' })
  const [names, setNames] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const validateInput = useCallback(() => {
    if (!input.offer.trim()) return 'Please describe your offer'
    if (input.offer.length < 3) return 'Offer description is too short'
    return null
  }, [input.offer])

  const submit = useCallback(async () => {
    const validationError = validateInput()
    if (validationError) {
      setError(validationError)
      onError?.(validationError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await generateCampaignNames(input)
      setNames(result.names)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate campaign names'
      setError(errorMsg)
      onError?.(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [input, validateInput, onError])

  const copyName = useCallback((name: string, index: number) => {
    navigator.clipboard.writeText(name).catch(() => {})
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }, [])

  const isValid = input.offer.trim().length >= 3

  return (
    <section className="grid gap-4 sm:gap-6 rounded-2xl border border-white/70 bg-white/80 p-4 sm:p-6 shadow-sm" aria-labelledby="campaign-name-title">
      <header>
        <div className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-primary-600" aria-hidden="true" />
          <p id="campaign-name-title" className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
            Campaign name generator
          </p>
        </div>
        <h2 className="mt-2 text-xl sm:text-2xl font-semibold text-ink-900">Name your next launch</h2>
      </header>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label htmlFor="offer-input" className="text-xs text-ink-500 font-medium">
            Offer <span className="text-rose-500">*</span>
          </label>
          <input
            id="offer-input"
            value={input.offer}
            onChange={(e) => {
              setInput({ ...input, offer: e.target.value })
              setError(null)
            }}
            className="w-full rounded-xl border border-mist-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 min-h-[44px]"
            placeholder="e.g., Webinar Series"
            aria-required="true"
            aria-invalid={!!error}
            aria-describedby={error ? 'offer-error' : undefined}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="audience-input" className="text-xs text-ink-500 font-medium">Audience</label>
          <input
            id="audience-input"
            value={input.audience}
            onChange={(e) => setInput({ ...input, audience: e.target.value })}
            className="w-full rounded-xl border border-mist-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 min-h-[44px]"
            placeholder="e.g., Growth teams"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="tone-input" className="text-xs text-ink-500 font-medium">Tone</label>
          <input
            id="tone-input"
            value={input.tone}
            onChange={(e) => setInput({ ...input, tone: e.target.value })}
            className="w-full rounded-xl border border-mist-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 min-h-[44px]"
            placeholder="e.g., Bold, playful"
          />
        </div>
      </div>

      {error && <InlineError id="offer-error">{error}</InlineError>}

      <Button
        onClick={submit}
        disabled={loading || !isValid}
        loading={loading}
        variant="primary"
        size="md"
        className="sm:w-auto"
      >
        {loading ? 'Generating names...' : 'Generate names'}
      </Button>

      {loading && <ResultSkeleton count={4} />}

      {!loading && names.length > 0 && (
        <div role="region" aria-live="polite" aria-label="Generated campaign names">
          <ul className="grid gap-2 text-sm text-ink-600 sm:grid-cols-2">
            {names.map((name, index) => (
              <li
                key={index}
                className="rounded-xl border border-mist-200 bg-mist-50 px-4 py-3 flex items-center justify-between gap-2 group hover:border-primary-200 transition-colors"
              >
                <span className="flex-1">{name}</span>
                <button
                  onClick={() => copyName(name, index)}
                  className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white transition-colors"
                  type="button"
                  aria-label={`Copy "${name}" to clipboard`}
                >
                  {copiedIndex === index ? (
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-ink-400 group-hover:text-ink-600" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
})

// Landing Page Analyzer Panel
const StructureAnalyzerPanel = memo(function StructureAnalyzerPanel({ onError }: PanelProps) {
  const [input, setInput] = useState({ goal: '', audience: '', structure: '' })
  const [result, setResult] = useState<StructureAnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateInput = useCallback(() => {
    if (!input.goal.trim()) return 'Please specify your goal'
    if (!input.structure.trim()) return 'Please describe your landing page structure'
    if (input.structure.length < 20) return 'Structure description is too brief'
    return null
  }, [input.goal, input.structure])

  const submit = useCallback(async () => {
    const validationError = validateInput()
    if (validationError) {
      setError(validationError)
      onError?.(validationError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await analyzeLandingPageStructure(input)
      setResult(data)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to analyze structure'
      setError(errorMsg)
      onError?.(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [input, validateInput, onError])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  const getScoreVariant = (score: number) => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    return 'error'
  }

  const isValid = input.goal.trim() && input.structure.trim().length >= 20

  return (
    <section className="grid gap-4 sm:gap-6 rounded-2xl border border-white/70 bg-white/80 p-4 sm:p-6 shadow-sm" aria-labelledby="structure-analyzer-title">
      <header>
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary-600" aria-hidden="true" />
          <p id="structure-analyzer-title" className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
            Landing page analyzer
          </p>
        </div>
        <h2 className="mt-2 text-xl sm:text-2xl font-semibold text-ink-900">Audit your landing page structure</h2>
      </header>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="goal-input" className="text-xs text-ink-500 font-medium">
            Goal <span className="text-rose-500">*</span>
          </label>
          <input
            id="goal-input"
            value={input.goal}
            onChange={(e) => {
              setInput({ ...input, goal: e.target.value })
              setError(null)
            }}
            className="w-full rounded-xl border border-mist-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 min-h-[44px]"
            placeholder="e.g., Demo requests"
            aria-required="true"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="audience-input-2" className="text-xs text-ink-500 font-medium">Audience</label>
          <input
            id="audience-input-2"
            value={input.audience}
            onChange={(e) => setInput({ ...input, audience: e.target.value })}
            className="w-full rounded-xl border border-mist-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 min-h-[44px]"
            placeholder="e.g., SaaS founders"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="structure-input" className="text-xs text-ink-500 font-medium">
          Page structure <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="structure-input"
          value={input.structure}
          onChange={(e) => {
            setInput({ ...input, structure: e.target.value })
            setError(null)
          }}
          className="w-full h-28 rounded-xl border border-mist-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
          placeholder="List your landing page sections: hero, benefits, social proof, pricing, FAQ..."
          aria-required="true"
        />
        <p className="text-xs text-ink-400">{input.structure.length}/500 characters</p>
      </div>

      {error && <InlineError>{error}</InlineError>}

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={submit}
          disabled={loading || !isValid}
          loading={loading}
          variant="primary"
          size="md"
        >
          {loading ? 'Analyzing...' : 'Analyze structure'}
        </Button>
        {result && !loading && (
          <Button
            onClick={reset}
            variant="outline"
            size="md"
          >
            <RefreshCw className="h-4 w-4" />
            Start over
          </Button>
        )}
      </div>

      {loading && <CardSkeleton />}

      {!loading && result && (
        <div role="region" aria-live="polite" aria-label="Analysis results">
          <Alert variant={getScoreVariant(result.score) as 'error' | 'success' | 'warning'} className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Conversion Score: {result.score}/100</p>
                <p className="text-sm mt-1">
                  {result.score >= 80 && 'Strong foundation for conversions'}
                  {result.score >= 60 && result.score < 80 && 'Good, with room for improvement'}
                  {result.score < 60 && 'Needs optimization for better results'}
                </p>
              </div>
              <div className={`rounded-full px-4 py-2 text-lg font-semibold ${
                result.score >= 80 ? 'bg-emerald-100 text-emerald-700' :
                result.score >= 60 ? 'bg-amber-100 text-amber-700' :
                'bg-rose-100 text-rose-700'
              }`}>
                {result.score}
              </div>
            </div>
          </Alert>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <h3 className="font-semibold text-emerald-800 text-sm">Strengths</h3>
              <ul className="mt-2 text-sm text-emerald-700 space-y-1">
                {result.strengths.map((item: string) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-semibold text-amber-800 text-sm">Gaps</h3>
              <ul className="mt-2 text-sm text-amber-700 space-y-1">
                {result.gaps.map((item: string) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 sm:col-span-1">
              <h3 className="font-semibold text-sky-800 text-sm">Recommendations</h3>
              <ul className="mt-2 text-sm text-sky-700 space-y-1">
                {result.recommendations.map((item: string) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  )
})

// A/B Test Ideas Panel
const AbTestIdeasPanel = memo(function AbTestIdeasPanel({ onError }: PanelProps) {
  const [input, setInput] = useState({ offer: '', audience: '', goal: '' })
  const [ideas, setIdeas] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const validateInput = useCallback(() => {
    if (!input.offer.trim()) return 'Please describe your offer'
    if (!input.goal.trim()) return 'Please specify your goal'
    return null
  }, [input.offer, input.goal])

  const submit = useCallback(async () => {
    const validationError = validateInput()
    if (validationError) {
      setError(validationError)
      onError?.(validationError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await generateAbTestIdeas(input)
      setIdeas(data.ideas)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate test ideas'
      setError(errorMsg)
      onError?.(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [input, validateInput, onError])

  const copyIdea = useCallback((idea: string, index: number) => {
    navigator.clipboard.writeText(idea).catch(() => {})
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }, [])

  const reset = useCallback(() => {
    setIdeas([])
    setError(null)
  }, [])

  const isValid = input.offer.trim() && input.goal.trim()

  return (
    <section className="grid gap-4 sm:gap-6 rounded-2xl border border-white/70 bg-white/80 p-4 sm:p-6 shadow-sm" aria-labelledby="ab-test-title">
      <header>
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-primary-600" aria-hidden="true" />
          <p id="ab-test-title" className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
            A/B test generator
          </p>
        </div>
        <h2 className="mt-2 text-xl sm:text-2xl font-semibold text-ink-900">Generate high-impact test ideas</h2>
      </header>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label htmlFor="offer-input-2" className="text-xs text-ink-500 font-medium">
            Offer <span className="text-rose-500">*</span>
          </label>
          <input
            id="offer-input-2"
            value={input.offer}
            onChange={(e) => {
              setInput({ ...input, offer: e.target.value })
              setError(null)
            }}
            className="w-full rounded-xl border border-mist-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 min-h-[44px]"
            placeholder="e.g., Free trial signup"
            aria-required="true"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="audience-input-3" className="text-xs text-ink-500 font-medium">Audience</label>
          <input
            id="audience-input-3"
            value={input.audience}
            onChange={(e) => setInput({ ...input, audience: e.target.value })}
            className="w-full rounded-xl border border-mist-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 min-h-[44px]"
            placeholder="e.g., Marketing teams"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="goal-input-2" className="text-xs text-ink-500 font-medium">
            Goal <span className="text-rose-500">*</span>
          </label>
          <input
            id="goal-input-2"
            value={input.goal}
            onChange={(e) => {
              setInput({ ...input, goal: e.target.value })
              setError(null)
            }}
            className="w-full rounded-xl border border-mist-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 min-h-[44px]"
            placeholder="e.g., Increase conversions"
            aria-required="true"
          />
        </div>
      </div>

      {error && <InlineError>{error}</InlineError>}

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={submit}
          disabled={loading || !isValid}
          loading={loading}
          variant="primary"
          size="md"
        >
          {loading ? 'Generating ideas...' : 'Generate A/B ideas'}
        </Button>
        {ideas.length > 0 && !loading && (
          <Button
            onClick={reset}
            variant="outline"
            size="md"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
        )}
      </div>

      {loading && <ResultSkeleton count={5} />}

      {!loading && ideas.length > 0 && (
        <div role="region" aria-live="polite" aria-label="Generated A/B test ideas">
          <ul className="grid gap-2 text-sm text-ink-600 sm:grid-cols-2">
            {ideas.map((idea, index) => (
              <li
                key={index}
                className="rounded-xl border border-mist-200 bg-mist-50 px-4 py-3 flex items-start gap-2 group hover:border-primary-200 transition-colors"
              >
                <span className="flex-1">{idea}</span>
                <button
                  onClick={() => copyIdea(idea, index)}
                  className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white transition-colors mt-0.5"
                  type="button"
                  aria-label={`Copy test idea to clipboard`}
                >
                  {copiedIndex === index ? (
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-ink-400 group-hover:text-ink-600" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
})

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-mist-200 bg-mist-50 p-6 animate-pulse">
      <div className="h-4 bg-mist-200 rounded w-1/3 mb-4" />
      <div className="space-y-2">
        <div className="h-3 bg-mist-200 rounded" />
        <div className="h-3 bg-mist-200 rounded w-5/6" />
      </div>
    </div>
  )
}

// Main AI Lab Client with Error Boundary integration
export const AiLabClient = memo(function AiLabClient() {
  const [globalError, setGlobalError] = useState<string | null>(null)

  // Clear errors after 5 seconds
  useEffect(() => {
    if (globalError) {
      const timer = setTimeout(() => setGlobalError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [globalError])

  return (
    <div className="grid gap-6 sm:gap-8">
      {globalError && (
        <Alert variant="error" dismissible onDismiss={() => setGlobalError(null)}>
          <p className="font-semibold">Something went wrong</p>
          <p className="mt-1">{globalError}</p>
          <p className="mt-2 text-sm">Please try again or contact support if the issue persists.</p>
        </Alert>
      )}
      <CampaignNamePanel onError={setGlobalError} />
      <StructureAnalyzerPanel onError={setGlobalError} />
      <AbTestIdeasPanel onError={setGlobalError} />
    </div>
  )
})
