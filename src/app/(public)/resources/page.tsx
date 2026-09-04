import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { CONTRACTOR_RESOURCES } from '@/lib/resources/catalogue';
import { ResourcesDirectoryClient } from './ResourcesDirectoryClient';

export const metadata: Metadata = {
  title: 'Contractor Operating Resources, Templates & Field Utilities | Avorria',
  description:
    'Production-grade contractor documents, checklists, generators, and templates for US commercial and trade contractors. Bid proposals, daily reports, change orders, and OSHA safety manuals.',
  alternates: {
    canonical: `${siteConfig.url}/resources`,
  },
};

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 text-sky-400 text-xs font-bold uppercase tracking-wider">
            CONTRACTOR OPERATING LIBRARY · 25 PRODUCTION RESOURCES
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Professional Contractor Resources &amp; Commercial Instruments
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Standardized, field-tested documents, checklists, and generators engineered for American commercial builders and specialty trades. Ready for real-world jobsite and commercial deployment.
          </p>
        </div>

        {/* Client Directory with Filtering and Search */}
        <ResourcesDirectoryClient initialResources={CONTRACTOR_RESOURCES} />
      </div>
    </div>
  );
}
