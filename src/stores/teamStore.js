import { create } from 'zustand';

const mockTeams = [
  {
    id: 'team-1',
    name: 'Middle East & Asia',
    location: 'Dubai',
    managerId: 'user-6',
    members: ['user-1', 'user-3', 'user-6'],
    targets: {
      weekly: 50000,
      monthly: 200000
    },
    createdAt: '2022-01-01'
  },
  {
    id: 'team-2',
    name: 'Europe & Americas',
    location: 'London',
    managerId: 'user-6',
    members: ['user-2', 'user-4'],
    targets: {
      weekly: 40000,
      monthly: 160000
    },
    createdAt: '2022-01-01'
  },
  {
    id: 'team-3',
    name: 'Asia Pacific',
    location: 'Singapore',
    managerId: 'user-6',
    members: ['user-5'],
    targets: {
      weekly: 30000,
      monthly: 120000
    },
    createdAt: '2022-01-01'
  }
];

const useTeamStore = create((set, get) => ({
  teams: mockTeams,
  
  // Actions
  getTeamById: (teamId) => {
    const { teams } = get();
    return teams.find(t => t.id === teamId);
  },
  
  getTeamByMemberId: (userId) => {
    const { teams } = get();
    return teams.find(t => t.members.includes(userId));
  },
  
  getTeamsByManager: (managerId) => {
    const { teams } = get();
    return teams.filter(t => t.managerId === managerId);
  },
  
  updateTeamTargets: (teamId, targets) => set((state) => ({
    teams: state.teams.map(team => 
      team.id === teamId 
        ? { ...team, targets: { ...team.targets, ...targets } }
        : team
    )
  })),
  
  addMemberToTeam: (teamId, userId) => set((state) => ({
    teams: state.teams.map(team => 
      team.id === teamId 
        ? { ...team, members: [...team.members, userId] }
        : team
    )
  })),
  
  removeMemberFromTeam: (teamId, userId) => set((state) => ({
    teams: state.teams.map(team => 
      team.id === teamId 
        ? { ...team, members: team.members.filter(id => id !== userId) }
        : team
    )
  }))
}));

export default useTeamStore;