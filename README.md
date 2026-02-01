# CampaignSites.net

[![CI Status](https://github.com/yourusername/campaignsites.net/workflows/CI/badge.svg)](https://github.com/yourusername/campaignsites.net/actions)
[![Deploy Status](https://github.com/yourusername/campaignsites.net/workflows/Deploy%20to%20Cloudflare/badge.svg)](https://github.com/yourusername/campaignsites.net/actions)

A marketing resource platform and toolkit for campaign landing pages, built with Next.js 15, Payload CMS, and Cloudflare.

## Features

- **Marketing Tools**: UTM Builder, Budget Calculator, Copy Optimizer, Countdown Timer
- **Content Management**: Blog, Case Studies, Gallery powered by Payload CMS
- **AI Integration**: AI Lab for headline and CTA optimization using OpenAI
- **Analytics**: Privacy-focused analytics with D1 database
- **Newsletter**: Email subscription with automated lead magnet delivery

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5.7 |
| CMS | Payload CMS 3.72 |
| Styling | Tailwind CSS 3.4 |
| UI Components | Custom + Lucide React |
| Database | Cloudflare D1 (SQLite) |
| Storage | Cloudflare R2 |
| Deployment | Cloudflare Pages |
| Testing | Vitest + React Testing Library |

## Prerequisites

- Node.js 18.20.2+ or 20.9.0+
- pnpm 9+ or 10+
- Cloudflare account
- (Optional) Resend account for emails
- (Optional) OpenAI API key for AI features

## Local Development

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd campaignsites.net
   pnpm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .dev.vars
   ```

3. **Generate required secrets**:
   ```bash
   # Payload Secret (32 bytes hex)
   openssl rand -hex 32

   # IP Hash Salt (16 bytes hex)
   openssl rand -hex 16
   ```

4. **Add secrets to `.dev.vars`**:
   ```bash
   PAYLOAD_SECRET=<your-payload-secret>
   IP_HASH_SALT=<your-ip-hash-salt>
   ```

5. **Generate types**:
   ```bash
   pnpm run generate:types
   pnpm run generate:importmap
   ```

6. **Start development server**:
   ```bash
   pnpm dev
   ```

   Access the site at `http://localhost:3000`

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm devsafe` | Clean and restart dev server |
| `pnpm build` | Build for production |
| `pnpm test` | Run tests once |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage |
| `pnpm lint` | Run ESLint |
| `pnpm deploy` | Deploy to Cloudflare |

## Project Structure

```
campaignsites.net/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (frontend)/      # Public pages
│   │   ├── (payload)/       # CMS admin routes
│   │   ├── api/             # API routes
│   │   └── actions/         # Server actions
│   ├── collections/         # Payload CMS collections
│   ├── components/          # React components
│   │   └── ui/              # UI primitives
│   ├── lib/                 # Utility functions
│   ├── migrations/          # Database migrations
│   └── payload.config.ts    # CMS configuration
├── tests/                   # Test files
├── docs/                    # Documentation
├── public/                  # Static assets
└── deploy.sh                # Deployment script
```

## Environment Variables

### Required

| Variable | Description | Generate With |
|----------|-------------|---------------|
| `PAYLOAD_SECRET` | CMS authentication | `openssl rand -hex 32` |
| `IP_HASH_SALT` | Analytics IP anonymization | `openssl rand -hex 16` |

### Optional

| Variable | Description | Get From |
|----------|-------------|----------|
| `RESEND_API_KEY` | Email service | [resend.com](https://resend.com) |
| `RESEND_FROM` | Email sender | - |
| `OPENAI_API_KEY` | AI features | [platform.openai.com](https://platform.openai.com) |
| `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN` | Web analytics | Cloudflare Dashboard |

See `.env.example` for complete list.

## Deployment

### Automated Deployment

Use the deployment script:

```bash
# Deploy to production
./deploy.sh production

# Deploy to preview
./deploy.sh preview

# Show help
./deploy.sh --help
```

### Manual Deployment

1. **Authenticate with Cloudflare**:
   ```bash
   wrangler login
   ```

2. **Configure wrangler.toml**:
   - Copy `wrangler.toml.example` to `wrangler.toml`
   - Update database IDs and bucket names

3. **Deploy database migrations**:
   ```bash
   pnpm run deploy:database
   ```

4. **Deploy application**:
   ```bash
   pnpm run deploy:app
   ```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Testing

### Run Tests

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# With coverage
pnpm test:coverage

# UI mode
pnpm test:ui
```

### Test Structure

```
tests/
├── setup.ts              # Test configuration
├── lib/                  # Lib function tests
├── components/           # Component tests
└── api/                  # API route tests

src/
├── lib/__tests__/        # Co-located lib tests
├── components/__tests__/ # Co-located component tests
└── app/api/__tests__/    # Co-located API tests
```

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## Documentation

Comprehensive documentation is available:

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design decisions
- **[API.md](./API.md)** - Complete API reference with examples
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment procedures and configuration
- **[SECURITY.md](./SECURITY.md)** - Security policy and best practices
- **[PERFORMANCE.md](./PERFORMANCE.md)** - Performance optimization guide
- **[TESTING.md](./TESTING.md)** - Testing strategy and guidelines
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and changes

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

## License

MIT License - See LICENSE file for details

## Support

- **Documentation**: See links above
- **Issues**: [GitHub Issues](https://github.com/yourusername/campaignsites.net/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/campaignsites.net/discussions)
- **Email**: hello@campaignsites.net
- **Security**: security@campaignsites.net (for security issues only)
