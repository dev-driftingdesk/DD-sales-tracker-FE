# Authentication Fallback Testing Guide

## Test Scenarios

### Scenario 1: Backend Down with API Integration Enabled
**Setup:**
- Ensure `.env.development` has `VITE_ENABLE_API_INTEGRATION=true`
- Ensure backend at localhost:5555 is NOT running
- Clear browser storage (localStorage/sessionStorage)

**Expected Behavior:**
1. Application should start without errors
2. Login page should show "Demo Mode" status indicator
3. Users can login with demo credentials:
   - `sara@salestracker.com` with any password
   - `maria@salestracker.com` with any password  
   - `admin@salestracker.com` with any password
   - `demo@salestracker.com` with any password
4. After login, status should show "Connected in demo mode - backend unavailable"
5. Application should work normally with mock data

### Scenario 2: Backend Available with API Integration
**Setup:**
- Backend at localhost:5555 is running
- Clear browser storage

**Expected Behavior:**
1. Login page should show "API Mode" status indicator
2. Authentication should use real backend API
3. Status should show "Connected to backend API"

### Scenario 3: Backend Becomes Unavailable During Session
**Setup:**
- Start with backend running
- Login successfully
- Stop backend server

**Expected Behavior:**
1. System should detect backend unavailability
2. Status should change to offline mode
3. User should remain authenticated using token
4. Application should continue functioning with existing data

## Demo Credentials for Testing

Use any of these accounts with any password (or no password):
- **Admin**: `admin@salestracker.com`
- **Sara Ahmed**: `sara@salestracker.com` 
- **Maria Rodriguez**: `maria@salestracker.com`
- **Demo User**: `demo@salestracker.com`

## Key Features to Verify

### Backend Detection
- [ ] Automatic backend availability checking
- [ ] 30-second cache for backend status
- [ ] Quick 3-second timeout for health checks
- [ ] Proper fallback when backend is down

### User Experience
- [ ] Clear status indicators (API Mode vs Demo Mode)
- [ ] Helpful demo account suggestions
- [ ] No authentication failures when backend is down
- [ ] Seamless login experience regardless of backend status

### Error Handling
- [ ] Network errors properly detected
- [ ] Graceful fallback to mock authentication
- [ ] Clear error messages when login fails
- [ ] No crashes or infinite loading states

## Technical Implementation

### Enhanced AuthService Features
- `checkBackendAvailability()` - Intelligent backend detection
- `performMockLogin()` - Fallback authentication
- `isNetworkOrBackendError()` - Error classification
- Network error detection patterns
- Backend status caching

### Enhanced AuthStore Features
- `backendStatus` - Current connectivity status
- `authMode` - Current authentication mode (api/mock)
- `statusMessage` - User-friendly status text
- Automatic backend status updates
- Enhanced initialization flow

### UI Components
- `BackendStatusIndicator` - Shows current mode
- Enhanced login form with demo credentials
- Clear status messaging throughout application

## Success Criteria

✅ **Authentication Never Fails**: Users can always login regardless of backend status
✅ **Clear Status Feedback**: Users always know what mode they're in
✅ **Seamless Experience**: No difference in UI/UX between modes
✅ **Intelligent Fallback**: Automatic detection and fallback
✅ **Recovery Support**: System recovers when backend comes back online