import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

const docs = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/docs',
    generateId: ({ entry }) => entry.replace(/\.mdx?$/i, ''),
  }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    protected: z.boolean().default(false),
  }),
})

export const collections = { docs }
