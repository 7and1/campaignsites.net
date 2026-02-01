import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { validateCsrfToken, getCsrfToken, setCsrfCookie } from '@/lib/csrf'

/**
 * Security headers middleware
 * Implements CSP, HSTS, CSRF protection, and other security headers
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname, searchParams } = request.nextUrl

  // CSRF Protection for state-changing API routes
  // Validate CSRF token for POST, PUT, DELETE, PATCH requests to /api/*
  if (
    pathname.startsWith('/api/') &&
    !pathname.startsWith('/api/health') && // Exclude health check
    ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)
  ) {
    try {
      const csrfToken = request.headers.get('x-csrf-token')
      await validateCsrfToken(csrfToken)
    } catch (error) {
      // CSRF validation failed
      return NextResponse.json(
        { error: 'Invalid or missing CSRF token' },
        { status: 403 }
      )
    }
  }

  const response = NextResponse.next()

  // Set CSRF cookie for all page requests (not API routes)
  // This ensures the token is available for client-side forms
  if (!pathname.startsWith('/api/') && !pathname.startsWith('/_next/')) {
    const existingToken = await getCsrfToken()
    if (!existingToken) {
      await setCsrfCookie()
    }
  }

  // Content Security Policy - Production-ready with specific domains
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.cloudflare.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.cloudflare.com https://*.cloudinary.com https://*.campaignsites.net;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
    connect-src 'self' https://*.openai.com https://*.cloudflare.com https://api.resend.com;
    worker-src 'self' blob:;
    manifest-src 'self';
  `.replace(/\s+/g, ' ').trim()

  // Security headers - Production-ready configuration
  const securityHeaders = {
    // Content Security Policy
    'Content-Security-Policy': cspHeader,

    // Strict Transport Security (HSTS) - 1 year, include subdomains, preload
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

    // Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // XSS Protection (legacy but still useful for older browsers)
    'X-XSS-Protection': '1; mode=block',

    // Referrer Policy - Balance privacy and functionality
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions Policy - Disable unnecessary browser features
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), display-capture=(), document-domain=(), encrypted-media=(), fullscreen=(self), picture-in-picture=()',

    // Cross-Origin policies for enhanced security
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',

    // Prevent DNS prefetching for privacy
    'X-DNS-Prefetch-Control': 'off',

    // Disable client-side caching for sensitive pages (overridden for static assets)
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  }

  // Apply all security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

// Apply middleware to all routes except static files and API routes that need special handling
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
