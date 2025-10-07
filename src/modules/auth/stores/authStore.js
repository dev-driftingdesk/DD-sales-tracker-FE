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
          console.log('[AuthStore] Setting authentication state:', {
            user: response.user?.email,
            isAuthenticated: true,
            authMode,
            statusMessage
          });
          
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
          
          console.log('[AuthStore] Authentication state set successfully');
          
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
        console.log('[AuthStore] Starting logout process...');
        
        try {
          // Immediately clear state to prevent any race conditions
          set({
            user: null,
            isAuthenticated: false,
            error: null,
            authMode: null,
            statusMessage: 'Logging out...',
            backendStatus: null,
            isLoading: false,
            isInitializing: false
          });
          
          // Try backend API logout (don't wait for it)
          authService.logout().catch(error => {
            console.warn('[AuthStore] Backend logout failed (ignored):', error);
          });
          
          // Dispatch logout event for cross-tab synchronization
          window.dispatchEvent(new CustomEvent('auth:logout-other-tab'));
          
          // Final state update
          set({
            statusMessage: 'Logged out successfully',
            backendStatus: authService.getBackendStatus()
          });
          
          console.log('[AuthStore] Logout completed successfully');
          
        } catch (error) {
          console.error('[AuthStore] Logout error:', error);
          
          // Ensure state is cleared even on error
          set({
            user: null,
            isAuthenticated: false,
            error: null,
            authMode: null,
            statusMessage: 'Logged out',
            backendStatus: authService.getBackendStatus(),
            isLoading: false,
            isInitializing: false
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
      
      // Force logout without API call (for emergency logout)
      forceLogout: () => {
        console.log('[AuthStore] Force logout initiated');
        
        // Clear tokens immediately
        tokenManager.clearTokens();
        
        // Clear all auth state
        set({
          user: null,
          isAuthenticated: false,
          error: null,
          authMode: null,
          statusMessage: 'Session ended',
          backendStatus: null,
          isLoading: false,
          isInitializing: false
        });
        
        // Dispatch event for cross-tab sync
        window.dispatchEvent(new CustomEvent('auth:logout-other-tab'));
        
        console.log('[AuthStore] Force logout completed');
      },

      // Check authentication status with simplified, reliable logic
      checkAuthStatus: async () => {
        console.log('[AuthStore] Starting auth status check...');
        
        // Check if we have a valid token locally
        if (!authService.isAuthenticated()) {
          console.log('[AuthStore] No valid token found locally');
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
        
        // Get user from token immediately for consistent state
        const userFromToken = authService.getCurrentUser();
        if (!userFromToken || !userFromToken.id) {
          console.log('[AuthStore] Invalid token data');
          tokenManager.clearTokens();
          set({
            user: null,
            isAuthenticated: false,
            error: null,
            authMode: null,
            statusMessage: 'Invalid authentication',
            backendStatus: authService.getBackendStatus()
          });
          return false;
        }
        
        console.log('[AuthStore] Valid token found, setting authenticated state');
        
        try {
          // Try to get fresh profile from API with short timeout
          const profileResponse = await Promise.race([
            authService.getProfile(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
            )
          ]);
          
          if (profileResponse.success && profileResponse.user) {
            console.log('[AuthStore] Profile verification successful');
            const authMode = profileResponse.mode || 'api';
            const statusMessage = authMode === 'mock' ? 'Connected in demo mode' : 'Connected to backend API';
            
            set({
              user: profileResponse.user,
              isAuthenticated: true,
              error: null,
              authMode,
              statusMessage,
              backendStatus: authService.getBackendStatus()
            });
            return true;
          }
        } catch (error) {
          console.log('[AuthStore] API not available, using token-based auth');
        }
        
        // Fallback to token-based authentication
        console.log('[AuthStore] Using token-based authentication (offline mode)');
        set({
          user: userFromToken,
          isAuthenticated: true,
          error: null,
          authMode: 'mock',
          statusMessage: 'Connected in offline mode',
          backendStatus: authService.getBackendStatus()
        });
        
        return true;
      },

      // Removed checkMockAuthStatus - no longer needed with single store architecture

      // Initialize authentication state on app startup with race condition protection
      initializeAuth: async () => {
        console.log('[AuthStore] Starting authentication initialization...');
        
        // Prevent multiple simultaneous initializations
        const currentState = get();
        if (currentState.isInitializing) {
          console.log('[AuthStore] Initialization already in progress');
          return;
        }
        
        // Set initializing state
        set({ 
          isInitializing: true,
          statusMessage: 'Initializing authentication...',
          error: null
        });
        
        try {
          // Perform auth check with timeout
          const isValid = await Promise.race([
            get().checkAuthStatus(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Initialization timeout')), 5000)
            )
          ]);
          
          console.log('[AuthStore] Auth initialization completed:', isValid);
          
        } catch (error) {
          console.error('[AuthStore] Auth initialization failed:', error);
          
          // Set safe fallback state
          set({
            user: null,
            isAuthenticated: false,
            error: 'Authentication initialization failed',
            authMode: null,
            statusMessage: 'Initialization failed',
            backendStatus: authService.getBackendStatus()
          });
        } finally {
          // Always complete initialization
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
      },
      
      // Reset all auth state (for debugging/testing)
      resetAuthState: () => {
        console.log('[AuthStore] Resetting all authentication state');
        
        tokenManager.clearTokens();
        authService.resetBackendStatus();
        
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitializing: false,
          error: null,
          rememberMe: false,
          backendStatus: null,
          authMode: null,
          statusMessage: null
        });
        
        console.log('[AuthStore] Auth state reset completed');
      },
      
      // Handle token refresh automatically
      handleTokenRefresh: async () => {
        const currentState = get();
        if (!currentState.isAuthenticated) {
          console.log('[AuthStore] Not authenticated, skipping token refresh');
          return false;
        }
        
        try {
          console.log('[AuthStore] Attempting token refresh...');
          const response = await authService.refreshToken();
          
          if (response.success) {
            console.log('[AuthStore] Token refresh successful');
            // Update user data from refreshed token
            const userFromToken = authService.getCurrentUser();
            if (userFromToken) {
              set(state => ({ 
                ...state, 
                user: userFromToken,
                statusMessage: 'Session refreshed'
              }));
            }
            return true;
          } else {
            console.warn('[AuthStore] Token refresh failed');
            get().forceLogout();
            return false;
          }
        } catch (error) {
          console.error('[AuthStore] Token refresh error:', error);
          get().forceLogout();
          return false;
        }
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
        // Validate rehydrated state with strict consistency checks
        if (state) {
          console.log('[AuthStore] Rehydrating persisted state:', {
            hasUser: !!state.user,
            isAuthenticated: state.isAuthenticated,
            authMode: state.authMode
          });
          
          // Reset transient state first
          state.isInitializing = false;
          state.isLoading = false;
          state.error = null;
          state.statusMessage = null;
          state.backendStatus = null;
          
          // Validate authentication state consistency
          if (state.isAuthenticated) {
            // Must have valid user data
            if (!state.user || !state.user.id || !state.user.email) {
              console.warn('[AuthStore] Invalid persisted state: missing user data');
              state.isAuthenticated = false;
              state.user = null;
              state.authMode = null;
              tokenManager.clearTokens();
              return;
            }
            
            // Check token validity for API mode
            if (state.authMode === 'api') {
              if (!authService.isAuthenticated()) {
                console.warn('[AuthStore] Token expired - clearing persisted state');
                state.isAuthenticated = false;
                state.user = null;
                state.authMode = null;
                return;
              }
              
              // Verify token user matches persisted user
              const tokenUser = authService.getCurrentUser();
              if (!tokenUser || tokenUser.id !== state.user.id) {
                console.warn('[AuthStore] Token user mismatch - clearing persisted state');
                state.isAuthenticated = false;
                state.user = null;
                state.authMode = null;
                tokenManager.clearTokens();
                return;
              }
            }
            
            console.log('[AuthStore] Persisted authentication state validated successfully');
          }
        }
      }
    }
  )
);

export default useAuthStore;