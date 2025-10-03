import React from 'react';
import { Wifi, WifiOff, Server, AlertCircle } from 'lucide-react';
import useAuthStore from '../../modules/auth/stores/authStore.js';

/**
 * Backend Status Indicator Component
 * Shows the current backend connectivity status and authentication mode
 */
const BackendStatusIndicator = ({ className = "" }) => {
  const { authMode, statusMessage, backendStatus } = useAuthStore();

  // Don't show indicator if user is not authenticated
  if (!authMode) {
    return null;
  }

  const getStatusConfig = () => {
    switch (authMode) {
      case 'api':
        return {
          icon: Server,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          text: 'API Mode',
          description: 'Connected to backend server'
        };
      case 'mock':
        return {
          icon: WifiOff,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          text: 'Demo Mode',
          description: 'Backend unavailable - using mock data'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          text: 'Unknown',
          description: 'Status unknown'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className={`inline-flex items-center px-3 py-1.5 rounded-lg border text-sm ${statusConfig.bgColor} ${statusConfig.borderColor} ${className}`}>
      <StatusIcon className={`w-4 h-4 mr-2 ${statusConfig.color}`} />
      <span className={`font-medium ${statusConfig.color}`}>
        {statusConfig.text}
      </span>
      {statusMessage && (
        <span className="ml-2 text-gray-600 text-xs hidden sm:inline">
          • {statusMessage}
        </span>
      )}
    </div>
  );
};

export default BackendStatusIndicator;