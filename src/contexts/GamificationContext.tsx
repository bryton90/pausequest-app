import React, { createContext, useContext, useEffect, useState } from 'react';
import { GamificationService, UserStats, Achievement } from '../services/gamificationService';

interface GamificationContextType {
  stats: UserStats;
  addXp: (amount: number, actionType: string) => void;
  unlockAchievement: (achievementId: string) => { stats: UserStats; achievement: Achievement | null };
  checkForAchievements: (action: 'break' | 'mood' | 'session') => { stats: UserStats; unlocked: Achievement[] };
  resetStats: () => void;
  showNotification: (achievement: Achievement) => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<UserStats>(GamificationService.getUserStats());
  const [notification, setNotification] = useState<Achievement | null>(null);

  // Load initial stats
  useEffect(() => {
    const savedStats = GamificationService.getUserStats();
    setStats(savedStats);
  }, []);

  const addXp = (amount: number, actionType: string) => {
    const updatedStats = GamificationService.addXp(amount, actionType);
    setStats(updatedStats);
    return updatedStats;
  };

  const unlockAchievement = (achievementId: string) => {
    const { stats: updatedStats, achievement } = GamificationService.unlockAchievement(achievementId);
    setStats(updatedStats);
    if (achievement) {
      showNotification(achievement);
    }
    return { stats: updatedStats, achievement };
  };

  const checkForAchievements = (action: 'break' | 'mood' | 'session') => {
    const { stats: updatedStats, unlocked } = GamificationService.checkForAchievements(action);
    setStats(updatedStats);
    
    // Show notification for each unlocked achievement
    unlocked.forEach(achievement => {
      showNotification(achievement);
    });
    
    return { stats: updatedStats, unlocked };
  };

  const resetStats = () => {
    const defaultStats = GamificationService.resetStats();
    setStats(defaultStats);
    return defaultStats;
  };

  const showNotification = (achievement: Achievement) => {
    setNotification(achievement);
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  return (
    <GamificationContext.Provider
      value={{
        stats,
        addXp,
        unlockAchievement,
        checkForAchievements,
        resetStats,
        showNotification,
      }}
    >
      {children}
      {/* Achievement Notification */}
      {notification && (
        <div className="fixed bottom-4 right-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4 border-yellow-400 z-50 max-w-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0 text-3xl">{notification.icon}</div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Achievement Unlocked!
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                <span className="font-semibold">{notification.name}</span> - {notification.description}
              </p>
              <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                +{notification.points} XP
              </p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </GamificationContext.Provider>
  );
};

export const useGamification = (): GamificationContextType => {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};
