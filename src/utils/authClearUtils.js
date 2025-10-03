/**
 * Authentication Clear Utilities
 * Provides functions to completely clear all stored authentication data
 */

import useAuthStore from '../modules/auth/stores/authStore.js';
import useUserStore from '../stores/userStore.jsx';
import tokenManager from '../services/auth/tokenManager.js';

/**
 * Clear all authentication data from all storage mechanisms
 * This function ensures a complete reset of authentication state
 */
export const clearAllAuthData = () => {
  console.log('[AuthClearUtils] Starting complete authentication data clear...');
  
  try {
    // 1. Clear localStorage entries
    console.log('[AuthClearUtils] Clearing localStorage entries...');
    
    // Clear Zustand persisted stores
    localStorage.removeItem('auth-storage'); // authStore persistence key
    localStorage.removeItem('user-storage'); // userStore persistence key
    
    // Clear any potential token storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('session_token');
    
    // Clear any other auth-related keys that might exist
    const authKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('auth') || key.includes('token') || key.includes('user'))) {
        authKeys.push(key);
      }
    }
    
    authKeys.forEach(key => {
      console.log(`[AuthClearUtils] Removing localStorage key: ${key}`);
      localStorage.removeItem(key);
    });
    
    // 2. Clear sessionStorage entries
    console.log('[AuthClearUtils] Clearing sessionStorage entries...');
    
    sessionStorage.removeItem('auth-storage');
    sessionStorage.removeItem('user-storage');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('jwt_token');
    sessionStorage.removeItem('session_token');
    
    // Clear any other auth-related sessionStorage keys
    const sessionAuthKeys = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.includes('auth') || key.includes('token') || key.includes('user'))) {
        sessionAuthKeys.push(key);
      }
    }
    
    sessionAuthKeys.forEach(key => {
      console.log(`[AuthClearUtils] Removing sessionStorage key: ${key}`);
      sessionStorage.removeItem(key);
    });
    
    // 3. Clear tokens using tokenManager
    console.log('[AuthClearUtils] Clearing tokens via tokenManager...');
    if (tokenManager && typeof tokenManager.clearTokens === 'function') {
      tokenManager.clearTokens();
    }
    
    // 4. Reset authStore state
    console.log('[AuthClearUtils] Resetting authStore state...');
    const authStore = useAuthStore.getState();
    authStore.logout();
    
    // Force reset authStore to initial state
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitializing: false,
      error: null,
      rememberMe: false
    });
    
    // 5. Reset userStore preferences only (no authentication state)
    console.log('[AuthClearUtils] Resetting userStore preferences...');
    // userStore no longer handles authentication - only preferences
    // No need to reset currentUser or isAuthenticated as they're deprecated
    
    console.log('[AuthClearUtils] Authentication data clear completed successfully');
    
    return {
      success: true,
      message: 'All authentication data cleared successfully'
    };
    
  } catch (error) {
    console.error('[AuthClearUtils] Error clearing authentication data:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check what authentication data is currently stored
 * Useful for debugging and verification
 */
export const checkStoredAuthData = () => {
  console.log('[AuthClearUtils] Checking stored authentication data...');
  
  const authData = {
    localStorage: {},
    sessionStorage: {},
    authStore: {},
    userStore: {}
  };
  
  // Check localStorage
  console.log('[AuthClearUtils] Checking localStorage...');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('auth') || key.includes('token') || key.includes('user'))) {
      try {
        const value = localStorage.getItem(key);
        authData.localStorage[key] = value ? JSON.parse(value) : value;
      } catch {
        authData.localStorage[key] = localStorage.getItem(key);
      }
    }
  }
  
  // Check sessionStorage
  console.log('[AuthClearUtils] Checking sessionStorage...');
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('auth') || key.includes('token') || key.includes('user'))) {
      try {
        const value = sessionStorage.getItem(key);
        authData.sessionStorage[key] = value ? JSON.parse(value) : value;
      } catch {
        authData.sessionStorage[key] = sessionStorage.getItem(key);
      }
    }
  }
  
  // Check authStore state
  console.log('[AuthClearUtils] Checking authStore state...');
  const authStore = useAuthStore.getState();
  authData.authStore = {
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,
    isInitializing: authStore.isInitializing,
    error: authStore.error,
    rememberMe: authStore.rememberMe
  };
  
  // Check userStore state (preferences only - authentication moved to authStore)
  console.log('[AuthClearUtils] Checking userStore preferences...');
  const userStore = useUserStore.getState();
  authData.userStore = {
    preferences: userStore.preferences,
    // Note: currentUser and isAuthenticated are deprecated - check authStore instead
    hasDeprecatedAuthState: !!(userStore.currentUser || userStore.isAuthenticated)
  };
  
  console.log('[AuthClearUtils] Stored authentication data:', authData);
  return authData;
};

/**
 * Force logout with complete data clear
 * Combines logout with complete data clearing
 */
export const forceLogoutAndClear = async () => {
  console.log('[AuthClearUtils] Starting force logout and clear...');
  
  try {
    // First attempt normal logout
    const authStore = useAuthStore.getState();
    await authStore.logout();
    
    // Then clear all stored data
    const clearResult = clearAllAuthData();
    
    // Force page reload to ensure clean state
    console.log('[AuthClearUtils] Force logout completed, reloading page...');
    window.location.reload();
    
    return clearResult;
    
  } catch (error) {
    console.error('[AuthClearUtils] Error during force logout:', error);
    
    // Even if logout fails, clear the data
    const clearResult = clearAllAuthData();
    
    // Force page reload anyway
    window.location.reload();
    
    return clearResult;
  }
};

export default {
  clearAllAuthData,
  checkStoredAuthData,
  forceLogoutAndClear
};