import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Privacy Policy | Avorria',
  description: 'How Avorria protects and handles contractor business data, insurance documents, and account privacy.',
};

export default function PrivacyPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 text-slate-300 text-xs sm:text-sm leading-relaxed text-left">
      <div className="border-b border-surface-border pb-4">
        <h1 className="text-3xl font-black text-white">Privacy Policy</h1>
        <p className="text-slate-400 mt-1 font-mono text-xs">Last Updated: September 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
        <p>
          Avorria collects business entity details, contact information, employee training logs, Certificates of Insurance, state trade licenses, and contractor documentation uploaded voluntarily to your tenant workspace.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">2. Confidentiality & Tenant Data Security</h2>
        <p>
          Your documents are private by default. All data is isolated by multi-tenant database row-level security. We never sell contractor lists, bidding data, or customer pricing details to third-party data brokers.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">3. Public Profiles & Contractor Passport</h2>
        <p>
          Contractor Passports are only shared or published when you explicitly generate a public link or publish your profile. You may revoke access or delete your records at any time from your account settings.
        </p>
      </section>
    </div>
  );
}
