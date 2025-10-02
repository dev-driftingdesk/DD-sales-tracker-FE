/**
 * API Configuration Management
 * Handles environment-based API configuration with feature flags
 */

// Environment configuration with defaults
const config = {
  // API Base Configuration
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5555',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  
  // Authentication Configuration
  tokenStorageType: import.meta.env.VITE_TOKEN_STORAGE_TYPE || 'localStorage',
  enableTokenRefresh: import.meta.env.VITE_ENABLE_TOKEN_REFRESH === 'true',
  tokenRefreshThreshold: parseInt(import.meta.env.VITE_TOKEN_REFRESH_THRESHOLD) || 300,
  
  // Security Configuration
  csrfEnabled: import.meta.env.VITE_CSRF_ENABLED === 'true',
  csrfHeaderName: import.meta.env.VITE_CSRF_HEADER_NAME || 'X-CSRF-Token',
  
  // Rate Limiting
  rateLimitEnabled: import.meta.env.VITE_RATE_LIMIT_ENABLED === 'true',
  maxLoginAttempts: parseInt(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS) || 5,
  loginCooldownMinutes: parseInt(import.meta.env.VITE_LOGIN_COOLDOWN_MINUTES) || 15,
  
  // Development Configuration
  enableApiLogging: import.meta.env.VITE_ENABLE_API_LOGGING === 'true',
  mockDelay: parseInt(import.meta.env.VITE_MOCK_DELAY) || 1000,
  
  // Feature Flags - Default to false for backward compatibility
  enableApiIntegration: import.meta.env.VITE_ENABLE_API_INTEGRATION === 'true',
  enableEmailVerification: import.meta.env.VITE_ENABLE_EMAIL_VERIFICATION === 'true',
  enableRememberMe: import.meta.env.VITE_ENABLE_REMEMBER_ME !== 'false', // Default true
  enablePasswordStrength: import.meta.env.VITE_ENABLE_PASSWORD_STRENGTH === 'true',
  
  // CeedPods API Configuration
  ceedPodsApiVersion: import.meta.env.VITE_CEEDPODS_API_VERSION || 'v1',
  enableCeedPodsIntegration: import.meta.env.VITE_ENABLE_CEEDPODS_INTEGRATION === 'true',
  
  // Error Handling
  enableErrorReporting: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
  errorReportingUrl: import.meta.env.VITE_ERROR_REPORTING_URL || '',
  
  // Retry Configuration
  maxRetries: parseInt(import.meta.env.VITE_API_MAX_RETRIES) || 3,
  retryDelay: parseInt(import.meta.env.VITE_API_RETRY_DELAY) || 1000,
  retryDelayMultiplier: parseFloat(import.meta.env.VITE_API_RETRY_MULTIPLIER) || 2,
  
  // Request Configuration
  maxConcurrentRequests: parseInt(import.meta.env.VITE_API_MAX_CONCURRENT) || 10,
  requestQueueSize: parseInt(import.meta.env.VITE_API_QUEUE_SIZE) || 100
};

/**
 * Get configuration value with optional fallback
 * @param {string} key - Configuration key
 * @param {*} fallback - Fallback value if key not found
 * @returns {*} Configuration value
 */
export const getConfig = (key, fallback = null) => {
  return config[key] !== undefined ? config[key] : fallback;
};

/**
 * Check if API integration is enabled
 * @returns {boolean} True if API integration is enabled
 */
export const isApiEnabled = () => {
  return config.enableApiIntegration;
};

/**
 * Check if we're in development mode
 * @returns {boolean} True if in development mode
 */
export const isDevelopment = () => {
  return import.meta.env.DEV;
};

/**
 * Check if we're in production mode
 * @returns {boolean} True if in production mode
 */
export const isProduction = () => {
  return import.meta.env.PROD;
};

/**
 * Get API endpoints configuration for CeedPods API
 * @returns {object} API endpoints configuration
 */
export const getApiEndpoints = () => {
  const apiVersion = config.ceedPodsApiVersion;
  
  return {
    auth: {
      login: `/api/${apiVersion}/auth/login`,
      register: `/api/${apiVersion}/auth/register`,
      logout: `/api/${apiVersion}/auth/logout`,
      refresh: `/api/${apiVersion}/auth/refresh`,
      resetPassword: `/api/${apiVersion}/auth/reset-password`,
      resetPasswordConfirm: `/api/${apiVersion}/auth/reset-password/confirm`,
      verifyEmail: `/api/${apiVersion}/auth/verify-email`,
      profile: `/api/${apiVersion}/auth/profile`
    },
    users: {
      list: `/api/v2/users`,
      create: `/api/v2/users`,
      update: `/api/v2/users`,
      delete: `/api/v2/users`,
      profile: `/api/v2/users/profile`,
      search: `/api/v2/users/search`
    },
    leads: {
      list: `/api/v2/leads`,
      create: `/api/v2/leads`,
      update: `/api/v2/leads`,
      delete: `/api/v2/leads`,
      import: `/api/v2/leads/import`,
      export: `/api/v2/leads/export`,
      activities: `/api/v2/leads/{id}/activities`,
      notes: `/api/v2/leads/{id}/notes`
    },
    contacts: {
      list: '/api/v2/contacts',
      create: '/api/v2/contacts',
      update: '/api/v2/contacts',
      delete: '/api/v2/contacts',
      search: '/api/v2/contacts/search',
      updateStatus: '/api/v2/contacts/{id}/status',
      addTag: '/api/v2/contacts/{id}/tags',
      removeTag: '/api/v2/contacts/{id}/tags/{tag}',
      analytics: '/api/v2/contacts/analytics'
    },
    companies: {
      list: '/companies',
      create: '/companies',
      update: '/companies',
      delete: '/companies'
    },
    deals: {
      list: '/deals',
      create: '/deals',
      update: '/deals',
      delete: '/deals'
    },
    email: {
      send: '/email/send',
      templates: '/email/templates',
      tracking: '/email/tracking'
    },
    analytics: {
      performance: '/analytics/performance',
      reports: '/analytics/reports'
    }
  };
};

export default config;