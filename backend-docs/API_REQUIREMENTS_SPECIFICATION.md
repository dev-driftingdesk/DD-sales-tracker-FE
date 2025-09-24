# SalesTracker API Requirements Specification

## Executive Summary

This document provides comprehensive API specifications for the SalesTracker CRM backend implementation. Based on analysis of the existing frontend codebase, 73 REST API endpoints across 11 modules have been identified and formally specified.

**System Overview:**
- **Technology Stack:** React.js frontend with Zustand state management, .NET 9.0.304 Web API backend
- **Architecture:** Module-based CRM system with comprehensive analytics using ASP.NET Core controllers
- **Current State:** Mock data implementation requiring .NET Web API backend integration
- **Target:** Full ASP.NET Core Web API backend with JWT authentication, SignalR real-time features, and external integrations

---

## Table of Contents

1. [Authentication Module](#1-authentication-module) - 6 endpoints
2. [Lead Management Module](#2-lead-management-module) - 12 endpoints  
3. [CRM Core Module](#3-crm-core-module) - 16 endpoints
4. [Performance Analytics Module](#4-performance-analytics-module) - 8 endpoints
5. [Email Management Module](#5-email-management-module) - 7 endpoints
6. [Lead Routing Module](#6-lead-routing-module) - 6 endpoints
7. [Notifications Module](#7-notifications-module) - 6 endpoints
8. [Team Management Module](#8-team-management-module) - 4 endpoints
9. [POS System Module](#9-pos-system-module) - 3 endpoints
10. [Integration Module](#10-integration-module) - 3 endpoints
11. [Assistant Module](#11-assistant-module) - 2 endpoints

---

## Global API Specifications

### Base URL Structure
```
Production: https://api.salestracker.com/api/v1
Development: https://dev-api.salestracker.com/api/v1
Local: https://localhost:7001/api/v1
```

### Authentication Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
```

### Standard Response Format
```json
{
  "Success": true|false,
  "Data": <response_data>,
  "Message": "Human readable message",
  "Errors": null|[<validation_error_objects>],
  "Meta": {
    "Timestamp": "2025-01-15T10:30:00Z",
    "Version": "1.0.0",
    "RequestId": "req_123456789"
  }
}
```

### ASP.NET Core Error Response Format (ProblemDetails)
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Validation Error",
  "status": 400,
  "detail": "One or more validation errors occurred.",
  "instance": "/api/v1/leads",
  "traceId": "00-trace-id-00",
  "errors": {
    "Email": ["The Email field is required.", "Email must be in valid format"],
    "DealValue": ["Deal value must be greater than 0"]
  }
}
```

### Standard Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing authentication)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate resource)
- `422` - Unprocessable Entity (business logic errors)
- `500` - Internal Server Error
- `503` - Service Unavailable (maintenance mode)

---

## 1. Authentication Module

**Priority:** Critical (Priority 1)  
**Endpoints:** 6  
**Authentication:** Public (login/register) and JWT-protected  

### 1.1 User Login

**Endpoint:** `POST /api/v1/auth/login`  
**Authentication:** Public  
**Purpose:** Authenticate user and return JWT token  
**Controller:** `AuthController.Login`

**Request Model (LoginRequest):**
```csharp
public class LoginRequest
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Email must be in valid format")]
    public string Email { get; set; }
    
    [Required(ErrorMessage = "Password is required")]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters")]
    public string Password { get; set; }
    
    public bool RememberMe { get; set; } = false;
}
```

**Response Model:**
```json
{
  "Success": true,
  "Data": {
    "User": {
      "Id": "Guid",
      "Email": "string",
      "Name": "string", 
      "Role": "Admin|Manager|SalesRep",
      "Avatar": "string|null",
      "CreatedAt": "DateTime",
      "Permissions": ["string"],
      "Preferences": {
        "Theme": "Light|Dark",
        "Language": "string",
        "Timezone": "string"
      }
    },
    "Token": "string (JWT)",
    "RefreshToken": "string",
    "ExpiresIn": 86400
  }
}
```

**Validation Rules:**
- Email must be valid format and exist in system
- Password must match stored bcrypt hash
- Account must be active (not suspended/deleted)
- Rate limit: 5 attempts per minute per IP

**Error Scenarios:**
- `401`: Invalid email/password combination
- `423`: Account locked due to multiple failed attempts  
- `403`: Account suspended or deactivated

### 1.2 User Registration

**Endpoint:** `POST /api/v1/auth/register`  
**Authentication:** Public  
**Purpose:** Create new user account with email verification  
**Controller:** `AuthController.Register`

**Request Model (RegisterRequest):**
```csharp
public class RegisterRequest
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Email must be in valid format")]
    public string Email { get; set; }

    [Required(ErrorMessage = "Password is required")]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)", 
        ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, and one number")]
    public string Password { get; set; }

    [Required(ErrorMessage = "Name is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters")]
    public string Name { get; set; }

    [StringLength(200, ErrorMessage = "Company name cannot exceed 200 characters")]
    public string? Company { get; set; }

    [Phone(ErrorMessage = "Invalid phone format")]
    public string? Phone { get; set; }

    public string Role { get; set; } = "SalesRep";
}
```

**Response Model:**
```json
{
  "Success": true,
  "Data": {
    "User": {
      "Id": "Guid",
      "Email": "string",
      "Name": "string",
      "Role": "SalesRep",
      "Avatar": null,
      "CreatedAt": "DateTime",
      "EmailVerified": false
    },
    "Token": "string (JWT)",
    "VerificationEmailSent": true
  }
}
```

**Business Logic:**
- Auto-assign default role "sales_rep"
- Send email verification link
- Create default user preferences
- Generate welcome notification

**Validation Rules:**
- Email must be unique across system
- Password: minimum 8 characters, mix of letters/numbers
- Name: required, trimmed, no special characters
- Phone: optional international format validation

### 1.3 Password Reset Request

**Endpoint:** `POST /api/v1/auth/reset-password`  
**Authentication:** Public  
**Purpose:** Send password reset link to user email  
**Controller:** `AuthController.RequestPasswordReset`

**Request Model (PasswordResetRequest):**
```csharp
public class PasswordResetRequest
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Email must be in valid format")]
    public string Email { get; set; }
}
```

**Response Model:**
```json
{
  "Success": true,
  "Data": {
    "Message": "Password reset link sent to your email",
    "EmailSent": true,
    "ExpiresIn": 3600
  }
}
```

**Business Logic:**
- Generate secure reset token (expires in 1 hour)
- Send email with reset link
- Rate limit: 1 request per 5 minutes per email
- Always return success (even for non-existent emails)

### 1.4 Password Reset Confirmation

**Endpoint:** `POST /api/v1/auth/reset-password/confirm`  
**Authentication:** Public  
**Purpose:** Complete password reset with token  
**Controller:** `AuthController.ConfirmPasswordReset`

**Request Model (PasswordResetConfirmRequest):**
```csharp
public class PasswordResetConfirmRequest
{
    [Required(ErrorMessage = "Token is required")]
    public string Token { get; set; }

    [Required(ErrorMessage = "New password is required")]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)", 
        ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, and one number")]
    public string NewPassword { get; set; }
}
```

**Response Model:**
```json
{
  "Success": true,
  "Data": {
    "Message": "Password updated successfully",
    "LoginRequired": true
  }
}
```

**Business Logic:**
- Validate reset token (not expired/used)
- Hash new password with bcrypt
- Invalidate all existing user sessions
- Log security event

### 1.5 Token Refresh

**Endpoint:** `POST /api/v1/auth/refresh`  
**Authentication:** Refresh token required  
**Purpose:** Get new JWT token using refresh token  
**Controller:** `AuthController.RefreshToken`

**Request Model (RefreshTokenRequest):**
```csharp
public class RefreshTokenRequest
{
    [Required(ErrorMessage = "Refresh token is required")]
    public string RefreshToken { get; set; }
}
```

**Response Model:**
```json
{
  "Success": true,
  "Data": {
    "Token": "string (new JWT)",
    "ExpiresIn": 86400
  }
}
```

**Business Logic:**
- Validate refresh token
- Issue new JWT with extended expiry
- Optionally rotate refresh token

### 1.6 User Logout

**Endpoint:** `POST /api/v1/auth/logout`  
**Authentication:** JWT required  
**Purpose:** Invalidate user session and tokens  
**Controller:** `AuthController.Logout`

**Request Model (LogoutRequest):**
```csharp
public class LogoutRequest
{
    public bool AllDevices { get; set; } = false;
}
```

**Response Model:**
```json
{
  "Success": true,
  "Data": {
    "Message": "Logout successful",
    "TokensInvalidated": 1
  }
}
```

**Business Logic:**
- Add JWT to blacklist until expiry
- If allDevices=true, invalidate all user refresh tokens
- Log logout event

---

## 2. Lead Management Module

**Priority:** Critical (Priority 1)  
**Endpoints:** 12  
**Authentication:** JWT required  
**Complex Analytics:** Lead scoring, aging analysis, conversion tracking  

### 2.1 Get Leads List

**Endpoint:** `GET /api/v1/leads`  
**Authentication:** JWT required  
**Purpose:** Retrieve paginated list of leads with filtering and search  
**Controller:** `LeadsController.GetLeads`

**Query Parameters:**
```
?Page=1&Limit=25&Status=All&Source=All&AssignedTo=All&Search=string
&SortBy=CreatedAt&SortOrder=Desc&Tags=tag1,tag2&DateRange=30d
&MinValue=0&MaxValue=1000000&Language=All&Location=string
```

**Response Model:**
```json
{
  "Success": true,
  "Data": {
    "Leads": [
      {
        "Id": "Guid",
        "CompanyName": "string",
        "ContactName": "string", 
        "Email": "string",
        "Phone": "string",
        "Location": "string",
        "Source": "Website|Facebook|Instagram|WhatsApp|Email|Event|Manual|Referral|ColdCall|LinkedIn",
        "Status": "New|Contacted|InProgress|Won|Lost",
        "Language": "string",
        "ProductInterest": "string",
        "DealValue": "decimal",
        "ClosedValue": "decimal?",
        "AssignedTo": "Guid?",
        "Tags": ["string"],
        "Notes": "string",
        "CreatedAt": "DateTime",
        "UpdatedAt": "DateTime",
        "ClosedDate": "DateTime?",
        "LostReason": "string",
        "LastActivity": "string",
        "ActivitiesCount": "int",
        "TeamMembers": ["Guid"],
        "CustomFields": "object"
      }
    ],
    "Pagination": {
      "Page": 1,
      "Limit": 25,
      "Total": 150,
      "TotalPages": 6,
      "HasNext": true,
      "HasPrev": false
    },
    "Aggregations": {
      "TotalValue": 2500000.00,
      "AverageValue": 16666.67,
      "StatusCounts": {
        "New": 45,
        "Contacted": 32,
        "InProgress": 28,
        "Won": 35,
        "Lost": 10
      }
    }
  }
}
```

**Business Logic:**
- Filter by user permissions (sales_rep sees assigned leads only)
- Support complex filtering combinations  
- Calculate real-time aggregations
- Include activity summaries for performance

### 2.2 Create New Lead

**Endpoint:** `POST /api/v1/leads`  
**Authentication:** JWT required  
**Purpose:** Create new lead with automatic lead scoring and routing  
**Controller:** `LeadsController.CreateLead`

**Request Model (CreateLeadRequest):**
```csharp
public class CreateLeadRequest
{
    [Required(ErrorMessage = "Company name is required")]
    [StringLength(200, ErrorMessage = "Company name cannot exceed 200 characters")]
    public string CompanyName { get; set; }

    [Required(ErrorMessage = "Contact name is required")]
    [StringLength(100, ErrorMessage = "Contact name cannot exceed 100 characters")]
    public string ContactName { get; set; }

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Email must be in valid format")]
    public string Email { get; set; }

    [Phone(ErrorMessage = "Invalid phone format")]
    public string? Phone { get; set; }

    [StringLength(200, ErrorMessage = "Location cannot exceed 200 characters")]
    public string? Location { get; set; }

    [Required(ErrorMessage = "Source is required")]
    public LeadSource Source { get; set; }

    public string Language { get; set; } = "English";

    [StringLength(500, ErrorMessage = "Product interest cannot exceed 500 characters")]
    public string? ProductInterest { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Deal value must be greater than or equal to 0")]
    public decimal? DealValue { get; set; }

    public Guid? AssignedTo { get; set; }

    [MaxLength(10, ErrorMessage = "Maximum 10 tags allowed")]
    public List<string>? Tags { get; set; }

    [StringLength(2000, ErrorMessage = "Notes cannot exceed 2000 characters")]
    public string? Notes { get; set; }

    public object? CustomFields { get; set; }
}

public enum LeadSource
{
    Website, Facebook, Instagram, WhatsApp, Email, Event, Manual, Referral, ColdCall, LinkedIn
}
```

**Response Model:**
```json
{
  "Success": true,
  "Data": {
    "Lead": {
      "Id": "Guid",
      "CompanyName": "string",
      "ContactName": "string",
      "Email": "string",
      "Phone": "string",
      "Location": "string", 
      "Source": "Website|Facebook|Instagram|WhatsApp|Email|Event|Manual|Referral|ColdCall|LinkedIn",
      "Status": "New",
      "Language": "string",
      "ProductInterest": "string",
      "DealValue": "decimal",
      "AssignedTo": "Guid?",
      "Tags": ["string"],
      "Notes": "string",
      "CreatedAt": "DateTime",
      "UpdatedAt": "DateTime",
      "LeadScore": "int (0-100)",
      "RoutingRecommendation": {
        "SuggestedAssignee": "Guid?",
        "Confidence": "double (0-1)",
        "Reasons": ["string"]
      }
    },
    "Notifications": {
      "AssigneeNotified": "bool",
      "RoutingApplied": "bool"
    }
  }
}
```

**Business Logic:**
- Auto-calculate lead quality score using AI scoring engine
- Apply intelligent routing if not manually assigned
- Duplicate detection based on email/phone
- Generate automatic activity: "Lead Created"
- Trigger notifications to assigned user
- Apply data enrichment from external sources

**Validation Rules:**
- Email uniqueness check with fuzzy matching
- Phone number formatting and validation
- Deal value must be positive number
- Assigned user must exist and have capacity

### 2.3 Get Single Lead

**Endpoint:** `GET /leads/{id}`  
**Authentication:** JWT required  
**Purpose:** Retrieve detailed lead information with full activity history  

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "lead": {
      "id": "string",
      "companyName": "string",
      "contactName": "string",
      "email": "string",
      "phone": "string",
      "location": "string",
      "source": "string",
      "status": "string", 
      "language": "string",
      "productInterest": "string",
      "dealValue": "number",
      "closedValue": "number|null",
      "assignedTo": "string|null",
      "tags": ["string"],
      "notes": "string",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601", 
      "closedDate": "ISO8601|null",
      "lostReason": "string|null",
      "lastActivity": "string|null",
      "leadScore": "number",
      "customFields": "object",
      "activities": [
        {
          "id": "string",
          "type": "call|email|meeting|note|status_change|follow_up",
          "description": "string",
          "user": "string",
          "userId": "string",
          "createdAt": "ISO8601",
          "timestamp": "ISO8601", 
          "isFromLead": "boolean",
          "isResponse": "boolean",
          "metadata": {
            "duration": "string",
            "outcome": "string", 
            "responseTime": "string",
            "subject": "string",
            "attachments": ["string"]
          }
        }
      ],
      "teamMembers": [
        {
          "userId": "string",
          "role": "owner|collaborator|viewer",
          "addedAt": "ISO8601",
          "user": {
            "id": "string",
            "name": "string",
            "avatar": "string"
          }
        }
      ],
      "metrics": {
        "timeToFirstContact": "number|null (minutes)",
        "averageResponseTime": "number|null (minutes)", 
        "totalActivities": "number",
        "daysSinceCreated": "number",
        "daysSinceLastActivity": "number|null"
      }
    }
  }
}
```

**Business Logic:**
- Calculate real-time metrics (TTFC, response times)
- Include activity timeline with user context
- Show team collaboration details
- Apply permission-based field filtering

### 2.4 Update Lead

**Endpoint:** `PUT /leads/{id}`  
**Authentication:** JWT required  
**Purpose:** Update lead information with automatic activity logging  

**Request Schema:**
```json
{
  "companyName": "string (optional, max: 200)",
  "contactName": "string (optional, max: 100)",
  "email": "string (optional, email format)",
  "phone": "string (optional, phone format)",
  "location": "string (optional, max: 200)",
  "status": "string (optional, enum values)",
  "language": "string (optional)",
  "productInterest": "string (optional, max: 500)",
  "dealValue": "number (optional, min: 0)",
  "closedValue": "number (optional, min: 0)",
  "assignedTo": "string (optional, user ID)",
  "tags": ["string"] (optional, max: 10),
  "notes": "string (optional, max: 2000)",
  "lostReason": "string (optional, max: 500)",
  "customFields": "object (optional)"
}
```

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "lead": "<updated_lead_object>",
    "changes": {
      "field": "old_value -> new_value"
    },
    "generatedActivities": [
      {
        "type": "status_change|assignment_change|value_change",
        "description": "string",
        "metadata": "object"
      }
    ]
  }
}
```

**Business Logic:**
- Track all field changes for audit trail
- Auto-generate activities for significant changes
- Recalculate lead score if relevant fields changed
- Send notifications for assignment changes
- Handle status change business logic (won/lost processing)
- Update related deal records when status changes

### 2.5 Delete Lead

**Endpoint:** `DELETE /leads/{id}`  
**Authentication:** JWT required (admin/manager only)  
**Purpose:** Soft delete lead (archive) or hard delete with confirmation  

**Query Parameters:**
```
?hard=false&confirm=false
```

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "message": "Lead archived successfully",
    "leadId": "string",
    "deletedAt": "ISO8601",
    "recoverable": true
  }
}
```

**Business Logic:**
- Default: soft delete (set deleted_at timestamp)
- Hard delete: requires admin role + confirmation
- Remove from active reporting but preserve historical data
- Cancel pending notifications and tasks

### 2.6 Add Activity

**Endpoint:** `POST /leads/{id}/activities`  
**Authentication:** JWT required  
**Purpose:** Log new activity/interaction with lead  

**Request Schema:**
```json
{
  "type": "call|email|meeting|note|follow_up|demo|proposal|quote|contract|task|reminder (required)",
  "description": "string (required, max: 2000)",
  "isFromLead": "boolean (optional, default: false)",
  "isResponse": "boolean (optional, default: false)",
  "metadata": {
    "duration": "string (optional)",
    "outcome": "string (optional)",
    "subject": "string (optional)",
    "priority": "low|normal|high|urgent (optional)",
    "category": "string (optional)",
    "tags": ["string"] (optional),
    "attachments": ["string"] (optional),
    "scheduledFor": "ISO8601 (optional, for future tasks)"
  }
}
```

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "activity": {
      "id": "string",
      "leadId": "string",
      "type": "string",
      "description": "string",
      "user": "string",
      "userId": "string",
      "createdAt": "ISO8601",
      "timestamp": "ISO8601",
      "isFromLead": "boolean",
      "isResponse": "boolean",
      "metadata": "object"
    },
    "leadUpdated": {
      "lastActivity": "string",
      "updatedAt": "ISO8601"
    }
  }
}
```

**Business Logic:**
- Auto-assign current user as activity owner
- Update lead's lastActivity field
- Calculate response times if isResponse=true
- Schedule follow-up reminders if needed
- Integrate with email/calendar systems for relevant types

### 2.7 Get Lead Activities

**Endpoint:** `GET /leads/{id}/activities`  
**Authentication:** JWT required  
**Purpose:** Retrieve paginated activity history for specific lead  

**Query Parameters:**
```
?page=1&limit=20&type=all&dateFrom=ISO8601&dateTo=ISO8601
&user=userId&sortBy=timestamp&sortOrder=desc
```

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "string",
        "type": "string",
        "description": "string",
        "user": "string",
        "userId": "string", 
        "createdAt": "ISO8601",
        "timestamp": "ISO8601",
        "isFromLead": "boolean",
        "isResponse": "boolean",
        "metadata": "object"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    },
    "summary": {
      "totalActivities": 45,
      "callCount": 12,
      "emailCount": 18,
      "meetingCount": 5,
      "noteCount": 10,
      "averageResponseTime": 120
    }
  }
}
```

### 2.8 Bulk Operations

**Endpoint:** `POST /leads/bulk`  
**Authentication:** JWT required  
**Purpose:** Perform bulk operations on multiple leads  

**Request Schema:**
```json
{
  "action": "assign|update_status|add_tags|remove_tags|delete",
  "leadIds": ["string"] (required, max: 100),
  "data": {
    "assignedTo": "string (for assign action)",
    "status": "string (for update_status action)",
    "tags": ["string"] (for tag actions)"
  }
}
```

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "processed": 45,
    "successful": 43,
    "failed": 2,
    "results": [
      {
        "leadId": "string",
        "success": true,
        "message": "string",
        "error": null
      }
    ]
  }
}
```

### 2.9 Lead Analytics

**Endpoint:** `GET /leads/analytics`  
**Authentication:** JWT required  
**Purpose:** Get comprehensive lead analytics and metrics  

**Query Parameters:**
```
?timeframe=7d&assignee=all&source=all&status=all
&groupBy=source&includeMetrics=conversion,aging,activity
```

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalLeads": 150,
      "newLeads": 25,
      "convertedLeads": 35,
      "lostLeads": 8,
      "conversionRate": 23.3,
      "averageLeadValue": 16666,
      "totalPipelineValue": 2500000
    },
    "conversionMetrics": {
      "overallRate": 23.3,
      "bySource": [
        {"source": "website", "rate": 28.5, "total": 40, "converted": 11},
        {"source": "referral", "rate": 45.0, "total": 20, "converted": 9}
      ],
      "byAssignee": [
        {"assignee": "user-1", "rate": 32.1, "total": 25, "converted": 8}
      ]
    },
    "agingMetrics": {
      "averageAge": 12.5,
      "criticalLeads": 8,
      "staleLeads": 15,
      "ageDistribution": {
        "0-7": 45,
        "8-14": 32,
        "15-30": 28,
        "31+": 10
      }
    },
    "activityMetrics": {
      "averageTTFC": 180,
      "averageResponseTime": 240,
      "totalActivities": 450,
      "activitiesPerLead": 3.2
    },
    "trends": {
      "leadCreationTrend": [
        {"date": "2025-01-01", "count": 5},
        {"date": "2025-01-02", "count": 8}
      ],
      "conversionTrend": [
        {"date": "2025-01-01", "rate": 22.1},
        {"date": "2025-01-02", "rate": 25.3}
      ]
    }
  }
}
```

### 2.10 Lead Notes Management

**Endpoint:** `POST /leads/{id}/notes`  
**Authentication:** JWT required  
**Purpose:** Add structured note to lead with advanced properties  

**Request Schema:**
```json
{
  "content": "string (required, max: 5000)",
  "category": "general|meeting_notes|call_summary|research|internal (optional)",
  "priority": "low|normal|high|urgent (optional, default: normal)",
  "tags": ["string"] (optional, max: 5),
  "isPrivate": "boolean (optional, default: false)"
}
```

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "note": {
      "id": "string",
      "content": "string",
      "category": "string",
      "priority": "string",
      "tags": ["string"],
      "isPrivate": "boolean",
      "author": "string",
      "authorId": "string",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  }
}
```

### 2.11 Team Collaboration

**Endpoint:** `POST /leads/{id}/team`  
**Authentication:** JWT required  
**Purpose:** Add team member to lead for collaboration  

**Request Schema:**
```json
{
  "userId": "string (required)",
  "role": "owner|collaborator|viewer (optional, default: collaborator)"
}
```

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "teamMember": {
      "userId": "string",
      "role": "string", 
      "addedAt": "ISO8601",
      "addedBy": "string"
    },
    "notificationSent": true
  }
}
```

### 2.12 Lead Export

**Endpoint:** `GET /leads/export`  
**Authentication:** JWT required  
**Purpose:** Export leads data in various formats with custom fields  

**Query Parameters:**
```
?format=csv&fields=companyName,contactName,email,status,dealValue
&filters=status:won,source:website&dateRange=30d
```

**Response:** File download (CSV/Excel) or JSON with download URL

---

## 3. CRM Core Module

**Priority:** Critical (Priority 1)  
**Endpoints:** 16  
**Authentication:** JWT required  
**Complex Relationships:** Contacts, Companies, Deals, Products with cross-references  

### 3.1 Contacts Management (4 endpoints)

#### 3.1.1 Get Contacts List

**Endpoint:** `GET /contacts`  
**Authentication:** JWT required  
**Purpose:** Retrieve paginated contacts with company relationships  

**Query Parameters:**
```
?page=1&limit=25&search=string&tags=tag1,tag2&companies=comp1,comp2
&status=active&sortBy=name&sortOrder=asc
```

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "id": "string",
        "firstName": "string",
        "lastName": "string", 
        "email": "string",
        "phone": "string",
        "title": "string",
        "company": {
          "id": "string",
          "name": "string",
          "industry": "string"
        },
        "location": "string",
        "tags": ["string"],
        "status": "active|inactive",
        "socialProfiles": {
          "linkedin": "string",
          "twitter": "string"
        },
        "preferences": {
          "contactMethod": "email|phone|whatsapp",
          "timezone": "string",
          "language": "string"
        },
        "createdAt": "ISO8601",
        "updatedAt": "ISO8601",
        "lastInteraction": "ISO8601|null",
        "interactionCount": "number",
        "associatedLeads": "number",
        "associatedDeals": "number"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 25,
      "total": 200,
      "totalPages": 8
    }
  }
}
```

#### 3.1.2 Create Contact

**Endpoint:** `POST /contacts`  
**Purpose:** Create new contact with company association  

**Request Schema:**
```json
{
  "firstName": "string (required, max: 50)",
  "lastName": "string (required, max: 50)",
  "email": "string (required, email format)",
  "phone": "string (optional, phone format)",
  "title": "string (optional, max: 100)",
  "companyId": "string (optional, company ID)",
  "location": "string (optional, max: 200)",
  "tags": ["string"] (optional, max: 10),
  "socialProfiles": {
    "linkedin": "string (optional, url format)",
    "twitter": "string (optional, url format)"
  },
  "preferences": {
    "contactMethod": "email|phone|whatsapp (optional)",
    "timezone": "string (optional)",
    "language": "string (optional)"
  },
  "customFields": "object (optional)"
}
```

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "contact": {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string", 
      "phone": "string",
      "title": "string",
      "company": "object|null",
      "location": "string",
      "tags": ["string"],
      "status": "active",
      "socialProfiles": "object",
      "preferences": "object",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601",
      "customFields": "object"
    }
  }
}
```

**Business Logic:**
- Auto-link to company if email domain matches existing company
- Duplicate detection based on email
- Generate contact activity: "Contact Created"
- Enrich profile data from social networks

#### 3.1.3 Update Contact

**Endpoint:** `PUT /contacts/{id}`  
**Purpose:** Update contact information with change tracking  

**Request Schema:** Same as Create Contact (all fields optional)

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "contact": "<updated_contact_object>",
    "changes": {
      "field": "old_value -> new_value"
    }
  }
}
```

#### 3.1.4 Delete Contact

**Endpoint:** `DELETE /contacts/{id}`  
**Purpose:** Soft delete contact with reference cleanup  

### 3.2 Companies Management (4 endpoints)

#### 3.2.1 Get Companies List

**Endpoint:** `GET /companies`  
**Authentication:** JWT required  
**Purpose:** Retrieve companies with relationship counts and metrics  

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "companies": [
      {
        "id": "string",
        "name": "string",
        "industry": "string",
        "size": "startup|small|medium|large|enterprise",
        "website": "string",
        "location": "string",
        "description": "string",
        "tags": ["string"],
        "status": "prospect|customer|partner|inactive",
        "contactCount": "number",
        "leadCount": "number",
        "dealCount": "number",
        "totalDealValue": "number",
        "primaryContact": {
          "id": "string",
          "name": "string",
          "title": "string",
          "email": "string"
        },
        "createdAt": "ISO8601",
        "updatedAt": "ISO8601",
        "lastActivity": "ISO8601|null"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 25,
      "total": 75,
      "totalPages": 3
    }
  }
}
```

#### 3.2.2 Create Company

**Request Schema:**
```json
{
  "name": "string (required, max: 200)",
  "industry": "string (optional, max: 100)",
  "size": "startup|small|medium|large|enterprise (optional)",
  "website": "string (optional, url format)",
  "location": "string (optional, max: 200)",
  "description": "string (optional, max: 1000)",
  "tags": ["string"] (optional, max: 10),
  "primaryContactId": "string (optional, contact ID)",
  "customFields": "object (optional)"
}
```

#### 3.2.3 Update Company
#### 3.2.4 Delete Company

### 3.3 Deals Management (4 endpoints)

#### 3.3.1 Get Deals List

**Endpoint:** `GET /deals`  
**Purpose:** Retrieve deals with pipeline information and metrics  

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "deals": [
      {
        "id": "string",
        "title": "string",
        "companyName": "string",
        "contactName": "string",
        "value": "number",
        "stage": "lead|qualified|proposal|negotiation|closed-won|closed-lost",
        "assigneeId": "string",
        "assignee": {
          "id": "string",
          "name": "string",
          "avatar": "string"
        },
        "source": "string",
        "probability": "number (0-100)",
        "expectedCloseDate": "ISO8601",
        "actualCloseDate": "ISO8601|null",
        "createdAt": "ISO8601",
        "updatedAt": "ISO8601",
        "notes": "string",
        "tags": ["string"],
        "leadSource": "string",
        "products": [
          {
            "id": "string",
            "name": "string",
            "quantity": "number",
            "unitPrice": "number",
            "totalPrice": "number"
          }
        ],
        "stageHistory": [
          {
            "stage": "string",
            "changedAt": "ISO8601",
            "changedBy": "string",
            "durationDays": "number"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 25,
      "total": 120,
      "totalPages": 5
    },
    "pipelineMetrics": {
      "totalValue": 3500000,
      "weightedValue": 1250000,
      "averageDealSize": 29166,
      "averageCloseTime": 45
    }
  }
}
```

#### 3.3.2 Create Deal

**Request Schema:**
```json
{
  "title": "string (required, max: 200)",
  "companyId": "string (optional, company ID)",
  "companyName": "string (required if no companyId, max: 200)", 
  "contactId": "string (optional, contact ID)",
  "contactName": "string (required if no contactId, max: 100)",
  "value": "number (required, min: 0)",
  "stage": "string (optional, default: lead)",
  "assigneeId": "string (optional, user ID)",
  "source": "string (optional)",
  "probability": "number (optional, 0-100)",
  "expectedCloseDate": "ISO8601 (optional)",
  "notes": "string (optional, max: 2000)",
  "tags": ["string"] (optional, max: 10),
  "leadSource": "string (optional, lead ID)",
  "products": [
    {
      "productId": "string (required)",
      "quantity": "number (required, min: 1)",
      "unitPrice": "number (optional, overrides product price)"
    }
  ] (optional)
}
```

**Business Logic:**
- Auto-calculate probability based on stage
- Link to existing company/contact or create new ones
- Calculate weighted pipeline value
- Generate deal activity: "Deal Created"
- Auto-assign based on territory rules

#### 3.3.3 Update Deal Stage

**Endpoint:** `PUT /deals/{id}/stage`  
**Purpose:** Move deal through pipeline stages with validation  

**Request Schema:**
```json
{
  "stage": "lead|qualified|proposal|negotiation|closed-won|closed-lost (required)",
  "probability": "number (optional, 0-100)",
  "reason": "string (optional, max: 500)",
  "nextSteps": "string (optional, max: 1000)"
}
```

**Business Logic:**
- Validate stage progression rules
- Update probability automatically based on stage
- Record stage change history with duration tracking
- Generate activity: "Deal Stage Changed"
- Trigger notifications for milestone stages

#### 3.3.4 Close Deal

**Endpoint:** `POST /deals/{id}/close`  
**Purpose:** Close deal as won or lost with detailed tracking  

**Request Schema:**
```json
{
  "status": "won|lost (required)",
  "finalValue": "number (required if won)",
  "lostReason": "string (required if lost, max: 500)",
  "competitorInfo": "string (optional, max: 500)",
  "closingNotes": "string (optional, max: 2000)",
  "nextSteps": "string (optional, max: 1000)"
}
```

**Business Logic:**
- Update deal status and close date
- Calculate sales cycle duration
- Update commission calculations
- Create deal closure activity
- Update related lead status
- Generate performance metrics

### 3.4 Products Management (4 endpoints)

#### 3.4.1 Get Products List

**Endpoint:** `GET /products`  
**Purpose:** Retrieve product catalog with pricing and availability  

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "category": "string",
        "subcategory": "string",
        "sku": "string",
        "price": "number",
        "cost": "number",
        "margin": "number",
        "currency": "string",
        "unit": "string",
        "availability": "in_stock|low_stock|out_of_stock|discontinued",
        "stockQuantity": "number",
        "minimumOrder": "number",
        "images": ["string"],
        "specifications": "object",
        "tags": ["string"],
        "isActive": "boolean",
        "createdAt": "ISO8601",
        "updatedAt": "ISO8601",
        "salesCount": "number",
        "totalRevenue": "number"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 25,
      "total": 50,
      "totalPages": 2
    },
    "categories": [
      {
        "category": "Premium Tea Collection",
        "count": 15
      }
    ]
  }
}
```

#### 3.4.2 Create Product
#### 3.4.3 Update Product  
#### 3.4.4 Delete Product

---

## 4. Performance Analytics Module

**Priority:** High (Priority 2)  
**Endpoints:** 8  
**Authentication:** JWT required  
**Complex Calculations:** Revenue metrics, conversion tracking, team performance  

### 4.1 User Performance Metrics

**Endpoint:** `GET /analytics/performance/users/{userId}`  
**Authentication:** JWT required  
**Purpose:** Get comprehensive performance metrics for specific user  

**Query Parameters:**
```
?period=week&includeMetrics=revenue,calls,meetings,deals,conversion,pipeline
&compareWith=team_average&startDate=ISO8601&endDate=ISO8601
```

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "userId": "string",
    "period": "week|month|quarter|year",
    "dateRange": {
      "start": "ISO8601",
      "end": "ISO8601"
    },
    "metrics": {
      "revenue": {
        "total": 125000,
        "target": 150000,
        "achievement": 83.3,
        "previousPeriod": 98000,
        "growth": 27.6,
        "rank": 2,
        "breakdown": {
          "newBusiness": 85000,
          "existingBusiness": 40000
        }
      },
      "activities": {
        "callsMade": 45,
        "callsTarget": 50,
        "meetingsBooked": 12,
        "meetingsTarget": 15,
        "emailsSent": 120,
        "proposalsSent": 8
      },
      "deals": {
        "total": 15,
        "won": 8,
        "lost": 3,
        "inProgress": 4,
        "averageValue": 15625,
        "winRate": 72.7,
        "salesCycle": 32.5
      },
      "pipeline": {
        "active": 250000,
        "weighted": 187500,
        "qualified": 180000,
        "proposal": 120000
      },
      "leads": {
        "assigned": 25,
        "contacted": 22,
        "converted": 8,
        "conversionRate": 32.0,
        "avgResponseTime": 45
      }
    },
    "trends": {
      "revenue": [
        {"date": "2025-01-01", "value": 12000},
        {"date": "2025-01-02", "value": 15000}
      ],
      "activities": [
        {"date": "2025-01-01", "calls": 6, "meetings": 2},
        {"date": "2025-01-02", "calls": 8, "meetings": 3}
      ]
    },
    "comparison": {
      "teamAverage": {
        "revenue": 95000,
        "winRate": 58.3,
        "callsMade": 38
      },
      "ranking": {
        "revenue": 2,
        "winRate": 1,
        "activities": 3
      }
    }
  }
}
```

### 4.2 Team Performance Dashboard

**Endpoint:** `GET /analytics/performance/teams`  
**Purpose:** Get aggregated team performance with individual breakdowns  

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRevenue": 850000,
      "revenueTarget": 1000000,
      "achievement": 85.0,
      "totalDeals": 125,
      "totalActivities": 1250,
      "averageWinRate": 64.2,
      "averageSalesCycle": 38.5
    },
    "teamMembers": [
      {
        "userId": "string",
        "name": "string",
        "avatar": "string",
        "role": "string",
        "metrics": {
          "revenue": 125000,
          "deals": 15,
          "winRate": 72.7,
          "activities": 145,
          "rank": 2
        },
        "performance": "above_target|on_target|below_target",
        "trend": "improving|stable|declining"
      }
    ],
    "leaderboard": [
      {
        "rank": 1,
        "userId": "string",
        "name": "string",
        "metric": "revenue",
        "value": 135000,
        "achievement": 108.0
      }
    ]
  }
}
```

### 4.3 Revenue Analytics

**Endpoint:** `GET /analytics/revenue`  
**Purpose:** Detailed revenue analysis with forecasting  

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRevenue": 2450000,
      "recurringRevenue": 1850000,
      "newBusinessRevenue": 600000,
      "previousPeriod": 2100000,
      "growth": 16.7,
      "forecast": {
        "nextMonth": 285000,
        "nextQuarter": 820000,
        "confidence": 87
      }
    },
    "breakdown": {
      "bySource": [
        {"source": "website", "revenue": 650000, "percentage": 26.5},
        {"source": "referral", "revenue": 580000, "percentage": 23.7}
      ],
      "byProduct": [
        {"product": "Premium Tea Collection", "revenue": 950000, "percentage": 38.8}
      ],
      "byRegion": [
        {"region": "Middle East", "revenue": 850000, "percentage": 34.7}
      ],
      "byAssignee": [
        {"assignee": "user-1", "revenue": 420000, "percentage": 17.1}
      ]
    },
    "trends": {
      "monthly": [
        {"month": "2024-12", "revenue": 185000, "target": 200000},
        {"month": "2025-01", "revenue": 225000, "target": 210000}
      ],
      "quarterly": [
        {"quarter": "Q4 2024", "revenue": 580000, "target": 600000}
      ]
    },
    "metrics": {
      "averageDealSize": 24500,
      "medianDealSize": 18000,
      "largestDeal": 125000,
      "dealsClosedCount": 100,
      "salesVelocity": 45000
    }
  }
}
```

### 4.4 Conversion Funnel Analysis

**Endpoint:** `GET /analytics/funnel`  
**Purpose:** Analyze conversion rates through sales funnel stages  

### 4.5 Activity Performance

**Endpoint:** `GET /analytics/activities`  
**Purpose:** Track activity effectiveness and volume  

### 4.6 Pipeline Analytics

**Endpoint:** `GET /analytics/pipeline`  
**Purpose:** Current pipeline status and forecasting  

### 4.7 Leaderboards

**Endpoint:** `GET /analytics/leaderboards`  
**Purpose:** Team rankings across various metrics  

### 4.8 Custom Reports

**Endpoint:** `POST /analytics/reports/custom`  
**Purpose:** Generate custom analytical reports with user-defined parameters  

---

## 5. Email Management Module

**Priority:** High (Priority 2)  
**Endpoints:** 7  
**Authentication:** JWT required  
**External Integration:** Gmail, Outlook, SMTP  

### 5.1 Send Email

**Endpoint:** `POST /emails/send`  
**Authentication:** JWT required  
**Purpose:** Send email with tracking and template support  

**Request Schema:**
```json
{
  "to": ["string"] (required, email addresses),
  "cc": ["string"] (optional),
  "bcc": ["string"] (optional),
  "subject": "string (required, max: 200)",
  "body": "string (required, max: 50000)",
  "bodyType": "text|html (optional, default: html)",
  "templateId": "string (optional, template ID)",
  "templateVariables": "object (optional)",
  "leadId": "string (optional, lead ID)",
  "contactId": "string (optional, contact ID)",
  "dealId": "string (optional, deal ID)",
  "trackOpens": "boolean (optional, default: true)",
  "trackClicks": "boolean (optional, default: true)",
  "attachments": [
    {
      "filename": "string",
      "content": "string (base64)",
      "contentType": "string"
    }
  ] (optional),
  "scheduledFor": "ISO8601 (optional, future datetime)",
  "priority": "low|normal|high|urgent (optional, default: normal)"
}
```

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "email": {
      "id": "string",
      "messageId": "string",
      "to": ["string"],
      "cc": ["string"],
      "bcc": ["string"],
      "subject": "string",
      "body": "string",
      "bodyType": "string",
      "status": "sent|scheduled|failed",
      "sentAt": "ISO8601",
      "scheduledFor": "ISO8601|null",
      "leadId": "string|null",
      "contactId": "string|null",
      "dealId": "string|null",
      "tracking": {
        "trackingId": "string",
        "opened": false,
        "openedAt": null,
        "clickedLinks": [],
        "replied": false,
        "repliedAt": null,
        "bounced": false,
        "unsubscribed": false
      },
      "createdAt": "ISO8601",
      "attachments": [
        {
          "id": "string",
          "filename": "string",
          "size": 12345,
          "contentType": "string"
        }
      ]
    },
    "deliveryStatus": {
      "provider": "smtp|gmail|outlook",
      "messageId": "string",
      "status": "accepted|rejected",
      "details": "string"
    }
  }
}
```

**Business Logic:**
- Use configured email provider (SMTP/Gmail/Outlook)
- Generate unique tracking pixel for opens
- Rewrite links for click tracking
- Store email copy in CRM for history
- Create activity record in associated lead/contact/deal
- Handle bounces and delivery notifications via webhooks

### 5.2 Get Email History

**Endpoint:** `GET /emails`  
**Authentication:** JWT required  
**Purpose:** Retrieve sent/received email history with filtering  

**Query Parameters:**
```
?page=1&limit=25&status=all&type=sent|received&leadId=string
&contactId=string&dealId=string&dateFrom=ISO8601&dateTo=ISO8601
&searchTerm=string&hasAttachments=boolean
```

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "emails": [
      {
        "id": "string",
        "messageId": "string",
        "direction": "sent|received",
        "from": "string",
        "to": ["string"],
        "subject": "string",
        "bodyPreview": "string (first 200 chars)",
        "status": "sent|delivered|opened|replied|bounced|failed",
        "sentAt": "ISO8601",
        "leadId": "string|null",
        "contactId": "string|null", 
        "dealId": "string|null",
        "hasAttachments": "boolean",
        "attachmentCount": "number",
        "tracking": {
          "opened": "boolean",
          "openedAt": "ISO8601|null",
          "clickCount": "number",
          "replied": "boolean",
          "repliedAt": "ISO8601|null"
        },
        "tags": ["string"],
        "priority": "string"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 25,
      "total": 150,
      "totalPages": 6
    },
    "stats": {
      "totalSent": 120,
      "totalReceived": 30,
      "openRate": 68.5,
      "clickRate": 12.3,
      "replyRate": 8.7
    }
  }
}
```

### 5.3 Email Templates Management

**Endpoint:** `GET /emails/templates`  
**Authentication:** JWT required  
**Purpose:** Manage email templates for consistent communication  

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "string",
        "name": "string",
        "subject": "string",
        "body": "string",
        "bodyType": "text|html",
        "category": "follow_up|proposal|welcome|nurture|meeting",
        "variables": [
          {
            "name": "contact_name",
            "type": "string",
            "required": true,
            "description": "Contact's first name"
          }
        ],
        "isShared": "boolean",
        "createdBy": "string",
        "createdAt": "ISO8601",
        "updatedAt": "ISO8601",
        "usageCount": "number",
        "tags": ["string"],
        "preview": "string"
      }
    ],
    "categories": [
      {"category": "follow_up", "count": 8},
      {"category": "proposal", "count": 5}
    ]
  }
}
```

### 5.4 Create Email Template

**Endpoint:** `POST /emails/templates`  
**Purpose:** Create new email template with variable support  

**Request Schema:**
```json
{
  "name": "string (required, max: 100)",
  "subject": "string (required, max: 200)",
  "body": "string (required, max: 50000)",
  "bodyType": "text|html (optional, default: html)",
  "category": "follow_up|proposal|welcome|nurture|meeting|other (optional)",
  "variables": [
    {
      "name": "string (required)",
      "type": "string|number|date|boolean (required)",
      "required": "boolean (optional, default: false)",
      "description": "string (optional)"
    }
  ] (optional),
  "isShared": "boolean (optional, default: false)",
  "tags": ["string"] (optional)
}
```

**Business Logic:**
- Parse template variables from body using {{variable}} syntax
- Validate HTML if bodyType is html
- Create template preview
- Set permissions based on isShared flag

### 5.5 Email Settings Management

**Endpoint:** `GET /emails/settings`  
**Authentication:** JWT required  
**Purpose:** Get/update email configuration and integration settings  

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "settings": {
      "signature": "string",
      "defaultFrom": "string",
      "businessEmail": "string",
      "ccToBusinessEmail": "boolean",
      "autoSaveTemplates": "boolean",
      "trackingEnabled": "boolean",
      "notificationsEnabled": "boolean",
      "externalEmailMonitoring": "boolean",
      "gmailIntegration": {
        "enabled": "boolean",
        "connectedEmail": "string",
        "lastSync": "ISO8601|null",
        "syncStatus": "active|error|disconnected"
      },
      "outlookIntegration": {
        "enabled": "boolean",
        "connectedEmail": "string",
        "lastSync": "ISO8601|null",
        "syncStatus": "active|error|disconnected"
      },
      "smtpSettings": {
        "host": "string",
        "port": "number",
        "username": "string",
        "secure": "boolean",
        "isConfigured": "boolean"
      }
    }
  }
}
```

### 5.6 Email Tracking

**Endpoint:** `GET /emails/{id}/tracking`  
**Authentication:** JWT required  
**Purpose:** Get detailed tracking information for specific email  

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "emailId": "string",
    "tracking": {
      "deliveryStatus": "delivered|bounced|failed",
      "deliveredAt": "ISO8601|null",
      "opened": "boolean",
      "openCount": "number",
      "firstOpenedAt": "ISO8601|null",
      "lastOpenedAt": "ISO8601|null",
      "openEvents": [
        {
          "timestamp": "ISO8601",
          "ipAddress": "string",
          "userAgent": "string",
          "location": "string"
        }
      ],
      "clicked": "boolean",
      "clickCount": "number",
      "firstClickedAt": "ISO8601|null",
      "lastClickedAt": "ISO8601|null",
      "clickEvents": [
        {
          "timestamp": "ISO8601",
          "url": "string",
          "ipAddress": "string",
          "userAgent": "string"
        }
      ],
      "replied": "boolean",
      "repliedAt": "ISO8601|null",
      "bounced": "boolean",
      "bounceReason": "string|null",
      "unsubscribed": "boolean",
      "unsubscribedAt": "ISO8601|null"
    }
  }
}
```

### 5.7 Gmail/Outlook Integration

**Endpoint:** `POST /emails/integrations/{provider}/connect`  
**Authentication:** JWT required  
**Purpose:** Connect and sync with external email providers  

**Request Schema:**
```json
{
  "provider": "gmail|outlook (required)",
  "authCode": "string (required)",
  "redirectUri": "string (required)",
  "syncHistoricalEmails": "boolean (optional, default: false)",
  "syncDays": "number (optional, default: 30)"
}
```

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "integration": {
      "provider": "string",
      "connectedEmail": "string",
      "connectedAt": "ISO8601",
      "permissions": ["read", "send", "compose"],
      "syncStatus": "active",
      "lastSync": "ISO8601",
      "emailsImported": "number"
    }
  }
}
```

**Business Logic:**
- Exchange auth code for access/refresh tokens
- Store encrypted tokens in database
- Import historical emails if requested
- Set up webhook subscriptions for real-time sync
- Create activities for imported emails

---

## 6. Lead Routing Module

**Priority:** High (Priority 2)  
**Endpoints:** 6  
**Authentication:** JWT required  
**AI Features:** Intelligent routing, scoring algorithms  

### 6.1 Get Unassigned Leads

**Endpoint:** `GET /routing/unassigned`  
**Authentication:** JWT required  
**Purpose:** Retrieve leads awaiting assignment with routing recommendations  

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "unassignedLeads": [
      {
        "id": "string",
        "companyName": "string",
        "contactName": "string",
        "location": "string",
        "source": "string",
        "dealValue": "number",
        "productInterest": "string",
        "language": "string",
        "createdAt": "ISO8601",
        "urgency": "low|normal|high|critical",
        "qualityScore": "number (0-100)",
        "routingRecommendations": [
          {
            "assigneeId": "string",
            "assigneeName": "string",
            "confidence": "number (0-1)",
            "score": "number (0-100)",
            "reasons": [
              "Language match (Arabic)",
              "Territory expertise (Middle East)",
              "Product expertise (Premium Tea)",
              "Current workload capacity"
            ],
            "workload": {
              "currentLeads": 15,
              "capacity": 25,
              "utilizationRate": 0.6
            }
          }
        ],
        "matchingCriteria": {
          "languageRequired": "arabic",
          "territoryMatch": "middle_east",
          "productCategory": "premium",
          "experienceLevel": "senior"
        }
      }
    ],
    "summary": {
      "totalUnassigned": 8,
      "criticalUrgency": 2,
      "highValue": 3,
      "averageWaitTime": "2.5 hours"
    }
  }
}
```

### 6.2 Auto-Route Lead

**Endpoint:** `POST /routing/leads/{id}/auto-assign`  
**Authentication:** JWT required  
**Purpose:** Apply intelligent routing algorithm to assign lead  

**Request Schema:**
```json
{
  "useRecommendation": "boolean (optional, default: true)",
  "overrideAssignee": "string (optional, user ID)",
  "routingRules": {
    "considerWorkload": "boolean (optional, default: true)",
    "considerExpertise": "boolean (optional, default: true)",
    "considerLocation": "boolean (optional, default: true)",
    "considerLanguage": "boolean (optional, default: true)"
  }
}
```

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "assignment": {
      "leadId": "string",
      "assignedTo": "string",
      "assigneeName": "string",
      "assignedAt": "ISO8601",
      "confidence": "number (0-1)",
      "score": "number (0-100)",
      "reasons": ["string"],
      "method": "auto|manual_override"
    },
    "notification": {
      "sent": "boolean",
      "method": "email|in_app|sms",
      "sentAt": "ISO8601"
    }
  }
}
```

**Business Logic:**
- Apply lead scoring algorithm considering multiple factors
- Check assignee availability and current workload
- Match expertise (language, territory, product)
- Consider historical performance with similar leads
- Generate assignment activity and notifications

### 6.3 Lead Scoring

**Endpoint:** `GET /routing/leads/{id}/score`  
**Authentication:** JWT required  
**Purpose:** Get detailed lead quality score with breakdown  

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "leadId": "string",
    "overallScore": "number (0-100)",
    "grade": "A|B|C|D",
    "calculatedAt": "ISO8601",
    "scoreBreakdown": {
      "companyProfile": {
        "score": 25,
        "maxScore": 30,
        "factors": {
          "companySize": 8,
          "industry": 7,
          "location": 10
        }
      },
      "contactQuality": {
        "score": 20,
        "maxScore": 25,
        "factors": {
          "jobTitle": 8,
          "contactInfo": 7,
          "socialPresence": 5
        }
      },
      "dealPotential": {
        "score": 18,
        "maxScore": 25,
        "factors": {
          "estimatedValue": 10,
          "urgency": 5,
          "budget": 3
        }
      },
      "sourceQuality": {
        "score": 12,
        "maxScore": 20,
        "factors": {
          "sourceCredibility": 8,
          "referralQuality": 4
        }
      }
    },
    "recommendations": [
      "High-value prospect - prioritize immediate contact",
      "Strong company profile suggests good fit",
      "Consider Arabic-speaking representative"
    ],
    "riskFactors": [
      "Location may require special shipping considerations"
    ]
  }
}
```

### 6.4 Routing Rules Management

**Endpoint:** `GET /routing/rules`  
**Authentication:** JWT required (manager/admin)  
**Purpose:** Manage intelligent routing rules and algorithms  

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "rules": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "isActive": "boolean",
        "priority": "number",
        "conditions": {
          "dealValue": {
            "min": 50000,
            "operator": ">=",
            "weight": 0.3
          },
          "location": {
            "regions": ["Middle East", "Asia"],
            "operator": "in",
            "weight": 0.2
          },
          "language": {
            "values": ["arabic"],
            "operator": "equals",
            "weight": 0.25
          },
          "source": {
            "values": ["referral", "event"],
            "operator": "in", 
            "weight": 0.15
          }
        },
        "actions": {
          "assignTo": "user-1",
          "notification": "immediate",
          "priority": "high"
        },
        "createdAt": "ISO8601",
        "updatedAt": "ISO8601",
        "matchCount": "number",
        "successRate": "number"
      }
    ],
    "assigneeCapacity": [
      {
        "userId": "string",
        "name": "string",
        "currentLeads": 15,
        "maxCapacity": 25,
        "utilizationRate": 0.6,
        "specialties": ["Arabic", "Premium Products"],
        "territories": ["Middle East"],
        "availability": "available|busy|unavailable",
        "performanceScore": 87.5
      }
    ]
  }
}
```

### 6.5 Assignment History

**Endpoint:** `GET /routing/history`  
**Authentication:** JWT required  
**Purpose:** Track assignment history and routing effectiveness  

### 6.6 Workload Balancing

**Endpoint:** `POST /routing/rebalance`  
**Authentication:** JWT required (manager/admin)  
**Purpose:** Rebalance lead assignments across team members  

---

## 7. Notifications Module

**Priority:** High (Priority 2)  
**Endpoints:** 6  
**Authentication:** JWT required  
**Real-time:** WebSocket integration required  

### 7.1 Get Notifications

**Endpoint:** `GET /notifications`  
**Authentication:** JWT required  
**Purpose:** Retrieve user notifications with filtering and pagination  

**Query Parameters:**
```
?page=1&limit=25&category=all&priority=all&read=null&dateRange=7d
&types=lead_assigned,deal_won,task_overdue
```

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "string",
        "type": "lead_assigned|deal_won|deal_lost|task_overdue|meeting_reminder|email_received|quota_achieved|target_missed",
        "category": "leads|deals|tasks|meetings|system|performance",
        "priority": "low|medium|high|urgent",
        "title": "string",
        "message": "string",
        "data": {
          "leadId": "string",
          "leadName": "string",
          "company": "string",
          "dealId": "string",
          "amount": "number",
          "taskId": "string",
          "meetingId": "string"
        },
        "isRead": "boolean",
        "readAt": "ISO8601|null",
        "createdAt": "ISO8601",
        "expiresAt": "ISO8601|null",
        "actions": [
          {
            "type": "open_details|mark_as_read|snooze|dismiss|accept|decline",
            "label": "string",
            "url": "string|null",
            "primary": "boolean"
          }
        ],
        "metadata": {
          "sourceUser": "string|null",
          "relatedEntity": "string|null",
          "customData": "object"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 25,
      "total": 45,
      "totalPages": 2,
      "unreadCount": 12
    },
    "summary": {
      "totalNotifications": 45,
      "unreadCount": 12,
      "urgentCount": 2,
      "todayCount": 8,
      "categoryCounts": {
        "leads": 15,
        "deals": 12,
        "tasks": 8,
        "meetings": 5,
        "system": 3,
        "performance": 2
      }
    }
  }
}
```

### 7.2 Mark as Read

**Endpoint:** `POST /notifications/{id}/read`  
**Authentication:** JWT required  
**Purpose:** Mark specific notification as read  

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "notificationId": "string",
    "readAt": "ISO8601",
    "unreadCount": 11
  }
}
```

### 7.3 Bulk Mark as Read

**Endpoint:** `POST /notifications/bulk/read`  
**Authentication:** JWT required  
**Purpose:** Mark multiple notifications as read  

**Request Schema:**
```json
{
  "notificationIds": ["string"] (optional, if not provided marks all),
  "category": "string (optional)",
  "olderThan": "ISO8601 (optional)"
}
```

### 7.4 Notification Preferences

**Endpoint:** `GET /notifications/preferences`  
**Authentication:** JWT required  
**Purpose:** Get/update user notification preferences  

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "preferences": {
      "channels": {
        "inApp": "boolean",
        "email": "boolean",
        "sms": "boolean",
        "push": "boolean"
      },
      "categories": {
        "leads": {
          "enabled": "boolean",
          "channels": ["inApp", "email"],
          "priority": "medium",
          "frequency": "immediate|hourly|daily"
        },
        "deals": {
          "enabled": "boolean", 
          "channels": ["inApp", "email", "sms"],
          "priority": "high",
          "frequency": "immediate"
        },
        "tasks": {
          "enabled": "boolean",
          "channels": ["inApp"],
          "priority": "medium",
          "frequency": "immediate"
        }
      },
      "quietHours": {
        "enabled": "boolean",
        "start": "22:00",
        "end": "07:00",
        "timezone": "UTC"
      },
      "digestSettings": {
        "enabled": "boolean",
        "frequency": "daily|weekly",
        "time": "09:00",
        "includeCategories": ["string"]
      }
    }
  }
}
```

### 7.5 Real-time Notifications (WebSocket)

**Endpoint:** `WS /notifications/live`  
**Authentication:** JWT token in query param  
**Purpose:** Real-time notification delivery via WebSocket  

**Connection URL:**
```
wss://api.salestracker.com/v1/notifications/live?token=jwt_token
```

**Message Formats:**

**Incoming (Server → Client):**
```json
{
  "type": "notification",
  "data": {
    "notification": {
      "id": "string",
      "type": "string",
      "category": "string",
      "priority": "string",
      "title": "string",
      "message": "string",
      "data": "object",
      "createdAt": "ISO8601",
      "actions": ["object"]
    },
    "unreadCount": "number"
  }
}
```

**Outgoing (Client → Server):**
```json
{
  "type": "mark_read",
  "data": {
    "notificationId": "string"
  }
}
```

**Connection Events:**
```json
{
  "type": "connected",
  "data": {
    "clientId": "string",
    "timestamp": "ISO8601"
  }
}
```

### 7.6 Create Notification

**Endpoint:** `POST /notifications`  
**Authentication:** JWT required (system/admin)  
**Purpose:** Create system or user notification (internal API)  

**Request Schema:**
```json
{
  "recipientId": "string (required, user ID)",
  "type": "string (required)",
  "category": "string (required)",
  "priority": "string (required)",
  "title": "string (required, max: 200)",
  "message": "string (required, max: 1000)",
  "data": "object (optional)",
  "actions": [
    {
      "type": "string (required)",
      "label": "string (required)",
      "url": "string (optional)",
      "primary": "boolean (optional)"
    }
  ] (optional),
  "expiresAt": "ISO8601 (optional)",
  "sendChannels": ["inApp", "email", "sms"] (optional)
}
```

**Business Logic:**
- Check user notification preferences
- Send via enabled channels only
- Respect quiet hours setting
- Queue for batch processing if not immediate
- Generate unique notification ID
- Store for persistence and history

---

## 8. Team Management Module

**Priority:** Medium (Priority 3)  
**Endpoints:** 4  
**Authentication:** JWT required (manager/admin access)  

### 8.1 Get Teams

**Endpoint:** `GET /teams`  
**Authentication:** JWT required  
**Purpose:** Retrieve team structures with member details  

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "teams": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "managerId": "string",
        "manager": {
          "id": "string",
          "name": "string",
          "email": "string",
          "avatar": "string"
        },
        "members": [
          {
            "userId": "string",
            "name": "string",
            "email": "string",
            "role": "manager|senior_sales|sales_rep|junior_sales",
            "joinedAt": "ISO8601",
            "status": "active|inactive|on_leave",
            "performance": {
              "currentMonth": {
                "revenue": 45000,
                "deals": 8,
                "activities": 125,
                "rank": 2
              },
              "target": 50000,
              "achievement": 90.0
            }
          }
        ],
        "territories": ["Middle East", "Asia"],
        "targets": {
          "monthly": 500000,
          "quarterly": 1500000,
          "current": {
            "revenue": 385000,
            "achievement": 77.0
          }
        },
        "createdAt": "ISO8601",
        "updatedAt": "ISO8601",
        "isActive": "boolean"
      }
    ],
    "summary": {
      "totalTeams": 3,
      "totalMembers": 15,
      "averageTeamSize": 5.0,
      "topPerformingTeam": "string"
    }
  }
}
```

### 8.2 Create Team

**Endpoint:** `POST /teams`  
**Authentication:** JWT required (admin only)  
**Purpose:** Create new team with initial members  

### 8.3 Update Team

**Endpoint:** `PUT /teams/{id}`  
**Authentication:** JWT required (admin/manager)  
**Purpose:** Update team details and membership  

### 8.4 Team Performance

**Endpoint:** `GET /teams/{id}/performance`  
**Authentication:** JWT required  
**Purpose:** Get detailed team performance metrics  

---

## 9. POS System Module

**Priority:** Low (Priority 4)  
**Endpoints:** 3  
**Authentication:** JWT required  

### 9.1 Process Transaction

**Endpoint:** `POST /pos/transactions`  
**Authentication:** JWT required  
**Purpose:** Process point-of-sale transaction  

### 9.2 Get Transaction History

**Endpoint:** `GET /pos/transactions`  
**Purpose:** Retrieve POS transaction history  

### 9.3 Inventory Sync

**Endpoint:** `POST /pos/inventory/sync`  
**Purpose:** Synchronize inventory between CRM and POS  

---

## 10. Integration Module

**Priority:** Medium (Priority 3)  
**Endpoints:** 3  
**Authentication:** JWT required  

### 10.1 External Integrations Status

**Endpoint:** `GET /integrations`  
**Authentication:** JWT required  
**Purpose:** Get status of all external integrations  

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "integrations": [
      {
        "provider": "gmail",
        "name": "Gmail Integration",
        "status": "active|inactive|error|configuring",
        "isEnabled": "boolean",
        "lastSync": "ISO8601|null",
        "syncStatus": "success|error|in_progress",
        "connectedAt": "ISO8601|null",
        "configuration": {
          "accountEmail": "string",
          "permissions": ["read", "send"],
          "syncHistorical": "boolean"
        },
        "metrics": {
          "emailsImported": 1250,
          "emailsSent": 340,
          "lastSuccessfulSync": "ISO8601"
        },
        "errors": [
          {
            "code": "string",
            "message": "string",
            "occurredAt": "ISO8601",
            "resolved": "boolean"
          }
        ]
      },
      {
        "provider": "whatsapp",
        "name": "WhatsApp Business",
        "status": "configuring",
        "isEnabled": "false",
        "configuration": null,
        "supportedFeatures": ["send_messages", "receive_messages", "templates"]
      }
    ],
    "summary": {
      "totalIntegrations": 5,
      "activeIntegrations": 2,
      "errorCount": 1,
      "lastSyncTime": "ISO8601"
    }
  }
}
```

### 10.2 Social Media Integration

**Endpoint:** `POST /integrations/social/{platform}/connect`  
**Authentication:** JWT required  
**Purpose:** Connect social media platforms for lead generation  

### 10.3 Webhook Management

**Endpoint:** `GET /integrations/webhooks`  
**Authentication:** JWT required  
**Purpose:** Manage external webhooks for real-time data sync  

---

## 11. Assistant Module

**Priority:** Low (Priority 4)  
**Endpoints:** 2  
**Authentication:** JWT required  

### 11.1 AI Assistant Query

**Endpoint:** `POST /assistant/query`  
**Authentication:** JWT required  
**Purpose:** Query AI assistant for insights and recommendations  

### 11.2 Generate Insights

**Endpoint:** `GET /assistant/insights`  
**Authentication:** JWT required  
**Purpose:** Get AI-generated insights and recommendations  

---

## Authentication & Security Requirements

### JWT Token Structure
```json
{
  "sub": "user_id (Guid)",
  "email": "user@example.com",
  "role": "Admin|Manager|SalesRep",
  "permissions": ["Leads:Read", "Leads:Write", "Deals:Read"],
  "iat": 1642684800,
  "exp": 1642771200,
  "iss": "salestracker-api",
  "aud": "salestracker-frontend"
}
```

### Permission System
```
Leads:Read, Leads:Write, Leads:Delete
Contacts:Read, Contacts:Write, Contacts:Delete  
Companies:Read, Companies:Write, Companies:Delete
Deals:Read, Deals:Write, Deals:Delete
Products:Read, Products:Write, Products:Delete
Analytics:Read, Analytics:Advanced
Teams:Read, Teams:Write, Teams:Admin
Admin:System, Admin:Users, Admin:Settings
```

### Rate Limiting
```
Authentication: 5 requests/minute per IP
API Calls: 1000 requests/hour per user
Bulk Operations: 10 requests/minute per user
File Uploads: 20 requests/hour per user
WebSocket: 100 connections per user
```

---

## Real-time Features

### SignalR Hubs (.NET Real-time Implementation)

#### Lead Updates Hub
**Endpoint:** `/hubs/leads`  
**Hub Class:** `LeadsHub : Hub`
**Purpose:** Real-time lead updates and assignment notifications  
**Methods:** `JoinLeadGroup`, `LeaveLeadGroup`, `NotifyLeadUpdate`, `NotifyLeadAssignment`

#### Deal Pipeline Hub
**Endpoint:** `/hubs/deals`  
**Hub Class:** `DealsHub : Hub`
**Purpose:** Real-time deal stage changes and closures  
**Methods:** `JoinDealPipeline`, `NotifyStageChange`, `NotifyDealClosure`

#### Team Activity Hub
**Endpoint:** `/hubs/activity`  
**Hub Class:** `ActivityHub : Hub`
**Purpose:** Real-time team activity feed  
**Methods:** `JoinTeamActivity`, `BroadcastActivity`, `NotifyTeamUpdate`  

---

## File Management

### File Upload
**Endpoint:** `POST /api/v1/files/upload`  
**Purpose:** Upload files with virus scanning and validation  
**Controller:** `FilesController.UploadFile`

**Request Model:**
```csharp
public class FileUploadRequest
{
    [Required(ErrorMessage = "File is required")]
    [AllowedExtensions(new[] { ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".png", ".gif" })]
    [MaxFileSize(10 * 1024 * 1024)] // 10MB
    public IFormFile File { get; set; }

    public string? Category { get; set; }
    public string? Description { get; set; }
    public Guid? EntityId { get; set; }
    public string? EntityType { get; set; }
}
```

**Max Size:** 10MB per file  
**Allowed Types:** PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF

### File Storage Structure
```
/uploads/{userId}/{entity_type}/{entity_id}/{filename}
/templates/{template_id}/{filename}
/exports/{user_id}/{export_id}/{filename}
```

---

## Data Validation Rules

### Lead Validation
- **Email:** Required, unique, valid format
- **Company Name:** Required, max 200 characters
- **Deal Value:** Optional, positive number, max 999,999,999
- **Phone:** Optional, international format validation
- **Source:** Required, enum validation

### Contact Validation  
- **Name:** Required, min 2 characters, max 100
- **Email:** Required, unique within system, valid format
- **Company:** Optional reference to existing company

### Deal Validation
- **Value:** Required, positive number
- **Stage:** Required, valid pipeline stage
- **Probability:** 0-100 based on stage
- **Close Date:** Future date if not closed

---

## Error Handling Standards

### ASP.NET Core Validation Error Response
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "traceId": "00-trace-id-00",
  "errors": {
    "Email": ["The Email field is required.", "Email must be in valid format"],
    "DealValue": ["The Deal Value field is required.", "Deal value must be greater than 0"]
  }
}
```

### Custom Business Logic Error Response
```json
{
  "Success": false,
  "Message": "Business rule violation occurred",
  "Errors": [
    {
      "Code": "BUSINESS_RULE_VIOLATION",
      "Message": "Cannot assign lead to inactive user",
      "Field": "AssignedTo"
    }
  ],
  "Data": null
}
```

### Legacy Business Logic Error Response (Removed - Replaced Above)
This section has been updated to reflect ASP.NET Core patterns above.

---

## Integration Specifications

### External API Requirements

#### Gmail Integration
- **OAuth 2.0** with Google APIs
- **Scopes:** gmail.readonly, gmail.send, gmail.compose
- **Webhooks:** Push notifications for new emails
- **Rate Limits:** 1000 requests/100 seconds per user

#### WhatsApp Business API
- **Authentication:** Bearer token
- **Message Templates:** Pre-approved templates only
- **Webhooks:** Message delivery status, incoming messages
- **Rate Limits:** 1000 messages/24 hours per phone number

#### Social Media APIs
- **Facebook/Instagram:** Graph API v12.0+
- **LinkedIn:** LinkedIn API v2
- **Twitter:** API v2 with OAuth 2.0

---

## Performance Requirements

### Response Time Targets
- **Authentication:** < 500ms
- **Lead List:** < 1000ms
- **Analytics:** < 2000ms
- **Bulk Operations:** < 5000ms
- **File Upload:** < 10000ms
- **WebSocket:** < 100ms latency

### Throughput Requirements
- **Concurrent Users:** 1000+
- **API Requests:** 10,000/minute peak
- **Database Operations:** 100,000/minute
- **WebSocket Connections:** 1000 concurrent
- **File Storage:** 1TB capacity

### Caching Strategy
- **Lead Lists:** Cache for 5 minutes
- **Analytics:** Cache for 15 minutes
- **User Permissions:** Cache for 30 minutes
- **Configuration:** Cache for 1 hour

---

## Data Export/Import

### Export Formats
- **CSV:** Lead lists, contact lists, deal reports
- **Excel:** Complex analytics with multiple sheets
- **PDF:** Professional reports with charts
- **JSON:** API data dumps for integration

### Import Requirements
- **CSV Import:** Leads, contacts, deals
- **Validation:** Real-time validation during import
- **Error Handling:** Detailed error reports
- **Duplicate Detection:** Smart duplicate prevention

---

## Monitoring & Analytics

### API Metrics
- **Request Count:** Per endpoint, per user, per time period
- **Response Time:** Average, median, 95th percentile
- **Error Rate:** 4xx and 5xx errors
- **Authentication:** Success/failure rates
- **Rate Limiting:** Throttle events

### Business Metrics
- **User Activity:** Active users, session duration
- **Feature Usage:** Most used endpoints and features  
- **Performance:** Conversion rates, deal closure times
- **Integration Health:** External API status and sync rates

---

## Testing Requirements

### API Testing Coverage
- **Unit Tests:** 95% code coverage minimum
- **Integration Tests:** All external API integrations
- **Performance Tests:** Load testing for 1000+ concurrent users
- **Security Tests:** Penetration testing, OWASP compliance

### Test Data Requirements
- **Development:** Realistic sample data for all entities
- **Staging:** Production-like data volumes
- **Performance:** 100K+ leads, 50K+ deals, 1K+ users

---

## Deployment & Environment

### Environment Configuration
- **Development:** Local development with Docker
- **Staging:** Production-like environment for testing
- **Production:** High-availability deployment with load balancers

### Database Requirements
- **Primary:** SQL Server 2019+ or PostgreSQL 13+ with Entity Framework Core
- **Cache:** Redis for distributed caching and session storage
- **Search:** Azure Search or Elasticsearch for advanced lead/contact search
- **Files:** Azure Blob Storage, AWS S3, or compatible object storage with ASP.NET Core integration

### Security Requirements
- **SSL/TLS:** Required for all API endpoints
- **Data Encryption:** At rest and in transit
- **Backup:** Daily automated backups with point-in-time recovery
- **Compliance:** GDPR, CCPA compliance for data handling

---

## Conclusion

This comprehensive API specification provides the foundation for implementing a robust, scalable SalesTracker CRM backend using **.NET 9.0.304 Web API**. The 73 endpoints across 11 modules cover all functionality identified in the frontend analysis, with particular emphasis on:

1. **Critical Priority (23 endpoints):** Authentication, Lead Management, and CRM Core
2. **High Priority (27 endpoints):** Analytics, Email, Routing, and Notifications  
3. **Medium Priority (7 endpoints):** Team Management and Integrations
4. **Low Priority (16 endpoints):** POS System and AI Assistant

### Key .NET 9.0.304 Implementation Features:
- **ASP.NET Core Controllers** with action-based routing
- **Data Annotations** for comprehensive model validation
- **PascalCase** property naming throughout all JSON responses
- **ProblemDetails** standard error responses for validation failures
- **Entity Framework Core** for database operations with strongly-typed models
- **SignalR Hubs** for real-time features replacing WebSocket endpoints
- **IFormFile** handling for secure file uploads with validation attributes
- **JWT Bearer Authentication** with ASP.NET Core Identity integration
- **Minimal API** patterns where appropriate for simple operations
- **Dependency Injection** for service layer architecture

### .NET-Specific Patterns Applied:
- **Strongly-typed request/response models** with validation attributes
- **Enum types** for status fields and categorical data
- **Guid identifiers** for all entity IDs
- **DateTime** types for all timestamp fields
- **Decimal** types for monetary values ensuring precision
- **Nullable reference types** enabled for improved null safety
- **Custom validation attributes** for business rules
- **ActionResult<T>** return types for consistent API responses

Each endpoint specification includes detailed C# model definitions, ASP.NET Core controller patterns, validation rules using data annotations, and standardized error handling. The implementation should prioritize Critical and High priority endpoints first, ensuring core CRM functionality is available before advancing to supplementary features.

The specification emphasizes SignalR real-time capabilities, comprehensive analytics through strongly-typed responses, intelligent automation with proper async/await patterns, and extensive integration possibilities - all implemented using modern .NET 9.0.304 Web API patterns and conventions for a robust CRM system serving diverse global markets with complex sales processes.