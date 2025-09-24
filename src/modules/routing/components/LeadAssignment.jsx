import React, { useState } from 'react';
import { UserCheck, Award, TrendingUp, MapPin, MessageSquare, CheckCircle, X } from 'lucide-react';
import useRoutingStore from '../stores/routingStore';
import useUserStore from '../../../stores/userStore';
import { LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS } from '../../leads/constants/index';

const LeadAssignment = ({ lead, onClose, onAssign }) => {
  const { manuallyAssignLead } = useRoutingStore();
  const { getUserById } = useUserStore();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [assignmentReason, setAssignmentReason] = useState('');
  
  const recommendations = lead.recommendedAssignments || [];
  const topRecommendation = recommendations[0];
  
  const handleAssign = () => {
    const userId = selectedUserId || topRecommendation?.userId;
    if (userId) {
      manuallyAssignLead(lead.id, userId, assignmentReason || 'Manual assignment');
      if (onAssign) onAssign(lead.id, userId);
      onClose();
    }
  };
  
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Assign Lead</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Choose the best sales representative for this lead
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Lead Information */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{lead.companyName}</h4>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <span>{lead.contactName}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {lead.location}
                  </span>
                  <span>•</span>
                  <span>{LEAD_SOURCE_LABELS[lead.source]}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Deal Value</div>
                <div className="text-lg font-semibold text-gray-900">
                  ${lead.dealValue?.toLocaleString() || 'TBD'}
                </div>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  lead.qualityScore >= 70 ? 'bg-green-100 text-green-700' : 
                  lead.qualityScore >= 40 ? 'bg-yellow-100 text-yellow-700' : 
                  'bg-red-100 text-red-700'
                }`}>
                  Score: {lead.qualityScore}/100
                </div>
              </div>
            </div>
            
            {lead.routingAnalysis && (
              <div className="mt-3 flex flex-wrap gap-2">
                {lead.routingAnalysis.requiresArabicSpeaker && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    Requires Arabic Speaker
                  </span>
                )}
                {lead.routingAnalysis.isHighValue && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    High Value Lead
                  </span>
                )}
                {lead.urgencyLevel === 'high' && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    Urgent Response Needed
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="px-6 py-6 max-h-96 overflow-y-auto">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">
              Recommended Representatives
            </h4>
            
            <div className="space-y-3">
              {recommendations.map((match, index) => {
                const user = getUserById(match.userId);
                const isSelected = selectedUserId === match.userId;
                const isTopMatch = index === 0;
                
                return (
                  <div
                    key={match.userId}
                    onClick={() => setSelectedUserId(match.userId)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-teal-600 bg-teal-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-gray-900">{user.name}</h5>
                            {isTopMatch && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                Best Match
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{user.location} • {user.team}</p>
                          
                          <div className="mt-2 flex flex-wrap gap-2">
                            {match.reasons.map((reason, idx) => (
                              <span key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          getScoreColor(match.totalScore)
                        }`}>
                          {match.totalScore}%
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {user.currentActiveLeads}/{user.maxActiveLeads} leads
                        </p>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className="text-gray-500">Location Match</span>
                            <div className="font-medium text-gray-900">{match.breakdown.location} pts</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Performance</span>
                            <div className="font-medium text-gray-900">{match.breakdown.performance} pts</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Expertise</span>
                            <div className="font-medium text-gray-900">{match.breakdown.expertise} pts</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Assignment Reason */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Note (Optional)
              </label>
              <textarea
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                placeholder="Add any special instructions or context..."
                value={assignmentReason}
                onChange={(e) => setAssignmentReason(e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-between">
            <div className="text-sm text-gray-600">
              {topRecommendation && !selectedUserId && (
                <span className="flex items-center gap-1">
                  <UserCheck className="w-4 h-4" />
                  Will assign to {getUserById(topRecommendation.userId)?.name}
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedUserId && !topRecommendation}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign Lead
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadAssignment;