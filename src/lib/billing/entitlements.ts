/**
 * AVORRIA SERVER-SIDE ENTITLEMENTS ENGINE
 *
 * Single authoritative source of truth for plan gating.
 * Reads subscription_tier and subscription_status directly from the database,
 * never making synchronous request-time calls to Stripe.
 */

import { getOrganization } from '../workspace/db';
import { SubscriptionTier, SubscriptionStatus } from '../workspace/types';
import { getMonthlyGenerationUsage } from './metering';
import { CreateDocumentType } from '../create/types';

export type CanonicalPlanTier = 'free' | 'professional' | 'verified' | 'business';

export interface OrgEntitlements {
  orgId: string;
  tier: CanonicalPlanTier;
  rawTier: SubscriptionTier;
  status: SubscriptionStatus;
  isGracePeriod: boolean;
  limits: {
    monthlyGenerations: number; // -1 for unlimited, 3 for free
    usedGenerationsThisMonth: number;
    remainingGenerationsThisMonth: number;
    teamMembers: number;
  };
  canGenerate: {
    jha: boolean;
    jsa: boolean;
    toolbox_talk: boolean;
    safety_plan: boolean;
    quote: boolean;
    change_order: boolean;
  };
  passport: {
    canPreview: boolean;
    canPublish: boolean;
    isVerified: boolean;
  };
  verification: {
    canSubmitForVerification: boolean;
  };
  hubs: {
    subcontractorComplianceHub: boolean;
    trainingMatrix: boolean;
  };
}

/**
 * Normalizes legacy and alias tier strings to canonical plan IDs.
 */
export function normalizePlanTier(rawTier: SubscriptionTier = 'free'): CanonicalPlanTier {
  switch (rawTier) {
    case 'professional':
    case 'pro':
      return 'professional';
    case 'verified':
      return 'verified';
    case 'business':
    case 'enterprise':
      return 'business';
    case 'free':
    default:
      return 'free';
  }
}

/**
 * Resolves full server-side entitlements for an organization.
 */
export async function getEntitlements(orgId: string): Promise<OrgEntitlements> {
  const org = await getOrganization(orgId);
  const rawTier = org?.subscription_tier || 'free';
  const status: SubscriptionStatus = org?.subscription_status || 'active';

  // If subscription was explicitly canceled or unpaid, fall back to free tier
  const isCanceled = status === 'canceled' || status === 'unpaid';
  const tier: CanonicalPlanTier = isCanceled ? 'free' : normalizePlanTier(rawTier);
  const isGracePeriod = status === 'past_due';

  const usedGenerations = await getMonthlyGenerationUsage(orgId);

  if (tier === 'free') {
    const maxMonthly = 3;
    const remaining = Math.max(0, maxMonthly - usedGenerations);

    return {
      orgId,
      tier: 'free',
      rawTier,
      status,
      isGracePeriod,
      limits: {
        monthlyGenerations: maxMonthly,
        usedGenerationsThisMonth: usedGenerations,
        remainingGenerationsThisMonth: remaining,
        teamMembers: 1,
      },
      canGenerate: {
        jha: true,
        jsa: true,
        toolbox_talk: false,
        safety_plan: false,
        quote: false,
        change_order: false,
      },
      passport: {
        canPreview: true,
        canPublish: false,
        isVerified: false,
      },
      verification: {
        canSubmitForVerification: false,
      },
      hubs: {
        subcontractorComplianceHub: false,
        trainingMatrix: false,
      },
    };
  }

  if (tier === 'professional') {
    return {
      orgId,
      tier: 'professional',
      rawTier,
      status,
      isGracePeriod,
      limits: {
        monthlyGenerations: -1, // Unlimited
        usedGenerationsThisMonth: usedGenerations,
        remainingGenerationsThisMonth: -1,
        teamMembers: 3,
      },
      canGenerate: {
        jha: true,
        jsa: true,
        toolbox_talk: true,
        safety_plan: true,
        quote: true,
        change_order: true,
      },
      passport: {
        canPreview: true,
        canPublish: false, // Verified Contractor tier required for public passport
        isVerified: false,
      },
      verification: {
        canSubmitForVerification: false,
      },
      hubs: {
        subcontractorComplianceHub: false,
        trainingMatrix: false,
      },
    };
  }

  if (tier === 'verified') {
    return {
      orgId,
      tier: 'verified',
      rawTier,
      status,
      isGracePeriod,
      limits: {
        monthlyGenerations: -1,
        usedGenerationsThisMonth: usedGenerations,
        remainingGenerationsThisMonth: -1,
        teamMembers: 10,
      },
      canGenerate: {
        jha: true,
        jsa: true,
        toolbox_talk: true,
        safety_plan: true,
        quote: true,
        change_order: true,
      },
      passport: {
        canPreview: true,
        canPublish: true,
        isVerified: !!org?.is_verified,
      },
      verification: {
        canSubmitForVerification: true,
      },
      hubs: {
        subcontractorComplianceHub: false,
        trainingMatrix: true,
      },
    };
  }

  // Business tier
  return {
    orgId,
    tier: 'business',
    rawTier,
    status,
    isGracePeriod,
    limits: {
      monthlyGenerations: -1,
      usedGenerationsThisMonth: usedGenerations,
      remainingGenerationsThisMonth: -1,
      teamMembers: 50,
    },
    canGenerate: {
      jha: true,
      jsa: true,
      toolbox_talk: true,
      safety_plan: true,
      quote: true,
      change_order: true,
    },
    passport: {
      canPreview: true,
      canPublish: true,
      isVerified: !!org?.is_verified,
    },
    verification: {
      canSubmitForVerification: true,
    },
    hubs: {
      subcontractorComplianceHub: true,
      trainingMatrix: true,
    },
  };
}

/**
 * Server guard: asserts that an organization is entitled to generate the requested document type.
 * Returns failure reason and recommended upgrade tier if blocked.
 */
export async function assertCanGenerateDocument(
  orgId: string,
  docType: CreateDocumentType
): Promise<{ allowed: boolean; reason?: string; upgradeTier?: CanonicalPlanTier }> {
  const entitlements = await getEntitlements(orgId);

  // 1. Feature entitlement check
  if (!entitlements.canGenerate[docType]) {
    const docTitles: Record<CreateDocumentType, string> = {
      jha: 'Job Hazard Analysis',
      jsa: 'Job Safety Analysis',
      toolbox_talk: 'Toolbox Talks',
      safety_plan: 'Construction Safety Plans',
      quote: 'Commercial Quotes',
      change_order: 'Change Orders',
    };
    return {
      allowed: false,
      reason: `${docTitles[docType]} are not included in the Free Starter plan. Upgrade to the Professional plan to unlock site-specific safety plans, quotes, and unlimited generation.`,
      upgradeTier: 'professional',
    };
  }

  // 2. Monthly generation cap check (Free Starter: 3/mo)
  if (
    entitlements.limits.monthlyGenerations > 0 &&
    entitlements.limits.usedGenerationsThisMonth >= entitlements.limits.monthlyGenerations
  ) {
    return {
      allowed: false,
      reason: `You have reached your limit of 3 document generations for this month on the Free Starter plan. Upgrade to Professional for unlimited generation.`,
      upgradeTier: 'professional',
    };
  }

  return { allowed: true };
}

/**
 * Server guard: asserts that an organization is entitled to publish their public Passport.
 */
export async function assertCanPublishPassport(
  orgId: string
): Promise<{ allowed: boolean; reason?: string; upgradeTier?: CanonicalPlanTier }> {
  const entitlements = await getEntitlements(orgId);
  if (!entitlements.passport.canPublish) {
    return {
      allowed: false,
      reason: 'Public Passport publishing and the Verified Contractor badge require the Verified Contractor plan ($79/mo).',
      upgradeTier: 'verified',
    };
  }
  return { allowed: true };
}

/**
 * Server guard: asserts that an organization is entitled to submit for credential verification review.
 */
export async function assertCanSubmitVerification(
  orgId: string
): Promise<{ allowed: boolean; reason?: string; upgradeTier?: CanonicalPlanTier }> {
  const entitlements = await getEntitlements(orgId);
  if (!entitlements.verification.canSubmitForVerification) {
    return {
      allowed: false,
      reason: 'Third-party evidence verification requires the Verified Contractor plan ($79/mo) or Business plan.',
      upgradeTier: 'verified',
    };
  }
  return { allowed: true };
}
