
#### 🏢 Team Management Endpoints (V2)

### GET /api/v2/teams
**Description**: Get all teams with optional filtering, pagination, and search  
**Query Parameters**:
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 50)
- `search`: Search term for team name/description
- `includeMembers`: Include team members (default: false)
- `isActive`: Filter by active status

### GET /api/v2/teams/{id}
**Description**: Get specific team by ID with detailed information  
**Path Parameters**: `id`

### POST /api/v2/teams
**Description**: Create a new team  
**Body**:
```json
{
  "name": "Sales Team North",
  "description": "Northern region sales team",
  "managerId": 1,
  "isActive": true
}
```

### PUT /api/v2/teams/{id}
**Description**: Update existing team  
**Path Parameters**: `id`  
**Body**: Same as POST

### DELETE /api/v2/teams/{id}
**Description**: Delete team by ID  
**Path Parameters**: `id`

### GET /api/v2/teams/{id}/members
**Description**: Get all members of a specific team  
**Path Parameters**: `id`

### POST /api/v2/teams/{id}/members
**Description**: Add member to team  
**Path Parameters**: `id`  
**Body**:
```json
{
  "userId": 1
}
```

### DELETE /api/v2/teams/{teamId}/members/{userId}
**Description**: Remove member from team  
**Path Parameters**: `teamId`, `userId`

---

## 📨 Invitation Management Endpoints (V2)

### POST /api/v2/invitations
**Description**: Send team invitation via email  
**Body**:
```json
{
  "email": "newuser@example.com",
  "teamId": 1,
  "role": "SalesRep",
  "message": "Welcome to our team!"
}
```

### GET /api/v2/invitations
**Description**: Get invitations with filtering  
**Query Parameters**:
- `status`: Filter by status (Pending, Accepted, Declined, Cancelled, Expired)
- `page`, `pageSize`: Pagination
- `invitedBy`: Filter by inviter user ID

### GET /api/v2/invitations/{id}
**Description**: Get specific invitation by ID  
**Path Parameters**: `id`

### PUT /api/v2/invitations/{id}/accept
**Description**: Accept team invitation  
**Path Parameters**: `id`  
**Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "password": "SecurePassword123!"
}
```

### PUT /api/v2/invitations/{id}/decline
**Description**: Decline team invitation  
**Path Parameters**: `id`

### DELETE /api/v2/invitations/{id}
**Description**: Cancel invitation (sender only)  
**Path Parameters**: `id`

### GET /api/v2/invitations/statistics
**Description**: Get invitation analytics and statistics

---

## 🔍 Advanced User Operations (V2)

### PUT /api/v2/users/{userId}/role
**Description**: Update user role  
**Body**:
```json
{
  "role": "SalesManager"
}
```

### PUT /api/v2/users/{userId}/team
**Description**: Assign user to team  
**Body**:
```json
{
  "teamId": 1
}
```

### POST /api/v2/users/{userId}/permissions
**Description**: Add user permission  
**Body**:
```json
{
  "permission": "ManageTeams",
  "scope": "Own"
}
```

### DELETE /api/v2/users/{userId}/permissions/{permissionId}
**Description**: Remove user permission  
**Path Parameters**: `userId`, `permissionId`

### PUT /api/v2/users/{userId}/region
**Description**: Assign user to region  
**Body**:
```json
{
  "regionId": 1,
  "isPrimary": true
}
```

### DELETE /api/v2/users/{userId}/region/{regionId}
**Description**: Remove user from region  
**Path Parameters**: `userId`, `regionId`

### PUT /api/v2/users/{userId}/product
**Description**: Assign user to product  
**Body**:
```json
{
  "productId": 1,
  "isPrimary": false
}
```

### DELETE /api/v2/users/{userId}/product/{productId}
**Description**: Remove user from product  
**Path Parameters**: `userId`, `productId`

### GET /api/v2/users/{userId}/assignments
**Description**: Get all user assignments (teams, regions, products)  
**Path Parameters**: `userId`

### PUT /api/v2/users/{userId}/profile
**Description**: Update user profile information  
**Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "555-0123"
}
```

### PUT /api/v2/users/{userId}/preferences
**Description**: Update user preferences  
**Body**:
```json
{
  "emailNotifications": true,
  "timezone": "UTC-5"
}
```

---

## 🔍 Advanced Search & Filtering (V2)

### POST /api/v2/search/users
**Description**: Advanced user search with complex filtering  
**Body**:
```json
{
  "query": "john",
  "filters": {
    "roles": ["SalesRep", "SalesManager"],
    "teams": [1, 2],
    "isActive": true
  },
  "sort": {
    "field": "firstName",
    "direction": "asc"
  },
  "pagination": {
    "page": 1,
    "pageSize": 20
  }
}
```

---

## 🔐 Permission Management (V2)

### GET /api/v2/permissions
**Description**: Get all available permissions and categories  

### POST /api/v2/permissions
**Description**: Create new permission  
**Body**:
```json
{
  "name": "ViewReports",
  "description": "View team reports",
  "category": "Reporting"
}
```

---

## 📊 Analytics & Reporting (V2)

### GET /api/v2/analytics/teams
**Description**: Get team analytics and performance metrics  
**Query Parameters**:
- `dateFrom`: Start date for analytics
- `dateTo`: End date for analytics
- `teamIds[]`: Specific team IDs to include
- `includeInactive`: Include inactive teams

### GET /api/v2/analytics/users
**Description**: Get user analytics and activity metrics  
**Query Parameters**:
- `dateFrom`: Start date for analytics
- `dateTo`: End date for analytics
- `userIds[]`: Specific user IDs to include
- `roles[]`: Filter by user roles
- `teamId`: Filter by team

### GET /api/v2/analytics/dashboard
**Description**: Get executive dashboard with summary analytics  

### GET /api/v2/analytics/performance
**Description**: Get performance metrics across teams and users  

### GET /api/v2/analytics/trends
**Description**: Get trend analysis and comparative data  

---

## 📝 Bulk Operations (V2)

### POST /api/v2/bulk/assign-team
**Description**: Bulk assign users to team  
**Body**:
```json
{
  "userIds": [1, 2, 3],
  "teamId": 1
}
```

### POST /api/v2/bulk/assign-region
**Description**: Bulk assign users to region  
**Body**:
```json
{
  "userIds": [1, 2, 3],
  "regionId": 1,
  "isPrimary": false
}
```

### POST /api/v2/bulk/assign-product
**Description**: Bulk assign users to product  
**Body**:
```json
{
  "userIds": [1, 2, 3],
  "productId": 1,
  "isPrimary": false
}
```

### POST /api/v2/bulk/assign-permissions
**Description**: Bulk assign permissions to users  
**Body**:
```json
{
  "userIds": [1, 2, 3],
  "permissions": ["ViewReports", "ManageTeams"]
}
```

### POST /api/v2/bulk/create-teams
**Description**: Bulk create multiple teams  
**Body**:
```json
{
  "teams": [
    {
      "name": "Sales Team East",
      "description": "Eastern region sales",
      "managerId": 1
    },
    {
      "name": "Sales Team West", 
      "description": "Western region sales",
      "managerId": 2
    }
  ]
}
```

### POST /api/v2/bulk/send-invitations
**Description**: Bulk send team invitations  
**Body**:
```json
{
  "invitations": [
    {
      "email": "user1@example.com",
      "teamId": 1,
      "role": "SalesRep"
    },
    {
      "email": "user2@example.com", 
      "teamId": 2,
      "role": "SalesRep"
    }
  ]
}
```

---

## 🛡️ Security & Audit Logging (V2)

### GET /api/v2/audit-logs
**Description**: Get comprehensive audit logs with filtering  
**Query Parameters**:
- `userId`: Filter by specific user
- `actionType`: Filter by action (CREATE, UPDATE, DELETE, ACCESS)
- `resourceType`: Filter by resource (USER, TEAM, PERMISSION)
- `resourceId`: Filter by specific resource ID
- `dateFrom`: Start date for logs
- `dateTo`: End date for logs
- `severity`: Filter by severity (INFO, WARNING, ERROR, CRITICAL)
- `ipAddress`: Filter by IP address
- `page`, `pageSize`: Pagination

### GET /api/v2/audit-logs/security-events
**Description**: Get security-specific audit events (Admin/Manager only)  
**Query Parameters**: Same as audit-logs

### GET /api/v2/audit-logs/user-timeline/{userId}
**Description**: Get chronological activity timeline for specific user  
**Path Parameters**: `userId`

### GET /api/v2/audit-logs/system-health
**Description**: Get system health metrics and monitoring data (Admin only)  

---

## Email System

The API includes a professional email system with CeedPods branding for:
- **Email Verification**: Welcome emails with verification links
- **Password Reset**: Secure password reset with tokens
- **Team Invitations**: Professional invitation emails with accept/decline links
- **Audit Notifications**: Security event notifications
- **Professional Templates**: HTML emails with CeedPods logo integration

**Logo URL**: `https://ceedpods.com/wp-content/uploads/2025/09/CeedPods-logo.png`

---

## Data Models

### Enums

**UserRole**: `SalesRep`, `SalesManager`, `Admin`  
**LeadStatus**: `New`, `Contacted`, `Qualified`, `Lost`, `Converted`  
**LeadSource**: `Website`, `Referral`, `Social`, `Email`, `Phone`, `Other`  
**ActivityType**: `Call`, `Email`, `Meeting`, `Task`, `Demo`, `Proposal`, `Follow_Up`, `Other`  
**ActivityStatus**: `Scheduled`, `In_Progress`, `Completed`, `Cancelled`, `Overdue`  
**ContactStatus**: `Active`, `Inactive`  
**NoteCategory**: `General`, `Important`, `Meeting`, `Call`, `Email`, `Follow_Up`, `Technical`, `Pricing`, `Other`  
**InvitationStatus**: `Pending`, `Accepted`, `Declined`, `Cancelled`, `Expired`  
**TeamMemberRole**: `Member`, `Lead`, `Manager`  
**AuditAction**: `Create`, `Update`, `Delete`, `Access`, `Login`, `Logout`  
**AuditSeverity**: `Info`, `Warning`, `Error`, `Critical`

### Common Response Format
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ },
  "errors": []
}
```

---
