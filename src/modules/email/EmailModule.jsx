import React, { useState, useEffect } from 'react';
import { Mail, Send, FileText, Users, BarChart3, Settings, Inbox, PlusCircle, Search, Filter } from 'lucide-react';
import EmailComposer from './components/EmailComposer';
import EmailTemplates from './components/EmailTemplates';
import EmailHistory from './components/EmailHistory';
import EmailAnalytics from './components/EmailAnalytics';
import EmailSettings from './components/EmailSettings';
import useEmailStore from './stores/emailStore';
import useLeadStore from '../leads/stores/leadStore';
import useCRMStore from '../crm-core/stores/crmStore';
import useUserStore from '../../stores/userStore';

const EmailModule = () => {
  const [activeTab, setActiveTab] = useState('composer');
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  const { 
    emails, 
    templates, 
    getEmailStats, 
    initializeEmailData,
    searchEmails 
  } = useEmailStore();
  
  const { leads, getFilteredLeads } = useLeadStore();
  const { contacts, getFilteredContacts } = useCRMStore();
  const { currentUser } = useUserStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [emailStats, setEmailStats] = useState(null);

  useEffect(() => {
    // Initialize email data with demo emails and templates
    initializeEmailData();
    
    // Get email statistics
    const stats = getEmailStats();
    setEmailStats(stats);
  }, [initializeEmailData, getEmailStats]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedTemplate(null);
    setSelectedLead(null);
  };

  const handleLeadSelect = (lead) => {
    setSelectedLead(lead);
    setActiveTab('composer');
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setActiveTab('composer');
  };

  const tabs = [
    { id: 'composer', name: 'Compose Email', icon: PlusCircle },
    { id: 'templates', name: 'Templates', icon: FileText },
    { id: 'history', name: 'Email History', icon: Inbox },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  const filteredEmails = searchTerm ? searchEmails(searchTerm) : emails;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Email Management</h1>
                <p className="text-sm text-gray-600">Create, send, and track personalized emails</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            {emailStats && (
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{emailStats.totalEmails}</p>
                  <p className="text-xs text-gray-600">Total Emails</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{emailStats.totalSent}</p>
                  <p className="text-xs text-gray-600">Sent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{emailStats.totalTemplates}</p>
                  <p className="text-xs text-gray-600">Templates</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-teal-600">
                    {emailStats.openRate ? `${emailStats.openRate}%` : '0%'}
                  </p>
                  <p className="text-xs text-gray-600">Open Rate</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {activeTab === 'composer' && (
          <EmailComposer
            selectedLead={selectedLead}
            selectedTemplate={selectedTemplate}
            onLeadSelect={setSelectedLead}
            onTemplateSelect={setSelectedTemplate}
          />
        )}
        
        {activeTab === 'templates' && (
          <EmailTemplates
            onTemplateSelect={handleTemplateSelect}
            onUseTemplate={(template) => {
              setSelectedTemplate(template);
              setActiveTab('composer');
            }}
          />
        )}
        
        {activeTab === 'history' && (
          <EmailHistory
            emails={filteredEmails}
            onLeadSelect={handleLeadSelect}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        )}
        
        {activeTab === 'analytics' && (
          <EmailAnalytics />
        )}
        
        {activeTab === 'settings' && (
          <EmailSettings />
        )}
      </div>
    </div>
  );
};

export default EmailModule;