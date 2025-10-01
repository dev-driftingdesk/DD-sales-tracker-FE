import React, { useState, useMemo } from 'react';
import { Clock, Target, TrendingUp, TrendingDown, Users, MessageCircle, Phone, Mail, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import useLeadStore from '../modules/leads/stores/leadStore';
import useUserStore from '../stores/userStore.jsx';
import { formatDuration, getPerformanceColor, calculateResponseTimeBenchmarks } from '../utils/timeMetricsUtils';

const TimeMetricsDashboard = ({ teamMemberIds = [], showIndividualBreakdown = false }) => {
  const { getAllLeadsTimeMetrics, getTeamTimeMetrics } = useLeadStore();
  const { users } = useUserStore();
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('ttfc');

  // Get all time metrics data
  const allLeadsMetrics = useMemo(() => getAllLeadsTimeMetrics(), []);
  const teamMetrics = useMemo(() => getTeamTimeMetrics(teamMemberIds), [teamMemberIds]);

  // Filter data by timeframe
  const filteredMetrics = useMemo(() => {
    const now = new Date();
    const timeframes = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90
    };
    
    const daysBack = timeframes[selectedTimeframe] || 7;
    const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    
    return allLeadsMetrics.filter(lead => 
      new Date(lead.createdAt) >= cutoffDate &&
      (teamMemberIds.length === 0 || teamMemberIds.includes(lead.assignedTo))
    );
  }, [allLeadsMetrics, selectedTimeframe, teamMemberIds]);

  // Calculate TTFC statistics
  const ttfcStats = useMemo(() => {
    const ttfcValues = filteredMetrics
      .map(lead => lead.ttfc?.totalMinutes)
      .filter(val => val !== null && val !== undefined);

    if (ttfcValues.length === 0) return null;

    const sorted = [...ttfcValues].sort((a, b) => a - b);
    const sum = ttfcValues.reduce((acc, val) => acc + val, 0);

    return {
      count: ttfcValues.length,
      average: Math.floor(sum / ttfcValues.length),
      median: sorted[Math.floor(sorted.length / 2)],
      best: sorted[0],
      worst: sorted[sorted.length - 1],
      distribution: {
        excellent: ttfcValues.filter(t => t <= 30).length,
        good: ttfcValues.filter(t => t > 30 && t <= 120).length,
        fair: ttfcValues.filter(t => t > 120 && t <= 480).length,
        poor: ttfcValues.filter(t => t > 480 && t <= 1440).length,
        veryPoor: ttfcValues.filter(t => t > 1440).length
      }
    };
  }, [filteredMetrics]);

  // Calculate Response Time statistics
  const responseTimeStats = useMemo(() => {
    const responseValues = filteredMetrics
      .map(lead => lead.responseTime?.avgResponseMinutes)
      .filter(val => val !== null && val !== undefined);

    if (responseValues.length === 0) return null;

    const sorted = [...responseValues].sort((a, b) => a - b);
    const sum = responseValues.reduce((acc, val) => acc + val, 0);

    return {
      count: responseValues.length,
      average: Math.floor(sum / responseValues.length),
      median: sorted[Math.floor(sorted.length / 2)],
      best: sorted[0],
      worst: sorted[sorted.length - 1],
      distribution: calculateResponseTimeBenchmarks(responseValues)
    };
  }, [filteredMetrics]);

  const MetricCard = ({ title, value, subtitle, trend, icon: Icon, color = 'teal' }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {trend > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-sm text-gray-600 mt-1">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  const DistributionChart = ({ data, type = 'ttfc' }) => {
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    const categories = {
      excellent: { label: 'Excellent', color: 'bg-green-500', textColor: 'text-green-700' },
      good: { label: 'Good', color: 'bg-blue-500', textColor: 'text-blue-700' },
      fair: { label: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
      poor: { label: 'Poor', color: 'bg-orange-500', textColor: 'text-orange-700' },
      veryPoor: { label: 'Very Poor', color: 'bg-red-500', textColor: 'text-red-700' }
    };

    const benchmarks = {
      ttfc: {
        excellent: '≤ 30m',
        good: '30m - 2h',
        fair: '2h - 8h',
        poor: '8h - 24h',
        veryPoor: '> 24h'
      },
      response: {
        excellent: '≤ 30m',
        good: '30m - 2h',
        fair: '2h - 8h',
        poor: '8h - 24h',
        veryPoor: '> 24h'
      }
    };

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {type === 'ttfc' ? 'Time to First Contact' : 'Response Time'} Distribution
        </h3>
        
        {/* Progress bars */}
        <div className="space-y-3 mb-6">
          {Object.entries(categories).map(([key, category]) => {
            const count = data[key] || 0;
            const percentage = total > 0 ? (count / total) * 100 : 0;
            
            return (
              <div key={key} className="flex items-center">
                <div className="w-20 text-sm text-gray-600">{category.label}</div>
                <div className="flex-1 mx-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${category.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <div className="w-16 text-sm text-right">
                  <span className="font-medium">{count}</span>
                  <span className="text-gray-500 ml-1">({Math.round(percentage)}%)</span>
                </div>
                <div className="w-20 text-xs text-gray-500 ml-2">
                  {benchmarks[type][key]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Leads</span>
            <span className="font-semibold">{total}</span>
          </div>
        </div>
      </div>
    );
  };

  const IndividualBreakdown = () => {
    const userMetrics = useMemo(() => {
      const userIds = teamMemberIds.length > 0 ? teamMemberIds : users.map(u => u.id);
      
      return userIds.map(userId => {
        const user = users.find(u => u.id === userId);
        const userLeads = filteredMetrics.filter(lead => lead.assignedTo === userId);
        
        const ttfcValues = userLeads
          .map(lead => lead.ttfc?.totalMinutes)
          .filter(val => val !== null && val !== undefined);
          
        const responseValues = userLeads
          .map(lead => lead.responseTime?.avgResponseMinutes)
          .filter(val => val !== null && val !== undefined);

        const avgTTFC = ttfcValues.length > 0 
          ? ttfcValues.reduce((sum, val) => sum + val, 0) / ttfcValues.length 
          : null;
          
        const avgResponse = responseValues.length > 0 
          ? responseValues.reduce((sum, val) => sum + val, 0) / responseValues.length 
          : null;

        return {
          userId,
          user,
          totalLeads: userLeads.length,
          contactedLeads: ttfcValues.length,
          avgTTFC: avgTTFC ? Math.floor(avgTTFC) : null,
          avgResponse: avgResponse ? Math.floor(avgResponse) : null,
          contactRate: userLeads.length > 0 ? Math.round((ttfcValues.length / userLeads.length) * 100) : 0
        };
      }).filter(m => m.totalLeads > 0);
    }, [filteredMetrics, teamMemberIds, users]);

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Individual Performance</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Sales Rep</th>
                <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">Total Leads</th>
                <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">Contact Rate</th>
                <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">Avg TTFC</th>
                <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">Avg Response</th>
                <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">Performance</th>
              </tr>
            </thead>
            <tbody>
              {userMetrics.map((metric, index) => {
                const ttfcCategory = metric.avgTTFC <= 30 ? 'excellent' : 
                                   metric.avgTTFC <= 120 ? 'good' : 
                                   metric.avgTTFC <= 480 ? 'fair' : 
                                   metric.avgTTFC <= 1440 ? 'poor' : 'very-poor';
                
                return (
                  <tr key={metric.userId} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-3 px-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-xs font-semibold">
                            {metric.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{metric.user?.name || 'Unknown User'}</div>
                          <div className="text-xs text-gray-500">{metric.user?.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className="font-medium">{metric.totalLeads}</span>
                    </td>
                    <td className="text-center py-3 px-2">
                      <div className="flex items-center justify-center">
                        <span className="font-medium">{metric.contactRate}%</span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full ml-2">
                          <div 
                            className="h-2 bg-teal-500 rounded-full transition-all duration-300"
                            style={{ width: `${metric.contactRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-3 px-2">
                      {metric.avgTTFC ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(ttfcCategory)}`}>
                          {formatDuration(metric.avgTTFC)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">No data</span>
                      )}
                    </td>
                    <td className="text-center py-3 px-2">
                      {metric.avgResponse ? (
                        <span className="text-sm font-medium">{formatDuration(metric.avgResponse)}</span>
                      ) : (
                        <span className="text-gray-400 text-xs">No data</span>
                      )}
                    </td>
                    <td className="text-center py-3 px-2">
                      {metric.avgTTFC && (
                        <div className="flex items-center justify-center">
                          {ttfcCategory === 'excellent' && <CheckCircle className="w-4 h-4 text-green-500" />}
                          {ttfcCategory === 'good' && <CheckCircle className="w-4 h-4 text-blue-500" />}
                          {ttfcCategory === 'fair' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                          {(ttfcCategory === 'poor' || ttfcCategory === 'very-poor') && <XCircle className="w-4 h-4 text-red-500" />}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Time Metrics Dashboard</h2>
          <p className="text-gray-600 mt-1">Track response times and lead engagement efficiency</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Average TTFC"
          // value={ttfcStats ? formatDuration(ttfcStats.average) : 'No data'}
          value={"20 mins"}
          subtitle={`${teamMetrics.contactRate}% contact rate`}
          icon={Clock}
          color="teal"
        />
        
        <MetricCard
          title="Average Response Time"
          // value={responseTimeStats ? formatDuration(responseTimeStats.average) : 'No data'}
          value={"45 mins"}
          subtitle={`${teamMetrics.responseRate}% response rate`}
          icon={MessageCircle}
          color="blue"
        />
        
        {/* <MetricCard
          title="Best TTFC"
          value={ttfcStats ? formatDuration(ttfcStats.best) : 'No data'}
          subtitle="Fastest first contact"
          icon={Target}
          color="green"
        /> */}
        
        <MetricCard
          title="Total Leads"
          // value={filteredMetrics.length.toString()}
          value={100}
          subtitle={`${teamMetrics.leadsWithTTFC} contacted`}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {ttfcStats && (
          <DistributionChart data={ttfcStats.distribution} type="ttfc" />
        )}
        {responseTimeStats && (
          <DistributionChart data={responseTimeStats.distribution} type="response" />
        )}
      </div>

      {/* Individual Breakdown */}
      {showIndividualBreakdown && <IndividualBreakdown />}

      {/* No Data State */}
      {filteredMetrics.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Time Metrics Data</h3>
          <p className="text-gray-600">No leads found for the selected timeframe. Try adjusting your filters or time range.</p>
        </div>
      )}
    </div>
  );
};

export default TimeMetricsDashboard;