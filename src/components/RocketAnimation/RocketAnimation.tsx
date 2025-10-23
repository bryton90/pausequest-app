import React, { useEffect, useState } from 'react';
import './RocketAnimation.css';

interface RocketAnimationProps {
  percentage: number;
  isRunning: boolean;
}

export const RocketAnimation: React.FC<RocketAnimationProps> = ({ percentage, isRunning }) => {
  const [showLiftoff, setShowLiftoff] = useState(false);

  useEffect(() => {
    if (isRunning && percentage === 100) {
      setShowLiftoff(true);
      setTimeout(() => setShowLiftoff(false), 1000);
    }
  }, [isRunning, percentage]);

  const getFlameIntensity = () => {
    if (!isRunning) return 'none';
    if (percentage > 66) return 'high';
    if (percentage > 33) return 'medium';
    return 'low';
  };

  const rocketPosition = 100 - percentage;

  return (
    <div className="rocket-container">
      <div 
        className={`rocket ${showLiftoff ? 'liftoff' : ''}`}
        style={{ bottom: `${rocketPosition}%` }}
      >
        <div className="rocket-body">
          <div className="rocket-window"></div>
          <div className="rocket-nose"></div>
          <div className="rocket-fin rocket-fin-left"></div>
          <div className="rocket-fin rocket-fin-right"></div>
        </div>
        {isRunning && (
          <div className={`flame flame-${getFlameIntensity()}`}>
            <div className="flame-inner"></div>
          </div>
        )}
      </div>
      <div className="launch-pad"></div>
    </div>
  );
};

export default RocketAnimation;
