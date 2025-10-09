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
  // DEBUG: Log token details for debugging
  console.log('[TokenManager] 🔍 Storing tokens:', {
    accessToken: accessToken ? `${accessToken.slice(0, 20)}...` : 'null',
    refreshToken: refreshToken ? `${refreshToken.slice(0, 20)}...` : 'null',
    accessTokenLength: accessToken?.length,
    refreshTokenLength: refreshToken?.length,
    expiresIn
  });
  
  // Validate input tokens
  if (!accessToken || !isValidTokenFormat(accessToken)) {
    console.error('[TokenManager] ❌ Access token validation failed:', {
      token: accessToken ? `${accessToken.slice(0, 50)}...` : 'null',
      length: accessToken?.length,
      type: typeof accessToken
    });
    throw new Error('Invalid access token format');
  }
  
  if (refreshToken && !isValidTokenFormat(refreshToken)) {
    console.error('[TokenManager] ❌ Refresh token validation failed:', {
      token: refreshToken ? `${refreshToken.slice(0, 50)}...` : 'null',
      length: refreshToken?.length,
      type: typeof refreshToken,
      parts: refreshToken?.split?.('.').length
    });
    throw new Error('Invalid refresh token format');
  }
  
  // Validate expiration time
  if (!expiresIn || expiresIn <= 0) {
    throw new Error('Invalid token expiration time');
  }
  
  const storage = getStorage();
  const timestamp = Date.now();
  const expiresAt = timestamp + (expiresIn * 1000);
  
  try {
    // Store tokens with error handling
    storage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
    storage.setItem(TOKEN_KEYS.TOKEN_TIMESTAMP, timestamp.toString());
    storage.setItem(TOKEN_KEYS.TOKEN_EXPIRES_AT, expiresAt.toString());
    
    if (refreshToken) {
      storage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
    }
    
    // Verify storage was successful
    if (storage.getItem(TOKEN_KEYS.ACCESS_TOKEN) !== accessToken) {
      throw new Error('Token storage failed - verification failed');
    }
    
    console.log('[TokenManager] Tokens stored successfully');
    
    // Dispatch event for token update (don't include actual tokens for security)
    window.dispatchEvent(new CustomEvent('auth:tokens-updated', {
      detail: { timestamp, expiresAt }
    }));
    
  } catch (error) {
    console.error('[TokenManager] Token storage failed:', error);
    // Clear any partially stored data
    clearTokens();
    throw new Error('Failed to store authentication tokens');
  }
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
 * Remove all stored tokens securely
 */
export const clearTokens = () => {
  const storage = getStorage();
  
  try {
    // Clear each token key
    Object.values(TOKEN_KEYS).forEach(key => {
      storage.removeItem(key);
    });
    
    // Verify tokens were cleared
    const remainingTokens = Object.values(TOKEN_KEYS).filter(key => 
      storage.getItem(key) !== null
    );
    
    if (remainingTokens.length > 0) {
      console.warn('[TokenManager] Some tokens could not be cleared:', remainingTokens);
    } else {
      console.log('[TokenManager] All tokens cleared successfully');
    }
    
    // Dispatch event for token removal
    window.dispatchEvent(new CustomEvent('auth:tokens-cleared'));
    
  } catch (error) {
    console.error('[TokenManager] Error clearing tokens:', error);
    
    // Force clear using a more aggressive approach
    try {
      if (storage === localStorage) {
        localStorage.clear();
      } else {
        sessionStorage.clear();
      }
      console.warn('[TokenManager] Used aggressive token clearing due to error');
    } catch (fallbackError) {
      console.error('[TokenManager] Fallback token clearing failed:', fallbackError);
    }
  }
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
  const expiresAtRaw = storage.getItem(TOKEN_KEYS.TOKEN_EXPIRES_AT);
  const expiresAt = expiresAtRaw ? parseInt(expiresAtRaw) : null;
  
  // DEBUG: Token expiration timestamp debugging
  console.log('[TokenManager] 📅 GET TOKEN EXPIRES AT:', {
    storageKey: TOKEN_KEYS.TOKEN_EXPIRES_AT,
    rawValue: expiresAtRaw,
    parsedValue: expiresAt,
    isValid: !!(expiresAtRaw && !isNaN(parseInt(expiresAtRaw))),
    storageType: storage === localStorage ? 'localStorage' : 'sessionStorage'
  });
  
  return expiresAt;
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
  
  // DEBUG: Enhanced token expiration debugging
  const currentTime = Date.now();
  const isExpired = !expiresAt ? true : currentTime >= expiresAt;
  
  console.log('[TokenManager] 🕒 TOKEN EXPIRATION CHECK:', {
    hasExpiresAt: !!expiresAt,
    expiresAt,
    currentTime,
    timeUntilExpiry: expiresAt ? (expiresAt - currentTime) : 'N/A',
    timeUntilExpirySeconds: expiresAt ? Math.floor((expiresAt - currentTime) / 1000) : 'N/A',
    isExpired,
    reason: !expiresAt ? 'NO_EXPIRES_AT' : currentTime >= expiresAt ? 'TIME_EXCEEDED' : 'VALID'
  });
  
  if (!expiresAt) return true;
  
  return currentTime >= expiresAt;
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
 * Parse JWT token payload securely (without verification)
 * @param {string} token - JWT token to parse
 * @returns {object|null} Parsed payload or null if invalid
 */
export const parseTokenPayload = (token) => {
  if (!token || typeof token !== 'string') {
    return null;
  }
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('[TokenManager] Invalid JWT format: expected 3 parts');
      return null;
    }
    
    const payload = parts[1];
    
    // Add padding if necessary for base64 decoding
    let paddedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    while (paddedPayload.length % 4) {
      paddedPayload += '=';
    }
    
    const decodedPayload = atob(paddedPayload);
    const parsedPayload = JSON.parse(decodedPayload);
    
    // Validate essential JWT claims
    if (!parsedPayload.exp || !parsedPayload.iat) {
      console.warn('[TokenManager] Missing essential JWT claims');
      return null;
    }
    
    // Check if token is obviously expired (extra safety)
    if (parsedPayload.exp * 1000 < Date.now()) {
      console.warn('[TokenManager] Token is expired according to payload');
      return null;
    }
    
    return parsedPayload;
    
  } catch (error) {
    console.warn('[TokenManager] Failed to parse token payload:', error.message);
    return null;
  }
};

/**
 * Get user information from access token securely with fallback to mock data
 * @returns {object|null} User information or null
 */
export const getUserFromToken = () => {
  const token = getAccessToken();
  if (!token) {
    return null;
  }
  
  // Check if token is expired before parsing
  if (isTokenExpired()) {
    console.warn('[TokenManager] Attempting to get user from expired token');
    return null;
  }
  
  const payload = parseTokenPayload(token);
  if (!payload) {
    return null;
  }
  
  // DEBUG: Log the actual JWT payload to understand backend format
  console.log('[TokenManager] 🔍 JWT payload contents:', {
    payload,
    availableFields: Object.keys(payload),
    hasId: !!payload.id,
    hasSub: !!payload.sub,
    hasUserId: !!payload.user_id,
    hasEmail: !!payload.email,
    hasUserEmail: !!payload.user_email,
    hasNameId: !!payload.nameid,
    hasName: !!payload.name,
    hasFullName: !!payload.full_name,
    hasGivenName: !!payload.given_name,
    hasUniqueName: !!payload.unique_name
  });
  
  // Validate required user fields - try multiple field patterns
  const userId = payload.sub || payload.user_id || payload.id || payload.nameid || payload.unique_name;
  const userEmail = payload.email || payload.user_email || payload.emailaddress;
  
  if (!userId || !userEmail) {
    console.warn('[TokenManager] ❌ Token missing required user identification');
    console.warn('[TokenManager] Available payload fields:', Object.keys(payload));
    return null;
  }
  
  // Extract name from JWT payload - try multiple field patterns
  let userName = payload.name || payload.full_name || payload.given_name || payload.unique_name;
  
  // Final fallback: construct name from email if not found in JWT
  if (!userName || userName === userId) {
    const emailName = userEmail.split('@')[0];
    userName = emailName.charAt(0).toUpperCase() + emailName.slice(1).replace(/[._]/g, ' ');
    console.log('[TokenManager] 📧 Using constructed name from email:', userName);
  }
  
  console.log('[TokenManager] 🔍 Final user identification extraction:', {
    userId,
    userEmail,
    userName,
    extractionSuccessful: !!(userId && userEmail),
    nameSource: payload.name || payload.full_name || payload.given_name || payload.unique_name ? 'JWT' : 'Email-derived'
  });
  
  // Sanitize and validate user data
  const userData = {
    id: String(userId),
    email: String(userEmail),
    name: String(userName),
    role: payload.role || payload.roles?.[0] || 'user',
    permissions: Array.isArray(payload.permissions) ? payload.permissions : [],
    exp: payload.exp,
    iat: payload.iat
  };
  
  // Additional validation
  if (!userData.email.includes('@')) {
    console.warn('[TokenManager] Invalid email format in token');
    return null;
  }
  
  return userData;
};

/**
 * Validate token format with comprehensive security checks
 * @param {string} token - Token to validate
 * @returns {boolean} True if token format is valid
 */
export const isValidTokenFormat = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Check for obviously malicious patterns
  if (token.includes('<script') || token.includes('javascript:') || token.includes('data:')) {
    console.warn('[TokenManager] Token contains potentially malicious content');
    return false;
  }
  
  // Check token length (reasonable bounds)
  if (token.length < 20 || token.length > 4096) {
    console.warn('[TokenManager] Token length outside reasonable bounds');
    return false;
  }
  
  const parts = token.split('.');
  
  // Accept both JWT format (3 parts) and simple string tokens (1 part)
  if (parts.length === 1) {
    // Simple string token (like refresh tokens from some backends)
    console.log('[TokenManager] ✅ Accepting simple string token format');
    return true;
  }
  
  if (parts.length !== 3) {
    console.warn('[TokenManager] Invalid token format - expected 1 or 3 parts, got:', parts.length);
    return false;
  }
  
  try {
    // Try to decode each part and verify structure for JWT tokens
    const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    
    // Basic JWT structure validation
    if (!header.alg || !header.typ) {
      console.warn('[TokenManager] Invalid JWT header structure');
      return false;
    }
    
    if (!payload.exp || !payload.iat) {
      console.warn('[TokenManager] Missing required JWT payload claims');
      return false;
    }
    
    // Check for reasonable expiration (not more than 1 year in the future)
    const maxExp = Date.now() / 1000 + (365 * 24 * 60 * 60);
    if (payload.exp > maxExp) {
      console.warn('[TokenManager] Token expiration time unreasonably far in future');
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.warn('[TokenManager] Token format validation failed:', error.message);
    return false;
  }
};

/**
 * Set up automatic token cleanup and refresh
 */
export const setupTokenCleanup = () => {
  const storage = getStorage();
  
  // Only clean up sessionStorage tokens on page unload
  if (storage === sessionStorage) {
    window.addEventListener('beforeunload', () => {
      clearTokens();
    });
  }
  
  // Set up periodic cleanup and refresh check for expired tokens
  const cleanupInterval = setInterval(() => {
    console.log('[TokenManager] 🔄 PERIODIC CLEANUP CHECK - Starting scheduled token cleanup...');
    
    if (hasAccessToken()) {
      console.log('[TokenManager] 🔍 Token found, checking expiration...');
      
      if (isTokenExpired()) {
        console.log('[TokenManager] 🚨 TOKEN EXPIRED IN PERIODIC CLEANUP - Clearing tokens and dispatching event!');
        clearTokens();
        // Dispatch event to trigger logout
        window.dispatchEvent(new CustomEvent('auth:token-expired'));
      } else if (shouldRefreshToken()) {
        console.log('[TokenManager] 🔄 Token needs refresh');
        // Dispatch event to trigger refresh
        window.dispatchEvent(new CustomEvent('auth:token-needs-refresh'));
      } else {
        console.log('[TokenManager] ✅ Token is valid in periodic check');
      }
    } else {
      console.log('[TokenManager] ℹ️ No token found in periodic cleanup');
    }
  }, 30000); // Check every 30 seconds
  
  // Clean up interval on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(cleanupInterval);
  });
  
  return cleanupInterval;
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

// Global cleanup interval reference
let globalCleanupInterval = null;

/**
 * Initialize token manager with enhanced cleanup
 */
export const initializeTokenManager = () => {
  console.log('[TokenManager] Initializing token manager...');
  
  // Clean up any existing interval
  if (globalCleanupInterval) {
    clearInterval(globalCleanupInterval);
  }
  
  // Setup cleanup and store reference
  globalCleanupInterval = setupTokenCleanup();
  setupCrossTabSync();
  
  // Clean up expired tokens on initialization
  if (hasAccessToken() && isTokenExpired()) {
    console.log('[TokenManager] Found expired token on initialization, clearing');
    clearTokens();
  }
  
  console.log('[TokenManager] Token manager initialized successfully');
};

/**
 * Cleanup token manager (for testing/cleanup)
 */
export const cleanupTokenManager = () => {
  if (globalCleanupInterval) {
    clearInterval(globalCleanupInterval);
    globalCleanupInterval = null;
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
  initializeTokenManager,
  cleanupTokenManager
};