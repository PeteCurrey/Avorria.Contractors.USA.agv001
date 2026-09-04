/**
 * AVORRIA DISCOVER — DOMAIN TYPES
 * Phase 10: Structured Commercial Opportunity Discovery Layer
 *
 * Core Principle:
 *   DISCOVER finds what exists.
 *   MATCH determines how well it fits.
 *
 * DISCOVER surfaces factual opportunity attributes and strictly omits
 * match scores, eligibility conclusions, fit percentages, or AI suitability rankings.
 */

import { OpportunityRequirements, OpportunityTimeframe } from '@/lib/connect/types';

// ─── Dynamic Closing Date Lifecycle ───────────────────────────────────────────

export type ClosingDateStatus =
  | 'CLOSED'            // Closing date has passed
  | 'CLOSING_TODAY'      // Closing date is today
  | 'CLOSING_SOON'       // Closing within 7 days
  | 'OPEN'               // Closing date > 7 days or open with distant/flexible timeframe
  | 'NO_CLOSING_DATE';   // No target or closing date recorded

export interface DynamicClosingDateInfo {
  status: ClosingDateStatus;
  daysRemaining: number | null;
  relativeText: string;
  isExpiringSoon: boolean;
  formattedClosingDate: string | null;
}

// ─── Core Discover Opportunity Entity ─────────────────────────────────────────

export type OpportunityLifecycleStatus =
  | 'draft'
  | 'open'
  | 'closing'
  | 'closed'
  | 'awarded'
  | 'cancelled';

export interface DiscoverOpportunity {
  id: string;
  title: string;
  client_organisation_id: string;
  client_name: string;
  trade: string;                  // Standard trade slug, e.g. 'electrical-contracting'
  trade_label: string;            // Human-readable trade name, e.g. 'Electrical Contracting'
  location: {
    city: string;
    state: string;
    address?: string;
  };
  project_type?: string;
  sector?: string;
  estimated_value?: number | string;
  scope: string;
  description?: string;
  timeframe: OpportunityTimeframe;
  target_date?: string;           // External source deadline
  closing_date?: string;          // Alias/formal closing date
  closing_info: DynamicClosingDateInfo;
  status: OpportunityLifecycleStatus;
  requirements: OpportunityRequirements;
  source: string;                 // e.g. 'Client Request', 'Avorria Network', 'Imported'
  source_reference?: string;      // e.g. 'OPP-89421' or internal reference
  created_at: string;             // Platform timestamp: when entered Avorria
  updated_at: string;             // Platform timestamp: last modified
  is_saved: boolean;              // Specific to requesting contractor
  saved_at?: string;              // Timestamp when contractor saved to watchlist
}

// ─── Contractor Saved Opportunity (Watchlist Record) ───────────────────────────

export interface SavedOpportunityRecord {
  id: string;
  contractor_organisation_id: string;
  opportunity_id: string;
  user_id: string;
  notes?: string;
  created_at: string;
}

// ─── Summary Counts ───────────────────────────────────────────────────────────

export interface DiscoverSummaryCounts {
  all: number;
  open: number;
  closing_soon: number;
  new: number;                    // Published in last 7 days
  saved: number;                  // Saved by this contractor
  closed: number;
}

// ─── Query & Filtering ────────────────────────────────────────────────────────

export type DiscoverSortOption =
  | 'closing_date'
  | 'published_date'
  | 'buyer'
  | 'title'
  | 'value';

export interface DiscoverQueryInput {
  search?: string;
  trade?: string;
  state?: string;
  status?: string;               // 'all' | 'open' | 'closing_soon' | 'new' | 'saved' | 'closed'
  project_type?: string;
  sector?: string;
  closing_filter?: 'all' | 'today' | 'this_week' | 'this_month';
  sort_by?: DiscoverSortOption;
  sort_direction?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface DiscoverQueryResult {
  opportunities: DiscoverOpportunity[];
  summary: DiscoverSummaryCounts;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
