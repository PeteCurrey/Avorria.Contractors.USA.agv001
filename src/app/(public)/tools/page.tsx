import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Interactive Contractor Tools & Field Calculators | Avorria',
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
      'Step-by-step interactive tool to identify workplace hazards, assign OSHA control measures, and generate job-ready documentation for field crews.',
    actionText: 'Launch JHA Generator',
  },
  {
    title: 'Contractor Estimate Worksheet',
    slug: 'resources/estimate-worksheet',
    category: 'Estimating & Finance',
    standard: 'Direct Burden & Markup Modeling',
    description:
      'Calculate burdened labor rates, direct materials, equipment rental, overhead markup, and target profit margins for commercial tender submissions.',
    actionText: 'Open Estimate Worksheet',
  },
  {
    title: 'Contract Change Order Generator',
    slug: 'resources/change-order-form',
    category: 'Commercial Contracts',
    standard: 'AIA G701 Aligned',
    description:
      'Document scope additions, unforeseen site condition costs, and schedule adjustments before commencing unauthorized field work.',
    actionText: 'Create Change Order',
  },
  {
    title: 'Daily Construction Field Report',
    slug: 'resources/daily-construction-report',
    category: 'Project Operations',
    standard: 'Contemporaneous Field Records',
    description:
      'Capture weather, trade headcount, equipment on site, deliveries, inspections passed, delays, and daily safety observations.',
    actionText: 'Generate Daily Report',
  },
  {
    title: 'Site Safety Audit Checklist',
    slug: 'resources/site-safety-inspection',
    category: 'Safety & Compliance',
    standard: 'OSHA 29 CFR 1926',
    description:
      'Comprehensive jobsite inspection covering fall protection, PPE enforcement, electrical GFCI protection, excavation, and hazard communication.',
    actionText: 'Open Safety Audit',
  },
  {
    title: 'Toolbox Talk Attendance Roster',
    slug: 'resources/safety-meeting-toolbox-talk-record',
    category: 'Workforce Training',
    standard: 'OSHA 29 CFR 1926.21',
    description:
      'Document weekly safety training meetings with signed crew attendance rosters to satisfy OSHA inspection and GC prequalification standards.',
    actionText: 'Build Meeting Roster',
  },
];

export default function ToolsIndexPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 text-sky-400 text-xs font-bold uppercase tracking-wider">
            CONTRACTOR UTILITIES · PROFESSIONAL JOB TOOLS
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Field Utilities &amp; Commercial Calculators
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Practical digital utilities engineered for American trade contractors to evaluate site hazards, model commercial margins, and document compliance.
          </p>
        </div>

        {/* Featured Flagship Card */}
        <div className="bg-[#090d16] border border-slate-800 p-8 sm:p-10 space-y-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-sky-950 border border-sky-800 text-sky-400 text-[10px] font-bold uppercase">
              Flagship Field Tool
            </span>
            <span className="text-xs text-slate-500">OSHA 29 CFR 1926 Aligned</span>
          </div>
          <h2 className="text-2xl font-black text-white">
            Job Hazard Analysis (JHA) Field Generator
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-3xl">
            Select your trade scope, break down sequenced job steps, enforce engineering and administrative safeguards, and export clean, project-ready JHA documentation for on-site safety briefings.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href="/tools/job-hazard-analysis-jha-generator"
              className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Launch JHA Generator →
            </Link>
            <Link
              href="/resources/site-safety-inspection"
              className="px-6 py-2.5 bg-[#030712] hover:bg-slate-900 border border-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Site Safety Inspection Checklist
            </Link>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS.map((tool) => (
            <div
              key={tool.slug}
              className="bg-[#090d16] border border-slate-800 hover:border-slate-700 p-6 flex flex-col justify-between transition-colors group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-sky-400 font-bold uppercase text-[11px] tracking-wider">
                    {tool.category}
                  </span>
                  <span className="text-slate-500 text-[11px]">{tool.standard}</span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors leading-snug">
                  <Link href={`/${tool.slug}`}>{tool.title}</Link>
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {tool.description}
                </p>
              </div>

              <div className="pt-6 border-t border-slate-800 mt-6">
                <Link
                  href={`/${tool.slug}`}
                  className="w-full block py-2 px-3 text-center bg-[#030712] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  {tool.actionText} →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="p-8 bg-[#090d16] border border-slate-800 text-center space-y-4 max-w-3xl mx-auto">
          <h3 className="text-lg font-bold text-white">Full 25-Resource Commercial Library Available</h3>
          <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
            Access our complete catalogue of contractor capability statements, AIA-aligned qualification forms, bid proposals, and project handover audits.
          </p>
          <div className="pt-1">
            <Link
              href="/resources"
              className="inline-block px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Browse Full Resource Catalogue →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
