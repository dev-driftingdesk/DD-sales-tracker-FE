import React from 'react';
import { 
  FileText, Clock, Target, TrendingUp, AlertCircle, 
  CheckCircle, Calendar, User, Globe, Tag 
} from 'lucide-react';

const LeadSummary = ({ summary }) => {
  if (!summary) return null;
  
  const { overview, keyInfo, timeline, nextSteps, insights } = summary;
  
  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'text-red-600 bg-red-50',
      high: 'text-orange-600 bg-orange-50',
      medium: 'text-yellow-600 bg-yellow-50',
      low: 'text-green-600 bg-green-50'
    };
    return colors[priority] || 'text-gray-600 bg-gray-50';
  };
  
  const getInsightColor = (type) => {
    const colors = {
      opportunity: 'text-purple-600 bg-purple-50',
      positive: 'text-green-600 bg-green-50',
      warning: 'text-orange-600 bg-orange-50',
      tip: 'text-blue-600 bg-blue-50',
      info: 'text-gray-600 bg-gray-50'
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
  };
  
  const formatDate = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };
  
  return (
    <div className="p-6 space-y-6">
      {/* Overview */}
      <div className="bg-teal-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-teal-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Overview</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{overview}</p>
          </div>
        </div>
      </div>
      
      {/* Key Information */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-gray-400" />
          Key Information
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {keyInfo.map((info, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-lg">{info.icon}</span>
              <div>
                <p className="text-xs text-gray-500">{info.label}</p>
                <p className="text-sm font-medium text-gray-900">{info.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Next Steps */}
      {nextSteps.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-gray-400" />
            Recommended Next Steps
          </h4>
          <div className="space-y-2">
            {nextSteps.map((step, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg flex items-start gap-3 ${getPriorityColor(step.priority)}`}
              >
                <span className="text-lg">{step.icon}</span>
                <div className="flex-1">
                  <p className="font-medium">{step.action}</p>
                  <p className="text-sm opacity-90">{step.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Insights */}
      {insights.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            AI Insights
          </h4>
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg flex items-center gap-3 ${getInsightColor(insight.type)}`}
              >
                <span className="text-lg">{insight.icon}</span>
                <p className="text-sm">{insight.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Timeline */}
      {timeline.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            Activity Timeline
          </h4>
          <div className="space-y-3">
            {timeline.slice(0, 5).map((event, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">{event.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{event.description}</p>
                  <p className="text-xs text-gray-500">
                    {event.user && `${event.user} • `}
                    {formatDate(event.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadSummary;