/**
 * AVORRIA CREATE — CONTRACTOR CAPABILITY & COMMERCIAL EVIDENCE ENGINE
 * Domain Types: Capabilities, Projects, Case Studies, References, Commercial Profile
 */

export type ProjectStatus = 'completed' | 'active' | 'bidding';

export type ClientSector =
  | 'Commercial Office'
  | 'Healthcare'
  | 'Industrial & Logistics'
  | 'Education'
  | 'Municipal & Government'
  | 'Critical Power / Data Center'
  | 'Retail & Hospitality';

export type ProjectType =
  | 'New Construction'
  | 'Renovation / Retrofit'
  | 'Emergency Replacement'
  | 'Maintenance & Service'
  | 'Tenant Improvement';

export type ContractType =
  | 'Lump Sum'
  | 'Guaranteed Maximum Price (GMP)'
  | 'Cost Plus'
  | 'Time & Materials'
  | 'Unit Price';

export type CapabilityVerificationStatus =
  | 'contractor_supplied'
  | 'document_supported'
  | 'platform_verified'
  | 'review_required';

export type ReferenceType =
  | 'client'
  | 'general_contractor'
  | 'architect_engineer'
  | 'procurement';

export type ReferenceStatus = 'verified' | 'on_file' | 'pending';

// ─────────────────────────────────────────────────────────────
// 1. PROJECT EXPERIENCE
// ─────────────────────────────────────────────────────────────

export interface ProjectExperience {
  id: string;
  org_id: string;
  name: string;
  client: string;
  client_type: string;
  location_city: string;
  location_state: string;
  sector: ClientSector;
  project_type: ProjectType;
  contract_type: ContractType;
  start_date: string; // YYYY-MM
  completion_date?: string; // YYYY-MM or undefined if ongoing
  contract_value: number; // in USD
  status: ProjectStatus;
  description: string;
  scope: string;
  services_delivered: string[];
  challenges?: string;
  delivery_methodology?: string;
  outcomes?: string;
  evidence_document_ids: string[];
  evidence_summary?: string;
  win_work_opportunity_count?: number;
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────
// 2. CONTRACTOR CAPABILITY
// ─────────────────────────────────────────────────────────────

export interface ContractorCapability {
  id: string;
  org_id: string;
  name: string;
  trade: string;
  trade_slug: string;
  category: string;
  specialism: string;
  description: string;
  sectors: string[];
  jurisdictions: string[];
  years_experience: number;
  verification_status: CapabilityVerificationStatus;
  verification_provenance: string;
  evidence_document_ids: string[];
  related_project_ids: string[];
  win_work_match_count?: number;
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────
// 3. CASE STUDY
// ─────────────────────────────────────────────────────────────

export interface KeyMetric {
  label: string;
  value: string;
}

export interface CaseStudy {
  id: string;
  org_id: string;
  project_id: string;
  title: string;
  client: string;
  sector: string;
  location: string;
  contract_value: number;
  completion_date: string;
  challenge: string;
  scope: string;
  delivery: string;
  outcome: string;
  key_metrics: KeyMetric[];
  capabilities_exercised: string[];
  evidence_document_ids: string[];
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────
// 4. COMMERCIAL REFERENCE
// ─────────────────────────────────────────────────────────────

export interface CommercialReference {
  id: string;
  org_id: string;
  client_organization: string;
  contact_name: string;
  contact_title: string;
  contact_email?: string;
  contact_phone?: string;
  project_id?: string;
  project_name: string;
  reference_type: ReferenceType;
  date_provided: string;
  status: ReferenceStatus;
  testimonial: string;
  rating?: number;
  is_private: boolean; // Private procurement record flag
  supporting_document_id?: string;
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────
// 5. COMMERCIAL PROFILE (REUSABLE BUSINESS CONTENT)
// ─────────────────────────────────────────────────────────────

export interface CommercialProfile {
  id: string;
  org_id: string;
  company_overview: string;
  core_services: string[];
  sectors_served: string[];
  typical_project_size_min: number;
  typical_project_size_max: number;
  typical_project_size_sweet_spot: string;
  geographic_coverage_states: string[];
  geographic_coverage_metros: string[];
  differentiators: string[];
  delivery_approach: string;
  safety_commitments: string;
  accreditations_memberships: string[];
  bonding_capacity_single?: number;
  bonding_capacity_aggregate?: number;
  emr_rating?: number;
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────
// 6. PROFILE READINESS & BOTTLENECK ASSESSMENT
// ─────────────────────────────────────────────────────────────

export interface ReadinessBottleneck {
  id: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  action_label: string;
  action_href: string;
}

export interface CommercialReadinessAssessment {
  overall_score: number;
  status_label: string;
  breakdown: {
    business_info_score: number;
    capabilities_score: number;
    projects_score: number;
    credentials_score: number;
    references_score: number;
    commercial_content_score: number;
  };
  bottlenecks: ReadinessBottleneck[];
}
