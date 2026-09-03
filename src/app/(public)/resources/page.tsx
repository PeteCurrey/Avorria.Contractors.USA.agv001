import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Contractor Resource Center & Industry Guides | Avorria',
  description:
    'Educational guides, regulatory checklists, trade safety standards, and state licensing frameworks for professional US contractors.',
  alternates: {
    canonical: `${siteConfig.url}/resources`,
  },
};

const RESOURCES = [
  {
    title: 'The Complete US Contractor Compliance Checklist (2026)',
    slug: 'guides/contractor-compliance-checklist',
    category: 'Compliance Guide',
    tag: 'Essential Reading',
    description: 'A practical, 30-point compliance checklist covering federal entity registration, insurance COI limits, state licensing boards, and OSHA safety standards.',
  },
  {
    title: 'Electrical Contractor Safety & NFPA 70E Arc Flash Standards',
    slug: 'industries/electrical-contractor-compliance',
    category: 'Trade Standard',
    tag: 'Electrical',
    description: 'Deep dive into NFPA 70E arc flash risk evaluations, PPE category selection, lockout/tagout (LOTO) protocols, and Texas TDLR master licensing.',
  },
  {
    title: 'Texas Contractor Requirements: Licensing, Insurance & TDLR Guide',
    slug: 'states/texas-contractor-requirements',
    category: 'State Regulatory',
    tag: 'Texas (TDLR)',
    description: 'Navigating trade-specific state licensing under the Texas Department of Licensing and Regulation, municipal GC permits, and workers’ compensation rules.',
  },
];

export default function ResourcesPage() {
  return (
    <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-slate-100">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="primary" size="md">RESOURCE CENTER</Badge>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Contractor Knowledge & Regulatory Guides
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          Operational guidance, compliance frameworks, and trade-specific safety specifications for professional contractors operating in the United States.
        </p>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {RESOURCES.map((res) => (
          <Card key={res.slug} variant="interactive" className="flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-brand-400 uppercase font-mono">{res.category}</span>
                <Badge variant="neutral" size="sm">{res.tag}</Badge>
              </div>
              <CardTitle className="text-lg">{res.title}</CardTitle>
              <CardDescription className="text-xs">{res.description}</CardDescription>
            </div>
            <div className="pt-6 border-t border-surface-border mt-4">
              <Button href={`/${res.slug}`} size="sm" variant="outline" className="w-full">
                Read Guide →
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Editorial Disclaimer */}
      <section className="p-8 rounded-2xl bg-surface-card border border-surface-border space-y-3 text-xs text-slate-400 max-w-3xl mx-auto leading-relaxed text-center">
        <strong className="text-slate-300 block uppercase font-mono">Editorial Policy</strong>
        All Avorria resource guides are authored and reviewed by experienced construction compliance specialists. Guides reflect current US regulations and standard commercial subcontracting covenants. Guides do not constitute legal advice.
      </section>
    </div>
  );
}
