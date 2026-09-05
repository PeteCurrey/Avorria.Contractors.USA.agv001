/**
 * AVORRIA DASHBOARD SERVICE LAYER
 *
 * Composes data from existing workspace sources into typed structures
 * for the six contractor dashboard sections:
 *   1. Work-Ready Status     — from readiness engine
 *   2. Your Attention        — derived from credentials + passport gaps
 *   3. Win Work              — STUB (opportunity backend not yet built)
 *   4. Compliance Position   — from credentials + readiness breakdown
 *   5. Recent Activity       — synthesized from documents, credentials, notifications
 *   6. Business Snapshot     — from organization + passport
 */

import {
  Organization,
  Credential,
  WorkspaceDocument,
  WorkspaceNotification,
  ReadinessScoreBreakdown,
} from './types';
import {
  listCredentials,
  listDocuments,
  listNotifications,
  getPassportByOrg,
} from './db';
import { calculateReadinessScore } from './readiness';

// ─────────────────────────────────────────────────────────────
// ATTENTION ITEMS
// ─────────────────────────────────────────────────────────────

export type AttentionPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type AttentionAction = 'RENEW' | 'COMPLETE' | 'REVIEW' | 'UPLOAD' | 'PUBLISH';

export interface DashboardAttentionItem {
  id: string;
  priority: AttentionPriority;
  title: string;
  description: string;
  dueLabel: string;      // e.g. "Expires in 14 days" | "Missing" | "Action required"
  state: string;         // Current state label e.g. "EXPIRING SOON" | "MISSING" | "DRAFT"
  action: AttentionAction;
  href: string;          // Absolute workspace path for the CTA
}

// ─────────────────────────────────────────────────────────────
// WIN WORK OPPORTUNITIES
// ─────────────────────────────────────────────────────────────

/**
 * STUB — Win Work opportunity types.
 *
 * Backend dependency: A contractor-facing opportunity/project-request feed
 * does not yet exist. The current match engine (src/lib/match/) serves
 * client→contractor matching. A future "Win Work" backend will need:
 *   - An opportunities table (project requests visible to contractors)
 *   - A contractor-side match score derived from their passport/credentials
 *   - Response/bid tracking
 *
 * Until that backend is built, this returns an empty array with proper types.
 */
export type OpportunityStatus = 'MATCHED' | 'APPLIED' | 'REVIEWING' | 'CLOSED';

export interface DashboardOpportunity {
  id: string;
  title: string;
  location: string;          // "Dallas, TX"
  trade: string;             // "Electrical"
  estimatedValueMin?: number;
  estimatedValueMax?: number;
  matchScore: number;        // 0–100
  status: OpportunityStatus;
  postedAt: string;          // ISO date
  href: string;
}

// ─────────────────────────────────────────────────────────────
// COMPLIANCE TIMELINE
// ─────────────────────────────────────────────────────────────

export type TimelineBucket = 'TODAY' | '14_DAYS' | '30_DAYS' | '60_DAYS' | '90_DAYS' | 'CURRENT';

export interface ComplianceTimelineItem {
  credentialId: string;
  credentialTitle: string;
  credentialType: string;
  expirationDate: string;    // ISO date string
  bucket: TimelineBucket;
  daysRemaining: number;     // negative = expired
  href: string;
}

// ─────────────────────────────────────────────────────────────
// ACTIVITY LEDGER
// ─────────────────────────────────────────────────────────────

export type ActivityEventType =
  | 'VERIFICATION'
  | 'DOCUMENT'
  | 'COMPLIANCE'
  | 'SUBMISSION'
  | 'PASSPORT'
  | 'SYSTEM';

export interface DashboardActivity {
  id: string;
  timestamp: string;          // ISO date string
  eventType: ActivityEventType;
  reference?: string;         // e.g. "AVR-JHA-2026-0884", credential ID
  description: string;
  userId?: string;
}

// ─────────────────────────────────────────────────────────────
// COMPLIANCE BREAKDOWN (DISPLAY)
// ─────────────────────────────────────────────────────────────

export interface ComplianceBreakdown {
  overall: number;            // 0–100
  licenses: number;           // 0–100
  insurance: number;          // 0–100
  safety: number;             // 0–100
  certifications: number;     // 0–100
  recordCount: number;        // total credentials in scope
}

// ─────────────────────────────────────────────────────────────
// WORK-READY SUB-AREAS
// ─────────────────────────────────────────────────────────────

export interface WorkReadyArea {
  label: string;
  status: string;             // "Verified" | "96%" | "Active" | "Draft" | "—"
  isGood: boolean;
  href: string;
}

// ─────────────────────────────────────────────────────────────
// BUSINESS SNAPSHOT
// ─────────────────────────────────────────────────────────────

export interface BusinessSnapshot {
  name: string;
  legalName?: string;
  primaryTrade: string;
  city?: string;
  state?: string;
  statesServed: string[];
  licenseStatus: 'VERIFIED' | 'ACTIVE' | 'MISSING' | 'EXPIRED';
  insuranceStatus: 'VERIFIED' | 'ACTIVE' | 'MISSING' | 'EXPIRED';
  passportStatus: 'ACTIVE' | 'DRAFT' | 'INACTIVE';
  passportSlug?: string;
  entityType?: string;
}

// ─────────────────────────────────────────────────────────────
// COMPOSITE DASHBOARD DATA
// ─────────────────────────────────────────────────────────────

export interface DashboardData {
  readinessScore: number;
  calculatedAt: string;
  breakdown: ReadinessScoreBreakdown;
  workReadyAreas: WorkReadyArea[];
  attentionItems: DashboardAttentionItem[];
  opportunities: DashboardOpportunity[];      // STUB — always empty until backend built
  complianceBreakdown: ComplianceBreakdown;
  complianceTimeline: ComplianceTimelineItem[];
  recentActivity: DashboardActivity[];
  businessSnapshot: BusinessSnapshot;
}

// ─────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────

function daysUntilExpiry(dateStr: string | undefined): number | null {
  if (!dateStr) return null;
  const exp = new Date(dateStr);
  if (isNaN(exp.getTime())) return null;
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const expDay = Date.UTC(exp.getUTCFullYear(), exp.getUTCMonth(), exp.getUTCDate());
  return Math.ceil((expDay - today) / (1000 * 60 * 60 * 24));
}

function bucketFromDays(days: number): TimelineBucket {
  if (days <= 0) return 'TODAY';
  if (days <= 14) return '14_DAYS';
  if (days <= 30) return '30_DAYS';
  if (days <= 60) return '60_DAYS';
  if (days <= 90) return '90_DAYS';
  return 'CURRENT';
}

function formatCredentialTitle(c: Credential): string {
  if (c.carrier_or_authority) return c.carrier_or_authority;
  const labels: Record<string, string> = {
    general_liability_coi: 'General Liability COI',
    workers_comp: "Workers' Compensation",
    umbrella: 'Umbrella Policy',
    auto: 'Commercial Auto',
    trade_license: 'Trade License',
    osha_card: 'OSHA Card',
    other: 'Other Credential',
  };
  return labels[c.type] ?? c.type.replace(/_/g, ' ');
}

function buildAttentionItems(
  credentials: Credential[],
  breakdown: ReadinessScoreBreakdown
): DashboardAttentionItem[] {
  const items: DashboardAttentionItem[] = [];

  // High priority: credentials expiring in 14 days or expired
  for (const c of credentials) {
    const days = daysUntilExpiry(c.expiration_date);
    const title = formatCredentialTitle(c);

    if (c.status === 'expired') {
      items.push({
        id: `attn_${c.id}_expired`,
        priority: 'HIGH',
        title,
        description: `${title} has expired and must be renewed immediately.`,
        dueLabel: 'Expired',
        state: 'EXPIRED',
        action: 'RENEW',
        href: '/workspace/comply',
      });
    } else if (c.status === 'expiring_14') {
      items.push({
        id: `attn_${c.id}_exp14`,
        priority: 'HIGH',
        title,
        description: `${title} expires in ${days} day${days === 1 ? '' : 's'}.`,
        dueLabel: `Expires in ${days} day${days === 1 ? '' : 's'}`,
        state: 'EXPIRING SOON',
        action: 'RENEW',
        href: '/workspace/comply',
      });
    } else if (c.status === 'expiring_30') {
      items.push({
        id: `attn_${c.id}_exp30`,
        priority: 'MEDIUM',
        title,
        description: `${title} expires in ${days} days.`,
        dueLabel: `Expires in ${days} days`,
        state: 'EXPIRING',
        action: 'RENEW',
        href: '/workspace/comply',
      });
    }
  }

  // Medium priority: missing required credentials
  if (!breakdown.has_gl_coi) {
    items.push({
      id: 'attn_missing_gl',
      priority: 'HIGH',
      title: 'General Liability COI',
      description: 'No active General Liability certificate on file. Required for most commercial work.',
      dueLabel: 'Required',
      state: 'MISSING',
      action: 'UPLOAD',
      href: '/workspace/comply',
    });
  }

  if (!breakdown.has_workers_comp) {
    items.push({
      id: 'attn_missing_wc',
      priority: 'HIGH',
      title: "Workers' Compensation",
      description: "Workers' Compensation coverage is required for all field operations.",
      dueLabel: 'Required',
      state: 'MISSING',
      action: 'UPLOAD',
      href: '/workspace/comply',
    });
  }

  if (!breakdown.has_trade_license) {
    items.push({
      id: 'attn_missing_license',
      priority: 'MEDIUM',
      title: 'State Trade License',
      description: 'Add your state contractor license to improve your readiness score and passport.',
      dueLabel: 'Missing',
      state: 'MISSING',
      action: 'UPLOAD',
      href: '/workspace/comply',
    });
  }

  if (!breakdown.has_safety_plan) {
    items.push({
      id: 'attn_missing_safety',
      priority: 'MEDIUM',
      title: 'Site Safety Plan / JHA',
      description: 'No active safety plan or JHA on file. Required for commercial project eligibility.',
      dueLabel: 'Missing',
      state: 'MISSING',
      action: 'COMPLETE',
      href: '/workspace/create',
    });
  }

  if (!breakdown.has_passport) {
    items.push({
      id: 'attn_passport_draft',
      priority: 'LOW',
      title: 'Contractor Passport',
      description: 'Your Contractor Passport has not been published. Publish to be discoverable.',
      dueLabel: 'Unpublished',
      state: 'DRAFT',
      action: 'PUBLISH',
      href: '/workspace/prove',
    });
  }

  // Sort: HIGH first, then MEDIUM, then LOW
  const order: Record<AttentionPriority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  items.sort((a, b) => order[a.priority] - order[b.priority]);

  // Cap at 8 items to keep the dashboard focused
  return items.slice(0, 8);
}

function buildComplianceBreakdown(
  credentials: Credential[],
  breakdown: ReadinessScoreBreakdown
): ComplianceBreakdown {
  const licenses = credentials.filter((c) => c.type === 'trade_license');
  const insurance = credentials.filter((c) =>
    ['general_liability_coi', 'workers_comp', 'umbrella', 'auto'].includes(c.type)
  );
  const safety = credentials.filter((c) => c.type === 'osha_card');
  const certifications = credentials.filter((c) => ['osha_card', 'other'].includes(c.type));

  function pct(items: Credential[]): number {
    if (items.length === 0) return 0;
    const active = items.filter((c) => c.status !== 'expired').length;
    return Math.round((active / items.length) * 100);
  }

  const overall = Math.round(
    ((breakdown.insurance_score / breakdown.insurance_max) * 100 * 0.35) +
    ((breakdown.licensing_score / breakdown.licensing_max) * 100 * 0.25) +
    ((breakdown.documents_score / breakdown.documents_max) * 100 * 0.25) +
    ((breakdown.passport_score / breakdown.passport_max) * 100 * 0.15)
  );

  return {
    overall: Math.min(100, overall),
    licenses: licenses.length === 0
      ? (breakdown.has_trade_license ? 100 : 0)
      : pct(licenses),
    insurance: insurance.length === 0
      ? (breakdown.has_gl_coi || breakdown.has_workers_comp ? 50 : 0)
      : pct(insurance),
    safety: breakdown.has_safety_plan
      ? (breakdown.has_recent_toolbox_talk ? 100 : 70)
      : 0,
    certifications: certifications.length === 0 ? 0 : pct(certifications),
    recordCount: credentials.length,
  };
}

function buildComplianceTimeline(credentials: Credential[]): ComplianceTimelineItem[] {
  const items: ComplianceTimelineItem[] = [];

  for (const c of credentials) {
    if (!c.expiration_date) continue;
    const days = daysUntilExpiry(c.expiration_date);
    if (days === null) continue;

    items.push({
      credentialId: c.id,
      credentialTitle: formatCredentialTitle(c),
      credentialType: c.type,
      expirationDate: c.expiration_date,
      bucket: bucketFromDays(days),
      daysRemaining: days,
      href: '/workspace/comply',
    });
  }

  // Sort by soonest first
  items.sort((a, b) => a.daysRemaining - b.daysRemaining);
  return items;
}

function buildRecentActivity(
  documents: WorkspaceDocument[],
  credentials: Credential[],
  notifications: WorkspaceNotification[]
): DashboardActivity[] {
  const activities: DashboardActivity[] = [];

  // From documents
  for (const doc of documents) {
    const typeLabel: Record<string, string> = {
      jha: 'DOCUMENT',
      jsa: 'DOCUMENT',
      safety_plan: 'DOCUMENT',
      toolbox_talk: 'DOCUMENT',
      quote: 'SUBMISSION',
      change_order: 'DOCUMENT',
      coi: 'COMPLIANCE',
      license: 'COMPLIANCE',
      other: 'DOCUMENT',
    };
    const eventType = (typeLabel[doc.type] ?? 'DOCUMENT') as ActivityEventType;

    const descLabels: Record<string, string> = {
      jha: `JHA ${doc.title} finalized`,
      jsa: `JSA ${doc.title} finalized`,
      safety_plan: `Safety plan "${doc.title}" added`,
      toolbox_talk: `Toolbox talk "${doc.title}" recorded`,
      quote: `Quote "${doc.title}" submitted`,
      change_order: `Change order "${doc.title}" created`,
      coi: `COI document "${doc.title}" uploaded`,
      license: `License document "${doc.title}" uploaded`,
      other: `Document "${doc.title}" added`,
    };

    activities.push({
      id: `act_doc_${doc.id}`,
      timestamp: doc.updated_at,
      eventType,
      reference: doc.title,
      description: descLabels[doc.type] ?? `Document "${doc.title}" updated`,
    });
  }

  // From credentials (use created_at as the event time)
  for (const c of credentials) {
    const title = formatCredentialTitle(c);
    activities.push({
      id: `act_crd_${c.id}`,
      timestamp: c.created_at,
      eventType: 'COMPLIANCE',
      reference: c.policy_or_license_number,
      description: `${title} added to compliance record`,
    });
  }

  // From notifications
  for (const n of notifications) {
    const typeMap: Record<string, ActivityEventType> = {
      expiring_60: 'COMPLIANCE',
      expiring_30: 'COMPLIANCE',
      expiring_14: 'COMPLIANCE',
      expired: 'COMPLIANCE',
      passport_viewed: 'PASSPORT',
      reorder_alert: 'SYSTEM',
    };
    activities.push({
      id: `act_notif_${n.id}`,
      timestamp: n.sent_at,
      eventType: typeMap[n.type] ?? 'SYSTEM',
      description: n.message ?? `Notification: ${n.type.replace(/_/g, ' ')}`,
    });
  }

  // Sort chronologically descending
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Deduplicate and cap at 20
  return activities.slice(0, 20);
}

function buildWorkReadyAreas(
  breakdown: ReadinessScoreBreakdown,
  org: Organization,
  passportActive: boolean
): WorkReadyArea[] {
  const businessComplete =
    Boolean(org.name) &&
    Boolean(org.primary_trade) &&
    Boolean(org.hq_address?.city);

  const insurancePct = Math.round((breakdown.insurance_score / breakdown.insurance_max) * 100);
  const docsPct = Math.round((breakdown.documents_score / breakdown.documents_max) * 100);

  return [
    {
      label: 'Business',
      status: businessComplete ? 'Complete' : 'Incomplete',
      isGood: businessComplete,
      href: '/workspace/settings',
    },
    {
      label: 'Compliance',
      status: `${insurancePct}%`,
      isGood: insurancePct >= 80,
      href: '/workspace/comply',
    },
    {
      label: 'Documents',
      status: `${docsPct}%`,
      isGood: docsPct >= 80,
      href: '/workspace/documents',
    },
    {
      label: 'Passport',
      status: passportActive ? 'Active' : 'Draft',
      isGood: passportActive,
      href: '/workspace/prove',
    },
  ];
}

function buildBusinessSnapshot(
  org: Organization,
  credentials: Credential[],
  passportSlug: string | undefined
): BusinessSnapshot {
  const hasActiveLicense = credentials.some(
    (c) => c.type === 'trade_license' && c.status !== 'expired'
  );
  const hasExpiredLicense = credentials.some(
    (c) => c.type === 'trade_license' && c.status === 'expired'
  );
  const hasActiveGL = credentials.some(
    (c) => c.type === 'general_liability_coi' && c.status !== 'expired'
  );
  const hasExpiredGL = credentials.some(
    (c) => c.type === 'general_liability_coi' && c.status === 'expired'
  );

  function licenseStatus(): BusinessSnapshot['licenseStatus'] {
    if (hasActiveLicense) return 'ACTIVE';
    if (hasExpiredLicense) return 'EXPIRED';
    return 'MISSING';
  }

  function insuranceStatus(): BusinessSnapshot['insuranceStatus'] {
    if (hasActiveGL) return 'ACTIVE';
    if (hasExpiredGL) return 'EXPIRED';
    return 'MISSING';
  }

  return {
    name: org.name,
    legalName: org.legal_name,
    primaryTrade: org.primary_trade,
    city: org.hq_address?.city,
    state: org.hq_address?.state,
    statesServed: org.states_licensed,
    licenseStatus: licenseStatus(),
    insuranceStatus: insuranceStatus(),
    passportStatus: passportSlug ? 'ACTIVE' : 'DRAFT',
    passportSlug,
    entityType: org.entity_type,
  };
}

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────

export async function getDashboardData(
  org: Organization
): Promise<DashboardData> {
  const orgId = org.id;

  // Parallel data fetching
  const [readinessLog, credentials, documents, notifications, passport] =
    await Promise.all([
      calculateReadinessScore(orgId),
      listCredentials(orgId),
      listDocuments(orgId),
      listNotifications(orgId),
      getPassportByOrg(orgId),
    ]);

  const { score, breakdown, calculated_at } = readinessLog;
  const passportActive = Boolean(
    passport && passport.included_credential_ids && passport.included_credential_ids.length > 0
  );
  const passportSlug = passport?.slug;

  return {
    readinessScore: score,
    calculatedAt: calculated_at,
    breakdown,
    workReadyAreas: buildWorkReadyAreas(breakdown, org, passportActive),
    attentionItems: buildAttentionItems(credentials, breakdown),
    opportunities: [],  // STUB: Win Work backend not yet built. See type definition above.
    complianceBreakdown: buildComplianceBreakdown(credentials, breakdown),
    complianceTimeline: buildComplianceTimeline(credentials),
    recentActivity: buildRecentActivity(documents, credentials, notifications),
    businessSnapshot: buildBusinessSnapshot(org, credentials, passportSlug),
  };
}
