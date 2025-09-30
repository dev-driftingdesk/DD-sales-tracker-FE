/**
 * Store Helper Utilities
 * Common utilities for Zustand store API integration
 */

import { isApiEnabled } from '../services/api/config.js';
import { ApiError } from '../services/api/errorHandler.js';

/**
 * Create base store state with API integration support
 * @param {object} initialState - Initial state properties
 * @returns {object} Enhanced state with API support
 */
export const createApiStoreState = (initialState = {}) => ({
  // Base API state
  isLoading: false,
  error: null,
  useApiIntegration: isApiEnabled(),
  lastUpdated: null,
  
  // Merge with custom initial state
  ...initialState
});

/**
 * Create base store actions for API integration
 * @param {function} set - Zustand set function
 * @param {function} get - Zustand get function
 * @returns {object} Base actions for API stores
 */
export const createApiStoreActions = (set, get) => ({
  // Loading state management
  setLoading: (isLoading) => set({ isLoading }),
  
  // Error state management
  setError: (error) => set({ 
    error: typeof error === 'string' ? error : error?.message || 'Unknown error',
    isLoading: false 
  }),
  clearError: () => set({ error: null }),
  
  // API integration toggle
  toggleApiIntegration: () => set(state => ({ 
    useApiIntegration: !state.useApiIntegration 
  })),
  
  // Update timestamp
  updateTimestamp: () => set({ lastUpdated: new Date().toISOString() }),
  
  // Generic API call wrapper
  callApi: async (apiCall, options = {}) => {
    const { 
      showLoading = true, 
      clearError = true,
      updateTimestamp = true 
    } = options;
    
    if (showLoading) set({ isLoading: true });
    if (clearError) set({ error: null });
    
    try {
      const result = await apiCall();
      
      if (updateTimestamp) {
        set({ lastUpdated: new Date().toISOString() });
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.getUserMessage() 
        : error.message || 'Unknown error occurred';
      
      set({ error: errorMessage });
      throw error;
    } finally {
      if (showLoading) set({ isLoading: false });
    }
  }
});

/**
 * Create an action that switches between API and mock implementations
 * @param {function} apiImplementation - API-based implementation
 * @param {function} mockImplementation - Mock-based implementation
 * @param {object} options - Configuration options
 * @returns {function} Hybrid action function
 */
export const createHybridAction = (apiImplementation, mockImplementation, options = {}) => {
  const { 
    preferApi = true,
    fallbackToMock = true 
  } = options;
  
  return async function(...args) {
    const state = this; // 'this' will be bound to the store's get() function
    const shouldUseApi = state().useApiIntegration && preferApi;
    
    try {
      if (shouldUseApi) {
        return await apiImplementation.apply(state, args);
      } else {
        return await mockImplementation.apply(state, args);
      }
    } catch (error) {
      // Fallback to mock if API fails and fallback is enabled
      if (shouldUseApi && fallbackToMock && mockImplementation) {
        console.warn('API call failed, falling back to mock:', error);
        return await mockImplementation.apply(state, args);
      }
      throw error;
    }
  };
};

/**
 * Create a loading wrapper for async actions
 * @param {function} action - Async action to wrap
 * @param {object} options - Wrapper options
 * @returns {function} Wrapped action with loading state
 */
export const withLoading = (action, options = {}) => {
  const { 
    loadingKey = 'isLoading',
    errorKey = 'error',
    clearErrorOnStart = true 
  } = options;
  
  return async function(...args) {
    const { set } = this;
    
    // Set loading state
    set({ [loadingKey]: true });
    
    // Clear error if specified
    if (clearErrorOnStart) {
      set({ [errorKey]: null });
    }
    
    try {
      const result = await action.apply(this, args);
      return result;
    } catch (error) {
      // Set error state
      const errorMessage = error instanceof ApiError 
        ? error.getUserMessage() 
        : error.message || 'Unknown error occurred';
      
      set({ [errorKey]: errorMessage });
      throw error;
    } finally {
      // Clear loading state
      set({ [loadingKey]: false });
    }
  };
};

/**
 * Create error handling wrapper for actions
 * @param {function} action - Action to wrap
 * @param {object} options - Error handling options
 * @returns {function} Wrapped action with error handling
 */
export const withErrorHandling = (action, options = {}) => {
  const {
    errorKey = 'error',
    retryCount = 0,
    retryDelay = 1000,
    onError = null
  } = options;
  
  return async function(...args) {
    let lastError;
    
    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const result = await action.apply(this, args);
        return result;
      } catch (error) {
        lastError = error;
        
        // Set error in store
        const errorMessage = error instanceof ApiError 
          ? error.getUserMessage() 
          : error.message || 'Unknown error occurred';
        
        this.set({ [errorKey]: errorMessage });
        
        // Call error handler if provided
        if (onError) {
          onError(error, attempt);
        }
        
        // Retry if not last attempt and error is retryable
        if (attempt < retryCount && (!error.isRetryable || error.isRetryable())) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
          continue;
        }
        
        break;
      }
    }
    
    throw lastError;
  };
};

/**
 * Create data transformation wrapper
 * @param {function} action - Action to wrap
 * @param {function} transformer - Data transformation function
 * @returns {function} Wrapped action with data transformation
 */
export const withTransform = (action, transformer) => {
  return async function(...args) {
    const result = await action.apply(this, args);
    return transformer ? transformer(result) : result;
  };
};

/**
 * Create caching wrapper for actions
 * @param {string} cacheKey - Cache key
 * @param {number} cacheTimeout - Cache timeout in milliseconds
 * @returns {function} Caching wrapper function
 */
export const withCache = (cacheKey, cacheTimeout = 300000) => { // 5 minutes default
  const cache = new Map();
  
  return (action) => {
    return async function(...args) {
      const key = `${cacheKey}_${JSON.stringify(args)}`;
      const now = Date.now();
      
      // Check cache
      if (cache.has(key)) {
        const cached = cache.get(key);
        if (now - cached.timestamp < cacheTimeout) {
          return cached.data;
        }
      }
      
      // Execute action and cache result
      const result = await action.apply(this, args);
      cache.set(key, { data: result, timestamp: now });
      
      return result;
    };
  };
};

/**
 * Create optimistic update wrapper
 * @param {function} updateFn - Function to apply optimistic update
 * @param {function} revertFn - Function to revert on failure
 * @returns {function} Optimistic update wrapper
 */
export const withOptimisticUpdate = (updateFn, revertFn) => {
  return (action) => {
    return async function(...args) {
      const { set, get } = this;
      const previousState = get();
      
      try {
        // Apply optimistic update
        if (updateFn) {
          updateFn(set, get, ...args);
        }
        
        // Execute actual action
        const result = await action.apply(this, args);
        return result;
      } catch (error) {
        // Revert optimistic update on failure
        if (revertFn) {
          revertFn(set, previousState, error);
        } else {
          // Default revert - restore previous state
          set(previousState);
        }
        throw error;
      }
    };
  };
};

/**
 * Compose multiple wrappers
 * @param {...function} wrappers - Wrapper functions to compose
 * @returns {function} Composed wrapper function
 */
export const compose = (...wrappers) => {
  return (action) => {
    return wrappers.reduceRight((wrappedAction, wrapper) => {
      return wrapper(wrappedAction);
    }, action);
  };
};

/**
 * Create pagination helper
 * @param {object} options - Pagination options
 * @returns {object} Pagination utilities
 */
export const createPaginationHelper = (options = {}) => {
  const {
    defaultPage = 1,
    defaultPageSize = 20,
    maxPageSize = 100
  } = options;
  
  return {
    // Pagination state
    page: defaultPage,
    pageSize: Math.min(defaultPageSize, maxPageSize),
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
    
    // Pagination actions
    setPage: (page) => ({ page: Math.max(1, page) }),
    setPageSize: (pageSize) => ({ pageSize: Math.min(Math.max(1, pageSize), maxPageSize) }),
    nextPage: (currentPage) => ({ page: currentPage + 1 }),
    previousPage: (currentPage) => ({ page: Math.max(1, currentPage - 1) }),
    
    // Pagination calculations
    updatePagination: (total, page, pageSize) => {
      const totalPages = Math.ceil(total / pageSize);
      return {
        total,
        totalPages,
        page: Math.min(page, totalPages || 1),
        hasNext: page < totalPages,
        hasPrevious: page > 1
      };
    }
  };
};

export default {
  createApiStoreState,
  createApiStoreActions,
  createHybridAction,
  withLoading,
  withErrorHandling,
  withTransform,
  withCache,
  withOptimisticUpdate,
  compose,
  createPaginationHelper
};