import type { Metadata } from 'next'
import { Fraunces, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AnalyticsScripts } from '@/components/AnalyticsScripts'
import { CookieNotice } from '@/components/CookieNotice'
import { UTMTracker } from '@/components/UTMTracker'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

const bodyFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  preload: true,
})

const displayFont = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  preload: true,
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://campaignsites.net'),
  title: {
    default: 'CampaignSites.net — Campaign Landing Page Tools & Resources',
    template: '%s | CampaignSites.net',
  },
  description:
    'Free campaign tools, real-world landing page case studies, and actionable playbooks to build marketing that converts.',
  applicationName: 'CampaignSites.net',
  keywords: [
    'campaign landing pages',
    'conversion optimization',
    'utm builder',
    'marketing tools',
    'copywriting',
    'case studies',
    'countdown timer',
    'budget calculator',
    'copy optimizer',
  ],
  authors: [{ name: 'CampaignSites.net', url: 'https://campaignsites.net' }],
  creator: 'CampaignSites.net',
  publisher: 'CampaignSites.net',
  alternates: {
    canonical: 'https://campaignsites.net',
  },
  openGraph: {
    type: 'website',
    url: 'https://campaignsites.net',
    title: 'CampaignSites.net — Campaign Landing Page Tools & Resources',
    description:
      'Free campaign tools, real-world landing page case studies, and actionable playbooks to build marketing that converts.',
    siteName: 'CampaignSites.net',
    locale: 'en_US',
    images: [
      {
        url: '/og?title=CampaignSites.net&subtitle=Campaign%20tools%20for%20teams%20that%20ship',
        width: 1200,
        height: 630,
        alt: 'CampaignSites.net',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@campaignsites',
    title: 'CampaignSites.net — Campaign Landing Page Tools & Resources',
    description:
      'Free campaign tools, real-world landing page case studies, and actionable playbooks to build marketing that converts.',
    images: ['/og?title=CampaignSites.net&subtitle=Campaign%20tools%20for%20teams%20that%20ship'],
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${displayFont.variable} font-sans antialiased text-ink-900`}>
        <Header />
        <UTMTracker />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Footer />
        <CookieNotice />
        <AnalyticsScripts />
      </body>
    </html>
  )
}
