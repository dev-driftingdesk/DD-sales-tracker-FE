/**
 * Conversion and Sales Velocity Metrics Utilities for SalesTracker
 * Handles calculations for Lead Conversion Rate and Sales Velocity
 */

/**
 * Calculate Lead Conversion Rate
 * @param {Array} leads - Array of leads
 * @param {Object} options - Filter options (timeframe, source, assignee, etc.)
 * @returns {Object} Conversion rate data and breakdown
 */
export const calculateLeadConversionRate = (leads, options = {}) => {
  if (!leads || leads.length === 0) {
    return {
      totalLeads: 0,
      convertedLeads: 0,
      conversionRate: 0,
      breakdown: {
        new: 0,
        contacted: 0,
        in_progress: 0,
        won: 0,
        lost: 0
      },
      conversionsBySource: {},
      conversionsByAssignee: {},
      trend: null
    };
  }

  // Apply filters
  let filteredLeads = [...leads];
  
  if (options.timeframe) {
    const cutoffDate = getTimeframeCutoff(options.timeframe);
    filteredLeads = filteredLeads.filter(lead => 
      new Date(lead.createdAt) >= cutoffDate
    );
  }

  if (options.source && options.source !== 'all') {
    filteredLeads = filteredLeads.filter(lead => lead.source === options.source);
  }

  if (options.assignee && options.assignee !== 'all') {
    filteredLeads = filteredLeads.filter(lead => lead.assignedTo === options.assignee);
  }

  // Count leads by status
  const statusCounts = {
    new: 0,
    contacted: 0,
    in_progress: 0,
    won: 0,
    lost: 0
  };

  filteredLeads.forEach(lead => {
    statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
  });

  const totalLeads = filteredLeads.length;
  const convertedLeads = statusCounts.won || 0;
  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

  // Conversion by source
  const conversionsBySource = {};
  const sourceGroups = groupBy(filteredLeads, 'source');
  
  Object.keys(sourceGroups).forEach(source => {
    const sourceLeads = sourceGroups[source];
    const sourceConverted = sourceLeads.filter(lead => lead.status === 'won').length;
    conversionsBySource[source] = {
      total: sourceLeads.length,
      converted: sourceConverted,
      rate: sourceLeads.length > 0 ? (sourceConverted / sourceLeads.length) * 100 : 0
    };
  });

  // Conversion by assignee
  const conversionsByAssignee = {};
  const assigneeGroups = groupBy(filteredLeads, 'assignedTo');
  
  Object.keys(assigneeGroups).forEach(assignee => {
    if (assignee && assignee !== 'undefined') {
      const assigneeLeads = assigneeGroups[assignee];
      const assigneeConverted = assigneeLeads.filter(lead => lead.status === 'won').length;
      conversionsByAssignee[assignee] = {
        total: assigneeLeads.length,
        converted: assigneeConverted,
        rate: assigneeLeads.length > 0 ? (assigneeConverted / assigneeLeads.length) * 100 : 0
      };
    }
  });

  // Calculate trend (compare with previous period)
  let trend = null;
  if (options.timeframe && options.timeframe !== '90d') {
    const previousPeriodLeads = getPreviousPeriodLeads(leads, options.timeframe);
    const previousConversionRate = calculateLeadConversionRate(previousPeriodLeads).conversionRate;
    trend = conversionRate - previousConversionRate;
  }

  return {
    totalLeads,
    convertedLeads,
    conversionRate: Math.round(conversionRate * 100) / 100, // Round to 2 decimal places
    breakdown: statusCounts,
    conversionsBySource,
    conversionsByAssignee,
    trend: trend ? Math.round(trend * 100) / 100 : null,
    timeframe: options.timeframe || 'all-time'
  };
};

/**
 * Calculate Sales Velocity
 * @param {Array} deals - Array of deals
 * @param {Array} leads - Array of leads (for win rate calculation)
 * @param {Object} options - Filter options
 * @returns {Object} Sales velocity data
 */
export const calculateSalesVelocity = (deals, leads = [], options = {}) => {
  if (!deals || deals.length === 0) {
    return {
      salesVelocity: 0,
      components: {
        numberOfDeals: 0,
        averageDealValue: 0,
        winRate: 0,
        averageSalesCycle: 0
      },
      formattedVelocity: '$0 per day',
      monthlyVelocity: 0,
      yearlyVelocity: 0,
      breakdown: {
        byStage: {},
        byAssignee: {},
        byTimeframe: {}
      }
    };
  }

  // Apply filters
  let filteredDeals = [...deals];
  let filteredLeads = [...leads];

  if (options.timeframe) {
    const cutoffDate = getTimeframeCutoff(options.timeframe);
    filteredDeals = filteredDeals.filter(deal => 
      new Date(deal.createdAt) >= cutoffDate
    );
    filteredLeads = filteredLeads.filter(lead => 
      new Date(lead.createdAt) >= cutoffDate
    );
  }

  if (options.assignee && options.assignee !== 'all') {
    filteredDeals = filteredDeals.filter(deal => deal.assigneeId === options.assignee);
    filteredLeads = filteredLeads.filter(lead => lead.assignedTo === options.assignee);
  }

  // Calculate components
  const numberOfDeals = filteredDeals.length;
  
  // Average deal value
  const totalDealValue = filteredDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  const averageDealValue = numberOfDeals > 0 ? totalDealValue / numberOfDeals : 0;

  // Win rate (from leads data or deals data)
  let winRate = 0;
  if (filteredLeads.length > 0) {
    const wonLeads = filteredLeads.filter(lead => lead.status === 'won').length;
    winRate = wonLeads / filteredLeads.length;
  } else {
    // Fallback: calculate from deals data
    const closedDeals = filteredDeals.filter(deal => 
      deal.stage === 'closed-won' || deal.stage === 'closed-lost'
    );
    const wonDeals = filteredDeals.filter(deal => deal.stage === 'closed-won');
    winRate = closedDeals.length > 0 ? wonDeals.length / closedDeals.length : 0;
  }

  // Average sales cycle length (in days)
  const averageSalesCycle = calculateAverageSalesCycle(filteredDeals);

  // Sales Velocity Formula: (Number of deals × Average deal value × Win rate) / Average sales cycle length
  const salesVelocity = averageSalesCycle > 0 
    ? (numberOfDeals * averageDealValue * winRate) / averageSalesCycle 
    : 0;

  // Breakdown by stage
  const stageGroups = groupBy(filteredDeals, 'stage');
  const breakdownByStage = {};
  
  Object.keys(stageGroups).forEach(stage => {
    const stageDeals = stageGroups[stage];
    const stageValue = stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    const stageCycle = calculateAverageSalesCycle(stageDeals);
    
    breakdownByStage[stage] = {
      deals: stageDeals.length,
      totalValue: stageValue,
      averageValue: stageDeals.length > 0 ? stageValue / stageDeals.length : 0,
      averageCycle: stageCycle,
      velocity: stageCycle > 0 ? (stageDeals.length * (stageValue / stageDeals.length) * winRate) / stageCycle : 0
    };
  });

  // Breakdown by assignee
  const assigneeGroups = groupBy(filteredDeals, 'assigneeId');
  const breakdownByAssignee = {};
  
  Object.keys(assigneeGroups).forEach(assignee => {
    if (assignee && assignee !== 'undefined') {
      const assigneeDeals = assigneeGroups[assignee];
      const assigneeValue = assigneeDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
      const assigneeCycle = calculateAverageSalesCycle(assigneeDeals);
      
      breakdownByAssignee[assignee] = {
        deals: assigneeDeals.length,
        totalValue: assigneeValue,
        averageValue: assigneeDeals.length > 0 ? assigneeValue / assigneeDeals.length : 0,
        averageCycle: assigneeCycle,
        velocity: assigneeCycle > 0 ? (assigneeDeals.length * (assigneeValue / assigneeDeals.length) * winRate) / assigneeCycle : 0
      };
    }
  });

  return {
    salesVelocity: Math.round(salesVelocity * 100) / 100,
    components: {
      numberOfDeals,
      averageDealValue: Math.round(averageDealValue * 100) / 100,
      winRate: Math.round(winRate * 10000) / 100, // Convert to percentage with 2 decimals
      averageSalesCycle: Math.round(averageSalesCycle * 100) / 100
    },
    formattedVelocity: `$${Math.round(salesVelocity).toLocaleString()} per day`,
    monthlyVelocity: Math.round(salesVelocity * 30),
    yearlyVelocity: Math.round(salesVelocity * 365),
    breakdown: {
      byStage: breakdownByStage,
      byAssignee: breakdownByAssignee,
      byTimeframe: options.timeframe || 'all-time'
    }
  };
};

/**
 * Calculate average sales cycle length from deals
 * @param {Array} deals - Array of deals
 * @returns {number} Average cycle length in days
 */
export const calculateAverageSalesCycle = (deals) => {
  if (!deals || deals.length === 0) return 0;

  const closedDeals = deals.filter(deal => 
    (deal.stage === 'closed-won' || deal.stage === 'closed-lost') && 
    deal.createdAt && deal.updatedAt
  );

  if (closedDeals.length === 0) {
    // If no closed deals, estimate based on current deal ages
    const currentTime = new Date();
    const totalDays = deals.reduce((sum, deal) => {
      const dealAge = (currentTime - new Date(deal.createdAt)) / (1000 * 60 * 60 * 24);
      return sum + dealAge;
    }, 0);
    return deals.length > 0 ? totalDays / deals.length : 30; // Default to 30 days
  }

  const totalCycleDays = closedDeals.reduce((sum, deal) => {
    const cycleLength = (new Date(deal.updatedAt) - new Date(deal.createdAt)) / (1000 * 60 * 60 * 24);
    return sum + cycleLength;
  }, 0);

  return totalCycleDays / closedDeals.length;
};

/**
 * Get conversion rate performance category
 * @param {number} conversionRate - Conversion rate percentage
 * @returns {Object} Category and color information
 */
export const getConversionRateCategory = (conversionRate) => {
  if (conversionRate >= 25) {
    return { category: 'excellent', label: 'Excellent', color: 'text-green-600 bg-green-50' };
  } else if (conversionRate >= 15) {
    return { category: 'good', label: 'Good', color: 'text-blue-600 bg-blue-50' };
  } else if (conversionRate >= 10) {
    return { category: 'fair', label: 'Fair', color: 'text-yellow-600 bg-yellow-50' };
  } else if (conversionRate >= 5) {
    return { category: 'poor', label: 'Poor', color: 'text-orange-600 bg-orange-50' };
  } else {
    return { category: 'very-poor', label: 'Needs Improvement', color: 'text-red-600 bg-red-50' };
  }
};

/**
 * Get sales velocity performance category
 * @param {number} velocity - Daily sales velocity
 * @returns {Object} Category and color information
 */
export const getSalesVelocityCategory = (velocity) => {
  if (velocity >= 1000) {
    return { category: 'excellent', label: 'Excellent', color: 'text-green-600 bg-green-50' };
  } else if (velocity >= 500) {
    return { category: 'good', label: 'Good', color: 'text-blue-600 bg-blue-50' };
  } else if (velocity >= 200) {
    return { category: 'fair', label: 'Fair', color: 'text-yellow-600 bg-yellow-50' };
  } else if (velocity >= 50) {
    return { category: 'poor', label: 'Poor', color: 'text-orange-600 bg-orange-50' };
  } else {
    return { category: 'very-poor', label: 'Needs Improvement', color: 'text-red-600 bg-red-50' };
  }
};

/**
 * Calculate funnel metrics (conversion between stages)
 * @param {Array} leads - Array of leads
 * @returns {Object} Funnel conversion data
 */
export const calculateFunnelMetrics = (leads) => {
  if (!leads || leads.length === 0) {
    return {
      stages: [],
      conversions: [],
      dropoffRates: []
    };
  }

  const stageCounts = {
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    in_progress: leads.filter(l => l.status === 'in_progress').length,
    won: leads.filter(l => l.status === 'won').length,
    lost: leads.filter(l => l.status === 'lost').length
  };

  const stages = [
    { name: 'New Leads', count: stageCounts.new, color: 'bg-gray-500' },
    { name: 'Contacted', count: stageCounts.contacted, color: 'bg-blue-500' },
    { name: 'In Progress', count: stageCounts.in_progress, color: 'bg-yellow-500' },
    { name: 'Won', count: stageCounts.won, color: 'bg-green-500' },
    { name: 'Lost', count: stageCounts.lost, color: 'bg-red-500' }
  ];

  const conversions = [];
  const dropoffRates = [];

  // Calculate conversion rates between stages
  if (stageCounts.new > 0) {
    const contactedRate = (stageCounts.contacted / stageCounts.new) * 100;
    conversions.push({ from: 'New', to: 'Contacted', rate: contactedRate });
  }

  if (stageCounts.contacted > 0) {
    const progressRate = (stageCounts.in_progress / stageCounts.contacted) * 100;
    conversions.push({ from: 'Contacted', to: 'In Progress', rate: progressRate });
  }

  if (stageCounts.in_progress > 0) {
    const winRate = (stageCounts.won / stageCounts.in_progress) * 100;
    conversions.push({ from: 'In Progress', to: 'Won', rate: winRate });
  }

  return {
    stages,
    conversions,
    totalLeads: leads.length,
    overallConversion: leads.length > 0 ? (stageCounts.won / leads.length) * 100 : 0
  };
};

// Helper functions
const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {});
};

const getTimeframeCutoff = (timeframe) => {
  const now = new Date();
  const timeframes = {
    '1d': 1,
    '7d': 7,
    '30d': 30,
    '90d': 90
  };
  
  const daysBack = timeframes[timeframe] || 30;
  return new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
};

const getPreviousPeriodLeads = (leads, timeframe) => {
  const now = new Date();
  const timeframes = {
    '1d': 1,
    '7d': 7,
    '30d': 30,
    '90d': 90
  };
  
  const daysBack = timeframes[timeframe] || 30;
  const previousStart = new Date(now.getTime() - (daysBack * 2 * 24 * 60 * 60 * 1000));
  const previousEnd = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
  
  return leads.filter(lead => {
    const leadDate = new Date(lead.createdAt);
    return leadDate >= previousStart && leadDate < previousEnd;
  });
};

export default {
  calculateLeadConversionRate,
  calculateSalesVelocity,
  calculateAverageSalesCycle,
  getConversionRateCategory,
  getSalesVelocityCategory,
  calculateFunnelMetrics
};