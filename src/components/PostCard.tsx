import Link from 'next/link'
import Image from 'next/image'
import type { Post } from '@/lib/types'
import { memo } from 'react'

interface PostCardProps {
  post: Post
}

export const PostCard = memo(function PostCard({ post }: PostCardProps) {
  const imageUrl =
    typeof post.featuredImage === 'string'
      ? post.featuredImage
      : typeof post.featuredImage === 'object' && post.featuredImage?.url
        ? post.featuredImage.url
        : undefined

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group overflow-hidden rounded-2xl border border-white/80 bg-white/70 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      {imageUrl && (
        <div className="relative aspect-[16/9] overflow-hidden bg-mist-100">
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            loading="lazy"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 text-xs text-ink-500">
          {post.category && (
            <span className="rounded-full bg-primary-50 px-2.5 py-1 font-semibold uppercase tracking-[0.2em] text-primary-600">
              {post.category}
            </span>
          )}
          {post.publishedDate && (
            <span>{new Date(post.publishedDate).toLocaleDateString()}</span>
          )}
        </div>
        <h3 className="mt-4 text-lg font-semibold text-ink-900 group-hover:text-primary-600">
          {post.title}
        </h3>
        {post.excerpt && <p className="mt-2 text-sm text-ink-600 line-clamp-2">{post.excerpt}</p>}
      </div>
    </Link>
  )
})
