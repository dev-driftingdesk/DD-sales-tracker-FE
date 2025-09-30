/**
 * Feature Flag Management
 * Centralized feature flag system for gradual rollout and A/B testing
 */

import { config } from './environment.js';

/**
 * Feature flag definitions
 */
export const FEATURE_FLAGS = {
  // API Integration
  API_INTEGRATION: 'enableApiIntegration',
  API_LOGGING: 'enableApiLogging',
  ERROR_REPORTING: 'enableErrorReporting',
  
  // Authentication Features
  EMAIL_VERIFICATION: 'enableEmailVerification',
  REMEMBER_ME: 'enableRememberMe',
  PASSWORD_STRENGTH: 'enablePasswordStrength',
  TOKEN_REFRESH: 'enableTokenRefresh',
  
  // Security Features
  CSRF_PROTECTION: 'csrfEnabled',
  RATE_LIMITING: 'rateLimitEnabled',
  
  // Performance Features
  SERVICE_WORKER: 'enableServiceWorker',
  LAZY_LOADING: 'enableLazyLoading',
  COMPRESSION: 'enableCompression',
  
  // Development Features
  HOT_RELOAD: 'enableHotReload',
  ERROR_BOUNDARY: 'enableErrorBoundary'
};

/**
 * Feature flag state
 */
class FeatureFlagManager {
  constructor() {
    this.flags = new Map();
    this.listeners = new Map();
    this.initializeFlags();
  }

  /**
   * Initialize feature flags from configuration
   */
  initializeFlags() {
    // Load from environment configuration
    this.flags.set(FEATURE_FLAGS.API_INTEGRATION, config.features.enableApiIntegration);
    this.flags.set(FEATURE_FLAGS.API_LOGGING, config.development.enableApiLogging);
    this.flags.set(FEATURE_FLAGS.ERROR_REPORTING, config.errors.enableErrorReporting);
    
    this.flags.set(FEATURE_FLAGS.EMAIL_VERIFICATION, config.features.enableEmailVerification);
    this.flags.set(FEATURE_FLAGS.REMEMBER_ME, config.features.enableRememberMe);
    this.flags.set(FEATURE_FLAGS.PASSWORD_STRENGTH, config.features.enablePasswordStrength);
    this.flags.set(FEATURE_FLAGS.TOKEN_REFRESH, config.auth.enableTokenRefresh);
    
    this.flags.set(FEATURE_FLAGS.CSRF_PROTECTION, config.security.csrfEnabled);
    this.flags.set(FEATURE_FLAGS.RATE_LIMITING, config.security.rateLimitEnabled);
    
    this.flags.set(FEATURE_FLAGS.SERVICE_WORKER, config.performance.enableServiceWorker);
    this.flags.set(FEATURE_FLAGS.LAZY_LOADING, config.performance.enableLazyLoading);
    this.flags.set(FEATURE_FLAGS.COMPRESSION, config.performance.enableCompression);
    
    this.flags.set(FEATURE_FLAGS.HOT_RELOAD, config.development.enableHotReload);
    this.flags.set(FEATURE_FLAGS.ERROR_BOUNDARY, config.errors.enableErrorBoundary);
    
    // Load from localStorage overrides (for testing/development)
    this.loadLocalStorageOverrides();
  }

  /**
   * Load feature flag overrides from localStorage
   */
  loadLocalStorageOverrides() {
    try {
      const overrides = JSON.parse(localStorage.getItem('featureFlags') || '{}');
      Object.entries(overrides).forEach(([flag, value]) => {
        if (Object.values(FEATURE_FLAGS).includes(flag)) {
          this.flags.set(flag, Boolean(value));
        }
      });
    } catch (error) {
      console.warn('Failed to load feature flag overrides:', error);
    }
  }

  /**
   * Save feature flag overrides to localStorage
   */
  saveLocalStorageOverrides() {
    try {
      const overrides = {};
      this.flags.forEach((value, key) => {
        // Only save overrides that differ from environment defaults
        const defaultValue = this.getDefaultValue(key);
        if (value !== defaultValue) {
          overrides[key] = value;
        }
      });
      localStorage.setItem('featureFlags', JSON.stringify(overrides));
    } catch (error) {
      console.warn('Failed to save feature flag overrides:', error);
    }
  }

  /**
   * Get default value for a feature flag
   * @param {string} flag - Feature flag key
   * @returns {boolean} Default value
   */
  getDefaultValue(flag) {
    const flagMapping = {
      [FEATURE_FLAGS.API_INTEGRATION]: config.features.enableApiIntegration,
      [FEATURE_FLAGS.API_LOGGING]: config.development.enableApiLogging,
      [FEATURE_FLAGS.ERROR_REPORTING]: config.errors.enableErrorReporting,
      [FEATURE_FLAGS.EMAIL_VERIFICATION]: config.features.enableEmailVerification,
      [FEATURE_FLAGS.REMEMBER_ME]: config.features.enableRememberMe,
      [FEATURE_FLAGS.PASSWORD_STRENGTH]: config.features.enablePasswordStrength,
      [FEATURE_FLAGS.TOKEN_REFRESH]: config.auth.enableTokenRefresh,
      [FEATURE_FLAGS.CSRF_PROTECTION]: config.security.csrfEnabled,
      [FEATURE_FLAGS.RATE_LIMITING]: config.security.rateLimitEnabled,
      [FEATURE_FLAGS.SERVICE_WORKER]: config.performance.enableServiceWorker,
      [FEATURE_FLAGS.LAZY_LOADING]: config.performance.enableLazyLoading,
      [FEATURE_FLAGS.COMPRESSION]: config.performance.enableCompression,
      [FEATURE_FLAGS.HOT_RELOAD]: config.development.enableHotReload,
      [FEATURE_FLAGS.ERROR_BOUNDARY]: config.errors.enableErrorBoundary
    };
    
    return flagMapping[flag] || false;
  }

  /**
   * Check if a feature flag is enabled
   * @param {string} flag - Feature flag key
   * @returns {boolean} True if flag is enabled
   */
  isEnabled(flag) {
    return this.flags.get(flag) || false;
  }

  /**
   * Enable a feature flag
   * @param {string} flag - Feature flag key
   * @param {boolean} persist - Whether to persist to localStorage
   */
  enable(flag, persist = false) {
    this.flags.set(flag, true);
    this.notifyListeners(flag, true);
    
    if (persist) {
      this.saveLocalStorageOverrides();
    }
  }

  /**
   * Disable a feature flag
   * @param {string} flag - Feature flag key
   * @param {boolean} persist - Whether to persist to localStorage
   */
  disable(flag, persist = false) {
    this.flags.set(flag, false);
    this.notifyListeners(flag, false);
    
    if (persist) {
      this.saveLocalStorageOverrides();
    }
  }

  /**
   * Toggle a feature flag
   * @param {string} flag - Feature flag key
   * @param {boolean} persist - Whether to persist to localStorage
   * @returns {boolean} New flag value
   */
  toggle(flag, persist = false) {
    const newValue = !this.isEnabled(flag);
    this.flags.set(flag, newValue);
    this.notifyListeners(flag, newValue);
    
    if (persist) {
      this.saveLocalStorageOverrides();
    }
    
    return newValue;
  }

  /**
   * Reset a feature flag to its default value
   * @param {string} flag - Feature flag key
   */
  reset(flag) {
    const defaultValue = this.getDefaultValue(flag);
    this.flags.set(flag, defaultValue);
    this.notifyListeners(flag, defaultValue);
    this.saveLocalStorageOverrides();
  }

  /**
   * Reset all feature flags to their default values
   */
  resetAll() {
    this.initializeFlags();
    localStorage.removeItem('featureFlags');
    this.notifyAllListeners();
  }

  /**
   * Get all feature flags and their values
   * @returns {object} Feature flags object
   */
  getAll() {
    const result = {};
    this.flags.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /**
   * Add a listener for feature flag changes
   * @param {string} flag - Feature flag key
   * @param {function} callback - Callback function
   * @returns {function} Unsubscribe function
   */
  addListener(flag, callback) {
    if (!this.listeners.has(flag)) {
      this.listeners.set(flag, new Set());
    }
    
    this.listeners.get(flag).add(callback);
    
    // Return unsubscribe function
    return () => {
      const flagListeners = this.listeners.get(flag);
      if (flagListeners) {
        flagListeners.delete(callback);
        if (flagListeners.size === 0) {
          this.listeners.delete(flag);
        }
      }
    };
  }

  /**
   * Notify listeners of flag changes
   * @param {string} flag - Feature flag key
   * @param {boolean} value - New flag value
   */
  notifyListeners(flag, value) {
    const flagListeners = this.listeners.get(flag);
    if (flagListeners) {
      flagListeners.forEach(callback => {
        try {
          callback(value, flag);
        } catch (error) {
          console.error('Feature flag listener error:', error);
        }
      });
    }
  }

  /**
   * Notify all listeners
   */
  notifyAllListeners() {
    this.listeners.forEach((callbacks, flag) => {
      const value = this.isEnabled(flag);
      callbacks.forEach(callback => {
        try {
          callback(value, flag);
        } catch (error) {
          console.error('Feature flag listener error:', error);
        }
      });
    });
  }

  /**
   * Create a conditional wrapper function
   * @param {string} flag - Feature flag key
   * @param {function} enabledFn - Function to call when enabled
   * @param {function} disabledFn - Function to call when disabled
   * @returns {function} Conditional wrapper function
   */
  conditional(flag, enabledFn, disabledFn = () => {}) {
    return (...args) => {
      if (this.isEnabled(flag)) {
        return enabledFn(...args);
      } else {
        return disabledFn(...args);
      }
    };
  }
}

// Create global feature flag manager instance
export const featureFlags = new FeatureFlagManager();

/**
 * Hook for React components to use feature flags
 * @param {string} flag - Feature flag key
 * @returns {boolean} Feature flag value
 */
export const useFeatureFlag = (flag) => {
  // For non-React usage, just return current value
  return featureFlags.isEnabled(flag);
};

/**
 * Higher-order component for feature flag gating
 * @param {string} flag - Feature flag key
 * @param {React.Component} fallback - Fallback component when disabled
 * @returns {function} HOC function
 */
export const withFeatureFlag = (flag, fallback = null) => {
  return (Component) => {
    return function FeatureFlagWrapper(props) {
      if (featureFlags.isEnabled(flag)) {
        return Component(props);
      }
      return fallback;
    };
  };
};

/**
 * Utility functions for common feature flag checks
 */
export const isApiIntegrationEnabled = () => featureFlags.isEnabled(FEATURE_FLAGS.API_INTEGRATION);
export const isApiLoggingEnabled = () => featureFlags.isEnabled(FEATURE_FLAGS.API_LOGGING);
export const isErrorReportingEnabled = () => featureFlags.isEnabled(FEATURE_FLAGS.ERROR_REPORTING);
export const isEmailVerificationEnabled = () => featureFlags.isEnabled(FEATURE_FLAGS.EMAIL_VERIFICATION);
export const isRememberMeEnabled = () => featureFlags.isEnabled(FEATURE_FLAGS.REMEMBER_ME);
export const isPasswordStrengthEnabled = () => featureFlags.isEnabled(FEATURE_FLAGS.PASSWORD_STRENGTH);

// Development utilities (only available in development)
if (config.isDevelopment) {
  // Make feature flags available in browser console
  window.featureFlags = featureFlags;
  window.FEATURE_FLAGS = FEATURE_FLAGS;
  
  console.log('🚩 Feature flags available in console:', {
    enabled: Object.values(FEATURE_FLAGS).filter(flag => featureFlags.isEnabled(flag)),
    disabled: Object.values(FEATURE_FLAGS).filter(flag => !featureFlags.isEnabled(flag))
  });
}

export default featureFlags;