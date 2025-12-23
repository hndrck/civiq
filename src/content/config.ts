import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    author: z.string().default('Brian Hendrick'),
    excerpt: z.string(),
    publishDate: z.date(),
    tags: z.array(z.string()).default([]),
    readTime: z.string(),
    featured: z.boolean().default(false),
  }),
});

const caseStudies = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    client: z.string(),
    project_type: z.string(),
    role: z.string(),
    services: z.array(z.string()),
    summary: z.string(),
    impact: z.string(),
    featured: z.boolean().default(false),
    order: z.number().default(999),
    publishDate: z.date(),
  }),
});

export const collections = {
  blog,
  'case-studies': caseStudies,
};
