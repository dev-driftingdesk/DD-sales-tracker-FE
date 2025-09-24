-- =====================================================
-- SalesTracker CRM Database Schema - Analytics & Performance
-- =====================================================
-- Advanced analytics, performance metrics, and reporting
-- Supports real-time dashboards and complex business intelligence
-- =====================================================

-- =====================================================
-- PERFORMANCE METRICS AND TARGETS
-- =====================================================

-- User performance targets
CREATE TABLE user_targets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Target period
    target_period VARCHAR(20) NOT NULL, -- monthly, quarterly, yearly
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Revenue targets
    revenue_target DECIMAL(15,2) DEFAULT 0,
    new_business_target DECIMAL(15,2) DEFAULT 0,
    existing_business_target DECIMAL(15,2) DEFAULT 0,
    
    -- Activity targets
    calls_target INTEGER DEFAULT 0,
    meetings_target INTEGER DEFAULT 0,
    emails_target INTEGER DEFAULT 0,
    proposals_target INTEGER DEFAULT 0,
    
    -- Lead and deal targets
    leads_target INTEGER DEFAULT 0,
    deals_target INTEGER DEFAULT 0,
    conversion_rate_target DECIMAL(5,2) DEFAULT 0,
    
    -- Pipeline targets
    pipeline_value_target DECIMAL(15,2) DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    UNIQUE(user_id, target_period, period_start)
);

CREATE INDEX idx_user_targets_user_period ON user_targets(user_id, target_period, period_start DESC);
CREATE INDEX idx_user_targets_period ON user_targets(period_start, period_end) WHERE is_active = true;

-- Team performance targets
CREATE TABLE team_targets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    
    -- Target period
    target_period VARCHAR(20) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Team-level targets
    revenue_target DECIMAL(15,2) DEFAULT 0,
    leads_target INTEGER DEFAULT 0,
    deals_target INTEGER DEFAULT 0,
    conversion_rate_target DECIMAL(5,2) DEFAULT 0,
    
    -- Team performance metrics
    average_deal_size_target DECIMAL(12,2) DEFAULT 0,
    sales_cycle_target INTEGER DEFAULT 0, -- days
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    UNIQUE(team_id, target_period, period_start)
);

CREATE INDEX idx_team_targets_team_period ON team_targets(team_id, target_period, period_start DESC);

-- =====================================================
-- PERFORMANCE SNAPSHOTS AND MATERIALIZED METRICS
-- =====================================================

-- Daily performance snapshots for faster analytics
CREATE TABLE daily_performance_snapshots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Snapshot metadata
    snapshot_date DATE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    
    -- Revenue metrics
    total_revenue DECIMAL(15,2) DEFAULT 0,
    new_business_revenue DECIMAL(15,2) DEFAULT 0,
    existing_business_revenue DECIMAL(15,2) DEFAULT 0,
    
    -- Deal metrics
    deals_created INTEGER DEFAULT 0,
    deals_won INTEGER DEFAULT 0,
    deals_lost INTEGER DEFAULT 0,
    deals_value_won DECIMAL(15,2) DEFAULT 0,
    deals_value_lost DECIMAL(15,2) DEFAULT 0,
    
    -- Lead metrics
    leads_created INTEGER DEFAULT 0,
    leads_contacted INTEGER DEFAULT 0,
    leads_converted INTEGER DEFAULT 0,
    leads_lost INTEGER DEFAULT 0,
    
    -- Activity metrics
    calls_made INTEGER DEFAULT 0,
    emails_sent INTEGER DEFAULT 0,
    meetings_held INTEGER DEFAULT 0,
    proposals_sent INTEGER DEFAULT 0,
    
    -- Pipeline metrics
    pipeline_value DECIMAL(15,2) DEFAULT 0,
    weighted_pipeline_value DECIMAL(15,2) DEFAULT 0,
    
    -- Response time metrics (in minutes)
    avg_response_time INTEGER,
    avg_time_to_first_contact INTEGER,
    
    -- Conversion metrics
    lead_conversion_rate DECIMAL(5,2),
    deal_win_rate DECIMAL(5,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance snapshots
CREATE UNIQUE INDEX idx_daily_snapshots_unique ON daily_performance_snapshots(snapshot_date, user_id);
CREATE INDEX idx_daily_snapshots_date ON daily_performance_snapshots(snapshot_date DESC);
CREATE INDEX idx_daily_snapshots_user_date ON daily_performance_snapshots(user_id, snapshot_date DESC);
CREATE INDEX idx_daily_snapshots_team_date ON daily_performance_snapshots(team_id, snapshot_date DESC);

-- Monthly performance rollups
CREATE TABLE monthly_performance_rollups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Rollup metadata
    month_year DATE NOT NULL, -- First day of month
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    
    -- Revenue achievements
    total_revenue DECIMAL(15,2) DEFAULT 0,
    revenue_target DECIMAL(15,2) DEFAULT 0,
    revenue_achievement_pct DECIMAL(5,2),
    
    -- Activity achievements
    total_calls INTEGER DEFAULT 0,
    calls_target INTEGER DEFAULT 0,
    total_meetings INTEGER DEFAULT 0,
    meetings_target INTEGER DEFAULT 0,
    total_emails INTEGER DEFAULT 0,
    
    -- Lead achievements
    total_leads INTEGER DEFAULT 0,
    leads_converted INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2),
    conversion_target DECIMAL(5,2),
    
    -- Deal achievements
    total_deals INTEGER DEFAULT 0,
    deals_won INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2),
    average_deal_size DECIMAL(12,2),
    
    -- Performance rankings
    revenue_rank INTEGER,
    activity_rank INTEGER,
    conversion_rank INTEGER,
    
    -- Trends vs previous month
    revenue_growth_pct DECIMAL(5,2),
    activity_growth_pct DECIMAL(5,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_monthly_rollups_unique ON monthly_performance_rollups(month_year, user_id);
CREATE INDEX idx_monthly_rollups_month ON monthly_performance_rollups(month_year DESC);
CREATE INDEX idx_monthly_rollups_user_month ON monthly_performance_rollups(user_id, month_year DESC);

-- =====================================================
-- SALES ANALYTICS AND REPORTING
-- =====================================================

-- Revenue analytics table for complex reporting
CREATE TABLE revenue_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Time dimensions
    date_recorded DATE NOT NULL,
    week_start_date DATE NOT NULL,
    month_year DATE NOT NULL,
    quarter_year VARCHAR(10) NOT NULL, -- 2025-Q1
    year_recorded INTEGER NOT NULL,
    
    -- Geographic dimensions
    region VARCHAR(100),
    country VARCHAR(100),
    territory VARCHAR(100),
    
    -- Organizational dimensions
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    
    -- Product dimensions
    product_category VARCHAR(100),
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    
    -- Customer dimensions
    company_size VARCHAR(50),
    industry VARCHAR(100),
    customer_type VARCHAR(50), -- new, existing, upsell
    
    -- Revenue metrics
    revenue_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    cost_amount DECIMAL(15,2) DEFAULT 0,
    margin_amount DECIMAL(15,2) DEFAULT 0,
    
    -- Source information
    source_type VARCHAR(50), -- lead, deal, product_sale
    source_id UUID,
    
    -- Deal information
    deal_stage VARCHAR(50),
    sales_cycle_days INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for revenue analytics
CREATE INDEX idx_revenue_analytics_date ON revenue_analytics(date_recorded DESC);
CREATE INDEX idx_revenue_analytics_user_date ON revenue_analytics(user_id, date_recorded DESC);
CREATE INDEX idx_revenue_analytics_team_date ON revenue_analytics(team_id, date_recorded DESC);
CREATE INDEX idx_revenue_analytics_month_year ON revenue_analytics(month_year DESC);
CREATE INDEX idx_revenue_analytics_quarter ON revenue_analytics(quarter_year DESC);
CREATE INDEX idx_revenue_analytics_product ON revenue_analytics(product_category, date_recorded DESC);
CREATE INDEX idx_revenue_analytics_region ON revenue_analytics(region, date_recorded DESC);

-- Composite indexes for complex analytics queries
CREATE INDEX idx_revenue_analytics_user_month_product ON revenue_analytics(user_id, month_year, product_category);
CREATE INDEX idx_revenue_analytics_team_quarter ON revenue_analytics(team_id, quarter_year, revenue_amount DESC);

-- =====================================================
-- CONVERSION FUNNEL ANALYTICS
-- =====================================================

-- Conversion funnel stages tracking
CREATE TABLE conversion_funnel_stages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Stage definition
    stage_name VARCHAR(100) NOT NULL,
    stage_order INTEGER NOT NULL,
    description TEXT,
    
    -- Stage criteria (JSON rules for stage qualification)
    entry_criteria JSONB DEFAULT '{}',
    exit_criteria JSONB DEFAULT '{}',
    
    -- Stage metrics
    average_time_in_stage_days DECIMAL(8,2),
    conversion_rate_to_next DECIMAL(5,2),
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_funnel_stages_order ON conversion_funnel_stages(stage_order) WHERE is_active = true;

-- Conversion events tracking
CREATE TABLE conversion_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Entity information
    entity_type VARCHAR(50) NOT NULL, -- lead, deal, contact
    entity_id UUID NOT NULL,
    
    -- Conversion stage information
    from_stage VARCHAR(100),
    to_stage VARCHAR(100) NOT NULL,
    
    -- Timing
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    time_in_previous_stage_hours INTEGER,
    
    -- Context
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    trigger_activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
    conversion_reason VARCHAR(255),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for conversion events
CREATE INDEX idx_conversion_events_entity ON conversion_events(entity_type, entity_id);
CREATE INDEX idx_conversion_events_stage ON conversion_events(to_stage, event_timestamp DESC);
CREATE INDEX idx_conversion_events_user ON conversion_events(user_id, event_timestamp DESC);
CREATE INDEX idx_conversion_events_timestamp ON conversion_events(event_timestamp DESC);

-- =====================================================
-- ACTIVITY ANALYTICS
-- =====================================================

-- Activity analytics aggregated by day
CREATE TABLE daily_activity_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Date and user
    activity_date DATE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Activity counts by type
    email_count INTEGER DEFAULT 0,
    call_count INTEGER DEFAULT 0,
    meeting_count INTEGER DEFAULT 0,
    note_count INTEGER DEFAULT 0,
    task_count INTEGER DEFAULT 0,
    
    -- Activity quality metrics
    total_activity_time_minutes INTEGER DEFAULT 0,
    response_activities_count INTEGER DEFAULT 0,
    proactive_activities_count INTEGER DEFAULT 0,
    
    -- Outcome metrics
    positive_outcomes INTEGER DEFAULT 0,
    negative_outcomes INTEGER DEFAULT 0,
    neutral_outcomes INTEGER DEFAULT 0,
    
    -- Lead/deal activity distribution
    lead_activities_count INTEGER DEFAULT 0,
    deal_activities_count INTEGER DEFAULT 0,
    contact_activities_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(activity_date, user_id)
);

CREATE INDEX idx_daily_activity_analytics_date ON daily_activity_analytics(activity_date DESC);
CREATE INDEX idx_daily_activity_analytics_user_date ON daily_activity_analytics(user_id, activity_date DESC);

-- =====================================================
-- SALES FORECASTING
-- =====================================================

-- Sales forecasts
CREATE TABLE sales_forecasts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Forecast metadata
    forecast_name VARCHAR(255) NOT NULL,
    forecast_type VARCHAR(50) NOT NULL, -- pipeline, historical, ai_predicted
    forecast_period VARCHAR(20) NOT NULL, -- monthly, quarterly, yearly
    
    -- Forecast target period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Scope
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    
    -- Forecast amounts
    conservative_forecast DECIMAL(15,2) NOT NULL,
    realistic_forecast DECIMAL(15,2) NOT NULL,
    optimistic_forecast DECIMAL(15,2) NOT NULL,
    
    -- Confidence and methodology
    confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
    methodology_used VARCHAR(100),
    
    -- Supporting data
    pipeline_value DECIMAL(15,2),
    weighted_pipeline_value DECIMAL(15,2),
    historical_close_rate DECIMAL(5,2),
    deals_in_pipeline INTEGER,
    
    -- Assumptions and notes
    assumptions TEXT,
    risk_factors TEXT,
    
    -- Status
    is_published BOOLEAN DEFAULT false,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_sales_forecasts_period ON sales_forecasts(period_start, period_end);
CREATE INDEX idx_sales_forecasts_user_period ON sales_forecasts(user_id, period_start DESC);
CREATE INDEX idx_sales_forecasts_team_period ON sales_forecasts(team_id, period_start DESC);

-- Forecast accuracy tracking
CREATE TABLE forecast_accuracy (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    forecast_id UUID NOT NULL REFERENCES sales_forecasts(id) ON DELETE CASCADE,
    
    -- Actual results
    actual_revenue DECIMAL(15,2) NOT NULL,
    
    -- Accuracy calculations
    conservative_accuracy_pct DECIMAL(5,2),
    realistic_accuracy_pct DECIMAL(5,2),
    optimistic_accuracy_pct DECIMAL(5,2),
    
    -- Best forecast selection
    best_forecast_type VARCHAR(20), -- conservative, realistic, optimistic
    best_forecast_accuracy_pct DECIMAL(5,2),
    
    -- Analysis
    variance_analysis TEXT,
    lessons_learned TEXT,
    
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_forecast_accuracy_forecast ON forecast_accuracy(forecast_id);

-- =====================================================
-- LEADERBOARDS AND RANKINGS
-- =====================================================

-- Leaderboards for gamification and motivation
CREATE TABLE leaderboards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Leaderboard metadata
    leaderboard_name VARCHAR(255) NOT NULL,
    metric_type VARCHAR(100) NOT NULL, -- revenue, deals_won, activities, conversion_rate
    period_type VARCHAR(20) NOT NULL, -- daily, weekly, monthly, quarterly
    
    -- Time period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Scope
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    include_all_teams BOOLEAN DEFAULT false,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leaderboard entries
CREATE TABLE leaderboard_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    leaderboard_id UUID NOT NULL REFERENCES leaderboards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Ranking
    rank_position INTEGER NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    
    -- Achievement context
    target_value DECIMAL(15,2),
    achievement_percentage DECIMAL(5,2),
    
    -- Metadata
    additional_metrics JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(leaderboard_id, user_id)
);

CREATE INDEX idx_leaderboard_entries_board_rank ON leaderboard_entries(leaderboard_id, rank_position);
CREATE INDEX idx_leaderboard_entries_user ON leaderboard_entries(user_id, created_at DESC);

-- =====================================================
-- FUNCTIONS FOR ANALYTICS
-- =====================================================

-- Function to calculate daily performance snapshots
CREATE OR REPLACE FUNCTION calculate_daily_performance_snapshot(
    target_date DATE,
    target_user_id UUID
) RETURNS void AS $$
DECLARE
    snapshot_record daily_performance_snapshots%ROWTYPE;
BEGIN
    -- Calculate metrics for the specified date and user
    SELECT 
        target_date,
        target_user_id,
        u.team_id,
        -- Revenue metrics (from deals closed on this date)
        COALESCE(SUM(d.value) FILTER (WHERE d.actual_close_date = target_date AND d.stage = 'closed-won'), 0),
        0, -- new business revenue (needs business logic)
        0, -- existing business revenue (needs business logic)
        -- Deal metrics
        COUNT(d.id) FILTER (WHERE d.created_at::date = target_date),
        COUNT(d.id) FILTER (WHERE d.actual_close_date = target_date AND d.stage = 'closed-won'),
        COUNT(d.id) FILTER (WHERE d.actual_close_date = target_date AND d.stage = 'closed-lost'),
        COALESCE(SUM(d.value) FILTER (WHERE d.actual_close_date = target_date AND d.stage = 'closed-won'), 0),
        COALESCE(SUM(d.value) FILTER (WHERE d.actual_close_date = target_date AND d.stage = 'closed-lost'), 0),
        -- Lead metrics
        COUNT(l.id) FILTER (WHERE l.created_at::date = target_date),
        COUNT(l.id) FILTER (WHERE l.first_contacted_at::date = target_date),
        COUNT(l.id) FILTER (WHERE l.status = 'won' AND l.closed_date::date = target_date),
        COUNT(l.id) FILTER (WHERE l.status = 'lost' AND l.lost_date::date = target_date),
        -- Activity metrics
        COUNT(a.id) FILTER (WHERE a.type = 'call' AND a.created_at::date = target_date),
        COUNT(a.id) FILTER (WHERE a.type = 'email' AND a.created_at::date = target_date),
        COUNT(a.id) FILTER (WHERE a.type = 'meeting' AND a.created_at::date = target_date),
        COUNT(a.id) FILTER (WHERE a.type IN ('proposal', 'quote') AND a.created_at::date = target_date),
        -- Pipeline metrics (current as of end of day)
        COALESCE(SUM(d_pipeline.value) FILTER (WHERE d_pipeline.stage NOT IN ('closed-won', 'closed-lost')), 0),
        COALESCE(SUM(d_pipeline.value * d_pipeline.probability / 100.0) FILTER (WHERE d_pipeline.stage NOT IN ('closed-won', 'closed-lost')), 0),
        -- Response time metrics (needs calculation)
        NULL, NULL,
        -- Conversion metrics (needs calculation)
        NULL, NULL,
        NOW()
    INTO snapshot_record
    FROM users u
    LEFT JOIN deals d ON d.assigned_to = u.id
    LEFT JOIN leads l ON l.assigned_to = u.id
    LEFT JOIN activities a ON a.user_id = u.id
    LEFT JOIN deals d_pipeline ON d_pipeline.assigned_to = u.id AND d_pipeline.deleted_at IS NULL
    WHERE u.id = target_user_id
    GROUP BY u.id, u.team_id;
    
    -- Insert or update the snapshot
    INSERT INTO daily_performance_snapshots SELECT snapshot_record.*
    ON CONFLICT (snapshot_date, user_id) 
    DO UPDATE SET
        total_revenue = EXCLUDED.total_revenue,
        deals_created = EXCLUDED.deals_created,
        deals_won = EXCLUDED.deals_won,
        deals_lost = EXCLUDED.deals_lost,
        deals_value_won = EXCLUDED.deals_value_won,
        deals_value_lost = EXCLUDED.deals_value_lost,
        leads_created = EXCLUDED.leads_created,
        leads_contacted = EXCLUDED.leads_contacted,
        leads_converted = EXCLUDED.leads_converted,
        leads_lost = EXCLUDED.leads_lost,
        calls_made = EXCLUDED.calls_made,
        emails_sent = EXCLUDED.emails_sent,
        meetings_held = EXCLUDED.meetings_held,
        proposals_sent = EXCLUDED.proposals_sent,
        pipeline_value = EXCLUDED.pipeline_value,
        weighted_pipeline_value = EXCLUDED.weighted_pipeline_value;
END;
$$ LANGUAGE plpgsql;

-- Function to update conversion funnel analytics
CREATE OR REPLACE FUNCTION track_conversion_event(
    p_entity_type VARCHAR(50),
    p_entity_id UUID,
    p_from_stage VARCHAR(100),
    p_to_stage VARCHAR(100),
    p_user_id UUID DEFAULT NULL,
    p_trigger_activity_id UUID DEFAULT NULL
) RETURNS void AS $$
BEGIN
    INSERT INTO conversion_events (
        entity_type, entity_id, from_stage, to_stage,
        user_id, trigger_activity_id, conversion_reason
    ) VALUES (
        p_entity_type, p_entity_id, p_from_stage, p_to_stage,
        p_user_id, p_trigger_activity_id, 'automated_tracking'
    );
END;
$$ LANGUAGE plpgsql;

-- Apply standard triggers
CREATE TRIGGER user_targets_updated_at BEFORE UPDATE ON user_targets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER monthly_performance_rollups_updated_at BEFORE UPDATE ON monthly_performance_rollups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER sales_forecasts_updated_at BEFORE UPDATE ON sales_forecasts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MATERIALIZED VIEWS FOR PERFORMANCE
-- =====================================================

-- Materialized view for real-time dashboard metrics
CREATE MATERIALIZED VIEW dashboard_metrics AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.role,
    t.name as team_name,
    
    -- Current month metrics
    COALESCE(rm_current.total_revenue, 0) as current_month_revenue,
    COALESCE(rm_current.revenue_target, 0) as current_month_target,
    COALESCE(rm_current.revenue_achievement_pct, 0) as achievement_percentage,
    
    -- Activity counts (last 30 days)
    COALESCE(act.total_calls, 0) as calls_last_30_days,
    COALESCE(act.total_emails, 0) as emails_last_30_days,
    COALESCE(act.total_meetings, 0) as meetings_last_30_days,
    
    -- Pipeline metrics
    COALESCE(pipeline.pipeline_value, 0) as current_pipeline_value,
    COALESCE(pipeline.deal_count, 0) as deals_in_pipeline,
    
    -- Performance ranking
    RANK() OVER (ORDER BY COALESCE(rm_current.total_revenue, 0) DESC) as revenue_rank,
    RANK() OVER (ORDER BY COALESCE(act.total_calls + act.total_emails + act.total_meetings, 0) DESC) as activity_rank
    
FROM users u
LEFT JOIN team_members tm ON u.id = tm.user_id AND tm.left_at IS NULL
LEFT JOIN teams t ON tm.team_id = t.id
LEFT JOIN monthly_performance_rollups rm_current ON u.id = rm_current.user_id 
    AND rm_current.month_year = date_trunc('month', CURRENT_DATE)
LEFT JOIN (
    SELECT 
        user_id,
        SUM(call_count) as total_calls,
        SUM(email_count) as total_emails,
        SUM(meeting_count) as total_meetings
    FROM daily_activity_analytics 
    WHERE activity_date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY user_id
) act ON u.id = act.user_id
LEFT JOIN (
    SELECT 
        assigned_to as user_id,
        SUM(value) as pipeline_value,
        COUNT(*) as deal_count
    FROM deals 
    WHERE stage NOT IN ('closed-won', 'closed-lost') 
    AND deleted_at IS NULL
    GROUP BY assigned_to
) pipeline ON u.id = pipeline.user_id
WHERE u.deleted_at IS NULL AND u.is_active = true;

-- Create index on materialized view
CREATE UNIQUE INDEX idx_dashboard_metrics_user ON dashboard_metrics(user_id);
CREATE INDEX idx_dashboard_metrics_revenue_rank ON dashboard_metrics(revenue_rank);
CREATE INDEX idx_dashboard_metrics_activity_rank ON dashboard_metrics(activity_rank);

COMMENT ON TABLE user_targets IS 'Individual user performance targets by period';
COMMENT ON TABLE daily_performance_snapshots IS 'Daily performance metrics snapshots for fast analytics';
COMMENT ON TABLE revenue_analytics IS 'Detailed revenue analytics with multiple dimensions';
COMMENT ON TABLE conversion_events IS 'Conversion funnel tracking and analytics';
COMMENT ON TABLE sales_forecasts IS 'Sales forecasting with multiple scenarios';
COMMENT ON MATERIALIZED VIEW dashboard_metrics IS 'Real-time dashboard metrics for performance monitoring';