-- =============================================================================
-- AVORRIA PHASE 9: REQUEST — STRUCTURED PROJECT REQUESTS & REQUIREMENT PACKS
-- Migration: 00007_phase_9_request_and_requirement_packs.sql
-- Description: Client-authored project request briefs, structured requirements,
--              secure attachments, and append-only audit event trail.
--              Contractors have ZERO access to any requirement pack table.
-- =============================================================================

-- 1. REQUIREMENT PACKS (Core project request brief)
CREATE TABLE IF NOT EXISTS public.requirement_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    created_by_user_id TEXT NOT NULL,
    reference TEXT NOT NULL UNIQUE, -- REQ-XXXXXX deterministic reference
    title TEXT NOT NULL,
    project_type TEXT,
    description TEXT,
    scope TEXT,
    country TEXT NOT NULL DEFAULT 'US',
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    site_address TEXT,
    site_access_notes TEXT,
    target_start_date DATE,
    target_completion_date DATE,
    urgency TEXT CHECK (urgency IN ('immediate', 'within_30_days', 'within_90_days', 'flexible', 'undefined')),
    flexibility TEXT CHECK (flexibility IN ('fixed', 'negotiable', 'flexible', 'undefined')),
    value_tier TEXT CHECK (value_tier IN (
        'tier_1_under_25k',
        'tier_2_25k_100k',
        'tier_3_100k_250k',
        'tier_4_250k_1m',
        'tier_5_1m_plus',
        'undefined'
    )),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'active', 'closed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_requirement_packs_tenant ON public.requirement_packs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_requirement_packs_status ON public.requirement_packs(status);
CREATE INDEX IF NOT EXISTS idx_requirement_packs_reference ON public.requirement_packs(reference);

-- 2. REQUIREMENT PACK TRADES (multi-trade assignment using standard slug taxonomy)
CREATE TABLE IF NOT EXISTS public.requirement_pack_trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pack_id UUID NOT NULL REFERENCES public.requirement_packs(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    trade_slug TEXT NOT NULL,
    trade_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (pack_id, trade_slug)
);

CREATE INDEX IF NOT EXISTS idx_req_pack_trades_pack ON public.requirement_pack_trades(pack_id);
CREATE INDEX IF NOT EXISTS idx_req_pack_trades_tenant ON public.requirement_pack_trades(tenant_id);

-- 3. REQUIREMENT PACK REQUIREMENTS (structured criteria items)
CREATE TABLE IF NOT EXISTS public.requirement_pack_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pack_id UUID NOT NULL REFERENCES public.requirement_packs(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN (
        'insurance',
        'licence',
        'credential',
        'safety',
        'evidence',
        'scope',
        'site',
        'other'
    )),
    requirement_type TEXT,  -- e.g. 'general_liability', 'trade_license', 'osha_30', 'safety_plan'
    title TEXT NOT NULL,
    description TEXT,
    strength TEXT NOT NULL DEFAULT 'required' CHECK (strength IN ('required', 'preferred', 'optional')),
    minimum_value TEXT,     -- e.g. '$2,000,000 per occurrence' — client-defined text, not a financial field
    jurisdiction TEXT,      -- e.g. 'TX', 'Travis County' — if jurisdiction-specific
    evidence_required BOOLEAN NOT NULL DEFAULT false,
    provenance TEXT NOT NULL DEFAULT 'client' CHECK (provenance IN ('client', 'template', 'ai_suggestion', 'imported')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_req_pack_reqs_pack ON public.requirement_pack_requirements(pack_id);
CREATE INDEX IF NOT EXISTS idx_req_pack_reqs_tenant ON public.requirement_pack_requirements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_req_pack_reqs_category ON public.requirement_pack_requirements(category);

-- 4. REQUIREMENT PACK ATTACHMENTS (secure private project documentation)
CREATE TABLE IF NOT EXISTS public.requirement_pack_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pack_id UUID NOT NULL REFERENCES public.requirement_packs(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    uploaded_by_user_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,  -- Internal storage path — never exposed to contractors
    file_size_bytes INTEGER,
    mime_type TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_req_pack_attachments_pack ON public.requirement_pack_attachments(pack_id);
CREATE INDEX IF NOT EXISTS idx_req_pack_attachments_tenant ON public.requirement_pack_attachments(tenant_id);

-- 5. REQUIREMENT PACK EVENTS (append-only audit trail)
CREATE TABLE IF NOT EXISTS public.requirement_pack_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pack_id UUID NOT NULL REFERENCES public.requirement_packs(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    actor_user_id TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'request_created',
        'request_updated',
        'requirement_added',
        'requirement_updated',
        'requirement_removed',
        'trade_added',
        'trade_removed',
        'attachment_added',
        'attachment_removed',
        'request_marked_ready',
        'request_activated',
        'request_closed',
        'request_cancelled',
        'request_duplicated'
    )),
    payload JSONB,  -- Event-specific supplementary data
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_req_pack_events_pack ON public.requirement_pack_events(pack_id);
CREATE INDEX IF NOT EXISTS idx_req_pack_events_tenant ON public.requirement_pack_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_req_pack_events_type ON public.requirement_pack_events(event_type);

-- =============================================================================
-- ROW LEVEL SECURITY — STRICT TENANT ISOLATION
-- CRITICAL: Contractors and anonymous visitors have ZERO access to all tables.
-- Only authenticated members of the owning tenant organisation may access records.
-- =============================================================================

ALTER TABLE public.requirement_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirement_pack_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirement_pack_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirement_pack_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirement_pack_events ENABLE ROW LEVEL SECURITY;

-- ─── requirement_packs ───────────────────────────────────────────────────────
CREATE POLICY "req_packs_select_own_tenant" ON public.requirement_packs
    FOR SELECT USING (auth_is_org_member(tenant_id));

CREATE POLICY "req_packs_insert_own_tenant" ON public.requirement_packs
    FOR INSERT WITH CHECK (auth_is_org_member(tenant_id));

CREATE POLICY "req_packs_update_own_tenant" ON public.requirement_packs
    FOR UPDATE USING (auth_is_org_member(tenant_id));

CREATE POLICY "req_packs_delete_admin_only" ON public.requirement_packs
    FOR DELETE USING (auth_is_org_admin(tenant_id));

-- ─── requirement_pack_trades ─────────────────────────────────────────────────
CREATE POLICY "req_pack_trades_select" ON public.requirement_pack_trades
    FOR SELECT USING (auth_is_org_member(tenant_id));

CREATE POLICY "req_pack_trades_insert" ON public.requirement_pack_trades
    FOR INSERT WITH CHECK (auth_is_org_member(tenant_id));

CREATE POLICY "req_pack_trades_delete" ON public.requirement_pack_trades
    FOR DELETE USING (auth_is_org_member(tenant_id));

-- ─── requirement_pack_requirements ───────────────────────────────────────────
CREATE POLICY "req_pack_reqs_select" ON public.requirement_pack_requirements
    FOR SELECT USING (auth_is_org_member(tenant_id));

CREATE POLICY "req_pack_reqs_insert" ON public.requirement_pack_requirements
    FOR INSERT WITH CHECK (auth_is_org_member(tenant_id));

CREATE POLICY "req_pack_reqs_update" ON public.requirement_pack_requirements
    FOR UPDATE USING (auth_is_org_member(tenant_id));

CREATE POLICY "req_pack_reqs_delete" ON public.requirement_pack_requirements
    FOR DELETE USING (auth_is_org_member(tenant_id));

-- ─── requirement_pack_attachments ────────────────────────────────────────────
CREATE POLICY "req_pack_attachments_select" ON public.requirement_pack_attachments
    FOR SELECT USING (auth_is_org_member(tenant_id));

CREATE POLICY "req_pack_attachments_insert" ON public.requirement_pack_attachments
    FOR INSERT WITH CHECK (auth_is_org_member(tenant_id));

CREATE POLICY "req_pack_attachments_delete" ON public.requirement_pack_attachments
    FOR DELETE USING (auth_is_org_member(tenant_id));

-- ─── requirement_pack_events ─────────────────────────────────────────────────
-- Audit events are append-only: INSERT and SELECT only; UPDATE/DELETE forbidden.
CREATE POLICY "req_pack_events_select" ON public.requirement_pack_events
    FOR SELECT USING (auth_is_org_member(tenant_id));

CREATE POLICY "req_pack_events_insert" ON public.requirement_pack_events
    FOR INSERT WITH CHECK (auth_is_org_member(tenant_id));
-- No UPDATE or DELETE policies on events — enforces append-only audit integrity.
