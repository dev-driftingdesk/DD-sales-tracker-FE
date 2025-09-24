import React from 'react';
import { Lightbulb, TrendingUp, Target, Users, Clock, ChevronRight } from 'lucide-react';
import useLeadStore from '../../leads/stores/leadStore';
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from '../../leads/constants/index';

const PerformanceTips = ({ userId }) => {
  const { leads } = useLeadStore();
  const userLeads = leads.filter(lead => lead.assignedTo === userId);
  
  // Analyze user's performance patterns
  const wonDeals = userLeads.filter(lead => lead.status === 'won');
  const inProgressDeals = userLeads.filter(lead => lead.status === 'in_progress');
  const similarLeads = userLeads.filter(lead => 
    lead.status === 'new' || lead.status === 'contacted'
  );
  
  // Generate tips based on performance
  const tips = [];
  
  // Tip 1: Similar deals to closed ones
  if (wonDeals.length > 0) {
    const avgDealSize = wonDeals.reduce((sum, deal) => sum + (deal.closedValue || 0), 0) / wonDeals.length;
    const similarSizeLeads = similarLeads.filter(lead => 
      lead.dealValue >= avgDealSize * 0.8 && lead.dealValue <= avgDealSize * 1.2
    ).slice(0, 3);
    
    if (similarSizeLeads.length > 0) {
      tips.push({
        icon: Target,
        color: 'green',
        title: 'Similar Opportunities',
        description: `You've closed deals averaging $${avgDealSize.toLocaleString()}. We found ${similarSizeLeads.length} similar leads.`,
        action: 'View Leads',
        leads: similarSizeLeads
      });
    }
  }
  
  // Tip 2: Follow up on stale leads
  const staleLeads = inProgressDeals.filter(lead => {
    const daysSinceUpdate = Math.floor((new Date() - new Date(lead.updatedAt)) / (1000 * 60 * 60 * 24));
    return daysSinceUpdate > 3;
  });
  
  if (staleLeads.length > 0) {
    tips.push({
      icon: Clock,
      color: 'yellow',
      title: 'Follow-up Required',
      description: `${staleLeads.length} leads haven't been contacted in over 3 days.`,
      action: 'View Stale Leads',
      leads: staleLeads
    });
  }
  
  // Tip 3: High-value opportunities
  const highValueLeads = similarLeads
    .filter(lead => lead.dealValue > 10000)
    .sort((a, b) => b.dealValue - a.dealValue)
    .slice(0, 3);
  
  if (highValueLeads.length > 0) {
    tips.push({
      icon: TrendingUp,
      color: 'purple',
      title: 'High-Value Prospects',
      description: `Focus on ${highValueLeads.length} high-value leads worth $${highValueLeads.reduce((sum, lead) => sum + lead.dealValue, 0).toLocaleString()}.`,
      action: 'Prioritize Now',
      leads: highValueLeads
    });
  }
  
  // Tip 4: Team collaboration
  tips.push({
    icon: Users,
    color: 'blue',
    title: 'Team Best Practices',
    description: 'Anna closed 3 similar deals last month. Consider reaching out for tips.',
    action: 'View Insights',
    teamMember: 'Anna Chen'
  });
  
  const getColorClasses = (color) => {
    const colors = {
      green: 'bg-green-100 text-green-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      purple: 'bg-purple-100 text-purple-600',
      blue: 'bg-blue-100 text-blue-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">Performance Tips</h3>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {tips.map((tip, index) => {
          const Icon = tip.icon;
          const colorClasses = getColorClasses(tip.color);
          
          return (
            <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${colorClasses}`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    {tip.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {tip.description}
                  </p>
                  
                  {tip.leads && tip.leads.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {tip.leads.map(lead => (
                        <div key={lead.id} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">{lead.companyName}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-500">${lead.dealValue.toLocaleString()}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            LEAD_STATUS_COLORS[lead.status]
                          }`}>
                            {LEAD_STATUS_LABELS[lead.status]}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <button className="flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700">
                    {tip.action}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PerformanceTips;