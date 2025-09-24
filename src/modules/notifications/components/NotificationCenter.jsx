import React, { useState, useEffect } from 'react';
import {
  Bell, Filter, Settings, Check, CheckCheck, Trash2,
  Archive, Clock, Search, Calendar, AlertCircle,
  X, ChevronRight, Volume2, VolumeX, Inbox,
  TrendingUp, Users, Briefcase, CalendarClock,
  Shield, Activity, Package, FileText
} from 'lucide-react';
import useNotificationStore from '../stores/notificationStore';
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_CATEGORY_LABELS,
  NOTIFICATION_PRIORITY_LABELS,
  NOTIFICATION_TYPE_LABELS
} from '../constants';
import NotificationItem from './NotificationItem';
import NotificationFilters from './NotificationFilters';
import NotificationSettings from './NotificationSettings';
import ActivityLog from './ActivityLog';

const NotificationCenter = () => {
  const {
    notifications,
    unreadCount,
    preferences,
    filters,
    isLoading,
    getFilteredNotifications,
    markAllAsRead,
    deleteAllNotifications,
    setFilters,
    clearFilters,
    initializeNotifications,
    requestNotificationPermission
  } = useNotificationStore();

  const [activeTab, setActiveTab] = useState('notifications'); // 'notifications' or 'activity'
  const [showSettings, setShowSettings] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    initializeNotifications();
    requestNotificationPermission();
  }, []);

  const filteredNotifications = getFilteredNotifications().filter(notification => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getCategoryIcon = (category) => {
    const icons = {
      [NOTIFICATION_CATEGORIES.LEADS]: Users,
      [NOTIFICATION_CATEGORIES.DEALS]: TrendingUp,
      [NOTIFICATION_CATEGORIES.TASKS]: Briefcase,
      [NOTIFICATION_CATEGORIES.MEETINGS]: CalendarClock,
      [NOTIFICATION_CATEGORIES.TEAM]: Shield,
      [NOTIFICATION_CATEGORIES.SYSTEM]: Settings,
      [NOTIFICATION_CATEGORIES.PERFORMANCE]: Activity,
      [NOTIFICATION_CATEGORIES.APPROVALS]: FileText
    };
    return icons[category] || Bell;
  };

  const getCategoryColor = (category) => {
    const colors = {
      [NOTIFICATION_CATEGORIES.LEADS]: 'from-blue-500 to-indigo-600',
      [NOTIFICATION_CATEGORIES.DEALS]: 'from-green-500 to-emerald-600',
      [NOTIFICATION_CATEGORIES.TASKS]: 'from-purple-500 to-pink-600',
      [NOTIFICATION_CATEGORIES.MEETINGS]: 'from-orange-500 to-red-600',
      [NOTIFICATION_CATEGORIES.TEAM]: 'from-cyan-500 to-teal-600',
      [NOTIFICATION_CATEGORIES.SYSTEM]: 'from-gray-500 to-gray-600',
      [NOTIFICATION_CATEGORIES.PERFORMANCE]: 'from-yellow-500 to-amber-600',
      [NOTIFICATION_CATEGORIES.APPROVALS]: 'from-indigo-500 to-purple-600'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  const categoryStats = Object.values(NOTIFICATION_CATEGORIES).map(category => {
    const categoryNotifications = notifications.filter(n => n.category === category);
    const unreadCount = categoryNotifications.filter(n => !n.isRead).length;
    return {
      category,
      total: categoryNotifications.length,
      unread: unreadCount
    };
  }).filter(stat => stat.total > 0);

  const hasActiveFilters = filters.category || filters.priority || filters.read !== null || filters.dateRange !== 'all';

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell, count: unreadCount },
    { id: 'activity', label: 'Activity Log', icon: Activity }
  ];

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-80 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Notification Center
            </h1>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-white rounded-xl transition-all"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-teal-100 text-teal-700'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Stats */}
        {activeTab === 'notifications' && (
          <div className="p-6 space-y-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Categories</h3>
            
            <button
              onClick={() => {
                setSelectedCategory('');
                setFilters({ category: '' });
              }}
              className={`w-full p-4 rounded-xl transition-all ${
                !selectedCategory
                  ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg'
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Inbox className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">All Notifications</p>
                    <p className={`text-xs ${!selectedCategory ? 'text-white/70' : 'text-gray-500'}`}>
                      {notifications.length} total
                    </p>
                  </div>
                </div>
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    !selectedCategory
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </div>
            </button>

            {categoryStats.map(stat => {
              const Icon = getCategoryIcon(stat.category);
              const isSelected = selectedCategory === stat.category;
              
              return (
                <button
                  key={stat.category}
                  onClick={() => {
                    setSelectedCategory(stat.category);
                    setFilters({ category: stat.category });
                  }}
                  className={`w-full p-4 rounded-xl transition-all ${
                    isSelected
                      ? `bg-gradient-to-r ${getCategoryColor(stat.category)} text-white shadow-lg`
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected
                          ? 'bg-white/20'
                          : `bg-gradient-to-br ${getCategoryColor(stat.category)} text-white`
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">
                          {NOTIFICATION_CATEGORY_LABELS[stat.category]}
                        </p>
                        <p className={`text-xs ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                          {stat.total} notification{stat.total !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    {stat.unread > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {stat.unread}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {activeTab === 'notifications' ? (
          <>
            {/* Notification Actions Bar */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search notifications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all"
                    />
                  </div>

                  {/* Filter Button */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      showFilters || hasActiveFilters
                        ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                    {hasActiveFilters && (
                      <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                        {Object.values(filters).filter(Boolean).length}
                      </span>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Sound Toggle */}
                  <button
                    onClick={() => useNotificationStore.getState().updatePreferences({
                      sound_enabled: !preferences.sound_enabled
                    })}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-all"
                    title={preferences.sound_enabled ? 'Mute notifications' : 'Unmute notifications'}
                  >
                    {preferences.sound_enabled ? (
                      <Volume2 className="w-5 h-5 text-gray-600" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {/* Mark All as Read */}
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>Mark all as read</span>
                    </button>
                  )}

                  {/* Clear All */}
                  {notifications.length > 0 && (
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete all notifications?')) {
                          deleteAllNotifications();
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Clear all</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <NotificationFilters onClose={() => setShowFilters(false)} />
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredNotifications.length > 0 ? (
                <div className="space-y-4">
                  {filteredNotifications.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6">
                    <Bell className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
                  <p className="text-gray-600 text-center max-w-md">
                    {searchQuery || hasActiveFilters
                      ? 'No notifications match your search or filters'
                      : 'You\'re all caught up! Check back later for new updates.'}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="mt-4 px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <ActivityLog />
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <NotificationSettings onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};

export default NotificationCenter;