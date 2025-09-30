/**
 * Base API Store Hook
 * Provides common functionality for API-enabled Zustand stores
 */

import { useCallback, useEffect, useRef } from 'react';
import { isApiEnabled } from '../services/api/config.js';
import { ApiError } from '../services/api/errorHandler.js';

/**
 * Custom hook for API-enabled stores
 * @param {object} store - Zustand store instance
 * @param {object} options - Configuration options
 * @returns {object} Enhanced store with API capabilities
 */
export const useApiStore = (store, options = {}) => {
  const {
    enableAutoRefresh = false,
    refreshInterval = 60000, // 1 minute
    enableErrorRecovery = true,
    maxRetries = 3
  } = options;

  const retryCountRef = useRef(0);
  const refreshTimeoutRef = useRef(null);

  // Get store state and actions
  const storeState = store();
  
  /**
   * Generic API call wrapper with error handling
   * @param {function} apiCall - API function to call
   * @param {object} options - Call options
   * @returns {Promise} API call result
   */
  const callApi = useCallback(async (apiCall, callOptions = {}) => {
    const {
      onSuccess,
      onError,
      onFinally,
      showLoading = true,
      retryOnError = enableErrorRecovery
    } = callOptions;

    if (showLoading && store.getState().setLoading) {
      store.getState().setLoading(true);
    }

    if (store.getState().clearError) {
      store.getState().clearError();
    }

    try {
      const result = await apiCall();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      retryCountRef.current = 0; // Reset retry count on success
      return result;
    } catch (error) {
      console.error('API call failed:', error);
      
      // Handle API errors
      const apiError = error instanceof ApiError ? error : new ApiError(
        error.message || 'Unknown error occurred',
        'UNKNOWN_ERROR',
        error.status || 500,
        error
      );

      // Set error in store if available
      if (store.getState().setError) {
        store.getState().setError(apiError.getUserMessage());
      }

      // Retry logic for retryable errors
      if (retryOnError && apiError.isRetryable() && retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        
        // Calculate delay with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 10000);
        
        console.log(`Retrying API call (attempt ${retryCountRef.current}/${maxRetries}) in ${delay}ms`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return callApi(apiCall, callOptions);
      }

      if (onError) {
        onError(apiError);
      }

      throw apiError;
    } finally {
      if (showLoading && store.getState().setLoading) {
        store.getState().setLoading(false);
      }
      
      if (onFinally) {
        onFinally();
      }
    }
  }, [store, enableErrorRecovery, maxRetries]);

  /**
   * Setup automatic data refresh
   * @param {function} refreshFunction - Function to call for refresh
   */
  const setupAutoRefresh = useCallback((refreshFunction) => {
    if (!enableAutoRefresh || !refreshFunction) return;

    const scheduleRefresh = () => {
      refreshTimeoutRef.current = setTimeout(async () => {
        try {
          await refreshFunction();
        } catch (error) {
          console.warn('Auto-refresh failed:', error);
        }
        scheduleRefresh(); // Schedule next refresh
      }, refreshInterval);
    };

    scheduleRefresh();

    // Cleanup function
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, [enableAutoRefresh, refreshInterval]);

  /**
   * Check if store should use API integration
   * @returns {boolean} True if API should be used
   */
  const shouldUseApi = useCallback(() => {
    return isApiEnabled() && (storeState.useApiIntegration !== false);
  }, [storeState.useApiIntegration]);

  /**
   * Create an action wrapper that handles API/mock switching
   * @param {function} apiAction - Action that uses API
   * @param {function} mockAction - Action that uses mock data
   * @returns {function} Wrapped action
   */
  const createApiAction = useCallback((apiAction, mockAction) => {
    return async (...args) => {
      if (shouldUseApi()) {
        return callApi(() => apiAction(...args));
      } else {
        return mockAction ? mockAction(...args) : apiAction(...args);
      }
    };
  }, [shouldUseApi, callApi]);

  /**
   * Create a data fetcher with caching
   * @param {string} cacheKey - Cache key for the data
   * @param {function} fetchFunction - Function to fetch data
   * @param {number} cacheTimeout - Cache timeout in milliseconds
   * @returns {function} Data fetcher function
   */
  const createDataFetcher = useCallback((cacheKey, fetchFunction, cacheTimeout = 300000) => {
    const cacheRef = useRef(new Map());
    
    return async (forceRefresh = false) => {
      const cache = cacheRef.current;
      const now = Date.now();
      
      if (!forceRefresh && cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (now - cached.timestamp < cacheTimeout) {
          return cached.data;
        }
      }
      
      const data = await callApi(fetchFunction);
      cache.set(cacheKey, { data, timestamp: now });
      
      return data;
    };
  }, [callApi]);

  /**
   * Cleanup resources on unmount
   */
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Store state
    ...storeState,
    
    // API utilities
    callApi,
    createApiAction,
    createDataFetcher,
    setupAutoRefresh,
    shouldUseApi,
    
    // State helpers
    isLoading: storeState.isLoading || false,
    error: storeState.error || null,
    hasError: !!(storeState.error),
    
    // Retry information
    retryCount: retryCountRef.current,
    canRetry: retryCountRef.current < maxRetries
  };
};

export default useApiStore;