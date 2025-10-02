/**
 * Base API Client with Axios Configuration
 * Provides configured axios instance with interceptors for authentication, error handling, and logging
 */

import axios from 'axios';
import config, { getConfig, isApiEnabled } from './config.js';
import { handleApiError, withRetry, ERROR_TYPES } from './errorHandler.js';

// Request queue for rate limiting
let requestQueue = [];
let activeRequests = 0;

/**
 * Create base axios instance with configuration
 */
const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  return instance;
};

/**
 * Add authentication token to request headers
 * @param {object} config - Request configuration
 * @returns {object} Updated configuration with auth headers
 */
const addAuthHeader = (config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

/**
 * Add CSRF token to request headers if enabled
 * @param {object} config - Request configuration
 * @returns {object} Updated configuration with CSRF headers
 */
const addCSRFHeader = (config) => {
  if (getConfig('csrfEnabled')) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      const headerName = getConfig('csrfHeaderName');
      config.headers[headerName] = csrfToken;
    }
  }
  return config;
};

/**
 * Get stored authentication token
 * @returns {string|null} Authentication token
 */
const getStoredToken = () => {
  const storageType = getConfig('tokenStorageType');
  const storage = storageType === 'sessionStorage' ? sessionStorage : localStorage;
  return storage.getItem('auth_token');
};

/**
 * Store authentication token
 * @param {string} token - Authentication token to store
 */
const setStoredToken = (token) => {
  const storageType = getConfig('tokenStorageType');
  const storage = storageType === 'sessionStorage' ? sessionStorage : localStorage;
  storage.setItem('auth_token', token);
  storage.setItem('auth_token_timestamp', Date.now().toString());
};

/**
 * Remove stored authentication token
 */
const removeStoredToken = () => {
  const storageType = getConfig('tokenStorageType');
  const storage = storageType === 'sessionStorage' ? sessionStorage : localStorage;
  storage.removeItem('auth_token');
  storage.removeItem('auth_token_timestamp');
  storage.removeItem('refresh_token');
};

/**
 * Get CSRF token from meta tag or cookie
 * @returns {string|null} CSRF token
 */
const getCsrfToken = () => {
  // Try to get from meta tag first
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  if (metaTag) {
    return metaTag.getAttribute('content');
  }
  
  // Fallback to cookie
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='));
  
  return cookie ? cookie.split('=')[1] : null;
};

/**
 * Check if token needs refresh
 * @returns {boolean} True if token needs refresh
 */
const shouldRefreshToken = () => {
  if (!getConfig('enableTokenRefresh')) return false;
  
  const token = getStoredToken();
  if (!token) return false;
  
  const timestamp = localStorage.getItem('auth_token_timestamp');
  if (!timestamp) return true;
  
  const tokenAge = Date.now() - parseInt(timestamp);
  const threshold = getConfig('tokenRefreshThreshold') * 1000; // Convert to milliseconds
  
  return tokenAge > threshold;
};

/**
 * Refresh authentication token
 * @returns {Promise<string>} New authentication token
 */
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  try {
    const response = await axios.post(`${config.baseURL}/auth/refresh`, {
      refresh_token: refreshToken
    });
    
    const { access_token, refresh_token: newRefreshToken } = response.data;
    setStoredToken(access_token);
    localStorage.setItem('refresh_token', newRefreshToken);
    
    return access_token;
  } catch (error) {
    removeStoredToken();
    throw error;
  }
};

/**
 * Rate limiting middleware
 * @param {object} config - Request configuration
 * @returns {Promise<object>} Promise that resolves when request can proceed
 */
const rateLimitMiddleware = async (config) => {
  if (!getConfig('rateLimitEnabled')) return config;
  
  const maxConcurrent = getConfig('maxConcurrentRequests');
  const maxQueueSize = getConfig('requestQueueSize');
  
  if (activeRequests >= maxConcurrent) {
    if (requestQueue.length >= maxQueueSize) {
      throw new Error('Request queue is full. Please try again later.');
    }
    
    // Add to queue and wait
    await new Promise((resolve, reject) => {
      requestQueue.push({ resolve, reject, config });
    });
  }
  
  activeRequests++;
  return config;
};

/**
 * Process next request in queue
 */
const processQueue = () => {
  if (requestQueue.length > 0 && activeRequests < getConfig('maxConcurrentRequests')) {
    const { resolve } = requestQueue.shift();
    resolve();
  }
};

/**
 * Create API client instance
 */
const createApiClient = () => {
  const axiosInstance = createAxiosInstance();
  
  // Request interceptor
  axiosInstance.interceptors.request.use(
    async (config) => {
      try {
        // Apply rate limiting
        await rateLimitMiddleware(config);
        
        // Add authentication header
        config = addAuthHeader(config);
        
        // Add CSRF header if enabled
        config = addCSRFHeader(config);
        
        // Check if token needs refresh
        if (shouldRefreshToken()) {
          try {
            await refreshToken();
            config = addAuthHeader(config); // Re-add header with new token
          } catch (refreshError) {
            // Token refresh failed, remove stored tokens
            removeStoredToken();
            // Continue with request (might be a public endpoint)
          }
        }
        
        // Log request if logging is enabled
        if (getConfig('enableApiLogging')) {
          console.log('API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            headers: { ...config.headers, Authorization: config.headers.Authorization ? '[HIDDEN]' : undefined }
          });
        }
        
        return config;
      } catch (error) {
        activeRequests--;
        processQueue();
        throw error;
      }
    },
    (error) => {
      activeRequests--;
      processQueue();
      return Promise.reject(error);
    }
  );
  
  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response) => {
      activeRequests--;
      processQueue();
      
      // Log response if logging is enabled
      if (getConfig('enableApiLogging')) {
        console.log('API Response:', {
          status: response.status,
          url: response.config.url,
          data: response.data
        });
      }
      
      return response;
    },
    (error) => {
      activeRequests--;
      processQueue();
      
      // Enhanced error logging for debugging
      if (getConfig('enableApiLogging')) {
        console.error('API Error Response:', {
          url: error.config?.url,
          method: error.config?.method?.toUpperCase(),
          status: error.response?.status,
          statusText: error.response?.statusText,
          headers: error.response?.headers,
          data: error.response?.data,
          originalError: error.message
        });
      }
      
      // Handle specific error cases
      const apiError = handleApiError(error, error.config);
      
      // Auto-logout on authentication errors
      if (apiError.requiresAuth()) {
        removeStoredToken();
        // Dispatch custom event for auth state change
        window.dispatchEvent(new CustomEvent('auth:logout', { detail: apiError }));
      }
      
      return Promise.reject(apiError);
    }
  );
  
  return axiosInstance;
};

// Create the main API client instance
const apiClient = createApiClient();

/**
 * API client with retry logic
 */
const apiClientWithRetry = {
  get: withRetry((url, config) => apiClient.get(url, config)),
  post: withRetry((url, data, config) => apiClient.post(url, data, config)),
  put: withRetry((url, data, config) => apiClient.put(url, data, config)),
  patch: withRetry((url, data, config) => apiClient.patch(url, data, config)),
  delete: withRetry((url, config) => apiClient.delete(url, config))
};

/**
 * Public API methods
 */
export const api = {
  // HTTP methods with retry
  get: apiClientWithRetry.get,
  post: apiClientWithRetry.post,
  put: apiClientWithRetry.put,
  patch: apiClientWithRetry.patch,
  delete: apiClientWithRetry.delete,
  
  // Raw axios instance for custom requests
  client: apiClient,
  
  // Token management
  setToken: setStoredToken,
  getToken: getStoredToken,
  removeToken: removeStoredToken,
  refreshToken,
  
  // Utility methods
  isApiEnabled,
  getBaseURL: () => config.baseURL,
  
  // Request cancellation
  cancelToken: axios.CancelToken,
  isCancel: axios.isCancel
};

/**
 * Create a mock delay for development
 * @param {number} delay - Delay in milliseconds
 * @returns {Promise} Promise that resolves after delay
 */
export const mockDelay = (delay = getConfig('mockDelay')) => {
  return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Create API service wrapper for consistent error handling
 * @param {string} baseEndpoint - Base endpoint for the service
 * @returns {object} API service methods
 */
export const createApiService = (baseEndpoint) => {
  const service = {
    async get(endpoint = '', config = {}) {
      const url = endpoint ? `${baseEndpoint}${endpoint}` : baseEndpoint;
      const response = await api.get(url, config);
      return response.data;
    },
    
    async post(endpoint = '', data = {}, config = {}) {
      const url = endpoint ? `${baseEndpoint}${endpoint}` : baseEndpoint;
      const response = await api.post(url, data, config);
      return response.data;
    },
    
    async put(endpoint = '', data = {}, config = {}) {
      const url = endpoint ? `${baseEndpoint}${endpoint}` : baseEndpoint;
      const response = await api.put(url, data, config);
      return response.data;
    },
    
    async patch(endpoint = '', data = {}, config = {}) {
      const url = endpoint ? `${baseEndpoint}${endpoint}` : baseEndpoint;
      const response = await api.patch(url, data, config);
      return response.data;
    },
    
    async delete(endpoint = '', config = {}) {
      const url = endpoint ? `${baseEndpoint}${endpoint}` : baseEndpoint;
      const response = await api.delete(url, config);
      return response.data;
    }
  };
  
  return service;
};

export default api;