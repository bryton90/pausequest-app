import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { FiMoon, FiSun, FiBell, FiClock, FiMail, FiCalendar } from 'react-icons/fi';

const SettingsPage: React.FC = () => {
  const {
    theme,
    setTheme,
    notifications,
    updateNotificationPreference,
    isDarkMode,
  } = useSettings();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-text-primary">Settings</h1>
      
      {/* Theme Settings */}
      <div className="bg-bg-secondary rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FiSun className="mr-2" />
          Appearance
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Theme
            </label>
            <div className="flex space-x-4">
              {[
                { value: 'light', label: 'Light', icon: <FiSun className="mr-2" /> },
                { value: 'dark', label: 'Dark', icon: <FiMoon className="mr-2" /> },
                { value: 'system', label: 'System', icon: <FiSun className="mr-2" /> },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value as 'light' | 'dark' | 'system')}
                  className={`flex items-center px-4 py-2 rounded-lg border ${
                    theme === option.value
                      ? 'bg-primary text-white border-primary'
                      : 'bg-bg-color border-border-color hover:bg-bg-hover'
                  } transition-colors`}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-bg-secondary rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FiBell className="mr-2" />
          Notifications
        </h2>
        
        <div className="space-y-4">
          {[
            {
              id: 'breakReminders',
              label: 'Break Reminders',
              description: 'Get notified when it\'s time to take a break',
              icon: <FiClock className="text-lg" />,
            },
            {
              id: 'sessionComplete',
              label: 'Session Complete',
              description: 'Get notified when a focus session is complete',
              icon: <FiClock className="text-lg" />,
            },
            {
              id: 'dailySummary',
              label: 'Daily Summary',
              description: 'Receive a daily summary of your productivity',
              icon: <FiMail className="text-lg" />,
            },
            {
              id: 'weeklyReport',
              label: 'Weekly Report',
              description: 'Get a weekly report every Monday',
              icon: <FiCalendar className="text-lg" />,
            },
          ].map(({ id, label, description, icon }) => (
            <div key={id} className="flex items-center justify-between p-4 bg-bg-color rounded-lg border border-border-color">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-full bg-primary bg-opacity-10 text-primary">
                  {icon}
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">{label}</h3>
                  <p className="text-sm text-text-secondary">{description}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[id as keyof typeof notifications]}
                  onChange={(e) => updateNotificationPreference(id as any, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Current Theme Indicator (for debugging) */}
      <div className="text-sm text-text-secondary mt-8 text-center">
        Current theme: {isDarkMode ? 'Dark' : 'Light'} (System: {theme})
      </div>
    </div>
  );
};

export default SettingsPage;
