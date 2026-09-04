import zlib from 'zlib';
import { ContractorResource, ChecklistItemDef } from './catalogue';

export interface ResourceDocxPayload {
  resource: ContractorResource;
  formData: Record<string, any>;
  organization?: {
    name: string;
    primaryTrade?: string;
    statesLicensed?: string[];
  };
  checklists?: ChecklistItemDef[];
  tableRows?: Record<string, any>[];
  referenceNumber?: string;
}

/**
 * Generates an OpenXML (.docx) document in pure TypeScript without external runtime dependencies.
 * Creates a valid ZIP archive containing `word/document.xml`, `[Content_Types].xml`, `_rels`, and `styles.xml`.
 */
export async function renderResourceToDocxBuffer(payload: ResourceDocxPayload): Promise<Buffer> {
  const { resource, formData, organization, checklists, tableRows, referenceNumber } = payload;

  const orgName = organization?.name || formData.companyName || 'Vance Commercial Electric LLC';
  const orgTrade = organization?.primaryTrade || formData.primaryTrade || 'Commercial Specialty Contractor';
  const refId = referenceNumber || `${resource.code}-${Date.now().toString().slice(-6)}`;
  const dateStr = formData.reportDate || formData.bidDate || formData.auditDate || new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const escapeXml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  // Generate document body paragraphs and tables
  let bodyXml = '';

  // 1. Header & Title
  bodyXml += `
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Title"/>
        <w:spacing w:after="120"/>
      </w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="36"/><w:color w:val="0A1428"/></w:rPr>
        <w:t>${escapeXml(orgName.toUpperCase())}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:spacing w:after="240"/>
      </w:pPr>
      <w:r>
        <w:rPr><w:sz w:val="20"/><w:color w:val="0284C7"/><w:b/></w:rPr>
        <w:t>${escapeXml(resource.title)}</w:t>
      </w:r>
      <w:r>
        <w:rPr><w:sz w:val="18"/><w:color w:val="64748B"/></w:rPr>
        <w:t>  |  Doc Ref: ${escapeXml(refId)}  |  Standard: ${escapeXml(resource.standard)}  |  Date: ${escapeXml(dateStr)}</w:t>
      </w:r>
    </w:p>
  `;

  // 2. Resource Sections (Structured Tables)
  for (const section of resource.sections) {
    bodyXml += `
      <w:p>
        <w:pPr>
          <w:spacing w:before="240" w:after="120"/>
        </w:pPr>
        <w:r>
          <w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="0F172A"/></w:rPr>
          <w:t>${escapeXml(section.title.toUpperCase())}</w:t>
        </w:r>
      </w:p>
      <w:tbl>
        <w:tblPr>
          <w:tblW w:w="0" w:type="auto"/>
          <w:tblBorders>
            <w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
            <w:left w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
            <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
            <w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
            <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
            <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
          </w:tblBorders>
        </w:tblPr>
    `;

    for (const field of section.fields) {
      const val = String(formData[field.id] ?? field.defaultValue ?? '—');
      bodyXml += `
        <w:tr>
          <w:tc>
            <w:tcPr><w:tcW w:w="3000" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="F8FAFC"/></w:tcPr>
            <w:p><w:r><w:rPr><w:b/><w:sz w:val="18"/><w:color w:val="475569"/></w:rPr><w:t>${escapeXml(field.label)}</w:t></w:r></w:p>
          </w:tc>
          <w:tc>
            <w:tcPr><w:tcW w:w="6000" w:type="dxa"/></w:tcPr>
            <w:p><w:r><w:rPr><w:sz w:val="18"/><w:color w:val="0F172A"/></w:rPr><w:t>${escapeXml(val)}</w:t></w:r></w:p>
          </w:tc>
        </w:tr>
      `;
    }
    bodyXml += `</w:tbl>`;
  }

  // 3. Checklist Table (if present)
  const activeChecklist = checklists || resource.checklistItems;
  if (activeChecklist && activeChecklist.length > 0) {
    bodyXml += `
      <w:p>
        <w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr>
        <w:r><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="0F172A"/></w:rPr><w:t>VERIFICATION AUDIT ITEMS &amp; COMPLIANCE STATUS</w:t></w:r>
      </w:p>
      <w:tbl>
        <w:tblPr>
          <w:tblW w:w="0" w:type="auto"/>
          <w:tblBorders>
            <w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
            <w:left w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
            <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
            <w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
            <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
            <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
          </w:tblBorders>
        </w:tblPr>
        <w:tr>
          <w:tc><w:tcPr><w:tcW w:w="1500" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="E2E8F0"/></w:tcPr><w:p><w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr><w:t>STATUS</w:t></w:r></w:p></w:tc>
          <w:tc><w:tcPr><w:tcW w:w="5500" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="E2E8F0"/></w:tcPr><w:p><w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr><w:t>REQUIREMENT</w:t></w:r></w:p></w:tc>
          <w:tc><w:tcPr><w:tcW w:w="2000" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="E2E8F0"/></w:tcPr><w:p><w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr><w:t>RESPONSIBLE</w:t></w:r></w:p></w:tc>
        </w:tr>
    `;

    for (const item of activeChecklist) {
      const statusLabel = item.status === 'passed' ? 'PASSED' : item.status === 'in_progress' ? 'PENDING' : 'N/A';
      bodyXml += `
        <w:tr>
          <w:tc><w:tcPr><w:tcW w:w="1500" w:type="dxa"/></w:tcPr><w:p><w:r><w:rPr><w:b/><w:sz w:val="18"/><w:color w:val="${item.status === 'passed' ? '16A34A' : 'CA8A04'}"/></w:rPr><w:t>${statusLabel}</w:t></w:r></w:p></w:tc>
          <w:tc><w:tcPr><w:tcW w:w="5500" w:type="dxa"/></w:tcPr><w:p><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:t>${escapeXml(item.requirement)}</w:t></w:r></w:p></w:tc>
          <w:tc><w:tcPr><w:tcW w:w="2000" w:type="dxa"/></w:tcPr><w:p><w:r><w:rPr><w:sz w:val="18"/><w:color w:val="64748B"/></w:rPr><w:t>${escapeXml(item.responsibleParty)}</w:t></w:r></w:p></w:tc>
        </w:tr>
      `;
    }
    bodyXml += `</w:tbl>`;
  }

  // 4. Scheduled Line Items / Action Register Table (if present)
  const activeTableRows = tableRows || resource.defaultTableRows;
  if (activeTableRows && activeTableRows.length > 0) {
    bodyXml += `
      <w:p>
        <w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr>
        <w:r><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="0F172A"/></w:rPr><w:t>SCHEDULED LINE ITEMS &amp; ACTION SCHEDULE</w:t></w:r>
      </w:p>
      <w:tbl>
        <w:tblPr>
          <w:tblW w:w="0" w:type="auto"/>
          <w:tblBorders>
            <w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
            <w:left w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
            <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
            <w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
            <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
            <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
          </w:tblBorders>
        </w:tblPr>
    `;

    for (const row of activeTableRows) {
      const col1 = String(row.id || row.key || '•');
      const col2 = String(row.description || row.item || Object.values(row)[1] || '');
      const col3 = String(row.owner || row.qty || Object.values(row)[2] || '');
      const col4 = String(row.status || row.unitPrice || Object.values(row)[3] || '');

      bodyXml += `
        <w:tr>
          <w:tc><w:tcPr><w:tcW w:w="1200" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="F8FAFC"/></w:tcPr><w:p><w:r><w:rPr><w:b/><w:sz w:val="18"/><w:color w:val="0A1428"/></w:rPr><w:t>${escapeXml(col1)}</w:t></w:r></w:p></w:tc>
          <w:tc><w:tcPr><w:tcW w:w="4800" w:type="dxa"/></w:tcPr><w:p><w:r><w:rPr><w:sz w:val="18"/><w:color w:val="0F172A"/></w:rPr><w:t>${escapeXml(col2)}</w:t></w:r></w:p></w:tc>
          <w:tc><w:tcPr><w:tcW w:w="1500" w:type="dxa"/></w:tcPr><w:p><w:r><w:rPr><w:sz w:val="18"/><w:color w:val="64748B"/></w:rPr><w:t>${escapeXml(col3)}</w:t></w:r></w:p></w:tc>
          <w:tc><w:tcPr><w:tcW w:w="1500" w:type="dxa"/></w:tcPr><w:p><w:r><w:rPr><w:b/><w:sz w:val="18"/><w:color w:val="0F172A"/></w:rPr><w:t>${escapeXml(col4)}</w:t></w:r></w:p></w:tc>
        </w:tr>
      `;
    }
    bodyXml += `</w:tbl>`;
  }

  // 5. Formal Commercial Execution & Authorization Table (No crude underscores)
  bodyXml += `
    <w:p><w:pPr><w:spacing w:before="360" w:after="120"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/><w:color w:val="0F172A"/></w:rPr><w:t>COMMERCIAL EXECUTION &amp; RECORD CERTIFICATION</w:t></w:r></w:p>
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="0" w:type="auto"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
          <w:left w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
          <w:bottom w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
          <w:right w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
          <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
          <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tr>
        <w:tc><w:tcPr><w:tcW w:w="4500" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="F8FAFC"/></w:tcPr>
          <w:p><w:r><w:rPr><w:b/><w:sz w:val="18"/><w:color w:val="0A1428"/></w:rPr><w:t>AUTHORIZED CONTRACTOR SIGNATORY</w:t></w:r></w:p>
        </w:tc>
        <w:tc><w:tcPr><w:tcW w:w="4500" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="F8FAFC"/></w:tcPr>
          <w:p><w:r><w:rPr><w:b/><w:sz w:val="18"/><w:color w:val="0A1428"/></w:rPr><w:t>CLIENT / GENERAL CONTRACTOR ACCEPTANCE</w:t></w:r></w:p>
        </w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:tcPr><w:tcW w:w="4500" w:type="dxa"/></w:tcPr>
          <w:p><w:spacing w:after="80"/><w:r><w:rPr><w:sz w:val="16"/><w:color w:val="64748B"/></w:rPr><w:t>Printed Name: __________________________</w:t></w:r></w:p>
          <w:p><w:spacing w:after="80"/><w:r><w:rPr><w:sz w:val="16"/><w:color w:val="64748B"/></w:rPr><w:t>Title / Role:   __________________________</w:t></w:r></w:p>
          <w:p><w:spacing w:after="80"/><w:r><w:rPr><w:sz w:val="16"/><w:color w:val="64748B"/></w:rPr><w:t>Signature:     __________________________</w:t></w:r></w:p>
          <w:p><w:r><w:rPr><w:sz w:val="16"/><w:color w:val="64748B"/></w:rPr><w:t>Execution Date: ________________________</w:t></w:r></w:p>
        </w:tc>
        <w:tc><w:tcPr><w:tcW w:w="4500" w:type="dxa"/></w:tcPr>
          <w:p><w:spacing w:after="80"/><w:r><w:rPr><w:sz w:val="16"/><w:color w:val="64748B"/></w:rPr><w:t>Printed Name: __________________________</w:t></w:r></w:p>
          <w:p><w:spacing w:after="80"/><w:r><w:rPr><w:sz w:val="16"/><w:color w:val="64748B"/></w:rPr><w:t>Title / Role:   __________________________</w:t></w:r></w:p>
          <w:p><w:spacing w:after="80"/><w:r><w:rPr><w:sz w:val="16"/><w:color w:val="64748B"/></w:rPr><w:t>Signature:     __________________________</w:t></w:r></w:p>
          <w:p><w:r><w:rPr><w:sz w:val="16"/><w:color w:val="64748B"/></w:rPr><w:t>Execution Date: ________________________</w:t></w:r></w:p>
        </w:tc>
      </w:tr>
    </w:tbl>
    <w:p><w:pPr><w:spacing w:before="240"/></w:pPr><w:r><w:rPr><w:sz w:val="16"/><w:color w:val="94A3B8"/><w:i/></w:rPr><w:t>Review Notice: Review this document against the applicable contract, project requirements and governing law before use.</w:t></w:r></w:p>
  `;

  // Assemble full WordprocessingML document.xml
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${bodyXml}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const files = [
    { name: '[Content_Types].xml', content: Buffer.from(contentTypesXml, 'utf-8') },
    { name: '_rels/.rels', content: Buffer.from(relsXml, 'utf-8') },
    { name: 'word/document.xml', content: Buffer.from(documentXml, 'utf-8') },
  ];

  return createZipArchive(files);
}

/**
 * Lightweight in-memory ZIP builder compliant with PKZip standard.
 */
function createZipArchive(files: { name: string; content: Buffer }[]): Buffer {
  const fileEntries: {
    name: string;
    crc: number;
    compressedData: Buffer;
    uncompressedSize: number;
    compressedSize: number;
    offset: number;
  }[] = [];

  let currentOffset = 0;
  const chunks: Buffer[] = [];

  for (const file of files) {
    const rawData = file.content;
    const crc = computeCrc32(rawData);
    // Deflate data
    const deflated = zlib.deflateRawSync(rawData);

    const nameBuffer = Buffer.from(file.name, 'utf-8');
    const localHeader = Buffer.alloc(30 + nameBuffer.length);

    localHeader.writeUInt32LE(0x04034b50, 0); // Local file header signature
    localHeader.writeUInt16LE(20, 4);          // Version needed (2.0)
    localHeader.writeUInt16LE(0, 6);           // General purpose flags
    localHeader.writeUInt16LE(8, 8);           // Compression method (8 = Deflate)
    localHeader.writeUInt16LE(0, 10);          // Mod time
    localHeader.writeUInt16LE(0, 12);          // Mod date
    localHeader.writeUInt32LE(crc, 14);        // CRC-32
    localHeader.writeUInt32LE(deflated.length, 18); // Compressed size
    localHeader.writeUInt32LE(rawData.length, 22);  // Uncompressed size
    localHeader.writeUInt16LE(nameBuffer.length, 26); // File name length
    localHeader.writeUInt16LE(0, 28);          // Extra field length
    nameBuffer.copy(localHeader, 30);

    chunks.push(localHeader);
    chunks.push(deflated);

    fileEntries.push({
      name: file.name,
      crc,
      compressedData: deflated,
      uncompressedSize: rawData.length,
      compressedSize: deflated.length,
      offset: currentOffset,
    });

    currentOffset += localHeader.length + deflated.length;
  }

  const centralDirStart = currentOffset;
  let centralDirSize = 0;

  for (const entry of fileEntries) {
    const nameBuffer = Buffer.from(entry.name, 'utf-8');
    const centralHeader = Buffer.alloc(46 + nameBuffer.length);

    centralHeader.writeUInt32LE(0x02014b50, 0); // Central directory header signature
    centralHeader.writeUInt16LE(20, 4);         // Version made by
    centralHeader.writeUInt16LE(20, 6);         // Version needed
    centralHeader.writeUInt16LE(0, 8);          // Flags
    centralHeader.writeUInt16LE(8, 10);         // Compression method
    centralHeader.writeUInt16LE(0, 12);         // Mod time
    centralHeader.writeUInt16LE(0, 14);         // Mod date
    centralHeader.writeUInt32LE(entry.crc, 16); // CRC-32
    centralHeader.writeUInt32LE(entry.compressedSize, 20); // Compressed size
    centralHeader.writeUInt32LE(entry.uncompressedSize, 24); // Uncompressed size
    centralHeader.writeUInt16LE(nameBuffer.length, 28); // File name length
    centralHeader.writeUInt16LE(0, 30);         // Extra field length
    centralHeader.writeUInt16LE(0, 32);         // File comment length
    centralHeader.writeUInt16LE(0, 34);         // Disk number start
    centralHeader.writeUInt16LE(0, 36);         // Internal file attributes
    centralHeader.writeUInt32LE(0, 38);         // External file attributes
    centralHeader.writeUInt32LE(entry.offset, 42); // Relative offset of local header
    nameBuffer.copy(centralHeader, 46);

    chunks.push(centralHeader);
    centralDirSize += centralHeader.length;
  }

  // End of Central Directory Record
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);            // EOCD signature
  eocd.writeUInt16LE(0, 4);                     // Disk number
  eocd.writeUInt16LE(0, 6);                     // Disk with central dir
  eocd.writeUInt16LE(fileEntries.length, 8);    // Entries on disk
  eocd.writeUInt16LE(fileEntries.length, 10);   // Total entries
  eocd.writeUInt32LE(centralDirSize, 12);       // Central dir size
  eocd.writeUInt32LE(centralDirStart, 16);      // Offset of start of central directory
  eocd.writeUInt16LE(0, 20);                    // Comment length

  chunks.push(eocd);

  return Buffer.concat(chunks);
}

/**
 * Standard CRC32 calculation table
 */
let crcTable: Uint32Array | null = null;
function makeCrcTable(): Uint32Array {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

function computeCrc32(buffer: Buffer): number {
  if (!crcTable) crcTable = makeCrcTable();
  let crc = 0 ^ -1;
  for (let i = 0; i < buffer.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buffer[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}
