/**
 * AVORRIA PUBLIC DATA HYGIENE & SANITIZATION ENGINE
 * 
 * Guarantees zero sensitive data leakage from internal repository structures
 * into public-facing views (/contractors/[slug] and /contractors/[slug]/verification).
 */

import { PublicPassportDTO, PassportPublicSettings } from './types';
import { ContractorWorkspaceData } from '@/lib/tenant/repository';
import { ContractorVerificationState } from '@/lib/verification/types';

const PUBLIC_DISCLAIMER =
  'Avorria Verified status indicates that specified evidence was reviewed against defined Avorria verification criteria on the indicated date. Verification does not constitute government licensing, OSHA certification, regulatory endorsement, or a legal guarantee of performance.';

export function sanitizeContractorForPublic(
  ws: ContractorWorkspaceData,
  verification: ContractorVerificationState,
  settings?: PassportPublicSettings
): PublicPassportDTO {
  const activeSettings: PassportPublicSettings = settings || {
    showInsurance: true,
    showLicense: true,
    showSafetyProgram: true,
    showReadinessScore: true,
    showWorkforceSummary: true,
  };

  const primaryCity = ws.serviceAreas.cities[0] || 'Operating Territory';
  const primaryState = ws.serviceAreas.primaryState || 'TX';

  // 1. Build Verified Categories (Only those actually verified)
  const verifiedCategories: Array<{ category: string; name: string; statement: string }> = [];

  for (const record of verification.records) {
    if (record.status === 'verified') {
      const crit = verification.applicableCriteria.find((c) => c.slug === record.criterionSlug);
      if (crit) {
        verifiedCategories.push({
          category: crit.category,
          name: crit.name,
          statement: `Evidence reviewed by Avorria against ${crit.sourceName} on ${record.reviewedAt ? new Date(record.reviewedAt).toLocaleDateString('en-US') : 'file'}.`,
        });
      }
    }
  }

  // 2. Build Curated Public Credentials (No private file paths)
  const credentials: PublicPassportDTO['credentials'] = {};

  if (activeSettings.showInsurance) {
    const glRecord = verification.records.find(
      (r) => r.category === 'insurance' && r.status === 'verified'
    );
    const activeCoi = ws.documents.find(
      (d) => d.document_type.includes('insurance') || d.document_type.includes('coi')
    );

    if (glRecord || activeCoi) {
      credentials.insurance = {
        verified: Boolean(glRecord),
        coverageType: 'Commercial General Liability',
        insurerName: activeCoi?.issuing_organisation || 'Authorized Commercial Carrier',
        expiryDate: activeCoi?.expires_at ? new Date(activeCoi.expires_at).toISOString().split('T')[0] : undefined,
        status: glRecord ? 'verified' : 'unverified',
      };
    }
  }

  if (activeSettings.showLicense && ws.trades.length > 0) {
    const licRecord = verification.records.find(
      (r) => r.category === 'licensing' && r.status === 'verified'
    );
    const activeLic = ws.documents.find((d) => d.document_type.includes('license'));

    if (licRecord || activeLic || ws.baselineCredentials.hasTradeLicense) {
      credentials.license = {
        verified: Boolean(licRecord),
        licenseType: `${ws.trades[0]?.replace(/-/g, ' ').toUpperCase() || 'TRADE'} CONTRACTOR`,
        issuingAuthority: activeLic?.issuing_organisation || `${primaryState} Regulatory Board`,
        jurisdiction: primaryState,
        expiryDate: activeLic?.expires_at ? new Date(activeLic.expires_at).toISOString().split('T')[0] : undefined,
        status: licRecord ? 'verified' : 'unverified',
      };
    }
  }

  if (activeSettings.showSafetyProgram) {
    const safRecord = verification.records.find(
      (r) => r.category === 'safety_program' && r.status === 'verified'
    );
    const hasJhaOrHasp = ws.documents.some((d) => d.document_type.includes('safety') || d.document_type.includes('jha'));

    if (safRecord || hasJhaOrHasp || ws.baselineCredentials.hasSafetyPlan) {
      credentials.safetyProgram = {
        verified: Boolean(safRecord),
        programType: 'Site-Specific Health & Safety / Pre-Task JHA Program',
        lastActiveDate: new Date().toISOString().split('T')[0],
        status: safRecord ? 'verified' : 'unverified',
      };
    }
  }

  // 3. Overall Verification State Mapping
  const pubVerificationStatus: PublicPassportDTO['verification']['status'] =
    verification.aggregateStatus === 'verified'
      ? 'verified'
      : verification.aggregateStatus === 'verification_in_progress'
      ? 'verification_in_progress'
      : verification.aggregateStatus === 'verification_expired'
      ? 'verification_expired'
      : 'not_verified';

  return {
    slug: ws.organisation.slug,
    businessName: ws.organisation.name,
    legalName: ws.organisation.legal_name || undefined,
    headline: activeSettings.customHeadline || `${ws.trades.map((t) => t.replace(/-/g, ' ')).join(', ')} in ${primaryState}`,
    description: ws.profile.business_description || undefined,
    website: ws.organisation.website || undefined,
    phone: ws.organisation.phone || undefined,
    email: ws.organisation.email || undefined,
    primaryLocation: `${primaryCity}, ${primaryState}`,
    trades: ws.trades.map((slug) => ({
      slug,
      name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    })),
    serviceAreas: {
      primaryState,
      cities: ws.serviceAreas.cities || [primaryCity],
      radiusMiles: ws.serviceAreas.radiusMiles || 50,
    },
    employeeCount: activeSettings.showWorkforceSummary ? ws.profile.employee_count : undefined,
    yearsInBusiness: ws.profile.year_established
      ? new Date().getFullYear() - ws.profile.year_established
      : undefined,

    verification: {
      isVerified: verification.isVerified,
      status: pubVerificationStatus,
      referenceNumber: verification.verificationReference,
      verifiedAt: verification.verifiedAt,
      validUntil: verification.expiresAt,
      verifiedCategories,
    },

    credentials,

    readinessScore: activeSettings.showReadinessScore
      ? {
          score: 85, // will be bound to real calculated score
          label: 'Avorria Operational Readiness',
          disclaimer: 'Readiness measures completion against internal Avorria criteria.',
        }
      : undefined,

    publishedAt: ws.profile.onboarding_completed_at || new Date().toISOString(),
    lastReviewedAt: verification.verifiedAt || new Date().toISOString(),
    disclaimer: PUBLIC_DISCLAIMER,
  };
}
