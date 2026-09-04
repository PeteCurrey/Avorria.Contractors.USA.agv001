import crypto from 'crypto';
import { getDocument, saveDocument } from '../workspace/db';
import { WorkspaceDocument, SignatureData } from '../workspace/types';

export interface SignDocumentInput {
  documentId: string;
  signerName: string;
  signatureImage: string; // Base64 data URL
  signerIp: string;
}

/**
 * Executes lightweight in-house digital signature capture.
 * - Stores canvas signature image, signer name, timestamp, and SHA-256 IP hash (never raw IP).
 * - Locks the document (is_signed: true).
 * - Rejects attempt to re-sign or mutate in place.
 */
export async function signDocument(input: SignDocumentInput): Promise<WorkspaceDocument> {
  const existing = await getDocument(input.documentId);
  if (!existing) {
    throw new Error(`Document ${input.documentId} not found.`);
  }

  if (existing.is_signed) {
    throw new Error('This document has already been digitally executed and is locked.');
  }

  if (!input.signerName || input.signerName.trim().length === 0) {
    throw new Error('Signer name is required.');
  }

  if (!input.signatureImage || !input.signatureImage.startsWith('data:image/')) {
    throw new Error('Valid signature canvas data URL is required.');
  }

  // Generate SHA-256 hash of signer IP — NEVER store raw IP address
  const signerIpHash = crypto
    .createHash('sha256')
    .update(input.signerIp || 'unknown')
    .digest('hex');

  const now = new Date().toISOString();

  const signatureData: SignatureData = {
    signer_name: input.signerName.trim(),
    signature_image: input.signatureImage,
    signer_ip_hash: signerIpHash,
    signed_at: now,
  };

  const updatedDoc: WorkspaceDocument = {
    ...existing,
    is_signed: true,
    signed_at: now,
    signature_data: signatureData,
    updated_at: now,
  };

  return await saveDocument(updatedDoc);
}

/**
 * Creates a new version (v2, v3, etc.) when an existing document is regenerated.
 * Preserves the previous version intact (especially if signed) and establishes lineage.
 */
export async function createDocumentVersion(
  parentDocumentId: string,
  newContent: Record<string, any>,
  newTitle?: string,
  changeSummary?: string
): Promise<WorkspaceDocument> {
  const parentDoc = await getDocument(parentDocumentId);
  if (!parentDoc) {
    throw new Error(`Parent document ${parentDocumentId} not found.`);
  }

  const newVersionNumber = (parentDoc.version || 1) + 1;
  const now = new Date().toISOString();

  const newDoc: WorkspaceDocument = {
    id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    org_id: parentDoc.org_id,
    type: parentDoc.type,
    title: newTitle || parentDoc.title,
    version: newVersionNumber,
    generated_by: 'ai',
    linked_project_id: parentDoc.linked_project_id,
    created_by_user_id: parentDoc.created_by_user_id,
    content: newContent,
    is_signed: false, // New draft version is unsigned
    signed_at: undefined,
    signature_data: undefined,
    parent_document_id: parentDoc.id,
    change_summary: changeSummary || `Version ${newVersionNumber} generated from v${parentDoc.version}`,
    created_at: now,
    updated_at: now,
  };

  return await saveDocument(newDoc);
}
