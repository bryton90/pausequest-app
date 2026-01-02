import React from 'react';
import { UserSettings, timerPresets, VisualizationType } from '../../utils/theme';
import './Settings.css';
import { useBreakTypes } from '../../hooks/useBreakTypes';

interface SettingsProps {
  settings: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onSettingsChange, onClose }) => {
  const handleChange = (key: keyof UserSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const { breakTypes, addType, removeType, resetDefaults } = useBreakTypes();
  const [newLabel, setNewLabel] = React.useState('');
  const [newEmoji, setNewEmoji] = React.useState('');

  return (
    <div className="space-y-8">
      {/* Theme Settings */}
      <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-200/50">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">🎨</span> Appearance
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-gray-700 font-medium">Theme</label>
            <select 
              value={settings.theme} 
              onChange={(e) => handleChange('theme', e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-300 bg-bg-secondary text-text-primary focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-gray-700 font-medium">Timer Style</label>
            <select 
              value={settings.timerVisualization} 
              onChange={(e) => handleChange('timerVisualization', e.target.value as VisualizationType)}
              className="px-4 py-2 rounded-xl border border-gray-300 bg-bg-secondary text-text-primary focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            >
              <option value="rocket">🚀 Rocket Animation</option>
              <option value="coffee">☕ Coffee Cup</option>
              <option value="digital">🔢 Digital Display</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timer Settings */}
      <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-200/50">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">⏱️</span> Timer
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-gray-700 font-medium">Preset</label>
            <select 
              value={settings.timerPreset} 
              onChange={(e) => handleChange('timerPreset', e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-300 bg-bg-secondary text-text-primary focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            >
              {timerPresets.map(preset => (
                <option key={preset.id} value={preset.id}>{preset.name}</option>
              ))}
            </select>
          </div>
          {settings.timerPreset === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-700 font-medium block mb-2">Work Duration (minutes)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="120"
                  value={Math.floor(settings.customWorkDuration / 60)}
                  onChange={(e) => handleChange('customWorkDuration', parseInt(e.target.value) * 60)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-bg-color text-text-primary focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                />
              </div>
              <div>
                <label className="text-gray-700 font-medium block mb-2">Break Duration (minutes)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="30"
                  value={Math.floor(settings.customBreakDuration / 60)}
                  onChange={(e) => handleChange('customBreakDuration', parseInt(e.target.value) * 60)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-bg-color text-text-primary focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sound Settings */}
      <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-200/50">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">🔊</span> Sound
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-gray-700 font-medium flex items-center">
              <input 
                type="checkbox" 
                checked={settings.soundEnabled}
                onChange={(e) => handleChange('soundEnabled', e.target.checked)}
                className="mr-3 h-5 w-5 text-indigo-600 rounded-lg border-gray-300 focus:ring-indigo-500 focus:ring-2"
              />
              Enable Sounds
            </label>
          </div>
          {settings.soundEnabled && (
            <div className="flex items-center justify-between">
              <label className="text-gray-700 font-medium">Volume</label>
              <div className="flex items-center space-x-3">
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1"
                  value={settings.soundVolume}
                  onChange={(e) => handleChange('soundVolume', parseFloat(e.target.value))}
                  className="w-32"
                />
                <span className="text-sm font-medium text-gray-600 w-12">{Math.round(settings.soundVolume * 100)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

          {/* Break Types */}
      <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-200/50">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">🧩</span> Break Types
        </h3>
        <div className="space-y-4">
          <div className="flex gap-3 items-center flex-wrap">
            <input
              type="text"
              placeholder="Label (e.g., Walk)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-300 bg-bg-secondary text-text-primary focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            />
            <input
              type="text"
              placeholder="Emoji (optional)"
              value={newEmoji}
              onChange={(e) => setNewEmoji(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-300 bg-bg-secondary text-text-primary focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all w-24"
            />
            <button
              onClick={() => {
                if (!newLabel.trim()) return;
                addType(newLabel, newEmoji || undefined);
                setNewLabel('');
                setNewEmoji('');
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Add
            </button>
            <button 
              onClick={resetDefaults}
              className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
            >
              Reset Defaults
            </button>
          </div>
          <div className="space-y-2">
            {breakTypes.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-bg-color rounded-xl border border-gray-200">
                <span className="text-gray-700 font-medium">{t.label} {t.emoji}</span>
                <button 
                  onClick={() => removeType(t.id)}
                  className="text-red-500 hover:text-red-700 font-medium text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
