// User roles and permissions constants
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  SALES_REP: 'sales_rep'
};

export const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.MANAGER]: 'Manager',
  [USER_ROLES.SALES_REP]: 'Sales Representative'
};

export const ROLE_DESCRIPTIONS = {
  [USER_ROLES.ADMIN]: 'Full system access and user management',
  [USER_ROLES.MANAGER]: 'Team oversight and reporting access',
  [USER_ROLES.SALES_REP]: 'Lead management and sales activities'
};

// Permission categories
export const PERMISSION_CATEGORIES = {
  LEADS: 'leads',
  ANALYTICS: 'analytics',
  TEAM: 'team',
  SETTINGS: 'settings',
  INTEGRATIONS: 'integrations'
};

// Specific permissions
export const PERMISSIONS = {
  // Lead permissions
  VIEW_ALL_LEADS: 'view_all_leads',
  VIEW_ASSIGNED_LEADS: 'view_assigned_leads',
  CREATE_LEADS: 'create_leads',
  EDIT_LEADS: 'edit_leads',
  DELETE_LEADS: 'delete_leads',
  ASSIGN_LEADS: 'assign_leads',
  EXPORT_LEADS: 'export_leads',
  
  // Analytics permissions
  VIEW_ALL_ANALYTICS: 'view_all_analytics',
  VIEW_TEAM_ANALYTICS: 'view_team_analytics',
  VIEW_PERSONAL_ANALYTICS: 'view_personal_analytics',
  EXPORT_ANALYTICS: 'export_analytics',
  
  // Team permissions
  VIEW_ALL_USERS: 'view_all_users',
  VIEW_TEAM_USERS: 'view_team_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  MANAGE_TEAMS: 'manage_teams',
  ASSIGN_PERMISSIONS: 'assign_permissions',
  
  // Settings permissions
  MANAGE_SYSTEM_SETTINGS: 'manage_system_settings',
  MANAGE_TEAM_SETTINGS: 'manage_team_settings',
  
  // Integration permissions
  MANAGE_INTEGRATIONS: 'manage_integrations',
  VIEW_API_KEYS: 'view_api_keys'
};

// Default role permissions
export const DEFAULT_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.VIEW_ALL_LEADS,
    PERMISSIONS.CREATE_LEADS,
    PERMISSIONS.EDIT_LEADS,
    PERMISSIONS.DELETE_LEADS,
    PERMISSIONS.ASSIGN_LEADS,
    PERMISSIONS.EXPORT_LEADS,
    PERMISSIONS.VIEW_ALL_ANALYTICS,
    PERMISSIONS.EXPORT_ANALYTICS,
    PERMISSIONS.VIEW_ALL_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.DELETE_USERS,
    PERMISSIONS.MANAGE_TEAMS,
    PERMISSIONS.ASSIGN_PERMISSIONS,
    PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
    PERMISSIONS.MANAGE_INTEGRATIONS,
    PERMISSIONS.VIEW_API_KEYS
  ],
  
  [USER_ROLES.MANAGER]: [
    PERMISSIONS.VIEW_ALL_LEADS,
    PERMISSIONS.CREATE_LEADS,
    PERMISSIONS.EDIT_LEADS,
    PERMISSIONS.ASSIGN_LEADS,
    PERMISSIONS.EXPORT_LEADS,
    PERMISSIONS.VIEW_ALL_ANALYTICS,
    PERMISSIONS.VIEW_TEAM_ANALYTICS,
    PERMISSIONS.EXPORT_ANALYTICS,
    PERMISSIONS.VIEW_ALL_USERS,
    PERMISSIONS.VIEW_TEAM_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.MANAGE_TEAMS,
    PERMISSIONS.MANAGE_TEAM_SETTINGS
  ],
  
  [USER_ROLES.SALES_REP]: [
    PERMISSIONS.VIEW_ASSIGNED_LEADS,
    PERMISSIONS.CREATE_LEADS,
    PERMISSIONS.EDIT_LEADS,
    PERMISSIONS.VIEW_PERSONAL_ANALYTICS,
    PERMISSIONS.VIEW_TEAM_USERS
  ]
};

// User status
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending'
};

export const STATUS_LABELS = {
  [USER_STATUS.ACTIVE]: 'Active',
  [USER_STATUS.INACTIVE]: 'Inactive',
  [USER_STATUS.PENDING]: 'Pending Invitation'
};

// Regions
export const REGIONS = {
  NORTH_AMERICA: 'north_america',
  EUROPE: 'europe',
  ASIA_PACIFIC: 'asia_pacific',
  MIDDLE_EAST: 'middle_east',
  AFRICA: 'africa',
  SOUTH_AMERICA: 'south_america'
};

export const REGION_LABELS = {
  [REGIONS.NORTH_AMERICA]: 'North America',
  [REGIONS.EUROPE]: 'Europe',
  [REGIONS.ASIA_PACIFIC]: 'Asia Pacific',
  [REGIONS.MIDDLE_EAST]: 'Middle East',
  [REGIONS.AFRICA]: 'Africa',
  [REGIONS.SOUTH_AMERICA]: 'South America'
};

// Product categories
export const PRODUCT_CATEGORIES = {
  BLACK_TEA: 'black_tea',
  GREEN_TEA: 'green_tea',
  HERBAL_TEA: 'herbal_tea',
  SPECIALTY_TEA: 'specialty_tea',
  BULK_TEA: 'bulk_tea'
};

export const PRODUCT_LABELS = {
  [PRODUCT_CATEGORIES.BLACK_TEA]: 'Black Tea',
  [PRODUCT_CATEGORIES.GREEN_TEA]: 'Green Tea',
  [PRODUCT_CATEGORIES.HERBAL_TEA]: 'Herbal Tea',
  [PRODUCT_CATEGORIES.SPECIALTY_TEA]: 'Specialty Tea',
  [PRODUCT_CATEGORIES.BULK_TEA]: 'Bulk Tea'
};

// Team types
export const TEAM_TYPES = {
  REGIONAL: 'regional',
  PRODUCT: 'product',
  LANGUAGE: 'language',
  CUSTOM: 'custom'
};

export const TEAM_TYPE_LABELS = {
  [TEAM_TYPES.REGIONAL]: 'Regional Team',
  [TEAM_TYPES.PRODUCT]: 'Product Team',
  [TEAM_TYPES.LANGUAGE]: 'Language Team',
  [TEAM_TYPES.CUSTOM]: 'Custom Team'
};