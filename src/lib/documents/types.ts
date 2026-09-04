import { ProjectContext } from '@/lib/projects/types';

export type DocumentCategory = 'safety' | 'commercial' | 'operations';

export type DocumentTypeSlug =
  | 'jha'
  | 'jsa'
  | 'safety-plan'
  | 'toolbox-talk'
  | 'quote'
  | 'proposal'
  | 'scope-of-work'
  | 'change-order'
  | 'daily-report';

export type DocumentLifecycleState =
  | 'draft'
  | 'ai_draft'
  | 'review_required'
  | 'reviewed'
  | 'final'
  | 'superseded'
  | 'archived';

export type GenerationMethod = 'ai' | 'template' | 'manual';

export interface DocumentTypeDefinition {
  type: DocumentTypeSlug;
  slug: string;
  name: string;
  code: string;
  description: string;
  category: DocumentCategory;
  version: string;
  supportsAi: boolean;
  supportsTemplate: boolean;
  supportsProjectContext: boolean;
  supportsContractorContext: boolean;
  requiresHumanReview: boolean;
  readinessRelevance: boolean;
  active: boolean;
}

/**
 * Universal Section-Based Document Payload
 * Supported across all 9 document types
 */
export interface DocumentSection {
  id: string;
  title: string;
  type: 'text' | 'key_value' | 'table' | 'checklist' | 'hazard_list';
  order: number;
  content: string; // Markdown / prose content
  metadata?: Record<string, unknown>;
  tableData?: {
    headers: string[];
    rows: (string | number)[][];
  };
  checklistData?: {
    label: string;
    checked: boolean;
    notes?: string;
  }[];
}

export interface UniversalDocumentPayload {
  documentType: DocumentTypeSlug;
  title: string;
  referenceNumber: string;
  issueDate: string;
  expiryDate?: string;
  contractor: {
    name: string;
    legalName?: string;
    phone?: string;
    email?: string;
    website?: string;
    primaryTrade?: string;
    licenseNumber?: string;
    jurisdiction?: string;
  };
  project?: ProjectContext;
  sections: DocumentSection[];
  financialSummary?: {
    subtotal: number;
    taxRatePercent?: number;
    taxAmount?: number;
    discountAmount?: number;
    totalAmount: number;
    currency: string;
    paymentTerms?: string;
  };
  signOff: {
    required: boolean;
    signed: boolean;
    signeeName?: string;
    signeeRole?: string;
    signedAt?: string;
    acknowledgmentText: string;
  };
  disclaimer: string;
}

export interface DocumentGenerationRequest {
  documentType: DocumentTypeSlug;
  project?: ProjectContext;
  customInputs?: Record<string, unknown>;
  useAiIfAvailable?: boolean;
}

export interface DocumentGenerationResult {
  title: string;
  documentType: DocumentTypeSlug;
  generationMethod: GenerationMethod;
  generationModel: string;
  payload: UniversalDocumentPayload;
  disclaimer: string;
}
