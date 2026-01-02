import React, { useState, useEffect } from 'react';
import { advancedNotificationService, NotificationPreferences } from '../../lib/services/advancedNotificationService';

interface NotificationSettingsProps {
  onPreferencesChange?: (preferences: NotificationPreferences) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onPreferencesChange }) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(advancedNotificationService.getPreferences());
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check current notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    const newPermission = await Notification.requestPermission();
    setPermission(newPermission);
  };

  const handlePreferenceChange = (category: keyof NotificationPreferences, field: string, value: any) => {
    const newPreferences = {
      ...preferences,
      [category]: {
        ...preferences[category],
        [field]: value
      }
    };
    
    setPreferences(newPreferences);
    advancedNotificationService.updatePreferences(newPreferences);
    onPreferencesChange?.(newPreferences);
  };

  const handleSimplePreferenceChange = (field: keyof NotificationPreferences, value: any) => {
    const newPreferences = {
      ...preferences,
      [field]: value
    };
    
    setPreferences(newPreferences);
    advancedNotificationService.updatePreferences(newPreferences);
    onPreferencesChange?.(newPreferences);
  };

  if (permission === 'denied') {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          Notifications Blocked
        </h3>
        <p className="text-red-700 dark:text-red-300 text-sm">
          Please enable notifications in your browser settings to use this feature.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Permission Status */}
      {permission === 'default' && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
            Enable Notifications
          </h3>
          <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
            Allow notifications to receive reminders and updates.
          </p>
          <button
            onClick={handleRequestPermission}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Enable Notifications
          </button>
        </div>
      )}

      {/* Morning Reminder Settings */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Morning Reminder</h3>
        
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Daily Morning Reminder
          </label>
          <input
            type="checkbox"
            checked={preferences.morningReminder.enabled}
            onChange={(e) => handlePreferenceChange('morningReminder', 'enabled', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>

        {preferences.morningReminder.enabled && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Reminder Time
              </label>
              <input
                type="time"
                value={preferences.morningReminder.time}
                onChange={(e) => handlePreferenceChange('morningReminder', 'time', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Custom Message
              </label>
              <textarea
                value={preferences.morningReminder.message}
                onChange={(e) => handlePreferenceChange('morningReminder', 'message', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground resize-none"
                placeholder="Enter your morning reminder message..."
              />
            </div>
          </>
        )}
      </div>

      {/* Break Reminder Settings */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Break Reminders</h3>
        
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Automatic Break Reminders
          </label>
          <input
            type="checkbox"
            checked={preferences.breakReminders.enabled}
            onChange={(e) => handlePreferenceChange('breakReminders', 'enabled', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>

        {preferences.breakReminders.enabled && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Reminder Interval (minutes)
            </label>
            <select
              value={preferences.breakReminders.interval}
              onChange={(e) => handlePreferenceChange('breakReminders', 'interval', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
            </select>
          </div>
        )}
      </div>

      {/* Session Summary Settings */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Session Summaries</h3>
        
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            End of Session Notifications
          </label>
          <input
            type="checkbox"
            checked={preferences.sessionSummaries.enabled}
            onChange={(e) => handlePreferenceChange('sessionSummaries', 'enabled', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Audio & Vibration Settings */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Audio & Haptics</h3>
        
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Sound Effects
          </label>
          <input
            type="checkbox"
            checked={preferences.soundEnabled}
            onChange={(e) => handleSimplePreferenceChange('soundEnabled', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Vibration
          </label>
          <input
            type="checkbox"
            checked={preferences.vibrationEnabled}
            onChange={(e) => handleSimplePreferenceChange('vibrationEnabled', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Test Notifications */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Test Notifications</h3>
        <div className="flex gap-2">
          <button
            onClick={() => advancedNotificationService.sendNotification({
              id: 'test-notification',
              title: 'Test Notification',
              message: 'This is a test notification from PauseQuest!',
              type: 'info'
            })}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Send Test Notification
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
