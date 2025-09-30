/**
 * Authentication API Service
 * Handles all authentication-related API operations with fallback to mock data
 */

import { api, createApiService, isApiEnabled, getApiEndpoints, mockDelay } from '../api/index.js';
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

// Mock users data (fallback when API is not enabled)
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@salestracker.com',
    password: 'admin123',
    name: 'John Admin',
    role: 'admin',
    avatar: null,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'manager@salestracker.com',
    password: 'manager123',
    name: 'Sarah Manager',
    role: 'manager',
    avatar: null,
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    email: 'sales@salestracker.com',
    password: 'sales123',
    name: 'Mike Rep',
    role: 'sales_rep',
    avatar: null,
    createdAt: '2024-02-01T00:00:00Z'
  }
];

/**
 * Generate mock JWT tokens for development
 * @param {object} user - User object
 * @returns {object} Token response
 */
const generateMockTokens = (user) => {
  const { password, ...userWithoutPassword } = user;
  
  // Create a mock JWT payload
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };
  
  // Create mock JWT (not cryptographically secure, for development only)
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const encodedPayload = btoa(JSON.stringify(payload));
  const signature = btoa('mock-signature-' + user.id);
  const accessToken = `${header}.${encodedPayload}.${signature}`;
  
  // Generate mock refresh token
  const refreshToken = btoa(JSON.stringify({
    user_id: user.id,
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  }));
  
  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: 'Bearer',
    expires_in: 24 * 60 * 60, // 24 hours in seconds
    user: userWithoutPassword
  };
};

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {boolean} rememberMe - Whether to remember the user
 * @returns {Promise<object>} Login response
 */
export const login = async (email, password, rememberMe = false) => {
  try {
    if (isApiEnabled()) {
      // Use CeedPods API
      const requestData = mapLoginRequest(email, password, rememberMe);
      const response = await authApiService.post(getApiEndpoints().auth.login, requestData);
      
      // Transform CeedPods response to frontend format
      const mappedResponse = mapAuthResponse(response);
      const { user, tokens } = mappedResponse;
      
      // Store tokens
      tokenManager.storeTokens(tokens.access_token, tokens.refresh_token, tokens.expires_in);
      
      return {
        success: true,
        user,
        tokens
      };
    } else {
      // Use mock data with delay
      await mockDelay();
      
      const user = MOCK_USERS.find(u => u.email === email && u.password === password);
      if (!user) {
        throw new ApiError('Invalid email or password', ERROR_TYPES.AUTHENTICATION, 401);
      }
      
      const tokens = generateMockTokens(user);
      
      // Store tokens
      tokenManager.storeTokens(
        tokens.access_token, 
        tokens.refresh_token, 
        tokens.expires_in
      );
      
      return {
        success: true,
        user: tokens.user,
        tokens
      };
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle CeedPods API error response
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
    if (isApiEnabled()) {
      // Use CeedPods API
      const requestData = mapRegistrationRequest(userData);
      const response = await authApiService.post(getApiEndpoints().auth.register, requestData);
      
      // Transform CeedPods response to frontend format
      const mappedResponse = mapAuthResponse(response);
      const { user, tokens } = mappedResponse;
      
      // Store tokens (auto-login after registration)
      tokenManager.storeTokens(tokens.access_token, tokens.refresh_token, tokens.expires_in);
      
      return {
        success: true,
        user,
        tokens
      };
    } else {
      // Use mock data with delay
      await mockDelay();
      
      // Check if email already exists
      const existingUser = MOCK_USERS.find(u => u.email === userData.email);
      if (existingUser) {
        throw new ApiError('Email already registered', ERROR_TYPES.VALIDATION, 400);
      }
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        ...userData,
        role: userData.role || 'sales_rep',
        avatar: null,
        createdAt: new Date().toISOString()
      };
      
      // Add to mock users (in real app, this would be persisted)
      MOCK_USERS.push(newUser);
      
      const tokens = generateMockTokens(newUser);
      
      // Store tokens (auto-login after registration)
      tokenManager.storeTokens(
        tokens.access_token,
        tokens.refresh_token,
        tokens.expires_in
      );
      
      return {
        success: true,
        user: tokens.user,
        tokens
      };
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle CeedPods API error response
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
    if (isApiEnabled() && tokenManager.hasAccessToken()) {
      // Notify CeedPods API about logout
      try {
        // CeedPods API expects empty JSON body for logout
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
    
    if (isApiEnabled()) {
      // Use CeedPods API
      const requestData = mapRefreshTokenRequest(refreshToken);
      const response = await authApiService.post(getApiEndpoints().auth.refresh, requestData);
      
      // Transform CeedPods response to frontend format
      const mappedResponse = mapSuccessResponse(response);
      const { token, refreshToken: newRefreshToken, expiresIn } = mappedResponse.data;
      
      // Store new tokens
      tokenManager.storeTokens(token, newRefreshToken, expiresIn);
      
      return {
        success: true,
        tokens: { access_token: token, refresh_token: newRefreshToken, expires_in: expiresIn }
      };
    } else {
      // Mock token refresh
      await mockDelay(500); // Shorter delay for token refresh
      
      try {
        // Parse mock refresh token
        const refreshPayload = JSON.parse(atob(refreshToken));
        const user = MOCK_USERS.find(u => u.id === refreshPayload.user_id);
        
        if (!user || refreshPayload.exp < Math.floor(Date.now() / 1000)) {
          throw new Error('Refresh token expired');
        }
        
        const tokens = generateMockTokens(user);
        
        // Store new tokens
        tokenManager.storeTokens(
          tokens.access_token,
          tokens.refresh_token,
          tokens.expires_in
        );
        
        return {
          success: true,
          tokens
        };
      } catch (error) {
        throw new ApiError('Refresh token invalid', ERROR_TYPES.AUTHENTICATION, 401);
      }
    }
  } catch (error) {
    // Clear tokens on refresh failure
    tokenManager.clearTokens();
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle CeedPods API error response
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
    if (isApiEnabled()) {
      // Use CeedPods API
      const requestData = mapPasswordResetRequest(email);
      const response = await authApiService.post(getApiEndpoints().auth.resetPassword, requestData);
      
      // Transform CeedPods response to frontend format
      const mappedResponse = mapSuccessResponse(response);
      
      return {
        success: true,
        message: mappedResponse.message || 'Password reset link sent to your email'
      };
    } else {
      // Mock password reset
      await mockDelay();
      
      const user = MOCK_USERS.find(u => u.email === email);
      if (!user) {
        throw new ApiError('No account found with this email', ERROR_TYPES.NOT_FOUND, 404);
      }
      
      // In real app, this would send an email
      console.log(`Mock: Password reset link sent to ${email}`);
      
      return {
        success: true,
        message: 'Password reset link sent to your email'
      };
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle CeedPods API error response
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
    if (isApiEnabled()) {
      // Use CeedPods API
      const requestData = mapPasswordResetConfirmRequest(email, newPassword, token);
      const response = await authApiService.post(getApiEndpoints().auth.resetPasswordConfirm, requestData);
      
      // Transform CeedPods response to frontend format
      const mappedResponse = mapSuccessResponse(response);
      
      return {
        success: true,
        message: mappedResponse.message || 'Password reset successfully'
      };
    } else {
      // Mock password reset confirm
      await mockDelay();
      
      return {
        success: true,
        message: 'Password reset successfully'
      };
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle CeedPods API error response
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
    if (isApiEnabled()) {
      // Use CeedPods API - Note: This is a GET request with query parameters
      const queryString = mapEmailVerificationRequest(email, token);
      const url = `${getApiEndpoints().auth.verifyEmail}?${queryString}`;
      
      const response = await authApiService.get(url);
      
      // Transform CeedPods response to frontend format
      const mappedResponse = mapSuccessResponse(response);
      
      return {
        success: true,
        message: mappedResponse.message || 'Email verified successfully'
      };
    } else {
      // Mock email verification
      await mockDelay();
      
      return {
        success: true,
        message: 'Email verified successfully'
      };
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle CeedPods API error response
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
    
    if (isApiEnabled()) {
      // For direct password updates (not reset flow), this might need a different endpoint
      // For now, we'll use the legacy format
      await authApiService.post('/update-password', {
        email,
        new_password: newPassword,
        reset_token: resetToken
      });
      
      return {
        success: true,
        message: 'Password updated successfully'
      };
    } else {
      // Mock password update
      await mockDelay();
      
      const userIndex = MOCK_USERS.findIndex(u => u.email === email);
      if (userIndex === -1) {
        throw new ApiError('User not found', ERROR_TYPES.NOT_FOUND, 404);
      }
      
      // Update password in mock data
      MOCK_USERS[userIndex].password = newPassword;
      
      return {
        success: true,
        message: 'Password updated successfully'
      };
    }
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
    if (isApiEnabled()) {
      // Use real API
      const response = await authApiService.get('/profile');
      return {
        success: true,
        user: response.user
      };
    } else {
      // Get user from token
      const user = tokenManager.getUserFromToken();
      if (!user) {
        throw new ApiError('Not authenticated', ERROR_TYPES.AUTHENTICATION, 401);
      }
      
      // Find full user data
      const fullUser = MOCK_USERS.find(u => u.id === user.id);
      if (!fullUser) {
        throw new ApiError('User not found', ERROR_TYPES.NOT_FOUND, 404);
      }
      
      const { password, ...userWithoutPassword } = fullUser;
      
      return {
        success: true,
        user: userWithoutPassword
      };
    }
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