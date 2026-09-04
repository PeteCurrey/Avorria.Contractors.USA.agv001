import assert from 'assert';
import {
  CONTRACTOR_RESOURCES,
  RESOURCE_CATEGORIES,
  RESOURCE_TYPES,
  getResourceBySlug,
  getResourcesByCategory,
} from '../src/lib/resources/catalogue';
import { renderResourceToPdfBuffer } from '../src/lib/resources/pdf-generator';
import { renderResourceToDocxBuffer } from '../src/lib/resources/docx-generator';

async function runResourcesTestSuite() {
  console.log('════════════════════════════════════════════════════════════════════════');
  console.log('AVORRIA CONTRACTOR USA — RESOURCES QUALITY OVERHAUL TEST SUITE');
  console.log('25 Core Launch Resources, PDF / DOCX Engines & Professional Quality Standard');
  console.log('════════════════════════════════════════════════════════════════════════\n');

  let passed = 0;
  let failed = 0;

  function test(description: string, fn: () => void | Promise<void>) {
    try {
      fn();
      console.log(`✅ ${description}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ ${description}`);
      console.error(`   Error: ${err.message}`);
      failed++;
    }
  }

  async function testAsync(description: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`✅ ${description}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ ${description}`);
      console.error(`   Error: ${err.message}`);
      failed++;
    }
  }

  // ── 1. Catalogue Structure & Integrity ──
  console.log('--- 1. Catalogue Structure & Completeness ---');

  test('Catalogue contains exactly 25 launch resources', () => {
    assert.strictEqual(CONTRACTOR_RESOURCES.length, 25, `Expected 25 resources, found ${CONTRACTOR_RESOURCES.length}`);
  });

  test('All 6 commercial pillars are represented', () => {
    assert.strictEqual(RESOURCE_CATEGORIES.length, 6);
    const winWork = getResourcesByCategory('win-work');
    const estimating = getResourcesByCategory('estimating-commercial');
    const ops = getResourcesByCategory('project-operations');
    const sub = getResourcesByCategory('subcontractor-management');
    const safety = getResourcesByCategory('safety-compliance');
    const biz = getResourcesByCategory('business-administration');

    assert.strictEqual(winWork.length, 5, `Expected 5 Win Work resources, found ${winWork.length}`);
    assert.strictEqual(estimating.length, 5, `Expected 5 Estimating resources, found ${estimating.length}`);
    assert.strictEqual(ops.length, 5, `Expected 5 Operations resources, found ${ops.length}`);
    assert.strictEqual(sub.length, 4, `Expected 4 Subcontractor resources, found ${sub.length}`);
    assert.strictEqual(safety.length, 4, `Expected 4 Safety resources, found ${safety.length}`);
    assert.strictEqual(biz.length, 2, `Expected 2 Business resources, found ${biz.length}`);
  });

  test('All resource slugs and codes are unique', () => {
    const slugs = new Set<string>();
    const codes = new Set<string>();
    for (const r of CONTRACTOR_RESOURCES) {
      assert(!slugs.has(r.slug), `Duplicate slug: ${r.slug}`);
      assert(!codes.has(r.code), `Duplicate code: ${r.code}`);
      slugs.add(r.slug);
      codes.add(r.code);
    }
  });

  test('All 25 resources have required commercial metadata and sections', () => {
    for (const r of CONTRACTOR_RESOURCES) {
      assert(r.title.length > 5, `Title too short for ${r.slug}`);
      assert(r.standard.length > 3, `Missing standard for ${r.slug}`);
      assert(r.typicalUse.length > 5, `Missing typicalUse for ${r.slug}`);
      assert(r.shortDescription.length > 20, `Short description inadequate for ${r.slug}`);
      assert(r.fullDescription.length > 30, `Full description inadequate for ${r.slug}`);
      assert(r.disclaimer.length > 15, `Missing disclaimer for ${r.slug}`);
      assert(r.sections.length > 0, `No sections for ${r.slug}`);
      for (const sec of r.sections) {
        assert(sec.fields.length > 0, `Section ${sec.id} has no fields in ${r.slug}`);
      }
    }
  });

  test('getResourceBySlug finds flagship resources correctly', () => {
    const cap = getResourceBySlug('contractor-capability-statement');
    assert(cap !== undefined);
    assert.strictEqual(cap.code, 'WW-CAP-01');

    const dlr = getResourceBySlug('daily-construction-report');
    assert(dlr !== undefined);
    assert.strictEqual(dlr.code, 'PO-DLR-11');

    const subSow = getResourceBySlug('subcontractor-scope-of-work');
    assert(subSow !== undefined);
    assert.strictEqual(subSow.code, 'SM-SOW-17');
  });

  // ── 2. PDF Rendering Engine ──
  console.log('\n--- 2. Publication-Grade PDF Rendering ---');

  for (const resource of CONTRACTOR_RESOURCES) {
    await testAsync(`PDF engine renders valid buffer for ${resource.code} (${resource.slug})`, async () => {
      const defaultFormData: Record<string, any> = {};
      for (const sec of resource.sections) {
        for (const f of sec.fields) {
          defaultFormData[f.id] = f.defaultValue ?? '';
        }
      }

      const pdfBytes = await renderResourceToPdfBuffer({
        resource,
        formData: defaultFormData,
        checklists: resource.checklistItems,
        tableRows: resource.defaultTableRows,
      });

      assert(pdfBytes !== null && pdfBytes.length > 1000, `PDF bytes buffer too small for ${resource.slug}`);
      const header = Buffer.from(pdfBytes.slice(0, 5)).toString('utf-8');
      assert.strictEqual(header, '%PDF-', `Invalid PDF magic header for ${resource.slug}`);

      // Verify zero Courier font references in generated PDF
      const pdfText = Buffer.from(pdfBytes).toString('latin1');
      assert(!pdfText.includes('/Courier'), `Accidental Courier typewriter font found in ${resource.slug} PDF output!`);
    });
  }

  // ── 3. OpenXML DOCX Generation Engine ──
  console.log('\n--- 3. Structured OpenXML DOCX Generation ---');

  const docxSampleResources = [
    'contractor-capability-statement',
    'contractor-qualification-statement',
    'bid-proposal-template',
    'scope-of-work-template',
    'change-order-form',
    'invoice-template',
    'daily-construction-report',
    'subcontractor-scope-of-work',
    'contractor-incident-report',
  ];

  for (const slug of docxSampleResources) {
    await testAsync(`DOCX engine generates valid OpenXML ZIP for ${slug}`, async () => {
      const res = getResourceBySlug(slug);
      assert(res !== undefined);

      const defaultFormData: Record<string, any> = {};
      for (const sec of res.sections) {
        for (const f of sec.fields) {
          defaultFormData[f.id] = f.defaultValue ?? '';
        }
      }

      const docxBuffer = await renderResourceToDocxBuffer({
        resource: res,
        formData: defaultFormData,
        checklists: res.checklistItems,
        tableRows: res.defaultTableRows,
      });

      assert(docxBuffer !== null && docxBuffer.length > 1000, `DOCX buffer too small for ${slug}`);
      // PK Zip header: 0x50, 0x4B, 0x03, 0x04
      assert.strictEqual(docxBuffer[0], 0x50, `Expected PK header byte 0 for ${slug}`);
      assert.strictEqual(docxBuffer[1], 0x4b, `Expected PK header byte 1 for ${slug}`);
      assert.strictEqual(docxBuffer[2], 0x03, `Expected PK header byte 2 for ${slug}`);
      assert.strictEqual(docxBuffer[3], 0x04, `Expected PK header byte 3 for ${slug}`);
    });
  }

  // ── Summary ──
  console.log('\n════════════════════════════════════════════════════════════════════════');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('════════════════════════════════════════════════════════════════════════');

  if (failed > 0) {
    process.exit(1);
  }
}

runResourcesTestSuite().catch((err) => {
  console.error('Test suite runner error:', err);
  process.exit(1);
});
