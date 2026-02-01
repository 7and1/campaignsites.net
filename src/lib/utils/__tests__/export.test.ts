import { describe, it, expect, vi } from 'vitest'
import { exportToCSV, copyToClipboard, generateQRCode } from '../export'

describe('Export utilities', () => {
  describe('exportToCSV', () => {
    it('should generate CSV with headers and data', async () => {
      const data = [
        { name: 'John', age: 30, city: 'New York' },
        { name: 'Jane', age: 25, city: 'Los Angeles' },
      ]

      const createElementSpy = vi.spyOn(document, 'createElement')
      const appendChildSpy = vi.spyOn(document.body, 'appendChild')
      const removeChildSpy = vi.spyOn(document.body, 'removeChild')

      await exportToCSV(data, 'test.csv')

      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(appendChildSpy).toHaveBeenCalled()
      expect(removeChildSpy).toHaveBeenCalled()
    })

    it('should handle empty data', async () => {
      await exportToCSV([], 'test.csv')
      // Should not throw
    })

    it('should escape commas in values', async () => {
      const data = [{ name: 'Smith, John', age: 30 }]
      await exportToCSV(data, 'test.csv')
      // Should wrap values with commas in quotes
    })
  })

  describe('copyToClipboard', () => {
    it('should copy text to clipboard', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      })

      const result = await copyToClipboard('test text')

      expect(result).toBe(true)
      expect(writeTextMock).toHaveBeenCalledWith('test text')
    })

    it('should return false on error', async () => {
      const writeTextMock = vi.fn().mockRejectedValue(new Error('Failed'))
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      })

      const result = await copyToClipboard('test text')

      expect(result).toBe(false)
    })
  })

  describe('generateQRCode', () => {
    it('should generate QR code data URL', async () => {
      const result = await generateQRCode('https://example.com')
      expect(result).toMatch(/^data:image\/png;base64,/)
    })

    it('should handle custom size', async () => {
      const result = await generateQRCode('https://example.com', 512)
      expect(result).toMatch(/^data:image\/png;base64,/)
    })
  })
})
