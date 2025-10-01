/**
 * Contact API Service
 * Handles all contact-related API operations with fallback to mock data
 * 
 * API Integration Status:
 * - API Integration: ENABLED (VITE_ENABLE_API_INTEGRATION=true)
 * - Backend URL: http://localhost:5555 (configure in .env.development)
 * - Mock Data: Non-persistent fallback when API unavailable
 * - Real Persistence: Requires backend API integration (contacts stored in database)
 */

import { createApiService, isApiEnabled, getApiEndpoints, mockDelay } from '../api/index.js';
import { ApiError, ERROR_TYPES } from '../api/errorHandler.js';
import useUserStore from '../../stores/userStore.jsx';
import {
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
} from '../api/contactsMapper.js';

// Create API service for contact endpoints
const contactApiService = createApiService('');

// Get mock contacts (non-persistent fallback when API disabled)
const getMockContacts = () => {
  return [...INITIAL_MOCK_CONTACTS];
};

// Initial mock contacts data (fallback when API is not enabled)
const INITIAL_MOCK_CONTACTS = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@acme.com',
    title: 'Marketing Director',
    phone: '+1 555 123 4567',
    company: 'Acme Corporation',
    status: 'active',
    tags: ['enterprise', 'decision-maker'],
    notes: 'Interested in Q2 expansion plans',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    avatar: null,
    lastActivity: 'Email sent 2 days ago',
    assignedTo: 'user-1',
    companyId: 'company-1',
    leadSource: 'website',
    dealValue: 50000,
    location: 'New York, NY',
    socialProfiles: {},
    customFields: {}
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@techstart.com',
    title: 'CEO',
    phone: '+1 555 987 6543',
    company: 'TechStart Solutions',
    status: 'active',
    tags: ['startup', 'hot-lead'],
    notes: 'Fast-growing startup looking for scalable solutions',
    createdAt: '2024-01-10T11:15:00Z',
    updatedAt: '2024-01-22T16:45:00Z',
    avatar: null,
    lastActivity: 'Meeting scheduled for next week',
    assignedTo: 'user-2',
    companyId: 'company-2',
    leadSource: 'referral',
    dealValue: 75000,
    location: 'San Francisco, CA',
    socialProfiles: {},
    customFields: {}
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael.brown@globalcorp.com',
    title: 'IT Manager',
    phone: '+1 555 456 7890',
    company: 'Global Corp',
    status: 'inactive',
    tags: ['enterprise', 'evaluation'],
    notes: 'Currently evaluating multiple vendors',
    createdAt: '2024-01-05T13:20:00Z',
    updatedAt: '2024-01-18T10:15:00Z',
    avatar: null,
    lastActivity: 'No recent activity',
    assignedTo: 'user-3',
    companyId: 'company-3',
    leadSource: 'event',
    dealValue: 30000,
    location: 'Chicago, IL',
    socialProfiles: {},
    customFields: {}
  }
];

/**
 * Get contacts with optional filtering and pagination
 * @param {object} filters - Filter options
 * @returns {Promise<object>} Contacts response
 */
export const getContacts = async (filters = {}) => {
  try {
    if (isApiEnabled()) {
      // Use CeedPods API
      const currentUser = useUserStore.getState().currentUser;
      
      // Add user filtering to API filters
      const userFilters = { ...filters };
      if (currentUser) {
        userFilters.assignedTo = currentUser.id;
      }
      
      const apiFilters = mapContactFilters(userFilters);
      const queryParams = new URLSearchParams(apiFilters).toString();
      const url = queryParams ? `${getApiEndpoints().contacts.list}?${queryParams}` : getApiEndpoints().contacts.list;
      
      const response = await contactApiService.get(url);
      
      // Transform CeedPods response to frontend format
      const mappedContacts = mapContactsResponse(response.data || response);
      
      return {
        success: true,
        data: mappedContacts,
        total: response.total || mappedContacts.length,
        page: response.page || 1,
        limit: response.limit || mappedContacts.length
      };
    } else {
      // Use mock data with delay
      await mockDelay();
      
      // Get current user for filtering
      const currentUser = useUserStore.getState().currentUser;
      
      // Get non-persistent mock contacts for fallback
      let filteredContacts = getMockContacts();
      
      // Filter by current user - only show contacts assigned to the current user
      if (currentUser) {
        filteredContacts = filteredContacts.filter(contact => contact.assignedTo === currentUser.id);
      }
      
      // Apply filters
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredContacts = filteredContacts.filter(contact =>
          contact.name.toLowerCase().includes(searchTerm) ||
          contact.email.toLowerCase().includes(searchTerm) ||
          contact.company.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filters.status && filters.status !== 'all') {
        filteredContacts = filteredContacts.filter(contact => contact.status === filters.status);
      }
      
      if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
        filteredContacts = filteredContacts.filter(contact =>
          filters.tags.some(tag => contact.tags.includes(tag))
        );
      }
      
      if (filters.companies && Array.isArray(filters.companies) && filters.companies.length > 0) {
        filteredContacts = filteredContacts.filter(contact =>
          filters.companies.includes(contact.companyId)
        );
      }
      
      return {
        success: true,
        data: filteredContacts,
        total: filteredContacts.length,
        page: 1,
        limit: filteredContacts.length
      };
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle CeedPods API error response
    if (error.response && error.response.data) {
      const mappedError = mapContactErrorResponse(error.response.data);
      throw new ApiError(
        mappedError.message,
        ERROR_TYPES.SERVER,
        mappedError.status,
        error
      );
    }
    
    throw new ApiError(
      error.message || 'Failed to fetch contacts',
      ERROR_TYPES.SERVER,
      error.status || 500,
      error
    );
  }
};

/**
 * Get contact by ID
 * @param {string} id - Contact ID
 * @returns {Promise<object>} Contact response
 */
export const getContactById = async (id) => {
  try {
    if (isApiEnabled()) {
      // Use CeedPods API
      const response = await contactApiService.get(`${getApiEndpoints().contacts.list}/${id}`);
      
      // Transform CeedPods response to frontend format
      const mappedContact = mapContactToFrontend(response.data || response);
      
      return {
        success: true,
        data: mappedContact
      };
    } else {
      // Use mock data with delay
      await mockDelay();
      
      const currentContacts = getMockContacts();
      const contact = currentContacts.find(c => c.id === id);
      if (!contact) {
        throw new ApiError('Contact not found', ERROR_TYPES.NOT_FOUND, 404);
      }
      
      return {
        success: true,
        data: contact
      };
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle CeedPods API error response
    if (error.response && error.response.data) {
      const mappedError = mapContactErrorResponse(error.response.data);
      throw new ApiError(
        mappedError.message,
        ERROR_TYPES.NOT_FOUND,
        mappedError.status,
        error
      );
    }
    
    throw new ApiError(
      error.message || 'Failed to fetch contact',
      ERROR_TYPES.SERVER,
      error.status || 500,
      error
    );
  }
};

/**
 * Create new contact
 * @param {object} contactData - Contact data
 * @returns {Promise<object>} Create response
 */
export const createContact = async (contactData) => {
  try {
    // Get current user and auto-assign the contact
    const currentUser = useUserStore.getState().currentUser;
    const contactWithUser = { 
      ...contactData, 
      assignedTo: currentUser?.id || 'user-1' // Fallback to default user
    };

    if (isApiEnabled()) {
      // Use CeedPods API
      const requestData = mapContactToApi(contactWithUser);
      const response = await contactApiService.post(getApiEndpoints().contacts.create, requestData);
      
      // Transform CeedPods response to frontend format
      const mappedResponse = mapContactSuccessResponse(response);
      
      return {
        success: true,
        data: mappedResponse.data,
        message: mappedResponse.message
      };
    } else {
      // Use mock data with delay
      await mockDelay();
      
      // Mock data fallback - simulate contact lookup (non-persistent)
      const currentContacts = getMockContacts();
      
      // Check if email already exists
      const existingContact = currentContacts.find(c => c.email === contactWithUser.email);
      if (existingContact) {
        throw new ApiError('Contact with this email already exists', ERROR_TYPES.VALIDATION, 400);
      }
      
      // Create new contact with user assignment
      const newContact = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        tags: [],
        notes: '',
        avatar: null,
        lastActivity: null,
        assignedTo: contactWithUser.assignedTo,
        companyId: null,
        leadSource: null,
        dealValue: 0,
        location: null,
        socialProfiles: {},
        customFields: {},
        ...contactWithUser
      };
      
      // Note: Mock data is not persistent - contact will only exist during session
      // Real persistence requires backend API integration
      
      return {
        success: true,
        data: newContact,
        message: 'Contact created successfully'
      };
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle CeedPods API error response
    if (error.response && error.response.data) {
      const mappedError = mapContactErrorResponse(error.response.data);
      throw new ApiError(
        mappedError.message,
        ERROR_TYPES.VALIDATION,
        mappedError.status,
        error
      );
    }
    
    throw new ApiError(
      error.message || 'Failed to create contact',
      ERROR_TYPES.SERVER,
      error.status || 500,
      error
    );
  }
};

/**
 * Update contact
 * @param {string} id - Contact ID
 * @param {object} updates - Contact updates
 * @returns {Promise<object>} Update response
 */
export const updateContact = async (id, updates) => {
  try {
    if (isApiEnabled()) {
      // Use CeedPods API
      const requestData = mapContactToApi(updates);
      const response = await contactApiService.put(`${getApiEndpoints().contacts.update}/${id}`, requestData);
      
      // Transform CeedPods response to frontend format
      const mappedResponse = mapContactSuccessResponse(response);
      
      return {
        success: true,
        data: mappedResponse.data,
        message: mappedResponse.message
      };
    } else {
      // Use mock data with delay
      await mockDelay();
      
      // Mock data fallback - simulate contact lookup (non-persistent)
      const currentContacts = getMockContacts();
      const contactIndex = currentContacts.findIndex(c => c.id === id);
      if (contactIndex === -1) {
        throw new ApiError('Contact not found', ERROR_TYPES.NOT_FOUND, 404);
      }
      
      // Update contact in mock data
      const updatedContact = {
        ...currentContacts[contactIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // Note: Mock data changes are not persistent - requires backend API integration
      
      return {
        success: true,
        data: updatedContact,
        message: 'Contact updated successfully'
      };
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle CeedPods API error response
    if (error.response && error.response.data) {
      const mappedError = mapContactErrorResponse(error.response.data);
      throw new ApiError(
        mappedError.message,
        ERROR_TYPES.VALIDATION,
        mappedError.status,
        error
      );
    }
    
    throw new ApiError(
      error.message || 'Failed to update contact',
      ERROR_TYPES.SERVER,
      error.status || 500,
      error
    );
  }
};

/**
 * Delete contact
 * @param {string} id - Contact ID
 * @returns {Promise<object>} Delete response
 */
export const deleteContact = async (id) => {
  try {
    if (isApiEnabled()) {
      // Use CeedPods API
      await contactApiService.delete(`${getApiEndpoints().contacts.delete}/${id}`);
      
      return {
        success: true,
        message: 'Contact deleted successfully'
      };
    } else {
      // Use mock data with delay
      await mockDelay();
      
      // Mock data fallback - simulate contact lookup (non-persistent)
      const currentContacts = getMockContacts();
      const contactIndex = currentContacts.findIndex(c => c.id === id);
      if (contactIndex === -1) {
        throw new ApiError('Contact not found', ERROR_TYPES.NOT_FOUND, 404);
      }
      
      // Note: Mock data deletion is not persistent - requires backend API integration
      
      return {
        success: true,
        message: 'Contact deleted successfully'
      };
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle CeedPods API error response
    if (error.response && error.response.data) {
      const mappedError = mapContactErrorResponse(error.response.data);
      throw new ApiError(
        mappedError.message,
        ERROR_TYPES.SERVER,
        mappedError.status,
        error
      );
    }
    
    throw new ApiError(
      error.message || 'Failed to delete contact',
      ERROR_TYPES.SERVER,
      error.status || 500,
      error
    );
  }
};

/**
 * Search contacts with advanced parameters
 * @param {string} query - Search query
 * @param {object} filters - Additional filters
 * @returns {Promise<object>} Search response
 */
export const searchContacts = async (query, filters = {}) => {
  try {
    if (isApiEnabled()) {
      // Use CeedPods API
      const searchParams = mapContactSearchRequest({ query, ...filters });
      const queryString = new URLSearchParams(searchParams).toString();
      const url = `${getApiEndpoints().contacts.search}?${queryString}`;
      
      const response = await contactApiService.get(url);
      
      // Transform CeedPods response to frontend format
      const mappedContacts = mapContactsResponse(response.data || response);
      
      return {
        success: true,
        data: mappedContacts,
        total: response.total || mappedContacts.length,
        query: query
      };
    } else {
      // Use mock data with delay
      await mockDelay();
      
      const searchTerm = query.toLowerCase();
      const currentContacts = getMockContacts();
      let results = currentContacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm) ||
        contact.email.toLowerCase().includes(searchTerm) ||
        contact.company.toLowerCase().includes(searchTerm) ||
        contact.title.toLowerCase().includes(searchTerm) ||
        contact.notes.toLowerCase().includes(searchTerm) ||
        contact.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
      
      // Apply additional filters
      if (filters.status && filters.status !== 'all') {
        results = results.filter(contact => contact.status === filters.status);
      }
      
      return {
        success: true,
        data: results,
        total: results.length,
        query: query
      };
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle CeedPods API error response
    if (error.response && error.response.data) {
      const mappedError = mapContactErrorResponse(error.response.data);
      throw new ApiError(
        mappedError.message,
        ERROR_TYPES.SERVER,
        mappedError.status,
        error
      );
    }
    
    throw new ApiError(
      error.message || 'Failed to search contacts',
      ERROR_TYPES.SERVER,
      error.status || 500,
      error
    );
  }
};

/**
 * Update contact status
 * @param {string} id - Contact ID
 * @param {string} status - New status ('active' or 'inactive')
 * @returns {Promise<object>} Status update response
 */
export const updateContactStatus = async (id, status) => {
  try {
    if (isApiEnabled()) {
      // Use CeedPods API
      const requestData = mapContactStatusUpdate(status);
      const url = getApiEndpoints().contacts.updateStatus.replace('{id}', id);
      const response = await contactApiService.patch(url, requestData);
      
      // Transform CeedPods response to frontend format
      const mappedResponse = mapContactSuccessResponse(response);
      
      return {
        success: true,
        data: mappedResponse.data,
        message: mappedResponse.message
      };
    } else {
      // Use mock data with delay
      await mockDelay();
      
      // Mock data fallback - simulate contact lookup (non-persistent)
      const currentContacts = getMockContacts();
      const contactIndex = currentContacts.findIndex(c => c.id === id);
      if (contactIndex === -1) {
        throw new ApiError('Contact not found', ERROR_TYPES.NOT_FOUND, 404);
      }
      
      // Update status and save to storage
      const updatedContact = {
        ...currentContacts[contactIndex],
        status: status,
        updatedAt: new Date().toISOString()
      };
      
      // Note: Mock data changes are not persistent - requires backend API integration
      
      return {
        success: true,
        data: updatedContact,
        message: `Contact status updated to ${status}`
      };
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle CeedPods API error response
    if (error.response && error.response.data) {
      const mappedError = mapContactErrorResponse(error.response.data);
      throw new ApiError(
        mappedError.message,
        ERROR_TYPES.VALIDATION,
        mappedError.status,
        error
      );
    }
    
    throw new ApiError(
      error.message || 'Failed to update contact status',
      ERROR_TYPES.SERVER,
      error.status || 500,
      error
    );
  }
};

/**
 * Add tag to contact
 * @param {string} id - Contact ID
 * @param {string} tag - Tag to add
 * @returns {Promise<object>} Add tag response
 */
export const addContactTag = async (id, tag) => {
  try {
    if (isApiEnabled()) {
      // Use CeedPods API
      const requestData = mapContactTagOperation(tag);
      const url = getApiEndpoints().contacts.addTag.replace('{id}', id);
      const response = await contactApiService.post(url, requestData);
      
      // Transform CeedPods response to frontend format
      const mappedResponse = mapContactSuccessResponse(response);
      
      return {
        success: true,
        data: mappedResponse.data,
        message: mappedResponse.message
      };
    } else {
      // Use mock data with delay
      await mockDelay();
      
      // Mock data fallback - simulate contact lookup (non-persistent)
      const currentContacts = getMockContacts();
      const contactIndex = currentContacts.findIndex(c => c.id === id);
      if (contactIndex === -1) {
        throw new ApiError('Contact not found', ERROR_TYPES.NOT_FOUND, 404);
      }
      
      const contact = currentContacts[contactIndex];
      
      // Add tag if not already present
      let resultContact = contact;
      if (!contact.tags.includes(tag)) {
        resultContact = {
          ...contact,
          tags: [...contact.tags, tag],
          updatedAt: new Date().toISOString()
        };
        
        // Note: Mock data changes are not persistent - requires backend API integration
      }
      
      return {
        success: true,
        data: resultContact,
        message: `Tag "${tag}" added to contact`
      };
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle CeedPods API error response
    if (error.response && error.response.data) {
      const mappedError = mapContactErrorResponse(error.response.data);
      throw new ApiError(
        mappedError.message,
        ERROR_TYPES.VALIDATION,
        mappedError.status,
        error
      );
    }
    
    throw new ApiError(
      error.message || 'Failed to add tag to contact',
      ERROR_TYPES.SERVER,
      error.status || 500,
      error
    );
  }
};

/**
 * Remove tag from contact
 * @param {string} id - Contact ID
 * @param {string} tag - Tag to remove
 * @returns {Promise<object>} Remove tag response
 */
export const removeContactTag = async (id, tag) => {
  try {
    if (isApiEnabled()) {
      // Use CeedPods API
      const url = getApiEndpoints().contacts.removeTag.replace('{id}', id).replace('{tag}', encodeURIComponent(tag));
      const response = await contactApiService.delete(url);
      
      // Transform CeedPods response to frontend format
      const mappedResponse = mapContactSuccessResponse(response);
      
      return {
        success: true,
        data: mappedResponse.data,
        message: mappedResponse.message
      };
    } else {
      // Use mock data with delay
      await mockDelay();
      
      // Mock data fallback - simulate contact lookup (non-persistent)
      const currentContacts = getMockContacts();
      const contactIndex = currentContacts.findIndex(c => c.id === id);
      if (contactIndex === -1) {
        throw new ApiError('Contact not found', ERROR_TYPES.NOT_FOUND, 404);
      }
      
      const contact = currentContacts[contactIndex];
      
      // Remove tag if present
      let resultContact = contact;
      const tagIndex = contact.tags.indexOf(tag);
      if (tagIndex > -1) {
        resultContact = {
          ...contact,
          tags: contact.tags.filter(t => t !== tag),
          updatedAt: new Date().toISOString()
        };
        
        // Note: Mock data changes are not persistent - requires backend API integration
      }
      
      return {
        success: true,
        data: resultContact,
        message: `Tag "${tag}" removed from contact`
      };
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle CeedPods API error response
    if (error.response && error.response.data) {
      const mappedError = mapContactErrorResponse(error.response.data);
      throw new ApiError(
        mappedError.message,
        ERROR_TYPES.SERVER,
        mappedError.status,
        error
      );
    }
    
    throw new ApiError(
      error.message || 'Failed to remove tag from contact',
      ERROR_TYPES.SERVER,
      error.status || 500,
      error
    );
  }
};

/**
 * Get contact analytics
 * @returns {Promise<object>} Analytics response
 */
export const getContactAnalytics = async () => {
  try {
    if (isApiEnabled()) {
      // Use CeedPods API
      const response = await contactApiService.get(getApiEndpoints().contacts.analytics);
      
      // Transform CeedPods response to frontend format
      const mappedAnalytics = mapContactAnalytics(response.data || response);
      
      return {
        success: true,
        data: mappedAnalytics
      };
    } else {
      // Use mock data with delay
      await mockDelay();
      
      // Mock data fallback - simulate contact lookup (non-persistent)
      const currentContacts = getMockContacts();
      const activeContacts = currentContacts.filter(c => c.status === 'active').length;
      const inactiveContacts = currentContacts.filter(c => c.status === 'inactive').length;
      
      // Calculate mock analytics
      const analytics = {
        totalContacts: currentContacts.length,
        activeContacts: activeContacts,
        inactiveContacts: inactiveContacts,
        contactsThisMonth: Math.floor(currentContacts.length * 0.3), // Mock 30% this month
        contactsLastMonth: Math.floor(currentContacts.length * 0.2), // Mock 20% last month
        averageContactsPerDay: Math.round(currentContacts.length / 30),
        topCompanies: ['Acme Corporation', 'TechStart Solutions', 'Global Corp'],
        topTags: ['enterprise', 'startup', 'decision-maker'],
        statusDistribution: {
          active: activeContacts,
          inactive: inactiveContacts
        },
        growthRate: 15.5, // Mock 15.5% growth
        conversionRate: 22.3, // Mock 22.3% conversion
        averageResponseTime: 24, // Mock 24 hours
        totalInteractions: currentContacts.length * 3 // Mock 3 interactions per contact
      };
      
      return {
        success: true,
        data: analytics
      };
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle CeedPods API error response
    if (error.response && error.response.data) {
      const mappedError = mapContactErrorResponse(error.response.data);
      throw new ApiError(
        mappedError.message,
        ERROR_TYPES.SERVER,
        mappedError.status,
        error
      );
    }
    
    throw new ApiError(
      error.message || 'Failed to fetch contact analytics',
      ERROR_TYPES.SERVER,
      error.status || 500,
      error
    );
  }
};

export default {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  searchContacts,
  updateContactStatus,
  addContactTag,
  removeContactTag,
  getContactAnalytics
};