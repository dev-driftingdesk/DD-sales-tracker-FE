import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Phone, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Filter,
  Info,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import useLeadStore from '../modules/leads/stores/leadStore';
import { 
  getAgeCategory, 
  getContactAttemptsCategory, 
  formatDuration 
} from '../utils/leadAgingMetricsUtils';

const AdvancedLeadMetricsDashboard = ({ 
  teamMemberIds = [], 
  showIndividualBreakdown = true,
  defaultTimeframe = '30d',
  showFilters = true 
}) => {
  const { 
    getLeadAgingMetrics, 
    getContactAttemptsMetrics, 
    getStageConversionMetrics,
    getLeadAgingAnalysis 
  } = useLeadStore();
  
  const [timeframe, setTimeframe] = useState(defaultTimeframe);
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [activeView, setActiveView] = useState('overview');
  
  const [agingData, setAgingData] = useState(null);
  const [contactData, setContactData] = useState(null);
  const [conversionData, setConversionData] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  
  const filterOptions = {
    timeframe,
    assignee: selectedAssignee,
    stage: selectedStage,
    source: selectedSource
  };

  useEffect(() => {
    // Fetch lead aging metrics
    const aging = getLeadAgingMetrics(filterOptions);
    setAgingData(aging);

    // Fetch contact attempts metrics
    const contact = getContactAttemptsMetrics(filterOptions);
    setContactData(contact);

    // Fetch stage conversion metrics
    const conversion = getStageConversionMetrics(filterOptions);
    setConversionData(conversion);

    // Get comprehensive analysis
    const analysis = getLeadAgingAnalysis(filterOptions);
    setAnalysisData(analysis);
  }, [timeframe, selectedAssignee, selectedStage, selectedSource, getLeadAgingMetrics, getContactAttemptsMetrics, getStageConversionMetrics, getLeadAgingAnalysis]);

  if (!agingData || !contactData || !conversionData) {
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

  const averageAgeCategory = getAgeCategory(agingData.averageAge);
  const contactAttemptsCategory = getContactAttemptsCategory(contactData.averageAttempts);

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Advanced Lead Metrics</h2>
            <p className="text-purple-100">
              Track lead aging, contact attempts, and stage conversion performance
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Clock className="w-8 h-8 text-white opacity-80" />
            <Phone className="w-8 h-8 text-white opacity-80" />
            <TrendingUp className="w-8 h-8 text-white opacity-80" />
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
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All assignees</option>
                <option value="user-1">Sales Rep 1</option>
                <option value="user-2">Sales Rep 2</option>
                <option value="user-3">Sales Rep 3</option>
              </select>

              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All stages</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>

              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All sources</option>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="facebook">Facebook</option>
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
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView('aging')}
            className={`px-6 py-3 text-sm font-medium ${
              activeView === 'aging'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Lead Aging
          </button>
          <button
            onClick={() => setActiveView('contact-attempts')}
            className={`px-6 py-3 text-sm font-medium ${
              activeView === 'contact-attempts'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Contact Attempts
          </button>
          <button
            onClick={() => setActiveView('conversions')}
            className={`px-6 py-3 text-sm font-medium ${
              activeView === 'conversions'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Stage Conversions
          </button>
          <button
            onClick={() => setActiveView('insights')}
            className={`px-6 py-3 text-sm font-medium ${
              activeView === 'insights'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Insights & Actions
          </button>
        </div>

        <div className="p-6">
          {activeView === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Average Lead Age */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 mb-1">Average Lead Age</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {agingData.formattedAverageAge}
                      </p>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${averageAgeCategory.color}`}>
                        {averageAgeCategory.label}
                      </div>
                    </div>
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                {/* Average Stage Age */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600 mb-1">Average Stage Age</p>
                      <p className="text-2xl font-bold text-green-900">
                        {agingData.formattedAverageStageAge}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Time in current stage
                      </p>
                    </div>
                    <Activity className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                {/* Contact Attempts */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-6 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 mb-1">Avg Contact Attempts</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {contactData.averageAttempts}
                      </p>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${contactAttemptsCategory.color}`}>
                        {contactAttemptsCategory.label}
                      </div>
                    </div>
                    <Phone className="w-8 h-8 text-purple-600" />
                  </div>
                </div>

                {/* Overall Conversion Rate */}
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-6 border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-600 mb-1">Overall Conversion</p>
                      <p className="text-2xl font-bold text-amber-900">
                        {conversionData.formattedOverallRate}
                      </p>
                      <p className="text-xs text-amber-600 mt-1">
                        New to Won
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-amber-600" />
                  </div>
                </div>
              </div>

              {/* Quick Summary Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lead Health Summary */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Activity className="w-5 h-5 text-purple-600 mr-2" />
                    Lead Health Summary
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Leads</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {agingData.totalLeads}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Critical Leads</span>
                      <span className="text-sm font-semibold text-red-600">
                        {agingData.criticalLeads.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Contacted Leads</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {contactData.contactedLeads}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Response Rate</span>
                      <span className="text-sm font-semibold text-green-600">
                        {contactData.contactEfficiency}%
                      </span>
                    </div>
                    {analysisData && analysisData.summary && (
                      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                        <span className="text-sm text-gray-600">Health Score</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-purple-600">
                            {analysisData.summary.healthScore}/100
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Age Distribution */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Age Distribution</h4>
                  <div className="space-y-3">
                    {Object.entries(agingData.ageDistribution).map(([range, count]) => {
                      const percentage = agingData.totalLeads > 0 ? (count / agingData.totalLeads) * 100 : 0;
                      return (
                        <div key={range} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-700">
                              {range === '60+' ? '60+ days' : `${range} days`}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-8 text-right">
                              {count}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'aging' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900">Lead Aging Analysis</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Track how long leads stay in each stage and identify aging patterns. 
                      Fresh leads (≤7 days) convert best, while critical leads (45+ days) need immediate attention.
                    </p>
                  </div>
                </div>
              </div>

              {/* Stage Aging Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Aging by Stage</h4>
                  <div className="space-y-4">
                    {Object.entries(agingData.stageAging).map(([stage, data]) => (
                      <div key={stage} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {stage.replace('-', ' ')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {data.leadCount} leads
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Stage Age: </span>
                            <span className="font-semibold text-blue-600">
                              {formatDuration(data.averageStageAge)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Total Age: </span>
                            <span className="font-semibold text-purple-600">
                              {formatDuration(data.averageTotalAge)}
                            </span>
                          </div>
                        </div>
                        {data.staleLeads > 0 && (
                          <div className="flex items-center space-x-2 text-xs">
                            <AlertCircle className="w-3 h-3 text-orange-600" />
                            <span className="text-orange-600">
                              {data.staleLeads} stale ({data.criticalLeads} critical)
                            </span>
                          </div>
                        )}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              data.averageStageAge > 21 ? 'bg-red-500' :
                              data.averageStageAge > 14 ? 'bg-orange-500' :
                              data.averageStageAge > 7 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(100, (data.averageStageAge / 30) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Critical Leads */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    Critical Leads
                  </h4>
                  {agingData.criticalLeads.length > 0 ? (
                    <div className="space-y-3">
                      {agingData.criticalLeads.slice(0, 8).map((lead) => (
                        <div key={lead.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {lead.company}
                            </p>
                            <p className="text-xs text-gray-600">
                              {lead.status} • {formatDuration(lead.totalAge)} old
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-red-600">
                              {formatDuration(lead.stageAge)}
                            </p>
                            <p className="text-xs text-gray-500">in stage</p>
                          </div>
                        </div>
                      ))}
                      {agingData.criticalLeads.length > 8 && (
                        <p className="text-sm text-gray-500 text-center mt-3">
                          +{agingData.criticalLeads.length - 8} more critical leads
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-600">No critical leads found</p>
                      <p className="text-xs text-gray-500 mt-1">Great job keeping leads moving!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeView === 'contact-attempts' && (
            <div className="space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-purple-900">Contact Attempts Analysis</h4>
                    <p className="text-sm text-purple-700 mt-1">
                      Track outreach efforts and response rates. Industry best practice is 5-8 contact attempts 
                      with response rates above 30% indicating good messaging and timing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Metrics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attempts Distribution */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Attempts Distribution</h4>
                  <div className="space-y-3">
                    {Object.entries(contactData.attemptsDistribution).map(([range, count]) => {
                      const percentage = contactData.totalLeads > 0 ? (count / contactData.totalLeads) * 100 : 0;
                      return (
                        <div key={range} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-700">
                              {range === '10+' ? '10+ attempts' : 
                               range === '0' ? 'No contact' : `${range} attempts`}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  range === '0' ? 'bg-red-500' :
                                  range === '1-2' ? 'bg-orange-500' :
                                  range === '3-5' ? 'bg-yellow-500' :
                                  range === '6-10' ? 'bg-blue-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-8 text-right">
                              {count}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Performance by Assignee */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance by Assignee</h4>
                  <div className="space-y-4">
                    {Object.entries(contactData.byAssignee).map(([assigneeId, data]) => (
                      <div key={assigneeId} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Sales Rep {assigneeId.split('-')[1]}
                          </span>
                          <span className="text-sm font-bold text-purple-600">
                            {data.averageAttempts} avg attempts
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                          <div>
                            <span>Response Rate: </span>
                            <span className={`font-semibold ${
                              data.responseRate > 30 ? 'text-green-600' : 
                              data.responseRate > 20 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {data.responseRate}%
                            </span>
                          </div>
                          <div>
                            <span>Efficiency: </span>
                            <span className="font-semibold text-blue-600">
                              {data.efficiency}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance by Source */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance by Source</h4>
                  <div className="space-y-3">
                    {Object.entries(contactData.bySource).map(([source, data]) => (
                      <div key={source} className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {source}
                          </span>
                          <p className="text-xs text-gray-500">
                            {data.leadCount} leads
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {data.averageAttempts} attempts
                          </p>
                          <p className="text-xs text-green-600">
                            {data.responseRate}% response
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Efficiency Summary */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Efficiency</h4>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 mb-3">
                        <span className="text-2xl font-bold text-purple-900">
                          {contactData.contactEfficiency}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Overall Response Rate</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {contactData.contactedLeads}
                        </p>
                        <p className="text-gray-600">Contacted</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {contactData.respondedLeads}
                        </p>
                        <p className="text-gray-600">Responded</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'conversions' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-green-900">Stage Conversion Analysis</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Track progression through your sales funnel and identify conversion bottlenecks. 
                      High drop-off rates indicate stages that need process improvements.
                    </p>
                  </div>
                </div>
              </div>

              {/* Conversion Funnel */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-6">Conversion Funnel</h4>
                <div className="space-y-4">
                  {conversionData.conversionFunnel.map((stage, index) => {
                    const isLast = index === conversionData.conversionFunnel.length - 1;
                    const widthPercentage = conversionData.conversionFunnel.length > 0 
                      ? (stage.leadCount / conversionData.conversionFunnel[0].leadCount) * 100 
                      : 0;
                    
                    return (
                      <div key={stage.stage} className="relative">
                        <div className="flex items-center space-x-4">
                          <div className="w-32">
                            <p className="text-sm font-medium text-gray-700">
                              {stage.stageLabel}
                            </p>
                          </div>
                          <div className="flex-1">
                            <div className="relative">
                              <div className="w-full bg-gray-200 rounded-full h-8 flex items-center">
                                <div 
                                  className={`h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                                    stage.conversionRate > 70 ? 'bg-green-500' :
                                    stage.conversionRate > 50 ? 'bg-blue-500' :
                                    stage.conversionRate > 30 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.max(widthPercentage, 10)}%` }}
                                >
                                  {stage.leadCount}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="w-20 text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              {stage.conversionRate.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        {!isLast && stage.dropOff > 0 && (
                          <div className="ml-36 mt-1">
                            <p className="text-xs text-red-600">
                              -{stage.dropOff} leads dropped off
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stage-to-Stage Conversions */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Stage-to-Stage Conversions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.values(conversionData.stageConversions).map((conversion) => (
                    <div key={`${conversion.fromStage}_${conversion.toStage}`} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">
                            {conversion.fromStageLabel}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="text-sm font-medium text-gray-700">
                            {conversion.toStageLabel}
                          </span>
                        </div>
                        <span className={`text-sm font-bold ${
                          conversion.conversionRate > 70 ? 'text-green-600' :
                          conversion.conversionRate > 50 ? 'text-blue-600' :
                          conversion.conversionRate > 30 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {conversion.conversionRate}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {conversion.leadsReachingToStage} of {conversion.leadsInFromStage} leads converted
                        {conversion.dropOffCount > 0 && (
                          <span className="text-red-600 ml-2">
                            ({conversion.dropOffCount} dropped off)
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full ${
                            conversion.conversionRate > 70 ? 'bg-green-500' :
                            conversion.conversionRate > 50 ? 'bg-blue-500' :
                            conversion.conversionRate > 30 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${conversion.conversionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Drop-off Analysis */}
              {Object.keys(conversionData.dropOffAnalysis).length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    High Drop-off Stages
                  </h4>
                  <div className="space-y-3">
                    {Object.values(conversionData.dropOffAnalysis).map((dropOff) => (
                      <div key={dropOff.stage} className={`p-4 rounded-lg border ${
                        dropOff.severity === 'critical' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {dropOff.stage}
                            </p>
                            <p className="text-xs text-gray-600">
                              {dropOff.dropOffCount} leads lost at this stage
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              dropOff.severity === 'critical' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {dropOff.dropOffRate}% drop-off
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeView === 'insights' && analysisData && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900">AI-Powered Insights</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Automated analysis of your lead metrics with actionable recommendations 
                      to improve performance and conversion rates.
                    </p>
                  </div>
                </div>
              </div>

              {/* Health Score Card */}
              {analysisData.summary && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 mb-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-900">
                          {analysisData.summary.healthScore}
                        </div>
                        <div className="text-sm text-purple-600">/ 100</div>
                      </div>
                    </div>
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                      analysisData.summary.healthScore >= 80 ? 'bg-green-100 text-green-800' :
                      analysisData.summary.healthScore >= 60 ? 'bg-blue-100 text-blue-800' :
                      analysisData.summary.healthScore >= 40 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {analysisData.summary.healthScore >= 80 ? 'Excellent' :
                       analysisData.summary.healthScore >= 60 ? 'Good' :
                       analysisData.summary.healthScore >= 40 ? 'Fair' : 'Needs Improvement'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {analysisData.summary.totalLeads}
                      </div>
                      <div className="text-gray-600">Total Leads</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {analysisData.summary.averageAge}
                      </div>
                      <div className="text-gray-600">Avg Age (days)</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {analysisData.summary.averageAttempts}
                      </div>
                      <div className="text-gray-600">Avg Attempts</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {analysisData.summary.contactEfficiency}%
                      </div>
                      <div className="text-gray-600">Response Rate</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Insights and Recommendations */}
              {analysisData.insights && analysisData.insights.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Zap className="w-5 h-5 text-amber-600 mr-2" />
                    Insights & Recommendations
                  </h4>
                  <div className="space-y-4">
                    {analysisData.insights.map((insight, index) => (
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
                        {insight.leads && insight.leads.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-gray-700 mb-2">Sample Leads:</p>
                            <div className="flex flex-wrap gap-2">
                              {insight.leads.slice(0, 3).map((lead) => (
                                <span key={lead.id} className="px-2 py-1 bg-gray-100 text-xs rounded">
                                  {lead.company}
                                </span>
                              ))}
                            </div>
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
      </div>
    </div>
  );
};

export default AdvancedLeadMetricsDashboard;