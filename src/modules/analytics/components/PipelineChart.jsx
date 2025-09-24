import React from 'react';
import { BarChart3, TrendingUp, Users } from 'lucide-react';

const PipelineChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Pipeline Analysis</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">No pipeline data available</p>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(stage => stage.count));
  const totalLeads = data.reduce((sum, stage) => sum + stage.count, 0);

  const getStageColor = (stage) => {
    const colors = {
      new: '#3B82F6',
      contacted: '#8B5CF6',
      in_progress: '#F59E0B',
      proposal_sent: '#10B981',
      negotiation: '#06B6D4',
      won: '#10B981',
      lost: '#EF4444'
    };
    return colors[stage] || '#6B7280';
  };

  const getStageLabel = (stage) => {
    const labels = {
      new: 'New Leads',
      contacted: 'Contacted',
      in_progress: 'In Progress',
      proposal_sent: 'Proposal Sent',
      negotiation: 'Negotiation',
      won: 'Won',
      lost: 'Lost'
    };
    return labels[stage] || stage.replace('_', ' ');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pipeline Analysis</h3>
            <p className="text-sm text-gray-500">{totalLeads} total leads in pipeline</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
          <Users className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">{totalLeads} leads</span>
        </div>
      </div>

      {/* Pipeline Bars */}
      <div className="space-y-4">
        {data.map((stage, index) => {
          const widthPercentage = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
          const color = getStageColor(stage.stage);
          
          return (
            <div key={stage.stage} className="relative">
              {/* Stage Info */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium text-gray-900 capitalize">
                    {getStageLabel(stage.stage)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600">{stage.count} leads</span>
                  <span className="font-medium text-gray-900">
                    {stage.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative h-10 bg-gray-50 rounded-xl overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-xl transition-all duration-700 ease-out relative overflow-hidden"
                  style={{
                    width: `${widthPercentage}%`,
                    background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`
                  }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />
                </div>
                
                {/* Count Label Inside Bar */}
                {stage.count > 0 && (
                  <div className="absolute inset-0 flex items-center px-4">
                    <span className="text-white font-semibold text-sm drop-shadow-md">
                      {stage.count}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline Health Indicator */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {data.filter(s => ['new', 'contacted', 'in_progress'].includes(s.stage))
                   .reduce((sum, s) => sum + s.count, 0)}
            </div>
            <div className="text-sm text-gray-600">Active Pipeline</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {data.find(s => s.stage === 'won')?.count || 0}
            </div>
            <div className="text-sm text-gray-600">Closed Won</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {data.find(s => s.stage === 'lost')?.count || 0}
            </div>
            <div className="text-sm text-gray-600">Closed Lost</div>
          </div>
        </div>
      </div>

      {/* Conversion Funnel Visualization */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Conversion Funnel</h4>
        <div className="flex items-end justify-between h-24 gap-1">
          {data.filter(s => s.stage !== 'lost').map((stage, index) => {
            const height = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
            const color = getStageColor(stage.stage);
            
            return (
              <div key={stage.stage} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full rounded-t transition-all duration-500"
                  style={{
                    height: `${height}%`,
                    backgroundColor: color,
                    opacity: 0.7
                  }}
                />
                <div className="text-xs text-gray-600 mt-1 text-center">
                  {stage.count}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PipelineChart;