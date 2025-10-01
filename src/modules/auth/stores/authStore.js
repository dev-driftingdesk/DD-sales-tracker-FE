import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../../../services/auth/authService.js';
import { isApiEnabled } from '../../../services/api/config.js';
import { ApiError } from '../../../services/api/errorHandler.js';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      rememberMe: false,
      
      // API integration flag
      useApiIntegration: isApiEnabled(),
      
      // Mock users database (fallback when API is not enabled)
      users: [
        {
          id: '1',
          email: 'admin@salestracker.com',
          password: 'admin123', // In real app, this would be hashed
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
      ],

      // Actions
      login: async (email, password, rememberMe = false) => {
        set({ isLoading: true, error: null });
        
        try {
          if (get().useApiIntegration) {
            // Use new API service
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
            // Fallback to existing mock implementation
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const user = get().users.find(
              u => u.email === email && u.password === password
            );
            
            if (!user) {
              throw new Error('Invalid email or password');
            }
            
            const { password: _, ...userWithoutPassword } = user;
            
            set({
              user: userWithoutPassword,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              rememberMe
            });
            
            return { success: true, user: userWithoutPassword };
          }
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
          if (get().useApiIntegration) {
            // Use new API service
            const response = await authService.register(userData);
            
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            
            return { success: true, user: response.user };
          } else {
            // Fallback to existing mock implementation
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check if email already exists
            const existingUser = get().users.find(u => u.email === userData.email);
            if (existingUser) {
              throw new Error('Email already registered');
            }
            
            // Create new user
            const newUser = {
              id: Date.now().toString(),
              ...userData,
              role: 'sales_rep', // Default role
              avatar: null,
              createdAt: new Date().toISOString()
            };
            
            // Add to users (in real app, this would be saved to backend)
            set(state => ({
              users: [...state.users, newUser]
            }));
            
            // Auto login after registration
            const { password: _, ...userWithoutPassword } = newUser;
            
            set({
              user: userWithoutPassword,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            
            return { success: true, user: userWithoutPassword };
          }
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
          if (get().useApiIntegration) {
            // Use new API service
            await authService.logout();
          }
          
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
          if (get().useApiIntegration) {
            // Use new API service
            const response = await authService.resetPassword(email);
            
            set({ isLoading: false });
            return response;
          } else {
            // Fallback to existing mock implementation
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const user = get().users.find(u => u.email === email);
            if (!user) {
              throw new Error('No account found with this email');
            }
            
            // In real app, this would send an email
            console.log(`Password reset link sent to ${email}`);
            
            set({ isLoading: false });
            return { success: true, message: 'Password reset link sent to your email' };
          }
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
          if (get().useApiIntegration) {
            // Use new API service
            const response = await authService.updatePassword(email, newPassword, resetToken);
            
            set({ isLoading: false });
            return response;
          } else {
            // Fallback to existing mock implementation
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            set(state => ({
              users: state.users.map(user =>
                user.email === email
                  ? { ...user, password: newPassword }
                  : user
              ),
              isLoading: false
            }));
            
            return { success: true, message: 'Password updated successfully' };
          }
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
          if (get().useApiIntegration) {
            // Use new API service
            const response = await authService.confirmPasswordReset(email, newPassword, token);
            
            set({ isLoading: false });
            return response;
          } else {
            // Fallback to existing mock implementation
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const userIndex = get().users.findIndex(u => u.email === email);
            if (userIndex === -1) {
              throw new Error('User not found');
            }
            
            // Update password in mock data
            set(state => ({
              users: state.users.map(user =>
                user.email === email
                  ? { ...user, password: newPassword }
                  : user
              ),
              isLoading: false
            }));
            
            return { success: true, message: 'Password reset successfully' };
          }
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
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe
      })
    }
  )
);

export default useAuthStore;