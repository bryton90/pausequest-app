import { analyzePatterns } from './aiService';

export interface BreakSchedule {
  id: string;
  startTime: Date;
  duration: number; // in minutes
  type: 'scheduled' | 'smart' | 'calendar';
  title: string;
  description?: string;
  completed: boolean;
}

export interface UserPreferences {
  workSessionDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number; // number of work sessions before a long break
  enableSmartScheduling: boolean;
  enableCalendarIntegration: boolean;
  workingHours: {
    start: string; // '09:00'
    end: string;   // '17:00'
    weekdays: number[]; // [1,2,3,4,5] for Mon-Fri
  };
}

const DEFAULT_PREFERENCES: UserPreferences = {
  workSessionDuration: 50,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  enableSmartScheduling: true,
  enableCalendarIntegration: false,
  workingHours: {
    start: '09:00',
    end: '17:00',
    weekdays: [1, 2, 3, 4, 5], // Monday to Friday
  },
};

export class SmartScheduler {
  private preferences: UserPreferences;
  private breakHistory: BreakSchedule[] = [];
  private scheduledBreaks: BreakSchedule[] = [];
  private workSessionCount: number = 0;

  constructor(preferences?: Partial<UserPreferences>) {
    this.preferences = { ...DEFAULT_PREFERENCES, ...preferences };
    this.loadState();
  }

  private loadState() {
    // Load from localStorage
    const savedState = localStorage.getItem('smartSchedulerState');
    if (savedState) {
      const { breakHistory, workSessionCount } = JSON.parse(savedState);
      this.breakHistory = breakHistory.map((b: any) => ({
        ...b,
        startTime: new Date(b.startTime),
      }));
      this.workSessionCount = workSessionCount || 0;
    }
  }

  private saveState() {
    localStorage.setItem(
      'smartSchedulerState',
      JSON.stringify({
        breakHistory: this.breakHistory,
        workSessionCount: this.workSessionCount,
      })
    );
  }

  updatePreferences(preferences: Partial<UserPreferences>) {
    this.preferences = { ...this.preferences, ...preferences };
    this.scheduleBreaks();
    return this.preferences;
  }

  private scheduleBreaks() {
    if (!this.preferences.enableSmartScheduling) return [];

    const now = new Date();
    const scheduled: BreakSchedule[] = [];
    
    // Schedule next break based on work session count
    const isLongBreak = this.workSessionCount > 0 && 
                       this.workSessionCount % this.preferences.longBreakInterval === 0;
    
    const breakDuration = isLongBreak 
      ? this.preferences.longBreakDuration 
      : this.preferences.shortBreakDuration;

    const nextBreakTime = new Date(now.getTime() + this.preferences.workSessionDuration * 60000);

    scheduled.push({
      id: `break-${Date.now()}`,
      startTime: nextBreakTime,
      duration: breakDuration,
      type: 'scheduled',
      title: isLongBreak ? 'Long Break' : 'Short Break',
      description: isLongBreak 
        ? 'Time for a longer break to recharge!' 
        : 'Take a quick break to stay productive',
      completed: false,
    });

    this.scheduledBreaks = scheduled;
    return scheduled;
  }

  getUpcomingBreaks(limit: number = 3): BreakSchedule[] {
    const now = new Date();
    return [...this.scheduledBreaks]
      .filter(b => !b.completed && b.startTime > now)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .slice(0, limit);
  }

  completeWorkSession() {
    this.workSessionCount++;
    this.scheduleBreaks();
    this.saveState();
  }

  completeBreak(breakId: string) {
    const breakItem = this.scheduledBreaks.find(b => b.id === breakId);
    if (breakItem) {
      breakItem.completed = true;
      this.breakHistory.push(breakItem);
      this.scheduledBreaks = this.scheduledBreaks.filter(b => b.id !== breakId);
      this.saveState();
    }
  }

  // Analyze patterns to suggest optimal break times
  async analyzeOptimalBreakTimes() {
    // Use the existing session history to find patterns
    const response = await fetch('/api/sessions');
    if (!response.ok) return [];
    
    const sessions = await response.json();
    const patterns = analyzePatterns(sessions);
    
    // TODO: Implement more sophisticated analysis based on patterns
    // For now, just return the scheduled breaks
    return this.getUpcomingBreaks();
  }
}

// Singleton instance
export const smartScheduler = new SmartScheduler();
