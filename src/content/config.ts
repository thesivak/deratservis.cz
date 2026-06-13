import { defineCollection, z } from "astro:content";

const seoSchema = z.object({
  title: z.string(),
  description: z.string(),
  image: z.string().optional()
});

const pages = defineCollection({
  type: "content",
  schema: z.object({
    seo: seoSchema,
    hero: z.object({
      eyebrow: z.string(),
      headline: z.string(),
      subheadline: z.string(),
      primaryCta: z.string(),
      primaryCtaHref: z.string(),
      cards: z.array(z.object({
        title: z.string(),
        icon: z.string(),
        description: z.string()
      }))
    }),
    about: z.object({
      title: z.string(),
      subtitle: z.string(),
      heading: z.string(),
      image: z.string(),
      imageAlt: z.string(),
      features: z.array(z.object({
        title: z.string(),
        description: z.string(),
        icon: z.string()
      }))
    }),
    references: z.object({
      heading: z.string(),
      subtitle: z.string()
    }),
    blogPreview: z.object({
      heading: z.string(),
      subtitle: z.string()
    }),
    contact: z.object({
      heading: z.string(),
      description: z.string(),
      phone: z.string(),
      email: z.string(),
      addressHtml: z.string(),
      ic: z.string(),
      serviceArea: z.string()
    })
  })
});

const services = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    sortOrder: z.number(),
    icon: z.string(),
    seo: seoSchema,
    faq: z.array(z.object({
      question: z.string(),
      answer: z.string()
    })).default([])
  })
});

const references = defineCollection({
  type: "content",
  schema: z.object({
    clientName: z.string(),
    clientRole: z.string().optional(),
    testimonial: z.string(),
    sortOrder: z.number(),
    avatar: z.string().optional()
  })
});

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    publishedAt: z.date(),
    updatedAt: z.date(),
    featuredImage: z.string().default("/images/blog-placeholder.jpg"),
    featuredImageAlt: z.string(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    seo: seoSchema,
    draft: z.boolean().default(false)
  })
});

export const collections = { pages, services, references, blog };
