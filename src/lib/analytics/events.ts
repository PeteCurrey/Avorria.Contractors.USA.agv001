/**
 * AVORRIA FUNNEL & CONVERSION ANALYTICS
 * 
 * Tracks genuine product progression events across Passport creation,
 * verification submission, reviewer workflows, and passport sharing.
 * Strictly real events; zero fabricated statistics.
 */

export type AnalyticsEventType =
  | 'passport_started'
  | 'passport_completed'
  | 'passport_published'
  | 'verification_started'
  | 'verification_submitted'
  | 'verification_evidence_requested'
  | 'verification_evidence_uploaded'
  | 'verification_approved'
  | 'verification_rejected'
  | 'passport_shared'
  | 'passport_qr_used'
  | 'directory_searched'
  | 'directory_filter_applied'
  | 'contractor_passport_viewed'
  | 'verified_contractor_viewed'
  | 'shortlist_contractor_added'
  | 'shortlist_contractor_removed'
  | 'enquiry_initiated'
  | 'enquiry_submitted'
  | 'client_onboarding_started'
  | 'client_onboarding_completed'
  | 'contractor_saved'
  | 'contractor_unsaved'
  | 'contractor_connection_requested'
  | 'contractor_connection_accepted'
  | 'contractor_connection_declined'
  | 'opportunity_created'
  | 'contractor_invited_to_opportunity'
  | 'opportunity_response_received'
  | 'opportunity_viewed_by_contractor'
  | 'opportunity_closed';

export interface AnalyticsEvent {
  event: AnalyticsEventType;
  organisationId: string;
  timestamp: string;
  properties?: Record<string, string | number | boolean | undefined>;
}

// In-memory or local buffer for runtime analytics
const eventBuffer: AnalyticsEvent[] = [];

/**
 * Dispatches an analytics event
 */
export function trackEvent(
  event: AnalyticsEventType,
  organisationId: string,
  properties?: Record<string, string | number | boolean | undefined>
): void {
  const payload: AnalyticsEvent = {
    event,
    organisationId,
    timestamp: new Date().toISOString(),
    properties,
  };

  eventBuffer.push(payload);
  if (process.env.NODE_ENV === 'development') {
    // console.log(`[Analytics] ${event}:`, payload);
  }
}

/**
 * Returns buffered events for auditing and tests
 */
export function getTrackedEvents(): AnalyticsEvent[] {
  return [...eventBuffer];
}

/**
 * Resets the event buffer
 */
export function clearTrackedEvents(): void {
  eventBuffer.length = 0;
}
