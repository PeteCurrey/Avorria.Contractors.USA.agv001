/**
 * AVORRIA CONNECT DOMAIN TYPES
 * Phase 8: Client Accounts, Contractor Relationships & Controlled Opportunity Engine.
 */

import { AggregateVerificationStatus } from '@/lib/verification/types';

export type ClientOrganisationType =
  | 'facilities_management'
  | 'property_management'
  | 'estate_management'
  | 'commercial_property'
  | 'housing_operations'
  | 'procurement'
  | 'general_business'
  | 'other_professional_buyer';

export interface ClientProfile {
  id: string;
  organisation_id: string;
  organisation_name: string;
  organisation_type: ClientOrganisationType;
  contact_name: string;
  job_title?: string;
  business_email: string;
  phone?: string;
  operating_territory: {
    primaryState: string;
    cities?: string[];
    regions?: string[];
  };
  preferred_trades?: string[];
  account_status: 'active' | 'pending' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface ClientSavedContractor {
  id: string;
  client_organisation_id: string;
  contractor_organisation_id: string;
  contractor_slug: string;
  contractor_name?: string;
  trade?: string;
  location?: string;
  notes?: string;
  created_at: string;
}

export type RelationshipStatus =
  | 'saved'
  | 'pending'
  | 'connected'
  | 'declined'
  | 'archived'
  | 'blocked';

export interface ContractorRelationship {
  id: string;
  client_organisation_id: string;
  client_name?: string;
  contractor_organisation_id: string;
  contractor_name?: string;
  contractor_slug?: string;
  initiated_by: 'client' | 'contractor';
  initiator_user_id: string;
  status: RelationshipStatus;
  message?: string;
  connected_at?: string;
  archived_at?: string;
  created_at: string;
  updated_at: string;
}

export type OpportunityTimeframe =
  | 'asap'
  | 'within_7_days'
  | 'within_30_days'
  | 'specific_date'
  | 'flexible';

export type OpportunityStatus = 'draft' | 'open' | 'closed' | 'cancelled';

export interface OpportunityRequirements {
  tradeLicenseRequired?: boolean;
  generalLiabilityRequired?: boolean;
  safetyPlanRequired?: boolean;
  verificationRequired?: boolean;
  notes?: string;
}

export interface Opportunity {
  id: string;
  client_organisation_id: string;
  client_name?: string;
  created_by_user_id: string;
  title: string;
  project_type?: string;
  trade: string; // Standardized trade slug
  location: {
    city: string;
    state: string;
    address?: string;
  };
  timeframe: OpportunityTimeframe;
  target_date?: string;
  scope: string;
  requirements: OpportunityRequirements;
  status: OpportunityStatus;
  invitationsCount?: number;
  acceptedCount?: number;
  created_at: string;
  updated_at: string;
}

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'withdrawn';

export interface OpportunityInvitation {
  id: string;
  opportunity_id: string;
  opportunity_title?: string;
  opportunity_trade?: string;
  opportunity_location?: { city: string; state: string };
  client_organisation_id: string;
  client_name?: string;
  contractor_organisation_id: string;
  contractor_name?: string;
  contractor_slug?: string;
  invited_by_user_id: string;
  status: InvitationStatus;
  invited_at: string;
  responded_at?: string;
  response_message?: string;
}

export interface ContractorMatchResult {
  contractorId: string;
  slug: string;
  businessName: string;
  trade: string;
  tradeMatched: boolean;
  location: string;
  locationMatched: boolean;
  isVerified: boolean;
  verificationStatus: AggregateVerificationStatus;
  verificationReference?: string;
  hasInsurance: boolean;
  hasLicense: boolean;
  hasSafetyProgram: boolean;
  readinessScore?: number;
  matchReasons: string[];
  isEligible: boolean;
}

export interface ConnectNotification {
  id: string;
  recipient_organisation_id: string;
  sender_organisation_id?: string;
  event_type: string;
  title: string;
  message: string;
  entity_id?: string;
  entity_type?: string;
  is_read: boolean;
  created_at: string;
}
