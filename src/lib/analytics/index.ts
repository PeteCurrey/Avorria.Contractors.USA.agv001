/**
 * AVORRIA PROVIDER-AGNOSTIC ANALYTICS EVENT BUS
 * 
 * Tracks explicit conversion funnel stages across the user lifecycle:
 * visitor -> tool_interaction -> lead -> signup -> onboarding -> 
 * first_document -> compliance_setup -> passport_creation -> 
 * verification -> subscription
 * 
 * Pluggable adapters allow future connection to GA4, PostHog, or BigQuery
 * without touching component code.
 */

import { FunnelStage } from '@/types/database';

export interface AnalyticsEventPayload {
  eventName: string;
  funnelStage: FunnelStage;
  properties?: Record<string, unknown>;
  path?: string;
  sessionId?: string;
  userId?: string;
  organisationId?: string;
  timestamp?: string;
}

export type AnalyticsAdapter = (event: AnalyticsEventPayload) => Promise<void> | void;

class AnalyticsEventBus {
  private adapters: AnalyticsAdapter[] = [];
  private isEnabled: boolean = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';

  constructor() {
    // Default development logger adapter
    if (process.env.NODE_ENV === 'development') {
      this.adapters.push((event) => {
        console.log(`[Analytics Event] [${event.funnelStage.toUpperCase()}] ${event.eventName}`, event.properties);
      });
    }
  }

  /**
   * Register a third-party analytics provider adapter (e.g. GA4, PostHog)
   */
  public registerAdapter(adapter: AnalyticsAdapter): void {
    this.adapters.push(adapter);
  }

  /**
   * Emit an analytics event across all registered adapters
   */
  public async track(payload: AnalyticsEventPayload): Promise<void> {
    const fullPayload: AnalyticsEventPayload = {
      ...payload,
      timestamp: payload.timestamp || new Date().toISOString(),
      path: payload.path || (typeof window !== 'undefined' ? window.location.pathname : undefined),
    };

    // Execute registered adapters safely without failing user flows
    for (const adapter of this.adapters) {
      try {
        await adapter(fullPayload);
      } catch (err) {
        console.error('[Analytics] Adapter error:', err);
      }
    }
  }

  // Convenient typed helpers for each core funnel stage
  public async trackVisitorPageView(path: string, properties?: Record<string, unknown>): Promise<void> {
    return this.track({
      eventName: 'page_view',
      funnelStage: 'visitor',
      path,
      properties,
    });
  }

  public async trackToolInteraction(toolSlug: string, toolAction: string, properties?: Record<string, unknown>): Promise<void> {
    return this.track({
      eventName: 'tool_interaction',
      funnelStage: 'tool_interaction',
      properties: { toolSlug, toolAction, ...properties },
    });
  }

  public async trackLeadCapture(leadType: string, sourceUrl: string, properties?: Record<string, unknown>): Promise<void> {
    return this.track({
      eventName: 'lead_captured',
      funnelStage: 'lead',
      properties: { leadType, sourceUrl, ...properties },
    });
  }

  public async trackSignup(userId: string, properties?: Record<string, unknown>): Promise<void> {
    return this.track({
      eventName: 'user_signup',
      funnelStage: 'signup',
      userId,
      properties,
    });
  }

  public async trackFirstDocumentCreated(documentType: string, properties?: Record<string, unknown>): Promise<void> {
    return this.track({
      eventName: 'document_created',
      funnelStage: 'first_document',
      properties: { documentType, ...properties },
    });
  }

  public async trackComplianceSetup(complianceStatus: string, properties?: Record<string, unknown>): Promise<void> {
    return this.track({
      eventName: 'compliance_assessment_run',
      funnelStage: 'compliance_setup',
      properties: { complianceStatus, ...properties },
    });
  }

  public async trackPassportCreation(readinessScore: number, properties?: Record<string, unknown>): Promise<void> {
    return this.track({
      eventName: 'contractor_passport_initialized',
      funnelStage: 'passport_creation',
      properties: { readinessScore, ...properties },
    });
  }

  public async trackVerificationRequested(verificationType: string, properties?: Record<string, unknown>): Promise<void> {
    return this.track({
      eventName: 'verification_requested',
      funnelStage: 'verification',
      properties: { verificationType, ...properties },
    });
  }

  public async trackSubscriptionUpgrade(planId: string, billingCycle: 'monthly' | 'annual', amountCents: number): Promise<void> {
    return this.track({
      eventName: 'plan_upgraded',
      funnelStage: 'subscription',
      properties: { planId, billingCycle, amountCents },
    });
  }
}

export const analytics = new AnalyticsEventBus();
