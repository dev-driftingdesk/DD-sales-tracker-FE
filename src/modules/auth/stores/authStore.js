import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService, { classifyAuthError } from '../../../services/auth/authService.js';
import { ApiError } from '../../../services/api/errorHandler.js';
import tokenManager from '../../../services/auth/tokenManager.js';
// Removed userStore dependency to eliminate dual store confusion
import { getConfig } from '../../../services/api/config.js';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitializing: true, // NEW: Track initialization state
      error: null,
      rememberMe: false,
      backendStatus: null, // NEW: Track backend connectivity status
      authMode: null, // NEW: Track authentication mode (api/mock)
      statusMessage: null, // NEW: User-friendly status messages
      
      

      // Actions
      login: async (email, password, rememberMe = false) => {
        set({ 
          isLoading: true, 
          error: null,
          statusMessage: 'Checking authentication...' 
        });
        
        try {
          console.log('[AuthStore] Login attempt for:', email);
          
          // Use the enhanced authService which handles backend detection automatically
          const response = await authService.login(email, password, rememberMe);
          
          // Determine authentication mode and status message
          const authMode = response.mode || 'api';
          let statusMessage = null;
          
          if (authMode === 'mock') {
            statusMessage = 'Connected in demo mode - backend unavailable';
          } else {
            statusMessage = 'Connected to backend API';
          }
          
          console.log('[AuthStore] Login successful -', authMode, 'mode');
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            rememberMe,
            authMode,
            statusMessage,
            backendStatus: authService.getBackendStatus()
          });
          
          return { success: true, user: response.user, mode: authMode };
        } catch (error) {
          console.error('[AuthStore] Login failed:', error);
          
          const errorMessage = error instanceof ApiError ? error.getUserMessage() : error.message;
          
          set({
            isLoading: false,
            error: errorMessage,
            statusMessage: 'Login failed',
            backendStatus: authService.getBackendStatus()
          });
          
          return { success: false, error: errorMessage };
        }
      },

      // Mock login fallback - removed to eliminate dual store confusion
      // Mock authentication is now handled directly by authService

      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          // Use backend API service only
          const response = await authService.register(userData);
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          
          return { success: true, user: response.user };
        } catch (error) {
          const errorMessage = error instanceof ApiError ? error.getUserMessage() : error.message;
          set({
            isLoading: false,
            error: errorMessage
          });
          return { success: false, error: errorMessage };
        }
      },

      logout: async () => {
        try {
          // Try backend API logout
          await authService.logout();
          
          set({
            user: null,
            isAuthenticated: false,
            error: null,
            authMode: null,
            statusMessage: 'Logged out',
            backendStatus: authService.getBackendStatus()
          });
        } catch (error) {
          // Always clear local state even if API logout fails
          console.warn('[AuthStore] Logout error:', error);
          
          set({
            user: null,
            isAuthenticated: false,
            error: null,
            authMode: null,
            statusMessage: 'Logged out',
            backendStatus: authService.getBackendStatus()
          });
        }
      },

      resetPassword: async (email) => {
        set({ isLoading: true, error: null });
        
        try {
          // Use backend API service only
          const response = await authService.resetPassword(email);
          
          set({ isLoading: false });
          return response;
        } catch (error) {
          const errorMessage = error instanceof ApiError ? error.getUserMessage() : error.message;
          set({
            isLoading: false,
            error: errorMessage
          });
          return { success: false, error: errorMessage };
        }
      },

      updatePassword: async (email, newPassword, resetToken = null) => {
        set({ isLoading: true, error: null });
        
        try {
          // Use backend API service only
          const response = await authService.updatePassword(email, newPassword, resetToken);
          
          set({ isLoading: false });
          return response;
        } catch (error) {
          const errorMessage = error instanceof ApiError ? error.getUserMessage() : error.message;
          set({
            isLoading: false,
            error: errorMessage
          });
          return { success: false, error: errorMessage };
        }
      },

      confirmPasswordReset: async (email, token, newPassword) => {
        set({ isLoading: true, error: null });
        
        try {
          // Use backend API service only
          const response = await authService.confirmPasswordReset(email, newPassword, token);
          
          set({ isLoading: false });
          return response;
        } catch (error) {
          const errorMessage = error instanceof ApiError ? error.getUserMessage() : error.message;
          set({
            isLoading: false,
            error: errorMessage
          });
          return { success: false, error: errorMessage };
        }
      },

      clearError: () => set({ error: null }),

      updateUser: (updates) => {
        set(state => ({
          user: state.user ? { ...state.user, ...updates } : null
        }));
      },

      // Check authentication status with enhanced backend detection and race condition protection
      checkAuthStatus: async () => {
        console.log('[AuthStore] Starting auth status check...');
        
        try {
          // First check if we have a valid token locally
          if (!authService.isAuthenticated()) {
            console.log('[AuthStore] No valid token found locally');
            // Clear any persisted invalid state atomically
            set({
              user: null,
              isAuthenticated: false,
              error: null,
              authMode: null,
              statusMessage: 'Not authenticated',
              backendStatus: authService.getBackendStatus()
            });
            return false;
          }
          
          console.log('[AuthStore] Valid token found locally, verifying profile...');
          
          // Use enhanced getProfile which handles backend detection with timeout protection
          const profilePromise = authService.getProfile();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile fetch timeout')), 8000)
          );
          
          const profileResponse = await Promise.race([profilePromise, timeoutPromise]);
          
          if (profileResponse.success && profileResponse.user) {
            console.log('[AuthStore] Profile verification successful:', profileResponse.user);
            
            // Determine authentication mode and status message
            const authMode = profileResponse.mode || 'api';
            let statusMessage = null;
            
            if (profileResponse.offline) {
              statusMessage = 'Connected in offline mode - backend unavailable';
            } else if (authMode === 'mock') {
              statusMessage = 'Connected in demo mode';
            } else {
              statusMessage = 'Connected to backend API';
            }
            
            // Set state atomically to prevent race conditions
            set({
              user: profileResponse.user,
              isAuthenticated: true,
              error: null,
              authMode,
              statusMessage,
              backendStatus: authService.getBackendStatus()
            });
            
            return true;
          } else if (profileResponse.networkError) {
            // Handle network error response - backend unavailable but preserve session if token exists
            console.log('[AuthStore] Network error detected, checking token validity...');
            
            if (authService.isAuthenticated()) {
              const userFromToken = authService.getCurrentUser();
              if (userFromToken) {
                console.log('[AuthStore] Preserving session with token-based user data due to network error');
                set({
                  user: userFromToken,
                  isAuthenticated: true,
                  error: null,
                  authMode: 'mock',
                  statusMessage: 'Connected in offline mode - backend unavailable',
                  backendStatus: authService.getBackendStatus()
                });
                return true;
              }
            }
            
            // If no valid token, clear state
            console.log('[AuthStore] No valid token for offline mode');
            tokenManager.clearTokens();
            set({
              user: null,
              isAuthenticated: false,
              error: null,
              authMode: null,
              statusMessage: 'Authentication required',
              backendStatus: authService.getBackendStatus()
            });
            return false;
          } else {
            console.log('[AuthStore] Profile verification failed - no user data');
            // Clear tokens and state
            tokenManager.clearTokens();
            set({
              user: null,
              isAuthenticated: false,
              error: null,
              authMode: null,
              statusMessage: 'Authentication expired',
              backendStatus: authService.getBackendStatus()
            });
            return false;
          }
        } catch (error) {
          console.error('[AuthStore] Authentication check failed:', error);
          
          // Use enhanced error classification for smart handling
          const errorClassification = classifyAuthError(error);
          console.log('[AuthStore] Error classification:', errorClassification);
          
          // Handle timeout errors specially
          if (error.message === 'Profile fetch timeout') {
            console.warn('[AuthStore] Profile fetch timed out, checking token validity...');
            
            // If we still have a valid token locally, keep user authenticated but mark as offline
            if (authService.isAuthenticated()) {
              const userFromToken = authService.getCurrentUser();
              if (userFromToken) {
                console.log('[AuthStore] Using token-based user data due to timeout');
                set({
                  user: userFromToken,
                  isAuthenticated: true,
                  error: null,
                  authMode: 'mock',
                  statusMessage: 'Connected in offline mode - backend timeout',
                  backendStatus: authService.getBackendStatus()
                });
                return true;
              }
            }
          }
          
          // Smart error handling based on classification
          if (errorClassification.shouldKeepSession) {
            console.log('[AuthStore] Network/backend error detected - preserving session');
            
            // Keep session for network errors, try to get user from token
            if (authService.isAuthenticated()) {
              const userFromToken = authService.getCurrentUser();
              if (userFromToken) {
                console.log('[AuthStore] Preserving session with token-based user data');
                set({
                  user: userFromToken,
                  isAuthenticated: true,
                  error: null,
                  authMode: 'mock',
                  statusMessage: errorClassification.userMessage,
                  backendStatus: authService.getBackendStatus()
                });
                return true;
              }
            }
            
            // If no valid token, show error but don't clear everything
            set({
              error: errorClassification.userMessage,
              statusMessage: errorClassification.userMessage,
              backendStatus: authService.getBackendStatus()
            });
            return false;
          } else {
            // Authentication error - clear tokens and state
            console.log('[AuthStore] Authentication error detected - clearing session');
            tokenManager.clearTokens();
            set({
              user: null,
              isAuthenticated: false,
              error: errorClassification.userMessage,
              authMode: null,
              statusMessage: 'Authentication failed',
              backendStatus: authService.getBackendStatus()
            });
            return false;
          }
        }
      },

      // Removed checkMockAuthStatus - no longer needed with single store architecture

      // Initialize authentication state on app startup with enhanced race condition protection
      initializeAuth: async () => {
        console.log('[AuthStore] Starting authentication initialization...');
        
        // Get current state to check if initialization is already in progress
        const currentState = get();
        if (currentState.isInitializing) {
          console.log('[AuthStore] Initialization already in progress, skipping...');
          return;
        }
        
        // Set initializing state atomically
        set({ 
          isInitializing: true,
          statusMessage: 'Initializing authentication...',
          error: null // Clear any previous errors
        });
        
        try {
          console.log('[AuthStore] Performing authentication status check...');
          
          // Check authentication status using enhanced method with timeout protection
          const authCheckPromise = get().checkAuthStatus();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Authentication check timeout')), 10000)
          );
          
          const isValid = await Promise.race([authCheckPromise, timeoutPromise]);
          console.log('[AuthStore] Auth status check completed:', isValid);
          
          // If authentication is valid, ensure user data is available immediately
          if (isValid) {
            const currentState = get();
            if (!currentState.user) {
              console.warn('[AuthStore] Authentication valid but no user data, attempting to fetch...');
              try {
                const profileResponse = await authService.getProfile();
                if (profileResponse.success && profileResponse.user) {
                  set({ user: profileResponse.user });
                  console.log('[AuthStore] User data retrieved successfully');
                }
              } catch (profileError) {
                console.warn('[AuthStore] Failed to fetch user profile:', profileError);
              }
            }
          }
          
          // Add small delay to prevent flashing but ensure user data is available
          await new Promise(resolve => setTimeout(resolve, 50));
          
        } catch (error) {
          console.error('[AuthStore] Authentication initialization failed:', error);
          
          // Set error state but don't crash the application
          set({
            user: null,
            isAuthenticated: false,
            error: error.message === 'Authentication check timeout' 
              ? 'Authentication check timed out - please try again' 
              : 'Authentication initialization failed',
            authMode: null,
            statusMessage: 'Initialization failed',
            backendStatus: authService.getBackendStatus()
          });
        } finally {
          // Ensure initializing is always set to false atomically
          console.log('[AuthStore] Completing authentication initialization');
          set(state => ({ 
            ...state, 
            isInitializing: false,
            statusMessage: state.isAuthenticated 
              ? (state.authMode === 'mock' ? 'Connected in demo mode' : 'Connected to backend API')
              : 'Ready for authentication'
          }));
        }
      },
      
      // Get current backend status
      getBackendStatus: () => {
        return authService.getBackendStatus();
      },
      
      // Reset backend status for fresh check
      resetBackendStatus: () => {
        authService.resetBackendStatus();
        set({ backendStatus: null });
      },
      
      // Clear status message
      clearStatusMessage: () => {
        set({ statusMessage: null });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
        authMode: state.authMode
        // Note: Don't persist isInitializing, backendStatus, statusMessage - they should be refreshed
      }),
      onRehydrateStorage: () => (state) => {
        // Validate rehydrated state with enhanced consistency checks
        if (state) {
          console.log('[AuthStore] Rehydrating persisted state:', {
            hasUser: !!state.user,
            isAuthenticated: state.isAuthenticated,
            authMode: state.authMode
          });
          
          // Validate authentication state consistency
          if (state.isAuthenticated && !state.user) {
            console.warn('[AuthStore] Invalid persisted state: authenticated but no user - clearing');
            state.isAuthenticated = false;
            state.user = null;
            state.authMode = null;
          }
          
          // Validate token consistency if API mode
          if (state.isAuthenticated && state.authMode === 'api') {
            if (!authService.isAuthenticated()) {
              console.warn('[AuthStore] Token expired or invalid - clearing persisted state');
              state.isAuthenticated = false;
              state.user = null;
              state.authMode = null;
            }
          }
          
          // Ensure initialization state is reset on rehydration
          state.isInitializing = false;
          state.isLoading = false;
          state.error = null;
          state.statusMessage = null;
          
          // Validate user data completeness for immediate availability
          if (state.isAuthenticated && state.user && !state.user.id) {
            console.warn('[AuthStore] Incomplete user data in persisted state - clearing');
            state.isAuthenticated = false;
            state.user = null;
            state.authMode = null;
          }
        }
      }
    }
  )
);

export default useAuthStore;