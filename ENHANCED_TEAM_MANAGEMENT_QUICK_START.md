# Enhanced Team Management API - Quick Start Guide

## 🚀 Quick Start Testing

### Prerequisites
1. **API Server Running**: `http://localhost:5555`
2. **Postman Installed**: For API testing
3. **Admin Account**: Default admin credentials available

### Step 1: Import Postman Collection
```bash
# Import the collection file:
Enhanced_Team_Management_API_Collection.postman_collection.json
```

### Step 2: Authenticate as Admin
```http
POST http://localhost:5555/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "Admin123!"
}
```

### Step 3: Test Enhanced Features

#### 1. Invite a Manager
```http
POST http://localhost:5555/api/v2/enhanced-users/invite
Authorization: Bearer {your_jwt_token}

{
  "email": "manager@company.com",
  "role": "Manager",
  "invitationMessage": "Welcome to our enhanced team!"
}
```

#### 2. Create a Team
```http
POST http://localhost:5555/api/v2/enhanced-teams
Authorization: Bearer {your_jwt_token}

{
  "name": "Sales Team Alpha",
  "description": "High-performance sales team",
  "teamLeaderId": 2
}
```

#### 3. Test Tenant Isolation
```http
GET http://localhost:5555/api/v2/enhanced-users
Authorization: Bearer {your_jwt_token}

# Should only return users from your admin organization
```

#### 4. Test Role-Based Access
```http
POST http://localhost:5555/api/v2/enhanced-users/invite
# Try with different role tokens - only Admin should succeed
```

## 🔍 Key Testing Points

### ✅ Security Validation
- **Authentication Required**: All endpoints return 401 without token
- **Role-Based Access**: Admin-only endpoints return 403 for non-admin users
- **Tenant Isolation**: Users only see data from their admin organization

### ✅ Functionality Validation
- **User Invitation**: Email-based secure invitation system
- **Team Management**: Hierarchical team structure with leaders
- **Multi-Team Membership**: Users can belong to multiple teams
- **Audit Logging**: All actions logged for compliance

### ✅ API Response Validation
- **Consistent Structure**: All responses follow standard format
- **Error Handling**: Proper error messages and status codes
- **Data Filtering**: All data automatically filtered by AdminId

## 📊 Expected Results

### Successful Authentication
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "admin@company.com",
    "role": "Admin",
    "adminId": 1
  }
}
```

### Successful User Invitation
```json
{
  "id": 123,
  "email": "manager@company.com",
  "role": "Manager",
  "status": "Pending",
  "invitationToken": "secure_token_here",
  "expiresAt": "2024-01-15T10:30:00Z"
}
```

### Successful Team Creation
```json
{
  "id": 10,
  "name": "Sales Team Alpha",
  "adminId": 1,
  "teamLeaderId": 2,
  "isActive": true,
  "createdAt": "2024-01-01T10:30:00Z"
}
```

## 🚨 Common Issues & Solutions

### Issue: 401 Unauthorized
**Solution**: Ensure JWT token is included in Authorization header
```http
Authorization: Bearer your_jwt_token_here
```

### Issue: 403 Forbidden
**Solution**: Check user role - some endpoints require Admin privileges

### Issue: Empty Results
**Solution**: Data is filtered by AdminId - ensure you're logged in as correct admin

### Issue: Migration Errors
**Solution**: Check database connection and run migrations
```bash
dotnet ef database update
```

## 📞 Need Help?

1. **Check API Documentation**: `ENHANCED_TEAM_MANAGEMENT_DOCUMENTATION.md`
2. **Review Postman Collection**: All endpoints with examples included
3. **Check Server Logs**: Console output shows detailed request/response information
4. **Validate Database Schema**: Ensure all migrations applied correctly

---

**Ready to test the Enhanced Team Management System!** 🎉