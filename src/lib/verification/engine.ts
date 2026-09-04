/**
 * AVORRIA VERIFICATION ENGINE
 * 
 * Manages criteria resolution, aggregate status derivation,
 * evidence integrity checking, and verification reference generation.
 */

import crypto from 'crypto';
import {
  VerificationRecord,
  VerificationCriterion,
  ContractorVerificationState,
  AggregateVerificationStatus,
} from './types';
import { getApplicableVerificationCriteria } from './criteria';
import { ContractorWorkspaceData } from '@/lib/tenant/repository';
import { BusinessDocument } from '@/types/database';

/**
 * Computes deterministic evidence hash from document metadata and content
 */
export function computeEvidenceHash(doc: BusinessDocument): string {
  const content = `${doc.id}:${doc.title}:${doc.document_type}:${doc.version_number}:${doc.expires_at || ''}:${doc.file_path}`;
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Generates a public verification reference in format: AV-VER-XXXXXX
 */
export function generateVerificationReference(orgId: string): string {
  const hash = crypto.createHash('sha256').update(orgId).digest('hex').toUpperCase();
  return `AV-VER-${hash.substring(0, 6)}`;
}

/**
 * Evaluates the full verification state for an organisation
 */
export function evaluateContractorVerification(
  ws: ContractorWorkspaceData,
  existingRecords: VerificationRecord[] = []
): ContractorVerificationState {
  const applicableCriteria = getApplicableVerificationCriteria(
    ws.trades,
    ws.serviceAreas.primaryState || 'TX'
  );

  // Map existing records by criterion slug
  const recordsMap = new Map<string, VerificationRecord>();
  for (const r of existingRecords) {
    recordsMap.set(r.criterionSlug, r);
  }

  // Ensure every applicable criterion has a corresponding record representation
  const synchronizedRecords: VerificationRecord[] = applicableCriteria.map((crit) => {
    const existing = recordsMap.get(crit.slug);
    if (existing) {
      // Check evidence integrity: did the underlying document expire?
      if (existing.status === 'verified' && existing.expiresAt) {
        const isExpired = new Date(existing.expiresAt).getTime() < Date.now();
        if (isExpired) {
          return {
            ...existing,
            status: 'expired',
            updatedAt: new Date().toISOString(),
          };
        }
      }

      // Check evidence integrity: did the underlying document change or get replaced?
      if (existing.evidenceDocumentId) {
        const doc = ws.documents.find((d) => d.id === existing.evidenceDocumentId);
        if (!doc || doc.status === 'archived') {
          return {
            ...existing,
            status: 'revoked',
            rejectionReason: 'Underlying evidence document was archived or removed.',
            updatedAt: new Date().toISOString(),
          };
        } else if (existing.evidenceHash && computeEvidenceHash(doc) !== existing.evidenceHash) {
          return {
            ...existing,
            status: 'needs_clarification',
            rejectionReason: 'Evidence document was modified or updated since review. Re-review required.',
            updatedAt: new Date().toISOString(),
          };
        }
      }

      return existing;
    }

    // Default record when not yet submitted
    return {
      id: `ver-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`,
      organisationId: ws.organisation.id,
      criterionSlug: crit.slug,
      category: crit.category,
      status: 'not_submitted',
      verificationMethod: 'document_inspection',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  // Calculate mandatory criteria satisfaction
  const mandatoryCriteria = applicableCriteria.filter((c) => c.mandatory);
  const mandatorySlugs = new Set(mandatoryCriteria.map((c) => c.slug));

  const satisfiedMandatory = synchronizedRecords.filter(
    (r) => mandatorySlugs.has(r.criterionSlug) && r.status === 'verified'
  );

  const anyUnderReview = synchronizedRecords.some(
    (r) => r.status === 'under_review' || r.status === 'submitted'
  );
  const anyExpired = synchronizedRecords.some(
    (r) => mandatorySlugs.has(r.criterionSlug) && r.status === 'expired'
  );
  const isSuspended = ws.profile.visibility === 'suspended';

  // Derive aggregate verification status
  let aggregateStatus: AggregateVerificationStatus = 'not_verified';
  let isVerified = false;

  if (isSuspended) {
    aggregateStatus = 'verification_suspended';
  } else if (mandatoryCriteria.length > 0 && satisfiedMandatory.length === mandatoryCriteria.length) {
    aggregateStatus = 'verified';
    isVerified = true;
  } else if (anyExpired) {
    aggregateStatus = 'verification_expired';
  } else if (anyUnderReview) {
    aggregateStatus = 'verification_in_progress';
  }

  // Determine timestamps
  const verifiedRecords = synchronizedRecords.filter((r) => r.status === 'verified');
  const latestVerifiedAt = verifiedRecords.length > 0
    ? verifiedRecords.map((r) => r.reviewedAt || r.updatedAt).sort().reverse()[0]
    : undefined;

  // Next upcoming expiration
  const expirableRecords = verifiedRecords.filter((r) => r.expiresAt);
  const earliestExpiry = expirableRecords.length > 0
    ? expirableRecords.map((r) => r.expiresAt!).sort()[0]
    : undefined;

  const verificationReference = isVerified
    ? generateVerificationReference(ws.organisation.id)
    : undefined;

  return {
    aggregateStatus,
    isVerified,
    verificationReference,
    verifiedAt: latestVerifiedAt,
    expiresAt: earliestExpiry,
    totalCriteriaCount: applicableCriteria.length,
    satisfiedCriteriaCount: verifiedRecords.length,
    records: synchronizedRecords,
    applicableCriteria,
    recentEvents: [],
  };
}
