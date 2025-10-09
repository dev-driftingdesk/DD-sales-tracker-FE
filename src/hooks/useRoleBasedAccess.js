/**
 * Role-Based Access Control Hook
 * Provides permission checking and role-based UI control
 */

import { useMemo } from 'react';
import useAuthStore from '../modules/auth/stores/authStore';

// Role hierarchy definition
const ROLE_HIERARCHY = {
  'Admin': 3,
  'Manager': 2,
  'SalesRep': 1
};

// Permission definitions
const PERMISSIONS = {
  // User management
  INVITE_USERS: 'invite_users',
  MANAGE_USERS: 'manage_users',
  ASSIGN_MANAGERS: 'assign_managers',
  VIEW_ALL_USERS: 'view_all_users',
  
  // Team management
  CREATE_TEAMS: 'create_teams',
  MANAGE_TEAMS: 'manage_teams',
  ASSIGN_TEAM_LEADERS: 'assign_team_leaders',
  ADD_TEAM_MEMBERS: 'add_team_members',
  VIEW_ALL_TEAMS: 'view_all_teams',
  
  // Invitation management
  SEND_INVITATIONS: 'send_invitations',
  RESEND_INVITATIONS: 'resend_invitations',
  CANCEL_INVITATIONS: 'cancel_invitations',
  VIEW_ALL_INVITATIONS: 'view_all_invitations',
  
  // Advanced operations
  BULK_OPERATIONS: 'bulk_operations',
  ANALYTICS_ACCESS: 'analytics_access',
  AUDIT_LOGS: 'audit_logs'
};

// Role-permission mapping
const ROLE_PERMISSIONS = {
  'Admin': [
    PERMISSIONS.INVITE_USERS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.ASSIGN_MANAGERS,
    PERMISSIONS.VIEW_ALL_USERS,
    PERMISSIONS.CREATE_TEAMS,
    PERMISSIONS.MANAGE_TEAMS,
    PERMISSIONS.ASSIGN_TEAM_LEADERS,
    PERMISSIONS.ADD_TEAM_MEMBERS,
    PERMISSIONS.VIEW_ALL_TEAMS,
    PERMISSIONS.SEND_INVITATIONS,
    PERMISSIONS.RESEND_INVITATIONS,
    PERMISSIONS.CANCEL_INVITATIONS,
    PERMISSIONS.VIEW_ALL_INVITATIONS,
    PERMISSIONS.BULK_OPERATIONS,
    PERMISSIONS.ANALYTICS_ACCESS,
    PERMISSIONS.AUDIT_LOGS
  ],
  'Manager': [
    PERMISSIONS.ADD_TEAM_MEMBERS,
    PERMISSIONS.VIEW_ALL_TEAMS,
    PERMISSIONS.SEND_INVITATIONS,
    PERMISSIONS.RESEND_INVITATIONS,
    PERMISSIONS.VIEW_ALL_INVITATIONS,
    PERMISSIONS.ANALYTICS_ACCESS
  ],
  'SalesRep': [
    // Basic access only
  ]
};

/**
 * Role-based access control hook
 */
export const useRoleBasedAccess = () => {
  const { user } = useAuthStore();
  
  const userRole = user?.role || 'SalesRep';
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  
  const roleBasedAccess = useMemo(() => {
    /**
     * Check if user has specific permission
     */
    const hasPermission = (permission) => {
      return userPermissions.includes(permission);
    };

    /**
     * Check if user has required role level or higher
     */
    const hasRoleLevel = (requiredRole) => {
      const userLevel = ROLE_HIERARCHY[userRole] || 0;
      const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
      return userLevel >= requiredLevel;
    };

    /**
     * Check if user can access specific UI element
     */
    const canAccess = (element) => {
      switch (element) {
        // User management UI
        case 'invite_user_button':
          return hasPermission(PERMISSIONS.INVITE_USERS);
        case 'manage_users_section':
          return hasPermission(PERMISSIONS.MANAGE_USERS);
        case 'assign_manager_dropdown':
          return hasPermission(PERMISSIONS.ASSIGN_MANAGERS);
        case 'user_bulk_actions':
          return hasPermission(PERMISSIONS.BULK_OPERATIONS);
          
        // Team management UI
        case 'create_team_button':
          return hasPermission(PERMISSIONS.CREATE_TEAMS);
        case 'team_leader_assignment':
          return hasPermission(PERMISSIONS.ASSIGN_TEAM_LEADERS);
        case 'add_team_member_button':
          return hasPermission(PERMISSIONS.ADD_TEAM_MEMBERS);
        case 'team_management_section':
          return hasPermission(PERMISSIONS.MANAGE_TEAMS);
          
        // Invitation UI
        case 'send_invitation_button':
          return hasPermission(PERMISSIONS.SEND_INVITATIONS);
        case 'resend_invitation_button':
          return hasPermission(PERMISSIONS.RESEND_INVITATIONS);
        case 'cancel_invitation_button':
          return hasPermission(PERMISSIONS.CANCEL_INVITATIONS);
        case 'invitation_management_section':
          return hasPermission(PERMISSIONS.VIEW_ALL_INVITATIONS);
          
        // Advanced features
        case 'analytics_dashboard':
          return hasPermission(PERMISSIONS.ANALYTICS_ACCESS);
        case 'audit_logs_section':
          return hasPermission(PERMISSIONS.AUDIT_LOGS);
          
        default:
          return false;
      }
    };

    /**
     * Get filtered data based on user role
     */
    const getFilteredData = (dataType, data) => {
      if (!Array.isArray(data)) return data;
      
      switch (dataType) {
        case 'users':
          // Admin: sees all users
          // Manager: sees team members and subordinates
          // SalesRep: sees only own data
          if (hasRoleLevel('Admin')) return data;
          if (hasRoleLevel('Manager')) {
            // Filter to show only team members or users managed by this manager
            return data.filter(userData => {
              return userData.managerId === user?.id || 
                     userData.teams?.some(team => user?.teams?.includes(team));
            });
          }
          // SalesRep sees only own data
          return data.filter(userData => userData.id === user?.id);
          
        case 'teams':
          // Admin: sees all teams
          // Manager/SalesRep: sees only assigned teams
          if (hasRoleLevel('Admin')) return data;
          return data.filter(team => 
            user?.teams?.includes(team.id) || team.teamLeaderId === user?.id
          );
          
        case 'invitations':
          // Admin: sees all invitations
          // Manager: sees team-related invitations
          // SalesRep: sees own invitations only
          if (hasRoleLevel('Admin')) return data;
          if (hasRoleLevel('Manager')) {
            return data.filter(invitation => 
              invitation.invitedBy === user?.id ||
              user?.teams?.includes(invitation.teamId)
            );
          }
          return data.filter(invitation => invitation.email === user?.email);
          
        default:
          return data;
      }
    };

    /**
     * Get role-specific validation rules
     */
    const getValidationRules = (formType) => {
      const rules = {};
      
      switch (formType) {
        case 'user_form':
          rules.canAssignRole = hasPermission(PERMISSIONS.MANAGE_USERS);
          rules.canAssignManager = hasPermission(PERMISSIONS.ASSIGN_MANAGERS);
          rules.canAssignToAnyTeam = hasPermission(PERMISSIONS.MANAGE_TEAMS);
          rules.maxRoleLevel = userRole; // Can't assign higher role than own
          break;
          
        case 'team_form':
          rules.canCreateTeam = hasPermission(PERMISSIONS.CREATE_TEAMS);
          rules.canAssignLeader = hasPermission(PERMISSIONS.ASSIGN_TEAM_LEADERS);
          rules.canAddMembers = hasPermission(PERMISSIONS.ADD_TEAM_MEMBERS);
          break;
          
        case 'invitation_form':
          rules.canSendInvitation = hasPermission(PERMISSIONS.SEND_INVITATIONS);
          rules.canInviteToAnyTeam = hasPermission(PERMISSIONS.MANAGE_TEAMS);
          rules.canAssignAnyRole = hasPermission(PERMISSIONS.MANAGE_USERS);
          break;
      }
      
      return rules;
    };

    return {
      userRole,
      userPermissions,
      hasPermission,
      hasRoleLevel,
      canAccess,
      getFilteredData,
      getValidationRules,
      
      // Convenience role checks
      isAdmin: userRole === 'Admin',
      isManager: userRole === 'Manager',
      isSalesRep: userRole === 'SalesRep',
      isManagerOrAbove: hasRoleLevel('Manager'),
      isAdminOnly: userRole === 'Admin'
    };
  }, [userRole, userPermissions, user]);

  return roleBasedAccess;
};

export { PERMISSIONS };
export default useRoleBasedAccess;