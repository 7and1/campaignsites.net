'use client'

import { memo, useState, useEffect, useRef } from 'react'
import { Download, Mail, FileText, CheckCircle, X } from 'lucide-react'
import { withCsrfToken } from '@/lib/csrf-client'

interface LeadMagnet {
  id: string
  title: string
  description: string
  fileType: 'PDF' | 'Template' | 'Checklist' | 'Guide'
  fileSize?: string
  downloadUrl: string
  icon?: typeof FileText
}

const leadMagnets: LeadMagnet[] = [
  {
    id: 'landing-page-checklist',
    title: 'Landing Page Launch Checklist',
    description: '50-point checklist to ensure your landing pages convert before you launch.',
    fileType: 'PDF',
    fileSize: '2.4 MB',
    downloadUrl: '/downloads/landing-page-checklist.pdf',
  },
  {
    id: 'utm-naming-guide',
    title: 'UTM Naming Convention Guide',
    description: 'Standardized templates for consistent campaign tracking across teams.',
    fileType: 'PDF',
    fileSize: '1.2 MB',
    downloadUrl: '/downloads/utm-naming-guide.pdf',
  },
  {
    id: 'cta-swipe-file',
    title: 'High-Intent CTA Swipe File',
    description: '100+ proven call-to-action phrases organized by industry and use case.',
    fileType: 'PDF',
    fileSize: '1.8 MB',
    downloadUrl: '/downloads/cta-swipe-file.pdf',
  },
  {
    id: 'budget-calculator-template',
    title: 'Campaign Budget Calculator',
    description: 'Interactive spreadsheet for planning ad spend across channels.',
    fileType: 'Template',
    downloadUrl: '/lead-magnets/budget-calculator.xlsx',
  },
  {
    id: 'copywriting-frameworks',
    title: 'Copywriting Frameworks Guide',
    description: 'AIDA, PAS, and 8 other frameworks with real campaign examples.',
    fileType: 'PDF',
    fileSize: '3.1 MB',
    downloadUrl: '/lead-magnets/copywriting-frameworks.pdf',
  },
]

interface ContentUpgradeProps {
  variant?: 'inline' | 'modal' | 'sidebar' | 'exit-intent'
  defaultMagnet?: string
  source?: string
  context?: string
  onClose?: () => void
  placement?: 'auto' | 'manual'
  scrollPercentage?: number
}

export const ContentUpgrade = memo(function ContentUpgrade({
  variant = 'inline',
  defaultMagnet,
  source = 'content-upgrade',
  context,
  onClose,
  placement = 'manual',
  scrollPercentage = 50,
}: ContentUpgradeProps) {
  const [selectedMagnet, setSelectedMagnet] = useState(defaultMagnet || leadMagnets[0].id)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [isVisible, setIsVisible] = useState(placement === 'manual')
  const componentRef = useRef<HTMLDivElement>(null)

  const selectedLeadMagnet = leadMagnets.find((m) => m.id === selectedMagnet) || leadMagnets[0]

  // Auto-placement based on scroll percentage
  useEffect(() => {
    if (placement !== 'auto') return

    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100

      if (scrollPercent >= scrollPercentage && !isVisible) {
        setIsVisible(true)
        // Track impression
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: 'content_upgrade_impression',
            context: `scroll-${scrollPercentage}`,
            metadata: { source, variant },
          }),
        }).catch(() => {})
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [placement, scrollPercentage, isVisible, source, variant])

  // Exit-intent detection
  useEffect(() => {
    if (variant !== 'exit-intent') return

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !isVisible) {
        setIsVisible(true)
        // Track exit-intent trigger
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: 'exit_intent_triggered',
            context: selectedMagnet,
            metadata: { source, variant },
          }),
        }).catch(() => {})
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [variant, isVisible, selectedMagnet, source])

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('loading')

    const formData = new FormData(event.currentTarget)
    const payload = {
      email: formData.get('email'),
      name: formData.get('name'),
      leadMagnet: selectedMagnet,
      source: `${source}${context ? `-${context}` : ''}`,
    }

    try {
      const response = await fetch('/api/subscribe', withCsrfToken({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }))

      const data = await response.json() as { error?: string; message?: string }
      if (!response.ok) throw new Error(data?.error || 'Subscription failed')

      setStatus('success')
      setMessage(data?.message || 'Check your inbox for the download link!')

      // Track content upgrade conversion
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'content_upgrade_conversion',
          context: selectedMagnet,
          metadata: { source, variant, placement },
        }),
      }).catch(() => {})
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    // Track dismissal
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'content_upgrade_dismissed',
        context: selectedMagnet,
        metadata: { source, variant },
      }),
    }).catch(() => {})
    onClose?.()
  }

  if (!isVisible) return null

  const containerClasses = {
    inline: 'rounded-2xl border border-white/70 bg-white/80 p-6 shadow-sm',
    modal: 'relative rounded-2xl border border-white/70 bg-white p-8 shadow-2xl',
    sidebar: 'rounded-xl border border-mist-200 bg-white p-5 shadow-sm',
    'exit-intent': 'relative rounded-2xl border-2 border-primary-200 bg-white p-8 shadow-2xl',
  }

  return (
    <div ref={componentRef} className={containerClasses[variant]}>
      {(variant === 'modal' || variant === 'exit-intent') && (
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1 text-ink-400 transition hover:bg-mist-100 hover:text-ink-600"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {status === 'success' ? (
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-ink-900">You are all set!</h3>
          <p className="mt-2 text-ink-600">{message}</p>
          <p className="mt-4 text-sm text-ink-500">
            Download your resource:{' '}
            <a
              href={selectedLeadMagnet.downloadUrl}
              className="font-medium text-primary-600 hover:underline"
              download
            >
              {selectedLeadMagnet.title}
            </a>
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100">
              <Download className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink-900">
                {variant === 'exit-intent' ? 'Wait! Grab this free resource' : 'Get the free resource'}
              </h3>
              <p className="mt-1 text-sm text-ink-600">
                Join 5,000+ marketers and get instant access to our proven templates.
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {variant !== 'sidebar' && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                  Select Resource
                </label>
                <select
                  value={selectedMagnet}
                  onChange={(e) => setSelectedMagnet(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-mist-200 bg-white px-4 py-2.5 text-sm text-ink-700 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
                >
                  {leadMagnets.map((magnet) => (
                    <option key={magnet.id} value={magnet.id}>
                      {magnet.title} ({magnet.fileType})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-ink-500">{selectedLeadMagnet.description}</p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                  Email *
                </label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="you@company.com"
                    className="w-full rounded-xl border border-mist-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink-700 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Optional"
                  className="mt-2 w-full rounded-xl border border-mist-200 bg-white px-4 py-2.5 text-sm text-ink-700 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-primary-700 disabled:opacity-60"
            >
              {status === 'loading' ? (
                'Sending...'
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download {selectedLeadMagnet.fileType}
                </>
              )}
            </button>

            {status === 'error' && <p className="text-sm text-rose-600">{message}</p>}

            <p className="text-center text-[11px] text-ink-500">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </form>
        </>
      )}
    </div>
  )
})

// Exit-intent modal wrapper component
export const ExitIntentModal = memo(function ExitIntentModal({
  defaultMagnet,
  source,
  context,
}: {
  defaultMagnet?: string
  source?: string
  context?: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check if user has already seen exit intent in this session
    const hasSeenExitIntent = sessionStorage.getItem('exit-intent-shown')
    if (hasSeenExitIntent) return

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !isOpen) {
        setIsOpen(true)
        sessionStorage.setItem('exit-intent-shown', 'true')
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 backdrop-blur-sm">
      <div className="max-w-2xl">
        <ContentUpgrade
          variant="exit-intent"
          defaultMagnet={defaultMagnet}
          source={source}
          context={context}
          onClose={() => setIsOpen(false)}
        />
      </div>
    </div>
  )
})
