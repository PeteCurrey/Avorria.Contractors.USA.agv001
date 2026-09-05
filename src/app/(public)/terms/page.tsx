import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Terms of Service | Avorria',
  description: 'Terms and conditions governing the use of the Avorria contractor operating and documentation platform.',
  alternates: {
    canonical: `${siteConfig.url}/terms`,
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface-page py-16 px-4 sm:px-6 lg:px-8 text-navy-800">
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: `${siteConfig.url}/` },
        { name: 'Terms of Service', url: `${siteConfig.url}/terms` },
      ]} />
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-lg p-8 sm:p-12 shadow-sm space-y-8 text-left">
        <div className="border-b border-slate-200 pb-6">
          <div className="text-[11px] font-mono uppercase tracking-widest text-brand-700 font-medium mb-1.5">
            Legal Terms & Regulatory Agreements
          </div>
          <h1 className="text-3xl sm:text-4xl font-extralight text-navy-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-2">
            Last Updated: September 2026 • Published by Avorria Legal
          </p>
        </div>

        <section className="space-y-3 text-sm text-slate-700 leading-relaxed font-extralight">
          <h2 className="text-base font-normal text-navy-900 tracking-tight">
            1. Agreement to Terms
          </h2>
          <p>
            By accessing or using {siteConfig.name}, you agree to be bound by these Terms of Service. If you are registering an account on behalf of a contractor business, you represent and warrant that you have legal authority to bind that entity to these terms.
          </p>
        </section>

        <section className="space-y-3 text-sm text-slate-700 leading-relaxed font-extralight">
          <h2 className="text-base font-normal text-navy-900 tracking-tight">
            2. Operational Tool & Document Responsibility
          </h2>
          <p>
            Avorria provides document generation templates, compliance tracking software, and contractor credibility tools. Contractors are solely responsible for reviewing and verifying the accuracy, safety standards, and commercial suitability of any Job Hazard Analysis, proposal, quote, or safety manual prior to execution on an active job site.
          </p>
        </section>

        <section className="space-y-3 text-sm text-slate-700 leading-relaxed font-extralight">
          <h2 className="text-base font-normal text-navy-900 tracking-tight">
            3. Subscription & Billing
          </h2>
          <p>
            Paid subscriptions (Professional, Verified, Business) are billed in advance on a recurring monthly or annual basis. You may cancel your subscription at any time; operational access continues through the conclusion of the active paid billing cycle.
          </p>
        </section>

        <section className="space-y-3 text-sm text-slate-700 leading-relaxed font-extralight border-t border-slate-200 pt-6">
          <h2 className="text-base font-normal text-navy-900 tracking-tight">
            4. Inquiries & Legal Notices
          </h2>
          <p>
            For questions concerning these Terms of Service or formal legal notices, contact our compliance counsel at{' '}
            <a href={`mailto:${siteConfig.contactEmail}`} className="text-brand-600 underline font-normal">
              {siteConfig.contactEmail}
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
