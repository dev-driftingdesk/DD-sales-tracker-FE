import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateSalesVelocity, calculateAverageSalesCycle } from '../../../utils/conversionMetricsUtils';
import { calculatePipelineValue, calculateWinRate } from '../../../utils/pipelineMetricsUtils';
import { calculateDealClosureTime } from '../../../utils/dealActivityMetricsUtils';
import { calculateMonthlyRevenuePerRep } from '../../../utils/revenueEngagementMetricsUtils';

const useCRMStore = create(
  persist(
    (set, get) => ({
      // Contacts state
      contacts: [],
      selectedContact: null,
      contactFilters: {
        search: '',
        tags: [],
        companies: [],
        status: 'all'
      },

      // Companies state
      companies: [],
      selectedCompany: null,
      companyFilters: {
        search: '',
        industry: 'all',
        size: 'all',
        status: 'all'
      },

      // Deals state with realistic performance data
      deals: [
        {
          id: 'deal-1',
          title: 'Zayed Traders - Premium Tea Supply',
          companyName: 'Zayed Traders',
          contactName: 'Ahmed Zayed',
          value: 50000,
          stage: 'closed-won',
          assigneeId: 'user-1', // Sara
          source: 'facebook',
          probability: 100,
          expectedCloseDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          actualCloseDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Quarterly supply contract closed successfully',
          tags: ['wholesale', 'middle-east', 'quarterly-contract'],
          leadSource: 'lead-1'
        },
        {
          id: 'deal-2',
          title: 'UK Tea Imports - Distribution Rights',
          companyName: 'UK Tea Imports',
          contactName: 'John Smith',
          value: 75000,
          stage: 'proposal',
          assigneeId: 'user-2', // Maria
          source: 'website',
          probability: 75,
          expectedCloseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Exclusive distribution rights under negotiation',
          tags: ['distributor', 'uk-market', 'exclusive'],
          leadSource: 'lead-2'
        },
        {
          id: 'deal-3',
          title: 'GulfMart - Supermarket Chain Partnership',
          companyName: 'GulfMart Supermarkets',
          contactName: 'Fatima Al-Hassan',
          value: 100000,
          stage: 'closed-won',
          assigneeId: 'user-3', // Amir
          source: 'event',
          probability: 100,
          expectedCloseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          actualCloseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Major supermarket chain deal - full product range',
          tags: ['supermarket', 'saudi', 'full-range'],
          leadSource: 'lead-3'
        },
        {
          id: 'deal-4',
          title: 'European Tea House - Organic Collection',
          companyName: 'European Tea House',
          contactName: 'Hans Mueller',
          value: 35000,
          stage: 'closed-won',
          assigneeId: 'user-2', // Maria
          source: 'website',
          probability: 100,
          expectedCloseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          actualCloseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Fast turnaround - excellent organic collection deal',
          tags: ['organic', 'europe', 'quick-win'],
          leadSource: 'lead-11'
        },
        {
          id: 'deal-5',
          title: 'Nordic Premium Foods - Luxury Tea',
          companyName: 'Nordic Premium Foods',
          contactName: 'Lars Larsson',
          value: 60000,
          stage: 'closed-won',
          assigneeId: 'user-2', // Maria
          source: 'email',
          probability: 100,
          expectedCloseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          actualCloseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Premium restaurant chain partnership',
          tags: ['restaurant', 'luxury', 'nordic'],
          leadSource: 'lead-12'
        },
        {
          id: 'deal-6',
          title: 'Swiss Tea Boutique - Artisan Collection',
          companyName: 'Swiss Tea Boutique',
          contactName: 'Henri Müller',
          value: 25000,
          stage: 'closed-won',
          assigneeId: 'user-2', // Maria
          source: 'website',
          probability: 100,
          expectedCloseDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          actualCloseDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Boutique tea shop premium supplier agreement',
          tags: ['boutique', 'premium', 'switzerland'],
          leadSource: 'lead-13'
        },
        {
          id: 'deal-7',
          title: 'Ceylon Tea Co - Premium Ceylon Tea',
          companyName: 'Ceylon Tea Co',
          contactName: 'Priya Silva',
          value: 42000,
          stage: 'closed-won',
          assigneeId: 'user-4', // Jacob
          source: 'website',
          probability: 100,
          expectedCloseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          actualCloseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Quarterly supply contract - repeat customer',
          tags: ['repeat-customer', 'sri-lanka', 'quarterly'],
          leadSource: 'lead-4'
        },
        {
          id: 'deal-8',
          title: 'Pacific Beverages - Hotel Chain Supply',
          companyName: 'Pacific Beverages',
          contactName: 'Lisa Wong',
          value: 68000,
          stage: 'closed-won',
          assigneeId: 'user-5', // Anna
          source: 'email',
          probability: 100,
          expectedCloseDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          actualCloseDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Major hotel chain tea supply partnership',
          tags: ['hospitality', 'singapore', 'hotel-chain'],
          leadSource: 'lead-5'
        },
        {
          id: 'deal-9',
          title: 'Mumbai Spice Market - Chai Blends',
          companyName: 'Mumbai Spice Market',
          contactName: 'Raj Mehta',
          value: 35000,
          stage: 'closed-won',
          assigneeId: 'user-4', // Jacob
          source: 'facebook',
          probability: 100,
          expectedCloseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          actualCloseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Traditional chai blend specialist partnership',
          tags: ['chai-specialist', 'india', 'traditional'],
          leadSource: 'lead-6'
        },
        // Pipeline deals for ongoing performance tracking
        {
          id: 'deal-10',
          title: 'Qatar Fine Foods - Premium Green Tea',
          companyName: 'Qatar Fine Foods',
          contactName: 'Khalid Al-Thani',
          value: 120000,
          stage: 'qualification',
          assigneeId: 'user-3', // Amir
          source: 'facebook',
          probability: 60,
          expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          notes: 'Large retail chain - high potential deal',
          tags: ['retail-chain', 'qatar', 'high-value'],
          leadSource: 'lead-8'
        },
        {
          id: 'deal-11',
          title: 'Nordic Tea House - Organic Selection',
          companyName: 'Nordic Tea House',
          contactName: 'Erik Andersson',
          value: 45000,
          stage: 'negotiation',
          assigneeId: 'user-2', // Maria
          source: 'website',
          probability: 80,
          expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          notes: 'Nordic expansion opportunity - strong interest',
          tags: ['organic', 'europe', 'expansion'],
          leadSource: 'lead-9'
        }
      ],
      selectedDeal: null,
      dealFilters: {
        search: '',
        stage: 'all',
        assignee: 'all',
        dateRange: 'all'
      },
      dealStages: [
        { id: 'prospecting', name: 'Prospecting', order: 1, color: 'bg-gray-500' },
        { id: 'qualification', name: 'Qualification', order: 2, color: 'bg-blue-500' },
        { id: 'proposal', name: 'Proposal', order: 3, color: 'bg-yellow-500' },
        { id: 'negotiation', name: 'Negotiation', order: 4, color: 'bg-purple-500' },
        { id: 'closed-won', name: 'Closed Won', order: 5, color: 'bg-green-500' },
        { id: 'closed-lost', name: 'Closed Lost', order: 6, color: 'bg-red-500' }
      ],

      // Activities state
      activities: [],
      activityTypes: ['Call', 'Email', 'Meeting', 'Task', 'Note'],
      activityFilters: {
        type: 'all',
        status: 'all',
        assignee: 'all',
        dateRange: 'today'
      },

      // Products state
      products: [],
      selectedProduct: null,
      productCategories: [
        { id: 'crm-sales', name: 'CRM & Sales', description: 'Customer relationship management and sales automation tools' },
        { id: 'marketing', name: 'Marketing Automation', description: 'Email marketing, campaigns, and lead generation tools' },
        { id: 'analytics', name: 'Analytics & BI', description: 'Business intelligence and data analytics platforms' },
        { id: 'productivity', name: 'Productivity Tools', description: 'Project management and team collaboration software' },
        { id: 'communication', name: 'Communication', description: 'Video conferencing, chat, and unified communications' },
        { id: 'security', name: 'Security & Compliance', description: 'Cybersecurity, data protection, and compliance tools' },
        { id: 'integration', name: 'Integration Services', description: 'API integration and workflow automation services' },
        { id: 'consulting', name: 'Consulting Services', description: 'Professional services and strategic consulting' },
        { id: 'additional-products', name: 'Additional Products', description: 'Web hosting, design services, and supplementary business solutions' }
      ],
      productFilters: {
        search: '',
        category: 'all',
        status: 'all'
      },

      // Contact actions
      addContact: (contact) => set((state) => ({
        contacts: [...state.contacts, {
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...contact
        }]
      })),

      updateContact: (id, updates) => set((state) => ({
        contacts: state.contacts.map(contact =>
          String(contact.id) === String(id) ? { ...contact, ...updates, updatedAt: new Date().toISOString() } : contact
        ),
        selectedContact: state.selectedContact?.id === id 
          ? { ...state.selectedContact, ...updates } 
          : state.selectedContact
      })),

      deleteContact: (id) => set((state) => ({
        contacts: state.contacts.filter(contact => contact.id !== id),
        selectedContact: state.selectedContact?.id === id ? null : state.selectedContact
      })),

      setSelectedContact: (contact) => set({ selectedContact: contact }),

      setContactFilters: (filters) => set((state) => ({
        contactFilters: { ...state.contactFilters, ...filters }
      })),

      // Company actions
      addCompany: (company) => set((state) => ({
        companies: [...state.companies, {
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...company
        }]
      })),

      updateCompany: (id, updates) => set((state) => ({
        companies: state.companies.map(company =>
          String(company.id) === String(id) ? { ...company, ...updates, updatedAt: new Date().toISOString() } : company
        ),
        selectedCompany: state.selectedCompany?.id === id 
          ? { ...state.selectedCompany, ...updates } 
          : state.selectedCompany
      })),

      deleteCompany: (id) => set((state) => ({
        companies: state.companies.filter(company => company.id !== id),
        selectedCompany: state.selectedCompany?.id === id ? null : state.selectedCompany
      })),

      setSelectedCompany: (company) => set({ selectedCompany: company }),

      setCompanyFilters: (filters) => set((state) => ({
        companyFilters: { ...state.companyFilters, ...filters }
      })),

      // Deal actions
      addDeal: (deal) => set((state) => ({
        deals: [...state.deals, {
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          stage: 'prospecting',
          ...deal
        }]
      })),

      updateDeal: (id, updates) => set((state) => ({
        deals: state.deals.map(deal =>
          String(deal.id) === String(id) ? { ...deal, ...updates, updatedAt: new Date().toISOString() } : deal
        ),
        selectedDeal: state.selectedDeal?.id === id 
          ? { ...state.selectedDeal, ...updates } 
          : state.selectedDeal
      })),

      deleteDeal: (id) => set((state) => ({
        deals: state.deals.filter(deal => deal.id !== id),
        selectedDeal: state.selectedDeal?.id === id ? null : state.selectedDeal
      })),

      moveDealToStage: (dealId, stageId) => {
        const state = get();
        const dealExists = state.deals.some(deal => String(deal.id) === String(dealId));
        const stageExists = state.dealStages.some(stage => stage.id === stageId);
        
        if (!dealExists) {
          console.error(`Deal with id ${dealId} not found`);
          return;
        }
        
        if (!stageExists) {
          console.error(`Stage with id ${stageId} not found`);
          return;
        }
        
        set((state) => ({
          deals: state.deals.map(deal =>
            String(deal.id) === String(dealId) 
              ? { ...deal, stage: stageId, updatedAt: new Date().toISOString() } 
              : deal
          )
        }));
      },

      setSelectedDeal: (deal) => set({ selectedDeal: deal }),

      setDealFilters: (filters) => set((state) => ({
        dealFilters: { ...state.dealFilters, ...filters }
      })),

      // View preferences
      viewPreferences: {
        contacts: 'list',
        companies: 'list',
        deals: 'kanban',
        activities: 'list'
      },

      setViewPreference: (entityType, viewType) => set((state) => ({
        viewPreferences: {
          ...state.viewPreferences,
          [entityType]: viewType
        }
      })),

      // Activity actions
      addActivity: (activity) => set((state) => ({
        activities: [...state.activities, {
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completed: false,
          ...activity
        }]
      })),

      updateActivity: (id, updates) => set((state) => ({
        activities: state.activities.map(activity =>
          String(activity.id) === String(id) ? { ...activity, ...updates, updatedAt: new Date().toISOString() } : activity
        )
      })),

      deleteActivity: (id) => set((state) => ({
        activities: state.activities.filter(activity => activity.id !== id)
      })),

      completeActivity: (id) => set((state) => ({
        activities: state.activities.map(activity =>
          activity.id === id 
            ? { ...activity, completed: true, completedAt: new Date().toISOString() } 
            : activity
        )
      })),

      setActivityFilters: (filters) => set((state) => ({
        activityFilters: { ...state.activityFilters, ...filters }
      })),

      // Product actions
      addProduct: (product) => set((state) => ({
        products: [...state.products, {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active',
          ...product
        }]
      })),

      updateProduct: (id, updates) => set((state) => ({
        products: state.products.map(product =>
          String(product.id) === String(id) 
            ? { ...product, ...updates, updatedAt: new Date().toISOString() } 
            : product
        ),
        selectedProduct: state.selectedProduct?.id === id 
          ? { ...state.selectedProduct, ...updates } 
          : state.selectedProduct
      })),

      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(product => product.id !== id),
        selectedProduct: state.selectedProduct?.id === id ? null : state.selectedProduct
      })),

      setSelectedProduct: (product) => set({ selectedProduct: product }),

      setProductFilters: (filters) => set((state) => ({
        productFilters: { ...state.productFilters, ...filters }
      })),

      // Computed getters
      getFilteredContacts: () => {
        const state = get();
        return state.contacts.filter(contact => {
          if (state.contactFilters.search && 
              !contact.name.toLowerCase().includes(state.contactFilters.search.toLowerCase()) &&
              !contact.email?.toLowerCase().includes(state.contactFilters.search.toLowerCase())) {
            return false;
          }
          if (state.contactFilters.tags.length > 0 && 
              !state.contactFilters.tags.some(tag => contact.tags?.includes(tag))) {
            return false;
          }
          if (state.contactFilters.companies.length > 0 && 
              !state.contactFilters.companies.includes(contact.companyId)) {
            return false;
          }
          if (state.contactFilters.status !== 'all' && contact.status !== state.contactFilters.status) {
            return false;
          }
          return true;
        });
      },

      getFilteredCompanies: () => {
        const state = get();
        return state.companies.filter(company => {
          if (state.companyFilters.search && 
              !company.name.toLowerCase().includes(state.companyFilters.search.toLowerCase())) {
            return false;
          }
          if (state.companyFilters.industry !== 'all' && company.industry !== state.companyFilters.industry) {
            return false;
          }
          if (state.companyFilters.size !== 'all' && company.size !== state.companyFilters.size) {
            return false;
          }
          if (state.companyFilters.status !== 'all' && company.status !== state.companyFilters.status) {
            return false;
          }
          return true;
        });
      },

      getFilteredDeals: () => {
        const state = get();
        return state.deals.filter(deal => {
          if (state.dealFilters.search && 
              !deal.name.toLowerCase().includes(state.dealFilters.search.toLowerCase())) {
            return false;
          }
          if (state.dealFilters.stage !== 'all' && deal.stage !== state.dealFilters.stage) {
            return false;
          }
          if (state.dealFilters.assignee !== 'all' && deal.assigneeId !== state.dealFilters.assignee) {
            return false;
          }
          // Add date range filtering logic here
          return true;
        });
      },

      getDealsByStage: () => {
        const state = get();
        const dealsByStage = {};
        state.dealStages.forEach(stage => {
          dealsByStage[stage.id] = state.getFilteredDeals().filter(deal => deal.stage === stage.id);
        });
        return dealsByStage;
      },

      getFilteredActivities: () => {
        const state = get();
        return state.activities.filter(activity => {
          if (state.activityFilters.type !== 'all' && activity.type !== state.activityFilters.type) {
            return false;
          }
          if (state.activityFilters.status !== 'all') {
            if (state.activityFilters.status === 'completed' && !activity.completed) return false;
            if (state.activityFilters.status === 'pending' && activity.completed) return false;
          }
          if (state.activityFilters.assignee !== 'all' && activity.assigneeId !== state.activityFilters.assignee) {
            return false;
          }
          // Add date range filtering logic here
          return true;
        });
      },

      getFilteredProducts: () => {
        const state = get();
        return state.products.filter(product => {
          if (state.productFilters.search && 
              !product.name.toLowerCase().includes(state.productFilters.search.toLowerCase()) &&
              !product.sku?.toLowerCase().includes(state.productFilters.search.toLowerCase()) &&
              !product.description?.toLowerCase().includes(state.productFilters.search.toLowerCase())) {
            return false;
          }
          if (state.productFilters.category !== 'all' && 
              product.category !== state.productFilters.category) {
            return false;
          }
          if (state.productFilters.status !== 'all' && 
              product.status !== state.productFilters.status) {
            return false;
          }
          return true;
        });
      },

      getProductStatistics: () => {
        const state = get();
        const activeProducts = state.products.filter(p => p.status === 'active');
        const totalValue = state.products.reduce((sum, product) => sum + (product.price || 0), 0);
        const averagePrice = state.products.length > 0 ? totalValue / state.products.length : 0;

        return {
          totalProducts: state.products.length,
          activeProducts: activeProducts.length,
          inactiveProducts: state.products.filter(p => p.status === 'inactive').length,
          discontinuedProducts: state.products.filter(p => p.status === 'discontinued').length,
          totalCategories: state.productCategories.length,
          averagePrice,
          totalValue
        };
      },

      // Statistics
      getStatistics: () => {
        const state = get();
        return {
          totalContacts: state.contacts.length,
          totalCompanies: state.companies.length,
          totalDeals: state.deals.length,
          wonDeals: state.deals.filter(d => d.stage === 'closed-won').length,
          lostDeals: state.deals.filter(d => d.stage === 'closed-lost').length,
          totalDealValue: state.deals.reduce((sum, deal) => sum + (deal.value || 0), 0),
          totalProducts: state.products.length,
          activeProducts: state.products.filter(p => p.status === 'active').length,
          totalActivities: state.activities.length,
          completedActivities: state.activities.filter(a => a.completed).length,
          pendingActivities: state.activities.filter(a => !a.completed).length
        };
      },

      // Sales Velocity Methods
      /**
       * Calculate comprehensive sales velocity metrics
       * @param {Object} options - Filter options (timeframe, assignee, stage, etc.)
       * @returns {Object} Complete sales velocity analysis
       */
      getSalesVelocityMetrics: (options = {}) => {
        const state = get();
        // Use provided deals if available (for breakdown calculations)
        let filteredDeals = options._deals ? [...options._deals] : [...state.deals];

        // Apply filters (only if not using pre-filtered _deals)
        if (options.timeframe && !options._deals) {
          const cutoffDate = state._getTimeframeCutoff(options.timeframe);
          filteredDeals = filteredDeals.filter(deal => 
            new Date(deal.createdAt) >= cutoffDate
          );
        }

        if (options.assignee && options.assignee !== 'all') {
          filteredDeals = filteredDeals.filter(deal => deal.assigneeId === options.assignee);
        }

        if (options.stage && options.stage !== 'all') {
          filteredDeals = filteredDeals.filter(deal => deal.stage === options.stage);
        }

        if (options.source && options.source !== 'all') {
          filteredDeals = filteredDeals.filter(deal => deal.source === options.source);
        }

        // Calculate core velocity components
        const numberOfDeals = filteredDeals.length;
        const totalDealValue = filteredDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
        const averageDealValue = numberOfDeals > 0 ? totalDealValue / numberOfDeals : 0;

        // Calculate win rate
        const closedDeals = filteredDeals.filter(deal => 
          deal.stage === 'closed-won' || deal.stage === 'closed-lost'
        );
        const wonDeals = filteredDeals.filter(deal => deal.stage === 'closed-won');
        const winRate = closedDeals.length > 0 ? wonDeals.length / closedDeals.length : 0;

        // Calculate average sales cycle
        const averageSalesCycle = state._calculateAverageSalesCycle(filteredDeals);

        // Sales Velocity Formula: (Number of deals × Average deal value × Win rate) / Average sales cycle length
        const salesVelocity = averageSalesCycle > 0 
          ? (numberOfDeals * averageDealValue * winRate) / averageSalesCycle 
          : 0;

        // Calculate previous period for trend analysis
        let trend = null;
        if (options.timeframe && options.timeframe !== 'all' && !options._deals) {
          const previousPeriodDeals = state._getPreviousPeriodDeals(options.timeframe);
          if (previousPeriodDeals.length > 0) {
            // Calculate previous velocity directly to avoid recursion
            const prevNumberOfDeals = previousPeriodDeals.length;
            const prevTotalValue = previousPeriodDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
            const prevAverageValue = prevNumberOfDeals > 0 ? prevTotalValue / prevNumberOfDeals : 0;
            
            const prevClosedDeals = previousPeriodDeals.filter(deal => 
              deal.stage === 'closed-won' || deal.stage === 'closed-lost'
            );
            const prevWonDeals = previousPeriodDeals.filter(deal => deal.stage === 'closed-won');
            const prevWinRate = prevClosedDeals.length > 0 ? prevWonDeals.length / prevClosedDeals.length : 0;
            
            const prevAverageCycle = state._calculateAverageSalesCycle(previousPeriodDeals);
            const previousVelocity = prevAverageCycle > 0 
              ? (prevNumberOfDeals * prevAverageValue * prevWinRate) / prevAverageCycle 
              : 0;
            trend = salesVelocity - previousVelocity;
          }
        }

        return {
          salesVelocity: Math.round(salesVelocity * 100) / 100,
          components: {
            numberOfDeals,
            averageDealValue: Math.round(averageDealValue * 100) / 100,
            winRate: Math.round(winRate * 10000) / 100, // Convert to percentage
            averageSalesCycle: Math.round(averageSalesCycle * 100) / 100
          },
          formattedVelocity: `$${Math.round(salesVelocity).toLocaleString()} per day`,
          monthlyVelocity: Math.round(salesVelocity * 30),
          yearlyVelocity: Math.round(salesVelocity * 365),
          trend: trend ? Math.round(trend * 100) / 100 : null,
          timeframe: options.timeframe || 'all-time',
          filters: options
        };
      },

      /**
       * Get detailed deal cycle metrics and analysis
       * @param {Object} options - Filter options
       * @returns {Object} Deal cycle analysis
       */
      getDealCycleMetrics: (options = {}) => {
        const state = get();
        let filteredDeals = [...state.deals];

        // Apply filters
        if (options.timeframe) {
          const cutoffDate = state._getTimeframeCutoff(options.timeframe);
          filteredDeals = filteredDeals.filter(deal => 
            new Date(deal.createdAt) >= cutoffDate
          );
        }

        if (options.assignee && options.assignee !== 'all') {
          filteredDeals = filteredDeals.filter(deal => deal.assigneeId === options.assignee);
        }

        // Calculate cycle metrics by stage
        const stageMetrics = {};
        state.dealStages.forEach(stage => {
          const stageDeals = filteredDeals.filter(deal => deal.stage === stage.id);
          const stageCycle = state._calculateAverageSalesCycle(stageDeals);
          
          stageMetrics[stage.id] = {
            name: stage.name,
            deals: stageDeals.length,
            averageCycle: Math.round(stageCycle * 100) / 100,
            totalValue: stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0),
            color: stage.color
          };
        });

        // Calculate distribution of cycle lengths
        const closedDeals = filteredDeals.filter(deal => 
          (deal.stage === 'closed-won' || deal.stage === 'closed-lost') && 
          deal.createdAt && deal.updatedAt
        );

        const cycleLengths = closedDeals.map(deal => {
          const cycleLength = (new Date(deal.updatedAt) - new Date(deal.createdAt)) / (1000 * 60 * 60 * 24);
          return Math.round(cycleLength);
        });

        const cycleDistribution = {
          '0-30': cycleLengths.filter(c => c <= 30).length,
          '31-60': cycleLengths.filter(c => c > 30 && c <= 60).length,
          '61-90': cycleLengths.filter(c => c > 60 && c <= 90).length,
          '91-180': cycleLengths.filter(c => c > 90 && c <= 180).length,
          '180+': cycleLengths.filter(c => c > 180).length
        };

        // Calculate percentiles
        const sortedCycles = cycleLengths.sort((a, b) => a - b);
        const percentiles = {
          p25: sortedCycles[Math.floor(sortedCycles.length * 0.25)] || 0,
          p50: sortedCycles[Math.floor(sortedCycles.length * 0.5)] || 0,
          p75: sortedCycles[Math.floor(sortedCycles.length * 0.75)] || 0,
          p90: sortedCycles[Math.floor(sortedCycles.length * 0.9)] || 0
        };

        return {
          overallMetrics: {
            averageCycle: state._calculateAverageSalesCycle(filteredDeals),
            medianCycle: percentiles.p50,
            shortestCycle: Math.min(...cycleLengths) || 0,
            longestCycle: Math.max(...cycleLengths) || 0,
            totalDeals: filteredDeals.length,
            closedDeals: closedDeals.length
          },
          stageMetrics,
          cycleDistribution,
          percentiles,
          trends: {
            improving: cycleLengths.length > 1 ? cycleLengths.slice(-5).reduce((a, b) => a + b, 0) / 5 < cycleLengths.slice(0, -5).reduce((a, b) => a + b, 0) / Math.max(1, cycleLengths.length - 5) : null,
            timeframe: options.timeframe || 'all-time'
          }
        };
      },

      /**
       * Get sales velocity metrics by assignee/sales rep
       * @param {Object} options - Filter options
       * @returns {Object} Velocity breakdown by assignee
       */
      getSalesVelocityByAssignee: (options = {}) => {
        const state = get();
        let filteredDeals = [...state.deals];

        // Apply time filter
        if (options.timeframe) {
          const cutoffDate = state._getTimeframeCutoff(options.timeframe);
          filteredDeals = filteredDeals.filter(deal => 
            new Date(deal.createdAt) >= cutoffDate
          );
        }

        // Group deals by assignee
        const assigneeGroups = state._groupBy(filteredDeals, 'assigneeId');
        const assigneeMetrics = {};

        Object.keys(assigneeGroups).forEach(assigneeId => {
          if (assigneeId && assigneeId !== 'undefined') {
            const assigneeDeals = assigneeGroups[assigneeId];
            const assigneeVelocity = state.getSalesVelocityMetrics({
              ...options,
              assignee: assigneeId,
              _deals: assigneeDeals
            });

            // Additional assignee-specific metrics
            const closedDeals = assigneeDeals.filter(deal => 
              deal.stage === 'closed-won' || deal.stage === 'closed-lost'
            );
            const wonDeals = assigneeDeals.filter(deal => deal.stage === 'closed-won');
            
            assigneeMetrics[assigneeId] = {
              ...assigneeVelocity,
              assigneeId,
              performance: {
                dealsWorked: assigneeDeals.length,
                dealsWon: wonDeals.length,
                dealsLost: closedDeals.length - wonDeals.length,
                totalRevenue: wonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0),
                averageWonDealValue: wonDeals.length > 0 ? wonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0) / wonDeals.length : 0
              },
              ranking: 0 // Will be calculated after all assignees
            };
          }
        });

        // Calculate rankings based on sales velocity
        const sortedAssignees = Object.values(assigneeMetrics)
          .sort((a, b) => b.salesVelocity - a.salesVelocity);
        
        sortedAssignees.forEach((assignee, index) => {
          assigneeMetrics[assignee.assigneeId].ranking = index + 1;
        });

        // Calculate team averages
        const teamTotals = Object.values(assigneeMetrics).reduce((totals, assignee) => ({
          salesVelocity: totals.salesVelocity + assignee.salesVelocity,
          deals: totals.deals + assignee.components.numberOfDeals,
          revenue: totals.revenue + assignee.performance.totalRevenue,
          wonDeals: totals.wonDeals + assignee.performance.dealsWon
        }), { salesVelocity: 0, deals: 0, revenue: 0, wonDeals: 0 });

        const assigneeCount = Object.keys(assigneeMetrics).length;

        return {
          assigneeMetrics,
          teamAverages: {
            averageVelocity: assigneeCount > 0 ? teamTotals.salesVelocity / assigneeCount : 0,
            averageDeals: assigneeCount > 0 ? teamTotals.deals / assigneeCount : 0,
            averageRevenue: assigneeCount > 0 ? teamTotals.revenue / assigneeCount : 0,
            totalTeamRevenue: teamTotals.revenue,
            totalTeamDeals: teamTotals.deals
          },
          leaderboard: sortedAssignees.slice(0, 10), // Top 10 performers
          timeframe: options.timeframe || 'all-time'
        };
      },

      /**
       * Get sales velocity trends over time
       * @param {Object} options - Options including period granularity
       * @returns {Object} Velocity trends data
       */
      getSalesVelocityTrends: (options = {}) => {
        const state = get();
        const granularity = options.granularity || 'monthly'; // daily, weekly, monthly, quarterly
        const periods = options.periods || 12; // number of periods to analyze
        
        const now = new Date();
        const trends = [];

        // Generate date periods
        for (let i = periods - 1; i >= 0; i--) {
          let periodStart, periodEnd, periodLabel;
          
          switch (granularity) {
            case 'daily':
              periodStart = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
              periodEnd = new Date(now.getTime() - ((i - 1) * 24 * 60 * 60 * 1000));
              periodLabel = periodStart.toISOString().split('T')[0];
              break;
            case 'weekly':
              periodStart = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
              periodEnd = new Date(now.getTime() - ((i - 1) * 7 * 24 * 60 * 60 * 1000));
              periodLabel = `Week of ${periodStart.toISOString().split('T')[0]}`;
              break;
            case 'quarterly':
              const quarterStart = new Date(now.getFullYear(), now.getMonth() - (i * 3), 1);
              const quarterEnd = new Date(now.getFullYear(), now.getMonth() - ((i - 1) * 3), 1);
              periodStart = quarterStart;
              periodEnd = quarterEnd;
              periodLabel = `Q${Math.floor(quarterStart.getMonth() / 3) + 1} ${quarterStart.getFullYear()}`;
              break;
            default: // monthly
              periodStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
              periodEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
              periodLabel = periodStart.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          }

          // Filter deals for this period
          const periodDeals = state.deals.filter(deal => {
            const dealDate = new Date(deal.createdAt);
            return dealDate >= periodStart && dealDate < periodEnd;
          });

          // Calculate velocity for this period
          const periodVelocity = state.getSalesVelocityMetrics({
            ...options,
            _deals: periodDeals,
            timeframe: null // Prevent recursive timeframe filtering
          });

          trends.push({
            period: periodLabel,
            periodStart: periodStart.toISOString(),
            periodEnd: periodEnd.toISOString(),
            ...periodVelocity,
            dealCount: periodDeals.length,
            wonDeals: periodDeals.filter(d => d.stage === 'closed-won').length,
            totalValue: periodDeals.reduce((sum, deal) => sum + (deal.value || 0), 0)
          });
        }

        // Calculate trend direction and growth rates
        const trendAnalysis = {
          direction: trends.length > 1 ? 
            (trends[trends.length - 1].salesVelocity > trends[trends.length - 2].salesVelocity ? 'up' : 'down') : 'stable',
          growthRate: trends.length > 1 ? 
            ((trends[trends.length - 1].salesVelocity - trends[trends.length - 2].salesVelocity) / Math.max(1, trends[trends.length - 2].salesVelocity)) * 100 : 0,
          averageVelocity: trends.reduce((sum, t) => sum + t.salesVelocity, 0) / trends.length,
          peakVelocity: Math.max(...trends.map(t => t.salesVelocity)),
          lowestVelocity: Math.min(...trends.map(t => t.salesVelocity))
        };

        return {
          trends,
          analysis: trendAnalysis,
          granularity,
          periods,
          summary: {
            totalPeriods: trends.length,
            improvingPeriods: trends.filter((t, i) => i > 0 && t.salesVelocity > trends[i - 1].salesVelocity).length,
            decliningPeriods: trends.filter((t, i) => i > 0 && t.salesVelocity < trends[i - 1].salesVelocity).length
          }
        };
      },

      /**
       * Get velocity breakdown by various dimensions
       * @param {Object} options - Breakdown options
       * @returns {Object} Velocity breakdown analysis
       */
      getVelocityBreakdown: (options = {}) => {
        const state = get();
        const breakdown = options.breakdown || 'stage'; // stage, source, value_range, assignee
        let filteredDeals = [...state.deals];

        // Apply filters
        if (options.timeframe) {
          const cutoffDate = state._getTimeframeCutoff(options.timeframe);
          filteredDeals = filteredDeals.filter(deal => 
            new Date(deal.createdAt) >= cutoffDate
          );
        }

        let breakdownData = {};

        switch (breakdown) {
          case 'stage':
            state.dealStages.forEach(stage => {
              const stageDeals = filteredDeals.filter(deal => deal.stage === stage.id);
              if (stageDeals.length > 0) {
                const stageVelocity = state.getSalesVelocityMetrics({
                  ...options,
                  _deals: stageDeals,
                  timeframe: null // Prevent recursive timeframe filtering
                });
                breakdownData[stage.id] = {
                  name: stage.name,
                  color: stage.color,
                  ...stageVelocity
                };
              }
            });
            break;

          case 'source':
            const sourceGroups = state._groupBy(filteredDeals, 'source');
            Object.keys(sourceGroups).forEach(source => {
              if (source && source !== 'undefined') {
                const sourceDeals = sourceGroups[source];
                const sourceVelocity = state.getSalesVelocityMetrics({
                  ...options,
                  _deals: sourceDeals,
                  timeframe: null // Prevent recursive timeframe filtering
                });
                breakdownData[source] = {
                  name: source,
                  ...sourceVelocity
                };
              }
            });
            break;

          case 'value_range':
            const valueRanges = {
              'small': { min: 0, max: 10000, name: 'Small Deals (<$10K)' },
              'medium': { min: 10000, max: 50000, name: 'Medium Deals ($10K-$50K)' },
              'large': { min: 50000, max: 100000, name: 'Large Deals ($50K-$100K)' },
              'enterprise': { min: 100000, max: Infinity, name: 'Enterprise Deals (>$100K)' }
            };

            Object.keys(valueRanges).forEach(range => {
              const rangeConfig = valueRanges[range];
              const rangeDeals = filteredDeals.filter(deal => 
                (deal.value || 0) >= rangeConfig.min && (deal.value || 0) < rangeConfig.max
              );
              
              if (rangeDeals.length > 0) {
                const rangeVelocity = state.getSalesVelocityMetrics({
                  ...options,
                  _deals: rangeDeals,
                  timeframe: null // Prevent recursive timeframe filtering
                });
                breakdownData[range] = {
                  name: rangeConfig.name,
                  range: `$${rangeConfig.min.toLocaleString()}-${rangeConfig.max === Infinity ? '∞' : '$' + rangeConfig.max.toLocaleString()}`,
                  ...rangeVelocity
                };
              }
            });
            break;

          case 'assignee':
            return state.getSalesVelocityByAssignee(options);

          default:
            breakdownData = { error: 'Invalid breakdown type' };
        }

        // Sort by velocity descending
        const sortedBreakdown = Object.entries(breakdownData)
          .sort(([,a], [,b]) => (b.salesVelocity || 0) - (a.salesVelocity || 0))
          .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {});

        return {
          breakdown: breakdown,
          data: sortedBreakdown,
          summary: {
            totalCategories: Object.keys(sortedBreakdown).length,
            highestVelocity: Math.max(...Object.values(sortedBreakdown).map(d => d.salesVelocity || 0)),
            lowestVelocity: Math.min(...Object.values(sortedBreakdown).map(d => d.salesVelocity || 0)),
            averageVelocity: Object.values(sortedBreakdown).reduce((sum, d) => sum + (d.salesVelocity || 0), 0) / Math.max(1, Object.keys(sortedBreakdown).length)
          },
          timeframe: options.timeframe || 'all-time'
        };
      },

      // Helper methods for sales velocity calculations
      _calculateAverageSalesCycle: (deals) => {
        if (!deals || deals.length === 0) return 0;

        const closedDeals = deals.filter(deal => 
          (deal.stage === 'closed-won' || deal.stage === 'closed-lost') && 
          deal.createdAt && deal.updatedAt
        );

        if (closedDeals.length === 0) {
          // If no closed deals, estimate based on current deal ages
          const currentTime = new Date();
          const totalDays = deals.reduce((sum, deal) => {
            const dealAge = (currentTime - new Date(deal.createdAt)) / (1000 * 60 * 60 * 24);
            return sum + dealAge;
          }, 0);
          return deals.length > 0 ? totalDays / deals.length : 30; // Default to 30 days
        }

        const totalCycleDays = closedDeals.reduce((sum, deal) => {
          const cycleLength = (new Date(deal.updatedAt) - new Date(deal.createdAt)) / (1000 * 60 * 60 * 24);
          return sum + cycleLength;
        }, 0);

        return totalCycleDays / closedDeals.length;
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

      _getPreviousPeriodDeals: (timeframe) => {
        const state = get();
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
        const previousStart = new Date(now.getTime() - (daysBack * 2 * 24 * 60 * 60 * 1000));
        const previousEnd = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
        
        return state.deals.filter(deal => {
          const dealDate = new Date(deal.createdAt);
          return dealDate >= previousStart && dealDate < previousEnd;
        });
      },

      _groupBy: (array, key) => {
        return array.reduce((groups, item) => {
          const group = item[key];
          if (!groups[group]) {
            groups[group] = [];
          }
          groups[group].push(item);
          return groups;
        }, {});
      },

      /**
       * Get pipeline value metrics
       * @param {Object} options - Filter options
       * @returns {Object} Pipeline value data and breakdown
       */
      getPipelineValueMetrics: (options = {}) => {
        const state = get();
        return calculatePipelineValue(state.deals, options);
      },

      /**
       * Get win rate metrics
       * @param {Object} options - Filter options  
       * @returns {Object} Win rate data and analysis
       */
      getWinRateMetrics: (options = {}) => {
        const state = get();
        return calculateWinRate(state.deals, [], options);
      },

      /**
       * Get comprehensive pipeline analysis including value and win rate
       * @param {Object} options - Filter options
       * @returns {Object} Combined pipeline analysis
       */
      getPipelineAnalysis: (options = {}) => {
        const state = get();
        const pipelineValue = state.getPipelineValueMetrics(options);
        const winRate = state.getWinRateMetrics(options);
        
        return {
          pipelineValue,
          winRate,
          combined: {
            totalValue: pipelineValue.totalPipelineValue,
            weightedValue: pipelineValue.weightedPipelineValue,
            winRate: winRate.overallWinRate,
            dealsInPipeline: pipelineValue.activeDealCount,
            closedDeals: winRate.closedDeals,
            averageDealValue: pipelineValue.averageDealValue,
            timeframe: options.timeframe || 'all-time'
          }
        };
      },

      /**
       * Get deal closure time metrics
       * @param {Object} options - Filter options
       * @returns {Object} Deal closure time data and analysis
       */
      getDealClosureTimeMetrics: (options = {}) => {
        const state = get();
        return calculateDealClosureTime(state.deals, options);
      },

      /**
       * Get comprehensive deal performance analysis
       * @param {Object} options - Filter options
       * @returns {Object} Combined deal performance metrics
       */
      getDealPerformanceAnalysis: (options = {}) => {
        const state = get();
        const closureTime = state.getDealClosureTimeMetrics(options);
        const salesVelocity = state.getSalesVelocityMetrics(options);
        const winRate = state.getWinRateMetrics(options);
        
        // Calculate performance insights
        const insights = [];
        
        // Closure time insights
        if (closureTime.averageClosureTime > 45) {
          insights.push({
            type: 'slow_closure',
            priority: 'high',
            title: 'Slow Deal Closure',
            description: `Average deal closure time (${closureTime.formattedAverageTime}) exceeds industry benchmark`,
            actionItems: [
              'Review deal qualification criteria',
              'Streamline approval processes',
              'Improve customer decision-making support'
            ]
          });
        }
        
        // Velocity vs closure time correlation
        if (salesVelocity.salesVelocity < 1000 && closureTime.averageClosureTime > 30) {
          insights.push({
            type: 'velocity_closure_correlation',
            priority: 'medium',
            title: 'Low Velocity & Slow Closure',
            description: 'Both sales velocity and closure time need improvement',
            actionItems: [
              'Focus on deal qualification',
              'Implement faster decision processes',
              'Increase deal value or reduce cycle time'
            ]
          });
        }

        return {
          closureTime,
          salesVelocity,
          winRate,
          insights,
          summary: {
            averageClosureTime: closureTime.averageClosureTime,
            salesVelocity: salesVelocity.salesVelocity,
            winRate: winRate.overallWinRate,
            totalDeals: closureTime.totalDeals,
            closedDeals: closureTime.closedDeals,
            performanceScore: state._calculateDealPerformanceScore(closureTime, salesVelocity, winRate)
          }
        };
      },

      /**
       * Get deal closure trends and comparisons
       * @param {Object} options - Analysis options
       * @returns {Object} Closure time trends analysis
       */
      getDealClosureTrends: (options = {}) => {
        const state = get();
        const periods = ['7d', '30d', '90d'];
        const trends = [];
        
        periods.forEach(period => {
          const periodData = state.getDealClosureTimeMetrics({
            ...options,
            timeframe: period
          });
          
          trends.push({
            period: period,
            averageClosureTime: periodData.averageClosureTime,
            closedDeals: periodData.closedDeals,
            formattedTime: periodData.formattedAverageTime,
            performanceCategory: periodData.performanceCategory
          });
        });

        // Calculate trend direction
        const trendDirection = trends.length >= 2 
          ? trends[1].averageClosureTime - trends[0].averageClosureTime
          : 0;

        return {
          trends,
          trendDirection,
          improving: trendDirection < 0, // Negative means getting faster (better)
          trendDescription: trendDirection < -2 ? 'Improving' :
                           trendDirection > 2 ? 'Declining' : 'Stable'
        };
      },

      /**
       * Get monthly revenue per rep metrics
       * @param {Object} options - Filter options
       * @returns {Object} Monthly revenue per rep analysis
       */
      getMonthlyRevenuePerRepMetrics: (options = {}) => {
        const state = get();
        
        // Get deals and leads for revenue calculation
        const deals = options._deals || state.deals;
        const leads = options._leads || []; // Will be populated from lead store if needed
        
        return calculateMonthlyRevenuePerRep(deals, leads, options);
      },

      /**
       * Get revenue performance analysis by rep
       * @param {Object} options - Filter options
       * @returns {Object} Revenue performance analysis
       */
      getRevenuePerformanceAnalysis: (options = {}) => {
        const state = get();
        const revenueMetrics = state.getMonthlyRevenuePerRepMetrics(options);
        
        if (!revenueMetrics || revenueMetrics.totalReps === 0) {
          return {
            summary: 'No revenue data available',
            recommendations: [],
            topPerformers: [],
            improvementAreas: []
          };
        }

        const analysis = {
          summary: `${revenueMetrics.totalReps} reps generated ${revenueMetrics.formattedAverage} on average`,
          topPerformers: revenueMetrics.topPerformers,
          improvementAreas: [],
          recommendations: []
        };

        // Identify improvement areas
        const lowPerformers = Object.entries(revenueMetrics.byRep)
          .filter(([, data]) => data.performanceCategory.category === 'low')
          .map(([repId, data]) => ({ repId, monthlyAverage: data.monthlyAverage }));

        if (lowPerformers.length > 0) {
          analysis.improvementAreas.push({
            area: 'Low Revenue Reps',
            count: lowPerformers.length,
            description: `${lowPerformers.length} reps are generating below-average revenue`,
            reps: lowPerformers
          });
        }

        // Add recommendations based on insights
        revenueMetrics.insights.forEach(insight => {
          analysis.recommendations.push({
            priority: insight.priority,
            title: insight.title,
            description: insight.description,
            action: insight.recommendation
          });
        });

        return analysis;
      },

      /**
       * Get revenue trends over time
       * @param {Object} options - Filter options
       * @returns {Object} Revenue trends analysis
       */
      getRevenueTrends: (options = {}) => {
        const state = get();
        const revenueMetrics = state.getMonthlyRevenuePerRepMetrics(options);
        
        if (!revenueMetrics.byMonth || Object.keys(revenueMetrics.byMonth).length === 0) {
          return {
            trends: [],
            trendDirection: 0,
            improving: false,
            trendDescription: 'No trend data'
          };
        }

        // Calculate month-over-month trends
        const months = Object.keys(revenueMetrics.byMonth).sort();
        const trends = months.map(month => ({
          month,
          totalRevenue: revenueMetrics.byMonth[month].totalRevenue,
          averagePerRep: revenueMetrics.byMonth[month].averagePerRep,
          activeReps: revenueMetrics.byMonth[month].activeReps
        }));

        // Calculate trend direction
        let trendDirection = 0;
        if (trends.length >= 2) {
          const recent = trends[trends.length - 1];
          const previous = trends[trends.length - 2];
          trendDirection = ((recent.averagePerRep - previous.averagePerRep) / previous.averagePerRep) * 100;
        }

        return {
          trends,
          trendDirection: Math.round(trendDirection * 100) / 100,
          improving: trendDirection > 0,
          trendDescription: trendDirection > 5 ? 'Improving' :
                           trendDirection < -5 ? 'Declining' : 'Stable'
        };
      },

      // Helper method for calculating deal performance score
      _calculateDealPerformanceScore: (closureTime, salesVelocity, winRate) => {
        let score = 100;
        
        // Deduct points for slow closure times
        if (closureTime.averageClosureTime > 90) score -= 30;
        else if (closureTime.averageClosureTime > 60) score -= 20;
        else if (closureTime.averageClosureTime > 45) score -= 10;
        else if (closureTime.averageClosureTime > 30) score -= 5;
        
        // Deduct points for low sales velocity
        if (salesVelocity.salesVelocity < 500) score -= 25;
        else if (salesVelocity.salesVelocity < 1000) score -= 15;
        else if (salesVelocity.salesVelocity < 2000) score -= 5;
        
        // Deduct points for low win rate
        if (winRate.overallWinRate < 20) score -= 25;
        else if (winRate.overallWinRate < 30) score -= 15;
        else if (winRate.overallWinRate < 40) score -= 10;
        else if (winRate.overallWinRate < 50) score -= 5;
        
        return Math.max(0, Math.min(100, Math.round(score)));
      }
    }),
    {
      name: 'crm-core-storage',
      partialize: (state) => ({
        contacts: state.contacts,
        companies: state.companies,
        deals: state.deals,
        activities: state.activities,
        products: state.products,
        dealStages: state.dealStages,
        productCategories: state.productCategories,
        viewPreferences: state.viewPreferences
      })
    }
  )
);

export default useCRMStore;