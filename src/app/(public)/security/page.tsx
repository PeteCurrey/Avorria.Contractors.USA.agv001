import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Security Architecture & Data Protection | Avorria',
  description: 'Learn how Avorria protects contractor business records, Certificates of Insurance, and multi-tenant data.',
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-surface-page py-16 px-4 sm:px-6 lg:px-8 text-navy-800">
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-lg p-8 sm:p-12 shadow-sm space-y-8 text-left">
        <div className="border-b border-slate-200 pb-6">
          <div className="text-[11px] font-mono uppercase tracking-widest text-brand-700 font-medium mb-1.5">
            Infrastructure & Data Protection
          </div>
          <h1 className="text-3xl sm:text-4xl font-extralight text-navy-900 tracking-tight">
            Security Architecture & Data Protection
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-2">
            Enterprise-Grade Contractor Infrastructure • Published by Avorria Security
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <h2 className="text-base font-normal text-navy-900 tracking-tight">Multi-Tenant Isolation</h2>
            <p className="text-xs text-slate-600 leading-relaxed font-extralight">
              Every database table enforces strict PostgreSQL Row Level Security (RLS) scoped by tenant organization ID. One contractor organization can never read, query, or mutate records belonging to another tenant.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <h2 className="text-base font-normal text-navy-900 tracking-tight">Private Document Storage</h2>
            <p className="text-xs text-slate-600 leading-relaxed font-extralight">
              Uploaded Certificates of Insurance, state trade licenses, and employee records are stored in secure, access-controlled cloud storage buckets. Files are retrievable only by authenticated users within the verified tenant account.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <h2 className="text-base font-normal text-navy-900 tracking-tight">Encryption at Rest &amp; in Transit</h2>
            <p className="text-xs text-slate-600 leading-relaxed font-extralight">
              All network communication is encrypted via TLS 1.3. Database storage and cloud file assets are encrypted at rest via AES-256 across enterprise-grade tier-1 cloud infrastructure.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <h2 className="text-base font-normal text-navy-900 tracking-tight">Search Engine Guardrails</h2>
            <p className="text-xs text-slate-600 leading-relaxed font-extralight">
              Authenticated application routes (<code className="text-slate-800 font-mono text-[11px]">/app/*</code> and <code className="text-slate-800 font-mono text-[11px]">/workspace/*</code>) and internal API endpoints enforce <code className="text-slate-800 font-mono text-[11px]">X-Robots-Tag: noindex</code> to prevent search engine indexing of private contractor records.
            </p>
          </div>
        </div>

        <section className="space-y-3 text-sm text-slate-700 leading-relaxed font-extralight border-t border-slate-200 pt-6">
          <h2 className="text-base font-normal text-navy-900 tracking-tight">
            Responsible Disclosure
          </h2>
          <p>
            Security researchers and contractor compliance officers with questions regarding our vulnerability disclosure program or SOC2 alignment can contact our engineering team at{' '}
            <a href={`mailto:${siteConfig.supportEmail}`} className="text-brand-600 underline font-normal">
              {siteConfig.supportEmail}
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
