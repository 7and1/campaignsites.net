# Monitoring & Observability Setup

## Overview

CampaignSites.net includes comprehensive monitoring and observability infrastructure for production operations.

## Components

### 1. Structured Logging

**Location:** `/src/lib/monitoring/logger.ts`

Provides structured JSON logging with different log levels:

```typescript
import { logger } from '@/lib/monitoring'

// Basic logging
logger.info('User action completed', { userId: '123', action: 'subscribe' })
logger.warn('Rate limit approaching', { remaining: 2, limit: 5 })
logger.error('API call failed', error, { endpoint: '/api/subscribe' })

// HTTP request logging
logger.http('POST', '/api/subscribe', 200, 145)

// Performance logging
logger.perf('database-query', 234, { query: 'posts' })
```

**Features:**
- Structured JSON output in production
- Pretty-printed logs in development
- Automatic timestamp and environment tagging
- Error stack traces (dev only)
- Context enrichment

### 2. Error Tracking

**Location:** `/src/lib/monitoring/error-tracker.ts`

Tracks and reports errors with context:

```typescript
import { trackError, withErrorTracking, trackApiError } from '@/lib/monitoring'

// Track errors manually
try {
  await riskyOperation()
} catch (error) {
  trackError(error, { component: 'PaymentForm', userId: '123' })
  throw error
}

// Wrap functions with automatic error tracking
const safeFunction = withErrorTracking(async () => {
  // Your code here
}, { component: 'DataProcessor' })

// Track API errors
trackApiError(error, {
  method: 'POST',
  url: '/api/subscribe',
}, {
  status: 500,
  statusText: 'Internal Server Error'
})
```

**Features:**
- Automatic error context capture
- Client-side error reporting via beacon API
- Component-level error boundaries
- API error tracking with request/response details

### 3. Performance Monitoring

**Location:** `/src/lib/monitoring/performance.ts`

Tracks Web Vitals and custom performance metrics:

```typescript
import { measureAsync, PerformanceTimer, monitorApiRequest } from '@/lib/monitoring'

// Measure async operations
const result = await measureAsync('fetch-user-data', async () => {
  return await fetchUserData()
})

// Use performance timer for complex operations
const timer = new PerformanceTimer('checkout-flow')
timer.mark('validation-complete')
await processPayment()
timer.mark('payment-complete')
const duration = timer.end({ userId: '123' })

// Monitor API requests
monitorApiRequest('POST', '/api/subscribe', 200, 145)
```

**Web Vitals Tracked:**
- LCP (Largest Contentful Paint)
- FCP (First Contentful Paint)
- CLS (Cumulative Layout Shift)
- TTFB (Time to First Byte)
- INP (Interaction to Next Paint)

### 4. API Middleware

**Location:** `/src/lib/monitoring/api-middleware.ts`

Automatic monitoring for API routes:

```typescript
import { withMonitoring } from '@/lib/monitoring'

async function handler(request: Request) {
  // Your API logic
  return NextResponse.json({ ok: true })
}

// Wrap with monitoring
export const POST = withMonitoring(handler)
```

**Features:**
- Automatic request/response logging
- Performance tracking
- Error tracking
- Slow request detection (>3s)

### 5. Error Boundaries

**Location:** `/src/app/error.tsx` and `/src/app/global-error.tsx`

React error boundaries that catch and report errors:

- `error.tsx` - Page-level error boundary
- `global-error.tsx` - Application-level error boundary

Both automatically log errors to monitoring system.

### 6. Health Check Endpoint

**Location:** `/src/app/api/health/route.ts`

Comprehensive health check endpoint for monitoring:

```bash
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-01T12:00:00.000Z",
  "responseTime": "145ms",
  "version": "0.1.0",
  "environment": "production",
  "checks": {
    "database": { "status": "ok", "responseTime": 45 },
    "payload": { "status": "ok", "responseTime": 12 },
    "openai": { "status": "ok", "responseTime": 234 },
    "resend": { "status": "ok", "responseTime": 156 },
    "memory": { "status": "ok", "message": "128MB / 512MB" }
  }
}
```

**Status Codes:**
- `200` - Healthy
- `503` - Unhealthy or degraded

### 7. Client-Side Reporting

**Error Reporting:** `/src/app/api/errors/route.ts`
- Receives client-side error reports
- Logs to structured logger

**Web Vitals:** `/src/app/api/vitals/route.ts`
- Receives Web Vitals metrics
- Tracks performance issues

**Component:** `/src/components/WebVitals.tsx`
- Automatically tracks Core Web Vitals
- Sends metrics to analytics endpoint

## Integration

### In API Routes

```typescript
import { withMonitoring, logger } from '@/lib/monitoring'

async function handler(request: Request) {
  logger.info('Processing request')

  try {
    const result = await processData()
    return NextResponse.json({ ok: true, result })
  } catch (error) {
    logger.error('Processing failed', error)
    throw error
  }
}

export const POST = withMonitoring(handler)
```

### In Server Actions

```typescript
'use server'

import { logger, trackError } from '@/lib/monitoring'

export async function myAction(data: FormData) {
  try {
    logger.info('Action started', { action: 'myAction' })
    const result = await processAction(data)
    logger.info('Action completed', { action: 'myAction' })
    return result
  } catch (error) {
    trackError(error, { action: 'myAction' })
    throw error
  }
}
```

### In Client Components

```typescript
'use client'

import { trackError } from '@/lib/monitoring'

export function MyComponent() {
  const handleClick = async () => {
    try {
      await riskyOperation()
    } catch (error) {
      trackError(error, { component: 'MyComponent', action: 'handleClick' })
      // Show user-friendly error
    }
  }

  return <button onClick={handleClick}>Click me</button>
}
```

## Deployment Integration

The deployment script (`deploy.sh`) includes:

1. **Pre-deployment checks** - Verify prerequisites
2. **Health checks** - Verify deployment health
3. **Critical path checks** - Test key endpoints
4. **Performance monitoring** - Track deployment metrics
5. **Rollback capability** - Quick rollback if issues detected

### Health Check in Deploy

```bash
# Run health check
./deploy.sh health https://campaignsites.net

# Deploy with automatic health checks
./deploy.sh production
```

## CI/CD Integration

**Location:** `.github/workflows/ci.yml`

Automated testing and verification:

1. **Test & Lint** - Run tests, linting, type checking
2. **Build Verification** - Ensure build succeeds
3. **Security Audit** - Check for vulnerabilities

**Triggers:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

## Monitoring Best Practices

### 1. Log Levels

- `debug` - Development only, detailed information
- `info` - General information, normal operations
- `warn` - Warning conditions, degraded performance
- `error` - Error conditions, failures

### 2. Context Enrichment

Always include relevant context:

```typescript
logger.error('Payment failed', error, {
  userId: user.id,
  amount: payment.amount,
  paymentMethod: payment.method,
  attemptNumber: 3,
})
```

### 3. Sensitive Data

Never log sensitive data:
- Passwords
- API keys
- Credit card numbers
- Personal identification numbers
- Full email addresses (hash or truncate)

### 4. Performance Thresholds

Monitor and alert on:
- API response time > 3s
- Database query time > 1s
- Memory usage > 80%
- Error rate > 1%

## Cloudflare Integration

### Workers Analytics

Logs are automatically captured by Cloudflare Workers and available in:
- Cloudflare Dashboard → Workers → Logs
- Real-time tail: `wrangler tail`

### Custom Analytics

Use Cloudflare Analytics Engine for custom metrics:

```typescript
// In worker context
env.ANALYTICS.writeDataPoint({
  blobs: ['api-request'],
  doubles: [responseTime],
  indexes: [path],
})
```

## Troubleshooting

### View Logs

```bash
# Real-time logs
wrangler tail

# Deployment logs
./deploy.sh logs

# Local development logs
pnpm dev
```

### Check Health

```bash
# Production
curl https://campaignsites.net/api/health | jq

# Local
curl http://localhost:3000/api/health | jq
```

### Debug Issues

1. Check health endpoint for service status
2. Review structured logs for errors
3. Check Cloudflare Dashboard for metrics
4. Review deployment logs in `/tmp/campaignsites-deploy/`

## Future Enhancements

- [ ] Integrate with external monitoring (Sentry, DataDog)
- [ ] Add custom dashboards
- [ ] Set up alerting rules
- [ ] Implement distributed tracing
- [ ] Add user session replay
- [ ] Create SLO/SLA monitoring
