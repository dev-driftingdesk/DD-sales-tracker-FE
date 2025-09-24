import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Filter,
  Info,
  Calendar,
  Users,
  Award,
  AlertCircle
} from 'lucide-react';
import useCRMStore from '../modules/crm-core/stores/crmStore';
import useLeadStore from '../modules/leads/stores/leadStore';
import { 
  getPipelineValueCategory, 
  getWinRateCategory, 
  calculatePipelineHealthScore 
} from '../utils/pipelineMetricsUtils';

const PipelineMetricsDashboard = ({ 
  teamMemberIds = [], 
  showIndividualBreakdown = true,
  defaultTimeframe = '30d',
  showFilters = true 
}) => {
  const { getPipelineValueMetrics, getWinRateMetrics, getPipelineAnalysis } = useCRMStore();
  const { getLeadWinRateMetrics, getWinRateBreakdown } = useLeadStore();
  
  const [timeframe, setTimeframe] = useState(defaultTimeframe);
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  const [activeView, setActiveView] = useState('overview');
  
  const [pipelineData, setPipelineData] = useState(null);
  const [winRateData, setWinRateData] = useState(null);
  const [leadWinRateData, setLeadWinRateData] = useState(null);
  const [combinedAnalysis, setCombinedAnalysis] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  
  const filterOptions = {
    timeframe,
    assignee: selectedAssignee,
    stage: selectedStage
  };

  useEffect(() => {
    // Fetch pipeline value metrics
    const pipeline = getPipelineValueMetrics(filterOptions);
    setPipelineData(pipeline);

    // Fetch win rate metrics from deals
    const winRate = getWinRateMetrics(filterOptions);
    setWinRateData(winRate);

    // Fetch lead-based win rate metrics
    const leadWinRate = getLeadWinRateMetrics(filterOptions);
    setLeadWinRateData(leadWinRate);

    // Get combined analysis
    const analysis = getPipelineAnalysis(filterOptions);
    setCombinedAnalysis(analysis);

    // Calculate health score
    if (pipeline && winRate) {
      const health = calculatePipelineHealthScore(pipeline, winRate);
      setHealthScore(health);
    }
  }, [timeframe, selectedAssignee, selectedStage, getPipelineValueMetrics, getWinRateMetrics, getLeadWinRateMetrics, getPipelineAnalysis]);

  if (!pipelineData || !winRateData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  const pipelineCategory = getPipelineValueCategory(pipelineData.weightedPipelineValue);
  const winRateCategory = getWinRateCategory(winRateData.overallWinRate);

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Pipeline Value & Win Rate Analytics</h2>
            <p className="text-indigo-100">
              Track pipeline health, deal values, and win rate performance
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <BarChart3 className="w-8 h-8 text-white opacity-80" />
            <Target className="w-8 h-8 text-white opacity-80" />
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters</span>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="6m">Last 6 months</option>
                <option value="1y">Last year</option>
                <option value="all">All time</option>
              </select>
              
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All assignees</option>
                <option value="user-1">Sales Rep 1</option>
                <option value="user-2">Sales Rep 2</option>
                <option value="user-3">Sales Rep 3</option>
              </select>

              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All stages</option>
                <option value="prospecting">Prospecting</option>
                <option value="qualification">Qualification</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveView('overview')}
            className={`px-6 py-3 text-sm font-medium ${
              activeView === 'overview'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView('pipeline-value')}
            className={`px-6 py-3 text-sm font-medium ${
              activeView === 'pipeline-value'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pipeline Value
          </button>
          <button
            onClick={() => setActiveView('win-rate')}
            className={`px-6 py-3 text-sm font-medium ${
              activeView === 'win-rate'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Win Rate Analysis
          </button>
          <button
            onClick={() => setActiveView('health')}
            className={`px-6 py-3 text-sm font-medium ${
              activeView === 'health'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pipeline Health
          </button>
        </div>

        <div className="p-6">
          {activeView === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Pipeline Value */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 mb-1">Total Pipeline Value</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {pipelineData.formattedTotalValue}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        {pipelineData.activeDealCount} active deals
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                {/* Weighted Pipeline Value */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600 mb-1">Weighted Pipeline Value</p>
                      <p className="text-2xl font-bold text-green-900">
                        {pipelineData.formattedWeightedValue}
                      </p>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${pipelineCategory.color}`}>
                        {pipelineCategory.label}
                      </div>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                {/* Win Rate */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-6 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 mb-1">Deal Win Rate</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {winRateData.formattedWinRate}
                      </p>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${winRateCategory.color}`}>
                        {winRateCategory.label}
                      </div>
                    </div>
                    <Target className="w-8 h-8 text-purple-600" />
                  </div>
                </div>

                {/* Pipeline Health */}
                {healthScore && (
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-6 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-amber-600 mb-1">Pipeline Health</p>
                        <p className="text-2xl font-bold text-amber-900">
                          {healthScore.score}/100
                        </p>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${healthScore.color}`}>
                          {healthScore.label}
                        </div>
                      </div>
                      <Award className="w-8 h-8 text-amber-600" />
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pipeline Breakdown */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Pipeline by Stage</h4>
                  <div className="space-y-3">
                    {Object.entries(pipelineData.breakdown.byStage).map(([stage, data]) => (
                      <div key={stage} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {stage.replace('-', ' ')}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            ${data.totalValue.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {data.dealCount} deals
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Win Rate Insights */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Win Rate Performance</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Deals Won</span>
                      <span className="text-sm font-semibold text-green-600">
                        {winRateData.dealsWon}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Deals Lost</span>
                      <span className="text-sm font-semibold text-red-600">
                        {winRateData.dealsLost}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Deals</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {winRateData.activeDealCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                      <span className="text-sm text-gray-600">Total Closed</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {winRateData.closedDeals}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'pipeline-value' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900">Pipeline Value Analysis</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Pipeline value represents the total and weighted value of active deals. 
                      Weighted value applies probability-based multipliers to each deal stage.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pipeline Value Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* By Stage */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Value by Stage</h4>
                  <div className="space-y-4">
                    {Object.entries(pipelineData.breakdown.byStage).map(([stage, data]) => (
                      <div key={stage} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {stage.replace('-', ' ')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {data.probability}% probability
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Total: ${data.totalValue.toLocaleString()}
                          </span>
                          <span className="text-sm font-semibold text-indigo-600">
                            Weighted: ${data.weightedValue.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full" 
                            style={{ width: `${data.probability}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By Probability Range */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">By Probability Range</h4>
                  <div className="space-y-4">
                    {Object.entries(pipelineData.breakdown.byProbability).map(([range, data]) => (
                      <div key={range} className="flex items-center justify-between">
                        <div>
                          <span className={`text-sm font-medium capitalize ${
                            range === 'high' ? 'text-green-700' :
                            range === 'medium' ? 'text-yellow-700' : 'text-red-700'
                          }`}>
                            {range} ({data.min}-{data.max}%)
                          </span>
                          <p className="text-xs text-gray-500">
                            {data.deals.length} deals
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            ${data.totalValue.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            ${data.weightedValue.toLocaleString()} weighted
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Average Deal Value</span>
                      <span className="text-sm font-semibold text-gray-900">
                        ${pipelineData.averageDealValue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Deals</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {pipelineData.activeDealCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pipeline Efficiency</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {pipelineData.totalPipelineValue > 0 ? 
                          Math.round((pipelineData.weightedPipelineValue / pipelineData.totalPipelineValue) * 100) : 0
                        }%
                      </span>
                    </div>
                    {pipelineData.trend !== null && (
                      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                        <span className="text-sm text-gray-600">Trend</span>
                        <div className="flex items-center space-x-1">
                          {pipelineData.trend > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                          <span className={`text-sm font-semibold ${
                            pipelineData.trend > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ${Math.abs(pipelineData.trend).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'win-rate' && (
            <div className="space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-purple-900">Win Rate Analysis</h4>
                    <p className="text-sm text-purple-700 mt-1">
                      Win rate tracks the percentage of closed deals that result in wins. 
                      Higher win rates indicate better qualification and sales processes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Win Rate Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Deal Breakdown */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Deal Breakdown</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Won Deals</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm font-semibold text-green-600">
                          {winRateData.dealsWon}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Lost Deals</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm font-semibold text-red-600">
                          {winRateData.dealsLost}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Deals</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-semibold text-blue-600">
                          {winRateData.activeDealCount}
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Win Rate</span>
                        <span className="text-lg font-bold text-purple-600">
                          {winRateData.formattedWinRate}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stage Distribution */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Stage Distribution</h4>
                  <div className="space-y-3">
                    {Object.entries(winRateData.breakdown.byStage).map(([stage, data]) => (
                      <div key={stage} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {stage.replace('-', ' ')}
                        </span>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600">
                            {data.dealCount} deals
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {data.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Assignee Performance */}
              {Object.keys(winRateData.breakdown.byAssignee).length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance by Assignee</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(winRateData.breakdown.byAssignee).map(([assigneeId, data]) => (
                      <div key={assigneeId} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Sales Rep {assigneeId.split('-')[1]}
                          </span>
                          <span className="text-sm font-bold text-purple-600">
                            {data.winRate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Won:</span>
                            <span className="text-green-600">{data.wonDeals}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total:</span>
                            <span>{data.totalDeals}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Active:</span>
                            <span className="text-blue-600">{data.activeDeals}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeView === 'health' && healthScore && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900">Pipeline Health Score</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      A composite score based on pipeline value (40%), win rate (35%), and deal activity (25%). 
                      Higher scores indicate healthier sales pipelines.
                    </p>
                  </div>
                </div>
              </div>

              {/* Health Score Overview */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-amber-100 to-yellow-100 mb-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-amber-900">{healthScore.score}</div>
                      <div className="text-sm text-amber-600">/ 100</div>
                    </div>
                  </div>
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${healthScore.color}`}>
                    {healthScore.label}
                  </div>
                </div>

                {/* Score Factors */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {healthScore.factors.map((factor, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {factor.score}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        {factor.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        Weight: {factor.weight}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-amber-600 h-2 rounded-full" 
                          style={{ width: `${(factor.score / 40) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              {healthScore.recommendations && healthScore.recommendations.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 text-amber-600 mr-2" />
                    Recommendations
                  </h4>
                  <div className="space-y-4">
                    {healthScore.recommendations.map((rec, index) => (
                      <div key={index} className={`border-l-4 pl-4 py-2 ${
                        rec.priority === 'urgent' ? 'border-red-500 bg-red-50' :
                        rec.priority === 'high' ? 'border-orange-500 bg-orange-50' :
                        rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                        'border-blue-500 bg-blue-50'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-medium text-gray-900">{rec.title}</h5>
                            <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            rec.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            rec.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {rec.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PipelineMetricsDashboard;