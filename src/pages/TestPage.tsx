import React from 'react';
import { useSettings } from '../contexts/SettingsContext';

const TestPage: React.FC = () => {
  const settings = useSettings();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="font-semibold">Current Theme:</h2>
          <p>{settings.theme}</p>
          <p>Is Dark Mode: {settings.isDarkMode ? 'Yes' : 'No'}</p>
        </div>
        
        <div>
          <h2 className="font-semibold">Timer Settings:</h2>
          <p>Preset: {settings.timerSettings.preset}</p>
          <p>Visualization: {settings.timerSettings.visualization}</p>
          <p>Work Duration: {settings.timerSettings.customWorkDuration}s</p>
          <p>Break Duration: {settings.timerSettings.customBreakDuration}s</p>
        </div>
        
        <div>
          <h2 className="font-semibold">Sound Settings:</h2>
          <p>Enabled: {settings.soundSettings.enabled ? 'Yes' : 'No'}</p>
          <p>Volume: {Math.round(settings.soundSettings.volume * 100)}%</p>
        </div>
        
        <div className="space-y-2">
          <button 
            onClick={() => settings.setTheme('light')}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Set Light Theme
          </button>
          <button 
            onClick={() => settings.setTheme('dark')}
            className="px-4 py-2 bg-gray-800 text-white rounded ml-2"
          >
            Set Dark Theme
          </button>
          <button 
            onClick={() => settings.setTimerPreset('pomodoro')}
            className="px-4 py-2 bg-green-500 text-white rounded ml-2"
          >
            Set Pomodoro
          </button>
          <button 
            onClick={() => settings.setSoundEnabled(!settings.soundSettings.enabled)}
            className="px-4 py-2 bg-red-500 text-white rounded ml-2"
          >
            Toggle Sound
          </button>
        </div>
        
        <div>
          <h2 className="font-semibold">Current Preset Info:</h2>
          <pre>{JSON.stringify(settings.getCurrentTimerPreset(), null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
