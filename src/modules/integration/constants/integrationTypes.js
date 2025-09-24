// Integration types and configurations
export const INTEGRATION_TYPES = {
  FACEBOOK: 'facebook',
  WHATSAPP: 'whatsapp',
  GOOGLE_FORMS: 'google_forms',
  HUBSPOT: 'hubspot',
  WEBHOOK: 'webhook',
  EMAIL: 'email',
  API: 'api'
};

export const INTEGRATION_STATUS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
  PENDING: 'pending',
  EXPIRED: 'expired'
};

export const INTEGRATION_CONFIGS = {
  [INTEGRATION_TYPES.FACEBOOK]: {
    name: 'Facebook Lead Ads',
    description: 'Automatically import leads from your Facebook ad campaigns',
    icon: '📘',
    color: 'bg-blue-600',
    fields: [
      { key: 'page_id', label: 'Facebook Page ID', type: 'text', required: true },
      { key: 'ad_account_id', label: 'Ad Account ID', type: 'text', required: true },
      { key: 'access_token', label: 'Access Token', type: 'password', required: true },
      { key: 'campaign_id', label: 'Campaign ID (optional)', type: 'text', required: false }
    ],
    features: ['Lead Import', 'Real-time Sync', 'Campaign Filtering']
  },
  [INTEGRATION_TYPES.WHATSAPP]: {
    name: 'WhatsApp Business',
    description: 'Connect WhatsApp Business API to receive and manage conversations',
    icon: '💬',
    color: 'bg-green-600',
    fields: [
      { key: 'phone_number', label: 'Business Phone Number', type: 'tel', required: true },
      { key: 'api_key', label: 'API Key', type: 'password', required: true },
      { key: 'webhook_url', label: 'Webhook URL', type: 'url', required: true }
    ],
    features: ['Two-way Messaging', 'Auto-responses', 'Lead Capture']
  },
  [INTEGRATION_TYPES.GOOGLE_FORMS]: {
    name: 'Google Forms',
    description: 'Import form submissions as leads automatically',
    icon: '📋',
    color: 'bg-yellow-600',
    fields: [
      { key: 'form_id', label: 'Form ID', type: 'text', required: true },
      { key: 'spreadsheet_id', label: 'Spreadsheet ID', type: 'text', required: true },
      { key: 'client_email', label: 'Service Account Email', type: 'email', required: true },
      { key: 'private_key', label: 'Private Key', type: 'textarea', required: true }
    ],
    features: ['Form Submission Import', 'Field Mapping', 'Auto-sync']
  },
  [INTEGRATION_TYPES.HUBSPOT]: {
    name: 'HubSpot',
    description: 'Sync contacts and deals with HubSpot CRM',
    icon: '🟠',
    color: 'bg-orange-600',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', required: true },
      { key: 'portal_id', label: 'Portal ID', type: 'text', required: true }
    ],
    features: ['Two-way Sync', 'Contact Import/Export', 'Deal Tracking']
  },
  [INTEGRATION_TYPES.WEBHOOK]: {
    name: 'Custom Webhook',
    description: 'Set up custom webhooks to receive data from any source',
    icon: '🔗',
    color: 'bg-purple-600',
    fields: [
      { key: 'webhook_name', label: 'Webhook Name', type: 'text', required: true },
      { key: 'webhook_secret', label: 'Secret Key', type: 'password', required: false }
    ],
    features: ['Custom Endpoints', 'Payload Validation', 'Request Logs']
  },
  [INTEGRATION_TYPES.EMAIL]: {
    name: 'Email Integration',
    description: 'Parse emails and create leads automatically',
    icon: '✉️',
    color: 'bg-gray-600',
    fields: [
      { key: 'email_address', label: 'Email Address', type: 'email', required: true },
      { key: 'imap_server', label: 'IMAP Server', type: 'text', required: true },
      { key: 'imap_password', label: 'Password', type: 'password', required: true }
    ],
    features: ['Email Parsing', 'Attachment Handling', 'Auto-categorization']
  }
};

// Webhook events
export const WEBHOOK_EVENTS = {
  LEAD_CREATED: 'lead.created',
  LEAD_UPDATED: 'lead.updated',
  LEAD_ASSIGNED: 'lead.assigned',
  LEAD_STATUS_CHANGED: 'lead.status_changed',
  DEAL_WON: 'deal.won',
  DEAL_LOST: 'deal.lost',
  ACTIVITY_CREATED: 'activity.created'
};

// API permissions
export const API_PERMISSIONS = {
  READ_LEADS: 'leads:read',
  WRITE_LEADS: 'leads:write',
  DELETE_LEADS: 'leads:delete',
  READ_USERS: 'users:read',
  WRITE_USERS: 'users:write',
  READ_ANALYTICS: 'analytics:read',
  MANAGE_INTEGRATIONS: 'integrations:manage'
};

// Theme options
export const THEME_OPTIONS = {
  colors: {
    primary: [
      { name: 'Teal', value: '#0D9488' },
      { name: 'Blue', value: '#2563EB' },
      { name: 'Purple', value: '#7C3AED' },
      { name: 'Green', value: '#10B981' },
      { name: 'Red', value: '#EF4444' },
      { name: 'Orange', value: '#F97316' }
    ],
    dark: [
      { name: 'Gray', value: '#111827' },
      { name: 'Black', value: '#000000' },
      { name: 'Navy', value: '#0F172A' },
      { name: 'Midnight', value: '#1E293B' }
    ]
  },
  fonts: {
    heading: ['Inter', 'Poppins', 'Montserrat', 'Playfair Display'],
    body: ['Inter', 'Open Sans', 'Roboto', 'Lato']
  }
};