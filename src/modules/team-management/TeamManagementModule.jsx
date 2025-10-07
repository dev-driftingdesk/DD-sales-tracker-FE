import React, { useState, useEffect } from 'react';
import { Users, Settings, RefreshCw } from 'lucide-react';
import UserManagement from './components/UserManagement';
import TeamManagement from './components/TeamManagement';
import useTeamManagementStore from './stores/teamManagementStore';

const TeamManagementModule = () => {
  const [activeTab, setActiveTab] = useState('users');
  const { initialize, isLoading, error, clearError } = useTeamManagementStore();

  // Initialize store on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'teams', label: 'Teams', icon: Settings }
  ];

  const handleRetry = () => {
    clearError();
    initialize();
  };

  // Show loading state during initial data load
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-600" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Team Management</h3>
          <p className="text-gray-600">Fetching data from API...</p>
        </div>
      </div>
    );
  }

  // Show error state if initialization failed
  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Data</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <div className="flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-teal-600 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'teams' && <TeamManagement />}
      </div>
    </div>
  );
};

export default TeamManagementModule;