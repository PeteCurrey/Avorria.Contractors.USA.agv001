import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { CinematicPageHero } from '@/components/hero/CinematicPageHero';

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
    <div className="min-h-screen bg-surface-page text-navy-800">
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: `${siteConfig.url}/` },
        { name: 'Contractor Tools', url: `${siteConfig.url}/tools` },
      ]} />
      <CinematicPageHero
        eyebrow="CONTRACTOR UTILITIES · PROFESSIONAL JOB TOOLS"
        title={<>Field Utilities &amp;<br />Commercial Calculators.</>}
        subtitle="Practical digital utilities engineered for American trade contractors to evaluate site hazards, model commercial margins, and document compliance."
        primaryCta={{ label: 'Launch JHA Generator', href: '/tools/job-hazard-analysis-jha-generator' }}
        secondaryCta={{ label: 'Margin & Quote Calculator', href: '/tools/contractor-quote-calculator' }}
        backgroundImage="/images/hero-tools.jpg"
        backgroundAlt="Trade contractor foreman utilizing digital hazard assessment tool and engineering calculations in field vehicle"
        pillars={[
          { title: 'OSHA 1926 Safety Forms', description: 'Step-by-step Job Hazard Analysis with codified control measures and signed sign-offs.' },
          { title: 'Commercial Labor Burden', description: 'Accurate fully burdened labor rate calculators with worker comp and payroll overhead.' },
          { title: 'Immediate PDF Exports', description: 'Generate branded commercial documentation ready for GC review in under 2 minutes.' },
        ]}
      />
      <div className="max-w-7xl mx-auto space-y-12 py-16 px-4 sm:px-6 lg:px-8">

        {/* Featured Flagship Card */}
        <div className="bg-white border border-slate-200 shadow-sm p-8 sm:p-10 space-y-4 max-w-4xl mx-auto rounded-lg">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-brand-50 border border-brand-200 text-brand-700 text-[10px] font-mono font-medium uppercase rounded-[4px]">
              Flagship Field Tool
            </span>
            <span className="text-xs text-slate-500 font-mono">OSHA 29 CFR 1926 Aligned</span>
          </div>
          <h2 className="text-2xl font-light text-navy-900 tracking-tight">
            Job Hazard Analysis (JHA) Field Generator
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
            Select your trade scope, break down sequenced job steps, enforce engineering and administrative safeguards, and export clean, project-ready JHA documentation for on-site safety briefings.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href="/tools/job-hazard-analysis-jha-generator"
              className="px-6 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs uppercase tracking-wider transition-colors rounded-[4px]"
            >
              Launch JHA Generator →
            </Link>
            <Link
              href="/resources/site-safety-inspection"
              className="px-6 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors rounded-[4px]"
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
              className="bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md p-6 flex flex-col justify-between transition-all group rounded-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-sky-600 font-bold uppercase text-[11px] tracking-wider">
                    {tool.category}
                  </span>
                  <span className="text-slate-400 text-[11px]">{tool.standard}</span>
                </div>

                <h3 className="text-base font-bold text-navy-800 group-hover:text-sky-600 transition-colors leading-snug">
                  <Link href={`/${tool.slug}`}>{tool.title}</Link>
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {tool.description}
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6">
                <Link
                  href={`/${tool.slug}`}
                  className="w-full block py-2 px-3 text-center bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-slate-700 hover:text-sky-700 font-bold text-xs uppercase tracking-wider transition-colors rounded-[4px]"
                >
                  {tool.actionText} →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="p-8 bg-sky-50 border border-sky-200 text-center space-y-4 max-w-3xl mx-auto rounded-lg">
          <h3 className="text-lg font-bold text-navy-800">Full 25-Resource Commercial Library Available</h3>
          <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">
            Access our complete catalogue of contractor capability statements, AIA-aligned qualification forms, bid proposals, and project handover audits.
          </p>
          <div className="pt-1">
            <Link
              href="/resources"
              className="inline-block px-6 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold uppercase tracking-wider transition-colors rounded-[4px]"
            >
              Browse Full Resource Catalogue →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
