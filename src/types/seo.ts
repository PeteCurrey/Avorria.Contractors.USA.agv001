/**
 * AVORRIA SEO PAGE MODEL & CONTENT TYPES
 * 
 * Scalable model supporting programmatic generation, editorial governance,
 * rich structured data schemas, and clean internal linking.
 */

export type SeoPageType =
  | 'commercial_hub'
  | 'document_template'
  | 'interactive_tool'
  | 'compliance_guide'
  | 'trade_pillar'
  | 'jurisdiction_pillar'
  | 'contractor_passport';

export type SeoIndexStatus =
  | 'indexable'
  | 'noindex_low_content'
  | 'noindex_preview'
  | 'noindex_staging';

export type SeoReviewStatus =
  | 'draft'
  | 'editorial_review'
  | 'approved_for_publication'
  | 'deprecated';

export type SearchIntent =
  | 'commercial'
  | 'tool'
  | 'template'
  | 'compliance'
  | 'informational'
  | 'trade'
  | 'geographic';

export interface SeoBreadcrumbItem {
  name: string;
  item: string; // URL path
}

export interface SeoFaqItem {
  question: string;
  answer: string;
}

export interface SeoCallToAction {
  title: string;
  description: string;
  buttonText: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface SeoRelatedItem {
  title: string;
  slug: string;
  description: string;
  type: SeoPageType;
  badge?: string;
}

export interface SeoBodySection {
  heading: string;
  subheading?: string;
  content: string; // Markdown or sanitized HTML
  bulletPoints?: string[];
}

export interface SeoPageModel {
  slug: string; // e.g., 'templates/job-hazard-analysis-jha'
  pageType: SeoPageType;
  searchIntent: SearchIntent;
  
  // Titles and Headings
  title: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl?: string;

  // Rich Content
  intro: string;
  keyTakeaways?: string[];
  bodySections: SeoBodySection[];

  // Features / Requirements Checklist (if applicable)
  requirementsChecklist?: {
    item: string;
    category: string;
    requiredBy: string; // e.g. OSHA 1926.21, General Contractor Standard
  }[];

  // Tool / Template Specific Data
  templateSpecs?: {
    format: string[]; // e.g., ['PDF', 'Word', 'Digital Web Form']
    estimatedCompletionTime: string;
    jurisdictionScope: string;
    lastStandardUpdate: string;
  };

  // Structured Data & FAQs
  schemaType: 'SoftwareApplication' | 'Article' | 'WebPage' | 'FAQPage';
  faqs: SeoFaqItem[];
  breadcrumbs: SeoBreadcrumbItem[];

  // Conversion & Linking
  primaryCta: SeoCallToAction;
  secondaryCta?: SeoCallToAction;
  relatedPages: SeoRelatedItem[];

  // Indexing & Quality Controls
  indexStatus: SeoIndexStatus;
  reviewStatus: SeoReviewStatus;

  // Editorial Governance
  publishedAt: string;
  updatedAt: string;
  reviewedAt?: string;
  nextReviewDate?: string;
  author: string;
  reviewer?: string;
  source?: string;
  sourceUrl?: string;

  // Categorization
  jurisdictionCode?: string; // US_FED, US_TX, US_CA, etc.
  tradeSlug?: string;        // electrical, hvac, plumbing, roofing, general-contracting
  topic: string;             // jha, safety-plan, compliance, passport, quotes
}
