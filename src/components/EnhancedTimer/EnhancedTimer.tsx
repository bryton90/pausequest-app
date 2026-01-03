import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RocketLaunchAnimation, 
  CoffeeSteamAnimation, 
  CelebrationAnimation,
  ProgressRingAnimation,
  AchievementAnimation 
} from '../LottieAnimations/LottieAnimations';
import { advancedNotificationService } from '../../lib/services/advancedNotificationService.js';
import { enhancedAIService } from '../../services/enhancedAIService.js';
import { getInitialStats, saveStats, updateStatsAfterSession, UserStats } from '../../utils/gamification';
import { Session } from '../../api/breakService.js';

interface EnhancedTimerProps {
  initialTime?: number; // seconds
  onSessionComplete?: (session: Partial<Session>) => void;
  userId: string;
}

interface Achievement {
  title: string;
  description: string;
  icon: string;
}

const ACHIEVEMENTS: Record<string, Achievement> = {
  'first-session': {
    title: 'First Steps',
    description: 'Completed your first focus session!',
    icon: '🌟'
  },
  'streak-3': {
    title: 'On Fire!',
    description: '3 sessions in a row!',
    icon: '🔥'
  },
  'streak-7': {
    title: 'Week Warrior',
    description: '7 consecutive days of focus!',
    icon: '💪'
  },
  'focus-master': {
    title: 'Focus Master',
    description: 'Completed a 45-minute session!',
    icon: '🎯'
  },
  'early-bird': {
    title: 'Early Bird',
    description: 'Started a session before 9 AM!',
    icon: '🌅'
  }
};

export const EnhancedTimer: React.FC<EnhancedTimerProps> = ({
  initialTime = 25 * 60, // 25 minutes default
  onSessionComplete,
  userId
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [showAchievement, setShowAchievement] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);

  const totalTime = sessionType === 'focus' ? initialTime : 5 * 60; // 5 min breaks
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  // Load user stats
  useEffect(() => {
    const userStats = getInitialStats();
    setStats(userStats);
  }, [userId]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isPaused, timeLeft]);

  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    
    if (sessionType === 'focus') {
      setShowCelebration(true);
      checkAndAwardAchievements();
      
      // Send notification
      advancedNotificationService.sendSessionSummary({
        id: Date.now().toString(),
        user_id: parseInt(userId),
        date: new Date().toISOString().split('T')[0],
        focus_duration: totalTime,
        break_duration: 0,
        mood_emoji: '🎯',
        notes: '',
        timestamp: new Date().toISOString()
      } as unknown as Session);
      
      // Update stats using gamification utils
      if (stats) {
        const sessionDuration = Math.round(totalTime / 60); // Convert seconds to minutes
        const updatedStats = updateStatsAfterSession(stats, sessionDuration);
        setStats(updatedStats);
        saveStats(updatedStats);
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('sessionComplete', {
          detail: { stats: updatedStats }
        }));
      }
    }

    if (onSessionComplete) {
      onSessionComplete({
        focus_duration: sessionType === 'focus' ? totalTime : 0,
        break_duration: sessionType === 'break' ? totalTime : 0,
        session_type: sessionType,
        timestamp: new Date().toISOString()
      });
    }

    // Auto-switch to break after focus session
    if (sessionType === 'focus') {
      setTimeout(() => {
        setSessionType('break');
        setTimeLeft(5 * 60);
      }, 2000);
    }
  }, [sessionType, totalTime, stats, userId, onSessionComplete]);

  const checkAndAwardAchievements = () => {
    if (!stats) return;
    
    const newTotalSessions = stats.totalSessions + 1;
    const newStreak = stats.currentStreak + 1;
    const hour = new Date().getHours();

    // Check for achievements
    if (newTotalSessions === 1) {
      awardAchievement('first-session');
    }
    
    if (newStreak === 3) {
      awardAchievement('streak-3');
    }
    
    if (newStreak === 7) {
      awardAchievement('streak-7');
    }
    
    if (totalTime >= 45 * 60) {
      awardAchievement('focus-master');
    }
    
    if (hour < 9) {
      awardAchievement('early-bird');
    }
  };

  const awardAchievement = (achievementKey: string) => {
    const achievement = ACHIEVEMENTS[achievementKey];
    if (achievement) {
      setCurrentAchievement(achievement);
      setShowAchievement(true);
    }
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(totalTime);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      {/* Achievement Notification */}
      <AnimatePresence>
        {showAchievement && currentAchievement && (
          <AchievementAnimation
            achievement={currentAchievement}
            isVisible={showAchievement}
            onHide={() => setShowAchievement(false)}
          />
        )}
      </AnimatePresence>

      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <CelebrationAnimation
            trigger={showCelebration}
            onComplete={() => setShowCelebration(false)}
          />
        )}
      </AnimatePresence>

      {/* Timer Display */}
      <div className="relative">
        <ProgressRingAnimation
          progress={progress}
          size={200}
          strokeWidth={12}
          color={sessionType === 'focus' ? '#2E8B57' : '#98FB98'}
        />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-foreground mb-2">
            {formatTime(timeLeft)}
          </div>
          <div className="text-sm text-muted-foreground capitalize">
            {sessionType} Session
          </div>
        </div>

        {/* Animated Icon */}
        <div className="absolute -top-4 -right-4">
          {sessionType === 'focus' ? (
            <RocketLaunchAnimation
              isActive={isRunning && !isPaused}
              size={60}
            />
          ) : (
            <CoffeeSteamAnimation
              isActive={isRunning && !isPaused}
              intensity="medium"
              size={50}
            />
          )}
        </div>
      </div>

      {/* Session Info */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          {sessionType === 'focus' ? 'Focus Time' : 'Break Time'}
        </h2>
        <p className="text-muted-foreground">
          {sessionType === 'focus' 
            ? 'Stay focused and productive' 
            : 'Relax and recharge'}
        </p>
      </motion.div>

      {/* Control Buttons */}
      <div className="flex gap-4">
        {!isRunning ? (
          <motion.button
            onClick={handleStart}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start {sessionType}
          </motion.button>
        ) : (
          <>
            <motion.button
              onClick={handlePause}
              className="px-8 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </motion.button>
            <motion.button
              onClick={handleReset}
              className="px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Reset
            </motion.button>
          </>
        )}
      </div>

      {/* Quick Stats */}
      <motion.div
        className="flex gap-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div>
          <div className="text-2xl font-bold text-foreground">{stats?.totalSessions || 0}</div>
          <div className="text-sm text-muted-foreground">Total Sessions</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-foreground">{stats?.currentStreak || 0}</div>
          <div className="text-sm text-muted-foreground">Current Streak</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-foreground">{Math.round(progress)}%</div>
          <div className="text-sm text-muted-foreground">Progress</div>
        </div>
      </motion.div>
    </div>
  );
};

export default EnhancedTimer;
