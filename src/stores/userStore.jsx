import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getAllUsers, getUserById, getUsersByTeam, getUsersByRole } from '../data/mockUsers.js';

const useUserStore = create(
  persist(
    (set, get) => ({
      users: getAllUsers(), // Use centralized mock data
      // Removed authentication state management to eliminate dual store confusion
      // Authentication is now exclusively handled by authStore
      
      // User preferences and settings (non-auth data)
      preferences: {
        theme: 'light',
        language: 'english',
        notifications: {
          email: true,
          push: true,
          desktop: true
        },
        dashboard: {
          defaultView: 'performance',
          refreshInterval: 30000
        }
      },
      
      // Actions for user preferences only
      updatePreferences: (newPreferences) => {
        set(state => ({
          preferences: { ...state.preferences, ...newPreferences }
        }));
      },
      
      // DEPRECATED METHODS - Use authStore for all authentication operations
      setCurrentUser: (user) => {
        console.warn('[UserStore] setCurrentUser is deprecated - use authStore.user instead');
        // Return empty to prevent any state changes
        return;
      },
      
      login: (email, password) => {
        console.warn('[UserStore] login is deprecated - use authStore.login() instead');
        return { success: false, error: 'Use authStore for authentication' };
      },
      
      logout: () => {
        console.warn('[UserStore] logout is deprecated - use authStore.logout() instead');
        // Return empty to prevent any state changes
        return;
      },
      
      getUserById: (userId) => {
        return getUserById(userId); // Use centralized function
      },
      
      getUsersByTeam: (teamId) => {
        return getUsersByTeam(teamId); // Use centralized function
      },
      
      getUsersByRole: (role) => {
        return getUsersByRole(role); // Use centralized function
      },
      
      isAdmin: () => {
        console.warn('[UserStore] isAdmin is deprecated - access authStore.user.role directly');
        // Check authStore instead
        return false; // Components should use authStore.user.role === 'admin'
      },
      
      isManager: () => {
        console.warn('[UserStore] isManager is deprecated - access authStore.user.role directly');
        // Check authStore instead  
        return false; // Components should use authStore.user.role === 'manager' || authStore.user.role === 'admin'
      },
      
      // DEPRECATED - For demo purposes, use authStore instead
      switchUser: (userId) => {
        console.warn('[UserStore] switchUser is deprecated - switching users should be done through proper authentication');
        // No longer set currentUser or isAuthenticated - these are managed by authStore
        return;
      },

      // Initialize user preferences on app start (non-authentication data only)
      initializeSession: () => {
        console.log('[UserStore] Initializing user preferences (authentication handled by authStore)');
        
        // Initialize any user preference defaults if needed
        const currentState = get();
        if (!currentState.preferences.theme) {
          set(state => ({
            preferences: {
              ...state.preferences,
              theme: 'light',
              language: 'english'
            }
          }));
        }
        
        console.log('[UserStore] User preferences initialized');
      }
    }),
    {
      name: 'user-storage', // name of the localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist user authentication data
      partialize: (state) => ({
        users: state.users, // Keep mock user data for reference
        preferences: state.preferences
        // Authentication state completely removed - handled by authStore
      }),
    }
  )
);

export default useUserStore;