/**
 * AVORRIA VERIFICATION NOTIFICATIONS & EMAIL EVENT ARCHITECTURE
 * 
 * Defines event interfaces and email notification payloads for the 8 key
 * verification lifecycle events.
 */

export type VerificationNotificationEvent =
  | 'verification_submitted'
  | 'verification_under_review'
  | 'additional_evidence_requested'
  | 'evidence_accepted'
  | 'evidence_rejected'
  | 'verification_approved'
  | 'verification_requires_review'
  | 'verification_suspended';

export interface VerificationNotificationPayload {
  eventType: VerificationNotificationEvent;
  organisationId: string;
  contractorName: string;
  recipientEmail: string;
  criterionName?: string;
  referenceNumber?: string;
  notes?: string;
  actionUrl: string;
  timestamp: string;
}

export interface EmailTemplateData {
  subject: string;
  headline: string;
  preheader: string;
  bodyParagraphs: string[];
  ctaText: string;
  ctaUrl: string;
  disclaimer: string;
}

const EMAIL_DISCLAIMER =
  'Avorria Verified status reflects review against published Avorria verification criteria and does not constitute government licensure, OSHA certification, or a legal compliance guarantee.';

/**
 * Builds email template data for verification lifecycle events
 */
export function buildVerificationEmailTemplate(payload: VerificationNotificationPayload): EmailTemplateData {
  const { eventType, contractorName, criterionName, referenceNumber, notes, actionUrl } = payload;

  switch (eventType) {
    case 'verification_submitted':
      return {
        subject: `Verification Request Received — ${contractorName}`,
        headline: 'Verification Request Received',
        preheader: 'Your credentials have entered the compliance queue for human inspection.',
        bodyParagraphs: [
          `Your verification request for ${contractorName} has been submitted to the Avorria compliance team.`,
          'A trained compliance auditor will inspect your submitted commercial filings, insurance certificates, and safety documentation against our published verification criteria.',
          'Standard inspection turnaround is 1–2 business days.',
        ],
        ctaText: 'View Verification Status',
        ctaUrl: actionUrl,
        disclaimer: EMAIL_DISCLAIMER,
      };

    case 'verification_under_review':
      return {
        subject: `Auditor Assigned: Verification Under Review — ${contractorName}`,
        headline: 'Evidence Inspection in Progress',
        preheader: 'An Avorria compliance officer is currently inspecting your operational evidence.',
        bodyParagraphs: [
          `An Avorria compliance auditor has commenced review of evidence submitted for ${contractorName}.`,
          'You may monitor the status of each individual criterion in your Verification Center.',
        ],
        ctaText: 'Open Verification Center',
        ctaUrl: actionUrl,
        disclaimer: EMAIL_DISCLAIMER,
      };

    case 'additional_evidence_requested':
      return {
        subject: `Action Required: Additional Evidence Requested for ${criterionName || 'Verification'}`,
        headline: 'Clarification or Additional Evidence Requested',
        preheader: 'Our auditor requested updated or clearer documentation to complete verification.',
        bodyParagraphs: [
          `During the review of ${criterionName ? `"${criterionName}"` : 'your submission'}, our auditor requested clarification:`,
          notes ? `"${notes}"` : 'Please upload a clearer or more complete version of the required documentation.',
          'Once provided, your criterion will immediately return to the active review queue.',
        ],
        ctaText: 'Provide Requested Evidence',
        ctaUrl: actionUrl,
        disclaimer: EMAIL_DISCLAIMER,
      };

    case 'evidence_accepted':
      return {
        subject: `Evidence Accepted: ${criterionName} Verified`,
        headline: 'Evidence Accepted',
        preheader: `Your submitted evidence for ${criterionName} has been approved.`,
        bodyParagraphs: [
          `The compliance team has verified your evidence for "${criterionName}".`,
          notes ? `Auditor note: ${notes}` : 'The criterion is now marked as verified on your profile.',
        ],
        ctaText: 'View Verification Center',
        ctaUrl: actionUrl,
        disclaimer: EMAIL_DISCLAIMER,
      };

    case 'evidence_rejected':
      return {
        subject: `Evidence Not Accepted: ${criterionName}`,
        headline: 'Evidence Did Not Meet Criteria',
        preheader: `Submitted documentation for ${criterionName} did not satisfy verification criteria.`,
        bodyParagraphs: [
          `Submitted evidence for "${criterionName}" could not be verified.`,
          notes ? `Reason: ${notes}` : 'Please check the criterion guidelines and upload an acceptable alternative.',
        ],
        ctaText: 'Upload Alternative Evidence',
        ctaUrl: actionUrl,
        disclaimer: EMAIL_DISCLAIMER,
      };

    case 'verification_approved':
      return {
        subject: `Congratulations: ${contractorName} is Verified by Avorria`,
        headline: 'Verified by Avorria',
        preheader: `Official verification reference ${referenceNumber || ''} issued.`,
        bodyParagraphs: [
          `All applicable verification criteria have been successfully reviewed for ${contractorName}.`,
          `Your official verification reference number is ${referenceNumber || 'AV-VER-ACTIVE'}.`,
          'Your public Contractor Passport now displays the Verified by Avorria badge and is ready to share with project owners and general contractors.',
        ],
        ctaText: 'View & Share Passport',
        ctaUrl: actionUrl,
        disclaimer: EMAIL_DISCLAIMER,
      };

    case 'verification_requires_review':
      return {
        subject: `Action Needed: Verification Requires Renewal Review — ${contractorName}`,
        headline: 'Verification Requires Attention',
        preheader: 'One or more underlying policies or licenses have expired.',
        bodyParagraphs: [
          `One or more credentials supporting your verification for ${contractorName} has reached its term expiration or was modified.`,
          notes || 'Please upload updated certificates or licenses to maintain your verified standing.',
        ],
        ctaText: 'Renew Verification Evidence',
        ctaUrl: actionUrl,
        disclaimer: EMAIL_DISCLAIMER,
      };

    case 'verification_suspended':
      return {
        subject: `Notice: Verification Suspended for ${contractorName}`,
        headline: 'Verification Suspended',
        preheader: 'Your verification status has been temporarily suspended by Avorria compliance.',
        bodyParagraphs: [
          `Verification for ${contractorName} has been suspended.`,
          notes ? `Auditor notes: ${notes}` : 'Please contact compliance support or upload updated documentation.',
        ],
        ctaText: 'Contact Compliance',
        ctaUrl: actionUrl,
        disclaimer: EMAIL_DISCLAIMER,
      };
  }
}
