/**
 * AVORRIA VERIFICATION SERVICE
 * 
 * Enforces server-side authorization boundaries, records immutable verification events,
 * and coordinates contractor and reviewer workflows.
 */

import {
  VerificationRecord,
  VerificationEvent,
  ReviewDecisionInput,
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
  return state;
}

/**
 * Contractor requests full verification review
 */
export async function requestVerification(
  orgId: string,
  contractorUserId: string
): Promise<{ success: boolean; message: string; state: ContractorVerificationState }> {
  const store = loadTenantsStore();
  const ws = store[orgId] || (await getContractorWorkspace(orgId));

  if (!ws.verificationRecords) ws.verificationRecords = [];
  if (!ws.verificationEvents) ws.verificationEvents = [];

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
        verificationMethod: 'document_inspection',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (ws.verificationRecords as VerificationRecord[]).push(rec);
    }

    if (rec.status === 'not_submitted' || rec.status === 'rejected') {
      // Find matching document in vault
      const matchingDoc = ws.documents.find((d: BusinessDocument) => {
        if (crit.evidenceType === 'insurance_coi') return d.document_type.includes('insurance') || d.document_type.includes('coi');
        if (crit.evidenceType === 'trade_license') return d.document_type.includes('license');
        if (crit.evidenceType === 'safety_plan') return d.document_type.includes('safety') || d.document_type.includes('jha');
        if (crit.evidenceType === 'osha_card') return d.document_type.includes('osha') || d.document_type.includes('training');
        return false;
      });

      if (matchingDoc) {
        rec.evidenceDocumentId = matchingDoc.id;
        rec.evidenceReference = matchingDoc.title;
        rec.evidenceHash = computeEvidenceHash(matchingDoc);
        rec.status = 'submitted';
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
  const isNew = !rec;

  if (!rec) {
    rec = {
      id: `ver-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      organisationId: orgId,
      criterionSlug,
      category: 'insurance',
      status: 'submitted',
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

  if (input.decision === 'verify') {
    rec.status = 'verified';
    rec.expiresAt = input.expiresAt || new Date(Date.now() + 365 * 86400000).toISOString();
    rec.verificationReference = generateVerificationReference(orgId);
    rec.rejectionReason = undefined;
  } else if (input.decision === 'reject') {
    rec.status = 'rejected';
    rec.rejectionReason = input.rejectionReason || 'Evidence did not satisfy criterion standards.';
  } else if (input.decision === 'needs_clarification') {
    rec.status = 'needs_clarification';
    rec.clarificationRequestedAt = new Date().toISOString();
    rec.rejectionReason = input.rejectionReason || 'Additional policy endorsements or clearer documentation requested.';
  }

  const event: VerificationEvent = {
    id: `ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    verificationRecordId: rec.id,
    organisationId: orgId,
    eventType: input.decision === 'verify' ? 'verified' : input.decision === 'reject' ? 'rejected' : 'clarification_requested',
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
