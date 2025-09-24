import React, { useState, useEffect } from 'react';
import { Settings, Mail, Server, Shield, Bell, Save, Check, AlertTriangle, Monitor, PlayCircle, StopCircle, Zap } from 'lucide-react';
import useEmailStore from '../stores/emailStore';
import useUserStore from '../../../stores/userStore';
import useLeadStore from '../../leads/stores/leadStore';
import { externalEmailMonitor } from '../../../services/externalEmailMonitor';

const EmailSettings = () => {
  const { emailSettings, updateEmailSettings } = useEmailStore();
  const { currentUser } = useUserStore();
  
  const [settings, setSettings] = useState({
    ...emailSettings,
    externalEmailMonitoring: emailSettings.externalEmailMonitoring || false,
    businessEmail: emailSettings.businessEmail || emailSettings.defaultFrom || '',
    gmailIntegration: emailSettings.gmailIntegration || { enabled: false, accessToken: '' },
    outlookIntegration: emailSettings.outlookIntegration || { enabled: false, accessToken: '' }
  });
  const [activeTab, setActiveTab] = useState('general');
  const [saveStatus, setSaveStatus] = useState(null);
  const [monitoringStatus, setMonitoringStatus] = useState(null);

  const handleSave = () => {
    updateEmailSettings(settings);
    setSaveStatus('saved');
    
    // Update external monitoring if settings changed
    if (settings.externalEmailMonitoring) {
      externalEmailMonitor.startMonitoring();
    } else {
      externalEmailMonitor.stopMonitoring();
    }
    
    setTimeout(() => setSaveStatus(null), 3000);
  };
  
  // Load monitoring status on component mount
  useEffect(() => {
    const status = externalEmailMonitor.getMonitoringStatus();
    setMonitoringStatus(status);
    
    // Set up periodic status updates
    const interval = setInterval(() => {
      const newStatus = externalEmailMonitor.getMonitoringStatus();
      setMonitoringStatus(newStatus);
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleSettingChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setSaveStatus('unsaved');
  };

  const handleSMTPChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      smtpSettings: {
        ...prev.smtpSettings,
        [field]: value
      }
    }));
    setSaveStatus('unsaved');
  };

  const testEmailConnection = async () => {
    // Mock email connection test
    setSaveStatus('testing');
    setTimeout(() => {
      setSaveStatus('test-success');
      setTimeout(() => setSaveStatus(null), 3000);
    }, 2000);
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'smtp', name: 'Email Server', icon: Server },
    { id: 'tracking', name: 'Tracking', icon: Shield },
    { id: 'external', name: 'External Emails', icon: Monitor },
    { id: 'notifications', name: 'Notifications', icon: Bell }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Email Settings</h2>
          <p className="text-sm text-gray-600">Configure your email preferences and connection settings</p>
        </div>
        
        <div className="flex items-center gap-3">
          {saveStatus === 'unsaved' && (
            <span className="text-sm text-amber-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              Unsaved changes
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <Check className="w-4 h-4" />
              Settings saved
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saved'}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
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

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">General Email Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default From Email
                    </label>
                    <input
                      type="email"
                      value={settings.defaultFrom}
                      onChange={(e) => handleSettingChange('defaultFrom', e.target.value)}
                      placeholder={currentUser?.email || 'your@email.com'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Signature
                    </label>
                    <textarea
                      value={settings.signature}
                      onChange={(e) => handleSettingChange('signature', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Best regards,&#10;Your Name&#10;Your Title&#10;Company Name"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Auto-save Templates</h4>
                      <p className="text-sm text-gray-600">Automatically save sent emails as templates for future use</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoSaveTemplates}
                        onChange={(e) => handleSettingChange('autoSaveTemplates', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Email Address
                    </label>
                    <input
                      type="email"
                      value={settings.businessEmail}
                      onChange={(e) => handleSettingChange('businessEmail', e.target.value)}
                      placeholder="business@company.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Used for CC functionality and external email monitoring</p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">CC to Business Email</h4>
                      <p className="text-sm text-gray-600">Automatically CC your business email for tracking</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.ccToBusinessEmail}
                        onChange={(e) => handleSettingChange('ccToBusinessEmail', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'smtp' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Email Server Configuration</h3>
                <p className="text-sm text-gray-600 mb-6">Configure SMTP settings to send emails directly from your server</p>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={settings.smtpSettings.host}
                        onChange={(e) => handleSMTPChange('host', e.target.value)}
                        placeholder="smtp.gmail.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Port
                      </label>
                      <input
                        type="number"
                        value={settings.smtpSettings.port}
                        onChange={(e) => handleSMTPChange('port', parseInt(e.target.value))}
                        placeholder="587"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={settings.smtpSettings.username}
                      onChange={(e) => handleSMTPChange('username', e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={settings.smtpSettings.password}
                      onChange={(e) => handleSMTPChange('password', e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Use SSL/TLS</h4>
                      <p className="text-sm text-gray-600">Enable secure connection (recommended)</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.smtpSettings.secure}
                        onChange={(e) => handleSMTPChange('secure', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={testEmailConnection}
                      disabled={saveStatus === 'testing'}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      {saveStatus === 'testing' ? 'Testing Connection...' : 'Test Connection'}
                    </button>
                    
                    {saveStatus === 'test-success' && (
                      <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        Connection test successful!
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Common SMTP Settings</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <div><strong>Gmail:</strong> smtp.gmail.com:587 (Use app-specific password)</div>
                  <div><strong>Outlook:</strong> smtp.live.com:587</div>
                  <div><strong>Yahoo:</strong> smtp.mail.yahoo.com:587</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tracking' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Email Tracking Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Enable Email Tracking</h4>
                      <p className="text-sm text-gray-600">Track email opens, clicks, and replies</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.trackingEnabled}
                        onChange={(e) => handleSettingChange('trackingEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {settings.trackingEnabled && (
                    <div className="pl-4 space-y-3">
                      <div className="text-sm text-gray-700">
                        <h5 className="font-medium mb-2">Tracking Features:</h5>
                        <ul className="space-y-1">
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            Email open tracking
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            Link click tracking
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            Reply detection
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            Auto-lead status updates
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="text-sm font-medium text-yellow-900 mb-2">Privacy Notice</h4>
                    <p className="text-sm text-yellow-700">
                      Email tracking uses invisible pixels and tracked links. Recipients are not explicitly notified. 
                      Ensure compliance with your local privacy laws and company policies.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'external' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">External Email Monitoring</h3>
                <p className="text-sm text-gray-600 mb-6">Monitor and process emails sent from personal accounts that are CC'd to your business email</p>
                
                <div className="space-y-6">
                  {/* Monitoring Status */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-gray-600" />
                        <h4 className="font-medium text-gray-900">Monitoring Status</h4>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                        monitoringStatus?.isMonitoring 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {monitoringStatus?.isMonitoring ? (
                          <><PlayCircle className="w-3 h-3" /> Active</>
                        ) : (
                          <><StopCircle className="w-3 h-3" /> Inactive</>
                        )}
                      </div>
                    </div>
                    
                    {monitoringStatus && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Total External</div>
                          <div className="font-medium text-gray-900">{monitoringStatus.totalExternalEmails}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Today</div>
                          <div className="font-medium text-gray-900">{monitoringStatus.todaysExternalEmails}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Last Check</div>
                          <div className="font-medium text-gray-900">
                            {monitoringStatus.lastCheck ? new Date(monitoringStatus.lastCheck).toLocaleTimeString() : 'Never'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Processed</div>
                          <div className="font-medium text-gray-900">{monitoringStatus.processedEmailsCount}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Enable/Disable Monitoring */}
                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Enable External Email Monitoring</h4>
                      <p className="text-sm text-gray-600">Monitor emails CC'd to business email and integrate with CRM</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.externalEmailMonitoring}
                        onChange={(e) => handleSettingChange('externalEmailMonitoring', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Test External Email */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Test External Email Processing</h4>
                        <p className="text-sm text-blue-700">Create a test scenario to verify email monitoring</p>
                      </div>
                      <button
                        onClick={() => {
                          // Create a test email scenario
                          const { leads } = useLeadStore.getState();
                          const testLead = leads.find(l => l.email);
                          if (testLead) {
                            externalEmailMonitor.createTestScenario(testLead.id, 'reply');
                          }
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3" />
                        Test
                      </button>
                    </div>
                  </div>

                  {/* How It Works */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="text-sm font-medium text-green-900 mb-2">How External Email Monitoring Works</h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>Sales rep sends email from personal account</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>Business email is automatically CC'd</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>System detects email and matches to lead</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>Email is logged in CRM with tracking</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>Lead status is updated automatically</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Enable Notifications</h4>
                      <p className="text-sm text-gray-600">Receive notifications for email events</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notificationsEnabled}
                        onChange={(e) => handleSettingChange('notificationsEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {settings.notificationsEnabled && (
                    <div className="pl-4 space-y-3">
                      <div className="text-sm text-gray-700">
                        <h5 className="font-medium mb-2">Notification Types:</h5>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span>Email opened by recipient</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span>Email replied to</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span>Links clicked in email</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span>Email bounced</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailSettings;