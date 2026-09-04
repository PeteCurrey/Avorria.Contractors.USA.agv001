/**
 * AVORRIA DISCOVER — REPOSITORY & QUERY ENGINE
 * Phase 10: Hermetic persistence for saved opportunities (watchlists)
 * and rich querying over authoritative commercial opportunities.
 *
 * Core Principle:
 *   DISCOVER queries what exists without calculating match scores or eligibility.
 */

import fs from 'fs';
import path from 'path';
import {
  DiscoverOpportunity,
  SavedOpportunityRecord,
  DiscoverSummaryCounts,
  DiscoverQueryInput,
  DiscoverQueryResult,
} from './types';
import { computeClosingDateState } from './closing-engine';
import { loadConnectStore } from '@/lib/connect/repository';
import { Opportunity } from '@/lib/connect/types';
import { STANDARD_TRADES } from '@/lib/trades/registry';

export interface DiscoverStoreData {
  savedOpportunities: SavedOpportunityRecord[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DISCOVER_FILE = path.join(DATA_DIR, 'discover-store.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadDiscoverStore(): DiscoverStoreData {
  ensureDataDir();
  if (!fs.existsSync(DISCOVER_FILE)) {
    const initial: DiscoverStoreData = { savedOpportunities: [] };
    fs.writeFileSync(DISCOVER_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DISCOVER_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      savedOpportunities: parsed.savedOpportunities || [],
    };
  } catch {
    return { savedOpportunities: [] };
  }
}

export function saveDiscoverStore(store: DiscoverStoreData): void {
  ensureDataDir();
  fs.writeFileSync(DISCOVER_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

/**
 * Returns a human-friendly trade name from standard slug.
 */
export function getTradeLabel(tradeSlug: string): string {
  const match = STANDARD_TRADES.find((t) => t.slug === tradeSlug);
  if (match) return match.name;
  return tradeSlug.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Enriches a raw Opportunity with dynamic closing dates and contractor-scoped saved status.
 */
export function enrichToDiscoverOpportunity(
  opp: Opportunity,
  savedMap: Map<string, SavedOpportunityRecord>
): DiscoverOpportunity {
  const targetDate = opp.target_date || (opp as unknown as Record<string, string>).closing_date;
  const closingInfo = computeClosingDateState(targetDate, opp.status);
  const savedRecord = savedMap.get(opp.id);

  return {
    id: opp.id,
    title: opp.title,
    client_organisation_id: opp.client_organisation_id,
    client_name: opp.client_name || 'Commercial Client',
    trade: opp.trade,
    trade_label: getTradeLabel(opp.trade),
    location: opp.location,
    project_type: opp.project_type || 'Commercial Project',
    sector: (opp as unknown as Record<string, string>).sector || 'Commercial',
    estimated_value: (opp as unknown as Record<string, string | number>).estimated_value,
    scope: opp.scope,
    description: (opp as unknown as Record<string, string>).description || opp.scope,
    timeframe: opp.timeframe,
    target_date: targetDate,
    closing_date: targetDate,
    closing_info: closingInfo,
    status: opp.status,
    requirements: opp.requirements || {},
    source: (opp as unknown as Record<string, string>).source || 'Client Direct Request',
    source_reference: (opp as unknown as Record<string, string>).source_reference || `OPP-${opp.id.slice(-6).toUpperCase()}`,
    created_at: opp.created_at,
    updated_at: opp.updated_at,
    is_saved: Boolean(savedRecord),
    saved_at: savedRecord?.created_at,
  };
}

/**
 * Lists commercial opportunities for discovery with server-side filtering,
 * multi-field search, deterministic sorting, and pagination.
 */
export async function listDiscoverOpportunities(
  contractorOrgId: string,
  query: DiscoverQueryInput = {}
): Promise<DiscoverQueryResult> {
  const connectStore = loadConnectStore();
  const discoverStore = loadDiscoverStore();

  // Map contractor's saved records
  const contractorSaved = discoverStore.savedOpportunities.filter(
    (s) => s.contractor_organisation_id === contractorOrgId
  );
  const savedMap = new Map<string, SavedOpportunityRecord>();
  contractorSaved.forEach((s) => savedMap.set(s.opportunity_id, s));

  // Load all opportunities
  const allOpps = connectStore.opportunities || [];

  // Enrich all available opportunities
  const enrichedList: DiscoverOpportunity[] = allOpps.map((opp) =>
    enrichToDiscoverOpportunity(opp, savedMap)
  );

  // Compute summary counts across the entire set for this contractor
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const summary: DiscoverSummaryCounts = {
    all: enrichedList.length,
    open: enrichedList.filter((o) => o.status === 'open' && o.closing_info.status !== 'CLOSED').length,
    closing_soon: enrichedList.filter((o) => o.closing_info.status === 'CLOSING_SOON' || o.closing_info.status === 'CLOSING_TODAY').length,
    new: enrichedList.filter((o) => new Date(o.created_at).getTime() >= sevenDaysAgo).length,
    saved: contractorSaved.length,
    closed: enrichedList.filter((o) => o.status === 'closed' || o.closing_info.status === 'CLOSED').length,
  };

  // Apply filters
  let filtered = [...enrichedList];

  // 1. Text Search (title, client_name, scope, trade, city, state, reference)
  if (query.search && query.search.trim()) {
    const q = query.search.trim().toLowerCase();
    filtered = filtered.filter((o) => {
      const matchTitle = o.title.toLowerCase().includes(q);
      const matchClient = o.client_name.toLowerCase().includes(q);
      const matchScope = o.scope.toLowerCase().includes(q);
      const matchTrade = o.trade.toLowerCase().includes(q) || o.trade_label.toLowerCase().includes(q);
      const matchLocation =
        o.location.city.toLowerCase().includes(q) || o.location.state.toLowerCase().includes(q);
      const matchRef = o.source_reference ? o.source_reference.toLowerCase().includes(q) : false;
      return matchTitle || matchClient || matchScope || matchTrade || matchLocation || matchRef;
    });
  }

  // 2. Trade Filter
  if (query.trade && query.trade !== 'all') {
    filtered = filtered.filter((o) => o.trade === query.trade);
  }

  // 3. State / Location Filter
  if (query.state && query.state !== 'all') {
    filtered = filtered.filter((o) => o.location.state.toUpperCase() === query.state?.toUpperCase());
  }

  // 4. Project Type Filter
  if (query.project_type && query.project_type !== 'all') {
    filtered = filtered.filter((o) => o.project_type === query.project_type);
  }

  // 5. Sector Filter
  if (query.sector && query.sector !== 'all') {
    filtered = filtered.filter((o) => o.sector === query.sector);
  }

  // 6. Status tab filter
  if (query.status && query.status !== 'all') {
    if (query.status === 'open') {
      filtered = filtered.filter((o) => o.status === 'open' && o.closing_info.status !== 'CLOSED');
    } else if (query.status === 'closing_soon') {
      filtered = filtered.filter((o) => o.closing_info.status === 'CLOSING_SOON' || o.closing_info.status === 'CLOSING_TODAY');
    } else if (query.status === 'new') {
      filtered = filtered.filter((o) => new Date(o.created_at).getTime() >= sevenDaysAgo);
    } else if (query.status === 'saved') {
      filtered = filtered.filter((o) => o.is_saved);
    } else if (query.status === 'closed') {
      filtered = filtered.filter((o) => o.status === 'closed' || o.closing_info.status === 'CLOSED');
    }
  }

  // 7. Closing Window Filter
  if (query.closing_filter && query.closing_filter !== 'all') {
    if (query.closing_filter === 'today') {
      filtered = filtered.filter((o) => o.closing_info.status === 'CLOSING_TODAY');
    } else if (query.closing_filter === 'this_week') {
      filtered = filtered.filter(
        (o) => o.closing_info.daysRemaining !== null && o.closing_info.daysRemaining >= 0 && o.closing_info.daysRemaining <= 7
      );
    } else if (query.closing_filter === 'this_month') {
      filtered = filtered.filter(
        (o) => o.closing_info.daysRemaining !== null && o.closing_info.daysRemaining >= 0 && o.closing_info.daysRemaining <= 30
      );
    }
  }

  // 8. Deterministic Sorting
  const sortBy = query.sort_by || 'published_date';
  const sortDirection = query.sort_direction || 'desc';
  const dirMultiplier = sortDirection === 'asc' ? 1 : -1;

  filtered.sort((a, b) => {
    if (sortBy === 'closing_date') {
      // Put records without a closing date at the end
      if (a.closing_info.daysRemaining === null && b.closing_info.daysRemaining === null) return 0;
      if (a.closing_info.daysRemaining === null) return 1;
      if (b.closing_info.daysRemaining === null) return -1;
      return (a.closing_info.daysRemaining - b.closing_info.daysRemaining) * dirMultiplier;
    }
    if (sortBy === 'published_date') {
      return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dirMultiplier;
    }
    if (sortBy === 'buyer') {
      return a.client_name.localeCompare(b.client_name) * dirMultiplier;
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title) * dirMultiplier;
    }
    if (sortBy === 'value') {
      const valA = typeof a.estimated_value === 'number' ? a.estimated_value : 0;
      const valB = typeof b.estimated_value === 'number' ? b.estimated_value : 0;
      return (valA - valB) * dirMultiplier;
    }
    return 0;
  });

  // 9. Pagination
  const page = Math.max(1, query.page || 1);
  const limit = Math.max(1, Math.min(100, query.limit || 20));
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return {
    opportunities: paginated,
    summary,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Retrieves a single opportunity by ID with saved context for the contractor.
 */
export async function getDiscoverOpportunityById(
  opportunityId: string,
  contractorOrgId: string
): Promise<DiscoverOpportunity | null> {
  const connectStore = loadConnectStore();
  const discoverStore = loadDiscoverStore();

  const opp = (connectStore.opportunities || []).find((o) => o.id === opportunityId);
  if (!opp) return null;

  const isSaved = discoverStore.savedOpportunities.some(
    (s) => s.contractor_organisation_id === contractorOrgId && s.opportunity_id === opportunityId
  );
  const savedRecord = discoverStore.savedOpportunities.find(
    (s) => s.contractor_organisation_id === contractorOrgId && s.opportunity_id === opportunityId
  );

  const savedMap = new Map<string, SavedOpportunityRecord>();
  if (savedRecord) savedMap.set(opp.id, savedRecord);

  return enrichToDiscoverOpportunity(opp, savedMap);
}

/**
 * Saves an opportunity to the contractor's watchlist. Idempotent.
 */
export async function saveOpportunityForContractor(
  contractorOrgId: string,
  opportunityId: string,
  userId: string,
  notes?: string
): Promise<SavedOpportunityRecord> {
  const store = loadDiscoverStore();
  const existing = store.savedOpportunities.find(
    (s) => s.contractor_organisation_id === contractorOrgId && s.opportunity_id === opportunityId
  );

  if (existing) {
    if (notes !== undefined && notes !== existing.notes) {
      existing.notes = notes;
      saveDiscoverStore(store);
    }
    return existing;
  }

  const newRecord: SavedOpportunityRecord = {
    id: `save_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    contractor_organisation_id: contractorOrgId,
    opportunity_id: opportunityId,
    user_id: userId,
    notes,
    created_at: new Date().toISOString(),
  };

  store.savedOpportunities.unshift(newRecord);
  saveDiscoverStore(store);
  return newRecord;
}

/**
 * Removes an opportunity from the contractor's watchlist.
 */
export async function unsaveOpportunityForContractor(
  contractorOrgId: string,
  opportunityId: string
): Promise<boolean> {
  const store = loadDiscoverStore();
  const initialCount = store.savedOpportunities.length;
  store.savedOpportunities = store.savedOpportunities.filter(
    (s) => !(s.contractor_organisation_id === contractorOrgId && s.opportunity_id === opportunityId)
  );

  if (store.savedOpportunities.length !== initialCount) {
    saveDiscoverStore(store);
    return true;
  }
  return false;
}

/**
 * Checks whether an opportunity is saved by a contractor.
 */
export async function isOpportunitySavedByContractor(
  contractorOrgId: string,
  opportunityId: string
): Promise<boolean> {
  const store = loadDiscoverStore();
  return store.savedOpportunities.some(
    (s) => s.contractor_organisation_id === contractorOrgId && s.opportunity_id === opportunityId
  );
}

/**
 * Returns all saved opportunity IDs for a contractor.
 */
export async function getContractorSavedOpportunityIds(
  contractorOrgId: string
): Promise<string[]> {
  const store = loadDiscoverStore();
  return store.savedOpportunities
    .filter((s) => s.contractor_organisation_id === contractorOrgId)
    .map((s) => s.opportunity_id);
}
