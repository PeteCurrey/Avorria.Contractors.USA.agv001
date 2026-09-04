/**
 * AVORRIA COMPLY — DOMAIN TYPES
 *
 * Phase 6A: Safe foundation. Dynamic expiry state. Clear action.
 *
 * Terminology rules:
 * - CURRENT: record exists and has not expired
 * - EXPIRED: expiry_date < today (computed at runtime)
 * - EXPIRING_CRITICAL: 0–14 days remaining
 * - EXPIRING_HIGH: 15–30 days remaining
 * - EXPIRING_UPCOMING: 31–90 days remaining
 * - CONTRACTOR_SUPPLIED: contractor has provided the record (no external verification)
 * - VERIFIED: externally verified (Phase 6C only — not emitted in this phase)
 *
 * Never compute "COMPLIANT" without a deterministic rule.
 * Never imply absence of record = non-compliance.
 */

// ─── Expiry State ────────────────────────────────────────────────────────────

export type ExpiryState =
  | 'EXPIRED'
  | 'EXPIRING_CRITICAL'   // 0–14 days
  | 'EXPIRING_HIGH'       // 15–30 days
  | 'EXPIRING_UPCOMING'   // 31–90 days
  | 'CURRENT'             // 90+ days or no expiry date
  | 'NO_EXPIRY';          // record type does not expire (e.g. some certifications)

export type RecordState =
  | 'ACTIVE'
  | 'ARCHIVED'
  | 'SUPERSEDED';

// ─── Verification State ───────────────────────────────────────────────────────

export type VerificationState =
  | 'CONTRACTOR_SUPPLIED'
  | 'DOCUMENT_SUPPORTED'
  | 'VERIFIED';

// ─── Safety Review State ──────────────────────────────────────────────────────

export type SafetyReviewState =
  | 'CURRENT'
  | 'REVIEW_DUE'        // <= 30 days until review
  | 'REVIEW_OVERDUE'    // < 0 days (review date has passed)
  | 'NO_REVIEW_DATE';

export type SupplyState =
  | 'CONTRACTOR_SUPPLIED'
  | 'PENDING';

// ─── Attention Priority ───────────────────────────────────────────────────────

export type AttentionPriority =
  | 'CRITICAL'    // Expired or Review Overdue
  | 'HIGH'        // Expiring within 14 days or Review Due within 14 days
  | 'MEDIUM'      // Expiring within 30 days or Review Due within 30 days
  | 'LOW'         // Expiring within 90 days
  | 'NONE';

// ─── Record Category ─────────────────────────────────────────────────────────

export type ComplyCategory =
  | 'licence'
  | 'insurance'
  | 'credential'
  | 'safety';

// ─── Computed Comply Record ───────────────────────────────────────────────────
// A runtime-enriched view over a Credential from the workspace store.

export interface ComplyRecord {
  id: string;
  org_id: string;
  category: ComplyCategory;
  credential_type: string;     // raw type from workspace credential type
  display_label: string;       // human-readable type label
  title?: string;
  carrier_or_authority?: string;
  policy_or_license_number?: string;
  coverage_amount?: number;
  effective_date?: string;
  expiration_date?: string;
  review_date?: string;
  holder?: string;
  issue_date?: string;
  notes?: string;
  state?: string;

  // Computed at runtime — never stored
  expiry_state: ExpiryState;
  days_remaining: number | null;        // null = no expiry date
  review_state?: SafetyReviewState;
  days_until_review?: number | null;
  attention_priority: AttentionPriority;
  record_state: RecordState;
  verification_state: VerificationState;
  supply_state: SupplyState;

  // Document linkage (Evidence)
  document_id?: string;
  document_title?: string;
  document_file_url?: string;

  // Provenance
  created_at: string;
  updated_at: string;
}

// ─── Compliance Overview ──────────────────────────────────────────────────────

export interface ComplyOverview {
  total: number;
  current: number;
  expiring_critical: number;  // 0–14 days
  expiring_high: number;      // 15–30 days
  expiring_upcoming: number;  // 31–90 days
  expired: number;

  by_category: {
    licences: CategoryCount;
    insurance: CategoryCount;
    credentials: CategoryCount;
    safety: CategoryCount;
  };
}

export interface CategoryCount {
  total: number;
  current: number;
  attention: number;   // expired + expiring / review due
}

// ─── Attention Queue Item ─────────────────────────────────────────────────────

export interface AttentionItem {
  record: ComplyRecord;
  priority: AttentionPriority;
  reason: string;   // human-readable reason for attention
}

// ─── Category Config ──────────────────────────────────────────────────────────

export interface CategoryConfig {
  id: ComplyCategory;
  label: string;
  description: string;
  credential_types: string[];
}

export const COMPLY_CATEGORIES: CategoryConfig[] = [
  {
    id: 'licence',
    label: 'Licences',
    description: 'State trade licences and contractor registration',
    credential_types: ['trade_license'],
  },
  {
    id: 'insurance',
    label: 'Insurance',
    description: 'Insurance policies and certificates of insurance',
    credential_types: ['general_liability_coi', 'workers_comp', 'umbrella', 'auto', 'professional_liability'],
  },
  {
    id: 'credential',
    label: 'Credentials',
    description: 'Certifications, qualifications and professional credentials',
    credential_types: ['osha_card', 'other'],
  },
  {
    id: 'safety',
    label: 'Safety',
    description: 'Safety policies, safety plans, training and review records',
    credential_types: ['safety_policy', 'safety_plan', 'safety_training', 'safety_certificate', 'safety_review'],
  },
];

// ─── Type Display Labels ──────────────────────────────────────────────────────

export const CREDENTIAL_TYPE_LABELS: Record<string, string> = {
  trade_license: 'State Trade Licence',
  general_liability_coi: 'General Liability Insurance',
  workers_comp: "Workers' Compensation Insurance",
  umbrella: 'Commercial Umbrella / Excess',
  auto: 'Commercial Auto Insurance',
  professional_liability: 'Professional Liability Insurance',
  osha_card: 'OSHA Certification',
  safety_policy: 'Safety Policy Record',
  safety_plan: 'Site Safety & Health Plan',
  safety_training: 'Safety Training Record',
  safety_certificate: 'Safety Certification',
  safety_review: 'Safety Audit / Review',
  other: 'Professional Credential',
};

// ─── Form Input for Record Creation ──────────────────────────────────────────

export interface ComplyRecordFormInput {
  category: ComplyCategory;
  credential_type: string;
  title?: string;
  carrier_or_authority?: string;
  policy_or_license_number?: string;
  coverage_amount?: number;
  effective_date?: string;
  expiration_date?: string;
  review_date?: string;
  holder?: string;
  issue_date?: string;
  notes?: string;
  state?: string;
  document_file_url?: string;
  document_title?: string;
}
