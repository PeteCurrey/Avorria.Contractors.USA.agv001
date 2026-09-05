import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { CONTRACTOR_RESOURCES, getResourcesByType } from '@/lib/resources/catalogue';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { CinematicPageHero } from '@/components/hero/CinematicPageHero';

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
    <div className="min-h-screen bg-surface-page text-navy-800">
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: `${siteConfig.url}/` },
        { name: 'Contractor Templates', url: `${siteConfig.url}/templates` },
      ]} />
      <CinematicPageHero
        eyebrow="DOCUMENT TEMPLATE LIBRARY · COMMERCIAL STANDARDS"
        title={<>Professional Contractor<br />Document Templates.</>}
        subtitle="Legally vetted and OSHA-aligned document templates designed for commercial general contractors and specialty trade contractors in the United States."
        primaryCta={{ label: 'Explore Templates Below', href: '#templates-grid' }}
        secondaryCta={{ label: 'Document Engine', href: '/create' }}
        backgroundImage="/images/hero-templates.jpg"
        backgroundAlt="Architectural prints and commercial contract specifications on drafting table on construction site"
        pillars={[
          { title: 'AIA & ConsensusDocs Aligned', description: 'Industry-standard formats for change orders, scope exhibits, and subcontracts.' },
          { title: 'OSHA 1926 Aligned', description: 'Site-specific HASPs, Job Hazard Analyses, and toolbox talks compliant with federal standards.' },
          { title: 'Ready to Deploy', description: 'Instant downloads in PDF and DOCX formats customized with your company branding.' },
        ]}
      />
      <div id="templates-grid" className="max-w-7xl mx-auto space-y-12 py-16 px-4 sm:px-6 lg:px-8">

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tmpl) => (
            <div
              key={tmpl.slug}
              className="bg-white border border-slate-200 hover:border-slate-300 shadow-sm rounded-lg p-6 flex flex-col justify-between transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-brand-700 font-mono font-medium uppercase text-[11px] tracking-wider">
                    {tmpl.categoryName}
                  </span>
                  <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-mono font-medium uppercase rounded-[4px]">
                    {tmpl.code}
                  </span>
                </div>

                <h2 className="text-base font-light text-navy-900 group-hover:text-brand-700 transition-colors leading-snug">
                  <Link href={`/resources/${tmpl.slug}`}>{tmpl.title}</Link>
                </h2>

                <p className="text-xs text-slate-600 leading-relaxed font-extralight line-clamp-3">
                  {tmpl.shortDescription}
                </p>

                <div className="pt-2 text-[11px] font-mono text-slate-500 border-t border-slate-100 flex items-center justify-between">
                  <span>STANDARD:</span>
                  <span className="text-slate-800 font-medium">{tmpl.standard}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6 space-y-2">
                <Link
                  href={`/resources/${tmpl.slug}`}
                  className="w-full block py-2.5 px-3 text-center bg-brand-600 hover:bg-brand-700 text-white font-normal text-xs uppercase tracking-wider rounded-[6px] transition-colors"
                >
                  Open Template Workspace →
                </Link>
                <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-mono">
                  <a
                    href={`/api/resources/${tmpl.slug}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium rounded-[4px] transition-colors"
                  >
                    PDF Export
                  </a>
                  <a
                    href={`/api/resources/${tmpl.slug}/docx`}
                    className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium rounded-[4px] transition-colors"
                  >
                    Word Export
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="p-8 bg-white border border-slate-200 shadow-sm rounded-lg text-center space-y-4 max-w-3xl mx-auto">
          <h3 className="text-lg font-light text-navy-900">Need Checklists, Worksheets, or Operations Forms?</h3>
          <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed font-extralight">
            Our comprehensive library includes 25 production-grade resources including daily construction reports, prequalification questionnaires, and payment application checklists.
          </p>
          <div className="pt-1">
            <Link
              href="/resources"
              className="inline-block px-6 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-brand-700 text-xs font-mono font-medium uppercase tracking-wider rounded-[6px] transition-colors"
            >
              Explore Full 25-Resource Library →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
