import React from 'react';
import {
  X, Mail, Phone, MapPin, Calendar, Clock, Shield,
  Activity, Users, Target, TrendingUp, Award, Package
} from 'lucide-react';
import { USER_ROLES, USER_STATUS, ROLE_LABELS, STATUS_LABELS, REGION_LABELS, PRODUCT_LABELS } from '../constants';

const UserDetailsModal = ({ user, onClose, onEdit }) => {
  if (!user) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case USER_STATUS.ACTIVE:
        return 'bg-green-100 text-green-700 border-green-200';
      case USER_STATUS.INACTIVE:
        return 'bg-red-100 text-red-700 border-red-200';
      case USER_STATUS.PENDING:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return Shield;
      case USER_ROLES.MANAGER:
        return Users;
      case USER_ROLES.SALES_REP:
        return Target;
      default:
        return Users;
    }
  };

  const RoleIcon = getRoleIcon(user.role);

  // Mock performance data
  const performanceData = {
    totalLeads: Math.floor(Math.random() * 100) + 50,
    wonDeals: Math.floor(Math.random() * 30) + 10,
    revenue: Math.floor(Math.random() * 50000) + 10000,
    conversionRate: (Math.random() * 30 + 10).toFixed(1),
    avgDealSize: Math.floor(Math.random() * 5000) + 1000,
    activeTasks: Math.floor(Math.random() * 10) + 5
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-teal-600 to-cyan-600 p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-3xl">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(user.status)}`}>
                {STATUS_LABELS[user.status]}
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
              <div className="flex items-center gap-4 text-white/80">
                <span className="flex items-center gap-2">
                  <RoleIcon className="w-4 h-4" />
                  {ROLE_LABELS[user.role]}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <button
              onClick={onEdit}
              className="px-6 py-3 bg-white text-teal-600 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Contact & Access Info */}
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{user.email}</p>
                    </div>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">{user.phone}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Last Active</p>
                      <p className="font-medium text-gray-900">
                        {user.lastLogin 
                          ? new Date(user.lastLogin).toLocaleString()
                          : 'Never logged in'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Access Control */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Access Control</h3>
                
                {/* Regions */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Regions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {user.regions?.map(region => (
                      <span key={region} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        {REGION_LABELS[region]}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Products */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Products
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {user.products?.map(product => (
                      <span key={product} className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        {PRODUCT_LABELS[product]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column - Performance */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Total Leads</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{performanceData.totalLeads}</p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">Won Deals</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{performanceData.wonDeals}</p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-gray-600">Conversion</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{performanceData.conversionRate}%</p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-gray-600">Revenue</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      ${performanceData.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average Deal Size</span>
                    <span className="font-semibold text-gray-900">
                      ${performanceData.avgDealSize.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-600">Active Tasks</span>
                    <span className="font-semibold text-gray-900">{performanceData.activeTasks}</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {[
                    { icon: Activity, text: 'Closed deal with Acme Corp', time: '2 hours ago', color: 'text-green-600' },
                    { icon: Users, text: 'Added 3 new leads', time: '5 hours ago', color: 'text-blue-600' },
                    { icon: Phone, text: 'Called 8 prospects', time: 'Yesterday', color: 'text-purple-600' },
                    { icon: Mail, text: 'Sent follow-up emails', time: '2 days ago', color: 'text-orange-600' }
                  ].map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-8 h-8 bg-white rounded-lg flex items-center justify-center ${activity.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.text}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column - Teams & Permissions */}
            <div className="space-y-6">
              {/* Teams */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Membership</h3>
                <div className="space-y-3">
                  {user.teams?.length > 0 ? (
                    user.teams.map(teamId => (
                      <div key={teamId} className="p-3 bg-white rounded-lg border border-gray-200">
                        <p className="font-medium text-gray-900">Team {teamId}</p>
                        <p className="text-sm text-gray-600">Active member</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">Not assigned to any teams</p>
                  )}
                </div>
              </div>

              {/* Key Permissions */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Permissions</h3>
                <div className="space-y-2">
                  {[
                    { label: 'View All Leads', has: user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.MANAGER },
                    { label: 'Create Users', has: user.role === USER_ROLES.ADMIN },
                    { label: 'Export Data', has: user.role !== USER_ROLES.SALES_REP },
                    { label: 'Manage Teams', has: user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.MANAGER },
                    { label: 'View Analytics', has: true },
                    { label: 'Manage Integrations', has: user.role === USER_ROLES.ADMIN }
                  ].map((permission, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{permission.label}</span>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        permission.has ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {permission.has ? (
                          <div className="w-2 h-2 bg-green-600 rounded-full" />
                        ) : (
                          <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;