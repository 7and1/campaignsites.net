# Architecture Documentation

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Diagram](#architecture-diagram)
- [Component Structure](#component-structure)
- [Data Flow](#data-flow)
- [API Architecture](#api-architecture)
- [Database Schema](#database-schema)
- [Caching Strategy](#caching-strategy)
- [Security Architecture](#security-architecture)
- [Deployment Architecture](#deployment-architecture)

## System Overview

CampaignSites.net is a modern, edge-optimized marketing resource platform built on Cloudflare's infrastructure. The application follows a serverless architecture pattern with edge computing capabilities.

### Key Characteristics

- **Framework**: Next.js 15 with App Router
- **Runtime**: Cloudflare Workers (V8 isolates)
- **Database**: Cloudflare D1 (SQLite at the edge)
- **Storage**: Cloudflare R2 (S3-compatible object storage)
- **CDN**: Cloudflare Pages with global edge network
- **CMS**: Payload CMS 3.72 (headless)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Browser │  │  Mobile  │  │   API    │  │  Crawler │       │
│  │   User   │  │   User   │  │  Client  │  │  (SEO)   │       │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘       │
└────────┼─────────────┼─────────────┼─────────────┼─────────────┘
         │             │             │             │
         └─────────────┴─────────────┴─────────────┘
                       │
         ┌─────────────▼─────────────────────────────────┐
         │     CLOUDFLARE GLOBAL EDGE NETWORK            │
         │  ┌──────────────────────────────────────┐     │
         │  │   CDN / Cache Layer                  │     │
         │  │   - Static Assets (immutable)        │     │
         │  │   - HTML Pages (stale-while-revalidate)│   │
         │  │   - Images (WebP/AVIF optimization)  │     │
         │  └──────────────┬───────────────────────┘     │
         └─────────────────┼───────────────────────────────┘
                           │
         ┌─────────────────▼───────────────────────────────┐
         │        APPLICATION LAYER (Workers)              │
         │  ┌──────────────────────────────────────────┐   │
         │  │  Next.js App (OpenNext Adapter)          │   │
         │  │  ┌────────────┐  ┌────────────┐         │   │
         │  │  │  Frontend  │  │  API Routes│         │   │
         │  │  │   Routes   │  │  /api/*    │         │   │
         │  │  └──────┬─────┘  └──────┬─────┘         │   │
         │  │         │                │               │   │
         │  │  ┌──────▼────────────────▼─────┐        │   │
         │  │  │   Server Actions            │        │   │
         │  │  │   - AI Lab                  │        │   │
         │  │  │   - Copy Analyzer           │        │   │
         │  │  │   - Search                  │        │   │
         │  │  └──────┬──────────────────────┘        │   │
         │  └─────────┼─────────────────────────────────┘ │
         └────────────┼─────────────────────────────────────┘
                      │
         ┌────────────▼─────────────────────────────────┐
         │         MIDDLEWARE LAYER                     │
         │  ┌────────────┐  ┌────────────┐             │
         │  │   CSRF     │  │  Security  │             │
         │  │ Protection │  │  Headers   │             │
         │  └────────────┘  └────────────┘             │
         │  ┌────────────┐  ┌────────────┐             │
         │  │Rate Limit  │  │ Monitoring │             │
         │  │   (KV)     │  │  & Logging │             │
         │  └────────────┘  └────────────┘             │
         └──────────────────────────────────────────────┘
                      │
         ┌────────────▼─────────────────────────────────┐
         │          DATA LAYER                          │
         │  ┌──────────────┐  ┌──────────────┐         │
         │  │  Payload CMS │  │  D1 Database │         │
         │  │  (Content)   │  │  (Analytics) │         │
         │  └──────┬───────┘  └──────┬───────┘         │
         │         │                  │                 │
         │  ┌──────▼───────┐  ┌──────▼───────┐         │
         │  │  R2 Storage  │  │  KV Store    │         │
         │  │  (Media)     │  │  (Cache)     │         │
         │  └──────────────┘  └──────────────┘         │
         └──────────────────────────────────────────────┘
                      │
         ┌────────────▼─────────────────────────────────┐
         │       EXTERNAL SERVICES                      │
         │  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
         │  │  OpenAI  │  │  Resend  │  │Analytics│   │
         │  │   API    │  │  Email   │  │  (CF)   │   │
         │  └──────────┘  └──────────┘  └──────────┘   │
         └──────────────────────────────────────────────┘
```

## Component Structure

### Frontend Architecture

```
src/app/(frontend)/
├── layout.tsx              # Root layout with providers
├── page.tsx                # Homepage
├── about/                  # Static pages
├── blog/                   # Blog listing & detail
│   └── [slug]/
├── gallery/                # Case studies
│   └── [slug]/
├── tools/                  # Tool pages
│   ├── page.tsx            # Tools directory
│   ├── [slug]/             # Dynamic tool routes
│   ├── utm-builder/        # UTM Builder tool
│   ├── budget-calc/        # Budget Calculator
│   ├── copy-optimizer/     # Copy Optimizer (AI)
│   ├── countdown/          # Countdown Timer
│   └── meta-preview/       # Meta Preview tool
└── affiliate-tools/        # Affiliate tool listings
```

### Component Hierarchy

```
App
├── Providers (Theme, State)
├── Header
│   ├── Navigation
│   └── GlobalSearch
├── Main Content
│   ├── Breadcrumbs
│   ├── Page Content
│   │   ├── Tool Components
│   │   │   ├── UTMBuilderClient
│   │   │   ├── BudgetCalcClient
│   │   │   ├── CopyOptimizerClient
│   │   │   └── CountdownClient
│   │   ├── Content Components
│   │   │   ├── RichTextContent
│   │   │   ├── TableOfContents
│   │   │   └── KeyTakeaways
│   │   └── Interactive Elements
│   │       ├── NewsletterForm
│   │       ├── UpvoteButton
│   │       └── ShareBar
│   └── Related Content
│       ├── RelatedTools
│       └── RelatedContent
├── Footer
│   ├── Newsletter Signup
│   └── Links
└── Global Components
    ├── CookieNotice
    ├── ExitIntentModal
    └── WebVitals
```

### API Architecture

```
src/app/api/
├── subscribe/              # Newsletter subscription
├── contact/                # Contact form
├── submit/                 # Case study submission
├── upvote/                 # Content upvoting
├── track/                  # Analytics tracking
├── health/                 # Health check endpoint
├── errors/                 # Error logging
├── vitals/                 # Web Vitals reporting
└── v1/                     # Versioned API
    ├── unsubscribe/        # Email unsubscribe
    ├── preferences/        # Email preferences
    ├── webhooks/           # Webhook handlers
    ├── email/              # Email tracking
    │   └── track/
    │       ├── open/       # Email open tracking
    │       └── click/      # Link click tracking
    ├── cron/               # Scheduled jobs
    │   └── jobs/
    └── admin/              # Admin endpoints
        └── db-optimize/    # Database optimization
```

## Data Flow

### Content Delivery Flow

```
1. User Request
   ↓
2. Cloudflare Edge (CDN)
   ├─→ Cache Hit? → Return Cached Response
   └─→ Cache Miss ↓
3. Next.js Worker
   ├─→ Static Page? → Generate & Cache
   ├─→ Dynamic Page? → Fetch from Payload CMS
   └─→ API Request? → Process & Return
4. Data Layer
   ├─→ Payload CMS (D1) → Content
   ├─→ D1 Database → Analytics
   ├─→ R2 Storage → Media
   └─→ KV Store → Cache/Rate Limits
5. Response
   ↓
6. Edge Cache (with TTL)
   ↓
7. Client
```

### Form Submission Flow

```
1. User submits form
   ↓
2. Client-side validation (Zod)
   ↓
3. CSRF token validation
   ↓
4. Rate limit check (KV)
   ├─→ Exceeded? → 429 Error
   └─→ OK ↓
5. Server-side validation
   ↓
6. Database write (D1)
   ↓
7. External service call (optional)
   ├─→ Resend (Email)
   └─→ OpenAI (AI features)
8. Response to client
   ↓
9. Analytics event tracking
```

### AI Processing Flow (Copy Optimizer)

```
1. User inputs copy
   ↓
2. Client validation
   ↓
3. Server Action invoked
   ↓
4. Rate limit check
   ↓
5. OpenAI API call
   ├─→ Model: gpt-4o-mini
   ├─→ System prompt
   └─→ User content
6. Response parsing
   ↓
7. Result formatting
   ↓
8. Return to client
   ↓
9. Track usage analytics
```

## Database Schema

### D1 Database (SQLite)

#### Payload CMS Tables (Auto-generated)

```sql
-- Collections
posts
case_studies
tools
media
payload_preferences
payload_migrations

-- Relationships
posts_rels
case_studies_rels
tools_rels
```

#### Analytics Tables

```sql
-- Analytics Events
CREATE TABLE analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,           -- 'page_view', 'tool_use', 'click'
  tool_slug TEXT,                     -- Tool identifier
  context TEXT,                       -- Additional context
  url TEXT,                           -- Page URL
  utm_source TEXT,                    -- UTM parameters
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  metadata TEXT,                      -- JSON metadata
  ip_hash TEXT,                       -- Hashed IP (privacy)
  user_agent TEXT,                    -- Browser info
  created_at TEXT DEFAULT (datetime('now'))
);

-- Newsletter Subscribers
CREATE TABLE newsletter_subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  lead_magnet TEXT,                   -- Which lead magnet they got
  source TEXT,                        -- Signup source
  status TEXT DEFAULT 'active',       -- 'active', 'unsubscribed'
  preferences TEXT,                   -- JSON preferences
  unsubscribed_at TEXT,
  unsubscribe_reason TEXT,
  unsubscribe_feedback TEXT,
  updated_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Contact Messages
CREATE TABLE contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  topic TEXT,
  message TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Case Study Submissions
CREATE TABLE case_study_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT,
  url TEXT,
  summary TEXT,
  metrics TEXT,                       -- JSON metrics
  tools TEXT,                         -- JSON tools used
  status TEXT DEFAULT 'pending',      -- 'pending', 'approved', 'rejected'
  created_at TEXT DEFAULT (datetime('now'))
);

-- Upvotes
CREATE TABLE upvotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_type TEXT NOT NULL,         -- 'post', 'case_study', 'tool'
  slug TEXT NOT NULL,
  ip_hash TEXT NOT NULL,              -- Hashed IP (privacy)
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(content_type, slug, ip_hash)
);
```

### R2 Storage Structure

```
campaign-media/
├── posts/
│   ├── {id}/
│   │   ├── featured-{hash}.webp
│   │   └── inline-{hash}.webp
├── case-studies/
│   └── {id}/
│       └── images/
├── tools/
│   └── {id}/
│       └── screenshots/
└── uploads/
    └── {year}/{month}/
        └── {filename}-{hash}.{ext}
```

### KV Namespaces

```
RATE_LIMIT_KV
├── ratelimit:subscribe:{ip_hash}
├── ratelimit:contact:{ip_hash}
├── ratelimit:api:{ip_hash}
└── ratelimit:ai:{ip_hash}

CACHE_KV
├── posts:{slug}
├── case-studies:{slug}
├── tools:{slug}
└── pages:{path}

CSRF_KV
└── csrf:{token}
```

## Caching Strategy

### Multi-Layer Caching

```
┌─────────────────────────────────────────────────┐
│  Layer 1: Browser Cache                         │
│  - Static assets: 1 year (immutable)            │
│  - Images: 1 week                               │
│  - HTML: No cache (revalidate)                  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Layer 2: Cloudflare CDN                        │
│  - Edge cache with stale-while-revalidate       │
│  - Static: 24 hours                             │
│  - Dynamic: 1 hour                              │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Layer 3: KV Cache                              │
│  - Payload CMS queries: 1 hour                  │
│  - API responses: 1 minute                      │
│  - Computed data: 5 minutes                     │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Layer 4: Next.js Data Cache                    │
│  - fetch() with revalidate                      │
│  - React Server Components                      │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Layer 5: In-Memory Cache                       │
│  - Rate limit counters                          │
│  - Temporary computation results                │
└─────────────────────────────────────────────────┘
```

### Cache Invalidation

- **On-demand**: Via Payload CMS hooks
- **Time-based**: TTL expiration
- **Tag-based**: Next.js revalidateTag()
- **Manual**: Admin API endpoints

## Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────────────────┐
│  Layer 1: Network Security                      │
│  - Cloudflare DDoS protection                   │
│  - WAF (Web Application Firewall)               │
│  - Rate limiting at edge                        │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Layer 2: Transport Security                    │
│  - HTTPS only (TLS 1.3)                         │
│  - HSTS with preload                            │
│  - Certificate pinning                          │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Layer 3: Application Security                  │
│  - CSP (Content Security Policy)                │
│  - CSRF protection                              │
│  - XSS prevention (sanitization)                │
│  - SQL injection prevention (parameterized)     │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Layer 4: Data Security                         │
│  - IP address hashing (HMAC-SHA256)             │
│  - Email encryption at rest                     │
│  - Secure secret management                     │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Layer 5: Access Control                        │
│  - Payload CMS authentication                   │
│  - API key validation                           │
│  - Role-based access control                    │
└─────────────────────────────────────────────────┘
```

### Security Headers

```typescript
// Implemented in next.config.ts and middleware.ts
{
  'Content-Security-Policy': "default-src 'self'; ...",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), ...',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp'
}
```

### Rate Limiting Strategy

| Endpoint | Limit | Window | Storage |
|----------|-------|--------|---------|
| `/api/subscribe` | 5 | 1 hour | KV |
| `/api/contact` | 3 | 1 hour | KV |
| `/api/submit` | 5 | 1 hour | KV |
| `/api/track` | 100 | 1 minute | KV |
| Server Actions (AI) | 10 | 1 hour | KV |
| General API | 60 | 1 minute | KV |

## Deployment Architecture

### Cloudflare Pages Deployment

```
┌─────────────────────────────────────────────────┐
│  GitHub Repository                              │
│  - main branch (production)                     │
│  - develop branch (preview)                     │
└──────────────┬──────────────────────────────────┘
               │
               ↓ (git push)
┌─────────────────────────────────────────────────┐
│  GitHub Actions CI/CD                           │
│  1. Run tests                                   │
│  2. Run linter                                  │
│  3. Build application                           │
│  4. Run migrations                              │
│  5. Deploy to Cloudflare                        │
└──────────────┬──────────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────────┐
│  Cloudflare Pages                               │
│  - Build with OpenNext adapter                  │
│  - Deploy to global edge network                │
│  - Atomic deployments                           │
│  - Instant rollback capability                  │
└──────────────┬──────────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────────┐
│  Production Environment                         │
│  - 300+ edge locations worldwide                │
│  - Automatic SSL/TLS                            │
│  - DDoS protection                              │
│  - Analytics & monitoring                       │
└─────────────────────────────────────────────────┘
```

### Environment Configuration

```
Development (Local)
├── .dev.vars (secrets)
├── wrangler.toml (config)
└── Local D1 database

Preview (Staging)
├── Cloudflare secrets
├── Preview D1 database
└── Preview R2 buckets

Production
├── Cloudflare secrets
├── Production D1 database
└── Production R2 buckets
```

### Monitoring & Observability

```
Application Monitoring
├── Error Tracking
│   ├── Client errors → /api/errors
│   ├── Server errors → Cloudflare logs
│   └── Custom logger (src/lib/monitoring/)
├── Performance Monitoring
│   ├── Web Vitals → /api/vitals
│   ├── Core Web Vitals tracking
│   └── Cloudflare Analytics
└── Business Metrics
    ├── Tool usage analytics
    ├── Newsletter signups
    └── Content engagement
```

## Performance Optimizations

### Build-Time Optimizations

- Tree shaking and code splitting
- Image optimization (WebP/AVIF)
- CSS minification
- Bundle analysis
- Dead code elimination

### Runtime Optimizations

- Edge computing (sub-50ms response times)
- Streaming SSR
- React Server Components
- Incremental Static Regeneration
- Optimistic UI updates

### Database Optimizations

- Indexed queries
- Connection pooling
- Query result caching
- PRAGMA optimize (scheduled)
- Prepared statements

## Scalability Considerations

### Horizontal Scaling

- Cloudflare's global network (automatic)
- Stateless workers (infinite scale)
- Edge caching (reduced origin load)

### Vertical Scaling

- D1 database limits: 10GB per database
- R2 storage: Unlimited
- Worker CPU time: 50ms per request
- KV operations: 1000 writes/sec per key

### Future Scaling Paths

1. **Database sharding** for analytics data
2. **Queue-based processing** for heavy operations
3. **Read replicas** for D1 (when available)
4. **CDN optimization** for media delivery
5. **Microservices** for compute-intensive features

## Technology Decisions

### Why Cloudflare?

- **Edge computing**: Sub-50ms global response times
- **Cost-effective**: Generous free tier, pay-as-you-grow
- **Integrated platform**: Workers, D1, R2, KV, Pages
- **DDoS protection**: Built-in security
- **Developer experience**: Excellent tooling (Wrangler)

### Why Next.js 15?

- **App Router**: Modern React patterns
- **Server Components**: Reduced client bundle
- **Server Actions**: Type-safe mutations
- **Image optimization**: Automatic WebP/AVIF
- **SEO-friendly**: Built-in meta tag support

### Why Payload CMS?

- **TypeScript-first**: Type-safe content
- **Flexible**: Custom fields and hooks
- **Self-hosted**: Full control
- **D1 adapter**: Native Cloudflare support
- **Developer-friendly**: Code-based configuration

## Conclusion

This architecture provides:

- **Performance**: Edge computing with global CDN
- **Scalability**: Serverless with automatic scaling
- **Security**: Multiple layers of protection
- **Maintainability**: Clear separation of concerns
- **Cost-efficiency**: Pay-per-use pricing model
- **Developer experience**: Modern tooling and workflows
