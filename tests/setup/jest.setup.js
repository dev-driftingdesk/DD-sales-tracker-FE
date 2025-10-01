// Global Jest Setup
require('dotenv').config({ path: '.env.test' });

// React Testing Library setup
import '@testing-library/jest-dom';

// Global test utilities
global.console = {
  ...console,
  // Uncomment to suppress logs during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn()
};

// Set test timeout
jest.setTimeout(30000);

// Global test constants
global.TEST_CONFIG = {
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001',
  MOCK_SERVER_URL: process.env.MOCK_SERVER_URL || 'http://localhost:1080',
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL,
  ELASTICSEARCH_URL: process.env.ELASTICSEARCH_URL,
  RESPONSE_TIME_THRESHOLD: parseInt(process.env.RESPONSE_TIME_THRESHOLD) || 200,
  CONCURRENT_REQUEST_LIMIT: parseInt(process.env.CONCURRENT_REQUEST_LIMIT) || 50
};

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Global test helpers
global.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

global.waitForCondition = async (condition, timeout = 5000, interval = 100) => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true;
    }
    await sleep(interval);
  }
  throw new Error(`Condition not met within ${timeout}ms`);
};