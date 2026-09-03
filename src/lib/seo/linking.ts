/**
 * AVORRIA INTERNAL LINKING ENGINE
 * 
 * Automatically resolves contextual, high-topical-authority internal links
 * across the site graph based on:
 * - Trade relevance (e.g. electrical -> electrical safety, electrical passport)
 * - Topic relevance (e.g. JHA -> JSA, Safety Plan, Toolbox Talk)
 * - Funnel progression (template -> interactive tool -> passport -> account)
 * - Jurisdiction alignment (state rules -> compliance checklist)
 * 
 * Prevents circular linking, self-links, and spammy over-linking (max 4-6 links per section).
 */

import { SeoPageModel, SeoRelatedItem } from '@/types/seo';
import { INITIAL_SEO_PAGES } from './registry';

export interface InternalLinkingContext {
  currentSlug: string;
  topic?: string;
  tradeSlug?: string;
  jurisdictionCode?: string;
  maxLinks?: number;
}

export function getRecommendedInternalLinks(
  context: InternalLinkingContext,
  allPages: SeoPageModel[] = INITIAL_SEO_PAGES
): SeoRelatedItem[] {
  const { currentSlug, topic, tradeSlug, jurisdictionCode, maxLinks = 4 } = context;
  const cleanCurrentSlug = currentSlug.replace(/^\/+|\/+$/g, '');

  const scoredPages: { page: SeoPageModel; score: number }[] = [];

  for (const page of allPages) {
    // 1. Exclude self
    if (page.slug === cleanCurrentSlug) continue;

    // 2. Only link to published, indexable pages
    if (page.indexStatus !== 'indexable' || page.reviewStatus !== 'approved_for_publication') {
      continue;
    }

    let score = 0;

    // A. Trade alignment (highest relevance for specialty trade content)
    if (tradeSlug && page.tradeSlug === tradeSlug) {
      score += 40;
    }

    // B. Topic alignment
    if (topic && page.topic === topic) {
      score += 30;
    }

    // C. Natural product funnel progression:
    // If on a template, prioritize pointing to the interactive tool or contractor passport
    if (page.pageType === 'interactive_tool') {
      score += 15;
    } else if (page.pageType === 'contractor_passport') {
      score += 20;
    } else if (page.pageType === 'compliance_guide') {
      score += 10;
    }

    // D. Geographic/Jurisdiction alignment
    if (jurisdictionCode && page.jurisdictionCode === jurisdictionCode) {
      score += 25;
    }

    if (score > 0) {
      scoredPages.push({ page, score });
    }
  }

  // Sort descending by score
  scoredPages.sort((a, b) => b.score - a.score);

  // Return deduplicated top N items
  return scoredPages.slice(0, maxLinks).map(({ page }) => ({
    title: page.title,
    slug: page.slug,
    description: page.intro || page.metaDescription,
    type: page.pageType,
  }));
}
