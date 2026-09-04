/**
 * AVORRIA COMPLY — STATE ENGINE
 *
 * Computes runtime expiry state, attention priority, and category mapping
 * from raw workspace credential records. All date comparisons are runtime-only.
 *
 * Thresholds (Phase 6A):
 *   EXPIRED:           expiry_date < today
 *   EXPIRING_CRITICAL: 0–14 days
 *   EXPIRING_HIGH:     15–30 days
 *   EXPIRING_UPCOMING: 31–90 days
 *   CURRENT:           90+ days remaining
 *   NO_EXPIRY:         no expiration date on record
 */

import {
  ComplyRecord,
  ComplyOverview,
  AttentionItem,
  ExpiryState,
  AttentionPriority,
  ComplyCategory,
  COMPLY_CATEGORIES,
  CREDENTIAL_TYPE_LABELS,
} from './types';
import { Credential } from '@/lib/workspace/types';
import { listCredentials } from '@/lib/workspace/credentials';

// ─── Expiry Computation ───────────────────────────────────────────────────────

/**
 * Computes days remaining until expiry from today.
 * Returns null if no expiration date is present.
 * Returns negative values for already-expired records.
 */
export function computeDaysRemaining(expirationDate: string | undefined | null): number | null {
  if (!expirationDate) return null;

  const exp = new Date(expirationDate);
  if (isNaN(exp.getTime())) return null;

  const now = new Date();
  // Normalize to UTC midnight for date-level comparison
  const todayMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const expMs = Date.UTC(exp.getUTCFullYear(), exp.getUTCMonth(), exp.getUTCDate());

  return Math.ceil((expMs - todayMs) / (1000 * 60 * 60 * 24));
}

/**
 * Derives ExpiryState from days remaining.
 */
export function computeExpiryState(daysRemaining: number | null): ExpiryState {
  if (daysRemaining === null) return 'NO_EXPIRY';
  if (daysRemaining < 0) return 'EXPIRED';
  if (daysRemaining <= 14) return 'EXPIRING_CRITICAL';
  if (daysRemaining <= 30) return 'EXPIRING_HIGH';
  if (daysRemaining <= 90) return 'EXPIRING_UPCOMING';
  return 'CURRENT';
}

/**
 * Derives AttentionPriority from ExpiryState.
 */
export function computeAttentionPriority(expiryState: ExpiryState): AttentionPriority {
  switch (expiryState) {
    case 'EXPIRED':           return 'CRITICAL';
    case 'EXPIRING_CRITICAL': return 'HIGH';
    case 'EXPIRING_HIGH':     return 'MEDIUM';
    case 'EXPIRING_UPCOMING': return 'LOW';
    default:                  return 'NONE';
  }
}

// ─── Category Resolution ──────────────────────────────────────────────────────

export function resolveCategory(credentialType: string): ComplyCategory {
  for (const cat of COMPLY_CATEGORIES) {
    if (cat.credential_types.includes(credentialType)) {
      return cat.id;
    }
  }
  // Default fallback
  if (credentialType === 'trade_license') return 'licence';
  if (['general_liability_coi', 'workers_comp', 'umbrella', 'auto'].includes(credentialType)) {
    return 'insurance';
  }
  return 'credential';
}

// ─── Attention Reason ─────────────────────────────────────────────────────────

export function buildAttentionReason(
  expiryState: ExpiryState,
  daysRemaining: number | null,
  displayLabel: string
): string {
  if (expiryState === 'EXPIRED') {
    return `${displayLabel} has expired and requires immediate renewal.`;
  }
  if (expiryState === 'EXPIRING_CRITICAL' && daysRemaining !== null) {
    return `${displayLabel} expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}. Immediate action required.`;
  }
  if (expiryState === 'EXPIRING_HIGH' && daysRemaining !== null) {
    return `${displayLabel} expires in ${daysRemaining} days. Schedule renewal.`;
  }
  if (expiryState === 'EXPIRING_UPCOMING' && daysRemaining !== null) {
    return `${displayLabel} expires in ${daysRemaining} days. Plan renewal.`;
  }
  return '';
}

// ─── Record Projection ────────────────────────────────────────────────────────

/**
 * Projects a raw Credential from the workspace store into a ComplyRecord
 * with all dynamic state computed at runtime.
 */
export function projectCredentialToComplyRecord(cred: Credential): ComplyRecord {
  const daysRemaining = computeDaysRemaining(cred.expiration_date);
  const expiryState = computeExpiryState(daysRemaining);
  const attentionPriority = computeAttentionPriority(expiryState);
  const category = resolveCategory(cred.type);
  const displayLabel = CREDENTIAL_TYPE_LABELS[cred.type] || cred.type.replace(/_/g, ' ');

  let verificationState: ComplyRecord['verification_state'] = 'CONTRACTOR_SUPPLIED';
  if (cred.verification_state === 'verified') {
    verificationState = 'VERIFIED';
  } else if (cred.document_id || cred.document) {
    verificationState = 'DOCUMENT_SUPPORTED';
  }

  return {
    id: cred.id,
    org_id: cred.org_id,
    category,
    credential_type: cred.type,
    display_label: displayLabel,
    title: cred.title,
    carrier_or_authority: cred.carrier_or_authority,
    policy_or_license_number: cred.policy_or_license_number,
    coverage_amount: cred.coverage_amount,
    effective_date: cred.effective_date,
    expiration_date: cred.expiration_date,
    review_date: cred.review_date,
    holder: cred.holder,
    issue_date: cred.issue_date,
    notes: cred.notes,
    state: cred.state,

    expiry_state: expiryState,
    days_remaining: daysRemaining,
    attention_priority: attentionPriority,
    record_state: 'ACTIVE',
    verification_state: verificationState,
    supply_state: 'CONTRACTOR_SUPPLIED',

    document_id: cred.document_id,
    document_title: cred.document?.title,
    document_file_url: cred.document?.file_url,

    created_at: cred.created_at,
    updated_at: cred.updated_at,
  };
}

// ─── Overview Computation ─────────────────────────────────────────────────────

export function computeOverview(records: ComplyRecord[]): ComplyOverview {
  const active = records.filter((r) => r.record_state === 'ACTIVE');

  const byCategory = (category: ComplyCategory) => {
    const cat = active.filter((r) => r.category === category);
    return {
      total: cat.length,
      current: cat.filter((r) => r.expiry_state === 'CURRENT' || r.expiry_state === 'NO_EXPIRY').length,
      attention: cat.filter((r) => r.attention_priority !== 'NONE').length,
    };
  };

  return {
    total: active.length,
    current: active.filter((r) => r.expiry_state === 'CURRENT' || r.expiry_state === 'NO_EXPIRY').length,
    expiring_critical: active.filter((r) => r.expiry_state === 'EXPIRING_CRITICAL').length,
    expiring_high: active.filter((r) => r.expiry_state === 'EXPIRING_HIGH').length,
    expiring_upcoming: active.filter((r) => r.expiry_state === 'EXPIRING_UPCOMING').length,
    expired: active.filter((r) => r.expiry_state === 'EXPIRED').length,
    by_category: {
      licences: byCategory('licence'),
      insurance: byCategory('insurance'),
      credentials: byCategory('credential'),
      safety: byCategory('safety'),
    },
  };
}

// ─── Attention Queue ──────────────────────────────────────────────────────────

export function buildAttentionQueue(records: ComplyRecord[]): AttentionItem[] {
  const items: AttentionItem[] = records
    .filter((r) => r.attention_priority !== 'NONE' && r.record_state === 'ACTIVE')
    .map((r) => ({
      record: r,
      priority: r.attention_priority,
      reason: buildAttentionReason(r.expiry_state, r.days_remaining, r.display_label),
    }));

  // Sort: CRITICAL first, then HIGH, MEDIUM, LOW
  const priorityOrder: AttentionPriority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  items.sort((a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority));

  return items;
}

// ─── Primary Data Fetch ───────────────────────────────────────────────────────

export async function listComplyRecords(orgId: string): Promise<ComplyRecord[]> {
  const credentials = await listCredentials(orgId);
  return credentials.map(projectCredentialToComplyRecord);
}

export async function listComplyRecordsByCategory(
  orgId: string,
  category: ComplyCategory
): Promise<ComplyRecord[]> {
  const all = await listComplyRecords(orgId);
  return all.filter((r) => r.category === category);
}
