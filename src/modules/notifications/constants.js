// Notification types
export const NOTIFICATION_TYPES = {
  LEAD_ASSIGNED: 'lead_assigned',
  LEAD_STATUS_CHANGED: 'lead_status_changed',
  DEAL_WON: 'deal_won',
  DEAL_LOST: 'deal_lost',
  TASK_ASSIGNED: 'task_assigned',
  TASK_COMPLETED: 'task_completed',
  TASK_OVERDUE: 'task_overdue',
  MEETING_SCHEDULED: 'meeting_scheduled',
  MEETING_REMINDER: 'meeting_reminder',
  TARGET_ACHIEVED: 'target_achieved',
  TEAM_ANNOUNCEMENT: 'team_announcement',
  SYSTEM_UPDATE: 'system_update',
  INTEGRATION_ALERT: 'integration_alert',
  PERFORMANCE_MILESTONE: 'performance_milestone',
  USER_MENTION: 'user_mention',
  COMMENT_ADDED: 'comment_added',
  DOCUMENT_SHARED: 'document_shared',
  APPROVAL_REQUIRED: 'approval_required',
  APPROVAL_GRANTED: 'approval_granted',
  WARNING: 'warning',
  ERROR: 'error'
};

// Notification priorities
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Notification categories
export const NOTIFICATION_CATEGORIES = {
  LEADS: 'leads',
  DEALS: 'deals',
  TASKS: 'tasks',
  MEETINGS: 'meetings',
  TEAM: 'team',
  SYSTEM: 'system',
  PERFORMANCE: 'performance',
  APPROVALS: 'approvals'
};

// Activity types
export const ACTIVITY_TYPES = {
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  LEAD_CREATED: 'lead_created',
  LEAD_UPDATED: 'lead_updated',
  LEAD_DELETED: 'lead_deleted',
  LEAD_ASSIGNED: 'lead_assigned',
  LEAD_STATUS_CHANGED: 'lead_status_changed',
  DEAL_CREATED: 'deal_created',
  DEAL_UPDATED: 'deal_updated',
  DEAL_WON: 'deal_won',
  DEAL_LOST: 'deal_lost',
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated',
  TASK_COMPLETED: 'task_completed',
  TASK_DELETED: 'task_deleted',
  MEETING_CREATED: 'meeting_created',
  MEETING_UPDATED: 'meeting_updated',
  MEETING_COMPLETED: 'meeting_completed',
  MEETING_CANCELLED: 'meeting_cancelled',
  COMMENT_ADDED: 'comment_added',
  COMMENT_DELETED: 'comment_deleted',
  FILE_UPLOADED: 'file_uploaded',
  FILE_DELETED: 'file_deleted',
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DEACTIVATED: 'user_deactivated',
  TEAM_CREATED: 'team_created',
  TEAM_UPDATED: 'team_updated',
  INTEGRATION_CONNECTED: 'integration_connected',
  INTEGRATION_DISCONNECTED: 'integration_disconnected',
  EXPORT_COMPLETED: 'export_completed',
  IMPORT_COMPLETED: 'import_completed',
  SETTINGS_UPDATED: 'settings_updated'
};

// Notification preference keys
export const NOTIFICATION_PREFERENCES = {
  EMAIL_NOTIFICATIONS: 'email_notifications',
  PUSH_NOTIFICATIONS: 'push_notifications',
  IN_APP_NOTIFICATIONS: 'in_app_notifications',
  SMS_NOTIFICATIONS: 'sms_notifications',
  DESKTOP_NOTIFICATIONS: 'desktop_notifications',
  SOUND_ENABLED: 'sound_enabled',
  VIBRATION_ENABLED: 'vibration_enabled',
  QUIET_HOURS_ENABLED: 'quiet_hours_enabled',
  QUIET_HOURS_START: 'quiet_hours_start',
  QUIET_HOURS_END: 'quiet_hours_end'
};

// Notification channel preferences
export const CHANNEL_PREFERENCES = {
  [NOTIFICATION_TYPES.LEAD_ASSIGNED]: {
    email: true,
    push: true,
    inApp: true,
    sms: false
  },
  [NOTIFICATION_TYPES.DEAL_WON]: {
    email: true,
    push: true,
    inApp: true,
    sms: true
  },
  [NOTIFICATION_TYPES.TASK_OVERDUE]: {
    email: true,
    push: true,
    inApp: true,
    sms: false
  },
  [NOTIFICATION_TYPES.MEETING_REMINDER]: {
    email: true,
    push: true,
    inApp: true,
    sms: true
  },
  [NOTIFICATION_TYPES.TARGET_ACHIEVED]: {
    email: true,
    push: true,
    inApp: true,
    sms: false
  },
  [NOTIFICATION_TYPES.TEAM_ANNOUNCEMENT]: {
    email: true,
    push: false,
    inApp: true,
    sms: false
  },
  [NOTIFICATION_TYPES.SYSTEM_UPDATE]: {
    email: false,
    push: false,
    inApp: true,
    sms: false
  }
};

// Labels
export const NOTIFICATION_TYPE_LABELS = {
  [NOTIFICATION_TYPES.LEAD_ASSIGNED]: 'Lead Assigned',
  [NOTIFICATION_TYPES.LEAD_STATUS_CHANGED]: 'Lead Status Changed',
  [NOTIFICATION_TYPES.DEAL_WON]: 'Deal Won',
  [NOTIFICATION_TYPES.DEAL_LOST]: 'Deal Lost',
  [NOTIFICATION_TYPES.TASK_ASSIGNED]: 'Task Assigned',
  [NOTIFICATION_TYPES.TASK_COMPLETED]: 'Task Completed',
  [NOTIFICATION_TYPES.TASK_OVERDUE]: 'Task Overdue',
  [NOTIFICATION_TYPES.MEETING_SCHEDULED]: 'Meeting Scheduled',
  [NOTIFICATION_TYPES.MEETING_REMINDER]: 'Meeting Reminder',
  [NOTIFICATION_TYPES.TARGET_ACHIEVED]: 'Target Achieved',
  [NOTIFICATION_TYPES.TEAM_ANNOUNCEMENT]: 'Team Announcement',
  [NOTIFICATION_TYPES.SYSTEM_UPDATE]: 'System Update',
  [NOTIFICATION_TYPES.INTEGRATION_ALERT]: 'Integration Alert',
  [NOTIFICATION_TYPES.PERFORMANCE_MILESTONE]: 'Performance Milestone',
  [NOTIFICATION_TYPES.USER_MENTION]: 'User Mention',
  [NOTIFICATION_TYPES.COMMENT_ADDED]: 'Comment Added',
  [NOTIFICATION_TYPES.DOCUMENT_SHARED]: 'Document Shared',
  [NOTIFICATION_TYPES.APPROVAL_REQUIRED]: 'Approval Required',
  [NOTIFICATION_TYPES.APPROVAL_GRANTED]: 'Approval Granted',
  [NOTIFICATION_TYPES.WARNING]: 'Warning',
  [NOTIFICATION_TYPES.ERROR]: 'Error'
};

export const NOTIFICATION_PRIORITY_LABELS = {
  [NOTIFICATION_PRIORITIES.LOW]: 'Low',
  [NOTIFICATION_PRIORITIES.MEDIUM]: 'Medium',
  [NOTIFICATION_PRIORITIES.HIGH]: 'High',
  [NOTIFICATION_PRIORITIES.URGENT]: 'Urgent'
};

export const NOTIFICATION_CATEGORY_LABELS = {
  [NOTIFICATION_CATEGORIES.LEADS]: 'Leads',
  [NOTIFICATION_CATEGORIES.DEALS]: 'Deals',
  [NOTIFICATION_CATEGORIES.TASKS]: 'Tasks',
  [NOTIFICATION_CATEGORIES.MEETINGS]: 'Meetings',
  [NOTIFICATION_CATEGORIES.TEAM]: 'Team',
  [NOTIFICATION_CATEGORIES.SYSTEM]: 'System',
  [NOTIFICATION_CATEGORIES.PERFORMANCE]: 'Performance',
  [NOTIFICATION_CATEGORIES.APPROVALS]: 'Approvals'
};

export const ACTIVITY_TYPE_LABELS = {
  [ACTIVITY_TYPES.USER_LOGIN]: 'User Login',
  [ACTIVITY_TYPES.USER_LOGOUT]: 'User Logout',
  [ACTIVITY_TYPES.LEAD_CREATED]: 'Lead Created',
  [ACTIVITY_TYPES.LEAD_UPDATED]: 'Lead Updated',
  [ACTIVITY_TYPES.LEAD_DELETED]: 'Lead Deleted',
  [ACTIVITY_TYPES.LEAD_ASSIGNED]: 'Lead Assigned',
  [ACTIVITY_TYPES.LEAD_STATUS_CHANGED]: 'Lead Status Changed',
  [ACTIVITY_TYPES.DEAL_CREATED]: 'Deal Created',
  [ACTIVITY_TYPES.DEAL_UPDATED]: 'Deal Updated',
  [ACTIVITY_TYPES.DEAL_WON]: 'Deal Won',
  [ACTIVITY_TYPES.DEAL_LOST]: 'Deal Lost',
  [ACTIVITY_TYPES.TASK_CREATED]: 'Task Created',
  [ACTIVITY_TYPES.TASK_UPDATED]: 'Task Updated',
  [ACTIVITY_TYPES.TASK_COMPLETED]: 'Task Completed',
  [ACTIVITY_TYPES.TASK_DELETED]: 'Task Deleted',
  [ACTIVITY_TYPES.MEETING_CREATED]: 'Meeting Created',
  [ACTIVITY_TYPES.MEETING_UPDATED]: 'Meeting Updated',
  [ACTIVITY_TYPES.MEETING_COMPLETED]: 'Meeting Completed',
  [ACTIVITY_TYPES.MEETING_CANCELLED]: 'Meeting Cancelled',
  [ACTIVITY_TYPES.COMMENT_ADDED]: 'Comment Added',
  [ACTIVITY_TYPES.COMMENT_DELETED]: 'Comment Deleted',
  [ACTIVITY_TYPES.FILE_UPLOADED]: 'File Uploaded',
  [ACTIVITY_TYPES.FILE_DELETED]: 'File Deleted',
  [ACTIVITY_TYPES.USER_CREATED]: 'User Created',
  [ACTIVITY_TYPES.USER_UPDATED]: 'User Updated',
  [ACTIVITY_TYPES.USER_DEACTIVATED]: 'User Deactivated',
  [ACTIVITY_TYPES.TEAM_CREATED]: 'Team Created',
  [ACTIVITY_TYPES.TEAM_UPDATED]: 'Team Updated',
  [ACTIVITY_TYPES.INTEGRATION_CONNECTED]: 'Integration Connected',
  [ACTIVITY_TYPES.INTEGRATION_DISCONNECTED]: 'Integration Disconnected',
  [ACTIVITY_TYPES.EXPORT_COMPLETED]: 'Export Completed',
  [ACTIVITY_TYPES.IMPORT_COMPLETED]: 'Import Completed',
  [ACTIVITY_TYPES.SETTINGS_UPDATED]: 'Settings Updated'
};

// Default notification settings
export const DEFAULT_NOTIFICATION_SETTINGS = {
  [NOTIFICATION_PREFERENCES.EMAIL_NOTIFICATIONS]: true,
  [NOTIFICATION_PREFERENCES.PUSH_NOTIFICATIONS]: true,
  [NOTIFICATION_PREFERENCES.IN_APP_NOTIFICATIONS]: true,
  [NOTIFICATION_PREFERENCES.SMS_NOTIFICATIONS]: false,
  [NOTIFICATION_PREFERENCES.DESKTOP_NOTIFICATIONS]: true,
  [NOTIFICATION_PREFERENCES.SOUND_ENABLED]: true,
  [NOTIFICATION_PREFERENCES.VIBRATION_ENABLED]: true,
  [NOTIFICATION_PREFERENCES.QUIET_HOURS_ENABLED]: false,
  [NOTIFICATION_PREFERENCES.QUIET_HOURS_START]: '22:00',
  [NOTIFICATION_PREFERENCES.QUIET_HOURS_END]: '08:00'
};

// Notification action types
export const NOTIFICATION_ACTIONS = {
  MARK_AS_READ: 'mark_as_read',
  MARK_AS_UNREAD: 'mark_as_unread',
  DELETE: 'delete',
  ARCHIVE: 'archive',
  SNOOZE: 'snooze',
  OPEN_DETAILS: 'open_details'
};