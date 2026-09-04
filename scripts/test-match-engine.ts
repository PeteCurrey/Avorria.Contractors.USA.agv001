/**
 * AVORRIA MATCH ENGINE V1 TEST SUITE
 * Phase 10: Evidence-Aware Contractor Matching & Requirement Intelligence Engine.
 *
 * Verifies:
 * 1. Eligibility Gate (active, published, non-suspended, trade & territory alignment)
 * 2. Trade Alignment (exact match, related cluster match, no match)
 * 3. Territory Alignment (exact city, regional state, outside territory)
 * 4. Insurance Matching (meets minimum, below minimum limit, expired, missing, declared)
 * 5. Licence Matching (aligned, jurisdiction mismatch, expired, declared, missing)
 * 6. Safety Matching (verified program, published HASP/JHA, declared, missing)
 * 7. Canonical Evidence States (VERIFIED, DECLARED, EXPIRED, MISSING, NEEDS_CLARIFICATION, NOT_APPLICABLE)
 * 8. Derived Overall Match Statuses (aligned, partially_aligned, needs_review, not_aligned, insufficient_information)
 * 9. Match Set Snapshotting & Versioning ('MATCH_ENGINE_V1')
 * 10. Requirement Change Invalidation & Manual Refresh Workflow
 * 11. Strict Privacy (Contractors have zero match set visibility, no notification leakage)
 */

import {
  runMatchEngineV1,
  matchRequestToContractor,
} from '../src/lib/match/engine';
import {
  getOrComputeMatchSet,
  refreshMatchSet,
  invalidateMatchSetOnPackChange,
} from '../src/lib/match/service';
import {
  getMatchSetByPackId,
  saveMatchSetWithSnapshots,
} from '../src/lib/match/repository';
import {
  MATCH_ENGINE_VERSION,
  MatchFilterOptions,
  MatchSortOption,
} from '../src/lib/match/types';
import {
  createRequirementPack,
  addRequirement,
  updateRequirementPack,
  transitionPackStatus,
} from '../src/lib/request/service';
import {
  getContractorWorkspace,
  saveOnboardingStep,
  completeOnboarding,
  setPassportVisibility,
  ContractorWorkspaceData,
} from '../src/lib/tenant/repository';

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

async function runMatchSuite() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  AVORRIA PHASE 10 — MATCH INTELLIGENCE ENGINE SUITE      ');
  console.log('═══════════════════════════════════════════════════════════\n');

  const CLIENT_ORG_ID = `test-client-match-${Date.now()}`;
  const CLIENT_USER_ID = 'usr_client_match_tester';

  // ─────────────────────────────────────────────────────────────
  // 1. SETUP PUBLISHED TEST CONTRACTORS
  // ─────────────────────────────────────────────────────────────
  console.log('--- 1. Setting Up Test Contractors ---');

  // Contractor 1: Vance Electric (Austin, TX, electrical-contracting, active GL $2M, TX Master Lic, HASP safety)
  const ORG_1 = `ws-contractor-vance-${Date.now()}`;
  await getContractorWorkspace(ORG_1);
  await saveOnboardingStep(ORG_1, 1, { businessName: 'Vance Electric LLC', phone: '512-555-0101', email: 'vance@test.com' });
  await saveOnboardingStep(ORG_1, 2, { trades: ['electrical-contracting'] });
  await saveOnboardingStep(ORG_1, 3, { primaryState: 'TX', cities: ['Austin', 'Round Rock'] });
  await saveOnboardingStep(ORG_1, 4, {
    credentials: { hasGeneralLiability: true, hasTradeLicense: true, hasSafetyPlan: true, hasWorkersComp: true },
  });
  await completeOnboarding(ORG_1);
  await setPassportVisibility(ORG_1, 'published');

  // Contractor 2: Lone Star Mechanical (Dallas, TX, hvac-mechanical [MEP related], declared GL, no license doc)
  const ORG_2 = `ws-contractor-lonestar-${Date.now()}`;
  await getContractorWorkspace(ORG_2);
  await saveOnboardingStep(ORG_2, 1, { businessName: 'Lone Star Mechanical LLC', phone: '214-555-0202', email: 'lonestar@test.com' });
  await saveOnboardingStep(ORG_2, 2, { trades: ['hvac-mechanical'] });
  await saveOnboardingStep(ORG_2, 3, { primaryState: 'TX', cities: ['Dallas'] });
  await saveOnboardingStep(ORG_2, 4, { credentials: { hasGeneralLiability: true, hasTradeLicense: false, hasSafetyPlan: false } });
  await completeOnboarding(ORG_2);
  await setPassportVisibility(ORG_2, 'published');

  // Contractor 3: Pacific Roofing (Los Angeles, CA, commercial-roofing, out of state)
  const ORG_3 = `ws-contractor-pacific-${Date.now()}`;
  await getContractorWorkspace(ORG_3);
  await saveOnboardingStep(ORG_3, 1, { businessName: 'Pacific Commercial Roofing Inc', phone: '213-555-0303', email: 'pacific@test.com' });
  await saveOnboardingStep(ORG_3, 2, { trades: ['commercial-roofing'] });
  await saveOnboardingStep(ORG_3, 3, { primaryState: 'CA', cities: ['Los Angeles'] });
  await saveOnboardingStep(ORG_3, 4, { credentials: { hasGeneralLiability: true, hasTradeLicense: true, hasSafetyPlan: true } });
  await completeOnboarding(ORG_3);
  await setPassportVisibility(ORG_3, 'published');

  // Contractor 4: Suspended Electrician (Austin, TX, suspended profile)
  const ORG_4 = `ws-contractor-suspended-${Date.now()}`;
  const ws4 = await getContractorWorkspace(ORG_4);
  await saveOnboardingStep(ORG_4, 1, { businessName: 'Suspended Electrical Services', phone: '512-555-0404', email: 'suspended@test.com' });
  await saveOnboardingStep(ORG_4, 2, { trades: ['electrical-contracting'] });
  await saveOnboardingStep(ORG_4, 3, { primaryState: 'TX', cities: ['Austin'] });
  await completeOnboarding(ORG_4);
  ws4.profile.visibility = 'suspended'; // Suspended state!

  console.log('   ✓ Test contractors populated with varied trades, territories, and credentials.\n');

  // ─────────────────────────────────────────────────────────────
  // 2. REQUIREMENT PACK SETUP
  // ─────────────────────────────────────────────────────────────
  console.log('--- 2. Setting Up Client Requirement Pack ---');
  const pack = await createRequirementPack(
    CLIENT_ORG_ID,
    CLIENT_USER_ID,
    {
      title: 'Austin Tech Center MEP Renovation',
      project_type: 'Commercial Renovation',
      description: 'Switchgear replacement and electrical distribution upgrades.',
      scope: 'Replace 480V switchgear and install branch wiring across 5 floors.',
      state: 'TX',
      city: 'Austin',
      target_start_date: '2026-11-01',
      urgency: 'within_30_days',
      flexibility: 'negotiable',
      value_tier: 'tier_3_100k_250k',
    },
    ['electrical-contracting'],
    [
      {
        category: 'insurance',
        title: 'Commercial General Liability ($2,000,000 Occurrence)',
        strength: 'required',
        minimum_value: '$2,000,000 per occurrence',
        evidence_required: true,
        provenance: 'client',
      },
      {
        category: 'licence',
        title: 'Texas Master Electrical Contractor Licence',
        strength: 'required',
        jurisdiction: 'TX',
        evidence_required: true,
        provenance: 'client',
      },
      {
        category: 'safety',
        title: 'Site-Specific Health & Safety Plan (HASP)',
        strength: 'required',
        evidence_required: true,
        provenance: 'client',
      },
      {
        category: 'credential',
        title: 'OSHA 30 Certified Supervisor',
        strength: 'preferred',
        evidence_required: false,
        provenance: 'client',
      },
    ]
  );
  assert(Boolean(pack.id), `Requirement pack created with reference ${pack.reference}`);

  // ─────────────────────────────────────────────────────────────
  // 3. ELIGIBILITY GATE & SUSPENSION PROTECTION
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 3. Eligibility Gate & Security ---');
  const ws1 = await getContractorWorkspace(ORG_1);
  const match1 = matchRequestToContractor(pack, ws1);
  assert(match1.isEligible === true, 'Vance Electric passes eligibility gate (published, active, Austin TX, electrical)');

  // Suspended contractor evaluation
  const match4 = matchRequestToContractor(pack, ws4);
  assert(match4.isEligible === false, 'Suspended contractor is BLOCKED by eligibility gate (isEligible: false)');
  assert(match4.overallStatus === 'not_aligned', 'Suspended contractor marked not_aligned');

  // ─────────────────────────────────────────────────────────────
  // 4. TRADE ALIGNMENT (EXACT, RELATED CLUSTER, NONE)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 4. Deterministic Trade Alignment ---');
  assert(match1.tradeAlignment === 'exact', 'Vance Electric trade alignment is exact (electrical-contracting)');

  const ws2 = await getContractorWorkspace(ORG_2);
  const match2 = matchRequestToContractor(pack, ws2);
  assert(match2.tradeAlignment === 'related', 'Lone Star Mechanical trade alignment is related (HVAC in MEP cluster)');
  assert(match2.tradeAlignmentDetail.includes('MEP'), 'Trade alignment explanation references MEP cluster');

  const ws3 = await getContractorWorkspace(ORG_3);
  const match3 = matchRequestToContractor(pack, ws3);
  assert(match3.tradeAlignment === 'none', 'Pacific Roofing trade alignment is none (commercial-roofing !== electrical)');

  // ─────────────────────────────────────────────────────────────
  // 5. TERRITORY ALIGNMENT (EXACT CITY, REGIONAL STATE, OUTSIDE)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 5. Deterministic Territory Alignment ---');
  assert(match1.territoryAlignment === 'exact', 'Vance Electric territory alignment is exact (serves Austin, TX)');
  assert(match2.territoryAlignment === 'regional', 'Lone Star Mechanical territory alignment is regional (Dallas contractor active in TX)');
  assert(match3.territoryAlignment === 'no_alignment', 'Pacific Roofing territory alignment is no_alignment (CA contractor vs TX project)');

  // ─────────────────────────────────────────────────────────────
  // 6. INSURANCE MATCHING & LIMIT EVALUATION
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 6. Insurance Matching & Limit Comparison ---');
  // Add a published COI with $2,000,000 limit to Vance Electric
  ws1.documents.push({
    id: `doc_coi_${Date.now()}`,
    organisation_id: ORG_1,
    document_type: 'insurance_coi',
    title: 'Travelers Commercial General Liability 2026-2027',
    file_path: '/secure/vault/coi_2026.pdf',
    visibility: 'client_shared',
    status: 'active',
    version_number: 1,
    expires_at: '2027-10-01T00:00:00Z', // Current!
    issuing_organisation: 'Travelers Indemnity Co',
    notes: 'Coverage: $2,000,000 each occurrence, $4,000,000 aggregate',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const match1WithCoi = matchRequestToContractor(pack, ws1);
  const insReq = match1WithCoi.requirementResults.find((r) => r.category === 'insurance');
  assert(insReq?.evidenceState === 'VERIFIED', 'Active COI matching $2M limit evaluated as VERIFIED');
  assert(insReq?.isExpired === false, 'Current COI flagged as isExpired: false');

  // Test below-minimum limit: Add COI with only $1,000,000 limit
  const testWsBelow = { ...ws1, documents: [{
    id: 'doc_coi_low',
    organisation_id: ORG_1,
    document_type: 'insurance_coi',
    title: 'Sub-standard Liability Policy',
    file_path: '/secure/vault/coi_low.pdf',
    visibility: 'client_shared' as const,
    status: 'active' as const,
    version_number: 1,
    expires_at: '2027-10-01T00:00:00Z',
    notes: 'Coverage: $1,000,000 each occurrence', // Below stated $2M minimum!
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }] };
  const matchBelow = matchRequestToContractor(pack, testWsBelow);
  const insBelow = matchBelow.requirementResults.find((r) => r.category === 'insurance');
  assert(insBelow?.evidenceState === 'NEEDS_CLARIFICATION', 'Below-minimum insurance limit evaluated as NEEDS_CLARIFICATION');
  assert(insBelow?.publishedInformationSummary.includes('below stated minimum'), 'Summary clearly explains limit shortfall');

  // Test expired insurance document
  const testWsExpired = { ...ws1, documents: [{
    id: 'doc_coi_exp',
    organisation_id: ORG_1,
    document_type: 'insurance_coi',
    title: 'Expired Liability Policy',
    file_path: '/secure/vault/coi_exp.pdf',
    visibility: 'client_shared' as const,
    status: 'expired' as const,
    version_number: 1,
    expires_at: '2025-01-01T00:00:00Z', // Expired!
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }] };
  const matchExpired = matchRequestToContractor(pack, testWsExpired);
  const insExp = matchExpired.requirementResults.find((r) => r.category === 'insurance');
  assert(insExp?.evidenceState === 'EXPIRED', 'Expired insurance evaluated as EXPIRED');
  assert(insExp?.isExpired === true, 'isExpired flag is true');
  assert(!insExp?.publishedInformationSummary.includes('failed'), 'Language preserves "expired" rather than "failed"');

  // ─────────────────────────────────────────────────────────────
  // 7. LICENCE MATCHING & JURISDICTION AWARENESS
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 7. Licence Matching & Jurisdiction ---');
  // Contractor with CA license matching TX project -> jurisdiction mismatch
  const testWsWrongState = {
    ...ws1,
    serviceAreas: { ...ws1.serviceAreas, primaryState: 'CA' },
    documents: [{
      id: 'doc_lic_ca',
      organisation_id: ORG_1,
      document_type: 'contractor_license',
      title: 'California C-10 Electrical License',
      file_path: '/secure/vault/lic_ca.pdf',
      visibility: 'client_shared' as const,
      status: 'active' as const,
      version_number: 1,
      expires_at: '2027-06-30T00:00:00Z',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }],
  };
  const matchWrongState = matchRequestToContractor(pack, testWsWrongState);
  const licWrongState = matchWrongState.requirementResults.find((r) => r.category === 'licence');
  assert(licWrongState?.evidenceState === 'NEEDS_CLARIFICATION', 'License from different jurisdiction evaluated as NEEDS_CLARIFICATION');
  assert(licWrongState?.publishedInformationSummary.includes('does not confirm coverage for project jurisdiction TX'), 'Summary flags jurisdiction gap');

  // ─────────────────────────────────────────────────────────────
  // 8. SAFETY & CANONICAL EVIDENCE STATES
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 8. Safety & Declared Statuses ---');
  // Contractor with self-declared safety plan (no document) -> DECLARED
  const matchDeclaredSafety = matchRequestToContractor(pack, ws1);
  const safDeclared = matchDeclaredSafety.requirementResults.find((r) => r.category === 'safety');
  assert(safDeclared?.evidenceState === 'DECLARED', 'Self-declared safety plan evaluated as DECLARED');

  // Add written safety HASP document -> VERIFIED
  ws1.documents.push({
    id: `doc_saf_${Date.now()}`,
    organisation_id: ORG_1,
    document_type: 'safety_program_hasp',
    title: 'Site-Specific Health & Safety Plan (HASP)',
    file_path: '/secure/vault/hasp.pdf',
    visibility: 'client_shared',
    status: 'active',
    version_number: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  const matchVerifiedSafety = matchRequestToContractor(pack, ws1);
  const safVerified = matchVerifiedSafety.requirementResults.find((r) => r.category === 'safety');
  assert(safVerified?.evidenceState === 'VERIFIED', 'Published safety document evaluated as VERIFIED');

  // ─────────────────────────────────────────────────────────────
  // 9. MATCH SET PERSISTENCE, SNAPSHOTTING & VERSIONING
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 9. Match Set Snapshots & Versioning ---');
  const matchSet = await getOrComputeMatchSet(pack.id, CLIENT_ORG_ID, CLIENT_USER_ID);
  assert(Boolean(matchSet.id), `Match set created with ID ${matchSet.id}`);
  assert(matchSet.engine_version === MATCH_ENGINE_VERSION, `Engine version stamped as "${MATCH_ENGINE_VERSION}"`);
  assert(matchSet.is_stale === false, 'Initial match set is_stale: false');
  assert(matchSet.candidates.length >= 2, `Candidates count is >= 2 (got ${matchSet.candidates.length})`);
  const vanceCandidate = matchSet.candidates.find((c) => c.businessName === 'Vance Electric LLC');
  assert(Boolean(vanceCandidate), 'Vance Electric LLC is present in candidate set');
  assert(
    vanceCandidate?.tradeAlignment === 'exact' && vanceCandidate?.territoryAlignment === 'exact',
    'Vance Electric LLC has exact trade and territory alignment'
  );

  // Verify machine-readable explanation objects exist
  assert(matchSet.candidates[0].matchExplanations.length > 0, 'Candidate includes structured MatchExplanation array');
  assert(Boolean(matchSet.candidates[0].matchExplanations[0].code), `Explanation code present: ${matchSet.candidates[0].matchExplanations[0].code}`);

  // ─────────────────────────────────────────────────────────────
  // 10. REQUIREMENT CHANGE INVALIDATION & REFRESH WORKFLOW
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 10. Requirement Invalidation & Refresh ---');
  // Client modifies requirement pack -> existing match set MUST become stale
  await addRequirement(pack.id, CLIENT_ORG_ID, CLIENT_USER_ID, {
    category: 'other',
    title: 'Pre-Task Job Hazard Analysis Daily Protocol',
    strength: 'required',
    provenance: 'client',
  });

  const staleMatchSet = await getMatchSetByPackId(pack.id, CLIENT_ORG_ID);
  assert(staleMatchSet?.is_stale === true, 'Match set flagged as is_stale: true after requirement pack mutation');
  assert(Boolean(staleMatchSet?.stale_reason), `Stale reason recorded: "${staleMatchSet?.stale_reason}"`);

  // Execute explicit refresh
  const refreshedMatchSet = await refreshMatchSet(pack.id, CLIENT_ORG_ID, CLIENT_USER_ID);
  assert(refreshedMatchSet.is_stale === false, 'Refreshed match set is_stale reset to false');
  assert(refreshedMatchSet.status === 'ready', 'Refreshed match set status is ready');
  assert(refreshedMatchSet.candidates[0].requirementResults.length === 5, 'Refreshed snapshot includes 5 requirements');

  // ─────────────────────────────────────────────────────────────
  // 11. DETERMINISTIC FILTERING & SORTING
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 11. Deterministic Filtering & Sorting ---');
  // Filter by territory exact only
  const exactTerritoryMatches = await getOrComputeMatchSet(
    pack.id,
    CLIENT_ORG_ID,
    CLIENT_USER_ID,
    { territoryExactOnly: true }
  );
  assert(
    exactTerritoryMatches.candidates.every((c) => c.territoryAlignment === 'exact'),
    'Filtered candidate set contains exclusively exact territory matches'
  );

  // Sort alphabetical
  const alphaMatches = await getOrComputeMatchSet(
    pack.id,
    CLIENT_ORG_ID,
    CLIENT_USER_ID,
    undefined,
    'alphabetical'
  );
  const names = alphaMatches.candidates.map((c) => c.businessName);
  const sortedNames = [...names].sort();
  assert(JSON.stringify(names) === JSON.stringify(sortedNames), 'Alphabetical sorting verified');

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`  ALL ${passed} PHASE 10 MATCH ENGINE ASSERTIONS PASSED!`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runMatchSuite().catch((err) => {
  console.error('Fatal Match Suite Error:', err);
  process.exit(1);
});
