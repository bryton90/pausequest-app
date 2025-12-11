import React, { memo } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TimerControllerProps {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  className?: string;
}

const TimerController: React.FC<TimerControllerProps> = memo(({ 
  isRunning, 
  onStart, 
  onStop, 
  onReset,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-center space-x-4 ${className}`}>
      <button
        onClick={isRunning ? onStop : onStart}
        className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        aria-label={isRunning ? 'Pause timer' : 'Start timer'}
      >
        {isRunning ? <Pause size={24} /> : <Play size={24} />}
      </button>
      <button
        onClick={onReset}
        className="p-3 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
        aria-label="Reset timer"
      >
        <RotateCcw size={24} />
      </button>
    </div>
  );
});

TimerController.displayName = 'TimerController';

export default TimerController;
