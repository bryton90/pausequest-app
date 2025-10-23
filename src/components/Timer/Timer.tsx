import React from 'react';

interface TimerProps {
  timeLeft: number;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}

export const Timer: React.FC<TimerProps> = ({
  timeLeft,
  isRunning,
  onStart,
  onStop,
  onReset,
}) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercentage = (timeLeft / 1500) * 100;

  return (
    <div className="timer-container">
      <h2>
        {minutes.toString().padStart(2, '0')}:
        {seconds.toString().padStart(2, '0')}
      </h2>
      <div>
        <button onClick={onStart} disabled={isRunning}>
          Start
        </button>
        <button onClick={onStop} disabled={!isRunning}>
          Stop
        </button>
        <button onClick={onReset}>Reset</button>
      </div>
      <div className="progress-bar-container">
        <div
          className="progress-bar"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Timer;
