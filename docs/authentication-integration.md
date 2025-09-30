# Authentication API Integration Documentation

## Overview

This document provides comprehensive guidance for the CeedPods API authentication integration implemented in the SalesTracker CRM frontend. The integration replaces the previous mock authentication system with real API calls while maintaining backward compatibility with existing components.

## Architecture

### Core Components

1. **API Client** (`src/services/apiClient.js`)
   - Centralized HTTP client using Axios
   - Automatic token management and refresh
   - Request/response interceptors
   - Error handling and retry logic

2. **Authentication Service** (`src/services/authService.js`)
   - All authentication API endpoints
   - Token management utilities
   - Error handling and user-friendly messages
   - Session management

3. **Authentication Store** (`src/modules/auth/stores/authStore.js`)
   - Updated Zustand store with API integration
   - Maintains existing interface for component compatibility
   - Enhanced state management for verification flows

4. **Custom Hooks** (`src/hooks/useAuth.js`)
   - Convenient authentication functionality
   - Route protection hooks
   - Rate limiting management
   - Session validation

5. **Utility Functions**
   - `src/utils/validation.js` - Client-side form validation
   - `src/utils/errorHandling.js` - Centralized error handling

## API Endpoints Integration

### Implemented Endpoints

| Endpoint | Method | Purpose | Implementation |
|----------|--------|---------|----------------|
| `/api/v1/auth/register` | POST | User registration | `AuthService.register()` |
| `/api/v1/auth/login` | POST | User authentication | `AuthService.login()` |
| `/api/v1/auth/refresh` | POST | Token refresh | `AuthService.refreshToken()` |
| `/api/v1/auth/reset-password` | POST | Password reset request | `AuthService.resetPassword()` |
| `/api/v1/auth/reset-password/confirm` | POST | Password reset confirmation | `AuthService.resetPasswordConfirm()` |
| `/api/v1/auth/logout` | POST | User logout | `AuthService.logout()` |
| `/api/v1/auth/verify-email` | POST | Email verification | `AuthService.verifyEmail()` |

### Request/Response Format

#### Registration Request
```javascript
{
  email: "user@example.com",
  password: "SecurePassword123!",
  firstName: "John",
  lastName: "Doe",
  name: "John Doe",
  phone: "+1234567890", // optional
  role: "sales_rep"
}
```

#### Login Request
```javascript
{
  email: "user@example.com",
  password: "SecurePassword123!",
  rememberMe: true
}
```

#### Standard Success Response
```javascript
{
  data: {
    user: {
      id: "1",
      email: "user@example.com",
      name: "John Doe",
      role: "sales_rep"
    },
    accessToken: "jwt-access-token",
    refreshToken: "jwt-refresh-token",
    expiresIn: 3600
  }
}
```

## Security Implementation

### Token Management

1. **Storage Strategy**
   - Access tokens: localStorage (configurable)
   - Refresh tokens: localStorage (configurable)
   - Production consideration: httpOnly cookies for enhanced security

2. **Automatic Token Refresh**
   - Interceptor-based refresh before expiration
   - Seamless user experience
   - Automatic logout on refresh failure

3. **Token Validation**
   - JWT expiration checking
   - Automatic cleanup of expired tokens
   - Real-time session monitoring

### Security Features

1. **Rate Limiting**
   - Client-side login attempt tracking
   - Configurable attempt limits and cooldown periods
   - User-friendly feedback for rate limiting

2. **Input Validation**
   - Client-side validation with server-side backup
   - Password strength requirements
   - Email format validation
   - XSS prevention

3. **Error Handling**
   - User-friendly error messages
   - No sensitive information exposure
   - Comprehensive error logging

## Environment Configuration

### Required Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_API_TIMEOUT=10000

# Authentication Configuration
VITE_TOKEN_STORAGE_TYPE=localStorage
VITE_ENABLE_TOKEN_REFRESH=true
VITE_TOKEN_REFRESH_THRESHOLD=300

# Security Configuration
VITE_MAX_LOGIN_ATTEMPTS=5
VITE_LOGIN_COOLDOWN_MINUTES=15

# Feature Flags
VITE_ENABLE_EMAIL_VERIFICATION=true
VITE_ENABLE_REMEMBER_ME=true
VITE_ENABLE_PASSWORD_STRENGTH=true
```

### Configuration Options

- **VITE_API_BASE_URL**: Backend API base URL
- **VITE_TOKEN_STORAGE_TYPE**: Token storage method (localStorage, sessionStorage, httpOnly)
- **VITE_MAX_LOGIN_ATTEMPTS**: Maximum failed login attempts before lockout
- **VITE_LOGIN_COOLDOWN_MINUTES**: Lockout duration in minutes
- **VITE_ENABLE_EMAIL_VERIFICATION**: Enable email verification flow

## Component Integration

### Updated Authentication Store Interface

The store maintains backward compatibility while adding new features:

```javascript
// Existing interface (maintained)
{
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: async (email, password, rememberMe),
  register: async (userData),
  logout: () => {},
  resetPassword: async (email),
  updatePassword: async (token, newPassword),
  clearError: () => {},
  updateUser: (updates) => {}
}

// New additions
{
  emailVerificationRequired: false,
  passwordResetSent: false,
  verifyEmail: async (token),
  resendVerificationEmail: async (email),
  refreshUserProfile: async (),
  initializeAuth: async ()
}
```

### Enhanced Components

1. **Login Component**
   - Rate limiting integration
   - Enhanced error handling
   - Email verification alerts
   - Improved UX with loading states

2. **Register Component**
   - Real-time password strength validation
   - Enhanced form validation
   - Email verification flow support
   - Terms and conditions integration

3. **Email Verification Component** (New)
   - Email verification code input
   - Resend verification email
   - Automatic redirect after verification
   - Cooldown timer for resend attempts

## Usage Examples

### Basic Authentication

```javascript
import { useAuth } from '../hooks/useAuth';

function LoginComponent() {
  const { login, isLoading, error } = useAuth();
  
  const handleLogin = async (email, password) => {
    const result = await login(email, password, true);
    if (result.success) {
      // Handle successful login
      console.log('User logged in:', result.user);
    } else {
      // Handle login error
      console.error('Login failed:', result.error);
    }
  };
  
  return (
    // Login form JSX
  );
}
```

### Route Protection

```javascript
import { useAuthGuard } from '../hooks/useAuth';

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthGuard('/login');
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null; // Redirecting...
  
  return <div>Protected content</div>;
}
```

### Role-Based Access

```javascript
import { useRoleGuard } from '../hooks/useAuth';

function AdminOnlyComponent() {
  const { hasRequiredRole } = useRoleGuard(['admin'], '/unauthorized');
  
  if (!hasRequiredRole) return null;
  
  return <div>Admin content</div>;
}
```

## Testing

### Test Coverage

1. **Unit Tests** (`tests/unit/auth/`)
   - AuthService methods
   - Token management
   - Validation functions
   - Error handling

2. **Integration Tests** (`tests/integration/auth/`)
   - Complete authentication flows
   - API integration scenarios
   - Error handling paths
   - Session management

### Running Tests

```bash
# Run all authentication tests
npm run test:unit -- --testPathPattern=auth
npm run test:integration -- --testPathPattern=auth

# Run with coverage
npm run test:coverage -- --testPathPattern=auth

# Run specific test suites
npm test -- authService.test.js
npm test -- authFlow.test.js
```

### Mock Server

For testing without a backend:

```bash
# Start mock server
npm run mockserver:start

# Run tests with mocks
npm run test:with-mocks
```

## Error Handling

### Error Types

- **Network Errors**: Connection issues, timeouts
- **Authentication Errors**: Invalid credentials, expired tokens
- **Validation Errors**: Invalid input data
- **Rate Limiting**: Too many requests
- **Server Errors**: 5xx status codes

### User-Friendly Messages

The system provides user-friendly error messages:

```javascript
// Technical error
{ message: "ERR_NETWORK_TIMEOUT" }

// User-friendly message
"Network error. Please check your connection and try again."
```

### Error Recovery

1. **Automatic Retry**: For retryable errors (5xx, network)
2. **Token Refresh**: Automatic on 401 errors
3. **Graceful Degradation**: Fallback to cached data when possible
4. **User Guidance**: Clear instructions for resolution

## Performance Considerations

### Optimization Strategies

1. **Token Caching**: Avoid unnecessary API calls
2. **Request Debouncing**: Prevent duplicate requests
3. **Background Refresh**: Proactive token renewal
4. **Lazy Loading**: Load authentication components on demand

### Monitoring

- Authentication success/failure rates
- Token refresh frequency
- Error occurrence patterns
- Response time metrics

## Security Best Practices

### Implementation Guidelines

1. **Never log sensitive data** (passwords, tokens)
2. **Use HTTPS in production**
3. **Implement CSRF protection** if using cookies
4. **Validate all input** on client and server
5. **Use secure token storage** (httpOnly cookies recommended)
6. **Implement proper session timeout**
7. **Monitor for suspicious activity**

### Production Checklist

- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] Token storage method evaluated
- [ ] Rate limiting configured
- [ ] Error logging implemented
- [ ] Security headers configured
- [ ] CORS settings reviewed
- [ ] Input validation comprehensive

## Migration Guide

### From Mock to Real API

1. **Update Environment**: Configure API endpoints
2. **Test Integration**: Verify all flows work
3. **Update Components**: Minimal changes required
4. **Deploy Backend**: Ensure API is available
5. **Monitor**: Watch for issues in production

### Breaking Changes

- `updatePassword` method signature changed (now requires token)
- Added new state properties (`emailVerificationRequired`, `passwordResetSent`)
- Enhanced validation requirements

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify backend CORS configuration
   - Check API base URL

2. **Token Issues**
   - Clear localStorage/cookies
   - Verify token format and expiration

3. **Network Errors**
   - Check API endpoint availability
   - Verify network connectivity

4. **Validation Errors**
   - Review password requirements
   - Check email format

### Debug Tools

- Browser developer tools (Network tab)
- Console logging (development only)
- Error reporting service integration
- API monitoring tools

## Support

For technical support or questions:

1. Check this documentation
2. Review test files for examples
3. Check error logs for specific issues
4. Contact development team with specific error details

---

*Last updated: December 2024*
*Version: 1.0.0*
