// Test Utility Functions
const ApiClient = require('./apiClient');
const TestDataFactory = require('./testDataFactory');
const SchemaValidator = require('./schemaValidator');

class TestUtils {
  constructor() {
    this.apiClient = new ApiClient();
    this.dataFactory = TestDataFactory;
    this.validator = new SchemaValidator();
    this.testData = new Map(); // Store test data for cleanup
  }

  // Test lifecycle helpers
  async setup() {
    // Clear any existing test data
    this.testData.clear();
    
    // Setup test user if needed
    if (process.env.TEST_ADMIN_EMAIL && process.env.TEST_ADMIN_PASSWORD) {
      try {
        await this.apiClient.authenticate(
          process.env.TEST_ADMIN_EMAIL, 
          process.env.TEST_ADMIN_PASSWORD
        );
      } catch (error) {
        console.warn('Test admin authentication failed:', error.message);
      }
    }
  }

  async cleanup() {
    // Clean up created test data
    for (const [type, ids] of this.testData.entries()) {
      await this.cleanupTestDataByType(type, ids);
    }
    this.testData.clear();
    
    // Clear authentication
    this.apiClient.clearAuth();
  }

  async cleanupTestDataByType(type, ids) {
    const cleanupMethods = {
      leads: (id) => this.apiClient.deleteLead(id),
      contacts: (id) => this.apiClient.deleteContact(id),
      companies: (id) => this.apiClient.deleteCompany(id),
      deals: (id) => this.apiClient.deleteDeal(id),
      users: (id) => this.apiClient.deleteUser(id),
      products: (id) => this.apiClient.deleteProduct(id)
    };

    const cleanupMethod = cleanupMethods[type];
    if (!cleanupMethod) return;

    for (const id of ids) {
      try {
        await cleanupMethod(id);
      } catch (error) {
        console.warn(`Failed to cleanup ${type} ${id}:`, error.message);
      }
    }
  }

  // Data creation helpers with cleanup tracking
  async createTestLead(overrides = {}) {
    const leadData = this.dataFactory.createLead(overrides);
    const response = await this.apiClient.createLead(leadData);
    
    if (response.status === 201 && response.data.data.id) {
      this.trackTestData('leads', response.data.data.id);
      return response.data.data;
    }
    
    throw new Error(`Failed to create test lead: ${response.status}`);
  }

  async createTestContact(overrides = {}) {
    const contactData = this.dataFactory.createContact(overrides);
    const response = await this.apiClient.createContact(contactData);
    
    if (response.status === 201 && response.data.data.id) {
      this.trackTestData('contacts', response.data.data.id);
      return response.data.data;
    }
    
    throw new Error(`Failed to create test contact: ${response.status}`);
  }

  async createTestCompany(overrides = {}) {
    const companyData = this.dataFactory.createCompany(overrides);
    const response = await this.apiClient.createCompany(companyData);
    
    if (response.status === 201 && response.data.data.id) {
      this.trackTestData('companies', response.data.data.id);
      return response.data.data;
    }
    
    throw new Error(`Failed to create test company: ${response.status}`);
  }

  async createTestDeal(overrides = {}) {
    const dealData = this.dataFactory.createDeal(overrides);
    const response = await this.apiClient.createDeal(dealData);
    
    if (response.status === 201 && response.data.data.id) {
      this.trackTestData('deals', response.data.data.id);
      return response.data.data;
    }
    
    throw new Error(`Failed to create test deal: ${response.status}`);
  }

  async createTestUser(overrides = {}) {
    const userData = this.dataFactory.createUser(overrides);
    const response = await this.apiClient.createUser(userData);
    
    if (response.status === 201 && response.data.data.id) {
      this.trackTestData('users', response.data.data.id);
      return response.data.data;
    }
    
    throw new Error(`Failed to create test user: ${response.status}`);
  }

  trackTestData(type, id) {
    if (!this.testData.has(type)) {
      this.testData.set(type, new Set());
    }
    this.testData.get(type).add(id);
  }

  // Validation helpers
  validateResponse(response, expectedStatus = 200, schemaName = null) {
    const results = {
      statusValid: true,
      schemaValid: true,
      errors: []
    };

    // Validate status code
    if (response.status !== expectedStatus) {
      results.statusValid = false;
      results.errors.push(`Expected status ${expectedStatus}, got ${response.status}`);
    }

    // Validate schema if provided
    if (schemaName) {
      const validation = this.validator.validateApiResponse(response, schemaName);
      if (!validation.valid) {
        results.schemaValid = false;
        results.errors.push(...validation.errors.map(e => e.message));
      }
    }

    results.valid = results.statusValid && results.schemaValid;
    return results;
  }

  validateErrorResponse(response, expectedStatus = 400) {
    const results = {
      statusValid: response.status === expectedStatus,
      schemaValid: true,
      errors: []
    };

    if (!results.statusValid) {
      results.errors.push(`Expected error status ${expectedStatus}, got ${response.status}`);
    }

    const validation = this.validator.validateErrorResponse(response);
    if (!validation.valid) {
      results.schemaValid = false;
      results.errors.push(...validation.errors.map(e => e.message));
    }

    results.valid = results.statusValid && results.schemaValid;
    return results;
  }

  // Performance testing helpers
  async measureResponseTime(apiMethod, ...args) {
    const start = Date.now();
    const response = await apiMethod(...args);
    const responseTime = Date.now() - start;
    
    return {
      response,
      responseTime,
      success: response.status >= 200 && response.status < 300,
      withinThreshold: responseTime <= global.TEST_CONFIG.RESPONSE_TIME_THRESHOLD
    };
  }

  async loadTest(apiMethod, args, concurrency = 10, duration = 30000) {
    const results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errors: []
    };

    const startTime = Date.now();
    const promises = [];

    // Create concurrent requests
    for (let i = 0; i < concurrency; i++) {
      promises.push(this.loadTestWorker(apiMethod, args, startTime + duration, results));
    }

    await Promise.all(promises);

    // Calculate statistics
    results.averageResponseTime = results.responseTimes.length > 0 
      ? results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length 
      : 0;
    results.minResponseTime = Math.min(...results.responseTimes);
    results.maxResponseTime = Math.max(...results.responseTimes);
    results.successRate = results.totalRequests > 0 
      ? (results.successfulRequests / results.totalRequests) * 100 
      : 0;

    return results;
  }

  async loadTestWorker(apiMethod, args, endTime, results) {
    while (Date.now() < endTime) {
      try {
        const measurement = await this.measureResponseTime(apiMethod.bind(this.apiClient), ...args);
        results.totalRequests++;
        results.responseTimes.push(measurement.responseTime);
        
        if (measurement.success) {
          results.successfulRequests++;
        } else {
          results.failedRequests++;
          results.errors.push(`Status: ${measurement.response.status}`);
        }
      } catch (error) {
        results.totalRequests++;
        results.failedRequests++;
        results.errors.push(error.message);
      }

      // Small delay to prevent overwhelming the server
      await this.sleep(10);
    }
  }

  // Security testing helpers
  async testSQLInjection(endpoint, payload = "'; DROP TABLE users; --") {
    const maliciousData = { query: payload, search: payload, filter: payload };
    
    try {
      const response = await this.apiClient.get(endpoint, { params: maliciousData });
      
      // SQL injection successful if we get unexpected behavior
      return {
        vulnerable: response.status === 500 || 
                   (response.data && response.data.error && 
                    response.data.error.toLowerCase().includes('sql')),
        response: response.status,
        details: response.data
      };
    } catch (error) {
      return {
        vulnerable: error.message.toLowerCase().includes('sql'),
        error: error.message
      };
    }
  }

  async testXSS(endpoint, payload = "<script>alert('XSS')</script>") {
    const xssData = { 
      name: payload, 
      description: payload, 
      notes: payload,
      comment: payload
    };
    
    try {
      const response = await this.apiClient.post(endpoint, xssData);
      
      // Check if XSS payload was reflected or stored
      const responseText = JSON.stringify(response.data);
      return {
        vulnerable: responseText.includes('<script>') || 
                   responseText.includes('alert('),
        response: response.status,
        details: response.data
      };
    } catch (error) {
      return {
        vulnerable: false,
        error: error.message
      };
    }
  }

  async testCSRF(endpoint, method = 'post', data = {}) {
    // Test without CSRF token
    const originalHeaders = { ...this.apiClient.client.defaults.headers };
    
    // Remove potential CSRF headers
    delete this.apiClient.client.defaults.headers['X-CSRF-Token'];
    delete this.apiClient.client.defaults.headers['X-Requested-With'];
    
    try {
      const response = await this.apiClient[method](endpoint, data);
      
      // Restore headers
      this.apiClient.client.defaults.headers = originalHeaders;
      
      return {
        vulnerable: response.status >= 200 && response.status < 300,
        response: response.status,
        details: 'Request succeeded without CSRF protection'
      };
    } catch (error) {
      // Restore headers
      this.apiClient.client.defaults.headers = originalHeaders;
      
      return {
        vulnerable: false,
        error: error.message
      };
    }
  }

  async testRateLimit(endpoint, maxRequests = 100, timeWindow = 60000) {
    const results = {
      requestsMade: 0,
      rateLimited: false,
      rateLimitResponse: null,
      timeToRateLimit: null
    };

    const startTime = Date.now();
    
    for (let i = 0; i < maxRequests; i++) {
      try {
        const response = await this.apiClient.get(endpoint);
        results.requestsMade++;
        
        if (response.status === 429) {
          results.rateLimited = true;
          results.rateLimitResponse = response.data;
          results.timeToRateLimit = Date.now() - startTime;
          break;
        }
        
        // Stop if we exceed time window
        if (Date.now() - startTime > timeWindow) {
          break;
        }
        
      } catch (error) {
        if (error.response && error.response.status === 429) {
          results.rateLimited = true;
          results.rateLimitResponse = error.response.data;
          results.timeToRateLimit = Date.now() - startTime;
          break;
        }
        throw error;
      }
    }

    return results;
  }

  // WebSocket testing helpers
  async testWebSocketConnection(url, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const WebSocket = require('ws');
      const ws = new WebSocket(url);
      
      const timer = setTimeout(() => {
        ws.close();
        reject(new Error('WebSocket connection timeout'));
      }, timeout);

      ws.on('open', () => {
        clearTimeout(timer);
        resolve({
          connected: true,
          socket: ws
        });
      });

      ws.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
  }

  // File upload testing helpers
  async testFileUpload(endpoint, fileBuffer, fileName, mimeType) {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', fileBuffer, { filename: fileName, contentType: mimeType });
    
    try {
      const response = await this.apiClient.post(endpoint, form, {
        headers: form.getHeaders()
      });
      
      return {
        success: response.status >= 200 && response.status < 300,
        response: response.status,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Utility methods
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateRandomString(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  generateRandomEmail() {
    return `test-${this.generateRandomString(8)}@example.com`;
  }

  formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}m`;
  }

  // Database testing helpers (for integration tests)
  async waitForDatabaseSync(timeout = 5000) {
    // Implement database synchronization wait if needed
    await this.sleep(100); // Basic delay for now
  }

  // Mock external services
  async setupExternalServiceMocks() {
    if (!global.mockServer) return;

    try {
      // Mock email service
      await global.mockServer.mockAnyResponse({
        httpRequest: {
          method: 'POST',
          path: '/email/send'
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ success: true, messageId: 'mock-email-123' })
        }
      });

      // Mock SMS service
      await global.mockServer.mockAnyResponse({
        httpRequest: {
          method: 'POST',
          path: '/sms/send'
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ success: true, messageId: 'mock-sms-123' })
        }
      });

      console.log('External service mocks configured');
    } catch (error) {
      console.warn('Failed to setup external service mocks:', error.message);
    }
  }
}

module.exports = TestUtils;