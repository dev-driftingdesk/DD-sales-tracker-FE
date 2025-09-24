# SalesTracker CRM Database Documentation

## Overview

This directory contains the complete database schema, migrations, and configuration for the SalesTracker CRM system. The database is designed to support a comprehensive CRM with advanced analytics, performance tracking, and external integrations.

## 🏗️ Architecture

### Database Technology
- **Primary Database**: PostgreSQL 13+
- **Caching Layer**: Redis (for sessions and real-time data)
- **Search Engine**: Elasticsearch (for full-text search)
- **Read Replicas**: Supported for scaling read operations

### Schema Design Principles
- **Normalized Design**: 3NF compliance with strategic denormalization for performance
- **Audit Trail**: Comprehensive audit logging for all entity changes
- **Soft Deletes**: Important business data uses soft deletes for data recovery
- **JSON Flexibility**: JSONB fields for custom fields and metadata
- **Performance First**: Optimized indexes for common query patterns

## 📁 Directory Structure

```
database/
├── schema/                 # Core schema definitions
│   ├── 01-core-schema.sql           # Users, companies, contacts, products
│   ├── 02-leads-deals-schema.sql    # Leads, deals, activities
│   ├── 03-communications-schema.sql # Emails, notifications, templates
│   ├── 04-analytics-performance-schema.sql # Analytics and reporting
│   └── 05-integrations-external-schema.sql # External integrations
├── migrations/             # Database migrations
│   └── 001_initial_setup.sql       # Initial schema setup
├── seeds/                  # Sample data
│   └── development_seed.sql         # Development environment data
├── config/                 # Database configuration
│   └── database.yml                 # Environment configurations
├── performance/            # Performance optimization
│   └── indexes.sql                  # Advanced indexing strategy
└── README.md              # This documentation
```

## 🗄️ Schema Overview

### Core Entities

#### Users & Authentication
- **users**: Core user accounts with role-based permissions
- **user_sessions**: JWT session management
- **password_reset_tokens**: Secure password reset workflow
- **jwt_blacklist**: Token revocation for logout

#### CRM Core
- **companies**: Organization records with industry classification
- **contacts**: Individual contacts linked to companies
- **products**: Product catalog with pricing and inventory
- **product_categories**: Hierarchical product organization

#### Sales Pipeline
- **leads**: Lead management with scoring and routing
- **deals**: Deal pipeline with stage tracking
- **activities**: All interactions (calls, emails, meetings, notes)
- **lead_routing_rules**: Intelligent lead assignment
- **lead_scoring_factors**: Configurable lead scoring

#### Communications
- **emails**: Email management with tracking
- **email_templates**: Reusable email templates
- **email_tracking_events**: Email open/click tracking
- **notifications**: Multi-channel notification system
- **file_attachments**: File storage for emails and activities

#### Analytics & Performance
- **daily_performance_snapshots**: Pre-calculated daily metrics
- **monthly_performance_rollups**: Monthly performance aggregations
- **user_targets**: Individual and team performance targets
- **revenue_analytics**: Detailed revenue analysis
- **conversion_events**: Funnel conversion tracking
- **sales_forecasts**: Predictive sales forecasting

#### Integrations
- **external_systems**: Third-party system configurations
- **integration_connections**: User-specific connections
- **sync_jobs**: Data synchronization tracking
- **webhook_endpoints**: Outgoing webhook management
- **data_enrichment_requests**: External data enhancement

### Team Management
- **teams**: Sales team organization
- **team_members**: Team membership tracking
- **team_targets**: Team-level performance goals

## 🚀 Getting Started

### Prerequisites
- PostgreSQL 13 or higher
- Node.js 16+ (for application)
- Redis 6+ (for caching)
- Elasticsearch 7+ (for search)

### Database Setup

1. **Create Database**
```bash
createdb salestracker_development
createdb salestracker_test
```

2. **Run Initial Migration**
```bash
psql -d salestracker_development -f database/migrations/001_initial_setup.sql
```

3. **Load Development Data**
```bash
psql -d salestracker_development -f database/seeds/development_seed.sql
```

4. **Create Performance Indexes**
```bash
psql -d salestracker_development -f database/performance/indexes.sql
```

### Environment Configuration

Copy and configure the database settings:

```yaml
# config/database.yml
development:
  adapter: postgresql
  database: salestracker_development
  username: your_username
  password: your_password
  host: localhost
  port: 5432
```

## 📊 Performance Optimization

### Indexing Strategy

The database includes comprehensive indexing for:
- **Primary Lookups**: All foreign keys and frequently queried fields
- **Composite Indexes**: Multi-column indexes for complex queries
- **Partial Indexes**: Conditional indexes for specific use cases
- **Expression Indexes**: Calculated fields and full-text search

### Query Performance

Expected performance benchmarks:
- **Simple Lookups**: < 1ms
- **Lead/Deal Lists**: < 50ms
- **Dashboard Queries**: < 100ms
- **Analytics Reports**: < 500ms
- **Full-Text Search**: < 200ms

### Scaling Considerations

- **Read Replicas**: Configure for read-heavy analytics
- **Connection Pooling**: PgBouncer recommended for production
- **Partitioning**: Consider for high-volume activity tables
- **Archival**: Implement for historical data management

## 🔒 Security Features

### Row-Level Security (RLS)
- Users can only access their assigned leads/deals
- Team-based data isolation
- Admin override capabilities

### Data Encryption
- Password hashing with bcrypt
- Encrypted storage for sensitive tokens
- SSL/TLS required for production connections

### Audit Trail
- Complete change tracking for all entities
- User attribution for all modifications
- IP address and timestamp logging

## 🔄 Data Migration Strategy

### Converting from Mock Data

The existing mock data in the React stores can be migrated using:

1. **Export Current Data**
```javascript
// Extract data from Zustand stores
const leadsData = useLeadStore.getState().leads;
const usersData = useUserStore.getState().users;
```

2. **Transform and Import**
```sql
-- Use the provided transformation scripts
INSERT INTO leads (company_name, contact_name, email, ...)
SELECT company_name, contact_name, email, ...
FROM temp_mock_data;
```

3. **Validation**
- Verify data integrity
- Check relationships
- Validate business rules

## 🧪 Development Workflow

### Database Changes

1. **Create Migration**
```sql
-- database/migrations/002_new_feature.sql
-- Track in schema_migrations table
INSERT INTO schema_migrations (version, description) 
VALUES ('002', 'Add new feature tables');
```

2. **Update Schema Files**
- Modify appropriate schema file
- Update related indexes
- Document changes

3. **Test Migration**
```bash
# Test on development database
psql -d salestracker_development -f database/migrations/002_new_feature.sql
```

### Data Seeding

Add new seed data to `development_seed.sql`:
```sql
-- Add realistic test data
INSERT INTO leads (company_name, contact_name, ...)
VALUES ('Test Company', 'Test Contact', ...);
```

## 📈 Analytics & Reporting

### Pre-calculated Metrics

The system maintains several materialized views and snapshots:
- **dashboard_metrics**: Real-time dashboard data
- **daily_performance_snapshots**: Daily user performance
- **monthly_performance_rollups**: Monthly aggregations

### Refresh Strategy

```sql
-- Refresh materialized views
REFRESH MATERIALIZED VIEW dashboard_metrics;

-- Automated refresh (requires pg_cron)
SELECT cron.schedule('refresh-dashboard', '*/15 * * * *', 
  'REFRESH MATERIALIZED VIEW dashboard_metrics;');
```

## 🔧 Maintenance

### Regular Tasks

1. **Statistics Updates**
```sql
-- Update table statistics
ANALYZE;
```

2. **Index Maintenance**
```sql
-- Check index usage
SELECT * FROM index_usage_stats;

-- Rebuild if needed
REINDEX INDEX CONCURRENTLY idx_leads_performance_lookup;
```

3. **Cleanup Tasks**
```sql
-- Clean expired sessions
DELETE FROM user_sessions WHERE expires_at < NOW();

-- Clean old notifications
DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '30 days';
```

### Monitoring

Key metrics to monitor:
- Query performance (slow queries > 1s)
- Index usage (unused indexes)
- Connection pool utilization
- Cache hit ratios
- Disk space usage

## 🆘 Troubleshooting

### Common Issues

1. **Slow Queries**
   - Check `EXPLAIN ANALYZE` output
   - Verify appropriate indexes exist
   - Consider query rewriting

2. **Connection Issues**
   - Check connection pool settings
   - Verify SSL configuration
   - Monitor active connections

3. **Data Integrity**
   - Use foreign key constraints
   - Implement validation triggers
   - Regular consistency checks

### Emergency Procedures

1. **Database Recovery**
```bash
# Point-in-time recovery
pg_restore -d salestracker_production backup_file.dump
```

2. **Performance Emergency**
```sql
-- Kill long-running queries
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'active' AND query_start < NOW() - INTERVAL '5 minutes';
```

## 🔮 Future Enhancements

### Planned Features
- **Partitioning**: For high-volume activity tables
- **Read Replicas**: Geographic distribution
- **Advanced Analytics**: Machine learning integration
- **Real-time Sync**: WebSocket-based updates
- **Data Warehouse**: Separate OLAP system

### Scaling Roadmap
1. **Phase 1**: Read replicas and connection pooling
2. **Phase 2**: Table partitioning and archival
3. **Phase 3**: Microservices data architecture
4. **Phase 4**: Multi-region deployment

## 📞 Support

For database-related issues:
1. Check this documentation
2. Review query performance
3. Verify configuration settings
4. Contact the development team

## 📝 Contributing

When contributing database changes:
1. Follow naming conventions
2. Include proper indexes
3. Add appropriate documentation
4. Test thoroughly
5. Update this README if needed

---

**Last Updated**: December 2024  
**Database Version**: 1.0  
**PostgreSQL Version**: 13+