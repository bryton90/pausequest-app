export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface UserStats {
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  totalFocusTime: number; // in minutes
  focusPoints: number;
  lastSessionDate?: string;
  achievements: Achievement[];
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-session',
    title: 'First Steps',
    description: 'Complete your first focus session',
    icon: '🎯',
    unlocked: false,
  },
  {
    id: 'streak-3',
    title: 'Getting Started',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    unlocked: false,
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '⚡',
    unlocked: false,
  },
  {
    id: 'streak-30',
    title: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: '👑',
    unlocked: false,
  },
  {
    id: 'sessions-10',
    title: 'Dedicated',
    description: 'Complete 10 focus sessions',
    icon: '💪',
    unlocked: false,
  },
  {
    id: 'sessions-50',
    title: 'Committed',
    description: 'Complete 50 focus sessions',
    icon: '🌟',
    unlocked: false,
  },
  {
    id: 'sessions-100',
    title: 'Centurion',
    description: 'Complete 100 focus sessions',
    icon: '🏆',
    unlocked: false,
  },
  {
    id: 'focus-time-10',
    title: 'Time Keeper',
    description: 'Accumulate 10 hours of focus time',
    icon: '⏰',
    unlocked: false,
  },
];

export const getInitialStats = (): UserStats => {
  const stored = localStorage.getItem('pausequest-stats');
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    totalSessions: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalFocusTime: 0,
    focusPoints: 0,
    achievements: ACHIEVEMENTS,
  };
};

export const saveStats = (stats: UserStats): void => {
  localStorage.setItem('pausequest-stats', JSON.stringify(stats));
};

export const updateStatsAfterSession = (stats: UserStats, sessionDuration: number): UserStats => {
  const today = new Date().toDateString();
  const lastSession = stats.lastSessionDate ? new Date(stats.lastSessionDate).toDateString() : null;
  
  // Update basic stats
  const newStats: UserStats = {
    ...stats,
    totalSessions: stats.totalSessions + 1,
    totalFocusTime: stats.totalFocusTime + sessionDuration,
    focusPoints: stats.focusPoints + 10, // 10 points per session
    lastSessionDate: today,
  };

  // Update streak
  if (lastSession === today) {
    // Same day, no streak change
    newStats.currentStreak = stats.currentStreak;
  } else if (lastSession === new Date(Date.now() - 86400000).toDateString()) {
    // Yesterday, increment streak
    newStats.currentStreak = stats.currentStreak + 1;
  } else {
    // Streak broken, reset to 1
    newStats.currentStreak = 1;
  }

  // Update longest streak
  if (newStats.currentStreak > stats.longestStreak) {
    newStats.longestStreak = newStats.currentStreak;
  }

  // Check and unlock achievements
  newStats.achievements = checkAchievements(newStats);

  return newStats;
};

const checkAchievements = (stats: UserStats): Achievement[] => {
  return stats.achievements.map(achievement => {
    if (achievement.unlocked) return achievement;

    let shouldUnlock = false;

    switch (achievement.id) {
      case 'first-session':
        shouldUnlock = stats.totalSessions >= 1;
        break;
      case 'streak-3':
        shouldUnlock = stats.currentStreak >= 3;
        break;
      case 'streak-7':
        shouldUnlock = stats.currentStreak >= 7;
        break;
      case 'streak-30':
        shouldUnlock = stats.currentStreak >= 30;
        break;
      case 'sessions-10':
        shouldUnlock = stats.totalSessions >= 10;
        break;
      case 'sessions-50':
        shouldUnlock = stats.totalSessions >= 50;
        break;
      case 'sessions-100':
        shouldUnlock = stats.totalSessions >= 100;
        break;
      case 'focus-time-10':
        shouldUnlock = stats.totalFocusTime >= 600; // 10 hours in minutes
        break;
    }

    if (shouldUnlock) {
      return {
        ...achievement,
        unlocked: true,
        unlockedAt: new Date(),
      };
    }

    return achievement;
  });
};

export const getUnlockedAchievements = (stats: UserStats): Achievement[] => {
  return stats.achievements.filter(a => a.unlocked);
};

export const getLockedAchievements = (stats: UserStats): Achievement[] => {
  return stats.achievements.filter(a => !a.unlocked);
};
