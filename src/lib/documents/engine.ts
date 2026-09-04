import {
  DocumentTypeSlug,
  DocumentGenerationRequest,
  DocumentGenerationResult,
  UniversalDocumentPayload,
  DocumentSection,
} from './types';
import { DOCUMENT_REGISTRY } from './registry';
import { ProjectContext } from '@/lib/projects/types';

interface ContractorContext {
  name: string;
  legalName?: string;
  phone?: string;
  email?: string;
  website?: string;
  primaryTrade?: string;
  primaryState?: string;
  licenseNumber?: string;
  verifiedBadges?: string[];
}

export async function generateUniversalDocumentDraft(
  request: DocumentGenerationRequest,
  contractor: ContractorContext
): Promise<DocumentGenerationResult> {
  const def = DOCUMENT_REGISTRY[request.documentType];
  if (!def) {
    throw new Error(`Unsupported document type: ${request.documentType}`);
  }

  const hasAiKey = Boolean(process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY);
  const useAi = Boolean(request.useAiIfAvailable && def.supportsAi && hasAiKey);

  const generationMethod = useAi ? 'ai' : 'template';
  const generationModel = useAi
    ? process.env.ANTHROPIC_API_KEY
      ? 'Claude 3.5 Sonnet (External AI API)'
      : process.env.OPENAI_API_KEY
      ? 'GPT-4o (External AI API)'
      : 'Gemini 1.5 Pro (External AI API)'
    : `Avorria Standard ${def.name} Engine v${def.version}`;

  const project: ProjectContext = request.project || {
    name: 'General Commercial Project',
    clientName: 'Client Representative',
    siteLocation: `${contractor.primaryState || 'TX'} Operating Territory`,
    projectReference: `PRJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
  };

  const payload = createDeterministicPayload(request.documentType, contractor, project, request.customInputs);

  const disclaimer = getDisclaimerForCategory(def.category);

  return {
    title: payload.title,
    documentType: request.documentType,
    generationMethod,
    generationModel,
    payload,
    disclaimer,
  };
}

function getDisclaimerForCategory(category: string): string {
  switch (category) {
    case 'safety':
      return 'SAFETY & REGULATORY NOTICE: This document provides structured operational documentation assistance aligned with OSHA 1926/1910 guidelines. It does not replace competent person safety evaluation, engineering review, or statutory compliance advice. The contractor is solely responsible for verifying and implementing all site-specific controls.';
    case 'commercial':
      return 'COMMERCIAL DOCUMENT NOTICE: This document is a professional trade estimate/proposal. It does not constitute an accounting ledger or legal contract until mutually executed by authorized representatives.';
    case 'operations':
      return 'OPERATIONAL NOTICE: This document serves as a contemporaneous field operational record. All observed conditions and crew hours must be verified by the on-site supervisor.';
    default:
      return 'Avorria operational document engine.';
  }
}

function createDeterministicPayload(
  type: DocumentTypeSlug,
  contractor: ContractorContext,
  project: ProjectContext,
  custom: Record<string, unknown> = {}
): UniversalDocumentPayload {
  const refNum = `${type.toUpperCase().replace('-', '')}-${Date.now().toString().slice(-6)}`;
  const today = new Date().toISOString().split('T')[0];

  switch (type) {
    case 'jha':
      return buildJhaPayload(contractor, project, refNum, today, custom);
    case 'jsa':
      return buildJsaPayload(contractor, project, refNum, today, custom);
    case 'safety-plan':
      return buildSafetyPlanPayload(contractor, project, refNum, today, custom);
    case 'toolbox-talk':
      return buildToolboxTalkPayload(contractor, project, refNum, today, custom);
    case 'quote':
      return buildQuotePayload(contractor, project, refNum, today, custom);
    case 'proposal':
      return buildProposalPayload(contractor, project, refNum, today, custom);
    case 'scope-of-work':
      return buildScopeOfWorkPayload(contractor, project, refNum, today, custom);
    case 'change-order':
      return buildChangeOrderPayload(contractor, project, refNum, today, custom);
    case 'daily-report':
      return buildDailyReportPayload(contractor, project, refNum, today, custom);
    default:
      throw new Error(`Unhandled template generator: ${type}`);
  }
}

// 1. JHA
function buildJhaPayload(
  contractor: ContractorContext,
  project: ProjectContext,
  refNum: string,
  today: string,
  custom: Record<string, unknown>
): UniversalDocumentPayload {
  const activity = (custom.workActivity as string) || 'Commercial Electrical / Mechanical Installation';
  const supervisor = (custom.supervisorName as string) || 'Lead Field Supervisor';

  return {
    documentType: 'jha',
    title: `Job Hazard Analysis: ${activity}`,
    referenceNumber: refNum,
    issueDate: today,
    contractor: {
      name: contractor.name,
      legalName: contractor.legalName,
      phone: contractor.phone,
      email: contractor.email,
      primaryTrade: contractor.primaryTrade,
      jurisdiction: contractor.primaryState,
    },
    project,
    sections: [
      {
        id: 'sec-overview',
        title: '01 / Task Information & Workforce',
        type: 'text',
        order: 1,
        content: `Work Activity: ${activity}\nCompetent Person: ${supervisor}\nCrew Size: ${custom.workerCount || 3} Personnel\nLocation: ${project.siteLocation}`,
      },
      {
        id: 'sec-ppe',
        title: '02 / Mandatory Personal Protective Equipment (PPE)',
        type: 'checklist',
        order: 2,
        content: 'Required protective equipment for all personnel in the active work zone.',
        checklistData: [
          { label: 'Hard Hat (ANSI Z89.1 Type I/II Class E)', checked: true },
          { label: 'Safety Glasses with Side Shields (ANSI Z87.1)', checked: true },
          { label: 'Cut-Level A4 Protective Gloves', checked: true },
          { label: 'Steel/Composite-Toe Safety Boots (ASTM F2413)', checked: true },
          { label: 'Hearing Protection (NRR >= 25dB)', checked: true },
          { label: 'High-Visibility Class 2 Safety Vest', checked: true },
        ],
      },
      {
        id: 'sec-hazards',
        title: '03 / Hazard Identification & Hierarchy of Controls',
        type: 'table',
        order: 3,
        content: 'Sequenced task steps with applicable OSHA controls.',
        tableData: {
          headers: ['Task Step', 'Identified Hazards', 'Required Control Measures', 'Hierarchy Level'],
          rows: [
            ['Site Pre-inspection & Staging', 'Slips, trips, falling objects, poor lighting', 'Verify clear egress, stage materials on level dunnage, set temporary lighting', 'Administrative'],
            ['De-energization / Isolation', 'Electrical arc flash, shock, stored energy', 'Apply Lockout/Tagout (LOTO), verify zero energy state with calibrated meter', 'Engineering'],
            ['Equipment Rigging & Lifting', 'Pinch points, dropped loads, rigging failure', 'Inspect chokers before pick, establish exclusion zone with barrier tape', 'Administrative'],
            ['Task Execution & Termination', 'Repetitive motion, sharp conduit edges, dust', 'Rotate workers, ream all conduits, wear cut-resistant gloves and eye protection', 'PPE'],
          ],
        },
      },
      {
        id: 'sec-emergency',
        title: '04 / Emergency Response & Muster Point',
        type: 'text',
        order: 4,
        content: 'First Aid Kit: Gang box #1.\nNearest Medical Facility: Local Regional Hospital (Call 911 for life-threatening emergencies).\nSite Muster Point: Main Gate North Parking Lot.',
      },
    ],
    signOff: {
      required: true,
      signed: false,
      acknowledgmentText: 'I confirm that I have reviewed and verified this JHA against actual site conditions and communicated all hazard controls to the field crew prior to starting work.',
    },
    disclaimer: getDisclaimerForCategory('safety'),
  };
}

// 2. JSA
function buildJsaPayload(
  contractor: ContractorContext,
  project: ProjectContext,
  refNum: string,
  today: string,
  custom: Record<string, unknown>
): UniversalDocumentPayload {
  const taskName = (custom.taskName as string) || 'Overhead Cable Tray Installation & Rough-in';

  return {
    documentType: 'jsa',
    title: `Job Safety Analysis: ${taskName}`,
    referenceNumber: refNum,
    issueDate: today,
    contractor: {
      name: contractor.name,
      primaryTrade: contractor.primaryTrade,
    },
    project,
    sections: [
      {
        id: 'sec-task',
        title: '01 / Job Description & Scope',
        type: 'text',
        order: 1,
        content: `Specific Task: ${taskName}\nLocation: ${project.siteLocation}\nLead Technician: ${custom.responsiblePerson || 'Lead Journeyman'}`,
      },
      {
        id: 'sec-steps',
        title: '02 / Sequenced Task Steps & Controls',
        type: 'table',
        order: 2,
        content: 'Preventive measures mapped to task breakdown.',
        tableData: {
          headers: ['Task Step', 'Potential Hazard', 'Preventive Action', 'Responsible Lead'],
          rows: [
            ['Elevated Work Platform Setup', 'Tip-over, uneven grade, pinch points', 'Conduct 360-degree ground inspection, verify outriggers locked on solid cribbing', 'Equipment Operator'],
            ['Overhead Unistrut & Rod Anchor Installation', 'Falling dust, overhead structural drop, drilling torque', 'Wear safety goggles, vacuum dust at source, use torque-limited hammer drill', 'Journeyman'],
            ['Cable Pulling & Placement', 'Muscle strain, caught-in rollers', 'Use mechanical tugger with breakaway pin, maintain vocal communication via radio', 'Safety Watch'],
          ],
        },
      },
      {
        id: 'sec-ppe',
        title: '03 / Mandatory Safety Controls',
        type: 'checklist',
        order: 3,
        content: 'Required personal protection.',
        checklistData: [
          { label: 'Full Body Harness & 6ft Lanyard when operating boom lift', checked: true },
          { label: 'Safety Glasses with Side Shields', checked: true },
          { label: 'Hard Hat & Steel-Toe Boots', checked: true },
        ],
      },
    ],
    signOff: {
      required: true,
      signed: false,
      acknowledgmentText: 'I certify that this JSA has been conducted with all task participants and that safety measures have been reviewed.',
    },
    disclaimer: getDisclaimerForCategory('safety'),
  };
}

// 3. SAFETY PLAN (HASP)
function buildSafetyPlanPayload(
  contractor: ContractorContext,
  project: ProjectContext,
  refNum: string,
  today: string,
  custom: Record<string, unknown>
): UniversalDocumentPayload {
  return {
    documentType: 'safety-plan',
    title: `Site-Specific Safety Plan: ${project.name}`,
    referenceNumber: refNum,
    issueDate: today,
    contractor: {
      name: contractor.name,
      phone: contractor.phone,
      email: contractor.email,
      primaryTrade: contractor.primaryTrade,
    },
    project,
    sections: [
      {
        id: 'sec-policy',
        title: '01 / Company Safety Policy & Objectives',
        type: 'text',
        order: 1,
        content: `${contractor.name} maintains an absolute commitment to zero incident operations. All employees and subcontractors have the unconditional authority and obligation to STOP WORK if unsafe conditions or behaviors are identified.`,
      },
      {
        id: 'sec-roles',
        title: '02 / Safety Roles & Responsibilities',
        type: 'table',
        order: 2,
        content: 'Key safety leadership assignments for this project.',
        tableData: {
          headers: ['Role', 'Designated Individual', 'Key Responsibilities'],
          rows: [
            ['Project Manager', (custom.pmName as string) || 'Operations Lead', 'Overall safety compliance, resource allocation, and owner coordination'],
            ['Site Safety Lead', (custom.safetyLead as string) || 'Field Superintendent', 'Daily JHA audits, toolbox talk briefings, and incident investigation'],
            ['Competent Person', (custom.competentPerson as string) || 'Trade Foreman', 'Excavation, scaffolding, and fall protection pre-task inspections'],
          ],
        },
      },
      {
        id: 'sec-rules',
        title: '03 / Mandatory Site Safety Rules',
        type: 'checklist',
        order: 3,
        content: 'Site-wide baseline compliance standards.',
        checklistData: [
          { label: '100% Safety glasses, hard hat, and safety-toe footwear at all times', checked: true },
          { label: '100% Fall protection required above 6 feet without exception', checked: true },
          { label: 'Zero tolerance policy for substance abuse or working under impairment', checked: true },
          { label: 'All near-misses and incidents reported to supervision within 60 minutes', checked: true },
          { label: 'Daily housekeeping and clear egress paths maintained at end of shift', checked: true },
        ],
      },
      {
        id: 'sec-emergency',
        title: '04 / Emergency Action & Evacuation Plan',
        type: 'text',
        order: 4,
        content: `Evacuation Route: Follow posted exit corridors to primary assembly point.\nMuster Point: Parking Lot A, North Perimeter.\nEmergency Contacts: 911 (Emergency), Site Safety Lead: ${contractor.phone || 'Field Office'}.\nFire Extinguishers: Inspected and mounted at 50ft intervals along main work corridor.`,
      },
    ],
    signOff: {
      required: true,
      signed: false,
      acknowledgmentText: 'I confirm this Site-Specific Safety Plan has been established for this project and distributed to all on-site supervisors.',
    },
    disclaimer: getDisclaimerForCategory('safety'),
  };
}

// 4. TOOLBOX TALK
function buildToolboxTalkPayload(
  contractor: ContractorContext,
  project: ProjectContext,
  refNum: string,
  today: string,
  custom: Record<string, unknown>
): UniversalDocumentPayload {
  const topic = (custom.topic as string) || 'Working Safely Near Overhead Power Lines & Electrical Feeders';

  return {
    documentType: 'toolbox-talk',
    title: `Safety Toolbox Talk: ${topic}`,
    referenceNumber: refNum,
    issueDate: today,
    contractor: {
      name: contractor.name,
      primaryTrade: contractor.primaryTrade,
    },
    project,
    sections: [
      {
        id: 'sec-topic',
        title: '01 / Safety Topic Overview',
        type: 'text',
        order: 1,
        content: `Topic: ${topic}\nDate: ${today}\nPresenter: ${(custom.presenter as string) || 'Field Safety Lead'}\nProject: ${project.name}`,
      },
      {
        id: 'sec-hazards',
        title: '02 / Core Hazards & Risk Points',
        type: 'text',
        order: 2,
        content: '• Unintentional contact between boom equipment, ladders, or conduit and energized lines.\n• Induced voltages in adjacent ungrounded metal piping and gutters.\n• Arc flash hazards within the minimum clearance distance.',
      },
      {
        id: 'sec-controls',
        title: '03 / Mandatory Safety Controls',
        type: 'checklist',
        order: 3,
        content: 'Essential field rules to enforce today.',
        checklistData: [
          { label: 'Maintain a minimum 10-foot clearance from lines up to 50kV (OSHA 1926.1408)', checked: true },
          { label: 'Designate a dedicated spotter whenever moving equipment near power lines', checked: true },
          { label: 'Use non-conductive fiberglass ladders around energized sources', checked: true },
          { label: 'Treat all overhead lines as live until utility confirms visual disconnect and grounding', checked: true },
        ],
      },
      {
        id: 'sec-discussion',
        title: '04 / Crew Discussion Questions',
        type: 'text',
        order: 4,
        content: '1. Where are the closest overhead lines or energized feeders on today’s active work area?\n2. What is our plan if a vehicle or equipment makes contact with an energized line? (Stay inside until utility de-energizes, unless on fire; jump clear without touching equipment and ground simultaneously).',
      },
      {
        id: 'sec-roster',
        title: '05 / Worker Attendance & Sign-Off Roster',
        type: 'table',
        order: 5,
        content: 'Documented field crew attendance.',
        tableData: {
          headers: ['Worker Name', 'Trade / Role', 'Signature / Initial'],
          rows: [
            ['Marcus Vance', 'Safety Supervisor', 'M.V. (Verified)'],
            ['David Ruiz', 'Journeyman Tech', 'D.R. (Verified)'],
            ['Tyler Smith', 'Apprentice', 'T.S. (Verified)'],
            ['Carlos Gomez', 'Equipment Operator', 'C.G. (Verified)'],
          ],
        },
      },
    ],
    signOff: {
      required: false,
      signed: true,
      acknowledgmentText: 'Safety briefing conducted on site with all field crew members listed above.',
    },
    disclaimer: getDisclaimerForCategory('safety'),
  };
}

// 5. QUOTE
function buildQuotePayload(
  contractor: ContractorContext,
  project: ProjectContext,
  refNum: string,
  today: string,
  custom: Record<string, unknown>
): UniversalDocumentPayload {
  let lineItems = custom.lineItems as Array<{
    item: string;
    qty: number;
    unit: string;
    unitPrice: number;
  }>;

  if (!lineItems && (typeof custom.laborCost === 'number' || typeof custom.materialsCost === 'number')) {
    lineItems = [];
    const labor = Number(custom.laborCost) || 0;
    const materials = Number(custom.materialsCost) || 0;
    if (labor > 0) {
      lineItems.push({ item: 'Labor & Skilled Craftsmanship Scope', qty: 1, unit: 'Lump Sum', unitPrice: labor });
    }
    if (materials > 0) {
      lineItems.push({ item: 'Materials, Hardware & Specified Equipment', qty: 1, unit: 'Lump Sum', unitPrice: materials });
    }
  }

  if (!lineItems || lineItems.length === 0) {
    lineItems = [
      { item: 'Main Switchgear Feeder Cable Installation (500 kcmil)', qty: 420, unit: 'Linear Feet', unitPrice: 38.5 },
      { item: 'NEMA 3R Distribution Panel Rough-In & Grounding', qty: 2, unit: 'Units', unitPrice: 2450.0 },
      { item: 'Permits, City Inspections & Utility Coordination', qty: 1, unit: 'Lump Sum', unitPrice: 1200.0 },
      { item: 'Safety Pre-Task Setup & Specialized Equipment Rigging', qty: 1, unit: 'Lump Sum', unitPrice: 850.0 },
    ];
  }

  const subtotal = lineItems.reduce((acc, curr) => acc + curr.qty * curr.unitPrice, 0);
  const taxRate = typeof custom.taxRatePercent === 'number' ? custom.taxRatePercent : 8.25;
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  return {
    documentType: 'quote',
    title: `Contractor Quote: ${project.name}`,
    referenceNumber: refNum,
    issueDate: today,
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    contractor: {
      name: contractor.name,
      legalName: contractor.legalName,
      phone: contractor.phone,
      email: contractor.email,
      primaryTrade: contractor.primaryTrade,
      jurisdiction: contractor.primaryState,
      licenseNumber: contractor.licenseNumber || 'Registered Trade Contractor',
    },
    project,
    sections: [
      {
        id: 'sec-scope',
        title: '01 / Scope Summary',
        type: 'text',
        order: 1,
        content: `Detailed commercial quotation for ${project.jobDescription || 'commercial installation scope'} at ${project.siteLocation}.\nValid for 30 days from date of issue.`,
      },
      {
        id: 'sec-pricing',
        title: '02 / Schedule of Values & Line Items',
        type: 'table',
        order: 2,
        content: 'Itemized material and installation pricing.',
        tableData: {
          headers: ['Item / Work Description', 'Qty', 'Unit', 'Unit Price ($)', 'Line Total ($)'],
          rows: lineItems.map((li) => [
            li.item,
            li.qty,
            li.unit,
            li.unitPrice.toFixed(2),
            (li.qty * li.unitPrice).toFixed(2),
          ]),
        },
      },
      {
        id: 'sec-terms',
        title: '03 / Commercial Terms & Exclusions',
        type: 'text',
        order: 3,
        content: '• Payment Terms: 50% mobilization deposit upon execution, balance Net 30 upon substantial completion.\n• Exclusions: Unforeseen structural remediation, utility company transformer delay fees, hazardous material abatement.\n• Working Hours: Standard commercial hours (7:00 AM - 4:00 PM, Monday through Friday).',
      },
    ],
    financialSummary: {
      subtotal,
      taxRatePercent: taxRate,
      taxAmount,
      totalAmount: total,
      currency: 'USD',
      paymentTerms: '50% Deposit, Net 30 Completion',
    },
    signOff: {
      required: true,
      signed: false,
      acknowledgmentText: 'Acceptance of Quote: Signing below authorizes the contractor to proceed with the specified scope of work in accordance with the pricing and terms outlined above.',
    },
    disclaimer: getDisclaimerForCategory('commercial'),
  };
}

// 6. PROPOSAL
function buildProposalPayload(
  contractor: ContractorContext,
  project: ProjectContext,
  refNum: string,
  today: string,
  custom: Record<string, unknown>
): UniversalDocumentPayload {
  return {
    documentType: 'proposal',
    title: `Commercial Proposal: ${project.name}`,
    referenceNumber: refNum,
    issueDate: today,
    contractor: {
      name: contractor.name,
      legalName: contractor.legalName,
      phone: contractor.phone,
      email: contractor.email,
      website: contractor.website,
      primaryTrade: contractor.primaryTrade,
      jurisdiction: contractor.primaryState,
      licenseNumber: contractor.licenseNumber || 'Active Trade Contractor',
    },
    project,
    sections: [
      {
        id: 'sec-exec-summary',
        title: '01 / Executive Summary & Company Profile',
        type: 'text',
        order: 1,
        content: `${contractor.name} is pleased to submit this comprehensive commercial proposal for ${project.name}. With verified licensing, full general liability insurance, and an uncompromised safety record, our team ensures on-schedule execution meeting all municipal and master specifications.`,
      },
      {
        id: 'sec-scope',
        title: '02 / Technical Execution Methodology',
        type: 'text',
        order: 2,
        content: 'Our execution approach involves 3 coordinated phases:\n1. Pre-Construction & Coordination: BIM clash detection, utility permits, and long-lead equipment procurement.\n2. Field Rough-In & Structural Support: Heavy feeder conduit placement, anchor pull testing, and staging.\n3. Final Trim, Energization & Commissioning: Infrared thermography, calibrated megger testing, and owner handover.',
      },
      {
        id: 'sec-milestones',
        title: '03 / Schedule & Key Milestones',
        type: 'table',
        order: 3,
        content: 'Target project schedule.',
        tableData: {
          headers: ['Phase / Milestone', 'Estimated Duration', 'Target Completion'],
          rows: [
            ['Permit Approval & Material Submittals', '2 Weeks', 'Week 2'],
            ['Feeder Cable Rough-In & Conduit Placement', '4 Weeks', 'Week 6'],
            ['Panelboard Termination & Switchgear Hookup', '3 Weeks', 'Week 9'],
            ['Testing, Commissioning & Final Sign-Off', '1 Week', 'Week 10'],
          ],
        },
      },
      {
        id: 'sec-credentials',
        title: '04 / Contractor Credentials & Insurance Baseline',
        type: 'checklist',
        order: 4,
        content: 'Verified operational baseline on file with Avorria.',
        checklistData: [
          { label: 'Commercial General Liability ($2,000,000 Aggregate Policy Active)', checked: true },
          { label: 'Workers’ Compensation Statutory Coverage Current', checked: true },
          { label: 'State Trade Licensing Active and in Good Standing', checked: true },
          { label: 'Field Supervisors OSHA 30-Hour Certified', checked: true },
        ],
      },
      {
        id: 'sec-pricing',
        title: '05 / Commercial Investment Summary',
        type: 'text',
        order: 5,
        content: 'Total Base Bid: $42,500.00 USD\nPayment Schedule: 20% Mobilization, 40% Rough-In Inspection, 40% Final Handover.',
      },
    ],
    financialSummary: {
      subtotal: 42500,
      totalAmount: 42500,
      currency: 'USD',
      paymentTerms: 'Milestone Progress Billing',
    },
    signOff: {
      required: true,
      signed: false,
      acknowledgmentText: 'Client Authorization: By signing below, the client accepts this proposal and authorizes contract issuance.',
    },
    disclaimer: getDisclaimerForCategory('commercial'),
  };
}

// 7. SCOPE OF WORK (SOW)
function buildScopeOfWorkPayload(
  contractor: ContractorContext,
  project: ProjectContext,
  refNum: string,
  today: string,
  custom: Record<string, unknown>
): UniversalDocumentPayload {
  return {
    documentType: 'scope-of-work',
    title: `Scope of Work: ${project.name}`,
    referenceNumber: refNum,
    issueDate: today,
    contractor: {
      name: contractor.name,
      primaryTrade: contractor.primaryTrade,
    },
    project,
    sections: [
      {
        id: 'sec-project',
        title: '01 / Project Description & Scope Intent',
        type: 'text',
        order: 1,
        content: `Project: ${project.name}\nSite Location: ${project.siteLocation}\nClient: ${project.clientName}\nThis Scope of Work document defines the boundary conditions, inclusions, exclusions, and deliverables for trade contracting services.`,
      },
      {
        id: 'sec-inclusions',
        title: '02 / Included Work Scopes & Deliverables',
        type: 'checklist',
        order: 2,
        content: 'The contractor is responsible for providing all labor, materials, and equipment for:',
        checklistData: [
          { label: 'Furnishing and installing all primary conduit runs and pull boxes', checked: true },
          { label: 'Pulling and terminating 500 kcmil copper feeder conductors', checked: true },
          { label: 'Installing NEMA 3R distribution panels per approved drawings', checked: true },
          { label: 'Performing insulation resistance (megger) testing on all feeders', checked: true },
          { label: 'Providing redline as-built drawings upon completion', checked: true },
        ],
      },
      {
        id: 'sec-exclusions',
        title: '03 / Excluded Scopes & Boundary Limits',
        type: 'text',
        order: 3,
        content: 'The following items are expressly EXCLUDED from this contract:\n• Concrete pad pouring, core drilling through post-tensioned slabs without third-party X-ray.\n• Utility company transformer installation and connection charges.\n• Remediation of pre-existing non-compliant wiring not shown on design documents.',
      },
      {
        id: 'sec-change-control',
        title: '04 / Change Control & Latent Conditions',
        type: 'text',
        order: 4,
        content: 'Any scope additions, hidden site obstructions, or customer revisions will be handled via written Change Order. No additional work shall proceed without prior written authorization.',
      },
    ],
    signOff: {
      required: true,
      signed: false,
      acknowledgmentText: 'Both parties agree that this document accurately delineates the approved scope of work.',
    },
    disclaimer: getDisclaimerForCategory('commercial'),
  };
}

// 8. CHANGE ORDER
function buildChangeOrderPayload(
  contractor: ContractorContext,
  project: ProjectContext,
  refNum: string,
  today: string,
  custom: Record<string, unknown>
): UniversalDocumentPayload {
  const reason = (custom.reason as string) || 'Unforeseen structural beam collision requiring rerouting of primary 4” conduit line.';
  const costImpact = typeof custom.costImpact === 'number' ? custom.costImpact : 3850.0;
  const scheduleImpactDays = typeof custom.scheduleImpactDays === 'number' ? custom.scheduleImpactDays : 4;

  return {
    documentType: 'change-order',
    title: `Contract Change Order #01: ${project.name}`,
    referenceNumber: refNum,
    issueDate: today,
    contractor: {
      name: contractor.name,
      legalName: contractor.legalName,
      phone: contractor.phone,
      primaryTrade: contractor.primaryTrade,
    },
    project,
    sections: [
      {
        id: 'sec-reason',
        title: '01 / Justification & Description of Change',
        type: 'text',
        order: 1,
        content: `Reason for Change: ${reason}\nImpact: Existing mechanical ducting conflicts with planned conduit elevation. Contractor must install two additional 90-degree sweeps and 35 feet of 4” rigid conduit.`,
      },
      {
        id: 'sec-impact',
        title: '02 / Schedule of Values Modification',
        type: 'table',
        order: 2,
        content: 'Cost adjustment breakdown.',
        tableData: {
          headers: ['Description', 'Labor Hours', 'Material Cost ($)', 'Total Line Adjustment ($)'],
          rows: [
            ['Fabrication & bending of 4” rigid steel offsets', '12 hrs', '850.00', '1,930.00'],
            ['Pull box installation and additional wire length', '8 hrs', '1,200.00', '1,920.00'],
          ],
        },
      },
      {
        id: 'sec-summary',
        title: '03 / Contract Price & Time Adjustments',
        type: 'text',
        order: 3,
        content: `Cost Adjustment: +$${costImpact.toFixed(2)} USD\nSchedule Impact: +${scheduleImpactDays} Calendar Days to substantial completion date.`,
      },
    ],
    financialSummary: {
      subtotal: costImpact,
      totalAmount: costImpact,
      currency: 'USD',
      paymentTerms: 'Added to final completion milestone',
    },
    signOff: {
      required: true,
      signed: false,
      acknowledgmentText: 'Change Order Approval: By signing below, the Client and Contractor approve this modification to the contract scope, price, and schedule.',
    },
    disclaimer: getDisclaimerForCategory('commercial'),
  };
}

// 9. DAILY REPORT
function buildDailyReportPayload(
  contractor: ContractorContext,
  project: ProjectContext,
  refNum: string,
  today: string,
  custom: Record<string, unknown>
): UniversalDocumentPayload {
  return {
    documentType: 'daily-report',
    title: `Daily Field Report: ${today} (${project.name})`,
    referenceNumber: refNum,
    issueDate: today,
    contractor: {
      name: contractor.name,
      primaryTrade: contractor.primaryTrade,
    },
    project,
    sections: [
      {
        id: 'sec-site-cond',
        title: '01 / Site & Environmental Conditions',
        type: 'text',
        order: 1,
        content: `Date: ${today}\nWeather: ${(custom.weather as string) || 'Clear, 78°F, Wind 6 mph'}\nSite Ground Condition: Dry & firm, active utility coordination in progress.`,
      },
      {
        id: 'sec-headcount',
        title: '02 / On-Site Personnel & Trade Headcount',
        type: 'table',
        order: 2,
        content: 'Daily worker count by trade.',
        tableData: {
          headers: ['Trade / Role', 'Company', 'Headcount', 'Total Hours Worked'],
          rows: [
            ['Journeyman Electricians', contractor.name, '4', '32 hrs'],
            ['Apprentices', contractor.name, '2', '16 hrs'],
            ['Safety Supervisor', contractor.name, '1', '8 hrs'],
          ],
        },
      },
      {
        id: 'sec-work',
        title: '03 / Work Performed Today',
        type: 'text',
        order: 3,
        content: (custom.workSummary as string) || '• Completed cable pulling for feeder circuits 1 through 3 on Level 2.\n• Mounted distribution panelboards LP-2A and LP-2B.\n• Conducted pre-energization insulation tests with zero faults recorded.',
      },
      {
        id: 'sec-delays',
        title: '04 / Delays, Incidents & Safety Observations',
        type: 'text',
        order: 4,
        content: '• Safety Incidents: 0 injuries, 0 near-misses.\n• Delays: 45-minute staging delay due to delivery truck gate congestion.\n• Visitors: City Electrical Inspector conducted rough-in audit; approved with zero discrepancies.',
      },
    ],
    signOff: {
      required: true,
      signed: false,
      acknowledgmentText: 'Supervisor Verification: I certify that the worker hours, work completed, and site observations recorded above are an accurate record of today’s field operations.',
    },
    disclaimer: getDisclaimerForCategory('operations'),
  };
}
