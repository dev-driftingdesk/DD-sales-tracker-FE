import React from 'react';
import { Calendar, ChevronDown, User, Trophy, TrendingUp } from 'lucide-react';
import useUserStore from '../../../stores/userStore.jsx';
import usePerformanceStore from '../stores/performanceStore';

const DashboardHeader = () => {
  const { currentUser, users, switchUser } = useUserStore();
  const { currentPeriod, setPeriod } = usePerformanceStore();
  
  const periods = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];
  
  const salesReps = users.filter(u => u.role === 'sales_rep');

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-teal-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Performance Dashboard</h1>
                <p className="text-sm text-gray-600">Track your sales performance and compete with your team</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Period Selector */}
            <div className="relative">
              <select
                value={currentPeriod}
                onChange={(e) => setPeriod(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none cursor-pointer"
              >
                {periods.map(period => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
              <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            
            {/* User Switcher (for demo) */}
            <div className="relative">
              <select
                value={currentUser?.id}
                onChange={(e) => switchUser(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none cursor-pointer"
              >
                <option value="" disabled>Switch User</option>
                {salesReps.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              <User className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            
            {/* Current User Avatar */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                <p className="text-xs text-gray-500">{currentUser?.role === 'sales_rep' ? 'Sales Representative' : currentUser?.role}</p>
              </div>
              <img
                src={currentUser?.avatar}
                alt={currentUser?.name}
                className="w-10 h-10 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;