import { describe, it, expect } from 'vitest'
import { extractHeadings, renderLexicalHtml } from '@/lib/richtext'

describe('extractHeadings', () => {
  it('extracts h2 headings', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Section One' }] },
        ],
      },
    }
    const headings = extractHeadings(content)
    expect(headings).toEqual([
      { id: 'section-one', text: 'Section One', level: 2 },
    ])
  })

  it('extracts multiple heading levels', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Main Section' }] },
          { type: 'heading', tag: 'h3', children: [{ type: 'text', text: 'Sub Section' }] },
          { type: 'heading', tag: 'h4', children: [{ type: 'text', text: 'Deep Section' }] },
        ],
      },
    }
    const headings = extractHeadings(content)
    expect(headings).toHaveLength(3)
    expect(headings[0].level).toBe(2)
    expect(headings[1].level).toBe(3)
    expect(headings[2].level).toBe(4)
  })

  it('ignores non-heading nodes', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          { type: 'paragraph', children: [{ type: 'text', text: 'Hello world' }] },
          { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Section' }] },
          { type: 'list', children: [] },
        ],
      },
    }
    const headings = extractHeadings(content)
    expect(headings).toHaveLength(1)
    expect(headings[0].text).toBe('Section')
  })

  it('handles empty content', () => {
    const headings = extractHeadings(null)
    expect(headings).toEqual([])
  })

  it('handles content without root', () => {
    const headings = extractHeadings({})
    expect(headings).toEqual([])
  })

  it('slugifies heading text for id', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Hello World & More!' }] },
        ],
      },
    }
    const headings = extractHeadings(content)
    expect(headings[0].id).toBe('hello-world-more')
  })

  it('trims whitespace from heading text', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          { type: 'heading', tag: 'h2', children: [{ type: 'text', text: '  Spaced Heading  ' }] },
        ],
      },
    }
    const headings = extractHeadings(content)
    expect(headings[0].text).toBe('Spaced Heading')
  })

  it('ignores empty headings', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          { type: 'heading', tag: 'h2', children: [{ type: 'text', text: '   ' }] },
          { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Valid Heading' }] },
        ],
      },
    }
    const headings = extractHeadings(content)
    expect(headings).toHaveLength(1)
    expect(headings[0].text).toBe('Valid Heading')
  })

  it('handles nested heading structures', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          {
            type: 'heading',
            tag: 'h2',
            children: [
              { type: 'text', text: 'Parent ' },
              { type: 'text', text: 'Heading', format: 1 },
            ],
          },
        ],
      },
    }
    const headings = extractHeadings(content)
    expect(headings).toHaveLength(1)
    expect(headings[0].text).toBe('Parent Heading')
  })
})

describe('renderLexicalHtml', () => {
  it('renders paragraph', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          { type: 'paragraph', children: [{ type: 'text', text: 'Hello world' }] },
        ],
      },
    }
    const html = renderLexicalHtml(content)
    expect(html).toContain('<p>')
    expect(html).toContain('Hello world')
    expect(html).toContain('</p>')
  })

  it('renders heading with id', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Section One' }] },
        ],
      },
    }
    const html = renderLexicalHtml(content)
    expect(html).toContain('<h2')
    expect(html).toContain('id="section-one"')
    expect(html).toContain('Section One')
    expect(html).toContain('</h2>')
  })

  it('renders bold text', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          { type: 'paragraph', children: [{ type: 'text', text: 'Bold text', format: 1 }] },
        ],
      },
    }
    const html = renderLexicalHtml(content)
    expect(html).toContain('<strong>Bold text</strong>')
  })

  it('renders italic text', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          { type: 'paragraph', children: [{ type: 'text', text: 'Italic text', format: 2 }] },
        ],
      },
    }
    const html = renderLexicalHtml(content)
    expect(html).toContain('<em>Italic text</em>')
  })

  it('renders underline text', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          { type: 'paragraph', children: [{ type: 'text', text: 'Underline', format: 8 }] },
        ],
      },
    }
    const html = renderLexicalHtml(content)
    expect(html).toContain('<u>Underline</u>')
  })

  it('renders strikethrough text', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          { type: 'paragraph', children: [{ type: 'text', text: 'Deleted', format: 4 }] },
        ],
      },
    }
    const html = renderLexicalHtml(content)
    expect(html).toContain('<s>Deleted</s>')
  })

  it('renders combined formatting', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          { type: 'paragraph', children: [{ type: 'text', text: 'Bold Italic', format: 3 }] },
        ],
      },
    }
    const html = renderLexicalHtml(content)
    // The implementation applies bold first, then italic - resulting in <em><strong>
    expect(html).toContain('<em><strong>Bold Italic</strong></em>')
    expect(html).toContain('<p>')
    expect(html).toContain('</p>')
  })

  it('renders bulleted list', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          {
            type: 'list',
            listType: 'bullet',
            children: [
              { type: 'listitem', children: [{ type: 'text', text: 'Item 1' }] },
              { type: 'listitem', children: [{ type: 'text', text: 'Item 2' }] },
            ],
          },
        ],
      },
    }
    const html = renderLexicalHtml(content)
    expect(html).toContain('<ul>')
    expect(html).toContain('<li>Item 1</li>')
    expect(html).toContain('<li>Item 2</li>')
    expect(html).toContain('</ul>')
  })

  it('renders numbered list', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          {
            type: 'list',
            listType: 'number',
            children: [
              { type: 'listitem', children: [{ type: 'text', text: 'First' }] },
            ],
          },
        ],
      },
    }
    const html = renderLexicalHtml(content)
    expect(html).toContain('<ol>')
    expect(html).toContain('<li>First</li>')
    expect(html).toContain('</ol>')
  })

  it('renders blockquote', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          { type: 'quote', children: [{ type: 'text', text: 'Quote this' }] },
        ],
      },
    }
    const html = renderLexicalHtml(content)
    expect(html).toContain('<blockquote>')
    expect(html).toContain('Quote this')
    expect(html).toContain('</blockquote>')
  })

  it('renders link with href', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          { type: 'link', url: 'https://example.com', newTab: false, children: [{ type: 'text', text: 'Click here' }] },
        ],
      },
    }
    const html = renderLexicalHtml(content)
    expect(html).toContain('<a href="https://example.com"')
    expect(html).toContain('Click here')
    expect(html).toContain('</a>')
  })

  it('renders link with new tab', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          { type: 'link', url: 'https://example.com', newTab: true, children: [{ type: 'text', text: 'External' }] },
        ],
      },
    }
    const html = renderLexicalHtml(content)
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
  })

  it('renders linebreak', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          { type: 'paragraph', children: [{ type: 'text', text: 'Line 1' }, { type: 'linebreak' }, { type: 'text', text: 'Line 2' }] },
        ],
      },
    }
    const html = renderLexicalHtml(content)
    expect(html).toContain('<br />')
  })

  it('renders image', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          { type: 'upload', value: { url: 'https://example.com/image.jpg', alt: 'Test image' } },
        ],
      },
    }
    const html = renderLexicalHtml(content)
    expect(html).toContain('<figure class="my-6">')
    expect(html).toContain('<img src="https://example.com/image.jpg"')
    expect(html).toContain('alt="Test image"')
    expect(html).toContain('</figure>')
  })

  it('handles upload without URL', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          { type: 'upload', value: {} },
        ],
      },
    }
    const html = renderLexicalHtml(content)
    expect(html).not.toContain('<img')
  })

  it('escapes HTML in text', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          { type: 'paragraph', children: [{ type: 'text', text: '<script>alert("xss")</script>' }] },
        ],
      },
    }
    const html = renderLexicalHtml(content)
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>')
  })

  it('escapes special characters in links', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          { type: 'link', url: 'javascript:alert("xss")', newTab: false, children: [{ type: 'text', text: 'Bad link' }] },
        ],
      },
    }
    const html = renderLexicalHtml(content)
    // The URL should be escaped but the attribute value is still set
    expect(html).toContain('href="javascript:alert(&quot;xss&quot;)"')
  })

  it('handles empty content', () => {
    const html = renderLexicalHtml(null)
    expect(html).toBe('')
  })

  it('handles content without root', () => {
    const html = renderLexicalHtml({})
    expect(html).toBe('')
  })

  it('renders complex nested content', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              { type: 'text', text: 'Start ' },
              { type: 'text', text: 'bold', format: 1 },
              { type: 'text', text: ' and ' },
              { type: 'text', text: 'italic', format: 2 },
              { type: 'text', text: ' end.' },
            ],
          },
        ],
      },
    }
    const html = renderLexicalHtml(content)
    expect(html).toContain('<p>Start <strong>bold</strong> and <em>italic</em> end.</p>')
  })
})
