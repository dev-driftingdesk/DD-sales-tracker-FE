import React, { useEffect } from 'react';
import { Search, Filter, ChevronRight, Phone, Mail, Calendar, MapPin, Package, DollarSign } from 'lucide-react';
import useLeadStore from '../stores/leadStore';
import useCRMStore from '../../crm-core/stores/crmStore';
import useUserStore from '../../../stores/userStore.jsx';
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, LEAD_SOURCE_LABELS } from '../constants/index';
import { calculatePrimaryCommission, formatCommission } from '../../../utils/commissionUtils';

const LeadList = ({ onSelectLead }) => {
  const { 
    leads, 
    filters, 
    setFilters, 
    getFilteredLeads, 
    isLoading, 
    error,
    fetchLeads,
    fetchLead 
  } = useLeadStore();
  const { products } = useCRMStore();
  const { users } = useUserStore();
  const filteredLeads = getFilteredLeads();

  // Fetch leads on component mount
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Handle lead selection with API call
  const handleSelectLead = async (lead) => {
    try {
      // Fetch complete lead data from backend
      const detailedLead = await fetchLead(lead.id);
      // Call the parent's onSelectLead with detailed data
      onSelectLead(detailedLead);
    } catch (error) {
      console.error('Failed to fetch lead details:', error);
      // Fallback to basic lead data if API call fails
      onSelectLead(lead);
    }
  };

  const getAssociatedProduct = (productId) => {
    return products.find(product => product.id === productId);
  };

  const getAdditionalProduct = (additionalProductId) => {
    return products.find(product => product.id === additionalProductId);
  };


  const getStatusBadgeClass = (status) => {
    return `${LEAD_STATUS_COLORS[status]} px-3 py-1 rounded-full text-xs font-medium`;
  };

  const getSourceIcon = (source) => {
    const iconClass = "w-4 h-4 text-gray-500";
    switch (source) {
      case 'facebook':
      case 'instagram':
        return <div className={iconClass}>f</div>;
      case 'whatsapp':
        return <Phone className={iconClass} />;
      case 'email':
        return <Mail className={iconClass} />;
      case 'event':
        return <Calendar className={iconClass} />;
      default:
        return <MapPin className={iconClass} />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Leads</h2>
          {error && (
            <button
              onClick={() => fetchLeads()}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Retry
            </button>
          )}
        </div>
        
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search leads..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all duration-200"
              value={filters.searchTerm}
              onChange={(e) => setFilters({ searchTerm: e.target.value })}
            />
          </div>
          
          <div className="flex gap-2">
            <select
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
              value={filters.status}
              onChange={(e) => setFilters({ status: e.target.value })}
            >
              <option value="all">All Status</option>
              {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            
            <select
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
              value={filters.source}
              onChange={(e) => setFilters({ source: e.target.value })}
            >
              <option value="all">All Sources</option>
              {Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lead List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto mb-2"></div>
            <p className="text-gray-500 text-sm">Loading leads...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-500 text-sm mb-2">Failed to load leads</p>
            <p className="text-gray-500 text-xs">{error}</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 text-sm">No leads found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                onClick={() => handleSelectLead(lead)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-gray-900">{lead.companyName}</h3>
                    <span className={getStatusBadgeClass(lead.status)}>
                      {LEAD_STATUS_LABELS[lead.status]}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      {getSourceIcon(lead.source)}
                      <span>{LEAD_SOURCE_LABELS[lead.source]}</span>
                    </div>
                    <span>{lead.contactName}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatDate(lead.createdAt)}
                  </span>
                </div>
                
                {lead.productId && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-teal-600">
                    <Package className="w-3 h-3" />
                    <span>{getAssociatedProduct(lead.productId)?.name || 'Product not found'}</span>
                  </div>
                )}
                
                {lead.additionalProductId && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-orange-600">
                    <Package className="w-3 h-3" />
                    <span>Additional: {getAdditionalProduct(lead.additionalProductId)?.name || 'Product not found'}</span>
                  </div>
                )}
                
                {/* Commission Information */}
                {lead.dealValue && lead.assignedTo && (() => {
                  const commissionInfo = calculatePrimaryCommission(lead, users);
                  return commissionInfo && (
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <DollarSign className="w-3 h-3" />
                        <span>Deal: {formatCommission(lead.dealValue)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-700 font-medium">
                        <span>Commission: {formatCommission(commissionInfo.commissionAmount)}</span>
                        <span className="text-green-600">({commissionInfo.commissionPercentage}%)</span>
                      </div>
                    </div>
                  );
                })()}
                
                {lead.lastActivity && (
                  <p className="mt-2 text-xs text-gray-500 truncate">
                    Last activity: {lead.lastActivity}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-600">
          Showing {filteredLeads.length} leads
          {isLoading && ' (loading...)'}
        </p>
      </div>
    </div>
  );
};

export default LeadList;