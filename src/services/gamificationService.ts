import { v4 as uuidv4 } from 'uuid';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  isUnlocked: boolean;
  unlockDate?: string; // Stored as ISO string for JSON serialization
}

export interface UserStats {
  totalPoints: number;
  currentStreak: number;
  bestStreak: number;
  level: number;
  xp: number;
  achievements: Achievement[];
  lastActiveDate: string | null;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-break',
    name: 'First Break',
    description: 'Take your first break',
    icon: '🥇',
    points: 10,
    isUnlocked: false,
  },
  {
    id: 'streak-3',
    name: '3-Day Streak',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    points: 30,
    isUnlocked: false,
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🏆',
    points: 70,
    isUnlocked: false,
  },
  {
    id: 'mood-tracker',
    name: 'Mood Master',
    description: 'Log your mood for 5 days in a row',
    icon: '😊',
    points: 25,
    isUnlocked: false,
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Start a session before 8 AM',
    icon: '🌅',
    points: 15,
    isUnlocked: false,
  },
];

const XP_PER_LEVEL = 100;
const STORAGE_KEY = 'pausequest_gamification';

const calculateLevel = (xp: number): { level: number; currentXp: number; nextLevelXp: number } => {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const currentLevelXp = (level - 1) * XP_PER_LEVEL;
  const currentXp = xp - currentLevelXp;
  return {
    level,
    currentXp,
    nextLevelXp: XP_PER_LEVEL,
  };
};

const loadUserStats = (): UserStats => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  
  return {
    totalPoints: 0,
    currentStreak: 0,
    bestStreak: 0,
    level: 1,
    xp: 0,
    achievements: ACHIEVEMENTS,
    lastActiveDate: null,
  };
};

const saveUserStats = (stats: UserStats) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
};

const updateStreak = (stats: UserStats): UserStats => {
  const today = new Date().toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  // If already updated today, return current stats
  if (stats.lastActiveDate === today) {
    return stats;
  }
  
  const isConsecutiveDay = stats.lastActiveDate === yesterday.toDateString();
  
  return {
    ...stats,
    lastActiveDate: today,
    currentStreak: isConsecutiveDay ? stats.currentStreak + 1 : 1,
    bestStreak: Math.max(stats.bestStreak, isConsecutiveDay ? stats.currentStreak + 1 : 1),
  };
};

export const GamificationService = {
  getUserStats: (): UserStats => {
    return loadUserStats();
  },
  
  addXp: (amount: number, actionType: string): UserStats => {
    const stats = updateStreak(loadUserStats());
    const newXp = stats.xp + amount;
    const { level, currentXp, nextLevelXp } = calculateLevel(newXp);
    
    const updatedStats = {
      ...stats,
      xp: newXp,
      level,
      totalPoints: stats.totalPoints + amount,
    };
    
    saveUserStats(updatedStats);
    return updatedStats;
  },
  
  unlockAchievement: (achievementId: string): { stats: UserStats; achievement: Achievement | null } => {
    const stats = loadUserStats();
    const achievementIndex = stats.achievements.findIndex(a => a.id === achievementId);
    
    if (achievementIndex === -1 || stats.achievements[achievementIndex].isUnlocked) {
      return { stats, achievement: null };
    }
    
    const updatedAchievements = [...stats.achievements];
    const unlockedAchievement: Achievement = {
      ...updatedAchievements[achievementIndex],
      isUnlocked: true,
      unlockDate: new Date().toISOString(),
    };
    
    updatedAchievements[achievementIndex] = unlockedAchievement;
    
    const updatedStats = {
      ...stats,
      achievements: updatedAchievements,
      totalPoints: stats.totalPoints + unlockedAchievement.points,
    };
    
    saveUserStats(updatedStats);
    return { stats: updatedStats, achievement: unlockedAchievement };
  },
  
  checkForAchievements: (action: 'break' | 'mood' | 'session'): { stats: UserStats; unlocked: Achievement[] } => {
    const stats = loadUserStats();
    let unlocked: Achievement[] = [];
    let updatedStats = { ...stats };

    // Check for streak achievements
    if (action === 'session' && stats.currentStreak >= 7) {
      const result = GamificationService.unlockAchievement('7_day_streak');
      if (result.achievement) {
        unlocked.push(result.achievement);
        updatedStats = result.stats;
      }
    }

    // Check for mood tracking achievements
    if (action === 'mood') {
      const moodCount = stats.achievements
        .filter(a => a.id.startsWith('mood_') && a.isUnlocked)
        .length;
      
      if (moodCount >= 5) {
        const result = GamificationService.unlockAchievement('mood_tracker');
        if (result.achievement) {
          unlocked.push(result.achievement);
          updatedStats = result.stats;
        }
      }
    }

    // Check for break achievements
    if (action === 'break') {
      const breakCount = stats.achievements
        .filter(a => a.id.startsWith('break_') && a.isUnlocked)
        .length;
      
      if (breakCount >= 3) {
        const result = GamificationService.unlockAchievement('break_champion');
        if (result.achievement) {
          unlocked.push(result.achievement);
          updatedStats = result.stats;
        }
      }
    }

    return { stats: updatedStats, unlocked };
  },
  
  resetStats: (): UserStats => {
    const defaultStats: UserStats = {
      totalPoints: 0,
      currentStreak: 0,
      bestStreak: 0,
      level: 1,
      xp: 0,
      achievements: ACHIEVEMENTS,
      lastActiveDate: null,
    };
    
    saveUserStats(defaultStats);
    return defaultStats;
  },
};
