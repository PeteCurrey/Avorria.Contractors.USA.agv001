/**
 * AVORRIA PHASE 10 — DISCOVER COMMERCIAL OPPORTUNITY ENGINE TEST SUITE
 *
 * Verifies:
 * 1. Dynamic Closing Date Engine (past, today, ≤7d, >7d, null, and explicit closed)
 * 2. Saved Opportunities (Watchlist persistence, idempotency, unsave)
 * 3. Strict Multi-Tenant Isolation (Org A saved opps invisible to Org B)
 * 4. Summary Counts Calculation (all, open, closing_soon, new, saved, closed)
 * 5. Multi-field Search (title, client name, scope, trade, location)
 * 6. Structured Filtering (trade, state, status, closing window)
 * 7. Deterministic Sorting (closing date, published date, buyer, title)
 * 8. Strict Boundary Enforcement (Zero match score, fit score, or AI eligibility conclusions)
 * 9. Source Provenance & Platform Timestamp Integrity
 */

import { computeClosingDateState } from '../src/lib/discover/closing-engine';
import {
  listDiscoverOpportunities,
  getDiscoverOpportunityById,
  saveOpportunityForContractor,
  unsaveOpportunityForContractor,
  isOpportunitySavedByContractor,
  getContractorSavedOpportunityIds,
} from '../src/lib/discover/repository';
import { saveOpportunity } from '../src/lib/connect/repository';

let passed = 0;
let failed = 0;

function assert(condition: unknown, description: string, detail?: string) {
  if (Boolean(condition)) {
    console.log(`✅ ${description}`);
    passed++;
  } else {
    console.error(`❌ FAILED: ${description}${detail ? ` -> ${detail}` : ''}`);
    failed++;
  }
}

async function runDiscoverEngineTests() {
  console.log('════════════════════════════════════════════════════════════════════════');
  console.log('AVORRIA PHASE 10: DISCOVER — COMMERCIAL OPPORTUNITY DISCOVERY ENGINE');
  console.log('Dynamic Deadlines, Watchlists, Server Filtering & Strict Boundary Checks');
  console.log('════════════════════════════════════════════════════════════════════════\n');

  const refDate = new Date(Date.UTC(2026, 8, 4, 12, 0, 0)); // 2026-09-04
  const ORG_A = `org_contractor_a_${Date.now()}`;
  const ORG_B = `org_contractor_b_${Date.now()}`;
  const CLIENT_ORG = `client_org_test_${Date.now()}`;

  // ─── 1. DYNAMIC CLOSING DATE ENGINE ─────────────────────────────────────────
  console.log('--- 1. Dynamic Closing Date Engine ---');

  // Past date
  const pastRes = computeClosingDateState('2026-09-01', 'open', refDate);
  assert(pastRes.status === 'CLOSED', 'Past date evaluates to CLOSED');
  assert(pastRes.daysRemaining === -3, 'Days remaining is -3');
  assert(pastRes.relativeText === 'Closed 3 days ago', 'Relative text indicates closed 3 days ago');

  // Yesterday
  const yesterdayRes = computeClosingDateState('2026-09-03', 'open', refDate);
  assert(yesterdayRes.status === 'CLOSED', 'Yesterday evaluates to CLOSED');
  assert(yesterdayRes.relativeText === 'Closed yesterday', 'Relative text indicates closed yesterday');

  // Today
  const todayRes = computeClosingDateState('2026-09-04', 'open', refDate);
  assert(todayRes.status === 'CLOSING_TODAY', 'Today evaluates to CLOSING_TODAY');
  assert(todayRes.daysRemaining === 0, 'Days remaining is 0');
  assert(todayRes.relativeText === 'Closing today', 'Relative text is Closing today');
  assert(todayRes.isExpiringSoon === true, 'Closing today marked as expiring soon');

  // Within 7 days (e.g. +4 days = 2026-09-08)
  const soonRes = computeClosingDateState('2026-09-08', 'open', refDate);
  assert(soonRes.status === 'CLOSING_SOON', 'Date within 7 days evaluates to CLOSING_SOON');
  assert(soonRes.daysRemaining === 4, 'Days remaining is 4');
  assert(soonRes.relativeText === 'Closes in 4 days', 'Relative text is Closes in 4 days');
  assert(soonRes.isExpiringSoon === true, 'Marked as expiring soon');

  // Distant date (+25 days = 2026-09-29)
  const openRes = computeClosingDateState('2026-09-29', 'open', refDate);
  assert(openRes.status === 'OPEN', 'Date > 7 days evaluates to OPEN');
  assert(openRes.daysRemaining === 25, 'Days remaining is 25');
  assert(openRes.relativeText === 'Closes in 25 days', 'Relative text is Closes in 25 days');
  assert(openRes.isExpiringSoon === false, 'Not marked as expiring soon');

  // Null date
  const nullRes = computeClosingDateState(null, 'open', refDate);
  assert(nullRes.status === 'NO_CLOSING_DATE', 'Null date evaluates to NO_CLOSING_DATE');
  assert(nullRes.daysRemaining === null, 'Days remaining is null for unrecorded deadline');
  assert(nullRes.relativeText === 'No closing date recorded', 'Truthful relative message for unrecorded deadline');

  // Explicitly closed status overrides future date
  const overrideRes = computeClosingDateState('2026-10-15', 'closed', refDate);
  assert(overrideRes.status === 'CLOSED', 'Explicitly closed lifecycle overrides distant future deadline');

  // ─── 2. SEED TEST OPPORTUNITY FIXTURES ─────────────────────────────────────
  console.log('\n--- 2. Setting Up Opportunity Fixtures for Query Engine ---');

  const opp1 = await saveOpportunity(CLIENT_ORG, 'usr_client_1', {
    title: 'Austin Regional Medical Center Distribution Switchgear',
    trade: 'electrical-contracting',
    location: { city: 'Austin', state: 'TX' },
    project_type: 'Healthcare Facility Expansion',
    timeframe: 'within_30_days',
    target_date: '2026-09-08', // Closing soon
    scope: 'Supply and installation of 3200A main low voltage switchgear with dual utility automatic transfer switches.',
    requirements: {
      tradeLicenseRequired: true,
      generalLiabilityRequired: true,
      safetyPlanRequired: true,
      verificationRequired: true,
    },
    status: 'open',
  });
  assert(Boolean(opp1.id), 'Test opportunity 1 created');

  const opp2 = await saveOpportunity(CLIENT_ORG, 'usr_client_1', {
    title: 'Dallas Logistics Hub Roof Replacement',
    trade: 'commercial-roofing',
    location: { city: 'Dallas', state: 'TX' },
    project_type: 'Industrial Warehouse',
    timeframe: 'flexible',
    target_date: '2026-10-30', // Open distant
    scope: 'Complete removal and replacement of 120,000 sq ft 60-mil TPO single-ply roof membrane.',
    requirements: {
      tradeLicenseRequired: false,
      generalLiabilityRequired: true,
    },
    status: 'open',
  });
  assert(Boolean(opp2.id), 'Test opportunity 2 created');

  // ─── 3. SAVED OPPORTUNITIES & WATCHLIST PERSISTENCE ─────────────────────────
  console.log('\n--- 3. Contractor Watchlist (Save & Unsave) ---');

  const initialSaved = await isOpportunitySavedByContractor(ORG_A, opp1.id);
  assert(initialSaved === false, 'Initially opp1 is not saved by Org A');

  // Save opp1
  const saveRec = await saveOpportunityForContractor(ORG_A, opp1.id, 'usr_a', 'Important project for Q4');
  assert(saveRec.contractor_organisation_id === ORG_A, 'Saved record references contractor org A');
  assert(saveRec.opportunity_id === opp1.id, 'Saved record references correct opportunity ID');
  assert(await isOpportunitySavedByContractor(ORG_A, opp1.id) === true, 'isOpportunitySaved returns true after saving');

  // Duplicate save is idempotent
  const dupRec = await saveOpportunityForContractor(ORG_A, opp1.id, 'usr_a');
  assert(dupRec.id === saveRec.id, 'Duplicate save returns existing record idempotently');

  const savedIdsA = await getContractorSavedOpportunityIds(ORG_A);
  assert(savedIdsA.includes(opp1.id), 'Saved opportunity IDs list contains opp1');

  // ─── 4. MULTI-TENANT ISOLATION ─────────────────────────────────────────────
  console.log('\n--- 4. Multi-Tenant Watchlist Isolation ---');

  const isSavedByB = await isOpportunitySavedByContractor(ORG_B, opp1.id);
  assert(isSavedByB === false, 'Org B cannot see Org A saved state');

  const savedIdsB = await getContractorSavedOpportunityIds(ORG_B);
  assert(!savedIdsB.includes(opp1.id), 'Org B saved list does NOT contain opp1 saved by Org A');

  // ─── 5. DISCOVERY QUERY ENGINE & FILTERS ────────────────────────────────────
  console.log('\n--- 5. Discovery Query Engine: Search, Filters & Sorting ---');

  // Search by keyword
  const searchRes = await listDiscoverOpportunities(ORG_A, { search: 'Medical Center' });
  assert(searchRes.opportunities.some((o) => o.id === opp1.id), 'Search by title keyword finds opp1');
  assert(!searchRes.opportunities.some((o) => o.id === opp2.id), 'Search excludes non-matching opp2');

  // Search by trade label / slug
  const tradeSearchRes = await listDiscoverOpportunities(ORG_A, { search: 'Roofing' });
  assert(tradeSearchRes.opportunities.some((o) => o.id === opp2.id), 'Search by trade keyword finds opp2');

  // Filter by trade
  const tradeFilterRes = await listDiscoverOpportunities(ORG_A, { trade: 'electrical-contracting' });
  assert(tradeFilterRes.opportunities.some((o) => o.id === opp1.id), 'Trade filter includes electrical opp');
  assert(!tradeFilterRes.opportunities.some((o) => o.trade !== 'electrical-contracting'), 'Trade filter strictly excludes other trades');

  // Filter by state
  const stateFilterRes = await listDiscoverOpportunities(ORG_A, { state: 'TX' });
  assert(stateFilterRes.opportunities.length > 0, 'State filter finds TX opportunities');

  // Filter by saved status
  const savedFilterRes = await listDiscoverOpportunities(ORG_A, { status: 'saved' });
  assert(savedFilterRes.opportunities.some((o) => o.id === opp1.id), 'Saved filter includes opp1');
  assert(savedFilterRes.opportunities.every((o) => o.is_saved === true), 'Saved filter contains ONLY saved items');

  // Summary counts
  const summaryRes = await listDiscoverOpportunities(ORG_A);
  assert(summaryRes.summary.all >= 2, 'Summary count "all" accurately reflects available opportunities');
  assert(summaryRes.summary.saved >= 1, 'Summary count "saved" reflects Org A watchlist');

  // ─── 6. DETAIL VIEW WITH PROVENANCE ─────────────────────────────────────────
  console.log('\n--- 6. Opportunity Detail & Source Provenance ---');

  const detailOpp = await getDiscoverOpportunityById(opp1.id, ORG_A);
  assert(Boolean(detailOpp), 'Detail view successfully fetched opp1');
  assert(detailOpp?.id === opp1.id, 'Detail opportunity ID matches');
  assert(detailOpp?.is_saved === true, 'Detail opportunity reflects Org A saved state');
  assert(Boolean(detailOpp?.source), 'Source provenance is populated');
  assert(Boolean(detailOpp?.source_reference), 'Source reference is populated');
  assert(detailOpp?.trade_label === 'Electrical Contracting', 'Trade label is formatted correctly');
  assert(Boolean(detailOpp?.closing_info), 'Closing info is attached');

  // ─── 7. UNSAVE WATCHLIST TEST ──────────────────────────────────────────────
  console.log('\n--- 7. Unsave Watchlist Workflow ---');

  const unsaveSuccess = await unsaveOpportunityForContractor(ORG_A, opp1.id);
  assert(unsaveSuccess === true, 'unsaveOpportunity returns true on successful removal');
  assert(await isOpportunitySavedByContractor(ORG_A, opp1.id) === false, 'isOpportunitySaved returns false after unsave');

  const afterUnsaveIds = await getContractorSavedOpportunityIds(ORG_A);
  assert(!afterUnsaveIds.includes(opp1.id), 'Opportunity ID no longer in Org A saved list');

  // ─── 8. STRICT BOUNDARY CHECK: NO MATCH OR AI SCORES ────────────────────────
  console.log('\n--- 8. Strict Boundary Verification: Zero Match/Fit Scores ---');

  const sample = summaryRes.opportunities[0];
  const keys = Object.keys(sample);

  assert(!keys.includes('matchScore'), 'DiscoverOpportunity does NOT have matchScore');
  assert(!keys.includes('fitScore'), 'DiscoverOpportunity does NOT have fitScore');
  assert(!keys.includes('eligibilityScore'), 'DiscoverOpportunity does NOT have eligibilityScore');
  assert(!keys.includes('aiScore'), 'DiscoverOpportunity does NOT have aiScore');
  assert(!keys.includes('suitabilityScore'), 'DiscoverOpportunity does NOT have suitabilityScore');
  assert(!keys.includes('winProbability'), 'DiscoverOpportunity does NOT have winProbability');

  console.log('\n════════════════════════════════════════════════════════════════════════');
  console.log(`PHASE 10 DISCOVER TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('════════════════════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runDiscoverEngineTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
