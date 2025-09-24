import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Filter,
  Info,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  Award,
  Target,
  Clock,
  Activity,
  ArrowUp,
  ArrowDown,
  Percent
} from 'lucide-react';
import useCRMStore from '../modules/crm-core/stores/crmStore';
import useLeadStore from '../modules/leads/stores/leadStore';

const RevenueEngagementMetricsDashboard = ({ 
  teamMemberIds = [], 
  showIndividualBreakdown = true,
  defaultTimeframe = '30d',
  showFilters = true 
}) => {
  const { 
    getMonthlyRevenuePerRepMetrics, 
    getRevenuePerformanceAnalysis,
    getRevenueTrends,
    deals 
  } = useCRMStore();
  
  const { 
    getLeadReengagementMetrics, 
    getStaleLeadsMetrics,
    getDropoffRateByStageMetrics,
    getLeadEngagementAnalysis,
    leads
  } = useLeadStore();
  
  const [timeframe, setTimeframe] = useState(defaultTimeframe);
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [staleDays, setStaleDays] = useState(14);
  const [activeView, setActiveView] = useState('overview');
  
  const [revenueData, setRevenueData] = useState(null);
  const [reengagementData, setReengagementData] = useState(null);
  const [staleLeadsData, setStaleLeadsData] = useState(null);
  const [dropoffData, setDropoffData] = useState(null);
  const [revenueAnalysis, setRevenueAnalysis] = useState(null);
  const [engagementAnalysis, setEngagementAnalysis] = useState(null);
  
  const filterOptions = {
    timeframe,
    assignee: selectedAssignee,
    source: selectedSource,
    staleDays
  };

  useEffect(() => {
    // Fetch monthly revenue per rep metrics
    const revenue = getMonthlyRevenuePerRepMetrics({ ...filterOptions, _leads: leads });
    setRevenueData(revenue);

    // Fetch revenue analysis
    const revAnalysis = getRevenuePerformanceAnalysis({ ...filterOptions, _leads: leads });
    setRevenueAnalysis(revAnalysis);

    // Fetch re-engagement metrics
    const reengagement = getLeadReengagementMetrics(filterOptions);
    setReengagementData(reengagement);

    // Fetch stale leads metrics
    const stale = getStaleLeadsMetrics(filterOptions);
    setStaleLeadsData(stale);

    // Fetch drop-off rate metrics
    const dropoff = getDropoffRateByStageMetrics(filterOptions);
    setDropoffData(dropoff);

    // Fetch comprehensive engagement analysis
    const engagement = getLeadEngagementAnalysis(filterOptions);
    setEngagementAnalysis(engagement);
  }, [timeframe, selectedAssignee, selectedSource, staleDays, getMonthlyRevenuePerRepMetrics, getRevenuePerformanceAnalysis, getLeadReengagementMetrics, getStaleLeadsMetrics, getDropoffRateByStageMetrics, getLeadEngagementAnalysis, leads]);

  if (!revenueData || !reengagementData || !staleLeadsData || !dropoffData) {
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const MetricCard = ({ title, value, subtitle, icon: Icon, color, trend, badge }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br ${
          color === 'green' ? 'from-green-500 to-emerald-600' :
          color === 'blue' ? 'from-blue-500 to-indigo-600' :
          color === 'purple' ? 'from-purple-500 to-pink-600' :
          color === 'orange' ? 'from-orange-500 to-red-600' :
          color === 'indigo' ? 'from-indigo-500 to-purple-600' :
          color === 'red' ? 'from-red-500 to-rose-600' :
          color === 'teal' ? 'from-teal-500 to-cyan-600' :
          color === 'amber' ? 'from-amber-500 to-orange-600' :
          'from-gray-500 to-slate-600'
        }`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {badge && (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
            {badge.label}
          </span>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900">{value}</span>
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend > 0 ? 'bg-green-100 text-green-700' : 
              trend < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {trend > 0 ? <ArrowUp className="w-3 h-3" /> : 
               trend < 0 ? <ArrowDown className="w-3 h-3" /> : null}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );

  const InsightCard = ({ insight }) => (
    <div className={`border-l-4 p-4 rounded-r-lg ${
      insight.priority === 'high' ? 'border-red-500 bg-red-50' :
      insight.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
      'border-blue-500 bg-blue-50'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
          insight.priority === 'high' ? 'bg-red-100' :
          insight.priority === 'medium' ? 'bg-yellow-100' :
          'bg-blue-100'
        }`}>
          {insight.priority === 'high' ? <AlertTriangle className="w-4 h-4 text-red-600" /> :
           insight.priority === 'medium' ? <Info className="w-4 h-4 text-yellow-600" /> :
           <CheckCircle className="w-4 h-4 text-blue-600" />}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
          <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
          <p className="text-sm font-medium text-gray-800">
            💡 {insight.recommendation}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Revenue & Engagement Metrics</h2>
            <p className="text-gray-600 mt-1">Track revenue performance and lead engagement health</p>
          </div>
          
          {showFilters && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="6m">Last 6 months</option>
                  <option value="1y">Last year</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">All Reps</option>
                  <option value="user1">John Smith</option>
                  <option value="user2">Sarah Johnson</option>
                  <option value="user3">Mike Wilson</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <select
                  value={staleDays}
                  onChange={(e) => setStaleDays(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value={7}>7 days stale</option>
                  <option value={14}>14 days stale</option>
                  <option value={21}>21 days stale</option>
                  <option value={30}>30 days stale</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'revenue', label: 'Revenue Analysis', icon: DollarSign },
            { id: 'engagement', label: 'Lead Engagement', icon: Activity },
            { id: 'insights', label: 'Insights & Actions', icon: Target }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeView === tab.id
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Tab */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Average Monthly Revenue per Rep"
              value={revenueData.formattedAverage}
              subtitle={`${revenueData.totalReps} active reps`}
              icon={DollarSign}
              color="green"
            />
            <MetricCard
              title="Lead Re-engagement Rate"
              value={reengagementData.formattedRate}
              subtitle={`${reengagementData.reengagedLeads}/${reengagementData.totalColdLeads} cold leads`}
              icon={RefreshCw}
              color="blue"
            />
            <MetricCard
              title="Stale Leads"
              value={staleLeadsData.staleLeads}
              subtitle={`${staleLeadsData.formattedRate} of active leads`}
              icon={Clock}
              color="orange"
              badge={staleLeadsData.staleRate > 30 ? { label: 'High Risk', color: 'bg-red-100 text-red-700' } : null}
            />
            <MetricCard
              title="Drop-off Rate"
              value={`${dropoffData.overallDropoffRate}%`}
              subtitle={dropoffData.worstPerformingStage ? `Worst: ${dropoffData.worstPerformingStage.stage}` : 'Across all stages'}
              icon={TrendingDown}
              color="red"
            />
          </div>

          {/* Lead Engagement Health Score */}
          {engagementAnalysis && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Lead Engagement Health Score</h3>
                  <p className="text-sm text-gray-500">Overall assessment of lead engagement effectiveness</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">{engagementAnalysis.overallHealthScore}</div>
                  <div className={`text-sm font-medium px-3 py-1 rounded-full ${engagementAnalysis.healthCategory.color}`}>
                    {engagementAnalysis.healthCategory.label}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{engagementAnalysis.summary.totalLeads}</div>
                  <div className="text-sm text-gray-600">Total Active Leads</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{engagementAnalysis.summary.staleLeads}</div>
                  <div className="text-sm text-gray-600">Stale Leads</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{engagementAnalysis.summary.reengagedLeads}</div>
                  <div className="text-sm text-gray-600">Re-engaged</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{engagementAnalysis.combinedInsights.filter(i => i.priority === 'high').length}</div>
                  <div className="text-sm text-gray-600">Critical Issues</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Revenue Analysis Tab */}
      {activeView === 'revenue' && (
        <div className="space-y-6">
          {/* Revenue Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Total Revenue Generated"
              value={formatCurrency(revenueData.totalRevenue)}
              subtitle={`Across ${revenueData.totalReps} reps`}
              icon={DollarSign}
              color="green"
            />
            <MetricCard
              title="Average Monthly Revenue"
              value={revenueData.formattedAverage}
              subtitle="Per rep per month"
              icon={Target}
              color="blue"
            />
            <MetricCard
              title="Top Performer Revenue"
              value={revenueData.topPerformers.length > 0 ? formatCurrency(revenueData.topPerformers[0].monthlyAverage) : '$0'}
              subtitle={revenueData.topPerformers.length > 0 ? `${revenueData.topPerformers[0].dealCount} deals` : 'No data'}
              icon={Award}
              color="purple"
            />
          </div>

          {/* Revenue Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(revenueData.revenueDistribution).map(([range, count]) => (
                <div key={range} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600">{range} monthly</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performers */}
          {revenueData.topPerformers.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Revenue Performers</h3>
              <div className="space-y-3">
                {revenueData.topPerformers.map((performer, index) => (
                  <div key={performer.repId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Rep {performer.repId}</div>
                        <div className="text-sm text-gray-600">{performer.dealCount} deals closed</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{formatCurrency(performer.monthlyAverage)}</div>
                      <div className="text-sm text-gray-600">monthly avg</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lead Engagement Tab */}
      {activeView === 'engagement' && (
        <div className="space-y-6">
          {/* Engagement Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Re-engagement Success"
              value={reengagementData.formattedRate}
              subtitle={`${reengagementData.reengagedLeads} of ${reengagementData.totalColdLeads} cold leads`}
              icon={RefreshCw}
              color="blue"
              badge={reengagementData.reengagementRate < 15 ? { label: 'Below Target', color: 'bg-yellow-100 text-yellow-700' } : null}
            />
            <MetricCard
              title="Stale Leads Count"
              value={staleLeadsData.staleLeads}
              subtitle={`${staleLeadsData.formattedRate} of ${staleLeadsData.totalLeads} active`}
              icon={Clock}
              color="orange"
              badge={staleLeadsData.staleRate > 25 ? { label: 'Action Needed', color: 'bg-red-100 text-red-700' } : null}
            />
            <MetricCard
              title="Worst Drop-off Stage"
              value={dropoffData.worstPerformingStage ? `${dropoffData.worstPerformingStage.dropoffRate.toFixed(1)}%` : 'N/A'}
              subtitle={dropoffData.worstPerformingStage ? dropoffData.worstPerformingStage.stage : 'No data'}
              icon={TrendingDown}
              color="red"
            />
          </div>

          {/* Stale Leads Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stale Leads by Time Period</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(staleLeadsData.staleDistribution).map(([period, count]) => (
                <div key={period} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600">{period} stale</div>
                </div>
              ))}
            </div>
          </div>

          {/* Re-engagement Methods */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Re-engagement Success by Method</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(reengagementData.reengagementMethods).map(([method, count]) => (
                <div key={method} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600 capitalize">{method} successes</div>
                </div>
              ))}
            </div>
          </div>

          {/* Drop-off by Stage */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Drop-off Rate by Stage</h3>
            <div className="space-y-3">
              {dropoffData.conversionFunnel.map((stage, index) => (
                <div key={stage.stage} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{stage.stage}</div>
                      <div className="text-sm text-gray-600">{stage.count} leads entered</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">{stage.dropoffRate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">drop-off rate</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Insights & Actions Tab */}
      {activeView === 'insights' && (
        <div className="space-y-6">
          {/* Critical Insights */}
          {engagementAnalysis && engagementAnalysis.combinedInsights.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actionable Insights ({engagementAnalysis.combinedInsights.length})
              </h3>
              <div className="space-y-4">
                {engagementAnalysis.combinedInsights.map((insight, index) => (
                  <InsightCard key={index} insight={insight} />
                ))}
              </div>
            </div>
          )}

          {/* Revenue Analysis Insights */}
          {revenueAnalysis && revenueAnalysis.recommendations.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Revenue Optimization Recommendations
              </h3>
              <div className="space-y-4">
                {revenueAnalysis.recommendations.map((rec, index) => (
                  <InsightCard key={index} insight={{
                    priority: rec.priority,
                    title: rec.title,
                    description: rec.description,
                    recommendation: rec.action
                  }} />
                ))}
              </div>
            </div>
          )}

          {/* Improvement Areas */}
          {revenueAnalysis && revenueAnalysis.improvementAreas.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Areas for Improvement</h3>
              <div className="space-y-4">
                {revenueAnalysis.improvementAreas.map((area, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      <h4 className="font-medium text-gray-900">{area.area}</h4>
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        {area.count} reps
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{area.description}</p>
                    {area.reps && (
                      <div className="flex flex-wrap gap-2">
                        {area.reps.slice(0, 5).map((rep, repIndex) => (
                          <span key={repIndex} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            Rep {rep.repId}: {formatCurrency(rep.monthlyAverage)}/mo
                          </span>
                        ))}
                        {area.reps.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            +{area.reps.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RevenueEngagementMetricsDashboard;