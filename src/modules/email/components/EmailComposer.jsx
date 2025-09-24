import React, { useState, useEffect } from 'react';
import { Send, Save, FileText, User, Building, Wand2, Eye, X, Plus, Copy, Check } from 'lucide-react';
import useEmailStore from '../stores/emailStore';
import useLeadStore from '../../leads/stores/leadStore';
import useCRMStore from '../../crm-core/stores/crmStore';
import useUserStore from '../../../stores/userStore';

const EmailComposer = ({ selectedLead, selectedTemplate, onLeadSelect, onTemplateSelect }) => {
  const { 
    sendEmail, 
    saveDraft, 
    personalizeEmail,
    templates,
    emailSettings,
    incrementTemplateUsage,
    saveAsTemplate
  } = useEmailStore();
  
  const { leads, getFilteredLeads, addActivity, handleEmailSent } = useLeadStore();
  const { contacts, getFilteredContacts } = useCRMStore();
  const { currentUser } = useUserStore();
  
  const [formData, setFormData] = useState({
    toEmail: '',
    fromEmail: currentUser?.email || '',
    recipientName: '',
    subject: '',
    body: '',
    ccEmails: '',
    bccEmails: ''
  });
  
  const [showPreview, setShowPreview] = useState(false);
  const [showLeadSelector, setShowLeadSelector] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [personalizedContent, setPersonalizedContent] = useState(null);
  const [templateSearch, setTemplateSearch] = useState('');
  const [leadSearch, setLeadSearch] = useState('');
  const [saveAsTemplateModal, setSaveAsTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  // Load selected lead data
  useEffect(() => {
    if (selectedLead) {
      setFormData(prev => ({
        ...prev,
        toEmail: selectedLead.email,
        recipientName: selectedLead.contactName,
        ccEmails: emailSettings.ccToBusinessEmail ? currentUser?.businessEmail || '' : ''
      }));
    }
  }, [selectedLead, emailSettings.ccToBusinessEmail, currentUser]);

  // Load selected template and personalize
  useEffect(() => {
    if (selectedTemplate && (selectedLead || formData.recipientName)) {
      const recipientData = selectedLead ? {
        firstName: selectedLead.contactName?.split(' ')[0],
        lastName: selectedLead.contactName?.split(' ').slice(1).join(' '),
        name: selectedLead.contactName,
        companyName: selectedLead.companyName,
        email: selectedLead.email,
        phone: selectedLead.phone,
        location: selectedLead.location,
        dealValue: selectedLead.dealValue,
        productInterest: selectedLead.productInterest,
        source: selectedLead.source,
        industry: selectedLead.industry,
        senderName: currentUser?.name,
        senderTitle: currentUser?.title,
        senderCompany: 'SalesTracker'
      } : {
        name: formData.recipientName,
        firstName: formData.recipientName?.split(' ')[0],
        senderName: currentUser?.name,
        senderTitle: currentUser?.title,
        senderCompany: 'SalesTracker'
      };

      const personalized = personalizeEmail(selectedTemplate, recipientData);
      setPersonalizedContent(personalized);
      setFormData(prev => ({
        ...prev,
        subject: personalized.subject,
        body: personalized.body
      }));
    }
  }, [selectedTemplate, selectedLead, formData.recipientName, personalizeEmail, currentUser]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDraft(true);
  };

  const handleSendEmail = async () => {
    try {
      const emailData = {
        ...formData,
        senderName: currentUser?.name,
        templateUsed: selectedTemplate?.name,
        personalizedContent
      };

      const sentEmail = sendEmail(
        emailData, 
        selectedLead?.id, 
        null // contactId - can be added later
      );

      // Update template usage count
      if (selectedTemplate) {
        incrementTemplateUsage(selectedTemplate.id);
      }

      // Handle lead integration if selected
      if (selectedLead) {
        handleEmailSent(selectedLead.id, sentEmail);
      }

      // Show success message
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);

      // Clear form
      setFormData({
        toEmail: '',
        fromEmail: currentUser?.email || '',
        recipientName: '',
        subject: '',
        body: '',
        ccEmails: '',
        bccEmails: ''
      });
      setPersonalizedContent(null);
      onLeadSelect(null);
      onTemplateSelect(null);
      setIsDraft(false);

    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const handleSaveDraft = () => {
    const draft = {
      ...formData,
      leadId: selectedLead?.id,
      templateId: selectedTemplate?.id,
      personalizedContent
    };
    saveDraft(draft);
    setIsDraft(false);
  };

  const handleSaveAsTemplate = () => {
    if (templateName.trim()) {
      saveAsTemplate({
        subject: formData.subject,
        body: formData.body,
        category: 'custom'
      }, templateName);
      setSaveAsTemplateModal(false);
      setTemplateName('');
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
    template.category.toLowerCase().includes(templateSearch.toLowerCase())
  );

  const availableLeads = leads.filter(lead => 
    lead.email && (
      lead.contactName?.toLowerCase().includes(leadSearch.toLowerCase()) ||
      lead.companyName?.toLowerCase().includes(leadSearch.toLowerCase()) ||
      lead.email.toLowerCase().includes(leadSearch.toLowerCase())
    )
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Success Message */}
      {emailSent && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">Email sent successfully!</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Compose Email</h2>
          <div className="flex items-center gap-2">
            {isDraft && (
              <span className="text-sm text-amber-600 flex items-center gap-1">
                <Save className="w-4 h-4" />
                Draft
              </span>
            )}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Recipient Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={formData.toEmail}
                onChange={(e) => handleInputChange('toEmail', e.target.value)}
                placeholder="recipient@example.com"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => setShowLeadSelector(true)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-1"
              >
                <User className="w-4 h-4" />
                Select Lead
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Name
            </label>
            <input
              type="text"
              value={formData.recipientName}
              onChange={(e) => handleInputChange('recipientName', e.target.value)}
              placeholder="John Doe"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Template Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Template (Optional)
          </label>
          <div className="flex gap-2">
            {selectedTemplate ? (
              <div className="flex-1 flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-900 font-medium">{selectedTemplate.name}</span>
                  <span className="text-blue-600 text-sm">({selectedTemplate.category})</span>
                </div>
                <button
                  onClick={() => onTemplateSelect(null)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowTemplateSelector(true)}
                className="flex-1 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Choose Template
              </button>
            )}
          </div>
        </div>

        {/* Email Form */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            placeholder="Email subject line"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            value={formData.body}
            onChange={(e) => handleInputChange('body', e.target.value)}
            placeholder="Type your message here..."
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          />
          {personalizedContent && (
            <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
              <Wand2 className="w-3 h-3" />
              Content personalized using template variables
            </div>
          )}
        </div>

        {/* CC/BCC */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CC
            </label>
            <input
              type="email"
              value={formData.ccEmails}
              onChange={(e) => handleInputChange('ccEmails', e.target.value)}
              placeholder="cc@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {emailSettings.ccToBusinessEmail && (
              <p className="text-xs text-gray-500 mt-1">
                Business email will be automatically CC'd
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              BCC
            </label>
            <input
              type="email"
              value={formData.bccEmails}
              onChange={(e) => handleInputChange('bccEmails', e.target.value)}
              placeholder="bcc@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>
          
          <button
            onClick={() => setSaveAsTemplateModal(true)}
            disabled={!formData.subject && !formData.body}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Save as Template
          </button>
        </div>

        <button
          onClick={handleSendEmail}
          disabled={!formData.toEmail || !formData.subject || !formData.body}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          Send Email
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg max-w-2xl max-h-[80vh] overflow-y-auto m-4 w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Email Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3 mb-6 text-sm">
                <div><strong>To:</strong> {formData.recipientName} &lt;{formData.toEmail}&gt;</div>
                <div><strong>From:</strong> {currentUser?.name} &lt;{formData.fromEmail}&gt;</div>
                {formData.ccEmails && <div><strong>CC:</strong> {formData.ccEmails}</div>}
                <div><strong>Subject:</strong> {formData.subject}</div>
              </div>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-900">
                  {formData.body}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lead Selector Modal */}
      {showLeadSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg max-w-md max-h-[60vh] overflow-y-auto m-4 w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Select Lead</h3>
                <button
                  onClick={() => setShowLeadSelector(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Search leads..."
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="p-4 space-y-2">
              {availableLeads.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => {
                    onLeadSelect(lead);
                    setShowLeadSelector(false);
                  }}
                  className="w-full p-3 text-left hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200"
                >
                  <div className="font-medium text-gray-900">{lead.contactName}</div>
                  <div className="text-sm text-gray-600">{lead.companyName}</div>
                  <div className="text-sm text-gray-500">{lead.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg max-w-2xl max-h-[70vh] overflow-y-auto m-4 w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Select Template</h3>
                <button
                  onClick={() => setShowTemplateSelector(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Search templates..."
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="p-4 space-y-3">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    onTemplateSelect(template);
                    setShowTemplateSelector(false);
                  }}
                  className="w-full p-4 text-left hover:bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{template.name}</div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {template.category}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{template.subject}</div>
                  <div className="text-xs text-gray-500 line-clamp-2">
                    {template.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Save as Template Modal */}
      {saveAsTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg max-w-md m-4 w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Save as Template</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setSaveAsTemplateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAsTemplate}
                  disabled={!templateName.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >
                  Save Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailComposer;