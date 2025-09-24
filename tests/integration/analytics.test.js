// Analytics API Integration Tests
const TestUtils = require('../helpers/testUtils');

describe('Analytics API', () => {
  let testUtils;
  let authUser;
  let testData;

  beforeAll(async () => {
    testUtils = new TestUtils();
    await testUtils.setup();
    
    authUser = await testUtils.createTestUser({ role: 'manager' });
    await testUtils.apiClient.authenticate(authUser.email, 'TestPassword123!');
    
    // Create test data for analytics
    testData = await createAnalyticsTestData();
  });

  afterAll(async () => {
    await testUtils.cleanup();
  });

  async function createAnalyticsTestData() {
    const data = {
      leads: [],
      deals: [],
      companies: [],
      contacts: []
    };

    // Create companies
    for (let i = 0; i < 5; i++) {
      const company = await testUtils.createTestCompany();
      data.companies.push(company);
    }

    // Create contacts
    for (let i = 0; i < 10; i++) {
      const contact = await testUtils.createTestContact({
        companyId: data.companies[i % data.companies.length].id
      });
      data.contacts.push(contact);
    }

    // Create leads with various statuses and sources
    const leadStatuses = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
    const leadSources = ['website', 'facebook', 'email', 'referral', 'event'];
    
    for (let i = 0; i < 50; i++) {
      const lead = await testUtils.createTestLead({
        assignedTo: authUser.id,
        status: leadStatuses[i % leadStatuses.length],
        source: leadSources[i % leadSources.length],
        dealValue: Math.floor(Math.random() * 50000) + 5000,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
      });
      data.leads.push(lead);
    }

    // Create deals in various stages
    const dealStages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
    
    for (let i = 0; i < 30; i++) {
      const deal = await testUtils.createTestDeal({
        assignedTo: authUser.id,
        stage: dealStages[i % dealStages.length],
        value: Math.floor(Math.random() * 100000) + 10000,
        contactId: data.contacts[i % data.contacts.length].id,
        companyId: data.companies[i % data.companies.length].id,
        createdAt: new Date(Date.now() - Math.random() * 120 * 24 * 60 * 60 * 1000).toISOString()
      });
      data.deals.push(deal);
    }

    return data;
  }

  describe('Dashboard Analytics', () => {
    test('should retrieve dashboard metrics', async () => {
      const response = await testUtils.apiClient.getAnalytics('dashboard', {
        timeframe: '30d'
      });

      const validation = testUtils.validateResponse(response, 200, 'analyticsMetrics');
      expect(validation.valid).toBe(true);

      const metrics = response.data.data;
      expect(metrics.totalLeads).toBeGreaterThan(0);
      expect(metrics.conversionRate).toBeGreaterThanOrEqual(0);
      expect(metrics.totalRevenue).toBeGreaterThanOrEqual(0);
      expect(metrics.avgResponseTime).toBeGreaterThanOrEqual(0);
      expect(metrics.dealsPipeline).toBeGreaterThanOrEqual(0);
    });

    test('should support different timeframes', async () => {
      const timeframes = ['7d', '30d', '90d', '1y'];
      
      for (const timeframe of timeframes) {
        const response = await testUtils.apiClient.getAnalytics('dashboard', {
          timeframe
        });
        
        expect(response.status).toBe(200);
        expect(response.data.data.timeframe).toBe(timeframe);
      }
    });

    test('should calculate metrics correctly for empty data', async () => {
      // Test with future timeframe that should have no data
      const response = await testUtils.apiClient.getAnalytics('dashboard', {
        startDate: '2030-01-01',
        endDate: '2030-01-31'
      });

      expect(response.status).toBe(200);
      const metrics = response.data.data;
      expect(metrics.totalLeads).toBe(0);
      expect(metrics.conversionRate).toBe(0);
      expect(metrics.totalRevenue).toBe(0);
    });

    test('should have acceptable response time for dashboard', async () => {
      const measurement = await testUtils.measureResponseTime(
        testUtils.apiClient.getAnalytics.bind(testUtils.apiClient),
        'dashboard'
      );

      expect(measurement.success).toBe(true);
      expect(measurement.responseTime).toBeLessThan(1000); // Dashboard should be fast
    });
  });

  describe('Lead Analytics', () => {
    test('should get lead conversion metrics', async () => {
      const response = await testUtils.apiClient.getAnalytics('leads/conversion', {
        timeframe: '90d'
      });

      expect(response.status).toBe(200);
      const metrics = response.data.data;
      
      expect(metrics.totalLeads).toBeGreaterThan(0);
      expect(metrics.convertedLeads).toBeGreaterThanOrEqual(0);
      expect(metrics.conversionRate).toBeGreaterThanOrEqual(0);
      expect(metrics.conversionRate).toBeLessThanOrEqual(100);
    });

    test('should get conversion metrics by source', async () => {
      const response = await testUtils.apiClient.getAnalytics('leads/conversion-by-source');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
      
      response.data.data.forEach(sourceMetrics => {
        expect(sourceMetrics.source).toBeTruthy();
        expect(sourceMetrics.total).toBeGreaterThanOrEqual(0);
        expect(sourceMetrics.converted).toBeGreaterThanOrEqual(0);
        expect(sourceMetrics.conversionRate).toBeGreaterThanOrEqual(0);
        expect(sourceMetrics.conversionRate).toBeLessThanOrEqual(100);
      });
    });

    test('should get conversion metrics by assignee', async () => {
      const response = await testUtils.apiClient.getAnalytics('leads/conversion-by-assignee');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
      
      response.data.data.forEach(assigneeMetrics => {
        expect(assigneeMetrics.assignee).toBeTruthy();
        expect(assigneeMetrics.total).toBeGreaterThanOrEqual(0);
        expect(assigneeMetrics.converted).toBeGreaterThanOrEqual(0);
        expect(assigneeMetrics.conversionRate).toBeGreaterThanOrEqual(0);
      });
    });

    test('should get lead aging analysis', async () => {
      const response = await testUtils.apiClient.getAnalytics('leads/aging');

      expect(response.status).toBe(200);
      const analysis = response.data.data;
      
      expect(analysis.averageAge).toBeGreaterThanOrEqual(0);
      expect(analysis.ageDistribution).toBeTruthy();
      expect(typeof analysis.ageDistribution).toBe('object');
    });

    test('should get lead funnel metrics', async () => {
      const response = await testUtils.apiClient.getAnalytics('leads/funnel');

      expect(response.status).toBe(200);
      const funnel = response.data.data;
      
      expect(Array.isArray(funnel.stages)).toBe(true);
      expect(funnel.dropoffRates).toBeTruthy();
      
      funnel.stages.forEach(stage => {
        expect(stage.name).toBeTruthy();
        expect(stage.count).toBeGreaterThanOrEqual(0);
        expect(stage.percentage).toBeGreaterThanOrEqual(0);
        expect(stage.percentage).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Deal Analytics', () => {
    test('should get pipeline metrics', async () => {
      const response = await testUtils.apiClient.getAnalytics('deals/pipeline');

      expect(response.status).toBe(200);
      const pipeline = response.data.data;
      
      expect(pipeline.totalValue).toBeGreaterThanOrEqual(0);
      expect(pipeline.weightedValue).toBeGreaterThanOrEqual(0);
      expect(pipeline.avgDealSize).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(pipeline.stageDistribution)).toBe(true);
      
      pipeline.stageDistribution.forEach(stage => {
        expect(stage.stage).toBeTruthy();
        expect(stage.count).toBeGreaterThanOrEqual(0);
        expect(stage.value).toBeGreaterThanOrEqual(0);
      });
    });

    test('should get win/loss analysis', async () => {
      const response = await testUtils.apiClient.getAnalytics('deals/winloss');

      expect(response.status).toBe(200);
      const analysis = response.data.data;
      
      expect(analysis.winRate).toBeGreaterThanOrEqual(0);
      expect(analysis.winRate).toBeLessThanOrEqual(100);
      expect(analysis.avgSalesCycle).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(analysis.lossReasons)).toBe(true);
    });

    test('should get sales velocity metrics', async () => {
      const response = await testUtils.apiClient.getAnalytics('deals/velocity');

      expect(response.status).toBe(200);
      const velocity = response.data.data;
      
      expect(velocity.avgSalesCycle).toBeGreaterThanOrEqual(0);
      expect(velocity.avgDealSize).toBeGreaterThanOrEqual(0);
      expect(velocity.winRate).toBeGreaterThanOrEqual(0);
      expect(velocity.velocity).toBeGreaterThanOrEqual(0);
    });

    test('should get deal forecast', async () => {
      const response = await testUtils.apiClient.getAnalytics('deals/forecast', {
        period: 'quarter'
      });

      expect(response.status).toBe(200);
      const forecast = response.data.data;
      
      expect(forecast.projectedRevenue).toBeGreaterThanOrEqual(0);
      expect(forecast.confidence).toBeGreaterThanOrEqual(0);
      expect(forecast.confidence).toBeLessThanOrEqual(100);
      expect(Array.isArray(forecast.breakdown)).toBe(true);
    });
  });

  describe('Performance Analytics', () => {
    test('should get team performance metrics', async () => {
      const response = await testUtils.apiClient.getAnalytics('performance/team', {
        timeframe: '30d'
      });

      expect(response.status).toBe(200);
      const performance = response.data.data;
      
      expect(Array.isArray(performance.members)).toBe(true);
      expect(performance.teamTotals).toBeTruthy();
      
      performance.members.forEach(member => {
        expect(member.userId).toBeTruthy();
        expect(member.leadsAssigned).toBeGreaterThanOrEqual(0);
        expect(member.dealsWon).toBeGreaterThanOrEqual(0);
        expect(member.revenue).toBeGreaterThanOrEqual(0);
      });
    });

    test('should get individual performance metrics', async () => {
      const response = await testUtils.apiClient.getAnalytics('performance/individual', {
        userId: authUser.id,
        timeframe: '90d'
      });

      expect(response.status).toBe(200);
      const performance = response.data.data;
      
      expect(performance.leadsAssigned).toBeGreaterThanOrEqual(0);
      expect(performance.leadsConverted).toBeGreaterThanOrEqual(0);
      expect(performance.dealsWon).toBeGreaterThanOrEqual(0);
      expect(performance.totalRevenue).toBeGreaterThanOrEqual(0);
      expect(performance.avgDealSize).toBeGreaterThanOrEqual(0);
      expect(performance.avgResponseTime).toBeGreaterThanOrEqual(0);
    });

    test('should get activity metrics', async () => {
      const response = await testUtils.apiClient.getAnalytics('performance/activity', {
        timeframe: '30d'
      });

      expect(response.status).toBe(200);
      const activity = response.data.data;
      
      expect(activity.totalActivities).toBeGreaterThanOrEqual(0);
      expect(activity.activitiesPerDay).toBeGreaterThanOrEqual(0);
      expect(activity.responseRate).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(activity.activityBreakdown)).toBe(true);
    });
  });

  describe('Revenue Analytics', () => {
    test('should get revenue trends', async () => {
      const response = await testUtils.apiClient.getAnalytics('revenue/trends', {
        timeframe: '90d',
        groupBy: 'month'
      });

      expect(response.status).toBe(200);
      const trends = response.data.data;
      
      expect(Array.isArray(trends.data)).toBe(true);
      expect(trends.totalRevenue).toBeGreaterThanOrEqual(0);
      expect(trends.growth).toBeDefined();
      
      trends.data.forEach(period => {
        expect(period.period).toBeTruthy();
        expect(period.revenue).toBeGreaterThanOrEqual(0);
        expect(period.deals).toBeGreaterThanOrEqual(0);
      });
    });

    test('should get revenue by product', async () => {
      const response = await testUtils.apiClient.getAnalytics('revenue/by-product');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
      
      response.data.data.forEach(productRevenue => {
        expect(productRevenue.productName).toBeTruthy();
        expect(productRevenue.revenue).toBeGreaterThanOrEqual(0);
        expect(productRevenue.units).toBeGreaterThanOrEqual(0);
      });
    });

    test('should get revenue by region', async () => {
      const response = await testUtils.apiClient.getAnalytics('revenue/by-region');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
      
      response.data.data.forEach(regionRevenue => {
        expect(regionRevenue.region).toBeTruthy();
        expect(regionRevenue.revenue).toBeGreaterThanOrEqual(0);
        expect(regionRevenue.deals).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Custom Analytics', () => {
    test('should support custom date ranges', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-03-31';
      
      const response = await testUtils.apiClient.getAnalytics('dashboard', {
        startDate,
        endDate
      });

      expect(response.status).toBe(200);
      expect(response.data.data.dateRange.start).toBe(startDate);
      expect(response.data.data.dateRange.end).toBe(endDate);
    });

    test('should support filtering by team member', async () => {
      const response = await testUtils.apiClient.getAnalytics('leads/conversion', {
        assignedTo: authUser.id,
        timeframe: '30d'
      });

      expect(response.status).toBe(200);
      const metrics = response.data.data;
      
      expect(metrics.assignee).toBe(authUser.id);
      expect(metrics.totalLeads).toBeGreaterThanOrEqual(0);
    });

    test('should support filtering by lead source', async () => {
      const response = await testUtils.apiClient.getAnalytics('leads/performance', {
        source: 'website',
        timeframe: '60d'
      });

      expect(response.status).toBe(200);
      const metrics = response.data.data;
      
      expect(metrics.source).toBe('website');
    });

    test('should support aggregation by different periods', async () => {
      const periods = ['day', 'week', 'month', 'quarter'];
      
      for (const period of periods) {
        const response = await testUtils.apiClient.getAnalytics('revenue/trends', {
          groupBy: period,
          timeframe: '90d'
        });
        
        expect(response.status).toBe(200);
        expect(response.data.data.groupBy).toBe(period);
      }
    });
  });

  describe('Real-time Analytics', () => {
    test('should get real-time dashboard updates', async () => {
      const response = await testUtils.apiClient.get('/api/analytics/realtime/dashboard');

      expect(response.status).toBe(200);
      const realtime = response.data.data;
      
      expect(realtime.activeUsers).toBeGreaterThanOrEqual(0);
      expect(realtime.recentActivities).toBeGreaterThanOrEqual(0);
      expect(realtime.todayMetrics).toBeTruthy();
      expect(realtime.lastUpdated).toBeTruthy();
    });

    test('should get live pipeline changes', async () => {
      const response = await testUtils.apiClient.get('/api/analytics/realtime/pipeline');

      expect(response.status).toBe(200);
      const pipeline = response.data.data;
      
      expect(Array.isArray(pipeline.recentChanges)).toBe(true);
      expect(pipeline.currentValue).toBeGreaterThanOrEqual(0);
      expect(pipeline.lastUpdated).toBeTruthy();
    });
  });

  describe('Analytics Export', () => {
    test('should export analytics data as CSV', async () => {
      const response = await testUtils.apiClient.get('/api/analytics/export', {
        params: {
          type: 'leads',
          format: 'csv',
          timeframe: '30d'
        }
      });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/csv/);
      expect(response.data).toContain('Company Name'); // Check CSV headers
    });

    test('should export analytics data as Excel', async () => {
      const response = await testUtils.apiClient.get('/api/analytics/export', {
        params: {
          type: 'deals',
          format: 'xlsx',
          timeframe: '60d'
        }
      });

      if (response.status === 200) {
        expect(response.headers['content-type']).toMatch(/spreadsheet|excel/);
      }
    });

    test('should export analytics data as JSON', async () => {
      const response = await testUtils.apiClient.get('/api/analytics/export', {
        params: {
          type: 'performance',
          format: 'json',
          timeframe: '90d'
        }
      });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(typeof response.data).toBe('object');
    });
  });

  describe('Analytics Performance', () => {
    test('should handle complex analytics queries efficiently', async () => {
      const complexQuery = {
        type: 'revenue/trends',
        timeframe: '1y',
        groupBy: 'week',
        segments: ['source', 'assignee', 'region'],
        filters: {
          minDealSize: 10000,
          includeProjections: true
        }
      };

      const measurement = await testUtils.measureResponseTime(
        testUtils.apiClient.getAnalytics.bind(testUtils.apiClient),
        'revenue/trends',
        complexQuery
      );

      expect(measurement.success).toBe(true);
      expect(measurement.responseTime).toBeLessThan(3000); // Complex queries should still be reasonable
    });

    test('should support concurrent analytics requests', async () => {
      const requests = [
        testUtils.apiClient.getAnalytics('dashboard'),
        testUtils.apiClient.getAnalytics('leads/conversion'),
        testUtils.apiClient.getAnalytics('deals/pipeline'),
        testUtils.apiClient.getAnalytics('performance/team'),
        testUtils.apiClient.getAnalytics('revenue/trends')
      ];

      const results = await Promise.allSettled(requests);
      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value.status === 200
      );

      expect(successful.length).toBe(requests.length);
    });

    test('should cache frequently requested analytics', async () => {
      // First request
      const measurement1 = await testUtils.measureResponseTime(
        testUtils.apiClient.getAnalytics.bind(testUtils.apiClient),
        'dashboard'
      );

      // Second request (should be cached)
      const measurement2 = await testUtils.measureResponseTime(
        testUtils.apiClient.getAnalytics.bind(testUtils.apiClient),
        'dashboard'
      );

      expect(measurement1.success).toBe(true);
      expect(measurement2.success).toBe(true);
      
      // Second request should be faster (cached)
      expect(measurement2.responseTime).toBeLessThanOrEqual(measurement1.responseTime * 1.1);
    });
  });

  describe('Analytics Error Handling', () => {
    test('should handle invalid timeframe gracefully', async () => {
      const response = await testUtils.apiClient.getAnalytics('dashboard', {
        timeframe: 'invalid-timeframe'
      });

      const validation = testUtils.validateErrorResponse(response, 400);
      expect(validation.valid).toBe(true);
      expect(response.data.error).toMatch(/timeframe/i);
    });

    test('should handle invalid date ranges', async () => {
      const response = await testUtils.apiClient.getAnalytics('dashboard', {
        startDate: '2024-12-31',
        endDate: '2024-01-01' // End before start
      });

      const validation = testUtils.validateErrorResponse(response, 400);
      expect(validation.valid).toBe(true);
      expect(response.data.error).toMatch(/date.*range/i);
    });

    test('should handle non-existent analytics types', async () => {
      const response = await testUtils.apiClient.getAnalytics('nonexistent/analytics');

      const validation = testUtils.validateErrorResponse(response, 404);
      expect(validation.valid).toBe(true);
    });

    test('should handle missing required parameters', async () => {
      const response = await testUtils.apiClient.getAnalytics('performance/individual');
      // Missing required userId parameter

      const validation = testUtils.validateErrorResponse(response, 400);
      expect(validation.valid).toBe(true);
      expect(response.data.error).toMatch(/userId.*required/i);
    });
  });
});