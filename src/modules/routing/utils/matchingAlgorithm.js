import { MATCHING_WEIGHTS, REGIONS } from '../constants/routingConstants';
import useUserStore from '../../../stores/userStore.jsx';
import usePerformanceStore from '../../performance/stores/performanceStore';

/**
 * Calculate match score between a lead and a sales rep
 */
export const calculateMatchScore = (lead, user, leadAnalysis) => {
  let score = 0;
  const breakdown = {};
  
  // 1. Location Matching (max 30 points)
  const locationScore = calculateLocationScore(lead.location, user.location);
  score += locationScore;
  breakdown.location = locationScore;
  
  // 2. Language Matching (max 25 points)
  const languageScore = calculateLanguageScore(lead, user, leadAnalysis);
  score += languageScore;
  breakdown.language = languageScore;
  
  // 3. Performance Matching (max 45 points)
  const performanceScore = calculatePerformanceScore(lead, user);
  score += performanceScore;
  breakdown.performance = performanceScore;
  
  // 4. Workload Balancing (max 10 points, can be negative)
  const workloadScore = calculateWorkloadScore(user);
  score += workloadScore;
  breakdown.workload = workloadScore;
  
  // 5. Expertise Matching (max 15 points)
  const expertiseScore = calculateExpertiseScore(lead, user, leadAnalysis);
  score += expertiseScore;
  breakdown.expertise = expertiseScore;
  
  // 6. Bonus Points (max 10 points)
  const bonusScore = calculateBonusScore(lead, user);
  score += bonusScore;
  breakdown.bonus = bonusScore;
  
  return {
    userId: user.id,
    userName: user.name,
    totalScore: Math.max(0, Math.round(score)),
    breakdown,
    reasons: generateMatchReasons(breakdown, user, lead)
  };
};

/**
 * Calculate location matching score
 */
const calculateLocationScore = (leadLocation, userLocation) => {
  if (!leadLocation || !userLocation) return 0;
  
  // Exact city match
  if (leadLocation.toLowerCase() === userLocation.toLowerCase()) {
    return MATCHING_WEIGHTS.LOCATION.SAME_CITY;
  }
  
  // Check if in same region
  for (const [region, cities] of Object.entries(REGIONS)) {
    const leadInRegion = cities.some(city => 
      leadLocation.toLowerCase().includes(city.toLowerCase())
    );
    const userInRegion = cities.some(city => 
      userLocation.toLowerCase().includes(city.toLowerCase())
    );
    
    if (leadInRegion && userInRegion) {
      // Check if same country (simplified - would need country mapping in real app)
      const leadCountry = extractCountry(leadLocation);
      const userCountry = extractCountry(userLocation);
      
      if (leadCountry === userCountry) {
        return MATCHING_WEIGHTS.LOCATION.SAME_COUNTRY;
      }
      return MATCHING_WEIGHTS.LOCATION.SAME_REGION;
    }
  }
  
  return MATCHING_WEIGHTS.LOCATION.DIFFERENT_REGION;
};

/**
 * Extract country from location string (simplified)
 */
const extractCountry = (location) => {
  const countryMap = {
    'dubai': 'UAE', 'abu dhabi': 'UAE',
    'london': 'UK', 'manchester': 'UK',
    'new york': 'USA', 'los angeles': 'USA',
    'singapore': 'Singapore',
    'mumbai': 'India', 'delhi': 'India',
    'jakarta': 'Indonesia',
    'colombo': 'Sri Lanka'
  };
  
  const locationLower = location.toLowerCase();
  for (const [city, country] of Object.entries(countryMap)) {
    if (locationLower.includes(city)) return country;
  }
  
  // Try to extract from format "City, Country"
  const parts = location.split(',');
  return parts.length > 1 ? parts[parts.length - 1].trim() : location;
};

/**
 * Calculate language matching score
 */
const calculateLanguageScore = (lead, user, leadAnalysis) => {
  const requiredLanguage = lead.language || (leadAnalysis.requiresArabicSpeaker ? 'arabic' : 'english');
  const userProficiency = user.languageProficiency || {};
  
  const proficiencyLevel = userProficiency[requiredLanguage];
  
  switch (proficiencyLevel) {
    case 'native':
      return MATCHING_WEIGHTS.LANGUAGE.NATIVE;
    case 'fluent':
      return MATCHING_WEIGHTS.LANGUAGE.FLUENT;
    case 'basic':
      return MATCHING_WEIGHTS.LANGUAGE.BASIC;
    default:
      return MATCHING_WEIGHTS.LANGUAGE.NONE;
  }
};

/**
 * Calculate performance matching score
 */
const calculatePerformanceScore = (lead, user) => {
  let score = 0;
  
  // Get user's performance data
  const performanceStore = usePerformanceStore.getState();
  const userPerformance = performanceStore.calculateUserKPIs(user.id, 'month');
  
  // 1. Conversion rate component
  const conversionRate = userPerformance.conversionRate || 0;
  score += (conversionRate / 100) * MATCHING_WEIGHTS.PERFORMANCE.CONVERSION_RATE;
  
  // 2. Source-specific success rate
  if (user.successRateBySource && lead.source) {
    const sourceSuccess = user.successRateBySource[lead.source] || 0.5;
    score += sourceSuccess * MATCHING_WEIGHTS.PERFORMANCE.SIMILAR_DEALS;
  }
  
  // 3. Deal size experience
  if (lead.dealValue && user.preferredDealSize) {
    const { min, max } = user.preferredDealSize;
    if (lead.dealValue >= min && lead.dealValue <= max) {
      score += MATCHING_WEIGHTS.PERFORMANCE.TOTAL_REVENUE * 0.5;
    }
  }
  
  return score;
};

/**
 * Calculate workload score
 */
const calculateWorkloadScore = (user) => {
  const currentLoad = user.currentActiveLeads || 0;
  const maxLoad = user.maxActiveLeads || 20;
  const loadPercentage = (currentLoad / maxLoad) * 100;
  
  if (loadPercentage < 70) {
    return MATCHING_WEIGHTS.WORKLOAD.UNDER_CAPACITY;
  } else if (loadPercentage <= 90) {
    return MATCHING_WEIGHTS.WORKLOAD.AT_CAPACITY;
  } else {
    return MATCHING_WEIGHTS.WORKLOAD.OVER_CAPACITY;
  }
};

/**
 * Calculate expertise matching score
 */
const calculateExpertiseScore = (lead, user, leadAnalysis) => {
  const userExpertise = user.expertise || [];
  const suggestedExpertise = leadAnalysis.suggestedExpertise || [];
  
  // Check for exact matches
  const exactMatches = suggestedExpertise.filter(exp => 
    userExpertise.includes(exp)
  ).length;
  
  if (exactMatches > 0) {
    return MATCHING_WEIGHTS.EXPERTISE.EXACT_MATCH;
  }
  
  // Check for related expertise
  const relatedTerms = {
    'wholesale': ['bulk', 'distribution'],
    'retail': ['store', 'shop'],
    'premium-tea': ['luxury-tea', 'specialty-tea'],
    'organic': ['natural', 'eco-friendly']
  };
  
  for (const suggested of suggestedExpertise) {
    const related = relatedTerms[suggested] || [];
    if (userExpertise.some(exp => related.includes(exp))) {
      return MATCHING_WEIGHTS.EXPERTISE.RELATED;
    }
  }
  
  // General expertise
  if (userExpertise.length > 0) {
    return MATCHING_WEIGHTS.EXPERTISE.GENERAL;
  }
  
  return 0;
};

/**
 * Calculate bonus points
 */
const calculateBonusScore = (lead, user) => {
  let bonus = 0;
  
  // High-value lead to top performer
  if (lead.dealValue > 50000) {
    const performanceStore = usePerformanceStore.getState();
    const leaderboard = performanceStore.leaderboard;
    const userRank = leaderboard.find(u => u.id === user.id)?.rank;
    
    if (userRank && userRank <= 3) {
      bonus += 5;
    }
  }
  
  // Previous successful relationship
  if (lead.notes?.includes(user.name) || lead.tags?.includes(`assigned-to-${user.id}`)) {
    bonus += 5;
  }
  
  return bonus;
};

/**
 * Generate human-readable reasons for the match
 */
const generateMatchReasons = (breakdown, user, lead) => {
  const reasons = [];
  
  // Location reason
  if (breakdown.location >= MATCHING_WEIGHTS.LOCATION.SAME_CITY) {
    reasons.push(`Located in ${user.location}`);
  } else if (breakdown.location >= MATCHING_WEIGHTS.LOCATION.SAME_COUNTRY) {
    reasons.push('Same country coverage');
  }
  
  // Language reason
  if (breakdown.language >= MATCHING_WEIGHTS.LANGUAGE.FLUENT) {
    const lang = lead.language || 'required language';
    reasons.push(`Speaks ${lang}`);
  }
  
  // Performance reason
  if (breakdown.performance >= 15) {
    const sourceSuccess = user.successRateBySource?.[lead.source];
    if (sourceSuccess > 0.8) {
      reasons.push(`${Math.round(sourceSuccess * 100)}% success rate with ${lead.source} leads`);
    } else {
      reasons.push('High conversion rate');
    }
  }
  
  // Workload reason
  if (breakdown.workload === MATCHING_WEIGHTS.WORKLOAD.UNDER_CAPACITY) {
    reasons.push('Available capacity');
  }
  
  // Expertise reason
  if (breakdown.expertise >= MATCHING_WEIGHTS.EXPERTISE.RELATED) {
    reasons.push('Relevant expertise');
  }
  
  return reasons;
};

/**
 * Find best matches for a lead
 */
export const findBestMatches = (lead, leadAnalysis, limit = 3) => {
  const userStore = useUserStore.getState();
  const salesReps = userStore.users.filter(u => 
    u.role === 'sales_rep' && u.isActive
  );
  
  const matches = salesReps.map(user => 
    calculateMatchScore(lead, user, leadAnalysis)
  );
  
  // Sort by total score descending
  matches.sort((a, b) => b.totalScore - a.totalScore);
  
  return matches.slice(0, limit);
};