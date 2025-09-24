/**
 * Lead Aging and Contact Metrics Utilities for SalesTracker
 * Handles calculations for Lead Aging and Contact Attempts per Lead metrics
 */

/**
 * Calculate lead aging metrics
 * @param {Array} leads - Array of leads
 * @param {Object} options - Filter options (timeframe, assignee, stage, etc.)
 * @returns {Object} Lead aging data and analysis
 */
export const calculateLeadAging = (leads, options = {}) => {
  if (!leads || leads.length === 0) {
    return {
      averageAge: 0,
      totalLeads: 0,
      ageDistribution: {},
      stageAging: {},
      agingBreakdown: {},
      criticalLeads: [],
      formattedAverageAge: '0 days'
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

  if (options.stage && options.stage !== 'all') {
    filteredLeads = filteredLeads.filter(lead => lead.status === options.stage);
  }

  if (options.source && options.source !== 'all') {
    filteredLeads = filteredLeads.filter(lead => lead.source === options.source);
  }

  const currentTime = new Date();
  const leadsWithAging = filteredLeads.map(lead => {
    // Calculate total age (from creation)
    const createdAt = new Date(lead.createdAt);
    const totalAge = Math.floor((currentTime - createdAt) / (1000 * 60 * 60 * 24));
    
    // Calculate stage age (time in current stage)
    let stageAge = totalAge; // Default to total age if no stage history
    
    // If lead has activities, find when it last changed status
    if (lead.activities && lead.activities.length > 0) {
      const statusChangeActivities = lead.activities
        .filter(activity => activity.type === 'status_change' || activity.type === 'note')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      if (statusChangeActivities.length > 0) {
        const lastStatusChange = new Date(statusChangeActivities[0].createdAt);
        stageAge = Math.floor((currentTime - lastStatusChange) / (1000 * 60 * 60 * 24));
      }
    }

    return {
      ...lead,
      totalAge,
      stageAge,
      ageCategory: getAgeCategory(totalAge),
      stageAgeCategory: getAgeCategory(stageAge)
    };
  });

  // Calculate average ages
  const averageTotalAge = leadsWithAging.length > 0 
    ? leadsWithAging.reduce((sum, lead) => sum + lead.totalAge, 0) / leadsWithAging.length 
    : 0;
    
  const averageStageAge = leadsWithAging.length > 0
    ? leadsWithAging.reduce((sum, lead) => sum + lead.stageAge, 0) / leadsWithAging.length
    : 0;

  // Age distribution (by total age)
  const ageDistribution = {
    '0-7': leadsWithAging.filter(lead => lead.totalAge <= 7).length,
    '8-14': leadsWithAging.filter(lead => lead.totalAge > 7 && lead.totalAge <= 14).length,
    '15-30': leadsWithAging.filter(lead => lead.totalAge > 14 && lead.totalAge <= 30).length,
    '31-60': leadsWithAging.filter(lead => lead.totalAge > 30 && lead.totalAge <= 60).length,
    '60+': leadsWithAging.filter(lead => lead.totalAge > 60).length
  };

  // Stage aging breakdown
  const stageGroups = groupBy(leadsWithAging, 'status');
  const stageAging = {};
  
  Object.keys(stageGroups).forEach(stage => {
    const stageLeads = stageGroups[stage];
    const avgStageAge = stageLeads.reduce((sum, lead) => sum + lead.stageAge, 0) / stageLeads.length;
    const avgTotalAge = stageLeads.reduce((sum, lead) => sum + lead.totalAge, 0) / stageLeads.length;
    
    stageAging[stage] = {
      leadCount: stageLeads.length,
      averageStageAge: Math.round(avgStageAge * 100) / 100,
      averageTotalAge: Math.round(avgTotalAge * 100) / 100,
      oldestLead: Math.max(...stageLeads.map(lead => lead.totalAge)),
      newestLead: Math.min(...stageLeads.map(lead => lead.totalAge)),
      staleLeads: stageLeads.filter(lead => lead.stageAge > 14).length, // Over 2 weeks in stage
      criticalLeads: stageLeads.filter(lead => lead.stageAge > 30).length // Over 1 month in stage
    };
  });

  // Aging breakdown by assignee
  const assigneeGroups = groupBy(leadsWithAging.filter(lead => lead.assignedTo), 'assignedTo');
  const agingBreakdown = {};
  
  Object.keys(assigneeGroups).forEach(assigneeId => {
    const assigneeLeads = assigneeGroups[assigneeId];
    const avgAge = assigneeLeads.reduce((sum, lead) => sum + lead.totalAge, 0) / assigneeLeads.length;
    const avgStageAge = assigneeLeads.reduce((sum, lead) => sum + lead.stageAge, 0) / assigneeLeads.length;
    
    agingBreakdown[assigneeId] = {
      leadCount: assigneeLeads.length,
      averageAge: Math.round(avgAge * 100) / 100,
      averageStageAge: Math.round(avgStageAge * 100) / 100,
      staleLeads: assigneeLeads.filter(lead => lead.totalAge > 30).length,
      criticalLeads: assigneeLeads.filter(lead => lead.totalAge > 60).length
    };
  });

  // Identify critical leads (old and stale)
  const criticalLeads = leadsWithAging
    .filter(lead => lead.stageAge > 21 || lead.totalAge > 45) // 3+ weeks in stage or 45+ days total
    .sort((a, b) => b.totalAge - a.totalAge)
    .slice(0, 10); // Top 10 critical leads

  return {
    averageAge: Math.round(averageTotalAge * 100) / 100,
    averageStageAge: Math.round(averageStageAge * 100) / 100,
    totalLeads: leadsWithAging.length,
    ageDistribution,
    stageAging,
    agingBreakdown,
    criticalLeads: criticalLeads.map(lead => ({
      id: lead.id,
      company: lead.company,
      status: lead.status,
      totalAge: lead.totalAge,
      stageAge: lead.stageAge,
      assignedTo: lead.assignedTo,
      source: lead.source,
      value: lead.dealValue || 0
    })),
    formattedAverageAge: formatDuration(averageTotalAge),
    formattedAverageStageAge: formatDuration(averageStageAge),
    timeframe: options.timeframe || 'all-time'
  };
};

/**
 * Calculate contact attempts per lead metrics
 * @param {Array} leads - Array of leads with activities
 * @param {Object} options - Filter options
 * @returns {Object} Contact attempts analysis
 */
export const calculateContactAttempts = (leads, options = {}) => {
  if (!leads || leads.length === 0) {
    return {
      averageAttempts: 0,
      totalAttempts: 0,
      totalLeads: 0,
      attemptsDistribution: {},
      byAssignee: {},
      bySource: {},
      byStage: {},
      contactEfficiency: 0,
      formattedAverage: '0 attempts per lead'
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

  if (options.stage && options.stage !== 'all') {
    filteredLeads = filteredLeads.filter(lead => lead.status === options.stage);
  }

  const contactActivityTypes = ['Call', 'Email', 'WhatsApp', 'LinkedIn', 'SMS'];
  
  const leadsWithAttempts = filteredLeads.map(lead => {
    if (!lead.activities || lead.activities.length === 0) {
      return { ...lead, contactAttempts: 0, contactTypes: {} };
    }

    // Count contact attempts by type
    const contactTypes = {};
    const contactAttempts = lead.activities.filter(activity => {
      const isContactAttempt = contactActivityTypes.includes(activity.type);
      if (isContactAttempt) {
        contactTypes[activity.type] = (contactTypes[activity.type] || 0) + 1;
      }
      return isContactAttempt;
    }).length;

    return {
      ...lead,
      contactAttempts,
      contactTypes,
      hasResponse: lead.activities.some(activity => activity.isResponse === true),
      firstContactDate: lead.activities
        .filter(activity => contactActivityTypes.includes(activity.type))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0]?.createdAt
    };
  });

  // Calculate totals and averages
  const totalAttempts = leadsWithAttempts.reduce((sum, lead) => sum + lead.contactAttempts, 0);
  const averageAttempts = filteredLeads.length > 0 ? totalAttempts / filteredLeads.length : 0;

  // Attempts distribution
  const attemptsDistribution = {
    '0': leadsWithAttempts.filter(lead => lead.contactAttempts === 0).length,
    '1-2': leadsWithAttempts.filter(lead => lead.contactAttempts >= 1 && lead.contactAttempts <= 2).length,
    '3-5': leadsWithAttempts.filter(lead => lead.contactAttempts >= 3 && lead.contactAttempts <= 5).length,
    '6-10': leadsWithAttempts.filter(lead => lead.contactAttempts >= 6 && lead.contactAttempts <= 10).length,
    '10+': leadsWithAttempts.filter(lead => lead.contactAttempts > 10).length
  };

  // Breakdown by assignee
  const assigneeGroups = groupBy(leadsWithAttempts.filter(lead => lead.assignedTo), 'assignedTo');
  const byAssignee = {};
  
  Object.keys(assigneeGroups).forEach(assigneeId => {
    const assigneeLeads = assigneeGroups[assigneeId];
    const assigneeAttempts = assigneeLeads.reduce((sum, lead) => sum + lead.contactAttempts, 0);
    const avgAttempts = assigneeLeads.length > 0 ? assigneeAttempts / assigneeLeads.length : 0;
    const responseRate = assigneeLeads.filter(lead => lead.hasResponse).length / assigneeLeads.length * 100;
    
    byAssignee[assigneeId] = {
      leadCount: assigneeLeads.length,
      totalAttempts: assigneeAttempts,
      averageAttempts: Math.round(avgAttempts * 100) / 100,
      responseRate: Math.round(responseRate * 100) / 100,
      efficiency: responseRate > 0 ? Math.round((responseRate / avgAttempts) * 100) / 100 : 0
    };
  });

  // Breakdown by source
  const sourceGroups = groupBy(leadsWithAttempts, 'source');
  const bySource = {};
  
  Object.keys(sourceGroups).forEach(source => {
    const sourceLeads = sourceGroups[source];
    const sourceAttempts = sourceLeads.reduce((sum, lead) => sum + lead.contactAttempts, 0);
    const avgAttempts = sourceLeads.length > 0 ? sourceAttempts / sourceLeads.length : 0;
    const responseRate = sourceLeads.filter(lead => lead.hasResponse).length / sourceLeads.length * 100;
    
    bySource[source] = {
      leadCount: sourceLeads.length,
      totalAttempts: sourceAttempts,
      averageAttempts: Math.round(avgAttempts * 100) / 100,
      responseRate: Math.round(responseRate * 100) / 100
    };
  });

  // Breakdown by stage
  const stageGroups = groupBy(leadsWithAttempts, 'status');
  const byStage = {};
  
  Object.keys(stageGroups).forEach(stage => {
    const stageLeads = stageGroups[stage];
    const stageAttempts = stageLeads.reduce((sum, lead) => sum + lead.contactAttempts, 0);
    const avgAttempts = stageLeads.length > 0 ? stageAttempts / stageLeads.length : 0;
    
    byStage[stage] = {
      leadCount: stageLeads.length,
      totalAttempts: stageAttempts,
      averageAttempts: Math.round(avgAttempts * 100) / 100
    };
  });

  // Contact efficiency (response rate per attempt)
  const contactedLeads = leadsWithAttempts.filter(lead => lead.contactAttempts > 0);
  const respondedLeads = contactedLeads.filter(lead => lead.hasResponse);
  const contactEfficiency = contactedLeads.length > 0 ? (respondedLeads.length / contactedLeads.length) * 100 : 0;

  return {
    averageAttempts: Math.round(averageAttempts * 100) / 100,
    totalAttempts,
    totalLeads: filteredLeads.length,
    attemptsDistribution,
    byAssignee,
    bySource,
    byStage,
    contactEfficiency: Math.round(contactEfficiency * 100) / 100,
    contactedLeads: contactedLeads.length,
    respondedLeads: respondedLeads.length,
    formattedAverage: `${Math.round(averageAttempts * 10) / 10} attempts per lead`,
    timeframe: options.timeframe || 'all-time'
  };
};

/**
 * Calculate stage-to-stage conversion rates
 * @param {Array} leads - Array of leads with stage history
 * @param {Object} options - Filter options
 * @returns {Object} Stage conversion analysis
 */
export const calculateStageConversions = (leads, options = {}) => {
  if (!leads || leads.length === 0) {
    return {
      overallConversionRate: 0,
      stageConversions: {},
      conversionFunnel: [],
      conversionMatrix: {},
      dropOffAnalysis: {},
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

  // Define stage progression order
  const stageOrder = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
  const stageLabels = {
    'new': 'New Lead',
    'contacted': 'Contacted',
    'qualified': 'Qualified',
    'proposal': 'Proposal Sent',
    'negotiation': 'Negotiation',
    'won': 'Won',
    'lost': 'Lost'
  };

  // Get stage progression for each lead
  const leadsWithProgression = filteredLeads.map(lead => {
    if (!lead.activities || lead.activities.length === 0) {
      return { ...lead, stageProgression: [lead.status] };
    }

    // Extract stage history from activities
    const stageHistory = ['new']; // All leads start as new
    const statusChanges = lead.activities
      .filter(activity => 
        activity.type === 'status_change' || 
        (activity.description && activity.description.includes('status'))
      )
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    statusChanges.forEach(activity => {
      if (activity.description) {
        const match = activity.description.match(/changed.*to\s+([a-zA-Z]+)/i);
        if (match) {
          const newStatus = match[1].toLowerCase();
          if (stageOrder.includes(newStatus) && !stageHistory.includes(newStatus)) {
            stageHistory.push(newStatus);
          }
        }
      }
    });

    // Add current status if not in history
    if (!stageHistory.includes(lead.status)) {
      stageHistory.push(lead.status);
    }

    return { ...lead, stageProgression: stageHistory };
  });

  // Calculate stage-to-stage conversions
  const stageConversions = {};
  const conversionMatrix = {};

  for (let i = 0; i < stageOrder.length - 1; i++) {
    const currentStage = stageOrder[i];
    const nextStage = stageOrder[i + 1];
    
    // Skip lost stage for progression analysis
    if (nextStage === 'lost') continue;
    
    const leadsInCurrentStage = leadsWithProgression.filter(lead => 
      lead.stageProgression.includes(currentStage)
    );
    
    const leadsReachingNextStage = leadsInCurrentStage.filter(lead => 
      lead.stageProgression.includes(nextStage)
    );
    
    const conversionRate = leadsInCurrentStage.length > 0 
      ? (leadsReachingNextStage.length / leadsInCurrentStage.length) * 100 
      : 0;
    
    stageConversions[`${currentStage}_to_${nextStage}`] = {
      fromStage: currentStage,
      toStage: nextStage,
      fromStageLabel: stageLabels[currentStage],
      toStageLabel: stageLabels[nextStage],
      leadsInFromStage: leadsInCurrentStage.length,
      leadsReachingToStage: leadsReachingNextStage.length,
      conversionRate: Math.round(conversionRate * 100) / 100,
      dropOffCount: leadsInCurrentStage.length - leadsReachingNextStage.length,
      dropOffRate: Math.round((100 - conversionRate) * 100) / 100
    };

    // Initialize conversion matrix row
    if (!conversionMatrix[currentStage]) {
      conversionMatrix[currentStage] = {};
    }
    conversionMatrix[currentStage][nextStage] = conversionRate;
  }

  // Create conversion funnel
  const conversionFunnel = [];
  let previousCount = filteredLeads.length;

  stageOrder.forEach((stage, index) => {
    if (stage === 'lost') return; // Skip lost in funnel
    
    const leadsInStage = leadsWithProgression.filter(lead => 
      lead.stageProgression.includes(stage)
    ).length;
    
    const conversionFromPrevious = index === 0 ? 100 : (leadsInStage / previousCount) * 100;
    
    conversionFunnel.push({
      stage,
      stageLabel: stageLabels[stage],
      leadCount: leadsInStage,
      conversionRate: Math.round(conversionFromPrevious * 100) / 100,
      dropOff: previousCount - leadsInStage
    });
    
    previousCount = leadsInStage;
  });

  // Drop-off analysis
  const dropOffAnalysis = {};
  Object.keys(stageConversions).forEach(key => {
    const conversion = stageConversions[key];
    if (conversion.dropOffRate > 50) { // High drop-off stages
      dropOffAnalysis[conversion.fromStage] = {
        stage: conversion.fromStageLabel,
        dropOffRate: conversion.dropOffRate,
        dropOffCount: conversion.dropOffCount,
        severity: conversion.dropOffRate > 70 ? 'critical' : 'high'
      };
    }
  });

  // Overall conversion rate (new to won)
  const newLeads = leadsWithProgression.filter(lead => 
    lead.stageProgression.includes('new')
  ).length;
  const wonLeads = leadsWithProgression.filter(lead => 
    lead.stageProgression.includes('won')
  ).length;
  const overallConversionRate = newLeads > 0 ? (wonLeads / newLeads) * 100 : 0;

  return {
    overallConversionRate: Math.round(overallConversionRate * 100) / 100,
    stageConversions,
    conversionFunnel,
    conversionMatrix,
    dropOffAnalysis,
    totalLeads: filteredLeads.length,
    wonLeads,
    formattedOverallRate: `${Math.round(overallConversionRate * 10) / 10}%`,
    timeframe: options.timeframe || 'all-time'
  };
};

/**
 * Get lead age performance category
 * @param {number} age - Age in days
 * @returns {Object} Category and color information
 */
export const getAgeCategory = (age) => {
  if (age <= 7) {
    return { category: 'fresh', label: 'Fresh', color: 'text-green-600 bg-green-50' };
  } else if (age <= 14) {
    return { category: 'active', label: 'Active', color: 'text-blue-600 bg-blue-50' };
  } else if (age <= 30) {
    return { category: 'aging', label: 'Aging', color: 'text-yellow-600 bg-yellow-50' };
  } else if (age <= 60) {
    return { category: 'stale', label: 'Stale', color: 'text-orange-600 bg-orange-50' };
  } else {
    return { category: 'critical', label: 'Critical', color: 'text-red-600 bg-red-50' };
  }
};

/**
 * Get contact attempts performance category
 * @param {number} attempts - Number of contact attempts
 * @returns {Object} Category and color information
 */
export const getContactAttemptsCategory = (attempts) => {
  if (attempts === 0) {
    return { category: 'no-contact', label: 'No Contact', color: 'text-red-600 bg-red-50' };
  } else if (attempts <= 2) {
    return { category: 'low', label: 'Low Activity', color: 'text-orange-600 bg-orange-50' };
  } else if (attempts <= 5) {
    return { category: 'moderate', label: 'Moderate', color: 'text-yellow-600 bg-yellow-50' };
  } else if (attempts <= 8) {
    return { category: 'active', label: 'Active', color: 'text-blue-600 bg-blue-50' };
  } else {
    return { category: 'high', label: 'High Activity', color: 'text-green-600 bg-green-50' };
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

export default {
  calculateLeadAging,
  calculateContactAttempts,
  calculateStageConversions,
  getAgeCategory,
  getContactAttemptsCategory,
  formatDuration
};