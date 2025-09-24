import useLeadStore from '../../leads/stores/leadStore';
import useUserStore from '../../../stores/userStore';

/**
 * Generate strategy recommendations based on similar successful deals
 */
export const generateStrategyRecommendations = (lead, assignedUserId) => {
  const leadStore = useLeadStore.getState();
  const userStore = useUserStore.getState();
  const allLeads = leadStore.leads;
  const assignedUser = userStore.getUserById(assignedUserId);
  
  // Find similar successful deals
  const successfulDeals = allLeads.filter(l => 
    l.status === 'won' && 
    l.assignedTo === assignedUserId &&
    l.id !== lead.id
  );
  
  const strategies = [];
  
  // 1. Similar company/industry strategies
  const similarCompanyDeals = findSimilarCompanyDeals(lead, successfulDeals);
  if (similarCompanyDeals.length > 0) {
    strategies.push(...generateCompanyStrategies(similarCompanyDeals, lead));
  }
  
  // 2. Similar deal size strategies
  const similarSizeDeals = findSimilarSizeDeals(lead, successfulDeals);
  if (similarSizeDeals.length > 0) {
    strategies.push(...generateSizeStrategies(similarSizeDeals, lead));
  }
  
  // 3. Source-specific strategies
  const sameSourceDeals = successfulDeals.filter(deal => deal.source === lead.source);
  if (sameSourceDeals.length > 0) {
    strategies.push(...generateSourceStrategies(sameSourceDeals, lead));
  }
  
  // 4. General best practices
  strategies.push(...generateGeneralStrategies(lead, assignedUser));
  
  // Remove duplicates and prioritize
  return prioritizeStrategies(strategies);
};

/**
 * Find deals from similar companies or industries
 */
const findSimilarCompanyDeals = (lead, successfulDeals) => {
  return successfulDeals.filter(deal => {
    // Check for similar company names
    const leadCompany = lead.companyName?.toLowerCase() || '';
    const dealCompany = deal.companyName?.toLowerCase() || '';
    
    // Check for common keywords
    const keywords = ['trader', 'import', 'export', 'supermarket', 'hotel', 'restaurant', 'cafe'];
    const hasCommonKeyword = keywords.some(keyword => 
      leadCompany.includes(keyword) && dealCompany.includes(keyword)
    );
    
    // Check for similar locations
    const sameLocation = lead.location === deal.location;
    
    // Check for similar tags
    const commonTags = lead.tags?.filter(tag => 
      deal.tags?.includes(tag)
    ).length || 0;
    
    return hasCommonKeyword || sameLocation || commonTags > 0;
  });
};

/**
 * Find deals with similar value
 */
const findSimilarSizeDeals = (lead, successfulDeals) => {
  if (!lead.dealValue) return [];
  
  const variance = 0.3; // 30% variance
  const minValue = lead.dealValue * (1 - variance);
  const maxValue = lead.dealValue * (1 + variance);
  
  return successfulDeals.filter(deal => 
    deal.closedValue >= minValue && deal.closedValue <= maxValue
  );
};

/**
 * Generate strategies based on similar companies
 */
const generateCompanyStrategies = (similarDeals, lead) => {
  const strategies = [];
  
  // Analyze pricing patterns
  const avgClosedValue = similarDeals.reduce((sum, deal) => sum + (deal.closedValue || 0), 0) / similarDeals.length;
  const avgDealValue = similarDeals.reduce((sum, deal) => sum + (deal.dealValue || 0), 0) / similarDeals.length;
  
  if (avgClosedValue && avgDealValue) {
    const discountRate = ((avgDealValue - avgClosedValue) / avgDealValue) * 100;
    if (discountRate > 5) {
      strategies.push({
        type: 'pricing',
        priority: 'high',
        title: 'Pricing Strategy',
        description: `Similar deals typically close with ${Math.round(discountRate)}% discount. Consider offering volume discounts.`,
        reference: `Based on ${similarDeals.length} similar successful deals`
      });
    }
  }
  
  // Analyze successful approaches
  const mostSuccessfulDeal = similarDeals.sort((a, b) => 
    (b.closedValue || 0) - (a.closedValue || 0)
  )[0];
  
  if (mostSuccessfulDeal) {
    strategies.push({
      type: 'approach',
      priority: 'high',
      title: 'Successful Approach',
      description: `Use the ${mostSuccessfulDeal.productInterest} approach that worked with ${mostSuccessfulDeal.companyName}`,
      reference: `Closed at $${mostSuccessfulDeal.closedValue?.toLocaleString()}`
    });
  }
  
  return strategies;
};

/**
 * Generate strategies based on deal size
 */
const generateSizeStrategies = (similarSizeDeals, lead) => {
  const strategies = [];
  
  // Analyze closing timeline
  const avgDaysToClose = similarSizeDeals.reduce((sum, deal) => {
    const created = new Date(deal.createdAt);
    const closed = new Date(deal.closedDate);
    return sum + ((closed - created) / (1000 * 60 * 60 * 24));
  }, 0) / similarSizeDeals.length;
  
  strategies.push({
    type: 'timeline',
    priority: 'medium',
    title: 'Expected Timeline',
    description: `Similar deals typically close in ${Math.round(avgDaysToClose)} days. Plan follow-ups accordingly.`,
    reference: `Based on ${similarSizeDeals.length} deals of similar size`
  });
  
  // Payment terms analysis
  const hasWholesaleTag = lead.tags?.includes('wholesale');
  if (hasWholesaleTag && lead.dealValue > 25000) {
    strategies.push({
      type: 'payment',
      priority: 'medium',
      title: 'Payment Terms',
      description: 'Consider offering net-30 payment terms for wholesale orders above $25k',
      reference: 'Standard practice for wholesale accounts'
    });
  }
  
  return strategies;
};

/**
 * Generate source-specific strategies
 */
const generateSourceStrategies = (sameSourceDeals, lead) => {
  const strategies = [];
  
  // Response time analysis
  const responseStats = analyzeResponseTimes(sameSourceDeals);
  if (responseStats.avgHours < 24) {
    strategies.push({
      type: 'response',
      priority: 'high',
      title: 'Quick Response Critical',
      description: `${lead.source} leads convert best when contacted within ${Math.round(responseStats.avgHours)} hours`,
      reference: `${responseStats.successRate}% success rate with quick response`
    });
  }
  
  // Channel-specific tips
  const channelTips = {
    facebook: 'Follow up with WhatsApp for higher engagement',
    email: 'Send product catalog PDF in first response',
    website: 'Offer live chat or video call for product demo',
    event: 'Reference the specific event and booth interaction',
    whatsapp: 'Keep messages concise and use voice notes for complex discussions'
  };
  
  if (channelTips[lead.source]) {
    strategies.push({
      type: 'communication',
      priority: 'medium',
      title: 'Communication Tip',
      description: channelTips[lead.source],
      reference: `Best practice for ${lead.source} leads`
    });
  }
  
  return strategies;
};

/**
 * Generate general best practice strategies
 */
const generateGeneralStrategies = (lead, assignedUser) => {
  const strategies = [];
  
  // Language-specific strategies
  if (lead.language === 'arabic' && assignedUser?.languageProficiency?.arabic) {
    strategies.push({
      type: 'language',
      priority: 'high',
      title: 'Language Preference',
      description: 'Communicate in Arabic for better rapport. Use formal greetings initially.',
      reference: 'Cultural best practice'
    });
  }
  
  // Time zone considerations
  const locationTimeZones = {
    'Dubai': 'GST (UTC+4)',
    'London': 'GMT/BST',
    'Singapore': 'SGT (UTC+8)',
    'New York': 'EST/EDT'
  };
  
  const leadTimeZone = Object.entries(locationTimeZones).find(([city]) => 
    lead.location?.includes(city)
  )?.[1];
  
  if (leadTimeZone) {
    strategies.push({
      type: 'timing',
      priority: 'low',
      title: 'Optimal Contact Time',
      description: `Schedule calls during business hours in ${leadTimeZone}`,
      reference: 'Timezone consideration'
    });
  }
  
  // Product-specific strategies
  if (lead.productInterest?.toLowerCase().includes('organic')) {
    strategies.push({
      type: 'product',
      priority: 'medium',
      title: 'Product Focus',
      description: 'Emphasize certifications and sustainable sourcing for organic products',
      reference: 'Product positioning'
    });
  }
  
  return strategies;
};

/**
 * Analyze response times from successful deals
 */
const analyzeResponseTimes = (deals) => {
  const withResponseTime = deals.filter(deal => 
    deal.activities && deal.activities.length > 0
  );
  
  if (withResponseTime.length === 0) {
    return { avgHours: 24, successRate: 0 };
  }
  
  const responseTimes = withResponseTime.map(deal => {
    const firstActivity = deal.activities.sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    )[0];
    
    const created = new Date(deal.createdAt);
    const firstContact = new Date(firstActivity.timestamp);
    return (firstContact - created) / (1000 * 60 * 60); // hours
  });
  
  const avgHours = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  const successRate = Math.round((withResponseTime.length / deals.length) * 100);
  
  return { avgHours, successRate };
};

/**
 * Prioritize and deduplicate strategies
 */
const prioritizeStrategies = (strategies) => {
  // Remove duplicates based on description
  const unique = strategies.filter((strategy, index, self) =>
    index === self.findIndex(s => s.description === strategy.description)
  );
  
  // Sort by priority
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  unique.sort((a, b) => 
    priorityOrder[b.priority] - priorityOrder[a.priority]
  );
  
  // Return top 5 strategies
  return unique.slice(0, 5);
};

/**
 * Generate follow-up reminders based on lead status and activity
 */
export const generateFollowUpReminders = (lead) => {
  const reminders = [];
  const now = new Date();
  
  // Check last activity
  const lastActivity = lead.activities?.sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  )[0];
  
  const daysSinceLastActivity = lastActivity
    ? (now - new Date(lastActivity.timestamp)) / (1000 * 60 * 60 * 24)
    : (now - new Date(lead.createdAt)) / (1000 * 60 * 60 * 24);
  
  // Generate reminders based on status
  switch (lead.status) {
    case 'new':
      if (daysSinceLastActivity > 0.5) {
        reminders.push({
          type: 'urgent',
          message: 'New lead requires immediate attention',
          action: 'Make first contact',
          overdue: true
        });
      }
      break;
      
    case 'contacted':
      if (daysSinceLastActivity > 3) {
        reminders.push({
          type: 'follow-up',
          message: `No activity for ${Math.round(daysSinceLastActivity)} days`,
          action: 'Send follow-up message or schedule call',
          overdue: daysSinceLastActivity > 5
        });
      }
      break;
      
    case 'in_progress':
      if (daysSinceLastActivity > 7) {
        reminders.push({
          type: 'check-in',
          message: 'Deal may be stalling',
          action: 'Check on deal progress and address concerns',
          overdue: daysSinceLastActivity > 10
        });
      }
      break;
  }
  
  // Special reminders for high-value leads
  if (lead.dealValue > 50000 && daysSinceLastActivity > 2) {
    reminders.push({
      type: 'high-value',
      message: 'High-value lead needs attention',
      action: 'Prioritize this lead',
      overdue: false
    });
  }
  
  return reminders;
};