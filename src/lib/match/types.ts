/**
 * AVORRIA MATCH INTELLIGENCE DOMAIN TYPES
 * Phase 10: Evidence-Aware Contractor Matching & Requirement Intelligence Engine.
 *
 * Design principles:
 * - Deterministic, explainable matching across every dimension (no synthetic AI match scores).
 * - Canonical evidence state model: VERIFIED, DECLARED, EXPIRED, MISSING, NEEDS_CLARIFICATION, NOT_APPLICABLE.
 * - Missing information is not failure ("Evidence not found" !== "Requirement failed").
 * - Match results stamped with engine version (e.g. 'MATCH_ENGINE_V1') and immutable snapshots.
 */

import { RequirementCategory, RequirementStrength } from '@/lib/request/types';

// ─────────────────────────────────────────────────────────────
// CANONICAL VOCABULARY & STATES
// ─────────────────────────────────────────────────────────────

export const MATCH_ENGINE_VERSION = 'MATCH_ENGINE_V1';

/**
 * Canonical evidence status for an individual requirement.
 */
export type CanonicalEvidenceState =
  | 'VERIFIED'            // Evidence exists and passed Avorria's formal verification workflow (AV-VER-XXXXXX)
  | 'DECLARED'            // Contractor self-declared in baseline credentials; no independent documentary verification
  | 'EXPIRED'             // Evidence existed but its validity date (expires_at) has passed
  | 'MISSING'             // No relevant evidence or declaration found in published Passport data
  | 'NEEDS_CLARIFICATION' // Evidence exists but has a discrepancy (e.g. limit below minimum, jurisdiction mismatch)
  | 'NOT_APPLICABLE';     // Requirement does not apply to contractor's specific scope/trade

/**
 * Derived overall match state for a contractor.
 * Explicitly avoids subjective labels like "perfect", "best", "recommended", or "top".
 */
export type OverallMatchStatus =
  | 'aligned'                  // All mandatory criteria are VERIFIED or aligned; trade & territory align
  | 'partially_aligned'        // Trade & territory align, but some required items are DECLARED or need review
  | 'needs_review'             // Items with discrepancies (e.g. expired document, limit shortfall) require client review
  | 'not_aligned'              // Trade or territory mismatch
  | 'insufficient_information';// Critical information is missing or unstated on published Passport

export type TradeAlignment =
  | 'exact'    // Contractor explicitly operates in the required trade slug
  | 'related'  // Contractor operates in an explicitly defined related trade category (e.g. MEP cluster)
  | 'none';    // No trade alignment

export type TerritoryAlignment =
  | 'exact'         // Contractor explicitly covers the project's city/metro
  | 'regional'      // Contractor serves the broader state/region containing the project
  | 'not_published' // No service territory information is published
  | 'no_alignment'; // Published territory does not include project location

export type MatchVerificationStatus =
  | 'verified'              // Holds active Avorria verification reference (AV-VER-XXXXXX)
  | 'published_unverified'; // Passport is published, but official verification is not completed

// ─────────────────────────────────────────────────────────────
// STRUCTURED EXPLANATIONS
// ─────────────────────────────────────────────────────────────

export type MatchDimension =
  | 'trade'
  | 'territory'
  | 'insurance'
  | 'licence'
  | 'safety'
  | 'credential'
  | 'verification'
  | 'eligibility'
  | 'general';

export interface MatchExplanation {
  code: string;
  dimension: MatchDimension;
  message: string;
  evidenceRef?: string;
  isPositive: boolean;
}

// ─────────────────────────────────────────────────────────────
// REQUIREMENT EVALUATION RESULT
// ─────────────────────────────────────────────────────────────

export interface RequirementEvaluationResult {
  requirementId: string;
  requirementTitle: string;
  category: RequirementCategory;
  strength: RequirementStrength;
  statedMinimum?: string;
  evidenceState: CanonicalEvidenceState;
  publishedInformationSummary: string;
  publishedEvidenceRef?: string;
  issuingAuthority?: string;
  expiryDate?: string;
  isExpired: boolean;
  explanations: MatchExplanation[];
}

// ─────────────────────────────────────────────────────────────
// CONTRACTOR MATCH SNAPSHOT
// ─────────────────────────────────────────────────────────────

export interface EvaluatedContractorMatch {
  contractorId: string;
  slug: string;
  businessName: string;
  primaryTrade: string;
  location: string;
  overallStatus: OverallMatchStatus;
  tradeAlignment: TradeAlignment;
  tradeAlignmentDetail: string;
  territoryAlignment: TerritoryAlignment;
  territoryAlignmentDetail: string;
  verificationStatus: MatchVerificationStatus;
  verificationReference?: string;
  isEligible: boolean; // Passed basic eligibility gate (active, published, not suspended, trade & territory aligned)
  alignedCount: number;
  declaredCount: number;
  expiredCount: number;
  missingCount: number;
  needsClarificationCount: number;
  requirementResults: RequirementEvaluationResult[];
  matchExplanations: MatchExplanation[];
}

// ─────────────────────────────────────────────────────────────
// MATCH SET (PERSISTED HEADER)
// ─────────────────────────────────────────────────────────────

export interface MatchSet {
  id: string;
  tenant_id: string;
  pack_id: string;
  engine_version: string; // e.g. 'MATCH_ENGINE_V1'
  status: 'ready' | 'stale' | 'refreshing';
  is_stale: boolean;
  stale_reason?: string;
  total_contractors_evaluated: number;
  eligible_contractors_count: number;
  verified_contractors_count: number;
  candidates: EvaluatedContractorMatch[];
  generated_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────
// FILTERING & SORTING
// ─────────────────────────────────────────────────────────────

export interface MatchFilterOptions {
  verificationOnly?: boolean;
  tradeSlug?: string;
  territoryExactOnly?: boolean;
  overallStatus?: OverallMatchStatus;
  evidenceVerifiedOnly?: boolean;
  allRequiredAlignedOnly?: boolean;
}

export type MatchSortOption =
  | 'verified_first'     // Verified by Avorria first, then aligned count
  | 'alignment_highest'  // Most aligned requirements first
  | 'evidence_highest'   // Most published evidence first
  | 'alphabetical';      // Business name A-Z
