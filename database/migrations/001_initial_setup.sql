-- =====================================================
-- SalesTracker CRM Database Migration 001
-- Initial Database Setup and Schema Creation
-- =====================================================
-- This migration creates the complete database schema
-- Run migrations in order: 001, 002, 003, etc.
-- =====================================================

-- Track migration history
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(20) PRIMARY KEY,
    description TEXT NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    applied_by VARCHAR(255) DEFAULT CURRENT_USER,
    checksum VARCHAR(64)
);

-- Record this migration
INSERT INTO schema_migrations (version, description, checksum) 
VALUES ('001', 'Initial database setup and core schema', 'e8f7c9d2a1b3f4e6d5c8a9b7e4f1c2d5');

-- =====================================================
-- EXECUTE SCHEMA FILES IN DEPENDENCY ORDER
-- =====================================================

-- Core schema must be created first (users, companies, contacts, products)
\i /Users/vevomalik/Desktop/SalesTracker/database/schema/01-core-schema.sql

-- Leads and deals schema (depends on core schema)
\i /Users/vevomalik/Desktop/SalesTracker/database/schema/02-leads-deals-schema.sql

-- Communications schema (depends on leads and deals)
\i /Users/vevomalik/Desktop/SalesTracker/database/schema/03-communications-schema.sql

-- Analytics schema (depends on all previous schemas)
\i /Users/vevomalik/Desktop/SalesTracker/database/schema/04-analytics-performance-schema.sql

-- Integrations schema (depends on core schema)
\i /Users/vevomalik/Desktop/SalesTracker/database/schema/05-integrations-external-schema.sql

-- =====================================================
-- INITIAL CONFIGURATION DATA
-- =====================================================

-- Insert default product categories
INSERT INTO product_categories (id, name, description, sort_order) VALUES
    (uuid_generate_v4(), 'Tea & Beverages', 'All tea products and beverage items', 1),
    (uuid_generate_v4(), 'Accessories', 'Tea accessories and related products', 2),
    (uuid_generate_v4(), 'Gift Sets', 'Curated gift sets and collections', 3);

-- Insert default notification preferences structure
INSERT INTO notification_preferences (user_id, channels, category_preferences) 
SELECT 
    id,
    '{"in_app": true, "email": true, "sms": false, "push": false}'::jsonb,
    '{"leads": {"in_app": true, "email": true}, "deals": {"in_app": true, "email": true}, "tasks": {"in_app": true, "email": false}}'::jsonb
FROM users WHERE id IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- Insert default lead scoring factors
INSERT INTO lead_scoring_factors (category, factor_name, weight, max_score, scoring_rules) VALUES
    ('company_profile', 'company_size', 2.0, 10, '{"large": 10, "medium": 6, "small": 3, "unknown": 0}'::jsonb),
    ('company_profile', 'industry_match', 1.5, 8, '{"high_fit": 8, "medium_fit": 5, "low_fit": 2, "no_match": 0}'::jsonb),
    ('contact_quality', 'contact_level', 1.8, 9, '{"c_level": 9, "vp_level": 7, "director": 5, "manager": 3, "individual": 1}'::jsonb),
    ('deal_potential', 'estimated_value', 2.5, 15, '{"high": 15, "medium": 10, "low": 5, "very_low": 2}'::jsonb),
    ('source_quality', 'lead_source', 1.2, 6, '{"referral": 6, "website": 5, "event": 4, "social": 3, "cold": 1}'::jsonb);

-- Insert default conversion funnel stages
INSERT INTO conversion_funnel_stages (stage_name, stage_order, description, average_time_in_stage_days, conversion_rate_to_next) VALUES
    ('New Lead', 1, 'Newly created lead, not yet contacted', 1.0, 75.0),
    ('Contacted', 2, 'Initial contact made with lead', 3.0, 60.0),
    ('Qualified', 3, 'Lead has been qualified and shows interest', 7.0, 45.0),
    ('Proposal', 4, 'Proposal or quote has been sent', 10.0, 35.0),
    ('Negotiation', 5, 'In active negotiation phase', 14.0, 25.0),
    ('Closed Won', 6, 'Successfully closed deal', 0.0, 0.0),
    ('Closed Lost', 6, 'Deal was lost', 0.0, 0.0);

-- Insert default email templates
INSERT INTO email_templates (id, name, category, subject, body_html, variables, is_shared, created_by) 
SELECT 
    uuid_generate_v4(),
    'Welcome Email',
    'welcome',
    'Welcome to {{company_name}}!',
    '<h1>Welcome {{contact_name}}!</h1><p>Thank you for your interest in our tea products. We''re excited to work with {{company_name}}.</p><p>Best regards,<br>{{user_name}}</p>',
    '["contact_name", "company_name", "user_name"]'::jsonb,
    true,
    u.id
FROM users u 
WHERE u.role = 'admin' 
LIMIT 1;

-- =====================================================
-- INITIAL INDEXES FOR PERFORMANCE
-- =====================================================

-- Additional composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_performance_lookup 
    ON leads(assigned_to, status, created_at DESC) 
    WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deals_pipeline_value 
    ON deals(stage, assigned_to, value DESC) 
    WHERE stage NOT IN ('closed-won', 'closed-lost') AND deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_recent_user 
    ON activities(user_id, created_at DESC) 
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days' AND deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_emails_user_recent 
    ON emails(user_id, sent_at DESC) 
    WHERE sent_at >= CURRENT_DATE - INTERVAL '30 days' AND deleted_at IS NULL;

-- =====================================================
-- PERFORMANCE OPTIMIZATION SETTINGS
-- =====================================================

-- Update table statistics for better query planning
ANALYZE users;
ANALYZE companies;
ANALYZE contacts;
ANALYZE leads;
ANALYZE deals;
ANALYZE activities;
ANALYZE emails;

-- =====================================================
-- SECURITY SETUP
-- =====================================================

-- Create application-specific roles
CREATE ROLE salestracker_app_user;
CREATE ROLE salestracker_readonly;
CREATE ROLE salestracker_admin;

-- Grant appropriate permissions to application role
GRANT CONNECT ON DATABASE salestracker TO salestracker_app_user;
GRANT USAGE ON SCHEMA public TO salestracker_app_user;

-- Grant table permissions for app user
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO salestracker_app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO salestracker_app_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO salestracker_app_user;

-- Grant read-only permissions
GRANT CONNECT ON DATABASE salestracker TO salestracker_readonly;
GRANT USAGE ON SCHEMA public TO salestracker_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO salestracker_readonly;

-- Grant admin permissions
GRANT ALL PRIVILEGES ON DATABASE salestracker TO salestracker_admin;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO salestracker_app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO salestracker_app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO salestracker_app_user;

-- =====================================================
-- ROW LEVEL SECURITY SETUP
-- =====================================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Create policies for user data access
CREATE POLICY users_own_data ON users
    FOR ALL TO salestracker_app_user
    USING (id = current_setting('app.current_user_id', true)::UUID)
    WITH CHECK (id = current_setting('app.current_user_id', true)::UUID);

-- Create policies for leads (users can see assigned leads + team leads)
CREATE POLICY leads_user_access ON leads
    FOR ALL TO salestracker_app_user
    USING (
        assigned_to = current_setting('app.current_user_id', true)::UUID
        OR assigned_to IN (
            SELECT tm.user_id 
            FROM team_members tm1 
            JOIN team_members tm2 ON tm1.team_id = tm2.team_id
            WHERE tm1.user_id = current_setting('app.current_user_id', true)::UUID
            AND tm2.left_at IS NULL
            AND tm1.left_at IS NULL
        )
    );

-- Similar policies for deals and activities
CREATE POLICY deals_user_access ON deals
    FOR ALL TO salestracker_app_user
    USING (
        assigned_to = current_setting('app.current_user_id', true)::UUID
        OR assigned_to IN (
            SELECT tm.user_id 
            FROM team_members tm1 
            JOIN team_members tm2 ON tm1.team_id = tm2.team_id
            WHERE tm1.user_id = current_setting('app.current_user_id', true)::UUID
            AND tm2.left_at IS NULL
            AND tm1.left_at IS NULL
        )
    );

CREATE POLICY activities_user_access ON activities
    FOR ALL TO salestracker_app_user
    USING (user_id = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY emails_user_access ON emails
    FOR ALL TO salestracker_app_user
    USING (user_id = current_setting('app.current_user_id', true)::UUID);

-- =====================================================
-- FINAL SETUP TASKS
-- =====================================================

-- Refresh materialized view
REFRESH MATERIALIZED VIEW dashboard_metrics;

-- Set up automatic materialized view refresh (requires pg_cron extension)
-- SELECT cron.schedule('refresh-dashboard-metrics', '*/15 * * * *', 'REFRESH MATERIALIZED VIEW dashboard_metrics;');

-- Create function to set application context
CREATE OR REPLACE FUNCTION set_current_user_context(user_uuid UUID)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_uuid::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution on context function
GRANT EXECUTE ON FUNCTION set_current_user_context(UUID) TO salestracker_app_user;

-- =====================================================
-- MIGRATION COMPLETION
-- =====================================================

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Migration 001 completed successfully';
    RAISE NOTICE 'Core schema created with % tables', (
        SELECT COUNT(*) FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    );
    RAISE NOTICE 'Database ready for SalesTracker CRM application';
END $$;

-- Update migration record with completion time
UPDATE schema_migrations 
SET applied_at = NOW() 
WHERE version = '001';