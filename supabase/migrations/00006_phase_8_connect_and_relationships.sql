-- =============================================================================
-- AVORRIA PHASE 8: CONNECT — CLIENT ACCOUNTS, CONTRACTOR RELATIONSHIPS & CONTROLLED OPPORTUNITY ENGINE
-- Migration: 00006_phase_8_connect_and_relationships.sql
-- Description: Buyer/Client profiles, persistent saved contractors, relationship
--              state machine, controlled opportunities, invitations, and RLS policies.
-- =============================================================================

-- 1. Extend user roles in organisation_members constraint
-- (Supports 'client_admin' and 'client_member' alongside existing contractor roles)
DO $$
BEGIN
    ALTER TABLE IF EXISTS public.organisation_members 
    DROP CONSTRAINT IF EXISTS organisation_members_role_check;

    ALTER TABLE IF EXISTS public.organisation_members 
    ADD CONSTRAINT organisation_members_role_check 
    CHECK (role IN (
        'contractor_owner',
        'contractor_admin',
        'employee_user',
        'future_client',
        'client_admin',
        'client_member',
        'platform_admin'
    ));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 2. Client / Buyer Profiles
CREATE TABLE IF NOT EXISTS public.client_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL UNIQUE REFERENCES public.organisations(id) ON DELETE CASCADE,
    organisation_type TEXT NOT NULL CHECK (organisation_type IN (
        'facilities_management',
        'property_management',
        'estate_management',
        'commercial_property',
        'housing_operations',
        'procurement',
        'general_business',
        'other_professional_buyer'
    )),
    contact_name TEXT NOT NULL,
    job_title TEXT,
    business_email TEXT NOT NULL,
    phone TEXT,
    operating_territory JSONB NOT NULL DEFAULT '{"primaryState": "TX", "cities": []}'::jsonb,
    preferred_trades JSONB DEFAULT '[]'::jsonb,
    account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'pending', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_profiles_org_id ON public.client_profiles(organisation_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_status ON public.client_profiles(account_status);

-- 3. Client Saved Contractors (Persistent Bookmark List)
CREATE TABLE IF NOT EXISTS public.client_saved_contractors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    contractor_organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    contractor_slug TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (client_organisation_id, contractor_organisation_id)
);

CREATE INDEX IF NOT EXISTS idx_client_saved_client_org ON public.client_saved_contractors(client_organisation_id);
CREATE INDEX IF NOT EXISTS idx_client_saved_contractor_org ON public.client_saved_contractors(contractor_organisation_id);

-- 4. Contractor Relationships (Controlled 2-Party Trust Graph)
CREATE TABLE IF NOT EXISTS public.contractor_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    contractor_organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    initiated_by TEXT NOT NULL CHECK (initiated_by IN ('client', 'contractor')),
    initiator_user_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'connected', 'declined', 'archived', 'blocked'
    )),
    message TEXT,
    connected_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (client_organisation_id, contractor_organisation_id)
);

CREATE INDEX IF NOT EXISTS idx_contractor_relationships_client ON public.contractor_relationships(client_organisation_id);
CREATE INDEX IF NOT EXISTS idx_contractor_relationships_contractor ON public.contractor_relationships(contractor_organisation_id);
CREATE INDEX IF NOT EXISTS idx_contractor_relationships_status ON public.contractor_relationships(status);

-- 5. Controlled Project Opportunities (Private by Default)
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    created_by_user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    project_type TEXT,
    trade TEXT NOT NULL, -- Standardized trade slug
    location JSONB NOT NULL DEFAULT '{"city": "", "state": "TX"}'::jsonb,
    timeframe TEXT NOT NULL DEFAULT 'flexible' CHECK (timeframe IN (
        'asap', 'within_7_days', 'within_30_days', 'specific_date', 'flexible'
    )),
    target_date DATE,
    scope TEXT NOT NULL,
    requirements JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
        'draft', 'open', 'closed', 'cancelled'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_client_org ON public.opportunities(client_organisation_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON public.opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_trade ON public.opportunities(trade);

-- 6. Opportunity Invitations & Contractor Responses
CREATE TABLE IF NOT EXISTS public.opportunity_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    contractor_organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    client_organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    invited_by_user_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'accepted', 'declined', 'withdrawn'
    )),
    invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    responded_at TIMESTAMPTZ,
    response_message TEXT,
    UNIQUE (opportunity_id, contractor_organisation_id)
);

CREATE INDEX IF NOT EXISTS idx_opp_invitations_opp_id ON public.opportunity_invitations(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opp_invitations_contractor_org ON public.opportunity_invitations(contractor_organisation_id);
CREATE INDEX IF NOT EXISTS idx_opp_invitations_client_org ON public.opportunity_invitations(client_organisation_id);
CREATE INDEX IF NOT EXISTS idx_opp_invitations_status ON public.opportunity_invitations(status);

-- 7. Connect Notifications & Relationship Audit Feed
CREATE TABLE IF NOT EXISTS public.connect_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    sender_organisation_id UUID REFERENCES public.organisations(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    entity_id TEXT,
    entity_type TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_connect_notifications_recipient ON public.connect_notifications(recipient_organisation_id);
CREATE INDEX IF NOT EXISTS idx_connect_notifications_created_at ON public.connect_notifications(created_at DESC);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_saved_contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connect_notifications ENABLE ROW LEVEL SECURITY;

-- 8.1 Client Profiles: Only members of client organisation can SELECT/UPDATE
CREATE POLICY client_profiles_select_own ON public.client_profiles
    FOR SELECT
    USING (
        organisation_id IN (
            SELECT organisation_id FROM public.organisation_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY client_profiles_update_own ON public.client_profiles
    FOR UPDATE
    USING (
        organisation_id IN (
            SELECT organisation_id FROM public.organisation_members
            WHERE user_id = auth.uid()
        )
    );

-- 8.2 Client Saved Contractors: Client isolation
CREATE POLICY client_saved_contractors_all ON public.client_saved_contractors
    FOR ALL
    USING (
        client_organisation_id IN (
            SELECT organisation_id FROM public.organisation_members
            WHERE user_id = auth.uid()
        )
    );

-- 8.3 Contractor Relationships: Only authorized parties (Client OR Contractor) can SELECT
CREATE POLICY contractor_relationships_select_parties ON public.contractor_relationships
    FOR SELECT
    USING (
        client_organisation_id IN (
            SELECT organisation_id FROM public.organisation_members
            WHERE user_id = auth.uid()
        )
        OR
        contractor_organisation_id IN (
            SELECT organisation_id FROM public.organisation_members
            WHERE user_id = auth.uid()
        )
    );

-- Either party can UPDATE their authorized relationship record
CREATE POLICY contractor_relationships_update_parties ON public.contractor_relationships
    FOR UPDATE
    USING (
        client_organisation_id IN (
            SELECT organisation_id FROM public.organisation_members
            WHERE user_id = auth.uid()
        )
        OR
        contractor_organisation_id IN (
            SELECT organisation_id FROM public.organisation_members
            WHERE user_id = auth.uid()
        )
    );

-- Client initiates relationship INSERT
CREATE POLICY contractor_relationships_insert_client ON public.contractor_relationships
    FOR INSERT
    WITH CHECK (
        client_organisation_id IN (
            SELECT organisation_id FROM public.organisation_members
            WHERE user_id = auth.uid()
        )
    );

-- 8.4 Opportunities: Client owns opportunity, OR Contractor is explicitly invited
CREATE POLICY opportunities_select_authorized ON public.opportunities
    FOR SELECT
    USING (
        -- Client organization member
        client_organisation_id IN (
            SELECT organisation_id FROM public.organisation_members
            WHERE user_id = auth.uid()
        )
        OR
        -- Explicitly invited contractor
        id IN (
            SELECT opportunity_id FROM public.opportunity_invitations
            WHERE contractor_organisation_id IN (
                SELECT organisation_id FROM public.organisation_members
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY opportunities_modify_client_owner ON public.opportunities
    FOR ALL
    USING (
        client_organisation_id IN (
            SELECT organisation_id FROM public.organisation_members
            WHERE user_id = auth.uid()
        )
    );

-- 8.5 Opportunity Invitations: Visible to Client OR Invited Contractor
CREATE POLICY opportunity_invitations_select ON public.opportunity_invitations
    FOR SELECT
    USING (
        client_organisation_id IN (
            SELECT organisation_id FROM public.organisation_members
            WHERE user_id = auth.uid()
        )
        OR
        contractor_organisation_id IN (
            SELECT organisation_id FROM public.organisation_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY opportunity_invitations_client_insert ON public.opportunity_invitations
    FOR INSERT
    WITH CHECK (
        client_organisation_id IN (
            SELECT organisation_id FROM public.organisation_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY opportunity_invitations_contractor_respond ON public.opportunity_invitations
    FOR UPDATE
    USING (
        contractor_organisation_id IN (
            SELECT organisation_id FROM public.organisation_members
            WHERE user_id = auth.uid()
        )
        OR
        client_organisation_id IN (
            SELECT organisation_id FROM public.organisation_members
            WHERE user_id = auth.uid()
        )
    );

-- 8.6 Connect Notifications: Recipient isolation
CREATE POLICY connect_notifications_recipient_isolation ON public.connect_notifications
    FOR ALL
    USING (
        recipient_organisation_id IN (
            SELECT organisation_id FROM public.organisation_members
            WHERE user_id = auth.uid()
        )
    );
