# Content Management Guide

This guide explains how to add and manage content on the CIVIQ Design website.

## Quick Reference

```
civiq-astro/
├── src/content/
│   ├── blog/              ← Add blog posts here (.md files)
│   └── case-studies/      ← Add case studies here (.md files)
└── public/                ← Add images and assets here
```

## Adding a Blog Post

1. Create a new `.md` file in `src/content/blog/`
2. Use this frontmatter template:

```markdown
---
title: "Your Blog Post Title"
publishDate: 2025-01-15
author: "Brian Hendrick"
excerpt: "A brief 1-2 sentence summary that appears on the blog listing page."
tags: ["Service Design", "Digital Government"]
readTime: "5 min read"
featured: false
---

Your blog post content goes here. Use standard markdown formatting:

## Headings use H2

Regular paragraphs with **bold** and *italic* text.

- Bullet points
- Work great

1. Numbered lists
2. Also work

> Blockquotes for callouts

[Links work too](https://example.com)
```

3. The blog post will automatically appear at `/blog/your-file-name`
4. Posts are sorted by `publishDate` (newest first)

## Adding a Case Study

1. Create a new `.md` file in `src/content/case-studies/`
2. Use this frontmatter template:

```markdown
---
title: "Project Name"
client: "Client Organization Name"
project_type: "Service Design" # or "Digital Strategy", etc.
role: "Lead Service Designer"
services: ["Research", "Service Design", "Implementation"]
summary: "A 1-2 sentence summary for the listing page."
impact: "One powerful sentence about the measurable impact or outcome."
featured: true
order: 1  # Lower numbers appear first on the case studies page
publishDate: 2025-01-15
---

## The Challenge

Describe the problem or opportunity...

## The Approach

Explain your methodology...

## The Outcome

Share the results and impact...
```

3. The case study will automatically appear at `/case-studies/your-file-name`
4. Case studies are sorted by the `order` field (lowest to highest)
5. Set `featured: true` to add a "Featured" badge

## Adding Images

All images go in the `public/` directory. The public folder is served at the root URL.

### Recommended Structure

```
public/
├── case-study-images/
│   ├── project-name-1.jpg
│   └── project-name-2.jpg
├── blog-images/
│   └── post-image.jpg
└── client-logos/
    └── logo.png
```

### Using Images in Markdown

```markdown
![Alt text description](/case-study-images/project-name-1.jpg)
```

### Image Best Practices

- Use descriptive filenames: `yukon-emergency-dashboard.jpg` not `image1.jpg`
- Optimize images before uploading (aim for under 500KB per image)
- Use `.webp` format when possible for better compression
- Include alt text for accessibility

## Updating Existing Content

Simply edit the `.md` file in `src/content/blog/` or `src/content/case-studies/`. Changes will appear when you rebuild the site.

## Development Workflow

```bash
# Start the dev server
npm run dev

# View your site at http://localhost:4321

# Build for production
npm run build

# Preview the production build
npm run preview
```

## File Naming Conventions

- Use lowercase
- Use hyphens instead of spaces
- Be descriptive: `yukon-emergency-communications.md` not `project-1.md`
- Match the URL you want: filename becomes the URL slug

## Content Tips

### Blog Posts
- Keep titles under 60 characters for SEO
- Write compelling excerpts that make people want to read more
- Use 2-5 tags per post
- Aim for 800-2000 words for substantial posts

### Case Studies
- Lead with impact in your summary
- Use concrete numbers and outcomes
- Structure with Challenge → Approach → Outcome
- Include 2-4 relevant images
- Be specific about your role and contributions

## Design System Colors

When writing content, you can reference the site's color palette:

- Forest Green: `#124045` (primary text)
- Teal Blue: `#2C6E78` (links, accents)
- Warm Clay: `#D67656` (CTAs)
- Sky Blue: `#7DB5C7` (light accents)
- Rice White: `#F9F5F0` (backgrounds)

## Need Help?

- Check existing blog posts and case studies for examples
- The frontmatter fields are validated by Zod schemas in `src/content/config.ts`
- All pages use responsive design automatically
- Navigation updates automatically when you add content
