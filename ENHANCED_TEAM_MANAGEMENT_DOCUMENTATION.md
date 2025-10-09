# Enhanced Team Management API Documentation

## 🎯 Overview

The Enhanced Team Management System provides strict role-based control and hierarchical ownership logic for enterprise-grade team organization. This system implements comprehensive tenant isolation, secure invitation workflows, and multi-team membership capabilities.

### Key Features
- **Strict Role-Based Access Control**: Admin → Manager → SalesRep hierarchy
- **Tenant Isolation**: Complete data segregation by AdminId
- **Secure Invitation System**: Token-based user activation with email integration
- **Multi-Team Membership**: Many-to-many team relationships
- **Product Inheritance**: Team-based product access control
- **Comprehensive Audit Logging**: Full activity tracking for compliance

## 🏗️ System Architecture

### Role Hierarchy
```
Admin (Level 1)
├── Can create users, teams, assign leaders
├── Define reporting hierarchies
├── Full system access within tenant
└── Manages entire organization

Manager (Level 2)
├── Team leadership capabilities
├── Can add members to assigned teams
├── Limited management within scope
└── Reports to Admin

SalesRep (Level 3)
├── Access to assigned teams only
├── Product access via team membership
├── Basic user operations
└── Reports to Manager
```

### Tenant Isolation Model
```
Tenant (Admin Organization)
├── AdminId: Primary tenant identifier
├── Users: All users belong to admin who created them
├── Teams: Team ownership by AdminId
├── Products: Product catalog per admin
├── Leads: Lead data scoped by AdminId
└── Contacts: Contact data scoped by AdminId
```

## 🔐 Authentication & Authorization

### JWT Token Structure
```json
{
  "nameid": "user_id",
  "email": "user@company.com",
  "role": "Admin|Manager|SalesRep",
  "admin_id": "tenant_admin_id",
  "manager_id": "reporting_manager_id",
  "exp": "expiration_timestamp"
}
```

### Authorization Levels
- **AdminOnly**: Admin role required
- **AdminOrManager**: Admin or Manager roles
- **Authenticated**: Any authenticated user (filtered by tenant)

## 📋 API Endpoints Reference

### 🔐 Authentication Endpoints

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "Admin123!"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "admin@company.com",
    "role": "Admin",
    "adminId": 1
  }
}
```

### 👥 Enhanced User Management

#### Invite User (Admin Only)
```http
POST /api/v2/enhanced-users/invite
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "email": "manager@company.com",
  "role": "Manager",
  "teamId": null,
  "invitationMessage": "Welcome to our team!"
}
```

**Response:**
```json
{
  "id": 123,
  "email": "manager@company.com",
  "role": "Manager",
  "invitationToken": "secure_token_here",
  "expiresAt": "2024-01-15T10:30:00Z",
  "status": "Pending"
}
```

#### Activate User Account
```http
POST /api/v2/enhanced-users/activate
Content-Type: application/json

{
  "token": "invitation_token_from_email",
  "firstName": "John",
  "lastName": "Manager",
  "username": "johnmanager",
  "password": "Manager123!",
  "phoneNumber": "+1-555-0200"
}
```

#### Get Users (Tenant Filtered)
```http
GET /api/v2/enhanced-users?page=1&pageSize=10&role=Manager&isActive=true
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "username": "admin",
      "firstName": "System",
      "lastName": "Administrator",
      "email": "admin@company.com",
      "role": "Admin",
      "adminId": 1,
      "managerId": null,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "totalCount": 1,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1
}
```

#### Assign Manager (Admin Only)
```http
PUT /api/v2/enhanced-users/{userId}/manager
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "managerId": 2
}
```

### 🏢 Enhanced Team Management

#### Create Team (Admin Only)
```http
POST /api/v2/enhanced-teams
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "name": "Enhanced Sales Team Alpha",
  "description": "High-performance sales team",
  "teamLeaderId": 2
}
```

**Response:**
```json
{
  "id": 10,
  "name": "Enhanced Sales Team Alpha",
  "description": "High-performance sales team",
  "adminId": 1,
  "teamLeaderId": 2,
  "isActive": true,
  "createdAt": "2024-01-01T10:30:00Z",
  "teamLeader": {
    "id": 2,
    "firstName": "John",
    "lastName": "Manager",
    "email": "manager@company.com"
  }
}
```

#### Get Teams (Tenant Filtered)
```http
GET /api/v2/enhanced-teams?page=1&pageSize=10&isActive=true
Authorization: Bearer {jwt_token}
```

#### Assign Team Leader (Admin Only)
```http
POST /api/v2/enhanced-teams/{teamId}/assign-leader
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "teamLeaderId": 2
}
```

#### Add Team Member
```http
POST /api/v2/enhanced-teams/{teamId}/members
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "userId": 3,
  "role": "SalesRep"
}
```

#### Get Team Users
```http
GET /api/v2/enhanced-teams/{teamId}/users
Authorization: Bearer {jwt_token}
```

### 📨 Invitation System

#### Send Team Invitation
```http
POST /api/v2/invitations/send
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "email": "salesrep@company.com",
  "role": "SalesRep",
  "teamId": 10,
  "invitationMessage": "Join our enhanced sales team!"
}
```

#### Get Invitations
```http
GET /api/v2/invitations?status=Pending&page=1&pageSize=10
Authorization: Bearer {jwt_token}
```

#### Accept Invitation
```http
POST /api/v2/invitations/{invitationId}/accept
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "SalesRep",
  "username": "janesalesrep",
  "password": "SalesRep123!",
  "phoneNumber": "+1-555-0300"
}
```

#### Decline Invitation
```http
POST /api/v2/invitations/{invitationId}/decline
Content-Type: application/json

{
  "reason": "Position not suitable at this time"
}
```

#### Resend Invitation
```http
POST /api/v2/invitations/{invitationId}/resend
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "invitationMessage": "Resending invitation - please join our team!"
}
```

### 📊 Analytics & Reporting

#### Team Analytics
```http
GET /api/v2/analytics/teams?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "totalTeams": 5,
  "activeTeams": 4,
  "teamPerformance": [
    {
      "teamId": 10,
      "teamName": "Enhanced Sales Team Alpha",
      "memberCount": 8,
      "leadsGenerated": 150,
      "conversionRate": 0.25,
      "revenue": 125000.00
    }
  ],
  "averageTeamSize": 6.4,
  "totalRevenue": 500000.00
}
```

#### User Analytics
```http
GET /api/v2/analytics/users?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {jwt_token}
```

#### Dashboard Metrics
```http
GET /api/v2/analytics/dashboard
Authorization: Bearer {jwt_token}
```

### 🔍 Advanced Search & Operations

#### Advanced User Search
```http
GET /api/v2/advanced-search/users?role=Manager&isActive=true&hasTeam=true
Authorization: Bearer {jwt_token}
```

#### Bulk Create Users
```http
POST /api/v2/bulk/users
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "users": [
    {
      "username": "bulkuser1",
      "firstName": "Bulk",
      "lastName": "User One",
      "email": "bulkuser1@company.com",
      "password": "BulkUser123!",
      "role": "SalesRep",
      "phoneNumber": "+1-555-0401"
    }
  ]
}
```

#### Bulk Team Assignments
```http
POST /api/v2/bulk/teams/assign
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "assignments": [
    {
      "userId": 3,
      "teamId": 10,
      "role": "SalesRep"
    }
  ]
}
```

### 🔒 Permissions & Audit

#### Get Available Permissions
```http
GET /api/v2/permissions
Authorization: Bearer {jwt_token}
```

#### Create Custom Permission
```http
POST /api/v2/permissions
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "name": "CustomTeamAccess",
  "description": "Custom permission for team access",
  "scope": "Team",
  "actions": ["Read", "Write"]
}
```

#### Get Audit Logs
```http
GET /api/v2/audit-logs?startDate=2024-01-01&endDate=2024-12-31&page=1&pageSize=50
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "data": [
    {
      "id": 1001,
      "userId": 1,
      "action": "CreateTeam",
      "entityType": "Team",
      "entityId": 10,
      "details": "Created team 'Enhanced Sales Team Alpha'",
      "ipAddress": "192.168.1.100",
      "userAgent": "PostmanRuntime/7.29.0",
      "timestamp": "2024-01-01T10:30:00Z"
    }
  ],
  "totalCount": 1,
  "page": 1,
  "pageSize": 50
}
```

#### Get User Activity Audit
```http
GET /api/v2/audit-logs/user/{userId}?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {jwt_token}
```

## 🔒 Security Features

### Tenant Isolation
- **AdminId Foreign Key**: All entities include AdminId for tenant separation
- **Automatic Filtering**: All queries automatically filtered by current user's AdminId
- **JWT Claims**: Admin context included in all authenticated requests
- **Data Segregation**: Complete isolation between different admin organizations

### Role-Based Access Control
- **Endpoint Protection**: Role-specific authorization on all endpoints
- **Hierarchical Permissions**: Admin > Manager > SalesRep access levels
- **Scope Validation**: Operations limited to user's authorized scope
- **Cross-Tenant Prevention**: No access to other admin's data

### Security Measures
- **Token Expiration**: JWT tokens expire for security
- **Password Security**: Strong password requirements enforced
- **Email Verification**: Secure email-based account activation
- **Audit Logging**: Comprehensive activity tracking
- **Rate Limiting**: API rate limiting for abuse prevention

## 🗄️ Database Schema

### Core Tables

#### Users Table
```sql
CREATE TABLE Users (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(50) NOT NULL UNIQUE,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    PhoneNumber VARCHAR(20),
    PasswordHash VARCHAR(255) NOT NULL,
    Role ENUM('Admin', 'Manager', 'SalesRep') NOT NULL,
    AdminId INT, -- Tenant isolation
    ManagerId INT, -- Reporting hierarchy
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt DATETIME NOT NULL,
    UpdatedAt DATETIME NOT NULL,
    
    INDEX idx_users_admin_id (AdminId),
    INDEX idx_users_manager_id (ManagerId),
    FOREIGN KEY (AdminId) REFERENCES Users(Id),
    FOREIGN KEY (ManagerId) REFERENCES Users(Id)
);
```

#### Teams Table
```sql
CREATE TABLE Teams (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    AdminId INT NOT NULL, -- Tenant isolation
    TeamLeaderId INT, -- Manager assignment
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt DATETIME NOT NULL,
    UpdatedAt DATETIME NOT NULL,
    
    INDEX idx_teams_admin_id (AdminId),
    INDEX idx_teams_leader_id (TeamLeaderId),
    FOREIGN KEY (AdminId) REFERENCES Users(Id),
    FOREIGN KEY (TeamLeaderId) REFERENCES Users(Id)
);
```

#### TeamMembers Table (Many-to-Many)
```sql
CREATE TABLE TeamMembers (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    TeamId INT NOT NULL,
    UserId INT NOT NULL,
    Role VARCHAR(50),
    JoinedAt DATETIME NOT NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    
    UNIQUE KEY unique_team_user (TeamId, UserId),
    INDEX idx_teammembers_team_id (TeamId),
    INDEX idx_teammembers_user_id (UserId),
    FOREIGN KEY (TeamId) REFERENCES Teams(Id) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);
```

#### TeamInvitations Table
```sql
CREATE TABLE TeamInvitations (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    TeamId INT,
    Email VARCHAR(255) NOT NULL,
    Role ENUM('Manager', 'SalesRep') NOT NULL,
    AdminId INT NOT NULL, -- Tenant isolation
    Status ENUM('Pending', 'Accepted', 'Declined', 'Expired', 'Cancelled') DEFAULT 'Pending',
    InvitedByUserId INT NOT NULL,
    InvitationMessage TEXT,
    InvitationToken VARCHAR(255) NOT NULL UNIQUE,
    ExpiresAt DATETIME NOT NULL,
    AcceptedAt DATETIME,
    CreatedAt DATETIME NOT NULL,
    UpdatedAt DATETIME NOT NULL,
    
    INDEX idx_invitations_admin_id (AdminId),
    INDEX idx_invitations_team_id (TeamId),
    INDEX idx_invitations_token (InvitationToken),
    FOREIGN KEY (AdminId) REFERENCES Users(Id),
    FOREIGN KEY (TeamId) REFERENCES Teams(Id),
    FOREIGN KEY (InvitedByUserId) REFERENCES Users(Id)
);
```

#### Products Table
```sql
CREATE TABLE Products (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Code VARCHAR(50) NOT NULL,
    Description TEXT,
    Category VARCHAR(100),
    Price DECIMAL(10,2),
    AdminId INT NOT NULL, -- Tenant isolation
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt DATETIME NOT NULL,
    UpdatedAt DATETIME NOT NULL,
    
    INDEX idx_products_admin_id (AdminId),
    FOREIGN KEY (AdminId) REFERENCES Users(Id)
);
```

#### TeamProducts Table (Many-to-Many)
```sql
CREATE TABLE TeamProducts (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    TeamId INT NOT NULL,
    ProductId INT NOT NULL,
    AssignedAt DATETIME NOT NULL,
    
    UNIQUE KEY unique_team_product (TeamId, ProductId),
    INDEX idx_teamproducts_team_id (TeamId),
    INDEX idx_teamproducts_product_id (ProductId),
    FOREIGN KEY (TeamId) REFERENCES Teams(Id) ON DELETE CASCADE,
    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE
);
```

## 🔧 Configuration

### JWT Configuration
```json
{
  "Jwt": {
    "Key": "your-secret-key-here",
    "Issuer": "ST_Backend",
    "Audience": "ST_Backend_Users",
    "ExpiryMinutes": 60
  }
}
```

### Email Configuration
```json
{
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "SmtpPort": 587,
    "EnableSsl": true,
    "Username": "your-email@gmail.com",
    "Password": "your-app-password"
  }
}
```

### Database Configuration
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "server=localhost;database=st_backend;user=root;password=your-password;"
  }
}
```

## 🧪 Testing Guide

### Postman Collection Usage

1. **Import Collection**: Import `Enhanced_Team_Management_API_Collection.postman_collection.json`
2. **Set Environment Variables**:
   - `baseUrl`: `http://localhost:5555`
   - Other variables are auto-populated during testing

3. **Testing Sequence**:
   1. **Authentication**: Login as Admin to get JWT token
   2. **User Management**: Test user invitation and activation
   3. **Team Management**: Create teams and assign members
   4. **Security Testing**: Validate role-based access and tenant isolation

### Security Testing

#### Test Unauthorized Access
```bash
curl -X GET "http://localhost:5555/api/v2/enhanced-teams"
# Expected: 401 Unauthorized
```

#### Test Role-Based Access
```bash
curl -X POST "http://localhost:5555/api/v2/enhanced-users/invite" \
  -H "Authorization: Bearer {salesrep_token}" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@company.com","role":"SalesRep"}'
# Expected: 403 Forbidden (SalesRep cannot invite users)
```

#### Test Tenant Isolation
```bash
curl -X GET "http://localhost:5555/api/v2/enhanced-users" \
  -H "Authorization: Bearer {admin1_token}"
# Should only return users belonging to admin1's organization
```

## 📈 Performance Considerations

### Database Optimization
- **Indexes**: All AdminId columns indexed for fast tenant filtering
- **Query Optimization**: Automatic AdminId filtering prevents full table scans
- **Connection Pooling**: Entity Framework connection pooling configured

### Caching Strategy
- **JWT Token Caching**: In-memory token validation caching
- **User Context Caching**: Admin context cached per request
- **Static Data Caching**: Permissions and roles cached

### Monitoring
- **Response Time Monitoring**: All endpoints monitored for performance
- **Error Rate Tracking**: 4xx and 5xx responses tracked
- **Audit Log Performance**: Optimized audit logging for minimal impact

## 🚀 Deployment Guide

### Production Deployment
1. **Database Migration**: Run Entity Framework migrations
2. **Environment Configuration**: Set production connection strings and JWT keys
3. **Email Configuration**: Configure SMTP settings for production
4. **Security Headers**: Enable security headers middleware
5. **Rate Limiting**: Configure rate limiting for production load

### Monitoring Setup
- **Application Insights**: Configure for production monitoring
- **Health Checks**: Enable health check endpoints
- **Logging**: Configure structured logging for production

## 📞 Support & Troubleshooting

### Common Issues

#### Migration Errors
```bash
# Reset migrations if needed
dotnet ef database drop
dotnet ef migrations remove
dotnet ef migrations add InitialCreate
dotnet ef database update
```

#### Authentication Issues
- Verify JWT key configuration
- Check token expiration
- Validate role claims in token

#### Tenant Isolation Issues
- Verify AdminId is set on all entities
- Check repository filtering implementation
- Validate JWT admin_id claim

### Contact Information
- **Development Team**: Enhanced Team Management System
- **Documentation**: This comprehensive guide
- **API Collection**: Postman collection included for testing

---

**Enhanced Team Management System v2.0** - Production Ready