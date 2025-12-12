import React from 'react';
import { VisualizationType } from '../utils/theme';

interface TimerVisualizationProps {
  type: VisualizationType;
  progress: number; // 0 to 1
  size?: number;
  className?: string;
}

const TimerVisualization: React.FC<TimerVisualizationProps> = ({
  type,
  progress,
  size = 200,
  className = '',
}) => {
  const renderVisualization = () => {
    switch (type) {
      case 'rocket':
        return (
          <div 
            className="relative"
            style={{ width: size, height: size }}
          >
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                <div 
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-gray-300 rounded-t-full"
                  style={{
                    width: size * 0.6,
                    height: size * 0.6 * (1 - progress),
                    bottom: '10%',
                  }}
                />
                <div className="text-6xl">🚀</div>
                <div 
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-orange-500 rounded-full"
                  style={{
                    width: size * 0.3,
                    height: size * 0.1,
                    bottom: '-5%',
                  }}
                />
              </div>
            </div>
          </div>
        );
      case 'coffee':
        return (
          <div 
            className="relative"
            style={{ width: size, height: size }}
          >
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                <div 
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-amber-800 rounded-t-lg"
                  style={{
                    width: size * 0.6,
                    height: size * 0.7 * progress,
                    bottom: '10%',
                  }}
                />
                <div className="text-6xl">☕</div>
              </div>
            </div>
          </div>
        );
      case 'digital':
      default:
        return (
          <div 
            className="flex items-center justify-center text-4xl font-mono"
            style={{ width: size, height: size }}
          >
            {Math.round(progress * 100)}%
          </div>
        );
    }
  };

  return <div className={className}>{renderVisualization()}</div>;
};

export default TimerVisualization;
