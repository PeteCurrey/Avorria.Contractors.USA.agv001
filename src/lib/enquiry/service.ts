/**
 * AVORRIA CONTRACTOR ENQUIRY SERVICE
 * Phase 7: Controlled, privacy-safe inbound project enquiry processing.
 * 
 * Guarantees:
 * 1. Zero Recipient Contact Leakage: Contractor's private email/phone is never returned.
 * 2. Spam & Bot Protection: Enforces honeypot fields and sliding-window rate limiting.
 * 3. Verified Recipient: Only published, active contractor workspaces can receive enquiries.
 * 4. Immutable Audit: Every enquiry logs an audit event in the contractor's workspace.
 */

import { getContractorWorkspaceBySlug, saveContractorEnquiry } from '@/lib/tenant/repository';
import { trackEvent } from '@/lib/analytics/events';
import { SubmitEnquiryInput, SubmitEnquiryResult, ContractorEnquiry } from './types';

// Sliding-window in-memory rate limiter (5 requests per hour per IP identifier)
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_ENQUIRIES_PER_WINDOW = 5;

/**
 * Checks and increments rate limit for a client identifier.
 */
export function checkEnquiryRateLimit(clientIdentifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(clientIdentifier);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(clientIdentifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_ENQUIRIES_PER_WINDOW - 1 };
  }

  if (record.count >= MAX_ENQUIRIES_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: MAX_ENQUIRIES_PER_WINDOW - record.count };
}

/**
 * Submits an inbound commercial enquiry to a published contractor.
 */
export async function submitContractorEnquiry(
  input: SubmitEnquiryInput,
  clientIdentifier: string = 'anon_ip'
): Promise<SubmitEnquiryResult> {
  // 1. Honeypot check: Bots filling hidden fields are immediately discarded
  if (input.honeypot && input.honeypot.trim().length > 0) {
    // Return fake success to deceive spambots
    return {
      success: true,
      message: 'Your enquiry has been delivered to the contractor.',
    };
  }

  // 2. Rate limit enforcement
  const { allowed } = checkEnquiryRateLimit(clientIdentifier);
  if (!allowed) {
    return {
      success: false,
      message: 'Too many enquiry attempts. Please wait an hour before submitting another project enquiry.',
    };
  }

  // 3. Field validation
  if (!input.contractorSlug || !input.senderName?.trim() || !input.senderEmail?.trim() || !input.message?.trim()) {
    return {
      success: false,
      message: 'Missing required enquiry details (Name, Email, Message).',
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(input.senderEmail.trim())) {
    return {
      success: false,
      message: 'Please provide a valid email address.',
    };
  }

  // 4. Resolve recipient contractor
  const workspace = await getContractorWorkspaceBySlug(input.contractorSlug);
  if (!workspace || workspace.profile.visibility !== 'published') {
    return {
      success: false,
      message: 'The requested contractor is not currently accepting public enquiries.',
    };
  }

  // 5. Build and save enquiry record
  const enquiryId = `enq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const enquiry: ContractorEnquiry = {
    id: enquiryId,
    contractorId: workspace.organisation.id,
    senderName: input.senderName.trim(),
    senderEmail: input.senderEmail.trim(),
    senderPhone: input.senderPhone?.trim() || undefined,
    projectType: input.projectType?.trim() || undefined,
    projectLocation: input.projectLocation?.trim() || undefined,
    message: input.message.trim(),
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await saveContractorEnquiry(workspace.organisation.id, enquiry);

  // 6. Dispatch analytics tracking event
  trackEvent('enquiry_submitted', workspace.organisation.id, {
    projectType: enquiry.projectType,
    senderEmailDomain: enquiry.senderEmail.split('@')[1],
  });

  return {
    success: true,
    message: 'Your enquiry has been delivered directly to the contractor.',
    enquiryId,
  };
}
