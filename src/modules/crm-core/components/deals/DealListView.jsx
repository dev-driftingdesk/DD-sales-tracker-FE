import React from 'react';
import { DollarSign, Calendar, User, TrendingUp } from 'lucide-react';
import ListView from '../shared/ListView';
import useCRMStore from '../../stores/crmStore';

export default function DealListView({ 
  deals, 
  onDealClick, 
  selectedItems, 
  onSelectionChange,
  enableSelection 
}) {
  const { dealStages } = useCRMStore();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStageInfo = (stageId) => {
    return dealStages.find(s => s.id === stageId) || { name: stageId, color: 'bg-gray-500' };
  };

  const columns = [
    {
      key: 'name',
      label: 'Deal Name',
      render: (deal) => (
        <div>
          <p className="font-medium text-gray-900">{deal.name}</p>
          <p className="text-sm text-gray-600">{deal.company}</p>
        </div>
      )
    },
    {
      key: 'value',
      label: 'Value',
      render: (deal) => (
        <div className="flex items-center gap-1 font-medium text-gray-900">
          <DollarSign className="w-4 h-4 text-gray-400" />
          {formatCurrency(deal.value || 0)}
        </div>
      )
    },
    {
      key: 'stage',
      label: 'Stage',
      render: (deal) => {
        const stage = getStageInfo(deal.stage);
        return (
          <span className={`inline-flex px-3 py-1 text-xs rounded-full ${stage.color} bg-opacity-10`}>
            {stage.name}
          </span>
        );
      }
    },
    {
      key: 'probability',
      label: 'Probability',
      render: (deal) => (
        <div className="flex items-center gap-2">
          <div className="w-20 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-teal-600 h-2 rounded-full"
              style={{ width: `${deal.probability}%` }}
            />
          </div>
          <span className="text-sm text-gray-600">{deal.probability}%</span>
        </div>
      )
    },
    {
      key: 'closeDate',
      label: 'Expected Close',
      render: (deal) => deal.closeDate && (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Calendar className="w-3 h-3" />
          {new Date(deal.closeDate).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'assignee',
      label: 'Owner',
      render: (deal) => deal.assignee && (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <User className="w-3 h-3" />
          {deal.assignee}
        </div>
      )
    }
  ];

  // Card-based rendering for mobile/compact view
  const renderDealCard = (deal) => {
    const stage = getStageInfo(deal.stage);
    
    return (
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-medium text-gray-900">{deal.name}</h3>
            <p className="text-sm text-gray-600">{deal.company}</p>
          </div>
          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${stage.color} bg-opacity-10`}>
            {stage.name}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 font-medium text-gray-900">
              <DollarSign className="w-4 h-4 text-gray-400" />
              {formatCurrency(deal.value || 0)}
            </div>
            <div className="text-sm text-gray-600">
              {deal.probability}% probability
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            {deal.closeDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(deal.closeDate).toLocaleDateString()}
              </div>
            )}
            {deal.assignee && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {deal.assignee}
              </div>
            )}
          </div>

          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-teal-600 h-1.5 rounded-full"
              style={{ width: `${deal.probability}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <ListView
      items={deals}
      columns={columns}
      onItemClick={onDealClick}
      selectedItems={selectedItems}
      onSelectionChange={onSelectionChange}
      enableSelection={enableSelection}
      renderItem={window.innerWidth < 768 ? renderDealCard : null}
    />
  );
}