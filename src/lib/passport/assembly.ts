/**
 * AVORRIA CONTRACTOR PASSPORT — ASSEMBLY & READINESS SERVICE
 *
 * Phase 8: Verified Contractor Commercial Identity Layer
 *
 * Core Concept:
 *   BUSINESS → CREATE → COMPLY → PROVE → PASSPORT
 *
 * Passport is a presentation and assembly layer over authoritative underlying records:
 * - Business: identity, organization structure, location, primary trades
 * - CREATE: capabilities, project experience, case studies, references, commercial profile
 * - COMPLY: licences, insurance, credentials, safety records (with dynamic expiry calculations)
 * - PROVE: evidence items, verification states (VERIFIED, DOCUMENT_SUPPORTED, CONTRACTOR_SUPPLIED), audit provenance
 * - SNAPSHOTS: coherent, immutable point-in-time versions for external commercial distribution
 */

import {
  getOrganization,
  saveOrganization,
} from '@/lib/workspace/db';
import {
  getPassportByOrg,
  savePassport,
} from '@/lib/workspace/passport';
import {
  listCapabilities,
  listProjects,
  listCaseStudies,
  listReferences,
  getCommercialProfile,
} from '@/lib/create/evidence-store';
import { listComplyRecords } from '@/lib/comply/state-engine';
import { listEvidence } from '@/lib/prove/prove-store';
import {
  Passport,
  PassportSnapshot,
  Organization,
} from '@/lib/workspace/types';
import {
  AssembledPassport,
  AssembledCapability,
  AssembledProject,
  AssembledCaseStudy,
  AssembledReference,
  AssembledComplianceRecord,
  PassportReadiness,
  UpdatePassportAssemblyInput,
} from './types';

/**
 * Derives a clean URL-friendly slug from the organization name.
 */
function slugifyOrgName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Transparent completeness & readiness engine for Contractor Passport.
 * Replaces arbitrary AI scores with clear, verifiable categorical facts.
 */
export function evaluatePassportReadiness(
  org: Organization,
  profile: any,
  capabilities: AssembledCapability[],
  projects: AssembledProject[],
  complianceRecords: AssembledComplianceRecord[],
  evidenceItems: any[],
  references: AssembledReference[]
): PassportReadiness {
  // 1. Identity Check
  const hasName = Boolean(org.name && org.name.trim().length > 2);
  const hasTrade = Boolean(org.primary_trade);
  const hasLocation = Boolean(org.hq_address?.city || org.states_licensed?.length > 0);

  const isIdentityComplete = hasName && hasTrade && hasLocation;
  const identityStatus = isIdentityComplete ? 'COMPLETE' : 'NEEDS_ATTENTION';
  const identityDetail = isIdentityComplete
    ? `${org.name} • ${org.primary_trade} • ${org.hq_address?.city || org.states_licensed?.[0] || 'US'}`
    : 'Business name, primary trade classification, or headquarters location missing.';

  // 2. Capabilities Check
  const capCount = capabilities.length;
  const capSelected = capabilities.filter((c) => c.is_selected).length;
  const capStatus = capCount > 0 ? 'COMPLETE' : 'NEEDS_ATTENTION';
  const capDetail = capCount > 0
    ? `${capCount} capability specialism${capCount === 1 ? '' : 's'} recorded (${capSelected} selected for Passport)`
    : 'No capabilities recorded in CREATE.';

  // 3. Experience / Projects Check
  const projCount = projects.length;
  const projSelected = projects.filter((p) => p.is_selected).length;
  const projStatus = projCount > 0 ? 'COMPLETE' : 'NEEDS_ATTENTION';
  const projDetail = projCount > 0
    ? `${projCount} commercial project${projCount === 1 ? '' : 's'} recorded (${projSelected} selected for Passport)`
    : 'No project experience recorded in CREATE.';

  // 4. Compliance Check
  const compTotal = complianceRecords.length;
  const compCurrent = complianceRecords.filter(
    (c) => c.expiry_state === 'CURRENT' || c.expiry_state === 'NO_EXPIRY'
  ).length;
  const compExpiring = complianceRecords.filter(
    (c) => c.expiry_state === 'EXPIRING_CRITICAL' || c.expiry_state === 'EXPIRING_HIGH' || c.expiry_state === 'EXPIRING_UPCOMING'
  ).length;
  const compExpired = complianceRecords.filter((c) => c.expiry_state === 'EXPIRED').length;

  let compStatus: 'CURRENT' | 'ATTENTION_REQUIRED' | 'INCOMPLETE' = 'CURRENT';
  if (compTotal === 0) {
    compStatus = 'INCOMPLETE';
  } else if (compExpired > 0 || compExpiring > 0) {
    compStatus = 'ATTENTION_REQUIRED';
  }

  const compDetail = compTotal > 0
    ? `${compCurrent} current, ${compExpiring} expiring, ${compExpired} expired`
    : 'No compliance records structured in COMPLY.';

  // 5. Evidence Check
  const evTotal = evidenceItems.length;
  const evVerified = evidenceItems.filter((e) => e.verification_state === 'VERIFIED').length;
  const evDocSupported = evidenceItems.filter((e) => e.verification_state === 'DOCUMENT_SUPPORTED').length;
  const evStatus = evTotal > 0 ? 'EVIDENCE_AVAILABLE' : 'EVIDENCE_GAPS';
  const evDetail = evTotal > 0
    ? `${evTotal} supporting record${evTotal === 1 ? '' : 's'} (${evVerified} verified, ${evDocSupported} document-supported)`
    : 'No supporting evidence attached in PROVE.';

  // 6. References Check
  const refCount = references.length;
  const refSelected = references.filter((r) => r.is_selected).length;
  const refStatus = refCount > 0 ? 'PRESENT' : 'NONE_ADDED';
  const refDetail = refCount > 0
    ? `${refCount} commercial reference${refCount === 1 ? '' : 's'} on file (${refSelected} selected for Passport)`
    : 'No commercial references recorded in CREATE.';

  // Overall Standing
  const isAttentionRequired =
    identityStatus === 'NEEDS_ATTENTION' ||
    capStatus === 'NEEDS_ATTENTION' ||
    projStatus === 'NEEDS_ATTENTION' ||
    compStatus === 'ATTENTION_REQUIRED';

  const overallStanding = isAttentionRequired ? 'ATTENTION_REQUIRED' : 'PROFILE_CURRENT';
  const summary = overallStanding === 'PROFILE_CURRENT'
    ? 'All core commercial identity, capability, and compliance sections are substantiated and current.'
    : 'Action required: Some compliance or commercial records require attention or renewal.';

  return {
    identity: {
      status: identityStatus,
      label: isIdentityComplete ? 'Complete' : 'Incomplete',
      detail: identityDetail,
      action_href: '/workspace/settings',
      action_label: 'Edit Identity',
    },
    capabilities: {
      status: capStatus,
      count: capCount,
      selected: capSelected,
      label: capCount > 0 ? `${capSelected}/${capCount} Selected` : 'None Added',
      detail: capDetail,
      action_href: '/workspace/create',
      action_label: 'Manage Capabilities',
    },
    experience: {
      status: projStatus,
      count: projCount,
      selected: projSelected,
      label: projCount > 0 ? `${projSelected}/${projCount} Selected` : 'None Added',
      detail: projDetail,
      action_href: '/workspace/create/projects',
      action_label: 'Manage Projects',
    },
    compliance: {
      status: compStatus,
      count: compTotal,
      label: compStatus === 'CURRENT' ? 'Current' : compStatus === 'ATTENTION_REQUIRED' ? 'Attention Required' : 'Incomplete',
      detail: compDetail,
      action_href: '/workspace/comply',
      action_label: 'Review Comply',
    },
    evidence: {
      status: evStatus,
      count: evTotal,
      label: evTotal > 0 ? `${evVerified} Verified` : 'No Evidence',
      detail: evDetail,
      action_href: '/workspace/prove',
      action_label: 'Open Prove',
    },
    references: {
      status: refStatus,
      count: refCount,
      selected: refSelected,
      label: refCount > 0 ? `${refSelected}/${refCount} Selected` : 'None Added',
      detail: refDetail,
      action_href: '/workspace/create/references',
      action_label: 'Manage References',
    },
    overall_standing: overallStanding,
    summary,
  };
}

/**
 * Loads all authoritative records across Business, CREATE, COMPLY, and PROVE,
 * and assembles the live Contractor Passport.
 */
export async function getAssembledPassport(orgId: string): Promise<AssembledPassport> {
  const [
    org,
    profile,
    capabilities,
    projects,
    caseStudies,
    references,
    complianceRecords,
    evidenceItems,
    passportRecord,
  ] = await Promise.all([
    getOrganization(orgId),
    getCommercialProfile(orgId),
    listCapabilities(orgId),
    listProjects(orgId),
    listCaseStudies(orgId),
    listReferences(orgId),
    listComplyRecords(orgId),
    listEvidence(orgId),
    getPassportByOrg(orgId),
  ]);

  if (!org) {
    throw new Error(`Organization ${orgId} not found.`);
  }

  // Ensure Passport record exists with default full selections
  let passport = passportRecord;
  if (!passport) {
    const defaultSlug = slugifyOrgName(org.name || 'contractor');
    passport = await savePassport(orgId, {
      slug: defaultSlug,
      version: 1,
      status: 'CURRENT',
      headline: `${org.primary_trade} Contractor`,
      is_password_protected: false,
      included_capability_ids: capabilities.map((c) => c.id),
      included_project_ids: projects.map((p) => p.id),
      included_case_study_ids: caseStudies.map((cs) => cs.id),
      included_reference_ids: references.map((r) => r.id),
      included_credential_ids: complianceRecords.map((c) => c.id),
      included_evidence_ids: evidenceItems.map((e) => e.id),
      included_document_ids: [],
      show_identity: true,
      show_capabilities: true,
      show_experience: true,
      show_case_studies: true,
      show_references: true,
      show_compliance: true,
      show_evidence: true,
    });
  }

  // 1. Assembled Capabilities with PROVE evidence linkage
  const assembledCapabilities: AssembledCapability[] = capabilities.map((cap) => {
    const matchingEv = evidenceItems.filter(
      (e) => e.related_record_id === cap.id || (e.evidence_type === 'capability' && e.title.includes(cap.name))
    );
    const hasVerified = matchingEv.some((e) => e.verification_state === 'VERIFIED');
    const isSelected = passport?.included_capability_ids
      ? passport.included_capability_ids.includes(cap.id)
      : true;

    return {
      ...cap,
      is_selected: isSelected,
      evidence_count: matchingEv.length,
      has_verified_evidence: hasVerified,
      evidence_ids: matchingEv.map((e) => e.id),
    };
  });

  // 2. Assembled Projects with PROVE evidence linkage
  const assembledProjects: AssembledProject[] = projects.map((proj) => {
    const matchingEv = evidenceItems.filter(
      (e) => e.related_record_id === proj.id || (e.evidence_type === 'project' && e.title.includes(proj.name))
    );
    const hasVerified = matchingEv.some((e) => e.verification_state === 'VERIFIED');
    const isSelected = passport?.included_project_ids
      ? passport.included_project_ids.includes(proj.id)
      : true;

    return {
      ...proj,
      is_selected: isSelected,
      evidence_count: matchingEv.length,
      has_verified_evidence: hasVerified,
      evidence_ids: matchingEv.map((e) => e.id),
    };
  });

  // 3. Assembled Case Studies
  const assembledCaseStudies: AssembledCaseStudy[] = caseStudies.map((cs) => ({
    ...cs,
    is_selected: passport?.included_case_study_ids
      ? passport.included_case_study_ids.includes(cs.id)
      : true,
  }));

  // 4. Assembled References
  const assembledReferences: AssembledReference[] = references.map((ref) => ({
    ...ref,
    is_selected: passport?.included_reference_ids
      ? passport.included_reference_ids.includes(ref.id)
      : true,
  }));

  // 5. Assembled Compliance Records with PROVE verification state & reference
  const assembledCompliance: AssembledComplianceRecord[] = complianceRecords.map((cr) => {
    const matchingEv = evidenceItems.find(
      (e) => e.related_record_id === cr.id || (e.evidence_type === cr.category && e.title.includes(cr.display_label))
    );
    const isSelected = passport?.included_credential_ids
      ? passport.included_credential_ids.includes(cr.id)
      : true;

    return {
      ...cr,
      is_selected: isSelected,
      prove_verification_state: matchingEv?.verification_state,
      prove_verification_ref: matchingEv?.verification_reference,
    };
  });

  // 6. Transparent Readiness Engine
  const readiness = evaluatePassportReadiness(
    org,
    profile,
    assembledCapabilities,
    assembledProjects,
    assembledCompliance,
    evidenceItems,
    assembledReferences
  );

  return {
    passport,
    organization: org,
    commercialProfile: profile,
    capabilities: assembledCapabilities,
    projects: assembledProjects,
    caseStudies: assembledCaseStudies,
    references: assembledReferences,
    complianceRecords: assembledCompliance,
    evidenceItems,
    readiness,
    snapshots: passport.snapshots || [],
  };
}

/**
 * Updates Passport assembly inclusion selections, section toggles, and metadata.
 * Does NOT modify any underlying records in Business, CREATE, COMPLY, or PROVE.
 */
export async function updatePassportAssembly(
  orgId: string,
  input: UpdatePassportAssemblyInput
): Promise<Passport> {
  const existing = await getPassportByOrg(orgId);
  const org = await getOrganization(orgId);
  if (!org) throw new Error(`Organization ${orgId} not found`);

  const slug = input.slug || existing?.slug || slugifyOrgName(org.name || 'contractor');

  const updated = await savePassport(orgId, {
    slug,
    headline: input.headline,
    summary_override: input.summary_override,
    is_password_protected: input.is_password_protected,
    password: input.password,
    included_capability_ids: input.included_capability_ids,
    included_project_ids: input.included_project_ids,
    included_case_study_ids: input.included_case_study_ids,
    included_reference_ids: input.included_reference_ids,
    included_credential_ids: input.included_credential_ids,
    included_evidence_ids: input.included_evidence_ids,
    included_document_ids: input.included_document_ids,
    show_identity: input.show_identity,
    show_capabilities: input.show_capabilities,
    show_experience: input.show_experience,
    show_case_studies: input.show_case_studies,
    show_references: input.show_references,
    show_compliance: input.show_compliance,
    show_evidence: input.show_evidence,
  });

  return updated;
}

/**
 * Creates an immutable point-in-time snapshot of the assembled Passport.
 * Enables coherent version control for external sharing without mutating past representations.
 */
export async function publishPassportSnapshot(
  orgId: string,
  authorName: string,
  note?: string
): Promise<PassportSnapshot> {
  const assembly = await getAssembledPassport(orgId);
  const passport = assembly.passport;

  const currentVersion = passport.version || 1;
  const nextVersion = Number((currentVersion + 0.1).toFixed(1));
  const now = new Date().toISOString();

  const snapshot: PassportSnapshot = {
    id: `snp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    version: nextVersion,
    generated_at: now,
    generated_by: authorName,
    note: note || `Published version ${nextVersion}`,
    status: 'CURRENT',
    included_capability_ids: assembly.capabilities.filter((c) => c.is_selected).map((c) => c.id),
    included_project_ids: assembly.projects.filter((p) => p.is_selected).map((p) => p.id),
    included_case_study_ids: assembly.caseStudies.filter((cs) => cs.is_selected).map((cs) => cs.id),
    included_reference_ids: assembly.references.filter((r) => r.is_selected).map((r) => r.id),
    included_credential_ids: assembly.complianceRecords.filter((cr) => cr.is_selected).map((cr) => cr.id),
    included_document_ids: passport.included_document_ids || [],
  };

  // Archive previous snapshots
  const updatedSnapshots: PassportSnapshot[] = (passport.snapshots || []).map((s) => ({
    ...s,
    status: 'ARCHIVED',
  }));
  updatedSnapshots.unshift(snapshot);

  // Update passport with new published version
  const updatedPassport = await savePassport(orgId, {
    slug: passport.slug,
    version: nextVersion,
    published_version: nextVersion,
    published_at: now,
    headline: passport.headline,
    summary_override: passport.summary_override,
    is_password_protected: passport.is_password_protected,
    included_capability_ids: snapshot.included_capability_ids,
    included_project_ids: snapshot.included_project_ids,
    included_case_study_ids: snapshot.included_case_study_ids,
    included_reference_ids: snapshot.included_reference_ids,
    included_credential_ids: snapshot.included_credential_ids,
    included_document_ids: snapshot.included_document_ids,
    show_identity: passport.show_identity,
    show_capabilities: passport.show_capabilities,
    show_experience: passport.show_experience,
    show_case_studies: passport.show_case_studies,
    show_references: passport.show_references,
    show_compliance: passport.show_compliance,
    show_evidence: passport.show_evidence,
    snapshots: updatedSnapshots,
  });

  return snapshot;
}
