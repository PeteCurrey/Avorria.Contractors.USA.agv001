-- =============================================================================
-- AVORRIA CONTRACTOR PLATFORM — CORE POSTGRESQL & MULTI-TENANT RLS SCHEMA
-- Migration: 00001_initial_schema.sql
-- Jurisdiction: Built US-first with flexible international schema support
-- Security: Row Level Security (RLS) on all tenant-owned entities
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. ORGANISATIONS (Tenants) & MEMBERSHIP
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organisations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    legal_name VARCHAR(255),
    business_structure VARCHAR(50), -- llc, corporation, sole_proprietorship, partnership
    tax_id_ein VARCHAR(50), -- Encrypted or masked at app layer
    website VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state_province VARCHAR(50), -- e.g., TX, CA, or international equivalent
    postal_code VARCHAR(30),
    country VARCHAR(10) NOT NULL DEFAULT 'US',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organisation_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- Supabase auth.users reference
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'contractor_owner',
        'contractor_admin',
        'employee_user',
        'future_client',
        'platform_admin'
    )),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organisation_id, user_id)
);

CREATE INDEX idx_org_members_user ON organisation_members(user_id);
CREATE INDEX idx_org_members_org ON organisation_members(organisation_id);

-- -----------------------------------------------------------------------------
-- 2. STRUCTURED TRADES & SERVICE AREAS TAXONOMY
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    parent_trade_id UUID REFERENCES trades(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'mep', 'structural', 'finishes', 'exterior', 'specialty', 'general', 'maintenance'
    )),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contractor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL UNIQUE REFERENCES organisations(id) ON DELETE CASCADE,
    dba_name VARCHAR(255),
    primary_phone VARCHAR(50),
    primary_email VARCHAR(255),
    website VARCHAR(255),
    business_description TEXT,
    year_established INT,
    readiness_score INT NOT NULL DEFAULT 0 CHECK (readiness_score BETWEEN 0 AND 100),
    readiness_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    visibility VARCHAR(30) NOT NULL DEFAULT 'private' CHECK (visibility IN (
        'private', 'draft', 'published', 'suspended', 'archived'
    )),
    is_indexable BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contractor_trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_profile_id UUID NOT NULL REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE RESTRICT,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    license_number VARCHAR(100),
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (contractor_profile_id, trade_id)
);

CREATE TABLE IF NOT EXISTS contractor_service_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_profile_id UUID NOT NULL REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    area_type VARCHAR(30) NOT NULL CHECK (area_type IN (
        'nationwide', 'state', 'county', 'metro', 'city', 'radius'
    )),
    state_code VARCHAR(10),
    county_name VARCHAR(100),
    city_name VARCHAR(100),
    postal_code VARCHAR(20),
    center_lat NUMERIC(10, 7),
    center_lng NUMERIC(10, 7),
    radius_miles NUMERIC(6, 2),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. DOCUMENT MANAGEMENT & PROVENANCE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS business_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- coi, license, safety_policy, certification, w9, other
    title VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    visibility VARCHAR(30) NOT NULL DEFAULT 'private' CHECK (visibility IN (
        'private', 'client_shared', 'public_verified'
    )),
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN (
        'draft', 'active', 'archived', 'expired'
    )),
    version_number INT NOT NULL DEFAULT 1,
    parent_document_id UUID REFERENCES business_documents(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_docs_org ON business_documents(organisation_id);

-- -----------------------------------------------------------------------------
-- 4. COMPLIANCE ENGINE & GOVERNANCE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS compliance_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jurisdiction_code VARCHAR(50) NOT NULL DEFAULT 'US_FED', -- US_FED, US_TX, US_CA, etc.
    trade_id UUID REFERENCES trades(id) ON DELETE SET NULL,
    requirement_code VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirement_type VARCHAR(50) NOT NULL CHECK (requirement_type IN (
        'statutory', 'industry_standard', 'safety_guideline', 'platform_criteria'
    )),
    source VARCHAR(255) NOT NULL, -- e.g. OSHA 29 CFR 1926, Texas TDLR
    source_url TEXT,
    effective_date DATE,
    next_review_date DATE,
    review_status VARCHAR(30) NOT NULL DEFAULT 'approved' CHECK (review_status IN (
        'draft', 'under_review', 'approved', 'needs_update'
    )),
    reviewer VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compliance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    requirement_id UUID NOT NULL REFERENCES compliance_requirements(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL CHECK (status IN (
        'current', 'expiring_soon', 'expired', 'missing', 'not_applicable'
    )),
    evidence_document_id UUID REFERENCES business_documents(id) ON DELETE SET NULL,
    expiry_date DATE,
    notes TEXT,
    last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organisation_id, requirement_id)
);

CREATE INDEX idx_compliance_records_org ON compliance_records(organisation_id);

-- -----------------------------------------------------------------------------
-- 5. INSURANCE, LICENSES, CERTIFICATIONS, TRAINING, EMPLOYEES & EQUIPMENT
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS insurance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    policy_type VARCHAR(50) NOT NULL CHECK (policy_type IN (
        'general_liability', 'workers_compensation', 'commercial_auto', 'umbrella',
        'inland_marine', 'professional_liability', 'builders_risk', 'pollution_liability'
    )),
    carrier_name VARCHAR(255) NOT NULL,
    policy_number VARCHAR(100) NOT NULL,
    coverage_amount NUMERIC(14, 2),
    aggregate_amount NUMERIC(14, 2),
    effective_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    coi_document_id UUID REFERENCES business_documents(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN (
        'active', 'expiring_soon', 'expired', 'pending_review'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS licences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    trade_id UUID REFERENCES trades(id) ON DELETE SET NULL,
    state_jurisdiction VARCHAR(50) NOT NULL, -- e.g., TX, CA
    license_type VARCHAR(100) NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    holder_name VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN (
        'active', 'suspended', 'expired', 'pending_verification'
    )),
    effective_date DATE,
    expiry_date DATE,
    document_id UUID REFERENCES business_documents(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    role_title VARCHAR(100) NOT NULL,
    is_field_worker BOOLEAN NOT NULL DEFAULT TRUE,
    hire_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    issuing_authority VARCHAR(100) NOT NULL, -- OSHA, EPA, ICC, NCCER, etc.
    certification_number VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
    issue_date DATE,
    expiry_date DATE,
    document_id UUID REFERENCES business_documents(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    topic VARCHAR(255) NOT NULL,
    training_type VARCHAR(50) NOT NULL CHECK (training_type IN (
        'toolbox_talk', 'osha_10', 'osha_30', 'site_induction', 'equipment_safety', 'first_aid'
    )),
    date_conducted DATE NOT NULL,
    conducted_by VARCHAR(255),
    attendees_count INT NOT NULL DEFAULT 0,
    document_id UUID REFERENCES business_documents(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS qualifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    qualification_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    institution VARCHAR(255),
    acquired_date DATE,
    expiry_date DATE,
    document_id UUID REFERENCES business_documents(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    equipment_type VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100),
    make_model VARCHAR(100),
    inspection_interval_days INT NOT NULL DEFAULT 30,
    last_inspected_at DATE,
    next_inspection_due DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'operational' CHECK (status IN (
        'operational', 'maintenance_required', 'out_of_service'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 6. DOCUMENT TEMPLATES & GENERATED DOCUMENTS (WITH AI PROVENANCE & VERSIONING)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS document_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE, -- jha_standard, jsa_general, safety_plan_commercial, etc.
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('safety', 'estimating', 'legal', 'operations')),
    jurisdiction_code VARCHAR(50) NOT NULL DEFAULT 'US_FED',
    trade_id UUID REFERENCES trades(id) ON DELETE SET NULL,
    version INT NOT NULL DEFAULT 1,
    content_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
    default_template_body JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS generated_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    template_id UUID REFERENCES document_templates(id) ON DELETE SET NULL,
    document_type VARCHAR(50) NOT NULL, -- jha, jsa, safety_plan, toolbox_talk, quote, proposal, change_order
    title VARCHAR(255) NOT NULL,
    document_status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (document_status IN (
        'draft', 'ai_draft', 'reviewed', 'final', 'superseded', 'archived'
    )),
    version_number INT NOT NULL DEFAULT 1,
    parent_document_id UUID REFERENCES generated_documents(id) ON DELETE SET NULL,
    superseded_document_id UUID REFERENCES generated_documents(id) ON DELETE SET NULL,
    document_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    rendered_content TEXT,
    
    -- AI Provenance & Governance
    ai_assisted BOOLEAN NOT NULL DEFAULT FALSE,
    generation_timestamp TIMESTAMPTZ,
    generation_model VARCHAR(100),
    generation_inputs JSONB DEFAULT NULL,
    user_review_status VARCHAR(30) NOT NULL DEFAULT 'unreviewed' CHECK (user_review_status IN (
        'unreviewed', 'in_review', 'reviewed_with_edits', 'accepted_as_is'
    )),
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    finalised_by UUID,
    finalised_at TIMESTAMPTZ,
    change_summary TEXT,

    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gen_docs_org ON generated_documents(organisation_id);

-- -----------------------------------------------------------------------------
-- 7. COMMERCE: QUOTES, PROPOSALS & PROJECTS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    quote_number VARCHAR(100) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255),
    project_name VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'sent', 'accepted', 'rejected', 'expired'
    )),
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    quote_document_id UUID REFERENCES generated_documents(id) ON DELETE SET NULL,
    valid_until DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
    proposal_number VARCHAR(100) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'sent', 'won', 'lost'
    )),
    total_value NUMERIC(14, 2),
    proposal_document_id UUID REFERENCES generated_documents(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    client_name VARCHAR(255),
    location TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN (
        'bidding', 'active', 'completed', 'on_hold', 'archived'
    )),
    start_date DATE,
    completion_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 8. TRUST, VERIFICATION & CONTRACTOR PASSPORT (EVIDENCE-BASED)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS verification_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    verification_type VARCHAR(50) NOT NULL CHECK (verification_type IN (
        'business_identity', 'general_liability_insurance', 'workers_comp',
        'trade_license', 'safety_program', 'contractor_passport'
    )),
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'under_review', 'verified', 'rejected', 'expired', 'revoked'
    )),
    evidence_reference VARCHAR(255),
    evidence_document_id UUID REFERENCES business_documents(id) ON DELETE SET NULL,
    verification_method VARCHAR(50) NOT NULL CHECK (verification_method IN (
        'document_inspection', 'state_board_lookup', 'automated_api', 'third_party_audit'
    )),
    reviewer VARCHAR(100),
    reviewed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    rejection_reason TEXT,
    notes TEXT,
    audit_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL UNIQUE REFERENCES organisations(id) ON DELETE CASCADE,
    contractor_profile_id UUID NOT NULL REFERENCES contractor_profiles(id) ON DELETE CASCADE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    visibility VARCHAR(30) NOT NULL DEFAULT 'private' CHECK (visibility IN (
        'private', 'draft', 'published', 'suspended', 'archived'
    )),
    is_indexable BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    verified_badge_status VARCHAR(50) NOT NULL DEFAULT 'unverified',
    headline VARCHAR(255),
    overview TEXT,
    primary_phone VARCHAR(50),
    public_email VARCHAR(255),
    website_url VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 9. PLANS, SUBSCRIPTIONS, AUDITING & NOTIFICATIONS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE, -- free, professional, verified, business
    name VARCHAR(100) NOT NULL,
    monthly_price_cents INT NOT NULL DEFAULT 0,
    annual_price_cents INT NOT NULL DEFAULT 0,
    features_entitlements JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL UNIQUE REFERENCES organisations(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'trialing' CHECK (status IN (
        'trialing', 'active', 'past_due', 'canceled', 'paused'
    )),
    billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
    trial_ends_at TIMESTAMPTZ,
    current_period_starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_ends_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '1 month',
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    recipient_user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    action_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 10. CMS & DATABASE-DRIVEN SEO ENGINE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS seo_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    page_type VARCHAR(50) NOT NULL CHECK (page_type IN (
        'commercial_hub', 'document_template', 'interactive_tool',
        'compliance_guide', 'trade_pillar', 'jurisdiction_pillar', 'contractor_passport'
    )),
    title VARCHAR(255) NOT NULL,
    h1 VARCHAR(255) NOT NULL,
    meta_title VARCHAR(255) NOT NULL,
    meta_description TEXT NOT NULL,
    canonical_url VARCHAR(255),
    body_content JSONB NOT NULL DEFAULT '{}'::jsonb,
    faqs JSONB NOT NULL DEFAULT '[]'::jsonb,
    structured_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    breadcrumbs JSONB NOT NULL DEFAULT '[]'::jsonb,
    internal_links JSONB NOT NULL DEFAULT '[]'::jsonb,
    primary_cta JSONB NOT NULL DEFAULT '{}'::jsonb,
    secondary_cta JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Indexing & Quality Controls
    index_status VARCHAR(30) NOT NULL DEFAULT 'indexable' CHECK (index_status IN (
        'indexable', 'noindex_low_content', 'noindex_preview', 'noindex_staging'
    )),
    review_status VARCHAR(30) NOT NULL DEFAULT 'approved_for_publication' CHECK (review_status IN (
        'draft', 'editorial_review', 'approved_for_publication', 'deprecated'
    )),
    
    -- Content Governance
    published_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    next_review_date DATE,
    reviewer VARCHAR(100),
    source VARCHAR(255),
    source_url TEXT,
    
    -- Classification
    jurisdiction_code VARCHAR(50) DEFAULT 'US_FED',
    trade_slug VARCHAR(100),
    topic VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seo_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    pillar VARCHAR(50) NOT NULL CHECK (pillar IN ('business', 'create', 'comply', 'prove', 'win')),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS redirects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_path VARCHAR(255) NOT NULL UNIQUE,
    target_path VARCHAR(255) NOT NULL,
    status_code INT NOT NULL DEFAULT 301 CHECK (status_code IN (301, 302, 307, 308)),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    reason VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 11. LEAD CONVERSION & ANALYTICS EVENT BUS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    company_name VARCHAR(255),
    phone VARCHAR(50),
    trade VARCHAR(100),
    state_province VARCHAR(50),
    funnel_stage VARCHAR(50) NOT NULL DEFAULT 'visitor' CHECK (funnel_stage IN (
        'visitor', 'tool_interaction', 'lead', 'signup', 'onboarding',
        'first_document', 'compliance_setup', 'passport_creation', 'verification', 'subscription'
    )),
    source_url TEXT,
    referrer TEXT,
    utm_params JSONB NOT NULL DEFAULT '{}'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(100),
    organisation_id UUID REFERENCES organisations(id) ON DELETE SET NULL,
    user_id UUID,
    event_name VARCHAR(100) NOT NULL,
    funnel_stage VARCHAR(50) NOT NULL,
    properties JSONB NOT NULL DEFAULT '{}'::jsonb,
    path TEXT NOT NULL,
    user_agent TEXT,
    ip_hash VARCHAR(64),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_stage ON analytics_events(funnel_stage);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tenant-specific tables
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE licences ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Public reference tables (Read-only for public, admin-managed)
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Helper security function: Check user's tenant membership
CREATE OR REPLACE FUNCTION auth_is_org_member(target_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM organisation_members
        WHERE organisation_id = target_org_id
          AND user_id = auth.uid()
          AND is_active = TRUE
    );
$$;

-- Helper function: Check if user has admin privileges in tenant
CREATE OR REPLACE FUNCTION auth_is_org_admin(target_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM organisation_members
        WHERE organisation_id = target_org_id
          AND user_id = auth.uid()
          AND role IN ('contractor_owner', 'contractor_admin', 'platform_admin')
          AND is_active = TRUE
    );
$$;

-- Organisations: Members can view their org, Owners/Admins can update
CREATE POLICY "Members can view their own organisation"
    ON organisations FOR SELECT
    USING (auth_is_org_member(id));

CREATE POLICY "Admins can update their organisation"
    ON organisations FOR UPDATE
    USING (auth_is_org_admin(id));

-- Organisation Members: Members view colleagues, Admins manage
CREATE POLICY "Members can view organisation members"
    ON organisation_members FOR SELECT
    USING (auth_is_org_member(organisation_id));

CREATE POLICY "Admins can manage organisation members"
    ON organisation_members FOR ALL
    USING (auth_is_org_admin(organisation_id));

-- Standard Tenant Isolation Policy Template across all domain entities
-- Applies to: SELECT, INSERT, UPDATE, DELETE strictly scoped by organisation_id

-- 1. Business Documents
CREATE POLICY "Org members can view documents"
    ON business_documents FOR SELECT
    USING (auth_is_org_member(organisation_id));

CREATE POLICY "Org members can create documents"
    ON business_documents FOR INSERT
    WITH CHECK (auth_is_org_member(organisation_id));

CREATE POLICY "Org members can update documents"
    ON business_documents FOR UPDATE
    USING (auth_is_org_member(organisation_id));

CREATE POLICY "Org admins can delete documents"
    ON business_documents FOR DELETE
    USING (auth_is_org_admin(organisation_id));

-- 2. Compliance Records
CREATE POLICY "Org members can view compliance records"
    ON compliance_records FOR SELECT
    USING (auth_is_org_member(organisation_id));

CREATE POLICY "Org members can manage compliance records"
    ON compliance_records FOR ALL
    USING (auth_is_org_member(organisation_id));

-- 3. Insurance Records
CREATE POLICY "Org members can view insurance records"
    ON insurance_records FOR SELECT
    USING (auth_is_org_member(organisation_id));

CREATE POLICY "Org members can manage insurance records"
    ON insurance_records FOR ALL
    USING (auth_is_org_member(organisation_id));

-- 4. Licences
CREATE POLICY "Org members can view licences"
    ON licences FOR SELECT
    USING (auth_is_org_member(organisation_id));

CREATE POLICY "Org members can manage licences"
    ON licences FOR ALL
    USING (auth_is_org_member(organisation_id));

-- 5. Employees, Certifications, Training, Equipment
CREATE POLICY "Org members can view employees" ON employees FOR SELECT USING (auth_is_org_member(organisation_id));
CREATE POLICY "Org admins can manage employees" ON employees FOR ALL USING (auth_is_org_admin(organisation_id));

CREATE POLICY "Org members can view certifications" ON certifications FOR SELECT USING (auth_is_org_member(organisation_id));
CREATE POLICY "Org members can manage certifications" ON certifications FOR ALL USING (auth_is_org_member(organisation_id));

CREATE POLICY "Org members can view training records" ON training_records FOR SELECT USING (auth_is_org_member(organisation_id));
CREATE POLICY "Org members can manage training records" ON training_records FOR ALL USING (auth_is_org_member(organisation_id));

CREATE POLICY "Org members can view equipment" ON equipment FOR SELECT USING (auth_is_org_member(organisation_id));
CREATE POLICY "Org members can manage equipment" ON equipment FOR ALL USING (auth_is_org_member(organisation_id));

-- 6. Generated Documents, Quotes, Proposals, Projects
CREATE POLICY "Org members can view generated documents" ON generated_documents FOR SELECT USING (auth_is_org_member(organisation_id));
CREATE POLICY "Org members can manage generated documents" ON generated_documents FOR ALL USING (auth_is_org_member(organisation_id));

CREATE POLICY "Org members can view quotes" ON quotes FOR SELECT USING (auth_is_org_member(organisation_id));
CREATE POLICY "Org members can manage quotes" ON quotes FOR ALL USING (auth_is_org_member(organisation_id));

CREATE POLICY "Org members can view proposals" ON proposals FOR SELECT USING (auth_is_org_member(organisation_id));
CREATE POLICY "Org members can manage proposals" ON proposals FOR ALL USING (auth_is_org_member(organisation_id));

CREATE POLICY "Org members can view projects" ON projects FOR SELECT USING (auth_is_org_member(organisation_id));
CREATE POLICY "Org members can manage projects" ON projects FOR ALL USING (auth_is_org_member(organisation_id));

-- 7. Verification Records
CREATE POLICY "Org members can view verification records"
    ON verification_records FOR SELECT
    USING (auth_is_org_member(organisation_id));

CREATE POLICY "Org admins can submit verification requests"
    ON verification_records FOR INSERT
    WITH CHECK (auth_is_org_admin(organisation_id));

-- 8. Public Profiles:
-- Public can ONLY view if visibility = 'published' AND is_indexable = true
-- Org members can always view and manage their own profile
CREATE POLICY "Public can view published profiles"
    ON public_profiles FOR SELECT
    USING (visibility = 'published');

CREATE POLICY "Org members can manage public profile"
    ON public_profiles FOR ALL
    USING (auth_is_org_member(organisation_id));

-- 9. Subscriptions, Audit Logs & Notifications
CREATE POLICY "Org members can view subscription" ON subscriptions FOR SELECT USING (auth_is_org_member(organisation_id));
CREATE POLICY "Org members can view audit logs" ON audit_logs FOR SELECT USING (auth_is_org_member(organisation_id));
CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (recipient_user_id = auth.uid());

-- 10. Public CMS & Read-Only Reference Tables
CREATE POLICY "Public can view active trades" ON trades FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view active templates" ON document_templates FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view active compliance requirements" ON compliance_requirements FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view active plans" ON plans FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view published SEO pages" ON seo_pages FOR SELECT USING (index_status = 'indexable' AND review_status = 'approved_for_publication');
CREATE POLICY "Public can view active redirects" ON redirects FOR SELECT USING (is_active = TRUE);

-- Leads: Anonymous visitors can insert lead events, only platform admins can view
CREATE POLICY "Public can submit leads" ON leads FOR INSERT WITH CHECK (TRUE);
-- Analytics: Anonymous or authenticated events can be recorded
CREATE POLICY "Anyone can record analytics events" ON analytics_events FOR INSERT WITH CHECK (TRUE);

