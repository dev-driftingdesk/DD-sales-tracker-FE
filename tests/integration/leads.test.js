// Lead Management API Integration Tests
const TestUtils = require('../helpers/testUtils');

describe('Lead Management API', () => {
  let testUtils;
  let authUser;

  beforeAll(async () => {
    testUtils = new TestUtils();
    await testUtils.setup();
    
    // Create and authenticate test user
    authUser = await testUtils.createTestUser({ role: 'sales_rep' });
    await testUtils.apiClient.authenticate(authUser.email, 'TestPassword123!');
  });

  afterAll(async () => {
    await testUtils.cleanup();
  });

  describe('POST /api/leads', () => {
    test('should create lead with valid data', async () => {
      const leadData = testUtils.dataFactory.createLead({
        assignedTo: authUser.id
      });

      const response = await testUtils.apiClient.createLead(leadData);
      const validation = testUtils.validateResponse(response, 201, 'lead');

      expect(validation.valid).toBe(true);
      expect(response.data.data.companyName).toBe(leadData.companyName);
      expect(response.data.data.contactName).toBe(leadData.contactName);
      expect(response.data.data.email).toBe(leadData.email);
      expect(response.data.data.status).toBe('new'); // Default status
      expect(response.data.data.createdAt).toBeTruthy();
      
      testUtils.trackTestData('leads', response.data.data.id);
    });

    test('should create lead with minimum required fields', async () => {
      const minimalLead = {
        companyName: 'Minimal Test Corp',
        contactName: 'Min Contact',
        email: 'minimal@test.com',
        source: 'website',
        status: 'new'
      };

      const response = await testUtils.apiClient.createLead(minimalLead);
      const validation = testUtils.validateResponse(response, 201, 'lead');

      expect(validation.valid).toBe(true);
      expect(response.data.data.companyName).toBe(minimalLead.companyName);
      
      testUtils.trackTestData('leads', response.data.data.id);
    });

    test('should reject lead creation with invalid email', async () => {
      const leadData = testUtils.dataFactory.createLead({
        email: 'invalid-email-format'
      });

      const response = await testUtils.apiClient.createLead(leadData);
      const validation = testUtils.validateErrorResponse(response, 400);

      expect(validation.valid).toBe(true);
      expect(response.data.error).toContain('email');
    });

    test('should reject lead creation with invalid source', async () => {
      const leadData = testUtils.dataFactory.createLead({
        source: 'invalid_source'
      });

      const response = await testUtils.apiClient.createLead(leadData);
      const validation = testUtils.validateErrorResponse(response, 400);

      expect(validation.valid).toBe(true);
      expect(response.data.error).toContain('source');
    });

    test('should reject lead creation with invalid status', async () => {
      const leadData = testUtils.dataFactory.createLead({
        status: 'invalid_status'
      });

      const response = await testUtils.apiClient.createLead(leadData);
      const validation = testUtils.validateErrorResponse(response, 400);

      expect(validation.valid).toBe(true);
      expect(response.data.error).toContain('status');
    });

    test('should reject lead creation with negative deal value', async () => {
      const leadData = testUtils.dataFactory.createLead({
        dealValue: -1000
      });

      const response = await testUtils.apiClient.createLead(leadData);
      const validation = testUtils.validateErrorResponse(response, 400);

      expect(validation.valid).toBe(true);
      expect(response.data.error).toContain('dealValue');
    });

    test('should auto-assign current user if no assignee specified', async () => {
      const leadData = testUtils.dataFactory.createLead();
      delete leadData.assignedTo;

      const response = await testUtils.apiClient.createLead(leadData);

      expect(response.status).toBe(201);
      expect(response.data.data.assignedTo).toBe(authUser.id);
      
      testUtils.trackTestData('leads', response.data.data.id);
    });

    test('should have acceptable creation response time', async () => {
      const leadData = testUtils.dataFactory.createLead();
      const measurement = await testUtils.measureResponseTime(
        testUtils.apiClient.createLead.bind(testUtils.apiClient),
        leadData
      );

      expect(measurement.success).toBe(true);
      expect(measurement.withinThreshold).toBe(true);
    });
  });

  describe('GET /api/leads', () => {
    let testLeads;

    beforeEach(async () => {
      // Create test leads
      testLeads = [];
      for (let i = 0; i < 5; i++) {
        const lead = await testUtils.createTestLead({
          assignedTo: authUser.id,
          status: i % 2 === 0 ? 'new' : 'contacted'
        });
        testLeads.push(lead);
      }
    });

    test('should retrieve all leads', async () => {
      const response = await testUtils.apiClient.getLeads();
      const validation = testUtils.validateResponse(response, 200);

      expect(validation.valid).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
      expect(response.data.data.length).toBeGreaterThanOrEqual(testLeads.length);
    });

    test('should support pagination', async () => {
      const response = await testUtils.apiClient.getLeads({
        page: 1,
        limit: 2
      });

      expect(response.status).toBe(200);
      expect(response.data.data.length).toBeLessThanOrEqual(2);
      expect(response.data.pagination).toBeTruthy();
      expect(response.data.pagination.page).toBe(1);
      expect(response.data.pagination.limit).toBe(2);
    });

    test('should filter leads by status', async () => {
      const response = await testUtils.apiClient.getLeads({
        status: 'new'
      });

      expect(response.status).toBe(200);
      response.data.data.forEach(lead => {
        expect(lead.status).toBe('new');
      });
    });

    test('should filter leads by source', async () => {
      const response = await testUtils.apiClient.getLeads({
        source: 'website'
      });

      expect(response.status).toBe(200);
      response.data.data.forEach(lead => {
        expect(lead.source).toBe('website');
      });
    });

    test('should filter leads by assigned user', async () => {
      const response = await testUtils.apiClient.getLeads({
        assignedTo: authUser.id
      });

      expect(response.status).toBe(200);
      response.data.data.forEach(lead => {
        expect(lead.assignedTo).toBe(authUser.id);
      });
    });

    test('should support search by company name', async () => {
      const searchTerm = testLeads[0].companyName.substring(0, 5);
      const response = await testUtils.apiClient.getLeads({
        search: searchTerm
      });

      expect(response.status).toBe(200);
      expect(response.data.data.length).toBeGreaterThan(0);
    });

    test('should support search by contact name', async () => {
      const searchTerm = testLeads[0].contactName.split(' ')[0];
      const response = await testUtils.apiClient.getLeads({
        search: searchTerm
      });

      expect(response.status).toBe(200);
      expect(response.data.data.length).toBeGreaterThan(0);
    });

    test('should support search by email', async () => {
      const searchTerm = testLeads[0].email.split('@')[0];
      const response = await testUtils.apiClient.getLeads({
        search: searchTerm
      });

      expect(response.status).toBe(200);
      expect(response.data.data.length).toBeGreaterThan(0);
    });

    test('should support sorting by creation date', async () => {
      const response = await testUtils.apiClient.getLeads({
        sort: 'createdAt',
        order: 'desc'
      });

      expect(response.status).toBe(200);
      
      // Check if sorted correctly
      for (let i = 1; i < response.data.data.length; i++) {
        const current = new Date(response.data.data[i].createdAt);
        const previous = new Date(response.data.data[i-1].createdAt);
        expect(current.getTime()).toBeLessThanOrEqual(previous.getTime());
      }
    });

    test('should support sorting by deal value', async () => {
      const response = await testUtils.apiClient.getLeads({
        sort: 'dealValue',
        order: 'desc'
      });

      expect(response.status).toBe(200);
      
      // Check if sorted correctly
      for (let i = 1; i < response.data.data.length; i++) {
        expect(response.data.data[i].dealValue).toBeLessThanOrEqual(response.data.data[i-1].dealValue);
      }
    });

    test('should have acceptable retrieval response time', async () => {
      const measurement = await testUtils.measureResponseTime(
        testUtils.apiClient.getLeads.bind(testUtils.apiClient)
      );

      expect(measurement.success).toBe(true);
      expect(measurement.withinThreshold).toBe(true);
    });
  });

  describe('GET /api/leads/:id', () => {
    let testLead;

    beforeEach(async () => {
      testLead = await testUtils.createTestLead({ assignedTo: authUser.id });
    });

    test('should retrieve lead by valid ID', async () => {
      const response = await testUtils.apiClient.getLead(testLead.id);
      const validation = testUtils.validateResponse(response, 200, 'lead');

      expect(validation.valid).toBe(true);
      expect(response.data.data.id).toBe(testLead.id);
      expect(response.data.data.companyName).toBe(testLead.companyName);
      expect(response.data.data.activities).toBeTruthy();
    });

    test('should return 404 for non-existent lead ID', async () => {
      const response = await testUtils.apiClient.getLead('non-existent-id');
      const validation = testUtils.validateErrorResponse(response, 404);

      expect(validation.valid).toBe(true);
    });

    test('should return 400 for invalid lead ID format', async () => {
      const response = await testUtils.apiClient.getLead('invalid-id-format');
      const validation = testUtils.validateErrorResponse(response, 400);

      expect(validation.valid).toBe(true);
    });

    test('should include lead activities in response', async () => {
      const response = await testUtils.apiClient.getLead(testLead.id);

      expect(response.status).toBe(200);
      expect(response.data.data.activities).toBeDefined();
      expect(Array.isArray(response.data.data.activities)).toBe(true);
    });
  });

  describe('PATCH /api/leads/:id', () => {
    let testLead;

    beforeEach(async () => {
      testLead = await testUtils.createTestLead({ assignedTo: authUser.id });
    });

    test('should update lead with valid data', async () => {
      const updates = {
        status: 'qualified',
        notes: 'Updated notes for lead',
        dealValue: 15000
      };

      const response = await testUtils.apiClient.updateLead(testLead.id, updates);
      const validation = testUtils.validateResponse(response, 200, 'lead');

      expect(validation.valid).toBe(true);
      expect(response.data.data.status).toBe(updates.status);
      expect(response.data.data.notes).toBe(updates.notes);
      expect(response.data.data.dealValue).toBe(updates.dealValue);
      expect(response.data.data.updatedAt).not.toBe(testLead.updatedAt);
    });

    test('should update only specified fields', async () => {
      const originalCompanyName = testLead.companyName;
      const updates = { status: 'contacted' };

      const response = await testUtils.apiClient.updateLead(testLead.id, updates);

      expect(response.status).toBe(200);
      expect(response.data.data.status).toBe(updates.status);
      expect(response.data.data.companyName).toBe(originalCompanyName);
    });

    test('should reject updates with invalid status', async () => {
      const updates = { status: 'invalid_status' };

      const response = await testUtils.apiClient.updateLead(testLead.id, updates);
      const validation = testUtils.validateErrorResponse(response, 400);

      expect(validation.valid).toBe(true);
      expect(response.data.error).toContain('status');
    });

    test('should reject updates with invalid email', async () => {
      const updates = { email: 'invalid-email' };

      const response = await testUtils.apiClient.updateLead(testLead.id, updates);
      const validation = testUtils.validateErrorResponse(response, 400);

      expect(validation.valid).toBe(true);
      expect(response.data.error).toContain('email');
    });

    test('should reject updates with negative deal value', async () => {
      const updates = { dealValue: -5000 };

      const response = await testUtils.apiClient.updateLead(testLead.id, updates);
      const validation = testUtils.validateErrorResponse(response, 400);

      expect(validation.valid).toBe(true);
      expect(response.data.error).toContain('dealValue');
    });

    test('should set closed date when status changes to won', async () => {
      const updates = { 
        status: 'won',
        closedValue: 12000
      };

      const response = await testUtils.apiClient.updateLead(testLead.id, updates);

      expect(response.status).toBe(200);
      expect(response.data.data.status).toBe('won');
      expect(response.data.data.closedValue).toBe(12000);
      expect(response.data.data.closedDate).toBeTruthy();
    });

    test('should set closed date when status changes to lost', async () => {
      const updates = { status: 'lost' };

      const response = await testUtils.apiClient.updateLead(testLead.id, updates);

      expect(response.status).toBe(200);
      expect(response.data.data.status).toBe('lost');
      expect(response.data.data.closedDate).toBeTruthy();
    });

    test('should return 404 for non-existent lead ID', async () => {
      const updates = { status: 'contacted' };
      const response = await testUtils.apiClient.updateLead('non-existent-id', updates);
      const validation = testUtils.validateErrorResponse(response, 404);

      expect(validation.valid).toBe(true);
    });
  });

  describe('DELETE /api/leads/:id', () => {
    let testLead;

    beforeEach(async () => {
      testLead = await testUtils.createTestLead({ assignedTo: authUser.id });
    });

    test('should delete lead with valid ID', async () => {
      const response = await testUtils.apiClient.deleteLead(testLead.id);

      expect(response.status).toBe(204);

      // Verify lead is deleted
      const getResponse = await testUtils.apiClient.getLead(testLead.id);
      expect(getResponse.status).toBe(404);
    });

    test('should return 404 for non-existent lead ID', async () => {
      const response = await testUtils.apiClient.deleteLead('non-existent-id');
      const validation = testUtils.validateErrorResponse(response, 404);

      expect(validation.valid).toBe(true);
    });

    test('should return 400 for invalid lead ID format', async () => {
      const response = await testUtils.apiClient.deleteLead('invalid-id');
      const validation = testUtils.validateErrorResponse(response, 400);

      expect(validation.valid).toBe(true);
    });
  });

  describe('PATCH /api/leads/:id/assign', () => {
    let testLead;
    let assigneeUser;

    beforeEach(async () => {
      testLead = await testUtils.createTestLead({ assignedTo: authUser.id });
      assigneeUser = await testUtils.createTestUser({ role: 'sales_rep' });
    });

    test('should assign lead to valid user', async () => {
      const response = await testUtils.apiClient.assignLead(testLead.id, assigneeUser.id);
      const validation = testUtils.validateResponse(response, 200, 'lead');

      expect(validation.valid).toBe(true);
      expect(response.data.data.assignedTo).toBe(assigneeUser.id);
    });

    test('should create activity log when lead is assigned', async () => {
      await testUtils.apiClient.assignLead(testLead.id, assigneeUser.id);
      
      const activitiesResponse = await testUtils.apiClient.getLeadActivities(testLead.id);
      expect(activitiesResponse.status).toBe(200);
      
      const assignmentActivity = activitiesResponse.data.data.find(
        activity => activity.type === 'assignment'
      );
      expect(assignmentActivity).toBeTruthy();
    });

    test('should reject assignment to non-existent user', async () => {
      const response = await testUtils.apiClient.assignLead(testLead.id, 'non-existent-user');
      const validation = testUtils.validateErrorResponse(response, 400);

      expect(validation.valid).toBe(true);
      expect(response.data.error).toContain('user');
    });

    test('should reject assignment for non-existent lead', async () => {
      const response = await testUtils.apiClient.assignLead('non-existent-lead', assigneeUser.id);
      const validation = testUtils.validateErrorResponse(response, 404);

      expect(validation.valid).toBe(true);
    });
  });

  describe('Lead Activities API', () => {
    let testLead;

    beforeEach(async () => {
      testLead = await testUtils.createTestLead({ assignedTo: authUser.id });
    });

    describe('POST /api/leads/:id/activities', () => {
      test('should add activity to lead', async () => {
        const activityData = {
          type: 'call',
          title: 'Follow-up call',
          description: 'Discussed product requirements',
          outcome: 'positive',
          duration: 30
        };

        const response = await testUtils.apiClient.addLeadActivity(testLead.id, activityData);
        const validation = testUtils.validateResponse(response, 201, 'activity');

        expect(validation.valid).toBe(true);
        expect(response.data.data.type).toBe(activityData.type);
        expect(response.data.data.title).toBe(activityData.title);
        expect(response.data.data.userId).toBe(authUser.id);
      });

      test('should reject activity with invalid type', async () => {
        const activityData = {
          type: 'invalid_type',
          description: 'Test activity'
        };

        const response = await testUtils.apiClient.addLeadActivity(testLead.id, activityData);
        const validation = testUtils.validateErrorResponse(response, 400);

        expect(validation.valid).toBe(true);
        expect(response.data.error).toContain('type');
      });

      test('should reject activity with negative duration', async () => {
        const activityData = {
          type: 'call',
          description: 'Test call',
          duration: -10
        };

        const response = await testUtils.apiClient.addLeadActivity(testLead.id, activityData);
        const validation = testUtils.validateErrorResponse(response, 400);

        expect(validation.valid).toBe(true);
        expect(response.data.error).toContain('duration');
      });
    });

    describe('GET /api/leads/:id/activities', () => {
      beforeEach(async () => {
        // Add some activities
        const activities = [
          { type: 'call', description: 'Initial call', duration: 15 },
          { type: 'email', description: 'Follow-up email' },
          { type: 'meeting', description: 'Product demo', duration: 60 }
        ];

        for (const activity of activities) {
          await testUtils.apiClient.addLeadActivity(testLead.id, activity);
        }
      });

      test('should retrieve all activities for lead', async () => {
        const response = await testUtils.apiClient.getLeadActivities(testLead.id);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.data.data)).toBe(true);
        expect(response.data.data.length).toBeGreaterThan(0);
      });

      test('should sort activities by creation date (newest first)', async () => {
        const response = await testUtils.apiClient.getLeadActivities(testLead.id);

        expect(response.status).toBe(200);
        
        for (let i = 1; i < response.data.data.length; i++) {
          const current = new Date(response.data.data[i].createdAt);
          const previous = new Date(response.data.data[i-1].createdAt);
          expect(current.getTime()).toBeLessThanOrEqual(previous.getTime());
        }
      });

      test('should filter activities by type', async () => {
        const response = await testUtils.apiClient.getLeadActivities(testLead.id, { type: 'call' });

        expect(response.status).toBe(200);
        response.data.data.forEach(activity => {
          expect(activity.type).toBe('call');
        });
      });
    });
  });

  describe('Lead Bulk Operations', () => {
    let testLeads;

    beforeEach(async () => {
      testLeads = [];
      for (let i = 0; i < 3; i++) {
        const lead = await testUtils.createTestLead({ assignedTo: authUser.id });
        testLeads.push(lead);
      }
    });

    test('should bulk update lead statuses', async () => {
      const leadIds = testLeads.map(lead => lead.id);
      const updates = { status: 'qualified' };

      const response = await testUtils.apiClient.patch('/api/leads/bulk', {
        ids: leadIds,
        updates
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.updatedCount).toBe(testLeads.length);
    });

    test('should bulk delete leads', async () => {
      const leadIds = testLeads.map(lead => lead.id);

      const response = await testUtils.apiClient.delete('/api/leads/bulk', {
        data: { ids: leadIds }
      });

      expect(response.status).toBe(200);
      expect(response.data.data.deletedCount).toBe(testLeads.length);
    });
  });

  describe('Lead Analytics Integration', () => {
    let testLeads;

    beforeEach(async () => {
      // Create leads with different statuses for analytics
      const statuses = ['new', 'contacted', 'qualified', 'won', 'lost'];
      testLeads = [];
      
      for (let i = 0; i < 10; i++) {
        const lead = await testUtils.createTestLead({
          assignedTo: authUser.id,
          status: statuses[i % statuses.length],
          dealValue: (i + 1) * 1000
        });
        testLeads.push(lead);
      }
    });

    test('should calculate conversion metrics', async () => {
      const response = await testUtils.apiClient.getAnalytics('leads/conversion');

      expect(response.status).toBe(200);
      expect(response.data.data.totalLeads).toBeGreaterThan(0);
      expect(response.data.data.conversionRate).toBeDefined();
      expect(typeof response.data.data.conversionRate).toBe('number');
    });

    test('should calculate source performance', async () => {
      const response = await testUtils.apiClient.getAnalytics('leads/sources');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
      expect(response.data.data.length).toBeGreaterThan(0);
    });

    test('should calculate lead aging metrics', async () => {
      const response = await testUtils.apiClient.getAnalytics('leads/aging');

      expect(response.status).toBe(200);
      expect(response.data.data.averageAge).toBeDefined();
      expect(response.data.data.ageDistribution).toBeDefined();
    });
  });

  describe('Performance Tests', () => {
    test('should handle concurrent lead creation', async () => {
      const concurrency = 10;
      const leadPromises = [];

      for (let i = 0; i < concurrency; i++) {
        const leadData = testUtils.dataFactory.createLead({ assignedTo: authUser.id });
        leadPromises.push(testUtils.apiClient.createLead(leadData));
      }

      const results = await Promise.allSettled(leadPromises);
      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value.status === 201
      );

      expect(successful.length).toBe(concurrency);
      
      // Track created leads for cleanup
      successful.forEach(result => {
        testUtils.trackTestData('leads', result.value.data.data.id);
      });
    });

    test('should handle large lead list retrieval efficiently', async () => {
      const measurement = await testUtils.measureResponseTime(
        testUtils.apiClient.getLeads.bind(testUtils.apiClient),
        { limit: 100 }
      );

      expect(measurement.success).toBe(true);
      expect(measurement.responseTime).toBeLessThan(1000); // Should handle 100 leads in <1s
    });
  });
});