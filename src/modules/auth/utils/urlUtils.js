/**
 * URL utility functions for authentication flow
 */

/**
 * Extract reset password parameters from URL
 * @returns {object} Object containing token and email or null if not found
 */
export const getResetPasswordParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const email = urlParams.get('email');
  
  // Check if both token and email are present in URL parameters
  if (token && email) {
    return {
      token,
      email: decodeURIComponent(email)
    };
  }
  
  return null;
};

/**
 * Check if current URL is a reset password link
 * @returns {boolean} True if URL contains reset password parameters
 */
export const isResetPasswordUrl = () => {
  return window.location.pathname === '/reset-password' || 
         (window.location.search.includes('token=') && window.location.search.includes('email='));
};

/**
 * Clear URL parameters after processing
 */
export const clearUrlParams = () => {
  if (window.history && window.history.replaceState) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with isValid and messages
 */
export const validatePasswordStrength = (password) => {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  
  const messages = [];
  
  if (!requirements.minLength) {
    messages.push('Password must be at least 8 characters long');
  }
  if (!requirements.hasUppercase) {
    messages.push('Password must contain at least one uppercase letter');
  }
  if (!requirements.hasLowercase) {
    messages.push('Password must contain at least one lowercase letter');
  }
  if (!requirements.hasNumber) {
    messages.push('Password must contain at least one number');
  }
  if (!requirements.hasSpecialChar) {
    messages.push('Password must contain at least one special character');
  }
  
  return {
    isValid: Object.values(requirements).every(req => req),
    requirements,
    messages
  };
};