import { describe, it, expect } from 'vitest'
import {
  escapeHtml,
  sanitizeContent,
  sanitizeUtm,
  sanitizeUrl,
  validateEmail,
  truncate,
  safeJsonStringify,
} from '../sanitization'

describe('sanitization', () => {
  describe('escapeHtml', () => {
    it('escapes ampersands', () => {
      expect(escapeHtml('a & b & c')).toBe('a &amp; b &amp; c')
    })

    it('escapes less than signs', () => {
      expect(escapeHtml('if (a < b)')).toBe('if (a &lt; b)')
    })

    it('escapes greater than signs', () => {
      expect(escapeHtml('if (a > b)')).toBe('if (a &gt; b)')
    })

    it('escapes double quotes', () => {
      expect(escapeHtml('"quoted text"')).toBe('&quot;quoted text&quot;')
    })

    it('escapes single quotes', () => {
      expect(escapeHtml("'single quoted'")).toBe('&#x27;single quoted&#x27;')
    })

    it('escapes forward slashes', () => {
      expect(escapeHtml('path/to/file')).toBe('path&#x2F;to&#x2F;file')
    })

    it('escapes all special characters in combination', () => {
      const input = '<script>alert("XSS")</script>'
      const expected = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;'
      expect(escapeHtml(input)).toBe(expected)
    })

    it('handles empty strings', () => {
      expect(escapeHtml('')).toBe('')
    })

    it('preserves safe text unchanged', () => {
      expect(escapeHtml('Hello World 123')).toBe('Hello World 123')
    })
  })

  describe('sanitizeContent', () => {
    it('removes script tags and their content', () => {
      expect(sanitizeContent('<script>alert(1)</script>')).toBe('')
      expect(sanitizeContent('Hello <script>evil()</script> World')).toBe('Hello World')
    })

    it('removes iframe tags', () => {
      expect(sanitizeContent('<iframe src="evil.com"></iframe>')).toBe('')
    })

    it('removes object tags', () => {
      expect(sanitizeContent('<object data="evil.swf"></object>')).toBe('')
    })

    it('removes embed tags', () => {
      expect(sanitizeContent('<embed src="evil.swf">')).toBe('')
    })

    it('removes all HTML tags', () => {
      expect(sanitizeContent('<p>Hello</p>')).toBe('Hello')
      expect(sanitizeContent('<div class="test">Content</div>')).toBe('Content')
      expect(sanitizeContent('<b>Bold</b> and <i>Italic</i>')).toBe('Bold and Italic')
    })

    it('removes javascript: protocol', () => {
      expect(sanitizeContent('javascript:alert(1)')).toBe('alert(1)')
    })

    it('removes event handlers', () => {
      expect(sanitizeContent('<div onclick="evil()">Click me</div>')).toBe('Click me')
      expect(sanitizeContent('<img onload="evil()" src="x">')).toBe('')
    })

    it('removes data:text/html URLs', () => {
      expect(sanitizeContent('data:text/html,<script>alert(1)</script>')).toBe(',')
    })

    it('normalizes whitespace', () => {
      expect(sanitizeContent('Hello    World')).toBe('Hello World')
      expect(sanitizeContent('Hello\n\n\nWorld')).toBe('Hello World')
    })

    it('trims the result', () => {
      expect(sanitizeContent('  Hello World  ')).toBe('Hello World')
    })

    it('handles non-string input', () => {
      expect(sanitizeContent(null as unknown as string)).toBe('')
      expect(sanitizeContent(undefined as unknown as string)).toBe('')
      expect(sanitizeContent(123 as unknown as string)).toBe('')
    })

    it('preserves safe text content', () => {
      expect(sanitizeContent('Hello World')).toBe('Hello World')
      expect(sanitizeContent('This is safe content.')).toBe('This is safe content.')
    })
  })

  describe('sanitizeUtm', () => {
    it('sanitizes all UTM parameters', () => {
      const params = {
        utm_source: 'google<script>',
        utm_medium: 'cpc',
        utm_campaign: 'summer_sale',
      }
      const result = sanitizeUtm(params)
      expect(result.utm_source).toBe('google')
      expect(result.utm_medium).toBe('cpc')
      expect(result.utm_campaign).toBe('summer_sale')
    })

    it('removes HTML tags from values', () => {
      const params = { utm_source: '<b>google</b>' }
      expect(sanitizeUtm(params).utm_source).toBe('google')
    })

    it('removes javascript: protocol', () => {
      const params = { utm_source: 'javascript:alert(1)' }
      expect(sanitizeUtm(params).utm_source).toBe('alert(1)')
    })

    it('normalizes whitespace', () => {
      const params = { utm_source: 'google   ads' }
      expect(sanitizeUtm(params).utm_source).toBe('google ads')
    })

    it('trims values', () => {
      const params = { utm_source: '  google  ' }
      expect(sanitizeUtm(params).utm_source).toBe('google')
    })

    it('limits length to 100 characters', () => {
      const params = { utm_source: 'a'.repeat(150) }
      expect(sanitizeUtm(params).utm_source!.length).toBe(100)
    })

    it('sets null for empty values', () => {
      const params = { utm_source: '', utm_medium: null, utm_campaign: undefined }
      const result = sanitizeUtm(params)
      expect(result.utm_source).toBeNull()
      expect(result.utm_medium).toBeNull()
      expect(result.utm_campaign).toBeNull()
    })

    it('handles non-string values', () => {
      const params = { utm_source: 123 as unknown as string }
      expect(sanitizeUtm(params).utm_source).toBeNull()
    })
  })

  describe('sanitizeUrl', () => {
    it('accepts http URLs', () => {
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com')
    })

    it('accepts https URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com')
    })

    it('accepts mailto URLs', () => {
      expect(sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com')
    })

    it('accepts tel URLs', () => {
      expect(sanitizeUrl('tel:+1234567890')).toBe('tel:+1234567890')
    })

    it('prepends https to bare domains', () => {
      expect(sanitizeUrl('example.com')).toBe('https://example.com')
      expect(sanitizeUrl('www.example.com')).toBe('https://www.example.com')
      expect(sanitizeUrl('sub.domain.example.com')).toBe('https://sub.domain.example.com')
    })

    it('rejects javascript: protocol', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBeNull()
      expect(sanitizeUrl('JAVASCRIPT:alert(1)')).toBeNull()
    })

    it('rejects data: protocol', () => {
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBeNull()
    })

    it('rejects vbscript: protocol', () => {
      expect(sanitizeUrl('vbscript:msgbox(1)')).toBeNull()
    })

    it('rejects file: protocol', () => {
      expect(sanitizeUrl('file:///etc/passwd')).toBeNull()
    })

    it('rejects URLs containing script tags', () => {
      expect(sanitizeUrl('https://example.com/<script>alert(1)</script>')).toBeNull()
      expect(sanitizeUrl('https://example.com/<SCRIPT>alert(1)</SCRIPT>')).toBeNull()
    })

    it('trims URLs', () => {
      expect(sanitizeUrl('  https://example.com  ')).toBe('https://example.com')
    })

    it('limits URL length to 2048 characters', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(3000)
      expect(sanitizeUrl(longUrl)!.length).toBe(2048)
    })

    it('returns null for empty input', () => {
      expect(sanitizeUrl('')).toBeNull()
      expect(sanitizeUrl(null as unknown as string)).toBeNull()
      expect(sanitizeUrl(undefined as unknown as string)).toBeNull()
    })

    it('returns null for invalid URLs', () => {
      expect(sanitizeUrl('not a url')).toBeNull()
      expect(sanitizeUrl('://invalid')).toBeNull()
    })
  })

  describe('validateEmail', () => {
    it('returns true for valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('user+tag@example.io')).toBe(true)
      expect(validateEmail('123@numeric.com')).toBe(true)
      expect(validateEmail('user_name@example.com')).toBe(true)
      expect(validateEmail('user-name@example.com')).toBe(true)
    })

    it('returns false for empty input', () => {
      expect(validateEmail('')).toBe(false)
      expect(validateEmail(null as unknown as string)).toBe(false)
      expect(validateEmail(undefined as unknown as string)).toBe(false)
    })

    it('returns false for emails without @', () => {
      expect(validateEmail('testexample.com')).toBe(false)
    })

    it('returns false for emails starting with dot', () => {
      expect(validateEmail('.test@example.com')).toBe(false)
    })

    it('returns false for emails ending with dot', () => {
      // Note: The validation checks if the FULL email ends with dot
      expect(validateEmail('test@example.com.')).toBe(false)
    })

    it('returns false for emails with consecutive dots', () => {
      expect(validateEmail('test..test@example.com')).toBe(false)
    })

    it('returns false for emails with invalid characters', () => {
      expect(validateEmail('test()@example.com')).toBe(false)
      expect(validateEmail('test<>@example.com')).toBe(false)
      expect(validateEmail('test"@example.com')).toBe(false)
      expect(validateEmail('test[]@example.com')).toBe(false)
    })

    it('returns false for emails containing script tags', () => {
      expect(validateEmail('<script>@example.com')).toBe(false)
      expect(validateEmail('test@<script>.com')).toBe(false)
    })

    it('returns false for emails containing javascript:', () => {
      expect(validateEmail('javascript:alert(1)@example.com')).toBe(false)
    })

    it('returns false for overly long emails', () => {
      const longEmail = 'a'.repeat(250) + '@example.com'
      expect(validateEmail(longEmail)).toBe(false)
    })

    it('returns false for short emails', () => {
      expect(validateEmail('a@')).toBe(false)
      expect(validateEmail('@a')).toBe(false)
    })

    it('trims and lowercases before validation', () => {
      expect(validateEmail('  Test@Example.COM  ')).toBe(true)
    })
  })

  describe('truncate', () => {
    it('returns original text if within limit', () => {
      expect(truncate('Hello', 10)).toBe('Hello')
      expect(truncate('Hello World', 20)).toBe('Hello World')
    })

    it('truncates text exceeding limit', () => {
      expect(truncate('Hello World', 8)).toBe('Hello...')
    })

    it('handles exact length', () => {
      expect(truncate('Hello', 5)).toBe('Hello')
    })

    it('handles empty strings', () => {
      expect(truncate('', 10)).toBe('')
    })

    it('accounts for ellipsis length', () => {
      // 'Hello World' is 11 chars, limit is 8, so 5 chars + '...' = 8
      expect(truncate('Hello World', 8)).toBe('Hello...')
      expect(truncate('Hello World', 8).length).toBe(8)
    })
  })

  describe('safeJsonStringify', () => {
    it('stringifies simple objects', () => {
      expect(safeJsonStringify({ a: 1, b: 2 })).toBe('{"a":1,"b":2}')
    })

    it('stringifies with indentation when space provided', () => {
      const result = safeJsonStringify({ a: 1 }, 2)
      expect(result).toContain('\n')
      expect(result).toContain('  ')
    })

    it('handles functions by converting to [Function]', () => {
      const obj = { fn: () => {} }
      expect(safeJsonStringify(obj)).toBe('{"fn":"[Function]"}')
    })

    it('handles errors by extracting message', () => {
      const obj = { error: new Error('Something went wrong') }
      expect(safeJsonStringify(obj)).toBe('{"error":"Something went wrong"}')
    })

    it('handles circular references gracefully', () => {
      const obj: Record<string, unknown> = { a: 1 }
      obj.self = obj
      expect(safeJsonStringify(obj)).toBe('{}')
    })

    it('handles null', () => {
      expect(safeJsonStringify(null)).toBe('null')
    })

    it('handles undefined', () => {
      expect(safeJsonStringify(undefined)).toBeUndefined()
    })

    it('handles arrays', () => {
      expect(safeJsonStringify([1, 2, 3])).toBe('[1,2,3]')
    })

    it('handles nested objects', () => {
      expect(safeJsonStringify({ a: { b: { c: 1 } } })).toBe('{"a":{"b":{"c":1}}}')
    })
  })
})
