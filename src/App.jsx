import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, GitBranch, Mic, Command, Link2, BarChart3, UserCog, Bell, LogOut, Database, ShoppingCart, Mail } from 'lucide-react';
import LeadsModule from './modules/leads/LeadsModule';
import PerformanceModule from './modules/performance/PerformanceModule';
import RoutingModule from './modules/routing/RoutingModule';
import AssistantModule from './modules/assistant/AssistantModule';
import IntegrationModule from './modules/integration/IntegrationModule';
import AnalyticsModule from './modules/analytics/AnalyticsModule';
import TeamManagementModule from './modules/team-management/TeamManagementModule';
import NotificationsModule from './modules/notifications/NotificationsModule';
import CRMCoreModule from './modules/crm-core/CRMCoreModule';
import POSModule from './modules/pos/POSModule';
import EmailModule from './modules/email/EmailModule';
import useNotificationStore from './modules/notifications/stores/notificationStore';
import NotificationTest from './modules/notifications/test/NotificationTest';
import NotificationHelper from './modules/notifications/utils/notificationHelper';
import AuthContainer from './modules/auth/AuthContainer';
import useAuthStore from './modules/auth/stores/authStore';
import useCRMStore from './modules/crm-core/stores/crmStore';
import useEmailStore from './modules/email/stores/emailStore';
import { externalEmailMonitor } from './services/externalEmailMonitor';
import { initializeEmailIntegrations } from './utils/emailIntegrationUtils';
import Logo from './components/Logo';

function App() {
  const [activeModule, setActiveModule] = useState('performance'); // Start with performance to show Module 2
  const [showAssistant, setShowAssistant] = useState(false);
  const { unreadCount, initializeNotifications } = useNotificationStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { products, addProduct, getStatistics } = useCRMStore();

  // Initialize notifications on mount
  useEffect(() => {
    initializeNotifications();
  }, []);

  // Initialize email integrations and external monitoring
  useEffect(() => {
    initializeEmailIntegrations();

    // Start external email monitoring if enabled
    const { emailSettings } = useEmailStore.getState();
    if (emailSettings.externalEmailMonitoring) {
      externalEmailMonitor.startMonitoring();
    }

    return () => {
      // Cleanup monitoring on unmount
      externalEmailMonitor.stopMonitoring();
    };
  }, []);

  // Initialize CRM products if not already present
  useEffect(() => {
    const initializeProducts = () => {
      const stats = getStatistics();
      if (stats.totalProducts === 0) {
        // Add demo SaaS products
        const demoProducts = [
          {
            name: 'SalesForce Pro',
            sku: 'SF-PRO-001',
            description: 'Complete CRM solution with advanced sales automation, lead management, and customer insights.',
            category: 'crm-sales',
            price: 79.00,
            status: 'active',
            features: ['Lead Management', 'Sales Pipeline', 'Email Integration', 'Reporting Dashboard', 'Mobile App']
          },
          {
            name: 'MarketingHub Elite',
            sku: 'MH-ELI-002',
            description: 'Advanced marketing automation platform with email campaigns, lead nurturing, and analytics.',
            category: 'marketing',
            price: 149.00,
            status: 'active',
            features: ['Email Marketing', 'Lead Nurturing', 'Campaign Analytics', 'A/B Testing', 'Social Media Integration']
          },
          {
            name: 'DataViz Analytics',
            sku: 'DV-ANA-003',
            description: 'Business intelligence and data analytics platform with advanced reporting and dashboards.',
            category: 'analytics',
            price: 199.00,
            status: 'active',
            features: ['Advanced Analytics', 'Custom Dashboards', 'Data Sources', 'Real-time Reporting', 'Predictive Models']
          },
          {
            name: 'TeamSync Collaboration',
            sku: 'TS-COL-004',
            description: 'Project management and team collaboration platform with task tracking and communication tools.',
            category: 'productivity',
            price: 59.00,
            status: 'active',
            features: ['Project Management', 'Task Tracking', 'File Sharing', 'Team Chat', 'Time Tracking']
          },
          {
            name: 'SecureShield Enterprise',
            sku: 'SS-ENT-005',
            description: 'Comprehensive cybersecurity platform with threat detection, compliance, and data protection.',
            category: 'security',
            price: 299.00,
            status: 'active',
            features: ['Threat Detection', 'Compliance Management', 'Data Encryption', 'Security Monitoring', '24/7 Support']
          },
          {
            name: 'Digital Transformation Advisory',
            sku: 'DTA-008',
            description: 'Strategic consulting services for digital transformation and technology roadmapping.',
            category: 'consulting',
            price: 2500.00,
            status: 'active',
            features: ['Strategic Planning', 'Technology Assessment', 'Change Management', 'Training Programs', 'Ongoing Support']
          }
        ];

        console.log('Initializing demo products for lead association...');
        demoProducts.forEach(product => addProduct(product));
        console.log(`${demoProducts.length} demo products initialized`);
      }
    };

    initializeProducts();
  }, []);

  // Keyboard shortcut for voice assistant
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K to open voice assistant
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowAssistant(true);
      }
      // ESC to close
      if (e.key === 'Escape' && showAssistant) {
        setShowAssistant(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showAssistant]);

  const handleNavigate = (destination) => {
    const moduleMap = {
      'performance': 'performance',
      'dashboard': 'performance',
      'leads': 'leads',
      'lead': 'leads',
      'routing': 'routing',
      'route': 'routing',
      'integration': 'integration',
      'integrations': 'integration',
      'analytics': 'analytics',
      'reports': 'analytics',
      'reporting': 'analytics',
      'team': 'team-management',
      'teams': 'team-management',
      'users': 'team-management',
      'permissions': 'team-management',
      'notifications': 'notifications',
      'notification': 'notifications',
      'alerts': 'notifications',
      'activity': 'notifications',
      'crm': 'crm-core',
      'contacts': 'crm-core',
      'companies': 'crm-core',
      'deals': 'crm-core',
      'activities': 'crm-core',
      'pos': 'pos',
      'point of sale': 'pos',
      'checkout': 'pos',
      'products': 'pos',
      'inventory': 'pos',
      'transactions': 'pos',
      'email': 'email',
      'emails': 'email',
      'mail': 'email',
      'compose': 'email',
      'templates': 'email',
      'email templates': 'email',
      'email history': 'email',
      'email analytics': 'email'
    };

    const module = moduleMap[destination.toLowerCase()];
    if (module) {
      setActiveModule(module);
      setShowAssistant(false);
    }
  };

  const handleAuthSuccess = (user) => {
    // Authentication successful, the store will handle the state
    console.log('User authenticated:', user);
  };

  const handleLogout = () => {
    logout();
  };

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return <AuthContainer onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="h-screen flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-gray-900 text-white flex flex-col h-screen">
        <div className="p-6">
          <Logo size="default" textClassName="text-white" />
        </div>

        {/* User Profile Section */}
        <div className="px-4 pb-4">
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{user?.name}</p>
                <p className="text-gray-400 text-xs truncate">{user?.company}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <nav className="px-4 flex-1 overflow-y-auto pb-4">
          <button
            onClick={() => setActiveModule('performance')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeModule === 'performance'
                ? 'bg-teal-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
              }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Performance</span>
          </button>

          <button
            onClick={() => setActiveModule('crm-core')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeModule === 'crm-core'
                ? 'bg-teal-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
              }`}
          >
            <Database className="w-5 h-5" />
            <span className="font-medium">CRM Core</span>
          </button>

          {/* <button
            onClick={() => setActiveModule('pos')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeModule === 'pos'
                ? 'bg-teal-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
              }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium">Point of Sale</span>
          </button> */}

          <button
            onClick={() => setActiveModule('email')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeModule === 'email'
                ? 'bg-teal-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
              }`}
          >
            <Mail className="w-5 h-5" />
            <span className="font-medium">Email Management</span>
          </button>

          <button
            onClick={() => setActiveModule('leads')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeModule === 'leads'
                ? 'bg-teal-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
              }`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Leads</span>
          </button>

          <button
            onClick={() => setActiveModule('routing')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeModule === 'routing'
                ? 'bg-teal-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
              }`}
          >
            <GitBranch className="w-5 h-5" />
            <span className="font-medium">Lead Routing</span>
          </button>

          <button
            onClick={() => setActiveModule('integration')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeModule === 'integration'
                ? 'bg-teal-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
              }`}
          >
            <Link2 className="w-5 h-5" />
            <span className="font-medium">Integrations</span>
          </button>

          <button
            onClick={() => setActiveModule('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeModule === 'analytics'
                ? 'bg-teal-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
              }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Analytics</span>
          </button>

          <button
            onClick={() => setActiveModule('team-management')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeModule === 'team-management'
                ? 'bg-teal-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
              }`}
          >
            <UserCog className="w-5 h-5" />
            <span className="font-medium">Team Management</span>
          </button>

          <button
            onClick={() => setActiveModule('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors relative ${activeModule === 'notifications'
                ? 'bg-teal-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
              }`}
          >
            <Bell className="w-5 h-5" />
            <span className="font-medium">Notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-4 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto relative">
        {activeModule === 'crm-core' && <CRMCoreModule />}
        {activeModule === 'pos' && <POSModule />}
        {activeModule === 'email' && <EmailModule />}
        {activeModule === 'leads' && <LeadsModule />}
        {activeModule === 'performance' && <PerformanceModule />}
        {activeModule === 'routing' && <RoutingModule />}
        {activeModule === 'integration' && <IntegrationModule />}
        {activeModule === 'analytics' && <AnalyticsModule />}
        {activeModule === 'team-management' && <TeamManagementModule />}
        {activeModule === 'notifications' && <NotificationsModule />}
        {activeModule === 'test-notifications' && <NotificationTest />}

        {/* Test Notification Button - TEMPORARY FOR TESTING */}
        {/* <button
          onClick={() => {
            NotificationHelper.notifyLeadAssigned({
              id: Date.now().toString(),
              name: 'Test Lead ' + Math.floor(Math.random() * 100),
              company: 'Test Company',
              assignedTo: '1',
              assignedToName: 'You'
            });
            alert('Test notification sent! Check the bell icon in the sidebar.');
          }}
          className="fixed bottom-24 right-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg flex items-center justify-center transition-all hover:shadow-xl"
        >
          Test Notification
        </button> */}

        {/* Direct Link to Notifications - TEMPORARY FOR DEBUGGING */}
        {/* <button
          onClick={() => setActiveModule('notifications')}
          className="fixed top-4 right-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-lg flex items-center gap-2"
        >
          <Bell className="w-4 h-4" />
          Go to Notifications ({unreadCount})
        </button> */}

        {/* Voice Assistant Button */}
        <button
          onClick={() => setShowAssistant(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:shadow-xl group"
          title="Voice Assistant (Cmd/Ctrl + K)"
        >
          <Mic className="w-6 h-6" />
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Voice Assistant (⌘K)
          </div>
        </button>
      </div>

      {/* Voice Assistant Modal */}
      {showAssistant && (
        <AssistantModule
          onClose={() => setShowAssistant(false)}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}

export default App;