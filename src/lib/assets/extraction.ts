/**
 * AVORRIA ASSETS — TEXT EXTRACTION & EMBEDDING PIPELINE
 * Prompt 3: Asset & Media Intelligence
 *
 * Triggered server-side after upload confirm. Non-blocking — runs as a
 * background async job so the upload response returns immediately.
 *
 * Pipeline:
 * 1. extractText(buffer, mimeType) — PDF text extraction (native) or null for images
 * 2. chunkText(text) — sliding window chunker with overlap
 * 3. generateEmbedding(text) — OpenAI text-embedding-3-small (mock in test mode)
 * 4. runExtractionPipeline(assetDocumentId, orgId) — orchestrates all steps
 */

import { PDFDocument } from 'pdf-lib';
import {
  saveDocumentChunks,
  updateAssetDocumentExtractionStatus,
  getAssetDocument,
} from './db';
import { DocumentChunk } from './types';

// ─────────────────────────────────────────────────────────────
// TEXT EXTRACTION
// ─────────────────────────────────────────────────────────────

/**
 * Extract text from a file buffer.
 * - PDF: uses pdf-lib to pull raw text (covers native/digital PDFs)
 * - Image (jpeg/png/webp): returns null — OCR deferred (image stored, text TBD)
 * - Unknown: returns null
 *
 * Returns null for images/unsupported — caller sets extraction_status = 'not_applicable'
 */
export async function extractText(
  buffer: Buffer,
  mimeType: string
): Promise<string | null> {
  if (
    mimeType === 'image/jpeg' ||
    mimeType === 'image/jpg' ||
    mimeType === 'image/png' ||
    mimeType === 'image/webp' ||
    mimeType === 'image/heic'
  ) {
    // OCR not implemented in v1 — return null to mark as not_applicable
    // TODO: wire up Google Vision or Tesseract.js for field nameplate photos
    return null;
  }

  if (mimeType === 'application/pdf') {
    try {
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pageCount = pdfDoc.getPageCount();
      const textParts: string[] = [];

      // pdf-lib does not expose a public text extraction API;
      // we extract from the raw PDF content stream for native text PDFs.
      // For scanned PDFs this returns empty — same as images, deferred to OCR.
      for (let i = 0; i < pageCount; i++) {
        const page = pdfDoc.getPage(i);
        // Access internal operators for text extraction
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ops = (page as any).node.Contents()?.toString() ?? '';
          // Extract text between BT (begin text) and ET (end text) operators
          const textMatches = ops.match(/BT[\s\S]*?ET/g) ?? [];
          for (const block of textMatches) {
            const tokens = block.match(/\(([^)]*)\)\s*Tj/g) ?? [];
            const words = tokens.map((t: string) => t.replace(/^\(/, '').replace(/\)\s*Tj$/, ''));
            textParts.push(words.join(' '));
          }
        } catch {
          // Some PDF pages have no accessible text stream
        }
      }

      const fullText = textParts.join('\n').trim();
      // If we got very little text, it's likely a scanned PDF — treat as not_applicable
      return fullText.length > 50 ? fullText : null;
    } catch {
      return null;
    }
  }

  // Plain text fallback
  if (mimeType === 'text/plain') {
    return buffer.toString('utf-8');
  }

  return null;
}

// ─────────────────────────────────────────────────────────────
// TEXT CHUNKER
// ─────────────────────────────────────────────────────────────

/**
 * Split text into overlapping chunks of approximately targetTokens words.
 * Uses word-count as a proxy for token count (1 word ≈ 1.3 tokens in English).
 * Overlap ensures that a spec table split at a chunk boundary is not lost.
 */
export function chunkText(
  text: string,
  targetTokens: number = 600,
  overlapTokens: number = 80
): string[] {
  const targetWords = Math.floor(targetTokens / 1.3);
  const overlapWords = Math.floor(overlapTokens / 1.3);

  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  if (words.length <= targetWords) return [text];

  const chunks: string[] = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + targetWords, words.length);
    chunks.push(words.slice(start, end).join(' '));
    if (end >= words.length) break;
    start = end - overlapWords;
    if (start <= 0) start = end; // Safety: prevent infinite loop
  }

  return chunks;
}

// ─────────────────────────────────────────────────────────────
// EMBEDDING GENERATION
// ─────────────────────────────────────────────────────────────

let openaiClient: import('openai').OpenAI | null = null;

function getOpenAIClient(): import('openai').OpenAI {
  if (openaiClient) return openaiClient;
  // Lazy import to avoid loading openai in environments that don't need it
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { OpenAI } = require('openai');
  openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  return openaiClient!;
}

/**
 * Generate a 1536-dimensional embedding vector for the given text.
 *
 * In test mode (no OPENAI_API_KEY), returns a deterministic mock vector
 * based on a simple hash of the input string. This allows the full
 * search pipeline to be tested without a live API key.
 *
 * In production, uses OpenAI text-embedding-3-small (1536 dims, $0.02/1M tokens).
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    return deterministicMockEmbedding(text);
  }

  const client = getOpenAIClient();
  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    dimensions: 1536,
  });
  return response.data[0].embedding;
}

/**
 * Deterministic mock embedding for test mode.
 * Produces a normalised 1536-dim vector seeded from the text hash.
 * Two identical strings → identical vectors. Similar strings → not necessarily similar.
 */
function deterministicMockEmbedding(text: string): number[] {
  const dims = 1536;
  const seed = simpleHash(text);
  const vec: number[] = [];
  for (let i = 0; i < dims; i++) {
    // LCG-style PRNG seeded per-dimension
    const val = Math.sin(seed * (i + 1) * 9301 + 49297) * 0.5;
    vec.push(val);
  }
  // Normalise to unit vector
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
  return norm === 0 ? vec : vec.map((v) => v / norm);
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// ─────────────────────────────────────────────────────────────
// FULL EXTRACTION PIPELINE
// ─────────────────────────────────────────────────────────────

/**
 * Runs the complete extract → chunk → embed → write pipeline for an uploaded document.
 *
 * Called non-blocking from the upload confirm route:
 *   runExtractionPipeline(docId, orgId).catch(console.error);  // fire-and-forget
 *
 * Updates asset_documents.extraction_status throughout so the UI can show
 * pending → complete / failed / not_applicable.
 */
export async function runExtractionPipeline(
  assetDocumentId: string,
  orgId: string,
  fileBuffer: Buffer,
  mimeType: string
): Promise<void> {
  try {
    // 1. Extract text
    const text = await extractText(fileBuffer, mimeType);

    if (text === null) {
      // Image or unsupported — mark as not_applicable (no error, just no text)
      await updateAssetDocumentExtractionStatus(
        assetDocumentId,
        'not_applicable'
      );
      return;
    }

    // 2. Chunk text
    const chunks = chunkText(text);
    if (chunks.length === 0) {
      await updateAssetDocumentExtractionStatus(assetDocumentId, 'complete', text);
      return;
    }

    // 3. Generate embeddings + build chunk records
    const chunkRecords: DocumentChunk[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await generateEmbedding(chunks[i]);
      chunkRecords.push({
        id: `chunk-${assetDocumentId}-${i}-${Date.now()}`,
        org_id: orgId,
        asset_document_id: assetDocumentId,
        chunk_index: i,
        chunk_text: chunks[i],
        embedding,
        source_type: 'document',
        created_at: new Date().toISOString(),
      });
    }

    // 4. Write chunks + update document status
    await saveDocumentChunks(chunkRecords);
    await updateAssetDocumentExtractionStatus(assetDocumentId, 'complete', text);
  } catch (err) {
    console.error('[extraction-pipeline] failed for', assetDocumentId, err);
    await updateAssetDocumentExtractionStatus(assetDocumentId, 'failed');
  }
}

/**
 * Index a service log's work_performed text into document_chunks.
 * Called after a service log is created so "when was it last serviced"
 * queries hit the same search index as uploaded documents.
 *
 * Uses a synthetic asset_document_id (the log id itself) since service logs
 * are not file-backed. The chunk's source_type = 'service_log'.
 */
export async function indexServiceLogText(
  logId: string,
  orgId: string,
  workPerformed: string,
  assetName: string
): Promise<void> {
  try {
    const enriched = `Service performed on ${assetName}: ${workPerformed}`;
    const chunks = chunkText(enriched);
    if (chunks.length === 0) return;

    const chunkRecords: DocumentChunk[] = await Promise.all(
      chunks.map(async (text, i) => {
        const embedding = await generateEmbedding(text);
        return {
          id: `chunk-svclog-${logId}-${i}-${Date.now()}`,
          org_id: orgId,
          asset_document_id: logId, // synthetic — service log as chunk source
          chunk_index: i,
          chunk_text: text,
          embedding,
          source_type: 'service_log' as const,
          service_log_id: logId,
          created_at: new Date().toISOString(),
        };
      })
    );

    await saveDocumentChunks(chunkRecords);
  } catch (err) {
    console.error('[index-service-log] failed for', logId, err);
  }
}
