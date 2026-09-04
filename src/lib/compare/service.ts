/**
 * AVORRIA COMPARE SERVICE LAYER
 * Phase 12: Business orchestration for comparison creation, evaluation, refresh, and clarification.
 */

import {
  CompareSet,
  CompareContractor,
  CompareContractorRequirementItem,
  CreateCompareSetInput,
  EvaluatedComparisonMatrix,
  COMPARE_ENGINE_VERSION,
} from './types';
import {
  saveCompareSet,
  saveCompareContractors,
  getCompareSetById,
  getCompareSetsByRequest,
  logCompareEvent,
  updateCompareClarification,
} from './repository';
import { runCompareEngineV1 } from './engine';
import { getRequirementPackById } from '@/lib/request/repository';
import { listPackInvitations, getInvitationWithResponse } from '@/lib/respond/service';
import { getContractorWorkspace } from '@/lib/tenant/repository';

export async function createCompareSet(
  tenantId: string,
  userId: string,
  input: CreateCompareSetInput
): Promise<{ compareSet: CompareSet; matrix: EvaluatedComparisonMatrix }> {
  // 1. Validation: 2 to 6 contractors required for side-by-side comparison
  if (!input.contractor_ids || input.contractor_ids.length < 2) {
    throw new Error('Comparison requires at least 2 contractor responses to compare.');
  }
  if (input.contractor_ids.length > 6) {
    throw new Error('Comparison is limited to a maximum of 6 contractors at a time.');
  }

  // 2. Load requirement pack & verify tenant ownership
  const pack = await getRequirementPackById(input.request_id, tenantId);
  if (!pack) {
    throw new Error(`Requirement pack "${input.request_id}" not found or unauthorized.`);
  }

  // 3. Load invitations & submitted responses for this pack
  const allInvitations = await listPackInvitations(input.request_id, tenantId);
  const compareContractors: CompareContractor[] = [];
  const compareSetId = `cmp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  for (const contractorId of input.contractor_ids) {
    const inv = allInvitations.find((i) => i.contractor_id === contractorId);
    if (!inv) {
      throw new Error(`Contractor "${contractorId}" was not invited to this requirement pack.`);
    }

    const detailed = getInvitationWithResponse(inv.id, tenantId);
    if (!detailed.response || detailed.response.status !== 'submitted') {
      throw new Error(
        `Contractor "${inv.contractor_name || contractorId}" has not submitted a structured response.`
      );
    }

    const response = detailed.response;
    const acks = response.requirement_acknowledgements || [];

    // Map snapshot evidence state + contractor acknowledgements together
    const snapshotMap = new Map((inv.evidence_snapshot || []).map((s) => [s.requirementId, s]));
    const ackMap = new Map(acks.map((a) => [a.requirement_id, a]));

    const requirementDeclarations: CompareContractorRequirementItem[] = (pack.requirements || []).map(
      (req) => {
        const snap = snapshotMap.get(req.id);
        const ack = ackMap.get(req.id);

        return {
          requirement_id: req.id,
          response_status: ack ? ack.response_status : 'unanswered',
          evidence_state: snap ? snap.evidenceStateAtInvitation : 'MISSING',
          verification_reference: snap?.verificationReference,
          contractor_comment: ack?.contractor_comment,
          evidence_reference: ack?.evidence_reference,
          clarification_status: 'not_requested',
        };
      }
    );

    // Resolve contractor verification status
    let verificationStatus: 'verified' | 'published_unverified' = 'published_unverified';
    let verificationReference: string | undefined;

    try {
      const ws = await getContractorWorkspace(contractorId);
      const activeVerified = (ws.verificationRecords || []).find((v) => v.status === 'verified');
      if (activeVerified) {
        verificationStatus = 'verified';
        verificationReference = activeVerified.verificationReference;
      }
    } catch {
      // Keep unverified fallback
    }

    const compareContractor: CompareContractor = {
      id: `cc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      compare_set_id: compareSetId,
      tenant_id: tenantId,
      contractor_id: contractorId,
      invitation_id: inv.id,
      response_id: response.id,
      contractor_name: inv.contractor_name || contractorId,
      contractor_slug: inv.contractor_slug,
      verification_status: verificationStatus,
      verification_reference: verificationReference,
      availability_status: response.availability_status,
      proposed_start_date: response.proposed_start_date,
      proposed_completion_date: response.proposed_completion_date,
      availability_notes: response.availability_notes,
      response_notes: response.response_notes,
      requirement_declarations: requirementDeclarations,
      created_at: new Date().toISOString(),
    };

    compareContractors.push(compareContractor);
  }

  // 4. Save CompareSet and CompareContractors
  const compareSet: CompareSet = {
    id: compareSetId,
    tenant_id: tenantId,
    request_id: input.request_id,
    created_by: userId,
    comparison_version: COMPARE_ENGINE_VERSION,
    is_stale: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const savedSet = await saveCompareSet(compareSet);
  await saveCompareContractors(compareSetId, compareContractors);

  // 5. Log audit event
  await logCompareEvent(compareSetId, tenantId, userId, 'compare_set_created', {
    contractorCount: compareContractors.length,
    contractorIds: input.contractor_ids,
  });

  // 6. Run Compare Engine V1
  const matrix = runCompareEngineV1(savedSet, pack, compareContractors);

  return { compareSet: savedSet, matrix };
}

export async function getCompareSetMatrix(
  compareSetId: string,
  tenantId: string
): Promise<EvaluatedComparisonMatrix> {
  const set = await getCompareSetById(compareSetId, tenantId);
  if (!set) {
    throw new Error(`Comparison workspace "${compareSetId}" not found or unauthorized.`);
  }

  const pack = await getRequirementPackById(set.request_id, tenantId);
  if (!pack) {
    throw new Error(`Requirement pack for comparison "${compareSetId}" not found.`);
  }

  const contractors = set.contractors || [];

  // Evaluate stale checks: if contractor responses were withdrawn or pack updated
  let isStale = set.is_stale;
  let staleReason = set.stale_reason;

  for (const c of contractors) {
    const inv = getInvitationWithResponse(c.invitation_id, tenantId);
    if (!inv.response || inv.response.status !== 'submitted') {
      isStale = true;
      staleReason = `Contractor "${c.contractor_name}" response was withdrawn after comparison was generated.`;
      break;
    }
  }

  set.is_stale = isStale;
  set.stale_reason = staleReason;

  return runCompareEngineV1(set, pack, contractors);
}

export async function refreshCompareSet(
  compareSetId: string,
  tenantId: string,
  userId: string
): Promise<EvaluatedComparisonMatrix> {
  const set = await getCompareSetById(compareSetId, tenantId);
  if (!set) {
    throw new Error(`Comparison workspace "${compareSetId}" not found.`);
  }

  const pack = await getRequirementPackById(set.request_id, tenantId);
  if (!pack) {
    throw new Error(`Requirement pack not found.`);
  }

  const existingContractors = set.contractors || [];
  const contractorIds = existingContractors.map((c) => c.contractor_id);

  // Rebuild contractor snapshots with current submitted responses
  const updatedContractors: CompareContractor[] = [];

  for (const c of existingContractors) {
    const detailed = getInvitationWithResponse(c.invitation_id, tenantId);
    if (!detailed.response || detailed.response.status !== 'submitted') {
      continue; // Exclude withdrawn responses from fresh comparison
    }

    const response = detailed.response;
    const inv = detailed.invitation;
    const acks = response.requirement_acknowledgements || [];

    const snapshotMap = new Map((inv.evidence_snapshot || []).map((s) => [s.requirementId, s]));
    const ackMap = new Map(acks.map((a) => [a.requirement_id, a]));

    const requirementDeclarations: CompareContractorRequirementItem[] = (pack.requirements || []).map(
      (req) => {
        const snap = snapshotMap.get(req.id);
        const ack = ackMap.get(req.id);

        return {
          requirement_id: req.id,
          response_status: ack ? ack.response_status : 'unanswered',
          evidence_state: snap ? snap.evidenceStateAtInvitation : 'MISSING',
          verification_reference: snap?.verificationReference,
          contractor_comment: ack?.contractor_comment,
          evidence_reference: ack?.evidence_reference,
          clarification_status: 'not_requested',
        };
      }
    );

    updatedContractors.push({
      ...c,
      response_id: response.id,
      availability_status: response.availability_status,
      proposed_start_date: response.proposed_start_date,
      proposed_completion_date: response.proposed_completion_date,
      availability_notes: response.availability_notes,
      response_notes: response.response_notes,
      requirement_declarations: requirementDeclarations,
    });
  }

  if (updatedContractors.length < 2) {
    throw new Error('Cannot refresh comparison: fewer than 2 active contractor responses remain.');
  }

  set.is_stale = false;
  set.stale_reason = undefined;
  set.updated_at = new Date().toISOString();

  await saveCompareSet(set);
  await saveCompareContractors(compareSetId, updatedContractors);

  await logCompareEvent(compareSetId, tenantId, userId, 'compare_refreshed', {
    activeContractorsCount: updatedContractors.length,
  });

  return runCompareEngineV1(set, pack, updatedContractors);
}

export async function requestClarification(
  compareSetId: string,
  tenantId: string,
  userId: string,
  contractorId: string,
  requirementId: string,
  questionNote?: string
): Promise<{ success: boolean; message: string }> {
  const set = await getCompareSetById(compareSetId, tenantId);
  if (!set) {
    throw new Error('Comparison workspace not found.');
  }

  await updateCompareClarification(compareSetId, contractorId, requirementId, 'requested');

  await logCompareEvent(compareSetId, tenantId, userId, 'clarification_requested_from_compare', {
    contractorId,
    requirementId,
    questionNote: questionNote || 'Clarification requested by client from Compare workspace',
  });

  return {
    success: true,
    message: 'Clarification request logged and flagged in comparison.',
  };
}
