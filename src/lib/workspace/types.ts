/**
 * AVORRIA CONTRACTORS USA — WORKSPACE DOMAIN TYPES
 * Build Prompt 1: Foundation, Authenticated Workspace, and Comply/Prove Core
 */

export type WorkspaceUserRole = 'owner' | 'admin' | 'office_staff' | 'field';

export type CredentialType =
  | 'general_liability_coi'
  | 'workers_comp'
  | 'umbrella'
  | 'auto'
  | 'trade_license'
  | 'osha_card'
  | 'other';

export type CredentialStatus =
  | 'current'
  | 'expiring_60'
  | 'expiring_30'
  | 'expiring_14'
  | 'expired';

export type WorkspaceDocumentType =
  | 'jha'
  | 'jsa'
  | 'safety_plan'
  | 'toolbox_talk'
  | 'quote'
  | 'change_order'
  | 'coi'
  | 'license'
  | 'other';

export type DocumentGeneratedBy = 'ai' | 'uploaded';

export type NotificationType =
  | 'expiring_60'
  | 'expiring_30'
  | 'expiring_14'
  | 'expired'
  | 'passport_viewed';

export interface Organization {
  id: string;
  name: string;
  legal_name?: string;
  entity_type?: string;
  ein?: string;
  primary_trade: string;
  additional_trades: string[];
  states_licensed: string[];
  hq_address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  logo_url?: string;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export interface WorkspaceUser {
  id: string;
  org_id: string;
  role: WorkspaceUserRole;
  full_name: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceDocument {
  id: string;
  org_id: string;
  type: WorkspaceDocumentType;
  title: string;
  file_url?: string;
  version: number;
  generated_by: DocumentGeneratedBy;
  linked_project_id?: string;
  created_by_user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Credential {
  id: string;
  org_id: string;
  type: CredentialType;
  carrier_or_authority?: string;
  policy_or_license_number?: string;
  coverage_amount?: number;
  effective_date?: string;
  expiration_date?: string;
  document_id?: string;
  status: CredentialStatus;
  state?: string;
  created_at: string;
  updated_at: string;
  document?: WorkspaceDocument;
}

export interface ReadinessScoreBreakdown {
  credential_completeness: number;
  insurance_score: number;
  insurance_max: number;
  licensing_score: number;
  licensing_max: number;
  document_currency: number;
  documents_score: number;
  documents_max: number;
  passport_completeness: number;
  passport_score: number;
  passport_max: number;
  has_gl_coi: boolean;
  has_workers_comp: boolean;
  has_trade_license: boolean;
  has_safety_plan: boolean;
  has_recent_toolbox_talk: boolean;
  has_passport: boolean;
}

export interface ReadinessScoreLog {
  id: string;
  org_id: string;
  score: number;
  calculated_at: string;
  breakdown: ReadinessScoreBreakdown;
}

export interface Passport {
  id: string;
  org_id: string;
  slug: string;
  is_password_protected: boolean;
  password_hash?: string;
  included_credential_ids: string[];
  included_document_ids: string[];
  view_count: number;
  last_viewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PassportAccessLog {
  id: string;
  passport_id: string;
  viewed_at: string;
  viewer_ip_hash: string;
  referrer?: string;
}

export interface ToolboxTalkAttendance {
  id: string;
  org_id: string;
  topic: string;
  date: string;
  attendee_names: string[];
  document_id?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceNotification {
  id: string;
  org_id: string;
  user_id?: string;
  type: NotificationType;
  related_credential_id?: string;
  sent_at: string;
  read_at?: string;
  message?: string;
}

export const PRIMARY_TRADES = [
  'Electrical',
  'HVAC & Mechanical',
  'Commercial Plumbing',
  'Commercial Roofing',
  'General Contractors',
  'Concrete & Structural',
  'Fire Protection',
  'Low Voltage & Security',
] as const;

export type PrimaryTrade = (typeof PRIMARY_TRADES)[number];
