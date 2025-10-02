/**
 * Centralized Error Handling for API Requests
 * Provides comprehensive error handling with retry logic and user-friendly messages
 */

import { getConfig } from './config.js';

// Error types for consistent handling
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  SERVER: 'SERVER_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// HTTP status code to error type mapping
const STATUS_TO_ERROR_TYPE = {
  400: ERROR_TYPES.VALIDATION,
  401: ERROR_TYPES.AUTHENTICATION,
  403: ERROR_TYPES.AUTHORIZATION,
  404: ERROR_TYPES.NOT_FOUND,
  408: ERROR_TYPES.TIMEOUT,
  429: ERROR_TYPES.RATE_LIMIT,
  500: ERROR_TYPES.SERVER,
  502: ERROR_TYPES.SERVER,
  503: ERROR_TYPES.SERVER,
  504: ERROR_TYPES.TIMEOUT
};

// User-friendly error messages
const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: 'Network connection failed. Please check your internet connection.',
  [ERROR_TYPES.TIMEOUT]: 'Request timed out. Please try again.',
  [ERROR_TYPES.VALIDATION]: 'Please check your input and try again.',
  [ERROR_TYPES.AUTHENTICATION]: 'Please log in to continue.',
  [ERROR_TYPES.AUTHORIZATION]: 'You do not have permission to perform this action.',
  [ERROR_TYPES.NOT_FOUND]: 'The requested resource was not found.',
  [ERROR_TYPES.SERVER]: 'Server error occurred. Please try again later.',
  [ERROR_TYPES.RATE_LIMIT]: 'Too many requests. Please wait before trying again.',
  [ERROR_TYPES.UNKNOWN]: 'An unexpected error occurred. Please try again.'
};

/**
 * Enhanced error class with additional context
 */
export class ApiError extends Error {
  constructor(message, type, status, originalError, data = null) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = status;
    this.originalError = originalError;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Get user-friendly error message
   * @returns {string} User-friendly error message
   */
  getUserMessage() {
    return ERROR_MESSAGES[this.type] || this.message;
  }

  /**
   * Check if error is retryable
   * @returns {boolean} True if error can be retried
   */
  isRetryable() {
    return [
      ERROR_TYPES.NETWORK,
      ERROR_TYPES.TIMEOUT,
      ERROR_TYPES.SERVER
    ].includes(this.type);
  }

  /**
   * Check if error requires authentication
   * @returns {boolean} True if user needs to authenticate
   */
  requiresAuth() {
    return this.type === ERROR_TYPES.AUTHENTICATION;
  }

  /**
   * Serialize error for logging
   * @returns {object} Serialized error object
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      status: this.status,
      timestamp: this.timestamp,
      data: this.data
    };
  }
}

/**
 * Parse error response and extract meaningful information
 * @param {object} error - Axios error object
 * @returns {ApiError} Parsed API error
 */
export const parseApiError = (error) => {
  let errorType = ERROR_TYPES.UNKNOWN;
  let message = 'An unexpected error occurred';
  let status = null;
  let data = null;

  if (error.code === 'ECONNABORTED' || error.code === 'NETWORK_ERROR') {
    errorType = ERROR_TYPES.NETWORK;
    message = 'Network connection failed';
  } else if (error.code === 'NETWORK_TIMEOUT') {
    errorType = ERROR_TYPES.TIMEOUT;
    message = 'Request timed out';
  } else if (error.response) {
    // Server responded with error status
    status = error.response.status;
    errorType = STATUS_TO_ERROR_TYPE[status] || ERROR_TYPES.SERVER;
    
    // Extract error message from response
    const responseData = error.response.data;
    if (responseData) {
      // Store the complete response data for detailed debugging
      data = responseData;
      
      if (typeof responseData === 'string') {
        message = responseData;
      } else if (responseData.message) {
        message = responseData.message;
      } else if (responseData.title) {
        message = responseData.title;
      } else if (responseData.error) {
        message = responseData.error;
      } else if (responseData.errors) {
        // Handle .NET validation errors format: { "FieldName": ["Error message"] }
        if (typeof responseData.errors === 'object' && !Array.isArray(responseData.errors)) {
          const validationErrors = [];
          const fieldErrors = {}; // For field-specific error mapping
          
          Object.keys(responseData.errors).forEach(field => {
            if (Array.isArray(responseData.errors[field])) {
              fieldErrors[field] = responseData.errors[field];
              responseData.errors[field].forEach(error => {
                validationErrors.push(`${field}: ${error}`);
              });
            } else {
              fieldErrors[field] = [responseData.errors[field]];
              validationErrors.push(`${field}: ${responseData.errors[field]}`);
            }
          });
          
          // Add field errors to data for component access
          data = { ...responseData, fieldErrors };
          message = validationErrors.join(', ');
        } else if (Array.isArray(responseData.errors)) {
          message = responseData.errors.join(', ');
        }
      }
    }
  } else if (error.request) {
    // Request was made but no response received
    errorType = ERROR_TYPES.NETWORK;
    message = 'No response from server';
  }

  return new ApiError(message, errorType, status, error, data);
};

/**
 * Handle API errors with logging and reporting
 * @param {object} error - Axios error object
 * @param {object} requestConfig - Original request configuration
 * @returns {ApiError} Parsed and handled error
 */
export const handleApiError = (error, requestConfig = {}) => {
  const apiError = parseApiError(error);
  
  // Log error if logging is enabled
  if (getConfig('enableApiLogging')) {
    console.error('API Error:', {
      url: requestConfig.url,
      method: requestConfig.method,
      error: apiError.toJSON()
    });
  }
  
  // Report error if error reporting is enabled
  if (getConfig('enableErrorReporting') && getConfig('errorReportingUrl')) {
    reportError(apiError, requestConfig);
  }
  
  return apiError;
};

/**
 * Report error to external service
 * @param {ApiError} error - API error to report
 * @param {object} requestConfig - Original request configuration
 */
const reportError = async (error, requestConfig) => {
  try {
    const reportingUrl = getConfig('errorReportingUrl');
    if (!reportingUrl) return;

    const errorReport = {
      error: error.toJSON(),
      request: {
        url: requestConfig.url,
        method: requestConfig.method,
        timestamp: new Date().toISOString()
      },
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Use fetch to avoid circular dependencies with axios
    fetch(reportingUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(errorReport)
    }).catch(() => {
      // Silently fail error reporting to avoid affecting user experience
    });
  } catch (reportingError) {
    // Silently fail error reporting
    console.warn('Failed to report error:', reportingError);
  }
};

/**
 * Check if error should be retried
 * @param {ApiError} error - API error to check
 * @param {number} attemptCount - Current attempt count
 * @returns {boolean} True if error should be retried
 */
export const shouldRetry = (error, attemptCount = 0) => {
  const maxRetries = getConfig('maxRetries', 3);
  return error.isRetryable() && attemptCount < maxRetries;
};

/**
 * Calculate retry delay with exponential backoff
 * @param {number} attemptCount - Current attempt count
 * @returns {number} Delay in milliseconds
 */
export const getRetryDelay = (attemptCount) => {
  const baseDelay = getConfig('retryDelay', 1000);
  const multiplier = getConfig('retryDelayMultiplier', 2);
  return baseDelay * Math.pow(multiplier, attemptCount);
};

/**
 * Create a retry wrapper for async functions
 * @param {function} fn - Function to retry
 * @param {object} options - Retry options
 * @returns {function} Wrapped function with retry logic
 */
export const withRetry = (fn, options = {}) => {
  const { maxRetries = getConfig('maxRetries', 3) } = options;
  
  return async (...args) => {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error instanceof ApiError ? error : parseApiError(error);
        
        if (attempt === maxRetries || !shouldRetry(lastError, attempt)) {
          throw lastError;
        }
        
        const delay = getRetryDelay(attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  };
};

export default {
  ApiError,
  parseApiError,
  handleApiError,
  shouldRetry,
  getRetryDelay,
  withRetry,
  ERROR_TYPES
};