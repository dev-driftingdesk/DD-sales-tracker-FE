import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      rememberMe: false,
      
      // Mock users database (in real app, this would be in backend)
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
          // Simulate API call delay
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
        } catch (error) {
          set({
            isLoading: false,
            error: error.message
          });
          return { success: false, error: error.message };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call delay
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
        } catch (error) {
          set({
            isLoading: false,
            error: error.message
          });
          return { success: false, error: error.message };
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null
        });
      },

      resetPassword: async (email) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const user = get().users.find(u => u.email === email);
          if (!user) {
            throw new Error('No account found with this email');
          }
          
          // In real app, this would send an email
          console.log(`Password reset link sent to ${email}`);
          
          set({ isLoading: false });
          return { success: true, message: 'Password reset link sent to your email' };
        } catch (error) {
          set({
            isLoading: false,
            error: error.message
          });
          return { success: false, error: error.message };
        }
      },

      updatePassword: async (email, newPassword) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call delay
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
        } catch (error) {
          set({
            isLoading: false,
            error: error.message
          });
          return { success: false, error: error.message };
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
        user: state.rememberMe ? state.user : null,
        isAuthenticated: state.rememberMe ? state.isAuthenticated : false,
        rememberMe: state.rememberMe
      })
    }
  )
);

export default useAuthStore;