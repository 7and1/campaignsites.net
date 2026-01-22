import { describe, it, expect } from 'vitest'
import { calculateBudgetMetrics } from '@/lib/budget'

describe('calculateBudgetMetrics', () => {
  it('calculates basic metrics correctly', () => {
    const metrics = calculateBudgetMetrics(1000, { cpc: 2, ctr: 2, convRate: 4 })
    expect(metrics.clicks).toBe(500)
    expect(metrics.conversions).toBe(20)
    expect(metrics.costPerConversion).toBe(50)
    expect(metrics.impressions).toBe(25000)
  })

  it('handles zero conversion rate', () => {
    const metrics = calculateBudgetMetrics(1000, { cpc: 2, ctr: 2, convRate: 0 })
    expect(metrics.clicks).toBe(500)
    expect(metrics.conversions).toBe(0)
    expect(metrics.costPerConversion).toBe(0)
  })

  it('handles zero CTR', () => {
    const metrics = calculateBudgetMetrics(1000, { cpc: 2, ctr: 0, convRate: 4 })
    expect(metrics.clicks).toBe(500)
    expect(metrics.impressions).toBe(0)
  })

  it('rounds clicks down', () => {
    const metrics = calculateBudgetMetrics(100, { cpc: 3, ctr: 2, convRate: 5 })
    expect(metrics.clicks).toBe(33) // 100 / 3 = 33.33
  })

  it('calculates cost per conversion correctly', () => {
    const metrics = calculateBudgetMetrics(500, { cpc: 5, ctr: 1, convRate: 10 })
    expect(metrics.clicks).toBe(100)
    expect(metrics.conversions).toBe(10) // 100 * 0.10
    expect(metrics.costPerConversion).toBe(50) // 500 / 10
  })

  it('returns zero cost per conversion when no conversions', () => {
    const metrics = calculateBudgetMetrics(100, { cpc: 2, ctr: 2, convRate: 0 })
    expect(metrics.costPerConversion).toBe(0)
  })

  it('handles small budgets', () => {
    const metrics = calculateBudgetMetrics(10, { cpc: 1.5, ctr: 1, convRate: 5 })
    expect(metrics.clicks).toBe(6) // 10 / 1.5 = 6.66
    expect(metrics.conversions).toBe(0) // 6 * 0.05 = 0.3
  })

  it('handles large budgets', () => {
    const metrics = calculateBudgetMetrics(50000, { cpc: 3.5, ctr: 2.5, convRate: 3.5 })
    expect(metrics.clicks).toBe(14285)
    expect(metrics.conversions).toBe(499) // 14285 * 0.035
  })

  it('calculates impressions from clicks and CTR', () => {
    const metrics = calculateBudgetMetrics(1000, { cpc: 1, ctr: 5, convRate: 10 })
    expect(metrics.clicks).toBe(1000)
    expect(metrics.impressions).toBe(20000) // 1000 / 0.05
  })

  it('handles fractional CPC values', () => {
    const metrics = calculateBudgetMetrics(100, { cpc: 0.75, ctr: 2, convRate: 4 })
    expect(metrics.clicks).toBe(133) // 100 / 0.75
  })

  it('handles high conversion rates', () => {
    const metrics = calculateBudgetMetrics(1000, { cpc: 5, ctr: 2, convRate: 25 })
    expect(metrics.clicks).toBe(200)
    expect(metrics.conversions).toBe(50) // 200 * 0.25
  })
})
