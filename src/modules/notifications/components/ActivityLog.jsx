import React, { useState, useEffect } from 'react';
import {
  Activity, Search, Filter, Calendar, User, Clock,
  TrendingUp, Users, Briefcase, FileText, Settings,
  LogIn, LogOut, Plus, Edit, Trash2, CheckCircle,
  XCircle, Upload, Download, Link, Unlink, RefreshCw
} from 'lucide-react';
import useNotificationStore from '../stores/notificationStore';
import {
  ACTIVITY_TYPES,
  ACTIVITY_TYPE_LABELS
} from '../constants';

const ActivityLog = () => {
  const { activities, getFilteredActivities } = useNotificationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    userId: '',
    dateRange: 'today'
  });
  const [showFilters, setShowFilters] = useState(false);

  const filteredActivities = getFilteredActivities(filters).filter(activity => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        activity.description.toLowerCase().includes(query) ||
        activity.userName.toLowerCase().includes(query) ||
        ACTIVITY_TYPE_LABELS[activity.type]?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getActivityIcon = (type) => {
    const iconMap = {
      [ACTIVITY_TYPES.USER_LOGIN]: LogIn,
      [ACTIVITY_TYPES.USER_LOGOUT]: LogOut,
      [ACTIVITY_TYPES.LEAD_CREATED]: Plus,
      [ACTIVITY_TYPES.LEAD_UPDATED]: Edit,
      [ACTIVITY_TYPES.LEAD_DELETED]: Trash2,
      [ACTIVITY_TYPES.LEAD_ASSIGNED]: Users,
      [ACTIVITY_TYPES.LEAD_STATUS_CHANGED]: Activity,
      [ACTIVITY_TYPES.DEAL_CREATED]: Plus,
      [ACTIVITY_TYPES.DEAL_UPDATED]: Edit,
      [ACTIVITY_TYPES.DEAL_WON]: CheckCircle,
      [ACTIVITY_TYPES.DEAL_LOST]: XCircle,
      [ACTIVITY_TYPES.TASK_CREATED]: Plus,
      [ACTIVITY_TYPES.TASK_UPDATED]: Edit,
      [ACTIVITY_TYPES.TASK_COMPLETED]: CheckCircle,
      [ACTIVITY_TYPES.TASK_DELETED]: Trash2,
      [ACTIVITY_TYPES.MEETING_CREATED]: Plus,
      [ACTIVITY_TYPES.MEETING_UPDATED]: Edit,
      [ACTIVITY_TYPES.MEETING_COMPLETED]: CheckCircle,
      [ACTIVITY_TYPES.MEETING_CANCELLED]: XCircle,
      [ACTIVITY_TYPES.COMMENT_ADDED]: FileText,
      [ACTIVITY_TYPES.COMMENT_DELETED]: Trash2,
      [ACTIVITY_TYPES.FILE_UPLOADED]: Upload,
      [ACTIVITY_TYPES.FILE_DELETED]: Trash2,
      [ACTIVITY_TYPES.USER_CREATED]: Plus,
      [ACTIVITY_TYPES.USER_UPDATED]: Edit,
      [ACTIVITY_TYPES.USER_DEACTIVATED]: XCircle,
      [ACTIVITY_TYPES.TEAM_CREATED]: Plus,
      [ACTIVITY_TYPES.TEAM_UPDATED]: Edit,
      [ACTIVITY_TYPES.INTEGRATION_CONNECTED]: Link,
      [ACTIVITY_TYPES.INTEGRATION_DISCONNECTED]: Unlink,
      [ACTIVITY_TYPES.EXPORT_COMPLETED]: Download,
      [ACTIVITY_TYPES.IMPORT_COMPLETED]: Upload,
      [ACTIVITY_TYPES.SETTINGS_UPDATED]: Settings
    };
    return iconMap[type] || Activity;
  };

  const getActivityColor = (type) => {
    if (type.includes('created') || type.includes('won') || type.includes('completed')) {
      return 'from-green-500 to-emerald-600';
    }
    if (type.includes('deleted') || type.includes('lost') || type.includes('cancelled')) {
      return 'from-red-500 to-pink-600';
    }
    if (type.includes('updated') || type.includes('changed')) {
      return 'from-blue-500 to-indigo-600';
    }
    if (type.includes('login') || type.includes('logout')) {
      return 'from-gray-500 to-gray-600';
    }
    return 'from-purple-500 to-indigo-600';
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return time.toLocaleDateString();
  };

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'all', label: 'All Time' }
  ];

  // Get unique users from activities
  const uniqueUsers = [...new Set(activities.map(a => JSON.stringify({ id: a.userId, name: a.userName })))]
    .map(str => JSON.parse(str));

  // Get activity types used
  const usedActivityTypes = [...new Set(activities.map(a => a.type))];

  const groupActivitiesByDate = () => {
    const grouped = {};
    
    filteredActivities.forEach(activity => {
      const date = new Date(activity.timestamp).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(activity);
    });

    return Object.entries(grouped).sort((a, b) => new Date(b[0]) - new Date(a[0]));
  };

  const groupedActivities = groupActivitiesByDate();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activity Log
          </h2>
          
          <button
            onClick={() => useNotificationStore.getState().initializeNotifications()}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              showFilters || Object.values(filters).some(v => v && v !== 'today')
                ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Activity Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                >
                  <option value="">All Types</option>
                  {usedActivityTypes.map(type => (
                    <option key={type} value={type}>
                      {ACTIVITY_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </div>

              {/* User Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                <select
                  value={filters.userId}
                  onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                >
                  <option value="">All Users</option>
                  {uniqueUsers.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                >
                  {dateRangeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        {groupedActivities.length > 0 ? (
          <div className="space-y-6">
            {groupedActivities.map(([date, dateActivities]) => (
              <div key={date}>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  {date === new Date().toDateString() ? 'Today' :
                   date === new Date(Date.now() - 86400000).toDateString() ? 'Yesterday' :
                   date}
                </h3>
                
                <div className="space-y-3">
                  {dateActivities.map(activity => {
                    const Icon = getActivityIcon(activity.type);
                    
                    return (
                      <div
                        key={activity.id}
                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4"
                      >
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getActivityColor(activity.type)} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-gray-900">
                                  <span className="font-medium">{activity.userName}</span>
                                  {' '}
                                  <span className="text-gray-600">{activity.description}</span>
                                </p>
                                
                                {/* Additional Data */}
                                {activity.data && Object.keys(activity.data).length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {activity.data.leadName && (
                                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                        <Users className="w-3 h-3" />
                                        {activity.data.leadName}
                                      </span>
                                    )}
                                    {activity.data.company && (
                                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                                        <Briefcase className="w-3 h-3" />
                                        {activity.data.company}
                                      </span>
                                    )}
                                    {activity.data.amount && (
                                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                        <TrendingUp className="w-3 h-3" />
                                        ${activity.data.amount.toLocaleString()}
                                      </span>
                                    )}
                                    {activity.data.taskTitle && (
                                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                                        <Briefcase className="w-3 h-3" />
                                        {activity.data.taskTitle}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              {/* Time */}
                              <span className="text-xs text-gray-500 flex items-center gap-1 flex-shrink-0">
                                <Clock className="w-3 h-3" />
                                {getTimeAgo(activity.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6">
              <Activity className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No activities found</h3>
            <p className="text-gray-600 text-center max-w-md">
              {searchQuery || Object.values(filters).some(v => v && v !== 'today')
                ? 'No activities match your search or filters'
                : 'Activity log will appear here as users perform actions in the system'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;