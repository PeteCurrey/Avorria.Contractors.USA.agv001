import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

// Sample verified contractor for demonstration and testing of public profile criteria
const DEMO_PUBLIC_PROFILES: Record<string, {
  slug: string;
  companyName: string;
  trade: string;
  location: string;
  visibility: 'published' | 'private' | 'draft' | 'suspended';
  isIndexable: boolean;
  readinessScore: number;
  verifiedBadges: string[];
  coiStatus: string;
  licenseStatus: string;
  safetyPlanStatus: string;
  overview: string;
}> = {
  'apex-electrical-solutions': {
    slug: 'apex-electrical-solutions',
    companyName: 'Apex Electrical Solutions LLC',
    trade: 'Commercial Electrical Contractor',
    location: 'Austin, TX',
    visibility: 'published',
    isIndexable: true,
    readinessScore: 95,
    verifiedBadges: ['Verified Contractor', 'Active General Liability COI', 'Master Electrician TDLR', 'OSHA 30 Supervisors'],
    coiStatus: 'Active ($2,000,000 Aggregate)',
    licenseStatus: 'Texas TDLR #34891 (Active)',
    safetyPlanStatus: 'Site Safety Plan Current (NFPA 70E Aligned)',
    overview: 'Specializing in commercial tenant improvement, switchgear installation, industrial automation, and medium-voltage distribution across Central Texas.',
  },
  'unverified-draft-contractor': {
    slug: 'unverified-draft-contractor',
    companyName: 'Unpublished Demo Contractor',
    trade: 'General Contracting',
    location: 'Dallas, TX',
    visibility: 'draft', // Draft / Private -> should trigger notFound()
    isIndexable: false,
    readinessScore: 35,
    verifiedBadges: [],
    coiStatus: 'Pending',
    licenseStatus: 'Unverified',
    safetyPlanStatus: 'Missing',
    overview: 'Internal draft record.',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = DEMO_PUBLIC_PROFILES[slug];

  if (!profile || profile.visibility !== 'published') {
    return {
      title: 'Profile Not Found',
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${profile.companyName} | Verified Contractor Passport`,
    description: `Verified contractor credentials for ${profile.companyName} (${profile.trade}) in ${profile.location}. Contractor Readiness Score: ${profile.readinessScore}%.`,
    robots: {
      index: profile.isIndexable,
      follow: profile.isIndexable,
    },
    alternates: {
      canonical: `${siteConfig.url}/contractors/${profile.slug}`,
    },
  };
}

export default async function ContractorProfilePage({ params }: Props) {
  const { slug } = await params;
  const profile = DEMO_PUBLIC_PROFILES[slug];

  // STRICT ACCESS CONTROL: Only published profiles are visible to the public.
  if (!profile || profile.visibility !== 'published') {
    notFound();
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header Profile Banner */}
      <header className="p-8 rounded-xl bg-surface-card border border-surface-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Verified Contractor Passport
            </div>
            <h1 className="text-3xl font-black text-white">{profile.companyName}</h1>
            <p className="text-sm text-slate-300 mt-1">{profile.trade} • {profile.location}</p>
          </div>

          <div className="p-4 rounded-lg bg-surface-subtle border border-surface-border text-center sm:text-right">
            <span className="text-xs text-slate-400 font-mono uppercase">Readiness Score</span>
            <div className="text-3xl font-black text-white">{profile.readinessScore}%</div>
            <span className="text-xs text-emerald-400 font-medium">Verified Criteria</span>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          {profile.overview}
        </p>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-surface-border">
          {profile.verifiedBadges.map((badge, idx) => (
            <span
              key={idx}
              className="text-xs font-medium px-3 py-1 rounded-full bg-brand-950 text-brand-300 border border-brand-800"
            >
              ✓ {badge}
            </span>
          ))}
        </div>
      </header>

      {/* Verified Credentials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-lg bg-surface-card border border-surface-border space-y-2">
          <div className="text-xs font-semibold text-brand-400 uppercase tracking-wider">Insurance Status</div>
          <h2 className="text-base font-bold text-white">General Liability COI</h2>
          <p className="text-xs text-emerald-400 font-semibold">{profile.coiStatus}</p>
          <p className="text-xs text-slate-400">Verified through Certificate of Insurance document inspection.</p>
        </div>

        <div className="p-6 rounded-lg bg-surface-card border border-surface-border space-y-2">
          <div className="text-xs font-semibold text-brand-400 uppercase tracking-wider">State Licensing</div>
          <h2 className="text-base font-bold text-white">Trade License</h2>
          <p className="text-xs text-emerald-400 font-semibold">{profile.licenseStatus}</p>
          <p className="text-xs text-slate-400">Validated against state regulatory licensing registry.</p>
        </div>

        <div className="p-6 rounded-lg bg-surface-card border border-surface-border space-y-2">
          <div className="text-xs font-semibold text-brand-400 uppercase tracking-wider">Safety Program</div>
          <h2 className="text-base font-bold text-white">Written Safety Plan</h2>
          <p className="text-xs text-emerald-400 font-semibold">{profile.safetyPlanStatus}</p>
          <p className="text-xs text-slate-400">OSHA 1926 compliant written program documentation on file.</p>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-surface-subtle border border-surface-border text-xs text-slate-400 text-center">
        This public Contractor Passport has been published with explicit consent from {profile.companyName}. Verification indicates validated platform documentation and does not constitute a state or governmental certification.
      </div>
    </div>
  );
}
