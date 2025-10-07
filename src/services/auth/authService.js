/**
 * Authentication API Service
 * Handles all authentication-related API operations with intelligent backend detection and fallback
 */

import { api, createApiService, getApiEndpoints } from '../api/index.js';
import tokenManager from './tokenManager.js';
import { ApiError, ERROR_TYPES } from '../api/errorHandler.js';
import {
  mapRegistrationRequest,
  mapLoginRequest,
  mapAuthResponse,
  mapPasswordResetRequest,
  mapPasswordResetConfirmRequest,
  mapEmailVerificationRequest,
  mapRefreshTokenRequest,
  mapErrorResponse,
  mapSuccessResponse
} from '../api/ceedPodsMapper.js';
import { getConfig } from '../api/config.js';

// Create API service for auth endpoints
const authApiService = createApiService('');

// Backend connectivity status with enhanced race condition protection
let backendStatus = {
  isAvailable: null, // null = unknown, true = available, false = unavailable
  lastChecked: null,
  checkInProgress: false,
  consecutiveFailures: 0,
  circuitBreakerOpen: false,
  circuitBreakerOpenedAt: null
};

// Circuit breaker configuration
const CIRCUIT_BREAKER_CONFIG = {
  failureThreshold: 3,
  timeoutMs: 30000, // 30 seconds before circuit breaker resets
  maxWaitTime: 10000 // 10 seconds max wait for concurrent checks
};

/**
 * Check if backend API is available with enhanced race condition protection
 * @param {boolean} useCache - Whether to use cached result
 * @returns {Promise<boolean>} True if backend is available
 */
export const checkBackendAvailability = async (useCache = true) => {
  const now = Date.now();
  const cacheValidTime = 30000; // 30 seconds cache
  
  // Circuit breaker check - if open and timeout not reached, return cached false
  if (backendStatus.circuitBreakerOpen) {
    const timeSinceOpened = now - backendStatus.circuitBreakerOpenedAt;
    if (timeSinceOpened < CIRCUIT_BREAKER_CONFIG.timeoutMs) {
      console.log('[AuthService] Circuit breaker open, backend assumed unavailable');
      return false;
    } else {
      // Reset circuit breaker after timeout
      console.log('[AuthService] Circuit breaker timeout reached, resetting');
      backendStatus.circuitBreakerOpen = false;
      backendStatus.consecutiveFailures = 0;
      backendStatus.circuitBreakerOpenedAt = null;
    }
  }
  
  // Use cached result if available and recent
  if (useCache && backendStatus.lastChecked && 
      (now - backendStatus.lastChecked) < cacheValidTime && 
      backendStatus.isAvailable !== null &&
      !backendStatus.circuitBreakerOpen) {
    console.log('[AuthService] Using cached backend status:', backendStatus.isAvailable);
    return backendStatus.isAvailable;
  }
  
  // Prevent multiple simultaneous checks with timeout protection
  if (backendStatus.checkInProgress) {
    console.log('[AuthService] Backend check already in progress, waiting with timeout...');
    
    // Wait for ongoing check with maximum timeout
    const waitStartTime = Date.now();
    const maxWaitTime = CIRCUIT_BREAKER_CONFIG.maxWaitTime;
    
    const waitResult = await new Promise(resolve => {
      let resolved = false;
      
      // Check completion every 100ms
      const checkInterval = setInterval(() => {
        const waitTime = Date.now() - waitStartTime;
        
        if (!backendStatus.checkInProgress || waitTime > maxWaitTime) {
          clearInterval(checkInterval);
          if (!resolved) {
            resolved = true;
            resolve(waitTime > maxWaitTime ? 'timeout' : 'completed');
          }
        }
      }, 100);
      
      // Safety timeout
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!resolved) {
          resolved = true;
          resolve('timeout');
        }
      }, maxWaitTime + 1000);
    });
    
    if (waitResult === 'timeout') {
      console.warn('[AuthService] Backend check wait timeout, assuming unavailable');
      // Force reset the check state and mark as unavailable
      backendStatus.checkInProgress = false;
      backendStatus.isAvailable = false;
      backendStatus.lastChecked = now;
      return false;
    }
    
    return backendStatus.isAvailable !== null ? backendStatus.isAvailable : false;
  }
  
  backendStatus.checkInProgress = true;
  
  try {
    console.log('[AuthService] Checking backend availability...');
    
    // Quick health check with short timeout
    const healthCheckUrl = `${getConfig('baseURL')}/health` || `${getConfig('baseURL')}/api/health`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const response = await fetch(healthCheckUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const isAvailable = response.ok || response.status < 500;
    
    // Reset failure count on successful check
    if (isAvailable) {
      backendStatus.consecutiveFailures = 0;
    }
    
    backendStatus = {
      ...backendStatus,
      isAvailable,
      lastChecked: now,
      checkInProgress: false
    };
    
    console.log(`[AuthService] Backend status: ${isAvailable ? 'Available' : 'Unavailable'}`);
    return isAvailable;
    
  } catch (error) {
    console.warn('[AuthService] Backend unavailable:', error.message);
    
    // Increment failure count and check circuit breaker threshold
    backendStatus.consecutiveFailures++;
    
    if (backendStatus.consecutiveFailures >= CIRCUIT_BREAKER_CONFIG.failureThreshold) {
      console.warn('[AuthService] Circuit breaker activated due to consecutive failures');
      backendStatus.circuitBreakerOpen = true;
      backendStatus.circuitBreakerOpenedAt = now;
    }
    
    // Check if it's a network error that suggests backend is down
    const isNetworkError = 
      error.name === 'AbortError' ||
      error.code === 'ECONNREFUSED' ||
      error.message?.includes('NetworkError') ||
      error.message?.includes('fetch') ||
      error.message?.includes('Failed to fetch') ||
      !navigator.onLine;
    
    backendStatus = {
      ...backendStatus,
      isAvailable: false,
      lastChecked: now,
      checkInProgress: false
    };
    
    return false;
  } finally {
    // Ensure checkInProgress is always reset
    backendStatus.checkInProgress = false;
  }
};

/**
 * Get backend connectivity status
 * @returns {object} Backend status information
 */
export const getBackendStatus = () => {
  return {
    ...backendStatus,
    mode: backendStatus.isAvailable ? 'api' : 'unavailable'
  };
};

/**
 * Enhanced error classification for smart authentication error handling
 * @param {Error} error - Error to analyze
 * @returns {object} Error classification result
 */
export const classifyAuthError = (error) => {
  // Network connectivity issues
  if (!navigator.onLine) {
    return {
      type: 'network',
      shouldKeepSession: true,
      message: 'Network connection unavailable',
      userMessage: 'You appear to be offline. Please check your connection.'
    };
  }
  
  // Check if it's an ApiError with NOT_FOUND type (backend unavailable)
  if (error.name === 'ApiError' && error.type === ERROR_TYPES.NOT_FOUND) {
    return {
      type: 'network',
      shouldKeepSession: true,
      message: `Backend unavailable: ${error.message}`,
      userMessage: 'Server is temporarily unavailable. Your session is preserved.'
    };
  }
  
  // Connection and timeout errors
  const networkIndicators = [
    'ECONNREFUSED',
    'ENOTFOUND', 
    'ETIMEDOUT',
    'ECONNRESET',
    'NetworkError',
    'Failed to fetch',
    'fetch',
    'AbortError',
    'TimeoutError'
  ];
  
  const errorMessage = error.message || '';
  const errorCode = error.code || '';
  const errorName = error.name || '';
  
  const isNetworkError = networkIndicators.some(indicator => 
    errorMessage.includes(indicator) || 
    errorCode.includes(indicator) ||
    errorName.includes(indicator)
  );
  
  // HTTP status codes that indicate backend issues (not authentication issues)
  const backendUnavailableCodes = [404, 502, 503, 504];
  const isBackendUnavailable = error.status && backendUnavailableCodes.includes(error.status);
  const responseStatus = error.response?.status;
  const isResponseUnavailable = responseStatus && backendUnavailableCodes.includes(responseStatus);
  
  if (isNetworkError || isBackendUnavailable || isResponseUnavailable) {
    return {
      type: 'network',
      shouldKeepSession: true,
      message: `Network/backend error: ${errorMessage}`,
      userMessage: 'Server connection issue. Your session is preserved.'
    };
  }
  
  // Authentication-specific errors (401, 403)
  const authErrorCodes = [401, 403];
  const isAuthError = error.status && authErrorCodes.includes(error.status) ||
                      responseStatus && authErrorCodes.includes(responseStatus);
  
  if (isAuthError) {
    return {
      type: 'authentication',
      shouldKeepSession: false,
      message: `Authentication error: ${errorMessage}`,
      userMessage: 'Authentication failed. Please sign in again.'
    };
  }
  
  // Check for specific authentication-related error messages
  const authMessages = ['unauthorized', 'forbidden', 'invalid token', 'token expired', 'authentication failed'];
  const hasAuthMessage = authMessages.some(msg => errorMessage.toLowerCase().includes(msg));
  
  if (hasAuthMessage) {
    return {
      type: 'authentication',
      shouldKeepSession: false,
      message: `Authentication error: ${errorMessage}`,
      userMessage: 'Your session has expired. Please sign in again.'
    };
  }
  
  // Unknown errors - be conservative and keep session for now
  return {
    type: 'unknown',
    shouldKeepSession: true,
    message: `Unknown error: ${errorMessage}`,
    userMessage: 'An unexpected error occurred. Your session is preserved.'
  };
};

/**
 * Intelligent network error detection (legacy function for backward compatibility)
 * @param {Error} error - Error to analyze
 * @returns {boolean} True if error indicates network/backend unavailability
 */
const isNetworkOrBackendError = (error) => {
  // Network connectivity issues
  if (!navigator.onLine) {
    console.log('[AuthService] Offline mode detected');
    return true;
  }
  
  // Check if it's an ApiError with NOT_FOUND type (backend unavailable)
  if (error.name === 'ApiError' && error.type === ERROR_TYPES.NOT_FOUND) {
    console.log('[AuthService] Backend unavailability detected via ApiError NOT_FOUND');
    return true;
  }
  
  // Connection refused or timeout errors
  const networkIndicators = [
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
    'ECONNRESET',
    'NetworkError',
    'Failed to fetch',
    'fetch',
    'AbortError',
    'TimeoutError'
  ];
  
  const errorMessage = error.message || '';
  const errorCode = error.code || '';
  const errorName = error.name || '';
  
  const isNetworkError = networkIndicators.some(indicator => 
    errorMessage.includes(indicator) || 
    errorCode.includes(indicator) ||
    errorName.includes(indicator)
  );
  
  // Enhanced HTTP status code detection for backend unavailability
  // Includes 404 for cases where backend is completely down and web server returns "Not Found"
  const backendUnavailableCodes = [404, 502, 503, 504];
  const isBackendUnavailable = error.status && backendUnavailableCodes.includes(error.status);
  
  // Additional error object checks for different error response formats
  const responseStatus = error.response?.status;
  const isResponseUnavailable = responseStatus && backendUnavailableCodes.includes(responseStatus);
  
  // Log detailed error information for debugging
  if (isNetworkError || isBackendUnavailable || isResponseUnavailable) {
    console.log('[AuthService] Backend unavailability detected:', {
      errorType: isNetworkError ? 'network' : 'http_status',
      status: error.status || responseStatus || 'none',
      message: errorMessage,
      code: errorCode,
      name: errorName,
      isNetworkError,
      isBackendUnavailable,
      isResponseUnavailable
    });
  }
  
  return isNetworkError || isBackendUnavailable || isResponseUnavailable;
};

/**
 * Reset backend status to trigger fresh check
 */
export const resetBackendStatus = () => {
  console.log('[AuthService] Resetting backend status for fresh check');
  backendStatus = {
    isAvailable: null,
    lastChecked: null,
    checkInProgress: false,
    consecutiveFailures: 0,
    circuitBreakerOpen: false,
    circuitBreakerOpenedAt: null
  };
};



/**
 * Login user with email and password with intelligent backend fallback
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {boolean} rememberMe - Whether to remember the user
 * @returns {Promise<object>} Login response
 */
export const login = async (email, password, rememberMe = false) => {
  try {
    console.log('[AuthService] Attempting backend API login for:', email);
    
    // Use backend API
    const requestData = mapLoginRequest(email, password, rememberMe);
    const response = await authApiService.post(getApiEndpoints().auth.login, requestData);
    
    // Transform backend response to frontend format
    const mappedResponse = mapAuthResponse(response);
    const { user, tokens } = mappedResponse;
    
    // Store tokens
    tokenManager.storeTokens(tokens.access_token, tokens.refresh_token, tokens.expires_in);
    
    // Update backend status on successful API call
    backendStatus.isAvailable = true;
    backendStatus.lastChecked = Date.now();
    
    console.log('[AuthService] Backend API login successful');
    
    return {
      success: true,
      user,
      tokens,
      mode: 'api'
    };
  } catch (error) {
    console.error('[AuthService] Backend API login failed:', error);
    
    // Mark backend as unavailable for network errors
    if (isNetworkOrBackendError(error)) {
      backendStatus.isAvailable = false;
      backendStatus.lastChecked = Date.now();
    }
    
    // For all errors, throw the error (no mock fallback)
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle backend API error response
    if (error.response && error.response.data) {
      const mappedError = mapErrorResponse(error.response.data);
      throw new ApiError(
        mappedError.message,
        ERROR_TYPES.AUTHENTICATION,
        mappedError.status,
        error
      );
    }
    
    throw new ApiError(
      error.message || 'Login failed',
      ERROR_TYPES.AUTHENTICATION,
      error.status || 401,
      error
    );
  }
};

/**
 * Register new user
 * @param {object} userData - User registration data
 * @returns {Promise<object>} Registration response
 */
export const register = async (userData) => {
  try {
    // Use backend API only
    const requestData = mapRegistrationRequest(userData);
    const response = await authApiService.post(getApiEndpoints().auth.register, requestData);
    
    // Transform backend response to frontend format
    const mappedResponse = mapAuthResponse(response);
    const { user, tokens } = mappedResponse;
    
    // Store tokens (auto-login after registration)
    tokenManager.storeTokens(tokens.access_token, tokens.refresh_token, tokens.expires_in);
    
    return {
      success: true,
      user,
      tokens
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle backend API error response
    if (error.response && error.response.data) {
      const mappedError = mapErrorResponse(error.response.data);
      throw new ApiError(
        mappedError.message,
        ERROR_TYPES.VALIDATION,
        mappedError.status,
        error
      );
    }
    
    throw new ApiError(
      error.message || 'Registration failed',
      ERROR_TYPES.VALIDATION,
      error.status || 400,
      error
    );
  }
};

/**
 * Logout user
 * @returns {Promise<object>} Logout response
 */
export const logout = async () => {
  try {
    if (tokenManager.hasAccessToken()) {
      // Notify backend API about logout
      try {
        // Backend API expects empty JSON body for logout
        await authApiService.post(getApiEndpoints().auth.logout, {});
      } catch (error) {
        // Continue with logout even if server request fails
        console.warn('Server logout failed:', error);
      }
    }
    
    // Clear local tokens
    tokenManager.clearTokens();
    
    return { success: true };
  } catch (error) {
    // Always clear tokens even if logout fails
    tokenManager.clearTokens();
    return { success: true };
  }
};

/**
 * Refresh authentication token
 * @returns {Promise<object>} Refresh response
 */
export const refreshToken = async () => {
  try {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new ApiError('No refresh token available', ERROR_TYPES.AUTHENTICATION, 401);
    }
    
    // Use backend API only
    const requestData = mapRefreshTokenRequest(refreshToken);
    const response = await authApiService.post(getApiEndpoints().auth.refresh, requestData);
    
    // Transform backend response to frontend format
    const mappedResponse = mapSuccessResponse(response);
    const { token, refreshToken: newRefreshToken, expiresIn } = mappedResponse.data;
    
    // Store new tokens
    tokenManager.storeTokens(token, newRefreshToken, expiresIn);
    
    return {
      success: true,
      tokens: { access_token: token, refresh_token: newRefreshToken, expires_in: expiresIn }
    };
  } catch (error) {
    // Clear tokens on refresh failure
    tokenManager.clearTokens();
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle backend API error response
    if (error.response && error.response.data) {
      const mappedError = mapErrorResponse(error.response.data);
      throw new ApiError(
        mappedError.message,
        ERROR_TYPES.AUTHENTICATION,
        mappedError.status,
        error
      );
    }
    
    throw new ApiError(
      error.message || 'Token refresh failed',
      ERROR_TYPES.AUTHENTICATION,
      error.status || 401,
      error
    );
  }
};

/**
 * Reset user password
 * @param {string} email - User email
 * @returns {Promise<object>} Reset response
 */
export const resetPassword = async (email) => {
  try {
    // Use backend API only
    const requestData = mapPasswordResetRequest(email);
    const response = await authApiService.post(getApiEndpoints().auth.resetPassword, requestData);
    
    // Transform backend response to frontend format
    const mappedResponse = mapSuccessResponse(response);
    
    return {
      success: true,
      message: mappedResponse.message || 'Password reset link sent to your email'
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle backend API error response
    if (error.response && error.response.data) {
      const mappedError = mapErrorResponse(error.response.data);
      throw new ApiError(
        mappedError.message,
        ERROR_TYPES.SERVER,
        mappedError.status,
        error
      );
    }
    
    throw new ApiError(
      error.message || 'Password reset failed',
      ERROR_TYPES.SERVER,
      error.status || 500,
      error
    );
  }
};

/**
 * Confirm password reset with token (CeedPods API)
 * @param {string} email - User email
 * @param {string} newPassword - New password
 * @param {string} token - Reset token from email
 * @returns {Promise<object>} Confirmation response
 */
export const confirmPasswordReset = async (email, newPassword, token) => {
  try {
    // Use backend API only
    const requestData = mapPasswordResetConfirmRequest(email, newPassword, token);
    const response = await authApiService.post(getApiEndpoints().auth.resetPasswordConfirm, requestData);
    
    // Transform backend response to frontend format
    const mappedResponse = mapSuccessResponse(response);
    
    return {
      success: true,
      message: mappedResponse.message || 'Password reset successfully'
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle backend API error response
    if (error.response && error.response.data) {
      const mappedError = mapErrorResponse(error.response.data);
      throw new ApiError(
        mappedError.message,
        ERROR_TYPES.SERVER,
        mappedError.status,
        error
      );
    }
    
    throw new ApiError(
      error.message || 'Password reset confirmation failed',
      ERROR_TYPES.SERVER,
      error.status || 500,
      error
    );
  }
};

/**
 * Verify user email with token (CeedPods API)
 * @param {string} email - User email
 * @param {string} token - Verification token from email
 * @returns {Promise<object>} Verification response
 */
export const verifyEmail = async (email, token) => {
  try {
    // Use backend API only - Note: This is a GET request with query parameters
    const queryString = mapEmailVerificationRequest(email, token);
    const url = `${getApiEndpoints().auth.verifyEmail}?${queryString}`;
    
    const response = await authApiService.get(url);
    
    // Transform backend response to frontend format
    const mappedResponse = mapSuccessResponse(response);
    
    return {
      success: true,
      message: mappedResponse.message || 'Email verified successfully'
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle backend API error response
    if (error.response && error.response.data) {
      const mappedError = mapErrorResponse(error.response.data);
      throw new ApiError(
        mappedError.message,
        ERROR_TYPES.SERVER,
        mappedError.status,
        error
      );
    }
    
    throw new ApiError(
      error.message || 'Email verification failed',
      ERROR_TYPES.SERVER,
      error.status || 500,
      error
    );
  }
};

/**
 * Update user password (legacy function - use confirmPasswordReset for reset flow)
 * @param {string} email - User email
 * @param {string} newPassword - New password
 * @param {string} resetToken - Password reset token (if from reset flow)
 * @returns {Promise<object>} Update response
 */
export const updatePassword = async (email, newPassword, resetToken = null) => {
  try {
    if (resetToken) {
      // Use the new confirm password reset function for reset flows
      return await confirmPasswordReset(email, newPassword, resetToken);
    }
    
    // For direct password updates (not reset flow), use backend API
    await authApiService.post('/update-password', {
      email,
      new_password: newPassword,
      reset_token: resetToken
    });
    
    return {
      success: true,
      message: 'Password updated successfully'
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error.message || 'Password update failed',
      ERROR_TYPES.SERVER,
      error.status || 500,
      error
    );
  }
};

/**
 * Get current user profile with intelligent backend fallback
 * @returns {Promise<object>} User profile
 */
export const getProfile = async () => {
  try {
    console.log('[AuthService] Fetching profile from backend API');
    
    // Use backend API
    const response = await authApiService.get(getApiEndpoints().auth.profile);
    
    // Update backend status on successful API call
    backendStatus.isAvailable = true;
    backendStatus.lastChecked = Date.now();
    
    return {
      success: true,
      user: response.user,
      mode: 'api'
    };
  } catch (error) {
    console.error('[AuthService] Profile fetch failed:', error);
    
    // Mark backend as unavailable for network errors
    if (isNetworkOrBackendError(error)) {
      backendStatus.isAvailable = false;
      backendStatus.lastChecked = Date.now();
    }
    
    // For all errors, throw the error (no fallback to mock/token)
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(
      error.message || 'Profile fetch failed',
      ERROR_TYPES.AUTHENTICATION,
      error.status || 500,
      error
    );
  }
};

/**
 * Check if user is currently authenticated
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
  const hasToken = tokenManager.hasAccessToken();
  const isExpired = tokenManager.isTokenExpired();
  console.log('[AuthService] isAuthenticated check:', { hasToken, isExpired, result: hasToken && !isExpired });
  return hasToken && !isExpired;
};

/**
 * Get current user from stored token
 * @returns {object|null} Current user or null
 */
export const getCurrentUser = () => {
  return tokenManager.getUserFromToken();
};

export default {
  login,
  register,
  logout,
  refreshToken,
  resetPassword,
  confirmPasswordReset,
  verifyEmail,
  updatePassword,
  getProfile,
  isAuthenticated,
  getCurrentUser,
  checkBackendAvailability,
  getBackendStatus,
  resetBackendStatus
};