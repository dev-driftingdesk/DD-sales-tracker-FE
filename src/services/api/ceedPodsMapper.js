/**
 * CeedPods API Data Mapper
 * Handles request/response transformation between frontend and CeedPods API formats
 */

/**
 * Transform user registration data from frontend format to CeedPods API format
 * @param {object} frontendData - Frontend user registration data
 * @returns {object} CeedPods API formatted data
 */
export const mapRegistrationRequest = (frontendData) => {
  return {
    name: frontendData.name,
    email: frontendData.email,
    password: frontendData.password,
    company: frontendData.company || '',
    phone: frontendData.phone || '',
    role: frontendData.role || 'SalesRep'
  };
};

/**
 * Transform login data from frontend format to CeedPods API format
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {boolean} rememberMe - Remember me flag
 * @returns {object} CeedPods API formatted data
 */
export const mapLoginRequest = (email, password, rememberMe = false) => {
  return {
    email,
    password,
    rememberMe
  };
};

/**
 * Transform CeedPods API auth response to frontend format
 * @param {object} apiResponse - CeedPods API response
 * @returns {object} Frontend formatted response
 */
export const mapAuthResponse = (apiResponse) => {
  if (!apiResponse.success || !apiResponse.data) {
    throw new Error(apiResponse.message || 'Authentication failed');
  }

  const { data } = apiResponse;
  
  // Map CeedPods user format to frontend format
  const frontendUser = mapUserResponse(data.user);
  
  return {
    success: true,
    user: frontendUser,
    tokens: {
      access_token: data.token, // CeedPods uses 'token' field
      refresh_token: data.refreshToken,
      expires_in: data.expiresIn || 86400 // Default 24 hours
    }
  };
};

/**
 * Transform CeedPods user object to frontend format
 * @param {object} ceedPodsUser - User object from CeedPods API
 * @returns {object} Frontend formatted user
 */
export const mapUserResponse = (ceedPodsUser) => {
  if (!ceedPodsUser) return null;

  return {
    id: ceedPodsUser.id, // Keep as string (GUID)
    name: ceedPodsUser.name, // CeedPods uses single name field
    email: ceedPodsUser.email,
    role: ceedPodsUser.role,
    avatar: null, // Not provided by CeedPods API
    createdAt: ceedPodsUser.createdAt,
    emailVerified: ceedPodsUser.emailVerified || false,
    permissions: ceedPodsUser.permissions || [],
    preferences: ceedPodsUser.preferences || {}
  };
};

/**
 * Transform password reset request from frontend to CeedPods format
 * @param {string} email - User email
 * @returns {object} CeedPods API formatted data
 */
export const mapPasswordResetRequest = (email) => {
  return { email };
};

/**
 * Transform password reset confirm request from frontend to CeedPods format
 * @param {string} email - User email
 * @param {string} newPassword - New password
 * @param {string} token - Reset token
 * @returns {object} CeedPods API formatted data
 */
export const mapPasswordResetConfirmRequest = (email, newPassword, token) => {
  return {
    email,
    newPassword,
    token
  };
};

/**
 * Transform email verification request from frontend to CeedPods format
 * @param {string} email - User email
 * @param {string} token - Verification token
 * @returns {string} Query string for GET request
 */
export const mapEmailVerificationRequest = (email, token) => {
  const params = new URLSearchParams({
    email,
    token
  });
  return params.toString();
};

/**
 * Transform refresh token request from frontend to CeedPods format
 * @param {string} refreshToken - Refresh token
 * @returns {object} CeedPods API formatted data
 */
export const mapRefreshTokenRequest = (refreshToken) => {
  return {
    refreshToken // CeedPods expects 'refreshToken' field
  };
};

/**
 * Transform CeedPods API error response to frontend format
 * @param {object} errorResponse - CeedPods API error response
 * @returns {object} Frontend formatted error
 */
export const mapErrorResponse = (errorResponse) => {
  // Handle CeedPods validation error format
  if (errorResponse.errors && typeof errorResponse.errors === 'object' && !Array.isArray(errorResponse.errors)) {
    // Validation errors format: { "FieldName": ["Error message"] }
    const validationErrors = [];
    Object.keys(errorResponse.errors).forEach(field => {
      if (Array.isArray(errorResponse.errors[field])) {
        validationErrors.push(...errorResponse.errors[field]);
      }
    });
    
    return {
      message: errorResponse.title || errorResponse.message || 'Validation failed',
      errors: validationErrors,
      status: errorResponse.status || 400
    };
  }
  
  // Handle standard CeedPods error format
  return {
    message: errorResponse.message || 'An error occurred',
    errors: Array.isArray(errorResponse.errors) ? errorResponse.errors : [errorResponse.message || 'Unknown error'],
    status: errorResponse.status || 500
  };
};

/**
 * Transform CeedPods success response to frontend format
 * @param {object} apiResponse - CeedPods API response
 * @returns {object} Frontend formatted response
 */
export const mapSuccessResponse = (apiResponse) => {
  return {
    success: apiResponse.success || true,
    message: apiResponse.message || 'Operation completed successfully',
    data: apiResponse.data || null
  };
};

export default {
  mapRegistrationRequest,
  mapLoginRequest,
  mapAuthResponse,
  mapUserResponse,
  mapPasswordResetRequest,
  mapPasswordResetConfirmRequest,
  mapEmailVerificationRequest,
  mapRefreshTokenRequest,
  mapErrorResponse,
  mapSuccessResponse
};