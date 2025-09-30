/**
 * Environment Configuration Management
 * Centralized environment variable handling with validation and defaults
 */

/**
 * Environment types
 */
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TESTING: 'testing',
  STAGING: 'staging'
};

/**
 * Get current environment
 * @returns {string} Current environment
 */
export const getCurrentEnvironment = () => {
  if (import.meta.env.MODE) {
    return import.meta.env.MODE;
  }
  return import.meta.env.DEV ? ENVIRONMENTS.DEVELOPMENT : ENVIRONMENTS.PRODUCTION;
};

/**
 * Check if running in specific environment
 * @param {string} env - Environment to check
 * @returns {boolean} True if running in specified environment
 */
export const isEnvironment = (env) => {
  return getCurrentEnvironment() === env;
};

/**
 * Environment-specific configuration
 */
const environmentConfig = {
  [ENVIRONMENTS.DEVELOPMENT]: {
    apiBaseUrl: 'http://localhost:5000/api/v1',
    enableApiLogging: true,
    enableErrorReporting: false,
    mockDelay: 1000,
    enableApiIntegration: false, // Default to false for development
    tokenStorageType: 'localStorage',
    enableTokenRefresh: true
  },
  
  [ENVIRONMENTS.PRODUCTION]: {
    apiBaseUrl: '/api/v1', // Relative URL for production
    enableApiLogging: false,
    enableErrorReporting: true,
    mockDelay: 0,
    enableApiIntegration: true, // Default to true for production
    tokenStorageType: 'localStorage',
    enableTokenRefresh: true
  },
  
  [ENVIRONMENTS.STAGING]: {
    apiBaseUrl: 'https://staging-api.salestracker.com/api/v1',
    enableApiLogging: true,
    enableErrorReporting: true,
    mockDelay: 500,
    enableApiIntegration: true,
    tokenStorageType: 'localStorage',
    enableTokenRefresh: true
  },
  
  [ENVIRONMENTS.TESTING]: {
    apiBaseUrl: 'http://localhost:5000/api/v1',
    enableApiLogging: false,
    enableErrorReporting: false,
    mockDelay: 100,
    enableApiIntegration: false, // Use mocks for testing
    tokenStorageType: 'sessionStorage',
    enableTokenRefresh: false
  }
};

/**
 * Parse environment variable as boolean
 * @param {string} value - Environment variable value
 * @param {boolean} defaultValue - Default value if parsing fails
 * @returns {boolean} Parsed boolean value
 */
const parseBoolean = (value, defaultValue = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return defaultValue;
};

/**
 * Parse environment variable as integer
 * @param {string} value - Environment variable value
 * @param {number} defaultValue - Default value if parsing fails
 * @returns {number} Parsed integer value
 */
const parseInteger = (value, defaultValue = 0) => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Parse environment variable as float
 * @param {string} value - Environment variable value
 * @param {number} defaultValue - Default value if parsing fails
 * @returns {number} Parsed float value
 */
const parseFloat = (value, defaultValue = 0.0) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Get environment configuration with validation
 * @param {string} key - Configuration key
 * @param {*} fallback - Fallback value
 * @returns {*} Configuration value
 */
export const getEnvConfig = (key, fallback = null) => {
  const currentEnv = getCurrentEnvironment();
  const envDefaults = environmentConfig[currentEnv] || environmentConfig[ENVIRONMENTS.DEVELOPMENT];
  
  // Try environment variable first
  const envValue = import.meta.env[`VITE_${key.toUpperCase()}`];
  if (envValue !== undefined) {
    return envValue;
  }
  
  // Try environment-specific defaults
  if (envDefaults[key] !== undefined) {
    return envDefaults[key];
  }
  
  // Return fallback
  return fallback;
};

/**
 * Complete environment configuration object
 */
export const config = {
  // Environment info
  environment: getCurrentEnvironment(),
  isDevelopment: isEnvironment(ENVIRONMENTS.DEVELOPMENT),
  isProduction: isEnvironment(ENVIRONMENTS.PRODUCTION),
  isTesting: isEnvironment(ENVIRONMENTS.TESTING),
  isStaging: isEnvironment(ENVIRONMENTS.STAGING),
  
  // API Configuration
  api: {
    baseUrl: getEnvConfig('apiBaseUrl', environmentConfig[getCurrentEnvironment()]?.apiBaseUrl || 'http://localhost:5000/api/v1'),
    timeout: parseInteger(getEnvConfig('apiTimeout'), 10000),
    maxRetries: parseInteger(getEnvConfig('apiMaxRetries'), 3),
    retryDelay: parseInteger(getEnvConfig('apiRetryDelay'), 1000),
    retryDelayMultiplier: parseFloat(getEnvConfig('apiRetryMultiplier'), 2),
    maxConcurrentRequests: parseInteger(getEnvConfig('apiMaxConcurrent'), 10),
    requestQueueSize: parseInteger(getEnvConfig('apiQueueSize'), 100)
  },
  
  // Authentication Configuration
  auth: {
    tokenStorageType: getEnvConfig('tokenStorageType', 'localStorage'),
    enableTokenRefresh: parseBoolean(getEnvConfig('enableTokenRefresh'), true),
    tokenRefreshThreshold: parseInteger(getEnvConfig('tokenRefreshThreshold'), 300),
    maxLoginAttempts: parseInteger(getEnvConfig('maxLoginAttempts'), 5),
    loginCooldownMinutes: parseInteger(getEnvConfig('loginCooldownMinutes'), 15)
  },
  
  // Security Configuration
  security: {
    csrfEnabled: parseBoolean(getEnvConfig('csrfEnabled'), false),
    csrfHeaderName: getEnvConfig('csrfHeaderName', 'X-CSRF-Token'),
    rateLimitEnabled: parseBoolean(getEnvConfig('rateLimitEnabled'), true)
  },
  
  // Feature Flags
  features: {
    enableApiIntegration: parseBoolean(getEnvConfig('enableApiIntegration'), environmentConfig[getCurrentEnvironment()]?.enableApiIntegration || false),
    enableEmailVerification: parseBoolean(getEnvConfig('enableEmailVerification'), true),
    enableRememberMe: parseBoolean(getEnvConfig('enableRememberMe'), true),
    enablePasswordStrength: parseBoolean(getEnvConfig('enablePasswordStrength'), true)
  },
  
  // Development Configuration
  development: {
    enableApiLogging: parseBoolean(getEnvConfig('enableApiLogging'), environmentConfig[getCurrentEnvironment()]?.enableApiLogging || false),
    mockDelay: parseInteger(getEnvConfig('mockDelay'), environmentConfig[getCurrentEnvironment()]?.mockDelay || 1000),
    enableHotReload: parseBoolean(getEnvConfig('enableHotReload'), true)
  },
  
  // Error Handling Configuration
  errors: {
    enableErrorReporting: parseBoolean(getEnvConfig('enableErrorReporting'), false),
    errorReportingUrl: getEnvConfig('errorReportingUrl', ''),
    enableErrorBoundary: parseBoolean(getEnvConfig('enableErrorBoundary'), true)
  },
  
  // Performance Configuration
  performance: {
    enableServiceWorker: parseBoolean(getEnvConfig('enableServiceWorker'), false),
    enableLazyLoading: parseBoolean(getEnvConfig('enableLazyLoading'), true),
    enableCompression: parseBoolean(getEnvConfig('enableCompression'), true)
  }
};

/**
 * Validate configuration
 * @returns {object} Validation result
 */
export const validateConfig = () => {
  const errors = [];
  const warnings = [];
  
  // Validate required configurations
  if (!config.api.baseUrl) {
    errors.push('API base URL is required');
  }
  
  if (config.api.timeout < 1000) {
    warnings.push('API timeout is very low (< 1000ms)');
  }
  
  if (config.features.enableApiIntegration && !config.api.baseUrl.startsWith('http')) {
    warnings.push('API integration enabled but base URL appears to be relative');
  }
  
  if (config.auth.tokenRefreshThreshold > 3600) {
    warnings.push('Token refresh threshold is very high (> 1 hour)');
  }
  
  if (config.errors.enableErrorReporting && !config.errors.errorReportingUrl) {
    errors.push('Error reporting enabled but no reporting URL configured');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Log configuration for debugging
 */
export const logConfig = () => {
  if (!config.development.enableApiLogging) return;
  
  console.group('🔧 Environment Configuration');
  console.log('Environment:', config.environment);
  console.log('API Base URL:', config.api.baseUrl);
  console.log('API Integration:', config.features.enableApiIntegration ? '✅ Enabled' : '❌ Disabled');
  console.log('Token Storage:', config.auth.tokenStorageType);
  console.log('Features:', Object.entries(config.features)
    .filter(([_, enabled]) => enabled)
    .map(([feature, _]) => feature)
    .join(', ')
  );
  
  const validation = validateConfig();
  if (validation.errors.length > 0) {
    console.error('❌ Configuration Errors:', validation.errors);
  }
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Configuration Warnings:', validation.warnings);
  }
  
  console.groupEnd();
};

// Log configuration on module load in development
if (config.isDevelopment) {
  logConfig();
}

export default config;