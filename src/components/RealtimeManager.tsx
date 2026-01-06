import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getCurrentUserAuth } from '../lib/services/authService';
import { UserStats, Achievement } from '../utils/gamification';

interface RealtimeManagerProps {
  onStatsUpdate?: (stats: UserStats) => void;
  onAchievementUnlock?: (achievement: Achievement) => void;
  onSessionUpdate?: (session: any) => void;
  children?: React.ReactNode;
}

export const RealtimeManager: React.FC<RealtimeManagerProps> = ({
  onStatsUpdate,
  onAchievementUnlock,
  onSessionUpdate,
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  // Initialize real-time connections
  useEffect(() => {
    const initializeRealtime = async () => {
      try {
        const user = await getCurrentUserAuth();
        if (!user) {
          console.log('Realtime: User not authenticated, skipping subscriptions');
          return;
        }

        setUserId(user.id);
        setIsConnected(true);

        // Subscribe to user stats changes
        const statsSubscription = supabase
          .channel('user-stats-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'user_stats',
              filter: `user_id=eq.${user.id}`,
            },
            async (payload) => {
              console.log('Realtime: Stats updated', payload);
              
              if (onStatsUpdate) {
                // Fetch updated stats
                try {
                  const { data: { session } } = await supabase.auth.getSession();
                  if (session) {
                    const response = await fetch('/api/user/stats', {
                      headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                      },
                    });
                    
                    if (response.ok) {
                      const data = await response.json();
                      
                      // Transform to UserStats format
                      const achievements: Achievement[] = data.achievements.map((ach: any) => ({
                        id: ach.achievement_id,
                        title: ach.title,
                        description: ach.description,
                        icon: ach.icon,
                        unlocked: true,
                        unlockedAt: new Date(ach.unlocked_at),
                        points: ach.points,
                      }));

                      const userStats: UserStats = {
                        total_sessions: data.stats.total_sessions,
                        current_streak: data.stats.current_streak,
                        longest_streak: data.stats.longest_streak,
                        total_focus_time: data.stats.total_focus_time,
                        focus_points: data.stats.focus_points,
                        last_session_date: data.stats.last_session_date,
                        achievements,
                      };
                      
                      onStatsUpdate(userStats);
                    }
                  }
                } catch (error) {
                  console.error('Realtime: Failed to fetch updated stats', error);
                }
              }
            }
          )
          .subscribe((status) => {
            console.log('Realtime: Stats subscription status', status);
          });

        // Subscribe to achievement unlocks
        const achievementSubscription = supabase
          .channel('achievement-unlocks')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'user_achievements',
              filter: `user_id=eq.${user.id}`,
            },
            async (payload) => {
              console.log('Realtime: Achievement unlocked', payload);
              
              if (onAchievementUnlock) {
                try {
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
                    
                    onAchievementUnlock(achievementData);
                  }
                } catch (error) {
                  console.error('Realtime: Failed to fetch achievement details', error);
                }
              }
            }
          )
          .subscribe((status) => {
            console.log('Realtime: Achievement subscription status', status);
          });

        // Subscribe to session changes
        const sessionSubscription = supabase
          .channel('session-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'pomodoro_sessions',
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              console.log('Realtime: Session updated', payload);
              
              if (onSessionUpdate) {
                onSessionUpdate(payload);
              }
            }
          )
          .subscribe((status) => {
            console.log('Realtime: Session subscription status', status);
          });

        // Store subscriptions for cleanup
        setSubscriptions([statsSubscription, achievementSubscription, sessionSubscription]);

      } catch (error) {
        console.error('Realtime: Failed to initialize', error);
        setIsConnected(false);
      }
    };

    initializeRealtime();

    // Cleanup function
    return () => {
      cleanupSubscriptions();
    };
  }, [onStatsUpdate, onAchievementUnlock, onSessionUpdate]);

  // Cleanup subscriptions
  const cleanupSubscriptions = useCallback(() => {
    subscriptions.forEach(subscription => {
      if (subscription && subscription.unsubscribe) {
        supabase.removeChannel(subscription);
      }
    });
    setSubscriptions([]);
    setIsConnected(false);
  }, [subscriptions]);

  // Handle connection status changes
  useEffect(() => {
    // Listen to Supabase auth changes to reinitialize subscriptions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('Realtime: Auth state changed', _event);
        
        if (_event === 'SIGNED_IN' && session?.user) {
          setUserId(session.user.id);
          // Re-initialize subscriptions for new user
        } else if (_event === 'SIGNED_OUT') {
          cleanupSubscriptions();
          setUserId(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      cleanupSubscriptions();
    };
  }, [cleanupSubscriptions]);

  return (
    <>
      {children}
      {/* Connection status indicator (for development) */}
      {process.env['NODE_ENV'] === 'development' && (
        <div
          style={{
            position: 'fixed',
            bottom: 10,
            right: 10,
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            backgroundColor: isConnected ? '#10b981' : '#ef4444',
            color: 'white',
            zIndex: 9999,
          }}
        >
          {isConnected ? '🟢 Realtime Connected' : '🔴 Realtime Disconnected'}
          {userId && ` (${userId.slice(0, 8)}...)`}
        </div>
      )}
    </>
  );
};

// Hook for using real-time features
export const useRealtime = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      const user = await getCurrentUserAuth();
      setUserId(user?.id || null);
      setIsConnected(!!user);
    };

    checkConnection();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUserId(session?.user?.id || null);
        setIsConnected(!!session?.user);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    isConnected,
    userId,
  };
};

export default RealtimeManager;
