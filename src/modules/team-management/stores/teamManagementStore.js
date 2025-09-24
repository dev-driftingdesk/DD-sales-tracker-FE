import { create } from 'zustand';
import { 
  USER_ROLES, 
  USER_STATUS, 
  DEFAULT_PERMISSIONS, 
  TEAM_TYPES,
  REGIONS,
  PRODUCT_CATEGORIES 
} from '../constants';

const useTeamManagementStore = create((set, get) => ({
  // State
  users: [
    {
      id: '1',
      name: 'John Admin',
      email: 'john@salestracker.com',
      role: USER_ROLES.ADMIN,
      status: USER_STATUS.ACTIVE,
      avatar: null,
      phone: '+1-555-0101',
      regions: Object.values(REGIONS),
      products: Object.values(PRODUCT_CATEGORIES),
      teams: ['1'],
      permissions: DEFAULT_PERMISSIONS[USER_ROLES.ADMIN],
      createdAt: '2024-01-01T00:00:00Z',
      lastLogin: '2024-12-01T10:00:00Z',
      manager: null
    },
    {
      id: '2',
      name: 'Sarah Manager',
      email: 'sarah@salestracker.com',
      role: USER_ROLES.MANAGER,
      status: USER_STATUS.ACTIVE,
      avatar: null,
      phone: '+1-555-0102',
      regions: [REGIONS.NORTH_AMERICA, REGIONS.EUROPE],
      products: [PRODUCT_CATEGORIES.BLACK_TEA, PRODUCT_CATEGORIES.GREEN_TEA],
      teams: ['1', '2'],
      permissions: DEFAULT_PERMISSIONS[USER_ROLES.MANAGER],
      createdAt: '2024-01-15T00:00:00Z',
      lastLogin: '2024-12-01T09:30:00Z',
      manager: '1'
    },
    {
      id: '3',
      name: 'Mike Rep',
      email: 'mike@salestracker.com',
      role: USER_ROLES.SALES_REP,
      status: USER_STATUS.ACTIVE,
      avatar: null,
      phone: '+1-555-0103',
      regions: [REGIONS.NORTH_AMERICA],
      products: [PRODUCT_CATEGORIES.BLACK_TEA],
      teams: ['2'],
      permissions: DEFAULT_PERMISSIONS[USER_ROLES.SALES_REP],
      createdAt: '2024-02-01T00:00:00Z',
      lastLogin: '2024-12-01T08:45:00Z',
      manager: '2',
      commissionPercentage: 5.5
    }
  ],
  
  teams: [
    {
      id: '1',
      name: 'Leadership Team',
      description: 'Company leadership and management',
      type: TEAM_TYPES.CUSTOM,
      members: ['1', '2'],
      manager: '1',
      regions: Object.values(REGIONS),
      products: Object.values(PRODUCT_CATEGORIES),
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'North America Sales',
      description: 'Sales team covering North American market',
      type: TEAM_TYPES.REGIONAL,
      members: ['2', '3'],
      manager: '2',
      regions: [REGIONS.NORTH_AMERICA],
      products: [PRODUCT_CATEGORIES.BLACK_TEA, PRODUCT_CATEGORIES.GREEN_TEA],
      createdAt: '2024-01-15T00:00:00Z'
    }
  ],
  
  invitations: [],
  
  selectedUser: null,
  selectedTeam: null,
  isLoading: false,
  error: null,
  
  // User management actions
  createUser: (userData) => {
    const newUser = {
      ...userData,
      id: Date.now().toString(),
      status: USER_STATUS.ACTIVE,
      permissions: DEFAULT_PERMISSIONS[userData.role] || [],
      createdAt: new Date().toISOString(),
      lastLogin: null
    };
    
    set((state) => ({
      users: [...state.users, newUser]
    }));
    
    return newUser;
  },
  
  updateUser: (userId, updates) => {
    set((state) => ({
      users: state.users.map(user => 
        user.id === userId 
          ? { ...user, ...updates, updatedAt: new Date().toISOString() }
          : user
      )
    }));
  },
  
  deleteUser: (userId) => {
    set((state) => ({
      users: state.users.filter(user => user.id !== userId),
      teams: state.teams.map(team => ({
        ...team,
        members: team.members.filter(id => id !== userId)
      }))
    }));
  },
  
  deactivateUser: (userId) => {
    get().updateUser(userId, { status: USER_STATUS.INACTIVE });
  },
  
  reactivateUser: (userId) => {
    get().updateUser(userId, { status: USER_STATUS.ACTIVE });
  },
  
  updateUserPermissions: (userId, permissions) => {
    get().updateUser(userId, { permissions });
  },
  
  // Team management actions
  createTeam: (teamData) => {
    const newTeam = {
      ...teamData,
      id: Date.now().toString(),
      members: teamData.members || [],
      createdAt: new Date().toISOString()
    };
    
    set((state) => ({
      teams: [...state.teams, newTeam]
    }));
    
    return newTeam;
  },
  
  updateTeam: (teamId, updates) => {
    set((state) => ({
      teams: state.teams.map(team => 
        team.id === teamId 
          ? { ...team, ...updates, updatedAt: new Date().toISOString() }
          : team
      )
    }));
  },
  
  deleteTeam: (teamId) => {
    set((state) => ({
      teams: state.teams.filter(team => team.id !== teamId),
      users: state.users.map(user => ({
        ...user,
        teams: user.teams.filter(id => id !== teamId)
      }))
    }));
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
  
  // Invitation management
  createInvitation: (invitationData) => {
    const invitation = {
      ...invitationData,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };
    
    set((state) => ({
      invitations: [...state.invitations, invitation]
    }));
    
    // Simulate sending email invitation
    console.log('Invitation sent to:', invitation.email);
    
    return invitation;
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
  }
}));

export default useTeamManagementStore;