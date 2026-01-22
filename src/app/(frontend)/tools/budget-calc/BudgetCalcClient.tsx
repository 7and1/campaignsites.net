'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import { Calculator, DollarSign, TrendingUp, Users, Loader2 } from 'lucide-react'
import { AffiliateCTA, ExitIntentModal, ToolUsageTracker } from '@/components'
import { calculateBudgetMetrics } from '@/lib/budget'
import { Input, Select, InlineError, Alert } from '@/components/ui'
import { AFFILIATE_URLS, INDUSTRY_BENCHMARKS, UI_CONSTANTS } from '@/lib/constants'
import type { Benchmark } from '@/lib/types'

const industryOptions = Object.keys(INDUSTRY_BENCHMARKS).map((ind) => ({ value: ind, label: ind }))

interface FormErrors {
  budget?: string
  customCPC?: string
  customConvRate?: string
}

export default function BudgetCalcClient() {
  const [industry, setIndustry] = useState('E-commerce')
  const [budget, setBudget] = useState(1000)
  const [customCPC, setCustomCPC] = useState<number | null>(null)
  const [customConvRate, setCustomConvRate] = useState<number | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isCalculating, setIsCalculating] = useState(false)

  const benchmark: Benchmark = INDUSTRY_BENCHMARKS[industry]

  const effectiveBenchmark = useMemo(
    () => ({
      ...benchmark,
      cpc: customCPC ?? benchmark.cpc,
      convRate: customConvRate ?? benchmark.convRate,
    }),
    [benchmark, customCPC, customConvRate]
  )

  const metrics = calculateBudgetMetrics(budget, effectiveBenchmark)

  // Debounced calculation indicator
  useEffect(() => {
    setIsCalculating(true)
    const timer = setTimeout(() => setIsCalculating(false), 300)
    return () => clearTimeout(timer)
  }, [budget, industry, customCPC, customConvRate])

  const validateBudget = useCallback((value: number) => {
    if (isNaN(value)) return 'Enter a valid number'
    if (value < 0) return 'Budget cannot be negative'
    if (value < 100) return 'Minimum budget is $100'
    if (value > 10000000) return 'Budget exceeds maximum allowed'
    return undefined
  }, [])

  const validateCustomCPC = useCallback((value: number | null) => {
    if (value === null) return undefined
    if (isNaN(value)) return 'Enter a valid number'
    if (value < 0.01) return 'CPC must be at least $0.01'
    if (value > 100) return 'CPC seems unusually high'
    return undefined
  }, [])

  const validateCustomConvRate = useCallback((value: number | null) => {
    if (value === null) return undefined
    if (isNaN(value)) return 'Enter a valid number'
    if (value < 0) return 'Conversion rate cannot be negative'
    if (value > 100) return 'Conversion rate cannot exceed 100%'
    return undefined
  }, [])

  const handleBudgetChange = useCallback((value: string) => {
    const numValue = Number(value)
    setBudget(numValue)
    setTouched((prev) => ({ ...prev, budget: true }))
    setErrors((prev) => ({ ...prev, budget: validateBudget(numValue) }))
  }, [validateBudget])

  const handleCustomCPCChange = useCallback((value: string) => {
    const numValue = value ? Number(value) : null
    setCustomCPC(numValue)
    setTouched((prev) => ({ ...prev, customCPC: true }))
    setErrors((prev) => ({ ...prev, customCPC: validateCustomCPC(numValue) }))
  }, [validateCustomCPC])

  const handleCustomConvRateChange = useCallback((value: string) => {
    const numValue = value ? Number(value) : null
    setCustomConvRate(numValue)
    setTouched((prev) => ({ ...prev, customConvRate: true }))
    setErrors((prev) => ({ ...prev, customConvRate: validateCustomConvRate(numValue) }))
  }, [validateCustomConvRate])

  const handleIndustryChange = useCallback((value: string) => {
    setIndustry(value)
    setCustomCPC(null)
    setCustomConvRate(null)
    setTouched((prev) => ({ ...prev, customCPC: false, customConvRate: false }))
    setErrors((prev) => ({ ...prev, customCPC: undefined, customConvRate: undefined }))
  }, [])

  const resetOverrides = useCallback(() => {
    setCustomCPC(null)
    setCustomConvRate(null)
    setErrors((prev) => ({ ...prev, customCPC: undefined, customConvRate: undefined }))
  }, [])

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  return (
    <main className="min-h-screen">
      <ToolUsageTracker tool="budget-calc" />

      <section className="py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="glass-panel p-6 sm:p-8 md:p-10">
            <p className="section-kicker">Planning tool</p>
            <h1 className="mt-3 text-2xl sm:text-3xl font-semibold text-ink-900">Campaign Budget Calculator</h1>
            <p className="mt-3 text-sm text-ink-600">
              Estimate clicks, conversions, and CPA using live industry benchmarks. Customize CPC and
              conversion rates as needed.
            </p>

            <div className="mt-8 grid gap-6 lg:gap-8 lg:grid-cols-2">
              <div className="space-y-4 sm:space-y-6 rounded-2xl border border-white/70 bg-white/80 p-4 sm:p-6 shadow-sm">
                <Select
                  label="Industry"
                  value={industry}
                  onChange={(e) => handleIndustryChange(e.target.value)}
                  options={industryOptions}
                  required
                />

                <div>
                  <Input
                    label="Monthly budget ($)"
                    type="number"
                    value={budget}
                    onChange={(e) => handleBudgetChange(e.target.value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, budget: true }))}
                    error={touched.budget ? errors.budget : undefined}
                    min={100}
                    max={10000000}
                    step="100"
                    required
                  />
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      type="range"
                      value={budget}
                      onChange={(e) => handleBudgetChange(e.target.value)}
                      className="flex-1 h-2 accent-primary-600"
                      min={UI_CONSTANTS.BUDGET_MIN}
                      max={UI_CONSTANTS.BUDGET_MAX}
                      step={UI_CONSTANTS.BUDGET_STEP}
                      aria-label="Adjust budget with slider"
                    />
                    <span className="text-sm text-ink-600 min-w-[60px] text-right">
                      ${formatNumber(budget)}
                    </span>
                  </div>
                  {touched.budget && errors.budget && (
                    <InlineError className="mt-1">{errors.budget}</InlineError>
                  )}
                </div>

                <div className="border-t border-mist-200 pt-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Custom overrides</h4>
                    {(customCPC !== null || customConvRate !== null) && (
                      <button
                        onClick={resetOverrides}
                        className="text-xs text-primary-600 hover:text-primary-700 underline"
                        type="button"
                      >
                        Reset to benchmark
                      </button>
                    )}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-ink-500 mb-1.5">CPC ($)</label>
                      <input
                        type="number"
                        value={customCPC ?? ''}
                        onChange={(e) => handleCustomCPCChange(e.target.value)}
                        className="w-full rounded-xl border border-mist-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                        placeholder={benchmark.cpc.toFixed(2)}
                        step="0.01"
                        min="0.01"
                        aria-invalid={!!touched.customCPC && !!errors.customCPC}
                        aria-describedby={touched.customCPC && errors.customCPC ? 'cpc-error' : undefined}
                      />
                      {touched.customCPC && errors.customCPC && (
                        <p id="cpc-error" className="mt-1 text-xs text-rose-600">{errors.customCPC}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-ink-500 mb-1.5">Conv. rate (%)</label>
                      <input
                        type="number"
                        value={customConvRate ?? ''}
                        onChange={(e) => handleCustomConvRateChange(e.target.value)}
                        className="w-full rounded-xl border border-mist-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                        placeholder={benchmark.convRate.toFixed(2)}
                        step="0.1"
                        min="0"
                        max="100"
                        aria-invalid={!!touched.customConvRate && !!errors.customConvRate}
                        aria-describedby={touched.customConvRate && errors.customConvRate ? 'conv-error' : undefined}
                      />
                      {touched.customConvRate && errors.customConvRate && (
                        <p id="conv-error" className="mt-1 text-xs text-rose-600">{errors.customConvRate}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Alert variant="info" className="rounded-2xl border-mist-200 bg-mist-100 text-ink-600">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-xs text-ink-500">CPC:</span>{' '}
                      <span className="font-semibold">${benchmark.cpc.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-xs text-ink-500">CTR:</span>{' '}
                      <span className="font-semibold">{benchmark.ctr}%</span>
                    </div>
                    <div>
                      <span className="text-xs text-ink-500">Conv:</span>{' '}
                      <span className="font-semibold">{benchmark.convRate}%</span>
                    </div>
                  </div>
                </Alert>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4">
                  <MetricCard
                    icon={TrendingUp}
                    label="Estimated clicks"
                    value={formatNumber(metrics.clicks)}
                    bgColor="bg-primary-100"
                    textColor="text-primary-600"
                    loading={isCalculating}
                  />
                  <MetricCard
                    icon={Calculator}
                    label="Estimated conversions"
                    value={formatNumber(metrics.conversions)}
                    bgColor="bg-emerald-100"
                    textColor="text-emerald-600"
                    loading={isCalculating}
                  />
                  <MetricCard
                    icon={DollarSign}
                    label="Cost per conversion"
                    value={`$${metrics.costPerConversion.toFixed(2)}`}
                    bgColor="bg-amber-100"
                    textColor="text-amber-600"
                    loading={isCalculating}
                  />
                  <MetricCard
                    icon={Users}
                    label="Estimated impressions"
                    value={formatNumber(metrics.impressions)}
                    bgColor="bg-sky-100"
                    textColor="text-sky-600"
                    loading={isCalculating}
                  />
                </div>

                <div className="rounded-2xl border border-primary-200 bg-primary-50 p-4 sm:p-6 text-sm text-primary-900">
                  <h3 className="text-lg font-semibold">Budget tight?</h3>
                  <p className="mt-2 text-primary-800">
                    New advertisers can unlock Google Ads credits to stretch budget further.
                  </p>
                  <AffiliateCTA
                    href={AFFILIATE_URLS.googleAds}
                    toolSlug="google-ads"
                    context="budget-calc"
                    className="mt-4 inline-flex items-center rounded-full bg-primary-600 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white min-h-[44px] transition active:scale-95"
                  >
                    Claim Google Ads credit
                  </AffiliateCTA>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ExitIntentModal
        title="Stretch your ad budget"
        description="Google Ads credits can offset your first campaigns while you validate CTR and CVR."
        ctaLabel="See Google Ads"
        ctaHref={AFFILIATE_URLS.googleAds}
        context="budget-calc"
      />
    </main>
  )
}

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  bgColor: string
  textColor: string
  loading: boolean
}

function MetricCard({ icon: Icon, label, value, bgColor, textColor, loading }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/80 p-4 sm:p-6 shadow-sm relative overflow-hidden">
      <div className="flex items-center gap-3">
        <div className={`rounded-xl ${bgColor} p-2`}>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-ink-400" />
          ) : (
            <Icon className={`h-5 w-5 ${textColor}`} />
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink-500">{label}</p>
          <p className="text-xl sm:text-2xl font-semibold text-ink-900 transition-all duration-200">
            {loading ? '\u2014' : value}
          </p>
        </div>
      </div>
    </div>
  )
}
