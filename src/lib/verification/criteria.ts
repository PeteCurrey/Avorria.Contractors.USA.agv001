/**
 * AVORRIA VERIFICATION CRITERIA REGISTRY
 * 
 * Defines the official human-governed verification criteria.
 * Includes legal provenance, jurisdictions, evidence expectations, and review dates.
 */

import { VerificationCriterion } from './types';

export const VERIFICATION_CRITERIA_REGISTRY: VerificationCriterion[] = [
  // 1. Business Identity
  {
    id: 'crit_bus_entity',
    slug: 'business-identity-verification',
    name: 'Registered Commercial Business Entity',
    category: 'business_identity',
    description: 'Evidence that the business is an actively registered commercial entity with the state Secretary of State.',
    requirementType: 'legal_regulatory',
    evidenceType: 'business_formation',
    mandatory: true,
    sourceName: 'State Secretary of State Business Registry / Formation Filings',
    sourceUrl: 'https://www.sos.state.tx.us/corp/sosda/index.shtml',
    effectiveDate: '2026-01-01',
    nextReviewDate: '2027-01-01',
    governedBy: 'Avorria Standards Committee',
    active: true,
    verificationWeight: 20,
  },

  // 2. General Liability Insurance
  {
    id: 'crit_ins_gl',
    slug: 'general-liability-insurance',
    name: 'Commercial General Liability Policy (COI)',
    category: 'insurance',
    description: 'Certificate of Insurance confirming active General Liability coverage with an authorized commercial insurer.',
    requirementType: 'client_prequal',
    evidenceType: 'insurance_coi',
    mandatory: true,
    sourceName: 'ACORD 25 Certificate of Liability Standards',
    sourceUrl: 'https://www.acord.org/standards-architecture/forms-portal',
    effectiveDate: '2026-01-01',
    nextReviewDate: '2027-01-01',
    governedBy: 'Avorria Risk & Compliance Review',
    active: true,
    verificationWeight: 25,
  },

  // 3. Workers' Compensation Insurance
  {
    id: 'crit_ins_wc',
    slug: 'workers-compensation-policy',
    name: 'Workers’ Compensation Insurance',
    category: 'insurance',
    description: 'Statutory Workers’ Compensation coverage for employees or valid state-specific exemption certificate where permitted.',
    requirementType: 'legal_regulatory',
    evidenceType: 'insurance_coi',
    mandatory: false,
    sourceName: 'Texas Department of Insurance / State Workers’ Comp Division',
    sourceUrl: 'https://www.tdi.texas.gov/wc/',
    effectiveDate: '2026-01-01',
    nextReviewDate: '2027-01-01',
    governedBy: 'Avorria Risk & Compliance Review',
    active: true,
    verificationWeight: 15,
  },

  // 4. Trade License (Contextual: Electrical, Plumbing, HVAC)
  {
    id: 'crit_lic_trade',
    slug: 'state-trade-contractor-license',
    name: 'State / Municipal Trade Contractor License',
    category: 'licensing',
    description: 'Valid, unexpired trade master or contractor license issued by the relevant state regulatory agency.',
    trade: 'electrical-contracting', // Also applies to plumbing, hvac
    requirementType: 'legal_regulatory',
    evidenceType: 'trade_license',
    mandatory: true,
    sourceName: 'Texas Department of Licensing and Regulation (TDLR) / State Licensing Board',
    sourceUrl: 'https://www.tdlr.texas.gov/',
    effectiveDate: '2026-01-01',
    nextReviewDate: '2027-01-01',
    governedBy: 'Avorria Trade Licensing Committee',
    active: true,
    verificationWeight: 25,
  },

  // 5. Site Safety Program / HASP
  {
    id: 'crit_saf_program',
    slug: 'written-site-safety-program',
    name: 'Written Site Safety Program & Pre-Task Planning',
    category: 'safety_program',
    description: 'Written Health & Safety Program (HASP) or documented Job Hazard Analysis (JHA) procedure aligned with OSHA standards.',
    requirementType: 'industry_standard',
    evidenceType: 'safety_plan',
    mandatory: true,
    sourceName: 'OSHA 1926.20 General Safety & Health Provisions',
    sourceUrl: 'https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.20',
    effectiveDate: '2026-01-01',
    nextReviewDate: '2027-01-01',
    governedBy: 'Avorria Safety Standards Team',
    active: true,
    verificationWeight: 15,
  },

  // 6. Workforce Training / OSHA Card
  {
    id: 'crit_trn_osha',
    slug: 'supervisory-osha-training',
    name: 'Supervisory OSHA Safety Certification',
    category: 'workforce_training',
    description: 'Documented completion of OSHA 10-Hour or 30-Hour Construction Safety training for field supervisors.',
    requirementType: 'client_prequal',
    evidenceType: 'osha_card',
    mandatory: false,
    sourceName: 'OSHA Outreach Training Program Requirements',
    sourceUrl: 'https://www.osha.gov/training/outreach',
    effectiveDate: '2026-01-01',
    nextReviewDate: '2027-01-01',
    governedBy: 'Avorria Safety Standards Team',
    active: true,
    verificationWeight: 10,
  },
];

/**
 * Resolves which criteria apply to a given contractor context
 */
export function getApplicableVerificationCriteria(
  trades: string[],
  primaryState: string = 'TX'
): VerificationCriterion[] {
  return VERIFICATION_CRITERIA_REGISTRY.filter((crit) => {
    if (!crit.active) return false;
    
    // Trade matching: if trade specified, must match one of contractor trades
    if (crit.trade) {
      const matchesTrade = trades.some((t) => t.includes(crit.trade!) || crit.trade!.includes(t));
      if (!matchesTrade) return false;
    }

    // Jurisdiction matching: if jurisdiction specified, must match primary state
    if (crit.jurisdiction && crit.jurisdiction !== primaryState) {
      return false;
    }

    return true;
  });
}

export function getVerificationCriterionBySlug(slug: string): VerificationCriterion | undefined {
  return VERIFICATION_CRITERIA_REGISTRY.find((c) => c.slug === slug);
}
