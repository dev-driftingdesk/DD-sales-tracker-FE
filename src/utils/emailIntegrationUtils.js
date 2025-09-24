import useLeadStore from '../modules/leads/stores/leadStore';
import useEmailStore from '../modules/email/stores/emailStore';
import useNotificationStore from '../modules/notifications/stores/notificationStore';

/**
 * Email Integration Utilities
 * Handles integration between email system and lead management
 */

/**
 * Initialize cross-store integrations
 */
export const initializeEmailIntegrations = () => {
  // Make lead store available globally for email tracking
  if (typeof window !== 'undefined') {
    window.useLeadStore = useLeadStore;
  }
};

/**
 * Handle email events and update lead status accordingly
 */
export const handleEmailEvent = (eventType, emailId, trackingId, additionalData = {}) => {
  const { trackEmailOpen, trackEmailReply, trackLinkClick, emails } = useEmailStore.getState();
  const { addNotification } = useNotificationStore.getState();
  
  const email = emails.find(e => e.id === emailId || e.tracking?.trackingId === trackingId);
  
  if (!email) return;

  switch (eventType) {
    case 'email_opened':
      trackEmailOpen(trackingId);
      
      // Add notification
      if (email.leadId) {
        addNotification({
          type: 'email_opened',
          title: 'Email Opened',
          message: `${email.recipientName} opened your email: "${email.subject}"`,
          data: {
            emailId,
            leadId: email.leadId,
            recipientName: email.recipientName,
            subject: email.subject
          }
        });
      }
      break;

    case 'email_replied':
      trackEmailReply(trackingId, additionalData.replyData);
      
      // Add notification
      if (email.leadId) {
        addNotification({
          type: 'email_replied',
          title: 'Email Reply Received',
          message: `${email.recipientName} replied to your email: "${email.subject}"`,
          priority: 'high',
          data: {
            emailId,
            leadId: email.leadId,
            recipientName: email.recipientName,
            subject: email.subject,
            replyData: additionalData.replyData
          }
        });
      }
      break;

    case 'link_clicked':
      trackLinkClick(trackingId, additionalData.linkUrl);
      
      // Add notification for important link clicks
      if (email.leadId && additionalData.linkUrl) {
        addNotification({
          type: 'link_clicked',
          title: 'Email Link Clicked',
          message: `${email.recipientName} clicked a link in your email`,
          data: {
            emailId,
            leadId: email.leadId,
            recipientName: email.recipientName,
            linkUrl: additionalData.linkUrl
          }
        });
      }
      break;

    default:
      console.warn('Unknown email event type:', eventType);
  }
};

/**
 * Generate email tracking URL for external systems
 */
export const generateTrackingUrl = (trackingId, eventType = 'open') => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/api/email/track/${eventType}/${trackingId}`;
};

/**
 * Generate email with tracking pixels and tracked links
 */
export const enhanceEmailWithTracking = (emailContent, trackingId) => {
  if (!trackingId) return emailContent;
  
  // Add tracking pixel
  const trackingPixel = `<img src="${generateTrackingUrl(trackingId, 'open')}" width="1" height="1" style="display:none;" />`;
  
  // Convert links to tracked links
  const enhancedContent = emailContent.replace(
    /<a\s+([^>]*href\s*=\s*["']([^"']+)["'][^>]*)>/gi,
    (match, attributes, originalUrl) => {
      const trackedUrl = `${generateTrackingUrl(trackingId, 'click')}?url=${encodeURIComponent(originalUrl)}`;
      return `<a ${attributes.replace(/href\s*=\s*["'][^"']+["']/i, `href="${trackedUrl}"`)}>`;
    }
  );
  
  return enhancedContent + trackingPixel;
};

/**
 * Extract and validate email template variables
 */
export const validateTemplateVariables = (templateContent, recipientData) => {
  const variableRegex = /\{\{([^}]+)\}\}/g;
  const usedVariables = [];
  const missingVariables = [];
  
  let match;
  while ((match = variableRegex.exec(templateContent)) !== null) {
    const variable = match[1];
    usedVariables.push(variable);
    
    if (!recipientData.hasOwnProperty(variable)) {
      missingVariables.push(variable);
    }
  }
  
  return {
    usedVariables: [...new Set(usedVariables)],
    missingVariables: [...new Set(missingVariables)],
    isValid: missingVariables.length === 0
  };
};

/**
 * Auto-suggest email templates based on lead data
 */
export const suggestEmailTemplates = (lead, templates) => {
  const suggestions = [];
  
  templates.forEach(template => {
    let score = 0;
    
    // Score based on lead status
    if (lead.status === 'new' && template.category === 'cold-outreach') {
      score += 10;
    } else if (lead.status === 'contacted' && template.category === 'follow-up') {
      score += 10;
    } else if (lead.status === 'in_progress' && template.category === 'proposal') {
      score += 8;
    }
    
    // Score based on lead source
    if (lead.source === 'event' && template.tags?.includes('event')) {
      score += 5;
    } else if (lead.source === 'referral' && template.tags?.includes('referral')) {
      score += 5;
    }
    
    // Score based on industry match
    if (template.tags?.some(tag => 
      lead.industry?.toLowerCase().includes(tag.toLowerCase()) ||
      lead.companyName?.toLowerCase().includes(tag.toLowerCase())
    )) {
      score += 3;
    }
    
    // Score based on usage success
    if (template.usageCount > 10) {
      score += 2;
    }
    
    if (score > 0) {
      suggestions.push({
        template,
        score,
        reasons: score > 8 ? ['Highly recommended based on lead status and source'] :
                score > 5 ? ['Good match for lead profile'] :
                ['Suitable template option']
      });
    }
  });
  
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
};

/**
 * Calculate email engagement score for a lead
 */
export const calculateLeadEmailEngagement = (leadId, emails) => {
  const leadEmails = emails.filter(email => email.leadId === leadId);
  
  if (leadEmails.length === 0) return 0;
  
  let score = 0;
  let totalEmails = leadEmails.length;
  
  leadEmails.forEach(email => {
    if (email.tracking?.opened) score += 2;
    if (email.tracking?.replied) score += 5;
    if (email.tracking?.clickedLinks?.length > 0) score += 3;
  });
  
  // Calculate percentage-based score
  const maxPossibleScore = totalEmails * 10; // 10 is max per email (5 reply + 3 click + 2 open)
  const engagementScore = Math.min(100, (score / maxPossibleScore) * 100);
  
  return {
    score: Math.round(engagementScore),
    totalEmails,
    openedEmails: leadEmails.filter(e => e.tracking?.opened).length,
    repliedEmails: leadEmails.filter(e => e.tracking?.replied).length,
    clickedEmails: leadEmails.filter(e => e.tracking?.clickedLinks?.length > 0).length,
    category: engagementScore >= 70 ? 'high' :
              engagementScore >= 40 ? 'medium' :
              engagementScore >= 20 ? 'low' : 'very-low'
  };
};

/**
 * Email automation triggers
 */
export const checkEmailAutomationTriggers = (leadId) => {
  const { leads } = useLeadStore.getState();
  const { emails } = useEmailStore.getState();
  
  const lead = leads.find(l => l.id === leadId);
  const leadEmails = emails.filter(email => email.leadId === leadId);
  
  if (!lead) return [];
  
  const triggers = [];
  
  // No response after 3 days
  const lastEmail = leadEmails
    .filter(e => e.status === 'sent')
    .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))[0];
    
  if (lastEmail) {
    const daysSinceLastEmail = Math.floor(
      (new Date() - new Date(lastEmail.sentAt)) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceLastEmail >= 3 && !lastEmail.tracking?.replied) {
      triggers.push({
        type: 'follow_up_reminder',
        message: `No response from ${lead.contactName} for ${daysSinceLastEmail} days`,
        action: 'Send follow-up email',
        priority: daysSinceLastEmail >= 7 ? 'high' : 'medium'
      });
    }
  }
  
  // Lead opened emails but never replied
  const openedEmails = leadEmails.filter(e => e.tracking?.opened);
  const repliedEmails = leadEmails.filter(e => e.tracking?.replied);
  
  if (openedEmails.length >= 2 && repliedEmails.length === 0) {
    triggers.push({
      type: 'engagement_opportunity',
      message: `${lead.contactName} has opened ${openedEmails.length} emails but never replied`,
      action: 'Try different approach or call directly',
      priority: 'medium'
    });
  }
  
  return triggers;
};

export default {
  initializeEmailIntegrations,
  handleEmailEvent,
  generateTrackingUrl,
  enhanceEmailWithTracking,
  validateTemplateVariables,
  suggestEmailTemplates,
  calculateLeadEmailEngagement,
  checkEmailAutomationTriggers
};