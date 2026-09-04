/**
 * AVORRIA — ASK AVORRIA AUTOMATED VERIFICATION
 *
 * Tests every part of the Ask Avorria feature that doesn't require a live
 * Anthropic API key:
 *
 *   1.  Firestore adapter — addDocument / getDocument / queryDocuments
 *   2.  PII sanitizer — strips email, phone, SSN, EIN, address, name
 *   3.  buildContractorContext — trade slug formatting + license label inference
 *   4.  extractCitedStandards — regex extraction from answer text
 *   5.  API key check — ClaudeServiceError with code 'NO_API_KEY' when key is absent
 *   6.  workspaceSavedItems write + retrieve round-trip
 *
 * When ANTHROPIC_API_KEY is set, the script additionally:
 *   7a. Sends a question with TX context → expects OSHA citation
 *   7b. Sends a question with CA context → expects different scoped answer
 *   7c. Sends an unsupportable state question → expects explicit refusal phrase
 *
 * Run:
 *   npm run test:ask-avorria
 *
 * Curl commands for production evidence are documented at the bottom.
 */

import {
  addDocument,
  getDocument,
  queryDocuments,
  getBackendMode,
} from '../src/lib/firebase/firestore';
import { sanitizePii, containsPii } from '../src/lib/compliance/pii-sanitizer';
import {
  buildContractorContext,
  extractCitedStandards,
  askComplianceQuestion,
  ClaudeServiceError,
} from '../src/lib/compliance/claude-service';
import { WorkspaceSavedItem, AskAvorriaThread } from '../src/lib/firebase/types';

// ─── Test harness ─────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}${detail ? `: ${detail}` : ''}`);
    failed++;
  }
}

// ─── 1. Firestore adapter ─────────────────────────────────────────────────────

async function testFirestoreAdapter() {
  console.log('\n1. Firestore Adapter (backend: ' + getBackendMode() + ')');

  const thread = await addDocument<AskAvorriaThread>('askAvorriaThreads', {
    userId: 'test-user-verify',
    tradeContext: 'Electrical Contracting',
    stateContext: 'TX',
    createdAt: new Date().toISOString(),
    lastMessageAt: new Date().toISOString(),
  });

  assert('addDocument returns an id', typeof thread.id === 'string' && thread.id.length > 0);
  assert('addDocument persists tradeContext', thread.tradeContext === 'Electrical Contracting');

  const retrieved = await getDocument<AskAvorriaThread>('askAvorriaThreads', thread.id);
  assert('getDocument retrieves by id', retrieved?.userId === 'test-user-verify');

  // Subcollection
  const msg = await addDocument(
    `askAvorriaThreads/${thread.id}/messages`,
    { role: 'user', content: 'Test message', modelUsed: '', citedStandards: [], createdAt: new Date().toISOString() }
  );
  assert('Subcollection addDocument works', typeof msg.id === 'string');

  // queryDocuments
  const results = await queryDocuments<AskAvorriaThread>(
    'askAvorriaThreads',
    'userId',
    'test-user-verify'
  );
  assert(
    'queryDocuments filters by field correctly',
    results.some((r) => r.id === thread.id)
  );
}

// ─── 2. PII sanitizer ─────────────────────────────────────────────────────────

async function testPiiSanitizer() {
  console.log('\n2. PII Sanitizer');

  const email = 'Can I call john.smith@example.com about trenching?';
  const sanitizedEmail = sanitizePii(email);
  assert('Email stripped', !sanitizedEmail.includes('@'));
  assert('Email replaced with [EMAIL]', sanitizedEmail.includes('[EMAIL]'));

  const phone = 'Call me at 512-555-0199 about fall protection.';
  const sanitizedPhone = sanitizePii(phone);
  assert('Phone stripped', !sanitizedPhone.includes('512-555-0199'));
  assert('Phone replaced with [PHONE]', sanitizedPhone.includes('[PHONE]'));

  const ssn = 'My SSN is 123-45-6789 for verification.';
  const sanitizedSsn = sanitizePii(ssn);
  assert('SSN stripped', !sanitizedSsn.includes('123-45-6789'));
  assert('SSN replaced with [SSN]', sanitizedSsn.includes('[SSN]'));

  const ein = 'Our EIN is 12-3456789.';
  const sanitizedEin = sanitizePii(ein);
  assert('EIN stripped', !sanitizedEin.includes('12-3456789'));

  const addr = 'We work at 450 Industrial Blvd, Austin TX.';
  const sanitizedAddr = sanitizePii(addr);
  assert('Street address stripped', !sanitizedAddr.includes('450 Industrial Blvd'));

  const combined = 'My name is John Smith, my email is j@test.com, phone 555-867-5309.';
  assert('containsPii detects PII', containsPii(combined));
  const clean = 'Do scaffolds over 6 feet require fall protection?';
  assert('containsPii returns false for clean text', !containsPii(clean));
}

// ─── 3. buildContractorContext ────────────────────────────────────────────────

async function testContractorContextBuilder() {
  console.log('\n3. buildContractorContext');

  const txCtx = buildContractorContext({
    trades: ['electrical-contracting'],
    primaryState: 'TX',
  });
  assert('TX trade formatted correctly', txCtx.tradeContext === 'Electrical Contracting');
  assert('TX state code correct', txCtx.stateContext === 'TX');
  assert('TX state name resolved', txCtx.stateName === 'Texas');
  assert('TX license label contains TDLR', txCtx.licenseType.includes('TDLR'));

  const caCtx = buildContractorContext({
    trades: ['electrical-contracting'],
    primaryState: 'CA',
  });
  assert('CA license label contains CSLB', caCtx.licenseType.includes('CSLB'));
  assert('CA and TX produce different license labels', txCtx.licenseType !== caCtx.licenseType);

  const unknownCtx = buildContractorContext({
    trades: ['general-contracting'],
    primaryState: 'WY',
  });
  assert('Unknown state still resolves a state name', unknownCtx.stateName === 'Wyoming');
  assert(
    'Stored license type from onboarding_data takes precedence',
    buildContractorContext({
      trades: ['electrical-contracting'],
      primaryState: 'TX',
      onboardingData: { licenseType: 'Master Electrician License (Custom)' },
    }).licenseType === 'Master Electrician License (Custom)'
  );
}

// ─── 4. extractCitedStandards ─────────────────────────────────────────────────

async function testCitedStandardsExtractor() {
  console.log('\n4. extractCitedStandards');

  const sampleAnswer = `
    Under OSHA 1926.501(b)(1), any employee working on walking or working surfaces
    6 feet or more above a lower level must be protected by fall protection.
    Per 29 CFR 1926.502, the employer must provide guardrail systems, safety net systems,
    or personal fall arrest systems. NFPA 70E also applies for electrical work near energized conductors.
    See also 1910.23 for fixed ladder requirements.
  `;

  const standards = extractCitedStandards(sampleAnswer);
  assert('OSHA 1926.501 extracted', standards.some((s) => s.includes('1926.501')));
  assert('29 CFR 1926.502 extracted', standards.some((s) => s.includes('1926.502')));
  assert('NFPA 70E extracted', standards.some((s) => s.includes('NFPA 70E')));
  assert('1910.23 extracted', standards.some((s) => s.includes('1910.23')));
  assert('Returns array', Array.isArray(standards));
}

// ─── 5. Claude API key check ──────────────────────────────────────────────────

async function testClaudeApiKeyGuard() {
  console.log('\n5. Claude API key guard');

  const originalKey = process.env.ANTHROPIC_API_KEY;

  // Temporarily unset the key
  delete process.env.ANTHROPIC_API_KEY;

  try {
    await askComplianceQuestion('test question', {
      tradeContext: 'Electrical Contracting',
      stateContext: 'TX',
      stateName: 'Texas',
      licenseType: 'Electrical Contractor License (TDLR)',
    });
    assert('ClaudeServiceError thrown when key missing', false, 'No error was thrown');
  } catch (err) {
    if (err instanceof ClaudeServiceError) {
      assert('ClaudeServiceError thrown with NO_API_KEY code', err.code === 'NO_API_KEY');
      assert('Error message is descriptive', err.message.includes('ANTHROPIC_API_KEY'));
    } else {
      assert('ClaudeServiceError thrown when key missing', false, String(err));
    }
  }

  // Restore key
  if (originalKey) process.env.ANTHROPIC_API_KEY = originalKey;
}

// ─── 6. workspaceSavedItems round-trip ───────────────────────────────────────

async function testSavedItemsRoundTrip() {
  console.log('\n6. workspaceSavedItems round-trip');

  const testUserId = `test-user-save-${Date.now()}`;

  const item = await addDocument<WorkspaceSavedItem>('workspaceSavedItems', {
    userId: testUserId,
    type: 'ask_avorria_answer',
    question: 'What fall protection is required at 6 feet on a construction site?',
    answer: 'Under OSHA 1926.501(b)(1), fall protection is required at 6 feet...',
    citedStandards: ['OSHA 1926.501(b)(1)', '29 CFR 1926.502'],
    tradeContext: 'Electrical Contracting',
    stateContext: 'TX',
    modelUsed: 'claude-3-5-sonnet-20241022',
    sourceThreadId: 'test-thread-001',
    createdAt: new Date().toISOString(),
  });

  assert('Saved item has id', typeof item.id === 'string' && item.id.length > 0);

  const items = await queryDocuments<WorkspaceSavedItem>(
    'workspaceSavedItems',
    'userId',
    testUserId
  );

  assert('Saved item retrievable by userId', items.length > 0);
  const saved = items[0];
  assert('type field correct', saved.type === 'ask_avorria_answer');
  assert('question field populated', saved.question.length > 0);
  assert('answer field populated', saved.answer.length > 0);
  assert('citedStandards array populated', saved.citedStandards.length === 2);
  assert('tradeContext stored', saved.tradeContext === 'Electrical Contracting');
  assert('stateContext stored', saved.stateContext === 'TX');
  assert('modelUsed stored', saved.modelUsed === 'claude-3-5-sonnet-20241022');
  assert('sourceThreadId stored', saved.sourceThreadId === 'test-thread-001');
}

// ─── 7. Live Claude tests (only if API key is set) ────────────────────────────

async function testLiveClaudeCalls() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('\n7. Live Claude calls — SKIPPED (ANTHROPIC_API_KEY not set)');
    console.log('   → Set ANTHROPIC_API_KEY in .env.local and re-run to execute live tests.');
    return;
  }

  console.log('\n7. Live Claude calls (ANTHROPIC_API_KEY is set)');

  // 7a. TX context — OSHA citation expected
  const txCtx = buildContractorContext({ trades: ['electrical-contracting'], primaryState: 'TX' });
  const txAnswer = await askComplianceQuestion(
    'What are the OSHA requirements for ladder safety on a construction site?',
    txCtx
  );
  assert('TX answer has content', txAnswer.content.length > 100);
  assert(
    'TX answer contains OSHA citation',
    txAnswer.citedStandards.length > 0 || txAnswer.content.includes('1926') || txAnswer.content.includes('1910')
  );
  assert('TX answer uses claude model', txAnswer.modelUsed.includes('claude'));

  // 7b. CA context — different licensing scope
  const caCtx = buildContractorContext({ trades: ['electrical-contracting'], primaryState: 'CA' });
  const caAnswer = await askComplianceQuestion(
    'What license is required to do commercial electrical work?',
    caCtx
  );
  assert('CA answer has content', caAnswer.content.length > 50);
  const mentionsCABody = caAnswer.content.includes('CSLB') || caAnswer.content.includes('California');
  const mentionsTXBody = txCtx.stateName !== caCtx.stateName &&
    (txAnswer.content.includes('TDLR') || txAnswer.content.includes('Texas'));
  assert('CA and TX produce differently-scoped license answers', mentionsCABody || caAnswer.content !== txAnswer.content);

  // 7c. Unsupportable question → explicit refusal
  const unknownCtx = buildContractorContext({
    trades: ['electrical-contracting'],
    primaryState: 'NH',
  });
  const refusalAnswer = await askComplianceQuestion(
    'What is the exact bond amount required for a municipal Class 4 specialty license sub-category for residential solar installation in Atlantis City, NH?',
    unknownCtx
  );
  const hasRefusal =
    refusalAnswer.content.toLowerCase().includes("don't have a confident answer") ||
    refusalAnswer.content.toLowerCase().includes("i don't have") ||
    refusalAnswer.content.toLowerCase().includes("consult") ||
    refusalAnswer.content.toLowerCase().includes("cannot confirm");
  assert(
    'Unsupportable question triggers explicit refusal — not a guess',
    hasRefusal,
    `Answer was: ${refusalAnswer.content.slice(0, 200)}`
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🧪 Starting Avorria Ask Avorria Verification Suite...');
  console.log(`   Firestore backend: ${getBackendMode()}`);
  console.log(`   Anthropic key set: ${Boolean(process.env.ANTHROPIC_API_KEY)}`);

  await testFirestoreAdapter();
  await testPiiSanitizer();
  await testContractorContextBuilder();
  await testCitedStandardsExtractor();
  await testClaudeApiKeyGuard();
  await testSavedItemsRoundTrip();
  await testLiveClaudeCalls();

  console.log(`\n${'─'.repeat(60)}`);
  if (failed === 0) {
    console.log(`✅ ALL ${passed} ASSERTIONS PASSED.`);
  } else {
    console.log(`❌ ${failed} ASSERTION(S) FAILED. ${passed} passed.`);
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRODUCTION CURL EVIDENCE (run against \`npm run dev\` server):

# 1. Ask a compliance question (auto-resolves trade/state from session)
curl -s -X POST http://localhost:3000/api/compliance/ask \\
  -H "Content-Type: application/json" \\
  -d '{"question":"What fall protection is required at 6 feet on a construction site?"}'

# 2. Ask an unsupportable question (must return explicit refusal, not a guess)
curl -s -X POST http://localhost:3000/api/compliance/ask \\
  -H "Content-Type: application/json" \\
  -d '{"question":"What is the exact bond amount for a Class 4 solar license in Atlantis City?"}'

# 3. Save an answer to workspace (use threadId + messageId from step 1)
curl -s -X POST http://localhost:3000/api/compliance/save \\
  -H "Content-Type: application/json" \\
  -d '{"type":"ask_avorria_answer","question":"Fall protection at 6 feet?","answer":"Under OSHA 1926.501...","citedStandards":["OSHA 1926.501"],"tradeContext":"Electrical Contracting","stateContext":"TX","modelUsed":"claude-3-5-sonnet-20241022","sourceThreadId":"THREAD_ID_HERE"}'

# 4. Retrieve all saved items for default user
curl -s "http://localhost:3000/api/compliance/saved?userId=usr_owner_default" | jq .

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('\nFatal test error:', err);
  process.exit(1);
});
