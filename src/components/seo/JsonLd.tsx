import React from 'react';
import { siteConfig } from '@/config/site';
import { SeoBreadcrumbItem, SeoFaqItem } from '@/types/seo';

interface OrganizationJsonLdProps {
  url?: string;
  name?: string;
}

export function OrganizationJsonLd({ url = siteConfig.url, name = siteConfig.name }: OrganizationJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    legalName: siteConfig.legalName,
    url,
    logo: `${url}/brand-logo.png`,
    description: siteConfig.description,
    email: siteConfig.supportEmail,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
    },
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

export function WebSiteJsonLd({ url = siteConfig.url }: WebSiteJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url,
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

interface BreadcrumbJsonLdProps {
  breadcrumbs: SeoBreadcrumbItem[];
  baseUrl?: string;
}

export function BreadcrumbJsonLd({ breadcrumbs, baseUrl = siteConfig.url }: BreadcrumbJsonLdProps) {
  if (!breadcrumbs || breadcrumbs.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: crumb.name,
      item: crumb.item.startsWith('http') ? crumb.item : `${baseUrl}${crumb.item}`,
    })),
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
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
}

export function SoftwareApplicationJsonLd({
  name,
  description,
  url,
  applicationCategory = 'BusinessApplication',
}: SoftwareApplicationJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    applicationCategory,
    operatingSystem: 'All modern web browsers',
    url,
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
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
  publishedAt: string;
  updatedAt: string;
  authorName: string;
}

export function ArticleJsonLd({
  title,
  description,
  url,
  publishedAt,
  updatedAt,
  authorName,
}: ArticleJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    datePublished: publishedAt,
    dateModified: updatedAt,
    author: {
      '@type': 'Organization',
      name: authorName,
      url: siteConfig.url,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
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
