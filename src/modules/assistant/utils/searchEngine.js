import useLeadStore from '../../leads/stores/leadStore';
import useUserStore from '../../../stores/userStore';

// Search types
export const SEARCH_TYPES = {
  ALL: 'all',
  LEADS: 'leads',
  CONTACTS: 'contacts',
  ACTIVITIES: 'activities',
  DEALS: 'deals'
};

// Search filters
export const SEARCH_FILTERS = {
  dateRange: {
    TODAY: 'today',
    THIS_WEEK: 'this_week',
    THIS_MONTH: 'this_month',
    LAST_30_DAYS: 'last_30_days',
    CUSTOM: 'custom'
  },
  status: {
    ACTIVE: 'active',
    WON: 'won',
    LOST: 'lost',
    ALL: 'all'
  },
  priority: {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
    ALL: 'all'
  }
};

// Smart search function
export const performSmartSearch = (query, options = {}) => {
  const {
    type = SEARCH_TYPES.ALL,
    filters = {},
    limit = 20
  } = options;

  // Get current state from stores
  const leadStore = useLeadStore.getState();
  const leads = leadStore.leads || [];
  const users = useUserStore.getState().users || [];
  
  // Normalize query
  const normalizedQuery = query.toLowerCase().trim();
  
  console.log('Performing search:', { query, normalizedQuery, leadsCount: leads.length });
  
  // Search results
  const results = {
    leads: [],
    activities: [],
    suggestions: []
  };
  
  // Search leads
  if (type === SEARCH_TYPES.ALL || type === SEARCH_TYPES.LEADS) {
    results.leads = searchLeads(leads, normalizedQuery, filters);
  }
  
  // Search activities
  if (type === SEARCH_TYPES.ALL || type === SEARCH_TYPES.ACTIVITIES) {
    results.activities = searchActivities(leads, normalizedQuery, filters);
  }
  
  // Generate suggestions
  results.suggestions = generateSearchSuggestions(normalizedQuery, results);
  
  // Apply limit
  Object.keys(results).forEach(key => {
    if (Array.isArray(results[key])) {
      results[key] = results[key].slice(0, limit);
    }
  });
  
  console.log('Search results:', results);
  
  return results;
};

// Search leads function
const searchLeads = (leads, query, filters) => {
  if (!leads || leads.length === 0) {
    console.log('No leads available for search');
    return [];
  }
  
  return leads.filter(lead => {
    // If query is empty, return all leads (filtered by other criteria)
    let matchesQuery = true;
    
    if (query && query.length > 0) {
      matchesQuery = 
        lead.companyName?.toLowerCase().includes(query) ||
        lead.contactName?.toLowerCase().includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.phone?.includes(query) ||
        lead.location?.toLowerCase().includes(query) ||
        lead.notes?.toLowerCase().includes(query) ||
        lead.productInterest?.toLowerCase().includes(query) ||
        lead.tags?.some(tag => tag.toLowerCase().includes(query));
    }
    
    if (!matchesQuery) return false;
    
    // Apply filters
    if (filters.status && filters.status !== SEARCH_FILTERS.status.ALL) {
      if (filters.status === SEARCH_FILTERS.status.ACTIVE) {
        if (!['new', 'contacted', 'in_progress'].includes(lead.status)) return false;
      } else if (filters.status !== lead.status) {
        return false;
      }
    }
    
    // Date range filter
    if (filters.dateRange && filters.dateRange !== SEARCH_FILTERS.dateRange.CUSTOM) {
      const leadDate = new Date(lead.createdAt);
      const now = new Date();
      
      switch (filters.dateRange) {
        case SEARCH_FILTERS.dateRange.TODAY:
          if (leadDate.toDateString() !== now.toDateString()) return false;
          break;
        case SEARCH_FILTERS.dateRange.THIS_WEEK:
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          weekStart.setHours(0, 0, 0, 0);
          if (leadDate < weekStart) return false;
          break;
        case SEARCH_FILTERS.dateRange.THIS_MONTH:
          if (leadDate.getMonth() !== now.getMonth() || leadDate.getFullYear() !== now.getFullYear()) return false;
          break;
        case SEARCH_FILTERS.dateRange.LAST_30_DAYS:
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          if (leadDate < thirtyDaysAgo) return false;
          break;
      }
    }
    
    // Priority filter (based on tags)
    if (filters.priority && filters.priority !== SEARCH_FILTERS.priority.ALL) {
      const hasPriorityTag = lead.tags?.some(tag => 
        tag.toLowerCase().includes(filters.priority) || 
        tag.toLowerCase().includes('priority')
      );
      if (!hasPriorityTag) return false;
    }
    
    return true;
  }).map(lead => ({
    ...lead,
    type: 'lead',
    relevanceScore: calculateRelevanceScore(lead, query)
  })).sort((a, b) => b.relevanceScore - a.relevanceScore);
};

// Search activities function
const searchActivities = (leads, query, filters) => {
  const activities = [];
  
  leads.forEach(lead => {
    if (lead.activities) {
      lead.activities.forEach(activity => {
        const matchesQuery = 
          activity.description?.toLowerCase().includes(query) ||
          activity.type?.toLowerCase().includes(query) ||
          activity.user?.toLowerCase().includes(query);
        
        if (matchesQuery) {
          activities.push({
            ...activity,
            leadId: lead.id,
            leadName: lead.companyName,
            type: 'activity',
            relevanceScore: calculateActivityRelevanceScore(activity, query)
          });
        }
      });
    }
  });
  
  return activities.sort((a, b) => b.relevanceScore - a.relevanceScore);
};

// Calculate relevance score for leads
const calculateRelevanceScore = (lead, query) => {
  let score = 0;
  
  // Exact matches get higher scores
  if (lead.companyName?.toLowerCase() === query) score += 100;
  else if (lead.companyName?.toLowerCase().includes(query)) score += 50;
  
  if (lead.contactName?.toLowerCase() === query) score += 80;
  else if (lead.contactName?.toLowerCase().includes(query)) score += 40;
  
  // Recent leads get a boost
  const daysSinceCreated = (new Date() - new Date(lead.createdAt)) / (1000 * 60 * 60 * 24);
  if (daysSinceCreated < 7) score += 20;
  else if (daysSinceCreated < 30) score += 10;
  
  // High-value leads get a boost
  if (lead.dealValue > 50000) score += 15;
  else if (lead.dealValue > 10000) score += 10;
  
  // Active leads get a boost
  if (['new', 'contacted', 'in_progress'].includes(lead.status)) score += 15;
  
  return score;
};

// Calculate relevance score for activities
const calculateActivityRelevanceScore = (activity, query) => {
  let score = 0;
  
  if (activity.description?.toLowerCase().includes(query)) score += 50;
  if (activity.type?.toLowerCase() === query) score += 30;
  
  // Recent activities get a boost
  const daysSinceActivity = (new Date() - new Date(activity.timestamp)) / (1000 * 60 * 60 * 24);
  if (daysSinceActivity < 1) score += 30;
  else if (daysSinceActivity < 7) score += 20;
  else if (daysSinceActivity < 30) score += 10;
  
  return score;
};

// Generate search suggestions
const generateSearchSuggestions = (query, results) => {
  const suggestions = [];
  
  // Suggest related searches based on results
  if (results.leads.length > 0) {
    const locations = [...new Set(results.leads.map(l => l.location).filter(Boolean))];
    const sources = [...new Set(results.leads.map(l => l.source).filter(Boolean))];
    
    locations.slice(0, 2).forEach(location => {
      suggestions.push({
        type: 'location',
        text: `Leads in ${location}`,
        query: location
      });
    });
    
    sources.slice(0, 2).forEach(source => {
      suggestions.push({
        type: 'source',
        text: `Leads from ${source}`,
        query: source
      });
    });
  }
  
  // Add common search suggestions
  if (query.length < 3) {
    suggestions.push(
      { type: 'filter', text: 'New leads today', query: 'status:new date:today' },
      { type: 'filter', text: 'High-value deals', query: 'value:>50000' },
      { type: 'filter', text: 'Urgent follow-ups', query: 'tag:urgent' }
    );
  }
  
  return suggestions.slice(0, 5);
};

// Parse natural language queries
export const parseNaturalLanguageQuery = (query) => {
  const parsed = {
    text: query,
    filters: {},
    commands: []
  };
  
  // Check for date filters
  if (query.includes('today')) {
    parsed.filters.dateRange = SEARCH_FILTERS.dateRange.TODAY;
  } else if (query.includes('this week')) {
    parsed.filters.dateRange = SEARCH_FILTERS.dateRange.THIS_WEEK;
  } else if (query.includes('this month')) {
    parsed.filters.dateRange = SEARCH_FILTERS.dateRange.THIS_MONTH;
  }
  
  // Check for status filters
  if (query.includes('new')) {
    parsed.filters.status = 'new';
  } else if (query.includes('won') || query.includes('closed')) {
    parsed.filters.status = 'won';
  }
  
  // Check for priority
  if (query.includes('urgent') || query.includes('high priority')) {
    parsed.filters.priority = SEARCH_FILTERS.priority.HIGH;
  }
  
  // Extract main search term
  let cleanedQuery = query;
  ['today', 'this week', 'this month', 'new', 'won', 'closed', 'urgent', 'high priority'].forEach(term => {
    cleanedQuery = cleanedQuery.replace(term, '').trim();
  });
  parsed.text = cleanedQuery;
  
  return parsed;
};