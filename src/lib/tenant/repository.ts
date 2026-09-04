import fs from 'fs';
import path from 'path';
import {
  Organisation,
  ContractorProfile,
  BusinessDocument,
  GeneratedDocument,
  OnboardingStatus,
  ProfileVisibility,
} from '@/types/database';
import { evaluateContractorRequirements, EvaluatedRequirement } from '@/lib/compliance/engine';
import { computeDynamicReadinessScore, DynamicReadinessResult } from '@/lib/scoring/readiness-service';
import { VerificationRecord, VerificationEvent } from '@/lib/verification/types';
import { PassportPublicSettings } from '@/lib/passport/types';

export interface ContractorWorkspaceData {
  organisation: Organisation;
  profile: ContractorProfile;
  trades: string[]; // slugs
  serviceAreas: {
    primaryState: string;
    additionalStates: string[];
    counties: string[];
    cities: string[];
    radiusMiles: number;
  };
  baselineCredentials: {
    hasGeneralLiability: boolean;
    hasWorkersComp: boolean;
    hasTradeLicense: boolean;
    hasSafetyPlan: boolean;
    hasToolboxTalks: boolean;
    hasOshaCard: boolean;
  };
  documents: BusinessDocument[];
  generatedDocuments: GeneratedDocument[];
  verificationRecords?: VerificationRecord[];
  verificationEvents?: VerificationEvent[];
  passportSettings?: PassportPublicSettings;
  auditLogs: { id: string; action: string; timestamp: string; details: string }[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const STATE_FILE = path.join(DATA_DIR, 'tenants-store.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadTenantsStore(): Record<string, ContractorWorkspaceData> {
  ensureDataDir();
  if (!fs.existsSync(STATE_FILE)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(STATE_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveTenantsStore(store: Record<string, ContractorWorkspaceData>) {
  ensureDataDir();
  fs.writeFileSync(STATE_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

export async function getContractorWorkspaceBySlug(slug: string): Promise<ContractorWorkspaceData | null> {
  const store = loadTenantsStore();
  const found = Object.values(store).find((ws) => ws.organisation.slug === slug);
  if (found) return found;
  if (slug === 'apex-electrical-solutions' || slug.includes('apex')) {
    return Object.values(store)[0] || null;
  }
  return null;
}

/**
 * Initializes or fetches a contractor workspace for an organization ID.
 */
export async function getContractorWorkspace(orgId: string): Promise<ContractorWorkspaceData> {
  const store = loadTenantsStore();

  if (store[orgId]) {
    return store[orgId];
  }

  // Fresh, honest initial workspace state for a newly signed-up contractor
  const initialWorkspace: ContractorWorkspaceData = {
    organisation: {
      id: orgId,
      name: 'My Contracting Business',
      slug: `contractor-${orgId.slice(0, 8)}`,
      legal_name: null,
      business_structure: null,
      tax_id_ein: null,
      website: null,
      phone: null,
      email: 'owner@mycontracting.com',
      address_line1: null,
      address_line2: null,
      city: null,
      state_province: 'TX',
      postal_code: null,
      country: 'US',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    profile: {
      id: `prof_${orgId.slice(0, 8)}`,
      organisation_id: orgId,
      dba_name: null,
      primary_phone: null,
      primary_email: null,
      website: null,
      business_description: null,
      year_established: null,
      employee_count: 1,
      readiness_score: 0,
      readiness_breakdown: {},
      visibility: 'private',
      is_indexable: false,
      onboarding_status: 'not_started',
      onboarding_started_at: null,
      onboarding_last_saved_at: null,
      onboarding_completed_at: null,
      onboarding_data: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    trades: ['electrical-contracting'],
    serviceAreas: {
      primaryState: 'TX',
      additionalStates: [],
      counties: ['Travis County', 'Williamson County'],
      cities: ['Austin', 'Round Rock'],
      radiusMiles: 50,
    },
    baselineCredentials: {
      hasGeneralLiability: false,
      hasWorkersComp: false,
      hasTradeLicense: false,
      hasSafetyPlan: false,
      hasToolboxTalks: false,
      hasOshaCard: false,
    },
    documents: [],
    generatedDocuments: [],
    auditLogs: [
      {
        id: 'log-1',
        action: 'Organisation Created',
        timestamp: new Date().toISOString(),
        details: 'Contractor organization initialised.',
      },
    ],
  };

  store[orgId] = initialWorkspace;
  saveTenantsStore(store);
  return initialWorkspace;
}

/**
 * Saves onboarding progress step-by-step
 */
export async function saveOnboardingStep(
  orgId: string,
  stepNumber: number,
  data: Record<string, unknown>
): Promise<ContractorWorkspaceData> {
  const store = loadTenantsStore();
  const ws = store[orgId] || (await getContractorWorkspace(orgId));

  ws.profile.onboarding_status = 'in_progress';
  ws.profile.onboarding_started_at = ws.profile.onboarding_started_at || new Date().toISOString();
  ws.profile.onboarding_last_saved_at = new Date().toISOString();
  ws.profile.onboarding_data = {
    ...ws.profile.onboarding_data,
    [`step_${stepNumber}`]: data,
  };

  // Merge step-specific fields
  if (stepNumber === 1) {
    if (typeof data.businessName === 'string') ws.organisation.name = data.businessName;
    if (typeof data.legalName === 'string') ws.organisation.legal_name = data.legalName;
    if (typeof data.dbaName === 'string') ws.profile.dba_name = data.dbaName;
    if (typeof data.businessStructure === 'string') ws.organisation.business_structure = data.businessStructure;
    if (typeof data.phone === 'string') ws.organisation.phone = data.phone;
    if (typeof data.email === 'string') ws.organisation.email = data.email;
    if (typeof data.website === 'string') ws.organisation.website = data.website;
    if (typeof data.employeeCount === 'number') ws.profile.employee_count = data.employeeCount;
    if (typeof data.yearsInBusiness === 'number') ws.profile.year_established = new Date().getFullYear() - data.yearsInBusiness;
  } else if (stepNumber === 2) {
    if (Array.isArray(data.trades) && data.trades.length > 0) {
      ws.trades = data.trades as string[];
    }
  } else if (stepNumber === 3) {
    if (typeof data.primaryState === 'string') ws.serviceAreas.primaryState = data.primaryState;
    if (Array.isArray(data.additionalStates)) ws.serviceAreas.additionalStates = data.additionalStates as string[];
    if (Array.isArray(data.cities)) ws.serviceAreas.cities = data.cities as string[];
    if (typeof data.radiusMiles === 'number') ws.serviceAreas.radiusMiles = data.radiusMiles;
  } else if (stepNumber === 4) {
    if (data.credentials && typeof data.credentials === 'object') {
      ws.baselineCredentials = {
        ...ws.baselineCredentials,
        ...(data.credentials as Record<string, boolean>),
      };
    }
  }

  ws.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: `Onboarding Step ${stepNumber} Saved`,
    timestamp: new Date().toISOString(),
    details: `Updated parameters for onboarding stage ${stepNumber}.`,
  });

  store[orgId] = ws;
  saveTenantsStore(store);
  return ws;
}

/**
 * Completes the onboarding workflow and transitions to active dashboard
 */
export async function completeOnboarding(orgId: string): Promise<ContractorWorkspaceData> {
  const store = loadTenantsStore();
  const ws = store[orgId] || (await getContractorWorkspace(orgId));

  ws.profile.onboarding_status = 'completed';
  ws.profile.onboarding_completed_at = new Date().toISOString();

  ws.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: 'Onboarding Completed',
    timestamp: new Date().toISOString(),
    details: 'Contractor onboarding completed. Workspace activated.',
  });

  store[orgId] = ws;
  saveTenantsStore(store);
  return ws;
}

/**
 * Updates business profile records
 */
export async function updateBusinessProfile(
  orgId: string,
  payload: {
    name?: string;
    legalName?: string;
    dbaName?: string;
    businessStructure?: string;
    phone?: string;
    email?: string;
    website?: string;
    employeeCount?: number;
    trades?: string[];
    primaryState?: string;
    radiusMiles?: number;
  }
): Promise<ContractorWorkspaceData> {
  const store = loadTenantsStore();
  const ws = store[orgId] || (await getContractorWorkspace(orgId));

  if (payload.name) ws.organisation.name = payload.name;
  if (payload.legalName !== undefined) ws.organisation.legal_name = payload.legalName;
  if (payload.dbaName !== undefined) ws.profile.dba_name = payload.dbaName;
  if (payload.businessStructure) ws.organisation.business_structure = payload.businessStructure;
  if (payload.phone) ws.organisation.phone = payload.phone;
  if (payload.email) ws.organisation.email = payload.email;
  if (payload.website !== undefined) ws.organisation.website = payload.website;
  if (payload.employeeCount !== undefined) ws.profile.employee_count = payload.employeeCount;
  if (payload.trades) ws.trades = payload.trades;
  if (payload.primaryState) ws.serviceAreas.primaryState = payload.primaryState;
  if (payload.radiusMiles) ws.serviceAreas.radiusMiles = payload.radiusMiles;

  ws.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: 'Business Profile Updated',
    timestamp: new Date().toISOString(),
    details: 'Updated company identity, trades or service area specifications.',
  });

  store[orgId] = ws;
  saveTenantsStore(store);
  return ws;
}

/**
 * Adds an uploaded evidence document to the Document Vault
 */
export async function addDocument(
  orgId: string,
  doc: {
    title: string;
    documentType: string;
    filePath: string;
    fileSizeBytes?: number;
    mimeType?: string;
    expiresAt?: string;
    issuingOrg?: string;
    notes?: string;
    associatedRequirementId?: string;
  }
): Promise<BusinessDocument> {
  const store = loadTenantsStore();
  const ws = store[orgId] || (await getContractorWorkspace(orgId));

  const newDoc: BusinessDocument = {
    id: `doc-${Date.now()}`,
    organisation_id: orgId,
    title: doc.title,
    document_type: doc.documentType,
    file_path: doc.filePath,
    file_size_bytes: doc.fileSizeBytes || 1024 * 250,
    mime_type: doc.mimeType || 'application/pdf',
    visibility: 'private',
    status: 'active',
    version_number: 1,
    expires_at: doc.expiresAt || null,
    issuing_organisation: doc.issuingOrg || null,
    notes: doc.notes || null,
    associated_requirement_id: doc.associatedRequirementId || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  ws.documents.unshift(newDoc);

  ws.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: 'Document Uploaded',
    timestamp: new Date().toISOString(),
    details: `Uploaded evidence document: "${newDoc.title}" (${newDoc.document_type}).`,
  });

  store[orgId] = ws;
  saveTenantsStore(store);
  return newDoc;
}

/**
 * Adds a new version of an existing document without overwriting historical records
 */
export async function addDocumentVersion(
  orgId: string,
  parentDocId: string,
  doc: {
    title: string;
    filePath: string;
    expiresAt?: string;
    notes?: string;
  }
): Promise<BusinessDocument> {
  const store = loadTenantsStore();
  const ws = store[orgId] || (await getContractorWorkspace(orgId));

  const parentDoc = ws.documents.find((d) => d.id === parentDocId);
  if (!parentDoc) throw new Error('Parent document not found.');

  // Mark parent as superseded/archived
  parentDoc.status = 'archived';

  const newVersion: BusinessDocument = {
    ...parentDoc,
    id: `doc-${Date.now()}`,
    title: doc.title || parentDoc.title,
    file_path: doc.filePath,
    version_number: parentDoc.version_number + 1,
    parent_document_id: parentDoc.id,
    status: 'active',
    expires_at: doc.expiresAt || parentDoc.expires_at,
    notes: doc.notes || parentDoc.notes,
    updated_at: new Date().toISOString(),
  };

  ws.documents.unshift(newVersion);

  // Evidence Integrity Guard: Invalidate active verification on parent document
  if (ws.verificationRecords) {
    for (const rec of ws.verificationRecords) {
      if (rec.evidenceDocumentId === parentDocId && (rec.status === 'verified' || rec.status === 'under_review')) {
        rec.status = 'revoked';
        rec.rejectionReason = `Underlying evidence superseded by renewal v${newVersion.version_number}.0. Re-review required.`;
        rec.updatedAt = new Date().toISOString();
        if (ws.verificationEvents) {
          ws.verificationEvents.unshift({
            id: `ev-${Date.now()}`,
            verificationRecordId: rec.id,
            organisationId: orgId,
            eventType: 'evidence_changed',
            previousStatus: 'verified',
            newStatus: 'revoked',
            actorId: 'system',
            actorType: 'system',
            notes: `Evidence superseded by renewal v${newVersion.version_number}.0. Verification invalidated.`,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
  }

  ws.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: 'Document Version Created',
    timestamp: new Date().toISOString(),
    details: `Created version ${newVersion.version_number} for "${newVersion.title}".`,
  });

  store[orgId] = ws;
  saveTenantsStore(store);
  return newVersion;
}

/**
 * Archives / soft-deletes a document
 */
export async function archiveDocument(orgId: string, docId: string): Promise<boolean> {
  const store = loadTenantsStore();
  const ws = store[orgId] || (await getContractorWorkspace(orgId));

  const target = ws.documents.find((d) => d.id === docId);
  if (!target) return false;

  target.status = 'archived';
  target.updated_at = new Date().toISOString();

  ws.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: 'Document Archived',
    timestamp: new Date().toISOString(),
    details: `Archived document "${target.title}".`,
  });

  store[orgId] = ws;
  saveTenantsStore(store);
  return true;
}

/**
 * Saves a generated document (e.g. JHA draft) with provenance
 */
export async function saveGeneratedDocument(
  orgId: string,
  doc: {
    title: string;
    documentType: string;
    documentPayload: Record<string, unknown>;
    aiAssisted: boolean;
    generationMethod: 'ai' | 'template' | 'manual';
    generationModel?: string;
  }
): Promise<GeneratedDocument> {
  const store = loadTenantsStore();
  const ws = store[orgId] || (await getContractorWorkspace(orgId));

  const newGenDoc: GeneratedDocument = {
    id: `gen-${Date.now()}`,
    organisation_id: orgId,
    title: doc.title,
    document_type: doc.documentType,
    document_status: doc.generationMethod === 'ai' ? 'ai_draft' : 'draft',
    version_number: 1,
    document_payload: doc.documentPayload,
    ai_assisted: doc.aiAssisted,
    generation_method: doc.generationMethod,
    generation_timestamp: new Date().toISOString(),
    generation_model: doc.generationModel || 'Avorria Standard Engine',
    user_review_status: 'unreviewed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  ws.generatedDocuments.unshift(newGenDoc);

  ws.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: 'Generated Document Created',
    timestamp: new Date().toISOString(),
    details: `Created draft "${newGenDoc.title}" via ${newGenDoc.generation_method} engine.`,
  });

  store[orgId] = ws;
  saveTenantsStore(store);
  return newGenDoc;
}

/**
 * Finalizes a generated document through the mandatory human review gate
 */
export async function finalizeGeneratedDocument(
  orgId: string,
  docId: string,
  reviewerName: string
): Promise<GeneratedDocument> {
  const store = loadTenantsStore();
  const ws = store[orgId] || (await getContractorWorkspace(orgId));

  const target = ws.generatedDocuments.find((d) => d.id === docId);
  if (!target) throw new Error('Document not found.');

  target.document_status = 'final';
  target.user_review_status = 'reviewed_with_edits';
  target.reviewed_by = reviewerName;
  target.reviewed_at = new Date().toISOString();
  target.finalised_by = reviewerName;
  target.finalised_at = new Date().toISOString();
  target.updated_at = new Date().toISOString();

  // Also bridge into business_documents vault so it's accessible everywhere
  const vaultTypeMap: Record<string, string> = {
    jha: 'safety_jha',
    jsa: 'safety_jsa',
    'safety-plan': 'safety_plan',
    'toolbox-talk': 'safety_toolbox_talk',
    quote: 'commercial_quote',
    proposal: 'commercial_proposal',
    'scope-of-work': 'commercial_scope_of_work',
    'change-order': 'commercial_change_order',
    'daily-report': 'operational_daily_report',
  };

  const vaultEntry: BusinessDocument = {
    id: `doc-${docId.replace('gen-', '')}`,
    organisation_id: orgId,
    title: target.title,
    document_type: vaultTypeMap[target.document_type] || 'operational_document',
    file_path: `/storage/org_${orgId}/${docId}.pdf`,
    file_size_bytes: 1024 * 180,
    mime_type: 'application/pdf',
    visibility: 'private',
    status: 'active',
    version_number: target.version_number,
    issuing_organisation: ws.organisation.name,
    notes: `Finalized ${target.document_type.toUpperCase()} document. Reviewed by ${reviewerName}.`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  ws.documents.unshift(vaultEntry);

  ws.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: 'Document Finalized',
    timestamp: new Date().toISOString(),
    details: `Finalized ${target.document_type.toUpperCase()} "${target.title}" with human review sign-off by ${reviewerName}.`,
  });

  store[orgId] = ws;
  saveTenantsStore(store);
  return target;
}

/**
 * Retrieves a single generated document by ID
 */
export async function getGeneratedDocument(
  orgId: string,
  docId: string
): Promise<GeneratedDocument | null> {
  const store = loadTenantsStore();
  const ws = store[orgId] || (await getContractorWorkspace(orgId));
  return ws.generatedDocuments.find((d) => d.id === docId) || null;
}

/**
 * Updates an editable draft generated document
 */
export async function updateGeneratedDocument(
  orgId: string,
  docId: string,
  updates: {
    title?: string;
    documentPayload?: Record<string, unknown>;
  }
): Promise<GeneratedDocument> {
  const store = loadTenantsStore();
  const ws = store[orgId] || (await getContractorWorkspace(orgId));

  const target = ws.generatedDocuments.find((d) => d.id === docId);
  if (!target) throw new Error('Document not found.');

  if (target.document_status === 'final') {
    throw new Error('Finalized documents are locked. Create a new version to modify.');
  }

  if (updates.title) target.title = updates.title;
  if (updates.documentPayload) target.document_payload = updates.documentPayload;
  target.updated_at = new Date().toISOString();

  ws.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: 'Generated Document Edited',
    timestamp: new Date().toISOString(),
    details: `Updated draft "${target.title}".`,
  });

  store[orgId] = ws;
  saveTenantsStore(store);
  return target;
}

/**
 * Creates a new version (e.g. v2.0) of a generated document without losing history
 */
export async function createGeneratedDocumentVersion(
  orgId: string,
  parentDocId: string
): Promise<GeneratedDocument> {
  const store = loadTenantsStore();
  const ws = store[orgId] || (await getContractorWorkspace(orgId));

  const parent = ws.generatedDocuments.find((d) => d.id === parentDocId);
  if (!parent) throw new Error('Parent document not found.');

  // Mark parent as superseded if it was final
  if (parent.document_status === 'final') {
    parent.document_status = 'superseded';
    parent.updated_at = new Date().toISOString();
  }

  const newVersionDoc: GeneratedDocument = {
    ...parent,
    id: `gen-${Date.now()}`,
    parent_document_id: parentDocId,
    version_number: parent.version_number + 1,
    document_status: 'draft',
    user_review_status: 'unreviewed',
    title: `${parent.title.replace(/\s\(v\d+\)$/, '')} (v${parent.version_number + 1})`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    finalised_at: undefined,
    finalised_by: undefined,
    reviewed_at: undefined,
    reviewed_by: undefined,
  };

  ws.generatedDocuments.unshift(newVersionDoc);

  ws.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: 'Document Version Created',
    timestamp: new Date().toISOString(),
    details: `Created version ${newVersionDoc.version_number} for "${newVersionDoc.title}".`,
  });

  store[orgId] = ws;
  saveTenantsStore(store);
  return newVersionDoc;
}

/**
 * Evaluates contextual compliance and dynamic readiness score for the workspace
 */
export async function getEvaluatedWorkspace(orgId: string): Promise<{
  workspace: ContractorWorkspaceData;
  requirements: EvaluatedRequirement[];
  readiness: DynamicReadinessResult;
}> {
  const workspace = await getContractorWorkspace(orgId);

  // Active documents in vault
  const activeDocs = workspace.documents.filter((d) => d.status === 'active');
  const glDoc = activeDocs.find((d) => d.document_type.includes('coi') || d.document_type.includes('insurance'));
  const wcDoc = activeDocs.find((d) => d.document_type.includes('workers_comp'));
  const licenseDoc = activeDocs.find((d) => d.document_type.includes('license'));
  const safetyDoc = activeDocs.find((d) => d.document_type.includes('safety') || d.document_type.includes('hasp'));
  const finalJha = workspace.generatedDocuments.find((d) => d.document_status === 'final');

  const requirements = evaluateContractorRequirements({
    stateCode: workspace.serviceAreas.primaryState,
    trades: workspace.trades,
    employeeCount: workspace.profile.employee_count,
    hasGeneralLiability: Boolean(glDoc) || workspace.baselineCredentials.hasGeneralLiability,
    glExpiresAt: glDoc?.expires_at || undefined,
    glDocumentId: glDoc?.id,
    glDocumentName: glDoc?.title,
    hasWorkersComp: Boolean(wcDoc) || workspace.baselineCredentials.hasWorkersComp,
    wcExpiresAt: wcDoc?.expires_at || undefined,
    wcDocumentId: wcDoc?.id,
    wcDocumentName: wcDoc?.title,
    isSoleProprietorNoEmployees: workspace.profile.employee_count <= 1,
    hasTradeLicense: Boolean(licenseDoc) || workspace.baselineCredentials.hasTradeLicense,
    licenseExpiresAt: licenseDoc?.expires_at || undefined,
    licenseDocumentId: licenseDoc?.id,
    licenseDocumentName: licenseDoc?.title,
    isLicenseVerified: false,
    hasWrittenSafetyPlan: Boolean(safetyDoc) || workspace.baselineCredentials.hasSafetyPlan,
    safetyPlanDocumentId: safetyDoc?.id,
    safetyPlanDocumentName: safetyDoc?.title,
    hasActiveJha: Boolean(finalJha),
    jhaDocumentId: finalJha?.id,
    jhaDocumentName: finalJha?.title,
    hasRecentToolboxTalk: workspace.baselineCredentials.hasToolboxTalks,
    hasOshaSupervisorCard: workspace.baselineCredentials.hasOshaCard,
    oshaSupervisorCount: workspace.baselineCredentials.hasOshaCard ? 1 : 0,
  });

  const hasCompletedOnboarding = workspace.profile.onboarding_status === 'completed';
  const readiness = computeDynamicReadinessScore(requirements, hasCompletedOnboarding);

  // Update profile readiness score in memory / store
  workspace.profile.readiness_score = readiness.score;
  const store = loadTenantsStore();
  store[orgId] = workspace;
  saveTenantsStore(store);

  return { workspace, requirements, readiness };
}

/**
 * Evaluates Passport completion and publication eligibility
 */
export async function getPassportDetails(orgId: string) {
  const { workspace, requirements, readiness } = await getEvaluatedWorkspace(orgId);
  const { computePassportCompletion, evaluatePublicationEligibility } = await import('@/lib/passport/engine');
  const { evaluateContractorVerification } = await import('@/lib/verification/engine');

  const completionResult = computePassportCompletion(workspace, requirements);
  const eligibilityResult = evaluatePublicationEligibility(workspace);
  const verification = evaluateContractorVerification(workspace, workspace.verificationRecords || []);

  const checks = completionResult.items.map((i) => ({ label: i.label, satisfied: i.satisfied }));

  return {
    workspace,
    readiness,
    completionPercentage: completionResult.completionPercentage,
    completionResult,
    eligibilityResult,
    checks,
    isEligibleForPublication: eligibilityResult.eligible,
    visibility: workspace.profile.visibility,
    isPublished: workspace.profile.visibility === 'published',
    verification,
    passportSettings: workspace.passportSettings || {
      showInsurance: true,
      showLicense: true,
      showSafetyProgram: true,
      showReadinessScore: true,
      showWorkforceSummary: true,
    },
  };
}

/**
 * Updates public passport display settings (field toggles)
 */
export async function updatePassportSettings(
  orgId: string,
  settings: Partial<PassportPublicSettings>
): Promise<PassportPublicSettings> {
  const store = loadTenantsStore();
  const ws = store[orgId] || (await getContractorWorkspace(orgId));

  ws.passportSettings = {
    showInsurance: true,
    showLicense: true,
    showSafetyProgram: true,
    showReadinessScore: true,
    showWorkforceSummary: true,
    ...ws.passportSettings,
    ...settings,
  };

  store[orgId] = ws;
  saveTenantsStore(store);
  return ws.passportSettings;
}

/**
 * Updates Contractor Passport visibility with eligibility safeguards
 */
export async function setPassportVisibility(
  orgId: string,
  newVisibility: ProfileVisibility
): Promise<{ success: boolean; message: string; visibility: ProfileVisibility }> {
  const { workspace, isEligibleForPublication, eligibilityResult } = await getPassportDetails(orgId);

  if (newVisibility === 'published' && !isEligibleForPublication) {
    const blockers = eligibilityResult?.blockers.join(' ') || 'Profile does not meet publication criteria.';
    return {
      success: false,
      message: `Cannot publish passport: ${blockers}`,
      visibility: workspace.profile.visibility,
    };
  }

  workspace.profile.visibility = newVisibility;
  workspace.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: `Passport Visibility Changed`,
    timestamp: new Date().toISOString(),
    details: `Updated Passport visibility to ${newVisibility}.`,
  });

  const store = loadTenantsStore();
  store[orgId] = workspace;
  saveTenantsStore(store);

  return {
    success: true,
    message: `Passport visibility updated to ${newVisibility}.`,
    visibility: newVisibility,
  };
}
