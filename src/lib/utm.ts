import type { UTMParams } from './types'
import { isValidUrl as validateUrl } from './validation'

export const normalizeUrl = (value: string): string => {
  if (!value) return ''
  const trimmed = value.trim()
  return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
}

export const buildUtmUrl = (params: UTMParams): string => {
  if (!params.url) return ''
  try {
    const url = new URL(normalizeUrl(params.url))
    if (params.source) url.searchParams.set('utm_source', params.source)
    if (params.medium) url.searchParams.set('utm_medium', params.medium)
    if (params.campaign) url.searchParams.set('utm_campaign', params.campaign)
    if (params.term) url.searchParams.set('utm_term', params.term)
    if (params.content) url.searchParams.set('utm_content', params.content)
    return url.toString()
  } catch {
    return ''
  }
}

export const isValidUrl = (value: string): boolean => {
  return validateUrl(value)
}
