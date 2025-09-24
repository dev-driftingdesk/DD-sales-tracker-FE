// Routing Weights for Matching Algorithm
export const MATCHING_WEIGHTS = {
  LOCATION: {
    SAME_CITY: 30,
    SAME_COUNTRY: 20,
    SAME_REGION: 10,
    DIFFERENT_REGION: 0
  },
  LANGUAGE: {
    NATIVE: 25,
    FLUENT: 15,
    BASIC: 5,
    NONE: 0
  },
  PERFORMANCE: {
    CONVERSION_RATE: 20,
    SIMILAR_DEALS: 15,
    TOTAL_REVENUE: 10
  },
  WORKLOAD: {
    UNDER_CAPACITY: 10,
    AT_CAPACITY: 5,
    OVER_CAPACITY: -10
  },
  EXPERTISE: {
    EXACT_MATCH: 15,
    RELATED: 10,
    GENERAL: 5
  }
};

// Lead Quality Scoring Factors
export const QUALITY_FACTORS = {
  SOURCE: {
    EVENT: 20,
    REFERRAL: 18,
    WEBSITE: 15,
    EMAIL: 12,
    FACEBOOK: 10,
    INSTAGRAM: 10,
    WHATSAPP: 8,
    MANUAL: 5
  },
  DEAL_VALUE: {
    HIGH: 25,      // > 50000
    MEDIUM: 15,    // 10000-50000
    LOW: 10,       // < 10000
    UNKNOWN: 5
  },
  COMPLETENESS: {
    COMPLETE: 15,
    PARTIAL: 8,
    MINIMAL: 3
  },
  ENGAGEMENT: {
    HIGH: 20,      // Multiple interactions
    MEDIUM: 10,    // Some interaction
    LOW: 5         // No interaction yet
  }
};

// Regions for geographic matching
export const REGIONS = {
  MIDDLE_EAST: ['Dubai', 'Riyadh', 'Kuwait', 'Doha', 'Muscat'],
  SOUTH_ASIA: ['Mumbai', 'Delhi', 'Colombo', 'Karachi', 'Dhaka', 'Jakarta'],
  EUROPE: ['London', 'Paris', 'Berlin', 'Amsterdam', 'Madrid'],
  AMERICAS: ['New York', 'Toronto', 'Mexico City', 'São Paulo'],
  EAST_ASIA: ['Singapore', 'Hong Kong', 'Tokyo', 'Shanghai', 'Seoul']
};

// Assignment Status
export const ASSIGNMENT_STATUS = {
  PENDING: 'pending',
  AUTO_ASSIGNED: 'auto_assigned',
  MANUALLY_ASSIGNED: 'manually_assigned',
  REJECTED: 'rejected',
  REASSIGNED: 'reassigned'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  NEW_ASSIGNMENT: 'new_assignment',
  FOLLOW_UP_REMINDER: 'follow_up_reminder',
  STALE_LEAD: 'stale_lead',
  HIGH_VALUE_LEAD: 'high_value_lead',
  STRATEGY_SUGGESTION: 'strategy_suggestion'
};

// Time-based Constants
export const TIME_CONSTANTS = {
  FOLLOW_UP_REMINDER_DAYS: 3,
  STALE_LEAD_DAYS: 7,
  NEW_LEAD_RESPONSE_HOURS: 24,
  OPTIMAL_CALL_HOURS: { start: 9, end: 17 } // 9 AM to 5 PM
};