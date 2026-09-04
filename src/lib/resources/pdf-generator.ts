import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { ContractorResource, ChecklistItemDef } from './catalogue';

export interface ResourcePdfPayload {
  resource: ContractorResource;
  formData: Record<string, any>;
  organization?: {
    name: string;
    primaryTrade?: string;
    statesLicensed?: string[];
    licenseNumber?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  checklists?: ChecklistItemDef[];
  tableRows?: Record<string, any>[];
  referenceNumber?: string;
}

/**
 * Generates an architectural, publication-grade commercial PDF for contractor resources.
 * - Strict Helvetica / HelveticaBold typography hierarchy (zero typewriter / courier fonts).
 * - Sharp borders, thin divider rules, and high-contrast styling.
 * - Structured field groupings, tables, checklists, and legal signature execution blocks.
 * - Complies with commercial subcontracting standards.
 */
export async function renderResourceToPdfBuffer(payload: ResourcePdfPayload): Promise<Uint8Array> {
  const { resource, formData, organization, checklists, tableRows, referenceNumber } = payload;
  const pdfDoc = await PDFDocument.create();

  // Load clean sans-serif fonts
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([612, 792]); // Standard US Letter (8.5 x 11 in)
  const { width, height } = page.getSize();
  const margin = 40;
  let cursorY = height - margin;

  // Commercial color palette
  const primaryNavy = rgb(0.04, 0.08, 0.16); // #0a1428
  const pureWhite = rgb(1, 1, 1);
  const darkSlate = rgb(0.12, 0.16, 0.22);
  const textBody = rgb(0.2, 0.24, 0.3);
  const textMuted = rgb(0.45, 0.5, 0.58);
  const borderRule = rgb(0.82, 0.85, 0.9);
  const accentBlue = rgb(0.01, 0.52, 0.78);
  const lightGrey = rgb(0.96, 0.97, 0.98);

  const orgName = organization?.name || formData.companyName || 'Vance Commercial Electric LLC';
  const orgTrade = organization?.primaryTrade || formData.primaryTrade || 'Commercial Specialty Contractor';
  const orgStates = organization?.statesLicensed?.join(', ') || formData.statesLicensed || 'TX, OK, AR, LA';
  const refId = referenceNumber || `${resource.code}-${Date.now().toString().slice(-6)}`;
  const dateStr = formData.reportDate || formData.bidDate || formData.auditDate || new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // ── 1. ARCHITECTURAL HEADER BANNER ──
  page.drawRectangle({
    x: margin,
    y: cursorY - 54,
    width: width - margin * 2,
    height: 54,
    color: primaryNavy,
  });

  // Contractor Org Title
  page.drawText(orgName.toUpperCase(), {
    x: margin + 14,
    y: cursorY - 24,
    size: 13,
    font: helveticaBold,
    color: pureWhite,
  });

  page.drawText(`${orgTrade.toUpperCase()}  |  TERRITORY: ${orgStates}`, {
    x: margin + 14,
    y: cursorY - 42,
    size: 7.5,
    font: helvetica,
    color: rgb(0.75, 0.85, 0.95),
  });

  // Resource Code Badge
  page.drawText(resource.code, {
    x: width - margin - 85,
    y: cursorY - 24,
    size: 11,
    font: helveticaBold,
    color: accentBlue,
  });

  page.drawText(resource.categoryName.toUpperCase(), {
    x: width - margin - 130,
    y: cursorY - 42,
    size: 7.5,
    font: helvetica,
    color: rgb(0.8, 0.85, 0.9),
  });

  cursorY -= 70;

  // ── 2. DOCUMENT TITLE & METADATA BAR ──
  page.drawText(resource.title, {
    x: margin,
    y: cursorY,
    size: 16,
    font: helveticaBold,
    color: darkSlate,
  });

  cursorY -= 15;

  page.drawText(`DOCUMENT REF: ${refId}    |    DATE: ${dateStr}    |    STANDARD: ${resource.standard.toUpperCase()}`, {
    x: margin,
    y: cursorY,
    size: 7.5,
    font: helvetica,
    color: textMuted,
  });

  cursorY -= 12;

  // Divider line
  page.drawLine({
    start: { x: margin, y: cursorY },
    end: { x: width - margin, y: cursorY },
    thickness: 1.5,
    color: primaryNavy,
  });

  cursorY -= 18;

  // ── 3. BODY SECTIONS & DATA MAPPING ──
  const activeChecklist = checklists || resource.checklistItems;
  const activeTableRows = tableRows || resource.defaultTableRows;

  // Render form sections
  for (const section of resource.sections) {
    if (cursorY < 160) break; // Ensure room for footer and signatures

    // Section Header
    page.drawRectangle({
      x: margin,
      y: cursorY - 16,
      width: width - margin * 2,
      height: 16,
      color: lightGrey,
    });

    page.drawText(section.title.toUpperCase(), {
      x: margin + 8,
      y: cursorY - 11.5,
      size: 8,
      font: helveticaBold,
      color: primaryNavy,
    });

    cursorY -= 24;

    // Render 2-column key-value grid for section fields
    const fields = section.fields;
    for (let i = 0; i < fields.length; i += 2) {
      if (cursorY < 150) break;

      const f1 = fields[i];
      const f2 = fields[i + 1];

      const val1 = String(formData[f1.id] ?? f1.defaultValue ?? '—');
      const val2 = f2 ? String(formData[f2.id] ?? f2.defaultValue ?? '—') : null;

      // Col 1
      page.drawText(f1.label.toUpperCase(), {
        x: margin + 8,
        y: cursorY,
        size: 6.5,
        font: helveticaBold,
        color: textMuted,
      });

      const truncatedVal1 = val1.length > 55 ? `${val1.substring(0, 52)}...` : val1;
      page.drawText(truncatedVal1, {
        x: margin + 8,
        y: cursorY - 10,
        size: 8,
        font: helvetica,
        color: darkSlate,
      });

      // Col 2
      if (f2 && val2) {
        page.drawText(f2.label.toUpperCase(), {
          x: margin + 280,
          y: cursorY,
          size: 6.5,
          font: helveticaBold,
          color: textMuted,
        });

        const truncatedVal2 = val2.length > 55 ? `${val2.substring(0, 52)}...` : val2;
        page.drawText(truncatedVal2, {
          x: margin + 280,
          y: cursorY - 10,
          size: 8,
          font: helvetica,
          color: darkSlate,
        });
      }

      cursorY -= 22;
    }

    cursorY -= 6;
  }

  // Render Checklist Items if present
  if (activeChecklist && activeChecklist.length > 0 && cursorY > 170) {
    page.drawRectangle({
      x: margin,
      y: cursorY - 16,
      width: width - margin * 2,
      height: 16,
      color: lightGrey,
    });

    page.drawText('VERIFICATION AUDIT ITEMS & COMPLIANCE STATUS', {
      x: margin + 8,
      y: cursorY - 11.5,
      size: 8,
      font: helveticaBold,
      color: primaryNavy,
    });

    cursorY -= 24;

    const itemsToRender = activeChecklist.slice(0, 5); // Fit first 5
    for (const item of itemsToRender) {
      if (cursorY < 145) break;

      const isPassed = item.status === 'passed';
      const statusText = isPassed ? '[ PASS ]' : item.status === 'in_progress' ? '[ PENDING ]' : '[ N/A ]';
      const statusColor = isPassed ? rgb(0.05, 0.5, 0.2) : rgb(0.7, 0.4, 0.05);

      page.drawText(statusText, {
        x: margin + 8,
        y: cursorY,
        size: 7.5,
        font: helveticaBold,
        color: statusColor,
      });

      const reqText = item.requirement.length > 70 ? `${item.requirement.substring(0, 67)}...` : item.requirement;
      page.drawText(reqText, {
        x: margin + 70,
        y: cursorY,
        size: 7.5,
        font: helvetica,
        color: darkSlate,
      });

      page.drawText(item.responsibleParty, {
        x: width - margin - 90,
        y: cursorY,
        size: 7,
        font: helvetica,
        color: textMuted,
      });

      cursorY -= 14;
    }
    cursorY -= 6;
  }

  // Render Table Rows if present (e.g. Action Register, Pricing)
  if (activeTableRows && activeTableRows.length > 0 && cursorY > 170) {
    page.drawRectangle({
      x: margin,
      y: cursorY - 16,
      width: width - margin * 2,
      height: 16,
      color: lightGrey,
    });

    page.drawText('SCHEDULED LINE ITEMS / ACTION SCHEDULE', {
      x: margin + 8,
      y: cursorY - 11.5,
      size: 8,
      font: helveticaBold,
      color: primaryNavy,
    });

    cursorY -= 24;

    for (const row of activeTableRows.slice(0, 4)) {
      if (cursorY < 145) break;
      const col1 = String(row.id || row.key || '•');
      const col2 = String(row.description || row.item || Object.values(row)[1] || '');
      const col3 = String(row.owner || row.qty || Object.values(row)[2] || '');
      const col4 = String(row.status || row.unitPrice || Object.values(row)[3] || '');

      page.drawText(col1, { x: margin + 8, y: cursorY, size: 7.5, font: helveticaBold, color: primaryNavy });
      page.drawText(col2.substring(0, 50), { x: margin + 70, y: cursorY, size: 7.5, font: helvetica, color: darkSlate });
      page.drawText(col3.substring(0, 20), { x: margin + 350, y: cursorY, size: 7.5, font: helvetica, color: textMuted });
      page.drawText(col4.substring(0, 15), { x: width - margin - 75, y: cursorY, size: 7.5, font: helveticaBold, color: darkSlate });

      cursorY -= 14;
    }
    cursorY -= 6;
  }

  // ── 4. COMMERCIAL SIGNATURE & AUTHORIZATION BLOCK ──
  const sigY = 95;

  page.drawRectangle({
    x: margin,
    y: sigY,
    width: width - margin * 2,
    height: 52,
    borderWidth: 1,
    borderColor: borderRule,
    color: rgb(0.98, 0.99, 1),
  });

  page.drawText('COMMERCIAL EXECUTION & RECORD CERTIFICATION', {
    x: margin + 10,
    y: sigY + 40,
    size: 6.5,
    font: helveticaBold,
    color: textMuted,
  });

  // Contractor Sign line
  page.drawLine({
    start: { x: margin + 10, y: sigY + 16 },
    end: { x: margin + 220, y: sigY + 16 },
    thickness: 1,
    color: darkSlate,
  });
  page.drawText('AUTHORIZED CONTRACTOR SIGNATURE / DATE', {
    x: margin + 10,
    y: sigY + 6,
    size: 6,
    font: helvetica,
    color: textMuted,
  });

  // Client / GC Sign line
  page.drawLine({
    start: { x: width - margin - 220, y: sigY + 16 },
    end: { x: width - margin - 10, y: sigY + 16 },
    thickness: 1,
    color: darkSlate,
  });
  page.drawText('ACCEPTANCE / SUPERINTENDENT SIGN-OFF / DATE', {
    x: width - margin - 220,
    y: sigY + 6,
    size: 6,
    font: helvetica,
    color: textMuted,
  });

  // ── 5. AUDIT FOOTER & DISCLAIMER ──
  page.drawText(
    `AVORRIA CONTRACTOR OPERATING SYSTEM  •  ${refId}  •  PAGE 1 OF 1`,
    {
      x: margin,
      y: 28,
      size: 6.5,
      font: helveticaBold,
      color: textMuted,
    }
  );

  const disclaimerSnippet = resource.disclaimer.length > 115
    ? `${resource.disclaimer.substring(0, 112)}...`
    : resource.disclaimer;

  page.drawText(disclaimerSnippet, {
    x: margin,
    y: 18,
    size: 5.5,
    font: helvetica,
    color: textMuted,
  });

  return await pdfDoc.save();
}
