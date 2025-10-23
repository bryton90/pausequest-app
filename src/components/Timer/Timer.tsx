import React from 'react';
import { BatteryIndicator } from '../BatteryIndicator/BatteryIndicator';
import { RocketAnimation } from '../RocketAnimation/RocketAnimation';

interface TimerProps {
  timeLeft: number;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  totalTime: number;
  animationType: 'battery' | 'rocket' | 'both';
}

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

  return (
    <div className="timer-container">
      {/* Animation Display */}
      <div className="animation-display">
        {(animationType === 'battery' || animationType === 'both') && (
          <BatteryIndicator percentage={progressPercentage} />
        )}
        {(animationType === 'rocket' || animationType === 'both') && (
          <RocketAnimation percentage={progressPercentage} isRunning={isRunning} />
        )}
      </div>

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
