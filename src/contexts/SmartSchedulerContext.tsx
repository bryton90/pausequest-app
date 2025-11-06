import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { smartScheduler, BreakSchedule, UserPreferences } from '../services/smartScheduler';

export interface SmartSchedulerContextType {
  upcomingBreaks: BreakSchedule[];
  preferences: UserPreferences;
  isBreakTime: boolean;
  currentBreak: BreakSchedule | null;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  completeWorkSession: () => void;
  startBreak: (breakId: string) => void;
  completeBreak: () => void;
  skipBreak: (breakId: string) => void;
}

const SmartSchedulerContext = createContext<SmartSchedulerContextType | undefined>(undefined);

export const SmartSchedulerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [upcomingBreaks, setUpcomingBreaks] = useState<BreakSchedule[]>([]);
  const [preferences, setPreferences] = useState(smartScheduler.updatePreferences({}));
  const [currentBreak, setCurrentBreak] = useState<BreakSchedule | null>(null);
  const [isBreakTime, setIsBreakTime] = useState(false);

  const updateUpcomingBreaks = useCallback(() => {
    setUpcomingBreaks(smartScheduler.getUpcomingBreaks());
  }, []);

  const handleCompleteWorkSession = useCallback(() => {
    smartScheduler.completeWorkSession();
    updateUpcomingBreaks();
  }, [updateUpcomingBreaks]);

  const handleStartBreak = useCallback((breakId: string) => {
    const breakItem = upcomingBreaks.find(b => b.id === breakId);
    if (breakItem) {
      setCurrentBreak(breakItem);
      setIsBreakTime(true);
      // Start break timer logic can be added here
    }
  }, [upcomingBreaks]);

  const handleCompleteBreak = useCallback(() => {
    if (currentBreak) {
      smartScheduler.completeBreak(currentBreak.id);
      setCurrentBreak(null);
      setIsBreakTime(false);
      updateUpcomingBreaks();
    }
  }, [currentBreak, updateUpcomingBreaks]);

  const handleSkipBreak = useCallback((breakId: string) => {
    smartScheduler.completeBreak(breakId);
    updateUpcomingBreaks();
  }, [updateUpcomingBreaks]);

  const handleUpdatePreferences = useCallback((prefs: Partial<UserPreferences>) => {
    const updated = smartScheduler.updatePreferences(prefs);
    setPreferences(updated);
    updateUpcomingBreaks();
    return updated;
  }, [updateUpcomingBreaks]);

  // Initial load
  useEffect(() => {
    updateUpcomingBreaks();
    
    // Check for upcoming breaks periodically
    const interval = setInterval(updateUpcomingBreaks, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [updateUpcomingBreaks]);

  return (
    <SmartSchedulerContext.Provider
      value={{
        upcomingBreaks,
        preferences,
        isBreakTime,
        currentBreak,
        updatePreferences: handleUpdatePreferences,
        completeWorkSession: handleCompleteWorkSession,
        startBreak: handleStartBreak,
        completeBreak: handleCompleteBreak,
        skipBreak: handleSkipBreak,
      }}
    >
      {children}
    </SmartSchedulerContext.Provider>
  );
};

export const useSmartScheduler = (): SmartSchedulerContextType => {
  const context = useContext(SmartSchedulerContext);
  if (!context) {
    throw new Error('useSmartScheduler must be used within a SmartSchedulerProvider');
  }
  return context;
};
