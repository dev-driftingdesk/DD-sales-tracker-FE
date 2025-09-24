import React, { useMemo } from 'react';
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import CanvasView from '../shared/CanvasView';
import useCRMStore from '../../stores/crmStore';

export default function DealCanvas({ deals, onDealClick }) {
  const { dealStages, companies } = useCRMStore();

  // Create nodes and edges for deal flow visualization
  const { nodes, edges } = useMemo(() => {
    const nodes = [];
    const edges = [];
    const stageNodes = {};
    const companyNodes = {};

    // Create stage nodes
    dealStages.forEach((stage, index) => {
      const stageDeals = deals.filter(d => d.stage === stage.id);
      const totalValue = stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
      
      const node = {
        id: `stage-${stage.id}`,
        label: stage.name,
        type: 'stage',
        data: { ...stage, dealCount: stageDeals.length, totalValue },
        color: stage.color.replace('bg-', '#').replace('-500', ''),
        size: 50,
        x: 200 + (index * 150),
        y: 100
      };
      nodes.push(node);
      stageNodes[stage.id] = node;
    });

    // Create deal nodes grouped by stage
    const dealsByStage = {};
    deals.forEach(deal => {
      if (!dealsByStage[deal.stage]) {
        dealsByStage[deal.stage] = [];
      }
      dealsByStage[deal.stage].push(deal);
    });

    // Position deals under their stages
    Object.entries(dealsByStage).forEach(([stageId, stageDeals]) => {
      const stageNode = stageNodes[stageId];
      if (!stageNode) return;

      stageDeals.forEach((deal, index) => {
        const node = {
          id: `deal-${deal.id}`,
          label: deal.name,
          type: 'deal',
          data: deal,
          color: '#0D9488',
          size: Math.max(20, Math.min(40, (deal.value / 10000))), // Size based on value
          x: stageNode.x + (index % 3 - 1) * 60,
          y: stageNode.y + 100 + Math.floor(index / 3) * 60
        };
        nodes.push(node);

        // Connect deal to stage
        edges.push({
          source: node.id,
          target: stageNode.id,
          type: 'solid'
        });
      });
    });

    // Add edges between stages to show flow
    for (let i = 0; i < dealStages.length - 1; i++) {
      if (dealStages[i].id !== 'closed-lost' && dealStages[i + 1].id !== 'closed-lost') {
        edges.push({
          source: `stage-${dealStages[i].id}`,
          target: `stage-${dealStages[i + 1].id}`,
          type: 'dashed'
        });
      }
    }

    return { nodes, edges };
  }, [deals, dealStages, companies]);

  const handleNodeClick = (node) => {
    if (node.type === 'deal') {
      onDealClick(node.data);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  const renderNode = (node) => {
    if (node.type === 'stage') {
      return (
        <div 
          className={`
            p-3 bg-white rounded-lg shadow-md border-2
            ${node.data.color} bg-opacity-10
          `}
          style={{ minWidth: '140px' }}
        >
          <h4 className="text-sm font-bold text-gray-900">{node.label}</h4>
          <p className="text-xs text-gray-600 mt-1">
            {node.data.dealCount} deals
          </p>
          <p className="text-sm font-medium text-gray-900 mt-1">
            {formatCurrency(node.data.totalValue)}
          </p>
        </div>
      );
    }

    // Deal node
    const isHighValue = node.data.value > 50000;
    const isAtRisk = node.data.probability < 30 && node.data.stage !== 'closed-lost';
    
    return (
      <div 
        className={`
          p-2 bg-white rounded-lg shadow-md border-2 cursor-pointer
          hover:shadow-lg transition-shadow
          ${isAtRisk ? 'border-red-500' : isHighValue ? 'border-yellow-500' : 'border-teal-500'}
        `}
        style={{ minWidth: '120px' }}
      >
        <div className="flex items-start gap-2">
          {isAtRisk && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
          {isHighValue && <TrendingUp className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">
              {node.label}
            </p>
            <p className="text-xs text-gray-500 truncate">{node.data.company}</p>
            <div className="flex items-center gap-1 mt-1">
              <DollarSign className="w-3 h-3 text-gray-400" />
              <span className="text-xs font-medium text-gray-700">
                {formatCurrency(node.data.value)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700">Deal Flow Visualization</h3>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border-2 border-yellow-500 rounded"></div>
            High Value (&gt;$50k)
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border-2 border-red-500 rounded"></div>
            At Risk (&lt;30%)
          </div>
          <div className="flex items-center gap-1">
            <div className="w-16 h-0.5 bg-gray-300 border-dashed border-t-2"></div>
            Stage Flow
          </div>
        </div>
      </div>
      
      <CanvasView
        nodes={nodes}
        edges={edges}
        onNodeClick={handleNodeClick}
        renderNode={renderNode}
        height="500px"
      />
    </div>
  );
}