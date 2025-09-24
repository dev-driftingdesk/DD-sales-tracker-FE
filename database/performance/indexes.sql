-- =====================================================
-- SalesTracker CRM Database - Performance Indexes
-- =====================================================
-- Advanced indexing strategy for optimal query performance
-- Create these indexes after initial data load
-- =====================================================

-- =====================================================
-- COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- =====================================================

-- Lead management queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_assigned_status_created
    ON leads(assigned_to, status, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_source_status_value
    ON leads(source, status, deal_value DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_score_status
    ON leads(lead_score DESC, status)
    WHERE deleted_at IS NULL AND status IN ('new', 'contacted', 'in_progress');

-- Deal pipeline queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deals_stage_assigned_value
    ON deals(stage, assigned_to, value DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deals_close_date_stage
    ON deals(expected_close_date, stage)
    WHERE stage NOT IN ('closed-won', 'closed-lost') AND deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deals_probability_value
    ON deals(probability DESC, value DESC)
    WHERE stage NOT IN ('closed-won', 'closed-lost') AND deleted_at IS NULL;

-- Activity tracking queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_user_type_created
    ON activities(user_id, type, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_lead_type_created
    ON activities(lead_id, type, created_at DESC)
    WHERE lead_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_deal_type_created
    ON activities(deal_id, type, created_at DESC)
    WHERE deal_id IS NOT NULL AND deleted_at IS NULL;

-- Email performance queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_emails_user_status_sent
    ON emails(user_id, status, sent_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_emails_lead_direction_sent
    ON emails(lead_id, direction, sent_at DESC)
    WHERE lead_id IS NOT NULL AND deleted_at IS NULL;

-- Contact and company queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_company_status
    ON contacts(company_id, status)
    WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_last_interaction
    ON contacts(last_interaction_at DESC NULLS LAST, status)
    WHERE deleted_at IS NULL;

-- Performance analytics queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_snapshots_user_date_revenue
    ON daily_performance_snapshots(user_id, snapshot_date DESC, total_revenue DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_snapshots_team_date_revenue
    ON daily_performance_snapshots(team_id, snapshot_date DESC, total_revenue DESC);

-- =====================================================
-- PARTIAL INDEXES FOR SPECIFIC CONDITIONS
-- =====================================================

-- Active/unassigned leads
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_unassigned_new
    ON leads(created_at DESC, lead_score DESC)
    WHERE assigned_to IS NULL AND status = 'new' AND deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_high_value_active
    ON leads(deal_value DESC, created_at DESC)
    WHERE deal_value > 10000 AND status IN ('new', 'contacted', 'in_progress') AND deleted_at IS NULL;

-- Hot prospects and pipeline
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deals_hot_prospects
    ON deals(value DESC, expected_close_date)
    WHERE probability >= 75 AND stage IN ('proposal', 'negotiation') AND deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deals_closing_this_month
    ON deals(probability DESC, value DESC)
    WHERE expected_close_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '30 days')
    AND stage NOT IN ('closed-won', 'closed-lost') AND deleted_at IS NULL;

-- Overdue and follow-up activities
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_overdue
    ON activities(scheduled_for, user_id, priority)
    WHERE scheduled_for < NOW() AND status != 'completed' AND deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_today_pending
    ON activities(scheduled_for, user_id, type)
    WHERE scheduled_for::date = CURRENT_DATE AND status != 'completed' AND deleted_at IS NULL;

-- Recent and unread notifications
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_unread_priority
    ON notifications(user_id, priority DESC, created_at DESC)
    WHERE is_read = false;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_recent_by_category
    ON notifications(user_id, category, created_at DESC)
    WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';

-- =====================================================
-- EXPRESSION INDEXES FOR CALCULATED FIELDS
-- =====================================================

-- Full name search for contacts
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_full_name
    ON contacts USING GIN ((first_name || ' ' || last_name) gin_trgm_ops)
    WHERE deleted_at IS NULL;

-- Deal age calculation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deals_age_days
    ON deals((EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400))
    WHERE stage NOT IN ('closed-won', 'closed-lost') AND deleted_at IS NULL;

-- Lead response time calculation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_days_since_created
    ON leads((EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400))
    WHERE status IN ('new', 'contacted') AND deleted_at IS NULL;

-- Revenue per day for deals
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deals_revenue_velocity
    ON deals((value / GREATEST(EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400, 1)))
    WHERE stage NOT IN ('closed-won', 'closed-lost') AND deleted_at IS NULL;

-- =====================================================
-- INDEXES FOR ANALYTICS AND REPORTING
-- =====================================================

-- Time-based analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_created_month_year
    ON leads(EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at), assigned_to)
    WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deals_closed_month_year
    ON deals(EXTRACT(YEAR FROM actual_close_date), EXTRACT(MONTH FROM actual_close_date), stage, assigned_to)
    WHERE actual_close_date IS NOT NULL AND deleted_at IS NULL;

-- Revenue analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_revenue_analytics_dimensions
    ON revenue_analytics(date_recorded DESC, user_id, product_category, region);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_revenue_analytics_monthly
    ON revenue_analytics(month_year DESC, user_id, revenue_amount DESC);

-- Conversion funnel analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversion_events_entity_timestamp
    ON conversion_events(entity_type, entity_id, event_timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversion_events_stage_user
    ON conversion_events(to_stage, user_id, event_timestamp DESC);

-- =====================================================
-- INDEXES FOR EXTERNAL INTEGRATIONS
-- =====================================================

-- Sync job monitoring
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sync_jobs_connection_status_scheduled
    ON sync_jobs(connection_id, status, scheduled_for)
    WHERE status IN ('queued', 'running');

-- External ID lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_external_ids
    ON leads USING GIN (external_ids)
    WHERE external_ids IS NOT NULL AND external_ids != '{}';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deals_external_ids
    ON deals USING GIN (external_ids)
    WHERE external_ids IS NOT NULL AND external_ids != '{}';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_external_ids
    ON contacts USING GIN (external_ids)
    WHERE external_ids IS NOT NULL AND external_ids != '{}';

-- Webhook delivery monitoring
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_webhook_deliveries_retry
    ON webhook_deliveries(next_retry_at, status)
    WHERE status = 'retrying' AND next_retry_at IS NOT NULL;

-- =====================================================
-- UNIQUE CONSTRAINTS FOR DATA INTEGRITY
-- =====================================================

-- Prevent duplicate external IDs within same system
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_unique_lead_external_id
    ON leads((external_ids->>'salesforce_id'))
    WHERE (external_ids->>'salesforce_id') IS NOT NULL AND deleted_at IS NULL;

-- Ensure unique email per active contact
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_unique_contact_email
    ON contacts(email)
    WHERE deleted_at IS NULL;

-- Unique company domain
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_unique_company_domain
    ON companies(domain)
    WHERE domain IS NOT NULL AND deleted_at IS NULL;

-- =====================================================
-- COVERING INDEXES FOR READ-HEAVY QUERIES
-- =====================================================

-- Lead list with essential fields (PostgreSQL 11+ covering index simulation)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_list_covering
    ON leads(assigned_to, status, created_at DESC)
    INCLUDE (company_name, contact_name, email, deal_value, lead_score)
    WHERE deleted_at IS NULL;

-- Deal pipeline with key metrics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deals_pipeline_covering
    ON deals(stage, assigned_to, expected_close_date)
    INCLUDE (title, value, probability, company_name)
    WHERE stage NOT IN ('closed-won', 'closed-lost') AND deleted_at IS NULL;

-- =====================================================
-- MAINTENANCE AND MONITORING
-- =====================================================

-- Index usage statistics view
CREATE OR REPLACE VIEW index_usage_stats AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    CASE 
        WHEN idx_scan = 0 THEN 'UNUSED'
        WHEN idx_scan < 100 THEN 'LOW_USAGE'
        WHEN idx_scan < 1000 THEN 'MEDIUM_USAGE'
        ELSE 'HIGH_USAGE'
    END as usage_level
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Index size monitoring view
CREATE OR REPLACE VIEW index_size_stats AS
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    pg_relation_size(indexrelid) as index_size_bytes
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- =====================================================
-- INDEX MAINTENANCE PROCEDURES
-- =====================================================

-- Procedure to rebuild indexes with low usage
CREATE OR REPLACE FUNCTION rebuild_unused_indexes()
RETURNS void AS $$
DECLARE
    index_record RECORD;
BEGIN
    FOR index_record IN 
        SELECT indexname, tablename 
        FROM index_usage_stats 
        WHERE usage_level = 'UNUSED'
        AND indexname NOT LIKE 'idx_%_pkey'
    LOOP
        RAISE NOTICE 'Rebuilding index: %', index_record.indexname;
        EXECUTE 'REINDEX INDEX CONCURRENTLY ' || index_record.indexname;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Procedure to analyze index effectiveness
CREATE OR REPLACE FUNCTION analyze_query_performance()
RETURNS TABLE(
    query_text text,
    calls bigint,
    total_time double precision,
    avg_time double precision,
    rows_examined bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pg_stat_statements.query,
        pg_stat_statements.calls,
        pg_stat_statements.total_exec_time,
        pg_stat_statements.mean_exec_time,
        pg_stat_statements.rows
    FROM pg_stat_statements
    WHERE pg_stat_statements.query LIKE '%SELECT%'
    AND pg_stat_statements.mean_exec_time > 100
    ORDER BY pg_stat_statements.mean_exec_time DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Performance indexes created successfully';
    RAISE NOTICE 'Total indexes: %', (
        SELECT COUNT(*) 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname LIKE 'idx_%'
    );
    RAISE NOTICE 'Run ANALYZE on all tables to update statistics';
    RAISE NOTICE 'Monitor index usage with: SELECT * FROM index_usage_stats;';
END $$;