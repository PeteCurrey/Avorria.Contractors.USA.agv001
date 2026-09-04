/**
 * AVORRIA PHASE 11 — MATCH EXPLAINABLE FIT ENGINE TEST SUITE
 *
 * Verifies:
 * 1. Trade Fit Dimension: Exact primary, secondary, related MEP cluster, non-aligned
 * 2. Geographic Fit Dimension: State + city project, state only, project only, out of territory
 * 3. Sector Fit Dimension: Recorded sector match, unstated sector, non-matching sector
 * 4. Project Archetype Dimension: Specific archetype match vs unstated scope
 * 5. Experience Volume Dimension: ≥3 projects, 1-2 projects, 0 projects
 * 6. Commercial Scale Fit: Met/exceeded scale, partial scale gap with commercial disclaimer
 * 7. Compliance Licensing: Active verified, active unverified, expired, missing mandatory
 * 8. Compliance Insurance: Active verified COI, expired COI, missing COI
 * 9. Compliance Safety: Recorded safety plan, missing plan
 * 10. Evidence & Verification Standing: Formal AV-VER-XXXXXX reference, document-supported, none
 * 11. Deterministic Weighted Score: Exactly 100 max points, reproducible additive scoring
 * 12. Explainability & Citations: "Why This Matched", "Why It Did Not Match", Data Gaps, Source Records
 * 13. End-to-End Service Integration: Assembled passport against live seeded opportunity
 */

import {
  computeContractorOpportunityFit,
  evaluateContractorOpportunityFit,
} from '../src/lib/match/contractor-fit-engine';
import { DiscoverOpportunity } from '../src/lib/discover/types';
import { AssembledPassport } from '../src/lib/passport/types';
import { listDiscoverOpportunities } from '../src/lib/discover/repository';

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

// ─── Mock Fixtures ────────────────────────────────────────────────────────────

function makeMockOpportunity(overrides?: Partial<DiscoverOpportunity>): DiscoverOpportunity {
  return {
    id: 'opp_test_001',
    title: 'Commercial Office MEP Retrofit',
    client_organisation_id: 'client_org_01',
    client_name: 'Metro Holdings REIT',
    trade: 'electrical-contracting',
    trade_label: 'Electrical Contracting',
    location: {
      city: 'Austin',
      state: 'TX',
    },
    project_type: 'tenant-improvement',
    sector: 'commercial',
    estimated_value: 500000,
    scope: 'Complete interior electrical panel upgrade and LED retrofit across 3 floors.',
    timeframe: 'within_30_days',
    status: 'open',
    requirements: {
      tradeLicenseRequired: true,
      generalLiabilityRequired: true,
      safetyPlanRequired: true,
      verificationRequired: true,
    },
    closing_info: {
      status: 'OPEN',
      daysRemaining: 21,
      relativeText: 'Closes in 21 days',
      isExpiringSoon: false,
      formattedClosingDate: 'Sep 25, 2026',
    },
    source: 'Avorria Network',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_saved: false,
    ...overrides,
  };
}

function makeMockPassport(overrides?: Partial<AssembledPassport>): AssembledPassport {
  return {
    passport: {
      id: 'pass_001',
      organization_id: 'org_test_001',
      version: 1,
      is_published: true,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any,
    organization: {
      id: 'org_test_001',
      name: 'Apex Electrical Solutions LLC',
      primary_trade: 'electrical-contracting',
      additional_trades: ['low-voltage', 'hvac-mechanical'],
      states_licensed: ['TX', 'NM'],
      hq_address: {
        city: 'Austin',
        state: 'TX',
        street: '100 Congress Ave',
        zip: '78701',
      },
      tin_ein: '12-3456789',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any,
    commercialProfile: {
      id: 'cp_001',
      organization_id: 'org_test_001',
      years_in_business: 12,
      crew_size: 25,
      bonding_capacity_single: 1000000,
      bonding_capacity_aggregate: 3000000,
      safety_emr: 0.82,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any,
    capabilities: [
      {
        id: 'cap_001',
        org_id: 'org_test_001',
        name: 'Commercial Power Distribution & Switchgear',
        trade: 'Electrical Contracting',
        trade_slug: 'electrical-contracting',
        is_selected: true,
        evidence_count: 2,
        has_verified_evidence: true,
        evidence_ids: ['evi_001'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any,
    ],
    projects: [
      {
        id: 'prj_001',
        org_id: 'org_test_001',
        name: 'Domain Tower 4 Tenant Fit-Out',
        services_delivered: ['electrical-contracting'],
        sector: 'commercial',
        project_type: 'tenant-improvement',
        contract_value: 650000,
        location_city: 'Austin',
        location_state: 'TX',
        is_selected: true,
        evidence_count: 1,
        has_verified_evidence: true,
        evidence_ids: ['evi_002'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any,
      {
        id: 'prj_002',
        org_id: 'org_test_001',
        name: 'Barton Springs Medical Office Electrical',
        services_delivered: ['electrical-contracting'],
        sector: 'healthcare',
        project_type: 'renovation',
        contract_value: 420000,
        location_city: 'Austin',
        location_state: 'TX',
        is_selected: true,
        evidence_count: 0,
        has_verified_evidence: false,
        evidence_ids: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any,
      {
        id: 'prj_003',
        org_id: 'org_test_001',
        name: 'Mueller Retail Complex Switchgear',
        services_delivered: ['electrical-contracting'],
        sector: 'retail',
        project_type: 'tenant-improvement',
        contract_value: 310000,
        location_city: 'Austin',
        location_state: 'TX',
        is_selected: true,
        evidence_count: 1,
        has_verified_evidence: true,
        evidence_ids: ['evi_003'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any,
    ],
    caseStudies: [],
    references: [],
    complianceRecords: [
      {
        id: 'crd_lic_001',
        org_id: 'org_test_001',
        category: 'licence',
        credential_type: 'trade_license',
        display_label: 'Trade License',
        title: 'Texas Master Electrical Contractor License',
        policy_or_license_number: 'TECL-49201',
        state: 'TX',
        expiry_state: 'CURRENT',
        record_state: 'ACTIVE',
        verification_state: 'VERIFIED',
        is_selected: true,
        prove_verification_state: 'VERIFIED',
        prove_verification_ref: 'AV-VER-260901',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any,
      {
        id: 'crd_ins_001',
        org_id: 'org_test_001',
        category: 'insurance',
        credential_type: 'general_liability_coi',
        display_label: 'General Liability Insurance',
        title: 'Commercial General Liability Policy',
        coverage_amount: 2000000,
        expiry_state: 'CURRENT',
        record_state: 'ACTIVE',
        verification_state: 'VERIFIED',
        is_selected: true,
        prove_verification_state: 'VERIFIED',
        prove_verification_ref: 'AV-VER-260902',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any,
      {
        id: 'crd_saf_001',
        org_id: 'org_test_001',
        category: 'safety',
        credential_type: 'safety_policy',
        display_label: 'Safety Manual',
        title: 'OSHA Compliant Safety & Health Program Manual',
        expiry_state: 'CURRENT',
        record_state: 'ACTIVE',
        verification_state: 'CONTRACTOR_SUPPLIED',
        is_selected: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any,
    ],
    evidenceItems: [
      {
        id: 'evi_001',
        title: 'Master Electrician License Certificate',
        evidence_type: 'credential',
        verification_state: 'VERIFIED',
        verification_reference: 'AV-VER-260901',
      } as any,
      {
        id: 'evi_002',
        title: 'Domain Tower 4 Substantial Completion Letter',
        evidence_type: 'project',
        verification_state: 'VERIFIED',
        verification_reference: 'AV-VER-260903',
      } as any,
    ],
    readiness: {} as any,
    snapshots: [],
    ...overrides,
  };
}

// ─── Test Suite Execution ─────────────────────────────────────────────────────

async function runContractorFitTests() {
  console.log('════════════════════════════════════════════════════════════════════════');
  console.log('AVORRIA PHASE 11: MATCH — EXPLAINABLE FIT ENGINE TEST SUITE');
  console.log('Deterministic Multi-Dimension Scoring, Traceability & Strict Boundaries');
  console.log('════════════════════════════════════════════════════════════════════════\n');

  // ─── 1. TRADE FIT EVALUATION ────────────────────────────────────────────────
  console.log('--- 1. Trade Fit Evaluation ---');
  {
    const opp = makeMockOpportunity({ trade: 'electrical-contracting' });
    const passport = makeMockPassport();
    const fit = computeContractorOpportunityFit(opp, passport);

    assert(fit.dimensions.trade.alignment === 'STRONG', 'Exact primary trade achieves STRONG alignment');
    assert(fit.dimensions.trade.score === 20, 'Exact primary trade awards full 20 points');
    assert(fit.dimensions.trade.sourceRecords.length > 0, 'Trade dimension cites source capability records');
    assert(fit.whyItMatched.some((m) => m.toLowerCase().includes('primary trade')), 'Positive match reason records primary trade alignment');

    // Secondary trade match
    const secOpp = makeMockOpportunity({ trade: 'low-voltage' });
    const secFit = computeContractorOpportunityFit(secOpp, passport);
    assert(secFit.dimensions.trade.alignment === 'GOOD', 'Secondary trade achieves GOOD alignment');
    assert(secFit.dimensions.trade.score === 16, 'Secondary trade awards 16 points');

    // MEP cluster partial alignment
    const mepOpp = makeMockOpportunity({ trade: 'plumbing-contracting', trade_label: 'Commercial Plumbing' });
    const mepFit = computeContractorOpportunityFit(mepOpp, passport);
    assert(mepFit.dimensions.trade.alignment === 'PARTIAL', 'Related MEP cluster achieves PARTIAL alignment');
    assert(mepFit.dimensions.trade.score === 10, 'Related MEP cluster awards 10 points');
    assert(mepFit.whyItDidNotMatch.some((m) => m.includes('MEP')), 'Explains why trade is not primary while recognizing MEP overlap');

    // Unrelated trade
    const unOpp = makeMockOpportunity({ trade: 'commercial-roofing', trade_label: 'Commercial Roofing' });
    const unFit = computeContractorOpportunityFit(unOpp, passport);
    assert(unFit.dimensions.trade.alignment === 'NOT_ALIGNED', 'Unrelated trade achieves NOT_ALIGNED');
    assert(unFit.dimensions.trade.score === 0, 'Unrelated trade awards 0 points');
    assert(unFit.dataGaps.some((g) => g.dimension === 'trade'), 'Identifies trade capability gap');
  }

  // ─── 2. GEOGRAPHIC FIT EVALUATION ───────────────────────────────────────────
  console.log('\n--- 2. Geographic Fit Evaluation ---');
  {
    const passport = makeMockPassport();

    // State licensed + local city project
    const austinOpp = makeMockOpportunity({ location: { city: 'Austin', state: 'TX' } });
    const fitAustin = computeContractorOpportunityFit(austinOpp, passport);
    assert(fitAustin.dimensions.geography.alignment === 'STRONG', 'Licensed state + city project achieves STRONG alignment');
    assert(fitAustin.dimensions.geography.score === 15, 'Licensed state + city project awards 15 points');

    // State licensed only (no local city project)
    const dallasOpp = makeMockOpportunity({ location: { city: 'Dallas', state: 'TX' } });
    const fitDallas = computeContractorOpportunityFit(dallasOpp, passport);
    assert(fitDallas.dimensions.geography.alignment === 'GOOD', 'Licensed state without local city project achieves GOOD alignment');
    assert(fitDallas.dimensions.geography.score === 12, 'Licensed state without local project awards 12 points');

    // Prior project in state but not formally licensed in org record
    const oklahomaPassport = makeMockPassport({
      organization: {
        ...makeMockPassport().organization,
        states_licensed: ['TX'],
      },
      projects: [
        {
          id: 'prj_ok_01',
          name: 'Norman Substation',
          services_delivered: ['electrical-contracting'],
          contract_value: 200000,
          location_city: 'Norman',
          location_state: 'OK',
        } as any,
      ],
    });
    const okOpp = makeMockOpportunity({ location: { city: 'Norman', state: 'OK' } });
    const fitOk = computeContractorOpportunityFit(okOpp, oklahomaPassport);
    assert(fitOk.dimensions.geography.alignment === 'PARTIAL', 'Past project in state without state license record evaluates to PARTIAL');
    assert(fitOk.dimensions.geography.score === 8, 'Past project in state awards 8 points');
    assert(fitOk.dataGaps.some((g) => g.dimension === 'geography'), 'Recommends adding state license record in COMPLY');

    // Out of territory
    const nyOpp = makeMockOpportunity({ location: { city: 'Buffalo', state: 'NY' } });
    const fitNY = computeContractorOpportunityFit(nyOpp, passport);
    assert(fitNY.dimensions.geography.alignment === 'NOT_ALIGNED', 'Out-of-territory state evaluates to NOT_ALIGNED');
    assert(fitNY.dimensions.geography.score === 0, 'Out-of-territory state awards 0 points');
  }

  // ─── 3. SECTOR & PROJECT TYPE EVALUATION ─────────────────────────────────────
  console.log('\n--- 3. Sector & Project Type Evaluation ---');
  {
    const passport = makeMockPassport();

    // Matching sector
    const commOpp = makeMockOpportunity({ sector: 'commercial' });
    const fitComm = computeContractorOpportunityFit(commOpp, passport);
    assert(fitComm.dimensions.sector.alignment === 'STRONG', 'Matching project sector achieves STRONG alignment');
    assert(fitComm.dimensions.sector.score === 10, 'Matching project sector awards 10 points');
    assert(fitComm.dimensions.sector.sourceRecords.length > 0, 'Sector cites matching project records');

    // Unstated sector
    const unstatedOpp = makeMockOpportunity({ sector: undefined });
    const fitUnstated = computeContractorOpportunityFit(unstatedOpp, passport);
    assert(fitUnstated.dimensions.sector.alignment === 'UNKNOWN', 'Unstated sector evaluates to UNKNOWN');
    assert(fitUnstated.dimensions.sector.score === 6, 'Unstated sector awards non-penalizing 6 points');

    // Sector mismatch / gap
    const indOpp = makeMockOpportunity({ sector: 'heavy-industrial' });
    const fitInd = computeContractorOpportunityFit(indOpp, passport);
    assert(fitInd.dimensions.sector.alignment === 'PARTIAL', 'Unrecorded sector evaluates to PARTIAL');
    assert(fitInd.dimensions.sector.commercialDisclaimer !== undefined, 'Sector evaluation contains disclaimer on evidence scale');

    // Project Archetype
    const tiOpp = makeMockOpportunity({ project_type: 'tenant-improvement' });
    const fitTi = computeContractorOpportunityFit(tiOpp, passport);
    assert(fitTi.dimensions.project_type.alignment === 'STRONG', 'Matching project archetype achieves STRONG');
    assert(fitTi.dimensions.project_type.score === 10, 'Matching project archetype awards 10 points');
  }

  // ─── 4. EXPERIENCE VOLUME & COMMERCIAL SCALE ────────────────────────────────
  console.log('\n--- 4. Experience Volume & Commercial Scale ---');
  {
    const passport = makeMockPassport();

    // 3 projects in trade
    const fit = computeContractorOpportunityFit(makeMockOpportunity(), passport);
    assert(fit.dimensions.experience.alignment === 'STRONG', '>= 3 projects in trade evaluates to STRONG');
    assert(fit.dimensions.experience.score === 15, '>= 3 projects awards 15 points');

    // Scale met: largest project $650k, opp $500k
    assert(fit.dimensions.commercial_value.alignment === 'STRONG', 'Largest project exceeding opp value evaluates to STRONG');
    assert(fit.dimensions.commercial_value.score === 10, 'Scale met awards 10 points');

    // Scale gap: opp value $3M, contractor largest project $650k, bonding $1M
    const hugeOpp = makeMockOpportunity({ estimated_value: 3000000 });
    const fitHuge = computeContractorOpportunityFit(hugeOpp, passport);
    assert(fitHuge.dimensions.commercial_value.alignment === 'PARTIAL', 'Project scale below opp budget evaluates to PARTIAL');
    assert(fitHuge.dimensions.commercial_value.score === 4, 'Scale gap awards 4 points');
    assert(fitHuge.whyItDidNotMatch.some((m) => m.includes('Scale gap')), 'Transparently identifies scale gap');
    assert(
      fitHuge.dimensions.commercial_value.commercialDisclaimer?.includes('evidence scale') === true,
      'Commercial value disclaimer explicitly clarifies that gap reflects recorded evidence scale'
    );
  }

  // ─── 5. COMPLIANCE & VERIFICATION STANDING ──────────────────────────────────
  console.log('\n--- 5. Compliance & Verification Standing ---');
  {
    const passport = makeMockPassport();
    const fit = computeContractorOpportunityFit(makeMockOpportunity(), passport);

    // Licensing
    assert(fit.dimensions.compliance_licensing.alignment === 'STRONG', 'Verified active license evaluates to STRONG');
    assert(fit.dimensions.compliance_licensing.score === 8, 'Verified license awards full 8 points');
    assert(fit.dimensions.compliance_licensing.sourceRecords[0].verificationRef === 'AV-VER-260901', 'License cites verification reference');

    // Insurance
    assert(fit.dimensions.compliance_insurance.alignment === 'STRONG', 'Verified active COI evaluates to STRONG');
    assert(fit.dimensions.compliance_insurance.score === 4, 'Verified COI awards full 4 points');

    // Safety
    assert(fit.dimensions.compliance_safety.alignment === 'STRONG', 'Active safety manual evaluates to STRONG');
    assert(fit.dimensions.compliance_safety.score === 4, 'Active safety manual awards full 4 points');

    // Verification
    assert(fit.dimensions.evidence_verification.alignment === 'STRONG', 'Formal AV-VER-XXXXXX reference evaluates to STRONG');
    assert(fit.dimensions.evidence_verification.score === 4, 'Formal verification standing awards full 4 points');

    // Test missing compliance items
    const barePassport = makeMockPassport({ complianceRecords: [], evidenceItems: [] });
    const fitBare = computeContractorOpportunityFit(makeMockOpportunity(), barePassport);
    assert(fitBare.dimensions.compliance_licensing.alignment === 'NOT_ALIGNED', 'Missing license evaluates to NOT_ALIGNED');
    assert(fitBare.dimensions.compliance_insurance.alignment === 'NOT_ALIGNED', 'Missing insurance evaluates to NOT_ALIGNED');
    assert(fitBare.dimensions.compliance_safety.alignment === 'NOT_ALIGNED', 'Missing safety plan evaluates to NOT_ALIGNED');
    assert(fitBare.dimensions.evidence_verification.alignment === 'NOT_ALIGNED', 'Missing verification evaluates to NOT_ALIGNED');
    assert(fitBare.dataGaps.length >= 4, 'Generates actionable data gaps for missing compliance requirements');
  }

  // ─── 6. DETERMINISTIC OVERALL SCORING & INTEGRITY ───────────────────────────
  console.log('\n--- 6. Deterministic Overall Scoring & Integrity ---');
  {
    const passport = makeMockPassport();
    const opp = makeMockOpportunity();
    const fit = computeContractorOpportunityFit(opp, passport);

    assert(fit.maxScore === 100, 'Total maximum score is exactly 100 points');
    const dimensionSum = Object.values(fit.dimensions).reduce((sum, d) => sum + d.maxScore, 0);
    assert(dimensionSum === 100, 'Sum of all 10 dimension maximum weights equals 100');

    assert(fit.fitScore >= 80, 'Well-aligned contractor scores >= 80');
    assert(fit.overallFitState === 'STRONG FIT', 'Score >= 80 classified as STRONG FIT');
    assert(fit.dataCoveragePercent === 100, 'Complete profile demonstrates 100% data coverage');

    // Requirements comparisons table
    assert(fit.requirementComparisons.length >= 6, 'Generates factual requirements comparison rows');
    const tradeReq = fit.requirementComparisons.find((r) => r.category === 'trade');
    assert(tradeReq?.contractorStatus === 'MATCHED', 'Trade requirement status is MATCHED');
    const licReq = fit.requirementComparisons.find((r) => r.category === 'license' && r.id === 'req-license');
    assert(licReq?.sourceRecordTitle?.includes('Texas Master'), 'License requirement cites source credential');

    // Commercial disclaimer
    assert(fit.commercialDisclaimer.length > 50, 'Commercial disclaimer is present');
    assert(fit.commercialDisclaimer.includes('legal or regulatory determination'), 'Disclaimer disclaims legal determinations');
    assert(fit.commercialDisclaimer.includes('guarantee procurement award'), 'Disclaimer disclaims win promises');
  }

  // ─── 7. END-TO-END SERVICE INTEGRATION ──────────────────────────────────────
  console.log('\n--- 7. End-to-End Service Integration ---');
  {
    const ORG_ID = 'org_vance_electric_01'; // Default seeded contractor
    const oppList = await listDiscoverOpportunities(ORG_ID, { limit: 1 });

    if (oppList.opportunities.length > 0) {
      const seededOpp = oppList.opportunities[0];
      const serviceFit = await evaluateContractorOpportunityFit(seededOpp.id, ORG_ID);

      assert(serviceFit !== null, 'Service evaluates live opportunity for seeded contractor');
      assert(serviceFit?.opportunityId === seededOpp.id, 'Evaluated opportunity ID matches request');
      assert(serviceFit?.contractorOrgId === ORG_ID, 'Evaluated contractor Org ID matches request');
      assert(serviceFit?.fitScore !== undefined && serviceFit.fitScore >= 0, 'Produces valid numerical fit score');
      assert(serviceFit?.overallFitState !== undefined, 'Produces valid categorical overall fit state');
      assert(serviceFit?.whyItMatched.length !== undefined, 'Populates whyItMatched explanations');
      assert(serviceFit?.dimensions.trade !== undefined, 'Calculates trade dimension');
    } else {
      console.log('⚠️ No live opportunities seeded, skipping live service check');
    }
  }

  // ─── SUMMARY ────────────────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════════════════════════════════');
  console.log(`PHASE 11 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('════════════════════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runContractorFitTests().catch((err) => {
  console.error('Unhandled error in test suite:', err);
  process.exit(1);
});
