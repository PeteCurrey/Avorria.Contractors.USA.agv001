-- =============================================================================
-- AVORRIA PHASE 10: MATCH — EVIDENCE-AWARE CONTRACTOR MATCHING & INTELLIGENCE
-- Migration: 00008_phase_10_match_intelligence_and_snapshots.sql
-- Description: Deterministic match sets, immutable contractor match snapshots,
--              versioned engine execution, invalidation tracking, and full RLS.
--              Strict tenant isolation: Contractors and anonymous visitors
--              have ZERO visibility or access to match intelligence.
-- =============================================================================

-- 1. MATCH SETS (Header for a requirement pack match run)
CREATE TABLE IF NOT EXISTS public.match_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    pack_id UUID NOT NULL REFERENCES public.requirement_packs(id) ON DELETE CASCADE,
    engine_version TEXT NOT NULL DEFAULT 'MATCH_ENGINE_V1',
    status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('ready', 'stale', 'refreshing')),
    is_stale BOOLEAN NOT NULL DEFAULT false,
    stale_reason TEXT,
    total_contractors_evaluated INTEGER NOT NULL DEFAULT 0,
    eligible_contractors_count INTEGER NOT NULL DEFAULT 0,
    verified_contractors_count INTEGER NOT NULL DEFAULT 0,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_match_sets_tenant ON public.match_sets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_match_sets_pack ON public.match_sets(pack_id);
CREATE INDEX IF NOT EXISTS idx_match_sets_status ON public.match_sets(status);

-- 2. MATCH CONTRACTOR SNAPSHOTS (Immutable audit records for matched contractors)
CREATE TABLE IF NOT EXISTS public.match_contractor_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_set_id UUID NOT NULL REFERENCES public.match_sets(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    pack_id UUID NOT NULL REFERENCES public.requirement_packs(id) ON DELETE CASCADE,
    contractor_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    contractor_slug TEXT NOT NULL,
    business_name TEXT NOT NULL,
    primary_trade TEXT NOT NULL,
    overall_status TEXT NOT NULL CHECK (overall_status IN (
        'aligned',
        'partially_aligned',
        'needs_review',
        'not_aligned',
        'insufficient_information'
    )),
    trade_alignment TEXT NOT NULL CHECK (trade_alignment IN ('exact', 'related', 'none')),
    territory_alignment TEXT NOT NULL CHECK (territory_alignment IN ('exact', 'regional', 'not_published', 'no_alignment')),
    verification_status TEXT NOT NULL CHECK (verification_status IN ('verified', 'published_unverified')),
    verification_reference TEXT,
    aligned_count INTEGER NOT NULL DEFAULT 0,
    declared_count INTEGER NOT NULL DEFAULT 0,
    expired_count INTEGER NOT NULL DEFAULT 0,
    missing_count INTEGER NOT NULL DEFAULT 0,
    needs_clarification_count INTEGER NOT NULL DEFAULT 0,
    matrix_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
    explanations JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_match_snapshots_set ON public.match_contractor_snapshots(match_set_id);
CREATE INDEX IF NOT EXISTS idx_match_snapshots_tenant ON public.match_contractor_snapshots(tenant_id);
CREATE INDEX IF NOT EXISTS idx_match_snapshots_pack ON public.match_contractor_snapshots(pack_id);
CREATE INDEX IF NOT EXISTS idx_match_snapshots_contractor ON public.match_contractor_snapshots(contractor_id);
CREATE INDEX IF NOT EXISTS idx_match_snapshots_status ON public.match_contractor_snapshots(overall_status);

-- =============================================================================
-- ROW LEVEL SECURITY — STRICT TENANT ISOLATION
-- Only authenticated members of the owning client tenant organisation can access.
-- Contractors, anonymous visitors, and competing clients have ZERO access.
-- =============================================================================

ALTER TABLE public.match_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_contractor_snapshots ENABLE ROW LEVEL SECURITY;

-- ─── match_sets ──────────────────────────────────────────────────────────────
CREATE POLICY "match_sets_select_own_tenant" ON public.match_sets
    FOR SELECT USING (auth_is_org_member(tenant_id));

CREATE POLICY "match_sets_insert_own_tenant" ON public.match_sets
    FOR INSERT WITH CHECK (auth_is_org_member(tenant_id));

CREATE POLICY "match_sets_update_own_tenant" ON public.match_sets
    FOR UPDATE USING (auth_is_org_member(tenant_id));

CREATE POLICY "match_sets_delete_admin_only" ON public.match_sets
    FOR DELETE USING (auth_is_org_admin(tenant_id));

-- ─── match_contractor_snapshots ──────────────────────────────────────────────
CREATE POLICY "match_snapshots_select_own_tenant" ON public.match_contractor_snapshots
    FOR SELECT USING (auth_is_org_member(tenant_id));

CREATE POLICY "match_snapshots_insert_own_tenant" ON public.match_contractor_snapshots
    FOR INSERT WITH CHECK (auth_is_org_member(tenant_id));

CREATE POLICY "match_snapshots_delete_admin_only" ON public.match_contractor_snapshots
    FOR DELETE USING (auth_is_org_admin(tenant_id));
-- Snapshots are immutable: no UPDATE policy is defined.
