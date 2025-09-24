import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import LeadList from './components/LeadList';
import LeadProfile from './components/LeadProfile';
import LeadCaptureForm from './components/LeadCaptureForm';
import useLeadStore from './stores/leadStore';
import { LEAD_STATUSES, LEAD_SOURCES } from './constants/index';
import useRoutingStore from '../routing/stores/routingStore';

const LeadsModule = () => {
  const [showCaptureForm, setShowCaptureForm] = useState(false);
  const { leads, setLeads, selectedLead, setSelectedLead } = useLeadStore();

  // Initialize with sample data
  useEffect(() => {
    if (leads.length === 0) {
      const sampleLeads = [
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
          closedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: 'Deal closed successfully - contract signed',
          activities: [
            {
              id: 'a1',
              type: 'Call',
              description: 'Initial contact call - introduced company and products',
              user: 'Sara Ahmed',
              createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { duration: '15 min', outcome: 'interested' }
            },
            {
              id: 'a2',
              type: 'Email',
              description: 'Sent product catalog and pricing information',
              user: 'Sara Ahmed',
              createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { subject: 'Premium Tea Collection - Product Catalog' }
            },
            {
              id: 'a3',
              type: 'Call',
              description: 'Client called back - very interested in bulk pricing',
              user: 'Sara Ahmed',
              createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: true,
              isResponse: true,
              metadata: { duration: '25 min', outcome: 'qualified' }
            },
            {
              id: 'a4',
              type: 'Meeting',
              description: 'Product demonstration and tasting session at client office',
              user: 'Sara Ahmed',
              createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { duration: '2 hours', outcome: 'very_positive' }
            },
            {
              id: 'a5',
              type: 'Email',
              description: 'Sent formal proposal with quarterly supply terms',
              user: 'Sara Ahmed',
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { subject: 'Quarterly Supply Proposal - Zayed Traders' }
            },
            {
              id: 'a6',
              type: 'Call',
              description: 'Negotiation call - agreed on terms and pricing',
              user: 'Sara Ahmed',
              createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: true,
              metadata: { duration: '45 min', outcome: 'agreed' }
            },
            {
              id: 'a7',
              type: 'status_change',
              description: 'Deal closed - contract signed for $45,000',
              user: 'Sara Ahmed',
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { finalValue: 45000, source: 'deal_closure' }
            }
          ]
        },
        {
          id: '2',
          companyName: 'UK Tea Imports',
          contactName: 'John Smith',
          email: 'john@ukteaimports.com',
          phone: '+44 20 7123 4567',
          location: 'London, UK',
          source: LEAD_SOURCES.WEBSITE,
          status: LEAD_STATUSES.IN_PROGRESS,
          language: 'english',
          productInterest: 'Organic Herbal Tea',
          notes: 'Looking for exclusive distribution rights - very promising lead',
          tags: ['distributor', 'uk-market', 'high-value'],
          assignedTo: 'user-2', // Maria
          dealValue: 75000,
          createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: 'Scheduled demo for next week',
          activities: [
            {
              id: 'b1',
              type: 'Email',
              description: 'Initial inquiry response - welcomed to our catalog',
              user: 'Maria Rodriguez',
              createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { subject: 'Welcome to Premium Tea Collection' }
            },
            {
              id: 'b2',
              type: 'Call',
              description: 'Discovery call to understand distribution requirements',
              user: 'Maria Rodriguez',
              createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { duration: '35 min', outcome: 'qualified' }
            },
            {
              id: 'b3',
              type: 'Email',
              description: 'Sent detailed product catalog and pricing for distributors',
              user: 'Maria Rodriguez',
              createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { subject: 'UK Distribution Partnership - Product Catalog' }
            },
            {
              id: 'b4',
              type: 'WhatsApp',
              description: 'Client messaged about exclusive territory rights',
              user: 'Maria Rodriguez',
              createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: true,
              isResponse: true,
              metadata: { platform: 'whatsapp', outcome: 'interested' }
            },
            {
              id: 'b5',
              type: 'Call',
              description: 'Follow-up call about exclusive distribution agreement',
              user: 'Maria Rodriguez',
              createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { duration: '40 min', outcome: 'very_interested' }
            },
            {
              id: 'b6',
              type: 'Meeting',
              description: 'Scheduled product demo and tasting session for next week',
              user: 'Maria Rodriguez',
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { scheduled_for: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() }
            }
          ]
        },
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
          assignedTo: 'user-3', // Amir
          dealValue: 100000,
          closedValue: 95000,
          closedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: 'Contract signed - major win!',
          activities: [
            {
              id: 'c1',
              type: 'Meeting',
              description: 'Initial meeting at Middle East Food Expo 2025',
              user: 'Amir Hassan',
              createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { duration: '45 min', event: 'Middle East Food Expo', outcome: 'interested' }
            },
            {
              id: 'c2',
              type: 'Call',
              description: 'Follow-up call to discuss supermarket chain requirements',
              user: 'Amir Hassan',
              createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { duration: '50 min', outcome: 'qualified' }
            },
            {
              id: 'c3',
              type: 'Email',
              description: 'Sent comprehensive product portfolio for supermarket chains',
              user: 'Amir Hassan',
              createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { subject: 'GulfMart Partnership - Complete Product Portfolio' }
            },
            {
              id: 'c4',
              type: 'Meeting',
              description: 'Product tasting session at GulfMart headquarters',
              user: 'Amir Hassan',
              createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { duration: '3 hours', outcome: 'excellent_feedback' }
            },
            {
              id: 'c5',
              type: 'Call',
              description: 'Pricing negotiation call with procurement team',
              user: 'Amir Hassan',
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: true,
              metadata: { duration: '1.5 hours', outcome: 'negotiating' }
            },
            {
              id: 'c6',
              type: 'Email',
              description: 'Sent final proposal with volume discounts',
              user: 'Amir Hassan',
              createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { subject: 'Final Proposal - GulfMart Tea Supply Agreement' }
            },
            {
              id: 'c7',
              type: 'Call',
              description: 'Received approval call from Fatima - deal accepted!',
              user: 'Amir Hassan',
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: true,
              isResponse: true,
              metadata: { duration: '30 min', outcome: 'accepted' }
            },
            {
              id: 'c8',
              type: 'status_change',
              description: 'Contract signed - $95,000 annual supply agreement',
              user: 'Amir Hassan',
              createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { finalValue: 95000, source: 'deal_closure' }
            }
          ]
        },
        // Recent high-performing leads for Maria Rodriguez
        {
          id: '11',
          companyName: 'European Tea House',
          contactName: 'Hans Mueller',
          email: 'hans@europeanteahouse.de',
          phone: '+49 30 123 4567',
          location: 'Berlin, Germany',
          source: LEAD_SOURCES.WEBSITE,
          status: LEAD_STATUSES.WON,
          language: 'english',
          productInterest: 'Organic Tea Collection',
          notes: 'Quick win - excellent response time',
          tags: ['organic', 'europe', 'quick-win', 'closed-won'],
          assignedTo: 'user-2', // Maria
          dealValue: 35000,
          closedValue: 32000,
          closedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: 'Deal closed - fast turnaround',
          activities: [
            {
              id: 'e1',
              type: 'Email',
              description: 'Immediate response to website inquiry',
              user: 'Maria Rodriguez',
              createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { response_time: '15 minutes' }
            },
            {
              id: 'e2',
              type: 'Call',
              description: 'Quick qualification call - perfect fit',
              user: 'Maria Rodriguez',
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { duration: '20 min', outcome: 'perfect_fit' }
            },
            {
              id: 'e3',
              type: 'Email',
              description: 'Client responded with purchase intent',
              user: 'Maria Rodriguez',
              createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: true,
              isResponse: true,
              metadata: { subject: 'Ready to proceed with order' }
            },
            {
              id: 'e4',
              type: 'status_change',
              description: 'Deal closed quickly - $32,000',
              user: 'Maria Rodriguez',
              createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { finalValue: 32000, source: 'deal_closure', cycle_days: 3 }
            }
          ]
        },
        // Closed deals for performance tracking - Enhanced with full activity chains
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
          assignedTo: 'user-4', // Jacob
          dealValue: 42000,
          closedValue: 42000,
          closedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: 'Deal closed successfully - repeat order confirmed',
          activities: [
            {
              id: 'h1',
              type: 'Email',
              description: 'Response to website inquiry - same day',
              user: 'Jacob Williams',
              createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { response_time: '2 hours' }
            },
            {
              id: 'h2',
              type: 'Call',
              description: 'Follow-up call - discussed repeat customer benefits',
              user: 'Jacob Williams',
              createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { duration: '20 min', outcome: 'interested' }
            },
            {
              id: 'h3',
              type: 'Email',
              description: 'Sent updated pricing for bulk orders',
              user: 'Jacob Williams',
              createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { subject: 'Updated Pricing - Ceylon Tea Quarterly Supply' }
            },
            {
              id: 'h4',
              type: 'Call',
              description: 'Client called to confirm order details',
              user: 'Jacob Williams',
              createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: true,
              isResponse: true,
              metadata: { duration: '15 min', outcome: 'confirmed' }
            },
            {
              id: 'h5',
              type: 'status_change',
              description: 'Deal closed - $42,000 quarterly supply contract',
              user: 'Jacob Williams',
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { finalValue: 42000, source: 'deal_closure', cycle_days: 13 }
            }
          ]
        },
        {
          id: '5',
          companyName: 'Pacific Beverages',
          contactName: 'Lisa Wong',
          email: 'lisa@pacificbev.sg',
          phone: '+65 9123 4567',
          location: 'Singapore',
          source: LEAD_SOURCES.EMAIL,
          status: LEAD_STATUSES.WON,
          language: 'english',
          productInterest: 'Specialty Tea Collection',
          notes: 'Large order for hotel chain - premium hospitality supplier',
          tags: ['closed-won', 'hospitality', 'singapore', 'hotel-chain'],
          assignedTo: 'user-5', // Anna
          dealValue: 68000,
          closedValue: 65000,
          closedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: 'Contract signed - hotel chain partnership',
          activities: [
            {
              id: 'i1',
              type: 'Email',
              description: 'Responded to email inquiry within 1 hour',
              user: 'Anna Chen',
              createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { response_time: '1 hour' }
            },
            {
              id: 'i2',
              type: 'Call',
              description: 'Initial consultation about hotel chain needs',
              user: 'Anna Chen',
              createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { duration: '45 min', outcome: 'qualified' }
            },
            {
              id: 'i3',
              type: 'Meeting',
              description: 'On-site tasting session at hotel location',
              user: 'Anna Chen',
              createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { duration: '2.5 hours', outcome: 'very_positive' }
            },
            {
              id: 'i4',
              type: 'Email',
              description: 'Proposal for multi-property tea supply',
              user: 'Anna Chen',
              createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { subject: 'Hotel Chain Tea Supply Proposal' }
            },
            {
              id: 'i5',
              type: 'Call',
              description: 'Final negotiation with procurement team',
              user: 'Anna Chen',
              createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: true,
              metadata: { duration: '1 hour', outcome: 'agreed' }
            },
            {
              id: 'i6',
              type: 'status_change',
              description: 'Contract signed - $65,000 annual hotel chain supply',
              user: 'Anna Chen',
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { finalValue: 65000, source: 'deal_closure', cycle_days: 17 }
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
          assignedTo: 'user-4', // Jacob - another lead for performance
          dealValue: 35000,
          closedValue: 33000,
          closedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: 'Deal closed - chai blend partnership',
          activities: [
            {
              id: 'j1',
              type: 'Email',
              description: 'Quick response to Facebook message inquiry',
              user: 'Jacob Williams',
              createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { response_time: '3 hours' }
            },
            {
              id: 'j2',
              type: 'Call',
              description: 'Discovery call about chai blend requirements',
              user: 'Jacob Williams',
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { duration: '30 min', outcome: 'interested' }
            },
            {
              id: 'j3',
              type: 'Email',
              description: 'Sent chai tea samples and pricing',
              user: 'Jacob Williams',
              createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { subject: 'Chai Tea Samples and Bulk Pricing' }
            },
            {
              id: 'j4',
              type: 'Call',
              description: 'Client loved samples - ready to order',
              user: 'Jacob Williams',
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: true,
              isResponse: true,
              metadata: { duration: '25 min', outcome: 'ready_to_buy' }
            },
            {
              id: 'j5',
              type: 'status_change',
              description: 'Deal closed - $33,000 chai blend supply contract',
              user: 'Jacob Williams',
              createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { finalValue: 33000, source: 'deal_closure', cycle_days: 8 }
            }
          ]
        },
        // New unassigned lead for routing demo
        {
          id: '7',
          companyName: 'Dubai Tea Palace',
          contactName: 'Ahmad Al-Rashid',
          email: 'ahmad@dubaitealace.ae',
          phone: '+971 50 555 1234',
          location: 'Dubai, UAE',
          source: LEAD_SOURCES.WHATSAPP,
          status: LEAD_STATUSES.NEW,
          language: 'arabic',
          productInterest: 'Luxury Tea Collection',
          notes: 'Interested in exclusive distribution for UAE market',
          tags: ['high-priority', 'wholesale', 'uae-market'],
          assignedTo: null, // Unassigned for routing
          dealValue: 85000,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          lastActivity: null,
          activities: []
        },
        // Additional high-performing leads for Maria Rodriguez
        {
          id: '12',
          companyName: 'Nordic Premium Foods',
          contactName: 'Lars Larsson',
          email: 'lars@nordicfoods.no',
          phone: '+47 98 123 456',
          location: 'Oslo, Norway',
          source: LEAD_SOURCES.EMAIL,
          status: LEAD_STATUSES.WON,
          language: 'english',
          productInterest: 'Luxury Tea Collection',
          notes: 'Closed - Premium restaurant chain deal',
          tags: ['restaurant-chain', 'luxury', 'nordic', 'closed-won'],
          assignedTo: 'user-2', // Maria
          dealValue: 60000,
          closedValue: 55000,
          closedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: 'Deal closed - premium restaurant chain partnership',
          activities: [
            {
              id: 'f1',
              type: 'Email',
              description: 'Quick response to email inquiry - 20 minutes',
              user: 'Maria Rodriguez',
              createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { response_time: '20 minutes' }
            },
            {
              id: 'f2',
              type: 'Call',
              description: 'Qualification call - excellent fit for premium line',
              user: 'Maria Rodriguez',
              createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { duration: '30 min', outcome: 'excellent_fit' }
            },
            {
              id: 'f3',
              type: 'Email',
              description: 'Client expressed strong interest in partnership',
              user: 'Maria Rodriguez',
              createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: true,
              isResponse: true,
              metadata: { subject: 'Ready to move forward with partnership' }
            },
            {
              id: 'f4',
              type: 'Meeting',
              description: 'Product showcase and tasting session',
              user: 'Maria Rodriguez',
              createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { duration: '2 hours', outcome: 'very_positive' }
            },
            {
              id: 'f5',
              type: 'status_change',
              description: 'Deal closed - $55,000 annual contract',
              user: 'Maria Rodriguez',
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { finalValue: 55000, source: 'deal_closure', cycle_days: 5 }
            }
          ]
        },
        {
          id: '13',
          companyName: 'Swiss Tea Boutique',
          contactName: 'Henri Müller',
          email: 'henri@swissteaboutique.ch',
          phone: '+41 79 123 4567',
          location: 'Zurich, Switzerland',
          source: LEAD_SOURCES.WEBSITE,
          status: LEAD_STATUSES.WON,
          language: 'english',
          productInterest: 'Artisan Tea Collection',
          notes: 'Closed - Boutique tea shop premium supplier',
          tags: ['boutique', 'premium', 'switzerland', 'closed-won'],
          assignedTo: 'user-2', // Maria
          dealValue: 25000,
          closedValue: 25000,
          closedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: 'Deal closed - boutique partnership',
          activities: [
            {
              id: 'g1',
              type: 'Email',
              description: 'Ultra-fast response - 8 minutes',
              user: 'Maria Rodriguez',
              createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 8 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 8 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { response_time: '8 minutes' }
            },
            {
              id: 'g2',
              type: 'Call',
              description: 'Same-day call - immediate connection',
              user: 'Maria Rodriguez',
              createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { duration: '25 min', outcome: 'immediate_interest' }
            },
            {
              id: 'g3',
              type: 'Email',
              description: 'Client ready to proceed immediately',
              user: 'Maria Rodriguez',
              createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: true,
              isResponse: true,
              metadata: { subject: 'Let\'s finalize this today' }
            },
            {
              id: 'g4',
              type: 'status_change',
              description: 'Deal closed same week - $25,000',
              user: 'Maria Rodriguez',
              createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
              isFromLead: false,
              isResponse: false,
              metadata: { finalValue: 25000, source: 'deal_closure', cycle_days: 2 }
            }
          ]
        },
        // Additional unassigned leads for routing demo
        {
          id: '8',
          companyName: 'Qatar Fine Foods',
          contactName: 'Khalid Al-Thani',
          email: 'khalid@qatarfinefoods.qa',
          phone: '+974 5555 6789',
          location: 'Doha, Qatar',
          source: LEAD_SOURCES.FACEBOOK,
          status: LEAD_STATUSES.NEW,
          language: 'arabic',
          productInterest: 'Premium Green Tea',
          notes: 'Large retail chain looking for supplier',
          tags: ['high-value', 'retail-chain', 'qatar'],
          assignedTo: null,
          dealValue: 120000,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          lastActivity: null,
          activities: []
        },
        {
          id: '9',
          companyName: 'Nordic Tea House',
          contactName: 'Erik Andersson',
          email: 'erik@nordicteahouse.se',
          phone: '+46 70 123 4567',
          location: 'Stockholm, Sweden',
          source: LEAD_SOURCES.WEBSITE,
          status: LEAD_STATUSES.NEW,
          language: 'english',
          productInterest: 'Organic Tea Selection',
          notes: 'Expanding operations to Nordics',
          tags: ['organic', 'europe', 'expansion'],
          assignedTo: null,
          dealValue: 45000,
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          lastActivity: null,
          activities: []
        },
        {
          id: '10',
          companyName: 'Jakarta Tea Trading',
          contactName: 'Siti Nurhaliza',
          email: 'siti@jakartateatrading.id',
          phone: '+62 812 3456 7890',
          location: 'Jakarta, Indonesia',
          source: LEAD_SOURCES.EVENT,
          status: LEAD_STATUSES.NEW,
          language: 'english',
          productInterest: 'Traditional Tea Blends',
          notes: 'Met at Asia Tea Expo 2025',
          tags: ['expo-lead', 'indonesia', 'traditional'],
          assignedTo: null,
          dealValue: 35000,
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          lastActivity: null,
          activities: []
        }
      ];
      setLeads(sampleLeads);
      
      // Process unassigned leads for routing
      setTimeout(() => {
        sampleLeads.forEach(lead => {
          if (!lead.assignedTo) {
            const routingStore = useRoutingStore.getState();
            const processedLead = routingStore.processLeadForRouting(lead);
            console.log('Processed lead for routing:', processedLead);
          }
        });
      }, 100);
    }
  }, []);

  const handleSelectLead = (lead) => {
    setSelectedLead(lead);
  };

  const handleBack = () => {
    setSelectedLead(null);
  };

  return (
    <div className="h-full flex bg-gray-50">
      {/* Sidebar - Lead List */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        <LeadList onSelectLead={handleSelectLead} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {selectedLead ? (
          <LeadProfile lead={selectedLead} onBack={handleBack} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Welcome to Lead Management
              </h2>
              <p className="text-gray-600 mb-6">
                Select a lead from the list or create a new one to get started
              </p>
              <button
                onClick={() => setShowCaptureForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add New Lead
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowCaptureForm(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:shadow-xl"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Lead Capture Form Modal */}
      {showCaptureForm && (
        <LeadCaptureForm onClose={() => setShowCaptureForm(false)} />
      )}
    </div>
  );
};

export default LeadsModule;