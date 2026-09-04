-- ============================================================================
-- AVORRIA CONTRACTORS USA — MIGRATION 00012
-- Prompt 2: AI Document Generation Engine (Create Pillar)
-- Schema extension for document content, signatures, version lineage, and audit
-- ============================================================================

-- 1. EXTEND DOCUMENTS TABLE FOR STRUCTURED CONTENT & SIGNATURES
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS content jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_signed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS signed_at timestamptz,
  ADD COLUMN IF NOT EXISTS signature_data jsonb,
  ADD COLUMN IF NOT EXISTS parent_document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS change_summary text;

-- 2. CREATE INDEXES FOR VERSIONING AND SIGNATURE FILTERING
CREATE INDEX IF NOT EXISTS idx_documents_parent_id ON public.documents(parent_document_id);
CREATE INDEX IF NOT EXISTS idx_documents_is_signed ON public.documents(is_signed);

-- 3. ENSURE READINESS TRIGGER HANDLES AI DOCUMENTS PROPERLY
-- (The existing trigger trg_documents_readiness_score from Migration 00011
-- already recalculates readiness on INSERT/UPDATE of documents)
