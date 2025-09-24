import React, { useState } from 'react';
import { 
  CheckCircle, AlertCircle, Clock, RefreshCw, Settings, 
  Trash2, Activity, TrendingUp, AlertTriangle
} from 'lucide-react';
import useIntegrationStore from '../stores/integrationStore';
import { INTEGRATION_CONFIGS, INTEGRATION_STATUS } from '../constants/integrationTypes';

const IntegrationCard = ({ integration }) => {
  const { updateIntegrationStatus, deleteIntegration, syncIntegration } = useIntegrationStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const config = INTEGRATION_CONFIGS[integration.type];
  
  const getStatusIcon = () => {
    switch (integration.status) {
      case INTEGRATION_STATUS.CONNECTED:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case INTEGRATION_STATUS.ERROR:
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case INTEGRATION_STATUS.PENDING:
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case INTEGRATION_STATUS.EXPIRED:
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };
  
  const getStatusText = () => {
    switch (integration.status) {
      case INTEGRATION_STATUS.CONNECTED:
        return 'Connected';
      case INTEGRATION_STATUS.ERROR:
        return 'Error';
      case INTEGRATION_STATUS.PENDING:
        return 'Connecting...';
      case INTEGRATION_STATUS.EXPIRED:
        return 'Expired';
      default:
        return 'Disconnected';
    }
  };
  
  const handleSync = async () => {
    setIsSyncing(true);
    const result = await syncIntegration(integration.id);
    setIsSyncing(false);
    
    if (result.success) {
      // Show success message
    } else {
      // Show error message
    }
  };
  
  const handleDisconnect = () => {
    if (window.confirm(`Are you sure you want to disconnect ${config.name}?`)) {
      updateIntegrationStatus(integration.id, INTEGRATION_STATUS.DISCONNECTED);
    }
  };
  
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete this integration? This action cannot be undone.`)) {
      deleteIntegration(integration.id);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };
  
  return (
    <div className={`bg-white rounded-lg border ${
      integration.status === INTEGRATION_STATUS.ERROR ? 'border-red-200' : 'border-gray-200'
    } p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${config.color} rounded-lg flex items-center justify-center text-white text-2xl`}>
            {config.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{config.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              {getStatusIcon()}
              <span className={`text-sm ${
                integration.status === INTEGRATION_STATUS.CONNECTED ? 'text-green-600' :
                integration.status === INTEGRATION_STATUS.ERROR ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {getStatusText()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Imported</p>
          <p className="text-lg font-semibold text-gray-900 flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            {integration.metrics?.totalImported || 0}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Last Import</p>
          <p className="text-lg font-semibold text-gray-900">
            {integration.metrics?.lastImportCount || 0}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Last Sync</p>
          <p className="text-sm text-gray-700">
            {formatDate(integration.lastSync)}
          </p>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
        {integration.status === INTEGRATION_STATUS.CONNECTED ? (
          <>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
            <button
              onClick={handleDisconnect}
              className="px-3 py-2 text-gray-700 hover:bg-gray-100 text-sm font-medium rounded-lg transition-colors"
            >
              Disconnect
            </button>
          </>
        ) : integration.status === INTEGRATION_STATUS.ERROR ? (
          <>
            <button
              onClick={() => updateIntegrationStatus(integration.id, INTEGRATION_STATUS.PENDING)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reconnect
            </button>
          </>
        ) : (
          <button
            onClick={() => updateIntegrationStatus(integration.id, INTEGRATION_STATUS.PENDING)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Connect
          </button>
        )}
      </div>
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Integration Settings</h4>
          <div className="space-y-2">
            {integration.config && Object.entries(integration.config).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>
                <span className="text-gray-900 font-medium">
                  {key.includes('token') || key.includes('key') ? '••••••••' : value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationCard;