/**
 * CeedPods Contact API Data Mapper
 * Handles request/response transformation between frontend and CeedPods API contact formats
 */

/**
 * Transform CeedPods contact object to frontend format
 * @param {object} apiContact - Contact object from CeedPods API
 * @returns {object} Frontend formatted contact
 */
export const mapContactToFrontend = (apiContact) => {
  if (!apiContact) return null;

  return {
    id: apiContact.id.toString(), // Ensure string ID for consistency
    name: apiContact.name,
    email: apiContact.email,
    title: apiContact.title,
    phone: apiContact.phoneNumber,
    company: apiContact.company,
    status: apiContact.status === 'Active' ? 'active' : 'inactive', // Convert to lowercase
    tags: Array.isArray(apiContact.tags) ? apiContact.tags : [],
    notes: apiContact.notes || '',
    createdAt: apiContact.createdAt,
    updatedAt: apiContact.updatedAt,
    // Frontend-specific fields with defaults
    avatar: null, // Not provided by CeedPods API
    lastActivity: null,
    assignedTo: apiContact.assignedTo || null, // User assignment from API
    companyId: null, // Will be set by company association logic
    leadSource: null,
    dealValue: 0,
    location: null,
    socialProfiles: {},
    customFields: {}
  };
};

/**
 * Transform frontend contact object to CeedPods API format
 * @param {object} frontendContact - Contact object from frontend
 * @returns {object} CeedPods API formatted contact
 */
export const mapContactToApi = (frontendContact) => {
  if (!frontendContact) return null;

  return {
    name: frontendContact.name,
    email: frontendContact.email,
    title: frontendContact.title || '',
    phoneNumber: frontendContact.phone || '',
    company: frontendContact.company || '',
    status: frontendContact.status === 'active' ? 'Active' : 'Inactive', // Convert to CeedPods format
    tags: Array.isArray(frontendContact.tags) ? frontendContact.tags : [],
    notes: frontendContact.notes || '',
    assignedTo: frontendContact.assignedTo || null // User assignment for contact ownership
    // Note: id, createdAt, updatedAt are handled by the API
  };
};

/**
 * Transform CeedPods contacts response array to frontend format
 * @param {array} apiResponse - Array of contacts from CeedPods API
 * @returns {array} Frontend formatted contacts array
 */
export const mapContactsResponse = (apiResponse) => {
  if (!Array.isArray(apiResponse)) {
    return [];
  }

  return apiResponse.map(contact => mapContactToFrontend(contact));
};

/**
 * Transform frontend search parameters to CeedPods API format
 * @param {object} searchParams - Frontend search parameters
 * @returns {object} CeedPods API formatted search params
 */
export const mapContactSearchRequest = (searchParams) => {
  const apiParams = {};

  // Basic search query
  if (searchParams.query) {
    apiParams.search = searchParams.query;
  }

  // Status filter
  if (searchParams.status && searchParams.status !== 'all') {
    apiParams.status = searchParams.status === 'active' ? 'Active' : 'Inactive';
  }

  // Company filter
  if (searchParams.company) {
    apiParams.company = searchParams.company;
  }

  // Tags filter
  if (searchParams.tags && Array.isArray(searchParams.tags) && searchParams.tags.length > 0) {
    apiParams.tags = searchParams.tags.join(',');
  }

  // Pagination
  if (searchParams.page) {
    apiParams.page = searchParams.page;
  }

  if (searchParams.limit) {
    apiParams.limit = searchParams.limit;
  }

  // Sorting
  if (searchParams.sortBy) {
    apiParams.sortBy = searchParams.sortBy;
  }

  if (searchParams.sortOrder) {
    apiParams.sortOrder = searchParams.sortOrder;
  }

  return apiParams;
};

/**
 * Transform frontend filter parameters to CeedPods API format
 * @param {object} frontendFilters - Frontend filter object
 * @returns {object} CeedPods API formatted filters
 */
export const mapContactFilters = (frontendFilters) => {
  const apiFilters = {};

  // Search term
  if (frontendFilters.search) {
    apiFilters.search = frontendFilters.search;
  }

  // Status filter
  if (frontendFilters.status && frontendFilters.status !== 'all') {
    apiFilters.status = frontendFilters.status === 'active' ? 'Active' : 'Inactive';
  }

  // Tags filter
  if (frontendFilters.tags && Array.isArray(frontendFilters.tags) && frontendFilters.tags.length > 0) {
    apiFilters.tags = frontendFilters.tags.join(',');
  }

  // Companies filter
  if (frontendFilters.companies && Array.isArray(frontendFilters.companies) && frontendFilters.companies.length > 0) {
    apiFilters.companies = frontendFilters.companies.join(',');
  }

  // Date range filters
  if (frontendFilters.dateRange) {
    switch (frontendFilters.dateRange) {
      case 'today':
        apiFilters.createdAfter = new Date().toISOString().split('T')[0];
        break;
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        apiFilters.createdAfter = weekAgo.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        apiFilters.createdAfter = monthAgo.toISOString().split('T')[0];
        break;
      case 'quarter':
        const quarterAgo = new Date();
        quarterAgo.setMonth(quarterAgo.getMonth() - 3);
        apiFilters.createdAfter = quarterAgo.toISOString().split('T')[0];
        break;
    }
  }

  // User assignment filter for user-specific contacts
  if (frontendFilters.assignedTo) {
    apiFilters.assignedTo = frontendFilters.assignedTo;
  }

  return apiFilters;
};

/**
 * Transform contact status update request to CeedPods API format
 * @param {string} status - Frontend status ('active' or 'inactive')
 * @returns {object} CeedPods API formatted status update
 */
export const mapContactStatusUpdate = (status) => {
  return {
    status: status === 'active' ? 'Active' : 'Inactive'
  };
};

/**
 * Transform tag operation for CeedPods API format
 * @param {string} tag - Tag to add or remove
 * @returns {object} CeedPods API formatted tag operation
 */
export const mapContactTagOperation = (tag) => {
  return {
    tag: tag.trim()
  };
};

/**
 * Transform CeedPods contact analytics response to frontend format
 * @param {object} apiAnalytics - Analytics data from CeedPods API
 * @returns {object} Frontend formatted analytics
 */
export const mapContactAnalytics = (apiAnalytics) => {
  if (!apiAnalytics) return null;

  return {
    totalContacts: apiAnalytics.totalContacts || 0,
    activeContacts: apiAnalytics.activeContacts || 0,
    inactiveContacts: apiAnalytics.inactiveContacts || 0,
    contactsThisMonth: apiAnalytics.contactsThisMonth || 0,
    contactsLastMonth: apiAnalytics.contactsLastMonth || 0,
    averageContactsPerDay: apiAnalytics.averageContactsPerDay || 0,
    topCompanies: apiAnalytics.topCompanies || [],
    topTags: apiAnalytics.topTags || [],
    statusDistribution: apiAnalytics.statusDistribution || {},
    growthRate: apiAnalytics.growthRate || 0,
    // Additional frontend analytics
    conversionRate: apiAnalytics.conversionRate || 0,
    averageResponseTime: apiAnalytics.averageResponseTime || 0,
    totalInteractions: apiAnalytics.totalInteractions || 0
  };
};

/**
 * Transform CeedPods API error response to frontend contact error format
 * @param {object} errorResponse - CeedPods API error response
 * @returns {object} Frontend formatted contact error
 */
export const mapContactErrorResponse = (errorResponse) => {
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
      message: errorResponse.title || errorResponse.message || 'Contact validation failed',
      errors: validationErrors,
      status: errorResponse.status || 400,
      type: 'validation'
    };
  }
  
  // Handle standard CeedPods error format
  return {
    message: errorResponse.message || 'Contact operation failed',
    errors: Array.isArray(errorResponse.errors) ? errorResponse.errors : [errorResponse.message || 'Unknown contact error'],
    status: errorResponse.status || 500,
    type: 'general'
  };
};

/**
 * Transform CeedPods contact success response to frontend format
 * @param {object} apiResponse - CeedPods API success response
 * @returns {object} Frontend formatted contact response
 */
export const mapContactSuccessResponse = (apiResponse) => {
  return {
    success: apiResponse.success || true,
    message: apiResponse.message || 'Contact operation completed successfully',
    data: apiResponse.data ? mapContactToFrontend(apiResponse.data) : null,
    meta: apiResponse.meta || null
  };
};

export default {
  mapContactToFrontend,
  mapContactToApi,
  mapContactsResponse,
  mapContactSearchRequest,
  mapContactFilters,
  mapContactStatusUpdate,
  mapContactTagOperation,
  mapContactAnalytics,
  mapContactErrorResponse,
  mapContactSuccessResponse
};