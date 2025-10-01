import React, { useState, useMemo } from 'react';
import { 
  DollarSign, TrendingUp, Target, Calendar, 
  Award, Star, Trophy, Coins, BarChart3,
  Filter, ChevronDown, Users, Eye
} from 'lucide-react';
import useLeadStore from '../modules/leads/stores/leadStore';
import useUserStore from '../stores/userStore.jsx';
import {
  calculateCommissionProjections,
  formatCommission,
  getCommissionTier,
  calculateCommission
} from '../utils/commissionUtils';

const CommissionDashboard = () => {
  const { leads } = useLeadStore();
  const { currentUser, users } = useUserStore();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [viewMode, setViewMode] = useState('personal'); // 'personal' or 'team'

  // Calculate commission data for current user
  const userCommissionData = useMemo(() => {
    if (!currentUser || currentUser.role !== 'sales_rep') return null;
    
    return calculateCommissionProjections(leads, currentUser, selectedPeriod);
  }, [leads, currentUser, selectedPeriod]);

  // Calculate team commission data (for managers/admins)
  const teamCommissionData = useMemo(() => {
    if (!currentUser || currentUser.role === 'sales_rep') return [];
    
    return users
      .filter(user => user.role === 'sales_rep' && user.isActive)
      .map(user => ({
        user,
        ...calculateCommissionProjections(leads, user, selectedPeriod)
      }))
      .sort((a, b) => b.totalPotential - a.totalPotential);
  }, [leads, users, currentUser, selectedPeriod]);

  // Get recent commission earnings
  const recentEarnings = useMemo(() => {
    if (!currentUser) return [];
    
    return leads
      .filter(lead => 
        lead.assignedTo === currentUser.id && 
        lead.status === 'won' && 
        lead.closedValue
      )
      .map(lead => ({
        lead,
        commissionAmount: calculateCommission(lead.closedValue, currentUser.commissionPercentage || 0),
        closedDate: lead.closedDate || lead.updatedAt
      }))
      .sort((a, b) => new Date(b.closedDate) - new Date(a.closedDate))
      .slice(0, 5);
  }, [leads, currentUser]);

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <div className={`bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <TrendingUp className={`w-3 h-3 ${trend > 0 ? '' : 'rotate-180'}`} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-sm text-gray-600">{title}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );

  const CommissionTierBadge = ({ amount }) => {
    const tier = getCommissionTier(amount);
    return (
      <div className={`flex items-center gap-2 px-3 py-1 bg-gradient-to-r ${tier.color} rounded-full text-white text-sm font-medium`}>
        <Trophy className="w-4 h-4" />
        {tier.label}
      </div>
    );
  };

  if (!currentUser) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Please log in to view commission dashboard</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Commission Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Track your earnings and commission potential</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Period Selector */}
              <div className="relative">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none appearance-none pr-8"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              
              {/* View Mode Toggle */}
              {currentUser.role !== 'sales_rep' && (
                <div className="flex items-center gap-1 bg-white rounded-lg shadow-sm p-1">
                  <button
                    onClick={() => setViewMode('personal')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      viewMode === 'personal' 
                        ? 'bg-green-100 text-green-700' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Personal
                  </button>
                  <button
                    onClick={() => setViewMode('team')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      viewMode === 'team' 
                        ? 'bg-green-100 text-green-700' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Team
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Personal Commission View */}
        {(viewMode === 'personal' || currentUser.role === 'sales_rep') && userCommissionData && (
          <>
            {/* Commission Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title={`${selectedPeriod === 'monthly' ? 'Monthly' : 'Quarterly'} Projected`}
                value={formatCommission(userCommissionData.projectedCommission)}
                subtitle={`From ${userCommissionData.leadsCount.active} active leads`}
                icon={Target}
                color="from-blue-500 to-cyan-600"
                trend={12}
              />
              
              <StatCard
                title="Earned Commission"
                value={formatCommission(userCommissionData.earnedCommission)}
                subtitle={`From ${userCommissionData.leadsCount.won} won deals`}
                icon={Award}
                color="from-green-500 to-emerald-600"
                trend={8}
              />
              
              <StatCard
                title="Total Potential"
                value={formatCommission(userCommissionData.totalPotential)}
                subtitle="Projected + Earned"
                icon={DollarSign}
                color="from-purple-500 to-pink-600"
              />
              
              <StatCard
                title="Commission Rate"
                value={`${currentUser.commissionPercentage || 0}%`}
                subtitle="Your commission percentage"
                icon={Coins}
                color="from-orange-500 to-red-600"
              />
            </div>

            {/* Commission Tier & Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Commission Tier */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Commission Tier
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <CommissionTierBadge amount={userCommissionData.totalPotential} />
                    <p className="text-sm text-gray-600 mt-2">
                      Based on total potential earnings
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCommission(userCommissionData.totalPotential)}
                    </p>
                    <p className="text-sm text-gray-500">Total Potential</p>
                  </div>
                </div>
              </div>

              {/* Pipeline Value */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Pipeline Value
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Pipeline</span>
                    <span className="font-medium">{formatCommission(userCommissionData.pipelineValue)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Closed Deals</span>
                    <span className="font-medium">{formatCommission(userCommissionData.closedValue)}</span>
                  </div>
                  <div className="border-t pt-2 flex items-center justify-between">
                    <span className="font-medium text-gray-900">Total Value</span>
                    <span className="font-bold text-green-700">
                      {formatCommission(userCommissionData.pipelineValue + userCommissionData.closedValue)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Earnings */}
            {recentEarnings.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Recent Commission Earnings
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentEarnings.map((earning, index) => (
                      <div key={earning.lead.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <div>
                          <p className="font-medium text-gray-900">{earning.lead.companyName}</p>
                          <p className="text-sm text-gray-600">
                            Deal Value: {formatCommission(earning.lead.closedValue)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Closed: {new Date(earning.closedDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-700">
                            {formatCommission(earning.commissionAmount)}
                          </p>
                          <p className="text-xs text-green-600">
                            {currentUser.commissionPercentage}% commission
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Team Commission View */}
        {viewMode === 'team' && currentUser.role !== 'sales_rep' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Commission Performance
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {teamCommissionData.map((member, index) => (
                  <div key={member.user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-xl flex items-center justify-center">
                          <span className="text-white font-medium">
                            {member.user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        {index < 3 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-yellow-900">{index + 1}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.user.name}</p>
                        <p className="text-sm text-gray-600">{member.user.location}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {member.user.commissionPercentage}% rate
                          </span>
                          <CommissionTierBadge amount={member.totalPotential} />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-700">
                        {formatCommission(member.totalPotential)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {member.leadsCount.active} active • {member.leadsCount.won} won
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-green-600">
                          Projected: {formatCommission(member.projectedCommission)}
                        </span>
                        <span className="text-xs text-blue-600">
                          Earned: {formatCommission(member.earnedCommission)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommissionDashboard;