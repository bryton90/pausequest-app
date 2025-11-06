import React from 'react';
import { useSmartScheduler } from '../contexts/SmartSchedulerContext';
import { ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const UpcomingBreaks: React.FC = () => {
  const { upcomingBreaks, startBreak, skipBreak } = useSmartScheduler();

  if (upcomingBreaks.length === 0) {
    return null;
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
        <ClockIcon className="h-5 w-5 mr-2 text-blue-500" />
        Upcoming Breaks
      </h3>
      
      <div className="space-y-3">
        {upcomingBreaks.map((breakItem) => (
          <div 
            key={breakItem.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {breakItem.title}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                {formatTime(breakItem.startTime)} • {breakItem.duration} min
              </p>
              {breakItem.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {breakItem.description}
                </p>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => startBreak(breakItem.id)}
                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full"
                title="Start break now"
              >
                <CheckCircleIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => skipBreak(breakItem.id)}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                title="Skip break"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingBreaks;
