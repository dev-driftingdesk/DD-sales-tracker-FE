# SalesTracker CRM - API Integration Implementation Plan

## Overview

This document provides detailed implementation guidance for integrating the SalesTracker CRM frontend with backend APIs. It includes specific code examples, file structures, and step-by-step implementation instructions.

---

## Table of Contents

1. [Implementation Prerequisites](#1-implementation-prerequisites)
2. [Base Infrastructure Setup](#2-base-infrastructure-setup)
3. [Module-Specific Implementation](#3-module-specific-implementation)
4. [Testing Strategy](#4-testing-strategy)
5. [Deployment Guidelines](#5-deployment-guidelines)
6. [Monitoring and Maintenance](#6-monitoring-and-maintenance)

---

## 1. Implementation Prerequisites

### 1.1 Environment Setup

**Required Environment Variables:**
```env
# .env.development
REACT_APP_API_BASE_URL=https://localhost:7001/api/v1
REACT_APP_SIGNALR_URL=https://localhost:7001/hubs
REACT_APP_API_TIMEOUT=10000
REACT_APP_RETRY_ATTEMPTS=3
REACT_APP_ENABLE_API_INTEGRATION=true
REACT_APP_FALLBACK_TO_MOCK=true
REACT_APP_LOG_LEVEL=debug

# .env.production
REACT_APP_API_BASE_URL=https://api.salestracker.com/api/v1
REACT_APP_SIGNALR_URL=https://api.salestracker.com/hubs
REACT_APP_API_TIMEOUT=15000
REACT_APP_RETRY_ATTEMPTS=3
REACT_APP_ENABLE_API_INTEGRATION=true
REACT_APP_FALLBACK_TO_MOCK=false
REACT_APP_LOG_LEVEL=error
```

**Additional Dependencies:**
```json
{
  "dependencies": {
    "axios": "^1.6.2",
    "@microsoft/signalr": "^8.0.0",
    "lodash.debounce": "^4.0.8",
    "jwt-decode": "^4.0.0",
    "react-query": "^3.39.3"
  }
}
```

### 1.2 Project Structure Extensions

**New Directory Structure:**
```
src/
├── services/
│   ├── api/
│   │   ├── config/
│   │   │   ├── apiConfig.js
│   │   │   ├── endpoints.js
│   │   │   └── interceptors.js
│   │   ├── clients/
│   │   │   ├── baseClient.js
│   │   │   ├── authClient.js
│   │   │   ├── crmClient.js
│   │   │   ├── leadClient.js
│   │   │   ├── analyticsClient.js
│   │   │   ├── emailClient.js
│   │   │   └── notificationClient.js
│   │   ├── models/
│   │   │   ├── auth.models.js
│   │   │   ├── crm.models.js
│   │   │   ├── lead.models.js
│   │   │   └── common.models.js
│   │   └── utils/
│   │       ├── apiUtils.js
│   │       ├── errorHandling.js
│   │       ├── dataTransformers.js
│   │       └── validators.js
│   ├── realtime/
│   │   ├── signalRConnection.js
│   │   ├── notificationHub.js
│   │   └── activityHub.js
│   ├── storage/
│   │   ├── cacheManager.js
│   │   ├── tokenManager.js
│   │   └── offlineStorage.js
│   └── integration/
│       ├── emailServices.js
│       └── webhookHandler.js
├── hooks/
│   ├── useApi.js
│   ├── useRealtime.js
│   └── useOffline.js
└── constants/
    ├── apiEndpoints.js
    └── errorCodes.js
```

---

## 2. Base Infrastructure Setup

### 2.1 API Configuration

**src/services/api/config/apiConfig.js:**
```javascript
export const apiConfig = {
  // Base configuration
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://localhost:7001/api/v1',
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000,
  retryAttempts: parseInt(process.env.REACT_APP_RETRY_ATTEMPTS) || 3,
  retryDelay: 1000,
  
  // Feature flags
  features: {
    enableApiIntegration: process.env.REACT_APP_ENABLE_API_INTEGRATION === 'true',
    fallbackToMock: process.env.REACT_APP_FALLBACK_TO_MOCK === 'true',
    enableRealTime: true,
    enableOfflineMode: false,
    enableAdvancedCaching: true
  },
  
  // Authentication configuration
  auth: {
    tokenKey: 'salestracker_access_token',
    refreshTokenKey: 'salestracker_refresh_token',
    tokenExpiration: 3600000, // 1 hour
    refreshThreshold: 300000, // 5 minutes before expiry
    maxRetries: 3
  },
  
  // Cache configuration
  cache: {
    defaultTTL: 300000, // 5 minutes
    maxSize: 100, // Max cached items
    strategies: {
      users: 600000, // 10 minutes
      deals: 180000, // 3 minutes
      contacts: 300000, // 5 minutes
      analytics: 60000 // 1 minute
    }
  },
  
  // Real-time configuration
  signalR: {
    url: process.env.REACT_APP_SIGNALR_URL || 'https://localhost:7001/hubs',
    reconnectAttempts: 5,
    reconnectInterval: 5000
  }
};
```

**src/services/api/config/endpoints.js:**
```javascript
export const endpoints = {
  // Authentication endpoints
  auth: {
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    profile: '/auth/profile',
    changePassword: '/auth/change-password',
    resetPassword: '/auth/reset-password'
  },
  
  // CRM Core endpoints
  crm: {
    // Contacts
    contacts: '/crm/contacts',
    contactById: (id) => `/crm/contacts/${id}`,
    contactSearch: '/crm/contacts/search',
    
    // Companies
    companies: '/crm/companies',
    companyById: (id) => `/crm/companies/${id}`,
    companySearch: '/crm/companies/search',
    
    // Deals
    deals: '/crm/deals',
    dealById: (id) => `/crm/deals/${id}`,
    dealStages: '/crm/deal-stages',
    moveDeal: (id) => `/crm/deals/${id}/move`,
    
    // Activities
    activities: '/crm/activities',
    activityById: (id) => `/crm/activities/${id}`,
    
    // Products
    products: '/crm/products',
    productById: (id) => `/crm/products/${id}`,
    productCategories: '/crm/product-categories'
  },
  
  // Lead management endpoints
  leads: {
    leads: '/leads',
    leadById: (id) => `/leads/${id}`,
    leadAssignment: '/leads/assignment',
    leadScoring: '/leads/scoring',
    leadConversion: (id) => `/leads/${id}/convert`,
    leadBulkImport: '/leads/bulk-import'
  },
  
  // Analytics endpoints
  analytics: {
    salesVelocity: '/analytics/sales-velocity',
    pipelineMetrics: '/analytics/pipeline',
    performanceMetrics: '/analytics/performance',
    revenueMetrics: '/analytics/revenue',
    customReports: '/analytics/reports'
  },
  
  // Notification endpoints
  notifications: {
    notifications: '/notifications',
    notificationById: (id) => `/notifications/${id}`,
    markAsRead: (id) => `/notifications/${id}/read`,
    preferences: '/notifications/preferences'
  },
  
  // Email endpoints
  email: {
    emails: '/email',
    emailById: (id) => `/email/${id}`,
    send: '/email/send',
    templates: '/email/templates',
    settings: '/email/settings'
  },
  
  // Team management endpoints
  team: {
    users: '/team/users',
    userById: (id) => `/team/users/${id}`,
    roles: '/team/roles',
    permissions: '/team/permissions'
  }
};
```

### 2.2 Base API Client

**src/services/api/clients/baseClient.js:**
```javascript
import axios from 'axios';
import { apiConfig } from '../config/apiConfig';
import { handleApiError } from '../utils/errorHandling';
import { tokenManager } from '../../storage/tokenManager';
import { cacheManager } from '../../storage/cacheManager';

export class BaseAPIClient {
  constructor() {
    this.client = axios.create({
      baseURL: apiConfig.baseURL,
      timeout: apiConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    this.setupInterceptors();
  }
  
  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add authentication token
        const token = tokenManager.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add request metadata
        config.metadata = {
          startTime: Date.now(),
          requestId: this.generateRequestId()
        };
        
        config.headers['X-Request-ID'] = config.metadata.requestId;
        
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          requestId: config.metadata.requestId,
          data: config.data
        });
        
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );
    
    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log performance metrics
        const duration = Date.now() - response.config.metadata.startTime;
        console.log(`API Response: ${response.status} ${response.config.url}`, {
          requestId: response.config.metadata.requestId,
          duration: `${duration}ms`,
          data: response.data
        });
        
        return response;
      },
      async (error) => {
        // Handle token refresh for 401 errors
        if (error.response?.status === 401 && !error.config._retry) {
          error.config._retry = true;
          
          try {
            await tokenManager.refreshToken();
            const token = tokenManager.getAccessToken();
            if (token) {
              error.config.headers.Authorization = `Bearer ${token}`;
              return this.client.request(error.config);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            tokenManager.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        
        // Log error details
        console.error(`API Error: ${error.response?.status || 'Network'} ${error.config?.url}`, {
          requestId: error.config?.metadata?.requestId,
          error: error.response?.data || error.message
        });
        
        return Promise.reject(handleApiError(error));
      }
    );
  }
  
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
  
  async request(method, endpoint, data = null, options = {}) {
    const config = {
      method,
      url: endpoint,
      ...options
    };
    
    if (data) {
      if (method.toUpperCase() === 'GET') {
        config.params = data;
      } else {
        config.data = data;
      }
    }
    
    // Check cache for GET requests
    if (method.toUpperCase() === 'GET' && options.cache !== false) {
      const cacheKey = this.getCacheKey(endpoint, data);
      const cached = cacheManager.get(cacheKey);
      if (cached) {
        console.log(`Cache hit: ${endpoint}`);
        return { data: cached };
      }
    }
    
    try {
      const response = await this.client.request(config);
      
      // Cache successful GET responses
      if (method.toUpperCase() === 'GET' && options.cache !== false) {
        const cacheKey = this.getCacheKey(endpoint, data);
        const ttl = options.cacheTTL || apiConfig.cache.defaultTTL;
        cacheManager.set(cacheKey, response.data, ttl);
      }
      
      return response;
    } catch (error) {
      // Check if we should fallback to mock data
      if (apiConfig.features.fallbackToMock && error.type === 'network') {
        console.warn(`Network error, attempting fallback for: ${endpoint}`);
        throw new Error('FALLBACK_TO_MOCK');
      }
      
      throw error;
    }
  }
  
  getCacheKey(endpoint, params = {}) {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${endpoint}${paramString ? '?' + paramString : ''}`;
  }
  
  async get(endpoint, params = {}, options = {}) {
    return this.request('GET', endpoint, params, options);
  }
  
  async post(endpoint, data = {}, options = {}) {
    return this.request('POST', endpoint, data, options);
  }
  
  async put(endpoint, data = {}, options = {}) {
    return this.request('PUT', endpoint, data, options);
  }
  
  async patch(endpoint, data = {}, options = {}) {
    return this.request('PATCH', endpoint, data, options);
  }
  
  async delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, null, options);
  }
}

export const baseClient = new BaseAPIClient();
```

### 2.3 Token Management

**src/services/storage/tokenManager.js:**
```javascript
import { apiConfig } from '../api/config/apiConfig';
import { baseClient } from '../api/clients/baseClient';
import { endpoints } from '../api/config/endpoints';

class TokenManager {
  constructor() {
    this.refreshTimer = null;
    this.isRefreshing = false;
    this.refreshPromise = null;
  }
  
  setTokens(accessToken, refreshToken, expiresIn) {
    const expirationTime = Date.now() + (expiresIn * 1000);
    
    localStorage.setItem(apiConfig.auth.tokenKey, accessToken);
    localStorage.setItem(apiConfig.auth.refreshTokenKey, refreshToken);
    localStorage.setItem('token_expiration', expirationTime.toString());
    
    this.scheduleTokenRefresh(expirationTime);
  }
  
  getAccessToken() {
    return localStorage.getItem(apiConfig.auth.tokenKey);
  }
  
  getRefreshToken() {
    return localStorage.getItem(apiConfig.auth.refreshTokenKey);
  }
  
  getTokenExpiration() {
    const expiration = localStorage.getItem('token_expiration');
    return expiration ? parseInt(expiration) : null;
  }
  
  isTokenExpired() {
    const expiration = this.getTokenExpiration();
    return expiration ? Date.now() >= expiration : true;
  }
  
  shouldRefreshToken() {
    const expiration = this.getTokenExpiration();
    return expiration 
      ? Date.now() >= (expiration - apiConfig.auth.refreshThreshold)
      : false;
  }
  
  clearTokens() {
    localStorage.removeItem(apiConfig.auth.tokenKey);
    localStorage.removeItem(apiConfig.auth.refreshTokenKey);
    localStorage.removeItem('token_expiration');
    
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
  
  async refreshToken() {
    if (this.isRefreshing) {
      return this.refreshPromise;
    }
    
    this.isRefreshing = true;
    this.refreshPromise = this._performTokenRefresh();
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }
  
  async _performTokenRefresh() {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await baseClient.post(endpoints.auth.refresh, {
        refreshToken
      }, { 
        _skipAuth: true // Prevent infinite recursion
      });
      
      const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;
      
      this.setTokens(accessToken, newRefreshToken, expiresIn);
      
      console.log('Token refreshed successfully');
      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      throw error;
    }
  }
  
  scheduleTokenRefresh(expirationTime) {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    
    const refreshTime = expirationTime - apiConfig.auth.refreshThreshold;
    const delay = Math.max(0, refreshTime - Date.now());
    
    this.refreshTimer = setTimeout(async () => {
      try {
        await this.refreshToken();
      } catch (error) {
        console.error('Scheduled token refresh failed:', error);
      }
    }, delay);
  }
  
  startTokenRefreshTimer() {
    const expiration = this.getTokenExpiration();
    if (expiration) {
      this.scheduleTokenRefresh(expiration);
    }
  }
}

export const tokenManager = new TokenManager();
```

### 2.4 Error Handling

**src/services/api/utils/errorHandling.js:**
```javascript
export const ErrorTypes = {
  NETWORK: 'network',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  VALIDATION: 'validation',
  NOT_FOUND: 'not_found',
  SERVER_ERROR: 'server_error',
  UNKNOWN: 'unknown'
};

export class APIError extends Error {
  constructor(message, type, status = null, details = null) {
    super(message);
    this.name = 'APIError';
    this.type = type;
    this.status = status;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export const handleApiError = (error) => {
  // Network errors
  if (!error.response) {
    return new APIError(
      'Unable to connect to server. Please check your internet connection.',
      ErrorTypes.NETWORK,
      null,
      { originalError: error.message }
    );
  }
  
  const { status, data } = error.response;
  
  switch (status) {
    case 400:
      return new APIError(
        data.message || 'Invalid request',
        ErrorTypes.VALIDATION,
        status,
        data.errors || {}
      );
      
    case 401:
      return new APIError(
        'Authentication required',
        ErrorTypes.AUTHENTICATION,
        status,
        { redirectToLogin: true }
      );
      
    case 403:
      return new APIError(
        'You do not have permission to perform this action',
        ErrorTypes.AUTHORIZATION,
        status
      );
      
    case 404:
      return new APIError(
        'The requested resource was not found',
        ErrorTypes.NOT_FOUND,
        status
      );
      
    case 409:
      return new APIError(
        data.message || 'Resource conflict',
        ErrorTypes.VALIDATION,
        status,
        data.details || {}
      );
      
    case 422:
      return new APIError(
        'Validation failed',
        ErrorTypes.VALIDATION,
        status,
        data.errors || {}
      );
      
    case 500:
    case 502:
    case 503:
    case 504:
      return new APIError(
        'Server error occurred. Please try again later.',
        ErrorTypes.SERVER_ERROR,
        status,
        { retryable: true }
      );
      
    default:
      return new APIError(
        data.message || 'An unexpected error occurred',
        ErrorTypes.UNKNOWN,
        status,
        data
      );
  }
};

export const retryWithBackoff = async (fn, maxAttempts = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry for certain error types
      if (error.type === ErrorTypes.AUTHENTICATION || 
          error.type === ErrorTypes.AUTHORIZATION ||
          error.type === ErrorTypes.VALIDATION) {
        throw error;
      }
      
      if (attempt === maxAttempts) {
        break;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

export const createErrorHandler = (fallbackFn = null) => {
  return async (error) => {
    console.error('API operation failed:', error);
    
    // Attempt fallback if available
    if (fallbackFn && (error.type === ErrorTypes.NETWORK || error.type === ErrorTypes.SERVER_ERROR)) {
      try {
        console.log('Attempting fallback operation');
        return await fallbackFn();
      } catch (fallbackError) {
        console.error('Fallback operation also failed:', fallbackError);
      }
    }
    
    // Re-throw the original error
    throw error;
  };
};
```

---

## 3. Module-Specific Implementation

### 3.1 Authentication Module Enhancement

**src/services/api/clients/authClient.js:**
```javascript
import { BaseAPIClient } from './baseClient';
import { endpoints } from '../config/endpoints';
import { tokenManager } from '../../storage/tokenManager';

class AuthClient extends BaseAPIClient {
  async login(credentials) {
    const response = await this.post(endpoints.auth.login, credentials, {
      _skipAuth: true // Don't add auth header for login
    });
    
    const { user, accessToken, refreshToken, expiresIn } = response.data;
    
    // Store tokens
    tokenManager.setTokens(accessToken, refreshToken, expiresIn);
    
    return { user, accessToken, refreshToken };
  }
  
  async logout() {
    try {
      await this.post(endpoints.auth.logout);
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      tokenManager.clearTokens();
    }
  }
  
  async refreshToken() {
    return tokenManager.refreshToken();
  }
  
  async getProfile() {
    const response = await this.get(endpoints.auth.profile);
    return response.data;
  }
  
  async updateProfile(profileData) {
    const response = await this.put(endpoints.auth.profile, profileData);
    return response.data;
  }
  
  async changePassword(passwordData) {
    const response = await this.post(endpoints.auth.changePassword, passwordData);
    return response.data;
  }
  
  async resetPassword(email) {
    const response = await this.post(endpoints.auth.resetPassword, { email }, {
      _skipAuth: true
    });
    return response.data;
  }
}

export const authClient = new AuthClient();
```

**Enhanced Auth Store (src/modules/auth/stores/authStore.js):**
```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authClient } from '../../../services/api/clients/authClient';
import { apiConfig } from '../../../services/api/config/apiConfig';
import { createErrorHandler } from '../../../services/api/utils/errorHandling';

// Mock data fallback
const mockAuthService = {
  async login(credentials) {
    const mockUser = {
      id: '1',
      email: credentials.email,
      name: 'Mock User',
      role: 'sales_rep',
      avatar: null
    };
    return { user: mockUser };
  },
  async logout() {
    return { success: true };
  }
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      rememberMe: false,
      
      // API integration flags
      apiEnabled: apiConfig.features.enableApiIntegration,
      fallbackToMock: apiConfig.features.fallbackToMock,
      lastSyncTime: null,
      
      // Enhanced login with API integration
      login: async (credentials, rememberMe = false) => {
        set({ isLoading: true, error: null });
        
        const performLogin = async () => {
          if (get().apiEnabled) {
            try {
              const result = await authClient.login(credentials);
              set({ 
                lastSyncTime: new Date().toISOString(),
                error: null 
              });
              return result;
            } catch (error) {
              if (error.message === 'FALLBACK_TO_MOCK') {
                throw error; // Let error handler manage fallback
              }
              throw error;
            }
          } else {
            return mockAuthService.login(credentials);
          }
        };
        
        const handleFallback = get().fallbackToMock 
          ? () => mockAuthService.login(credentials)
          : null;
        
        const errorHandler = createErrorHandler(handleFallback);
        
        try {
          const { user } = await errorHandler(performLogin);
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            rememberMe
          });
          
          return { success: true, user };
        } catch (error) {
          let errorMessage = error.message || 'Login failed';
          
          if (error.type === 'validation' && error.details) {
            errorMessage = Object.values(error.details).flat().join(', ');
          }
          
          set({
            isLoading: false,
            error: errorMessage,
            user: null,
            isAuthenticated: false
          });
          
          return { success: false, error: errorMessage };
        }
      },
      
      // Enhanced logout
      logout: async () => {
        try {
          if (get().apiEnabled) {
            await authClient.logout();
          } else {
            await mockAuthService.logout();
          }
        } catch (error) {
          console.warn('Logout failed:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            error: null,
            lastSyncTime: null
          });
        }
      },
      
      // Profile management
      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        
        try {
          let updatedUser;
          
          if (get().apiEnabled) {
            updatedUser = await authClient.updateProfile(profileData);
          } else {
            // Mock update
            updatedUser = { ...get().user, ...profileData };
          }
          
          set({
            user: updatedUser,
            isLoading: false,
            error: null
          });
          
          return { success: true, user: updatedUser };
        } catch (error) {
          set({
            isLoading: false,
            error: error.message || 'Profile update failed'
          });
          
          return { success: false, error: error.message };
        }
      },
      
      // Password management
      changePassword: async (passwordData) => {
        set({ isLoading: true, error: null });
        
        try {
          if (get().apiEnabled) {
            await authClient.changePassword(passwordData);
          } else {
            // Mock password change
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          set({ isLoading: false, error: null });
          return { success: true, message: 'Password changed successfully' };
        } catch (error) {
          set({
            isLoading: false,
            error: error.message || 'Password change failed'
          });
          
          return { success: false, error: error.message };
        }
      },
      
      // Configuration management
      toggleApiMode: () => set(state => ({ 
        apiEnabled: !state.apiEnabled 
      })),
      
      setFallbackMode: (enabled) => set({ 
        fallbackToMock: enabled 
      }),
      
      clearError: () => set({ error: null }),
      
      // Initialize authentication state
      initialize: async () => {
        const token = tokenManager.getAccessToken();
        
        if (token && !tokenManager.isTokenExpired()) {
          try {
            if (get().apiEnabled) {
              const user = await authClient.getProfile();
              set({
                user,
                isAuthenticated: true,
                lastSyncTime: new Date().toISOString()
              });
            }
          } catch (error) {
            console.warn('Failed to restore authentication:', error);
            set({
              user: null,
              isAuthenticated: false
            });
          }
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.rememberMe ? state.user : null,
        isAuthenticated: state.rememberMe ? state.isAuthenticated : false,
        rememberMe: state.rememberMe,
        apiEnabled: state.apiEnabled,
        fallbackToMock: state.fallbackToMock
      })
    }
  )
);

export default useAuthStore;
```

### 3.2 CRM Core Module Enhancement

**src/services/api/clients/crmClient.js:**
```javascript
import { BaseAPIClient } from './baseClient';
import { endpoints } from '../config/endpoints';
import { transformers } from '../utils/dataTransformers';

class CRMClient extends BaseAPIClient {
  // Contact operations
  async getContacts(filters = {}) {
    const response = await this.get(endpoints.crm.contacts, filters);
    return response.data.map(transformers.contactFromApi);
  }
  
  async getContactById(id) {
    const response = await this.get(endpoints.crm.contactById(id));
    return transformers.contactFromApi(response.data);
  }
  
  async createContact(contactData) {
    const apiData = transformers.contactToApi(contactData);
    const response = await this.post(endpoints.crm.contacts, apiData);
    return transformers.contactFromApi(response.data);
  }
  
  async updateContact(id, contactData) {
    const apiData = transformers.contactToApi(contactData);
    const response = await this.put(endpoints.crm.contactById(id), apiData);
    return transformers.contactFromApi(response.data);
  }
  
  async deleteContact(id) {
    await this.delete(endpoints.crm.contactById(id));
    return { success: true };
  }
  
  // Deal operations
  async getDeals(filters = {}) {
    const response = await this.get(endpoints.crm.deals, filters);
    return response.data.map(transformers.dealFromApi);
  }
  
  async getDealById(id) {
    const response = await this.get(endpoints.crm.dealById(id));
    return transformers.dealFromApi(response.data);
  }
  
  async createDeal(dealData) {
    const apiData = transformers.dealToApi(dealData);
    const response = await this.post(endpoints.crm.deals, apiData);
    return transformers.dealFromApi(response.data);
  }
  
  async updateDeal(id, dealData) {
    const apiData = transformers.dealToApi(dealData);
    const response = await this.put(endpoints.crm.dealById(id), apiData);
    return transformers.dealFromApi(response.data);
  }
  
  async moveDeal(dealId, stageId) {
    const response = await this.post(endpoints.crm.moveDeal(dealId), { stageId });
    return transformers.dealFromApi(response.data);
  }
  
  async deleteDeal(id) {
    await this.delete(endpoints.crm.dealById(id));
    return { success: true };
  }
  
  // Sales velocity and analytics
  async getSalesVelocityMetrics(options = {}) {
    const response = await this.get(endpoints.analytics.salesVelocity, options, {
      cacheTTL: 60000 // Cache for 1 minute
    });
    return response.data;
  }
  
  async getPipelineMetrics(options = {}) {
    const response = await this.get(endpoints.analytics.pipelineMetrics, options, {
      cacheTTL: 60000
    });
    return response.data;
  }
  
  async getPerformanceMetrics(options = {}) {
    const response = await this.get(endpoints.analytics.performanceMetrics, options, {
      cacheTTL: 180000 // Cache for 3 minutes
    });
    return response.data;
  }
}

export const crmClient = new CRMClient();
```

**Enhanced CRM Store with optimistic updates:**
```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { crmClient } from '../../../services/api/clients/crmClient';
import { apiConfig } from '../../../services/api/config/apiConfig';
import { createErrorHandler } from '../../../services/api/utils/errorHandling';

// Import existing mock data and calculations
import { mockDeals, mockContacts } from './mockData';
import { calculateSalesVelocityLocal } from './calculations';

const useCRMStore = create(
  persist(
    (set, get) => ({
      // Existing state structure preserved
      contacts: [],
      selectedContact: null,
      deals: [],
      selectedDeal: null,
      loading: false,
      error: null,
      
      // API integration state
      apiEnabled: apiConfig.features.enableApiIntegration,
      fallbackToMock: apiConfig.features.fallbackToMock,
      lastSyncTime: null,
      optimisticUpdates: new Map(),
      
      // Enhanced fetch contacts with API integration
      fetchContacts: async (filters = {}) => {
        set({ loading: true, error: null });
        
        const performFetch = async () => {
          if (get().apiEnabled) {
            const contacts = await crmClient.getContacts(filters);
            set({ lastSyncTime: new Date().toISOString() });
            return contacts;
          } else {
            // Use mock data
            return mockContacts.filter(contact => {
              // Apply filters to mock data
              if (filters.search) {
                return contact.name.toLowerCase().includes(filters.search.toLowerCase());
              }
              return true;
            });
          }
        };
        
        const handleFallback = get().fallbackToMock 
          ? () => mockContacts
          : null;
        
        const errorHandler = createErrorHandler(handleFallback);
        
        try {
          const contacts = await errorHandler(performFetch);
          
          set({
            contacts,
            loading: false,
            error: null
          });
          
          return contacts;
        } catch (error) {
          set({
            loading: false,
            error: error.message || 'Failed to fetch contacts'
          });
          throw error;
        }
      },
      
      // Optimistic contact creation
      createContact: async (contactData) => {
        // Create optimistic update
        const optimisticContact = {
          id: `temp_${Date.now()}`,
          ...contactData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Add optimistic update to state
        set(state => ({
          contacts: [...state.contacts, optimisticContact],
          optimisticUpdates: new Map(state.optimisticUpdates).set(optimisticContact.id, 'creating')
        }));
        
        try {
          let finalContact;
          
          if (get().apiEnabled) {
            finalContact = await crmClient.createContact(contactData);
          } else {
            // Mock creation
            finalContact = { ...optimisticContact, id: `contact_${Date.now()}` };
          }
          
          // Replace optimistic update with real data
          set(state => {
            const newOptimistic = new Map(state.optimisticUpdates);
            newOptimistic.delete(optimisticContact.id);
            
            return {
              contacts: state.contacts.map(c => 
                c.id === optimisticContact.id ? finalContact : c
              ),
              optimisticUpdates: newOptimistic
            };
          });
          
          return finalContact;
        } catch (error) {
          // Remove failed optimistic update
          set(state => {
            const newOptimistic = new Map(state.optimisticUpdates);
            newOptimistic.delete(optimisticContact.id);
            
            return {
              contacts: state.contacts.filter(c => c.id !== optimisticContact.id),
              optimisticUpdates: newOptimistic,
              error: error.message || 'Failed to create contact'
            };
          });
          
          throw error;
        }
      },
      
      // Enhanced sales velocity with server-side calculation
      getSalesVelocityMetrics: async (options = {}) => {
        try {
          if (get().apiEnabled) {
            // Use server-side calculation for better performance
            return await crmClient.getSalesVelocityMetrics(options);
          } else {
            // Use existing client-side calculation with current deals
            const deals = options._deals || get().deals;
            return calculateSalesVelocityLocal(deals, options);
          }
        } catch (error) {
          console.warn('Server calculation failed, using client-side fallback');
          // Fallback to client-side calculation
          const deals = options._deals || get().deals;
          return calculateSalesVelocityLocal(deals, options);
        }
      },
      
      // Real-time deal updates
      handleDealUpdate: (updatedDeal) => {
        set(state => ({
          deals: state.deals.map(deal =>
            deal.id === updatedDeal.id ? { ...deal, ...updatedDeal } : deal
          )
        }));
      },
      
      // Sync with server
      syncWithServer: async () => {
        if (!get().apiEnabled) return;
        
        try {
          const [contacts, deals] = await Promise.all([
            crmClient.getContacts(),
            crmClient.getDeals()
          ]);
          
          set({
            contacts,
            deals,
            lastSyncTime: new Date().toISOString(),
            error: null
          });
        } catch (error) {
          console.error('Sync failed:', error);
          set({ error: 'Sync failed: ' + error.message });
        }
      },
      
      // Configuration management
      toggleApiMode: () => set(state => ({ 
        apiEnabled: !state.apiEnabled 
      })),
      
      setFallbackMode: (enabled) => set({ 
        fallbackToMock: enabled 
      }),
      
      // Initialize with existing data
      initialize: async () => {
        // If API is enabled, try to sync
        if (get().apiEnabled && get().contacts.length === 0) {
          try {
            await get().syncWithServer();
          } catch (error) {
            console.warn('Initial sync failed, using existing data');
          }
        }
      }
    }),
    {
      name: 'crm-core-storage',
      partialize: (state) => ({
        contacts: state.contacts,
        deals: state.deals,
        selectedContact: state.selectedContact,
        selectedDeal: state.selectedDeal,
        apiEnabled: state.apiEnabled,
        fallbackToMock: state.fallbackToMock
      })
    }
  )
);

export default useCRMStore;
```

### 3.3 Real-time Integration

**src/services/realtime/signalRConnection.js:**
```javascript
import * as signalR from '@microsoft/signalr';
import { apiConfig } from '../api/config/apiConfig';
import { tokenManager } from '../storage/tokenManager';

class SignalRConnection {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = apiConfig.signalR.reconnectAttempts;
    this.eventHandlers = new Map();
  }
  
  async initialize() {
    if (this.connection) {
      await this.disconnect();
    }
    
    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${apiConfig.signalR.url}/notifications`, {
          accessTokenFactory: () => tokenManager.getAccessToken(),
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Exponential backoff with jitter
            const delay = Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
            return delay + Math.random() * 1000;
          }
        })
        .configureLogging(signalR.LogLevel.Warning)
        .build();
      
      this.setupConnectionEvents();
      this.setupDefaultHubEvents();
      
      await this.connection.start();
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      console.log('SignalR connected successfully');
      
      // Join user groups
      await this.joinUserGroups();
      
    } catch (error) {
      console.error('SignalR connection failed:', error);
      this.isConnected = false;
      this.scheduleReconnect();
    }
  }
  
  setupConnectionEvents() {
    this.connection.onclose((error) => {
      this.isConnected = false;
      console.log('SignalR connection closed:', error);
      this.scheduleReconnect();
    });
    
    this.connection.onreconnecting((error) => {
      console.log('SignalR reconnecting:', error);
      this.isConnected = false;
    });
    
    this.connection.onreconnected((connectionId) => {
      console.log('SignalR reconnected:', connectionId);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.joinUserGroups();
    });
  }
  
  setupDefaultHubEvents() {
    // Real-time notifications
    this.on('NotificationReceived', (notification) => {
      const { addNotification } = require('../../modules/notifications/stores/notificationStore').default.getState();
      addNotification({
        ...notification,
        isRealTime: true
      });
    });
    
    // Real-time deal updates
    this.on('DealUpdated', (dealData) => {
      const { handleDealUpdate } = require('../../modules/crm-core/stores/crmStore').default.getState();
      handleDealUpdate(dealData);
    });
    
    // Real-time lead assignments
    this.on('LeadAssigned', (leadData) => {
      const { handleLeadUpdate } = require('../../modules/leads/stores/leadStore').default.getState();
      handleLeadUpdate(leadData);
    });
    
    // User presence updates
    this.on('UserPresenceChanged', (presenceData) => {
      const { updateUserPresence } = require('../../modules/team-management/stores/teamManagementStore').default.getState();
      updateUserPresence(presenceData);
    });
  }
  
  async joinUserGroups() {
    if (!this.isConnected) return;
    
    try {
      // Join user-specific group for notifications
      await this.invoke('JoinUserGroup');
      
      // Join team groups if user has team
      const { user } = require('../../modules/auth/stores/authStore').default.getState();
      if (user?.team) {
        await this.invoke('JoinTeamGroup', user.team);
      }
      
      console.log('Joined SignalR groups successfully');
    } catch (error) {
      console.error('Failed to join SignalR groups:', error);
    }
  }
  
  on(eventName, handler) {
    if (this.connection) {
      this.connection.on(eventName, handler);
    }
    
    // Store handler for re-registration after reconnection
    this.eventHandlers.set(eventName, handler);
  }
  
  off(eventName) {
    if (this.connection) {
      this.connection.off(eventName);
    }
    this.eventHandlers.delete(eventName);
  }
  
  async invoke(methodName, ...args) {
    if (!this.isConnected || !this.connection) {
      throw new Error('SignalR not connected');
    }
    
    try {
      return await this.connection.invoke(methodName, ...args);
    } catch (error) {
      console.error(`SignalR invoke failed (${methodName}):`, error);
      throw error;
    }
  }
  
  async send(methodName, ...args) {
    if (!this.isConnected || !this.connection) {
      console.warn('SignalR not connected, skipping send');
      return;
    }
    
    try {
      await this.connection.send(methodName, ...args);
    } catch (error) {
      console.error(`SignalR send failed (${methodName}):`, error);
    }
  }
  
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max SignalR reconnect attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    setTimeout(() => {
      if (!this.isConnected) {
        console.log(`Attempting SignalR reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.initialize();
      }
    }, delay);
  }
  
  async disconnect() {
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
      }
      this.connection = null;
    }
    this.isConnected = false;
  }
  
  getConnectionState() {
    return {
      isConnected: this.isConnected,
      connectionState: this.connection?.state || 'Disconnected',
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

export const signalRConnection = new SignalRConnection();

// Auto-initialize when authentication is successful
const initializeRealTime = () => {
  const { isAuthenticated } = require('../../modules/auth/stores/authStore').default.getState();
  
  if (isAuthenticated && apiConfig.features.enableRealTime) {
    signalRConnection.initialize();
  }
};

// Listen for auth state changes
if (typeof window !== 'undefined') {
  window.addEventListener('auth-success', initializeRealTime);
  window.addEventListener('auth-logout', () => signalRConnection.disconnect());
}
```

---

## 4. Testing Strategy

### 4.1 API Integration Testing

**src/tests/integration/api.test.js:**
```javascript
import { authClient } from '../src/services/api/clients/authClient';
import { crmClient } from '../src/services/api/clients/crmClient';
import { apiConfig } from '../src/services/api/config/apiConfig';

describe('API Integration Tests', () => {
  let authToken;
  
  beforeAll(async () => {
    // Setup test authentication
    const loginResult = await authClient.login({
      email: 'test@example.com',
      password: 'testpassword'
    });
    authToken = loginResult.accessToken;
  });
  
  afterAll(async () => {
    // Cleanup
    await authClient.logout();
  });
  
  describe('Authentication', () => {
    it('should login successfully', async () => {
      const result = await authClient.login({
        email: 'test@example.com',
        password: 'testpassword'
      });
      
      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
    });
    
    it('should handle login failure', async () => {
      await expect(authClient.login({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      })).rejects.toThrow();
    });
  });
  
  describe('CRM Operations', () => {
    it('should fetch contacts', async () => {
      const contacts = await crmClient.getContacts();
      expect(Array.isArray(contacts)).toBe(true);
    });
    
    it('should create and update contact', async () => {
      const contactData = {
        name: 'Test Contact',
        email: 'test@contact.com',
        phone: '+1234567890'
      };
      
      const createdContact = await crmClient.createContact(contactData);
      expect(createdContact.id).toBeDefined();
      expect(createdContact.name).toBe(contactData.name);
      
      const updatedContact = await crmClient.updateContact(createdContact.id, {
        name: 'Updated Contact'
      });
      expect(updatedContact.name).toBe('Updated Contact');
      
      // Cleanup
      await crmClient.deleteContact(createdContact.id);
    });
  });
  
  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Temporarily set invalid URL
      const originalURL = apiConfig.baseURL;
      apiConfig.baseURL = 'http://invalid-url';
      
      try {
        await crmClient.getContacts();
      } catch (error) {
        expect(error.type).toBe('network');
      }
      
      // Restore URL
      apiConfig.baseURL = originalURL;
    });
  });
});
```

### 4.2 Store Integration Testing

**src/tests/integration/stores.test.js:**
```javascript
import useAuthStore from '../src/modules/auth/stores/authStore';
import useCRMStore from '../src/modules/crm-core/stores/crmStore';

describe('Store Integration Tests', () => {
  beforeEach(() => {
    // Reset stores
    useAuthStore.getState().logout();
    useCRMStore.setState({
      contacts: [],
      deals: [],
      loading: false,
      error: null
    });
  });
  
  describe('Auth Store Integration', () => {
    it('should handle API mode toggle', async () => {
      const store = useAuthStore.getState();
      
      // Start with API enabled
      expect(store.apiEnabled).toBe(true);
      
      // Toggle to mock mode
      store.toggleApiMode();
      expect(useAuthStore.getState().apiEnabled).toBe(false);
      
      // Login should use mock data
      const result = await store.login({
        email: 'test@example.com',
        password: 'password'
      });
      
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
    });
    
    it('should handle API failures with fallback', async () => {
      const store = useAuthStore.getState();
      
      // Enable API with fallback
      store.setFallbackMode(true);
      
      // Test login with network error simulation
      const result = await store.login({
        email: 'test@invalid.com',
        password: 'password'
      });
      
      // Should fallback to mock and succeed
      expect(result.success).toBe(true);
    });
  });
  
  describe('CRM Store Integration', () => {
    it('should sync optimistic updates', async () => {
      const store = useCRMStore.getState();
      
      // Create contact optimistically
      const contactData = {
        name: 'Test Contact',
        email: 'test@example.com'
      };
      
      const createPromise = store.createContact(contactData);
      
      // Should immediately show optimistic update
      const state = useCRMStore.getState();
      expect(state.contacts).toHaveLength(1);
      expect(state.contacts[0].name).toBe(contactData.name);
      expect(state.optimisticUpdates.size).toBe(1);
      
      // Wait for completion
      await createPromise;
      
      // Optimistic update should be resolved
      const finalState = useCRMStore.getState();
      expect(finalState.optimisticUpdates.size).toBe(0);
    });
  });
});
```

### 4.3 Real-time Testing

**src/tests/integration/realtime.test.js:**
```javascript
import { signalRConnection } from '../src/services/realtime/signalRConnection';
import useNotificationStore from '../src/modules/notifications/stores/notificationStore';

describe('Real-time Integration Tests', () => {
  beforeAll(async () => {
    await signalRConnection.initialize();
  });
  
  afterAll(async () => {
    await signalRConnection.disconnect();
  });
  
  it('should receive real-time notifications', (done) => {
    const originalNotificationCount = useNotificationStore.getState().notifications.length;
    
    // Listen for notification updates
    const unsubscribe = useNotificationStore.subscribe((state) => {
      if (state.notifications.length > originalNotificationCount) {
        const newNotification = state.notifications[state.notifications.length - 1];
        if (newNotification.isRealTime) {
          expect(newNotification.title).toBe('Test Notification');
          unsubscribe();
          done();
        }
      }
    });
    
    // Simulate server sending notification
    signalRConnection.connection.invoke('SendTestNotification', {
      title: 'Test Notification',
      message: 'This is a test'
    });
  });
  
  it('should handle connection interruption', async () => {
    // Disconnect
    await signalRConnection.disconnect();
    expect(signalRConnection.isConnected).toBe(false);
    
    // Reconnect
    await signalRConnection.initialize();
    expect(signalRConnection.isConnected).toBe(true);
  });
});
```

---

## 5. Deployment Guidelines

### 5.1 Environment Configuration

**Development Environment:**
```bash
# Build with development API settings
npm run build:dev

# Environment variables for development
REACT_APP_API_BASE_URL=https://dev-api.salestracker.com/api/v1
REACT_APP_ENABLE_API_INTEGRATION=true
REACT_APP_FALLBACK_TO_MOCK=true
REACT_APP_LOG_LEVEL=debug
```

**Production Environment:**
```bash
# Build with production optimizations
npm run build:prod

# Environment variables for production
REACT_APP_API_BASE_URL=https://api.salestracker.com/api/v1
REACT_APP_ENABLE_API_INTEGRATION=true
REACT_APP_FALLBACK_TO_MOCK=false
REACT_APP_LOG_LEVEL=error
```

### 5.2 Feature Flag Deployment

**Gradual Rollout Strategy:**
```javascript
// Feature flag configuration
const featureFlags = {
  apiIntegration: {
    enabled: process.env.REACT_APP_ENABLE_API_INTEGRATION === 'true',
    rolloutPercentage: parseInt(process.env.REACT_APP_API_ROLLOUT_PERCENTAGE) || 100,
    whitelistedUsers: (process.env.REACT_APP_API_WHITELIST || '').split(',')
  }
};

// Usage in components
const shouldUseApi = () => {
  const { user } = useAuthStore.getState();
  
  // Check whitelist first
  if (featureFlags.apiIntegration.whitelistedUsers.includes(user.id)) {
    return true;
  }
  
  // Check rollout percentage
  const userHash = hashCode(user.id) % 100;
  return userHash < featureFlags.apiIntegration.rolloutPercentage;
};
```

### 5.3 Monitoring Setup

**Application Monitoring:**
```javascript
// Performance monitoring
const performanceMonitor = {
  trackApiCall: (endpoint, duration, success) => {
    if (window.gtag) {
      window.gtag('event', 'api_call', {
        custom_parameter_endpoint: endpoint,
        custom_parameter_duration: duration,
        custom_parameter_success: success
      });
    }
  },
  
  trackError: (error, context) => {
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        tags: {
          component: context.component,
          action: context.action
        }
      });
    }
  }
};
```

---

## 6. Monitoring and Maintenance

### 6.1 Health Checks

**System Health Monitoring:**
```javascript
// Health check service
export const healthCheckService = {
  async checkApiHealth() {
    try {
      const response = await fetch(`${apiConfig.baseURL}/health`);
      return {
        api: response.ok,
        latency: Date.now() - startTime
      };
    } catch (error) {
      return {
        api: false,
        error: error.message
      };
    }
  },
  
  async checkRealTimeHealth() {
    return {
      signalR: signalRConnection.isConnected,
      connectionState: signalRConnection.getConnectionState()
    };
  },
  
  async getSystemHealth() {
    const [api, realtime] = await Promise.all([
      this.checkApiHealth(),
      this.checkRealTimeHealth()
    ]);
    
    return {
      overall: api.api && realtime.signalR,
      components: { api, realtime },
      timestamp: new Date().toISOString()
    };
  }
};
```

### 6.2 Performance Monitoring

**API Performance Tracking:**
```javascript
// Performance metrics collection
const performanceCollector = {
  metrics: [],
  
  recordMetric(endpoint, method, duration, success, cacheHit = false) {
    this.metrics.push({
      endpoint,
      method,
      duration,
      success,
      cacheHit,
      timestamp: Date.now()
    });
    
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  },
  
  getMetricsSummary() {
    const recent = this.metrics.filter(m => 
      Date.now() - m.timestamp < 300000 // Last 5 minutes
    );
    
    return {
      totalRequests: recent.length,
      successRate: recent.filter(m => m.success).length / recent.length,
      averageDuration: recent.reduce((sum, m) => sum + m.duration, 0) / recent.length,
      cacheHitRate: recent.filter(m => m.cacheHit).length / recent.length,
      slowestEndpoints: this.getSlowestEndpoints(recent)
    };
  },
  
  getSlowestEndpoints(metrics) {
    const endpointMetrics = {};
    
    metrics.forEach(metric => {
      if (!endpointMetrics[metric.endpoint]) {
        endpointMetrics[metric.endpoint] = [];
      }
      endpointMetrics[metric.endpoint].push(metric.duration);
    });
    
    return Object.entries(endpointMetrics)
      .map(([endpoint, durations]) => ({
        endpoint,
        averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
        maxDuration: Math.max(...durations),
        requestCount: durations.length
      }))
      .sort((a, b) => b.averageDuration - a.averageDuration)
      .slice(0, 5);
  }
};
```

### 6.3 Error Tracking and Alerting

**Comprehensive Error Handling:**
```javascript
// Error tracking service
export const errorTrackingService = {
  logError(error, context = {}) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      type: error.type || 'unknown',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.getCurrentUserId(),
      context
    };
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Application Error:', errorInfo);
    }
    
    // Send to error tracking service
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        tags: context.tags,
        extra: context.extra
      });
    }
    
    // Alert for critical errors
    if (error.type === 'authentication' || error.type === 'server_error') {
      this.sendAlert(errorInfo);
    }
  },
  
  getCurrentUserId() {
    try {
      const { user } = useAuthStore.getState();
      return user?.id || 'anonymous';
    } catch {
      return 'unknown';
    }
  },
  
  async sendAlert(errorInfo) {
    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'error',
          severity: 'high',
          message: errorInfo.message,
          details: errorInfo
        })
      });
    } catch (alertError) {
      console.error('Failed to send alert:', alertError);
    }
  }
};
```

---

## Conclusion

This implementation plan provides a comprehensive roadmap for integrating the SalesTracker CRM frontend with backend APIs while maintaining the existing functionality and user experience. The strategy emphasizes:

1. **Gradual Migration** - Step-by-step integration reducing risk
2. **Backward Compatibility** - Seamless fallback to mock data
3. **Error Resilience** - Comprehensive error handling and recovery
4. **Performance Optimization** - Caching, optimistic updates, and real-time features
5. **Monitoring and Maintenance** - Comprehensive observability and health checks

The architecture supports both immediate deployment with fallback capabilities and long-term scalability as the backend services mature.