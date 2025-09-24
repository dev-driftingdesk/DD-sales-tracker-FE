import React, { useState } from 'react';
import { 
  Plus, Webhook, Copy, CheckCircle, AlertCircle, 
  ToggleLeft, ToggleRight, TestTube, Trash2, ExternalLink 
} from 'lucide-react';
import useIntegrationStore from '../stores/integrationStore';
import { WEBHOOK_EVENTS } from '../constants/integrationTypes';

const WebhookManager = () => {
  const { webhooks, addWebhook, updateWebhook, deleteWebhook, toggleWebhook, testWebhook } = useIntegrationStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [testingId, setTestingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    events: [],
    description: ''
  });
  
  const handleCopyUrl = (webhook) => {
    navigator.clipboard.writeText(webhook.url);
    setCopiedId(webhook.id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  const handleTestWebhook = async (id) => {
    setTestingId(id);
    const result = await testWebhook(id);
    setTestingId(null);
    
    if (result.success) {
      // Show success message
    } else {
      // Show error message
    }
  };
  
  const handleEventToggle = (event) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.name && formData.events.length > 0) {
      addWebhook(formData);
      setFormData({ name: '', events: [], description: '' });
      setShowAddForm(false);
    }
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Webhooks</h2>
          <p className="text-sm text-gray-600 mt-1">
            Send real-time data to your applications when events occur
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Webhook
        </button>
      </div>
      
      {/* Add Webhook Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="font-medium text-gray-900 mb-4">Create New Webhook</h3>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                  placeholder="e.g., Lead Updates to Slack"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none resize-none"
                  placeholder="What does this webhook do?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Events to Subscribe *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(WEBHOOK_EVENTS).map(([key, value]) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.events.includes(value)}
                        onChange={() => handleEventToggle(value)}
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-600"
                      />
                      <span className="text-sm text-gray-700">
                        {value.replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.name || formData.events.length === 0}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                Create Webhook
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Webhooks List */}
      {webhooks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Webhook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No webhooks yet</h3>
          <p className="text-gray-600 mb-6">Create webhooks to send data to your applications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {webhooks.map(webhook => (
            <div key={webhook.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{webhook.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      webhook.active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {webhook.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {webhook.description && (
                    <p className="text-sm text-gray-600 mb-3">{webhook.description}</p>
                  )}
                  
                  {/* Webhook URL */}
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mb-3">
                    <code className="flex-1 text-xs text-gray-700 font-mono">
                      {webhook.url}
                    </code>
                    <button
                      onClick={() => handleCopyUrl(webhook)}
                      className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                      title="Copy URL"
                    >
                      {copiedId === webhook.id ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                  
                  {/* Events */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {webhook.events.map(event => (
                      <span key={event} className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs font-medium">
                        {event}
                      </span>
                    ))}
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Secret: {webhook.secret.substring(0, 12)}...</span>
                    <span>•</span>
                    <span>Triggered {webhook.triggerCount} times</span>
                    {webhook.lastTriggered && (
                      <>
                        <span>•</span>
                        <span>Last triggered: {new Date(webhook.lastTriggered).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleWebhook(webhook.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title={webhook.active ? 'Disable' : 'Enable'}
                  >
                    {webhook.active ? (
                      <ToggleRight className="w-5 h-5 text-teal-600" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleTestWebhook(webhook.id)}
                    disabled={!webhook.active || testingId === webhook.id}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 rounded-lg transition-colors"
                    title="Test webhook"
                  >
                    <TestTube className={`w-5 h-5 ${testingId === webhook.id ? 'animate-pulse' : ''} text-gray-600`} />
                  </button>
                  <button
                    onClick={() => deleteWebhook(webhook.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Documentation Link */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-3">
          <ExternalLink className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">Webhook Documentation</h4>
            <p className="text-sm text-blue-800">
              Learn how to handle webhook payloads, verify signatures, and implement retry logic.
            </p>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block">
              View Documentation →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebhookManager;