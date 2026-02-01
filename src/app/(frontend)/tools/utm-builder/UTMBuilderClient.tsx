'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { Check, Copy, Save, Link2, Loader2, History, Star, Trash2, Clock } from 'lucide-react'
import { AffiliateCTA, ExitIntentModal, ToolUsageTracker, FAQSection, ToolGuide, toolGuides } from '@/components'
import { buildUtmUrl, isValidUrl } from '@/lib/utm'
import { InlineError, InlineSuccess, Input } from '@/components/ui'
import { AFFILIATE_URLS, DEFAULT_UTM_PRESETS, UI_CONSTANTS } from '@/lib/constants'
import type { UTMPreset } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useUndoRedo } from '@/lib/hooks/useUndoRedo'
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts'
import { useToolHistoryStore } from '@/lib/stores/toolHistoryStore'
import { toast } from 'sonner'
import { generateQRCode } from '@/lib/utils/export'

const utmFAQItems = [
  {
    question: 'What are UTM parameters and why do I need them?',
    answer: 'UTM parameters are tags added to URLs that help you track where your traffic comes from in Google Analytics. They tell you which campaigns, ads, or links are driving the most conversions. Without UTM tracking, all your traffic appears as "direct" or "referral" in analytics, making it impossible to know which marketing efforts are actually working.',
  },
  {
    question: 'What UTM parameters are required?',
    answer: 'The three required UTM parameters are: utm_source (where traffic comes from, e.g., google, facebook), utm_medium (marketing medium, e.g., cpc, email, social), and utm_campaign (your campaign name, e.g., spring-sale-2025). Optional parameters include utm_term (for paid search keywords) and utm_content (for A/B testing different ad versions).',
  },
  {
    question: 'How should I name my UTM parameters?',
    answer: 'Use lowercase, consistent naming with hyphens instead of spaces. For sources: google, facebook, linkedin, newsletter. For mediums: cpc, email, social, display, organic. For campaigns: use descriptive names like spring-launch-2025 or black-friday-sale. Consistency is crucial—"Google" and "google" will appear as different sources in analytics.',
  },
  {
    question: 'Can I save my UTM presets?',
    answer: 'Yes! Our UTM Builder lets you save custom presets for channels you use frequently. Create a preset once with your common source and medium combinations, then apply it with one click for future campaigns. Your presets are saved in your browser\'s local storage.',
  },
  {
    question: 'Where do I see UTM data in Google Analytics?',
    answer: 'In Google Analytics 4, go to Reports > Acquisition > Traffic Acquisition to see sessions by source/medium. For campaign data, check Reports > Engagement > Events and look for session_campaign or use the Campaigns report in the Advertising section. You can also create custom explorations to analyze UTM data alongside conversion metrics.',
  },
]

interface FormErrors {
  url?: string
  source?: string
  medium?: string
  campaign?: string
  presetName?: string
}

interface UTMHistoryItem {
  id: string
  url: string
  source: string
  medium: string
  campaign: string
  term: string
  content: string
  createdAt: number
  isFavorite: boolean
}

const MAX_HISTORY_ITEMS = 10

export default function UTMBuilderClient() {
  const addToHistory = useToolHistoryStore((state) => state.addToHistory)

  const {
    state: params,
    set: setParams,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo({
    url: '',
    source: '',
    medium: '',
    campaign: '',
    term: '',
    content: '',
  })

  const [presets, setPresets] = useState<UTMPreset[]>([...DEFAULT_UTM_PRESETS])
  const [copied, setCopied] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isValidating, setIsValidating] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [history, setHistory] = useState<UTMHistoryItem[]>([])
  const [activeTab, setActiveTab] = useState<'presets' | 'history'>('presets')
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('utm-history')
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory))
      }
    } catch {
      // Ignore storage errors
    }
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
      localStorage.setItem('utm-history', JSON.stringify(updated))
      return updated
    })
  }, [])

  const deleteHistoryItem = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id)
      localStorage.setItem('utm-history', JSON.stringify(updated))
      return updated
    })
  }, [])

  const loadFromHistory = useCallback((item: UTMHistoryItem) => {
    setParams({
      url: item.url,
      source: item.source,
      medium: item.medium,
      campaign: item.campaign,
      term: item.term,
      content: item.content,
    })
    setErrors({})
    setTouched({})
  }, [setParams])

  const clearHistory = useCallback(() => {
    setHistory([])
    localStorage.removeItem('utm-history')
  }, [])

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem('utm-presets')
      if (saved) {
        setPresets([...DEFAULT_UTM_PRESETS, ...JSON.parse(saved)])
      }
    } catch {
      // Ignore storage errors
    }
  }, [])

  const validateField = useCallback((name: string, value: string) => {
    switch (name) {
      case 'url':
        if (!value) return 'URL is required'
        if (!isValidUrl(value)) return 'Enter a valid URL (e.g., https://example.com)'
        return undefined
      case 'source':
        if (!value.trim()) return 'Source is required'
        return undefined
      case 'medium':
        if (!value.trim()) return 'Medium is required'
        return undefined
      case 'campaign':
        if (!value.trim()) return 'Campaign name is required'
        return undefined
      default:
        return undefined
    }
  }, [])

  const handleFieldChange = useCallback((name: string, value: string) => {
    setParams({ ...params, [name]: value })
    setTouched((prev) => ({ ...prev, [name]: true }))

    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))
  }, [validateField, params, setParams])

  const handleBlur = useCallback((name: string, value: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }))
    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))
  }, [validateField])

  const requiredComplete = Boolean(params.source && params.medium && params.campaign)
  const hasErrors = Object.values(errors).some((e) => e)

  const finalUrl = useMemo(
    () => {
      if (hasErrors || !requiredComplete) return ''
      try {
        return buildUtmUrl({
          url: params.url,
          source: params.source,
          medium: params.medium,
          campaign: params.campaign,
          term: params.term,
          content: params.content,
        })
      } catch {
        return ''
      }
    },
    [params, requiredComplete, hasErrors]
  )

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const copyToClipboard = async () => {
    if (!finalUrl) return

    setIsValidating(true)
    try {
      await navigator.clipboard.writeText(finalUrl)
      setCopied(true)
      toast.success('Copied to clipboard')
      saveToHistory()
      setTimeout(() => setCopied(false), UI_CONSTANTS.COPY_FEEDBACK_DURATION)
    } catch {
      setCopied(false)
      toast.error('Failed to copy to clipboard')
    } finally {
      setIsValidating(false)
    }
  }

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'z',
      ctrl: true,
      callback: () => {
        if (canUndo) {
          undo()
          toast.success('Undo')
        }
      },
      description: 'Undo',
    },
    {
      key: 'y',
      ctrl: true,
      callback: () => {
        if (canRedo) {
          redo()
          toast.success('Redo')
        }
      },
      description: 'Redo',
    },
  ])

  // Generate QR code when URL changes
  useEffect(() => {
    if (finalUrl) {
      generateQRCode(finalUrl, 256)
        .then(setQrCodeUrl)
        .catch(() => setQrCodeUrl(null))
    } else {
      setQrCodeUrl(null)
    }
  }, [finalUrl])

  const saveToHistory = useCallback(() => {
    if (!finalUrl) return

    const newItem: UTMHistoryItem = {
      id: Date.now().toString(),
      url: params.url,
      source: params.source,
      medium: params.medium,
      campaign: params.campaign,
      term: params.term,
      content: params.content,
      createdAt: Date.now(),
      isFavorite: false,
    }

    setHistory((prev) => {
      const filtered = prev.filter(
        (item) =>
          !(
            item.url === newItem.url &&
            item.source === newItem.source &&
            item.medium === newItem.medium &&
            item.campaign === newItem.campaign
          )
      )
      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS)
      localStorage.setItem('utm-history', JSON.stringify(updated))
      return updated
    })
  }, [finalUrl, params])

  const applyPreset = useCallback((preset: UTMPreset) => {
    setParams((prev) => ({ ...prev, ...preset.params }))
    setErrors({})
    setTouched({})
  }, [])

  const savePreset = useCallback(() => {
    if (!presetName.trim()) {
      setErrors((prev) => ({ ...prev, presetName: 'Preset name is required' }))
      return
    }

    try {
      const customPresets = presets.filter((p) => !DEFAULT_UTM_PRESETS.some((d) => d.name === p.name))
      const newPreset: UTMPreset = {
        name: presetName.trim(),
        params: {
          source: params.source,
          medium: params.medium,
          campaign: params.campaign,
          term: params.term,
          content: params.content,
        },
      }
      const updated = [...customPresets, newPreset]
      localStorage.setItem('utm-presets', JSON.stringify(updated))
      setPresets([...DEFAULT_UTM_PRESETS, ...updated])
      setPresetName('')
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      setErrors((prev) => ({ ...prev, presetName: 'Failed to save preset' }))
    }
  }, [presetName, params, presets])

  return (
    <main className="min-h-screen">
      <ToolUsageTracker tool="utm-builder" />

      <section className="py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="glass-panel p-6 sm:p-8 md:p-10">
            <p className="section-kicker">Tracking tool</p>
            <h1 className="mt-3 text-2xl sm:text-3xl font-semibold text-ink-900">UTM Campaign Builder</h1>
            <p className="mt-3 text-sm text-ink-600">
              Build clean tracking URLs, apply channel presets, and keep your analytics consistent.
            </p>

            <div className="mt-8 grid gap-6 lg:gap-8 lg:grid-cols-2">
              <div className="space-y-4 rounded-2xl border border-white/70 bg-white/80 p-4 sm:p-6 shadow-sm">
                <Input
                  label="Website URL"
                  type="url"
                  value={params.url}
                  onChange={(e) => handleFieldChange('url', e.target.value)}
                  onBlur={(e) => handleBlur('url', e.target.value)}
                  error={touched.url ? errors.url : undefined}
                  placeholder="https://example.com/landing"
                  required
                  autoComplete="url"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Source"
                    type="text"
                    value={params.source}
                    onChange={(e) => handleFieldChange('source', e.target.value)}
                    onBlur={(e) => handleBlur('source', e.target.value)}
                    error={touched.source ? errors.source : undefined}
                    placeholder="google, facebook"
                    required
                    autoComplete="off"
                  />
                  <Input
                    label="Medium"
                    type="text"
                    value={params.medium}
                    onChange={(e) => handleFieldChange('medium', e.target.value)}
                    onBlur={(e) => handleBlur('medium', e.target.value)}
                    error={touched.medium ? errors.medium : undefined}
                    placeholder="cpc, email, social"
                    required
                    autoComplete="off"
                  />
                </div>

                <Input
                  label="Campaign name"
                  type="text"
                  value={params.campaign}
                  onChange={(e) => handleFieldChange('campaign', e.target.value)}
                  onBlur={(e) => handleBlur('campaign', e.target.value)}
                  error={touched.campaign ? errors.campaign : undefined}
                  placeholder="spring-launch-2025"
                  required
                  autoComplete="off"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Term (optional)"
                    type="text"
                    value={params.term}
                    onChange={(e) => handleFieldChange('term', e.target.value)}
                    placeholder="keyword"
                    autoComplete="off"
                  />
                  <Input
                    label="Content (optional)"
                    type="text"
                    value={params.content}
                    onChange={(e) => handleFieldChange('content', e.target.value)}
                    placeholder="banner-a"
                    autoComplete="off"
                  />
                </div>

                {touched.url && errors.url && (
                  <InlineError>{errors.url}</InlineError>
                )}
                {(touched.source && errors.source) && (
                  <InlineError>{errors.source}</InlineError>
                )}
                {(touched.medium && errors.medium) && (
                  <InlineError>{errors.medium}</InlineError>
                )}
                {(touched.campaign && errors.campaign) && (
                  <InlineError>{errors.campaign}</InlineError>
                )}

                <ToolGuide {...toolGuides['utm-builder']} />
              </div>

              <div className="space-y-4 sm:space-y-6">
                {/* Tabs */}
                <div className="rounded-2xl border border-white/70 bg-white/80 p-4 sm:p-6 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-ink-100 mb-4">
                    <button
                      onClick={() => setActiveTab('presets')}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 text-sm font-medium transition border-b-2 -mb-px min-h-[44px]',
                        activeTab === 'presets'
                          ? 'border-primary-600 text-primary-600'
                          : 'border-transparent text-ink-500 hover:text-ink-700'
                      )}
                      type="button"
                    >
                      <Save className="h-4 w-4" />
                      Presets
                    </button>
                    <button
                      onClick={() => setActiveTab('history')}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 text-sm font-medium transition border-b-2 -mb-px min-h-[44px]',
                        activeTab === 'history'
                          ? 'border-primary-600 text-primary-600'
                          : 'border-transparent text-ink-500 hover:text-ink-700'
                      )}
                      type="button"
                    >
                      <History className="h-4 w-4" />
                      History
                      {history.length > 0 && (
                        <span className="ml-1 rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-700">
                          {history.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {activeTab === 'presets' ? (
                    <>
                      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Quick presets</h3>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {presets.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => applyPreset(preset)}
                            className="min-h-[44px] rounded-full border border-ink-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-600 transition hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-300 active:scale-95"
                            type="button"
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                      <div className="mt-4 flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={presetName}
                          onChange={(e) => {
                            setPresetName(e.target.value)
                            setErrors((prev) => ({ ...prev, presetName: undefined }))
                          }}
                          className="flex-1 rounded-xl border border-mist-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 min-h-[44px]"
                          placeholder="New preset name"
                          aria-label="New preset name"
                          autoComplete="off"
                        />
                        <button
                          onClick={savePreset}
                          disabled={!presetName.trim()}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-ink-900 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white disabled:opacity-50 min-h-[44px] transition active:scale-95"
                          type="button"
                        >
                          <Save className="h-4 w-4" aria-hidden="true" /> Save
                        </button>
                      </div>
                      {saveSuccess && (
                        <InlineSuccess className="mt-2">Preset saved successfully!</InlineSuccess>
                      )}
                      {errors.presetName && (
                        <InlineError>{errors.presetName}</InlineError>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                          Recent Links
                        </h3>
                        {history.length > 0 && (
                          <button
                            onClick={clearHistory}
                            className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1"
                            type="button"
                          >
                            <Trash2 className="h-3 w-3" /> Clear all
                          </button>
                        )}
                      </div>

                      {history.length === 0 ? (
                        <div className="mt-4 text-center py-8 text-ink-400">
                          <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p className="text-sm">No history yet</p>
                          <p className="text-xs mt-1">Generated links will appear here</p>
                        </div>
                      ) : (
                        <ul className="mt-4 space-y-2 max-h-[300px] overflow-y-auto">
                          {history.map((item) => (
                            <li
                              key={item.id}
                              className="flex items-center gap-2 p-3 rounded-xl bg-ink-50 hover:bg-ink-100 transition group"
                            >
                              <button
                                onClick={() => toggleFavorite(item.id)}
                                className={cn(
                                  'shrink-0 transition',
                                  item.isFavorite ? 'text-amber-400' : 'text-ink-300 hover:text-amber-400'
                                )}
                                type="button"
                                aria-label={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                              >
                                <Star className="h-4 w-4" fill={item.isFavorite ? 'currentColor' : 'none'} />
                              </button>

                              <button
                                onClick={() => loadFromHistory(item)}
                                className="flex-1 min-w-0 text-left"
                                type="button"
                              >
                                <div className="text-sm font-medium text-ink-900 truncate">
                                  {item.campaign}
                                </div>
                                <div className="text-xs text-ink-500 truncate">
                                  {item.source} / {item.medium}
                                </div>
                              </button>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs text-ink-400 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(item.createdAt)}
                                </span>
                                <button
                                  onClick={() => deleteHistoryItem(item.id)}
                                  className="p-1 text-ink-400 hover:text-rose-500 transition opacity-0 group-hover:opacity-100"
                                  type="button"
                                  aria-label="Delete from history"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>

                <div className="rounded-2xl border border-white/70 bg-white/80 p-4 sm:p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Generated URL</h3>
                    <button
                      onClick={copyToClipboard}
                      disabled={!finalUrl || isValidating}
                      className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white disabled:opacity-50 min-h-[40px] transition active:scale-95"
                      type="button"
                      aria-label={copied ? 'URL copied to clipboard' : 'Copy URL to clipboard'}
                    >
                      {isValidating ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : copied ? (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Copy className="h-4 w-4" aria-hidden="true" />
                      )}
                      {isValidating ? 'Copying...' : copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div
                    className="mt-4 rounded-xl bg-mist-100 p-4 text-sm text-ink-600 break-all min-h-[60px] flex items-center"
                    role="region"
                    aria-live="polite"
                  >
                    {finalUrl || 'Fill in URL, source, medium, and campaign to generate...'}
                  </div>
                  {!requiredComplete && params.url && (
                    <InlineError className="mt-2">
                      Source, medium, and campaign are required for a valid UTM link.
                    </InlineError>
                  )}
                </div>

                <div className="rounded-2xl border border-primary-200 bg-primary-50 p-4 sm:p-6 text-sm text-primary-900">
                  <div className="flex items-center gap-2 text-primary-700">
                    <Link2 className="h-5 w-5" aria-hidden="true" />
                    <span className="text-xs font-semibold uppercase tracking-[0.2em]">Affiliate pick</span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">Need branded short links?</h3>
                  <p className="mt-2 text-primary-800">
                    Bitly makes it easy to shorten and track every UTM link you create.
                  </p>
                  <AffiliateCTA
                    href={AFFILIATE_URLS.bitly}
                    toolSlug="bitly"
                    context="utm-builder"
                    className="mt-4 inline-flex items-center rounded-full bg-primary-600 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white min-h-[44px] transition active:scale-95"
                  >
                    Try Bitly
                  </AffiliateCTA>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FAQSection
        title="UTM Tracking FAQ"
        description="Common questions about UTM parameters and campaign tracking."
        items={utmFAQItems}
        pageUrl="https://campaignsites.net/tools/utm-builder"
      />

      <ExitIntentModal
        title="Keep every UTM tidy"
        description="Standardize your tracking links with Bitly's branded short links and analytics."
        ctaLabel="See Bitly"
        ctaHref={AFFILIATE_URLS.bitly}
        context="utm-builder"
      />
    </main>
  )
}
