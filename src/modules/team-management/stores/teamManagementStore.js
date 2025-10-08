/**
 * Team Management Store - COMPLETELY REBUILT
 * Simplified store with proper API integration and error handling
 */

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
  mapInvitationToApi
} from '../../../services/api/teamManagementMapper.js';

const useTeamManagementStore = create((set, get) => ({
  // ===== STATE =====
  users: [],
  teams: [],
  invitations: [],
  
  selectedUser: null,
  selectedTeam: null,
  isLoading: false,
  error: null,
  isInitialized: false,
  
  // ===== CORE ACTIONS =====
  
  /**
   * Load all data from API
   */
  loadAllData: async () => {
    try {
      set({ isLoading: true, error: null });
      
      console.log('📊 [Store] Loading all data...');
      
      // Load data in parallel
      const [usersData, teamsData, invitationsData] = await Promise.allSettled([
        teamManagementApi.getUsers(),
        teamManagementApi.getTeams(),
        teamManagementApi.getInvitations()
      ]);
      
      // Process results
      const users = usersData.status === 'fulfilled' 
        ? (Array.isArray(usersData.value) ? usersData.value.map(mapUserFromApi) : [])
        : [];
      
      const teams = teamsData.status === 'fulfilled' 
        ? (Array.isArray(teamsData.value) ? teamsData.value.map(mapTeamFromApi) : [])
        : [];
      
      const invitations = invitationsData.status === 'fulfilled' 
        ? (Array.isArray(invitationsData.value) ? invitationsData.value.map(mapInvitationFromApi) : [])
        : [];
      
      console.log('📊 [Store] Data loaded:', {
        users: users.length,
        teams: teams.length,
        invitations: invitations.length
      });
      
      set({ 
        users, 
        teams, 
        invitations, 
        isLoading: false,
        error: null
      });
      
      // Log any errors
      if (usersData.status === 'rejected') {
        console.warn('⚠️ Users loading failed:', usersData.reason?.message);
      }
      if (teamsData.status === 'rejected') {
        console.warn('⚠️ Teams loading failed:', teamsData.reason?.message);
      }
      if (invitationsData.status === 'rejected') {
        console.warn('⚠️ Invitations loading failed:', invitationsData.reason?.message);
      }
      
      return { users, teams, invitations };
    } catch (error) {
      console.error('❌ [Store] Load all data failed:', error);
      set({ 
        error: error.message || 'Failed to load data',
        isLoading: false 
      });
      throw error;
    }
  },

  /**
   * Initialize store
   */
  initialize: async () => {
    if (get().isInitialized) {
      console.log('📊 [Store] Already initialized, skipping...');
      return;
    }
    
    try {
      console.log('📊 [Store] Initializing...');
      set({ isInitialized: true });
      await get().loadAllData();
      console.log('✅ [Store] Initialized successfully');
    } catch (error) {
      console.error('❌ [Store] Initialization failed:', error);
      
      // Check if it's a network/API connection error
      const isConnectionError = error.message?.includes('fetch') || 
                                error.message?.includes('Network') ||
                                error.code === 'ECONNREFUSED' ||
                                error.response?.status === undefined;
      
      const errorMessage = isConnectionError 
        ? 'Backend API is not available. Please ensure the backend server is running on localhost:5555 and try again.'
        : `Failed to load data: ${error.message}`;
      
      set({ 
        error: errorMessage,
        isLoading: false,
        isInitialized: false
      });
    }
  },

  // ===== USER MANAGEMENT =====
  
  /**
   * Create user via invitation
   */
  createUser: async (userData) => {
    try {
      set({ isLoading: true, error: null });
      
      console.log('👤 [Store] Creating user invitation:', userData);
      
      // Check if we have teams for invitation
      const { teams } = get();
      if (!teams || teams.length === 0) {
        throw new Error('No teams available. Please create a team first before inviting users.');
      }
      
      // Prepare invitation data
      const invitationData = {
        email: userData.email,
        role: userData.role || 'SalesRep',
        teamId: userData.teamId || teams[0].id, // Use first available team as default
        message: userData.message || 'Welcome to our team!'
      };
      
      // Map to API format
      const apiInvitationData = mapInvitationToApi(invitationData);
      
      console.log('📨 [Store] Sending invitation:', apiInvitationData);
      
      // Create invitation via API
      const createdInvitation = await teamManagementApi.createInvitation(apiInvitationData);
      
      // Map response and add to store
      const mappedInvitation = mapInvitationFromApi(createdInvitation);
      
      set((state) => ({
        invitations: [...state.invitations, mappedInvitation],
        isLoading: false
      }));
      
      console.log('✅ [Store] User invitation sent successfully');
      
      return {
        type: 'invitation_sent',
        invitation: mappedInvitation,
        message: `Invitation sent to ${userData.email}`
      };
    } catch (error) {
      console.error('❌ [Store] Create user failed:', error);
      set({ 
        error: error.message || 'Failed to send invitation',
        isLoading: false 
      });
      throw error;
    }
  },

  /**
   * Update user
   */
  updateUser: async (userId, updates) => {
    try {
      set({ isLoading: true, error: null });
      
      console.log('👤 [Store] Updating user:', { userId, updates });
      
      // Map to API format
      const apiUserData = mapUserToApi(updates);
      
      // Update via API
      const updatedUser = await teamManagementApi.updateUser(userId, apiUserData);
      
      // Map response
      const mappedUser = mapUserFromApi(updatedUser);
      
      // Update store
      set((state) => ({
        users: state.users.map(user => 
          user.id === userId ? mappedUser : user
        ),
        isLoading: false
      }));
      
      console.log('✅ [Store] User updated successfully');
      return mappedUser;
    } catch (error) {
      console.error('❌ [Store] Update user failed:', error);
      set({ 
        error: error.message || 'Failed to update user',
        isLoading: false 
      });
      throw error;
    }
  },

  /**
   * Delete user
   */
  deleteUser: async (userId) => {
    try {
      set({ isLoading: true, error: null });
      
      console.log('👤 [Store] Deleting user:', userId);
      
      // Delete via API
      await teamManagementApi.deleteUser(userId);
      
      // Update store
      set((state) => ({
        users: state.users.filter(user => user.id !== userId),
        teams: state.teams.map(team => ({
          ...team,
          members: team.members.filter(id => id !== userId)
        })),
        isLoading: false
      }));
      
      console.log('✅ [Store] User deleted successfully');
    } catch (error) {
      console.error('❌ [Store] Delete user failed:', error);
      set({ 
        error: error.message || 'Failed to delete user',
        isLoading: false 
      });
      throw error;
    }
  },

  // ===== TEAM MANAGEMENT =====
  
  /**
   * Create team
   */
  createTeam: async (teamData) => {
    try {
      set({ isLoading: true, error: null });
      
      console.log('🏢 [Store] Creating team:', teamData);
      
      // Map to API format
      const apiTeamData = mapTeamToApi(teamData);
      
      // Create via API
      const createdTeam = await teamManagementApi.createTeam(apiTeamData);
      
      // Map response
      const mappedTeam = mapTeamFromApi(createdTeam);
      
      // Update store
      set((state) => ({
        teams: [...state.teams, mappedTeam],
        isLoading: false
      }));
      
      console.log('✅ [Store] Team created successfully');
      return mappedTeam;
    } catch (error) {
      console.error('❌ [Store] Create team failed:', error);
      set({ 
        error: error.message || 'Failed to create team',
        isLoading: false 
      });
      throw error;
    }
  },

  /**
   * Update team
   */
  updateTeam: async (teamId, updates) => {
    try {
      set({ isLoading: true, error: null });
      
      console.log('🏢 [Store] Updating team:', { teamId, updates });
      
      // Map to API format
      const apiTeamData = mapTeamToApi(updates);
      
      // Update via API
      const updatedTeam = await teamManagementApi.updateTeam(teamId, apiTeamData);
      
      // Map response
      const mappedTeam = mapTeamFromApi(updatedTeam);
      
      // Update store
      set((state) => ({
        teams: state.teams.map(team => 
          team.id === teamId ? mappedTeam : team
        ),
        isLoading: false
      }));
      
      console.log('✅ [Store] Team updated successfully');
      return mappedTeam;
    } catch (error) {
      console.error('❌ [Store] Update team failed:', error);
      set({ 
        error: error.message || 'Failed to update team',
        isLoading: false 
      });
      throw error;
    }
  },

  /**
   * Delete team
   */
  deleteTeam: async (teamId) => {
    try {
      set({ isLoading: true, error: null });
      
      console.log('🏢 [Store] Deleting team:', teamId);
      
      // Delete via API
      await teamManagementApi.deleteTeam(teamId);
      
      // Update store
      set((state) => ({
        teams: state.teams.filter(team => team.id !== teamId),
        users: state.users.map(user => ({
          ...user,
          teams: user.teams.filter(id => id !== teamId)
        })),
        isLoading: false
      }));
      
      console.log('✅ [Store] Team deleted successfully');
    } catch (error) {
      console.error('❌ [Store] Delete team failed:', error);
      set({ 
        error: error.message || 'Failed to delete team',
        isLoading: false 
      });
      throw error;
    }
  },

  // ===== INVITATION MANAGEMENT =====
  
  /**
   * Cancel invitation
   */
  cancelInvitation: async (invitationId) => {
    try {
      set({ isLoading: true, error: null });
      
      console.log('📨 [Store] Cancelling invitation:', invitationId);
      
      // Cancel via API
      await teamManagementApi.cancelInvitation(invitationId);
      
      // Update store
      set((state) => ({
        invitations: state.invitations.filter(inv => inv.id !== invitationId),
        isLoading: false
      }));
      
      console.log('✅ [Store] Invitation cancelled successfully');
    } catch (error) {
      console.error('❌ [Store] Cancel invitation failed:', error);
      set({ 
        error: error.message || 'Failed to cancel invitation',
        isLoading: false 
      });
      throw error;
    }
  },

  // ===== UTILITY METHODS =====
  
  /**
   * Get users by team
   */
  getUsersByTeam: (teamId) => {
    const team = get().teams.find(t => t.id === teamId);
    if (!team) return [];
    return get().users.filter(user => team.members.includes(user.id));
  },

  /**
   * Get users by role
   */
  getUsersByRole: (role) => {
    return get().users.filter(user => user.role === role);
  },

  /**
   * Get active users
   */
  getActiveUsers: () => {
    return get().users.filter(user => user.status === USER_STATUS.ACTIVE);
  },

  /**
   * Search users
   */
  searchUsers: (query) => {
    if (!query.trim()) return get().users;
    
    const searchTerm = query.toLowerCase();
    return get().users.filter(user => 
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.phone?.toLowerCase().includes(searchTerm)
    );
  },

  // ===== UI STATE MANAGEMENT =====
  
  setSelectedUser: (user) => set({ selectedUser: user }),
  setSelectedTeam: (team) => set({ selectedTeam: team }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  resetLoading: () => set({ isLoading: false }),

  // ===== MANUAL HELPERS =====
  
  /**
   * Create default team manually (for testing)
   */
  createDefaultTeam: async () => {
    try {
      console.log('🏢 [Store] Creating default team...');
      
      const defaultTeamData = {
        name: 'General Team',
        description: 'Default team for user invitations',
        managerId: null,
        isActive: true
      };
      
      const newTeam = await get().createTeam(defaultTeamData);
      console.log('✅ [Store] Default team created:', newTeam);
      return newTeam;
    } catch (error) {
      console.error('❌ [Store] Create default team failed:', error);
      throw error;
    }
  }
}));

export default useTeamManagementStore;