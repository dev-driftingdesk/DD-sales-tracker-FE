/**
 * Pipeline Value and Win Rate Metrics Utilities for SalesTracker
 * Handles calculations for Pipeline Value and Win Rate metrics
 */

/**
 * Calculate Pipeline Value
 * @param {Array} deals - Array of deals
 * @param {Object} options - Filter options (timeframe, assignee, stage, etc.)
 * @returns {Object} Pipeline value data and breakdown
 */
export const calculatePipelineValue = (deals, options = {}) => {
  if (!deals || deals.length === 0) {
    return {
      totalPipelineValue: 0,
      weightedPipelineValue: 0,
      activeDealCount: 0,
      averageDealValue: 0,
      breakdown: {
        byStage: {},
        byAssignee: {},
        byProbability: {}
      },
      formattedTotalValue: '$0',
      formattedWeightedValue: '$0',
      trend: null
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

  if (options.stage && options.stage !== 'all') {
    filteredDeals = filteredDeals.filter(deal => deal.stage === options.stage);
  }

  // Only consider active deals (not closed)
  const activeDeals = filteredDeals.filter(deal => 
    deal.stage !== 'closed-won' && deal.stage !== 'closed-lost'
  );

  // Calculate total pipeline value (sum of all deal values)
  const totalPipelineValue = activeDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);

  // Calculate weighted pipeline value (deal value × probability)
  const weightedPipelineValue = activeDeals.reduce((sum, deal) => {
    const probability = getProbabilityByStage(deal.stage) / 100;
    return sum + ((deal.value || 0) * probability);
  }, 0);

  const averageDealValue = activeDeals.length > 0 ? totalPipelineValue / activeDeals.length : 0;

  // Breakdown by stage
  const stageBreakdown = {};
  const stages = ['prospecting', 'qualification', 'proposal', 'negotiation'];
  
  stages.forEach(stage => {
    const stageDeals = activeDeals.filter(deal => deal.stage === stage);
    const stageTotalValue = stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    const stageWeightedValue = stageDeals.reduce((sum, deal) => {
      const probability = getProbabilityByStage(deal.stage) / 100;
      return sum + ((deal.value || 0) * probability);
    }, 0);

    stageBreakdown[stage] = {
      dealCount: stageDeals.length,
      totalValue: stageTotalValue,
      weightedValue: stageWeightedValue,
      averageValue: stageDeals.length > 0 ? stageTotalValue / stageDeals.length : 0,
      probability: getProbabilityByStage(stage)
    };
  });

  // Breakdown by assignee
  const assigneeBreakdown = {};
  const assigneeGroups = groupBy(activeDeals, 'assigneeId');
  
  Object.keys(assigneeGroups).forEach(assigneeId => {
    if (assigneeId && assigneeId !== 'undefined') {
      const assigneeDeals = assigneeGroups[assigneeId];
      const assigneeTotalValue = assigneeDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
      const assigneeWeightedValue = assigneeDeals.reduce((sum, deal) => {
        const probability = getProbabilityByStage(deal.stage) / 100;
        return sum + ((deal.value || 0) * probability);
      }, 0);

      assigneeBreakdown[assigneeId] = {
        dealCount: assigneeDeals.length,
        totalValue: assigneeTotalValue,
        weightedValue: assigneeWeightedValue,
        averageValue: assigneeDeals.length > 0 ? assigneeTotalValue / assigneeDeals.length : 0
      };
    }
  });

  // Breakdown by probability ranges
  const probabilityBreakdown = {
    'high': { min: 60, max: 100, deals: [], totalValue: 0, weightedValue: 0 },
    'medium': { min: 30, max: 59, deals: [], totalValue: 0, weightedValue: 0 },
    'low': { min: 0, max: 29, deals: [], totalValue: 0, weightedValue: 0 }
  };

  activeDeals.forEach(deal => {
    const probability = getProbabilityByStage(deal.stage);
    let category = 'low';
    
    if (probability >= 60) category = 'high';
    else if (probability >= 30) category = 'medium';
    
    probabilityBreakdown[category].deals.push(deal);
    probabilityBreakdown[category].totalValue += deal.value || 0;
    probabilityBreakdown[category].weightedValue += ((deal.value || 0) * (probability / 100));
  });

  // Calculate trend (compare with previous period)
  let trend = null;
  if (options.timeframe && options.timeframe !== '90d') {
    const previousPeriodDeals = getPreviousPeriodDeals(deals, options.timeframe);
    const previousPipelineValue = calculatePipelineValue(previousPeriodDeals);
    trend = weightedPipelineValue - previousPipelineValue.weightedPipelineValue;
  }

  return {
    totalPipelineValue: Math.round(totalPipelineValue * 100) / 100,
    weightedPipelineValue: Math.round(weightedPipelineValue * 100) / 100,
    activeDealCount: activeDeals.length,
    averageDealValue: Math.round(averageDealValue * 100) / 100,
    breakdown: {
      byStage: stageBreakdown,
      byAssignee: assigneeBreakdown,
      byProbability: probabilityBreakdown
    },
    formattedTotalValue: `$${Math.round(totalPipelineValue).toLocaleString()}`,
    formattedWeightedValue: `$${Math.round(weightedPipelineValue).toLocaleString()}`,
    trend: trend ? Math.round(trend * 100) / 100 : null,
    timeframe: options.timeframe || 'all-time'
  };
};

/**
 * Calculate Win Rate
 * @param {Array} deals - Array of deals
 * @param {Array} leads - Array of leads (optional, for lead-based win rate)
 * @param {Object} options - Filter options
 * @returns {Object} Win rate data and analysis
 */
export const calculateWinRate = (deals, leads = [], options = {}) => {
  if (!deals || deals.length === 0) {
    return {
      overallWinRate: 0,
      dealsWon: 0,
      totalDeals: 0,
      dealsLost: 0,
      activeDealCount: 0,
      breakdown: {
        byStage: {},
        byAssignee: {},
        bySource: {},
        byTimeframe: {}
      },
      trends: [],
      formattedWinRate: '0%'
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

  // Categorize deals
  const wonDeals = filteredDeals.filter(deal => deal.stage === 'closed-won');
  const lostDeals = filteredDeals.filter(deal => deal.stage === 'closed-lost');
  const activeDeals = filteredDeals.filter(deal => 
    deal.stage !== 'closed-won' && deal.stage !== 'closed-lost'
  );
  const closedDeals = [...wonDeals, ...lostDeals];

  // Calculate win rate
  const overallWinRate = closedDeals.length > 0 ? (wonDeals.length / closedDeals.length) * 100 : 0;

  // Win rate by assignee
  const assigneeBreakdown = {};
  const assigneeGroups = groupBy(filteredDeals, 'assigneeId');
  
  Object.keys(assigneeGroups).forEach(assigneeId => {
    if (assigneeId && assigneeId !== 'undefined') {
      const assigneeDeals = assigneeGroups[assigneeId];
      const assigneeWon = assigneeDeals.filter(deal => deal.stage === 'closed-won');
      const assigneeClosed = assigneeDeals.filter(deal => 
        deal.stage === 'closed-won' || deal.stage === 'closed-lost'
      );
      
      assigneeBreakdown[assigneeId] = {
        totalDeals: assigneeDeals.length,
        wonDeals: assigneeWon.length,
        closedDeals: assigneeClosed.length,
        winRate: assigneeClosed.length > 0 ? (assigneeWon.length / assigneeClosed.length) * 100 : 0,
        activeDeals: assigneeDeals.length - assigneeClosed.length
      };
    }
  });

  // Win rate by source (if available)
  const sourceBreakdown = {};
  if (deals.some(deal => deal.source)) {
    const sourceGroups = groupBy(filteredDeals, 'source');
    
    Object.keys(sourceGroups).forEach(source => {
      if (source && source !== 'undefined') {
        const sourceDeals = sourceGroups[source];
        const sourceWon = sourceDeals.filter(deal => deal.stage === 'closed-won');
        const sourceClosed = sourceDeals.filter(deal => 
          deal.stage === 'closed-won' || deal.stage === 'closed-lost'
        );
        
        sourceBreakdown[source] = {
          totalDeals: sourceDeals.length,
          wonDeals: sourceWon.length,
          closedDeals: sourceClosed.length,
          winRate: sourceClosed.length > 0 ? (sourceWon.length / sourceClosed.length) * 100 : 0
        };
      }
    });
  }

  // Win rate by stage (progression analysis)
  const stageBreakdown = {};
  const stages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost'];
  
  stages.forEach(stage => {
    const stageDeals = filteredDeals.filter(deal => deal.stage === stage);
    stageBreakdown[stage] = {
      dealCount: stageDeals.length,
      percentage: filteredDeals.length > 0 ? (stageDeals.length / filteredDeals.length) * 100 : 0
    };
  });

  // Historical win rate trends
  const trends = [];
  if (options.includeTrends) {
    const periods = ['7d', '30d', '90d'];
    periods.forEach(period => {
      const periodDeals = deals.filter(deal => {
        const dealDate = new Date(deal.createdAt);
        const cutoff = getTimeframeCutoff(period);
        return dealDate >= cutoff;
      });
      
      const periodWinRate = calculateWinRate(periodDeals, [], { ...options, includeTrends: false });
      trends.push({
        period: period,
        winRate: periodWinRate.overallWinRate,
        wonDeals: periodWinRate.dealsWon,
        totalDeals: periodWinRate.totalDeals
      });
    });
  }

  return {
    overallWinRate: Math.round(overallWinRate * 100) / 100,
    dealsWon: wonDeals.length,
    totalDeals: filteredDeals.length,
    dealsLost: lostDeals.length,
    closedDeals: closedDeals.length,
    activeDealCount: activeDeals.length,
    breakdown: {
      byStage: stageBreakdown,
      byAssignee: assigneeBreakdown,
      bySource: sourceBreakdown,
      byTimeframe: options.timeframe || 'all-time'
    },
    trends,
    formattedWinRate: `${Math.round(overallWinRate * 100) / 100}%`,
    timeframe: options.timeframe || 'all-time'
  };
};

/**
 * Get default probability by deal stage
 * @param {string} stage - Deal stage
 * @returns {number} Probability percentage
 */
export const getProbabilityByStage = (stage) => {
  const stageProb = {
    'prospecting': 20,
    'qualification': 40,
    'proposal': 60,
    'negotiation': 80,
    'closed-won': 100,
    'closed-lost': 0
  };
  
  return stageProb[stage] || 20;
};

/**
 * Get pipeline value performance category
 * @param {number} pipelineValue - Pipeline value amount
 * @param {number} target - Target pipeline value (optional)
 * @returns {Object} Category and color information
 */
export const getPipelineValueCategory = (pipelineValue, target = null) => {
  if (target) {
    const percentage = (pipelineValue / target) * 100;
    if (percentage >= 120) {
      return { category: 'excellent', label: 'Excellent', color: 'text-green-600 bg-green-50' };
    } else if (percentage >= 100) {
      return { category: 'good', label: 'On Target', color: 'text-blue-600 bg-blue-50' };
    } else if (percentage >= 80) {
      return { category: 'fair', label: 'Fair', color: 'text-yellow-600 bg-yellow-50' };
    } else if (percentage >= 60) {
      return { category: 'poor', label: 'Below Target', color: 'text-orange-600 bg-orange-50' };
    } else {
      return { category: 'very-poor', label: 'Needs Attention', color: 'text-red-600 bg-red-50' };
    }
  }

  // Default categories without target
  if (pipelineValue >= 1000000) {
    return { category: 'excellent', label: 'Excellent', color: 'text-green-600 bg-green-50' };
  } else if (pipelineValue >= 500000) {
    return { category: 'good', label: 'Good', color: 'text-blue-600 bg-blue-50' };
  } else if (pipelineValue >= 250000) {
    return { category: 'fair', label: 'Fair', color: 'text-yellow-600 bg-yellow-50' };
  } else if (pipelineValue >= 100000) {
    return { category: 'poor', label: 'Poor', color: 'text-orange-600 bg-orange-50' };
  } else {
    return { category: 'very-poor', label: 'Needs Improvement', color: 'text-red-600 bg-red-50' };
  }
};

/**
 * Get win rate performance category
 * @param {number} winRate - Win rate percentage
 * @returns {Object} Category and color information
 */
export const getWinRateCategory = (winRate) => {
  if (winRate >= 40) {
    return { category: 'excellent', label: 'Excellent', color: 'text-green-600 bg-green-50' };
  } else if (winRate >= 30) {
    return { category: 'good', label: 'Good', color: 'text-blue-600 bg-blue-50' };
  } else if (winRate >= 20) {
    return { category: 'fair', label: 'Fair', color: 'text-yellow-600 bg-yellow-50' };
  } else if (winRate >= 10) {
    return { category: 'poor', label: 'Poor', color: 'text-orange-600 bg-orange-50' };
  } else {
    return { category: 'very-poor', label: 'Needs Improvement', color: 'text-red-600 bg-red-50' };
  }
};

/**
 * Calculate pipeline health score
 * @param {Object} pipelineData - Pipeline value data
 * @param {Object} winRateData - Win rate data
 * @returns {Object} Health score and recommendations
 */
export const calculatePipelineHealthScore = (pipelineData, winRateData) => {
  let score = 0;
  const factors = [];

  // Pipeline value factor (40% weight)
  const pipelineValueCategory = getPipelineValueCategory(pipelineData.weightedPipelineValue);
  const pipelineScore = {
    'excellent': 40,
    'good': 32,
    'fair': 24,
    'poor': 16,
    'very-poor': 8
  }[pipelineValueCategory.category] || 8;
  score += pipelineScore;
  factors.push({ name: 'Pipeline Value', score: pipelineScore, weight: '40%' });

  // Win rate factor (35% weight)
  const winRateCategory = getWinRateCategory(winRateData.overallWinRate);
  const winRateScore = {
    'excellent': 35,
    'good': 28,
    'fair': 21,
    'poor': 14,
    'very-poor': 7
  }[winRateCategory.category] || 7;
  score += winRateScore;
  factors.push({ name: 'Win Rate', score: winRateScore, weight: '35%' });

  // Deal activity factor (25% weight)
  const dealActivityScore = Math.min(25, (pipelineData.activeDealCount / 20) * 25);
  score += dealActivityScore;
  factors.push({ name: 'Deal Activity', score: Math.round(dealActivityScore), weight: '25%' });

  // Overall health category
  let healthCategory = 'poor';
  let healthLabel = 'Needs Improvement';
  let healthColor = 'text-red-600 bg-red-50';

  if (score >= 80) {
    healthCategory = 'excellent';
    healthLabel = 'Excellent';
    healthColor = 'text-green-600 bg-green-50';
  } else if (score >= 65) {
    healthCategory = 'good';
    healthLabel = 'Good';
    healthColor = 'text-blue-600 bg-blue-50';
  } else if (score >= 50) {
    healthCategory = 'fair';
    healthLabel = 'Fair';
    healthColor = 'text-yellow-600 bg-yellow-50';
  } else if (score >= 35) {
    healthCategory = 'poor';
    healthLabel = 'Poor';
    healthColor = 'text-orange-600 bg-orange-50';
  }

  return {
    score: Math.round(score),
    category: healthCategory,
    label: healthLabel,
    color: healthColor,
    factors,
    recommendations: generatePipelineRecommendations(pipelineData, winRateData, score)
  };
};

/**
 * Generate pipeline improvement recommendations
 * @param {Object} pipelineData - Pipeline value data
 * @param {Object} winRateData - Win rate data
 * @param {number} healthScore - Overall health score
 * @returns {Array} Recommendations
 */
const generatePipelineRecommendations = (pipelineData, winRateData, healthScore) => {
  const recommendations = [];

  if (pipelineData.weightedPipelineValue < 250000) {
    recommendations.push({
      type: 'pipeline-value',
      priority: 'high',
      title: 'Increase Pipeline Value',
      description: 'Focus on adding more high-value deals to the pipeline'
    });
  }

  if (winRateData.overallWinRate < 25) {
    recommendations.push({
      type: 'win-rate',
      priority: 'high',
      title: 'Improve Win Rate',
      description: 'Analyze lost deals and improve qualification process'
    });
  }

  if (pipelineData.activeDealCount < 10) {
    recommendations.push({
      type: 'deal-activity',
      priority: 'medium',
      title: 'Increase Deal Activity',
      description: 'Generate more leads and opportunities'
    });
  }

  if (healthScore < 50) {
    recommendations.push({
      type: 'overall',
      priority: 'urgent',
      title: 'Pipeline Health Critical',
      description: 'Immediate attention needed for pipeline management'
    });
  }

  return recommendations;
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

const getPreviousPeriodDeals = (deals, timeframe) => {
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
  
  return deals.filter(deal => {
    const dealDate = new Date(deal.createdAt);
    return dealDate >= previousStart && dealDate < previousEnd;
  });
};

export default {
  calculatePipelineValue,
  calculateWinRate,
  getProbabilityByStage,
  getPipelineValueCategory,
  getWinRateCategory,
  calculatePipelineHealthScore
};