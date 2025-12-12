export type Theme = 'dark' | 'light' | 'system';

export interface ThemeColors {
  background: string;
  cardBackground: string;
  text: string;
  textSecondary: string;
  primary: string;
  secondary: string;
  accent: string;
  border: string;
}

export const themes: Record<Exclude<Theme, 'system'>, ThemeColors> = {
  dark: {
    background: '#0b0c10',
    cardBackground: '#1f2833',
    text: '#c5c6c7',
    textSecondary: '#8b8b8b',
    primary: '#66fcf1',
    secondary: '#45a29e',
    accent: '#ff6b6b',
    border: '#c5c6c7',
  },
  light: {
    background: '#f5f5f5',
    cardBackground: '#ffffff',
    text: '#2c3e50',
    textSecondary: '#7f8c8d',
    primary: '#3498db',
    secondary: '#2ecc71',
    accent: '#e74c3c',
    border: '#bdc3c7',
  },
};

const getSystemTheme = (): 'light' | 'dark' => {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

let systemThemeCleanup: (() => void) | null = null;

export const applyTheme = (theme: Theme): (() => void) | undefined => {
  const effectiveTheme = theme === 'system' ? getSystemTheme() : theme;
  const colors = themes[effectiveTheme];
  const root = document.documentElement;

  // Set old CSS variables for backward compatibility
  root.style.setProperty('--bg-color', colors.background);
  root.style.setProperty('--card-bg-color', colors.cardBackground);
  root.style.setProperty('--text-color', colors.text);
  root.style.setProperty('--text-secondary-color', colors.textSecondary);
  root.style.setProperty('--primary-color', colors.primary);
  root.style.setProperty('--secondary-color', colors.secondary);
  root.style.setProperty('--accent-color', colors.accent);
  root.style.setProperty('--border-color', colors.border);

  // Apply Tailwind dark mode class
  if (effectiveTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  localStorage.setItem('pausequest-theme', theme);

  // Clean up previous system theme listener if it exists
  if (systemThemeCleanup) {
    systemThemeCleanup();
    systemThemeCleanup = null;
  }

  // Listen for system theme changes if in system mode
  if (theme === 'system') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('system');
    mediaQuery.addEventListener('change', handleChange);
    
    // Store cleanup function
    systemThemeCleanup = () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
    
    // Return cleanup function
    return systemThemeCleanup;
  }
};

export const getStoredTheme = (): Theme => {
  const stored = localStorage.getItem('pausequest-theme');
  return (stored as Theme) || 'dark';
};

export interface TimerPreset {
  id: string;
  name: string;
  workDuration: number; // in seconds
  breakDuration: number; // in seconds
}

export const timerPresets: TimerPreset[] = [
  { id: 'pomodoro', name: 'Pomodoro (25/5)', workDuration: 1500, breakDuration: 300 },
  { id: 'short', name: 'Short (15/3)', workDuration: 900, breakDuration: 180 },
  { id: 'long', name: 'Long (50/10)', workDuration: 3000, breakDuration: 600 },
  { id: 'custom', name: 'Custom', workDuration: 1500, breakDuration: 300 },
];

export type VisualizationType = 'rocket' | 'coffee' | 'digital';

export interface UserSettings {
  timerVisualization: VisualizationType;
  theme: Theme;
  soundEnabled: boolean;
  soundVolume: number;
  timerPreset: string;
  customWorkDuration: number;
  customBreakDuration: number;
  showMoodAvatars: boolean;
  enableVisualEffects: boolean;
  notifications : boolean;
  
}

export const getDefaultSettings = (): UserSettings => {
  const stored = localStorage.getItem('pausequest-settings');
  if (stored) {
    const parsed = JSON.parse(stored);
    // Migrate from old visualization types if needed
    if (!['rocket', 'coffee', 'digital'].includes(parsed.timerVisualization)) {
      parsed.timerVisualization = 'digital'; // Default to digital for invalid values
    }
    return parsed;
  }
  return {
  theme: 'dark',
  soundEnabled: true,
  timerVisualization: 'digital', // Default visualization
  soundVolume: 0.5,
  timerPreset: 'pomodoro',
  customWorkDuration: 1500,
  customBreakDuration: 300,
  showMoodAvatars: true,
  enableVisualEffects: true,
  notifications: true
};
};

export const saveSettings = (settings: UserSettings): void => {
  localStorage.setItem('pausequest-settings', JSON.stringify(settings));
  applyTheme(settings.theme);
};
