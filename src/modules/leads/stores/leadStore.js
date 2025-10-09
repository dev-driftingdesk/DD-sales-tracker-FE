import { create } from 'zustand';
import { calculateTTFC, calculateLeadResponseTime, getFirstContactActivity } from '../../../utils/timeMetricsUtils';
import { calculateLeadConversionRate, calculateFunnelMetrics } from '../../../utils/conversionMetricsUtils';
import { calculateWinRate, getWinRateCategory } from '../../../utils/pipelineMetricsUtils';
import { calculateLeadAging, calculateContactAttempts, calculateStageConversions, getAgeCategory, getContactAttemptsCategory } from '../../../utils/leadAgingMetricsUtils';
import { calculateActivityPerRep, getActivityPerformanceCategory } from '../../../utils/dealActivityMetricsUtils';
import { calculateLeadReengagementRate, calculateStaleLeads, calculateDropoffRateByStage } from '../../../utils/revenueEngagementMetricsUtils';
import { LEAD_STATUSES, LEAD_SOURCES } from '../constants/index';
import { leadApi } from '../../../services/api/leadApiService.js';
import useAuthStore from '../../auth/stores/authStore.js';
// import { getConfig } from '../../../services/api/config.js';

// Backend to Frontend mapping functions
const mapNumericToSource = (numericSource) => {
  const sourceMapping = {
    1: LEAD_SOURCES.WEBSITE,
    2: LEAD_SOURCES.REFERRAL,
    3: LEAD_SOURCES.EMAIL,
    4: LEAD_SOURCES.FACEBOOK,
    5: LEAD_SOURCES.INSTAGRAM,
    6: LEAD_SOURCES.LINKEDIN,
    7: LEAD_SOURCES.WHATSAPP,
    8: LEAD_SOURCES.EVENT,
    9: LEAD_SOURCES.COLD_CALL,
    10: LEAD_SOURCES.MANUAL
  };
  return sourceMapping[numericSource] || LEAD_SOURCES.MANUAL;
};

const mapNumericToStatus = (numericStatus) => {
  const statusMapping = {
    1: LEAD_STATUSES.NEW,
    2: LEAD_STATUSES.CONTACTED,
    3: LEAD_STATUSES.IN_PROGRESS,
    4: LEAD_STATUSES.WON,
    5: LEAD_STATUSES.LOST
  };
  return statusMapping[numericStatus] || LEAD_STATUSES.NEW;
};

// Initialize leads data immediately when store is created
const initializeLeadsData = () => {
  const now = Date.now();
  return [
    {
      id: '4',
      companyName: 'Ceylon Tea Co',
      contactName: 'Priya Silva',
      email: 'priya@ceylontea.lk',
      phone: '+94 77 123 4567',
      location: 'Colombo, Sri Lanka',
      source: LEAD_SOURCES.WEBSITE,
      status: LEAD_STATUSES.WON,
      language: 'english',
      productInterest: 'Premium Ceylon Tea',
      notes: 'Closed deal for quarterly supply - excellent repeat customer',
      tags: ['closed-won', 'repeat-customer', 'sri-lanka'],
      assignedTo: 'user-4', // Jacob (default user)
      dealValue: 42000,
      closedValue: 42000,
      closedDate: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: 'Deal closed successfully - repeat order confirmed',
      activities: [
        {
          id: 'h1',
          type: 'Email',
          description: 'Response to website inquiry - same day',
          user: 'Jacob Williams',
          createdAt: new Date(now - 15 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 15 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { response_time: '2 hours' }
        },
        {
          id: 'h2',
          type: 'Call',
          description: 'Follow-up call - discussed repeat customer benefits',
          user: 'Jacob Williams',
          createdAt: new Date(now - 13 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 13 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { duration: '20 min', outcome: 'interested' }
        },
        {
          id: 'h3',
          type: 'Email',
          description: 'Sent updated pricing for bulk orders',
          user: 'Jacob Williams',
          createdAt: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { subject: 'Updated Pricing - Ceylon Tea Quarterly Supply' }
        },
        {
          id: 'h4',
          type: 'Call',
          description: 'Client called to confirm order details',
          user: 'Jacob Williams',
          createdAt: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: true,
          isResponse: true,
          metadata: { duration: '15 min', outcome: 'confirmed' }
        },
        {
          id: 'h5',
          type: 'status_change',
          description: 'Deal closed - $42,000 quarterly supply contract',
          user: 'Jacob Williams',
          createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { finalValue: 42000, source: 'deal_closure', cycle_days: 13 }
        }
      ]
    },
    {
      id: '6',
      companyName: 'Mumbai Spice Market',
      contactName: 'Raj Mehta',
      email: 'raj@mumbaispice.in',
      phone: '+91 98765 43210',
      location: 'Mumbai, India',
      source: LEAD_SOURCES.FACEBOOK,
      status: LEAD_STATUSES.WON,
      language: 'english',
      productInterest: 'Chai Tea Blends',
      notes: 'Closed - Traditional chai blend specialist supply agreement',
      tags: ['closed-won', 'india', 'chai-specialist'],
      assignedTo: 'user-4', // Jacob
      dealValue: 35000,
      closedValue: 33000,
      closedDate: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 9 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: 'Deal closed - chai blend partnership',
      activities: [
        {
          id: 'j1',
          type: 'Email',
          description: 'Quick response to Facebook message inquiry',
          user: 'Jacob Williams',
          createdAt: new Date(now - 9 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 9 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { response_time: '3 hours' }
        },
        {
          id: 'j2',
          type: 'Call',
          description: 'Discovery call about chai blend requirements',
          user: 'Jacob Williams',
          createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { duration: '30 min', outcome: 'interested' }
        },
        {
          id: 'j3',
          type: 'Email',
          description: 'Sent chai tea samples and pricing',
          user: 'Jacob Williams',
          createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { subject: 'Chai Tea Samples and Bulk Pricing' }
        },
        {
          id: 'j4',
          type: 'Call',
          description: 'Client loved samples - ready to order',
          user: 'Jacob Williams',
          createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: true,
          isResponse: true,
          metadata: { duration: '25 min', outcome: 'ready_to_buy' }
        },
        {
          id: 'j5',
          type: 'status_change',
          description: 'Deal closed - $33,000 chai blend supply contract',
          user: 'Jacob Williams',
          createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { finalValue: 33000, source: 'deal_closure', cycle_days: 8 }
        }
      ]
    },
    // Add leads for other users for complete metrics
    {
      id: '1',
      companyName: 'Zayed Traders',
      contactName: 'Ahmed Zayed',
      email: 'ahmed@zayedtraders.ae',
      phone: '+971 50 123 4567',
      location: 'Dubai, UAE',
      source: LEAD_SOURCES.FACEBOOK,
      status: LEAD_STATUSES.WON,
      language: 'arabic',
      productInterest: 'Premium Tea Collection',
      notes: 'Closed deal for bulk orders - quarterly supply contract',
      tags: ['high-priority', 'wholesale', 'middle-east', 'closed-won'],
      assignedTo: 'user-1', // Sara
      dealValue: 50000,
      closedValue: 45000,
      closedDate: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: 'Deal closed successfully - contract signed',
      activities: [
        {
          id: 'a1',
          type: 'Call',
          description: 'Initial contact call - introduced company and products',
          user: 'Sara Ahmed',
          createdAt: new Date(now - 14 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 14 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { duration: '15 min', outcome: 'interested' }
        },
        {
          id: 'a2',
          type: 'Email',
          description: 'Sent product catalog and pricing information',
          user: 'Sara Ahmed',
          createdAt: new Date(now - 13 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 13 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { subject: 'Premium Tea Collection - Product Catalog' }
        },
        {
          id: 'a3',
          type: 'Call',
          description: 'Client called back - very interested in bulk pricing',
          user: 'Sara Ahmed',
          createdAt: new Date(now - 12 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 12 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: true,
          isResponse: true,
          metadata: { duration: '25 min', outcome: 'qualified' }
        },
        {
          id: 'a4',
          type: 'Meeting',
          description: 'Product demonstration and tasting session at client office',
          user: 'Sara Ahmed',
          createdAt: new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { duration: '2 hours', outcome: 'very_positive' }
        },
        {
          id: 'a5',
          type: 'Email',
          description: 'Sent formal proposal with quarterly supply terms',
          user: 'Sara Ahmed',
          createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { subject: 'Quarterly Supply Proposal - Zayed Traders' }
        },
        {
          id: 'a6',
          type: 'Call',
          description: 'Negotiation call - agreed on terms and pricing',
          user: 'Sara Ahmed',
          createdAt: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: true,
          metadata: { duration: '45 min', outcome: 'agreed' }
        },
        {
          id: 'a7',
          type: 'status_change',
          description: 'Deal closed - contract signed for $45,000',
          user: 'Sara Ahmed',
          createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { finalValue: 45000, source: 'deal_closure' }
        }
      ]
    },
    // Add more leads for Sara to show complete metrics
    {
      id: '3',
      companyName: 'GulfMart Supermarkets',
      contactName: 'Fatima Al-Hassan',
      email: 'fatima@gulfmart.com',
      phone: '+966 50 987 6543',
      location: 'Riyadh, Saudi Arabia',
      source: LEAD_SOURCES.EVENT,
      status: LEAD_STATUSES.WON,
      language: 'arabic',
      productInterest: 'Full Tea Range',
      notes: 'Closed - Major supermarket chain deal for full product range',
      tags: ['expo-lead', 'supermarket-chain', 'saudi', 'closed-won'],
      assignedTo: 'user-1', // Sara
      dealValue: 100000,
      closedValue: 95000,
      closedDate: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 18 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: 'Contract signed - major win!',
      activities: [
        {
          id: 'c1',
          type: 'Meeting',
          description: 'Initial meeting at Middle East Food Expo 2025',
          user: 'Sara Ahmed',
          createdAt: new Date(now - 18 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 18 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { duration: '45 min', event: 'Middle East Food Expo', outcome: 'interested' }
        },
        {
          id: 'c2',
          type: 'Call',
          description: 'Follow-up call to discuss supermarket chain requirements',
          user: 'Sara Ahmed',
          createdAt: new Date(now - 15 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 15 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { duration: '50 min', outcome: 'qualified' }
        },
        {
          id: 'c3',
          type: 'Email',
          description: 'Sent comprehensive product portfolio for supermarket chains',
          user: 'Sara Ahmed',
          createdAt: new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { subject: 'GulfMart Partnership - Complete Product Portfolio' }
        },
        {
          id: 'c4',
          type: 'Meeting',
          description: 'Product tasting session at GulfMart headquarters',
          user: 'Sara Ahmed',
          createdAt: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { duration: '3 hours', outcome: 'excellent_feedback' }
        },
        {
          id: 'c5',
          type: 'Call',
          description: 'Pricing negotiation call with procurement team',
          user: 'Sara Ahmed',
          createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: true,
          metadata: { duration: '1.5 hours', outcome: 'negotiating' }
        },
        {
          id: 'c6',
          type: 'Email',
          description: 'Contract finalization and terms agreement',
          user: 'Sara Ahmed',
          createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { subject: 'Contract Terms Agreed - Ready to Sign' }
        },
        {
          id: 'c7',
          type: 'status_change',
          description: 'Major win! $95,000 supermarket chain contract signed',
          user: 'Sara Ahmed',
          createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { finalValue: 95000, source: 'deal_closure', cycle_days: 17 }
        }
      ]
    },
    // Add completed deals for other reps to show diverse analytics
    {
      id: '5',
      companyName: 'Pacific Beverages',
      contactName: 'Robert Chen',
      email: 'robert@pacificbev.com',
      phone: '+1 415 555 0199',
      location: 'San Francisco, USA',
      source: LEAD_SOURCES.WEBSITE,
      status: LEAD_STATUSES.WON,
      language: 'english',
      productInterest: 'Iced Tea Concentrates',
      notes: 'Closed - Beverage company partnership for iced tea products',
      tags: ['beverage', 'usa', 'iced-tea', 'closed-won'],
      assignedTo: 'user-2', // Maria Rodriguez
      dealValue: 68000,
      closedValue: 65000,
      closedDate: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 21 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: 'Contract signed - beverage partnership launched',
      activities: [
        {
          id: 'p1',
          type: 'Email',
          description: 'Response to website inquiry about iced tea concentrates',
          user: 'Maria Rodriguez',
          createdAt: new Date(now - 21 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 21 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { response_time: '4 hours' }
        },
        {
          id: 'p2',
          type: 'Call',
          description: 'Technical discussion about concentrate formulations',
          user: 'Maria Rodriguez',
          createdAt: new Date(now - 19 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 19 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { duration: '35 min', outcome: 'technical_fit' }
        },
        {
          id: 'p3',
          type: 'Email',
          description: 'Sent samples and technical specifications',
          user: 'Maria Rodriguez',
          createdAt: new Date(now - 15 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 15 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { subject: 'Iced Tea Concentrate Samples - Pacific Beverages' }
        },
        {
          id: 'p4',
          type: 'Call',
          description: 'Excellent feedback on samples - ready for partnership',
          user: 'Maria Rodriguez',
          createdAt: new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: true,
          isResponse: true,
          metadata: { duration: '30 min', outcome: 'samples_approved' }
        },
        {
          id: 'p5',
          type: 'status_change',
          description: 'Partnership deal closed - $65,000 beverage contract',
          user: 'Maria Rodriguez',
          createdAt: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { finalValue: 65000, source: 'deal_closure', cycle_days: 17 }
        }
      ]
    },
    // Add historical deals for more comprehensive analytics
    {
      id: '7',
      companyName: 'Dubai Tea Palace',
      contactName: 'Omar Al-Rashid',
      email: 'omar@dubaiteapalace.ae',
      phone: '+971 4 555 0188',
      location: 'Dubai, UAE',
      source: LEAD_SOURCES.REFERRAL,
      status: LEAD_STATUSES.WON,
      language: 'arabic',
      productInterest: 'Premium Tea Collection for Hotels',
      notes: 'Closed - Luxury hotel tea service partnership',
      tags: ['hospitality', 'premium', 'hotels', 'closed-won'],
      assignedTo: 'user-1', // Sara Ahmed
      dealValue: 85000,
      closedValue: 80000,
      closedDate: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: 'Luxury hotel partnership established',
      activities: [
        {
          id: 'd1',
          type: 'Call',
          description: 'Referral call - 5-minute response time',
          user: 'Sara Ahmed',
          createdAt: new Date(now - 25 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 25 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { response_time: '5 minutes' }
        },
        {
          id: 'd2',
          type: 'status_change',
          description: 'Hotel partnership deal closed - $80,000',
          user: 'Sara Ahmed',
          createdAt: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { finalValue: 80000, source: 'deal_closure', cycle_days: 15 }
        }
      ]
    },
    {
      id: '8',
      companyName: 'Nordic Tea House',
      contactName: 'Erik Johansson',
      email: 'erik@nordictea.se',
      phone: '+46 8 555 0177',
      location: 'Stockholm, Sweden',
      source: LEAD_SOURCES.EMAIL,
      status: LEAD_STATUSES.WON,
      language: 'english',
      productInterest: 'Organic Tea Blends',
      notes: 'Closed - Scandinavian market expansion deal',
      tags: ['organic', 'scandinavian', 'expansion', 'closed-won'],
      assignedTo: 'user-2', // Maria Rodriguez
      dealValue: 45000,
      closedValue: 42000,
      closedDate: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 22 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: 'Scandinavian expansion launched successfully',
      activities: [
        {
          id: 'n1',
          type: 'Email',
          description: 'Response to email inquiry - 90-minute response',
          user: 'Maria Rodriguez',
          createdAt: new Date(now - 22 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 22 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { response_time: '90 minutes' }
        },
        {
          id: 'n2',
          type: 'status_change',
          description: 'Organic tea expansion deal closed - $42,000',
          user: 'Maria Rodriguez',
          createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { finalValue: 42000, source: 'deal_closure', cycle_days: 15 }
        }
      ]
    },
    {
      id: '9',
      companyName: 'Jakarta Tea Trading',
      contactName: 'Sari Wijaya',
      email: 'sari@jakartateatrading.id',
      phone: '+62 21 555 0166',
      location: 'Jakarta, Indonesia',
      source: LEAD_SOURCES.WHATSAPP,
      status: LEAD_STATUSES.WON,
      language: 'english',
      productInterest: 'Bulk Tea Supplies',
      notes: 'Closed - Indonesian distribution partnership',
      tags: ['distribution', 'indonesia', 'bulk', 'closed-won'],
      assignedTo: 'user-3', // Amir Hassan  
      dealValue: 38000,
      closedValue: 35000,
      closedDate: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 16 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: 'Indonesian distribution partnership secured',
      activities: [
        {
          id: 'i1',
          type: 'WhatsApp',
          description: 'Initial WhatsApp inquiry response - 3-day delay',
          user: 'Amir Hassan',
          createdAt: new Date(now - 16 * 24 * 60 * 60 * 1000 + 3 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 16 * 24 * 60 * 60 * 1000 + 3 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { response_time: '3 days' }
        },
        {
          id: 'i2',
          type: 'status_change',
          description: 'Distribution partnership closed - $35,000',
          user: 'Amir Hassan',
          createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { finalValue: 35000, source: 'deal_closure', cycle_days: 11 }
        }
      ]
    },
    {
      id: '10',
      companyName: 'Sydney Tea Merchants',
      contactName: 'Emma Thompson',
      email: 'emma@sydneyteamerchants.com.au',
      phone: '+61 2 555 0155',
      location: 'Sydney, Australia',
      source: LEAD_SOURCES.INSTAGRAM,
      status: LEAD_STATUSES.WON,
      language: 'english',
      productInterest: 'Specialty Tea Blends',
      notes: 'Closed - Australian market premium tea partnership',
      tags: ['specialty', 'australia', 'premium', 'closed-won'],
      assignedTo: 'user-5', // Anna Chen
      dealValue: 55000,
      closedValue: 52000,
      closedDate: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: 'Australian premium tea partnership established',
      activities: [
        {
          id: 's1',
          type: 'Instagram',
          description: 'Response to Instagram DM inquiry - 4-hour response',
          user: 'Anna Chen',
          createdAt: new Date(now - 20 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 20 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { response_time: '4 hours' }
        },
        {
          id: 's2',
          type: 'status_change',
          description: 'Premium tea partnership closed - $52,000',
          user: 'Anna Chen',
          createdAt: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { finalValue: 52000, source: 'deal_closure', cycle_days: 14 }
        }
      ]
    },
    // Add some recent historical wins for previous months to show trending data
    {
      id: '11',
      companyName: 'London Premium Foods',
      contactName: 'James Wilson',
      email: 'james@londonpremium.co.uk',
      phone: '+44 20 555 0144',
      location: 'London, UK',
      source: LEAD_SOURCES.EVENT,
      status: LEAD_STATUSES.WON,
      language: 'english',
      productInterest: 'High-End Tea Collection',
      notes: 'Closed - UK premium market expansion',
      tags: ['premium', 'uk', 'high-end', 'closed-won'],
      assignedTo: 'user-2', // Maria Rodriguez
      dealValue: 72000,
      closedValue: 68000,
      closedDate: new Date(now - 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days ago (last month)
      createdAt: new Date(now - 50 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 35 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: 'UK premium expansion successful',
      activities: [
        {
          id: 'l1',
          type: 'status_change',
          description: 'UK premium market deal closed - $68,000',
          user: 'Maria Rodriguez',
          createdAt: new Date(now - 35 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 35 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { finalValue: 68000, source: 'deal_closure', cycle_days: 15 }
        }
      ]
    },
    {
      id: '12',
      companyName: 'Singapore Hospitality Group',
      contactName: 'David Lim',
      email: 'david@sghospitality.sg',
      phone: '+65 6555 0133',
      location: 'Singapore',
      source: LEAD_SOURCES.REFERRAL,
      status: LEAD_STATUSES.WON,
      language: 'english',
      productInterest: 'Hotel Tea Service',
      notes: 'Closed - Singapore hotel chain partnership',
      tags: ['hospitality', 'hotels', 'singapore', 'closed-won'],
      assignedTo: 'user-5', // Anna Chen
      dealValue: 63000,
      closedValue: 60000,
      closedDate: new Date(now - 28 * 24 * 60 * 60 * 1000).toISOString(), // 28 days ago (last month)
      createdAt: new Date(now - 40 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 28 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: 'Singapore hotel partnership launched',
      activities: [
        {
          id: 'sg1',
          type: 'status_change',
          description: 'Hotel chain partnership closed - $60,000',
          user: 'Anna Chen',
          createdAt: new Date(now - 28 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 28 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { finalValue: 60000, source: 'deal_closure', cycle_days: 12 }
        }
      ]
    },
    // Add some lost leads for complete analytics
    {
      id: '13',
      companyName: 'Bangkok Retail Chain',
      contactName: 'Somchai Tanaka',
      email: 'somchai@bangkokretail.th',
      phone: '+66 2 555 0122',
      location: 'Bangkok, Thailand',
      source: LEAD_SOURCES.FACEBOOK,
      status: LEAD_STATUSES.LOST,
      language: 'english',
      productInterest: 'Asian Tea Collection',
      notes: 'Lost - competitor offered better pricing and faster delivery',
      tags: ['lost', 'price-sensitive', 'thailand'],
      assignedTo: 'user-3', // Amir Hassan
      dealValue: 25000,
      lostReason: 'Price too high - competitor 15% cheaper',
      lostDate: new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: 'Deal lost to competitor - price sensitivity',
      activities: [
        {
          id: 'lost1',
          type: 'Call',
          description: 'Initial qualification call',
          user: 'Amir Hassan',
          createdAt: new Date(now - 20 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 20 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { response_time: '6 hours' }
        },
        {
          id: 'lost2',
          type: 'status_change',
          description: 'Deal lost - competitor pricing advantage',
          user: 'Amir Hassan',
          createdAt: new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { lostReason: 'pricing', competitorAdvantage: '15%' }
        }
      ]
    },
    {
      id: '14',
      companyName: 'Toronto Coffee House',
      contactName: 'Mike Wilson',
      email: 'mike@torontocoffee.ca',
      phone: '+1 416 555 0111',
      location: 'Toronto, Canada',
      source: LEAD_SOURCES.EMAIL,
      status: LEAD_STATUSES.LOST,
      language: 'english',
      productInterest: 'Tea and Coffee Blends',
      notes: 'Lost - decided to focus only on coffee products',
      tags: ['lost', 'focus-change', 'canada'],
      assignedTo: 'user-4', // Jacob Williams
      dealValue: 18000,
      lostReason: 'Business direction change - coffee focus only',
      lostDate: new Date(now - 12 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 12 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: 'Business model change - no longer interested in tea',
      activities: [
        {
          id: 'lost3',
          type: 'Email',
          description: 'Response to email inquiry',
          user: 'Jacob Williams',
          createdAt: new Date(now - 30 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 30 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { response_time: '8 hours' }
        },
        {
          id: 'lost4',
          type: 'status_change',
          description: 'Deal lost - business direction change',
          user: 'Jacob Williams',
          createdAt: new Date(now - 12 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 12 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { lostReason: 'business_model_change' }
        }
      ]
    },
    // Add some active pipeline leads for complete analytics
    {
      id: '15',
      companyName: 'European Tea Importers',
      contactName: 'Hans Mueller',
      email: 'hans@europeantea.de',
      phone: '+49 30 555 0199',
      location: 'Berlin, Germany',
      source: LEAD_SOURCES.WEBSITE,
      status: LEAD_STATUSES.IN_PROGRESS,
      language: 'english',
      productInterest: 'European Distribution Partnership',
      notes: 'Large distribution opportunity - in final negotiations',
      tags: ['distribution', 'europe', 'partnership'],
      assignedTo: 'user-2', // Maria Rodriguez
      dealValue: 120000,
      createdAt: new Date(now - 18 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: 'Negotiating final terms',
      activities: [
        {
          id: 'eu1',
          type: 'Email',
          description: 'Responded to website inquiry about European distribution',
          user: 'Maria Rodriguez',
          createdAt: new Date(now - 18 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 18 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { response_time: '2 hours' }
        },
        {
          id: 'eu2',
          type: 'Call',
          description: 'Initial consultation about European market distribution',
          user: 'Maria Rodriguez',
          createdAt: new Date(now - 15 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 15 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { duration: '60 min', outcome: 'very_interested' }
        },
        {
          id: 'eu3',
          type: 'Email',
          description: 'Sent comprehensive distribution proposal',
          user: 'Maria Rodriguez',
          createdAt: new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: { subject: 'European Distribution Partnership Proposal' }
        },
        {
          id: 'eu4',
          type: 'Call',
          description: 'Contract negotiation call - finalizing terms',
          user: 'Maria Rodriguez',
          createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
          isFromLead: false,
          isResponse: true,
          metadata: { duration: '90 min', outcome: 'almost_closed' }
        }
      ]
    }
  ];
};

const useLeadStore = create((set, get) => ({
  leads: [],
  filters: {
    status: 'all',
    source: 'all',
    assignedTo: 'all',
    searchTerm: ''
  },
  selectedLead: null,
  isLoading: false,
  error: null,

  // Actions with API Integration
  fetchLeads: async () => {
    set({ isLoading: true, error: null });
    try {
      // Get current authentication status
      const authState = useAuthStore.getState();
      const currentUser = authState.user;
      const isAuthenticated = authState.isAuthenticated;
      
      console.log('[LeadStore] Authentication status:', {
        isAuthenticated,
        user: currentUser?.email,
        userId: currentUser?.id
      });
      
      const { filters } = get();
      
      // Map frontend filters to backend API parameters
      const apiFilters = {
        page: 1,
        pageSize: 100, // Get all leads for now
        status: filters.status !== 'all' ? filters.status : undefined,
        source: filters.source !== 'all' ? filters.source : undefined,
        searchTerm: filters.searchTerm || undefined,
        assignedTo: filters.assignedTo !== 'all' ? filters.assignedTo : undefined
      };
      
      console.log('[LeadStore] Fetching leads with filters:', apiFilters);
      console.log('[LeadStore] Current user context:', currentUser);
      
      const response = await leadApi.getLeads(apiFilters);
      
      console.log('[LeadStore] Backend API response:', response);
      console.log('[LeadStore] Response type:', typeof response);
      console.log('[LeadStore] Response is array:', Array.isArray(response));
      console.log('[LeadStore] Response.data is array:', Array.isArray(response.data));
      console.log('[LeadStore] Response keys:', Object.keys(response || {}));
      
      // Handle different response structures from backend
      // Backend might return leads directly as array or in response.data
      let leadsArray = [];
      if (Array.isArray(response)) {
        leadsArray = response;
        console.log('[LeadStore] Using response as direct array:', leadsArray.length, 'leads');
      } else if (Array.isArray(response.data)) {
        leadsArray = response.data;
        console.log('[LeadStore] Using response.data array:', leadsArray.length, 'leads');
      } else if (response.data && Array.isArray(response.data.items)) {
        leadsArray = response.data.items;
        console.log('[LeadStore] Using response.data.items array:', leadsArray.length, 'leads');
      } else {
        console.warn('[LeadStore] Unexpected response structure, using fallback');
        leadsArray = [];
      }
      
      console.log('[LeadStore] Final leads array length:', leadsArray.length);
      
      // Transform backend response to frontend format
      const transformedLeads = leadsArray.map(lead => ({
        id: lead.id?.toString(),
        companyName: lead.company || '',
        contactName: `${lead.firstName || ''} ${lead.lastName || ''}`.trim(),
        firstName: lead.firstName || '',
        lastName: lead.lastName || '',
        email: lead.email || '',
        phone: lead.phone || '',
        location: lead.location || '',
        source: mapNumericToSource(lead.source),
        status: mapNumericToStatus(lead.status),
        jobTitle: lead.jobTitle || '',
        assignedTo: lead.assignedUserId || null,
        score: lead.score || 0,
        dealValue: lead.estimatedValue || 0,
        notes: lead.notes || '',
        tags: lead.tags || [],
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
        activities: lead.activities || [],
        lastActivity: lead.lastActivity || ''
      }));
      
      console.log('[LeadStore] Transformed leads count:', transformedLeads.length);
      console.log('[LeadStore] First lead sample:', transformedLeads[0]);
      
      set({ leads: transformedLeads, isLoading: false });
      
    } catch (error) {
      console.error('[LeadStore] Failed to fetch leads:', error);
      
      // Fallback to mock data on error (for development)
      console.log('[LeadStore] Using fallback mock data due to API error');
      const mockLeads = initializeLeadsData();
      set({ 
        leads: mockLeads,
        error: `API Error: ${error.message}. Using mock data.`,
        isLoading: false 
      });
    }
  },

  fetchLead: async (id) => {
    set({ isLoading: true, error: null });
    try {
      console.log('[LeadStore] Fetching single lead with ID:', id);
      
      const response = await leadApi.getLead(id);
      
      console.log('[LeadStore] Single lead API response:', response);
      
      // Transform backend response to frontend format
      const backendLead = response.data || response;
      const transformedLead = {
        id: backendLead.id?.toString(),
        companyName: backendLead.company || '',
        contactName: `${backendLead.firstName || ''} ${backendLead.lastName || ''}`.trim(),
        firstName: backendLead.firstName || '',
        lastName: backendLead.lastName || '',
        email: backendLead.email || '',
        phone: backendLead.phone || '',
        location: backendLead.location || '',
        source: mapNumericToSource(backendLead.source),
        status: mapNumericToStatus(backendLead.status),
        jobTitle: backendLead.jobTitle || '',
        assignedTo: backendLead.assignedUserId || null,
        score: backendLead.score || 0,
        dealValue: backendLead.estimatedValue || 0,
        notes: backendLead.notes || '',
        tags: backendLead.tags || [],
        createdAt: backendLead.createdAt,
        updatedAt: backendLead.updatedAt,
        activities: backendLead.activities || [],
        lastActivity: backendLead.lastActivity || ''
      };
      
      set({ selectedLead: transformedLead, isLoading: false });
      return transformedLead;
    } catch (error) {
      console.error('Failed to fetch lead:', error);
      
      // Fallback to finding in existing leads
      const { leads } = get();
      const lead = leads.find(l => l.id === id);
      if (lead) {
        set({ selectedLead: lead, isLoading: false });
        return lead;
      }
      
      set({ 
        error: error.message || 'Failed to fetch lead',
        isLoading: false 
      });
      throw error;
    }
  },

  addLead: async (leadData) => {
    set({ isLoading: true, error: null });
    try {
      const isApiEnabled = false; // Temporarily disabled for testing
      
      if (!isApiEnabled) {
        // Fallback to mock creation
        const newLead = { 
          ...leadData, 
          id: leadData.id || Date.now().toString(),
          createdAt: leadData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          activities: leadData.activities || [],
          dealValue: leadData.dealValue || 0,
          closedValue: null,
          closedDate: null
        };
        
        set((state) => ({
          leads: [...state.leads, newLead],
          isLoading: false
        }));
        
        return newLead;
      }

      const response = await leadApi.createLead(leadData);
      const newLead = response.data || response;
      
      set((state) => ({
        leads: [...state.leads, newLead],
        isLoading: false
      }));
      
      return newLead;
    } catch (error) {
      console.error('Failed to create lead:', error);
      
      // Fallback to mock creation on API failure
      if (error.message?.includes('NetworkError') || error.message?.includes('fetch')) {
        console.log('API unavailable, creating lead locally');
        const newLead = { 
          ...leadData, 
          id: leadData.id || Date.now().toString(),
          createdAt: leadData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          activities: leadData.activities || [],
          dealValue: leadData.dealValue || 0,
          closedValue: null,
          closedDate: null
        };
        
        set((state) => ({
          leads: [...state.leads, newLead],
          isLoading: false
        }));
        
        return newLead;
      }
      
      set({ 
        error: error.message || 'Failed to create lead',
        isLoading: false 
      });
      throw error;
    }
  },

  updateLead: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const isApiEnabled = false; // Temporarily disabled for testing
      
      if (!isApiEnabled) {
        // Fallback to mock update
        const updatedLead = {
          ...updates,
          id,
          updatedAt: new Date().toISOString(),
          // Auto-set closed value and date when status changes to won
          ...(updates.status === 'won' ? {
            closedValue: updates.closedValue || updates.dealValue || 0,
            closedDate: new Date().toISOString()
          } : {})
        };
        
        set((state) => ({
          leads: state.leads.map(lead => 
            lead.id === id ? { ...lead, ...updatedLead } : lead
          ),
          selectedLead: state.selectedLead?.id === id ? { ...state.selectedLead, ...updatedLead } : state.selectedLead,
          isLoading: false
        }));
        
        return updatedLead;
      }

      const response = await leadApi.updateLead(id, updates);
      const updatedLead = response.data || response;
      
      set((state) => ({
        leads: state.leads.map(lead => 
          lead.id === id ? updatedLead : lead
        ),
        selectedLead: state.selectedLead?.id === id ? updatedLead : state.selectedLead,
        isLoading: false
      }));
      
      return updatedLead;
    } catch (error) {
      console.error('Failed to update lead:', error);
      
      // Fallback to mock update on API failure
      if (error.message?.includes('NetworkError') || error.message?.includes('fetch')) {
        console.log('API unavailable, updating lead locally');
        const updatedLead = {
          ...updates,
          id,
          updatedAt: new Date().toISOString(),
          // Auto-set closed value and date when status changes to won
          ...(updates.status === 'won' ? {
            closedValue: updates.closedValue || updates.dealValue || 0,
            closedDate: new Date().toISOString()
          } : {})
        };
        
        set((state) => ({
          leads: state.leads.map(lead => 
            lead.id === id ? { ...lead, ...updatedLead } : lead
          ),
          selectedLead: state.selectedLead?.id === id ? { ...state.selectedLead, ...updatedLead } : state.selectedLead,
          isLoading: false
        }));
        
        return updatedLead;
      }
      
      set({ 
        error: error.message || 'Failed to update lead',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteLead: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const isApiEnabled = false; // Temporarily disabled for testing
      
      if (!isApiEnabled) {
        // Fallback to mock deletion
        set((state) => ({
          leads: state.leads.filter(lead => lead.id !== id),
          selectedLead: state.selectedLead?.id === id ? null : state.selectedLead,
          isLoading: false
        }));
        return true;
      }

      await leadApi.deleteLead(id);
      
      set((state) => ({
        leads: state.leads.filter(lead => lead.id !== id),
        selectedLead: state.selectedLead?.id === id ? null : state.selectedLead,
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      console.error('Failed to delete lead:', error);
      
      // Fallback to mock deletion on API failure
      if (error.message?.includes('NetworkError') || error.message?.includes('fetch')) {
        console.log('API unavailable, deleting lead locally');
        set((state) => ({
          leads: state.leads.filter(lead => lead.id !== id),
          selectedLead: state.selectedLead?.id === id ? null : state.selectedLead,
          isLoading: false
        }));
        return true;
      }
      
      set({ 
        error: error.message || 'Failed to delete lead',
        isLoading: false 
      });
      throw error;
    }
  },

  assignLead: async (leadId, userId) => {
    try {
      const isApiEnabled = false; // Temporarily disabled for testing
      
      if (!isApiEnabled) {
        // Fallback to mock assignment
        const assignedUser = `user-${userId}`;
        set((state) => ({
          leads: state.leads.map(lead => 
            lead.id === leadId ? { ...lead, assignedTo: assignedUser, updatedAt: new Date().toISOString() } : lead
          ),
          selectedLead: state.selectedLead?.id === leadId ? { ...state.selectedLead, assignedTo: assignedUser, updatedAt: new Date().toISOString() } : state.selectedLead
        }));
        return { assignedTo: assignedUser };
      }

      const response = await leadApi.assignLead(leadId, userId);
      const updatedLead = response.data || response;
      
      set((state) => ({
        leads: state.leads.map(lead => 
          lead.id === leadId ? updatedLead : lead
        ),
        selectedLead: state.selectedLead?.id === leadId ? updatedLead : state.selectedLead
      }));
      
      return updatedLead;
    } catch (error) {
      console.error('Failed to assign lead:', error);
      
      // Fallback to mock assignment on API failure
      if (error.message?.includes('NetworkError') || error.message?.includes('fetch')) {
        console.log('API unavailable, assigning lead locally');
        const assignedUser = `user-${userId}`;
        set((state) => ({
          leads: state.leads.map(lead => 
            lead.id === leadId ? { ...lead, assignedTo: assignedUser, updatedAt: new Date().toISOString() } : lead
          ),
          selectedLead: state.selectedLead?.id === leadId ? { ...state.selectedLead, assignedTo: assignedUser, updatedAt: new Date().toISOString() } : state.selectedLead
        }));
        return { assignedTo: assignedUser };
      }
      
      throw error;
    }
  },

  addActivity: async (leadId, activityData) => {
    try {
      const isApiEnabled = false; // Temporarily disabled for testing
      
      if (!isApiEnabled) {
        // Fallback to mock activity creation
        const enhancedActivity = {
          ...activityData,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: activityData.createdAt || new Date().toISOString(),
          timestamp: activityData.timestamp || new Date().toISOString(),
          isFromLead: activityData.isFromLead || false,
          isResponse: activityData.isResponse || false,
          metadata: {
            ...activityData.metadata,
            leadId,
            source: activityData.metadata?.source || 'manual_entry'
          }
        };

        set((state) => ({
          leads: state.leads.map(lead => 
            lead.id === leadId
              ? { 
                  ...lead, 
                  activities: [...(lead.activities || []), enhancedActivity],
                  updatedAt: new Date().toISOString()
                }
              : lead
          ),
          selectedLead: state.selectedLead?.id === leadId 
            ? {
                ...state.selectedLead,
                activities: [...(state.selectedLead.activities || []), enhancedActivity],
                updatedAt: new Date().toISOString()
              }
            : state.selectedLead
        }));
        
        return enhancedActivity;
      }

      const response = await leadApi.createActivity(leadId, activityData);
      const newActivity = response.data || response;
      
      // Update the lead with new activity
      set((state) => ({
        leads: state.leads.map(lead => 
          lead.id === leadId 
            ? { 
                ...lead, 
                activities: [...(lead.activities || []), newActivity],
                updatedAt: new Date().toISOString()
              }
            : lead
        ),
        selectedLead: state.selectedLead?.id === leadId 
          ? {
              ...state.selectedLead,
              activities: [...(state.selectedLead.activities || []), newActivity],
              updatedAt: new Date().toISOString()
            }
          : state.selectedLead
      }));
      
      return newActivity;
    } catch (error) {
      console.error('Failed to add activity:', error);
      
      // Fallback to mock activity creation on API failure
      if (error.message?.includes('NetworkError') || error.message?.includes('fetch')) {
        console.log('API unavailable, adding activity locally');
        const enhancedActivity = {
          ...activityData,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: activityData.createdAt || new Date().toISOString(),
          timestamp: activityData.timestamp || new Date().toISOString(),
          isFromLead: activityData.isFromLead || false,
          isResponse: activityData.isResponse || false,
          metadata: {
            ...activityData.metadata,
            leadId,
            source: activityData.metadata?.source || 'manual_entry'
          }
        };

        set((state) => ({
          leads: state.leads.map(lead => 
            lead.id === leadId
              ? { 
                  ...lead, 
                  activities: [...(lead.activities || []), enhancedActivity],
                  updatedAt: new Date().toISOString()
                }
              : lead
          ),
          selectedLead: state.selectedLead?.id === leadId 
            ? {
                ...state.selectedLead,
                activities: [...(state.selectedLead.activities || []), enhancedActivity],
                updatedAt: new Date().toISOString()
              }
            : state.selectedLead
        }));
        
        return enhancedActivity;
      }
      
      throw error;
    }
  },

  addNote: async (leadId, noteData) => {
    try {
      const isApiEnabled = false; // Temporarily disabled for testing
      
      // Handle both old format (string content) and new format (object with advanced properties)
      let content, options;
      if (typeof noteData === 'string') {
        content = noteData;
        options = {};
      } else {
        content = noteData.content;
        options = {
          category: noteData.category,
          priority: noteData.priority,
          tags: noteData.tags,
          isPrivate: noteData.isPrivate,
          user: noteData.author
        };
      }

      if (!isApiEnabled) {
        // Fallback to mock note creation
        const noteActivity = {
          id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'Note',
          description: content,
          user: options.user || 'Current User',
          createdAt: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: {
            source: 'note_add',
            category: options.category || 'general',
            priority: options.priority || 'normal',
            tags: options.tags || [],
            isPrivate: options.isPrivate || false
          }
        };
        
        set((state) => ({
          leads: state.leads.map(lead => 
            lead.id === leadId 
              ? { 
                  ...lead, 
                  activities: [...(lead.activities || []), noteActivity],
                  updatedAt: new Date().toISOString()
                }
              : lead
          ),
          selectedLead: state.selectedLead?.id === leadId 
            ? {
                ...state.selectedLead,
                activities: [...(state.selectedLead.activities || []), noteActivity],
                updatedAt: new Date().toISOString()
              }
            : state.selectedLead
        }));
        
        return noteActivity;
      }

      const response = await leadApi.createNote(leadId, { content, ...options });
      const newNote = response.data || response;
      
      // Update the lead with new note (stored as activity)
      const noteActivity = {
        id: newNote.id,
        type: 'Note',
        description: content,
        user: options.user || 'Current User',
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        isFromLead: false,
        isResponse: false,
        metadata: {
          source: 'note_add',
          category: options.category || 'general',
          priority: options.priority || 'normal',
          isPrivate: options.isPrivate || false
        }
      };
      
      set((state) => ({
        leads: state.leads.map(lead => 
          lead.id === leadId 
            ? { 
                ...lead, 
                activities: [...(lead.activities || []), noteActivity],
                updatedAt: new Date().toISOString()
              }
            : lead
        ),
        selectedLead: state.selectedLead?.id === leadId 
          ? {
              ...state.selectedLead,
              activities: [...(state.selectedLead.activities || []), noteActivity],
              updatedAt: new Date().toISOString()
            }
          : state.selectedLead
      }));
      
      return noteActivity;
    } catch (error) {
      console.error('Failed to add note:', error);
      
      // Fallback to mock note creation on API failure
      if (error.message?.includes('NetworkError') || error.message?.includes('fetch')) {
        console.log('API unavailable, adding note locally');
        
        // Handle both old format (string content) and new format (object with advanced properties)
        let content, options;
        if (typeof noteData === 'string') {
          content = noteData;
          options = {};
        } else {
          content = noteData.content;
          options = {
            category: noteData.category,
            priority: noteData.priority,
            tags: noteData.tags,
            isPrivate: noteData.isPrivate,
            user: noteData.author
          };
        }

        const noteActivity = {
          id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'Note',
          description: content,
          user: options.user || 'Current User',
          createdAt: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          isFromLead: false,
          isResponse: false,
          metadata: {
            source: 'note_add',
            category: options.category || 'general',
            priority: options.priority || 'normal',
            tags: options.tags || [],
            isPrivate: options.isPrivate || false
          }
        };
        
        set((state) => ({
          leads: state.leads.map(lead => 
            lead.id === leadId 
              ? { 
                  ...lead, 
                  activities: [...(lead.activities || []), noteActivity],
                  updatedAt: new Date().toISOString()
                }
              : lead
          ),
          selectedLead: state.selectedLead?.id === leadId 
            ? {
                ...state.selectedLead,
                activities: [...(state.selectedLead.activities || []), noteActivity],
                updatedAt: new Date().toISOString()
              }
            : state.selectedLead
        }));
        
        return noteActivity;
      }
      
      throw error;
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
    // Automatically fetch leads when filters change
    get().fetchLeads();
  },

  // Keep existing utility methods for compatibility
  setLeads: (leads) => set({ leads }),
  
  setSelectedLead: (lead) => set({ selectedLead: lead }),
  
  addQuickActivity: (leadId, type, description) => {
    const state = get();
    const activity = {
      type,
      description,
      user: 'Current User', // This would normally be the current user's name
      isFromLead: false,
      isResponse: false,
      metadata: { source: 'quick_add' }
    };
    return state.addActivity(leadId, activity);
  },

  updateNote: (leadId, activityId, content) => set((state) => ({
    leads: state.leads.map(lead => 
      lead.id === leadId
        ? {
            ...lead,
            activities: (lead.activities || []).map(activity =>
              activity.id === activityId
                ? { ...activity, description: content, updatedAt: new Date().toISOString() }
                : activity
            ),
            updatedAt: new Date().toISOString()
          }
        : lead
    )
  })),

  deleteNote: (leadId, activityId) => set((state) => ({
    leads: state.leads.map(lead => 
      lead.id === leadId
        ? {
            ...lead,
            activities: (lead.activities || []).filter(activity => activity.id !== activityId),
            updatedAt: new Date().toISOString()
          }
        : lead
    )
  })),

  getLeadNotes: (leadId) => {
    const state = get();
    const lead = state.leads.find(l => l.id === leadId);
    if (!lead) return [];
    
    return (lead.activities || [])
      .filter(activity => activity.type === 'Note')
      .sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp));
  },

  addTeamMember: (leadId, userId, role = 'collaborator') => set((state) => ({
    leads: state.leads.map(lead => 
      lead.id === leadId
        ? {
            ...lead,
            teamMembers: [...(lead.teamMembers || []), { userId, role, addedAt: new Date().toISOString() }],
            updatedAt: new Date().toISOString()
          }
        : lead
    )
  })),

  removeTeamMember: (leadId, userId) => set((state) => ({
    leads: state.leads.map(lead => 
      lead.id === leadId
        ? {
            ...lead,
            teamMembers: (lead.teamMembers || []).filter(member => member.userId !== userId),
            updatedAt: new Date().toISOString()
          }
        : lead
    )
  })),

  updateTeamMemberRole: (leadId, userId, newRole) => set((state) => ({
    leads: state.leads.map(lead => 
      lead.id === leadId
        ? {
            ...lead,
            teamMembers: (lead.teamMembers || []).map(member =>
              member.userId === userId
                ? { ...member, role: newRole, updatedAt: new Date().toISOString() }
                : member
            ),
            updatedAt: new Date().toISOString()
          }
        : lead
    )
  })),

  getLeadTeamMembers: (leadId) => {
    const state = get();
    const lead = state.leads.find(l => l.id === leadId);
    return lead?.teamMembers || [];
  },

  addActivity: (leadId, activity) => set((state) => {
    // Auto-generate activity for certain lead changes
    const enhancedActivity = {
      ...activity,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: activity.createdAt || new Date().toISOString(),
      timestamp: activity.timestamp || new Date().toISOString(),
      isFromLead: activity.isFromLead || false,
      isResponse: activity.isResponse || false,
      metadata: {
        ...activity.metadata,
        leadId,
        source: activity.metadata?.source || 'manual_entry'
      }
    };

    return {
      leads: state.leads.map(lead => 
        lead.id === leadId
          ? { 
              ...lead, 
              activities: [...(lead.activities || []), enhancedActivity],
              updatedAt: new Date().toISOString()
            }
          : lead
      )
    };
  }),

  getFilteredLeads: () => {
    const state = get();
    const { leads, filters } = state;
    
    return leads.filter(lead => {
      // Status filter
      if (filters.status !== 'all' && lead.status !== filters.status) {
        return false;
      }
      
      // Source filter  
      if (filters.source !== 'all' && lead.source !== filters.source) {
        return false;
      }
      
      // Assigned to filter
      if (filters.assignedTo !== 'all' && lead.assignedTo !== filters.assignedTo) {
        return false;
      }
      
      // Search term filter
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        const searchableFields = [
          lead.companyName,
          lead.contactName,
          lead.email,
          lead.notes,
          lead.productInterest
        ].filter(Boolean);
        
        if (!searchableFields.some(field => 
          field.toLowerCase().includes(searchTerm)
        )) {
          return false;
        }
      }
      
      return true;
    });
  },

  // Time Metrics Methods
  getAllLeadsTimeMetrics: () => {
    const state = get();
    return state.leads.map(lead => {
      const firstContactActivity = getFirstContactActivity(lead.activities || []);
      const ttfc = calculateTTFC(lead.createdAt, firstContactActivity?.timestamp);
      const leadResponseTime = calculateLeadResponseTime(lead.activities || []);

      return {
        ...lead,
        ttfc,
        leadResponseTime,
        firstContactActivity
      };
    });
  },

  getLeadTTFC: (leadId) => {
    const state = get();
    const lead = state.leads.find(l => l.id === leadId);
    
    if (!lead) return null;

    const firstContactActivity = getFirstContactActivity(lead.activities || []);
    return calculateTTFC(lead.createdAt, firstContactActivity?.timestamp);
  },

  getLeadResponseTime: (leadId) => {
    const state = get();
    const lead = state.leads.find(l => l.id === leadId);
    
    if (!lead) return null;

    return calculateLeadResponseTime(lead.activities || []);
  },

  getLeadTimeMetrics: (leadId) => {
    const state = get();
    const lead = state.leads.find(l => l.id === leadId);
    
    if (!lead) {
      return {
        ttfc: null,
        leadResponseTime: null,
        firstContactActivity: null,
        lastActivity: null,
        daysSinceCreated: null,
        daysSinceLastActivity: null
      };
    }

    const firstContactActivity = getFirstContactActivity(lead.activities || []);
    const ttfc = calculateTTFC(lead.createdAt, firstContactActivity?.timestamp);
    const leadResponseTime = calculateLeadResponseTime(lead.activities || []);

    // Calculate days since created and last activity
    const now = new Date();
    const createdDate = new Date(lead.createdAt);
    const daysSinceCreated = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

    let daysSinceLastActivity = null;
    if (lead.activities && lead.activities.length > 0) {
      const sortedActivities = [...lead.activities].sort((a, b) => 
        new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt)
      );
      const lastActivity = sortedActivities[0];
      const lastActivityDate = new Date(lastActivity.timestamp || lastActivity.createdAt);
      daysSinceLastActivity = Math.floor((now - lastActivityDate) / (1000 * 60 * 60 * 24));
    }

    return {
      ttfc,
      leadResponseTime,
      firstContactActivity,
      lastActivity: lead.activities && lead.activities.length > 0 
        ? [...lead.activities].sort((a, b) => 
            new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt)
          )[0] 
        : null,
      daysSinceCreated,
      daysSinceLastActivity
    };
  },

  getTeamTimeMetrics: (teamMemberIds = []) => {
    const state = get();
    const filteredLeads = teamMemberIds.length > 0 
      ? state.leads.filter(lead => teamMemberIds.includes(lead.assignedTo))
      : state.leads;

    const metricsData = filteredLeads.map(lead => {
      const firstContactActivity = getFirstContactActivity(lead.activities || []);
      const ttfc = calculateTTFC(lead.createdAt, firstContactActivity?.timestamp);
      const leadResponseTime = calculateLeadResponseTime(lead.activities || []);

      return {
        leadId: lead.id,
        assignedTo: lead.assignedTo,
        companyName: lead.companyName,
        createdAt: lead.createdAt,
        ttfc,
        leadResponseTime,
        status: lead.status
      };
    });

    // Calculate aggregate metrics for the team
    const ttfcValues = metricsData
      .map(m => m.ttfc?.totalMinutes)
      .filter(val => val !== null && val !== undefined);

    const responseTimeValues = metricsData
      .map(m => m.leadResponseTime?.averageMinutes)
      .filter(val => val !== null && val !== undefined);

    const avgTTFC = ttfcValues.length > 0 
      ? Math.floor(ttfcValues.reduce((sum, val) => sum + val, 0) / ttfcValues.length)
      : null;

    const avgResponseTime = responseTimeValues.length > 0
      ? Math.floor(responseTimeValues.reduce((sum, val) => sum + val, 0) / responseTimeValues.length)
      : null;

    return {
      teamMetrics: {
        averageTTFC: avgTTFC,
        averageResponseTime: avgResponseTime,
        totalLeads: metricsData.length,
        contactedLeads: metricsData.filter(m => m.ttfc?.totalMinutes !== null).length
      },
      leadMetrics: metricsData
    };
  },

  // Lead Aging Metrics Methods
  getLeadAgingMetrics: (options = {}) => {
    const state = get();
    const leads = options.assignee 
      ? state.leads.filter(lead => lead.assignedTo === options.assignee)
      : state.leads;
    return calculateLeadAging(leads, options);
  },

  getContactAttemptsMetrics: (options = {}) => {
    const state = get();
    const leads = options.assignee 
      ? state.leads.filter(lead => lead.assignedTo === options.assignee)
      : state.leads;
    return calculateContactAttempts(leads, options);
  },

  // Deal Activity Metrics Methods
  getActivityPerRepMetrics: (options = {}) => {
    const state = get();
    const leads = options.assignee 
      ? state.leads.filter(lead => lead.assignedTo === options.assignee)
      : state.leads;
    // Note: This would normally also need deals data, but we'll work with leads for now
    return calculateActivityPerRep(leads, [], options);
  },

  // Revenue Engagement Metrics Methods
  getLeadReengagementMetrics: (options = {}) => {
    const state = get();
    const leads = options.assignee 
      ? state.leads.filter(lead => lead.assignedTo === options.assignee)
      : state.leads;
    return calculateLeadReengagementRate(leads, options);
  },

  getStaleLeadsMetrics: (options = {}) => {
    const state = get();
    const leads = options.assignee 
      ? state.leads.filter(lead => lead.assignedTo === options.assignee)
      : state.leads;
    return calculateStaleLeads(leads, options);
  },

  getLeadEngagementSummary: (options = {}) => {
    const state = get();
    const leads = options.assignee 
      ? state.leads.filter(lead => lead.assignedTo === options.assignee)
      : state.leads;

    // Calculate multiple engagement metrics
    const agingMetrics = calculateLeadAging(leads, options);
    const contactMetrics = calculateContactAttempts(leads, options);
    const reengagementMetrics = calculateLeadReengagementRate(leads, options);
    const staleMetrics = calculateStaleLeads(leads, options);
    const dropoffMetrics = calculateDropoffRateByStage(leads, options);

    // Calculate overall health score (0-100)
    let healthScore = 50; // Start with neutral

    // Factor in various metrics (simplified scoring)
    if (agingMetrics.averageAge <= 7) healthScore += 20;
    else if (agingMetrics.averageAge <= 14) healthScore += 10;
    else if (agingMetrics.averageAge > 30) healthScore -= 20;

    if (contactMetrics.contactEfficiency > 70) healthScore += 15;
    else if (contactMetrics.contactEfficiency < 30) healthScore -= 15;

    if (reengagementMetrics.reengagementRate > 40) healthScore += 10;
    else if (reengagementMetrics.reengagementRate < 20) healthScore -= 10;

    if (staleMetrics.staleRate < 15) healthScore += 5;
    else if (staleMetrics.staleRate > 40) healthScore -= 15;

    // Cap between 0 and 100
    healthScore = Math.max(0, Math.min(100, healthScore));

    let healthCategory = { label: 'Average', color: 'yellow' };
    if (healthScore >= 80) healthCategory = { label: 'Excellent', color: 'green' };
    else if (healthScore >= 60) healthCategory = { label: 'Good', color: 'blue' };
    else if (healthScore < 40) healthCategory = { label: 'Needs Attention', color: 'red' };

    return {
      healthScore,
      healthCategory,
      agingMetrics,
      contactMetrics,
      reengagementMetrics,
      staleMetrics,
      dropoffMetrics,
      totalLeads: leads.length,
      timeframe: options.timeframe || '30d'
    };
  },

  // Additional Conversion Analytics Methods
  getConversionBySource: (options = {}) => {
    const state = get();
    // Handle both object and string parameter
    const timeframe = typeof options === 'string' ? options : (options.timeframe || '30d');
    const cutoffDate = state._getTimeframeCutoff(timeframe);
    const filteredLeads = state.leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate >= cutoffDate;
    });

    const sourceData = {};
    
    filteredLeads.forEach(lead => {
      const source = lead.source || 'unknown';
      if (!sourceData[source]) {
        sourceData[source] = { total: 0, converted: 0, lost: 0 };
      }
      sourceData[source].total++;
      if (lead.status === 'won') sourceData[source].converted++;
      if (lead.status === 'lost') sourceData[source].lost++;
    });

    return Object.entries(sourceData).map(([source, data]) => ({
      source,
      ...data,
      conversionRate: data.total > 0 ? (data.converted / data.total) * 100 : 0
    }));
  },

  getConversionByAssignee: (options = {}) => {
    const state = get();
    // Handle both object and string parameter
    const timeframe = typeof options === 'string' ? options : (options.timeframe || '30d');
    const cutoffDate = state._getTimeframeCutoff(timeframe);
    const filteredLeads = state.leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate >= cutoffDate && lead.assignedTo;
    });

    const assigneeData = {};
    
    filteredLeads.forEach(lead => {
      const assignee = lead.assignedTo;
      if (!assigneeData[assignee]) {
        assigneeData[assignee] = { total: 0, converted: 0, lost: 0 };
      }
      assigneeData[assignee].total++;
      if (lead.status === 'won') assigneeData[assignee].converted++;
      if (lead.status === 'lost') assigneeData[assignee].lost++;
    });

    return Object.entries(assigneeData).map(([assignee, data]) => ({
      assignee,
      ...data,
      conversionRate: data.total > 0 ? (data.converted / data.total) * 100 : 0
    }));
  },

  getFunnelMetrics: () => {
    const state = get();
    return calculateFunnelMetrics(state.leads);
  },

  getConversionTrends: (timeframes = ['7d', '30d', '90d']) => {
    const state = get();
    
    return timeframes.map(timeframe => {
      const cutoffDate = state._getTimeframeCutoff(timeframe);
      const filteredLeads = state.leads.filter(lead => {
        const leadDate = new Date(lead.createdAt);
        return leadDate >= cutoffDate;
      });

      const totalLeads = filteredLeads.length;
      const convertedLeads = filteredLeads.filter(lead => lead.status === 'won').length;
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

      return {
        timeframe,
        totalLeads,
        convertedLeads,
        conversionRate,
        formattedRate: `${conversionRate.toFixed(1)}%`
      };
    });
  },

  // Pipeline & Win Rate Methods
  getLeadWinRateMetrics: (options = {}) => {
    const state = get();
    const timeframe = typeof options === 'string' ? options : (options.timeframe || '30d');
    const cutoffDate = state._getTimeframeCutoff(timeframe);
    const filteredLeads = state.leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate >= cutoffDate;
    });

    const closedLeads = filteredLeads.filter(lead => ['won', 'lost'].includes(lead.status));
    const wonLeads = filteredLeads.filter(lead => lead.status === 'won');
    const lostLeads = filteredLeads.filter(lead => lead.status === 'lost');

    const winRate = closedLeads.length > 0 ? (wonLeads.length / closedLeads.length) * 100 : 0;

    return {
      totalClosedLeads: closedLeads.length,
      wonLeads: wonLeads.length,
      lostLeads: lostLeads.length,
      winRate,
      formattedWinRate: `${winRate.toFixed(1)}%`,
      timeframe
    };
  },

  getWinRateBreakdown: (options = {}) => {
    const state = get();
    const timeframe = typeof options === 'string' ? options : (options.timeframe || '30d');
    const cutoffDate = state._getTimeframeCutoff(timeframe);
    const filteredLeads = state.leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate >= cutoffDate && ['won', 'lost'].includes(lead.status);
    });

    // By Source
    const bySource = {};
    // By Assignee
    const byAssignee = {};

    filteredLeads.forEach(lead => {
      // Source breakdown
      const source = lead.source || 'unknown';
      if (!bySource[source]) bySource[source] = { won: 0, lost: 0, total: 0 };
      bySource[source].total++;
      if (lead.status === 'won') bySource[source].won++;
      else bySource[source].lost++;

      // Assignee breakdown
      const assignee = lead.assignedTo;
      if (assignee) {
        if (!byAssignee[assignee]) byAssignee[assignee] = { won: 0, lost: 0, total: 0 };
        byAssignee[assignee].total++;
        if (lead.status === 'won') byAssignee[assignee].won++;
        else byAssignee[assignee].lost++;
      }
    });

    // Calculate win rates
    const sourceBreakdown = Object.entries(bySource).map(([source, data]) => ({
      source,
      ...data,
      winRate: data.total > 0 ? (data.won / data.total) * 100 : 0
    }));

    const assigneeBreakdown = Object.entries(byAssignee).map(([assignee, data]) => ({
      assignee,
      ...data,
      winRate: data.total > 0 ? (data.won / data.total) * 100 : 0
    }));

    return {
      bySource: sourceBreakdown,
      byAssignee: assigneeBreakdown,
      timeframe
    };
  },

  // Advanced Lead Metrics
  getStageConversionMetrics: (options = {}) => {
    const state = get();
    const timeframe = typeof options === 'string' ? options : (options.timeframe || '30d');
    const cutoffDate = state._getTimeframeCutoff(timeframe);
    const filteredLeads = state.leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate >= cutoffDate;
    });

    return calculateStageConversions(filteredLeads, options);
  },

  getLeadAgingAnalysis: (options = {}) => {
    const state = get();
    const timeframe = typeof options === 'string' ? options : (options.timeframe || '30d');
    const cutoffDate = state._getTimeframeCutoff(timeframe);
    const filteredLeads = state.leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate >= cutoffDate;
    });

    const agingMetrics = calculateLeadAging(filteredLeads, options);
    const contactMetrics = calculateContactAttempts(filteredLeads, options);

    return {
      ...agingMetrics,
      contactMetrics,
      summary: {
        totalLeads: filteredLeads.length,
        criticalLeads: agingMetrics.criticalLeads?.length || 0,
        respondedLeads: contactMetrics.respondedLeads || 0,
        timeframe
      }
    };
  },

  // Conversion Analytics Methods  
  getLeadConversionMetrics: (options = {}) => {
    const state = get();
    const cutoffDate = state._getTimeframeCutoff(options.timeframe || '30d');
    const filteredLeads = state.leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate >= cutoffDate;
    });

    const totalLeads = filteredLeads.length;
    const convertedLeads = filteredLeads.filter(lead => lead.status === 'won').length;
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100) : 0;

    return {
      totalLeads,
      convertedLeads,
      conversionRate,
      formattedRate: `${conversionRate.toFixed(1)}%`,
      timeframe: options.timeframe || '30d'
    };
  },

  getCombinedActivityMetrics: (deals = [], options = {}) => {
    const state = get();
    const timeframe = options.timeframe || '30d';
    const assignee = options.assignee || 'all';
    const cutoffDate = state._getTimeframeCutoff(timeframe);

    // Filter leads by timeframe and assignee
    const filteredLeads = state.leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      const timeframeMatch = leadDate >= cutoffDate;
      const assigneeMatch = assignee === 'all' || lead.assignedTo === assignee;
      return timeframeMatch && assigneeMatch;
    });

    // Filter deals by timeframe and assignee
    const filteredDeals = deals.filter(deal => {
      const dealDate = new Date(deal.createdAt);
      const timeframeMatch = dealDate >= cutoffDate;
      const assigneeMatch = assignee === 'all' || deal.assignedTo === assignee;
      return timeframeMatch && assigneeMatch;
    });

    // Combine activities from both leads and deals
    const allActivities = [];

    // Add lead activities
    filteredLeads.forEach(lead => {
      if (lead.activities) {
        lead.activities.forEach(activity => {
          allActivities.push({
            ...activity,
            sourceType: 'lead',
            sourceId: lead.id,
            companyName: lead.companyName
          });
        });
      }
    });

    // Add deal activities
    filteredDeals.forEach(deal => {
      if (deal.activities) {
        deal.activities.forEach(activity => {
          allActivities.push({
            ...activity,
            sourceType: 'deal',
            sourceId: deal.id,
            companyName: deal.companyName || deal.dealName
          });
        });
      }
    });

    // Calculate metrics
    const totalActivities = allActivities.length;
    const emailActivities = allActivities.filter(a => a.type === 'Email').length;
    const callActivities = allActivities.filter(a => a.type === 'Call').length;
    const meetingActivities = allActivities.filter(a => a.type === 'Meeting').length;
    const noteActivities = allActivities.filter(a => a.type === 'Note').length;

    // Calculate activity frequency (activities per day)
    const daysCovered = Math.max(1, Math.ceil((Date.now() - cutoffDate.getTime()) / (24 * 60 * 60 * 1000)));
    const activitiesPerDay = totalActivities / daysCovered;

    // Calculate response rates
    const responseActivities = allActivities.filter(a => a.isResponse).length;
    const responseRate = totalActivities > 0 ? (responseActivities / totalActivities) * 100 : 0;

    // Activity breakdown by assignee
    const activityByAssignee = {};
    allActivities.forEach(activity => {
      const assigneeId = activity.assignedTo || 'unassigned';
      if (!activityByAssignee[assigneeId]) {
        activityByAssignee[assigneeId] = {
          total: 0,
          emails: 0,
          calls: 0,
          meetings: 0,
          notes: 0
        };
      }
      activityByAssignee[assigneeId].total++;
      activityByAssignee[assigneeId][activity.type.toLowerCase() + 's']++;
    });

    // Recent activity trends (last 7 vs previous 7 days)
    const recentCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const previousCutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    
    const recentActivities = allActivities.filter(a => new Date(a.createdAt) >= recentCutoff).length;
    const previousActivities = allActivities.filter(a => {
      const activityDate = new Date(a.createdAt);
      return activityDate >= previousCutoff && activityDate < recentCutoff;
    }).length;

    const activityTrend = previousActivities > 0 
      ? ((recentActivities - previousActivities) / previousActivities) * 100 
      : 0;

    return {
      totalActivities,
      emailActivities,
      callActivities,
      meetingActivities,
      noteActivities,
      activitiesPerDay: activitiesPerDay.toFixed(1),
      responseRate: responseRate.toFixed(1),
      activityByAssignee,
      activityTrend: activityTrend.toFixed(1),
      recentActivities,
      previousActivities,
      timeframe,
      dateRange: {
        start: cutoffDate.toISOString(),
        end: new Date().toISOString()
      },
      sourceCoverage: {
        leads: filteredLeads.length,
        deals: filteredDeals.length,
        totalSources: filteredLeads.length + filteredDeals.length
      }
    };
  },

  _getTimeframeCutoff: (timeframe) => {
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
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error })
}));

export default useLeadStore;
