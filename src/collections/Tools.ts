import type { CollectionConfig } from 'payload'

export const Tools: CollectionConfig = {
  slug: 'tools',
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'description', type: 'textarea' },
    { name: 'affiliateUrl', type: 'text', label: 'Affiliate URL' },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    {
      name: 'category',
      type: 'select',
      options: [
        'Landing Page Builder',
        'Email Marketing',
        'Analytics',
        'A/B Testing',
        'CRM',
        'Countdown Timer',
        'Form Builder',
        'Heatmaps',
      ],
    },
    { name: 'pricing', type: 'text', label: 'Pricing Info' },
    { name: 'rating', type: 'number', min: 0, max: 5, index: true },
  ],
}
