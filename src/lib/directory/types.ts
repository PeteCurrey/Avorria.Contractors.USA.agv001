/**
 * AVORRIA CONTRACTOR DIRECTORY DOMAIN TYPES
 * Phase 7: Canonical public discovery engine data structures.
 */

import type { AggregateVerificationStatus } from '@/lib/verification/types';

export interface DirectoryContractorDTO {
  slug: string;
  businessName: string;
  legalName?: string;
  headline?: string;
  description?: string;
  primaryLocation: string;
  primaryState: string;
  cities: string[];
  trades: Array<{ slug: string; name: string }>;
  yearsInBusiness?: number;
  employeeCount?: number;
  readinessScore?: number;
  isVerified: boolean;
  verificationStatus: AggregateVerificationStatus;
  verificationReference?: string;
  criteriaVersion?: string;
  publicCredentials: {
    hasInsurance: boolean;
    insuranceVerified: boolean;
    hasLicense: boolean;
    licenseVerified: boolean;
    hasSafetyProgram: boolean;
    safetyProgramVerified: boolean;
  };
  publishedAt: string;
}

export type VerificationFilterOption = 'all' | 'verified' | 'published';

export type DirectorySortOption = 'relevance' | 'verified_first' | 'readiness' | 'name';

export interface DirectorySearchParams {
  query?: string;
  trade?: string;
  location?: string;
  verificationStatus?: VerificationFilterOption;
  sort?: DirectorySortOption;
  page?: number;
  limit?: number;
}

export interface DirectoryFacetCount {
  slug: string;
  name: string;
  count: number;
}

export interface DirectorySearchResult {
  contractors: DirectoryContractorDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  activeFilters: {
    query?: string;
    trade?: string;
    location?: string;
    verificationStatus: VerificationFilterOption;
    sort: DirectorySortOption;
  };
  facets: {
    trades: DirectoryFacetCount[];
    states: DirectoryFacetCount[];
    totalVerified: number;
    totalPublished: number;
  };
}
