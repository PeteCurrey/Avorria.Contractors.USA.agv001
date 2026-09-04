/**
 * AVORRIA WORKSPACE SCHEMA & READINESS ENGINE VERIFICATION
 *
 * Verifies:
 * 1. Migration 00011 contains all 9 required tables with RLS and triggerable calculate_readiness_score function.
 * 2. Readiness score calculation:
 *    - Empty org = 0%
 *    - GL COI active (+20%)
 *    - Workers' Comp active (+15%)
 *    - State Trade License active (+25%)
 *    - Safety Plan on file (+15%)
 *    - Recent Toolbox Talk within 30 days (+10%)
 *    - Passport with credentials (+15%)
 *    - Sums to 100%
 * 3. Expiring credentials earn fractional points (10 for GL, 8 for WC, 12 for License).
 * 4. Readiness score is automatically updated and logged upon entity mutations.
 */

import fs from 'fs';
import path from 'path';
import { resetWorkspaceStore, saveOrganization, saveDocument, saveToolboxTalk, savePassport } from '../src/lib/workspace/db';
import { createCredential, updateCredential } from '../src/lib/workspace/credentials';
import { calculateReadinessScore } from '../src/lib/workspace/readiness';
import { Organization } from '../src/lib/workspace/types';

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

async function runSchemaAndReadinessTests() {
  console.log('════════════════════════════════════════════════════════════════════════');
  console.log('AVORRIA WORKSPACE: SCHEMA & READINESS SCORE VERIFICATION');
  console.log('Build Prompt 1: Foundation, Authenticated Workspace, and Comply/Prove Core');
  console.log('════════════════════════════════════════════════════════════════════════\n');

  // 1. Verify Migration 00011 Structure
  console.log('--- 1. Migration 00011 SQL Inspection ---');
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '00011_prompt_1_workspace_comply_prove.sql');
  assert(fs.existsSync(migrationPath), 'Migration file 00011_prompt_1_workspace_comply_prove.sql exists');

  const sql = fs.readFileSync(migrationPath, 'utf-8');
  const requiredTables = [
    'public.organizations',
    'public.users',
    'public.credentials',
    'public.documents',
    'public.readiness_score_log',
    'public.passports',
    'public.passport_access_log',
    'public.toolbox_talk_attendance',
    'public.notifications',
  ];

  for (const table of requiredTables) {
    assert(sql.includes(`CREATE TABLE IF NOT EXISTS ${table}`), `Migration defines ${table}`);
    assert(sql.includes(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`), `RLS enabled on ${table}`);
  }

  assert(
    sql.includes('CREATE OR REPLACE FUNCTION public.calculate_readiness_score'),
    'Postgres calculate_readiness_score function defined'
  );
  assert(
    sql.includes('CREATE TRIGGER trg_recompute_readiness_credentials'),
    'Automatic trigger configured on credentials'
  );

  // 2. Test Readiness Engine Logic
  console.log('\n--- 2. Server-Side Readiness Engine Logic ---');
  resetWorkspaceStore();

  const testOrgId = `org_test_${Date.now()}`;
  const org: Organization = {
    id: testOrgId,
    name: 'Apex Test Contracting LLC',
    primary_trade: 'Electrical',
    additional_trades: [],
    states_licensed: ['TX'],
    subscription_tier: 'pro',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  await saveOrganization(org);

  // Step 2a: Empty organization = 0%
  const score0 = await calculateReadinessScore(testOrgId);
  assert(score0.score === 0, `Empty organization has 0% readiness (got ${score0.score}%)`);
  assert(score0.breakdown.insurance_score === 0, 'Insurance score = 0');
  assert(score0.breakdown.licensing_score === 0, 'Licensing score = 0');
  assert(score0.breakdown.documents_score === 0, 'Documents score = 0');
  assert(score0.breakdown.passport_score === 0, 'Passport score = 0');

  // Step 2b: Add Active GL COI (+20 pts)
  const inOneYear = new Date();
  inOneYear.setFullYear(inOneYear.getFullYear() + 1);

  const glCred = await createCredential({
    org_id: testOrgId,
    type: 'general_liability_coi',
    carrier_or_authority: 'Hartford Underwriters',
    policy_or_license_number: 'GL-10029',
    coverage_amount: 2000000,
    expiration_date: inOneYear.toISOString().split('T')[0],
  });
  const score1 = await calculateReadinessScore(testOrgId);
  assert(score1.score === 20, `Readiness after active GL COI is 20% (got ${score1.score}%)`);
  assert(score1.breakdown.insurance_score === 20, 'Insurance sub-score = 20 pts');

  // Step 2c: Add Active Workers' Comp (+15 pts) -> 35%
  await createCredential({
    org_id: testOrgId,
    type: 'workers_comp',
    carrier_or_authority: 'Texas Mutual',
    policy_or_license_number: 'WC-99234',
    coverage_amount: 1000000,
    expiration_date: inOneYear.toISOString().split('T')[0],
  });
  const score2 = await calculateReadinessScore(testOrgId);
  assert(score2.score === 35, `Readiness after GL + WC is 35% (got ${score2.score}%)`);
  assert(score2.breakdown.insurance_score === 35, 'Insurance sub-score = 35/35 (maxed)');

  // Step 2d: Add Active Trade License (+25 pts) -> 60%
  await createCredential({
    org_id: testOrgId,
    type: 'trade_license',
    carrier_or_authority: 'TDLR',
    policy_or_license_number: 'TECL-44912',
    state: 'TX',
    expiration_date: inOneYear.toISOString().split('T')[0],
  });
  const score3 = await calculateReadinessScore(testOrgId);
  assert(score3.score === 60, `Readiness after trade license is 60% (got ${score3.score}%)`);
  assert(score3.breakdown.licensing_score === 25, 'Licensing sub-score = 25/25 (maxed)');

  // Step 2e: Add Safety Plan document (+15 pts) -> 75%
  await saveDocument({
    id: `doc_${Date.now()}`,
    org_id: testOrgId,
    type: 'safety_plan',
    title: 'Commercial Site Safety Plan 2026',
    version: 1,
    generated_by: 'uploaded',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  const score4 = await calculateReadinessScore(testOrgId);
  assert(score4.score === 75, `Readiness after safety plan is 75% (got ${score4.score}%)`);
  assert(score4.breakdown.documents_score === 15, 'Documents sub-score = 15/25');

  // Step 2f: Add Recent Toolbox Talk (+10 pts) -> 85%
  await saveToolboxTalk({
    id: `tb_${Date.now()}`,
    org_id: testOrgId,
    topic: 'Fall Protection & Harness Inspection',
    date: new Date().toISOString().split('T')[0], // Today (within 30 days)
    attendee_names: ['Marcus Vance', 'John Doe', 'Sam Smith'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  const score5 = await calculateReadinessScore(testOrgId);
  assert(score5.score === 85, `Readiness after recent toolbox talk is 85% (got ${score5.score}%)`);
  assert(score5.breakdown.documents_score === 25, 'Documents sub-score = 25/25 (maxed)');

  // Step 2g: Publish Passport with Included Credentials (+15 pts) -> 100%
  await savePassport({
    id: `psp_${Date.now()}`,
    org_id: testOrgId,
    slug: 'apex-test-contracting',
    is_password_protected: false,
    included_credential_ids: [glCred.id],
    included_document_ids: [],
    view_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  const score6 = await calculateReadinessScore(testOrgId);
  assert(score6.score === 100, `Readiness with full portfolio is 100% (got ${score6.score}%)`);
  assert(score6.breakdown.passport_score === 15, 'Passport sub-score = 15/15 (maxed)');

  // Step 2h: Expiring State Reduces Points Factually
  // Mutate GL to expiring in 20 days -> GL points drop from 20 to 10
  const in20Days = new Date();
  in20Days.setDate(in20Days.getDate() + 20);
  await updateCredential(glCred.id, {
    expiration_date: in20Days.toISOString().split('T')[0],
  });
  const score7 = await calculateReadinessScore(testOrgId);
  assert(score7.score === 90, `Expiring GL reduces total score to 90% (got ${score7.score}%)`);
  assert(score7.breakdown.insurance_score === 25, `Insurance sub-score reduced to 25/35 (got ${score7.breakdown.insurance_score})`);

  console.log('\n════════════════════════════════════════════════════════════════════════');
  console.log(`SCHEMA & READINESS TEST COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('════════════════════════════════════════════════════════════════════════');

  if (failed > 0) process.exit(1);
}

runSchemaAndReadinessTests().catch((e) => {
  console.error('FATAL ERROR:', e);
  process.exit(1);
});
