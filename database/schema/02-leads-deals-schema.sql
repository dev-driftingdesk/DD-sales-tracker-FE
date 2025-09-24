-- =====================================================
-- SalesTracker CRM Database Schema - Leads & Deals
-- =====================================================
-- Advanced lead management, deal pipeline, and activities
-- Supports lead scoring, routing, and complex analytics
-- =====================================================

-- =====================================================
-- LEADS MANAGEMENT
-- =====================================================

-- Main leads table
CREATE TABLE leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Company and contact information
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    location VARCHAR(255),
    
    -- Lead source and classification
    source lead_source_type NOT NULL,
    status lead_status_type NOT NULL DEFAULT 'new',
    language VARCHAR(50) DEFAULT 'english',
    
    -- Product and business information
    product_interest TEXT,
    deal_value DECIMAL(12,2) DEFAULT 0,
    closed_value DECIMAL(12,2),
    
    -- Assignment and routing
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Lead scoring and quality metrics
    lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
    quality_grade CHAR(1) CHECK (quality_grade IN ('A', 'B', 'C', 'D')),
    
    -- Routing and AI recommendations
    routing_data JSONB DEFAULT '{}',
    ai_insights JSONB DEFAULT '{}',
    
    -- Status tracking
    tags TEXT[],
    notes TEXT,
    
    -- Outcome tracking for closed leads
    closed_date TIMESTAMP WITH TIME ZONE,
    lost_reason TEXT,
    lost_date TIMESTAMP WITH TIME ZONE,
    
    -- Activity tracking
    last_activity_at TIMESTAMP WITH TIME ZONE,
    last_activity_type VARCHAR(50),
    activities_count INTEGER DEFAULT 0,
    
    -- Performance metrics (cached for performance)
    time_to_first_contact INTEGER, -- minutes
    average_response_time INTEGER, -- minutes
    total_contact_attempts INTEGER DEFAULT 0,
    
    -- Lead lifecycle tracking
    first_contacted_at TIMESTAMP WITH TIME ZONE,
    qualified_at TIMESTAMP WITH TIME ZONE,
    
    -- Custom fields for flexibility
    custom_fields JSONB DEFAULT '{}',
    
    -- External integration tracking
    external_ids JSONB DEFAULT '{}',
    sync_status VARCHAR(50) DEFAULT 'synced',
    last_sync_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Indexes for leads - optimized for common query patterns
CREATE INDEX idx_leads_status ON leads(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_source ON leads(source) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_created_at ON leads(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_deal_value ON leads(deal_value DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_lead_score ON leads(lead_score DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_last_activity ON leads(last_activity_at DESC NULLS LAST) WHERE deleted_at IS NULL;

-- Composite indexes for complex queries
CREATE INDEX idx_leads_status_assigned ON leads(status, assigned_to) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_source_status ON leads(source, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_assigned_created ON leads(assigned_to, created_at DESC) WHERE deleted_at IS NULL;

-- Full-text search index for leads
CREATE INDEX idx_leads_search ON leads USING GIN (
    (company_name || ' ' || contact_name || ' ' || email || ' ' || COALESCE(notes, '') || ' ' || COALESCE(product_interest, '')) gin_trgm_ops
) WHERE deleted_at IS NULL;

-- Partial indexes for performance on active leads
CREATE INDEX idx_leads_active_new ON leads(created_at DESC) WHERE status = 'new' AND deleted_at IS NULL;
CREATE INDEX idx_leads_active_in_progress ON leads(last_activity_at DESC) WHERE status = 'in_progress' AND deleted_at IS NULL;
CREATE INDEX idx_leads_unassigned ON leads(created_at DESC) WHERE assigned_to IS NULL AND deleted_at IS NULL;

-- =====================================================
-- LEAD ROUTING AND SCORING
-- =====================================================

-- Lead routing rules
CREATE TABLE lead_routing_rules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Rule configuration
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    
    -- Conditions (stored as JSON for flexibility)
    conditions JSONB NOT NULL DEFAULT '{}',
    
    -- Actions when rule matches
    actions JSONB NOT NULL DEFAULT '{}',
    
    -- Performance tracking
    match_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_lead_routing_rules_active ON lead_routing_rules(is_active, priority DESC);
CREATE INDEX idx_lead_routing_rules_priority ON lead_routing_rules(priority DESC) WHERE is_active = true;

-- Lead scoring factors configuration
CREATE TABLE lead_scoring_factors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category VARCHAR(100) NOT NULL, -- company_profile, contact_quality, deal_potential, source_quality
    factor_name VARCHAR(100) NOT NULL,
    weight DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    max_score INTEGER NOT NULL DEFAULT 10,
    
    -- Scoring logic (JSON rules)
    scoring_rules JSONB NOT NULL DEFAULT '{}',
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(category, factor_name)
);

CREATE INDEX idx_lead_scoring_factors_category ON lead_scoring_factors(category) WHERE is_active = true;

-- Lead routing assignments (history)
CREATE TABLE lead_routing_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    
    -- Assignment details
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_from UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Routing information
    routing_method VARCHAR(50) NOT NULL, -- auto, manual, rule_based
    routing_rule_id UUID REFERENCES lead_routing_rules(id) ON DELETE SET NULL,
    confidence_score DECIMAL(5,2),
    
    -- Reasoning and metadata
    assignment_reasons TEXT[],
    metadata JSONB DEFAULT '{}',
    
    -- Status tracking
    is_active BOOLEAN DEFAULT true,
    ended_at TIMESTAMP WITH TIME ZONE,
    end_reason VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lead_routing_assignments_lead ON lead_routing_assignments(lead_id);
CREATE INDEX idx_lead_routing_assignments_assigned_to ON lead_routing_assignments(assigned_to) WHERE is_active = true;
CREATE INDEX idx_lead_routing_assignments_created_at ON lead_routing_assignments(created_at DESC);

-- =====================================================
-- DEALS AND PIPELINE MANAGEMENT
-- =====================================================

-- Deals table
CREATE TABLE deals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Basic deal information
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Related entities
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    company_name VARCHAR(255), -- Denormalized for performance
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    contact_name VARCHAR(255), -- Denormalized for performance
    
    -- Deal value and financial information
    value DECIMAL(12,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Pipeline stage and status
    stage deal_stage_type NOT NULL DEFAULT 'lead',
    probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
    
    -- Assignment and ownership
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    
    -- Source and classification
    source VARCHAR(100),
    tags TEXT[],
    
    -- Timeline and dates
    expected_close_date DATE,
    actual_close_date DATE,
    
    -- Outcome tracking
    won_reason TEXT,
    lost_reason TEXT,
    competitor_info TEXT,
    
    -- Performance metrics
    sales_cycle_days INTEGER,
    activities_count INTEGER DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    
    -- Stage tracking
    stage_history JSONB DEFAULT '[]',
    current_stage_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Notes and additional information
    notes TEXT,
    next_steps TEXT,
    
    -- Custom fields
    custom_fields JSONB DEFAULT '{}',
    
    -- External integration
    external_ids JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Indexes for deals
CREATE INDEX idx_deals_stage ON deals(stage) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_assigned_to ON deals(assigned_to) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_value ON deals(value DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_close_date ON deals(expected_close_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_created_at ON deals(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_lead_id ON deals(lead_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_company_id ON deals(company_id) WHERE deleted_at IS NULL;

-- Composite indexes for pipeline queries
CREATE INDEX idx_deals_stage_assigned ON deals(stage, assigned_to) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_assigned_close_date ON deals(assigned_to, expected_close_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_active_pipeline ON deals(stage, value DESC) WHERE stage NOT IN ('closed-won', 'closed-lost') AND deleted_at IS NULL;

-- Deal products (many-to-many relationship)
CREATE TABLE deal_products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_price DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    
    -- Product details at time of deal (for historical accuracy)
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(deal_id, product_id)
);

CREATE INDEX idx_deal_products_deal ON deal_products(deal_id);
CREATE INDEX idx_deal_products_product ON deal_products(product_id);

-- =====================================================
-- ACTIVITIES AND INTERACTIONS
-- =====================================================

-- Activities table (for both leads and deals)
CREATE TABLE activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Related entities (polymorphic relationship)
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    
    -- Activity details
    type activity_type NOT NULL,
    title VARCHAR(255),
    description TEXT,
    
    -- Activity metadata
    is_from_lead BOOLEAN DEFAULT false,
    is_response BOOLEAN DEFAULT false,
    
    -- Scheduling and timing
    scheduled_for TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    
    -- Outcome and results
    outcome VARCHAR(100),
    outcome_notes TEXT,
    
    -- Priority and categorization
    priority notification_priority DEFAULT 'medium',
    category VARCHAR(100),
    tags TEXT[],
    
    -- Privacy and access control
    is_private BOOLEAN DEFAULT false,
    
    -- Activity metadata (flexible JSON storage)
    metadata JSONB DEFAULT '{}',
    
    -- File attachments
    attachments TEXT[],
    
    -- User and assignment
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'completed',
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- External integration
    external_ids JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Ensure at least one entity relationship
    CONSTRAINT activities_entity_check CHECK (
        lead_id IS NOT NULL OR deal_id IS NOT NULL OR contact_id IS NOT NULL OR company_id IS NOT NULL
    )
);

-- Indexes for activities
CREATE INDEX idx_activities_lead_id ON activities(lead_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_activities_deal_id ON activities(deal_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_activities_contact_id ON activities(contact_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_activities_company_id ON activities(company_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_activities_user_id ON activities(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_activities_type ON activities(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_activities_created_at ON activities(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_activities_scheduled_for ON activities(scheduled_for) WHERE deleted_at IS NULL;

-- Composite indexes for common queries
CREATE INDEX idx_activities_lead_created ON activities(lead_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_activities_deal_created ON activities(deal_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_activities_user_created ON activities(user_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_activities_type_created ON activities(type, created_at DESC) WHERE deleted_at IS NULL;

-- Partial indexes for performance
CREATE INDEX idx_activities_upcoming_tasks ON activities(scheduled_for) 
    WHERE scheduled_for > NOW() AND status != 'completed' AND deleted_at IS NULL;
CREATE INDEX idx_activities_overdue_tasks ON activities(scheduled_for) 
    WHERE scheduled_for < NOW() AND status != 'completed' AND deleted_at IS NULL;

-- =====================================================
-- TEAM COLLABORATION
-- =====================================================

-- Lead team members (for collaborative lead management)
CREATE TABLE lead_team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    role VARCHAR(50) DEFAULT 'collaborator', -- owner, collaborator, viewer
    
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    added_by UUID REFERENCES users(id) ON DELETE SET NULL,
    removed_at TIMESTAMP WITH TIME ZONE,
    removed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE(lead_id, user_id, removed_at) -- Allow re-adding
);

CREATE INDEX idx_lead_team_members_lead ON lead_team_members(lead_id) WHERE removed_at IS NULL;
CREATE INDEX idx_lead_team_members_user ON lead_team_members(user_id) WHERE removed_at IS NULL;

-- Deal team members (for collaborative deal management)
CREATE TABLE deal_team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    role VARCHAR(50) DEFAULT 'collaborator', -- owner, collaborator, viewer
    
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    added_by UUID REFERENCES users(id) ON DELETE SET NULL,
    removed_at TIMESTAMP WITH TIME ZONE,
    removed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE(deal_id, user_id, removed_at) -- Allow re-adding
);

CREATE INDEX idx_deal_team_members_deal ON deal_team_members(deal_id) WHERE removed_at IS NULL;
CREATE INDEX idx_deal_team_members_user ON deal_team_members(user_id) WHERE removed_at IS NULL;

-- =====================================================
-- TRIGGERS AND FUNCTIONS FOR LEADS & DEALS
-- =====================================================

-- Function to update lead metrics when activities are added
CREATE OR REPLACE FUNCTION update_lead_activity_metrics()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update activities count and last activity
        UPDATE leads SET 
            activities_count = activities_count + 1,
            last_activity_at = NEW.created_at,
            last_activity_type = NEW.type,
            updated_at = NOW()
        WHERE id = NEW.lead_id;
        
        -- Update first contact time if this is a first contact activity
        IF NEW.type IN ('call', 'email', 'meeting') AND NOT NEW.is_from_lead THEN
            UPDATE leads SET 
                first_contacted_at = COALESCE(first_contacted_at, NEW.created_at),
                time_to_first_contact = CASE 
                    WHEN first_contacted_at IS NULL THEN 
                        EXTRACT(EPOCH FROM (NEW.created_at - created_at)) / 60
                    ELSE time_to_first_contact
                END
            WHERE id = NEW.lead_id;
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrease activities count
        UPDATE leads SET 
            activities_count = GREATEST(0, activities_count - 1),
            updated_at = NOW()
        WHERE id = OLD.lead_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update deal metrics when activities are added
CREATE OR REPLACE FUNCTION update_deal_activity_metrics()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE deals SET 
            activities_count = activities_count + 1,
            last_activity_at = NEW.created_at,
            updated_at = NOW()
        WHERE id = NEW.deal_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE deals SET 
            activities_count = GREATEST(0, activities_count - 1),
            updated_at = NOW()
        WHERE id = OLD.deal_id;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to track deal stage changes
CREATE OR REPLACE FUNCTION track_deal_stage_changes()
RETURNS TRIGGER AS $$
DECLARE
    stage_change JSONB;
BEGIN
    IF OLD.stage != NEW.stage THEN
        -- Calculate time in previous stage
        stage_change := jsonb_build_object(
            'from_stage', OLD.stage,
            'to_stage', NEW.stage,
            'changed_at', NOW(),
            'changed_by', current_setting('app.current_user_id', true)::UUID,
            'days_in_stage', EXTRACT(EPOCH FROM (NOW() - OLD.current_stage_since)) / 86400
        );
        
        -- Update stage history
        NEW.stage_history := COALESCE(NEW.stage_history, '[]'::jsonb) || stage_change;
        NEW.current_stage_since := NOW();
        
        -- Update probability based on stage
        NEW.probability := CASE NEW.stage
            WHEN 'lead' THEN 10
            WHEN 'qualified' THEN 25
            WHEN 'proposal' THEN 50
            WHEN 'negotiation' THEN 75
            WHEN 'closed-won' THEN 100
            WHEN 'closed-lost' THEN 0
            ELSE NEW.probability
        END;
        
        -- Set close date for closed deals
        IF NEW.stage IN ('closed-won', 'closed-lost') AND OLD.stage NOT IN ('closed-won', 'closed-lost') THEN
            NEW.actual_close_date := CURRENT_DATE;
            NEW.sales_cycle_days := EXTRACT(EPOCH FROM (NOW() - NEW.created_at)) / 86400;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update contact interaction count
CREATE OR REPLACE FUNCTION update_contact_interactions()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.contact_id IS NOT NULL THEN
        UPDATE contacts SET 
            interaction_count = interaction_count + 1,
            last_interaction_at = NEW.created_at,
            updated_at = NOW()
        WHERE id = NEW.contact_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER activities_update_lead_metrics 
    AFTER INSERT OR DELETE ON activities 
    FOR EACH ROW 
    WHEN (NEW.lead_id IS NOT NULL OR OLD.lead_id IS NOT NULL)
    EXECUTE FUNCTION update_lead_activity_metrics();

CREATE TRIGGER activities_update_deal_metrics 
    AFTER INSERT OR DELETE ON activities 
    FOR EACH ROW 
    WHEN (NEW.deal_id IS NOT NULL OR OLD.deal_id IS NOT NULL)
    EXECUTE FUNCTION update_deal_activity_metrics();

CREATE TRIGGER deals_track_stage_changes 
    BEFORE UPDATE ON deals 
    FOR EACH ROW 
    EXECUTE FUNCTION track_deal_stage_changes();

CREATE TRIGGER activities_update_contact_interactions 
    AFTER INSERT ON activities 
    FOR EACH ROW 
    EXECUTE FUNCTION update_contact_interactions();

-- Apply audit and timestamp triggers
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER deals_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER leads_audit AFTER INSERT OR UPDATE OR DELETE ON leads FOR EACH ROW EXECUTE FUNCTION log_entity_changes();
CREATE TRIGGER deals_audit AFTER INSERT OR UPDATE OR DELETE ON deals FOR EACH ROW EXECUTE FUNCTION log_entity_changes();
CREATE TRIGGER activities_audit AFTER INSERT OR UPDATE OR DELETE ON activities FOR EACH ROW EXECUTE FUNCTION log_entity_changes();

COMMENT ON TABLE leads IS 'Core leads management with scoring, routing, and analytics';
COMMENT ON TABLE deals IS 'Deal pipeline management with stage tracking and metrics';
COMMENT ON TABLE activities IS 'All interactions and activities for leads, deals, and contacts';
COMMENT ON TABLE lead_routing_rules IS 'Configurable rules for intelligent lead assignment';
COMMENT ON TABLE deal_products IS 'Products associated with deals for accurate revenue tracking';