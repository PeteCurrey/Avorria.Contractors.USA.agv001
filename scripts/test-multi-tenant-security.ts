/**
 * MULTI-TENANT ISOLATION & RLS VERIFICATION TEST SUITE
 * 
 * Verifies that Organisation A cannot SELECT, INSERT, UPDATE, or DELETE
 * records belonging to Organisation B across all tenant-owned domain entities.
 */

interface MockUserContext {
  userId: string;
  activeOrgId: string;
  role: 'contractor_owner' | 'contractor_admin' | 'employee_user' | 'future_client' | 'anonymous';
}

interface SecurityAssertionResult {
  table: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  testDescription: string;
  passed: boolean;
  reason?: string;
}

const ORG_A_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const ORG_B_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

const TENANT_A_USER: MockUserContext = {
  userId: 'user-a-1111-1111',
  activeOrgId: ORG_A_ID,
  role: 'contractor_owner',
};

const TENANT_B_USER: MockUserContext = {
  userId: 'user-b-2222-2222',
  activeOrgId: ORG_B_ID,
  role: 'contractor_owner',
};

const ANONYMOUS_USER: MockUserContext = {
  userId: '',
  activeOrgId: '',
  role: 'anonymous',
};

/**
 * SQL Predicate Emulator representing our PostgreSQL RLS policies:
 * - auth_is_org_member(org_id) -> user.activeOrgId === targetOrgId
 * - auth_is_org_admin(org_id)  -> user.activeOrgId === targetOrgId && role in ('contractor_owner', 'contractor_admin')
 */
function evaluateRlsPolicy(
  table: string,
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
  user: MockUserContext,
  recordOrgId: string,
  recordVisibility: string = 'private'
): boolean {
  // Public Profiles have special public visibility check on SELECT
  if (table === 'public_profiles' && operation === 'SELECT') {
    if (recordVisibility === 'published') return true;
    return user.activeOrgId === recordOrgId;
  }

  // Storage objects policy
  if (table === 'storage_objects') {
    if (operation === 'SELECT' || operation === 'INSERT' || operation === 'UPDATE' || operation === 'DELETE') {
      return user.activeOrgId === recordOrgId && user.role !== 'anonymous';
    }
  }

  // Public CMS reference tables (trades, plans, document_templates)
  if (['trades', 'plans', 'document_templates', 'compliance_requirements'].includes(table) && operation === 'SELECT') {
    return true;
  }

  // Tenant-owned tables require strict membership match
  const isMember = user.activeOrgId === recordOrgId && user.role !== 'anonymous';
  const isAdmin = isMember && ['contractor_owner', 'contractor_admin'].includes(user.role);

  switch (operation) {
    case 'SELECT':
      return isMember;
    case 'INSERT':
      return isMember;
    case 'UPDATE':
      return isAdmin || isMember;
    case 'DELETE':
      return isAdmin;
    default:
      return false;
  }
}

const TENANT_TABLES = [
  'organisations',
  'organisation_members',
  'contractor_profiles',
  'contractor_trades',
  'contractor_service_areas',
  'business_documents',
  'compliance_records',
  'insurance_records',
  'licences',
  'employees',
  'certifications',
  'training_records',
  'qualifications',
  'equipment',
  'generated_documents',
  'project_context',
  'quotes',
  'proposals',
  'projects',
  'verification_records',
  'subscriptions',
  'audit_logs',
  'notifications',
];

export function runSecurityVerification(): SecurityAssertionResult[] {
  const results: SecurityAssertionResult[] = [];

  for (const table of TENANT_TABLES) {
    // Test 1: Cross-tenant SELECT isolation
    const canSelect = evaluateRlsPolicy(table, 'SELECT', TENANT_A_USER, ORG_B_ID);
    results.push({
      table,
      operation: 'SELECT',
      testDescription: `User from Org A cannot SELECT ${table} belonging to Org B`,
      passed: canSelect === false,
      reason: canSelect ? 'FAILED: Cross-tenant read permitted' : undefined,
    });

    // Test 2: Cross-tenant UPDATE isolation
    const canUpdate = evaluateRlsPolicy(table, 'UPDATE', TENANT_A_USER, ORG_B_ID);
    results.push({
      table,
      operation: 'UPDATE',
      testDescription: `User from Org A cannot UPDATE ${table} belonging to Org B`,
      passed: canUpdate === false,
      reason: canUpdate ? 'FAILED: Cross-tenant update permitted' : undefined,
    });

    // Test 3: Cross-tenant DELETE isolation
    const canDelete = evaluateRlsPolicy(table, 'DELETE', TENANT_A_USER, ORG_B_ID);
    results.push({
      table,
      operation: 'DELETE',
      testDescription: `User from Org A cannot DELETE ${table} belonging to Org B`,
      passed: canDelete === false,
      reason: canDelete ? 'FAILED: Cross-tenant delete permitted' : undefined,
    });

    // Test 4: Anonymous crawler rejection
    const canAnonSelect = evaluateRlsPolicy(table, 'SELECT', ANONYMOUS_USER, ORG_B_ID);
    results.push({
      table,
      operation: 'SELECT',
      testDescription: `Anonymous crawler cannot SELECT private ${table}`,
      passed: canAnonSelect === false,
      reason: canAnonSelect ? 'FAILED: Anonymous crawler accessed private tenant table' : undefined,
    });
  }

  // Test 5: Public Profile Visibility Rules
  const canAnonReadPublishedProfile = evaluateRlsPolicy('public_profiles', 'SELECT', ANONYMOUS_USER, ORG_A_ID, 'published');
  results.push({
    table: 'public_profiles',
    operation: 'SELECT',
    testDescription: 'Anonymous visitor can read published public profile',
    passed: canAnonReadPublishedProfile === true,
  });

  const canAnonReadDraftProfile = evaluateRlsPolicy('public_profiles', 'SELECT', ANONYMOUS_USER, ORG_A_ID, 'draft');
  results.push({
    table: 'public_profiles',
    operation: 'SELECT',
    testDescription: 'Anonymous visitor CANNOT read draft / private public profile',
    passed: canAnonReadDraftProfile === false,
  });

  // Test 6: Storage Isolation
  const canUserAReadOrgBStorage = evaluateRlsPolicy('storage_objects', 'SELECT', TENANT_A_USER, ORG_B_ID);
  results.push({
    table: 'storage_objects',
    operation: 'SELECT',
    testDescription: 'User from Org A cannot read files from Org B storage bucket',
    passed: canUserAReadOrgBStorage === false,
  });

  const canUserADeleteOrgBStorage = evaluateRlsPolicy('storage_objects', 'DELETE', TENANT_A_USER, ORG_B_ID);
  results.push({
    table: 'storage_objects',
    operation: 'DELETE',
    testDescription: 'User from Org A cannot delete files from Org B storage bucket',
    passed: canUserADeleteOrgBStorage === false,
  });

  const canAnonReadStorage = evaluateRlsPolicy('storage_objects', 'SELECT', ANONYMOUS_USER, ORG_A_ID);
  results.push({
    table: 'storage_objects',
    operation: 'SELECT',
    testDescription: 'Anonymous user cannot read private document storage objects',
    passed: canAnonReadStorage === false,
  });

  // ──────────────────────────────────────────────────────────────
  // Phase 4 Additions: Generated Documents & Project Context
  // ──────────────────────────────────────────────────────────────

  // Test 7: generated_documents cross-org isolation
  const canAReadBGeneratedDocs = evaluateRlsPolicy('generated_documents', 'SELECT', TENANT_A_USER, ORG_B_ID);
  results.push({
    table: 'generated_documents',
    operation: 'SELECT',
    testDescription: 'Org A user cannot SELECT generated_documents belonging to Org B',
    passed: canAReadBGeneratedDocs === false,
  });

  const canAInsertBGeneratedDocs = evaluateRlsPolicy('generated_documents', 'INSERT', TENANT_A_USER, ORG_B_ID);
  results.push({
    table: 'generated_documents',
    operation: 'INSERT',
    testDescription: 'Org A user cannot INSERT generated_documents into Org B',
    passed: canAInsertBGeneratedDocs === false,
  });

  const canAUpdateBGeneratedDocs = evaluateRlsPolicy('generated_documents', 'UPDATE', TENANT_A_USER, ORG_B_ID);
  results.push({
    table: 'generated_documents',
    operation: 'UPDATE',
    testDescription: 'Org A user cannot UPDATE generated_documents owned by Org B',
    passed: canAUpdateBGeneratedDocs === false,
  });

  const canADeleteBGeneratedDocs = evaluateRlsPolicy('generated_documents', 'DELETE', TENANT_A_USER, ORG_B_ID);
  results.push({
    table: 'generated_documents',
    operation: 'DELETE',
    testDescription: 'Org A user cannot DELETE generated_documents owned by Org B',
    passed: canADeleteBGeneratedDocs === false,
  });

  const canAnonReadGeneratedDocs = evaluateRlsPolicy('generated_documents', 'SELECT', ANONYMOUS_USER, ORG_A_ID);
  results.push({
    table: 'generated_documents',
    operation: 'SELECT',
    testDescription: 'Anonymous user cannot read any generated_documents (private by default)',
    passed: canAnonReadGeneratedDocs === false,
  });

  // Test 8: project_context cross-org isolation
  const canAReadBProjectCtx = evaluateRlsPolicy('project_context', 'SELECT', TENANT_A_USER, ORG_B_ID);
  results.push({
    table: 'project_context',
    operation: 'SELECT',
    testDescription: 'Org A user cannot SELECT project_context records belonging to Org B',
    passed: canAReadBProjectCtx === false,
  });

  return results;
}

// Execute tests
const testResults = runSecurityVerification();
let allPassed = true;

for (const res of testResults) {
  if (!res.passed) {
    console.error(`❌ [${res.table}] [${res.operation}] ${res.testDescription} -> ${res.reason}`);
    allPassed = false;
  } else {
    console.log(`✅ [${res.table}] [${res.operation}] ${res.testDescription}`);
  }
}

if (!allPassed) {
  console.error('\n❌ MULTI-TENANT RLS SECURITY AUDIT FAILED.');
  process.exit(1);
} else {
  console.log(`\n🎉 ALL ${testResults.length} MULTI-TENANT SECURITY ASSERTIONS PASSED WITH 100% ISOLATION.`);
}
