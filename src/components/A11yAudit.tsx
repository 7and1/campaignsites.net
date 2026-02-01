'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'

interface A11yIssue {
  id: string
  impact: 'critical' | 'serious' | 'moderate' | 'minor'
  description: string
  help: string
  helpUrl: string
  nodes: number
}

interface A11yAuditProps {
  enabled?: boolean
}

export function A11yAudit({ enabled = process.env.NODE_ENV === 'development' }: A11yAuditProps) {
  const [issues] = useState<A11yIssue[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const runAudit = async () => {
      try {
        const axe = await import('@axe-core/react')
        const React = await import('react')
        const ReactDOM = await import('react-dom')

        axe.default(React, ReactDOM, 1000, {
          rules: [
            { id: 'color-contrast', enabled: true },
            { id: 'label', enabled: true },
            { id: 'button-name', enabled: true },
            { id: 'link-name', enabled: true },
            { id: 'image-alt', enabled: true },
            { id: 'aria-roles', enabled: true },
            { id: 'aria-valid-attr', enabled: true },
            { id: 'heading-order', enabled: true },
            { id: 'landmark-one-main', enabled: true },
            { id: 'region', enabled: true },
          ],
        })
      } catch (err) {
        console.error('Failed to run accessibility audit:', err)
      }
    }

    runAudit()
  }, [enabled])

  if (!enabled || issues.length === 0) return null

  const criticalCount = issues.filter((i) => i.impact === 'critical').length
  const seriousCount = issues.filter((i) => i.impact === 'serious').length

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white shadow-lg"
        aria-label="Toggle accessibility audit"
      >
        <AlertTriangle className="h-4 w-4" />
        A11y: {issues.length} issues
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-96 max-h-96 overflow-auto rounded-lg border border-mist-200 bg-white shadow-xl">
          <div className="sticky top-0 border-b border-mist-200 bg-white p-4">
            <h3 className="font-semibold text-ink-900">Accessibility Issues</h3>
            <div className="mt-2 flex gap-4 text-xs">
              <span className="text-rose-600">Critical: {criticalCount}</span>
              <span className="text-orange-600">Serious: {seriousCount}</span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="rounded-lg border border-mist-200 p-3 text-sm"
              >
                <div className="flex items-start gap-2">
                  {issue.impact === 'critical' && (
                    <XCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  )}
                  {issue.impact === 'serious' && (
                    <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  )}
                  {issue.impact === 'moderate' && (
                    <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  )}
                  {issue.impact === 'minor' && (
                    <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-ink-900">{issue.description}</p>
                    <p className="mt-1 text-xs text-ink-600">{issue.help}</p>
                    <a
                      href={issue.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-xs text-blue-600 hover:underline"
                    >
                      Learn more
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
