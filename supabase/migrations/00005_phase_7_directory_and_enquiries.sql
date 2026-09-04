-- AVORRIA PHASE 7: VERIFIED CONTRACTOR DIRECTORY & INTELLIGENT DISCOVERY ENGINE
-- Migration: 00005_phase_7_directory_and_enquiries.sql
-- Description: Inbound contractor enquiries, directory indexing support, and RLS security policies.

-- 1. Create contractor_enquiries table for inbound commercial/project enquiries
CREATE TABLE IF NOT EXISTS public.contractor_enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    sender_phone TEXT,
    project_type TEXT,
    project_location TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'viewed', 'contacted', 'archived')),
    ip_hash TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Indexes for efficient query performance and directory discovery
CREATE INDEX IF NOT EXISTS idx_contractor_enquiries_contractor_id ON public.contractor_enquiries(contractor_id);
CREATE INDEX IF NOT EXISTS idx_contractor_enquiries_status ON public.contractor_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_contractor_enquiries_created_at ON public.contractor_enquiries(created_at DESC);

-- Index for directory lookups on contractor profiles
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_visibility_indexable 
ON public.contractor_profiles(visibility, is_indexable) 
WHERE visibility = 'published';

-- 3. Row Level Security (RLS) Policies for contractor_enquiries
ALTER TABLE public.contractor_enquiries ENABLE ROW LEVEL SECURITY;

-- Policy: Contractors can SELECT their own enquiries only
CREATE POLICY contractor_select_own_enquiries ON public.contractor_enquiries
    FOR SELECT
    USING (
        contractor_id IN (
            SELECT organisation_id FROM public.organisation_members
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Contractors can UPDATE status of their own enquiries only
CREATE POLICY contractor_update_own_enquiries ON public.contractor_enquiries
    FOR UPDATE
    USING (
        contractor_id IN (
            SELECT organisation_id FROM public.organisation_members
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        contractor_id IN (
            SELECT organisation_id FROM public.organisation_members
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Contractors can DELETE their own enquiries only
CREATE POLICY contractor_delete_own_enquiries ON public.contractor_enquiries
    FOR DELETE
    USING (
        contractor_id IN (
            SELECT organisation_id FROM public.organisation_members
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Anonymous public users can INSERT valid enquiries to published contractors
-- Client cannot forge internal tenant credentials
CREATE POLICY public_insert_contractor_enquiry ON public.contractor_enquiries
    FOR INSERT
    WITH CHECK (
        contractor_id IN (
            SELECT organisation_id FROM public.contractor_profiles
            WHERE visibility = 'published'
        )
    );
