/**
 * AVORRIA — PHOTO COMPLIANCE ASSISTANT VERIFICATION
 *
 * Tests the entire Photo Compliance Assistant feature:
 *
 *   1. Image constraint validation:
 *      - Rejection of unsupported MIME types (e.g. text/plain, application/pdf)
 *      - Rejection of oversized files (>10MB)
 *      - Acceptance of valid image formats (JPEG, PNG, WebP, GIF)
 *   2. Private storage path semantics:
 *      - Format: /contractor-photos/{userId}/{uploadId}.{ext}
 *      - Multi-tenant isolation: User B cannot access User A's uploaded photo
 *   3. Vision compliance reasoning:
 *      - Trade, state, and license context injection
 *      - Citing standards inline (OSHA 1926.451, 1926.1053, etc.)
 *      - Hard rule: No bare verdicts ("this is compliant") — must be framed as
 *        "appears to meet / not meet" based on visible evidence
 *      - Declining unverifiable or obscured details
 *   4. Query audit persistence:
 *      - Record written to photoComplianceQueries/{queryId}
 *   5. Save-to-workspace round-trip:
 *      - Written to workspaceSavedItems with type: 'photo_compliance_answer'
 *      - Retrievable by userId with storagePath attached and intact
 *
 * Run:
 *   npx tsx scripts/test-photo-compliance.ts
 */

import {
  saveContractorPhoto,
  getContractorPhoto,
  StorageValidationError,
  StorageSecurityError,
  MAX_PHOTO_SIZE_BYTES,
} from '../src/lib/firebase/storage';
import {
  analyzePhotoCompliance,
  VisionComplianceInput,
} from '../src/lib/compliance/vision-service';
import { buildContractorContext } from '../src/lib/compliance/claude-service';
import { addDocument, queryDocuments } from '../src/lib/firebase/firestore';
import { PhotoComplianceQuery, WorkspaceSavedItem } from '../src/lib/firebase/types';

// Enable test harness for zero-hallucination verification
process.env.COMPLIANCE_TEST_HARNESS = 'true';

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

// ─── 1. Image Constraint Enforcement ──────────────────────────────────────────

async function testImageConstraints() {
  console.log('\n1. Image Constraints Enforcement (Type & Size)');

  const testUserId = 'test_usr_compliance_1';

  // 1a. Wrong file type (text/plain)
  try {
    await saveContractorPhoto({
      userId: testUserId,
      buffer: Buffer.from('This is a text file, not a photo.'),
      mimeType: 'text/plain',
      originalFilename: 'notes.txt',
    });
    assert('Reject invalid MIME type (text/plain)', false, 'Did not reject');
  } catch (err) {
    if (err instanceof StorageValidationError) {
      assert('Reject invalid MIME type with INVALID_TYPE error', err.code === 'INVALID_TYPE');
      assert('Error message mentions allowed formats', err.message.includes('Allowed formats'));
    } else {
      assert('Reject invalid MIME type', false, String(err));
    }
  }

  // 1b. Wrong file type (application/pdf)
  try {
    await saveContractorPhoto({
      userId: testUserId,
      buffer: Buffer.from('%PDF-1.4 simulated pdf document'),
      mimeType: 'application/pdf',
      originalFilename: 'plan.pdf',
    });
    assert('Reject invalid MIME type (application/pdf)', false, 'Did not reject');
  } catch (err) {
    if (err instanceof StorageValidationError) {
      assert('Reject PDF with INVALID_TYPE error', err.code === 'INVALID_TYPE');
    } else {
      assert('Reject PDF', false, String(err));
    }
  }

  // 1c. Oversized file (> 10MB)
  try {
    const oversizedBuffer = Buffer.alloc(MAX_PHOTO_SIZE_BYTES + 1024); // 10MB + 1KB
    await saveContractorPhoto({
      userId: testUserId,
      buffer: oversizedBuffer,
      mimeType: 'image/jpeg',
      originalFilename: 'huge_image.jpg',
    });
    assert('Reject oversized image (>10MB)', false, 'Did not reject');
  } catch (err) {
    if (err instanceof StorageValidationError) {
      assert('Reject oversized file with EXCEEDS_SIZE error', err.code === 'EXCEEDS_SIZE');
      assert('Error message specifies 10 MB limit', err.message.includes('10 MB'));
    } else {
      assert('Reject oversized file', false, String(err));
    }
  }

  // 1d. Valid JPEG image
  const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
  const storedJpeg = await saveContractorPhoto({
    userId: testUserId,
    buffer: validJpeg,
    mimeType: 'image/jpeg',
    originalFilename: 'scaffold_tiein.jpg',
  });
  assert('Save valid JPEG succeeds', typeof storedJpeg.uploadId === 'string');
  assert('Storage path starts with /contractor-photos/{userId}/', storedJpeg.storagePath.startsWith(`/contractor-photos/${testUserId}/`));
  assert('Storage path ends with .jpg', storedJpeg.storagePath.endsWith('.jpg'));

  // 1e. Valid PNG image
  const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const storedPng = await saveContractorPhoto({
    userId: testUserId,
    buffer: validPng,
    mimeType: 'image/png',
    originalFilename: 'panel_fitting.png',
  });
  assert('Save valid PNG succeeds', typeof storedPng.uploadId === 'string');
  assert('Storage path ends with .png', storedPng.storagePath.endsWith('.png'));

  return storedJpeg;
}

// ─── 2. Multi-Tenant Storage Isolation ────────────────────────────────────────

async function testStorageMultiTenantIsolation(userAPhoto: { storagePath: string }) {
  console.log('\n2. Storage Multi-Tenant Isolation & Privacy Rules');

  const userA = 'test_usr_compliance_1';
  const userB = 'test_usr_compliance_2_attacker';

  // 2a. User A can retrieve their own photo
  const retrievedByA = await getContractorPhoto(userA, userAPhoto.storagePath);
  assert('Owning user (User A) can access their photo', retrievedByA !== null);
  assert('Retrieved buffer is intact', retrievedByA?.buffer.length === 10);

  // 2b. User B attempting to access User A's photo is blocked
  try {
    await getContractorPhoto(userB, userAPhoto.storagePath);
    assert('User B blocked from accessing User A photo', false, 'Access was allowed!');
  } catch (err) {
    if (err instanceof StorageSecurityError) {
      assert('User B rejected with StorageSecurityError', true);
      assert('Error message states access denied', err.message.includes('Access denied'));
    } else {
      assert('User B rejected', false, String(err));
    }
  }
}

// ─── 3. Multimodal Vision Compliance Reasoning ────────────────────────────────

async function testVisionComplianceReasoning(userAPhoto: { storagePath: string }) {
  console.log('\n3. Vision Compliance Reasoning (Hard Rules & Citations)');

  const userA = 'test_usr_compliance_1';
  const photo = await getContractorPhoto(userA, userAPhoto.storagePath);
  if (!photo) throw new Error('Photo not found for test');

  const ctx = buildContractorContext({
    trades: ['scaffolding-specialty', 'general-contracting'],
    primaryState: 'TX',
  });

  // 3a. Scaffold tie-in compliance question
  const scaffoldResult = await analyzePhotoCompliance({
    question: 'Is this scaffold tie-in compliant with OSHA 1926?',
    imageBuffer: photo.buffer,
    mimeType: photo.mimeType,
    ctx,
  });

  assert('Vision analysis returns non-empty answer', scaffoldResult.content.length > 50);
  assert('Vision analysis cites OSHA standard (OSHA 1926.451)', scaffoldResult.citedStandards.some((s) => s.includes('1926.451')));
  assert('Answer uses confirmed Claude model', scaffoldResult.modelUsed.includes('claude-3-5-sonnet'));

  // 3b. Hard Rule: Never output language that reads as "this is compliant" as a bare verdict
  const lowerContent = scaffoldResult.content.toLowerCase();
  const hasBareVerdict =
    lowerContent.startsWith('this is compliant') ||
    lowerContent.startsWith('compliant.') ||
    lowerContent.includes('i certify this is compliant');
  assert('Hard rule: No bare verdict "this is compliant"', !hasBareVerdict);

  // Must frame as "appears to meet/not meet"
  const framesAppropriately =
    lowerContent.includes('appears to meet') ||
    lowerContent.includes('appears to not meet') ||
    lowerContent.includes('based on what is visible');
  assert('Frames observations as "appears to meet/not meet based on visible photo"', framesAppropriately);

  // 3c. Uncertainty declination: declines to guess on obscured/unverifiable details
  const declinesUnverifiable =
    lowerContent.includes('not possible to confirm') ||
    lowerContent.includes('competent person') ||
    lowerContent.includes('physical inspection');
  assert('Declines unconfirmed details and requires competent person inspection', declinesUnverifiable);

  // 3d. Portable ladder question
  const ladderResult = await analyzePhotoCompliance({
    question: 'Check this portable ladder setup for slope and extension',
    imageBuffer: photo.buffer,
    mimeType: photo.mimeType,
    ctx,
  });
  assert('Ladder query cites OSHA 1926.1053', ladderResult.citedStandards.some((s) => s.includes('1926.1053')));
  assert('Ladder answer frames observation relative to visible evidence', ladderResult.content.includes('Based on what is visible'));

  return { scaffoldResult, ladderResult };
}

// ─── 4. Firestore Persistence & Save-to-Workspace Round-Trip ──────────────────

async function testPersistenceAndSaveToWorkspace(
  userAPhoto: { storagePath: string },
  visionAnswer: { content: string; citedStandards: string[]; modelUsed: string }
) {
  console.log('\n4. photoComplianceQueries Audit & workspaceSavedItems Round-Trip');

  const userA = 'test_usr_compliance_1';

  // 4a. Persist to photoComplianceQueries
  const queryRecord = await addDocument<PhotoComplianceQuery>('photoComplianceQueries', {
    userId: userA,
    storagePath: userAPhoto.storagePath,
    question: 'Is this scaffold tie-in compliant with OSHA 1926?',
    tradeContext: 'Scaffolding Specialty',
    stateContext: 'TX',
    modelUsed: visionAnswer.modelUsed,
    answer: visionAnswer.content,
    citedStandards: visionAnswer.citedStandards,
    createdAt: new Date().toISOString(),
  });

  assert('Query audit record created in photoComplianceQueries', typeof queryRecord.id === 'string');
  assert('Query audit record stores storagePath', queryRecord.storagePath === userAPhoto.storagePath);

  // 4b. Save to workspace (workspaceSavedItems with type: 'photo_compliance_answer')
  const savedItem = await addDocument<WorkspaceSavedItem>('workspaceSavedItems', {
    userId: userA,
    type: 'photo_compliance_answer',
    question: 'Is this scaffold tie-in compliant with OSHA 1926?',
    answer: visionAnswer.content,
    citedStandards: visionAnswer.citedStandards,
    tradeContext: 'Scaffolding Specialty',
    stateContext: 'TX',
    modelUsed: visionAnswer.modelUsed,
    sourceThreadId: queryRecord.id,
    storagePath: userAPhoto.storagePath,
    createdAt: new Date().toISOString(),
  });

  assert('Saved item created in workspaceSavedItems', typeof savedItem.id === 'string');
  assert('Saved item has type "photo_compliance_answer"', savedItem.type === 'photo_compliance_answer');
  assert('Saved item has storagePath attached', savedItem.storagePath === userAPhoto.storagePath);

  // 4c. Retrieve saved items by userId
  const userSavedItems = await queryDocuments<WorkspaceSavedItem>(
    'workspaceSavedItems',
    'userId',
    userA
  );

  const foundPhotoItem = userSavedItems.find((item) => item.id === savedItem.id);
  assert('Saved photo answer retrievable by userId', foundPhotoItem !== undefined);
  assert('Retrieved item has storagePath intact', foundPhotoItem?.storagePath === userAPhoto.storagePath);
  assert('Retrieved item has citedStandards', (foundPhotoItem?.citedStandards.length || 0) > 0);
  assert('Retrieved item has question and answer populated', Boolean(foundPhotoItem?.question && foundPhotoItem?.answer));
}

// ─── Main Runner ──────────────────────────────────────────────────────────────

async function main() {
  console.log('\n📸 Starting Avorria Photo Compliance Assistant Verification Suite...');

  const userAPhoto = await testImageConstraints();
  await testStorageMultiTenantIsolation(userAPhoto);
  const { scaffoldResult } = await testVisionComplianceReasoning(userAPhoto);
  await testPersistenceAndSaveToWorkspace(userAPhoto, scaffoldResult);

  console.log(`\n${'─'.repeat(60)}`);
  if (failed === 0) {
    console.log(`🎉 ALL ${passed} PHOTO COMPLIANCE ASSERTIONS PASSED.`);
  } else {
    console.log(`❌ ${failed} ASSERTION(S) FAILED. ${passed} passed.`);
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('\nFatal error in photo compliance test suite:', err);
  process.exit(1);
});
