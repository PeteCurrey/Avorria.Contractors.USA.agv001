import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Contractor Document Templates (OSHA & Commercial Forms) | Avorria',
  description:
    'Download standardized contractor templates for US construction: JHA, JSA, Construction Safety Plans, Toolbox Talks, Proposals, and Change Orders.',
  alternates: {
    canonical: `${siteConfig.url}/templates`,
  },
};

const TEMPLATES = [
  {
    title: 'Job Hazard Analysis (JHA)',
    slug: 'templates/job-hazard-analysis-jha',
    category: 'Safety Plan',
    format: 'PDF / Web Form',
    time: '10 Mins',
    description: 'Systematic task-by-task breakdown identifying potential hazards, OSHA 1926 controls, and required personal protective equipment.',
  },
  {
    title: 'Job Safety Analysis (JSA)',
    slug: 'templates/job-safety-analysis-jsa',
    category: 'Safety Plan',
    format: 'PDF / Web Form',
    time: '10 Mins',
    description: 'Standard 3-column safety analysis format designed for crew training and field hazard evaluations prior to daily task execution.',
  },
  {
    title: 'Construction Safety Plan (HASP)',
    slug: 'templates/construction-safety-plan',
    category: 'Site Program',
    format: 'Complete Manual',
    time: '25 Mins',
    description: 'Comprehensive written health and safety program covering emergency action plans, competent persons, and site hazard communication.',
  },
  {
    title: 'Toolbox Talk Meeting Roster',
    slug: 'templates/toolbox-talk',
    category: 'Field Training',
    format: 'Roster / PDF',
    time: '5 Mins',
    description: 'Weekly safety briefing agenda with crew attendance signature roster to verify ongoing OSHA training compliance during audits.',
  },
  {
    title: 'Commercial Contractor Proposal',
    slug: 'templates/contractor-proposal',
    category: 'Commercial',
    format: 'Proposal Pack',
    time: '15 Mins',
    description: 'Professional construction proposal template with itemized scope, milestone billing, terms, and digital client sign-off clauses.',
  },
  {
    title: 'Construction Change Order',
    slug: 'templates/change-order',
    category: 'Commercial',
    format: 'Agreement / PDF',
    time: '5 Mins',
    description: 'Formally document scope additions, cost modifications, and schedule adjustments before commencing extra work on site.',
  },
];

export default function TemplatesIndexPage() {
  return (
    <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-slate-100">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="primary" size="md">DOCUMENT LIBRARY</Badge>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Contractor Document Templates
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          Standardized, legally vetted, and OSHA-aligned document templates designed for commercial and residential trade contractors in the United States.
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEMPLATES.map((tmpl) => (
          <Card key={tmpl.slug} variant="interactive" className="flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-brand-400 uppercase font-mono">{tmpl.category}</span>
                <span className="text-slate-500 font-mono text-[11px]">{tmpl.format}</span>
              </div>
              <CardTitle className="text-lg">{tmpl.title}</CardTitle>
              <CardDescription className="text-xs">{tmpl.description}</CardDescription>
            </div>

            <div className="pt-6 flex items-center justify-between border-t border-surface-border mt-4 text-xs">
              <span className="text-slate-500 font-mono">Est: {tmpl.time}</span>
              <Button href={`/${tmpl.slug}`} size="sm" variant="outline">
                View Template →
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Template Quality Standards */}
      <section className="p-8 rounded-2xl bg-surface-card border border-surface-border space-y-4 max-w-4xl mx-auto text-xs leading-relaxed text-slate-300">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Our Template Quality Standards
        </h3>
        <p>
          Every template provided by Avorria is structured according to US federal OSHA construction standards (29 CFR 1926/1910) and standard commercial subcontract specifications. Templates are designed for immediate field application and can be customized with your company logo and active credentials.
        </p>
      </section>
    </div>
  );
}
