/**
 * JURISDICTION & TERMINOLOGY ENGINE
 * 
 * Supports US-first terminology as standard while keeping the underlying
 * data structures, labels, and document generators jurisdiction-aware.
 * Ready for CA, UK, AU, NZ localization without core refactoring.
 */

export type SupportedJurisdiction = 'US' | 'UK' | 'CA' | 'AU' | 'NZ';

export interface JurisdictionTerms {
  jurisdictionCode: SupportedJurisdiction;
  countryName: string;
  // Safety Documentation
  hazardAnalysis: string; // US: JHA / JSA | UK: RAMS / Risk Assessment
  safetyPlan: string;     // US: Safety Plan | UK: Health & Safety Plan | AU: SWMS / WHS Plan
  safetyBriefing: string; // US: Toolbox Talk | UK: Toolbox Talk | AU: Pre-start Briefing
  safetyDataSheet: string; // US: SDS | UK: COSHH Assessment / SDS
  // Regulatory Authority
  safetyAuthority: string; // US: OSHA | UK: HSE | AU: SafeWork | CA: CCOHS
  // Licensing & Registration
  contractorLicense: string; // US: Contractor License | UK: Trade Competence / CSCS | AU: Builder Licence
  taxIdentifier: string;     // US: EIN / Tax ID | UK: UTR / VAT No | AU: ABN / ACN | CA: Business Number (BN)
  // Insurance Terms
  generalLiability: string;    // US: General Liability | UK: Public Liability | AU: Public Liability
  workersCompensation: string; // US: Workers' Compensation | UK: Employers' Liability | AU: Workers' Compensation
  proofOfInsurance: string;    // US: Certificate of Insurance (COI) | UK: Insurance Certificate
  // Contractual & Commerce
  scopeOfWork: string;         // US: Scope of Work | UK: Scope of Works
  changeOrder: string;         // US: Change Order | UK: Variation Order
  quoteOrEstimate: string;     // US: Quote / Estimate | UK: Quotation / Tender
}

export const JURISDICTION_DICTIONARIES: Record<SupportedJurisdiction, JurisdictionTerms> = {
  US: {
    jurisdictionCode: 'US',
    countryName: 'United States',
    hazardAnalysis: 'Job Hazard Analysis (JHA)',
    safetyPlan: 'Construction Safety Plan',
    safetyBriefing: 'Toolbox Talk',
    safetyDataSheet: 'Safety Data Sheet (SDS)',
    safetyAuthority: 'OSHA',
    contractorLicense: 'Contractor License',
    taxIdentifier: 'Federal EIN',
    generalLiability: 'General Liability Insurance',
    workersCompensation: 'Workers’ Compensation Insurance',
    proofOfInsurance: 'Certificate of Insurance (COI)',
    scopeOfWork: 'Scope of Work (SOW)',
    changeOrder: 'Change Order',
    quoteOrEstimate: 'Contractor Estimate / Quote',
  },
  UK: {
    jurisdictionCode: 'UK',
    countryName: 'United Kingdom',
    hazardAnalysis: 'Risk Assessment & Method Statement (RAMS)',
    safetyPlan: 'Construction Phase Plan (CDM)',
    safetyBriefing: 'Toolbox Talk',
    safetyDataSheet: 'COSHH Assessment / SDS',
    safetyAuthority: 'Health and Safety Executive (HSE)',
    contractorLicense: 'Trade Accreditation / CSCS',
    taxIdentifier: 'UTR / Company Number',
    generalLiability: 'Public Liability Insurance',
    workersCompensation: 'Employers’ Liability Insurance',
    proofOfInsurance: 'Certificate of Insurance',
    scopeOfWork: 'Scope of Works',
    changeOrder: 'Variation Order',
    quoteOrEstimate: 'Contractor Tender / Quotation',
  },
  CA: {
    jurisdictionCode: 'CA',
    countryName: 'Canada',
    hazardAnalysis: 'Job Safety Analysis (JSA)',
    safetyPlan: 'Health and Safety Program',
    safetyBriefing: 'Tailgate Safety Meeting',
    safetyDataSheet: 'Safety Data Sheet (WHMIS)',
    safetyAuthority: 'CCOHS / Provincial WCB',
    contractorLicense: 'Trade Licence / Red Seal',
    taxIdentifier: 'Business Number (BN)',
    generalLiability: 'Commercial General Liability (CGL)',
    workersCompensation: 'WCB / WSIB Coverage',
    proofOfInsurance: 'Certificate of Insurance',
    scopeOfWork: 'Scope of Work',
    changeOrder: 'Change Order',
    quoteOrEstimate: 'Contractor Quote / Estimate',
  },
  AU: {
    jurisdictionCode: 'AU',
    countryName: 'Australia',
    hazardAnalysis: 'Safe Work Method Statement (SWMS)',
    safetyPlan: 'WHS Management Plan',
    safetyBriefing: 'Pre-start / Toolbox Talk',
    safetyDataSheet: 'Safety Data Sheet (SDS)',
    safetyAuthority: 'Safe Work Australia',
    contractorLicense: 'Contractor Licence / White Card',
    taxIdentifier: 'Australian Business Number (ABN)',
    generalLiability: 'Public & Products Liability',
    workersCompensation: 'Workers’ Compensation',
    proofOfInsurance: 'Certificate of Currency',
    scopeOfWork: 'Scope of Works',
    changeOrder: 'Variation',
    quoteOrEstimate: 'Contractor Quotation',
  },
  NZ: {
    jurisdictionCode: 'NZ',
    countryName: 'New Zealand',
    hazardAnalysis: 'Safe Work Method Statement (SWMS)',
    safetyPlan: 'Site Specific Safety Plan (SSSP)',
    safetyBriefing: 'Toolbox Meeting',
    safetyDataSheet: 'Safety Data Sheet (SDS)',
    safetyAuthority: 'WorkSafe New Zealand',
    contractorLicense: 'Licensed Building Practitioner (LBP)',
    taxIdentifier: 'NZBN',
    generalLiability: 'Public Liability Insurance',
    workersCompensation: 'ACC Scheme Coverage',
    proofOfInsurance: 'Certificate of Currency',
    scopeOfWork: 'Scope of Works',
    changeOrder: 'Variation',
    quoteOrEstimate: 'Contractor Quote / Estimate',
  },
};

/**
 * Returns jurisdiction-specific terminology dictionary.
 * Defaults to US if unspecified.
 */
export function getJurisdictionTerms(jurisdiction: string = 'US'): JurisdictionTerms {
  const code = jurisdiction.toUpperCase().slice(0, 2) as SupportedJurisdiction;
  return JURISDICTION_DICTIONARIES[code] || JURISDICTION_DICTIONARIES.US;
}
