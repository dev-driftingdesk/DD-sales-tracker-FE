/**
 * API Services Export Hub
 * Central export point for all API-related services and utilities
 */

// Core API infrastructure
import apiClient, { createApiService } from './apiClient.js';
import config, { isApiEnabled } from './config.js';
import { ERROR_TYPES } from './errorHandler.js';

export { default as api } from './apiClient.js';
export { createApiService, mockDelay } from './apiClient.js';
export { default as config, getConfig, isApiEnabled, isDevelopment, isProduction, getApiEndpoints } from './config.js';
export { 
  handleApiError, 
  parseApiError, 
  ApiError, 
  shouldRetry, 
  getRetryDelay, 
  withRetry, 
  ERROR_TYPES 
} from './errorHandler.js';

// Authentication services
export { default as authService } from '../auth/authService.js';
export { default as tokenManager } from '../auth/tokenManager.js';

// Re-export common API patterns for convenience
export const createAuthenticatedService = (baseEndpoint) => {
  return createApiService(baseEndpoint);
};

// Utility function to check if we should use API or mock data
export const shouldUseApi = () => {
  return isApiEnabled();
};

// Default export for backward compatibility
export default {
  api: apiClient,
  config,
  createApiService,
  isApiEnabled,
  shouldUseApi,
  ERROR_TYPES
};