import React from 'react';
import './BatteryIndicator.css';

interface BatteryIndicatorProps {
  percentage: number;
}

export const BatteryIndicator: React.FC<BatteryIndicatorProps> = ({ percentage }) => {
  const getBatteryColor = () => {
    if (percentage >= 50) return 'green';
    if (percentage >= 25) return 'orange';
    return 'red';
  };

  const shouldPulse = percentage < 25;

  return (
    <div className="battery-container">
      <div className="battery-body">
        <div
          className={`battery-level ${getBatteryColor()} ${shouldPulse ? 'pulse' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="battery-tip" />
      <span className="battery-percentage">{Math.round(percentage)}%</span>
    </div>
  );
};

export default BatteryIndicator;
