/**
 * Team Management API Service - REBUILT
 * Handles all team management-related API operations with proper response handling
 */

import { createApiService } from '../api/index.js';

const teamApiService = createApiService('api/v2/teams');
const userApiService = createApiService('api/v2/users');
const invitationApiService = createApiService('api/v2/invitations');
const searchApiService = createApiService('api/v2/search');

/**
 * Extract data from API response following common response format
 * Expected format: { success: true, data: [...], message: "...", errors: [] }
 */
const extractResponseData = (response, operation = 'unknown') => {
  console.log(`🔍 [${operation}] Raw API Response Analysis:`, {
    responseType: typeof response,
    isArray: Array.isArray(response),
    responseKeys: response ? Object.keys(response) : 'null response',
    hasSuccess: 'success' in (response || {}),
    hasData: 'data' in (response || {}),
    hasMessage: 'message' in (response || {}),
    dataType: response?.data ? typeof response.data : 'no data property',
    dataIsArray: Array.isArray(response?.data),
    dataLength: Array.isArray(response?.data) ? response.data.length : 'not array',
    fullResponse: response
  });

  // Handle null/undefined response
  if (!response) {
    console.warn(`⚠️ [${operation}] Received null/undefined response`);
    return [];
  }

  // If response is direct array (legacy format)
  if (Array.isArray(response)) {
    console.log(`✅ [${operation}] Response is direct array with ${response.length} items`);
    return response;
  }

  // Standard API response format: { success, data, message, errors }
  if (response && typeof response === 'object') {
    // Check for data property (most common)
    if (Array.isArray(response.data)) {
      console.log(`✅ [${operation}] Found data array with ${response.data.length} items`);
      return response.data;
    }
    
    // Check for direct array properties (fallback)
    const arrayProps = ['items', 'results', 'users', 'teams', 'invitations'];
    for (const prop of arrayProps) {
      if (Array.isArray(response[prop])) {
        console.log(`✅ [${operation}] Found ${prop} array with ${response[prop].length} items`);
        return response[prop];
      }
    }
    
    // If response has success=false, handle error
    if (response.success === false) {
      const errorMsg = response.message || 'API operation failed';
      console.error(`❌ [${operation}] API returned error:`, {
        message: errorMsg,
        errors: response.errors,
        fullResponse: response
      });
      throw new Error(errorMsg);
    }
    
    // Single item response (for create/update operations)
    if (response.success === true && response.data && !Array.isArray(response.data)) {
      console.log(`✅ [${operation}] Single item response`);
      return response.data;
    }
  }

  // Fallback: return empty array for list operations, null for single items
  console.warn(`⚠️ [${operation}] No valid data found in response, returning empty array`);
  return [];
};

export const teamManagementApi = {
  // ========== TEAM OPERATIONS ==========
  
  // Core Team Operations
  getTeams: async (filters = {}) => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      // Add pagination (with defaults)
      params.append('page', (filters.page || 1).toString());
      params.append('pageSize', (filters.pageSize || 50).toString());
      
      // Add optional filters
      if (filters.search?.trim()) params.append('search', filters.search.trim());
      if (filters.includeMembers !== undefined) params.append('includeMembers', filters.includeMembers.toString());
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
      
      console.log('🌐 [Teams API] Request:', {
        url: `api/v2/teams?${params}`,
        filters: filters
      });
      
      const response = await teamApiService.get(`?${params}`);
      const data = extractResponseData(response, 'getTeams');
      
      console.log('✅ [Teams API] Success:', {
        dataCount: Array.isArray(data) ? data.length : 'single item',
        data: data
      });
      
      return data;
    } catch (error) {
      console.error('❌ [Teams API] Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  getTeam: async (id) => {
    try {
      console.log(`🌐 [Get Team] Request:`, { id: id, url: `api/v2/teams/${id}` });
      const response = await teamApiService.get(`/${id}`);
      const data = extractResponseData(response, 'getTeam');
      console.log(`✅ [Get Team] Success:`, { data: data });
      return data;
    } catch (error) {
      console.error(`❌ [Get Team] Error:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        teamId: id
      });
      throw error;
    }
  },
  
  createTeam: async (teamData) => {
    try {
      console.log('🌐 [Create Team] Request:', {
        data: teamData,
        url: 'api/v2/teams'
      });
      
      const response = await teamApiService.post('', teamData);
      const data = extractResponseData(response, 'createTeam');
      
      console.log('✅ [Create Team] Success:', {
        data: data
      });
      
      return data;
    } catch (error) {
      console.error('❌ [Create Team] Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        requestData: teamData
      });
      throw error;
    }
  },
  
  updateTeam: async (id, teamData) => {
    try {
      console.log('🌐 [Update Team] Request:', {
        id: id,
        data: teamData,
        url: `api/v2/teams/${id}`
      });
      
      const response = await teamApiService.put(`/${id}`, teamData);
      const data = extractResponseData(response, 'updateTeam');
      
      console.log('✅ [Update Team] Success:', {
        data: data
      });
      
      return data;
    } catch (error) {
      console.error('❌ [Update Team] Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        teamId: id,
        requestData: teamData
      });
      throw error;
    }
  },
  
  deleteTeam: (id) => teamApiService.delete(`/${id}`),

  // Team Member Operations
  getTeamMembers: (teamId) => teamApiService.get(`/${teamId}/members`),
  
  addTeamMember: (teamId, userId) => 
    teamApiService.post(`/${teamId}/members`, { userId }),
    
  removeTeamMember: (teamId, userId) => 
    teamApiService.delete(`/${teamId}/members/${userId}`),

  // ========== USER OPERATIONS ==========
  
  // Core User Operations
  getUsers: async (filters = {}) => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      // Add pagination (with defaults)
      params.append('page', (filters.page || 1).toString());
      params.append('pageSize', (filters.pageSize || 50).toString());
      
      // Add optional filters
      if (filters.search?.trim()) params.append('search', filters.search.trim());
      if (filters.role && filters.role !== 'all') params.append('role', filters.role);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.teamId && filters.teamId !== 'all') params.append('teamId', filters.teamId);
      if (filters.region && filters.region !== 'all') params.append('region', filters.region);
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
      
      console.log('🌐 [Users API] Request:', {
        url: `api/v2/users?${params}`,
        filters: filters
      });
      
      const response = await userApiService.get(`?${params}`);
      const data = extractResponseData(response, 'getUsers');
      
      console.log('✅ [Users API] Success:', {
        dataCount: Array.isArray(data) ? data.length : 'single item',
        data: data
      });
      
      return data;
    } catch (error) {
      console.error('❌ [Users API] Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  getUser: async (id) => {
    try {
      console.log(`🌐 [Get User] Request:`, { id: id, url: `api/v2/users/${id}` });
      const response = await userApiService.get(`/${id}`);
      const data = extractResponseData(response, 'getUser');
      console.log(`✅ [Get User] Success:`, { data: data });
      return data;
    } catch (error) {
      console.error(`❌ [Get User] Error:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        userId: id
      });
      throw error;
    }
  },
  
  createUser: async (userData) => {
    try {
      console.log('🌐 [Create User] Request:', {
        data: userData,
        url: 'api/v2/users'
      });
      
      const response = await userApiService.post('', userData);
      const data = extractResponseData(response, 'createUser');
      
      console.log('✅ [Create User] Success:', {
        data: data
      });
      
      return data;
    } catch (error) {
      console.error('❌ [Create User] Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        requestData: userData
      });
      throw error;
    }
  },
  
  updateUser: async (id, userData) => {
    try {
      console.log('🌐 [Update User] Request:', {
        id: id,
        data: userData,
        url: `api/v2/users/${id}`
      });
      
      const response = await userApiService.put(`/${id}`, userData);
      const data = extractResponseData(response, 'updateUser');
      
      console.log('✅ [Update User] Success:', {
        data: data
      });
      
      return data;
    } catch (error) {
      console.error('❌ [Update User] Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        userId: id,
        requestData: userData
      });
      throw error;
    }
  },
  
  deleteUser: (id) => userApiService.delete(`/${id}`),

  // User Status Operations
  activateUser: (userId) => 
    userApiService.put(`/${userId}/activate`),
    
  deactivateUser: (userId) => 
    userApiService.put(`/${userId}/deactivate`),

  // Advanced User Operations
  updateUserRole: (userId, roleData) => 
    userApiService.put(`/${userId}/role`, roleData),
    
  assignUserToTeam: (userId, teamData) => 
    userApiService.put(`/${userId}/team`, teamData),
    
  addUserPermission: (userId, permissionData) => 
    userApiService.post(`/${userId}/permissions`, permissionData),
    
  removeUserPermission: (userId, permissionId) => 
    userApiService.delete(`/${userId}/permissions/${permissionId}`),
    
  assignUserToRegion: (userId, regionData) => 
    userApiService.put(`/${userId}/region`, regionData),
    
  removeUserFromRegion: (userId, regionId) => 
    userApiService.delete(`/${userId}/region/${regionId}`),
    
  assignUserToProduct: (userId, productData) => 
    userApiService.put(`/${userId}/product`, productData),
    
  removeUserFromProduct: (userId, productId) => 
    userApiService.delete(`/${userId}/product/${productId}`),
    
  getUserAssignments: (userId) => 
    userApiService.get(`/${userId}/assignments`),
    
  updateUserProfile: (userId, profileData) => 
    userApiService.put(`/${userId}/profile`, profileData),
    
  updateUserPreferences: (userId, preferencesData) => 
    userApiService.put(`/${userId}/preferences`, preferencesData),

  // Bulk User Operations
  bulkUpdateUsers: (bulkData) => 
    userApiService.post('/bulk-update', bulkData),
    
  bulkDeleteUsers: (userIds) => 
    userApiService.post('/bulk-delete', { userIds }),
    
  bulkActivateUsers: (userIds) => 
    userApiService.post('/bulk-activate', { userIds }),
    
  bulkDeactivateUsers: (userIds) => 
    userApiService.post('/bulk-deactivate', { userIds }),
    
  bulkAssignRole: (userIds, role) => 
    userApiService.post('/bulk-assign-role', { userIds, role }),
    
  bulkAssignTeams: (userIds, teamIds) => 
    userApiService.post('/bulk-assign-teams', { userIds, teamIds }),

  // ========== INVITATION OPERATIONS ==========
  
  // Core Invitation Operations
  getInvitations: async (filters = {}) => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      // Add pagination (with defaults)
      params.append('page', (filters.page || 1).toString());
      params.append('pageSize', (filters.pageSize || 50).toString());
      
      // Add optional filters
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.invitedBy && filters.invitedBy !== 'all') params.append('invitedBy', filters.invitedBy);
      
      console.log('🌐 [Invitations API] Request:', {
        url: `api/v2/invitations?${params}`,
        filters: filters
      });
      
      const response = await invitationApiService.get(`?${params}`);
      const data = extractResponseData(response, 'getInvitations');
      
      console.log('✅ [Invitations API] Success:', {
        dataCount: Array.isArray(data) ? data.length : 'single item',
        data: data
      });
      
      return data;
    } catch (error) {
      console.error('❌ [Invitations API] Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  getInvitation: (id) => invitationApiService.get(`/${id}`),
  
  createInvitation: async (invitationData) => {
    try {
      console.log('🌐 [Create Invitation] Request:', {
        data: invitationData,
        url: 'api/v2/invitations'
      });
      
      const response = await invitationApiService.post('', invitationData);
      const data = extractResponseData(response, 'createInvitation');
      
      console.log('✅ [Create Invitation] Success:', {
        data: data
      });
      
      return data;
    } catch (error) {
      console.error('❌ [Create Invitation] Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        requestData: invitationData
      });
      throw error;
    }
  },
  
  acceptInvitation: (id, acceptanceData) => 
    invitationApiService.put(`/${id}/accept`, acceptanceData),
    
  declineInvitation: (id) => 
    invitationApiService.put(`/${id}/decline`),
    
  cancelInvitation: (id) => 
    invitationApiService.delete(`/${id}`),
    
  getInvitationStatistics: () => 
    invitationApiService.get('/statistics'),

  // ========== SEARCH OPERATIONS ==========
  
  // Advanced Search Operations
  searchUsers: (searchCriteria) => 
    searchApiService.post('/users', searchCriteria),
    
  searchTeams: (searchCriteria) => 
    searchApiService.post('/teams', searchCriteria),

  // ========== ANALYTICS OPERATIONS ==========
  
  // Analytics and Reporting
  getUserAnalytics: (filters = {}) => 
    userApiService.get('/analytics', { params: filters }),
    
  getTeamAnalytics: (filters = {}) => 
    teamApiService.get('/analytics', { params: filters }),
    
  getDashboardMetrics: () => 
    userApiService.get('/dashboard/metrics'),
    
  getUserActivityReport: (userId, filters = {}) => 
    userApiService.get(`/${userId}/activity`, { params: filters }),
    
  getTeamPerformanceReport: (teamId, filters = {}) => 
    teamApiService.get(`/${teamId}/performance`, { params: filters }),

  // ========== PERMISSION OPERATIONS ==========
  
  // Permission Management
  getPermissions: () => 
    userApiService.get('/permissions'),
    
  getRoles: () => 
    userApiService.get('/roles'),
    
  checkUserPermission: (userId, permission) => 
    userApiService.get(`/${userId}/permissions/check/${permission}`),

  // ========== REGION & PRODUCT OPERATIONS ==========
  
  // Region Management
  getRegions: () => 
    userApiService.get('/regions'),
    
  createRegion: (regionData) => 
    userApiService.post('/regions', regionData),
    
  updateRegion: (regionId, regionData) => 
    userApiService.put(`/regions/${regionId}`, regionData),
    
  deleteRegion: (regionId) => 
    userApiService.delete(`/regions/${regionId}`),

  // Product Management
  getProducts: () => 
    userApiService.get('/products'),
    
  createProduct: (productData) => 
    userApiService.post('/products', productData),
    
  updateProduct: (productId, productData) => 
    userApiService.put(`/products/${productId}`, productData),
    
  deleteProduct: (productId) => 
    userApiService.delete(`/products/${productId}`)
};

export default teamManagementApi;