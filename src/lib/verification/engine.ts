/**
 * AVORRIA VERIFICATION ENGINE
 * 
 * Manages criteria resolution, aggregate status derivation,
 * evidence integrity checking, verification reference generation,
 * and expiration/attention detection.
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

  let requiresAttention = false;
  let attentionReason: string | undefined;

  // Ensure every applicable criterion has a corresponding record representation
  const synchronizedRecords: VerificationRecord[] = applicableCriteria.map((crit) => {
    const existing = recordsMap.get(crit.slug);
    if (existing) {
      // Check evidence integrity: did the underlying document expire?
      if (existing.status === 'verified' && existing.expiresAt) {
        const isExpired = new Date(existing.expiresAt).getTime() < Date.now();
        if (isExpired) {
          requiresAttention = true;
          attentionReason = `Criterion "${crit.name}" expired on ${new Date(existing.expiresAt).toLocaleDateString()}. Re-review required.`;
          return {
            ...existing,
            status: 'expired',
            evidenceStatus: 'expired',
            updatedAt: new Date().toISOString(),
          };
        }
      }

      // Check evidence integrity: did the underlying document change or get replaced?
      if (existing.evidenceDocumentId) {
        const doc = ws.documents.find((d) => d.id === existing.evidenceDocumentId);
        if (!doc || doc.status === 'archived') {
          requiresAttention = true;
          attentionReason = `Underlying evidence for "${crit.name}" was archived or removed.`;
          return {
            ...existing,
            status: 'revoked',
            evidenceStatus: 'superseded',
            rejectionReason: 'Underlying evidence document was archived or removed.',
            updatedAt: new Date().toISOString(),
          };
        } else if (existing.evidenceHash && computeEvidenceHash(doc) !== existing.evidenceHash) {
          requiresAttention = true;
          attentionReason = `Evidence for "${crit.name}" was modified since review. Re-review required.`;
          return {
            ...existing,
            status: 'needs_clarification',
            evidenceStatus: 'needs_review',
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
      evidenceStatus: 'not_applicable',
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
  const anyNeedsClarification = synchronizedRecords.some(
    (r) => r.status === 'needs_clarification'
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
  } else if (requiresAttention || anyNeedsClarification) {
    aggregateStatus = 'attention_required';
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

  const nextReviewDate = earliestExpiry || (latestVerifiedAt ? new Date(new Date(latestVerifiedAt).getTime() + 365 * 86400000).toISOString() : undefined);

  return {
    aggregateStatus,
    isVerified,
    verificationReference,
    verifiedAt: latestVerifiedAt,
    expiresAt: earliestExpiry,
    nextReviewDate,
    criteriaVersion: '2026.1',
    totalCriteriaCount: applicableCriteria.length,
    satisfiedCriteriaCount: verifiedRecords.length,
    records: synchronizedRecords,
    applicableCriteria,
    recentEvents: [],
    requiresAttention,
    attentionReason,
  };
}
