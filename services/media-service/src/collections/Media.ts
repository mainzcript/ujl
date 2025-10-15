import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      // required: true,
      localized: true,
      admin: {
        description: 'Title',
      },
    },
    {
      name: 'alt',
      type: 'text',
      // required: true,
      localized: true,
      admin: {
        description: 'Alt-Text',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Description',
      },
    },
    {
      name: 'author',
      type: 'text',
      admin: {
        description: 'Author',
      },
    },
    {
      name: 'license',
      type: 'text',
      localized: true,
      admin: {
        description: 'License',
      },
    },
    {
      name: 'sourceLink',
      type: 'text',
      admin: {
        description: 'Source link',
      },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          localized: true,
          type: 'text',
        },
      ],
      admin: {
        description: 'Tags',
      },
    },
  ],
  upload: {
    staticDir: 'media',
    imageSizes: [
      {
        name: 'small',
        width: 500,
        height: undefined, // Proportional
        position: 'center',
      },
      {
        name: 'medium',
        width: 750,
        height: undefined,
        position: 'center',
      },
      {
        name: 'large',
        width: 1000,
        height: undefined,
        position: 'center',
      },
      {
        name: 'xlarge',
        width: 1920,
        height: undefined,
        position: 'center',
      },
    ],
    formatOptions: {
      format: 'webp',
      options: {
        quality: 80,
      },
    },
    focalPoint: true,
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'], 
  },
  
}
