import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../../../services/auth/authService.js';
import { ApiError } from '../../../services/api/errorHandler.js';
import tokenManager from '../../../services/auth/tokenManager.js';
import useUserStore from '../../../stores/userStore.jsx';
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
      
      

      // Actions
      login: async (email, password, rememberMe = false) => {
        set({ isLoading: true, error: null });
        
        const isApiEnabled = getConfig('enableApiIntegration', false);
        console.log('[AuthStore] Login attempt - API enabled:', isApiEnabled);
        
        try {
          if (isApiEnabled) {
            // Try backend API first
            console.log('[AuthStore] Attempting backend API login...');
            const response = await authService.login(email, password, rememberMe);
            
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              rememberMe
            });
            
            return { success: true, user: response.user };
          } else {
            // Use mock authentication
            return get().mockLogin(email, password, rememberMe);
          }
        } catch (error) {
          console.error('[AuthStore] Backend login failed:', error);
          
          // Check if it's a network error
          if (error.code === 'ECONNREFUSED' || 
              error.message?.includes('NetworkError') ||
              error.message?.includes('fetch') ||
              error.name === 'NetworkError' ||
              !navigator.onLine) {
            
            console.warn('[AuthStore] Network error during login - falling back to mock');
            return get().mockLogin(email, password, rememberMe);
          }
          
          const errorMessage = error instanceof ApiError ? error.getUserMessage() : error.message;
          set({
            isLoading: false,
            error: errorMessage
          });
          return { success: false, error: errorMessage };
        }
      },

      // Mock login fallback
      mockLogin: (email, password, rememberMe = false) => {
        console.log('[AuthStore] Attempting mock login for:', email);
        
        const userStore = useUserStore.getState();
        const mockResult = userStore.login(email, password);
        
        if (mockResult.success) {
          console.log('[AuthStore] Mock login successful:', mockResult.user);
          set({
            user: mockResult.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            rememberMe
          });
          return { success: true, user: mockResult.user };
        } else {
          console.log('[AuthStore] Mock login failed:', mockResult.error);
          set({
            isLoading: false,
            error: mockResult.error
          });
          return { success: false, error: mockResult.error };
        }
      },

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
        const isApiEnabled = getConfig('enableApiIntegration', false);
        
        try {
          if (isApiEnabled) {
            // Try backend API logout
            await authService.logout();
          }
          
          // Also clear mock authentication
          const userStore = useUserStore.getState();
          userStore.logout();
          
          set({
            user: null,
            isAuthenticated: false,
            error: null
          });
        } catch (error) {
          // Always clear local state even if API logout fails
          console.warn('[AuthStore] Logout error:', error);
          
          // Clear mock state
          const userStore = useUserStore.getState();
          userStore.logout();
          
          set({
            user: null,
            isAuthenticated: false,
            error: null
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

      // Check authentication status with backend API and fallback
      checkAuthStatus: async () => {
        console.log('[AuthStore] Starting auth status check...');
        
        const isApiEnabled = getConfig('enableApiIntegration', false);
        console.log('[AuthStore] API integration enabled:', isApiEnabled);
        
        // If API integration is disabled, use mock authentication
        if (!isApiEnabled) {
          console.log('[AuthStore] API disabled, checking mock authentication...');
          return get().checkMockAuthStatus();
        }
        
        try {
          // First check if we have a valid token locally
          if (!authService.isAuthenticated()) {
            console.log('[AuthStore] No valid token found locally');
            // Clear any persisted invalid state
            set({
              user: null,
              isAuthenticated: false,
              error: null
            });
            return false;
          }
          
          console.log('[AuthStore] Valid token found locally, verifying with backend...');
          
          // Verify with backend API
          const profileResponse = await authService.getProfile();
          if (profileResponse.success) {
            console.log('[AuthStore] Backend verification successful:', profileResponse.user);
            // API token is valid, update user data
            set({
              user: profileResponse.user,
              isAuthenticated: true,
              error: null
            });
            return true;
          } else {
            console.log('[AuthStore] Backend verification failed - token invalid');
            // API token is invalid, clear tokens and state
            tokenManager.clearTokens();
            set({
              user: null,
              isAuthenticated: false,
              error: null
            });
            return false;
          }
        } catch (error) {
          console.error('[AuthStore] Authentication check failed:', error);
          
          // Check if it's a network error vs auth error
          if (error.code === 'ECONNREFUSED' || 
              error.message?.includes('NetworkError') ||
              error.message?.includes('fetch') ||
              error.name === 'NetworkError' ||
              !navigator.onLine) {
            
            console.warn('[AuthStore] Network error detected - falling back to mock mode');
            
            // For network errors, fall back to mock authentication
            return get().checkMockAuthStatus();
          }
          
          // For auth errors, clear everything
          console.log('[AuthStore] Clearing auth state due to authentication error');
          tokenManager.clearTokens();
          set({
            user: null,
            isAuthenticated: false,
            error: null
          });
          return false;
        }
      },

      // Fallback authentication using mock/localStorage
      checkMockAuthStatus: () => {
        console.log('[AuthStore] Checking mock authentication status...');
        
        const userStore = useUserStore.getState();
        const currentUser = userStore.currentUser;
        const isUserAuthenticated = userStore.isAuthenticated;
        
        console.log('[AuthStore] Mock auth state:', { currentUser: currentUser?.email, isUserAuthenticated });
        
        if (currentUser && isUserAuthenticated) {
          console.log('[AuthStore] Valid mock user found, setting authenticated state');
          set({
            user: currentUser,
            isAuthenticated: true,
            error: null
          });
          return true;
        } else {
          console.log('[AuthStore] No valid mock user, clearing authentication');
          set({
            user: null,
            isAuthenticated: false,
            error: null
          });
          return false;
        }
      },

      // Initialize authentication state on app startup
      initializeAuth: async () => {
        console.log('[AuthStore] Starting authentication initialization...');
        
        // Set initializing state
        set({ isInitializing: true });
        
        try {
          // Check authentication status using backend API
          const isValid = await get().checkAuthStatus();
          console.log('[AuthStore] Auth status check completed:', isValid);
          
          // Add small delay to prevent flashing
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error('[AuthStore] Authentication initialization failed:', error);
          set({
            user: null,
            isAuthenticated: false,
            error: 'Authentication initialization failed'
          });
        } finally {
          // Ensure initializing is always set to false
          console.log('[AuthStore] Setting isInitializing to false');
          set(state => ({ 
            ...state, 
            isInitializing: false 
          }));
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe
        // Note: Don't persist isInitializing - it should always start as true
      })
    }
  )
);

export default useAuthStore;