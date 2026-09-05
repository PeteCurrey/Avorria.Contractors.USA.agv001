import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Compliance & Legal Disclaimer | Avorria',
  description: 'Regulatory status notice and compliance disclaimer for the Avorria contractor operating platform.',
  alternates: {
    canonical: `${siteConfig.url}/disclaimer`,
  },
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-surface-page py-16 px-4 sm:px-6 lg:px-8 text-navy-800">
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: `${siteConfig.url}/` },
        { name: 'Legal Disclaimer', url: `${siteConfig.url}/disclaimer` },
      ]} />
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-lg p-8 sm:p-12 shadow-sm space-y-8 text-left">
        <div className="border-b border-slate-200 pb-6">
          <div className="text-[11px] font-mono uppercase tracking-widest text-brand-700 font-medium mb-1.5">
            Essential Regulatory Disclosure
          </div>
          <h1 className="text-3xl sm:text-4xl font-extralight text-navy-900 tracking-tight">
            Compliance & Regulatory Disclaimer
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-2">
            Platform Notice & Statutory Limits • Published by Avorria Compliance
          </p>
        </div>

        <section className="p-6 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
          <h2 className="text-sm font-medium uppercase tracking-wider text-brand-800">
            Independent Operational Technology Platform
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed font-extralight">
            {siteConfig.name} is an independent operational software technology platform. {siteConfig.name} is <strong>not</strong> an official certification division or enforcement branch of the Occupational Safety and Health Administration (OSHA), a state contractor licensing agency (such as CSLB, TDLR, or DBPR), or an insurance underwriting carrier.
          </p>
        </section>

        <section className="space-y-3 text-sm text-slate-700 leading-relaxed font-extralight">
          <h2 className="text-base font-normal text-navy-900 tracking-tight">
            Contractor Readiness Score Notice
          </h2>
          <p>
            The Contractor Readiness Score calculated by Avorria represents internal checklist completion against structured platform criteria (entity documentation, active COIs, valid trade licenses, written safety programs, and supervisory training). It does not guarantee regulatory immunity, statutory compliance, or flawless job site safety.
          </p>
        </section>

        <section className="space-y-3 text-sm text-slate-700 leading-relaxed font-extralight">
          <h2 className="text-base font-normal text-navy-900 tracking-tight">
            No Legal or Underwriting Advice
          </h2>
          <p>
            Information provided on the Avorria platform, including compliance checklists, template agreements, and proposal terms, is for operational assistance only and does not constitute formal legal, accounting, or insurance underwriting counsel. Contractors must consult licensed legal or insurance professionals for contract execution and statutory filings.
          </p>
        </section>

        <section className="space-y-3 text-sm text-slate-700 leading-relaxed font-extralight border-t border-slate-200 pt-6">
          <h2 className="text-base font-normal text-navy-900 tracking-tight">
            Questions Concerning Regulatory Position
          </h2>
          <p>
            For inquiries regarding Avorria&apos;s compliance criteria or verification methodology, contact{' '}
            <a href={`mailto:${siteConfig.contactEmail}`} className="text-brand-600 underline font-normal">
              {siteConfig.contactEmail}
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
