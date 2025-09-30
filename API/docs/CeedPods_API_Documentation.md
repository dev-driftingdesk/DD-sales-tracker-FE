# CeedPods API Documentation

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [Base URLs & Environment](#base-urls--environment)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Authentication Endpoints](#authentication-endpoints)
- [User Management Endpoints](#user-management-endpoints)
- [Lead Management Endpoints](#lead-management-endpoints)
- [Lead Activities Endpoints](#lead-activities-endpoints)
- [Lead Notes Endpoints](#lead-notes-endpoints)
- [Data Models](#data-models)
- [Enumerations](#enumerations)
- [Postman Collection](#postman-collection)

---

## Overview

The CeedPods API is a RESTful API built with ASP.NET Core 9.0 that provides comprehensive customer relationship management (CRM) functionality. It supports user authentication, lead management, activity tracking, and note management.

### API Features
- JWT-based authentication with refresh tokens
- User management with role-based access
- Lead lifecycle management
- Activity tracking and scheduling
- Note management with categorization
- Email verification and password reset
- Comprehensive error handling and validation

### API Versions
- **V1**: Authentication endpoints (`/api/v1/auth/*`)
- **V2**: Core business functionality (`/api/v2/users/*`, `/api/v2/leads/*`)

---

## Authentication

The API uses JWT (JSON Web Token) based authentication with the following flow:

1. **Register** or **Login** to obtain access and refresh tokens
2. **Include** the access token in the `Authorization` header for protected endpoints
3. **Refresh** the token when it expires using the refresh token
4. **Logout** to invalidate tokens

### Authorization Header Format
```
Authorization: Bearer {access_token}
```

### Protected Endpoints
All endpoints under `/api/v2/*` require authentication.

### Public Endpoints
- POST `/api/v1/auth/register`
- POST `/api/v1/auth/login`
- POST `/api/v1/auth/reset-password`
- POST `/api/v1/auth/reset-password/confirm`
- POST `/api/v1/auth/verify-email`

---

## Base URLs & Environment

### Development Environment
```
Base URL: http://localhost:5147
HTTPS URL: https://localhost:7109
```

### Required Environment Variables
- JWT secret key configuration
- SMTP server settings for email functionality
- Database connection string

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  },
  "errors": []
}
```

### Error Response
```json
{
  "success": false,
  "message": "Operation failed",
  "data": null,
  "errors": [
    "Specific error message"
  ]
}
```

### Validation Error Response
```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "FieldName": [
      "Field validation error message"
    ]
  },
  "traceId": "trace-id-here"
}
```

---

## Error Handling

### HTTP Status Codes
- **200** - Success
- **201** - Created
- **400** - Bad Request (validation errors)
- **401** - Unauthorized (authentication required)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **409** - Conflict (duplicate resource)
- **500** - Internal Server Error

### Common Error Scenarios
- Invalid JWT token → 401 Unauthorized
- Missing required fields → 400 Bad Request
- Resource not found → 404 Not Found
- Duplicate email/username → 409 Conflict

---

# Authentication Endpoints

## POST /api/v1/auth/register
Register a new user account.

### Request Body
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "company": "Example Corp",
  "phone": "+1234567890",
  "role": "SalesRep"
}
```

### Request Body Schema
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| name | string | ✅ | 2-100 chars | Full name of the user |
| email | string | ✅ | Valid email | User's email address |
| password | string | ✅ | Min 8 chars, uppercase, lowercase, number | User's password |
| company | string | ❌ | Max 200 chars | Company name |
| phone | string | ❌ | - | Phone number |
| role | string | ❌ | Default: "SalesRep" | User role |

### Success Response (200)
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresAt": "2024-01-01T12:00:00Z",
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "SalesRep",
      "isActive": true,
      "createdAt": "2024-01-01T10:00:00Z"
    }
  }
}
```

### Error Response (400)
```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Name": ["Name is required", "Name must be between 2 and 100 characters"],
    "Email": ["Email is required", "Email must be in valid format"],
    "Password": ["Password must contain at least one uppercase letter, one lowercase letter, and one number"]
  }
}
```

---

## POST /api/v1/auth/login
Authenticate user and obtain access token.

### Request Body
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "rememberMe": false
}
```

### Request Body Schema
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | ✅ | User's email address |
| password | string | ✅ | User's password |
| rememberMe | boolean | ❌ | Extend token expiration (default: false) |

### Success Response (200)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresAt": "2024-01-01T12:00:00Z",
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "+1234567890",
      "role": "SalesRep",
      "defaultCommissionPercentage": 10.0,
      "isActive": true,
      "createdAt": "2024-01-01T10:00:00Z",
      "reportingManagerId": null,
      "teamId": null
    }
  }
}
```

### Error Response (401)
```json
{
  "success": false,
  "message": "Invalid email or password",
  "data": null,
  "errors": ["Authentication failed"]
}
```

---

## POST /api/v1/auth/refresh
Refresh the access token using a refresh token.

### Request Body
```json
{
  "refreshToken": "refresh_token_here"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new_access_token_here",
    "refreshToken": "new_refresh_token_here",
    "expiresAt": "2024-01-01T12:00:00Z"
  }
}
```

---

## POST /api/v1/auth/reset-password
Request a password reset email.

### Request Body
```json
{
  "email": "john.doe@example.com"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Password reset email sent successfully",
  "data": null
}
```

---

## POST /api/v1/auth/reset-password/confirm
Confirm password reset with token.

### Request Body
```json
{
  "email": "john.doe@example.com",
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePassword123!"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": null
}
```

---

## POST /api/v1/auth/logout
Logout user and invalidate tokens.

### Request Body
```json
{
  "allDevices": false
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

---

## POST /api/v1/auth/verify-email
Verify user's email address.

### Request Body
```json
{
  "email": "john.doe@example.com",
  "token": "verification_token_from_email"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": null
}
```

---

# User Management Endpoints

All user management endpoints require authentication and are versioned under `/api/v2/users`.

## GET /api/v2/users
Get paginated list of users.

### Headers
```
Authorization: Bearer {access_token}
```

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | ❌ | 1 | Page number |
| pageSize | integer | ❌ | 10 | Items per page (max 100) |
| search | string | ❌ | - | Search in name, email, username |

### Example Request
```
GET /api/v2/users?page=1&pageSize=10&search=john
```

### Success Response (200)
```json
{
  "users": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "+1234567890",
      "role": "SalesRep",
      "defaultCommissionPercentage": 10.0,
      "isActive": true,
      "createdAt": "2024-01-01T10:00:00Z",
      "reportingManagerId": null,
      "teamId": null
    }
  ],
  "totalCount": 25,
  "page": 1,
  "pageSize": 10,
  "totalPages": 3,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

---

## GET /api/v2/users/{id}
Get user details by ID.

### Headers
```
Authorization: Bearer {access_token}
```

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | ✅ | User ID |

### Success Response (200)
```json
{
  "id": 1,
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+1234567890",
  "role": "SalesRep",
  "defaultCommissionPercentage": 10.0,
  "isActive": true,
  "emailVerified": true,
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-01T10:00:00Z",
  "reportingManagerId": 2,
  "reportingManagerName": "Jane Smith",
  "teamId": 1,
  "teamName": "Sales Team",
  "regionIds": [1, 2],
  "productIds": [1, 3, 5]
}
```

### Error Response (404)
```json
{
  "message": "User with ID 999 not found"
}
```

---

## POST /api/v2/users
Create a new user.

### Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Request Body
```json
{
  "username": "johndoe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "defaultCommissionPercentage": 10.0,
  "reportingManagerId": 2,
  "teamId": 1
}
```

### Request Body Schema
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| username | string | ✅ | Min 3 chars | Unique username |
| email | string | ✅ | Valid email | User's email address |
| password | string | ✅ | Complex password | User's password |
| firstName | string | ✅ | - | User's first name |
| lastName | string | ✅ | - | User's last name |
| phoneNumber | string | ❌ | - | Phone number |
| defaultCommissionPercentage | decimal | ❌ | 0-100 | Commission rate (default: 10.0) |
| reportingManagerId | integer | ❌ | - | Manager's user ID |
| teamId | integer | ❌ | - | Team ID |

### Success Response (201)
```json
{
  "id": 10,
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+1234567890",
  "role": "SalesRep",
  "defaultCommissionPercentage": 10.0,
  "isActive": true,
  "emailVerified": false,
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-01T10:00:00Z",
  "reportingManagerId": 2,
  "reportingManagerName": "Jane Smith",
  "teamId": 1,
  "teamName": "Sales Team",
  "regionIds": [],
  "productIds": []
}
```

---

## PUT /api/v2/users/{id}
Update an existing user.

### Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | ✅ | User ID to update |

### Request Body
```json
{
  "username": "johndoe_updated",
  "email": "john.doe.updated@example.com",
  "firstName": "John Updated",
  "lastName": "Doe Updated",
  "phoneNumber": "+1234567891",
  "defaultCommissionPercentage": 15.0,
  "reportingManagerId": 3,
  "teamId": 2,
  "regionIds": [1, 2, 3],
  "productIds": [1, 2, 4]
}
```

### Success Response (200)
```json
{
  "id": 10,
  "username": "johndoe_updated",
  "firstName": "John Updated",
  "lastName": "Doe Updated",
  "email": "john.doe.updated@example.com",
  "phoneNumber": "+1234567891",
  "role": "SalesRep",
  "defaultCommissionPercentage": 15.0,
  "isActive": true,
  "emailVerified": true,
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-01T11:00:00Z",
  "reportingManagerId": 3,
  "reportingManagerName": "Alice Johnson",
  "teamId": 2,
  "teamName": "Enterprise Sales",
  "regionIds": [1, 2, 3],
  "productIds": [1, 2, 4]
}
```

---

## PUT /api/v2/users/{id}/password
Update user's password.

### Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Request Body
```json
{
  "currentPassword": "CurrentPassword123!",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

### Success Response (200)
```json
{
  "message": "Password updated successfully"
}
```

### Error Response (400)
```json
{
  "message": "Current password is incorrect"
}
```

---

## DELETE /api/v2/users/{id}
Soft delete a user (sets IsActive to false).

### Headers
```
Authorization: Bearer {access_token}
```

### Success Response (200)
```json
{
  "message": "User deleted successfully"
}
```

---

## GET /api/v2/users/search
Search users by query string.

### Headers
```
Authorization: Bearer {access_token}
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | ✅ | Search term |
| page | integer | ❌ | Page number (default: 1) |
| pageSize | integer | ❌ | Items per page (default: 10) |

### Example Request
```
GET /api/v2/users/search?query=john&page=1&pageSize=5
```

### Success Response (200)
```json
{
  "users": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "+1234567890",
      "role": "SalesRep",
      "defaultCommissionPercentage": 10.0,
      "isActive": true,
      "createdAt": "2024-01-01T10:00:00Z",
      "reportingManagerId": null,
      "teamId": null
    }
  ],
  "totalCount": 3,
  "page": 1,
  "pageSize": 5,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPreviousPage": false
}
```

---

# Lead Management Endpoints

All lead management endpoints require authentication and are versioned under `/api/v2/leads`.

## GET /api/v2/leads
Get all leads with optional filtering and pagination.

### Headers
```
Authorization: Bearer {access_token}
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | integer | ❌ | Filter by lead status (1-9) |
| source | integer | ❌ | Filter by lead source (1-9) |
| assignedUserId | integer | ❌ | Filter by assigned user |
| teamId | integer | ❌ | Filter by team |
| searchTerm | string | ❌ | Search in names, email, company |
| page | integer | ❌ | Page number (default: 1) |
| pageSize | integer | ❌ | Items per page (default: 50) |

### Example Request
```
GET /api/v2/leads?status=1&source=1&page=1&pageSize=10
```

### Success Response (200)
```json
[
  {
    "id": 1,
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "phone": "+1234567890",
    "company": "Acme Corp",
    "jobTitle": "Marketing Manager",
    "status": 1,
    "source": 1,
    "score": 85,
    "assignedUserId": 2,
    "teamId": 1,
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:30:00Z",
    "lastContactedAt": "2024-01-01T09:00:00Z",
    "convertedAt": null,
    "assignedUser": {
      "id": 2,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    },
    "activities": [],
    "notes": []
  }
]
```

## POST /api/v2/leads
Create a new lead.

### Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Request Body
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "phone": "+1234567890",
  "company": "Acme Corp",
  "jobTitle": "Marketing Manager",
  "source": 1,
  "status": 1,
  "score": 0,
  "notes": [],
  "activities": []
}
```

### Success Response (201)
```json
{
  "id": 10,
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "phone": "+1234567890",
  "company": "Acme Corp",
  "jobTitle": "Marketing Manager",
  "status": 1,
  "source": 1,
  "score": 0,
  "assignedUserId": null,
  "teamId": null,
  "createdAt": "2024-01-01T11:00:00Z",
  "updatedAt": "2024-01-01T11:00:00Z",
  "lastContactedAt": null,
  "convertedAt": null,
  "assignedUser": null,
  "team": null,
  "activities": [],
  "notes": []
}
```

## PUT /api/v2/leads/{id}
Update an existing lead.

### Request Body
```json
{
  "id": 10,
  "firstName": "Jane Updated",
  "lastName": "Smith Updated",
  "email": "jane.smith.updated@example.com",
  "phone": "+1234567891",
  "company": "Acme Corp Updated",
  "jobTitle": "Senior Marketing Manager",
  "source": 1,
  "status": 2,
  "score": 75,
  "notes": [],
  "activities": []
}
```

---

# Lead Activities Endpoints

## POST /api/v2/leads/{id}/activities
Create a new activity for a lead.

### Request Body (String Enums)
```json
{
  "type": "Call",
  "subject": "Follow-up call",
  "description": "Discuss proposal and next steps",
  "scheduledAt": "2024-01-02T14:00:00Z",
  "status": "Scheduled",
  "notes": "Prepare pricing information"
}
```

### Request Body (Numeric Enums)
```json
{
  "type": 1,
  "subject": "Follow-up call", 
  "description": "Discuss proposal and next steps",
  "scheduledAt": "2024-01-02T14:00:00Z",
  "status": 1,
  "notes": "Prepare pricing information"
}
```

---

# Lead Notes Endpoints

## POST /api/v2/leads/{id}/notes
Create a new note for a lead.

### Request Body (Pinned Note)
```json
{
  "content": "Critical: Lead requires immediate follow-up",
  "isPrivate": false,
  "category": "General",
  "priority": 4,
  "tags": "urgent,follow-up,high-value",
  "isPinned": true
}
```

### Request Body (Regular Note)
```json
{
  "content": "Discussed product requirements during call",
  "isPrivate": false,
  "category": "Meeting", 
  "priority": 2,
  "tags": "requirements,discussion",
  "isPinned": false
}
```

---

# Data Models

## User Models

### User Entity
```json
{
  "id": 1,
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+1234567890",
  "role": "SalesRep",
  "defaultCommissionPercentage": 10.0,
  "isActive": true,
  "emailVerified": true,
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-01T10:00:00Z",
  "reportingManagerId": 2,
  "teamId": 1
}
```

---

# Enumerations

## Lead Status
| Value | Name | Description |
|-------|------|-------------|
| 1 | New | New lead, not yet contacted |
| 2 | Contacted | Initial contact made |
| 3 | Qualified | Lead has been qualified |
| 4 | Proposal | Proposal sent |
| 5 | Negotiation | In negotiation phase |
| 6 | Converted | Successfully converted |
| 7 | Lost | Lost opportunity |
| 8 | Unqualified | Not qualified |
| 9 | Archived | Archived lead |

## Lead Source
| Value | Name | Description |
|-------|------|-------------|
| 1 | Website | Website inquiry |
| 2 | Referral | Referral from existing customer |
| 3 | Email | Email campaign |
| 4 | SocialMedia | Social media |
| 5 | Advertisement | Advertisement |
| 6 | Event | Event or trade show |
| 7 | Cold_Call | Cold calling |
| 8 | Partner | Partner referral |
| 9 | Other | Other source |

## Activity Type
| Value | Name | Description |
|-------|------|-------------|
| 1 | Call | Phone call |
| 2 | Email | Email communication |
| 3 | Meeting | In-person or virtual meeting |
| 4 | Task | General task |
| 5 | Demo | Product demonstration |
| 6 | Proposal | Proposal presentation |
| 7 | Follow_Up | Follow-up activity |
| 8 | Other | Other activity type |

## Activity Status
| Value | Name | Description |
|-------|------|-------------|
| 1 | Scheduled | Activity is scheduled |
| 2 | In_Progress | Activity is in progress |
| 3 | Completed | Activity is completed |
| 4 | Cancelled | Activity was cancelled |
| 5 | Overdue | Activity is overdue |

## Note Category
| Value | Name | Description |
|-------|------|-------------|
| 1 | General | General notes |
| 2 | Meeting | Meeting notes |
| 3 | Follow_Up | Follow-up notes |
| 4 | Qualification | Qualification notes |
| 5 | Objection | Objection handling |
| 6 | Decision_Maker | Decision maker information |
| 7 | Budget | Budget information |
| 8 | Timeline | Timeline details |
| 9 | Competition | Competitive information |
| 10 | Technical | Technical details |

---

# Validation Rules

## Authentication Fields
- **Email**: Must be valid email format, required
- **Password**: Min 8 characters, uppercase, lowercase, number required
- **Name**: 2-100 characters, required for registration

## Lead Fields
- **First/Last Name**: Required
- **Email**: Valid email format, required
- **Status/Source**: Valid enum values (1-9)
- **Score**: Integer, defaults to 0

## Activity Fields
- **Type**: Required, valid enum (1-8)
- **Description**: Required, max 1000 characters
- **Subject**: Optional, max 200 characters

## Note Fields
- **Content**: Required, max 5000 characters
- **Priority**: Valid enum (1-4)

---

# Postman Collection

A comprehensive Postman collection is available: `CeedPods_API_Collection.postman_collection.json`

## Collection Features
- **31 endpoints** covering all API functionality
- **Environment variables** for baseUrl, tokens, and IDs
- **Automatic token management** via test scripts
- **Request examples** for all data types

## Environment Variables
```json
{
  "baseUrl": "http://localhost:5147",
  "accessToken": "",
  "refreshToken": "",
  "userId": "",
  "leadId": ""
}
```

---

# Getting Started

## Prerequisites
- .NET 9.0 SDK
- MySQL database
- SMTP server for email functionality

## Quick Start
1. **Clone the repository**
2. **Configure appsettings.json** with database and SMTP settings
3. **Run database migrations**
4. **Start the API**: `dotnet run`
5. **Import Postman collection** for testing
6. **Register/Login** to get started

## Development Server
```bash
# HTTP
http://localhost:5147

# HTTPS  
https://localhost:7109
```

---

*CeedPods API Documentation - Version 1.0*