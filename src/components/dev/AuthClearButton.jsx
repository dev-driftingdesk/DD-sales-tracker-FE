/**
 * Authentication Clear Button Component
 * Development utility component to clear all authentication data
 * Only shows in development environment
 */

import React, { useState } from 'react';
import { Trash2, RefreshCw, Eye, AlertTriangle } from 'lucide-react';
import { clearAllAuthData, checkStoredAuthData, forceLogoutAndClear } from '../../utils/authClearUtils.js';

const AuthClearButton = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [authData, setAuthData] = useState(null);
  const [clearing, setClearing] = useState(false);
  
  // Only show in development environment
  if (import.meta.env.PROD) {
    return null;
  }
  
  const handleCheckStoredData = () => {
    const data = checkStoredAuthData();
    setAuthData(data);
    setShowDetails(true);
  };
  
  const handleClearAuthData = async () => {
    setClearing(true);
    try {
      const result = clearAllAuthData();
      console.log('Clear result:', result);
      
      // Refresh the stored data check
      const updatedData = checkStoredAuthData();
      setAuthData(updatedData);
      
      alert('Authentication data cleared successfully!');
    } catch (error) {
      console.error('Failed to clear auth data:', error);
      alert('Failed to clear authentication data: ' + error.message);
    } finally {
      setClearing(false);
    }
  };
  
  const handleForceLogoutAndClear = async () => {
    if (confirm('This will clear all authentication data and reload the page. Continue?')) {
      setClearing(true);
      await forceLogoutAndClear();
      // Page will reload, so this won't execute
    }
  };
  
  const hasStoredData = authData && (
    Object.keys(authData.localStorage).length > 0 ||
    Object.keys(authData.sessionStorage).length > 0 ||
    authData.authStore.isAuthenticated ||
    authData.authStore.user ||
    authData.userStore.hasDeprecatedAuthState // Check for deprecated auth state
  );
  
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-md">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-yellow-500" />
        <h3 className="text-sm font-semibold text-gray-900">
          Dev Tools: Authentication
        </h3>
      </div>
      
      <div className="flex flex-col gap-2">
        <button
          onClick={handleCheckStoredData}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Check Stored Auth Data
        </button>
        
        <button
          onClick={handleClearAuthData}
          disabled={clearing}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          {clearing ? 'Clearing...' : 'Clear Auth Data Only'}
        </button>
        
        <button
          onClick={handleForceLogoutAndClear}
          disabled={clearing}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          {clearing ? 'Clearing...' : 'Force Logout & Reload'}
        </button>
      </div>
      
      {showDetails && authData && (
        <div className="mt-4 border-t pt-4">
          <div className="text-xs font-semibold text-gray-700 mb-2">
            Stored Authentication Data:
          </div>
          
          {hasStoredData ? (
            <div className="text-xs text-gray-600 space-y-2 max-h-40 overflow-y-auto">
              {Object.keys(authData.localStorage).length > 0 && (
                <div>
                  <div className="font-medium text-red-600">localStorage:</div>
                  <pre className="text-xs bg-gray-50 p-1 rounded overflow-x-auto">
                    {JSON.stringify(authData.localStorage, null, 2)}
                  </pre>
                </div>
              )}
              
              {Object.keys(authData.sessionStorage).length > 0 && (
                <div>
                  <div className="font-medium text-red-600">sessionStorage:</div>
                  <pre className="text-xs bg-gray-50 p-1 rounded overflow-x-auto">
                    {JSON.stringify(authData.sessionStorage, null, 2)}
                  </pre>
                </div>
              )}
              
              {(authData.authStore.isAuthenticated || authData.authStore.user) && (
                <div>
                  <div className="font-medium text-red-600">authStore:</div>
                  <pre className="text-xs bg-gray-50 p-1 rounded overflow-x-auto">
                    {JSON.stringify(authData.authStore, null, 2)}
                  </pre>
                </div>
              )}
              
              {authData.userStore.hasDeprecatedAuthState && (
                <div>
                  <div className="font-medium text-yellow-600">userStore (deprecated auth data):</div>
                  <div className="text-xs text-yellow-700 mb-1">
                    ⚠️ Found deprecated authentication data in userStore
                  </div>
                  <pre className="text-xs bg-yellow-50 p-1 rounded overflow-x-auto">
                    {JSON.stringify(authData.userStore, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-green-600 font-medium">
              ✅ No authentication data found - Clean state!
            </div>
          )}
          
          <button
            onClick={() => setShowDetails(false)}
            className="mt-2 text-xs text-gray-500 hover:text-gray-700"
          >
            Hide Details
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthClearButton;