/**
 * Sales Velocity Methods Usage Examples
 * This file demonstrates how to use the new sales velocity tracking methods
 * added to the CRM store.
 */

import useCRMStore from '../modules/crm-core/stores/crmStore';

// Example usage of the sales velocity methods
export const demonstrateSalesVelocityMethods = () => {
  // Get the store instance
  const store = useCRMStore.getState();

  console.log('=== Sales Velocity Methods Demonstration ===\n');

  // 1. Get comprehensive sales velocity metrics
  console.log('1. Main Sales Velocity Metrics:');
  const velocityMetrics = store.getSalesVelocityMetrics({
    timeframe: '30d',
    assignee: 'all'
  });
  console.log(velocityMetrics);
  console.log('\n');

  // 2. Get deal cycle analysis
  console.log('2. Deal Cycle Metrics:');
  const cycleMetrics = store.getDealCycleMetrics({
    timeframe: '90d'
  });
  console.log(cycleMetrics);
  console.log('\n');

  // 3. Get velocity by assignee/sales rep
  console.log('3. Sales Velocity by Assignee:');
  const assigneeVelocity = store.getSalesVelocityByAssignee({
    timeframe: '30d'
  });
  console.log(assigneeVelocity);
  console.log('\n');

  // 4. Get velocity trends over time
  console.log('4. Sales Velocity Trends:');
  const velocityTrends = store.getSalesVelocityTrends({
    granularity: 'monthly',
    periods: 6
  });
  console.log(velocityTrends);
  console.log('\n');

  // 5. Get velocity breakdown by different dimensions
  console.log('5a. Velocity Breakdown by Stage:');
  const stageBreakdown = store.getVelocityBreakdown({
    breakdown: 'stage',
    timeframe: '30d'
  });
  console.log(stageBreakdown);
  console.log('\n');

  console.log('5b. Velocity Breakdown by Deal Value Ranges:');
  const valueBreakdown = store.getVelocityBreakdown({
    breakdown: 'value_range',
    timeframe: '90d'
  });
  console.log(valueBreakdown);
  console.log('\n');

  console.log('5c. Velocity Breakdown by Source:');
  const sourceBreakdown = store.getVelocityBreakdown({
    breakdown: 'source',
    timeframe: '30d'
  });
  console.log(sourceBreakdown);
  console.log('\n');

  return {
    velocityMetrics,
    cycleMetrics,
    assigneeVelocity,
    velocityTrends,
    breakdowns: {
      stage: stageBreakdown,
      valueRange: valueBreakdown,
      source: sourceBreakdown
    }
  };
};

// Example of how to use these methods in a React component
export const SalesVelocityDashboardExample = `
import React, { useMemo } from 'react';
import useCRMStore from '../modules/crm-core/stores/crmStore';

const SalesVelocityDashboard = () => {
  const {
    getSalesVelocityMetrics,
    getDealCycleMetrics,
    getSalesVelocityByAssignee,
    getSalesVelocityTrends,
    getVelocityBreakdown
  } = useCRMStore();

  // Calculate metrics with different timeframes
  const currentMetrics = useMemo(() => 
    getSalesVelocityMetrics({ timeframe: '30d' }), []
  );
  
  const cycleAnalysis = useMemo(() => 
    getDealCycleMetrics({ timeframe: '90d' }), []
  );
  
  const teamPerformance = useMemo(() => 
    getSalesVelocityByAssignee({ timeframe: '30d' }), []
  );
  
  const trends = useMemo(() => 
    getSalesVelocityTrends({ 
      granularity: 'monthly', 
      periods: 12 
    }), []
  );
  
  const stageBreakdown = useMemo(() => 
    getVelocityBreakdown({ 
      breakdown: 'stage', 
      timeframe: '30d' 
    }), []
  );

  return (
    <div className="space-y-6">
      {/* Main Velocity Metrics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Sales Velocity Overview</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {currentMetrics.formattedVelocity}
            </div>
            <div className="text-sm text-gray-600">Daily Velocity</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ${currentMetrics.monthlyVelocity.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Monthly Projection</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {currentMetrics.components.winRate}%
            </div>
            <div className="text-sm text-gray-600">Win Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {currentMetrics.components.averageSalesCycle} days
            </div>
            <div className="text-sm text-gray-600">Avg Sales Cycle</div>
          </div>
        </div>
      </div>

      {/* Team Performance Leaderboard */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Team Performance</h2>
        <div className="space-y-2">
          {teamPerformance.leaderboard.slice(0, 5).map((rep, index) => (
            <div key={rep.assigneeId} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <span className="font-medium">#{index + 1} Rep {rep.assigneeId}</span>
                <span className="text-sm text-gray-600 ml-2">
                  {rep.performance.dealsWon} wins • ${rep.performance.totalRevenue.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <div className="font-semibold">{rep.formattedVelocity}</div>
                <div className="text-sm text-gray-600">{rep.components.winRate}% win rate</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stage Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Velocity by Stage</h2>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(stageBreakdown.data).map(([stageId, data]) => (
            <div key={stageId} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{data.name}</h3>
                <div className={\`w-3 h-3 rounded-full \${data.color}\`}></div>
              </div>
              <div className="text-lg font-semibold">{data.formattedVelocity}</div>
              <div className="text-sm text-gray-600">
                {data.components.numberOfDeals} deals • ${data.components.averageDealValue.toLocaleString()} avg
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesVelocityDashboard;
`;

export default {
  demonstrateSalesVelocityMethods,
  SalesVelocityDashboardExample
};