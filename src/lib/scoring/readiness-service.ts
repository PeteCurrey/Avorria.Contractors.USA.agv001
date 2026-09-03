import { EvaluatedRequirement } from '@/lib/compliance/engine';

export interface DynamicReadinessResult {
  score: number; // 0 - 100
  label: string; // e.g. "82% Ready" or "Readiness assessment in progress"
  status: 'assessment_in_progress' | 'evaluated';
  summaryMessage: string;
  categoryBreakdown: {
    category: string;
    label: string;
    percentage: number;
    earnedWeight: number;
    applicableWeight: number;
    itemCount: number;
  }[];
  outstandingItems: {
    id: string;
    title: string;
    type: string;
    actionLabel: string;
    actionHref: string;
  }[];
  completedCount: number;
  applicableCount: number;
  disclaimer: string;
}

export const READINESS_DISCLAIMER =
  'The Avorria Contractor Readiness Score measures completion against Avorria operational readiness criteria only. It is not a government, OSHA, statutory or legal certification, and does not imply regulatory compliance or guaranteed safety.';

/**
 * Computes the dynamic Contractor Readiness Score based on applicable evaluated requirements.
 * 
 * CRITICAL SAFEGUARDS:
 * 1. Requirements marked 'not_applicable' are completely excluded from the denominator (they never penalize the score).
 * 2. If no applicable data exists yet (new contractor), status is 'assessment_in_progress' rather than a fabricated 0% or 100%.
 */
export function computeDynamicReadinessScore(
  requirements: EvaluatedRequirement[],
  hasCompletedOnboarding: boolean
): DynamicReadinessResult {
  // If contractor has not completed basic onboarding, honest 'in progress' state
  if (!hasCompletedOnboarding || requirements.length === 0) {
    return {
      score: 0,
      label: 'Readiness assessment in progress',
      status: 'assessment_in_progress',
      summaryMessage: 'Complete your business profile and trade onboarding to calculate your operational readiness.',
      categoryBreakdown: [],
      outstandingItems: [
        {
          id: 'complete_onboarding',
          title: 'Complete Contractor Onboarding',
          type: 'avorria_readiness',
          actionLabel: 'Resume Onboarding',
          actionHref: '/app/onboarding',
        },
      ],
      completedCount: 0,
      applicableCount: 0,
      disclaimer: READINESS_DISCLAIMER,
    };
  }

  // Filter out non-applicable items
  const applicableRequirements = requirements.filter(
    (req) => req.state !== 'not_applicable'
  );

  if (applicableRequirements.length === 0) {
    return {
      score: 0,
      label: 'Readiness assessment in progress',
      status: 'assessment_in_progress',
      summaryMessage: 'Add business information and trades to identify applicable readiness requirements.',
      categoryBreakdown: [],
      outstandingItems: [],
      completedCount: 0,
      applicableCount: 0,
      disclaimer: READINESS_DISCLAIMER,
    };
  }

  let totalApplicableWeight = 0;
  let earnedWeight = 0;
  let completedCount = 0;

  const categoryMap: Record<
    string,
    { label: string; earned: number; total: number; count: number }
  > = {
    legal_regulatory: { label: 'Statutory & Regulatory', earned: 0, total: 0, count: 0 },
    client_prequal: { label: 'Insurance & Prequalification', earned: 0, total: 0, count: 0 },
    industry_standard: { label: 'Industry Safety Standards', earned: 0, total: 0, count: 0 },
    avorria_readiness: { label: 'Operational Documentation', earned: 0, total: 0, count: 0 },
  };

  const outstandingItems: {
    id: string;
    title: string;
    type: string;
    actionLabel: string;
    actionHref: string;
  }[] = [];

  for (const req of applicableRequirements) {
    totalApplicableWeight += req.readinessWeight;
    const cat = categoryMap[req.type] || categoryMap.avorria_readiness;
    cat.total += req.readinessWeight;
    cat.count += 1;

    if (req.state === 'current') {
      earnedWeight += req.readinessWeight;
      cat.earned += req.readinessWeight;
      completedCount += 1;
    } else {
      outstandingItems.push({
        id: req.id,
        title: req.title,
        type: req.type,
        actionLabel: req.actionLabel,
        actionHref: req.actionHref,
      });
    }
  }

  const score = totalApplicableWeight > 0
    ? Math.round((earnedWeight / totalApplicableWeight) * 100)
    : 0;

  const categoryBreakdown = Object.entries(categoryMap)
    .filter(([_, data]) => data.count > 0 && data.total > 0)
    .map(([catKey, data]) => ({
      category: catKey,
      label: data.label,
      percentage: Math.round((data.earned / data.total) * 100),
      earnedWeight: data.earned,
      applicableWeight: data.total,
      itemCount: data.count,
    }));

  return {
    score,
    label: `${score}% Ready`,
    status: 'evaluated',
    summaryMessage:
      outstandingItems.length === 0
        ? 'All identified operational readiness criteria are currently satisfied.'
        : `${outstandingItems.length} operational requirement${outstandingItems.length > 1 ? 's' : ''} require attention to improve your prequalification readiness.`,
    categoryBreakdown,
    outstandingItems,
    completedCount,
    applicableCount: applicableRequirements.length,
    disclaimer: READINESS_DISCLAIMER,
  };
}
