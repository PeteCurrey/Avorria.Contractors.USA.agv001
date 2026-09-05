import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { CONTRACTOR_RESOURCES, getResourceBySlug } from '@/lib/resources/catalogue';
import { ResourceWorkspaceClient } from './ResourceWorkspaceClient';
import { BreadcrumbJsonLd, ArticleJsonLd } from '@/components/seo/JsonLd';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return CONTRACTOR_RESOURCES.map((res) => ({
    slug: res.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resource = getResourceBySlug(slug);

  if (!resource) {
    return {
      title: 'Resource Not Found | Avorria',
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = `${siteConfig.url}/resources/${resource.slug}`;

  return {
    title: `${resource.title} (${resource.format}) | Avorria Resources`,
    description: resource.shortDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${resource.title} | Avorria Contractor Resources`,
      description: resource.shortDescription,
      url: canonicalUrl,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${resource.title} | Avorria Resources`,
      description: resource.shortDescription,
    },
  };
}

export default async function ResourceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const resource = getResourceBySlug(slug);

  if (!resource) {
    notFound();
  }

  const canonicalUrl = `${siteConfig.url}/resources/${resource.slug}`;

  return (
    <div className="min-h-screen bg-surface-page text-navy-800 py-10 px-4 sm:px-6 lg:px-8">
      <BreadcrumbJsonLd
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Resources', item: '/resources' },
          { name: resource.title, item: `/resources/${resource.slug}` },
        ]}
      />
      <ArticleJsonLd
        title={`${resource.title} (${resource.format})`}
        description={resource.shortDescription}
        url={canonicalUrl}
        publishedAt="2026-09-01T00:00:00Z"
        updatedAt="2026-09-01T00:00:00Z"
        authorName="Avorria Editorial Team"
      />
      <div className="max-w-7xl mx-auto">
        <ResourceWorkspaceClient resource={resource} />
      </div>
    </div>
  );
}
