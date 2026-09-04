-- =============================================================================
-- AVORRIA DATABASE MIGRATION 00004: PHASE 6 VERIFICATION, TRUST & PUBLIC PASSPORT
-- =============================================================================

-- 1. Extend verification_records with evidence lifecycle status
ALTER TABLE verification_records
ADD COLUMN IF NOT EXISTS evidence_status VARCHAR(30) NOT NULL DEFAULT 'submitted'
CHECK (evidence_status IN (
    'submitted', 'accepted', 'rejected', 'needs_review', 'expired', 'superseded', 'not_applicable'
)),
ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) DEFAULT 'document_vault',
ADD COLUMN IF NOT EXISTS audit_notes TEXT;

-- 2. Verification Submissions Table (formal review rounds and decisions)
CREATE TABLE IF NOT EXISTS verification_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'submitted' CHECK (status IN (
        'preparing', 'ready_to_submit', 'submitted', 'under_review',
        'additional_evidence_required', 'approved', 'verified',
        'rejected', 'withdrawn', 'expired', 'suspended'
    )),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewer_id VARCHAR(100),
    reviewer_name VARCHAR(255),
    verification_type VARCHAR(50) NOT NULL DEFAULT 'contractor_operational_verification',
    criteria_version VARCHAR(20) NOT NULL DEFAULT '2026.1',
    decision VARCHAR(30) CHECK (decision IN ('approve', 'reject', 'request_evidence', 'suspend', 'withdraw')),
    decision_reason TEXT,
    next_review_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Verification Evidence Link Table (links submission rounds to specific evidence items)
CREATE TABLE IF NOT EXISTS verification_submission_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES verification_submissions(id) ON DELETE CASCADE,
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    criterion_slug VARCHAR(80) NOT NULL,
    evidence_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    evidence_reference VARCHAR(255),
    evidence_hash VARCHAR(64),
    status VARCHAR(30) NOT NULL DEFAULT 'submitted' CHECK (status IN (
        'submitted', 'accepted', 'rejected', 'needs_review', 'expired', 'superseded', 'not_applicable'
    )),
    reviewer_notes TEXT,
    rejection_reason TEXT,
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Extend contractor_profiles public_settings with granular section toggles
ALTER TABLE contractor_profiles
ADD COLUMN IF NOT EXISTS public_sections JSONB NOT NULL DEFAULT '{
  "show_trades": true,
  "show_service_areas": true,
  "show_credentials": true,
  "show_insurance": true,
  "show_safety_program": true,
  "show_verification": true,
  "show_readiness_score": true
}'::jsonb;

-- 5. Row Level Security Policies
ALTER TABLE verification_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_submission_evidence ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policies
CREATE POLICY "Tenant members can read own verification submissions"
    ON verification_submissions FOR SELECT
    USING (auth_is_org_member(organisation_id));

CREATE POLICY "Tenant members can insert own verification submissions"
    ON verification_submissions FOR INSERT
    WITH CHECK (auth_is_org_member(organisation_id));

CREATE POLICY "Tenant members can read own submission evidence"
    ON verification_submission_evidence FOR SELECT
    USING (auth_is_org_member(organisation_id));

CREATE POLICY "Tenant members can insert own submission evidence"
    ON verification_submission_evidence FOR INSERT
    WITH CHECK (auth_is_org_member(organisation_id));

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_ver_submissions_org ON verification_submissions(organisation_id);
CREATE INDEX IF NOT EXISTS idx_ver_submissions_status ON verification_submissions(status);
CREATE INDEX IF NOT EXISTS idx_ver_sub_evidence_sub ON verification_submission_evidence(submission_id);
CREATE INDEX IF NOT EXISTS idx_ver_sub_evidence_org ON verification_submission_evidence(organisation_id);
