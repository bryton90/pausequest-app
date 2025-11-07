import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import SmartSchedulerSettings from './SmartSchedulerSettings';

type TimerVisualization = 'default' | 'battery' | 'rocket' | 'coffee' | 'circle' | 'bar' | 'digital';

interface LocalSettings {
  timerVisualization: TimerVisualization;
  showMoodAvatars: boolean;
  enableVisualEffects: boolean;
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const {
    timerVisualization,
    setTimerVisualization,
    showMoodAvatars,
    toggleMoodAvatars,
    enableVisualEffects,
    toggleVisualEffects,
  } = useSettings();
  
  const [activeTab, setActiveTab] = useState('general');
  const [localSettings, setLocalSettings] = useState<LocalSettings>({
    timerVisualization: timerVisualization as TimerVisualization,
    showMoodAvatars,
    enableVisualEffects
  });
  
  useEffect(() => {
    setLocalSettings({
      timerVisualization,
      showMoodAvatars,
      enableVisualEffects
    });
  }, [timerVisualization, showMoodAvatars, enableVisualEffects]);

  if (!isOpen) return null;

  const visualizations: { id: TimerVisualization; label: string; emoji: string }[] = [
    { id: 'default', label: 'Default', emoji: '⏱️' },
    { id: 'battery', label: 'Battery', emoji: '🔋' },
    { id: 'rocket', label: 'Rocket', emoji: '🚀' },
    { id: 'coffee', label: 'Coffee', emoji: '☕' },
    { id: 'circle', label: 'Circle', emoji: '⭕' },
    { id: 'bar', label: 'Progress Bar', emoji: '📊' },
    { id: 'digital', label: 'Digital', emoji: '🖥️' },
  ];

  const handleSave = () => {
    // Update timer visualization if changed
    if (localSettings.timerVisualization !== timerVisualization) {
      setTimerVisualization(localSettings.timerVisualization);
    }
    
    // Toggle mood avatars if changed
    if (localSettings.showMoodAvatars !== showMoodAvatars) {
      toggleMoodAvatars();
    }
    
    // Toggle visual effects if changed
    if (localSettings.enableVisualEffects !== enableVisualEffects) {
      toggleVisualEffects();
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              aria-label="Close settings"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('general')}
                className={`${
                  activeTab === 'general'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                General
              </button>
              <button
                onClick={() => setActiveTab('scheduling')}
                className={`${
                  activeTab === 'scheduling'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Break Scheduling
              </button>
            </nav>
          </div>

          <div className="space-y-6">
            {activeTab === 'general' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">General Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Timer Visualization
                    </label>
                    <select
                      value={localSettings.timerVisualization}
                      onChange={(e) => setLocalSettings({
                        ...localSettings, 
                        timerVisualization: e.target.value as TimerVisualization
                      })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="circle">Circle</option>
                      <option value="bar">Progress Bar</option>
                      <option value="digital">Digital</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="showMoodAvatars"
                        checked={localSettings.showMoodAvatars}
                        onChange={(e) => setLocalSettings({...localSettings, showMoodAvatars: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="showMoodAvatars" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Show mood avatars
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'scheduling' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Break Scheduling</h3>
                <SmartSchedulerSettings />
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
