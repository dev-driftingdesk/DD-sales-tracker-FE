/**
 * Revenue and Engagement Metrics Utilities for SalesTracker
 * Handles calculations for Monthly Revenue per Rep, Lead Re-engagement Rate, 
 * Stale Leads, and Drop-off Rate by Stage metrics
 */

/**
 * Calculate monthly revenue per rep metrics
 * @param {Array} deals - Array of deals
 * @param {Array} leads - Array of leads  
 * @param {Object} options - Filter options (timeframe, assignee, etc.)
 * @returns {Object} Monthly revenue per rep data and analysis
 */
export const calculateMonthlyRevenuePerRep = (deals = [], leads = [], options = {}) => {
  if ((!deals || deals.length === 0) && (!leads || leads.length === 0)) {
    return {
      totalRevenue: 0,
      totalReps: 0,
      averageRevenuePerRep: 0,
      revenueDistribution: {},
      byRep: {},
      byMonth: {},
      topPerformers: [],
      formattedAverage: '$0 per rep per month',
      timeframe: options.timeframe || 'all-time'
    };
  }

  // Combine revenue sources from both deals and leads
  const allRevenueItems = [];
  const currentDate = new Date();
  
  // Apply timeframe filter
  let timeframeCutoff = null;
  if (options.timeframe) {
    timeframeCutoff = getTimeframeCutoff(options.timeframe);
  }

  // Process deals (primary revenue source)
  if (deals && deals.length > 0) {
    deals.forEach(deal => {
      if (deal.stage === 'closed-won' && deal.updatedAt && deal.value > 0) {
        const closedDate = new Date(deal.updatedAt);
        
        // Apply timeframe filter
        if (timeframeCutoff && closedDate < timeframeCutoff) {
          return;
        }

        // Apply assignee filter
        if (options.assignee && options.assignee !== 'all' && 
            deal.assigneeId !== options.assignee) {
          return;
        }

        allRevenueItems.push({
          id: deal.id,
          assigneeId: deal.assigneeId,
          value: deal.value || 0,
          closedDate,
          month: `${closedDate.getFullYear()}-${String(closedDate.getMonth() + 1).padStart(2, '0')}`,
          source: 'deal',
          entityType: 'deal'
        });
      }
    });
  }

  // Process leads (converted leads with closed value)
  if (leads && leads.length > 0) {
    leads.forEach(lead => {
      if (lead.status === 'won' && lead.closedDate && lead.closedValue > 0) {
        const closedDate = new Date(lead.closedDate);
        
        // Apply timeframe filter
        if (timeframeCutoff && closedDate < timeframeCutoff) {
          return;
        }

        // Apply assignee filter
        if (options.assignee && options.assignee !== 'all' && 
            lead.assignedTo !== options.assignee) {
          return;
        }

        allRevenueItems.push({
          id: lead.id,
          assigneeId: lead.assignedTo,
          value: lead.closedValue || 0,
          closedDate,
          month: `${closedDate.getFullYear()}-${String(closedDate.getMonth() + 1).padStart(2, '0')}`,
          source: 'lead',
          entityType: 'lead'
        });
      }
    });
  }

  if (allRevenueItems.length === 0) {
    return {
      totalRevenue: 0,
      totalReps: 0,
      averageRevenuePerRep: 0,
      revenueDistribution: {},
      byRep: {},
      byMonth: {},
      topPerformers: [],
      formattedAverage: '$0 per rep per month',
      timeframe: options.timeframe || 'all-time'
    };
  }

  // Calculate total metrics
  const totalRevenue = allRevenueItems.reduce((sum, item) => sum + item.value, 0);
  const uniqueReps = new Set(allRevenueItems.map(item => item.assigneeId));
  const totalReps = uniqueReps.size;
  const uniqueMonths = new Set(allRevenueItems.map(item => item.month));
  const monthCount = uniqueMonths.size || 1;
  
  const averageRevenuePerRep = totalReps > 0 ? totalRevenue / (totalReps * monthCount) : 0;

  // Group by rep
  const revenueByRep = groupBy(allRevenueItems.filter(item => item.assigneeId), 'assigneeId');
  const byRep = {};

  Object.keys(revenueByRep).forEach(repId => {
    const repItems = revenueByRep[repId];
    const repRevenue = repItems.reduce((sum, item) => sum + item.value, 0);
    const repMonths = new Set(repItems.map(item => item.month));
    const repMonthCount = repMonths.size;
    const monthlyAverage = repMonthCount > 0 ? repRevenue / repMonthCount : 0;
    
    byRep[repId] = {
      totalRevenue: repRevenue,
      monthlyAverage: Math.round(monthlyAverage * 100) / 100,
      dealCount: repItems.length,
      monthsActive: repMonthCount,
      performanceCategory: getRevenuePerformanceCategory(monthlyAverage, averageRevenuePerRep),
      months: Array.from(repMonths).sort(),
      rank: 0 // Will be calculated after all reps
    };
  });

  // Rank reps by monthly average revenue
  const sortedReps = Object.entries(byRep)
    .sort(([,a], [,b]) => b.monthlyAverage - a.monthlyAverage)
    .map(([repId, data], index) => {
      byRep[repId].rank = index + 1;
      return { repId, ...data };
    });

  // Top performers (top 5)
  const topPerformers = sortedReps.slice(0, 5).map(rep => ({
    repId: rep.repId,
    monthlyAverage: rep.monthlyAverage,
    totalRevenue: rep.totalRevenue,
    dealCount: rep.dealCount,
    rank: rep.rank
  }));

  // Revenue distribution by monthly ranges
  const monthlyAverages = Object.values(byRep).map(rep => rep.monthlyAverage);
  const revenueDistribution = {
    '0-5k': monthlyAverages.filter(avg => avg <= 5000).length,
    '5k-15k': monthlyAverages.filter(avg => avg > 5000 && avg <= 15000).length,
    '15k-30k': monthlyAverages.filter(avg => avg > 15000 && avg <= 30000).length,
    '30k-50k': monthlyAverages.filter(avg => avg > 30000 && avg <= 50000).length,
    '50k+': monthlyAverages.filter(avg => avg > 50000).length
  };

  // Monthly breakdown
  const monthlyGroups = groupBy(allRevenueItems, 'month');
  const byMonth = {};
  
  Object.keys(monthlyGroups).forEach(month => {
    const monthItems = monthlyGroups[month];
    const monthRevenue = monthItems.reduce((sum, item) => sum + item.value, 0);
    const monthReps = new Set(monthItems.map(item => item.assigneeId)).size;
    const avgPerRep = monthReps > 0 ? monthRevenue / monthReps : 0;
    
    byMonth[month] = {
      totalRevenue: monthRevenue,
      averagePerRep: Math.round(avgPerRep * 100) / 100,
      dealCount: monthItems.length,
      activeReps: monthReps
    };
  });

  // Generate insights
  const insights = [];
  
  // Low revenue insight
  if (averageRevenuePerRep < 10000) {
    insights.push({
      type: 'low_revenue',
      priority: 'high',
      title: 'Low Monthly Revenue per Rep',
      description: `Average monthly revenue per rep ($${Math.round(averageRevenuePerRep).toLocaleString()}) is below target range of $10,000-$20,000`,
      recommendation: 'Focus on deal size improvement and closing rate optimization'
    });
  }

  // Revenue distribution insight
  const lowRevenueReps = monthlyAverages.filter(avg => avg <= 5000).length;
  if (lowRevenueReps > totalReps * 0.3) {
    insights.push({
      type: 'revenue_distribution',
      priority: 'medium',
      title: 'Uneven Revenue Distribution',
      description: `${lowRevenueReps} reps (${Math.round((lowRevenueReps/totalReps)*100)}%) generate less than $5k monthly`,
      recommendation: 'Provide coaching and support for underperforming reps'
    });
  }

  // Top performer insight
  if (topPerformers.length > 0 && topPerformers[0].monthlyAverage > averageRevenuePerRep * 2) {
    insights.push({
      type: 'top_performer',
      priority: 'low',
      title: 'High-Performing Rep Identified',
      description: `Top performer generates ${Math.round((topPerformers[0].monthlyAverage / averageRevenuePerRep) * 100)}% more than average`,
      recommendation: 'Study and replicate top performer strategies across team'
    });
  }

  return {
    totalRevenue,
    totalReps,
    averageRevenuePerRep: Math.round(averageRevenuePerRep * 100) / 100,
    revenueDistribution,
    byRep,
    byMonth,
    topPerformers,
    insights,
    formattedAverage: `$${Math.round(averageRevenuePerRep).toLocaleString()} per rep per month`,
    timeframe: options.timeframe || 'all-time'
  };
};

/**
 * Calculate lead re-engagement rate metrics
 * @param {Array} leads - Array of leads
 * @param {Object} options - Filter options
 * @returns {Object} Lead re-engagement analysis
 */
export const calculateLeadReengagementRate = (leads = [], options = {}) => {
  if (!leads || leads.length === 0) {
    return {
      totalColdLeads: 0,
      reengagedLeads: 0,
      reengagementRate: 0,
      reengagementDistribution: {},
      byAssignee: {},
      bySource: {},
      reengagementMethods: {},
      formattedRate: '0%',
      timeframe: options.timeframe || 'all-time'
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

  if (options.assignee && options.assignee !== 'all') {
    filteredLeads = filteredLeads.filter(lead => lead.assignedTo === options.assignee);
  }

  if (options.source && options.source !== 'all') {
    filteredLeads = filteredLeads.filter(lead => lead.source === options.source);
  }

  // Identify cold leads (leads that went cold at some point)
  const coldLeads = filteredLeads.filter(lead => {
    // Check if lead has activities indicating it went cold
    if (!lead.activities || lead.activities.length === 0) return false;
    
    // Look for cold status or long gaps in activity
    const activities = lead.activities.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    let wentCold = false;
    
    // Check for explicit "cold" status changes
    const coldStatusActivity = activities.find(activity => 
      activity.type === 'status_change' && 
      (activity.metadata?.newStatus === 'cold' || activity.metadata?.oldStatus === 'cold')
    );
    
    if (coldStatusActivity) {
      wentCold = true;
    } else {
      // Check for long gaps in activity (more than 30 days)
      for (let i = 1; i < activities.length; i++) {
        const prevActivity = new Date(activities[i-1].createdAt);
        const currentActivity = new Date(activities[i].createdAt);
        const daysDifference = (currentActivity - prevActivity) / (1000 * 60 * 60 * 24);
        
        if (daysDifference > 30) {
          wentCold = true;
          break;
        }
      }
    }
    
    return wentCold;
  });

  // Identify re-engaged leads (cold leads that became active again)
  const reengagedLeads = coldLeads.filter(lead => {
    if (!lead.activities || lead.activities.length === 0) return false;
    
    const activities = lead.activities.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    // Look for re-engagement indicators
    let foundColdPeriod = false;
    let foundReengagement = false;
    let lastActivityDate = null;
    
    for (const activity of activities) {
      const activityDate = new Date(activity.createdAt);
      
      // Check for cold status
      if (activity.type === 'status_change' && activity.metadata?.newStatus === 'cold') {
        foundColdPeriod = true;
        lastActivityDate = activityDate;
        continue;
      }
      
      // Check for gap indicating cold period
      if (lastActivityDate) {
        const daysDifference = (activityDate - lastActivityDate) / (1000 * 60 * 60 * 24);
        if (daysDifference > 30) {
          foundColdPeriod = true;
        }
      }
      
      // Check for re-engagement activities after cold period
      if (foundColdPeriod && 
          (activity.type === 'call' || activity.type === 'email' || activity.type === 'meeting' ||
           (activity.type === 'status_change' && 
            ['contacted', 'qualified', 'proposal', 'negotiation'].includes(activity.metadata?.newStatus)))) {
        foundReengagement = true;
        break;
      }
      
      lastActivityDate = activityDate;
    }
    
    return foundColdPeriod && foundReengagement;
  });

  const totalColdLeads = coldLeads.length;
  const reengagedCount = reengagedLeads.length;
  const reengagementRate = totalColdLeads > 0 ? (reengagedCount / totalColdLeads) * 100 : 0;

  // Re-engagement distribution by time taken
  const reengagementDistribution = {
    '1-7 days': 0,
    '8-30 days': 0,
    '31-90 days': 0,
    '91+ days': 0
  };

  reengagedLeads.forEach(lead => {
    const activities = lead.activities.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    let coldDate = null;
    let reengagementDate = null;
    
    // Find cold and re-engagement dates
    for (const activity of activities) {
      if (activity.type === 'status_change' && activity.metadata?.newStatus === 'cold') {
        coldDate = new Date(activity.createdAt);
      } else if (coldDate && 
                 (activity.type === 'call' || activity.type === 'email' || activity.type === 'meeting')) {
        reengagementDate = new Date(activity.createdAt);
        break;
      }
    }
    
    if (coldDate && reengagementDate) {
      const daysDifference = (reengagementDate - coldDate) / (1000 * 60 * 60 * 24);
      
      if (daysDifference <= 7) {
        reengagementDistribution['1-7 days']++;
      } else if (daysDifference <= 30) {
        reengagementDistribution['8-30 days']++;
      } else if (daysDifference <= 90) {
        reengagementDistribution['31-90 days']++;
      } else {
        reengagementDistribution['91+ days']++;
      }
    }
  });

  // Breakdown by assignee
  const assigneeGroups = groupBy(coldLeads.filter(lead => lead.assignedTo), 'assignedTo');
  const byAssignee = {};
  
  Object.keys(assigneeGroups).forEach(assigneeId => {
    const assigneeColdLeads = assigneeGroups[assigneeId];
    const assigneeReengaged = assigneeColdLeads.filter(lead => 
      reengagedLeads.some(reengaged => reengaged.id === lead.id)
    );
    const assigneeRate = assigneeColdLeads.length > 0 ? 
      (assigneeReengaged.length / assigneeColdLeads.length) * 100 : 0;
    
    byAssignee[assigneeId] = {
      coldLeads: assigneeColdLeads.length,
      reengagedLeads: assigneeReengaged.length,
      reengagementRate: Math.round(assigneeRate * 100) / 100,
      performanceCategory: getReengagementPerformanceCategory(assigneeRate)
    };
  });

  // Breakdown by source
  const sourceGroups = groupBy(coldLeads.filter(lead => lead.source), 'source');
  const bySource = {};
  
  Object.keys(sourceGroups).forEach(source => {
    const sourceColdLeads = sourceGroups[source];
    const sourceReengaged = sourceColdLeads.filter(lead => 
      reengagedLeads.some(reengaged => reengaged.id === lead.id)
    );
    const sourceRate = sourceColdLeads.length > 0 ? 
      (sourceReengaged.length / sourceColdLeads.length) * 100 : 0;
    
    bySource[source] = {
      coldLeads: sourceColdLeads.length,
      reengagedLeads: sourceReengaged.length,
      reengagementRate: Math.round(sourceRate * 100) / 100
    };
  });

  // Re-engagement methods analysis
  const reengagementMethods = {
    'call': 0,
    'email': 0,
    'meeting': 0,
    'whatsapp': 0,
    'linkedin': 0,
    'sms': 0
  };

  reengagedLeads.forEach(lead => {
    const activities = lead.activities.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    let foundCold = false;
    
    for (const activity of activities) {
      if (activity.type === 'status_change' && activity.metadata?.newStatus === 'cold') {
        foundCold = true;
        continue;
      }
      
      if (foundCold && reengagementMethods.hasOwnProperty(activity.type.toLowerCase())) {
        reengagementMethods[activity.type.toLowerCase()]++;
        break;
      }
    }
  });

  // Generate insights
  const insights = [];
  
  // Low re-engagement rate insight
  if (reengagementRate < 15) {
    insights.push({
      type: 'low_reengagement',
      priority: 'high',
      title: 'Low Lead Re-engagement Rate',
      description: `Re-engagement rate (${reengagementRate.toFixed(1)}%) is below industry average of 15-25%`,
      recommendation: 'Implement systematic follow-up sequences for cold leads'
    });
  }

  // Best performing method insight
  const bestMethod = Object.entries(reengagementMethods)
    .sort(([,a], [,b]) => b - a)[0];
  
  if (bestMethod && bestMethod[1] > 0) {
    insights.push({
      type: 'best_method',
      priority: 'medium',
      title: 'Most Effective Re-engagement Method',
      description: `${bestMethod[0]} is the most successful re-engagement method (${bestMethod[1]} successes)`,
      recommendation: `Focus training on ${bestMethod[0]} techniques for re-engaging cold leads`
    });
  }

  return {
    totalColdLeads,
    reengagedLeads: reengagedCount,
    reengagementRate: Math.round(reengagementRate * 100) / 100,
    reengagementDistribution,
    byAssignee,
    bySource,
    reengagementMethods,
    insights,
    formattedRate: `${Math.round(reengagementRate * 10) / 10}%`,
    timeframe: options.timeframe || 'all-time'
  };
};

/**
 * Calculate stale leads metrics (leads with no activity for X days)
 * @param {Array} leads - Array of leads
 * @param {Object} options - Filter options (staleDays defaults to 14)
 * @returns {Object} Stale leads analysis
 */
export const calculateStaleLeads = (leads = [], options = {}) => {
  if (!leads || leads.length === 0) {
    return {
      totalLeads: 0,
      staleLeads: 0,
      staleRate: 0,
      staleDistribution: {},
      byAssignee: {},
      bySource: {},
      byStage: {},
      staleDays: options.staleDays || 14,
      formattedRate: '0%'
    };
  }

  const staleDays = options.staleDays || 14;
  const currentDate = new Date();
  const staleThreshold = new Date(currentDate.getTime() - (staleDays * 24 * 60 * 60 * 1000));

  // Apply filters
  let filteredLeads = [...leads];
  
  if (options.assignee && options.assignee !== 'all') {
    filteredLeads = filteredLeads.filter(lead => lead.assignedTo === options.assignee);
  }

  if (options.source && options.source !== 'all') {
    filteredLeads = filteredLeads.filter(lead => lead.source === options.source);
  }

  if (options.stage && options.stage !== 'all') {
    filteredLeads = filteredLeads.filter(lead => lead.status === options.stage);
  }

  // Only consider active leads (not won/lost)
  const activeLeads = filteredLeads.filter(lead => 
    !['won', 'lost', 'closed'].includes(lead.status?.toLowerCase())
  );

  // Identify stale leads
  const staleLeads = activeLeads.filter(lead => {
    // Check for recent activities
    if (!lead.activities || lead.activities.length === 0) {
      // No activities - check if created before threshold
      return new Date(lead.createdAt) < staleThreshold;
    }
    
    // Find most recent activity
    const mostRecentActivity = lead.activities
      .map(activity => new Date(activity.createdAt))
      .sort((a, b) => b - a)[0];
    
    return mostRecentActivity < staleThreshold;
  });

  const totalLeads = activeLeads.length;
  const staleCount = staleLeads.length;
  const staleRate = totalLeads > 0 ? (staleCount / totalLeads) * 100 : 0;

  // Stale distribution by days without activity
  const staleDistribution = {
    '14-30 days': 0,
    '31-60 days': 0,
    '61-90 days': 0,
    '90+ days': 0
  };

  staleLeads.forEach(lead => {
    let lastActivityDate = null;
    
    if (lead.activities && lead.activities.length > 0) {
      lastActivityDate = lead.activities
        .map(activity => new Date(activity.createdAt))
        .sort((a, b) => b - a)[0];
    } else {
      lastActivityDate = new Date(lead.createdAt);
    }
    
    const daysSinceActivity = (currentDate - lastActivityDate) / (1000 * 60 * 60 * 24);
    
    if (daysSinceActivity <= 30) {
      staleDistribution['14-30 days']++;
    } else if (daysSinceActivity <= 60) {
      staleDistribution['31-60 days']++;
    } else if (daysSinceActivity <= 90) {
      staleDistribution['61-90 days']++;
    } else {
      staleDistribution['90+ days']++;
    }
  });

  // Breakdown by assignee
  const assigneeGroups = groupBy(activeLeads.filter(lead => lead.assignedTo), 'assignedTo');
  const byAssignee = {};
  
  Object.keys(assigneeGroups).forEach(assigneeId => {
    const assigneeLeads = assigneeGroups[assigneeId];
    const assigneeStale = assigneeLeads.filter(lead => 
      staleLeads.some(stale => stale.id === lead.id)
    );
    const assigneeStaleRate = assigneeLeads.length > 0 ? 
      (assigneeStale.length / assigneeLeads.length) * 100 : 0;
    
    byAssignee[assigneeId] = {
      totalLeads: assigneeLeads.length,
      staleLeads: assigneeStale.length,
      staleRate: Math.round(assigneeStaleRate * 100) / 100,
      performanceCategory: getStaleLeadsPerformanceCategory(assigneeStaleRate)
    };
  });

  // Breakdown by source
  const sourceGroups = groupBy(activeLeads.filter(lead => lead.source), 'source');
  const bySource = {};
  
  Object.keys(sourceGroups).forEach(source => {
    const sourceLeads = sourceGroups[source];
    const sourceStale = sourceLeads.filter(lead => 
      staleLeads.some(stale => stale.id === lead.id)
    );
    const sourceStaleRate = sourceLeads.length > 0 ? 
      (sourceStale.length / sourceLeads.length) * 100 : 0;
    
    bySource[source] = {
      totalLeads: sourceLeads.length,
      staleLeads: sourceStale.length,
      staleRate: Math.round(sourceStaleRate * 100) / 100
    };
  });

  // Breakdown by stage
  const stageGroups = groupBy(activeLeads.filter(lead => lead.status), 'status');
  const byStage = {};
  
  Object.keys(stageGroups).forEach(stage => {
    const stageLeads = stageGroups[stage];
    const stageStale = stageLeads.filter(lead => 
      staleLeads.some(stale => stale.id === lead.id)
    );
    const stageStaleRate = stageLeads.length > 0 ? 
      (stageStale.length / stageLeads.length) * 100 : 0;
    
    byStage[stage] = {
      totalLeads: stageLeads.length,
      staleLeads: stageStale.length,
      staleRate: Math.round(stageStaleRate * 100) / 100
    };
  });

  // Generate insights
  const insights = [];
  
  // High stale rate insight
  if (staleRate > 30) {
    insights.push({
      type: 'high_stale_rate',
      priority: 'high',
      title: 'High Stale Lead Rate',
      description: `${staleRate.toFixed(1)}% of active leads have no activity for ${staleDays}+ days`,
      recommendation: 'Implement automated follow-up reminders and lead nurturing workflows'
    });
  }

  // Very old stale leads insight
  const veryOldStale = staleDistribution['90+ days'];
  if (veryOldStale > 0) {
    insights.push({
      type: 'very_old_stale',
      priority: 'medium',
      title: 'Very Old Stale Leads',
      description: `${veryOldStale} leads have no activity for over 90 days`,
      recommendation: 'Consider archiving or re-qualifying very old stale leads'
    });
  }

  return {
    totalLeads,
    staleLeads: staleCount,
    staleRate: Math.round(staleRate * 100) / 100,
    staleDistribution,
    byAssignee,
    bySource,
    byStage,
    staleDays,
    insights,
    formattedRate: `${Math.round(staleRate * 10) / 10}%`
  };
};

/**
 * Calculate drop-off rate by stage metrics
 * @param {Array} leads - Array of leads
 * @param {Object} options - Filter options
 * @returns {Object} Drop-off rate analysis by stage
 */
export const calculateDropoffRateByStage = (leads = [], options = {}) => {
  if (!leads || leads.length === 0) {
    return {
      totalLeads: 0,
      stageProgression: {},
      dropoffRates: {},
      overallDropoffRate: 0,
      worstPerformingStage: null,
      bestPerformingStage: null,
      conversionFunnel: [],
      timeframe: options.timeframe || 'all-time'
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

  if (options.assignee && options.assignee !== 'all') {
    filteredLeads = filteredLeads.filter(lead => lead.assignedTo === options.assignee);
  }

  if (options.source && options.source !== 'all') {
    filteredLeads = filteredLeads.filter(lead => lead.source === options.source);
  }

  // Define the standard sales funnel stages
  const stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
  const stageProgression = {};
  const dropoffRates = {};

  // Initialize stage data
  stages.forEach(stage => {
    stageProgression[stage] = {
      entered: 0,
      progressed: 0,
      dropped: 0,
      dropoffRate: 0
    };
  });

  // Analyze each lead's progression through stages
  filteredLeads.forEach(lead => {
    if (!lead.activities || lead.activities.length === 0) {
      // No activities, just count initial stage
      const initialStage = lead.status || 'new';
      if (stageProgression[initialStage]) {
        stageProgression[initialStage].entered++;
        if (['won', 'lost'].includes(lead.status)) {
          // Lead didn't progress beyond initial stage
          if (lead.status === 'lost') {
            stageProgression[initialStage].dropped++;
          }
        }
      }
      return;
    }

    // Track stage progression through activities
    const stageActivities = lead.activities
      .filter(activity => activity.type === 'status_change')
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const stagesVisited = ['new']; // Always starts with 'new'
    
    stageActivities.forEach(activity => {
      if (activity.metadata?.newStatus) {
        stagesVisited.push(activity.metadata.newStatus);
      }
    });

    // Add current status if not already included
    if (lead.status && !stagesVisited.includes(lead.status)) {
      stagesVisited.push(lead.status);
    }

    // Count entries and progressions
    for (let i = 0; i < stagesVisited.length; i++) {
      const currentStage = stagesVisited[i];
      if (stageProgression[currentStage]) {
        stageProgression[currentStage].entered++;
        
        // Check if progressed to next stage
        if (i < stagesVisited.length - 1) {
          const nextStage = stagesVisited[i + 1];
          if (nextStage !== 'lost') {
            stageProgression[currentStage].progressed++;
          } else {
            stageProgression[currentStage].dropped++;
          }
        } else {
          // This is the final stage
          if (currentStage === 'lost') {
            // Find the previous stage where they dropped off
            if (i > 0) {
              const previousStage = stagesVisited[i - 1];
              if (stageProgression[previousStage]) {
                stageProgression[previousStage].dropped++;
              }
            }
          }
        }
      }
    }
  });

  // Calculate drop-off rates
  let worstRate = 0;
  let bestRate = 100;
  let worstStage = null;
  let bestStage = null;

  stages.forEach(stage => {
    const stageData = stageProgression[stage];
    if (stageData.entered > 0) {
      const dropoffRate = (stageData.dropped / stageData.entered) * 100;
      stageData.dropoffRate = Math.round(dropoffRate * 100) / 100;
      dropoffRates[stage] = stageData.dropoffRate;
      
      // Track worst and best performing stages (excluding final stages)
      if (!['won', 'lost'].includes(stage)) {
        if (dropoffRate > worstRate) {
          worstRate = dropoffRate;
          worstStage = stage;
        }
        if (dropoffRate < bestRate && stageData.entered >= 5) { // Minimum sample size
          bestRate = dropoffRate;
          bestStage = stage;
        }
      }
    } else {
      stageData.dropoffRate = 0;
      dropoffRates[stage] = 0;
    }
  });

  // Calculate overall drop-off rate
  const totalEntered = Object.values(stageProgression).reduce((sum, stage) => sum + stage.entered, 0);
  const totalDropped = Object.values(stageProgression).reduce((sum, stage) => sum + stage.dropped, 0);
  const overallDropoffRate = totalEntered > 0 ? (totalDropped / totalEntered) * 100 : 0;

  // Create conversion funnel data
  const conversionFunnel = stages
    .filter(stage => stageProgression[stage].entered > 0)
    .map((stage, index) => {
      const stageData = stageProgression[stage];
      const conversionRate = index === 0 ? 100 : 
        ((stageData.entered / stageProgression[stages[0]].entered) * 100);
      
      return {
        stage: stage.charAt(0).toUpperCase() + stage.slice(1),
        count: stageData.entered,
        conversionRate: Math.round(conversionRate * 100) / 100,
        dropoffRate: stageData.dropoffRate,
        dropoffCount: stageData.dropped
      };
    });

  // Generate insights
  const insights = [];
  
  // High drop-off stage insight
  if (worstStage && worstRate > 50) {
    insights.push({
      type: 'high_dropoff_stage',
      priority: 'high',
      title: `High Drop-off in ${worstStage.charAt(0).toUpperCase() + worstStage.slice(1)} Stage`,
      description: `${worstRate.toFixed(1)}% of leads drop off at the ${worstStage} stage`,
      recommendation: `Analyze and improve processes at the ${worstStage} stage`
    });
  }

  // Overall high drop-off insight
  if (overallDropoffRate > 60) {
    insights.push({
      type: 'high_overall_dropoff',
      priority: 'medium',
      title: 'High Overall Drop-off Rate',
      description: `${overallDropoffRate.toFixed(1)}% overall drop-off rate across all stages`,
      recommendation: 'Review entire sales process for optimization opportunities'
    });
  }

  // Best performing stage insight
  if (bestStage && bestRate < 20) {
    insights.push({
      type: 'best_performing_stage',
      priority: 'low',
      title: `${bestStage.charAt(0).toUpperCase() + bestStage.slice(1)} Stage Performing Well`,
      description: `Only ${bestRate.toFixed(1)}% drop-off rate at ${bestStage} stage`,
      recommendation: `Apply ${bestStage} stage best practices to other stages`
    });
  }

  return {
    totalLeads: filteredLeads.length,
    stageProgression,
    dropoffRates,
    overallDropoffRate: Math.round(overallDropoffRate * 100) / 100,
    worstPerformingStage: worstStage ? {
      stage: worstStage,
      dropoffRate: worstRate
    } : null,
    bestPerformingStage: bestStage ? {
      stage: bestStage,
      dropoffRate: bestRate
    } : null,
    conversionFunnel,
    insights,
    timeframe: options.timeframe || 'all-time'
  };
};

/**
 * Get revenue performance category
 * @param {number} monthlyRevenue - Monthly revenue amount
 * @param {number} average - Average monthly revenue
 * @returns {Object} Category and color information
 */
export const getRevenuePerformanceCategory = (monthlyRevenue, average = 15000) => {
  const ratio = average > 0 ? monthlyRevenue / average : 0;
  
  if (ratio >= 1.5) {
    return { category: 'excellent', label: 'High Performer', color: 'text-green-600 bg-green-50' };
  } else if (ratio >= 1.2) {
    return { category: 'good', label: 'Above Average', color: 'text-blue-600 bg-blue-50' };
  } else if (ratio >= 0.8) {
    return { category: 'average', label: 'Average', color: 'text-gray-600 bg-gray-50' };
  } else if (ratio >= 0.5) {
    return { category: 'below-average', label: 'Below Average', color: 'text-orange-600 bg-orange-50' };
  } else {
    return { category: 'low', label: 'Needs Improvement', color: 'text-red-600 bg-red-50' };
  }
};

/**
 * Get re-engagement performance category
 * @param {number} reengagementRate - Re-engagement rate percentage
 * @returns {Object} Category and color information
 */
export const getReengagementPerformanceCategory = (reengagementRate) => {
  if (reengagementRate >= 30) {
    return { category: 'excellent', label: 'Excellent', color: 'text-green-600 bg-green-50' };
  } else if (reengagementRate >= 20) {
    return { category: 'good', label: 'Good', color: 'text-blue-600 bg-blue-50' };
  } else if (reengagementRate >= 10) {
    return { category: 'fair', label: 'Fair', color: 'text-yellow-600 bg-yellow-50' };
  } else if (reengagementRate >= 5) {
    return { category: 'poor', label: 'Poor', color: 'text-orange-600 bg-orange-50' };
  } else {
    return { category: 'very-poor', label: 'Needs Improvement', color: 'text-red-600 bg-red-50' };
  }
};

/**
 * Get stale leads performance category
 * @param {number} staleRate - Stale leads rate percentage
 * @returns {Object} Category and color information
 */
export const getStaleLeadsPerformanceCategory = (staleRate) => {
  if (staleRate <= 10) {
    return { category: 'excellent', label: 'Excellent', color: 'text-green-600 bg-green-50' };
  } else if (staleRate <= 20) {
    return { category: 'good', label: 'Good', color: 'text-blue-600 bg-blue-50' };
  } else if (staleRate <= 35) {
    return { category: 'fair', label: 'Fair', color: 'text-yellow-600 bg-yellow-50' };
  } else if (staleRate <= 50) {
    return { category: 'poor', label: 'Poor', color: 'text-orange-600 bg-orange-50' };
  } else {
    return { category: 'very-poor', label: 'Needs Improvement', color: 'text-red-600 bg-red-50' };
  }
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

export default {
  calculateMonthlyRevenuePerRep,
  calculateLeadReengagementRate,
  calculateStaleLeads,
  calculateDropoffRateByStage,
  getRevenuePerformanceCategory,
  getReengagementPerformanceCategory,
  getStaleLeadsPerformanceCategory
};