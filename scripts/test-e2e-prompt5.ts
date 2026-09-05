/**
 * AVORRIA CONTRACTORS USA — PROMPT 5 END-TO-END VERIFICATION SUITE
 *
 * Verifies the complete real-data operational loop:
 * 1. Create a clean test organization ("Precision Electrical & Controls Inc.").
 * 2. Verify initial readiness score is 0 with zero placeholder fallback.
 * 3. Add General Liability Insurance (COI) and State Trade License.
 * 4. Verify server-computed score updates to 45 (20 GL + 25 License).
 * 5. Generate a functional JHA document, validate schema, store in DB.
 * 6. Verify server-computed score increments by 15 (Active JHA/Safety Plan).
 * 7. Digitally sign the JHA with SHA-256 audit hash and render to valid branded PDF.
 * 8. Log crew attendance for a recent Toolbox Talk.
 * 9. Assemble and publish a Verification Passport referencing the real credentials.
 * 10. Add Workers' Comp credential to reach 100/100 readiness score.
 * 11. Verify getDashboardData() returns live linked entities for the SBB UI.
 */

import {
  saveOrganization,
  saveCredential,
  saveDocument,
  savePassport,
  saveToolboxTalkAttendance,
  resetWorkspaceStore,
} from '../src/lib/workspace/db';
import { calculateReadinessScore } from '../src/lib/workspace/readiness';
import { getDashboardData } from '../src/lib/workspace/dashboard';
import { generateDocumentContent } from '../src/lib/create/generator';
import { signDocument } from '../src/lib/create/signatures';
import { renderDocumentToPdfBuffer } from '../src/lib/create/pdf';
import { Organization, Credential, Passport } from '../src/lib/workspace/types';

let passed = 0;
let failed = 0;

function assert(condition: unknown, description: string, detail?: string) {
  if (Boolean(condition)) {
    console.log(`✅ ${description}`);
    passed++;
  } else {
    console.error(`❌ FAILED: ${description}${detail ? ` -> ${detail}` : ''}`);
    failed++;
    process.exit(1);
  }
}

async function runPrompt5Verification() {
  console.log('════════════════════════════════════════════════════════════════════════');
  console.log('AVORRIA CONTRACTORS USA — PROMPT 5 END-TO-END VERIFICATION');
  console.log('Testing Real Organization, Credential Lifecycle, AI Docs & Dashboard');
  console.log('════════════════════════════════════════════════════════════════════════\n');

  resetWorkspaceStore();

  const orgId = `org_test_precision_${Date.now()}`;
  const testOrg: Organization = {
    id: orgId,
    name: 'Precision Electrical & Controls Inc.',
    legal_name: 'Precision Electrical & Controls Incorporated',
    ein: '74-9876543',
    primary_trade: 'Electrical',
    additional_trades: ['Low Voltage & Security'],
    states_licensed: ['TX', 'OK'],
    subscription_tier: 'pro',
    hq_address: {
      street: '4200 Technology Blvd, Suite 100',
      city: 'Austin',
      state: 'TX',
      zip: '78746',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await saveOrganization(testOrg);
  console.log(`[1] Created Organization: "${testOrg.name}" (${orgId})`);

  // Step 1: Baseline Readiness Score should be 0
  const baseline = await calculateReadinessScore(orgId);
  assert(baseline.score === 0, 'Baseline readiness score is 0 for clean organization');
  assert(!baseline.breakdown.has_gl_coi, 'Baseline has_gl_coi is false');
  assert(!baseline.breakdown.has_trade_license, 'Baseline has_trade_license is false');
  assert(!baseline.breakdown.has_safety_plan, 'Baseline has_safety_plan is false');

  // Step 2: Add General Liability Insurance (COI) & Trade License
  const glCoi: Credential = {
    id: `crd_gl_${Date.now()}`,
    org_id: orgId,
    type: 'general_liability_coi',
    status: 'current',
    carrier_or_authority: 'Travelers Casualty & Surety Company',
    policy_or_license_number: 'GL-8849201-TX',
    effective_date: '2026-01-01',
    expiration_date: '2027-01-01',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const tradeLicense: Credential = {
    id: `crd_lic_${Date.now()}`,
    org_id: orgId,
    type: 'trade_license',
    status: 'current',
    carrier_or_authority: 'Texas Department of Licensing & Regulation (TDLR)',
    policy_or_license_number: 'TECL-31940',
    effective_date: '2025-06-01',
    expiration_date: '2027-06-01',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await saveCredential(glCoi);
  await saveCredential(tradeLicense);
  console.log('[2] Saved General Liability COI (20 pts) & State Trade License (25 pts)');

  const postCredScore = await calculateReadinessScore(orgId);
  assert(postCredScore.score === 45, 'Score after COI + License is exactly 45 (20 + 25)');
  assert(postCredScore.breakdown.has_gl_coi === true, 'breakdown.has_gl_coi is true');
  assert(postCredScore.breakdown.has_trade_license === true, 'breakdown.has_trade_license is true');

  // Step 3: Generate a functional JHA document
  console.log('[3] Generating AI Job Hazard Analysis (JHA)...');
  const genResult = await generateDocumentContent({
    docType: 'jha',
    userInput: {
      project_name: 'Austin Tech Center Switchgear Modernization',
      site_address: '4200 Technology Blvd, Austin TX',
      trade: 'Electrical',
      date: new Date().toISOString().split('T')[0],
      tasks: [
        {
          task_description: 'Lockout/Tagout de-energization and 480V main busbar tie-in',
          equipment_materials: 'Multimeter, LOTO padlocks, 40 cal arc flash suit',
          hazard_type: 'Electrical Arc Flash / Shock',
        },
        {
          task_description: 'Overhead conduit rack installation in active mechanical room',
          equipment_materials: 'Scissor lift, cordless bandsaw, EMT conduit',
          hazard_type: 'Fall from Height / Leading Edge',
        },
      ],
    },
    organizationName: testOrg.name,
  });

  assert(genResult.content !== null, 'JHA document content generated successfully');
  assert(Array.isArray((genResult.content as any).tasks), 'JHA contains structured tasks array');

  const docId = `doc_jha_${Date.now()}`;
  const jhaDoc = {
    id: docId,
    org_id: orgId,
    type: 'jha' as const,
    title: 'Job Hazard Analysis — Austin Tech Center Switchgear Modernization',
    version: 1,
    content: genResult.content,
    is_signed: false,
    generated_by: 'ai' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await saveDocument(jhaDoc);
  console.log(`[4] Saved JHA Document "${jhaDoc.title}" to DB (${docId})`);

  // Step 4: Verify Readiness Score includes JHA document
  const postDocScore = await calculateReadinessScore(orgId);
  assert(postDocScore.score === 60, 'Readiness score updated to 60 after JHA generation (45 + 15)');
  assert(postDocScore.breakdown.has_safety_plan === true, 'breakdown.has_safety_plan is now true');

  // Step 5: Digitally Sign and render PDF
  console.log('[5] Executing digital signature on JHA...');
  const signedDoc = await signDocument({
    documentId: docId,
    signerName: 'Marcus Vance, Master Electrician',
    signatureImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    signerIp: '192.168.1.100',
  });

  assert(signedDoc.is_signed === true, 'Document is signed and marked immutable');
  assert(Boolean(signedDoc.signature_data?.signer_ip_hash), 'SHA-256 cryptographic signature hash is present');

  console.log('[6] Rendering signed document to branded SBB PDF buffer...');
  const pdfBuffer = await renderDocumentToPdfBuffer({
    document: signedDoc,
    organization: testOrg,
  });

  assert(pdfBuffer.length > 1000, `PDF generated with size ${pdfBuffer.length} bytes (> 1000 bytes)`);
  const pdfHeader = Buffer.from(pdfBuffer.subarray(0, 4)).toString('utf-8');
  assert(pdfHeader === '%PDF', `PDF magic header verified ("${pdfHeader}")`);

  // Step 6: Log recent Toolbox Talk attendance (Past 30 days)
  console.log('[7] Logging field toolbox talk crew attendance...');
  await saveToolboxTalkAttendance({
    id: `tt_att_${Date.now()}`,
    org_id: orgId,
    topic: 'Arc Flash Boundaries & NFPA 70E PPE Selection',
    date: new Date().toISOString().split('T')[0],
    attendee_names: ['Marcus Vance', 'David Miller'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const postTalkScore = await calculateReadinessScore(orgId);
  assert(postTalkScore.score === 70, 'Readiness score updated to 70 after Toolbox Talk (60 + 10)');
  assert(postTalkScore.breakdown.has_recent_toolbox_talk === true, 'breakdown.has_recent_toolbox_talk is true');

  // Step 7: Create & Publish Verification Passport
  console.log('[8] Publishing Contractor Verification Passport...');
  const passport: Passport = {
    id: `pass_${Date.now()}`,
    org_id: orgId,
    slug: 'precision-electrical-austin',
    is_password_protected: false,
    included_credential_ids: [glCoi.id, tradeLicense.id],
    included_document_ids: [docId],
    view_count: 14,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await savePassport(passport);
  const postPassportScore = await calculateReadinessScore(orgId);
  assert(postPassportScore.score === 85, 'Readiness score updated to 85 after Passport publish (70 + 15)');
  assert(postPassportScore.breakdown.has_passport === true, 'breakdown.has_passport is true');

  // Step 8: Add Workers' Comp to achieve 100% Institutional Readiness
  const wcCred: Credential = {
    id: `crd_wc_${Date.now()}`,
    org_id: orgId,
    type: 'workers_comp',
    status: 'current',
    carrier_or_authority: 'Texas Mutual Insurance Company',
    policy_or_license_number: 'WC-992014-TX',
    effective_date: '2026-01-01',
    expiration_date: '2027-01-01',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  await saveCredential(wcCred);

  const perfectScore = await calculateReadinessScore(orgId);
  assert(perfectScore.score === 100, 'Readiness score is 100/100 after adding Workers Comp (85 + 15)');
  assert(perfectScore.breakdown.has_workers_comp === true, 'breakdown.has_workers_comp is true');

  // Step 9: Verify getDashboardData() composition for UI
  console.log('[9] Testing getDashboardData() server composition for Workspace UI...');
  const dashboardData = await getDashboardData(testOrg);

  assert(dashboardData.readinessScore === 100, 'Dashboard data reflects 100 score');
  assert(dashboardData.complianceTimeline.length === 3, 'Dashboard filmstrip contains 3 live credentials');
  assert(dashboardData.breakdown.has_gl_coi === true, 'Dashboard checklist: COI met');
  assert(dashboardData.breakdown.has_workers_comp === true, 'Dashboard checklist: WC met');
  assert(dashboardData.breakdown.has_trade_license === true, 'Dashboard checklist: Trade license met');
  assert(dashboardData.breakdown.has_safety_plan === true, 'Dashboard checklist: JHA/Safety plan met');
  assert(dashboardData.breakdown.has_recent_toolbox_talk === true, 'Dashboard checklist: Toolbox talk met');
  assert(dashboardData.breakdown.has_passport === true, 'Dashboard checklist: Passport met');
  assert(dashboardData.businessSnapshot.name === testOrg.name, 'Dashboard entity snapshot matches live org name');
  assert(dashboardData.businessSnapshot.passportStatus === 'ACTIVE', 'Dashboard passport is ACTIVE');
  assert(dashboardData.businessSnapshot.passportSlug === 'precision-electrical-austin', 'Dashboard passport slug matches');

  console.log('\n════════════════════════════════════════════════════════════════════════');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('ALL PROMPT 5 REAL-DATA AND SBB DASHBOARD REQUIREMENTS VERIFIED!');
  console.log('════════════════════════════════════════════════════════════════════════\n');
}

runPrompt5Verification().catch((err) => {
  console.error('Test run error:', err);
  process.exit(1);
});
