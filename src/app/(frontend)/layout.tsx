import type { Metadata } from 'next'
import { Fraunces, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AnalyticsScripts } from '@/components/AnalyticsScripts'
import { CookieNotice } from '@/components/CookieNotice'
import { UTMTracker } from '@/components/UTMTracker'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { WebVitals } from '@/components/WebVitals'
import { Toaster } from '@/components/ui/Toast'
import { NoScriptFallback } from '@/components/NoScriptFallback'

const bodyFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'optional',
  preload: true,
  adjustFontFallback: true,
})

const displayFont = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'optional',
  preload: true,
  weight: ['400', '700'],
  adjustFontFallback: true,
})

export const metadata: Metadata = {
  metadataBase: new URL('https://campaignsites.net'),
  title: {
    default: 'Campaign Landing Pages: Free Tools & Case Studies | CampaignSites.net',
    template: '%s | CampaignSites.net',
  },
  description:
    'Free campaign landing page tools, real-world case studies, and actionable playbooks for growth teams. Build high-converting landing pages with countdown timers, UTM builders, budget calculators, and AI copy optimizers. Start optimizing today.',
  applicationName: 'CampaignSites.net',
  keywords: [
    'campaign landing pages',
    'landing page tools',
    'conversion optimization',
    'utm builder',
    'marketing tools',
    'copywriting',
    'case studies',
    'countdown timer',
    'budget calculator',
    'copy optimizer',
    'landing page optimization',
    'campaign tools',
    'high-converting landing pages',
  ],
  authors: [{ name: 'CampaignSites.net Editorial Team', url: 'https://campaignsites.net/about' }],
  creator: 'CampaignSites.net',
  publisher: 'CampaignSites.net',
  alternates: {
    canonical: 'https://campaignsites.net',
  },
  openGraph: {
    type: 'website',
    url: 'https://campaignsites.net',
    title: 'Campaign Landing Pages: Free Tools & Case Studies | CampaignSites.net',
    description:
      'Free campaign landing page tools, real-world case studies, and actionable playbooks. Build high-converting landing pages with our free toolkit.',
    siteName: 'CampaignSites.net',
    locale: 'en_US',
    images: [
      {
        url: '/og?title=Campaign%20Landing%20Pages&subtitle=Free%20Tools%20%26%20Case%20Studies',
        width: 1200,
        height: 630,
        alt: 'CampaignSites.net - Campaign Landing Page Tools and Resources',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@campaignsites',
    title: 'Campaign Landing Pages: Free Tools & Case Studies | CampaignSites.net',
    description:
      'Free campaign landing page tools, real-world case studies, and actionable playbooks.',
    images: ['/og?title=Campaign%20Landing%20Pages&subtitle=Free%20Tools%20%26%20Case%20Studies'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2563eb',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${displayFont.variable} font-sans antialiased text-ink-900`}>
        <NoScriptFallback />
        <Header />
        <UTMTracker />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Footer />
        <CookieNotice />
        <AnalyticsScripts />
        <WebVitals />
        <Toaster />
      </body>
    </html>
  )
}
