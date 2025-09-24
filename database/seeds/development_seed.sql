-- =====================================================
-- SalesTracker CRM Database - Development Seed Data
-- =====================================================
-- Comprehensive seed data for development and testing
-- Includes realistic data patterns and relationships
-- =====================================================

-- Set session variables for consistent timestamps
SET timezone = 'UTC';

-- =====================================================
-- USERS AND TEAMS SEED DATA
-- =====================================================

-- Insert development users
INSERT INTO users (id, email, password_hash, name, role, phone, company, is_active, email_verified, preferences, permissions, created_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'admin@salestracker.com', '$2b$12$LQv3c1yqBwEHxw4F8mVGZ.q3.zJ9RLqGb6ZAEfOwfW6eRVsQVXGR2', 'Admin User', 'admin', '+1-555-0001', 'SalesTracker Inc', true, true, '{"theme": "light", "notifications": true}', ARRAY['admin', 'user_management', 'system_config'], NOW() - INTERVAL '30 days'),
    ('550e8400-e29b-41d4-a716-446655440001', 'sara.ahmed@salestracker.com', '$2b$12$LQv3c1yqBwEHxw4F8mVGZ.q3.zJ9RLqGb6ZAEfOwfW6eRVsQVXGR2', 'Sara Ahmed', 'senior_sales', '+971-50-123-4567', 'SalesTracker Inc', true, true, '{"language": "english", "timezone": "Asia/Dubai"}', ARRAY['lead_management', 'deal_management'], NOW() - INTERVAL '25 days'),
    ('550e8400-e29b-41d4-a716-446655440002', 'maria.rodriguez@salestracker.com', '$2b$12$LQv3c1yqBwEHxw4F8mVGZ.q3.zJ9RLqGb6ZAEfOwfW6eRVsQVXGR2', 'Maria Rodriguez', 'sales_rep', '+1-555-0102', 'SalesTracker Inc', true, true, '{"language": "english", "timezone": "America/New_York"}', ARRAY['lead_management', 'deal_management'], NOW() - INTERVAL '20 days'),
    ('550e8400-e29b-41d4-a716-446655440003', 'amir.hassan@salestracker.com', '$2b$12$LQv3c1yqBwEHxw4F8mVGZ.q3.zJ9RLqGb6ZAEfOwfW6eRVsQVXGR2', 'Amir Hassan', 'sales_rep', '+1-555-0103', 'SalesTracker Inc', true, true, '{"language": "english", "timezone": "America/Los_Angeles"}', ARRAY['lead_management'], NOW() - INTERVAL '18 days'),
    ('550e8400-e29b-41d4-a716-446655440004', 'jacob.williams@salestracker.com', '$2b$12$LQv3c1yqBwEHxw4F8mVGZ.q3.zJ9RLqGb6ZAEfOwfW6eRVsQVXGR2', 'Jacob Williams', 'sales_rep', '+1-555-0104', 'SalesTracker Inc', true, true, '{"language": "english", "timezone": "America/Chicago"}', ARRAY['lead_management', 'deal_management'], NOW() - INTERVAL '15 days'),
    ('550e8400-e29b-41d4-a716-446655440005', 'anna.chen@salestracker.com', '$2b$12$LQv3c1yqBwEHxw4F8mVGZ.q3.zJ9RLqGb6ZAEfOwfW6eRVsQVXGR2', 'Anna Chen', 'sales_rep', '+1-555-0105', 'SalesTracker Inc', true, true, '{"language": "english", "timezone": "Australia/Sydney"}', ARRAY['lead_management'], NOW() - INTERVAL '12 days'),
    ('550e8400-e29b-41d4-a716-446655440006', 'david.manager@salestracker.com', '$2b$12$LQv3c1yqBwEHxw4F8mVGZ.q3.zJ9RLqGb6ZAEfOwfW6eRVsQVXGR2', 'David Manager', 'manager', '+1-555-0106', 'SalesTracker Inc', true, true, '{"language": "english", "timezone": "America/New_York"}', ARRAY['team_management', 'reporting'], NOW() - INTERVAL '28 days');

-- Insert teams
INSERT INTO teams (id, name, description, manager_id, territories, targets, created_at) VALUES
    ('660e8400-e29b-41d4-a716-446655440000', 'MENA Sales Team', 'Middle East and North Africa sales team', '550e8400-e29b-41d4-a716-446655440006', ARRAY['UAE', 'Saudi Arabia', 'Qatar', 'Kuwait'], '{"monthly_revenue": 150000, "quarterly_deals": 25}', NOW() - INTERVAL '28 days'),
    ('660e8400-e29b-41d4-a716-446655440001', 'Americas Sales Team', 'North and South America sales team', '550e8400-e29b-41d4-a716-446655440006', ARRAY['USA', 'Canada', 'Mexico', 'Brazil'], '{"monthly_revenue": 200000, "quarterly_deals": 35}', NOW() - INTERVAL '28 days'),
    ('660e8400-e29b-41d4-a716-446655440002', 'APAC Sales Team', 'Asia Pacific sales team', '550e8400-e29b-41d4-a716-446655440006', ARRAY['Australia', 'Singapore', 'Japan', 'South Korea'], '{"monthly_revenue": 120000, "quarterly_deals": 20}', NOW() - INTERVAL '28 days');

-- Insert team memberships
INSERT INTO team_members (team_id, user_id, role, joined_at) VALUES
    ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'senior_member', NOW() - INTERVAL '25 days'),
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'member', NOW() - INTERVAL '20 days'),
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'member', NOW() - INTERVAL '18 days'),
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 'member', NOW() - INTERVAL '15 days'),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 'member', NOW() - INTERVAL '12 days');

-- =====================================================
-- PRODUCTS AND CATEGORIES
-- =====================================================

-- Get existing category IDs for tea products
WITH category_ids AS (
    SELECT id as tea_category_id FROM product_categories WHERE name = 'Tea & Beverages' LIMIT 1
)
-- Insert sample products
INSERT INTO products (id, category_id, name, description, sku, price, cost, currency, unit, stock_quantity, specifications, images, tags, is_active, created_by, created_at) 
SELECT 
    uuid_generate_v4(),
    ci.tea_category_id,
    p.name,
    p.description,
    p.sku,
    p.price,
    p.cost,
    'USD',
    'kg',
    p.stock_quantity,
    p.specifications,
    p.images,
    p.tags,
    true,
    '550e8400-e29b-41d4-a716-446655440000', -- Admin user
    NOW() - INTERVAL '25 days'
FROM category_ids ci,
(VALUES 
    ('Premium Ceylon Tea', 'High-quality Ceylon black tea from Sri Lankan highlands', 'CT-PREM-001', 45.00, 25.00, 500, '{"origin": "Sri Lanka", "grade": "PEKOE", "caffeine": "high"}', ARRAY['/images/ceylon-tea.jpg'], ARRAY['premium', 'black-tea', 'ceylon']),
    ('Organic Green Tea', 'Certified organic green tea with delicate flavor', 'GT-ORG-001', 38.50, 22.00, 300, '{"origin": "China", "organic": true, "caffeine": "medium"}', ARRAY['/images/green-tea.jpg'], ARRAY['organic', 'green-tea', 'healthy']),
    ('Chai Tea Blend', 'Traditional Indian spice blend tea', 'CH-TRAD-001', 32.00, 18.00, 250, '{"spices": ["cardamom", "cinnamon", "ginger"], "caffeine": "medium"}', ARRAY['/images/chai-blend.jpg'], ARRAY['chai', 'spiced', 'traditional']),
    ('Earl Grey Supreme', 'Classic Earl Grey with bergamot and cornflower', 'EG-SUP-001', 41.00, 24.00, 400, '{"base": "Ceylon black tea", "flavoring": "bergamot oil", "additions": "cornflower petals"}', ARRAY['/images/earl-grey.jpg'], ARRAY['earl-grey', 'bergamot', 'classic']),
    ('Iced Tea Concentrate', 'Ready-to-mix iced tea concentrate for commercial use', 'IT-CONC-001', 65.00, 35.00, 100, '{"concentration": "1:8", "shelf_life": "18 months", "commercial": true}', ARRAY['/images/iced-concentrate.jpg'], ARRAY['iced-tea', 'concentrate', 'commercial'])
) AS p(name, description, sku, price, cost, stock_quantity, specifications, images, tags);

-- =====================================================
-- COMPANIES AND CONTACTS
-- =====================================================

-- Insert sample companies
INSERT INTO companies (id, name, domain, industry, size, website, location, description, status, tags, phone, custom_fields, created_by, created_at) VALUES
    ('770e8400-e29b-41d4-a716-446655440000', 'Zayed Traders LLC', 'zayedtraders.ae', 'Import/Export', 'Medium', 'https://zayedtraders.ae', 'Dubai, UAE', 'Premium tea importer serving UAE and GCC markets', 'customer', ARRAY['wholesale', 'middle-east', 'premium'], '+971-4-555-0001', '{"tax_id": "100123456789003", "credit_limit": 50000}', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '20 days'),
    ('770e8400-e29b-41d4-a716-446655440001', 'Pacific Beverages Inc', 'pacificbev.com', 'Food & Beverage', 'Large', 'https://pacificbev.com', 'San Francisco, USA', 'Large beverage distributor with focus on premium products', 'customer', ARRAY['beverage', 'distributor', 'usa'], '+1-415-555-0199', '{"tax_id": "12-3456789", "annual_revenue": 50000000}', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '25 days'),
    ('770e8400-e29b-41d4-a716-446655440002', 'GulfMart Supermarkets', 'gulfmart.com', 'Retail', 'Large', 'https://gulfmart.com', 'Riyadh, Saudi Arabia', 'Major supermarket chain across Saudi Arabia', 'customer', ARRAY['retail', 'supermarket', 'saudi'], '+966-11-555-0188', '{"stores_count": 45, "annual_revenue": 200000000}', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '30 days'),
    ('770e8400-e29b-41d4-a716-446655440003', 'Ceylon Tea Co', 'ceylontea.lk', 'Tea Production', 'Medium', 'https://ceylontea.lk', 'Colombo, Sri Lanka', 'Tea plantation and wholesale supplier', 'customer', ARRAY['supplier', 'tea-plantation', 'sri-lanka'], '+94-11-555-4567', '{"plantation_area": "500_hectares", "export_license": "EL2023001"}', '550e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '18 days'),
    ('770e8400-e29b-41d4-a716-446655440004', 'Sydney Tea Merchants', 'sydneyteamerchants.com.au', 'Specialty Retail', 'Small', 'https://sydneyteamerchants.com.au', 'Sydney, Australia', 'Boutique tea retailer with premium tea selection', 'prospect', ARRAY['specialty', 'retail', 'australia'], '+61-2-555-0155', '{"store_locations": 3, "online_sales": true}', '550e8400-e29b-41d4-a716-446655440005', NOW() - INTERVAL '12 days');

-- Insert contacts for companies
INSERT INTO contacts (id, company_id, first_name, last_name, email, phone, title, location, language, status, tags, social_profiles, preferences, custom_fields, created_by, created_at) VALUES
    ('880e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'Ahmed', 'Zayed', 'ahmed@zayedtraders.ae', '+971-50-123-4567', 'Managing Director', 'Dubai, UAE', 'arabic', 'active', ARRAY['decision-maker', 'premium-buyer'], '{"linkedin": "ahmed-zayed-traders"}', '{"communication": "email", "best_time": "morning"}', '{"purchasing_authority": 100000, "preferred_payment": "LC"}', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '20 days'),
    ('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Robert', 'Chen', 'robert@pacificbev.com', '+1-415-555-0199', 'VP of Procurement', 'San Francisco, USA', 'english', 'active', ARRAY['procurement', 'beverage-expert'], '{"linkedin": "robert-chen-pacific"}', '{"communication": "phone", "best_time": "afternoon"}', '{"budget_authority": 250000, "contract_preference": "annual"}', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '25 days'),
    ('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'Fatima', 'Al-Hassan', 'fatima@gulfmart.com', '+966-50-987-6543', 'Category Manager - Beverages', 'Riyadh, Saudi Arabia', 'arabic', 'active', ARRAY['category-manager', 'supermarket'], '{"linkedin": "fatima-alhassan-gulfmart"}', '{"communication": "email", "language": "arabic"}', '{"category_budget": 500000, "supplier_requirements": "halal_certified"}', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '30 days'),
    ('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', 'Priya', 'Silva', 'priya@ceylontea.lk', '+94-77-123-4567', 'Export Manager', 'Colombo, Sri Lanka', 'english', 'active', ARRAY['export-manager', 'tea-expert'], '{"linkedin": "priya-silva-ceylon"}', '{"communication": "whatsapp", "timezone": "Asia/Colombo"}', '{"export_volume": "monthly_container", "quality_standards": "iso_certified"}', '550e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '18 days'),
    ('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', 'Emma', 'Thompson', 'emma@sydneyteamerchants.com.au', '+61-2-555-0155', 'Owner', 'Sydney, Australia', 'english', 'active', ARRAY['owner', 'tea-specialist'], '{"instagram": "@sydneyteamerchants"}', '{"communication": "instagram", "best_time": "morning"}', '{"focus": "premium_teas", "customer_base": "discerning_tea_lovers"}', '550e8400-e29b-41d4-a716-446655440005', NOW() - INTERVAL '12 days');

-- Update companies with primary contact references
UPDATE companies SET primary_contact_id = '880e8400-e29b-41d4-a716-446655440000' WHERE id = '770e8400-e29b-41d4-a716-446655440000';
UPDATE companies SET primary_contact_id = '880e8400-e29b-41d4-a716-446655440001' WHERE id = '770e8400-e29b-41d4-a716-446655440001';
UPDATE companies SET primary_contact_id = '880e8400-e29b-41d4-a716-446655440002' WHERE id = '770e8400-e29b-41d4-a716-446655440002';
UPDATE companies SET primary_contact_id = '880e8400-e29b-41d4-a716-446655440003' WHERE id = '770e8400-e29b-41d4-a716-446655440003';
UPDATE companies SET primary_contact_id = '880e8400-e29b-41d4-a716-446655440004' WHERE id = '770e8400-e29b-41d4-a716-446655440004';

-- =====================================================
-- LEADS DATA
-- =====================================================

-- Insert sample leads
INSERT INTO leads (id, company_name, contact_name, email, phone, location, source, status, language, product_interest, deal_value, assigned_to, lead_score, quality_grade, tags, notes, created_by, created_at, updated_at) VALUES
    ('990e8400-e29b-41d4-a716-446655440000', 'European Tea Importers', 'Hans Mueller', 'hans@europeantea.de', '+49-30-555-0199', 'Berlin, Germany', 'website', 'in_progress', 'english', 'European Distribution Partnership', 120000, '550e8400-e29b-41d4-a716-446655440002', 85, 'A', ARRAY['distribution', 'europe', 'partnership'], 'Large distribution opportunity - in final negotiations', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '18 days', NOW() - INTERVAL '2 days'),
    ('990e8400-e29b-41d4-a716-446655440001', 'Toronto Coffee House', 'Mike Wilson', 'mike@torontocoffee.ca', '+1-416-555-0111', 'Toronto, Canada', 'email', 'lost', 'english', 'Tea and Coffee Blends', 18000, '550e8400-e29b-41d4-a716-446655440004', 45, 'C', ARRAY['lost', 'focus-change', 'canada'], 'Lost - decided to focus only on coffee products', '550e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '30 days', NOW() - INTERVAL '12 days'),
    ('990e8400-e29b-41d4-a716-446655440002', 'Bangkok Retail Chain', 'Somchai Tanaka', 'somchai@bangkokretail.th', '+66-2-555-0122', 'Bangkok, Thailand', 'facebook', 'lost', 'english', 'Asian Tea Collection', 25000, '550e8400-e29b-41d4-a716-446655440003', 60, 'B', ARRAY['lost', 'price-sensitive', 'thailand'], 'Lost - competitor offered better pricing and faster delivery', '550e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '20 days', NOW() - INTERVAL '8 days'),
    ('990e8400-e29b-41d4-a716-446655440003', 'Melbourne Tea Shop', 'Sarah Johnson', 'sarah@melbourneteashop.com.au', '+61-3-555-0144', 'Melbourne, Australia', 'referral', 'new', 'english', 'Specialty Tea Range', 35000, '550e8400-e29b-41d4-a716-446655440005', 75, 'A', ARRAY['referral', 'specialty', 'australia'], 'Referred by existing customer - interested in premium range', '550e8400-e29b-41d4-a716-446655440005', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
    ('990e8400-e29b-41d4-a716-446655440004', 'Nordic Coffee & Tea', 'Erik Johansson', 'erik@nordictea.se', '+46-8-555-0177', 'Stockholm, Sweden', 'linkedin', 'contacted', 'english', 'Organic Tea Blends', 42000, '550e8400-e29b-41d4-a716-446655440002', 70, 'A', ARRAY['organic', 'scandinavian', 'expansion'], 'Interested in organic certification and Scandinavian market expansion', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '8 days', NOW() - INTERVAL '2 days');

-- =====================================================
-- DEALS DATA
-- =====================================================

-- Insert sample deals
INSERT INTO deals (id, title, description, lead_id, company_id, company_name, contact_id, contact_name, value, currency, stage, probability, assigned_to, source, tags, expected_close_date, won_reason, notes, created_by, created_at) VALUES
    ('aa0e8400-e29b-41d4-a716-446655440000', 'Zayed Traders Quarterly Supply', 'Premium tea quarterly supply contract for UAE market', NULL, '770e8400-e29b-41d4-a716-446655440000', 'Zayed Traders LLC', '880e8400-e29b-41d4-a716-446655440000', 'Ahmed Zayed', 45000, 'USD', 'closed-won', 100, '550e8400-e29b-41d4-a716-446655440001', 'facebook', ARRAY['closed-won', 'repeat-customer', 'uae'], CURRENT_DATE - INTERVAL '3 days', 'Excellent repeat customer relationship and competitive pricing', 'Quarterly supply agreement signed successfully', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '15 days'),
    ('aa0e8400-e29b-41d4-a716-446655440001', 'Pacific Beverages Partnership', 'Iced tea concentrate supply for beverage manufacturing', NULL, '770e8400-e29b-41d4-a716-446655440001', 'Pacific Beverages Inc', '880e8400-e29b-41d4-a716-446655440001', 'Robert Chen', 65000, 'USD', 'closed-won', 100, '550e8400-e29b-41d4-a716-446655440002', 'website', ARRAY['beverage', 'usa', 'iced-tea', 'closed-won'], CURRENT_DATE - INTERVAL '5 days', 'Perfect fit for their product line and excellent samples feedback', 'Partnership launched successfully for beverage line', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '22 days'),
    ('aa0e8400-e29b-41d4-a716-446655440002', 'GulfMart Supermarket Chain', 'Full tea range supply to major supermarket chain', NULL, '770e8400-e29b-41d4-a716-446655440002', 'GulfMart Supermarkets', '880e8400-e29b-41d4-a716-446655440002', 'Fatima Al-Hassan', 95000, 'USD', 'closed-won', 100, '550e8400-e29b-41d4-a716-446655440001', 'event', ARRAY['expo-lead', 'supermarket-chain', 'saudi', 'closed-won'], CURRENT_DATE - INTERVAL '1 day', 'Major win! Excellent product reception and strong relationship building', 'Contract signed for full product range across 45 stores', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '19 days'),
    ('aa0e8400-e29b-41d4-a716-446655440003', 'European Distribution Deal', 'Major European distribution partnership opportunity', '990e8400-e29b-41d4-a716-446655440000', NULL, 'European Tea Importers', NULL, 'Hans Mueller', 120000, 'USD', 'negotiation', 75, '550e8400-e29b-41d4-a716-446655440002', 'website', ARRAY['distribution', 'europe', 'partnership'], CURRENT_DATE + INTERVAL '15 days', NULL, 'In final contract negotiations - very promising', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '18 days');

-- =====================================================
-- ACTIVITIES DATA
-- =====================================================

-- Insert sample activities for leads and deals
INSERT INTO activities (id, lead_id, deal_id, contact_id, company_id, type, title, description, is_from_lead, is_response, duration_minutes, outcome, priority, metadata, user_id, status, completed_at, created_at) VALUES
    -- Activities for European Distribution lead
    ('bb0e8400-e29b-41d4-a716-446655440000', '990e8400-e29b-41d4-a716-446655440000', 'aa0e8400-e29b-41d4-a716-446655440003', NULL, NULL, 'email', 'Initial Response', 'Responded to website inquiry about European distribution', false, false, NULL, 'interested', 'medium', '{"response_time": "2 hours", "subject": "European Distribution Inquiry"}', '550e8400-e29b-41d4-a716-446655440002', 'completed', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
    ('bb0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440000', 'aa0e8400-e29b-41d4-a716-446655440003', NULL, NULL, 'call', 'Discovery Call', 'Initial consultation about European market distribution', false, false, 60, 'very_interested', 'high', '{"call_quality": "excellent", "follow_up_required": true}', '550e8400-e29b-41d4-a716-446655440002', 'completed', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
    ('bb0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440000', 'aa0e8400-e29b-41d4-a716-446655440003', NULL, NULL, 'email', 'Proposal Sent', 'Sent comprehensive distribution proposal', false, false, NULL, 'proposal_sent', 'high', '{"document": "distribution_proposal_v2.pdf", "follow_up_date": "2024-12-20"}', '550e8400-e29b-41d4-a716-446655440002', 'completed', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
    
    -- Activities for closed deals
    ('bb0e8400-e29b-41d4-a716-446655440003', NULL, 'aa0e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'call', 'Contract Finalization', 'Final contract discussion and terms agreement', false, true, 45, 'agreement_reached', 'high', '{"contract_value": 45000, "terms": "quarterly_payment"}', '550e8400-e29b-41d4-a716-446655440001', 'completed', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
    ('bb0e8400-e29b-41d4-a716-446655440004', NULL, 'aa0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'meeting', 'Product Demo', 'Product demonstration and tasting session', false, false, 120, 'samples_approved', 'high', '{"location": "Pacific Beverages HQ", "products_sampled": ["iced_concentrate", "chai_blend"]}', '550e8400-e29b-41d4-a716-446655440002', 'completed', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days');

-- =====================================================
-- EMAIL DATA
-- =====================================================

-- Insert sample emails
INSERT INTO emails (id, message_id, from_email, to_emails, subject, body_text, body_html, lead_id, deal_id, contact_id, status, direction, sent_at, tracking_enabled, user_id, created_at) VALUES
    ('cc0e8400-e29b-41d4-a716-446655440000', 'MSG-001-2024', 'maria.rodriguez@salestracker.com', ARRAY['hans@europeantea.de'], 'European Distribution Partnership Proposal', 'Dear Hans, Thank you for your interest in our European distribution partnership...', '<html><body><p>Dear Hans,</p><p>Thank you for your interest in our European distribution partnership...</p></body></html>', '990e8400-e29b-41d4-a716-446655440000', 'aa0e8400-e29b-41d4-a716-446655440003', NULL, 'delivered', 'sent', NOW() - INTERVAL '8 days', true, '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '8 days'),
    ('cc0e8400-e29b-41d4-a716-446655440001', 'MSG-002-2024', 'sara.ahmed@salestracker.com', ARRAY['ahmed@zayedtraders.ae'], 'Quarterly Supply Contract Confirmation', 'Dear Ahmed, We are pleased to confirm your quarterly tea supply contract...', '<html><body><p>Dear Ahmed,</p><p>We are pleased to confirm your quarterly tea supply contract...</p></body></html>', NULL, 'aa0e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440000', 'delivered', 'sent', NOW() - INTERVAL '6 days', true, '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '6 days');

-- =====================================================
-- PERFORMANCE TARGETS
-- =====================================================

-- Insert user targets for current quarter
INSERT INTO user_targets (user_id, target_period, period_start, period_end, revenue_target, calls_target, meetings_target, emails_target, leads_target, deals_target, conversion_rate_target, created_by) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'quarterly', '2024-10-01', '2024-12-31', 300000, 200, 50, 300, 25, 15, 25.0, '550e8400-e29b-41d4-a716-446655440000'),
    ('550e8400-e29b-41d4-a716-446655440002', 'quarterly', '2024-10-01', '2024-12-31', 250000, 180, 45, 280, 22, 12, 22.0, '550e8400-e29b-41d4-a716-446655440000'),
    ('550e8400-e29b-41d4-a716-446655440003', 'quarterly', '2024-10-01', '2024-12-31', 180000, 150, 35, 250, 20, 10, 20.0, '550e8400-e29b-41d4-a716-446655440000'),
    ('550e8400-e29b-41d4-a716-446655440004', 'quarterly', '2024-10-01', '2024-12-31', 200000, 160, 40, 260, 18, 11, 24.0, '550e8400-e29b-41d4-a716-446655440000'),
    ('550e8400-e29b-41d4-a716-446655440005', 'quarterly', '2024-10-01', '2024-12-31', 150000, 140, 30, 220, 15, 8, 20.0, '550e8400-e29b-41d4-a716-446655440000');

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

-- Insert sample notifications
INSERT INTO notifications (user_id, type, category, priority, title, message, related_entity_type, related_entity_id, data, is_read, created_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440002', 'deal_won', 'deals', 'high', 'Deal Closed Successfully!', 'Congratulations! Your deal with Pacific Beverages Inc has been closed for $65,000', 'deal', 'aa0e8400-e29b-41d4-a716-446655440001', '{"deal_value": 65000, "client": "Pacific Beverages Inc"}', false, NOW() - INTERVAL '5 days'),
    ('550e8400-e29b-41d4-a716-446655440001', 'quota_achieved', 'performance', 'high', 'Monthly Quota Achieved!', 'You have successfully achieved your monthly revenue quota of $100,000', 'user', '550e8400-e29b-41d4-a716-446655440001', '{"quota": 100000, "achieved": 140000}', false, NOW() - INTERVAL '3 days'),
    ('550e8400-e29b-41d4-a716-446655440002', 'lead_assigned', 'leads', 'medium', 'New Lead Assigned', 'A new lead "European Tea Importers" has been assigned to you', 'lead', '990e8400-e29b-41d4-a716-446655440000', '{"lead_score": 85, "potential_value": 120000}', true, NOW() - INTERVAL '18 days');

-- =====================================================
-- ANALYTICS DATA
-- =====================================================

-- Insert sample daily performance snapshots for the last 30 days
INSERT INTO daily_performance_snapshots (snapshot_date, user_id, team_id, total_revenue, deals_won, leads_created, calls_made, emails_sent, meetings_held, pipeline_value, weighted_pipeline_value)
SELECT 
    generate_series(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '1 day', INTERVAL '1 day')::date as snapshot_date,
    u.id as user_id,
    CASE u.id 
        WHEN '550e8400-e29b-41d4-a716-446655440001' THEN '660e8400-e29b-41d4-a716-446655440000'
        WHEN '550e8400-e29b-41d4-a716-446655440002' THEN '660e8400-e29b-41d4-a716-446655440001'
        WHEN '550e8400-e29b-41d4-a716-446655440003' THEN '660e8400-e29b-41d4-a716-446655440001'
        WHEN '550e8400-e29b-41d4-a716-446655440004' THEN '660e8400-e29b-41d4-a716-446655440001'
        WHEN '550e8400-e29b-41d4-a716-446655440005' THEN '660e8400-e29b-41d4-a716-446655440002'
    END::uuid as team_id,
    (random() * 5000)::decimal(15,2) as total_revenue,
    (random() * 2)::integer as deals_won,
    (random() * 3)::integer as leads_created,
    (random() * 15 + 5)::integer as calls_made,
    (random() * 20 + 10)::integer as emails_sent,
    (random() * 3)::integer as meetings_held,
    (random() * 50000 + 25000)::decimal(15,2) as pipeline_value,
    (random() * 25000 + 12500)::decimal(15,2) as weighted_pipeline_value
FROM users u
WHERE u.role IN ('sales_rep', 'senior_sales');

-- =====================================================
-- EMAIL SETTINGS
-- =====================================================

-- Insert user email settings
INSERT INTO user_email_settings (user_id, signature, default_from_email, tracking_enabled, notifications_enabled) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Best regards,<br>Sara Ahmed<br>Senior Sales Representative<br>SalesTracker Inc<br>+971-50-123-4567', 'sara.ahmed@salestracker.com', true, true),
    ('550e8400-e29b-41d4-a716-446655440002', 'Best regards,<br>Maria Rodriguez<br>Sales Representative<br>SalesTracker Inc<br>+1-555-0102', 'maria.rodriguez@salestracker.com', true, true),
    ('550e8400-e29b-41d4-a716-446655440003', 'Best regards,<br>Amir Hassan<br>Sales Representative<br>SalesTracker Inc<br>+1-555-0103', 'amir.hassan@salestracker.com', true, true),
    ('550e8400-e29b-41d4-a716-446655440004', 'Best regards,<br>Jacob Williams<br>Sales Representative<br>SalesTracker Inc<br>+1-555-0104', 'jacob.williams@salestracker.com', true, true),
    ('550e8400-e29b-41d4-a716-446655440005', 'Best regards,<br>Anna Chen<br>Sales Representative<br>SalesTracker Inc<br>+1-555-0105', 'anna.chen@salestracker.com', true, true);

-- =====================================================
-- UPDATE STATISTICS
-- =====================================================

-- Update table statistics for optimal query planning
ANALYZE users;
ANALYZE companies;
ANALYZE contacts;
ANALYZE leads;
ANALYZE deals;
ANALYZE activities;
ANALYZE emails;
ANALYZE products;
ANALYZE daily_performance_snapshots;

-- Refresh materialized views
REFRESH MATERIALIZED VIEW dashboard_metrics;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Development seed data loaded successfully';
    RAISE NOTICE 'Users: %, Companies: %, Contacts: %, Leads: %, Deals: %', 
        (SELECT COUNT(*) FROM users),
        (SELECT COUNT(*) FROM companies),
        (SELECT COUNT(*) FROM contacts),
        (SELECT COUNT(*) FROM leads),
        (SELECT COUNT(*) FROM deals);
END $$;