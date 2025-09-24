import React, { useState } from 'react';
import {
  X, Users, Crown, MapPin, Package, Calendar, 
  Activity, Target, TrendingUp, Award, BarChart3,
  Mail, Phone, Clock, ChevronRight, Shield
} from 'lucide-react';
import useTeamManagementStore from '../stores/teamManagementStore';
import { 
  TEAM_TYPE_LABELS, 
  REGION_LABELS, 
  PRODUCT_LABELS,
  ROLE_LABELS,
  STATUS_LABELS,
  USER_STATUS
} from '../constants';

const TeamDetailsModal = ({ team, onClose, onEdit }) => {
  const { users, getUsersByTeam } = useTeamManagementStore();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'members', 'performance', 'activity'

  if (!team) return null;

  const teamMembers = getUsersByTeam(team.id);
  const manager = users.find(user => user.id === team.manager);

  // Mock performance data
  const performanceData = {
    totalLeads: Math.floor(Math.random() * 500) + 100,
    wonDeals: Math.floor(Math.random() * 100) + 20,
    revenue: Math.floor(Math.random() * 500000) + 100000,
    conversionRate: (Math.random() * 30 + 10).toFixed(1),
    avgDealSize: Math.floor(Math.random() * 10000) + 2000,
    activeTasks: Math.floor(Math.random() * 50) + 10,
    completedTasks: Math.floor(Math.random() * 200) + 50,
    avgResponseTime: Math.floor(Math.random() * 24) + 1
  };

  const getTeamTypeGradient = (type) => {
    const gradients = {
      regional: 'from-blue-600 to-indigo-600',
      product: 'from-green-600 to-emerald-600',
      language: 'from-purple-600 to-pink-600',
      custom: 'from-gray-600 to-gray-700'
    };
    return gradients[type] || gradients.custom;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'activity', label: 'Activity', icon: Activity }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`relative bg-gradient-to-r ${getTeamTypeGradient(team.type)} p-6`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Users className="w-10 h-10 text-white" />
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">{team.name}</h2>
              <p className="text-white/80 mb-3">{team.description}</p>
              <div className="flex items-center gap-4 text-white/90">
                <span className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                  {TEAM_TYPE_LABELS[team.type]}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Created {new Date(team.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <button
              onClick={onEdit}
              className="px-6 py-3 bg-white text-gray-900 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Edit Team
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-all duration-200 border-b-2 ${
                    activeTab === tab.id
                      ? 'text-teal-600 border-teal-600 bg-teal-50/50'
                      : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-blue-600" />
                    <span className="text-2xl font-bold text-gray-900">{teamMembers.length}</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">Team Members</h3>
                  <p className="text-xs text-gray-500 mt-1">Active users</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <div className="flex items-center justify-between mb-4">
                    <Target className="w-8 h-8 text-green-600" />
                    <span className="text-2xl font-bold text-gray-900">{performanceData.wonDeals}</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">Won Deals</h3>
                  <p className="text-xs text-gray-500 mt-1">This month</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                    <span className="text-2xl font-bold text-gray-900">{performanceData.conversionRate}%</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">Conversion Rate</h3>
                  <p className="text-xs text-gray-500 mt-1">Lead to customer</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
                  <div className="flex items-center justify-between mb-4">
                    <Award className="w-8 h-8 text-orange-600" />
                    <span className="text-2xl font-bold text-gray-900">
                      ${performanceData.revenue.toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">Revenue</h3>
                  <p className="text-xs text-gray-500 mt-1">Total generated</p>
                </div>
              </div>

              {/* Team Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Manager & Access */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Details</h3>
                  
                  {/* Manager */}
                  {manager && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        Team Manager
                      </h4>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center">
                          <span className="text-white font-medium">
                            {manager.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{manager.name}</p>
                          <p className="text-sm text-gray-600">{manager.email}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-medium text-gray-700">
                            {ROLE_LABELS[manager.role]}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Regions */}
                  {team.regions && team.regions.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Assigned Regions
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {team.regions.map(region => (
                          <span key={region} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                            {REGION_LABELS[region]}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Products */}
                  {team.products && team.products.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Assigned Products
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {team.products.map(product => (
                          <span key={product} className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                            {PRODUCT_LABELS[product]}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Performance Overview */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Lead Pipeline</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {performanceData.totalLeads} total
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                          style={{ width: `${Math.min((performanceData.wonDeals / performanceData.totalLeads) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Task Completion</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {performanceData.completedTasks} completed
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                          style={{ width: `${Math.min((performanceData.completedTasks / (performanceData.completedTasks + performanceData.activeTasks)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Avg Deal Size</p>
                        <p className="text-lg font-bold text-gray-900">
                          ${performanceData.avgDealSize.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Response Time</p>
                        <p className="text-lg font-bold text-gray-900">
                          {performanceData.avgResponseTime}h
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Team Members ({teamMembers.length})</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                  <UserPlus className="w-4 h-4" />
                  Add Members
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamMembers.map(member => {
                  const isActive = member.status === USER_STATUS.ACTIVE;
                  
                  return (
                    <div key={member.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-medium">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                            isActive ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>

                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{member.name}</h4>
                          <p className="text-sm text-gray-600">{ROLE_LABELS[member.role]}</p>
                          
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {member.email}
                            </span>
                            {member.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {member.phone}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 mt-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              isActive 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {STATUS_LABELS[member.status]}
                            </span>
                            <span className="text-xs text-gray-500">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {member.lastLogin 
                                ? `Active ${new Date(member.lastLogin).toLocaleDateString()}`
                                : 'Never logged in'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {teamMembers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No members assigned to this team yet</p>
                </div>
              )}
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Detailed Performance Analysis</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Sales Performance */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Sales Performance</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Revenue</span>
                        <span className="font-bold text-gray-900">${performanceData.revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Deals Won</span>
                        <span className="font-bold text-gray-900">{performanceData.wonDeals}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Avg Deal Size</span>
                        <span className="font-bold text-gray-900">${performanceData.avgDealSize.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Win Rate</span>
                        <span className="font-bold text-green-600">{performanceData.conversionRate}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Lead Management */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Lead Management</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Leads</span>
                        <span className="font-bold text-gray-900">{performanceData.totalLeads}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Active Leads</span>
                        <span className="font-bold text-gray-900">{performanceData.totalLeads - performanceData.wonDeals}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Response Time</span>
                        <span className="font-bold text-gray-900">{performanceData.avgResponseTime}h</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Follow-up Rate</span>
                        <span className="font-bold text-blue-600">87%</span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Stats */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Activity Stats</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Tasks Completed</span>
                        <span className="font-bold text-gray-900">{performanceData.completedTasks}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Active Tasks</span>
                        <span className="font-bold text-gray-900">{performanceData.activeTasks}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Calls Made</span>
                        <span className="font-bold text-gray-900">{Math.floor(Math.random() * 200) + 50}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Emails Sent</span>
                        <span className="font-bold text-gray-900">{Math.floor(Math.random() * 500) + 100}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Comparison */}
                <div className="mt-6 bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 text-center">
                    This team's conversion rate is <span className="font-bold text-green-600">15% higher</span> than the company average
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Team Activity</h3>
              
              <div className="space-y-3">
                {[
                  { 
                    icon: Award, 
                    text: 'Team closed 5 deals worth $125,000', 
                    time: '2 hours ago', 
                    color: 'text-green-600',
                    bgColor: 'bg-green-50'
                  },
                  { 
                    icon: Users, 
                    text: '3 new members joined the team', 
                    time: '5 hours ago', 
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50'
                  },
                  { 
                    icon: Target, 
                    text: 'Team achieved 120% of monthly target', 
                    time: 'Yesterday', 
                    color: 'text-purple-600',
                    bgColor: 'bg-purple-50'
                  },
                  { 
                    icon: Activity, 
                    text: 'Completed 47 customer follow-ups', 
                    time: '2 days ago', 
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-50'
                  },
                  { 
                    icon: Crown, 
                    text: 'New team manager assigned', 
                    time: '3 days ago', 
                    color: 'text-pink-600',
                    bgColor: 'bg-pink-50'
                  }
                ].map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all">
                      <div className={`w-10 h-10 ${activity.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${activity.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.text}</p>
                        <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  );
                })}
              </div>

              <div className="text-center pt-4">
                <button className="text-sm font-medium text-teal-600 hover:text-teal-700">
                  Load more activities
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamDetailsModal;