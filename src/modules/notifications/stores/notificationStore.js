import { create } from 'zustand';
import { 
  NOTIFICATION_TYPES, 
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_CATEGORIES,
  ACTIVITY_TYPES,
  DEFAULT_NOTIFICATION_SETTINGS,
  NOTIFICATION_ACTIONS
} from '../constants';

const useNotificationStore = create((set, get) => ({
  // State
  notifications: [],
  activities: [],
  unreadCount: 0,
  preferences: DEFAULT_NOTIFICATION_SETTINGS,
  isLoading: false,
  error: null,
  selectedNotification: null,
  filters: {
    category: '',
    priority: '',
    read: null,
    dateRange: 'all'
  },
  
  // Initialize with sample data
  initializeNotifications: () => {
    const sampleNotifications = [
      {
        id: '1',
        type: NOTIFICATION_TYPES.LEAD_ASSIGNED,
        category: NOTIFICATION_CATEGORIES.LEADS,
        priority: NOTIFICATION_PRIORITIES.HIGH,
        title: 'New Lead Assigned',
        message: 'You have been assigned a new lead: John Smith from Acme Corp',
        data: {
          leadId: '1',
          leadName: 'John Smith',
          company: 'Acme Corp'
        },
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        actions: [
          { type: NOTIFICATION_ACTIONS.OPEN_DETAILS, label: 'View Lead' },
          { type: NOTIFICATION_ACTIONS.MARK_AS_READ, label: 'Mark as Read' }
        ]
      },
      {
        id: '2',
        type: NOTIFICATION_TYPES.DEAL_WON,
        category: NOTIFICATION_CATEGORIES.DEALS,
        priority: NOTIFICATION_PRIORITIES.URGENT,
        title: 'Deal Won! 🎉',
        message: 'Congratulations! You closed the deal with TechStart Inc for $50,000',
        data: {
          dealId: '1',
          company: 'TechStart Inc',
          amount: 50000
        },
        isRead: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        actions: [
          { type: NOTIFICATION_ACTIONS.OPEN_DETAILS, label: 'View Deal' }
        ]
      },
      {
        id: '3',
        type: NOTIFICATION_TYPES.TASK_OVERDUE,
        category: NOTIFICATION_CATEGORIES.TASKS,
        priority: NOTIFICATION_PRIORITIES.HIGH,
        title: 'Task Overdue',
        message: 'Follow up with client is overdue by 2 days',
        data: {
          taskId: '1',
          taskTitle: 'Follow up with client',
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        isRead: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        actions: [
          { type: NOTIFICATION_ACTIONS.OPEN_DETAILS, label: 'View Task' },
          { type: NOTIFICATION_ACTIONS.SNOOZE, label: 'Snooze' }
        ]
      },
      {
        id: '4',
        type: NOTIFICATION_TYPES.MEETING_REMINDER,
        category: NOTIFICATION_CATEGORIES.MEETINGS,
        priority: NOTIFICATION_PRIORITIES.MEDIUM,
        title: 'Meeting in 30 minutes',
        message: 'Sales review meeting with the team starts at 3:00 PM',
        data: {
          meetingId: '1',
          meetingTitle: 'Sales review meeting',
          startTime: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        },
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        actions: [
          { type: NOTIFICATION_ACTIONS.OPEN_DETAILS, label: 'View Meeting' },
          { type: NOTIFICATION_ACTIONS.MARK_AS_READ, label: 'Dismiss' }
        ]
      },
      {
        id: '5',
        type: NOTIFICATION_TYPES.TARGET_ACHIEVED,
        category: NOTIFICATION_CATEGORIES.PERFORMANCE,
        priority: NOTIFICATION_PRIORITIES.HIGH,
        title: 'Monthly Target Achieved! 🏆',
        message: 'You have achieved 105% of your monthly sales target',
        data: {
          target: 100000,
          achieved: 105000,
          percentage: 105
        },
        isRead: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        actions: [
          { type: NOTIFICATION_ACTIONS.OPEN_DETAILS, label: 'View Performance' }
        ]
      }
    ];

    const sampleActivities = [
      {
        id: '1',
        type: ACTIVITY_TYPES.LEAD_CREATED,
        userId: '1',
        userName: 'John Admin',
        description: 'Created new lead: John Smith from Acme Corp',
        data: {
          leadId: '1',
          leadName: 'John Smith',
          company: 'Acme Corp'
        },
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        type: ACTIVITY_TYPES.DEAL_WON,
        userId: '2',
        userName: 'Sarah Manager',
        description: 'Won deal with TechStart Inc worth $50,000',
        data: {
          dealId: '1',
          company: 'TechStart Inc',
          amount: 50000
        },
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        type: ACTIVITY_TYPES.TASK_COMPLETED,
        userId: '3',
        userName: 'Mike Rep',
        description: 'Completed task: Product demo for client',
        data: {
          taskId: '1',
          taskTitle: 'Product demo for client'
        },
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        type: ACTIVITY_TYPES.MEETING_CREATED,
        userId: '1',
        userName: 'John Admin',
        description: 'Scheduled meeting: Sales review meeting',
        data: {
          meetingId: '1',
          meetingTitle: 'Sales review meeting'
        },
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '5',
        type: ACTIVITY_TYPES.USER_LOGIN,
        userId: '1',
        userName: 'John Admin',
        description: 'Logged in to the system',
        data: {},
        timestamp: new Date().toISOString()
      }
    ];

    set({
      notifications: sampleNotifications,
      activities: sampleActivities,
      unreadCount: sampleNotifications.filter(n => !n.isRead).length
    });
  },

  // Notification actions
  addNotification: (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      ...notification,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));

    // Trigger notification based on preferences
    get().triggerNotification(newNotification);

    return newNotification;
  },

  markAsRead: (notificationId) => {
    set((state) => {
      const notification = state.notifications.find(n => n.id === notificationId);
      if (!notification || notification.isRead) return state;

      return {
        notifications: state.notifications.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    });
  },

  markAsUnread: (notificationId) => {
    set((state) => {
      const notification = state.notifications.find(n => n.id === notificationId);
      if (!notification || !notification.isRead) return state;

      return {
        notifications: state.notifications.map(n =>
          n.id === notificationId ? { ...n, isRead: false } : n
        ),
        unreadCount: state.unreadCount + 1
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0
    }));
  },

  deleteNotification: (notificationId) => {
    set((state) => {
      const notification = state.notifications.find(n => n.id === notificationId);
      const wasUnread = notification && !notification.isRead;

      return {
        notifications: state.notifications.filter(n => n.id !== notificationId),
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
      };
    });
  },

  deleteAllNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0
    });
  },

  archiveNotification: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.map(n =>
        n.id === notificationId ? { ...n, archived: true } : n
      )
    }));
  },

  snoozeNotification: (notificationId, duration) => {
    const snoozedUntil = new Date(Date.now() + duration).toISOString();
    
    set((state) => ({
      notifications: state.notifications.map(n =>
        n.id === notificationId ? { ...n, snoozedUntil, isRead: true } : n
      ),
      unreadCount: state.notifications.find(n => n.id === notificationId && !n.isRead)
        ? Math.max(0, state.unreadCount - 1)
        : state.unreadCount
    }));
  },

  // Activity logging
  logActivity: (activity) => {
    const newActivity = {
      id: Date.now().toString(),
      ...activity,
      timestamp: new Date().toISOString()
    };

    set((state) => ({
      activities: [newActivity, ...state.activities].slice(0, 1000) // Keep last 1000 activities
    }));

    return newActivity;
  },

  // Preferences
  updatePreferences: (preferences) => {
    set((state) => ({
      preferences: { ...state.preferences, ...preferences }
    }));
  },

  updateChannelPreference: (notificationType, channel, enabled) => {
    set((state) => ({
      preferences: {
        ...state.preferences,
        channels: {
          ...state.preferences.channels,
          [notificationType]: {
            ...state.preferences.channels?.[notificationType],
            [channel]: enabled
          }
        }
      }
    }));
  },

  // Filtering
  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters }
    }));
  },

  clearFilters: () => {
    set({
      filters: {
        category: '',
        priority: '',
        read: null,
        dateRange: 'all'
      }
    });
  },

  // Get filtered notifications
  getFilteredNotifications: () => {
    const { notifications, filters } = get();
    let filtered = [...notifications];

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(n => n.category === filters.category);
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter(n => n.priority === filters.priority);
    }

    // Read status filter
    if (filters.read !== null) {
      filtered = filtered.filter(n => n.isRead === filters.read);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate;

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        filtered = filtered.filter(n => new Date(n.createdAt) >= startDate);
      }
    }

    return filtered;
  },

  // Get filtered activities
  getFilteredActivities: (filters = {}) => {
    const { activities } = get();
    let filtered = [...activities];

    if (filters.userId) {
      filtered = filtered.filter(a => a.userId === filters.userId);
    }

    if (filters.type) {
      filtered = filtered.filter(a => a.type === filters.type);
    }

    if (filters.dateRange) {
      const now = new Date();
      let startDate;

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        filtered = filtered.filter(a => new Date(a.timestamp) >= startDate);
      }
    }

    return filtered;
  },

  // Trigger notification (browser notification, sound, etc.)
  triggerNotification: (notification) => {
    const { preferences } = get();

    // Check quiet hours
    if (preferences[NOTIFICATION_PREFERENCES.QUIET_HOURS_ENABLED]) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [startHour, startMin] = preferences[NOTIFICATION_PREFERENCES.QUIET_HOURS_START].split(':').map(Number);
      const [endHour, endMin] = preferences[NOTIFICATION_PREFERENCES.QUIET_HOURS_END].split(':').map(Number);
      const quietStart = startHour * 60 + startMin;
      const quietEnd = endHour * 60 + endMin;

      if (quietStart <= quietEnd) {
        if (currentTime >= quietStart && currentTime < quietEnd) return;
      } else {
        if (currentTime >= quietStart || currentTime < quietEnd) return;
      }
    }

    // Desktop notification
    if (preferences[NOTIFICATION_PREFERENCES.DESKTOP_NOTIFICATIONS] && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icon.png',
          tag: notification.id
        });
      }
    }

    // Sound notification
    if (preferences[NOTIFICATION_PREFERENCES.SOUND_ENABLED]) {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});
    }

    // Vibration (mobile)
    if (preferences[NOTIFICATION_PREFERENCES.VIBRATION_ENABLED] && 'vibrate' in navigator) {
      navigator.vibrate(200);
    }
  },

  // Request notification permission
  requestNotificationPermission: async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  },

  // UI state
  setSelectedNotification: (notification) => set({ selectedNotification: notification }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error })
}));

export default useNotificationStore;