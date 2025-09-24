import React, { useState } from 'react';
import { 
  Plus, Key, Copy, CheckCircle, Shield, Calendar, 
  Activity, AlertTriangle, Eye, EyeOff, Trash2 
} from 'lucide-react';
import useIntegrationStore from '../stores/integrationStore';
import { API_PERMISSIONS } from '../constants/integrationTypes';

const ApiKeyManager = () => {
  const { apiKeys, generateApiKey, revokeApiKey, deleteApiKey } = useIntegrationStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [visibleKeys, setVisibleKeys] = useState({});
  
  const [formData, setFormData] = useState({
    name: '',
    permissions: []
  });
  
  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key.key);
    setCopiedId(key.id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  const toggleKeyVisibility = (keyId) => {
    setVisibleKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };
  
  const handlePermissionToggle = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.name && formData.permissions.length > 0) {
      const newKey = generateApiKey(formData.name, formData.permissions);
      setFormData({ name: '', permissions: [] });
      setShowCreateForm(false);
      
      // Show the key initially
      setVisibleKeys(prev => ({ ...prev, [newKey.id]: true }));
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };
  
  const getPermissionLabel = (permission) => {
    const labels = {
      'leads:read': 'Read Leads',
      'leads:write': 'Create/Update Leads',
      'leads:delete': 'Delete Leads',
      'users:read': 'Read Users',
      'users:write': 'Manage Users',
      'analytics:read': 'View Analytics',
      'integrations:manage': 'Manage Integrations'
    };
    return labels[permission] || permission;
  };
  
  const getPermissionIcon = (permission) => {
    if (permission.includes('write') || permission.includes('delete') || permission.includes('manage')) {
      return 'text-orange-600';
    }
    return 'text-green-600';
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage API keys for programmatic access to your CRM
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create API Key
        </button>
      </div>
      
      {/* Create API Key Form */}
      {showCreateForm && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="font-medium text-gray-900 mb-4">Create New API Key</h3>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                  placeholder="e.g., Production API Key"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(API_PERMISSIONS).map(([key, value]) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(value)}
                        onChange={() => handlePermissionToggle(value)}
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-600"
                      />
                      <span className="text-sm text-gray-700">
                        {getPermissionLabel(value)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.name || formData.permissions.length === 0}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                Generate API Key
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Keep your API keys secure</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Never share API keys in public repositories or client-side code</li>
              <li>Rotate keys regularly and revoke unused keys</li>
              <li>Use environment variables to store keys in your applications</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* API Keys List */}
      {apiKeys.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No API keys yet</h3>
          <p className="text-gray-600 mb-6">Create API keys to access your CRM programmatically</p>
        </div>
      ) : (
        <div className="space-y-4">
          {apiKeys.map(apiKey => (
            <div 
              key={apiKey.id} 
              className={`bg-white rounded-lg border ${
                apiKey.active ? 'border-gray-200' : 'border-red-200 bg-red-50'
              } p-6`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{apiKey.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      apiKey.active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {apiKey.active ? 'Active' : 'Revoked'}
                    </span>
                  </div>
                  
                  {/* API Key */}
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mb-3">
                    <code className="flex-1 text-xs text-gray-700 font-mono">
                      {visibleKeys[apiKey.id] ? apiKey.key : '••••••••••••••••••••••••••••••••'}
                    </code>
                    <button
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                      className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                      title={visibleKeys[apiKey.id] ? 'Hide' : 'Show'}
                    >
                      {visibleKeys[apiKey.id] ? (
                        <EyeOff className="w-4 h-4 text-gray-600" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                    <button
                      onClick={() => handleCopyKey(apiKey)}
                      className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                      title="Copy"
                    >
                      {copiedId === apiKey.id ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                  
                  {/* Permissions */}
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Permissions:</p>
                    <div className="flex flex-wrap gap-2">
                      {apiKey.permissions.map(permission => (
                        <span 
                          key={permission} 
                          className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                            permission.includes('write') || permission.includes('delete') || permission.includes('manage')
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          {getPermissionLabel(permission)}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Created: {formatDate(apiKey.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="w-4 h-4" />
                      Last used: {formatDate(apiKey.lastUsed)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="w-4 h-4" />
                      Usage: {apiKey.usage} requests
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  {apiKey.active ? (
                    <button
                      onClick={() => revokeApiKey(apiKey.id)}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                    >
                      Revoke
                    </button>
                  ) : (
                    <button
                      onClick={() => deleteApiKey(apiKey.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                </div>
              </div>
              
              {apiKey.revokedAt && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-red-600">
                    Revoked on {formatDate(apiKey.revokedAt)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* API Documentation */}
      <div className="mt-6 bg-gray-900 text-white rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Start</h3>
        <p className="text-sm text-gray-300 mb-4">Use your API key to make authenticated requests:</p>
        <pre className="bg-gray-800 rounded p-4 text-xs overflow-x-auto">
          <code>{`curl -X GET https://api.salestracker.com/v1/leads \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</code>
        </pre>
        <a href="#" className="text-teal-400 hover:text-teal-300 text-sm font-medium mt-4 inline-block">
          View Full API Documentation →
        </a>
      </div>
    </div>
  );
};

export default ApiKeyManager;