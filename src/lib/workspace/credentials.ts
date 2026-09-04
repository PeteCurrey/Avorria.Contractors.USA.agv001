/**
 * AVORRIA CREDENTIALS & COMPLY SERVICE
 *
 * Automated status computation, full CRUD on credentials,
 * document file linkage, and readiness score synchronization.
 */

import {
  Credential,
  CredentialStatus,
  CredentialType,
  WorkspaceDocument,
} from './types';
import {
  listCredentials as dbListCredentials,
  getCredential as dbGetCredential,
  saveCredential as dbSaveCredential,
  deleteCredential as dbDeleteCredential,
  saveDocument,
} from './db';
import { calculateReadinessScore } from './readiness';

/**
 * Computes credential status based on expiration date.
 * Never computed solely on client side.
 */
export function computeCredentialStatus(
  expirationDate: string | Date | null | undefined
): CredentialStatus {
  if (!expirationDate) {
    return 'current';
  }

  const exp = new Date(expirationDate);
  if (isNaN(exp.getTime())) {
    return 'current';
  }

  const now = new Date();
  // Normalize to UTC midnight for date-level comparison
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const expDay = new Date(Date.UTC(exp.getUTCFullYear(), exp.getUTCMonth(), exp.getUTCDate()));

  const diffMs = expDay.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'expired';
  }
  if (diffDays <= 14) {
    return 'expiring_14';
  }
  if (diffDays <= 30) {
    return 'expiring_30';
  }
  if (diffDays <= 60) {
    return 'expiring_60';
  }
  return 'current';
}

export interface CreateCredentialInput {
  org_id: string;
  type: CredentialType;
  carrier_or_authority?: string;
  policy_or_license_number?: string;
  coverage_amount?: number;
  effective_date?: string;
  expiration_date?: string;
  state?: string;
  document_file_url?: string;
  document_title?: string;
}

export interface UpdateCredentialInput {
  type?: CredentialType;
  carrier_or_authority?: string;
  policy_or_license_number?: string;
  coverage_amount?: number;
  effective_date?: string;
  expiration_date?: string;
  state?: string;
  document_file_url?: string;
  document_title?: string;
}

export async function listCredentials(orgId: string): Promise<Credential[]> {
  const list = await dbListCredentials(orgId);
  // Dynamically ensure status matches current date on read
  const updatedList: Credential[] = [];
  for (const cred of list) {
    const computed = computeCredentialStatus(cred.expiration_date);
    if (computed !== cred.status) {
      const updated = await dbSaveCredential({ ...cred, status: computed });
      updatedList.push(updated);
    } else {
      updatedList.push(cred);
    }
  }
  return updatedList;
}

export async function getCredential(id: string): Promise<Credential | null> {
  const cred = await dbGetCredential(id);
  if (!cred) return null;
  const computed = computeCredentialStatus(cred.expiration_date);
  if (computed !== cred.status) {
    return dbSaveCredential({ ...cred, status: computed });
  }
  return cred;
}

export async function createCredential(input: CreateCredentialInput): Promise<Credential> {
  let documentId: string | undefined;

  // If a document file is attached, create a linked document record
  if (input.document_file_url) {
    const docType = input.type === 'trade_license' ? 'license' : 'coi';
    const doc: WorkspaceDocument = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      org_id: input.org_id,
      type: docType,
      title: input.document_title || `${input.type.replace(/_/g, ' ')} Document`,
      file_url: input.document_file_url,
      version: 1,
      generated_by: 'uploaded',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await saveDocument(doc);
    documentId = doc.id;
  }

  const status = computeCredentialStatus(input.expiration_date);

  const cred: Credential = {
    id: `crd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    org_id: input.org_id,
    type: input.type,
    carrier_or_authority: input.carrier_or_authority,
    policy_or_license_number: input.policy_or_license_number,
    coverage_amount: input.coverage_amount,
    effective_date: input.effective_date,
    expiration_date: input.expiration_date,
    document_id: documentId,
    status,
    state: input.state,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const saved = await dbSaveCredential(cred);
  await calculateReadinessScore(input.org_id);
  return saved;
}

export async function updateCredential(
  id: string,
  input: UpdateCredentialInput
): Promise<Credential> {
  const existing = await dbGetCredential(id);
  if (!existing) {
    throw new Error(`Credential ${id} not found.`);
  }

  let documentId = existing.document_id;
  if (input.document_file_url) {
    const docType = (input.type || existing.type) === 'trade_license' ? 'license' : 'coi';
    const doc: WorkspaceDocument = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      org_id: existing.org_id,
      type: docType,
      title: input.document_title || `${(input.type || existing.type).replace(/_/g, ' ')} Document`,
      file_url: input.document_file_url,
      version: 1,
      generated_by: 'uploaded',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await saveDocument(doc);
    documentId = doc.id;
  }

  const expirationDate = input.expiration_date !== undefined ? input.expiration_date : existing.expiration_date;
  const status = computeCredentialStatus(expirationDate);

  const updated: Credential = {
    ...existing,
    type: input.type || existing.type,
    carrier_or_authority: input.carrier_or_authority !== undefined ? input.carrier_or_authority : existing.carrier_or_authority,
    policy_or_license_number: input.policy_or_license_number !== undefined ? input.policy_or_license_number : existing.policy_or_license_number,
    coverage_amount: input.coverage_amount !== undefined ? input.coverage_amount : existing.coverage_amount,
    effective_date: input.effective_date !== undefined ? input.effective_date : existing.effective_date,
    expiration_date: expirationDate,
    state: input.state !== undefined ? input.state : existing.state,
    document_id: documentId,
    status,
    updated_at: new Date().toISOString(),
  };

  const saved = await dbSaveCredential(updated);
  await calculateReadinessScore(existing.org_id);
  return saved;
}

export async function deleteCredential(id: string): Promise<boolean> {
  const existing = await dbGetCredential(id);
  if (!existing) return false;
  const orgId = existing.org_id;
  const ok = await dbDeleteCredential(id);
  if (ok) {
    await calculateReadinessScore(orgId);
  }
  return ok;
}
