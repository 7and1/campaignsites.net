export interface HeadingItem {
  id: string
  text: string
  level: number
}

type LexicalNode = {
  type: string
  children?: LexicalNode[]
  text?: string
  tag?: string
  url?: string
  newTab?: boolean
  listType?: 'bullet' | 'number'
  format?: number
  direction?: string
  code?: string
  language?: string
  value?: {
    url?: string
    alt?: string
    caption?: string
  }
  [key: string]: unknown
}

const FORMAT_BOLD = 1
const FORMAT_ITALIC = 2
const FORMAT_STRIKETHROUGH = 4
const FORMAT_UNDERLINE = 8

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

const getText = (node?: LexicalNode): string => {
  if (!node) return ''
  if (node.type === 'text') return node.text ?? ''
  if (!node.children) return ''
  return node.children.map(getText).join('')
}

export const extractHeadings = (content: unknown): HeadingItem[] => {
  const headings: HeadingItem[] = []
  const node = (content as { root?: LexicalNode } | null)?.root

  const walk = (node?: LexicalNode) => {
    if (!node) return
    if (node.type === 'heading') {
      const text = getText(node)
      if (text.trim()) {
        headings.push({
          id: slugify(text),
          text: text.trim(),
          level: node.tag ? Number(node.tag.replace('h', '')) : 2,
        })
      }
    }
    node.children?.forEach(walk)
  }

  walk(node)
  return headings
}

const wrapTextFormatting = (text: string, format?: number) => {
  let output = escapeHtml(text)
  if (!format) return output
  if (format & FORMAT_BOLD) output = `<strong>${output}</strong>`
  if (format & FORMAT_ITALIC) output = `<em>${output}</em>`
  if (format & FORMAT_UNDERLINE) output = `<u>${output}</u>`
  if (format & FORMAT_STRIKETHROUGH) output = `<s>${output}</s>`
  return output
}

const serializeNode = (node: LexicalNode, headingIds: Map<string, string>): string => {
  switch (node.type) {
    case 'root':
      return (node.children || []).map((child) => serializeNode(child, headingIds)).join('')
    case 'paragraph':
      return `<p>${(node.children || []).map((child) => serializeNode(child, headingIds)).join('')}</p>`
    case 'heading': {
      const tag = node.tag || 'h2'
      const text = getText(node)
      const id = headingIds.get(text) ?? slugify(text)
      return `<${tag} id="${id}">${(node.children || []).map((child) => serializeNode(child, headingIds)).join('')}</${tag}>`
    }
    case 'list': {
      const tag = node.listType === 'number' ? 'ol' : 'ul'
      return `<${tag}>${(node.children || []).map((child) => serializeNode(child, headingIds)).join('')}</${tag}>`
    }
    case 'listitem':
      return `<li>${(node.children || []).map((child) => serializeNode(child, headingIds)).join('')}</li>`
    case 'quote':
      return `<blockquote>${(node.children || []).map((child) => serializeNode(child, headingIds)).join('')}</blockquote>`
    case 'link': {
      const href = node.url || '#'
      const rel = node.newTab ? 'noopener noreferrer' : 'noopener'
      const target = node.newTab ? '_blank' : '_self'
      return `<a href="${escapeHtml(href)}" target="${target}" rel="${rel}">${(node.children || []).map((child) => serializeNode(child, headingIds)).join('')}</a>`
    }
    case 'linebreak':
      return '<br />'
    case 'text':
      return wrapTextFormatting(node.text || '', node.format)
    case 'code':
      return `<pre class="overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-100"><code>${escapeHtml(node.code || '')}</code></pre>`
    case 'codehighlight':
      return `<pre class="overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-100"><code class="language-${node.language || 'text'}">${escapeHtml(node.code || '')}</code></pre>`
    case 'upload':
      if (node.value?.url) {
        const alt = node.value?.alt || ''
        const caption = node.value?.caption
        return `<figure class="my-6"><img src="${escapeHtml(node.value.url)}" alt="${escapeHtml(alt)}" class="rounded-2xl border border-white/70" />${caption ? `<figcaption class="mt-2 text-center text-sm text-ink-500">${escapeHtml(caption)}</figcaption>` : ''}</figure>`
      }
      return ''
    default:
      return (node.children || []).map((child) => serializeNode(child, headingIds)).join('')
  }
}

export const renderLexicalHtml = (content: unknown): string => {
  const node = (content as { root?: LexicalNode } | null)?.root
  if (!node) return ''
  const headingIds = new Map<string, string>()
  extractHeadings(content).forEach((heading) => {
    headingIds.set(heading.text, heading.id)
  })
  return serializeNode(node, headingIds)
}
