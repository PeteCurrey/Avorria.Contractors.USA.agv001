-- =============================================================================
-- AVORRIA PHASE 10: DISCOVER — COMMERCIAL OPPORTUNITY DISCOVERY & WATCHLIST
-- Migration: 00014_phase_10_discover_and_saved_opportunities.sql
-- Description: Contractor saved opportunities (watchlist), persistent bookmarking,
--              opportunity search indexes, and multi-tenant RLS policies.
-- =============================================================================

-- 1. Contractor Saved Opportunities (Watchlist)
CREATE TABLE IF NOT EXISTS public.contractor_saved_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (contractor_organisation_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_contractor_saved_opp_org ON public.contractor_saved_opportunities(contractor_organisation_id);
CREATE INDEX IF NOT EXISTS idx_contractor_saved_opp_id ON public.contractor_saved_opportunities(opportunity_id);

-- 2. Row Level Security (RLS)
ALTER TABLE public.contractor_saved_opportunities ENABLE ROW LEVEL SECURITY;

-- Contractors can only view their own organisation's saved opportunities
CREATE POLICY contractor_saved_opportunities_select ON public.contractor_saved_opportunities
    FOR SELECT
    USING (
        contractor_organisation_id IN (
            SELECT organisation_id FROM public.organisation_members
            WHERE user_id = auth.uid()
        )
    );

-- Contractors can insert saved opportunities for their organisation
CREATE POLICY contractor_saved_opportunities_insert ON public.contractor_saved_opportunities
    FOR INSERT
    WITH CHECK (
        contractor_organisation_id IN (
            SELECT organisation_id FROM public.organisation_members
            WHERE user_id = auth.uid()
        )
    );

-- Contractors can delete saved opportunities for their organisation
CREATE POLICY contractor_saved_opportunities_delete ON public.contractor_saved_opportunities
    FOR DELETE
    USING (
        contractor_organisation_id IN (
            SELECT organisation_id FROM public.organisation_members
            WHERE user_id = auth.uid()
        )
    );

-- 3. Composite Search and Query Indexes on Opportunities Table
CREATE INDEX IF NOT EXISTS idx_opportunities_location ON public.opportunities USING gin (location);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON public.opportunities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_target_date ON public.opportunities(target_date);
