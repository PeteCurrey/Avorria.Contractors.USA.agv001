import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { WorkspaceDocument, Organization } from '../workspace/types';
import {
  CreateDocumentType,
  JhaDocumentContent,
  JsaDocumentContent,
  SafetyPlanDocumentContent,
  ToolboxTalkDocumentContent,
  QuoteDocumentContent,
  ChangeOrderDocumentContent,
} from './types';

export interface GeneratePdfOptions {
  document: WorkspaceDocument;
  organization: Organization;
  watermark?: string; // e.g. "PREVIEW / WATERMARKED" for public unauthenticated generator
}

/**
 * Generates a clean, branded, utilitarian PDF buffer matching Avorria design specs:
 * - Sharp zero-border-radius borders
 * - Strict typography hierarchy (Courier/Helvetica standard equivalents for Plex Mono/Sans)
 * - Header with org information & document metadata
 * - Structured data tables / narrative blocks
 * - Embedded digital signature & SHA-256 verification hash
 * - Audit footer with versioning
 */
export async function renderDocumentToPdfBuffer(
  options: GeneratePdfOptions
): Promise<Uint8Array> {
  const { document: doc, organization: org, watermark } = options;
  const pdfDoc = await PDFDocument.create();

  // Load standard fonts
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);
  const courierBold = await pdfDoc.embedFont(StandardFonts.CourierBold);

  const page = pdfDoc.addPage([612, 792]); // Standard US Letter (8.5 x 11 in)
  const { width, height } = page.getSize();
  const margin = 40;
  let cursorY = height - margin;

  // Colors (SBB Light Editorial Operator UI palette)
  const black = rgb(0.067, 0.094, 0.153); // #111827
  const darkSlate = rgb(0.15, 0.2, 0.25);
  const midSlate = rgb(0.392, 0.455, 0.545); // #64748B
  const lightGrey = rgb(0.96, 0.965, 0.97); // #ECEEEF base light
  const borderGrey = rgb(0.886, 0.894, 0.910); // #E2E4E8 hairline
  const primaryNavy = rgb(0.067, 0.094, 0.153); // #111827 header background
  const accentOrange = rgb(0.976, 0.451, 0.086); // #F97316 SBB orange accent

  // ── 1. HEADER (BRANDING & METADATA) ──
  page.drawRectangle({
    x: margin,
    y: cursorY - 50,
    width: width - margin * 2,
    height: 50,
    color: primaryNavy,
  });

  // 2px SBB orange accent stripe under the header block
  page.drawRectangle({
    x: margin,
    y: cursorY - 52,
    width: width - margin * 2,
    height: 2,
    color: accentOrange,
  });

  page.drawText(org.name.toUpperCase(), {
    x: margin + 12,
    y: cursorY - 22,
    size: 13,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });

  page.drawText(`${org.primary_trade.toUpperCase()} • ${org.states_licensed.join(', ') || 'USA'}`, {
    x: margin + 12,
    y: cursorY - 38,
    size: 8,
    font: courier,
    color: rgb(0.7, 0.8, 0.9),
  });

  page.drawText(`VER. ${doc.version}`, {
    x: width - margin - 65,
    y: cursorY - 22,
    size: 10,
    font: courierBold,
    color: accentOrange,
  });

  page.drawText(doc.type.replace('_', ' ').toUpperCase(), {
    x: width - margin - 120,
    y: cursorY - 38,
    size: 8,
    font: courier,
    color: rgb(0.8, 0.8, 0.8),
  });

  cursorY -= 67;

  // ── 2. DOCUMENT TITLE & SUBHEADER ──
  page.drawText(doc.title, {
    x: margin,
    y: cursorY,
    size: 16,
    font: helveticaBold,
    color: black,
  });

  cursorY -= 16;
  const dateStr = new Date(doc.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  page.drawText(`Generated: ${dateStr}   |   ID: ${doc.id}   |   Status: ${doc.is_signed ? 'SIGNED & LOCKED' : 'DRAFT'}`, {
    x: margin,
    y: cursorY,
    size: 8,
    font: courier,
    color: midSlate,
  });

  cursorY -= 20;

  // Draw dividing rule
  page.drawLine({
    start: { x: margin, y: cursorY },
    end: { x: width - margin, y: cursorY },
    thickness: 1,
    color: borderGrey,
  });

  cursorY -= 15;

  // ── 3. DOCUMENT BODY CONTENT ──
  const content = (doc.content || {}) as any;

  if (doc.type === 'jha' || doc.type === 'jsa') {
    const isJha = doc.type === 'jha';
    const projOrTask = isJha ? content.project_name : content.job_task_name;
    const location = isJha ? content.site_address : content.location;

    page.drawText(`PROJECT / TASK: ${projOrTask || 'General Task'}`, {
      x: margin,
      y: cursorY,
      size: 9,
      font: helveticaBold,
      color: darkSlate,
    });
    cursorY -= 14;

    page.drawText(`LOCATION: ${location || 'Site Location'}   |   TRADE: ${content.trade || org.primary_trade}`, {
      x: margin,
      y: cursorY,
      size: 8,
      font: courier,
      color: midSlate,
    });
    cursorY -= 20;

    // Table Header
    page.drawRectangle({
      x: margin,
      y: cursorY - 18,
      width: width - margin * 2,
      height: 18,
      color: lightGrey,
      borderWidth: 1,
      borderColor: borderGrey,
    });

    page.drawText('STEP / HAZARD', { x: margin + 8, y: cursorY - 12, size: 7, font: courierBold, color: darkSlate });
    page.drawText('CONTROLS (OSHA ALIGNED)', { x: margin + 200, y: cursorY - 12, size: 7, font: courierBold, color: darkSlate });
    page.drawText('REQUIRED PPE', { x: width - margin - 120, y: cursorY - 12, size: 7, font: courierBold, color: darkSlate });
    cursorY -= 22;

    const items = isJha ? (content.tasks || []) : (content.steps || []);
    for (let i = 0; i < Math.min(items.length, 3); i++) {
      const item = items[i];
      const desc = isJha ? item.task_description : item.step_description;
      const controls = isJha
        ? (item.controls || []).map((c: any) => c.description).join('; ')
        : (item.control_measures || []).join('; ');
      const ppe = (item.required_ppe || []).slice(0, 3).join(', ');

      page.drawRectangle({
        x: margin,
        y: cursorY - 36,
        width: width - margin * 2,
        height: 36,
        borderWidth: 0.5,
        borderColor: borderGrey,
      });

      page.drawText(`${i + 1}. ${desc.substring(0, 35)}...`, { x: margin + 8, y: cursorY - 14, size: 7, font: helveticaBold, color: black });
      if (isJha && item.hazards?.[0]) {
        page.drawText(`Hazard: ${item.hazards[0].hazard_type}`, { x: margin + 8, y: cursorY - 26, size: 6.5, font: courier, color: midSlate });
      }

      page.drawText(controls.substring(0, 50) + '...', { x: margin + 200, y: cursorY - 14, size: 7, font: helvetica, color: darkSlate });
      page.drawText(ppe.substring(0, 25), { x: width - margin - 120, y: cursorY - 14, size: 6.5, font: courier, color: darkSlate });

      cursorY -= 40;
    }

    if (content.emergency_procedures) {
      cursorY -= 10;
      page.drawText('EMERGENCY PROCEDURES:', { x: margin, y: cursorY, size: 8, font: helveticaBold, color: black });
      cursorY -= 12;
      page.drawText(content.emergency_procedures.substring(0, 120), { x: margin, y: cursorY, size: 7.5, font: helvetica, color: darkSlate });
      cursorY -= 20;
    }

  } else if (doc.type === 'safety_plan') {
    page.drawText(`PROJECT: ${content.project_name || 'Commercial Construction'}`, { x: margin, y: cursorY, size: 10, font: helveticaBold, color: black });
    cursorY -= 14;
    page.drawText(`SAFETY OFFICER: ${content.site_safety_officer || 'Marcus Vance'}   |   DURATION: ${content.duration_weeks || 12} Weeks`, {
      x: margin, y: cursorY, size: 8, font: courier, color: midSlate
    });
    cursorY -= 20;

    const sections = content.sections || [];
    for (let i = 0; i < Math.min(sections.length, 2); i++) {
      const sec = sections[i];
      page.drawText(`SECTION ${i + 1}: ${sec.category.toUpperCase()} (${sec.osha_subpart || 'OSHA 1926'})`, {
        x: margin, y: cursorY, size: 8.5, font: helveticaBold, color: darkSlate
      });
      cursorY -= 12;
      page.drawText(sec.policy_statement.substring(0, 110), { x: margin, y: cursorY, size: 7.5, font: helvetica, color: midSlate });
      cursorY -= 16;
    }

    if (content.general_site_rules?.length) {
      page.drawText('MANDATORY SITE RULES:', { x: margin, y: cursorY, size: 8, font: helveticaBold, color: black });
      cursorY -= 12;
      for (const rule of content.general_site_rules.slice(0, 3)) {
        page.drawText(`• ${rule.substring(0, 90)}`, { x: margin + 8, y: cursorY, size: 7, font: helvetica, color: darkSlate });
        cursorY -= 11;
      }
    }

  } else if (doc.type === 'toolbox_talk') {
    page.drawText(`TOPIC: ${content.topic || 'Safety Tailgate Meeting'}`, { x: margin, y: cursorY, size: 10, font: helveticaBold, color: black });
    cursorY -= 14;
    page.drawText(`TRADE: ${content.trade || org.primary_trade}   |   DURATION: ${content.duration_minutes || 10} Mins   |   ${content.osha_reference || 'OSHA 1926'}`, {
      x: margin, y: cursorY, size: 8, font: courier, color: midSlate
    });
    cursorY -= 20;

    if (content.summary) {
      page.drawText(content.summary.substring(0, 130), { x: margin, y: cursorY, size: 8, font: helvetica, color: darkSlate });
      cursorY -= 20;
    }

    page.drawText('TALKING POINTS FOR CREW:', { x: margin, y: cursorY, size: 8.5, font: helveticaBold, color: black });
    cursorY -= 13;
    for (const pt of (content.talking_points || []).slice(0, 4)) {
      page.drawText(`- ${pt.substring(0, 95)}`, { x: margin + 8, y: cursorY, size: 7.5, font: helvetica, color: darkSlate });
      cursorY -= 12;
    }

  } else if (doc.type === 'quote') {
    const fin = content.financials || {};
    page.drawText(`CLIENT: ${content.client_name || 'Client Corp'}   |   PROJECT: ${content.project_name || 'Scope of Work'}`, {
      x: margin, y: cursorY, size: 9, font: helveticaBold, color: black
    });
    cursorY -= 14;
    page.drawText(`VALID UNTIL: ${content.valid_until_date || '30 Days from issue'}`, {
      x: margin, y: cursorY, size: 8, font: courier, color: midSlate
    });
    cursorY -= 20;

    // Financial Summary Box
    page.drawRectangle({
      x: margin,
      y: cursorY - 45,
      width: width - margin * 2,
      height: 45,
      color: lightGrey,
      borderWidth: 1,
      borderColor: borderGrey,
    });

    page.drawText('MATERIALS:', { x: margin + 12, y: cursorY - 18, size: 7, font: courier, color: midSlate });
    page.drawText(`$${(fin.subtotal_materials || 0).toLocaleString()}`, { x: margin + 12, y: cursorY - 32, size: 10, font: courierBold, color: black });

    page.drawText('LABOR:', { x: margin + 110, y: cursorY - 18, size: 7, font: courier, color: midSlate });
    page.drawText(`$${(fin.subtotal_labor || 0).toLocaleString()}`, { x: margin + 110, y: cursorY - 32, size: 10, font: courierBold, color: black });

    page.drawText('OVERHEAD/MARGIN:', { x: margin + 210, y: cursorY - 18, size: 7, font: courier, color: midSlate });
    page.drawText(`${fin.target_margin_percentage || 0}%`, { x: margin + 210, y: cursorY - 32, size: 10, font: courierBold, color: black });

    page.drawText('CONTRACT TOTAL:', { x: width - margin - 130, y: cursorY - 18, size: 7, font: courierBold, color: primaryNavy });
    page.drawText(`$${(fin.contract_price || 0).toLocaleString()}`, { x: width - margin - 130, y: cursorY - 34, size: 13, font: courierBold, color: primaryNavy });

    cursorY -= 60;

    if (content.executive_summary) {
      page.drawText('EXECUTIVE SUMMARY & SCOPE:', { x: margin, y: cursorY, size: 8, font: helveticaBold, color: black });
      cursorY -= 12;
      page.drawText(content.executive_summary.substring(0, 120), { x: margin, y: cursorY, size: 7.5, font: helvetica, color: darkSlate });
      cursorY -= 20;
    }

  } else if (doc.type === 'change_order') {
    const fin = content.financials || {};
    page.drawText(`CHANGE ORDER: ${content.change_order_number || 'CO-001'}   |   ${content.project_name || 'Project'}`, {
      x: margin, y: cursorY, size: 9, font: helveticaBold, color: black
    });
    cursorY -= 14;
    page.drawText(`REASON: ${(content.reason_for_change || 'Unforeseen Conditions').toUpperCase().replace(/_/g, ' ')}`, {
      x: margin, y: cursorY, size: 8, font: courier, color: midSlate
    });
    cursorY -= 20;

    // Change Order Summary Box
    page.drawRectangle({
      x: margin,
      y: cursorY - 45,
      width: width - margin * 2,
      height: 45,
      color: lightGrey,
      borderWidth: 1,
      borderColor: borderGrey,
    });

    page.drawText('ORIGINAL CONTRACT:', { x: margin + 12, y: cursorY - 18, size: 7, font: courier, color: midSlate });
    page.drawText(`$${(fin.original_contract_sum || 0).toLocaleString()}`, { x: margin + 12, y: cursorY - 32, size: 9, font: courierBold, color: black });

    page.drawText('NET ADJUSTMENT:', { x: margin + 140, y: cursorY - 18, size: 7, font: courierBold, color: rgb(0.1, 0.5, 0.2) });
    page.drawText(`+$${(fin.net_change_amount || 0).toLocaleString()}`, { x: margin + 140, y: cursorY - 32, size: 10, font: courierBold, color: rgb(0.1, 0.5, 0.2) });

    page.drawText('REVISED CONTRACT SUM:', { x: width - margin - 150, y: cursorY - 18, size: 7, font: courierBold, color: primaryNavy });
    page.drawText(`$${(fin.new_contract_sum || 0).toLocaleString()}`, { x: width - margin - 150, y: cursorY - 34, size: 12, font: courierBold, color: primaryNavy });

    cursorY -= 60;

    if (content.justification_narrative) {
      page.drawText('CONTRACTUAL JUSTIFICATION:', { x: margin, y: cursorY, size: 8, font: helveticaBold, color: black });
      cursorY -= 12;
      page.drawText(content.justification_narrative.substring(0, 130), { x: margin, y: cursorY, size: 7.5, font: helvetica, color: darkSlate });
      cursorY -= 20;
    }
  }

  // ── 4. DIGITAL SIGNATURE BLOCK ──
  cursorY = Math.max(cursorY - 20, 140);

  page.drawRectangle({
    x: margin,
    y: cursorY - 60,
    width: width - margin * 2,
    height: 60,
    borderWidth: 1,
    borderColor: borderGrey,
    color: rgb(0.98, 0.99, 1),
  });

  page.drawText('DIGITAL EXECUTION & LEGAL VERIFICATION', {
    x: margin + 10,
    y: cursorY - 14,
    size: 7,
    font: courierBold,
    color: midSlate,
  });

  if (doc.is_signed && doc.signature_data) {
    const sig = doc.signature_data;

    // Try embedding base64 image if valid PNG
    let imageDrawn = false;
    if (sig.signature_image && sig.signature_image.includes('data:image/png;base64,')) {
      try {
        const base64Data = sig.signature_image.replace('data:image/png;base64,', '');
        const imageBytes = Buffer.from(base64Data, 'base64');
        const embeddedImage = await pdfDoc.embedPng(imageBytes);
        page.drawImage(embeddedImage, {
          x: margin + 10,
          y: cursorY - 52,
          width: 120,
          height: 32,
        });
        imageDrawn = true;
      } catch {
        imageDrawn = false;
      }
    }

    if (!imageDrawn) {
      page.drawText(`[SIGNED: ${sig.signer_name}]`, {
        x: margin + 10,
        y: cursorY - 35,
        size: 11,
        font: helveticaBold,
        color: primaryNavy,
      });
    }

    page.drawText(`SIGNER: ${sig.signer_name}`, {
      x: margin + 150,
      y: cursorY - 28,
      size: 8,
      font: helveticaBold,
      color: black,
    });

    page.drawText(`TIMESTAMP: ${new Date(sig.signed_at).toISOString()}`, {
      x: margin + 150,
      y: cursorY - 40,
      size: 7,
      font: courier,
      color: midSlate,
    });

    page.drawText(`HASH: ${sig.signer_ip_hash.substring(0, 32)}...`, {
      x: margin + 150,
      y: cursorY - 50,
      size: 6.5,
      font: courier,
      color: midSlate,
    });

    page.drawText('VERIFIED / LOCKED', {
      x: width - margin - 120,
      y: cursorY - 34,
      size: 8,
      font: courierBold,
      color: rgb(0.1, 0.6, 0.2),
    });
  } else {
    page.drawText('AUTHORIZED SIGNATURE: _____________________________________   DATE: __________________', {
      x: margin + 10,
      y: cursorY - 38,
      size: 7.5,
      font: courier,
      color: midSlate,
    });
    page.drawText('AWAITING EXECUTION', {
      x: width - margin - 125,
      y: cursorY - 38,
      size: 7.5,
      font: courierBold,
      color: rgb(0.8, 0.4, 0),
    });
  }

  // ── 5. WATERMARK (IF APPLICABLE) ──
  if (watermark) {
    page.drawText(watermark, {
      x: margin + 50,
      y: height / 2,
      size: 32,
      font: courierBold,
      color: rgb(0.85, 0.2, 0.2),
      opacity: 0.25,
      rotate: degrees(35),
    });
  }

  // ── 6. FOOTER ──
  page.drawText(
    `AVORRIA CONTRACTOR OPERATING SYSTEM  |  DOC: ${doc.id}  |  V${doc.version}  |  PAGE 1 OF 1`,
    {
      x: margin,
      y: 20,
      size: 6.5,
      font: courier,
      color: midSlate,
    }
  );

  return await pdfDoc.save();
}
