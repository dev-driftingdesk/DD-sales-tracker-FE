import useLeadStore from '../../leads/stores/leadStore';
import useRoutingStore from '../../routing/stores/routingStore';
import { LEAD_STATUSES, LEAD_SOURCES } from '../../leads/constants/index';

export const initializeLeadsIfNeeded = () => {
  const leadStore = useLeadStore.getState();
  
  if (leadStore.leads.length === 0) {
    console.log('Initializing sample leads for voice assistant');
    
    // Helper function to create realistic business hour timestamps
    const createBusinessHourTimestamp = (daysAgo, hour = 9, minute = 0) => {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      date.setHours(hour, minute, 0, 0);
      return date.toISOString();
    };

    const sampleLeads = [
      // EXCELLENT TTFC SCENARIO (< 30 minutes)
      {
        id: '1',
        companyName: 'TechStart Solutions',
        contactName: 'Sarah Johnson',
        email: 'sarah@techstart.com',
        phone: '+1 555 123 4567',
        location: 'San Francisco, CA',
        source: LEAD_SOURCES.WEBSITE,
        status: LEAD_STATUSES.CONTACTED,
        language: 'english',
        productInterest: 'Enterprise Software Package',
        notes: 'Hot lead - responded within 15 minutes of inquiry',
        tags: ['hot-lead', 'enterprise', 'tech'],
        assignedTo: 'user-1',
        dealValue: 85000,
        createdAt: createBusinessHourTimestamp(3, 9, 0), // 3 days ago at 9:00 AM
        updatedAt: createBusinessHourTimestamp(3, 14, 30),
        lastActivity: 'Follow-up email sent with demo link',
        activities: [
          {
            id: 'a1-1',
            type: 'email_received',
            description: 'Lead submitted contact form requesting product demo',
            user: 'Sarah Johnson',
            createdAt: createBusinessHourTimestamp(3, 9, 0),
            timestamp: createBusinessHourTimestamp(3, 9, 0),
            isFromLead: true,
            isResponse: false,
            metadata: { source: 'website_form', urgency: 'high' }
          },
          {
            id: 'a1-2',
            type: 'call',
            description: 'Called lead immediately - excellent response time!',
            user: 'Alex Thompson',
            createdAt: createBusinessHourTimestamp(3, 9, 15), // 15 minutes later
            timestamp: createBusinessHourTimestamp(3, 9, 15),
            isFromLead: false,
            isResponse: true,
            metadata: { duration: '12 minutes', outcome: 'scheduled_demo' }
          },
          {
            id: 'a1-3',
            type: 'email',
            description: 'Sent calendar invite for product demo',
            user: 'Alex Thompson',
            createdAt: createBusinessHourTimestamp(3, 9, 30),
            timestamp: createBusinessHourTimestamp(3, 9, 30),
            isFromLead: false,
            isResponse: false,
            metadata: { type: 'calendar_invite' }
          },
          {
            id: 'a1-4',
            type: 'email_received',
            description: 'Lead confirmed demo meeting for tomorrow',
            user: 'Sarah Johnson',
            createdAt: createBusinessHourTimestamp(3, 10, 45),
            timestamp: createBusinessHourTimestamp(3, 10, 45),
            isFromLead: true,
            isResponse: false,
            metadata: { confirmation: true }
          },
          {
            id: 'a1-5',
            type: 'email',
            description: 'Follow-up email sent with demo link',
            user: 'Alex Thompson',
            createdAt: createBusinessHourTimestamp(3, 14, 30),
            timestamp: createBusinessHourTimestamp(3, 14, 30),
            isFromLead: false,
            isResponse: true,
            metadata: { type: 'follow_up' }
          }
        ]
      },
      
      // GOOD TTFC SCENARIO (30 minutes - 2 hours)
      {
        id: '2',
        companyName: 'GreenEarth Retail',
        contactName: 'Michael Chen',
        email: 'michael@greenearth.com',
        phone: '+1 555 987 6543',
        location: 'Portland, OR',
        source: LEAD_SOURCES.FACEBOOK,
        status: LEAD_STATUSES.IN_PROGRESS,
        language: 'english',
        productInterest: 'Sustainable Product Line',
        notes: 'Interested in eco-friendly alternatives. Good response time.',
        tags: ['sustainability', 'retail', 'qualified'],
        assignedTo: 'user-2',
        dealValue: 45000,
        createdAt: createBusinessHourTimestamp(5, 14, 30), // 5 days ago at 2:30 PM
        updatedAt: createBusinessHourTimestamp(4, 11, 0),
        lastActivity: 'Proposal sent with pricing options',
        activities: [
          {
            id: 'a2-1',
            type: 'message_received',
            description: 'Facebook message: "Interested in your sustainable products for our retail chain"',
            user: 'Michael Chen',
            createdAt: createBusinessHourTimestamp(5, 14, 30),
            timestamp: createBusinessHourTimestamp(5, 14, 30),
            isFromLead: true,
            isResponse: false,
            metadata: { source: 'facebook_messenger', platform: 'social' }
          },
          {
            id: 'a2-2',
            type: 'email',
            description: 'Sent initial response with product catalog',
            user: 'Maria Rodriguez',
            createdAt: createBusinessHourTimestamp(5, 16, 15), // 1 hour 45 minutes later
            timestamp: createBusinessHourTimestamp(5, 16, 15),
            isFromLead: false,
            isResponse: true,
            metadata: { attachments: ['product_catalog.pdf'] }
          },
          {
            id: 'a2-3',
            type: 'email_received',
            description: 'Lead replied with specific product questions',
            user: 'Michael Chen',
            createdAt: createBusinessHourTimestamp(5, 17, 30),
            timestamp: createBusinessHourTimestamp(5, 17, 30),
            isFromLead: true,
            isResponse: false,
            metadata: { questions_count: 5 }
          },
          {
            id: 'a2-4',
            type: 'call',
            description: 'Phone call to discuss product specifications',
            user: 'Maria Rodriguez',
            createdAt: createBusinessHourTimestamp(4, 10, 0),
            timestamp: createBusinessHourTimestamp(4, 10, 0),
            isFromLead: false,
            isResponse: true,
            metadata: { duration: '25 minutes', outcome: 'proposal_requested' }
          },
          {
            id: 'a2-5',
            type: 'email',
            description: 'Proposal sent with pricing options',
            user: 'Maria Rodriguez',
            createdAt: createBusinessHourTimestamp(4, 11, 0),
            timestamp: createBusinessHourTimestamp(4, 11, 0),
            isFromLead: false,
            isResponse: false,
            metadata: { type: 'proposal', options: 3 }
          }
        ]
      },
      
      // FAIR TTFC SCENARIO (2-8 hours)
      {
        id: '3',
        companyName: 'MidSize Manufacturing',
        contactName: 'Jennifer Park',
        email: 'jennifer@midsize.com',
        phone: '+1 555 246 8135',
        location: 'Chicago, IL',
        source: LEAD_SOURCES.REFERRAL,
        status: LEAD_STATUSES.CONTACTED,
        language: 'english',
        productInterest: 'Industrial Equipment',
        notes: 'Referred by existing client. Acceptable response time.',
        tags: ['referral', 'manufacturing', 'qualified'],
        assignedTo: 'user-3',
        dealValue: 125000,
        createdAt: createBusinessHourTimestamp(7, 16, 0), // 7 days ago at 4:00 PM
        updatedAt: createBusinessHourTimestamp(6, 15, 30),
        lastActivity: 'Site visit scheduled for next week',
        activities: [
          {
            id: 'a3-1',
            type: 'email_received',
            description: 'Referral email: "ABC Corp recommended your industrial equipment"',
            user: 'Jennifer Park',
            createdAt: createBusinessHourTimestamp(7, 16, 0),
            timestamp: createBusinessHourTimestamp(7, 16, 0),
            isFromLead: true,
            isResponse: false,
            metadata: { referrer: 'ABC Corp', source: 'referral' }
          },
          {
            id: 'a3-2',
            type: 'email',
            description: 'Responded same evening with welcome message and questionnaire',
            user: 'David Kim',
            createdAt: createBusinessHourTimestamp(7, 20, 0), // Same day evening (4 hours later)
            timestamp: createBusinessHourTimestamp(7, 20, 0),
            isFromLead: false,
            isResponse: true,
            metadata: { attachments: ['client_questionnaire.pdf'] }
          },
          {
            id: 'a3-3',
            type: 'email_received',
            description: 'Completed questionnaire returned with requirements',
            user: 'Jennifer Park',
            createdAt: createBusinessHourTimestamp(6, 14, 15),
            timestamp: createBusinessHourTimestamp(6, 14, 15),
            isFromLead: true,
            isResponse: false,
            metadata: { requirements_detailed: true }
          },
          {
            id: 'a3-4',
            type: 'call',
            description: 'Follow-up call to discuss requirements and schedule site visit',
            user: 'David Kim',
            createdAt: createBusinessHourTimestamp(6, 15, 30),
            timestamp: createBusinessHourTimestamp(6, 15, 30),
            isFromLead: false,
            isResponse: true,
            metadata: { duration: '18 minutes', outcome: 'site_visit_scheduled' }
          }
        ]
      },
      
      // POOR TTFC SCENARIO (8-24 hours)
      {
        id: '4',
        companyName: 'StartUp Dynamics',
        contactName: 'Robert Wilson',
        email: 'robert@startupdynamics.com',
        phone: '+1 555 369 2580',
        location: 'Austin, TX',
        source: LEAD_SOURCES.EVENT,
        status: LEAD_STATUSES.CONTACTED,
        language: 'english',
        productInterest: 'Business Consulting Services',
        notes: 'Met at startup conference. Slow initial response but engaged now.',
        tags: ['startup', 'conference', 'consulting'],
        assignedTo: 'user-1',
        dealValue: 25000,
        createdAt: createBusinessHourTimestamp(10, 15, 45), // 10 days ago at 3:45 PM
        updatedAt: createBusinessHourTimestamp(9, 10, 0),
        lastActivity: 'Initial consultation call completed',
        activities: [
          {
            id: 'a4-1',
            type: 'message_received',
            description: 'LinkedIn message: "Great meeting you at Tech Conference. Interested in your consulting services"',
            user: 'Robert Wilson',
            createdAt: createBusinessHourTimestamp(10, 15, 45),
            timestamp: createBusinessHourTimestamp(10, 15, 45),
            isFromLead: true,
            isResponse: false,
            metadata: { source: 'linkedin', event: 'Tech Conference 2025' }
          },
          {
            id: 'a4-2',
            type: 'email',
            description: 'Finally responded with service overview and availability',
            user: 'Lisa Chang',
            createdAt: createBusinessHourTimestamp(9, 11, 30), // About 20 hours later
            timestamp: createBusinessHourTimestamp(9, 11, 30),
            isFromLead: false,
            isResponse: true,
            metadata: { delay_reason: 'high_volume', attachments: ['service_overview.pdf'] }
          },
          {
            id: 'a4-3',
            type: 'call',
            description: 'Initial consultation call completed',
            user: 'Lisa Chang',
            createdAt: createBusinessHourTimestamp(9, 10, 0),
            timestamp: createBusinessHourTimestamp(9, 10, 0),
            isFromLead: false,
            isResponse: false,
            metadata: { duration: '30 minutes', outcome: 'needs_assessment' }
          }
        ]
      },
      
      // VERY POOR TTFC SCENARIO (> 24 hours)
      {
        id: '5',
        companyName: 'Legacy Corp',
        contactName: 'Thomas Anderson',
        email: 'thomas@legacycorp.com',
        phone: '+1 555 147 2589',
        location: 'New York, NY',
        source: LEAD_SOURCES.COLD_CALL,
        status: LEAD_STATUSES.CONTACTED,
        language: 'english',
        productInterest: 'System Modernization',
        notes: 'Cold outreach lead. Very delayed response - needs improvement.',
        tags: ['cold-lead', 'enterprise', 'delayed'],
        assignedTo: 'user-2',
        dealValue: 200000,
        createdAt: createBusinessHourTimestamp(14, 10, 0), // 14 days ago at 10:00 AM
        updatedAt: createBusinessHourTimestamp(11, 16, 0),
        lastActivity: 'Finally made contact - scheduled discovery call',
        activities: [
          {
            id: 'a5-1',
            type: 'email_received',
            description: 'Cold email response: "Potentially interested in modernization. Call me."',
            user: 'Thomas Anderson',
            createdAt: createBusinessHourTimestamp(14, 10, 0),
            timestamp: createBusinessHourTimestamp(14, 10, 0),
            isFromLead: true,
            isResponse: false,
            metadata: { source: 'cold_outreach', interest_level: 'low' }
          },
          {
            id: 'a5-2',
            type: 'call',
            description: 'Finally called back after 3 days - connection established',
            user: 'James Miller',
            createdAt: createBusinessHourTimestamp(11, 14, 30), // 3 days later (72+ hours)
            timestamp: createBusinessHourTimestamp(11, 14, 30),
            isFromLead: false,
            isResponse: true,
            metadata: { duration: '15 minutes', delay_reason: 'resource_constraints', outcome: 'discovery_scheduled' }
          },
          {
            id: 'a5-3',
            type: 'email',
            description: 'Sent discovery call agenda and prep materials',
            user: 'James Miller',
            createdAt: createBusinessHourTimestamp(11, 16, 0),
            timestamp: createBusinessHourTimestamp(11, 16, 0),
            isFromLead: false,
            isResponse: false,
            metadata: { type: 'meeting_prep' }
          }
        ]
      },
      
      // WON DEAL SCENARIO (Excellent Conversion - Fast Close)
      {
        id: '6',
        companyName: 'TechFlow Solutions',
        contactName: 'Amanda Foster',
        email: 'amanda@techflow.com',
        phone: '+1 555 753 9514',
        location: 'Seattle, WA',
        source: LEAD_SOURCES.REFERRAL,
        status: LEAD_STATUSES.WON,
        language: 'english',
        productInterest: 'CRM & Sales Platform',
        notes: 'Excellent lead - closed in 7 days! Referred by existing client.',
        tags: ['won-deal', 'fast-close', 'referral', 'enterprise'],
        assignedTo: 'user-1',
        dealValue: 120000,
        createdAt: createBusinessHourTimestamp(45, 9, 0), // 45 days ago
        updatedAt: createBusinessHourTimestamp(38, 16, 30), // Closed 7 days later
        lastActivity: 'Deal closed - contract signed and onboarding scheduled',
        activities: [
          {
            id: 'a6-1',
            type: 'email_received',
            description: 'Referral inquiry: "TechStart Solutions recommended your CRM platform"',
            user: 'Amanda Foster',
            createdAt: createBusinessHourTimestamp(45, 9, 0),
            timestamp: createBusinessHourTimestamp(45, 9, 0),
            isFromLead: true,
            isResponse: false,
            metadata: { source: 'referral', referrer: 'TechStart Solutions', urgent: true }
          },
          {
            id: 'a6-2',
            type: 'call',
            description: 'Immediate response call - strong interest confirmed',
            user: 'Alex Thompson',
            createdAt: createBusinessHourTimestamp(45, 9, 30),
            timestamp: createBusinessHourTimestamp(45, 9, 30),
            isFromLead: false,
            isResponse: true,
            metadata: { duration: '15 minutes', outcome: 'demo_scheduled', urgency: 'high' }
          },
          {
            id: 'a6-3',
            type: 'meeting',
            description: 'Product demo delivered - excellent engagement',
            user: 'Alex Thompson',
            createdAt: createBusinessHourTimestamp(43, 14, 0),
            timestamp: createBusinessHourTimestamp(43, 14, 0),
            isFromLead: false,
            isResponse: false,
            metadata: { duration: '45 minutes', outcome: 'proposal_requested', attendees: 4 }
          },
          {
            id: 'a6-4',
            type: 'email',
            description: 'Proposal sent with competitive pricing',
            user: 'Alex Thompson',
            createdAt: createBusinessHourTimestamp(42, 10, 0),
            timestamp: createBusinessHourTimestamp(42, 10, 0),
            isFromLead: false,
            isResponse: false,
            metadata: { type: 'proposal', value: 120000 }
          },
          {
            id: 'a6-5',
            type: 'call',
            description: 'Deal closed - contract signed!',
            user: 'Alex Thompson',
            createdAt: createBusinessHourTimestamp(38, 16, 30),
            timestamp: createBusinessHourTimestamp(38, 16, 30),
            isFromLead: false,
            isResponse: false,
            metadata: { duration: '20 minutes', outcome: 'closed_won', contract_value: 120000 }
          }
        ]
      },

      // WON DEAL SCENARIO (Good Conversion - Standard Close)
      {
        id: '7',
        companyName: 'DataMart Corp',
        contactName: 'Kevin Rodriguez',
        email: 'kevin@datamart.com',
        phone: '+1 555 892 1547',
        location: 'Miami, FL',
        source: LEAD_SOURCES.WEBSITE,
        status: LEAD_STATUSES.WON,
        language: 'english',
        productInterest: 'Analytics Platform',
        notes: 'Standard sales cycle - good engagement throughout. Closed in 23 days.',
        tags: ['won-deal', 'standard-cycle', 'analytics', 'website'],
        assignedTo: 'user-2',
        dealValue: 89000,
        createdAt: createBusinessHourTimestamp(60, 11, 15),
        updatedAt: createBusinessHourTimestamp(37, 15, 45), // Closed 23 days later
        lastActivity: 'Contract executed - implementation team assigned',
        activities: [
          {
            id: 'a7-1',
            type: 'form_submission',
            description: 'Website form: "Need analytics solution for growing data needs"',
            user: 'Kevin Rodriguez',
            createdAt: createBusinessHourTimestamp(60, 11, 15),
            timestamp: createBusinessHourTimestamp(60, 11, 15),
            isFromLead: true,
            isResponse: false,
            metadata: { source: 'website_form', form_type: 'demo_request' }
          },
          {
            id: 'a7-2',
            type: 'email',
            description: 'Initial outreach with company overview',
            user: 'Maria Rodriguez',
            createdAt: createBusinessHourTimestamp(60, 13, 30),
            timestamp: createBusinessHourTimestamp(60, 13, 30),
            isFromLead: false,
            isResponse: true,
            metadata: { response_time: '2h 15m', attachments: ['company_overview.pdf'] }
          },
          {
            id: 'a7-3',
            type: 'call',
            description: 'Discovery call - needs assessment completed',
            user: 'Maria Rodriguez',
            createdAt: createBusinessHourTimestamp(58, 10, 0),
            timestamp: createBusinessHourTimestamp(58, 10, 0),
            isFromLead: false,
            isResponse: false,
            metadata: { duration: '35 minutes', outcome: 'needs_qualified', follow_up: 'demo_scheduled' }
          },
          {
            id: 'a7-4',
            type: 'meeting',
            description: 'Technical demo and Q&A session',
            user: 'Maria Rodriguez',
            createdAt: createBusinessHourTimestamp(53, 14, 30),
            timestamp: createBusinessHourTimestamp(53, 14, 30),
            isFromLead: false,
            isResponse: false,
            metadata: { duration: '60 minutes', outcome: 'technical_approval', attendees: 6 }
          },
          {
            id: 'a7-5',
            type: 'email',
            description: 'Formal proposal with implementation timeline',
            user: 'Maria Rodriguez',
            createdAt: createBusinessHourTimestamp(50, 9, 30),
            timestamp: createBusinessHourTimestamp(50, 9, 30),
            isFromLead: false,
            isResponse: false,
            metadata: { type: 'formal_proposal', value: 89000, timeline: '8_weeks' }
          },
          {
            id: 'a7-6',
            type: 'negotiation',
            description: 'Price negotiation - final terms agreed',
            user: 'Maria Rodriguez',
            createdAt: createBusinessHourTimestamp(40, 11, 0),
            timestamp: createBusinessHourTimestamp(40, 11, 0),
            isFromLead: false,
            isResponse: false,
            metadata: { outcome: 'terms_agreed', final_value: 89000 }
          },
          {
            id: 'a7-7',
            type: 'contract',
            description: 'Contract signed - deal won!',
            user: 'Maria Rodriguez',
            createdAt: createBusinessHourTimestamp(37, 15, 45),
            timestamp: createBusinessHourTimestamp(37, 15, 45),
            isFromLead: false,
            isResponse: false,
            metadata: { outcome: 'closed_won', contract_value: 89000, implementation_start: '2_weeks' }
          }
        ]
      },

      // LOST DEAL SCENARIO (Price Sensitivity)
      {
        id: '8',
        companyName: 'Budget Solutions Inc',
        contactName: 'Rachel Kim',
        email: 'rachel@budgetsolutions.com',
        phone: '+1 555 147 8523',
        location: 'Cleveland, OH',
        source: LEAD_SOURCES.COLD_CALL,
        status: LEAD_STATUSES.LOST,
        language: 'english',
        productInterest: 'Project Management Software',
        notes: 'Lost to price - went with cheaper competitor. Cycle was 19 days.',
        tags: ['lost-deal', 'price-sensitive', 'competitor', 'small-business'],
        assignedTo: 'user-3',
        dealValue: 25000,
        createdAt: createBusinessHourTimestamp(55, 14, 0),
        updatedAt: createBusinessHourTimestamp(36, 16, 30), // Lost after 19 days
        lastActivity: 'Deal lost - chose competitor on price',
        activities: [
          {
            id: 'a8-1',
            type: 'cold_call',
            description: 'Cold outreach - initial interest in project management tools',
            user: 'David Kim',
            createdAt: createBusinessHourTimestamp(55, 14, 0),
            timestamp: createBusinessHourTimestamp(55, 14, 0),
            isFromLead: false,
            isResponse: false,
            metadata: { duration: '8 minutes', outcome: 'initial_interest', follow_up: 'email' }
          },
          {
            id: 'a8-2',
            type: 'email',
            description: 'Follow-up email with product information',
            user: 'David Kim',
            createdAt: createBusinessHourTimestamp(54, 9, 15),
            timestamp: createBusinessHourTimestamp(54, 9, 15),
            isFromLead: false,
            isResponse: false,
            metadata: { attachments: ['product_brochure.pdf'], type: 'follow_up' }
          },
          {
            id: 'a8-3',
            type: 'email_received',
            description: 'Reply: "Interested but need to see pricing first"',
            user: 'Rachel Kim',
            createdAt: createBusinessHourTimestamp(52, 11, 30),
            timestamp: createBusinessHourTimestamp(52, 11, 30),
            isFromLead: true,
            isResponse: false,
            metadata: { interest_level: 'medium', main_concern: 'pricing' }
          },
          {
            id: 'a8-4',
            type: 'call',
            description: 'Pricing discussion - sticker shock evident',
            user: 'David Kim',
            createdAt: createBusinessHourTimestamp(50, 15, 0),
            timestamp: createBusinessHourTimestamp(50, 15, 0),
            isFromLead: false,
            isResponse: true,
            metadata: { duration: '25 minutes', outcome: 'price_concern', objection: 'budget_constraints' }
          },
          {
            id: 'a8-5',
            type: 'email',
            description: 'Discount proposal - 15% off first year',
            user: 'David Kim',
            createdAt: createBusinessHourTimestamp(48, 10, 30),
            timestamp: createBusinessHourTimestamp(48, 10, 30),
            isFromLead: false,
            isResponse: false,
            metadata: { discount: '15%', discounted_value: 21250, urgency: 'end_of_month' }
          },
          {
            id: 'a8-6',
            type: 'email_received',
            description: 'Competitor comparison - asking for better pricing',
            user: 'Rachel Kim',
            createdAt: createBusinessHourTimestamp(42, 13, 45),
            timestamp: createBusinessHourTimestamp(42, 13, 45),
            isFromLead: true,
            isResponse: false,
            metadata: { competitor: 'mentioned', price_comparison: true, request: 'better_pricing' }
          },
          {
            id: 'a8-7',
            type: 'call',
            description: 'Final attempt - additional discounts offered',
            user: 'David Kim',
            createdAt: createBusinessHourTimestamp(39, 14, 15),
            timestamp: createBusinessHourTimestamp(39, 14, 15),
            isFromLead: false,
            isResponse: true,
            metadata: { duration: '15 minutes', additional_discount: '5%', final_offer: 19000 }
          },
          {
            id: 'a8-8',
            type: 'email_received',
            description: 'Decision: "Going with competitor - better price point"',
            user: 'Rachel Kim',
            createdAt: createBusinessHourTimestamp(36, 16, 30),
            timestamp: createBusinessHourTimestamp(36, 16, 30),
            isFromLead: true,
            isResponse: false,
            metadata: { outcome: 'closed_lost', reason: 'price', competitor_chosen: true }
          }
        ]
      },

      // WON DEAL SCENARIO (Long Cycle - Enterprise)
      {
        id: '9',
        companyName: 'MegaCorp Industries',
        contactName: 'John Harrison',
        email: 'john.harrison@megacorp.com',
        phone: '+1 555 789 0123',
        location: 'Houston, TX',
        source: LEAD_SOURCES.EVENT,
        status: LEAD_STATUSES.WON,
        language: 'english',
        productInterest: 'Enterprise Security Suite',
        notes: 'Complex enterprise deal - 67 days cycle with multiple stakeholders. High value.',
        tags: ['won-deal', 'enterprise', 'long-cycle', 'security', 'high-value'],
        assignedTo: 'user-1',
        dealValue: 450000,
        createdAt: createBusinessHourTimestamp(95, 10, 0),
        updatedAt: createBusinessHourTimestamp(28, 17, 0), // Closed after 67 days
        lastActivity: 'Enterprise contract executed - 3 year agreement',
        activities: [
          {
            id: 'a9-1',
            type: 'event_meeting',
            description: 'Met at CyberSec Conference - initial interest in enterprise security',
            user: 'John Harrison',
            createdAt: createBusinessHourTimestamp(95, 10, 0),
            timestamp: createBusinessHourTimestamp(95, 10, 0),
            isFromLead: true,
            isResponse: false,
            metadata: { event: 'CyberSec Conference 2024', booth_meeting: true, interest_level: 'high' }
          },
          {
            id: 'a9-2',
            type: 'email',
            description: 'Conference follow-up with security assessment offer',
            user: 'Alex Thompson',
            createdAt: createBusinessHourTimestamp(92, 9, 30),
            timestamp: createBusinessHourTimestamp(92, 9, 30),
            isFromLead: false,
            isResponse: true,
            metadata: { response_time: '3 days', offer: 'free_security_assessment' }
          },
          {
            id: 'a9-3',
            type: 'meeting',
            description: 'Security assessment meeting with IT team',
            user: 'Alex Thompson',
            createdAt: createBusinessHourTimestamp(85, 14, 0),
            timestamp: createBusinessHourTimestamp(85, 14, 0),
            isFromLead: false,
            isResponse: false,
            metadata: { duration: '120 minutes', attendees: 8, outcome: 'requirements_gathered' }
          },
          {
            id: 'a9-4',
            type: 'email',
            description: 'Detailed security audit report delivered',
            user: 'Alex Thompson',
            createdAt: createBusinessHourTimestamp(78, 16, 30),
            timestamp: createBusinessHourTimestamp(78, 16, 30),
            isFromLead: false,
            isResponse: false,
            metadata: { report_pages: 25, vulnerabilities_found: 12, recommendations: 15 }
          },
          {
            id: 'a9-5',
            type: 'meeting',
            description: 'Executive presentation to C-suite',
            user: 'Alex Thompson',
            createdAt: createBusinessHourTimestamp(70, 11, 0),
            timestamp: createBusinessHourTimestamp(70, 11, 0),
            isFromLead: false,
            isResponse: false,
            metadata: { duration: '90 minutes', executives: 5, outcome: 'budget_approved', budget: 500000 }
          },
          {
            id: 'a9-6',
            type: 'email',
            description: 'Formal RFP response with comprehensive proposal',
            user: 'Alex Thompson',
            createdAt: createBusinessHourTimestamp(58, 13, 0),
            timestamp: createBusinessHourTimestamp(58, 13, 0),
            isFromLead: false,
            isResponse: false,
            metadata: { proposal_pages: 45, value: 450000, implementation_months: 6 }
          },
          {
            id: 'a9-7',
            type: 'meeting',
            description: 'Technical evaluation with security team',
            user: 'Alex Thompson',
            createdAt: createBusinessHourTimestamp(45, 10, 30),
            timestamp: createBusinessHourTimestamp(45, 10, 30),
            isFromLead: false,
            isResponse: false,
            metadata: { duration: '180 minutes', technical_approval: true, compliance_verified: true }
          },
          {
            id: 'a9-8',
            type: 'negotiation',
            description: 'Contract negotiations with legal and procurement',
            user: 'Alex Thompson',
            createdAt: createBusinessHourTimestamp(35, 14, 15),
            timestamp: createBusinessHourTimestamp(35, 14, 15),
            isFromLead: false,
            isResponse: false,
            metadata: { duration: '5 days', final_value: 450000, payment_terms: 'agreed' }
          },
          {
            id: 'a9-9',
            type: 'contract',
            description: 'Enterprise contract signed - 3 year deal!',
            user: 'Alex Thompson',
            createdAt: createBusinessHourTimestamp(28, 17, 0),
            timestamp: createBusinessHourTimestamp(28, 17, 0),
            isFromLead: false,
            isResponse: false,
            metadata: { outcome: 'closed_won', contract_value: 450000, term: '3_years', arr: 150000 }
          }
        ]
      },

      // LOST DEAL SCENARIO (No Decision/Timing)
      {
        id: '10',
        companyName: 'Stalled Ventures LLC',
        contactName: 'Patricia Wong',
        email: 'patricia@stalledventures.com',
        phone: '+1 555 654 3210',
        location: 'Phoenix, AZ',
        source: LEAD_SOURCES.LINKEDIN,
        status: LEAD_STATUSES.LOST,
        language: 'english',
        productInterest: 'Marketing Automation',
        notes: 'Lost to no decision - timing issues. Cycle was 34 days before going cold.',
        tags: ['lost-deal', 'no-decision', 'timing', 'marketing'],
        assignedTo: 'user-2',
        dealValue: 75000,
        createdAt: createBusinessHourTimestamp(70, 13, 20),
        updatedAt: createBusinessHourTimestamp(36, 15, 0), // Lost after 34 days
        lastActivity: 'Lost to no decision - budget freeze announced',
        activities: [
          {
            id: 'a10-1',
            type: 'linkedin_message',
            description: 'LinkedIn outreach about marketing automation needs',
            user: 'Maria Rodriguez',
            createdAt: createBusinessHourTimestamp(70, 13, 20),
            timestamp: createBusinessHourTimestamp(70, 13, 20),
            isFromLead: false,
            isResponse: false,
            metadata: { platform: 'linkedin', connection_status: 'accepted' }
          },
          {
            id: 'a10-2',
            type: 'message_received',
            description: 'LinkedIn reply: "Interested - we need better marketing automation"',
            user: 'Patricia Wong',
            createdAt: createBusinessHourTimestamp(68, 16, 45),
            timestamp: createBusinessHourTimestamp(68, 16, 45),
            isFromLead: true,
            isResponse: false,
            metadata: { platform: 'linkedin', interest_level: 'medium' }
          },
          {
            id: 'a10-3',
            type: 'call',
            description: 'Discovery call - good fit identified',
            user: 'Maria Rodriguez',
            createdAt: createBusinessHourTimestamp(63, 11, 0),
            timestamp: createBusinessHourTimestamp(63, 11, 0),
            isFromLead: false,
            isResponse: true,
            metadata: { duration: '30 minutes', outcome: 'qualified_opportunity', budget_confirmed: true }
          },
          {
            id: 'a10-4',
            type: 'meeting',
            description: 'Product demo - positive feedback received',
            user: 'Maria Rodriguez',
            createdAt: createBusinessHourTimestamp(58, 14, 30),
            timestamp: createBusinessHourTimestamp(58, 14, 30),
            isFromLead: false,
            isResponse: false,
            metadata: { duration: '45 minutes', feedback: 'positive', next_step: 'proposal' }
          },
          {
            id: 'a10-5',
            type: 'email',
            description: 'Proposal sent with implementation timeline',
            user: 'Maria Rodriguez',
            createdAt: createBusinessHourTimestamp(55, 10, 15),
            timestamp: createBusinessHourTimestamp(55, 10, 15),
            isFromLead: false,
            isResponse: false,
            metadata: { value: 75000, timeline: '6_weeks', response_requested: '1_week' }
          },
          {
            id: 'a10-6',
            type: 'email_received',
            description: 'Delay request: "Need more time to review with team"',
            user: 'Patricia Wong',
            createdAt: createBusinessHourTimestamp(48, 15, 30),
            timestamp: createBusinessHourTimestamp(48, 15, 30),
            isFromLead: true,
            isResponse: false,
            metadata: { delay_reason: 'team_review', new_timeline: '2_weeks' }
          },
          {
            id: 'a10-7',
            type: 'call',
            description: 'Follow-up call - internal delays mentioned',
            user: 'Maria Rodriguez',
            createdAt: createBusinessHourTimestamp(41, 13, 0),
            timestamp: createBusinessHourTimestamp(41, 13, 0),
            isFromLead: false,
            isResponse: true,
            metadata: { duration: '15 minutes', concerns: 'internal_delays', reassurance: 'still_interested' }
          },
          {
            id: 'a10-8',
            type: 'email_received',
            description: 'Bad news: "Budget freeze announced - postponing all projects"',
            user: 'Patricia Wong',
            createdAt: createBusinessHourTimestamp(36, 15, 0),
            timestamp: createBusinessHourTimestamp(36, 15, 0),
            isFromLead: true,
            isResponse: false,
            metadata: { outcome: 'closed_lost', reason: 'budget_freeze', future: 'maybe_next_year' }
          }
        ]
      },

      // WON DEAL SCENARIO (Medium Cycle - Strong ROI)
      {
        id: '11',
        companyName: 'GrowthMax Solutions',
        contactName: 'Lisa Chen',
        email: 'lisa@growthmax.com',
        phone: '+1 555 456 7890',
        location: 'Boston, MA',
        source: LEAD_SOURCES.WEBSITE,
        status: LEAD_STATUSES.WON,
        language: 'english',
        productInterest: 'Sales Analytics Platform',
        notes: 'Great ROI story - closed in 31 days. Strong champion internally.',
        tags: ['won-deal', 'roi-focused', 'champion', 'analytics', 'medium-cycle'],
        assignedTo: 'user-3',
        dealValue: 145000,
        createdAt: createBusinessHourTimestamp(75, 9, 45),
        updatedAt: createBusinessHourTimestamp(44, 14, 20), // Won after 31 days
        lastActivity: 'Contract signed - implementation begins next month',
        activities: [
          {
            id: 'a11-1',
            type: 'form_submission',
            description: 'Website form: "Need sales analytics to improve performance"',
            user: 'Lisa Chen',
            createdAt: createBusinessHourTimestamp(75, 9, 45),
            timestamp: createBusinessHourTimestamp(75, 9, 45),
            isFromLead: true,
            isResponse: false,
            metadata: { source: 'website_form', urgency: 'medium', company_size: 'mid_market' }
          },
          {
            id: 'a11-2',
            type: 'call',
            description: 'Quick response call - strong initial interest',
            user: 'David Kim',
            createdAt: createBusinessHourTimestamp(75, 11, 30),
            timestamp: createBusinessHourTimestamp(75, 11, 30),
            isFromLead: false,
            isResponse: true,
            metadata: { response_time: '1h 45m', duration: '20 minutes', outcome: 'demo_scheduled' }
          },
          {
            id: 'a11-3',
            type: 'meeting',
            description: 'Sales analytics demo - impressed by ROI projections',
            user: 'David Kim',
            createdAt: createBusinessHourTimestamp(70, 15, 0),
            timestamp: createBusinessHourTimestamp(70, 15, 0),
            isFromLead: false,
            isResponse: false,
            metadata: { duration: '50 minutes', roi_projection: '300%', outcome: 'champion_identified' }
          },
          {
            id: 'a11-4',
            type: 'email',
            description: 'ROI analysis and business case document sent',
            user: 'David Kim',
            createdAt: createBusinessHourTimestamp(68, 10, 30),
            timestamp: createBusinessHourTimestamp(68, 10, 30),
            isFromLead: false,
            isResponse: false,
            metadata: { roi_analysis: true, payback_period: '8_months', business_case: true }
          },
          {
            id: 'a11-5',
            type: 'meeting',
            description: 'Stakeholder meeting with sales leadership',
            user: 'David Kim',
            createdAt: createBusinessHourTimestamp(62, 11, 0),
            timestamp: createBusinessHourTimestamp(62, 11, 0),
            isFromLead: false,
            isResponse: false,
            metadata: { duration: '60 minutes', stakeholders: 4, approval: 'verbal_yes' }
          },
          {
            id: 'a11-6',
            type: 'email',
            description: 'Formal proposal with implementation plan',
            user: 'David Kim',
            createdAt: createBusinessHourTimestamp(58, 14, 45),
            timestamp: createBusinessHourTimestamp(58, 14, 45),
            isFromLead: false,
            isResponse: false,
            metadata: { value: 145000, implementation_weeks: 8, training_included: true }
          },
          {
            id: 'a11-7',
            type: 'negotiation',
            description: 'Terms negotiation - training and support included',
            user: 'David Kim',
            createdAt: createBusinessHourTimestamp(50, 13, 15),
            timestamp: createBusinessHourTimestamp(50, 13, 15),
            isFromLead: false,
            isResponse: false,
            metadata: { additional_value: 'training_support', final_terms: 'agreed' }
          },
          {
            id: 'a11-8',
            type: 'contract',
            description: 'Contract executed - strong ROI convinced stakeholders',
            user: 'David Kim',
            createdAt: createBusinessHourTimestamp(44, 14, 20),
            timestamp: createBusinessHourTimestamp(44, 14, 20),
            isFromLead: false,
            isResponse: false,
            metadata: { outcome: 'closed_won', contract_value: 145000, roi_key_factor: true }
          }
        ]
      },

      // NO CONTACT SCENARIO (for comparison)
      {
        id: '12',
        companyName: 'Silent Prospects Inc',
        contactName: 'Amanda Foster',
        email: 'amanda@silentprospects.com',
        phone: '+1 555 753 9514',
        location: 'Denver, CO',
        source: LEAD_SOURCES.WEBSITE,
        status: LEAD_STATUSES.NEW,
        language: 'english',
        productInterest: 'Marketing Automation',
        notes: 'Lead submitted form but no contact attempt made yet',
        tags: ['new-lead', 'no-contact', 'website'],
        assignedTo: null,
        dealValue: 35000,
        createdAt: createBusinessHourTimestamp(1, 16, 30), // 1 day ago
        updatedAt: createBusinessHourTimestamp(1, 16, 30),
        lastActivity: null,
        activities: [] // No activities - demonstrates "no contact" scenario
      },
      
      // MIXED RESPONSE SCENARIO (multiple back-and-forth)
      {
        id: '13',
        companyName: 'Global Retail Chain',
        contactName: 'Patricia Kim',
        email: 'patricia@globalretail.com',
        phone: '+1 555 852 7410',
        location: 'Los Angeles, CA',
        source: LEAD_SOURCES.REFERRAL,
        status: LEAD_STATUSES.IN_PROGRESS,
        language: 'english',
        productInterest: 'Multi-location POS System',
        notes: 'Complex deal with multiple decision makers. Good engagement.',
        tags: ['enterprise', 'multi-location', 'complex'],
        assignedTo: 'user-3',
        dealValue: 350000,
        createdAt: createBusinessHourTimestamp(12, 11, 15),
        updatedAt: createBusinessHourTimestamp(2, 15, 45),
        lastActivity: 'Technical requirements document shared',
        activities: [
          {
            id: 'a13-1',
            type: 'email_received',
            description: 'Referral inquiry about POS system for 50+ locations',
            user: 'Patricia Kim',
            createdAt: createBusinessHourTimestamp(12, 11, 15),
            timestamp: createBusinessHourTimestamp(12, 11, 15),
            isFromLead: true,
            isResponse: false,
            metadata: { locations: 50, referrer: 'RetailTech Inc' }
          },
          {
            id: 'a13-2',
            type: 'call',
            description: 'Quick response call to discuss requirements',
            user: 'Sarah Lee',
            createdAt: createBusinessHourTimestamp(12, 12, 0), // 45 minutes later
            timestamp: createBusinessHourTimestamp(12, 12, 0),
            isFromLead: false,
            isResponse: true,
            metadata: { duration: '20 minutes', outcome: 'requirements_gathering' }
          },
          {
            id: 'a13-3',
            type: 'email_received',
            description: 'Detailed requirements document from client',
            user: 'Patricia Kim',
            createdAt: createBusinessHourTimestamp(11, 9, 30),
            timestamp: createBusinessHourTimestamp(11, 9, 30),
            isFromLead: true,
            isResponse: false,
            metadata: { attachments: ['requirements_v1.docx'], pages: 12 }
          },
          {
            id: 'a13-4',
            type: 'email',
            description: 'Acknowledgment and follow-up questions',
            user: 'Sarah Lee',
            createdAt: createBusinessHourTimestamp(11, 14, 20), // About 5 hours later
            timestamp: createBusinessHourTimestamp(11, 14, 20),
            isFromLead: false,
            isResponse: true,
            metadata: { questions_count: 8 }
          },
          {
            id: 'a13-5',
            type: 'message_received',
            description: 'WhatsApp message with additional clarifications',
            user: 'Patricia Kim',
            createdAt: createBusinessHourTimestamp(10, 16, 45),
            timestamp: createBusinessHourTimestamp(10, 16, 45),
            isFromLead: true,
            isResponse: false,
            metadata: { platform: 'whatsapp', urgent: true }
          },
          {
            id: 'a13-6',
            type: 'call',
            description: 'Conference call with technical team',
            user: 'Sarah Lee',
            createdAt: createBusinessHourTimestamp(9, 10, 0),
            timestamp: createBusinessHourTimestamp(9, 10, 0),
            isFromLead: false,
            isResponse: true,
            metadata: { duration: '45 minutes', attendees: 5, outcome: 'technical_specs_required' }
          },
          {
            id: 'a13-7',
            type: 'email',
            description: 'Technical requirements document shared',
            user: 'Sarah Lee',
            createdAt: createBusinessHourTimestamp(2, 15, 45),
            timestamp: createBusinessHourTimestamp(2, 15, 45),
            isFromLead: false,
            isResponse: false,
            metadata: { attachments: ['technical_specs.pdf'], type: 'technical_document' }
          }
        ]
      }
    ];
    
    // Set the enhanced leads with realistic timing scenarios
    leadStore.setLeads(sampleLeads);
    
    console.log('Sample leads initialized with realistic conversion and sales cycle scenarios:');
    console.log('- Lead 1 (TechStart): Excellent TTFC (15 minutes)');
    console.log('- Lead 2 (GreenEarth): Good TTFC (1h 45m)');
    console.log('- Lead 3 (MidSize): Fair TTFC (5.5 hours)');
    console.log('- Lead 4 (StartUp): Poor TTFC (20 hours)');
    console.log('- Lead 5 (Legacy): Very Poor TTFC (72+ hours)');
    console.log('- Lead 6 (TechFlow): WON - Fast close (7 days) - $120K');
    console.log('- Lead 7 (DataMart): WON - Standard cycle (23 days) - $89K');
    console.log('- Lead 8 (Budget Solutions): LOST - Price sensitive (19 days) - $25K');
    console.log('- Lead 9 (MegaCorp): WON - Long enterprise cycle (67 days) - $450K');
    console.log('- Lead 10 (Stalled Ventures): LOST - No decision (34 days) - $75K');
    console.log('- Lead 11 (GrowthMax): WON - ROI focused (31 days) - $145K');
    console.log('- Lead 12 (Silent): No contact made');
    console.log('- Lead 13 (Global Retail): IN PROGRESS - Complex enterprise deal - $350K');
    
    // Process unassigned leads for routing
    setTimeout(() => {
      sampleLeads.forEach(lead => {
        if (!lead.assignedTo) {
          useRoutingStore.getState().processLeadForRouting(lead);
        }
      });
    }, 100);
  }
  
  return leadStore.leads;
};