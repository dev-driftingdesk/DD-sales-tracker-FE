/**
 * Authentication API Service
 * Handles all authentication-related API operations using pure backend API calls
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

// Create API service for auth endpoints
const authApiService = createApiService('');



/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {boolean} rememberMe - Whether to remember the user
 * @returns {Promise<object>} Login response
 */
export const login = async (email, password, rememberMe = false) => {
  try {
    // Use backend API only
    const requestData = mapLoginRequest(email, password, rememberMe);
    const response = await authApiService.post(getApiEndpoints().auth.login, requestData);
    
    // Transform backend response to frontend format
    const mappedResponse = mapAuthResponse(response);
    const { user, tokens } = mappedResponse;
    
    // Store tokens
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
 * Get current user profile
 * @returns {Promise<object>} User profile
 */
export const getProfile = async () => {
  try {
    // Use backend API only
    const response = await authApiService.get(getApiEndpoints().auth.profile);
    return {
      success: true,
      user: response.user
    };
  } catch (error) {
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
  return tokenManager.hasAccessToken() && !tokenManager.isTokenExpired();
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
  getCurrentUser
};