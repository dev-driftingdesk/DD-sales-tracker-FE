import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Mail, MailOpen, Reply, MousePointer, Calendar, Filter } from 'lucide-react';
import useEmailStore from '../stores/emailStore';

const EmailAnalytics = () => {
  const { getEmailAnalytics, getEmailStats, templates, emails } = useEmailStore();
  const [timeframe, setTimeframe] = useState('30d');
  
  const analytics = useMemo(() => getEmailAnalytics(timeframe), [timeframe, getEmailAnalytics]);
  const overallStats = useMemo(() => getEmailStats(), [getEmailStats]);

  const timeframeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  const getPerformanceColor = (rate, type) => {
    let thresholds;
    switch (type) {
      case 'open':
        thresholds = { excellent: 25, good: 20, fair: 15 };
        break;
      case 'reply':
        thresholds = { excellent: 10, good: 7, fair: 5 };
        break;
      case 'click':
        thresholds = { excellent: 5, good: 3, fair: 2 };
        break;
      default:
        thresholds = { excellent: 20, good: 15, fair: 10 };
    }

    if (rate >= thresholds.excellent) return 'text-green-600 bg-green-50';
    if (rate >= thresholds.good) return 'text-blue-600 bg-blue-50';
    if (rate >= thresholds.fair) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getPerformanceLabel = (rate, type) => {
    let thresholds;
    switch (type) {
      case 'open':
        thresholds = { excellent: 25, good: 20, fair: 15 };
        break;
      case 'reply':
        thresholds = { excellent: 10, good: 7, fair: 5 };
        break;
      case 'click':
        thresholds = { excellent: 5, good: 3, fair: 2 };
        break;
      default:
        thresholds = { excellent: 20, good: 15, fair: 10 };
    }

    if (rate >= thresholds.excellent) return 'Excellent';
    if (rate >= thresholds.good) return 'Good';
    if (rate >= thresholds.fair) return 'Fair';
    return 'Needs Improvement';
  };

  // Calculate template performance
  const templatePerformance = useMemo(() => {
    const templateEmails = emails.filter(email => 
      email.templateUsed && email.status === 'sent'
    );

    const performance = {};
    
    templateEmails.forEach(email => {
      const templateName = email.templateUsed;
      if (!performance[templateName]) {
        performance[templateName] = {
          sent: 0,
          opened: 0,
          replied: 0,
          clicked: 0
        };
      }
      
      performance[templateName].sent++;
      if (email.tracking?.opened) performance[templateName].opened++;
      if (email.tracking?.replied) performance[templateName].replied++;
      if (email.tracking?.clickedLinks?.length > 0) performance[templateName].clicked++;
    });

    // Calculate rates
    return Object.entries(performance).map(([name, stats]) => ({
      name,
      sent: stats.sent,
      openRate: stats.sent > 0 ? (stats.opened / stats.sent) * 100 : 0,
      replyRate: stats.sent > 0 ? (stats.replied / stats.sent) * 100 : 0,
      clickRate: stats.sent > 0 ? (stats.clicked / stats.sent) * 100 : 0
    })).sort((a, b) => b.openRate - a.openRate);
  }, [emails]);

  // Calculate daily performance for the chart
  const dailyPerformance = useMemo(() => {
    if (!analytics.performanceData) return [];
    
    return Object.entries(analytics.performanceData)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sent: data.sent,
        opened: data.opened,
        replied: data.replied,
        openRate: data.sent > 0 ? (data.opened / data.sent) * 100 : 0,
        replyRate: data.sent > 0 ? (data.replied / data.sent) * 100 : 0
      }));
  }, [analytics.performanceData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Email Analytics</h2>
          <p className="text-sm text-gray-600">Track email performance and engagement metrics</p>
        </div>
        
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {timeframeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Emails Sent</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.stats?.totalSent || 0}</p>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Total: {overallStats.totalEmails} emails
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <MailOpen className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Open Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.stats?.openRate?.toFixed(1) || 0}%
              </p>
            </div>
          </div>
          <div className={`text-xs px-2 py-1 rounded ${getPerformanceColor(analytics.stats?.openRate || 0, 'open')}`}>
            {getPerformanceLabel(analytics.stats?.openRate || 0, 'open')}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Reply className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Reply Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.stats?.replyRate?.toFixed(1) || 0}%
              </p>
            </div>
          </div>
          <div className={`text-xs px-2 py-1 rounded ${getPerformanceColor(analytics.stats?.replyRate || 0, 'reply')}`}>
            {getPerformanceLabel(analytics.stats?.replyRate || 0, 'reply')}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <MousePointer className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Click Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.stats?.clickRate?.toFixed(1) || 0}%
              </p>
            </div>
          </div>
          <div className={`text-xs px-2 py-1 rounded ${getPerformanceColor(analytics.stats?.clickRate || 0, 'click')}`}>
            {getPerformanceLabel(analytics.stats?.clickRate || 0, 'click')}
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Email Performance Over Time</h3>
        </div>
        
        {dailyPerformance.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2 text-xs text-gray-500 font-medium">
              <div>Date</div>
              <div>Sent</div>
              <div>Opened</div>
              <div>Replied</div>
              <div>Open Rate</div>
              <div>Reply Rate</div>
              <div>Performance</div>
            </div>
            
            {dailyPerformance.slice(-14).map((day, index) => (
              <div key={index} className="grid grid-cols-7 gap-2 py-2 border-b border-gray-100">
                <div className="text-sm text-gray-900">{day.date}</div>
                <div className="text-sm text-gray-600">{day.sent}</div>
                <div className="text-sm text-gray-600">{day.opened}</div>
                <div className="text-sm text-gray-600">{day.replied}</div>
                <div className="text-sm font-medium text-gray-900">{day.openRate.toFixed(1)}%</div>
                <div className="text-sm font-medium text-gray-900">{day.replyRate.toFixed(1)}%</div>
                <div className="flex gap-1">
                  <div className={`w-2 h-2 rounded-full ${day.openRate > 20 ? 'bg-green-400' : day.openRate > 15 ? 'bg-yellow-400' : 'bg-red-400'}`} title="Open Rate" />
                  <div className={`w-2 h-2 rounded-full ${day.replyRate > 5 ? 'bg-green-400' : day.replyRate > 3 ? 'bg-yellow-400' : 'bg-red-400'}`} title="Reply Rate" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No performance data available for selected timeframe</p>
          </div>
        )}
      </div>

      {/* Template Performance */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Template Performance</h3>
        </div>
        
        {templatePerformance.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-2 text-xs text-gray-500 font-medium">
              <div className="col-span-2">Template Name</div>
              <div>Sent</div>
              <div>Open Rate</div>
              <div>Reply Rate</div>
              <div>Performance</div>
            </div>
            
            {templatePerformance.map((template, index) => (
              <div key={index} className="grid grid-cols-6 gap-2 py-3 border-b border-gray-100">
                <div className="col-span-2 text-sm font-medium text-gray-900 truncate">
                  {template.name}
                </div>
                <div className="text-sm text-gray-600">{template.sent}</div>
                <div className="text-sm font-medium text-gray-900">
                  {template.openRate.toFixed(1)}%
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {template.replyRate.toFixed(1)}%
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 text-xs rounded ${getPerformanceColor(template.openRate, 'open')}`}>
                    {getPerformanceLabel(template.openRate, 'open')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No template performance data available</p>
            <p className="text-sm text-gray-500 mt-1">Start using templates to see performance metrics</p>
          </div>
        )}
      </div>

      {/* Insights and Recommendations */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
        
        <div className="space-y-4">
          {/* Open Rate Insights */}
          {analytics.stats?.openRate < 15 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-sm font-medium text-red-900 mb-2">Low Open Rate Alert</h4>
              <p className="text-sm text-red-700">
                Your open rate ({analytics.stats?.openRate?.toFixed(1)}%) is below industry average (20-25%). 
                Consider improving your subject lines, sender name, or send timing.
              </p>
            </div>
          )}

          {/* Reply Rate Insights */}
          {analytics.stats?.replyRate < 5 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-900 mb-2">Low Reply Rate</h4>
              <p className="text-sm text-yellow-700">
                Your reply rate ({analytics.stats?.replyRate?.toFixed(1)}%) could be improved. 
                Try personalizing your emails more or including clearer calls-to-action.
              </p>
            </div>
          )}

          {/* Success Insights */}
          {analytics.stats?.openRate >= 25 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm font-medium text-green-900 mb-2">Excellent Open Rate!</h4>
              <p className="text-sm text-green-700">
                Your open rate ({analytics.stats?.openRate?.toFixed(1)}%) is excellent! 
                Keep using the same subject line strategies and sender practices.
              </p>
            </div>
          )}

          {/* General Recommendations */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Recommendations</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Test different subject lines to improve open rates</li>
              <li>• Send emails during peak engagement hours (9-11 AM or 2-4 PM)</li>
              <li>• Use personalization variables in your templates</li>
              <li>• Follow up with non-responders after 3-5 days</li>
              <li>• Keep email body concise and include clear call-to-action</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailAnalytics;