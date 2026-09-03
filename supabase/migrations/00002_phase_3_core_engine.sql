-- =============================================================================
-- AVORRIA CONTRACTOR PLATFORM — PHASE 3: CORE ENGINE EXTENSION
-- =============================================================================

-- 1. Contractor Profiles: Onboarding state and employee count
ALTER TABLE contractor_profiles
    ADD COLUMN IF NOT EXISTS onboarding_status VARCHAR(30) NOT NULL DEFAULT 'not_started' 
        CHECK (onboarding_status IN ('not_started', 'in_progress', 'ready_for_dashboard', 'completed')),
    ADD COLUMN IF NOT EXISTS onboarding_started_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS onboarding_last_saved_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS employee_count INT DEFAULT 1,
    ADD COLUMN IF NOT EXISTS onboarding_data JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2. Compliance Requirements: Authoritative taxonomy and governance
ALTER TABLE compliance_requirements
    ADD COLUMN IF NOT EXISTS requirement_type VARCHAR(50) NOT NULL DEFAULT 'avorria_readiness'
        CHECK (requirement_type IN ('legal_regulatory', 'industry_standard', 'client_prequal', 'avorria_readiness')),
    ADD COLUMN IF NOT EXISTS source_name VARCHAR(150),
    ADD COLUMN IF NOT EXISTS source_url TEXT,
    ADD COLUMN IF NOT EXISTS effective_date DATE,
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS next_review_date DATE,
    ADD COLUMN IF NOT EXISTS review_status VARCHAR(50) NOT NULL DEFAULT 'active'
        CHECK (review_status IN ('active', 'under_review', 'superseded', 'deprecated')),
    ADD COLUMN IF NOT EXISTS readiness_weight INT NOT NULL DEFAULT 10;

-- 3. Business Documents: Extraction hooks and requirement associations
ALTER TABLE business_documents
    ADD COLUMN IF NOT EXISTS issuing_organisation VARCHAR(200),
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS associated_requirement_id UUID REFERENCES compliance_requirements(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS extraction_status VARCHAR(50) DEFAULT 'unprocessed'
        CHECK (extraction_status IN ('unprocessed', 'pending', 'extracted', 'failed', 'verified')),
    ADD COLUMN IF NOT EXISTS extracted_metadata JSONB DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS extraction_confidence NUMERIC(5, 2) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS extraction_completed_at TIMESTAMPTZ DEFAULT NULL;

-- 4. Generated Documents: Generation method (AI vs Template distinction)
ALTER TABLE generated_documents
    ADD COLUMN IF NOT EXISTS generation_method VARCHAR(50) NOT NULL DEFAULT 'template'
        CHECK (generation_method IN ('ai', 'template', 'manual'));

-- 5. Indexes for fast tenant-scoped queries
CREATE INDEX IF NOT EXISTS idx_gen_docs_org_status ON generated_documents(organisation_id, document_status);
CREATE INDEX IF NOT EXISTS idx_bus_docs_org_status ON business_documents(organisation_id, status);
CREATE INDEX IF NOT EXISTS idx_comp_records_org_req ON compliance_records(organisation_id, requirement_id);

-- 6. Seed Structured Trade Taxonomy (Standard 13 Core Commercial Categories)
INSERT INTO trades (name, slug, category, description, is_active, sort_order)
VALUES
    ('Electrical Contracting', 'electrical-contracting', 'mep', 'Commercial, industrial and residential electrical installations, switchgear, branch wiring, lighting, and low-voltage systems.', TRUE, 1),
    ('HVAC & Mechanical', 'hvac-mechanical', 'mep', 'Heating, ventilation, air conditioning, refrigeration, ductwork, and mechanical equipment servicing.', TRUE, 2),
    ('Commercial Plumbing', 'commercial-plumbing', 'mep', 'Commercial domestic water, sanitary waste, storm drainage, gas piping, backflow prevention, and medical gas.', TRUE, 3),
    ('Commercial Roofing', 'commercial-roofing', 'exterior', 'Single-ply membranes (TPO/EPDM), modified bitumen, standing seam metal, built-up roofing, and commercial coatings.', TRUE, 4),
    ('General Contracting', 'general-contracting', 'general', 'Prime contracting, project management, commercial tenant improvements, structural retrofits, and site logistics.', TRUE, 5),
    ('Concrete & Masonry', 'concrete-masonry', 'structural', 'Foundations, slab-on-grade, structural cast-in-place walls, post-tensioned slabs, masonry block, and flatwork.', TRUE, 6),
    ('Carpentry & Framing', 'carpentry-framing', 'structural', 'Heavy timber, commercial light-gauge metal framing, wood framing, exterior sheathing, and architectural woodwork.', TRUE, 7),
    ('Painting & Wallcoverings', 'painting-wallcoverings', 'finishes', 'Commercial interior/exterior architectural painting, protective industrial coatings, epoxy flooring, and wallcoverings.', TRUE, 8),
    ('Flooring & Tile', 'flooring-tile', 'finishes', 'Commercial carpet tile, luxury vinyl tile (LVT), terrazzo, ceramic and porcelain tile, and moisture barrier systems.', TRUE, 9),
    ('Landscaping & Earthwork', 'landscaping-earthwork', 'exterior', 'Rough/finish grading, commercial irrigation, hardscaping, stormwater bioswales, and site grounds development.', TRUE, 10),
    ('Fire Protection & Life Safety', 'fire-protection', 'specialty', 'Automatic fire sprinkler systems, fire pumps, standpipes, clean agent suppression, and life safety testing.', TRUE, 11),
    ('Low Voltage & Telecommunications', 'low-voltage-telecom', 'mep', 'Structured cabling, optical fiber, security access control, video surveillance, audiovisual, and nurse call systems.', TRUE, 12),
    ('Specialty Trades & Demolition', 'specialty-demolition', 'specialty', 'Interior architectural demolition, hazardous abatement support, scaffolding, industrial rigging, and specialty trade scopes.', TRUE, 13)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, category = EXCLUDED.category, description = EXCLUDED.description;
