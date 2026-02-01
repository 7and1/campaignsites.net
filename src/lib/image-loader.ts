import type { ImageLoaderProps } from 'next/image'

/**
 * Cloudflare Image Resizing loader for Next.js
 * Supports responsive images with automatic format optimization
 *
 * @see https://developers.cloudflare.com/images/image-resizing/
 */
export default function cloudflareImageLoader({ src, width, quality }: ImageLoaderProps): string {
  // Skip optimization for data URLs, SVGs, or already optimized images
  if (src.startsWith('data:') || src.endsWith('.svg') || src.includes('/cdn-cgi/')) {
    return src
  }

  // Use Cloudflare Image Resizing
  const params = new URLSearchParams({
    width: width.toString(),
    quality: (quality || 80).toString(),
    format: 'auto',
    fit: 'scale-down',
  })

  // Handle absolute URLs
  if (src.startsWith('http')) {
    return `/cdn-cgi/image/${params.toString()}/${src}`
  }

  // Handle relative URLs
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://campaignsites.net'
  const absoluteUrl = src.startsWith('/') ? `${baseUrl}${src}` : `${baseUrl}/${src}`

  return `/cdn-cgi/image/${params.toString()}/${absoluteUrl}`
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(
  src: string,
  widths: number[] = [640, 750, 828, 1080, 1200, 1920],
  quality?: number
): string {
  return widths
    .map((width) => `${cloudflareImageLoader({ src, width, quality: quality || 80 })} ${width}w`)
    .join(', ')
}

/**
 * Get image dimensions for aspect ratio calculation
 */
export function getImageDimensions(
  src: string
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null)
      return
    }

    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => resolve(null)
    img.src = src
  })
}
