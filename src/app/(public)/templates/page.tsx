import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { CONTRACTOR_RESOURCES, getResourcesByType } from '@/lib/resources/catalogue';

export const metadata: Metadata = {
  title: 'Contractor Document Templates & Commercial Forms | Avorria',
  description:
    'Download standardized contractor templates for US commercial construction: Scope of Work, Proposal, Change Order, Subcontractor Scope, and Safety Plans.',
  alternates: {
    canonical: `${siteConfig.url}/templates`,
  },
};

export default function TemplatesIndexPage() {
  const templates = CONTRACTOR_RESOURCES.filter(
    (r) => r.type === 'template' || r.type === 'generator'
  );

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 text-sky-400 text-xs font-bold uppercase tracking-wider">
            DOCUMENT TEMPLATE LIBRARY · COMMERCIAL CONTRACTOR STANDARDS
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Professional Contractor Document Templates
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Legally vetted and OSHA-aligned document templates designed for commercial general contractors and specialty trade contractors in the United States.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tmpl) => (
            <div
              key={tmpl.slug}
              className="bg-[#090d16] border border-slate-800 hover:border-slate-700 p-6 flex flex-col justify-between transition-colors group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-sky-400 font-bold uppercase text-[11px] tracking-wider">
                    {tmpl.categoryName}
                  </span>
                  <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-bold uppercase">
                    {tmpl.code}
                  </span>
                </div>

                <h2 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors leading-snug">
                  <Link href={`/resources/${tmpl.slug}`}>{tmpl.title}</Link>
                </h2>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {tmpl.shortDescription}
                </p>

                <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-800/80 flex items-center justify-between">
                  <span>STANDARD:</span>
                  <span className="text-slate-300 font-medium">{tmpl.standard}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800 mt-6 space-y-2">
                <Link
                  href={`/resources/${tmpl.slug}`}
                  className="w-full block py-2 px-3 text-center bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Open Template Workspace →
                </Link>
                <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                  <a
                    href={`/api/resources/${tmpl.slug}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-2 bg-[#030712] hover:bg-slate-900 border border-slate-800 text-slate-300 font-medium transition-colors"
                  >
                    PDF Export
                  </a>
                  <a
                    href={`/api/resources/${tmpl.slug}/docx`}
                    className="py-1.5 px-2 bg-[#030712] hover:bg-slate-900 border border-slate-800 text-slate-300 font-medium transition-colors"
                  >
                    Word Export
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="p-8 bg-[#090d16] border border-slate-800 text-center space-y-4 max-w-3xl mx-auto">
          <h3 className="text-lg font-bold text-white">Need Checklists, Worksheets, or Operations Forms?</h3>
          <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
            Our comprehensive library includes 25 production-grade resources including daily construction reports, prequalification questionnaires, and payment application checklists.
          </p>
          <div className="pt-1">
            <Link
              href="/resources"
              className="inline-block px-6 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-400 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Explore Full 25-Resource Library →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
