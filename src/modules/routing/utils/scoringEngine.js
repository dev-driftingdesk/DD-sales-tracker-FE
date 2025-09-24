import { QUALITY_FACTORS } from '../constants/routingConstants';

/**
 * Calculate lead quality score (0-100)
 */
export const calculateLeadQualityScore = (lead) => {
  let score = 0;
  
  // 1. Source Score (max 20 points)
  const sourceScore = QUALITY_FACTORS.SOURCE[lead.source?.toUpperCase()] || QUALITY_FACTORS.SOURCE.MANUAL;
  score += sourceScore;
  
  // 2. Deal Value Score (max 25 points)
  if (lead.dealValue) {
    if (lead.dealValue > 50000) {
      score += QUALITY_FACTORS.DEAL_VALUE.HIGH;
    } else if (lead.dealValue >= 10000) {
      score += QUALITY_FACTORS.DEAL_VALUE.MEDIUM;
    } else {
      score += QUALITY_FACTORS.DEAL_VALUE.LOW;
    }
  } else {
    score += QUALITY_FACTORS.DEAL_VALUE.UNKNOWN;
  }
  
  // 3. Completeness Score (max 15 points)
  const requiredFields = ['companyName', 'contactName', 'email', 'phone', 'location'];
  const optionalFields = ['productInterest', 'language', 'notes', 'tags'];
  
  const filledRequired = requiredFields.filter(field => lead[field]).length;
  const filledOptional = optionalFields.filter(field => 
    lead[field] && (Array.isArray(lead[field]) ? lead[field].length > 0 : true)
  ).length;
  
  if (filledRequired === requiredFields.length && filledOptional >= 2) {
    score += QUALITY_FACTORS.COMPLETENESS.COMPLETE;
  } else if (filledRequired >= 4) {
    score += QUALITY_FACTORS.COMPLETENESS.PARTIAL;
  } else {
    score += QUALITY_FACTORS.COMPLETENESS.MINIMAL;
  }
  
  // 4. Engagement Score (max 20 points)
  const activities = lead.activities || [];
  const recentActivities = activities.filter(activity => {
    const daysSince = (new Date() - new Date(activity.timestamp)) / (1000 * 60 * 60 * 24);
    return daysSince <= 7;
  });
  
  if (recentActivities.length >= 3) {
    score += QUALITY_FACTORS.ENGAGEMENT.HIGH;
  } else if (recentActivities.length >= 1) {
    score += QUALITY_FACTORS.ENGAGEMENT.MEDIUM;
  } else {
    score += QUALITY_FACTORS.ENGAGEMENT.LOW;
  }
  
  // 5. Bonus points for specific indicators (max 20 points)
  const bonusPoints = calculateBonusPoints(lead);
  score += bonusPoints;
  
  // Ensure score is between 0 and 100
  return Math.min(Math.max(Math.round(score), 0), 100);
};

/**
 * Calculate bonus points based on special indicators
 */
const calculateBonusPoints = (lead) => {
  let bonus = 0;
  
  // High-priority tags
  const highPriorityTags = ['urgent', 'hot-lead', 'high-priority', 'vip'];
  if (lead.tags?.some(tag => highPriorityTags.includes(tag.toLowerCase()))) {
    bonus += 10;
  }
  
  // Referral source
  if (lead.source === 'referral') {
    bonus += 5;
  }
  
  // Previous customer
  if (lead.tags?.includes('repeat-customer')) {
    bonus += 5;
  }
  
  return bonus;
};

/**
 * Calculate urgency level based on lead age and status
 */
export const calculateUrgencyLevel = (lead) => {
  const now = new Date();
  const createdDate = new Date(lead.createdAt);
  const hoursSinceCreation = (now - createdDate) / (1000 * 60 * 60);
  
  // New leads need immediate attention
  if (lead.status === 'new') {
    if (hoursSinceCreation < 2) return 'critical';
    if (hoursSinceCreation < 24) return 'high';
    if (hoursSinceCreation < 72) return 'medium';
    return 'low';
  }
  
  // For other statuses, check last activity
  const lastActivity = lead.activities?.sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  )[0];
  
  if (lastActivity) {
    const hoursSinceActivity = (now - new Date(lastActivity.timestamp)) / (1000 * 60 * 60);
    if (hoursSinceActivity > 72 && lead.status === 'contacted') return 'high';
    if (hoursSinceActivity > 120) return 'medium';
  }
  
  return 'normal';
};

/**
 * Analyze lead for routing hints
 */
export const analyzeLeadForRouting = (lead) => {
  const analysis = {
    requiresArabicSpeaker: false,
    requiresLocalPresence: false,
    isHighValue: false,
    suggestedExpertise: [],
    urgencyLevel: calculateUrgencyLevel(lead)
  };
  
  // Language requirements
  if (lead.language === 'arabic' || lead.location?.match(/Dubai|Riyadh|Kuwait|Doha/)) {
    analysis.requiresArabicSpeaker = true;
  }
  
  // Local presence requirements
  if (lead.tags?.includes('requires-site-visit') || lead.notes?.toLowerCase().includes('visit')) {
    analysis.requiresLocalPresence = true;
  }
  
  // High value indicator
  if (lead.dealValue > 50000 || lead.tags?.includes('high-value')) {
    analysis.isHighValue = true;
  }
  
  // Expertise suggestions based on product interest
  if (lead.productInterest) {
    const interest = lead.productInterest.toLowerCase();
    if (interest.includes('wholesale')) {
      analysis.suggestedExpertise.push('wholesale');
    }
    if (interest.includes('premium') || interest.includes('luxury')) {
      analysis.suggestedExpertise.push('premium-tea', 'luxury-tea');
    }
    if (interest.includes('organic')) {
      analysis.suggestedExpertise.push('organic');
    }
    if (interest.includes('retail')) {
      analysis.suggestedExpertise.push('retail');
    }
  }
  
  // Industry suggestions
  if (lead.companyName) {
    const company = lead.companyName.toLowerCase();
    if (company.includes('hotel') || company.includes('resort')) {
      analysis.suggestedExpertise.push('hospitality');
    }
    if (company.includes('supermarket') || company.includes('mart')) {
      analysis.suggestedExpertise.push('retail', 'distribution');
    }
  }
  
  return analysis;
};