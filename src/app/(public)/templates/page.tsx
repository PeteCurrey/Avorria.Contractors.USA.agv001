import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Contractor Document Templates (OSHA & Commercial Forms) | Avorria',
  description:
    'Download standardized contractor templates for US construction: JHA, JSA, Construction Safety Plans, Toolbox Talks, Proposals, and Change Orders.',
  alternates: {
    canonical: `${siteConfig.url}/templates`,
  },
};

interface TemplateItem {
  title: string;
  slug: string;
  category: 'Safety & OSHA' | 'Commercial & Contracts' | 'Operations & Field';
  format: string;
  time: string;
  standard: string;
  description: string;
}

const TEMPLATES: TemplateItem[] = [
  // Safety & OSHA
  {
    title: 'Job Hazard Analysis (JHA)',
    slug: 'templates/job-hazard-analysis-jha',
    category: 'Safety & OSHA',
    format: 'PDF & Web Form',
    time: '10 Mins',
    standard: 'OSHA 29 CFR 1926.21',
    description:
      'Systematic task-by-task breakdown identifying potential workplace hazards, OSHA 1926 controls, and required personal protective equipment.',
  },
  {
    title: 'Job Safety Analysis (JSA)',
    slug: 'templates/job-safety-analysis-jsa',
    category: 'Safety & OSHA',
    format: 'PDF & Field Form',
    time: '10 Mins',
    standard: 'Task Hazard Evaluation',
    description:
      'Standard 3-column safety analysis format designed for crew briefings and field hazard evaluations prior to daily task execution.',
  },
  {
    title: 'Construction Safety Plan (HASP)',
    slug: 'templates/construction-safety-plan',
    category: 'Safety & OSHA',
    format: 'Complete Written Manual',
    time: '25 Mins',
    standard: 'OSHA 1926 Safety Program',
    description:
      'Comprehensive written health and safety program covering emergency action plans, competent persons, and site hazard communication protocols.',
  },
  {
    title: 'Toolbox Talk Meeting Roster',
    slug: 'templates/toolbox-talk',
    category: 'Safety & OSHA',
    format: 'Attendance Roster & PDF',
    time: '5 Mins',
    standard: 'OSHA Training Audit Standard',
    description:
      'Weekly safety briefing agenda with signed crew attendance roster to verify ongoing OSHA safety training compliance during site inspections.',
  },

  // Commercial & Contracts
  {
    title: 'Commercial Contractor Proposal',
    slug: 'templates/contractor-proposal',
    category: 'Commercial & Contracts',
    format: 'Proposal Dossier',
    time: '15 Mins',
    standard: 'Commercial Subcontract Standard',
    description:
      'Professional construction proposal template with itemized scope of work, milestone payment terms, warranties, and client sign-off clauses.',
  },
  {
    title: 'Construction Change Order',
    slug: 'templates/change-order',
    category: 'Commercial & Contracts',
    format: 'Agreement Document',
    time: '5 Mins',
    standard: 'Scope & Cost Addendum',
    description:
      'Formally document scope additions, unforeseen site condition costs, and schedule adjustments before commencing unauthorized extra work.',
  },
];

export default function TemplatesIndexPage() {
  const categories: Array<'Safety & OSHA' | 'Commercial & Contracts'> = [
    'Safety & OSHA',
    'Commercial & Contracts',
  ];

  return (
    <div className="min-h-screen bg-surface-page text-navy-800">
      {/* Light Hero Header */}
      <section className="bg-white border-b border-slate-200 py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs uppercase tracking-wider">
            Document Template Library
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-navy-900 tracking-tight leading-tight">
            Professional contractor templates, <br className="hidden sm:inline" />
            <span className="text-brand-600">ready to deploy.</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Standardized, legally vetted, and OSHA-aligned document templates designed for commercial and specialty trade contractors in the United States.
          </p>
        </div>
      </section>

      {/* Templates Grouped by Category */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-16">
        {categories.map((category) => {
          const items = TEMPLATES.filter((t) => t.category === category);

          return (
            <div key={category} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-black text-navy-900 tracking-tight">{category}</h2>
                <span className="text-xs font-mono text-slate-500 uppercase">
                  {items.length} Standardized Templates
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((tmpl) => (
                  <div
                    key={tmpl.slug}
                    className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-slate-400 text-[11px]">{tmpl.format}</span>
                        <span className="font-mono text-brand-600 text-[11px] font-semibold">
                          {tmpl.standard}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-navy-900 leading-snug">{tmpl.title}</h3>
                      <p className="text-slate-600 text-xs leading-relaxed">{tmpl.description}</p>
                    </div>

                    <div className="pt-6 flex items-center justify-between border-t border-slate-100 mt-6 text-xs">
                      <span className="text-slate-400 font-mono text-[11px]">Est. Time: {tmpl.time}</span>
                      <Button href={`/${tmpl.slug}`} size="sm" variant="secondary">
                        View Template →
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Quality Standards Framework */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-2">
            <span className="font-mono text-xs text-brand-600 uppercase tracking-widest font-semibold">
              Standards & Integrity
            </span>
            <h2 className="text-2xl font-bold text-navy-900">Avorria Template Quality Standards</h2>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            Every template provided in the Avorria repository is structured according to US federal OSHA construction standards (29 CFR 1926/1910) and standard commercial subcontracting covenants. Templates are designed for immediate field application and can be customized with your company branding, primary trade, and active license details.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
            <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-1">
              <div className="font-bold text-navy-900">OSHA 1926 Aligned</div>
              <div className="text-slate-500">Structured control hierarchies matching federal inspection standards.</div>
            </div>
            <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-1">
              <div className="font-bold text-navy-900">Subcontract Ready</div>
              <div className="text-slate-500">Drafted to satisfy tier-1 general contractor pre-qualification specs.</div>
            </div>
            <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-1">
              <div className="font-bold text-navy-900">Branded PDF Output</div>
              <div className="text-slate-500">Export clean, high-resolution documentation with your company marks.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Dark Footer Anchor CTA */}
      <section className="bg-[#070c18] text-white py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Ready to generate your first job hazard document?
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Launch our interactive Job Hazard Analysis generator and produce a compliant, project-ready JHA in under 5 minutes.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Button href="/tools/job-hazard-analysis-jha-generator" size="lg" variant="primary">
              Launch Free JHA Generator
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
