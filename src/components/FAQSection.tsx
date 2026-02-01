'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { JsonLd } from './JsonLd'

interface FAQItem {
  question: string
  answer: string
}

interface FAQSectionProps {
  title?: string
  description?: string
  items: FAQItem[]
  pageUrl: string
  showStructuredData?: boolean
}

export function FAQSection({
  title = 'Frequently Asked Questions',
  description,
  items,
  pageUrl,
  showStructuredData = true,
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <>
      {showStructuredData && <JsonLd data={structuredData} />}
      <section className="py-16 bg-mist-50">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-10">
            <p className="section-kicker">FAQ</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink-900">{title}</h2>
            {description && (
              <p className="mt-4 text-lg text-ink-600">{description}</p>
            )}
          </div>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="glass-panel overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/50 transition-colors"
                  aria-expanded={openIndex === index}
                >
                  <span className="font-semibold text-ink-900 pr-4">{item.question}</span>
                  {openIndex === index ? (
                    <ChevronUp className="h-5 w-5 flex-shrink-0 text-primary-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 flex-shrink-0 text-ink-400" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-6">
                    <p className="text-ink-600 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
