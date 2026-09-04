import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { getAllIndexableSeoPages } from '@/lib/seo/registry';

/**
 * AVORRIA CONTRACTOR USA — SITEMAP GENERATOR
 *
 * Produces valid sitemap XML with canonical URLs rooted at https://avorria.com.
 * Automatically deduplicates URLs and includes all static core pages,
 * pillar hubs, legal disclosures, and programmatic SEO guides/tools/templates.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url.replace(/\/+$/, '');
  const now = new Date();

  // 1. Static Core Landing Pages & Hubs
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/platform`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/create`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/comply`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/prove`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/win-work`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contractors`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contractor-passport`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contractor-verification`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/contractor-compliance`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/verification/criteria`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/tools/job-hazard-analysis-jha-generator`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/industries`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/states`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/security`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // 2. Programmatic Registered SEO Pages (Templates, Guides, Trade Pages, Tools)
  const dynamicPages: MetadataRoute.Sitemap = getAllIndexableSeoPages().map((page) => {
    let priority = 0.75;
    let changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' = 'weekly';

    if (page.pageType === 'interactive_tool' || page.pageType === 'document_template') {
      priority = 0.85;
      changeFrequency = 'weekly';
    } else if (page.pageType === 'compliance_guide' || page.pageType === 'trade_pillar') {
      priority = 0.8;
      changeFrequency = 'monthly';
    }

    const cleanSlug = page.slug.replace(/^\/+|\/+$/g, '');

    return {
      url: `${baseUrl}/${cleanSlug}`,
      lastModified: page.updatedAt ? new Date(page.updatedAt) : now,
      changeFrequency,
      priority,
    };
  });

  // 3. Deduplication: Map by normalized URL to guarantee zero duplicate URLs
  const urlMap = new Map<string, MetadataRoute.Sitemap[number]>();

  // Insert dynamic pages first
  for (const item of dynamicPages) {
    urlMap.set(item.url.toLowerCase(), item);
  }

  // Insert static routes (overriding with higher priority if already present)
  for (const item of staticRoutes) {
    urlMap.set(item.url.toLowerCase(), item);
  }

  return Array.from(urlMap.values());
}
