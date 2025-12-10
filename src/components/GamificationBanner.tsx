import React from 'react';
import { useGamification } from '../contexts/GamificationContext';

const GamificationBanner: React.FC = () => {
  const { stats } = useGamification();

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-center">
      <div className="text-lg font-semibold text-gray-900 dark:text-white">
        Streak: {stats.currentStreak}
      </div>
      <div className="text-lg font-semibold text-gray-900 dark:text-white">
        Points: {stats.totalPoints}
      </div>
    </div>
  );
};

export default GamificationBanner;
