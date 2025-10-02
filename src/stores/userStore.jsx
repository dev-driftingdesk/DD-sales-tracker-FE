import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Mock user data
const mockUsers = [
  {
    id: 'user-1',
    name: 'Sara Ahmed',
    email: 'sara@salestracker.com',
    role: 'sales_rep',
    team: 'team-1',
    location: 'Jakarta',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara',
    language: 'arabic',
    joinedDate: '2023-01-15',
    isActive: true,
    expertise: ['wholesale', 'retail', 'middle-east-market'],
    industries: ['retail', 'distribution'],
    maxActiveLeads: 20,
    currentActiveLeads: 15,
    preferredDealSize: { min: 10000, max: 100000 },
    languageProficiency: { arabic: 'native', english: 'fluent', indonesian: 'native' },
    successRateBySource: { facebook: 0.85, email: 0.70, event: 0.90 },
    commissionPercentage: 6.5,
    targets: {
      monthly: 120000,
      quarterly: 360000,
      yearly: 1440000,
      calls: 150,
      emails: 200,
      meetings: 50
    },
    actualPerformance: {
      monthlyRevenue: 142000,
      quarterlyRevenue: 395000,
      yearlyRevenue: 1580000,
      callsMade: 168,
      emailsSent: 242,
      meetingsHeld: 58,
      dealsWon: 12,
      averageDealSize: 46500
    }
  },
  {
    id: 'user-2',
    name: 'Maria Rodriguez',
    email: 'maria@salestracker.com',
    role: 'sales_rep',
    team: 'team-2',
    location: 'London',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    language: 'english',
    joinedDate: '2023-03-20',
    isActive: true,
    expertise: ['premium-tea', 'organic', 'european-market'],
    industries: ['hospitality', 'retail', 'e-commerce'],
    maxActiveLeads: 25,
    currentActiveLeads: 18,
    preferredDealSize: { min: 20000, max: 150000 },
    languageProficiency: { english: 'native', spanish: 'fluent', french: 'basic' },
    successRateBySource: { website: 0.80, email: 0.75, instagram: 0.65 },
    commissionPercentage: 7.2,
    targets: {
      monthly: 150000,
      quarterly: 450000,
      yearly: 1800000,
      calls: 120,
      emails: 180,
      meetings: 60
    },
    actualPerformance: {
      monthlyRevenue: 185000,
      quarterlyRevenue: 520000,
      yearlyRevenue: 2080000,
      callsMade: 142,
      emailsSent: 198,
      meetingsHeld: 72,
      dealsWon: 18,
      averageDealSize: 52500
    }
  },
  {
    id: 'user-3',
    name: 'Amir Hassan',
    email: 'amir@salestracker.com',
    role: 'sales_rep',
    team: 'team-1',
    location: 'Dubai',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amir',
    language: 'arabic',
    joinedDate: '2022-11-10',
    isActive: true,
    expertise: ['wholesale', 'luxury-tea', 'middle-east-market'],
    industries: ['hospitality', 'retail', 'distribution'],
    maxActiveLeads: 30,
    currentActiveLeads: 22,
    preferredDealSize: { min: 25000, max: 200000 },
    languageProficiency: { arabic: 'native', english: 'fluent', hindi: 'basic' },
    successRateBySource: { facebook: 0.90, event: 0.95, whatsapp: 0.88 },
    commissionPercentage: 8.0,
    targets: {
      monthly: 180000,
      quarterly: 540000,
      yearly: 2160000,
      calls: 100,
      emails: 150,
      meetings: 80
    },
    actualPerformance: {
      monthlyRevenue: 195000,
      quarterlyRevenue: 585000,
      yearlyRevenue: 2340000,
      callsMade: 118,
      emailsSent: 165,
      meetingsHeld: 85,
      dealsWon: 15,
      averageDealSize: 67500
    }
  },
  {
    id: 'user-4',
    name: 'Jacob Williams',
    email: 'jacob@salestracker.com',
    role: 'sales_rep',
    team: 'team-2',
    location: 'New York',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jacob',
    language: 'english',
    joinedDate: '2023-02-01',
    isActive: true,
    expertise: ['specialty-tea', 'organic', 'us-market'],
    industries: ['retail', 'e-commerce', 'hospitality'],
    maxActiveLeads: 20,
    currentActiveLeads: 12,
    preferredDealSize: { min: 5000, max: 75000 },
    languageProficiency: { english: 'native', spanish: 'basic' },
    successRateBySource: { website: 0.70, email: 0.65, manual: 0.75 },
    commissionPercentage: 5.8,
    targets: {
      monthly: 100000,
      quarterly: 300000,
      yearly: 1200000,
      calls: 140,
      emails: 220,
      meetings: 45
    },
    actualPerformance: {
      monthlyRevenue: 115000,
      quarterlyRevenue: 345000,
      yearlyRevenue: 1380000,
      callsMade: 152,
      emailsSent: 235,
      meetingsHeld: 48,
      dealsWon: 10,
      averageDealSize: 38500
    }
  },
  {
    id: 'user-5',
    name: 'Anna Chen',
    email: 'anna@salestracker.com',
    role: 'sales_rep',
    team: 'team-3',
    location: 'Singapore',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna',
    language: 'english',
    joinedDate: '2022-09-15',
    isActive: true,
    expertise: ['premium-tea', 'specialty-blends', 'asian-market'],
    industries: ['hospitality', 'retail', 'distribution'],
    maxActiveLeads: 25,
    currentActiveLeads: 20,
    preferredDealSize: { min: 15000, max: 120000 },
    languageProficiency: { english: 'native', chinese: 'native', malay: 'fluent' },
    successRateBySource: { email: 0.85, website: 0.80, event: 0.92 },
    commissionPercentage: 7.8,
    targets: {
      monthly: 140000,
      quarterly: 420000,
      yearly: 1680000,
      calls: 110,
      emails: 160,
      meetings: 70
    },
    actualPerformance: {
      monthlyRevenue: 165000,
      quarterlyRevenue: 495000,
      yearlyRevenue: 1980000,
      callsMade: 125,
      emailsSent: 175,
      meetingsHeld: 78,
      dealsWon: 14,
      averageDealSize: 58500
    }
  },
  {
    id: 'user-6',
    name: 'Ravi Patel',
    email: 'ravi@salestracker.com',
    role: 'manager',
    team: 'team-1',
    location: 'Mumbai',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ravi',
    language: 'english',
    joinedDate: '2022-06-01',
    isActive: true,
    expertise: ['team-management', 'strategic-accounts', 'all-markets'],
    industries: ['all'],
    maxActiveLeads: 50,
    currentActiveLeads: 5,
    preferredDealSize: { min: 50000, max: 500000 },
    languageProficiency: { english: 'native', hindi: 'native', gujarati: 'native' },
    successRateBySource: { all: 0.85 }
  },
  {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@salestracker.com',
    role: 'admin',
    team: null,
    location: 'Global',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    language: 'english',
    joinedDate: '2022-01-01',
    isActive: true,
    expertise: ['system-admin'],
    industries: ['all'],
    maxActiveLeads: 0,
    currentActiveLeads: 0,
    preferredDealSize: { min: 0, max: 0 },
    languageProficiency: { english: 'native' },
    successRateBySource: {}
  }
];

const useUserStore = create(
  persist(
    (set, get) => ({
      users: mockUsers,
      currentUser: null, // Will be loaded from localStorage or set to default
      isAuthenticated: false, // Will be determined by presence of currentUser
      
      // Actions
      setCurrentUser: (user) => set({ currentUser: user, isAuthenticated: true }),
      
      login: (email, password) => {
        // Mock login - in real app, this would call an API
        // NOTE: This is now primarily used by authStore for consistency
        const user = mockUsers.find(u => u.email === email);
        if (user) {
          set({ currentUser: user, isAuthenticated: true });
          return { success: true, user };
        }
        return { success: false, error: 'Invalid credentials' };
      },
      
      logout: () => set({ currentUser: null, isAuthenticated: false }),
      
      getUserById: (userId) => {
        const { users } = get();
        return users.find(u => u.id === userId);
      },
      
      getUsersByTeam: (teamId) => {
        const { users } = get();
        return users.filter(u => u.team === teamId);
      },
      
      getUsersByRole: (role) => {
        const { users } = get();
        return users.filter(u => u.role === role);
      },
      
      isAdmin: () => {
        const { currentUser } = get();
        return currentUser?.role === 'admin';
      },
      
      isManager: () => {
        const { currentUser } = get();
        return currentUser?.role === 'manager' || currentUser?.role === 'admin';
      },
      
      // For demo purposes - switch between users
      switchUser: (userId) => {
        const user = mockUsers.find(u => u.id === userId);
        if (user) {
          set({ currentUser: user, isAuthenticated: true });
        }
      },

      // Initialize user session on app start (for mock mode compatibility)
      initializeSession: () => {
        const { currentUser, isAuthenticated } = get();
        
        console.log('[UserStore] Initializing session - current state:', { 
          hasUser: !!currentUser, 
          isAuthenticated,
          userEmail: currentUser?.email 
        });
        
        // Only initialize if we don't have a current user
        // This allows authStore to take precedence
        if (!currentUser && !isAuthenticated) {
          // Set default user for demo if no persisted user
          console.log('[UserStore] No persisted user found, initializing default demo user');
          set({ currentUser: mockUsers[3], isAuthenticated: true });
        } else if (currentUser && isAuthenticated) {
          // Validate the persisted user still exists
          const validUser = mockUsers.find(u => u.id === currentUser.id);
          if (!validUser) {
            console.log('[UserStore] Persisted user no longer valid, clearing session');
            set({ currentUser: null, isAuthenticated: false });
          } else {
            console.log('[UserStore] Valid persisted user found:', validUser.email);
          }
        }
      }
    }),
    {
      name: 'user-storage', // name of the localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist user authentication data
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useUserStore;