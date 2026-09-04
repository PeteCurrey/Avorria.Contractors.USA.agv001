/**
 * AVORRIA CONTRACTOR FIT ENGINE
 * Phase 11: Explainable Contractor–Opportunity Fit Engine.
 *
 * Core Concept:
 *   BUSINESS → CREATE → COMPLY → PROVE → VERIFICATION → PASSPORT → DISCOVER → MATCH
 *
 * Deterministic comparison engine comparing known opportunity attributes
 * against known contractor attributes assembled from authoritative platform sources.
 */

import { AssembledPassport } from '@/lib/passport/types';
import { getAssembledPassport } from '@/lib/passport/assembly';
import { DiscoverOpportunity } from '@/lib/discover/types';
import { getDiscoverOpportunityById } from '@/lib/discover/repository';
import {
  ContractorOpportunityFit,
  ComparisonDimension,
  DimensionEvaluation,
  FitAlignment,
  OverallFitState,
  RequirementComparison,
  RequirementComparisonStatus,
  DataGapItem,
  TraceableSourceRecord,
  CONTRACTOR_FIT_ENGINE_VERSION,
} from './contractor-fit-types';

const DISCLAIMER_TEXT =
  'Avorria MATCH provides deterministic factual comparisons between recorded contractor attributes and stated opportunity requirements. This evaluation does not constitute a legal or regulatory determination, nor does it guarantee procurement award or project selection. Partial alignments reflect recorded evidence scale rather than contractor capability.';

/**
 * Normalizes text for case-insensitive matching and slug comparisons.
 */
function normalize(str?: string | null): string {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Parses numeric currency value from string or number.
 */
function parseEstimatedValue(val?: number | string | null): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Pure deterministic fit calculation function.
 * Testable without live database connections.
 */
export function computeContractorOpportunityFit(
  opportunity: DiscoverOpportunity,
  passport: AssembledPassport
): ContractorOpportunityFit {
  const org = passport.organization;
  const oppValue = parseEstimatedValue(opportunity.estimated_value);
  const oppTradeNorm = normalize(opportunity.trade);
  const oppStateNorm = normalize(opportunity.location?.state);
  const oppCityNorm = normalize(opportunity.location?.city);
  const oppSectorNorm = normalize(opportunity.sector);
  const oppProjectTypeNorm = normalize(opportunity.project_type);

  const dimensions: Record<ComparisonDimension, DimensionEvaluation> = {} as any;
  const requirementComparisons: RequirementComparison[] = [];
  const whyItMatched: string[] = [];
  const whyItDidNotMatch: string[] = [];
  const dataGaps: DataGapItem[] = [];

  let totalDataFieldsChecked = 0;
  let totalDataFieldsPresent = 0;

  // ─────────────────────────────────────────────────────────────
  // 1. TRADE FIT (Weight: 20 pts)
  // ─────────────────────────────────────────────────────────────
  totalDataFieldsChecked++;
  const primaryTradeNorm = normalize(org.primary_trade);
  const additionalTradesNorm = (org.additional_trades || []).map(normalize);
  const capabilityTradesNorm = passport.capabilities.map((c) => normalize(c.trade_slug || c.trade));

  let tradeScore = 0;
  let tradeAlignment: FitAlignment = 'NOT_ALIGNED';
  const tradePositive: string[] = [];
  const tradeNegative: string[] = [];
  const tradeGaps: string[] = [];
  const tradeRecords: TraceableSourceRecord[] = [];

  const isExactPrimary =
    primaryTradeNorm === oppTradeNorm ||
    oppTradeNorm.includes(primaryTradeNorm) ||
    primaryTradeNorm.includes(oppTradeNorm);
  const isSecondaryMatch = additionalTradesNorm.some(
    (t: string) => t && (t === oppTradeNorm || oppTradeNorm.includes(t) || t.includes(oppTradeNorm))
  );
  const isCapabilityMatch = capabilityTradesNorm.some(
    (t: string) => t && (t === oppTradeNorm || oppTradeNorm.includes(t) || t.includes(oppTradeNorm))
  );

  // MEP cluster check (Electrical, Plumbing, HVAC)
  const mepCluster = ['electricalcontracting', 'plumbingcontracting', 'hvacmechanical', 'mechanicalcontracting'];
  const isMepCluster =
    mepCluster.some((m) => oppTradeNorm.includes(m)) && mepCluster.some((m) => primaryTradeNorm.includes(m));

  if (isExactPrimary) {
    tradeScore = 20;
    tradeAlignment = 'STRONG';
    totalDataFieldsPresent++;
    tradePositive.push(
      `Contractor's recorded primary trade (${org.primary_trade}) aligns directly with opportunity trade (${opportunity.trade_label || opportunity.trade}).`
    );
    whyItMatched.push(`Primary trade aligned: ${org.primary_trade}`);
  } else if (isSecondaryMatch || isCapabilityMatch) {
    tradeScore = 16;
    tradeAlignment = 'GOOD';
    totalDataFieldsPresent++;
    tradePositive.push(
      `Contractor maintains recorded secondary trade/capability matching ${opportunity.trade_label || opportunity.trade}.`
    );
    whyItMatched.push(`Trade aligned via declared secondary trade or capability profile`);
  } else if (isMepCluster) {
    tradeScore = 10;
    tradeAlignment = 'PARTIAL';
    totalDataFieldsPresent++;
    tradePositive.push(`Contractor operates within the related MEP mechanical/electrical/plumbing commercial cluster.`);
    tradeNegative.push(
      `Opportunity specifies ${opportunity.trade_label || opportunity.trade}, whereas contractor's primary listed trade is ${org.primary_trade}.`
    );
    whyItDidNotMatch.push(`Trade is within related MEP sector but is not listed as primary trade`);
  } else {
    tradeScore = 0;
    tradeAlignment = 'NOT_ALIGNED';
    tradeNegative.push(
      `Contractor's listed primary trade (${org.primary_trade || 'Unspecified'}) does not match the opportunity trade (${opportunity.trade_label || opportunity.trade}).`
    );
    whyItDidNotMatch.push(
      `Trade mismatch: recorded ${org.primary_trade || 'none'} vs required ${opportunity.trade_label || opportunity.trade}`
    );
    tradeGaps.push(`Add ${opportunity.trade_label || opportunity.trade} capability profile to CREATE`);
    dataGaps.push({
      id: 'gap-trade',
      dimension: 'trade',
      title: `Trade Capability: ${opportunity.trade_label || opportunity.trade}`,
      description: `Add relevant trade capability and project evidence to demonstrate competence in ${opportunity.trade_label || opportunity.trade}.`,
      actionRecommendation: 'Add capability profile in CREATE',
      actionHref: '/workspace/create/capabilities',
    });
  }

  // Populate trade source records
  passport.capabilities
    .filter((c) => normalize(c.trade_slug) === oppTradeNorm || isExactPrimary)
    .slice(0, 3)
    .forEach((c) => {
      tradeRecords.push({
        recordId: c.id,
        recordTitle: c.name,
        recordType: 'capability',
        verificationState: c.has_verified_evidence ? 'VERIFIED' : 'CONTRACTOR_SUPPLIED',
        linkHref: '/workspace/create/capabilities',
      });
    });

  dimensions.trade = {
    dimension: 'trade',
    label: 'Trade Alignment',
    alignment: tradeAlignment,
    weight: 20,
    score: tradeScore,
    maxScore: 20,
    opportunityRequirement: opportunity.trade_label || opportunity.trade,
    contractorStanding: org.primary_trade || 'Not recorded',
    positiveReasons: tradePositive,
    negativeReasons: tradeNegative,
    dataGaps: tradeGaps,
    sourceRecords: tradeRecords,
  };

  requirementComparisons.push({
    id: 'req-trade',
    title: 'Trade Scope',
    category: 'trade',
    opportunityCriterion: opportunity.trade_label || opportunity.trade,
    contractorStatus:
      tradeAlignment === 'STRONG'
        ? 'MATCHED'
        : tradeAlignment === 'GOOD' || tradeAlignment === 'PARTIAL'
        ? 'PARTIAL'
        : 'NOT FOUND',
    details: tradePositive[0] || tradeNegative[0] || 'No trade alignment recorded',
    sourceRecordId: tradeRecords[0]?.recordId,
    sourceRecordTitle: tradeRecords[0]?.recordTitle,
    sourceRecordHref: tradeRecords[0]?.linkHref,
  });

  // ─────────────────────────────────────────────────────────────
  // 2. GEOGRAPHIC FIT (Weight: 15 pts)
  // ─────────────────────────────────────────────────────────────
  totalDataFieldsChecked++;
  const statesLicensedNorm = (org.states_licensed || []).map(normalize);
  const hqStateNorm = normalize(org.hq_address?.state);
  const hqCityNorm = normalize(org.hq_address?.city);
  const oppCity = opportunity.location?.city || '';
  const oppState = opportunity.location?.state || '';

  let geoScore = 0;
  let geoAlignment: FitAlignment = 'NOT_ALIGNED';
  const geoPositive: string[] = [];
  const geoNegative: string[] = [];
  const geoGaps: string[] = [];
  const geoRecords: TraceableSourceRecord[] = [];

  const isStateLicensed = statesLicensedNorm.includes(oppStateNorm) || hqStateNorm === oppStateNorm;
  const hasLocalProjects = passport.projects.some(
    (p) =>
      normalize(p.location_state) === oppStateNorm &&
      (normalize(p.location_city) === oppCityNorm || !oppCityNorm)
  );
  const isCityMatch = hqCityNorm === oppCityNorm && isStateLicensed;

  if (isStateLicensed && (hasLocalProjects || isCityMatch)) {
    geoScore = 15;
    geoAlignment = 'STRONG';
    totalDataFieldsPresent++;
    geoPositive.push(
      `Contractor is licensed in ${oppState} and has demonstrable project presence or headquarters in ${oppCity}.`
    );
    whyItMatched.push(`Licensed in ${oppState} with recorded local project presence`);
  } else if (isStateLicensed) {
    geoScore = 12;
    geoAlignment = 'GOOD';
    totalDataFieldsPresent++;
    geoPositive.push(`Contractor is formally registered or licensed in the state of ${oppState}.`);
    whyItMatched.push(`State license coverage in ${oppState}`);
  } else if (hasLocalProjects) {
    geoScore = 8;
    geoAlignment = 'PARTIAL';
    totalDataFieldsPresent++;
    geoPositive.push(`Contractor has completed prior commercial projects in ${oppState}.`);
    geoNegative.push(`Formal state licensing record for ${oppState} is not recorded on contractor profile.`);
    whyItDidNotMatch.push(`Prior project completed in ${oppState}, but formal state license record is not registered`);
    geoGaps.push(`Add ${oppState} trade license record to COMPLY`);
    dataGaps.push({
      id: 'gap-geo-license',
      dimension: 'geography',
      title: `State License Record: ${oppState}`,
      description: `Record license or operational authorization for ${oppState} to confirm jurisdictional compliance.`,
      actionRecommendation: 'Add state license in COMPLY',
      actionHref: '/workspace/comply/new?type=trade_license',
    });
  } else {
    geoScore = 0;
    geoAlignment = 'NOT_ALIGNED';
    geoNegative.push(`Contractor profile records no active licensing or project presence in ${oppCity}, ${oppState}.`);
    whyItDidNotMatch.push(`No recorded operations or licensing in ${oppState}`);
    geoGaps.push(`Confirm operating territory in ${oppState}`);
    dataGaps.push({
      id: 'gap-territory',
      dimension: 'geography',
      title: `Operating Territory: ${oppState}`,
      description: `Expand service territory or add verified project records in ${oppState}.`,
      actionRecommendation: 'Update service territory in Business Profile',
      actionHref: '/workspace/business',
    });
  }

  // Find geographic source records
  passport.complianceRecords
    .filter(
      (c) =>
        (c.category === 'licence' || c.credential_type?.includes('license')) &&
        normalize(c.state) === oppStateNorm
    )
    .forEach((c) => {
      geoRecords.push({
        recordId: c.id,
        recordTitle: `${c.title || c.display_label} (${c.policy_or_license_number || 'Active'})`,
        recordType: 'credential',
        verificationState: c.prove_verification_state === 'VERIFIED' ? 'VERIFIED' : 'CONTRACTOR_SUPPLIED',
        verificationRef: c.prove_verification_ref,
        linkHref: `/workspace/comply/${c.id}`,
      });
    });

  dimensions.geography = {
    dimension: 'geography',
    label: 'Geographic Alignment',
    alignment: geoAlignment,
    weight: 15,
    score: geoScore,
    maxScore: 15,
    opportunityRequirement: `${oppCity ? oppCity + ', ' : ''}${oppState || 'Territory unstated'}`,
    contractorStanding: `${org.hq_address?.city || ''}${
      org.hq_address?.state ? ', ' + org.hq_address.state : ''
    } (Licensed: ${(org.states_licensed || []).join(', ') || 'None'})`,
    positiveReasons: geoPositive,
    negativeReasons: geoNegative,
    dataGaps: geoGaps,
    sourceRecords: geoRecords,
  };

  requirementComparisons.push({
    id: 'req-geography',
    title: 'Operating Territory & State Authority',
    category: 'geography',
    opportunityCriterion: `${oppCity ? oppCity + ', ' : ''}${oppState}`,
    contractorStatus:
      geoAlignment === 'STRONG' || geoAlignment === 'GOOD'
        ? 'MATCHED'
        : geoAlignment === 'PARTIAL'
        ? 'PARTIAL'
        : 'NOT FOUND',
    details: geoPositive[0] || geoNegative[0] || 'Geographic standing not established',
    sourceRecordId: geoRecords[0]?.recordId,
    sourceRecordTitle: geoRecords[0]?.recordTitle,
    sourceRecordHref: geoRecords[0]?.linkHref,
    verificationRef: geoRecords[0]?.verificationRef,
  });

  // ─────────────────────────────────────────────────────────────
  // 3. SECTOR FIT (Weight: 10 pts)
  // ─────────────────────────────────────────────────────────────
  totalDataFieldsChecked++;
  let sectorScore = 0;
  let sectorAlignment: FitAlignment = 'UNKNOWN';
  const sectorPositive: string[] = [];
  const sectorNegative: string[] = [];
  const sectorGaps: string[] = [];
  const sectorRecords: TraceableSourceRecord[] = [];

  const oppSector = opportunity.sector || '';
  if (!oppSector) {
    sectorScore = 6;
    sectorAlignment = 'UNKNOWN';
    sectorPositive.push(`Opportunity does not restrict sector classification.`);
  } else {
    const matchingSectorProjects = passport.projects.filter(
      (p) =>
        p.sector &&
        (normalize(p.sector) === oppSectorNorm ||
          oppSectorNorm.includes(normalize(p.sector)) ||
          normalize(p.sector).includes(oppSectorNorm))
    );

    if (matchingSectorProjects.length > 0) {
      sectorScore = 10;
      sectorAlignment = 'STRONG';
      totalDataFieldsPresent++;
      sectorPositive.push(
        `Contractor has ${matchingSectorProjects.length} recorded project(s) in the ${oppSector} sector.`
      );
      whyItMatched.push(`Demonstrated track record in ${oppSector} sector (${matchingSectorProjects.length} projects)`);

      matchingSectorProjects.slice(0, 2).forEach((p) => {
        sectorRecords.push({
          recordId: p.id,
          recordTitle: p.name,
          recordType: 'project',
          verificationState: p.has_verified_evidence ? 'VERIFIED' : 'CONTRACTOR_SUPPLIED',
          linkHref: '/workspace/create/projects',
        });
      });
    } else if (passport.projects.length > 0) {
      sectorScore = 4;
      sectorAlignment = 'PARTIAL';
      totalDataFieldsPresent++;
      sectorNegative.push(`No recorded projects explicitly classified under the ${oppSector} sector.`);
      whyItDidNotMatch.push(`No specific project case history in ${oppSector} sector (commercial record gap)`);
      sectorGaps.push(`Add past projects in ${oppSector} to CREATE`);
      dataGaps.push({
        id: 'gap-sector',
        dimension: 'sector',
        title: `Sector Experience: ${oppSector}`,
        description: `Add reference projects completed in the ${oppSector} market sector.`,
        actionRecommendation: 'Add project experience in CREATE',
        actionHref: '/workspace/create/projects',
      });
    } else {
      sectorScore = 2;
      sectorAlignment = 'LIMITED';
      sectorNegative.push(`Contractor has not yet published project records.`);
      sectorGaps.push(`Add initial project history in CREATE`);
    }
  }

  dimensions.sector = {
    dimension: 'sector',
    label: 'Sector Experience',
    alignment: sectorAlignment,
    weight: 10,
    score: sectorScore,
    maxScore: 10,
    opportunityRequirement: oppSector || 'Unspecified (Open)',
    contractorStanding:
      passport.projects
        .map((p) => p.sector)
        .filter(Boolean)
        .slice(0, 3)
        .join(', ') || 'No sectors recorded',
    positiveReasons: sectorPositive,
    negativeReasons: sectorNegative,
    dataGaps: sectorGaps,
    sourceRecords: sectorRecords,
    commercialDisclaimer:
      'Absence of recorded sector experience reflects published evidence and does not imply operational incapacity.',
  };

  // ─────────────────────────────────────────────────────────────
  // 4. PROJECT TYPE FIT (Weight: 10 pts)
  // ─────────────────────────────────────────────────────────────
  totalDataFieldsChecked++;
  let typeScore = 0;
  let typeAlignment: FitAlignment = 'UNKNOWN';
  const typePositive: string[] = [];
  const typeNegative: string[] = [];
  const typeGaps: string[] = [];
  const typeRecords: TraceableSourceRecord[] = [];

  const oppType = opportunity.project_type || '';
  if (!oppType) {
    typeScore = 7;
    typeAlignment = 'UNKNOWN';
    typePositive.push(`Opportunity scope does not mandate a specific project archetype.`);
  } else {
    const matchingTypeProjects = passport.projects.filter(
      (p) =>
        p.project_type &&
        (normalize(p.project_type) === oppProjectTypeNorm ||
          oppProjectTypeNorm.includes(normalize(p.project_type)) ||
          normalize(p.project_type).includes(oppProjectTypeNorm))
    );

    if (matchingTypeProjects.length > 0) {
      typeScore = 10;
      typeAlignment = 'STRONG';
      totalDataFieldsPresent++;
      typePositive.push(
        `Contractor has ${matchingTypeProjects.length} recorded project(s) matching archetype "${oppType}".`
      );
      whyItMatched.push(`Project type experience: ${oppType}`);

      matchingTypeProjects.slice(0, 2).forEach((p) => {
        typeRecords.push({
          recordId: p.id,
          recordTitle: p.name,
          recordType: 'project',
          verificationState: p.has_verified_evidence ? 'VERIFIED' : 'CONTRACTOR_SUPPLIED',
          linkHref: '/workspace/create/projects',
        });
      });
    } else {
      typeScore = 4;
      typeAlignment = 'PARTIAL';
      typeNegative.push(`Contractor has no projects recorded with the exact archetype "${oppType}".`);
      typeGaps.push(`Add project matching "${oppType}" to CREATE`);
    }
  }

  dimensions.project_type = {
    dimension: 'project_type',
    label: 'Project Archetype Fit',
    alignment: typeAlignment,
    weight: 10,
    score: typeScore,
    maxScore: 10,
    opportunityRequirement: oppType || 'Standard commercial scope',
    contractorStanding:
      passport.projects
        .map((p) => p.project_type)
        .filter(Boolean)
        .slice(0, 3)
        .join(', ') || 'Standard commercial',
    positiveReasons: typePositive,
    negativeReasons: typeNegative,
    dataGaps: typeGaps,
    sourceRecords: typeRecords,
  };

  // ─────────────────────────────────────────────────────────────
  // 5. EXPERIENCE FIT (Weight: 15 pts)
  // ─────────────────────────────────────────────────────────────
  totalDataFieldsChecked++;
  let expScore = 0;
  let expAlignment: FitAlignment = 'LIMITED';
  const expPositive: string[] = [];
  const expNegative: string[] = [];
  const expGaps: string[] = [];
  const expRecords: TraceableSourceRecord[] = [];

  // All completed projects in primary trade or scope
  const relevantTradeProjects = passport.projects.filter(
    (p) =>
      isExactPrimary ||
      (p.services_delivered || []).some((s: string) => normalize(s) === oppTradeNorm)
  );
  const totalProjectsCount = passport.projects.length;

  if (relevantTradeProjects.length >= 3) {
    expScore = 15;
    expAlignment = 'STRONG';
    totalDataFieldsPresent++;
    expPositive.push(
      `Strong recorded project history: ${relevantTradeProjects.length} completed commercial projects in this discipline.`
    );
    whyItMatched.push(`Demonstrated volume of relevant project experience (${relevantTradeProjects.length} projects)`);
  } else if (relevantTradeProjects.length >= 1) {
    expScore = 10;
    expAlignment = 'GOOD';
    totalDataFieldsPresent++;
    expPositive.push(`Contractor has ${relevantTradeProjects.length} commercial project(s) recorded in this scope.`);
    expNegative.push(
      `Fewer than 3 reference projects recorded; adding additional records strengthens competitive standing.`
    );
    whyItMatched.push(`Relevant project history recorded (${relevantTradeProjects.length} project(s))`);
  } else if (totalProjectsCount > 0) {
    expScore = 5;
    expAlignment = 'PARTIAL';
    totalDataFieldsPresent++;
    expNegative.push(
      `Contractor has ${totalProjectsCount} projects on file, but none explicitly tagged under ${opportunity.trade_label || opportunity.trade}.`
    );
    whyItDidNotMatch.push(`No reference projects tagged under ${opportunity.trade_label || opportunity.trade}`);
    expGaps.push(`Add completed projects in ${opportunity.trade_label || opportunity.trade}`);
    dataGaps.push({
      id: 'gap-experience-trade',
      dimension: 'experience',
      title: `Project Experience: ${opportunity.trade_label || opportunity.trade}`,
      description: `Document completed commercial projects specifically within ${opportunity.trade_label || opportunity.trade}.`,
      actionRecommendation: 'Add project experience in CREATE',
      actionHref: '/workspace/create/projects',
    });
  } else {
    expScore = 2;
    expAlignment = 'LIMITED';
    expNegative.push(`Contractor has not recorded completed project history in CREATE.`);
    expGaps.push(`Add completed commercial projects`);
    dataGaps.push({
      id: 'gap-experience-all',
      dimension: 'experience',
      title: 'Commercial Project Track Record',
      description: 'Add past commercial projects to substantiate execution capacity.',
      actionRecommendation: 'Create project profile',
      actionHref: '/workspace/create/projects',
    });
  }

  relevantTradeProjects.slice(0, 3).forEach((p) => {
    expRecords.push({
      recordId: p.id,
      recordTitle: p.name,
      recordType: 'project',
      verificationState: p.has_verified_evidence ? 'VERIFIED' : 'CONTRACTOR_SUPPLIED',
      linkHref: '/workspace/create/projects',
    });
  });

  dimensions.experience = {
    dimension: 'experience',
    label: 'Demonstrated Experience Volume',
    alignment: expAlignment,
    weight: 15,
    score: expScore,
    maxScore: 15,
    opportunityRequirement: 'Commercial track record in relevant trade',
    contractorStanding: `${relevantTradeProjects.length} relevant project(s) (${totalProjectsCount} total on file)`,
    positiveReasons: expPositive,
    negativeReasons: expNegative,
    dataGaps: expGaps,
    sourceRecords: expRecords,
  };

  requirementComparisons.push({
    id: 'req-experience',
    title: 'Completed Project Experience',
    category: 'experience',
    opportunityCriterion: 'Relevant commercial project history',
    contractorStatus:
      expAlignment === 'STRONG' || expAlignment === 'GOOD'
        ? 'MATCHED'
        : expAlignment === 'PARTIAL'
        ? 'PARTIAL'
        : 'NOT FOUND',
    details: expPositive[0] || expNegative[0] || 'Experience records incomplete',
    sourceRecordId: expRecords[0]?.recordId,
    sourceRecordTitle: expRecords[0]?.recordTitle,
    sourceRecordHref: expRecords[0]?.linkHref,
  });

  // ─────────────────────────────────────────────────────────────
  // 6. COMMERCIAL VALUE FIT (Weight: 10 pts)
  // ─────────────────────────────────────────────────────────────
  totalDataFieldsChecked++;
  let valueScore = 0;
  let valueAlignment: FitAlignment = 'UNKNOWN';
  const valuePositive: string[] = [];
  const valueNegative: string[] = [];
  const valueGaps: string[] = [];
  const valueRecords: TraceableSourceRecord[] = [];

  const maxProjectValue = passport.projects.reduce((max, p) => Math.max(max, p.contract_value || 0), 0);
  const singleBonding = passport.commercialProfile?.bonding_capacity_single || 0;

  if (oppValue === null || oppValue === 0) {
    valueScore = 7;
    valueAlignment = 'UNKNOWN';
    valuePositive.push(`Opportunity has no stated estimated contract value.`);
  } else {
    totalDataFieldsPresent++;
    const effectiveCapacity = Math.max(maxProjectValue, singleBonding);

    if (effectiveCapacity >= oppValue) {
      valueScore = 10;
      valueAlignment = 'STRONG';
      valuePositive.push(
        `Contractor's demonstrated project history ($${effectiveCapacity.toLocaleString()}) meets or exceeds the opportunity scale ($${oppValue.toLocaleString()}).`
      );
      whyItMatched.push(`Demonstrated commercial scale matches project estimate ($${oppValue.toLocaleString()})`);
    } else if (effectiveCapacity >= oppValue * 0.5) {
      valueScore = 7;
      valueAlignment = 'GOOD';
      valuePositive.push(
        `Contractor's largest completed project ($${effectiveCapacity.toLocaleString()}) demonstrates substantial scale capability (≥50% of estimated $${oppValue.toLocaleString()}).`
      );
      valueNegative.push(
        `Largest recorded project ($${effectiveCapacity.toLocaleString()}) is below the full estimated opportunity budget ($${oppValue.toLocaleString()}).`
      );
    } else if (effectiveCapacity > 0) {
      valueScore = 4;
      valueAlignment = 'PARTIAL';
      valueNegative.push(
        `Largest recorded commercial project ($${effectiveCapacity.toLocaleString()}) reflects a smaller scale than the estimated opportunity budget ($${oppValue.toLocaleString()}).`
      );
      whyItDidNotMatch.push(
        `Scale gap: largest recorded project ($${effectiveCapacity.toLocaleString()}) is below opportunity estimate ($${oppValue.toLocaleString()})`
      );
      valueGaps.push(`Record higher-value projects or single-project bonding limit in CREATE`);
      dataGaps.push({
        id: 'gap-bonding-value',
        dimension: 'commercial_value',
        title: 'Commercial Scale & Bonding Limits',
        description: `Add single-project bonding capacity or higher-value past projects to substantiate capacity for $${oppValue.toLocaleString()} scope.`,
        actionRecommendation: 'Update Commercial Profile in CREATE',
        actionHref: '/workspace/create/commercial',
      });
    } else {
      valueScore = 2;
      valueAlignment = 'LIMITED';
      valueNegative.push(`No project financial values or bonding limits are recorded in contractor profile.`);
      valueGaps.push(`Add project contract values or bonding capacity`);
      dataGaps.push({
        id: 'gap-project-values',
        dimension: 'commercial_value',
        title: 'Project Contract Values',
        description: 'Provide contract values for completed projects to substantiate commercial scale.',
        actionRecommendation: 'Edit project values in CREATE',
        actionHref: '/workspace/create/projects',
      });
    }
  }

  const highestValueProject = passport.projects
    .slice()
    .sort((a, b) => (b.contract_value || 0) - (a.contract_value || 0))[0];
  if (highestValueProject && (highestValueProject.contract_value || 0) > 0) {
    valueRecords.push({
      recordId: highestValueProject.id,
      recordTitle: `${highestValueProject.name} ($${(highestValueProject.contract_value || 0).toLocaleString()})`,
      recordType: 'project',
      verificationState: highestValueProject.has_verified_evidence ? 'VERIFIED' : 'CONTRACTOR_SUPPLIED',
      linkHref: '/workspace/create/projects',
    });
  }

  dimensions.commercial_value = {
    dimension: 'commercial_value',
    label: 'Commercial Scale Fit',
    alignment: valueAlignment,
    weight: 10,
    score: valueScore,
    maxScore: 10,
    opportunityRequirement: oppValue ? `$${oppValue.toLocaleString()} estimated value` : 'Unstated estimate',
    contractorStanding:
      maxProjectValue > 0
        ? `Largest project: $${maxProjectValue.toLocaleString()}${
            singleBonding ? ` (Bonding: $${singleBonding.toLocaleString()})` : ''
          }`
        : 'No project values recorded',
    positiveReasons: valuePositive,
    negativeReasons: valueNegative,
    dataGaps: valueGaps,
    sourceRecords: valueRecords,
    commercialDisclaimer:
      'Scale alignment reflects published project evidence scale only. A partial match indicates a gap in documented evidence scale, not contractor inability or operational incapacity.',
  };

  requirementComparisons.push({
    id: 'req-value',
    title: 'Commercial Scale Capability',
    category: 'bonding',
    opportunityCriterion: oppValue ? `Estimated budget: $${oppValue.toLocaleString()}` : 'Budget unstated',
    contractorStatus:
      valueAlignment === 'STRONG' || valueAlignment === 'GOOD'
        ? 'MATCHED'
        : valueAlignment === 'UNKNOWN'
        ? 'UNKNOWN'
        : 'PARTIAL',
    details: valuePositive[0] || valueNegative[0] || 'Scale records incomplete',
    sourceRecordId: valueRecords[0]?.recordId,
    sourceRecordTitle: valueRecords[0]?.recordTitle,
    sourceRecordHref: valueRecords[0]?.linkHref,
  });

  // ─────────────────────────────────────────────────────────────
  // 7. COMPLIANCE: LICENSING FIT (Weight: 8 pts)
  // ─────────────────────────────────────────────────────────────
  totalDataFieldsChecked++;
  const licenseRequired = Boolean(opportunity.requirements?.tradeLicenseRequired);
  let licScore = 0;
  let licAlignment: FitAlignment = 'NOT_ALIGNED';
  const licPositive: string[] = [];
  const licNegative: string[] = [];
  const licGaps: string[] = [];
  const licRecords: TraceableSourceRecord[] = [];

  const stateLicense = passport.complianceRecords.find(
    (c) =>
      (c.category === 'licence' || c.credential_type?.includes('license')) &&
      (!oppStateNorm || normalize(c.state) === oppStateNorm)
  );

  if (!licenseRequired) {
    licScore = 8;
    licAlignment = 'STRONG';
    licPositive.push(`Trade license is not explicitly mandated as a submission gate by the client.`);
    totalDataFieldsPresent++;
  } else if (stateLicense) {
    totalDataFieldsPresent++;
    const isVerified =
      stateLicense.prove_verification_state === 'VERIFIED' || stateLicense.verification_state === 'VERIFIED';
    const isExpired = stateLicense.expiry_state === 'EXPIRED';

    if (isExpired) {
      licScore = 2;
      licAlignment = 'PARTIAL';
      licNegative.push(
        `Recorded trade license (${stateLicense.policy_or_license_number || 'Active'}) has an expired validity date.`
      );
      whyItDidNotMatch.push(`State trade license is expired on file`);
      licGaps.push(`Renew and update trade license in COMPLY`);
      dataGaps.push({
        id: 'gap-license-renewal',
        dimension: 'compliance_licensing',
        title: 'Renew Expired Trade License',
        description: `Trade license ${stateLicense.policy_or_license_number} is flagged as expired. Update current expiration dates.`,
        actionRecommendation: 'Update license in COMPLY',
        actionHref: `/workspace/comply/${stateLicense.id}`,
      });
    } else if (isVerified) {
      licScore = 8;
      licAlignment = 'STRONG';
      licPositive.push(
        `Active, verified trade license on file for ${stateLicense.state} (${stateLicense.policy_or_license_number || 'Active'}).`
      );
      whyItMatched.push(
        `Verified trade license on file for ${stateLicense.state} (${stateLicense.policy_or_license_number || 'Active'})`
      );
    } else {
      licScore = 6;
      licAlignment = 'GOOD';
      licPositive.push(
        `Active trade license record on file for ${stateLicense.state} (${stateLicense.policy_or_license_number || 'Active'}).`
      );
      licNegative.push(`License record has not completed formal Avorria verification review.`);
      whyItMatched.push(`Active trade license on file for ${stateLicense.state}`);
      licGaps.push(`Submit trade license for verification review in PROVE`);
      dataGaps.push({
        id: 'gap-license-verify',
        dimension: 'compliance_licensing',
        title: 'Verify Trade License',
        description: 'Submit your trade license document to Avorria Verification for official verification standing.',
        actionRecommendation: 'Request Verification in PROVE',
        actionHref: '/workspace/prove',
      });
    }

    licRecords.push({
      recordId: stateLicense.id,
      recordTitle: `${stateLicense.title || stateLicense.display_label} (${stateLicense.policy_or_license_number || 'Active'})`,
      recordType: 'credential',
      verificationState: isVerified ? 'VERIFIED' : 'CONTRACTOR_SUPPLIED',
      verificationRef: stateLicense.prove_verification_ref,
      linkHref: `/workspace/comply/${stateLicense.id}`,
    });
  } else {
    licScore = 0;
    licAlignment = 'NOT_ALIGNED';
    licNegative.push(`Client requires trade license in ${oppState}, but no matching active license record is on file.`);
    whyItDidNotMatch.push(`Missing mandatory trade license for ${oppState}`);
    licGaps.push(`Add ${oppState} trade license to COMPLY`);
    dataGaps.push({
      id: 'gap-missing-license',
      dimension: 'compliance_licensing',
      title: `Trade License Required (${oppState})`,
      description: `Client explicitly requires an active trade license in ${oppState}. Record the credential in COMPLY.`,
      actionRecommendation: 'Add license in COMPLY',
      actionHref: '/workspace/comply/new?type=trade_license',
    });
  }

  dimensions.compliance_licensing = {
    dimension: 'compliance_licensing',
    label: 'Trade Licensing Compliance',
    alignment: licAlignment,
    weight: 8,
    score: licScore,
    maxScore: 8,
    opportunityRequirement: licenseRequired ? `Trade license mandatory in ${oppState}` : 'Not mandated',
    contractorStanding: stateLicense
      ? `${stateLicense.title || stateLicense.display_label} (${stateLicense.policy_or_license_number || 'Active'})`
      : 'No state license record on file',
    positiveReasons: licPositive,
    negativeReasons: licNegative,
    dataGaps: licGaps,
    sourceRecords: licRecords,
  };

  requirementComparisons.push({
    id: 'req-license',
    title: 'Trade License Credential',
    category: 'license',
    opportunityCriterion: licenseRequired ? `Mandatory state license (${oppState})` : 'Optional',
    contractorStatus:
      licAlignment === 'STRONG' || licAlignment === 'GOOD'
        ? 'MATCHED'
        : licAlignment === 'PARTIAL'
        ? 'REQUIRES REVIEW'
        : 'NOT FOUND',
    details: licPositive[0] || licNegative[0] || 'No license record found',
    sourceRecordId: licRecords[0]?.recordId,
    sourceRecordTitle: licRecords[0]?.recordTitle,
    sourceRecordHref: licRecords[0]?.linkHref,
    verificationRef: licRecords[0]?.verificationRef,
  });

  // ─────────────────────────────────────────────────────────────
  // 8. COMPLIANCE: INSURANCE FIT (Weight: 4 pts)
  // ─────────────────────────────────────────────────────────────
  totalDataFieldsChecked++;
  const insRequired = Boolean(opportunity.requirements?.generalLiabilityRequired);
  let insScore = 0;
  let insAlignment: FitAlignment = 'NOT_ALIGNED';
  const insPositive: string[] = [];
  const insNegative: string[] = [];
  const insGaps: string[] = [];
  const insRecords: TraceableSourceRecord[] = [];

  const coiRecord = passport.complianceRecords.find(
    (c) =>
      c.category === 'insurance' ||
      c.credential_type?.includes('general_liability') ||
      c.credential_type?.includes('coi')
  );

  if (!insRequired) {
    insScore = 4;
    insAlignment = 'STRONG';
    insPositive.push(`General liability insurance is not explicitly mandated.`);
    totalDataFieldsPresent++;
  } else if (coiRecord) {
    totalDataFieldsPresent++;
    const isVerified =
      coiRecord.prove_verification_state === 'VERIFIED' || coiRecord.verification_state === 'VERIFIED';
    const isExpired = coiRecord.expiry_state === 'EXPIRED';

    if (isExpired) {
      insScore = 1;
      insAlignment = 'PARTIAL';
      insNegative.push(`Recorded COI has an expired coverage period.`);
      whyItDidNotMatch.push(`General Liability COI is expired on file`);
      insGaps.push(`Upload current Certificate of Insurance to COMPLY`);
      dataGaps.push({
        id: 'gap-ins-renewal',
        dimension: 'compliance_insurance',
        title: 'Renew General Liability COI',
        description: 'Update your Certificate of Insurance with current policy effective and expiration dates.',
        actionRecommendation: 'Update COI in COMPLY',
        actionHref: `/workspace/comply/${coiRecord.id}`,
      });
    } else if (isVerified) {
      insScore = 4;
      insAlignment = 'STRONG';
      insPositive.push(
        `Verified General Liability Certificate of Insurance on file ($${(
          coiRecord.coverage_amount || 0
        ).toLocaleString()} limit).`
      );
      whyItMatched.push(`Verified General Liability COI on file`);
    } else {
      insScore = 3;
      insAlignment = 'GOOD';
      insPositive.push(`Active General Liability policy on file.`);
      whyItMatched.push(`Active General Liability policy recorded`);
    }

    insRecords.push({
      recordId: coiRecord.id,
      recordTitle: coiRecord.title || coiRecord.display_label || 'General Liability COI',
      recordType: 'credential',
      verificationState: isVerified ? 'VERIFIED' : 'CONTRACTOR_SUPPLIED',
      verificationRef: coiRecord.prove_verification_ref,
      linkHref: `/workspace/comply/${coiRecord.id}`,
    });
  } else {
    insScore = 0;
    insAlignment = 'NOT_ALIGNED';
    insNegative.push(`Client requires General Liability insurance, but no COI record is currently on file.`);
    whyItDidNotMatch.push(`Missing General Liability Certificate of Insurance`);
    insGaps.push(`Upload Certificate of Insurance to COMPLY`);
    dataGaps.push({
      id: 'gap-missing-ins',
      dimension: 'compliance_insurance',
      title: 'General Liability Insurance Required',
      description: 'Upload your current Certificate of Insurance (COI) to satisfy procurement requirements.',
      actionRecommendation: 'Upload COI in COMPLY',
      actionHref: '/workspace/comply/new?type=general_liability',
    });
  }

  dimensions.compliance_insurance = {
    dimension: 'compliance_insurance',
    label: 'Commercial Insurance Coverage',
    alignment: insAlignment,
    weight: 4,
    score: insScore,
    maxScore: 4,
    opportunityRequirement: insRequired ? 'General Liability insurance required' : 'Not mandated',
    contractorStanding: coiRecord
      ? `${coiRecord.title || coiRecord.display_label}${
          coiRecord.coverage_amount ? ` ($${coiRecord.coverage_amount.toLocaleString()})` : ''
        }`
      : 'No insurance record on file',
    positiveReasons: insPositive,
    negativeReasons: insNegative,
    dataGaps: insGaps,
    sourceRecords: insRecords,
  };

  requirementComparisons.push({
    id: 'req-insurance',
    title: 'General Liability Insurance',
    category: 'insurance',
    opportunityCriterion: insRequired ? 'Mandatory Certificate of Insurance (COI)' : 'Optional',
    contractorStatus:
      insAlignment === 'STRONG' || insAlignment === 'GOOD'
        ? 'MATCHED'
        : insAlignment === 'PARTIAL'
        ? 'REQUIRES REVIEW'
        : 'NOT FOUND',
    details: insPositive[0] || insNegative[0] || 'No insurance record found',
    sourceRecordId: insRecords[0]?.recordId,
    sourceRecordTitle: insRecords[0]?.recordTitle,
    sourceRecordHref: insRecords[0]?.linkHref,
    verificationRef: insRecords[0]?.verificationRef,
  });

  // ─────────────────────────────────────────────────────────────
  // 9. COMPLIANCE: SAFETY FIT (Weight: 4 pts)
  // ─────────────────────────────────────────────────────────────
  totalDataFieldsChecked++;
  const safetyRequired = Boolean(opportunity.requirements?.safetyPlanRequired);
  let safetyScore = 0;
  let safetyAlignment: FitAlignment = 'NOT_ALIGNED';
  const safetyPositive: string[] = [];
  const safetyNegative: string[] = [];
  const safetyGaps: string[] = [];
  const safetyRecords: TraceableSourceRecord[] = [];

  const safetyRecord = passport.complianceRecords.find(
    (c) => c.category === 'safety' || c.credential_type?.includes('safety')
  );

  if (!safetyRequired) {
    safetyScore = 4;
    safetyAlignment = 'STRONG';
    safetyPositive.push(`Site safety plan is not explicitly required at initial stage.`);
    totalDataFieldsPresent++;
  } else if (safetyRecord) {
    totalDataFieldsPresent++;
    safetyScore = 4;
    safetyAlignment = 'STRONG';
    safetyPositive.push(`Documented safety program/manual on file (${safetyRecord.title || safetyRecord.display_label}).`);
    whyItMatched.push(`Documented safety manual on file (${safetyRecord.title || safetyRecord.display_label})`);

    safetyRecords.push({
      recordId: safetyRecord.id,
      recordTitle: safetyRecord.title || safetyRecord.display_label || 'Safety Manual',
      recordType: 'credential',
      verificationState: safetyRecord.prove_verification_state === 'VERIFIED' ? 'VERIFIED' : 'CONTRACTOR_SUPPLIED',
      verificationRef: safetyRecord.prove_verification_ref,
      linkHref: `/workspace/comply/${safetyRecord.id}`,
    });
  } else {
    safetyScore = 0;
    safetyAlignment = 'NOT_ALIGNED';
    safetyNegative.push(`Client requires a documented site safety plan; no safety manual is recorded in COMPLY.`);
    whyItDidNotMatch.push(`Missing site safety plan / written safety program`);
    safetyGaps.push(`Upload written safety program to COMPLY`);
    dataGaps.push({
      id: 'gap-missing-safety',
      dimension: 'compliance_safety',
      title: 'Safety Program Documentation',
      description: 'Upload your company written safety program or injury prevention plan.',
      actionRecommendation: 'Add Safety Program in COMPLY',
      actionHref: '/workspace/comply/new?type=safety_manual',
    });
  }

  dimensions.compliance_safety = {
    dimension: 'compliance_safety',
    label: 'Safety Plan & Compliance',
    alignment: safetyAlignment,
    weight: 4,
    score: safetyScore,
    maxScore: 4,
    opportunityRequirement: safetyRequired ? 'Written safety manual / site safety plan required' : 'Not mandated',
    contractorStanding: safetyRecord
      ? safetyRecord.title || safetyRecord.display_label
      : 'No safety documentation on file',
    positiveReasons: safetyPositive,
    negativeReasons: safetyNegative,
    dataGaps: safetyGaps,
    sourceRecords: safetyRecords,
  };

  requirementComparisons.push({
    id: 'req-safety',
    title: 'Site Safety Program',
    category: 'safety',
    opportunityCriterion: safetyRequired ? 'Mandatory documented safety plan' : 'Optional',
    contractorStatus: safetyAlignment === 'STRONG' ? 'MATCHED' : 'NOT FOUND',
    details: safetyPositive[0] || safetyNegative[0] || 'No safety record found',
    sourceRecordId: safetyRecords[0]?.recordId,
    sourceRecordTitle: safetyRecords[0]?.recordTitle,
    sourceRecordHref: safetyRecords[0]?.linkHref,
    verificationRef: safetyRecords[0]?.verificationRef,
  });

  // ─────────────────────────────────────────────────────────────
  // 10. EVIDENCE & VERIFICATION STANDING (Weight: 4 pts)
  // ─────────────────────────────────────────────────────────────
  totalDataFieldsChecked++;
  const verifRequired = Boolean(opportunity.requirements?.verificationRequired);
  let verifScore = 0;
  let verifAlignment: FitAlignment = 'LIMITED';
  const verifPositive: string[] = [];
  const verifNegative: string[] = [];
  const verifGaps: string[] = [];
  const verifRecords: TraceableSourceRecord[] = [];

  const verifiedEvidence = passport.evidenceItems.filter((e) => e.verification_state === 'VERIFIED');
  const docSupportedEvidence = passport.evidenceItems.filter((e) => e.verification_state === 'DOCUMENT_SUPPORTED');
  const hasFormalVerification = verifiedEvidence.length > 0;

  if (hasFormalVerification) {
    verifScore = 4;
    verifAlignment = 'STRONG';
    totalDataFieldsPresent++;
    verifPositive.push(
      `Contractor maintains ${verifiedEvidence.length} formally verified evidence item(s) (AV-VER-XXXXXX references).`
    );
    whyItMatched.push(`Formally verified evidence on file with Avorria verification references`);

    verifiedEvidence.slice(0, 2).forEach((e) => {
      verifRecords.push({
        recordId: e.id,
        recordTitle: e.title,
        recordType: 'evidence',
        verificationState: 'VERIFIED',
        verificationRef: e.verification_reference,
        linkHref: `/workspace/prove/evidence/${e.id}`,
      });
    });
  } else if (docSupportedEvidence.length > 0) {
    verifScore = 3;
    verifAlignment = 'GOOD';
    totalDataFieldsPresent++;
    verifPositive.push(
      `Contractor has ${docSupportedEvidence.length} document-supported evidence records submitted to PROVE.`
    );
    if (verifRequired) {
      verifNegative.push(
        `Client requires completed verification; records are currently documented but pending formal review.`
      );
      whyItDidNotMatch.push(`Evidence is document-supported but pending formal verification`);
      verifGaps.push(`Request formal review in PROVE`);
      dataGaps.push({
        id: 'gap-verif-review',
        dimension: 'evidence_verification',
        title: 'Formal Verification Review',
        description: 'Submit document-supported items to Avorria controlled review to obtain official verification.',
        actionRecommendation: 'Submit to Verification in PROVE',
        actionHref: '/workspace/prove',
      });
    }
  } else if (!verifRequired) {
    verifScore = 2;
    verifAlignment = 'PARTIAL';
    verifPositive.push(`Formal verification is not strictly required for this discovery listing.`);
    totalDataFieldsPresent++;
  } else {
    verifScore = 0;
    verifAlignment = 'NOT_ALIGNED';
    verifNegative.push(`Opportunity requires formal verification standing; contractor has no verified evidence on file.`);
    whyItDidNotMatch.push(`Missing mandatory formal verification standing`);
    verifGaps.push(`Upload supporting evidence to PROVE and request verification`);
    dataGaps.push({
      id: 'gap-verif-needed',
      dimension: 'evidence_verification',
      title: 'Avorria Verification Required',
      description: 'Client mandates verified credentials. Upload documents to PROVE and request review.',
      actionRecommendation: 'Upload Evidence in PROVE',
      actionHref: '/workspace/prove',
    });
  }

  dimensions.evidence_verification = {
    dimension: 'evidence_verification',
    label: 'Evidence & Verification Standing',
    alignment: verifAlignment,
    weight: 4,
    score: verifScore,
    maxScore: 4,
    opportunityRequirement: verifRequired ? 'Avorria Verification mandatory' : 'Optional / Recommended',
    contractorStanding: hasFormalVerification
      ? `${verifiedEvidence.length} verified item(s)`
      : `${passport.evidenceItems.length} total evidence item(s)`,
    positiveReasons: verifPositive,
    negativeReasons: verifNegative,
    dataGaps: verifGaps,
    sourceRecords: verifRecords,
  };

  requirementComparisons.push({
    id: 'req-verification',
    title: 'Controlled Verification Standing',
    category: 'license',
    opportunityCriterion: verifRequired ? 'Mandatory formal verification' : 'Recommended',
    contractorStatus: hasFormalVerification ? 'MATCHED' : verifRequired ? 'NOT FOUND' : 'PARTIAL',
    details: verifPositive[0] || verifNegative[0] || 'No verified evidence items',
    sourceRecordId: verifRecords[0]?.recordId,
    sourceRecordTitle: verifRecords[0]?.recordTitle,
    sourceRecordHref: verifRecords[0]?.linkHref,
    verificationRef: verifRecords[0]?.verificationRef,
  });

  // ─────────────────────────────────────────────────────────────
  // 11. OVERALL DETERMINISTIC FIT DERIVATION
  // ─────────────────────────────────────────────────────────────
  const totalScore = Object.values(dimensions).reduce((sum, d) => sum + d.score, 0);
  const dataCoveragePercent = Math.round((totalDataFieldsPresent / totalDataFieldsChecked) * 100);

  let overallFitState: OverallFitState = 'LIMITED FIT';
  if (dataCoveragePercent < 30) {
    overallFitState = 'INSUFFICIENT DATA';
  } else if (totalScore >= 80) {
    overallFitState = 'STRONG FIT';
  } else if (totalScore >= 60) {
    overallFitState = 'GOOD FIT';
  } else if (totalScore >= 40) {
    overallFitState = 'PARTIAL FIT';
  } else {
    overallFitState = 'LIMITED FIT';
  }

  return {
    opportunityId: opportunity.id,
    opportunityTitle: opportunity.title,
    opportunityClient: opportunity.client_name,
    opportunityLocation: `${opportunity.location.city ? opportunity.location.city + ', ' : ''}${
      opportunity.location.state
    }`,
    opportunityEstimatedValue: oppValue,
    contractorOrgId: org.id,
    contractorName: org.name,
    overallFitState,
    fitScore: totalScore,
    maxScore: 100,
    dataCoveragePercent,
    dimensions,
    requirementComparisons,
    whyItMatched: Array.from(new Set(whyItMatched)),
    whyItDidNotMatch: Array.from(new Set(whyItDidNotMatch)),
    dataGaps,
    engineVersion: CONTRACTOR_FIT_ENGINE_VERSION,
    evaluatedAt: new Date().toISOString(),
    commercialDisclaimer: DISCLAIMER_TEXT,
  };
}

/**
 * High-level service function fetching authoritative data and computing fit.
 */
export async function evaluateContractorOpportunityFit(
  opportunityId: string,
  contractorOrgId: string
): Promise<ContractorOpportunityFit | null> {
  const [opp, passport] = await Promise.all([
    getDiscoverOpportunityById(opportunityId, contractorOrgId),
    getAssembledPassport(contractorOrgId),
  ]);

  if (!opp || !passport) {
    return null;
  }

  return computeContractorOpportunityFit(opp, passport);
}
