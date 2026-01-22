'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { Check, Copy, Save, Link2, Loader2 } from 'lucide-react'
import { AffiliateCTA, ExitIntentModal, ToolUsageTracker } from '@/components'
import { buildUtmUrl, isValidUrl } from '@/lib/utm'
import { InlineError, InlineSuccess, Input } from '@/components/ui'
import { AFFILIATE_URLS, DEFAULT_UTM_PRESETS, UI_CONSTANTS } from '@/lib/constants'
import type { UTMPreset } from '@/lib/types'

interface FormErrors {
  url?: string
  source?: string
  medium?: string
  campaign?: string
  presetName?: string
}

export default function UTMBuilderClient() {
  const [params, setParams] = useState({
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
    setParams((prev) => ({ ...prev, [name]: value }))
    setTouched((prev) => ({ ...prev, [name]: true }))

    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))
  }, [validateField])

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

  const copyToClipboard = async () => {
    if (!finalUrl) return

    setIsValidating(true)
    try {
      await navigator.clipboard.writeText(finalUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), UI_CONSTANTS.COPY_FEEDBACK_DURATION)
    } catch {
      setCopied(false)
    } finally {
      setIsValidating(false)
    }
  }

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
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="rounded-2xl border border-white/70 bg-white/80 p-4 sm:p-6 shadow-sm">
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
