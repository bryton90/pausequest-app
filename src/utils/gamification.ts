import { supabase } from '../lib/supabase';
import { getCurrentUserAuth } from '../lib/services/authService';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  points?: number;
}

export interface UserStats {
  total_sessions: number;
  current_streak: number;
  longest_streak: number;
  total_focus_time: number; // in minutes
  focus_points: number;
  last_session_date?: string;
  achievements: Achievement[];
}

// Default achievements (will be overridden by database data)
export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
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

/**
 * Get user stats from API
 */
export const getInitialStats = async (): Promise<UserStats> => {
  try {
    const user = await getCurrentUserAuth();
    if (!user) {
      // Return default stats for unauthenticated users
      return {
        total_sessions: 0,
        current_streak: 0,
        longest_streak: 0,
        total_focus_time: 0,
        focus_points: 0,
        achievements: DEFAULT_ACHIEVEMENTS,
      };
    }

    // Get session for authorization
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    // Fetch stats from API
    const response = await fetch('/api/user/stats', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }

    const data = await response.json();
    
    // Transform API response to match our interface
    const achievements: Achievement[] = data.achievements.map((ach: any) => ({
      id: ach.achievement_id,
      title: ach.title,
      description: ach.description,
      icon: ach.icon,
      unlocked: true,
      unlockedAt: new Date(ach.unlocked_at),
      points: ach.points,
    }));

    // Add locked achievements
    const unlockedIds = new Set(achievements.map(a => a.id));
    const lockedAchievements = DEFAULT_ACHIEVEMENTS.filter(ach => !unlockedIds.has(ach.id));

    return {
      total_sessions: data.stats.total_sessions,
      current_streak: data.stats.current_streak,
      longest_streak: data.stats.longest_streak,
      total_focus_time: data.stats.total_focus_time,
      focus_points: data.stats.focus_points,
      last_session_date: data.stats.last_session_date,
      achievements: [...achievements, ...lockedAchievements],
    };
  } catch (error) {
    console.error('Failed to fetch user stats:', error);
    // Return default stats on error
    return {
      total_sessions: 0,
      current_streak: 0,
      longest_streak: 0,
      total_focus_time: 0,
      focus_points: 0,
      achievements: DEFAULT_ACHIEVEMENTS,
    };
  }
};

/**
 * Save stats is no longer needed as stats are updated automatically via API
 * @deprecated Stats are now updated automatically when sessions are created
 */
export const saveStats = async (_stats: UserStats): Promise<void> => {
  console.warn('saveStats is deprecated. Stats are now updated automatically via API.');
};

/**
 * Update stats after a session completion
 * This is now handled automatically by the API when creating/updating sessions
 * @deprecated Use the session API endpoints instead
 */
export const updateStatsAfterSession = async (_stats: UserStats, _sessionDuration: number): Promise<UserStats> => {
  console.warn('updateStatsAfterSession is deprecated. Use the session API endpoints instead.');
  return _stats;
};

/**
 * Get unlocked achievements
 */
export const getUnlockedAchievements = (stats: UserStats): Achievement[] => {
  return stats.achievements.filter(a => a.unlocked);
};

/**
 * Get locked achievements
 */
export const getLockedAchievements = (stats: UserStats): Achievement[] => {
  return stats.achievements.filter(a => !a.unlocked);
};

/**
 * Subscribe to real-time stats updates
 */
export const subscribeToStatsUpdates = (userId: string, callback: (stats: UserStats) => void) => {
  return supabase
    .channel('stats-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_stats',
        filter: `user_id=eq.${userId}`,
      },
      async (_payload) => {
        // Fetch updated stats when changes occur
        const updatedStats = await getInitialStats();
        callback(updatedStats);
      }
    )
    .subscribe();
};

/**
 * Subscribe to achievement unlocks
 */
export const subscribeToAchievementUpdates = (userId: string, callback: (achievement: Achievement) => void) => {
  return supabase
    .channel('achievement-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'user_achievements',
        filter: `user_id=eq.${userId}`,
      },
      async (payload) => {
        // Fetch achievement details
        const { data: achievement } = await supabase
          .from('achievements')
          .select('*')
          .eq('id', payload.new['achievement_id'])
          .single();

        if (achievement) {
          const achievementData: Achievement = {
            id: achievement.id,
            title: achievement.title,
            description: achievement.description,
            icon: achievement.icon,
            unlocked: true,
            unlockedAt: new Date(payload.new['unlocked_at']),
            points: achievement.points,
          };
          callback(achievementData);
        }
      }
    )
    .subscribe();
};

/**
 * Calculate productivity score based on recent sessions
 */
export const calculateProductivityScore = async (_userId: string): Promise<number> => {
  try {
    // Get recent sessions from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return 0;

    const response = await fetch(`/api/sessions?start_date=${sevenDaysAgo.toISOString()}&limit=100`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) return 0;

    const data = await response.json();
    const sessions = data.sessions || [];

    if (sessions.length === 0) return 0;

    // Calculate score based on completion rate and consistency
    const workSessions = sessions.filter((s: any) => s.type === 'work');
    const completedSessions = workSessions.filter((s: any) => s.was_successful);
    
    const completionRate = completedSessions.length / workSessions.length;
    const consistencyBonus = Math.min(workSessions.length / 7, 1); // Bonus for daily sessions
    
    return Math.round((completionRate * 70) + (consistencyBonus * 30));
  } catch (error) {
    console.error('Failed to calculate productivity score:', error);
    return 0;
  }
};

/**
 * Get wellness insights for the user
 */
export const getWellnessInsights = async (limit: number = 10): Promise<any[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    const response = await fetch(`/api/wellness/insights?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.insights || [];
  } catch (error) {
    console.error('Failed to fetch wellness insights:', error);
    return [];
  }
};

/**
 * Mark wellness insights as read
 */
export const markInsightsAsRead = async (insightIds: string[]): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Update each insight as read
    for (const id of insightIds) {
      await supabase
        .from('wellness_insights')
        .update({ is_read: true })
        .eq('id', id);
    }
  } catch (error) {
    console.error('Failed to mark insights as read:', error);
  }
};
