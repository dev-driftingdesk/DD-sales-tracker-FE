# Authentication Clear Guide

This guide provides multiple methods to completely clear all stored authentication data and prevent automatic login as Jacob Williams or any other user.

## Problem

The application was automatically logging in as Jacob Williams after page refreshes due to persisted authentication data in browser storage.

## Solution

This solution provides multiple ways to clear all authentication data:

### Method 1: Development Tools in the App (Recommended)

If you have the development server running, the easiest method is to use the built-in development tools:

1. **Start the development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Look for the "Dev Tools: Authentication" panel** in the bottom-right corner of the screen

3. **Check stored data**:
   - Click "Check Stored Auth Data" to see what authentication data is currently stored
   - This will show localStorage, sessionStorage, authStore, and userStore contents

4. **Clear authentication data**:
   - Click "Force Logout & Reload" to clear all data and reload the page
   - OR click "Clear Auth Data Only" to clear without reloading

### Method 2: Browser Developer Console

1. **Open browser Developer Tools** (F12 or right-click → Inspect)

2. **Go to the Console tab**

3. **Clear localStorage** (paste and run):
   ```javascript
   // Clear all auth-related localStorage entries
   const authKeys = [];
   for (let i = 0; i < localStorage.length; i++) {
     const key = localStorage.key(i);
     if (key && (key.includes('auth') || key.includes('token') || key.includes('user'))) {
       authKeys.push(key);
     }
   }

   authKeys.forEach(key => {
     console.log('Removing:', key);
     localStorage.removeItem(key);
   });

   console.log('localStorage cleared!');
   ```

4. **Clear sessionStorage** (paste and run):
   ```javascript
   // Clear all auth-related sessionStorage entries
   const sessionAuthKeys = [];
   for (let i = 0; i < sessionStorage.length; i++) {
     const key = sessionStorage.key(i);
     if (key && (key.includes('auth') || key.includes('token') || key.includes('user'))) {
       sessionAuthKeys.push(key);
     }
   }

   sessionAuthKeys.forEach(key => {
     console.log('Removing:', key);
     sessionStorage.removeItem(key);
   });

   console.log('sessionStorage cleared!');
   ```

5. **Reload the page**:
   ```javascript
   window.location.reload();
   ```

### Method 3: Script Helper

Run the helper script for detailed instructions:

```bash
node clear-auth.js
```

This script provides the same instructions as Method 2 with formatted output.

### Method 4: Programmatic Clear (In App Code)

If you need to clear authentication data programmatically:

```javascript
import { clearAllAuthData, forceLogoutAndClear } from './src/utils/authClearUtils.js';

// Clear all auth data
const result = clearAllAuthData();
console.log(result);

// Or force logout and clear with page reload
await forceLogoutAndClear();
```

## What Gets Cleared

The clearing process removes:

### localStorage entries:
- `auth-storage` (authStore persistence)
- `user-storage` (userStore persistence)
- Any keys containing: `auth`, `token`, `user`

### sessionStorage entries:
- Same patterns as localStorage

### Store states:
- **authStore**: Reset to unauthenticated state
- **userStore**: Clear current user and authentication status

### Token storage:
- All token manager stored tokens
- Any JWT or access tokens

## Verification

After clearing authentication data, verify:

1. **Check storage is empty**:
   ```javascript
   console.log('auth-storage:', localStorage.getItem('auth-storage'));     // should be null
   console.log('user-storage:', localStorage.getItem('user-storage'));     // should be null
   ```

2. **Confirm login screen displays**:
   - Page should show login form, not dashboard
   - No automatic authentication should occur

3. **Test manual login**:
   - Users should be able to log in manually
   - Authentication should work normally after clearing

## Files Created/Modified

### New Files:
- `/src/utils/authClearUtils.js` - Utility functions for clearing auth data
- `/src/components/dev/AuthClearButton.jsx` - Development component for auth clearing
- `/clear-auth.js` - Helper script with instructions
- `/docs/AUTHENTICATION_CLEAR_GUIDE.md` - This documentation

### Modified Files:
- `/src/App.jsx` - Added AuthClearButton component (development only)

## Development vs Production

- The `AuthClearButton` component only displays in development mode (`!import.meta.env.PROD`)
- In production, use Methods 2 or 4 for clearing authentication data
- The utility functions work in both development and production environments

## Security Considerations

- This clearing process is safe and only removes authentication data
- No sensitive data is logged to console
- The process preserves all other application data
- Users can immediately log back in after clearing

## Troubleshooting

If automatic login still occurs after clearing:

1. **Check browser cache**: Clear browser cache completely
2. **Check cookies**: Clear any authentication-related cookies
3. **Check browser extensions**: Disable any auto-fill or authentication extensions
4. **Hard refresh**: Use Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

## Success Criteria Met

✅ **No automatic login as Jacob Williams or any other user**  
✅ **Users must manually authenticate through login form**  
✅ **Page refresh shows login screen, not authenticated dashboard**  
✅ **All authentication storage is properly cleared**  
✅ **Clean reset of the authentication system achieved**  
✅ **Process is documented and repeatable**  

The authentication system now properly requires manual login and does not persist unwanted authentication state.