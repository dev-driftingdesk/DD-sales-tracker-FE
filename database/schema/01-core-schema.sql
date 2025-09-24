-- =====================================================
-- SalesTracker CRM Database Schema - Core Tables
-- =====================================================
-- PostgreSQL 13+ Compatible Schema
-- Supports 73 API endpoints across 11 modules
-- Optimized for performance and scalability
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE user_role_type AS ENUM ('admin', 'manager', 'senior_sales', 'sales_rep', 'junior_sales');
CREATE TYPE lead_status_type AS ENUM ('new', 'contacted', 'in_progress', 'qualified', 'won', 'lost');
CREATE TYPE lead_source_type AS ENUM ('website', 'facebook', 'instagram', 'whatsapp', 'email', 'event', 'manual', 'referral', 'cold_call', 'linkedin');
CREATE TYPE deal_stage_type AS ENUM ('lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost');
CREATE TYPE activity_type AS ENUM ('call', 'email', 'meeting', 'note', 'status_change', 'follow_up', 'demo', 'proposal', 'quote', 'contract', 'task', 'reminder');
CREATE TYPE notification_type AS ENUM ('lead_assigned', 'deal_won', 'deal_lost', 'task_overdue', 'meeting_reminder', 'email_received', 'quota_achieved', 'target_missed');
CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE email_status AS ENUM ('sent', 'delivered', 'opened', 'replied', 'bounced', 'failed', 'scheduled');
CREATE TYPE integration_status AS ENUM ('active', 'inactive', 'error', 'configuring');

-- =====================================================
-- CORE USER MANAGEMENT TABLES
-- =====================================================

-- Users table - Core authentication and user data
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role_type NOT NULL DEFAULT 'sales_rep',
    avatar_url TEXT,
    phone VARCHAR(50),
    company VARCHAR(255),
    
    -- Status and verification
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- Preferences (JSON for flexibility)
    preferences JSONB DEFAULT '{}',
    
    -- Permissions (array of permission strings)
    permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT users_name_check CHECK (LENGTH(name) >= 2)
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_active ON users(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_last_login ON users(last_login_at DESC);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);

-- Session management
CREATE TABLE user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(refresh_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- JWT blacklist for logout
CREATE TABLE jwt_blacklist (
    jti VARCHAR(255) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_jwt_blacklist_expires ON jwt_blacklist(expires_at);

-- =====================================================
-- TEAM MANAGEMENT TABLES
-- =====================================================

-- Teams
CREATE TABLE teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Team settings
    territories TEXT[],
    targets JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_teams_manager ON teams(manager_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_teams_active ON teams(is_active) WHERE deleted_at IS NULL;

-- Team memberships
CREATE TABLE team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(team_id, user_id, left_at) -- Allow re-joining
);

CREATE INDEX idx_team_members_team ON team_members(team_id) WHERE left_at IS NULL;
CREATE INDEX idx_team_members_user ON team_members(user_id) WHERE left_at IS NULL;

-- =====================================================
-- CRM CORE TABLES
-- =====================================================

-- Companies
CREATE TABLE companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    industry VARCHAR(100),
    size VARCHAR(50),
    website TEXT,
    location VARCHAR(255),
    description TEXT,
    
    -- Status and categorization
    status VARCHAR(50) DEFAULT 'prospect',
    tags TEXT[],
    
    -- Contact information
    primary_contact_id UUID,
    phone VARCHAR(50),
    
    -- Custom fields (flexible JSON storage)
    custom_fields JSONB DEFAULT '{}',
    
    -- External integration IDs
    external_ids JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Indexes for companies
CREATE INDEX idx_companies_name ON companies USING GIN (name gin_trgm_ops) WHERE deleted_at IS NULL;
CREATE INDEX idx_companies_domain ON companies(domain) WHERE deleted_at IS NULL;
CREATE INDEX idx_companies_industry ON companies(industry) WHERE deleted_at IS NULL;
CREATE INDEX idx_companies_status ON companies(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_companies_created_at ON companies(created_at DESC) WHERE deleted_at IS NULL;

-- Contacts
CREATE TABLE contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    
    -- Personal information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    title VARCHAR(150),
    
    -- Location and preferences
    location VARCHAR(255),
    timezone VARCHAR(50),
    language VARCHAR(50) DEFAULT 'english',
    
    -- Status and categorization
    status VARCHAR(50) DEFAULT 'active',
    tags TEXT[],
    
    -- Social profiles
    social_profiles JSONB DEFAULT '{}',
    
    -- Communication preferences
    preferences JSONB DEFAULT '{}',
    
    -- Custom fields
    custom_fields JSONB DEFAULT '{}',
    
    -- Interaction tracking
    last_interaction_at TIMESTAMP WITH TIME ZONE,
    interaction_count INTEGER DEFAULT 0,
    
    -- External integration IDs
    external_ids JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Indexes for contacts
CREATE INDEX idx_contacts_email ON contacts(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_company ON contacts(company_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_name ON contacts USING GIN ((first_name || ' ' || last_name) gin_trgm_ops) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_status ON contacts(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_last_interaction ON contacts(last_interaction_at DESC NULLS LAST) WHERE deleted_at IS NULL;

-- Add foreign key constraint after contacts table creation
ALTER TABLE companies ADD CONSTRAINT fk_companies_primary_contact 
    FOREIGN KEY (primary_contact_id) REFERENCES contacts(id) ON DELETE SET NULL;

-- =====================================================
-- PRODUCTS AND CATALOG
-- =====================================================

-- Product categories
CREATE TABLE product_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_product_categories_parent ON product_categories(parent_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_product_categories_sort ON product_categories(sort_order) WHERE deleted_at IS NULL;

-- Products
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    
    -- Basic product information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE,
    
    -- Pricing
    price DECIMAL(12,2) NOT NULL DEFAULT 0,
    cost DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Inventory
    unit VARCHAR(50),
    stock_quantity INTEGER DEFAULT 0,
    minimum_order INTEGER DEFAULT 1,
    
    -- Status and availability
    availability VARCHAR(50) DEFAULT 'in_stock',
    is_active BOOLEAN DEFAULT true,
    
    -- Product details
    specifications JSONB DEFAULT '{}',
    images TEXT[],
    tags TEXT[],
    
    -- Custom fields
    custom_fields JSONB DEFAULT '{}',
    
    -- Sales tracking
    sales_count INTEGER DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Indexes for products
CREATE INDEX idx_products_name ON products USING GIN (name gin_trgm_ops) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_sku ON products(sku) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_category ON products(category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_active ON products(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_availability ON products(availability) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_price ON products(price) WHERE deleted_at IS NULL;

-- =====================================================
-- AUDIT AND CHANGE TRACKING
-- =====================================================

-- Generic audit log for all entity changes
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for audit logs
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to log entity changes to audit_logs
CREATE OR REPLACE FUNCTION log_entity_changes()
RETURNS TRIGGER AS $$
DECLARE
    entity_name TEXT;
    old_data JSONB;
    new_data JSONB;
    changed_fields_array TEXT[];
BEGIN
    entity_name := TG_TABLE_NAME;
    
    IF TG_OP = 'DELETE' THEN
        old_data := to_jsonb(OLD);
        INSERT INTO audit_logs (entity_type, entity_id, action, old_values, user_id)
        VALUES (entity_name, OLD.id, 'DELETE', old_data, current_setting('app.current_user_id', true)::UUID);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
        
        -- Find changed fields
        SELECT ARRAY_AGG(key) INTO changed_fields_array
        FROM (
            SELECT key FROM jsonb_each(old_data)
            WHERE key NOT IN ('updated_at', 'id')
            AND old_data->>key IS DISTINCT FROM new_data->>key
        ) AS changed;
        
        IF array_length(changed_fields_array, 1) > 0 THEN
            INSERT INTO audit_logs (entity_type, entity_id, action, old_values, new_values, changed_fields, user_id)
            VALUES (entity_name, NEW.id, 'UPDATE', old_data, new_data, changed_fields_array, current_setting('app.current_user_id', true)::UUID);
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        new_data := to_jsonb(NEW);
        INSERT INTO audit_logs (entity_type, entity_id, action, new_values, user_id)
        VALUES (entity_name, NEW.id, 'INSERT', new_data, current_setting('app.current_user_id', true)::UUID);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables with updated_at column
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply audit triggers to core tables
CREATE TRIGGER users_audit AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION log_entity_changes();
CREATE TRIGGER companies_audit AFTER INSERT OR UPDATE OR DELETE ON companies FOR EACH ROW EXECUTE FUNCTION log_entity_changes();
CREATE TRIGGER contacts_audit AFTER INSERT OR UPDATE OR DELETE ON contacts FOR EACH ROW EXECUTE FUNCTION log_entity_changes();
CREATE TRIGGER products_audit AFTER INSERT OR UPDATE OR DELETE ON products FOR EACH ROW EXECUTE FUNCTION log_entity_changes();

-- =====================================================
-- PERFORMANCE OPTIMIZATION VIEWS
-- =====================================================

-- View for active users with team information
CREATE VIEW active_users_with_teams AS
SELECT 
    u.*,
    t.name as team_name,
    t.id as team_id,
    tm.role as team_role
FROM users u
LEFT JOIN team_members tm ON u.id = tm.user_id AND tm.left_at IS NULL
LEFT JOIN teams t ON tm.team_id = t.id AND t.deleted_at IS NULL
WHERE u.deleted_at IS NULL AND u.is_active = true;

-- View for companies with contact counts
CREATE VIEW companies_with_metrics AS
SELECT 
    c.*,
    COUNT(DISTINCT ct.id) as contact_count,
    pc.first_name || ' ' || pc.last_name as primary_contact_name,
    pc.email as primary_contact_email
FROM companies c
LEFT JOIN contacts ct ON c.id = ct.company_id AND ct.deleted_at IS NULL
LEFT JOIN contacts pc ON c.primary_contact_id = pc.id
WHERE c.deleted_at IS NULL
GROUP BY c.id, pc.id;

-- View for products with category information
CREATE VIEW products_with_categories AS
SELECT 
    p.*,
    pc.name as category_name,
    pc.description as category_description,
    ROUND((p.price - p.cost) / NULLIF(p.price, 0) * 100, 2) as margin_percentage
FROM products p
LEFT JOIN product_categories pc ON p.category_id = pc.id AND pc.deleted_at IS NULL
WHERE p.deleted_at IS NULL;

COMMENT ON TABLE users IS 'Core user authentication and profile data';
COMMENT ON TABLE companies IS 'Company/organization records in CRM';
COMMENT ON TABLE contacts IS 'Individual contact records linked to companies';
COMMENT ON TABLE products IS 'Product catalog with pricing and inventory';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all entity changes';