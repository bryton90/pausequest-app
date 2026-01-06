import React, { useState, useEffect } from 'react';
import AppRouter from './AppRouter';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { GamificationProvider } from './contexts/GamificationContext';
import { SmartSchedulerProvider } from './contexts/SmartSchedulerContext';
import { RealtimeManager } from './components/RealtimeManager';
import { checkAndPromptMigration } from './utils/migration';
import { onAuthStateChange, User } from './lib/services/authService';
import { UserStats, Achievement } from './utils/gamification';

const App: React.FC = () => {
  const [_user, setUser] = useState<User | null>(null);
  const [_userStats, setUserStats] = useState<UserStats | null>(null);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);

  // Initialize authentication and check for migration
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Set up auth state listener
        const { data: { subscription } } = onAuthStateChange((authUser) => {
          setUser(authUser);
          
          // Check for data migration when user logs in
          if (authUser) {
            checkAndPromptMigration();
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Failed to initialize app:', error);
        return undefined;
      }
    };

    const cleanup = initializeApp();
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, []);

  // Handle real-time stats updates
  const handleStatsUpdate = (updatedStats: UserStats) => {
    console.log('Stats updated in real-time:', updatedStats);
    setUserStats(updatedStats);
  };

  // Handle achievement unlocks
  const handleAchievementUnlock = (achievement: Achievement) => {
    console.log('Achievement unlocked:', achievement);
    setShowAchievement(achievement);
    
    // Auto-hide achievement notification after 5 seconds
    setTimeout(() => {
      setShowAchievement(null);
    }, 5000);
  };

  // Handle session updates
  const handleSessionUpdate = (sessionData: any) => {
    console.log('Session updated:', sessionData);
    // You can add custom logic here for session updates
    if (sessionData.eventType === 'UPDATE' && sessionData.new.was_successful) {
      console.log('Session completed successfully!');
    }
  };

  return (
    <RealtimeManager
      onStatsUpdate={handleStatsUpdate}
      onAchievementUnlock={handleAchievementUnlock}
      onSessionUpdate={handleSessionUpdate}
    >
      <AuthProvider>
        <SettingsProvider>
          <GamificationProvider>
            <SmartSchedulerProvider>
              {/* Achievement Notification */}
              {showAchievement && (
                <div
                  className="fixed top-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-lg shadow-lg z-50 max-w-sm animate-pulse"
                  style={{
                    animation: 'slideIn 0.3s ease-out',
                  }}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{showAchievement.icon}</span>
                    <div>
                      <h4 className="font-bold text-yellow-800">Achievement Unlocked!</h4>
                      <p className="text-yellow-700">{showAchievement.title}</p>
                      <p className="text-sm text-yellow-600">{showAchievement.description}</p>
                      {showAchievement.points && (
                        <p className="text-sm text-yellow-600 font-semibold">+{showAchievement.points} points</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <AppRouter />
              
              {/* Custom styles for animations */}
              <style>{`
                @keyframes slideIn {
                  from {
                    transform: translateX(100%);
                    opacity: 0;
                  }
                  to {
                    transform: translateX(0);
                    opacity: 1;
                  }
                }
              `}</style>
            </SmartSchedulerProvider>
          </GamificationProvider>
        </SettingsProvider>
      </AuthProvider>
    </RealtimeManager>
  );
};

export default App;
