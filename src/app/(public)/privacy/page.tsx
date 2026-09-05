import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Privacy Policy | Avorria',
  description: 'How Avorria protects and handles contractor business data, insurance documents, and account privacy.',
  alternates: {
    canonical: `${siteConfig.url}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface-page py-16 px-4 sm:px-6 lg:px-8 text-navy-800">
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: `${siteConfig.url}/` },
        { name: 'Privacy Policy', url: `${siteConfig.url}/privacy` },
      ]} />
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-lg p-8 sm:p-12 shadow-sm space-y-8 text-left">
        <div className="border-b border-slate-200 pb-6">
          <div className="text-[11px] font-mono uppercase tracking-widest text-brand-700 font-medium mb-1.5">
            Data Privacy & Tenant Protection
          </div>
          <h1 className="text-3xl sm:text-4xl font-extralight text-navy-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-2">
            Last Updated: September 2026 • Published by Avorria Compliance
          </p>
        </div>

        <section className="space-y-3 text-sm text-slate-700 leading-relaxed font-extralight">
          <h2 className="text-base font-normal text-navy-900 tracking-tight">
            1. Information We Collect
          </h2>
          <p>
            Avorria collects business entity details, contact information, employee training logs, Certificates of Insurance, state trade licenses, and contractor documentation uploaded voluntarily to your organizational tenant workspace.
          </p>
        </section>

        <section className="space-y-3 text-sm text-slate-700 leading-relaxed font-extralight">
          <h2 className="text-base font-normal text-navy-900 tracking-tight">
            2. Confidentiality & Tenant Data Security
          </h2>
          <p>
            Your documents are private by default. All data is isolated by multi-tenant database row-level security. We never sell contractor lists, bidding data, client rosters, or customer pricing details to third-party data brokers or lead-generation aggregators.
          </p>
        </section>

        <section className="space-y-3 text-sm text-slate-700 leading-relaxed font-extralight">
          <h2 className="text-base font-normal text-navy-900 tracking-tight">
            3. Public Profiles & Contractor Passport
          </h2>
          <p>
            Contractor Passports and verified credentials are only shared or published when you explicitly generate a public link or publish your profile to the verified directory. You may revoke public access, change password protection, or archive records at any time from your account settings.
          </p>
        </section>

        <section className="space-y-3 text-sm text-slate-700 leading-relaxed font-extralight border-t border-slate-200 pt-6">
          <h2 className="text-base font-normal text-navy-900 tracking-tight">
            4. Privacy Inquiries
          </h2>
          <p>
            For questions concerning your organizational data rights or to request a permanent data purge, email our data protection officer at{' '}
            <a href={`mailto:${siteConfig.supportEmail}`} className="text-brand-600 underline font-normal">
              {siteConfig.supportEmail}
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
