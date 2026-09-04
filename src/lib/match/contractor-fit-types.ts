/**
 * AVORRIA CONTRACTOR FIT DOMAIN TYPES
 * Phase 11: Explainable Contractor–Opportunity Fit Engine.
 *
 * Design principles:
 * - Deterministic, transparent, and evidence-led comparison of known opportunity attributes
 *   against known contractor attributes.
 * - Zero black-box AI scores, zero win-probability estimates, zero "best contractor" rankings.
 * - Traceable chain: MATCH FACTOR -> SOURCE RECORD -> EVIDENCE -> VERIFICATION.
 * - Strict commercial disclaimers: partial alignment reflects recorded evidence scale,
 *   never contractor inability or legal determination.
 */

export const CONTRACTOR_FIT_ENGINE_VERSION = 'CONTRACTOR_FIT_V1';

export type FitAlignment =
  | 'STRONG'
  | 'GOOD'
  | 'PARTIAL'
  | 'LIMITED'
  | 'NOT_ALIGNED'
  | 'UNKNOWN';

export type OverallFitState =
  | 'STRONG FIT'
  | 'GOOD FIT'
  | 'PARTIAL FIT'
  | 'LIMITED FIT'
  | 'INSUFFICIENT DATA';

export type ComparisonDimension =
  | 'trade'
  | 'geography'
  | 'sector'
  | 'project_type'
  | 'experience'
  | 'commercial_value'
  | 'compliance_licensing'
  | 'compliance_insurance'
  | 'compliance_safety'
  | 'evidence_verification';

export interface TraceableSourceRecord {
  recordId: string;
  recordTitle: string;
  recordType: 'capability' | 'project' | 'credential' | 'evidence' | 'business' | 'verification';
  verificationState?: 'VERIFIED' | 'DOCUMENT_SUPPORTED' | 'CONTRACTOR_SUPPLIED' | 'UNKNOWN';
  verificationRef?: string;
  linkHref: string;
}

export interface DimensionEvaluation {
  dimension: ComparisonDimension;
  label: string;
  alignment: FitAlignment;
  weight: number;
  score: number;
  maxScore: number;
  opportunityRequirement: string;
  contractorStanding: string;
  positiveReasons: string[];
  negativeReasons: string[];
  dataGaps: string[];
  sourceRecords: TraceableSourceRecord[];
  commercialDisclaimer?: string;
}

export type RequirementComparisonStatus =
  | 'MATCHED'
  | 'PARTIAL'
  | 'NOT FOUND'
  | 'REQUIRES REVIEW'
  | 'UNKNOWN';

export interface RequirementComparison {
  id: string;
  title: string;
  category: 'trade' | 'license' | 'insurance' | 'experience' | 'geography' | 'bonding' | 'safety';
  opportunityCriterion: string;
  contractorStatus: RequirementComparisonStatus;
  details: string;
  sourceRecordId?: string;
  sourceRecordTitle?: string;
  sourceRecordHref?: string;
  verificationRef?: string;
}

export interface DataGapItem {
  id: string;
  dimension: ComparisonDimension;
  title: string;
  description: string;
  actionRecommendation: string;
  actionHref: string;
}

export interface ContractorOpportunityFit {
  opportunityId: string;
  opportunityTitle: string;
  opportunityClient: string;
  opportunityLocation: string;
  opportunityEstimatedValue: number | null;
  contractorOrgId: string;
  contractorName: string;
  overallFitState: OverallFitState;
  fitScore: number; // 0 to 100
  maxScore: number; // 100
  dataCoveragePercent: number; // percentage of criteria with known data
  dimensions: Record<ComparisonDimension, DimensionEvaluation>;
  requirementComparisons: RequirementComparison[];
  whyItMatched: string[];
  whyItDidNotMatch: string[];
  dataGaps: DataGapItem[];
  engineVersion: string;
  evaluatedAt: string;
  commercialDisclaimer: string;
}
