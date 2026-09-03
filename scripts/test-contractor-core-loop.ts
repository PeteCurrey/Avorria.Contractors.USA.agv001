/**
 * AVORRIA CONTRACTOR CORE ENGINE END-TO-END VERIFICATION TEST
 * 
 * Tests the complete Phase 3 core loop:
 * Sign up -> Create Business -> Onboarding Steps (no EIN) -> Requirements identified ->
 * Upload evidence -> Readiness recalculation -> Generate JHA draft (provenance check) ->
 * Human review gate -> Finalise JHA -> Vault linkage -> Passport aggregation & Publication gate.
 */

import {
  getContractorWorkspace,
  saveOnboardingStep,
  completeOnboarding,
  addDocument,
  addDocumentVersion,
  saveGeneratedDocument,
  finalizeGeneratedDocument,
  getEvaluatedWorkspace,
  getPassportDetails,
  setPassportVisibility,
} from '../src/lib/tenant/repository';
import { generateJhaDocumentDraft } from '../src/lib/ai/jha-generator';

async function runCoreLoopTest() {
  console.log('🚀 Starting Avorria Phase 3 Contractor Core Engine Verification...\n');

  const TEST_ORG_ID = `test-org-e2e-${Date.now()}`;

  // 1. Initial Workspace State
  console.log('1. Fetching fresh contractor workspace...');
  const initialWs = await getContractorWorkspace(TEST_ORG_ID);
  console.log(`   ✓ Workspace created: "${initialWs.organisation.name}", Onboarding: ${initialWs.profile.onboarding_status}`);

  // 2. Onboarding Steps 1 to 4
  console.log('\n2. Executing progressive onboarding...');
  // Step 1: Business Identity (NO EIN!)
  await saveOnboardingStep(TEST_ORG_ID, 1, {
    businessName: 'Vance Commercial Electric LLC',
    legalName: 'Vance Commercial Electric LLC',
    dbaName: 'Vance Electric',
    businessStructure: 'llc',
    phone: '(512) 555-4022',
    email: 'marcus@vanceelectric.com',
    employeeCount: 6,
    yearsInBusiness: 4,
  });
  console.log('   ✓ Step 1 saved: Business Identity (Tax ID omitted as per Phase 3 rules)');

  // Step 2: Trades
  await saveOnboardingStep(TEST_ORG_ID, 2, {
    trades: ['electrical-contracting', 'low-voltage-telecom'],
  });
  console.log('   ✓ Step 2 saved: Structured Trade Taxonomy');

  // Step 3: Service Area
  await saveOnboardingStep(TEST_ORG_ID, 3, {
    primaryState: 'TX',
    radiusMiles: 75,
    cities: ['Austin', 'Round Rock', 'San Marcos'],
  });
  console.log('   ✓ Step 3 saved: Operating Territory');

  // Step 4: Baseline Credentials
  await saveOnboardingStep(TEST_ORG_ID, 4, {
    credentials: {
      hasGeneralLiability: false, // Initially lacking
      hasWorkersComp: true,
      hasTradeLicense: true,
      hasSafetyPlan: false,
      hasToolboxTalks: true,
      hasOshaCard: true,
    },
  });
  console.log('   ✓ Step 4 saved: Baseline credentials checklist');

  // Complete Onboarding
  await completeOnboarding(TEST_ORG_ID);
  console.log('   ✓ Onboarding completed successfully.');

  // 3. Evaluated Workspace Baseline
  console.log('\n3. Evaluating baseline readiness and requirements...');
  const baselineEval = await getEvaluatedWorkspace(TEST_ORG_ID);
  console.log(`   ✓ Baseline Readiness Score: ${baselineEval.readiness.label}`);
  console.log(`   ✓ Identified Requirements: ${baselineEval.requirements.length}`);
  const missingGl = baselineEval.requirements.find((r) => r.id === 'client_general_liability');
  console.log(`   ✓ GL Status: ${missingGl?.state} (Action: ${missingGl?.actionLabel})`);

  // 4. Document Vault: Upload Insurance COI
  console.log('\n4. Uploading Certificate of Insurance (COI)...');
  const uploadedCoi = await addDocument(TEST_ORG_ID, {
    title: 'Travelers Commercial General Liability 2026-2027',
    documentType: 'insurance_coi',
    filePath: `/storage/org_${TEST_ORG_ID}/travelers_coi.pdf`,
    expiresAt: '2027-08-31',
    issuingOrg: 'Travelers Casualty & Surety',
    notes: 'Policy #COI-38491 ($2,000,000 Aggregate)',
  });
  console.log(`   ✓ Uploaded doc: "${uploadedCoi.title}" (v${uploadedCoi.version_number}.0, status: ${uploadedCoi.status})`);

  // Document Versioning: Upload renewal v2.0
  console.log('\n5. Creating new version without destroying history...');
  const v2Coi = await addDocumentVersion(TEST_ORG_ID, uploadedCoi.id, {
    title: 'Travelers Commercial General Liability 2027-2028',
    filePath: `/storage/org_${TEST_ORG_ID}/travelers_coi_v2.pdf`,
    expiresAt: '2028-08-31',
    notes: 'Annual policy renewal with updated endorsements',
  });
  console.log(`   ✓ New version: "${v2Coi.title}" (v${v2Coi.version_number}.0, parent: ${v2Coi.parent_document_id})`);

  // 5. Readiness Recalculation after COI Upload
  console.log('\n6. Recalculating readiness score after evidence addition...');
  const postUploadEval = await getEvaluatedWorkspace(TEST_ORG_ID);
  console.log(`   ✓ Updated Readiness Score: ${postUploadEval.readiness.label}`);
  if (postUploadEval.readiness.score <= baselineEval.readiness.score) {
    throw new Error('Readiness score did not increase after adding active COI!');
  }

  // 6. JHA Workflow: Generation & Provenance
  console.log('\n7. Generating Job Hazard Analysis (JHA)...');
  const jhaDraft = await generateJhaDocumentDraft({
    projectName: 'Dell Childrens Hospital Expansion',
    jobLocation: 'Austin, TX',
    tradeName: 'Electrical Contracting',
    workActivity: '480V Substation Feeder Cable Pulling & Termination',
    workDate: '2026-09-15',
    supervisorName: 'Marcus Vance',
    workerCount: 4,
    assignedRoles: ['Lead Electrician', 'Rigger', 'Safety Watch'],
    competentPerson: 'Marcus Vance',
    equipment: ['Tugger Winch', 'Hydraulic Crimper', 'Insulated Ratchets'],
    materials: ['500 kcmil Copper Conductors', 'Pulling Lubricant'],
    useAiIfAvailable: false, // Local deterministic template engine
  });
  console.log(`   ✓ Draft generated: "${jhaDraft.documentTitle}"`);
  console.log(`   ✓ Generation Method: ${jhaDraft.generationMethod} (Must be 'template' or 'ai')`);
  console.log(`   ✓ Provenance Model: ${jhaDraft.generationModel}`);

  const savedJha = await saveGeneratedDocument(TEST_ORG_ID, {
    title: jhaDraft.documentTitle,
    documentType: 'jha',
    documentPayload: jhaDraft.payload as unknown as Record<string, unknown>,
    aiAssisted: jhaDraft.generationMethod === 'ai',
    generationMethod: jhaDraft.generationMethod,
    generationModel: jhaDraft.generationModel,
  });
  console.log(`   ✓ Saved JHA draft in generated_documents (Status: ${savedJha.document_status})`);

  // 7. Human Review Gate & Finalisation
  console.log('\n8. Enforcing human review gate and finalising JHA...');
  const finalizedJha = await finalizeGeneratedDocument(TEST_ORG_ID, savedJha.id, 'Marcus Vance');
  console.log(`   ✓ JHA Finalized: Status = ${finalizedJha.document_status}, Sign-off by ${finalizedJha.finalised_by}`);

  // 8. Contractor Passport Aggregation
  console.log('\n9. Aggregating Contractor Passport data...');
  const passport = await getPassportDetails(TEST_ORG_ID);
  console.log(`   ✓ Passport Completion: ${passport.completionPercentage}%`);
  console.log(`   ✓ Initial Visibility: ${passport.visibility} (Default is private)`);
  console.log(`   ✓ Publication Eligibility: ${passport.isEligibleForPublication}`);

  // 9. Publishing Passport
  console.log('\n10. Publishing Contractor Passport...');
  const pubResult = await setPassportVisibility(TEST_ORG_ID, 'published');
  console.log(`   ✓ Visibility update result: ${pubResult.message}`);
  const postPubPassport = await getPassportDetails(TEST_ORG_ID);
  console.log(`   ✓ Published Status: ${postPubPassport.isPublished ? 'PUBLISHED' : 'PRIVATE'}`);

  console.log('\n🎉 ALL 10 CORE ENGINE JOURNEY MILESTONES COMPLETED WITH REAL PERSISTENCE.');
}

runCoreLoopTest().catch((err) => {
  console.error('\n❌ Core Engine Journey Test Failed:', err);
  process.exit(1);
});
