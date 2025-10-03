import React, { useEffect, useState } from 'react';
import { DollarSign, Phone, Users, Target, TrendingUp, Award, Clock, MessageCircle, Zap, BarChart3, RefreshCw } from 'lucide-react';
import DashboardHeader from './components/DashboardHeader';
import KPICard from './components/KPICard';
import Leaderboard from './components/Leaderboard';
import PerformanceTips from './components/PerformanceTips';
import TimeMetricsDashboard from '../../components/TimeMetricsDashboard';
import ConversionMetricsDashboard from '../../components/ConversionMetricsDashboard';
import PipelineMetricsDashboard from '../../components/PipelineMetricsDashboard';
import AdvancedLeadMetricsDashboard from '../../components/AdvancedLeadMetricsDashboard';
import DealActivityMetricsDashboard from '../../components/DealActivityMetricsDashboard';
import RevenueEngagementMetricsDashboard from '../../components/RevenueEngagementMetricsDashboard';
import useAuthStore from '../auth/stores/authStore.js';
import usePerformanceStore from './stores/performanceStore';
import useTeamStore from '../../stores/teamStore';
import useLeadStore from '../leads/stores/leadStore';
import useCRMStore from '../crm-core/stores/crmStore';

const PerformanceModule = () => {
  const { user: currentUser } = useAuthStore();
  const { 
    currentPeriod, 
    leaderboard, 
    generateLeaderboard, 
    getUserPerformance,
    getPerformanceTrends 
  } = usePerformanceStore();
  const { getTeamByMemberId } = useTeamStore();
  const { getTeamTimeMetrics, getLeadConversionMetrics, getLeadAgingMetrics, getContactAttemptsMetrics, getActivityPerRepMetrics, getLeadReengagementMetrics, getStaleLeadsMetrics, getLeadEngagementSummary } = useLeadStore();
  const { getSalesVelocityMetrics, getPipelineValueMetrics, getWinRateMetrics, getDealClosureTimeMetrics, getDealPerformanceAnalysis, getMonthlyRevenuePerRepMetrics } = useCRMStore();
  
  const [userPerformance, setUserPerformance] = useState(null);
  const [trends, setTrends] = useState([]);
  const [timeMetrics, setTimeMetrics] = useState(null);
  const [conversionMetrics, setConversionMetrics] = useState(null);
  const [velocityMetrics, setVelocityMetrics] = useState(null);
  const [pipelineMetrics, setPipelineMetrics] = useState(null);
  const [winRateMetrics, setWinRateMetrics] = useState(null);
  const [agingMetrics, setAgingMetrics] = useState(null);
  const [contactMetrics, setContactMetrics] = useState(null);
  const [dealClosureMetrics, setDealClosureMetrics] = useState(null);
  const [activityRepMetrics, setActivityRepMetrics] = useState(null);
  const [revenueMetrics, setRevenueMetrics] = useState(null);
  const [engagementSummary, setEngagementSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    // Generate leaderboard on mount and period change
    generateLeaderboard(currentPeriod);
  }, [currentPeriod, generateLeaderboard]);
  
  useEffect(() => {
    // Get current user's performance
    if (currentUser?.id) {
      const performance = getUserPerformance(currentUser.id, currentPeriod);
      setUserPerformance(performance);
      
      const userTrends = getPerformanceTrends(currentUser.id);
      setTrends(userTrends);

      // Get time metrics for current user
      const userTimeMetrics = getTeamTimeMetrics([currentUser.id]);
      setTimeMetrics(userTimeMetrics);

      // Get conversion metrics for current user
      const userConversionMetrics = getLeadConversionMetrics({ 
        assignee: currentUser.id, 
        timeframe: '30d' 
      });
      setConversionMetrics(userConversionMetrics);

      // Get sales velocity metrics for current user
      const userVelocityMetrics = getSalesVelocityMetrics({ 
        assignee: currentUser.id, 
        timeframe: '30d' 
      });
      setVelocityMetrics(userVelocityMetrics);

      // Get pipeline value metrics for current user
      const userPipelineMetrics = getPipelineValueMetrics({ 
        assignee: currentUser.id, 
        timeframe: '30d' 
      });
      setPipelineMetrics(userPipelineMetrics);

      // Get win rate metrics for current user
      const userWinRateMetrics = getWinRateMetrics({ 
        assignee: currentUser.id, 
        timeframe: '30d' 
      });
      setWinRateMetrics(userWinRateMetrics);

      // Get lead aging metrics for current user
      const userAgingMetrics = getLeadAgingMetrics({ 
        assignee: currentUser.id, 
        timeframe: '30d' 
      });
      setAgingMetrics(userAgingMetrics);

      // Get contact attempts metrics for current user
      const userContactMetrics = getContactAttemptsMetrics({ 
        assignee: currentUser.id, 
        timeframe: '30d' 
      });
      setContactMetrics(userContactMetrics);

      // Get deal closure time metrics for current user
      const userDealClosureMetrics = getDealClosureTimeMetrics({ 
        assignee: currentUser.id, 
        timeframe: '30d' 
      });
      setDealClosureMetrics(userDealClosureMetrics);

      // Get activity per rep metrics for current user
      const userActivityRepMetrics = getActivityPerRepMetrics({ 
        assignee: currentUser.id, 
        timeframe: '30d' 
      });
      setActivityRepMetrics(userActivityRepMetrics);

      // Get monthly revenue per rep metrics for current user
      const userRevenueMetrics = getMonthlyRevenuePerRepMetrics({ 
        assignee: currentUser.id, 
        timeframe: '30d' 
      });
      setRevenueMetrics(userRevenueMetrics);

      // Get lead engagement summary for current user
      const userEngagementSummary = getLeadEngagementSummary({ 
        assignee: currentUser.id, 
        timeframe: '30d' 
      });
      setEngagementSummary(userEngagementSummary);
    }
  }, [currentUser, currentPeriod, getUserPerformance, getPerformanceTrends, getTeamTimeMetrics, getLeadConversionMetrics, getSalesVelocityMetrics, getPipelineValueMetrics, getWinRateMetrics, getLeadAgingMetrics, getContactAttemptsMetrics, getDealClosureTimeMetrics, getActivityPerRepMetrics, getMonthlyRevenuePerRepMetrics, getLeadEngagementSummary]);
  
  if (!currentUser || !userPerformance) {
    return <div>Loading...</div>;
  }
  
  const userTeam = getTeamByMemberId(currentUser.id);
  const currentUserLeaderboardData = leaderboard.find(u => u.id === currentUser.id);

  // Calculate trend percentages (mock data for demo)
  const revenueTrend = 15; // +15% from last period
  const callsTrend = -5; // -5% from last period
  const meetingsTrend = 20; // +20% from last period
  const dealsTrend = 10; // +10% from last period

  return (
    <div className="bg-gray-50">
      <DashboardHeader />
      
      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Welcome back, {currentUser.name}!
          </h2>
          <p className="text-sm text-gray-600">
            You're currently ranked #{currentUserLeaderboardData?.rank || '-'} this {currentPeriod} with ${userPerformance.revenue.toLocaleString()} in closed deals.
          </p>
        </div>
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Performance Overview
            </button>
            <button
              onClick={() => setActiveTab('time-metrics')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'time-metrics'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Response Time Metrics
            </button>
            <button
              onClick={() => setActiveTab('conversion-velocity')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'conversion-velocity'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Conversion & Velocity
            </button>
            {/* <button
              onClick={() => setActiveTab('pipeline-metrics')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'pipeline-metrics'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pipeline & Win Rate
            </button> */}
            <button
              onClick={() => setActiveTab('advanced-metrics')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'advanced-metrics'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Advanced Lead Metrics
            </button>
            <button
              onClick={() => setActiveTab('deal-activity')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'deal-activity'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Deal & Activity Metrics
            </button>
            {/* <button
              onClick={() => setActiveTab('revenue-engagement')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'revenue-engagement'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Revenue & Engagement
            </button> */}
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Core Performance Metrics */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Core Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                  title="Revenue"
                  // value={userPerformance.revenue}
                  value={'15000'}
                  target={userPerformance.target}
                  // target={45000}
                  icon={DollarSign}
                  format="currency"
                  trend={revenueTrend}
                  color="teal"
                />
                <KPICard
                  title="Calls Made"
                  value={userPerformance.callsMade}
                  target={20} // Weekly target
                  icon={Phone}
                  trend={callsTrend}
                  color="blue"
                />
                <KPICard
                  title="Meetings Booked"
                  // value={userPerformance.meetingsBooked}
                  value={10}
                  target={5} // Weekly target
                  icon={Users}
                  trend={meetingsTrend}
                  color="purple"
                />
                <KPICard
                  title="Deals Closed"
                  // value={userPerformance.dealsClosed}
                  value={3}
                  target={userPerformance.dealsTotal}
                  icon={Target}
                  trend={dealsTrend}
                  color="green"
                />
              </div>
            </div>

            {/* Response Time Metrics */}
            {timeMetrics && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <KPICard
                    title="Avg Time to First Contact"
                    value={timeMetrics.avgTTFC ? `${Math.floor(timeMetrics.avgTTFC / 60)}h ${timeMetrics.avgTTFC % 60}m` : 'No data'}
                    subtitle={`${timeMetrics.contactRate}% contact rate`}
                    icon={Clock}
                    color="indigo"
                  />
                  <KPICard
                    title="Avg Response Time"
                    value={timeMetrics.avgResponseTime ? `${Math.floor(timeMetrics.avgResponseTime / 60)}h ${timeMetrics.avgResponseTime % 60}m` : 'No data'}
                    subtitle={`${timeMetrics.responseRate}% response rate`}
                    icon={MessageCircle}
                    color="pink"
                  />
                </div>
              </div>
            )}

            {/* Conversion & Sales Velocity */}
            {conversionMetrics && velocityMetrics && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion & Sales Velocity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <KPICard
                    title="Lead Conversion Rate"
                    value={`${conversionMetrics.conversionRate?.toFixed(1) || 0}%`}
                    subtitle={`${conversionMetrics.convertedLeads}/${conversionMetrics.totalLeads} leads converted`}
                    icon={Target}
                    color="emerald"
                  />
                  <KPICard
                    title="Sales Velocity"
                    value={velocityMetrics?.formattedVelocity || '$0 per day'}
                    subtitle={`$${velocityMetrics?.monthlyVelocity?.toLocaleString() || 0} monthly`}
                    icon={Zap}
                    color="amber"
                  />
                </div>
              </div>
            )}

            {/* Pipeline Value & Win Rate */}
            {pipelineMetrics && winRateMetrics && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline & Win Rate</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <KPICard
                    title="Pipeline Value"
                    value={pipelineMetrics?.formattedWeightedValue || '$0'}
                    subtitle={`${pipelineMetrics?.activeDealCount || 0} active deals`}
                    icon={DollarSign}
                    color="indigo"
                  />
                  <KPICard
                    title="Win Rate"
                    value={winRateMetrics?.formattedWinRate || '0%'}
                    subtitle={`${winRateMetrics?.dealsWon || 0}/${winRateMetrics?.closedDeals || 0} deals won`}
                    icon={Target}
                    color="purple"
                  />
                </div>
              </div>
            )}

            {/* Advanced Lead Metrics */}
            {agingMetrics && contactMetrics && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Lead Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <KPICard
                    title="Average Lead Age"
                    value={agingMetrics?.formattedAverageAge || '0 days'}
                    subtitle={`${agingMetrics?.criticalLeads?.length || 0} critical leads`}
                    icon={Clock}
                    color="red"
                  />
                  <KPICard
                    title="Contact Attempts"
                    value={contactMetrics?.formattedAverage || '0 attempts per lead'}
                    subtitle={`${contactMetrics?.contactEfficiency || 0}% response rate`}
                    icon={Phone}
                    color="green"
                  />
                </div>
              </div>
            )}

            {/* Deal & Activity Metrics */}
            {dealClosureMetrics && activityRepMetrics && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Deal & Activity Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <KPICard
                    title="Average Deal Closure Time"
                    value={dealClosureMetrics?.formattedAverageTime || '0 days'}
                    subtitle={`${dealClosureMetrics?.closedDeals || 0} deals closed`}
                    icon={Clock}
                    color="blue"
                  />
                  <KPICard
                    title="Activity per Rep"
                    value={activityRepMetrics?.formattedAverage || '0 activities per rep'}
                    subtitle={`${activityRepMetrics?.totalActivities || 0} total activities`}
                    icon={BarChart3}
                    color="orange"
                  />
                </div>
              </div>
            )}

            {/* Revenue & Engagement Metrics */}
            {revenueMetrics && engagementSummary && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue & Engagement Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <KPICard
                    title="Monthly Revenue"
                    value={revenueMetrics?.formattedAverage || '$0 per month'}
                    subtitle={`${revenueMetrics?.totalReps || 0} active reps`}
                    icon={DollarSign}
                    color="green"
                  />
                  <KPICard
                    title="Engagement Health"
                    value={`${engagementSummary?.healthScore || 0}/100`}
                    subtitle={engagementSummary?.healthCategory?.label || 'No data'}
                    icon={TrendingUp}
                    color={engagementSummary?.healthScore >= 80 ? 'green' : engagementSummary?.healthScore >= 60 ? 'yellow' : 'red'}
                  />
                  <KPICard
                    title="Stale Leads"
                    value={engagementSummary?.staleRate || '0%'}
                    subtitle={`${engagementSummary?.criticalIssues || 0} critical issues`}
                    icon={Clock}
                    color="orange"
                  />
                  <KPICard
                    title="Re-engagement Rate"
                    value={engagementSummary?.reengagementRate || '0%'}
                    subtitle="Cold lead recovery"
                    icon={RefreshCw}
                    color="blue"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'time-metrics' && (
          <div className="mb-8">
            <TimeMetricsDashboard 
              teamMemberIds={[currentUser.id]} 
              showIndividualBreakdown={false}
            />
          </div>
        )}

        {activeTab === 'conversion-velocity' && (
          <div className="mb-8">
            <ConversionMetricsDashboard 
              teamMemberIds={[currentUser.id]} 
              showIndividualBreakdown={false}
            />
          </div>
        )}

        {activeTab === 'pipeline-metrics' && (
          <div className="mb-8">
            <PipelineMetricsDashboard 
              teamMemberIds={[currentUser.id]} 
              showIndividualBreakdown={false}
              defaultTimeframe="30d"
            />
          </div>
        )}

        {activeTab === 'advanced-metrics' && (
          <div className="mb-8">
            <AdvancedLeadMetricsDashboard 
              teamMemberIds={[currentUser.id]} 
              showIndividualBreakdown={false}
              defaultTimeframe="30d"
            />
          </div>
        )}

        {activeTab === 'deal-activity' && (
          <div className="mb-8">
            <DealActivityMetricsDashboard 
              teamMemberIds={[currentUser.id]} 
              showIndividualBreakdown={false}
              defaultTimeframe="30d"
            />
          </div>
        )}

        {activeTab === 'revenue-engagement' && (
          <div className="mb-8">
            <RevenueEngagementMetricsDashboard 
              teamMemberIds={[currentUser.id]} 
              showIndividualBreakdown={false}
              defaultTimeframe="30d"
            />
          </div>
        )}
        
        {activeTab === 'overview' && (
          /* Main Content Grid */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Leaderboard - Takes 2 columns */}
            <div className="lg:col-span-2">
              <Leaderboard 
                data={leaderboard} 
                currentUserId={currentUser.id}
                showFullList={false}
              />
            </div>
            
            {/* Performance Tips - Takes 1 column */}
            <div className="lg:col-span-1">
              <PerformanceTips userId={currentUser.id} />
            </div>
          </div>
        )}
        
        {activeTab === 'overview' && (
          /* Performance Summary */
          <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance Summary</h3>
            <Award className="w-5 h-5 text-teal-600" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">
                  {userPerformance.conversionRate.toFixed(1)}%
                </p>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Pipeline</p>
              <p className="text-2xl font-bold text-gray-900">
                ${userPerformance.activePipeline.toLocaleString()}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1">Team Target Achievement</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">
                  {userPerformance.achievement.toFixed(0)}%
                </p>
                {userPerformance.isOnTrack && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    On Track
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-600">Team: </span>
                <span className="font-medium text-gray-900">{userTeam?.name || 'No Team'}</span>
              </div>
              <div>
                <span className="text-gray-600">Location: </span>
                <span className="font-medium text-gray-900">{currentUser.location}</span>
              </div>
              <div>
                <span className="text-gray-600">This {currentPeriod}'s rank: </span>
                <span className="font-medium text-teal-600">#{currentUserLeaderboardData?.rank || '-'}</span>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceModule;