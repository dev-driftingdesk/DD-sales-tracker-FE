// API Client for Testing
const axios = require('axios');

class ApiClient {
  constructor(baseURL = process.env.API_BASE_URL || 'http://localhost:3001') {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      validateStatus: () => true // Don't throw on HTTP error statuses
    });

    // Request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        // Log response details in test mode
        if (process.env.NODE_ENV === 'test' && process.env.LOG_API_CALLS === 'true') {
          console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        }
        return response;
      },
      (error) => {
        console.error(`API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`, error.message);
        return Promise.reject(error);
      }
    );
  }

  // Authentication methods
  async authenticate(email, password) {
    const response = await this.client.post('/api/auth/login', { email, password });
    if (response.status === 200 && response.data.token) {
      this.authToken = response.data.token;
      return response.data;
    }
    throw new Error(`Authentication failed: ${response.status}`);
  }

  setAuthToken(token) {
    this.authToken = token;
  }

  clearAuth() {
    this.authToken = null;
  }

  // Generic HTTP methods
  async get(url, config = {}) {
    return this.client.get(url, config);
  }

  async post(url, data, config = {}) {
    return this.client.post(url, data, config);
  }

  async put(url, data, config = {}) {
    return this.client.put(url, data, config);
  }

  async patch(url, data, config = {}) {
    return this.client.patch(url, data, config);
  }

  async delete(url, config = {}) {
    return this.client.delete(url, config);
  }

  // Authentication endpoints
  async register(userData) {
    return this.post('/api/auth/register', userData);
  }

  async login(email, password) {
    return this.post('/api/auth/login', { email, password });
  }

  async logout() {
    return this.post('/api/auth/logout');
  }

  async refreshToken() {
    return this.post('/api/auth/refresh');
  }

  async forgotPassword(email) {
    return this.post('/api/auth/forgot-password', { email });
  }

  async resetPassword(token, newPassword) {
    return this.post('/api/auth/reset-password', { token, newPassword });
  }

  // Lead endpoints
  async getLeads(params = {}) {
    return this.get('/api/leads', { params });
  }

  async getLead(id) {
    return this.get(`/api/leads/${id}`);
  }

  async createLead(leadData) {
    return this.post('/api/leads', leadData);
  }

  async updateLead(id, updates) {
    return this.patch(`/api/leads/${id}`, updates);
  }

  async deleteLead(id) {
    return this.delete(`/api/leads/${id}`);
  }

  async assignLead(id, assigneeId) {
    return this.patch(`/api/leads/${id}/assign`, { assignedTo: assigneeId });
  }

  async addLeadActivity(id, activity) {
    return this.post(`/api/leads/${id}/activities`, activity);
  }

  async getLeadActivities(id) {
    return this.get(`/api/leads/${id}/activities`);
  }

  // Contact endpoints
  async getContacts(params = {}) {
    return this.get('/api/contacts', { params });
  }

  async getContact(id) {
    return this.get(`/api/contacts/${id}`);
  }

  async createContact(contactData) {
    return this.post('/api/contacts', contactData);
  }

  async updateContact(id, updates) {
    return this.patch(`/api/contacts/${id}`, updates);
  }

  async deleteContact(id) {
    return this.delete(`/api/contacts/${id}`);
  }

  // Company endpoints
  async getCompanies(params = {}) {
    return this.get('/api/companies', { params });
  }

  async getCompany(id) {
    return this.get(`/api/companies/${id}`);
  }

  async createCompany(companyData) {
    return this.post('/api/companies', companyData);
  }

  async updateCompany(id, updates) {
    return this.patch(`/api/companies/${id}`, updates);
  }

  async deleteCompany(id) {
    return this.delete(`/api/companies/${id}`);
  }

  // Deal endpoints
  async getDeals(params = {}) {
    return this.get('/api/deals', { params });
  }

  async getDeal(id) {
    return this.get(`/api/deals/${id}`);
  }

  async createDeal(dealData) {
    return this.post('/api/deals', dealData);
  }

  async updateDeal(id, updates) {
    return this.patch(`/api/deals/${id}`, updates);
  }

  async deleteDeal(id) {
    return this.delete(`/api/deals/${id}`);
  }

  async updateDealStage(id, stage) {
    return this.patch(`/api/deals/${id}/stage`, { stage });
  }

  // Analytics endpoints
  async getAnalytics(type, params = {}) {
    return this.get(`/api/analytics/${type}`, { params });
  }

  async getDashboardMetrics(params = {}) {
    return this.get('/api/analytics/dashboard', { params });
  }

  async getPerformanceMetrics(params = {}) {
    return this.get('/api/analytics/performance', { params });
  }

  async getConversionMetrics(params = {}) {
    return this.get('/api/analytics/conversion', { params });
  }

  // User management endpoints
  async getUsers(params = {}) {
    return this.get('/api/users', { params });
  }

  async getUser(id) {
    return this.get(`/api/users/${id}`);
  }

  async createUser(userData) {
    return this.post('/api/users', userData);
  }

  async updateUser(id, updates) {
    return this.patch(`/api/users/${id}`, updates);
  }

  async deleteUser(id) {
    return this.delete(`/api/users/${id}`);
  }

  // Email endpoints
  async sendEmail(emailData) {
    return this.post('/api/emails/send', emailData);
  }

  async getEmailTemplates() {
    return this.get('/api/emails/templates');
  }

  async getEmailHistory(params = {}) {
    return this.get('/api/emails/history', { params });
  }

  // Notification endpoints
  async getNotifications(params = {}) {
    return this.get('/api/notifications', { params });
  }

  async markNotificationRead(id) {
    return this.patch(`/api/notifications/${id}/read`);
  }

  async getNotificationSettings() {
    return this.get('/api/notifications/settings');
  }

  async updateNotificationSettings(settings) {
    return this.put('/api/notifications/settings', settings);
  }

  // Product endpoints
  async getProducts(params = {}) {
    return this.get('/api/products', { params });
  }

  async getProduct(id) {
    return this.get(`/api/products/${id}`);
  }

  async createProduct(productData) {
    return this.post('/api/products', productData);
  }

  async updateProduct(id, updates) {
    return this.patch(`/api/products/${id}`, updates);
  }

  // Webhook endpoints
  async createWebhook(webhookData) {
    return this.post('/api/webhooks', webhookData);
  }

  async getWebhooks() {
    return this.get('/api/webhooks');
  }

  async deleteWebhook(id) {
    return this.delete(`/api/webhooks/${id}`);
  }

  // File upload endpoints
  async uploadFile(file, type = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    return this.post('/api/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  // Health check
  async healthCheck() {
    return this.get('/health');
  }

  // Utility methods for testing
  async measureResponseTime(method, ...args) {
    const start = Date.now();
    const response = await this[method](...args);
    const responseTime = Date.now() - start;
    
    return {
      response,
      responseTime,
      success: response.status >= 200 && response.status < 300
    };
  }

  async batchRequest(requests) {
    const results = await Promise.allSettled(
      requests.map(({ method, args }) => this[method](...args))
    );
    
    return results.map((result, index) => ({
      index,
      status: result.status,
      value: result.value || result.reason,
      request: requests[index]
    }));
  }
}

module.exports = ApiClient;