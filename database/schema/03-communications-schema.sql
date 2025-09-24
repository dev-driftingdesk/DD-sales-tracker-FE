-- =====================================================
-- SalesTracker CRM Database Schema - Communications
-- =====================================================
-- Email management, notifications, templates, and integrations
-- Supports email tracking, automation, and external integrations
-- =====================================================

-- =====================================================
-- EMAIL MANAGEMENT
-- =====================================================

-- Email messages table
CREATE TABLE emails (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Message identification
    message_id VARCHAR(255) UNIQUE, -- External message ID from email provider
    thread_id VARCHAR(255), -- Email thread/conversation ID
    
    -- Recipients and sender
    from_email VARCHAR(255) NOT NULL,
    to_emails TEXT[] NOT NULL,
    cc_emails TEXT[],
    bcc_emails TEXT[],
    reply_to VARCHAR(255),
    
    -- Message content
    subject VARCHAR(500) NOT NULL,
    body_text TEXT,
    body_html TEXT,
    body_type VARCHAR(10) DEFAULT 'html' CHECK (body_type IN ('text', 'html')),
    
    -- Related entities
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    
    -- Email status and tracking
    status email_status DEFAULT 'sent',
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('sent', 'received')),
    
    -- Scheduling and timing
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    -- Tracking information
    tracking_enabled BOOLEAN DEFAULT true,
    tracking_id UUID DEFAULT uuid_generate_v4(),
    
    -- Email provider information
    provider VARCHAR(50), -- smtp, gmail, outlook
    provider_message_id VARCHAR(255),
    provider_status VARCHAR(100),
    
    -- Priority and categorization
    priority notification_priority DEFAULT 'normal',
    tags TEXT[],
    
    -- Template information
    template_id UUID,
    template_variables JSONB DEFAULT '{}',
    
    -- Attachments
    attachments JSONB DEFAULT '[]',
    attachment_count INTEGER DEFAULT 0,
    
    -- User and ownership
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- External integration
    external_ids JSONB DEFAULT '{}',
    sync_status VARCHAR(50) DEFAULT 'synced',
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for emails
CREATE INDEX idx_emails_message_id ON emails(message_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_emails_thread_id ON emails(thread_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_emails_lead_id ON emails(lead_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_emails_deal_id ON emails(deal_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_emails_contact_id ON emails(contact_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_emails_user_id ON emails(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_emails_status ON emails(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_emails_direction ON emails(direction) WHERE deleted_at IS NULL;
CREATE INDEX idx_emails_sent_at ON emails(sent_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_emails_scheduled_for ON emails(scheduled_for) WHERE deleted_at IS NULL;

-- Composite indexes for common queries
CREATE INDEX idx_emails_user_sent ON emails(user_id, sent_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_emails_lead_sent ON emails(lead_id, sent_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_emails_status_scheduled ON emails(status, scheduled_for) WHERE deleted_at IS NULL;

-- Full-text search for emails
CREATE INDEX idx_emails_search ON emails USING GIN (
    (subject || ' ' || COALESCE(body_text, '') || ' ' || array_to_string(to_emails, ' ')) gin_trgm_ops
) WHERE deleted_at IS NULL;

-- Email tracking events
CREATE TABLE email_tracking_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
    tracking_id UUID NOT NULL,
    
    -- Event details
    event_type VARCHAR(50) NOT NULL, -- opened, clicked, bounced, delivered, replied, unsubscribed
    event_data JSONB DEFAULT '{}',
    
    -- Tracking metadata
    ip_address INET,
    user_agent TEXT,
    location VARCHAR(255),
    device_type VARCHAR(50),
    
    -- Link tracking (for click events)
    link_url TEXT,
    link_id VARCHAR(100),
    
    -- Recipient information
    recipient_email VARCHAR(255),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for email tracking
CREATE INDEX idx_email_tracking_email_id ON email_tracking_events(email_id);
CREATE INDEX idx_email_tracking_tracking_id ON email_tracking_events(tracking_id);
CREATE INDEX idx_email_tracking_event_type ON email_tracking_events(event_type);
CREATE INDEX idx_email_tracking_created_at ON email_tracking_events(created_at DESC);
CREATE INDEX idx_email_tracking_recipient ON email_tracking_events(recipient_email);

-- Email templates
CREATE TABLE email_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Template identification
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- follow_up, proposal, welcome, nurture, meeting
    
    -- Template content
    subject VARCHAR(500) NOT NULL,
    body_text TEXT,
    body_html TEXT,
    body_type VARCHAR(10) DEFAULT 'html' CHECK (body_type IN ('text', 'html')),
    
    -- Template variables and metadata
    variables JSONB DEFAULT '[]', -- Array of variable definitions
    preview_text VARCHAR(500),
    
    -- Sharing and permissions
    is_shared BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Categorization
    tags TEXT[],
    
    -- Ownership
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for email templates
CREATE INDEX idx_email_templates_category ON email_templates(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_email_templates_shared ON email_templates(is_shared) WHERE is_active = true AND deleted_at IS NULL;
CREATE INDEX idx_email_templates_created_by ON email_templates(created_by) WHERE deleted_at IS NULL;
CREATE INDEX idx_email_templates_usage ON email_templates(usage_count DESC) WHERE is_active = true AND deleted_at IS NULL;

-- Email template usage tracking
CREATE TABLE email_template_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES email_templates(id) ON DELETE CASCADE,
    email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    variables_used JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_email_template_usage_template ON email_template_usage(template_id);
CREATE INDEX idx_email_template_usage_user ON email_template_usage(user_id);

-- =====================================================
-- EMAIL SETTINGS AND CONFIGURATION
-- =====================================================

-- User email settings
CREATE TABLE user_email_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Email signature and defaults
    signature TEXT,
    default_from_email VARCHAR(255),
    business_email VARCHAR(255),
    cc_to_business_email BOOLEAN DEFAULT false,
    
    -- Behavior settings
    auto_save_templates BOOLEAN DEFAULT true,
    tracking_enabled BOOLEAN DEFAULT true,
    notifications_enabled BOOLEAN DEFAULT true,
    external_email_monitoring BOOLEAN DEFAULT false,
    
    -- Integration settings
    gmail_integration JSONB DEFAULT '{}',
    outlook_integration JSONB DEFAULT '{}',
    smtp_settings JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- EXTERNAL EMAIL INTEGRATIONS
-- =====================================================

-- Email integrations (Gmail, Outlook, etc.)
CREATE TABLE email_integrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Integration details
    provider VARCHAR(50) NOT NULL, -- gmail, outlook, smtp
    provider_account_id VARCHAR(255),
    connected_email VARCHAR(255) NOT NULL,
    
    -- Authentication and tokens (encrypted)
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Integration configuration
    configuration JSONB DEFAULT '{}',
    permissions TEXT[], -- read, send, compose
    
    -- Sync settings
    sync_historical_emails BOOLEAN DEFAULT false,
    sync_days INTEGER DEFAULT 30,
    auto_sync_enabled BOOLEAN DEFAULT true,
    
    -- Status and health
    status integration_status DEFAULT 'active',
    last_sync_at TIMESTAMP WITH TIME ZONE,
    last_error TEXT,
    sync_cursor VARCHAR(255), -- For incremental sync
    
    -- Statistics
    emails_imported INTEGER DEFAULT 0,
    emails_sent INTEGER DEFAULT 0,
    
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for email integrations
CREATE INDEX idx_email_integrations_user ON email_integrations(user_id);
CREATE INDEX idx_email_integrations_provider ON email_integrations(provider);
CREATE INDEX idx_email_integrations_status ON email_integrations(status);
CREATE INDEX idx_email_integrations_last_sync ON email_integrations(last_sync_at DESC);

-- =====================================================
-- NOTIFICATIONS SYSTEM
-- =====================================================

-- Notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Recipient
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification content
    type notification_type NOT NULL,
    category VARCHAR(100) NOT NULL, -- leads, deals, tasks, meetings, system, performance
    priority notification_priority DEFAULT 'medium',
    
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Related entities and data
    related_entity_type VARCHAR(100),
    related_entity_id UUID,
    data JSONB DEFAULT '{}',
    
    -- Actions available for this notification
    actions JSONB DEFAULT '[]',
    
    -- Status and timing
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Delivery channels and status
    channels_sent TEXT[], -- in_app, email, sms, push
    delivery_status JSONB DEFAULT '{}',
    
    -- Source information
    source_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    source_system VARCHAR(100),
    
    -- Custom metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_category ON notifications(category);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_expires_at ON notifications(expires_at) WHERE expires_at IS NOT NULL;

-- Composite indexes for performance
CREATE INDEX idx_notifications_user_unread_created ON notifications(user_id, created_at DESC) WHERE is_read = false;
CREATE INDEX idx_notifications_user_category ON notifications(user_id, category) WHERE is_read = false;

-- Notification preferences
CREATE TABLE notification_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Global channel preferences
    channels JSONB DEFAULT '{"in_app": true, "email": true, "sms": false, "push": false}',
    
    -- Category-specific preferences
    category_preferences JSONB DEFAULT '{}',
    
    -- Quiet hours
    quiet_hours_enabled BOOLEAN DEFAULT false,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    quiet_hours_timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Digest settings
    digest_enabled BOOLEAN DEFAULT false,
    digest_frequency VARCHAR(20) DEFAULT 'daily', -- daily, weekly
    digest_time TIME DEFAULT '09:00:00',
    digest_categories TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FILE ATTACHMENTS
-- =====================================================

-- File attachments table (for emails and activities)
CREATE TABLE file_attachments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- File information
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    
    -- Storage information
    storage_path TEXT NOT NULL,
    storage_provider VARCHAR(50) DEFAULT 'local', -- local, s3, gcs
    
    -- Security and scanning
    virus_scan_status VARCHAR(50) DEFAULT 'pending', -- pending, clean, infected, failed
    virus_scan_at TIMESTAMP WITH TIME ZONE,
    
    -- Related entities
    email_id UUID REFERENCES emails(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    
    -- Upload information
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Access control
    is_public BOOLEAN DEFAULT false,
    access_token UUID DEFAULT uuid_generate_v4(),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for file attachments
CREATE INDEX idx_file_attachments_email ON file_attachments(email_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_file_attachments_activity ON file_attachments(activity_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_file_attachments_uploaded_by ON file_attachments(uploaded_by) WHERE deleted_at IS NULL;
CREATE INDEX idx_file_attachments_access_token ON file_attachments(access_token) WHERE deleted_at IS NULL;
CREATE INDEX idx_file_attachments_virus_scan ON file_attachments(virus_scan_status) WHERE deleted_at IS NULL;

-- =====================================================
-- TRIGGERS AND FUNCTIONS FOR COMMUNICATIONS
-- =====================================================

-- Function to update email template usage count
CREATE OR REPLACE FUNCTION update_email_template_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.template_id IS NOT NULL THEN
        UPDATE email_templates SET 
            usage_count = usage_count + 1,
            last_used_at = NOW(),
            updated_at = NOW()
        WHERE id = NEW.template_id;
        
        -- Record template usage
        INSERT INTO email_template_usage (template_id, email_id, user_id, variables_used)
        VALUES (NEW.template_id, NEW.id, NEW.user_id, NEW.template_variables);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create email activity when email is sent
CREATE OR REPLACE FUNCTION create_email_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create activity for sent emails, not received
    IF NEW.direction = 'sent' AND NEW.status IN ('sent', 'delivered') THEN
        INSERT INTO activities (
            lead_id, deal_id, contact_id, company_id,
            type, title, description,
            user_id, metadata, created_at
        ) VALUES (
            NEW.lead_id, NEW.deal_id, NEW.contact_id, NEW.company_id,
            'email', 
            CONCAT('Email: ', NEW.subject),
            CONCAT('Email sent to ', array_to_string(NEW.to_emails, ', ')),
            NEW.user_id,
            jsonb_build_object(
                'email_id', NEW.id,
                'subject', NEW.subject,
                'recipient_count', array_length(NEW.to_emails, 1),
                'tracking_enabled', NEW.tracking_enabled
            ),
            NEW.sent_at
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update notification read status
CREATE OR REPLACE FUNCTION update_notification_read_status()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_read = false AND NEW.is_read = true THEN
        NEW.read_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS void AS $$
BEGIN
    DELETE FROM notifications 
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Function to generate email tracking pixel URL
CREATE OR REPLACE FUNCTION generate_tracking_pixel_url(email_tracking_id UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN CONCAT('/api/v1/emails/tracking/pixel/', email_tracking_id, '.png');
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER emails_update_template_usage 
    AFTER INSERT ON emails 
    FOR EACH ROW 
    EXECUTE FUNCTION update_email_template_usage();

CREATE TRIGGER emails_create_activity 
    AFTER UPDATE ON emails 
    FOR EACH ROW 
    WHEN (OLD.status != NEW.status AND NEW.status IN ('sent', 'delivered'))
    EXECUTE FUNCTION create_email_activity();

CREATE TRIGGER notifications_update_read_status 
    BEFORE UPDATE ON notifications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_notification_read_status();

-- Apply standard audit and timestamp triggers
CREATE TRIGGER emails_updated_at BEFORE UPDATE ON emails FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER user_email_settings_updated_at BEFORE UPDATE ON user_email_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER email_integrations_updated_at BEFORE UPDATE ON email_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER emails_audit AFTER INSERT OR UPDATE OR DELETE ON emails FOR EACH ROW EXECUTE FUNCTION log_entity_changes();
CREATE TRIGGER notifications_audit AFTER INSERT OR UPDATE OR DELETE ON notifications FOR EACH ROW EXECUTE FUNCTION log_entity_changes();

-- =====================================================
-- PERFORMANCE VIEWS
-- =====================================================

-- View for email analytics
CREATE VIEW email_analytics AS
SELECT 
    e.user_id,
    COUNT(*) as total_emails,
    COUNT(*) FILTER (WHERE direction = 'sent') as sent_emails,
    COUNT(*) FILTER (WHERE direction = 'received') as received_emails,
    COUNT(*) FILTER (WHERE status = 'delivered') as delivered_emails,
    COUNT(DISTINCT ete.email_id) FILTER (WHERE ete.event_type = 'opened') as opened_emails,
    COUNT(DISTINCT ete.email_id) FILTER (WHERE ete.event_type = 'clicked') as clicked_emails,
    COUNT(DISTINCT ete.email_id) FILTER (WHERE ete.event_type = 'replied') as replied_emails,
    ROUND(
        COUNT(DISTINCT ete.email_id) FILTER (WHERE ete.event_type = 'opened') * 100.0 / 
        NULLIF(COUNT(*) FILTER (WHERE direction = 'sent' AND status = 'delivered'), 0), 2
    ) as open_rate,
    ROUND(
        COUNT(DISTINCT ete.email_id) FILTER (WHERE ete.event_type = 'clicked') * 100.0 / 
        NULLIF(COUNT(*) FILTER (WHERE direction = 'sent' AND status = 'delivered'), 0), 2
    ) as click_rate,
    ROUND(
        COUNT(DISTINCT ete.email_id) FILTER (WHERE ete.event_type = 'replied') * 100.0 / 
        NULLIF(COUNT(*) FILTER (WHERE direction = 'sent' AND status = 'delivered'), 0), 2
    ) as reply_rate
FROM emails e
LEFT JOIN email_tracking_events ete ON e.id = ete.email_id
WHERE e.deleted_at IS NULL
GROUP BY e.user_id;

-- View for notification summary
CREATE VIEW notification_summary AS
SELECT 
    user_id,
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE is_read = false) as unread_count,
    COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_count,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_count,
    COUNT(*) FILTER (WHERE category = 'leads') as leads_count,
    COUNT(*) FILTER (WHERE category = 'deals') as deals_count,
    COUNT(*) FILTER (WHERE category = 'tasks') as tasks_count
FROM notifications
GROUP BY user_id;

COMMENT ON TABLE emails IS 'Email messages with tracking and integration support';
COMMENT ON TABLE email_templates IS 'Reusable email templates with variables';
COMMENT ON TABLE notifications IS 'In-app and multi-channel notification system';
COMMENT ON TABLE email_integrations IS 'External email provider integrations';
COMMENT ON TABLE file_attachments IS 'File attachments for emails and activities';