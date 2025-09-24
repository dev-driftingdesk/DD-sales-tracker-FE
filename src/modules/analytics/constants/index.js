// Analytics constants
export const DATE_RANGES = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  THIS_WEEK: 'this_week',
  LAST_WEEK: 'last_week',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  THIS_QUARTER: 'this_quarter',
  LAST_QUARTER: 'last_quarter',
  THIS_YEAR: 'this_year',
  LAST_YEAR: 'last_year',
  CUSTOM: 'custom'
};

export const DATE_RANGE_LABELS = {
  [DATE_RANGES.TODAY]: 'Today',
  [DATE_RANGES.YESTERDAY]: 'Yesterday',
  [DATE_RANGES.THIS_WEEK]: 'This Week',
  [DATE_RANGES.LAST_WEEK]: 'Last Week',
  [DATE_RANGES.THIS_MONTH]: 'This Month',
  [DATE_RANGES.LAST_MONTH]: 'Last Month',
  [DATE_RANGES.THIS_QUARTER]: 'This Quarter',
  [DATE_RANGES.LAST_QUARTER]: 'Last Quarter',
  [DATE_RANGES.THIS_YEAR]: 'This Year',
  [DATE_RANGES.LAST_YEAR]: 'Last Year',
  [DATE_RANGES.CUSTOM]: 'Custom Range'
};

// Chart types
export const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  PIE: 'pie',
  DONUT: 'donut',
  AREA: 'area',
  FUNNEL: 'funnel'
};

// Report types
export const REPORT_TYPES = {
  PIPELINE_VELOCITY: 'pipeline_velocity',
  SOURCE_CONVERSION: 'source_conversion',
  DEAL_STAGE_ANALYSIS: 'deal_stage_analysis',
  SALES_CYCLE_LENGTH: 'sales_cycle_length',
  REP_PERFORMANCE: 'rep_performance',
  REVENUE_ANALYSIS: 'revenue_analysis',
  TEAM_COMPARISON: 'team_comparison',
  CAMPAIGN_EFFECTIVENESS: 'campaign_effectiveness'
};

// Export formats
export const EXPORT_FORMATS = {
  CSV: 'csv',
  EXCEL: 'excel',
  PDF: 'pdf',
  PNG: 'png'
};

// Metric definitions
export const METRICS = {
  TOTAL_REVENUE: {
    key: 'total_revenue',
    label: 'Total Revenue',
    format: 'currency',
    color: '#10B981'
  },
  TOTAL_LEADS: {
    key: 'total_leads',
    label: 'Total Leads',
    format: 'number',
    color: '#3B82F6'
  },
  CONVERSION_RATE: {
    key: 'conversion_rate',
    label: 'Conversion Rate',
    format: 'percentage',
    color: '#F59E0B'
  },
  AVERAGE_DEAL_SIZE: {
    key: 'average_deal_size',
    label: 'Average Deal Size',
    format: 'currency',
    color: '#8B5CF6'
  },
  SALES_CYCLE_DAYS: {
    key: 'sales_cycle_days',
    label: 'Avg Sales Cycle (Days)',
    format: 'number',
    color: '#EF4444'
  },
  WIN_RATE: {
    key: 'win_rate',
    label: 'Win Rate',
    format: 'percentage',
    color: '#06B6D4'
  }
};

// Pipeline stages for analysis
export const PIPELINE_STAGES = [
  'new',
  'contacted',
  'in_progress',
  'proposal_sent',
  'negotiation',
  'won',
  'lost'
];

// Colors for charts
export const CHART_COLORS = [
  '#10B981', // Green
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6366F1'  // Indigo
];