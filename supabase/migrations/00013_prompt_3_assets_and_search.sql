-- ============================================================
-- AVORRIA CONTRACTORS USA — MIGRATION 00013
-- Prompt 3: Asset & Media Intelligence
-- Firebase Storage (files) + Supabase (all queryable data)
-- pgvector for RAG search, RLS on all tables
-- ============================================================

-- Enable pgvector extension (requires Supabase Postgres with vector support)
CREATE EXTENSION IF NOT EXISTS vector;

-- ─────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────

CREATE TYPE asset_type_enum AS ENUM (
  'vehicle',
  'power_tool',
  'heavy_equipment',
  'hvac_unit',
  'generator',
  'other'
);

CREATE TYPE asset_status_enum AS ENUM (
  'active',
  'in_repair',
  'retired'
);

CREATE TYPE asset_document_type_enum AS ENUM (
  'manual',
  'spec_sheet',
  'warranty',
  'service_record',
  'photo',
  'invoice',
  'other'
);

CREATE TYPE extraction_status_enum AS ENUM (
  'pending',
  'complete',
  'failed',
  'not_applicable'
);

-- Extend notification_type to include reorder_alert
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'reorder_alert';

-- ─────────────────────────────────────────────────────────────
-- TABLE: assets
-- Core equipment and plant registry per org
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.assets (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id               uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name                 text NOT NULL,
  asset_type           asset_type_enum NOT NULL,
  manufacturer         text NOT NULL,
  model_number         text,
  serial_number        text,
  purchase_date        date,
  warranty_expiration  date,
  current_location     text,
  status               asset_status_enum NOT NULL DEFAULT 'active',
  notes                text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assets_org_isolation" ON public.assets
  USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE INDEX idx_assets_org_id ON public.assets(org_id);
CREATE INDEX idx_assets_status ON public.assets(org_id, status);
CREATE INDEX idx_assets_type ON public.assets(org_id, asset_type);

-- ─────────────────────────────────────────────────────────────
-- TABLE: asset_documents
-- Metadata for every file stored in Firebase Storage.
-- Firebase holds the blob; this table is the single source of truth for all queryable fields.
-- The client NEVER writes here directly — only the server-confirm API route does.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.asset_documents (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_id              uuid NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  firebase_storage_url  text NOT NULL,
  firebase_storage_path text NOT NULL,
  document_type         asset_document_type_enum NOT NULL,
  file_name             text NOT NULL,
  mime_type             text,
  file_size_bytes       bigint,
  uploaded_by_user_id   uuid,
  extracted_text        text,
  extraction_status     extraction_status_enum NOT NULL DEFAULT 'pending',
  uploaded_at           timestamptz NOT NULL DEFAULT now(),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.asset_documents ENABLE ROW LEVEL SECURITY;

-- Strict org isolation — cross-org reads return zero rows
CREATE POLICY "asset_documents_org_isolation" ON public.asset_documents
  USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE INDEX idx_asset_documents_org_id ON public.asset_documents(org_id);
CREATE INDEX idx_asset_documents_asset_id ON public.asset_documents(asset_id);
CREATE INDEX idx_asset_documents_extraction ON public.asset_documents(org_id, extraction_status);

-- ─────────────────────────────────────────────────────────────
-- TABLE: document_chunks
-- pgvector table. org_id is denormalized here intentionally so
-- the RLS policy can be applied directly without a join, which
-- prevents cross-org leakage even if a query bypasses the
-- asset_documents join path.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.document_chunks (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id               uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_document_id    uuid NOT NULL REFERENCES public.asset_documents(id) ON DELETE CASCADE,
  chunk_index          integer NOT NULL,
  chunk_text           text NOT NULL,
  embedding            vector(1536),
  source_type          text NOT NULL DEFAULT 'document', -- 'document' | 'service_log'
  service_log_id       uuid, -- nullable, set when source_type = 'service_log'
  created_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

-- CRITICAL: org_id on document_chunks enforces hard cross-org boundary
-- This is the innermost RLS layer for vector search — verified in test suite
CREATE POLICY "document_chunks_org_isolation" ON public.document_chunks
  USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE INDEX idx_document_chunks_org_id ON public.document_chunks(org_id);
CREATE INDEX idx_document_chunks_doc_id ON public.document_chunks(asset_document_id);
-- IVFFlat index for approximate nearest neighbour — 100 lists suits up to ~1M chunks
CREATE INDEX idx_document_chunks_embedding ON public.document_chunks
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ─────────────────────────────────────────────────────────────
-- TABLE: service_logs
-- Structured service history per asset
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.service_logs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_id            uuid NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  service_date        date NOT NULL,
  technician_name     text NOT NULL,
  work_performed      text NOT NULL,
  parts_used          text[] NOT NULL DEFAULT '{}',
  linked_document_id  uuid REFERENCES public.asset_documents(id) ON DELETE SET NULL,
  cost                numeric(10, 2),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_logs_org_isolation" ON public.service_logs
  USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE INDEX idx_service_logs_org_asset ON public.service_logs(org_id, asset_id);
CREATE INDEX idx_service_logs_date ON public.service_logs(org_id, service_date DESC);

-- ─────────────────────────────────────────────────────────────
-- TABLE: spare_parts
-- Parts inventory. Reorder threshold triggers notification.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.spare_parts (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  part_number           text NOT NULL,
  description           text NOT NULL,
  compatible_asset_ids  text[] NOT NULL DEFAULT '{}',
  supplier_name         text,
  supplier_contact      text,
  unit_cost             numeric(10, 2),
  quantity_on_hand      integer NOT NULL DEFAULT 0,
  reorder_threshold     integer NOT NULL DEFAULT 0,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT spare_parts_quantity_positive CHECK (quantity_on_hand >= 0)
);

ALTER TABLE public.spare_parts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "spare_parts_org_isolation" ON public.spare_parts
  USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE INDEX idx_spare_parts_org_id ON public.spare_parts(org_id);
CREATE INDEX idx_spare_parts_reorder ON public.spare_parts(org_id, quantity_on_hand, reorder_threshold);

-- ─────────────────────────────────────────────────────────────
-- UPDATED_AT TRIGGERS (reuse existing pattern from prior migrations)
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER asset_documents_updated_at
  BEFORE UPDATE ON public.asset_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER service_logs_updated_at
  BEFORE UPDATE ON public.service_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER spare_parts_updated_at
  BEFORE UPDATE ON public.spare_parts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
