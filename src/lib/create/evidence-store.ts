/**
 * AVORRIA CREATE — CONTRACTOR EVIDENCE & CAPABILITY PERSISTENCE LAYER
 * Hermetic storage in .data/create-store.json with organization-scoped isolation.
 */

import fs from 'fs';
import path from 'path';
import {
  ProjectExperience,
  ContractorCapability,
  CaseStudy,
  CommercialReference,
  CommercialProfile,
  CommercialReadinessAssessment,
  ReadinessBottleneck,
} from './evidence-types';
import { listCredentials, listDocuments, getOrganization } from '@/lib/workspace/db';

interface CreateStoreData {
  projects: Record<string, ProjectExperience>;
  capabilities: Record<string, ContractorCapability>;
  case_studies: Record<string, CaseStudy>;
  references: Record<string, CommercialReference>;
  profiles: Record<string, CommercialProfile>;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const STORE_PATH = path.join(DATA_DIR, 'create-store.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getInitialStore(): CreateStoreData {
  const DEMO_ORG = 'org_vance_electric_01';
  const now = new Date().toISOString();

  const projects: Record<string, ProjectExperience> = {
    prj_vance_01: {
      id: 'prj_vance_01',
      org_id: DEMO_ORG,
      name: 'Austin Regional Medical Center — 480V Substation & Switchgear Upgrade',
      client: 'Travis County Healthcare District',
      client_type: 'Healthcare',
      location_city: 'Austin',
      location_state: 'TX',
      sector: 'Healthcare',
      project_type: 'Renovation / Retrofit',
      contract_type: 'Guaranteed Maximum Price (GMP)',
      start_date: '2025-02',
      completion_date: '2025-11',
      contract_value: 1450000,
      status: 'completed',
      description:
        'Complete turn-key upgrade of 3,000A 480V double-ended main substation switchgear serving acute care wings A and B while hospital remained fully operational.',
      scope:
        'Furnish and install Square D Power-Style QED-2 switchboard lineup, automatic transfer switch coordination, primary 13.8kV to 480V dry-type transformer integration, and supervisory arc-flash relays.',
      services_delivered: [
        '480V Switchgear Installation',
        'Automatic Transfer Switch Integration',
        'Arc Flash Coordination Study',
        'Temporary Redundant Generator Paralleling',
      ],
      challenges:
        'Hospital acute care wing required zero unplanned outage during transfer. All transition work executed in two controlled 4-hour midnight maintenance windows.',
      delivery_methodology:
        'Dual-feed rolling cutover with paralleled on-site 1,500kW mobile diesel generator backup and dedicated electrical safety observer team.',
      outcomes:
        'Delivered 14 days ahead of scheduled inspection milestone. Zero lost-time incidents and zero hospital power interruptions during cutover.',
      evidence_document_ids: ['doc_vance_substation_signoff', 'doc_vance_arcflash_cert'],
      evidence_summary: 'Owner formal acceptance letter, AHJ electrical inspection sign-off, and certified arc flash study on file.',
      win_work_opportunity_count: 4,
      created_at: '2025-11-20T14:00:00Z',
      updated_at: '2025-11-20T14:00:00Z',
    },
    prj_vance_02: {
      id: 'prj_vance_02',
      org_id: DEMO_ORG,
      name: 'Texas Innovation Campus — High-Tech Distribution & Cleanroom Feeders',
      client: 'Barton Springs Tech Real Estate Partners',
      client_type: 'Commercial',
      location_city: 'Austin',
      location_state: 'TX',
      sector: 'Industrial & Logistics',
      project_type: 'New Construction',
      contract_type: 'Lump Sum',
      start_date: '2024-09',
      completion_date: '2025-05',
      contract_value: 820000,
      status: 'completed',
      description:
        'Turn-key power distribution, busway systems, and harmonic mitigation for 65,000 sq ft semiconductor testing and R&D facility.',
      scope:
        'Installation of 2,000A copper busway, high-density server room power distribution units (PDUs), isolated ground circuits, and active harmonic filtering.',
      services_delivered: [
        'Overhead Copper Busway Runs',
        'Cleanroom Power Drops',
        'Harmonic Filter Installation',
        'Megohmmeter & Thermal Imaging Testing',
      ],
      challenges:
        'Compressed construction schedule requiring tight coordination with cleanroom HVAC and nitrogen process piping trades in shared interstitial spaces.',
      delivery_methodology:
        'Prefabricated conduit rack assemblies offsite at Vance fabrication shop, reducing on-site installation labor by 35%.',
      outcomes:
        'Facility certified on initial inspection. Owner awarded Vance recurring preventative maintenance contract.',
      evidence_document_ids: ['doc_vance_cleanroom_test'],
      evidence_summary: 'Independent testing agency thermal scan report and commissioning certificates on file.',
      win_work_opportunity_count: 3,
      created_at: '2025-05-30T10:00:00Z',
      updated_at: '2025-05-30T10:00:00Z',
    },
    prj_vance_03: {
      id: 'prj_vance_03',
      org_id: DEMO_ORG,
      name: 'Travis County Administration Complex — Central Plant Electrification',
      client: 'Travis County Facilities Management',
      client_type: 'Municipal / Government',
      location_city: 'Austin',
      location_state: 'TX',
      sector: 'Municipal & Government',
      project_type: 'Renovation / Retrofit',
      contract_type: 'Lump Sum',
      start_date: '2024-03',
      completion_date: '2024-09',
      contract_value: 560000,
      status: 'completed',
      description:
        'Electrification of county central utility plant, replacing decommissioned steam chillers with high-efficiency 480V centrifugal chiller drives.',
      scope:
        'New 1,600A distribution panelboard, variable frequency drives (VFDs) for three 500-ton chillers, motor control centers, and emergency shunt trips.',
      services_delivered: [
        'VFD Installation & Programming',
        'Motor Control Center (MCC) Upgrades',
        'Life Safety Shunt Trip Testing',
        'SCADA Integration Wiring',
      ],
      outcomes:
        'Energy efficiency rebate qualification completed, securing $42,000 in Austin Energy utility incentives for client.',
      evidence_document_ids: ['doc_vance_county_acceptance'],
      evidence_summary: 'Travis County certificate of completion and verified payroll compliance records.',
      win_work_opportunity_count: 2,
      created_at: '2024-09-15T16:00:00Z',
      updated_at: '2024-09-15T16:00:00Z',
    },
    prj_vance_04: {
      id: 'prj_vance_04',
      org_id: DEMO_ORG,
      name: 'Capital Ridge Executive Plaza — Main Service Entrance & EV Infrastructure',
      client: 'Highland Park Asset Management LLC',
      client_type: 'Commercial',
      location_city: 'Austin',
      location_state: 'TX',
      sector: 'Commercial Office',
      project_type: 'Tenant Improvement',
      contract_type: 'Lump Sum',
      start_date: '2023-10',
      completion_date: '2024-02',
      contract_value: 380000,
      status: 'completed',
      description:
        'Service upgrade and parking garage electrification including 24 Level-2 commercial EV chargers and dynamic load management.',
      scope:
        'Step-down transformers, 400A dedicated subpanel, underground conduit directional boring, and networked payment station integration.',
      services_delivered: [
        'Commercial EV Charging Infrastructure',
        'Underground Directional Boring',
        'Load Shedding Control Panels',
      ],
      outcomes: 'Delivered on budget with zero disruption to office tenant operations.',
      evidence_document_ids: [],
      evidence_summary: 'Utility permit closed out with City of Austin Electric Utility.',
      win_work_opportunity_count: 1,
      created_at: '2024-02-28T12:00:00Z',
      updated_at: '2024-02-28T12:00:00Z',
    },
    prj_vance_05: {
      id: 'prj_vance_05',
      org_id: DEMO_ORG,
      name: "Dell Children's Outpatient Pavilion — Secondary Redundant Feeders",
      client: 'Healthcare Development Partners',
      client_type: 'Healthcare',
      location_city: 'Austin',
      location_state: 'TX',
      sector: 'Healthcare',
      project_type: 'New Construction',
      contract_type: 'Guaranteed Maximum Price (GMP)',
      start_date: '2026-03',
      contract_value: 920000,
      status: 'active',
      description:
        'Active construction of secondary emergency feeders and medical gas emergency circuit monitoring in new 4-story clinical pavilion.',
      scope:
        'Isolated power panels for surgical suites, critical branch emergency lighting, and uninterruptible power supply (UPS) bypass switchgear.',
      services_delivered: [
        'Isolated Power System Installation',
        'Essential Electrical System Wiring (NFPA 99)',
        'UPS System Integration',
      ],
      evidence_document_ids: [],
      win_work_opportunity_count: 3,
      created_at: '2026-03-01T09:00:00Z',
      updated_at: '2026-03-01T09:00:00Z',
    },
  };

  const capabilities: Record<string, ContractorCapability> = {
    cap_vance_01: {
      id: 'cap_vance_01',
      org_id: DEMO_ORG,
      name: 'Commercial Switchgear & Main Distribution',
      trade: 'Electrical Contracting',
      trade_slug: 'electrical-contracting',
      category: 'Core Distribution',
      specialism: '480V/277V Switchgear, Transformers & Switchboards',
      description:
        'Full-lifecycle procurement, rigging, installation, testing, and commissioning of commercial service entrance switchgear up to 5,000A, dry-type and oil-filled substation transformers, and primary distribution board lineups.',
      sectors: ['Commercial Office', 'Healthcare', 'Industrial & Logistics', 'Municipal & Government'],
      jurisdictions: ['Texas (Statewide)', 'City of Austin', 'Travis County', 'Williamson County'],
      years_experience: 14,
      verification_status: 'platform_verified',
      verification_provenance: 'Verified via TDLR TECL #34891 & 4 Project Records',
      evidence_document_ids: ['doc_vance_substation_signoff'],
      related_project_ids: ['prj_vance_01', 'prj_vance_02', 'prj_vance_03'],
      win_work_match_count: 6,
      created_at: '2025-01-10T10:00:00Z',
      updated_at: '2025-01-10T10:00:00Z',
    },
    cap_vance_02: {
      id: 'cap_vance_02',
      org_id: DEMO_ORG,
      name: 'Healthcare Critical Power & Life Safety Branches',
      trade: 'Electrical Contracting',
      trade_slug: 'electrical-contracting',
      category: 'Life Safety',
      specialism: 'NFPA 99 Essential Electrical Systems & Emergency Paralleling',
      description:
        'Specialized installation of isolated power systems for operating rooms, dual automatic transfer switches (ATS), critical branch circuits, and life safety illumination compliant with NFPA 99, NFPA 110, and NEC Article 517.',
      sectors: ['Healthcare', 'Critical Power / Data Center'],
      jurisdictions: ['Texas (Statewide)'],
      years_experience: 11,
      verification_status: 'platform_verified',
      verification_provenance: 'Verified via Austin Regional Medical Center Project Acceptance',
      evidence_document_ids: ['doc_vance_substation_signoff'],
      related_project_ids: ['prj_vance_01', 'prj_vance_05'],
      win_work_match_count: 5,
      created_at: '2025-01-10T10:00:00Z',
      updated_at: '2025-01-10T10:00:00Z',
    },
    cap_vance_03: {
      id: 'cap_vance_03',
      org_id: DEMO_ORG,
      name: 'Industrial Motor Control & Variable Frequency Drives',
      trade: 'Electrical Contracting',
      trade_slug: 'electrical-contracting',
      category: 'Critical Power',
      specialism: 'Motor Control Centers (MCC), VFDs & SCADA Interlocks',
      description:
        'Turn-key electrification of commercial and municipal mechanical systems, including chillers, cooling towers, industrial air handlers, and pump stations with harmonic attenuation and building automation interface wiring.',
      sectors: ['Industrial & Logistics', 'Municipal & Government', 'Commercial Office'],
      jurisdictions: ['Texas (Statewide)'],
      years_experience: 12,
      verification_status: 'document_supported',
      verification_provenance: 'Supported by Travis County Central Plant Acceptance Certificate',
      evidence_document_ids: ['doc_vance_county_acceptance'],
      related_project_ids: ['prj_vance_03', 'prj_vance_02'],
      win_work_match_count: 4,
      created_at: '2025-01-10T10:00:00Z',
      updated_at: '2025-01-10T10:00:00Z',
    },
    cap_vance_04: {
      id: 'cap_vance_04',
      org_id: DEMO_ORG,
      name: 'Arc Flash Mitigation & Coordination Studies',
      trade: 'Electrical Contracting',
      trade_slug: 'electrical-contracting',
      category: 'Safety & Control',
      specialism: 'NFPA 70E Incident Energy Analysis & Relay Coordination',
      description:
        'Engineering study implementation, selective breaker coordination, arc flash warning label application, zone-selective interlocking (ZSI), and optical arc-flash sensing relays for facility compliance.',
      sectors: ['Healthcare', 'Industrial & Logistics', 'Commercial Office'],
      jurisdictions: ['Texas (Statewide)'],
      years_experience: 9,
      verification_status: 'platform_verified',
      verification_provenance: 'Verified via Certified Engineering Report & Document Record',
      evidence_document_ids: ['doc_vance_arcflash_cert'],
      related_project_ids: ['prj_vance_01'],
      win_work_match_count: 3,
      created_at: '2025-01-10T10:00:00Z',
      updated_at: '2025-01-10T10:00:00Z',
    },
    cap_vance_05: {
      id: 'cap_vance_05',
      org_id: DEMO_ORG,
      name: 'Commercial EV Fleet Infrastructure & Microgrids',
      trade: 'Electrical Contracting',
      trade_slug: 'electrical-contracting',
      category: 'Energy Management',
      specialism: 'Level 2 & DC Fast Charging Array Power Balancing',
      description:
        'Underground civil trenching, service capacity calculation, transformer sizing, and multi-port commercial EV charger installation with intelligent peak load management systems.',
      sectors: ['Commercial Office', 'Municipal & Government', 'Retail & Hospitality'],
      jurisdictions: ['Texas (Statewide)'],
      years_experience: 5,
      verification_status: 'contractor_supplied',
      verification_provenance: 'Supplied by Contractor · Project Record Active',
      evidence_document_ids: [],
      related_project_ids: ['prj_vance_04'],
      win_work_match_count: 2,
      created_at: '2025-01-10T10:00:00Z',
      updated_at: '2025-01-10T10:00:00Z',
    },
  };

  const case_studies: Record<string, CaseStudy> = {
    cs_vance_01: {
      id: 'cs_vance_01',
      org_id: DEMO_ORG,
      project_id: 'prj_vance_01',
      title: 'Live Healthcare Main Switchgear Replacement With Zero Secondary Outages',
      client: 'Travis County Healthcare District',
      sector: 'Healthcare',
      location: 'Austin, Texas',
      contract_value: 1450000,
      completion_date: 'November 2025',
      challenge:
        'A major 320-bed regional hospital required total replacement of obsolete 40-year-old 480V service entrance switchgear without interrupting power to operating suites, ICU monitors, or emergency department ventilators.',
      scope:
        'Engineering coordination, temporary paralleled 1,500kW mobile generator tie-in, removal of asbestos-insulated legacy switchboard, and installation of Square D 3,000A QED-2 switchboard with arc-flash optical reduction switches.',
      delivery:
        'Vance planned the cutover over a 16-week pre-construction phase. Execution was conducted across two 4-hour midnight intervals using dual-crews, redundant transfer equipment, and real-time digital power quality monitoring.',
      outcome:
        'All patient-critical loads maintained continuous uninterrupted power. Delivered two weeks ahead of schedule and zero safety incidents.',
      key_metrics: [
        { label: 'Unplanned Outages', value: 'Zero (100% Continuity)' },
        { label: 'Schedule Performance', value: '14 Days Early' },
        { label: 'Safety Record', value: 'Zero Recordables' },
      ],
      capabilities_exercised: [
        'Commercial Switchgear & Main Distribution',
        'Healthcare Critical Power & Life Safety Branches',
        'Arc Flash Mitigation & Coordination Studies',
      ],
      evidence_document_ids: ['doc_vance_substation_signoff', 'doc_vance_arcflash_cert'],
      created_at: '2025-12-01T12:00:00Z',
      updated_at: '2025-12-01T12:00:00Z',
    },
    cs_vance_02: {
      id: 'cs_vance_02',
      org_id: DEMO_ORG,
      project_id: 'prj_vance_02',
      title: 'Accelerated Cleanroom Power Infrastructure for Semiconductor R&D',
      client: 'Barton Springs Tech Real Estate Partners',
      sector: 'Industrial & Logistics',
      location: 'Austin, Texas',
      contract_value: 820000,
      completion_date: 'May 2025',
      challenge:
        'Client faced stringent tenant lease commencement penalties requiring a 65,000 sq ft testing facility to be electrified in 90 calendar days amidst long lead-time equipment backorders.',
      scope:
        '2,000A overhead copper busway grid, cleanroom power distribution units (PDUs), harmonic attenuation filters, and high-frequency grounding loop.',
      delivery:
        'Vance pre-fabricated conduit racks and busway hangers offsite at its Austin shop, running two overlapping shifts to install 12,000 linear feet of feeder cable.',
      outcome:
        'Achieved full electrical energization on day 78—12 days ahead of client handover deadline—avoiding $250,000 in liquidated damages for the developer.',
      key_metrics: [
        { label: 'Time Saved', value: '12 Days Ahead of Schedule' },
        { label: 'Off-site Prefab Rate', value: '35% Labor Reduction' },
        { label: 'Testing Pass Rate', value: '100% on First Megger Pass' },
      ],
      capabilities_exercised: [
        'Commercial Switchgear & Main Distribution',
        'Industrial Motor Control & Variable Frequency Drives',
      ],
      evidence_document_ids: ['doc_vance_cleanroom_test'],
      created_at: '2025-06-15T15:00:00Z',
      updated_at: '2025-06-15T15:00:00Z',
    },
  };

  const references: Record<string, CommercialReference> = {
    ref_vance_01: {
      id: 'ref_vance_01',
      org_id: DEMO_ORG,
      client_organization: 'Travis County Healthcare District',
      contact_name: 'Robert Henderson, PE',
      contact_title: 'Director of Facilities & Engineering',
      contact_email: 'r.henderson@traviscountyhealth.org',
      contact_phone: '(512) 555-8902',
      project_id: 'prj_vance_01',
      project_name: 'Austin Regional Medical Center — 480V Substation Upgrade',
      reference_type: 'client',
      date_provided: '2025-11-28',
      status: 'verified',
      testimonial:
        'Vance Commercial Electric is the most disciplined electrical contractor we have partnered with in 20 years of hospital operations. Their switchgear changeover plan was executed with military precision. They never once dropped critical hospital load and maintained immaculate site hygiene.',
      rating: 5,
      is_private: true,
      supporting_document_id: 'doc_vance_substation_signoff',
      created_at: '2025-11-28T10:00:00Z',
      updated_at: '2025-11-28T10:00:00Z',
    },
    ref_vance_02: {
      id: 'ref_vance_02',
      org_id: DEMO_ORG,
      client_organization: 'Austin Commercial Prime Builders',
      contact_name: 'Sarah Lin',
      contact_title: 'Senior Project Executive',
      contact_email: 'slin@austincommercialprime.com',
      contact_phone: '(512) 555-3411',
      project_id: 'prj_vance_02',
      project_name: 'Texas Innovation Campus — Cleanroom Feeders',
      reference_type: 'general_contractor',
      date_provided: '2025-06-04',
      status: 'verified',
      testimonial:
        'Marcus Vance and his field leads saved this project schedule. Their off-site prefabrication approach and QA/QC documentation allowed us to pass city inspections on the first attempt without a single punch list correction.',
      rating: 5,
      is_private: true,
      supporting_document_id: 'doc_vance_cleanroom_test',
      created_at: '2025-06-04T14:00:00Z',
      updated_at: '2025-06-04T14:00:00Z',
    },
    ref_vance_03: {
      id: 'ref_vance_03',
      org_id: DEMO_ORG,
      client_organization: 'Highland Park Asset Management LLC',
      contact_name: 'Marcus Sterling',
      contact_title: 'Chief Operating Officer',
      contact_email: 'm.sterling@highlandparkassets.com',
      project_id: 'prj_vance_04',
      project_name: 'Capital Ridge Executive Plaza — Service Upgrade',
      reference_type: 'client',
      date_provided: '2024-03-12',
      status: 'on_file',
      testimonial:
        'Fair pricing, completely transparent change orders, and impeccable crew conduct around our class-A office tenants. We have put them on our preferred master vendor list for all central Texas properties.',
      rating: 5,
      is_private: true,
      created_at: '2024-03-12T09:00:00Z',
      updated_at: '2024-03-12T09:00:00Z',
    },
  };

  const profiles: Record<string, CommercialProfile> = {
    [DEMO_ORG]: {
      id: `prof_${DEMO_ORG}`,
      org_id: DEMO_ORG,
      company_overview:
        'Vance Commercial Electric LLC is an Austin-headquartered, specialized electrical contracting enterprise delivering high-reliability power distribution, healthcare essential systems, industrial motor control, and critical commercial infrastructure across Central and South Texas. Founded in 2022 by Master Electrician Marcus Vance, the firm operates with strict institutional engineering standards, certified prefabrication capabilities, and a flawless zero-recordable safety culture.',
      core_services: [
        'Commercial Main Service Entrance & 480V Switchgear Lineups',
        'Healthcare NFPA 99 Essential Electrical Systems & ATS Controls',
        'Industrial Motor Control Centers (MCC) & Variable Frequency Drives',
        'Arc Flash Incident Energy Analysis & Selective Coordination Studies',
        'Commercial EV Fleet Charging Hubs & Automated Load Balancing',
      ],
      sectors_served: [
        'Healthcare & Hospital Facilities',
        'Industrial, Manufacturing & Semiconductor Logistics',
        'Municipal, County & State Government Complexes',
        'Class-A Commercial Office & Mixed-Use Campuses',
      ],
      typical_project_size_min: 150000,
      typical_project_size_max: 3500000,
      typical_project_size_sweet_spot: '$500k – $1.8M',
      geographic_coverage_states: ['TX'],
      geographic_coverage_metros: ['Austin-Round Rock-San Marcos', 'San Antonio Metro', 'Dallas-Fort Worth', 'Houston Metro'],
      differentiators: [
        'In-house shop prefabrication reduces on-site labor density by up to 35%',
        '100% Licensed Journeyman and Master Electrician site lead ratio',
        'Proven hospital critical power live cutover track record with zero unplanned outage history',
        'Direct owner oversight on all projects above $250k',
        'EMR 0.78 with zero lost-time recordables across 85,000+ field man-hours',
      ],
      delivery_approach:
        'Pre-construction coordination utilizing 3D BIM clash detection, off-site modular assembly, dedicated project superintendent oversight, daily Job Safety Analysis (JSA) crew briefings, and rigorous factory-acceptance testing (FAT) prior to field energization.',
      safety_commitments:
        'Zero-tolerance electrical safety policy aligned with OSHA 1926 Subpart K and NFPA 70E. Mandatory arc-rated PPE, daily lockout/tagout (LOTO) verification logs, and monthly independent safety director site audits.',
      accreditations_memberships: [
        'Texas Department of Licensing & Regulation (TDLR) Electrical Contractor TECL #34891',
        'Independent Electrical Contractors (IEC) Texas Chapter Member',
        'NFPA Member #00849201',
        'OSHA 30-Hour Certified Supervisory Staff',
      ],
      bonding_capacity_single: 3000000,
      bonding_capacity_aggregate: 8000000,
      emr_rating: 0.78,
      created_at: now,
      updated_at: now,
    },
  };

  return { projects, capabilities, case_studies, references, profiles };
}

export function loadCreateStore(): CreateStoreData {
  ensureDataDir();
  if (!fs.existsSync(STORE_PATH)) {
    const initial = getInitialStore();
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    return JSON.parse(raw) as CreateStoreData;
  } catch {
    const fallback = getInitialStore();
    return fallback;
  }
}

export function saveCreateStore(data: CreateStoreData): void {
  ensureDataDir();
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// ─────────────────────────────────────────────────────────────
// PROJECTS CRUD
// ─────────────────────────────────────────────────────────────

export async function listProjects(orgId: string): Promise<ProjectExperience[]> {
  const store = loadCreateStore();
  return Object.values(store.projects)
    .filter((p) => p.org_id === orgId)
    .sort((a, b) => (b.start_date || '').localeCompare(a.start_date || ''));
}

export async function getProject(orgId: string, id: string): Promise<ProjectExperience | null> {
  const store = loadCreateStore();
  const prj = store.projects[id];
  if (!prj || prj.org_id !== orgId) return null;
  return prj;
}

export async function saveProject(project: ProjectExperience): Promise<ProjectExperience> {
  const store = loadCreateStore();
  store.projects[project.id] = {
    ...project,
    updated_at: new Date().toISOString(),
  };
  saveCreateStore(store);
  return store.projects[project.id];
}

export async function deleteProject(orgId: string, id: string): Promise<boolean> {
  const store = loadCreateStore();
  const prj = store.projects[id];
  if (!prj || prj.org_id !== orgId) return false;
  delete store.projects[id];
  saveCreateStore(store);
  return true;
}

// ─────────────────────────────────────────────────────────────
// CAPABILITIES CRUD
// ─────────────────────────────────────────────────────────────

export async function listCapabilities(orgId: string): Promise<ContractorCapability[]> {
  const store = loadCreateStore();
  return Object.values(store.capabilities)
    .filter((c) => c.org_id === orgId)
    .sort((a, b) => b.years_experience - a.years_experience);
}

export async function getCapability(orgId: string, id: string): Promise<ContractorCapability | null> {
  const store = loadCreateStore();
  const cap = store.capabilities[id];
  if (!cap || cap.org_id !== orgId) return null;
  return cap;
}

export async function saveCapability(cap: ContractorCapability): Promise<ContractorCapability> {
  const store = loadCreateStore();
  store.capabilities[cap.id] = {
    ...cap,
    updated_at: new Date().toISOString(),
  };
  saveCreateStore(store);
  return store.capabilities[cap.id];
}

export async function deleteCapability(orgId: string, id: string): Promise<boolean> {
  const store = loadCreateStore();
  const cap = store.capabilities[id];
  if (!cap || cap.org_id !== orgId) return false;
  delete store.capabilities[id];
  saveCreateStore(store);
  return true;
}

// ─────────────────────────────────────────────────────────────
// CASE STUDIES CRUD
// ─────────────────────────────────────────────────────────────

export async function listCaseStudies(orgId: string): Promise<CaseStudy[]> {
  const store = loadCreateStore();
  return Object.values(store.case_studies)
    .filter((cs) => cs.org_id === orgId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getCaseStudy(orgId: string, id: string): Promise<CaseStudy | null> {
  const store = loadCreateStore();
  const cs = store.case_studies[id];
  if (!cs || cs.org_id !== orgId) return null;
  return cs;
}

export async function saveCaseStudy(cs: CaseStudy): Promise<CaseStudy> {
  const store = loadCreateStore();
  store.case_studies[cs.id] = {
    ...cs,
    updated_at: new Date().toISOString(),
  };
  saveCreateStore(store);
  return store.case_studies[cs.id];
}

export async function deleteCaseStudy(orgId: string, id: string): Promise<boolean> {
  const store = loadCreateStore();
  const cs = store.case_studies[id];
  if (!cs || cs.org_id !== orgId) return false;
  delete store.case_studies[id];
  saveCreateStore(store);
  return true;
}

// ─────────────────────────────────────────────────────────────
// REFERENCES CRUD
// ─────────────────────────────────────────────────────────────

export async function listReferences(orgId: string): Promise<CommercialReference[]> {
  const store = loadCreateStore();
  return Object.values(store.references)
    .filter((r) => r.org_id === orgId)
    .sort((a, b) => b.date_provided.localeCompare(a.date_provided));
}

export async function getReference(orgId: string, id: string): Promise<CommercialReference | null> {
  const store = loadCreateStore();
  const ref = store.references[id];
  if (!ref || ref.org_id !== orgId) return null;
  return ref;
}

export async function saveReference(ref: CommercialReference): Promise<CommercialReference> {
  const store = loadCreateStore();
  store.references[ref.id] = {
    ...ref,
    updated_at: new Date().toISOString(),
  };
  saveCreateStore(store);
  return store.references[ref.id];
}

export async function deleteReference(orgId: string, id: string): Promise<boolean> {
  const store = loadCreateStore();
  const ref = store.references[id];
  if (!ref || ref.org_id !== orgId) return false;
  delete store.references[id];
  saveCreateStore(store);
  return true;
}

// ─────────────────────────────────────────────────────────────
// COMMERCIAL PROFILE CRUD
// ─────────────────────────────────────────────────────────────

export async function getCommercialProfile(orgId: string): Promise<CommercialProfile | null> {
  const store = loadCreateStore();
  return store.profiles[orgId] || null;
}

export async function saveCommercialProfile(profile: CommercialProfile): Promise<CommercialProfile> {
  const store = loadCreateStore();
  store.profiles[profile.org_id] = {
    ...profile,
    updated_at: new Date().toISOString(),
  };
  saveCreateStore(store);
  return store.profiles[profile.org_id];
}

// ─────────────────────────────────────────────────────────────
// COMMERCIAL READINESS & BOTTLENECK ENGINE
// ─────────────────────────────────────────────────────────────

export async function calculateCommercialReadiness(orgId: string): Promise<CommercialReadinessAssessment> {
  const [org, projects, capabilities, caseStudies, refs, profile, credentials] = await Promise.all([
    getOrganization(orgId),
    listProjects(orgId),
    listCapabilities(orgId),
    listCaseStudies(orgId),
    listReferences(orgId),
    getCommercialProfile(orgId),
    listCredentials(orgId),
  ]);

  const bottlenecks: ReadinessBottleneck[] = [];

  // 1. Business Info Score (max 15)
  let businessInfoScore = 0;
  if (org) {
    if (org.name) businessInfoScore += 5;
    if (org.primary_trade) businessInfoScore += 5;
    if (org.hq_address?.city && org.states_licensed?.length > 0) businessInfoScore += 5;
  }
  if (businessInfoScore < 15) {
    bottlenecks.push({
      id: 'btn_business_info',
      priority: 'HIGH',
      title: 'Complete Corporate Registration Profile',
      description: 'Fill in complete headquarters address, legal entity structure, and state licensing territory.',
      action_label: 'EDIT BUSINESS INFO',
      action_href: '/workspace/settings',
    });
  }

  // 2. Capabilities Score (max 20)
  let capabilitiesScore = 0;
  if (capabilities.length >= 3) {
    capabilitiesScore = 20;
  } else if (capabilities.length > 0) {
    capabilitiesScore = Math.round((capabilities.length / 3) * 20);
    bottlenecks.push({
      id: 'btn_capabilities_count',
      priority: 'MEDIUM',
      title: `Define ${3 - capabilities.length} More Specialized Capabilities`,
      description: 'Document your key electrical specialisms to maximize Win Work match potential.',
      action_label: 'ADD CAPABILITIES',
      action_href: '/workspace/create#capabilities',
    });
  } else {
    bottlenecks.push({
      id: 'btn_no_capabilities',
      priority: 'HIGH',
      title: 'Define Core Technical Capabilities',
      description: 'Document at least 3 trade capabilities with delivery scopes and sector specialisms.',
      action_label: 'ADD CAPABILITIES',
      action_href: '/workspace/create#capabilities',
    });
  }

  // 3. Projects Score (max 25)
  let projectsScore = 0;
  const completedProjects = projects.filter((p) => p.status === 'completed');
  if (completedProjects.length >= 4) {
    projectsScore = 25;
  } else if (completedProjects.length > 0) {
    projectsScore = Math.round((completedProjects.length / 4) * 25);
    bottlenecks.push({
      id: 'btn_projects_count',
      priority: 'MEDIUM',
      title: `Record ${4 - completedProjects.length} More Completed Commercial Projects`,
      description: 'Add recent project history with contract values and scopes to prove delivery capacity.',
      action_label: 'ADD PROJECT',
      action_href: '/workspace/create/projects/new',
    });
  } else {
    bottlenecks.push({
      id: 'btn_no_projects',
      priority: 'HIGH',
      title: 'Record Completed Project Experience',
      description: 'Avorria requires verified project experience to validate commercial bid eligibility.',
      action_label: 'ADD FIRST PROJECT',
      action_href: '/workspace/create/projects/new',
    });
  }

  // 4. Credentials Score (max 20)
  let credentialsScore = 0;
  const activeLicense = credentials.some((c) => c.type === 'trade_license' && c.status !== 'expired');
  const activeGL = credentials.some((c) => c.type === 'general_liability_coi' && c.status !== 'expired');
  const activeWC = credentials.some((c) => c.type === 'workers_comp' && c.status !== 'expired');

  if (activeLicense) credentialsScore += 8;
  if (activeGL) credentialsScore += 7;
  if (activeWC) credentialsScore += 5;

  if (!activeGL || !activeWC) {
    bottlenecks.push({
      id: 'btn_insurance_evidence',
      priority: 'HIGH',
      title: 'Upload Active COI (GL & Workers Comp)',
      description: 'Commercial procurement requires active General Liability and Statutory Workers Compensation.',
      action_label: 'UPLOAD COI',
      action_href: '/workspace/comply',
    });
  }

  // 5. References & Case Studies (max 10)
  let referencesScore = 0;
  if (refs.length > 0) referencesScore += 5;
  if (caseStudies.length > 0) referencesScore += 5;

  if (refs.length === 0) {
    bottlenecks.push({
      id: 'btn_no_references',
      priority: 'LOW',
      title: 'Add Client or General Contractor Reference',
      description: 'Add procurement reference contacts to support commercial qualification.',
      action_label: 'ADD REFERENCE',
      action_href: '/workspace/create/references',
    });
  }
  if (caseStudies.length === 0) {
    bottlenecks.push({
      id: 'btn_no_case_studies',
      priority: 'LOW',
      title: 'Generate Project Case Study',
      description: 'Convert a completed project into an editorial case study for proposal packages.',
      action_label: 'CREATE CASE STUDY',
      action_href: '/workspace/create/case-studies',
    });
  }

  // 6. Commercial Profile Content (max 10)
  let commercialContentScore = 0;
  if (profile) {
    if (profile.company_overview && profile.company_overview.length > 50) commercialContentScore += 4;
    if (profile.differentiators && profile.differentiators.length > 0) commercialContentScore += 3;
    if (profile.delivery_approach && profile.delivery_approach.length > 50) commercialContentScore += 3;
  }
  if (commercialContentScore < 10) {
    bottlenecks.push({
      id: 'btn_commercial_profile',
      priority: 'MEDIUM',
      title: 'Complete Commercial Narrative & Differentiators',
      description: 'Define your company overview and delivery methodology for automated response generation.',
      action_label: 'EDIT PROFILE',
      action_href: '/workspace/create/commercial-profile',
    });
  }

  const rawTotal =
    businessInfoScore +
    capabilitiesScore +
    projectsScore +
    credentialsScore +
    referencesScore +
    commercialContentScore;

  const score = Math.min(100, Math.max(0, rawTotal));
  const status_label = `${score}% READY`;

  // Sort bottlenecks: HIGH -> MEDIUM -> LOW
  const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  bottlenecks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return {
    overall_score: score,
    status_label,
    breakdown: {
      business_info_score: businessInfoScore,
      capabilities_score: capabilitiesScore,
      projects_score: projectsScore,
      credentials_score: credentialsScore,
      references_score: referencesScore,
      commercial_content_score: commercialContentScore,
    },
    bottlenecks: bottlenecks.slice(0, 4), // Top 4 priority bottlenecks
  };
}
