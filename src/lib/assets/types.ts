/**
 * AVORRIA ASSETS — DOMAIN TYPES
 * Prompt 3: Asset & Media Intelligence
 *
 * TypeScript interfaces + Zod schemas for all 5 asset entities.
 * Enums match the SQL enums defined in migration 00013.
 */

import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────

export const ASSET_TYPES = [
  'vehicle',
  'power_tool',
  'heavy_equipment',
  'hvac_unit',
  'generator',
  'other',
] as const;
export type AssetType = (typeof ASSET_TYPES)[number];

export const ASSET_STATUSES = ['active', 'in_repair', 'retired'] as const;
export type AssetStatus = (typeof ASSET_STATUSES)[number];

export const ASSET_DOCUMENT_TYPES = [
  'manual',
  'spec_sheet',
  'warranty',
  'service_record',
  'photo',
  'invoice',
  'other',
] as const;
export type AssetDocumentType = (typeof ASSET_DOCUMENT_TYPES)[number];

export const EXTRACTION_STATUSES = [
  'pending',
  'complete',
  'failed',
  'not_applicable',
] as const;
export type ExtractionStatus = (typeof EXTRACTION_STATUSES)[number];

// ─────────────────────────────────────────────────────────────
// ZOD SCHEMAS
// ─────────────────────────────────────────────────────────────

export const AssetSchema = z.object({
  id: z.string().uuid(),
  org_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  asset_type: z.enum(ASSET_TYPES),
  manufacturer: z.string().min(1).max(200),
  model_number: z.string().max(100).optional(),
  serial_number: z.string().max(100).optional(),
  purchase_date: z.string().optional(), // ISO date string
  warranty_expiration: z.string().optional(),
  current_location: z.string().max(300).optional(),
  status: z.enum(ASSET_STATUSES).default('active'),
  notes: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Asset = z.infer<typeof AssetSchema>;

export const CreateAssetInputSchema = z.object({
  name: z.string().min(1).max(200),
  asset_type: z.enum(ASSET_TYPES),
  manufacturer: z.string().min(1).max(200),
  model_number: z.string().max(100).optional(),
  serial_number: z.string().max(100).optional(),
  purchase_date: z.string().optional(),
  warranty_expiration: z.string().optional(),
  current_location: z.string().max(300).optional(),
  notes: z.string().optional(),
});
export type CreateAssetInput = z.infer<typeof CreateAssetInputSchema>;

export const AssetDocumentSchema = z.object({
  id: z.string().uuid(),
  org_id: z.string().uuid(),
  asset_id: z.string().uuid(),
  firebase_storage_url: z.string().url(),
  firebase_storage_path: z.string().min(1),
  document_type: z.enum(ASSET_DOCUMENT_TYPES),
  file_name: z.string().min(1),
  mime_type: z.string().optional(),
  file_size_bytes: z.number().int().nonnegative().optional(),
  uploaded_by_user_id: z.string().uuid().optional(),
  extracted_text: z.string().optional(),
  extraction_status: z.enum(EXTRACTION_STATUSES).default('pending'),
  uploaded_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type AssetDocument = z.infer<typeof AssetDocumentSchema>;

export const DocumentChunkSchema = z.object({
  id: z.string().uuid(),
  org_id: z.string().uuid(),
  asset_document_id: z.string().uuid(),
  chunk_index: z.number().int().nonnegative(),
  chunk_text: z.string().min(1),
  embedding: z.array(z.number()).optional(), // 1536-dimensional
  source_type: z.enum(['document', 'service_log']).default('document'),
  service_log_id: z.string().uuid().optional(),
  created_at: z.string(),
});
export type DocumentChunk = z.infer<typeof DocumentChunkSchema>;

export const ServiceLogSchema = z.object({
  id: z.string().uuid(),
  org_id: z.string().uuid(),
  asset_id: z.string().uuid(),
  service_date: z.string().min(1), // ISO date
  technician_name: z.string().min(1).max(200),
  work_performed: z.string().min(1),
  parts_used: z.array(z.string()).default([]),
  linked_document_id: z.string().uuid().optional(),
  cost: z.number().nonnegative().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type ServiceLog = z.infer<typeof ServiceLogSchema>;

export const CreateServiceLogInputSchema = z.object({
  service_date: z.string().min(1),
  technician_name: z.string().min(1).max(200),
  work_performed: z.string().min(1),
  parts_used: z.array(z.string()).default([]),
  linked_document_id: z.string().uuid().optional(),
  cost: z.number().nonnegative().optional(),
});
export type CreateServiceLogInput = z.infer<typeof CreateServiceLogInputSchema>;

export const SparePartSchema = z.object({
  id: z.string().uuid(),
  org_id: z.string().uuid(),
  part_number: z.string().min(1).max(100),
  description: z.string().min(1),
  compatible_asset_ids: z.array(z.string()).default([]),
  supplier_name: z.string().optional(),
  supplier_contact: z.string().optional(),
  unit_cost: z.number().nonnegative().optional(),
  quantity_on_hand: z.number().int().nonnegative().default(0),
  reorder_threshold: z.number().int().nonnegative().default(0),
  created_at: z.string(),
  updated_at: z.string(),
});
export type SparePart = z.infer<typeof SparePartSchema>;

export const CreateSparePartInputSchema = z.object({
  part_number: z.string().min(1).max(100),
  description: z.string().min(1),
  compatible_asset_ids: z.array(z.string()).default([]),
  supplier_name: z.string().optional(),
  supplier_contact: z.string().optional(),
  unit_cost: z.number().nonnegative().optional(),
  quantity_on_hand: z.number().int().nonnegative().default(0),
  reorder_threshold: z.number().int().nonnegative().default(0),
});
export type CreateSparePartInput = z.infer<typeof CreateSparePartInputSchema>;

// ─────────────────────────────────────────────────────────────
// API PAYLOAD TYPES
// ─────────────────────────────────────────────────────────────

export interface RequestUploadUrlInput {
  assetId: string;
  fileName: string;
  mimeType: string;
}

export interface RequestUploadUrlResponse {
  signedUrl: string;
  storagePath: string;
}

export interface ConfirmUploadInput {
  assetId: string;
  storagePath: string;
  documentType: AssetDocumentType;
  fileName: string;
  mimeType?: string;
  fileSizeBytes?: number;
}

// ─────────────────────────────────────────────────────────────
// SEARCH TYPES
// ─────────────────────────────────────────────────────────────

export interface SearchRequest {
  query: string;
}

export interface SearchResponse {
  answered: boolean;
  answer?: string;
  message?: string; // Used when answered = false
  sourceDocuments: AssetDocument[];
}

export interface ChunkWithSimilarity extends DocumentChunk {
  similarity: number;
}

// ─────────────────────────────────────────────────────────────
// DISPLAY HELPERS
// ─────────────────────────────────────────────────────────────

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  vehicle: 'Vehicle',
  power_tool: 'Power Tool',
  heavy_equipment: 'Heavy Equipment',
  hvac_unit: 'HVAC Unit',
  generator: 'Generator',
  other: 'Other',
};

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  active: 'Active',
  in_repair: 'In Repair',
  retired: 'Retired',
};

export const ASSET_DOCUMENT_TYPE_LABELS: Record<AssetDocumentType, string> = {
  manual: 'Manual',
  spec_sheet: 'Spec Sheet',
  warranty: 'Warranty',
  service_record: 'Service Record',
  photo: 'Photo',
  invoice: 'Invoice',
  other: 'Other',
};
