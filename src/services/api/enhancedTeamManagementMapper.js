/**
 * Enhanced Team Management Data Mapper
 * Handles frontend ↔ backend data format differences for enhanced team management operations
 * Supports multi-team membership, role hierarchy, and tenant isolation
 */

import { 
  USER_ROLES, 
  USER_STATUS, 
  DEFAULT_PERMISSIONS, 
  TEAM_TYPES,
  REGIONS,
  PRODUCT_CATEGORIES 
} from '../../modules/team-management/constants/index.js';

// ========== ENHANCED USER MAPPING ==========

/**
 * Maps enhanced backend user data to frontend format
 */
export const mapEnhancedUserFromApi = (apiUser) => {
  if (!apiUser) return null;

  return {
    id: apiUser.id?.toString() || apiUser.userId?.toString(),
    username: apiUser.username,
    firstName: apiUser.firstName,
    lastName: apiUser.lastName,
    name: `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim(),
    email: apiUser.email,
    phoneNumber: apiUser.phoneNumber,
    role: mapRoleFromApi(apiUser.role),
    status: mapStatusFromApi(apiUser.isActive),
    avatar: apiUser.avatar || apiUser.profileImage || null,
    adminId: apiUser.adminId, // Tenant isolation
    managerId: apiUser.managerId?.toString() || null,
    manager: apiUser.manager ? {
      id: apiUser.manager.id?.toString(),
      firstName: apiUser.manager.firstName,
      lastName: apiUser.manager.lastName,
      email: apiUser.manager.email
    } : null,
    isActive: apiUser.isActive !== undefined ? apiUser.isActive : true,
    
    // Multi-team membership with roles
    teams: Array.isArray(apiUser.teams) ? apiUser.teams.map(team => ({
      teamId: team.teamId?.toString() || team.id?.toString(),
      teamName: team.teamName || team.name,
      role: team.role || 'SalesRep',
      joinedAt: team.joinedAt
    })) : [],
    
    // Legacy fields for backward compatibility
    regions: mapRegionsFromApi(apiUser.regions) || [],
    products: mapProductsFromApi(apiUser.products) || [],
    permissions: mapPermissionsFromApi(apiUser.permissions) || DEFAULT_PERMISSIONS[mapRoleFromApi(apiUser.role)] || [],
    
    createdAt: apiUser.createdAt || apiUser.dateCreated,
    updatedAt: apiUser.updatedAt || apiUser.lastModified,
    lastLogin: apiUser.lastLogin || apiUser.lastLoginDate,
    commissionPercentage: apiUser.commissionRate || apiUser.commissionPercentage,
    preferences: apiUser.preferences || {},
    timezone: apiUser.timezone,
    emailNotifications: apiUser.emailNotifications
  };
};

/**
 * Maps frontend user data to enhanced backend format
 */
export const mapEnhancedUserToApi = (frontendUser) => {
  if (!frontendUser) return null;

  return {
    id: frontendUser.id ? parseInt(frontendUser.id) : undefined,
    username: frontendUser.username,
    firstName: frontendUser.firstName || frontendUser.name?.split(' ')[0] || '',
    lastName: frontendUser.lastName || frontendUser.name?.split(' ').slice(1).join(' ') || '',
    email: frontendUser.email,
    phoneNumber: frontendUser.phoneNumber,
    role: mapRoleToApi(frontendUser.role),
    isActive: frontendUser.status === USER_STATUS.ACTIVE,
    managerId: frontendUser.managerId ? parseInt(frontendUser.managerId) : null,
    commissionRate: frontendUser.commissionPercentage,
    
    // Multi-team assignments
    teams: Array.isArray(frontendUser.teams) ? frontendUser.teams.map(team => ({
      teamId: typeof team === 'object' ? parseInt(team.teamId) : parseInt(team),
      role: typeof team === 'object' ? team.role : 'SalesRep'
    })) : [],
    
    // Legacy fields
    regions: mapRegionsToApi(frontendUser.regions),
    products: mapProductsToApi(frontendUser.products),
    permissions: mapPermissionsToApi(frontendUser.permissions),
    preferences: frontendUser.preferences || {},
    timezone: frontendUser.timezone,
    emailNotifications: frontendUser.emailNotifications
  };
};

// ========== ENHANCED TEAM MAPPING ==========

/**
 * Maps enhanced backend team data to frontend format
 */
export const mapEnhancedTeamFromApi = (apiTeam) => {
  if (!apiTeam) return null;

  return {
    id: apiTeam.id?.toString() || apiTeam.teamId?.toString(),
    name: apiTeam.name || apiTeam.teamName,
    description: apiTeam.description,
    adminId: apiTeam.adminId, // Tenant isolation
    
    // Enhanced team leader information
    teamLeaderId: apiTeam.teamLeaderId?.toString() || null,
    teamLeader: apiTeam.teamLeader ? {
      id: apiTeam.teamLeader.id?.toString(),
      firstName: apiTeam.teamLeader.firstName,
      lastName: apiTeam.teamLeader.lastName,
      email: apiTeam.teamLeader.email
    } : null,
    
    // Enhanced members with roles
    members: Array.isArray(apiTeam.members) ? apiTeam.members.map(member => ({
      userId: member.userId?.toString() || member.id?.toString(),
      userName: member.userName || `${member.firstName || ''} ${member.lastName || ''}`.trim(),
      role: member.role || 'SalesRep',
      joinedAt: member.joinedAt
    })) : [],
    
    type: mapTeamTypeFromApi(apiTeam.type || apiTeam.teamType),
    isActive: apiTeam.isActive !== undefined ? apiTeam.isActive : true,
    createdAt: apiTeam.createdAt || apiTeam.dateCreated,
    updatedAt: apiTeam.updatedAt || apiTeam.lastModified,
    memberCount: apiTeam.memberCount || apiTeam.members?.length || 0,
    
    // Legacy fields for backward compatibility
    manager: apiTeam.teamLeaderId?.toString() || null,
    regions: mapRegionsFromApi(apiTeam.regions) || [],
    products: mapProductsFromApi(apiTeam.products) || []
  };
};

/**
 * Maps frontend team data to enhanced backend format
 */
export const mapEnhancedTeamToApi = (frontendTeam) => {
  if (!frontendTeam) return null;

  return {
    id: frontendTeam.id ? parseInt(frontendTeam.id) : undefined,
    name: frontendTeam.name,
    description: frontendTeam.description,
    teamLeaderId: frontendTeam.teamLeaderId ? parseInt(frontendTeam.teamLeaderId) : 
                  frontendTeam.manager ? parseInt(frontendTeam.manager) : null,
    isActive: frontendTeam.isActive !== undefined ? frontendTeam.isActive : true,
    type: mapTeamTypeToApi(frontendTeam.type),
    
    // Legacy fields for compatibility
    regions: mapRegionsToApi(frontendTeam.regions),
    products: mapProductsToApi(frontendTeam.products)
  };
};

// ========== ENHANCED INVITATION MAPPING ==========

/**
 * Maps enhanced backend invitation data to frontend format
 */
export const mapEnhancedInvitationFromApi = (apiInvitation) => {
  if (!apiInvitation) return null;

  return {
    id: apiInvitation.id?.toString() || apiInvitation.invitationId?.toString(),
    email: apiInvitation.email,
    role: mapRoleFromApi(apiInvitation.role),
    status: mapInvitationStatusFromApi(apiInvitation.status),
    invitationToken: apiInvitation.invitationToken,
    invitationMessage: apiInvitation.invitationMessage || apiInvitation.message,
    expiresAt: apiInvitation.expiresAt || apiInvitation.expirationDate,
    acceptedAt: apiInvitation.acceptedAt || apiInvitation.dateAccepted,
    createdAt: apiInvitation.createdAt || apiInvitation.dateSent,
    
    // Enhanced team information
    teamId: apiInvitation.teamId?.toString(),
    teamName: apiInvitation.teamName || apiInvitation.team?.name,
    
    // Inviter information
    invitedBy: apiInvitation.invitedBy?.toString() || apiInvitation.inviterId?.toString(),
    
    // Legacy fields
    regions: mapRegionsFromApi(apiInvitation.regions) || [],
    products: mapProductsFromApi(apiInvitation.products) || []
  };
};

/**
 * Maps frontend invitation data to enhanced backend format
 */
export const mapEnhancedInvitationToApi = (frontendInvitation) => {
  if (!frontendInvitation) return null;

  return {
    email: frontendInvitation.email,
    role: mapRoleToApi(frontendInvitation.role),
    teamId: frontendInvitation.teamId ? parseInt(frontendInvitation.teamId) : null,
    invitationMessage: frontendInvitation.invitationMessage || frontendInvitation.message,
    
    // Legacy fields
    regions: mapRegionsToApi(frontendInvitation.regions),
    products: mapProductsToApi(frontendInvitation.products)
  };
};

// ========== ROLE MAPPING WITH ENHANCED HIERARCHY ==========

const ENHANCED_ROLE_MAPPING = {
  // Frontend -> Backend
  [USER_ROLES.ADMIN]: 'Admin',
  [USER_ROLES.MANAGER]: 'Manager',
  [USER_ROLES.SALES_REP]: 'SalesRep',
  [USER_ROLES.SALES_COORDINATOR]: 'SalesCoordinator',
  [USER_ROLES.MARKETING]: 'MarketingSpecialist',
  [USER_ROLES.CUSTOMER_SUCCESS]: 'CustomerSuccess',
  [USER_ROLES.SUPPORT]: 'SupportAgent',
  
  // Backend -> Frontend
  'Admin': USER_ROLES.ADMIN,
  'Manager': USER_ROLES.MANAGER,
  'SalesRep': USER_ROLES.SALES_REP,
  'SalesCoordinator': USER_ROLES.SALES_COORDINATOR,
  'MarketingSpecialist': USER_ROLES.MARKETING,
  'CustomerSuccess': USER_ROLES.CUSTOMER_SUCCESS,
  'SupportAgent': USER_ROLES.SUPPORT
};

export const mapRoleFromApi = (apiRole) => {
  return ENHANCED_ROLE_MAPPING[apiRole] || apiRole || USER_ROLES.SALES_REP;
};

export const mapRoleToApi = (frontendRole) => {
  return ENHANCED_ROLE_MAPPING[frontendRole] || frontendRole || 'SalesRep';
};

// ========== STATUS MAPPING ==========

const STATUS_MAPPING = {
  [USER_STATUS.ACTIVE]: true,
  [USER_STATUS.INACTIVE]: false,
  [USER_STATUS.PENDING]: false,
  
  true: USER_STATUS.ACTIVE,
  false: USER_STATUS.INACTIVE,
  'Active': USER_STATUS.ACTIVE,
  'Inactive': USER_STATUS.INACTIVE,
  'Pending': USER_STATUS.PENDING
};

export const mapStatusFromApi = (apiStatus) => {
  if (typeof apiStatus === 'boolean') {
    return apiStatus ? USER_STATUS.ACTIVE : USER_STATUS.INACTIVE;
  }
  return STATUS_MAPPING[apiStatus] || USER_STATUS.INACTIVE;
};

export const mapStatusToApi = (frontendStatus) => {
  return frontendStatus === USER_STATUS.ACTIVE;
};

// ========== TEAM TYPE MAPPING ==========

const TEAM_TYPE_MAPPING = {
  [TEAM_TYPES.DEPARTMENT]: 'Department',
  [TEAM_TYPES.REGIONAL]: 'Regional',
  [TEAM_TYPES.PRODUCT]: 'Product',
  [TEAM_TYPES.CUSTOM]: 'Custom',
  
  'Department': TEAM_TYPES.DEPARTMENT,
  'Regional': TEAM_TYPES.REGIONAL,
  'Product': TEAM_TYPES.PRODUCT,
  'Custom': TEAM_TYPES.CUSTOM
};

export const mapTeamTypeFromApi = (apiType) => {
  return TEAM_TYPE_MAPPING[apiType] || TEAM_TYPES.CUSTOM;
};

export const mapTeamTypeToApi = (frontendType) => {
  return TEAM_TYPE_MAPPING[frontendType] || 'Custom';
};

// ========== INVITATION STATUS MAPPING ==========

const INVITATION_STATUS_MAPPING = {
  'Pending': 'pending',
  'Accepted': 'accepted',
  'Declined': 'declined',
  'Cancelled': 'cancelled',
  'Expired': 'expired',
  
  'pending': 'Pending',
  'accepted': 'Accepted',
  'declined': 'Declined',
  'cancelled': 'Cancelled',
  'expired': 'Expired'
};

export const mapInvitationStatusFromApi = (apiStatus) => {
  return INVITATION_STATUS_MAPPING[apiStatus] || 'pending';
};

export const mapInvitationStatusToApi = (frontendStatus) => {
  return INVITATION_STATUS_MAPPING[frontendStatus] || 'Pending';
};

// ========== COLLECTION MAPPING HELPERS ==========

export const mapRegionsFromApi = (apiRegions) => {
  if (!Array.isArray(apiRegions)) return [];
  
  return apiRegions.map(region => {
    if (typeof region === 'string') return region;
    if (region.name) return region.name;
    if (region.regionName) return region.regionName;
    return region.toString();
  });
};

export const mapRegionsToApi = (frontendRegions) => {
  if (!Array.isArray(frontendRegions)) return [];
  return frontendRegions.map(region => typeof region === 'string' ? region : region.name);
};

export const mapProductsFromApi = (apiProducts) => {
  if (!Array.isArray(apiProducts)) return [];
  
  return apiProducts.map(product => {
    if (typeof product === 'string') return product;
    if (product.name) return product.name;
    if (product.productName) return product.productName;
    return product.toString();
  });
};

export const mapProductsToApi = (frontendProducts) => {
  if (!Array.isArray(frontendProducts)) return [];
  return frontendProducts.map(product => typeof product === 'string' ? product : product.name);
};

export const mapPermissionsFromApi = (apiPermissions) => {
  if (!Array.isArray(apiPermissions)) return [];
  
  return apiPermissions.map(permission => {
    if (typeof permission === 'string') return permission;
    if (permission.name) return permission.name;
    if (permission.permissionName) return permission.permissionName;
    return permission.toString();
  });
};

export const mapPermissionsToApi = (frontendPermissions) => {
  if (!Array.isArray(frontendPermissions)) return [];
  return frontendPermissions.map(permission => typeof permission === 'string' ? permission : permission.name);
};

// ========== PAGINATION HELPERS ==========

export const mapPaginationFromApi = (apiResponse) => {
  return {
    data: apiResponse.data || apiResponse.items || apiResponse,
    pagination: {
      page: apiResponse.page || apiResponse.currentPage || 1,
      pageSize: apiResponse.pageSize || apiResponse.limit || 50,
      total: apiResponse.total || apiResponse.totalCount || 0,
      totalPages: apiResponse.totalPages || Math.ceil((apiResponse.total || 0) / (apiResponse.pageSize || 50))
    }
  };
};

export const mapFiltersToApi = (frontendFilters) => {
  const apiFilters = {};
  
  if (frontendFilters.page) apiFilters.page = frontendFilters.page;
  if (frontendFilters.pageSize) apiFilters.pageSize = frontendFilters.pageSize;
  if (frontendFilters.search) apiFilters.search = frontendFilters.search;
  if (frontendFilters.role && frontendFilters.role !== 'all') {
    apiFilters.role = mapRoleToApi(frontendFilters.role);
  }
  if (frontendFilters.status && frontendFilters.status !== 'all') {
    apiFilters.isActive = frontendFilters.status === USER_STATUS.ACTIVE;
  }
  if (frontendFilters.teamId && frontendFilters.teamId !== 'all') {
    apiFilters.teamId = parseInt(frontendFilters.teamId);
  }
  if (frontendFilters.managerId) {
    apiFilters.managerId = parseInt(frontendFilters.managerId);
  }
  if (frontendFilters.region && frontendFilters.region !== 'all') {
    apiFilters.region = frontendFilters.region;
  }
  
  return apiFilters;
};

export default {
  mapEnhancedUserFromApi,
  mapEnhancedUserToApi,
  mapEnhancedTeamFromApi,
  mapEnhancedTeamToApi,
  mapEnhancedInvitationFromApi,
  mapEnhancedInvitationToApi,
  mapRoleFromApi,
  mapRoleToApi,
  mapStatusFromApi,
  mapStatusToApi,
  mapPaginationFromApi,
  mapFiltersToApi
};