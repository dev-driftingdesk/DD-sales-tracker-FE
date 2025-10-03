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

// Backend connectivity status
let backendStatus = {
  isAvailable: null, // null = unknown, true = available, false = unavailable
  lastChecked: null,
  checkInProgress: false
};

// Mock user data for fallback authentication
const mockUsers = [
  {
    id: 'user-1',
    name: 'Sara Ahmed',
    email: 'sara@salestracker.com',
    role: 'sales_rep',
    team: 'team-1',
    location: 'Jakarta',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara',
    language: 'arabic',
    joinedDate: '2023-01-15',
    isActive: true
  },
  {
    id: 'user-2',
    name: 'Maria Rodriguez',
    email: 'maria@salestracker.com',
    role: 'sales_rep',
    team: 'team-2',
    location: 'London',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    language: 'english',
    joinedDate: '2023-03-20',
    isActive: true
  },
  {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@salestracker.com',
    role: 'admin',
    team: null,
    location: 'Global',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    language: 'english',
    joinedDate: '2022-01-01',
    isActive: true
  },
  {
    id: 'demo-1',
    name: 'Demo User',
    email: 'demo@salestracker.com',
    role: 'sales_rep',
    team: 'team-1',
    location: 'Demo Location',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
    language: 'english',
    joinedDate: '2024-01-01',
    isActive: true
  }
];

/**
 * Check if backend API is available
 * @param {boolean} useCache - Whether to use cached result
 * @returns {Promise<boolean>} True if backend is available
 */
export const checkBackendAvailability = async (useCache = true) => {
  const now = Date.now();
  const cacheValidTime = 30000; // 30 seconds cache
  
  // Use cached result if available and recent
  if (useCache && backendStatus.lastChecked && 
      (now - backendStatus.lastChecked) < cacheValidTime && 
      backendStatus.isAvailable !== null) {
    console.log('[AuthService] Using cached backend status:', backendStatus.isAvailable);
    return backendStatus.isAvailable;
  }
  
  // Prevent multiple simultaneous checks
  if (backendStatus.checkInProgress) {
    console.log('[AuthService] Backend check already in progress, waiting...');
    // Wait for ongoing check to complete
    await new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (!backendStatus.checkInProgress) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
    return backendStatus.isAvailable;
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
    
    backendStatus = {
      isAvailable,
      lastChecked: now,
      checkInProgress: false
    };
    
    console.log(`[AuthService] Backend status: ${isAvailable ? 'Available' : 'Unavailable'}`);
    return isAvailable;
    
  } catch (error) {
    console.warn('[AuthService] Backend unavailable:', error.message);
    
    // Check if it's a network error that suggests backend is down
    const isNetworkError = 
      error.name === 'AbortError' ||
      error.code === 'ECONNREFUSED' ||
      error.message?.includes('NetworkError') ||
      error.message?.includes('fetch') ||
      error.message?.includes('Failed to fetch') ||
      !navigator.onLine;
    
    backendStatus = {
      isAvailable: false,
      lastChecked: now,
      checkInProgress: false
    };
    
    return false;
  }
};

/**
 * Get backend connectivity status
 * @returns {object} Backend status information
 */
export const getBackendStatus = () => {
  return {
    ...backendStatus,
    mode: backendStatus.isAvailable ? 'api' : 'mock'
  };
};

/**
 * Mock authentication for fallback mode
 * @param {string} email - User email
 * @param {string} password - User password (optional for demo)
 * @returns {object} Mock authentication result
 */
const performMockLogin = (email, password) => {
  console.log('[AuthService] Performing mock authentication for:', email);
  
  // Find user by email
  const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    throw new ApiError(
      'User not found. Demo accounts: sara@salestracker.com, maria@salestracker.com, admin@salestracker.com, demo@salestracker.com',
      ERROR_TYPES.AUTHENTICATION,
      401
    );
  }
  
  // For demo purposes, accept any password or no password
  console.log('[AuthService] Mock authentication successful for:', user.email);
  
  // Create mock tokens
  const mockTokens = {
    access_token: `mock_token_${user.id}_${Date.now()}`,
    refresh_token: `mock_refresh_${user.id}_${Date.now()}`,
    expires_in: 3600 // 1 hour
  };
  
  // Store mock tokens
  tokenManager.storeTokens(mockTokens.access_token, mockTokens.refresh_token, mockTokens.expires_in);
  
  return {
    success: true,
    user,
    tokens: mockTokens,
    mode: 'mock'
  };
};

/**
 * Intelligent network error detection
 * @param {Error} error - Error to analyze
 * @returns {boolean} True if error indicates network/backend unavailability
 */
const isNetworkOrBackendError = (error) => {
  // Network connectivity issues
  if (!navigator.onLine) {
    console.log('[AuthService] Offline mode detected');
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
    checkInProgress: false
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
  const isApiEnabled = getConfig('enableApiIntegration', false);
  
  // If API integration is disabled, use mock immediately
  if (!isApiEnabled) {
    console.log('[AuthService] API integration disabled, using mock authentication');
    return performMockLogin(email, password);
  }
  
  // Check backend availability first
  const isBackendAvailable = await checkBackendAvailability();
  
  if (!isBackendAvailable) {
    console.log('[AuthService] Backend unavailable, using mock authentication');
    return performMockLogin(email, password);
  }
  
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
    
    // Check if error indicates backend unavailability
    if (isNetworkOrBackendError(error)) {
      console.warn('[AuthService] Network/backend error detected, falling back to mock authentication');
      
      // Mark backend as unavailable
      backendStatus.isAvailable = false;
      backendStatus.lastChecked = Date.now();
      
      // Fallback to mock authentication
      return performMockLogin(email, password);
    }
    
    // For non-network errors (like authentication failures), throw the original error
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
  const isApiEnabled = getConfig('enableApiIntegration', false);
  
  // If API integration is disabled, get user from token or mock data
  if (!isApiEnabled) {
    console.log('[AuthService] API integration disabled, using mock profile');
    const userFromToken = getCurrentUser();
    if (userFromToken) {
      return {
        success: true,
        user: userFromToken,
        mode: 'mock'
      };
    }
    throw new ApiError(
      'No user profile available',
      ERROR_TYPES.AUTHENTICATION,
      401
    );
  }
  
  // Check backend availability
  const isBackendAvailable = await checkBackendAvailability();
  
  if (!isBackendAvailable) {
    console.log('[AuthService] Backend unavailable, using mock profile');
    const userFromToken = getCurrentUser();
    if (userFromToken) {
      return {
        success: true,
        user: userFromToken,
        mode: 'mock',
        offline: true
      };
    }
    throw new ApiError(
      'Profile unavailable - backend is down',
      ERROR_TYPES.NETWORK,
      503
    );
  }
  
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
    
    // Check if it's a network error (backend not available)
    if (isNetworkOrBackendError(error)) {
      console.warn('[AuthService] Network error detected, falling back to token-based user');
      
      // Mark backend as unavailable
      backendStatus.isAvailable = false;
      backendStatus.lastChecked = Date.now();
      
      // For network errors, try to get user from token if available
      const userFromToken = getCurrentUser();
      if (userFromToken && !tokenManager.isTokenExpired()) {
        console.log('[AuthService] Using token-based user for offline mode');
        return {
          success: true,
          user: userFromToken,
          mode: 'mock',
          offline: true
        };
      }
    }
    
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error.message || 'Failed to get profile',
      ERROR_TYPES.SERVER,
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