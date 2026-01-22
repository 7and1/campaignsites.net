/**
 * Affiliate URLs for promotional links
 */
export const AFFILIATE_URLS = {
  bitly: 'https://bitly.com/',
  jasper: 'https://www.jasper.ai/',
  googleAds: 'https://ads.google.com/intl/en_us/home/',
  elfsight: 'https://elfsight.com/countdown-timer-widget/',
} as const

/**
 * Lead magnet download links
 */
export const LEAD_MAGNET_LINKS: Record<string, string> = {
  'landing-page-checklist': 'https://campaignsites.net/lead-magnets/landing-page-checklist.txt',
  'utm-naming-guide': 'https://campaignsites.net/lead-magnets/utm-naming-guide.txt',
  'cta-swipe-file': 'https://campaignsites.net/lead-magnets/cta-swipe-file.txt',
}

/**
 * Industry benchmark data for budget calculator
 */
export const INDUSTRY_BENCHMARKS: Record<string, { cpc: number; ctr: number; convRate: number }> = {
  'E-commerce': { cpc: 1.16, ctr: 2.69, convRate: 2.81 },
  B2B: { cpc: 3.33, ctr: 2.41, convRate: 3.04 },
  Finance: { cpc: 3.44, ctr: 2.91, convRate: 5.01 },
  Healthcare: { cpc: 2.62, ctr: 3.27, convRate: 3.36 },
  Legal: { cpc: 6.75, ctr: 2.93, convRate: 6.98 },
  'Real Estate': { cpc: 2.37, ctr: 3.71, convRate: 2.47 },
  Technology: { cpc: 3.8, ctr: 2.09, convRate: 2.92 },
  Travel: { cpc: 1.53, ctr: 4.68, convRate: 3.55 },
  Education: { cpc: 2.4, ctr: 3.78, convRate: 3.39 },
  SaaS: { cpc: 4.5, ctr: 2.1, convRate: 3 },
}

/**
 * Default UTM presets
 */
export const DEFAULT_UTM_PRESETS = [
  { name: 'Facebook Ad', params: { source: 'facebook', medium: 'paid-social', campaign: '', term: '', content: '' } },
  { name: 'Google Ads', params: { source: 'google', medium: 'cpc', campaign: '', term: '', content: '' } },
  { name: 'Email Newsletter', params: { source: 'newsletter', medium: 'email', campaign: '', term: '', content: '' } },
  { name: 'LinkedIn Post', params: { source: 'linkedin', medium: 'social', campaign: '', term: '', content: '' } },
] as const

/**
 * Countdown timer color presets
 */
export const COUNTDOWN_PRESETS = [
  { name: 'Black Friday', color: '#0f172a', accent: '#ff6b35' },
  { name: 'Holiday Sale', color: '#c2410c', accent: '#fef3c7' },
  { name: 'Product Launch', color: '#0f766e', accent: '#ecfeff' },
  { name: 'Flash Sale', color: '#be123c', accent: '#fff1f2' },
  { name: 'Final Hours', color: '#111827', accent: '#facc15' },
] as const

/**
 * Magic numbers - UI constants
 */
export const UI_CONSTANTS = {
  COPY_FEEDBACK_DURATION: 2000,
  TIMER_UPDATE_INTERVAL: 1000,
  BUDGET_MIN: 100,
  BUDGET_MAX: 50000,
  BUDGET_STEP: 100,
  MILLISECONDS_PER_DAY: 86400000,
  MILLISECONDS_PER_HOUR: 3600000,
  MILLISECONDS_PER_MINUTE: 60000,
  MILLISECONDS_PER_SECOND: 1000,
} as const

/**
 * Email validation regex (RFC 5322 compliant subset)
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Lead magnet types
 */
export type LeadMagnetType = keyof typeof LEAD_MAGNET_LINKS

/**
 * Affiliate URL keys
 */
export type AffiliateUrlKey = keyof typeof AFFILIATE_URLS
