import React from 'react';
import { siteConfig } from '@/config/site';
import { PRICING_PLANS } from '@/config/plans';
import { SeoBreadcrumbItem, SeoFaqItem } from '@/types/seo';

function getCanonicalUrl(url?: string): string {
  let u = (url || siteConfig.url).trim().replace(/\/+$/, '');
  if (u.startsWith('http://')) {
    u = u.replace('http://', 'https://');
  }
  if (!u.startsWith('https://')) {
    u = 'https://avorria.com';
  }
  return u;
}

interface OrganizationJsonLdProps {
  url?: string;
  name?: string;
}

export function OrganizationJsonLd({ url, name = siteConfig.name }: OrganizationJsonLdProps) {
  const effectiveUrl = getCanonicalUrl(url);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    legalName: siteConfig.legalName,
    url: effectiveUrl,
    logo: `${effectiveUrl}/icon.svg`,
    image: `${effectiveUrl}/icon.svg`,
    description: siteConfig.description,
    email: siteConfig.supportEmail,
    founder: {
      '@type': 'Person',
      name: 'Pete Currey',
      jobTitle: 'Founder',
      url: `${effectiveUrl}/about`,
      image: `${effectiveUrl}/images/founder-pete-currey.png`,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: siteConfig.supportEmail,
      contactType: 'customer support',
      availableLanguage: 'English',
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
    },
    sameAs: [
      'https://twitter.com/avorria',
      'https://www.linkedin.com/company/avorria',
      'https://github.com/avorria',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface WebSiteJsonLdProps {
  url?: string;
}

export function WebSiteJsonLd({ url }: WebSiteJsonLdProps) {
  const effectiveUrl = getCanonicalUrl(url);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: effectiveUrl,
    description: siteConfig.description,
    inLanguage: 'en-US',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbItemInput {
  name: string;
  item?: string;
  url?: string;
}

type AnyBreadcrumb = SeoBreadcrumbItem & BreadcrumbItemInput;

interface BreadcrumbJsonLdProps {
  breadcrumbs?: SeoBreadcrumbItem[] | BreadcrumbItemInput[];
  items?: BreadcrumbItemInput[];
  baseUrl?: string;
}

export function BreadcrumbJsonLd({ breadcrumbs, items, baseUrl }: BreadcrumbJsonLdProps) {
  const rawList = breadcrumbs || items;
  if (!rawList || rawList.length === 0) return null;

  const effectiveBaseUrl = getCanonicalUrl(baseUrl);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: (rawList as AnyBreadcrumb[]).map((crumb, idx) => {
      const targetUrl = crumb.item || crumb.url || '';
      return {
        '@type': 'ListItem',
        position: idx + 1,
        name: crumb.name,
        item: targetUrl.startsWith('http')
          ? targetUrl
          : `${effectiveBaseUrl}${targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`}`,
      };
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface FaqJsonLdProps {
  faqs: SeoFaqItem[];
}

export function FaqJsonLd({ faqs }: FaqJsonLdProps) {
  if (!faqs || faqs.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface SoftwareApplicationJsonLdProps {
  name?: string;
  description?: string;
  url?: string;
  applicationCategory?: string;
}

export function SoftwareApplicationJsonLd({
  name = `${siteConfig.name} Contractor Operating & Compliance Platform`,
  description = siteConfig.description,
  url,
  applicationCategory = 'BusinessApplication',
}: SoftwareApplicationJsonLdProps) {
  const effectiveUrl = getCanonicalUrl(url);

  // Generate offers directly from PRICING_PLANS source of truth
  const planOffers = PRICING_PLANS.map((plan) => ({
    '@type': 'Offer',
    name: plan.name,
    description: plan.description,
    price: (plan.monthlyPriceCents / 100).toFixed(2),
    priceCurrency: 'USD',
    priceValidUntil: '2027-12-31',
    url: `${effectiveUrl}/pricing`,
    availability: 'https://schema.org/InStock',
  }));

  const maxPrice = Math.max(...PRICING_PLANS.map((p) => p.monthlyPriceCents));

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    applicationCategory,
    operatingSystem: 'All modern web browsers, iOS, Android',
    url: effectiveUrl,
    softwareVersion: '2026.1',
    creator: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: effectiveUrl,
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: '0.00',
      highPrice: (maxPrice / 100).toFixed(2),
      offerCount: PRICING_PLANS.length,
      offers: planOffers,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ArticleJsonLdProps {
  title: string;
  description: string;
  url: string;
  publishedAt?: string;
  updatedAt?: string;
  authorName?: string;
}

export function ArticleJsonLd({
  title,
  description,
  url,
  publishedAt = '2026-09-01T00:00:00Z',
  updatedAt = '2026-09-01T00:00:00Z',
  authorName = 'Avorria Editorial Team',
}: ArticleJsonLdProps) {
  const effectiveUrl = getCanonicalUrl(url);
  const siteUrl = getCanonicalUrl();

  const isPersonAuthor = authorName.toLowerCase().includes('pete currey');

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: effectiveUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': effectiveUrl,
    },
    datePublished: publishedAt,
    dateModified: updatedAt,
    author: isPersonAuthor
      ? {
          '@type': 'Person',
          name: authorName,
          url: `${siteUrl}/about`,
        }
      : {
          '@type': 'Organization',
          name: authorName,
          url: siteUrl,
        },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icon.svg`,
      },
    },
    inLanguage: 'en-US',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
