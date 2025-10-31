import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

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

export const Timer: React.FC<TimerProps> = ({
  timeLeft,
  isRunning,
  onStart,
  onStop,
  onReset,
  totalTime,
  animationType,
}) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercentage = (timeLeft / totalTime) * 100;
  const elapsed = totalTime - timeLeft;

  // Data for circular progress (dual ring visualization would be too complex, using single ring)
  const chartData = [
    { name: 'elapsed', value: elapsed, color: CIRCLE_COLORS.elapsed },
    { name: 'remaining', value: timeLeft, color: CIRCLE_COLORS.focus },
  ];

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Circular Timer */}
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

export default Timer;
