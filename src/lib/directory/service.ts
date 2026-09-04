/**
 * AVORRIA CONTRACTOR DIRECTORY SERVICE
 * Phase 7: Deterministic contractor discovery and search engine.
 * 
 * Guarantees:
 * 1. Strict Eligibility: Only published contractors passing publication rules appear.
 * 2. Zero Private Data Leakage: Purges private documents, storage paths, and reviewer IDs.
 * 3. Deterministic Ranking: Prioritizes verified credentials, text relevance, and completeness.
 * 4. Transparent Distinction: "Verified by Avorria" is never conflated with "Published".
 */

import { getAllPublishedContractors, ContractorWorkspaceData } from '@/lib/tenant/repository';
import { evaluateContractorVerification } from '@/lib/verification/engine';
import { STANDARD_TRADES } from '@/lib/trades/registry';
import {
  DirectoryContractorDTO,
  DirectorySearchParams,
  DirectorySearchResult,
  DirectoryFacetCount,
  VerificationFilterOption,
  DirectorySortOption,
} from './types';

/**
 * Transforms an internal contractor workspace into a strictly sanitized directory card DTO.
 */
export function sanitizeContractorForDirectory(ws: ContractorWorkspaceData): DirectoryContractorDTO {
  const verification = evaluateContractorVerification(ws, ws.verificationRecords || []);
  const settings = ws.passportSettings || {
    showInsurance: true,
    showLicense: true,
    showSafetyProgram: true,
    showReadinessScore: true,
    showWorkforceSummary: true,
    showTrades: true,
    showServiceAreas: true,
    showCredentials: true,
    showVerification: true,
  };

  const primaryCity = ws.serviceAreas.cities?.[0] || 'Operating Territory';
  const primaryState = ws.serviceAreas.primaryState || 'TX';

  const trades = ws.trades.map((slug) => {
    const found = STANDARD_TRADES.find((t) => t.slug === slug);
    return {
      slug,
      name: found?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    };
  });

  const glRecord = verification.records.find(
    (r) => r.category === 'insurance' && r.status === 'verified'
  );
  const licRecord = verification.records.find(
    (r) => r.category === 'licensing' && r.status === 'verified'
  );
  const safRecord = verification.records.find(
    (r) => r.category === 'safety_program' && r.status === 'verified'
  );

  const hasInsuranceDoc = ws.documents.some(
    (d) => d.document_type.includes('insurance') || d.document_type.includes('coi')
  );
  const hasLicDoc = ws.documents.some((d) => d.document_type.includes('license'));
  const hasSafDoc = ws.documents.some(
    (d) => d.document_type.includes('safety') || d.document_type.includes('jha')
  );

  return {
    slug: ws.organisation.slug,
    businessName: ws.organisation.name,
    legalName: ws.organisation.legal_name || undefined,
    headline: settings.customHeadline || `${trades.map((t) => t.name).join(', ')} in ${primaryState}`,
    description: ws.profile.business_description || undefined,
    primaryLocation: `${primaryCity}, ${primaryState}`,
    primaryState,
    cities: ws.serviceAreas.cities || [primaryCity],
    trades: settings.showTrades !== false ? trades : [],
    yearsInBusiness: ws.profile.year_established
      ? new Date().getFullYear() - ws.profile.year_established
      : undefined,
    employeeCount: settings.showWorkforceSummary !== false ? ws.profile.employee_count : undefined,
    readinessScore: settings.showReadinessScore !== false ? ws.profile.readiness_score || 80 : undefined,
    isVerified: verification.isVerified,
    verificationStatus: verification.aggregateStatus,
    verificationReference: verification.verificationReference,
    criteriaVersion: verification.criteriaVersion || '2026.1',
    publicCredentials: {
      hasInsurance: settings.showInsurance !== false && (Boolean(glRecord) || hasInsuranceDoc),
      insuranceVerified: settings.showInsurance !== false && Boolean(glRecord),
      hasLicense: settings.showLicense !== false && (Boolean(licRecord) || hasLicDoc || ws.baselineCredentials.hasTradeLicense),
      licenseVerified: settings.showLicense !== false && Boolean(licRecord),
      hasSafetyProgram: settings.showSafetyProgram !== false && (Boolean(safRecord) || hasSafDoc || ws.baselineCredentials.hasSafetyPlan),
      safetyProgramVerified: settings.showSafetyProgram !== false && Boolean(safRecord),
    },
    publishedAt: ws.profile.onboarding_completed_at || ws.profile.created_at || new Date().toISOString(),
  };
}

/**
 * Executes a deterministic search query across published contractors.
 */
export async function queryContractorDirectory(
  params: DirectorySearchParams = {}
): Promise<DirectorySearchResult> {
  const publishedWorkspaces = await getAllPublishedContractors();

  // Deduplicate workspaces by organization slug to prevent duplicate test entries
  const seenSlugs = new Set<string>();
  const uniqueWorkspaces: ContractorWorkspaceData[] = [];
  for (const ws of publishedWorkspaces) {
    if (ws.organisation?.slug && !seenSlugs.has(ws.organisation.slug)) {
      seenSlugs.add(ws.organisation.slug);
      uniqueWorkspaces.push(ws);
    }
  }

  // Sanitize all eligible workspaces into directory DTOs
  const allContractors = uniqueWorkspaces.map(sanitizeContractorForDirectory);

  // Extract directory-wide facet counts
  const tradeCounts: Record<string, { name: string; count: number }> = {};
  const stateCounts: Record<string, number> = {};
  let totalVerified = 0;

  for (const c of allContractors) {
    if (c.isVerified) totalVerified += 1;
    if (c.primaryState) {
      stateCounts[c.primaryState] = (stateCounts[c.primaryState] || 0) + 1;
    }
    for (const t of c.trades) {
      if (!tradeCounts[t.slug]) {
        tradeCounts[t.slug] = { name: t.name, count: 0 };
      }
      tradeCounts[t.slug].count += 1;
    }
  }

  const queryTerm = (params.query || '').trim().toLowerCase();
  const tradeFilter = (params.trade || '').trim().toLowerCase();
  const locationFilter = (params.location || '').trim().toLowerCase();
  const verificationFilter: VerificationFilterOption = params.verificationStatus || 'all';
  const sortOption: DirectorySortOption = params.sort || 'relevance';
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(50, params.limit || 12));

  // 1. Filtering
  const filtered = allContractors.filter((c) => {
    // Verification status filter
    if (verificationFilter === 'verified' && !c.isVerified) {
      return false;
    }

    // Trade filter
    if (tradeFilter && tradeFilter !== 'all') {
      const matchesTrade = c.trades.some(
        (t) => t.slug === tradeFilter || t.slug.includes(tradeFilter) || t.name.toLowerCase().includes(tradeFilter)
      );
      if (!matchesTrade) return false;
    }

    // Location filter
    if (locationFilter) {
      const matchesLocation =
        c.primaryLocation.toLowerCase().includes(locationFilter) ||
        c.primaryState.toLowerCase() === locationFilter ||
        c.cities.some((city) => city.toLowerCase().includes(locationFilter));
      if (!matchesLocation) return false;
    }

    // Text Query search
    if (queryTerm) {
      const inName = c.businessName.toLowerCase().includes(queryTerm);
      const inLegal = c.legalName ? c.legalName.toLowerCase().includes(queryTerm) : false;
      const inTrades = c.trades.some(
        (t) => t.name.toLowerCase().includes(queryTerm) || t.slug.toLowerCase().includes(queryTerm)
      );
      const inLocation = c.primaryLocation.toLowerCase().includes(queryTerm);
      const inDesc = c.description ? c.description.toLowerCase().includes(queryTerm) : false;

      if (!inName && !inLegal && !inTrades && !inLocation && !inDesc) {
        return false;
      }
    }

    return true;
  });

  // 2. Deterministic Ranking
  const scored = filtered.map((c) => {
    let score = 0;

    // Verified by Avorria priority (+1000)
    if (c.isVerified) {
      score += 1000;
    }

    // Query relevance weighting
    if (queryTerm) {
      const nameLower = c.businessName.toLowerCase();
      if (nameLower === queryTerm) score += 500;
      else if (nameLower.startsWith(queryTerm)) score += 250;
      else if (nameLower.includes(queryTerm)) score += 100;

      if (c.trades.some((t) => t.name.toLowerCase().includes(queryTerm))) score += 50;
      if (c.primaryLocation.toLowerCase().includes(queryTerm)) score += 30;
      if (c.description?.toLowerCase().includes(queryTerm)) score += 10;
    }

    // Readiness score contribution (0 - 100)
    score += c.readinessScore || 0;

    return { contractor: c, score };
  });

  // Sort based on selected option
  scored.sort((a, b) => {
    if (sortOption === 'name') {
      return a.contractor.businessName.localeCompare(b.contractor.businessName);
    }
    if (sortOption === 'readiness') {
      return (b.contractor.readinessScore || 0) - (a.contractor.readinessScore || 0);
    }
    if (sortOption === 'verified_first') {
      if (a.contractor.isVerified !== b.contractor.isVerified) {
        return a.contractor.isVerified ? -1 : 1;
      }
      return (b.contractor.readinessScore || 0) - (a.contractor.readinessScore || 0);
    }
    // Default 'relevance': rank score descending, then alphabetical
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.contractor.businessName.localeCompare(b.contractor.businessName);
  });

  const sortedContractors = scored.map((s) => s.contractor);

  // 3. Pagination
  const total = sortedContractors.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedContractors = sortedContractors.slice(startIndex, startIndex + limit);

  // Facet formatting
  const tradeFacets: DirectoryFacetCount[] = Object.entries(tradeCounts)
    .map(([slug, data]) => ({ slug, name: data.name, count: data.count }))
    .sort((a, b) => b.count - a.count);

  const stateFacets: DirectoryFacetCount[] = Object.entries(stateCounts)
    .map(([state, count]) => ({ slug: state, name: state, count }))
    .sort((a, b) => b.count - a.count);

  return {
    contractors: paginatedContractors,
    total,
    page,
    limit,
    totalPages,
    activeFilters: {
      query: params.query,
      trade: params.trade,
      location: params.location,
      verificationStatus: verificationFilter,
      sort: sortOption,
    },
    facets: {
      trades: tradeFacets,
      states: stateFacets,
      totalVerified,
      totalPublished: allContractors.length,
    },
  };
}
