/**
 * Authentication Hook
 * Provides authentication state and methods for React components
 */

import { useState, useEffect, useCallback } from 'react';
import authService from '../services/auth/authService.js';
import tokenManager from '../services/auth/tokenManager.js';
import { ApiError } from '../services/api/errorHandler.js';

/**
 * Custom hook for authentication management
 * @returns {object} Authentication state and methods
 */
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Initialize authentication state
   */
  const initializeAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if user has valid token
      if (authService.isAuthenticated()) {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          // Try to get fresh user data from API/token
          try {
            const response = await authService.getProfile();
            setUser(response.user);
            setIsAuthenticated(true);
          } catch (profileError) {
            // Clear invalid tokens
            tokenManager.clearTokens();
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setError(error.message);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {boolean} rememberMe - Whether to remember the user
   * @returns {Promise<object>} Login result
   */
  const login = useCallback(async (email, password, rememberMe = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.login(email, password, rememberMe);
      
      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true, user: response.user };
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.getUserMessage() : error.message;
      setError(errorMessage);
      setUser(null);
      setIsAuthenticated(false);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register new user
   * @param {object} userData - User registration data
   * @returns {Promise<object>} Registration result
   */
  const register = useCallback(async (userData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.register(userData);
      
      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true, user: response.user };
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.getUserMessage() : error.message;
      setError(errorMessage);
      setUser(null);
      setIsAuthenticated(false);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout user
   * @returns {Promise<object>} Logout result
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      
      return { success: true };
    } catch (error) {
      // Always clear local state even if server logout fails
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reset password
   * @param {string} email - User email
   * @returns {Promise<object>} Reset result
   */
  const resetPassword = useCallback(async (email) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.resetPassword(email);
      return response;
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.getUserMessage() : error.message;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update password
   * @param {string} email - User email
   * @param {string} newPassword - New password
   * @param {string} resetToken - Reset token (optional)
   * @returns {Promise<object>} Update result
   */
  const updatePassword = useCallback(async (email, newPassword, resetToken = null) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.updatePassword(email, newPassword, resetToken);
      return response;
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.getUserMessage() : error.message;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh user profile
   * @returns {Promise<object>} Profile refresh result
   */
  const refreshProfile = useCallback(async () => {
    try {
      setError(null);
      
      const response = await authService.getProfile();
      if (response.success) {
        setUser(response.user);
        return { success: true, user: response.user };
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.getUserMessage() : error.message;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Update user data locally
   * @param {object} updates - User data updates
   */
  const updateUser = useCallback((updates) => {
    setUser(prevUser => prevUser ? { ...prevUser, ...updates } : null);
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Handle automatic token refresh
   */
  const handleTokenRefresh = useCallback(async () => {
    if (tokenManager.shouldRefreshToken()) {
      try {
        await authService.refreshToken();
        // Update user data after token refresh
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        // Token refresh failed, logout user
        await logout();
      }
    }
  }, [logout]);

  // Set up event listeners for cross-tab synchronization and token management
  useEffect(() => {
    // Initialize authentication state
    initializeAuth();
    
    // Set up token manager
    tokenManager.initializeTokenManager();
    
    // Set up cross-tab event listeners
    const handleTokensUpdated = () => {
      // Refresh authentication state when tokens are updated
      initializeAuth();
    };
    
    const handleTokensCleared = () => {
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    };
    
    const handleLogoutOtherTab = () => {
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    };
    
    const handleLoginOtherTab = () => {
      initializeAuth();
    };
    
    // Add event listeners
    window.addEventListener('auth:tokens-updated', handleTokensUpdated);
    window.addEventListener('auth:tokens-cleared', handleTokensCleared);
    window.addEventListener('auth:logout-other-tab', handleLogoutOtherTab);
    window.addEventListener('auth:login-other-tab', handleLoginOtherTab);
    
    // Set up automatic token refresh check
    const refreshInterval = setInterval(handleTokenRefresh, 60000); // Check every minute
    
    // Cleanup
    return () => {
      window.removeEventListener('auth:tokens-updated', handleTokensUpdated);
      window.removeEventListener('auth:tokens-cleared', handleTokensCleared);
      window.removeEventListener('auth:logout-other-tab', handleLogoutOtherTab);
      window.removeEventListener('auth:login-other-tab', handleLoginOtherTab);
      clearInterval(refreshInterval);
    };
  }, [initializeAuth, handleTokenRefresh]);

  return {
    // State
    isAuthenticated,
    user,
    isLoading,
    error,
    
    // Methods
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    refreshProfile,
    updateUser,
    clearError,
    
    // Utility methods
    hasRole: (role) => user?.role === role,
    hasAnyRole: (roles) => roles.includes(user?.role),
    isAdmin: () => user?.role === 'admin',
    isManager: () => user?.role === 'manager' || user?.role === 'admin',
    isSalesRep: () => user?.role === 'sales_rep'
  };
};

export default useAuth;