/**
 * AVORRIA CONTRACTOR READINESS SCORE ENGINE
 * 
 * IMPORTANT COMPLIANCE & LEGAL NOTICE:
 * This score measures internal completion against Avorria's structured
 * professional contractor checklist.
 * 
 * It DOES NOT certify legal safety, statutory compliance, or governmental approval.
 * It is an operational and credibility metric calculated on verifiable platform criteria.
 */

export interface ReadinessCriterion {
  id: string;
  category: 'business_identity' | 'insurance' | 'licensing' | 'safety' | 'workforce';
  name: string;
  description: string;
  weight: number; // Sum of weights = 100
  checkFn: (data: ContractorReadinessInput) => boolean;
}

export interface ContractorReadinessInput {
  hasLegalName: boolean;
  hasEinOrTaxId: boolean;
  hasBusinessAddress: boolean;
  hasGeneralLiability: boolean;
  isGeneralLiabilityActive: boolean;
  hasWorkersCompOrExemption: boolean;
  hasActiveTradeLicense: boolean;
  isLicenseVerified: boolean;
  hasPublishedSafetyPlan: boolean;
  hasRecentToolboxTalk: boolean; // within last 30 days
  hasEmployeeRoster: boolean;
  hasOshaCertifiedStaff: boolean; // OSHA 10/30
}

export interface ReadinessScoreResult {
  score: number; // 0 - 100 percentage
  label: string; // e.g., '92% Ready'
  completedCount: number;
  totalCriteriaCount: number;
  categoryScores: Record<string, { earned: number; total: number }>;
  missingCriteria: { id: string; name: string; category: string; description: string }[];
  disclaimer: string;
}

export const READINESS_CRITERIA: ReadinessCriterion[] = [
  // Business Identity (20 pts)
  {
    id: 'legal_entity',
    category: 'business_identity',
    name: 'Verified Legal Entity',
    description: 'Registered business name, structure, and operational status recorded.',
    weight: 10,
    checkFn: (d) => d.hasLegalName,
  },
  {
    id: 'tax_identifier',
    category: 'business_identity',
    name: 'Federal EIN / Tax ID Recorded',
    description: 'Verified federal taxpayer identification number on file.',
    weight: 10,
    checkFn: (d) => d.hasEinOrTaxId && d.hasBusinessAddress,
  },

  // Insurance Coverage (25 pts)
  {
    id: 'general_liability',
    category: 'insurance',
    name: 'Active General Liability COI',
    description: 'Current Certificate of Insurance on file with active expiration date.',
    weight: 15,
    checkFn: (d) => d.hasGeneralLiability && d.isGeneralLiabilityActive,
  },
  {
    id: 'workers_compensation',
    category: 'insurance',
    name: 'Workers’ Compensation Coverage',
    description: 'Active Workers’ Compensation policy or documented statutory exemption.',
    weight: 10,
    checkFn: (d) => d.hasWorkersCompOrExemption,
  },

  // Licensing & Trade Verification (25 pts)
  {
    id: 'trade_license',
    category: 'licensing',
    name: 'Active State Trade License',
    description: 'State contractor or specialty trade license registered with active dates.',
    weight: 15,
    checkFn: (d) => d.hasActiveTradeLicense,
  },
  {
    id: 'license_evidence',
    category: 'licensing',
    name: 'Verified License Record',
    description: 'License independently verified against state licensing board records.',
    weight: 10,
    checkFn: (d) => d.isLicenseVerified,
  },

  // Safety Documentation (20 pts)
  {
    id: 'safety_plan',
    category: 'safety',
    name: 'Written Construction Safety Plan',
    description: 'Active, current company or site-specific written safety plan.',
    weight: 10,
    checkFn: (d) => d.hasPublishedSafetyPlan,
  },
  {
    id: 'toolbox_talks',
    category: 'safety',
    name: 'Active Safety Briefings (Toolbox Talks)',
    description: 'Conducted and documented safety meeting within the previous 30 days.',
    weight: 10,
    checkFn: (d) => d.hasRecentToolboxTalk,
  },

  // Workforce & Competence (10 pts)
  {
    id: 'employee_roster',
    category: 'workforce',
    name: 'Documented Employee Roster',
    description: 'Active personnel records with trade designations.',
    weight: 5,
    checkFn: (d) => d.hasEmployeeRoster,
  },
  {
    id: 'osha_credentials',
    category: 'workforce',
    name: 'OSHA 10/30 Trained Supervisors',
    description: 'Supervisory staff with recorded OSHA safety training certificates.',
    weight: 5,
    checkFn: (d) => d.hasOshaCertifiedStaff,
  },
];

export const READINESS_DISCLAIMER =
  'The Avorria Contractor Readiness Score reflects completion against Avorria platform checklist criteria. It is an operational readiness indicator and does not constitute official legal advice, OSHA certification, or government licensing endorsement.';

/**
 * Calculates the Contractor Readiness Score based on documented evidence.
 */
export function calculateContractorReadinessScore(
  input: ContractorReadinessInput,
  customCriteria: ReadinessCriterion[] = READINESS_CRITERIA
): ReadinessScoreResult {
  let earnedWeight = 0;
  let totalWeight = 0;
  let completedCount = 0;

  const categoryScores: Record<string, { earned: number; total: number }> = {};
  const missingCriteria: { id: string; name: string; category: string; description: string }[] = [];

  for (const criterion of customCriteria) {
    totalWeight += criterion.weight;

    if (!categoryScores[criterion.category]) {
      categoryScores[criterion.category] = { earned: 0, total: 0 };
    }
    categoryScores[criterion.category].total += criterion.weight;

    const isSatisfied = criterion.checkFn(input);

    if (isSatisfied) {
      earnedWeight += criterion.weight;
      completedCount += 1;
      categoryScores[criterion.category].earned += criterion.weight;
    } else {
      missingCriteria.push({
        id: criterion.id,
        name: criterion.name,
        category: criterion.category,
        description: criterion.description,
      });
    }
  }

  const scorePercentage = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

  return {
    score: scorePercentage,
    label: `${scorePercentage}% Ready`,
    completedCount,
    totalCriteriaCount: customCriteria.length,
    categoryScores,
    missingCriteria,
    disclaimer: READINESS_DISCLAIMER,
  };
}
