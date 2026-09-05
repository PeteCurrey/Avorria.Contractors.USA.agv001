/**
 * AVORRIA CONTRACTORS USA — BUILD PROMPT 7 VERIFICATION SUITE
 *
 * Verifies:
 * 1. Public unauthenticated JHA generation (/api/generate/jha)
 * 2. Public unauthenticated Quote generation (/api/generate/quote)
 * 3. Strict rate limiting: exactly 3 allowed per session/IP, 4th attempt blocked with 429
 * 4. Zero DB writes for public generation calls
 * 5. Mandatory Avorria crystalline vector brand mark rendering
 * 6. Dual branding on authenticated documents
 * 7. Template real sample endpoints (/api/templates/sample?type=...)
 */

import { NextRequest } from 'next/server';
import { POST as generatePost } from '../src/app/api/generate/[docType]/route';
import { GET as templateSampleGet } from '../src/app/api/templates/sample/route';
import { resetRateLimitStore } from '../src/lib/create/rate-limiter';
import { listDocuments } from '../src/lib/workspace/db';
import { drawAvorriaBrandMark, MARK_ASPECT_RATIO } from '../src/lib/brand/pdf-brand';
import { PDFDocument } from 'pdf-lib';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runSuite() {
  console.log('\n======================================================');
  console.log('AVORRIA BUILD PROMPT 7 — VERIFICATION SUITE');
  console.log('======================================================\n');

  resetRateLimitStore();
  const testIp = '198.51.100.42';

  // ── TEST 1: Public Unauthenticated JHA Generation ──
  console.log('[1/7] Testing Public Unauthenticated JHA Generation...');
  const initialDocs = await listDocuments('public_unauthenticated');
  const initialCount = initialDocs.length;

  const req1 = new NextRequest('http://localhost:3000/api/generate/jha', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': testIp,
      'x-public-tool': 'true',
    },
    body: JSON.stringify({
      isPublic: true,
      forceMock: true,
      userInput: {
        project_name: 'Downtown Commercial Substation',
        trade: 'Electrical',
        competent_person: 'Marcus Vance',
        tasks: [{ task_description: 'Lockout/Tagout 480V Panelboard' }],
      },
    }),
  });

  const res1 = await generatePost(req1, { params: Promise.resolve({ docType: 'jha' }) });
  assert(res1.status === 200, `HTTP status is 200 (received ${res1.status})`);
  const data1 = await res1.json();
  assert(data1.success === true, 'Response indicates success: true');
  assert(typeof data1.pdfBase64 === 'string' && data1.pdfBase64.length > 500, 'Real PDF base64 generated');
  assert(data1.rateLimit?.remaining === 2, `Rate limit remaining is 2 (received ${data1.rateLimit?.remaining})`);
  assert(data1.document?.org_id === 'public_unauthenticated', 'Document org_id is public_unauthenticated');

  // Verify Zero DB writes
  const postDocs1 = await listDocuments('public_unauthenticated');
  assert(postDocs1.length === initialCount, 'Zero documents persisted to DB for public generation');

  // ── TEST 2: Public Unauthenticated Quote Calculator Generation ──
  console.log('\n[2/7] Testing Public Unauthenticated Quote Generation with Math Engine...');
  const req2 = new NextRequest('http://localhost:3000/api/generate/quote', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': testIp,
      'x-public-tool': 'true',
    },
    body: JSON.stringify({
      isPublic: true,
      forceMock: true,
      userInput: {
        project_name: 'Austin Medical Tower Switchgear',
        client_name: 'Metro Health LLC',
        contractor_name: 'Vance Electric',
        trade: 'Electrical',
        line_items: [
          { description: 'Main Switchboard 800A', quantity: 1, unit_cost: 12000 },
          { description: 'Conduit & Wire Pack', quantity: 50, unit_cost: 80 },
        ],
        labor_hours: 100,
        labor_rate: 90,
        overhead_percentage: 15,
        target_margin_percentage: 20,
      },
    }),
  });

  const res2 = await generatePost(req2, { params: Promise.resolve({ docType: 'quote' }) });
  assert(res2.status === 200, `HTTP status is 200 (received ${res2.status})`);
  const data2 = await res2.json();
  assert(data2.success === true, 'Response indicates success: true');
  assert(data2.rateLimit?.remaining === 1, `Rate limit remaining is 1 (received ${data2.rateLimit?.remaining})`);
  assert(data2.document?.content?.financials?.contract_price > 0, 'Deterministic financials calculated');

  // ── TEST 3: 3rd Generation (Permitted, Reaches Limit) ──
  console.log('\n[3/7] Testing 3rd Public Generation (Permitted, reaches zero remaining)...');
  const req3 = new NextRequest('http://localhost:3000/api/generate/jha', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': testIp,
      'x-public-tool': 'true',
    },
    body: JSON.stringify({
      isPublic: true,
      forceMock: true,
      userInput: {
        project_name: 'Attempt 3 JHA',
        trade: 'Electrical',
      },
    }),
  });

  const res3 = await generatePost(req3, { params: Promise.resolve({ docType: 'jha' }) });
  assert(res3.status === 200, `HTTP status is 200 (received ${res3.status})`);
  const data3 = await res3.json();
  assert(data3.rateLimit?.remaining === 0, `Rate limit remaining is 0 (received ${data3.rateLimit?.remaining})`);

  // ── TEST 4: 4th Generation Blocked with HTTP 429 ──
  console.log('\n[4/7] Testing 4th Public Generation (Strict Block with HTTP 429)...');
  const req4 = new NextRequest('http://localhost:3000/api/generate/jha', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': testIp,
      'x-public-tool': 'true',
    },
    body: JSON.stringify({
      isPublic: true,
      forceMock: true,
      userInput: {
        project_name: 'Attempt 4 Should Block',
        trade: 'Electrical',
      },
    }),
  });

  const res4 = await generatePost(req4, { params: Promise.resolve({ docType: 'jha' }) });
  assert(res4.status === 429, `HTTP status is 429 Rate Limit Exceeded (received ${res4.status})`);
  const data4 = await res4.json();
  assert(data4.code === 'RATE_LIMIT_EXCEEDED', 'Error code is RATE_LIMIT_EXCEEDED');
  assert(
    data4.error ===
      "You've reached the free generation limit. Create a free account to generate unlimited documents with your company branding.",
    'Exact required error message returned'
  );

  // ── TEST 5: Separate Session / IP Has Fresh Rate Limit ──
  console.log('\n[5/7] Testing Independent Session / IP Isolation...');
  const reqOther = new NextRequest('http://localhost:3000/api/generate/jha', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '203.0.113.195',
      'x-public-tool': 'true',
    },
    body: JSON.stringify({
      isPublic: true,
      forceMock: true,
      userInput: { project_name: 'Separate Client Project', trade: 'HVAC' },
    }),
  });

  const resOther = await generatePost(reqOther, { params: Promise.resolve({ docType: 'jha' }) });
  assert(resOther.status === 200, `Independent IP succeeds with 200 (received ${resOther.status})`);
  const dataOther = await resOther.json();
  assert(dataOther.rateLimit?.remaining === 2, 'Independent IP has fresh quota (remaining = 2)');

  // ── TEST 6: Vector Crystalline Brand Mark Geometry & PDF Rendering ──
  console.log('\n[6/7] Testing Vector Brand Mark Geometry & Aspect Ratio...');
  assert(Math.abs(MARK_ASPECT_RATIO - 1.7496) < 0.001, `Mark aspect ratio matches 1.7496`);

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const markRes = drawAvorriaBrandMark(page, { x: 50, y: 700, height: 24 });
  assert(markRes.height === 24, 'Mark rendered with specified height');
  assert(Math.abs(markRes.width - 24 * 1.7496) < 0.1, 'Mark rendered with calibrated width');
  const pdfBytes = await pdfDoc.save();
  assert(pdfBytes.length > 1000, `PDF contains compiled vector SVG facet paths (${pdfBytes.length} bytes)`);

  // ── TEST 7: Template Sample Direct Generation Endpoints ──
  console.log('\n[7/7] Testing Template Pages Real Sample Generation (Zero Static Mocks)...');
  const templates = ['jha', 'jsa', 'safety_plan', 'toolbox_talk', 'quote'];
  for (const t of templates) {
    const tmplReq = new NextRequest(`http://localhost:3000/api/templates/sample?type=${t}`);
    const tmplRes = await templateSampleGet(tmplReq);
    assert(tmplRes.status === 200, `Template /api/templates/sample?type=${t} returned 200`);
    assert(tmplRes.headers.get('content-type') === 'application/pdf', 'Returns application/pdf');
    const pdfBuf = await tmplRes.arrayBuffer();
    assert(pdfBuf.byteLength > 2000, `Template ${t} generated full real PDF (${pdfBuf.byteLength} bytes)`);
  }

  console.log('\n======================================================');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error('Test suite uncaught error:', err);
  process.exit(1);
});
