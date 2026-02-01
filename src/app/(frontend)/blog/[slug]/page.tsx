import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { ArrowLeft, Calendar, Clock, Tag, User, Award, BookOpen } from 'lucide-react'
import {
  Breadcrumbs,
  JsonLd,
  PostCard,
  ShareBar,
  TableOfContents,
  ToolComparisonTable,
  UpvoteButton,
} from '@/components'
import { extractHeadings, renderLexicalHtml } from '@/lib/richtext'
import { calculateReadingTime } from '@/lib/reading-time'
import type { Post, Tool } from '@/lib/types'

export const dynamic = 'force-static'
export const revalidate = 300
export const dynamicParams = true

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    limit: 1000,
    select: {
      slug: true,
    },
  })

  return docs.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })

  const post = docs[0] as Post | undefined
  if (!post) return {}

  const title = post.metaTitle || post.title
  const description = post.metaDescription || post.excerpt || 'Campaign strategy playbook.'
  const imageUrl =
    typeof post.featuredImage === 'string'
      ? post.featuredImage
      : typeof post.featuredImage === 'object' && post.featuredImage?.url
        ? post.featuredImage.url
        : undefined

  const ogImage = imageUrl
    ? imageUrl
    : `/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent('Campaign playbook')}`

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://campaignsites.net/blog/${post.slug}`,
      images: [{ url: ogImage }],
      publishedTime: post.publishedDate,
      modifiedTime: post.updatedAt || post.publishedDate,
      authors: ['CampaignSites.net Editorial Team'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })

  const post = docs[0] as Post
  if (!post) notFound()

  const headings = extractHeadings(post.content)
  const html = renderLexicalHtml(post.content)
  const readingTime = calculateReadingTime(html)

  const related = await payload.find({
    collection: 'posts',
    limit: 3,
    sort: '-publishedDate',
    depth: 1,
    where: {
      and: [
        { slug: { not_equals: post.slug } },
        ...(post.category ? [{ category: { equals: post.category } }] : []),
      ],
    },
  })

  const imageUrl =
    typeof post.featuredImage === 'string'
      ? post.featuredImage
      : typeof post.featuredImage === 'object' && post.featuredImage?.url
        ? post.featuredImage.url
        : undefined

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `https://campaignsites.net/blog/${post.slug}#article`,
        headline: post.title,
        description: post.excerpt,
        image: imageUrl || `https://campaignsites.net/og?title=${encodeURIComponent(post.title)}`,
        datePublished: post.publishedDate,
        dateModified: post.updatedAt || post.publishedDate,
        author: {
          '@type': 'Organization',
          '@id': 'https://campaignsites.net/#organization',
          name: 'CampaignSites.net Editorial Team',
          url: 'https://campaignsites.net/about',
          description: 'Conversion optimization experts with 10+ years of experience in campaign landing page strategy.',
        },
        publisher: {
          '@type': 'Organization',
          '@id': 'https://campaignsites.net/#organization',
          name: 'CampaignSites.net',
          logo: {
            '@type': 'ImageObject',
            url: 'https://campaignsites.net/og?title=CampaignSites.net',
            width: 1200,
            height: 630,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://campaignsites.net/blog/${post.slug}`,
        },
        inLanguage: 'en-US',
        ...(post.category && { articleSection: post.category }),
        ...(post.tags && post.tags.length > 0 && { keywords: post.tags.join(', ') }),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://campaignsites.net',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: 'https://campaignsites.net/blog',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: post.title,
            item: `https://campaignsites.net/blog/${post.slug}`,
          },
        ],
      },
    ],
  }

  return (
    <main className="min-h-screen">
      <JsonLd data={structuredData} />

      <div className="border-b border-white/70 bg-white/80">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <div className="flex items-center justify-between">
            <Breadcrumbs
              items={[
                { label: 'Blog', href: '/blog' },
                { label: post.title },
              ]}
            />
            <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-500 hover:text-primary-600">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          <article>
            <div className="flex flex-wrap items-center gap-3 text-xs text-ink-500">
              {post.category && (
                <span className="rounded-full bg-primary-50 px-3 py-1 font-semibold uppercase tracking-[0.2em] text-primary-600">
                  {post.category}
                </span>
              )}
              {post.publishedDate && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.publishedDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              )}
              {readingTime > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {readingTime} {readingTime === 1 ? 'min' : 'min'} read
                </span>
              )}
            </div>

            <h1 className="mt-4 text-4xl font-semibold text-ink-900 sm:text-5xl">{post.title}</h1>

            {post.affiliateDisclosure && (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <strong>Disclosure:</strong> This article contains affiliate links. We may earn a commission at no extra cost to you.
              </div>
            )}

            {post.featuredImage && (
              <div className="mt-8 overflow-hidden rounded-2xl border border-white/70 bg-white/70">
                <div className="relative aspect-[16/9]">
                  <Image
                    src={typeof post.featuredImage === 'string' ? post.featuredImage : typeof post.featuredImage === 'object' && post.featuredImage.url ? post.featuredImage.url : ''}
                    alt={
                      typeof post.featuredImage === 'object' && post.featuredImage.alt
                        ? post.featuredImage.alt
                        : `Featured image for article: ${post.title} - Campaign landing page strategy guide`
                    }
                    fill
                    className="object-cover"
                    priority
                    fetchPriority="high"
                  />
                </div>
              </div>
            )}

            {post.excerpt && (
              <p className="mt-6 text-lg text-ink-600">{post.excerpt}</p>
            )}

            {html && (
              <div
                className="prose prose-slate mt-8 max-w-none text-ink-700 prose-headings:scroll-mt-28 prose-headings:text-ink-900"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            )}

            {/* Author Box - E-E-A-T Enhancement */}
            <div className="mt-10 glass-panel p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-ink-900">CampaignSites.net Editorial Team</h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-600">
                      <Award className="h-3 w-3" />
                      Verified Expert
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-600">
                    Conversion optimization experts with 10+ years of experience helping brands build high-performing campaign landing pages. Our content is based on real data from thousands of A/B tests.
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-ink-500">
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      200+ Articles Published
                    </span>
                    <span>Last reviewed: {post.updatedAt ? new Date(post.updatedAt as string).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : post.publishedDate ? new Date(post.publishedDate as string).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}</span>
                  </div>
                </div>
              </div>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-white/70 pt-6">
                <Tag className="h-4 w-4 text-ink-400" />
                {post.tags.map((tag: string) => (
                  <span key={tag} className="rounded-full border border-ink-200 px-3 py-1 text-xs text-ink-600">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-10">
              <ToolComparisonTable tools={(post.relatedTools?.filter((t: Tool | number): t is Tool => typeof t === 'object')) || []} title="Recommended tools" context="blog-post" />
            </div>

            <div className="mt-10">
              <ShareBar title={post.title} />
            </div>
            <div className="mt-6">
              <UpvoteButton contentType="post" slug={post.slug} />
            </div>
          </article>

          <aside className="space-y-6">
            <TableOfContents headings={headings} />
            {post.relatedTools && post.relatedTools.length > 0 && (
              <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Tools mentioned</p>
                <ul className="mt-4 space-y-3 text-sm text-ink-600">
                  {post.relatedTools
                    .filter((t: Tool | number): t is Tool => typeof t === 'object')
                    .map((tool: Tool) => (
                    <li key={tool.id || tool.slug} className="flex items-center justify-between gap-3">
                      <span>{tool.name}</span>
                      {tool.category && <span className="text-xs text-ink-400">{tool.category}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>

      {related.docs.length > 0 && (
        <section className="pb-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-2xl font-semibold text-ink-900">Related guides</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {(related.docs as Post[]).map((item) => (
                <PostCard key={item.id || item.slug} post={item} />
              ))}
            </div>
          </div>
        </section>
      )}

    </main>
  )
}
