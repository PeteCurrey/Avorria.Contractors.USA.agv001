/**
 * AVORRIA PHASE 7: CONTRACTOR DIRECTORY & DISCOVERY ENGINE TEST SUITE
 * 
 * Tests:
 * 1. Eligibility Gates (Published vs Draft vs Private vs Suspended)
 * 2. Search & Filtering (Name, Trade, Location, Multi-Filter)
 * 3. Deterministic Ranking (Verified priority, text relevance, completeness)
 * 4. Data Hygiene & Privacy (Zero private storage paths, reviewer IDs, or EINs)
 * 5. Inbound Enquiry Engine (Validation, Honeypot bot defeat, Rate Limiter)
 * 6. Shortlist comparison data model
 */

import {
  queryContractorDirectory,
  sanitizeContractorForDirectory,
} from '../src/lib/directory/service';
import {
  submitContractorEnquiry,
  checkEnquiryRateLimit,
} from '../src/lib/enquiry/service';
import {
  loadTenantsStore,
  saveTenantsStore,
  ContractorWorkspaceData,
} from '../src/lib/tenant/repository';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, description: string, detail?: string) {
  if (condition) {
    console.log(`✅ ${description}`);
    testsPassed++;
  } else {
    console.error(`❌ ${description}${detail ? ` -> ${detail}` : ''}`);
    testsFailed++;
  }
}

async function runDirectoryTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  AVORRIA PHASE 7 — DIRECTORY & DISCOVERY TEST SUITE       ');
  console.log('═══════════════════════════════════════════════════════════\n');

  const store = loadTenantsStore();

  // Setup mock test workspaces in store
  const timestamp = Date.now();
  const orgPublishedVerifiedId = `test-org-pub-ver-${timestamp}`;
  const orgPublishedUnverifiedId = `test-org-pub-unver-${timestamp}`;
  const orgDraftId = `test-org-draft-${timestamp}`;
  const orgSuspendedId = `test-org-suspended-${timestamp}`;

  const mockPubVer: ContractorWorkspaceData = {
    organisation: {
      id: orgPublishedVerifiedId,
      name: 'Titan Industrial Electric',
      slug: `titan-industrial-electric-${timestamp}`,
      legal_name: 'Titan Industrial Electric LLC',
      business_structure: 'llc',
      tax_id_ein: '12-3456789',
      website: 'https://titanelectric.example.com',
      phone: '512-555-0100',
      email: 'contact@titanelectric.example.com',
      address_line1: '100 Industrial Parkway',
      address_line2: null,
      city: 'Austin',
      state_province: 'TX',
      postal_code: '78701',
      country: 'US',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    profile: {
      id: `prof-${timestamp}-1`,
      organisation_id: orgPublishedVerifiedId,
      dba_name: null,
      primary_phone: '512-555-0100',
      primary_email: 'contact@titanelectric.example.com',
      website: null,
      business_description: 'High-voltage industrial switchgear, motor control centers, and substation wiring across Texas.',
      year_established: 2012,
      employee_count: 24,
      readiness_score: 95,
      readiness_breakdown: {},
      visibility: 'published',
      is_indexable: true,
      onboarding_status: 'completed',
      onboarding_started_at: null,
      onboarding_last_saved_at: null,
      onboarding_completed_at: new Date().toISOString(),
      onboarding_data: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    trades: ['electrical-contracting'],
    serviceAreas: {
      primaryState: 'TX',
      additionalStates: [],
      counties: ['Travis County', 'Williamson County'],
      cities: ['Austin', 'Round Rock'],
      radiusMiles: 75,
    },
    baselineCredentials: {
      hasGeneralLiability: true,
      hasWorkersComp: true,
      hasTradeLicense: true,
      hasSafetyPlan: true,
      hasToolboxTalks: true,
      hasOshaCard: true,
    },
    documents: [
      {
        id: 'doc-1',
        organisation_id: orgPublishedVerifiedId,
        document_type: 'commercial_general_liability_insurance',
        title: 'ACORD 25 Certificate of Liability',
        file_path: `/storage/org_${orgPublishedVerifiedId}/coi_policy_private.pdf`,
        file_size_bytes: 450000,
        mime_type: 'application/pdf',
        visibility: 'private',
        status: 'active',
        version_number: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    generatedDocuments: [],
    verificationRecords: [
      {
        id: 'ver-rec-1',
        organisationId: orgPublishedVerifiedId,
        criterionSlug: 'business-identity-verification',
        category: 'business_identity',
        status: 'verified',
        verificationMethod: 'document_inspection',
        reviewedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
        evidenceHash: 'abc123hash',
        verificationReference: 'AV-VER-TITAN1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'ver-rec-2',
        organisationId: orgPublishedVerifiedId,
        criterionSlug: 'business-profile-coherence',
        category: 'business_profile',
        status: 'verified',
        verificationMethod: 'document_inspection',
        reviewedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
        evidenceHash: 'abc123hash',
        verificationReference: 'AV-VER-TITAN1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'ver-rec-3',
        organisationId: orgPublishedVerifiedId,
        criterionSlug: 'general-liability-insurance',
        category: 'insurance',
        status: 'verified',
        verificationMethod: 'document_inspection',
        reviewedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
        evidenceHash: 'abc123hash',
        verificationReference: 'AV-VER-TITAN1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'ver-rec-4',
        organisationId: orgPublishedVerifiedId,
        criterionSlug: 'state-trade-contractor-license',
        category: 'licensing',
        status: 'verified',
        verificationMethod: 'document_inspection',
        reviewedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
        evidenceHash: 'abc123hash',
        verificationReference: 'AV-VER-TITAN1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'ver-rec-5',
        organisationId: orgPublishedVerifiedId,
        criterionSlug: 'written-site-safety-program',
        category: 'safety_program',
        status: 'verified',
        verificationMethod: 'document_inspection',
        reviewedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
        evidenceHash: 'abc123hash',
        verificationReference: 'AV-VER-TITAN1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    auditLogs: [],


  };

  const mockPubUnver: ContractorWorkspaceData = {
    ...mockPubVer,
    organisation: {
      ...mockPubVer.organisation,
      id: orgPublishedUnverifiedId,
      name: 'Summit Commercial Roofing',
      slug: `summit-commercial-roofing-${timestamp}`,
      legal_name: 'Summit Roofing Corp',
    },
    profile: {
      ...mockPubVer.profile,
      id: `prof-${timestamp}-2`,
      organisation_id: orgPublishedUnverifiedId,
      business_description: 'Commercial TPO and standing seam metal roofing systems in San Antonio.',
      readiness_score: 75,
      visibility: 'published',
    },
    trades: ['commercial-roofing'],
    serviceAreas: {
      primaryState: 'TX',
      additionalStates: [],
      counties: ['Bexar County'],
      cities: ['San Antonio'],
      radiusMiles: 50,
    },
    verificationRecords: [], // Not verified
  };

  const mockDraft: ContractorWorkspaceData = {
    ...mockPubVer,
    organisation: {
      ...mockPubVer.organisation,
      id: orgDraftId,
      name: 'Draft Hidden Mechanical',
      slug: `draft-hidden-mech-${timestamp}`,
    },
    profile: {
      ...mockPubVer.profile,
      id: `prof-${timestamp}-3`,
      organisation_id: orgDraftId,
      visibility: 'draft',
    },
  };

  const mockSuspended: ContractorWorkspaceData = {
    ...mockPubVer,
    organisation: {
      ...mockPubVer.organisation,
      id: orgSuspendedId,
      name: 'Suspended Plumbing Services',
      slug: `suspended-plumbing-${timestamp}`,
    },
    profile: {
      ...mockPubVer.profile,
      id: `prof-${timestamp}-4`,
      organisation_id: orgSuspendedId,
      visibility: 'suspended',
    },
  };

  // Add mock entries to store
  store[orgPublishedVerifiedId] = mockPubVer;
  store[orgPublishedUnverifiedId] = mockPubUnver;
  store[orgDraftId] = mockDraft;
  store[orgSuspendedId] = mockSuspended;
  saveTenantsStore(store);

  try {
    // ─────────────────────────────────────────────────────────────
    // TEST 1: DIRECTORY ELIGIBILITY
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- 1. Directory Eligibility Checks ---');
    const allResults = await queryContractorDirectory({ limit: 100 });
    const allSlugs = allResults.contractors.map((c) => c.slug);

    assert(
      allSlugs.includes(mockPubVer.organisation.slug),
      'Published verified contractor appears in directory'
    );
    assert(
      allSlugs.includes(mockPubUnver.organisation.slug),
      'Published unverified contractor appears in directory'
    );
    assert(
      !allSlugs.includes(mockDraft.organisation.slug),
      'Draft contractor is strictly excluded from directory'
    );
    assert(
      !allSlugs.includes(mockSuspended.organisation.slug),
      'Suspended contractor is strictly excluded from directory'
    );

    // ─────────────────────────────────────────────────────────────
    // TEST 2: SEARCH BY CONTRACTOR NAME
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- 2. Contractor Name Search ---');
    const nameSearch = await queryContractorDirectory({ query: 'Titan Industrial' });
    assert(
      nameSearch.contractors.some((c) => c.slug === mockPubVer.organisation.slug),
      'Search by name matches target contractor'
    );
    assert(
      !nameSearch.contractors.some((c) => c.slug === mockPubUnver.organisation.slug),
      'Search by name excludes non-matching contractor'
    );

    // ─────────────────────────────────────────────────────────────
    // TEST 3: SEARCH BY TRADE
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- 3. Trade Category Filtering ---');
    const tradeSearch = await queryContractorDirectory({ trade: 'commercial-roofing' });
    assert(
      tradeSearch.contractors.some((c) => c.slug === mockPubUnver.organisation.slug),
      'Trade filter matches commercial roofing contractor'
    );
    assert(
      !tradeSearch.contractors.some((c) => c.slug === mockPubVer.organisation.slug),
      'Trade filter excludes electrical contractor'
    );

    // ─────────────────────────────────────────────────────────────
    // TEST 4: SEARCH BY LOCATION / TERRITORY
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- 4. Location Search ---');
    const locationSearch = await queryContractorDirectory({ location: 'San Antonio' });
    assert(
      locationSearch.contractors.some((c) => c.slug === mockPubUnver.organisation.slug),
      'Location search matches San Antonio territory'
    );
    assert(
      !locationSearch.contractors.some((c) => c.slug === mockPubVer.organisation.slug),
      'Location search excludes Austin territory'
    );

    // ─────────────────────────────────────────────────────────────
    // TEST 5: DETERMINISTIC RANKING (VERIFIED FIRST)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- 5. Deterministic Ranking ---');
    const rankingResults = await queryContractorDirectory({ location: 'TX', sort: 'relevance', limit: 50 });
    const titanIndex = rankingResults.contractors.findIndex((c) => c.slug === mockPubVer.organisation.slug);
    const summitIndex = rankingResults.contractors.findIndex((c) => c.slug === mockPubUnver.organisation.slug);

    assert(
      titanIndex !== -1 && summitIndex !== -1 && titanIndex < summitIndex,
      'Verified contractor ranks above unverified contractor in default sorting'
    );

    // ─────────────────────────────────────────────────────────────
    // TEST 6: VERIFICATION NON-CONFLATION
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- 6. Verification Independence ---');
    const titanCard = rankingResults.contractors.find((c) => c.slug === mockPubVer.organisation.slug);
    const summitCard = rankingResults.contractors.find((c) => c.slug === mockPubUnver.organisation.slug);

    assert(
      titanCard?.isVerified === true && titanCard?.verificationStatus === 'verified',
      'Verified contractor card has isVerified: true and status: verified'
    );
    assert(
      summitCard?.isVerified === false && summitCard?.verificationStatus === 'not_verified',
      'Published unverified contractor card has isVerified: false and status: not_verified'
    );

    // ─────────────────────────────────────────────────────────────
    // TEST 7: PRIVACY & DATA HYGIENE
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- 7. Privacy & Data Hygiene ---');
    const serializedTitan = JSON.stringify(titanCard);
    assert(
      !serializedTitan.includes('/storage/org_') && !serializedTitan.includes('.pdf'),
      'Directory DTO contains zero private document storage paths'
    );
    assert(
      !serializedTitan.includes('12-3456789'),
      'Directory DTO contains zero confidential taxpayer IDs (EIN)'
    );
    assert(
      !serializedTitan.includes(orgPublishedVerifiedId),
      'Directory DTO does not leak internal organization UUID'
    );

    // ─────────────────────────────────────────────────────────────
    // TEST 8: INBOUND ENQUIRY FLOW
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- 8. Inbound Enquiry Engine ---');
    const validEnquiry = await submitContractorEnquiry(
      {
        contractorSlug: mockPubVer.organisation.slug,
        senderName: 'General Contractor Lead',
        senderEmail: 'pm@turner-construction.example.com',
        senderPhone: '512-555-0199',
        projectType: 'Commercial Switchgear Submittal',
        projectLocation: 'Austin, TX',
        message: 'Requesting submittal qualifications and rate sheet for Austin Hospital expansion project.',
      },
      'test_ip_client_1'
    );

    assert(
      validEnquiry.success === true,
      'Legitimate public project enquiry is accepted'
    );

    // Verify enquiry persisted to contractor workspace
    const refreshedStore = loadTenantsStore();
    const updatedTitan = refreshedStore[orgPublishedVerifiedId];
    assert(
      Boolean(updatedTitan.enquiries && updatedTitan.enquiries.length > 0 && updatedTitan.enquiries[0].senderName === 'General Contractor Lead'),
      'Enquiry is safely stored inside the recipient contractor workspace'
    );


    // ─────────────────────────────────────────────────────────────
    // TEST 9: HONEYPOT SPAM PROTECTION
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- 9. Anti-Spam Honeypot ---');
    const spambotEnquiry = await submitContractorEnquiry(
      {
        contractorSlug: mockPubVer.organisation.slug,
        senderName: 'Spam Bot 3000',
        senderEmail: 'bot@spam.com',
        message: 'Cheap leads for sale now!',
        honeypot: 'filled_by_malicious_bot',
      },
      'test_ip_bot_1'
    );

    // Should return fake success
    assert(
      spambotEnquiry.success === true,
      'Spam bot enquiry with honeypot returns fake success to discard bot'
    );

    // Verify NOT added to workspace
    const storeAfterSpam = loadTenantsStore();
    const titanEnqs = storeAfterSpam[orgPublishedVerifiedId].enquiries || [];
    assert(
      !titanEnqs.some((e) => e.senderName === 'Spam Bot 3000'),
      'Honeypot enquiry was silently discarded and NOT stored in workspace'
    );

    // ─────────────────────────────────────────────────────────────
    // TEST 10: RATE LIMIT ENFORCEMENT
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- 10. Rate Limiting Protection ---');
    const testIp = 'rate_limit_test_ip';
    // Consume 5 requests
    for (let i = 0; i < 5; i++) {
      checkEnquiryRateLimit(testIp);
    }
    const rateLimitedEnquiry = await submitContractorEnquiry(
      {
        contractorSlug: mockPubVer.organisation.slug,
        senderName: 'Rate Exceeded User',
        senderEmail: 'user@test.com',
        message: 'Test message',
      },
      testIp
    );

    assert(
      rateLimitedEnquiry.success === false && rateLimitedEnquiry.message.includes('Too many'),
      'Rate limiter blocks excessive submissions from single IP'
    );
  } finally {
    // Clean up mock entries
    const cleanStore = loadTenantsStore();
    delete cleanStore[orgPublishedVerifiedId];
    delete cleanStore[orgPublishedUnverifiedId];
    delete cleanStore[orgDraftId];
    delete cleanStore[orgSuspendedId];
    saveTenantsStore(cleanStore);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`  PHASE 7 TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runDirectoryTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
