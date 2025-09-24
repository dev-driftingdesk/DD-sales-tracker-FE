/**
 * Time Metrics Utilities for SalesTracker
 * Handles calculations for Time to First Contact (TTFC) and Lead Response Time
 */

/**
 * Calculate Time to First Contact (TTFC)
 * @param {string} leadCreatedAt - ISO timestamp when lead was created
 * @param {string} firstContactAt - ISO timestamp of first contact activity
 * @returns {Object} { hours, minutes, totalMinutes, formattedTime, category }
 */
export const calculateTTFC = (leadCreatedAt, firstContactAt) => {
  if (!leadCreatedAt || !firstContactAt) {
    return {
      hours: null,
      minutes: null,
      totalMinutes: null,
      formattedTime: 'Not contacted',
      category: 'no-contact',
      status: 'No Contact'
    };
  }

  const leadTime = new Date(leadCreatedAt);
  const contactTime = new Date(firstContactAt);
  
  if (contactTime < leadTime) {
    return {
      hours: null,
      minutes: null,
      totalMinutes: null,
      formattedTime: 'Invalid data',
      category: 'invalid',
      status: 'Error'
    };
  }

  const diffMs = contactTime - leadTime;
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  // Categorize TTFC performance
  let category = 'excellent';
  let status = 'Excellent';
  
  if (totalMinutes <= 30) {
    category = 'excellent';
    status = 'Excellent';
  } else if (totalMinutes <= 120) { // 2 hours
    category = 'good';
    status = 'Good';
  } else if (totalMinutes <= 480) { // 8 hours
    category = 'fair';
    status = 'Fair';
  } else if (totalMinutes <= 1440) { // 24 hours
    category = 'poor';
    status = 'Poor';
  } else {
    category = 'very-poor';
    status = 'Very Poor';
  }

  // Format display time
  let formattedTime = '';
  if (hours > 0) {
    formattedTime = `${hours}h ${minutes}m`;
  } else {
    formattedTime = `${minutes}m`;
  }

  return {
    hours,
    minutes,
    totalMinutes,
    formattedTime,
    category,
    status
  };
};

/**
 * Calculate Lead Response Time for all responses
 * @param {Array} activities - Array of lead activities
 * @returns {Object} { avgResponseMinutes, formattedAvgTime, responses, category }
 */
export const calculateLeadResponseTime = (activities) => {
  if (!activities || activities.length === 0) {
    return {
      avgResponseMinutes: null,
      formattedAvgTime: 'No responses',
      responses: [],
      category: 'no-data',
      status: 'No Data'
    };
  }

  // Filter activities that are responses (emails, calls after lead messages)
  const responses = [];
  
  // Sort activities by timestamp
  const sortedActivities = activities
    .filter(activity => activity.createdAt)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  for (let i = 1; i < sortedActivities.length; i++) {
    const prevActivity = sortedActivities[i - 1];
    const currentActivity = sortedActivities[i];
    
    // Check if current activity is a response to previous lead communication
    if (isResponseActivity(prevActivity, currentActivity)) {
      const responseTime = new Date(currentActivity.createdAt) - new Date(prevActivity.createdAt);
      const responseMinutes = Math.floor(responseTime / (1000 * 60));
      
      responses.push({
        triggerActivity: prevActivity,
        responseActivity: currentActivity,
        responseMinutes,
        formattedTime: formatDuration(responseMinutes)
      });
    }
  }

  if (responses.length === 0) {
    return {
      avgResponseMinutes: null,
      formattedAvgTime: 'No responses tracked',
      responses: [],
      category: 'no-responses',
      status: 'No Responses'
    };
  }

  // Calculate average response time
  const totalResponseTime = responses.reduce((sum, response) => sum + response.responseMinutes, 0);
  const avgResponseMinutes = Math.floor(totalResponseTime / responses.length);

  // Categorize response time performance
  let category = 'excellent';
  let status = 'Excellent';
  
  if (avgResponseMinutes <= 30) {
    category = 'excellent';
    status = 'Excellent';
  } else if (avgResponseMinutes <= 120) { // 2 hours
    category = 'good';
    status = 'Good';
  } else if (avgResponseMinutes <= 480) { // 8 hours
    category = 'fair';
    status = 'Fair';
  } else if (avgResponseMinutes <= 1440) { // 24 hours
    category = 'poor';
    status = 'Poor';
  } else {
    category = 'very-poor';
    status = 'Very Poor';
  }

  return {
    avgResponseMinutes,
    formattedAvgTime: formatDuration(avgResponseMinutes),
    responses,
    category,
    status,
    totalResponses: responses.length
  };
};

/**
 * Check if an activity is a response to a previous lead communication
 * @param {Object} prevActivity - Previous activity
 * @param {Object} currentActivity - Current activity
 * @returns {boolean}
 */
const isResponseActivity = (prevActivity, currentActivity) => {
  // Define what constitutes a lead message vs. rep response
  const leadMessageTypes = ['email_received', 'call_received', 'message_received', 'inquiry'];
  const responseTypes = ['email', 'call', 'message_sent', 'follow_up'];
  
  // If previous activity is from lead and current is from rep
  if (prevActivity.type && currentActivity.type) {
    const isPrevFromLead = leadMessageTypes.includes(prevActivity.type.toLowerCase()) || 
                          prevActivity.isFromLead === true;
    const isCurrentResponse = responseTypes.includes(currentActivity.type.toLowerCase()) || 
                             currentActivity.isResponse === true;
    
    return isPrevFromLead && isCurrentResponse;
  }
  
  // Fallback: assume any activity following another within reasonable time is a response
  const timeDiff = new Date(currentActivity.createdAt) - new Date(prevActivity.createdAt);
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  // If activities are within 48 hours and current is outbound communication
  return hoursDiff <= 48 && ['email', 'call'].includes(currentActivity.type?.toLowerCase());
};

/**
 * Format duration in minutes to human-readable format
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
export const formatDuration = (minutes) => {
  if (minutes < 1) return '< 1m';
  if (minutes < 60) return `${minutes}m`;
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours < 24) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  if (remainingHours > 0) {
    return `${days}d ${remainingHours}h`;
  }
  return `${days}d`;
};

/**
 * Get performance color based on category
 * @param {string} category - Performance category
 * @returns {string} Tailwind CSS color class
 */
export const getPerformanceColor = (category) => {
  const colors = {
    'excellent': 'text-green-600 bg-green-50',
    'good': 'text-blue-600 bg-blue-50',
    'fair': 'text-yellow-600 bg-yellow-50',
    'poor': 'text-orange-600 bg-orange-50',
    'very-poor': 'text-red-600 bg-red-50',
    'no-contact': 'text-gray-500 bg-gray-50',
    'no-responses': 'text-gray-500 bg-gray-50',
    'no-data': 'text-gray-400 bg-gray-50',
    'invalid': 'text-red-500 bg-red-50'
  };
  
  return colors[category] || 'text-gray-500 bg-gray-50';
};

/**
 * Calculate team TTFC statistics
 * @param {Array} leads - Array of leads with activities
 * @returns {Object} Team TTFC statistics
 */
export const calculateTeamTTFCStats = (leads) => {
  const ttfcData = leads.map(lead => {
    const firstContactActivity = getFirstContactActivity(lead.activities);
    return calculateTTFC(lead.createdAt, firstContactActivity?.createdAt);
  }).filter(ttfc => ttfc.totalMinutes !== null);

  if (ttfcData.length === 0) {
    return {
      averageTTFC: null,
      medianTTFC: null,
      bestTTFC: null,
      worstTTFC: null,
      totalContactedLeads: 0,
      contactRate: 0
    };
  }

  const sortedTimes = ttfcData.map(t => t.totalMinutes).sort((a, b) => a - b);
  const sum = sortedTimes.reduce((acc, time) => acc + time, 0);
  
  return {
    averageTTFC: Math.floor(sum / sortedTimes.length),
    medianTTFC: sortedTimes[Math.floor(sortedTimes.length / 2)],
    bestTTFC: sortedTimes[0],
    worstTTFC: sortedTimes[sortedTimes.length - 1],
    totalContactedLeads: ttfcData.length,
    contactRate: Math.round((ttfcData.length / leads.length) * 100),
    formattedAverage: formatDuration(Math.floor(sum / sortedTimes.length)),
    formattedMedian: formatDuration(sortedTimes[Math.floor(sortedTimes.length / 2)]),
    formattedBest: formatDuration(sortedTimes[0]),
    formattedWorst: formatDuration(sortedTimes[sortedTimes.length - 1])
  };
};

/**
 * Get first contact activity from activities array
 * @param {Array} activities - Array of activities
 * @returns {Object|null} First contact activity
 */
export const getFirstContactActivity = (activities) => {
  if (!activities || activities.length === 0) return null;
  
  const contactTypes = ['call', 'email', 'message_sent', 'meeting', 'follow_up'];
  
  return activities
    .filter(activity => contactTypes.includes(activity.type?.toLowerCase()) && !activity.isFromLead)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0] || null;
};

/**
 * Calculate response time benchmarks
 * @param {Array} responseTimes - Array of response times in minutes
 * @returns {Object} Benchmark statistics
 */
export const calculateResponseTimeBenchmarks = (responseTimes) => {
  if (!responseTimes || responseTimes.length === 0) {
    return {
      excellent: 0, // <= 30 minutes
      good: 0,      // <= 2 hours
      fair: 0,      // <= 8 hours
      poor: 0,      // <= 24 hours
      veryPoor: 0   // > 24 hours
    };
  }

  const total = responseTimes.length;
  const counts = {
    excellent: responseTimes.filter(t => t <= 30).length,
    good: responseTimes.filter(t => t > 30 && t <= 120).length,
    fair: responseTimes.filter(t => t > 120 && t <= 480).length,
    poor: responseTimes.filter(t => t > 480 && t <= 1440).length,
    veryPoor: responseTimes.filter(t => t > 1440).length
  };

  return {
    excellent: Math.round((counts.excellent / total) * 100),
    good: Math.round((counts.good / total) * 100),
    fair: Math.round((counts.fair / total) * 100),
    poor: Math.round((counts.poor / total) * 100),
    veryPoor: Math.round((counts.veryPoor / total) * 100),
    totalResponses: total
  };
};

export default {
  calculateTTFC,
  calculateLeadResponseTime,
  formatDuration,
  getPerformanceColor,
  calculateTeamTTFCStats,
  getFirstContactActivity,
  calculateResponseTimeBenchmarks
};