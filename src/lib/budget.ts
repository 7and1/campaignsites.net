import type { Benchmark, BudgetMetrics } from './types'

export const calculateBudgetMetrics = (budget: number, benchmark: Benchmark): BudgetMetrics => {
  const clicks = Math.floor(budget / benchmark.cpc)
  const conversions = Math.floor(clicks * (benchmark.convRate / 100))
  const costPerConversion = conversions > 0 ? budget / conversions : 0
  const impressions = benchmark.ctr > 0 ? Math.floor(clicks / (benchmark.ctr / 100)) : 0

  return {
    clicks,
    conversions,
    costPerConversion,
    impressions,
  }
}
