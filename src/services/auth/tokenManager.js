/**
 * JWT Token Management
 * Handles secure storage, validation, and refresh of JWT tokens
 */

import { getConfig } from '../api/config.js';

// Token storage keys
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN_TIMESTAMP: 'auth_token_timestamp',
  TOKEN_EXPIRES_AT: 'auth_token_expires_at'
};

/**
 * Get storage instance based on configuration
 * @returns {Storage} localStorage or sessionStorage
 */
const getStorage = () => {
  const storageType = getConfig('tokenStorageType', 'localStorage');
  return storageType === 'sessionStorage' ? sessionStorage : localStorage;
};

/**
 * Store authentication tokens securely
 * @param {string} accessToken - JWT access token
 * @param {string} refreshToken - JWT refresh token  
 * @param {number} expiresIn - Token expiration time in seconds
 */
export const storeTokens = (accessToken, refreshToken, expiresIn) => {
  const storage = getStorage();
  const timestamp = Date.now();
  const expiresAt = timestamp + (expiresIn * 1000);
  
  storage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
  storage.setItem(TOKEN_KEYS.TOKEN_TIMESTAMP, timestamp.toString());
  storage.setItem(TOKEN_KEYS.TOKEN_EXPIRES_AT, expiresAt.toString());
  
  if (refreshToken) {
    storage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
  }
  
  // Dispatch event for token update
  window.dispatchEvent(new CustomEvent('auth:tokens-updated', {
    detail: { accessToken, refreshToken, expiresAt }
  }));
};

/**
 * Get stored access token
 * @returns {string|null} Access token or null if not found
 */
export const getAccessToken = () => {
  const storage = getStorage();
  return storage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
};

/**
 * Get stored refresh token
 * @returns {string|null} Refresh token or null if not found
 */
export const getRefreshToken = () => {
  const storage = getStorage();
  return storage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
};

/**
 * Remove all stored tokens
 */
export const clearTokens = () => {
  const storage = getStorage();
  Object.values(TOKEN_KEYS).forEach(key => {
    storage.removeItem(key);
  });
  
  // Dispatch event for token removal
  window.dispatchEvent(new CustomEvent('auth:tokens-cleared'));
};

/**
 * Check if access token exists
 * @returns {boolean} True if access token exists
 */
export const hasAccessToken = () => {
  return !!getAccessToken();
};

/**
 * Check if refresh token exists
 * @returns {boolean} True if refresh token exists
 */
export const hasRefreshToken = () => {
  return !!getRefreshToken();
};

/**
 * Get token expiration timestamp
 * @returns {number|null} Expiration timestamp or null
 */
export const getTokenExpiresAt = () => {
  const storage = getStorage();
  const expiresAt = storage.getItem(TOKEN_KEYS.TOKEN_EXPIRES_AT);
  return expiresAt ? parseInt(expiresAt) : null;
};

/**
 * Get token creation timestamp
 * @returns {number|null} Creation timestamp or null
 */
export const getTokenTimestamp = () => {
  const storage = getStorage();
  const timestamp = storage.getItem(TOKEN_KEYS.TOKEN_TIMESTAMP);
  return timestamp ? parseInt(timestamp) : null;
};

/**
 * Check if access token is expired
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = () => {
  const expiresAt = getTokenExpiresAt();
  if (!expiresAt) return true;
  
  return Date.now() >= expiresAt;
};

/**
 * Check if token needs refresh based on threshold
 * @returns {boolean} True if token should be refreshed
 */
export const shouldRefreshToken = () => {
  if (!getConfig('enableTokenRefresh', true)) return false;
  
  const expiresAt = getTokenExpiresAt();
  if (!expiresAt) return false;
  
  const threshold = getConfig('tokenRefreshThreshold', 300) * 1000; // Convert to milliseconds
  const timeUntilExpiry = expiresAt - Date.now();
  
  return timeUntilExpiry <= threshold;
};

/**
 * Calculate remaining token lifetime in seconds
 * @returns {number} Remaining seconds, 0 if expired
 */
export const getTokenRemainingTime = () => {
  const expiresAt = getTokenExpiresAt();
  if (!expiresAt) return 0;
  
  const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  return remaining;
};

/**
 * Parse JWT token payload (without verification)
 * @param {string} token - JWT token to parse
 * @returns {object|null} Parsed payload or null if invalid
 */
export const parseTokenPayload = (token) => {
  if (!token) return null;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.warn('Failed to parse token payload:', error);
    return null;
  }
};

/**
 * Get user information from access token
 * @returns {object|null} User information or null
 */
export const getUserFromToken = () => {
  const token = getAccessToken();
  if (!token) return null;
  
  const payload = parseTokenPayload(token);
  if (!payload) return null;
  
  return {
    id: payload.sub || payload.user_id || payload.id,
    email: payload.email,
    name: payload.name || payload.full_name,
    role: payload.role || payload.roles?.[0],
    permissions: payload.permissions || [],
    exp: payload.exp,
    iat: payload.iat
  };
};

/**
 * Validate token format (basic validation)
 * @param {string} token - Token to validate
 * @returns {boolean} True if token format is valid
 */
export const isValidTokenFormat = (token) => {
  if (!token || typeof token !== 'string') return false;
  
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  try {
    // Try to decode each part
    parts.forEach(part => {
      atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    });
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Set up automatic token cleanup on tab close/refresh
 */
export const setupTokenCleanup = () => {
  const storage = getStorage();
  
  // Only clean up sessionStorage tokens on page unload
  if (storage === sessionStorage) {
    window.addEventListener('beforeunload', () => {
      clearTokens();
    });
  }
  
  // Set up periodic cleanup for expired tokens
  const cleanupInterval = setInterval(() => {
    if (isTokenExpired() && !hasRefreshToken()) {
      clearTokens();
    }
  }, 60000); // Check every minute
  
  // Clean up interval on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(cleanupInterval);
  });
};

/**
 * Synchronize auth state across tabs (for localStorage only)
 */
export const setupCrossTabSync = () => {
  if (getStorage() !== localStorage) return;
  
  window.addEventListener('storage', (event) => {
    // Only listen for auth-related storage changes
    if (!Object.values(TOKEN_KEYS).includes(event.key)) return;
    
    if (event.key === TOKEN_KEYS.ACCESS_TOKEN) {
      if (event.newValue === null) {
        // Token was removed in another tab
        window.dispatchEvent(new CustomEvent('auth:logout-other-tab'));
      } else if (event.oldValue === null) {
        // Token was added in another tab
        window.dispatchEvent(new CustomEvent('auth:login-other-tab'));
      }
    }
  });
};

/**
 * Initialize token manager
 */
export const initializeTokenManager = () => {
  setupTokenCleanup();
  setupCrossTabSync();
  
  // Clean up expired tokens on initialization
  if (isTokenExpired() && !hasRefreshToken()) {
    clearTokens();
  }
};

export default {
  storeTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
  hasAccessToken,
  hasRefreshToken,
  isTokenExpired,
  shouldRefreshToken,
  getTokenRemainingTime,
  parseTokenPayload,
  getUserFromToken,
  isValidTokenFormat,
  initializeTokenManager
};