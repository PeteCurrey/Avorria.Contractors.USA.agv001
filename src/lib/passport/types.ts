/**
 * AVORRIA CONTRACTOR PASSPORT DOMAIN TYPES
 * Phase 6: Granular section toggles, print and sharing support.
 */

export type PassportVisibility =
  | 'private'
  | 'draft'
  | 'published'
  | 'suspended'
  | 'archived';

export interface PassportPublicSettings {
  showInsurance: boolean;
  showLicense: boolean;
  showSafetyProgram: boolean;
  showReadinessScore: boolean;
  showWorkforceSummary: boolean;
  showTrades?: boolean;
  showServiceAreas?: boolean;
  showCredentials?: boolean;
  showVerification?: boolean;
  customHeadline?: string;
}

export interface PassportCompletionItem {
  id: string;
  category: 'business_identity' | 'trades_service' | 'credentials' | 'safety_operations';
  label: string;
  description: string;
  weight: number;
  satisfied: boolean;
  actionUrl: string;
  actionLabel: string;
}

export interface PassportCompletionResult {
  completionPercentage: number;
  isComplete: boolean;
  items: PassportCompletionItem[];
  missingItems: PassportCompletionItem[];
  categoryBreakdown: Array<{
    category: string;
    label: string;
    percentage: number;
  }>;
}

export interface PublicationEligibilityResult {
  eligible: boolean;
  reasons: string[];
  blockers: string[];
  recommendations: string[];
}

/**
 * Public Sanitized DTO for /contractors/[slug] and /contractors/[slug]/verification
 * ZERO private documents, internal notes, storage paths, or auth data.
 */
export interface PublicPassportDTO {
  slug: string;
  businessName: string;
  legalName?: string;
  headline?: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  primaryLocation: string;
  trades: Array<{ slug: string; name: string }>;
  serviceAreas: {
    primaryState: string;
    cities: string[];
    radiusMiles?: number;
  };
  employeeCount?: number;
  yearsInBusiness?: number;
  
  // Public Section Visibility Controls
  publicSettings?: PassportPublicSettings;

  // Verification State
  verification: {
    isVerified: boolean;
    status: 'verified' | 'verification_in_progress' | 'not_verified' | 'verification_expired' | 'verification_suspended';
    referenceNumber?: string; // AV-VER-XXXXXX
    verifiedAt?: string;
    validUntil?: string;
    criteriaVersion?: string;
    verifiedCategories: Array<{
      category: string;
      name: string;
      statement: string;
    }>;
  };

  // Curated Credential Statements (No private documents)
  credentials: {
    insurance?: {
      verified: boolean;
      coverageType: string;
      insurerName?: string;
      expiryDate?: string;
      status: 'verified' | 'unverified';
    };
    license?: {
      verified: boolean;
      licenseType: string;
      issuingAuthority?: string;
      jurisdiction?: string;
      expiryDate?: string;
      status: 'verified' | 'unverified';
    };
    safetyProgram?: {
      verified: boolean;
      programType: string;
      lastActiveDate?: string;
      status: 'verified' | 'unverified';
    };
  };

  // Readiness Score (if permitted by contractor)
  readinessScore?: {
    score: number;
    label: string;
    disclaimer: string;
  };

  publishedAt: string;
  lastReviewedAt: string;
  disclaimer: string;
}
