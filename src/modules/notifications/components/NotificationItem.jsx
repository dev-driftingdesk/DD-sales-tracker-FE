import React, { useState } from 'react';
import {
  Bell, Check, X, Archive, Clock, ChevronRight,
  TrendingUp, Users, Briefcase, CalendarClock,
  Shield, Settings, Activity, FileText, AlertCircle,
  CheckCircle, XCircle, Info, Award, Package,
  MessageSquare, File, ThumbsUp, AlertTriangle
} from 'lucide-react';
import useNotificationStore from '../stores/notificationStore';
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_ACTIONS
} from '../constants';

const NotificationItem = ({ notification }) => {
  const {
    markAsRead,
    markAsUnread,
    deleteNotification,
    archiveNotification,
    snoozeNotification
  } = useNotificationStore();

  const [showActions, setShowActions] = useState(false);
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);

  const getNotificationIcon = () => {
    const iconMap = {
      [NOTIFICATION_TYPES.LEAD_ASSIGNED]: Users,
      [NOTIFICATION_TYPES.LEAD_STATUS_CHANGED]: Activity,
      [NOTIFICATION_TYPES.DEAL_WON]: Award,
      [NOTIFICATION_TYPES.DEAL_LOST]: XCircle,
      [NOTIFICATION_TYPES.TASK_ASSIGNED]: Briefcase,
      [NOTIFICATION_TYPES.TASK_COMPLETED]: CheckCircle,
      [NOTIFICATION_TYPES.TASK_OVERDUE]: AlertTriangle,
      [NOTIFICATION_TYPES.MEETING_SCHEDULED]: CalendarClock,
      [NOTIFICATION_TYPES.MEETING_REMINDER]: Clock,
      [NOTIFICATION_TYPES.TARGET_ACHIEVED]: TrendingUp,
      [NOTIFICATION_TYPES.TEAM_ANNOUNCEMENT]: Shield,
      [NOTIFICATION_TYPES.SYSTEM_UPDATE]: Settings,
      [NOTIFICATION_TYPES.INTEGRATION_ALERT]: Package,
      [NOTIFICATION_TYPES.PERFORMANCE_MILESTONE]: Award,
      [NOTIFICATION_TYPES.USER_MENTION]: MessageSquare,
      [NOTIFICATION_TYPES.COMMENT_ADDED]: MessageSquare,
      [NOTIFICATION_TYPES.DOCUMENT_SHARED]: File,
      [NOTIFICATION_TYPES.APPROVAL_REQUIRED]: FileText,
      [NOTIFICATION_TYPES.APPROVAL_GRANTED]: ThumbsUp,
      [NOTIFICATION_TYPES.WARNING]: AlertTriangle,
      [NOTIFICATION_TYPES.ERROR]: XCircle
    };
    return iconMap[notification.type] || Bell;
  };

  const getIconColor = () => {
    const colorMap = {
      [NOTIFICATION_CATEGORIES.LEADS]: 'from-blue-500 to-indigo-600',
      [NOTIFICATION_CATEGORIES.DEALS]: 'from-green-500 to-emerald-600',
      [NOTIFICATION_CATEGORIES.TASKS]: 'from-purple-500 to-pink-600',
      [NOTIFICATION_CATEGORIES.MEETINGS]: 'from-orange-500 to-red-600',
      [NOTIFICATION_CATEGORIES.TEAM]: 'from-cyan-500 to-teal-600',
      [NOTIFICATION_CATEGORIES.SYSTEM]: 'from-gray-500 to-gray-600',
      [NOTIFICATION_CATEGORIES.PERFORMANCE]: 'from-yellow-500 to-amber-600',
      [NOTIFICATION_CATEGORIES.APPROVALS]: 'from-indigo-500 to-purple-600'
    };
    return colorMap[notification.category] || 'from-gray-500 to-gray-600';
  };

  const getPriorityBadge = () => {
    const priorityConfig = {
      [NOTIFICATION_PRIORITIES.LOW]: {
        color: 'bg-gray-100 text-gray-700',
        dot: 'bg-gray-500'
      },
      [NOTIFICATION_PRIORITIES.MEDIUM]: {
        color: 'bg-blue-100 text-blue-700',
        dot: 'bg-blue-500'
      },
      [NOTIFICATION_PRIORITIES.HIGH]: {
        color: 'bg-orange-100 text-orange-700',
        dot: 'bg-orange-500'
      },
      [NOTIFICATION_PRIORITIES.URGENT]: {
        color: 'bg-red-100 text-red-700',
        dot: 'bg-red-500 animate-pulse'
      }
    };
    return priorityConfig[notification.priority] || priorityConfig[NOTIFICATION_PRIORITIES.MEDIUM];
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

  const handleAction = (action) => {
    switch (action.type) {
      case NOTIFICATION_ACTIONS.MARK_AS_READ:
        markAsRead(notification.id);
        break;
      case NOTIFICATION_ACTIONS.MARK_AS_UNREAD:
        markAsUnread(notification.id);
        break;
      case NOTIFICATION_ACTIONS.DELETE:
        deleteNotification(notification.id);
        break;
      case NOTIFICATION_ACTIONS.ARCHIVE:
        archiveNotification(notification.id);
        break;
      case NOTIFICATION_ACTIONS.OPEN_DETAILS:
        // Handle opening details (would navigate to relevant page)
        console.log('Open details:', notification.data);
        break;
      default:
        break;
    }
  };

  const handleSnooze = (duration) => {
    snoozeNotification(notification.id, duration);
    setShowSnoozeOptions(false);
  };

  const Icon = getNotificationIcon();
  const priorityBadge = getPriorityBadge();

  return (
    <div
      className={`relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${
        !notification.isRead ? 'ring-2 ring-teal-500/20' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowSnoozeOptions(false);
      }}
    >
      <div className="flex items-start gap-4 p-5">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getIconColor()} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-6 h-6 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {notification.title}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Priority Badge */}
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${priorityBadge.color}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${priorityBadge.dot}`} />
                <span className="capitalize">{notification.priority}</span>
              </div>
              
              {/* Time */}
              <span className="text-xs text-gray-500">
                {getTimeAgo(notification.createdAt)}
              </span>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {notification.message}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {notification.actions?.map((action, index) => (
              <button
                key={index}
                onClick={() => handleAction(action)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                <ChevronRight className="w-3 h-3" />
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Read Indicator */}
        {!notification.isRead && (
          <div className="absolute top-5 right-5 w-2 h-2 bg-teal-500 rounded-full" />
        )}
      </div>

      {/* Hover Actions */}
      {showActions && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="flex items-center">
            {!notification.isRead ? (
              <button
                onClick={() => markAsRead(notification.id)}
                className="p-2 hover:bg-gray-50 transition-colors"
                title="Mark as read"
              >
                <Check className="w-4 h-4 text-gray-600" />
              </button>
            ) : (
              <button
                onClick={() => markAsUnread(notification.id)}
                className="p-2 hover:bg-gray-50 transition-colors"
                title="Mark as unread"
              >
                <Bell className="w-4 h-4 text-gray-600" />
              </button>
            )}
            
            <button
              onClick={() => archiveNotification(notification.id)}
              className="p-2 hover:bg-gray-50 transition-colors"
              title="Archive"
            >
              <Archive className="w-4 h-4 text-gray-600" />
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowSnoozeOptions(!showSnoozeOptions)}
                className="p-2 hover:bg-gray-50 transition-colors"
                title="Snooze"
              >
                <Clock className="w-4 h-4 text-gray-600" />
              </button>
              
              {showSnoozeOptions && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleSnooze(30 * 60 * 1000)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      30 minutes
                    </button>
                    <button
                      onClick={() => handleSnooze(60 * 60 * 1000)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      1 hour
                    </button>
                    <button
                      onClick={() => handleSnooze(4 * 60 * 60 * 1000)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      4 hours
                    </button>
                    <button
                      onClick={() => handleSnooze(24 * 60 * 60 * 1000)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Tomorrow
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => deleteNotification(notification.id)}
              className="p-2 hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationItem;