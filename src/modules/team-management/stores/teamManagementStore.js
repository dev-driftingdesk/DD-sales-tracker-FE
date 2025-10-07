import { create } from 'zustand';
import { 
  USER_ROLES, 
  USER_STATUS, 
  DEFAULT_PERMISSIONS, 
  TEAM_TYPES,
  REGIONS,
  PRODUCT_CATEGORIES 
} from '../constants/index.js';
import { teamManagementApi } from '../../../services/team-management/teamManagementApiService.js';
import { 
  mapUserFromApi, 
  mapUserToApi, 
  mapTeamFromApi, 
  mapTeamToApi,
  mapInvitationFromApi,
  mapInvitationToApi,
  mapPaginationFromApi,
  mapFiltersToApi
} from '../../../services/api/teamManagementMapper.js';

const useTeamManagementStore = create((set, get) => ({
  // State - START WITH EMPTY ARRAYS FOR API-ONLY MODE
  users: [],
  teams: [],
  invitations: [],
  
  selectedUser: null,
  selectedTeam: null,
  isLoading: false,
  error: null,
  
  // User management actions - API ONLY
  createUser: async (userData) => {
    try {
      set({ isLoading: true, error: null });
      
      const apiUserData = mapUserToApi(userData);
      const response = await teamManagementApi.createUser(apiUserData);
      const newUser = mapUserFromApi(response.data || response);
      
      set((state) => ({
        users: [...state.users, newUser],
        isLoading: false
      }));
      
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      set({ 
        error: error.message || 'Failed to create user',
        isLoading: false 
      });
      throw error;
    }
  },
  
  updateUser: async (userId, updates) => {
    try {
      set({ isLoading: true, error: null });
      
      const apiUserData = mapUserToApi(updates);
      const response = await teamManagementApi.updateUser(userId, apiUserData);
      const updatedUser = mapUserFromApi(response.data || response);
      
      set((state) => ({
        users: state.users.map(user => 
          user.id === userId ? updatedUser : user
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating user:', error);
      set({ 
        error: error.message || 'Failed to update user',
        isLoading: false 
      });
      throw error;
    }
  },
  
  deleteUser: async (userId) => {
    try {
      set({ isLoading: true, error: null });
      
      await teamManagementApi.deleteUser(userId);
      
      set((state) => ({
        users: state.users.filter(user => user.id !== userId),
        teams: state.teams.map(team => ({
          ...team,
          members: team.members.filter(id => id !== userId)
        })),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting user:', error);
      set({ 
        error: error.message || 'Failed to delete user',
        isLoading: false 
      });
      throw error;
    }
  },
  
  deactivateUser: async (userId) => {
    try {
      set({ isLoading: true, error: null });
      
      await teamManagementApi.deactivateUser(userId);
      
      set((state) => ({
        users: state.users.map(user => 
          user.id === userId 
            ? { ...user, status: USER_STATUS.INACTIVE, updatedAt: new Date().toISOString() }
            : user
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deactivating user:', error);
      set({ 
        error: error.message || 'Failed to deactivate user',
        isLoading: false 
      });
      throw error;
    }
  },
  
  reactivateUser: async (userId) => {
    try {
      set({ isLoading: true, error: null });
      
      await teamManagementApi.activateUser(userId);
      
      set((state) => ({
        users: state.users.map(user => 
          user.id === userId 
            ? { ...user, status: USER_STATUS.ACTIVE, updatedAt: new Date().toISOString() }
            : user
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error reactivating user:', error);
      set({ 
        error: error.message || 'Failed to reactivate user',
        isLoading: false 
      });
      throw error;
    }
  },
  
  updateUserPermissions: (userId, permissions) => {
    get().updateUser(userId, { permissions });
  },
  
  // Team management actions - API ONLY
  createTeam: async (teamData) => {
    try {
      set({ isLoading: true, error: null });
      
      const apiTeamData = mapTeamToApi(teamData);
      const response = await teamManagementApi.createTeam(apiTeamData);
      const newTeam = mapTeamFromApi(response.data || response);
      
      set((state) => ({
        teams: [...state.teams, newTeam],
        isLoading: false
      }));
      
      return newTeam;
    } catch (error) {
      console.error('Error creating team:', error);
      set({ 
        error: error.message || 'Failed to create team',
        isLoading: false 
      });
      throw error;
    }
  },
  
  updateTeam: async (teamId, updates) => {
    try {
      set({ isLoading: true, error: null });
      
      const apiTeamData = mapTeamToApi(updates);
      const response = await teamManagementApi.updateTeam(teamId, apiTeamData);
      const updatedTeam = mapTeamFromApi(response.data || response);
      
      set((state) => ({
        teams: state.teams.map(team => 
          team.id === teamId ? updatedTeam : team
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating team:', error);
      set({ 
        error: error.message || 'Failed to update team',
        isLoading: false 
      });
      throw error;
    }
  },
  
  deleteTeam: async (teamId) => {
    try {
      set({ isLoading: true, error: null });
      
      await teamManagementApi.deleteTeam(teamId);
      
      set((state) => ({
        teams: state.teams.filter(team => team.id !== teamId),
        users: state.users.map(user => ({
          ...user,
          teams: user.teams.filter(id => id !== teamId)
        })),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting team:', error);
      set({ 
        error: error.message || 'Failed to delete team',
        isLoading: false 
      });
      throw error;
    }
  },
  
  addUserToTeam: (userId, teamId) => {
    // Add user to team
    set((state) => ({
      teams: state.teams.map(team => 
        team.id === teamId && !team.members.includes(userId)
          ? { ...team, members: [...team.members, userId] }
          : team
      ),
      users: state.users.map(user => 
        user.id === userId && !user.teams.includes(teamId)
          ? { ...user, teams: [...user.teams, teamId] }
          : user
      )
    }));
  },
  
  removeUserFromTeam: (userId, teamId) => {
    set((state) => ({
      teams: state.teams.map(team => 
        team.id === teamId
          ? { ...team, members: team.members.filter(id => id !== userId) }
          : team
      ),
      users: state.users.map(user => 
        user.id === userId
          ? { ...user, teams: user.teams.filter(id => id !== teamId) }
          : user
      )
    }));
  },
  
  // Invitation management - API ONLY
  createInvitation: async (invitationData) => {
    try {
      set({ isLoading: true, error: null });
      
      const apiInvitationData = mapInvitationToApi(invitationData);
      const response = await teamManagementApi.createInvitation(apiInvitationData);
      const newInvitation = mapInvitationFromApi(response.data || response);
      
      set((state) => ({
        invitations: [...state.invitations, newInvitation],
        isLoading: false
      }));
      
      console.log('Invitation sent via API to:', newInvitation.email);
      
      return newInvitation;
    } catch (error) {
      console.error('Error creating invitation:', error);
      set({ 
        error: error.message || 'Failed to create invitation',
        isLoading: false 
      });
      throw error;
    }
  },
  
  acceptInvitation: (invitationId, userData) => {
    const invitation = get().invitations.find(inv => inv.id === invitationId);
    if (!invitation) return null;
    
    // Create user from invitation
    const newUser = get().createUser({
      ...userData,
      email: invitation.email,
      role: invitation.role,
      teams: invitation.teams || [],
      regions: invitation.regions || [],
      products: invitation.products || []
    });
    
    // Remove invitation
    set((state) => ({
      invitations: state.invitations.filter(inv => inv.id !== invitationId)
    }));
    
    return newUser;
  },
  
  cancelInvitation: (invitationId) => {
    set((state) => ({
      invitations: state.invitations.filter(inv => inv.id !== invitationId)
    }));
  },
  
  // Permission checks
  hasPermission: (userId, permission) => {
    const user = get().users.find(u => u.id === userId);
    return user?.permissions?.includes(permission) || false;
  },
  
  canAccessRegion: (userId, region) => {
    const user = get().users.find(u => u.id === userId);
    return user?.regions?.includes(region) || false;
  },
  
  canAccessProduct: (userId, product) => {
    const user = get().users.find(u => u.id === userId);
    return user?.products?.includes(product) || false;
  },
  
  // Getters
  getUsersByTeam: (teamId) => {
    const team = get().teams.find(t => t.id === teamId);
    if (!team) return [];
    return get().users.filter(user => team.members.includes(user.id));
  },
  
  getUsersByRole: (role) => {
    return get().users.filter(user => user.role === role);
  },
  
  getActiveUsers: () => {
    return get().users.filter(user => user.status === USER_STATUS.ACTIVE);
  },
  
  getTeamsByUser: (userId) => {
    const user = get().users.find(u => u.id === userId);
    if (!user) return [];
    return get().teams.filter(team => user.teams.includes(team.id));
  },
  
  // UI state management
  setSelectedUser: (user) => set({ selectedUser: user }),
  setSelectedTeam: (team) => set({ selectedTeam: team }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  // Bulk operations
  bulkUpdateUsers: (userIds, updates) => {
    set((state) => ({
      users: state.users.map(user => 
        userIds.includes(user.id)
          ? { ...user, ...updates, updatedAt: new Date().toISOString() }
          : user
      )
    }));
  },
  
  bulkDeactivateUsers: (userIds) => {
    get().bulkUpdateUsers(userIds, { status: USER_STATUS.INACTIVE });
  },

  bulkDeleteUsers: (userIds) => {
    set((state) => ({
      users: state.users.filter(user => !userIds.includes(user.id)),
      teams: state.teams.map(team => ({
        ...team,
        members: team.members.filter(id => !userIds.includes(id))
      }))
    }));
  },

  bulkAssignRole: (userIds, role) => {
    set((state) => ({
      users: state.users.map(user => 
        userIds.includes(user.id)
          ? { ...user, role, permissions: DEFAULT_PERMISSIONS[role] || [], updatedAt: new Date().toISOString() }
          : user
      )
    }));
  },

  bulkAssignTeams: (userIds, teamIds) => {
    set((state) => {
      // Update users with new teams
      const updatedUsers = state.users.map(user => 
        userIds.includes(user.id)
          ? { ...user, teams: [...new Set([...user.teams, ...teamIds])], updatedAt: new Date().toISOString() }
          : user
      );
      
      // Update teams with new members
      const updatedTeams = state.teams.map(team => {
        if (teamIds.includes(team.id)) {
          const newMembers = [...new Set([...team.members, ...userIds])];
          return { ...team, members: newMembers };
        }
        return team;
      });
      
      return {
        users: updatedUsers,
        teams: updatedTeams
      };
    });
  },
  
  // Search and filter
  searchUsers: (query) => {
    if (!query.trim()) return get().users;
    
    const searchTerm = query.toLowerCase();
    return get().users.filter(user => 
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.phone?.toLowerCase().includes(searchTerm)
    );
  },
  
  filterUsers: (filters) => {
    let filteredUsers = get().users;
    
    if (filters.role) {
      filteredUsers = filteredUsers.filter(user => user.role === filters.role);
    }
    
    if (filters.status) {
      filteredUsers = filteredUsers.filter(user => user.status === filters.status);
    }
    
    if (filters.team) {
      filteredUsers = filteredUsers.filter(user => user.teams.includes(filters.team));
    }
    
    if (filters.region) {
      filteredUsers = filteredUsers.filter(user => user.regions.includes(filters.region));
    }
    
    return filteredUsers;
  },

  // ========== API DATA LOADING METHODS ==========
  
  // Load users from API - NO FALLBACK
  loadUsers: async (filters = {}) => {
    try {
      set({ isLoading: true, error: null });
      
      const apiFilters = mapFiltersToApi(filters);
      const response = await teamManagementApi.getUsers(apiFilters);
      
      // Handle both paginated and non-paginated responses
      let users;
      if (response.data && Array.isArray(response.data)) {
        users = response.data.map(mapUserFromApi);
      } else if (Array.isArray(response)) {
        users = response.map(mapUserFromApi);
      } else {
        users = [];
      }
      
      set({ 
        users, 
        isLoading: false 
      });
      
      return users;
    } catch (error) {
      console.error('Error loading users:', error);
      set({ 
        error: error.message || 'Failed to load users',
        isLoading: false 
      });
      throw error;
    }
  },

  // Load teams from API - NO FALLBACK
  loadTeams: async (filters = {}) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await teamManagementApi.getTeams(filters);
      
      // Handle both paginated and non-paginated responses
      let teams;
      if (response.data && Array.isArray(response.data)) {
        teams = response.data.map(mapTeamFromApi);
      } else if (Array.isArray(response)) {
        teams = response.map(mapTeamFromApi);
      } else {
        teams = [];
      }
      
      set({ 
        teams, 
        isLoading: false 
      });
      
      return teams;
    } catch (error) {
      console.error('Error loading teams:', error);
      set({ 
        error: error.message || 'Failed to load teams',
        isLoading: false 
      });
      throw error;
    }
  },

  // Load invitations from API - NO FALLBACK
  loadInvitations: async (filters = {}) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await teamManagementApi.getInvitations(filters);
      
      // Handle both paginated and non-paginated responses
      let invitations;
      if (response.data && Array.isArray(response.data)) {
        invitations = response.data.map(mapInvitationFromApi);
      } else if (Array.isArray(response)) {
        invitations = response.map(mapInvitationFromApi);
      } else {
        invitations = [];
      }
      
      set({ 
        invitations, 
        isLoading: false 
      });
      
      return invitations;
    } catch (error) {
      console.error('Error loading invitations:', error);
      set({ 
        error: error.message || 'Failed to load invitations',
        isLoading: false 
      });
      throw error;
    }
  },

  // Load all data - API ONLY
  loadAllData: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Load all data in parallel
      const [usersResult, teamsResult, invitationsResult] = await Promise.allSettled([
        get().loadUsers(),
        get().loadTeams(),
        get().loadInvitations()
      ]);
      
      set({ isLoading: false });
      
      return {
        users: usersResult.status === 'fulfilled' ? usersResult.value : [],
        teams: teamsResult.status === 'fulfilled' ? teamsResult.value : [],
        invitations: invitationsResult.status === 'fulfilled' ? invitationsResult.value : []
      };
    } catch (error) {
      console.error('Error loading all data:', error);
      set({ 
        error: error.message || 'Failed to load data',
        isLoading: false 
      });
      throw error;
    }
  },

  // Bulk operations - API ONLY
  bulkUpdateUsers: async (userIds, updates) => {
    try {
      set({ isLoading: true, error: null });
      
      const bulkData = {
        userIds: userIds.map(id => parseInt(id)),
        updates: mapUserToApi(updates)
      };
      
      await teamManagementApi.bulkUpdateUsers(bulkData);
      
      // Update local state
      set((state) => ({
        users: state.users.map(user => 
          userIds.includes(user.id)
            ? { ...user, ...updates, updatedAt: new Date().toISOString() }
            : user
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error bulk updating users:', error);
      set({ 
        error: error.message || 'Failed to bulk update users',
        isLoading: false 
      });
      throw error;
    }
  },

  // Initialize store with API data - FORCE API LOAD
  initialize: async () => {
    try {
      console.log('Team Management Store: Initializing with API data (API-only mode)...');
      await get().loadAllData();
      console.log('Team Management Store: Successfully initialized with API data');
    } catch (error) {
      console.error('Team Management Store: Failed to initialize with API data:', error);
      // Keep empty arrays - no fallback to mock data
      set({ 
        users: [],
        teams: [],
        invitations: [],
        error: 'Failed to load data from API. Please try again.',
        isLoading: false
      });
    }
  },

  // Clear error state
  clearError: () => set({ error: null }),

  // Reset loading state
  resetLoading: () => set({ isLoading: false })
}));

export default useTeamManagementStore;