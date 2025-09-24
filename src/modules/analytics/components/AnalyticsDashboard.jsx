import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Filter, Download, Calendar,
  DollarSign, Users, Target, Clock, Award, RefreshCw, Zap
} from 'lucide-react';
import useAnalyticsStore from '../stores/analyticsStore';
import { DATE_RANGES, DATE_RANGE_LABELS, METRICS } from '../constants';
import DateRangeSelector from './DateRangeSelector';
import FilterPanel from './FilterPanel';
import MetricCard from './MetricCard';
import PipelineChart from './PipelineChart';
import ConversionChart from './ConversionChart';
import RevenueChart from './RevenueChart';
import PerformanceTable from './PerformanceTable';
import FunnelChart from './FunnelChart';
import ConversionMetricsDashboard from '../../../components/ConversionMetricsDashboard';
import PipelineMetricsDashboard from '../../../components/PipelineMetricsDashboard';
import AdvancedLeadMetricsDashboard from '../../../components/AdvancedLeadMetricsDashboard';
import DealActivityMetricsDashboard from '../../../components/DealActivityMetricsDashboard';
import RevenueEngagementMetricsDashboard from '../../../components/RevenueEngagementMetricsDashboard';
import useLeadStore from '../../leads/stores/leadStore';
import useCRMStore from '../../crm-core/stores/crmStore';

const AnalyticsDashboard = () => {
  const {
    selectedDateRange,
    pipelineData,
    conversionData,
    performanceData,
    revenueData,
    isLoading,
    error,
    refreshAnalytics,
    exportData,
    calculateDealStageAnalysis,
    selectedTeams,
    selectedUsers,
    selectedSources,
    selectedRegions
  } = useAnalyticsStore();
  
  const { getLeadConversionMetrics, getLeadAgingMetrics, getContactAttemptsMetrics, getActivityPerRepMetrics, getLeadReengagementMetrics, getStaleLeadsMetrics, getLeadEngagementSummary } = useLeadStore();
  const { getSalesVelocityMetrics, getPipelineValueMetrics, getWinRateMetrics, getDealClosureTimeMetrics, getMonthlyRevenuePerRepMetrics } = useCRMStore();
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedView, setSelectedView] = useState('overview');
  const [funnelData, setFunnelData] = useState([]);
  const [conversionMetrics, setConversionMetrics] = useState(null);
  const [velocityMetrics, setVelocityMetrics] = useState(null);
  const [pipelineMetrics, setPipelineMetrics] = useState(null);
  const [winRateMetrics, setWinRateMetrics] = useState(null);
  const [agingMetrics, setAgingMetrics] = useState(null);
  const [contactMetrics, setContactMetrics] = useState(null);
  const [dealClosureMetrics, setDealClosureMetrics] = useState(null);
  const [activityRepMetrics, setActivityRepMetrics] = useState(null);
  const [revenueMetrics, setRevenueMetrics] = useState(null);
  const [reengagementMetrics, setReengagementMetrics] = useState(null);
  const [staleLeadsMetrics, setStaleLeadsMetrics] = useState(null);
  const [engagementSummary, setEngagementSummary] = useState(null);
  
  const activeFiltersCount = [
    selectedTeams?.length || 0,
    selectedUsers?.length || 0,
    selectedSources?.length || 0,
    selectedRegions?.length || 0
  ].reduce((sum, count) => sum + (count > 0 ? 1 : 0), 0);
  
  useEffect(() => {
    refreshAnalytics();
    
    // Load conversion and velocity metrics
    const conversionData = getLeadConversionMetrics({ timeframe: '30d' });
    setConversionMetrics(conversionData);
    
    const velocityData = getSalesVelocityMetrics({ timeframe: '30d' });
    setVelocityMetrics(velocityData);

    // Load pipeline and win rate metrics
    const pipelineData = getPipelineValueMetrics({ timeframe: '30d' });
    setPipelineMetrics(pipelineData);
    
    const winRateData = getWinRateMetrics({ timeframe: '30d' });
    setWinRateMetrics(winRateData);

    // Load advanced lead metrics
    const agingData = getLeadAgingMetrics({ timeframe: '30d' });
    setAgingMetrics(agingData);
    
    const contactData = getContactAttemptsMetrics({ timeframe: '30d' });
    setContactMetrics(contactData);

    // Load deal closure and activity metrics
    const dealClosureData = getDealClosureTimeMetrics({ timeframe: '30d' });
    setDealClosureMetrics(dealClosureData);
    
    const activityData = getActivityPerRepMetrics({ timeframe: '30d' });
    setActivityRepMetrics(activityData);

    // Load revenue and engagement metrics
    const revenueData = getMonthlyRevenuePerRepMetrics({ timeframe: '30d' });
    setRevenueMetrics(revenueData);
    
    const reengagementData = getLeadReengagementMetrics({ timeframe: '30d' });
    setReengagementMetrics(reengagementData);
    
    const staleData = getStaleLeadsMetrics({ timeframe: '30d' });
    setStaleLeadsMetrics(staleData);
    
    const engagementData = getLeadEngagementSummary({ timeframe: '30d' });
    setEngagementSummary(engagementData);
  }, []);
  
  useEffect(() => {
    if (pipelineData) {
      const stageData = calculateDealStageAnalysis();
      setFunnelData(stageData);
    }
  }, [pipelineData]);
  
  const views = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'pipeline', label: 'Pipeline', icon: TrendingUp },
    // { id: 'sources', label: 'Sources', icon: Target },
    // { id: 'performance', label: 'Performance', icon: Award },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'conversion-velocity', label: 'Conversion & Velocity', icon: Zap },
    { id: 'pipeline-metrics', label: 'Pipeline & Win Rate', icon: Target },
    { id: 'advanced-metrics', label: 'Advanced Lead Metrics', icon: Clock },
    { id: 'deal-activity', label: 'Deal & Activity Metrics', icon: BarChart3 },
    { id: 'revenue-engagement', label: 'Revenue & Engagement', icon: TrendingUp }
  ];
  
  const handleExport = (type) => {
    exportData(type, 'csv');
  };
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const formatPercentage = (value) => {
    return `${Math.round(value * 100) / 100}%`;
  };
  
  if (error) {
    return (
      <div className="bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading analytics: {error}</p>
          <button
            onClick={refreshAnalytics}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Sales Analytics
            </h1>
            <p className="text-gray-600 mt-1">Real-time insights into your sales performance</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={refreshAnalytics}
              disabled={isLoading}
              className="p-2.5 bg-white hover:bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 text-gray-700 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                showFilters 
                  ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg transform scale-105' 
                  : 'bg-white shadow-sm hover:shadow-md text-gray-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                  showFilters ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-700'
                }`}>
                  {activeFiltersCount}
                </span>
              )}
            </button>
            
            <DateRangeSelector />
          </div>
        </div>
        
        {/* View Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-1 inline-flex">
          {views.map(view => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setSelectedView(view.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  selectedView === view.id
                    ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{view.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6">
          <FilterPanel onClose={() => setShowFilters(false)} />
        </div>
      )}
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full blur-xl opacity-30 animate-pulse" />
            <div className="relative bg-white rounded-2xl shadow-xl p-8">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center animate-bounce">
                  <RefreshCw className="w-8 h-8 text-white animate-spin" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">Loading Analytics</h3>
                  <p className="text-sm text-gray-600 mt-1">Crunching the numbers...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Content */}
      {!isLoading && pipelineData && (
        <div className="space-y-6">
          {/* Overview */}
          {selectedView === 'overview' && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-6">
                <MetricCard
                  title="Total Revenue"
                  value={formatCurrency(pipelineData.totalRevenue)}
                  icon={DollarSign}
                  color="green"
                  trend={15} // Mock trend
                  subtitle="All time"
                />
                <MetricCard
                  title="Total Leads"
                  value={pipelineData.totalLeads}
                  icon={Users}
                  color="blue"
                  trend={8}
                  subtitle={`${pipelineData.activeLeads} active`}
                />
                <MetricCard
                  title="Conversion Rate"
                  value={formatPercentage(pipelineData.conversionRate)}
                  icon={Target}
                  color="purple"
                  trend={-2}
                  subtitle="Lead to customer"
                />
                <MetricCard
                  title="Avg Deal Size"
                  value={formatCurrency(pipelineData.averageDealSize)}
                  icon={DollarSign}
                  color="orange"
                  trend={12}
                  subtitle="Per closed deal"
                />
                <MetricCard
                  title="Sales Cycle"
                  value={`${Math.round(pipelineData.salesCycleDays)} days`}
                  icon={Clock}
                  color="red"
                  trend={-5}
                  subtitle="Lead to close"
                />
                <MetricCard
                  title="Win Rate"
                  value={winRateMetrics ? winRateMetrics.formattedWinRate : formatPercentage(pipelineData.winRate)}
                  icon={Award}
                  color="teal"
                  trend={7}
                  subtitle="Won vs lost"
                />
                <MetricCard
                  title="Sales Velocity"
                  value={velocityMetrics ? velocityMetrics.formattedVelocity || '$0/day' : '$0/day'}
                  icon={Zap}
                  color="indigo"
                  trend={velocityMetrics?.trend || 0}
                  subtitle="Revenue per day"
                />
              </div>

              {/* Pipeline Metrics Row */}
              {pipelineMetrics && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <MetricCard
                    title="Total Pipeline Value"
                    value={pipelineMetrics.formattedTotalValue}
                    icon={DollarSign}
                    color="blue"
                    subtitle={`${pipelineMetrics.activeDealCount} active deals`}
                  />
                  <MetricCard
                    title="Weighted Pipeline Value"
                    value={pipelineMetrics.formattedWeightedValue}
                    icon={TrendingUp}
                    color="green"
                    subtitle="Probability adjusted"
                  />
                  <MetricCard
                    title="Average Deal Value"
                    value={formatCurrency(pipelineMetrics.averageDealValue)}
                    icon={Target}
                    color="purple"
                    subtitle="Per active deal"
                  />
                </div>
              )}

              {/* Advanced Lead Metrics Row */}
              {agingMetrics && contactMetrics && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard
                    title="Average Lead Age"
                    value={agingMetrics.formattedAverageAge}
                    icon={Clock}
                    color="orange"
                    subtitle={`${agingMetrics.criticalLeads.length} critical`}
                  />
                  <MetricCard
                    title="Average Stage Age"
                    value={agingMetrics.formattedAverageStageAge}
                    icon={Clock}
                    color="red"
                    subtitle="Time in current stage"
                  />
                  <MetricCard
                    title="Contact Attempts"
                    value={contactMetrics.formattedAverage}
                    icon={Users}
                    color="indigo"
                    subtitle={`${contactMetrics.contactEfficiency}% response rate`}
                  />
                  <MetricCard
                    title="Contact Efficiency"
                    value={`${contactMetrics.contactEfficiency}%`}
                    icon={Target}
                    color="cyan"
                    subtitle={`${contactMetrics.respondedLeads}/${contactMetrics.contactedLeads} responded`}
                  />
                </div>
              )}

              {/* Deal & Activity Metrics Row */}
              {dealClosureMetrics && activityRepMetrics && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <MetricCard
                    title="Average Deal Closure Time"
                    value={dealClosureMetrics.formattedAverageTime}
                    icon={Clock}
                    color="blue"
                    subtitle={`${dealClosureMetrics.closedDeals} deals closed`}
                  />
                  <MetricCard
                    title="Activity per Rep"
                    value={activityRepMetrics.formattedAverage}
                    icon={BarChart3}
                    color="orange"
                    subtitle={`${activityRepMetrics.totalActivities} total activities`}
                  />
                  <MetricCard
                    title="Closure Rate"
                    value={`${((dealClosureMetrics.closedDeals / dealClosureMetrics.totalDeals) * 100).toFixed(1)}%`}
                    icon={Target}
                    color="green"
                    subtitle={`${dealClosureMetrics.closedDeals}/${dealClosureMetrics.totalDeals} deals`}
                  />
                </div>
              )}

              {/* Revenue & Engagement Metrics Row */}
              {revenueMetrics && engagementSummary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard
                    title="Monthly Revenue per Rep"
                    value={revenueMetrics.formattedAverage}
                    icon={DollarSign}
                    color="green"
                    subtitle={`${revenueMetrics.totalReps} active reps`}
                  />
                  <MetricCard
                    title="Lead Re-engagement Rate"
                    value={reengagementMetrics?.formattedRate || '0%'}
                    icon={TrendingUp}
                    color="blue"
                    subtitle={`${reengagementMetrics?.reengagedLeads || 0} re-engaged`}
                  />
                  <MetricCard
                    title="Stale Leads"
                    value={staleLeadsMetrics?.staleLeads || 0}
                    icon={Clock}
                    color="orange"
                    subtitle={staleLeadsMetrics?.formattedRate || '0%'}
                  />
                  <MetricCard
                    title="Engagement Health"
                    value={`${engagementSummary?.healthScore || 0}/100`}
                    icon={Award}
                    color={engagementSummary?.healthScore >= 80 ? 'green' : engagementSummary?.healthScore >= 60 ? 'yellow' : 'red'}
                    subtitle={engagementSummary?.healthCategory?.label || 'No data'}
                  />
                </div>
              )}
              
              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Pipeline Funnel</h3>
                      <p className="text-sm text-gray-500 mt-1">Lead progression through stages</p>
                    </div>
                    <button
                      onClick={() => handleExport('funnel')}
                      className="p-2.5 hover:bg-gray-50 rounded-xl transition-all duration-200"
                      title="Export"
                    >
                      <Download className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <FunnelChart data={funnelData} />
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                      <p className="text-sm text-gray-500 mt-1">Monthly revenue performance</p>
                    </div>
                    <button
                      onClick={() => handleExport('revenue')}
                      className="p-2.5 hover:bg-gray-50 rounded-xl transition-all duration-200"
                      title="Export"
                    >
                      <Download className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <RevenueChart data={revenueData} />
                </div>
              </div>
            </>
          )}
          
          {/* Pipeline View */}
          {selectedView === 'pipeline' && (
            <div className="space-y-6">
              <PipelineChart data={funnelData} />
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Deal Stage Analysis</h3>
                    <p className="text-sm text-gray-500">Detailed breakdown by stage</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {funnelData.map((stage, index) => (
                    <div key={stage.stage} className="group relative overflow-hidden rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-md">
                      <div className="relative p-5 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${
                              index === 0 ? 'from-blue-500 to-indigo-600' :
                              index === funnelData.length - 1 ? 'from-green-500 to-emerald-600' :
                              'from-purple-500 to-pink-600'
                            }`}>
                              <span className="text-white font-bold">{index + 1}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-900 text-lg capitalize">
                                {stage.stage.replace('_', ' ')}
                              </span>
                              <p className="text-sm text-gray-600 mt-0.5">{stage.count} leads in this stage</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-gray-900">
                              {formatPercentage(stage.percentage)}
                            </span>
                            <p className="text-sm text-gray-500">of total</p>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
                          <div 
                            className="h-full bg-gradient-to-r from-teal-500 to-cyan-600 transition-all duration-700"
                            style={{ width: `${stage.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Sources View */}
          {selectedView === 'sources' && conversionData && (
            <ConversionChart data={conversionData} />
          )}
          
          {/* Performance View */}
          {selectedView === 'performance' && performanceData && (
            <PerformanceTable data={performanceData} />
          )}
          
          {/* Revenue View */}
          {selectedView === 'revenue' && revenueData && (
            <RevenueChart data={revenueData} detailed={true} />
          )}
          
          {/* Conversion & Velocity View */}
          {selectedView === 'conversion-velocity' && (
            <ConversionMetricsDashboard />
          )}
          
          {/* Pipeline & Win Rate View */}
          {selectedView === 'pipeline-metrics' && (
            <PipelineMetricsDashboard 
              defaultTimeframe="30d"
              showFilters={true}
            />
          )}
          
          {/* Advanced Lead Metrics View */}
          {selectedView === 'advanced-metrics' && (
            <AdvancedLeadMetricsDashboard 
              defaultTimeframe="30d"
              showFilters={true}
            />
          )}
          
          {/* Deal & Activity Metrics View */}
          {selectedView === 'deal-activity' && (
            <DealActivityMetricsDashboard 
              defaultTimeframe="30d"
              showFilters={true}
            />
          )}
          
          {/* Revenue & Engagement Metrics View */}
          {selectedView === 'revenue-engagement' && (
            <RevenueEngagementMetricsDashboard 
              defaultTimeframe="30d"
              showFilters={true}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;