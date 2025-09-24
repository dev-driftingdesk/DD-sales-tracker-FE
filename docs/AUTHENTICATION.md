# Authentication System Documentation

## Overview

The Sales Tracker authentication system provides secure user authentication with login, registration, and password recovery functionality. It uses Zustand for state management with persistence, ensuring users remain logged in across browser sessions when desired.

## Features

### 1. Login System
- **Email and password authentication**
- **Remember me functionality** - persists session across browser restarts
- **Form validation** with real-time error feedback
- **Demo accounts** for easy testing
- **Loading states** and error handling
- **Modern UI** with split-screen design

### 2. Registration System
- **Complete user registration flow**
- **Password strength indicator** with visual feedback
- **Confirm password validation**
- **Terms and conditions acceptance**
- **Company information collection**
- **Automatic login after registration**

### 3. Password Recovery
- **Email-based password reset**
- **Cooldown timer** to prevent spam (60 seconds)
- **Success state** with clear instructions
- **Demo email suggestions** for testing
- **Back navigation** to login

### 4. Session Management
- **Persistent sessions** using Zustand persist middleware
- **Selective state persistence** based on remember me option
- **Automatic logout** functionality
- **User profile display** in sidebar
- **Protected routes** requiring authentication

## Architecture

### File Structure
```
src/modules/auth/
├── AuthContainer.jsx        # Main auth routing component
├── components/
│   ├── Login.jsx           # Login page component
│   ├── Register.jsx        # Registration page component
│   └── ForgotPassword.jsx  # Password recovery component
└── stores/
    └── authStore.js        # Zustand authentication store
```

### State Management

The authentication store (`authStore.js`) manages:
- **User state** - current user information
- **Authentication status** - isAuthenticated flag
- **Loading states** - for async operations
- **Error handling** - error messages and clearing
- **Remember me** - session persistence preference

### Data Flow

1. **Login Flow**:
   ```
   User Input → Validation → Store Login Action → Success/Error → Update UI
   ```

2. **Registration Flow**:
   ```
   User Input → Validation → Store Register Action → Auto Login → Success
   ```

3. **Password Reset Flow**:
   ```
   Email Input → Validation → Store Reset Action → Success State → Email Sent
   ```

## Demo Accounts

For testing purposes, the following demo accounts are available:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@salestracker.com | admin123 | Full system access |
| Manager | manager@salestracker.com | manager123 | Team management access |
| Sales Rep | sales@salestracker.com | sales123 | Basic sales features |

## UI/UX Design

### Color Scheme
- **Primary Gradient**: Teal (600) → Cyan (600) → Blue (600)
- **Background**: Light gradient from teal-50 via cyan-50 to blue-50
- **Success States**: Green tones
- **Error States**: Red tones

### Layout
- **Split Screen Design**: Form on left, feature showcase on right
- **Mobile Responsive**: Stacks vertically on smaller screens
- **Card-based Forms**: Clean, modern appearance
- **Smooth Transitions**: 200ms standard animation duration

### Components

#### Login Page
- Email and password fields with icons
- Show/hide password toggle
- Remember me checkbox
- Forgot password link
- Sign up link
- Demo account quick-select buttons

#### Register Page
- Full name field
- Email field
- Company name field
- Password field with strength indicator
- Confirm password field
- Terms acceptance checkbox
- Sign in link

#### Forgot Password Page
- Email field
- Send reset link button
- Resend functionality with cooldown
- Back to login navigation
- Demo email suggestions

## Security Features

### Password Requirements
- Minimum 6 characters
- Strength indicator shows:
  - Very Weak (1/5): 6+ characters
  - Weak (2/5): 8+ characters
  - Fair (3/5): Contains uppercase
  - Good (4/5): Contains numbers
  - Strong (5/5): Contains special characters

### Form Validation
- **Email validation**: Proper email format required
- **Required fields**: All fields must be filled
- **Password matching**: Confirm password must match
- **Real-time feedback**: Errors clear as user types

### Session Security
- **Selective persistence**: Only saves session if remember me is checked
- **Secure logout**: Clears all session data
- **Protected routes**: Redirects to login if not authenticated

## Integration with Main App

### App.jsx Integration
```javascript
// Authentication check
if (!isAuthenticated) {
  return <AuthContainer onAuthSuccess={handleAuthSuccess} />;
}

// User profile in sidebar
<div className="bg-gray-800 rounded-xl p-4">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-full">
      <span>{user?.name?.charAt(0)?.toUpperCase()}</span>
    </div>
    <div>
      <p>{user?.name}</p>
      <p>{user?.company}</p>
    </div>
    <button onClick={handleLogout}>
      <LogOut />
    </button>
  </div>
</div>
```

## API Integration (Future)

The current implementation uses a mock user database. For production:

1. Replace mock authentication in `authStore.js` with API calls
2. Implement JWT token management
3. Add refresh token functionality
4. Secure password hashing on backend
5. Email verification for registration
6. Actual email sending for password reset

## Customization

### Adding New Fields
To add new fields to registration:
1. Update the `formData` state in `Register.jsx`
2. Add validation rules in `validateForm()`
3. Include field in UI with proper styling
4. Update the store's `register` action

### Styling Changes
- Colors defined in Tailwind classes
- Gradients use `bg-gradient-to-*` utilities
- Modify split-screen backgrounds in right panel
- Update form styling in component files

### Adding OAuth Providers
Future enhancement to add social login:
1. Add provider buttons to login/register
2. Implement OAuth flow in store
3. Handle provider-specific user data
4. Update UI to show social login options

## Troubleshooting

### Common Issues

1. **User stays logged in after closing browser**
   - This is intended behavior when "Remember me" is checked
   - To force logout, user must click logout button

2. **Password reset not working**
   - Currently shows success but doesn't send actual email
   - Implement email service for production

3. **Session expires unexpectedly**
   - Check if "Remember me" was unchecked
   - Verify browser storage settings

## Testing

### Manual Testing Checklist
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Register new account
- [ ] Password strength indicator updates
- [ ] Forgot password flow
- [ ] Remember me functionality
- [ ] Logout functionality
- [ ] Form validation messages
- [ ] Demo account buttons
- [ ] Mobile responsiveness

### Automated Testing (Future)
- Unit tests for store actions
- Component testing for forms
- Integration tests for auth flow
- E2E tests for complete user journey