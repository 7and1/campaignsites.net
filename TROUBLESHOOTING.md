# Troubleshooting Guide

## Table of Contents

- [Common Issues](#common-issues)
- [Error Messages](#error-messages)
- [Debugging Guide](#debugging-guide)
- [Performance Issues](#performance-issues)
- [Deployment Issues](#deployment-issues)
- [Database Issues](#database-issues)
- [Build Issues](#build-issues)
- [Runtime Errors](#runtime-errors)
- [Getting Help](#getting-help)

## Common Issues

### Development Server Won't Start

#### Symptoms
- `pnpm dev` fails to start
- Port already in use
- Module not found errors

#### Solutions

**1. Port Already in Use**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use a different port
PORT=3001 pnpm dev
```

**2. Missing Dependencies**
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**3. Corrupted Cache**
```bash
# Clear Next.js cache
rm -rf .next

# Clear Wrangler cache
rm -rf .wrangler

# Restart dev server
pnpm devsafe
```

**4. Environment Variables Missing**
```bash
# Copy example file
cp .env.example .dev.vars

# Generate required secrets
openssl rand -hex 32  # PAYLOAD_SECRET
openssl rand -hex 16  # IP_HASH_SALT

# Add to .dev.vars
```

---

### Type Errors

#### Symptoms
- TypeScript compilation errors
- "Cannot find module" errors
- Type mismatch errors

#### Solutions

**1. Regenerate Types**
```bash
# Generate Payload types
pnpm run generate:types:payload

# Generate Cloudflare types
pnpm run generate:types:cloudflare

# Generate import map
pnpm run generate:importmap
```

**2. Check tsconfig.json**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**3. Restart TypeScript Server**
- VS Code: `Cmd+Shift+P` → "TypeScript: Restart TS Server"
- Or restart your IDE

**4. Clear TypeScript Cache**
```bash
# Remove TypeScript build info
rm -rf .next/types
rm -rf node_modules/.cache
```

---

### Database Connection Errors

#### Symptoms
- "D1 binding is missing"
- "Database not found"
- Query timeouts

#### Solutions

**1. Check wrangler.toml**
```toml
[[d1_databases]]
binding = "D1"
database_name = "campaign-db"
database_id = "your-database-id"
```

**2. Verify Database Exists**
```bash
# List databases
wrangler d1 list

# Create if missing
wrangler d1 create campaign-db
```

**3. Run Migrations**
```bash
# Apply migrations
pnpm run deploy:database

# Or manually
wrangler d1 migrations apply campaign-db
```

**4. Check Database Connection**
```bash
# Test query
wrangler d1 execute campaign-db --command "SELECT 1"
```

---

### Build Failures

#### Symptoms
- Build fails with errors
- Out of memory errors
- Type errors during build

#### Solutions

**1. Increase Memory**
```bash
# Set Node memory limit
export NODE_OPTIONS="--max-old-space-size=8000"
pnpm run build
```

**2. Clean Build**
```bash
# Remove build artifacts
rm -rf .next .open-next

# Rebuild
pnpm run build
```

**3. Check for Circular Dependencies**
```bash
# Install madge
pnpm add -D madge

# Check for circular dependencies
npx madge --circular src/
```

**4. Verify Environment Variables**
```bash
# Build requires PAYLOAD_SECRET
export PAYLOAD_SECRET="your-secret"
pnpm run build
```

---

### Rate Limiting Issues

#### Symptoms
- 429 Too Many Requests errors
- Users getting blocked
- API calls failing

#### Solutions

**1. Check Rate Limit Configuration**
```typescript
// src/lib/rate-limit.ts
const rateLimitResult = await checkRateLimit(identifier, {
  limit: 5,        // Adjust if needed
  window: 3600000  // 1 hour in ms
})
```

**2. Clear Rate Limit Cache**
```bash
# List KV keys
wrangler kv:key list --binding=RATE_LIMIT_KV

# Delete specific key
wrangler kv:key delete --binding=RATE_LIMIT_KV "ratelimit:subscribe:hash"
```

**3. Whitelist IPs (if needed)**
```typescript
// In API route
const trustedIps = ['1.2.3.4']
if (trustedIps.includes(ip)) {
  // Skip rate limiting
}
```

**4. Implement Client-Side Backoff**
```typescript
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options)
    if (response.status !== 429) return response

    // Exponential backoff
    await new Promise(resolve =>
      setTimeout(resolve, Math.pow(2, i) * 1000)
    )
  }
}
```

---

### CSRF Token Errors

#### Symptoms
- "Invalid or missing CSRF token"
- 403 Forbidden on form submissions
- API calls failing

#### Solutions

**1. Get CSRF Token from Cookie**
```javascript
function getCsrfToken() {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('csrf-token='))
    ?.split('=')[1]
}
```

**2. Include Token in Requests**
```javascript
const csrfToken = getCsrfToken()

fetch('/api/subscribe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify(data)
})
```

**3. Check Middleware Configuration**
```typescript
// src/middleware.ts
// Ensure CSRF validation is not blocking legitimate requests
```

**4. Verify Cookie Settings**
```typescript
// Check that cookies are being set correctly
// Should be HttpOnly, Secure in production
```

---

## Error Messages

### "Module not found: Can't resolve '@/...'"

**Cause**: Path alias not configured correctly

**Solution**:
```bash
# Check tsconfig.json has correct paths
# Restart TypeScript server
# Restart dev server
pnpm devsafe
```

---

### "PAYLOAD_SECRET is required"

**Cause**: Missing environment variable

**Solution**:
```bash
# Generate secret
openssl rand -hex 32

# Add to .dev.vars (local) or Cloudflare secrets (production)
echo "PAYLOAD_SECRET=your-secret" >> .dev.vars
```

---

### "Failed to fetch" or Network Errors

**Cause**: API endpoint not accessible or CORS issue

**Solution**:
```bash
# Check API is running
curl http://localhost:3000/api/health

# Check CORS headers
# Verify request URL is correct
# Check browser console for details
```

---

### "Hydration failed"

**Cause**: Server and client HTML mismatch

**Solution**:
```typescript
// Use useEffect for client-only code
useEffect(() => {
  // Client-only code here
}, [])

// Or use dynamic import with ssr: false
const ClientComponent = dynamic(() => import('./ClientComponent'), {
  ssr: false
})
```

---

### "Worker exceeded CPU time limit"

**Cause**: Long-running operation in Cloudflare Worker

**Solution**:
```typescript
// Optimize database queries
// Add indexes
// Implement caching
// Break up long operations
// Use background jobs for heavy tasks
```

---

## Debugging Guide

### Enable Debug Logging

**Development**:
```typescript
// src/lib/monitoring/logger.ts
export const logger = {
  debug: (message, meta) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEBUG]', message, meta)
    }
  }
}
```

**Production**:
```bash
# View Cloudflare logs
wrangler pages deployment tail

# Filter for errors
wrangler pages deployment tail | grep "ERROR"
```

---

### Debug API Routes

**1. Add Logging**
```typescript
export async function POST(request: Request) {
  console.log('Request received:', {
    url: request.url,
    headers: Object.fromEntries(request.headers),
    method: request.method
  })

  try {
    const body = await request.json()
    console.log('Request body:', body)

    // Your code here

  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}
```

**2. Use curl for Testing**
```bash
# Test API endpoint
curl -X POST http://localhost:3000/api/subscribe \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: your-token" \
  -d '{"email":"test@example.com"}'

# View response headers
curl -I http://localhost:3000/api/health
```

**3. Use Browser DevTools**
- Network tab: Check request/response
- Console tab: Check for errors
- Application tab: Check cookies/storage

---

### Debug Database Queries

**1. Enable Query Logging**
```typescript
const result = await db
  .prepare('SELECT * FROM posts WHERE slug = ?')
  .bind(slug)
  .all()

console.log('Query result:', result)
```

**2. Use EXPLAIN**
```bash
# Check query plan
wrangler d1 execute campaign-db \
  --command "EXPLAIN QUERY PLAN SELECT * FROM posts WHERE slug = 'test'"
```

**3. Check Indexes**
```bash
# List indexes
wrangler d1 execute campaign-db \
  --command "SELECT * FROM sqlite_master WHERE type='index'"
```

---

### Debug Build Issues

**1. Verbose Build Output**
```bash
# Build with verbose logging
pnpm run build --verbose
```

**2. Analyze Bundle**
```bash
# Generate bundle analysis
pnpm run build:analyze

# Opens visualization in browser
```

**3. Check for Errors**
```bash
# Type check without building
npx tsc --noEmit

# Lint check
pnpm run lint
```

---

## Performance Issues

### Slow Page Loads

**Diagnosis**:
```bash
# Run Lighthouse
pnpm run lighthouse

# Check bundle size
pnpm run build:analyze

# Profile in Chrome DevTools
# Performance tab → Record → Analyze
```

**Solutions**:
1. Optimize images (use WebP/AVIF)
2. Implement code splitting
3. Add caching headers
4. Reduce JavaScript bundle size
5. Use React Server Components

See [PERFORMANCE.md](./PERFORMANCE.md) for details.

---

### Slow API Responses

**Diagnosis**:
```bash
# Check response time
curl -w "@curl-format.txt" -o /dev/null -s https://campaignsites.net/api/health

# curl-format.txt:
# time_total: %{time_total}s
```

**Solutions**:
1. Add database indexes
2. Implement caching
3. Optimize queries
4. Use connection pooling
5. Profile slow queries

---

### High Memory Usage

**Diagnosis**:
```bash
# Check Node memory usage
node --trace-gc your-script.js

# Monitor during build
NODE_OPTIONS="--max-old-space-size=8000" pnpm run build
```

**Solutions**:
1. Increase Node memory limit
2. Optimize data structures
3. Stream large datasets
4. Clear caches periodically
5. Fix memory leaks

---

## Deployment Issues

### Deployment Fails

**Check Logs**:
```bash
# View deployment logs
wrangler pages deployment tail

# Check GitHub Actions logs
# Go to Actions tab in GitHub
```

**Common Causes**:
1. Missing environment variables
2. Build errors
3. Migration failures
4. Wrangler authentication issues

**Solutions**:
```bash
# Re-authenticate
wrangler login

# Check secrets
wrangler secret list --env=production

# Verify wrangler.toml
wrangler config validate
```

---

### Site Not Updating After Deploy

**Cause**: Cache not cleared

**Solutions**:
```bash
# Purge Cloudflare cache
# Via Dashboard: Caching → Purge Everything

# Or via API
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

---

### 500 Errors in Production

**Diagnosis**:
```bash
# Check logs
wrangler pages deployment tail

# Check error tracking
# Review /api/errors endpoint data
```

**Common Causes**:
1. Missing environment variables
2. Database connection issues
3. External service failures
4. Unhandled exceptions

**Solutions**:
1. Add error handling
2. Verify all secrets are set
3. Check external service status
4. Review error logs

---

## Database Issues

### Migration Failures

**Symptoms**:
- Migration command fails
- Tables not created
- Schema mismatch

**Solutions**:
```bash
# Check migration status
wrangler d1 migrations list campaign-db

# Apply pending migrations
wrangler d1 migrations apply campaign-db

# Rollback if needed (manual)
wrangler d1 execute campaign-db --command "DROP TABLE table_name"
```

---

### Query Performance Issues

**Diagnosis**:
```bash
# Analyze query
wrangler d1 execute campaign-db \
  --command "EXPLAIN QUERY PLAN SELECT * FROM posts WHERE slug = 'test'"
```

**Solutions**:
```sql
-- Add indexes
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_published ON posts(publishedDate);

-- Optimize queries
-- Select only needed columns
SELECT id, title, slug FROM posts;

-- Use LIMIT
SELECT * FROM posts LIMIT 10;
```

---

### Database Size Issues

**Check Size**:
```bash
# Check database size
wrangler d1 execute campaign-db \
  --command "SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()"
```

**Solutions**:
```sql
-- Vacuum database
VACUUM;

-- Optimize
PRAGMA optimize;

-- Archive old data
-- Delete unnecessary records
```

---

## Build Issues

### Out of Memory During Build

**Solution**:
```bash
# Increase Node memory
export NODE_OPTIONS="--max-old-space-size=8000"
pnpm run build
```

---

### TypeScript Errors During Build

**Solution**:
```bash
# Regenerate types
pnpm run generate:types

# Check for type errors
npx tsc --noEmit

# Fix errors or temporarily ignore
# (not recommended for production)
```

---

### Bundle Size Too Large

**Diagnosis**:
```bash
# Analyze bundle
pnpm run build:analyze
```

**Solutions**:
1. Remove unused dependencies
2. Use dynamic imports
3. Optimize images
4. Enable tree shaking
5. Use smaller alternatives

---

## Runtime Errors

### "Cannot read property of undefined"

**Cause**: Accessing property on null/undefined object

**Solution**:
```typescript
// Use optional chaining
const value = obj?.property?.nested

// Use nullish coalescing
const value = obj?.property ?? 'default'

// Add type guards
if (obj && obj.property) {
  // Safe to access
}
```

---

### "Maximum call stack size exceeded"

**Cause**: Infinite recursion or circular reference

**Solution**:
```typescript
// Add base case to recursion
function recursive(n) {
  if (n <= 0) return // Base case
  return recursive(n - 1)
}

// Check for circular references
// Use WeakMap to track visited objects
```

---

### "Failed to fetch"

**Cause**: Network error or CORS issue

**Solution**:
```typescript
// Add error handling
try {
  const response = await fetch('/api/endpoint')
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  const data = await response.json()
} catch (error) {
  console.error('Fetch failed:', error)
  // Handle error
}
```

---

## Getting Help

### Before Asking for Help

1. **Check this guide** for common issues
2. **Search existing issues** on GitHub
3. **Check the logs** for error messages
4. **Try the solutions** listed above
5. **Gather information**:
   - Error messages
   - Steps to reproduce
   - Environment (OS, Node version, etc.)
   - Relevant code snippets

### Where to Get Help

**Documentation**:
- [README.md](./README.md) - Getting started
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [API.md](./API.md) - API documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [PERFORMANCE.md](./PERFORMANCE.md) - Performance optimization

**Community**:
- GitHub Issues: Report bugs and request features
- GitHub Discussions: Ask questions and share ideas

**Support**:
- Email: hello@campaignsites.net
- Response time: Within 48 hours

### Creating a Good Bug Report

Include:
1. **Title**: Clear, descriptive title
2. **Description**: What happened vs. what you expected
3. **Steps to Reproduce**: Detailed steps
4. **Environment**: OS, Node version, browser
5. **Error Messages**: Full error messages and stack traces
6. **Code**: Minimal reproducible example
7. **Screenshots**: If applicable

**Example**:
```markdown
## Bug: Newsletter subscription fails with 500 error

### Description
When submitting the newsletter form, I get a 500 error instead of success message.

### Steps to Reproduce
1. Go to homepage
2. Enter email in newsletter form
3. Click "Subscribe"
4. See error message

### Environment
- OS: macOS 14.0
- Node: 20.10.0
- Browser: Chrome 120

### Error Message
```
Error: Failed to subscribe
  at POST (route.ts:45)
```

### Expected Behavior
Should show success message and send welcome email.

### Actual Behavior
Shows error message, no email sent.
```

---

## Quick Reference

### Useful Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm devsafe               # Clean start
pnpm build                 # Build for production
pnpm test                  # Run tests

# Database
wrangler d1 list           # List databases
wrangler d1 execute DB --command "SQL"  # Run SQL

# Deployment
./deploy.sh production     # Deploy to production
wrangler pages deployment tail  # View logs

# Debugging
pnpm run lint              # Check code quality
npx tsc --noEmit          # Type check
pnpm test:coverage        # Test coverage
```

### Environment Variables

```bash
# Required
PAYLOAD_SECRET=            # CMS secret
IP_HASH_SALT=             # Analytics salt

# Optional
RESEND_API_KEY=           # Email service
OPENAI_API_KEY=           # AI features
```

### Common File Locations

```
.dev.vars                  # Local environment variables
wrangler.toml             # Cloudflare configuration
next.config.ts            # Next.js configuration
src/payload.config.ts     # CMS configuration
vitest.config.ts          # Test configuration
```

---

**Last Updated**: 2026-02-01

**Need more help?** Email hello@campaignsites.net
