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

export type DocumentStatus =
  | 'draft'
  | 'ai_draft'
  | 'reviewed'
  | 'final'
  | 'superseded'
  | 'archived';

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
  tax_id_ein?: string | null;
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
  readiness_score: number; // 0 - 100
  readiness_breakdown: Record<string, unknown>;
  visibility: ProfileVisibility;
  is_indexable: boolean;
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
  requirement_type: 'statutory' | 'industry_standard' | 'safety_guideline' | 'platform_criteria';
  source: string;
  source_url?: string | null;
  effective_date?: string | null;
  next_review_date?: string | null;
  review_status: 'draft' | 'under_review' | 'approved' | 'needs_update';
  reviewer?: string | null;
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
  email?: string | null;
  phone?: string | null;
  role_title: string;
  is_field_worker: boolean;
  hire_date?: string | null;
  status: 'active' | 'inactive' | 'terminated';
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
  // AI Provenance & Governance
  ai_assisted: boolean;
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
  contractor_profile_id: string;
  slug: string;
  visibility: ProfileVisibility;
  is_indexable: boolean;
  published_at?: string | null;
  verified_badge_status: string;
  headline?: string | null;
  overview?: string | null;
  primary_phone?: string | null;
  public_email?: string | null;
  website_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RedirectRecord {
  id: string;
  source_path: string;
  target_path: string;
  status_code: 301 | 302 | 307 | 308;
  is_active: boolean;
  reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  email: string;
  full_name?: string | null;
  company_name?: string | null;
  phone?: string | null;
  trade?: string | null;
  state_province?: string | null;
  funnel_stage: FunnelStage;
  source_url?: string | null;
  referrer?: string | null;
  utm_params: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsEvent {
  id: string;
  session_id?: string | null;
  organisation_id?: string | null;
  user_id?: string | null;
  event_name: string;
  funnel_stage: FunnelStage;
  properties: Record<string, unknown>;
  path: string;
  user_agent?: string | null;
  ip_hash?: string | null;
  timestamp: string;
}
