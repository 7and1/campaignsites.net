import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { JsonLd } from '@/components'
import Link from 'next/link'
import { ArrowLeft, Target, Timer, Calculator, Sparkles, Wand2, Image } from 'lucide-react'

// Tool variant configurations for programmatic SEO
const toolVariants: Record<string, Record<string, {
  title: string
  headline: string
  description: string
  useCase: string
  benefits: string[]
  keywords: string[]
  icon: typeof Target
  ctaText: string
}>> = {
  'utm-builder': {
    'for-google-ads': {
      title: 'UTM Builder for Google Ads | CampaignSites.net',
      headline: 'Build UTM URLs for Google Ads Campaigns',
      description: 'Create trackable UTM links specifically optimized for Google Ads campaigns. Track keywords, ad groups, and campaign performance with precision.',
      useCase: 'Perfect for PPC managers who need granular tracking across multiple ad groups and keyword variations. Google Ads campaigns require precise UTM tracking to measure Quality Score impact, keyword performance, and ad group effectiveness. This specialized builder pre-fills utm_source=google and utm_medium=cpc, following Google Analytics best practices. Track which keywords drive conversions, compare ad group performance, and identify your most profitable campaigns. Essential for agencies managing multiple client accounts who need consistent naming conventions.',
      benefits: [
        'Auto-generates term parameter from keywords',
        'Ad group tracking with content parameter',
        'Campaign naming conventions for Google Ads',
        'Bulk URL generation for ad variations',
      ],
      keywords: ['google ads utm', 'utm builder google ads', 'google ads tracking', 'ppc utm parameters'],
      icon: Target,
      ctaText: 'Build Google Ads UTM Links',
    },
    'for-facebook-ads': {
      title: 'UTM Builder for Facebook Ads | CampaignSites.net',
      headline: 'UTM URL Builder for Facebook & Instagram Ads',
      description: 'Create UTM tracking links optimized for Meta advertising. Track ad sets, creative variations, and audience performance.',
      useCase: 'Ideal for social media managers running Facebook and Instagram ad campaigns with multiple creatives. Meta advertising requires tracking across campaigns, ad sets, and individual ads to optimize your budget allocation. This builder helps you identify which audiences convert best, which creative formats drive engagement, and which placements deliver the lowest CPA. Pre-configured with utm_source=facebook and utm_medium=social, making it easy to segment your Meta traffic from other channels in Google Analytics.',
      benefits: [
        'Ad set tracking with content parameter',
        'Creative variant identification',
        'Audience segment tracking',
        'Platform-specific naming conventions',
      ],
      keywords: ['facebook utm builder', 'meta ads tracking', 'instagram utm', 'facebook ads utm parameters'],
      icon: Target,
      ctaText: 'Build Meta Ads UTM Links',
    },
    'for-email-campaigns': {
      title: 'UTM Builder for Email Campaigns | CampaignSites.net',
      headline: 'Email Marketing UTM Link Builder',
      description: 'Build UTM URLs for email newsletters and campaigns. Track subscriber engagement, link clicks, and campaign ROI.',
      useCase: 'Essential for email marketers tracking newsletter performance and subscriber behavior. Email campaigns need detailed link tracking to understand which content resonates with subscribers. Track newsletter issues, promotional campaigns, and automated sequences separately. Identify which links in your emails drive the most clicks and conversions. Perfect for Mailchimp, ConvertKit, and ActiveCampaign users who want to connect email metrics with website analytics and revenue data.',
      benefits: [
        'Newsletter issue tracking',
        'Link position tracking',
        'Subscriber segment identification',
        'A/B test variant tracking',
      ],
      keywords: ['email utm builder', 'newsletter tracking', 'email campaign utm', 'mailchimp utm'],
      icon: Target,
      ctaText: 'Build Email UTM Links',
    },
    'for-influencer-marketing': {
      title: 'UTM Builder for Influencer Marketing | CampaignSites.net',
      headline: 'Influencer Campaign UTM Link Generator',
      description: 'Create unique tracking links for influencer partnerships and sponsored content. Measure ROI from each creator and platform.',
      useCase: 'Built for brands managing multiple influencer partnerships who need to track performance by creator, platform, and content type. Influencer marketing requires granular tracking to calculate true ROI and identify your best-performing partnerships. Generate unique links for each influencer to track their traffic, conversions, and revenue contribution. Compare performance across TikTok, Instagram, and YouTube creators. Essential for brands spending $10k+ monthly on influencer campaigns who need data-driven partnership decisions.',
      benefits: [
        'Creator-specific link tracking',
        'Platform performance comparison',
        'Sponsored post identification',
        'Affiliate commission tracking',
      ],
      keywords: ['influencer utm tracking', 'creator campaign links', 'influencer marketing analytics', 'sponsored content tracking'],
      icon: Target,
      ctaText: 'Build Influencer UTM Links',
    },
    'for-affiliate-links': {
      title: 'UTM Builder for Affiliate Links | CampaignSites.net',
      headline: 'Affiliate Marketing UTM Link Builder',
      description: 'Build trackable UTM links for affiliate campaigns. Monitor partner performance and optimize commission structures.',
      useCase: 'Designed for affiliate managers tracking multiple partners across different channels and promotional methods. Affiliate programs need detailed tracking beyond basic referral codes to understand which partners drive quality traffic. Track affiliate performance by partner, promotional method, and content type. Identify which affiliates generate the highest lifetime value customers. Perfect for SaaS companies, e-commerce brands, and digital product creators managing 10+ affiliate partners who need performance-based optimization.',
      benefits: [
        'Partner-specific tracking codes',
        'Promotional method identification',
        'Commission tier tracking',
        'Content type segmentation',
      ],
      keywords: ['affiliate utm builder', 'partner tracking links', 'affiliate marketing utm', 'referral link tracking'],
      icon: Target,
      ctaText: 'Build Affiliate UTM Links',
    },
    'for-qr-codes': {
      title: 'UTM Builder for QR Codes | CampaignSites.net',
      headline: 'QR Code Campaign UTM Link Generator',
      description: 'Create trackable URLs for QR code campaigns. Measure offline-to-online conversion from print, packaging, and events.',
      useCase: 'Perfect for marketers bridging offline and online campaigns through QR codes on packaging, print ads, and event materials. QR codes connect physical marketing to digital analytics, but only with proper UTM tracking. Track which locations, materials, and campaigns drive scans and conversions. Compare performance across restaurant menus, product packaging, billboard ads, and trade show materials. Essential for retail brands, restaurants, and event marketers measuring offline marketing ROI.',
      benefits: [
        'Location-based tracking',
        'Material type identification',
        'Offline campaign measurement',
        'Print ad performance tracking',
      ],
      keywords: ['qr code utm tracking', 'offline marketing analytics', 'qr campaign tracking', 'print to digital tracking'],
      icon: Target,
      ctaText: 'Build QR Code UTM Links',
    },
    'for-print-ads': {
      title: 'UTM Builder for Print Ads | CampaignSites.net',
      headline: 'Print Advertising UTM Link Builder',
      description: 'Track print advertising performance with custom UTM links. Measure magazine, newspaper, and direct mail campaign ROI.',
      useCase: 'Built for brands running print advertising who need to measure digital response from offline media. Print advertising traditionally lacks attribution, but custom URLs with UTM parameters solve this problem. Track which publications, ad sizes, and placements drive website traffic and conversions. Compare magazine vs newspaper performance, test different call-to-action URLs, and calculate true print advertising ROI. Essential for brands spending $50k+ annually on print media who need performance data.',
      benefits: [
        'Publication-specific tracking',
        'Ad placement identification',
        'Issue date tracking',
        'Print-to-digital attribution',
      ],
      keywords: ['print ad tracking', 'magazine utm links', 'newspaper campaign tracking', 'direct mail utm'],
      icon: Target,
      ctaText: 'Build Print Ad UTM Links',
    },
    'for-events': {
      title: 'UTM Builder for Events | CampaignSites.net',
      headline: 'Event Marketing UTM Link Generator',
      description: 'Create tracking links for conferences, trade shows, and virtual events. Measure attendee engagement and post-event conversions.',
      useCase: 'Designed for event marketers tracking attendee behavior across registration, attendance, and post-event engagement. Event marketing requires tracking multiple touchpoints from initial promotion through post-event follow-up. Generate unique links for event registration pages, sponsor materials, speaker presentations, and follow-up emails. Track which promotional channels drive registrations, which sessions generate the most interest, and which attendees convert to customers. Perfect for B2B companies attending 5+ events annually who need event ROI data.',
      benefits: [
        'Event-specific campaign tracking',
        'Session and speaker identification',
        'Attendee segment tracking',
        'Post-event engagement measurement',
      ],
      keywords: ['event utm tracking', 'conference marketing links', 'trade show analytics', 'event campaign tracking'],
      icon: Target,
      ctaText: 'Build Event UTM Links',
    },
  },
  'countdown': {
    'for-black-friday': {
      title: 'Black Friday Countdown Timer | CampaignSites.net',
      headline: 'Black Friday Sale Countdown Generator',
      description: 'Create urgency-driven countdown timers for Black Friday and Cyber Monday sales. Boost conversions with scarcity marketing.',
      useCase: 'Essential for e-commerce stores running Black Friday promotions who need to maximize urgency and conversions during the biggest shopping event of the year. Black Friday shoppers expect limited-time deals, and countdown timers validate that urgency. Display time remaining until your sale ends to reduce cart abandonment and increase average order value. Perfect for Shopify, WooCommerce, and BigCommerce stores processing $50k+ in Black Friday revenue. Track which products benefit most from countdown urgency and optimize your promotional strategy.',
      benefits: [
        'Black Friday themed presets',
        'Flash sale countdowns',
        'Early access timer embeds',
        'Cart countdown urgency',
      ],
      keywords: ['black friday countdown', 'sale countdown timer', 'cyber monday timer', 'flash sale countdown'],
      icon: Timer,
      ctaText: 'Create Black Friday Timer',
    },
    'for-product-launches': {
      title: 'Product Launch Countdown | CampaignSites.net',
      headline: 'Product Launch Countdown Timer Generator',
      description: 'Build anticipation with product launch countdown timers. Perfect for SaaS releases, course launches, and new product announcements.',
      useCase: 'Perfect for product teams building pre-launch hype and collecting early signups before your official release date. Product launches need momentum, and countdown timers create anticipation that converts to day-one sales. Display time until launch on your coming soon page, in email campaigns, and across social media. Ideal for SaaS companies, mobile apps, and physical product brands launching to existing audiences. Generate urgency for early-bird pricing and limited launch bonuses that expire when the timer hits zero.',
      benefits: [
        'Launch date countdown',
        'Waitlist signup integration',
        'Teaser campaign timers',
        'Early bird deadline tracking',
      ],
      keywords: ['product launch countdown', 'launch timer widget', 'coming soon countdown', 'release date timer'],
      icon: Timer,
      ctaText: 'Create Launch Countdown',
    },
    'for-webinars': {
      title: 'Webinar Countdown Timer | CampaignSites.net',
      headline: 'Live Webinar & Event Countdown Timer',
      description: 'Create countdown timers for webinars, live events, and virtual summits. Increase registration and attendance rates.',
      useCase: 'Ideal for webinar hosts who want to increase registrations and reduce no-show rates through strategic urgency placement. Webinars suffer from 40-60% no-show rates, but countdown timers on confirmation pages reduce this significantly. Display time until the webinar starts to remind registrants and create commitment. Perfect for B2B companies, course creators, and consultants running weekly webinars. Add countdown timers to registration pages, confirmation emails, and reminder sequences for maximum attendance.',
      benefits: [
        'Registration deadline timers',
        'Live event countdowns',
        'Replay availability timers',
        'Timezone-aware displays',
      ],
      keywords: ['webinar countdown timer', 'event countdown', 'live stream timer', 'virtual event countdown'],
      icon: Timer,
      ctaText: 'Create Webinar Timer',
    },
    'for-flash-sales': {
      title: 'Flash Sale Countdown Timer | CampaignSites.net',
      headline: 'Flash Sale Urgency Timer Generator',
      description: 'Create high-urgency countdown timers for flash sales and limited-time offers. Drive immediate action with authentic scarcity.',
      useCase: 'Built for e-commerce brands running short-duration flash sales that require immediate customer action. Flash sales lasting 2-24 hours need visible countdown timers to communicate urgency and prevent procrastination. Display hours, minutes, and seconds remaining to create psychological pressure that drives purchases. Essential for fashion retailers, electronics stores, and daily deal sites where timing determines conversion rates. Combine with inventory counters for maximum urgency and conversion lift.',
      benefits: [
        'Hour and minute precision',
        'High-contrast urgency design',
        'Mobile cart optimization',
        'Automatic expiration handling',
      ],
      keywords: ['flash sale countdown', 'limited time offer timer', 'urgent sale countdown', 'hourly deal timer'],
      icon: Timer,
      ctaText: 'Create Flash Sale Timer',
    },
    'for-course-enrollment': {
      title: 'Course Enrollment Countdown Timer | CampaignSites.net',
      headline: 'Course Registration Deadline Timer',
      description: 'Drive course enrollments with countdown timers showing registration deadline. Perfect for cohort-based courses and bootcamps.',
      useCase: 'Designed for online course creators and educators running cohort-based programs with fixed enrollment deadlines. Course launches with open-close enrollment windows convert better with visible countdown timers showing time remaining. Display days and hours until enrollment closes to motivate fence-sitters and reduce decision paralysis. Perfect for $500+ courses, bootcamps, and certification programs with limited cohort sizes. Increase enrollment conversion rates by 15-25% with strategic timer placement on sales pages.',
      benefits: [
        'Enrollment deadline tracking',
        'Cohort start date display',
        'Early-bird pricing timers',
        'Payment plan deadline tracking',
      ],
      keywords: ['course enrollment countdown', 'registration deadline timer', 'cohort launch countdown', 'bootcamp enrollment timer'],
      icon: Timer,
      ctaText: 'Create Enrollment Timer',
    },
    'for-event-registration': {
      title: 'Event Registration Countdown Timer | CampaignSites.net',
      headline: 'Event Ticket Deadline Countdown',
      description: 'Increase event registrations with countdown timers for conferences, workshops, and meetups. Drive early-bird ticket sales.',
      useCase: 'Perfect for event organizers selling tickets with early-bird pricing tiers and registration deadlines. Events with tiered pricing need countdown timers to communicate when prices increase and when registration closes. Display time remaining for early-bird rates to drive immediate purchases and improve cash flow. Ideal for conferences, workshops, and networking events with 100+ attendees. Reduce last-minute registration chaos by creating urgency for advance ticket purchases.',
      benefits: [
        'Early-bird deadline tracking',
        'Price tier transitions',
        'Capacity limit warnings',
        'Multi-event support',
      ],
      keywords: ['event registration countdown', 'ticket deadline timer', 'early bird countdown', 'conference registration timer'],
      icon: Timer,
      ctaText: 'Create Event Timer',
    },
    'for-limited-offers': {
      title: 'Limited Offer Countdown Timer | CampaignSites.net',
      headline: 'Limited-Time Offer Countdown Generator',
      description: 'Create authentic urgency for limited-time promotions and special offers. Increase conversion rates with deadline pressure.',
      useCase: 'Built for marketers running time-limited promotions who need to communicate authentic scarcity without damaging trust. Limited offers work when deadlines are real and enforced, making countdown timers essential for credibility. Display time remaining for special pricing, bonus packages, or exclusive access to create fear of missing out. Perfect for SaaS trials, service promotions, and membership launches. Never reset or extend timers, as this destroys trust and trains customers to ignore future deadlines.',
      benefits: [
        'Flexible duration settings',
        'Authentic deadline enforcement',
        'Offer expiration handling',
        'Trust-building design',
      ],
      keywords: ['limited offer countdown', 'special offer timer', 'promotional countdown', 'deadline timer'],
      icon: Timer,
      ctaText: 'Create Limited Offer Timer',
    },
    'for-seasonal-sales': {
      title: 'Seasonal Sale Countdown Timer | CampaignSites.net',
      headline: 'Seasonal Campaign Countdown Generator',
      description: 'Create countdown timers for seasonal sales, holiday promotions, and quarterly campaigns. Drive seasonal shopping urgency.',
      useCase: 'Designed for retailers and e-commerce brands running seasonal promotions tied to holidays, weather changes, and shopping seasons. Seasonal sales benefit from countdown timers that communicate when the season or promotion ends. Display time remaining for spring clearance, summer sales, back-to-school promotions, and holiday shopping events. Perfect for fashion retailers, home goods stores, and seasonal product brands. Plan quarterly campaigns with countdown timers that create urgency without feeling manipulative.',
      benefits: [
        'Seasonal design templates',
        'Holiday-specific presets',
        'Quarter-end tracking',
        'Weather-based campaigns',
      ],
      keywords: ['seasonal sale countdown', 'holiday promotion timer', 'quarterly sale countdown', 'seasonal marketing timer'],
      icon: Timer,
      ctaText: 'Create Seasonal Timer',
    },
  },
  'budget-calc': {
    'for-ecommerce': {
      title: 'E-commerce Budget Calculator | CampaignSites.net',
      headline: 'E-commerce Advertising Budget Calculator',
      description: 'Calculate optimal ad spend for e-commerce campaigns. Estimate ROAS, CPA, and profit margins for online stores.',
      useCase: 'Built for e-commerce marketers planning ad budgets for Shopify, WooCommerce, and online stores who need to forecast profitability before spending. E-commerce advertising requires understanding product margins, average order value, and return on ad spend to avoid unprofitable campaigns. Calculate how much to spend on Google Shopping, Facebook Dynamic Ads, and retargeting to hit revenue targets. Essential for stores doing $100k+ monthly revenue who need data-driven budget allocation across channels. Factor in seasonal trends, customer lifetime value, and repeat purchase rates for accurate forecasting.',
      benefits: [
        'ROAS goal calculator',
        'Product margin integration',
        'Seasonal budget planning',
        'Multi-channel allocation',
      ],
      keywords: ['ecommerce budget calculator', 'shopify ad budget', 'roas calculator', 'online store marketing budget'],
      icon: Calculator,
      ctaText: 'Calculate E-commerce Budget',
    },
    'for-saas': {
      title: 'SaaS Marketing Budget Calculator | CampaignSites.net',
      headline: 'SaaS Customer Acquisition Budget Calculator',
      description: 'Plan your SaaS marketing budget with CAC and LTV calculations. Optimize spend for trial signups and paid conversions.',
      useCase: 'Designed for SaaS founders and growth marketers optimizing customer acquisition costs while maintaining healthy unit economics. SaaS businesses need to balance customer acquisition cost against lifetime value to achieve sustainable growth. Calculate how much to spend acquiring trial users, factor in trial-to-paid conversion rates, and model the impact of churn on profitability. Perfect for B2B SaaS companies with $50-500 MRR plans who need to scale efficiently. Understand payback period and ensure CAC stays below 3x LTV for investor-ready metrics.',
      benefits: [
        'CAC to LTV ratio analysis',
        'Trial-to-paid conversion modeling',
        'Churn-aware budget planning',
        'MRR impact forecasting',
      ],
      keywords: ['saas budget calculator', 'cac calculator', 'saas marketing budget', 'customer acquisition cost'],
      icon: Calculator,
      ctaText: 'Calculate SaaS Budget',
    },
    'for-local-business': {
      title: 'Local Business Ad Budget Calculator | CampaignSites.net',
      headline: 'Local Business Marketing Budget Calculator',
      description: 'Plan ad spend for local businesses and service areas. Calculate cost per call, direction requests, and store visits.',
      useCase: 'Perfect for local businesses, franchises, and service-area businesses planning geo-targeted campaigns with limited budgets. Local advertising requires tracking phone calls, direction requests, and in-store visits rather than just website conversions. Calculate budget needed to generate target customer volume across Google Local Services Ads, Facebook local awareness campaigns, and Nextdoor advertising. Ideal for restaurants, home services, medical practices, and retail stores serving specific geographic areas. Factor in seasonal demand and local competition for accurate forecasting.',
      benefits: [
        'Local search budget planning',
        'Service area targeting costs',
        'Call tracking integration',
        'Store visit estimation',
      ],
      keywords: ['local business marketing budget', 'small business ad calculator', 'local seo budget', 'google local ads budget'],
      icon: Calculator,
      ctaText: 'Calculate Local Budget',
    },
    'for-startups': {
      title: 'Startup Marketing Budget Calculator | CampaignSites.net',
      headline: 'Startup Growth Budget Calculator',
      description: 'Calculate marketing budget for early-stage startups. Balance growth goals with runway and investor expectations.',
      useCase: 'Built for startup founders allocating limited resources between product development and customer acquisition. Early-stage startups need to prove product-market fit while managing burn rate and extending runway. Calculate minimum viable marketing spend to test channels, gather data, and validate acquisition strategies before scaling. Perfect for pre-seed and seed-stage companies with $500k-2M in funding who need to demonstrate traction. Balance experimentation budget with proven channel investment for sustainable growth.',
      benefits: [
        'Runway-aware budget planning',
        'Channel testing allocation',
        'Burn rate optimization',
        'Investor metric tracking',
      ],
      keywords: ['startup marketing budget', 'early stage budget calculator', 'startup growth budget', 'founder budget planning'],
      icon: Calculator,
      ctaText: 'Calculate Startup Budget',
    },
    'for-agencies': {
      title: 'Agency Client Budget Calculator | CampaignSites.net',
      headline: 'Marketing Agency Budget Planning Tool',
      description: 'Calculate client campaign budgets with agency fees and management costs. Optimize spend allocation across multiple clients.',
      useCase: 'Designed for marketing agencies managing multiple client budgets who need to demonstrate ROI and justify management fees. Agencies must balance client ad spend with management fees, reporting costs, and profit margins while delivering results. Calculate optimal budget allocation across clients, factor in agency overhead, and forecast client profitability. Essential for agencies managing $50k+ monthly client spend who need transparent budget breakdowns. Show clients exactly how their budget is allocated and what results to expect.',
      benefits: [
        'Management fee calculator',
        'Multi-client budget allocation',
        'Profitability forecasting',
        'Client reporting metrics',
      ],
      keywords: ['agency budget calculator', 'client budget planning', 'marketing agency calculator', 'agency profitability tool'],
      icon: Calculator,
      ctaText: 'Calculate Agency Budget',
    },
    'for-b2b': {
      title: 'B2B Marketing Budget Calculator | CampaignSites.net',
      headline: 'B2B Lead Generation Budget Calculator',
      description: 'Calculate B2B marketing budget based on pipeline goals and sales cycle length. Optimize for qualified lead generation.',
      useCase: 'Perfect for B2B companies with long sales cycles who need to work backward from revenue goals to marketing budget. B2B marketing requires understanding lead-to-opportunity conversion rates, average deal size, and sales cycle length to calculate required marketing investment. Factor in multiple touchpoints, nurture campaigns, and sales enablement costs. Ideal for companies with $50k+ average contract value and 3-12 month sales cycles. Align marketing spend with sales capacity and pipeline velocity for realistic forecasting.',
      benefits: [
        'Pipeline-based budget planning',
        'Sales cycle integration',
        'MQL to SQL conversion modeling',
        'Deal size optimization',
      ],
      keywords: ['b2b marketing budget', 'pipeline budget calculator', 'b2b lead gen budget', 'enterprise marketing budget'],
      icon: Calculator,
      ctaText: 'Calculate B2B Budget',
    },
    'for-lead-generation': {
      title: 'Lead Generation Budget Calculator | CampaignSites.net',
      headline: 'Lead Gen Campaign Budget Calculator',
      description: 'Calculate cost per lead and budget requirements for lead generation campaigns. Optimize for qualified lead volume.',
      useCase: 'Essential for B2B marketers and agencies planning lead generation campaigns who need to hit monthly lead volume targets. Lead generation campaigns require balancing lead quantity with lead quality to feed sales teams effectively. Calculate budget needed to generate target lead volume, factor in lead qualification costs, and model sales conversion rates. Perfect for companies generating 100+ leads monthly who need predictable pipeline. Optimize spend across content marketing, paid ads, and lead magnets for lowest cost per qualified lead.',
      benefits: [
        'Cost per lead estimation',
        'Lead quality scoring budget',
        'Sales funnel stage allocation',
        'MQL to SQL conversion rates',
      ],
      keywords: ['lead gen budget calculator', 'cost per lead calculator', 'b2b marketing budget', 'lead generation roi'],
      icon: Calculator,
      ctaText: 'Calculate Lead Gen Budget',
    },
    'for-brand-awareness': {
      title: 'Brand Awareness Budget Calculator | CampaignSites.net',
      headline: 'Brand Campaign Budget Planning Tool',
      description: 'Calculate budget for brand awareness campaigns. Estimate reach, impressions, and brand lift from awareness spend.',
      useCase: 'Built for brand marketers running awareness campaigns who need to justify spend without direct conversion attribution. Brand awareness campaigns focus on reach, frequency, and brand lift rather than immediate conversions. Calculate budget needed to achieve target impressions, estimate brand recall lift, and model long-term impact on consideration. Perfect for established brands with $100k+ quarterly awareness budgets who need to balance performance and brand marketing. Track assisted conversions and brand search volume to measure awareness campaign effectiveness.',
      benefits: [
        'Reach and frequency planning',
        'Brand lift estimation',
        'Impression goal calculator',
        'Awareness-to-consideration modeling',
      ],
      keywords: ['brand awareness budget', 'brand campaign calculator', 'awareness marketing budget', 'brand lift calculator'],
      icon: Calculator,
      ctaText: 'Calculate Brand Budget',
    },
  },
  'copy-optimizer': {
    'for-headlines': {
      title: 'Headline Optimizer & Analyzer | CampaignSites.net',
      headline: 'AI Headline Analyzer & Score Tool',
      description: 'Analyze and optimize your headlines for higher click-through rates. Get AI-powered suggestions for compelling titles.',
      useCase: 'Copywriters and marketers who want data-driven headline improvements for ads and content. Headlines are the most important element of any marketing asset, determining whether people engage or scroll past. Analyze emotional triggers, power words, and length optimization to create headlines that stop the scroll. Perfect for content marketers, copywriters, and growth teams testing dozens of headline variations. Use AI-powered scoring to predict which headlines will perform best before running expensive A/B tests. Improve click-through rates by 50-200% with strategic headline optimization.',
      benefits: [
        'Emotional trigger analysis',
        'Length optimization scoring',
        'Power word suggestions',
        'A/B test variant generation',
      ],
      keywords: ['headline analyzer', 'headline optimizer', 'title generator', 'copy analysis tool'],
      icon: Sparkles,
      ctaText: 'Optimize Headlines',
    },
    'for-ctas': {
      title: 'CTA Button Copy Optimizer | CampaignSites.net',
      headline: 'Call-to-Action Button Text Optimizer',
      description: 'Optimize your CTA button copy for higher conversion rates. Test action-oriented language that drives clicks.',
      useCase: 'Conversion optimizers and UX designers improving button copy for landing pages and checkout flows. CTA buttons are the final step before conversion, making word choice critical to success. Analyze action verbs, urgency triggers, and benefit-focused language to create CTAs that convert. Perfect for e-commerce stores, SaaS companies, and lead generation campaigns where button copy directly impacts revenue. Test first-person vs second-person language, specific vs generic copy, and friction-reducing phrases. Increase conversion rates by 20-90% with optimized CTA copy.',
      benefits: [
        'Action verb analysis',
        'Urgency trigger suggestions',
        'Button length optimization',
        'High-converting CTA templates',
      ],
      keywords: ['cta optimizer', 'button copy analyzer', 'call to action generator', 'conversion copywriting'],
      icon: Sparkles,
      ctaText: 'Optimize CTA Buttons',
    },
    'for-email-subject-lines': {
      title: 'Email Subject Line Optimizer | CampaignSites.net',
      headline: 'Email Subject Line Analyzer & Tester',
      description: 'Optimize email subject lines for higher open rates. Avoid spam triggers and increase engagement.',
      useCase: 'Email marketers looking to improve open rates and avoid the promotions tab in Gmail. Subject lines determine whether your emails get opened or ignored, making them the highest-leverage element of email marketing. Analyze spam triggers, personalization opportunities, and curiosity gaps to create subject lines that get opened. Perfect for newsletter publishers, e-commerce brands, and B2B companies sending 10k+ emails monthly. Test emoji usage, length optimization, and preview text integration. Improve open rates by 15-40% with data-driven subject line optimization.',
      benefits: [
        'Spam trigger detection',
        'Open rate prediction',
        'Personalization suggestions',
        'Emoji optimization',
      ],
      keywords: ['subject line optimizer', 'email subject analyzer', 'open rate improver', 'email copy tool'],
      icon: Sparkles,
      ctaText: 'Optimize Subject Lines',
    },
    'for-ad-copy': {
      title: 'Ad Copy Optimizer | CampaignSites.net',
      headline: 'Google & Facebook Ad Copy Analyzer',
      description: 'Optimize ad copy for Google Ads and Facebook campaigns. Improve Quality Score and relevance.',
      useCase: 'PPC specialists looking to improve ad relevance scores and click-through rates across paid channels. Ad copy directly impacts Quality Score, ad rank, and cost per click in Google Ads. Analyze keyword integration, character limits, and ad extension opportunities to create high-performing ad copy. Perfect for agencies and in-house teams managing $50k+ monthly ad spend who need to maximize ROI. Test different value propositions, calls-to-action, and benefit statements. Reduce CPC by 20-40% and increase CTR by 50-100% with optimized ad copy.',
      benefits: [
        'Quality Score optimization',
        'Character limit checking',
        'Keyword integration analysis',
        'Ad extension suggestions',
      ],
      keywords: ['ad copy optimizer', 'google ads copy analyzer', 'facebook ad text tool', 'ppc copywriting'],
      icon: Sparkles,
      ctaText: 'Optimize Ad Copy',
    },
    'for-landing-pages': {
      title: 'Landing Page Copy Optimizer | CampaignSites.net',
      headline: 'Landing Page Copywriting Analyzer',
      description: 'Optimize landing page copy for higher conversion rates. Analyze headlines, subheads, and body copy effectiveness.',
      useCase: 'Conversion copywriters and marketers optimizing landing page copy for paid traffic campaigns. Landing pages need persuasive copy that moves visitors from awareness to action through strategic messaging. Analyze value proposition clarity, benefit-focused language, and objection handling to create high-converting pages. Perfect for companies spending $10k+ monthly on paid traffic who need to maximize conversion rates. Test different copy frameworks, message hierarchy, and social proof placement. Increase landing page conversion rates by 30-150% with strategic copy optimization.',
      benefits: [
        'Value proposition analysis',
        'Benefit vs feature scoring',
        'Objection handling suggestions',
        'Copy hierarchy optimization',
      ],
      keywords: ['landing page copy optimizer', 'conversion copywriting tool', 'landing page analyzer', 'copy effectiveness tool'],
      icon: Sparkles,
      ctaText: 'Optimize Landing Page Copy',
    },
    'for-product-descriptions': {
      title: 'Product Description Optimizer | CampaignSites.net',
      headline: 'E-commerce Product Copy Analyzer',
      description: 'Optimize product descriptions for higher conversion rates and SEO. Create compelling copy that sells.',
      useCase: 'E-commerce copywriters and merchandisers creating product descriptions that convert browsers into buyers. Product descriptions must balance SEO requirements with persuasive copywriting to drive sales. Analyze feature-to-benefit translation, sensory language, and buyer objection handling to create descriptions that sell. Perfect for Shopify and WooCommerce stores with 100+ products who need scalable copywriting processes. Test different description lengths, formatting approaches, and call-to-action placement. Increase product page conversion rates by 20-60% with optimized descriptions.',
      benefits: [
        'Feature-to-benefit translation',
        'SEO keyword integration',
        'Sensory language analysis',
        'Buyer objection handling',
      ],
      keywords: ['product description optimizer', 'ecommerce copy tool', 'product copywriting analyzer', 'shopify description tool'],
      icon: Sparkles,
      ctaText: 'Optimize Product Descriptions',
    },
    'for-social-media': {
      title: 'Social Media Copy Optimizer | CampaignSites.net',
      headline: 'Social Media Post Copy Analyzer',
      description: 'Optimize social media copy for higher engagement. Analyze posts for platform-specific best practices.',
      useCase: 'Social media managers creating posts that drive engagement, clicks, and conversions across platforms. Social media copy needs to stop the scroll, create engagement, and drive action within character limits. Analyze hook effectiveness, hashtag strategy, and call-to-action placement for each platform. Perfect for brands posting 20+ times weekly who need consistent engagement. Test different post formats, emoji usage, and question-based hooks. Increase social media engagement rates by 40-120% with platform-optimized copy.',
      benefits: [
        'Platform-specific optimization',
        'Hook effectiveness analysis',
        'Hashtag strategy suggestions',
        'Engagement prediction scoring',
      ],
      keywords: ['social media copy optimizer', 'social post analyzer', 'instagram caption tool', 'social copywriting tool'],
      icon: Sparkles,
      ctaText: 'Optimize Social Copy',
    },
    'for-blog-titles': {
      title: 'Blog Title Optimizer | CampaignSites.net',
      headline: 'Blog Post Title Analyzer & Generator',
      description: 'Optimize blog titles for SEO and click-through rates. Create titles that rank and get clicked.',
      useCase: 'Content marketers and SEO specialists creating blog titles that rank in search and get clicked in results. Blog titles must balance keyword optimization with click-worthiness to drive organic traffic. Analyze title length, keyword placement, and emotional triggers to create titles that perform. Perfect for content teams publishing 4+ posts monthly who need to maximize organic reach. Test different title formulas, number usage, and power word integration. Increase organic click-through rates by 30-80% with optimized blog titles.',
      benefits: [
        'SEO keyword optimization',
        'Click-through rate prediction',
        'Title length optimization',
        'Power word integration',
      ],
      keywords: ['blog title optimizer', 'seo title generator', 'blog headline analyzer', 'content title tool'],
      icon: Sparkles,
      ctaText: 'Optimize Blog Titles',
    },
  },
  'ai-lab': {
    'for-campaign-naming': {
      title: 'AI Campaign Name Generator | CampaignSites.net',
      headline: 'Generate Creative Campaign Names with AI',
      description: 'Use AI to generate memorable, on-brand campaign names. Perfect for product launches, seasonal sales, and brand activations.',
      useCase: 'Marketing teams brainstorming campaign names that resonate with their target audience and align with brand guidelines. Campaign naming is critical for internal organization and external recognition. Generate creative names that are memorable, searchable, and convey campaign intent. Perfect for agencies managing multiple client campaigns who need consistent naming conventions. Test name variations for trademark availability, domain registration, and social media handles. Create campaign names that work across all marketing channels and resonate with target audiences.',
      benefits: [
        'Brand-aligned suggestions',
        'Industry-specific naming',
        'Domain availability hints',
        'Hashtag suggestions',
      ],
      keywords: ['campaign name generator', 'marketing campaign names', 'product launch names', 'brand campaign ideas'],
      icon: Wand2,
      ctaText: 'Generate Campaign Names',
    },
    'for-landing-page-analysis': {
      title: 'AI Landing Page Critique | CampaignSites.net',
      headline: 'Get AI Feedback on Your Landing Page',
      description: 'Submit your landing page for instant AI critique. Get actionable suggestions to improve conversion rates.',
      useCase: 'Marketers and designers seeking quick feedback before launching campaigns or spending on paid traffic. Landing pages are the foundation of digital campaigns, and small improvements can dramatically impact ROI. Get instant analysis of headline effectiveness, CTA placement, social proof usage, and mobile optimization. Perfect for teams launching new campaigns weekly who need fast feedback loops. Identify conversion blockers, trust issues, and messaging problems before spending thousands on traffic. Improve landing page conversion rates by 25-100% with AI-powered critique.',
      benefits: [
        'Conversion-focused analysis',
        'Above-the-fold review',
        'Mobile optimization tips',
        'Trust signal evaluation',
      ],
      keywords: ['landing page critique', 'landing page analyzer', 'conversion review', 'landing page feedback'],
      icon: Wand2,
      ctaText: 'Critique My Landing Page',
    },
    'for-ab-testing': {
      title: 'A/B Test Idea Generator | CampaignSites.net',
      headline: 'AI-Powered A/B Testing Ideas',
      description: 'Get data-driven A/B test ideas for your landing pages and campaigns. Prioritize tests with highest impact potential.',
      useCase: 'CRO specialists and growth marketers looking for their next high-impact test who have exhausted obvious optimization opportunities. A/B testing requires constant ideation to maintain optimization velocity and compound conversion improvements. Generate test ideas based on conversion best practices, industry benchmarks, and psychological principles. Perfect for teams running 2-4 tests monthly who need a pipeline of validated test hypotheses. Prioritize tests by potential impact, implementation difficulty, and statistical requirements. Increase testing velocity and compound conversion gains over time.',
      benefits: [
        'Element-specific test ideas',
        'Impact probability scoring',
        'Implementation difficulty rating',
        'Hypothesis generation',
      ],
      keywords: ['ab test ideas', 'split test generator', 'cro test ideas', 'landing page tests'],
      icon: Wand2,
      ctaText: 'Get A/B Test Ideas',
    },
    'for-conversion-optimization': {
      title: 'Conversion Optimization AI Assistant | CampaignSites.net',
      headline: 'AI-Powered Conversion Rate Optimization',
      description: 'Get AI-driven suggestions to improve conversion rates. Analyze funnels, identify friction, and optimize user experience.',
      useCase: 'Conversion rate optimization specialists analyzing funnels and identifying opportunities to reduce friction and increase conversions. CRO requires systematic analysis of user behavior, friction points, and psychological barriers to conversion. Get AI-powered recommendations for form optimization, checkout flow improvements, and trust signal placement. Perfect for e-commerce stores and SaaS companies with established traffic who need to maximize conversion efficiency. Identify quick wins and long-term optimization opportunities. Increase overall conversion rates by 50-200% through systematic optimization.',
      benefits: [
        'Funnel friction analysis',
        'Form optimization suggestions',
        'Trust signal recommendations',
        'Checkout flow improvements',
      ],
      keywords: ['conversion optimization ai', 'cro assistant', 'conversion rate optimizer', 'funnel optimization tool'],
      icon: Wand2,
      ctaText: 'Optimize Conversions',
    },
    'for-content-strategy': {
      title: 'AI Content Strategy Generator | CampaignSites.net',
      headline: 'Generate Content Marketing Strategy with AI',
      description: 'Create data-driven content strategies for your campaigns. Get topic ideas, content formats, and distribution plans.',
      useCase: 'Content marketers and strategists planning quarterly content calendars who need to align content with business goals. Content strategy requires understanding audience needs, search intent, and competitive landscape to create effective plans. Generate topic clusters, content formats, and distribution strategies based on industry trends and audience behavior. Perfect for B2B companies and content teams publishing 8+ pieces monthly who need strategic direction. Align content with buyer journey stages and business objectives. Increase organic traffic by 100-300% with strategic content planning.',
      benefits: [
        'Topic cluster generation',
        'Content format recommendations',
        'Distribution strategy planning',
        'Buyer journey alignment',
      ],
      keywords: ['content strategy ai', 'content planning tool', 'content marketing strategy', 'topic cluster generator'],
      icon: Wand2,
      ctaText: 'Generate Content Strategy',
    },
    'for-marketing-automation': {
      title: 'Marketing Automation AI Planner | CampaignSites.net',
      headline: 'AI-Powered Marketing Automation Strategy',
      description: 'Design marketing automation workflows with AI assistance. Create email sequences, lead nurturing, and customer journeys.',
      useCase: 'Marketing automation specialists designing workflows and sequences who need to map customer journeys effectively. Marketing automation requires strategic planning of touchpoints, triggers, and messaging to nurture leads efficiently. Generate workflow ideas, email sequence structures, and segmentation strategies based on customer behavior. Perfect for companies with 1000+ leads monthly who need to scale personalization. Design automation that feels personal while operating at scale. Increase lead-to-customer conversion rates by 40-100% with strategic automation.',
      benefits: [
        'Workflow design suggestions',
        'Email sequence planning',
        'Segmentation strategy',
        'Trigger-based automation ideas',
      ],
      keywords: ['marketing automation ai', 'automation workflow planner', 'email sequence generator', 'customer journey mapping'],
      icon: Wand2,
      ctaText: 'Plan Marketing Automation',
    },
  },
  'meta-preview': {
    'for-blog-posts': {
      title: 'Blog Post Meta Tag Preview | CampaignSites.net',
      headline: 'Preview Blog Post Meta Tags & Social Shares',
      description: 'Preview how your blog posts appear on Google, Facebook, Twitter, and LinkedIn. Optimize meta tags for maximum engagement.',
      useCase: 'Content marketers and bloggers optimizing meta tags to increase click-through rates from search and social media. Blog posts need compelling meta descriptions and social preview images to stand out in crowded feeds. Preview exactly how your post appears in Google search results, Facebook shares, Twitter cards, and LinkedIn posts before publishing. Perfect for content teams publishing 4+ posts weekly who need to maximize organic and social traffic. Test different title variations, description copy, and preview images. Increase social shares by 50-150% and organic CTR by 20-40% with optimized meta tags.',
      benefits: [
        'Google SERP preview',
        'Social platform previews',
        'Character count validation',
        'Image dimension checking',
      ],
      keywords: ['blog meta tags', 'blog post preview', 'social share preview', 'blog seo preview'],
      icon: Image,
      ctaText: 'Preview Blog Meta Tags',
    },
    'for-landing-pages': {
      title: 'Landing Page Meta Preview | CampaignSites.net',
      headline: 'Preview Landing Page Social Shares',
      description: 'Preview how your landing pages appear when shared on social media. Optimize for paid traffic and organic shares.',
      useCase: 'Performance marketers running paid traffic campaigns who need landing pages that look professional when shared. Landing pages shared on social media need compelling previews to build trust and increase click-through rates. Preview how your page appears when shared by customers, affiliates, or in retargeting ads. Perfect for companies spending $10k+ monthly on paid traffic who need every element optimized. Test different value propositions in meta descriptions and preview images that highlight key benefits. Increase social proof and trust signals through optimized meta tag presentation.',
      benefits: [
        'Paid traffic optimization',
        'Trust signal preview',
        'Share-worthy image testing',
        'Value proposition testing',
      ],
      keywords: ['landing page meta tags', 'landing page preview', 'social share optimization', 'paid traffic meta tags'],
      icon: Image,
      ctaText: 'Preview Landing Page Meta',
    },
    'for-ecommerce': {
      title: 'E-commerce Product Meta Preview | CampaignSites.net',
      headline: 'Preview Product Page Social Shares',
      description: 'Preview how your product pages appear on social media and search. Optimize for shopping feeds and social commerce.',
      useCase: 'E-commerce merchandisers optimizing product pages for Google Shopping, Facebook Shops, and social sharing. Product pages need rich meta tags with pricing, availability, and compelling images to drive sales. Preview how products appear in shopping feeds, social shares, and search results. Perfect for Shopify and WooCommerce stores with 100+ products who need consistent meta tag optimization. Test product images, pricing display, and promotional messaging in social previews. Increase product page traffic by 30-80% with optimized meta tags and rich snippets.',
      benefits: [
        'Shopping feed preview',
        'Product rich snippets',
        'Price and availability display',
        'Product image optimization',
      ],
      keywords: ['ecommerce meta tags', 'product page preview', 'shopping feed optimization', 'product meta preview'],
      icon: Image,
      ctaText: 'Preview Product Meta Tags',
    },
    'for-social-sharing': {
      title: 'Social Sharing Meta Tag Preview | CampaignSites.net',
      headline: 'Optimize Content for Social Media Sharing',
      description: 'Preview and optimize how your content appears when shared across all social platforms. Maximize engagement and clicks.',
      useCase: 'Social media managers and content creators optimizing content for maximum shareability and engagement across platforms. Content that gets shared needs compelling previews that stop the scroll and encourage clicks. Preview how your content appears on Facebook, Twitter, LinkedIn, Pinterest, and WhatsApp. Perfect for viral content creators, news publishers, and brands focused on organic social reach. Test different headlines, images, and descriptions for each platform. Increase social shares by 100-300% with platform-optimized meta tags.',
      benefits: [
        'Multi-platform preview',
        'Platform-specific optimization',
        'Viral content testing',
        'Engagement prediction',
      ],
      keywords: ['social sharing preview', 'social meta tags', 'viral content optimization', 'social media preview'],
      icon: Image,
      ctaText: 'Preview Social Sharing',
    },
    'for-news-articles': {
      title: 'News Article Meta Tag Preview | CampaignSites.net',
      headline: 'Preview News Article Social Shares & Search',
      description: 'Preview how news articles appear in Google News, social feeds, and aggregators. Optimize for maximum reach.',
      useCase: 'News publishers and journalists optimizing articles for Google News, Apple News, and social distribution. News articles need compelling headlines and images that work across multiple distribution channels. Preview how articles appear in news aggregators, social feeds, and search results. Perfect for digital publishers producing 10+ articles daily who need fast optimization workflows. Test headline variations, featured images, and article descriptions for maximum click-through. Increase article traffic by 50-200% with optimized meta tags and structured data.',
      benefits: [
        'Google News preview',
        'News aggregator optimization',
        'Breaking news formatting',
        'Article structured data',
      ],
      keywords: ['news article meta tags', 'google news preview', 'article seo preview', 'news meta optimization'],
      icon: Image,
      ctaText: 'Preview News Article Meta',
    },
    'for-portfolios': {
      title: 'Portfolio Meta Tag Preview | CampaignSites.net',
      headline: 'Preview Portfolio & Case Study Shares',
      description: 'Preview how your portfolio and case studies appear when shared. Optimize for client acquisition and social proof.',
      useCase: 'Freelancers, agencies, and creative professionals optimizing portfolio pages to attract clients through social sharing. Portfolio pages need compelling previews that showcase work quality and build credibility. Preview how case studies and project pages appear when shared by clients or in cold outreach. Perfect for designers, developers, and agencies who rely on portfolio shares for lead generation. Test different project images, client testimonials, and result-focused descriptions. Increase portfolio inquiries by 40-100% with optimized social previews.',
      benefits: [
        'Portfolio showcase optimization',
        'Case study preview',
        'Client testimonial display',
        'Work sample presentation',
      ],
      keywords: ['portfolio meta tags', 'case study preview', 'portfolio seo', 'creative portfolio optimization'],
      icon: Image,
      ctaText: 'Preview Portfolio Meta',
    },
  },
}

interface Props {
  params: Promise<{ slug: string; variant: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, variant } = await params
  const variantData = toolVariants[slug]?.[variant]

  if (!variantData) {
    return {
      title: 'Tool Not Found | CampaignSites.net',
    }
  }

  return {
    title: variantData.title,
    description: variantData.description,
    keywords: variantData.keywords,
    openGraph: {
      title: variantData.headline,
      description: variantData.description,
      url: `https://campaignsites.net/tools/${slug}/${variant}`,
      type: 'website',
    },
    alternates: {
      canonical: `https://campaignsites.net/tools/${slug}/${variant}`,
    },
  }
}

export async function generateStaticParams() {
  const params: { slug: string; variant: string }[] = []

  for (const [slug, variants] of Object.entries(toolVariants)) {
    for (const variant of Object.keys(variants)) {
      params.push({ slug, variant })
    }
  }

  return params
}

export default async function ToolVariantPage({ params }: Props) {
  const { slug, variant } = await params
  const variantData = toolVariants[slug]?.[variant]

  if (!variantData) {
    notFound()
  }

  const Icon = variantData.icon
  const toolUrl = `/tools/${slug}`

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: variantData.headline,
    description: variantData.description,
    url: `https://campaignsites.net/tools/${slug}/${variant}`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: variantData.benefits,
  }

  return (
    <>
      <JsonLd data={structuredData} />
      <main className="min-h-screen">
        <section className="bg-gradient-to-b from-mist-50 to-white py-16">
          <div className="mx-auto max-w-4xl px-6">
            <Link
              href={toolUrl}
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition hover:text-primary-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to tool
            </Link>

            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100">
                <Icon className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-ink-900 md:text-4xl">
                  {variantData.headline}
                </h1>
                <p className="mt-2 text-lg text-ink-600">{variantData.description}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-4xl px-6">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold text-ink-900">Use Case</h2>
                <p className="mt-3 text-ink-600">{variantData.useCase}</p>

                <h2 className="mt-8 text-xl font-semibold text-ink-900">Key Benefits</h2>
                <ul className="mt-4 space-y-3">
                  {variantData.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-600">
                        {index + 1}
                      </span>
                      <span className="text-ink-700">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Link
                    href={toolUrl}
                    className="inline-flex items-center justify-center rounded-full bg-primary-600 px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-primary-700"
                  >
                    {variantData.ctaText}
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-mist-200 bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-ink-900">Related Tools</h3>
                <ul className="mt-4 space-y-3">
                  {Object.entries(toolVariants[slug] || {})
                    .filter(([key]) => key !== variant)
                    .slice(0, 4)
                    .map(([key, data]) => (
                      <li key={key}>
                        <Link
                          href={`/tools/${slug}/${key}`}
                          className="text-sm text-ink-600 transition hover:text-primary-600"
                        >
                          {data.headline}
                        </Link>
                      </li>
                    ))}
                </ul>

                <div className="mt-6 border-t border-mist-200 pt-6">
                  <h3 className="font-semibold text-ink-900">Other Tools</h3>
                  <ul className="mt-4 space-y-2">
                    {Object.keys(toolVariants)
                      .filter((key) => key !== slug)
                      .slice(0, 3)
                      .map((key) => (
                        <li key={key}>
                          <Link
                            href={`/tools/${key}`}
                            className="text-sm capitalize text-ink-600 transition hover:text-primary-600"
                          >
                            {key.replace('-', ' ')}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
