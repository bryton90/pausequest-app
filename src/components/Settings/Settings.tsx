import React from 'react';
import { UserSettings, timerPresets } from '../../utils/theme';
import './Settings.css';

interface SettingsProps {
  settings: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onSettingsChange, onClose }) => {
  const handleChange = (key: keyof UserSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>⚙️ Settings</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="settings-content">
          {/* Theme Settings */}
          <div className="settings-section">
            <h3>🎨 Appearance</h3>
            <div className="setting-item">
              <label>Theme</label>
              <select 
                value={settings.theme} 
                onChange={(e) => handleChange('theme', e.target.value)}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
            <div className="setting-item">
              <label>Animation Type</label>
              <select 
                value={settings.animationType} 
                onChange={(e) => handleChange('animationType', e.target.value)}
              >
                <option value="battery">Battery Only</option>
                <option value="rocket">Rocket Only</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>

          {/* Timer Settings */}
          <div className="settings-section">
            <h3>⏱️ Timer</h3>
            <div className="setting-item">
              <label>Preset</label>
              <select 
                value={settings.timerPreset} 
                onChange={(e) => handleChange('timerPreset', e.target.value)}
              >
                {timerPresets.map(preset => (
                  <option key={preset.id} value={preset.id}>{preset.name}</option>
                ))}
              </select>
            </div>
            {settings.timerPreset === 'custom' && (
              <>
                <div className="setting-item">
                  <label>Work Duration (minutes)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="120"
                    value={Math.floor(settings.customWorkDuration / 60)}
                    onChange={(e) => handleChange('customWorkDuration', parseInt(e.target.value) * 60)}
                  />
                </div>
                <div className="setting-item">
                  <label>Break Duration (minutes)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="30"
                    value={Math.floor(settings.customBreakDuration / 60)}
                    onChange={(e) => handleChange('customBreakDuration', parseInt(e.target.value) * 60)}
                  />
                </div>
              </>
            )}
          </div>

          {/* Sound Settings */}
          <div className="settings-section">
            <h3>🔊 Sound</h3>
            <div className="setting-item">
              <label>
                <input 
                  type="checkbox" 
                  checked={settings.soundEnabled}
                  onChange={(e) => handleChange('soundEnabled', e.target.checked)}
                />
                Enable Sounds
              </label>
            </div>
            {settings.soundEnabled && (
              <div className="setting-item">
                <label>Volume</label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1"
                  value={settings.soundVolume}
                  onChange={(e) => handleChange('soundVolume', parseFloat(e.target.value))}
                />
                <span>{Math.round(settings.soundVolume * 100)}%</span>
              </div>
            )}
          </div>
        </div>

        <div className="settings-footer">
          <button className="save-btn" onClick={onClose}>Save & Close</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
