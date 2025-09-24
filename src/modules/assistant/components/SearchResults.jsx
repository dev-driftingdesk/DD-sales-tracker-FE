import React from 'react';
import { Building2, User, MapPin, Phone, Mail, Calendar, DollarSign, Tag } from 'lucide-react';
import { LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS } from '../../leads/constants/index';

const SearchResults = ({ results, onLeadClick }) => {
  const { leads = [], activities = [], suggestions = [] } = results;
  
  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-700',
      contacted: 'bg-yellow-100 text-yellow-700',
      in_progress: 'bg-orange-100 text-orange-700',
      won: 'bg-green-100 text-green-700',
      lost: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };
  
  return (
    <div className="p-6">
      {/* Search Summary */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Search Results
        </h3>
        <p className="text-sm text-gray-600">
          Found {leads.length} lead{leads.length !== 1 ? 's' : ''} and {activities.length} activit{activities.length !== 1 ? 'ies' : 'y'}
        </p>
      </div>
      
      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Related searches</h4>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onLeadClick({ companyName: suggestion.query })}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
              >
                {suggestion.text}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Lead Results */}
      {leads.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Leads</h4>
          {leads.map((lead) => (
            <div
              key={lead.id}
              onClick={() => onLeadClick(lead)}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    {lead.companyName}
                  </h5>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <User className="w-3 h-3 text-gray-400" />
                    {lead.contactName}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                  {LEAD_STATUS_LABELS[lead.status] || lead.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  {lead.location || 'No location'}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  {formatDate(lead.createdAt)}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="w-3 h-3 text-gray-400" />
                  ${lead.dealValue?.toLocaleString() || '0'}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Tag className="w-3 h-3 text-gray-400" />
                  {LEAD_SOURCE_LABELS[lead.source] || lead.source}
                </div>
              </div>
              
              {lead.productInterest && (
                <p className="mt-3 text-sm text-gray-700">
                  <span className="font-medium">Interest:</span> {lead.productInterest}
                </p>
              )}
              
              {lead.relevanceScore && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-teal-600 h-2 rounded-full"
                      style={{ width: `${Math.min(lead.relevanceScore, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{lead.relevanceScore}% match</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Activity Results */}
      {activities.length > 0 && (
        <div className="mt-6 space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Activities</h4>
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-gray-50 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {activity.leadName} • {activity.user} • {formatDate(activity.timestamp)}
                  </p>
                </div>
                <span className="px-2 py-1 bg-white text-xs text-gray-600 rounded">
                  {activity.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* No Results */}
      {leads.length === 0 && activities.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No results found. Try a different search term.</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;