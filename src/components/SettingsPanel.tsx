import React from 'react';
import { useSettings, TimerVisualization } from '../contexts/SettingsContext';

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

  if (!isOpen) return null;

  const visualizations: { id: TimerVisualization; label: string; emoji: string }[] = [
    { id: 'default', label: 'Default', emoji: '⏱️' },
    { id: 'battery', label: 'Battery', emoji: '🔋' },
    { id: 'rocket', label: 'Rocket', emoji: '🚀' },
    { id: 'coffee', label: 'Coffee', emoji: '☕' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
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

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Timer Style</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {visualizations.map((viz) => (
                  <button
                    key={viz.id}
                    onClick={() => setTimerVisualization(viz.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg transition-colors ${
                      timerVisualization === viz.id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span className="text-2xl mb-1">{viz.emoji}</span>
                    <span className="text-sm font-medium">{viz.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Mood Avatars</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Show mood-based avatars during breaks
                  </p>
                </div>
                <button
                  onClick={toggleMoodAvatars}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    showMoodAvatars ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showMoodAvatars ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Visual Effects</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enable animations and visual feedback
                  </p>
                </div>
                <button
                  onClick={toggleVisualEffects}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    enableVisualEffects ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      enableVisualEffects ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
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
