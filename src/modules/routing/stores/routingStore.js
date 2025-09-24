import { create } from 'zustand';
import { calculateLeadQualityScore, analyzeLeadForRouting } from '../utils/scoringEngine';
import { findBestMatches } from '../utils/matchingAlgorithm';
import { generateStrategyRecommendations, generateFollowUpReminders } from '../utils/strategyEngine';
import { ASSIGNMENT_STATUS, NOTIFICATION_TYPES } from '../constants/routingConstants';
import useLeadStore from '../../leads/stores/leadStore';
import useUserStore from '../../../stores/userStore';

// Initialize routing data with realistic scenarios
const initializeRoutingData = () => {
  const now = Date.now();
  
  // Unassigned leads with various characteristics for routing demo
  const unassignedLeads = [
    {
      id: 'unassigned-1',
      companyName: 'Royal Emirates Hotels',
      contactName: 'Ahmed Al-Rashid',
      email: 'procurement@royalemirateshotels.ae',
      phone: '+971-4-555-0101',
      location: 'Dubai, UAE',
      source: 'event',
      dealValue: 125000,
      productInterest: 'Premium tea collections for luxury hotel chain',
      language: 'arabic',
      createdAt: new Date(now - 45 * 60 * 1000).toISOString(), // 45 minutes ago
      status: 'new',
      notes: 'Interested in exclusive premium tea blends for 12 hotel properties. Requires Arabic-speaking representative.',
      tags: ['high-value', 'hospitality', 'arabic-required'],
      activities: [{
        id: 'ua1',
        type: 'Inbound',
        description: 'Submitted inquiry through trade show contact form',
        timestamp: new Date(now - 45 * 60 * 1000).toISOString()
      }]
    },
    {
      id: 'unassigned-2', 
      companyName: 'Mumbai Wholesale Market',
      contactName: 'Priya Sharma',
      email: 'priya@mumbaimarket.in',
      phone: '+91-22-555-0202',
      location: 'Mumbai, India',
      source: 'referral',
      dealValue: 85000,
      productInterest: 'Bulk tea supplies for wholesale distribution',
      language: 'english',
      createdAt: new Date(now - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
      status: 'new',
      notes: 'Referred by existing customer. Looking for consistent bulk supply with competitive pricing.',
      tags: ['wholesale', 'bulk-orders', 'referral'],
      activities: [{
        id: 'ua2',
        type: 'Referral',
        description: 'Referred by Dubai Tea Palace (existing customer)',
        timestamp: new Date(now - 18 * 60 * 60 * 1000).toISOString()
      }]
    },
    {
      id: 'unassigned-3',
      companyName: 'London Specialty Foods',
      contactName: 'James Fletcher',
      email: 'james@londonspecialty.co.uk', 
      phone: '+44-20-555-0303',
      location: 'London, UK',
      source: 'website',
      dealValue: 42000,
      productInterest: 'Organic and specialty tea varieties for retail',
      language: 'english',
      createdAt: new Date(now - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      status: 'new',
      notes: 'High-end retail chain focusing on organic and fair-trade products. Urgency due to new store opening.',
      tags: ['organic', 'retail', 'urgent'],
      activities: [{
        id: 'ua3',
        type: 'Web Form',
        description: 'Completed detailed product inquiry on website',
        timestamp: new Date(now - 6 * 60 * 60 * 1000).toISOString()
      }]
    },
    {
      id: 'unassigned-4',
      companyName: 'Singapore Café Chain',
      contactName: 'Li Wei Chen',
      email: 'procurement@sgcafechain.sg',
      phone: '+65-6555-0404',
      location: 'Singapore',
      source: 'email',
      dealValue: 28000,
      productInterest: 'Tea supplies for 15 café locations',
      language: 'english',
      createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      status: 'new',
      notes: 'Expanding café chain needs reliable tea supplier. Price-sensitive but volume potential.',
      tags: ['café-chain', 'volume-potential'],
      activities: [{
        id: 'ua4',
        type: 'Email',
        description: 'Initial inquiry via email about wholesale tea options',
        timestamp: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString()
      }]
    },
    {
      id: 'unassigned-5',
      companyName: 'Australian Tea Boutique',
      contactName: 'Sarah Mitchell',
      email: 'sarah@austeaboutique.com.au',
      phone: '+61-2-555-0505',
      location: 'Sydney, Australia', 
      source: 'instagram',
      dealValue: 15000,
      productInterest: 'Premium loose leaf teas for boutique store',
      language: 'english',
      createdAt: new Date(now - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      status: 'new',
      notes: 'Boutique tea store owner interested in exclusive premium blends. Small order but high-margin potential.',
      tags: ['boutique', 'premium', 'small-order'],
      activities: [{
        id: 'ua5',
        type: 'Social Media',
        description: 'Contacted via Instagram DM after seeing product posts',
        timestamp: new Date(now - 30 * 60 * 1000).toISOString()
      }]
    },
    {
      id: 'unassigned-6',
      companyName: 'German Import Solutions',
      contactName: 'Klaus Weber',
      email: 'klaus@germanimport.de',
      phone: '+49-30-555-0606',
      location: 'Berlin, Germany',
      source: 'website',
      dealValue: 95000,
      productInterest: 'European distribution partnership for premium teas',
      language: 'english',
      createdAt: new Date(now - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      status: 'new',
      notes: 'Established importer looking for exclusive European distribution rights. High-value long-term partnership potential.',
      tags: ['distribution', 'partnership', 'europe', 'high-value'],
      activities: [{
        id: 'ua6',
        type: 'Web Form',
        description: 'Submitted partnership inquiry form with detailed business plan',
        timestamp: new Date(now - 4 * 60 * 60 * 1000).toISOString()
      }]
    }
  ];

  // Sample assignment history with realistic scenarios
  const assignmentHistory = [
    {
      id: 'ah1',
      leadId: '8', // Dubai Tea Palace (from leadStore)
      userId: 'user-1', // Sara Ahmed
      assignmentType: 'auto_assigned',
      matchScore: 92,
      timestamp: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
      strategies: ['location_advantage', 'arabic_speaker', 'hospitality_experience']
    },
    {
      id: 'ah2',
      leadId: '9', // Jakarta Tea Trading (from leadStore) 
      userId: 'user-2', // Jacob Williams
      assignmentType: 'manually_assigned',
      matchScore: 75,
      timestamp: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
      reason: 'Regional expertise override',
      strategies: ['regional_knowledge', 'bulk_orders', 'price_negotiation']
    },
    {
      id: 'ah3',
      leadId: '10', // Sydney Tea Merchants (from leadStore)
      userId: 'user-3', // Mike Johnson  
      assignmentType: 'auto_assigned',
      matchScore: 88,
      timestamp: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
      strategies: ['location_match', 'premium_specialist', 'established_relationship']
    },
    {
      id: 'ah4',
      leadId: 'temp-lead-1', // Simulated past lead
      userId: 'user-4', // Emily Chen
      assignmentType: 'auto_assigned',
      matchScore: 85,
      timestamp: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
      strategies: ['language_match', 'retail_expertise', 'quick_response']
    },
    {
      id: 'ah5',
      leadId: 'temp-lead-2', // Simulated past lead
      userId: 'user-5', // David Rodriguez
      assignmentType: 'manually_assigned',
      matchScore: 70,
      timestamp: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
      reason: 'Workload balancing',
      strategies: ['capacity_available', 'wholesale_experience', 'follow_up_specialist']
    }
  ];

  // Sample notifications for routing activities
  const notifications = [
    {
      id: 'rn1',
      type: 'new_assignment',
      message: 'New high-value lead "Royal Emirates Hotels" requires immediate assignment',
      priority: 'critical',
      timestamp: new Date(now - 45 * 60 * 1000).toISOString(),
      read: false,
      data: {
        leadId: 'unassigned-1',
        dealValue: 125000,
        urgency: 'critical'
      }
    },
    {
      id: 'rn2',
      type: 'follow_up_reminder',
      userId: 'user-2',
      leadId: '9',
      message: 'Jakarta Tea Trading: Follow-up call overdue by 1 day',
      priority: 'high',
      timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      read: false
    },
    {
      id: 'rn3',
      type: 'strategy_suggestion',
      userId: 'user-1',
      leadId: '8',
      message: 'Dubai Tea Palace: Consider premium sampling approach',
      priority: 'medium',
      timestamp: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
      read: false
    },
    {
      id: 'rn4',
      type: 'high_value_lead',
      message: 'German Import Solutions: €95K partnership opportunity needs expert attention',
      priority: 'high',
      timestamp: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
      read: false,
      data: {
        leadId: 'unassigned-6',
        dealValue: 95000,
        type: 'partnership'
      }
    },
    {
      id: 'rn5',
      type: 'stale_lead',
      userId: 'user-4',
      leadId: 'temp-lead-3',
      message: 'Bangkok Restaurant Group: No activity for 7 days',
      priority: 'medium',
      timestamp: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
      read: true
    }
  ];

  return { unassignedLeads, assignmentHistory, notifications };
};

const useRoutingStore = create((set, get) => ({
  routingQueue: [],
  notifications: [],
  assignmentHistory: [],
  autoRoutingEnabled: true,
  routingRules: {
    minMatchScore: 60,
    autoAssignThreshold: 80,
    maxLeadsPerRep: 25,
    prioritizeByValue: true,
    prioritizeByUrgency: true
  },
  
  // Process a new lead for routing
  processLeadForRouting: (lead) => {
    const state = get();
    
    // Calculate lead quality score
    const qualityScore = calculateLeadQualityScore(lead);
    
    // Analyze lead for routing hints
    const leadAnalysis = analyzeLeadForRouting(lead);
    
    // Find best matches
    const matches = findBestMatches(lead, leadAnalysis, 5);
    
    // Enhanced lead object
    const enhancedLead = {
      ...lead,
      qualityScore,
      urgencyLevel: leadAnalysis.urgencyLevel,
      routingAnalysis: leadAnalysis,
      recommendedAssignments: matches,
      routingStatus: ASSIGNMENT_STATUS.PENDING
    };
    
    // Add to routing queue
    set(state => ({
      routingQueue: [...state.routingQueue, enhancedLead]
    }));
    
    // Auto-assign if enabled and match score is high enough
    if (state.autoRoutingEnabled && matches[0]?.totalScore >= state.routingRules.autoAssignThreshold) {
      get().autoAssignLead(enhancedLead.id, matches[0].userId);
    } else {
      // Create notification for manual assignment
      get().createNotification({
        type: NOTIFICATION_TYPES.NEW_ASSIGNMENT,
        leadId: enhancedLead.id,
        message: `New lead "${enhancedLead.companyName}" requires assignment`,
        priority: leadAnalysis.urgencyLevel,
        data: { lead: enhancedLead, matches }
      });
    }
    
    return enhancedLead;
  },
  
  // Auto-assign a lead
  autoAssignLead: (leadId, userId) => {
    const state = get();
    const lead = state.routingQueue.find(l => l.id === leadId);
    if (!lead) return;
    
    // Update lead store
    useLeadStore.getState().updateLead(leadId, { assignedTo: userId });
    
    // Update user's active lead count
    const users = useUserStore.getState().users;
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].currentActiveLeads = (users[userIndex].currentActiveLeads || 0) + 1;
    }
    
    // Generate strategy recommendations
    const strategies = generateStrategyRecommendations(lead, userId);
    
    // Record assignment
    const assignment = {
      id: Date.now().toString(),
      leadId,
      userId,
      assignmentType: ASSIGNMENT_STATUS.AUTO_ASSIGNED,
      matchScore: lead.recommendedAssignments?.[0]?.totalScore || 0,
      timestamp: new Date().toISOString(),
      strategies
    };
    
    set(state => ({
      assignmentHistory: [...state.assignmentHistory, assignment],
      routingQueue: state.routingQueue.filter(l => l.id !== leadId)
    }));
    
    // Create notification for assigned user
    get().createNotification({
      type: NOTIFICATION_TYPES.NEW_ASSIGNMENT,
      userId,
      leadId,
      message: `New lead assigned: ${lead.companyName}`,
      priority: lead.urgencyLevel,
      data: { lead, strategies }
    });
    
    return assignment;
  },
  
  // Manually assign a lead
  manuallyAssignLead: (leadId, userId, reason) => {
    const state = get();
    const lead = state.routingQueue.find(l => l.id === leadId);
    if (!lead) return;
    
    // Similar to auto-assign but with manual flag
    useLeadStore.getState().updateLead(leadId, { assignedTo: userId });
    
    const strategies = generateStrategyRecommendations(lead, userId);
    
    const assignment = {
      id: Date.now().toString(),
      leadId,
      userId,
      assignmentType: ASSIGNMENT_STATUS.MANUALLY_ASSIGNED,
      reason,
      timestamp: new Date().toISOString(),
      strategies
    };
    
    set(state => ({
      assignmentHistory: [...state.assignmentHistory, assignment],
      routingQueue: state.routingQueue.filter(l => l.id !== leadId)
    }));
    
    return assignment;
  },
  
  // Create a notification
  createNotification: (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      ...notification,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    set(state => ({
      notifications: [newNotification, ...state.notifications]
    }));
    
    return newNotification;
  },
  
  // Mark notification as read
  markNotificationRead: (notificationId) => {
    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    }));
  },
  
  // Get unassigned leads from routing queue
  getUnassignedLeads: () => {
    const state = get();
    const { prioritizeByValue, prioritizeByUrgency } = state.routingRules;
    
    let sorted = [...state.routingQueue];
    
    // Sort by priority
    sorted.sort((a, b) => {
      if (prioritizeByUrgency) {
        const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1, normal: 0 };
        const urgencyDiff = urgencyOrder[b.urgencyLevel] - urgencyOrder[a.urgencyLevel];
        if (urgencyDiff !== 0) return urgencyDiff;
      }
      
      if (prioritizeByValue) {
        return (b.dealValue || 0) - (a.dealValue || 0);
      }
      
      return b.qualityScore - a.qualityScore;
    });
    
    return sorted;
  },
  
  // Get notifications for a specific user
  getUserNotifications: (userId) => {
    const state = get();
    return state.notifications.filter(n => 
      !n.userId || n.userId === userId
    );
  },
  
  // Update routing rules
  updateRoutingRules: (rules) => {
    set(state => ({
      routingRules: { ...state.routingRules, ...rules }
    }));
  },
  
  // Toggle auto-routing
  toggleAutoRouting: () => {
    set(state => ({
      autoRoutingEnabled: !state.autoRoutingEnabled
    }));
  },
  
  // Get assignment history for a lead
  getLeadAssignmentHistory: (leadId) => {
    const state = get();
    return state.assignmentHistory.filter(a => a.leadId === leadId);
  },
  
  // Get assignment history for a user
  getUserAssignmentHistory: (userId) => {
    const state = get();
    return state.assignmentHistory.filter(a => a.userId === userId);
  },
  
  // Process follow-up reminders for all active leads
  processFollowUpReminders: () => {
    const leads = useLeadStore.getState().leads;
    
    const activeLeads = leads.filter(lead => 
      ['new', 'contacted', 'in_progress'].includes(lead.status)
    );
    
    activeLeads.forEach(lead => {
      const reminders = generateFollowUpReminders(lead);
      
      reminders.forEach(reminder => {
        if (reminder.overdue) {
          get().createNotification({
            type: NOTIFICATION_TYPES.FOLLOW_UP_REMINDER,
            userId: lead.assignedTo,
            leadId: lead.id,
            message: reminder.message,
            priority: 'high',
            data: { lead, reminder }
          });
        }
      });
    });
  },

  // Initialize routing data with realistic scenarios
  initializeRoutingData: () => {
    const { unassignedLeads, assignmentHistory, notifications } = initializeRoutingData();
    
    // Process unassigned leads to add routing analysis
    const processedLeads = unassignedLeads.map(lead => {
      const qualityScore = calculateLeadQualityScore(lead);
      const leadAnalysis = analyzeLeadForRouting(lead);
      const matches = findBestMatches(lead, leadAnalysis, 3);
      
      return {
        ...lead,
        qualityScore,
        urgencyLevel: leadAnalysis.urgencyLevel,
        routingAnalysis: leadAnalysis,
        recommendedAssignments: matches,
        routingStatus: ASSIGNMENT_STATUS.PENDING
      };
    });

    set(state => ({
      routingQueue: processedLeads,
      assignmentHistory,
      notifications
    }));
  }
}));

// Initialize routing data when store is created
const store = useRoutingStore;
setTimeout(() => {
  store.getState().initializeRoutingData();
}, 100);

export default useRoutingStore;