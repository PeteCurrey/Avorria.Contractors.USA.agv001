/**
 * AVORRIA CONTRACTOR ENQUIRY TYPES
 * Phase 7: Controlled, privacy-safe commercial/project enquiries.
 */

export interface ContractorEnquiry {
  id: string;
  contractorId: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  projectType?: string;
  projectLocation?: string;
  message: string;
  status: 'new' | 'viewed' | 'contacted' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface SubmitEnquiryInput {
  contractorSlug: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  projectType?: string;
  projectLocation?: string;
  message: string;
  honeypot?: string; // Must be empty to defeat spam bots
}

export interface SubmitEnquiryResult {
  success: boolean;
  message: string;
  enquiryId?: string;
}
