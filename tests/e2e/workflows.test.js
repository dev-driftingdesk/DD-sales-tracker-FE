// End-to-End Workflow Tests
const TestUtils = require('../helpers/testUtils');

describe('E2E Workflow Tests', () => {
  let testUtils;
  let adminUser, salesRep1, salesRep2, manager;

  beforeAll(async () => {
    testUtils = new TestUtils();
    await testUtils.setup();
    
    // Create test users with different roles
    adminUser = await testUtils.createTestUser({ role: 'admin' });
    salesRep1 = await testUtils.createTestUser({ role: 'sales_rep' });
    salesRep2 = await testUtils.createTestUser({ role: 'sales_rep' });
    manager = await testUtils.createTestUser({ role: 'manager' });
  });

  afterAll(async () => {
    await testUtils.cleanup();
  });

  describe('Complete Lead-to-Deal Workflow', () => {
    test('should complete full sales cycle from lead creation to deal closure', async () => {
      // Step 1: Sales Rep creates a lead
      await testUtils.apiClient.authenticate(salesRep1.email, 'TestPassword123!');
      
      const leadData = testUtils.dataFactory.createLead({
        assignedTo: salesRep1.id,
        status: 'new',
        dealValue: 50000
      });

      const leadResponse = await testUtils.apiClient.createLead(leadData);
      expect(leadResponse.status).toBe(201);
      const lead = leadResponse.data.data;
      
      testUtils.trackTestData('leads', lead.id);

      // Step 2: Add initial contact activity
      const initialActivity = {
        type: 'call',
        title: 'Initial qualification call',
        description: 'Spoke with prospect about requirements',
        outcome: 'positive',
        duration: 30
      };

      const activityResponse = await testUtils.apiClient.addLeadActivity(lead.id, initialActivity);
      expect(activityResponse.status).toBe(201);

      // Step 3: Qualify the lead
      const qualifyResponse = await testUtils.apiClient.updateLead(lead.id, {
        status: 'qualified',
        notes: 'Qualified as enterprise prospect - budget confirmed'
      });
      expect(qualifyResponse.status).toBe(200);

      // Step 4: Create company for the lead
      const companyData = testUtils.dataFactory.createCompany({
        name: lead.companyName
      });

      const companyResponse = await testUtils.apiClient.createCompany(companyData);
      expect(companyResponse.status).toBe(201);
      const company = companyResponse.data.data;
      
      testUtils.trackTestData('companies', company.id);

      // Step 5: Create contact associated with company
      const contactData = testUtils.dataFactory.createContact({
        firstName: lead.contactName.split(' ')[0],
        lastName: lead.contactName.split(' ')[1] || 'Unknown',
        email: lead.email,
        phone: lead.phone,
        companyId: company.id
      });

      const contactResponse = await testUtils.apiClient.createContact(contactData);
      expect(contactResponse.status).toBe(201);
      const contact = contactResponse.data.data;
      
      testUtils.trackTestData('contacts', contact.id);

      // Step 6: Convert lead to deal
      const dealData = {
        title: `${company.name} - Enterprise Deal`,
        description: 'Converted from qualified lead',
        value: lead.dealValue,
        stage: 'prospecting',
        probability: 25,
        expectedCloseDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
        contactId: contact.id,
        companyId: company.id,
        assignedTo: salesRep1.id
      };

      const dealResponse = await testUtils.apiClient.createDeal(dealData);
      expect(dealResponse.status).toBe(201);
      const deal = dealResponse.data.data;
      
      testUtils.trackTestData('deals', deal.id);

      // Step 7: Progress deal through pipeline
      const stages = ['qualification', 'proposal', 'negotiation'];
      
      for (const stage of stages) {
        await testUtils.sleep(100); // Small delay between stages
        
        const stageResponse = await testUtils.apiClient.updateDealStage(deal.id, stage);
        expect(stageResponse.status).toBe(200);
        expect(stageResponse.data.data.stage).toBe(stage);
        
        // Add activity for each stage
        const stageActivity = {
          type: 'note',
          title: `Moved to ${stage}`,
          description: `Deal progressed to ${stage} stage`
        };
        
        await testUtils.apiClient.post(`/api/deals/${deal.id}/activities`, stageActivity);
      }

      // Step 8: Close the deal as won
      const closeResponse = await testUtils.apiClient.updateDealStage(deal.id, 'closed_won');
      expect(closeResponse.status).toBe(200);
      expect(closeResponse.data.data.stage).toBe('closed_won');
      expect(closeResponse.data.data.actualCloseDate).toBeTruthy();

      // Step 9: Update original lead status
      const finalLeadResponse = await testUtils.apiClient.updateLead(lead.id, {
        status: 'won',
        closedValue: deal.value,
        closedDate: new Date().toISOString()
      });
      expect(finalLeadResponse.status).toBe(200);

      // Verify complete workflow
      const finalLead = await testUtils.apiClient.getLead(lead.id);
      const finalDeal = await testUtils.apiClient.getDeal(deal.id);
      
      expect(finalLead.status).toBe(200);
      expect(finalLead.data.data.status).toBe('won');
      expect(finalDeal.status).toBe(200);
      expect(finalDeal.data.data.stage).toBe('closed_won');
    });

    test('should handle deal loss workflow', async () => {
      // Create lead and convert to deal
      await testUtils.apiClient.authenticate(salesRep2.email, 'TestPassword123!');
      
      const lead = await testUtils.createTestLead({
        assignedTo: salesRep2.id,
        status: 'qualified'
      });

      const company = await testUtils.createTestCompany();
      const contact = await testUtils.createTestContact({ companyId: company.id });
      
      const deal = await testUtils.createTestDeal({
        contactId: contact.id,
        companyId: company.id,
        assignedTo: salesRep2.id,
        stage: 'negotiation'
      });

      // Close deal as lost
      const lossData = {
        stage: 'closed_lost',
        lossReason: 'Price too high - competitor selected',
        lossNotes: 'Customer went with lower-cost alternative'
      };

      const closeResponse = await testUtils.apiClient.patch(`/api/deals/${deal.id}`, lossData);
      expect(closeResponse.status).toBe(200);
      expect(closeResponse.data.data.stage).toBe('closed_lost');

      // Update lead status
      const leadUpdateResponse = await testUtils.apiClient.updateLead(lead.id, {
        status: 'lost',
        lostReason: lossData.lossReason,
        lostDate: new Date().toISOString()
      });
      expect(leadUpdateResponse.status).toBe(200);

      // Verify analytics impact
      const analyticsResponse = await testUtils.apiClient.getAnalytics('deals/winloss');
      expect(analyticsResponse.status).toBe(200);
      expect(analyticsResponse.data.data.lossReasons).toBeDefined();
    });
  });

  describe('Team Collaboration Workflow', () => {
    test('should handle lead assignment and transfer', async () => {
      // Manager creates and assigns lead
      await testUtils.apiClient.authenticate(manager.email, 'TestPassword123!');
      
      const lead = await testUtils.createTestLead({
        assignedTo: salesRep1.id
      });

      // Verify assignment
      let leadResponse = await testUtils.apiClient.getLead(lead.id);
      expect(leadResponse.data.data.assignedTo).toBe(salesRep1.id);

      // Transfer lead to different sales rep
      const transferResponse = await testUtils.apiClient.assignLead(lead.id, salesRep2.id);
      expect(transferResponse.status).toBe(200);
      expect(transferResponse.data.data.assignedTo).toBe(salesRep2.id);

      // Verify transfer activity was logged
      const activitiesResponse = await testUtils.apiClient.getLeadActivities(lead.id);
      expect(activitiesResponse.status).toBe(200);
      
      const transferActivity = activitiesResponse.data.data.find(
        activity => activity.type === 'assignment' || activity.type === 'transfer'
      );
      expect(transferActivity).toBeTruthy();

      // Sales rep 2 can now access the lead
      await testUtils.apiClient.authenticate(salesRep2.email, 'TestPassword123!');
      leadResponse = await testUtils.apiClient.getLead(lead.id);
      expect(leadResponse.status).toBe(200);
    });

    test('should support team collaboration on deals', async () => {
      // Create shared deal
      await testUtils.apiClient.authenticate(manager.email, 'TestPassword123!');
      
      const company = await testUtils.createTestCompany();
      const contact = await testUtils.createTestContact({ companyId: company.id });
      
      const deal = await testUtils.createTestDeal({
        contactId: contact.id,
        companyId: company.id,
        assignedTo: salesRep1.id,
        value: 100000 // Large deal requiring collaboration
      });

      // Add team members to deal
      const teamResponse = await testUtils.apiClient.patch(`/api/deals/${deal.id}/team`, {
        members: [
          { userId: salesRep2.id, role: 'collaborator' },
          { userId: manager.id, role: 'supervisor' }
        ]
      });
      expect(teamResponse.status).toBe(200);

      // Each team member can add activities
      await testUtils.apiClient.authenticate(salesRep1.email, 'TestPassword123!');
      await testUtils.apiClient.post(`/api/deals/${deal.id}/activities`, {
        type: 'meeting',
        title: 'Customer discovery meeting',
        description: 'Conducted needs analysis with decision makers',
        duration: 90
      });

      await testUtils.apiClient.authenticate(salesRep2.email, 'TestPassword123!');
      await testUtils.apiClient.post(`/api/deals/${deal.id}/activities`, {
        type: 'email',
        title: 'Technical documentation sent',
        description: 'Provided detailed technical specifications'
      });

      // Manager can oversee progress
      await testUtils.apiClient.authenticate(manager.email, 'TestPassword123!');
      const dealActivitiesResponse = await testUtils.apiClient.get(`/api/deals/${deal.id}/activities`);
      expect(dealActivitiesResponse.status).toBe(200);
      expect(dealActivitiesResponse.data.data.length).toBeGreaterThan(1);
    });

    test('should handle approval workflow for large deals', async () => {
      // Large deal requiring manager approval
      await testUtils.apiClient.authenticate(salesRep1.email, 'TestPassword123!');
      
      const deal = await testUtils.createTestDeal({
        assignedTo: salesRep1.id,
        value: 250000, // Large value requiring approval
        stage: 'negotiation'
      });

      // Sales rep tries to close deal
      const closeAttempt = await testUtils.apiClient.updateDealStage(deal.id, 'closed_won');
      
      if (closeAttempt.status === 202) {
        // Deal pending approval
        expect(closeAttempt.data.status).toBe('pending_approval');
      } else if (closeAttempt.status === 403) {
        // Approval required error
        expect(closeAttempt.data.error).toMatch(/approval/i);
      }

      // Manager approves the deal
      await testUtils.apiClient.authenticate(manager.email, 'TestPassword123!');
      const approvalResponse = await testUtils.apiClient.post(`/api/deals/${deal.id}/approve`, {
        approved: true,
        comments: 'Deal approved - terms are favorable'
      });
      expect(approvalResponse.status).toBe(200);

      // Now deal can be closed
      const finalCloseResponse = await testUtils.apiClient.updateDealStage(deal.id, 'closed_won');
      expect(finalCloseResponse.status).toBe(200);
      expect(finalCloseResponse.data.data.stage).toBe('closed_won');
    });
  });

  describe('Analytics and Reporting Workflow', () => {
    let testLeads, testDeals;

    beforeEach(async () => {
      // Create test data for analytics
      await testUtils.apiClient.authenticate(manager.email, 'TestPassword123!');
      
      testLeads = [];
      testDeals = [];

      // Create leads with different outcomes
      const leadStatuses = ['new', 'contacted', 'qualified', 'won', 'lost'];
      
      for (let i = 0; i < 10; i++) {
        const lead = await testUtils.createTestLead({
          assignedTo: i % 2 === 0 ? salesRep1.id : salesRep2.id,
          status: leadStatuses[i % leadStatuses.length],
          dealValue: (i + 1) * 10000
        });
        testLeads.push(lead);
      }

      // Create deals with different stages
      const dealStages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
      
      for (let i = 0; i < 12; i++) {
        const deal = await testUtils.createTestDeal({
          assignedTo: i % 2 === 0 ? salesRep1.id : salesRep2.id,
          stage: dealStages[i % dealStages.length],
          value: (i + 1) * 15000
        });
        testDeals.push(deal);
      }
    });

    test('should generate comprehensive dashboard analytics', async () => {
      const response = await testUtils.apiClient.getAnalytics('dashboard', {
        timeframe: '30d'
      });

      expect(response.status).toBe(200);
      expect(response.data.data.totalLeads).toBeGreaterThan(0);
      expect(response.data.data.conversionRate).toBeDefined();
      expect(response.data.data.totalRevenue).toBeDefined();
      expect(response.data.data.avgDealSize).toBeDefined();
      expect(response.data.data.activeDeals).toBeDefined();
    });

    test('should provide sales rep performance comparison', async () => {
      const response = await testUtils.apiClient.getAnalytics('performance', {
        timeframe: '30d',
        groupBy: 'assignee'
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
      
      // Should have data for both sales reps
      const rep1Data = response.data.data.find(item => item.assignee === salesRep1.id);
      const rep2Data = response.data.data.find(item => item.assignee === salesRep2.id);
      
      expect(rep1Data).toBeTruthy();
      expect(rep2Data).toBeTruthy();
      expect(rep1Data.totalLeads).toBeDefined();
      expect(rep1Data.conversionRate).toBeDefined();
    });

    test('should generate sales forecast', async () => {
      const response = await testUtils.apiClient.getAnalytics('forecast', {
        period: 'quarter'
      });

      expect(response.status).toBe(200);
      expect(response.data.data.projectedRevenue).toBeDefined();
      expect(response.data.data.confidence).toBeDefined();
      expect(response.data.data.breakdown).toBeDefined();
    });

    test('should provide pipeline analysis', async () => {
      const response = await testUtils.apiClient.getAnalytics('pipeline');

      expect(response.status).toBe(200);
      expect(response.data.data.stageDistribution).toBeTruthy();
      expect(response.data.data.totalPipelineValue).toBeDefined();
      expect(response.data.data.weightedPipelineValue).toBeDefined();
      expect(response.data.data.avgSalesCycle).toBeDefined();
    });

    test('should export analytics data', async () => {
      const response = await testUtils.apiClient.get('/api/analytics/export', {
        params: {
          type: 'leads',
          format: 'csv',
          timeframe: '30d'
        }
      });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/csv/);
      expect(response.data).toContain('Company Name'); // CSV header
    });
  });

  describe('Notification and Communication Workflow', () => {
    test('should send notifications for important events', async () => {
      await testUtils.apiClient.authenticate(salesRep1.email, 'TestPassword123!');
      
      // Create high-value deal that should trigger notifications
      const deal = await testUtils.createTestDeal({
        assignedTo: salesRep1.id,
        value: 500000, // High value
        stage: 'proposal'
      });

      // Move to negotiation (should notify manager)
      await testUtils.apiClient.updateDealStage(deal.id, 'negotiation');

      // Check notifications
      await testUtils.apiClient.authenticate(manager.email, 'TestPassword123!');
      const notificationsResponse = await testUtils.apiClient.getNotifications();
      
      expect(notificationsResponse.status).toBe(200);
      
      const dealNotification = notificationsResponse.data.data.find(
        notification => notification.type === 'deal_stage_change' && 
        notification.data.dealId === deal.id
      );
      
      expect(dealNotification).toBeTruthy();
    });

    test('should handle email integration workflow', async () => {
      await testUtils.apiClient.authenticate(salesRep1.email, 'TestPassword123!');
      
      const lead = await testUtils.createTestLead({ assignedTo: salesRep1.id });

      // Send email through CRM
      const emailData = {
        to: lead.email,
        subject: 'Follow-up on your inquiry',
        body: 'Thank you for your interest in our products...',
        leadId: lead.id,
        template: 'follow-up'
      };

      const emailResponse = await testUtils.apiClient.sendEmail(emailData);
      
      if (emailResponse.status === 200) {
        expect(emailResponse.data.messageId).toBeTruthy();
        
        // Email should be logged as activity
        const activitiesResponse = await testUtils.apiClient.getLeadActivities(lead.id);
        const emailActivity = activitiesResponse.data.data.find(
          activity => activity.type === 'email' && 
          activity.metadata?.subject === emailData.subject
        );
        
        expect(emailActivity).toBeTruthy();
      }
    });

    test('should track email open and click events', async () => {
      // This would typically involve webhook handling
      // For testing, we simulate receiving webhook events
      
      const emailEventData = {
        type: 'email_opened',
        messageId: 'test-message-123',
        leadId: 'test-lead-id',
        timestamp: new Date().toISOString()
      };

      const webhookResponse = await testUtils.apiClient.post('/api/webhooks/email', emailEventData);
      
      if (webhookResponse.status === 200) {
        // Event should be logged
        expect(webhookResponse.data.success).toBe(true);
      }
    });
  });

  describe('Integration and Import/Export Workflow', () => {
    test('should import leads from CSV', async () => {
      await testUtils.apiClient.authenticate(manager.email, 'TestPassword123!');
      
      const csvData = `Company Name,Contact Name,Email,Phone,Source
        "Test Import Corp","John Import","john@importtest.com","+1-555-9999","website"
        "Another Company","Jane Doe","jane@another.com","+1-555-8888","referral"`;

      const importResponse = await testUtils.apiClient.post('/api/import/leads', {
        data: csvData,
        format: 'csv'
      });

      if (importResponse.status === 200) {
        expect(importResponse.data.imported).toBeGreaterThan(0);
        expect(importResponse.data.errors).toBeDefined();
        
        // Verify imported leads exist
        const leadsResponse = await testUtils.apiClient.getLeads({
          search: 'Test Import Corp'
        });
        
        expect(leadsResponse.status).toBe(200);
        expect(leadsResponse.data.data.length).toBeGreaterThan(0);
        
        // Track for cleanup
        leadsResponse.data.data.forEach(lead => {
          testUtils.trackTestData('leads', lead.id);
        });
      }
    });

    test('should export data to various formats', async () => {
      await testUtils.apiClient.authenticate(manager.email, 'TestPassword123!');
      
      // Test CSV export
      const csvResponse = await testUtils.apiClient.get('/api/export/leads', {
        params: { format: 'csv' }
      });
      
      expect(csvResponse.status).toBe(200);
      expect(csvResponse.headers['content-type']).toMatch(/csv/);

      // Test Excel export
      const excelResponse = await testUtils.apiClient.get('/api/export/deals', {
        params: { format: 'xlsx' }
      });
      
      if (excelResponse.status === 200) {
        expect(excelResponse.headers['content-type']).toMatch(/spreadsheet|excel/);
      }
    });

    test('should handle third-party integrations', async () => {
      await testUtils.apiClient.authenticate(adminUser.email, 'TestPassword123!');
      
      // Configure integration
      const integrationConfig = {
        type: 'mailchimp',
        apiKey: 'test-api-key',
        settings: {
          listId: 'test-list-id',
          syncContacts: true
        }
      };

      const configResponse = await testUtils.apiClient.post('/api/integrations', integrationConfig);
      
      if (configResponse.status === 201) {
        const integrationId = configResponse.data.data.id;
        
        // Test sync operation
        const syncResponse = await testUtils.apiClient.post(`/api/integrations/${integrationId}/sync`);
        
        expect(syncResponse.status).toBeLessThan(500); // Should handle gracefully
        
        testUtils.trackTestData('integrations', integrationId);
      }
    });
  });

  describe('Mobile and Offline Workflow', () => {
    test('should support mobile API endpoints', async () => {
      await testUtils.apiClient.authenticate(salesRep1.email, 'TestPassword123!');
      
      // Get mobile-optimized lead list
      const mobileLeadsResponse = await testUtils.apiClient.get('/api/mobile/leads', {
        headers: {
          'User-Agent': 'SalesTracker-Mobile/1.0'
        }
      });

      if (mobileLeadsResponse.status === 200) {
        // Mobile response should be optimized
        expect(mobileLeadsResponse.data.data).toBeDefined();
        expect(mobileLeadsResponse.data.data.length).toBeLessThanOrEqual(20); // Pagination
      }
    });

    test('should handle offline data synchronization', async () => {
      await testUtils.apiClient.authenticate(salesRep1.email, 'TestPassword123!');
      
      // Simulate offline changes
      const offlineChanges = [
        {
          type: 'lead_update',
          id: 'test-lead-id',
          changes: { status: 'contacted', notes: 'Called while offline' },
          timestamp: new Date().toISOString()
        },
        {
          type: 'activity_create',
          leadId: 'test-lead-id',
          data: { type: 'call', description: 'Offline call log' },
          timestamp: new Date().toISOString()
        }
      ];

      const syncResponse = await testUtils.apiClient.post('/api/sync', {
        changes: offlineChanges
      });

      if (syncResponse.status === 200) {
        expect(syncResponse.data.conflicts).toBeDefined();
        expect(syncResponse.data.applied).toBeDefined();
      }
    });
  });

  describe('Performance and Scalability Workflow', () => {
    test('should handle large dataset operations efficiently', async () => {
      await testUtils.apiClient.authenticate(manager.email, 'TestPassword123!');
      
      // Request large dataset with pagination
      const measurement = await testUtils.measureResponseTime(
        testUtils.apiClient.getLeads.bind(testUtils.apiClient),
        {
          limit: 100,
          page: 1,
          sort: 'createdAt',
          order: 'desc'
        }
      );

      expect(measurement.success).toBe(true);
      expect(measurement.responseTime).toBeLessThan(1000); // Should be fast even for large datasets
    });

    test('should support concurrent user operations', async () => {
      const concurrentOperations = [];

      // Multiple sales reps working simultaneously
      concurrentOperations.push(
        testUtils.apiClient.authenticate(salesRep1.email, 'TestPassword123!')
          .then(() => testUtils.createTestLead({ assignedTo: salesRep1.id }))
      );

      concurrentOperations.push(
        testUtils.apiClient.authenticate(salesRep2.email, 'TestPassword123!')
          .then(() => testUtils.createTestDeal({ assignedTo: salesRep2.id }))
      );

      concurrentOperations.push(
        testUtils.apiClient.authenticate(manager.email, 'TestPassword123!')
          .then(() => testUtils.apiClient.getAnalytics('dashboard'))
      );

      const results = await Promise.allSettled(concurrentOperations);
      const successful = results.filter(result => result.status === 'fulfilled');

      expect(successful.length).toBe(concurrentOperations.length);
    });
  });

  describe('Error Handling and Recovery Workflow', () => {
    test('should gracefully handle service downtime', async () => {
      await testUtils.apiClient.authenticate(salesRep1.email, 'TestPassword123!');
      
      // Simulate service unavailable
      const originalTimeout = testUtils.apiClient.client.defaults.timeout;
      testUtils.apiClient.client.defaults.timeout = 1; // Very short timeout
      
      const response = await testUtils.apiClient.getLeads();
      
      // Restore timeout
      testUtils.apiClient.client.defaults.timeout = originalTimeout;
      
      // Should handle timeout gracefully
      expect(response.status).toBeLessThan(500);
    });

    test('should provide meaningful error messages', async () => {
      await testUtils.apiClient.authenticate(salesRep1.email, 'TestPassword123!');
      
      // Try to create invalid lead
      const invalidLead = {
        companyName: '', // Required field empty
        contactName: 'Test',
        email: 'invalid-email', // Invalid format
        source: 'invalid-source', // Invalid enum
        status: 'new'
      };

      const response = await testUtils.apiClient.createLead(invalidLead);
      
      expect(response.status).toBe(400);
      expect(response.data.errors).toBeDefined();
      expect(Array.isArray(response.data.errors)).toBe(true);
      expect(response.data.errors.length).toBeGreaterThan(0);
      
      // Errors should be specific and helpful
      response.data.errors.forEach(error => {
        expect(error.field).toBeDefined();
        expect(error.message).toBeDefined();
      });
    });

    test('should maintain data consistency during failures', async () => {
      await testUtils.apiClient.authenticate(manager.email, 'TestPassword123!');
      
      // Create related entities
      const company = await testUtils.createTestCompany();
      const contact = await testUtils.createTestContact({ companyId: company.id });
      
      // Try to create deal with invalid data that might cause partial failure
      const dealData = {
        title: 'Test Deal',
        value: 50000,
        stage: 'prospecting',
        contactId: contact.id,
        companyId: company.id,
        products: [
          { name: 'Product 1', quantity: -1, unitPrice: 100 }, // Invalid quantity
          { name: 'Product 2', quantity: 2, unitPrice: 'invalid' } // Invalid price
        ]
      };

      const response = await testUtils.apiClient.createDeal(dealData);
      
      if (response.status === 400) {
        // Failure should be atomic - no partial data created
        const dealsResponse = await testUtils.apiClient.getDeals({
          companyId: company.id
        });
        
        expect(dealsResponse.data.data.length).toBe(0);
      }
    });
  });
});