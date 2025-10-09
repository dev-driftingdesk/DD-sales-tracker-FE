/**
 * Enhanced Team Management API Service
 * Handles enhanced team management operations with role-based access control,
 * tenant isolation, and multi-team membership capabilities
 */

import { createApiService } from '../api/index.js';

// Enhanced API service endpoints
const enhancedUserApiService = createApiService('api/v2/enhanced-users');
const enhancedTeamApiService = createApiService('api/v2/enhanced-teams');
const enhancedInvitationApiService = createApiService('api/v2/invitations');

/**
 * Role-based access control validation
 */
const validateRoleBasedAccess = (operation, userRole) => {
  const adminOnlyOperations = [
    'inviteUser', 'assignManager', 'createTeam', 'assignTeamLeader', 
    'resendInvitation', 'bulkOperations'
  ];
  
  const managerOperations = [
    'addTeamMember', 'sendInvitation', 'getTeamUsers'
  ];

  if (adminOnlyOperations.includes(operation) && userRole !== 'Admin') {
    throw new Error(`Access denied: ${operation} requires Admin role`);
  }
  
  if (managerOperations.includes(operation) && !['Admin', 'Manager'].includes(userRole)) {
    throw new Error(`Access denied: ${operation} requires Manager or Admin role`);
  }
  
  return true;
};

/**
 * Get current user role from token
 */
const getCurrentUserRole = () => {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  if (!token) return 'SalesRep';
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || 'SalesRep';
  } catch (error) {
    console.warn('Could not determine user role from token');
    return 'SalesRep';
  }
};

/**
 * Enhanced Team Management API
 */
export const enhancedTeamManagementApi = {
  // ========== ENHANCED USER MANAGEMENT ==========
  
  /**
   * Admin only - invite users with role hierarchy
   */
  inviteUser: async (userData) => {
    validateRoleBasedAccess('inviteUser', getCurrentUserRole());
    
    const invitationData = {
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username,
      phoneNumber: userData.phoneNumber,
      role: userData.role,
      managerId: userData.managerId ? parseInt(userData.managerId) : null,
      teams: userData.teams || [],
      invitationMessage: userData.invitationMessage || `Welcome to our team!`
    };

    console.log('🌐 Enhanced API - Inviting user:', invitationData);
    
    try {
      const response = await enhancedUserApiService.post('/invite', invitationData);
      console.log('✅ Enhanced API - User invitation created:', response);
      return response;
    } catch (error) {
      console.error('❌ Enhanced API - User invitation failed:', error);
      throw error;
    }
  },

  /**
   * Public - activate user account with invitation token
   */
  activateUser: async (activationData) => {
    const requestData = {
      invitationToken: activationData.invitationToken,
      firstName: activationData.firstName,
      lastName: activationData.lastName,
      username: activationData.username,
      password: activationData.password,
      phoneNumber: activationData.phoneNumber
    };

    console.log('🌐 Enhanced API - Activating user account');
    
    try {
      const response = await enhancedUserApiService.post('/activate', requestData);
      console.log('✅ Enhanced API - User activated:', response);
      return response;
    } catch (error) {
      console.error('❌ Enhanced API - User activation failed:', error);
      throw error;
    }
  },

  /**
   * Tenant filtered - get users with advanced filtering
   */
  getUsers: async (filters = {}) => {
    const cleanParams = {};
    
    // Enhanced filtering parameters
    if (filters.page && filters.page > 0) cleanParams.page = filters.page;
    if (filters.pageSize && filters.pageSize > 0) cleanParams.pageSize = filters.pageSize;
    if (filters.search && filters.search.trim()) cleanParams.search = filters.search.trim();
    if (filters.role && filters.role !== 'all') cleanParams.role = filters.role;
    if (filters.status && filters.status !== 'all') cleanParams.isActive = filters.status === 'active';
    if (filters.teamId && filters.teamId !== 'all') cleanParams.teamId = filters.teamId;
    if (filters.managerId) cleanParams.managerId = filters.managerId;
    if (filters.isActive !== undefined) cleanParams.isActive = filters.isActive;
    
    // Set default pagination
    if (!cleanParams.page) cleanParams.page = 1;
    if (!cleanParams.pageSize) cleanParams.pageSize = 50;
    
    const params = new URLSearchParams(cleanParams);
    console.log('Enhanced Users API Request:', `api/v2/enhanced-users?${params}`);
    
    try {
      const response = await enhancedUserApiService.get(`?${params}`);
      console.log('✅ Enhanced Users API Success:', {
        dataCount: response.data?.length || response.length || 'unknown',
        hasData: !!response.data || !!response.length
      });
      return response;
    } catch (error) {
      console.error('❌ Enhanced Users API Error:', error);
      throw error;
    }
  },

  /**
   * Admin only - assign manager to user
   */
  assignManager: async (userId, managerId) => {
    validateRoleBasedAccess('assignManager', getCurrentUserRole());
    
    console.log('🌐 Enhanced API - Assigning manager:', { userId, managerId });
    
    try {
      const response = await enhancedUserApiService.put(`/${userId}/manager`, { managerId });
      console.log('✅ Enhanced API - Manager assigned:', response);
      return response;
    } catch (error) {
      console.error('❌ Enhanced API - Manager assignment failed:', error);
      throw error;
    }
  },

  // ========== ENHANCED TEAM MANAGEMENT ==========

  /**
   * Role-based - create team with leader assignment
   */
  createTeam: async (teamData) => {
    validateRoleBasedAccess('createTeam', getCurrentUserRole());
    
    const requestData = {
      name: teamData.name,
      description: teamData.description,
      teamLeaderId: teamData.teamLeaderId ? parseInt(teamData.teamLeaderId) : null,
      isActive: teamData.isActive !== undefined ? teamData.isActive : true
    };

    console.log('🌐 Enhanced API - Creating team:', requestData);
    
    try {
      const response = await enhancedTeamApiService.post('', requestData);
      console.log('✅ Enhanced API - Team created:', response);
      return response;
    } catch (error) {
      console.error('❌ Enhanced API - Team creation failed:', error);
      throw error;
    }
  },

  /**
   * Get teams with enhanced filtering
   */
  getTeams: async (filters = {}) => {
    const cleanParams = {};
    
    if (filters.page && filters.page > 0) cleanParams.page = filters.page;
    if (filters.pageSize && filters.pageSize > 0) cleanParams.pageSize = filters.pageSize;
    if (filters.search && filters.search.trim()) cleanParams.search = filters.search.trim();
    if (filters.includeMembers !== undefined) cleanParams.includeMembers = filters.includeMembers;
    if (filters.isActive !== undefined) cleanParams.isActive = filters.isActive;
    
    if (!cleanParams.page) cleanParams.page = 1;
    if (!cleanParams.pageSize) cleanParams.pageSize = 50;
    
    const params = new URLSearchParams(cleanParams);
    console.log('Enhanced Teams API Request:', `api/v2/enhanced-teams?${params}`);
    
    try {
      const response = await enhancedTeamApiService.get(`?${params}`);
      console.log('✅ Enhanced Teams API Success:', {
        dataCount: response.data?.length || response.length || 'unknown'
      });
      return response;
    } catch (error) {
      console.error('❌ Enhanced Teams API Error:', error);
      throw error;
    }
  },

  /**
   * Admin only - assign team leader
   */
  assignTeamLeader: async (teamId, leaderId) => {
    validateRoleBasedAccess('assignTeamLeader', getCurrentUserRole());
    
    console.log('🌐 Enhanced API - Assigning team leader:', { teamId, leaderId });
    
    try {
      const response = await enhancedTeamApiService.post(`/${teamId}/assign-leader`, { 
        teamLeaderId: leaderId 
      });
      console.log('✅ Enhanced API - Team leader assigned:', response);
      return response;
    } catch (error) {
      console.error('❌ Enhanced API - Team leader assignment failed:', error);
      throw error;
    }
  },

  /**
   * Team management - add member with role
   */
  addTeamMember: async (teamId, memberData) => {
    validateRoleBasedAccess('addTeamMember', getCurrentUserRole());
    
    const requestData = {
      userId: parseInt(memberData.userId),
      role: memberData.role || 'SalesRep',
      joinedAt: new Date().toISOString()
    };

    console.log('🌐 Enhanced API - Adding team member:', { teamId, memberData: requestData });
    
    try {
      const response = await enhancedTeamApiService.post(`/${teamId}/members`, requestData);
      console.log('✅ Enhanced API - Team member added:', response);
      return response;
    } catch (error) {
      console.error('❌ Enhanced API - Team member addition failed:', error);
      throw error;
    }
  },

  /**
   * Team access - get team users
   */
  getTeamUsers: async (teamId) => {
    validateRoleBasedAccess('getTeamUsers', getCurrentUserRole());
    
    console.log('🌐 Enhanced API - Getting team users:', teamId);
    
    try {
      const response = await enhancedTeamApiService.get(`/${teamId}/users`);
      console.log('✅ Enhanced API - Team users retrieved:', response);
      return response;
    } catch (error) {
      console.error('❌ Enhanced API - Team users retrieval failed:', error);
      throw error;
    }
  },

  // ========== ENHANCED INVITATION SYSTEM ==========

  /**
   * Role-based - send team invitation
   */
  sendInvitation: async (invitationData) => {
    validateRoleBasedAccess('sendInvitation', getCurrentUserRole());
    
    const requestData = {
      email: invitationData.email,
      teamId: invitationData.teamId ? parseInt(invitationData.teamId) : null,
      role: invitationData.role,
      invitationMessage: invitationData.invitationMessage || 'You have been invited to join our team!'
    };

    console.log('🌐 Enhanced API - Sending invitation:', requestData);
    
    try {
      const response = await enhancedInvitationApiService.post('/send', requestData);
      console.log('✅ Enhanced API - Invitation sent:', response);
      return response;
    } catch (error) {
      console.error('❌ Enhanced API - Invitation sending failed:', error);
      throw error;
    }
  },

  /**
   * Public - accept invitation
   */
  acceptInvitation: async (invitationId, userData) => {
    const requestData = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username,
      password: userData.password,
      phoneNumber: userData.phoneNumber
    };

    console.log('🌐 Enhanced API - Accepting invitation:', invitationId);
    
    try {
      const response = await enhancedInvitationApiService.post(`/${invitationId}/accept`, requestData);
      console.log('✅ Enhanced API - Invitation accepted:', response);
      return response;
    } catch (error) {
      console.error('❌ Enhanced API - Invitation acceptance failed:', error);
      throw error;
    }
  },

  /**
   * Public - decline invitation
   */
  declineInvitation: async (invitationId, reason) => {
    const requestData = { reason: reason || 'No reason provided' };

    console.log('🌐 Enhanced API - Declining invitation:', invitationId);
    
    try {
      const response = await enhancedInvitationApiService.post(`/${invitationId}/decline`, requestData);
      console.log('✅ Enhanced API - Invitation declined:', response);
      return response;
    } catch (error) {
      console.error('❌ Enhanced API - Invitation decline failed:', error);
      throw error;
    }
  },

  /**
   * Admin/Manager - resend invitation
   */
  resendInvitation: async (invitationId, message) => {
    validateRoleBasedAccess('resendInvitation', getCurrentUserRole());
    
    const requestData = { 
      invitationMessage: message || 'Reminder: You have been invited to join our team!' 
    };

    console.log('🌐 Enhanced API - Resending invitation:', invitationId);
    
    try {
      const response = await enhancedInvitationApiService.post(`/${invitationId}/resend`, requestData);
      console.log('✅ Enhanced API - Invitation resent:', response);
      return response;
    } catch (error) {
      console.error('❌ Enhanced API - Invitation resend failed:', error);
      throw error;
    }
  },

  /**
   * Get invitations with enhanced filtering
   */
  getInvitations: async (filters = {}) => {
    const cleanParams = {};
    
    if (filters.page && filters.page > 0) cleanParams.page = filters.page;
    if (filters.pageSize && filters.pageSize > 0) cleanParams.pageSize = filters.pageSize;
    if (filters.status && filters.status !== 'all') cleanParams.status = filters.status;
    if (filters.invitedBy && filters.invitedBy !== 'all') cleanParams.invitedBy = filters.invitedBy;
    
    if (!cleanParams.page) cleanParams.page = 1;
    if (!cleanParams.pageSize) cleanParams.pageSize = 50;
    
    const params = new URLSearchParams(cleanParams);
    console.log('Enhanced Invitations API Request:', `api/v2/invitations?${params}`);
    
    try {
      const response = await enhancedInvitationApiService.get(`?${params}`);
      console.log('✅ Enhanced Invitations API Success:', {
        dataCount: response.data?.length || response.length || 'unknown'
      });
      return response;
    } catch (error) {
      console.error('❌ Enhanced Invitations API Error:', error);
      throw error;
    }
  }
};

export default enhancedTeamManagementApi;