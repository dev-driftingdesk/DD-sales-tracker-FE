import React, { useState } from 'react';
import { 
  Plus, Link2, Webhook, Key, Palette, Database, 
  Settings, ArrowRight, CheckCircle, AlertCircle, Clock
} from 'lucide-react';
import useIntegrationStore from '../stores/integrationStore';
import IntegrationCard from './IntegrationCard';
import AddIntegrationModal from './AddIntegrationModal';
import WebhookManager from './WebhookManager';
import ApiKeyManager from './ApiKeyManager';
import CustomizationSettings from './CustomizationSettings';
import CustomFieldsBuilder from './CustomFieldsBuilder';
import IntegrationLogs from './IntegrationLogs';

const IntegrationsDashboard = () => {
  const { integrations, webhooks, apiKeys, customFields } = useIntegrationStore();
  const [activeTab, setActiveTab] = useState('integrations');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Calculate statistics
  const activeIntegrations = integrations.filter(i => i.status === 'connected').length;
  const totalLeadsImported = integrations.reduce((sum, i) => sum + (i.metrics?.totalImported || 0), 0);
  const activeWebhooks = webhooks.filter(w => w.active).length;
  const activeApiKeys = apiKeys.filter(k => k.active).length;
  
  const tabs = [
    { id: 'integrations', label: 'Integrations', icon: Link2, count: integrations.length },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook, count: webhooks.length },
    { id: 'api', label: 'API Keys', icon: Key, count: apiKeys.length },
    { id: 'customization', label: 'Customization', icon: Palette },
    { id: 'fields', label: 'Custom Fields', icon: Database, count: customFields.length },
    { id: 'logs', label: 'Activity Logs', icon: Clock }
  ];
  
  return (
    <div className="bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Integration & Customization</h1>
        <p className="text-gray-600">Connect third-party services and customize your CRM</p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">{activeIntegrations}</span>
          </div>
          <p className="text-sm text-gray-600">Active Integrations</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <ArrowRight className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">{totalLeadsImported}</span>
          </div>
          <p className="text-sm text-gray-600">Leads Imported</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Webhook className="w-5 h-5 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">{activeWebhooks}</span>
          </div>
          <p className="text-sm text-gray-600">Active Webhooks</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Key className="w-5 h-5 text-yellow-600" />
            <span className="text-2xl font-bold text-gray-900">{activeApiKeys}</span>
          </div>
          <p className="text-sm text-gray-600">Active API Keys</p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors
                    ${activeTab === tab.id
                      ? 'text-teal-600 border-b-2 border-teal-600'
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'integrations' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Connected Integrations</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Integration
                </button>
              </div>
              
              {integrations.length === 0 ? (
                <div className="text-center py-12">
                  <Link2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations yet</h3>
                  <p className="text-gray-600 mb-6">Connect your favorite tools to import leads automatically</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Your First Integration
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {integrations.map(integration => (
                    <IntegrationCard key={integration.id} integration={integration} />
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'webhooks' && <WebhookManager />}
          {activeTab === 'api' && <ApiKeyManager />}
          {activeTab === 'customization' && <CustomizationSettings />}
          {activeTab === 'fields' && <CustomFieldsBuilder />}
          {activeTab === 'logs' && <IntegrationLogs />}
        </div>
      </div>
      
      {/* Add Integration Modal */}
      {showAddModal && (
        <AddIntegrationModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
};

export default IntegrationsDashboard;