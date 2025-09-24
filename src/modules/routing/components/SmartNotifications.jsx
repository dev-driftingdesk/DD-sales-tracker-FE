import React, { useEffect, useState } from 'react';
import { Bell, AlertCircle, UserPlus, Clock, TrendingUp, X } from 'lucide-react';
import useRoutingStore from '../stores/routingStore';
import useUserStore from '../../../stores/userStore';
import { NOTIFICATION_TYPES } from '../constants/routingConstants';

const SmartNotifications = () => {
  const { notifications, getUserNotifications, markNotificationRead, processFollowUpReminders } = useRoutingStore();
  const { currentUser } = useUserStore();
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const userNotifications = getUserNotifications(currentUser?.id);
  const unreadCount = userNotifications.filter(n => !n.read).length;
  
  useEffect(() => {
    // Process follow-up reminders every hour
    const interval = setInterval(() => {
      processFollowUpReminders();
    }, 60 * 60 * 1000); // 1 hour
    
    // Initial check
    processFollowUpReminders();
    
    return () => clearInterval(interval);
  }, [processFollowUpReminders]);
  
  const getIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.NEW_ASSIGNMENT:
        return UserPlus;
      case NOTIFICATION_TYPES.FOLLOW_UP_REMINDER:
        return Clock;
      case NOTIFICATION_TYPES.HIGH_VALUE_LEAD:
        return TrendingUp;
      case NOTIFICATION_TYPES.STALE_LEAD:
        return AlertCircle;
      default:
        return Bell;
    }
  };
  
  const getNotificationColor = (type, priority) => {
    if (priority === 'critical' || priority === 'high') {
      return 'bg-red-50 border-red-200';
    }
    if (type === NOTIFICATION_TYPES.NEW_ASSIGNMENT) {
      return 'bg-teal-50 border-teal-200';
    }
    if (type === NOTIFICATION_TYPES.HIGH_VALUE_LEAD) {
      return 'bg-purple-50 border-purple-200';
    }
    return 'bg-yellow-50 border-yellow-200';
  };
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Show new notification popup when unread count increases
  useEffect(() => {
    if (unreadCount > 0 && !isVisible) {
      setIsVisible(true);
      setIsMinimized(false);
    }
  }, [unreadCount]);

  if (userNotifications.length === 0 || !isVisible) {
    return null;
  }

  // Minimized state - just show a small bubble
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-24 z-40">
        <button
          onClick={() => setIsMinimized(false)}
          className="relative bg-white rounded-full shadow-lg p-3 hover:shadow-xl transition-shadow"
        >
          <Bell className="w-6 h-6 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 px-2 py-1 bg-red-500 text-white rounded-full text-xs font-medium min-w-[20px] text-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-6 w-96 max-h-96 overflow-hidden z-40">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-medium">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Minimize"
            >
              <span className="text-gray-400 text-xs">—</span>
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Close"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {userNotifications.slice(0, 5).map((notification) => {
            const Icon = getIcon(notification.type);
            const bgColor = getNotificationColor(notification.type, notification.priority);
            
            return (
              <div
                key={notification.id}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.read ? bgColor : ''
                }`}
                onClick={() => markNotificationRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    notification.priority === 'high' || notification.priority === 'critical'
                      ? 'bg-red-100'
                      : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      notification.priority === 'high' || notification.priority === 'critical'
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-medium">
                      {notification.message}
                    </p>
                    {notification.data?.lead && (
                      <p className="text-xs text-gray-600 mt-1">
                        {notification.data.lead.companyName} - ${notification.data.lead.dealValue?.toLocaleString() || 'TBD'}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>
                  
                  {!notification.read && (
                    <div className="w-2 h-2 bg-teal-600 rounded-full" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {userNotifications.length > 5 && (
          <div className="px-4 py-2 bg-gray-50 text-center">
            <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
              View all notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartNotifications;