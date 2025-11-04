import React from 'react';
import { TimerVisualization as TimerVizType } from '../contexts/SettingsContext';

interface TimerVisualizationProps {
  type: TimerVizType;
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
    const percentage = Math.min(100, Math.max(0, progress * 100));
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const baseProps = {
      className: `transition-all duration-300 ${className}`,
      width: size,
      height: size,
      viewBox: `0 0 ${size} ${size}`,
    };

    switch (type) {
      case 'battery':
        return (
          <svg {...baseProps} className={`${baseProps.className} text-green-500`}>
            <circle
              className="text-gray-200 dark:text-gray-700"
              strokeWidth={strokeWidth}
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx={size / 2}
              cy={size / 2}
            />
            <circle
              className="transform -rotate-90 origin-center"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx={size / 2}
              cy={size / 2}
            />
            <text
              x="50%"
              y="50%"
              className="text-4xl font-bold fill-current"
              dominantBaseline="middle"
              textAnchor="middle"
            >
              🔋
            </text>
            <text
              x="50%"
              y="75%"
              className="text-lg font-semibold fill-current"
              dominantBaseline="middle"
              textAnchor="middle"
            >
              {Math.round(percentage)}%
            </text>
          </svg>
        );

      case 'rocket':
        return (
          <svg {...baseProps} className={`${baseProps.className} text-blue-500`}>
            <circle
              className="text-gray-200 dark:text-gray-700"
              strokeWidth={strokeWidth}
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx={size / 2}
              cy={size / 2}
            />
            <circle
              className="transform -rotate-90 origin-center"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx={size / 2}
              cy={size / 2}
            />
            <text
              x="50%"
              y="50%"
              className="text-4xl font-bold fill-current"
              dominantBaseline="middle"
              textAnchor="middle"
            >
              🚀
            </text>
            <text
              x="50%"
              y="75%"
              className="text-lg font-semibold fill-current"
              dominantBaseline="middle"
              textAnchor="middle"
            >
              {Math.round(percentage)}%
            </text>
          </svg>
        );

      case 'coffee':
        return (
          <svg {...baseProps} className={`${baseProps.className} text-amber-600`}>
            <circle
              className="text-gray-200 dark:text-gray-700"
              strokeWidth={strokeWidth}
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx={size / 2}
              cy={size / 2}
            />
            <circle
              className="transform -rotate-90 origin-center"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx={size / 2}
              cy={size / 2}
            />
            <text
              x="50%"
              y="50%"
              className="text-4xl font-bold fill-current"
              dominantBaseline="middle"
              textAnchor="middle"
            >
              ☕
            </text>
            <text
              x="50%"
              y="75%"
              className="text-lg font-semibold fill-current"
              dominantBaseline="middle"
              textAnchor="middle"
            >
              {Math.round(percentage)}%
            </text>
          </svg>
        );

      default:
        return (
          <svg {...baseProps} className={`${baseProps.className} text-purple-500`}>
            <circle
              className="text-gray-200 dark:text-gray-700"
              strokeWidth={strokeWidth}
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx={size / 2}
              cy={size / 2}
            />
            <circle
              className="transform -rotate-90 origin-center"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx={size / 2}
              cy={size / 2}
            />
            <text
              x="50%"
              y="50%"
              className="text-4xl font-bold fill-current"
              dominantBaseline="middle"
              textAnchor="middle"
            >
              ⏱️
            </text>
            <text
              x="50%"
              y="75%"
              className="text-2xl font-bold fill-current"
              dominantBaseline="middle"
              textAnchor="middle"
            >
              {Math.round(percentage)}%
            </text>
          </svg>
        );
    }
  };

  return <div className="flex justify-center">{renderVisualization()}</div>;
};

export default TimerVisualization;
