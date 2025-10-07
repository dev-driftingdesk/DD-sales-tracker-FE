import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import LeadList from './components/LeadList';
import LeadProfile from './components/LeadProfile';
import LeadCaptureForm from './components/LeadCaptureForm';
import useLeadStore from './stores/leadStore';
import { LEAD_STATUSES, LEAD_SOURCES } from './constants/index';
import useRoutingStore from '../routing/stores/routingStore';

const LeadsModule = () => {
  const [showCaptureForm, setShowCaptureForm] = useState(false);
  const { 
    leads, 
    selectedLead, 
    setSelectedLead, 
    fetchLeads, 
    isLoading, 
    error 
  } = useLeadStore();

  // Load leads on component mount
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSelectLead = (lead) => {
    setSelectedLead(lead);
  };

  const handleBack = () => {
    setSelectedLead(null);
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Error Loading Leads
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchLeads()}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-gray-50">
      {/* Sidebar - Lead List */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        <LeadList onSelectLead={handleSelectLead} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {selectedLead ? (
          <LeadProfile lead={selectedLead} onBack={handleBack} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            {isLoading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading leads...</p>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Welcome to Lead Management
                </h2>
                <p className="text-gray-600 mb-6">
                  Select a lead from the list or create a new one to get started
                </p>
                <button
                  onClick={() => setShowCaptureForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add New Lead
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowCaptureForm(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:shadow-xl"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Lead Capture Form Modal */}
      {showCaptureForm && (
        <LeadCaptureForm onClose={() => setShowCaptureForm(false)} />
      )}
    </div>
  );
};

export default LeadsModule;