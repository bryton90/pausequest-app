import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { RocketAnimation } from '../RocketAnimation/RocketAnimation';
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
}

const CIRCLE_COLORS = {
  focus: '#2563eb', // blue
  elapsed: '#f3f4f6', // light gray
  break: '#10b981', // green
};

const TimerComponent: React.FC<TimerProps> = ({
  timeLeft,
  isRunning,
  onStart,
  onStop,
  onReset,
  totalTime,
  animationType,
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
