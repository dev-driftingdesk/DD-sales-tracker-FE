/**
 * Email Webhook Service
 * Handles incoming emails from external sources (personal accounts CC'd to business email)
 * Processes and integrates them into the CRM system
 */

import useEmailStore from '../modules/email/stores/emailStore';
import useLeadStore from '../modules/leads/stores/leadStore';
import useNotificationStore from '../modules/notifications/stores/notificationStore';

/**
 * Email webhook endpoint handler
 * Processes incoming emails from email service providers (Gmail, Outlook, etc.)
 */
export class EmailWebhookService {
  constructor() {
    this.supportedProviders = ['gmail', 'outlook', 'sendgrid', 'mailgun'];
  }

  /**
   * Main webhook handler for incoming emails
   */
  async handleIncomingEmail(webhookData, provider = 'gmail') {
    try {
      console.log('Processing incoming email webhook:', { provider, timestamp: new Date().toISOString() });
      
      // Parse email data based on provider
      const emailData = this.parseEmailData(webhookData, provider);
      
      if (!emailData) {
        console.warn('Failed to parse email data:', webhookData);
        return { success: false, error: 'Invalid email data' };
      }

      // Check if this is a CC'd business email
      const isCCdBusinessEmail = this.isCCdToBusinessEmail(emailData);
      
      if (!isCCdBusinessEmail) {
        console.log('Email not CC\'d to business - ignoring');
        return { success: true, message: 'Email not relevant for CRM' };
      }

      // Find matching lead
      const matchedLead = await this.findMatchingLead(emailData);
      
      // Process the email and update CRM
      const result = await this.processEmailForCRM(emailData, matchedLead);
      
      return result;
      
    } catch (error) {
      console.error('Error processing webhook:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Parse email data from different providers
   */
  parseEmailData(webhookData, provider) {
    switch (provider) {
      case 'gmail':
        return this.parseGmailWebhook(webhookData);
      case 'outlook':
        return this.parseOutlookWebhook(webhookData);
      case 'sendgrid':
        return this.parseSendgridWebhook(webhookData);
      default:
        return this.parseGenericWebhook(webhookData);
    }
  }

  /**
   * Parse Gmail webhook data
   */
  parseGmailWebhook(data) {
    try {
      // Gmail webhook format
      const message = data.message || {};
      const payload = message.payload || {};
      const headers = payload.headers || [];
      
      const getHeader = (name) => {
        const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
        return header ? header.value : '';
      };

      return {
        messageId: message.id,
        from: getHeader('From'),
        to: getHeader('To'),
        cc: getHeader('Cc'),
        bcc: getHeader('Bcc'),
        subject: getHeader('Subject'),
        date: getHeader('Date'),
        body: this.extractEmailBody(payload),
        threadId: message.threadId,
        provider: 'gmail',
        raw: data
      };
    } catch (error) {
      console.error('Error parsing Gmail webhook:', error);
      return null;
    }
  }

  /**
   * Parse Outlook webhook data
   */
  parseOutlookWebhook(data) {
    try {
      const message = data.value?.[0] || data;
      
      return {
        messageId: message.id,
        from: message.from?.emailAddress?.address,
        to: message.toRecipients?.map(r => r.emailAddress.address).join(', '),
        cc: message.ccRecipients?.map(r => r.emailAddress.address).join(', '),
        bcc: message.bccRecipients?.map(r => r.emailAddress.address).join(', '),
        subject: message.subject,
        date: message.receivedDateTime,
        body: message.body?.content || message.bodyPreview,
        conversationId: message.conversationId,
        provider: 'outlook',
        raw: data
      };
    } catch (error) {
      console.error('Error parsing Outlook webhook:', error);
      return null;
    }
  }

  /**
   * Parse generic webhook format
   */
  parseGenericWebhook(data) {
    return {
      messageId: data.id || data.messageId,
      from: data.from,
      to: data.to,
      cc: data.cc,
      subject: data.subject,
      date: data.date || new Date().toISOString(),
      body: data.body || data.content,
      provider: 'generic',
      raw: data
    };
  }

  /**
   * Extract email body from Gmail payload
   */
  extractEmailBody(payload) {
    try {
      // Handle multipart messages
      if (payload.parts) {
        for (const part of payload.parts) {
          if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
            return this.decodeBase64(part.body?.data);
          }
          // Recursively check nested parts
          if (part.parts) {
            const nestedBody = this.extractEmailBody(part);
            if (nestedBody) return nestedBody;
          }
        }
      }
      
      // Handle single part messages
      if (payload.body?.data) {
        return this.decodeBase64(payload.body.data);
      }
      
      return '';
    } catch (error) {
      console.error('Error extracting email body:', error);
      return '';
    }
  }

  /**
   * Decode base64 email content
   */
  decodeBase64(data) {
    try {
      // Gmail uses URL-safe base64 encoding
      const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
      return atob(base64);
    } catch (error) {
      console.error('Error decoding base64:', error);
      return data; // Return as-is if decoding fails
    }
  }

  /**
   * Check if email is CC'd to business email
   */
  isCCdToBusinessEmail(emailData) {
    const { emailSettings } = useEmailStore.getState();
    const businessEmail = emailSettings.businessEmail || emailSettings.defaultFrom;
    
    if (!businessEmail) {
      console.warn('No business email configured for CC detection');
      return false;
    }

    // Check CC field
    const ccEmails = emailData.cc?.toLowerCase() || '';
    const toEmails = emailData.to?.toLowerCase() || '';
    const businessEmailLower = businessEmail.toLowerCase();

    return ccEmails.includes(businessEmailLower) || toEmails.includes(businessEmailLower);
  }

  /**
   * Find matching lead based on email addresses
   */
  async findMatchingLead(emailData) {
    const { leads } = useLeadStore.getState();
    
    // Extract email addresses from from/to fields
    const fromEmail = this.extractEmailAddress(emailData.from);
    const toEmail = this.extractEmailAddress(emailData.to);
    
    // Try to match lead by email
    let matchedLead = leads.find(lead => 
      lead.email && (
        lead.email.toLowerCase() === fromEmail?.toLowerCase() ||
        lead.email.toLowerCase() === toEmail?.toLowerCase()
      )
    );

    // If no exact match, try fuzzy matching by domain or name
    if (!matchedLead) {
      matchedLead = this.fuzzyMatchLead(emailData, leads);
    }

    return matchedLead;
  }

  /**
   * Extract email address from "Name <email@domain.com>" format
   */
  extractEmailAddress(emailString) {
    if (!emailString) return null;
    
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    const match = emailString.match(emailRegex);
    return match ? match[1] : emailString.trim();
  }

  /**
   * Fuzzy matching for leads when exact email match fails
   */
  fuzzyMatchLead(emailData, leads) {
    const fromEmail = this.extractEmailAddress(emailData.from);
    const fromDomain = fromEmail?.split('@')[1];
    
    if (!fromDomain) return null;

    // Try to match by company domain
    const domainMatch = leads.find(lead => {
      if (!lead.companyName) return false;
      
      // Simple heuristic: check if domain contains company name
      const companyWords = lead.companyName.toLowerCase().split(/\s+/);
      return companyWords.some(word => 
        word.length > 3 && fromDomain.toLowerCase().includes(word)
      );
    });

    return domainMatch;
  }

  /**
   * Process email and integrate with CRM
   */
  async processEmailForCRM(emailData, matchedLead) {
    const { addEmail } = useEmailStore.getState();
    const { addActivity, updateLead, handleEmailSent, handleEmailReplied } = useLeadStore.getState();
    const { addNotification } = useNotificationStore.getState();

    try {
      // Determine email direction and type
      const emailDirection = this.determineEmailDirection(emailData, matchedLead);
      const emailType = this.analyzeEmailContent(emailData);

      // Create email record in CRM
      const crmEmail = {
        toEmail: emailData.to,
        fromEmail: emailData.from,
        subject: emailData.subject,
        body: emailData.body,
        status: 'sent',
        sentAt: emailData.date,
        leadId: matchedLead?.id,
        recipientName: this.extractRecipientName(emailData, emailDirection),
        senderName: this.extractSenderName(emailData, emailDirection),
        isExternalEmail: true,
        externalSource: emailData.provider,
        emailDirection,
        emailType,
        tracking: {
          trackingId: `external_${emailData.messageId}`,
          opened: true, // Assume opened since it was received
          openedAt: emailData.date,
          replied: emailDirection === 'inbound',
          repliedAt: emailDirection === 'inbound' ? emailData.date : null,
          clickedLinks: [],
          bounced: false
        }
      };

      // Add email to store
      addEmail(crmEmail);

      // Update lead if matched
      if (matchedLead) {
        // Add activity
        addActivity(matchedLead.id, {
          type: 'Email',
          description: `${emailDirection === 'outbound' ? 'Sent' : 'Received'}: ${emailData.subject}`,
          details: `External email ${emailDirection === 'outbound' ? 'sent from' : 'received from'} ${emailData.from}`,
          isFromLead: emailDirection === 'inbound',
          isResponse: emailDirection === 'inbound',
          metadata: {
            source: 'external_email',
            provider: emailData.provider,
            messageId: emailData.messageId,
            emailType
          }
        });

        // Update lead status based on email direction and content
        await this.updateLeadStatusFromEmail(matchedLead, emailDirection, emailType, crmEmail);

        // Send notification
        addNotification({
          type: emailDirection === 'inbound' ? 'email_received' : 'email_sent',
          title: emailDirection === 'inbound' ? 'Email Received' : 'Email Tracked',
          message: `${emailDirection === 'inbound' ? 'Received email from' : 'Tracked outbound email to'} ${matchedLead.contactName}: "${emailData.subject}"`,
          priority: emailDirection === 'inbound' ? 'high' : 'medium',
          data: {
            leadId: matchedLead.id,
            emailId: crmEmail.id,
            subject: emailData.subject
          }
        });
      } else {
        // Create notification for unmatched email
        addNotification({
          type: 'email_unmatched',
          title: 'External Email Detected',
          message: `Email detected but no matching lead found: "${emailData.subject}"`,
          priority: 'low',
          data: {
            subject: emailData.subject,
            from: emailData.from,
            to: emailData.to
          }
        });
      }

      return {
        success: true,
        emailCreated: crmEmail,
        leadMatched: !!matchedLead,
        leadId: matchedLead?.id
      };

    } catch (error) {
      console.error('Error processing email for CRM:', error);
      throw error;
    }
  }

  /**
   * Determine if email is inbound (from lead) or outbound (to lead)
   */
  determineEmailDirection(emailData, matchedLead) {
    if (!matchedLead) return 'unknown';
    
    const fromEmail = this.extractEmailAddress(emailData.from);
    const leadEmail = matchedLead.email?.toLowerCase();
    
    return fromEmail?.toLowerCase() === leadEmail ? 'inbound' : 'outbound';
  }

  /**
   * Analyze email content to determine type and intent
   */
  analyzeEmailContent(emailData) {
    const subject = emailData.subject?.toLowerCase() || '';
    const body = emailData.body?.toLowerCase() || '';
    const content = `${subject} ${body}`;

    // Define keyword patterns
    const patterns = {
      meeting: /\b(meeting|call|demo|presentation|schedule|calendar|zoom|teams)\b/g,
      proposal: /\b(proposal|quote|pricing|contract|agreement|terms)\b/g,
      followup: /\b(follow.?up|following.?up|check.?in|touching.?base)\b/g,
      question: /\b(question|inquiry|clarification|help|support)\b/g,
      introduction: /\b(introduction|intro|nice.?to.?meet|pleased.?to.?meet)\b/g,
      thank_you: /\b(thank.?you|thanks|appreciate|grateful)\b/g,
      urgent: /\b(urgent|asap|important|priority|rush)\b/g
    };

    // Count matches for each pattern
    const scores = {};
    Object.entries(patterns).forEach(([type, pattern]) => {
      const matches = content.match(pattern) || [];
      scores[type] = matches.length;
    });

    // Return the type with the highest score
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) return 'general';
    
    return Object.keys(scores).find(key => scores[key] === maxScore) || 'general';
  }

  /**
   * Extract recipient name from email data
   */
  extractRecipientName(emailData, direction) {
    const targetField = direction === 'inbound' ? emailData.to : emailData.from;
    const match = targetField?.match(/^([^<]+)/);
    return match ? match[1].trim().replace(/"/g, '') : this.extractEmailAddress(targetField);
  }

  /**
   * Extract sender name from email data
   */
  extractSenderName(emailData, direction) {
    const targetField = direction === 'inbound' ? emailData.from : emailData.to;
    const match = targetField?.match(/^([^<]+)/);
    return match ? match[1].trim().replace(/"/g, '') : this.extractEmailAddress(targetField);
  }

  /**
   * Update lead status based on email analysis
   */
  async updateLeadStatusFromEmail(lead, direction, emailType, emailData) {
    const { updateLead, handleEmailSent, handleEmailReplied } = useLeadStore.getState();

    // Handle inbound emails (responses from leads)
    if (direction === 'inbound') {
      // Lead replied - update status accordingly
      if (lead.status === 'contacted') {
        updateLead(lead.id, { status: 'in_progress' });
      }
      
      // Specific updates based on email type
      switch (emailType) {
        case 'meeting':
          updateLead(lead.id, { 
            status: 'in_progress',
            lastActivity: 'Meeting scheduled',
            priority: 'high'
          });
          break;
        case 'proposal':
          updateLead(lead.id, { 
            status: 'qualified',
            lastActivity: 'Proposal discussion'
          });
          break;
        case 'question':
          updateLead(lead.id, { 
            lastActivity: 'Questions received',
            needsFollowUp: true
          });
          break;
      }

      // Trigger email replied handler
      handleEmailReplied(lead.id, emailData);
      
    } else if (direction === 'outbound') {
      // Outbound email - sales rep sent from personal account
      if (lead.status === 'new') {
        updateLead(lead.id, { status: 'contacted' });
      }
      
      // Trigger email sent handler
      handleEmailSent(lead.id, emailData);
    }
  }

  /**
   * Set up webhook endpoints for different providers
   */
  setupWebhookEndpoints() {
    // This would typically be handled by your backend server
    // Here we're providing the structure for webhook handling
    
    const webhookRoutes = {
      '/api/webhooks/gmail': (req, res) => this.handleIncomingEmail(req.body, 'gmail'),
      '/api/webhooks/outlook': (req, res) => this.handleIncomingEmail(req.body, 'outlook'),
      '/api/webhooks/generic': (req, res) => this.handleIncomingEmail(req.body, 'generic')
    };
    
    return webhookRoutes;
  }
}

// Export singleton instance
export const emailWebhookService = new EmailWebhookService();

export default EmailWebhookService;