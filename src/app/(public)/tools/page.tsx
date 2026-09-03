import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Interactive Contractor Tools & Generators',
  description: 'Free interactive tools for US trade contractors: Job Hazard Analysis (JHA) generator, contractor quote calculator, and safety plan builders.',
  alternates: {
    canonical: `${siteConfig.url}/tools`,
  },
};

const TOOLS = [
  {
    title: 'Job Hazard Analysis (JHA) Generator',
    slug: 'tools/job-hazard-analysis-jha-generator',
    category: 'Safety & OSHA',
    description: 'Step-by-step interactive tool to identify work hazards, OSHA control measures, and mandatory personal protective equipment (PPE).',
    badge: 'Popular',
  },
  {
    title: 'Contractor Quote & Margin Calculator',
    slug: 'tools/contractor-quote-calculator',
    category: 'Estimating & Finance',
    description: 'Calculate real labor burden, materials, equipment, overhead percentage, and target profit margins to prevent underbidding.',
    badge: 'Estimating',
  },
];

export default function ToolsIndexPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      <div className="max-w-3xl space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-brand-400">Interactive Utilities</div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Contractor Tools & Generators</h1>
        <p className="text-slate-400 text-base leading-relaxed">
          Engineered to help US trade contractors generate site-ready documentation, calculate realistic bid margins, and adhere to federal and state standards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TOOLS.map((tool) => (
          <div
            key={tool.slug}
            className="p-6 rounded-xl bg-surface-card border border-surface-border hover:border-brand-600/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{tool.category}</span>
                <span className="text-xs px-2.5 py-0.5 rounded bg-brand-950 text-brand-400 border border-brand-800">
                  {tool.badge}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{tool.title}</h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">{tool.description}</p>
            </div>
            <div>
              <Link
                href={`/${tool.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-400 hover:text-brand-300"
              >
                Launch Tool →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
