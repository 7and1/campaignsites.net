# Security Policy

## Table of Contents

- [Reporting Vulnerabilities](#reporting-vulnerabilities)
- [Security Features](#security-features)
- [Best Practices](#best-practices)
- [Compliance](#compliance)
- [Security Architecture](#security-architecture)
- [Incident Response](#incident-response)

## Reporting Vulnerabilities

We take security seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please email us at:

**Email**: security@campaignsites.net

**Subject**: [SECURITY] Brief description of the issue

### What to Include

Please include the following information:

1. **Description**: Clear description of the vulnerability
2. **Impact**: Potential impact and severity
3. **Steps to Reproduce**: Detailed steps to reproduce the issue
4. **Proof of Concept**: Code or screenshots demonstrating the issue
5. **Suggested Fix**: If you have ideas for remediation
6. **Your Contact Info**: So we can follow up with you

### Response Timeline

- **Initial Response**: Within 24 hours
- **Status Update**: Within 72 hours
- **Fix Timeline**: Depends on severity
  - Critical: 24-48 hours
  - High: 1 week
  - Medium: 2 weeks
  - Low: 1 month

### Disclosure Policy

- We will acknowledge your report within 24 hours
- We will provide regular updates on our progress
- We will notify you when the issue is fixed
- We will publicly disclose the issue after a fix is deployed (with your permission)
- We will credit you in our security acknowledgments (if desired)

## Security Features

### Transport Security

#### HTTPS Everywhere

- **TLS 1.3**: Modern encryption protocol
- **HSTS**: HTTP Strict Transport Security with preload
- **Certificate Pinning**: Prevents MITM attacks
- **Automatic Redirects**: HTTP → HTTPS

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### Application Security

#### Content Security Policy (CSP)

Strict CSP prevents XSS attacks:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.cloudflare.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://*.cloudflare.com https://*.campaignsites.net;
  connect-src 'self' https://*.openai.com https://*.cloudflare.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
```

#### CSRF Protection

All state-changing requests require CSRF tokens:

- **Token Generation**: Cryptographically secure random tokens
- **Token Storage**: Secure HTTP-only cookies
- **Token Validation**: Server-side validation on every request
- **Token Rotation**: Tokens expire after 24 hours

**Implementation**: `src/lib/csrf.ts`, `src/middleware.ts`

#### XSS Prevention

Multiple layers of XSS protection:

1. **Input Sanitization**: All user input is sanitized
2. **Output Encoding**: HTML entities escaped
3. **CSP**: Prevents inline script execution
4. **React**: Automatic XSS protection in JSX

**Implementation**: `src/lib/sanitization.ts`

```typescript
// Sanitize HTML content
sanitizeHtml(userInput)

// Sanitize URLs
sanitizeUrl(userUrl)

// Escape HTML entities
escapeHtml(userText)
```

#### SQL Injection Prevention

- **Parameterized Queries**: All database queries use prepared statements
- **Input Validation**: Zod schemas validate all inputs
- **Type Safety**: TypeScript prevents type confusion

```typescript
// Safe - parameterized query
db.prepare('SELECT * FROM users WHERE email = ?').bind(email)

// NEVER do this - vulnerable to SQL injection
db.prepare(`SELECT * FROM users WHERE email = '${email}'`)
```

#### Rate Limiting

Prevents brute force and DoS attacks:

| Endpoint | Limit | Window |
|----------|-------|--------|
| Newsletter Subscribe | 5 requests | 1 hour |
| Contact Form | 3 requests | 1 hour |
| Case Study Submit | 5 requests | 1 hour |
| Analytics Tracking | 100 requests | 1 minute |
| AI Features | 10 requests | 1 hour |

**Implementation**: `src/lib/rate-limit.ts`

**Storage**: Cloudflare KV (edge-optimized)

### Data Security

#### Privacy-First Analytics

- **IP Hashing**: IP addresses hashed with HMAC-SHA256
- **No PII Storage**: No personally identifiable information
- **Anonymization**: User data anonymized before storage
- **Minimal Collection**: Only essential data collected

```typescript
// IP addresses are hashed, never stored in plain text
const hashedIp = crypto
  .createHmac('sha256', process.env.PAYLOAD_SECRET)
  .update(ip)
  .digest('hex')
```

#### Email Security

- **Unsubscribe Links**: Cryptographically signed tokens
- **List-Unsubscribe Headers**: RFC 8058 compliance
- **No Tracking by Default**: Opt-in tracking only
- **Secure Tokens**: Time-limited, single-use tokens

#### Secret Management

- **Environment Variables**: All secrets in environment variables
- **No Hardcoded Secrets**: Automated checks in CI/CD
- **Cloudflare Secrets**: Encrypted at rest
- **Secret Rotation**: Regular rotation recommended

**Never commit**:
- `.env` files
- `.dev.vars` files
- API keys
- Database credentials
- PAYLOAD_SECRET

### Access Control

#### CMS Authentication

- **Payload CMS**: Built-in authentication
- **Session Management**: Secure session handling
- **Role-Based Access**: Admin-only access to CMS
- **Password Requirements**: Strong password enforcement

#### API Security

- **Public Endpoints**: Rate-limited, validated
- **Admin Endpoints**: Authentication required
- **CORS**: Restricted to same-origin
- **API Keys**: For external integrations (future)

### Infrastructure Security

#### Cloudflare Protection

- **DDoS Protection**: Automatic mitigation
- **WAF**: Web Application Firewall
- **Bot Management**: Automated bot detection
- **Edge Security**: Security at 300+ locations

#### Network Security

- **Firewall Rules**: Cloudflare firewall rules
- **IP Blocking**: Automatic blocking of malicious IPs
- **Geographic Restrictions**: Optional geo-blocking
- **Challenge Pages**: CAPTCHA for suspicious traffic

## Best Practices

### For Developers

#### Secure Coding

1. **Validate All Input**: Use Zod schemas
2. **Sanitize Output**: Escape HTML entities
3. **Use Parameterized Queries**: Never concatenate SQL
4. **Check Authentication**: Verify user permissions
5. **Handle Errors Safely**: Don't leak sensitive info

```typescript
// Good - validated input
const result = subscribeSchema.safeParse(body)
if (!result.success) {
  return error(result.error.message)
}

// Good - parameterized query
db.prepare('INSERT INTO users (email) VALUES (?)').bind(email)

// Bad - concatenated query (SQL injection risk)
db.prepare(`INSERT INTO users (email) VALUES ('${email}')`)
```

#### Dependency Management

1. **Keep Dependencies Updated**: Regular updates
2. **Audit Dependencies**: `pnpm audit`
3. **Review Changes**: Check changelogs
4. **Pin Versions**: Use exact versions in production

```bash
# Check for vulnerabilities
pnpm audit

# Update dependencies
pnpm update

# Check for outdated packages
pnpm outdated
```

#### Secret Management

1. **Use Environment Variables**: Never hardcode
2. **Rotate Secrets Regularly**: Every 90 days
3. **Limit Secret Access**: Need-to-know basis
4. **Use Strong Secrets**: 32+ characters, random

```bash
# Generate strong secrets
openssl rand -hex 32  # PAYLOAD_SECRET
openssl rand -hex 16  # IP_HASH_SALT
```

### For Users

#### Account Security

1. **Strong Passwords**: 12+ characters, mixed case, numbers, symbols
2. **Unique Passwords**: Don't reuse passwords
3. **Password Manager**: Use a password manager
4. **Two-Factor Auth**: Enable when available (future)

#### Email Security

1. **Verify Sender**: Check email sender address
2. **Suspicious Links**: Hover before clicking
3. **Unsubscribe**: Use official unsubscribe links
4. **Report Phishing**: Forward to security@campaignsites.net

### For Administrators

#### Deployment Security

1. **Review Changes**: Code review before deployment
2. **Test Security**: Run security tests
3. **Monitor Logs**: Check for suspicious activity
4. **Backup Data**: Regular backups

```bash
# Run security tests
pnpm run test:security

# Check for secrets in code
grep -r "PAYLOAD_SECRET.*=" src/

# Review deployment logs
wrangler pages deployment tail
```

#### Monitoring

1. **Error Tracking**: Monitor error rates
2. **Rate Limit Alerts**: Alert on rate limit hits
3. **Failed Login Attempts**: Monitor CMS logins
4. **Unusual Traffic**: Alert on traffic spikes

## Compliance

### GDPR Compliance

We are committed to GDPR compliance:

#### Data Collection

- **Minimal Data**: Only collect necessary data
- **Explicit Consent**: Clear consent for data collection
- **Purpose Limitation**: Data used only for stated purposes
- **Data Minimization**: Collect minimum required data

#### User Rights

Users have the right to:

1. **Access**: Request their data
2. **Rectification**: Correct inaccurate data
3. **Erasure**: Request data deletion
4. **Portability**: Export their data
5. **Object**: Opt-out of processing

**Contact**: privacy@campaignsites.net

#### Data Processing

- **Lawful Basis**: Consent or legitimate interest
- **Transparency**: Clear privacy policy
- **Security**: Appropriate technical measures
- **Breach Notification**: Within 72 hours

### Privacy Policy

See our [Privacy Policy](https://campaignsites.net/privacy) for details on:

- What data we collect
- How we use it
- How we protect it
- Your rights
- How to contact us

### Cookie Policy

We use cookies for:

1. **Essential**: CSRF protection, sessions
2. **Analytics**: Cloudflare Web Analytics (privacy-friendly)
3. **Preferences**: User settings

Users can control cookies via browser settings.

## Security Architecture

### Defense in Depth

Multiple layers of security:

```
Layer 1: Network (Cloudflare DDoS, WAF)
    ↓
Layer 2: Transport (HTTPS, HSTS)
    ↓
Layer 3: Application (CSP, CSRF, XSS prevention)
    ↓
Layer 4: Data (Encryption, hashing, sanitization)
    ↓
Layer 5: Access Control (Authentication, authorization)
```

### Security Headers

All responses include security headers:

```
Content-Security-Policy: [strict policy]
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()...
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

### Threat Model

#### Threats We Protect Against

1. **XSS (Cross-Site Scripting)**
   - Mitigation: CSP, input sanitization, output encoding

2. **CSRF (Cross-Site Request Forgery)**
   - Mitigation: CSRF tokens, SameSite cookies

3. **SQL Injection**
   - Mitigation: Parameterized queries, input validation

4. **DDoS (Distributed Denial of Service)**
   - Mitigation: Cloudflare protection, rate limiting

5. **Brute Force Attacks**
   - Mitigation: Rate limiting, account lockout

6. **Session Hijacking**
   - Mitigation: Secure cookies, HTTPS only

7. **Data Breaches**
   - Mitigation: Encryption, hashing, minimal data collection

8. **Man-in-the-Middle (MITM)**
   - Mitigation: HTTPS, HSTS, certificate pinning

#### Out of Scope

- Physical security of Cloudflare data centers
- Security of third-party services (OpenAI, Resend)
- Client-side security (user's device)

## Incident Response

### Incident Response Plan

#### 1. Detection

- Automated monitoring and alerts
- User reports
- Security audits
- Penetration testing

#### 2. Assessment

- Determine severity (Critical, High, Medium, Low)
- Identify affected systems
- Estimate impact
- Document findings

#### 3. Containment

- Isolate affected systems
- Block malicious traffic
- Revoke compromised credentials
- Deploy emergency patches

#### 4. Eradication

- Remove malicious code
- Patch vulnerabilities
- Update security rules
- Verify system integrity

#### 5. Recovery

- Restore from backups if needed
- Verify system functionality
- Monitor for recurrence
- Gradual service restoration

#### 6. Post-Incident

- Document incident details
- Conduct post-mortem
- Update security measures
- Notify affected users
- Report to authorities (if required)

### Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| **Critical** | Immediate threat to data or availability | < 1 hour | Data breach, RCE, complete outage |
| **High** | Significant security risk | < 4 hours | Authentication bypass, SQL injection |
| **Medium** | Moderate security risk | < 24 hours | XSS, CSRF, information disclosure |
| **Low** | Minor security issue | < 1 week | Missing security header, outdated dependency |

### Communication

#### Internal

- Security team notified immediately
- Development team briefed
- Management informed
- Documentation updated

#### External

- Users notified if affected
- Public disclosure after fix
- Security advisories published
- Credit given to reporters

## Security Checklist

### Pre-Deployment

- [ ] All dependencies updated
- [ ] Security tests passing
- [ ] No hardcoded secrets
- [ ] CSRF protection enabled
- [ ] Rate limiting configured
- [ ] Security headers set
- [ ] Input validation implemented
- [ ] Output sanitization implemented
- [ ] Error handling doesn't leak info
- [ ] Logging configured properly

### Post-Deployment

- [ ] HTTPS working correctly
- [ ] Security headers present
- [ ] Rate limiting working
- [ ] CSRF protection working
- [ ] Error tracking enabled
- [ ] Monitoring configured
- [ ] Backups scheduled
- [ ] Incident response plan ready

### Regular Maintenance

- [ ] Review security logs (weekly)
- [ ] Update dependencies (monthly)
- [ ] Rotate secrets (quarterly)
- [ ] Security audit (annually)
- [ ] Penetration testing (annually)
- [ ] Review access controls (quarterly)
- [ ] Update documentation (as needed)

## Security Tools

### Automated Security

```bash
# Dependency audit
pnpm audit

# Security tests
pnpm run test:security

# Check for secrets
grep -r "PAYLOAD_SECRET.*=" src/

# Lint for security issues
pnpm run lint
```

### Manual Security

- Code review for all changes
- Penetration testing (external)
- Security audits (periodic)
- Threat modeling (ongoing)

## Resources

### Internal Documentation

- [Architecture](./ARCHITECTURE.md) - Security architecture
- [API Documentation](./API.md) - API security
- [Deployment Guide](./DEPLOYMENT.md) - Secure deployment

### External Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Cloudflare Security](https://www.cloudflare.com/security/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [GDPR Compliance](https://gdpr.eu/)

## Contact

### Security Team

- **Email**: security@campaignsites.net
- **Response Time**: Within 24 hours
- **PGP Key**: Available on request

### General Inquiries

- **Email**: hello@campaignsites.net
- **Website**: https://campaignsites.net

## Acknowledgments

We thank the following security researchers for responsibly disclosing vulnerabilities:

(List will be updated as vulnerabilities are reported and fixed)

---

**Last Updated**: 2026-02-01

**Version**: 1.0.0
