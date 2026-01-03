import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import RocketAnimation from '../RocketAnimation/RocketAnimation';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { withErrorBoundary } from '../common/ErrorBoundary';

// Add error boundary wrapper to RocketAnimation
const RocketAnimationWithBoundary = withErrorBoundary(RocketAnimation);

interface TimerProps {
  timeLeft: number;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  totalTime: number;
  animationType: 'battery' | 'rocket' | 'both';
  notes?: string;
  onNotesChange?: (notes: string) => void;
}

const CIRCLE_COLORS = {
  focus: '#2E8B57', // Jungle Green
  elapsed: '#E0F6E0', // Pale Pistachio
  break: '#98FB98', // Dusty Mint
};

const TimerComponent: React.FC<TimerProps> = ({
  timeLeft,
  isRunning,
  onStart,
  onStop,
  onReset,
  totalTime,
  animationType,
  notes = '',
  onNotesChange,
}) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercentage = (timeLeft / totalTime) * 100;
  const elapsed = totalTime - timeLeft;

  // Handle animation when timer reaches zero or is reset
  useEffect(() => {
    try {
      if (timeLeft === 0) {
        setShowAnimation(true);
      } else if (timeLeft === totalTime) {
        setShowAnimation(false);
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('Error in timer effect:', error);
      throw error; // This will be caught by the error boundary
    }
  }, [timeLeft, totalTime]);

  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Data for circular progress (dual ring visualization would be too complex, using single ring)
  const chartData = [
    { name: 'elapsed', value: elapsed, color: CIRCLE_COLORS.elapsed },
    { name: 'remaining', value: timeLeft, color: CIRCLE_COLORS.focus },
  ];

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Animation or Timer Display */}
      {showAnimation ? (
        <div className="w-64 h-64 flex items-center justify-center">
          {animationType === 'rocket' || animationType === 'both' ? (
            <RocketAnimationWithBoundary 
              percentage={progressPercentage} 
              isRunning={isRunning} 
            />
          ) : (
            <div className="text-2xl text-center">Great job! 🎉</div>
          )}
        </div>
      ) : (
        <div className="relative w-64 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                startAngle={-90}
                endAngle={-90 + (progressPercentage / 100) * 360}
                innerRadius={80}
                outerRadius={95}
                cornerRadius={10}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Time Display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-5xl font-bold text-primary">
              {minutes.toString().padStart(2, '0')}:
              {seconds.toString().padStart(2, '0')}
            </div>
          </div>
        </div>
      )}

      {/* Notes Section - Always visible */}
      <div className="w-full max-w-md border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Session Notes</h3>
        <label htmlFor="timer-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          How are you feeling about this session?
        </label>
        <textarea
          id="timer-notes"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
          placeholder="Take notes on how you're feeling, what's working well, or what you'd like to improve..."
          value={notes}
          onChange={(e) => onNotesChange?.(e.target.value)}
          disabled={isRunning}
        />
        {isRunning && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Pause the timer to edit notes</p>
        )}
        {!isRunning && notes && (
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-blue-700 dark:text-blue-300">
            💡 Notes will be saved when you complete the session
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onStart}
          disabled={isRunning}
          className={`
            px-6 py-2 rounded-lg font-semibold transition-all
            ${
              isRunning
                ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                : 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-2 border-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900'
            }
          `}
        >
          START
        </button>
        <button
          onClick={onStop}
          disabled={!isRunning}
          className={`
            px-6 py-2 rounded-lg font-semibold transition-all
            ${
              !isRunning
                ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                : 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 border-2 border-green-500 hover:bg-green-100 dark:hover:bg-green-900'
            }
          `}
        >
          PAUSE
        </button>
        <button
          onClick={onReset}
          className="px-6 py-2 rounded-lg font-semibold bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600 transition-all"
        >
          RESET
        </button>
      </div>
    </div>
  );
};

// Wrap Timer with error boundary
export const Timer = withErrorBoundary(TimerComponent);

export default Timer;
