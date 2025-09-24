/**
 * Deal Closure Time and Activity per Rep Metrics Utilities for SalesTracker
 * Handles calculations for Deal Closure Time and Activity per Rep metrics
 */

/**
 * Calculate deal closure time metrics
 * @param {Array} deals - Array of deals
 * @param {Object} options - Filter options (timeframe, assignee, stage, etc.)
 * @returns {Object} Deal closure time data and analysis
 */
export const calculateDealClosureTime = (deals, options = {}) => {
  if (!deals || deals.length === 0) {
    return {
      averageClosureTime: 0,
      totalDeals: 0,
      closedDeals: 0,
      fastestDeal: null,
      slowestDeal: null,
      closureDistribution: {},
      byStage: {},
      byAssignee: {},
      bySource: {},
      performanceCategory: { category: 'no-data', label: 'No Data', color: 'text-gray-600 bg-gray-50' },
      formattedAverageTime: '0 days',
      timeframe: options.timeframe || 'all-time'
    };
  }

  // Apply filters
  let filteredDeals = [...deals];
  
  if (options.timeframe) {
    const cutoffDate = getTimeframeCutoff(options.timeframe);
    filteredDeals = filteredDeals.filter(deal => 
      new Date(deal.createdAt) >= cutoffDate
    );
  }

  if (options.assignee && options.assignee !== 'all') {
    filteredDeals = filteredDeals.filter(deal => deal.assigneeId === options.assignee);
  }

  if (options.source && options.source !== 'all') {
    filteredDeals = filteredDeals.filter(deal => deal.source === options.source);
  }

  // Only consider closed deals (won or lost)
  const closedDeals = filteredDeals.filter(deal => 
    (deal.stage === 'closed-won' || deal.stage === 'closed-lost') &&
    deal.createdAt && deal.updatedAt
  );

  if (closedDeals.length === 0) {
    return {
      averageClosureTime: 0,
      totalDeals: filteredDeals.length,
      closedDeals: 0,
      fastestDeal: null,
      slowestDeal: null,
      closureDistribution: {},
      byStage: {},
      byAssignee: {},
      bySource: {},
      performanceCategory: { category: 'no-data', label: 'No Data', color: 'text-gray-600 bg-gray-50' },
      formattedAverageTime: '0 days',
      timeframe: options.timeframe || 'all-time'
    };
  }

  // Calculate closure times for each deal
  const dealsWithClosureTime = closedDeals.map(deal => {
    const createdDate = new Date(deal.createdAt);
    const closedDate = new Date(deal.updatedAt);
    const closureTimeDays = Math.floor((closedDate - createdDate) / (1000 * 60 * 60 * 24));
    
    return {
      ...deal,
      closureTimeDays,
      closureTimeFormatted: formatDuration(closureTimeDays)
    };
  });

  // Calculate average closure time
  const totalClosureTime = dealsWithClosureTime.reduce((sum, deal) => sum + deal.closureTimeDays, 0);
  const averageClosureTime = totalClosureTime / dealsWithClosureTime.length;

  // Find fastest and slowest deals
  const sortedByTime = [...dealsWithClosureTime].sort((a, b) => a.closureTimeDays - b.closureTimeDays);
  const fastestDeal = sortedByTime[0];
  const slowestDeal = sortedByTime[sortedByTime.length - 1];

  // Closure time distribution
  const closureDistribution = {
    '0-7': dealsWithClosureTime.filter(deal => deal.closureTimeDays <= 7).length,
    '8-14': dealsWithClosureTime.filter(deal => deal.closureTimeDays > 7 && deal.closureTimeDays <= 14).length,
    '15-30': dealsWithClosureTime.filter(deal => deal.closureTimeDays > 14 && deal.closureTimeDays <= 30).length,
    '31-60': dealsWithClosureTime.filter(deal => deal.closureTimeDays > 30 && deal.closureTimeDays <= 60).length,
    '61-90': dealsWithClosureTime.filter(deal => deal.closureTimeDays > 60 && deal.closureTimeDays <= 90).length,
    '90+': dealsWithClosureTime.filter(deal => deal.closureTimeDays > 90).length
  };

  // Breakdown by final stage (won vs lost)
  const wonDeals = dealsWithClosureTime.filter(deal => deal.stage === 'closed-won');
  const lostDeals = dealsWithClosureTime.filter(deal => deal.stage === 'closed-lost');

  const byStage = {
    'closed-won': {
      dealCount: wonDeals.length,
      averageTime: wonDeals.length > 0 ? wonDeals.reduce((sum, deal) => sum + deal.closureTimeDays, 0) / wonDeals.length : 0,
      fastestTime: wonDeals.length > 0 ? Math.min(...wonDeals.map(deal => deal.closureTimeDays)) : 0,
      slowestTime: wonDeals.length > 0 ? Math.max(...wonDeals.map(deal => deal.closureTimeDays)) : 0,
      totalValue: wonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0)
    },
    'closed-lost': {
      dealCount: lostDeals.length,
      averageTime: lostDeals.length > 0 ? lostDeals.reduce((sum, deal) => sum + deal.closureTimeDays, 0) / lostDeals.length : 0,
      fastestTime: lostDeals.length > 0 ? Math.min(...lostDeals.map(deal => deal.closureTimeDays)) : 0,
      slowestTime: lostDeals.length > 0 ? Math.max(...lostDeals.map(deal => deal.closureTimeDays)) : 0,
      totalValue: lostDeals.reduce((sum, deal) => sum + (deal.value || 0), 0)
    }
  };

  // Breakdown by assignee
  const assigneeGroups = groupBy(dealsWithClosureTime.filter(deal => deal.assigneeId), 'assigneeId');
  const byAssignee = {};
  
  Object.keys(assigneeGroups).forEach(assigneeId => {
    const assigneeDeals = assigneeGroups[assigneeId];
    const avgTime = assigneeDeals.reduce((sum, deal) => sum + deal.closureTimeDays, 0) / assigneeDeals.length;
    const wonDealsCount = assigneeDeals.filter(deal => deal.stage === 'closed-won').length;
    
    byAssignee[assigneeId] = {
      dealCount: assigneeDeals.length,
      averageTime: Math.round(avgTime * 100) / 100,
      fastestTime: Math.min(...assigneeDeals.map(deal => deal.closureTimeDays)),
      slowestTime: Math.max(...assigneeDeals.map(deal => deal.closureTimeDays)),
      winRate: (wonDealsCount / assigneeDeals.length) * 100,
      totalValue: assigneeDeals.filter(deal => deal.stage === 'closed-won').reduce((sum, deal) => sum + (deal.value || 0), 0),
      performanceCategory: getClosureTimeCategory(avgTime)
    };
  });

  // Breakdown by source
  const sourceGroups = groupBy(dealsWithClosureTime.filter(deal => deal.source), 'source');
  const bySource = {};
  
  Object.keys(sourceGroups).forEach(source => {
    const sourceDeals = sourceGroups[source];
    const avgTime = sourceDeals.reduce((sum, deal) => sum + deal.closureTimeDays, 0) / sourceDeals.length;
    const wonDealsCount = sourceDeals.filter(deal => deal.stage === 'closed-won').length;
    
    bySource[source] = {
      dealCount: sourceDeals.length,
      averageTime: Math.round(avgTime * 100) / 100,
      winRate: (wonDealsCount / sourceDeals.length) * 100,
      totalValue: sourceDeals.filter(deal => deal.stage === 'closed-won').reduce((sum, deal) => sum + (deal.value || 0), 0)
    };
  });

  // Performance insights
  const insights = [];
  
  // Long closure times insight
  if (averageClosureTime > 60) {
    insights.push({
      type: 'long_closure',
      priority: 'high',
      title: 'Long Deal Closure Times',
      description: `Average closure time (${Math.round(averageClosureTime)} days) exceeds industry average of 30-45 days`,
      recommendation: 'Review deal qualification process and identify bottlenecks'
    });
  }

  // Won vs Lost timing comparison
  if (byStage['closed-won'].averageTime > byStage['closed-lost'].averageTime * 1.5) {
    insights.push({
      type: 'won_slower',
      priority: 'medium',
      title: 'Won deals take longer to close',
      description: `Won deals average ${Math.round(byStage['closed-won'].averageTime)} days vs ${Math.round(byStage['closed-lost'].averageTime)} days for lost deals`,
      recommendation: 'Analyze negotiation and decision-making processes for improvements'
    });
  }

  return {
    averageClosureTime: Math.round(averageClosureTime * 100) / 100,
    totalDeals: filteredDeals.length,
    closedDeals: closedDeals.length,
    fastestDeal: fastestDeal ? {
      id: fastestDeal.id,
      name: fastestDeal.name || fastestDeal.company,
      closureTime: fastestDeal.closureTimeDays,
      value: fastestDeal.value,
      stage: fastestDeal.stage
    } : null,
    slowestDeal: slowestDeal ? {
      id: slowestDeal.id,
      name: slowestDeal.name || slowestDeal.company,
      closureTime: slowestDeal.closureTimeDays,
      value: slowestDeal.value,
      stage: slowestDeal.stage
    } : null,
    closureDistribution,
    byStage,
    byAssignee,
    bySource,
    insights,
    performanceCategory: getClosureTimeCategory(averageClosureTime),
    formattedAverageTime: formatDuration(averageClosureTime),
    timeframe: options.timeframe || 'all-time'
  };
};

/**
 * Calculate activity per rep metrics
 * @param {Array} leads - Array of leads with activities
 * @param {Array} deals - Array of deals with activities  
 * @param {Object} options - Filter options
 * @returns {Object} Activity per rep analysis
 */
export const calculateActivityPerRep = (leads = [], deals = [], options = {}) => {
  if ((!leads || leads.length === 0) && (!deals || deals.length === 0)) {
    return {
      totalActivities: 0,
      totalReps: 0,
      averageActivitiesPerRep: 0,
      activityDistribution: {},
      byRep: {},
      byActivityType: {},
      byTimeframe: {},
      topPerformers: [],
      formattedAverage: '0 activities per rep',
      timeframe: options.timeframe || 'all-time'
    };
  }

  // Combine activities from leads and deals
  const allActivities = [];
  const allEntities = [...(leads || []), ...(deals || [])];
  
  // Apply timeframe filter
  let timeframeCutoff = null;
  if (options.timeframe) {
    timeframeCutoff = getTimeframeCutoff(options.timeframe);
  }

  // Extract all activities with assignee information
  allEntities.forEach(entity => {
    if (entity.activities && entity.activities.length > 0) {
      entity.activities.forEach(activity => {
        // Apply timeframe filter to activities
        if (timeframeCutoff && new Date(activity.createdAt) < timeframeCutoff) {
          return;
        }

        // Apply assignee filter
        if (options.assignee && options.assignee !== 'all' && 
            entity.assignedTo !== options.assignee && entity.assigneeId !== options.assignee) {
          return;
        }

        allActivities.push({
          ...activity,
          assigneeId: entity.assignedTo || entity.assigneeId,
          entityType: entity.company ? 'lead' : 'deal',
          entityId: entity.id
        });
      });
    }
  });

  if (allActivities.length === 0) {
    return {
      totalActivities: 0,
      totalReps: 0,
      averageActivitiesPerRep: 0,
      activityDistribution: {},
      byRep: {},
      byActivityType: {},
      byTimeframe: {},
      topPerformers: [],
      formattedAverage: '0 activities per rep',
      timeframe: options.timeframe || 'all-time'
    };
  }

  // Group activities by assignee
  const activitiesByRep = groupBy(allActivities.filter(activity => activity.assigneeId), 'assigneeId');
  const totalReps = Object.keys(activitiesByRep).length;
  const totalActivities = allActivities.length;
  const averageActivitiesPerRep = totalReps > 0 ? totalActivities / totalReps : 0;

  // Activity distribution by count ranges
  const repActivityCounts = Object.values(activitiesByRep).map(activities => activities.length);
  const activityDistribution = {
    '0-10': repActivityCounts.filter(count => count <= 10).length,
    '11-25': repActivityCounts.filter(count => count > 10 && count <= 25).length,
    '26-50': repActivityCounts.filter(count => count > 25 && count <= 50).length,
    '51-100': repActivityCounts.filter(count => count > 50 && count <= 100).length,
    '100+': repActivityCounts.filter(count => count > 100).length
  };

  // Detailed breakdown by rep
  const byRep = {};
  Object.keys(activitiesByRep).forEach(repId => {
    const repActivities = activitiesByRep[repId];
    
    // Count by activity type
    const activityTypeCounts = {};
    const activityTypes = ['Call', 'Email', 'Meeting', 'WhatsApp', 'LinkedIn', 'SMS', 'Note', 'Task'];
    
    activityTypes.forEach(type => {
      activityTypeCounts[type] = repActivities.filter(activity => activity.type === type).length;
    });

    // Calculate activity rate (activities per day/week)
    const timeframeDays = getTimeframeDays(options.timeframe);
    const activitiesPerDay = timeframeDays > 0 ? repActivities.length / timeframeDays : 0;
    const activitiesPerWeek = activitiesPerDay * 7;

    byRep[repId] = {
      totalActivities: repActivities.length,
      activitiesPerDay: Math.round(activitiesPerDay * 100) / 100,
      activitiesPerWeek: Math.round(activitiesPerWeek * 100) / 100,
      activityTypes: activityTypeCounts,
      leadActivities: repActivities.filter(activity => activity.entityType === 'lead').length,
      dealActivities: repActivities.filter(activity => activity.entityType === 'deal').length,
      performanceCategory: getActivityPerformanceCategory(repActivities.length, averageActivitiesPerRep),
      rank: 0 // Will be calculated after all reps
    };
  });

  // Rank reps by activity count
  const sortedReps = Object.entries(byRep)
    .sort(([,a], [,b]) => b.totalActivities - a.totalActivities)
    .map(([repId, data], index) => {
      byRep[repId].rank = index + 1;
      return { repId, ...data };
    });

  // Top performers (top 3)
  const topPerformers = sortedReps.slice(0, 3).map(rep => ({
    repId: rep.repId,
    totalActivities: rep.totalActivities,
    activitiesPerWeek: rep.activitiesPerWeek,
    rank: rep.rank
  }));

  // Activity breakdown by type across all reps
  const byActivityType = {};
  const activityTypes = ['Call', 'Email', 'Meeting', 'WhatsApp', 'LinkedIn', 'SMS', 'Note', 'Task'];
  
  activityTypes.forEach(type => {
    const typeActivities = allActivities.filter(activity => activity.type === type);
    const typeReps = new Set(typeActivities.map(activity => activity.assigneeId)).size;
    
    byActivityType[type] = {
      totalCount: typeActivities.length,
      averagePerRep: typeReps > 0 ? typeActivities.length / typeReps : 0,
      percentage: totalActivities > 0 ? (typeActivities.length / totalActivities) * 100 : 0,
      repsUsingType: typeReps
    };
  });

  // Time-based breakdown (if timeframe allows)
  const byTimeframe = {};
  if (options.timeframe && options.timeframe !== 'all') {
    const timeframes = ['7d', '30d', '90d'];
    timeframes.forEach(period => {
      if (period !== options.timeframe) {
        const periodCutoff = getTimeframeCutoff(period);
        const periodActivities = allActivities.filter(activity => 
          new Date(activity.createdAt) >= periodCutoff
        );
        const periodReps = new Set(periodActivities.map(activity => activity.assigneeId)).size;
        
        byTimeframe[period] = {
          totalActivities: periodActivities.length,
          averagePerRep: periodReps > 0 ? periodActivities.length / periodReps : 0,
          repsActive: periodReps
        };
      }
    });
  }

  // Generate insights
  const insights = [];
  
  // Low activity insight
  if (averageActivitiesPerRep < 20) {
    insights.push({
      type: 'low_activity',
      priority: 'medium',
      title: 'Low Activity Levels',
      description: `Average of ${Math.round(averageActivitiesPerRep)} activities per rep is below recommended minimum of 20-30`,
      recommendation: 'Implement activity goals and daily/weekly tracking'
    });
  }

  // Activity distribution insight
  const lowActivityReps = repActivityCounts.filter(count => count <= 10).length;
  if (lowActivityReps > totalReps * 0.3) {
    insights.push({
      type: 'activity_distribution',
      priority: 'high',
      title: 'Uneven Activity Distribution',
      description: `${lowActivityReps} reps (${Math.round((lowActivityReps/totalReps)*100)}%) have very low activity levels (≤10 activities)`,
      recommendation: 'Provide coaching and support for low-activity reps'
    });
  }

  return {
    totalActivities,
    totalReps,
    averageActivitiesPerRep: Math.round(averageActivitiesPerRep * 100) / 100,
    activityDistribution,
    byRep,
    byActivityType,
    byTimeframe,
    topPerformers,
    insights,
    formattedAverage: `${Math.round(averageActivitiesPerRep * 10) / 10} activities per rep`,
    timeframe: options.timeframe || 'all-time'
  };
};

/**
 * Get deal closure time performance category
 * @param {number} days - Number of days to close
 * @returns {Object} Category and color information
 */
export const getClosureTimeCategory = (days) => {
  if (days <= 14) {
    return { category: 'excellent', label: 'Excellent', color: 'text-green-600 bg-green-50' };
  } else if (days <= 30) {
    return { category: 'good', label: 'Good', color: 'text-blue-600 bg-blue-50' };
  } else if (days <= 60) {
    return { category: 'fair', label: 'Fair', color: 'text-yellow-600 bg-yellow-50' };
  } else if (days <= 90) {
    return { category: 'poor', label: 'Poor', color: 'text-orange-600 bg-orange-50' };
  } else {
    return { category: 'very-poor', label: 'Needs Improvement', color: 'text-red-600 bg-red-50' };
  }
};

/**
 * Get activity performance category
 * @param {number} activityCount - Rep's activity count
 * @param {number} average - Average activity count
 * @returns {Object} Category and color information
 */
export const getActivityPerformanceCategory = (activityCount, average) => {
  const ratio = average > 0 ? activityCount / average : 0;
  
  if (ratio >= 1.5) {
    return { category: 'excellent', label: 'High Performer', color: 'text-green-600 bg-green-50' };
  } else if (ratio >= 1.2) {
    return { category: 'good', label: 'Above Average', color: 'text-blue-600 bg-blue-50' };
  } else if (ratio >= 0.8) {
    return { category: 'average', label: 'Average', color: 'text-gray-600 bg-gray-50' };
  } else if (ratio >= 0.5) {
    return { category: 'below-average', label: 'Below Average', color: 'text-orange-600 bg-orange-50' };
  } else {
    return { category: 'low', label: 'Low Activity', color: 'text-red-600 bg-red-50' };
  }
};

/**
 * Format duration in days
 * @param {number} days - Number of days
 * @returns {string} Formatted duration
 */
export const formatDuration = (days) => {
  if (days === 0) return '0 days';
  if (days < 1) return 'Less than 1 day';
  if (days === 1) return '1 day';
  if (days < 7) return `${Math.round(days)} days`;
  if (days < 14) return `${Math.round(days)} days (${Math.round(days/7 * 10)/10} weeks)`;
  if (days < 30) return `${Math.round(days)} days (${Math.round(days/7)} weeks)`;
  if (days < 60) return `${Math.round(days)} days (${Math.round(days/30)} month)`;
  return `${Math.round(days)} days (${Math.round(days/30 * 10)/10} months)`;
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
    '90d': 90,
    '6m': 180,
    '1y': 365
  };
  
  const daysBack = timeframes[timeframe] || 30;
  return new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
};

const getTimeframeDays = (timeframe) => {
  const timeframes = {
    '1d': 1,
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '6m': 180,
    '1y': 365
  };
  
  return timeframes[timeframe] || 30;
};

export default {
  calculateDealClosureTime,
  calculateActivityPerRep,
  getClosureTimeCategory,
  getActivityPerformanceCategory,
  formatDuration
};