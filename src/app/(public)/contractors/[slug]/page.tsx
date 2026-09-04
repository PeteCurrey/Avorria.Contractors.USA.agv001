import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { getPassportDetails, loadTenantsStore } from '@/lib/tenant/repository';
import { sanitizeContractorForPublic } from '@/lib/passport/sanitizer';
import { PublicPassportDTO } from '@/lib/passport/types';
import { VerifiedByAvorriaBadge } from '@/components/passport/VerifiedByAvorriaBadge';
import { ReadinessGauge } from '@/components/ui/ReadinessGauge';
import { Button } from '@/components/ui/Button';
import { PassportQRCode } from '@/components/passport/PassportQRCode';

interface Props {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    mode?: string;
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

  const title = `${contractor.businessName} | Contractor Passport | Avorria`;
  const description =
    contractor.description ||
    `Verified contractor credentials and operational readiness for ${contractor.businessName}.`;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `${siteConfig.url}/contractors/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/contractors/${slug}`,
      siteName: 'Avorria Contractor Passport',
      type: 'profile',
    },
  };
}

export default async function ContractorProfilePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sParams = searchParams ? await searchParams : {};
  const contractor = await resolvePublicContractor(slug);

  if (!contractor) {
    notFound();
  }

  const canonicalUrl = `${siteConfig.url}/contractors/${slug}`;
  const isPrintMode = sParams.mode === 'print';
  const settings = contractor.publicSettings;

  // Conservative Schema.org JSON-LD (Strictly factual business data only, zero fabricated ratings or reviews)
  const schemaOrgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: contractor.businessName,
    legalName: contractor.legalName,
    url: canonicalUrl,
    description: contractor.description,
    address: {
      '@type': 'PostalAddress',
      addressRegion: contractor.serviceAreas.primaryState,
      addressLocality: contractor.serviceAreas.cities[0],
      addressCountry: 'US',
    },
    areaServed: contractor.serviceAreas.cities.map((c) => ({
      '@type': 'City',
      name: `${c}, ${contractor.serviceAreas.primaryState}`,
    })),
  };

  return (
    <div className="min-h-screen bg-surface-page py-10 px-4 sm:px-6 lg:px-8 text-slate-800 print:bg-white print:p-0 print:m-0">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgJsonLd) }}
      />

      <div className="max-w-4xl mx-auto space-y-8 text-left print:max-w-none print:space-y-4">
        {/* Top Print/Action Bar (hidden in print) */}
        <div className="flex items-center justify-between no-print">
          <Link
            href="/contractor-verification"
            className="text-xs font-mono text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1.5"
          >
            ← How Avorria Verification Works
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') window.print();
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>🖨️</span>
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Main Executive Credential Document */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8 print:border-none print:shadow-none print:p-0">
          {/* Header Block */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-slate-200 pb-8 print:pb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs font-semibold uppercase tracking-wider">
                  Contractor Passport
                </span>
                <VerifiedByAvorriaBadge
                  status={contractor.verification.status}
                  referenceNumber={contractor.verification.referenceNumber}
                  contractorSlug={contractor.slug}
                  size="sm"
                />
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-navy-900 tracking-tight">
                {contractor.businessName}
              </h1>

              {contractor.legalName && contractor.legalName !== contractor.businessName && (
                <div className="text-xs text-slate-500 font-mono">
                  Legal Entity: {contractor.legalName}
                </div>
              )}

              <p className="text-sm text-slate-600 pt-1 font-medium">
                {contractor.trades.map((t) => t.name).join(', ')} • {contractor.primaryLocation}
                {contractor.yearsInBusiness ? ` • ${contractor.yearsInBusiness} Years Established` : ''}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-4">
              {contractor.readinessScore && settings?.showReadinessScore !== false && (
                <div className="flex flex-col items-center bg-slate-50 border border-slate-200 p-4 rounded-xl print:p-2">
                  <ReadinessGauge score={contractor.readinessScore.score} size="md" showLabel />
                  <span className="text-[10px] font-mono text-slate-400 mt-1 uppercase">Readiness Index</span>
                </div>
              )}

              {/* QR Code in Document */}
              <div className="hidden sm:block print:block">
                <PassportQRCode url={canonicalUrl} size={88} className="p-2 border-slate-200" />
              </div>
            </div>
          </div>

          {/* Company Bio */}
          {contractor.description && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                Company Profile
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {contractor.description}
              </p>
            </div>
          )}

          {/* Verification Record Callout */}
          {contractor.verification.isVerified && settings?.showVerification !== false && (
            <div className="p-5 rounded-xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-bold text-navy-900 text-sm flex items-center gap-2">
                  <span>Verified by Avorria</span>
                  <span className="text-blue-700 font-mono text-xs font-bold">
                    [{contractor.verification.referenceNumber}]
                  </span>
                </div>
                <p className="text-slate-600 text-xs">
                  Official evidence reviewed against Avorria published verification criteria (Version {contractor.verification.criteriaVersion || '2026.1'}).
                </p>
                {contractor.verification.validUntil && (
                  <div className="text-[11px] font-mono text-slate-500">
                    Next Review Cycle: {new Date(contractor.verification.validUntil).toLocaleDateString('en-US')}
                  </div>
                )}
              </div>
              <Button href={`/contractors/${contractor.slug}/verification`} size="sm" variant="primary" className="no-print">
                View Verification Certificate →
              </Button>
            </div>
          )}

          {/* Curated Public Credentials */}
          {settings?.showCredentials !== false && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                Commercial Standing & Evidence Records
              </div>

              <div className="space-y-3">
                {/* General Liability Insurance */}
                {contractor.credentials.insurance && settings?.showInsurance !== false && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-bold text-navy-900 text-sm">
                        Commercial General Liability Insurance
                      </div>
                      <div className="text-slate-500 text-xs font-mono">
                        Carrier: {contractor.credentials.insurance.insurerName}
                        {contractor.credentials.insurance.expiryDate && (
                          <span> · Term to {contractor.credentials.insurance.expiryDate}</span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold shrink-0 ${
                        contractor.credentials.insurance.verified
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {contractor.credentials.insurance.verified ? '✓ Evidence Reviewed' : 'Declared'}
                    </span>
                  </div>
                )}

                {/* Trade License */}
                {contractor.credentials.license && settings?.showLicense !== false && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-bold text-navy-900 text-sm">
                        {contractor.credentials.license.licenseType}
                      </div>
                      <div className="text-slate-500 text-xs font-mono">
                        Jurisdiction: {contractor.credentials.license.jurisdiction} · Authority: {contractor.credentials.license.issuingAuthority}
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold shrink-0 ${
                        contractor.credentials.license.verified
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {contractor.credentials.license.verified ? '✓ Evidence Reviewed' : 'Declared'}
                    </span>
                  </div>
                )}

                {/* Safety Program */}
                {contractor.credentials.safetyProgram && settings?.showSafetyProgram !== false && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-bold text-navy-900 text-sm">
                        Site Safety Program & Pre-Task Planning
                      </div>
                      <div className="text-slate-500 text-xs font-mono">
                        OSHA 1926 Aligned Written Program & JHA Procedures
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold shrink-0 ${
                        contractor.credentials.safetyProgram.verified
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {contractor.credentials.safetyProgram.verified ? '✓ Evidence Reviewed' : 'Active Process'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Operating Territory & Trades */}
          {settings?.showServiceAreas !== false && (
            <div className="space-y-2 pt-4 border-t border-slate-200 text-xs">
              <div className="text-slate-400 font-bold uppercase tracking-wider font-mono">
                Operating Territory & Service Coverage
              </div>
              <div className="text-slate-700 text-sm">
                Primary State: <strong>{contractor.serviceAreas.primaryState}</strong> · Service Cities: {contractor.serviceAreas.cities.join(', ')} · Radius: {contractor.serviceAreas.radiusMiles} Miles
              </div>
            </div>
          )}

          {/* Mandatory Public Verification Disclaimer */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 space-y-1 text-center leading-relaxed">
            <p className="font-semibold text-slate-600">Avorria Verification Disclaimer</p>
            <p>{contractor.disclaimer}</p>
          </div>
        </div>

        {/* Print Footer */}
        <div className="hidden print:block text-center text-[10px] text-slate-500 font-mono pt-4 border-t border-slate-200">
          Official Avorria Contractor Passport Summary • Verified at: {canonicalUrl} • Criteria Version {contractor.verification.criteriaVersion || '2026.1'}
        </div>
      </div>
    </div>
  );
}
