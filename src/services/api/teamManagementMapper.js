/**
 * Team Management Data Mapper
 * Handles frontend ↔ backend data format differences for team management operations
 */

import { 
  USER_ROLES, 
  USER_STATUS, 
  DEFAULT_PERMISSIONS, 
  TEAM_TYPES,
  REGIONS,
  PRODUCT_CATEGORIES 
} from '../../modules/team-management/constants/index.js';

/**
 * Maps backend user data to frontend format
 */
export const mapUserFromApi = (apiUser) => {
  if (!apiUser) return null;

  return {
    id: apiUser.id?.toString() || apiUser.userId?.toString(),
    name: apiUser.fullName || `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim(),
    email: apiUser.email,
    role: mapRoleFromApi(apiUser.role),
    status: mapStatusFromApi(apiUser.status || apiUser.isActive),
    avatar: apiUser.avatar || apiUser.profileImage || null,
    phone: apiUser.phone || apiUser.phoneNumber,
    regions: mapRegionsFromApi(apiUser.regions) || [],
    products: mapProductsFromApi(apiUser.products) || [],
    teams: mapTeamIdsFromApi(apiUser.teams) || [],
    permissions: mapPermissionsFromApi(apiUser.permissions) || DEFAULT_PERMISSIONS[mapRoleFromApi(apiUser.role)] || [],
    createdAt: apiUser.createdAt || apiUser.dateCreated,
    updatedAt: apiUser.updatedAt || apiUser.lastModified,
    lastLogin: apiUser.lastLogin || apiUser.lastLoginDate,
    manager: apiUser.managerId?.toString() || apiUser.manager?.toString() || null,
    commissionPercentage: apiUser.commissionRate || apiUser.commissionPercentage,
    isActive: apiUser.isActive !== undefined ? apiUser.isActive : apiUser.status === 'Active',
    preferences: apiUser.preferences || {},
    // Additional fields that might come from API
    firstName: apiUser.firstName,
    lastName: apiUser.lastName,
    timezone: apiUser.timezone,
    emailNotifications: apiUser.emailNotifications
  };
};

/**
 * Maps frontend user data to backend format
 */
export const mapUserToApi = (frontendUser) => {
  if (!frontendUser) return null;

  return {
    id: frontendUser.id ? parseInt(frontendUser.id) : undefined,
    firstName: frontendUser.firstName || frontendUser.name?.split(' ')[0] || '',
    lastName: frontendUser.lastName || frontendUser.name?.split(' ').slice(1).join(' ') || '',
    email: frontendUser.email,
    role: mapRoleToApi(frontendUser.role),
    isActive: frontendUser.status === USER_STATUS.ACTIVE,
    phone: frontendUser.phone,
    managerId: frontendUser.manager ? parseInt(frontendUser.manager) : null,
    commissionRate: frontendUser.commissionPercentage,
    regions: mapRegionsToApi(frontendUser.regions),
    products: mapProductsToApi(frontendUser.products),
    teams: mapTeamIdsToApi(frontendUser.teams),
    permissions: mapPermissionsToApi(frontendUser.permissions),
    preferences: frontendUser.preferences || {},
    timezone: frontendUser.timezone,
    emailNotifications: frontendUser.emailNotifications
  };
};

/**
 * Maps backend team data to frontend format
 */
export const mapTeamFromApi = (apiTeam) => {
  if (!apiTeam) return null;

  return {
    id: apiTeam.id?.toString() || apiTeam.teamId?.toString(),
    name: apiTeam.name || apiTeam.teamName,
    description: apiTeam.description,
    type: mapTeamTypeFromApi(apiTeam.type || apiTeam.teamType),
    members: mapTeamMembersFromApi(apiTeam.members) || [],
    manager: apiTeam.managerId?.toString() || apiTeam.manager?.toString() || null,
    regions: mapRegionsFromApi(apiTeam.regions) || [],
    products: mapProductsFromApi(apiTeam.products) || [],
    createdAt: apiTeam.createdAt || apiTeam.dateCreated,
    updatedAt: apiTeam.updatedAt || apiTeam.lastModified,
    isActive: apiTeam.isActive !== undefined ? apiTeam.isActive : true,
    // Additional fields
    memberCount: apiTeam.memberCount || apiTeam.members?.length || 0
  };
};

/**
 * Maps frontend team data to backend format
 */
export const mapTeamToApi = (frontendTeam) => {
  if (!frontendTeam) return null;

  return {
    id: frontendTeam.id ? parseInt(frontendTeam.id) : undefined,
    name: frontendTeam.name,
    description: frontendTeam.description,
    type: mapTeamTypeToApi(frontendTeam.type),
    managerId: frontendTeam.manager ? parseInt(frontendTeam.manager) : null,
    isActive: frontendTeam.isActive !== undefined ? frontendTeam.isActive : true,
    regions: mapRegionsToApi(frontendTeam.regions),
    products: mapProductsToApi(frontendTeam.products)
  };
};

/**
 * Maps backend invitation data to frontend format
 */
export const mapInvitationFromApi = (apiInvitation) => {
  if (!apiInvitation) return null;

  return {
    id: apiInvitation.id?.toString() || apiInvitation.invitationId?.toString(),
    email: apiInvitation.email,
    role: mapRoleFromApi(apiInvitation.role),
    status: mapInvitationStatusFromApi(apiInvitation.status),
    message: apiInvitation.message || apiInvitation.invitationMessage,
    createdAt: apiInvitation.createdAt || apiInvitation.dateSent,
    expiresAt: apiInvitation.expiresAt || apiInvitation.expirationDate,
    acceptedAt: apiInvitation.acceptedAt || apiInvitation.dateAccepted,
    invitedBy: apiInvitation.invitedBy?.toString() || apiInvitation.inviterId?.toString(),
    teamId: apiInvitation.teamId?.toString() || apiInvitation.team?.id?.toString(),
    teamName: apiInvitation.teamName || apiInvitation.team?.name,
    regions: mapRegionsFromApi(apiInvitation.regions) || [],
    products: mapProductsFromApi(apiInvitation.products) || []
  };
};

/**
 * Maps frontend invitation data to backend format
 */
export const mapInvitationToApi = (frontendInvitation) => {
  if (!frontendInvitation) return null;

  return {
    email: frontendInvitation.email,
    role: mapRoleToApi(frontendInvitation.role),
    teamId: frontendInvitation.teamId ? parseInt(frontendInvitation.teamId) : null,
    message: frontendInvitation.message,
    regions: mapRegionsToApi(frontendInvitation.regions),
    products: mapProductsToApi(frontendInvitation.products)
  };
};

// ========== ROLE MAPPING ==========

const ROLE_MAPPING = {
  // Frontend -> Backend (API expects these exact values)
  [USER_ROLES.ADMIN]: 'Admin',
  [USER_ROLES.MANAGER]: 'SalesManager',
  [USER_ROLES.SALES_REP]: 'SalesRep',
  
  // Backend -> Frontend
  'Admin': USER_ROLES.ADMIN,
  'SalesManager': USER_ROLES.MANAGER,
  'SalesRep': USER_ROLES.SALES_REP,
  
  // Legacy compatibility
  'Administrator': USER_ROLES.ADMIN
};

export const mapRoleFromApi = (apiRole) => {
  return ROLE_MAPPING[apiRole] || apiRole || USER_ROLES.SALES_REP;
};

export const mapRoleToApi = (frontendRole) => {
  return ROLE_MAPPING[frontendRole] || frontendRole || 'SalesRep';
};

// ========== STATUS MAPPING ==========

const STATUS_MAPPING = {
  // Frontend -> Backend
  [USER_STATUS.ACTIVE]: true,
  [USER_STATUS.INACTIVE]: false,
  [USER_STATUS.PENDING]: false,
  
  // Backend -> Frontend
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
  // Frontend -> Backend
  [TEAM_TYPES.DEPARTMENT]: 'Department',
  [TEAM_TYPES.REGIONAL]: 'Regional',
  [TEAM_TYPES.PRODUCT]: 'Product',
  [TEAM_TYPES.CUSTOM]: 'Custom',
  
  // Backend -> Frontend
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
  
  // Handle both string arrays and object arrays
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
  
  // Handle both string arrays and object arrays
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

export const mapTeamIdsFromApi = (apiTeams) => {
  if (!Array.isArray(apiTeams)) return [];
  
  return apiTeams.map(team => {
    if (typeof team === 'string' || typeof team === 'number') return team.toString();
    if (team.id) return team.id.toString();
    if (team.teamId) return team.teamId.toString();
    return team.toString();
  });
};

export const mapTeamIdsToApi = (frontendTeams) => {
  if (!Array.isArray(frontendTeams)) return [];
  return frontendTeams.map(teamId => parseInt(teamId));
};

export const mapTeamMembersFromApi = (apiMembers) => {
  if (!Array.isArray(apiMembers)) return [];
  
  return apiMembers.map(member => {
    if (typeof member === 'string' || typeof member === 'number') return member.toString();
    if (member.id) return member.id.toString();
    if (member.userId) return member.userId.toString();
    return member.toString();
  });
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
  
  // Map common filter properties
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
  if (frontendFilters.region && frontendFilters.region !== 'all') {
    apiFilters.region = frontendFilters.region;
  }
  
  return apiFilters;
};

// ========== BULK OPERATIONS HELPERS ==========

export const mapBulkOperationToApi = (operation, userIds, data) => {
  return {
    userIds: userIds.map(id => parseInt(id)),
    ...data
  };
};

export const mapBulkResponseFromApi = (apiResponse) => {
  return {
    success: apiResponse.success || false,
    processed: apiResponse.processed || apiResponse.processedCount || 0,
    failed: apiResponse.failed || apiResponse.failedCount || 0,
    errors: apiResponse.errors || []
  };
};

export default {
  mapUserFromApi,
  mapUserToApi,
  mapTeamFromApi,
  mapTeamToApi,
  mapInvitationFromApi,
  mapInvitationToApi,
  mapPaginationFromApi,
  mapFiltersToApi,
  mapBulkOperationToApi,
  mapBulkResponseFromApi
};