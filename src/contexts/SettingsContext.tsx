import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';

export type TimerVisualization = 'battery' | 'rocket' | 'coffee' | 'default' | 'circle' | 'bar' | 'digital';
export type ThemePreference = 'light' | 'dark' | 'system';

interface NotificationPreferences {
  breakReminders: boolean;
  sessionComplete: boolean;
  dailySummary: boolean;
  weeklyReport: boolean;
}

interface SettingsContextType {
  // Timer Settings
  timerVisualization: TimerVisualization;
  setTimerVisualization: (visualization: TimerVisualization) => void;
  
  // Display Settings
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  showMoodAvatars: boolean;
  toggleMoodAvatars: () => void;
  enableVisualEffects: boolean;
  toggleVisualEffects: () => void;
  
  // Notification Settings
  notifications: NotificationPreferences;
  updateNotificationPreference: (key: keyof NotificationPreferences, value: boolean) => void;
  
  // Utility
  isDarkMode: boolean;
}

const defaultSettings = {
  // Timer Settings
  timerVisualization: 'default' as TimerVisualization,
  
  // Display Settings
  theme: 'system' as ThemePreference,
  showMoodAvatars: true,
  enableVisualEffects: true,
  
  // Notification Settings
  notifications: {
    breakReminders: true,
    sessionComplete: true,
    dailySummary: true,
    weeklyReport: false,
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('appSettings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch (e) {
      console.error('Failed to parse settings, using defaults', e);
      return defaultSettings;
    }
  });

  // Apply theme when it changes
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = settings.theme === 'dark' || 
                  (settings.theme === 'system' && 
                   window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }, [settings]);

  // Timer Settings
  const setTimerVisualization = useCallback((visualization: TimerVisualization) => {
    setSettings((prev: any) => ({
      ...prev,
      timerVisualization: visualization,
    }));
  }, []);

  // Display Settings
  const setTheme = useCallback((theme: ThemePreference) => {
    setSettings((prev: any) => ({
      ...prev,
      theme,
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

  // Notification Settings
  const updateNotificationPreference = useCallback((key: keyof NotificationPreferences, value: boolean) => {
    setSettings((prev: any) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  }, []);

  // Check if we're in dark mode
  const isDarkMode = useMemo(() => {
    return settings.theme === 'dark' || 
           (settings.theme === 'system' && 
            window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, [settings.theme]);

  const value = useMemo(() => ({
    // Timer Settings
    timerVisualization: settings.timerVisualization,
    setTimerVisualization,
    
    // Display Settings
    theme: settings.theme,
    setTheme,
    showMoodAvatars: settings.showMoodAvatars,
    toggleMoodAvatars,
    enableVisualEffects: settings.enableVisualEffects,
    toggleVisualEffects,
    
    // Notification Settings
    notifications: settings.notifications,
    updateNotificationPreference,
    
    // Utility
    isDarkMode,
  }), [
    settings.timerVisualization,
    settings.theme,
    settings.showMoodAvatars,
    settings.enableVisualEffects,
    settings.notifications,
    isDarkMode,
    setTimerVisualization,
    setTheme,
    toggleMoodAvatars,
    toggleVisualEffects,
    updateNotificationPreference,
  ]);

  return (
    <SettingsContext.Provider value={value}>
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
