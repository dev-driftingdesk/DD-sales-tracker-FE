/**
 * External Email Monitor Service
 * Monitors and processes emails sent from personal accounts that are CC'd to business email
 * Simulates email service integration for Use Case 2
 */

import { emailWebhookService } from './emailWebhookService';
import useEmailStore from '../modules/email/stores/emailStore';
import useLeadStore from '../modules/leads/stores/leadStore';
import useNotificationStore from '../modules/notifications/stores/notificationStore';

export class ExternalEmailMonitor {
  constructor() {
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.lastCheck = new Date();
    this.processedEmails = new Set();
  }

  /**
   * Start monitoring for external emails
   */
  startMonitoring(intervalMs = 30000) { // Check every 30 seconds
    if (this.isMonitoring) {
      console.log('Email monitoring already active');
      return;
    }

    console.log('Starting external email monitoring...');
    this.isMonitoring = true;
    
    // Initial check
    this.checkForNewEmails();
    
    // Set up periodic checking
    this.monitoringInterval = setInterval(() => {
      this.checkForNewEmails();
    }, intervalMs);

    // Add notification
    const { addNotification } = useNotificationStore.getState();
    addNotification({
      type: 'system',
      title: 'Email Monitoring Started',
      message: 'Now monitoring for external emails CC\'d to business email',
      priority: 'low'
    });
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;

    console.log('Stopping external email monitoring...');
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    const { addNotification } = useNotificationStore.getState();
    addNotification({
      type: 'system',
      title: 'Email Monitoring Stopped',
      message: 'External email monitoring has been disabled',
      priority: 'low'
    });
  }

  /**
   * Check for new emails (simulated or real API calls)
   */
  async checkForNewEmails() {
    try {
      const { emailSettings } = useEmailStore.getState();
      
      if (!emailSettings.externalEmailMonitoring) {
        return; // Monitoring disabled in settings
      }

      // In a real implementation, this would call email service APIs
      // For now, we'll simulate with mock data and check for demo scenarios
      
      // Check for simulated external emails
      await this.processSimulatedEmails();
      
      // Check for real email service integrations if configured
      if (emailSettings.gmailIntegration?.enabled) {
        await this.checkGmailAPI();
      }
      
      if (emailSettings.outlookIntegration?.enabled) {
        await this.checkOutlookAPI();
      }

    } catch (error) {
      console.error('Error checking for new emails:', error);
    }
  }

  /**
   * Process simulated external emails for demo purposes
   */
  async processSimulatedEmails() {
    // Get current leads to create realistic scenarios
    const { leads } = useLeadStore.getState();
    const { emailSettings } = useEmailStore.getState();
    
    if (!leads.length || !emailSettings.ccToBusinessEmail) return;

    // Simulate external emails occasionally
    const shouldSimulate = Math.random() < 0.1; // 10% chance per check
    if (!shouldSimulate) return;

    // Pick a random lead for simulation
    const randomLead = leads[Math.floor(Math.random() * leads.length)];
    if (!randomLead.email) return;

    // Generate simulated external email
    const simulatedEmail = this.generateSimulatedEmail(randomLead, emailSettings);
    
    // Process through webhook service
    await emailWebhookService.handleIncomingEmail(simulatedEmail, 'simulated');
  }

  /**
   * Generate realistic simulated email for testing
   */
  generateSimulatedEmail(lead, emailSettings) {
    const emailTypes = [
      {
        type: 'reply',
        subject: `Re: ${this.getLastEmailSubject(lead)}`,
        body: `Hi,\n\nThank you for reaching out. I'm interested in learning more about your solution.\n\nCould we schedule a brief call this week to discuss?\n\nBest regards,\n${lead.contactName}`
      },
      {
        type: 'question',
        subject: `Quick question about your services`,
        body: `Hi,\n\nI received your email about ${lead.productInterest || 'your services'} and have a few questions:\n\n1. What's the typical implementation timeline?\n2. Do you offer training for our team?\n3. What are the ongoing costs?\n\nLooking forward to hearing from you.\n\n${lead.contactName}\n${lead.companyName}`
      },
      {
        type: 'meeting_request',
        subject: `Meeting request - ${lead.companyName}`,
        body: `Hello,\n\nI'd like to schedule a meeting to discuss how your solution could help ${lead.companyName}.\n\nI'm available:\n- Tuesday 2-4 PM\n- Wednesday 10 AM - 12 PM\n- Thursday 3-5 PM\n\nPlease let me know what works best.\n\n${lead.contactName}`
      }
    ];

    const selectedType = emailTypes[Math.floor(Math.random() * emailTypes.length)];
    const businessEmail = emailSettings.defaultFrom || 'business@salestracker.com';

    return {
      message: {
        id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        threadId: `thread_${lead.id}`,
        payload: {
          headers: [
            { name: 'From', value: `${lead.contactName} <${lead.email}>` },
            { name: 'To', value: `Sales Team <sales@salestracker.com>` },
            { name: 'Cc', value: businessEmail },
            { name: 'Subject', value: selectedType.subject },
            { name: 'Date', value: new Date().toISOString() }
          ],
          body: {
            data: btoa(selectedType.body) // Base64 encode
          }
        }
      }
    };
  }

  /**
   * Get the last email subject for a lead (for reply simulation)
   */
  getLastEmailSubject(lead) {
    const { emails } = useEmailStore.getState();
    const leadEmails = emails
      .filter(email => email.leadId === lead.id)
      .sort((a, b) => new Date(b.sentAt || b.createdAt) - new Date(a.sentAt || a.createdAt));
    
    return leadEmails.length > 0 ? leadEmails[0].subject : 'Your inquiry';
  }

  /**
   * Check Gmail API for new emails (placeholder for real implementation)
   */
  async checkGmailAPI() {
    // This would integrate with Gmail API
    // For now, it's a placeholder
    console.log('Checking Gmail API for new emails...');
    
    // In real implementation:
    // 1. Use Gmail API to fetch new emails
    // 2. Filter for emails CC'd to business address
    // 3. Process through webhook service
  }

  /**
   * Check Outlook API for new emails (placeholder for real implementation)
   */
  async checkOutlookAPI() {
    // This would integrate with Outlook/Exchange API
    console.log('Checking Outlook API for new emails...');
    
    // In real implementation:
    // 1. Use Microsoft Graph API to fetch new emails
    // 2. Filter for emails CC'd to business address  
    // 3. Process through webhook service
  }

  /**
   * Manually process an external email (for testing)
   */
  async processExternalEmail(emailData) {
    try {
      const result = await emailWebhookService.handleIncomingEmail(emailData, 'manual');
      
      const { addNotification } = useNotificationStore.getState();
      addNotification({
        type: 'email_processed',
        title: 'External Email Processed',
        message: `Processed external email: "${emailData.subject || 'No Subject'}"`,
        priority: 'medium',
        data: result
      });

      return result;
    } catch (error) {
      console.error('Error processing external email:', error);
      throw error;
    }
  }

  /**
   * Get monitoring status and stats
   */
  getMonitoringStatus() {
    const { emails } = useEmailStore.getState();
    const externalEmails = emails.filter(email => email.isExternalEmail);
    
    return {
      isMonitoring: this.isMonitoring,
      lastCheck: this.lastCheck,
      totalExternalEmails: externalEmails.length,
      todaysExternalEmails: externalEmails.filter(email => {
        const emailDate = new Date(email.createdAt || email.sentAt);
        const today = new Date();
        return emailDate.toDateString() === today.toDateString();
      }).length,
      processedEmailsCount: this.processedEmails.size
    };
  }

  /**
   * Create a test external email scenario
   */
  createTestScenario(leadId, scenarioType = 'reply') {
    const { leads } = useLeadStore.getState();
    const lead = leads.find(l => l.id === leadId);
    
    if (!lead) {
      throw new Error('Lead not found');
    }

    const scenarios = {
      reply: {
        from: `${lead.contactName} <${lead.email}>`,
        to: 'sales@salestracker.com',
        cc: 'business@salestracker.com',
        subject: `Re: Following up on ${lead.companyName}`,
        body: `Hi,\n\nThanks for your email. I'm definitely interested in learning more.\n\nCould we set up a call next week?\n\nBest,\n${lead.contactName}`,
        date: new Date().toISOString()
      },
      meeting: {
        from: `${lead.contactName} <${lead.email}>`,
        to: 'sales@salestracker.com',
        cc: 'business@salestracker.com',
        subject: `Meeting Request - ${lead.companyName}`,
        body: `Hello,\n\nI'd like to schedule a demo to see how your solution could help ${lead.companyName}.\n\nI'm available this week for a 30-minute call.\n\nPlease send me some available times.\n\n${lead.contactName}`,
        date: new Date().toISOString()
      },
      urgent: {
        from: `${lead.contactName} <${lead.email}>`,
        to: 'sales@salestracker.com',
        cc: 'business@salestracker.com',
        subject: `URGENT: Need pricing information ASAP`,
        body: `Hi,\n\nWe need to make a decision by end of week and I need your pricing information urgently.\n\nCan you please send me a quote for ${lead.dealValue ? `$${lead.dealValue}` : 'our requirements'}?\n\nThanks,\n${lead.contactName}`,
        date: new Date().toISOString()
      }
    };

    const scenario = scenarios[scenarioType] || scenarios.reply;
    
    // Process the test email
    return this.processExternalEmail(scenario);
  }
}

// Export singleton instance
export const externalEmailMonitor = new ExternalEmailMonitor();

export default ExternalEmailMonitor;