-- =============================================================================
-- AVORRIA DATABASE MIGRATION 00003: PHASE 5 CONTRACTOR PASSPORT & VERIFICATION
-- =============================================================================

-- 1. Extend contractor_profiles with Passport visibility & public settings
ALTER TABLE contractor_profiles
ADD COLUMN IF NOT EXISTS passport_visibility VARCHAR(30) NOT NULL DEFAULT 'private'
CHECK (passport_visibility IN ('private', 'draft', 'published', 'suspended', 'archived')),
ADD COLUMN IF NOT EXISTS public_settings JSONB NOT NULL DEFAULT '{
  "show_insurance": true,
  "show_license": true,
  "show_safety_program": true,
  "show_readiness_score": true,
  "show_workforce_summary": true,
  "custom_headline": null
}'::jsonb;

-- 2. Verification Criteria Table (human-governed standards & regulatory rules)
CREATE TABLE IF NOT EXISTS verification_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'business_identity', 'insurance', 'licensing', 'safety_program', 'workforce_training'
    )),
    trade VARCHAR(80), -- NULL if universal
    jurisdiction VARCHAR(20), -- NULL if universal, or e.g. 'TX', 'CA'
    requirement_type VARCHAR(50) NOT NULL CHECK (requirement_type IN (
        'legal_regulatory', 'industry_standard', 'client_prequal', 'avorria_readiness'
    )),
    evidence_type VARCHAR(50) NOT NULL CHECK (evidence_type IN (
        'insurance_coi', 'trade_license', 'safety_plan', 'jha_jsa', 'osha_card', 'business_formation', 'other'
    )),
    mandatory BOOLEAN NOT NULL DEFAULT true,
    applicability_condition JSONB, -- conditions e.g. {"min_crew_size": 5}
    source_name VARCHAR(255) NOT NULL,
    source_url TEXT,
    effective_date DATE NOT NULL,
    next_review_date DATE NOT NULL,
    governed_by VARCHAR(100) NOT NULL DEFAULT 'Avorria Standards Committee',
    active BOOLEAN NOT NULL DEFAULT true,
    verification_weight INT NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Extend verification_records with criterion reference, evidence hash, and public reference
ALTER TABLE verification_records
ADD COLUMN IF NOT EXISTS criterion_slug VARCHAR(80),
ADD COLUMN IF NOT EXISTS evidence_hash VARCHAR(64),
ADD COLUMN IF NOT EXISTS verification_reference VARCHAR(50),
ADD COLUMN IF NOT EXISTS clarification_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS clarification_response TEXT;

-- 4. Verification Events Table (Immutable Append-Only Audit Trail)
CREATE TABLE IF NOT EXISTS verification_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_record_id UUID NOT NULL REFERENCES verification_records(id) ON DELETE CASCADE,
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'submitted', 'review_started', 'clarification_requested', 'clarification_provided',
        'verified', 'rejected', 'expired', 'revoked', 'evidence_changed'
    )),
    previous_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    actor_id VARCHAR(100) NOT NULL,
    actor_type VARCHAR(30) NOT NULL CHECK (actor_type IN ('contractor', 'reviewer', 'system')),
    notes TEXT,
    evidence_reference VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Row Level Security Policies
ALTER TABLE verification_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_events ENABLE ROW LEVEL SECURITY;

-- verification_criteria: Everyone can read active criteria, only internal reviewers can insert/update
CREATE POLICY "Public read active verification criteria"
    ON verification_criteria FOR SELECT
    USING (active = true);

-- verification_events: Tenant isolation for organisations
CREATE POLICY "Tenant members can read own verification events"
    ON verification_events FOR SELECT
    USING (auth_is_org_member(organisation_id));

CREATE POLICY "System and reviewers can insert verification events"
    ON verification_events FOR INSERT
    WITH CHECK (auth_is_org_member(organisation_id));

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_verification_criteria_slug ON verification_criteria(slug);
CREATE INDEX IF NOT EXISTS idx_verification_records_org ON verification_records(organisation_id);
CREATE INDEX IF NOT EXISTS idx_verification_events_record ON verification_events(verification_record_id);
