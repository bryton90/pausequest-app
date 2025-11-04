import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';

export type TimerVisualization = 'battery' | 'rocket' | 'coffee' | 'default';

interface SettingsContextType {
  timerVisualization: TimerVisualization;
  setTimerVisualization: (visualization: TimerVisualization) => void;
  showMoodAvatars: boolean;
  toggleMoodAvatars: () => void;
  enableVisualEffects: boolean;
  toggleVisualEffects: () => void;
}

const defaultSettings = {
  timerVisualization: 'default' as TimerVisualization,
  showMoodAvatars: true,
  enableVisualEffects: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('appSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  const setTimerVisualization = useCallback((visualization: TimerVisualization) => {
    setSettings((prev: any) => ({
      ...prev,
      timerVisualization: visualization,
    }));
  }, []);

  const toggleMoodAvatars = useCallback(() => {
    setSettings((prev: any) => ({
      ...prev,
      showMoodAvatars: !prev.showMoodAvatars,
    }));
  }, []);

  const toggleVisualEffects = useCallback(() => {
    setSettings((prev: any) => ({
      ...prev,
      enableVisualEffects: !prev.enableVisualEffects,
    }));
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        timerVisualization: settings.timerVisualization,
        setTimerVisualization,
        showMoodAvatars: settings.showMoodAvatars,
        toggleMoodAvatars,
        enableVisualEffects: settings.enableVisualEffects,
        toggleVisualEffects,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsContext;
