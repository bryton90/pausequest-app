import React, { memo, useCallback } from 'react';
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
  // Memoize the button click handlers
  const handleStartClick = useCallback(() => {
    onStart();
  }, [onStart]);
  
  const handleStopClick = useCallback(() => {
    onStop();
  }, [onStop]);
  
  const handleResetClick = useCallback(() => {
    onReset();
  }, [onReset]);

  return (
    <div className={`flex items-center justify-center space-x-4 ${className}`}>
      <button
        onClick={isRunning ? handleStopClick : handleStartClick}
        className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={isRunning ? 'Pause timer' : 'Start timer'}
      >
        {isRunning ? <Pause size={24} /> : <Play size={24} />}
      </button>
      <button
        onClick={handleResetClick}
        className="p-3 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        aria-label="Reset timer"
      >
        <RotateCcw size={24} />
      </button>
    </div>
  );
});

// Memo comparison function to prevent unnecessary re-renders
const areEqual = (prevProps: TimerControllerProps, nextProps: TimerControllerProps) => {
  return (
    prevProps.isRunning === nextProps.isRunning &&
    prevProps.onStart === nextProps.onStart &&
    prevProps.onStop === nextProps.onStop &&
    prevProps.onReset === nextProps.onReset &&
    prevProps.className === nextProps.className
  );
};

TimerController.displayName = 'TimerController';

export default memo(TimerController, areEqual);
