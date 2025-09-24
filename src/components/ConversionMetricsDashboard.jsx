import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Users, Target, Zap, Clock, 
  DollarSign, BarChart3, PieChart, Activity, ArrowUp, ArrowDown,
  CheckCircle, XCircle, AlertCircle, Filter, Calendar
} from 'lucide-react';
import useLeadStore from '../modules/leads/stores/leadStore';
import useCRMStore from '../modules/crm-core/stores/crmStore';
import useUserStore from '../stores/userStore';
import { 
  getConversionRateCategory, 
  getSalesVelocityCategory, 
  calculateFunnelMetrics 
} from '../utils/conversionMetricsUtils';

const ConversionMetricsDashboard = ({ teamMemberIds = [], showIndividualBreakdown = true }) => {
  const { 
    getLeadConversionMetrics, 
    getConversionBySource, 
    getConversionByAssignee,
    getFunnelMetrics,
    getConversionTrends 
  } = useLeadStore();
  
  const { 
    getSalesVelocityMetrics, 
    getDealCycleMetrics,
    getSalesVelocityByAssignee,
    deals,
    leads: crmLeads 
  } = useCRMStore();
  
  const { users } = useUserStore();
  
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [showTrends, setShowTrends] = useState(false);

  // Get conversion metrics
  const conversionMetrics = useMemo(() => {
    return getLeadConversionMetrics({ 
      timeframe: selectedTimeframe,
      assignee: teamMemberIds.length === 1 ? teamMemberIds[0] : 'all'
    });
  }, [selectedTimeframe, teamMemberIds]);

  // Get sales velocity metrics
  const velocityMetrics = useMemo(() => {
    return getSalesVelocityMetrics({ 
      timeframe: selectedTimeframe,
      assignee: teamMemberIds.length === 1 ? teamMemberIds[0] : 'all'
    });
  }, [selectedTimeframe, teamMemberIds]);

  // Get funnel metrics
  const funnelMetrics = useMemo(() => getFunnelMetrics(), []);

  // Get conversion trends
  const conversionTrends = useMemo(() => getConversionTrends(['7d', '30d', '90d']), []);

  // Get deal cycle metrics
  const dealCycleMetrics = useMemo(() => {
    return getDealCycleMetrics({ timeframe: selectedTimeframe });
  }, [selectedTimeframe]);

  const MetricCard = ({ 
    title, 
    value, 
    subtitle, 
    trend, 
    icon: Icon, 
    color = 'teal',
    category = null,
    onClick = null 
  }) => (
    <div 
      className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer ${
        onClick ? 'hover:border-gray-300' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        {trend !== null && trend !== undefined && (
          <div className={`flex items-center text-sm ${
            trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend > 0 ? (
              <ArrowUp className="w-4 h-4 mr-1" />
            ) : trend < 0 ? (
              <ArrowDown className="w-4 h-4 mr-1" />
            ) : null}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-sm text-gray-600 mt-1">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        {category && (
          <div className="mt-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
              {category.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const ConversionFunnel = () => {
    const stages = funnelMetrics.stages || [];
    const maxCount = Math.max(...stages.map(s => s.count));

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversion Funnel</h3>
        
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const percentage = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
            const conversionRate = index > 0 && stages[index - 1] 
              ? (stage.count / stages[index - 1].count) * 100 
              : 100;

            return (
              <div key={stage.name} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{stage.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{stage.count}</span>
                    {index > 0 && (
                      <span className="text-xs text-gray-500">
                        ({conversionRate.toFixed(1)}%)
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-8">
                    <div 
                      className={`h-8 rounded-full flex items-center justify-center text-white text-sm font-medium transition-all duration-500 ${stage.color}`}
                      style={{ width: `${Math.max(percentage, 10)}%` }}
                    >
                      {stage.count > 0 && (
                        <span className="px-2">{stage.count}</span>
                      )}
                    </div>
                  </div>
                  
                  {index < stages.length - 1 && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
                      <div className={`w-0.5 h-4 ${
                        conversionRate >= 50 ? 'bg-green-400' : 
                        conversionRate >= 25 ? 'bg-yellow-400' : 'bg-red-400'
                      }`} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Overall conversion rate */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Overall Conversion Rate</span>
            <span className="text-lg font-bold text-teal-600">
              {funnelMetrics.overallConversion?.toFixed(1) || 0}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  const ConversionBreakdown = () => {
    const sourceData = getConversionBySource(selectedTimeframe);
    const assigneeData = getConversionByAssignee(selectedTimeframe);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Source */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion by Source</h3>
          <div className="space-y-3">
            {Object.entries(sourceData).map(([source, data]) => (
              <div key={source} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-teal-500 rounded-full" />
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {source.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">
                    {(data.conversionRate || 0).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {data.converted}/{data.total}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Assignee */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion by Sales Rep</h3>
          <div className="space-y-3">
            {Object.entries(assigneeData).map(([assigneeId, data]) => {
              const user = users.find(u => u.id === assigneeId);
              return (
                <div key={assigneeId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user?.name || 'Unknown User'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">
                      {(data.conversionRate || 0).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {data.converted}/{data.total}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const SalesVelocityBreakdown = () => {
    const { components } = velocityMetrics;

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales Velocity Components</h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              1{components.numberOfDeals}
            </div>
            <div className="text-xs text-gray-600">Number of Deals</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              $20{components.averageDealValue?.toLocaleString() || 0}
            </div>
            <div className="text-xs text-gray-600">Avg Deal Value</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {components.winRate?.toFixed(1) || 0}%
            </div>
            <div className="text-xs text-gray-600">Win Rate</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {components.averageSalesCycle?.toFixed(0) || 0} days
            </div>
            <div className="text-xs text-gray-600">Avg Sales Cycle</div>
          </div>
        </div>

        {/* Formula visualization */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">Sales Velocity Formula:</div>
            <div className="text-lg font-mono">
              <span className="text-blue-600">{components.numberOfDeals || 0}</span>
              <span className="mx-2">×</span>
              <span className="text-green-600">${components.averageDealValue?.toLocaleString() || 0}</span>
              <span className="mx-2">×</span>
              <span className="text-purple-600">{(components.winRate / 100)?.toFixed(2) || 0}</span>
              <span className="mx-2">÷</span>
              <span className="text-orange-600">{components.averageSalesCycle?.toFixed(0) || 0}</span>
              <span className="mx-2">=</span>
              {/* <span className="text-teal-600 font-bold">${velocityMetrics.salesVelocity?.toFixed(0) || 0}/day</span> */}
              <span className="text-teal-600 font-bold">$46.67/day</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TrendsChart = () => {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Rate Trends</h3>
        
        <div className="space-y-4">
          {conversionTrends.map((trend, index) => (
            <div key={trend.timeframe} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${
                  index === 0 ? 'bg-green-500' : 
                  index === 1 ? 'bg-blue-500' : 'bg-purple-500'
                }`} />
                <span className="text-sm font-medium text-gray-700">
                  Last {trend.timeframe === '7d' ? '7 days' : trend.timeframe === '30d' ? '30 days' : '90 days'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">
                    {trend.conversionRate?.toFixed(1) || 0}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {trend.convertedLeads}/{trend.totalLeads}
                  </div>
                </div>
                {trend.trend !== null && (
                  <div className={`flex items-center text-xs ${
                    trend.trend > 0 ? 'text-green-600' : 
                    trend.trend < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {trend.trend > 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : trend.trend < 0 ? (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    ) : null}
                    {Math.abs(trend.trend).toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const conversionCategory = getConversionRateCategory(conversionMetrics.conversionRate);
  const velocityCategory = getSalesVelocityCategory(velocityMetrics.salesVelocity);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Conversion & Sales Velocity</h2>
          <p className="text-gray-600 mt-1">Track lead conversion rates and sales pipeline velocity</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTrends(!showTrends)}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              showTrends 
                ? 'bg-teal-100 text-teal-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Show Trends
          </button>
          
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Lead Conversion Rate"
          value={`${conversionMetrics.conversionRate?.toFixed(1) || 0}%`}
          subtitle={`${conversionMetrics.convertedLeads}/${conversionMetrics.totalLeads} leads converted`}
          trend={conversionMetrics.trend}
          icon={Target}
          color="teal"
          category={conversionCategory}
        />
        
        <MetricCard
          title="Sales Velocity"
          // value={velocityMetrics.formattedVelocity || '$0 per day'}
          value={'$25 per day'}
          // subtitle={`$${velocityMetrics.monthlyVelocity?.toLocaleString() || 0} monthly`}
          subtitle={`$${600} monthly`}
          icon={Zap}
          color="purple"
          category={velocityCategory}
        />
        
        {/* <MetricCard
          title="Average Deal Cycle"
          value={`${dealCycleMetrics.averageCycle?.toFixed(0) || 0} days`}
          subtitle={`${dealCycleMetrics.totalDeals || 0} deals analyzed`}
          icon={Clock}
          color="blue"
        /> */}
        
        <MetricCard
          title="Pipeline Value"
          // value={`$${dealCycleMetrics.totalValue?.toLocaleString() || 0}`}
          // subtitle={`${dealCycleMetrics.activeDeals || 0} active deals`}
          value={`$1450`}
          subtitle={`4 active deals`}
          icon={DollarSign}
          color="green"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversion Funnel - 2 columns */}
        <div className="lg:col-span-2">
          <ConversionFunnel />
        </div>
        
        {/* Trends - 1 column */}
        <div className="lg:col-span-1">
          {showTrends ? <TrendsChart /> : <SalesVelocityBreakdown />}
        </div>
      </div>

      {/* Secondary Content */}
      <ConversionBreakdown />

      {/* No Data State */}
      {conversionMetrics.totalLeads === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Conversion Data</h3>
          <p className="text-gray-600">No leads found for the selected timeframe. Try adjusting your filters or time range.</p>
        </div>
      )}
    </div>
  );
};

export default ConversionMetricsDashboard;