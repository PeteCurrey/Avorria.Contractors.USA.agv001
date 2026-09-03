/**
 * AVORRIA DATABASE TYPES
 * 
 * TypeScript definitions mirroring Supabase / PostgreSQL schema.
 * All tenant-owned records require organisation_id.
 */

export type UserRole =
  | 'contractor_owner'
  | 'contractor_admin'
  | 'employee_user'
  | 'future_client'
  | 'platform_admin';

export type ProfileVisibility = 'private' | 'draft' | 'published' | 'suspended' | 'archived';

export type OnboardingStatus =
  | 'not_started'
  | 'in_progress'
  | 'ready_for_dashboard'
  | 'completed';

export type TradeCategory =
  | 'mep'
  | 'structural'
  | 'finishes'
  | 'exterior'
  | 'specialty'
  | 'general'
  | 'maintenance';

export type ComplianceStatus =
  | 'current'
  | 'expiring_soon'
  | 'expired'
  | 'missing'
  | 'not_applicable';

export type RequirementType =
  | 'legal_regulatory'
  | 'industry_standard'
  | 'client_prequal'
  | 'avorria_readiness';

export type RequirementState =
  | 'current'
  | 'expiring'
  | 'expired'
  | 'missing'
  | 'needs_review'
  | 'not_applicable';

export type DocumentStatus =
  | 'draft'
  | 'ai_draft'
  | 'reviewed'
  | 'final'
  | 'superseded'
  | 'archived';

export type GenerationMethod = 'ai' | 'template' | 'manual';

export type AiReviewStatus =
  | 'unreviewed'
  | 'in_review'
  | 'reviewed_with_edits'
  | 'accepted_as_is';

export type VerificationStatus =
  | 'pending'
  | 'under_review'
  | 'verified'
  | 'rejected'
  | 'expired'
  | 'revoked';

export type VerificationType =
  | 'business_identity'
  | 'general_liability_insurance'
  | 'workers_comp'
  | 'trade_license'
  | 'safety_program'
  | 'contractor_passport';

export type InsurancePolicyType =
  | 'general_liability'
  | 'workers_compensation'
  | 'commercial_auto'
  | 'umbrella'
  | 'inland_marine'
  | 'professional_liability'
  | 'builders_risk'
  | 'pollution_liability';

export type ServiceAreaType =
  | 'nationwide'
  | 'state'
  | 'county'
  | 'metro'
  | 'city'
  | 'radius';

export type FunnelStage =
  | 'visitor'
  | 'tool_interaction'
  | 'lead'
  | 'signup'
  | 'onboarding'
  | 'first_document'
  | 'compliance_setup'
  | 'passport_creation'
  | 'verification'
  | 'subscription';

export interface Organisation {
  id: string;
  name: string;
  slug: string;
  legal_name?: string | null;
  business_structure?: string | null;
  tax_id_ein?: string | null; // Kept in DB schema, but omitted from Phase 3 onboarding/UI
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state_province?: string | null;
  postal_code?: string | null;
  country: string;
  created_at: string;
  updated_at: string;
}

export interface OrganisationMember {
  id: string;
  organisation_id: string;
  user_id: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Trade {
  id: string;
  name: string;
  slug: string;
  parent_trade_id?: string | null;
  category: TradeCategory;
  description?: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface ContractorProfile {
  id: string;
  organisation_id: string;
  dba_name?: string | null;
  primary_phone?: string | null;
  primary_email?: string | null;
  website?: string | null;
  business_description?: string | null;
  year_established?: number | null;
  employee_count: number;
  readiness_score: number; // 0 - 100
  readiness_breakdown: Record<string, unknown>;
  visibility: ProfileVisibility;
  is_indexable: boolean;
  onboarding_status: OnboardingStatus;
  onboarding_started_at?: string | null;
  onboarding_last_saved_at?: string | null;
  onboarding_completed_at?: string | null;
  onboarding_data?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ContractorTrade {
  id: string;
  contractor_profile_id: string;
  trade_id: string;
  is_primary: boolean;
  license_number?: string | null;
  verified: boolean;
  created_at: string;
  trade?: Trade;
}

export interface ContractorServiceArea {
  id: string;
  contractor_profile_id: string;
  area_type: ServiceAreaType;
  state_code?: string | null;
  county_name?: string | null;
  city_name?: string | null;
  postal_code?: string | null;
  center_lat?: number | null;
  center_lng?: number | null;
  radius_miles?: number | null;
  is_primary: boolean;
  created_at: string;
}

export interface BusinessDocument {
  id: string;
  organisation_id: string;
  document_type: string;
  title: string;
  file_path: string;
  file_size_bytes?: number | null;
  mime_type?: string | null;
  visibility: 'private' | 'client_shared' | 'public_verified';
  status: 'draft' | 'active' | 'archived' | 'expired';
  version_number: number;
  parent_document_id?: string | null;
  expires_at?: string | null;
  issuing_organisation?: string | null;
  notes?: string | null;
  associated_requirement_id?: string | null;
  // Future Extraction Hooks (Unused in Phase 3, preserved in schema)
  extraction_status?: string | null;
  extracted_metadata?: Record<string, unknown> | null;
  extraction_confidence?: number | null;
  extraction_completed_at?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ComplianceRequirement {
  id: string;
  jurisdiction_code: string;
  trade_id?: string | null;
  requirement_code: string;
  title: string;
  description: string;
  requirement_type: RequirementType;
  source_name?: string | null;
  source_url?: string | null;
  effective_date?: string | null;
  next_review_date?: string | null;
  review_status?: string | null;
  readiness_weight: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ComplianceRecord {
  id: string;
  organisation_id: string;
  requirement_id: string;
  status: ComplianceStatus;
  evidence_document_id?: string | null;
  expiry_date?: string | null;
  notes?: string | null;
  last_checked_at: string;
  updated_at: string;
  requirement?: ComplianceRequirement;
  evidence_document?: BusinessDocument;
}

export interface InsuranceRecord {
  id: string;
  organisation_id: string;
  policy_type: InsurancePolicyType;
  carrier_name: string;
  policy_number: string;
  coverage_amount?: number | null;
  aggregate_amount?: number | null;
  effective_date: string;
  expiry_date: string;
  coi_document_id?: string | null;
  status: 'active' | 'expiring_soon' | 'expired' | 'pending_review';
  created_at: string;
  updated_at: string;
}

export interface Licence {
  id: string;
  organisation_id: string;
  trade_id?: string | null;
  state_jurisdiction: string;
  license_type: string;
  license_number: string;
  holder_name: string;
  status: 'active' | 'suspended' | 'expired' | 'pending_verification';
  effective_date?: string | null;
  expiry_date?: string | null;
  document_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  organisation_id: string;
  first_name: string;
  last_name: string;
  job_title: string;
  trade_id?: string | null;
  is_supervisor: boolean;
  osha_card_type?: 'osha_10' | 'osha_30' | 'none' | null;
  osha_card_number?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Certification {
  id: string;
  organisation_id: string;
  employee_id?: string | null;
  name: string;
  issuing_authority: string;
  certificate_number?: string | null;
  effective_date?: string | null;
  expiry_date?: string | null;
  document_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrainingRecord {
  id: string;
  organisation_id: string;
  title: string;
  training_type: 'toolbox_talk' | 'orientation' | 'osha_training' | 'refresher';
  conducted_date: string;
  trainer_name?: string | null;
  attendees_count: number;
  roster_document_id?: string | null;
  topics_covered?: string | null;
  created_at: string;
  updated_at: string;
}

export interface GeneratedDocument {
  id: string;
  organisation_id: string;
  template_id?: string | null;
  document_type: string;
  title: string;
  document_status: DocumentStatus;
  version_number: number;
  parent_document_id?: string | null;
  superseded_document_id?: string | null;
  document_payload: Record<string, unknown>;
  rendered_content?: string | null;
  
  // Provenance & Human Review Gate
  ai_assisted: boolean;
  generation_method: GenerationMethod;
  generation_timestamp?: string | null;
  generation_model?: string | null;
  generation_inputs?: Record<string, unknown> | null;
  user_review_status: AiReviewStatus;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  finalised_by?: string | null;
  finalised_at?: string | null;
  change_summary?: string | null;

  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface VerificationRecord {
  id: string;
  organisation_id: string;
  verification_type: VerificationType;
  status: VerificationStatus;
  evidence_reference?: string | null;
  evidence_document_id?: string | null;
  verification_method: 'document_inspection' | 'state_board_lookup' | 'automated_api' | 'third_party_audit';
  reviewer?: string | null;
  reviewed_at?: string | null;
  expires_at?: string | null;
  rejection_reason?: string | null;
  notes?: string | null;
  audit_history: unknown[];
  created_at: string;
  updated_at: string;
}

export interface PublicProfile {
  id: string;
  organisation_id: string;
  slug: string;
  display_name: string;
  summary?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  state_code?: string | null;
  city?: string | null;
  primary_trade_id?: string | null;
  readiness_score: number;
  badge_level: 'none' | 'verified_contractor' | 'premier_contractor';
  published_at?: string | null;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  organisation_id: string;
  user_id?: string | null;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export interface Notification {
  id: string;
  organisation_id: string;
  recipient_user_id?: string | null;
  type: string;
  title: string;
  message: string;
  link_url?: string | null;
  read: boolean;
  created_at: string;
}

// -----------------------------------------------------------------------------
// JHA PAYLOAD STRUCTURES
// -----------------------------------------------------------------------------

export interface JhaHazardItem {
  id: string;
  sequence: number;
  taskStep: string;
  potentialHazards: string[];
  controls: {
    hierarchyLevel: 'elimination' | 'substitution' | 'engineering' | 'administrative' | 'ppe';
    description: string;
  }[];
  regulatoryReference?: string; // e.g. "OSHA 1926.404"
}

export interface JhaDocumentPayload {
  jobInfo: {
    projectName: string;
    jobLocation: string;
    tradeName: string;
    workActivity: string;
    workDate: string;
    supervisorName: string;
  };
  workforce: {
    workerCount: number;
    assignedRoles: string[];
    competentPerson: string;
  };
  equipment: string[];
  materials: string[];
  ppe: {
    head: boolean;
    eyeFace: boolean;
    hearing: boolean;
    hand: boolean;
    foot: boolean;
    respiratory: boolean;
    fallProtection: boolean;
    arcFlash: boolean;
    otherNotes?: string;
  };
  hazardSequence: JhaHazardItem[];
  emergencyAction: {
    firstAidKitLocation: string;
    nearestMedicalFacility: string;
    emergencyContactPhone: string;
    musterPoint: string;
  };
  contractorReviewAck: {
    reviewedByContractor: boolean;
    acknowledgedAt?: string;
    reviewerName?: string;
    disclaimerAccepted: boolean;
  };
}
