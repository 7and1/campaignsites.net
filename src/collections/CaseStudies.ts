import type { CollectionConfig } from 'payload'

export const CaseStudies: CollectionConfig = {
  slug: 'case-studies',
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'brand', type: 'text' },
    {
      name: 'category',
      type: 'select',
      options: ['E-commerce', 'SaaS', 'Non-profit', 'Political', 'B2B', 'DTC', 'Finance', 'Healthcare'],
    },
    { name: 'score', type: 'number', min: 0, max: 10, index: true },
    { name: 'heroImage', type: 'upload', relationTo: 'media', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Analysis',
          fields: [
            { name: 'summary', type: 'textarea', label: 'Quick Summary' },
            { name: 'analysis', type: 'richText', label: 'Full Analysis' },
            {
              name: 'highlights',
              type: 'array',
              label: 'Key Highlights',
              fields: [
                { name: 'point', type: 'text' },
              ],
            },
          ],
        },
        {
          label: 'Metrics',
          fields: [
            { name: 'conversionRate', type: 'text', label: 'Conversion Rate' },
            { name: 'budget', type: 'text', label: 'Estimated Budget' },
            { name: 'duration', type: 'text', label: 'Campaign Duration' },
            { name: 'platform', type: 'select', hasMany: true, options: ['Google Ads', 'Facebook', 'Instagram', 'TikTok', 'LinkedIn', 'Email', 'SEO'] },
          ],
        },
        {
          label: 'Tools & Links',
          fields: [
            { name: 'affiliateTools', type: 'relationship', relationTo: 'tools', hasMany: true },
            { name: 'externalUrl', type: 'text', label: 'Campaign URL' },
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
