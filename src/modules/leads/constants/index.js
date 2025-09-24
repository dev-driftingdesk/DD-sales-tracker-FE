export const LEAD_STATUSES = {
  NEW: 'new',
  CONTACTED: 'contacted',
  IN_PROGRESS: 'in_progress',
  WON: 'won',
  LOST: 'lost'
};

export const LEAD_STATUS_LABELS = {
  [LEAD_STATUSES.NEW]: 'New',
  [LEAD_STATUSES.CONTACTED]: 'Contacted',
  [LEAD_STATUSES.IN_PROGRESS]: 'In Progress',
  [LEAD_STATUSES.WON]: 'Won',
  [LEAD_STATUSES.LOST]: 'Lost'
};

export const LEAD_STATUS_COLORS = {
  [LEAD_STATUSES.NEW]: 'bg-blue-100 text-blue-600',
  [LEAD_STATUSES.CONTACTED]: 'bg-yellow-100 text-yellow-600',
  [LEAD_STATUSES.IN_PROGRESS]: 'bg-purple-100 text-purple-600',
  [LEAD_STATUSES.WON]: 'bg-green-100 text-green-600',
  [LEAD_STATUSES.LOST]: 'bg-red-100 text-red-600'
};

export const LEAD_SOURCES = {
  WEBSITE: 'website',
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram',
  WHATSAPP: 'whatsapp',
  EMAIL: 'email',
  EVENT: 'event',
  MANUAL: 'manual',
  REFERRAL: 'referral',
  COLD_CALL: 'cold_call',
  LINKEDIN: 'linkedin'
};

export const LEAD_SOURCE_LABELS = {
  [LEAD_SOURCES.WEBSITE]: 'Website',
  [LEAD_SOURCES.FACEBOOK]: 'Facebook',
  [LEAD_SOURCES.INSTAGRAM]: 'Instagram',
  [LEAD_SOURCES.WHATSAPP]: 'WhatsApp',
  [LEAD_SOURCES.EMAIL]: 'Email',
  [LEAD_SOURCES.EVENT]: 'Event',
  [LEAD_SOURCES.MANUAL]: 'Manual Entry',
  [LEAD_SOURCES.REFERRAL]: 'Referral',
  [LEAD_SOURCES.COLD_CALL]: 'Cold Call',
  [LEAD_SOURCES.LINKEDIN]: 'LinkedIn'
};

export const ACTIVITY_TYPES = {
  CALL: 'call',
  EMAIL: 'email',
  MEETING: 'meeting',
  NOTE: 'note',
  STATUS_CHANGE: 'status_change',
  FOLLOW_UP: 'follow_up',
  DEMO: 'demo',
  PROPOSAL: 'proposal',
  QUOTE: 'quote',
  CONTRACT: 'contract',
  TASK: 'task',
  REMINDER: 'reminder',
  LEAD_CREATED: 'lead_created',
  LEAD_ASSIGNED: 'lead_assigned',
  PRODUCT_CHANGED: 'product_changed',
  TEAM_MEMBER_ADDED: 'team_member_added',
  TEAM_MEMBER_REMOVED: 'team_member_removed'
};

export const ACTIVITY_TYPE_LABELS = {
  [ACTIVITY_TYPES.CALL]: 'Phone Call',
  [ACTIVITY_TYPES.EMAIL]: 'Email',
  [ACTIVITY_TYPES.MEETING]: 'Meeting',
  [ACTIVITY_TYPES.NOTE]: 'Note',
  [ACTIVITY_TYPES.STATUS_CHANGE]: 'Status Change',
  [ACTIVITY_TYPES.FOLLOW_UP]: 'Follow Up',
  [ACTIVITY_TYPES.DEMO]: 'Demo/Presentation',
  [ACTIVITY_TYPES.PROPOSAL]: 'Proposal Sent',
  [ACTIVITY_TYPES.QUOTE]: 'Quote Sent',
  [ACTIVITY_TYPES.CONTRACT]: 'Contract',
  [ACTIVITY_TYPES.TASK]: 'Task',
  [ACTIVITY_TYPES.REMINDER]: 'Reminder',
  [ACTIVITY_TYPES.LEAD_CREATED]: 'Lead Created',
  [ACTIVITY_TYPES.LEAD_ASSIGNED]: 'Lead Assigned',
  [ACTIVITY_TYPES.PRODUCT_CHANGED]: 'Product Changed',
  [ACTIVITY_TYPES.TEAM_MEMBER_ADDED]: 'Team Member Added',
  [ACTIVITY_TYPES.TEAM_MEMBER_REMOVED]: 'Team Member Removed'
};

export const ACTIVITY_TYPE_COLORS = {
  [ACTIVITY_TYPES.CALL]: 'bg-blue-100 text-blue-700 border-blue-200',
  [ACTIVITY_TYPES.EMAIL]: 'bg-green-100 text-green-700 border-green-200',
  [ACTIVITY_TYPES.MEETING]: 'bg-purple-100 text-purple-700 border-purple-200',
  [ACTIVITY_TYPES.NOTE]: 'bg-gray-100 text-gray-700 border-gray-200',
  [ACTIVITY_TYPES.STATUS_CHANGE]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  [ACTIVITY_TYPES.FOLLOW_UP]: 'bg-orange-100 text-orange-700 border-orange-200',
  [ACTIVITY_TYPES.DEMO]: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  [ACTIVITY_TYPES.PROPOSAL]: 'bg-pink-100 text-pink-700 border-pink-200',
  [ACTIVITY_TYPES.QUOTE]: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  [ACTIVITY_TYPES.CONTRACT]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  [ACTIVITY_TYPES.TASK]: 'bg-amber-100 text-amber-700 border-amber-200',
  [ACTIVITY_TYPES.REMINDER]: 'bg-red-100 text-red-700 border-red-200',
  [ACTIVITY_TYPES.LEAD_CREATED]: 'bg-teal-100 text-teal-700 border-teal-200',
  [ACTIVITY_TYPES.LEAD_ASSIGNED]: 'bg-blue-100 text-blue-700 border-blue-200',
  [ACTIVITY_TYPES.PRODUCT_CHANGED]: 'bg-violet-100 text-violet-700 border-violet-200',
  [ACTIVITY_TYPES.TEAM_MEMBER_ADDED]: 'bg-green-100 text-green-700 border-green-200',
  [ACTIVITY_TYPES.TEAM_MEMBER_REMOVED]: 'bg-red-100 text-red-700 border-red-200'
};

export const ACTIVITY_TYPE_ICONS = {
  [ACTIVITY_TYPES.CALL]: 'Phone',
  [ACTIVITY_TYPES.EMAIL]: 'Mail',
  [ACTIVITY_TYPES.MEETING]: 'Calendar',
  [ACTIVITY_TYPES.NOTE]: 'FileText',
  [ACTIVITY_TYPES.STATUS_CHANGE]: 'ArrowRight',
  [ACTIVITY_TYPES.FOLLOW_UP]: 'Clock',
  [ACTIVITY_TYPES.DEMO]: 'Monitor',
  [ACTIVITY_TYPES.PROPOSAL]: 'FileCheck',
  [ACTIVITY_TYPES.QUOTE]: 'DollarSign',
  [ACTIVITY_TYPES.CONTRACT]: 'FileSignature',
  [ACTIVITY_TYPES.TASK]: 'CheckSquare',
  [ACTIVITY_TYPES.REMINDER]: 'Bell',
  [ACTIVITY_TYPES.LEAD_CREATED]: 'UserPlus',
  [ACTIVITY_TYPES.LEAD_ASSIGNED]: 'UserCheck',
  [ACTIVITY_TYPES.PRODUCT_CHANGED]: 'Package',
  [ACTIVITY_TYPES.TEAM_MEMBER_ADDED]: 'Users',
  [ACTIVITY_TYPES.TEAM_MEMBER_REMOVED]: 'UserMinus'
};