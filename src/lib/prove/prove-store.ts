/**
 * AVORRIA PROVE — EVIDENCE STORE & TRUST SERVICE
 *
 * Persistent storage in `.data/prove-store.json` with strict tenant isolation.
 * Bridges:
 *   - Business Identity records
 *   - COMPLY credentials (Licences, Insurance, OSHA, Safety)
 *   - CREATE records (Projects, Capabilities, References)
 *   - Documents system (Evidence files)
 */

import fs from 'fs';
import path from 'path';
import {
  EvidenceItem,
  CreateEvidenceInput,
  UpdateEvidenceInput,
  EvidencePosition,
  UnsupportedRecord,
  EvidenceCompletenessSummary,
  CategoryEvidenceCompleteness,
} from './types';
import { listCredentials, listDocuments, getOrganization } from '@/lib/workspace/db';
import { listProjects, listCapabilities, listReferences } from '@/lib/create/evidence-store';

interface ProveStoreData {
  evidence: Record<string, EvidenceItem>;
}

let memoryProveStore: ProveStoreData | null = null;

const DATA_DIR = path.join(process.cwd(), '.data');
const STORE_PATH = path.join(DATA_DIR, 'prove-store.json');

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // Graceful fallback for read-only serverless filesystems
  }
}

function getInitialStore(): ProveStoreData {
  const DEMO_ORG = 'org_vance_electric_01';
  const now = new Date();

  // Helper to construct dynamic past dates relative to runtime
  const daysAgo = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d.toISOString();
  };

  const initialEvidence: Record<string, EvidenceItem> = {
    // 1. TDLR Master Electrician License (Verified via State Board lookup)
    evi_vance_01: {
      id: 'evi_vance_01',
      org_id: DEMO_ORG,
      title: 'TDLR Electrical Contractor Pocket Card & State Registry Verification',
      evidence_type: 'licence',
      related_record_id: 'crd_vance_lic_001',
      related_record_type: 'credential',
      related_record_title: 'Texas Electrical Contractor License TECL-35892',
      related_record_state: 'CURRENT',
      document_id: 'doc_tdlr_card_01',
      document_title: 'TDLR_TECL35892_Master_PocketCard.pdf',
      document_file_url: '/uploads/licenses/tdlr_pocket_card.pdf',
      document_type: 'license',
      file_size_bytes: 482910,
      source: 'verification_audit',
      source_label: 'Texas Dept of Licensing and Regulation (State Board Registry)',
      issued_date: '2024-03-15',
      effective_date: '2024-03-15',
      expiry_date: '2027-03-15',
      verification_state: 'VERIFIED',
      verification_method: 'state_board_lookup',
      verifier_name: 'Avorria Trust Operations & TDLR Automated Verification',
      verification_reference: 'AV-VER-04513A',
      verification_requested_at: daysAgo(43),
      verified_at: daysAgo(42),
      notes: 'Active contractor license in good standing. Master electrician on staff confirmed.',
      created_at: daysAgo(45),
      updated_at: daysAgo(42),
      created_by: 'Marcus Vance',
      events: [
        {
          id: 'evt_ev1_01',
          action: 'evidence_created',
          actor: 'Marcus Vance',
          actor_role: 'Contractor Owner',
          timestamp: daysAgo(45),
          notes: 'Uploaded TDLR wallet license card',
        },
        {
          id: 'evt_ev1_02',
          action: 'verification_initiated',
          actor: 'System',
          actor_role: 'Verification Engine',
          timestamp: daysAgo(43),
          notes: 'Initiated TDLR license lookup against Austin jurisdiction registry',
        },
        {
          id: 'evt_ev1_03',
          action: 'verified',
          actor: 'Avorria Trust Auditor (Sarah Chen)',
          actor_role: 'Compliance Reviewer',
          timestamp: daysAgo(42),
          notes: 'License active through next renewal cycle. Verified without stipulations. Ref: AV-VER-04513A',
        },
      ],
    },

    // 2. Commercial General Liability $2M (Document Supported)
    evi_vance_02: {
      id: 'evi_vance_02',
      org_id: DEMO_ORG,
      title: 'Travelers Commercial General Liability Certificate of Insurance ($2M/$4M)',
      evidence_type: 'insurance',
      related_record_id: 'crd_vance_gl_001',
      related_record_type: 'credential',
      related_record_title: 'Travelers General Liability Policy GL-7720-4891-TX',
      related_record_state: 'CURRENT',
      document_id: 'doc_gl_coi_01',
      document_title: 'COI_Travelers_Commercial_General_Liability_2026.pdf',
      document_file_url: '/uploads/insurance/coi_travelers_2026.pdf',
      document_type: 'coi',
      file_size_bytes: 654210,
      source: 'contractor_uploaded',
      source_label: 'Direct Broker Upload (Higginbotham Insurance Agency)',
      issued_date: '2025-06-01',
      effective_date: '2025-06-01',
      expiry_date: '2026-12-31',
      verification_state: 'DOCUMENT_SUPPORTED',
      notes: 'Standard ACORD 25 certificate furnished. 30-day notice of cancellation clause included.',
      created_at: daysAgo(28),
      updated_at: daysAgo(28),
      created_by: 'Marcus Vance',
      events: [
        {
          id: 'evt_ev2_01',
          action: 'evidence_created',
          actor: 'Marcus Vance',
          actor_role: 'Contractor Owner',
          timestamp: daysAgo(28),
          notes: 'Uploaded ACORD 25 certificate issued by Higginbotham',
        },
        {
          id: 'evt_ev2_02',
          action: 'document_linked',
          actor: 'Marcus Vance',
          actor_role: 'Contractor Owner',
          timestamp: daysAgo(28),
          notes: 'Linked to Travelers GL-7720-4891-TX compliance record',
        },
      ],
    },

    // 3. Workers' Compensation Insurance (Document Supported - Expiring Soon)
    evi_vance_03: {
      id: 'evi_vance_03',
      org_id: DEMO_ORG,
      title: 'Texas Mutual Workers Compensation & Employers Liability COI',
      evidence_type: 'insurance',
      related_record_id: 'crd_vance_wc_001',
      related_record_type: 'credential',
      related_record_title: 'Texas Mutual Workers Comp Policy WC-TX-4422-8810',
      related_record_state: 'EXPIRING',
      document_id: 'doc_wc_coi_01',
      document_title: 'COI_Texas_Mutual_Workers_Comp_2026.pdf',
      document_file_url: '/uploads/insurance/coi_texas_mutual_2026.pdf',
      document_type: 'coi',
      file_size_bytes: 521800,
      source: 'contractor_uploaded',
      source_label: 'Contractor Uploaded',
      issued_date: '2025-09-01',
      effective_date: '2025-09-01',
      expiry_date: '2026-09-26',
      verification_state: 'DOCUMENT_SUPPORTED',
      notes: 'Statutory limits Texas. Approaching renewal window in 22 days.',
      created_at: daysAgo(60),
      updated_at: daysAgo(2),
      created_by: 'Marcus Vance',
      events: [
        {
          id: 'evt_ev3_01',
          action: 'evidence_created',
          actor: 'Marcus Vance',
          actor_role: 'Contractor Owner',
          timestamp: daysAgo(60),
          notes: 'Certificate uploaded upon policy inception',
        },
      ],
    },

    // 4. Commercial Umbrella Excess $5M (Document Supported)
    evi_vance_04: {
      id: 'evi_vance_04',
      org_id: DEMO_ORG,
      title: 'Zurich Commercial Umbrella / Excess Liability Schedule ($5,000,000)',
      evidence_type: 'insurance',
      related_record_id: 'crd_vance_umbrella_001',
      related_record_type: 'credential',
      related_record_title: 'Zurich Umbrella Policy UMB-2024-TX-9932',
      related_record_state: 'CURRENT',
      document_id: 'doc_umb_01',
      document_title: 'Zurich_Umbrella_Endorsement_5M.pdf',
      document_file_url: '/uploads/insurance/zurich_umbrella_5m.pdf',
      document_type: 'coi',
      file_size_bytes: 812300,
      source: 'contractor_uploaded',
      source_label: 'Contractor Uploaded',
      verification_state: 'DOCUMENT_SUPPORTED',
      notes: 'Follow-form excess liability over underlying GL, Auto and Employers Liability.',
      created_at: daysAgo(40),
      updated_at: daysAgo(40),
      created_by: 'Marcus Vance',
      events: [
        {
          id: 'evt_ev4_01',
          action: 'evidence_created',
          actor: 'Marcus Vance',
          actor_role: 'Contractor Owner',
          timestamp: daysAgo(40),
          notes: 'Schedule uploaded',
        },
      ],
    },

    // 5. OSHA 30-Hour Construction Safety Certification (Verified)
    evi_vance_05: {
      id: 'evi_vance_05',
      org_id: DEMO_ORG,
      title: 'OSHA 30-Hour Construction Safety & Health Certification Card',
      evidence_type: 'credential',
      related_record_id: 'crd_vance_osha_001',
      related_record_type: 'credential',
      related_record_title: 'OSHA 30-Hour Certification (Marcus Vance)',
      related_record_state: 'CURRENT',
      document_id: 'doc_osha_card_01',
      document_title: 'OSHA30_Construction_MVance_Card.pdf',
      document_file_url: '/uploads/credentials/osha30_marcus_vance.pdf',
      document_type: 'other',
      file_size_bytes: 394200,
      source: 'verification_audit',
      source_label: 'OSHA Training Institute Education Center',
      verification_state: 'VERIFIED',
      verification_method: 'document_inspection',
      verifier_name: 'Avorria Workforce Verification Operations',
      verification_reference: 'AV-VER-04513B',
      verified_at: daysAgo(35),
      notes: 'Authentic 30-hour DOL/OSHA completion card confirmed for designated site safety lead.',
      created_at: daysAgo(50),
      updated_at: daysAgo(35),
      created_by: 'Marcus Vance',
      events: [
        {
          id: 'evt_ev5_01',
          action: 'evidence_created',
          actor: 'Marcus Vance',
          actor_role: 'Contractor Owner',
          timestamp: daysAgo(50),
          notes: 'Uploaded OSHA card front & back',
        },
        {
          id: 'evt_ev5_02',
          action: 'verified',
          actor: 'Avorria Auditor',
          actor_role: 'Safety Reviewer',
          timestamp: daysAgo(35),
          notes: 'Trainer ID & student verification verified with OTI record.',
        },
      ],
    },

    // 6. Project Evidence: Austin Regional Medical Center Commissioning Signoff (Document Supported)
    evi_vance_06: {
      id: 'evi_vance_06',
      org_id: DEMO_ORG,
      title: 'Travis County Healthcare District — Substation Cutover Commissioning Signoff',
      evidence_type: 'project',
      related_record_id: 'prj_vance_01',
      related_record_type: 'project',
      related_record_title: 'Austin Regional Medical Center — 480V Substation & Switchgear Upgrade',
      related_record_state: 'COMPLETED',
      document_id: 'doc_armc_commissioning',
      document_title: 'ARMC_Switchgear_Cutover_Commissioning_Acceptance.pdf',
      document_file_url: '/uploads/projects/armc_commissioning_signoff.pdf',
      document_type: 'other',
      file_size_bytes: 1240000,
      source: 'third_party_issuer',
      source_label: 'Travis County Facilities Engineering Team',
      verification_state: 'DOCUMENT_SUPPORTED',
      notes: 'Executed final acceptance letter and zero-unplanned-downtime sign-off signed by Chief Facility Engineer.',
      created_at: daysAgo(18),
      updated_at: daysAgo(18),
      created_by: 'Marcus Vance',
      events: [
        {
          id: 'evt_ev6_01',
          action: 'evidence_created',
          actor: 'Marcus Vance',
          actor_role: 'Contractor Owner',
          timestamp: daysAgo(18),
          notes: 'Attached owner engineer sign-off to completed project record',
        },
      ],
    },

    // 7. Project Evidence: Texas Innovation Campus Cleanroom ISO-5 Signoff (Document Supported)
    evi_vance_07: {
      id: 'evi_vance_07',
      org_id: DEMO_ORG,
      title: 'Texas Innovation Campus Cleanroom Class 100 Power Quality Certification',
      evidence_type: 'project',
      related_record_id: 'prj_vance_02',
      related_record_type: 'project',
      related_record_title: 'Texas Innovation Campus — Cleanroom Expansion & Critical Power',
      related_record_state: 'COMPLETED',
      document_id: 'doc_cleanroom_cert',
      document_title: 'TIC_Cleanroom_ISO5_Harmonic_Compliance_Report.pdf',
      document_file_url: '/uploads/projects/cleanroom_harmonic_report.pdf',
      document_type: 'other',
      file_size_bytes: 984000,
      source: 'third_party_issuer',
      source_label: 'Independent Commissioning Agent (Smith & Burgess Power Systems)',
      verification_state: 'DOCUMENT_SUPPORTED',
      notes: 'Third-party harmonic distortion testing verified THD < 2.5% under full semiconductor load.',
      created_at: daysAgo(14),
      updated_at: daysAgo(14),
      created_by: 'Marcus Vance',
      events: [
        {
          id: 'evt_ev7_01',
          action: 'evidence_created',
          actor: 'Marcus Vance',
          actor_role: 'Contractor Owner',
          timestamp: daysAgo(14),
          notes: 'Attached harmonic testing certificate to Texas Innovation Campus project',
        },
      ],
    },

    // 8. Capability Evidence: NFPA 70E Arc Flash Safety Program (Contractor Supplied)
    evi_vance_08: {
      id: 'evi_vance_08',
      org_id: DEMO_ORG,
      title: 'Vance Commercial Electric Written Arc Flash Safety Standard & SOP (NFPA 70E Aligned)',
      evidence_type: 'capability',
      related_record_id: 'cap_vance_04',
      related_record_type: 'capability',
      related_record_title: 'Arc Flash Study & Mitigation (NFPA 70E Compliance)',
      related_record_state: 'ACTIVE',
      document_id: 'doc_nfpa70e_sop',
      document_title: 'Vance_Electric_NFPA70E_ArcFlash_Safety_Manual_v3.pdf',
      document_file_url: '/uploads/capabilities/arc_flash_sop.pdf',
      document_type: 'safety_plan',
      file_size_bytes: 1450000,
      source: 'contractor_uploaded',
      source_label: 'Internal Operational Documentation',
      verification_state: 'CONTRACTOR_SUPPLIED',
      notes: 'Company written policy detailing zero-voltage testing, PPE category 4 procedures and energised work permit workflow.',
      created_at: daysAgo(21),
      updated_at: daysAgo(21),
      created_by: 'Marcus Vance',
      events: [
        {
          id: 'evt_ev8_01',
          action: 'evidence_created',
          actor: 'Marcus Vance',
          actor_role: 'Contractor Owner',
          timestamp: daysAgo(21),
          notes: 'Uploaded written company SOP to support Arc Flash capability',
        },
      ],
    },

    // 9. Business Identity: Texas Secretary of State Certificate of Filing (Verified)
    evi_vance_09: {
      id: 'evi_vance_09',
      org_id: DEMO_ORG,
      title: 'Texas Secretary of State Certificate of Filing (LLC Formation #804291882)',
      evidence_type: 'business',
      related_record_id: 'biz_vance_electric',
      related_record_type: 'business',
      related_record_title: 'Vance Commercial Electric LLC (Texas LLC Formation)',
      related_record_state: 'CURRENT',
      document_id: 'doc_sos_cert_01',
      document_title: 'Texas_SOS_Certificate_of_Filing_VanceElectric.pdf',
      document_file_url: '/uploads/business/texas_sos_filing.pdf',
      document_type: 'other',
      file_size_bytes: 312000,
      source: 'verification_audit',
      source_label: 'Texas Secretary of State Business Registry',
      verification_state: 'VERIFIED',
      verification_method: 'state_board_lookup',
      verifier_name: 'Avorria Corporate Identity Review Desk',
      verification_reference: 'AV-VER-04513C',
      verified_at: daysAgo(42),
      notes: 'Entity in good standing, domestic LLC chartered in Texas, franchise tax active.',
      created_at: daysAgo(45),
      updated_at: daysAgo(42),
      created_by: 'Marcus Vance',
      events: [
        {
          id: 'evt_ev9_01',
          action: 'evidence_created',
          actor: 'Marcus Vance',
          actor_role: 'Contractor Owner',
          timestamp: daysAgo(45),
          notes: 'Filing certificate uploaded',
        },
        {
          id: 'evt_ev9_02',
          action: 'verified',
          actor: 'Avorria Legal Ops',
          actor_role: 'Compliance Reviewer',
          timestamp: daysAgo(42),
          notes: 'Cross-checked with Texas Comptroller and SOS business records. Ref: AV-VER-04513C',
        },
      ],
    },

    // 10. Safety Record: High-Rise Chiller Plant JHA (Document Supported / Platform Generated)
    evi_vance_10: {
      id: 'evi_vance_10',
      org_id: DEMO_ORG,
      title: 'Job Hazard Analysis: 480V Substation Feeder Cable Pulling (Signed Lead Sign-off)',
      evidence_type: 'safety',
      related_record_id: 'doc_sign_test_1788544894590',
      related_record_type: 'credential',
      related_record_title: 'High-Rise Chiller Plant JHA (Site Safety Plan)',
      related_record_state: 'ACTIVE',
      document_id: 'doc_sign_test_1788544894590',
      document_title: 'High-Rise Chiller Plant JHA - Signed.pdf',
      document_file_url: '/uploads/safety/jha_signed_armc.pdf',
      document_type: 'jha',
      file_size_bytes: 420000,
      source: 'platform_generated',
      source_label: 'Avorria Safety Engine (Signed by Marcus Vance)',
      verification_state: 'DOCUMENT_SUPPORTED',
      notes: 'Cryptographically signed JHA record with SHA-256 signer IP hash.',
      created_at: daysAgo(5),
      updated_at: daysAgo(5),
      created_by: 'Marcus Vance',
      events: [
        {
          id: 'evt_ev10_01',
          action: 'evidence_created',
          actor: 'Marcus Vance',
          actor_role: 'Site Safety Lead',
          timestamp: daysAgo(5),
          notes: 'Completed digital signing and attached to safety evidence ledger',
        },
      ],
    },
  };

  return { evidence: initialEvidence };
}

function loadStore(): ProveStoreData {
  if (memoryProveStore) {
    return memoryProveStore;
  }

  ensureDataDir();

  let store: ProveStoreData;

  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      store = JSON.parse(raw) as ProveStoreData;
    } else {
      store = getInitialStore();
    }
  } catch {
    store = getInitialStore();
  }

  memoryProveStore = store;

  try {
    if (!fs.existsSync(STORE_PATH)) {
      fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
    }
  } catch {
    // Graceful fallback for read-only environments
  }

  return store;
}

function saveStore(store: ProveStoreData): void {
  memoryProveStore = store;
  try {
    ensureDataDir();
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch {
    // Graceful fallback for read-only environments
  }
}

// ─── CRUD Operations ─────────────────────────────────────────────────────────

export async function listEvidence(orgId: string): Promise<EvidenceItem[]> {
  const store = loadStore();
  const items = Object.values(store.evidence).filter((e) => e.org_id === orgId);
  // Sort by updated_at descending
  return items.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

export async function getEvidence(id: string): Promise<EvidenceItem | null> {
  const store = loadStore();
  return store.evidence[id] || null;
}

export async function createEvidence(input: CreateEvidenceInput): Promise<EvidenceItem> {
  const store = loadStore();
  const id = `evi_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  // Section 57: A contractor user must NOT be able to self-promote evidence to VERIFIED.
  let verificationState = input.verification_state || 'CONTRACTOR_SUPPLIED';
  if (!input.is_internal_verifier && verificationState === 'VERIFIED') {
    verificationState = input.document_file_url || input.document_id ? 'DOCUMENT_SUPPORTED' : 'CONTRACTOR_SUPPLIED';
  } else if (input.document_file_url || input.document_id) {
    if (verificationState === 'CONTRACTOR_SUPPLIED') {
      verificationState = 'DOCUMENT_SUPPORTED';
    }
  }

  const item: EvidenceItem = {
    id,
    org_id: input.org_id,
    title: input.title,
    evidence_type: input.evidence_type,
    related_record_id: input.related_record_id,
    related_record_type: input.related_record_type,
    related_record_title: input.related_record_title,
    related_record_state: input.related_record_state || 'CURRENT',
    document_id: input.document_id,
    document_title: input.document_title,
    document_file_url: input.document_file_url,
    source: input.source || 'contractor_uploaded',
    source_label: input.source_label || (input.document_id ? 'Supporting Document Attached' : 'Contractor Uploaded'),
    issued_date: input.issued_date,
    effective_date: input.effective_date,
    expiry_date: input.expiry_date,
    verification_state: verificationState,
    notes: input.notes,
    created_at: now,
    updated_at: now,
    created_by: input.created_by || 'Contractor Staff',
    events: [
      {
        id: `evt_${Date.now()}_01`,
        action: 'evidence_created',
        actor: input.created_by || 'Contractor Staff',
        actor_role: input.is_internal_verifier ? 'Internal Verifier' : 'Contractor',
        timestamp: now,
        notes: 'Evidence item created and linked to record',
      },
    ],
  };

  store.evidence[id] = item;
  saveStore(store);
  return item;
}

export async function updateEvidence(id: string, input: UpdateEvidenceInput): Promise<EvidenceItem> {
  const store = loadStore();
  const existing = store.evidence[id];
  if (!existing) {
    throw new Error(`Evidence item ${id} not found.`);
  }

  const now = new Date().toISOString();
  const newEvents = [...existing.events];
  const isVerifier = input.actor_role === 'internal_verifier';

  let newVerificationState = existing.verification_state;

  // Section 57: Contractor cannot self-verify
  if (input.verification_state && input.verification_state !== existing.verification_state) {
    if (!isVerifier && input.verification_state === 'VERIFIED') {
      // Reject contractor self-verification attempt: keep current state
      newVerificationState = existing.verification_state;
    } else {
      newVerificationState = input.verification_state;
      newEvents.push({
        id: `evt_${Date.now()}_state`,
        action: 'state_updated',
        actor: input.actor_name || 'Workspace User',
        actor_role: isVerifier ? 'Internal Verifier' : 'Contractor',
        timestamp: now,
        notes: `Verification state updated from ${existing.verification_state} to ${newVerificationState}`,
      });
    }
  }

  // Section 65 & 66: Editing Verified Evidence
  // If a verified record has material changes (document replaced, dates changed, or title changed),
  // invalidate the verification state and require re-verification!
  const isDocReplaced = (input.document_id !== undefined && input.document_id !== existing.document_id) ||
                        (input.document_file_url !== undefined && input.document_file_url !== existing.document_file_url);
  const isDateChanged = (input.expiry_date !== undefined && input.expiry_date !== existing.expiry_date) ||
                        (input.effective_date !== undefined && input.effective_date !== existing.effective_date);
  const isTitleChanged = (input.title !== undefined && input.title !== existing.title);

  let verifiedAt = existing.verified_at;
  let verifierName = existing.verifier_name;
  let verificationReference = existing.verification_reference;

  if (existing.verification_state === 'VERIFIED' && !isVerifier && (isDocReplaced || isDateChanged || isTitleChanged)) {
    newVerificationState = 'REVIEW_REQUIRED';
    verifiedAt = undefined;
    verifierName = undefined;
    verificationReference = undefined;

    newEvents.push({
      id: `evt_${Date.now()}_inv`,
      action: 'verification_invalidated',
      actor: input.actor_name || 'Workspace User',
      actor_role: 'System / Security Policy',
      timestamp: now,
      notes: `Verification invalidated due to material change to ${isDocReplaced ? 'supporting document' : isDateChanged ? 'policy dates' : 'evidence claim'}. Re-verification required.`,
    });
  }

  if (isDocReplaced) {
    newEvents.push({
      id: `evt_${Date.now()}_doc`,
      action: 'document_linked',
      actor: input.actor_name || 'Workspace User',
      actor_role: isVerifier ? 'Internal Verifier' : 'Contractor',
      timestamp: now,
      notes: `Linked document ${input.document_title || input.document_id}`,
    });
  }

  const updated: EvidenceItem = {
    ...existing,
    title: input.title !== undefined ? input.title : existing.title,
    document_id: input.document_id !== undefined ? input.document_id : existing.document_id,
    document_title: input.document_title !== undefined ? input.document_title : existing.document_title,
    document_file_url: input.document_file_url !== undefined ? input.document_file_url : existing.document_file_url,
    issued_date: input.issued_date !== undefined ? input.issued_date : existing.issued_date,
    effective_date: input.effective_date !== undefined ? input.effective_date : existing.effective_date,
    expiry_date: input.expiry_date !== undefined ? input.expiry_date : existing.expiry_date,
    verification_state: newVerificationState,
    verified_at: verifiedAt,
    verifier_name: verifierName,
    verification_reference: verificationReference,
    related_record_state: input.related_record_state !== undefined ? input.related_record_state : existing.related_record_state,
    notes: input.notes !== undefined ? input.notes : existing.notes,
    updated_at: now,
    events: newEvents,
  };

  store.evidence[id] = updated;
  saveStore(store);
  return updated;
}

export async function deleteEvidence(id: string): Promise<boolean> {
  const store = loadStore();
  if (!store.evidence[id]) return false;
  delete store.evidence[id];
  saveStore(store);
  return true;
}

export async function requestReview(id: string, notes?: string): Promise<EvidenceItem> {
  const store = loadStore();
  const existing = store.evidence[id];
  if (!existing) {
    throw new Error(`Evidence item ${id} not found.`);
  }

  const now = new Date().toISOString();
  const updatedEvents = [
    ...existing.events,
    {
      id: `evt_${Date.now()}_rev`,
      action: 'review_requested' as const,
      actor: 'Contractor',
      actor_role: 'Applicant',
      timestamp: now,
      notes: notes || 'Contractor requested auditor verification review',
    },
  ];

  const updated: EvidenceItem = {
    ...existing,
    verification_state: 'REVIEW_REQUIRED',
    verification_requested_at: now,
    updated_at: now,
    events: updatedEvents,
  };

  store.evidence[id] = updated;
  saveStore(store);
  return updated;
}

export async function verifyEvidence(
  id: string,
  verifierName: string,
  reference: string,
  method: 'document_inspection' | 'state_board_lookup' | 'third_party_audit' | 'automated_api' = 'document_inspection',
  notes?: string
): Promise<EvidenceItem> {
  const store = loadStore();
  const existing = store.evidence[id];
  if (!existing) {
    throw new Error(`Evidence item ${id} not found.`);
  }

  const now = new Date().toISOString();
  const updatedEvents = [
    ...existing.events,
    {
      id: `evt_${Date.now()}_ver`,
      action: 'verified' as const,
      actor: verifierName,
      actor_role: 'Internal Verifier',
      timestamp: now,
      notes: notes || `Verified under reference ${reference}`,
    },
  ];

  const updated: EvidenceItem = {
    ...existing,
    verification_state: 'VERIFIED',
    verified_at: now,
    verifier_name: verifierName,
    verification_reference: reference,
    verification_method: method,
    updated_at: now,
    events: updatedEvents,
  };

  store.evidence[id] = updated;
  saveStore(store);
  return updated;
}

// ─── Analytics & Position ───────────────────────────────────────────────────

export async function getEvidencePosition(orgId: string): Promise<EvidencePosition> {
  const items = await listEvidence(orgId);
  const unsupported = await getUnsupportedRecords(orgId);

  return {
    total_evidence: items.length,
    verified: items.filter((i) => i.verification_state === 'VERIFIED').length,
    document_supported: items.filter((i) => i.verification_state === 'DOCUMENT_SUPPORTED').length,
    contractor_supplied: items.filter((i) => i.verification_state === 'CONTRACTOR_SUPPLIED').length,
    pending_verification: items.filter((i) => i.verification_state === 'PENDING_VERIFICATION').length,
    review_required: items.filter((i) => i.verification_state === 'REVIEW_REQUIRED').length,
    verification_failed: items.filter((i) => i.verification_state === 'VERIFICATION_FAILED').length,
    unsupported_records_count: unsupported.length,
  };
}

// ─── Evidence Needed (Unsupported Records) ──────────────────────────────────

export async function getUnsupportedRecords(orgId: string): Promise<UnsupportedRecord[]> {
  const evidenceItems = await listEvidence(orgId);
  const supportedRecordIds = new Set(evidenceItems.map((e) => e.related_record_id));

  const unsupported: UnsupportedRecord[] = [];

  // Check COMPLY credentials
  const credentials = await listCredentials(orgId);
  for (const cred of credentials) {
    if (!supportedRecordIds.has(cred.id) && !cred.document_id) {
      const typeLabel = cred.type.replace(/_/g, ' ');
      unsupported.push({
        id: cred.id,
        title: cred.policy_or_license_number
          ? `${typeLabel.toUpperCase()} (${cred.policy_or_license_number})`
          : `${typeLabel.toUpperCase()}`,
        category: cred.type === 'trade_license' ? 'licence' : 'insurance',
        record_type_label: typeLabel,
        record_state: cred.status === 'expired' ? 'EXPIRED' : 'CURRENT',
        action_href: `/workspace/prove/evidence?linkRecord=${cred.id}&category=${cred.type === 'trade_license' ? 'licence' : 'insurance'}`,
        reason: 'No certificate or license documentation attached to substantiate this policy.',
      });
    }
  }

  // Check CREATE projects
  const projects = await listProjects(orgId);
  for (const prj of projects) {
    if (!supportedRecordIds.has(prj.id)) {
      unsupported.push({
        id: prj.id,
        title: prj.name,
        category: 'project',
        record_type_label: 'Project Experience',
        record_state: prj.status === 'completed' ? 'COMPLETED' : 'ACTIVE',
        action_href: `/workspace/prove/evidence?linkRecord=${prj.id}&category=project`,
        reason: 'No completion certificate, client sign-off or handover letter linked to this project.',
      });
    }
  }

  // Check CREATE capabilities
  const capabilities = await listCapabilities(orgId);
  for (const cap of capabilities) {
    if (!supportedRecordIds.has(cap.id)) {
      unsupported.push({
        id: cap.id,
        title: cap.name,
        category: 'capability',
        record_type_label: 'Contractor Capability',
        record_state: 'ACTIVE',
        action_href: `/workspace/prove/evidence?linkRecord=${cap.id}&category=capability`,
        reason: 'No technical procedure, training certificate or project proof substantiating this capability.',
      });
    }
  }

  return unsupported;
}

// ─── Evidence Completeness Breakdown ────────────────────────────────────────

export async function getEvidenceCompleteness(orgId: string): Promise<EvidenceCompletenessSummary> {
  const items = await listEvidence(orgId);
  const credentials = await listCredentials(orgId);
  const projects = await listProjects(orgId);
  const capabilities = await listCapabilities(orgId);
  const references = await listReferences(orgId);

  const byCat = (cat: string) => items.filter((i) => i.evidence_type === cat);

  const categories: CategoryEvidenceCompleteness[] = [
    {
      category: 'licence',
      label: 'Licences & Permits',
      total_records: credentials.filter((c) => c.type === 'trade_license').length || 1,
      records_with_evidence: byCat('licence').length,
      verified_count: byCat('licence').filter((i) => i.verification_state === 'VERIFIED').length,
      document_supported_count: byCat('licence').filter((i) => i.verification_state === 'DOCUMENT_SUPPORTED').length,
      contractor_supplied_count: byCat('licence').filter((i) => i.verification_state === 'CONTRACTOR_SUPPLIED').length,
    },
    {
      category: 'insurance',
      label: 'Insurance & COIs',
      total_records: credentials.filter((c) => ['general_liability_coi', 'workers_comp', 'umbrella', 'auto'].includes(c.type)).length || 4,
      records_with_evidence: byCat('insurance').length,
      verified_count: byCat('insurance').filter((i) => i.verification_state === 'VERIFIED').length,
      document_supported_count: byCat('insurance').filter((i) => i.verification_state === 'DOCUMENT_SUPPORTED').length,
      contractor_supplied_count: byCat('insurance').filter((i) => i.verification_state === 'CONTRACTOR_SUPPLIED').length,
    },
    {
      category: 'credential',
      label: 'Credentials & Certifications',
      total_records: credentials.filter((c) => ['osha_card', 'other'].includes(c.type)).length || 2,
      records_with_evidence: byCat('credential').length,
      verified_count: byCat('credential').filter((i) => i.verification_state === 'VERIFIED').length,
      document_supported_count: byCat('credential').filter((i) => i.verification_state === 'DOCUMENT_SUPPORTED').length,
      contractor_supplied_count: byCat('credential').filter((i) => i.verification_state === 'CONTRACTOR_SUPPLIED').length,
    },
    {
      category: 'project',
      label: 'Project Experience',
      total_records: projects.length,
      records_with_evidence: byCat('project').length,
      verified_count: byCat('project').filter((i) => i.verification_state === 'VERIFIED').length,
      document_supported_count: byCat('project').filter((i) => i.verification_state === 'DOCUMENT_SUPPORTED').length,
      contractor_supplied_count: byCat('project').filter((i) => i.verification_state === 'CONTRACTOR_SUPPLIED').length,
    },
    {
      category: 'capability',
      label: 'Contractor Capabilities',
      total_records: capabilities.length,
      records_with_evidence: byCat('capability').length,
      verified_count: byCat('capability').filter((i) => i.verification_state === 'VERIFIED').length,
      document_supported_count: byCat('capability').filter((i) => i.verification_state === 'DOCUMENT_SUPPORTED').length,
      contractor_supplied_count: byCat('capability').filter((i) => i.verification_state === 'CONTRACTOR_SUPPLIED').length,
    },
    {
      category: 'reference',
      label: 'Commercial References',
      total_records: references.length,
      records_with_evidence: byCat('reference').length,
      verified_count: byCat('reference').filter((i) => i.verification_state === 'VERIFIED').length,
      document_supported_count: byCat('reference').filter((i) => i.verification_state === 'DOCUMENT_SUPPORTED').length,
      contractor_supplied_count: byCat('reference').filter((i) => i.verification_state === 'CONTRACTOR_SUPPLIED').length,
    },
  ];

  const total_records = categories.reduce((sum, c) => sum + c.total_records, 0);
  const total_with_evidence = categories.reduce((sum, c) => sum + c.records_with_evidence, 0);
  const total_verified = categories.reduce((sum, c) => sum + c.verified_count, 0);

  return {
    categories,
    total_records,
    total_with_evidence,
    total_verified,
  };
}

export async function getRecentlyVerified(orgId: string, limit: number = 5): Promise<EvidenceItem[]> {
  const items = await listEvidence(orgId);
  const verified = items.filter((i) => i.verification_state === 'VERIFIED' && Boolean(i.verified_at));
  return verified
    .sort((a, b) => new Date(b.verified_at!).getTime() - new Date(a.verified_at!).getTime())
    .slice(0, limit);
}
