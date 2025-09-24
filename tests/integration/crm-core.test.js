// CRM Core (Contacts, Companies, Deals) API Integration Tests
const TestUtils = require('../helpers/testUtils');

describe('CRM Core API', () => {
  let testUtils;
  let authUser;

  beforeAll(async () => {
    testUtils = new TestUtils();
    await testUtils.setup();
    
    authUser = await testUtils.createTestUser({ role: 'sales_rep' });
    await testUtils.apiClient.authenticate(authUser.email, 'TestPassword123!');
  });

  afterAll(async () => {
    await testUtils.cleanup();
  });

  describe('Contacts API', () => {
    describe('POST /api/contacts', () => {
      test('should create contact with valid data', async () => {
        const contactData = testUtils.dataFactory.createContact();

        const response = await testUtils.apiClient.createContact(contactData);
        const validation = testUtils.validateResponse(response, 201, 'contact');

        expect(validation.valid).toBe(true);
        expect(response.data.data.firstName).toBe(contactData.firstName);
        expect(response.data.data.lastName).toBe(contactData.lastName);
        expect(response.data.data.email).toBe(contactData.email);
        
        testUtils.trackTestData('contacts', response.data.data.id);
      });

      test('should create contact with minimum required fields', async () => {
        const minimalContact = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com'
        };

        const response = await testUtils.apiClient.createContact(minimalContact);
        const validation = testUtils.validateResponse(response, 201, 'contact');

        expect(validation.valid).toBe(true);
        
        testUtils.trackTestData('contacts', response.data.data.id);
      });

      test('should reject contact creation with invalid email', async () => {
        const contactData = testUtils.dataFactory.createContact({
          email: 'invalid-email'
        });

        const response = await testUtils.apiClient.createContact(contactData);
        const validation = testUtils.validateErrorResponse(response, 400);

        expect(validation.valid).toBe(true);
        expect(response.data.error).toContain('email');
      });

      test('should reject duplicate email addresses', async () => {
        const contactData = testUtils.dataFactory.createContact();
        
        // First contact
        await testUtils.apiClient.createContact(contactData);
        
        // Duplicate contact
        const response = await testUtils.apiClient.createContact(contactData);
        const validation = testUtils.validateErrorResponse(response, 409);

        expect(validation.valid).toBe(true);
        expect(response.data.error).toContain('already exists');
      });
    });

    describe('GET /api/contacts', () => {
      let testContacts;

      beforeEach(async () => {
        testContacts = [];
        for (let i = 0; i < 5; i++) {
          const contact = await testUtils.createTestContact();
          testContacts.push(contact);
        }
      });

      test('should retrieve all contacts', async () => {
        const response = await testUtils.apiClient.getContacts();
        const validation = testUtils.validateResponse(response, 200);

        expect(validation.valid).toBe(true);
        expect(Array.isArray(response.data.data)).toBe(true);
        expect(response.data.data.length).toBeGreaterThanOrEqual(testContacts.length);
      });

      test('should support pagination', async () => {
        const response = await testUtils.apiClient.getContacts({
          page: 1,
          limit: 3
        });

        expect(response.status).toBe(200);
        expect(response.data.data.length).toBeLessThanOrEqual(3);
        expect(response.data.pagination).toBeTruthy();
      });

      test('should support search by name', async () => {
        const searchTerm = testContacts[0].firstName;
        const response = await testUtils.apiClient.getContacts({
          search: searchTerm
        });

        expect(response.status).toBe(200);
        expect(response.data.data.length).toBeGreaterThan(0);
      });

      test('should filter by company', async () => {
        const companyId = testContacts[0].companyId;
        const response = await testUtils.apiClient.getContacts({
          companyId
        });

        expect(response.status).toBe(200);
        response.data.data.forEach(contact => {
          expect(contact.companyId).toBe(companyId);
        });
      });
    });

    describe('GET /api/contacts/:id', () => {
      let testContact;

      beforeEach(async () => {
        testContact = await testUtils.createTestContact();
      });

      test('should retrieve contact by valid ID', async () => {
        const response = await testUtils.apiClient.getContact(testContact.id);
        const validation = testUtils.validateResponse(response, 200, 'contact');

        expect(validation.valid).toBe(true);
        expect(response.data.data.id).toBe(testContact.id);
      });

      test('should return 404 for non-existent contact', async () => {
        const response = await testUtils.apiClient.getContact('non-existent-id');
        const validation = testUtils.validateErrorResponse(response, 404);

        expect(validation.valid).toBe(true);
      });
    });

    describe('PATCH /api/contacts/:id', () => {
      let testContact;

      beforeEach(async () => {
        testContact = await testUtils.createTestContact();
      });

      test('should update contact with valid data', async () => {
        const updates = {
          title: 'Senior Manager',
          phone: '+1-555-0123'
        };

        const response = await testUtils.apiClient.updateContact(testContact.id, updates);
        const validation = testUtils.validateResponse(response, 200, 'contact');

        expect(validation.valid).toBe(true);
        expect(response.data.data.title).toBe(updates.title);
        expect(response.data.data.phone).toBe(updates.phone);
      });

      test('should reject update with invalid email', async () => {
        const updates = { email: 'invalid-email' };

        const response = await testUtils.apiClient.updateContact(testContact.id, updates);
        const validation = testUtils.validateErrorResponse(response, 400);

        expect(validation.valid).toBe(true);
      });
    });

    describe('DELETE /api/contacts/:id', () => {
      let testContact;

      beforeEach(async () => {
        testContact = await testUtils.createTestContact();
      });

      test('should delete contact with valid ID', async () => {
        const response = await testUtils.apiClient.deleteContact(testContact.id);

        expect(response.status).toBe(204);

        // Verify deletion
        const getResponse = await testUtils.apiClient.getContact(testContact.id);
        expect(getResponse.status).toBe(404);
      });
    });
  });

  describe('Companies API', () => {
    describe('POST /api/companies', () => {
      test('should create company with valid data', async () => {
        const companyData = testUtils.dataFactory.createCompany();

        const response = await testUtils.apiClient.createCompany(companyData);
        const validation = testUtils.validateResponse(response, 201, 'company');

        expect(validation.valid).toBe(true);
        expect(response.data.data.name).toBe(companyData.name);
        expect(response.data.data.industry).toBe(companyData.industry);
        
        testUtils.trackTestData('companies', response.data.data.id);
      });

      test('should create company with minimum required fields', async () => {
        const minimalCompany = {
          name: 'Test Corp Inc.'
        };

        const response = await testUtils.apiClient.createCompany(minimalCompany);
        const validation = testUtils.validateResponse(response, 201, 'company');

        expect(validation.valid).toBe(true);
        
        testUtils.trackTestData('companies', response.data.data.id);
      });

      test('should reject duplicate company names', async () => {
        const companyData = testUtils.dataFactory.createCompany();
        
        // First company
        await testUtils.apiClient.createCompany(companyData);
        
        // Duplicate company
        const response = await testUtils.apiClient.createCompany(companyData);
        const validation = testUtils.validateErrorResponse(response, 409);

        expect(validation.valid).toBe(true);
      });

      test('should validate website URL format', async () => {
        const companyData = testUtils.dataFactory.createCompany({
          website: 'invalid-url'
        });

        const response = await testUtils.apiClient.createCompany(companyData);
        const validation = testUtils.validateErrorResponse(response, 400);

        expect(validation.valid).toBe(true);
        expect(response.data.error).toContain('website');
      });

      test('should validate revenue as positive number', async () => {
        const companyData = testUtils.dataFactory.createCompany({
          revenue: -100000
        });

        const response = await testUtils.apiClient.createCompany(companyData);
        const validation = testUtils.validateErrorResponse(response, 400);

        expect(validation.valid).toBe(true);
        expect(response.data.error).toContain('revenue');
      });
    });

    describe('GET /api/companies', () => {
      let testCompanies;

      beforeEach(async () => {
        testCompanies = [];
        for (let i = 0; i < 5; i++) {
          const company = await testUtils.createTestCompany();
          testCompanies.push(company);
        }
      });

      test('should retrieve all companies', async () => {
        const response = await testUtils.apiClient.getCompanies();
        const validation = testUtils.validateResponse(response, 200);

        expect(validation.valid).toBe(true);
        expect(Array.isArray(response.data.data)).toBe(true);
        expect(response.data.data.length).toBeGreaterThanOrEqual(testCompanies.length);
      });

      test('should support search by company name', async () => {
        const searchTerm = testCompanies[0].name.substring(0, 5);
        const response = await testUtils.apiClient.getCompanies({
          search: searchTerm
        });

        expect(response.status).toBe(200);
        expect(response.data.data.length).toBeGreaterThan(0);
      });

      test('should filter by industry', async () => {
        const industry = 'Technology';
        const response = await testUtils.apiClient.getCompanies({
          industry
        });

        expect(response.status).toBe(200);
        response.data.data.forEach(company => {
          expect(company.industry).toBe(industry);
        });
      });

      test('should filter by company size', async () => {
        const size = '51-200';
        const response = await testUtils.apiClient.getCompanies({
          size
        });

        expect(response.status).toBe(200);
        response.data.data.forEach(company => {
          expect(company.size).toBe(size);
        });
      });

      test('should sort by revenue', async () => {
        const response = await testUtils.apiClient.getCompanies({
          sort: 'revenue',
          order: 'desc'
        });

        expect(response.status).toBe(200);
        
        for (let i = 1; i < response.data.data.length; i++) {
          expect(response.data.data[i].revenue).toBeLessThanOrEqual(response.data.data[i-1].revenue);
        }
      });
    });

    describe('Company-Contact Relationships', () => {
      let testCompany;
      let testContacts;

      beforeEach(async () => {
        testCompany = await testUtils.createTestCompany();
        testContacts = [];
        
        // Create contacts associated with the company
        for (let i = 0; i < 3; i++) {
          const contact = await testUtils.createTestContact({
            companyId: testCompany.id,
            companyName: testCompany.name
          });
          testContacts.push(contact);
        }
      });

      test('should retrieve contacts for a company', async () => {
        const response = await testUtils.apiClient.get(`/api/companies/${testCompany.id}/contacts`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.data.data)).toBe(true);
        expect(response.data.data.length).toBe(testContacts.length);
        
        response.data.data.forEach(contact => {
          expect(contact.companyId).toBe(testCompany.id);
        });
      });

      test('should update company information when creating contact', async () => {
        const contactData = testUtils.dataFactory.createContact({
          companyId: testCompany.id,
          companyName: testCompany.name
        });

        const response = await testUtils.apiClient.createContact(contactData);
        
        expect(response.status).toBe(201);
        expect(response.data.data.companyName).toBe(testCompany.name);
        
        testUtils.trackTestData('contacts', response.data.data.id);
      });
    });
  });

  describe('Deals API', () => {
    let testCompany;
    let testContact;

    beforeEach(async () => {
      testCompany = await testUtils.createTestCompany();
      testContact = await testUtils.createTestContact({
        companyId: testCompany.id
      });
    });

    describe('POST /api/deals', () => {
      test('should create deal with valid data', async () => {
        const dealData = testUtils.dataFactory.createDeal({
          contactId: testContact.id,
          companyId: testCompany.id,
          assignedTo: authUser.id
        });

        const response = await testUtils.apiClient.createDeal(dealData);
        const validation = testUtils.validateResponse(response, 201, 'deal');

        expect(validation.valid).toBe(true);
        expect(response.data.data.title).toBe(dealData.title);
        expect(response.data.data.value).toBe(dealData.value);
        expect(response.data.data.stage).toBe(dealData.stage);
        
        testUtils.trackTestData('deals', response.data.data.id);
      });

      test('should create deal with minimum required fields', async () => {
        const minimalDeal = {
          title: 'Simple Deal',
          value: 5000,
          stage: 'prospecting'
        };

        const response = await testUtils.apiClient.createDeal(minimalDeal);
        const validation = testUtils.validateResponse(response, 201, 'deal');

        expect(validation.valid).toBe(true);
        
        testUtils.trackTestData('deals', response.data.data.id);
      });

      test('should reject deal with invalid stage', async () => {
        const dealData = testUtils.dataFactory.createDeal({
          stage: 'invalid_stage'
        });

        const response = await testUtils.apiClient.createDeal(dealData);
        const validation = testUtils.validateErrorResponse(response, 400);

        expect(validation.valid).toBe(true);
        expect(response.data.error).toContain('stage');
      });

      test('should reject deal with negative value', async () => {
        const dealData = testUtils.dataFactory.createDeal({
          value: -1000
        });

        const response = await testUtils.apiClient.createDeal(dealData);
        const validation = testUtils.validateErrorResponse(response, 400);

        expect(validation.valid).toBe(true);
        expect(response.data.error).toContain('value');
      });

      test('should reject deal with invalid probability', async () => {
        const dealData = testUtils.dataFactory.createDeal({
          probability: 150 // Should be 0-100
        });

        const response = await testUtils.apiClient.createDeal(dealData);
        const validation = testUtils.validateErrorResponse(response, 400);

        expect(validation.valid).toBe(true);
        expect(response.data.error).toContain('probability');
      });

      test('should auto-assign current user if no assignee specified', async () => {
        const dealData = testUtils.dataFactory.createDeal();
        delete dealData.assignedTo;

        const response = await testUtils.apiClient.createDeal(dealData);

        expect(response.status).toBe(201);
        expect(response.data.data.assignedTo).toBe(authUser.id);
        
        testUtils.trackTestData('deals', response.data.data.id);
      });
    });

    describe('GET /api/deals', () => {
      let testDeals;

      beforeEach(async () => {
        testDeals = [];
        const stages = ['prospecting', 'qualification', 'proposal', 'negotiation'];
        
        for (let i = 0; i < 8; i++) {
          const deal = await testUtils.createTestDeal({
            assignedTo: authUser.id,
            stage: stages[i % stages.length],
            value: (i + 1) * 1000
          });
          testDeals.push(deal);
        }
      });

      test('should retrieve all deals', async () => {
        const response = await testUtils.apiClient.getDeals();
        const validation = testUtils.validateResponse(response, 200);

        expect(validation.valid).toBe(true);
        expect(Array.isArray(response.data.data)).toBe(true);
        expect(response.data.data.length).toBeGreaterThanOrEqual(testDeals.length);
      });

      test('should support pagination', async () => {
        const response = await testUtils.apiClient.getDeals({
          page: 1,
          limit: 5
        });

        expect(response.status).toBe(200);
        expect(response.data.data.length).toBeLessThanOrEqual(5);
        expect(response.data.pagination).toBeTruthy();
      });

      test('should filter deals by stage', async () => {
        const stage = 'qualification';
        const response = await testUtils.apiClient.getDeals({
          stage
        });

        expect(response.status).toBe(200);
        response.data.data.forEach(deal => {
          expect(deal.stage).toBe(stage);
        });
      });

      test('should filter deals by assigned user', async () => {
        const response = await testUtils.apiClient.getDeals({
          assignedTo: authUser.id
        });

        expect(response.status).toBe(200);
        response.data.data.forEach(deal => {
          expect(deal.assignedTo).toBe(authUser.id);
        });
      });

      test('should filter deals by value range', async () => {
        const response = await testUtils.apiClient.getDeals({
          minValue: 3000,
          maxValue: 6000
        });

        expect(response.status).toBe(200);
        response.data.data.forEach(deal => {
          expect(deal.value).toBeGreaterThanOrEqual(3000);
          expect(deal.value).toBeLessThanOrEqual(6000);
        });
      });

      test('should sort deals by value', async () => {
        const response = await testUtils.apiClient.getDeals({
          sort: 'value',
          order: 'desc'
        });

        expect(response.status).toBe(200);
        
        for (let i = 1; i < response.data.data.length; i++) {
          expect(response.data.data[i].value).toBeLessThanOrEqual(response.data.data[i-1].value);
        }
      });

      test('should sort deals by expected close date', async () => {
        const response = await testUtils.apiClient.getDeals({
          sort: 'expectedCloseDate',
          order: 'asc'
        });

        expect(response.status).toBe(200);
        
        for (let i = 1; i < response.data.data.length; i++) {
          const current = new Date(response.data.data[i].expectedCloseDate);
          const previous = new Date(response.data.data[i-1].expectedCloseDate);
          expect(current.getTime()).toBeGreaterThanOrEqual(previous.getTime());
        }
      });
    });

    describe('PATCH /api/deals/:id/stage', () => {
      let testDeal;

      beforeEach(async () => {
        testDeal = await testUtils.createTestDeal({
          assignedTo: authUser.id,
          stage: 'prospecting'
        });
      });

      test('should update deal stage', async () => {
        const newStage = 'qualification';
        
        const response = await testUtils.apiClient.updateDealStage(testDeal.id, newStage);
        const validation = testUtils.validateResponse(response, 200, 'deal');

        expect(validation.valid).toBe(true);
        expect(response.data.data.stage).toBe(newStage);
      });

      test('should set close date when stage changes to closed_won', async () => {
        const response = await testUtils.apiClient.updateDealStage(testDeal.id, 'closed_won');

        expect(response.status).toBe(200);
        expect(response.data.data.stage).toBe('closed_won');
        expect(response.data.data.actualCloseDate).toBeTruthy();
      });

      test('should set close date when stage changes to closed_lost', async () => {
        const response = await testUtils.apiClient.updateDealStage(testDeal.id, 'closed_lost');

        expect(response.status).toBe(200);
        expect(response.data.data.stage).toBe('closed_lost');
        expect(response.data.data.actualCloseDate).toBeTruthy();
      });

      test('should create activity when stage changes', async () => {
        await testUtils.apiClient.updateDealStage(testDeal.id, 'qualification');
        
        const activitiesResponse = await testUtils.apiClient.get(`/api/deals/${testDeal.id}/activities`);
        expect(activitiesResponse.status).toBe(200);
        
        const stageActivity = activitiesResponse.data.data.find(
          activity => activity.type === 'stage_change'
        );
        expect(stageActivity).toBeTruthy();
      });

      test('should reject invalid stage', async () => {
        const response = await testUtils.apiClient.updateDealStage(testDeal.id, 'invalid_stage');
        const validation = testUtils.validateErrorResponse(response, 400);

        expect(validation.valid).toBe(true);
        expect(response.data.error).toContain('stage');
      });
    });

    describe('Deal Products', () => {
      let testDeal;
      let testProducts;

      beforeEach(async () => {
        testDeal = await testUtils.createTestDeal({ assignedTo: authUser.id });
        
        // Create test products
        testProducts = [];
        for (let i = 0; i < 3; i++) {
          const productData = testUtils.dataFactory.createProduct();
          const response = await testUtils.apiClient.post('/api/products', productData);
          testProducts.push(response.data.data);
          testUtils.trackTestData('products', response.data.data.id);
        }
      });

      test('should add products to deal', async () => {
        const dealProducts = testProducts.map(product => ({
          id: product.id,
          name: product.name,
          quantity: 2,
          unitPrice: product.price
        }));

        const response = await testUtils.apiClient.patch(`/api/deals/${testDeal.id}`, {
          products: dealProducts
        });

        expect(response.status).toBe(200);
        expect(response.data.data.products).toHaveLength(dealProducts.length);
        
        response.data.data.products.forEach((product, index) => {
          expect(product.quantity).toBe(dealProducts[index].quantity);
          expect(product.unitPrice).toBe(dealProducts[index].unitPrice);
        });
      });

      test('should calculate total deal value from products', async () => {
        const dealProducts = [
          { id: testProducts[0].id, name: testProducts[0].name, quantity: 2, unitPrice: 100 },
          { id: testProducts[1].id, name: testProducts[1].name, quantity: 3, unitPrice: 200 }
        ];

        const response = await testUtils.apiClient.patch(`/api/deals/${testDeal.id}`, {
          products: dealProducts,
          calculateValueFromProducts: true
        });

        const expectedTotal = (2 * 100) + (3 * 200); // 800
        expect(response.status).toBe(200);
        expect(response.data.data.value).toBe(expectedTotal);
      });
    });

    describe('Deal Pipeline Analytics', () => {
      let testDeals;

      beforeEach(async () => {
        // Create deals in different stages
        const stages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
        testDeals = [];
        
        for (let i = 0; i < 12; i++) {
          const deal = await testUtils.createTestDeal({
            assignedTo: authUser.id,
            stage: stages[i % stages.length],
            value: (i + 1) * 1000
          });
          testDeals.push(deal);
        }
      });

      test('should get pipeline statistics', async () => {
        const response = await testUtils.apiClient.getAnalytics('deals/pipeline');

        expect(response.status).toBe(200);
        expect(response.data.data.stageDistribution).toBeTruthy();
        expect(response.data.data.totalValue).toBeGreaterThan(0);
        expect(response.data.data.avgDealSize).toBeGreaterThan(0);
      });

      test('should get win/loss analysis', async () => {
        const response = await testUtils.apiClient.getAnalytics('deals/winloss');

        expect(response.status).toBe(200);
        expect(response.data.data.winRate).toBeDefined();
        expect(response.data.data.avgSalesCycle).toBeDefined();
        expect(response.data.data.lossReasons).toBeDefined();
      });

      test('should get sales forecast', async () => {
        const response = await testUtils.apiClient.getAnalytics('deals/forecast', {
          period: 'quarter'
        });

        expect(response.status).toBe(200);
        expect(response.data.data.projectedRevenue).toBeDefined();
        expect(response.data.data.confidence).toBeDefined();
        expect(response.data.data.byMonth).toBeDefined();
      });
    });
  });

  describe('Cross-Entity Integration', () => {
    let testCompany;
    let testContact;
    let testDeal;

    beforeEach(async () => {
      testCompany = await testUtils.createTestCompany();
      testContact = await testUtils.createTestContact({
        companyId: testCompany.id
      });
      testDeal = await testUtils.createTestDeal({
        contactId: testContact.id,
        companyId: testCompany.id,
        assignedTo: authUser.id
      });
    });

    test('should link entities correctly', async () => {
      // Deal should reference contact and company
      const dealResponse = await testUtils.apiClient.getDeal(testDeal.id);
      expect(dealResponse.status).toBe(200);
      expect(dealResponse.data.data.contactId).toBe(testContact.id);
      expect(dealResponse.data.data.companyId).toBe(testCompany.id);

      // Contact should reference company
      const contactResponse = await testUtils.apiClient.getContact(testContact.id);
      expect(contactResponse.status).toBe(200);
      expect(contactResponse.data.data.companyId).toBe(testCompany.id);
    });

    test('should cascade company updates to related entities', async () => {
      const companyUpdate = { name: 'Updated Company Name' };
      
      const response = await testUtils.apiClient.updateCompany(testCompany.id, companyUpdate);
      expect(response.status).toBe(200);

      // Check if contact company name is updated
      const contactResponse = await testUtils.apiClient.getContact(testContact.id);
      expect(contactResponse.data.data.companyName).toBe(companyUpdate.name);
    });

    test('should prevent deletion of company with active deals', async () => {
      const response = await testUtils.apiClient.deleteCompany(testCompany.id);
      const validation = testUtils.validateErrorResponse(response, 409);

      expect(validation.valid).toBe(true);
      expect(response.data.error).toContain('active');
    });

    test('should get all related entities for a company', async () => {
      const response = await testUtils.apiClient.get(`/api/companies/${testCompany.id}/related`);

      expect(response.status).toBe(200);
      expect(response.data.data.contacts).toBeDefined();
      expect(response.data.data.deals).toBeDefined();
      expect(response.data.data.contacts.length).toBeGreaterThan(0);
      expect(response.data.data.deals.length).toBeGreaterThan(0);
    });
  });

  describe('Performance and Load Tests', () => {
    test('should handle concurrent entity creation', async () => {
      const concurrency = 5;
      const promises = [];

      // Create companies concurrently
      for (let i = 0; i < concurrency; i++) {
        const companyData = testUtils.dataFactory.createCompany();
        promises.push(testUtils.apiClient.createCompany(companyData));
      }

      const results = await Promise.allSettled(promises);
      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value.status === 201
      );

      expect(successful.length).toBe(concurrency);
      
      // Track for cleanup
      successful.forEach(result => {
        testUtils.trackTestData('companies', result.value.data.data.id);
      });
    });

    test('should handle large entity list efficiently', async () => {
      const measurement = await testUtils.measureResponseTime(
        testUtils.apiClient.getDeals.bind(testUtils.apiClient),
        { limit: 50 }
      );

      expect(measurement.success).toBe(true);
      expect(measurement.responseTime).toBeLessThan(500);
    });

    test('should handle complex filtering efficiently', async () => {
      const filters = {
        stage: 'prospecting',
        minValue: 1000,
        maxValue: 50000,
        assignedTo: authUser.id,
        sort: 'value',
        order: 'desc'
      };

      const measurement = await testUtils.measureResponseTime(
        testUtils.apiClient.getDeals.bind(testUtils.apiClient),
        filters
      );

      expect(measurement.success).toBe(true);
      expect(measurement.responseTime).toBeLessThan(300);
    });
  });

  describe('Data Validation and Edge Cases', () => {
    test('should handle very long text fields', async () => {
      const longText = 'A'.repeat(2000);
      const contactData = testUtils.dataFactory.createContact({
        title: longText
      });

      const response = await testUtils.apiClient.createContact(contactData);
      
      if (response.status === 400) {
        // Should validate maximum length
        expect(response.data.error).toContain('length');
      } else {
        // Should handle long text
        expect(response.status).toBe(201);
        testUtils.trackTestData('contacts', response.data.data.id);
      }
    });

    test('should handle special characters in names', async () => {
      const companyData = testUtils.dataFactory.createCompany({
        name: "O'Reilly & Associates (Testing) - #1 Company"
      });

      const response = await testUtils.apiClient.createCompany(companyData);
      expect(response.status).toBe(201);
      
      testUtils.trackTestData('companies', response.data.data.id);
    });

    test('should handle unicode characters', async () => {
      const contactData = testUtils.dataFactory.createContact({
        firstName: '测试',
        lastName: 'عربي',
        title: 'Tëst Ûsér'
      });

      const response = await testUtils.apiClient.createContact(contactData);
      expect(response.status).toBe(201);
      
      testUtils.trackTestData('contacts', response.data.data.id);
    });
  });
});