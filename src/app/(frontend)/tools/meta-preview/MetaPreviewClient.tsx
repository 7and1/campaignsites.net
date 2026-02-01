'use client'

import { useState, useRef, useCallback } from 'react'
import { Copy, Download, RefreshCw, ImageIcon, AlertCircle, Check } from 'lucide-react'
import { toPng } from 'html-to-image'
import { ToolUsageTracker, ToolGuide, toolGuides } from '@/components'
import { Input, Textarea } from '@/components/ui'
import { cn } from '@/lib/utils'
import { UI_CONSTANTS } from '@/lib/constants'

interface MetaState {
  title: string
  description: string
  image: string
  url: string
}

const MAX_TITLE_LENGTH = 60
const MAX_DESCRIPTION_LENGTH = 160
const OPTIMAL_IMAGE_WIDTH = 1200
const OPTIMAL_IMAGE_HEIGHT = 630

export default function MetaPreviewClient() {
  const [meta, setMeta] = useState<MetaState>({
    title: 'CampaignSites.net — Campaign Landing Page Tools & Resources',
    description: 'Free campaign tools, real-world landing page case studies, and actionable playbooks to build marketing that converts.',
    image: 'https://campaignsites.net/og?title=CampaignSites.net&subtitle=Campaign%20tools%20for%20teams%20that%20ship',
    url: 'https://campaignsites.net',
  })

  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [activeTab, setActiveTab] = useState<'google' | 'facebook' | 'twitter' | 'linkedin'>('google')
  const previewRef = useRef<HTMLDivElement>(null)

  const titleLength = meta.title.length
  const descriptionLength = meta.description.length

  const getTitleStatus = () => {
    if (titleLength === 0) return 'empty'
    if (titleLength <= MAX_TITLE_LENGTH) return 'good'
    if (titleLength <= 70) return 'warning'
    return 'error'
  }

  const getDescriptionStatus = () => {
    if (descriptionLength === 0) return 'empty'
    if (descriptionLength <= MAX_DESCRIPTION_LENGTH) return 'good'
    if (descriptionLength <= 180) return 'warning'
    return 'error'
  }

  const copyToClipboard = async () => {
    const html = `<!-- Primary Meta Tags -->
<title>${meta.title}</title>
<meta name="title" content="${meta.title}">
<meta name="description" content="${meta.description}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${meta.url}">
<meta property="og:title" content="${meta.title}">
<meta property="og:description" content="${meta.description}">
<meta property="og:image" content="${meta.image}">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${meta.url}">
<meta property="twitter:title" content="${meta.title}">
<meta property="twitter:description" content="${meta.description}">
<meta property="twitter:image" content="${meta.image}">
    `.trim()

    try {
      await navigator.clipboard.writeText(html)
      setCopied(true)
      setTimeout(() => setCopied(false), UI_CONSTANTS.COPY_FEEDBACK_DURATION)
    } catch {
      // Ignore
    }
  }

  const exportImage = useCallback(async () => {
    if (!previewRef.current) return

    setExporting(true)
    try {
      const dataUrl = await toPng(previewRef.current, {
        quality: 1,
        pixelRatio: 2,
      })
      const link = document.createElement('a')
      link.download = `meta-preview-${activeTab}.png`
      link.href = dataUrl
      link.click()
    } catch {
      // Ignore
    } finally {
      setExporting(false)
    }
  }, [activeTab])

  const truncate = (str: string, max: number) => {
    if (str.length <= max) return str
    return str.slice(0, max - 3) + '...'
  }

  const renderGooglePreview = () => (
    <div className="max-w-[600px] font-arial">
      <div className="text-sm text-ink-900 truncate">{meta.url}</div>
      <a href="#" className="text-xl text-[#1a0dab] hover:underline cursor-pointer block truncate">
        {truncate(meta.title, MAX_TITLE_LENGTH)}
      </a>
      <div className="text-sm text-[#4d5156] leading-5 line-clamp-2">
        {truncate(meta.description, MAX_DESCRIPTION_LENGTH)}
      </div>
    </div>
  )

  const renderFacebookPreview = () => (
    <div className="max-w-[500px] bg-white rounded-lg border border-gray-300 overflow-hidden">
      <div className="aspect-[1.91/1] bg-gray-100">
        {meta.image ? (
          <img
            src={meta.image}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ImageIcon className="h-12 w-12" />
          </div>
        )}
      </div>
      <div className="p-3 bg-[#f0f2f5]">
        <div className="text-xs text-[#65676b] uppercase truncate">{new URL(meta.url || 'https://example.com').hostname}</div>
        <div className="text-sm font-semibold text-[#050505] truncate mt-0.5">{meta.title}</div>
        <div className="text-xs text-[#65676b] line-clamp-1 mt-0.5">{meta.description}</div>
      </div>
    </div>
  )

  const renderTwitterPreview = () => (
    <div className="max-w-[500px] rounded-xl border border-gray-200 overflow-hidden">
      <div className="aspect-[2/1] bg-gray-100">
        {meta.image ? (
          <img
            src={meta.image}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ImageIcon className="h-12 w-12" />
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="text-sm text-[#0f1419] truncate">{meta.title}</div>
        <div className="text-sm text-[#536471] line-clamp-2 mt-0.5">{meta.description}</div>
        <div className="text-sm text-[#536471] truncate mt-1 flex items-center gap-1">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          {new URL(meta.url || 'https://example.com').hostname}
        </div>
      </div>
    </div>
  )

  const renderLinkedInPreview = () => (
    <div className="max-w-[520px] bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="aspect-[1.91/1] bg-gray-100">
        {meta.image ? (
          <img
            src={meta.image}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ImageIcon className="h-12 w-12" />
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="text-sm font-semibold text-[#000000e6] truncate">{meta.title}</div>
        <div className="text-xs text-[#00000099] line-clamp-2 mt-1">{meta.description}</div>
        <div className="text-xs text-[#00000099] truncate mt-1">{new URL(meta.url || 'https://example.com').hostname}</div>
      </div>
    </div>
  )

  const tabs = [
    { id: 'google', label: 'Google', icon: '🔍' },
    { id: 'facebook', label: 'Facebook', icon: '📘' },
    { id: 'twitter', label: 'Twitter/X', icon: '𝕏' },
    { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  ] as const

  return (
    <main className="min-h-screen">
      <ToolUsageTracker tool="meta-preview" />

      <section className="py-8 sm:py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="glass-panel p-4 sm:p-6 md:p-10">
            <p className="section-kicker">Social Preview Tool</p>
            <h1 className="mt-3 text-2xl sm:text-3xl font-semibold text-ink-900">Meta Tag Preview</h1>
            <p className="mt-3 text-sm text-ink-600">
              Preview how your content appears on search engines and social platforms. Optimize titles, descriptions, and images for maximum engagement.
            </p>

            <div className="mt-8 grid gap-6 lg:gap-8 lg:grid-cols-2">
              {/* Input Form */}
              <div className="space-y-4 sm:space-y-6">
                <div className="rounded-2xl border border-white/70 bg-white/80 p-4 sm:p-6 shadow-sm space-y-4">
                  <div>
                    <Input
                      label="Page Title"
                      value={meta.title}
                      onChange={(e) => setMeta({ ...meta, title: e.target.value })}
                      placeholder="Enter your page title"
                      maxLength={100}
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <span className={cn(
                        'text-xs',
                        getTitleStatus() === 'good' && 'text-emerald-600',
                        getTitleStatus() === 'warning' && 'text-amber-600',
                        getTitleStatus() === 'error' && 'text-rose-600',
                        getTitleStatus() === 'empty' && 'text-ink-400'
                      )}>
                        {titleLength} / {MAX_TITLE_LENGTH} characters
                      </span>
                      {getTitleStatus() === 'warning' && (
                        <span className="text-xs text-amber-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> May be truncated
                        </span>
                      )}
                      {getTitleStatus() === 'error' && (
                        <span className="text-xs text-rose-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Too long
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <Textarea
                      label="Description"
                      value={meta.description}
                      onChange={(e) => setMeta({ ...meta, description: e.target.value })}
                      placeholder="Enter your page description"
                      rows={3}
                      maxLength={250}
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <span className={cn(
                        'text-xs',
                        getDescriptionStatus() === 'good' && 'text-emerald-600',
                        getDescriptionStatus() === 'warning' && 'text-amber-600',
                        getDescriptionStatus() === 'error' && 'text-rose-600',
                        getDescriptionStatus() === 'empty' && 'text-ink-400'
                      )}>
                        {descriptionLength} / {MAX_DESCRIPTION_LENGTH} characters
                      </span>
                      {getDescriptionStatus() === 'warning' && (
                        <span className="text-xs text-amber-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> May be truncated
                        </span>
                      )}
                      {getDescriptionStatus() === 'error' && (
                        <span className="text-xs text-rose-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Too long
                        </span>
                      )}
                    </div>
                  </div>

                  <Input
                    label="Image URL"
                    type="url"
                    value={meta.image}
                    onChange={(e) => setMeta({ ...meta, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    description={`Optimal size: ${OPTIMAL_IMAGE_WIDTH}x${OPTIMAL_IMAGE_HEIGHT}px`}
                  />

                  <Input
                    label="Page URL"
                    type="url"
                    value={meta.url}
                    onChange={(e) => setMeta({ ...meta, url: e.target.value })}
                    placeholder="https://example.com/page"
                  />
                </div>

                <ToolGuide {...toolGuides['meta-preview']} />
              </div>

              {/* Preview */}
              <div className="space-y-4 sm:space-y-6">
                {/* Platform Tabs */}
                <div className="flex flex-wrap gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition min-h-[44px]',
                        activeTab === tab.id
                          ? 'bg-ink-900 text-white'
                          : 'bg-white border border-ink-200 text-ink-600 hover:border-primary-300'
                      )}
                      type="button"
                    >
                      <span>{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Preview Card */}
                <div
                  ref={previewRef}
                  className="rounded-2xl border border-white/70 bg-white/80 p-4 sm:p-6 shadow-sm"
                >
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500 mb-4">
                    {tabs.find(t => t.id === activeTab)?.label} Preview
                  </h3>

                  <div className={cn(
                    'p-4 sm:p-6 rounded-xl',
                    activeTab === 'google' && 'bg-white',
                    activeTab !== 'google' && 'bg-gray-50'
                  )}>
                    {activeTab === 'google' && renderGooglePreview()}
                    {activeTab === 'facebook' && renderFacebookPreview()}
                    {activeTab === 'twitter' && renderTwitterPreview()}
                    {activeTab === 'linkedin' && renderLinkedInPreview()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-ink-900 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white min-h-[44px] transition active:scale-95"
                    type="button"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Meta Tags
                      </>
                    )}
                  </button>

                  <button
                    onClick={exportImage}
                    disabled={exporting}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-ink-700 min-h-[44px] transition hover:border-primary-300 active:scale-95 disabled:opacity-50"
                    type="button"
                  >
                    {exporting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Export Image
                      </>
                    )}
                  </button>
                </div>

                {/* Guidelines */}
                <div className="rounded-xl bg-ink-50 p-4">
                  <h4 className="font-semibold text-ink-900 text-sm">Platform Guidelines</h4>
                  <ul className="mt-3 space-y-2 text-sm text-ink-600">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400" />
                      <span><strong>Google:</strong> Titles ≤60 chars, descriptions ≤160 chars</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400" />
                      <span><strong>Facebook:</strong> Images 1200×630px, titles ≤88 chars</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400" />
                      <span><strong>Twitter/X:</strong> Images 2:1 ratio, summary cards work best</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400" />
                      <span><strong>LinkedIn:</strong> Images 1200×627px, titles ≤200 chars</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
