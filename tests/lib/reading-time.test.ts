import { describe, it, expect } from 'vitest'
import { calculateReadingTime } from '@/lib/reading-time'

describe('calculateReadingTime', () => {
  it('calculates reading time for plain text', () => {
    const text = 'word '.repeat(200) // 200 words
    const time = calculateReadingTime(text)
    expect(time).toBe(1) // 200 words / 200 wpm = 1 minute
  })

  it('calculates reading time for longer content', () => {
    const text = 'word '.repeat(600) // 600 words
    const time = calculateReadingTime(text)
    expect(time).toBe(3) // 600 words / 200 wpm = 3 minutes
  })

  it('strips HTML tags', () => {
    const html = '<p>' + 'word '.repeat(200) + '</p>'
    const time = calculateReadingTime(html)
    expect(time).toBe(1)
  })

  it('handles complex HTML', () => {
    const html = `
      <div>
        <h1>Title</h1>
        <p>${'word '.repeat(100)}</p>
        <ul>
          <li>${'word '.repeat(50)}</li>
          <li>${'word '.repeat(50)}</li>
        </ul>
      </div>
    `
    const time = calculateReadingTime(html)
    expect(time).toBeGreaterThan(0)
  })

  it('handles HTML entities', () => {
    const html = 'test&nbsp;test&amp;test&lt;test&gt;test&quot;test&#39;test'
    const time = calculateReadingTime(html)
    expect(time).toBe(1) // Minimum 1 minute
  })

  it('returns 0 for empty string', () => {
    const time = calculateReadingTime('')
    expect(time).toBe(0)
  })

  it('returns 0 for HTML with no text', () => {
    const html = '<div><img src="test.jpg" /></div>'
    const time = calculateReadingTime(html)
    expect(time).toBe(0)
  })

  it('returns minimum 1 minute for short content', () => {
    const text = 'Just a few words'
    const time = calculateReadingTime(text)
    expect(time).toBe(1)
  })

  it('handles multiple spaces', () => {
    const text = 'word    word    word'
    const time = calculateReadingTime(text)
    expect(time).toBe(1)
  })

  it('handles newlines', () => {
    const text = 'word\nword\nword'
    const time = calculateReadingTime(text)
    expect(time).toBe(1)
  })

  it('rounds up to nearest minute', () => {
    const text = 'word '.repeat(250) // 250 words = 1.25 minutes
    const time = calculateReadingTime(text)
    expect(time).toBe(2) // Rounds up to 2
  })

  it('handles nested HTML tags', () => {
    const html = '<div><p><strong><em>' + 'word '.repeat(200) + '</em></strong></p></div>'
    const time = calculateReadingTime(html)
    expect(time).toBe(1)
  })

  it('handles self-closing tags', () => {
    const html = 'word <br /> word <img src="test.jpg" /> word'
    const time = calculateReadingTime(html)
    expect(time).toBe(1)
  })

  it('handles code blocks', () => {
    const html = '<pre><code>' + 'word '.repeat(200) + '</code></pre>'
    const time = calculateReadingTime(html)
    expect(time).toBe(1)
  })

  it('handles very long content', () => {
    const text = 'word '.repeat(2000) // 2000 words
    const time = calculateReadingTime(text)
    expect(time).toBe(10) // 2000 / 200 = 10 minutes
  })

  it('handles content with punctuation', () => {
    const text = 'Hello, world! This is a test. How are you?'
    const time = calculateReadingTime(text)
    expect(time).toBe(1)
  })

  it('handles content with numbers', () => {
    const text = 'The year 2024 has 365 days and 12 months'
    const time = calculateReadingTime(text)
    expect(time).toBe(1)
  })

  it('handles mixed content', () => {
    const html = `
      <article>
        <h1>Article Title</h1>
        <p>${'word '.repeat(100)}</p>
        <blockquote>${'word '.repeat(50)}</blockquote>
        <p>${'word '.repeat(150)}</p>
      </article>
    `
    const time = calculateReadingTime(html)
    expect(time).toBe(2) // ~300 words = 1.5 minutes, rounds to 2
  })
})
