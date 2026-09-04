/**
 * AVORRIA CONTRACTOR PASSPORT DOMAIN TYPES
 * Phase 6: Granular section toggles, print and sharing support.
 */

export type PassportVisibility =
  | 'private'
  | 'draft'
  | 'published'
  | 'suspended'
  | 'archived';

export interface PassportPublicSettings {
  showInsurance: boolean;
  showLicense: boolean;
  showSafetyProgram: boolean;
  showReadinessScore: boolean;
  showWorkforceSummary: boolean;
  showTrades?: boolean;
  showServiceAreas?: boolean;
  showCredentials?: boolean;
  showVerification?: boolean;
  customHeadline?: string;
}

export interface PassportCompletionItem {
  id: string;
  category: 'business_identity' | 'trades_service' | 'credentials' | 'safety_operations';
  label: string;
  description: string;
  weight: number;
  satisfied: boolean;
  actionUrl: string;
  actionLabel: string;
}

export interface PassportCompletionResult {
  completionPercentage: number;
  isComplete: boolean;
  items: PassportCompletionItem[];
  missingItems: PassportCompletionItem[];
  categoryBreakdown: Array<{
    category: string;
    label: string;
    percentage: number;
  }>;
}

export interface PublicationEligibilityResult {
  eligible: boolean;
  reasons: string[];
  blockers: string[];
  recommendations: string[];
}

/**
 * Public Sanitized DTO for /contractors/[slug] and /contractors/[slug]/verification
 * ZERO private documents, internal notes, storage paths, or auth data.
 */
export interface PublicPassportDTO {
  slug: string;
  businessName: string;
  legalName?: string;
  headline?: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  primaryLocation: string;
  trades: Array<{ slug: string; name: string }>;
  serviceAreas: {
    primaryState: string;
    cities: string[];
    radiusMiles?: number;
  };
  employeeCount?: number;
  yearsInBusiness?: number;
  
  // Public Section Visibility Controls
  publicSettings?: PassportPublicSettings;

  // Verification State
  verification: {
    isVerified: boolean;
    status: 'verified' | 'verification_in_progress' | 'not_verified' | 'verification_expired' | 'verification_suspended';
    referenceNumber?: string; // AV-VER-XXXXXX
    verifiedAt?: string;
    validUntil?: string;
    criteriaVersion?: string;
    verifiedCategories: Array<{
      category: string;
      name: string;
      statement: string;
    }>;
  };

  // Curated Credential Statements (No private documents)
  credentials: {
    insurance?: {
      verified: boolean;
      coverageType: string;
      insurerName?: string;
      expiryDate?: string;
      status: 'verified' | 'unverified';
    };
    license?: {
      verified: boolean;
      licenseType: string;
      issuingAuthority?: string;
      jurisdiction?: string;
      expiryDate?: string;
      status: 'verified' | 'unverified';
    };
    safetyProgram?: {
      verified: boolean;
      programType: string;
      lastActiveDate?: string;
      status: 'verified' | 'unverified';
    };
  };

  // Readiness Score (if permitted by contractor)
  readinessScore?: {
    score: number;
    label: string;
    disclaimer: string;
  };

  publishedAt: string;
  lastReviewedAt: string;
  disclaimer: string;
}

// ─────────────────────────────────────────────────────────────
// PHASE 8: ASSEMBLED CONTRACTOR PASSPORT DOMAIN TYPES
// ─────────────────────────────────────────────────────────────

import type { Organization, Passport, PassportSnapshot } from '@/lib/workspace/types';
import type {
  ContractorCapability,
  ProjectExperience,
  CaseStudy,
  CommercialReference,
  CommercialProfile,
} from '@/lib/create/evidence-types';
import type { ComplyRecord } from '@/lib/comply/types';
import type { EvidenceItem } from '@/lib/prove/types';

export interface PassportReadinessItem {
  status: 'COMPLETE' | 'NEEDS_ATTENTION' | 'CURRENT' | 'ATTENTION_REQUIRED' | 'INCOMPLETE' | 'EVIDENCE_AVAILABLE' | 'EVIDENCE_GAPS' | 'PRESENT' | 'NONE_ADDED';
  label: string;
  detail: string;
  count?: number;
  selected?: number;
  action_href?: string;
  action_label?: string;
}

export interface PassportReadiness {
  identity: PassportReadinessItem;
  capabilities: PassportReadinessItem;
  experience: PassportReadinessItem;
  compliance: PassportReadinessItem;
  evidence: PassportReadinessItem;
  references: PassportReadinessItem;
  overall_standing: 'PROFILE_CURRENT' | 'ATTENTION_REQUIRED';
  summary: string;
}

export interface AssembledCapability extends ContractorCapability {
  is_selected: boolean;
  evidence_count: number;
  has_verified_evidence: boolean;
  evidence_ids: string[];
}

export interface AssembledProject extends ProjectExperience {
  is_selected: boolean;
  evidence_count: number;
  has_verified_evidence: boolean;
  evidence_ids: string[];
}

export interface AssembledCaseStudy extends CaseStudy {
  is_selected: boolean;
}

export interface AssembledReference extends CommercialReference {
  is_selected: boolean;
}

export interface AssembledComplianceRecord extends ComplyRecord {
  is_selected: boolean;
  prove_verification_state?: string;
  prove_verification_ref?: string;
}

export interface AssembledPassport {
  passport: Passport;
  organization: Organization;
  commercialProfile: CommercialProfile | null;
  capabilities: AssembledCapability[];
  projects: AssembledProject[];
  caseStudies: AssembledCaseStudy[];
  references: AssembledReference[];
  complianceRecords: AssembledComplianceRecord[];
  evidenceItems: EvidenceItem[];
  readiness: PassportReadiness;
  snapshots: PassportSnapshot[];
}

export interface UpdatePassportAssemblyInput {
  slug?: string;
  headline?: string;
  summary_override?: string;
  is_password_protected?: boolean;
  password?: string;
  included_capability_ids?: string[];
  included_project_ids?: string[];
  included_case_study_ids?: string[];
  included_reference_ids?: string[];
  included_credential_ids?: string[];
  included_evidence_ids?: string[];
  included_document_ids?: string[];
  show_identity?: boolean;
  show_capabilities?: boolean;
  show_experience?: boolean;
  show_case_studies?: boolean;
  show_references?: boolean;
  show_compliance?: boolean;
  show_evidence?: boolean;
}

