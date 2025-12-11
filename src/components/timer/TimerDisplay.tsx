import React, { memo, useMemo } from 'react';

export type TimerVisualization = 'battery' | 'rocket' | 'coffee' | 'circle' | 'bar' | 'digital';

interface TimerDisplayProps {
  remainingMs: number;
  visualization: TimerVisualization;
  className?: string;
}

const formatTime = (ms: number): string => {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const TimerDisplay: React.FC<TimerDisplayProps> = memo(({ 
  remainingMs, 
  visualization,
  className = ''
}) => {
  const timeString = useMemo(() => formatTime(remainingMs), [remainingMs]);
  const progress = useMemo(() => {
    // Assuming max duration is 60 minutes for progress calculation
    const maxMs = 60 * 60 * 1000;
    return Math.min(100, (1 - (remainingMs / maxMs)) * 100);
  }, [remainingMs]);

  const renderVisualization = () => {
    switch (visualization) {
      case 'digital':
        return (
          <div className="text-6xl font-mono font-bold">
            {timeString}
          </div>
        );
      case 'circle':
        return (
          <div className="relative w-64 h-64">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={283 - (progress * 2.83)}
                transform="rotate(-90 50 50)"
                className="transition-all duration-200"
              />
              <text
                x="50"
                y="55"
                textAnchor="middle"
                className="text-2xl font-bold"
              >
                {timeString}
              </text>
            </svg>
          </div>
        );
      // Add other visualization types as needed
      default:
        return (
          <div className="text-6xl font-mono font-bold">
            {timeString}
          </div>
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {renderVisualization()}
    </div>
  );
});

TimerDisplay.displayName = 'TimerDisplay';

export default TimerDisplay;
