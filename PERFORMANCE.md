# Performance Documentation

## Table of Contents

- [Performance Overview](#performance-overview)
- [Benchmarks](#benchmarks)
- [Optimization Techniques](#optimization-techniques)
- [Caching Strategy](#caching-strategy)
- [CDN Configuration](#cdn-configuration)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Performance Overview

CampaignSites.net is optimized for speed and efficiency using edge computing, aggressive caching, and modern web technologies.

### Performance Goals

| Metric | Target | Current |
|--------|--------|---------|
| **Time to First Byte (TTFB)** | < 200ms | ~50ms (edge) |
| **First Contentful Paint (FCP)** | < 1.8s | ~1.2s |
| **Largest Contentful Paint (LCP)** | < 2.5s | ~1.8s |
| **Cumulative Layout Shift (CLS)** | < 0.1 | ~0.05 |
| **First Input Delay (FID)** | < 100ms | ~50ms |
| **Interaction to Next Paint (INP)** | < 200ms | ~100ms |
| **Total Blocking Time (TBT)** | < 200ms | ~150ms |

### Core Web Vitals

We track and optimize for Google's Core Web Vitals:

```typescript
// Automatic tracking in src/components/WebVitals.tsx
import { onCLS, onFID, onLCP, onFCP, onTTFB, onINP } from 'web-vitals'

onLCP(metric => sendToAnalytics(metric))
onFID(metric => sendToAnalytics(metric))
onCLS(metric => sendToAnalytics(metric))
```

## Benchmarks

### Page Load Performance

Measured with Lighthouse on a simulated 4G connection:

| Page Type | Performance Score | FCP | LCP | CLS | TBT |
|-----------|------------------|-----|-----|-----|-----|
| Homepage | 95 | 1.1s | 1.6s | 0.04 | 120ms |
| Blog Post | 96 | 1.0s | 1.5s | 0.03 | 100ms |
| Tool Page | 94 | 1.2s | 1.8s | 0.05 | 150ms |
| Case Study | 95 | 1.1s | 1.7s | 0.04 | 110ms |

### API Response Times

Measured at edge locations:

| Endpoint | p50 | p95 | p99 |
|----------|-----|-----|-----|
| `/api/subscribe` | 45ms | 120ms | 250ms |
| `/api/contact` | 40ms | 110ms | 230ms |
| `/api/track` | 25ms | 60ms | 150ms |
| `/api/health` | 15ms | 30ms | 50ms |

### Database Query Performance

D1 database query times:

| Query Type | Average | p95 | p99 |
|------------|---------|-----|-----|
| Simple SELECT | 5ms | 15ms | 30ms |
| JOIN query | 12ms | 35ms | 60ms |
| INSERT | 8ms | 20ms | 40ms |
| UPDATE | 10ms | 25ms | 50ms |

### Build Performance

| Metric | Time |
|--------|------|
| Clean build | ~120s |
| Incremental build | ~15s |
| Type generation | ~8s |
| Bundle size (JS) | ~180KB (gzipped) |
| Bundle size (CSS) | ~25KB (gzipped) |

## Optimization Techniques

### 1. Edge Computing

**Strategy**: Run application at Cloudflare's 300+ edge locations

**Benefits**:
- Sub-50ms TTFB globally
- Reduced latency
- Automatic geographic distribution
- No cold starts

**Implementation**:
```typescript
// Deployed via OpenNext Cloudflare adapter
// Runs on Cloudflare Workers (V8 isolates)
```

### 2. React Server Components

**Strategy**: Render components on the server, send minimal JavaScript

**Benefits**:
- Reduced client bundle size
- Faster initial page load
- Better SEO
- Automatic code splitting

**Implementation**:
```typescript
// Server Component (default in App Router)
export default async function BlogPost({ params }) {
  const post = await getPost(params.slug) // Runs on server
  return <Article post={post} />
}

// Client Component (when needed)
'use client'
export function InteractiveTool() {
  const [state, setState] = useState()
  return <div>...</div>
}
```

### 3. Image Optimization

**Strategy**: Automatic WebP/AVIF conversion, lazy loading, responsive images

**Benefits**:
- 50-80% smaller file sizes
- Faster page loads
- Better mobile experience
- Automatic format selection

**Implementation**:
```typescript
// next.config.ts
images: {
  loader: 'custom',
  loaderFile: './src/lib/image-loader.ts',
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  imageSizes: [16, 32, 48, 64, 96, 128, 256],
}

// Usage
<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  loading="lazy"
/>
```

### 4. Code Splitting

**Strategy**: Split code into smaller chunks, load on demand

**Benefits**:
- Smaller initial bundle
- Faster Time to Interactive
- Better caching
- Reduced bandwidth usage

**Implementation**:
```typescript
// Automatic route-based splitting
// Each page is a separate chunk

// Dynamic imports for heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false // Client-side only if needed
})
```

### 5. Tree Shaking

**Strategy**: Remove unused code during build

**Benefits**:
- Smaller bundle size
- Faster downloads
- Better performance

**Implementation**:
```typescript
// Import only what you need
import { useState } from 'react' // Good
import * as React from 'react' // Avoid

// Use ES modules
export { Button } from './Button' // Good
module.exports = { Button } // Avoid
```

### 6. Compression

**Strategy**: Gzip and Brotli compression for all assets

**Benefits**:
- 70-90% size reduction
- Faster downloads
- Lower bandwidth costs

**Implementation**:
```typescript
// Automatic via Cloudflare
// Brotli for modern browsers
// Gzip fallback for older browsers

// Static assets compressed at build time
// Dynamic content compressed at edge
```

### 7. Prefetching

**Strategy**: Prefetch critical resources and likely navigation targets

**Benefits**:
- Instant navigation
- Better perceived performance
- Reduced wait times

**Implementation**:
```typescript
// Next.js Link component prefetches automatically
<Link href="/tools" prefetch={true}>
  Tools
</Link>

// Manual prefetch
import { prefetch } from 'next/navigation'
prefetch('/tools/utm-builder')
```

### 8. Streaming SSR

**Strategy**: Stream HTML to browser as it's generated

**Benefits**:
- Faster First Contentful Paint
- Progressive rendering
- Better perceived performance

**Implementation**:
```typescript
// Automatic with React Server Components
// Use Suspense for streaming boundaries
<Suspense fallback={<Skeleton />}>
  <SlowComponent />
</Suspense>
```

## Caching Strategy

### Multi-Layer Caching Architecture

```
Browser Cache (Layer 1)
    ↓
CDN Cache (Layer 2)
    ↓
KV Cache (Layer 3)
    ↓
Next.js Data Cache (Layer 4)
    ↓
In-Memory Cache (Layer 5)
    ↓
Database (Origin)
```

### Cache Configuration

#### 1. Browser Cache

```typescript
// Static assets (immutable)
Cache-Control: public, max-age=31536000, immutable

// Images
Cache-Control: public, max-age=604800, stale-while-revalidate=86400

// HTML pages
Cache-Control: no-cache, must-revalidate
```

#### 2. CDN Cache (Cloudflare)

```typescript
// Static pages
export const revalidate = 3600 // 1 hour

// Dynamic pages
export const revalidate = 60 // 1 minute

// Real-time data
export const revalidate = 0 // No cache
```

#### 3. KV Cache

```typescript
// Payload CMS queries
await setInCache('posts:slug', data, { ttl: 3600 })

// API responses
await setInCache('api:response', data, { ttl: 60 })

// Computed data
await setInCache('computed:result', data, { ttl: 300 })
```

#### 4. Next.js Data Cache

```typescript
// fetch() with revalidate
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 3600 }
})

// Opt out of caching
const data = await fetch('https://api.example.com/data', {
  cache: 'no-store'
})
```

#### 5. In-Memory Cache

```typescript
// Rate limit counters
memoryCache.set('ratelimit:ip', count, 60)

// Temporary results
memoryCache.set('temp:result', data, 300)
```

### Cache Invalidation

#### On-Demand Revalidation

```typescript
import { revalidatePath, revalidateTag } from 'next/cache'

// Revalidate specific path
revalidatePath('/blog/post-slug')

// Revalidate by tag
revalidateTag('posts')
```

#### Time-Based Invalidation

```typescript
// Automatic expiration via TTL
export const revalidate = 3600 // Revalidate after 1 hour
```

#### Manual Invalidation

```typescript
// Clear KV cache
await deleteFromCache('posts:slug')

// Clear tag-based cache
await invalidateCacheByTag('posts')
```

## CDN Configuration

### Cloudflare Settings

#### Caching Rules

```
Static Assets (/_next/static/*)
- Cache Level: Standard
- Edge Cache TTL: 1 year
- Browser Cache TTL: 1 year

Images (/images/*)
- Cache Level: Standard
- Edge Cache TTL: 1 week
- Browser Cache TTL: 1 week
- Polish: Lossless
- Mirage: On

API Routes (/api/*)
- Cache Level: Bypass
- Browser Cache TTL: 0
```

#### Performance Features

```
Auto Minify
- JavaScript: On
- CSS: On
- HTML: On

Brotli Compression: On
Early Hints: On
HTTP/2: On
HTTP/3 (QUIC): On
0-RTT Connection Resumption: On
```

#### Smart Routing

```
Argo Smart Routing: On (optional, paid)
- Reduces latency by 30%
- Finds fastest path to origin
- Automatic failover
```

### Cache Headers

```typescript
// Stale-while-revalidate pattern
Cache-Control: public, max-age=3600, stale-while-revalidate=86400

// Explanation:
// - Serve from cache for 1 hour (max-age=3600)
// - After 1 hour, serve stale content while revalidating (stale-while-revalidate=86400)
// - Revalidate in background for next request
```

## Monitoring

### Real User Monitoring (RUM)

Track actual user experience:

```typescript
// Web Vitals tracking
import { onCLS, onFID, onLCP } from 'web-vitals'

onLCP(metric => {
  // Send to analytics
  fetch('/api/vitals', {
    method: 'POST',
    body: JSON.stringify(metric)
  })
})
```

### Synthetic Monitoring

Automated performance testing:

```bash
# Lighthouse CI
pnpm run lighthouse

# Configuration in lighthouserc.json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

### Performance Budgets

Set performance budgets to prevent regressions:

```json
{
  "budgets": [
    {
      "resourceSizes": [
        {
          "resourceType": "script",
          "budget": 200
        },
        {
          "resourceType": "stylesheet",
          "budget": 30
        },
        {
          "resourceType": "image",
          "budget": 500
        }
      ]
    }
  ]
}
```

### Cloudflare Analytics

Monitor via Cloudflare Dashboard:

- **Traffic**: Requests, bandwidth, cache hit ratio
- **Performance**: Response times, error rates
- **Security**: Threats blocked, rate limits hit
- **Web Analytics**: Page views, visitors, bounce rate

### Custom Metrics

Track business-specific metrics:

```typescript
// Tool usage tracking
trackEvent({
  eventType: 'tool_use',
  toolSlug: 'utm-builder',
  context: 'generated_utm'
})

// Performance tracking
trackEvent({
  eventType: 'performance',
  metric: 'api_response_time',
  value: responseTime
})
```

## Troubleshooting

### Slow Page Loads

#### Symptoms
- High LCP (> 2.5s)
- High TTFB (> 600ms)
- Slow First Contentful Paint

#### Diagnosis

```bash
# Check Lighthouse score
pnpm run lighthouse

# Analyze bundle size
pnpm run build:analyze

# Check network waterfall in DevTools
# Look for:
# - Large resources
# - Render-blocking resources
# - Long request chains
```

#### Solutions

1. **Optimize Images**
   ```typescript
   // Use Next.js Image component
   <Image src="/large.jpg" width={800} height={600} />

   // Lazy load below-the-fold images
   <Image src="/image.jpg" loading="lazy" />
   ```

2. **Reduce JavaScript Bundle**
   ```typescript
   // Dynamic imports
   const Component = dynamic(() => import('./Component'))

   // Remove unused dependencies
   pnpm remove unused-package
   ```

3. **Optimize Fonts**
   ```typescript
   // Use font-display: swap
   @font-face {
     font-family: 'CustomFont';
     font-display: swap;
   }
   ```

### High Server Response Time

#### Symptoms
- High TTFB (> 600ms)
- Slow API responses
- Database timeouts

#### Diagnosis

```bash
# Check API response times
curl -w "@curl-format.txt" -o /dev/null -s https://campaignsites.net/api/health

# Check database performance
wrangler d1 execute campaign-db --command "EXPLAIN QUERY PLAN SELECT * FROM posts"

# Check Cloudflare logs
wrangler pages deployment tail
```

#### Solutions

1. **Add Database Indexes**
   ```sql
   CREATE INDEX idx_posts_slug ON posts(slug);
   CREATE INDEX idx_posts_published ON posts(publishedDate);
   ```

2. **Implement Caching**
   ```typescript
   // Cache expensive queries
   const data = await cachedQuery('posts:all', async () => {
     return await payload.find({ collection: 'posts' })
   }, { ttl: 3600 })
   ```

3. **Optimize Queries**
   ```typescript
   // Select only needed fields
   const posts = await payload.find({
     collection: 'posts',
     select: { title: true, slug: true, excerpt: true }
   })
   ```

### Cache Issues

#### Symptoms
- Stale content served
- Cache misses
- Inconsistent data

#### Diagnosis

```bash
# Check cache headers
curl -I https://campaignsites.net/

# Check KV cache
wrangler kv:key get --binding=CACHE_KV "posts:slug"

# Check cache hit ratio in Cloudflare Dashboard
```

#### Solutions

1. **Invalidate Cache**
   ```typescript
   // Revalidate path
   revalidatePath('/blog/post-slug')

   // Revalidate tag
   revalidateTag('posts')

   // Clear KV cache
   await deleteFromCache('posts:slug')
   ```

2. **Adjust Cache TTL**
   ```typescript
   // Reduce TTL for frequently changing content
   export const revalidate = 60 // 1 minute instead of 1 hour
   ```

3. **Use Cache Tags**
   ```typescript
   // Tag cache entries for easier invalidation
   await setInCache('posts:slug', data, {
     ttl: 3600,
     tags: ['posts', 'content']
   })
   ```

### Memory Issues

#### Symptoms
- Out of memory errors
- Slow builds
- Worker crashes

#### Diagnosis

```bash
# Check build memory usage
NODE_OPTIONS="--max-old-space-size=8000" pnpm run build

# Monitor worker memory
# Cloudflare Workers have 128MB memory limit
```

#### Solutions

1. **Increase Build Memory**
   ```bash
   # In package.json
   "build": "cross-env NODE_OPTIONS=\"--max-old-space-size=8000\" next build"
   ```

2. **Optimize Data Structures**
   ```typescript
   // Stream large datasets instead of loading all at once
   for await (const chunk of dataStream) {
     process(chunk)
   }
   ```

3. **Clean Up Resources**
   ```typescript
   // Clear caches periodically
   memoryCache.cleanup()
   ```

### Rate Limiting Issues

#### Symptoms
- 429 errors
- Blocked requests
- User complaints

#### Diagnosis

```bash
# Check rate limit logs
wrangler pages deployment tail | grep "429"

# Check KV rate limit entries
wrangler kv:key list --binding=RATE_LIMIT_KV
```

#### Solutions

1. **Adjust Rate Limits**
   ```typescript
   // Increase limits if legitimate traffic
   const rateLimitResult = await checkRateLimit(identifier, {
     limit: 10, // Increased from 5
     window: 60 * 60 * 1000
   })
   ```

2. **Implement Backoff**
   ```typescript
   // Client-side exponential backoff
   async function fetchWithRetry(url, options, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       const response = await fetch(url, options)
       if (response.status !== 429) return response
       await new Promise(resolve =>
         setTimeout(resolve, Math.pow(2, i) * 1000)
       )
     }
   }
   ```

3. **Whitelist IPs**
   ```typescript
   // Skip rate limiting for trusted IPs
   const trustedIps = ['1.2.3.4', '5.6.7.8']
   if (trustedIps.includes(ip)) {
     // Skip rate limit check
   }
   ```

## Performance Checklist

### Development

- [ ] Use React Server Components by default
- [ ] Implement code splitting for large components
- [ ] Optimize images (WebP/AVIF, lazy loading)
- [ ] Minimize JavaScript bundle size
- [ ] Use CSS-in-JS sparingly (prefer Tailwind)
- [ ] Implement proper error boundaries
- [ ] Avoid unnecessary re-renders

### Build

- [ ] Run bundle analyzer
- [ ] Check for duplicate dependencies
- [ ] Verify tree shaking is working
- [ ] Optimize font loading
- [ ] Minify CSS and JavaScript
- [ ] Generate source maps for debugging

### Deployment

- [ ] Enable Cloudflare caching
- [ ] Configure cache headers correctly
- [ ] Set up CDN properly
- [ ] Enable compression (Brotli/Gzip)
- [ ] Configure rate limiting
- [ ] Set up monitoring and alerts

### Monitoring

- [ ] Track Core Web Vitals
- [ ] Monitor API response times
- [ ] Check cache hit ratios
- [ ] Review error rates
- [ ] Analyze user behavior
- [ ] Set up performance budgets

## Resources

### Tools

- **Lighthouse**: Performance auditing
- **WebPageTest**: Detailed performance analysis
- **Chrome DevTools**: Network and performance profiling
- **Bundle Analyzer**: Analyze bundle size
- **Cloudflare Analytics**: Real-time metrics

### Documentation

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Cloudflare Performance](https://developers.cloudflare.com/fundamentals/performance/)
- [Web Vitals](https://web.dev/vitals/)
- [Performance Budgets](https://web.dev/performance-budgets-101/)

---

**Last Updated**: 2026-02-01
