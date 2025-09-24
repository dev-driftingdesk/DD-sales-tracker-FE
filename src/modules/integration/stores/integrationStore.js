import { create } from 'zustand';
import { INTEGRATION_STATUS, WEBHOOK_EVENTS } from '../constants/integrationTypes';

const useIntegrationStore = create((set, get) => ({
  // State
  integrations: [],
  webhooks: [],
  apiKeys: [],
  customFields: [],
  themeSettings: {
    primaryColor: '#0D9488',
    darkColor: '#111827',
    logo: null,
    companyName: 'Sales Tracker',
    fontHeading: 'Inter',
    fontBody: 'Inter'
  },
  integrationLogs: [],
  isLoading: false,
  error: null,
  
  // Actions - Integrations
  setIntegrations: (integrations) => set({ integrations }),
  
  addIntegration: (integration) => {
    const newIntegration = {
      ...integration,
      id: Date.now().toString(),
      status: INTEGRATION_STATUS.PENDING,
      createdAt: new Date().toISOString(),
      lastSync: null,
      metrics: {
        totalImported: 0,
        lastImportCount: 0,
        errors: 0
      }
    };
    
    set(state => ({
      integrations: [...state.integrations, newIntegration]
    }));
    
    // Simulate connection process
    setTimeout(() => {
      get().updateIntegrationStatus(newIntegration.id, INTEGRATION_STATUS.CONNECTED);
    }, 2000);
    
    return newIntegration;
  },
  
  updateIntegration: (id, updates) => {
    set(state => ({
      integrations: state.integrations.map(integration =>
        integration.id === id
          ? { ...integration, ...updates, updatedAt: new Date().toISOString() }
          : integration
      )
    }));
  },
  
  updateIntegrationStatus: (id, status) => {
    set(state => ({
      integrations: state.integrations.map(integration =>
        integration.id === id
          ? { ...integration, status, statusUpdatedAt: new Date().toISOString() }
          : integration
      )
    }));
  },
  
  deleteIntegration: (id) => {
    set(state => ({
      integrations: state.integrations.filter(i => i.id !== id)
    }));
  },
  
  // Actions - Webhooks
  addWebhook: (webhook) => {
    const newWebhook = {
      ...webhook,
      id: Date.now().toString(),
      url: `https://api.salestracker.com/webhooks/${Date.now()}`,
      secret: generateWebhookSecret(),
      active: true,
      createdAt: new Date().toISOString(),
      lastTriggered: null,
      triggerCount: 0
    };
    
    set(state => ({
      webhooks: [...state.webhooks, newWebhook]
    }));
    
    return newWebhook;
  },
  
  updateWebhook: (id, updates) => {
    set(state => ({
      webhooks: state.webhooks.map(webhook =>
        webhook.id === id
          ? { ...webhook, ...updates, updatedAt: new Date().toISOString() }
          : webhook
      )
    }));
  },
  
  deleteWebhook: (id) => {
    set(state => ({
      webhooks: state.webhooks.filter(w => w.id !== id)
    }));
  },
  
  toggleWebhook: (id) => {
    set(state => ({
      webhooks: state.webhooks.map(webhook =>
        webhook.id === id
          ? { ...webhook, active: !webhook.active }
          : webhook
      )
    }));
  },
  
  // Actions - API Keys
  generateApiKey: (name, permissions) => {
    const newApiKey = {
      id: Date.now().toString(),
      name,
      key: generateApiKey(),
      permissions,
      active: true,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      usage: 0
    };
    
    set(state => ({
      apiKeys: [...state.apiKeys, newApiKey]
    }));
    
    return newApiKey;
  },
  
  revokeApiKey: (id) => {
    set(state => ({
      apiKeys: state.apiKeys.map(key =>
        key.id === id
          ? { ...key, active: false, revokedAt: new Date().toISOString() }
          : key
      )
    }));
  },
  
  deleteApiKey: (id) => {
    set(state => ({
      apiKeys: state.apiKeys.filter(k => k.id !== id)
    }));
  },
  
  // Actions - Custom Fields
  addCustomField: (field) => {
    const newField = {
      ...field,
      id: Date.now().toString(),
      active: true,
      createdAt: new Date().toISOString()
    };
    
    set(state => ({
      customFields: [...state.customFields, newField]
    }));
    
    return newField;
  },
  
  updateCustomField: (id, updates) => {
    set(state => ({
      customFields: state.customFields.map(field =>
        field.id === id
          ? { ...field, ...updates, updatedAt: new Date().toISOString() }
          : field
      )
    }));
  },
  
  deleteCustomField: (id) => {
    set(state => ({
      customFields: state.customFields.filter(f => f.id !== id)
    }));
  },
  
  // Actions - Theme Settings
  updateThemeSettings: (settings) => {
    set(state => ({
      themeSettings: { ...state.themeSettings, ...settings }
    }));
  },
  
  // Actions - Integration Logs
  addIntegrationLog: (log) => {
    const newLog = {
      ...log,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    set(state => ({
      integrationLogs: [newLog, ...state.integrationLogs].slice(0, 100) // Keep last 100 logs
    }));
  },
  
  // Sync actions
  syncIntegration: async (id) => {
    const integration = get().integrations.find(i => i.id === id);
    if (!integration) return;
    
    set({ isLoading: true });
    
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const importCount = Math.floor(Math.random() * 20) + 1;
      
      get().updateIntegration(id, {
        lastSync: new Date().toISOString(),
        metrics: {
          ...integration.metrics,
          totalImported: integration.metrics.totalImported + importCount,
          lastImportCount: importCount
        }
      });
      
      get().addIntegrationLog({
        integrationId: id,
        type: 'sync',
        status: 'success',
        message: `Successfully imported ${importCount} leads`,
        details: { importCount }
      });
      
      set({ isLoading: false });
      return { success: true, importCount };
      
    } catch (error) {
      get().updateIntegrationStatus(id, INTEGRATION_STATUS.ERROR);
      get().addIntegrationLog({
        integrationId: id,
        type: 'sync',
        status: 'error',
        message: 'Sync failed',
        details: { error: error.message }
      });
      
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },
  
  // Test webhook
  testWebhook: async (id) => {
    const webhook = get().webhooks.find(w => w.id === id);
    if (!webhook) return;
    
    try {
      // Simulate webhook test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      get().updateWebhook(id, {
        lastTriggered: new Date().toISOString(),
        triggerCount: webhook.triggerCount + 1
      });
      
      get().addIntegrationLog({
        webhookId: id,
        type: 'webhook_test',
        status: 'success',
        message: `Webhook test successful`,
        details: { url: webhook.url, events: webhook.events }
      });
      
      return { success: true };
      
    } catch (error) {
      get().addIntegrationLog({
        webhookId: id,
        type: 'webhook_test',
        status: 'error',
        message: 'Webhook test failed',
        details: { error: error.message }
      });
      
      return { success: false, error: error.message };
    }
  }
}));

// Helper functions
const generateWebhookSecret = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let secret = 'whsec_';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
};

const generateApiKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'sk_live_';
  for (let i = 0; i < 40; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
};

export default useIntegrationStore;