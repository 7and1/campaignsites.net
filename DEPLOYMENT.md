# Deployment Guide

Complete guide for deploying CampaignSites.net to Cloudflare.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Environment Configuration](#environment-configuration)
- [Deployment Process](#deployment-process)
- [Post-Deployment](#post-deployment)
- [Rollback](#rollback)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Accounts

- [Cloudflare](https://dash.cloudflare.com) account
- (Optional) [Resend](https://resend.com) account for email
- (Optional) [OpenAI](https://platform.openai.com) account for AI features

### Required Tools

```bash
# Install Wrangler CLI
npm install -g wrangler

# Verify installation
wrangler --version

# Authenticate
wrangler login
```

## Initial Setup

### 1. Create Cloudflare Resources

#### D1 Database

```bash
# Create database
wrangler d1 create campaign-db

# Note the database_id from output
```

#### R2 Buckets

```bash
# Create media bucket
wrangler r2 bucket create campaign-media

# Create cache bucket
wrangler r2 bucket create campaignsites-cache
```

#### Pages Project

```bash
# Create Pages project
wrangler pages project create campaignsites
```

### 2. Configure wrangler.toml

Copy the example and update with your IDs:

```bash
cp wrangler.toml.example wrangler.toml
```

Edit `wrangler.toml`:

```toml
name = "campaignsites"
compatibility_date = "2025-08-15"
compatibility_flags = ["nodejs_compat", "global_fetch_strictly_public"]
main = ".open-next/worker.js"

[assets]
directory = ".open-next/assets"
binding = "ASSETS"

[[d1_databases]]
binding = "D1"
database_name = "campaign-db"
database_id = "YOUR-D1-DATABASE-ID"  # Replace with your ID

[[r2_buckets]]
binding = "R2"
bucket_name = "campaign-media"

[[r2_buckets]]
binding = "NEXT_INC_CACHE_R2_BUCKET"
bucket_name = "campaignsites-cache"

[vars]
PAYLOAD_SECRET = "YOUR-PAYLOAD-SECRET"  # Generate: openssl rand -hex 32
IP_HASH_SALT = "YOUR-IP-HASH-SALT"      # Generate: openssl rand -hex 16

[env.production]
name = "campaignsites"

[env.production.vars]
PAYLOAD_SECRET = "YOUR-PAYLOAD-SECRET"
IP_HASH_SALT = "YOUR-IP-HASH-SALT"

[[env.production.d1_databases]]
binding = "D1"
database_name = "campaign-db"
database_id = "YOUR-D1-DATABASE-ID"

[[env.production.r2_buckets]]
binding = "R2"
bucket_name = "campaign-media"

[[env.production.r2_buckets]]
binding = "NEXT_INC_CACHE_R2_BUCKET"
bucket_name = "campaignsites-cache"
```

### 3. Set Up Environment Secrets

For sensitive values, use Wrangler secrets:

```bash
# Set secrets for production
wrangler secret put RESEND_API_KEY --env=production
wrangler secret put OPENAI_API_KEY --env=production
```

## Environment Configuration

### Production Environment Variables

Set in Cloudflare Dashboard or via Wrangler:

| Variable | Type | Description |
|----------|------|-------------|
| `PAYLOAD_SECRET` | Plaintext | CMS auth secret |
| `IP_HASH_SALT` | Plaintext | Analytics salt |
| `RESEND_API_KEY` | Secret | Email API key |
| `RESEND_FROM` | Plaintext | Email sender |
| `OPENAI_API_KEY` | Secret | OpenAI API key |

### Cloudflare Dashboard Setup

1. Go to **Workers & Pages** > **campaignsites**
2. Navigate to **Settings** > **Variables**
3. Add plaintext variables
4. Add encrypted secrets

## Deployment Process

### Automated Deployment (Recommended)

Use the deployment script:

```bash
# Make script executable
chmod +x deploy.sh

# Deploy to production
./deploy.sh production

# Deploy to preview/staging
./deploy.sh preview
```

The script performs:
1. Pre-deployment checks
2. Type generation
3. Database migrations
4. Build verification
5. Application deployment
6. Post-deployment checks

### Manual Deployment

#### Step 1: Generate Types

```bash
pnpm run generate:types
pnpm run generate:importmap
```

#### Step 2: Run Migrations

```bash
export CLOUDFLARE_ENV=production
pnpm run deploy:database
```

#### Step 3: Build and Deploy

```bash
export CLOUDFLARE_ENV=production
pnpm run deploy:app
```

### CI/CD Deployment

GitHub Actions workflow (`.github/workflows/deploy.yml`):

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Generate types
        run: pnpm run generate:types

      - name: Deploy database
        run: pnpm run deploy:database
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ENV: production

      - name: Deploy app
        run: pnpm run deploy:app
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ENV: production
```

## Post-Deployment

### Verification Checklist

- [ ] Site loads at deployment URL
- [ ] Homepage renders correctly
- [ ] Admin panel accessible at `/admin`
- [ ] Database tables created
- [ ] API routes responding (test `/api/subscribe`)
- [ ] Images loading from R2
- [ ] Analytics tracking events

### Health Check Endpoints

```bash
# Check homepage
curl https://campaignsites.net

# Check API
curl -X POST https://campaignsites.net/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Check D1 connection
wrangler d1 execute campaign-db --command "SELECT 1" --remote
```

### Monitoring

Set up in Cloudflare Dashboard:

1. **Analytics**: Pages > campaignsites > Analytics
2. **Logs**: Workers > Logs
3. **Alerts**: Configure for error rate thresholds

## Rollback

### Using Deployment Script

```bash
./deploy.sh rollback
```

This shows rollback instructions and recent deployments.

### Manual Rollback

```bash
# List recent deployments
wrangler pages deployments list --project-name=campaignsites

# Rollback to specific deployment
wrangler pages deployment rollback DEPLOYMENT_ID --project-name=campaignsites
```

### Dashboard Rollback

1. Go to **Workers & Pages** > **campaignsites**
2. Click **Deployments**
3. Find the previous working deployment
4. Click **Rollback**

## Troubleshooting

### Build Failures

**Issue**: Build fails with type errors

```bash
# Solution: Regenerate types
pnpm run generate:types
pnpm run generate:importmap
```

**Issue**: Out of memory during build

```bash
# Solution: Increase Node memory
export NODE_OPTIONS="--max-old-space-size=8000"
pnpm run build
```

### Database Issues

**Issue**: Migration fails

```bash
# Check D1 connection
wrangler d1 execute campaign-db --command "SELECT name FROM sqlite_master WHERE type='table'" --remote

# View migration status
wrangler d1 migrations list campaign-db

# Apply pending migrations
wrangler d1 migrations apply campaign-db
```

**Issue**: Table not found

```bash
# Verify tables exist
wrangler d1 execute campaign-db --command ".tables" --remote
```

### Deployment Failures

**Issue**: Wrangler not authenticated

```bash
wrangler login
```

**Issue**: Missing bindings

```bash
# Verify wrangler.toml
wrangler config validate

# Check secrets
wrangler secret list --env=production
```

### Runtime Errors

**Issue**: 500 errors on API routes

```bash
# Check logs
wrangler pages deployment tail --project-name=campaignsites

# Check D1 connection from deployed worker
wrangler d1 execute campaign-db --command "SELECT 1" --remote
```

**Issue**: Images not loading

```bash
# Verify R2 bucket exists
wrangler r2 bucket list

# Check R2 permissions
wrangler r2 bucket info campaign-media
```

### Common Error Messages

| Error | Solution |
|-------|----------|
| `D1 binding is missing` | Check wrangler.toml D1 configuration |
| `PAYLOAD_SECRET is missing` | Set secret in Cloudflare Dashboard |
| `Module not found` | Run `pnpm install` and rebuild |
| `Build failed` | Check for TypeScript errors |
| `Rate limit exceeded` | Wait and retry, or check rate limit config |

### Getting Help

1. Check [Cloudflare Status](https://www.cloudflarestatus.com/)
2. Review [Wrangler Documentation](https://developers.cloudflare.com/workers/wrangler/)
3. Check [Payload CMS Docs](https://payloadcms.com/docs)
4. Open an issue in the repository

## Security Checklist

Before production deployment:

- [ ] Changed default PAYLOAD_SECRET
- [ ] Changed default IP_HASH_SALT
- [ ] Set strong secrets for all services
- [ ] Enabled HTTPS (automatic on Cloudflare)
- [ ] Configured CORS if needed
- [ ] Set up rate limiting
- [ ] Reviewed API access controls
- [ ] Enabled audit logging

## Performance Optimization

### Recommended Settings

In `wrangler.toml`:

```toml
[env.production]
# Enable smart placement
placement = { mode = "smart" }
```

In Cloudflare Dashboard:

1. Enable **Auto Minify** for CSS/JS/HTML
2. Enable **Brotli** compression
3. Set **Browser Cache TTL**
4. Configure **Page Rules** for caching

## Maintenance

### Regular Tasks

- [ ] Review error logs weekly
- [ ] Monitor database size
- [ ] Update dependencies monthly
- [ ] Rotate secrets quarterly
- [ ] Review and prune old deployments

### Database Maintenance

```bash
# Optimize D1 database
wrangler d1 execute campaign-db --command "PRAGMA optimize" --remote

# Check database size
wrangler d1 execute campaign-db --command "PRAGMA page_count" --remote
```
