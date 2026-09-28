import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const updates = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/updates' }),
  schema: z.object({
    title: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    description: z.string().min(1),
    publishDate: z.coerce.date(),
    category: z.string().min(1),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    template: z.string().min(1),
    image: z.string().min(1),
    imageAlt: z.string().min(1),
    eventDate: z.coerce.date().optional(),
    eventTime: z.string().optional(),
    endDate: z.coerce.date().optional(),
    locationName: z.string().optional(),
    address: z.string().optional(),
    guestName: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { updates };
