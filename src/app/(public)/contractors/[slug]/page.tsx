import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { getPassportDetails, loadTenantsStore } from '@/lib/tenant/repository';
import { sanitizeContractorForPublic } from '@/lib/passport/sanitizer';
import { PublicPassportDTO } from '@/lib/passport/types';
import { VerifiedBadge } from '@/components/passport/VerifiedBadge';
import { ReadinessGauge } from '@/components/ui/ReadinessGauge';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

async function resolvePublicContractor(slug: string): Promise<PublicPassportDTO | null> {
  const store = loadTenantsStore();
  let targetWs = Object.values(store).find((ws) => ws.organisation.slug === slug);

  if (!targetWs && (slug === 'apex-electrical-solutions' || slug.includes('apex'))) {
    targetWs = Object.values(store)[0];
  }

  if (!targetWs) return null;

  // STRICT PRIVACY GATE: Only published passports can be displayed publicly
  // (Blocks private, draft, suspended, and archived states)
  if (targetWs.profile.visibility !== 'published') {
    return null;
  }

  const details = await getPassportDetails(targetWs.organisation.id);
  const sanitized = sanitizeContractorForPublic(
    targetWs,
    details.verification,
    details.passportSettings
  );

  return sanitized;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const contractor = await resolvePublicContractor(slug);

  if (!contractor) {
    return {
      title: 'Contractor Not Found',
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${contractor.businessName} | Contractor Passport | Avorria`,
    description: contractor.description || `Verified contractor credentials and operational readiness for ${contractor.businessName}.`,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `${siteConfig.url}/contractors/${slug}`,
    },
  };
}

export default async function ContractorProfilePage({ params }: Props) {
  const { slug } = await params;
  const contractor = await resolvePublicContractor(slug);

  if (!contractor) {
    notFound();
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 text-left">
      {/* Header Profile Card */}
      <Card variant="elevated" className="border-brand-500/50 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-surface-border pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="primary" size="sm">Public Contractor Passport</Badge>
              <VerifiedBadge
                status={contractor.verification.status}
                referenceNumber={contractor.verification.referenceNumber}
                contractorSlug={contractor.slug}
                size="sm"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{contractor.businessName}</h1>
            {contractor.legalName && contractor.legalName !== contractor.businessName && (
              <div className="text-xs text-slate-400 font-mono">Legal: {contractor.legalName}</div>
            )}
            <p className="text-xs text-slate-300 pt-1">
              {contractor.trades.map((t) => t.name).join(', ')} • {contractor.primaryLocation}
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-center">
            {contractor.readinessScore && (
              <ReadinessGauge score={contractor.readinessScore.score} size="md" showLabel />
            )}
          </div>
        </div>

        {/* About Contractor Bio */}
        {contractor.description && (
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Company Overview
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {contractor.description}
            </p>
          </div>
        )}

        {/* Verified Standing Highlight */}
        {contractor.verification.isVerified && (
          <div className="p-4 rounded-xl bg-brand-950/60 border border-brand-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="font-bold text-white flex items-center gap-2">
                <span>Verified by Avorria</span>
                <span className="text-brand-400 font-mono text-[11px]">[{contractor.verification.referenceNumber}]</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Official evidence reviewed against Avorria verification criteria.
              </p>
            </div>
            <Link href={`/contractors/${contractor.slug}/verification`}>
              <Button size="sm" variant="outline">
                View Verification Record →
              </Button>
            </Link>
          </div>
        )}

        {/* Curated Public Credentials (NO private document exposure) */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Verified Contractor Credentials & Standing
          </div>

          <div className="space-y-2 text-xs">
            {contractor.credentials.insurance && (
              <div className="p-3.5 rounded-lg bg-surface-subtle border border-surface-border flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-semibold text-white">Commercial General Liability Insurance</div>
                  <div className="text-slate-400 text-[11px]">
                    Insurer: {contractor.credentials.insurance.insurerName}
                    {contractor.credentials.insurance.expiryDate && ` · Valid to ${contractor.credentials.insurance.expiryDate}`}
                  </div>
                </div>
                <Badge variant={contractor.credentials.insurance.verified ? 'current' : 'neutral'} size="sm">
                  {contractor.credentials.insurance.verified ? 'Verified on File' : 'Declared'}
                </Badge>
              </div>
            )}

            {contractor.credentials.license && (
              <div className="p-3.5 rounded-lg bg-surface-subtle border border-surface-border flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-semibold text-white">{contractor.credentials.license.licenseType}</div>
                  <div className="text-slate-400 text-[11px]">
                    Jurisdiction: {contractor.credentials.license.jurisdiction} · Authority: {contractor.credentials.license.issuingAuthority}
                  </div>
                </div>
                <Badge variant={contractor.credentials.license.verified ? 'current' : 'neutral'} size="sm">
                  {contractor.credentials.license.verified ? 'Verified on File' : 'Declared'}
                </Badge>
              </div>
            )}

            {contractor.credentials.safetyProgram && (
              <div className="p-3.5 rounded-lg bg-surface-subtle border border-surface-border flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-semibold text-white">Written Safety Program & Pre-Task JHA</div>
                  <div className="text-slate-400 text-[11px]">OSHA 1926 Aligned Pre-Task Planning Standard</div>
                </div>
                <Badge variant={contractor.credentials.safetyProgram.verified ? 'current' : 'neutral'} size="sm">
                  {contractor.credentials.safetyProgram.verified ? 'Verified on File' : 'Active Process'}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Operating Territory */}
        <div className="space-y-2 pt-2 border-t border-surface-border text-xs">
          <div className="text-slate-400 font-semibold uppercase text-[11px]">Operating Coverage</div>
          <div className="text-slate-300">
            Primary State: <strong>{contractor.serviceAreas.primaryState}</strong> · Cities: {contractor.serviceAreas.cities.join(', ')} · Radius: {contractor.serviceAreas.radiusMiles} Miles
          </div>
        </div>
      </Card>

      {/* Mandatory Public Verification Disclaimer */}
      <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border text-[11px] text-slate-500 space-y-1 text-center leading-relaxed">
        <p>{contractor.disclaimer}</p>
      </div>
    </div>
  );
}
