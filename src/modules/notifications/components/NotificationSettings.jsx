import React, { useState } from 'react';
import {
  X, Bell, Mail, Smartphone, Monitor, Volume2,
  Vibrate, Moon, Clock, Check, Save, Info,
  ChevronRight, MessageSquare, Shield, Settings
} from 'lucide-react';
import useNotificationStore from '../stores/notificationStore';
import {
  NOTIFICATION_PREFERENCES,
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPE_LABELS,
  CHANNEL_PREFERENCES,
  DEFAULT_NOTIFICATION_SETTINGS
} from '../constants';

const NotificationSettings = ({ onClose }) => {
  const { preferences, updatePreferences, updateChannelPreference } = useNotificationStore();
  const [activeTab, setActiveTab] = useState('general');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [tempPreferences, setTempPreferences] = useState(preferences);

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'channels', label: 'Channels', icon: MessageSquare },
    { id: 'types', label: 'Notification Types', icon: Bell }
  ];

  const handlePreferenceChange = (key, value) => {
    setTempPreferences(prev => ({ ...prev, [key]: value }));
    setUnsavedChanges(true);
  };

  const handleSave = () => {
    updatePreferences(tempPreferences);
    setUnsavedChanges(false);
  };

  const handleReset = () => {
    setTempPreferences(DEFAULT_NOTIFICATION_SETTINGS);
    setUnsavedChanges(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Notification Settings
                </h2>
                <p className="text-white/80 text-sm">
                  Configure how and when you receive notifications
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-all duration-200 border-b-2 ${
                    activeTab === tab.id
                      ? 'text-teal-600 border-teal-600 bg-teal-50/50'
                      : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Browser Notifications</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    To receive desktop notifications, you need to grant permission in your browser settings.
                  </p>
                  <button
                    onClick={() => useNotificationStore.getState().requestNotificationPermission()}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Enable Browser Notifications
                  </button>
                </div>
              </div>

              {/* Sound Settings */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Sound & Alerts
                </h3>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Notification Sound</p>
                        <p className="text-sm text-gray-600">Play a sound when new notifications arrive</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={tempPreferences[NOTIFICATION_PREFERENCES.SOUND_ENABLED]}
                      onChange={(e) => handlePreferenceChange(NOTIFICATION_PREFERENCES.SOUND_ENABLED, e.target.checked)}
                      className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Vibrate className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Vibration</p>
                        <p className="text-sm text-gray-600">Vibrate on mobile devices</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={tempPreferences[NOTIFICATION_PREFERENCES.VIBRATION_ENABLED]}
                      onChange={(e) => handlePreferenceChange(NOTIFICATION_PREFERENCES.VIBRATION_ENABLED, e.target.checked)}
                      className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                  </label>
                </div>
              </div>

              {/* Quiet Hours */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Moon className="w-5 h-5" />
                  Quiet Hours
                </h3>
                
                <label className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors mb-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Enable Quiet Hours</p>
                      <p className="text-sm text-gray-600">Mute notifications during specific hours</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={tempPreferences[NOTIFICATION_PREFERENCES.QUIET_HOURS_ENABLED]}
                    onChange={(e) => handlePreferenceChange(NOTIFICATION_PREFERENCES.QUIET_HOURS_ENABLED, e.target.checked)}
                    className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                </label>

                {tempPreferences[NOTIFICATION_PREFERENCES.QUIET_HOURS_ENABLED] && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={tempPreferences[NOTIFICATION_PREFERENCES.QUIET_HOURS_START]}
                        onChange={(e) => handlePreferenceChange(NOTIFICATION_PREFERENCES.QUIET_HOURS_START, e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <input
                        type="time"
                        value={tempPreferences[NOTIFICATION_PREFERENCES.QUIET_HOURS_END]}
                        onChange={(e) => handlePreferenceChange(NOTIFICATION_PREFERENCES.QUIET_HOURS_END, e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Channel Settings */}
          {activeTab === 'channels' && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900">Channel Configuration</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Configure which notification channels are enabled for your account.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email Notifications */}
                <label className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Email Notifications</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Receive notifications via email
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={tempPreferences[NOTIFICATION_PREFERENCES.EMAIL_NOTIFICATIONS]}
                      onChange={(e) => handlePreferenceChange(NOTIFICATION_PREFERENCES.EMAIL_NOTIFICATIONS, e.target.checked)}
                      className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                  </div>
                </label>

                {/* Push Notifications */}
                <label className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <Smartphone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Push Notifications</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Mobile push notifications
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={tempPreferences[NOTIFICATION_PREFERENCES.PUSH_NOTIFICATIONS]}
                      onChange={(e) => handlePreferenceChange(NOTIFICATION_PREFERENCES.PUSH_NOTIFICATIONS, e.target.checked)}
                      className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                  </div>
                </label>

                {/* In-App Notifications */}
                <label className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <Bell className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">In-App Notifications</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Notifications within the app
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={tempPreferences[NOTIFICATION_PREFERENCES.IN_APP_NOTIFICATIONS]}
                      onChange={(e) => handlePreferenceChange(NOTIFICATION_PREFERENCES.IN_APP_NOTIFICATIONS, e.target.checked)}
                      className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                  </div>
                </label>

                {/* Desktop Notifications */}
                <label className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                        <Monitor className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Desktop Notifications</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Browser desktop notifications
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={tempPreferences[NOTIFICATION_PREFERENCES.DESKTOP_NOTIFICATIONS]}
                      onChange={(e) => handlePreferenceChange(NOTIFICATION_PREFERENCES.DESKTOP_NOTIFICATIONS, e.target.checked)}
                      className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Notification Types */}
          {activeTab === 'types' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Notification Types</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Choose which types of notifications you want to receive and through which channels.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(CHANNEL_PREFERENCES).map(([type, channels]) => (
                  <div key={type} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      {NOTIFICATION_TYPE_LABELS[type]}
                    </h4>
                    <div className="grid grid-cols-4 gap-4">
                      {Object.entries(channels).map(([channel, enabled]) => (
                        <label key={channel} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={tempPreferences.channels?.[type]?.[channel] ?? enabled}
                            onChange={(e) => updateChannelPreference(type, channel, e.target.checked)}
                            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                          />
                          <span className="text-sm text-gray-700 capitalize">{channel}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-gray-50 border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-xl transition-colors font-medium"
            >
              Reset to Defaults
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!unsavedChanges}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
                  unsavedChanges
                    ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:shadow-lg transform hover:scale-[1.02]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;