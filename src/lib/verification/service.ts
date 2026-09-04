/**
 * AVORRIA VERIFICATION SERVICE
 * 
 * Enforces server-side authorization boundaries, records immutable verification events,
 * and coordinates contractor and reviewer workflows.
 * Phase 6: Full submission rounds, evidence review actions, and overall decisions.
 */

import {
  VerificationRecord,
  VerificationEvent,
  VerificationSubmission,
  ReviewDecisionInput,
  OverallReviewDecisionInput,
  ReviewerContext,
  ContractorVerificationState,
} from './types';
import {
  evaluateContractorVerification,
  computeEvidenceHash,
  generateVerificationReference,
} from './engine';
import {
  getContractorWorkspace,
  loadTenantsStore,
  saveTenantsStore,
  ContractorWorkspaceData,
} from '@/lib/tenant/repository';
import { BusinessDocument } from '@/types/database';

/**
 * Ensures the actor has legitimate Avorria reviewer permissions.
 * Throws 403 Forbidden error if called by a standard contractor account.
 */
export function assertReviewerAuthorized(auth: ReviewerContext): void {
  if (!auth.authorized || !['avorria_reviewer', 'avorria_compliance_officer', 'system_admin'].includes(auth.reviewerRole)) {
    throw new Error('403 Forbidden: Only authorized Avorria compliance reviewers can perform this action.');
  }
}

/**
 * Retrieves the verification state for an organization
 */
export async function getVerificationState(orgId: string): Promise<ContractorVerificationState> {
  const ws = await getContractorWorkspace(orgId);
  const records = ws.verificationRecords || [];
  const state = evaluateContractorVerification(ws, records);
  state.recentEvents = ws.verificationEvents || [];
  state.submissions = ws.verificationSubmissions || [];
  return state;
}

/**
 * Contractor requests full verification review
 */
export async function requestVerification(
  orgId: string,
  contractorUserId: string
): Promise<{ success: boolean; message: string; state: ContractorVerificationState; submissionId: string }> {
  const store = loadTenantsStore();
  const ws = store[orgId] || (await getContractorWorkspace(orgId));

  if (!ws.verificationRecords) ws.verificationRecords = [];
  if (!ws.verificationEvents) ws.verificationEvents = [];
  if (!ws.verificationSubmissions) ws.verificationSubmissions = [];

  const submissionId = `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const submission: VerificationSubmission = {
    id: submissionId,
    organisationId: orgId,
    status: 'submitted',
    submittedAt: new Date().toISOString(),
    verificationType: 'contractor_operational_verification',
    criteriaVersion: '2026.1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  ws.verificationSubmissions.unshift(submission);

  const state = evaluateContractorVerification(ws, ws.verificationRecords);

  // Automatically attach best available evidence for any unsubmitted criteria
  for (const crit of state.applicableCriteria) {
    let rec = (ws.verificationRecords as VerificationRecord[]).find((r: VerificationRecord) => r.criterionSlug === crit.slug);
    if (!rec) {
      rec = {
        id: `ver-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        organisationId: orgId,
        criterionSlug: crit.slug,
        category: crit.category,
        status: 'not_submitted',
        evidenceStatus: 'not_applicable',
        verificationMethod: 'document_inspection',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (ws.verificationRecords as VerificationRecord[]).push(rec);
    }

    if (rec.status === 'not_submitted' || rec.status === 'rejected') {
      // 1. Business Profile criterion
      if (crit.category === 'business_profile') {
        rec.status = 'submitted';
        rec.evidenceStatus = 'submitted';
        rec.evidenceReference = 'Contractor Business Profile & Attestation';
        rec.updatedAt = new Date().toISOString();

        ws.verificationEvents.unshift({
          id: `ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          verificationRecordId: rec.id,
          organisationId: orgId,
          eventType: 'submitted',
          newStatus: 'submitted',
          actorId: contractorUserId,
          actorType: 'contractor',
          notes: 'Contractor profile information submitted for verification review.',
          evidenceReference: 'Business Profile Attestation',
          createdAt: new Date().toISOString(),
        });
        continue;
      }

      // 2. Business Identity criterion
      if (crit.category === 'business_identity') {
        const idDoc = ws.documents.find((d: BusinessDocument) => 
          d.document_type.includes('formation') || d.document_type.includes('business') || d.title.toLowerCase().includes('formation') || d.title.toLowerCase().includes('entity')
        );
        rec.status = 'submitted';
        rec.evidenceStatus = 'submitted';
        rec.evidenceReference = idDoc ? idDoc.title : `${ws.organisation.name} Commercial Registration Filing`;
        if (idDoc) {
          rec.evidenceDocumentId = idDoc.id;
          rec.evidenceHash = computeEvidenceHash(idDoc);
        }
        rec.updatedAt = new Date().toISOString();

        ws.verificationEvents.unshift({
          id: `ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          verificationRecordId: rec.id,
          organisationId: orgId,
          eventType: 'submitted',
          newStatus: 'submitted',
          actorId: contractorUserId,
          actorType: 'contractor',
          notes: `Commercial business registration evidence submitted for review.`,
          evidenceReference: rec.evidenceReference,
          createdAt: new Date().toISOString(),
        });
        continue;
      }

      // 3. Document Vault matching for other types
      const matchingDoc = ws.documents.find((d: BusinessDocument) => {
        if (crit.evidenceType === 'insurance_coi') return d.document_type.includes('insurance') || d.document_type.includes('coi');
        if (crit.evidenceType === 'trade_license') return d.document_type.includes('license');
        if (crit.evidenceType === 'safety_plan') return d.document_type.includes('safety') || d.document_type.includes('hasp') || d.document_type.includes('jha');
        if (crit.evidenceType === 'osha_card') return d.document_type.includes('osha') || d.document_type.includes('training');
        return false;
      });

      if (matchingDoc) {
        rec.evidenceDocumentId = matchingDoc.id;
        rec.evidenceReference = matchingDoc.title;
        rec.evidenceHash = computeEvidenceHash(matchingDoc);
        rec.status = 'submitted';
        rec.evidenceStatus = 'submitted';
        rec.updatedAt = new Date().toISOString();

        ws.verificationEvents.unshift({
          id: `ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          verificationRecordId: rec.id,
          organisationId: orgId,
          eventType: 'submitted',
          newStatus: 'submitted',
          actorId: contractorUserId,
          actorType: 'contractor',
          notes: `Contractor submitted evidence "${matchingDoc.title}" for ${crit.name}.`,
          evidenceReference: matchingDoc.title,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  store[orgId] = ws;
  saveTenantsStore(store);

  const updatedState = await getVerificationState(orgId);
  return {
    success: true,
    message: 'Verification request submitted. An Avorria compliance reviewer will inspect your evidence.',
    state: updatedState,
    submissionId,
  };
}

/**
 * Contractor submits or updates evidence for a specific criterion
 */
export async function submitEvidenceForCriterion(
  orgId: string,
  contractorUserId: string,
  criterionSlug: string,
  evidenceDocId: string,
  notes?: string
): Promise<{ success: boolean; record: VerificationRecord }> {
  const store = loadTenantsStore();
  const ws = store[orgId] || (await getContractorWorkspace(orgId));

  if (!ws.verificationRecords) ws.verificationRecords = [];
  if (!ws.verificationEvents) ws.verificationEvents = [];

  const doc = ws.documents.find((d) => d.id === evidenceDocId);
  if (!doc) throw new Error('Evidence document not found in vault.');

  let rec = ws.verificationRecords.find((r) => r.criterionSlug === criterionSlug);

  if (!rec) {
    rec = {
      id: `ver-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      organisationId: orgId,
      criterionSlug,
      category: 'insurance',
      status: 'submitted',
      evidenceStatus: 'submitted',
      verificationMethod: 'document_inspection',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    ws.verificationRecords.push(rec);
  }

  const prevStatus = rec.status;
  rec.evidenceDocumentId = doc.id;
  rec.evidenceReference = doc.title;
  rec.evidenceHash = computeEvidenceHash(doc);
  rec.status = 'submitted';
  rec.evidenceStatus = 'submitted';
  rec.notes = notes || rec.notes;
  rec.updatedAt = new Date().toISOString();

  ws.verificationEvents.unshift({
    id: `ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    verificationRecordId: rec.id,
    organisationId: orgId,
    eventType: 'submitted',
    previousStatus: prevStatus,
    newStatus: 'submitted',
    actorId: contractorUserId,
    actorType: 'contractor',
    notes: notes || `Submitted document "${doc.title}".`,
    evidenceReference: doc.title,
    createdAt: new Date().toISOString(),
  });

  store[orgId] = ws;
  saveTenantsStore(store);

  return { success: true, record: rec };
}

/**
 * Contractor responds to a clarification request
 */
export async function respondToClarification(
  orgId: string,
  contractorUserId: string,
  verificationRecordId: string,
  responseMessage: string,
  replacementDocId?: string
): Promise<{ success: boolean; record: VerificationRecord }> {
  const store = loadTenantsStore();
  const ws = store[orgId] || (await getContractorWorkspace(orgId));

  if (!ws.verificationRecords) ws.verificationRecords = [];
  if (!ws.verificationEvents) ws.verificationEvents = [];

  const rec = ws.verificationRecords.find((r) => r.id === verificationRecordId);
  if (!rec) throw new Error('Verification record not found.');

  rec.clarificationResponse = responseMessage;
  rec.status = 'under_review'; // Re-enters review queue
  rec.evidenceStatus = 'needs_review';
  rec.updatedAt = new Date().toISOString();

  if (replacementDocId) {
    const doc = ws.documents.find((d) => d.id === replacementDocId);
    if (doc) {
      rec.evidenceDocumentId = doc.id;
      rec.evidenceReference = doc.title;
      rec.evidenceHash = computeEvidenceHash(doc);
    }
  }

  ws.verificationEvents.unshift({
    id: `ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    verificationRecordId: rec.id,
    organisationId: orgId,
    eventType: 'clarification_provided',
    previousStatus: 'needs_clarification',
    newStatus: 'under_review',
    actorId: contractorUserId,
    actorType: 'contractor',
    notes: `Contractor clarification: ${responseMessage}`,
    createdAt: new Date().toISOString(),
  });

  store[orgId] = ws;
  saveTenantsStore(store);

  return { success: true, record: rec };
}

/**
 * SERVER-AUTHORIZED REVIEWER ACTION
 * Must be executed with legitimate ReviewerContext. Contractors cannot call this.
 */
export async function executeReviewDecision(
  reviewer: ReviewerContext,
  orgId: string,
  input: ReviewDecisionInput
): Promise<{ success: boolean; record: VerificationRecord; event: VerificationEvent }> {
  // CRITICAL AUTHORIZATION GATE
  assertReviewerAuthorized(reviewer);

  const store = loadTenantsStore();
  const ws = store[orgId] || (await getContractorWorkspace(orgId));

  if (!ws.verificationRecords) ws.verificationRecords = [];
  if (!ws.verificationEvents) ws.verificationEvents = [];

  const rec = ws.verificationRecords.find((r) => r.id === input.verificationRecordId);
  if (!rec) throw new Error('Verification record not found.');

  const prevStatus = rec.status;
  rec.reviewer = reviewer.reviewerName;
  rec.reviewedAt = new Date().toISOString();
  rec.notes = input.notes || rec.notes;
  rec.updatedAt = new Date().toISOString();

  let eventType: VerificationEvent['eventType'] = 'verified';

  if (input.decision === 'verify') {
    rec.status = 'verified';
    rec.evidenceStatus = 'accepted';
    rec.expiresAt = input.expiresAt || new Date(Date.now() + 365 * 86400000).toISOString();
    rec.verificationReference = generateVerificationReference(orgId);
    rec.rejectionReason = undefined;
    eventType = 'verified';
  } else if (input.decision === 'reject') {
    rec.status = 'rejected';
    rec.evidenceStatus = 'rejected';
    rec.rejectionReason = input.rejectionReason || 'Evidence did not satisfy criterion standards.';
    eventType = 'rejected';
  } else if (input.decision === 'needs_clarification') {
    rec.status = 'needs_clarification';
    rec.evidenceStatus = 'needs_review';
    rec.clarificationRequestedAt = new Date().toISOString();
    rec.rejectionReason = input.rejectionReason || 'Additional policy endorsements or clearer documentation requested.';
    eventType = 'clarification_requested';
  } else if (input.decision === 'suspend') {
    rec.status = 'revoked';
    rec.evidenceStatus = 'rejected';
    rec.rejectionReason = input.rejectionReason || 'Verification suspended by Avorria Compliance.';
    eventType = 'suspended';
  }

  const event: VerificationEvent = {
    id: `ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    verificationRecordId: rec.id,
    organisationId: orgId,
    eventType,
    previousStatus: prevStatus,
    newStatus: rec.status,
    actorId: reviewer.reviewerId,
    actorType: 'reviewer',
    notes: input.notes || `Decision: ${input.decision}. ${input.rejectionReason || ''}`,
    createdAt: new Date().toISOString(),
  };

  ws.verificationEvents.unshift(event);
  store[orgId] = ws;
  saveTenantsStore(store);

  return { success: true, record: rec, event };
}

/**
 * SERVER-AUTHORIZED OVERALL SUBMISSION REVIEW DECISION
 * Controls overall submission state (approve, reject, suspend)
 */
export async function executeOverallSubmissionDecision(
  reviewer: ReviewerContext,
  orgId: string,
  input: OverallReviewDecisionInput
): Promise<{ success: boolean; submission?: VerificationSubmission; state: ContractorVerificationState }> {
  assertReviewerAuthorized(reviewer);

  const store = loadTenantsStore();
  const ws = store[orgId] || (await getContractorWorkspace(orgId));

  if (!ws.verificationSubmissions) ws.verificationSubmissions = [];
  if (!ws.verificationEvents) ws.verificationEvents = [];

  const sub = ws.verificationSubmissions[0];
  if (sub) {
    sub.reviewedAt = new Date().toISOString();
    sub.reviewerId = reviewer.reviewerId;
    sub.reviewerName = reviewer.reviewerName;
    sub.decision = input.decision;
    sub.decisionReason = input.reason || input.notes;
    sub.updatedAt = new Date().toISOString();

    if (input.decision === 'approve') {
      sub.status = 'verified';
      sub.nextReviewAt = input.expiresAt || new Date(Date.now() + 365 * 86400000).toISOString();
    } else if (input.decision === 'reject') {
      sub.status = 'rejected';
    } else if (input.decision === 'request_evidence') {
      sub.status = 'additional_evidence_required';
    } else if (input.decision === 'suspend') {
      sub.status = 'suspended';
    }
  }

  store[orgId] = ws;
  saveTenantsStore(store);

  const updatedState = await getVerificationState(orgId);
  return { success: true, submission: sub, state: updatedState };
}

/**
 * Returns all active submissions across organizations for the internal reviewer dashboard
 */
export async function getAllSubmissionsForReview(
  reviewer: ReviewerContext
): Promise<Array<{
  organisationId: string;
  organisationName: string;
  slug: string;
  trades: string[];
  primaryLocation: string;
  readinessScore: number;
  passportVisibility: string;
  verificationStatus: string;
  submittedAt?: string;
  recordsCount: number;
  satisfiedCount: number;
}>> {
  assertReviewerAuthorized(reviewer);

  const store = loadTenantsStore();
  const list: Array<{
    organisationId: string;
    organisationName: string;
    slug: string;
    trades: string[];
    primaryLocation: string;
    readinessScore: number;
    passportVisibility: string;
    verificationStatus: string;
    submittedAt?: string;
    recordsCount: number;
    satisfiedCount: number;
  }> = [];

  for (const [orgId, ws] of Object.entries(store)) {
    const vState = evaluateContractorVerification(ws, ws.verificationRecords || []);
    const sub = ws.verificationSubmissions?.[0];
    
    list.push({
      organisationId: orgId,
      organisationName: ws.organisation.name,
      slug: ws.organisation.slug,
      trades: ws.trades,
      primaryLocation: `${ws.serviceAreas.cities[0] || 'Austin'}, ${ws.serviceAreas.primaryState || 'TX'}`,
      readinessScore: ws.profile.readiness_score || 85,
      passportVisibility: ws.profile.visibility || 'private',
      verificationStatus: vState.aggregateStatus,
      submittedAt: sub?.submittedAt,
      recordsCount: vState.totalCriteriaCount,
      satisfiedCount: vState.satisfiedCriteriaCount,
    });
  }

  return list;
}
