import React from 'react';
import { useGamification } from '../contexts/GamificationContext';
import { TrophyIcon, SparklesIcon, BoltIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const GamificationStats: React.FC = () => {
  const { stats } = useGamification();
  const { level, currentXp, nextLevelXp } = calculateLevel(stats.xp);
  const xpPercentage = (currentXp / nextLevelXp) * 100;

  function calculateLevel(xp: number) {
    const XP_PER_LEVEL = 100;
    const level = Math.floor(xp / XP_PER_LEVEL) + 1;
    const currentLevelXp = (level - 1) * XP_PER_LEVEL;
    const currentXp = xp - currentLevelXp;
    return {
      level,
      currentXp,
      nextLevelXp: XP_PER_LEVEL,
    };
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <TrophyIcon className="h-5 w-5 text-yellow-500 mr-2" />
        Your Progress
      </h2>
      
      {/* Level and XP Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-gray-700 dark:text-gray-300">Level {level}</span>
          <span className="text-gray-600 dark:text-gray-400">
            {currentXp} / {nextLevelXp} XP
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2.5 rounded-full"
            style={{ width: `${xpPercentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPoints}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
            <SparklesIcon className="h-3 w-3 mr-1 text-yellow-400" />
            Points
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.currentStreak}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
            <BoltIcon className="h-3 w-3 mr-1 text-yellow-400" />
            Day Streak
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.achievements.filter(a => a.isUnlocked).length}/{stats.achievements.length}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
            <ChartBarIcon className="h-3 w-3 mr-1 text-yellow-400" />
            Achievements
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationStats;
