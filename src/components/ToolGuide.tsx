'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  title: string
  description: string
  example?: string
}

interface FAQ {
  question: string
  answer: string
}

interface ToolGuideProps {
  title: string
  description: string
  steps: Step[]
  tips?: string[]
  faqs?: FAQ[]
  useCases?: string[]
  className?: string
}

export function ToolGuide({ title, description, steps, tips, faqs, useCases, className }: ToolGuideProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={cn('rounded-2xl border border-ink-200 bg-white/80 overflow-hidden', className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-ink-50 sm:p-6"
        type="button"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-ink-900">{title}</h3>
            <p className="mt-0.5 text-sm text-ink-500 hidden sm:block">{description}</p>
          </div>
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink-200 bg-white">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-ink-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-ink-500" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-ink-100 px-4 pb-6 pt-2 sm:px-6">
          {/* Use Cases Section */}
          {useCases && useCases.length > 0 && (
            <div className="mt-4 rounded-xl bg-blue-50 p-4">
              <h4 className="font-semibold text-blue-900">Perfect for:</h4>
              <ul className="mt-2 space-y-1">
                {useCases.map((useCase, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    {useCase}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Steps Section */}
          <div className="mt-6 space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex shrink-0 flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="mt-2 h-full w-px bg-ink-200" />
                  )}
                </div>
                <div className="pb-6">
                  <h4 className="font-medium text-ink-900">{step.title}</h4>
                  <p className="mt-1 text-sm text-ink-600 leading-relaxed">{step.description}</p>
                  {step.example && (
                    <div className="mt-2 rounded-lg bg-mist-50 px-3 py-2 text-xs text-ink-600 font-mono">
                      {step.example}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pro Tips Section */}
          {tips && tips.length > 0 && (
            <div className="mt-6 rounded-xl bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Pro Tips</span>
              </div>
              <ul className="mt-3 space-y-2">
                {tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-emerald-800">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* FAQ Section */}
          {faqs && faqs.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-ink-900">Frequently Asked Questions</h4>
              <div className="mt-3 space-y-3">
                {faqs.map((faq, index) => (
                  <details key={index} className="group rounded-lg border border-ink-200 bg-white">
                    <summary className="cursor-pointer px-4 py-3 font-medium text-ink-900 hover:bg-mist-50">
                      {faq.question}
                    </summary>
                    <div className="border-t border-ink-100 px-4 py-3 text-sm text-ink-600">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Pre-defined guides for each tool
export const toolGuides = {
  'utm-builder': {
    title: 'How to Use UTM Builder',
    description: 'Learn to create trackable campaign URLs in 3 simple steps',
    useCases: [
      'Tracking email campaign performance',
      'Measuring social media ROI',
      'A/B testing different ad creatives',
      'Comparing traffic sources in Google Analytics',
    ],
    steps: [
      {
        title: 'Enter your landing page URL',
        description: 'Start with the full URL of the page you want to track (e.g., https://yoursite.com/landing)',
        example: 'https://yoursite.com/spring-sale',
      },
      {
        title: 'Add UTM parameters',
        description: 'Fill in Source (where traffic comes from), Medium (marketing channel), and Campaign (promotion name). Optional: add Term for keywords and Content for A/B testing.',
        example: 'source=facebook, medium=social, campaign=spring-sale-2024',
      },
      {
        title: 'Copy and use your link',
        description: 'Click Copy to get your tracking URL. Use this link in your campaigns to see accurate data in Google Analytics.',
        example: 'https://yoursite.com/spring-sale?utm_source=facebook&utm_medium=social&utm_campaign=spring-sale-2024',
      },
    ],
    tips: [
      'Use consistent naming: lowercase with hyphens (e.g., "spring-sale" not "Spring Sale")',
      'Save presets for channels you use often (Facebook Ads, Google Ads, Email)',
      'Always test your links before launching campaigns',
      'Keep a spreadsheet backup of all UTM links for reference',
    ],
    faqs: [
      {
        question: 'What is the difference between Source and Medium?',
        answer: 'Source identifies where traffic originates (e.g., "facebook", "google", "newsletter"). Medium categorizes the marketing channel (e.g., "social", "cpc", "email"). Think of Source as the specific platform and Medium as the type of marketing.',
      },
      {
        question: 'Do UTM parameters affect SEO?',
        answer: 'No, UTM parameters do not affect SEO. Search engines treat URLs with UTM parameters the same as the base URL. However, avoid using them in internal links as they can create duplicate content issues.',
      },
      {
        question: 'How long should I keep UTM naming conventions?',
        answer: 'Maintain consistent UTM naming conventions indefinitely. Changing conventions mid-campaign makes historical data comparison difficult. Document your naming standards and share them with your team.',
      },
    ],
  },
  'countdown': {
    title: 'How to Use Countdown Generator',
    description: 'Create urgency timers that boost conversions',
    useCases: [
      'Limited-time sales and promotions',
      'Product launch countdowns',
      'Event registration deadlines',
      'Webinar start times',
      'Flash sales and daily deals',
    ],
    steps: [
      {
        title: 'Set your target date and time',
        description: 'Choose when your offer expires or your event starts. The timer will count down to this moment.',
        example: 'December 31, 2024 at 11:59 PM EST',
      },
      {
        title: 'Customize the appearance',
        description: 'Pick colors that match your brand. Choose from presets like Black Friday, Flash Sale, or Product Launch.',
      },
      {
        title: 'Copy the embed code',
        description: 'Get the HTML code and paste it into your landing page, email, or website. Works with any platform.',
        example: '<div class="countdown" data-end="2024-12-31T23:59:59"></div>',
      },
    ],
    tips: [
      'Place timers above the fold for maximum visibility',
      'Use urgency language like "Sale ends in:" or "Limited time offer:"',
      'Test on mobile devices to ensure readability',
      'Consider adding a CTA button near the timer',
      'Use evergreen timers for ongoing promotions (e.g., "Offer expires in 24 hours")',
    ],
    faqs: [
      {
        question: 'Can I use countdown timers in emails?',
        answer: 'Yes, but email countdown timers require special implementation. Most email clients don\'t support JavaScript, so you\'ll need to use animated GIFs or server-side rendering. Our tool provides email-compatible options.',
      },
      {
        question: 'What happens when the countdown reaches zero?',
        answer: 'You can configure the timer to either display "Expired", redirect to another page, or hide completely. Choose the option that best fits your campaign strategy.',
      },
      {
        question: 'Do countdown timers really increase conversions?',
        answer: 'Yes, studies show countdown timers can increase conversions by 8-15% by creating urgency. However, they work best when the deadline is genuine. Fake urgency can damage trust.',
      },
    ],
  },
  'budget-calc': {
    title: 'How to Use Budget Calculator',
    description: 'Forecast your campaign performance with industry data',
    useCases: [
      'Planning quarterly ad budgets',
      'Comparing channel performance',
      'Pitching campaign proposals to stakeholders',
      'Setting realistic KPI targets',
      'Allocating budget across multiple campaigns',
    ],
    steps: [
      {
        title: 'Select your industry',
        description: 'Choose the industry that best matches your business. This loads benchmark CPC, CTR, and conversion rates.',
        example: 'E-commerce: CPC $1.20, CTR 2.5%, Conv Rate 3.2%',
      },
      {
        title: 'Enter your budget',
        description: 'Input your total campaign budget. The calculator will estimate clicks, conversions, and cost per acquisition.',
        example: '$5,000 budget → ~4,167 clicks → ~133 conversions',
      },
      {
        title: 'Review and adjust',
        description: 'See projected results. Adjust budget or compare different industries to plan your strategy.',
      },
    ],
    tips: [
      'Use conservative estimates for new campaigns',
      'Compare multiple industries if you cross categories',
      'Factor in your historical performance vs benchmarks',
      'Recalculate as you collect real campaign data',
      'Add 20-30% buffer for testing and optimization',
    ],
    faqs: [
      {
        question: 'Where do the benchmark numbers come from?',
        answer: 'Our benchmarks are aggregated from industry reports by WordStream, Google, and Facebook. They represent median performance across thousands of campaigns. Your actual results may vary based on targeting, creative quality, and landing page optimization.',
      },
      {
        question: 'Should I trust these projections for my business?',
        answer: 'Use these as starting estimates, not guarantees. New campaigns often underperform benchmarks initially. As you optimize, you can exceed them. Track your actual performance and adjust the calculator inputs accordingly.',
      },
      {
        question: 'How do I improve my cost per acquisition?',
        answer: 'Focus on three areas: 1) Improve ad relevance and quality score to lower CPC, 2) Optimize landing pages to increase conversion rate, 3) Refine targeting to reach higher-intent audiences.',
      },
    ],
  },
  'copy-optimizer': {
    title: 'How to Use Copy Optimizer',
    description: 'Improve your headlines and CTAs with AI analysis',
    useCases: [
      'Writing high-converting headlines',
      'Optimizing call-to-action buttons',
      'Improving email subject lines',
      'Testing ad copy variations',
      'Enhancing landing page messaging',
    ],
    steps: [
      {
        title: 'Enter your copy',
        description: 'Paste your headline, CTA, or marketing copy into the text field.',
        example: 'Get Started Today',
      },
      {
        title: 'Get your score',
        description: 'The AI analyzes readability, emotional impact, clarity, and conversion potential.',
        example: 'Score: 72/100 - Good clarity, but lacks urgency',
      },
      {
        title: 'Apply suggestions',
        description: 'Review AI-generated variants and actionable tips to improve your copy.',
        example: 'Suggested: "Start Your Free Trial Now" (Score: 89/100)',
      },
    ],
    tips: [
      'Test multiple headline variations for best results',
      'Keep CTAs action-oriented ("Get Started" vs "Submit")',
      'Aim for 8th-grade reading level for broad appeal',
      'Use power words like "Free," "Now," "Instant," "Exclusive"',
      'Include numbers and specifics ("Save 30%" vs "Save Money")',
    ],
    faqs: [
      {
        question: 'How does the AI scoring work?',
        answer: 'Our AI analyzes multiple factors: word choice, sentence structure, emotional triggers, clarity, specificity, and urgency. It compares your copy against thousands of high-performing examples to generate a score and suggestions.',
      },
      {
        question: 'Should I always use the highest-scoring variant?',
        answer: 'Not necessarily. The highest score indicates strong conversion potential, but brand voice and context matter. Test multiple variants with your actual audience to find what resonates best.',
      },
      {
        question: 'Can I use this for long-form content?',
        answer: 'This tool is optimized for short-form copy (headlines, CTAs, subject lines). For long-form content, focus on optimizing individual sections rather than entire articles.',
      },
    ],
  },
  'meta-preview': {
    title: 'How to Use Meta Tag Preview',
    description: 'Optimize how your content appears on social platforms',
    useCases: [
      'Optimizing blog post sharing',
      'Previewing landing page social cards',
      'Testing product page metadata',
      'Improving click-through rates from social',
      'Ensuring consistent branding across platforms',
    ],
    steps: [
      {
        title: 'Enter your content details',
        description: 'Fill in your page title, description, image URL, and page URL.',
        example: 'Title: "10 Landing Page Tips" | Description: "Boost conversions with..."',
      },
      {
        title: 'Preview across platforms',
        description: 'See exactly how your link will look on Google Search, Facebook, Twitter/X, and LinkedIn.',
      },
      {
        title: 'Optimize for each platform',
        description: 'Adjust title length, description, and image to meet each platform\'s best practices.',
        example: 'Google: 60 chars | Facebook: 1200x630 image | Twitter: 70 chars',
      },
    ],
    tips: [
      'Keep titles under 60 characters for Google',
      'Use 1200x630 images for best social sharing results',
      'Descriptions should be 150-160 characters',
      'Test with real URLs after publishing',
      'Include your brand name in the title',
      'Use high-contrast images that work at small sizes',
    ],
    faqs: [
      {
        question: 'Why does my preview look different when I share?',
        answer: 'Social platforms cache metadata. After updating your meta tags, use each platform\'s debugging tool to refresh the cache: Facebook Sharing Debugger, Twitter Card Validator, LinkedIn Post Inspector.',
      },
      {
        question: 'What image size should I use?',
        answer: 'Use 1200x630 pixels for universal compatibility. This works for Facebook, Twitter, LinkedIn, and most platforms. Ensure important content is centered, as some platforms crop differently.',
      },
      {
        question: 'Do I need different meta tags for each platform?',
        answer: 'Not required, but recommended for optimization. Use Open Graph tags (og:) for Facebook/LinkedIn, Twitter Card tags (twitter:) for Twitter/X, and standard meta tags for Google. Most platforms fall back to Open Graph if specific tags are missing.',
      },
    ],
  },
}
