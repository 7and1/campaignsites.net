import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'publishedDate', type: 'date', label: 'Published Date', index: true },
            { name: 'excerpt', type: 'textarea', label: 'Excerpt' },
            { name: 'content', type: 'richText' },
            {
              name: 'category',
              type: 'select',
              options: [
                'How-to Guide',
                'Tool Review',
                'Comparison',
                'Case Study',
                'Industry News',
                'Best Practices',
              ],
            },
            {
              name: 'tags',
              type: 'select',
              hasMany: true,
              options: [
                'Landing Pages',
                'Email Marketing',
                'Conversion Optimization',
                'A/B Testing',
                'Campaign Strategy',
                'Analytics',
                'Copywriting',
                'Design',
                'UTM Tracking',
                'Budget Planning',
              ],
            },
          ],
        },
        {
          label: 'Affiliate',
          fields: [
            { name: 'affiliateDisclosure', type: 'checkbox', defaultValue: true, label: 'Show Affiliate Disclosure' },
            { name: 'relatedTools', type: 'relationship', relationTo: 'tools', hasMany: true },
          ],
        },
        {
          label: 'SEO',
          fields: [
            { name: 'metaTitle', type: 'text', maxLength: 60, label: 'Meta Title' },
            { name: 'metaDescription', type: 'textarea', maxLength: 160, label: 'Meta Description' },
          ],
        },
      ],
    },
  ],
}
