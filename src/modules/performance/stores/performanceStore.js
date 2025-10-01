import { create } from 'zustand';
import useLeadStore from '../../leads/stores/leadStore';
import useUserStore from '../../../stores/userStore.jsx';
import useTeamStore from '../../../stores/teamStore';

const usePerformanceStore = create((set, get) => ({
  performanceData: {},
  leaderboard: [],
  currentPeriod: 'week', // week, month, quarter, year
  
  // Calculate KPIs for a specific user
  calculateUserKPIs: (userId, period = 'week') => {
    const leads = useLeadStore.getState().leads;
    const userLeads = leads.filter(lead => lead.assignedTo === userId);
    
    // Get date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    // Filter leads by period
    const periodLeads = userLeads.filter(lead => 
      new Date(lead.createdAt) >= startDate
    );
    
    // Calculate KPIs
    const revenue = userLeads
      .filter(lead => lead.status === 'won' && lead.closedDate && new Date(lead.closedDate) >= startDate)
      .reduce((sum, lead) => sum + (lead.closedValue || 0), 0);
    
    const callsMade = userLeads
      .flatMap(lead => lead.activities || [])
      .filter(activity => 
        (activity.type === 'Call' || activity.type === 'call') && 
        new Date(activity.createdAt || activity.timestamp) >= startDate
      ).length;
    
    const meetingsBooked = userLeads
      .flatMap(lead => lead.activities || [])
      .filter(activity => 
        (activity.type === 'Meeting' || activity.type === 'meeting') && 
        new Date(activity.createdAt || activity.timestamp) >= startDate
      ).length;
    
    const dealsTotal = periodLeads.length;
    const dealsClosed = periodLeads.filter(lead => lead.status === 'won').length;
    const conversionRate = dealsTotal > 0 ? (dealsClosed / dealsTotal) * 100 : 0;
    
    const activePipeline = userLeads
      .filter(lead => ['new', 'contacted', 'in_progress'].includes(lead.status))
      .reduce((sum, lead) => sum + (lead.dealValue || 0), 0);
    
    return {
      userId,
      revenue,
      callsMade,
      meetingsBooked,
      dealsClosed,
      dealsTotal,
      conversionRate,
      activePipeline,
      period
    };
  },
  
  // Calculate team KPIs
  calculateTeamKPIs: (teamId, period = 'week') => {
    const team = useTeamStore.getState().getTeamById(teamId);
    if (!team) return null;
    
    const teamKPIs = team.members.map(userId => 
      get().calculateUserKPIs(userId, period)
    );
    
    return {
      teamId,
      revenue: teamKPIs.reduce((sum, kpi) => sum + kpi.revenue, 0),
      callsMade: teamKPIs.reduce((sum, kpi) => sum + kpi.callsMade, 0),
      meetingsBooked: teamKPIs.reduce((sum, kpi) => sum + kpi.meetingsBooked, 0),
      dealsClosed: teamKPIs.reduce((sum, kpi) => sum + kpi.dealsClosed, 0),
      dealsTotal: teamKPIs.reduce((sum, kpi) => sum + kpi.dealsTotal, 0),
      conversionRate: teamKPIs.length > 0 
        ? teamKPIs.reduce((sum, kpi) => sum + kpi.conversionRate, 0) / teamKPIs.length 
        : 0,
      activePipeline: teamKPIs.reduce((sum, kpi) => sum + kpi.activePipeline, 0),
      period,
      memberCount: team.members.length
    };
  },
  
  // Generate leaderboard
  generateLeaderboard: (period = 'week') => {
    const users = useUserStore.getState().users.filter(u => u.role === 'sales_rep');
    const leaderboardData = users.map(user => {
      const kpis = get().calculateUserKPIs(user.id, period);
      const team = useTeamStore.getState().getTeamByMemberId(user.id);
      
      return {
        ...user,
        ...kpis,
        teamName: team?.name || 'No Team',
        teamId: team?.id
      };
    });
    
    // Sort by revenue (primary) and conversion rate (secondary)
    leaderboardData.sort((a, b) => {
      if (b.revenue !== a.revenue) return b.revenue - a.revenue;
      return b.conversionRate - a.conversionRate;
    });
    
    // Add rankings
    leaderboardData.forEach((user, index) => {
      user.rank = index + 1;
      user.previousRank = user.rank; // In real app, this would come from historical data
      user.rankChange = 0; // In real app, calculate from previous period
    });
    
    set({ leaderboard: leaderboardData });
    return leaderboardData;
  },
  
  // Get user performance with targets
  getUserPerformance: (userId, period = 'week') => {
    const kpis = get().calculateUserKPIs(userId, period);
    const user = useUserStore.getState().getUserById(userId);
    const team = useTeamStore.getState().getTeamByMemberId(userId);
    
    // Calculate individual targets (team target / team members)
    const teamTargets = team?.targets || { weekly: 0, monthly: 0 };
    const memberCount = team?.members.length || 1;
    
    let target = 0;
    if (period === 'week') {
      target = teamTargets.weekly / memberCount;
    } else if (period === 'month') {
      target = teamTargets.monthly / memberCount;
    }
    
    const achievement = target > 0 ? (kpis.revenue / target) * 100 : 0;
    
    return {
      ...kpis,
      user,
      team,
      target,
      achievement,
      isOnTrack: achievement >= 80
    };
  },
  
  // Set current period
  setPeriod: (period) => {
    set({ currentPeriod: period });
    get().generateLeaderboard(period);
  },
  
  // Get top performers
  getTopPerformers: (limit = 5, period = 'week') => {
    const leaderboard = get().leaderboard.length > 0 
      ? get().leaderboard 
      : get().generateLeaderboard(period);
    
    return leaderboard.slice(0, limit);
  },
  
  // Get performance trends (mock data for now)
  getPerformanceTrends: (userId, periods = 4) => {
    // In real app, this would fetch historical data
    const trends = [];
    for (let i = 0; i < periods; i++) {
      trends.push({
        period: `Week ${periods - i}`,
        revenue: Math.floor(Math.random() * 20000) + 10000,
        deals: Math.floor(Math.random() * 10) + 5
      });
    }
    return trends;
  }
}));

export default usePerformanceStore;