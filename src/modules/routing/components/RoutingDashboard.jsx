import React, { useState, useEffect } from 'react';
import { 
  Users, Settings, ToggleLeft, ToggleRight, AlertTriangle, 
  TrendingUp, Clock, DollarSign, Target, ChevronRight, RefreshCw
} from 'lucide-react';
import useRoutingStore from '../stores/routingStore';
import useUserStore from '../../../stores/userStore';
import useLeadStore from '../../leads/stores/leadStore';
import LeadAssignment from './LeadAssignment';
import { LEAD_SOURCE_LABELS } from '../../leads/constants/index';

const RoutingDashboard = () => {
  const { 
    getUnassignedLeads, 
    autoRoutingEnabled, 
    toggleAutoRouting,
    routingRules,
    updateRoutingRules,
    assignmentHistory
  } = useRoutingStore();
  
  const { isAdmin, isManager } = useUserStore();
  const { updateLead, leads } = useLeadStore();
  
  const [selectedLead, setSelectedLead] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const unassignedLeads = getUnassignedLeads();
  const canManageSettings = isAdmin() || isManager();
  
  // Check for unassigned leads on mount and refresh
  useEffect(() => {
    const unassignedFromStore = leads.filter(lead => !lead.assignedTo);
    unassignedFromStore.forEach(lead => {
      const isInQueue = unassignedLeads.some(q => q.id === lead.id);
      if (!isInQueue) {
        useRoutingStore.getState().processLeadForRouting(lead);
      }
    });
  }, [leads, refreshKey]);
  
  const handleAssignment = (leadId, userId) => {
    updateLead(leadId, { assignedTo: userId });
    setSelectedLead(null);
  };
  
  const getUrgencyIcon = (urgencyLevel) => {
    switch (urgencyLevel) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'high':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'medium':
        return <TrendingUp className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lead Routing Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage lead assignments and routing rules
            </p>
          </div>
          
          {canManageSettings && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Auto-routing</span>
                <button
                  onClick={toggleAutoRouting}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
                  style={{ backgroundColor: autoRoutingEnabled ? '#0D9488' : '#D1D5DB' }}
                >
                  <span
                    className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    style={{ transform: autoRoutingEnabled ? 'translateX(1.25rem)' : 'translateX(0.25rem)' }}
                  />
                </button>
              </div>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          )}
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="text-2xl font-bold text-gray-900">{unassignedLeads.length}</span>
            </div>
            <p className="text-sm text-gray-600">Unassigned Leads</p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-gray-400" />
              <span className="text-2xl font-bold text-gray-900">
                {assignmentHistory.filter(a => {
                  const date = new Date(a.timestamp);
                  const today = new Date();
                  return date.toDateString() === today.toDateString();
                }).length}
              </span>
            </div>
            <p className="text-sm text-gray-600">Assigned Today</p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <span className="text-2xl font-bold text-gray-900">
                ${unassignedLeads.reduce((sum, lead) => sum + (lead.dealValue || 0), 0).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-600">Pipeline Value</p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-gray-400" />
              <span className="text-2xl font-bold text-gray-900">
                {unassignedLeads.filter(l => l.urgencyLevel === 'high' || l.urgencyLevel === 'critical').length}
              </span>
            </div>
            <p className="text-sm text-gray-600">Urgent Leads</p>
          </div>
        </div>
      </div>
      
      {/* Settings Panel */}
      {showSettings && canManageSettings && (
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Routing Rules</h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Match Score
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={routingRules.minMatchScore}
                onChange={(e) => updateRoutingRules({ minMatchScore: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum score required for assignment recommendation
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-assign Threshold
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={routingRules.autoAssignThreshold}
                onChange={(e) => updateRoutingRules({ autoAssignThreshold: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Score threshold for automatic assignment
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Leads per Rep
              </label>
              <input
                type="number"
                min="1"
                value={routingRules.maxLeadsPerRep}
                onChange={(e) => updateRoutingRules({ maxLeadsPerRep: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum active leads per sales rep
              </p>
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={routingRules.prioritizeByValue}
                  onChange={(e) => updateRoutingRules({ prioritizeByValue: e.target.checked })}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-600"
                />
                <span className="text-sm text-gray-700">Prioritize by deal value</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={routingRules.prioritizeByUrgency}
                  onChange={(e) => updateRoutingRules({ prioritizeByUrgency: e.target.checked })}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-600"
                />
                <span className="text-sm text-gray-700">Prioritize by urgency</span>
              </label>
            </div>
          </div>
        </div>
      )}
      
      {/* Unassigned Leads */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Unassigned Leads</h3>
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
        
        {unassignedLeads.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">All leads have been assigned!</p>
            <p className="text-sm text-gray-500 mt-1">
              New leads will appear here for routing.
            </p>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left max-w-md mx-auto">
              <p className="text-sm font-medium text-blue-900 mb-2">To see routing in action:</p>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. Go to the Leads module</li>
                <li>2. Click "Add New Lead" button</li>
                <li>3. Fill the form (don't assign to anyone)</li>
                <li>4. Return here to see AI routing recommendations</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {unassignedLeads.map((lead) => (
              <div
                key={lead.id}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedLead(lead)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{lead.companyName}</h4>
                      {getUrgencyIcon(lead.urgencyLevel)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        lead.qualityScore >= 70 
                          ? 'bg-green-100 text-green-700' 
                          : lead.qualityScore >= 40 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        Score: {lead.qualityScore}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{lead.contactName}</span>
                      <span>•</span>
                      <span>{lead.location}</span>
                      <span>•</span>
                      <span>{LEAD_SOURCE_LABELS[lead.source]}</span>
                      <span>•</span>
                      <span>${lead.dealValue?.toLocaleString() || 'TBD'}</span>
                    </div>
                    
                    {lead.recommendedAssignments?.[0] && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <Target className="w-3 h-3" />
                        <span>
                          Recommended: {lead.recommendedAssignments[0].userName} 
                          ({lead.recommendedAssignments[0].totalScore}% match)
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Lead Assignment Modal */}
      {selectedLead && (
        <LeadAssignment
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onAssign={handleAssignment}
        />
      )}
    </div>
  );
};

export default RoutingDashboard;