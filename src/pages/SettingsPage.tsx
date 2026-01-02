import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { FiMoon, FiSun, FiBell, FiClock, FiMail, FiCalendar, FiVolume2, FiVolumeX, FiSettings } from 'react-icons/fi';
import { timerPresets, VisualizationType } from '../utils/theme';

const SettingsPage: React.FC = () => {
  const {
    theme,
    setTheme,
    notifications,
    updateNotificationPreference,
    isDarkMode,
    timerSettings,
    setTimerVisualization,
    setTimerPreset,
    setCustomWorkDuration,
    setCustomBreakDuration,
    soundSettings,
    setSoundEnabled,
    setSoundVolume,
    getCurrentTimerPreset,
  } = useSettings();

  const [customWorkMinutes, setCustomWorkMinutes] = useState(Math.floor(timerSettings.customWorkDuration / 60));
  const [customBreakMinutes, setCustomBreakMinutes] = useState(Math.floor(timerSettings.customBreakDuration / 60));

  const handleWorkDurationChange = (minutes: number) => {
    setCustomWorkMinutes(minutes);
    setCustomWorkDuration(minutes * 60);
  };

  const handleBreakDurationChange = (minutes: number) => {
    setCustomBreakMinutes(minutes);
    setCustomBreakDuration(minutes * 60);
  };

  const currentPreset = getCurrentTimerPreset();

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
            <div className="flex flex-wrap gap-2 sm:space-x-4">
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

      {/* Timer Settings */}
      <div className="bg-bg-secondary rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FiClock className="mr-2" />
          Timer
        </h2>
        
        <div className="space-y-6">
          {/* Timer Visualization */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Timer Style
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'digital', label: 'Digital' },
                { value: 'rocket', label: 'Rocket' },
                { value: 'coffee', label: 'Coffee' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimerVisualization(option.value as VisualizationType)}
                  className={`px-4 py-2 rounded-lg border text-center transition-colors ${
                    timerSettings.visualization === option.value
                      ? 'bg-primary text-white border-primary'
                      : 'bg-bg-color border-border-color hover:bg-bg-hover'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timer Presets */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Timer Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {timerPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setTimerPreset(preset.id)}
                  className={`px-3 py-2 rounded-lg border text-center transition-colors ${
                    timerSettings.preset === preset.id
                      ? 'bg-primary text-white border-primary'
                      : 'bg-bg-color border-border-color hover:bg-bg-hover'
                  }`}
                >
                  <div className="font-medium">{preset.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Durations */}
          {timerSettings.preset === 'custom' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Work Duration: {customWorkMinutes} minutes
                </label>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={customWorkMinutes}
                  onChange={(e) => handleWorkDurationChange(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Break Duration: {customBreakMinutes} minutes
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={customBreakMinutes}
                  onChange={(e) => handleBreakDurationChange(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Current Preset Info */}
          <div className="p-4 bg-bg-color rounded-lg border border-border-color">
            <div className="text-sm text-text-secondary">
              Current preset: <span className="font-medium text-text-primary">{currentPreset.name}</span>
            </div>
            <div className="text-sm text-text-secondary">
              Work: <span className="font-medium text-text-primary">{Math.floor(currentPreset.workDuration / 60)} min</span> • 
              Break: <span className="font-medium text-text-primary">{Math.floor(currentPreset.breakDuration / 60)} min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sound Settings */}
      <div className="bg-bg-secondary rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FiVolume2 className="mr-2" />
          Sound
        </h2>
        
        <div className="space-y-4">
          {/* Enable/Disable Sounds */}
          <div className="flex items-center justify-between p-4 bg-bg-color rounded-lg border border-border-color">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-primary bg-opacity-10 text-primary">
                {soundSettings.enabled ? <FiVolume2 className="text-lg" /> : <FiVolumeX className="text-lg" />}
              </div>
              <div>
                <h3 className="font-medium text-text-primary">Enable Sounds</h3>
                <p className="text-sm text-text-secondary">Play sounds when timer completes</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={soundSettings.enabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Volume Control */}
          {soundSettings.enabled && (
            <div className="p-4 bg-bg-color rounded-lg border border-border-color">
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Volume: {Math.round(soundSettings.volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={soundSettings.volume * 100}
                onChange={(e) => setSoundVolume(Number(e.target.value) / 100)}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-text-secondary mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          )}
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
