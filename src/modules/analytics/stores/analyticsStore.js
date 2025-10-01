import { create } from 'zustand';
import { DATE_RANGES } from '../constants';
import useLeadStore from '../../leads/stores/leadStore';
import useUserStore from '../../../stores/userStore.jsx';
import useTeamStore from '../../../stores/teamStore';

const useAnalyticsStore = create((set, get) => ({
  // State
  selectedDateRange: DATE_RANGES.THIS_MONTH,
  customDateRange: {
    start: null,
    end: null
  },
  selectedTeams: [],
  selectedUsers: [],
  selectedSources: [],
  selectedRegions: [],
  
  isLoading: false,
  error: null,
  
  // Cached analytics data
  pipelineData: null,
  conversionData: null,
  performanceData: null,
  revenueData: null,
  
  // Actions
  setDateRange: (range) => {
    set({ selectedDateRange: range });
    get().refreshAnalytics();
  },
  
  setCustomDateRange: (start, end) => {
    set({ 
      customDateRange: { start, end },
      selectedDateRange: DATE_RANGES.CUSTOM 
    });
    get().refreshAnalytics();
  },
  
  setFilters: (filters) => {
    set({
      selectedTeams: filters.teams || get().selectedTeams,
      selectedUsers: filters.users || get().selectedUsers,
      selectedSources: filters.sources || get().selectedSources,
      selectedRegions: filters.regions || get().selectedRegions
    });
    get().refreshAnalytics();
  },
  
  // Analytics calculations
  calculatePipelineMetrics: () => {
    const leads = useLeadStore.getState().leads;
    const filteredLeads = get().getFilteredLeads(leads);
    
    const totalLeads = filteredLeads.length;
    const wonLeads = filteredLeads.filter(l => l.status === 'won');
    const lostLeads = filteredLeads.filter(l => l.status === 'lost');
    const activeLeads = filteredLeads.filter(l => 
      ['new', 'contacted', 'in_progress'].includes(l.status)
    );
    
    const totalRevenue = wonLeads.reduce((sum, lead) => 
      sum + (lead.closedValue || lead.dealValue || 0), 0
    );
    
    const averageDealSize = wonLeads.length > 0 
      ? totalRevenue / wonLeads.length 
      : 0;
    
    const conversionRate = totalLeads > 0 
      ? (wonLeads.length / totalLeads) * 100 
      : 0;
    
    const winRate = (wonLeads.length + lostLeads.length) > 0
      ? (wonLeads.length / (wonLeads.length + lostLeads.length)) * 100
      : 0;
    
    // Calculate sales cycle
    const salesCycleDays = wonLeads.length > 0
      ? wonLeads.reduce((sum, lead) => {
          const created = new Date(lead.createdAt);
          const closed = new Date(lead.closedDate || lead.updatedAt);
          const days = Math.floor((closed - created) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / wonLeads.length
      : 0;
    
    return {
      totalLeads,
      totalRevenue,
      averageDealSize,
      conversionRate,
      winRate,
      salesCycleDays,
      activeLeads: activeLeads.length,
      wonLeads: wonLeads.length,
      lostLeads: lostLeads.length
    };
  },
  
  calculateSourceConversion: () => {
    const leads = useLeadStore.getState().leads;
    const filteredLeads = get().getFilteredLeads(leads);
    
    const sourceData = {};
    
    filteredLeads.forEach(lead => {
      const source = lead.source || 'unknown';
      if (!sourceData[source]) {
        sourceData[source] = {
          total: 0,
          won: 0,
          lost: 0,
          revenue: 0
        };
      }
      
      sourceData[source].total++;
      if (lead.status === 'won') {
        sourceData[source].won++;
        sourceData[source].revenue += lead.closedValue || lead.dealValue || 0;
      } else if (lead.status === 'lost') {
        sourceData[source].lost++;
      }
    });
    
    // Calculate conversion rates and format for charts
    return Object.entries(sourceData).map(([source, data]) => ({
      source,
      total: data.total,
      won: data.won,
      lost: data.lost,
      revenue: data.revenue,
      conversionRate: data.total > 0 ? (data.won / data.total) * 100 : 0,
      winRate: (data.won + data.lost) > 0 ? (data.won / (data.won + data.lost)) * 100 : 0
    })).sort((a, b) => b.total - a.total);
  },
  
  calculateDealStageAnalysis: () => {
    const leads = useLeadStore.getState().leads;
    const filteredLeads = get().getFilteredLeads(leads);
    
    const stageData = {
      new: 0,
      contacted: 0,
      in_progress: 0,
      won: 0,
      lost: 0
    };
    
    filteredLeads.forEach(lead => {
      if (stageData.hasOwnProperty(lead.status)) {
        stageData[lead.status]++;
      }
    });
    
    const total = Object.values(stageData).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(stageData).map(([stage, count]) => ({
      stage,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }));
  },
  
  calculateRepPerformance: () => {
    const leads = useLeadStore.getState().leads;
    const users = useUserStore.getState().users;
    const filteredLeads = get().getFilteredLeads(leads);
    
    const repData = {};
    
    // Initialize rep data
    users.forEach(user => {
      repData[user.id] = {
        id: user.id,
        name: user.name,
        totalLeads: 0,
        wonLeads: 0,
        lostLeads: 0,
        revenue: 0,
        averageDealSize: 0,
        conversionRate: 0
      };
    });
    
    // Calculate metrics for each rep
    filteredLeads.forEach(lead => {
      if (lead.assignedTo && repData[lead.assignedTo]) {
        const rep = repData[lead.assignedTo];
        rep.totalLeads++;
        
        if (lead.status === 'won') {
          rep.wonLeads++;
          rep.revenue += lead.closedValue || lead.dealValue || 0;
        } else if (lead.status === 'lost') {
          rep.lostLeads++;
        }
      }
    });
    
    // Calculate derived metrics
    Object.values(repData).forEach(rep => {
      rep.averageDealSize = rep.wonLeads > 0 ? rep.revenue / rep.wonLeads : 0;
      rep.conversionRate = rep.totalLeads > 0 ? (rep.wonLeads / rep.totalLeads) * 100 : 0;
    });
    
    return Object.values(repData)
      .filter(rep => rep.totalLeads > 0)
      .sort((a, b) => b.revenue - a.revenue);
  },
  
  calculateRevenueTimeline: () => {
    const leads = useLeadStore.getState().leads;
    const filteredLeads = get().getFilteredLeads(leads);
    const wonLeads = filteredLeads.filter(l => l.status === 'won' && l.closedDate);
    
    // Group by month
    const monthlyData = {};
    
    wonLeads.forEach(lead => {
      const date = new Date(lead.closedDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          revenue: 0,
          deals: 0
        };
      }
      
      monthlyData[monthKey].revenue += lead.closedValue || lead.dealValue || 0;
      monthlyData[monthKey].deals++;
    });
    
    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  },
  
  getFilteredLeads: (leads) => {
    const { selectedDateRange, customDateRange, selectedTeams, selectedUsers, selectedSources } = get();
    
    return leads.filter(lead => {
      // Date filter
      const leadDate = new Date(lead.createdAt);
      const now = new Date();
      
      let dateMatch = true;
      
      switch (selectedDateRange) {
        case DATE_RANGES.TODAY:
          dateMatch = leadDate.toDateString() === now.toDateString();
          break;
        case DATE_RANGES.THIS_WEEK:
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          dateMatch = leadDate >= weekStart;
          break;
        case DATE_RANGES.THIS_MONTH:
          dateMatch = leadDate.getMonth() === now.getMonth() && 
                     leadDate.getFullYear() === now.getFullYear();
          break;
        case DATE_RANGES.LAST_MONTH:
          const lastMonth = new Date(now);
          lastMonth.setMonth(now.getMonth() - 1);
          dateMatch = leadDate.getMonth() === lastMonth.getMonth() && 
                     leadDate.getFullYear() === lastMonth.getFullYear();
          break;
        case DATE_RANGES.CUSTOM:
          if (customDateRange.start && customDateRange.end) {
            dateMatch = leadDate >= new Date(customDateRange.start) && 
                       leadDate <= new Date(customDateRange.end);
          }
          break;
      }
      
      if (!dateMatch) return false;
      
      // Team filter
      if (selectedTeams.length > 0) {
        const teams = useTeamStore.getState().teams;
        const userTeam = teams.find(team => 
          team.members.some(member => member.id === lead.assignedTo)
        );
        if (!userTeam || !selectedTeams.includes(userTeam.id)) return false;
      }
      
      // User filter
      if (selectedUsers.length > 0 && !selectedUsers.includes(lead.assignedTo)) {
        return false;
      }
      
      // Source filter
      if (selectedSources.length > 0 && !selectedSources.includes(lead.source)) {
        return false;
      }
      
      return true;
    });
  },
  
  refreshAnalytics: () => {
    set({ isLoading: true });
    
    try {
      const pipelineData = get().calculatePipelineMetrics();
      const conversionData = get().calculateSourceConversion();
      const performanceData = get().calculateRepPerformance();
      const revenueData = get().calculateRevenueTimeline();
      
      set({
        pipelineData,
        conversionData,
        performanceData,
        revenueData,
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({ 
        error: error.message, 
        isLoading: false 
      });
    }
  },
  
  exportData: (type, format) => {
    // Implementation for data export
    const data = get()[`${type}Data`];
    if (!data) return;
    
    // Create CSV content
    if (format === 'csv') {
      let csv = '';
      
      if (type === 'pipeline') {
        csv = 'Metric,Value\n';
        Object.entries(data).forEach(([key, value]) => {
          csv += `${key},${value}\n`;
        });
      } else if (Array.isArray(data)) {
        const headers = Object.keys(data[0] || {});
        csv = headers.join(',') + '\n';
        data.forEach(row => {
          csv += headers.map(header => row[header]).join(',') + '\n';
        });
      }
      
      // Download CSV
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }
}));

export default useAnalyticsStore;