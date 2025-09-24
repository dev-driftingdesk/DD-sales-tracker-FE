import React from 'react';
import { Lightbulb, TrendingUp, Clock, DollarSign, MessageSquare, Target } from 'lucide-react';

const StrategyCard = ({ strategies = [] }) => {
  const getIcon = (type) => {
    const icons = {
      pricing: DollarSign,
      approach: Target,
      timeline: Clock,
      payment: DollarSign,
      response: Clock,
      communication: MessageSquare,
      language: MessageSquare,
      timing: Clock,
      product: Target,
      general: Lightbulb
    };
    return icons[type] || Lightbulb;
  };
  
  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-blue-100 text-blue-700 border-blue-200'
    };
    return colors[priority] || colors.medium;
  };

  if (!strategies || strategies.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <Lightbulb className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">No specific strategies available yet.</p>
        <p className="text-xs text-gray-500 mt-1">Strategies will appear after assignment.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-teal-600" />
          <h3 className="font-semibold text-gray-900">Recommended Strategies</h3>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100">
        {strategies.map((strategy, index) => {
          const Icon = getIcon(strategy.type);
          
          return (
            <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getPriorityColor(strategy.priority)}`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {strategy.title}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      strategy.priority === 'high' 
                        ? 'bg-red-100 text-red-700' 
                        : strategy.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {strategy.priority}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    {strategy.description}
                  </p>
                  
                  {strategy.reference && (
                    <p className="text-xs text-gray-500 mt-1 italic">
                      {strategy.reference}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StrategyCard;