# SalesTracker CRM - API Integration Best Practices

## Overview

This document establishes best practices, coding standards, and risk mitigation strategies for the SalesTracker CRM API integration project. These guidelines ensure consistent, maintainable, and reliable integration between the React frontend and .NET backend.

---

## Table of Contents

1. [Development Standards](#1-development-standards)
2. [API Design Patterns](#2-api-design-patterns)
3. [State Management Best Practices](#3-state-management-best-practices)
4. [Error Handling Strategies](#4-error-handling-strategies)
5. [Performance Optimization](#5-performance-optimization)
6. [Security Guidelines](#6-security-guidelines)
7. [Testing Standards](#7-testing-standards)
8. [Deployment Best Practices](#8-deployment-best-practices)

---

## 1. Development Standards

### 1.1 Code Organization

**File Naming Conventions:**
```
services/api/clients/     → camelCase (authClient.js, crmClient.js)
services/api/models/      → camelCase (auth.models.js, crm.models.js)
components/              → PascalCase (ContactForm.jsx, DealCard.jsx)
hooks/                   → camelCase (useApi.js, useRealtime.js)
constants/               → camelCase (apiEndpoints.js, errorCodes.js)
```

**Import Organization:**
```javascript
// 1. React and third-party imports
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 2. Internal service imports
import { authClient } from '../../../services/api/clients/authClient';
import { apiConfig } from '../../../services/api/config/apiConfig';

// 3. Store and hook imports
import useAuthStore from '../stores/authStore';
import { useApi } from '../../../hooks/useApi';

// 4. Component imports
import LoadingSpinner from '../../../components/LoadingSpinner';

// 5. Type/constant imports
import { endpoints } from '../../../constants/apiEndpoints';
```

**Function Declaration Standards:**
```javascript
// Prefer async/await over Promises
const fetchUserData = async (userId) => {
  try {
    const user = await userClient.getById(userId);
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
};

// Use descriptive function names
const handleContactCreationSuccess = (contact) => {
  // Implementation
};

const handleContactCreationFailure = (error) => {
  // Implementation
};
```

### 1.2 TypeScript-like Documentation

**JSDoc Standards:**
```javascript
/**
 * Creates a new contact with optimistic updates
 * @param {Object} contactData - The contact information
 * @param {string} contactData.name - Contact's full name
 * @param {string} contactData.email - Contact's email address
 * @param {string} [contactData.phone] - Contact's phone number (optional)
 * @returns {Promise<Object>} The created contact object
 * @throws {APIError} When contact creation fails
 * 
 * @example
 * const contact = await createContact({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   phone: '+1234567890'
 * });
 */
const createContact = async (contactData) => {
  // Implementation
};
```

### 1.3 Error Handling Standards

**Consistent Error Objects:**
```javascript
// Standard error structure
const createStandardError = (message, type, details = null) => ({
  message,
  type,
  details,
  timestamp: new Date().toISOString(),
  source: 'frontend'
});

// Usage in API clients
try {
  const response = await apiCall();
  return response.data;
} catch (error) {
  const standardError = createStandardError(
    error.message || 'Operation failed',
    error.type || 'unknown',
    { 
      endpoint: error.config?.url,
      method: error.config?.method,
      status: error.response?.status
    }
  );
  
  throw standardError;
}
```

---

## 2. API Design Patterns

### 2.1 RESTful Client Design

**Resource-Based Client Structure:**
```javascript
class ResourceClient extends BaseAPIClient {
  constructor(resourceName) {
    super();
    this.resourceName = resourceName;
    this.endpoints = {
      list: `/${resourceName}`,
      detail: (id) => `/${resourceName}/${id}`,
      create: `/${resourceName}`,
      update: (id) => `/${resourceName}/${id}`,
      delete: (id) => `/${resourceName}/${id}`
    };
  }
  
  async list(filters = {}, options = {}) {
    return this.get(this.endpoints.list, filters, options);
  }
  
  async detail(id, options = {}) {
    return this.get(this.endpoints.detail(id), {}, options);
  }
  
  async create(data, options = {}) {
    return this.post(this.endpoints.create, data, options);
  }
  
  async update(id, data, options = {}) {
    return this.put(this.endpoints.update(id), data, options);
  }
  
  async remove(id, options = {}) {
    return this.delete(this.endpoints.delete(id), options);
  }
}

// Usage
const contactClient = new ResourceClient('contacts');
const dealClient = new ResourceClient('deals');
```

### 2.2 Data Transformation Patterns

**Consistent Data Models:**
```javascript
// Define clear transformation interfaces
export const transformers = {
  // API to Frontend transformation
  contactFromApi: (apiContact) => ({
    id: apiContact.id,
    name: apiContact.fullName || apiContact.name,
    email: apiContact.emailAddress || apiContact.email,
    phone: apiContact.phoneNumber || apiContact.phone,
    company: apiContact.company?.name || '',
    tags: apiContact.tags || [],
    createdAt: new Date(apiContact.createdAt),
    updatedAt: new Date(apiContact.updatedAt),
    
    // Computed properties
    displayName: apiContact.fullName || apiContact.name,
    isActive: apiContact.status === 'active'
  }),
  
  // Frontend to API transformation
  contactToApi: (contact) => ({
    fullName: contact.name,
    emailAddress: contact.email,
    phoneNumber: contact.phone || null,
    companyId: contact.companyId || null,
    tags: contact.tags || [],
    status: contact.isActive ? 'active' : 'inactive'
  }),
  
  // Batch transformation
  contactsFromApi: (apiContacts) => 
    apiContacts.map(transformers.contactFromApi),
  
  contactsToApi: (contacts) => 
    contacts.map(transformers.contactToApi)
};
```

### 2.3 Request/Response Interceptors

**Standardized Interceptors:**
```javascript
// Request interceptor for common headers
const requestInterceptor = (config) => {
  // Add authentication
  const token = tokenManager.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add request tracking
  config.headers['X-Request-ID'] = generateRequestId();
  config.headers['X-Client-Version'] = process.env.REACT_APP_VERSION;
  
  // Add timestamp for performance tracking
  config.metadata = { startTime: Date.now() };
  
  return config;
};

// Response interceptor for common processing
const responseInterceptor = (response) => {
  // Log performance
  const duration = Date.now() - response.config.metadata.startTime;
  performanceLogger.log({
    endpoint: response.config.url,
    method: response.config.method,
    duration,
    status: response.status,
    cached: response.headers['x-cache-hit'] === 'true'
  });
  
  // Transform response data if needed
  if (response.data && typeof response.data === 'object') {
    response.data = normalizeApiResponse(response.data);
  }
  
  return response;
};
```

---

## 3. State Management Best Practices

### 3.1 Zustand Store Patterns

**Consistent Store Structure:**
```javascript
const createModuleStore = (moduleName, initialState, apiClient) => create(
  persist(
    (set, get) => ({
      // Core state
      ...initialState,
      
      // Loading and error state
      loading: false,
      error: null,
      
      // API integration state
      apiEnabled: apiConfig.features.enableApiIntegration,
      fallbackToMock: apiConfig.features.fallbackToMock,
      lastSyncTime: null,
      
      // Optimistic updates tracking
      optimisticUpdates: new Map(),
      
      // Standard CRUD operations
      ...createCrudOperations(apiClient, set, get),
      
      // Configuration management
      toggleApiMode: () => set(state => ({ 
        apiEnabled: !state.apiEnabled 
      })),
      
      setFallbackMode: (enabled) => set({ 
        fallbackToMock: enabled 
      }),
      
      // Error management
      clearError: () => set({ error: null }),
      
      setError: (error) => set({ 
        error: typeof error === 'string' ? error : error.message 
      })
    }),
    {
      name: `${moduleName}-storage`,
      partialize: (state) => ({
        // Only persist essential data
        [moduleName]: state[moduleName],
        apiEnabled: state.apiEnabled,
        fallbackToMock: state.fallbackToMock
      })
    }
  )
);
```

### 3.2 Optimistic Updates Pattern

**Safe Optimistic Updates:**
```javascript
const createOptimisticUpdate = (entityType) => async (
  actionFn,
  optimisticData,
  rollbackFn
) => {
  const optimisticId = `temp_${Date.now()}_${Math.random()}`;
  
  try {
    // Apply optimistic update
    set(state => ({
      [entityType]: [...state[entityType], { ...optimisticData, id: optimisticId }],
      optimisticUpdates: new Map(state.optimisticUpdates)
        .set(optimisticId, { type: 'creating', data: optimisticData })
    }));
    
    // Perform actual API call
    const result = await actionFn();
    
    // Replace optimistic data with real data
    set(state => {
      const newOptimistic = new Map(state.optimisticUpdates);
      newOptimistic.delete(optimisticId);
      
      return {
        [entityType]: state[entityType].map(item =>
          item.id === optimisticId ? result : item
        ),
        optimisticUpdates: newOptimistic,
        error: null
      };
    });
    
    return result;
  } catch (error) {
    // Rollback optimistic update
    set(state => {
      const newOptimistic = new Map(state.optimisticUpdates);
      newOptimistic.delete(optimisticId);
      
      return {
        [entityType]: state[entityType].filter(item => item.id !== optimisticId),
        optimisticUpdates: newOptimistic,
        error: error.message || 'Operation failed'
      };
    });
    
    // Execute custom rollback if provided
    if (rollbackFn) {
      rollbackFn(error);
    }
    
    throw error;
  }
};
```

### 3.3 Real-time State Synchronization

**Event-Driven State Updates:**
```javascript
const createRealtimeStore = (storeName, signalREvents) => {
  const store = createModuleStore(storeName, initialState, apiClient);
  
  // Set up real-time event handlers
  Object.entries(signalREvents).forEach(([eventName, handler]) => {
    signalRConnection.on(eventName, (data) => {
      const state = store.getState();
      handler(data, state, store.setState);
    });
  });
  
  return store;
};

// Usage
const useCRMStore = createRealtimeStore('crm', {
  'DealUpdated': (dealData, state, setState) => {
    setState({
      deals: state.deals.map(deal =>
        deal.id === dealData.id ? { ...deal, ...dealData } : deal
      )
    });
  },
  
  'ContactUpdated': (contactData, state, setState) => {
    setState({
      contacts: state.contacts.map(contact =>
        contact.id === contactData.id ? { ...contact, ...contactData } : contact
      )
    });
  }
});
```

---

## 4. Error Handling Strategies

### 4.1 Layered Error Handling

**Multi-Level Error Management:**
```javascript
// 1. API Client Level
class APIClient {
  async request(config) {
    try {
      return await this.executeRequest(config);
    } catch (error) {
      // Transform and classify error
      throw this.transformError(error);
    }
  }
  
  transformError(error) {
    if (error.response) {
      return new APIError(
        error.response.data?.message || 'Server error',
        'server',
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      return new APIError(
        'Network connection failed',
        'network',
        null,
        { timeout: error.code === 'ECONNABORTED' }
      );
    } else {
      return new APIError(
        'Request configuration error',
        'client',
        null,
        { originalMessage: error.message }
      );
    }
  }
}

// 2. Store Level
const storeErrorHandler = (operation) => async (...args) => {
  try {
    return await operation(...args);
  } catch (error) {
    // Log error with context
    errorLogger.log(error, {
      operation: operation.name,
      args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg)
    });
    
    // Attempt fallback if available
    if (error.type === 'network' && get().fallbackToMock) {
      try {
        return await mockOperations[operation.name](...args);
      } catch (fallbackError) {
        console.warn('Fallback also failed:', fallbackError);
      }
    }
    
    // Update store error state
    set({ error: error.message });
    
    throw error;
  }
};

// 3. Component Level
const ComponentErrorBoundary = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const handleError = (event) => {
      setError(event.error);
      setHasError(true);
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);
  
  if (hasError) {
    return fallback || <DefaultErrorFallback error={error} />;
  }
  
  return children;
};
```

### 4.2 Circuit Breaker Pattern

**API Resilience:**
```javascript
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000;
    this.monitorTimeout = options.monitorTimeout || 5000;
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
  }
  
  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime < this.resetTimeout) {
        throw new CircuitBreakerOpenError('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
      this.successCount = 0;
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }
  
  onSuccess() {
    this.failureCount = 0;
    
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= 3) {
        this.state = 'CLOSED';
      }
    } else {
      this.state = 'CLOSED';
    }
  }
  
  onFailure(error) {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
  
  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime
    };
  }
}

// Usage
const apiCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 60000
});

const protectedApiCall = async (operation) => {
  return apiCircuitBreaker.execute(operation);
};
```

### 4.3 Retry Strategies

**Intelligent Retry Logic:**
```javascript
const createRetryStrategy = (options = {}) => {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    jitter = true,
    retryableErrors = ['network', 'server_error', 'timeout']
  } = options;
  
  return async (operation) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Don't retry for non-retryable errors
        if (!retryableErrors.includes(error.type)) {
          throw error;
        }
        
        // Don't retry on last attempt
        if (attempt === maxAttempts) {
          break;
        }
        
        // Calculate delay with exponential backoff
        let delay = Math.min(
          baseDelay * Math.pow(backoffMultiplier, attempt - 1),
          maxDelay
        );
        
        // Add jitter to prevent thundering herd
        if (jitter) {
          delay += Math.random() * 1000;
        }
        
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  };
};

// Usage
const retryableOperation = createRetryStrategy({
  maxAttempts: 3,
  baseDelay: 1000,
  retryableErrors: ['network', 'server_error']
});

const fetchData = async () => {
  return retryableOperation(async () => {
    return await apiClient.getData();
  });
};
```

---

## 5. Performance Optimization

### 5.1 Caching Strategies

**Multi-Level Caching:**
```javascript
class CacheManager {
  constructor() {
    // Memory cache for fast access
    this.memoryCache = new Map();
    this.cacheTTL = new Map();
    
    // IndexedDB for persistent cache
    this.dbCache = null;
    this.initIndexedDB();
  }
  
  async initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ApiCache', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.dbCache = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('cache')) {
          const store = db.createObjectStore('cache', { keyPath: 'key' });
          store.createIndex('expiry', 'expiry', { unique: false });
        }
      };
    });
  }
  
  async set(key, data, ttl = 300000) {
    const expiry = Date.now() + ttl;
    
    // Set in memory cache
    this.memoryCache.set(key, data);
    this.cacheTTL.set(key, expiry);
    
    // Set in persistent cache
    if (this.dbCache) {
      try {
        const transaction = this.dbCache.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        await store.put({ key, data, expiry });
      } catch (error) {
        console.warn('Failed to cache to IndexedDB:', error);
      }
    }
  }
  
  async get(key) {
    // Check memory cache first
    if (this.memoryCache.has(key)) {
      const expiry = this.cacheTTL.get(key);
      if (Date.now() < expiry) {
        return this.memoryCache.get(key);
      } else {
        this.memoryCache.delete(key);
        this.cacheTTL.delete(key);
      }
    }
    
    // Check persistent cache
    if (this.dbCache) {
      try {
        const transaction = this.dbCache.transaction(['cache'], 'readonly');
        const store = transaction.objectStore('cache');
        const result = await store.get(key);
        
        if (result && Date.now() < result.expiry) {
          // Restore to memory cache
          this.memoryCache.set(key, result.data);
          this.cacheTTL.set(key, result.expiry);
          return result.data;
        }
      } catch (error) {
        console.warn('Failed to retrieve from IndexedDB:', error);
      }
    }
    
    return null;
  }
  
  invalidate(pattern) {
    // Invalidate memory cache
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
        this.cacheTTL.delete(key);
      }
    }
    
    // Invalidate persistent cache
    if (this.dbCache) {
      try {
        const transaction = this.dbCache.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        const request = store.openCursor();
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            if (cursor.value.key.includes(pattern)) {
              cursor.delete();
            }
            cursor.continue();
          }
        };
      } catch (error) {
        console.warn('Failed to invalidate IndexedDB cache:', error);
      }
    }
  }
}
```

### 5.2 Request Batching

**Efficient Data Fetching:**
```javascript
class RequestBatcher {
  constructor(options = {}) {
    this.batchSize = options.batchSize || 10;
    this.batchDelay = options.batchDelay || 100;
    this.pendingRequests = new Map();
    this.batchTimeouts = new Map();
  }
  
  async batchRequest(endpoint, id, transformer = (data) => data) {
    return new Promise((resolve, reject) => {
      // Add to pending requests
      if (!this.pendingRequests.has(endpoint)) {
        this.pendingRequests.set(endpoint, new Map());
      }
      
      const endpointRequests = this.pendingRequests.get(endpoint);
      endpointRequests.set(id, { resolve, reject, transformer });
      
      // Schedule batch execution
      if (!this.batchTimeouts.has(endpoint)) {
        const timeout = setTimeout(() => {
          this.executeBatch(endpoint);
        }, this.batchDelay);
        
        this.batchTimeouts.set(endpoint, timeout);
      }
      
      // Execute immediately if batch is full
      if (endpointRequests.size >= this.batchSize) {
        clearTimeout(this.batchTimeouts.get(endpoint));
        this.batchTimeouts.delete(endpoint);
        this.executeBatch(endpoint);
      }
    });
  }
  
  async executeBatch(endpoint) {
    const requests = this.pendingRequests.get(endpoint);
    if (!requests || requests.size === 0) return;
    
    // Clear pending requests
    this.pendingRequests.set(endpoint, new Map());
    this.batchTimeouts.delete(endpoint);
    
    const ids = Array.from(requests.keys());
    
    try {
      // Make batch API call
      const response = await apiClient.post(`${endpoint}/batch`, { ids });
      const results = response.data;
      
      // Resolve individual requests
      ids.forEach(id => {
        const request = requests.get(id);
        const result = results.find(item => item.id === id);
        
        if (result) {
          request.resolve(request.transformer(result));
        } else {
          request.reject(new Error(`Item with id ${id} not found`));
        }
      });
    } catch (error) {
      // Reject all requests
      requests.forEach(request => {
        request.reject(error);
      });
    }
  }
}

// Usage
const contactBatcher = new RequestBatcher();

const getContact = async (id) => {
  return contactBatcher.batchRequest('/contacts', id, transformers.contactFromApi);
};
```

### 5.3 Virtual Scrolling for Large Lists

**Performance-Optimized List Rendering:**
```javascript
const VirtualizedList = ({ 
  items, 
  itemHeight, 
  containerHeight, 
  renderItem, 
  overscan = 5 
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef();
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    items.length - 1
  );
  
  const startIndex = Math.max(0, visibleStart - overscan);
  const endIndex = Math.min(items.length - 1, visibleEnd + overscan);
  
  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;
  
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);
  
  return (
    <div
      ref={containerRef}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) =>
            renderItem(item, startIndex + index)
          )}
        </div>
      </div>
    </div>
  );
};
```

---

## 6. Security Guidelines

### 6.1 Token Security

**Secure Token Management:**
```javascript
class SecureTokenManager {
  constructor() {
    this.tokenKey = 'auth_token';
    this.refreshTokenKey = 'refresh_token';
    this.encryption = new TextEncoder();
  }
  
  setTokens(accessToken, refreshToken, expiresIn) {
    try {
      // Store in memory for immediate use
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      
      // Store encrypted in localStorage with expiration
      const tokenData = {
        token: this.encrypt(accessToken),
        expiry: Date.now() + (expiresIn * 1000)
      };
      
      const refreshData = {
        token: this.encrypt(refreshToken),
        expiry: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
      };
      
      localStorage.setItem(this.tokenKey, JSON.stringify(tokenData));
      localStorage.setItem(this.refreshTokenKey, JSON.stringify(refreshData));
      
      this.scheduleTokenCleanup(tokenData.expiry);
    } catch (error) {
      console.error('Failed to store tokens securely:', error);
    }
  }
  
  getAccessToken() {
    // Return from memory if available and valid
    if (this.accessToken && !this.isTokenExpired()) {
      return this.accessToken;
    }
    
    try {
      const tokenData = JSON.parse(localStorage.getItem(this.tokenKey));
      if (tokenData && Date.now() < tokenData.expiry) {
        this.accessToken = this.decrypt(tokenData.token);
        return this.accessToken;
      }
    } catch (error) {
      console.warn('Failed to retrieve access token:', error);
    }
    
    return null;
  }
  
  encrypt(text) {
    // Simple XOR encryption (use stronger encryption in production)
    const key = 'your-encryption-key';
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return btoa(result);
  }
  
  decrypt(encryptedText) {
    const key = 'your-encryption-key';
    const text = atob(encryptedText);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return result;
  }
  
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }
  
  scheduleTokenCleanup(expiryTime) {
    const delay = expiryTime - Date.now();
    if (delay > 0) {
      setTimeout(() => {
        this.clearTokens();
      }, delay);
    }
  }
}
```

### 6.2 Input Validation

**Client-Side Validation:**
```javascript
const createValidator = (schema) => {
  return (data) => {
    const errors = {};
    
    Object.entries(schema).forEach(([field, rules]) => {
      const value = data[field];
      const fieldErrors = [];
      
      // Required validation
      if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
        fieldErrors.push(`${field} is required`);
      }
      
      // Type validation
      if (value && rules.type && typeof value !== rules.type) {
        fieldErrors.push(`${field} must be of type ${rules.type}`);
      }
      
      // Length validation
      if (value && rules.minLength && value.length < rules.minLength) {
        fieldErrors.push(`${field} must be at least ${rules.minLength} characters`);
      }
      
      if (value && rules.maxLength && value.length > rules.maxLength) {
        fieldErrors.push(`${field} must be no more than ${rules.maxLength} characters`);
      }
      
      // Pattern validation
      if (value && rules.pattern && !rules.pattern.test(value)) {
        fieldErrors.push(`${field} format is invalid`);
      }
      
      // Custom validation
      if (value && rules.custom) {
        const customError = rules.custom(value, data);
        if (customError) {
          fieldErrors.push(customError);
        }
      }
      
      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
};

// Usage
const contactValidator = createValidator({
  name: {
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 100
  },
  email: {
    required: true,
    type: 'string',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (email) => {
      // Additional email validation
      if (email.includes('+')) {
        return 'Email aliases with + are not allowed';
      }
    }
  },
  phone: {
    type: 'string',
    pattern: /^\+?[\d\s\-\(\)]+$/
  }
});
```

### 6.3 XSS Prevention

**Content Sanitization:**
```javascript
const sanitizer = {
  sanitizeHtml: (html) => {
    // Remove script tags and event handlers
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '')
      .replace(/javascript:/gi, '');
  },
  
  sanitizeString: (str) => {
    if (typeof str !== 'string') return str;
    
    return str
      .replace(/[<>'"]/g, (char) => {
        const entities = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;'
        };
        return entities[char];
      });
  },
  
  sanitizeObject: (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = {};
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'string') {
        sanitized[key] = sanitizer.sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizer.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    });
    
    return sanitized;
  }
};

// Usage in data transformers
export const transformers = {
  contactFromApi: (apiContact) => sanitizer.sanitizeObject({
    id: apiContact.id,
    name: apiContact.name,
    email: apiContact.email,
    // ... other fields
  })
};
```

---

## 7. Testing Standards

### 7.1 Unit Testing Patterns

**Comprehensive Test Coverage:**
```javascript
// API Client Testing
describe('CRMClient', () => {
  let crmClient;
  let mockAxios;
  
  beforeEach(() => {
    mockAxios = jest.createMockFromModule('axios');
    crmClient = new CRMClient();
    crmClient.client = mockAxios;
  });
  
  describe('getContacts', () => {
    it('should fetch and transform contacts', async () => {
      const mockApiResponse = {
        data: [
          { id: 1, fullName: 'John Doe', emailAddress: 'john@example.com' }
        ]
      };
      
      mockAxios.get.mockResolvedValue(mockApiResponse);
      
      const contacts = await crmClient.getContacts();
      
      expect(mockAxios.get).toHaveBeenCalledWith('/crm/contacts', {});
      expect(contacts).toEqual([
        { id: 1, name: 'John Doe', email: 'john@example.com' }
      ]);
    });
    
    it('should handle API errors gracefully', async () => {
      const mockError = new Error('Network error');
      mockAxios.get.mockRejectedValue(mockError);
      
      await expect(crmClient.getContacts()).rejects.toThrow('Network error');
    });
  });
});

// Store Testing
describe('useCRMStore', () => {
  beforeEach(() => {
    // Reset store
    useCRMStore.setState({
      contacts: [],
      loading: false,
      error: null
    });
  });
  
  it('should handle optimistic contact creation', async () => {
    const store = useCRMStore.getState();
    const contactData = { name: 'Test Contact', email: 'test@example.com' };
    
    // Mock API success
    jest.spyOn(crmClient, 'createContact').mockResolvedValue({
      id: 'real-id',
      ...contactData
    });
    
    const createPromise = store.createContact(contactData);
    
    // Should immediately show optimistic update
    let state = useCRMStore.getState();
    expect(state.contacts).toHaveLength(1);
    expect(state.optimisticUpdates.size).toBe(1);
    
    // Wait for completion
    await createPromise;
    
    // Should resolve optimistic update
    state = useCRMStore.getState();
    expect(state.contacts[0].id).toBe('real-id');
    expect(state.optimisticUpdates.size).toBe(0);
  });
});
```

### 7.2 Integration Testing

**End-to-End API Testing:**
```javascript
describe('API Integration', () => {
  let server;
  
  beforeAll(() => {
    // Set up mock server
    server = setupMockServer();
  });
  
  afterAll(() => {
    server.close();
  });
  
  it('should complete full contact lifecycle', async () => {
    // Login
    const authResult = await authClient.login({
      email: 'test@example.com',
      password: 'password'
    });
    
    expect(authResult.user).toBeDefined();
    
    // Create contact
    const contactData = {
      name: 'Integration Test Contact',
      email: 'integration@example.com'
    };
    
    const createdContact = await crmClient.createContact(contactData);
    expect(createdContact.id).toBeDefined();
    
    // Update contact
    const updatedContact = await crmClient.updateContact(createdContact.id, {
      name: 'Updated Contact'
    });
    expect(updatedContact.name).toBe('Updated Contact');
    
    // Fetch contacts
    const contacts = await crmClient.getContacts();
    expect(contacts.find(c => c.id === createdContact.id)).toBeDefined();
    
    // Delete contact
    await crmClient.deleteContact(createdContact.id);
    
    // Verify deletion
    const contactsAfterDelete = await crmClient.getContacts();
    expect(contactsAfterDelete.find(c => c.id === createdContact.id)).toBeUndefined();
  });
});
```

### 7.3 Performance Testing

**Load Testing with Artillery:**
```yaml
# artillery-config.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Load test"
  processor: "./test-processor.js"

scenarios:
  - name: "API Integration Flow"
    weight: 100
    flow:
      - post:
          url: "/api/v1/auth/login"
          json:
            email: "test@example.com"
            password: "password"
          capture:
            - json: "$.accessToken"
              as: "token"
      
      - get:
          url: "/api/v1/crm/contacts"
          headers:
            Authorization: "Bearer {{ token }}"
          expect:
            - statusCode: 200
      
      - post:
          url: "/api/v1/crm/contacts"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            name: "Load Test Contact {{ $randomString() }}"
            email: "loadtest+{{ $randomString() }}@example.com"
          expect:
            - statusCode: 201
```

---

## 8. Deployment Best Practices

### 8.1 Environment Management

**Configuration Management:**
```javascript
// Environment-specific configuration
const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  const configs = {
    development: {
      apiBaseUrl: 'http://localhost:7001/api/v1',
      signalRUrl: 'http://localhost:7001/hubs',
      enableMockFallback: true,
      logLevel: 'debug',
      enablePerformanceMonitoring: false
    },
    staging: {
      apiBaseUrl: 'https://staging-api.salestracker.com/api/v1',
      signalRUrl: 'https://staging-api.salestracker.com/hubs',
      enableMockFallback: true,
      logLevel: 'info',
      enablePerformanceMonitoring: true
    },
    production: {
      apiBaseUrl: 'https://api.salestracker.com/api/v1',
      signalRUrl: 'https://api.salestracker.com/hubs',
      enableMockFallback: false,
      logLevel: 'error',
      enablePerformanceMonitoring: true
    }
  };
  
  return configs[env] || configs.development;
};
```

### 8.2 Feature Flag Deployment

**Gradual Rollout Strategy:**
```javascript
class FeatureFlagManager {
  constructor() {
    this.flags = this.loadFlags();
    this.userHash = this.getUserHash();
  }
  
  loadFlags() {
    return {
      apiIntegration: {
        enabled: process.env.REACT_APP_API_INTEGRATION_ENABLED === 'true',
        rolloutPercentage: parseInt(process.env.REACT_APP_API_ROLLOUT_PERCENTAGE) || 100,
        whitelistedUsers: (process.env.REACT_APP_API_WHITELIST || '').split(',').filter(Boolean)
      },
      realTimeFeatures: {
        enabled: process.env.REACT_APP_REALTIME_ENABLED === 'true',
        rolloutPercentage: parseInt(process.env.REACT_APP_REALTIME_ROLLOUT_PERCENTAGE) || 50
      }
    };
  }
  
  getUserHash() {
    const { user } = useAuthStore.getState();
    if (!user) return 0;
    
    // Simple hash function for consistent user assignment
    let hash = 0;
    for (let i = 0; i < user.id.length; i++) {
      const char = user.id.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100;
  }
  
  isFeatureEnabled(featureName) {
    const flag = this.flags[featureName];
    if (!flag) return false;
    
    // Check if feature is globally enabled
    if (!flag.enabled) return false;
    
    // Check whitelist
    const { user } = useAuthStore.getState();
    if (user && flag.whitelistedUsers?.includes(user.id)) {
      return true;
    }
    
    // Check rollout percentage
    return this.userHash < flag.rolloutPercentage;
  }
  
  shouldUseApi() {
    return this.isFeatureEnabled('apiIntegration');
  }
  
  shouldUseRealTime() {
    return this.isFeatureEnabled('realTimeFeatures');
  }
}

export const featureFlags = new FeatureFlagManager();
```

### 8.3 Monitoring and Alerting

**Production Monitoring:**
```javascript
class ProductionMonitor {
  constructor() {
    this.metrics = {
      apiCalls: 0,
      errors: 0,
      averageResponseTime: 0,
      cacheHitRate: 0
    };
    
    this.alerts = [];
    this.thresholds = {
      errorRate: 0.05, // 5%
      responseTime: 2000, // 2 seconds
      cacheHitRate: 0.7 // 70%
    };
  }
  
  recordApiCall(duration, success, cached = false) {
    this.metrics.apiCalls++;
    
    if (!success) {
      this.metrics.errors++;
    }
    
    // Update average response time
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime + duration) / 2;
    
    if (cached) {
      this.metrics.cacheHitRate = 
        (this.metrics.cacheHitRate + 1) / 2;
    }
    
    this.checkThresholds();
  }
  
  checkThresholds() {
    const errorRate = this.metrics.errors / this.metrics.apiCalls;
    
    if (errorRate > this.thresholds.errorRate) {
      this.triggerAlert('HIGH_ERROR_RATE', {
        current: errorRate,
        threshold: this.thresholds.errorRate
      });
    }
    
    if (this.metrics.averageResponseTime > this.thresholds.responseTime) {
      this.triggerAlert('SLOW_RESPONSE_TIME', {
        current: this.metrics.averageResponseTime,
        threshold: this.thresholds.responseTime
      });
    }
  }
  
  triggerAlert(type, data) {
    const alert = {
      type,
      data,
      timestamp: new Date().toISOString()
    };
    
    this.alerts.push(alert);
    
    // Send to monitoring service
    if (window.datadog) {
      window.datadog.increment('salestracker.alert', 1, [`type:${type}`]);
    }
    
    console.error('Performance Alert:', alert);
  }
  
  getHealthStatus() {
    const errorRate = this.metrics.errors / this.metrics.apiCalls || 0;
    
    return {
      status: errorRate < this.thresholds.errorRate && 
              this.metrics.averageResponseTime < this.thresholds.responseTime
              ? 'healthy' : 'degraded',
      metrics: this.metrics,
      alerts: this.alerts.slice(-10), // Last 10 alerts
      timestamp: new Date().toISOString()
    };
  }
}

export const productionMonitor = new ProductionMonitor();
```

---

## Conclusion

These best practices provide a comprehensive foundation for building a robust, maintainable, and scalable API integration for the SalesTracker CRM system. Key principles include:

1. **Consistency** - Standardized patterns across all modules
2. **Resilience** - Comprehensive error handling and fallback strategies
3. **Performance** - Optimized caching, batching, and loading strategies
4. **Security** - Secure token management and input validation
5. **Monitoring** - Comprehensive observability and alerting
6. **Maintainability** - Clear code organization and documentation

Following these guidelines will ensure the API integration project delivers a high-quality, production-ready solution that scales with business needs while maintaining excellent user experience.