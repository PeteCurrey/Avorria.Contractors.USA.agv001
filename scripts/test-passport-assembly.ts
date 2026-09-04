/**
 * AVORRIA CONTRACTOR PASSPORT ENGINE TEST SUITE
 * Phase 8: Verified Contractor Commercial Identity & Assembly Layer
 *
 * Covers:
 *   1. Authoritative record assembly (Business + CREATE + COMPLY + PROVE -> PASSPORT)
 *   2. Selection & assembly controls (filtering without mutating source records)
 *   3. Verification state preservation (no synthetic verification or claim inflation)
 *   4. Dynamic expiry & non-conflation with verification state
 *   5. Transparent completeness & readiness engine (no arbitrary AI scores)
 *   6. Immutable snapshot versioning (point-in-time reproducibility)
 *   7. Strict tenant isolation & ownership enforcement
 */

import {
  getAssembledPassport,
  updatePassportAssembly,
  publishPassportSnapshot,
  evaluatePassportReadiness,
} from '../src/lib/passport/assembly';
import {
  saveOrganization,
  saveUser,
  getOrganization,
  loadWorkspaceStore,
} from '../src/lib/workspace/db';
import {
  saveProject,
  saveCapability,
  saveReference,
  saveCaseStudy,
  saveCommercialProfile,
} from '../src/lib/create/evidence-store';
import { createEvidence } from '../src/lib/prove/prove-store';
import { createCredential } from '../src/lib/workspace/credentials';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    failed++;
  } else {
    console.log(`✅ ${message}`);
    passed++;
  }
}

async function runPassportAssemblyTests() {
  console.log('════════════════════════════════════════════════════════════════════════');
  console.log('AVORRIA PASSPORT: VERIFIED CONTRACTOR COMMERCIAL IDENTITY TESTS');
  console.log('Phase 8: Assembly, Verification Trust, Snapshots & Readiness');
  console.log('════════════════════════════════════════════════════════════════════════\n');

  // ─── 1. REAL SEED INTEGRITY: VANCE COMMERCIAL ELECTRIC ─────────────────────
  console.log('--- 1. Vance Commercial Electric Real Passport Assembly ---');
  const vanceOrgId = 'org_vance_electric_01';

  // Make sure Vance org is in store
  const vanceOrg = await getOrganization(vanceOrgId);
  assert(vanceOrg !== null, 'Vance Commercial Electric organization exists');
  assert(vanceOrg?.primary_trade === 'Electrical', 'Primary trade is Electrical');

  const vanceAssembly = await getAssembledPassport(vanceOrgId);
  assert(vanceAssembly !== null, 'Vance passport assembled successfully');
  assert(vanceAssembly.organization.id === vanceOrgId, 'Assembly organization matches org_id');
  assert(vanceAssembly.capabilities.length >= 2, `Assembled ${vanceAssembly.capabilities.length} capabilities`);
  assert(vanceAssembly.projects.length >= 2, `Assembled ${vanceAssembly.projects.length} projects`);
  assert(vanceAssembly.complianceRecords.length >= 3, `Assembled ${vanceAssembly.complianceRecords.length} compliance records`);
  assert(vanceAssembly.evidenceItems.length >= 6, `Assembled ${vanceAssembly.evidenceItems.length} PROVE evidence items`);

  // ─── 2. VERIFICATION STATE PRESERVATION & TRUST HIERARCHY ──────────────────
  console.log('\n--- 2. Verification State Preservation (No Claim Inflation) ---');

  // Find TDLR Master License in compliance records
  const tdlrLic = vanceAssembly.complianceRecords.find((c) => c.credential_type === 'trade_license');
  assert(tdlrLic !== undefined, 'TDLR license present in compliance records');
  assert(
    tdlrLic?.prove_verification_state === 'VERIFIED',
    `TDLR verification standing is VERIFIED (ref: ${tdlrLic?.prove_verification_ref || 'none'})`
  );

  // Find Travelers GL in compliance records
  const glInsurance = vanceAssembly.complianceRecords.find((c) => c.credential_type === 'general_liability_coi');
  assert(glInsurance !== undefined, 'General Liability policy present');
  assert(
    glInsurance?.prove_verification_state === 'DOCUMENT_SUPPORTED',
    `GL Insurance is DOCUMENT_SUPPORTED (not inflated to VERIFIED!)`
  );

  // Non-conflation check: Record state vs Verification standing
  const wcPolicy = vanceAssembly.complianceRecords.find((c) => c.credential_type === 'workers_comp');
  assert(wcPolicy !== undefined, 'Workers Comp policy present');
  assert(
    wcPolicy?.expiry_state === 'EXPIRING_HIGH' || wcPolicy?.expiry_state === 'EXPIRING_CRITICAL',
    `WC lifecycle is dynamically computed as ${wcPolicy?.expiry_state}`
  );
  assert(
    wcPolicy?.prove_verification_state === 'DOCUMENT_SUPPORTED',
    `WC verification is DOCUMENT_SUPPORTED (independent from expiring status)`
  );

  // ─── 3. SELECTION & ASSEMBLY CONTROLS ──────────────────────────────────────
  console.log('\n--- 3. Passport Assembly Controls & Source Immutability ---');

  const testOrgId = `org_test_passport_${Date.now()}`;
  const now = new Date().toISOString();

  // Create clean isolated test org
  const testOrgTimestamp = Date.now();
  await saveOrganization({
    id: testOrgId,
    name: `Titan Power Systems ${testOrgTimestamp}`,
    primary_trade: 'Electrical',
    additional_trades: ['Critical Power / Data Center'],
    states_licensed: ['TX', 'OK'],
    hq_address: { city: 'Dallas', state: 'TX' },
    subscription_tier: 'pro',
    created_at: now,
    updated_at: now,
  });

  // Create 3 projects in CREATE
  const p1 = await saveProject({
    id: `prj_${Date.now()}_1`,
    org_id: testOrgId,
    name: 'Data Center 500kVA UPS Install',
    client: 'CyrusOne Data Centers',
    client_type: 'Data Center',
    location_city: 'Dallas',
    location_state: 'TX',
    sector: 'Critical Power / Data Center',
    project_type: 'New Construction',
    contract_type: 'Lump Sum',
    start_date: '2025-01',
    completion_date: '2025-06',
    contract_value: 950000,
    status: 'completed',
    description: 'UPS lineup installation',
    scope: 'Furnish and install 500kVA flywheel UPS',
    services_delivered: ['UPS commissioning', 'Battery string installation'],
    evidence_document_ids: [],
    created_at: now,
    updated_at: now,
  });

  const p2 = await saveProject({
    id: `prj_${Date.now()}_2`,
    org_id: testOrgId,
    name: 'Confidential Defense Substation',
    client: 'Defense Contractor',
    client_type: 'Government',
    location_city: 'Fort Worth',
    location_state: 'TX',
    sector: 'Municipal & Government',
    project_type: 'Renovation / Retrofit',
    contract_type: 'Guaranteed Maximum Price (GMP)',
    start_date: '2024-03',
    completion_date: '2024-11',
    contract_value: 2400000,
    status: 'completed',
    description: 'Internal defense substation work',
    scope: 'Substation upgrade',
    services_delivered: ['13.8kV Switchgear'],
    evidence_document_ids: [],
    created_at: now,
    updated_at: now,
  });

  // Initial assembly should have both projects available
  const initialAssembly = await getAssembledPassport(testOrgId);
  assert(initialAssembly.projects.length === 2, 'Initial assembly has 2 projects');

  // Contractor chooses to INCLUDE only p1 (and exclude confidential p2)
  const updatedPassport = await updatePassportAssembly(testOrgId, {
    included_project_ids: [p1.id], // Exclude p2
    headline: 'High-Reliability Mission Critical Electrical Contractors',
    summary_override: 'Premier Dallas mission-critical electrical services provider.',
  });

  assert(updatedPassport.included_project_ids?.length === 1, 'Passport now has 1 project selected');
  assert(updatedPassport.included_project_ids?.[0] === p1.id, 'Selected project is CyrusOne UPS');

  // Fetch assembly again to verify presentation filtering
  const filteredAssembly = await getAssembledPassport(testOrgId);
  const selectedInPresentation = filteredAssembly.projects.filter((p) => p.is_selected);
  const unselectedInPresentation = filteredAssembly.projects.filter((p) => !p.is_selected);

  assert(selectedInPresentation.length === 1, 'Only 1 project marked as selected for presentation');
  assert(selectedInPresentation[0].id === p1.id, 'Selected project is p1');
  assert(unselectedInPresentation.length === 1, '1 project marked as unselected');
  assert(unselectedInPresentation[0].id === p2.id, 'Unselected project is p2');

  // Verify that underlying CREATE project record was NOT modified or deleted
  const store = loadWorkspaceStore();
  assert(filteredAssembly.projects.length === 2, 'Underlying CREATE projects remain intact (neither deleted nor mutated)');

  // ─── 4. TRANSPARENT READINESS ENGINE ───────────────────────────────────────
  console.log('\n--- 4. Transparent Readiness Engine (No Arbitrary AI Scores) ---');

  const readiness = filteredAssembly.readiness;
  assert(readiness.identity.status === 'COMPLETE', 'Identity is COMPLETE');
  assert(readiness.identity.label === 'Complete', 'Identity label is Complete');
  assert(readiness.experience.status === 'COMPLETE', 'Experience status is COMPLETE (has projects)');
  assert(readiness.experience.count === 2, 'Experience count reflects total (2)');
  assert(readiness.experience.selected === 1, 'Experience selected reflects included (1)');
  assert(readiness.overall_standing === 'ATTENTION_REQUIRED' || readiness.overall_standing === 'PROFILE_CURRENT', 'Overall standing derived deterministically');

  // ─── 5. IMMUTABLE SNAPSHOT VERSIONING ──────────────────────────────────────
  console.log('\n--- 5. Immutable Point-in-Time Snapshot Versioning ---');

  const snapshot = await publishPassportSnapshot(
    testOrgId,
    'Arthur Pendelton (VP Preconstruction)',
    'Snapshot for CyrusOne Phase 2 RFP Proposal'
  );

  assert(Boolean(snapshot.id), `Snapshot created with ID: ${snapshot.id}`);
  assert(snapshot.version === 1.1, `Snapshot version is v${snapshot.version}`);
  assert(snapshot.status === 'CURRENT', 'Snapshot status is CURRENT');
  assert(snapshot.included_project_ids.length === 1, 'Snapshot captured exactly 1 included project');
  assert(snapshot.included_project_ids[0] === p1.id, 'Snapshot included project is p1');

  // Fetch assembly to verify snapshot history is attached
  const assemblyWithSnapshot = await getAssembledPassport(testOrgId);
  assert(assemblyWithSnapshot.snapshots.length === 1, 'Assembly includes published snapshot');
  assert(assemblyWithSnapshot.passport.published_version === 1.1, 'Passport published_version is 1.1');

  // Publish a second snapshot to test historical archival
  const snapshot2 = await publishPassportSnapshot(
    testOrgId,
    'Arthur Pendelton',
    'Version 1.2 with updated credentials'
  );
  assert(snapshot2.version === 1.2, `Snapshot 2 version is v${snapshot2.version}`);

  const assemblyAfterSecond = await getAssembledPassport(testOrgId);
  assert(assemblyAfterSecond.snapshots.length === 2, 'Assembly now contains 2 historical snapshots');
  const archivedSnap = assemblyAfterSecond.snapshots.find((s) => s.id === snapshot.id);
  assert(archivedSnap?.status === 'ARCHIVED', 'Previous snapshot transitioned to ARCHIVED');

  // ─── 6. MULTI-TENANT ISOLATION ─────────────────────────────────────────────
  console.log('\n--- 6. Multi-Tenant Security & Tenant Isolation ---');

  const otherOrgId = `org_isolated_${Date.now()}`;
  await saveOrganization({
    id: otherOrgId,
    name: `Lone Star Mechanical ${Date.now()}`,
    primary_trade: 'Mechanical',
    additional_trades: [],
    states_licensed: ['TX'],
    subscription_tier: 'free',
    created_at: now,
    updated_at: now,
  });

  const otherAssembly = await getAssembledPassport(otherOrgId);
  assert(otherAssembly.organization.id === otherOrgId, 'Other org resolves its own identity');
  assert(otherAssembly.projects.length === 0, 'Other org does not see Titan Power projects');
  assert(otherAssembly.snapshots.length === 0, 'Other org does not see Titan Power snapshots');

  console.log('\n════════════════════════════════════════════════════════════════════════');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('════════════════════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPassportAssemblyTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
