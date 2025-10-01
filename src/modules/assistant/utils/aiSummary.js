import useLeadStore from '../../leads/stores/leadStore';
import useUserStore from '../../../stores/userStore.jsx';
import { LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS } from '../../leads/constants/index';

// Generate AI summary for a lead
export const generateLeadSummary = (lead) => {
  if (!lead) return null;
  
  const summary = {
    overview: generateOverview(lead),
    keyInfo: generateKeyInfo(lead),
    timeline: generateTimeline(lead),
    nextSteps: generateNextSteps(lead),
    insights: generateInsights(lead)
  };
  
  return summary;
};

// Generate overview section
const generateOverview = (lead) => {
  const daysSinceCreated = Math.floor((new Date() - new Date(lead.createdAt)) / (1000 * 60 * 60 * 24));
  const daysSinceLastActivity = lead.updatedAt 
    ? Math.floor((new Date() - new Date(lead.updatedAt)) / (1000 * 60 * 60 * 24))
    : daysSinceCreated;
  
  let overview = `${lead.companyName} is a ${lead.status} lead`;
  
  if (lead.location) {
    overview += ` based in ${lead.location}`;
  }
  
  overview += `, first contacted ${daysSinceCreated} days ago through ${LEAD_SOURCE_LABELS[lead.source] || lead.source}.`;
  
  if (lead.productInterest) {
    overview += ` They are interested in ${lead.productInterest}.`;
  }
  
  if (lead.dealValue) {
    overview += ` Potential deal value: $${lead.dealValue.toLocaleString()}.`;
  }
  
  if (daysSinceLastActivity > 3) {
    overview += ` ⚠️ No activity in the last ${daysSinceLastActivity} days.`;
  }
  
  return overview;
};

// Generate key information
const generateKeyInfo = (lead) => {
  const info = [];
  
  info.push({
    label: 'Contact',
    value: lead.contactName || 'Not specified',
    icon: '👤'
  });
  
  info.push({
    label: 'Status',
    value: LEAD_STATUS_LABELS[lead.status] || lead.status,
    icon: '📊'
  });
  
  if (lead.assignedTo) {
    const users = useUserStore.getState().users;
    const assignedUser = users.find(u => u.id === lead.assignedTo);
    info.push({
      label: 'Assigned to',
      value: assignedUser?.name || lead.assignedTo,
      icon: '🧑‍💼'
    });
  }
  
  if (lead.language && lead.language !== 'english') {
    info.push({
      label: 'Preferred Language',
      value: lead.language.charAt(0).toUpperCase() + lead.language.slice(1),
      icon: '🌐'
    });
  }
  
  if (lead.tags && lead.tags.length > 0) {
    info.push({
      label: 'Tags',
      value: lead.tags.join(', '),
      icon: '🏷️'
    });
  }
  
  return info;
};

// Generate timeline of activities
const generateTimeline = (lead) => {
  const timeline = [];
  
  // Add creation event
  timeline.push({
    date: new Date(lead.createdAt),
    type: 'created',
    description: `Lead created from ${LEAD_SOURCE_LABELS[lead.source] || lead.source}`,
    icon: '🆕'
  });
  
  // Add activities
  if (lead.activities && lead.activities.length > 0) {
    lead.activities.forEach(activity => {
      timeline.push({
        date: new Date(activity.timestamp),
        type: activity.type,
        description: activity.description,
        user: activity.user,
        icon: getActivityIcon(activity.type)
      });
    });
  }
  
  // Add status changes
  if (lead.status === 'won' && lead.closedDate) {
    timeline.push({
      date: new Date(lead.closedDate),
      type: 'won',
      description: `Deal closed for $${(lead.closedValue || lead.dealValue || 0).toLocaleString()}`,
      icon: '🎉'
    });
  }
  
  // Sort by date (most recent first)
  timeline.sort((a, b) => b.date - a.date);
  
  return timeline;
};

// Generate next steps recommendations
const generateNextSteps = (lead) => {
  const steps = [];
  const daysSinceLastActivity = lead.updatedAt 
    ? Math.floor((new Date() - new Date(lead.updatedAt)) / (1000 * 60 * 60 * 24))
    : Math.floor((new Date() - new Date(lead.createdAt)) / (1000 * 60 * 60 * 24));
  
  // Based on status
  switch (lead.status) {
    case 'new':
      steps.push({
        priority: 'high',
        action: 'Make initial contact',
        suggestion: 'Send an introductory email or make a phone call',
        icon: '📞'
      });
      break;
      
    case 'contacted':
      if (daysSinceLastActivity > 2) {
        steps.push({
          priority: 'high',
          action: 'Follow up',
          suggestion: 'Send a follow-up message to maintain engagement',
          icon: '📧'
        });
      }
      steps.push({
        priority: 'medium',
        action: 'Schedule a meeting',
        suggestion: 'Propose a video call or in-person meeting',
        icon: '📅'
      });
      break;
      
    case 'in_progress':
      steps.push({
        priority: 'high',
        action: 'Send proposal',
        suggestion: 'Prepare and send a detailed proposal with pricing',
        icon: '📋'
      });
      if (lead.dealValue > 50000) {
        steps.push({
          priority: 'medium',
          action: 'Involve senior team',
          suggestion: 'Consider bringing in senior sales manager for high-value deal',
          icon: '👥'
        });
      }
      break;
  }
  
  // General recommendations
  if (daysSinceLastActivity > 5) {
    steps.unshift({
      priority: 'urgent',
      action: 'Re-engage immediately',
      suggestion: `No activity for ${daysSinceLastActivity} days - reach out today`,
      icon: '🚨'
    });
  }
  
  if (!lead.notes || lead.notes.length < 20) {
    steps.push({
      priority: 'low',
      action: 'Add detailed notes',
      suggestion: 'Document key requirements and conversation points',
      icon: '📝'
    });
  }
  
  return steps;
};

// Generate insights
const generateInsights = (lead) => {
  const insights = [];
  
  // Deal value insight
  if (lead.dealValue) {
    if (lead.dealValue > 100000) {
      insights.push({
        type: 'opportunity',
        text: 'High-value opportunity - prioritize this lead',
        icon: '💎'
      });
    } else if (lead.dealValue < 5000) {
      insights.push({
        type: 'info',
        text: 'Lower value deal - consider automation',
        icon: '🤖'
      });
    }
  }
  
  // Location-based insights
  if (lead.location) {
    if (lead.location.toLowerCase().includes('dubai') || lead.location.toLowerCase().includes('uae')) {
      insights.push({
        type: 'tip',
        text: 'UAE market - consider Arabic-speaking rep',
        icon: '🌍'
      });
    }
  }
  
  // Source-based insights
  if (lead.source === 'facebook') {
    insights.push({
      type: 'info',
      text: 'Facebook lead - typically requires faster response time',
      icon: '⚡'
    });
  } else if (lead.source === 'event') {
    insights.push({
      type: 'tip',
      text: 'Event lead - reference the event in your outreach',
      icon: '🎪'
    });
  }
  
  // Activity patterns
  if (lead.activities && lead.activities.length > 5) {
    insights.push({
      type: 'positive',
      text: 'High engagement - good prospect for conversion',
      icon: '📈'
    });
  }
  
  return insights;
};

// Get activity icon
const getActivityIcon = (type) => {
  const icons = {
    call: '📞',
    email: '📧',
    meeting: '👥',
    note: '📝',
    status_change: '🔄',
    task: '✅'
  };
  return icons[type] || '📌';
};

// Generate email draft suggestions
export const generateEmailDrafts = (lead, context = {}) => {
  const drafts = [];
  const { lastActivity, purpose } = context;
  
  // Determine the appropriate email type
  if (lead.status === 'new') {
    // Initial outreach
    drafts.push({
      subject: `Premium Tea Solutions for ${lead.companyName}`,
      body: `Dear ${lead.contactName || 'Sir/Madam'},

I hope this message finds you well. I noticed your interest in ${lead.productInterest || 'our tea products'} and wanted to reach out personally.

We specialize in providing premium tea solutions for businesses like ${lead.companyName}. Our clients particularly value:

• Exclusive blends sourced directly from top estates
• Competitive wholesale pricing
• Reliable international shipping
• Dedicated account management

I'd love to understand your specific requirements and show you how we can add value to your business. Would you be available for a brief call this week?

Best regards,
[Your Name]`,
      tone: 'professional',
      purpose: 'introduction'
    });
    
    // Shorter, more casual version
    drafts.push({
      subject: `Quick question about your tea needs`,
      body: `Hi ${lead.contactName || 'there'},

Saw that ${lead.companyName} might be looking for ${lead.productInterest || 'quality tea suppliers'}. 

We work with similar businesses in ${lead.location || 'your region'} and typically help them:
- Save 15-20% on bulk orders
- Access exclusive blends
- Get faster delivery times

Worth a quick chat? I have 15 minutes free tomorrow afternoon.

Cheers,
[Your Name]`,
      tone: 'casual',
      purpose: 'introduction'
    });
  } else if (lead.status === 'contacted') {
    // Follow-up email
    drafts.push({
      subject: `Following up - ${lead.companyName} tea requirements`,
      body: `Hi ${lead.contactName || 'there'},

I wanted to follow up on our previous conversation about ${lead.productInterest || 'your tea requirements'}.

${lastActivity ? `Last time we discussed ${lastActivity.description}.` : ''}

I've prepared some options that might interest you:

1. Sample pack of our ${lead.productInterest || 'premium collection'}
2. Detailed pricing for bulk orders
3. Information about our ${lead.location ? 'shipping to ' + lead.location : 'international shipping'}

Which would be most helpful for you at this stage?

Looking forward to your thoughts.

Best,
[Your Name]`,
      tone: 'professional',
      purpose: 'follow-up'
    });
  } else if (lead.status === 'in_progress') {
    // Proposal follow-up
    drafts.push({
      subject: `Proposal for ${lead.companyName} - Next Steps`,
      body: `Dear ${lead.contactName || 'Sir/Madam'},

Thank you for taking the time to review our proposal for ${lead.dealValue ? '$' + lead.dealValue.toLocaleString() + ' worth of ' : ''}${lead.productInterest || 'premium tea products'}.

To move forward, we would need:
1. Confirmation of the quantities and blends
2. Preferred delivery schedule
3. Any specific packaging requirements

We're ready to begin fulfillment as soon as we receive your approval. As discussed, we can offer:
- ${lead.dealValue > 50000 ? '10% volume discount' : '5% early payment discount'}
- Free shipping on orders above $10,000
- Dedicated account manager

Please let me know if you have any questions or if you'd like to schedule a call to finalize details.

Best regards,
[Your Name]`,
      tone: 'professional',
      purpose: 'closing'
    });
  }
  
  // Add context-specific drafts
  if (purpose === 'reminder') {
    drafts.push({
      subject: `Quick reminder - ${lead.companyName}`,
      body: `Hi ${lead.contactName || 'there'},

Just a quick reminder about ${context.reminderTopic || 'our scheduled follow-up'}.

Let me know if you need any additional information.

Thanks,
[Your Name]`,
      tone: 'casual',
      purpose: 'reminder'
    });
  }
  
  return drafts;
};

// Generate conversation summary
export const generateConversationSummary = (lead) => {
  if (!lead.activities || lead.activities.length === 0) {
    return 'No conversation history available yet.';
  }
  
  const activities = [...lead.activities].sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  );
  
  let summary = `Conversation started ${new Date(lead.createdAt).toLocaleDateString()}. `;
  
  const callCount = activities.filter(a => a.type === 'call').length;
  const emailCount = activities.filter(a => a.type === 'email').length;
  const meetingCount = activities.filter(a => a.type === 'meeting').length;
  
  if (callCount > 0) summary += `${callCount} call${callCount > 1 ? 's' : ''}. `;
  if (emailCount > 0) summary += `${emailCount} email${emailCount > 1 ? 's' : ''}. `;
  if (meetingCount > 0) summary += `${meetingCount} meeting${meetingCount > 1 ? 's' : ''}. `;
  
  // Last meaningful activity
  const lastMeaningful = activities
    .filter(a => a.type !== 'status_change')
    .pop();
    
  if (lastMeaningful) {
    summary += `Last contact: ${lastMeaningful.description} (${new Date(lastMeaningful.timestamp).toLocaleDateString()}).`;
  }
  
  return summary;
};