import React, { useState, useEffect } from 'react';
import { Users, Building2, Briefcase, ClipboardList, BarChart3, Search, Download, CheckSquare, Square, Trash2, Package } from 'lucide-react';
import ContactList from './components/contacts/ContactList';
import ContactDetail from './components/contacts/ContactDetail';
import CompanyList from './components/companies/CompanyList';
import DealPipeline from './components/deals/DealPipeline';
import ActivityList from './components/activities/ActivityList';
import ProductsServices from './components/products/ProductsServices';
import useCRMStore from './stores/crmStore';
import { exportContactsToCSV, exportCompaniesToCSV, exportDealsToCSV, exportActivitiesToCSV } from './utils/exportUtils';

export default function CRMCoreModule() {
  const [activeTab, setActiveTab] = useState('contacts');
  const [showContactDetail, setShowContactDetail] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  const { 
    selectedContact, 
    getStatistics, 
    addContact, 
    addCompany, 
    addDeal,
    addProduct,
    getFilteredContacts,
    getFilteredCompanies,
    getFilteredDeals,
    getFilteredActivities,
    dealStages,
    deleteContact,
    deleteCompany,
    loadContacts,
    contactsLoading,
    contactsError
  } = useCRMStore();

  const stats = getStatistics();

  // Initialize contacts data
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Load contacts from API or use mock data
        await loadContacts();
      } catch (error) {
        console.error('Failed to load initial contact data:', error);
      }
    };

    const initializeDemoData = () => {
      // Add demo contacts
      const demoContacts = [
        {
          name: 'Sarah Johnson',
          title: 'Procurement Manager',
          company: 'Luxury Hotels Group',
          email: 'sarah.johnson@luxuryhotels.com',
          phone: '+1 (555) 123-4567',
          status: 'active',
          tags: ['VIP', 'Decision Maker']
        },
        {
          name: 'Michael Chen',
          title: 'F&B Director',
          company: 'Grand Resort Chain',
          email: 'michael.chen@grandresort.com',
          phone: '+1 (555) 234-5678',
          status: 'active',
          tags: ['Key Contact']
        },
        {
          name: 'Emma Wilson',
          title: 'Owner',
          company: 'Wilson Tea Boutique',
          email: 'emma@wilsontea.com',
          phone: '+1 (555) 345-6789',
          status: 'active',
          tags: ['Small Business']
        }
      ];

      // Add demo companies
      const demoCompanies = [
        {
          name: 'Luxury Hotels Group',
          industry: 'Hospitality',
          website: 'www.luxuryhotels.com',
          phone: '+1 (555) 100-2000',
          employees: '5000+',
          revenue: 250000000,
          status: 'customer',
          deals: 3
        },
        {
          name: 'Grand Resort Chain',
          industry: 'Hospitality',
          website: 'www.grandresort.com',
          phone: '+1 (555) 200-3000',
          employees: '1000-5000',
          revenue: 150000000,
          status: 'prospect',
          deals: 2
        },
        {
          name: 'Wilson Tea Boutique',
          industry: 'Retail',
          website: 'www.wilsontea.com',
          phone: '+1 (555) 300-4000',
          employees: '1-10',
          revenue: 500000,
          status: 'customer',
          deals: 1
        }
      ];

      // Helper function to create realistic business hour timestamps for deals
      const createDealTimestamp = (daysAgo, hour = 9, minute = 0) => {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        date.setHours(hour, minute, 0, 0);
        return date.toISOString();
      };

      // Add comprehensive demo deals with realistic conversion and cycle examples
      const demoDeals = [
        // CLOSED WON DEALS (for velocity calculation)
        {
          name: 'Enterprise CRM Implementation - TechFlow Solutions',
          company: 'TechFlow Solutions',
          contactId: 'contact-1',
          value: 120000,
          stage: 'closed-won',
          probability: 100,
          closeDate: createDealTimestamp(38),
          assigneeId: 'user-1',
          source: 'referral',
          createdAt: createDealTimestamp(45, 9, 0),
          updatedAt: createDealTimestamp(38, 16, 30),
          notes: 'Fast 7-day close! Strong referral from existing client.',
          tags: ['enterprise', 'fast-close', 'referral']
        },
        {
          name: 'Sales Analytics Platform - DataMart Corp',
          company: 'DataMart Corp', 
          contactId: 'contact-2',
          value: 89000,
          stage: 'closed-won',
          probability: 100,
          closeDate: createDealTimestamp(37),
          assigneeId: 'user-2',
          source: 'website',
          createdAt: createDealTimestamp(60, 11, 15),
          updatedAt: createDealTimestamp(37, 15, 45),
          notes: 'Standard 23-day cycle. Good technical fit.',
          tags: ['analytics', 'website-lead', 'standard-cycle']
        },
        {
          name: 'Enterprise Security Suite - MegaCorp Industries',
          company: 'MegaCorp Industries',
          contactId: 'contact-3', 
          value: 450000,
          stage: 'closed-won',
          probability: 100,
          closeDate: createDealTimestamp(28),
          assigneeId: 'user-1',
          source: 'event',
          createdAt: createDealTimestamp(95, 10, 0),
          updatedAt: createDealTimestamp(28, 17, 0),
          notes: 'Complex 67-day enterprise cycle. Multiple stakeholders.',
          tags: ['enterprise', 'security', 'long-cycle', 'high-value']
        },
        {
          name: 'Sales Performance Analytics - GrowthMax Solutions',
          company: 'GrowthMax Solutions',
          contactId: 'contact-4',
          value: 145000,
          stage: 'closed-won',
          probability: 100,
          closeDate: createDealTimestamp(44),
          assigneeId: 'user-3',
          source: 'website',
          createdAt: createDealTimestamp(75, 9, 45),
          updatedAt: createDealTimestamp(44, 14, 20),
          notes: '31-day cycle. Strong ROI story sealed the deal.',
          tags: ['analytics', 'roi-driven', 'medium-cycle']
        },
        {
          name: 'Marketing Automation Platform - QuickGrow Inc',
          company: 'QuickGrow Inc',
          contactId: 'contact-5',
          value: 67000,
          stage: 'closed-won',
          probability: 100,
          closeDate: createDealTimestamp(15),
          assigneeId: 'user-2',
          source: 'referral',
          createdAt: createDealTimestamp(29, 14, 0),
          updatedAt: createDealTimestamp(15, 11, 30),
          notes: '14-day cycle. Quick decision maker.',
          tags: ['marketing', 'quick-close', 'referral']
        },
        {
          name: 'CRM Integration Services - DataSync Corp',
          company: 'DataSync Corp',
          contactId: 'contact-6',
          value: 85000,
          stage: 'closed-won',
          probability: 100,
          closeDate: createDealTimestamp(8),
          assigneeId: 'user-1',
          source: 'linkedin',
          createdAt: createDealTimestamp(52, 16, 30),
          updatedAt: createDealTimestamp(8, 13, 45),
          notes: '44-day cycle. Required custom integration work.',
          tags: ['integration', 'custom-work', 'linkedin']
        },

        // CLOSED LOST DEALS (for win rate calculation)
        {
          name: 'Project Management Software - Budget Solutions Inc',
          company: 'Budget Solutions Inc',
          contactId: 'contact-7',
          value: 25000,
          stage: 'closed-lost',
          probability: 0,
          closeDate: createDealTimestamp(36),
          assigneeId: 'user-3',
          source: 'cold_call',
          createdAt: createDealTimestamp(55, 14, 0),
          updatedAt: createDealTimestamp(36, 16, 30),
          notes: 'Lost on price - competitor 40% cheaper. 19-day cycle.',
          tags: ['lost-to-price', 'competitor', 'small-business'],
          lostReason: 'price'
        },
        {
          name: 'Marketing Automation Suite - Stalled Ventures LLC',
          company: 'Stalled Ventures LLC',
          contactId: 'contact-8',
          value: 75000,
          stage: 'closed-lost',
          probability: 0,
          closeDate: createDealTimestamp(36),
          assigneeId: 'user-2',
          source: 'linkedin',
          createdAt: createDealTimestamp(70, 13, 20),
          updatedAt: createDealTimestamp(36, 15, 0),
          notes: 'Budget freeze announced. No decision after 34 days.',
          tags: ['no-decision', 'budget-freeze', 'timing'],
          lostReason: 'no_decision'
        },
        {
          name: 'Analytics Platform - CostCutters LLC',
          company: 'CostCutters LLC',
          contactId: 'contact-9',
          value: 42000,
          stage: 'closed-lost',
          probability: 0,
          closeDate: createDealTimestamp(12),
          assigneeId: 'user-3',
          source: 'website',
          createdAt: createDealTimestamp(48, 10, 15),
          updatedAt: createDealTimestamp(12, 14, 30),
          notes: 'Chose in-house solution. 36-day cycle.',
          tags: ['in-house-solution', 'build-vs-buy'],
          lostReason: 'competitor'
        },

        // ACTIVE PIPELINE DEALS (various stages)
        {
          name: 'Multi-location POS System - Global Retail Chain',
          company: 'Global Retail Chain',
          contactId: 'contact-10',
          value: 350000,
          stage: 'proposal',
          probability: 70,
          closeDate: createDealTimestamp(-15), // Expected to close in 15 days
          assigneeId: 'user-3',
          source: 'referral',
          createdAt: createDealTimestamp(12, 11, 15),
          updatedAt: createDealTimestamp(2, 15, 45),
          notes: 'Complex enterprise deal with multiple stakeholders.',
          tags: ['enterprise', 'multi-location', 'high-value']
        },
        {
          name: 'Team Collaboration Platform - StartupFast Inc',
          company: 'StartupFast Inc',
          contactId: 'contact-11',
          value: 28000,
          stage: 'qualification',
          probability: 45,
          closeDate: createDealTimestamp(-10),
          assigneeId: 'user-2',
          source: 'website',
          createdAt: createDealTimestamp(18, 14, 30),
          updatedAt: createDealTimestamp(3, 10, 15),
          notes: 'Young startup - budget concerns but strong need.',
          tags: ['startup', 'budget-conscious', 'collaboration']
        },
        {
          name: 'Security Compliance Suite - FinanceSecure Corp',
          company: 'FinanceSecure Corp',
          contactId: 'contact-12',
          value: 180000,
          stage: 'negotiation',
          probability: 80,
          closeDate: createDealTimestamp(-5),
          assigneeId: 'user-1',
          source: 'event',
          createdAt: createDealTimestamp(35, 9, 0),
          updatedAt: createDealTimestamp(1, 16, 20),
          notes: 'In final negotiations. Compliance requirements driving urgency.',
          tags: ['finance', 'compliance', 'urgent', 'negotiation']
        },
        {
          name: 'Sales Training Program - GrowthCo Industries',
          company: 'GrowthCo Industries',
          contactId: 'contact-13',
          value: 55000,
          stage: 'prospecting',
          probability: 25,
          closeDate: createDealTimestamp(-30),
          assigneeId: 'user-2',
          source: 'cold_call',
          createdAt: createDealTimestamp(8, 11, 45),
          updatedAt: createDealTimestamp(1, 9, 30),
          notes: 'Early stage. Still building relationship.',
          tags: ['training', 'early-stage', 'relationship-building']
        },
        {
          name: 'Customer Analytics Platform - RetailMax Corp',
          company: 'RetailMax Corp',
          contactId: 'contact-14',
          value: 125000,
          stage: 'proposal',
          probability: 65,
          closeDate: createDealTimestamp(-8),
          assigneeId: 'user-3',
          source: 'referral',
          createdAt: createDealTimestamp(22, 15, 0),
          updatedAt: createDealTimestamp(2, 11, 45),
          notes: 'Strong technical fit. Waiting on budget approval.',
          tags: ['analytics', 'retail', 'budget-approval']
        },
        {
          name: 'Integration Services - ConnectAll Systems',
          company: 'ConnectAll Systems',
          contactId: 'contact-15',
          value: 95000,
          stage: 'qualification',
          probability: 50,
          closeDate: createDealTimestamp(-20),
          assigneeId: 'user-1',
          source: 'website',
          createdAt: createDealTimestamp(15, 13, 15),
          updatedAt: createDealTimestamp(3, 14, 0),
          notes: 'Complex integration requirements. Technical evaluation in progress.',
          tags: ['integration', 'technical-complex', 'evaluation']
        }
      ];

      // Add demo SaaS products with subscription plans
      const demoProducts = [
        {
          name: 'SalesForce Pro',
          sku: 'SF-PRO-001',
          description: 'Complete CRM solution with advanced sales automation, lead management, and customer insights. Perfect for growing sales teams.',
          category: 'crm-sales',
          price: 79.00, // Starting price
          status: 'active',
          features: ['Lead Management', 'Sales Pipeline', 'Email Integration', 'Reporting Dashboard', 'Mobile App'],
          subscriptionPlans: [
            {
              id: 'starter-monthly',
              name: 'Starter',
              price: 29,
              billingCycle: 'monthly',
              userLimit: 5,
              features: ['Basic CRM', 'Email Integration', 'Mobile App', '1GB Storage']
            },
            {
              id: 'starter-annual',
              name: 'Starter',
              price: 290,
              billingCycle: 'annual',
              userLimit: 5,
              monthlyEquivalent: 24.17,
              discount: '17% off',
              features: ['Basic CRM', 'Email Integration', 'Mobile App', '1GB Storage']
            },
            {
              id: 'professional-monthly',
              name: 'Professional',
              price: 79,
              billingCycle: 'monthly',
              userLimit: 25,
              features: ['Advanced CRM', 'Sales Automation', 'Custom Reports', '10GB Storage', 'API Access']
            },
            {
              id: 'professional-annual',
              name: 'Professional',
              price: 790,
              billingCycle: 'annual',
              userLimit: 25,
              monthlyEquivalent: 65.83,
              discount: '17% off',
              features: ['Advanced CRM', 'Sales Automation', 'Custom Reports', '10GB Storage', 'API Access']
            },
            {
              id: 'enterprise-monthly',
              name: 'Enterprise',
              price: 199,
              billingCycle: 'monthly',
              userLimit: 'unlimited',
              features: ['Full CRM Suite', 'Advanced Analytics', 'Custom Integrations', 'Unlimited Storage', 'Priority Support']
            },
            {
              id: 'enterprise-annual',
              name: 'Enterprise',
              price: 1990,
              billingCycle: 'annual',
              userLimit: 'unlimited',
              monthlyEquivalent: 165.83,
              discount: '17% off',
              features: ['Full CRM Suite', 'Advanced Analytics', 'Custom Integrations', 'Unlimited Storage', 'Priority Support']
            }
          ]
        },
        {
          name: 'MarketingHub 360',
          sku: 'MH-360-002',
          description: 'All-in-one marketing automation platform with email campaigns, social media management, and lead nurturing capabilities.',
          category: 'marketing',
          price: 99.00,
          status: 'active',
          features: ['Email Marketing', 'Social Media Management', 'Landing Pages', 'A/B Testing', 'Lead Scoring'],
          subscriptionPlans: [
            {
              id: 'basic-monthly',
              name: 'Basic',
              price: 49,
              billingCycle: 'monthly',
              userLimit: 3,
              features: ['Email Campaigns', 'Basic Templates', '1,000 Contacts', 'Basic Analytics']
            },
            {
              id: 'basic-annual',
              name: 'Basic',
              price: 490,
              billingCycle: 'annual',
              userLimit: 3,
              monthlyEquivalent: 40.83,
              discount: '17% off',
              features: ['Email Campaigns', 'Basic Templates', '1,000 Contacts', 'Basic Analytics']
            },
            {
              id: 'growth-monthly',
              name: 'Growth',
              price: 99,
              billingCycle: 'monthly',
              userLimit: 10,
              features: ['Advanced Automation', 'A/B Testing', '10,000 Contacts', 'Social Media Tools', 'Landing Pages']
            },
            {
              id: 'growth-annual',
              name: 'Growth',
              price: 990,
              billingCycle: 'annual',
              userLimit: 10,
              monthlyEquivalent: 82.50,
              discount: '17% off',
              features: ['Advanced Automation', 'A/B Testing', '10,000 Contacts', 'Social Media Tools', 'Landing Pages']
            },
            {
              id: 'scale-monthly',
              name: 'Scale',
              price: 299,
              billingCycle: 'monthly',
              userLimit: 'unlimited',
              features: ['Full Marketing Suite', 'Advanced Segmentation', 'Unlimited Contacts', 'Custom Integrations', 'Dedicated Support']
            },
            {
              id: 'scale-annual',
              name: 'Scale',
              price: 2990,
              billingCycle: 'annual',
              userLimit: 'unlimited',
              monthlyEquivalent: 249.17,
              discount: '17% off',
              features: ['Full Marketing Suite', 'Advanced Segmentation', 'Unlimited Contacts', 'Custom Integrations', 'Dedicated Support']
            }
          ]
        },
        {
          name: 'DataInsight Analytics',
          sku: 'DIA-003',
          description: 'Business intelligence platform with real-time dashboards, predictive analytics, and custom reporting for data-driven decisions.',
          category: 'analytics',
          price: 149.00,
          status: 'active',
          features: ['Real-time Dashboards', 'Predictive Analytics', 'Custom Reports', 'Data Visualization', 'API Integrations'],
          subscriptionPlans: [
            {
              id: 'essential-monthly',
              name: 'Essential',
              price: 79,
              billingCycle: 'monthly',
              userLimit: 5,
              features: ['Basic Dashboards', 'Standard Reports', '5 Data Sources', '100GB Data Storage']
            },
            {
              id: 'essential-annual',
              name: 'Essential',
              price: 790,
              billingCycle: 'annual',
              userLimit: 5,
              monthlyEquivalent: 65.83,
              discount: '17% off',
              features: ['Basic Dashboards', 'Standard Reports', '5 Data Sources', '100GB Data Storage']
            },
            {
              id: 'professional-monthly',
              name: 'Professional',
              price: 149,
              billingCycle: 'monthly',
              userLimit: 15,
              features: ['Advanced Analytics', 'Custom Dashboards', '20 Data Sources', '500GB Storage', 'Predictive Models']
            },
            {
              id: 'professional-annual',
              name: 'Professional',
              price: 1490,
              billingCycle: 'annual',
              userLimit: 15,
              monthlyEquivalent: 124.17,
              discount: '17% off',
              features: ['Advanced Analytics', 'Custom Dashboards', '20 Data Sources', '500GB Storage', 'Predictive Models']
            },
            {
              id: 'enterprise-monthly',
              name: 'Enterprise',
              price: 399,
              billingCycle: 'monthly',
              userLimit: 'unlimited',
              features: ['Full BI Suite', 'AI-Powered Insights', 'Unlimited Data Sources', 'Unlimited Storage', 'White-label Options']
            },
            {
              id: 'enterprise-annual',
              name: 'Enterprise',
              price: 3990,
              billingCycle: 'annual',
              userLimit: 'unlimited',
              monthlyEquivalent: 332.50,
              discount: '17% off',
              features: ['Full BI Suite', 'AI-Powered Insights', 'Unlimited Data Sources', 'Unlimited Storage', 'White-label Options']
            }
          ]
        },
        {
          name: 'TeamSync Collaboration',
          sku: 'TS-COL-004',
          description: 'Project management and team collaboration platform with task tracking, file sharing, and team communication tools.',
          category: 'productivity',
          price: 59.00,
          status: 'active',
          features: ['Project Management', 'Task Tracking', 'File Sharing', 'Team Chat', 'Time Tracking'],
          subscriptionPlans: [
            {
              id: 'team-monthly',
              name: 'Team',
              price: 29,
              billingCycle: 'monthly',
              userLimit: 10,
              features: ['Basic Project Management', 'Task Boards', 'File Storage (10GB)', 'Team Chat']
            },
            {
              id: 'team-annual',
              name: 'Team',
              price: 290,
              billingCycle: 'annual',
              userLimit: 10,
              monthlyEquivalent: 24.17,
              discount: '17% off',
              features: ['Basic Project Management', 'Task Boards', 'File Storage (10GB)', 'Team Chat']
            },
            {
              id: 'business-monthly',
              name: 'Business',
              price: 59,
              billingCycle: 'monthly',
              userLimit: 50,
              features: ['Advanced Project Tools', 'Time Tracking', 'Custom Fields', 'File Storage (100GB)', 'Reporting']
            },
            {
              id: 'business-annual',
              name: 'Business',
              price: 590,
              billingCycle: 'annual',
              userLimit: 50,
              monthlyEquivalent: 49.17,
              discount: '17% off',
              features: ['Advanced Project Tools', 'Time Tracking', 'Custom Fields', 'File Storage (100GB)', 'Reporting']
            },
            {
              id: 'enterprise-monthly',
              name: 'Enterprise',
              price: 129,
              billingCycle: 'monthly',
              userLimit: 'unlimited',
              features: ['Full Platform Access', 'Advanced Reporting', 'Custom Integrations', 'Unlimited Storage', 'Priority Support']
            },
            {
              id: 'enterprise-annual',
              name: 'Enterprise',
              price: 1290,
              billingCycle: 'annual',
              userLimit: 'unlimited',
              monthlyEquivalent: 107.50,
              discount: '17% off',
              features: ['Full Platform Access', 'Advanced Reporting', 'Custom Integrations', 'Unlimited Storage', 'Priority Support']
            }
          ]
        },
        {
          name: 'SecureCloud Suite',
          sku: 'SCS-005',
          description: 'Comprehensive cybersecurity platform with threat detection, data encryption, and compliance management for enterprises.',
          category: 'security',
          price: 199.00,
          status: 'active',
          features: ['Threat Detection', 'Data Encryption', 'Compliance Tools', 'Security Monitoring', '24/7 Support'],
          subscriptionPlans: [
            {
              id: 'standard-monthly',
              name: 'Standard',
              price: 99,
              billingCycle: 'monthly',
              userLimit: 25,
              features: ['Basic Security Monitoring', 'Standard Encryption', 'Compliance Reports', 'Email Support']
            },
            {
              id: 'standard-annual',
              name: 'Standard',
              price: 990,
              billingCycle: 'annual',
              userLimit: 25,
              monthlyEquivalent: 82.50,
              discount: '17% off',
              features: ['Basic Security Monitoring', 'Standard Encryption', 'Compliance Reports', 'Email Support']
            },
            {
              id: 'advanced-monthly',
              name: 'Advanced',
              price: 199,
              billingCycle: 'monthly',
              userLimit: 100,
              features: ['Advanced Threat Detection', 'Multi-layer Encryption', 'Real-time Monitoring', 'Incident Response', 'Phone Support']
            },
            {
              id: 'advanced-annual',
              name: 'Advanced',
              price: 1990,
              billingCycle: 'annual',
              userLimit: 100,
              monthlyEquivalent: 165.83,
              discount: '17% off',
              features: ['Advanced Threat Detection', 'Multi-layer Encryption', 'Real-time Monitoring', 'Incident Response', 'Phone Support']
            },
            {
              id: 'premium-monthly',
              name: 'Premium',
              price: 449,
              billingCycle: 'monthly',
              userLimit: 'unlimited',
              features: ['AI-Powered Security', 'Zero Trust Architecture', '24/7 SOC Support', 'Custom Policies', 'Dedicated CSM']
            },
            {
              id: 'premium-annual',
              name: 'Premium',
              price: 4490,
              billingCycle: 'annual',
              userLimit: 'unlimited',
              monthlyEquivalent: 374.17,
              discount: '17% off',
              features: ['AI-Powered Security', 'Zero Trust Architecture', '24/7 SOC Support', 'Custom Policies', 'Dedicated CSM']
            }
          ]
        },
        {
          name: 'VideoConnect Enterprise',
          sku: 'VCE-006',
          description: 'Professional video conferencing and unified communications platform with HD video, screen sharing, and recording.',
          category: 'communication',
          price: 39.00,
          status: 'active',
          features: ['HD Video Calls', 'Screen Sharing', 'Recording', 'Chat Integration', 'Mobile Apps'],
          subscriptionPlans: [
            {
              id: 'basic',
              name: 'Basic',
              price: 15,
              billingCycle: 'monthly',
              userLimit: 10,
              features: ['HD Video (up to 25 participants)', 'Screen Sharing', 'Chat', 'Mobile Apps']
            },
            {
              id: 'pro',
              name: 'Pro',
              price: 39,
              billingCycle: 'monthly',
              userLimit: 50,
              features: ['HD Video (up to 100 participants)', 'Recording', 'Breakout Rooms', 'Admin Controls', 'Integrations']
            },
            {
              id: 'enterprise',
              name: 'Enterprise',
              price: 89,
              billingCycle: 'monthly',
              userLimit: 'unlimited',
              features: ['HD Video (up to 500 participants)', 'Cloud Recording', 'Advanced Security', 'SSO', 'Dedicated Support']
            }
          ]
        },
        {
          name: 'IntegrationFlow Pro',
          sku: 'IF-PRO-007',
          description: 'API integration and workflow automation platform that connects your favorite apps and automates business processes.',
          category: 'integration',
          price: 89.00,
          status: 'active',
          features: ['API Integrations', 'Workflow Automation', 'Data Sync', 'Custom Connectors', 'Real-time Monitoring'],
          subscriptionPlans: [
            {
              id: 'starter',
              name: 'Starter',
              price: 29,
              billingCycle: 'monthly',
              userLimit: 2,
              features: ['100 Tasks/month', 'Basic Integrations', '5 Workflows', 'Email Support']
            },
            {
              id: 'professional',
              name: 'Professional',
              price: 89,
              billingCycle: 'monthly',
              userLimit: 5,
              features: ['10,000 Tasks/month', 'Premium Integrations', 'Unlimited Workflows', 'Advanced Triggers', 'Priority Support']
            },
            {
              id: 'enterprise',
              name: 'Enterprise',
              price: 299,
              billingCycle: 'monthly',
              userLimit: 'unlimited',
              features: ['Unlimited Tasks', 'Custom Connectors', 'Advanced Logic', 'SLA Guarantees', 'Dedicated Support']
            }
          ]
        },
        {
          name: 'Digital Transformation advisory',
          sku: 'DTA-008',
          description: 'Strategic consulting services for digital transformation, technology roadmapping, and organizational change management.',
          category: 'consulting',
          price: 2500.00,
          status: 'active',
          features: ['Strategic Planning', 'Technology Assessment', 'Change Management', 'Training Programs', 'Ongoing Support'],
          subscriptionPlans: [
            {
              id: 'assessment',
              name: 'Assessment Package',
              price: 2500,
              billingCycle: 'one-time',
              userLimit: 'unlimited',
              features: ['Technology Audit', 'Strategic Roadmap', 'Implementation Plan', '30-day Support']
            },
            {
              id: 'implementation',
              name: 'Implementation Support',
              price: 7500,
              billingCycle: 'monthly',
              userLimit: 'unlimited',
              features: ['Project Management', 'Technical Implementation', 'Change Management', 'Training', 'Weekly Reviews']
            },
            {
              id: 'ongoing',
              name: 'Ongoing Advisory',
              price: 12500,
              billingCycle: 'monthly',
              userLimit: 'unlimited',
              features: ['Strategic Advisory', 'Technology Updates', 'Performance Optimization', 'Dedicated Consultant', '24/7 Support']
            }
          ]
        },
        
        // Additional Products Category
        {
          name: 'Professional Web Hosting',
          sku: 'PWH-001',
          description: 'High-performance web hosting with SSD storage, 99.9% uptime guarantee, and 24/7 technical support. Perfect for business websites and e-commerce stores.',
          category: 'additional-products',
          price: 12.99,
          status: 'active',
          features: ['50GB SSD Storage', '99.9% Uptime', 'Free SSL Certificate', '24/7 Support', 'Daily Backups', 'CDN Integration'],
          subscriptionPlans: [
            {
              id: 'basic-monthly',
              name: 'Basic',
              price: 12.99,
              billingCycle: 'monthly',
              features: ['50GB SSD Storage', '1 Website', 'Free SSL', 'Basic Support']
            },
            {
              id: 'business-monthly',
              name: 'Business',
              price: 24.99,
              billingCycle: 'monthly',
              features: ['200GB SSD Storage', '10 Websites', 'Free SSL', 'Priority Support', 'Daily Backups']
            },
            {
              id: 'enterprise-monthly',
              name: 'Enterprise',
              price: 49.99,
              billingCycle: 'monthly',
              features: ['500GB SSD Storage', 'Unlimited Websites', 'Free SSL', '24/7 Phone Support', 'CDN', 'Advanced Security']
            }
          ]
        },
        {
          name: 'Premium Logo Design',
          sku: 'PLD-002',
          description: 'Professional logo design service with multiple concepts, unlimited revisions, and complete brand package including business cards and letterhead designs.',
          category: 'additional-products',
          price: 299.00,
          status: 'active',
          features: ['3 Logo Concepts', 'Unlimited Revisions', 'Vector Files', 'Business Card Design', 'Letterhead Design', '30-Day Support'],
          subscriptionPlans: [
            {
              id: 'basic-package',
              name: 'Basic Package',
              price: 299,
              billingCycle: 'one-time',
              features: ['3 Logo Concepts', '3 Revisions', 'PNG & JPG Files', 'Basic Support']
            },
            {
              id: 'premium-package',
              name: 'Premium Package',
              price: 499,
              billingCycle: 'one-time',
              features: ['5 Logo Concepts', 'Unlimited Revisions', 'All File Formats', 'Business Card Design', 'Letterhead Design', 'Priority Support']
            },
            {
              id: 'complete-brand',
              name: 'Complete Brand Package',
              price: 799,
              billingCycle: 'one-time',
              features: ['10 Logo Concepts', 'Unlimited Revisions', 'Complete Brand Guidelines', 'Business Stationery', 'Social Media Kit', 'Dedicated Designer']
            }
          ]
        },
        {
          name: 'Domain Registration & Management',
          sku: 'DRM-003',
          description: 'Complete domain registration and management service with DNS management, domain forwarding, and privacy protection included.',
          category: 'additional-products',
          price: 14.99,
          status: 'active',
          features: ['Domain Registration', 'DNS Management', 'Domain Forwarding', 'Privacy Protection', 'Email Forwarding', 'Auto-Renewal'],
          subscriptionPlans: [
            {
              id: 'standard-annual',
              name: 'Standard',
              price: 14.99,
              billingCycle: 'annual',
              features: ['1 Domain Registration', 'Basic DNS', 'Email Forwarding', 'Standard Support']
            },
            {
              id: 'premium-annual',
              name: 'Premium',
              price: 24.99,
              billingCycle: 'annual',
              features: ['1 Domain Registration', 'Advanced DNS', 'Privacy Protection', 'Domain Forwarding', 'Priority Support']
            }
          ]
        },
        {
          name: 'Website Security Suite',
          sku: 'WSS-004',
          description: 'Comprehensive website security solution with malware scanning, firewall protection, SSL certificates, and daily security monitoring.',
          category: 'additional-products',
          price: 19.99,
          status: 'active',
          features: ['Malware Scanning', 'Firewall Protection', 'SSL Certificate', 'Daily Monitoring', 'Automatic Cleanup', 'Security Reports'],
          subscriptionPlans: [
            {
              id: 'essential-monthly',
              name: 'Essential',
              price: 19.99,
              billingCycle: 'monthly',
              features: ['Basic Malware Scan', 'SSL Certificate', 'Weekly Reports', 'Email Support']
            },
            {
              id: 'advanced-monthly',
              name: 'Advanced',
              price: 39.99,
              billingCycle: 'monthly',
              features: ['Advanced Malware Protection', 'Firewall', 'Daily Monitoring', 'Automatic Cleanup', 'Priority Support']
            }
          ]
        },
        {
          name: 'Professional Email Service',
          sku: 'PES-005',
          description: 'Business-grade email hosting with custom domain, 25GB storage per mailbox, mobile sync, and advanced spam protection.',
          category: 'additional-products',
          price: 6.99,
          status: 'active',
          features: ['Custom Domain Email', '25GB Storage', 'Mobile Sync', 'Spam Protection', 'Calendar Integration', 'Webmail Access'],
          subscriptionPlans: [
            {
              id: 'starter-monthly',
              name: 'Starter',
              price: 6.99,
              billingCycle: 'monthly',
              features: ['5 Email Accounts', '25GB per Mailbox', 'Webmail Access', 'Basic Support']
            },
            {
              id: 'business-monthly',
              name: 'Business',
              price: 12.99,
              billingCycle: 'monthly',
              features: ['25 Email Accounts', '50GB per Mailbox', 'Mobile Sync', 'Calendar', 'Priority Support']
            }
          ]
        },
        {
          name: 'Content Writing Service',
          sku: 'CWS-006',
          description: 'Professional content writing service for websites, blogs, and marketing materials. SEO-optimized content written by experienced copywriters.',
          category: 'additional-products',
          price: 89.00,
          status: 'active',
          features: ['SEO-Optimized Content', 'Professional Writers', 'Unlimited Revisions', 'Quick Turnaround', 'Content Strategy', 'Plagiarism-Free'],
          subscriptionPlans: [
            {
              id: 'basic-package',
              name: 'Basic Package',
              price: 89,
              billingCycle: 'per-project',
              features: ['1,000 Words', '1 Revision', 'SEO Basic', '5-Day Delivery']
            },
            {
              id: 'premium-package',
              name: 'Premium Package',
              price: 199,
              billingCycle: 'per-project',
              features: ['2,500 Words', 'Unlimited Revisions', 'Advanced SEO', '3-Day Delivery', 'Content Strategy']
            },
            {
              id: 'monthly-retainer',
              name: 'Monthly Retainer',
              price: 499,
              billingCycle: 'monthly',
              features: ['10,000 Words/month', 'Unlimited Revisions', 'Content Calendar', 'Dedicated Writer', 'Priority Support']
            }
          ]
        },
        {
          name: 'Social Media Management',
          sku: 'SMM-007',
          description: 'Complete social media management service including content creation, posting schedule, engagement management, and monthly analytics reports.',
          category: 'additional-products',
          price: 299.00,
          status: 'active',
          features: ['Content Creation', 'Daily Posting', 'Engagement Management', 'Analytics Reports', 'Hashtag Research', 'Competitor Analysis'],
          subscriptionPlans: [
            {
              id: 'starter-monthly',
              name: 'Starter',
              price: 299,
              billingCycle: 'monthly',
              features: ['2 Social Platforms', '15 Posts/month', 'Basic Analytics', 'Email Support']
            },
            {
              id: 'growth-monthly',
              name: 'Growth',
              price: 599,
              billingCycle: 'monthly',
              features: ['4 Social Platforms', '30 Posts/month', 'Engagement Management', 'Detailed Analytics', 'Priority Support']
            },
            {
              id: 'enterprise-monthly',
              name: 'Enterprise',
              price: 999,
              billingCycle: 'monthly',
              features: ['6 Social Platforms', '60 Posts/month', 'Full Management', 'Custom Reports', 'Dedicated Manager']
            }
          ]
        },
        {
          name: 'SEO Optimization Service',
          sku: 'SOS-008',
          description: 'Comprehensive SEO service including keyword research, on-page optimization, technical SEO, and monthly performance reports to boost search rankings.',
          category: 'additional-products',
          price: 399.00,
          status: 'active',
          features: ['Keyword Research', 'On-Page Optimization', 'Technical SEO', 'Link Building', 'Monthly Reports', 'Competitor Analysis'],
          subscriptionPlans: [
            {
              id: 'local-monthly',
              name: 'Local SEO',
              price: 399,
              billingCycle: 'monthly',
              features: ['Local Keywords', 'Google My Business', 'Local Citations', 'Monthly Reports']
            },
            {
              id: 'national-monthly',
              name: 'National SEO',
              price: 799,
              billingCycle: 'monthly',
              features: ['National Keywords', 'Advanced On-Page', 'Link Building', 'Technical SEO', 'Bi-weekly Reports']
            },
            {
              id: 'enterprise-monthly',
              name: 'Enterprise SEO',
              price: 1499,
              billingCycle: 'monthly',
              features: ['Large-Scale SEO', 'Custom Strategy', 'Dedicated Team', 'Weekly Reports', 'Priority Support']
            }
          ]
        }
      ];

      // Check if data already exists
      const existingStats = getStatistics();
      if (existingStats.totalContacts === 0) {
        demoContacts.forEach(contact => addContact(contact));
        demoCompanies.forEach(company => addCompany(company));
        demoDeals.forEach(deal => addDeal(deal));
      }
      
      // Always check and add products separately
      if (existingStats.totalProducts === 0) {
        console.log('Initializing demo products...', demoProducts.length);
        demoProducts.forEach(product => addProduct(product));
        console.log('Demo products added successfully');
      } else {
        console.log('Products already exist:', existingStats.totalProducts);
      }
    };

    // Initialize data on mount
    initializeData();
    
    // Also initialize demo data for other entities (companies, deals, etc.)
    initializeDemoData();
  }, [loadContacts]);

  useEffect(() => {
    if (selectedContact) {
      setShowContactDetail(true);
    }
  }, [selectedContact]);

  const handleExport = () => {
    switch (activeTab) {
      case 'contacts':
        exportContactsToCSV(getFilteredContacts());
        break;
      case 'companies':
        exportCompaniesToCSV(getFilteredCompanies());
        break;
      case 'deals':
        exportDealsToCSV(getFilteredDeals(), dealStages);
        break;
      case 'activities':
        exportActivitiesToCSV(getFilteredActivities());
        break;
    }
    setShowExportMenu(false);
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) {
      alert('No items selected');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
      selectedItems.forEach(id => {
        if (activeTab === 'contacts') {
          deleteContact(id);
        } else if (activeTab === 'companies') {
          deleteCompany(id);
        }
      });
      setSelectedItems([]);
      setSelectAll(false);
    }
  };

  const tabs = [
    { id: 'contacts', label: 'Contacts', icon: Users, count: stats.totalContacts },
    { id: 'companies', label: 'Companies', icon: Building2, count: stats.totalCompanies },
    { id: 'deals', label: 'Deals', icon: Briefcase, count: stats.totalDeals },
    { id: 'products', label: 'Products & Services', icon: Package, count: stats.totalProducts || 0 },
    { id: 'activities', label: 'Activities', icon: ClipboardList, count: stats.totalActivities }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'contacts':
        return <ContactList />;
      case 'companies':
        return <CompanyList />;
      case 'deals':
        return <DealPipeline />;
      case 'products':
        return <ProductsServices />;
      case 'activities':
        return <ActivityList />;
      default:
        return <ContactList />;
    }
  };

  return (
    <div className="flex-1 p-6 bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CRM Core</h1>
          <p className="text-gray-600">Manage your contacts, companies, deals, and activities</p>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalDealValue.toLocaleString()}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-teal-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Won Deals</p>
                <p className="text-2xl font-bold text-green-600">{stats.wonDeals}</p>
              </div>
              <Briefcase className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Contacts</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalContacts}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Tasks</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingActivities}</p>
              </div>
              <ClipboardList className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between px-4 py-2">
              <nav className="flex -mb-px">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setSelectedItems([]);
                        setSelectAll(false);
                      }}
                      className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-teal-600 text-teal-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                      {tab.count > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
              
              <div className="flex items-center gap-2">
                {(activeTab === 'contacts' || activeTab === 'companies') && selectedItems.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete ({selectedItems.length})
                  </button>
                )}
                
                <button
                  onClick={handleExport}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm">
          {renderContent()}
        </div>

        {/* Contact Detail Modal */}
        {showContactDetail && (
          <ContactDetail onClose={() => setShowContactDetail(false)} />
        )}
      </div>
    </div>
  );
}