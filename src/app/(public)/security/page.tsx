import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Security Architecture & Data Protection | Avorria',
  description: 'Learn how Avorria protects contractor business records, Certificates of Insurance, and multi-tenant data.',
};

export default function SecurityPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 text-slate-300 text-xs sm:text-sm leading-relaxed text-left">
      <div className="border-b border-surface-border pb-4">
        <h1 className="text-3xl font-black text-white">Security & Data Protection</h1>
        <p className="text-slate-400 mt-1 font-mono text-xs">Enterprise-Grade Contractor Infrastructure</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-surface-card border border-surface-border space-y-2">
          <h2 className="text-base font-bold text-white">Multi-Tenant Isolation</h2>
          <p className="text-xs text-slate-400">
            Every database table enforces strict PostgreSQL Row Level Security (RLS) scoped by tenant organization_id. Organization A can never read or query records belonging to Organization B.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-surface-card border border-surface-border space-y-2">
          <h2 className="text-base font-bold text-white">Private Document Storage</h2>
          <p className="text-xs text-slate-400">
            Uploaded Certificates of Insurance, trade licenses, and employee records are stored in secure, access-controlled cloud storage buckets. Files are retrievable only by authenticated users within the same tenant account.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-surface-card border border-surface-border space-y-2">
          <h2 className="text-base font-bold text-white">Encryption at Rest &amp; in Transit</h2>
          <p className="text-xs text-slate-400">
            All network communication is encrypted via TLS. Database storage and cloud file assets are encrypted at rest via AES-256, as provided by our hosting infrastructure (Supabase and Google Cloud).
          </p>
        </div>

        <div className="p-6 rounded-xl bg-surface-card border border-surface-border space-y-2">
          <h2 className="text-base font-bold text-white">Search Engine Guardrails</h2>
          <p className="text-xs text-slate-400">
            Authenticated application routes (<code className="text-slate-300">/app/*</code>) and internal API endpoints (<code className="text-slate-300">/api/*</code>) enforce <code className="text-slate-300">X-Robots-Tag: noindex</code> to prevent search engine indexing of private contractor data.
          </p>
        </div>
      </div>
    </div>
  );
}
