import React from 'react';
import NotificationHelper from '../utils/notificationHelper';
import { 
  NOTIFICATION_TYPES, 
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_CATEGORIES 
} from '../constants';

const NotificationTest = () => {
  const testNotifications = () => {
    // Test Lead Notification
    NotificationHelper.notifyLeadAssigned({
      id: '123',
      name: 'John Doe',
      company: 'Acme Corp',
      assignedTo: '1',
      assignedToName: 'You'
    });

    // Test Deal Won Notification
    setTimeout(() => {
      NotificationHelper.notifyDealWon({
        id: '456',
        company: 'TechStart Inc',
        amount: 75000,
        ownerId: '1',
        ownerName: 'You'
      });
    }, 1000);

    // Test Task Overdue Notification
    setTimeout(() => {
      NotificationHelper.notifyTaskOverdue({
        id: '789',
        title: 'Follow up with client',
        overdueDays: 3
      });
    }, 2000);

    // Test Meeting Reminder
    setTimeout(() => {
      NotificationHelper.notifyMeetingReminder({
        id: '101',
        title: 'Sales Team Meeting',
        startTime: new Date(Date.now() + 30 * 60 * 1000),
        minutesUntil: 30
      });
    }, 3000);

    // Test Target Achievement
    setTimeout(() => {
      NotificationHelper.notifyTargetAchieved({
        userId: '1',
        userName: 'You',
        percentage: 125,
        period: 'monthly',
        target: 100000,
        achieved: 125000
      });
    }, 4000);

    // Test System Alert
    setTimeout(() => {
      NotificationHelper.notifyIntegrationAlert({
        integration: 'Salesforce',
        message: 'Successfully synced 150 contacts',
        connected: true,
        priority: NOTIFICATION_PRIORITIES.LOW
      });
    }, 5000);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Notification System Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Notifications</h2>
          <p className="text-gray-600 mb-4">
            Click the button below to generate test notifications. They will appear in the notification center.
          </p>
          <button
            onClick={testNotifications}
            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transform hover:scale-[1.02] transition-all font-medium"
          >
            Generate Test Notifications
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">How to test:</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Click the "Generate Test Notifications" button above</li>
            <li>Look for the Notifications button in the sidebar (Bell icon)</li>
            <li>You should see a red badge with the number of unread notifications</li>
            <li>Click on Notifications to open the full Notification Center</li>
            <li>Try filtering by category, marking as read, deleting, etc.</li>
            <li>Switch to the Activity Log tab to see all activities</li>
            <li>Click the Settings icon to configure notification preferences</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default NotificationTest;