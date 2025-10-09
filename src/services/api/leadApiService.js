/**
 * Lead API Service
 * Handles all lead-related API operations with backend integration
 */

import { createApiService } from './index.js';

const leadApiService = createApiService('api/v2/leads');

export const leadApi = {
  // Core Lead Operations
  getLeads: async (filters = {}) => {
    // Map frontend filter names to backend API parameter names
    const cleanParams = {};
    
    // Backend expects specific parameter names as per API spec
    if (filters.page && filters.page > 0) cleanParams.Page = filters.page;
    if (filters.pageSize && filters.pageSize > 0) cleanParams.Limit = filters.pageSize;
    if (filters.status && filters.status !== 'all') cleanParams.Status = filters.status;
    if (filters.source && filters.source !== 'all') cleanParams.Source = filters.source;
    if (filters.searchTerm && filters.searchTerm.trim()) cleanParams.Search = filters.searchTerm.trim();
    if (filters.assignedTo && filters.assignedTo !== 'all' && filters.assignedTo.trim()) cleanParams.AssignedTo = filters.assignedTo.trim();
    
    // Set default pagination per backend API spec
    if (!cleanParams.Page) cleanParams.Page = 1;
    if (!cleanParams.Limit) cleanParams.Limit = 25;
    
    const params = new URLSearchParams(cleanParams);
    console.log('API Request URL:', `api/v2/leads?${params}`);
    console.log('Backend API params being sent:', cleanParams);
    
    try {
      const response = await leadApiService.get(`?${params}`);
      console.log('✅ Lead API Success:', {
        status: 'success',
        dataCount: response.data?.length || response.length || 'unknown',
        hasData: !!response.data || !!response.length,
        responseStructure: Object.keys(response || {})
      });
      return response;
    } catch (error) {
      console.error('❌ Lead API Error Details:', {
        status: error.status,
        statusCode: error.response?.status,
        message: error.message,
        response: error.response?.data,
        validationErrors: error.response?.data?.errors,
        headers: error.response?.headers,
        originalError: error
      });
      throw error;
    }
  },

  getLead: (id) => leadApiService.get(`/${id}`),
  
  createLead: (leadData) => leadApiService.post('', leadData),
  
  updateLead: (id, leadData) => leadApiService.put(`/${id}`, leadData),
  
  deleteLead: (id) => leadApiService.delete(`/${id}`),

  // Lead Management Operations
  assignLead: (leadId, userId) => 
    leadApiService.post(`/${leadId}/assign`, { userId }),
    
  updateLeadStatus: (leadId, status) => 
    leadApiService.patch(`/${leadId}/status`, { status }),
    
  convertLead: (leadId, userId) => 
    leadApiService.post(`/${leadId}/convert`, { userId }),

  // Activity Operations
  createActivity: (leadId, activityData) => 
    leadApiService.post(`/${leadId}/activities`, activityData),
    
  getActivities: (leadId) => 
    leadApiService.get(`/${leadId}/activities`),

  // Notes Operations
  createNote: (leadId, noteData) => 
    leadApiService.post(`/${leadId}/notes`, noteData),
    
  getNotes: (leadId) => 
    leadApiService.get(`/${leadId}/notes`),

  // Scoring and Analytics
  updateScore: (leadId, scoreData) => 
    leadApiService.post(`/${leadId}/score`, scoreData),
    
  getAnalytics: (filters = {}) => 
    leadApiService.get('/analytics', { params: filters })
};

export default leadApi;