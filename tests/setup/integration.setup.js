// Integration Test Setup
const { mockServerClient } = require('mockserver-client');

let mockServer;

beforeAll(async () => {
  // Initialize mock server client
  mockServer = mockServerClient('localhost', 1080);
  
  // Wait for mock server to be ready
  try {
    await mockServer.reset();
    console.log('Mock server connected and reset successfully');
  } catch (error) {
    console.warn('Mock server not available, tests will run without external service mocking');
  }
});

afterAll(async () => {
  // Clean up mock server
  if (mockServer) {
    try {
      await mockServer.reset();
      console.log('Mock server cleaned up');
    } catch (error) {
      console.warn('Error cleaning up mock server:', error.message);
    }
  }
});

// Global mock server instance
global.mockServer = mockServer;