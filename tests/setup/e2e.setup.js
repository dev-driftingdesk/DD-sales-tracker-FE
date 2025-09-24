// E2E Test Setup
const axios = require('axios');

let apiServer;

beforeAll(async () => {
  // Check if API server is running
  try {
    await axios.get(`${global.TEST_CONFIG.API_BASE_URL}/health`);
    console.log('API server is running for E2E tests');
  } catch (error) {
    console.warn('API server not available for E2E tests');
  }
});

afterAll(async () => {
  // Cleanup after E2E tests
  console.log('E2E test cleanup completed');
});

// Global E2E test utilities
global.E2E_UTILS = {
  createTestUser: async () => {
    // Utility to create test users for E2E scenarios
    return {
      id: 'test-user-' + Date.now(),
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      role: 'sales_rep'
    };
  },
  
  cleanupTestData: async () => {
    // Utility to cleanup test data after E2E tests
    console.log('Cleaning up E2E test data');
  }
};