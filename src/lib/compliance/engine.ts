import { RequirementType, RequirementState } from '@/types/database';

export interface EvaluatedRequirement {
  id: string;
  requirementCode: string;
  title: string;
  description: string;
  type: RequirementType;
  state: RequirementState;
  sourceName?: string;
  sourceUrl?: string;
  effectiveDate?: string;
  readinessWeight: number;
  evidenceId?: string;
  evidenceName?: string;
  expiresAt?: string;
  daysRemaining?: number;
  actionLabel: string;
  actionHref: string;
  actionDescription: string;
  notes?: string;
}

export interface ContractorComplianceContext {
  stateCode?: string;
  trades: string[]; // trade slugs
  employeeCount: number;
  hasGeneralLiability: boolean;
  glExpiresAt?: string;
  glDocumentId?: string;
  glDocumentName?: string;
  hasWorkersComp: boolean;
  wcExpiresAt?: string;
  wcDocumentId?: string;
  wcDocumentName?: string;
  isSoleProprietorNoEmployees: boolean;
  hasTradeLicense: boolean;
  licenseNumber?: string;
  licenseExpiresAt?: string;
  licenseDocumentId?: string;
  licenseDocumentName?: string;
  isLicenseVerified: boolean;
  hasWrittenSafetyPlan: boolean;
  safetyPlanDocumentId?: string;
  safetyPlanDocumentName?: string;
  hasActiveJha: boolean;
  jhaDocumentId?: string;
  jhaDocumentName?: string;
  hasRecentToolboxTalk: boolean;
  toolboxTalkDate?: string;
  hasOshaSupervisorCard: boolean;
  oshaSupervisorCount: number;
}

/**
 * Calculates days remaining until a given expiration date.
 */
export function calculateDaysRemaining(expiresAt?: string | null): number | undefined {
  if (!expiresAt) return undefined;
  const target = new Date(expiresAt).getTime();
  const now = new Date().getTime();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

/**
 * Derives the operational requirement state based on evidence and expiration dates.
 */
export function deriveRequirementState(
  hasEvidence: boolean,
  expiresAt?: string,
  isNotApplicable: boolean = false,
  needsReview: boolean = false
): RequirementState {
  if (isNotApplicable) return 'not_applicable';
  if (needsReview) return 'needs_review';
  if (!hasEvidence) return 'missing';

  if (!expiresAt) return 'current';

  const daysRemaining = calculateDaysRemaining(expiresAt);
  if (daysRemaining === undefined) return 'current';
  if (daysRemaining < 0) return 'expired';
  if (daysRemaining <= 60) return 'expiring';
  return 'current';
}

/**
 * Contextual Requirement Evaluator
 * 
 * Evaluates requirements across the 4 authoritative categories:
 * 1. Legal / Regulatory Requirement (OSHA, State Licensing Boards)
 * 2. Industry / Standards Requirement (NFPA, ANSI, ASSP)
 * 3. Client / Prequalification Requirement (Commercial Project Specs)
 * 4. Avorria Readiness Criterion (Platform Operational Checklist)
 */
export function evaluateContractorRequirements(
  ctx: ContractorComplianceContext
): EvaluatedRequirement[] {
  const requirements: EvaluatedRequirement[] = [];

  // ---------------------------------------------------------------------------
  // 1. LEGAL / REGULATORY REQUIREMENTS
  // ---------------------------------------------------------------------------

  // Workers' Compensation (Statutory State Mandate)
  const wcNotApplicable = ctx.employeeCount === 1 && ctx.isSoleProprietorNoEmployees;
  const wcState = deriveRequirementState(
    ctx.hasWorkersComp,
    ctx.wcExpiresAt,
    wcNotApplicable
  );
  requirements.push({
    id: 'legal_workers_comp',
    requirementCode: 'LEG-WC-01',
    title: 'Statutory Workers’ Compensation Coverage',
    description: wcNotApplicable
      ? 'Sole proprietorship without employees. Statutory Workers’ Comp is not legally mandated, though commercial clients may require an exemption certificate.'
      : 'Mandatory state statutory insurance providing wage replacement and medical benefits to employees injured on the job.',
    type: 'legal_regulatory',
    state: wcState,
    sourceName: ctx.stateCode ? `${ctx.stateCode} Department of Insurance / Workers' Comp Commission` : 'State Workers’ Compensation Law',
    sourceUrl: 'https://www.dol.gov/agencies/owcp',
    effectiveDate: '2026-01-01',
    readinessWeight: 10,
    evidenceId: ctx.wcDocumentId,
    evidenceName: ctx.wcDocumentName,
    expiresAt: ctx.wcExpiresAt,
    daysRemaining: calculateDaysRemaining(ctx.wcExpiresAt),
    actionLabel: wcNotApplicable ? 'Review Exemption' : ctx.hasWorkersComp ? 'Update WC Policy' : 'Upload WC Policy',
    actionHref: '/app/documents',
    actionDescription: wcNotApplicable
      ? 'Confirm your sole proprietorship statutory exemption on file.'
      : 'Upload current statutory Workers’ Compensation insurance policy certificate.',
  });

  // State Trade Licensing (Statutory Board Requirement)
  const isLicensedTrade = ctx.trades.some((t) =>
    ['electrical-contracting', 'hvac-mechanical', 'commercial-plumbing', 'general-contracting', 'commercial-roofing'].includes(t)
  );
  const licenseState = isLicensedTrade
    ? deriveRequirementState(ctx.hasTradeLicense, ctx.licenseExpiresAt, false, !ctx.isLicenseVerified && ctx.hasTradeLicense)
    : 'not_applicable';

  requirements.push({
    id: 'legal_trade_license',
    requirementCode: 'LEG-LIC-01',
    title: 'State Contractor / Specialty Trade License',
    description: isLicensedTrade
      ? `Mandatory state licensing for ${ctx.trades.join(', ')} under state contractor regulation statutes.`
      : 'Specialty scopes where state licensing is verified at the local/county municipal level rather than a state board.',
    type: 'legal_regulatory',
    state: licenseState,
    sourceName: ctx.stateCode === 'TX' ? 'Texas Department of Licensing & Regulation (TDLR)' : 'State Contractor Licensing Board',
    sourceUrl: 'https://www.tdlr.texas.gov',
    effectiveDate: '2026-01-01',
    readinessWeight: 15,
    evidenceId: ctx.licenseDocumentId,
    evidenceName: ctx.licenseDocumentName,
    expiresAt: ctx.licenseExpiresAt,
    daysRemaining: calculateDaysRemaining(ctx.licenseExpiresAt),
    actionLabel: ctx.hasTradeLicense ? 'Review License' : 'Add State License',
    actionHref: '/app/business',
    actionDescription: 'Record active state trade license registration and renewal dates.',
  });

  // OSHA Hazard Communication Program (29 CFR 1926.59 / 1910.1200)
  const hasChemicalTrades = ctx.trades.some((t) =>
    ['commercial-roofing', 'painting-wallcoverings', 'concrete-masonry', 'commercial-plumbing'].includes(t)
  );
  requirements.push({
    id: 'legal_osha_hazcom',
    requirementCode: 'LEG-OSHA-HAZCOM',
    title: 'Written Hazard Communication (HAZCOM) Program',
    description: 'Federal OSHA standard requiring written chemical inventory, safety data sheet (SDS) accessibility, and chemical hazard training.',
    type: 'legal_regulatory',
    state: hasChemicalTrades ? (ctx.hasWrittenSafetyPlan ? 'current' : 'missing') : 'needs_review',
    sourceName: 'Occupational Safety and Health Administration (OSHA 29 CFR 1926.59)',
    sourceUrl: 'https://www.osha.gov/hazcom',
    effectiveDate: '2026-01-01',
    readinessWeight: 5,
    evidenceId: ctx.safetyPlanDocumentId,
    evidenceName: ctx.safetyPlanDocumentName,
    actionLabel: ctx.hasWrittenSafetyPlan ? 'View HAZCOM Section' : 'Create Safety Plan',
    actionHref: '/app/documents/create/jha',
    actionDescription: 'Include Hazard Communication and SDS management procedures in your written safety plan.',
  });

  // ---------------------------------------------------------------------------
  // 2. INDUSTRY / STANDARDS REQUIREMENTS
  // ---------------------------------------------------------------------------

  // NFPA 70E Arc Flash Electrical Safety Standard
  const isElectrical = ctx.trades.includes('electrical-contracting') || ctx.trades.includes('hvac-mechanical');
  requirements.push({
    id: 'ind_nfpa_70e',
    requirementCode: 'STD-NFPA-70E',
    title: 'NFPA 70E Electrical Workplace Safety Standard',
    description: isElectrical
      ? 'Industry standard for electrical safety in the workplace, establishing arc flash boundaries, de-energization procedures, and PPE categories.'
      : 'Standard applies when personnel work on or near energized electrical equipment.',
    type: 'industry_standard',
    state: isElectrical ? (ctx.hasActiveJha ? 'current' : 'needs_review') : 'not_applicable',
    sourceName: 'National Fire Protection Association (NFPA 70E)',
    sourceUrl: 'https://www.nfpa.org/70E',
    readinessWeight: 10,
    actionLabel: ctx.hasActiveJha ? 'View Electrical JHA' : 'Generate Electrical JHA',
    actionHref: '/app/documents/create/jha',
    actionDescription: 'Conduct a task Job Hazard Analysis documenting shock and arc flash boundaries.',
  });

  // Fall Protection Program (ANSI/ASSP Z359)
  const isFallTrade = ctx.trades.some((t) =>
    ['commercial-roofing', 'carpentry-framing', 'painting-wallcoverings', 'general-contracting'].includes(t)
  );
  requirements.push({
    id: 'ind_fall_protection',
    requirementCode: 'STD-FALL-PROT',
    title: 'Comprehensive Fall Protection Program (ANSI/ASSP Z359)',
    description: isFallTrade
      ? 'Consensus safety standard for fall arrest systems, harness inspections, leading-edge work, and rescue plans at heights exceeding 6 feet.'
      : 'Recommended practice when working on ladders, elevated platforms, or scaffolding.',
    type: 'industry_standard',
    state: isFallTrade ? (ctx.hasWrittenSafetyPlan ? 'current' : 'missing') : 'not_applicable',
    sourceName: 'American National Standards Institute (ANSI/ASSP Z359)',
    sourceUrl: 'https://www.assp.org',
    readinessWeight: 10,
    actionLabel: ctx.hasWrittenSafetyPlan ? 'View Safety Plan' : 'Upload Safety Plan',
    actionHref: '/app/documents',
    actionDescription: 'Ensure your safety program specifies 100% tie-off rules and daily harness inspection.',
  });

  // ---------------------------------------------------------------------------
  // 3. CLIENT / PREQUALIFICATION REQUIREMENTS
  // ---------------------------------------------------------------------------

  // Commercial General Liability ($1M / $2M Limit Standard)
  const glState = deriveRequirementState(ctx.hasGeneralLiability, ctx.glExpiresAt);
  requirements.push({
    id: 'client_general_liability',
    requirementCode: 'CLT-GL-01',
    title: 'Commercial General Liability ($1M / $2M COI)',
    description: 'Standard commercial pre-qualification specification required by general contractors and property managers before entering job sites.',
    type: 'client_prequal',
    state: glState,
    sourceName: 'Associated General Contractors (AGC) Standard Subcontract Terms',
    readinessWeight: 15,
    evidenceId: ctx.glDocumentId,
    evidenceName: ctx.glDocumentName,
    expiresAt: ctx.glExpiresAt,
    daysRemaining: calculateDaysRemaining(ctx.glExpiresAt),
    actionLabel: ctx.hasGeneralLiability ? 'Update COI' : 'Upload Insurance COI',
    actionHref: '/app/documents',
    actionDescription: 'Upload your current Certificate of Insurance (ACORD 25) with minimum $1,000,000 / $2,000,000 limits.',
  });

  // Supervisor OSHA 30-Hour Training Card
  requirements.push({
    id: 'client_osha_supervisor',
    requirementCode: 'CLT-OSHA-30',
    title: 'Supervisory OSHA 30-Hour Construction Card',
    description: 'Commercial owner and general contractor site access requirement designating a competent safety lead on site.',
    type: 'client_prequal',
    state: ctx.hasOshaSupervisorCard ? 'current' : 'needs_review',
    sourceName: 'Commercial Project Owner & General Contractor Prequalification Specifications',
    readinessWeight: 10,
    actionLabel: ctx.hasOshaSupervisorCard ? 'View Card Record' : 'Record OSHA Training',
    actionHref: '/app/compliance',
    actionDescription: 'Record supervisory staff who hold active OSHA 30-hour training cards.',
  });

  // ---------------------------------------------------------------------------
  // 4. AVORRIA READINESS CRITERIA (Platform Operational Checklist)
  // ---------------------------------------------------------------------------

  // Documented Site-Specific Job Hazard Analysis (JHA) Process
  requirements.push({
    id: 'avorria_jha_process',
    requirementCode: 'AV-READY-JHA',
    title: 'Documented Job Hazard Analysis (JHA) Process',
    description: 'Avorria operational readiness standard: Task-specific hazard identification, hierarchy of controls, and required PPE before work commencement.',
    type: 'avorria_readiness',
    state: ctx.hasActiveJha ? 'current' : 'missing',
    sourceName: 'Avorria Operational Readiness Framework',
    readinessWeight: 15,
    evidenceId: ctx.jhaDocumentId,
    evidenceName: ctx.jhaDocumentName,
    actionLabel: ctx.hasActiveJha ? 'View Active JHA' : 'Create First JHA',
    actionHref: '/app/documents/create/jha',
    actionDescription: 'Use Avorria to generate and finalize a site-specific Job Hazard Analysis.',
  });

  // Ongoing Toolbox Talks & Crew Safety Attendance Log
  requirements.push({
    id: 'avorria_toolbox_talks',
    requirementCode: 'AV-READY-TALKS',
    title: 'Toolbox Talk Field Briefing Roster',
    description: 'Avorria operational readiness standard: Documented safety meetings conducted with signed attendance rosters within the last 30 days.',
    type: 'avorria_readiness',
    state: ctx.hasRecentToolboxTalk ? 'current' : 'needs_review',
    sourceName: 'Avorria Operational Readiness Framework',
    readinessWeight: 10,
    actionLabel: ctx.hasRecentToolboxTalk ? 'View Meeting Logs' : 'Log Toolbox Talk',
    actionHref: '/app/compliance',
    actionDescription: 'Document weekly or monthly safety meetings to maintain workforce safety readiness.',
  });

  return requirements;
}
