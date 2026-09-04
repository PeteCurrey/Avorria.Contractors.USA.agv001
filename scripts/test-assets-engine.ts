/**
 * AVORRIA ASSETS ENGINE TEST SUITE
 * Build Prompt 3: Asset & Media Intelligence (Firebase Upload + pgvector Document Search)
 *
 * Verifies:
 * 1. Asset Schema & CRUD (create, get, list with filters, update, soft-delete/retire)
 * 2. Upload Flow Invariants (Firebase Storage path scoped to org, confirm route sole writer)
 * 3. Cross-Org RLS & Isolation (Org A vs Org B: asset_documents and document_chunks 100% isolated)
 * 4. Text Extraction & Chunking Pipeline (sliding window, sequential indexes, overlap preservation)
 * 5. Vector Search Matching (cosine similarity, org-scoped retrieval, top result rank)
 * 6. Search Threshold Guard (sub-threshold similarity returns answered:false, zero hallucination)
 * 7. RAG Natural Language Answer & Source Document Citation (answer cites source file)
 * 8. Service Log Lifecycle & Automatic Vector Indexing (work_performed indexed into chunks)
 * 9. Spare Parts Inventory & Automatic Reorder Notification (reorder_alert fired when <= threshold)
 * 10. Reorder Notification Deduplication (prevents multiple unread alerts for same part)
 */

import {
  createAsset,
  getAsset,
  listAssets,
  updateAsset,
  retireAsset,
  saveAssetDocument,
  getAssetDocument,
  listAssetDocuments,
  saveDocumentChunk,
  saveDocumentChunks,
  searchChunksByEmbedding,
  createServiceLog,
  listServiceLogs,
  getLastServiceDate,
  saveSparePart,
  getSparePart,
  listSpareParts,
  updateSparePartQuantity,
  checkReorderThresholds,
  resetAssetsStore,
} from '../src/lib/assets/db';
import {
  chunkText,
  generateEmbedding,
  indexServiceLogText,
} from '../src/lib/assets/extraction';
import { answerAssetQuery } from '../src/lib/assets/search';
import { validateStoragePath, buildStorageUrl } from '../src/lib/firebase/admin';
import {
  Asset,
  AssetDocument,
  DocumentChunk,
  ServiceLog,
  SparePart,
} from '../src/lib/assets/types';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ ${message}`);
    passed++;
  } else {
    console.error(`❌ FAILED: ${message}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('════════════════════════════════════════════════════════════════════════');
  console.log('AVORRIA ASSETS ENGINE: FIREBASE STORAGE + RAG SEARCH TEST SUITE');
  console.log('Build Prompt 3: Asset & Media Intelligence');
  console.log('════════════════════════════════════════════════════════════════════════\n');

  resetAssetsStore();

  const ORG_A = 'org-apex-mechanical-uuid-001';
  const ORG_B = 'org-vance-electric-uuid-002';
  const USER_A = 'user-tech-alpha-001';

  // ─────────────────────────────────────────────────────────────
  // 1. Asset Schema & CRUD
  // ─────────────────────────────────────────────────────────────
  console.log('--- 1. Asset Schema & CRUD ---');

  const assetA1: Asset = {
    id: 'asset-cat-generator-001',
    org_id: ORG_A,
    name: 'Caterpillar 150kW Generator Unit 3',
    asset_type: 'generator',
    manufacturer: 'Caterpillar',
    model_number: 'XQ150',
    serial_number: 'CAT-994821',
    purchase_date: '2023-04-15',
    warranty_expiration: '2026-04-15',
    current_location: 'Yard 2 - Austin',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const createdAsset = await createAsset(assetA1);
  assert(createdAsset.id === assetA1.id, 'Asset created with assigned ID');
  assert(createdAsset.name === 'Caterpillar 150kW Generator Unit 3', 'Asset name preserved');
  assert(createdAsset.status === 'active', 'Initial asset status is active');

  const fetchedAsset = await getAsset(assetA1.id);
  assert(fetchedAsset !== null, 'Asset retrieved by ID');
  assert(fetchedAsset?.manufacturer === 'Caterpillar', 'Asset manufacturer retrieved');

  // List assets with type filter
  const assetA2: Asset = {
    id: 'asset-dewalt-saw-002',
    org_id: ORG_A,
    name: 'DeWalt 12" Sliding Compound Miter Saw',
    asset_type: 'power_tool',
    manufacturer: 'DeWalt',
    model_number: 'DWS780',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  await createAsset(assetA2);

  const allOrgAAssets = await listAssets(ORG_A);
  assert(allOrgAAssets.length === 2, 'listAssets returns all assets for Org A');

  const powerToolsOnly = await listAssets(ORG_A, { asset_type: 'power_tool' });
  assert(powerToolsOnly.length === 1, 'listAssets with asset_type filter returns power_tool only');
  assert(powerToolsOnly[0].id === assetA2.id, 'Filtered asset matches expected record');

  // Update asset
  const updatedAsset = await updateAsset(assetA1.id, { current_location: 'Jobsite 4 - Downtown Tower' });
  assert(updatedAsset?.current_location === 'Jobsite 4 - Downtown Tower', 'Asset field updated successfully');

  // Soft-delete / retire
  const retired = await retireAsset(assetA2.id);
  assert(retired === true, 'retireAsset returns true');
  const retiredRecord = await getAsset(assetA2.id);
  assert(retiredRecord?.status === 'retired', 'Retired asset marked status = retired (not hard deleted)');

  const activeOnly = await listAssets(ORG_A, { status: 'active' });
  assert(activeOnly.length === 1, 'Status filter excludes retired assets');

  // ─────────────────────────────────────────────────────────────
  // 2. Upload Flow Invariants & Path Validation
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 2. Upload Flow Invariants & Firebase Storage Path Validation ---');

  const validPath = `orgs/${ORG_A}/assets/${assetA1.id}/uuid-cat-manual.pdf`;
  const isValidOrgPath = validateStoragePath(validPath, ORG_A);
  assert(isValidOrgPath === true, 'validateStoragePath accepts legitimate org-scoped path');

  const invalidOrgPath = `orgs/${ORG_B}/assets/${assetA1.id}/uuid-cat-manual.pdf`;
  const isBlockedSpoof = validateStoragePath(invalidOrgPath, ORG_A);
  assert(isBlockedSpoof === false, 'validateStoragePath strictly rejects cross-org path spoofing attempt');

  const storageUrl = buildStorageUrl(validPath);
  assert(storageUrl.startsWith('https://firebasestorage.googleapis.com/'), 'buildStorageUrl returns valid Firebase Storage URL');
  assert(storageUrl.includes(encodeURIComponent(validPath)), 'buildStorageUrl encodes storage path');

  // Server-confirmed document record write
  const docA1: AssetDocument = {
    id: 'doc-cat-manual-001',
    org_id: ORG_A,
    asset_id: assetA1.id,
    firebase_storage_url: storageUrl,
    firebase_storage_path: validPath,
    document_type: 'manual',
    file_name: 'CAT_XQ150_Operation_Manual.pdf',
    mime_type: 'application/pdf',
    file_size_bytes: 4500000,
    uploaded_by_user_id: USER_A,
    extraction_status: 'complete',
    extracted_text: 'The torque spec for the flange bolts on Generator Unit 3 is 45 ft-lb. Recommended oil viscosity is 15W-40. Fuel filter part number is CAT-1R-0716.',
    uploaded_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const savedDoc = await saveAssetDocument(docA1);
  assert(savedDoc.id === docA1.id, 'Asset document saved in Supabase metadata table');
  assert(savedDoc.firebase_storage_url === storageUrl, 'Firebase Storage URL preserved in metadata');

  const orgADocs = await listAssetDocuments(ORG_A, assetA1.id);
  assert(orgADocs.length === 1, 'listAssetDocuments returns saved document');

  // ─────────────────────────────────────────────────────────────
  // 3. Cross-Org RLS & Isolation (Hard Multi-Tenant Boundary)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 3. Cross-Org RLS & Isolation (Zero Leakage Test) ---');

  // Org B queries Org A's asset document -> MUST return null
  const orgBLeakedDoc = await getAssetDocument(docA1.id, ORG_B);
  assert(orgBLeakedDoc === null, 'Org B cannot fetch Org A asset document (returns null)');

  // Org B lists asset documents for Org A's asset -> MUST return empty
  const orgBLeakedList = await listAssetDocuments(ORG_B, assetA1.id);
  assert(orgBLeakedList.length === 0, 'Org B cannot list Org A documents (returns empty array)');

  // Org B lists assets -> MUST NOT contain Org A's assets
  const orgBAssets = await listAssets(ORG_B);
  assert(orgBAssets.length === 0, 'Org B asset list contains zero Org A assets');

  // ─────────────────────────────────────────────────────────────
  // 4. Text Extraction & Chunking Pipeline
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 4. Text Extraction & Chunking Pipeline ---');

  const sampleManualText = `
    SECTION 1: SPECIFICATIONS
    Model: CAT XQ150 Generator. Rated Prime Output: 150 kW / 187.5 kVA.
    Engine: Caterpillar C7.1 ACERT turbocharged diesel.
    Flange bolt torque requirement: 45 ft-lb (61 N·m). Tighten in cross pattern.
    Fuel capacity: 250 gallons internal tank. Consumption at 100% load: 11.2 gal/hr.
    
    SECTION 2: MAINTENANCE SCHEDULE
    Daily / 10 Hours: Inspect engine oil, coolant level, fuel filter water separator.
    250 Hours / 6 Months: Replace engine oil and filter (part CAT-1R-0716).
    500 Hours / 12 Months: Replace primary and secondary fuel filters. Inspect drive belt.
    1000 Hours / 24 Months: Clean crankcase breather. Inspect vibration dampers.
  `;

  const chunks = chunkText(sampleManualText, 50, 10);
  assert(chunks.length >= 2, 'chunkText produces multiple chunks for multi-section text');

  // Verify sequential index and content
  assert(chunks[0].length > 0, 'First chunk contains text content');
  assert(chunks[1].length > 0, 'Second chunk contains text content');

  // Verify chunk overlap: words at the boundary appear in adjacent chunks
  const chunk0Words = chunks[0].split(/\s+/);
  const chunk1Words = chunks[1].split(/\s+/);
  const overlapWordFound = chunk1Words.some((w) => chunk0Words.includes(w));
  assert(overlapWordFound === true, 'Adjacent chunks preserve overlapping context window');

  // ─────────────────────────────────────────────────────────────
  // 5. Vector Search Matching & Cosine Similarity
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 5. Vector Search Matching & Scoped Similarity ---');

  const chunkA1Embedding = await generateEmbedding('The torque spec for the flange bolts on Generator Unit 3 is 45 ft-lb.');
  const chunkA2Embedding = await generateEmbedding('Replace engine oil and filter every 250 hours. Filter part CAT-1R-0716.');

  const chunkA1: DocumentChunk = {
    id: 'chunk-orgA-001',
    org_id: ORG_A,
    asset_document_id: docA1.id,
    chunk_index: 0,
    chunk_text: 'The torque spec for the flange bolts on Generator Unit 3 is 45 ft-lb.',
    embedding: chunkA1Embedding,
    source_type: 'document',
    created_at: new Date().toISOString(),
  };

  const chunkA2: DocumentChunk = {
    id: 'chunk-orgA-002',
    org_id: ORG_A,
    asset_document_id: docA1.id,
    chunk_index: 1,
    chunk_text: 'Replace engine oil and filter every 250 hours. Filter part CAT-1R-0716.',
    embedding: chunkA2Embedding,
    source_type: 'document',
    created_at: new Date().toISOString(),
  };

  // Seed a chunk belonging to Org B with identical topic
  const chunkBEmbedding = await generateEmbedding('The torque spec for Generator B is 90 ft-lb.');
  const chunkB: DocumentChunk = {
    id: 'chunk-orgB-001',
    org_id: ORG_B,
    asset_document_id: 'doc-orgB-secret-001',
    chunk_index: 0,
    chunk_text: 'The torque spec for Generator B is 90 ft-lb.',
    embedding: chunkBEmbedding,
    source_type: 'document',
    created_at: new Date().toISOString(),
  };

  await saveDocumentChunks([chunkA1, chunkA2, chunkB]);

  // Query Org A with matching embedding vector
  const matchedChunks = await searchChunksByEmbedding(ORG_A, chunkA1Embedding, 5, 0.72);
  assert(matchedChunks.length >= 1, 'searchChunksByEmbedding retrieves matching chunk within Org A');
  assert(matchedChunks[0].id === chunkA1.id, 'Top match is chunkA1 with exact text');
  assert(matchedChunks[0].similarity >= 0.99, 'Self-match similarity approaches 1.0');

  // Hard Invariant: Search as Org A MUST NOT return Org B's chunk
  const crossOrgChunkInResults = matchedChunks.some((c) => c.org_id === ORG_B);
  assert(crossOrgChunkInResults === false, 'Hard Invariant: Org A search returns zero Org B chunks');

  // Search as Org B returns only Org B
  const orgBMatchedChunks = await searchChunksByEmbedding(ORG_B, chunkBEmbedding, 5, 0.72);
  assert(orgBMatchedChunks.length === 1, 'Org B search returns Org B chunk');
  assert(orgBMatchedChunks[0].org_id === ORG_B, 'Org B match is strictly scoped to Org B');
  const orgAInOrgB = orgBMatchedChunks.some((c) => c.org_id === ORG_A);
  assert(orgAInOrgB === false, 'Hard Invariant: Org B search returns zero Org A chunks');

  // ─────────────────────────────────────────────────────────────
  // 6. Search Threshold Guard (Zero Hallucination)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 6. Search Threshold Guard (Anti-Hallucination) ---');

  // Query completely unrelated vector (orthogonal seed)
  const unrelatedVector = await generateEmbedding('How do I bake sourdough bread in Paris on Sunday?');
  const noMatches = await searchChunksByEmbedding(ORG_A, unrelatedVector, 5, 0.95);
  assert(noMatches.length === 0, 'High-threshold search on unrelated topic returns zero chunks');

  // Full RAG search entry point with completely unrelated question
  const unrelatedRAG = await answerAssetQuery(
    'How do I bake sourdough bread in Paris on Sunday?',
    ORG_A
  );
  assert(unrelatedRAG.answered === false, 'Sub-threshold query flagged answered = false');
  assert(unrelatedRAG.sourceDocuments.length === 0, 'No source documents cited when unanswered');
  assert(
    unrelatedRAG.message?.includes('No matching documents found') === true,
    'Plain rejection message returned rather than hallucinated answer'
  );

  // ─────────────────────────────────────────────────────────────
  // 7. RAG Natural Language Answer & Source Citation
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 7. RAG Natural Language Answer & Source Document Citation ---');

  // Query with matching text in Org A
  const ragResult = await answerAssetQuery(
    'The torque spec for the flange bolts on Generator Unit 3 is 45 ft-lb.',
    ORG_A
  );
  assert(ragResult.answered === true, 'Relevant query resolves answered = true');
  assert(typeof ragResult.answer === 'string' && ragResult.answer.length > 10, 'Natural language answer returned');
  assert(ragResult.sourceDocuments.length === 1, 'Cited source documents includes matched document');
  assert(ragResult.sourceDocuments[0].file_name === docA1.file_name, 'Cited document name matches CAT_XQ150_Operation_Manual.pdf');
  assert(ragResult.sourceDocuments[0].firebase_storage_url === docA1.firebase_storage_url, 'Source document includes direct Firebase Storage link');

  // ─────────────────────────────────────────────────────────────
  // 8. Service Log Lifecycle & Vector Indexing
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 8. Service Log Lifecycle & Automatic Vector Indexing ---');

  const svcLog1: ServiceLog = {
    id: 'svclog-cat-001',
    org_id: ORG_A,
    asset_id: assetA1.id,
    service_date: '2026-08-10',
    technician_name: 'Dave Morrison (Master Tech)',
    work_performed: 'Completed 500-hour preventive maintenance. Replaced primary fuel filter. Flushed radiator. Re-torqued flange bolts to 45 ft-lb.',
    parts_used: ['CAT-1R-0716', 'CAT-1R-0770'],
    cost: 850.0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const createdLog = await createServiceLog(svcLog1);
  assert(createdLog.id === svcLog1.id, 'Service log created with ID');
  assert(createdLog.technician_name === 'Dave Morrison (Master Tech)', 'Technician name preserved');

  const logs = await listServiceLogs(ORG_A, assetA1.id);
  assert(logs.length === 1, 'listServiceLogs returns logged service entry');
  assert(logs[0].parts_used.length === 2, 'Service log parts_used array preserved');

  // Index service log text into vector store
  await indexServiceLogText(svcLog1.id, ORG_A, svcLog1.work_performed, assetA1.name);

  const enrichedServiceText = `Service performed on ${assetA1.name}: ${svcLog1.work_performed}`;
  const svcQueryVector = await generateEmbedding(enrichedServiceText);
  const svcMatches = await searchChunksByEmbedding(ORG_A, svcQueryVector, 5, 0.72);
  const matchedSvcChunk = svcMatches.find((c) => c.source_type === 'service_log');
  assert(matchedSvcChunk !== undefined, 'Service log work_performed text is indexed as a searchable vector chunk');
  assert(matchedSvcChunk?.service_log_id === svcLog1.id, 'Vector chunk references source service_log_id');

  const lastDate = await getLastServiceDate(ORG_A, assetA1.id);
  assert(lastDate === '2026-08-10', 'getLastServiceDate returns most recent service date');

  // ─────────────────────────────────────────────────────────────
  // 9. Spare Parts Inventory & Automatic Reorder Notifications
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 9. Spare Parts Inventory & Reorder Notifications ---');

  const part1: SparePart = {
    id: 'part-oil-filter-001',
    org_id: ORG_A,
    part_number: 'CAT-1R-0716',
    description: 'Caterpillar Engine Oil Filter High Efficiency',
    compatible_asset_ids: [assetA1.id],
    supplier_name: 'Holt CAT Austin',
    supplier_contact: 'parts@holtcat.com / 512-555-0199',
    unit_cost: 32.5,
    quantity_on_hand: 10,
    reorder_threshold: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await saveSparePart(part1);
  const fetchedPart = await getSparePart(part1.id, ORG_A);
  assert(fetchedPart !== null, 'Spare part created and fetched by ID');
  assert(fetchedPart?.part_number === 'CAT-1R-0716', 'Part number preserved');
  assert(fetchedPart?.compatible_asset_ids.includes(assetA1.id) === true, 'Spare part correctly maps to compatible asset ID');

  // Initially quantity (10) > threshold (4) -> No alert
  const initialAlerts = await checkReorderThresholds(ORG_A);
  assert(initialAlerts.length === 0, 'No reorder alert fired when quantity (10) > threshold (4)');

  // Drop quantity to 3 (below threshold of 4)
  const updatedPart = await updateSparePartQuantity(part1.id, ORG_A, 3);
  assert(updatedPart?.quantity_on_hand === 3, 'Spare part quantity decremented to 3');

  // Run reorder threshold check
  const firedAlerts = await checkReorderThresholds(ORG_A);
  assert(firedAlerts.length === 1, 'Reorder notification fired when quantity (3) <= threshold (4)');
  assert(firedAlerts[0].type === 'reorder_alert', 'Notification type is reorder_alert');
  assert(firedAlerts[0].message?.includes('CAT-1R-0716') === true, 'Notification message identifies part number');
  assert(firedAlerts[0].message?.includes('3 remaining') === true, 'Notification message reflects live quantity');

  // ─────────────────────────────────────────────────────────────
  // 10. Reorder Notification Deduplication
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 10. Reorder Notification Deduplication ---');

  // Run reorder check again without changing quantity
  const secondCheckAlerts = await checkReorderThresholds(ORG_A);
  assert(
    secondCheckAlerts.length === 0,
    'Deduplication: Identical second check does NOT generate duplicate unread notification'
  );

  // Restore quantity to 15 (above threshold)
  await updateSparePartQuantity(part1.id, ORG_A, 15);
  const thirdCheckAlerts = await checkReorderThresholds(ORG_A);
  assert(thirdCheckAlerts.length === 0, 'Restoring stock above threshold stops alert generation');

  console.log('\n════════════════════════════════════════════════════════════════════════');
  console.log(`ASSETS ENGINE TEST COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('════════════════════════════════════════════════════════════════════════');

  if (failed > 0) process.exit(1);
}

runTestSuite().catch((err) => {
  console.error('Unhandled error in test suite:', err);
  process.exit(1);
});
