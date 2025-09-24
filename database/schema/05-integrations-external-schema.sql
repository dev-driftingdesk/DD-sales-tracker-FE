-- =====================================================
-- SalesTracker CRM Database Schema - Integrations & External Systems
-- =====================================================
-- External system integrations, webhooks, and third-party APIs
-- Supports CRM integrations, calendar sync, and external data sources
-- =====================================================

-- =====================================================
-- EXTERNAL SYSTEM INTEGRATIONS
-- =====================================================

-- External systems configuration
CREATE TABLE external_systems (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- System identification
    system_name VARCHAR(255) NOT NULL,
    system_type VARCHAR(100) NOT NULL, -- crm, calendar, email, marketing, finance, communication
    provider VARCHAR(100) NOT NULL, -- salesforce, hubspot, gmail, outlook, slack, zapier
    
    -- System configuration
    base_url TEXT,
    api_version VARCHAR(50),
    configuration JSONB DEFAULT '{}',
    
    -- Authentication settings
    auth_type VARCHAR(50) NOT NULL, -- oauth2, api_key, basic, bearer
    auth_config JSONB DEFAULT '{}',
    
    -- Features and capabilities
    supported_operations TEXT[], -- read, write, sync, webhook
    supported_entities TEXT[], -- leads, deals, contacts, companies, activities
    
    -- Rate limiting and quotas
    rate_limit_requests INTEGER,
    rate_limit_period VARCHAR(20), -- minute, hour, day
    daily_quota INTEGER,
    
    -- Status and health
    status integration_status DEFAULT 'configuring',
    last_health_check TIMESTAMP WITH TIME ZONE,
    health_check_interval INTEGER DEFAULT 300, -- seconds
    
    -- Sync settings
    auto_sync_enabled BOOLEAN DEFAULT false,
    sync_interval INTEGER DEFAULT 3600, -- seconds
    full_sync_enabled BOOLEAN DEFAULT false,
    
    -- Error handling
    max_retry_attempts INTEGER DEFAULT 3,
    retry_backoff_seconds INTEGER DEFAULT 60,
    
    -- Documentation and metadata
    description TEXT,
    documentation_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Indexes for external systems
CREATE INDEX idx_external_systems_type ON external_systems(system_type);
CREATE INDEX idx_external_systems_provider ON external_systems(provider);
CREATE INDEX idx_external_systems_status ON external_systems(status);
CREATE INDEX idx_external_systems_health_check ON external_systems(last_health_check DESC);

-- User-specific integration connections
CREATE TABLE integration_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    system_id UUID NOT NULL REFERENCES external_systems(id) ON DELETE CASCADE,
    
    -- Connection identification
    connection_name VARCHAR(255),
    external_user_id VARCHAR(255),
    external_username VARCHAR(255),
    
    -- Authentication credentials (encrypted)
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Connection-specific configuration
    connection_config JSONB DEFAULT '{}',
    permissions TEXT[], -- read, write, admin
    
    -- Sync settings for this connection
    auto_sync_enabled BOOLEAN DEFAULT true,
    sync_entities TEXT[], -- which entities to sync
    sync_direction VARCHAR(20) DEFAULT 'bidirectional', -- incoming, outgoing, bidirectional
    
    -- Status tracking
    status integration_status DEFAULT 'active',
    last_sync_at TIMESTAMP WITH TIME ZONE,
    last_successful_sync_at TIMESTAMP WITH TIME ZONE,
    last_error TEXT,
    consecutive_errors INTEGER DEFAULT 0,
    
    -- Sync cursors for incremental sync
    sync_cursors JSONB DEFAULT '{}',
    
    -- Statistics
    total_syncs INTEGER DEFAULT 0,
    successful_syncs INTEGER DEFAULT 0,
    failed_syncs INTEGER DEFAULT 0,
    records_imported INTEGER DEFAULT 0,
    records_exported INTEGER DEFAULT 0,
    
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, system_id)
);

-- Indexes for integration connections
CREATE INDEX idx_integration_connections_user ON integration_connections(user_id);
CREATE INDEX idx_integration_connections_system ON integration_connections(system_id);
CREATE INDEX idx_integration_connections_status ON integration_connections(status);
CREATE INDEX idx_integration_connections_last_sync ON integration_connections(last_sync_at DESC);

-- =====================================================
-- SYNCHRONIZATION AND DATA MAPPING
-- =====================================================

-- Data synchronization jobs
CREATE TABLE sync_jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    connection_id UUID NOT NULL REFERENCES integration_connections(id) ON DELETE CASCADE,
    
    -- Job details
    job_type VARCHAR(50) NOT NULL, -- full_sync, incremental_sync, entity_sync, webhook_sync
    entity_type VARCHAR(100), -- leads, deals, contacts, companies, activities
    sync_direction VARCHAR(20) NOT NULL, -- import, export, bidirectional
    
    -- Job parameters
    filters JSONB DEFAULT '{}',
    mapping_config JSONB DEFAULT '{}',
    batch_size INTEGER DEFAULT 100,
    
    -- Status and progress
    status VARCHAR(50) DEFAULT 'queued', -- queued, running, completed, failed, cancelled
    progress_percentage INTEGER DEFAULT 0,
    
    -- Timing
    scheduled_for TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Results
    records_processed INTEGER DEFAULT 0,
    records_successful INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    records_skipped INTEGER DEFAULT 0,
    
    -- Error handling
    error_message TEXT,
    error_details JSONB,
    retry_count INTEGER DEFAULT 0,
    
    -- Job metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for sync jobs
CREATE INDEX idx_sync_jobs_connection ON sync_jobs(connection_id);
CREATE INDEX idx_sync_jobs_status ON sync_jobs(status);
CREATE INDEX idx_sync_jobs_scheduled ON sync_jobs(scheduled_for) WHERE status = 'queued';
CREATE INDEX idx_sync_jobs_created_at ON sync_jobs(created_at DESC);
CREATE INDEX idx_sync_jobs_entity_type ON sync_jobs(entity_type);

-- Synchronization records tracking
CREATE TABLE sync_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    sync_job_id UUID NOT NULL REFERENCES sync_jobs(id) ON DELETE CASCADE,
    
    -- Record identification
    internal_id UUID, -- ID in our system
    external_id VARCHAR(255), -- ID in external system
    entity_type VARCHAR(100) NOT NULL,
    
    -- Sync details
    operation VARCHAR(20) NOT NULL, -- create, update, delete, skip
    sync_direction VARCHAR(20) NOT NULL,
    
    -- Data mapping
    internal_data JSONB,
    external_data JSONB,
    mapping_applied JSONB,
    
    -- Result
    status VARCHAR(20) NOT NULL, -- success, failed, skipped
    error_message TEXT,
    
    -- Conflict resolution
    conflict_detected BOOLEAN DEFAULT false,
    conflict_resolution VARCHAR(50), -- internal_wins, external_wins, manual, merged
    
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for sync records
CREATE INDEX idx_sync_records_job ON sync_records(sync_job_id);
CREATE INDEX idx_sync_records_internal_id ON sync_records(internal_id);
CREATE INDEX idx_sync_records_external_id ON sync_records(external_id);
CREATE INDEX idx_sync_records_entity_type ON sync_records(entity_type);
CREATE INDEX idx_sync_records_status ON sync_records(status);

-- Data mapping configurations
CREATE TABLE data_mappings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    system_id UUID NOT NULL REFERENCES external_systems(id) ON DELETE CASCADE,
    
    -- Mapping definition
    entity_type VARCHAR(100) NOT NULL,
    mapping_name VARCHAR(255) NOT NULL,
    
    -- Field mappings (internal_field -> external_field)
    field_mappings JSONB NOT NULL DEFAULT '{}',
    
    -- Transformation rules
    transformations JSONB DEFAULT '{}',
    
    -- Validation rules
    validation_rules JSONB DEFAULT '{}',
    
    -- Conflict resolution settings
    conflict_resolution_strategy VARCHAR(50) DEFAULT 'manual', -- internal_wins, external_wins, newest_wins, manual
    
    -- Filters and conditions
    import_filters JSONB DEFAULT '{}',
    export_filters JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    UNIQUE(system_id, entity_type, mapping_name)
);

-- Indexes for data mappings
CREATE INDEX idx_data_mappings_system_entity ON data_mappings(system_id, entity_type);
CREATE INDEX idx_data_mappings_active ON data_mappings(is_active) WHERE is_active = true;

-- =====================================================
-- WEBHOOKS AND REAL-TIME EVENTS
-- =====================================================

-- Webhook endpoints configuration
CREATE TABLE webhook_endpoints (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    system_id UUID NOT NULL REFERENCES external_systems(id) ON DELETE CASCADE,
    
    -- Endpoint details
    endpoint_name VARCHAR(255) NOT NULL,
    endpoint_url TEXT NOT NULL,
    http_method VARCHAR(10) DEFAULT 'POST',
    
    -- Authentication for outgoing webhooks
    auth_header_name VARCHAR(100),
    auth_header_value_encrypted TEXT,
    
    -- Event configuration
    events TEXT[] NOT NULL, -- lead.created, deal.updated, etc.
    event_filters JSONB DEFAULT '{}',
    
    -- Payload configuration
    payload_template JSONB,
    include_full_data BOOLEAN DEFAULT true,
    custom_headers JSONB DEFAULT '{}',
    
    -- Retry and reliability
    retry_attempts INTEGER DEFAULT 3,
    retry_delay_seconds INTEGER DEFAULT 30,
    timeout_seconds INTEGER DEFAULT 30,
    
    -- Status and monitoring
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    
    -- Security
    secret_key VARCHAR(255),
    verify_ssl BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Indexes for webhook endpoints
CREATE INDEX idx_webhook_endpoints_system ON webhook_endpoints(system_id);
CREATE INDEX idx_webhook_endpoints_active ON webhook_endpoints(is_active) WHERE is_active = true;
CREATE INDEX idx_webhook_endpoints_events ON webhook_endpoints USING GIN (events);

-- Webhook delivery logs
CREATE TABLE webhook_deliveries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    webhook_endpoint_id UUID NOT NULL REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
    
    -- Event details
    event_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    
    -- Request details
    request_url TEXT NOT NULL,
    request_method VARCHAR(10) NOT NULL,
    request_headers JSONB,
    request_payload JSONB,
    
    -- Response details
    response_status INTEGER,
    response_headers JSONB,
    response_body TEXT,
    response_time_ms INTEGER,
    
    -- Delivery status
    status VARCHAR(20) NOT NULL, -- success, failed, pending, retrying
    attempt_number INTEGER DEFAULT 1,
    error_message TEXT,
    
    -- Timing
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    next_retry_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for webhook deliveries
CREATE INDEX idx_webhook_deliveries_endpoint ON webhook_deliveries(webhook_endpoint_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX idx_webhook_deliveries_triggered_at ON webhook_deliveries(triggered_at DESC);
CREATE INDEX idx_webhook_deliveries_next_retry ON webhook_deliveries(next_retry_at) WHERE status = 'retrying';

-- Incoming webhook processors (for receiving webhooks from external systems)
CREATE TABLE incoming_webhook_processors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    system_id UUID NOT NULL REFERENCES external_systems(id) ON DELETE CASCADE,
    
    -- Processor configuration
    processor_name VARCHAR(255) NOT NULL,
    endpoint_path VARCHAR(255) NOT NULL, -- /webhooks/salesforce/leads
    
    -- Security
    authentication_required BOOLEAN DEFAULT true,
    allowed_ips TEXT[],
    secret_verification BOOLEAN DEFAULT true,
    secret_header_name VARCHAR(100) DEFAULT 'X-Hub-Signature',
    
    -- Processing configuration
    event_mapping JSONB DEFAULT '{}', -- external event names to internal events
    data_transformation JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Statistics
    requests_received INTEGER DEFAULT 0,
    requests_processed INTEGER DEFAULT 0,
    requests_failed INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(endpoint_path)
);

-- Incoming webhook requests log
CREATE TABLE incoming_webhook_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    processor_id UUID REFERENCES incoming_webhook_processors(id) ON DELETE SET NULL,
    
    -- Request details
    request_method VARCHAR(10) NOT NULL,
    request_path TEXT NOT NULL,
    request_headers JSONB,
    request_body TEXT,
    query_parameters JSONB,
    
    -- Source information
    source_ip INET,
    user_agent TEXT,
    
    -- Processing details
    status VARCHAR(20) NOT NULL, -- processed, failed, ignored, unauthorized
    processing_time_ms INTEGER,
    error_message TEXT,
    
    -- Results
    entities_created INTEGER DEFAULT 0,
    entities_updated INTEGER DEFAULT 0,
    entities_deleted INTEGER DEFAULT 0,
    
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for incoming webhook requests
CREATE INDEX idx_incoming_webhook_requests_processor ON incoming_webhook_requests(processor_id);
CREATE INDEX idx_incoming_webhook_requests_status ON incoming_webhook_requests(status);
CREATE INDEX idx_incoming_webhook_requests_received_at ON incoming_webhook_requests(received_at DESC);

-- =====================================================
-- EXTERNAL DATA SOURCES
-- =====================================================

-- External data sources (for data enrichment)
CREATE TABLE external_data_sources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Source identification
    source_name VARCHAR(255) NOT NULL,
    source_type VARCHAR(100) NOT NULL, -- company_data, contact_data, market_data, social_data
    provider VARCHAR(100) NOT NULL, -- clearbit, zoominfo, linkedin, crunchbase
    
    -- API configuration
    base_url TEXT NOT NULL,
    api_key_encrypted TEXT,
    api_version VARCHAR(50),
    
    -- Usage and billing
    requests_per_month INTEGER,
    current_month_usage INTEGER DEFAULT 0,
    cost_per_request DECIMAL(10,6),
    
    -- Quality and reliability
    accuracy_rating DECIMAL(3,2), -- 0.00 to 1.00
    response_time_ms INTEGER,
    uptime_percentage DECIMAL(5,2),
    
    -- Configuration
    auto_enrichment_enabled BOOLEAN DEFAULT false,
    enrichment_triggers TEXT[], -- lead_created, contact_created, company_created
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data enrichment requests
CREATE TABLE data_enrichment_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    data_source_id UUID NOT NULL REFERENCES external_data_sources(id) ON DELETE CASCADE,
    
    -- Entity being enriched
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    
    -- Request details
    enrichment_type VARCHAR(100) NOT NULL, -- company_profile, contact_profile, social_profiles
    search_parameters JSONB NOT NULL,
    
    -- Response
    status VARCHAR(20) NOT NULL, -- pending, completed, failed, no_match
    response_data JSONB,
    confidence_score DECIMAL(3,2),
    
    -- Enrichment results applied
    fields_enriched TEXT[],
    data_applied JSONB,
    
    -- Cost and usage
    cost_incurred DECIMAL(10,6),
    response_time_ms INTEGER,
    
    -- Error handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- User who requested enrichment
    requested_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for data enrichment
CREATE INDEX idx_data_enrichment_entity ON data_enrichment_requests(entity_type, entity_id);
CREATE INDEX idx_data_enrichment_source ON data_enrichment_requests(data_source_id);
CREATE INDEX idx_data_enrichment_status ON data_enrichment_requests(status);
CREATE INDEX idx_data_enrichment_requested_at ON data_enrichment_requests(requested_at DESC);

-- =====================================================
-- INTEGRATION MONITORING AND HEALTH
-- =====================================================

-- Integration health monitoring
CREATE TABLE integration_health_checks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    system_id UUID NOT NULL REFERENCES external_systems(id) ON DELETE CASCADE,
    
    -- Health check details
    check_type VARCHAR(50) NOT NULL, -- connectivity, authentication, quota, functionality
    check_status VARCHAR(20) NOT NULL, -- healthy, degraded, unhealthy
    
    -- Metrics
    response_time_ms INTEGER,
    success_rate DECIMAL(5,2),
    error_rate DECIMAL(5,2),
    quota_used_percentage DECIMAL(5,2),
    
    -- Details
    check_details JSONB DEFAULT '{}',
    error_message TEXT,
    recommendations TEXT,
    
    -- Timing
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    next_check_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for health checks
CREATE INDEX idx_integration_health_system ON integration_health_checks(system_id);
CREATE INDEX idx_integration_health_status ON integration_health_checks(check_status);
CREATE INDEX idx_integration_health_checked_at ON integration_health_checks(checked_at DESC);
CREATE INDEX idx_integration_health_next_check ON integration_health_checks(next_check_at) WHERE check_status != 'healthy';

-- =====================================================
-- FUNCTIONS FOR INTEGRATIONS
-- =====================================================

-- Function to queue sync job
CREATE OR REPLACE FUNCTION queue_sync_job(
    p_connection_id UUID,
    p_job_type VARCHAR(50),
    p_entity_type VARCHAR(100) DEFAULT NULL,
    p_sync_direction VARCHAR(20) DEFAULT 'bidirectional',
    p_scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) RETURNS UUID AS $$
DECLARE
    job_id UUID;
BEGIN
    INSERT INTO sync_jobs (
        connection_id, job_type, entity_type, sync_direction, scheduled_for
    ) VALUES (
        p_connection_id, p_job_type, p_entity_type, p_sync_direction, p_scheduled_for
    ) RETURNING id INTO job_id;
    
    RETURN job_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update integration connection status
CREATE OR REPLACE FUNCTION update_connection_status(
    p_connection_id UUID,
    p_status integration_status,
    p_error_message TEXT DEFAULT NULL
) RETURNS void AS $$
BEGIN
    UPDATE integration_connections SET
        status = p_status,
        last_error = p_error_message,
        consecutive_errors = CASE 
            WHEN p_status = 'active' THEN 0
            WHEN p_error_message IS NOT NULL THEN consecutive_errors + 1
            ELSE consecutive_errors
        END,
        updated_at = NOW()
    WHERE id = p_connection_id;
END;
$$ LANGUAGE plpgsql;

-- Function to trigger webhook
CREATE OR REPLACE FUNCTION trigger_webhook(
    p_event_type VARCHAR(100),
    p_entity_type VARCHAR(100),
    p_entity_id UUID,
    p_event_data JSONB DEFAULT '{}'
) RETURNS void AS $$
DECLARE
    webhook_record webhook_endpoints%ROWTYPE;
BEGIN
    -- Find all active webhooks that should receive this event
    FOR webhook_record IN 
        SELECT * FROM webhook_endpoints 
        WHERE is_active = true 
        AND p_event_type = ANY(events)
    LOOP
        -- Queue webhook delivery
        INSERT INTO webhook_deliveries (
            webhook_endpoint_id, event_type, entity_type, entity_id,
            request_url, request_method, request_payload, status
        ) VALUES (
            webhook_record.id, p_event_type, p_entity_type, p_entity_id,
            webhook_record.endpoint_url, webhook_record.http_method,
            jsonb_build_object(
                'event_type', p_event_type,
                'entity_type', p_entity_type,
                'entity_id', p_entity_id,
                'data', p_event_data,
                'timestamp', NOW()
            ),
            'pending'
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Apply standard triggers
CREATE TRIGGER external_systems_updated_at BEFORE UPDATE ON external_systems FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER integration_connections_updated_at BEFORE UPDATE ON integration_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER sync_jobs_updated_at BEFORE UPDATE ON sync_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER data_mappings_updated_at BEFORE UPDATE ON data_mappings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER webhook_endpoints_updated_at BEFORE UPDATE ON webhook_endpoints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PERFORMANCE VIEWS FOR INTEGRATIONS
-- =====================================================

-- Integration performance summary
CREATE VIEW integration_performance_summary AS
SELECT 
    es.id as system_id,
    es.system_name,
    es.provider,
    es.status,
    COUNT(ic.id) as active_connections,
    COUNT(sj.id) as total_sync_jobs,
    COUNT(sj.id) FILTER (WHERE sj.status = 'completed') as successful_jobs,
    COUNT(sj.id) FILTER (WHERE sj.status = 'failed') as failed_jobs,
    AVG(EXTRACT(EPOCH FROM (sj.completed_at - sj.started_at))) as avg_job_duration_seconds,
    SUM(sj.records_processed) as total_records_processed,
    MAX(ic.last_successful_sync_at) as last_successful_sync
FROM external_systems es
LEFT JOIN integration_connections ic ON es.id = ic.system_id AND ic.status = 'active'
LEFT JOIN sync_jobs sj ON ic.id = sj.connection_id
GROUP BY es.id, es.system_name, es.provider, es.status;

-- Webhook delivery performance
CREATE VIEW webhook_performance_summary AS
SELECT 
    we.id as webhook_id,
    we.endpoint_name,
    we.endpoint_url,
    COUNT(wd.id) as total_deliveries,
    COUNT(wd.id) FILTER (WHERE wd.status = 'success') as successful_deliveries,
    COUNT(wd.id) FILTER (WHERE wd.status = 'failed') as failed_deliveries,
    ROUND(COUNT(wd.id) FILTER (WHERE wd.status = 'success') * 100.0 / NULLIF(COUNT(wd.id), 0), 2) as success_rate,
    AVG(wd.response_time_ms) as avg_response_time_ms,
    MAX(wd.triggered_at) as last_delivery_at
FROM webhook_endpoints we
LEFT JOIN webhook_deliveries wd ON we.id = wd.webhook_endpoint_id
WHERE we.is_active = true
GROUP BY we.id, we.endpoint_name, we.endpoint_url;

COMMENT ON TABLE external_systems IS 'Configuration for external system integrations';
COMMENT ON TABLE integration_connections IS 'User-specific connections to external systems';
COMMENT ON TABLE sync_jobs IS 'Data synchronization jobs and their status';
COMMENT ON TABLE webhook_endpoints IS 'Outgoing webhook endpoints configuration';
COMMENT ON TABLE data_enrichment_requests IS 'External data enrichment requests and results';