export type ResourceCategory =
  | 'win-work'
  | 'estimating-commercial'
  | 'project-operations'
  | 'subcontractor-management'
  | 'safety-compliance'
  | 'business-administration';

export type ResourceType = 'generator' | 'template' | 'checklist' | 'form' | 'worksheet';

export interface ResourceField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select';
  placeholder?: string;
  defaultValue?: string | number;
  options?: string[];
  helperText?: string;
  required?: boolean;
}

export interface ResourceSection {
  id: string;
  title: string;
  description?: string;
  fields: ResourceField[];
}

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  type?: 'text' | 'number';
}

export interface ChecklistItemDef {
  id: string;
  category: string;
  requirement: string;
  responsibleParty: string;
  notes?: string;
  status: 'passed' | 'failed' | 'in_progress' | 'na';
}

export interface ContractorResource {
  id: string;
  slug: string;
  title: string;
  code: string;
  category: ResourceCategory;
  categoryName: string;
  type: ResourceType;
  priority: 'P0' | 'P1';
  format: string;
  estimatedTime: string;
  standard: string;
  typicalUse: string;
  shortDescription: string;
  fullDescription: string;
  sections: ResourceSection[];
  tableColumns?: TableColumn[];
  defaultTableRows?: Record<string, any>[];
  checklistItems?: ChecklistItemDef[];
  disclaimer: string;
}

export const RESOURCE_CATEGORIES: { id: ResourceCategory; label: string; description: string }[] = [
  {
    id: 'win-work',
    label: 'Win Work',
    description: 'Corporate capabilities, qualifications, proposals, and tender submission governance.',
  },
  {
    id: 'estimating-commercial',
    label: 'Estimating & Commercial',
    description: 'Cost modeling, contract change controls, payment applications, and invoicing.',
  },
  {
    id: 'project-operations',
    label: 'Project Operations',
    description: 'Daily field logs, site inspections, progress meetings, and project handover audits.',
  },
  {
    id: 'subcontractor-management',
    label: 'Subcontractor Management',
    description: 'Prequalification, trade scope definitions, onboarding compliance, and performance ratings.',
  },
  {
    id: 'safety-compliance',
    label: 'Safety & Compliance',
    description: 'OSHA 1926 jobsite inspections, tailgate briefings, incident records, and emergency postings.',
  },
  {
    id: 'business-administration',
    label: 'Business Administration',
    description: 'Commercial project startup procedures and contractual closeout verification.',
  },
];

export const RESOURCE_TYPES: { id: ResourceType; label: string }[] = [
  { id: 'generator', label: 'Generators' },
  { id: 'template', label: 'Templates' },
  { id: 'checklist', label: 'Checklists' },
  { id: 'form', label: 'Forms' },
  { id: 'worksheet', label: 'Worksheets' },
];

export const CONTRACTOR_RESOURCES: ContractorResource[] = [
  // ─── 1. WIN WORK ──────────────────────────────────────────────────────────
  {
    id: 'res-cap-statement',
    slug: 'contractor-capability-statement',
    title: 'Contractor Capability Statement',
    code: 'WW-CAP-01',
    category: 'win-work',
    categoryName: 'Win Work',
    type: 'generator',
    priority: 'P0',
    format: 'PDF · DOCX · PRINT',
    estimatedTime: '15 Mins',
    standard: 'AIA / AGC Best Practice',
    typicalUse: 'Tender Prequalification & GC Bid Solicitation',
    shortDescription: 'Professional corporate profile highlighting core trades, verified licensing, insurance limits, safety performance (EMR), and completed project portfolio.',
    fullDescription: 'A formal commercial capability statement designed to introduce your contracting company to general contractors, project owners, and public procurement boards. Features structured sections for corporate structure, trade specializations, licensed operating territories, bonded capacity, and reference projects.',
    disclaimer: 'Operational document template for commercial prequalification. Information reflects recorded company credentials and does not constitute a financial audit.',
    sections: [
      {
        id: 'company-info',
        title: '01 / Corporate Overview',
        description: 'Company legal identification and business foundation.',
        fields: [
          { id: 'companyName', label: 'Legal Company Name', type: 'text', defaultValue: 'Vance Commercial Electric LLC', required: true },
          { id: 'primaryTrade', label: 'Primary Trade Classification', type: 'text', defaultValue: 'Commercial & Industrial Electrical', required: true },
          { id: 'yearsInBusiness', label: 'Years in Operation', type: 'number', defaultValue: 14, required: true },
          { id: 'headquarters', label: 'Headquarters City & State', type: 'text', defaultValue: 'Dallas, TX', required: true },
          { id: 'statesLicensed', label: 'Licensed Operating States', type: 'text', defaultValue: 'TX, OK, AR, LA' },
          { id: 'bondingCapacity', label: 'Bonding Capacity (Single / Aggregate)', type: 'text', defaultValue: '$2,500,000 / $5,000,000' },
        ],
      },
      {
        id: 'core-capabilities',
        title: '02 / Core Capabilities & Delivery Methods',
        fields: [
          { id: 'coreServices', label: 'Core Technical Services (Comma-separated)', type: 'textarea', defaultValue: 'Medium Voltage Distribution, Commercial Switchgear, Industrial Automation, Emergency Generator Systems, Fire Alarm & Life Safety, EV Fleet Infrastructure', required: true },
          { id: 'marketsServed', label: 'Key Market Sectors', type: 'text', defaultValue: 'Healthcare, Commercial Office, Industrial Logistics, Municipal & Educational' },
          { id: 'emrScore', label: 'Current 3-Year EMR Rating', type: 'text', defaultValue: '0.78 (Zero Lost-Time Incidents in 24 Months)' },
          { id: 'insuranceLimits', label: 'Commercial General Liability Coverage', type: 'text', defaultValue: '$2,000,000 Each Occurrence / $4,000,000 General Aggregate' },
        ],
      },
      {
        id: 'featured-projects',
        title: '03 / Selected Landmark Experience',
        fields: [
          { id: 'project1', label: 'Representative Project 1 (Title, Scope & Value)', type: 'text', defaultValue: 'DFW Regional Logistics Center – 4000A Switchgear & Conveyor Power ($1,250,000)' },
          { id: 'project2', label: 'Representative Project 2 (Title, Scope & Value)', type: 'text', defaultValue: 'Plano Medical Pavilion – Life Safety Distribution & Standby Power ($820,000)' },
          { id: 'project3', label: 'Representative Project 3 (Title, Scope & Value)', type: 'text', defaultValue: 'Fort Worth Tech Campus – Complete Shell & Tenant Electrical Rough-in ($640,000)' },
        ],
      },
    ],
  },
  {
    id: 'res-qual-statement',
    slug: 'contractor-qualification-statement',
    title: 'Contractor Qualification Statement',
    code: 'WW-QUA-02',
    category: 'win-work',
    categoryName: 'Win Work',
    type: 'generator',
    priority: 'P0',
    format: 'PDF · DOCX · PRINT',
    estimatedTime: '20 Mins',
    standard: 'AIA A305 Aligned',
    typicalUse: 'Formal Commercial Prequalification Submittal',
    shortDescription: 'Comprehensive corporate disclosure covering organization ownership, personnel capacity, credit references, licensing, and trade references.',
    fullDescription: 'Modeled after standardized commercial qualification requirements (AIA Document A305), this document provides general contractors and commercial developers with audited structural, operational, and financial qualifications.',
    disclaimer: 'Standard trade qualification disclosure. Verify all referenced policy limits and bank disclosures prior to formal contract award.',
    sections: [
      {
        id: 'org-structure',
        title: '01 / Organization & Entity Details',
        fields: [
          { id: 'legalEntity', label: 'Entity Type & State of Incorporation', type: 'text', defaultValue: 'Limited Liability Company (Texas)', required: true },
          { id: 'principals', label: 'Key Principals & Managing Officers', type: 'text', defaultValue: 'Marcus Vance (Managing Principal / Master Electrician)' },
          { id: 'contractorLicense', label: 'Master Trade License Number', type: 'text', defaultValue: 'TDLR Electrical Contractor #31092' },
          { id: 'fieldWorkforce', label: 'Full-Time Field Technicians / Journeymen', type: 'number', defaultValue: 28 },
        ],
      },
      {
        id: 'operations-finance',
        title: '02 / Operational & Financial Stability',
        fields: [
          { id: 'bankReference', label: 'Commercial Banking Institution', type: 'text', defaultValue: 'Frost Bank (Commercial Lending & Treasury Services)' },
          { id: 'suretyBroker', label: 'Surety / Bonding Broker', type: 'text', defaultValue: 'Hartford Specialty Surety Division' },
          { id: 'safetyOfficer', label: 'Designated Safety Director', type: 'text', defaultValue: 'Marcus Vance, OSHA 30-Hour Certified' },
          { id: 'claimsHistory', label: 'Pending Claims or Unresolved Arbitrations', type: 'text', defaultValue: 'None. Zero material claims in company operating history.' },
        ],
      },
    ],
  },
  {
    id: 'res-bid-proposal',
    slug: 'bid-proposal-template',
    title: 'Commercial Bid Proposal Template',
    code: 'WW-PRP-03',
    category: 'win-work',
    categoryName: 'Win Work',
    type: 'template',
    priority: 'P0',
    format: 'PDF · DOCX · PRINT',
    estimatedTime: '25 Mins',
    standard: 'CSI MasterFormat Bid Standard',
    typicalUse: 'Tender Response & Competitive Price Submission',
    shortDescription: 'Professional proposal structure featuring executive narrative, itemized work scope, milestone schedules, commercial pricing, qualifications, and formal acceptance block.',
    fullDescription: 'A formal commercial bid submission instrument designed to deliver complete tender responses. Clearly delineates scope boundaries, included specifications, payment milestone terms, exclusions, and legal execution terms.',
    disclaimer: 'Commercial proposal instrument. Subject to formal contract execution by both parties within stated proposal validity window.',
    sections: [
      {
        id: 'proposal-meta',
        title: '01 / Client & Tender Identification',
        fields: [
          { id: 'projectName', label: 'Project Name', type: 'text', defaultValue: 'Baylor Surgical Center – Electrical Upgrade', required: true },
          { id: 'clientName', label: 'Client / General Contractor', type: 'text', defaultValue: 'Austin Commercial General Contractors', required: true },
          { id: 'bidDate', label: 'Bid Submission Date', type: 'date', defaultValue: '2026-09-04', required: true },
          { id: 'validityDays', label: 'Proposal Validity Window', type: 'text', defaultValue: '45 Calendar Days from Date of Issue' },
        ],
      },
      {
        id: 'scope-terms',
        title: '02 / Commercial Scope & Investment Schedule',
        fields: [
          { id: 'executiveSummary', label: 'Executive Scope Summary', type: 'textarea', defaultValue: 'Furnish all supervision, labor, equipment, and specified materials to execute the electrical distribution overhaul in full accordance with specifications E-101 through E-304.' },
          { id: 'baseBidAmount', label: 'Lump Sum Base Bid (USD)', type: 'number', defaultValue: 148500, required: true },
          { id: 'alternatePricing', label: 'Voluntary Alternate / Additions', type: 'textarea', defaultValue: 'Alternate #1: Surge Protective Device (SPD) on main distribution board (+ $4,850.00)' },
          { id: 'paymentTerms', label: 'Commercial Progress Payment Terms', type: 'text', defaultValue: 'Monthly progress billing based on completed percentage, Net 30 days, 5% retainage.' },
        ],
      },
    ],
  },
  {
    id: 'res-sow-template',
    slug: 'scope-of-work-template',
    title: 'Scope of Work (SOW) Template',
    code: 'WW-SOW-04',
    category: 'win-work',
    categoryName: 'Win Work',
    type: 'generator',
    priority: 'P0',
    format: 'PDF · DOCX · PRINT',
    estimatedTime: '20 Mins',
    standard: 'AIA / AGC Subcontract Standard',
    typicalUse: 'Contractual Work Scope Delineation & Exclusions',
    shortDescription: 'Defines work requirements, materials supplied, equipment responsibilities, execution standards, explicit exclusions, and completion criteria.',
    fullDescription: 'The foundational technical scope definition used to prevent scope creep, clarify contractor deliverables, establish division of responsibility, and record assumptions before jobsite mobilization.',
    disclaimer: 'Contractual scope definition instrument. Review against prime contract documents and division specs before signing.',
    sections: [
      {
        id: 'sow-project',
        title: '01 / Project Boundaries & Parties',
        fields: [
          { id: 'projectName', label: 'Project Name', type: 'text', defaultValue: 'Lone Star Logistics Distribution Center', required: true },
          { id: 'siteLocation', label: 'Site Location', type: 'text', defaultValue: '4400 South Interstate 35, Denton, TX', required: true },
          { id: 'ownerGc', label: 'General Contractor / Owner', type: 'text', defaultValue: 'Vanguard Industrial Builders LLC' },
        ],
      },
      {
        id: 'sow-deliverables',
        title: '02 / Inclusions & Deliverables',
        fields: [
          { id: 'includedWork', label: 'Specific Inclusions & Deliverables', type: 'textarea', defaultValue: '1. Installation of 480V 3-phase switchboard and downstream distribution panels.\n2. Conduit and wire runs for 18 dock door levelers and overhead door operators.\n3. Complete exterior LED canopy and building perimeter security lighting.\n4. Testing, commissioning, and as-built markups.' },
          { id: 'materialsProvided', label: 'Materials Furnished by Contractor', type: 'text', defaultValue: 'All conduit, copper conductors, disconnect switches, and specified Eaton panelboards.' },
          { id: 'exclusions', label: 'Explicit Exclusions & Boundary Limits', type: 'textarea', defaultValue: '1. Civil excavation, trenching, or concrete transformer pads (by others).\n2. Utility company connection or meter fees.\n3. Temporary site power generators or fuel servicing.\n4. Patching or painting of drywall penetrations.' },
        ],
      },
    ],
  },
  {
    id: 'res-bid-checklist',
    slug: 'bid-submission-checklist',
    title: 'Bid Submission & Tender Verification Checklist',
    code: 'WW-CHK-05',
    category: 'win-work',
    categoryName: 'Win Work',
    type: 'checklist',
    priority: 'P0',
    format: 'PDF · PRINT',
    estimatedTime: '10 Mins',
    standard: 'Commercial Estimating QA Protocol',
    typicalUse: 'Final Pre-Tender Audit & Disqualification Prevention',
    shortDescription: 'Multi-point tender verification audit ensuring all addenda, bid bonds, signed affidavits, COI requirements, and pricing breakdowns are strictly satisfied prior to submission.',
    fullDescription: 'Prevents non-responsive bid disqualification by verifying that all solicitation instructions, addenda receipts, required surety bonds, insurance certificates, and mandatory affidavits are verified and executed before the tender deadline.',
    disclaimer: 'Estimating quality assurance checklist. Contractor remains responsible for reviewing official solicitation addenda.',
    sections: [
      {
        id: 'tender-meta',
        title: '01 / Tender Overview',
        fields: [
          { id: 'tenderTitle', label: 'Solicitation / RFP Title', type: 'text', defaultValue: 'RFP #2026-088: North Campus Electrical Infrastructure', required: true },
          { id: 'submissionDeadline', label: 'Hard Submission Deadline', type: 'text', defaultValue: 'October 15, 2026 at 2:00 PM CST' },
          { id: 'estimator', label: 'Lead Estimator / Reviewer', type: 'text', defaultValue: 'Marcus Vance' },
        ],
      },
    ],
    checklistItems: [
      { id: 'c1', category: 'Tender Governance', requirement: 'All formal addenda (1 through 4) acknowledged on bid form', responsibleParty: 'Lead Estimator', status: 'passed' },
      { id: 'c2', category: 'Tender Governance', requirement: 'Original signed Bid Bond (5% of base bid) or certified check secured', responsibleParty: 'Surety Coordinator', status: 'passed' },
      { id: 'c3', category: 'Commercial & Pricing', requirement: 'Base bid figures checked against estimate spreadsheet arithmetic', responsibleParty: 'Chief Estimator', status: 'passed' },
      { id: 'c4', category: 'Commercial & Pricing', requirement: 'Unit prices and alternate pricing schedules fully completed', responsibleParty: 'Estimating Team', status: 'passed' },
      { id: 'c5', category: 'Compliance & Legal', requirement: 'Non-collusion affidavit and debrief disclosures signed & notarized', responsibleParty: 'Corporate Secretary', status: 'passed' },
      { id: 'c6', category: 'Compliance & Legal', requirement: 'Certificate of Insurance with specified $5M umbrella limits attached', responsibleParty: 'Insurance Agent', status: 'passed' },
      { id: 'c7', category: 'Compliance & Legal', requirement: 'Subcontractor listing with verified state trade license numbers included', responsibleParty: 'Project Coordinator', status: 'passed' },
      { id: 'c8', category: 'Delivery Logistics', requirement: 'Physical or digital portal delivery verified prior to 2-hour deadline buffer', responsibleParty: 'Bid Runner / Admin', status: 'in_progress' },
    ],
  },

  // ─── 2. ESTIMATING & COMMERCIAL ───────────────────────────────────────────
  {
    id: 'res-estimate-worksheet',
    slug: 'estimate-worksheet',
    title: 'Contractor Estimate Worksheet',
    code: 'EC-EST-06',
    category: 'estimating-commercial',
    categoryName: 'Estimating & Commercial',
    type: 'worksheet',
    priority: 'P0',
    format: 'XLSX · PDF · PRINT',
    estimatedTime: '20 Mins',
    standard: 'Direct Burden & Overhead Standard',
    typicalUse: 'Trade Project Cost Modeling & Markup Calculation',
    shortDescription: 'Structured cost breakdown covering fully burdened labor, direct materials, equipment rental, subcontractors, overhead burden, and profit margins.',
    fullDescription: 'Eliminates underbidding by forcing explicit calculation of payroll taxes, workers’ comp burden, non-productive time, shop overhead, and clear profit margins across direct cost categories.',
    disclaimer: 'Financial planning and bidding worksheet. Cost factors must be audited against current local material vendor quotes and actual labor burden.',
    sections: [
      {
        id: 'est-meta',
        title: '01 / Project & Estimating Context',
        fields: [
          { id: 'projectName', label: 'Project Name', type: 'text', defaultValue: 'Westlake Medical Plaza Clinic Fit-out', required: true },
          { id: 'estimator', label: 'Estimator', type: 'text', defaultValue: 'Marcus Vance' },
          { id: 'datePrepared', label: 'Date Prepared', type: 'date', defaultValue: '2026-09-04' },
        ],
      },
      {
        id: 'est-summary',
        title: '02 / Cost Summary & Markups',
        fields: [
          { id: 'laborCost', label: 'Direct Burdened Labor ($)', type: 'number', defaultValue: 38400, required: true },
          { id: 'materialsCost', label: 'Direct Materials & Hardware ($)', type: 'number', defaultValue: 42150, required: true },
          { id: 'equipmentRental', label: 'Equipment Rental & Tooling ($)', type: 'number', defaultValue: 4500 },
          { id: 'subcontractCost', label: 'Specialty Subcontractors ($)', type: 'number', defaultValue: 8200 },
          { id: 'overheadPercent', label: 'Company Overhead Allocation (%)', type: 'number', defaultValue: 12 },
          { id: 'profitPercent', label: 'Target Net Profit Margin (%)', type: 'number', defaultValue: 15 },
        ],
      },
    ],
  },
  {
    id: 'res-change-order-form',
    slug: 'change-order-form',
    title: 'Contract Change Order Form',
    code: 'EC-CHO-07',
    category: 'estimating-commercial',
    categoryName: 'Estimating & Commercial',
    type: 'generator',
    priority: 'P0',
    format: 'PDF · DOCX · PRINT',
    estimatedTime: '10 Mins',
    standard: 'AIA G701 Aligned',
    typicalUse: 'Contract Scope, Price & Schedule Revision',
    shortDescription: 'Formal change instrument documenting scope revisions, reason for change, itemized cost adjustments, schedule extensions, and mutual sign-off.',
    fullDescription: 'Contractually binding change authorization modeled after standard commercial construction practices. Formally modifies the contract sum and contract time before unauthorized work is performed in the field.',
    disclaimer: 'Contract amendment instrument. Becomes binding upon authorized execution by both General Contractor / Owner and Trade Contractor.',
    sections: [
      {
        id: 'cho-header',
        title: '01 / Change Order Reference & Contract Data',
        fields: [
          { id: 'coNumber', label: 'Change Order Number', type: 'text', defaultValue: 'CO-003', required: true },
          { id: 'projectName', label: 'Project Name & Number', type: 'text', defaultValue: 'Centennial Tower Core & Shell (Job #2026-104)', required: true },
          { id: 'contractDate', label: 'Original Subcontract Date', type: 'date', defaultValue: '2026-03-15' },
          { id: 'originalContractSum', label: 'Original Subcontract Amount ($)', type: 'number', defaultValue: 285000, required: true },
        ],
      },
      {
        id: 'cho-details',
        title: '02 / Scope Modification & Financial Impact',
        fields: [
          { id: 'description', label: 'Detailed Description of Change', type: 'textarea', defaultValue: 'Reroute 4” electrical feeder conduit around newly installed HVAC chiller ducting on Level 3 ceiling plenum. Install two additional 90-degree sweeps and 45 LF of galvanized rigid conduit.', required: true },
          { id: 'reason', label: 'Reason for Change', type: 'text', defaultValue: 'Unforeseen architectural/MEP spatial clash not indicated on bid drawings.' },
          { id: 'costImpact', label: 'Net Cost Adjustment (Add/Deduct $) (+)', type: 'number', defaultValue: 5840.00, required: true },
          { id: 'scheduleImpact', label: 'Schedule Adjustment (Calendar Days)', type: 'number', defaultValue: 3 },
        ],
      },
    ],
  },
  {
    id: 'res-change-notice',
    slug: 'request-for-change-notice',
    title: 'Request for Change / Change Notice',
    code: 'EC-RFC-08',
    category: 'estimating-commercial',
    categoryName: 'Estimating & Commercial',
    type: 'form',
    priority: 'P1',
    format: 'DOCX · PDF · PRINT',
    estimatedTime: '8 Mins',
    standard: 'Commercial Notice Protocol',
    typicalUse: 'Early Discrepancy Warning & Reservation of Rights',
    shortDescription: 'Formal written notice issued immediately upon encountering unforeseen conditions or client directives, preserving contract rights before formal pricing.',
    fullDescription: 'Protects contractors from waiving rights to cost or schedule adjustments under strict subcontract notice clauses (e.g., 48-hour or 7-day notification rules). Gives prime contractor prompt notice of an impending change event.',
    disclaimer: 'Contractual notice of potential change. Does not authorize extra work until a formal change order or work directive is signed.',
    sections: [
      {
        id: 'rfc-info',
        title: '01 / Notification Identification',
        fields: [
          { id: 'noticeNumber', label: 'Notice Number', type: 'text', defaultValue: 'CN-004', required: true },
          { id: 'projectName', label: 'Project Name', type: 'text', defaultValue: 'Highland Park Municipal Complex', required: true },
          { id: 'dateIdentified', label: 'Date Condition Encountered', type: 'date', defaultValue: '2026-09-04', required: true },
          { id: 'recipient', label: 'Attention (GC Project Manager)', type: 'text', defaultValue: 'David Sterling, Senior PM, Austin Commercial' },
        ],
      },
      {
        id: 'rfc-narrative',
        title: '02 / Condition Description & Impact Assessment',
        fields: [
          { id: 'conditionDescription', label: 'Description of Encountered Condition or Instruction', type: 'textarea', defaultValue: 'During drywall demo on 2nd floor east wing, existing concealed water pipe was uncovered directly in the path of specified electrical panelboard N-2. Work in this zone has been suspended pending engineering instruction.', required: true },
          { id: 'estimatedCostRange', label: 'Estimated Preliminary Cost Range ($)', type: 'text', defaultValue: '$2,500 – $4,500' },
          { id: 'potentialScheduleImpact', label: 'Anticipated Schedule Impact', type: 'text', defaultValue: '2 to 4 work days depending on response time to RFI #018.' },
        ],
      },
    ],
  },
  {
    id: 'res-pay-app-checklist',
    slug: 'payment-application-checklist',
    title: 'Payment Application Verification Checklist',
    code: 'EC-PAY-09',
    category: 'estimating-commercial',
    categoryName: 'Estimating & Commercial',
    type: 'checklist',
    priority: 'P0',
    format: 'PDF · PRINT',
    estimatedTime: '10 Mins',
    standard: 'AIA G702 / G703 Protocol',
    typicalUse: 'Monthly Progress Billing Review & Payment Speed',
    shortDescription: 'Reconciles Schedule of Values, lien waivers (primary and sub-tier), stored materials invoices, approved change orders, and municipal inspection sign-offs.',
    fullDescription: 'Ensures payment applications are submitted error-free on the first pass, preventing billing rejection cycles, delayed disbursements, and dispute delays from general contractors and construction lenders.',
    disclaimer: 'Billing quality control tool. Ensure lien waiver language matches state statutory forms (e.g. Texas Property Code Chapter 53).',
    sections: [
      {
        id: 'pay-meta',
        title: '01 / Billing Period & Contract Reference',
        fields: [
          { id: 'payAppNumber', label: 'Pay Application Number', type: 'text', defaultValue: 'Pay App #04', required: true },
          { id: 'billingPeriodEnd', label: 'Period Ending Date', type: 'date', defaultValue: '2026-08-31' },
          { id: 'totalBilledThisPeriod', label: 'Amount Billed This Period ($)', type: 'number', defaultValue: 34250 },
        ],
      },
    ],
    checklistItems: [
      { id: 'p1', category: 'Schedule of Values', requirement: 'Line item percentages align with actual verified physical completion on site', responsibleParty: 'Project Manager', status: 'passed' },
      { id: 'p2', category: 'Change Orders', requirement: 'Only fully executed change orders (CO #01 and #02) included in billing', responsibleParty: 'Billing Admin', status: 'passed' },
      { id: 'p3', category: 'Retainage Calculation', requirement: 'Contract retainage (5%) accurately deducted from work completed to date', responsibleParty: 'Accountant', status: 'passed' },
      { id: 'p4', category: 'Lien Waivers', requirement: 'Current Conditional Progress Lien Waiver executed on statutory state form', responsibleParty: 'Managing Principal', status: 'passed' },
      { id: 'p5', category: 'Sub-Tier Releases', requirement: 'Unconditional lien releases from lower-tier suppliers for prior payment attached', responsibleParty: 'Procurement Lead', status: 'passed' },
      { id: 'p6', category: 'Stored Materials', requirement: 'Invoices, insurance certificates, and photos attached for off-site stored materials', responsibleParty: 'Warehouse Lead', status: 'na' },
      { id: 'p7', category: 'Certified Payroll', requirement: 'Weekly certified payroll reports (Form WH-347) submitted for prevailing wage items', responsibleParty: 'Compliance Specialist', status: 'passed' },
    ],
  },
  {
    id: 'res-invoice-template',
    slug: 'invoice-template',
    title: 'Contractor Commercial Progress Invoice',
    code: 'EC-INV-10',
    category: 'estimating-commercial',
    categoryName: 'Estimating & Commercial',
    type: 'generator',
    priority: 'P0',
    format: 'PDF · DOCX · PRINT',
    estimatedTime: '10 Mins',
    standard: 'Commercial Billing Standard',
    typicalUse: 'Milestone, Time & Material, or Progress Billing',
    shortDescription: 'Contractor commercial invoice featuring Schedule of Values breakdown, previous billings, current work completed, retainage withholding, and total amount due.',
    fullDescription: 'Professional commercial progress invoice providing transparent financial accounting for commercial projects. Features clear contractor tax ID, remittance instructions, payment milestones, and cumulative billing summaries.',
    disclaimer: 'Commercial invoicing document. Ensure state sales tax exemptions for capital construction improvements are properly noted where applicable.',
    sections: [
      {
        id: 'inv-header',
        title: '01 / Invoice Identification & Parties',
        fields: [
          { id: 'invoiceNumber', label: 'Invoice Number', type: 'text', defaultValue: 'INV-2026-041', required: true },
          { id: 'invoiceDate', label: 'Invoice Date', type: 'date', defaultValue: '2026-09-04', required: true },
          { id: 'dueDate', label: 'Payment Due Date', type: 'date', defaultValue: '2026-10-04' },
          { id: 'customerName', label: 'Customer / General Contractor', type: 'text', defaultValue: 'Skiles Group Construction' },
          { id: 'projectRef', label: 'Project Name / Reference', type: 'text', defaultValue: 'Methodist Hospital Expansion – Level 4' },
        ],
      },
      {
        id: 'inv-financials',
        title: '02 / Billing Amounts & Retainage',
        fields: [
          { id: 'totalContractValue', label: 'Total Revised Contract Value ($)', type: 'number', defaultValue: 120000, required: true },
          { id: 'previousBilled', label: 'Total Previously Invoiced ($)', type: 'number', defaultValue: 48000, required: true },
          { id: 'currentBilled', label: 'Gross Work Completed This Period ($)', type: 'number', defaultValue: 24000, required: true },
          { id: 'retainageRate', label: 'Retainage Withheld (%)', type: 'number', defaultValue: 5 },
          { id: 'netAmountDue', label: 'Net Amount Due This Invoice ($)', type: 'number', defaultValue: 22800, required: true },
          { id: 'remitAddress', label: 'Remittance Instructions / Wire Details', type: 'text', defaultValue: 'Remit to: Vance Commercial Electric LLC, Dept 841, PO Box 9910, Dallas, TX 75201' },
        ],
      },
    ],
  },

  // ─── 3. PROJECT OPERATIONS ───────────────────────────────────────────────
  {
    id: 'res-daily-report',
    slug: 'daily-construction-report',
    title: 'Daily Construction Field Report',
    code: 'PO-DLR-11',
    category: 'project-operations',
    categoryName: 'Project Operations',
    type: 'generator',
    priority: 'P0',
    format: 'PDF · DOCX · PRINT',
    estimatedTime: '12 Mins',
    standard: 'Contemporaneous Field Record Standard',
    typicalUse: 'Daily Jobsite Documentation & Dispute Defense',
    shortDescription: 'The flagship field report capturing weather, trade headcount, subcontractor hours, equipment on site, work performed by area, delays, and safety audits.',
    fullDescription: 'The most important legal protection tool on a jobsite. Provides contemporaneous proof of site conditions, work executed, delays caused by others, safety observations, and instructions received from the prime contractor or architect.',
    disclaimer: 'Contemporaneous field operational record. Must be completed and signed by the authorized on-site superintendent or foreman daily.',
    sections: [
      {
        id: 'dlr-header',
        title: '01 / Project & Environmental Context',
        fields: [
          { id: 'projectName', label: 'Project Name', type: 'text', defaultValue: 'Plano Corporate Center Phase II', required: true },
          { id: 'reportDate', label: 'Report Date', type: 'date', defaultValue: '2026-09-04', required: true },
          { id: 'weatherConditions', label: 'Weather & Temperature', type: 'text', defaultValue: 'Clear, 84°F, Wind 8mph, Ground dry' },
          { id: 'supervisor', label: 'Superintendent / Foreman', type: 'text', defaultValue: 'Marcus Vance' },
        ],
      },
      {
        id: 'dlr-workforce',
        title: '02 / Workforce & Equipment on Site',
        fields: [
          { id: 'journeymanCount', label: 'Journeyman Technicians on Site', type: 'number', defaultValue: 6 },
          { id: 'apprenticeCount', label: 'Apprentices on Site', type: 'number', defaultValue: 3 },
          { id: 'totalHoursWorked', label: 'Total Field Labor Hours', type: 'number', defaultValue: 72 },
          { id: 'equipmentOnSite', label: 'Active Equipment (Booms, Scissor Lifts, Trenchers)', type: 'text', defaultValue: '2x JLG 2632 Scissor Lifts, 1x Greenlee 555 CX Electric Bender, 1x Threader' },
        ],
      },
      {
        id: 'dlr-work-performed',
        title: '03 / Work Performed & Field Observations',
        fields: [
          { id: 'workPerformed', label: 'Work Executed Today (by Area & Milestone)', type: 'textarea', defaultValue: '1. Area A Level 2: Pulled 3,200 LF of 12 AWG circuit wiring through overhead conduit.\n2. Electrical Room 201: Terminated panelboard LP-2A; verified phase balance.\n3. Main Corridor: Installed emergency egress exit signs and tested battery backups.', required: true },
          { id: 'inspectionsVisitors', label: 'Official Inspections & Visitors', type: 'text', defaultValue: 'City Electrical Inspector on site 10:30 AM; rough-in inspection passed for Level 2.' },
          { id: 'delaysOrIssues', label: 'Delays, Disruptions or Obstructions Encountered', type: 'textarea', defaultValue: '45-minute delay on Level 2 West due to mechanical contractor testing ductwork in corridor.' },
          { id: 'safetyObservations', label: 'Daily Safety Audit & Observations', type: 'text', defaultValue: '100% PPE compliance verified. Zero near-misses or incidents recorded today.' },
        ],
      },
    ],
  },
  {
    id: 'res-site-inspection',
    slug: 'site-inspection-checklist',
    title: 'Site Quality & Inspection Checklist',
    code: 'PO-CHK-12',
    category: 'project-operations',
    categoryName: 'Project Operations',
    type: 'checklist',
    priority: 'P0',
    format: 'PDF · PRINT',
    estimatedTime: '15 Mins',
    standard: 'QA/QC Trade Protocol',
    typicalUse: 'Quality Assurance Walkthrough & Punchlist Mitigation',
    shortDescription: 'Structured quality audit verifying installation craftsmanship, code alignment, structural supports, clearances, and deficiency tracking before GC inspection.',
    fullDescription: 'Comprehensive quality control tool designed to inspect work prior to municipal or owner consultant inspections, minimizing punch list defects and preventing costly rework cycles.',
    disclaimer: 'Trade quality assurance checklist. Formal code acceptance is subject to inspection by the municipal Authority Having Jurisdiction (AHJ).',
    sections: [
      {
        id: 'insp-meta',
        title: '01 / Inspection Audit Context',
        fields: [
          { id: 'projectName', label: 'Project Name', type: 'text', defaultValue: 'DFW Tech Hub Building B', required: true },
          { id: 'areaInspected', label: 'Physical Area / Level', type: 'text', defaultValue: 'Level 3 East Wing Electrical Closets' },
          { id: 'inspectorName', label: 'Quality Control Lead', type: 'text', defaultValue: 'Marcus Vance' },
        ],
      },
    ],
    checklistItems: [
      { id: 'qi1', category: 'Supports & Anchors', requirement: 'Conduit runs secured within 3ft of boxes and every 10ft on center (NEC 358.30)', responsibleParty: 'Lead Journeyman', status: 'passed' },
      { id: 'qi2', category: 'Clearances', requirement: 'Dedicated 36-inch clear working space maintained in front of all panelboards (NEC 110.26)', responsibleParty: 'Foreman', status: 'passed' },
      { id: 'qi3', category: 'Grounding & Bonding', requirement: 'Equipment grounding conductors bonded to metal enclosures with approved ground screws', responsibleParty: 'Electrician', status: 'passed' },
      { id: 'qi4', category: 'Penetrations', requirement: 'Fire-stop caulking and UL-listed sleeves installed at all rated wall penetrations', responsibleParty: 'Apprentice', status: 'in_progress' },
      { id: 'qi5', category: 'Identification', requirement: 'Panel circuit directories typed and laminated with clear room-by-room descriptions', responsibleParty: 'Project Admin', status: 'in_progress' },
      { id: 'qi6', category: 'Torque Specifications', requirement: 'Main lug connections torqued to manufacturer specification with calibrated wrench', responsibleParty: 'Master Electrician', status: 'passed' },
    ],
  },
  {
    id: 'res-meeting-minutes',
    slug: 'site-meeting-minutes',
    title: 'Site Progress Meeting Minutes',
    code: 'PO-MIN-13',
    category: 'project-operations',
    categoryName: 'Project Operations',
    type: 'generator',
    priority: 'P1',
    format: 'PDF · DOCX · PRINT',
    estimatedTime: '15 Mins',
    standard: 'Commercial Project Administration',
    typicalUse: 'Weekly Coordination & Dispute Prevention',
    shortDescription: 'Professional meeting record capturing attendees, schedule reviews, submittal milestones, RFI statuses, change order disputes, and assigned action items.',
    fullDescription: 'Creates an indisputable audit trail of agreements, directives, and commitments made during owner-architect-contractor (OAC) and trade coordination meetings.',
    disclaimer: 'Administrative record of meeting proceedings. Attendees must submit written objections within 48 hours of distribution.',
    sections: [
      {
        id: 'min-header',
        title: '01 / Meeting Information & Attendees',
        fields: [
          { id: 'projectName', label: 'Project Name', type: 'text', defaultValue: 'Mercantile Center Tower 4', required: true },
          { id: 'meetingDate', label: 'Meeting Date & Time', type: 'text', defaultValue: 'September 4, 2026 at 10:00 AM' },
          { id: 'attendees', label: 'Key Attendees & Organizations', type: 'textarea', defaultValue: 'Marcus Vance (Vance Electric), Sarah Miller (Skiles GC), John Chen (Apex Mechanical), Robert Davis (Owner Rep)' },
        ],
      },
      {
        id: 'min-body',
        title: '02 / Discussion Topics & Project Status',
        fields: [
          { id: 'scheduleReview', label: 'Schedule Review & Milestones', type: 'textarea', defaultValue: 'Level 2 rough-in is 3 days ahead of baseline. Drywall hanging scheduled to commence Sept 18.' },
          { id: 'rfiSubmittals', label: 'Outstanding RFIs & Submittals', type: 'textarea', defaultValue: 'RFI #019 (transformer heat dissipation) is critical path. Architect committed to answer by Sept 6.' },
          { id: 'actionItems', label: 'Action Items & Responsible Owners', type: 'textarea', defaultValue: '1. Vance Electric to provide submittal for NEMA 4X exterior disconnects by Sept 8.\n2. Skiles GC to verify roof curb readiness for RTU electrical feed by Sept 10.' },
        ],
      },
    ],
  },
  {
    id: 'res-action-register',
    slug: 'project-action-register',
    title: 'Project Action & Issue Register',
    code: 'PO-REG-14',
    category: 'project-operations',
    categoryName: 'Project Operations',
    type: 'worksheet',
    priority: 'P1',
    format: 'XLSX · PDF · PRINT',
    estimatedTime: '10 Mins',
    standard: 'Project Control & Risk Standard',
    typicalUse: 'Open Items & Accountability Tracking',
    shortDescription: 'Dynamic log tracking action items, descriptions, assignees, priorities, due dates, current status, and verified close-out timestamps.',
    fullDescription: 'Keeps field and office teams aligned on open obligations, submittal reviews, procurement deliveries, and site coordination tasks before they cause project delays.',
    disclaimer: 'Project operational log. Regular status reviews should occur during weekly site progress meetings.',
    sections: [
      {
        id: 'reg-meta',
        title: '01 / Register Context',
        fields: [
          { id: 'projectName', label: 'Project Name', type: 'text', defaultValue: 'Baylor Scott & White Clinic Expansion', required: true },
          { id: 'manager', label: 'Project Manager', type: 'text', defaultValue: 'Marcus Vance' },
        ],
      },
    ],
    tableColumns: [
      { key: 'id', label: 'Action ID', width: '10%' },
      { key: 'description', label: 'Task / Open Item Description', width: '40%' },
      { key: 'owner', label: 'Responsible Owner', width: '20%' },
      { key: 'priority', label: 'Priority', width: '15%' },
      { key: 'status', label: 'Current Status', width: '15%' },
    ],
    defaultTableRows: [
      { id: 'ACT-01', description: 'Submit lighting control submittal package to electrical engineer', owner: 'M. Vance', priority: 'High', status: 'Closed' },
      { id: 'ACT-02', description: 'Schedule 811 underground utility locate before trenching east yard', owner: 'D. Ruiz', priority: 'High', status: 'In Progress' },
      { id: 'ACT-03', description: 'Procure 400A disconnect switch from Graybar with expedited freight', owner: 'Purchasing', priority: 'Medium', status: 'Open' },
      { id: 'ACT-04', description: 'Submit updated Certificate of Insurance for boom lift rental company', owner: 'Admin', priority: 'Low', status: 'Closed' },
    ],
  },
  {
    id: 'res-handover-checklist',
    slug: 'project-handover-checklist',
    title: 'Project Substantial Completion & Handover Checklist',
    code: 'PO-CHK-15',
    category: 'project-operations',
    categoryName: 'Project Operations',
    type: 'checklist',
    priority: 'P0',
    format: 'PDF · PRINT',
    estimatedTime: '15 Mins',
    standard: 'AIA G704 Aligned',
    typicalUse: 'Owner Turnover & Substantial Completion Sign-off',
    shortDescription: 'Verifies delivery of as-builts, O&M manuals, warranty certificates, owner training sessions, key turnover, and punch list clearances.',
    fullDescription: 'The final operational bridge between active construction and owner occupancy. Establishes the commencement date of contractual warranties and guarantees prompt retainage release.',
    disclaimer: 'Contract closeout checklist. Formal Certificate of Substantial Completion is typically prepared on AIA Document G704.',
    sections: [
      {
        id: 'hnd-meta',
        title: '01 / Turnover Identification',
        fields: [
          { id: 'projectName', label: 'Project Name', type: 'text', defaultValue: 'Arlington Logistics Hub #4', required: true },
          { id: 'ownerRep', label: 'Owner Representative / Facility Director', type: 'text', defaultValue: 'Thomas Bradley' },
          { id: 'handoverDate', label: 'Substantial Completion Date', type: 'date', defaultValue: '2026-09-04' },
        ],
      },
    ],
    checklistItems: [
      { id: 'h1', category: 'Documentation', requirement: 'Clean as-built redline drawings delivered to GC / Architect in CAD/PDF', responsibleParty: 'Project Manager', status: 'passed' },
      { id: 'h2', category: 'Manuals & Cut-sheets', requirement: 'Comprehensive O&M manuals for switchgear, panels, and lighting systems compiled', responsibleParty: 'Engineering Lead', status: 'passed' },
      { id: 'h3', category: 'Warranties', requirement: '1-year comprehensive contractor warranty letter executed on company letterhead', responsibleParty: 'Managing Principal', status: 'passed' },
      { id: 'h4', category: 'Training', requirement: 'Facility maintenance staff orientation and emergency shutdown training conducted', responsibleParty: 'Lead Technician', status: 'passed' },
      { id: 'h5', category: 'Spare Parts / Attic Stock', requirement: 'Specified attic stock (spare fuses, breaker handles, extra light fixtures) delivered & signed for', responsibleParty: 'Warehouse Lead', status: 'passed' },
      { id: 'h6', category: 'Punch List', requirement: 'Architect punch list verified 100% complete and signed off by lead inspector', responsibleParty: 'Superintendent', status: 'passed' },
    ],
  },

  // ─── 4. SUBCONTRACTOR MANAGEMENT ─────────────────────────────────────────
  {
    id: 'res-sub-prequal',
    slug: 'subcontractor-prequalification-questionnaire',
    title: 'Subcontractor Prequalification Questionnaire',
    code: 'SM-PRE-16',
    category: 'subcontractor-management',
    categoryName: 'Subcontractor Management',
    type: 'generator',
    priority: 'P0',
    format: 'PDF · DOCX · PRINT',
    estimatedTime: '20 Mins',
    standard: 'Trade Risk Management Standard',
    typicalUse: 'Lower-Tier Subcontractor Risk Assessment',
    shortDescription: 'Thorough pre-award vetting assessing corporate history, state license verification, insurance limits, safety statistics (EMR, OSHA citations), and references.',
    fullDescription: 'Enables general contractors and prime specialty contractors to evaluate the technical capacity, safety track record, financial stability, and legal integrity of prospective subcontractors before contract buyout.',
    disclaimer: 'Trade prequalification evaluation. Financial information remains confidential and proprietary to evaluating parties.',
    sections: [
      {
        id: 'sub-pre-corp',
        title: '01 / Subcontractor Corporate Identity',
        fields: [
          { id: 'subName', label: 'Subcontractor Company Name', type: 'text', defaultValue: 'Lone Star Low Voltage Solutions LLC', required: true },
          { id: 'tradeSpecialty', label: 'Trade Specialty', type: 'text', defaultValue: 'Structured Cabling, Access Control & CCTV' },
          { id: 'licenseNo', label: 'State Trade License Number', type: 'text', defaultValue: 'TX Security Board #B-194821' },
          { id: 'emrRating', label: 'Current Experience Modification Rate (EMR)', type: 'text', defaultValue: '0.82' },
        ],
      },
      {
        id: 'sub-pre-capacity',
        title: '02 / Capacity & Insurance Standing',
        fields: [
          { id: 'fullTimeCrew', label: 'Average Field Workforce Count', type: 'number', defaultValue: 14 },
          { id: 'maxProjectSize', label: 'Largest Completed Contract ($)', type: 'number', defaultValue: 450000 },
          { id: 'generalLiability', label: 'GL Policy Limit ($)', type: 'text', defaultValue: '$2,000,000 Aggregate' },
          { id: 'workersComp', label: 'Workers’ Compensation Statutory Policy', type: 'text', defaultValue: 'Statutory Limits ($1,000,000 Employer Liability)' },
        ],
      },
    ],
  },
  {
    id: 'res-sub-sow',
    slug: 'subcontractor-scope-of-work',
    title: 'Subcontractor Scope of Work Agreement',
    code: 'SM-SOW-17',
    category: 'subcontractor-management',
    categoryName: 'Subcontractor Management',
    type: 'generator',
    priority: 'P0',
    format: 'PDF · DOCX · PRINT',
    estimatedTime: '15 Mins',
    standard: 'Subcontract Addendum Standard',
    typicalUse: 'Trade Subcontract Buyout & Interface Control',
    shortDescription: 'Structured subcontract scope defining specific trade deliverables, materials furnished, equipment responsibilities, cleanup duties, and milestone dates.',
    fullDescription: 'One of the most commercially valuable documents in contracting. Explicitly divides responsibilities between prime contractor and subcontractor, eliminating backcharges, gap scopes, and site coordination clashes.',
    disclaimer: 'Subcontract scope attachment. Formally incorporated as Exhibit A into Prime-to-Subcontractor Trade Agreement.',
    sections: [
      {
        id: 'sub-sow-meta',
        title: '01 / Subcontract Identification',
        fields: [
          { id: 'subcontractorName', label: 'Subcontractor Name', type: 'text', defaultValue: 'Precision Trenching & Utilities Inc.', required: true },
          { id: 'primeContractor', label: 'Prime Contractor', type: 'text', defaultValue: 'Vance Commercial Electric LLC' },
          { id: 'contractValue', label: 'Agreed Subcontract Sum ($)', type: 'number', defaultValue: 28500, required: true },
        ],
      },
      {
        id: 'sub-sow-details',
        title: '02 / Trade Responsibilities & Exclusions',
        fields: [
          { id: 'subScope', label: 'Detailed Subcontractor Scope of Work', type: 'textarea', defaultValue: '1. Machine trenching 1,800 LF at 36” minimum cover depth per civil drawings.\n2. Furnish and place 4” sand bed bedding.\n3. Backfill and compact in 6” lifts to 95% standard proctor density.\n4. Haul off excess spoil to designated on-site spoil stockpile.', required: true },
          { id: 'subExclusions', label: 'Items Furnished by Prime Contractor (Excluded by Sub)', type: 'textarea', defaultValue: '1. Furnishing and laying PVC electrical conduits.\n2. Warning tracer tape.\n3. Utility company service connection fees.' },
          { id: 'scheduleMilestones', label: 'Mandatory Schedule Milestones', type: 'text', defaultValue: 'Commence: Sept 12, 2026. Substantial Completion: Sept 19, 2026.' },
        ],
      },
    ],
  },
  {
    id: 'res-sub-onboarding',
    slug: 'subcontractor-onboarding-checklist',
    title: 'Subcontractor Onboarding & Compliance Checklist',
    code: 'SM-CHK-18',
    category: 'subcontractor-management',
    categoryName: 'Subcontractor Management',
    type: 'checklist',
    priority: 'P0',
    format: 'PDF · PRINT',
    estimatedTime: '10 Mins',
    standard: 'Subcontract Compliance Protocol',
    typicalUse: 'Pre-Mobilization Audit & Legal Compliance Check',
    shortDescription: 'Verifies executed subcontract agreement, W-9 tax form, verified COI with Additional Insured endorsements, safety program, and worker site badges.',
    fullDescription: 'Protects the prime contractor by guaranteeing that no lower-tier worker sets foot on site without an active Certificate of Insurance, executed master subcontract, and verified safety induction.',
    disclaimer: 'Contractor pre-mobilization checklist. Tax documents like IRS Form W-9 must be verified against official IRS records.',
    sections: [
      {
        id: 'sub-onb-meta',
        title: '01 / Subcontractor Information',
        fields: [
          { id: 'subName', label: 'Subcontractor Name', type: 'text', defaultValue: 'Precision Trenching & Utilities Inc.', required: true },
          { id: 'projectName', label: 'Project Assigned', type: 'text', defaultValue: 'North Texas Logistics Hub' },
        ],
      },
    ],
    checklistItems: [
      { id: 'sb1', category: 'Contract Execution', requirement: 'Master Subcontract Agreement and Scope Exhibit signed by corporate officer', responsibleParty: 'Project Manager', status: 'passed' },
      { id: 'sb2', category: 'Tax Compliance', requirement: 'Current IRS Form W-9 (Request for Taxpayer Identification) signed & on file', responsibleParty: 'Accounting Dept', status: 'passed' },
      { id: 'sb3', category: 'Insurance Verification', requirement: 'Certificate of Insurance naming Prime & Owner as Additional Insured with Waiver of Subrogation', responsibleParty: 'Insurance Coordinator', status: 'passed' },
      { id: 'sb4', category: 'Licensing', requirement: 'Active state trade license and municipal registration verified through official licensing board', responsibleParty: 'Compliance Lead', status: 'passed' },
      { id: 'sb5', category: 'Safety Manual', requirement: 'Site-Specific Safety Plan or acknowledgment of Prime Contractor Safety Rules received', responsibleParty: 'Safety Director', status: 'passed' },
      { id: 'sb6', category: 'Site Induction', requirement: 'All sub field technicians completed mandatory on-site safety orientation and badge check', responsibleParty: 'Site Superintendent', status: 'passed' },
    ],
  },
  {
    id: 'res-sub-review',
    slug: 'subcontractor-performance-review',
    title: 'Subcontractor Post-Project Performance Review',
    code: 'SM-REV-19',
    category: 'subcontractor-management',
    categoryName: 'Subcontractor Management',
    type: 'form',
    priority: 'P1',
    format: 'DOCX · PDF · PRINT',
    estimatedTime: '10 Mins',
    standard: 'Vendor Evaluation Standard',
    typicalUse: 'Contractor Evaluation & Preferred Bidder Rating',
    shortDescription: 'Objective rating assessing craftsmanship quality, safety compliance, schedule adherence, communication, change order fairness, and future tender recommendation.',
    fullDescription: 'Establishes internal operational memory by scoring subcontractor reliability across six core metrics, ensuring prime contractors build relationships with elite trade partners.',
    disclaimer: 'Internal contractor evaluation record. Used solely for vendor qualification and tender selection governance.',
    sections: [
      {
        id: 'sub-rev-meta',
        title: '01 / Project & Trade Evaluation',
        fields: [
          { id: 'subName', label: 'Subcontractor Evaluated', type: 'text', defaultValue: 'Lone Star Low Voltage Solutions LLC', required: true },
          { id: 'projectName', label: 'Completed Project', type: 'text', defaultValue: 'Methodist Ambulatory Center' },
          { id: 'finalContractValue', label: 'Final Contract Value ($)', type: 'number', defaultValue: 64500 },
          { id: 'evaluator', label: 'Evaluator / Project Manager', type: 'text', defaultValue: 'Marcus Vance' },
        ],
      },
      {
        id: 'sub-rev-scores',
        title: '02 / Performance Metric Ratings (1 to 5 Scale)',
        fields: [
          { id: 'qualityScore', label: 'Quality of Craftsmanship & Workmanship (1-5)', type: 'select', defaultValue: '5', options: ['5 - Exceptional (Zero defects)', '4 - Above Average', '3 - Acceptable', '2 - Needs Improvement', '1 - Unacceptable'] },
          { id: 'safetyScore', label: 'Safety Compliance & Housekeeping (1-5)', type: 'select', defaultValue: '5', options: ['5 - Exceptional (Zero defects)', '4 - Above Average', '3 - Acceptable', '2 - Needs Improvement', '1 - Unacceptable'] },
          { id: 'scheduleScore', label: 'Schedule Adherence & Crew Capacity (1-5)', type: 'select', defaultValue: '4', options: ['5 - Exceptional (Zero defects)', '4 - Above Average', '3 - Acceptable', '2 - Needs Improvement', '1 - Unacceptable'] },
          { id: 'rehireRecommendation', label: 'Recommend for Future Commercial Tenders?', type: 'select', defaultValue: 'Yes - Preferred Tier-1 Partner', options: ['Yes - Preferred Tier-1 Partner', 'Yes - With Supervision', 'Do Not Bid / Remove from Registry'] },
        ],
      },
    ],
  },

  // ─── 5. SAFETY & COMPLIANCE ───────────────────────────────────────────────
  {
    id: 'res-safety-inspection',
    slug: 'site-safety-inspection',
    title: 'Site Safety Audit & OSHA Compliance Inspection',
    code: 'SC-SAF-20',
    category: 'safety-compliance',
    categoryName: 'Safety & Compliance',
    type: 'checklist',
    priority: 'P0',
    format: 'PDF · PRINT',
    estimatedTime: '15 Mins',
    standard: 'OSHA 29 CFR 1926 Aligned',
    typicalUse: 'Weekly Jobsite Safety Walk & Risk Prevention',
    shortDescription: 'Jobsite safety audit covering access fencing, 100% PPE enforcement, fall protection, electrical GFCI protection, ladder security, excavation shoring, and SDS records.',
    fullDescription: 'Structured field audit aligned with federal OSHA construction standards (29 CFR 1926). Enforces zero-tolerance safety standards, identifies physical hazards, and assigns corrective action deadlines.',
    disclaimer: 'Safety inspection documentation record. Does not certify statutory immunity from federal OSHA or state regulatory enforcement.',
    sections: [
      {
        id: 'saf-insp-meta',
        title: '01 / Audit Context',
        fields: [
          { id: 'projectName', label: 'Project / Jobsite', type: 'text', defaultValue: 'DFW Logistics Phase 3', required: true },
          { id: 'safetyAuditor', label: 'Competent Person / Safety Lead', type: 'text', defaultValue: 'Marcus Vance, OSHA 30-Hour' },
          { id: 'auditDate', label: 'Inspection Date', type: 'date', defaultValue: '2026-09-04' },
        ],
      },
    ],
    checklistItems: [
      { id: 's1', category: 'PPE Enforcement', requirement: '100% hard hats (ANSI Z89.1), safety glasses (Z87.1), and safety boots worn by all site personnel', responsibleParty: 'All Personnel', status: 'passed' },
      { id: 's2', category: 'Fall Protection', requirement: 'Guardrails installed on all open decks > 6ft; harnesses and 100% tie-off verified on aerial lifts', responsibleParty: 'Superintendent', status: 'passed' },
      { id: 's3', category: 'Electrical Safety', requirement: 'All extension cords inspected with ground pins intact; portable GFCI pigtails in use', responsibleParty: 'Lead Electrician', status: 'passed' },
      { id: 's4', category: 'Housekeeping & Egress', requirement: 'Walkways, stairs, and exit doors cleared of debris, cords, and staged pallet obstructions', responsibleParty: 'Labor Crew', status: 'passed' },
      { id: 's5', category: 'Ladders & Scaffolding', requirement: 'Ladders tied off at top and extending 3ft above landing; daily scaffold inspection tag green', responsibleParty: 'Foreman', status: 'passed' },
      { id: 's6', category: 'Hazard Communication', requirement: 'Safety Data Sheets (SDS) binder accessible in site gangbox; chemical containers labeled', responsibleParty: 'Safety Officer', status: 'passed' },
      { id: 's7', category: 'Emergency Ready', requirement: 'Inspected 10lb ABC fire extinguishers mounted at 50ft intervals; first aid kit stocked', responsibleParty: 'Safety Officer', status: 'passed' },
    ],
  },
  {
    id: 'res-toolbox-talk',
    slug: 'safety-meeting-toolbox-talk-record',
    title: 'Safety Meeting / Toolbox Talk Roster',
    code: 'SC-TBT-21',
    category: 'safety-compliance',
    categoryName: 'Safety & Compliance',
    type: 'form',
    priority: 'P0',
    format: 'PDF · PRINT',
    estimatedTime: '8 Mins',
    standard: 'OSHA 29 CFR 1926.21 Aligned',
    typicalUse: 'Weekly Crew Safety Briefing & Audit Trail',
    shortDescription: 'Weekly safety briefing record capturing topic, project context, key hazard controls discussed, worker discussion points, and signed crew attendance roster.',
    fullDescription: 'Documents mandatory ongoing workforce safety instruction required by OSHA 29 CFR 1926.21. Creates signed, contemporaneous proof of safety training during audits or incident investigations.',
    disclaimer: 'Workforce safety training record. Signed attendance records must be archived in company safety ledger for a minimum of three years.',
    sections: [
      {
        id: 'tbt-header',
        title: '01 / Briefing Details & Topic',
        fields: [
          { id: 'topic', label: 'Safety Topic Discussed', type: 'text', defaultValue: 'NFPA 70E Arc Flash Safety & De-Energization Protocols', required: true },
          { id: 'projectName', label: 'Project / Site Name', type: 'text', defaultValue: 'Presbyterian Hospital Medical Wing' },
          { id: 'presenter', label: 'Competent Person / Presenter', type: 'text', defaultValue: 'Marcus Vance' },
          { id: 'meetingDate', label: 'Briefing Date', type: 'date', defaultValue: '2026-09-04' },
        ],
      },
      {
        id: 'tbt-points',
        title: '02 / Core Hazards & Control Measures Covered',
        fields: [
          { id: 'keyPoints', label: 'Summary of Key Points & Controls Discussed', type: 'textarea', defaultValue: '1. Absolute prohibition on live electrical work without approved Energized Electrical Work Permit.\n2. Lockout/Tagout (LOTO): Individual locks and tags mandatory on all feeder breakers.\n3. Live-dead-live meter verification mandatory prior to touching any busbar or conductor.\n4. Required PPE: Category 2 arc flash face shield, 8 cal/cm² jacket, Class 0 rubber gloves.' },
        ],
      },
    ],
  },
  {
    id: 'res-incident-report',
    slug: 'contractor-incident-report',
    title: 'Contractor Jobsite Incident Report',
    code: 'SC-INC-22',
    category: 'safety-compliance',
    categoryName: 'Safety & Compliance',
    type: 'generator',
    priority: 'P0',
    format: 'PDF · DOCX · PRINT',
    estimatedTime: '15 Mins',
    standard: 'OSHA 301 / Insurance Standard',
    typicalUse: 'Immediate Post-Incident Fact Finding',
    shortDescription: 'Contemporaneous incident log recording exact date/time, individuals involved, factual sequence of events, immediate response, root cause, and corrective prevention.',
    fullDescription: 'Standardized factual incident record designed to capture contemporaneous eyewitness statements, injury or equipment damage details, immediate medical response, and corrective measures without assigning speculative liability.',
    disclaimer: 'Internal incident documentation tool. Does not replace statutory reporting obligations to OSHA (within 8 hours for fatalities / 24 hours for in-patient hospitalizations) or insurance workers’ compensation notices.',
    sections: [
      {
        id: 'inc-meta',
        title: '01 / Incident Timing & Location',
        fields: [
          { id: 'incidentDate', label: 'Date & Time of Occurrence', type: 'text', defaultValue: '2026-09-04 at 2:15 PM', required: true },
          { id: 'projectName', label: 'Project Name & Exact Location', type: 'text', defaultValue: 'Centennial Tower, Level 4 Electrical Closet #402', required: true },
          { id: 'incidentType', label: 'Classification', type: 'select', defaultValue: 'Property Damage / Equipment Incident', options: ['First Aid Only (Minor)', 'Medical Treatment (Recordable)', 'Property / Equipment Damage', 'Near-Miss Observation'] },
        ],
      },
      {
        id: 'inc-facts',
        title: '02 / Factual Description & Corrective Measures',
        fields: [
          { id: 'description', label: 'Factual Sequence of Events (Eyewitness Details)', type: 'textarea', defaultValue: 'While hoisting a 400A disconnect switch using a material lift, the unit slipped from rigging and fell 4 feet onto concrete floor. Enclosure door dented; zero injuries; zero personnel in exclusion zone.', required: true },
          { id: 'immediateAction', label: 'Immediate Action Taken', type: 'textarea', defaultValue: 'Work halted immediately. Area cordoned off. Damaged disconnect tagged out of service. Superintendent notified.' },
          { id: 'correctiveAction', label: 'Corrective Action to Prevent Recurrence', type: 'textarea', defaultValue: 'Rigging straps retrained with crew. Material lift load rating re-verified before next hoist.' },
        ],
      },
    ],
  },
  {
    id: 'res-emergency-sheet',
    slug: 'site-emergency-information-sheet',
    title: 'Site Emergency Information Sheet',
    code: 'SC-EME-23',
    category: 'safety-compliance',
    categoryName: 'Safety & Compliance',
    type: 'template',
    priority: 'P0',
    format: 'PDF · PRINT',
    estimatedTime: '5 Mins',
    standard: 'OSHA 1926.35 Aligned',
    typicalUse: 'High-Visibility Jobsite Safety Posting',
    shortDescription: 'One-page high-visibility site posting displaying verified 911 address, nearest hospital with emergency room, site coordinator mobile numbers, and utility shutoffs.',
    fullDescription: 'An essential high-contrast jobsite emergency placard engineered for prominent posting inside gang boxes, site trailers, and main entrance gates. Enables any worker or first responder to locate critical contacts, muster points, and utility disconnects instantly.',
    disclaimer: 'Jobsite emergency posting. Information must be audited and physically posted at site entrances prior to commencement of field work.',
    sections: [
      {
        id: 'eme-location',
        title: '01 / Site Physical Address (for 911 Dispatch)',
        fields: [
          { id: 'siteAddress', label: 'Exact Jobsite 911 Address & Cross Streets', type: 'text', defaultValue: '4400 South Interstate 35 (Cross: Airport Rd), Denton, TX 76207', required: true },
          { id: 'nearestHospital', label: 'Nearest Emergency Hospital & Address', type: 'text', defaultValue: 'Texas Health Presbyterian Hospital Denton, 3000 N I-35, Denton, TX 76201 (Tel: 940-898-7000)', required: true },
          { id: 'siteMusterPoint', label: 'Designated Site Evacuation Assembly Point', type: 'text', defaultValue: 'North Perimeter Parking Lot A (by Gate 1 Flagpole)', required: true },
        ],
      },
      {
        id: 'eme-contacts',
        title: '02 / Critical Contacts & Utility Disconnects',
        fields: [
          { id: 'siteSafetyLeadPhone', label: 'Site Safety Coordinator (Name & Mobile)', type: 'text', defaultValue: 'Marcus Vance: (214) 555-0182' },
          { id: 'gcSuperintendentPhone', label: 'GC General Superintendent (Name & Mobile)', type: 'text', defaultValue: 'Greg Mitchell: (817) 555-0194' },
          { id: 'gasShutoff', label: 'Natural Gas Main Shutoff Location', type: 'text', defaultValue: 'Meter bank at East exterior foundation wall' },
          { id: 'waterShutoff', label: 'Main Domestic Water Shutoff Location', type: 'text', defaultValue: 'Vault curb box 15ft north of primary gate entrance' },
          { id: 'electricShutoff', label: 'Main Electrical Disconnect Location', type: 'text', defaultValue: 'Utility switchgear pad #1 at southwest perimeter fence' },
        ],
      },
    ],
  },

  // ─── 6. BUSINESS ADMINISTRATION ───────────────────────────────────────────
  {
    id: 'res-project-startup',
    slug: 'contractor-project-startup-checklist',
    title: 'Contractor Project Startup Checklist',
    code: 'BA-STU-24',
    category: 'business-administration',
    categoryName: 'Business Administration',
    type: 'checklist',
    priority: 'P0',
    format: 'PDF · PRINT',
    estimatedTime: '15 Mins',
    standard: 'Commercial Project Mobilization Standard',
    typicalUse: 'Pre-Construction Mobilization & Risk Lockdown',
    shortDescription: 'Comprehensive mobilization audit verifying contract execution, Notice to Proceed, building permits, utility markouts, insurance binders, and long-lead orders.',
    fullDescription: 'Governs the transition from winning a commercial contract to executing field mobilization. Assures all contractual, financial, municipal, and procurement dependencies are verified before mobilizing equipment and labor.',
    disclaimer: 'Operational mobilization checklist. Ensure all municipal permits and utility mark-out tickets are physically on site before ground disturbance.',
    sections: [
      {
        id: 'stu-meta',
        title: '01 / Mobilization Context',
        fields: [
          { id: 'projectName', label: 'Project Name', type: 'text', defaultValue: 'Texas Health Orthopedic Clinic', required: true },
          { id: 'gcName', label: 'General Contractor', type: 'text', defaultValue: 'Skiles Group Construction' },
          { id: 'mobilizationDate', label: 'Target Mobilization Date', type: 'date', defaultValue: '2026-09-15' },
        ],
      },
    ],
    checklistItems: [
      { id: 'st1', category: 'Contracts & Approvals', requirement: 'Subcontract Agreement and Exhibits executed by both corporate parties', responsibleParty: 'Executive Team', status: 'passed' },
      { id: 'st2', category: 'Contracts & Approvals', requirement: 'Formal written Notice to Proceed (NTP) received from General Contractor / Owner', responsibleParty: 'Project Manager', status: 'passed' },
      { id: 'st3', category: 'Permits & Regulatory', requirement: 'City trade permits posted on site trailer; municipal inspection card mounted', responsibleParty: 'Permit Coordinator', status: 'passed' },
      { id: 'st4', category: 'Utility Safety', requirement: 'Texas 811 underground utility locate ticket active with clear paint/flag markings', responsibleParty: 'Superintendent', status: 'passed' },
      { id: 'st5', category: 'Procurement', requirement: 'Long-lead switchgear, panels, and transformers submittals approved and factory ship dates confirmed', responsibleParty: 'Procurement Lead', status: 'passed' },
      { id: 'st6', category: 'Site Logistics', requirement: 'Jobsite trailer, material storage container, and temporary power connections established', responsibleParty: 'Field Foreman', status: 'in_progress' },
      { id: 'st7', category: 'Financial Baseline', requirement: 'Schedule of Values submitted and approved in GC billing portal for future pay applications', responsibleParty: 'Accounting Dept', status: 'passed' },
    ],
  },
  {
    id: 'res-project-closeout',
    slug: 'project-closeout-checklist',
    title: 'Commercial Project Closeout & Retainage Checklist',
    code: 'BA-CLS-25',
    category: 'business-administration',
    categoryName: 'Business Administration',
    type: 'checklist',
    priority: 'P0',
    format: 'PDF · PRINT',
    estimatedTime: '15 Mins',
    standard: 'AIA Commercial Closeout Protocol',
    typicalUse: 'Final Pay Application & Retainage Release',
    shortDescription: 'Final closeout audit covering punch list sign-off, Certificate of Occupancy, as-builts, warranties, unconditional final lien waivers, and retainage release.',
    fullDescription: 'The definitive financial and legal closeout instrument for commercial contractors. Secures the final 5% or 10% retainage milestone by systematically assembling every required closeout submittal.',
    disclaimer: 'Contract closeout checklist. Unconditional final lien waivers should only be delivered simultaneously with or after receipt of cleared retainage funds.',
    sections: [
      {
        id: 'cls-meta',
        title: '01 / Closeout Context',
        fields: [
          { id: 'projectName', label: 'Project Name', type: 'text', defaultValue: 'Plano Tech Center Phase II', required: true },
          { id: 'retainageAmount', label: 'Final Retainage Balance Due ($)', type: 'number', defaultValue: 14250 },
          { id: 'closeoutDate', label: 'Target Final Billing Date', type: 'date', defaultValue: '2026-09-30' },
        ],
      },
    ],
    checklistItems: [
      { id: 'cl1', category: 'Inspections & Punchlist', requirement: 'All architect, engineer, and owner punch list items completed and verified in writing', responsibleParty: 'Superintendent', status: 'passed' },
      { id: 'cl2', category: 'Inspections & Punchlist', requirement: 'Final municipal electrical inspection passed and permanent power authorized', responsibleParty: 'Lead Electrician', status: 'passed' },
      { id: 'cl3', category: 'Deliverables', requirement: 'Electronic as-built markups (CAD / PDF) delivered and acknowledged by GC', responsibleParty: 'Project Engineer', status: 'passed' },
      { id: 'cl4', category: 'Deliverables', requirement: 'Operation & Maintenance (O&M) manuals and equipment warranty certificates bound and delivered', responsibleParty: 'Project Admin', status: 'passed' },
      { id: 'cl5', category: 'Lien Releases', requirement: 'Final unconditional lien releases gathered from all second-tier suppliers and sub-subcontractors', responsibleParty: 'Accounting Dept', status: 'in_progress' },
      { id: 'cl6', category: 'Final Billing', requirement: 'Final Pay Application for 100% retainage release submitted with all required closeout attachments', responsibleParty: 'Finance Director', status: 'in_progress' },
      { id: 'cl7', category: 'Demobilization', requirement: 'Jobsite trailer, equipment rentals, tooling, and surplus inventory demobilized and reconciled', responsibleParty: 'Warehouse Lead', status: 'passed' },
    ],
  },
];

export function getResourceBySlug(slug: string): ContractorResource | undefined {
  return CONTRACTOR_RESOURCES.find((r) => r.slug === slug);
}

export function getResourcesByCategory(category: ResourceCategory): ContractorResource[] {
  return CONTRACTOR_RESOURCES.filter((r) => r.category === category);
}

export function getResourcesByType(type: ResourceType): ContractorResource[] {
  return CONTRACTOR_RESOURCES.filter((r) => r.type === type);
}
