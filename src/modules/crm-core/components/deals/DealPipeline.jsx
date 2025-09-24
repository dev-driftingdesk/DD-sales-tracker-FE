import React, { useState } from 'react';
import { Search, Filter, Plus, DollarSign, Calendar, User } from 'lucide-react';
import useCRMStore from '../../stores/crmStore';
import DealForm from './DealForm';
import DealDetail from './DealDetail';
import ViewSelector, { VIEW_TYPES } from '../shared/ViewSelector';
import DealListView from './DealListView';
import DealCanvas from './DealCanvas';
import KanbanView from '../shared/KanbanView';

export default function DealPipeline() {
  const { 
    getDealsByStage, 
    getFilteredDeals,
    dealStages, 
    moveDealToStage,
    setSelectedDeal,
    dealFilters,
    setDealFilters,
    viewPreferences,
    setViewPreference
  } = useCRMStore();

  const [showDealForm, setShowDealForm] = useState(false);
  const [showDealDetail, setShowDealDetail] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const dealsByStage = getDealsByStage();
  const deals = getFilteredDeals();
  const currentView = viewPreferences.deals || VIEW_TYPES.KANBAN;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Deals Pipeline</h2>
          <div className="flex items-center gap-2">
            <ViewSelector
              currentView={currentView}
              onViewChange={(view) => setViewPreference('deals', view)}
            />
            <button 
              onClick={() => setShowDealForm(true)}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Deal
            </button>
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search deals..."
              value={dealFilters.search}
              onChange={(e) => setDealFilters({ search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Render view based on selection */}
      <div className="flex-1 overflow-hidden">
        {currentView === VIEW_TYPES.LIST && (
          <div className="bg-white h-full">
            <DealListView
              deals={deals}
              onDealClick={(deal) => {
                setSelectedDeal(deal);
                setShowDealDetail(true);
              }}
              selectedItems={selectedItems}
              onSelectionChange={setSelectedItems}
              enableSelection={false}
            />
          </div>
        )}

        {currentView === VIEW_TYPES.KANBAN && (
          <KanbanView
            items={deals}
            columns={dealStages}
            onItemMove={moveDealToStage}
            onItemClick={(deal) => {
              setSelectedDeal(deal);
              setShowDealDetail(true);
            }}
            renderCard={(deal) => (
              <>
                <h4 className="font-medium text-gray-900 mb-1">{deal.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{deal.company}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-500">
                    <DollarSign className="w-3 h-3" />
                    {formatCurrency(deal.value || 0)}
                  </div>
                  {deal.closeDate && (
                    <div className="flex items-center gap-1 text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(deal.closeDate).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {deal.assignee && (
                  <div className="mt-2 flex items-center gap-1">
                    <User className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{deal.assignee}</span>
                  </div>
                )}

                {deal.probability && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-teal-600 h-1.5 rounded-full"
                        style={{ width: `${deal.probability}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{deal.probability}% probability</p>
                  </div>
                )}
              </>
            )}
            getItemColumn={(deal) => deal.stage}
            columnConfig={{
              prospecting: { valueField: 'value', formatValue: formatCurrency },
              qualification: { valueField: 'value', formatValue: formatCurrency },
              proposal: { valueField: 'value', formatValue: formatCurrency },
              negotiation: { valueField: 'value', formatValue: formatCurrency },
              'closed-won': { valueField: 'value', formatValue: formatCurrency },
              'closed-lost': { valueField: 'value', formatValue: formatCurrency }
            }}
          />
        )}

        {currentView === VIEW_TYPES.CANVAS && (
          <div className="bg-gray-50 h-full p-4">
            <DealCanvas
              deals={deals}
              onDealClick={(deal) => {
                setSelectedDeal(deal);
                setShowDealDetail(true);
              }}
            />
          </div>
        )}
      </div>
      
      {showDealForm && (
        <DealForm onClose={() => setShowDealForm(false)} />
      )}
      
      {showDealDetail && (
        <DealDetail onClose={() => setShowDealDetail(false)} />
      )}
    </div>
  );
}