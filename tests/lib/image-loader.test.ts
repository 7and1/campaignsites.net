import { describe, it, expect } from 'vitest'
import cloudflareImageLoader, { generateSrcSet } from '@/lib/image-loader'

describe('cloudflareImageLoader', () => {
  it('generates correct URL for relative paths', () => {
    const result = cloudflareImageLoader({
      src: '/images/test.jpg',
      width: 800,
      quality: 80,
    })

    expect(result).toContain('/cdn-cgi/image/')
    expect(result).toContain('width=800')
    expect(result).toContain('quality=80')
    expect(result).toContain('format=auto')
    expect(result).toContain('fit=scale-down')
  })

  it('generates correct URL for absolute URLs', () => {
    const result = cloudflareImageLoader({
      src: 'https://example.com/image.jpg',
      width: 1200,
      quality: 90,
    })

    expect(result).toContain('/cdn-cgi/image/')
    expect(result).toContain('width=1200')
    expect(result).toContain('quality=90')
    expect(result).toContain('https://example.com/image.jpg')
  })

  it('skips optimization for data URLs', () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    const result = cloudflareImageLoader({
      src: dataUrl,
      width: 800,
      quality: 80,
    })

    expect(result).toBe(dataUrl)
  })

  it('skips optimization for SVG files', () => {
    const svgUrl = '/images/logo.svg'
    const result = cloudflareImageLoader({
      src: svgUrl,
      width: 800,
      quality: 80,
    })

    expect(result).toBe(svgUrl)
  })

  it('skips already optimized images', () => {
    const optimizedUrl = '/cdn-cgi/image/width=800/image.jpg'
    const result = cloudflareImageLoader({
      src: optimizedUrl,
      width: 1200,
      quality: 80,
    })

    expect(result).toBe(optimizedUrl)
  })

  it('uses default quality when not specified', () => {
    const result = cloudflareImageLoader({
      src: '/images/test.jpg',
      width: 800,
    })

    expect(result).toContain('quality=80')
  })

  it('handles different widths', () => {
    const widths = [320, 640, 1024, 1920]

    for (const width of widths) {
      const result = cloudflareImageLoader({
        src: '/images/test.jpg',
        width,
        quality: 80,
      })

      expect(result).toContain(`width=${width}`)
    }
  })

  it('handles different quality values', () => {
    const qualities = [50, 75, 90, 100]

    for (const quality of qualities) {
      const result = cloudflareImageLoader({
        src: '/images/test.jpg',
        width: 800,
        quality,
      })

      expect(result).toContain(`quality=${quality}`)
    }
  })

  it('handles images without leading slash', () => {
    const result = cloudflareImageLoader({
      src: 'images/test.jpg',
      width: 800,
      quality: 80,
    })

    expect(result).toContain('/cdn-cgi/image/')
  })
})

describe('generateSrcSet', () => {
  it('generates srcset for default widths', () => {
    const srcset = generateSrcSet('/images/test.jpg')

    expect(srcset).toContain('640w')
    expect(srcset).toContain('750w')
    expect(srcset).toContain('828w')
    expect(srcset).toContain('1080w')
    expect(srcset).toContain('1200w')
    expect(srcset).toContain('1920w')
  })

  it('generates srcset for custom widths', () => {
    const srcset = generateSrcSet('/images/test.jpg', [320, 640, 1280])

    expect(srcset).toContain('320w')
    expect(srcset).toContain('640w')
    expect(srcset).toContain('1280w')
    expect(srcset).not.toContain('750w')
  })

  it('includes quality parameter', () => {
    const srcset = generateSrcSet('/images/test.jpg', [640, 1280], 90)

    expect(srcset).toContain('quality=90')
  })

  it('uses default quality when not specified', () => {
    const srcset = generateSrcSet('/images/test.jpg', [640])

    expect(srcset).toContain('quality=80')
  })

  it('formats srcset correctly', () => {
    const srcset = generateSrcSet('/images/test.jpg', [640, 1280])

    // Should be comma-separated
    expect(srcset).toContain(', ')

    // Each entry should have width descriptor
    const entries = srcset.split(', ')
    expect(entries.length).toBe(2)
    expect(entries[0]).toMatch(/640w$/)
    expect(entries[1]).toMatch(/1280w$/)
  })

  it('handles single width', () => {
    const srcset = generateSrcSet('/images/test.jpg', [800])

    expect(srcset).toContain('800w')
    expect(srcset).not.toContain(',')
  })

  it('handles empty widths array', () => {
    const srcset = generateSrcSet('/images/test.jpg', [])

    expect(srcset).toBe('')
  })
})
