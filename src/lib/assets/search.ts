/**
 * AVORRIA ASSETS — RAG SEARCH ENGINE
 * Prompt 3: Asset & Media Intelligence
 *
 * Flow:
 * 1. Embed user query
 * 2. pgvector similarity search scoped to org_id (NEVER cross-org)
 * 3. Threshold guard: if maxSimilarity < THRESHOLD → return answered:false (Claude NOT called)
 * 4. Claude answers from retrieved chunks (conversational, source-cited)
 * 5. Return { answered, answer, sourceDocuments }
 *
 * INVARIANT: Every answer must cite a source document.
 * If no matching chunks exist, say so — never let Claude answer from general knowledge.
 */

import Anthropic from '@anthropic-ai/sdk';
import { generateEmbedding } from './extraction';
import { searchChunksByEmbedding, getAssetDocument } from './db';
import {
  SearchResponse,
  AssetDocument,
  ChunkWithSimilarity,
} from './types';

// Minimum cosine similarity required to use a chunk as context.
// Below this threshold: no answer returned. Claude not called.
const SIMILARITY_THRESHOLD = 0.72;
const MAX_CHUNKS = 6;

let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (anthropicClient) return anthropicClient;
  anthropicClient = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  return anthropicClient;
}

// ─────────────────────────────────────────────────────────────
// MAIN SEARCH ENTRY POINT
// ─────────────────────────────────────────────────────────────

/**
 * Answer a natural language query about an org's asset library.
 *
 * @param query  - User's question ("torque spec for flange bolts")
 * @param orgId  - Organisation UUID. Search is strictly scoped to this org.
 * @returns SearchResponse with answered flag, answer text, and source documents
 */
export async function answerAssetQuery(
  query: string,
  orgId: string
): Promise<SearchResponse> {
  // 1. Embed the query
  const queryVector = await generateEmbedding(query);

  // 2. Retrieve top matching chunks (org-scoped)
  const chunks = await searchChunksByEmbedding(
    orgId,
    queryVector,
    MAX_CHUNKS,
    SIMILARITY_THRESHOLD
  );

  // 3. Threshold guard — no matching chunks, do NOT call Claude
  if (chunks.length === 0) {
    return {
      answered: false,
      message:
        'No matching documents found in your asset library. Upload relevant manuals, spec sheets, or service records and try again.',
      sourceDocuments: [],
    };
  }

  // 4. Resolve source documents (deduplicated)
  const sourceDocuments = await resolveSourceDocuments(chunks, orgId);

  // 5. Build Claude context
  const contextText = buildContext(chunks, sourceDocuments);

  // 6. Claude answer — restricted to provided context only
  const answer = await callClaude(query, contextText);

  return {
    answered: true,
    answer,
    sourceDocuments,
  };
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

async function resolveSourceDocuments(
  chunks: ChunkWithSimilarity[],
  orgId: string
): Promise<AssetDocument[]> {
  const seen = new Set<string>();
  const docs: AssetDocument[] = [];

  for (const chunk of chunks) {
    const docId = chunk.asset_document_id;
    if (seen.has(docId)) continue;
    seen.add(docId);

    // Skip service log pseudo-documents
    if (chunk.source_type === 'service_log') continue;

    const doc = await getAssetDocument(docId, orgId);
    if (doc) docs.push(doc);
  }

  return docs;
}

function buildContext(
  chunks: ChunkWithSimilarity[],
  sourceDocs: AssetDocument[]
): string {
  const docNames: Record<string, string> = {};
  for (const doc of sourceDocs) {
    docNames[doc.id] = doc.file_name;
  }

  return chunks
    .map((chunk, i) => {
      const srcLabel =
        chunk.source_type === 'service_log'
          ? '[Service Log]'
          : `[${docNames[chunk.asset_document_id] ?? 'Document'}]`;
      return `--- Source ${i + 1} ${srcLabel} ---\n${chunk.chunk_text}`;
    })
    .join('\n\n');
}

async function callClaude(query: string, contextText: string): Promise<string> {
  // In test mode with no API key, return a deterministic mock answer
  if (!process.env.ANTHROPIC_API_KEY) {
    return mockClaudeAnswer(query, contextText);
  }

  const client = getAnthropicClient();

  const systemPrompt = `You are a field intelligence assistant for a contractor organisation. 
You answer questions about equipment, specifications, service history, and technical documentation.

STRICT RULES:
- Answer ONLY from the provided document excerpts below. 
- If the answer is not present in the excerpts, say "I couldn't find that in the uploaded documents."
- Do NOT use general engineering knowledge to fill gaps — the technician needs to trust the answer comes from their actual documents.
- Be direct and specific. State the exact value, date, or procedure if it appears in the text.
- Keep the answer to 2–4 sentences unless a longer list is genuinely needed.`;

  const userMessage = `Document excerpts from this organisation's asset library:

${contextText}

Question: ${query}`;

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 512,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const textBlock = message.content.find((b) => b.type === 'text');
  return textBlock?.type === 'text' ? textBlock.text : 'Unable to generate answer.';
}

/**
 * Deterministic mock answer for test mode (no API key required).
 * Confirms the chunk text was received and references it.
 */
function mockClaudeAnswer(query: string, contextText: string): string {
  const firstLine = contextText.split('\n').find((l) => l.trim().length > 20) ?? contextText;
  return `Based on the uploaded documents, here is the answer to "${query}": ${firstLine.slice(0, 200)}. [Mock answer — connect ANTHROPIC_API_KEY for live responses.]`;
}
