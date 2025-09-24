import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Filter,
  Info,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle,
  Award,
  Target,
  Zap,
  Timer
} from 'lucide-react';
import useCRMStore from '../modules/crm-core/stores/crmStore';
import useLeadStore from '../modules/leads/stores/leadStore';
import { 
  getClosureTimeCategory, 
  getActivityPerformanceCategory,
  formatDuration 
} from '../utils/dealActivityMetricsUtils';

const DealActivityMetricsDashboard = ({ 
  teamMemberIds = [], 
  showIndividualBreakdown = true,
  defaultTimeframe = '30d',
  showFilters = true 
}) => {
  const { 
    getDealClosureTimeMetrics, 
    getDealPerformanceAnalysis,
    getDealClosureTrends,
    deals 
  } = useCRMStore();
  
  const { 
    getActivityPerRepMetrics, 
    getCombinedActivityMetrics,
    getTeamActivityComparison 
  } = useLeadStore();
  
  const [timeframe, setTimeframe] = useState(defaultTimeframe);
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [activeView, setActiveView] = useState('overview');
  
  const [closureData, setClosureData] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [combinedActivityData, setCombinedActivityData] = useState(null);
  const [performanceAnalysis, setPerformanceAnalysis] = useState(null);
  const [teamComparison, setTeamComparison] = useState(null);
  
  const filterOptions = {
    timeframe,
    assignee: selectedAssignee,
    source: selectedSource
  };

  useEffect(() => {
    // Fetch deal closure time metrics
    const closure = getDealClosureTimeMetrics(filterOptions);
    setClosureData(closure);

    // Fetch activity per rep metrics (leads only)
    const activity = getActivityPerRepMetrics(filterOptions);
    setActivityData(activity);

    // Fetch combined activity metrics (leads + deals)
    const combinedActivity = getCombinedActivityMetrics(deals || [], filterOptions);
    setCombinedActivityData(combinedActivity);

    // Get comprehensive performance analysis
    const performance = getDealPerformanceAnalysis(filterOptions);
    setPerformanceAnalysis(performance);

    // Get team activity comparison if team members provided
    if (teamMemberIds.length > 0) {
      const teamComp = getTeamActivityComparison(teamMemberIds, filterOptions);
      setTeamComparison(teamComp);
    }
  }, [timeframe, selectedAssignee, selectedSource, getDealClosureTimeMetrics, getActivityPerRepMetrics, getCombinedActivityMetrics, getDealPerformanceAnalysis, getTeamActivityComparison, deals, teamMemberIds]);

  if (!closureData || !activityData || !combinedActivityData) {
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

  const closureCategory = getClosureTimeCategory(closureData.averageClosureTime);
  const activityCategory = getActivityPerformanceCategory(
    combinedActivityData.averageActivitiesPerRep, 
    combinedActivityData.averageActivitiesPerRep
  );

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Deal Closure & Activity Metrics</h2>
            <p className="text-emerald-100">
              Track deal closure times and team activity performance
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Timer className="w-8 h-8 text-white opacity-80" />
            <Activity className="w-8 h-8 text-white opacity-80" />
            <Award className="w-8 h-8 text-white opacity-80" />
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
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All assignees</option>
                <option value="user-1">Sales Rep 1</option>
                <option value="user-2">Sales Rep 2</option>
                <option value="user-3">Sales Rep 3</option>
              </select>

              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All sources</option>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="linkedin">LinkedIn</option>
                <option value="event">Event</option>
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
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView('deal-closure')}
            className={`px-6 py-3 text-sm font-medium ${
              activeView === 'deal-closure'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Deal Closure Time
          </button>
          <button
            onClick={() => setActiveView('activity-analysis')}
            className={`px-6 py-3 text-sm font-medium ${
              activeView === 'activity-analysis'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Activity per Rep
          </button>
          <button
            onClick={() => setActiveView('performance-insights')}
            className={`px-6 py-3 text-sm font-medium ${
              activeView === 'performance-insights'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Performance Insights
          </button>
        </div>

        <div className="p-6">
          {activeView === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Average Deal Closure Time */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 mb-1">Avg Deal Closure Time</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {closureData.formattedAverageTime}
                      </p>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${closureCategory.color}`}>
                        {closureCategory.label}
                      </div>
                    </div>
                    <Timer className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                {/* Total Activities */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600 mb-1">Total Activities</p>
                      <p className="text-2xl font-bold text-green-900">
                        {combinedActivityData.totalActivities}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {combinedActivityData.totalReps} active reps
                      </p>
                    </div>
                    <Activity className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                {/* Average Activities per Rep */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-6 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 mb-1">Activities per Rep</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {combinedActivityData.averageActivitiesPerRep}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        {combinedActivityData.formattedAverage}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                </div>

                {/* Performance Score */}
                {performanceAnalysis && performanceAnalysis.summary && (
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-6 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-amber-600 mb-1">Performance Score</p>
                        <p className="text-2xl font-bold text-amber-900">
                          {performanceAnalysis.summary.performanceScore}/100
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          Combined metrics
                        </p>
                      </div>
                      <Award className="w-8 h-8 text-amber-600" />
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Summary Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Deal Closure Summary */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Timer className="w-5 h-5 text-blue-600 mr-2" />
                    Deal Closure Summary
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Deals</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {closureData.totalDeals}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Closed Deals</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {closureData.closedDeals}
                      </span>
                    </div>
                    {closureData.fastestDeal && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Fastest Closure</span>
                        <span className="text-sm font-semibold text-green-600">
                          {formatDuration(closureData.fastestDeal.closureTime)}
                        </span>
                      </div>
                    )}
                    {closureData.slowestDeal && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Slowest Closure</span>
                        <span className="text-sm font-semibold text-red-600">
                          {formatDuration(closureData.slowestDeal.closureTime)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Activity Summary */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Activity className="w-5 h-5 text-green-600 mr-2" />
                    Activity Summary
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Activities</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {combinedActivityData.totalActivities}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Reps</span>
                      <span className="text-sm font-semibold text-green-600">
                        {combinedActivityData.totalReps}
                      </span>
                    </div>
                    {combinedActivityData.topPerformers.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Top Performer</span>
                        <span className="text-sm font-semibold text-purple-600">
                          Rep {combinedActivityData.topPerformers[0].repId.split('-')[1]} ({combinedActivityData.topPerformers[0].totalActivities} activities)
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                      <span className="text-sm text-gray-600">Weekly Average</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {Math.round(combinedActivityData.averageActivitiesPerRep * 7 / 30)} per rep
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Closure Time Distribution */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Deal Closure Time Distribution</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(closureData.closureDistribution).map(([range, count]) => {
                    const percentage = closureData.closedDeals > 0 ? (count / closureData.closedDeals) * 100 : 0;
                    return (
                      <div key={range} className="text-center">
                        <div className="mb-2">
                          <div className={`text-2xl font-bold ${
                            range.includes('0-7') ? 'text-green-600' :
                            range.includes('8-14') ? 'text-blue-600' :
                            range.includes('15-30') ? 'text-yellow-600' :
                            range.includes('31-60') ? 'text-orange-600' : 'text-red-600'
                          }`}>
                            {count}
                          </div>
                          <div className="text-xs text-gray-500">
                            {range === '90+' ? '90+ days' : `${range} days`}
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              range.includes('0-7') ? 'bg-green-500' :
                              range.includes('8-14') ? 'bg-blue-500' :
                              range.includes('15-30') ? 'bg-yellow-500' :
                              range.includes('31-60') ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeView === 'deal-closure' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900">Deal Closure Time Analysis</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Measure how long it takes to close deals from creation to final outcome. 
                      Shorter closure times typically indicate better qualification and sales processes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Closure Time Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Won vs Lost Comparison */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Won vs Lost Deals</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-green-900">Won Deals</p>
                        <p className="text-xs text-green-600">
                          {closureData.byStage['closed-won']?.dealCount || 0} deals
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-900">
                          {formatDuration(closureData.byStage['closed-won']?.averageTime || 0)}
                        </p>
                        <p className="text-xs text-green-600">average time</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-red-900">Lost Deals</p>
                        <p className="text-xs text-red-600">
                          {closureData.byStage['closed-lost']?.dealCount || 0} deals
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-900">
                          {formatDuration(closureData.byStage['closed-lost']?.averageTime || 0)}
                        </p>
                        <p className="text-xs text-red-600">average time</p>
                      </div>
                    </div>

                    {/* Comparison Insights */}
                    {closureData.byStage['closed-won']?.averageTime && closureData.byStage['closed-lost']?.averageTime && (
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-center space-x-2">
                          {closureData.byStage['closed-won'].averageTime > closureData.byStage['closed-lost'].averageTime ? (
                            <>
                              <TrendingUp className="w-4 h-4 text-amber-600" />
                              <span className="text-sm text-amber-700">
                                Won deals take {Math.round(closureData.byStage['closed-won'].averageTime - closureData.byStage['closed-lost'].averageTime)} days longer to close
                              </span>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-700">
                                Won deals close {Math.round(closureData.byStage['closed-lost'].averageTime - closureData.byStage['closed-won'].averageTime)} days faster than lost deals
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance by Assignee */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance by Assignee</h4>
                  <div className="space-y-4">
                    {Object.entries(closureData.byAssignee).map(([assigneeId, data]) => (
                      <div key={assigneeId} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Sales Rep {assigneeId.split('-')[1]}
                          </span>
                          <div className="text-right">
                            <span className="text-sm font-bold text-gray-900">
                              {formatDuration(data.averageTime)}
                            </span>
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${data.performanceCategory.color}`}>
                              {data.performanceCategory.label}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                          <div>
                            <span>Deals: </span>
                            <span className="font-semibold text-gray-900">{data.dealCount}</span>
                          </div>
                          <div>
                            <span>Win Rate: </span>
                            <span className="font-semibold text-green-600">{data.winRate.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span>Value: </span>
                            <span className="font-semibold text-blue-600">${data.totalValue.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fastest and Slowest Deals */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Fastest Deal */}
                {closureData.fastestDeal && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      Fastest Deal
                    </h4>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-green-900">{closureData.fastestDeal.name}</h5>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          closureData.fastestDeal.stage === 'closed-won' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {closureData.fastestDeal.stage === 'closed-won' ? 'Won' : 'Lost'}
                        </span>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          {formatDuration(closureData.fastestDeal.closureTime)}
                        </div>
                        <div className="text-sm text-green-700">
                          ${closureData.fastestDeal.value?.toLocaleString() || 0} value
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Slowest Deal */}
                {closureData.slowestDeal && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                      Slowest Deal
                    </h4>
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-red-900">{closureData.slowestDeal.name}</h5>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          closureData.slowestDeal.stage === 'closed-won' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {closureData.slowestDeal.stage === 'closed-won' ? 'Won' : 'Lost'}
                        </span>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-600 mb-1">
                          {formatDuration(closureData.slowestDeal.closureTime)}
                        </div>
                        <div className="text-sm text-red-700">
                          ${closureData.slowestDeal.value?.toLocaleString() || 0} value
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeView === 'activity-analysis' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-green-900">Activity per Rep Analysis</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Track the volume of activities (calls, emails, meetings) per sales representative. 
                      Higher activity levels typically correlate with better sales performance.
                    </p>
                  </div>
                </div>
              </div>

              {/* Activity Distribution */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Activity Distribution by Rep</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {Object.entries(combinedActivityData.activityDistribution).map(([range, count]) => {
                    const percentage = combinedActivityData.totalReps > 0 ? (count / combinedActivityData.totalReps) * 100 : 0;
                    return (
                      <div key={range} className="text-center">
                        <div className="mb-2">
                          <div className={`text-2xl font-bold ${
                            range === '0-10' ? 'text-red-600' :
                            range === '11-25' ? 'text-orange-600' :
                            range === '26-50' ? 'text-yellow-600' :
                            range === '51-100' ? 'text-blue-600' : 'text-green-600'
                          }`}>
                            {count}
                          </div>
                          <div className="text-xs text-gray-500">
                            {range === '100+' ? '100+ activities' : `${range} activities`}
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              range === '0-10' ? 'bg-red-500' :
                              range === '11-25' ? 'bg-orange-500' :
                              range === '26-50' ? 'bg-yellow-500' :
                              range === '51-100' ? 'bg-blue-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.max(percentage, 10)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Activity Type Breakdown */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Activity Type Breakdown</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(combinedActivityData.byActivityType).map(([type, data]) => (
                    <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {data.totalCount}
                      </div>
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        {type}
                      </div>
                      <div className="text-xs text-gray-500">
                        {data.percentage.toFixed(1)}% of total
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        {data.averagePerRep.toFixed(1)} per rep
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Performers */}
              {combinedActivityData.topPerformers.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Award className="w-5 h-5 text-gold-600 mr-2" />
                    Top Activity Performers
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {combinedActivityData.topPerformers.map((performer, index) => (
                      <div key={performer.repId} className="text-center p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center justify-center mb-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                          }`}>
                            #{performer.rank}
                          </div>
                        </div>
                        <div className="text-lg font-bold text-gray-900 mb-1">
                          Sales Rep {performer.repId.split('-')[1]}
                        </div>
                        <div className="text-2xl font-bold text-amber-600 mb-1">
                          {performer.totalActivities}
                        </div>
                        <div className="text-sm text-gray-600">
                          activities ({performer.activitiesPerWeek.toFixed(1)}/week)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Individual Rep Performance */}
              {Object.keys(combinedActivityData.byRep).length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Individual Rep Performance</h4>
                  <div className="space-y-3">
                    {Object.entries(combinedActivityData.byRep)
                      .sort(([,a], [,b]) => b.totalActivities - a.totalActivities)
                      .map(([repId, data]) => (
                        <div key={repId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="text-sm font-medium text-gray-700">
                              Sales Rep {repId.split('-')[1]}
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${data.performanceCategory.color}`}>
                              {data.performanceCategory.label}
                            </div>
                          </div>
                          <div className="flex items-center space-x-6 text-sm">
                            <div className="text-center">
                              <div className="font-bold text-gray-900">{data.totalActivities}</div>
                              <div className="text-xs text-gray-500">total</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-blue-600">{data.activitiesPerWeek.toFixed(1)}</div>
                              <div className="text-xs text-gray-500">per week</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-green-600">{data.leadActivities}</div>
                              <div className="text-xs text-gray-500">leads</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-purple-600">{data.dealActivities}</div>
                              <div className="text-xs text-gray-500">deals</div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeView === 'performance-insights' && performanceAnalysis && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900">Performance Insights</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      AI-powered analysis combining deal closure times and activity levels 
                      to provide actionable insights for sales performance improvement.
                    </p>
                  </div>
                </div>
              </div>

              {/* Performance Score Card */}
              {performanceAnalysis.summary && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 mb-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-emerald-900">
                          {performanceAnalysis.summary.performanceScore}
                        </div>
                        <div className="text-sm text-emerald-600">/ 100</div>
                      </div>
                    </div>
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                      performanceAnalysis.summary.performanceScore >= 80 ? 'bg-green-100 text-green-800' :
                      performanceAnalysis.summary.performanceScore >= 60 ? 'bg-blue-100 text-blue-800' :
                      performanceAnalysis.summary.performanceScore >= 40 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {performanceAnalysis.summary.performanceScore >= 80 ? 'Excellent' :
                       performanceAnalysis.summary.performanceScore >= 60 ? 'Good' :
                       performanceAnalysis.summary.performanceScore >= 40 ? 'Fair' : 'Needs Improvement'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {performanceAnalysis.summary.averageClosureTime.toFixed(1)}
                      </div>
                      <div className="text-gray-600">Avg Closure (days)</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {performanceAnalysis.summary.salesVelocity.toFixed(1)}
                      </div>
                      <div className="text-gray-600">Sales Velocity</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {performanceAnalysis.summary.winRate.toFixed(1)}%
                      </div>
                      <div className="text-gray-600">Win Rate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {performanceAnalysis.summary.closedDeals}
                      </div>
                      <div className="text-gray-600">Closed Deals</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Insights and Recommendations */}
              {performanceAnalysis.insights && performanceAnalysis.insights.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Zap className="w-5 h-5 text-amber-600 mr-2" />
                    Performance Insights & Recommendations
                  </h4>
                  <div className="space-y-4">
                    {performanceAnalysis.insights.map((insight, index) => (
                      <div key={index} className={`border-l-4 pl-4 py-3 ${
                        insight.priority === 'high' ? 'border-red-500 bg-red-50' :
                        insight.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                        'border-blue-500 bg-blue-50'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h5 className="font-medium text-gray-900">{insight.title}</h5>
                            <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                            insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {insight.priority}
                          </span>
                        </div>
                        {insight.actionItems && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-gray-700 mb-2">Recommended Actions:</p>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {insight.actionItems.map((action, actionIndex) => (
                                <li key={actionIndex} className="flex items-start">
                                  <span className="text-gray-400 mr-2">•</span>
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Combined Activity Insights */}
              {combinedActivityData.insights && combinedActivityData.insights.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Activity Performance Insights</h4>
                  <div className="space-y-3">
                    {combinedActivityData.insights.map((insight, index) => (
                      <div key={index} className={`p-3 rounded-lg border-l-4 ${
                        insight.priority === 'high' ? 'border-red-500 bg-red-50' :
                        insight.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                        'border-blue-500 bg-blue-50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-gray-900">{insight.title}</h5>
                            <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                            insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {insight.priority}
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

export default DealActivityMetricsDashboard;