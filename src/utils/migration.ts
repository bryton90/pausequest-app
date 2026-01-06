import { supabase } from '../lib/supabase';
import { getCurrentUserAuth } from '../lib/services/authService';

export interface LegacyUserStats {
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  totalFocusTime: number;
  focusPoints: number;
  lastSessionDate?: string;
  achievements: any[];
}

export interface LegacySession {
  id: string;
  type: 'work' | 'break' | 'long_break';
  planned_duration: number;
  actual_duration?: number;
  started_at: string;
  completed_at?: string;
  was_successful?: boolean;
  notes?: string;
  mood_rating?: number;
  energy_level?: number;
  distractions_count?: number;
}

export interface LegacyUser {
  id: string;
  email: string;
  token?: string;
  preferences?: {
    workDuration?: number;
    breakDuration?: number;
  };
}

/**
 * Check if migration is needed for the current user
 */
export const isMigrationNeeded = async (): Promise<boolean> => {
  try {
    // Check if user has localStorage data
    const hasLegacyStats = localStorage.getItem('pausequest-stats') !== null;
    const hasLegacyUser = localStorage.getItem('user') !== null;
    const hasLegacySessions = localStorage.getItem('pomodoro-sessions') !== null;

    if (!hasLegacyStats && !hasLegacyUser && !hasLegacySessions) {
      return false;
    }

    // Check if user is authenticated
    const user = await getCurrentUserAuth();
    if (!user) {
      return false;
    }

    // Check if migration has already been completed
    const migrationFlag = localStorage.getItem('pausequest-migration-completed');
    if (migrationFlag === user.id) {
      return false;
    }

    // Check if user already has data in Supabase
    const { data: stats } = await supabase
      .from('user_stats')
      .select('total_sessions')
      .eq('user_id', user.id)
      .single();

    // If user has stats in Supabase and no localStorage data, no migration needed
    if (!hasLegacyStats && stats) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
};

/**
 * Migrate localStorage data to Supabase
 */
export const migrateLocalStorageToSupabase = async (): Promise<{ 
  success: boolean; 
  error?: string; 
  migrated?: any; 
  message?: string;
}> => {
  try {
    const user = await getCurrentUserAuth();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const migratedData: any = {
      stats: false,
      sessions: false,
      preferences: false,
    };

    // Get session for API calls
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: 'No active session' };
    }

    // Migrate user stats
    const legacyStatsStr = localStorage.getItem('pausequest-stats');
    if (legacyStatsStr) {
      try {
        const legacyStats: LegacyUserStats = JSON.parse(legacyStatsStr);
        
        // Transform to new format
        const newStats = {
          user_id: user.id,
          total_sessions: legacyStats.totalSessions || 0,
          current_streak: legacyStats.currentStreak || 0,
          longest_streak: legacyStats.longestStreak || 0,
          total_focus_time: legacyStats.totalFocusTime || 0,
          focus_points: legacyStats.focusPoints || 0,
          last_session_date: legacyStats.lastSessionDate || null,
        };

        // Insert or update stats
        const { error: statsError } = await supabase
          .from('user_stats')
          .upsert(newStats);

        if (statsError) {
          console.error('Stats migration error:', statsError);
        } else {
          migratedData.stats = true;
          console.log('Migrated user stats:', newStats);
        }

        // Migrate achievements
        if (legacyStats.achievements && Array.isArray(legacyStats.achievements)) {
          for (const achievement of legacyStats.achievements) {
            if (achievement.unlocked) {
              // Find corresponding achievement in database
              const { data: dbAchievement } = await supabase
                .from('achievements')
                .select('id')
                .eq('title', achievement.title)
                .single();

              if (dbAchievement) {
                const { error: achError } = await supabase
                  .from('user_achievements')
                  .upsert({
                    user_id: user.id,
                    achievement_id: dbAchievement.id,
                    unlocked_at: achievement.unlockedAt || new Date().toISOString(),
                  });

                if (!achError) {
                  console.log('Migrated achievement:', achievement.title);
                }
              }
            }
          }
        }
      } catch (parseError) {
        console.error('Error parsing legacy stats:', parseError);
      }
    }

    // Migrate sessions
    const legacySessionsStr = localStorage.getItem('pomodoro-sessions');
    if (legacySessionsStr) {
      try {
        const legacySessions: LegacySession[] = JSON.parse(legacySessionsStr);
        
        for (const session of legacySessions) {
          const newSession = {
            user_id: user.id,
            type: session.type,
            planned_duration: session.planned_duration,
            actual_duration: session.actual_duration || null,
            started_at: session.started_at,
            completed_at: session.completed_at || null,
            was_successful: session.was_successful || false,
            notes: session.notes || null,
            mood_rating: session.mood_rating || null,
            energy_level: session.energy_level || null,
            distractions_count: session.distractions_count || 0,
          };

          const { error: sessionError } = await supabase
            .from('pomodoro_sessions')
            .insert(newSession);

          if (sessionError) {
            console.error('Session migration error:', sessionError);
          } else {
            migratedData.sessions = true;
          }
        }
        
        if (migratedData.sessions) {
          console.log(`Migrated ${legacySessions.length} sessions`);
        }
      } catch (parseError) {
        console.error('Error parsing legacy sessions:', parseError);
      }
    }

    // Migrate user preferences
    const legacyUserStr = localStorage.getItem('user');
    if (legacyUserStr) {
      try {
        const legacyUser: LegacyUser = JSON.parse(legacyUserStr);
        
        if (legacyUser.preferences) {
          const newPreferences = {
            user_id: user.id,
            work_duration: legacyUser.preferences.workDuration || 25,
            break_duration: legacyUser.preferences.breakDuration || 5,
            long_break_duration: 15,
            sessions_until_long_break: 4,
            auto_start_breaks: false,
            auto_start_work: false,
            sound_enabled: true,
            notification_enabled: true,
            theme: 'light',
          };

          const { error: prefError } = await supabase
            .from('user_preferences')
            .upsert(newPreferences);

          if (prefError) {
            console.error('Preferences migration error:', prefError);
          } else {
            migratedData.preferences = true;
            console.log('Migrated user preferences:', newPreferences);
          }
        }
      } catch (parseError) {
        console.error('Error parsing legacy user:', parseError);
      }
    }

    // Mark migration as completed
    localStorage.setItem('pausequest-migration-completed', user.id);

    // Clear localStorage data (optional, can be commented out for safety)
    // localStorage.removeItem('pausequest-stats');
    // localStorage.removeItem('pomodoro-sessions');
    // localStorage.removeItem('user');

    const hasMigratedData = Object.values(migratedData).some(Boolean);
    
    return { 
      success: true, 
      migrated: migratedData,
      message: hasMigratedData ? 'Migration completed successfully' : 'No data to migrate'
    };

  } catch (error) {
    console.error('Migration error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown migration error' 
    };
  }
};

/**
 * Clear localStorage data after successful migration
 */
export const clearLegacyData = (): void => {
  const itemsToRemove = [
    'pausequest-stats',
    'pomodoro-sessions',
    'user',
  ];

  itemsToRemove.forEach(item => {
    try {
      localStorage.removeItem(item);
      console.log(`Cleared legacy data: ${item}`);
    } catch (error) {
      console.error(`Error clearing ${item}:`, error);
    }
  });
};

/**
 * Get migration status and prompt user if needed
 */
export const checkAndPromptMigration = async (): Promise<void> => {
  const needsMigration = await isMigrationNeeded();
  
  if (needsMigration) {
    const shouldMigrate = window.confirm(
      'We found some local data that needs to be migrated to our new cloud storage. ' +
      'Would you like to migrate your data now? ' +
      'This will transfer your stats, sessions, and preferences to the cloud.'
    );

    if (shouldMigrate) {
      const result = await migrateLocalStorageToSupabase();
      
      if (result.success) {
        const migratedCount = Object.values(result.migrated || {}).filter(Boolean).length;
        alert(
          `Migration completed successfully! ` +
          `${migratedCount > 0 ? `Migrated ${migratedCount} data types.` : 'No data needed migration.'}` +
          '\n\nYour data is now safely stored in the cloud and will sync across devices.'
        );
        
        // Optionally clear legacy data
        const shouldClear = window.confirm(
          'Would you like to clear the old local data to free up space?'
        );
        
        if (shouldClear) {
          clearLegacyData();
        }
      } else {
        alert(
          `Migration failed: ${result.error}\n\n` +
          'Please try again or contact support if the issue persists.'
        );
      }
    }
  }
};
