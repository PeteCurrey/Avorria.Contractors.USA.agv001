import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Free Interactive Tools & Safety Generators for Contractors | Avorria',
  description:
    'Free interactive tools for US commercial and trade contractors: Job Hazard Analysis (JHA) generator, contractor quote calculator, and safety plan builders.',
  alternates: {
    canonical: `${siteConfig.url}/tools`,
  },
};

const TOOLS = [
  {
    title: 'Job Hazard Analysis (JHA) Generator',
    slug: 'tools/job-hazard-analysis-jha-generator',
    category: 'Safety & OSHA',
    standard: 'OSHA 1926 Aligned',
    description:
      'Step-by-step interactive tool to identify workplace hazards, assign OSHA control measures, and generate job-ready PDF summaries for field crews.',
    featured: true,
    actionText: 'Launch Free JHA Generator',
  },
  {
    title: 'Contractor Quote & Margin Calculator',
    slug: 'tools/contractor-quote-calculator',
    category: 'Estimating & Finance',
    standard: 'Burden & Overhead Modeling',
    description:
      'Calculate real labor burden, direct materials, equipment rental, overhead markup, and target profit margins to prevent underbidding commercial projects.',
    featured: false,
    actionText: 'Calculate Bid Margins',
  },
  {
    title: 'Contractor Compliance Checklist Tool',
    slug: 'guides/contractor-compliance-checklist',
    category: 'Compliance & Audit',
    standard: '30-Point Verification Audit',
    description:
      'Evaluate your business entity registration, active COI coverage, state trade licensing, and OSHA written hazard communication standards.',
    featured: false,
    actionText: 'Open Compliance Checklist',
  },
  {
    title: 'Job Safety Analysis (JSA) Builder',
    slug: 'templates/job-safety-analysis-jsa',
    category: 'Safety & Training',
    standard: 'Daily Field Briefing',
    description:
      'Structured 3-column field hazard analysis designed for daily crew briefings and site safety meetings before daily work commences.',
    featured: false,
    actionText: 'View JSA Builder',
  },
  {
    title: 'Site Safety Plan (HASP) Generator',
    slug: 'templates/construction-safety-plan',
    category: 'Commercial Pre-Qual',
    standard: 'Site-Specific Written Manual',
    description:
      'Build a site-specific written health and safety manual required for commercial general contractor pre-qualification.',
    featured: false,
    actionText: 'View Safety Plan',
  },
  {
    title: 'Toolbox Talk Meeting Log Builder',
    slug: 'templates/toolbox-talk',
    category: 'Workforce Training',
    standard: 'OSHA 29 CFR 1926.21',
    description:
      'Document weekly safety training meetings with signed crew attendance rosters to satisfy OSHA audit standards and general contractor requirements.',
    featured: false,
    actionText: 'View Toolbox Talk Log',
  },
];

export default function ToolsIndexPage() {
  return (
    <div className="min-h-screen bg-surface-page text-navy-800">
      {/* Light Hero Header */}
      <section className="bg-white border-b border-slate-200 py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs uppercase tracking-wider">
            Contractor Utilities · 100% Free to Use
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-navy-900 tracking-tight leading-tight">
            Free tools for <br className="hidden sm:inline" />
            <span className="text-brand-600">American trade contractors.</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Field-tested digital utilities engineered to streamline job hazard evaluations, calculate accurate commercial profit margins, and keep your crews compliant.
          </p>
        </div>
      </section>

      {/* Featured Primary Tool: JHA Generator */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="rounded-2xl border-2 border-brand-500/30 bg-gradient-to-br from-blue-50/50 via-white to-slate-50 p-8 sm:p-12 shadow-sm relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded bg-brand-600 text-white font-mono text-xs font-bold uppercase tracking-wider">
                Flagship Tool
              </span>
              <span className="font-mono text-xs text-slate-500">Instant PDF Export · No Credit Card</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-navy-900">
              Interactive Job Hazard Analysis (JHA) Generator
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Select your trade, identify site-specific hazards across 7 risk categories, and automatically generate
              an OSHA 1926-aligned Job Hazard Analysis document with engineering controls, administrative safeguards,
              and PPE requirements.
            </p>
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Button href="/tools/job-hazard-analysis-jha-generator" size="lg" variant="primary">
                Launch Free JHA Generator →
              </Button>
              <Button href="/templates/job-hazard-analysis-jha" size="lg" variant="secondary">
                View Sample JHA Template
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h2 className="text-xl font-bold text-navy-900">All Interactive Utilities</h2>
          <span className="text-xs font-mono text-slate-500">6 Available Tools</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS.map((tool) => (
            <div
              key={tool.slug}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-brand-600 font-semibold uppercase">{tool.category}</span>
                  <span className="font-mono text-slate-400 text-[11px]">{tool.standard}</span>
                </div>
                <h3 className="text-lg font-bold text-navy-900 leading-snug">{tool.title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed">{tool.description}</p>
              </div>
              <div className="pt-6 border-t border-slate-100 mt-6">
                <Button href={`/${tool.slug}`} size="sm" variant="secondary" className="w-full">
                  {tool.actionText} →
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dark Conversion Anchor */}
      <section className="bg-[#070c18] text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800 text-center mt-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Need to save and organize your documents?
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Create a free Avorria account to save generated JHAs to your cloud workspace, add custom company branding, and attach documents to your verified Contractor Passport.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Button href="/sign-up" size="lg" variant="primary">
              Create Free Account
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
