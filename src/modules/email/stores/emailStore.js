import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useEmailStore = create(
  persist(
    (set, get) => ({
      // State
      emails: [],
      templates: [],
      emailSettings: {
        signature: '',
        defaultFrom: '',
        businessEmail: '',
        ccToBusinessEmail: true,
        autoSaveTemplates: true,
        trackingEnabled: true,
        notificationsEnabled: true,
        externalEmailMonitoring: false,
        gmailIntegration: {
          enabled: false,
          accessToken: '',
          refreshToken: ''
        },
        outlookIntegration: {
          enabled: false,
          accessToken: '',
          refreshToken: ''
        },
        smtpSettings: {
          host: '',
          port: 587,
          username: '',
          password: '',
          secure: false
        }
      },
      drafts: [],
      isLoading: false,
      error: null,

      // Email Actions
      addEmail: (email) => set((state) => ({
        emails: [...state.emails, {
          id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'sent',
          tracking: {
            opened: false,
            openedAt: null,
            clickedLinks: [],
            replied: false,
            repliedAt: null,
            bounced: false,
            unsubscribed: false
          },
          ...email
        }]
      })),

      updateEmail: (id, updates) => set((state) => ({
        emails: state.emails.map(email =>
          email.id === id 
            ? { ...email, ...updates, updatedAt: new Date().toISOString() }
            : email
        )
      })),

      deleteEmail: (id) => set((state) => ({
        emails: state.emails.filter(email => email.id !== id)
      })),

      sendEmail: (emailData, leadId = null, contactId = null) => {
        const state = get();
        
        // Create email record
        const email = {
          ...emailData,
          status: 'sent',
          sentAt: new Date().toISOString(),
          leadId,
          contactId,
          tracking: {
            opened: false,
            openedAt: null,
            clickedLinks: [],
            replied: false,
            repliedAt: null,
            bounced: false,
            unsubscribed: false,
            trackingId: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          }
        };

        // Add to emails
        state.addEmail(email);

        // Auto-save as template if enabled and not already a template
        if (state.emailSettings.autoSaveTemplates && !emailData.isTemplate) {
          state.saveAsTemplate(emailData, `Auto-saved: ${emailData.subject}`);
        }

        // Return email for further processing (e.g., lead updates)
        return email;
      },

      // Template Actions
      addTemplate: (template) => set((state) => ({
        templates: [...state.templates, {
          id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
          usageCount: 0,
          category: template.category || 'general',
          ...template
        }]
      })),

      updateTemplate: (id, updates) => set((state) => ({
        templates: state.templates.map(template =>
          template.id === id 
            ? { ...template, ...updates, updatedAt: new Date().toISOString() }
            : template
        )
      })),

      deleteTemplate: (id) => set((state) => ({
        templates: state.templates.filter(template => template.id !== id)
      })),

      saveAsTemplate: (emailData, templateName) => {
        const state = get();
        
        const template = {
          name: templateName || `Template ${state.templates.length + 1}`,
          subject: emailData.subject,
          body: emailData.body,
          category: emailData.category || 'general',
          variables: state.extractVariables(emailData.body),
          description: `Auto-generated from email: ${emailData.subject}`,
          tags: emailData.tags || []
        };

        state.addTemplate(template);
        return template;
      },

      incrementTemplateUsage: (templateId) => set((state) => ({
        templates: state.templates.map(template =>
          template.id === templateId 
            ? { ...template, usageCount: (template.usageCount || 0) + 1 }
            : template
        )
      })),

      // Draft Actions
      saveDraft: (draft) => set((state) => {
        const existingIndex = state.drafts.findIndex(d => d.id === draft.id);
        if (existingIndex >= 0) {
          const updatedDrafts = [...state.drafts];
          updatedDrafts[existingIndex] = { ...draft, updatedAt: new Date().toISOString() };
          return { drafts: updatedDrafts };
        } else {
          return {
            drafts: [...state.drafts, {
              ...draft,
              id: draft.id || `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }]
          };
        }
      }),

      deleteDraft: (id) => set((state) => ({
        drafts: state.drafts.filter(draft => draft.id !== id)
      })),

      // Email Tracking Actions
      trackEmailOpen: (trackingId) => {
        const state = get();
        const updatedEmail = state.emails.find(email => 
          email.tracking?.trackingId === trackingId
        );

        if (updatedEmail && !updatedEmail.tracking.opened) {
          const emailWithTracking = {
            ...updatedEmail,
            tracking: {
              ...updatedEmail.tracking,
              opened: true,
              openedAt: new Date().toISOString()
            }
          };

          set((state) => ({
            emails: state.emails.map(email =>
              email.tracking?.trackingId === trackingId ? emailWithTracking : email
            )
          }));

          // Trigger lead update if this email is associated with a lead
          if (emailWithTracking.leadId && window.useLeadStore) {
            const { handleEmailOpened } = window.useLeadStore.getState();
            handleEmailOpened(emailWithTracking.leadId, emailWithTracking);
          }
        }
      },

      trackEmailReply: (trackingId, replyData) => {
        const state = get();
        const updatedEmail = state.emails.find(email => 
          email.tracking?.trackingId === trackingId
        );

        if (updatedEmail && !updatedEmail.tracking.replied) {
          const emailWithReply = {
            ...updatedEmail,
            tracking: {
              ...updatedEmail.tracking,
              replied: true,
              repliedAt: new Date().toISOString(),
              replyData
            }
          };

          set((state) => ({
            emails: state.emails.map(email =>
              email.tracking?.trackingId === trackingId ? emailWithReply : email
            )
          }));

          // Trigger lead update if this email is associated with a lead
          if (emailWithReply.leadId && window.useLeadStore) {
            const { handleEmailReplied } = window.useLeadStore.getState();
            handleEmailReplied(emailWithReply.leadId, emailWithReply);
          }
        }
      },

      trackLinkClick: (trackingId, linkUrl) => set((state) => ({
        emails: state.emails.map(email =>
          email.tracking?.trackingId === trackingId
            ? {
                ...email,
                tracking: {
                  ...email.tracking,
                  clickedLinks: [
                    ...(email.tracking.clickedLinks || []),
                    {
                      url: linkUrl,
                      clickedAt: new Date().toISOString()
                    }
                  ]
                }
              }
            : email
        )
      })),

      // Settings Actions
      updateEmailSettings: (settings) => set((state) => ({
        emailSettings: { ...state.emailSettings, ...settings }
      })),

      // Search and Filter Functions
      searchEmails: (searchTerm) => {
        const state = get();
        const term = searchTerm.toLowerCase();
        
        return state.emails.filter(email =>
          email.subject?.toLowerCase().includes(term) ||
          email.body?.toLowerCase().includes(term) ||
          email.toEmail?.toLowerCase().includes(term) ||
          email.fromEmail?.toLowerCase().includes(term) ||
          email.recipientName?.toLowerCase().includes(term)
        );
      },

      searchTemplates: (searchTerm) => {
        const state = get();
        const term = searchTerm.toLowerCase();
        
        return state.templates.filter(template =>
          template.name?.toLowerCase().includes(term) ||
          template.subject?.toLowerCase().includes(term) ||
          template.body?.toLowerCase().includes(term) ||
          template.category?.toLowerCase().includes(term) ||
          template.tags?.some(tag => tag.toLowerCase().includes(term))
        );
      },

      getEmailsByLead: (leadId) => {
        const state = get();
        return state.emails.filter(email => email.leadId === leadId);
      },

      getEmailsByContact: (contactId) => {
        const state = get();
        return state.emails.filter(email => email.contactId === contactId);
      },

      getTemplatesByCategory: (category) => {
        const state = get();
        return state.templates.filter(template => 
          template.category === category && template.isActive
        );
      },

      // Analytics Functions
      getEmailStats: () => {
        const state = get();
        
        const totalEmails = state.emails.length;
        const totalSent = state.emails.filter(e => e.status === 'sent').length;
        const totalDrafts = state.drafts.length;
        const totalTemplates = state.templates.filter(t => t.isActive).length;
        
        const openedEmails = state.emails.filter(e => e.tracking?.opened).length;
        const repliedEmails = state.emails.filter(e => e.tracking?.replied).length;
        const clickedEmails = state.emails.filter(e => 
          e.tracking?.clickedLinks && e.tracking.clickedLinks.length > 0
        ).length;

        const openRate = totalSent > 0 ? Math.round((openedEmails / totalSent) * 100) : 0;
        const replyRate = totalSent > 0 ? Math.round((repliedEmails / totalSent) * 100) : 0;
        const clickRate = totalSent > 0 ? Math.round((clickedEmails / totalSent) * 100) : 0;

        return {
          totalEmails,
          totalSent,
          totalDrafts,
          totalTemplates,
          openedEmails,
          repliedEmails,
          clickedEmails,
          openRate,
          replyRate,
          clickRate
        };
      },

      getEmailAnalytics: (timeframe = '30d') => {
        const state = get();
        const cutoffDate = state.getTimeframeCutoff(timeframe);
        
        const filteredEmails = state.emails.filter(email => 
          new Date(email.createdAt) >= cutoffDate
        );

        const stats = {
          totalSent: filteredEmails.filter(e => e.status === 'sent').length,
          opened: filteredEmails.filter(e => e.tracking?.opened).length,
          replied: filteredEmails.filter(e => e.tracking?.replied).length,
          clicked: filteredEmails.filter(e => 
            e.tracking?.clickedLinks && e.tracking.clickedLinks.length > 0
          ).length,
          bounced: filteredEmails.filter(e => e.tracking?.bounced).length
        };

        // Calculate rates
        stats.openRate = stats.totalSent > 0 ? (stats.opened / stats.totalSent) * 100 : 0;
        stats.replyRate = stats.totalSent > 0 ? (stats.replied / stats.totalSent) * 100 : 0;
        stats.clickRate = stats.totalSent > 0 ? (stats.clicked / stats.totalSent) * 100 : 0;
        stats.bounceRate = stats.totalSent > 0 ? (stats.bounced / stats.totalSent) * 100 : 0;

        // Template usage analytics
        const templateUsage = {};
        state.templates.forEach(template => {
          templateUsage[template.id] = {
            name: template.name,
            usageCount: template.usageCount || 0,
            category: template.category
          };
        });

        // Email performance by day/week
        const performanceData = state.calculateEmailPerformance(filteredEmails);

        return {
          stats,
          templateUsage,
          performanceData,
          timeframe
        };
      },

      // Personalization Functions
      personalizeEmail: (template, recipientData) => {
        const state = get();
        
        let personalizedSubject = template.subject;
        let personalizedBody = template.body;

        // Common personalization variables
        const variables = {
          '{{firstName}}': recipientData.firstName || recipientData.name?.split(' ')[0] || 'there',
          '{{lastName}}': recipientData.lastName || recipientData.name?.split(' ').slice(1).join(' ') || '',
          '{{fullName}}': recipientData.name || `${recipientData.firstName || ''} ${recipientData.lastName || ''}`.trim(),
          '{{companyName}}': recipientData.companyName || recipientData.company || 'your company',
          '{{email}}': recipientData.email || '',
          '{{phone}}': recipientData.phone || '',
          '{{location}}': recipientData.location || '',
          '{{title}}': recipientData.title || recipientData.jobTitle || '',
          '{{industry}}': recipientData.industry || '',
          '{{website}}': recipientData.website || '',
          '{{dealValue}}': recipientData.dealValue ? `$${recipientData.dealValue.toLocaleString()}` : '',
          '{{productInterest}}': recipientData.productInterest || '',
          '{{source}}': recipientData.source || '',
          '{{currentDate}}': new Date().toLocaleDateString(),
          '{{currentTime}}': new Date().toLocaleTimeString(),
          '{{senderName}}': recipientData.senderName || 'Sales Team',
          '{{senderTitle}}': recipientData.senderTitle || 'Sales Representative',
          '{{senderCompany}}': recipientData.senderCompany || 'Our Company'
        };

        // Replace variables in subject and body
        Object.entries(variables).forEach(([variable, value]) => {
          personalizedSubject = personalizedSubject.replace(new RegExp(variable, 'g'), value);
          personalizedBody = personalizedBody.replace(new RegExp(variable, 'g'), value);
        });

        return {
          subject: personalizedSubject,
          body: personalizedBody,
          originalTemplate: template,
          variables: variables
        };
      },

      extractVariables: (text) => {
        const variableRegex = /\{\{([^}]+)\}\}/g;
        const variables = [];
        let match;
        
        while ((match = variableRegex.exec(text)) !== null) {
          if (!variables.includes(match[1])) {
            variables.push(match[1]);
          }
        }
        
        return variables;
      },

      // Helper Functions
      getTimeframeCutoff: (timeframe) => {
        const now = new Date();
        const timeframes = {
          '1d': 1,
          '7d': 7,
          '30d': 30,
          '90d': 90,
          '6m': 180,
          '1y': 365
        };
        
        const daysBack = timeframes[timeframe] || 30;
        return new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
      },

      calculateEmailPerformance: (emails) => {
        const performanceByDay = {};
        
        emails.forEach(email => {
          const date = new Date(email.createdAt).toISOString().split('T')[0];
          if (!performanceByDay[date]) {
            performanceByDay[date] = {
              sent: 0,
              opened: 0,
              replied: 0,
              clicked: 0
            };
          }
          
          performanceByDay[date].sent++;
          if (email.tracking?.opened) performanceByDay[date].opened++;
          if (email.tracking?.replied) performanceByDay[date].replied++;
          if (email.tracking?.clickedLinks?.length > 0) performanceByDay[date].clicked++;
        });
        
        return performanceByDay;
      },

      // Initialization
      initializeEmailData: () => {
        const state = get();
        
        // Initialize with demo templates if none exist
        if (state.templates.length === 0) {
          const demoTemplates = [
            {
              name: 'Initial Outreach - Cold Lead',
              subject: 'Quick question about {{companyName}}\'s {{industry}} goals',
              body: `Hi {{firstName}},

I came across {{companyName}} and was impressed by your work in {{industry}}. 

I'm reaching out because I help companies like yours {{productInterest}} and wanted to see if you might be interested in a brief conversation about how we could potentially help {{companyName}} achieve its goals.

Would you be open to a 15-minute call this week to discuss?

Best regards,
{{senderName}}
{{senderTitle}}

P.S. I noticed {{companyName}} is based in {{location}} - I'd love to learn more about the local {{industry}} scene there!`,
              category: 'cold-outreach',
              tags: ['cold-lead', 'initial-contact', 'outreach'],
              description: 'First contact template for cold leads with personalization'
            },
            {
              name: 'Follow-up - After Demo',
              subject: 'Thanks for the demo, {{firstName}} - next steps?',
              body: `Hi {{firstName}},

Thank you for taking the time for our demo yesterday. I enjoyed learning more about {{companyName}}'s current challenges and how our solution could help with {{productInterest}}.

As discussed, here are the next steps:
• I'll send over the proposal with pricing for {{dealValue}} solution
• Set up a technical deep-dive with your team
• Connect you with our implementation specialist

When would be a good time for a quick follow-up call to address any questions?

Looking forward to moving forward together!

Best,
{{senderName}}
{{senderTitle}}`,
              category: 'follow-up',
              tags: ['demo-follow-up', 'next-steps', 'proposal'],
              description: 'Follow-up template after product demonstration'
            },
            {
              name: 'Re-engagement - Warm Lead',
              subject: 'Checking back in - is {{companyName}} still exploring {{productInterest}}?',
              body: `Hi {{firstName}},

I wanted to circle back on our conversation from a few weeks ago about {{companyName}}'s {{productInterest}} needs.

I know priorities can shift, but I wanted to check if this is still something you're exploring. We've had some exciting updates to our platform that might be particularly relevant for {{companyName}}.

If the timing isn't right now, no worries at all - would it be helpful if I checked back in a few months?

Best regards,
{{senderName}}

P.S. If you're no longer the right person to speak with about this, I'd appreciate a quick point in the right direction!`,
              category: 're-engagement',
              tags: ['warm-lead', 're-engagement', 'check-in'],
              description: 'Re-engagement template for warm leads that have gone quiet'
            },
            {
              name: 'Proposal Submission',
              subject: 'Proposal for {{companyName}} - {{dealValue}} {{productInterest}} Solution',
              body: `Hi {{firstName}},

As promised, I've attached our detailed proposal for {{companyName}}'s {{productInterest}} requirements.

The proposal includes:
• Comprehensive solution overview tailored to {{companyName}}
• Implementation timeline and milestones  
• Investment details for the {{dealValue}} package
• Success metrics and expected ROI

I'm excited about the opportunity to partner with {{companyName}} and help you achieve your {{industry}} goals.

I'll follow up early next week, but please don't hesitate to reach out if you have any questions in the meantime.

Best regards,
{{senderName}}
{{senderTitle}}`,
              category: 'proposal',
              tags: ['proposal', 'pricing', 'investment'],
              description: 'Template for submitting formal proposals'
            },
            {
              name: 'Meeting Confirmation',
              subject: 'Confirmed: Meeting with {{companyName}} - {{currentDate}}',
              body: `Hi {{firstName}},

This confirms our meeting scheduled for [DATE/TIME] to discuss {{companyName}}'s {{productInterest}} requirements.

Meeting Details:
• Duration: 30 minutes
• Location: [Virtual/In-person details]
• Agenda: Discovery call to understand your specific needs

I'll send a calendar invite with the meeting link shortly.

Looking forward to our conversation!

Best,
{{senderName}}
{{senderTitle}}`,
              category: 'scheduling',
              tags: ['meeting', 'confirmation', 'calendar'],
              description: 'Meeting confirmation and details template'
            }
          ];

          // Add demo templates
          demoTemplates.forEach(template => state.addTemplate(template));
        }

        // Initialize with demo email data if none exists
        if (state.emails.length === 0) {
          const demoEmails = [
            {
              toEmail: 'john.doe@techflow.com',
              fromEmail: 'sarah@salestracker.com',
              subject: 'Quick question about TechFlow Solutions\' technology goals',
              body: 'Hi John,\n\nI came across TechFlow Solutions and was impressed by your work in technology...',
              status: 'sent',
              sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              leadId: 'lead-1',
              recipientName: 'John Doe',
              senderName: 'Sarah Johnson',
              templateUsed: 'Initial Outreach - Cold Lead',
              tracking: {
                opened: true,
                openedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
                clickedLinks: [],
                replied: true,
                repliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                bounced: false,
                trackingId: 'track_demo_1'
              }
            },
            {
              toEmail: 'mike.chen@datamart.com',
              fromEmail: 'sarah@salestracker.com',
              subject: 'Thanks for the demo, Mike - next steps?',
              body: 'Hi Mike,\n\nThank you for taking the time for our demo yesterday...',
              status: 'sent',
              sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              leadId: 'lead-2',
              recipientName: 'Mike Chen',
              senderName: 'Sarah Johnson',
              templateUsed: 'Follow-up - After Demo',
              tracking: {
                opened: true,
                openedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
                clickedLinks: [
                  {
                    url: 'https://salestracker.com/proposal',
                    clickedAt: new Date(Date.now() - 0.3 * 24 * 60 * 60 * 1000).toISOString()
                  }
                ],
                replied: false,
                bounced: false,
                trackingId: 'track_demo_2'
              }
            }
          ];

          demoEmails.forEach(email => state.addEmail(email));
        }
      },

      // Loading and Error States
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null })
    }),
    {
      name: 'email-storage',
      partialize: (state) => ({
        emails: state.emails,
        templates: state.templates,
        emailSettings: state.emailSettings,
        drafts: state.drafts
      })
    }
  )
);

export default useEmailStore;