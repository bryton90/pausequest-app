import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { VisualizationType, timerPresets, TimerPreset } from '../utils/theme';

export type ThemePreference = 'light' | 'dark' | 'system';

interface NotificationPreferences {
  breakReminders: boolean;
  sessionComplete: boolean;
  dailySummary: boolean;
  weeklyReport: boolean;
}

interface TimerSettings {
  visualization: VisualizationType;
  preset: string;
  customWorkDuration: number;
  customBreakDuration: number;
}

interface SoundSettings {
  enabled: boolean;
  volume: number;
}

interface SettingsContextType {
  // Timer Settings
  timerSettings: TimerSettings;
  setTimerVisualization: (visualization: VisualizationType) => void;
  setTimerPreset: (preset: string) => void;
  setCustomWorkDuration: (duration: number) => void;
  setCustomBreakDuration: (duration: number) => void;
  
  // Display Settings
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  showMoodAvatars: boolean;
  toggleMoodAvatars: () => void;
  enableVisualEffects: boolean;
  toggleVisualEffects: () => void;
  
  // Sound Settings
  soundSettings: SoundSettings;
  setSoundEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  
  // Notification Settings
  notifications: NotificationPreferences;
  updateNotificationPreference: (key: keyof NotificationPreferences, value: boolean) => void;
  
  // Utility
  isDarkMode: boolean;
  getCurrentTimerPreset: () => TimerPreset;
}

const defaultSettings = {
  // Timer Settings
  timerSettings: {
    visualization: 'digital' as VisualizationType,
    preset: 'pomodoro',
    customWorkDuration: 1500, // 25 minutes
    customBreakDuration: 300, // 5 minutes
  },
  
  // Display Settings
  theme: 'system' as ThemePreference,
  showMoodAvatars: true,
  enableVisualEffects: true,
  
  // Sound Settings
  soundSettings: {
    enabled: true,
    volume: 0.5,
  },
  
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

  // Apply theme on initial mount
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = settings.theme === 'dark' || 
                  (settings.theme === 'system' && 
                   window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    // Update CSS variables for both light and dark themes
    if (isDark) {
      root.style.setProperty('--bg-color', '#1a1a1a');
      root.style.setProperty('--bg-secondary', '#2d2d2d');
      root.style.setProperty('--bg-hover', '#3d3d3d');
      root.style.setProperty('--text-primary', '#FAFAFA');
      root.style.setProperty('--text-secondary', '#d1d5db');
      root.style.setProperty('--border-color', '#3d3d3d');
      root.style.setProperty('--primary-color', '#98FB98');
      root.style.setProperty('--primary-hover', '#2E8B57');
      root.classList.add('dark');
    } else {
      root.style.setProperty('--bg-color', '#FAFAFA');
      root.style.setProperty('--bg-secondary', '#E0F6E0');
      root.style.setProperty('--bg-hover', '#98FB98');
      root.style.setProperty('--text-primary', '#2F4F4F');
      root.style.setProperty('--text-secondary', '#6b7280');
      root.style.setProperty('--border-color', '#E0F6E0');
      root.style.setProperty('--primary-color', '#98FB98');
      root.style.setProperty('--primary-hover', '#2E8B57');
      root.classList.remove('dark');
    }
    
    // Update data-theme attribute for CSS selectors
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, []); // Run only on mount

  // Apply theme when it changes
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = settings.theme === 'dark' || 
                  (settings.theme === 'system' && 
                   window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    // Update CSS variables for both light and dark themes
    if (isDark) {
      root.style.setProperty('--bg-color', '#1a1a1a');
      root.style.setProperty('--bg-secondary', '#2d2d2d');
      root.style.setProperty('--bg-hover', '#3d3d3d');
      root.style.setProperty('--text-primary', '#FAFAFA');
      root.style.setProperty('--text-secondary', '#d1d5db');
      root.style.setProperty('--border-color', '#3d3d3d');
      root.style.setProperty('--primary-color', '#98FB98');
      root.style.setProperty('--primary-hover', '#2E8B57');
      root.classList.add('dark');
    } else {
      root.style.setProperty('--bg-color', '#FAFAFA');
      root.style.setProperty('--bg-secondary', '#E0F6E0');
      root.style.setProperty('--bg-hover', '#98FB98');
      root.style.setProperty('--text-primary', '#2F4F4F');
      root.style.setProperty('--text-secondary', '#6b7280');
      root.style.setProperty('--border-color', '#E0F6E0');
      root.style.setProperty('--primary-color', '#98FB98');
      root.style.setProperty('--primary-hover', '#2E8B57');
      root.classList.remove('dark');
    }
    
    // Update data-theme attribute for CSS selectors
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [settings.theme]);

  // Listen for system theme changes when using system theme
  useEffect(() => {
    if (settings.theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = window.document.documentElement;
      const isDark = mediaQuery.matches;
      
      // Update CSS variables for system theme change
      if (isDark) {
        root.style.setProperty('--bg-color', '#1f2937');
        root.style.setProperty('--bg-secondary', '#374151');
        root.style.setProperty('--bg-hover', '#4b5563');
        root.style.setProperty('--text-primary', '#f9fafb');
        root.style.setProperty('--text-secondary', '#d1d5db');
        root.style.setProperty('--border-color', '#4b5563');
        root.style.setProperty('--primary-color', '#6366f1');
        root.style.setProperty('--primary-hover', '#4f46e5');
        root.classList.add('dark');
      } else {
        root.style.setProperty('--bg-color', '#ffffff');
        root.style.setProperty('--bg-secondary', '#f9fafb');
        root.style.setProperty('--bg-hover', '#f3f4f6');
        root.style.setProperty('--text-primary', '#1f2937');
        root.style.setProperty('--text-secondary', '#6b7280');
        root.style.setProperty('--border-color', '#e5e7eb');
        root.style.setProperty('--primary-color', '#4f46e5');
        root.style.setProperty('--primary-hover', '#4338ca');
        root.classList.remove('dark');
      }
      
      root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
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
  const setTimerVisualization = useCallback((visualization: VisualizationType) => {
    setSettings((prev: any) => ({
      ...prev,
      timerSettings: {
        ...prev.timerSettings,
        visualization,
      },
    }));
  }, []);

  const setTimerPreset = useCallback((preset: string) => {
    console.log('SettingsContext - setTimerPreset called with:', preset);
    setSettings((prev: any) => ({
      ...prev,
      timerSettings: {
        ...prev.timerSettings,
        preset,
      },
    }));
  }, []);

  const setCustomWorkDuration = useCallback((duration: number) => {
    setSettings((prev: any) => ({
      ...prev,
      timerSettings: {
        ...prev.timerSettings,
        customWorkDuration: duration,
      },
    }));
  }, []);

  const setCustomBreakDuration = useCallback((duration: number) => {
    setSettings((prev: any) => ({
      ...prev,
      timerSettings: {
        ...prev.timerSettings,
        customBreakDuration: duration,
      },
    }));
  }, []);

  // Display Settings
  const setTheme = useCallback((theme: ThemePreference) => {
    console.log('SettingsContext - setTheme called with:', theme);
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

  // Sound Settings
  const setSoundEnabled = useCallback((enabled: boolean) => {
    console.log('SettingsContext - setSoundEnabled called with:', enabled);
    setSettings((prev: any) => ({
      ...prev,
      soundSettings: {
        ...prev.soundSettings,
        enabled,
      },
    }));
  }, []);

  const setSoundVolume = useCallback((volume: number) => {
    console.log('SettingsContext - setSoundVolume called with:', volume);
    setSettings((prev: any) => ({
      ...prev,
      soundSettings: {
        ...prev.soundSettings,
        volume: Math.max(0, Math.min(1, volume)), // Clamp between 0 and 1
      },
    }));
  }, []);

  // Get current timer preset
  const getCurrentTimerPreset = useCallback((): TimerPreset => {
    if (settings.timerSettings.preset === 'custom') {
      return {
        id: 'custom',
        name: 'Custom',
        workDuration: settings.timerSettings.customWorkDuration,
        breakDuration: settings.timerSettings.customBreakDuration
      };
    }
    
    const preset = timerPresets.find(p => p.id === settings.timerSettings.preset);
    return preset || timerPresets.find(p => p.id === 'pomodoro') || timerPresets[0]!; // Fallback with non-null assertion
  }, [settings.timerSettings.preset, settings.timerSettings.customWorkDuration, settings.timerSettings.customBreakDuration]);

  // Check if we're in dark mode
  const isDarkMode = useMemo(() => {
    return settings.theme === 'dark' || 
           (settings.theme === 'system' && 
            window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, [settings.theme]);

  const value = useMemo(() => ({
    // Timer Settings
    timerSettings: settings.timerSettings,
    setTimerVisualization,
    setTimerPreset,
    setCustomWorkDuration,
    setCustomBreakDuration,
    
    // Display Settings
    theme: settings.theme,
    setTheme,
    showMoodAvatars: settings.showMoodAvatars,
    toggleMoodAvatars,
    enableVisualEffects: settings.enableVisualEffects,
    toggleVisualEffects,
    
    // Sound Settings
    soundSettings: settings.soundSettings,
    setSoundEnabled,
    setSoundVolume,
    
    // Notification Settings
    notifications: settings.notifications,
    updateNotificationPreference,
    
    // Utility
    isDarkMode,
    getCurrentTimerPreset,
  }), [
    settings.timerSettings,
    settings.theme,
    settings.showMoodAvatars,
    settings.enableVisualEffects,
    settings.soundSettings,
    settings.notifications,
    isDarkMode,
    setTimerVisualization,
    setTimerPreset,
    setCustomWorkDuration,
    setCustomBreakDuration,
    setTheme,
    toggleMoodAvatars,
    toggleVisualEffects,
    setSoundEnabled,
    setSoundVolume,
    updateNotificationPreference,
    getCurrentTimerPreset,
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
