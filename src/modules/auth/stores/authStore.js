import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../../../services/auth/authService.js';
import { ApiError } from '../../../services/api/errorHandler.js';
import tokenManager from '../../../services/auth/tokenManager.js';

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
        
        try {
          // Use backend API service only
          const response = await authService.login(email, password, rememberMe);
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            rememberMe
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
          // Use backend API service only
          await authService.logout();
          
          set({
            user: null,
            isAuthenticated: false,
            error: null
          });
        } catch (error) {
          // Always clear local state even if API logout fails
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

      // Check authentication status using backend API only
      checkAuthStatus: async () => {
        try {
          if (!authService.isAuthenticated()) {
            // No valid token, user is not authenticated
            set({
              user: null,
              isAuthenticated: false,
              error: null,
              isInitializing: false
            });
            return false;
          }
          
          // Verify with backend API
          const profileResponse = await authService.getProfile();
          if (profileResponse.success) {
            // API token is valid, update user data
            set({
              user: profileResponse.user,
              isAuthenticated: true,
              error: null,
              isInitializing: false
            });
            return true;
          } else {
            // API token is invalid
            set({
              user: null,
              isAuthenticated: false,
              error: null,
              isInitializing: false
            });
            return false;
          }
        } catch (error) {
          // Authentication check failed
          set({
            user: null,
            isAuthenticated: false,
            error: null,
            isInitializing: false
          });
          return false;
        }
      },

      // Initialize authentication state on app startup
      initializeAuth: async () => {
        // Set initializing state
        set({ isInitializing: true });
        
        try {
          // Check authentication status using backend API only
          await get().checkAuthStatus();
        } catch (error) {
          console.error('Authentication initialization failed:', error);
          set({
            user: null,
            isAuthenticated: false,
            isInitializing: false,
            error: 'Authentication initialization failed'
          });
        } finally {
          // Ensure initializing is always set to false
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