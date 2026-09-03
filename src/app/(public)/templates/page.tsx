import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Contractor Document Templates (OSHA & Commercial Forms)',
  description: 'Download standardized contractor templates for US construction: JHA, JSA, Construction Safety Plans, Toolbox Talks, Proposals, and Change Orders.',
  alternates: {
    canonical: `${siteConfig.url}/templates`,
  },
};

const TEMPLATES = [
  {
    title: 'Job Hazard Analysis (JHA)',
    slug: 'templates/job-hazard-analysis-jha',
    category: 'Safety Plan',
    format: 'PDF / DOCX / Web',
    description: 'Systematic task-by-task breakdown identifying potential hazards, OSHA 1926 controls, and required PPE.',
  },
  {
    title: 'Job Safety Analysis (JSA)',
    slug: 'templates/job-safety-analysis-jsa',
    category: 'Safety Plan',
    format: 'PDF / DOCX / Web',
    description: 'Standard 3-column safety analysis format designed for crew training and field hazard evaluations.',
  },
  {
    title: 'Construction Safety Plan (HASP)',
    slug: 'templates/construction-safety-plan',
    category: 'Site Program',
    format: 'Complete Manual',
    description: 'Comprehensive written health and safety plan covering competent persons, HAZCOM, and emergency action plans.',
  },
  {
    title: 'Weekly Toolbox Talk Sign-In',
    slug: 'templates/toolbox-talk',
    category: 'Field Training',
    format: 'Roster / PDF',
    description: 'Safety briefing agenda with crew attendance signature roster to verify ongoing OSHA training compliance.',
  },
  {
    title: 'Commercial Contractor Proposal',
    slug: 'templates/contractor-proposal',
    category: 'Commercial',
    format: 'Proposal Pack',
    description: 'Professional construction proposal template with itemized scope, milestone billing, and change order clauses.',
  },
  {
    title: 'Construction Change Order',
    slug: 'templates/change-order',
    category: 'Commercial',
    format: 'Agreement / PDF',
    description: 'Formally document scope additions, cost modifications, and schedule adjustments before commencing extra work.',
  },
];

export default function TemplatesIndexPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      <div className="max-w-3xl space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-brand-400">Document Library</div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Contractor Document Templates</h1>
        <p className="text-slate-400 text-base leading-relaxed">
          Standardized, legally vetted, and OSHA-aligned document templates designed for commercial and residential trade contractors in the United States.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEMPLATES.map((tmpl) => (
          <div
            key={tmpl.slug}
            className="p-6 rounded-xl bg-surface-card border border-surface-border hover:border-brand-600/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-semibold text-slate-400 uppercase tracking-wider">{tmpl.category}</span>
                <span className="text-slate-500 font-mono">{tmpl.format}</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{tmpl.title}</h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">{tmpl.description}</p>
            </div>
            <div>
              <Link
                href={`/${tmpl.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-400 hover:text-brand-300"
              >
                View Template Details →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
