import React, { useState } from 'react';
import { 
  Activity, CheckCircle, AlertCircle, Info, 
  Filter, Download, RefreshCw, ChevronDown, ChevronUp 
} from 'lucide-react';
import useIntegrationStore from '../stores/integrationStore';
import { INTEGRATION_CONFIGS } from '../constants/integrationTypes';

const IntegrationLogs = () => {
  const { integrationLogs, integrations, webhooks } = useIntegrationStore();
  const [expandedLogs, setExpandedLogs] = useState({});
  const [filter, setFilter] = useState({
    type: 'all',
    status: 'all',
    integration: 'all'
  });
  
  const getLogIcon = (log) => {
    switch (log.status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };
  
  const getLogColor = (log) => {
    switch (log.status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };
  
  const toggleLogExpansion = (logId) => {
    setExpandedLogs(prev => ({ ...prev, [logId]: !prev[logId] }));
  };
  
  const getIntegrationName = (log) => {
    if (log.integrationId) {
      const integration = integrations.find(i => i.id === log.integrationId);
      return integration ? INTEGRATION_CONFIGS[integration.type]?.name : 'Unknown';
    }
    if (log.webhookId) {
      const webhook = webhooks.find(w => w.id === log.webhookId);
      return webhook ? `Webhook: ${webhook.name}` : 'Unknown Webhook';
    }
    return 'System';
  };
  
  const filteredLogs = integrationLogs.filter(log => {
    if (filter.type !== 'all' && log.type !== filter.type) return false;
    if (filter.status !== 'all' && log.status !== filter.status) return false;
    if (filter.integration !== 'all') {
      const logIntegration = getIntegrationName(log);
      if (logIntegration !== filter.integration) return false;
    }
    return true;
  });
  
  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'Type', 'Status', 'Integration', 'Message', 'Details'],
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.type,
        log.status,
        getIntegrationName(log),
        log.message,
        JSON.stringify(log.details || {})
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `integration-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    
    return date.toLocaleString();
  };
  
  // Get unique integrations for filter
  const uniqueIntegrations = [...new Set(integrationLogs.map(getIntegrationName))];
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Activity Logs</h2>
          <p className="text-sm text-gray-600 mt-1">
            Monitor integration activity and troubleshoot issues
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={exportLogs}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Logs
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600" />
          
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
          >
            <option value="all">All Types</option>
            <option value="sync">Sync</option>
            <option value="webhook_test">Webhook Test</option>
            <option value="api_call">API Call</option>
            <option value="error">Error</option>
          </select>
          
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
            <option value="info">Info</option>
          </select>
          
          <select
            value={filter.integration}
            onChange={(e) => setFilter({ ...filter, integration: e.target.value })}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
          >
            <option value="all">All Integrations</option>
            {uniqueIntegrations.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          
          <span className="text-sm text-gray-600">
            Showing {filteredLogs.length} of {integrationLogs.length} logs
          </span>
        </div>
      </div>
      
      {/* Logs List */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
          <p className="text-gray-600">Integration activity will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map(log => (
            <div 
              key={log.id}
              className={`rounded-lg border p-4 ${getLogColor(log)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getLogIcon(log)}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-gray-900">
                        {getIntegrationName(log)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{log.message}</p>
                    
                    {log.details && Object.keys(log.details).length > 0 && (
                      <button
                        onClick={() => toggleLogExpansion(log.id)}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mt-2"
                      >
                        {expandedLogs[log.id] ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Hide details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Show details
                          </>
                        )}
                      </button>
                    )}
                    
                    {expandedLogs[log.id] && log.details && (
                      <div className="mt-3 p-3 bg-white bg-opacity-50 rounded border border-gray-200">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
                
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  log.status === 'success' ? 'bg-green-100 text-green-700' :
                  log.status === 'error' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {log.type.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Load More */}
      {filteredLogs.length >= 50 && (
        <div className="text-center mt-6">
          <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
            Load more logs
          </button>
        </div>
      )}
    </div>
  );
};

export default IntegrationLogs;