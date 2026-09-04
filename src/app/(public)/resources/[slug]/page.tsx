import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { CONTRACTOR_RESOURCES, getResourceBySlug } from '@/lib/resources/catalogue';
import { ResourceWorkspaceClient } from './ResourceWorkspaceClient';

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
  };
}

export default async function ResourceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const resource = getResourceBySlug(slug);

  if (!resource) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ResourceWorkspaceClient resource={resource} />
      </div>
    </div>
  );
}
